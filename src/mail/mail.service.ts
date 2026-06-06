import { BadRequestException, Injectable } from '@nestjs/common';
import { MailerService } from 'node_modules/@nestjs-modules/mailer/dist/mailer.service';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Send a simple email
   * @param to - Recipient's email address
   * @param subject - Email subject
   * @param html - Email content in HTML format
   */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        from: `<noreply@${process.env.SMTP_HOST}>`, // Sender address
        subject,
        html,
      });
      console.log(`✅ Email sent successfully to ${to}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      throw new BadRequestException('Failed to send email');
    }
  }
}
