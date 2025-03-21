import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email.service';
import { getQueueToken } from '@nestjs/bull';
import { SendEmail } from '@/common/dto/Smtp/send-email.dto';

describe('EmailService', () => {
  let service: EmailService;
  let mockQueue: any;

  const mockSendEmailDto: SendEmail = {
    mailOptions: {
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      html: '<p>Test content</p>',
    },
    smtpConfig: {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'username',
        pass: 'password',
      },
    },
  };

  beforeEach(async () => {
    // Create mock job and queue
    const mockJob = {
      id: 'test-job-id',
      attemptsMade: 0,
    };

    mockQueue = {
      add: jest.fn().mockResolvedValue(mockJob),
      on: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: getQueueToken('email-queue'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should add a job to the queue with correct parameters', async () => {
      // Call the service method
      const jobId = await service.sendEmail(mockSendEmailDto);

      // Verify the job was added to the queue with correct parameters
      expect(mockQueue.add).toHaveBeenCalledWith(
        'send-email',
        {
          smtpConfig: mockSendEmailDto.smtpConfig,
          mailOptions: mockSendEmailDto.mailOptions,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        },
      );

      // Verify event listeners were set up
      expect(mockQueue.on).toHaveBeenCalledWith(
        'completed',
        expect.any(Function),
      );
      expect(mockQueue.on).toHaveBeenCalledWith('failed', expect.any(Function));

      // Verify the job ID is returned
      expect(jobId).toBe('test-job-id');
    });

    it('should throw an error if adding to the queue fails', async () => {
      // Mock the queue to throw an error
      const errorMessage = 'Queue error';
      mockQueue.add.mockRejectedValueOnce(new Error(errorMessage));

      // Attempt to call the service method and expect an error
      await expect(service.sendEmail(mockSendEmailDto)).rejects.toThrow(
        'Email queue addition failed',
      );
    });
  });
});
