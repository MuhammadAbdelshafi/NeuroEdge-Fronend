"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import api from "@/lib/api"

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
})

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            console.log("Submitting login form...", values.email)
            const formData = new FormData()
            formData.append("username", values.email)
            formData.append("password", values.password)

            const response = await api.post("/auth/login", formData, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            })

            // Backend returns ApiResponse { success: true, data: { access_token: ..., refresh_token: ..., user: { ... } } }
            console.log("Full Login Response:", response.data)

            const { access_token, user } = response.data.data

            if (!user) {
                console.error("User object missing in login response:", response.data.data)
                toast.error("Login successful but user data missing. Please contact support.")
                return
            }

            console.log("Token received, length:", access_token.length)
            localStorage.setItem("token", access_token)

            // Store user info if needed
            localStorage.setItem("user", JSON.stringify(user))

            toast.success("Login successful")

            if (user.role === 'admin') {
                console.log("Redirecting to ADMIN dashboard")
                router.push("/admin/dashboard")
            } else {
                console.log("Redirecting to USER dashboard")
                router.push("/dashboard")
            }
        } catch (error: any) {
            console.error("Login error:", error)
            const message = error.response?.data?.detail || "Something went wrong"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FAFBFF] p-4 md:p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="h-12 w-32 bg-[#E9F1FF] border-2 border-[#E2E8F0] mx-auto flex items-center justify-center">
                        <span className="text-[#64748B] font-mono font-bold">LOGO</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
                        Neuro Paper Summarizer
                    </h1>
                    <p className="text-[#64748B]">Weekly updates for neurologists</p>
                </div>

                {/* Login Form */}
                <div className="bg-white border-2 border-[#E2E8F0] p-6 md:p-8 shadow-sm rounded-lg">
                    <h2 className="text-xl font-semibold mb-6 text-[#0F172A]">Login</h2>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#2F6FED] hover:bg-[#2459C7] text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        LOGIN <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/signup"
                            className="text-[#2F6FED] hover:text-[#2459C7] hover:underline transition-colors text-sm"
                        >
                            Don&apos;t have an account? Sign up
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#F2F6FF] border border-[#E2E8F0] rounded-md text-center">
                    <p className="text-sm text-[#64748B]">
                        📱 Optimized for mobile and desktop
                    </p>
                </div>
            </div>
        </div>
    )
}
