"use client";

import * as React from "react";
import { Search, Check, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface ResponsiveSelectProps {
  options: Option[];
  value: string | string[];
  onChange: (value: any) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  multiple?: boolean;
  label?: string;
  className?: string;
}

export function ResponsiveSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search options...",
  multiple = false,
  label = "Choose option",
  className,
}: ResponsiveSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [isMobile, setIsMobile] = React.useState(false);

  // Drag-to-close touch states for mobile bottom sheet
  const [startY, setStartY] = React.useState(0);
  const [currentY, setCurrentY] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Detect screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close dropdown on click outside (for desktop mode)
  React.useEffect(() => {
    if (isMobile) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isMobile]);

  // Prevent scroll when mobile drawer is open
  React.useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, isMobile]);

  // Touch handlers for dragging the bottom sheet down to close
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY;
    if (deltaY > 0) {
      setCurrentY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // If dragged down more than 120px, close the sheet
    if (currentY > 120) {
      setIsOpen(false);
    }
    setCurrentY(0);
  };

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const handleSelect = (val: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(val)) {
        onChange(currentValues.filter((v) => v !== val));
      } else {
        onChange([...currentValues, val]);
      }
    } else {
      onChange(val);
      setIsOpen(false);
      setSearch("");
    }
  };

  const isSelected = (val: string) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(val);
    }
    return value === val;
  };

  // Label to display inside trigger
  const triggerLabel = React.useMemo(() => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.length === 0) return placeholder;
      const selectedLabels = options
        .filter((o) => currentValues.includes(o.value))
        .map((o) => o.label);
      if (selectedLabels.length <= 2) return selectedLabels.join(", ");
      return `${selectedLabels.slice(0, 2).join(", ")} (+${selectedLabels.length - 2} more)`;
    } else {
      const selectedOpt = options.find((o) => o.value === value);
      return selectedOpt ? selectedOpt.label : placeholder;
    }
  }, [value, options, multiple, placeholder]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Selection Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50 hover:bg-accent/10 transition-colors text-left"
      >
        <span className="truncate pr-2 font-medium">
          {triggerLabel}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      {/* DESKTOP POPOVER DROPDOWN */}
      {isOpen && !isMobile && (
        <div className="absolute left-0 z-50 mt-1 w-full rounded-lg border border-border/60 bg-card p-2 shadow-xl animate-in fade-in duration-200">
          <div className="relative mb-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-md bg-background border border-border/50 text-xs focus:outline-none focus:border-cyan-500/50 text-foreground"
            />
          </div>
          <ScrollAreaCustom maxClass="max-h-48">
            <div className="space-y-0.5">
              {filteredOptions.length === 0 ? (
                <p className="text-3xs text-muted-foreground text-center py-4">No results found.</p>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-xs text-foreground hover:bg-accent/20 text-left transition-colors font-medium"
                  >
                    <span>{opt.label}</span>
                    {isSelected(opt.value) && (
                      <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollAreaCustom>
        </div>
      )}

      {/* MOBILE BOTTOM SHEET DRAWER */}
      {isOpen && isMobile && (
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300"
          />

          {/* Bottom Sheet Drawer */}
          <div
            style={{
              transform: `translateY(${currentY}px)`,
              transition: isDragging ? "none" : "transform 0.3s ease-out",
            }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl border-t border-border/50 bg-card p-4 shadow-2xl animate-in slide-in-from-bottom duration-300"
          >
            {/* Drag Handle */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="w-full py-2 cursor-grab active:cursor-grabbing shrink-0"
            >
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/30 mb-3 shrink-0">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">{label}</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted text-muted-foreground rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search filter */}
            <div className="relative mb-3 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-background border border-border/50 text-xs focus:outline-none focus:border-cyan-500/50 text-foreground"
              />
            </div>

            {/* Scrolling options list */}
            <div ref={listRef} className="flex-1 overflow-y-auto min-h-0 space-y-1">
              {filteredOptions.length === 0 ? (
                <p className="text-2xs text-muted-foreground text-center py-8">No matching options found.</p>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-xs text-foreground hover:bg-accent/15 active:bg-accent/20 text-left transition-colors font-medium border border-border/20 bg-background/25"
                  >
                    <span>{opt.label}</span>
                    {isSelected(opt.value) && (
                      <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Small helper component to wrap options with standard browser scrollbars
function ScrollAreaCustom({ children, maxClass }: { children: React.ReactNode; maxClass?: string }) {
  return (
    <div className={cn("overflow-y-auto pr-1 select-none", maxClass)}>
      {children}
    </div>
  );
}
