import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

describe('JobsController', () => {
  let controller: JobsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        {
          provide: JobsService,
          useValue: {
            getAvailableJobs: jest.fn(),
            getAvailableJobsByCategory: jest.fn(),
            getMyAssignments: jest.fn(),
            createJob: jest.fn(),
            getMyJobs: jest.fn(),
            getJobById: jest.fn(),
            updateJob: jest.fn(),
            cancelJob: jest.fn(),
            assignWorker: jest.fn(),
            startJob: jest.fn(),
            completeJob: jest.fn(),
            confirmJobCompletion: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
