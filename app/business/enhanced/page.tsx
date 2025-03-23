'use client'

import { EnhancedBusinessProvider } from '@/components/business/enhanced-business-context'
import { EnhancedBusinessDescriptionWidget } from '@/components/business/enhanced-business-description-widget'
import { EnhancedPlatformConnectionsWidget } from '@/components/business/enhanced-platform-connections-widget'

export default function EnhancedBusinessPage() {
  return (
    <EnhancedBusinessProvider>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Enhanced Business Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EnhancedBusinessDescriptionWidget />
          <EnhancedPlatformConnectionsWidget />
        </div>
      </div>
    </EnhancedBusinessProvider>
  )
}