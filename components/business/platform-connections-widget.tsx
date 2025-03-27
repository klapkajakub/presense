"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IconContainer } from "@/components/ui/icon-container"
import { Globe, RefreshCw, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { PlatformType } from "@/models/PlatformConnection"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Platform connection interface
interface PlatformConnection {
  platform: PlatformType;
  isConnected: boolean;
  lastSyncedAt?: Date;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}

// Platform configuration with display information
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
  // Component state
  const [isOpen, setIsOpen] = useState(false)
  const [connections, setConnections] = useState<PlatformConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch connections on component mount
  useEffect(() => {
    fetchConnections()
  }, [])

  // Fetch platform connections from API
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

  // Handle platform connection
  const handleConnect = async (platform: PlatformType, e?: React.MouseEvent) => {
    // Prevent event propagation if event is provided
    if (e) e.stopPropagation()
    
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

  // Handle platform disconnection
  const handleDisconnect = async (platform: PlatformType, e?: React.MouseEvent) => {
    // Prevent event propagation if event is provided
    if (e) e.stopPropagation()
    
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

  // Handle platform sync
  const handleSync = async (platform: PlatformType, e?: React.MouseEvent) => {
    // Prevent event propagation if event is provided
    if (e) e.stopPropagation()
    
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

  // Render connection status icon based on sync status
  const renderStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'syncing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  // Render connection actions based on sync status
  const renderConnectionActions = (platform: PlatformType, connection?: PlatformConnection, inDialog = false) => {
    if (!connection) {
      return (
        <Button
          size="sm"
          onClick={(e) => inDialog ? handleConnect(platform) : handleConnect(platform, e)}
        >
          Connect
        </Button>
      )
    }

    if (connection.syncStatus === 'syncing') {
      return (
        <Button variant="outline" size="sm" disabled>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Syncing...
        </Button>
      )
    }

    if (connection.syncStatus === 'error') {
      return (
        <div className="flex flex-col items-end gap-1">
          <p className="text-xs text-red-500">{connection.errorMessage}</p>
          <Button
            size="sm"
            onClick={(e) => inDialog ? handleConnect(platform) : handleConnect(platform, e)}
          >
            Retry
          </Button>
        </div>
      )
    }

    // Success state
    return inDialog ? (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSync(platform)}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync Now
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleDisconnect(platform)}
        >
          Disconnect
        </Button>
      </>
    ) : (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => handleSync(platform, e)}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={(e) => handleDisconnect(platform, e)}
        >
          Disconnect
        </Button>
      </div>
    )
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
                      {renderConnectionActions(platform as PlatformType, connection)}
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
                        {renderStatusIcon(connection?.syncStatus)}
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
                      {renderConnectionActions(platform as PlatformType, connection, true)}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}