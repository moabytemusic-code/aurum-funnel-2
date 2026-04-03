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
        goals: attrs.FINANCIALGOALS || '',
        referral: attrs.REFERRALSOURCE || '',
        scheduledCallDate: attrs.SCHEDULEDCALLDATE || '',
        scheduledCallTime: attrs.SCHEDULEDCALLTIME || '',
        scheduledCallNotes: attrs.SCHEDULEDCALLNOTES || '',
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

export async function DELETE(request: NextRequest) {
  try {
    const brevoApiKey = process.env.BREVO_API_KEY

    if (!brevoApiKey || brevoApiKey === 'your-brevo-api-key-here') {
      return NextResponse.json(
        { error: 'Brevo API key not configured' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('id')

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`https://api.brevo.com/v3/contacts/${contactId}`, {
      method: 'DELETE',
      headers: { 'api-key': brevoApiKey },
    })

    if (!response.ok && response.status !== 204) {
      const errorData = await response.json()
      console.error('Brevo delete error:', errorData)
      return NextResponse.json(
        { error: 'Failed to delete contact' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Contact deleted' })
  } catch (error) {
    console.error('Delete contact error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const brevoApiKey = process.env.BREVO_API_KEY

    if (!brevoApiKey || brevoApiKey === 'your-brevo-api-key-here') {
      return NextResponse.json(
        { error: 'Brevo API key not configured' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const contactId = searchParams.get('id')

    if (!contactId) {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // First fetch the current contact to get existing attributes
    const getRes = await fetch(`https://api.brevo.com/v3/contacts/${contactId}`, {
      headers: { 'api-key': brevoApiKey },
    })

    if (!getRes.ok) {
      return NextResponse.json(
        { error: 'Contact not found in Brevo' },
        { status: 404 }
      )
    }

    const existingContact = await getRes.json()
    const existingAttrs = existingContact.attributes || {}

    // Merge existing attributes with updated ones
    const attributes = {
      ...existingAttrs,
      ...(body.firstName !== undefined && { FIRSTNAME: body.firstName }),
      ...(body.lastName !== undefined && { LASTNAME: body.lastName }),
      ...(body.phone !== undefined && { PHONE: body.phone }),
      ...(body.experience !== undefined && { EXPERIENCE: body.experience }),
      ...(body.investmentRange !== undefined && { INVESTMENTRANGE: body.investmentRange }),
      ...(body.goals !== undefined && { FINANCIALGOALS: body.goals }),
      ...(body.referral !== undefined && { REFERRALSOURCE: body.referral }),
      ...(body.scheduledCallDate !== undefined && { SCHEDULEDCALLDATE: body.scheduledCallDate }),
      ...(body.scheduledCallTime !== undefined && { SCHEDULEDCALLTIME: body.scheduledCallTime }),
      ...(body.scheduledCallNotes !== undefined && { SCHEDULEDCALLNOTES: body.scheduledCallNotes }),
    }

    console.log(`Updating contact ${contactId} with attributes:`, JSON.stringify(attributes))

    // Brevo only supports PUT for contact updates
    const response = await fetch(`https://api.brevo.com/v3/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        attributes,
        email: body.email || existingContact.email,
        emailBlacklisted: body.emailBlacklisted ?? existingContact.emailBlacklisted,
        smsBlacklisted: body.smsBlacklisted ?? existingContact.smsBlacklisted,
      }),
    })

    const responseData = await response.text()
    console.log(`Brevo PUT response status: ${response.status}`)
    console.log(`Brevo PUT response body:`, responseData)

    if (!response.ok) {
      let errorDetail = responseData
      try {
        const parsed = JSON.parse(responseData)
        errorDetail = parsed.message || JSON.stringify(parsed)
      } catch {}
      return NextResponse.json(
        { error: `Brevo error (${response.status}): ${errorDetail}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Contact updated' })
  } catch (error) {
    console.error('Update contact error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
