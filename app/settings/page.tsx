"use client"

import { useState } from "react"
import { useAuth } from "@/lib/contexts/mock-auth-context"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    image: user?.image || "",
  })

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileData.name,
          image: profileData.image,
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update profile")
      }
      
      toast.success("Profile updated successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    const { signOut } = useAuth()
    signOut()
    router.push('/')
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateProfile} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <UserAvatar user={user} size="lg" />
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="image">Profile Picture URL</Label>
                    <Input
                      id="image"
                      name="image"
                      placeholder="https://example.com/avatar.jpg"
                      value={profileData.image || ""}
                      onChange={handleProfileChange}
                      disabled={isLoading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter a URL to your profile picture
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileData.name || ""}
                    onChange={handleProfileChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profileData.email || ""}
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Your email address is used for login and cannot be changed
                  </p>
                </div>
                
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Sign Out</h3>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account on this device
                </p>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign out
                </Button>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This action is irreversible. Please be certain.
                </p>
                <Button variant="destructive">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}