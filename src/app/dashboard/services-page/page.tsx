"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopBar from '@/components/layout/TopBar'
import api from '@/lib/api'
import Image from 'next/image'

interface Service {
  id: string
  title: string
  description: string
  image: string
  isExpanded?: boolean
  isVisible?: boolean
}

interface ApproachPhase {
  id: string
  title: string
  icon: string
  steps: string[]
}

interface FAQ {
  id: string
  question: string
  answer: string
  isVisible?: boolean
}

interface HeaderData {
  title: string
  subtitle: string
  description: string
}

interface ApproachData {
  title: string
  subtitle: string
}

interface MarqueeData {
  items: string[]
}

const initialServiceForm = {
  title: '',
  description: '',
  image: '',
}

const initialFAQForm = {
  question: '',
  answer: '',
}

const defaultHeader: HeaderData = {
  title: 'Our Services',
  subtitle: '',
  description: 'We listen carefully, move swiftly, and deliver work that reflects exactly what you came here to build.',
}

const defaultApproachHeader: ApproachData = {
  title: 'Our Approach',
  subtitle: 'Fast enough to keep up. Consistent enough to get it right. Always built around you.',
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

const defaultServices: Service[] = [
  {
    id: '1',
    title: 'Website Development',
    description: 'We bring together a team of highly talented web application developers, business analysts, Scrum masters, and consultants to help you achieve your ideas. A fully customized design process encompassing all aspects of your product.',
    image: '',
    isExpanded: true,
    isVisible: true,
  },
  {
    id: '2',
    title: 'App Development',
    description: 'Native and cross-platform mobile applications built with cutting-edge technologies. From concept to deployment, we create apps that users love.',
    image: '',
    isExpanded: false,
    isVisible: true,
  },
  {
    id: '3',
    title: 'UI UX Design',
    description: 'User-centered design that combines aesthetics with functionality. We create intuitive interfaces that enhance user experience and drive engagement.',
    image: '',
    isExpanded: false,
    isVisible: true,
  },
  {
    id: '4',
    title: 'Social Media Marketing',
    description: 'Strategic social media campaigns that build brand awareness, engage audiences, and drive conversions across all major platforms.',
    image: '',
    isExpanded: false,
    isVisible: true,
  },
]

const defaultApproachPhases: ApproachPhase[] = [
  {
    id: '1',
    title: 'Insights',
    icon: '💡',
    steps: ['Briefing', 'Analytics', 'Goals', 'Specification', 'Approval'],
  },
  {
    id: '2',
    title: 'Design',
    icon: '🎨',
    steps: ['Research', 'Idea Preparation', 'Wireframes', 'UI Concept', 'Responsiveness'],
  },
  {
    id: '3',
    title: 'Development',
    icon: '⚙️',
    steps: ['Architecture', 'Front-end', 'Back-end', 'Integrations', 'Testing'],
  },
  {
    id: '4',
    title: 'Execution',
    icon: '🚀',
    steps: ['Monitoring', 'Optimization', 'Releases', 'Social Media', 'Support'],
  },
]

const defaultFAQs: FAQ[] = [
  {
    id: '1',
    question: 'What technologies do you use for web and app development?',
    answer: 'We use modern technologies including React, Next.js, Node.js, React Native, Flutter, and various cloud services to build scalable and performant applications.',
    isVisible: true,
  },
  {
    id: '2',
    question: 'How long does it typically take to build a website or app?',
    answer: 'Project timelines vary based on complexity. A simple website may take 2-4 weeks, while complex applications can take 2-6 months or more.',
    isVisible: true,
  },
  {
    id: '3',
    question: 'Do you offer post-launch support and maintenance?',
    answer: 'Yes, we provide ongoing support and maintenance packages to ensure your application stays up-to-date, secure, and performs optimally.',
    isVisible: true,
  },
  {
    id: '4',
    question: 'How do you approach SEO and site optimization?',
    answer: 'We build SEO best practices into every project from the start, including proper meta tags, structured data, performance optimization, and mobile responsiveness.',
    isVisible: true,
  },
  {
    id: '5',
    question: 'Do you redesign an existing application?',
    answer: 'Absolutely! We can modernize your existing application with a fresh design, improved UX, and updated technology stack while preserving your business logic.',
    isVisible: true,
  },
  {
    id: '6',
    question: 'Can I approach you for party service?',
    answer: 'We focus on digital services only. However, we can help you build a platform for event management or party planning services!',
    isVisible: true,
  },
]

export default function ServicesPageDedicated() {
  const [services, setServices] = useState<Service[]>([])
  const [approachPhases, setApproachPhases] = useState<ApproachPhase[]>([])
  const [faqs, setFAQs] = useState<FAQ[]>([])
  const [header, setHeader] = useState<HeaderData>(defaultHeader)
  const [approachHeader, setApproachHeader] = useState<ApproachData>(defaultApproachHeader)
  const [marquee, setMarquee] = useState<MarqueeData>(defaultMarquee)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'services' | 'approach' | 'faqs'>('services')
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [editServiceData, setEditServiceData] = useState<Service | null>(null)
  const [editingFAQId, setEditingFAQId] = useState<string | null>(null)
  const [editFAQData, setEditFAQData] = useState<FAQ | null>(null)
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null)
  const [editPhaseData, setEditPhaseData] = useState<ApproachPhase | null>(null)
  const [newService, setNewService] = useState(initialServiceForm)
  const [newFAQ, setNewFAQ] = useState(initialFAQForm)
  const [newImagePreview, setNewImagePreview] = useState('')
  const [showAddServiceForm, setShowAddServiceForm] = useState(false)
  const [showAddFAQForm, setShowAddFAQForm] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [newMarqueeItem, setNewMarqueeItem] = useState('')
  const newFileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get('/settings')
      const settings = response.data.data

      const servicesSettings = settings.find((s: { key: string }) => s.key === 'services_page_services')
      const headerSettings = settings.find((s: { key: string }) => s.key === 'services_page_header')
      const approachSettings = settings.find((s: { key: string }) => s.key === 'services_page_approach')
      const approachHeaderSettings = settings.find((s: { key: string }) => s.key === 'services_page_approach_header')
      const faqSettings = settings.find((s: { key: string }) => s.key === 'services_page_faqs')
      const marqueeSettings = settings.find((s: { key: string }) => s.key === 'services_page_marquee')

      if (servicesSettings?.value && servicesSettings.value.length > 0) {
        setServices(servicesSettings.value)
      } else {
        setServices(defaultServices)
      }
      if (headerSettings?.value) {
        setHeader(headerSettings.value)
      }
      if (approachSettings?.value && approachSettings.value.length > 0) {
        setApproachPhases(approachSettings.value)
      } else {
        setApproachPhases(defaultApproachPhases)
      }
      if (approachHeaderSettings?.value) {
        setApproachHeader(approachHeaderSettings.value)
      }
      if (faqSettings?.value && faqSettings.value.length > 0) {
        setFAQs(faqSettings.value)
      } else {
        setFAQs(defaultFAQs)
      }
      if (marqueeSettings?.value) {
        setMarquee(marqueeSettings.value)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setServices(defaultServices)
      setApproachPhases(defaultApproachPhases)
      setFAQs(defaultFAQs)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const saveServices = async (updatedServices: Service[]) => {
    setIsSaving(true)
    try {
      await api.put('/settings', {
        key: 'services_page_services',
        value: updatedServices,
        description: 'Services page services list'
      })
      setServices(updatedServices)
    } catch (error) {
      console.error('Error saving services:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const saveHeader = async (updatedHeader: HeaderData) => {
    try {
      await api.put('/settings', {
        key: 'services_page_header',
        value: updatedHeader,
        description: 'Services page header'
      })
      setHeader(updatedHeader)
    } catch (error) {
      console.error('Error saving header:', error)
    }
  }

  const saveApproachPhases = async (updatedPhases: ApproachPhase[]) => {
    setIsSaving(true)
    try {
      await api.put('/settings', {
        key: 'services_page_approach',
        value: updatedPhases,
        description: 'Services page approach phases'
      })
      setApproachPhases(updatedPhases)
    } catch (error) {
      console.error('Error saving approach:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const saveApproachHeader = async (updatedHeader: ApproachData) => {
    try {
      await api.put('/settings', {
        key: 'services_page_approach_header',
        value: updatedHeader,
        description: 'Services page approach header'
      })
      setApproachHeader(updatedHeader)
    } catch (error) {
      console.error('Error saving approach header:', error)
    }
  }

  const saveFAQs = async (updatedFAQs: FAQ[]) => {
    setIsSaving(true)
    try {
      await api.put('/settings', {
        key: 'services_page_faqs',
        value: updatedFAQs,
        description: 'Services page FAQs'
      })
      setFAQs(updatedFAQs)
    } catch (error) {
      console.error('Error saving FAQs:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const saveMarquee = async (updatedMarquee: MarqueeData) => {
    try {
      await api.put('/settings', {
        key: 'services_page_marquee',
        value: updatedMarquee,
        description: 'Services page marquee items'
      })
      setMarquee(updatedMarquee)
    } catch (error) {
      console.error('Error saving marquee:', error)
    }
  }

  const handleHeaderChange = (field: keyof HeaderData, value: string) => {
    const updated = { ...header, [field]: value }
    setHeader(updated)
  }

  const handleHeaderBlur = () => {
    saveHeader(header)
  }

  const handleApproachHeaderChange = (field: keyof ApproachData, value: string) => {
    const updated = { ...approachHeader, [field]: value }
    setApproachHeader(updated)
  }

  const handleApproachHeaderBlur = () => {
    saveApproachHeader(approachHeader)
  }

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setNewImagePreview(base64)
        setNewService({ ...newService, image: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && editServiceData) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setEditServiceData({ ...editServiceData, image: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  // Service CRUD
  const handleAddService = async () => {
    if (!newService.title) return
    const service: Service = {
      id: Date.now().toString(),
      ...newService,
      isExpanded: false,
      isVisible: true,
    }
    await saveServices([...services, service])
    setNewService(initialServiceForm)
    setNewImagePreview('')
    setAddSuccess(true)
    setTimeout(() => setAddSuccess(false), 3000)
  }

  const startEditingService = (service: Service) => {
    setEditingServiceId(service.id)
    setEditServiceData({ ...service })
  }

  const cancelEditingService = () => {
    setEditingServiceId(null)
    setEditServiceData(null)
  }

  const saveServiceEdit = () => {
    if (!editServiceData) return
    const updated = services.map(s => s.id === editServiceData.id ? editServiceData : s)
    saveServices(updated)
    setEditingServiceId(null)
    setEditServiceData(null)
  }

  const handleDeleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      saveServices(services.filter(s => s.id !== id))
    }
  }

  const handleToggleServiceVisibility = (id: string) => {
    const updated = services.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s)
    saveServices(updated)
  }

  // FAQ CRUD
  const handleAddFAQ = async () => {
    if (!newFAQ.question || !newFAQ.answer) return
    const faq: FAQ = {
      id: Date.now().toString(),
      ...newFAQ,
      isVisible: true,
    }
    await saveFAQs([...faqs, faq])
    setNewFAQ(initialFAQForm)
    setAddSuccess(true)
    setTimeout(() => setAddSuccess(false), 3000)
  }

  const startEditingFAQ = (faq: FAQ) => {
    setEditingFAQId(faq.id)
    setEditFAQData({ ...faq })
  }

  const cancelEditingFAQ = () => {
    setEditingFAQId(null)
    setEditFAQData(null)
  }

  const saveFAQEdit = () => {
    if (!editFAQData) return
    const updated = faqs.map(f => f.id === editFAQData.id ? editFAQData : f)
    saveFAQs(updated)
    setEditingFAQId(null)
    setEditFAQData(null)
  }

  const handleDeleteFAQ = (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      saveFAQs(faqs.filter(f => f.id !== id))
    }
  }

  const handleToggleFAQVisibility = (id: string) => {
    const updated = faqs.map(f => f.id === id ? { ...f, isVisible: !f.isVisible } : f)
    saveFAQs(updated)
  }

  // Approach Phase editing
  const startEditingPhase = (phase: ApproachPhase) => {
    setEditingPhaseId(phase.id)
    setEditPhaseData({ ...phase })
  }

  const cancelEditingPhase = () => {
    setEditingPhaseId(null)
    setEditPhaseData(null)
  }

  const savePhaseEdit = () => {
    if (!editPhaseData) return
    const updated = approachPhases.map(p => p.id === editPhaseData.id ? editPhaseData : p)
    saveApproachPhases(updated)
    setEditingPhaseId(null)
    setEditPhaseData(null)
  }

  const handlePhaseStepChange = (index: number, value: string) => {
    if (!editPhaseData) return
    const newSteps = [...editPhaseData.steps]
    newSteps[index] = value
    setEditPhaseData({ ...editPhaseData, steps: newSteps })
  }

  // Marquee
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
      saveServices(defaultServices)
      saveHeader(defaultHeader)
      saveApproachPhases(defaultApproachPhases)
      saveApproachHeader(defaultApproachHeader)
      saveFAQs(defaultFAQs)
      saveMarquee(defaultMarquee)
    }
  }

  const visibleServices = services.filter(s => s.isVisible !== false)
  const visibleFAQs = faqs.filter(f => f.isVisible !== false)

  if (isLoading) {
    return (
      <DashboardLayout>
        <TopBar title="Website Controls" subtitle="Services" />
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
      <TopBar title="Website Controls" subtitle="Services" />
      <div className="p-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Column - Controls */}
          <div className="flex-1 space-y-6">

            {/* Header Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Page Header</h2>
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
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={header.title}
                    onChange={(e) => handleHeaderChange('title', e.target.value)}
                    onBlur={handleHeaderBlur}
                    className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                    placeholder="Our Services"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1.5">Description</label>
                  <textarea
                    value={header.description}
                    onChange={(e) => handleHeaderChange('description', e.target.value)}
                    onBlur={handleHeaderBlur}
                    rows={2}
                    className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30 resize-none"
                    placeholder="Description..."
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/[0.06] pb-2">
              {(['services', 'approach', 'faqs'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/[0.04] text-gray-400 hover:text-white border border-transparent'
                    }`}
                >
                  {tab === 'services' ? 'Services' : tab === 'approach' ? 'Our Approach' : 'FAQs'}
                </button>
              ))}
            </div>

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Services ({services.length})</h2>
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

                {/* Service Cards */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {services.map((service, index) => (
                    <div key={service.id} className={`bg-[#1a1a1a] border rounded-xl overflow-hidden ${service.isVisible === false ? 'border-amber-500/20 opacity-60' : 'border-white/[0.06]'}`}>
                      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.04]">
                        <span className="text-sm font-medium text-white">
                          {index + 1}. {service.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDeleteService(service.id)} className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                          <button onClick={() => handleToggleServiceVisibility(service.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${service.isVisible !== false ? 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white' : 'bg-amber-500/20 text-amber-400'}`} title={service.isVisible !== false ? "Hide" : "Show"}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {service.isVisible !== false ? (
                                <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              )}
                            </svg>
                          </button>
                          <button onClick={() => editingServiceId === service.id ? cancelEditingService() : startEditingService(service)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${editingServiceId === service.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white'}`} title="Edit">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        </div>
                      </div>

                      {editingServiceId === service.id && editServiceData && (
                        <div className="p-4 space-y-3">
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Title</label>
                            <input type="text" value={editServiceData.title} onChange={(e) => setEditServiceData({ ...editServiceData, title: e.target.value })} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Description</label>
                            <textarea value={editServiceData.description} onChange={(e) => setEditServiceData({ ...editServiceData, description: e.target.value })} rows={3} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 resize-none" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Image</label>
                            <div className="flex items-center gap-2">
                              <input type="text" value={editServiceData.image ? '1 image attached' : 'No image'} readOnly className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white cursor-default" />
                              <input ref={editFileInputRef} type="file" accept="image/*" onChange={handleEditImageChange} className="hidden" />
                              <button onClick={() => editFileInputRef.current?.click()} className="w-9 h-9 rounded-lg bg-[#252525] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <button onClick={cancelEditingService} className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white text-xs transition-colors border border-white/[0.06]">Cancel</button>
                            <button onClick={saveServiceEdit} className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors">Save changes</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Service Form */}
                <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl overflow-hidden">
                  <button onClick={() => setShowAddServiceForm(!showAddServiceForm)} className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <span className="text-sm font-medium text-white">Add Service</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${showAddServiceForm ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showAddServiceForm && (
                    <div className="p-4 space-y-3 border-t border-white/[0.04]">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Title</label>
                        <input type="text" value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30" placeholder="Service title" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Description</label>
                        <textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} rows={3} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30 resize-none" placeholder="Service description" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Image</label>
                        <div className="flex items-center gap-2">
                          <input type="text" value={newImagePreview ? '1 image attached' : ''} readOnly className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white cursor-default" placeholder="Upload an image" />
                          <input ref={newFileInputRef} type="file" accept="image/*" onChange={handleNewImageChange} className="hidden" />
                          <button onClick={() => newFileInputRef.current?.click()} className="w-10 h-10 rounded-lg bg-[#252525] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <button onClick={() => { setNewService(initialServiceForm); setNewImagePreview(''); setShowAddServiceForm(false) }} className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white text-sm transition-colors border border-white/[0.06]">Cancel</button>
                        <button onClick={handleAddService} disabled={!newService.title || isSaving} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors">{isSaving ? 'Adding...' : 'Add service'}</button>
                      </div>
                      {addSuccess && activeTab === 'services' && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <span className="text-sm text-emerald-400">Service added successfully!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Marquee Section */}
                <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-medium text-white">Skills Marquee</h3>
                  <div className="flex flex-wrap gap-2">
                    {marquee.items.map((item, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#252525] border border-white/[0.06] text-xs text-white">
                        {item}
                        <button onClick={() => handleRemoveMarqueeItem(item)} className="text-gray-500 hover:text-red-400 transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    ))}
                    <div className="inline-flex items-center gap-1">
                      <input type="text" value={newMarqueeItem} onChange={(e) => setNewMarqueeItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddMarqueeItem()} className="w-28 bg-[#252525] border border-white/[0.06] rounded-full px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30" placeholder="Add skill..." />
                      <button onClick={handleAddMarqueeItem} className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Approach Tab */}
            {activeTab === 'approach' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white">Our Approach</h2>

                {/* Approach Header */}
                <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-4 space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1.5">Section Title</label>
                    <input type="text" value={approachHeader.title} onChange={(e) => handleApproachHeaderChange('title', e.target.value)} onBlur={handleApproachHeaderBlur} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1.5">Subtitle</label>
                    <textarea value={approachHeader.subtitle} onChange={(e) => handleApproachHeaderChange('subtitle', e.target.value)} onBlur={handleApproachHeaderBlur} rows={2} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30 resize-none" />
                  </div>
                </div>

                {/* Phases */}
                <div className="space-y-3">
                  {approachPhases.map((phase, index) => (
                    <div key={phase.id} className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.04]">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{phase.icon}</span>
                          <span className="text-sm font-medium text-white">Phase {index + 1}: {phase.title}</span>
                        </div>
                        <button onClick={() => editingPhaseId === phase.id ? cancelEditingPhase() : startEditingPhase(phase)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${editingPhaseId === phase.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white'}`}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                      </div>

                      {editingPhaseId === phase.id && editPhaseData ? (
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-gray-500 mb-1">Title</label>
                              <input type="text" value={editPhaseData.title} onChange={(e) => setEditPhaseData({ ...editPhaseData, title: e.target.value })} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30" />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-500 mb-1">Icon (emoji)</label>
                              <input type="text" value={editPhaseData.icon} onChange={(e) => setEditPhaseData({ ...editPhaseData, icon: e.target.value })} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Steps (5 items)</label>
                            <div className="grid grid-cols-5 gap-2">
                              {editPhaseData.steps.map((step, i) => (
                                <input key={i} type="text" value={step} onChange={(e) => handlePhaseStepChange(i, e.target.value)} className="bg-[#252525] border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/30" placeholder={`Step ${i + 1}`} />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <button onClick={cancelEditingPhase} className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white text-xs transition-colors border border-white/[0.06]">Cancel</button>
                            <button onClick={savePhaseEdit} className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors">Save changes</button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {phase.steps.map((step, i) => (
                              <span key={i} className="px-2 py-1 rounded bg-white/[0.04] text-xs text-gray-400">
                                {String(i + 1).padStart(2, '0')} {step}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs Tab */}
            {activeTab === 'faqs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">FAQs ({faqs.length})</h2>
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

                {/* FAQ Cards */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {faqs.map((faq, index) => (
                    <div key={faq.id} className={`bg-[#1a1a1a] border rounded-xl overflow-hidden ${faq.isVisible === false ? 'border-amber-500/20 opacity-60' : 'border-white/[0.06]'}`}>
                      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.04]">
                        <span className="text-sm font-medium text-white truncate max-w-[300px]">
                          {index + 1}. {faq.question}
                        </span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDeleteFAQ(faq.id)} className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors" title="Delete">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                          <button onClick={() => handleToggleFAQVisibility(faq.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${faq.isVisible !== false ? 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white' : 'bg-amber-500/20 text-amber-400'}`} title={faq.isVisible !== false ? "Hide" : "Show"}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {faq.isVisible !== false ? (
                                <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              )}
                            </svg>
                          </button>
                          <button onClick={() => editingFAQId === faq.id ? cancelEditingFAQ() : startEditingFAQ(faq)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${editingFAQId === faq.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white'}`} title="Edit">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                        </div>
                      </div>

                      {editingFAQId === faq.id && editFAQData && (
                        <div className="p-4 space-y-3">
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Question</label>
                            <input type="text" value={editFAQData.question} onChange={(e) => setEditFAQData({ ...editFAQData, question: e.target.value })} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30" />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Answer</label>
                            <textarea value={editFAQData.answer} onChange={(e) => setEditFAQData({ ...editFAQData, answer: e.target.value })} rows={3} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 resize-none" />
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <button onClick={cancelEditingFAQ} className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white text-xs transition-colors border border-white/[0.06]">Cancel</button>
                            <button onClick={saveFAQEdit} className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors">Save changes</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add FAQ Form */}
                <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl overflow-hidden">
                  <button onClick={() => setShowAddFAQForm(!showAddFAQForm)} className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <span className="text-sm font-medium text-white">Add FAQ</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${showAddFAQForm ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showAddFAQForm && (
                    <div className="p-4 space-y-3 border-t border-white/[0.04]">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Question</label>
                        <input type="text" value={newFAQ.question} onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30" placeholder="Enter the question" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Answer</label>
                        <textarea value={newFAQ.answer} onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })} rows={3} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30 resize-none" placeholder="Enter the answer" />
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <button onClick={() => { setNewFAQ(initialFAQForm); setShowAddFAQForm(false) }} className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white text-sm transition-colors border border-white/[0.06]">Cancel</button>
                        <button onClick={handleAddFAQ} disabled={!newFAQ.question || !newFAQ.answer || isSaving} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors">{isSaving ? 'Adding...' : 'Add FAQ'}</button>
                      </div>
                      {addSuccess && activeTab === 'faqs' && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          <span className="text-sm text-emerald-400">FAQ added successfully!</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="xl:w-[400px] space-y-4">
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
                  edastra.in/services
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-4 bg-gradient-to-b from-[#0a1015] to-[#0d1318] min-h-[500px]">
                {/* Navigation */}
                <div className="flex items-center justify-between mb-6 text-[8px]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
                    <span className="text-white font-medium">EDASTRA</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="text-emerald-400">Services</span>
                    <span>Our Work</span>
                    <span>Testimonials</span>
                    <span>About Us</span>
                  </div>
                </div>

                {/* Header */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white mb-2">{header.title}</h1>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{header.description}</p>
                </div>

                {/* Services Accordion Preview */}
                <div className="space-y-2 mb-6">
                  {visibleServices.slice(0, 4).map((service, index) => (
                    <div key={service.id} className="bg-white/[0.03] rounded-lg border border-white/[0.06] overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className={`text-[10px] font-medium ${index === 0 ? 'text-white' : 'text-gray-400'}`}>
                          {service.title}
                        </span>
                        <span className="text-[8px] text-gray-500">{index === 0 ? '—' : '+'}</span>
                      </div>
                      {index === 0 && (
                        <div className="px-3 pb-3">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <p className="text-[8px] text-gray-500 line-clamp-2">{service.description}</p>
                            </div>
                            {service.image && (
                              <div className="w-16 h-12 rounded bg-gray-700 overflow-hidden flex-shrink-0">
                                <Image src={service.image} alt={service.title} width={64} height={48} className="object-cover w-full h-full" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Marquee Preview */}
                <div className="overflow-hidden mb-6 py-2 bg-white/[0.02] rounded-lg">
                  <div className="flex gap-4 text-[8px] text-gray-500 whitespace-nowrap animate-marquee">
                    {marquee.items.slice(0, 6).map((item, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="text-emerald-400">•</span> {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Our Approach Preview */}
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-white mb-1">{approachHeader.title}</h2>
                  <p className="text-[8px] text-gray-500 mb-3">{approachHeader.subtitle}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {approachPhases.map((phase) => (
                      <div key={phase.id} className="text-center">
                        <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
                          <span className="text-sm">{phase.icon}</span>
                        </div>
                        <p className="text-[8px] text-white font-medium">{phase.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQs Preview */}
                <div>
                  <h2 className="text-sm font-bold text-white mb-2">FAQ&apos;s</h2>
                  <div className="space-y-1">
                    {visibleFAQs.slice(0, 3).map((faq) => (
                      <div key={faq.id} className="flex items-center justify-between px-2 py-1.5 bg-white/[0.02] rounded border border-white/[0.04]">
                        <span className="text-[8px] text-gray-400 truncate max-w-[250px]">{faq.question}</span>
                        <svg className="w-2.5 h-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-emerald-400">{visibleServices.length}</p>
                <p className="text-[9px] text-gray-400 mt-1">Services</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-blue-400">{approachPhases.length}</p>
                <p className="text-[9px] text-gray-400 mt-1">Phases</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-purple-400">{visibleFAQs.length}</p>
                <p className="text-[9px] text-gray-400 mt-1">FAQs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
