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

    // Step 1: Fetch contact list (IDs only)
    const listUrl = listId
      ? `https://api.brevo.com/v3/contacts/lists/${listId}/contacts?limit=100`
      : `https://api.brevo.com/v3/contacts?limit=100`

    const listResponse = await fetch(listUrl, {
      headers: { 'api-key': brevoApiKey },
    })

    if (!listResponse.ok) {
      const errorData = await listResponse.json()
      console.error('Brevo list fetch error:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch contacts from Brevo' },
        { status: 500 }
      )
    }

    const listData = await listResponse.json()
    const contactIds = listData.contacts?.map((c: any) => c.id) || []

    if (contactIds.length === 0) {
      return NextResponse.json({
        success: true,
        total: 0,
        contacts: [],
      })
    }

    // Step 2: Fetch each contact's full details (includes attributes)
    const contactDetails = await Promise.all(
      contactIds.map(async (contactId: number) => {
        try {
          const res = await fetch(`https://api.brevo.com/v3/contacts/${contactId}`, {
            headers: { 'api-key': brevoApiKey },
          })
          if (res.ok) {
            return res.json()
          }
          return null
        } catch {
          return null
        }
      })
    )

    // Filter out failed fetches and sort by newest first
    const validContacts = contactDetails
      .filter(Boolean)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Transform contacts
    const contacts = validContacts.map((contact: any) => {
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
