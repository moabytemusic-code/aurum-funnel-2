import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, experience, investmentRange, goals, referral } = body

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    const brevoApiKey = process.env.BREVO_API_KEY
    const listId = process.env.BREVO_LIST_ID
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@aurumteambuilders.com'
    const senderName = process.env.BREVO_SENDER_NAME || 'Aurum Team Builders'

    let brevoSynced = false
    let emailSent = false

    // If Brevo is configured, add contact and send email
    if (brevoApiKey && brevoApiKey !== 'your-brevo-api-key-here') {
      // Step 1: Create or update contact
      const createContactRes = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          email,
          attributes: {
            FIRSTNAME: firstName,
            LASTNAME: lastName,
            PHONE: phone || '',
            EXPERIENCE: experience || '',
            INVESTMENTRANGE: investmentRange || '',
            FINANCIALGOALS: goals || '',
            REFERRALSOURCE: referral || '',
          },
          listIds: listId ? [parseInt(listId)] : undefined,
          updateEnabled: true,
        }),
      })

      if (!createContactRes.ok) {
        const errorData = await createContactRes.json()
        console.error('Brevo contact creation error:', JSON.stringify(errorData))
      } else {
        brevoSynced = true
        const contactData = await createContactRes.json()
        console.log('Brevo contact created/updated:', JSON.stringify(contactData))
      }

      // Step 2: Send welcome email via Brevo transactional API
      const bookingUrl = process.env.BREVO_BOOKING_URL || process.env.NEXT_PUBLIC_BOOKING_URL || '#'
      const emailHtml = getWelcomeEmailTemplate(firstName, bookingUrl)
      
      const sendEmailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': brevoApiKey,
        },
        body: JSON.stringify({
          sender: {
            name: senderName,
            email: senderEmail,
          },
          to: [
            {
              email,
              name: `${firstName} ${lastName}`,
            },
          ],
          subject: 'Welcome to Aurum Team Builders — Your Application is Received',
          htmlContent: emailHtml,
        }),
      })

      if (!sendEmailRes.ok) {
        const errorData = await sendEmailRes.json()
        console.error('Brevo email send error:', errorData)
      } else {
        emailSent = true
      }
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Application received',
        brevoSynced,
        emailSent,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Application submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getWelcomeEmailTemplate(firstName: string, bookingUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AURUM AI</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">Aurum<span style="color:#3b82f6;">Team</span>Builders</h1>
              <p style="color:#94a3b8;margin:10px 0 0;font-size:16px;">AI-Powered Digital Banking Ecosystem</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#0f172a;margin:0 0 20px;font-size:22px;">Welcome, ${firstName}! 👋</h2>
              
              <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 20px;">
                Thank you for your interest in Aurum Team Builders. We've received your application and our team is reviewing it now.
              </p>
              
              <p style="color:#475569;font-size:16px;line-height:1.6;margin:0 0 30px;">
                <strong>What happens next?</strong>
              </p>
              
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 30px;">
                <tr>
                  <td style="padding:10px 0;">
                    <span style="display:inline-block;width:32px;height:32px;background-color:#3b82f6;border-radius:50%;text-align:center;line-height:32px;color:#ffffff;font-weight:bold;margin-right:12px;">1</span>
                    <span style="color:#475569;font-size:15px;">Our team reviews your application</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="display:inline-block;width:32px;height:32px;background-color:#3b82f6;border-radius:50%;text-align:center;line-height:32px;color:#ffffff;font-weight:bold;margin-right:12px;">2</span>
                    <span style="color:#475569;font-size:15px;">We'll reach out within 24-48 hours</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="display:inline-block;width:32px;height:32px;background-color:#3b82f6;border-radius:50%;text-align:center;line-height:32px;color:#ffffff;font-weight:bold;margin-right:12px;">3</span>
                    <span style="color:#475569;font-size:15px;">We'll discuss your goals and next steps</span>
                  </td>
                </tr>
              </table>
              
              <div style="background-color:#f8fafc;border-left:4px solid #3b82f6;padding:20px;border-radius:0 8px 8px 0;margin:0 0 30px;">
                <p style="color:#475569;font-size:15px;line-height:1.6;margin:0;">
                  <strong>Have questions?</strong> Reply to this email or book a quick 10-minute call with our team.
                </p>
              </div>
              
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:#3b82f6;border-radius:8px;text-align:center;">
                    <a href="${bookingUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;">Book a Call →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:30px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;">
                This email was sent to you because you submitted an application through the Aurum Team Builders onboarding portal.<br>
                © ${new Date().getFullYear()} Aurum Team Builders. All rights reserved.
              </p>
              <p style="color:#94a3b8;font-size:11px;line-height:1.6;margin:10px 0 0;">
                Educational purposes only. No earnings claims or guarantees.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
