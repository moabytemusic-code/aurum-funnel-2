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

    // If Brevo is configured, add contact
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
            INVESTMENT_RANGE: investmentRange || '',
            GOALS: goals || '',
            REFERRAL: referral || '',
          },
          listIds: listId ? [parseInt(listId)] : undefined,
          updateEnabled: true,
        }),
      })

      if (!createContactRes.ok) {
        const errorData = await createContactRes.json()
        console.error('Brevo API error:', errorData)
        
        // Don't fail the whole submission if Brevo fails
        // Log and continue
        console.warn('Failed to add contact to Brevo, but submission was received')
      }
    }

    // Return success
    return NextResponse.json(
      { 
        success: true, 
        message: 'Application received',
        brevoSynced: brevoApiKey && brevoApiKey !== 'your-brevo-api-key-here'
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
