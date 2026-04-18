"use client"

import Image from 'next/image'
import { Testimonial } from './TestimonialCard'

interface TestimonialPreviewProps {
    testimonials: Testimonial[]
}

export default function TestimonialPreview({ testimonials }: TestimonialPreviewProps) {
    const previewTestimonial = testimonials[0]

    return (
        <div className="bg-[#1e1e1e] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.04]">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Preview</span>
            </div>

            <div className="p-4">
                {/* Preview Card - mimicking the main site style */}
                <div className="bg-gradient-to-br from-[#1a2a3a] to-[#0d1a25] rounded-xl overflow-hidden shadow-xl">
                    {/* Background pattern/image area */}
                    <div className="relative h-32 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-lg" />
                            <div className="absolute top-8 right-8 w-12 h-12 bg-white/5 rounded-full" />
                        </div>

                        {previewTestimonial?.reviewerImage && (
                            <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400">
                                <Image
                                    src={previewTestimonial.reviewerImage}
                                    alt="Reviewer"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Rating stars */}
                        <div className="absolute top-4 right-4 flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                    </div>

                    {/* Content area */}
                    <div className="p-4">
                        <h3 className="text-xl font-bold text-emerald-400 mb-2">
                            {previewTestimonial?.title || 'Premium'}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                            {previewTestimonial?.review || 'Amazing experience working with the team...'}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white font-medium">
                                {previewTestimonial?.reviewerName || 'John Doe'}
                            </span>
                            <span className="text-[10px] text-gray-500">•</span>
                            <span className="text-[10px] text-gray-500">
                                {previewTestimonial?.reviewerDesignation || 'CEO'}
                            </span>
                        </div>
                    </div>
                </div>

                {testimonials.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-sm text-gray-500">No testimonials to preview</p>
                    </div>
                )}
            </div>
        </div>
    )
}
