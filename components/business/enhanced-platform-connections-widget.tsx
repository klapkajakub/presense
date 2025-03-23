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

export function EnhancedPlatformConnectionsWidget() {
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
        syncStatus: 'idle'
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
          ? { ...conn, syncStatus: 'success', lastSyncedAt: new Date(data.lastSyncedAt) }
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {connections.map((conn) => (
        <Card key={conn.platform}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{PLATFORM_CONFIGS[conn.platform].name}</CardTitle>
            <div className="flex items-center space-x-2">
              <IconContainer icon={PLATFORM_CONFIGS[conn.platform].icon} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-medium text-gray-600">
              {conn.syncStatus === 'idle' ? 'Not connected' : conn.syncStatus === 'syncing' ? 'Connecting...' : conn.syncStatus === 'success' ? 'Connected' : 'Error'}
            </div>
            <div className="text-sm text-gray-500">
              {conn.syncStatus === 'success' ? conn.lastSyncedAt?.toLocaleDateString() : conn.errorMessage}
            </div>
          </CardContent>
          <div className="mt-4 flex items-center justify-between space-x-4">
            {conn.syncStatus === 'idle' && (
              <Button variant="outline" size="sm" onClick={() => handleConnect(conn.platform)}>
                Connect
              </Button>
            )}
            {conn.syncStatus === 'success' && (
              <Button variant="outline" size="sm" onClick={() => handleDisconnect(conn.platform)}>
                Disconnect
              </Button>
            )}
            {conn.syncStatus === 'idle' && (
              <Button variant="outline" size="sm" onClick={() => handleSync(conn.platform)}>
                Sync
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}