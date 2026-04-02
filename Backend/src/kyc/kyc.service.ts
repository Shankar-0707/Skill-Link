import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DocumentType, KycStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { KycRequestStatus } from './kyc-request-status';
import { CloudinaryService } from '../storage/cloudinary.service';
import {
  KYC_ALLOWED_MIMES,
  KYC_UPLOAD_MAX_BYTES,
  REQUIRED_KYC_DOCUMENT_TYPES,
} from './kyc.constants';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  private async getWorkerForUser(userId: string) {
    const worker = await this.prisma.worker.findUnique({
      where: { userId },
      select: {
        id: true,
        kycStatus: true,
      },
    });
    if (!worker) {
      throw new ForbiddenException({
        message: 'Worker profile required',
        code: 'WORKER_PROFILE_REQUIRED',
      });
    }
    return worker;
  }

  /**
   * Upload or replace a draft document (same documentType) for the next submission.
   */
  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
    documentType: DocumentType,
  ) {
    const worker = await this.getWorkerForUser(userId);

    if (worker.kycStatus === KycStatus.PENDING) {
      throw new BadRequestException({
        message: 'Cannot upload documents while KYC is under review',
        code: 'KYC_UPLOAD_BLOCKED_PENDING',
      });
    }
    if (worker.kycStatus === KycStatus.VERIFIED) {
      throw new BadRequestException({
        message:
          'KYC is already verified. Contact support to update documents.',
        code: 'KYC_UPLOAD_BLOCKED_VERIFIED',
      });
    }

    if (!file?.buffer?.length) {
      throw new BadRequestException({
        message: 'File is required',
        code: 'KYC_FILE_REQUIRED',
      });
    }
    if (file.size > KYC_UPLOAD_MAX_BYTES) {
      throw new BadRequestException({
        message: `File too large (max ${KYC_UPLOAD_MAX_BYTES} bytes)`,
        code: 'KYC_FILE_TOO_LARGE',
      });
    }
    const mime = file.mimetype?.toLowerCase() ?? '';
    if (!KYC_ALLOWED_MIMES.has(mime)) {
      throw new BadRequestException({
        message: 'Unsupported file type. Use PDF, JPEG, PNG, or WebP.',
        code: 'KYC_FILE_TYPE',
      });
    }

    const { secureUrl } = await this.cloudinary.uploadKycDocument(file.buffer);

    const existingDraft = await this.prisma.workerDocument.findFirst({
      where: {
        workerId: worker.id,
        documentType,
        kycRequestId: null,
      } as Prisma.WorkerDocumentWhereInput,
      orderBy: { updatedAt: 'desc' },
    });

    if (existingDraft) {
      return this.prisma.workerDocument.update({
        where: { id: existingDraft.id },
        data: {
          documentUrl: secureUrl,
          status: 'PENDING',
        },
        select: {
          id: true,
          documentType: true,
          documentUrl: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    return this.prisma.workerDocument.create({
      data: {
        workerId: worker.id,
        documentType,
        documentUrl: secureUrl,
        status: 'PENDING',
        kycRequestId: null,
      } as Prisma.WorkerDocumentUncheckedCreateInput,
      select: {
        id: true,
        documentType: true,
        documentUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Locks draft documents into a new pending KYC request.
   */
  async submitKyc(userId: string) {
    const worker = await this.getWorkerForUser(userId);

    if (worker.kycStatus === KycStatus.PENDING) {
      throw new ConflictException({
        message: 'A KYC submission is already pending review',
        code: 'KYC_ALREADY_PENDING',
      });
    }
    if (worker.kycStatus === KycStatus.VERIFIED) {
      throw new BadRequestException({
        message: 'KYC is already verified',
        code: 'KYC_ALREADY_VERIFIED',
      });
    }

    const drafts = await this.prisma.workerDocument.findMany({
      where: {
        workerId: worker.id,
        kycRequestId: null,
      } as Prisma.WorkerDocumentWhereInput,
    });

    const byType = new Map<DocumentType, (typeof drafts)[0]>();
    for (const d of drafts) {
      const prev = byType.get(d.documentType);
      if (!prev || d.updatedAt > prev.updatedAt) byType.set(d.documentType, d);
    }

    const missing = REQUIRED_KYC_DOCUMENT_TYPES.filter((t) => !byType.has(t));
    if (missing.length > 0) {
      throw new BadRequestException({
        message: 'Required documents are missing',
        code: 'KYC_INCOMPLETE_DOCUMENTS',
        missingDocumentTypes: missing,
      });
    }

    const documentIds = drafts.map((d) => d.id);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const pending = await tx.kycRequest.findFirst({
          where: {
            workerId: worker.id,
            status: KycRequestStatus.PENDING,
          },
          select: { id: true },
        });
        if (pending) {
          throw new ConflictException({
            message: 'A KYC submission is already pending review',
            code: 'KYC_ALREADY_PENDING',
          });
        }

        const req = await tx.kycRequest.create({
          data: {
            workerId: worker.id,
            provider: 'INTERNAL',
            status: KycRequestStatus.PENDING,
            submittedAt: new Date(),
          },
          select: {
            id: true,
            status: true,
            submittedAt: true,
          },
        });

        await tx.workerDocument.updateMany({
          where: {
            id: { in: documentIds },
            workerId: worker.id,
            kycRequestId: null,
          } as Prisma.WorkerDocumentWhereInput,
          data: {
            kycRequestId: req.id,
          } as Prisma.WorkerDocumentUpdateManyMutationInput,
        });

        await tx.worker.update({
          where: { id: worker.id },
          data: { kycStatus: KycStatus.PENDING },
        });

        return req;
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ConflictException({
          message: 'A KYC submission is already pending review',
          code: 'KYC_ALREADY_PENDING',
        });
      }
      throw e;
    }
  }

  async getStatus(userId: string) {
    const worker = await this.getWorkerForUser(userId);

    const [pendingRequest, lastRequest, draftCount] = await Promise.all([
      this.prisma.kycRequest.findFirst({
        where: { workerId: worker.id, status: KycRequestStatus.PENDING },
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          status: true,
          submittedAt: true,
          verifiedAt: true,
          rejectionReason: true,
          reviewedAt: true,
        } as Prisma.KycRequestSelect,
      }),
      this.prisma.kycRequest.findFirst({
        where: { workerId: worker.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          submittedAt: true,
          verifiedAt: true,
          rejectionReason: true,
          reviewedAt: true,
        } as Prisma.KycRequestSelect,
      }),
      this.prisma.workerDocument.count({
        where: {
          workerId: worker.id,
          kycRequestId: null,
        } as Prisma.WorkerDocumentWhereInput,
      }),
    ]);

    const drafts = await this.prisma.workerDocument.findMany({
      where: {
        workerId: worker.id,
        kycRequestId: null,
      } as Prisma.WorkerDocumentWhereInput,
      select: {
        id: true,
        documentType: true,
        documentUrl: true,
        status: true,
        updatedAt: true,
      },
      orderBy: { documentType: 'asc' },
    });

    const requiredPresent = REQUIRED_KYC_DOCUMENT_TYPES.every((t) =>
      drafts.some((d) => d.documentType === t),
    );

    return {
      kycStatus: worker.kycStatus,
      pendingRequest: pendingRequest ?? null,
      lastRequest: lastRequest ?? null,
      draftDocuments: drafts,
      draftCount,
      requiredDocumentTypes: REQUIRED_KYC_DOCUMENT_TYPES,
      canSubmit:
        (worker.kycStatus === KycStatus.NOT_STARTED ||
          worker.kycStatus === KycStatus.REJECTED) &&
        !pendingRequest &&
        requiredPresent,
    };
  }
}
