"use client"

import DashboardLayout from '@/components/layout/DashboardLayout'
import TopBar from '@/components/layout/TopBar'

export default function OurWorkPage() {
  return (
    <DashboardLayout>
      <TopBar title="Our Work" subtitle="Customize your portfolio section content with ease" />
      <div className="p-6">
        <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-xl p-12 text-center">
          <p className="text-sm text-gray-500">Coming soon</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
