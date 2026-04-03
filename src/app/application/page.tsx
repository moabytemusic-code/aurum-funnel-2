'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, User, Mail, Phone, Briefcase, DollarSign, MessageSquare } from 'lucide-react'

export default function Application() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    experience: '',
    investmentRange: '',
    goals: '',
    referral: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, send to your backend/CRM
    console.log('Form submitted:', formData)
    setStep(3)
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-4">
        <div className="card max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
          <p className="text-slate-400 mb-8">
            Thank you for your interest in AURUM. Our team will review your application and reach out within 24-48 hours to discuss next steps.
          </p>
          <div className="space-y-4">
            <Link href="/" className="btn-primary block">
              Return to Home
            </Link>
            <a href="mailto:support@theaifinancebreakdown.com" className="btn-secondary block">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="py-5 border-b border-white/10">
        <div className="container mx-auto px-4">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Application Form */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Complete Your Application
            </h1>
            <p className="text-slate-400">
              Takes about 5 minutes. We'll use this to understand your goals.
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-accent transition-all duration-500" style={{ width: `${step * 50}%` }} />
            </div>
            <p className="text-center text-sm text-slate-400 mt-2">
              Step {step} of 2
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full bg-primary border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-accent focus:outline-none transition-colors"
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full bg-primary border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-accent focus:outline-none transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-primary border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-accent focus:outline-none transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-primary border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-accent focus:outline-none transition-colors"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary w-full"
                >
                  Continue →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-6">Investment Profile</h2>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Trading Experience
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <select
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full bg-primary border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-accent focus:outline-none transition-colors appearance-none"
                    >
                      <option value="">Select your experience level</option>
                      <option value="none">No experience</option>
                      <option value="beginner">Beginner (less than 1 year)</option>
                      <option value="intermediate">Intermediate (1-3 years)</option>
                      <option value="advanced">Advanced (3+ years)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Investment Range
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <select
                      name="investmentRange"
                      value={formData.investmentRange}
                      onChange={handleChange}
                      className="w-full bg-primary border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-accent focus:outline-none transition-colors appearance-none"
                    >
                      <option value="">Select your investment range</option>
                      <option value="5k-10k">$5,000 - $10,000</option>
                      <option value="10k-25k">$10,000 - $25,000</option>
                      <option value="25k-50k">$25,000 - $50,000</option>
                      <option value="50k-100k">$50,000 - $100,000</option>
                      <option value="100k+">$100,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    What are your financial goals?
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <textarea
                      name="goals"
                      value={formData.goals}
                      onChange={handleChange}
                      rows={4}
                      className="w-full bg-primary border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-accent focus:outline-none transition-colors resize-none"
                      placeholder="Tell us about your financial goals..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    How did you hear about us?
                  </label>
                  <input
                    type="text"
                    name="referral"
                    value={formData.referral}
                    onChange={handleChange}
                    className="w-full bg-primary border border-white/10 rounded-xl py-3 px-4 text-white focus:border-accent focus:outline-none transition-colors"
                    placeholder="Friend, social media, etc."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="btn-success"
                  >
                    Submit Application
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Your information is secure and will only be used to process your application.
          </p>
        </div>
      </section>
    </div>
  )
}
