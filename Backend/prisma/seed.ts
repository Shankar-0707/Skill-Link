/* eslint-disable prettier/prettier */
import 'dotenv/config'
import { randomBytes, scryptSync } from 'crypto'
import { PrismaClient, Role, KycStatus, JobStatus, ReservationStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

/** Matches AuthService.hashPassword — login works with seeded users. */
function hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex')
    const derivedKey = scryptSync(password, salt, 64).toString('hex')
    return `${salt}:${derivedKey}`
}

const connectionString = process.env.DATABASE ?? process.env.DATABASE_URL
if (!connectionString) {
    throw new Error('Set DATABASE or DATABASE_URL in .env (same connection string as the app).')
}

const adapter = new PrismaPg({
    connectionString,
})

const prisma = new PrismaClient({ adapter })

async function upsertUser(params: {
    email: string
    phone: string
    passwordHash: string
    role: Role
    customer?: Record<string, never>
    worker?: {
        bio?: string
        experience?: number
        skills: string[]
        serviceRadius?: number
        kycStatus?: KycStatus
    }
    organisation?: {
        businessName: string
        businessType: string
        description?: string
    }
}) {
    const { customer, worker, organisation, email, phone, passwordHash, role } = params

    return prisma.user.upsert({
        where: { email },
        update: {
            phone,
            passwordHash,
            role,
        },
        create: {
            email,
            phone,
            passwordHash,
            role,
            ...(customer ? { customer: { create: customer } } : {}),
            ...(worker ? { worker: { create: worker } } : {}),
            ...(organisation ? { organisation: { create: organisation } } : {}),
        },
        include: {
            customer: true,
            worker: true,
            organisation: true,
        },
    })
}

async function main() {
    console.log('Starting database seed...')

    const adminPass = hashPassword('admin123')
    const testPass = hashPassword('test123')

    await upsertUser({
        email: 'admin@skilllink.com',
        phone: '9000000000',
        passwordHash: adminPass,
        role: Role.ADMIN,
    })

    const customerUser1 = await upsertUser({
        email: 'customer1@test.com',
        phone: '9000000001',
        passwordHash: testPass,
        role: Role.CUSTOMER,
        customer: {},
    })

    const customerUser2 = await upsertUser({
        email: 'customer2@test.com',
        phone: '9000000002',
        passwordHash: testPass,
        role: Role.CUSTOMER,
        customer: {},
    })

    const workerUser1 = await upsertUser({
        email: 'worker1@test.com',
        phone: '9000000003',
        passwordHash: testPass,
        role: Role.WORKER,
        worker: {
            bio: 'Electrician with 5 years experience',
            experience: 5,
            skills: ['electrician', 'wiring'],
            serviceRadius: 10,
            kycStatus: KycStatus.VERIFIED,
        },
    })

    const workerUser2 = await upsertUser({
        email: 'worker2@test.com',
        phone: '9000000004',
        passwordHash: testPass,
        role: Role.WORKER,
        worker: {
            bio: 'Professional plumber',
            experience: 4,
            skills: ['plumbing', 'pipe repair'],
            serviceRadius: 8,
            kycStatus: KycStatus.VERIFIED,
        },
    }) 

    const orgUser1 = await upsertUser({
        email: 'org1@test.com',
        phone: '9000000005',
        passwordHash: testPass,
        role: Role.ORGANISATION,
        organisation: {
            businessName: 'GreenBuild Materials',
            businessType: 'Construction Supplies',
            description: 'Eco friendly building materials',
        },
    })

    const orgUser2 = await upsertUser({
        email: 'org2@test.com',
        phone: '9000000006',
        passwordHash: testPass,
        role: Role.ORGANISATION,
        organisation: {
            businessName: 'Urban Tools Hub',
            businessType: 'Hardware Store',
            description: 'Professional tools and equipment',
        },
    })

    const product1 = await prisma.product.create({
        data: {
            organisationId: orgUser1.organisation!.id,
            name: 'Eco Bricks Pack',
            description: 'Recycled construction bricks',
            price: 500,
            stockQuantity: 50,
        },
    })

    await prisma.product.create({
        data: {
            organisationId: orgUser1.organisation!.id,
            name: 'Bamboo Panels',
            description: 'Sustainable bamboo wall panels',
            price: 1200,
            stockQuantity: 20,
        },
    })

    await prisma.product.create({
        data: {
            organisationId: orgUser2.organisation!.id,
            name: 'Electric Drill',
            description: 'Professional drill machine',
            price: 3500,
            stockQuantity: 15,
        },
    })

    await prisma.product.create({
        data: {
            organisationId: orgUser2.organisation!.id,
            name: 'Plumbing Toolkit',
            description: 'Complete plumber kit',
            price: 2200,
            stockQuantity: 25,
        },
    })

    const job = await prisma.job.create({
        data: {
            customerId: customerUser1.customer!.id,
            workerId: workerUser1.worker!.id,
            title: 'Fix electrical wiring',
            description: 'Need electrician for house wiring repair',
            category: 'Electrical',
            budget: 1500,
            status: JobStatus.ASSIGNED,
        },
    })

    await prisma.escrow.create({
        data: {
            jobId: job.id,
            amount: 1500,
        },
    })

    const reservation = await prisma.reservation.create({
        data: {
            productId: product1.id,
            customerId: customerUser2.customer!.id,
            quantity: 2,
            status: ReservationStatus.CONFIRMED,
        },
    })

    await prisma.escrow.create({
        data: {
            reservationId: reservation.id,
            amount: 1000,
        },
    })

    console.log('Database seeded successfully')
}

main()
    .catch((e) => {
        console.error('Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
