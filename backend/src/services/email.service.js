import { Resend } from 'resend'
import dotenv from 'dotenv'

dotenv.config()

// Resend client (HTTP API - no SMTP ports)
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Send digest email with beautiful HTML
 */
export async function sendDigestEmail(email, digest, audioUrl) {
  const html = generateEmailHTML(digest.title, digest.transcript, audioUrl)

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: [email],
    subject: `🎙️ ${digest.title} - Your Audio Digest is Ready!`,
    html
  })

  if (error) {
    try {
      console.error('Resend send error:', typeof error === 'string' ? error : JSON.stringify(error))
    } catch (_) {
      console.error('Resend send error (non-serializable):', error)
    }
    const message = (error && typeof error === 'object' && (error.message || error.name))
      ? `${error.name || 'Error'}: ${error.message}`
      : (typeof error === 'string' ? error : 'Resend email error')
    throw new Error(message)
  }

  console.log(`📧 Email sent to ${email}: ${data?.id}`)
  return data
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
<body style="margin:0; padding:0; background:#0b0b10; -webkit-font-smoothing:antialiased;">
  <div style="display:none; font-size:1px; color:#0b0b10; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">Your AI audio digest is ready</div>
  <div style="width:100%; padding:24px 12px; box-sizing:border-box;">
    <div style="max-width:640px; margin:0 auto; background:#0f1115; border:1px solid #1b1e27; border-radius:16px; box-shadow: 0 10px 30px rgba(0,0,0,0.35);">
      <div style="padding:28px 24px 8px 24px; text-align:left;">
        <div style="color:#e5e7eb; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:14px; letter-spacing:0.08em; text-transform:uppercase;">SoundByte</div>
        <h1 style="margin:10px 0 4px 0; color:#f9fafb; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:22px; line-height:1.4; font-weight:700;">${title}</h1>
        <p style="margin:0 0 18px 0; color:#9ca3af; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:14px; line-height:1.6;">${preview}...</p>
      </div>
      <div style="padding:0 24px 12px 24px;">
        <a href="${audioUrl}" style="display:inline-block; text-decoration:none; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); color:#ffffff; padding:12px 18px; border-radius:12px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:14px; font-weight:600;">▶︎ Play in browser</a>
      </div>
      <div style="padding:10px 24px 24px 24px;">
        <div style="background:#0b0d12; border:1px solid #1b1e27; border-radius:12px; padding:14px;">
          <p style="margin:0 0 8px 0; color:#9ca3af; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:12px;">Inline playback (supported in Apple Mail/iOS). Others will download or open the audio.</p>
          <audio controls style="width:100%; outline:none; height:36px;">
            <source src="${audioUrl}" type="audio/wav">
            <a href="${audioUrl}" style="color:#a78bfa;">Listen</a>
          </audio>
        </div>
      </div>
      <div style="padding:0 24px 24px 24px;">
        <div style="height:1px; background:#1b1e27; width:100%;"></div>
      </div>
      <div style="padding:0 24px 28px 24px; text-align:center;">
        <a href="${process.env.CLIENT_URL}/dashboard" style="color:#a5b4fc; text-decoration:none; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:12px;">Manage Subscriptions</a>
        <span style="color:#374151; margin:0 8px;">•</span>
        <a href="${process.env.CLIENT_URL}/dashboard" style="color:#6b7280; text-decoration:none; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:12px;">Unsubscribe</a>
      </div>
    </div>
    <div style="max-width:640px; margin:12px auto 0 auto; text-align:center; color:#6b7280; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:11px;">© 2025 SoundByte</div>
  </div>
</body>
</html>`
}