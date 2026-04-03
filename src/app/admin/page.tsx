'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Download, RefreshCw, Mail, Phone, TrendingUp, Calendar, ExternalLink, LogOut } from 'lucide-react'

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
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterExperience, setFilterExperience] = useState('all')
  const [filterInvestment, setFilterInvestment] = useState('all')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'aurum2026'

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === adminPassword) {
      setIsAuthenticated(true)
      sessionStorage.setItem('admin_auth', 'true')
      fetchContacts()
    } else {
      alert('Incorrect password')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin_auth')
    setContacts([])
  }

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/contacts')
      const data = await response.json()
      if (data.success) {
        setContacts(data.contacts)
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Experience', 'Investment Range', 'Goals', 'Referral', 'Date']
    const rows = filteredContacts.map(c => [
      c.firstName,
      c.lastName,
      c.email,
      c.phone,
      c.experience,
      c.investmentRange,
      c.goals,
      c.referral,
      new Date(c.createdAt).toLocaleDateString(),
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aurum-leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = searchTerm === '' || 
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesExperience = filterExperience === 'all' || contact.experience === filterExperience
    const matchesInvestment = filterInvestment === 'all' || contact.investmentRange === filterInvestment

    return matchesSearch && matchesExperience && matchesInvestment
  })

  const stats = {
    total: contacts.length,
    thisWeek: contacts.filter(c => {
      const date = new Date(c.createdAt)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return date >= weekAgo
    }).length,
    highInvestment: contacts.filter(c => ['$50k-$100k', '$100k+'].includes(c.investmentRange)).length,
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-4">
        <div className="card max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">
              AURUM<span className="text-accent">AI</span> Admin
            </h1>
            <p className="text-slate-400">Enter admin password to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-primary border border-white/10 rounded-xl py-3 px-4 text-white focus:border-accent focus:outline-none transition-colors"
              autoFocus
            />
            <button type="submit" className="btn-primary w-full">
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="border-b border-white/10 bg-secondary/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">
              AURUM<span className="text-accent">AI</span>
            </h1>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Admin Dashboard</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Leads</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">This Week</p>
                <p className="text-3xl font-bold mt-1">{stats.thisWeek}</p>
              </div>
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">High Investment ($50k+)</p>
                <p className="text-3xl font-bold mt-1">{stats.highInvestment}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full bg-primary border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-accent focus:outline-none transition-colors"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={filterExperience}
                onChange={(e) => setFilterExperience(e.target.value)}
                className="bg-primary border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-accent focus:outline-none"
              >
                <option value="all">All Experience</option>
                <option value="none">No experience</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <select
                value={filterInvestment}
                onChange={(e) => setFilterInvestment(e.target.value)}
                className="bg-primary border border-white/10 rounded-xl py-2 px-3 text-white text-sm focus:border-accent focus:outline-none"
              >
                <option value="all">All Ranges</option>
                <option value="$5k-$10k">$5k-$10k</option>
                <option value="$10k-$25k">$10k-$25k</option>
                <option value="$25k-$50k">$25k-$50k</option>
                <option value="$50k-$100k">$50k-$100k</option>
                <option value="$100k+">$100k+</option>
              </select>
            </div>

            {/* Actions */}
            <button onClick={fetchContacts} className="btn-secondary py-2 px-4 text-sm" disabled={loading}>
              <RefreshCw className={`w-4 h-4 inline mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button onClick={exportToCSV} className="btn-secondary py-2 px-4 text-sm" disabled={filteredContacts.length === 0}>
              <Download className="w-4 h-4 inline mr-1" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Contacts Table */}
        {loading && contacts.length === 0 ? (
          <div className="card text-center py-16">
            <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading contacts...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-slate-400 text-lg mb-2">No leads found</p>
            <p className="text-slate-500 text-sm">
              {contacts.length === 0 ? 'Submit a test application to see data here' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Email</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Phone</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Experience</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Investment</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium">{contact.firstName} {contact.lastName}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Mail className="w-4 h-4 text-slate-500" />
                          {contact.email}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {contact.phone ? (
                          <div className="flex items-center gap-2 text-slate-300">
                            <Phone className="w-4 h-4 text-slate-500" />
                            {contact.phone}
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-300 capitalize">{contact.experience || '—'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          ['$50k-$100k', '$100k+'].includes(contact.investmentRange)
                            ? 'bg-success/20 text-success'
                            : 'text-slate-300'
                        }`}>
                          {contact.investmentRange || '—'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-400">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="text-accent hover:underline text-sm flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedContact(null)}>
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Lead Details</h2>
              <button onClick={() => setSelectedContact(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase">First Name</label>
                  <p className="text-white mt-1">{selectedContact.firstName}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase">Last Name</label>
                  <p className="text-white mt-1">{selectedContact.lastName}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase">Email</label>
                <p className="text-white mt-1">{selectedContact.email}</p>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase">Phone</label>
                <p className="text-white mt-1">{selectedContact.phone || 'Not provided'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase">Experience</label>
                  <p className="text-white mt-1 capitalize">{selectedContact.experience || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 uppercase">Investment Range</label>
                  <p className="text-white mt-1">{selectedContact.investmentRange || 'Not specified'}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase">Financial Goals</label>
                <p className="text-white mt-1">{selectedContact.goals || 'Not provided'}</p>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase">Referral Source</label>
                <p className="text-white mt-1">{selectedContact.referral || 'Not provided'}</p>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase">Submitted</label>
                <p className="text-white mt-1">
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex gap-3">
              <a
                href={`mailto:${selectedContact.email}`}
                className="btn-primary flex-1 text-center text-sm py-3"
              >
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </a>
              {selectedContact.phone && (
                <a
                  href={`tel:${selectedContact.phone}`}
                  className="btn-secondary flex-1 text-center text-sm py-3"
                >
                  <Phone className="w-4 h-4 inline mr-1" />
                  Call
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
