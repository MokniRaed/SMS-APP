import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandItem } from "@/components/ui/command";
import { Input } from "@/components/ui/input"; // optional: for search input
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

interface ZoneOption {
    _id: string;
    [key: string]: any; // to make it generic
}

interface MultiSelectPopoverProps {
    allFetchedZones?: ZoneOption[];
    options: ZoneOption[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
    labelKey1: string;
    multiple?: boolean;
    labelKey2: string;
    onScrollBottom?: () => void;
    isFetchingMore?: boolean;
    isLoading?: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export default function MultiSelectPopover({
    options,
    allFetchedZones = [],
    selectedValues,
    onChange,
    placeholder = "Select items...",
    labelKey1,
    labelKey2,
    onScrollBottom,
    isFetchingMore,
    isLoading,
    searchTerm,
    onSearchChange,
    multiple = true, // Default to multiple selection
}: MultiSelectPopoverProps) {
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isNearBottom = scrollHeight - scrollTop <= clientHeight + 100;

        if (isNearBottom && onScrollBottom) {
            onScrollBottom();
        }
    };

    const getDisplayText = () => {
        if (!selectedValues.length) return placeholder;

        const selectedCount = selectedValues.length;
        const items = allFetchedZones
            .filter(z => selectedValues.includes(z._id))
            .map((option) => `${option[labelKey1]} - ${option[labelKey2]}`);

        // Show count if more than 2 items
        if (items.length > 2) {
            return `${items.slice(0, 3).join(", ")} + ${items.length - 2}`;
        }
        return items.join(", ");
    };
    const toggleSelect = (id: string) => {
        let updated: string[];
        if (multiple) {
            updated = selectedValues.includes(id)
                ? selectedValues.filter((val) => val !== id)
                : [...selectedValues, id];
        } else {
            updated = [id];
        }
        onChange(updated);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between">
                    <div className="flex-1 min-w-0 text-left truncate">
                        {getDisplayText()}
                    </div>
                    <span className="ml-2 opacity-50"> <ChevronDown size={16} /></span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <div className="p-2">
                        <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div
                        className="overflow-y-auto max-h-64"
                        onScroll={handleScroll}
                    >
                        {isLoading ? (
                            <div className="p-2 text-sm text-muted-foreground">
                                Loading...
                            </div>
                        ) : (
                            <>
                                {options.map((option) => (
                                    <CommandItem
                                        key={option._id}
                                        onSelect={() => toggleSelect(option._id)} // Remove unnecessary optional chaining here
                                        className="flex items-center gap-2"
                                    >
                                        <Checkbox
                                            checked={selectedValues.includes(option?._id)}
                                            disabled={!multiple && selectedValues.length > 0 && !selectedValues.includes(option._id)}
                                        />
                                        <span>
                                            {option[labelKey1]} - {option[labelKey2]}
                                        </span>
                                    </CommandItem>
                                ))}
                                {isFetchingMore && (
                                    <div className="p-2 text-sm text-muted-foreground">
                                        Loading more...
                                    </div>
                                )}
                                {!options.length && (
                                    <div className="p-2 text-sm text-muted-foreground">
                                        No results found
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
