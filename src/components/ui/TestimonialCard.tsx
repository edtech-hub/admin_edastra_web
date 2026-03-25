"use client"

import { useState, useRef } from 'react'
import Image from 'next/image'

export interface Testimonial {
    id: string
    title: string
    review: string
    reviewerName: string
    reviewerDesignation: string
    reviewerCompany: string
    reviewerImage: string
}

interface TestimonialCardProps {
    testimonial: Testimonial
    index: number
    onUpdate: (testimonial: Testimonial) => void
    onDelete: (id: string) => void
}

export default function TestimonialCard({ testimonial, index, onUpdate, onDelete }: TestimonialCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState<Testimonial>(testimonial)
    const [imagePreview, setImagePreview] = useState<string>(testimonial.reviewerImage)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64 = reader.result as string
                setImagePreview(base64)
                setEditData({ ...editData, reviewerImage: base64 })
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = () => {
        onUpdate(editData)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditData(testimonial)
        setImagePreview(testimonial.reviewerImage)
        setIsEditing(false)
    }

    return (
        <div className="bg-[#1e1e1e] border border-white/[0.06] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border-b border-white/[0.04]">
                <span className="text-sm font-medium text-white">Review {index + 1}</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDelete(testimonial.id)}
                        className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    <button
                        className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        title="Preview"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isEditing
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
            {isEditing && (
                <div className="p-4 space-y-3 border-b border-white/[0.04]">
                    <p className="text-xs text-gray-500 mb-3">Edit Review</p>

                    {/* Title */}
                    <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Title</label>
                        <input
                            type="text"
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                            placeholder="Review title"
                        />
                    </div>

                    {/* Review */}
                    <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Review</label>
                        <textarea
                            value={editData.review}
                            onChange={(e) => setEditData({ ...editData, review: e.target.value })}
                            rows={3}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30 resize-none"
                            placeholder="Review content"
                        />
                    </div>

                    {/* Reviewer Name */}
                    <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Name of the reviewer</label>
                        <input
                            type="text"
                            value={editData.reviewerName}
                            onChange={(e) => setEditData({ ...editData, reviewerName: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                            placeholder="John Doe"
                        />
                    </div>

                    {/* Designation */}
                    <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Designation of the reviewer</label>
                        <input
                            type="text"
                            value={editData.reviewerDesignation}
                            onChange={(e) => setEditData({ ...editData, reviewerDesignation: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                            placeholder="CEO"
                        />
                    </div>

                    {/* Company */}
                    <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Company of the reviewer</label>
                        <input
                            type="text"
                            value={editData.reviewerCompany}
                            onChange={(e) => setEditData({ ...editData, reviewerCompany: e.target.value })}
                            className="w-full bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/30"
                            placeholder="Company Name"
                        />
                    </div>

                    {/* Image */}
                    <div>
                        <label className="block text-[10px] text-gray-500 mb-1.5">Image of the reviewer</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={imagePreview ? '1 image attached' : 'No image'}
                                readOnly
                                className="flex-1 bg-[#252525] border border-white/[0.06] rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none cursor-default"
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
                        {imagePreview && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-emerald-400 text-xs">✓</span>
                                <span className="text-xs text-gray-400">Image uploaded</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white text-sm transition-colors border border-white/[0.06]"
                        >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                            </svg>
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save changes
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
