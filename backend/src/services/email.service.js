import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Create transporter (works with Gmail, SendGrid, AWS SES, etc)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

/**
 * Send digest email with beautiful HTML
 */
export async function sendDigestEmail(email, digest, audioUrl) {
  const html = generateEmailHTML(digest.title, digest.transcript, audioUrl)

  const info = await transporter.sendMail({
    from: `"SoundByte 🎧" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `🎙️ ${digest.title} - Your Audio Digest is Ready!`,
    html
  })

  console.log(`📧 Email sent to ${email}: ${info.messageId}`)
  return info
}

/**
 * Generate beautiful HTML email
 */
function generateEmailHTML(title, transcript, audioUrl) {
  // Extract first paragraph for preview
  const preview = transcript.split('\n')[2]?.slice(0, 150) || ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
  
  <!-- Container -->
  <div style="max-width: 600px; margin: 40px auto; padding: 0 20px;">
    
    <!-- Header -->
    <div style="background: white; border-radius: 20px 20px 0 0; padding: 40px 30px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
      <h1 style="margin: 0; color: #1a202c; font-size: 32px; font-weight: 800;">
        🎧 SoundByte
      </h1>
      <p style="margin: 10px 0 0; color: #718096; font-size: 14px;">
        Your personalized audio digest
      </p>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
      
      <!-- Title -->
      <h2 style="margin: 0 0 20px; color: #2d3748; font-size: 24px; font-weight: 700;">
        ${title}
      </h2>
      
      <!-- Preview -->
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
        ${preview}...
      </p>
      
      <!-- Play Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${audioUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
          ▶️ Download Audio Digest
        </a>
      </div>
      
      <!-- Embedded Audio Player -->
      <div style="margin: 20px 0; padding: 20px; background: #f7fafc; border-radius: 10px;">
        <p style="color: #4a5568; font-size: 14px; margin-bottom: 10px;">Or listen directly:</p>
        <audio controls style="width: 100%;">
          <source src="${audioUrl}" type="audio/wav">
          <source src="${audioUrl}" type="audio/mpeg">
          <a href="${audioUrl}">Download audio</a>
        </audio>
      </div>
      
      <!-- Divider -->
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
      
      <!-- Footer Links -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
        <a href="${process.env.CLIENT_URL}/dashboard" 
           style="color: #667eea; text-decoration: none; font-size: 14px; margin: 0 10px;">
          Manage Subscriptions
        </a>
        <span style="color: #cbd5e0;">•</span>
        <a href="${process.env.CLIENT_URL}/dashboard" 
           style="color: #a0aec0; text-decoration: none; font-size: 14px; margin: 0 10px;">
          Unsubscribe
        </a>
      </div>
      
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 20px; color: white; font-size: 12px;">
      <p style="margin: 5px 0; opacity: 0.9;">
        © 2025 SoundByte. Made with ❤️ for busy listeners.
      </p>
    </div>
    
  </div>
</body>
</html>`
}