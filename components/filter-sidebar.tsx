import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Filter, X, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface FilterOptions {
    subspecialties: string[]
    research_types: string[]
    journals: string[]
}

interface FilterSidebarProps {
    options: FilterOptions
    filters: {
        subspecialties: string[]
        research_types: string[]
        journals: string[]
        sort: string
        datePreset?: string
        dateFrom?: Date
        dateTo?: Date
    }
    onFilterChange: (key: string, value: any) => void
    className?: string
}

export function FilterSidebar({ options, filters, onFilterChange, className }: FilterSidebarProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Local state for custom date inputs to allow "Apply" behavior
    const [tempDateFrom, setTempDateFrom] = useState<string>(filters.dateFrom ? format(filters.dateFrom, "yyyy-MM-dd") : "")
    const [tempDateTo, setTempDateTo] = useState<string>(filters.dateTo ? format(filters.dateTo, "yyyy-MM-dd") : "")

    const FilterGroup = ({
        title,
        items,
        selectedItems,
        filterKey
    }: {
        title: string,
        items: string[],
        selectedItems: string[],
        filterKey: string
    }) => {
        const isAllSelected = items.length > 0 && selectedItems.length === items.length

        const toggleSelectAll = () => {
            if (isAllSelected) {
                onFilterChange(filterKey, [])
            } else {
                onFilterChange(filterKey, items)
            }
        }

        const toggleItem = (item: string) => {
            if (selectedItems.includes(item)) {
                onFilterChange(filterKey, selectedItems.filter(i => i !== item))
            } else {
                onFilterChange(filterKey, [...selectedItems, item])
            }
        }

        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
                <div className="flex flex-col space-y-3">
                    <h3 className="font-semibold text-slate-900">{title}</h3>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleSelectAll}
                        className="w-full text-xs h-8"
                    >
                        {isAllSelected ? "Deselect All" : "Select All"}
                    </Button>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        {items.map((item) => (
                            <div key={item} className="flex items-start space-x-2">
                                <Checkbox
                                    id={`${filterKey}-${item}`}
                                    checked={selectedItems.includes(item)}
                                    onCheckedChange={() => toggleItem(item)}
                                    className="mt-0.5"
                                />
                                <label
                                    htmlFor={`${filterKey}-${item}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 cursor-pointer"
                                >
                                    {item}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    const DateFilter = () => {
        const presets = [
            { label: 'Today', value: 'today' },
            { label: 'Last 7 days', value: '7d' },
            { label: 'Last 30 days', value: '30d' },
            { label: 'Last 3 months', value: '3m' },
            { label: 'Last 6 months', value: '6m' },
            { label: 'Last 12 months', value: '12m' },
            { label: 'All time', value: 'all' },
            { label: 'Custom range', value: 'custom' },
        ]

        const currentPreset = filters.datePreset || '30d' // Default visual state if undefined

        const handlePresetClick = (value: string) => {
            onFilterChange('datePreset', value)
            if (value !== 'custom') {
                // Clear custom dates if switching away from custom
                onFilterChange('dateFrom', undefined)
                onFilterChange('dateTo', undefined)
            }
        }

        const applyCustomRange = () => {
            if (tempDateFrom) onFilterChange('dateFrom', new Date(tempDateFrom))
            if (tempDateTo) onFilterChange('dateTo', new Date(tempDateTo))
        }

        const clearDateFilter = () => {
            onFilterChange('datePreset', 'all')
            onFilterChange('dateFrom', undefined)
            onFilterChange('dateTo', undefined)
        }

        return (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
                <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-slate-900">Publication Date</h3>
                        {currentPreset !== 'all' && (
                            <button onClick={clearDateFilter} className="text-xs text-blue-600 hover:text-blue-800">
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {presets.map(preset => (
                            <button
                                key={preset.value}
                                onClick={() => handlePresetClick(preset.value)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors",
                                    currentPreset === preset.value
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                                )}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {currentPreset === 'custom' && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="space-y-1 flex-1">
                                    <label className="text-xs font-medium text-slate-500">From</label>
                                    <input
                                        type="date"
                                        className="w-full text-sm border border-slate-300 rounded-md px-2 py-1"
                                        value={tempDateFrom}
                                        onChange={(e) => setTempDateFrom(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <label className="text-xs font-medium text-slate-500">To</label>
                                    <input
                                        type="date"
                                        className="w-full text-sm border border-slate-300 rounded-md px-2 py-1"
                                        value={tempDateTo}
                                        onChange={(e) => setTempDateTo(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button size="sm" className="w-full" onClick={applyCustomRange}>
                                Apply Range
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const SidebarContent = () => (
        <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 mb-4 px-1">Filters</h2>

            <DateFilter />

            <FilterGroup
                title="Journal Type"
                items={options.journals}
                selectedItems={filters.journals}
                filterKey="journals"
            />

            <FilterGroup
                title="Specialty"
                items={options.subspecialties}
                selectedItems={filters.subspecialties}
                filterKey="subspecialties"
            />

            <FilterGroup
                title="Research Type"
                items={options.research_types}
                selectedItems={filters.research_types}
                filterKey="research_types"
            />
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <div className={cn("hidden lg:block w-full sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pb-4", className)}>
                <SidebarContent />
            </div>

            {/* Mobile Sheet */}
            <div className="lg:hidden mb-4">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            <span className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                            </span>
                            {(filters.journals.length + filters.subspecialties.length + filters.research_types.length + (filters.datePreset && filters.datePreset !== 'all' ? 1 : 0)) > 0 && (
                                <span className="bg-slate-900 text-slate-50 text-xs rounded-full px-2 py-0.5">
                                    {filters.journals.length + filters.subspecialties.length + filters.research_types.length + (filters.datePreset && filters.datePreset !== 'all' ? 1 : 0)}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                            <SidebarContent />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    )
}
