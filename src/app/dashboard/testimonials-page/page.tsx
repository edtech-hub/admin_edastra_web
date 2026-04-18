"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopBar from '@/components/layout/TopBar'
import api from '@/lib/api'
import Image from 'next/image'

interface Testimonial {
  id: string
  title: string
  review: string
  reviewerName: string
  reviewerDesignation: string
  reviewerCompany: string
  reviewerImage: string
  rating: number
  isVisible?: boolean
}

interface HeaderData {
  subtitle: string
  title: string
  titleHighlight: string
}

interface StatsData {
  projectsDelivered: string
  clientSatisfaction: string
  yearsExperience: string
}

const initialFormState = {
  title: '',
  review: '',
  reviewerName: '',
  reviewerDesignation: '',
  reviewerCompany: '',
  reviewerImage: '',
  rating: 5,
}

const defaultHeader: HeaderData = {
  subtitle: 'CLIENT STORIES',
  title: 'What Our',
  titleHighlight: 'Clients Say',
}

const defaultStats: StatsData = {
  projectsDelivered: '3+',
  clientSatisfaction: '100%',
  yearsExperience: '2 yrs',
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    title: 'WeddingClickz — Premium Studio Website',
    review: "I needed a website that would match the premium quality of my photography work, and what was delivered completely blew me away. The landing page for WeddingClickz is sleek, cinematic, and instantly gives potential clients in India and Dubai the confidence that they're dealing with a high-end studio. Since launching, my inquiry rate has gone up significantly and couples regularly tell me the website was what convinced them to reach out. It's not just a website — it's my best salesperson.",
    reviewerName: 'Karthik',
    reviewerDesignation: 'Founder',
    reviewerCompany: 'WeddingClickz',
    reviewerImage: '',
    rating: 5,
    isVisible: true,
  },
  {
    id: '2',
    title: 'Flow Hydration — E-commerce Platform',
    review: "We were launching a new hydration brand in India and needed an e-commerce site that looked clean, premium, and converted visitors into buyers. The final product was exactly that — a sharp, modern storefront with seamless product pages, a smooth checkout flow, and a design that makes our brand look like it belongs next to the biggest names in the wellness space. Couldn't have asked for a better launch partner.",
    reviewerName: 'Aditya',
    reviewerDesignation: 'Founder',
    reviewerCompany: 'Flow Hydration',
    reviewerImage: '',
    rating: 5,
    isVisible: true,
  },
  {
    id: '3',
    title: 'Ticgetz — Event Ticketing Platform',
    review: "Building a ticketing platform from scratch is no joke — there are a hundred moving parts. But the team took my vision for Ticgetz and turned it into a fully functional event booking platform that is intuitive for both event organizers and attendees. The UI is clean, the booking flow is frictionless, and it just works. We went from an idea to a live product faster than I ever expected.",
    reviewerName: 'Trishar',
    reviewerDesignation: 'Founder',
    reviewerCompany: 'Ticgetz',
    reviewerImage: '',
    rating: 5,
    isVisible: true,
  },
  {
    id: '4',
    title: 'WeddingClickz — Quotation Tool',
    review: "The quotation tool has been a total game-changer for our wedding photography business. Couples can now select their events, pick their services, and get a professional quote emailed to them instantly — no back-and-forth, no manual calculations. We have generated over 400 quotes through this tool already, and it has dramatically reduced the time I spend on inquiries while actually increasing our conversion rate.",
    reviewerName: 'Yashas',
    reviewerDesignation: 'Co-Founder',
    reviewerCompany: 'WeddingClickz',
    reviewerImage: '',
    rating: 5,
    isVisible: true,
  },
  {
    id: '5',
    title: 'Reno Research — Interior Design Platform',
    review: "Reno Research needed a platform that could intelligently match homeowners in Singapore with the right interior designers — not just a random directory, but something algorithm-driven and genuinely useful. What was delivered is a comprehensive platform with hundreds of verified vendors, project showcases, and a smart quote-request system. The site has become a trusted name in Singapore's renovation space.",
    reviewerName: 'Zeon',
    reviewerDesignation: 'Founder',
    reviewerCompany: 'Reno Research',
    reviewerImage: '',
    rating: 5,
    isVisible: true,
  },
]

export default function TestimonialsPageDedicated() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [header, setHeader] = useState<HeaderData>(defaultHeader)
  const [stats, setStats] = useState<StatsData>(defaultStats)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Testimonial | null>(null)
  const [newTestimonial, setNewTestimonial] = useState(initialFormState)
  const [newImagePreview, setNewImagePreview] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const newFileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await api.get('/settings')
      const settings = response.data.data

      const testimonialsSettings = settings.find((s: { key: string }) => s.key === 'testimonials_page_items')
      const headerSettings = settings.find((s: { key: string }) => s.key === 'testimonials_page_header')
      const statsSettings = settings.find((s: { key: string }) => s.key === 'testimonials_page_stats')

      if (testimonialsSettings?.value && testimonialsSettings.value.length > 0) {
        setTestimonials(testimonialsSettings.value)
      } else {
        setTestimonials(defaultTestimonials)
      }
      if (headerSettings?.value) {
        setHeader(headerSettings.value)
      }
      if (statsSettings?.value) {
        setStats(statsSettings.value)
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      setTestimonials(defaultTestimonials)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  const saveTestimonials = async (updatedTestimonials: Testimonial[]) => {
    setIsSaving(true)
    try {
      await api.put('/settings', {
        key: 'testimonials_page_items',
        value: updatedTestimonials,
        description: 'Testimonials page items'
      })
      setTestimonials(updatedTestimonials)
    } catch (error) {
      console.error('Error saving testimonials:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const saveHeader = async (updatedHeader: HeaderData) => {
    try {
      await api.put('/settings', {
        key: 'testimonials_page_header',
        value: updatedHeader,
        description: 'Testimonials page header'
      })
      setHeader(updatedHeader)
    } catch (error) {
      console.error('Error saving header:', error)
    }
  }

  const saveStats = async (updatedStats: StatsData) => {
    try {
      await api.put('/settings', {
        key: 'testimonials_page_stats',
        value: updatedStats,
        description: 'Testimonials page stats'
      })
      setStats(updatedStats)
    } catch (error) {
      console.error('Error saving stats:', error)
    }
  }

  const handleHeaderChange = (field: keyof HeaderData, value: string) => {
    const updated = { ...header, [field]: value }
    setHeader(updated)
  }

  const handleHeaderBlur = () => {
    saveHeader(header)
  }

  const handleStatsChange = (field: keyof StatsData, value: string) => {
    const updated = { ...stats, [field]: value }
    setStats(updated)
  }

  const handleStatsBlur = () => {
    saveStats(stats)
  }

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setNewImagePreview(base64)
        setNewTestimonial({ ...newTestimonial, reviewerImage: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && editData) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setEditData({ ...editData, reviewerImage: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddTestimonial = async () => {
    if (!newTestimonial.reviewerName || !newTestimonial.review) return
    const testimonial: Testimonial = {
      id: Date.now().toString(),
      ...newTestimonial,
      isVisible: true,
    }
    await saveTestimonials([...testimonials, testimonial])
    setNewTestimonial(initialFormState)
    setNewImagePreview('')
    setAddSuccess(true)
    setTimeout(() => setAddSuccess(false), 3000)
  }

  const startEditing = (testimonial: Testimonial) => {
    setEditingId(testimonial.id)
    setEditData({ ...testimonial })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditData(null)
  }

  const saveEdit = () => {
    if (!editData) return
    const updatedTestimonials = testimonials.map(t =>
      t.id === editData.id ? editData : t
    )
    saveTestimonials(updatedTestimonials)
    setEditingId(null)
    setEditData(null)
  }

  const handleDeleteTestimonial = (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      const updatedTestimonials = testimonials.filter(t => t.id !== id)
      saveTestimonials(updatedTestimonials)
    }
  }

  const handleToggleVisibility = (id: string) => {
    const updatedTestimonials = testimonials.map(t =>
      t.id === id ? { ...t, isVisible: !t.isVisible } : t
    )
    saveTestimonials(updatedTestimonials)
  }

  const handleResetToDefault = () => {
    if (confirm('This will replace all current testimonials with the defaults. Continue?')) {
      saveTestimonials(defaultTestimonials)
      saveHeader(defaultHeader)
      saveStats(defaultStats)
    }
  }

  const visibleTestimonials = testimonials.filter(t => t.isVisible !== false)

  // Render stars
  const renderStars = (rating: number, size: string = 'w-3 h-3') => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`${size} ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )

  if (isLoading) {
    return (
      <DashboardLayout>
        <TopBar title="Website Controls" subtitle="Testimonials" />
        <div className="p-6">
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <TopBar title="Website Controls" subtitle="Testimonials" />
      <div className="p-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Column - Controls */}
          <div className="flex-1 space-y-6">

            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Header</h2>
                <button
                  onClick={handleResetToDefault}
                  className="text-xs text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset to defaults
                </button>
              </div>

              <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-4 space-y-4">
                {/* Subtitle */}
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1.5">Subtitle</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={header.subtitle}
                      onChange={(e) => handleHeaderChange('subtitle', e.target.value)}
                      onBlur={handleHeaderBlur}
                      className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                      placeholder="e.g. CLIENT STORIES"
                    />
                    <button className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1.5">Title</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={header.title}
                      onChange={(e) => handleHeaderChange('title', e.target.value)}
                      onBlur={handleHeaderBlur}
                      className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                      placeholder="e.g. What Our"
                    />
                    <button className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Title Highlight */}
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1.5">Title Highlight (colored text)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={header.titleHighlight}
                      onChange={(e) => handleHeaderChange('titleHighlight', e.target.value)}
                      onBlur={handleHeaderBlur}
                      className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                      placeholder="e.g. Clients Say"
                    />
                    <button className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Stats Bar</h2>

              <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1.5">Projects Delivered</label>
                    <input
                      type="text"
                      value={stats.projectsDelivered}
                      onChange={(e) => handleStatsChange('projectsDelivered', e.target.value)}
                      onBlur={handleStatsBlur}
                      className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                      placeholder="3+"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1.5">Client Satisfaction</label>
                    <input
                      type="text"
                      value={stats.clientSatisfaction}
                      onChange={(e) => handleStatsChange('clientSatisfaction', e.target.value)}
                      onBlur={handleStatsBlur}
                      className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                      placeholder="100%"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1.5">Experience</label>
                    <input
                      type="text"
                      value={stats.yearsExperience}
                      onChange={(e) => handleStatsChange('yearsExperience', e.target.value)}
                      onBlur={handleStatsBlur}
                      className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                      placeholder="2 yrs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonials Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Testimonials</h2>
                {isSaving && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </div>
                )}
              </div>

              {/* Testimonial Cards */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {testimonials.map((testimonial, index) => (
                  <div key={testimonial.id} className={`bg-[#1a1a1a] border rounded-xl overflow-hidden ${testimonial.isVisible === false ? 'border-amber-500/20 opacity-60' : 'border-white/[0.06]'}`}>
                    {/* Testimonial Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.04]">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-white">
                          Review {index + 1} - {testimonial.reviewerName}
                        </span>
                        {renderStars(testimonial.rating || 5, 'w-2.5 h-2.5')}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleVisibility(testimonial.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${testimonial.isVisible !== false
                              ? 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white'
                              : 'bg-amber-500/20 text-amber-400'
                            }`}
                          title={testimonial.isVisible !== false ? "Hide" : "Show"}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {testimonial.isVisible !== false ? (
                              <>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </>
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => editingId === testimonial.id ? cancelEditing() : startEditing(testimonial)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${editingId === testimonial.id
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white'
                            }`}
                          title="Edit"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Edit Form */}
                    {editingId === testimonial.id && editData && (
                      <div className="p-4 space-y-3">
                        <p className="text-xs text-gray-500 mb-2">Edit Testimonial</p>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Project/Title</label>
                          <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                            placeholder="Project name"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Review</label>
                          <textarea
                            value={editData.review}
                            onChange={(e) => setEditData({ ...editData, review: e.target.value })}
                            rows={3}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 resize-none"
                            placeholder="The review text"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Reviewer Name</label>
                            <input
                              type="text"
                              value={editData.reviewerName}
                              onChange={(e) => setEditData({ ...editData, reviewerName: e.target.value })}
                              className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                              placeholder="Name"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Designation</label>
                            <input
                              type="text"
                              value={editData.reviewerDesignation}
                              onChange={(e) => setEditData({ ...editData, reviewerDesignation: e.target.value })}
                              className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                              placeholder="Founder, CEO, etc."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Company</label>
                            <input
                              type="text"
                              value={editData.reviewerCompany}
                              onChange={(e) => setEditData({ ...editData, reviewerCompany: e.target.value })}
                              className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                              placeholder="Company name"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Rating</label>
                            <select
                              value={editData.rating || 5}
                              onChange={(e) => setEditData({ ...editData, rating: parseInt(e.target.value) })}
                              className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                            >
                              {[5, 4, 3, 2, 1].map(r => (
                                <option key={r} value={r}>{r} Stars</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Reviewer Image</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editData.reviewerImage ? '1 image attached' : 'No image (will use initials)'}
                              readOnly
                              className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white cursor-default"
                            />
                            <input ref={editFileInputRef} type="file" accept="image/*" onChange={handleEditImageChange} className="hidden" />
                            <button
                              onClick={() => editFileInputRef.current?.click()}
                              className="w-9 h-9 rounded-lg bg-[#252525] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:border-emerald-500/30 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                            </button>
                            {editData.reviewerImage && (
                              <button
                                onClick={() => setEditData({ ...editData, reviewerImage: '' })}
                                className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
                                title="Remove image"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={cancelEditing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white text-xs transition-colors border border-white/[0.06]"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveEdit}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save changes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Testimonial Form */}
              <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-sm font-medium text-white">Add Testimonial</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${showAddForm ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showAddForm && (
                  <div className="p-4 space-y-3 border-t border-white/[0.04]">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1.5">Project/Title</label>
                      <input
                        type="text"
                        value={newTestimonial.title}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, title: e.target.value })}
                        className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
                        placeholder="Project name or title"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1.5">Review</label>
                      <textarea
                        value={newTestimonial.review}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, review: e.target.value })}
                        rows={3}
                        className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30 resize-none"
                        placeholder="The review content"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Reviewer Name</label>
                        <input
                          type="text"
                          value={newTestimonial.reviewerName}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, reviewerName: e.target.value })}
                          className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
                          placeholder="Name"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Designation</label>
                        <input
                          type="text"
                          value={newTestimonial.reviewerDesignation}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, reviewerDesignation: e.target.value })}
                          className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
                          placeholder="Founder, CEO, etc."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Company</label>
                        <input
                          type="text"
                          value={newTestimonial.reviewerCompany}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, reviewerCompany: e.target.value })}
                          className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
                          placeholder="Company name"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Rating</label>
                        <select
                          value={newTestimonial.rating}
                          onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) })}
                          className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                        >
                          {[5, 4, 3, 2, 1].map(r => (
                            <option key={r} value={r}>{r} Stars</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1.5">Reviewer Image (optional)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newImagePreview ? '1 image attached' : ''}
                          readOnly
                          className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 cursor-default"
                          placeholder="Upload an image or leave blank for initials"
                        />
                        <input ref={newFileInputRef} type="file" accept="image/*" onChange={handleNewImageChange} className="hidden" />
                        <button
                          onClick={() => newFileInputRef.current?.click()}
                          className="w-10 h-10 rounded-lg bg-[#252525] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:border-emerald-500/30 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                        </button>
                      </div>
                      {newImagePreview && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden">
                            <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-xs text-emerald-400">✓ Image ready</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setNewTestimonial(initialFormState)
                          setNewImagePreview('')
                          setShowAddForm(false)
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white text-sm transition-colors border border-white/[0.06]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddTestimonial}
                        disabled={!newTestimonial.reviewerName || !newTestimonial.review || isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        {isSaving ? 'Adding...' : 'Add testimonial'}
                      </button>
                    </div>

                    {addSuccess && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-emerald-400">Testimonial added successfully!</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="xl:w-[400px] space-y-4">
            <h2 className="text-xs text-gray-500 uppercase tracking-wide">PREVIEW</h2>

            {/* Website Preview */}
            <div className="bg-[#1e1e1e] border border-white/[0.06] rounded-xl overflow-hidden">
              {/* Browser-like header */}
              <div className="px-3 py-2 bg-[#252525] border-b border-white/[0.04] flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 bg-[#1a1a1a] rounded px-2 py-1 text-[10px] text-gray-500 truncate">
                  edastra.in/testimonials
                </div>
              </div>

              {/* Preview Content - Testimonials Page */}
              <div className="p-4 bg-gradient-to-b from-[#0a1015] to-[#0d1318] min-h-[500px]">
                {/* Navigation preview */}
                <div className="flex items-center justify-between mb-6 text-[8px]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
                    <span className="text-white font-medium">EDASTRA</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <span>Services</span>
                    <span>Our Work</span>
                    <span className="text-emerald-400">Testimonials</span>
                    <span>About Us</span>
                    <span>Contact</span>
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-6">
                  <span className="text-[8px] text-emerald-400 uppercase tracking-wider">{header.subtitle}</span>
                  <h1 className="text-xl font-bold mt-1">
                    <span className="text-white">{header.title}</span>{' '}
                    <span className="text-emerald-400">{header.titleHighlight}</span>
                  </h1>
                </div>

                {/* Testimonials Grid Preview */}
                <div className="space-y-3">
                  {visibleTestimonials.slice(0, 3).map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="bg-gradient-to-br from-[#1a2530]/80 to-[#0d1820]/80 rounded-lg p-3 border border-white/5"
                    >
                      {/* Stars */}
                      <div className="flex gap-0.5 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-2.5 h-2.5 ${i < (testimonial.rating || 5) ? 'text-yellow-400' : 'text-gray-600'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>

                      {/* Review text */}
                      <p className="text-[8px] text-gray-400 line-clamp-2 mb-2">&quot;{testimonial.review}&quot;</p>

                      {/* Reviewer */}
                      <div className="flex items-center gap-2">
                        {testimonial.reviewerImage ? (
                          <div className="w-6 h-6 rounded-full overflow-hidden">
                            <Image
                              src={testimonial.reviewerImage}
                              alt={testimonial.reviewerName}
                              width={24}
                              height={24}
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <span className="text-white text-[8px] font-bold">
                              {testimonial.reviewerName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-[9px] text-white font-medium">{testimonial.reviewerName}</p>
                          <p className="text-[7px] text-gray-500">
                            {testimonial.reviewerDesignation}, {testimonial.reviewerCompany}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats Bar Preview */}
                <div className="mt-6 flex items-center justify-center gap-4 py-3 px-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-emerald-400">{stats.projectsDelivered}</p>
                    <p className="text-[7px] text-gray-500">Projects Delivered</p>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-emerald-400">{stats.clientSatisfaction}</p>
                    <p className="text-[7px] text-gray-500">Client Satisfaction</p>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-emerald-400">{stats.yearsExperience}</p>
                    <p className="text-[7px] text-gray-500">Experience</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Single Testimonial Preview (when editing) */}
            {editingId && editData && (
              <div className="bg-[#1e1e1e] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-3 py-2 bg-[#252525] border-b border-white/[0.04]">
                  <span className="text-[10px] text-gray-500">Testimonial Preview</span>
                </div>
                <div className="p-4 bg-gradient-to-b from-[#0a1015] to-[#0d1318]">
                  <div className="bg-gradient-to-br from-[#1a2530] to-[#0d1820] rounded-xl p-4 border border-white/10">
                    {/* Stars */}
                    {renderStars(editData.rating || 5, 'w-4 h-4')}

                    {/* Review */}
                    <p className="text-[11px] text-gray-300 mt-3 leading-relaxed">
                      &quot;{editData.review}&quot;
                    </p>

                    {/* Reviewer */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                      {editData.reviewerImage ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <Image
                            src={editData.reviewerImage}
                            alt={editData.reviewerName}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {editData.reviewerName.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-white font-medium">{editData.reviewerName}</p>
                        <p className="text-[10px] text-gray-500">
                          {editData.reviewerDesignation}, {editData.reviewerCompany}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">{visibleTestimonials.length}</p>
                <p className="text-[10px] text-gray-400 mt-1">Visible Reviews</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{testimonials.length - visibleTestimonials.length}</p>
                <p className="text-[10px] text-gray-400 mt-1">Hidden</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
