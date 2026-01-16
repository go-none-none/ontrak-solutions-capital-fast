import React, { useState, useRef, useEffect } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export function MultiSelect({ options, value = [], onChange, placeholder = "Select items..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  const toggleOption = (option) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  const removeOption = (option) => {
    onChange(value.filter(v => v !== option));
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={cn(
          "min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm cursor-pointer",
          "focus-within:outline-none focus-within:ring-1 focus-within:ring-ring",
          isOpen && "ring-1 ring-ring"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {value.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            value.map(item => (
              <Badge key={item} variant="secondary" className="gap-1">
                {item}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(item);
                  }}
                />
              </Badge>
            ))
          )}
        </div>
        <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="space-y-1">
            {filteredOptions.length === 0 ? (
              <div className="py-2 px-2 text-center text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option}
                  className={cn(
                    "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent",
                    value.includes(option) && "bg-accent"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(option);
                  }}
                >
                  <div className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-sm border",
                    value.includes(option) ? "bg-primary border-primary" : "border-input"
                  )}>
                    {value.includes(option) && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  {option}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}