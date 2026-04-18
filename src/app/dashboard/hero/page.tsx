"use client"

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopBar from '@/components/layout/TopBar'
import api from '@/lib/api'

interface HeroData {
  tagline: string
  title: string
  titleHighlight: string
  subtitle: string
  button1Text: string
  button1Link: string
  button2Text: string
  button2Link: string
  backgroundImage: string
}

interface MarqueeData {
  items: string[]
}

const defaultHeroData: HeroData = {
  tagline: 'AI-Powered Development Agency',
  title: 'Empowering the ideas that',
  titleHighlight: 'shape your vision',
  subtitle: 'We combine deep technical expertise with AI-accelerated workflows to ship production-ready mobile apps, web applications and scalable software — in weeks, not months.',
  button1Text: 'Book Free Consultation',
  button1Link: '/contact',
  button2Text: 'View Our Work',
  button2Link: '/our-work',
  backgroundImage: '',
}

const defaultMarquee: MarqueeData = {
  items: [
    'Strategy',
    'Design',
    'UI UX Design',
    'User Understanding',
    'Coding',
    'Front-end Development',
    'Back-end Development',
    'Integration',
    'App Development',
    'Website Development',
  ],
}

export default function HeroPage() {
  const [heroData, setHeroData] = useState<HeroData>(defaultHeroData)
  const [marquee, setMarquee] = useState<MarqueeData>(defaultMarquee)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<HeroData>(defaultHeroData)
  const [newMarqueeItem, setNewMarqueeItem] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get('/settings')
      const settings = response.data.data

      const heroSettings = settings.find((s: { key: string }) => s.key === 'hero_section')
      const marqueeSettings = settings.find((s: { key: string }) => s.key === 'hero_marquee')

      if (heroSettings?.value) {
        setHeroData(heroSettings.value)
        setEditData(heroSettings.value)
      }
      if (marqueeSettings?.value) {
        setMarquee(marqueeSettings.value)
      }
    } catch (error) {
      console.error('Error fetching hero data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const saveHeroData = async (data: HeroData) => {
    setIsSaving(true)
    try {
      await api.put('/settings', {
        key: 'hero_section',
        value: data,
        description: 'Hero section content'
      })
      setHeroData(data)
    } catch (error) {
      console.error('Error saving hero data:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const saveMarquee = async (data: MarqueeData) => {
    try {
      await api.put('/settings', {
        key: 'hero_marquee',
        value: data,
        description: 'Hero section marquee items'
      })
      setMarquee(data)
    } catch (error) {
      console.error('Error saving marquee:', error)
    }
  }

  const handleStartEdit = () => {
    setEditData({ ...heroData })
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setEditData({ ...heroData })
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    await saveHeroData(editData)
    setIsEditing(false)
  }

  const handleAddMarqueeItem = () => {
    if (newMarqueeItem.trim() && !marquee.items.includes(newMarqueeItem.trim())) {
      const updated = { ...marquee, items: [...marquee.items, newMarqueeItem.trim()] }
      setMarquee(updated)
      saveMarquee(updated)
      setNewMarqueeItem('')
    }
  }

  const handleRemoveMarqueeItem = (item: string) => {
    const updated = { ...marquee, items: marquee.items.filter(i => i !== item) }
    setMarquee(updated)
    saveMarquee(updated)
  }

  const handleResetToDefault = () => {
    if (confirm('This will replace all current data with defaults. Continue?')) {
      saveHeroData(defaultHeroData)
      saveMarquee(defaultMarquee)
      setEditData(defaultHeroData)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <TopBar title="Hero Section" subtitle="Customize your homepage content with ease" />
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
      <TopBar title="Hero Section" subtitle="Customize your homepage content with ease" />
      <div className="p-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Column - Form */}
          <div className="flex-1 space-y-6">

            {/* Hero Content Section */}
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Hero Content</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetToDefault}
                    className="text-xs text-gray-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                  </button>
                  {!isEditing ? (
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white text-xs transition-colors border border-white/[0.06]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white text-xs font-medium transition-colors"
                      >
                        {isSaving ? (
                          <>
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-[10px] text-gray-500 mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={isEditing ? editData.tagline : heroData.tagline}
                  onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30 ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  placeholder="AI-Powered Development Agency"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10px] text-gray-500 mb-1.5">Title</label>
                <input
                  type="text"
                  value={isEditing ? editData.title : heroData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white italic placeholder-gray-500 focus:outline-none focus:border-emerald-500/30 ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  placeholder="Transform Ideas Into"
                />
              </div>

              {/* Title Highlight */}
              <div>
                <label className="block text-[10px] text-gray-500 mb-1.5">Title Highlight (colored text)</label>
                <input
                  type="text"
                  value={isEditing ? editData.titleHighlight : heroData.titleHighlight}
                  onChange={(e) => setEditData({ ...editData, titleHighlight: e.target.value })}
                  disabled={!isEditing}
                  className={`w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-emerald-400 italic placeholder-gray-500 focus:outline-none focus:border-emerald-500/30 ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  placeholder="Real Products"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-[10px] text-gray-500 mb-1.5">Subtitle</label>
                <textarea
                  value={isEditing ? editData.subtitle : heroData.subtitle}
                  onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className={`w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30 resize-none ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                  placeholder="We combine deep technical expertise..."
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1.5">Button 1</label>
                  <input
                    type="text"
                    value={isEditing ? editData.button1Text : heroData.button1Text}
                    onChange={(e) => setEditData({ ...editData, button1Text: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30 ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    placeholder="Book Free Consultation"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1.5">Button 2</label>
                  <input
                    type="text"
                    value={isEditing ? editData.button2Text : heroData.button2Text}
                    onChange={(e) => setEditData({ ...editData, button2Text: e.target.value })}
                    disabled={!isEditing}
                    className={`w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30 ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    placeholder="View Our Work"
                  />
                </div>
              </div>

              {/* Button Links (shown only when editing) */}
              {isEditing && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1.5">Button 1 Link</label>
                    <input
                      type="text"
                      value={editData.button1Link}
                      onChange={(e) => setEditData({ ...editData, button1Link: e.target.value })}
                      className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                      placeholder="/contact"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1.5">Button 2 Link</label>
                    <input
                      type="text"
                      value={editData.button2Link}
                      onChange={(e) => setEditData({ ...editData, button2Link: e.target.value })}
                      className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                      placeholder="/our-work"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Skills Marquee Section */}
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-5 space-y-4">
              <h2 className="text-lg font-semibold text-white">Skills Marquee</h2>
              <p className="text-xs text-gray-500">These skills scroll across the hero section</p>

              <div className="flex flex-wrap gap-2">
                {marquee.items.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#252525] border border-white/[0.06] text-xs text-white"
                  >
                    {item}
                    <button
                      onClick={() => handleRemoveMarqueeItem(item)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={newMarqueeItem}
                    onChange={(e) => setNewMarqueeItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMarqueeItem()}
                    className="w-28 bg-[#252525] border border-white/[0.06] rounded-full px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
                    placeholder="Add skill..."
                  />
                  <button
                    onClick={handleAddMarqueeItem}
                    className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="xl:w-[450px] space-y-4">
            <h2 className="text-xs text-gray-500 uppercase tracking-wide">PREVIEW</h2>

            {/* Website Preview */}
            <div className="bg-[#1e1e1e] border border-white/[0.06] rounded-xl overflow-hidden">
              {/* Browser header */}
              <div className="px-3 py-2 bg-[#252525] border-b border-white/[0.04] flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 bg-[#1a1a1a] rounded px-2 py-1 text-[10px] text-gray-500 truncate">
                  edastra.in
                </div>
              </div>

              {/* Preview Content */}
              <div className="relative bg-[#030a0f] min-h-[420px] overflow-hidden">
                {/* Network/Particle Background Effect */}
                <div className="absolute inset-0">
                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 via-transparent to-transparent" />
                  <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/3 rounded-full blur-2xl" />

                  {/* Particle dots */}
                  <div className="absolute top-12 left-8 w-1 h-1 bg-emerald-400/60 rounded-full" />
                  <div className="absolute top-20 left-16 w-1.5 h-1.5 bg-emerald-400/40 rounded-full" />
                  <div className="absolute top-16 right-20 w-1 h-1 bg-emerald-400/50 rounded-full" />
                  <div className="absolute top-32 right-12 w-2 h-2 bg-emerald-400/30 rounded-full" />
                  <div className="absolute top-40 left-24 w-1 h-1 bg-emerald-400/40 rounded-full" />
                  <div className="absolute bottom-32 left-12 w-1.5 h-1.5 bg-emerald-400/50 rounded-full" />
                  <div className="absolute bottom-24 right-16 w-1 h-1 bg-emerald-400/60 rounded-full" />
                  <div className="absolute bottom-40 left-32 w-2 h-2 bg-emerald-400/20 rounded-full" />

                  {/* Connection lines (simplified) */}
                  <svg className="absolute inset-0 w-full h-full opacity-20">
                    <line x1="10%" y1="15%" x2="25%" y2="25%" stroke="#10b981" strokeWidth="0.5" />
                    <line x1="25%" y1="25%" x2="15%" y2="40%" stroke="#10b981" strokeWidth="0.5" />
                    <line x1="80%" y1="20%" x2="90%" y2="35%" stroke="#10b981" strokeWidth="0.5" />
                    <line x1="75%" y1="60%" x2="85%" y2="75%" stroke="#10b981" strokeWidth="0.5" />
                    <line x1="20%" y1="70%" x2="35%" y2="80%" stroke="#10b981" strokeWidth="0.5" />
                  </svg>
                </div>

                {/* Navigation */}
                <div className="relative z-10 flex items-center justify-between px-4 py-3 text-[8px]">
                  <span className="text-white font-semibold">Ed-Astra</span>
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="text-emerald-400 border-b border-emerald-400 pb-0.5">Home</span>
                    <span>Services</span>
                    <span>Our Work</span>
                    <span>About Us</span>
                    <span>Testimonials</span>
                    <span>Contact</span>
                    <span className="px-2 py-1 bg-emerald-500 text-white rounded text-[7px]">Book Consultation</span>
                  </div>
                </div>

                {/* Hero Content - Centered */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-12 pb-20">
                  {/* Tagline Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[9px] text-emerald-400">{isEditing ? editData.tagline : heroData.tagline}</span>
                  </div>

                  {/* Title */}
                  <h1 className="text-[22px] font-bold leading-tight mb-1 italic">
                    <span className="text-white">{isEditing ? editData.title : heroData.title}</span>
                  </h1>
                  <h1 className="text-[22px] font-bold leading-tight mb-4 italic">
                    <span className="text-emerald-400">{isEditing ? editData.titleHighlight : heroData.titleHighlight}</span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-[9px] text-gray-400 leading-relaxed mb-6 max-w-[320px]">
                    {(() => {
                      const text = isEditing ? editData.subtitle : heroData.subtitle
                      const highlightPhrase = '— in weeks, not months.'
                      if (text.includes(highlightPhrase)) {
                        const parts = text.split(highlightPhrase)
                        return (
                          <>
                            {parts[0]}
                            <span className="text-emerald-400">— in weeks, not months.</span>
                            {parts[1]}
                          </>
                        )
                      }
                      return text
                    })()}
                  </p>

                  {/* Buttons */}
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-medium rounded-lg transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                      {isEditing ? editData.button1Text : heroData.button1Text}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                    <button className="px-4 py-2 bg-transparent hover:bg-white/5 text-white text-[9px] font-medium rounded-lg border border-white/20 transition-colors">
                      {isEditing ? editData.button2Text : heroData.button2Text}
                    </button>
                  </div>
                </div>

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">{marquee.items.length}</p>
                <p className="text-[10px] text-gray-400 mt-1">Skills in Marquee</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">2</p>
                <p className="text-[10px] text-gray-400 mt-1">CTA Buttons</p>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-amber-400 font-medium">Tips</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Keep the title short and impactful. The subtitle can elaborate on your value proposition. Use action-oriented button text.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
