'use client'

import * as React from 'react'
import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Option {
    value: string
    label: string
}

interface MultiSelectComboboxProps {
    options: Option[]
    selectedValues: string[]
    onSelect: (values: string[]) => void
    placeholder?: string
    searchPlaceholder?: string
    className?: string
}

export function MultiSelectCombobox({
    options,
    selectedValues,
    onSelect,
    placeholder = "Select items...",
    searchPlaceholder = "Search items...",
    className
}: MultiSelectComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [expanded, setExpanded] = React.useState(false)

    const toggleSelection = (value: string) => {
        const newValues = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value]
        onSelect(newValues)
    }

    const removeSelection = (value: string) => {
        onSelect(selectedValues.filter(v => v !== value))
    }

    const maxShownItems = 3
    const visibleItems = expanded ? selectedValues : selectedValues.slice(0, maxShownItems)
    const hiddenCount = selectedValues.length - visibleItems.length

    return (
        <div className={cn("w-full space-y-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="h-auto min-h-11 w-full justify-between hover:bg-transparent bg-background border-zinc-200 dark:border-zinc-800"
                    >
                        <div className="flex flex-wrap items-center gap-1 pr-2.5">
                            {selectedValues.length > 0 ? (
                                <>
                                    {visibleItems.map(val => {
                                        const option = options.find(c => c.value === val)
                                        return option ? (
                                            <Badge key={val} variant="secondary" className="rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-none px-2 py-0.5 flex gap-1 items-center">
                                                {option.label}
                                                <div
                                                    className="hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full p-0.5 transition-colors cursor-pointer"
                                                    onClick={e => {
                                                        e.stopPropagation()
                                                        removeSelection(val)
                                                    }}
                                                >
                                                    <XIcon className="size-3" />
                                                </div>
                                            </Badge>
                                        ) : null
                                    })}
                                    {hiddenCount > 0 && !expanded && (
                                        <Badge
                                            variant="secondary"
                                            onClick={e => {
                                                e.stopPropagation()
                                                setExpanded(true)
                                            }}
                                            className="rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-pointer"
                                        >
                                            +{hiddenCount} more
                                        </Badge>
                                    )}
                                    {expanded && (
                                        <Badge
                                            variant="secondary"
                                            onClick={e => {
                                                e.stopPropagation()
                                                setExpanded(false)
                                            }}
                                            className="rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 cursor-pointer"
                                        >
                                            Show Less
                                        </Badge>
                                    )}
                                </>
                            ) : (
                                <span className="text-muted-foreground font-normal">{placeholder}</span>
                            )}
                        </div>
                        <ChevronsUpDownIcon className="text-muted-foreground/80 shrink-0 size-4" aria-hidden="true" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 shadow-2xl border-zinc-200 dark:border-zinc-800" align="start">
                    <Command className="bg-white dark:bg-zinc-950">
                        <CommandInput placeholder={searchPlaceholder} className="h-11" />
                        <CommandList className="max-h-64 custom-scrollbar">
                            <CommandEmpty>No items found.</CommandEmpty>
                            <CommandGroup className="p-1">
                                {options.map(option => (
                                    <CommandItem
                                        key={option.value}
                                        value={option.label} // CommandItem uses value for filtering
                                        onSelect={() => toggleSelection(option.value)}
                                        className="rounded-md py-2 px-3 aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-900"
                                    >
                                        <div className="flex items-center gap-2 w-full">
                                            <div className={cn(
                                                "flex size-4 items-center justify-center rounded border border-zinc-300 dark:border-zinc-700 transition-colors",
                                                selectedValues.includes(option.value) ? "bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100 text-white dark:text-zinc-900" : "bg-transparent"
                                            )}>
                                                {selectedValues.includes(option.value) && <CheckIcon size={12} strokeWidth={4} />}
                                            </div>
                                            <span className="truncate text-sm font-medium">{option.label}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
