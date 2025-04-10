"use client"

import { BusinessProvider } from "@/components/business/business-context"
import { BusinessDescriptionWidget } from "@/components/business/business-description-widget"
import { BusinessHoursWidget } from "@/components/business/business-hours-widget"
import { PlatformConnectionsWidget } from "@/components/business/platform-connections-widget"
import BusinessDebug from "@/app/components/BusinessDebug"

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
        <BusinessDebug />
        <div className="grid gap-6 md:grid-cols-2">
          <BusinessDescriptionWidget />
          <BusinessHoursWidget />
        </div>
        <div className="grid gap-6">
          <PlatformConnectionsWidget />
        </div>
      </div>
    </BusinessProvider>
  )
}