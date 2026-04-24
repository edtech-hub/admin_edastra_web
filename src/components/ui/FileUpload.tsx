"use client"

import { useState, useRef } from 'react'
import api from '@/lib/api'

interface UploadedFile {
  url: string
  key: string
  originalName: string
  size: number
  mimetype: string
}

interface FileUploadProps {
  folder?: string
  accept?: string
  multiple?: boolean
  maxSizeMB?: number
  onUpload: (files: UploadedFile | UploadedFile[]) => void
  className?: string
  label?: string
}

export default function FileUpload({
  folder = 'uploads',
  accept = 'image/*,application/pdf,video/mp4,video/webm',
  multiple = false,
  maxSizeMB = 10,
  onUpload,
  className = '',
  label = 'Upload File',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError('')
    setUploading(true)

    try {
      // Validate file sizes
      for (const file of Array.from(files)) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`${file.name} exceeds ${maxSizeMB}MB limit`)
          setUploading(false)
          return
        }
      }

      if (multiple && files.length > 1) {
        const formData = new FormData()
        Array.from(files).forEach((file) => formData.append('files', file))

        const res = await api.post(`/upload/multiple?folder=${folder}`, formData)
        onUpload(res.data.files)
      } else {
        const formData = new FormData()
        formData.append('file', files[0])

        const res = await api.post(`/upload?folder=${folder}`, formData)

        // Show preview for images
        if (files[0].type.startsWith('image/')) {
          setPreview(res.data.url)
        }

        onUpload(res.data)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 hover:text-white text-sm font-medium transition-all border border-white/[0.06] hover:border-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {label}
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />

      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}

      {preview && (
        <div className="mt-3 relative inline-block">
          <img src={preview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-white/[0.06]" />
          <button
            onClick={() => setPreview(null)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  )
}
