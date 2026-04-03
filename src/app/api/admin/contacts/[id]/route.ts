import { NextRequest, NextResponse } from 'next/server'

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

    const response = await fetch(`https://api.brevo.com/v3/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        attributes: {
          FIRSTNAME: body.firstName || '',
          LASTNAME: body.lastName || '',
          PHONE: body.phone || '',
          EXPERIENCE: body.experience || '',
          INVESTMENTRANGE: body.investmentRange || '',
          FINANCIALGOALS: body.goals || '',
          REFERRALSOURCE: body.referral || '',
        },
        email: body.email,
        emailBlacklisted: body.emailBlacklisted,
        smsBlacklisted: body.smsBlacklisted,
        listIds: body.listIds,
        unlinkListIds: body.unlinkListIds,
        blacklisted: body.blacklisted,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Brevo update error:', errorData)
      return NextResponse.json(
        { error: 'Failed to update contact' },
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
