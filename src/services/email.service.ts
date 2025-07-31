import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { logger } from '../config/logger';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"LegaC" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Email sending failed');
    }
  }

  async sendWelcomeEmail(to: string, username: string): Promise<void> {
    const subject = 'Welcome to LegaC!';
    const text = `Hello ${username},\n\nThank you for registering with LegaC! We're excited to have you on board.\n\nBest regards,\nThe LegaC Team`;
    const html = `
      <h1>Welcome to LegaC!</h1>
      <p>Hello ${username},</p>
      <p>Thank you for registering with LegaC! We're excited to have you on board.</p>
      <p>Best regards,<br>The LegaC Team</p>
    `;
    await this.sendEmail({ to, subject, text, html });
  }

  async sendVerificationEmail(email: string, fullname: string, code: string): Promise<void> {
    const subject = 'Welcome to LegaC!';
    const text = `Hello ${fullname},\n\nThank you for registering with LegaC! We're excited to have you on board.\n\nBest regards,\nThe LegaC Team`;
    const html = `
      <h1>Welcome to LegaC!</h1>
      <p>Hello ${fullname},</p>
      <p>Thank you for registering with LegaC! We're excited to have you on board.</p>
      <p>Your Verification code to complete registration with us ${code}</p>
      <p>Best regards,<br>The LegaC Team</p>
    `;

    try {
      await this.sendEmail({to: email, subject, text, html});
      logger.info(`Verification email sent to ${email} for user ID ${fullname}`);
    } catch (error: any) {
      logger.error(`Failed to send verification email to ${email}: ${error.message}`);
      throw error;
    }
  }

  async sendCapsuleClaimEmail(email: string, fullname: string, password: string): Promise<void> {
    const subject = 'Notification For Asset Claim!';
    const text = `Hello ${fullname},\n\nYou are receiving this mail to retrieve an asset locked by your parent or kin stored with us.\n\n`;
    const html = `
      <h1>Welcome to LegaC!</h1>
      <p>Hello ${fullname},</p>
      <p>Use the following credentials to claim your asset on LegaC Mobile App.</p>
      <p>Email: ${email}</p>
      <p>Password: ${password}</p>
      <p>Best regards,<br>The LegaC Team</p>
    `;

    try {
      await this.sendEmail({to: email, subject, text, html});
      logger.info(`Capsule Retrieval email sent to ${email}`);
    } catch (error: any) {
      logger.error(`Failed to send verification email to ${email}: ${error.message}`);
      throw error;
    }
  }
}