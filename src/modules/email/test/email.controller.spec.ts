import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from '../email.controller';
import { EmailService } from '../email.service';
import { SendEmail } from '@/common/dto/Smtp/send-email.dto';

describe('EmailController', () => {
  let controller: EmailController;
  let emailService: EmailService;

  const mockEmailService = {
    sendEmail: jest.fn(),
  };

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
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    controller = module.get<EmailController>(EmailController);
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should queue an email and return a successful response', async () => {
      // Mock the job ID returned by the service
      const jobId = 'mock-job-id-123';
      mockEmailService.sendEmail.mockResolvedValueOnce(jobId);

      // Call the controller method
      const result = await controller.sendEmail(mockSendEmailDto);

      // Verify the service was called with the correct params
      expect(emailService.sendEmail).toHaveBeenCalledWith(mockSendEmailDto);

      // Verify the response structure
      expect(result).toEqual({
        success: true,
        message: '✉️ Email queued successfully',
        data: {
          jobId: jobId,
          status: '🚀 Processing',
        },
        info: expect.objectContaining({
          note: '⏱️ Your email is being processed and will be sent shortly',
        }),
      });
    });

    it('should propagate errors from the service', async () => {
      // Mock the service to throw an error
      const errorMessage = 'Queue error';
      mockEmailService.sendEmail.mockRejectedValueOnce(new Error(errorMessage));

      // Attempt to call the controller method and expect an error
      await expect(controller.sendEmail(mockSendEmailDto)).rejects.toThrow(
        errorMessage,
      );
    });
  });
});
