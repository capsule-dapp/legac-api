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
    const template = `
      <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Legac</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
            <tr>
              <td style="background-color: #2c3e50; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to Legac</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                <h2 style="color: #333333; font-size: 20px; margin-top: 0;">Hello ${username},</h2>
                <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                  We're thrilled to have you join the <strong>Legac</strong> community! Your account has been successfully created.
                </p>
                <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                  You can now log in and begin exploring how Legac helps you preserve and share meaningful moments.
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
                  <tr>
                    <td style="text-align: center;">
                      <a href="legacapp://login" style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: #ffffff; text-decoration: none; font-size: 16px; border-radius: 5px;">Open Legac App</a>
                    </td>
                  </tr>
                </table>
                <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                  If you have any questions or need help, feel free to reach out at <a href="mailto:support@legac.app" style="color: #3498db; text-decoration: none;">support@legac.app</a>.
                </p>
                <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                  Best regards,<br>
                  The Legac Team
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px; color: #777777;">
                <p style="margin: 0;">&copy; 2025 Legac. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
    `;
    await this.sendEmail({ to, subject, text: '', html: template });
  }

  async sendVerificationEmail(email: string, fullname: string, code: string): Promise<void> {
    const subject = 'Email Verification - Legac!';
    const template = `
      <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification - Legac</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
            <tr>
              <td style="background-color: #2c3e50; padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to Legac</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px;">
                <h2 style="color: #333333; font-size: 20px; margin-top: 0;">Hello ${fullname},</h2>
                <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                  Thank you for registering with <strong>Legac</strong>! We're excited to have you on board.
                </p>
                <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                  Your verification code is:
                </p>
                <p style="color: #2c3e50; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
                  ${code}
                </p>
                <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                  Please enter this code in the app to complete your registration. The code is valid for a limited time.
                </p>
                <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                  Best regards,<br>
                  The Legac Team
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px; color: #777777;">
                <p style="margin: 0;">&copy; 2025 Legac. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
    `;

    try {
      await this.sendEmail({to: email, subject, text: '', html: template});
      logger.info(`Verification email sent to ${email} for user ID ${fullname}`);
    } catch (error: any) {
      logger.error(`Failed to send verification email to ${email}: ${error.message}`);
      throw error;
    }
  }

  async sendCapsuleClaimEmail(beneficiaryEmail: string, beneficiaryName: string, temporaryPassword: string, capsule_address: string): Promise<void> {
    const subject = 'Notification For Asset Claim!';
    const template = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Capsule Beneficiary Notification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0;">
          <tr>
            <td style="background-color: #2c3e50; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Legac Capsule Notification</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h2 style="color: #333333; font-size: 20px; margin-top: 0;">Dear ${beneficiaryName},</h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                You have been designated as a beneficiary of a capsule in the Legac platform. To access the details of your capsule, please log in to the Legac mobile app using the temporary credentials provided below.
              </p>
              <h3 style="color: #333333; font-size: 18px; margin-bottom: 10px;">Your Temporary Login Credentials</h3>
              <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                <strong>Email:</strong> ${beneficiaryEmail}<br>
                <strong>Temporary Password:</strong> ${temporaryPassword}<br>
                <strong>Capsule Address:</strong> ${capsule_address} (provide capsule address when loggin in)
              </p>
              <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                For security, this temporary password will expire in 2 hours. Please log in and set a new password as soon as possible.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="legacapp://login" style="display: inline-block; padding: 12px 24px; background-color: #3498db; color: #ffffff; text-decoration: none; font-size: 16px; border-radius: 5px;">Log In to Legac App</a>
                  </td>
                </tr>
              </table>
              <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                If you haven't installed the Legac app, please download it from the appropriate store below:
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding-right: 10px;">
                    <a href="https://play.google.com/store/apps/details?id=com.legac.app" style="text-decoration: none;">
                      <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Download on Google Play" style="width: 135px; height: auto;">
                    </a>
                  </td>
                  <td>
                    <a href="https://apps.apple.com/app/legac/id1234567890" style="text-decoration: none;">
                      <img src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" alt="Download on the App Store" style="width: 135px; height: auto;">
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                If you have any questions or need assistance, please contact our support team at <a href="mailto:support@legac.app" style="color: #3498db; text-decoration: none;">support@legac.app</a>.
              </p>
              <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                Best regards,<br>
                The Legac Team
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 14px; color: #777777;">
              <p style="margin: 0;">
                &copy; 2025 Legac. All rights reserved.<br>
                <a href="https://api.legac.app/unsubscribe?email=${encodeURIComponent(beneficiaryEmail)}" style="color: #3498db; text-decoration: none;">Unsubscribe</a> | <a href="https://legac.app/privacy" style="color: #3498db; text-decoration: none;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>null
      </body>
      </html>
    `

    try {
      await this.sendEmail({to: beneficiaryEmail, subject, text: '', html: template});
      logger.info(`Capsule Retrieval email sent to ${beneficiaryEmail}`);
    } catch (error: any) {
      logger.error(`Failed to send verification email to ${beneficiaryEmail}: ${error.message}`);
      throw error;
    }
  }
}