import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/api-utils';
import { toast } from 'sonner';
import { FaGoogle, FaFacebook, FaInstagram } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';

interface PlatformConnection {
  platform: string;
  isConnected: boolean;
  lastSyncedAt?: string;
}

export function PlatformConnections() {
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Load existing connections
  useEffect(() => {
    async function loadConnections() {
      try {
        setIsLoading(true);
        const response = await apiRequest('/api/platform-connections');
        
        if (response.success && response.data?.connections) {
          setConnections(response.data.connections);
        }
      } catch (error) {
        console.error('Error loading platform connections:', error);
        toast.error('Failed to load platform connections');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadConnections();
  }, []);

  // Connect to Google My Business
  const connectGoogleBusiness = async () => {
    try {
      setIsGoogleLoading(true);
      
      console.log("Requesting Google auth URL...");
      const response = await apiRequest('/api/platform-connections/google/auth');
      
      console.log("Google auth response:", response);
      
      if (response.success && response.data?.authUrl) {
        // Redirect to Google OAuth URL
        console.log("Redirecting to Google auth URL:", response.data.authUrl);
        window.location.href = response.data.authUrl;
      } else {
        const errorMessage = response.message || response.error || 'Failed to generate authentication URL';
        console.error("Google auth error:", errorMessage, response);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error connecting to Google Business:', error);
      
      // Show more detailed error message
      let errorMessage = 'Failed to connect to Google Business';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
      setIsGoogleLoading(false);
    }
  };

  // Disconnect from Google My Business
  const disconnectGoogleBusiness = async () => {
    try {
      setIsGoogleLoading(true);
      const response = await apiRequest('/api/platform-connections', {
        method: 'DELETE',
        body: JSON.stringify({ platform: 'google' })
      });
      
      if (response.success) {
        // Update local state
        setConnections(prev => 
          prev.filter(conn => conn.platform !== 'google')
            .concat([{ platform: 'google', isConnected: false }])
        );
        toast.success('Disconnected from Google Business');
      } else {
        throw new Error(response.error || 'Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting from Google Business:', error);
      toast.error('Failed to disconnect from Google Business');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Find connection status
  const isGoogleConnected = connections.find(conn => conn.platform === 'google')?.isConnected || false;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Platform Connections</CardTitle>
        <CardDescription>
          Connect your business profile to external platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Google Business Connection */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-blue-100 p-2">
                  <FaGoogle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Google Business Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    {isGoogleConnected 
                      ? 'Connected to Google Business Profile' 
                      : 'Connect to manage your Google Business Profile'}
                  </p>
                </div>
              </div>
              <Button
                variant={isGoogleConnected ? "outline" : "default"}
                onClick={isGoogleConnected ? disconnectGoogleBusiness : connectGoogleBusiness}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isGoogleConnected ? 'Disconnecting...' : 'Connecting...'}
                  </>
                ) : (
                  isGoogleConnected ? 'Disconnect' : 'Connect'
                )}
              </Button>
            </div>

            {/* Facebook Connection (Placeholder) */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-blue-100 p-2">
                  <FaFacebook className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Facebook Page</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to manage your Facebook business page
                  </p>
                </div>
              </div>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>

            {/* Instagram Connection (Placeholder) */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-pink-100 p-2">
                  <FaInstagram className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-medium">Instagram Business</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect to manage your Instagram business profile
                  </p>
                </div>
              </div>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/50 px-6 py-4">
        <p className="text-xs text-muted-foreground">
          Connecting to these platforms allows you to manage your business information across multiple sites from a single dashboard.
        </p>
      </CardFooter>
    </Card>
  );
} 