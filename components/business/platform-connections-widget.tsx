"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IconContainer } from "@/components/ui/icon-container"
import { Globe, RefreshCw, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PlatformType } from "@/models/PlatformConnection"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PlatformConnection {
  platform: PlatformType;
  isConnected: boolean;
  lastSyncedAt?: Date;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
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
  },
  instagram: {
    name: 'Instagram Business',
    description: 'Connect your Instagram Business Profile to sync business information',
    icon: 'instagram'
  },
  firmy: {
    name: 'Firmy.cz',
    description: 'Connect your Firmy.cz listing to sync business information',
    icon: 'firmy'
  }
} as const;

export function PlatformConnectionsWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [connections, setConnections] = useState<PlatformConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConnections()
  }, [])

  const fetchConnections = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/platform-connections')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch connections')
      }
      
      const data = await response.json()
      setConnections(data.connections.map((conn: any) => ({
        ...conn,
        syncStatus: conn.isConnected ? 'success' : 'idle'
      })))
    } catch (error) {
      console.error('Error fetching connections:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch platform connections')
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
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to initiate connection')
      }
      
      const data = await response.json()
      window.location.href = data.authUrl
    } catch (error) {
      console.error('Error connecting platform:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to connect platform')
    }
  }

  const handleDisconnect = async (platform: PlatformType) => {
    try {
      const response = await fetch(`/api/platform-connections/${platform}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to disconnect')
      }
      
      await fetchConnections()
      toast.success(`${PLATFORM_CONFIGS[platform].name} disconnected successfully`)
    } catch (error) {
      console.error('Error disconnecting platform:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to disconnect platform')
    }
  }

  const handleSync = async (platform: PlatformType) => {
    try {
      // Update local state to show syncing status
      setConnections(prev => prev.map(conn => 
        conn.platform === platform 
          ? { ...conn, syncStatus: 'syncing' }
          : conn
      ))
      
      const response = await fetch(`/api/platform-connections/${platform}/sync`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to sync')
      }
      
      const data = await response.json()
      setConnections(prev => prev.map(conn => 
        conn.platform === platform 
          ? { ...conn, syncStatus: 'success', lastSyncedAt: new Date(data.lastSyncedAt || Date.now()) }
          : conn
      ))
      toast.success(`${PLATFORM_CONFIGS[platform].name} synced successfully`)
    } catch (error) {
      console.error('Error syncing platform:', error)
      setConnections(prev => prev.map(conn => 
        conn.platform === platform 
          ? { ...conn, syncStatus: 'error', errorMessage: error instanceof Error ? error.message : 'Failed to sync' }
          : conn
      ))
      toast.error(error instanceof Error ? error.message : 'Failed to sync platform')
    }
  }

  return (
    <>
      {isLoading ? (
        <Card className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <p>Loading platform connections...</p>
        </Card>
      ) : error ? (
        <Card className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Card>
      ) : (
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
            <div className="space-y-3">
              {Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => {
                const connection = connections.find(c => c.platform === platform)
                return (
                  <div key={platform} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{config.name}</p>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                      {connection?.lastSyncedAt && (
                        <p className="text-xs text-muted-foreground">
                          Last synced: {new Date(connection.lastSyncedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {connection?.syncStatus === 'syncing' ? (
                        <Button variant="outline" size="sm" disabled>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Syncing...
                        </Button>
                      ) : connection?.syncStatus === 'success' ? (
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
                      ) : connection?.syncStatus === 'error' ? (
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-xs text-red-500">{connection.errorMessage}</p>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleConnect(platform as PlatformType)
                            }}
                          >
                            Retry
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
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Platform Connections</DialogTitle>
          </DialogHeader>
          {error ? (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4 mt-4">
              {Object.entries(PLATFORM_CONFIGS).map(([platform, config]) => {
                const connection = connections.find(c => c.platform === platform)
                return (
                  <div key={platform} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{config.name}</h4>
                        {connection?.syncStatus === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : connection?.syncStatus === 'error' ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : connection?.syncStatus === 'syncing' ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                      {connection?.lastSyncedAt && (
                        <p className="text-xs text-muted-foreground">
                          Last synced: {new Date(connection.lastSyncedAt).toLocaleString()}
                        </p>
                      )}
                      {connection?.syncStatus === 'error' && connection.errorMessage && (
                        <p className="text-xs text-red-500">{connection.errorMessage}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {connection?.syncStatus === 'syncing' ? (
                        <Button variant="outline" size="sm" disabled>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Syncing...
                        </Button>
                      ) : connection?.syncStatus === 'success' ? (
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
                      )
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
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}