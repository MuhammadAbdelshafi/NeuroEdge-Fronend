import { useState } from "react"
import { MultiSelect } from "@/components/ui/multi-select"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { FilterX, ListFilter } from "lucide-react"

interface FilterOptions {
    subspecialties: string[]
    research_types: string[]
    journals: string[]
}

interface FilterBarProps {
    options: FilterOptions
    filters: {
        subspecialties: string[]
        research_types: string[]
        journals: string[]
        sort: string
    }
    onFilterChange: (key: string, value: any) => void
    onClear: () => void
}

export function FilterBar({ options, filters, onFilterChange, onClear }: FilterBarProps) {
    const journalOptions = options.journals.map(j => ({ label: j, value: j }))
    const specialtyOptions = options.subspecialties.map(s => ({ label: s, value: s }))
    const typeOptions = options.research_types.map(t => ({ label: t, value: t }))

    const hasFilters = filters.journals.length > 0 || filters.subspecialties.length > 0 || filters.research_types.length > 0;

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-medium">
                <ListFilter className="w-5 h-5 text-slate-500" />
                <span>Filter Papers</span>
                {hasFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="ml-auto text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs h-8"
                    >
                        <FilterX className="w-3 h-3 mr-1" />
                        Clear All
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Journal Filter */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Journals</label>
                    <MultiSelect
                        options={journalOptions}
                        selected={filters.journals}
                        onChange={(val) => onFilterChange('journals', val)}
                        placeholder="All Journals"
                    />
                </div>

                {/* Specialty Filter */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Subspecialties</label>
                    <MultiSelect
                        options={specialtyOptions}
                        selected={filters.subspecialties}
                        onChange={(val) => onFilterChange('subspecialties', val)}
                        placeholder="All Specialties"
                    />
                </div>

                {/* Research Type Filter */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Research Type</label>
                    <MultiSelect
                        options={typeOptions}
                        selected={filters.research_types}
                        onChange={(val) => onFilterChange('research_types', val)}
                        placeholder="All Types"
                    />
                </div>

                {/* Sorting */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Sort</label>
                    <Select value={filters.sort} onValueChange={(val) => onFilterChange('sort', val)}>
                        <SelectTrigger className="w-full bg-white border-slate-200 focus:ring-slate-950">
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
        </div>
    )
}
