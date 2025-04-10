"use client"

import { BusinessDescriptionWidget } from "@/components/business/business-description-widget"
import { BusinessHoursWidget } from "@/components/business/business-hours-widget"
import { PlatformConnectionsWidget } from "@/components/business/platform-connections-widget"
import { BusinessProvider } from "@/components/business/business-context"
import { FAQConfiguratorWidget } from "@/components/business/faq-configurator-widget"
import { InternetPresenceScoreWidget } from "@/components/business/internet-presence-score-widget"
import { PlatformVariantsWidget } from "@/components/business/platform-variants-widget"

export default function HomePage() {
  return (
    <BusinessProvider>
      <div className="flex flex-col gap-8 p-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your business information and platform-specific content
          </p>
        </div>
        
        {/* Score widget takes full width */}
        <div className="grid gap-6">
          <InternetPresenceScoreWidget />
        </div>
        
        {/* Two-column layout for main widgets */}
        <div className="grid gap-6 md:grid-cols-2">
          <BusinessDescriptionWidget />
          <BusinessHoursWidget />
          <PlatformVariantsWidget />
          <FAQConfiguratorWidget />
        </div>
        
        {/* Platform connections takes full width */}
        <div className="grid gap-6">
          <PlatformConnectionsWidget />
        </div>
      </div>
    </BusinessProvider>
  )
}