import * as React from "react"
import { Paper, PaperCard } from "@/components/paper-card"

interface PaperFeedProps {
    papers: Paper[]
    isLoading?: boolean
}

export function PaperFeed({ papers, isLoading = false }: PaperFeedProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 w-full bg-gray-100 animate-pulse rounded-lg border border-gray-200" />
                ))}
            </div>
        )
    }

    if (papers.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <h3 className="text-lg font-medium text-gray-900">No papers found</h3>
                <p className="mt-1 text-sm text-gray-500">Check back later for new updates.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {papers.map(paper => (
                <PaperCard key={paper.id} paper={paper} />
            ))}
        </div>
    )
}
