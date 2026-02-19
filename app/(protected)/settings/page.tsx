"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight, Check, Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api, { updateUser, changePassword } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { SUBSPECIALTIES, RESEARCH_TYPES } from "@/lib/constants"

interface UserProfile {
    id: string
    email: string
    full_name?: string
    profile?: {
        workplace?: string
    }
}

interface Preferences {
    subspecialties: string[]
    research_types: string[]
    notifications?: {
        frequency: string
        email_enabled: boolean
        push_enabled: boolean
        whatsapp_enabled: boolean
    }
}

export default function SettingsPage() {
    const router = useRouter()
    const queryClient = useQueryClient()

    // Local state for preferences
    const [localSubspecialties, setLocalSubspecialties] = React.useState<string[]>([])
    const [localResearchTypes, setLocalResearchTypes] = React.useState<string[]>([])
    const [localNotifications, setLocalNotifications] = React.useState({
        email_enabled: true,
        push_enabled: false,
        whatsapp_enabled: false,
        frequency: "weekly"
    })
    const [hasChanges, setHasChanges] = React.useState(false)

    // UI state
    const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false)
    const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false)

    // Form state
    const [profileForm, setProfileForm] = React.useState({ full_name: "", workplace: "" })
    const [passwordForm, setPasswordForm] = React.useState({ current_password: "", new_password: "" })

    // Fetch User Profile (Account Info)
    const { data: userData, isLoading: isUserLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const res = await api.get("/auth/me")
            return res.data.data as UserProfile
        },
    })

    // Initialize profile form when user data loads
    React.useEffect(() => {
        if (userData) {
            setProfileForm({
                full_name: userData.full_name || "",
                workplace: userData.profile?.workplace || ""
            })
        }
    }, [userData])

    // Fetch Preferences
    const { data: prefsData, isLoading: isPrefsLoading } = useQuery({
        queryKey: ["preferences"],
        queryFn: async () => {
            const res = await api.get("/me/preferences/")
            return res.data.data as Preferences
        },
    })

    // Sync local state with fetched data
    React.useEffect(() => {
        if (prefsData) {
            setLocalSubspecialties(prefsData.subspecialties || [])
            setLocalResearchTypes(prefsData.research_types || [])
            if (prefsData.notifications) {
                setLocalNotifications({
                    email_enabled: prefsData.notifications.email_enabled,
                    push_enabled: prefsData.notifications.push_enabled,
                    whatsapp_enabled: prefsData.notifications.whatsapp_enabled,
                    frequency: prefsData.notifications.frequency
                })
            }
            setHasChanges(false)
        }
    }, [prefsData])

    // Update check
    React.useEffect(() => {
        if (!prefsData) return

        const subChanged = JSON.stringify(localSubspecialties.sort()) !== JSON.stringify((prefsData.subspecialties || []).sort())
        const rtChanged = JSON.stringify(localResearchTypes.sort()) !== JSON.stringify((prefsData.research_types || []).sort())

        const notifChanged = prefsData.notifications ? (
            localNotifications.email_enabled !== prefsData.notifications.email_enabled ||
            localNotifications.push_enabled !== prefsData.notifications.push_enabled
        ) : false

        setHasChanges(subChanged || rtChanged || notifChanged)
    }, [localSubspecialties, localResearchTypes, localNotifications, prefsData])


    // Save Mutation
    const updatePrefsMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                subspecialties: localSubspecialties,
                research_types: localResearchTypes,
                notifications: localNotifications
            }
            const res = await api.put("/me/preferences/", payload)
            return res.data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["preferences"] })
            toast.success("Preferences saved successfully")
            setHasChanges(false)
        },
        onError: () => {
            toast.error("Failed to save preferences")
        }
    })

    // Update Profile Mutation
    const updateProfileMutation = useMutation({
        mutationFn: updateUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] })
            toast.success("Profile updated successfully")
            setIsEditProfileOpen(false)
        },
        onError: () => toast.error("Failed to update profile")
    })

    // Change Password Mutation
    const changePasswordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            toast.success("Password changed successfully")
            setIsChangePasswordOpen(false)
            setPasswordForm({ current_password: "", new_password: "" })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Failed to change password")
        }
    })

    // Export Data Handler
    const handleExportData = () => {
        const dataToExport = {
            profile: userData,
            preferences: prefsData,
            timestamp: new Date().toISOString()
        }
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `weekly_paper_update_data_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleLogout = () => {
        localStorage.removeItem("token")
        router.push("/login")
        toast.success("Logged out")
    }

    // Toggle Handlers
    const toggleSubspecialty = (key: string) => {
        setLocalSubspecialties(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        )
    }

    const toggleResearchType = (key: string) => {
        setLocalResearchTypes(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        )
    }

    // Select All Handlers
    const toggleAllSubspecialties = () => {
        const allSelected = SUBSPECIALTIES.every(s => localSubspecialties.includes(s.key))
        if (allSelected) {
            setLocalSubspecialties([])
        } else {
            setLocalSubspecialties(SUBSPECIALTIES.map(s => s.key))
        }
    }

    const toggleAllResearchTypes = () => {
        const allSelected = RESEARCH_TYPES.every(r => localResearchTypes.includes(r.key))
        if (allSelected) {
            setLocalResearchTypes([])
        } else {
            setLocalResearchTypes(RESEARCH_TYPES.map(r => r.key))
        }
    }

    if (isUserLoading || isPrefsLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="min-h-screen bg-[#FAFBFF]">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-[#E2E8F0] p-4 sticky top-0 z-10 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push('/dashboard')}
                        className="w-10 h-10 bg-white hover:bg-[#F2F6FF]"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#334155]" />
                    </Button>
                    <h1 className="text-xl md:text-2xl text-[#0F172A] font-semibold">Settings & Profile</h1>
                </div>

                {hasChanges && (
                    <Button
                        onClick={() => updatePrefsMutation.mutate()}
                        disabled={updatePrefsMutation.isPending}
                        className="bg-[#2F6FED] hover:bg-[#2459C7] text-white gap-2"
                    >
                        {updatePrefsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </Button>
                )}
            </div>

            <div className="max-w-4xl mx-auto p-4 md:p-8">
                {/* Account Information */}
                <div className="mb-6 border border-[#E2E8F0] bg-white p-6 rounded-md shadow-sm">
                    <h2 className="text-xl mb-4 text-[#0F172A] font-semibold">Account Information</h2>

                    <div className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <div className="text-sm text-[#64748B] mb-2">Full Name</div>
                            <div className="h-10 bg-[#F5F8FF] border border-[#E2E8F0] px-3 flex items-center rounded-md">
                                <span className="text-sm text-[#334155]">{userData?.full_name || "N/A"}</span>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <div className="text-sm text-[#64748B] mb-2">Email Address</div>
                            <div className="h-10 bg-[#F5F8FF] border border-[#E2E8F0] px-3 flex items-center rounded-md">
                                <span className="text-sm text-[#334155]">{userData?.email}</span>
                            </div>
                        </div>

                        {/* Institution Field */}
                        <div>
                            <div className="text-sm text-[#64748B] mb-2">Institution</div>
                            <div className="h-10 bg-[#F5F8FF] border border-[#E2E8F0] px-3 flex items-center rounded-md">
                                <span className="text-sm text-[#334155]">
                                    {/* Handle nested profile structure safely */}
                                    {userData?.profile?.workplace || "Not set"}
                                </span>
                            </div>
                        </div>

                        <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="bg-[#F2F6FF] hover:bg-[#E9F1FF] text-[#334155]">
                                    UPDATE ACCOUNT INFO
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                    <DialogDescription>
                                        Update your personal information here.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={profileForm.full_name}
                                            onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="workplace" className="text-right">
                                            Workplace
                                        </Label>
                                        <Input
                                            id="workplace"
                                            value={profileForm.workplace}
                                            onChange={(e) => setProfileForm({ ...profileForm, workplace: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => updateProfileMutation.mutate(profileForm)} disabled={updateProfileMutation.isPending}>
                                        {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save changes
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Preferences */}
                <div className="mb-6 border border-[#E2E8F0] bg-white p-6 rounded-md shadow-sm">
                    <h2 className="text-xl mb-6 text-[#0F172A] font-semibold">Content Preferences</h2>

                    {/* Notification Preferences */}
                    <div className="mb-8">
                        <h3 className="text-[#334155] font-medium text-lg mb-3">Notifications</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="email-notifs" className="flex flex-col space-y-1">
                                    <span>Email Notifications</span>
                                    <span className="font-normal text-xs text-muted-foreground">Receive weekly updates via email.</span>
                                </Label>
                                <Switch
                                    id="email-notifs"
                                    checked={localNotifications.email_enabled}
                                    onCheckedChange={(checked) => setLocalNotifications(prev => ({ ...prev, email_enabled: checked }))}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="push-notifs" className="flex flex-col space-y-1">
                                    <span>Push Notifications</span>
                                    <span className="font-normal text-xs text-muted-foreground">Receive push notifications on your device.</span>
                                </Label>
                                <Switch
                                    id="push-notifs"
                                    checked={localNotifications.push_enabled}
                                    onCheckedChange={(checked) => setLocalNotifications(prev => ({ ...prev, push_enabled: checked }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Subspecialties Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-[#334155] font-medium text-lg">Subspecialties</h3>
                            <Button variant="ghost" size="sm" onClick={toggleAllSubspecialties} className="text-[#2F6FED] hover:text-[#2459C7]">
                                {SUBSPECIALTIES.every(s => localSubspecialties.includes(s.key)) ? "Deselect All" : "Select All"}
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {SUBSPECIALTIES.map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => toggleSubspecialty(item.key)}
                                    className="h-12 border border-[#E2E8F0] bg-[#F5F8FF] hover:bg-[#E9F1FF] transition-colors flex items-center px-4 gap-3 rounded-md w-full text-left"
                                >
                                    <div className={`w-6 h-6 border-2 flex items-center justify-center rounded transition-colors ${localSubspecialties.includes(item.key)
                                        ? 'bg-[#2F6FED] border-[#2F6FED]'
                                        : 'bg-white border-[#E2E8F0]'
                                        }`}>
                                        {localSubspecialties.includes(item.key) && (
                                            <Check className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                    <span className="text-[#334155] text-sm">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Research Types Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-[#334155] font-medium text-lg">Research Types</h3>
                            <Button variant="ghost" size="sm" onClick={toggleAllResearchTypes} className="text-[#2F6FED] hover:text-[#2459C7]">
                                {RESEARCH_TYPES.every(r => localResearchTypes.includes(r.key)) ? "Deselect All" : "Select All"}
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {RESEARCH_TYPES.map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => toggleResearchType(item.key)}
                                    className="h-12 border border-[#E2E8F0] bg-[#F5F8FF] hover:bg-[#E9F1FF] transition-colors flex items-center px-4 gap-3 rounded-md w-full text-left"
                                >
                                    <div className={`w-6 h-6 border-2 flex items-center justify-center rounded transition-colors ${localResearchTypes.includes(item.key)
                                        ? 'bg-[#2F6FED] border-[#2F6FED]'
                                        : 'bg-white border-[#E2E8F0]'
                                        }`}>
                                        {localResearchTypes.includes(item.key) && (
                                            <Check className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                    <span className="text-[#334155] text-sm">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {hasChanges && (
                        <div className="mt-8 flex justify-end">
                            <Button
                                onClick={() => updatePrefsMutation.mutate()}
                                disabled={updatePrefsMutation.isPending}
                                className="bg-[#2F6FED] hover:bg-[#2459C7] text-white gap-2 w-full md:w-auto h-12"
                            >
                                {updatePrefsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Preferences
                            </Button>
                        </div>
                    )}
                </div>

                {/* Other Actions */}
                <div className="border border-[#E2E8F0] bg-white p-6 rounded-md shadow-sm">
                    <div className="space-y-3">
                        <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full justify-start bg-[#F5F8FF] hover:bg-[#E9F1FF] text-[#334155] h-12">
                                    Change Password
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Change Password</DialogTitle>
                                    <DialogDescription>
                                        Enter your current password and a new password.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="current-pass" className="text-right">
                                            Current
                                        </Label>
                                        <Input
                                            id="current-pass"
                                            type="password"
                                            value={passwordForm.current_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="new-pass" className="text-right">
                                            New
                                        </Label>
                                        <Input
                                            id="new-pass"
                                            type="password"
                                            value={passwordForm.new_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={() => changePasswordMutation.mutate(passwordForm)} disabled={changePasswordMutation.isPending}>
                                        {changePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Change Password
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Button onClick={handleExportData} variant="outline" className="w-full justify-start bg-[#F5F8FF] hover:bg-[#E9F1FF] text-[#334155] h-12">
                            Export My Data
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="w-full justify-start border-[#EF4444] bg-red-50 hover:bg-red-100 text-[#EF4444] h-12"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
