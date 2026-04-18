"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopBar from '@/components/layout/TopBar'
import api from '@/lib/api'
import Image from 'next/image'

interface Project {
  id: string
  title: string
  type: string
  tagline: string
  purpose: string
  year: string
  image: string
  websiteUrl: string
  isVisible?: boolean
}

interface HeaderData {
  title: string
  description: string
  tags: string[]
}

const initialProjectForm = {
  title: '',
  type: '',
  tagline: '',
  purpose: '',
  year: '',
  image: '',
  websiteUrl: '',
}

const defaultHeader: HeaderData = {
  title: 'Our Works',
  description: '',
  tags: ['All', 'New Projects', 'Creative', 'Online Store', 'Web Solution', 'Landing Page', 'Entertainment/Leisure'],
}

const defaultProjects: Project[] = [
  {
    id: '1',
    title: 'Reno Research',
    type: 'Website',
    tagline: 'Interior design platform connecting homeowners with designers in Singapore',
    purpose: 'A comprehensive platform with hundreds of verified vendors, project showcases, and a smart quote-request system.',
    year: '2026',
    image: '',
    websiteUrl: 'https://renoresearch.com',
    isVisible: true,
  },
  {
    id: '2',
    title: 'Ticgetz',
    type: 'Website',
    tagline: 'Event ticketing and booking platform',
    purpose: 'A fully functional event booking platform with intuitive UI for both organizers and attendees.',
    year: '2025',
    image: '',
    websiteUrl: 'https://ticgetz.com',
    isVisible: true,
  },
  {
    id: '3',
    title: 'Reno Research App',
    type: 'Mobile App',
    tagline: 'Mobile companion for the Reno Research platform',
    purpose: 'Native mobile experience for browsing designers, viewing portfolios, and requesting quotes on the go.',
    year: '2025',
    image: '',
    websiteUrl: '',
    isVisible: true,
  },
  {
    id: '4',
    title: 'Wedding Clickz-Quotation',
    type: 'Web Tool',
    tagline: 'Automated quotation tool for wedding photography',
    purpose: 'Couples select events and services to get professional quotes emailed instantly. Over 400 quotes generated.',
    year: '2024',
    image: '',
    websiteUrl: '',
    isVisible: true,
  },
  {
    id: '5',
    title: 'Flow',
    type: 'E-commerce',
    tagline: 'Premium hydration brand e-commerce platform',
    purpose: 'Clean, modern storefront with seamless product pages and smooth checkout flow.',
    year: '2024',
    image: '',
    websiteUrl: '',
    isVisible: true,
  },
  {
    id: '6',
    title: 'Wedding Clickz-website',
    type: 'Website',
    tagline: 'Premium wedding photography studio website',
    purpose: 'Sleek, cinematic landing page for a high-end wedding photography studio serving India and Dubai.',
    year: '2024',
    image: '',
    websiteUrl: '',
    isVisible: true,
  },
]

export default function OurWorkPageDedicated() {
  const [projects, setProjects] = useState<Project[]>([])
  const [header, setHeader] = useState<HeaderData>(defaultHeader)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState(initialProjectForm)
  const [newImagePreview, setNewImagePreview] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [editingHeader, setEditingHeader] = useState<{ title: boolean, description: boolean, tags: boolean }>({
    title: false,
    description: false,
    tags: false,
  })
  const newFileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/settings')
      const settings = response.data.data

      const projectsSettings = settings.find((s: { key: string }) => s.key === 'our_work_page_projects')
      const headerSettings = settings.find((s: { key: string }) => s.key === 'our_work_page_header')

      if (projectsSettings?.value && projectsSettings.value.length > 0) {
        setProjects(projectsSettings.value)
      } else {
        setProjects(defaultProjects)
      }
      if (headerSettings?.value) {
        setHeader(headerSettings.value)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setProjects(defaultProjects)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const saveProjects = async (updatedProjects: Project[]) => {
    setIsSaving(true)
    try {
      await api.put('/settings', {
        key: 'our_work_page_projects',
        value: updatedProjects,
        description: 'Our Work page projects'
      })
      setProjects(updatedProjects)
    } catch (error) {
      console.error('Error saving projects:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const saveHeader = async (updatedHeader: HeaderData) => {
    try {
      await api.put('/settings', {
        key: 'our_work_page_header',
        value: updatedHeader,
        description: 'Our Work page header'
      })
      setHeader(updatedHeader)
    } catch (error) {
      console.error('Error saving header:', error)
    }
  }

  const handleHeaderTitleChange = (value: string) => {
    const updated = { ...header, title: value }
    setHeader(updated)
  }

  const handleHeaderDescriptionChange = (value: string) => {
    const updated = { ...header, description: value }
    setHeader(updated)
  }

  const handleHeaderBlur = () => {
    saveHeader(header)
    setEditingHeader({ title: false, description: false, tags: false })
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = { ...header, tags: header.tags.filter(t => t !== tagToRemove) }
    setHeader(updated)
    saveHeader(updated)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !header.tags.includes(newTag.trim())) {
      const updated = { ...header, tags: [...header.tags, newTag.trim()] }
      setHeader(updated)
      saveHeader(updated)
      setNewTag('')
    }
  }

  const handleAddTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setNewImagePreview(base64)
        setNewProject({ ...newProject, image: base64 })
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

  const handleAddProject = async () => {
    if (!newProject.title) return
    const project: Project = {
      id: Date.now().toString(),
      ...newProject,
      isVisible: true,
    }
    await saveProjects([...projects, project])
    setNewProject(initialProjectForm)
    setNewImagePreview('')
    setAddSuccess(true)
    setTimeout(() => setAddSuccess(false), 3000)
  }

  const startEditing = (project: Project) => {
    setEditingId(project.id)
    setEditData({ ...project })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditData(null)
  }

  const saveEdit = () => {
    if (!editData) return
    const updatedProjects = projects.map(p =>
      p.id === editData.id ? editData : p
    )
    saveProjects(updatedProjects)
    setEditingId(null)
    setEditData(null)
  }

  const handleDeleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const updatedProjects = projects.filter(p => p.id !== id)
      saveProjects(updatedProjects)
    }
  }

  const handleToggleVisibility = (id: string) => {
    const updatedProjects = projects.map(p =>
      p.id === id ? { ...p, isVisible: !p.isVisible } : p
    )
    saveProjects(updatedProjects)
  }

  const handleResetToDefault = () => {
    if (confirm('This will replace all current projects with the defaults. Continue?')) {
      saveProjects(defaultProjects)
      saveHeader(defaultHeader)
    }
  }

  const visibleProjects = projects.filter(p => p.isVisible !== false)

  if (isLoading) {
    return (
      <DashboardLayout>
        <TopBar title="Website Controls" subtitle="Our Work" />
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
      <TopBar title="Website Controls" subtitle="Our Work" />
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
                {/* Title */}
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1.5">Title</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={header.title}
                      onChange={(e) => handleHeaderTitleChange(e.target.value)}
                      onBlur={handleHeaderBlur}
                      className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                      placeholder="Section title"
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

                {/* Description */}
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1.5">Description</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={header.description}
                      onChange={(e) => handleHeaderDescriptionChange(e.target.value)}
                      onBlur={handleHeaderBlur}
                      className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                      placeholder="Section description"
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

                {/* Tags */}
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {header.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#252525] border border-white/[0.06] text-xs text-white"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
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
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={handleAddTagKeyDown}
                        className="w-24 bg-[#252525] border border-white/[0.06] rounded-full px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
                        placeholder="Add tag..."
                      />
                      <button
                        onClick={handleAddTag}
                        className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <button className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center text-gray-400 hover:text-white transition-colors ml-auto">
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

            {/* Projects Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Projects</h2>
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

              {/* Project Cards */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {projects.map((project, index) => (
                  <div key={project.id} className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl overflow-hidden">
                    {/* Project Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.04]">
                      <span className="text-sm font-medium text-white">
                        Project {index + 1} - {project.title}{project.type ? ` - ${project.type}` : ''}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleVisibility(project.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${project.isVisible !== false
                            ? 'bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white'
                            : 'bg-amber-500/20 text-amber-400'
                            }`}
                          title={project.isVisible !== false ? "Hide" : "Show"}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {project.isVisible !== false ? (
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
                          onClick={() => editingId === project.id ? cancelEditing() : startEditing(project)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${editingId === project.id
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
                    {editingId === project.id && editData && (
                      <div className="p-4 space-y-3">
                        <p className="text-xs text-gray-500 mb-2">Edit Project</p>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Title</label>
                          <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                            placeholder="Project title"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Type/App</label>
                          <input
                            type="text"
                            value={editData.type}
                            onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                            placeholder="Website, Mobile App, etc."
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Tagline</label>
                          <input
                            type="text"
                            value={editData.tagline}
                            onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                            placeholder="Short tagline"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Purpose</label>
                          <textarea
                            value={editData.purpose}
                            onChange={(e) => setEditData({ ...editData, purpose: e.target.value })}
                            rows={5}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 resize-none"
                            placeholder="Project purpose and details"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Year</label>
                          <input
                            type="text"
                            value={editData.year}
                            onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                            placeholder="2026"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Image</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editData.image ? '1 image attached' : 'No image'}
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
                          {editData.image && (
                            <div className="mt-1 flex items-center gap-1">
                              <span className="text-emerald-400 text-xs">✓</span>
                              <span className="text-xs text-gray-500">Image ready</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1">Website URL</label>
                          <input
                            type="text"
                            value={editData.websiteUrl}
                            onChange={(e) => setEditData({ ...editData, websiteUrl: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                            placeholder="https://example.com"
                          />
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

              {/* Add Project Form */}
              <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-sm font-medium text-white">Add Project</span>
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
                      <label className="block text-[10px] text-gray-500 mb-1.5">Title</label>
                      <input
                        type="text"
                        value={newProject.title}
                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
                        placeholder="Project title"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1.5">Tagline</label>
                      <input
                        type="text"
                        value={newProject.tagline}
                        onChange={(e) => setNewProject({ ...newProject, tagline: e.target.value })}
                        className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30"
                        placeholder="Short tagline"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1.5">Details</label>
                      <textarea
                        value={newProject.purpose}
                        onChange={(e) => setNewProject({ ...newProject, purpose: e.target.value })}
                        rows={5}
                        className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/30 resize-none"
                        placeholder="Project details"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1.5">Image</label>
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
                          <span className="text-xs text-emerald-400">✓ Image ready</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setNewProject(initialProjectForm)
                          setNewImagePreview('')
                          setShowAddForm(false)
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white text-sm transition-colors border border-white/[0.06]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddProject}
                        disabled={!newProject.title || isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        {isSaving ? 'Adding...' : 'Add project'}
                      </button>
                    </div>

                    {addSuccess && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-emerald-400">Project added successfully!</span>
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
                  edastra.in/our-works
                </div>
              </div>

              {/* Preview Content - Our Works Page */}
              <div className="p-4 bg-gradient-to-b from-[#0a1015] to-[#0d1318] min-h-[500px]">
                {/* Navigation preview */}
                <div className="flex items-center justify-between mb-6 text-[8px]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500" />
                    <span className="text-white font-medium">EDASTRA</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <span>Services</span>
                    <span>Contact</span>
                    <span>Testimonials</span>
                    <span>About Us</span>
                    <span className="text-emerald-400">Let&apos;s Connect</span>
                  </div>
                </div>

                {/* Our Works Header */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-emerald-400 mb-2">{header.title}</h1>
                  {header.description && (
                    <p className="text-[10px] text-gray-400 mb-3">{header.description}</p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {header.tags.slice(0, 6).map((tag, i) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 rounded text-[8px] ${i === 0
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-gray-400 border border-white/10'
                          }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Project Grid Preview */}
                <div className="grid grid-cols-3 gap-2">
                  {visibleProjects.slice(0, 6).map((project) => (
                    <div
                      key={project.id}
                      className="bg-gradient-to-br from-[#1a2530] to-[#0d1820] rounded-lg overflow-hidden border border-white/5 hover:border-emerald-500/30 transition-colors"
                    >
                      {/* Project Image */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-orange-600/20 to-amber-700/20 relative">
                        {project.image ? (
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                              <span className="text-white text-[8px] font-bold">{project.title.charAt(0)}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Project Info */}
                      <div className="p-2">
                        <h3 className="text-[9px] font-semibold text-white truncate">{project.title}</h3>
                        <p className="text-[7px] text-gray-500 truncate">{project.type || 'Website'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Let's Connect button */}
                <div className="mt-6 text-center">
                  <button className="px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-[9px] hover:bg-emerald-500/30 transition-colors">
                    Let&apos;s Connect
                  </button>
                </div>
              </div>
            </div>

            {/* Single Project Preview */}
            {editingId && editData && (
              <div className="bg-[#1e1e1e] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-3 py-2 bg-[#252525] border-b border-white/[0.04]">
                  <span className="text-[10px] text-gray-500">Project Preview</span>
                </div>
                <div className="p-4 bg-gradient-to-b from-[#0a1015] to-[#0d1318]">
                  <div className="bg-gradient-to-br from-[#1a2530] to-[#0d1820] rounded-xl overflow-hidden border border-white/10">
                    {/* Project Image */}
                    <div className="aspect-video bg-gradient-to-br from-orange-600/30 to-amber-700/30 relative">
                      {editData.image ? (
                        <Image
                          src={editData.image}
                          alt={editData.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">{editData.title.charAt(0)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] rounded">
                          {editData.type || 'Website'}
                        </span>
                        <span className="text-[9px] text-gray-500">{editData.year}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">{editData.title}</h3>
                      <p className="text-[10px] text-emerald-400 mb-2">{editData.tagline}</p>
                      <p className="text-[10px] text-gray-400 line-clamp-3">{editData.purpose}</p>

                      {editData.websiteUrl && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <span className="text-[9px] text-gray-500">
                            {editData.websiteUrl}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-400">{visibleProjects.length}</p>
                <p className="text-[10px] text-gray-400 mt-1">Visible Projects</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{projects.length - visibleProjects.length}</p>
                <p className="text-[10px] text-gray-400 mt-1">Hidden</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
