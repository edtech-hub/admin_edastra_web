"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopBar from '@/components/layout/TopBar'
import api from '@/lib/api'
import Image from 'next/image'

interface Service {
  id: string
  title: string
  tagline: string
  description: string
  tags: string[]
  image: string
  isVisible?: boolean
}

interface HeaderData {
  title: string
  titleHighlight: string
  subtitle: string
}

const defaultHeader: HeaderData = {
  title: 'Services That Drive',
  titleHighlight: 'Results',
  subtitle: 'From concept to deployment — we build production-ready software that scales with your business.',
}

const defaultServices: Service[] = [
  {
    id: '1',
    title: 'Web Development',
    tagline: 'Pixel-perfect & performant',
    description: 'Responsive, scalable web applications built with modern frameworks. From landing pages to complex SaaS dashboards — pixel-perfect and performant.',
    tags: ['Next.js', 'React', 'Node.js', 'TypeScript'],
    image: '',
    isVisible: true,
  },
  {
    id: '2',
    title: 'Mobile Apps',
    tagline: 'Native & cross-platform',
    description: 'Native and cross-platform iOS & Android applications that users love.',
    tags: ['Flutter', 'React Native', 'iOS', 'Android'],
    image: '',
    isVisible: true,
  },
  {
    id: '3',
    title: 'API Development',
    tagline: 'Reliable & fast',
    description: 'Robust RESTful APIs and microservices built for reliability and speed.',
    tags: ['REST', 'GraphQL', 'WebSockets', 'gRPC'],
    image: '',
    isVisible: true,
  },
  {
    id: '4',
    title: 'Product Engineering',
    tagline: 'End-to-end solutions',
    description: 'End-to-end product development engineered around your exact business challenges — from architecture to deployment.',
    tags: ['API', 'Microservices', 'Automation', 'SaaS'],
    image: '',
    isVisible: true,
  },
]

const initialServiceForm = {
  title: '',
  tagline: '',
  description: '',
  tags: [] as string[],
  image: '',
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [header, setHeader] = useState<HeaderData>(defaultHeader)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Service | null>(null)
  const [isEditingHeader, setIsEditingHeader] = useState(false)
  const [editHeaderData, setEditHeaderData] = useState<HeaderData>(defaultHeader)
  const [newService, setNewService] = useState(initialServiceForm)
  const [newImagePreview, setNewImagePreview] = useState('')
  const [newTag, setNewTag] = useState('')
  const [editNewTag, setEditNewTag] = useState('')
  const [addSuccess, setAddSuccess] = useState(false)
  const newFileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get('/settings')
      const settings = response.data.data

      const servicesSettings = settings.find((s: { key: string }) => s.key === 'homepage_services')
      const headerSettings = settings.find((s: { key: string }) => s.key === 'homepage_services_header')

      if (servicesSettings?.value && servicesSettings.value.length > 0) {
        setServices(servicesSettings.value)
      } else {
        setServices(defaultServices)
      }
      if (headerSettings?.value) {
        setHeader(headerSettings.value)
        setEditHeaderData(headerSettings.value)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      setServices(defaultServices)
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
        key: 'homepage_services',
        value: updatedServices,
        description: 'Homepage services section'
      })
      setServices(updatedServices)
    } catch (error) {
      console.error('Error saving services:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const saveHeader = async (data: HeaderData) => {
    try {
      await api.put('/settings', {
        key: 'homepage_services_header',
        value: data,
        description: 'Homepage services header'
      })
      setHeader(data)
    } catch (error) {
      console.error('Error saving header:', error)
    }
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
    if (file && editData) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setEditData({ ...editData, image: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddService = async () => {
    if (!newService.title) return
    const service: Service = {
      id: Date.now().toString(),
      ...newService,
      isVisible: true,
    }
    await saveServices([...services, service])
    setNewService(initialServiceForm)
    setNewImagePreview('')
    setAddSuccess(true)
    setTimeout(() => setAddSuccess(false), 3000)
  }

  const startEditing = (service: Service) => {
    setEditingId(service.id)
    setEditData({ ...service })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditData(null)
  }

  const saveEdit = () => {
    if (!editData) return
    const updated = services.map(s => s.id === editData.id ? editData : s)
    saveServices(updated)
    setEditingId(null)
    setEditData(null)
  }

  const handleDeleteService = (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      saveServices(services.filter(s => s.id !== id))
    }
  }

  const handleToggleVisibility = (id: string) => {
    const updated = services.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s)
    saveServices(updated)
  }

  const handleAddNewTag = () => {
    if (newTag.trim() && !newService.tags.includes(newTag.trim())) {
      setNewService({ ...newService, tags: [...newService.tags, newTag.trim()] })
      setNewTag('')
    }
  }

  const handleRemoveNewTag = (tag: string) => {
    setNewService({ ...newService, tags: newService.tags.filter(t => t !== tag) })
  }

  const handleAddEditTag = () => {
    if (editNewTag.trim() && editData && !editData.tags.includes(editNewTag.trim())) {
      setEditData({ ...editData, tags: [...editData.tags, editNewTag.trim()] })
      setEditNewTag('')
    }
  }

  const handleRemoveEditTag = (tag: string) => {
    if (editData) {
      setEditData({ ...editData, tags: editData.tags.filter(t => t !== tag) })
    }
  }

  const handleStartEditHeader = () => {
    setEditHeaderData({ ...header })
    setIsEditingHeader(true)
  }

  const handleSaveHeader = async () => {
    await saveHeader(editHeaderData)
    setIsEditingHeader(false)
  }

  const handleResetToDefault = () => {
    if (confirm('This will replace all current data with defaults. Continue?')) {
      saveServices(defaultServices)
      saveHeader(defaultHeader)
      setEditHeaderData(defaultHeader)
    }
  }

  const visibleServices = services.filter(s => s.isVisible !== false)

  if (isLoading) {
    return (
      <DashboardLayout>
        <TopBar title="Services" subtitle="Customize your hero section content with ease" />
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
      <TopBar title="Services" subtitle="Customize your hero section content with ease" />
      <div className="p-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Left Column - Controls */}
          <div className="flex-1 space-y-6">

            {/* Header Section */}
            <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Section Header</h2>
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
                  {!isEditingHeader ? (
                    <button
                      onClick={handleStartEditHeader}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => setIsEditingHeader(false)} className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 text-xs border border-white/[0.06]">Cancel</button>
                      <button onClick={handleSaveHeader} className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium">Save</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Title</label>
                    <input
                      type="text"
                      value={isEditingHeader ? editHeaderData.title : header.title}
                      onChange={(e) => setEditHeaderData({ ...editHeaderData, title: e.target.value })}
                      disabled={!isEditingHeader}
                      className={`w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 ${!isEditingHeader ? 'opacity-70' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Title Highlight</label>
                    <input
                      type="text"
                      value={isEditingHeader ? editHeaderData.titleHighlight : header.titleHighlight}
                      onChange={(e) => setEditHeaderData({ ...editHeaderData, titleHighlight: e.target.value })}
                      disabled={!isEditingHeader}
                      className={`w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-emerald-400 focus:outline-none focus:border-emerald-500/30 ${!isEditingHeader ? 'opacity-70' : ''}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Subtitle</label>
                  <textarea
                    value={isEditingHeader ? editHeaderData.subtitle : header.subtitle}
                    onChange={(e) => setEditHeaderData({ ...editHeaderData, subtitle: e.target.value })}
                    disabled={!isEditingHeader}
                    rows={2}
                    className={`w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 resize-none ${!isEditingHeader ? 'opacity-70' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* Components Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-sm text-gray-400">Components</h2>
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/[0.04] rounded-lg">
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="text-xs text-gray-400">{services.length}</span>
                  </div>
                </div>
                {isSaving && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </div>
                )}
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`bg-[#1a1a1a] border rounded-xl overflow-hidden ${editingId === service.id ? 'border-emerald-500/30 col-span-2' :
                      service.isVisible === false ? 'border-amber-500/20 opacity-60' : 'border-white/[0.06]'
                      }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/[0.04]">
                      <span className={`text-xs font-medium truncate ${editingId === service.id ? 'text-emerald-400' : 'text-white'}`}>
                        {service.title}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleVisibility(service.id)}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${service.isVisible !== false ? 'text-gray-500 hover:text-white' : 'text-amber-400'
                            }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {service.isVisible !== false ? (
                              <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => editingId === service.id ? cancelEditing() : startEditing(service)}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${editingId === service.id ? 'text-emerald-400' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Edit Form */}
                    {editingId === service.id && editData && (
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500">Edit Service</span>
                          <button onClick={() => handleDeleteService(service.id)} className="ml-auto w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Title</label>
                          <input type="text" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30" />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Tagline</label>
                          <input type="text" value={editData.tagline} onChange={(e) => setEditData({ ...editData, tagline: e.target.value })} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30" />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Details</label>
                          <textarea value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} rows={2} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 resize-none" />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Tags</label>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {editData.tags.map((tag, i) => (
                              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">
                                {tag}
                                <button onClick={() => handleRemoveEditTag(tag)} className="hover:text-red-400">×</button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input type="text" value={editNewTag} onChange={(e) => setEditNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddEditTag()} className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/30" placeholder="Add tag..." />
                            <button onClick={handleAddEditTag} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30">Add</button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Image</label>
                          <div className="flex items-center gap-2">
                            <input type="text" value={editData.image ? '1 image attached' : 'No image'} readOnly className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white cursor-default" />
                            <input ref={editFileInputRef} type="file" accept="image/*" onChange={handleEditImageChange} className="hidden" />
                            <button onClick={() => editFileInputRef.current?.click()} className="w-9 h-9 rounded-lg bg-[#252525] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            </button>
                          </div>
                          {editData.image && <span className="text-[10px] text-emerald-400 mt-1">✓ Image ready</span>}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button onClick={cancelEditing} className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 text-xs border border-white/[0.06]">Cancel</button>
                          <button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                            Save changes
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Service Section */}
              <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-4 space-y-3">
                <h3 className="text-sm text-gray-400">Add Service</h3>

                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Title</label>
                  <input type="text" value={newService.title} onChange={(e) => setNewService({ ...newService, title: e.target.value })} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30" placeholder="Service title" />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Description</label>
                  <textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} rows={2} className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 resize-none" placeholder="Service description" />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {newService.tags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]">
                        {tag}
                        <button onClick={() => handleRemoveNewTag(tag)} className="hover:text-red-400">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNewTag()} className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/30" placeholder="Add tag..." />
                    <button onClick={handleAddNewTag} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30">Add</button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Image</label>
                  <div className="flex items-center gap-2">
                    <input type="text" value={newImagePreview ? '1 image attached' : ''} readOnly className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white cursor-default" placeholder="Upload image" />
                    <input ref={newFileInputRef} type="file" accept="image/*" onChange={handleNewImageChange} className="hidden" />
                    <button onClick={() => newFileInputRef.current?.click()} className="w-9 h-9 rounded-lg bg-[#252525] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button onClick={() => { setNewService(initialServiceForm); setNewImagePreview('') }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 text-sm border border-white/[0.06]">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
                    Discard
                  </button>
                  <button onClick={handleAddService} disabled={!newService.title || isSaving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white text-sm font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    Add Service
                  </button>
                </div>

                {addSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-emerald-400">Service added successfully!</span>
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
              {/* Browser header */}
              <div className="px-3 py-2 bg-[#252525] border-b border-white/[0.04] flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 bg-[#1a1a1a] rounded px-2 py-1 text-[10px] text-gray-500 truncate">
                  edastra.in/#services
                </div>
              </div>

              {/* Preview Content */}
              <div className="bg-[#0a0f14] p-4 relative overflow-hidden">
                {/* Particle/dot grid effect */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-2 left-4 w-0.5 h-0.5 rounded-full bg-emerald-400" />
                  <div className="absolute top-6 right-8 w-0.5 h-0.5 rounded-full bg-emerald-400" />
                  <div className="absolute bottom-8 left-12 w-0.5 h-0.5 rounded-full bg-emerald-400" />
                  <div className="absolute top-20 right-4 w-0.5 h-0.5 rounded-full bg-emerald-400" />
                </div>

                {/* Section Header */}
                <div className="text-center mb-4 relative z-10">
                  <p className="text-[7px] text-emerald-400 uppercase tracking-widest mb-1">WHAT WE BUILD</p>
                  <h2 className="text-sm font-bold">
                    <span className="text-white">{header.title}</span>{' '}
                    <span className="text-emerald-400">{header.titleHighlight}</span>
                  </h2>
                  <p className="text-[8px] text-gray-500 mt-1.5 max-w-[260px] mx-auto leading-relaxed">{header.subtitle}</p>
                </div>

                {/* Bento Grid Layout - 2x2 aligned grid */}
                <div className="grid grid-cols-2 grid-rows-2 gap-2 relative z-10">
                  {/* Web Development - Top left */}
                  {visibleServices[0] && (
                    <div className="bg-[#0d1318] border border-white/[0.08] rounded-lg p-3 relative overflow-hidden min-h-[100px]">
                      {/* Code UI illustration */}
                      <div className="absolute top-2 left-2 w-14 h-12 opacity-60">
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 rounded-full bg-emerald-400" />
                          <div className="w-1 h-1 rounded-full bg-emerald-400" />
                          <div className="w-1 h-1 rounded-full bg-emerald-400" />
                        </div>
                        <div className="mt-1 space-y-0.5">
                          <div className="flex gap-0.5">
                            <div className="w-4 h-1.5 rounded-sm bg-emerald-500/30" />
                            <div className="w-3 h-1.5 rounded-sm bg-emerald-500/20" />
                          </div>
                          <div className="flex gap-0.5">
                            <div className="w-2 h-1.5 rounded-sm bg-emerald-500/20" />
                            <div className="w-5 h-1.5 rounded-sm bg-emerald-500/30" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-12 text-center">
                        <h3 className="text-[8px] font-semibold text-white mb-0.5">{visibleServices[0].title}</h3>
                        <p className="text-[6px] text-gray-500 leading-relaxed mb-1.5 line-clamp-2">{visibleServices[0].description}</p>
                        <div className="flex flex-wrap justify-center gap-0.5">
                          {visibleServices[0].tags.map((tag, i) => (
                            <span key={i} className="px-1 py-0.5 bg-white/[0.06] border border-white/[0.08] text-[5px] text-gray-400 rounded">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Apps - Top right */}
                  {visibleServices[1] && (
                    <div className="bg-[#0d1318] border border-white/[0.08] rounded-lg p-3 relative min-h-[100px]">
                      {/* Phone illustration */}
                      <div className="absolute top-2 right-2 w-7 h-9 border border-emerald-500/30 rounded bg-emerald-500/5">
                        <div className="m-0.5 space-y-0.5">
                          <div className="w-full h-1 rounded-sm bg-emerald-500/20" />
                          <div className="w-3/4 h-1 rounded-sm bg-emerald-500/15" />
                        </div>
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full border border-emerald-500/40" />
                      </div>
                      <div className="mt-12 text-center">
                        <h3 className="text-[8px] font-semibold text-white mb-0.5">{visibleServices[1].title}</h3>
                        <p className="text-[6px] text-gray-500 leading-relaxed mb-1.5 line-clamp-2">{visibleServices[1].description}</p>
                        <div className="flex flex-wrap justify-center gap-0.5">
                          {visibleServices[1].tags.map((tag, i) => (
                            <span key={i} className="px-1 py-0.5 bg-white/[0.06] border border-white/[0.08] text-[5px] text-gray-400 rounded">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* API Development - Bottom left */}
                  {visibleServices[2] && (
                    <div className="bg-[#0d1318] border border-white/[0.08] rounded-lg p-3 relative min-h-[100px]">
                      {/* API nodes illustration */}
                      <div className="absolute top-2 left-2 flex gap-1 opacity-60">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-2 h-1.5 rounded-sm bg-emerald-500/30 flex items-center justify-center">
                            <div className="w-0.5 h-0.5 bg-emerald-400" />
                          </div>
                          <div className="w-px h-1.5 bg-emerald-500/30" />
                          <div className="w-2 h-1.5 rounded-sm bg-emerald-500/30" />
                        </div>
                        <div className="flex flex-col items-center gap-0.5 mt-1.5">
                          <div className="w-2 h-1.5 rounded-sm bg-emerald-500/30" />
                          <div className="w-px h-1.5 bg-emerald-500/30" />
                          <div className="w-2 h-1.5 rounded-sm bg-emerald-500/30" />
                        </div>
                      </div>
                      <div className="mt-12 text-center">
                        <h3 className="text-[8px] font-semibold text-white mb-0.5">{visibleServices[2].title}</h3>
                        <p className="text-[6px] text-gray-500 leading-relaxed mb-1.5 line-clamp-2">{visibleServices[2].description}</p>
                        <div className="flex flex-wrap justify-center gap-0.5">
                          {visibleServices[2].tags.map((tag, i) => (
                            <span key={i} className="px-1 py-0.5 bg-white/[0.06] border border-white/[0.08] text-[5px] text-gray-400 rounded">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Engineering - Bottom right with gradient */}
                  {visibleServices[3] && (
                    <div className="bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-emerald-800/20 border border-emerald-500/20 rounded-lg p-3 relative overflow-hidden min-h-[100px]">
                      {/* Dashboard/blocks illustration */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-70">
                        <div className="w-2.5 h-1.5 rounded-sm bg-emerald-500/40 border border-emerald-500/30" />
                        <div className="w-2.5 h-1.5 rounded-sm bg-emerald-500/40 border border-emerald-500/30" />
                        <div className="w-2.5 h-1.5 rounded-sm bg-emerald-500/40 border border-emerald-500/30" />
                      </div>
                      <div className="absolute top-4 left-1/2 -translate-x-1/2">
                        <div className="w-4 h-1.5 rounded-sm bg-emerald-500/30 border border-emerald-500/20" />
                      </div>
                      <div className="mt-12 text-center">
                        <h3 className="text-[8px] font-semibold text-white mb-0.5">{visibleServices[3].title}</h3>
                        <p className="text-[6px] text-gray-400 leading-relaxed mb-1.5 line-clamp-2">{visibleServices[3].description}</p>
                        <div className="flex flex-wrap justify-center gap-0.5">
                          {visibleServices[3].tags.map((tag, i) => (
                            <span key={i} className="px-1 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-[5px] text-emerald-300 rounded">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Explore All Services Button */}
                <div className="text-center mt-3 relative z-10">
                  <button className="px-3 py-1 bg-transparent hover:bg-white/[0.04] text-white text-[8px] font-medium rounded border border-white/[0.15] transition-colors">
                    Explore All Services →
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">{visibleServices.length}</p>
                <p className="text-[10px] text-gray-400 mt-1">Active Services</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{services.length - visibleServices.length}</p>
                <p className="text-[10px] text-gray-400 mt-1">Hidden</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
