"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IconContainer } from "@/components/ui/icon-container"
import { Globe, RefreshCw, CheckCircle2, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PlatformType } from "@/models/PlatformConnection"

interface PlatformConnection {
  platform: PlatformType;
  isConnected: boolean;
  lastSyncedAt?: Date;
}

const PLATFORM_CONFIGS = {
  google: {
    name: 'Google My Business',
    description: 'Connect your Google Business Profile to sync business information',
    icon: 'google'
  },
  facebook: {
    name: 'Facebook Business',
    description: 'Connect your Facebook Business Page to sync business information',
    icon: 'facebook'
  }
} as const;

export function PlatformConnectionsWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [connections, setConnections] = useState<PlatformConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/platform-connections')
      if (!response.ok) throw new Error('Failed to fetch connections')
      const data = await response.json()
      setConnections(data.connections)
    } catch (error) {
      console.error('Error fetching connections:', error)
      toast.error('Failed to fetch platform connections')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async (platform: PlatformType) => {
    try {
      const response = await fetch(`/api/platform-connections/${platform}/auth`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to initiate connection')
      const data = await response.json()
      window.location.href = data.authUrl
    } catch (error) {
      console.error('Error connecting platform:', error)
      toast.error('Failed to connect platform')
    }
  }

  const handleDisconnect = async (platform: PlatformType) => {
    try {
      const response = await fetch(`/api/platform-connections/${platform}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to disconnect')
      await fetchConnections()
      toast.success('Platform disconnected successfully')
    } catch (error) {
      console.error('Error disconnecting platform:', error)
      toast.error('Failed to disconnect platform')
    }
  }

  const handleSync = async (platform: PlatformType) => {
    try {
      const response = await fetch(`/api/platform-connections/${platform}/sync`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to sync')
      await fetchConnections()
      toast.success('Platform synced successfully')
    } catch (error) {
      console.error('Error syncing platform:', error)
      toast.error('Failed to sync platform')
    }
  }

  return (
    <>
      <Card 
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconContainer icon={<Globe className="h-5 w-5" />} />
            <div>
              <CardTitle className="text-lg">Platform Connections</CardTitle>
              <CardDescription>Connect and sync your business profiles</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => {
              const connection = connections.find(c => c.platform === platform)
              return (
                <div key={platform} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{config.name}</p>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                  {connection?.isConnected ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSync(platform as PlatformType)
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDisconnect(platform as PlatformType)
                        }}
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleConnect(platform as PlatformType)
                      }}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Platform Connections</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => {
              const connection = connections.find(c => c.platform === platform)
              return (
                <div key={platform} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{config.name}</h4>
                      {connection?.isConnected ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                    {connection?.lastSyncedAt && (
                      <p className="text-xs text-muted-foreground">
                        Last synced: {new Date(connection.lastSyncedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {connection?.isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(platform as PlatformType)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Now
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDisconnect(platform as PlatformType)}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(platform as PlatformType)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 