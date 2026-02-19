import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem, CommandList, CommandEmpty, CommandInput } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Option = {
    label: string;
    value: string;
};

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select options...",
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (option: string) => {
        onChange(selected.filter((s) => s !== option));
    };

    const handleSelect = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter((s) => s !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const selectedOptions = options.filter((option) => selected.includes(option.value));

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-auto min-h-[40px] px-3 py-2 hover:bg-white text-left font-normal bg-white border-slate-200",
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1 items-center max-w-full">
                        {selectedOptions.length === 0 && (
                            <span className="text-slate-500 mr-auto">{placeholder}</span>
                        )}

                        {selectedOptions.length > 0 && selectedOptions.length <= 2 && (
                            <div className="flex flex-wrap gap-1">
                                {selectedOptions.map((option) => (
                                    <Badge key={option.value} variant="secondary" className="rounded-sm px-1 font-normal bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200" onClick={(e) => { e.stopPropagation(); handleUnselect(option.value); }}>
                                        {option.label}
                                        <X className="ml-1 h-3 w-3 text-slate-500 hover:text-slate-900" />
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {selectedOptions.length > 2 && (
                            <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="rounded-sm px-1 font-normal bg-slate-100 text-slate-700 border border-slate-200">
                                    {selectedOptions.length} selected
                                </Badge>
                            </div>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-slate-500" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput placeholder={`Search...`} />
                    <CommandList>
                        <CommandEmpty>No options found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selected.includes(option.value)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
