"use client"

import { useState, useEffect } from "react"
import { PaperFeed } from "@/components/paper-feed"
import { Paper } from "@/components/paper-card"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { getFavorites, getFilters } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { FilterSidebar } from "@/components/filter-sidebar"

export default function FavoritesPage() {
    const [papers, setPapers] = useState<Paper[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Filter State
    const [filterOptions, setFilterOptions] = useState({
        subspecialties: [],
        research_types: [],
        journals: []
    })
    const [filters, setFilters] = useState<{
        subspecialties: string[]
        research_types: string[]
        journals: string[]
        sort: string
        datePreset?: string
        dateFrom?: Date
        dateTo?: Date
    }>({
        subspecialties: [],
        research_types: [],
        journals: [],
        sort: 'date',
        datePreset: '7d'
    })

    const router = useRouter()
    const pageSize = 15

    useEffect(() => {
        // Fetch filter options on mount
        const loadOptions = async () => {
            try {
                const options = await getFilters()
                setFilterOptions(options)
            } catch (err) {
                console.error("Failed to load filter options", err)
            }
        }
        loadOptions()
    }, [])

    useEffect(() => {
        const loadFavorites = async () => {
            try {
                setIsLoading(true)
                const response = await getFavorites(currentPage, pageSize, filters)

                const mappedPapers = response.papers.map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    authors: p.authors || [],
                    journal: p.journal,
                    publication_date: p.publication_date,
                    abstract: p.summary?.objective || p.abstract,
                    link: p.full_text_link,
                    tags: [...(p.subspecialties || []), p.research_type].filter(Boolean),
                    summary: p.summary ? {
                        objective: p.summary.objective,
                        methods: p.summary.methods,
                        results: p.summary.results,
                        conclusion: p.summary.conclusion,
                        key_points: p.summary.key_points
                    } : undefined,
                    is_favorite: true
                }))
                setPapers(mappedPapers)
                setTotalPages(Math.ceil(response.total / pageSize))
            } catch (err) {
                console.error("Error loading favorites:", err)
                setError("Failed to load your favorites.")
            } finally {
                setIsLoading(false)
            }
        }

        loadFavorites()
    }, [currentPage, filters])

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setCurrentPage(1) // Reset to first page on filter change
    }

    // Helper to generate page numbers
    const getPageNumbers = () => {
        const pages = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i)
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 3) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1)
                pages.push('...')
                pages.push(currentPage - 1)
                pages.push(currentPage)
                pages.push(currentPage + 1)
                pages.push('...')
                pages.push(totalPages)
            }
        }
        return pages
    }

    return (
        <div className="min-h-screen bg-[#FAFBFF]">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                                <ArrowLeft className="w-5 h-5 text-slate-500" />
                            </Button>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">My Favorites</h1>
                        </div>
                        <p className="text-[#64748B] text-sm md:text-base ml-9">Your saved papers.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
                    {/* Main Content (Papers) */}
                    <div className="lg:col-span-3 order-2 lg:order-1">
                        {/* Sorting Control */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                            <span className="text-sm font-medium text-slate-500">
                                Showing {papers.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-
                                {Math.min(currentPage * pageSize, (totalPages * pageSize))} of results
                            </span>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-sm text-slate-500 font-medium whitespace-nowrap">Sort by:</span>
                                <Select value={filters.sort} onValueChange={(val) => handleFilterChange('sort', val)}>
                                    <SelectTrigger className="w-full sm:w-[200px] bg-white border-slate-200">
                                        <SelectValue placeholder="Sort order" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="date">Newest First</SelectItem>
                                        <SelectItem value="date_asc">Oldest First</SelectItem>
                                        <SelectItem value="title">Alphabetical (A-Z)</SelectItem>
                                        <SelectItem value="title_desc">Alphabetical (Z-A)</SelectItem>
                                        <SelectItem value="journal">Journal Name</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
                                {error}
                            </div>
                        )}

                        <PaperFeed papers={papers} isLoading={isLoading} />

                        {!isLoading && totalPages > 1 && (
                            <div className="mt-8">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>

                                        {getPageNumbers().map((page, index) => (
                                            <PaginationItem key={index}>
                                                {page === '...' ? (
                                                    <PaginationEllipsis />
                                                ) : (
                                                    <PaginationLink
                                                        isActive={page === currentPage}
                                                        onClick={() => setCurrentPage(page as number)}
                                                        className="cursor-pointer"
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                )}
                                            </PaginationItem>
                                        ))}

                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                    {/* Filter Sidebar (Right Side) */}
                    <div className="lg:col-span-1 order-1 lg:order-2 h-fit sticky top-4">
                        <FilterSidebar
                            options={filterOptions}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
