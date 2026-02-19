"use client"

import * as React from "react"
import { ArrowRight, Check, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { SUBSPECIALTIES, RESEARCH_TYPES } from "@/lib/constants"

export default function OnboardingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)

    // State for subspecialties
    const [subspecialties, setSubspecialties] = React.useState<Record<string, boolean>>({
        stroke: false,
        epilepsy: false,
        movement_disorders: false,
        dementia: false, // Map to cognitive_neurology in backend?
        neuroimmunology: false,
    })

    // State for research types
    const [researchTypes, setResearchTypes] = React.useState<Record<string, boolean>>({
        clinical_trial: false, // Map to rct
        review: false, // Map to systematic_review
        case_study: false, // Map to case_control?
        meta_analysis: false,
    })

    // We should ideally fetch these options from the backend /taxonomy endpoint
    // But for now matching wireframe hardcoded values

    const toggleSubspecialty = (key: string) => {
        setSubspecialties(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const toggleResearchType = (key: string) => {
        setResearchTypes(prev => ({ ...prev, [key]: !prev[key] }))
    }

    async function onSave() {
        setIsLoading(true)
        try {
            // Map frontend keys to backend IDs from subspecialties.json
            // Frontend: stroke, epilepsy, movement, dementia, neuroimmunology
            // Backend: stroke, epilepsy, movement_disorders, cognitive_neurology, neuroimmunology

            const selectedSubspecialties = []
            if (subspecialties.stroke) selectedSubspecialties.push("stroke")
            if (subspecialties.epilepsy) selectedSubspecialties.push("epilepsy")
            if (subspecialties.movement_disorders) selectedSubspecialties.push("movement_disorders")
            if (subspecialties.dementia) selectedSubspecialties.push("cognitive_neurology")
            if (subspecialties.neuroimmunology) selectedSubspecialties.push("neuroimmunology")

            const selectedResearchTypes = []
            if (researchTypes.clinical_trial) selectedResearchTypes.push("rct")
            if (researchTypes.review) selectedResearchTypes.push("systematic_review")
            if (researchTypes.case_study) selectedResearchTypes.push("case_control")
            if (researchTypes.meta_analysis) selectedResearchTypes.push("meta_analysis")

            const payload = {
                subspecialties: selectedSubspecialties,
                research_types: selectedResearchTypes,
                notifications: {
                    frequency: "weekly",
                    email_enabled: true,
                    push_enabled: false,
                    whatsapp_enabled: false
                }
            }

            await api.put("/me/preferences/", payload)
            toast.success("Preferences saved!")
            router.push("/dashboard") // Will fail if logic not implemented, but page exists?
        } catch (error: any) {
            console.error(error)
            toast.error("Failed to save preferences")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FAFBFF] p-4 md:p-8">
            {/* Navigation Flow Indicator */}
            <div className="mb-8 flex items-center justify-center gap-2 text-sm text-[#64748B] hidden md:flex">
                <span>Sign Up</span>
                <ArrowRight className="w-4 h-4" />
                <span className="font-semibold text-[#334155]">Preferences</span>
                <ArrowRight className="w-4 h-4" />
                <span>Dashboard</span>
            </div>

            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl mb-2 text-[#0F172A] font-bold">Setup Your Preferences</h1>
                    <p className="text-[#64748B]">Select your areas of interest (New Users Only)</p>
                </div>

                <div className="border-2 border-[#E2E8F0] p-6 md:p-8 bg-white shadow-sm rounded-lg">
                    {/* Subspecialties Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl text-[#0F172A] font-semibold">Subspecialties</h2>
                            <Button variant="ghost" size="sm" onClick={() => {
                                const allSelected = SUBSPECIALTIES.every(s => subspecialties[s.key]);
                                const newState = { ...subspecialties };
                                SUBSPECIALTIES.forEach(s => newState[s.key] = !allSelected);
                                setSubspecialties(newState);
                            }}>
                                {SUBSPECIALTIES.every(s => subspecialties[s.key]) ? "Deselect All" : "Select All"}
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {SUBSPECIALTIES.map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => toggleSubspecialty(item.key)}
                                    className="h-12 border border-[#E2E8F0] bg-[#F5F8FF] hover:bg-[#E9F1FF] transition-colors flex items-center px-4 gap-3 rounded-md w-full text-left"
                                >
                                    <div className={`w-6 h-6 border-2 flex items-center justify-center rounded transition-colors ${subspecialties[item.key]
                                        ? 'bg-[#2F6FED] border-[#2F6FED]'
                                        : 'bg-white border-[#E2E8F0]'
                                        }`}>
                                        {subspecialties[item.key] && (
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
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl text-[#0F172A] font-semibold">Research Types</h2>
                            <Button variant="ghost" size="sm" onClick={() => {
                                const allSelected = RESEARCH_TYPES.every(r => researchTypes[r.key]);
                                const newState = { ...researchTypes };
                                RESEARCH_TYPES.forEach(r => newState[r.key] = !allSelected);
                                setResearchTypes(newState);
                            }}>
                                {RESEARCH_TYPES.every(r => researchTypes[r.key]) ? "Deselect All" : "Select All"}
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {RESEARCH_TYPES.map(item => (
                                <button
                                    key={item.key}
                                    onClick={() => toggleResearchType(item.key)}
                                    className="h-12 border border-[#E2E8F0] bg-[#F5F8FF] hover:bg-[#E9F1FF] transition-colors flex items-center px-4 gap-3 rounded-md w-full text-left"
                                >
                                    <div className={`w-6 h-6 border-2 flex items-center justify-center rounded transition-colors ${researchTypes[item.key]
                                        ? 'bg-[#2F6FED] border-[#2F6FED]'
                                        : 'bg-white border-[#E2E8F0]'
                                        }`}>
                                        {researchTypes[item.key] && (
                                            <Check className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                    <span className="text-[#334155] text-sm">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Save Button */}
                    <Button
                        onClick={onSave}
                        disabled={isLoading}
                        className="w-full h-12 bg-[#2F6FED] hover:bg-[#2459C7] text-white"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                SAVE PREFERENCES <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
