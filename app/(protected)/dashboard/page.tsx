"use client"

import { useState, useEffect } from "react"
import { PaperFeed } from "@/components/paper-feed"
import { Paper } from "@/components/paper-card"
import { Button } from "@/components/ui/button"
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
import { getFeed, getFilters, getFavorites } from "@/lib/api"
import { FilterSidebar } from "@/components/filter-sidebar"

export default function DashboardPage() {
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

    const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())

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

        // Fetch ALL favorites IDs (hacky but works for < 1000 items, ideal is IDs only endpoint or part of feed)
        const loadFavoriteIds = async () => {
            try {
                // Fetch first page, if total huge validation needed. for now fetch page 1 size 1000
                const response = await getFavorites(1, 1000)
                const ids = new Set<string>(response.papers.map((p: any) => String(p.id)))
                setFavoriteIds(ids)
            } catch (err) {
                console.error("Failed to load favorites", err)
            }
        }

        loadOptions()
        loadFavoriteIds()
    }, [])

    useEffect(() => {
        const loadFeed = async () => {
            try {
                setIsLoading(true)
                // 2. Fetch Feed with Pagination and Filters
                const response = await getFeed(currentPage, pageSize, filters)

                // 3. Map Data
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
                    is_favorite: favoriteIds.has(p.id)
                }))
                setPapers(mappedPapers)
                setTotalPages(Math.ceil(response.total / pageSize))
            } catch (err) {
                console.error("Error loading feed:", err)
                setError("Failed to load your feed.")
            } finally {
                setIsLoading(false)
            }
        }

        loadFeed()
    }, [currentPage, filters, favoriteIds]) // Re-run when page, filters, or favs change

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
            {/* Header / Nav - Assumed to be outside or we can add a simple header here if needed. 
                For layout consistency with previous design, we keep the page wrapper padding. */}

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-1">My Research Feed</h1>
                        <p className="text-[#64748B] text-sm md:text-base">Curated papers based on your subspecialties.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.push('/favorites')} className="text-[#2F6FED] border-[#2F6FED]/20 hover:bg-[#2F6FED]/5">
                            My Favorites
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/settings')}>
                            Settings
                        </Button>
                        {/* Check role directly from localStorage since we are client component */}
                        {typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || '{}').role === 'admin' && (
                            <Button
                                variant="default"
                                className="bg-slate-900 hover:bg-slate-800 text-white"
                                onClick={() => router.push('/admin/dashboard')}
                            >
                                Admin Panel
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
                    {/* Sidebar - Desktop: Col 1/4 (Right side logic? No, typically Sidebar is Left or Right. 
                        User asked for: "Papers list (75%) | Filters (25%)" -> Filters on Right.
                        Layout: Papers (Col 1-3) | Filters (Col 4)
                    */}

                    {/* Main Content (Papers) */}
                    <div className="lg:col-span-3 order-2 lg:order-1">
                        {/* Sorting Control - Flex row above papers */}
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

                        {/* Pagination Controls */}
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
