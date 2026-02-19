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
import { Checkbox } from "@/components/ui/checkbox"
import api from "@/lib/api"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
    fullName: z.string().min(2, {
        message: "Full name must be at least 2 characters.",
    }),
    age: z.string().min(1, { message: "Age is required" }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    mobileNumber: z.string(),
    nationality: z.string().default("Egypt"),
    placeOfWork: z.string().min(2, {
        message: "Place of work is required.",
    }),
    yearsOfExperience: z.string().min(1, { message: "Years of experience is required" }),
    degree: z.string().min(1, {
        message: "Please select your degree.",
    }),
    linkedinProfile: z.string(),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export default function SignUpPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            fullName: "",
            age: "",
            email: "",
            mobileNumber: "",
            nationality: "Egypt",
            placeOfWork: "",
            yearsOfExperience: "",
            degree: "",
            linkedinProfile: "",
            password: "",
            confirmPassword: "",
            terms: false,
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const payload = {
                email: values.email,
                password: values.password,
                full_name: values.fullName,
                age: parseInt(values.age),
                phone: values.mobileNumber,
                nationality: values.nationality,
                place_of_work: values.placeOfWork,
                years_of_experience: parseInt(values.yearsOfExperience),
                degree: values.degree,
                linkedin_profile: values.linkedinProfile
            }

            const signupResponse = await api.post("/auth/signup", payload)

            console.log("Signup successful", signupResponse.data)
            const { access_token } = signupResponse.data.data
            localStorage.setItem("token", access_token)

            toast.success("Account created successfully")
            router.push("/onboarding")
        } catch (error: any) {
            console.error(error)
            const message = error.response?.data?.detail || "Something went wrong"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FAFBFF] p-4 md:p-8 flex flex-col items-center justify-center">
            {/* Navigation Flow Indicator - simplified */}
            <div className="mb-8 flex items-center justify-center gap-2 text-sm text-[#64748B] hidden md:flex">
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
                <span className="font-semibold text-[#334155]">Sign Up</span>
                <ArrowRight className="w-4 h-4" />
                <span>Preferences</span>
                <ArrowRight className="w-4 h-4" />
                <span>Dashboard</span>
            </div>

            <div className="w-full max-w-2xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="h-12 w-32 bg-[#E9F1FF] border-2 border-[#E2E8F0] mx-auto flex items-center justify-center">
                        <span className="text-[#64748B] font-mono font-bold">LOGO</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
                        Neuro Paper Summarizer
                    </h1>
                    <p className="text-[#64748B]">Create your professional profile</p>
                </div>

                {/* Sign Up Form */}
                <div className="bg-white border-2 border-[#E2E8F0] p-6 md:p-8 shadow-sm rounded-lg">
                    <h2 className="text-xl font-semibold mb-6 text-[#0F172A]">Sign Up</h2>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Personal Info Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider border-b pb-2">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Dr. John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="age"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Age <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="30" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="name@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="mobileNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mobile Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+20 123456789" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Professional Info Section */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider border-b pb-2">Professional Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="placeOfWork"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Place of Work <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Cairo University Hospital" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="yearsOfExperience"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Years of Experience</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="5" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="degree"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Degree <span className="text-red-500">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select your degree" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Resident">Resident</SelectItem>
                                                        <SelectItem value="Specialist">Specialist</SelectItem>
                                                        <SelectItem value="Consultant">Consultant</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="nationality"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nationality</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select nationality" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Egypt">Egypt</SelectItem>
                                                        <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                                                        <SelectItem value="UAE">UAE</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="linkedinProfile"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>LinkedIn Profile <span className="text-slate-400 font-normal">(Optional)</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://linkedin.com/in/..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Password Section */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider border-b pb-2">Security</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirm Password <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <FormField
                                control={form.control}
                                name="terms"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                I agree to the Terms of Service and Privacy Policy
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
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
                                        CREATE ACCOUNT <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-[#2F6FED] hover:text-[#2459C7] hover:underline transition-colors text-sm"
                        >
                            Already have an account? Login
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
