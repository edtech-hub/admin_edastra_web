"use client"

import { useState, useRef } from 'react'

export interface NewTestimonial {
    title: string
    review: string
    reviewerName: string
    reviewerDesignation: string
    reviewerCompany: string
    reviewerImage: string
}

interface AddTestimonialFormProps {
    onAdd: (testimonial: NewTestimonial) => void
    isExpanded: boolean
    onToggle: () => void
}

const initialFormState: NewTestimonial = {
    title: '',
    review: '',
    reviewerName: '',
    reviewerDesignation: '',
    reviewerCompany: '',
    reviewerImage: '',
}

export default function AddTestimonialForm({ onAdd, isExpanded, onToggle }: AddTestimonialFormProps) {
    const [formData, setFormData] = useState<NewTestimonial>(initialFormState)
    const [imagePreview, setImagePreview] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64 = reader.result as string
                setImagePreview(base64)
                setFormData({ ...formData, reviewerImage: base64 })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = () => {
        if (!formData.title || !formData.review || !formData.reviewerName) {
            return
        }
        onAdd(formData)
        setFormData(initialFormState)
        setImagePreview('')
    }

    const handleCancel = () => {
        setFormData(initialFormState)
        setImagePreview('')
        onToggle()
    }

    return (
        <div className="bg-[#1e1e1e] border border-white/[0.06] rounded-xl overflow-hidden">
            {/* Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
                <span className="text-sm font-medium text-white">Add Testimonial</span>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Form */}
            {isExpanded && (
                <div className="p-4 space-y-3 border-t border-white/[0.04]">
                    {/* Title */}
                    <div>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                            placeholder="Title"
                        />
                    </div>

                    {/* Review */}
                    <div>
                        <input
                            type="text"
                            value={formData.review}
                            onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                            placeholder="Review"
                        />
                    </div>

                    {/* Reviewer Name */}
                    <div>
                        <input
                            type="text"
                            value={formData.reviewerName}
                            onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                            placeholder="Name of the reviewer"
                        />
                    </div>

                    {/* Designation */}
                    <div>
                        <input
                            type="text"
                            value={formData.reviewerDesignation}
                            onChange={(e) => setFormData({ ...formData, reviewerDesignation: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                            placeholder="Designation of the reviewer"
                        />
                    </div>

                    {/* Company */}
                    <div>
                        <input
                            type="text"
                            value={formData.reviewerCompany}
                            onChange={(e) => setFormData({ ...formData, reviewerCompany: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                            placeholder="Company of the reviewer"
                        />
                    </div>

                    {/* Image */}
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={imagePreview ? '1 image attached' : ''}
                            readOnly
                            className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none cursor-default"
                            placeholder="Image of the reviewer"
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-10 h-10 rounded-lg bg-[#252525] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white hover:border-emerald-500/30 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white text-sm transition-colors border border-white/[0.06]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Add Testimonial
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
