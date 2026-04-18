"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopBar from '@/components/layout/TopBar'
import api from '@/lib/api'

interface Testimonial {
  id: string
  title: string
  review: string
  reviewerName: string
  reviewerDesignation: string
  reviewerCompany: string
  reviewerImage: string
  isArchived?: boolean
}

const initialFormState = {
  title: '',
  review: '',
  reviewerName: '',
  reviewerDesignation: '',
  reviewerCompany: '',
  reviewerImage: '',
}

// Default testimonials from edastra.in website
const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    title: 'WeddingClickz — Premium Studio Website',
    review: "I needed a website that would match the premium quality of my photography work, and what was delivered completely blew me away. The landing page for WeddingClickz is sleek, cinematic, and instantly gives potential clients in India and Dubai the confidence that they're dealing with a high-end studio. Since launching, my inquiry rate has gone up significantly and couples regularly tell me the website was what convinced them to reach out. It's not just a website — it's my best salesperson.",
    reviewerName: 'Karthik',
    reviewerDesignation: 'Founder',
    reviewerCompany: 'WeddingClickz',
    reviewerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  },
  {
    id: '2',
    title: 'Flow Hydration — E-commerce Platform',
    review: "We were launching a new hydration brand in India and needed an e-commerce site that looked clean, premium, and converted visitors into buyers. The final product was exactly that — a sharp, modern storefront with seamless product pages, a smooth checkout flow, and a design that makes our brand look like it belongs next to the biggest names in the wellness space. Couldn't have asked for a better launch partner.",
    reviewerName: 'Aditya',
    reviewerDesignation: 'Founder',
    reviewerCompany: 'Flow Hydration',
    reviewerImage: '',
  },
  {
    id: '3',
    title: 'Ticgetz — Event Ticketing Platform',
    review: "Building a ticketing platform from scratch is no joke — there are a hundred moving parts. But the team took my vision for Ticgetz and turned it into a fully functional event booking platform that is intuitive for both event organizers and attendees. The UI is clean, the booking flow is frictionless, and it just works. We went from an idea to a live product faster than I ever expected.",
    reviewerName: 'Trishar',
    reviewerDesignation: 'Founder',
    reviewerCompany: 'Ticgetz',
    reviewerImage: '',
  },
  {
    id: '4',
    title: 'WeddingClickz — Quotation Tool',
    review: "The quotation tool has been a total game-changer for our wedding photography business. Couples can now select their events, pick their services, and get a professional quote emailed to them instantly — no back-and-forth, no manual calculations. We have generated over 400 quotes through this tool already, and it has dramatically reduced the time I spend on inquiries while actually increasing our conversion rate.",
    reviewerName: 'Yashas',
    reviewerDesignation: 'Co-Founder',
    reviewerCompany: 'WeddingClickz',
    reviewerImage: '',
  },
  {
    id: '5',
    title: 'Reno Research — Interior Design Platform',
    review: "Reno Research needed a platform that could intelligently match homeowners in Singapore with the right interior designers — not just a random directory, but something algorithm-driven and genuinely useful. What was delivered is a comprehensive platform with hundreds of verified vendors, project showcases, and a smart quote-request system. The site has become a trusted name in Singapore's renovation space.",
    reviewerName: 'Zeon',
    reviewerDesignation: 'Founder',
    reviewerCompany: 'Reno Research',
    reviewerImage: '',
  },
]

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [numberOfProjects, setNumberOfProjects] = useState<number>(5)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Testimonial | null>(null)
  const [newTestimonial, setNewTestimonial] = useState(initialFormState)
  const [newImagePreview, setNewImagePreview] = useState('')
  const [addSuccess, setAddSuccess] = useState(false)
  const newFileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Fetch testimonials data from settings
  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await api.get('/settings')
      const settings = response.data.data

      const testimonialsSettings = settings.find((s: { key: string }) => s.key === 'testimonials')
      const countSettings = settings.find((s: { key: string }) => s.key === 'testimonials_count')

      if (testimonialsSettings?.value && testimonialsSettings.value.length > 0) {
        setTestimonials(testimonialsSettings.value)
      } else {
        // Use default testimonials if none exist in database
        setTestimonials(defaultTestimonials)
      }
      if (countSettings?.value) {
        setNumberOfProjects(countSettings.value)
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      // Use default testimonials on error
      setTestimonials(defaultTestimonials)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  // Save testimonials to backend
  const saveTestimonials = async (updatedTestimonials: Testimonial[]) => {
    setIsSaving(true)
    try {
      await api.put('/settings', {
        key: 'testimonials',
        value: updatedTestimonials,
        description: 'Testimonials section content'
      })
      setTestimonials(updatedTestimonials)
    } catch (error) {
      console.error('Error saving testimonials:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Save number of projects displayed
  const saveProjectCount = async (count: number) => {
    try {
      await api.put('/settings', {
        key: 'testimonials_count',
        value: count,
        description: 'Number of testimonials displayed'
      })
    } catch (error) {
      console.error('Error saving count:', error)
    }
  }

  const handleProjectCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0
    setNumberOfProjects(value)
    saveProjectCount(value)
  }

  // Handle new testimonial image
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

  // Handle edit image
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

  // Add new testimonial
  const handleAddTestimonial = async () => {
    if (!newTestimonial.title || !newTestimonial.review || !newTestimonial.reviewerName) {
      return
    }
    const testimonial: Testimonial = {
      id: Date.now().toString(),
      ...newTestimonial,
      isArchived: false
    }
    await saveTestimonials([...testimonials, testimonial])
    setNewTestimonial(initialFormState)
    setNewImagePreview('')
    setAddSuccess(true)
    setTimeout(() => setAddSuccess(false), 3000)
  }

  // Start editing
  const startEditing = (testimonial: Testimonial) => {
    setEditingId(testimonial.id)
    setEditData({ ...testimonial })
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null)
    setEditData(null)
  }

  // Save edit
  const saveEdit = () => {
    if (!editData) return
    const updatedTestimonials = testimonials.map(t =>
      t.id === editData.id ? editData : t
    )
    saveTestimonials(updatedTestimonials)
    setEditingId(null)
    setEditData(null)
  }

  // Delete testimonial
  const handleDeleteTestimonial = (id: string) => {
    const updatedTestimonials = testimonials.filter(t => t.id !== id)
    saveTestimonials(updatedTestimonials)
  }

  // Archive/Unarchive testimonial
  const handleToggleArchive = (id: string) => {
    const updatedTestimonials = testimonials.map(t =>
      t.id === id ? { ...t, isArchived: !t.isArchived } : t
    )
    saveTestimonials(updatedTestimonials)
  }

  // Get active and archived testimonials
  const activeTestimonials = testimonials.filter(t => !t.isArchived)
  const archivedTestimonials = testimonials.filter(t => t.isArchived)

  // Reset to default testimonials from website
  const handleResetToDefault = () => {
    if (confirm('This will replace all current testimonials with the original ones from edastra.in. Continue?')) {
      saveTestimonials(defaultTestimonials)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <TopBar title="Testimonials" subtitle="Customize your testimonial section content with ease" />
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
      <TopBar title="Testimonials" subtitle="Customize your testimonial section content with ease" />
      <div className="p-6 space-y-6">
        {/* Number of testimonials displayed */}
        <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs text-gray-500">Number of testimonials displayed</label>
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
          <input
            type="number"
            value={numberOfProjects}
            onChange={handleProjectCountChange}
            min={1}
            max={20}
            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
          />
        </div>

        {/* Main Grid - Existing Reviews | Add New Review */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Existing Reviews */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Active Reviews ({activeTestimonials.length})</h2>
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

            {activeTestimonials.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-12 text-center">
                <svg className="w-12 h-12 text-gray-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm text-gray-500">No testimonials yet</p>
                <p className="text-xs text-gray-600 mt-1">Add your first testimonial using the form on the right</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
                {activeTestimonials.map((testimonial, index) => (
                  <div key={testimonial.id} className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.04]">
                      <span className="text-sm font-medium text-white">Review {index + 1}</span>
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
                          onClick={() => handleToggleArchive(testimonial.id)}
                          className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-amber-500/20 flex items-center justify-center text-gray-400 hover:text-amber-400 transition-colors"
                          title="Archive"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
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

                    {/* Content / Edit Form */}
                    {editingId === testimonial.id && editData ? (
                      <div className="p-4 space-y-3">
                        <p className="text-xs text-gray-500 mb-2">Edit Review</p>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Title</label>
                          <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Review</label>
                          <textarea
                            value={editData.review}
                            onChange={(e) => setEditData({ ...editData, review: e.target.value })}
                            rows={4}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Name of the reviewer</label>
                          <input
                            type="text"
                            value={editData.reviewerName}
                            onChange={(e) => setEditData({ ...editData, reviewerName: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Designation of the reviewer</label>
                          <input
                            type="text"
                            value={editData.reviewerDesignation}
                            onChange={(e) => setEditData({ ...editData, reviewerDesignation: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Company of the reviewer</label>
                          <input
                            type="text"
                            value={editData.reviewerCompany}
                            onChange={(e) => setEditData({ ...editData, reviewerCompany: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Image of the reviewer</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editData.reviewerImage ? '1 image attached' : 'No image'}
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
                          </div>
                          {editData.reviewerImage && (
                            <div className="mt-1 flex items-center gap-1">
                              <span className="text-emerald-400 text-xs">✓</span>
                              <span className="text-xs text-gray-500">Image ready</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={cancelEditing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white text-xs transition-colors border border-white/[0.06]"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                            </svg>
                            Cancel
                          </button>
                          <button
                            onClick={saveEdit}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 space-y-2">
                        <div className="flex items-start gap-3">
                          {testimonial.reviewerImage && (
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                              <img src={testimonial.reviewerImage} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-white truncate">{testimonial.title}</h3>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{testimonial.review}</p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                              <span className="text-emerald-400">{testimonial.reviewerName}</span>
                              <span>•</span>
                              <span>{testimonial.reviewerDesignation}</span>
                              {testimonial.reviewerCompany && (
                                <>
                                  <span>•</span>
                                  <span>{testimonial.reviewerCompany}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Add New Review */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Add New Review</h2>

            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Title</label>
                <input
                  type="text"
                  value={newTestimonial.title}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, title: e.target.value })}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
                  placeholder="Enter review title"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Review</label>
                <textarea
                  value={newTestimonial.review}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, review: e.target.value })}
                  rows={5}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30 resize-none"
                  placeholder="Enter the review content"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Name of the reviewer</label>
                <input
                  type="text"
                  value={newTestimonial.reviewerName}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, reviewerName: e.target.value })}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Designation of the reviewer</label>
                <input
                  type="text"
                  value={newTestimonial.reviewerDesignation}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, reviewerDesignation: e.target.value })}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
                  placeholder="CEO, Founder, etc."
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Company of the reviewer</label>
                <input
                  type="text"
                  value={newTestimonial.reviewerCompany}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, reviewerCompany: e.target.value })}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
                  placeholder="Company Name"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Image of the reviewer</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newImagePreview ? '1 image attached' : ''}
                    readOnly
                    className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 cursor-default"
                    placeholder="Upload an image"
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
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white text-sm transition-colors border border-white/[0.06]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTestimonial}
                  disabled={!newTestimonial.title || !newTestimonial.review || !newTestimonial.reviewerName || isSaving}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  {isSaving ? 'Adding...' : 'Add Testimonial'}
                </button>
              </div>

              {/* Success Message */}
              {addSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-emerald-400">Testimonial added successfully!</span>
                </div>
              )}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-emerald-400">{activeTestimonials.length}</p>
                <p className="text-xs text-gray-400 mt-1">Active Reviews</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-amber-400">{archivedTestimonials.length}</p>
                <p className="text-xs text-gray-400 mt-1">Archived</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-emerald-400">{numberOfProjects}</p>
                <p className="text-xs text-gray-400 mt-1">Displayed on Site</p>
              </div>
            </div>
          </div>
        </div>

        {/* Archived Reviews Section */}
        {archivedTestimonials.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              Archived Reviews ({archivedTestimonials.length})
            </h2>
            <p className="text-xs text-gray-500">These reviews are hidden from the main website. Unarchive to show them again.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-[#1a1a1a] border border-amber-500/20 rounded-xl overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-amber-500/5 border-b border-amber-500/10">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      <span className="text-xs font-medium text-amber-400">Archived</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                        className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete permanently"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleArchive(testimonial.id)}
                        className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center text-emerald-400 transition-colors"
                        title="Unarchive"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      {testimonial.reviewerImage && (
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                          <img src={testimonial.reviewerImage} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">{testimonial.title}</h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{testimonial.review}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <span className="text-gray-400">{testimonial.reviewerName}</span>
                          <span>•</span>
                          <span>{testimonial.reviewerDesignation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
