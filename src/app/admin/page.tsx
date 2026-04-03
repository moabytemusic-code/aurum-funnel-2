'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, Calendar, DollarSign, Briefcase, MessageSquare, Search, RefreshCw, LogOut, Users, TrendingUp, Clock } from 'lucide-react'

interface Contact {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string
  experience: string
  investmentRange: string
  goals: string
  referral: string
  createdAt: string
  emailBlacklisted: boolean
  smsBlacklisted: boolean
  _rawAttributes?: Record<string, any>
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [showRaw, setShowRaw] = useState<Record<number, boolean>>({})

  useEffect(() => {
    // Check if already authenticated in session
    const auth = sessionStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchContacts()
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'aurum2026'
    
    if (password === adminPassword) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
      fetchContacts()
    } else {
      setError('Incorrect password')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('adminAuth')
    setContacts([])
  }

  const fetchContacts = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/admin/contacts')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch contacts')
      }
      
      setContacts(data.contacts || [])
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to load contacts. Make sure Brevo API key is configured.')
    } finally {
      setLoading(false)
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-4">
        <div className="card max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-400 mt-2">Enter password to access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-primary border border-white/10 rounded-xl py-3 px-4 text-white focus:border-accent focus:outline-none transition-colors"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="py-5 border-b border-white/10">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AURUM Admin</h1>
              <p className="text-sm text-slate-400">Lead Management Dashboard</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors text-sm">
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold">{contacts.length}</p>
                <p className="text-sm text-slate-400">Total Leads</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {contacts.filter(c => c.investmentRange).length}
                </p>
                <p className="text-sm text-slate-400">With Investment Info</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {contacts.length > 0 ? formatDate(contacts[0].createdAt).split(',')[0] : '—'}
                </p>
                <p className="text-sm text-slate-400">Latest Submission</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Refresh */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full bg-secondary border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={fetchContacts}
            disabled={loading}
            className="btn-secondary py-3 px-6 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Contacts Table */}
        {loading ? (
          <div className="card text-center py-12">
            <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading contacts...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="card text-center py-12">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {contacts.length === 0 ? 'No leads yet. Share your funnel to start collecting applications!' : 'No matches found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="card hover:border-accent/30 transition-all">
                <div className="flex flex-wrap gap-4 items-start justify-between">
                  <div className="flex-1 min-w-[200px]">
                    <h3 className="text-lg font-semibold">
                      {contact.firstName} {contact.lastName}
                    </h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {contact.email}
                      </span>
                      {contact.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {contact.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    {formatDate(contact.createdAt)}
                  </div>
                </div>

                {/* Questionnaire Answers */}
                <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-start gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-500 text-xs">Experience</p>
                      <p className="text-white">{contact.experience || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-500 text-xs">Investment Range</p>
                      <p className="text-white">{contact.investmentRange || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-500 text-xs">Referral Source</p>
                      <p className="text-white">{contact.referral || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-500 text-xs">Phone</p>
                      <p className="text-white">{contact.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-start gap-2 text-sm">
                    <MessageSquare className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-slate-500 text-xs">Financial Goals</p>
                      <p className="text-white">{contact.goals || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Raw Data Toggle */}
                <div className="mt-3 pt-3 border-t border-white/5">
                  <button
                    onClick={() => setShowRaw(prev => ({ ...prev, [contact.id]: !prev[contact.id] }))}
                    className="text-xs text-slate-500 hover:text-accent transition-colors"
                  >
                    {showRaw[contact.id] ? 'Hide' : 'Show'} Raw Data
                  </button>
                  {showRaw[contact.id] && (
                    <pre className="mt-2 bg-black/50 rounded-lg p-3 text-xs text-slate-400 overflow-x-auto max-h-40">
                      {JSON.stringify(contact._rawAttributes, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
