import * as React from "react"
import { Calendar, BookOpen, ExternalLink, ChevronDown, ChevronUp, Star } from "lucide-react"
import { format } from "date-fns"

import { addToFavorites, removeFromFavorites } from "@/lib/api"
import { logEvent } from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export interface Paper {
    id: string
    title: string
    authors: string[]
    journal: string
    publication_date: string
    abstract: string
    link: string
    doi?: string
    tags?: string[]
    summary?: {
        objective: string
        methods: string
        results: string
        conclusion: string
        key_points: string[]
    }
    is_favorite?: boolean
}

interface PaperCardProps {
    paper: Paper
    onToggleFavorite?: (id: string, isFavorite: boolean) => void
}

export function PaperCard({ paper, onToggleFavorite }: PaperCardProps) {
    const [isExpanded, setIsExpanded] = React.useState(false)
    const [isFavorite, setIsFavorite] = React.useState(paper.is_favorite || false)
    const [isLoadingFav, setIsLoadingFav] = React.useState(false)

    // Sync state if prop changes (e.g. initial load)
    React.useEffect(() => {
        setIsFavorite(paper.is_favorite || false)
    }, [paper.is_favorite])

    const handleToggleFavorite = async () => {
        if (isLoadingFav) return
        setIsLoadingFav(true)
        try {
            if (isFavorite) {
                await removeFromFavorites(paper.id)
                setIsFavorite(false)
                logEvent("unfavorited_paper", { paper_id: paper.id })
                if (onToggleFavorite) onToggleFavorite(paper.id, false)
            } else {
                await addToFavorites(paper.id)
                setIsFavorite(true)
                logEvent("favorited_paper", { paper_id: paper.id, title: paper.title })
                if (onToggleFavorite) onToggleFavorite(paper.id, true)
            }
        } catch (error) {
            console.error("Failed to toggle favorite", error)
        } finally {
            setIsLoadingFav(false)
        }
    }

    return (
        <Card className="w-full mb-4 border-l-4 border-l-[#2F6FED] hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]">
                                {paper.journal}
                            </Badge>
                            {paper.tags?.map(tag => (
                                <Badge key={tag} variant="outline" className="text-[#2F6FED] border-[#BFDBFE] bg-[#EFF6FF]">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <CardTitle className="text-xl font-bold text-[#0F172A] leading-tight">
                            {paper.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm text-[#64748B]">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{paper.publication_date ? format(new Date(paper.publication_date), "MMM d, yyyy") : "Unknown Date"}</span>
                            <span>•</span>
                            <BookOpen className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[300px]" title={paper.authors.join(", ")}>
                                {paper.authors.slice(0, 3).join(", ")} {paper.authors.length > 3 && `+${paper.authors.length - 3} more`}
                            </span>
                        </CardDescription>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleFavorite}
                        className={`hover:bg-slate-100 ${isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-slate-300 hover:text-yellow-400'}`}
                        disabled={isLoadingFav}
                    >
                        <Star className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {paper.summary ? (
                        <div className={`space-y-4 text-sm text-[#334155] leading-relaxed ${!isExpanded ? 'h-40 overflow-hidden' : ''}`}>
                            {[
                                { label: 'Objective', content: paper.summary.objective },
                                { label: 'Methods', content: paper.summary.methods },
                                { label: 'Results', content: paper.summary.results },
                                { label: 'Conclusion', content: paper.summary.conclusion },
                            ].map((section) => (
                                <div key={section.label}>
                                    <span className="font-semibold text-[#0F172A] block mb-1">{section.label}</span>
                                    {section.content.replace(/\*\*/g, '').replace(/(Not explicitly detailed|Not mentioned|Infered from context).*/gi, 'Not specified in abstract.')}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={`text-[#334155] leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
                            {paper.abstract || "No abstract available."}
                        </p>
                    )}

                    {!isExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        const newState = !isExpanded
                        setIsExpanded(newState)
                        if (newState) {
                            logEvent("opened_summary", { paper_id: paper.id })
                        }
                    }}
                    className="text-[#2F6FED] hover:text-[#1E40AF] hover:bg-[#EFF6FF]"
                >
                    {isExpanded ? (
                        <>Show Less <ChevronUp className="ml-1 w-4 h-4" /></>
                    ) : (
                        <>Read Summary <ChevronDown className="ml-1 w-4 h-4" /></>
                    )}
                </Button>

                <Button size="sm" className="bg-[#2F6FED] hover:bg-[#2459C7]" asChild>
                    <a
                        href={paper.link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => logEvent("clicked_link", { paper_id: paper.id, link: paper.link })}
                    >
                        Read Full Paper <ExternalLink className="ml-2 w-3.5 h-3.5" />
                    </a>
                </Button>
            </CardFooter>
        </Card>
    )
}
