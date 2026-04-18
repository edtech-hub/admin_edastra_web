"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import TopBar from '@/components/layout/TopBar'
import api from '@/lib/api'
import Image from 'next/image'

interface Project {
  id: string
  title: string
  tagline: string
  details: string
  image: string
}

const initialProjectForm = {
  title: '',
  tagline: '',
  details: '',
  image: '',
}

const defaultProjects: Project[] = [
  {
    id: '1',
    title: 'Reno Research',
    tagline: 'Smart interior design matching platform',
    details: 'A comprehensive platform with hundreds of verified vendors, project showcases, and a smart quote-request system.',
    image: 'https://edastra.in/projects/renoproject.png',
  },
  {
    id: '2',
    title: 'Reno Research Interiors',
    tagline: 'Interior marketplace platform',
    details: 'Interior designers lacked a dedicated space to showcase portfolios and connect with clients.',
    image: 'https://edastra.in/projects/renoproject2.png',
  },
  {
    id: '3',
    title: 'Wedding Cliqz',
    tagline: 'Wedding coordination mobile app',
    details: 'Couples and vendors struggled to coordinate bookings, timelines and communication.',
    image: 'https://edastra.in/projects/weddingclickzproject.png',
  },
  {
    id: '4',
    title: 'Flow Hydration',
    tagline: 'Premium wellness e-commerce',
    details: 'Clean, modern storefront with seamless product pages and smooth checkout flow.',
    image: 'https://edastra.in/projects/flowproject.jpg',
  },
  {
    id: '5',
    title: 'Add Flow',
    tagline: 'Marketing campaign SaaS',
    details: 'Marketing teams had no unified way to manage ad campaigns across multiple channels.',
    image: 'https://edastra.in/projects/flowproject.jpg',
  },
  {
    id: '6',
    title: 'Event Ticketing',
    tagline: 'Seamless event ticketing platform',
    details: 'Complex event coordination and ticket sales with no automation.',
    image: 'https://edastra.in/projects/ticgetz_project.jpg',
  },
]

export default function OurWorkPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [displayCount, setDisplayCount] = useState(6)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState(initialProjectForm)
  const [newImagePreview, setNewImagePreview] = useState('')
  const [addSuccess, setAddSuccess] = useState(false)
  const newFileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  const fetchProjects = useCallback(async () => {
    try {
      const response = await api.get('/settings')
      const settings = response.data.data

      const projectsSettings = settings.find((s: { key: string }) => s.key === 'our_work_projects')
      const countSettings = settings.find((s: { key: string }) => s.key === 'our_work_count')

      if (projectsSettings?.value && projectsSettings.value.length > 0) {
        setProjects(projectsSettings.value)
      } else {
        setProjects(defaultProjects)
      }
      if (countSettings?.value) {
        setDisplayCount(countSettings.value)
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
        key: 'our_work_projects',
        value: updatedProjects,
        description: 'Our Work section projects'
      })
      setProjects(updatedProjects)
    } catch (error) {
      console.error('Error saving projects:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const saveDisplayCount = async (count: number) => {
    try {
      await api.put('/settings', {
        key: 'our_work_count',
        value: count,
        description: 'Number of projects displayed'
      })
      setDisplayCount(count)
    } catch (error) {
      console.error('Error saving count:', error)
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
      saveProjects(projects.filter(p => p.id !== id))
    }
  }

  const visibleProjects = projects.slice(0, displayCount)
  const gridCols = displayCount <= 4 ? 2 : displayCount <= 6 ? 3 : 4

  if (isLoading) {
    return (
      <DashboardLayout>
        <TopBar title="Our Work" subtitle="Customize your hero section content with ease" />
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
      <TopBar title="Our Work" subtitle="Customize your hero section content with ease" />
      <div className="p-6">
        <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column */}
            <div className="flex-1 space-y-5">
              {/* Display Count */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Number of projects displayed</label>
                <input
                  type="text"
                  value={`${displayCount} (2 X ${Math.ceil(displayCount / 2)})`}
                  onChange={(e) => {
                    const num = parseInt(e.target.value) || 6
                    saveDisplayCount(num)
                  }}
                  className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                />
              </div>

              {/* Cards List */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Cards</label>
                <div className="space-y-2">
                  {projects.map((project, index) => (
                    <div key={project.id}>
                      <div
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors ${editingId === project.id
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : 'bg-[#252525] border-white/[0.06]'
                          }`}
                      >
                        <span className={`text-sm ${editingId === project.id ? 'text-emerald-400' : 'text-white'}`}>
                          Project {index + 1} - {project.image ? 'attached' : 'no image'}
                        </span>
                        <button
                          onClick={() => editingId === project.id ? cancelEditing() : startEditing(project)}
                          className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${editingId === project.id ? 'text-emerald-400' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>

                      {/* Edit Form */}
                      {editingId === project.id && editData && (
                        <div className="mt-2 p-4 bg-[#1e1e1e] border border-emerald-500/20 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Edit Project</span>
                            <button onClick={() => handleDeleteProject(project.id)} className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>

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
                            <label className="block text-[10px] text-gray-500 mb-1">Tagline</label>
                            <input
                              type="text"
                              value={editData.tagline}
                              onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                              className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-gray-500 mb-1">Details</label>
                            <textarea
                              value={editData.details}
                              onChange={(e) => setEditData({ ...editData, details: e.target.value })}
                              rows={6}
                              className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/30 resize-none"
                            />
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
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <button onClick={cancelEditing} className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 text-xs border border-white/[0.06]">Cancel</button>
                            <button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Project */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Add Project</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={newProject.tagline}
                    onChange={(e) => setNewProject({ ...newProject, tagline: e.target.value })}
                    className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                    placeholder="Tagline"
                  />
                  <input
                    type="text"
                    value={newProject.details}
                    onChange={(e) => setNewProject({ ...newProject, details: e.target.value })}
                    className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/30"
                    placeholder="Details"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newImagePreview ? '1 image attached' : ''}
                      readOnly
                      className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white cursor-default"
                      placeholder="Image"
                    />
                    <input ref={newFileInputRef} type="file" accept="image/*" onChange={handleNewImageChange} className="hidden" />
                    <button onClick={() => newFileInputRef.current?.click()} className="w-10 h-10 rounded-lg bg-[#252525] border border-white/[0.06] text-gray-400 hover:text-white flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => { setNewProject(initialProjectForm); setNewImagePreview('') }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 text-sm border border-white/[0.06]"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>
                      Discard
                    </button>
                    <button
                      onClick={handleAddProject}
                      disabled={!newProject.title || isSaving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white text-sm font-medium"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                      Add project
                    </button>
                  </div>

                  {addSuccess && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm text-emerald-400">Project added!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:w-[380px] space-y-4">
              <label className="block text-xs text-gray-500 uppercase tracking-wide">PREVIEW</label>

              <div className="bg-[#0a0f14] border border-white/[0.06] rounded-xl overflow-hidden">
                {/* Preview Header */}
                <div className="p-4 text-center border-b border-white/[0.04]">
                  <p className="text-[8px] text-emerald-400 uppercase tracking-widest mb-1">OUR WORK</p>
                  <h3 className="text-sm font-medium text-white">Our Work</h3>
                  <p className="text-[8px] text-gray-500 mt-1">Real products, real outcomes.</p>
                </div>

                {/* Preview Grid */}
                <div className="p-3">
                  <div className={`grid grid-cols-2 gap-2`}>
                    {visibleProjects.slice(0, 4).map((project) => (
                      <div key={project.id} className="bg-[#0d1318] border border-white/[0.08] rounded-lg overflow-hidden">
                        {project.image ? (
                          <div className="h-16 relative">
                            <Image
                              src={project.image}
                              alt={project.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 bg-gradient-to-br from-emerald-900/30 to-teal-900/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-emerald-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-[7px] font-medium text-white truncate">{project.title}</p>
                          <p className="text-[6px] text-gray-500 truncate">{project.tagline}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats */}
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
