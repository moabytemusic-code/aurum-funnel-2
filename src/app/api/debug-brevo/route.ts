import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const brevoApiKey = process.env.BREVO_API_KEY
  const listId = process.env.BREVO_LIST_ID

  if (!brevoApiKey || brevoApiKey === 'your-brevo-api-key-here') {
    return NextResponse.json({ error: 'Brevo API key not configured' }, { status: 503 })
  }

  // Test 1: Fetch contacts list
  const listUrl = listId
    ? `https://api.brevo.com/v3/contacts/lists/${listId}/contacts?limit=10`
    : `https://api.brevo.com/v3/contacts?limit=10`

  const listRes = await fetch(listUrl, {
    headers: { 'api-key': brevoApiKey },
  })

  const listData = listRes.ok ? await listRes.json() : { error: await listRes.text(), status: listRes.status }

  // Test 2: If contacts exist, fetch one individually
  let singleContact = null
  if (listRes.ok && listData.contacts?.length > 0) {
    const firstContactId = listData.contacts[0].id
    const singleRes = await fetch(`https://api.brevo.com/v3/contacts/${firstContactId}`, {
      headers: { 'api-key': brevoApiKey },
    })
    singleContact = singleRes.ok ? await singleRes.json() : { error: await singleRes.text(), status: singleRes.status }
  }

  return NextResponse.json({
    brevoConfigured: true,
    listId,
    listResponse: listData,
    singleContactResponse: singleContact,
  })
}
