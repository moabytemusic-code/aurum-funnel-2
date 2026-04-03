'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, ChevronDown, Mail, Calendar, CheckCircle, ArrowRight, Shield, Clock, TrendingUp } from 'lucide-react'

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      setProgress(scrolled)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const faqs = [
    {
      question: "Do I need trading experience?",
      answer: "No experience needed. AURUM is designed for non-traders. The AI handles all the complex analysis and execution automatically."
    },
    {
      question: "How much time does this require?",
      answer: "Minimal. After initial setup (about 30 minutes), AURUM runs autonomously. Most users check in 1-2 times per week for 5-10 minutes."
    },
    {
      question: "What's the investment requirement?",
      answer: "Requirements vary based on your goals. During your application, we'll discuss what makes sense for your situation. There's no pressure — we focus on realistic, sustainable growth."
    },
    {
      question: "Is my money locked in?",
      answer: "No. You maintain full control and access to your funds at all times. AURUM operates through your existing banking infrastructure — you're never locked in."
    },
    {
      question: "What kind of support do you provide?",
      answer: "Full onboarding support plus ongoing assistance. You'll have access to our team via email, chat, or scheduled calls. We're here to ensure your success."
    }
  ]

  return (
    <div className="min-h-screen bg-primary">
      {/* Progress Bar */}
      <div className="sticky top-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-2">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm text-slate-400 mt-1">
            Step <span className="text-white font-semibold">1</span> of 3: <span className="text-white">Watch Presentation</span>
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="py-5 border-b border-white/10">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-2xl font-bold">
            AURUM<span className="text-accent">AI</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full text-sm mb-6 border border-success/30 animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            Welcome to the Onboarding Portal
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent animate-slide-up">
            You're One Step Away from<br />Accessing AURUM
          </h1>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            AI-Powered Digital Banking Ecosystem — Built for realistic, automated wealth growth
          </p>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Play, title: "Watch Presentation", desc: "Learn how AURUM works in 15 minutes" },
              { icon: ChevronDown, title: "Complete Application", desc: "Quick 5-minute setup process" },
              { icon: TrendingUp, title: "Get Started", desc: "Activate your AI banking ecosystem" }
            ].map((step, i) => (
              <div 
                key={i}
                className="card text-center group hover:border-accent/50 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs text-accent font-semibold mb-2">STEP {i + 1}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="card max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">
              🎬 Watch the Full AURUM Breakdown
            </h2>
            <p className="text-slate-400 text-center mb-8">
              Everything you need to know before getting started
            </p>

            <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-8">
              {videoLoaded ? (
                <iframe
                  src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary to-secondary">
                  <button 
                    onClick={() => setVideoLoaded(true)}
                    className="w-20 h-20 bg-accent rounded-full flex items-center justify-center hover:scale-110 transition-transform mb-4"
                  >
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </button>
                  <p className="text-slate-400 text-sm">Click to load presentation (15 min)</p>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/application" className="btn-success">
                ✓ I've Watched — Continue to Application
              </Link>
              <button 
                onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary"
              >
                ? Have Questions First?
              </button>
            </div>

            {/* Skip Option */}
            <div className="text-center mt-6 pt-6 border-t border-white/10">
              <p className="text-slate-400 text-sm mb-3">
                Already know about AURUM?
              </p>
              <Link href="/application" className="btn-primary inline-block py-3 px-6 text-base">
                → Skip to Application
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Why Choose AURUM?</h2>
          <p className="section-subtitle">
            Built by experienced professionals with a measured, realistic approach
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { 
                icon: Shield, 
                title: "Institutional-Grade Risk Management",
                desc: "Advanced algorithms protect your capital while maximizing growth potential."
              },
              { 
                icon: Clock, 
                title: "True Automation",
                desc: "Set it once and let AI handle the heavy lifting. No manual trading required."
              },
              { 
                icon: TrendingUp, 
                title: "Realistic Expectations",
                desc: "No hype, no false promises. Just sustainable, data-driven growth strategies."
              }
            ].map((feature, i) => (
              <div key={i} className="card text-center hover:border-accent/50 transition-all">
                <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="section-title">Frequently Asked Questions</h2>
          
          <div className="space-y-4 mt-8">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="card p-0 overflow-hidden cursor-pointer hover:border-accent/30 transition-all"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between p-6">
                  <h3 className="font-semibold text-lg pr-4">{faq.question}</h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`}
                  />
                </div>
                <div 
                  className={`transition-all duration-300 ${activeFaq === i ? 'max-h-40 pb-6 px-6' : 'max-h-0'}`}
                >
                  <p className="text-slate-400">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="card max-w-3xl mx-auto text-center bg-gradient-to-br from-secondary to-primary">
            <h3 className="text-2xl font-bold mb-3">Need Help Getting Started?</h3>
            <p className="text-slate-400 mb-8">
              Our team is here to guide you through every step
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-3 text-slate-400">
                <Mail className="w-5 h-5 text-accent" />
                <span>support@theaifinancebreakdown.com</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Calendar className="w-5 h-5 text-accent" />
                <span>Book a 10-min Call</span>
              </div>
            </div>

            <Link href="/application" className="btn-primary inline-block">
              Schedule a Call →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 mb-6">
            &copy; {new Date().getFullYear()} AURUM AI. All rights reserved.
          </p>
          
          <div className="bg-white/5 rounded-xl p-6 text-sm text-slate-500 max-w-3xl mx-auto mb-6">
            <p className="mb-3">
              <strong className="text-slate-400">Educational Purposes Only:</strong> This content is for educational and informational purposes only. 
              Past performance does not guarantee future results. All investments carry risk. 
              Please do your own independent research and consult with financial professionals before making investment decisions.
            </p>
            <p>
              <strong className="text-slate-400">No Earnings Claims:</strong> We do not make earnings claims or guarantee specific results. 
              Your results depend on numerous factors beyond our control.
            </p>
          </div>

          <div className="flex justify-center gap-4 text-sm">
            <Link href="#" className="text-accent hover:underline">Privacy Policy</Link>
            <span className="text-slate-600">|</span>
            <Link href="#" className="text-accent hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
