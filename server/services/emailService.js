import nodemailer from 'nodemailer'

class EmailService {
  constructor() {
    this.transporter = null
    this.service = process.env.EMAIL_SERVICE || 'mock'
    this.initialized = false
    this.initPromise = this.initializeTransporter()
  }

  async initializeTransporter() {
    try {
      switch (this.service) {
        case 'gmail':
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          })
          break

        case 'sendgrid':
          const sgMail = await import('@sendgrid/mail')
          sgMail.default.setApiKey(process.env.SENDGRID_API_KEY)
          this.sendgridClient = sgMail.default
          break

        case 'aws-ses':
          const { SESClient } = await import('@aws-sdk/client-ses')
          this.sesClient = new SESClient({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
          })
          break

        case 'smtp':
          this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          })
          break

        default:
          console.log('Using mock email service')
      }
      this.initialized = true
      console.log(`Email service initialized: ${this.service}`)
    } catch (error) {
      console.error('Failed to initialize email service:', error)
      this.service = 'mock'
      this.initialized = true
    }
  }

  async sendOTP(email, otp) {
    try {
      // Wait for initialization to complete
      await this.initPromise
      
      const subject = 'Your OTP Code - Classroom Portal'
      const htmlContent = this.generateOTPEmailHTML(otp)
      const textContent = this.generateOTPEmailText(otp)

      switch (this.service) {
        case 'gmail':
        case 'smtp':
          return await this.sendWithNodemailer(email, subject, textContent, htmlContent)

        case 'sendgrid':
          return await this.sendWithSendGrid(email, subject, textContent, htmlContent)

        case 'aws-ses':
          return await this.sendWithAWSSES(email, subject, textContent, htmlContent)

        default:
          return { success: false, message: 'Email service not configured' }
      }
    } catch (error) {
      console.error('Error sending OTP email:', error)
      return { success: false, message: 'Failed to send OTP email' }
    }
  }

  async sendEmail(email, subject, htmlContent, textContent = null) {
    try {
      // Wait for initialization to complete
      await this.initPromise
      
      // If no text content provided, strip HTML tags for text version
      const text = textContent || htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

      switch (this.service) {
        case 'gmail':
        case 'smtp':
          return await this.sendWithNodemailer(email, subject, text, htmlContent)

        case 'sendgrid':
          return await this.sendWithSendGrid(email, subject, text, htmlContent)

        case 'aws-ses':
          return await this.sendWithAWSSES(email, subject, text, htmlContent)

        default:
          return { success: false, message: 'Email service not configured' }
      }
    } catch (error) {
      console.error('Error sending email:', error)
      return { success: false, message: 'Failed to send email' }
    }
  }

  async sendWithNodemailer(to, subject, text, html) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
      })

      console.log('Email sent via Nodemailer:', info.messageId)
      return { success: true, message: 'OTP sent successfully' }
    } catch (error) {
      console.error('Nodemailer error:', error)
      return { success: false, message: 'Failed to send email via Nodemailer' }
    }
  }

  async sendWithSendGrid(to, subject, text, html) {
    try {
      const msg = {
        to,
        from: process.env.EMAIL_FROM,
        subject,
        text,
        html
      }

      await this.sendgridClient.send(msg)
      console.log('Email sent via SendGrid')
      return { success: true, message: 'OTP sent successfully' }
    } catch (error) {
      console.error('SendGrid error:', error)
      return { success: false, message: 'Failed to send email via SendGrid' }
    }
  }

  async sendWithAWSSES(to, subject, text, html) {
    try {
      const { SendEmailCommand } = await import('@aws-sdk/client-ses')
      
      const command = new SendEmailCommand({
        Source: process.env.EMAIL_FROM,
        Destination: {
          ToAddresses: [to]
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8'
          },
          Body: {
            Text: {
              Data: text,
              Charset: 'UTF-8'
            },
            Html: {
              Data: html,
              Charset: 'UTF-8'
            }
          }
        }
      })

      await this.sesClient.send(command)
      console.log('Email sent via AWS SES')
      return { success: true, message: 'OTP sent successfully' }
    } catch (error) {
      console.error('AWS SES error:', error)
      return { success: false, message: 'Failed to send email via AWS SES' }
    }
  }

  generateOTPEmailHTML(otp) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-code { background: #fff; border: 2px solid #4f46e5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-number { font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 4px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Classroom Portal</h1>
            <p>Email Verification</p>
          </div>
          <div class="content">
            <h2>Your OTP Code</h2>
            <p>Hello! You requested to register for Classroom Portal. Please use the following OTP code to complete your registration:</p>
            
            <div class="otp-code">
              <div class="otp-number">${otp}</div>
            </div>
            
            <div class="warning">
              <strong>Important:</strong>
              <ul>
                <li>This code will expire in 10 minutes</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this code, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>© 2024 Classroom Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  generateOTPEmailText(otp) {
    return `
Classroom Portal - Email Verification

Your OTP Code: ${otp}

Please use this code to complete your registration. This code will expire in 10 minutes.

Important:
- Do not share this code with anyone
- If you didn't request this code, please ignore this email

© 2024 Classroom Portal. All rights reserved.
    `.trim()
  }
}

export default new EmailService()