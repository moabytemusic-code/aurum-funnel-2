'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Plus, X, Check, Phone, CalendarDays } from 'lucide-react'

interface Contact {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string
  goals: string
  scheduledCallDate?: string
  scheduledCallNotes?: string
}

interface ScheduledCall {
  id: string
  contactId: number
  contactName: string
  contactEmail: string
  contactPhone: string
  date: string
  time: string
  notes: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-primary flex items-center justify-center text-slate-400">Loading...</div>}>
      <CalendarContent />
    </Suspense>
  )
}

function CalendarContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [scheduledCalls, setScheduledCalls] = useState<ScheduledCall[]>([])
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('09:00')
  const [callNotes, setCallNotes] = useState('')
  const [showDayDetail, setShowDayDetail] = useState<string | null>(null)
  const [hasAutoSelected, setHasAutoSelected] = useState(false)

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchData()
    }
  }, [])

  // Pre-select contact from URL param (only once per session)
  useEffect(() => {
    if (isAuthenticated && contacts.length > 0 && !hasAutoSelected) {
      const contactId = searchParams.get('contact')
      if (contactId) {
        const contact = contacts.find(c => c.id === Number(contactId))
        if (contact) {
          setSelectedContact(contact)
          setShowScheduleModal(true)
          setHasAutoSelected(true)
        }
      }
    }
  }, [isAuthenticated, contacts, hasAutoSelected, searchParams])

  const fetchData = async () => {
    setLoading(true)
    try {
      const contactsRes = await fetch('/api/admin/contacts')
      const contactsData = await contactsRes.json()
      if (contactsRes.ok) {
        setContacts(contactsData.contacts || [])
        // Extract scheduled calls from contacts
        const calls: ScheduledCall[] = (contactsData.contacts || [])
          .filter((c: Contact) => c.scheduledCallDate)
          .map((c: Contact) => ({
            id: `call-${c.id}`,
            contactId: c.id,
            contactName: `${c.firstName} ${c.lastName}`,
            contactEmail: c.email,
            contactPhone: c.phone,
            date: c.scheduledCallDate || '',
            time: c.scheduledCallNotes?.split('|')[0] || '09:00',
            notes: c.scheduledCallNotes?.split('|').slice(1).join('|') || '',
            status: 'scheduled' as const,
          }))
        setScheduledCalls(calls)
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'aurum2026'
    if (password === adminPassword) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
      fetchData()
    } else {
      setError('Incorrect password')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('adminAuth')
    setContacts([])
    setScheduledCalls([])
  }

  const openScheduleModal = (contact: Contact, date?: string) => {
    setSelectedContact(contact)
    setSelectedDate(date || new Date().toISOString().split('T')[0])
    setSelectedTime('09:00')
    setCallNotes('')
    setShowScheduleModal(true)
  }

  const handleScheduleCall = async () => {
    if (!selectedContact || !selectedDate) return

    try {
      const response = await fetch(`/api/admin/contacts?id=${selectedContact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledCallDate: selectedDate,
          scheduledCallTime: selectedTime,
          scheduledCallNotes: callNotes,
        }),
      })

      if (!response.ok) throw new Error('Failed to schedule')

      setShowScheduleModal(false)
      setSelectedContact(null)
      await fetchData()
    } catch (err) {
      console.error('Schedule error:', err)
      setError('Failed to schedule call')
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: { date: string; day: number; isCurrentMonth: boolean }[] = []

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: `${year}-${String(month).padStart(2, '0')}-${String(prevMonthLastDay - i).padStart(2, '0')}`,
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        day: i,
        isCurrentMonth: true,
      })
    }

    // Next month days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: `${year}-${String(month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        day: i,
        isCurrentMonth: false,
      })
    }

    return days
  }

  const getCallsForDate = (date: string) => {
    return scheduledCalls.filter(call => call.date === date)
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const days = getDaysInMonth(currentDate)
  const today = new Date().toISOString().split('T')[0]

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-4">
        <div className="card max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-2xl font-bold">Call Scheduler</h1>
            <p className="text-slate-400 mt-2">Enter password to access</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-primary border border-white/10 rounded-xl py-3 px-4 text-white focus:border-accent focus:outline-none"
              autoFocus
            />
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">{error}</div>}
            <button type="submit" className="btn-primary w-full">Access Calendar</button>
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
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Call Scheduler</h1>
              <p className="text-sm text-slate-400">Schedule and manage calls with leads</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <CalendarDays className="w-4 h-4" />
              Back to Admin
            </Link>
            <button onClick={() => setShowScheduleModal(true)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Schedule Call
            </button>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors text-sm">Logout</button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-3xl font-bold">{scheduledCalls.length}</p>
                <p className="text-sm text-slate-400">Total Scheduled</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-3xl font-bold">
                  {scheduledCalls.filter(c => c.date >= today).length}
                </p>
                <p className="text-sm text-slate-400">Upcoming Calls</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-3xl font-bold">{contacts.length}</p>
                <p className="text-sm text-slate-400">Total Leads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="card p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm text-slate-500 font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const calls = getCallsForDate(day.date)
              const isToday = day.date === today
              return (
                <div
                  key={idx}
                  className={`min-h-[80px] p-1 rounded-lg border transition-colors cursor-pointer
                    ${day.isCurrentMonth ? 'bg-secondary/50 border-white/5 hover:border-accent/30' : 'bg-transparent border-transparent opacity-40'}
                    ${isToday ? 'border-accent/50 bg-accent/5' : ''}
                  `}
                  onClick={() => calls.length > 0 && setShowDayDetail(day.date)}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-accent' : 'text-slate-300'}`}>
                    {day.day}
                  </div>
                  {calls.map((call, i) => (
                    <div
                      key={i}
                      className="text-xs bg-accent/20 text-accent rounded px-1 py-0.5 mb-0.5 truncate"
                    >
                      {call.time} - {call.contactName}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Calls List */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">Upcoming Calls</h3>
          {scheduledCalls.filter(c => c.date >= today).length === 0 ? (
            <div className="card text-center py-8 text-slate-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>No upcoming calls scheduled</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledCalls
                .filter(c => c.date >= today)
                .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                .map(call => (
                  <div key={call.id} className="card flex items-center justify-between hover:border-accent/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-semibold">{call.contactName}</p>
                        <p className="text-sm text-slate-400">{call.contactEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{new Date(call.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-sm text-slate-400">{call.time}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Schedule a Call</h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Contact Selection */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Select Lead *</label>
                <select
                  value={selectedContact?.id || ''}
                  onChange={(e) => {
                    const contact = contacts.find(c => c.id === Number(e.target.value))
                    setSelectedContact(contact || null)
                  }}
                  className="w-full bg-primary border border-white/10 rounded-xl py-3 px-4 text-white focus:border-accent focus:outline-none appearance-none"
                >
                  <option value="">Choose a lead...</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Date *</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  className="w-full bg-primary border border-white/10 rounded-xl py-3 px-4 text-white focus:border-accent focus:outline-none"
                />
              </div>

              {/* Time */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-primary border border-white/10 rounded-xl py-3 px-4 text-white focus:border-accent focus:outline-none appearance-none"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = String(i).padStart(2, '0')
                    return (
                      <option key={i} value={`${hour}:00`}>{`${hour}:00`}</option>
                    )
                  })}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Notes</label>
                <textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-primary border border-white/10 rounded-xl py-3 px-4 text-white focus:border-accent focus:outline-none resize-none"
                  placeholder="Agenda, talking points, etc."
                />
              </div>

              {/* Selected Contact Info */}
              {selectedContact && (
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-slate-400 mb-1">Lead Info:</p>
                  <p className="font-semibold">{selectedContact.firstName} {selectedContact.lastName}</p>
                  <p className="text-sm text-slate-400">{selectedContact.email}</p>
                  {selectedContact.phone && <p className="text-sm text-slate-400">{selectedContact.phone}</p>}
                  {selectedContact.goals && <p className="text-sm text-slate-400 mt-2">Goals: {selectedContact.goals}</p>}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowScheduleModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={handleScheduleCall}
                  disabled={!selectedContact || !selectedDate}
                  className="btn-success flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Schedule Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      {showDayDetail && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {new Date(showDayDetail + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <button onClick={() => setShowDayDetail(null)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {getCallsForDate(showDayDetail).map((call, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="font-semibold">{call.time}</span>
                  </div>
                  <p className="font-medium">{call.contactName}</p>
                  <p className="text-sm text-slate-400">{call.contactEmail}</p>
                  {call.contactPhone && <p className="text-sm text-slate-400">{call.contactPhone}</p>}
                  {call.notes && <p className="text-sm text-slate-400 mt-2">Notes: {call.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
