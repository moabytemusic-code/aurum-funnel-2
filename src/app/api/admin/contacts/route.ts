import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const brevoApiKey = process.env.BREVO_API_KEY
    const listId = process.env.BREVO_LIST_ID

    if (!brevoApiKey || brevoApiKey === 'your-brevo-api-key-here') {
      return NextResponse.json(
        { error: 'Brevo API key not configured' },
        { status: 503 }
      )
    }

    // Fetch contacts from Brevo
    const url = listId
      ? `https://api.brevo.com/v3/contacts/lists/${listId}/contacts?limit=100&sort=desc&order=created_at`
      : `https://api.brevo.com/v3/contacts?limit=100&sort=desc&order=created_at`

    const response = await fetch(url, {
      headers: {
        'api-key': brevoApiKey,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Brevo fetch error:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch contacts from Brevo' },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    // Transform contacts into a cleaner format
    const contacts = data.contacts.map((contact: any) => {
      const attrs = contact.attributes || {}
      return {
        id: contact.id,
        email: contact.email,
        firstName: attrs.FIRSTNAME || '',
        lastName: attrs.LASTNAME || '',
        phone: attrs.PHONE || '',
        experience: attrs.EXPERIENCE || '',
        investmentRange: attrs.INVESTMENTRANGE || '',
        goals: attrs.GOALS || '',
        referral: attrs.REFERRAL || '',
        createdAt: contact.createdAt,
        emailBlacklisted: contact.emailBlacklisted,
        smsBlacklisted: contact.smsBlacklisted,
        _rawAttributes: attrs,
      }
    })

    return NextResponse.json({
      success: true,
      total: contacts.length,
      contacts,
    })
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
