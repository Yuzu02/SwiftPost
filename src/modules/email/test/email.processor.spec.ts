import { Test, TestingModule } from '@nestjs/testing';
import { EmailProcessor } from '../email.processor';
import { Job } from 'bull';
import { SendEmail } from '@/common/dto/Smtp/send-email.dto';
import * as sanitizeHtml from 'sanitize-html';
import * as nodemailerConfig from '@/config/nodemailer';

// Mock the external modules
jest.mock('sanitize-html');
jest.mock('@/config/nodemailer');

describe('EmailProcessor', () => {
  let processor: EmailProcessor;

  // Mock job data
  const mockSendEmailData: SendEmail = {
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

  // Mock Bull job
  const createMockJob = (
    data = mockSendEmailData,
  ): Partial<Job<SendEmail>> => ({
    data,
    log: jest.fn(),
  });

  // Mock nodemailer transporter
  const mockTransporter = {
    sendMail: jest.fn().mockImplementation(() => Promise.resolve(true)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Setup sanitizeHtml mock
    (sanitizeHtml as unknown as jest.Mock).mockImplementation((html) =>
      html ? '<p>Sanitized content</p>' : null,
    );

    // Setup nodemailer mock
    (nodemailerConfig.createTransporter as jest.Mock).mockReturnValue(
      mockTransporter,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailProcessor],
    }).compile();

    processor = module.get<EmailProcessor>(EmailProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should successfully process and send an email', async () => {
      const job = createMockJob();

      await processor.sendEmail(job as Job<SendEmail>);

      // Verify sanitization was called
      expect(sanitizeHtml).toHaveBeenCalledWith(
        mockSendEmailData.mailOptions.html,
      );

      // Verify transporter was created with correct config
      expect(nodemailerConfig.createTransporter).toHaveBeenCalledWith(
        mockSendEmailData.smtpConfig,
      );

      // Verify email was sent with sanitized content
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        ...mockSendEmailData.mailOptions,
        html: '<p>Sanitized content</p>',
      });
    });

    it('should throw an error if HTML sanitization fails', async () => {
      // Mock sanitizeHtml to return null (failure case)
      (sanitizeHtml as unknown as jest.Mock).mockReturnValueOnce(null);

      const job = createMockJob();

      // Expect the processor to throw an error
      await expect(processor.sendEmail(job as Job<SendEmail>)).rejects.toThrow(
        'HTML sanitization failed',
      );

      // Verify job logging occurred
      expect(job.log).toHaveBeenCalled();

      // Verify email was not sent
      expect(mockTransporter.sendMail).not.toHaveBeenCalled();
    });

    it('should throw an error if sending email fails', async () => {
      // Mock sendMail to throw an error
      const errorMessage = 'SMTP connection failed';
      mockTransporter.sendMail.mockRejectedValueOnce(new Error(errorMessage));

      const job = createMockJob();

      // Expect the processor to throw an error
      await expect(processor.sendEmail(job as Job<SendEmail>)).rejects.toThrow(
        'Email sending failed',
      );

      // Verify job logging occurred
      expect(job.log).toHaveBeenCalled();
    });
  });
});
