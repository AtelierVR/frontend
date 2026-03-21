'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import ActionButton from './ActionButton';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';

interface LogEntry {
    timestamp: number;
    level: string;
    message: string;
    tag?: string;
}

interface LogsViewerProps {
    logs: LogEntry[];
    loading?: boolean;
    error?: string;
    liveMode?: boolean;
    onRefresh?: () => void;
    className?: string;
    isInputable?: boolean;
    onInput?: (command: string) => void;
}

function getLevelColor(level: string) {
    switch (level.toLowerCase()) {
        case 'error':
            return 'text-red-500';
        case 'warning':
            return 'text-yellow-500';
        case 'debug':
            return 'text-blue-500';
        case 'log':
            return 'text-cyan-500';
        default:
            return 'text-fd-foreground';
    }
}

function getLevelBgColor(level: string) {
    switch (level.toLowerCase()) {
        case 'error':
            return 'bg-red-500/5';
        case 'warning':
            return 'bg-yellow-500/5';
        case 'debug':
            return 'bg-blue-500/5';
        case 'log':
            return '';
        default:
            return '';
    }
}

// All available log levels
const ALL_LOG_LEVELS = ['error', 'warning', 'log', 'debug'] as const;
const MAX_LOG_LEVEL_LENGTH = Math.max(...ALL_LOG_LEVELS.map(level => level.length)) - 2;
const STORAGE_KEY = 'logs-active-levels';
const TAGS_STORAGE_KEY = 'logs-active-tags';

// Load active levels from localStorage
function loadActiveLevels(): Set<string> {
    if (typeof window === 'undefined') return new Set(ALL_LOG_LEVELS);

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return new Set(JSON.parse(stored));
        }
    } catch (e) {
        console.error('Failed to load active log levels:', e);
    }
    return new Set(ALL_LOG_LEVELS);
}

// Save active levels to localStorage
function saveActiveLevels(levels: Set<string>) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(levels)));
    } catch (e) {
        console.error('Failed to save active log levels:', e);
    }
}

// Load active tags from localStorage
function loadActiveTags(): Set<string> | null {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem(TAGS_STORAGE_KEY);
        if (stored) {
            return new Set(JSON.parse(stored));
        }
    } catch (e) {
        console.error('Failed to load active log tags:', e);
    }
    return null;
}

// Save active tags to localStorage
function saveActiveTags(tags: Set<string> | null) {
    if (typeof window === 'undefined') return;

    try {
        if (tags === null) {
            localStorage.removeItem(TAGS_STORAGE_KEY);
        } else {
            localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(Array.from(tags)));
        }
    } catch (e) {
        console.error('Failed to save active log tags:', e);
    }
}

export function LogsViewer({
    logs,
    loading = false,
    error,
    liveMode = false,
    onRefresh,
    className,
    isInputable = false,
    onInput
}: LogsViewerProps) {
    const { t } = useTranslation();
    const [fullscreenOpen, setFullscreenOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [focusBottom, setFocusBottom] = useState(true);
    const [activeLevels, setActiveLevels] = useState<Set<string>>(() => loadActiveLevels());
    const [activeTags, setActiveTags] = useState<Set<string> | null>(() => loadActiveTags());
    const logsContainerRef = useRef<HTMLDivElement>(null);
    const modalLogsContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const modalInputRef = useRef<HTMLInputElement>(null);
    
    // Extract all unique tags from logs
    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        logs.forEach(log => {
            if (log.tag) tags.add(log.tag);
        });
        return Array.from(tags).sort();
    }, [logs]);

    // Filter logs by active levels and tags
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            // Filter by level
            if (!activeLevels.has(log.level.toLowerCase())) return false;
            // Filter by tag (if tag filter is active)
            if (activeTags !== null) {
                if (!log.tag || !activeTags.has(log.tag)) return false;
            }
            return true;
        });
    }, [logs, activeLevels, activeTags]);

    // Toggle log level
    const toggleLevel = (level: string) => {
        setActiveLevels(prev => {
            const newLevels = new Set(prev);
            if (newLevels.has(level)) {
                newLevels.delete(level);
            } else {
                newLevels.add(level);
            }
            saveActiveLevels(newLevels);
            return newLevels;
        });
    };
    
    // Toggle tag filter
    const toggleTag = (tag: string) => {
        setActiveTags(prev => {
            if (prev === null) {
                // Enable filtering with only this tag
                const newTags = new Set([tag]);
                saveActiveTags(newTags);
                return newTags;
            }
            const newTags = new Set(prev);
            if (newTags.has(tag)) {
                newTags.delete(tag);
                // If no tags left, disable tag filtering
                if (newTags.size === 0) {
                    saveActiveTags(null);
                    return null;
                }
            } else {
                newTags.add(tag);
            }
            saveActiveTags(newTags);
            return newTags;
        });
    };
    
    // Clear tag filter
    const clearTagFilter = () => {
        setActiveTags(null);
        saveActiveTags(null);
    };

    const handleSendCommand = (isModal: boolean = false) => {
        if (!inputValue.trim() || !onInput) return;

        onInput(inputValue);
        setInputValue('');

        // Focus back to input after sending
        if (isModal && modalInputRef.current) {
            modalInputRef.current.focus();
        } else if (!isModal && inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, isModal: boolean = false) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendCommand(isModal);
        }
    };

    // Handle scroll events to track if user is at bottom
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;

        if (isAtBottom && !focusBottom) {
            setFocusBottom(true);
        } else if (!isAtBottom && focusBottom) {
            setFocusBottom(false);
        }
    };

    // Auto-scroll to bottom when new logs arrive if focusBottom is true
    useEffect(() => {
        if (!focusBottom) return;

        // Use setTimeout to ensure DOM is updated with new logs (important for batch updates)
        setTimeout(() => {
            if (logsContainerRef.current) {
                logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
            }
            if (modalLogsContainerRef.current) {
                modalLogsContainerRef.current.scrollTop = modalLogsContainerRef.current.scrollHeight;
            }
        }, 0);
    }, [filteredLogs, focusBottom]);

    // Auto-scroll to bottom when modal opens if focusBottom is true
    useEffect(() => {
        if (fullscreenOpen && focusBottom) {
            // Use requestAnimationFrame to ensure DOM is fully rendered
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (modalLogsContainerRef.current) {
                        modalLogsContainerRef.current.scrollTop = modalLogsContainerRef.current.scrollHeight;
                    }
                });
            });
        }
    }, [fullscreenOpen, focusBottom]);

    const renderLogsContent = (isModal: boolean = false) => (
        <div className={cn("flex flex-col overflow-hidden min-h-[500px]", className)} id='logs-viewer'>
            {/* Error */}
            {error && <Alert variant="destructive">
                <Icon icon="material-symbols:error-circle-rounded" className="size-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>}

            {/* Logs Container */}
            <Card className="p-0 overflow-hidden relative flex-1 flex flex-col">
                {/* Controls - Absolute positioned top right */}
                <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                        {liveMode && <Icon icon="material-symbols:radio-button-checked" className="size-3.5 animate-pulse text-green-600" />}
                        
                        {/* Tag Filter */}
                        {availableTags.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className={cn(
                                            buttonVariants({ color: 'ghost', size: 'sm' }),
                                            "gap-1.5 bg-fd-background",
                                            activeTags !== null && "bg-fd-accent text-fd-accent-foreground"
                                        )}
                                    >
                                        <Icon icon="material-symbols:label-outline" className="size-4" />
                                        Tags
                                        {activeTags !== null && (
                                            <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                                                {activeTags.size}
                                            </Badge>
                                        )}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel className="flex items-center justify-between">
                                        <span>Tags</span>
                                        {activeTags !== null && (
                                            <button
                                                onClick={clearTagFilter}
                                                className={cn(
                                                    buttonVariants({ color: 'ghost', size: 'sm' }),
                                                    "h-5 px-2 text-xs"
                                                )}
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {availableTags.map(tag => (
                                        <DropdownMenuCheckboxItem
                                            key={tag}
                                            checked={activeTags !== null && activeTags.has(tag)}
                                            onCheckedChange={() => toggleTag(tag)}
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            <span className="font-mono text-xs">{tag}</span>
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        {/* Log Level Filter */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className={cn(
                                        buttonVariants({ color: 'ghost', size: 'sm' }),
                                        "gap-1.5 bg-fd-background"
                                    )}
                                >
                                    <Icon icon="material-symbols:filter-list-rounded" className="size-4" />
                                    Levels
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Log Levels</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {ALL_LOG_LEVELS.map(level => (
                                    <DropdownMenuCheckboxItem
                                        key={level}
                                        checked={activeLevels.has(level)}
                                        onCheckedChange={() => toggleLevel(level)}
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <span className={cn('font-semibold', getLevelColor(level))}>
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </span>
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {onRefresh && (
                            <ActionButton
                                variant="refresh"
                                onClick={onRefresh}
                                isLoading={loading}
                                className="bg-fd-background"
                            />
                        )}
                        {!isModal ? (
                            <button
                                onClick={() => setFullscreenOpen(true)}
                                className={cn(
                                    buttonVariants({ color: 'ghost', size: 'icon-sm' }),
                                    "bg-fd-background"
                                )}
                                aria-label="Open fullscreen"
                            >
                                <Icon icon="material-symbols:open-in-full-rounded" className="size-4" />
                            </button>
                        ) : (
                            <DialogClose asChild>
                                <button
                                    className={cn(
                                        buttonVariants({ color: 'ghost', size: 'icon-sm' }),
                                        "bg-fd-background"
                                    )}
                                    aria-label="Close fullscreen"
                                >
                                    <Icon icon="material-symbols:close-rounded" className="size-4" />
                                </button>
                            </DialogClose>
                        )}
                    </div>
                    <span className="text-xs text-fd-muted-foreground me-1">
                        {filteredLogs.length} / {logs.length}
                    </span>
                </div>

                {/* Logs */}
                <div
                    ref={isModal ? modalLogsContainerRef : logsContainerRef}
                    onScroll={handleScroll}
                    className={cn(
                        "bg-zinc-950 overflow-auto font-mono text-xs",
                        isModal ? "h-screen" : "flex-1",
                        isInputable && "pb-0"
                    )}
                    style={
                        isModal ? {
                            height: isInputable ? 'calc(100vh - 48px)' : '100vh'
                        } : undefined
                    }
                >
                    {loading && logs.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-fd-muted-foreground">
                            <Icon icon="material-symbols:refresh-rounded" className="size-6 animate-spin mr-2" />
                            {t('settings.logs.loading')}
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-fd-muted-foreground">
                            {logs.length === 0 ? t('settings.logs.no_logs') : t('settings.logs.no_match')}
                        </div>
                    ) : (
                        <div className="p-2 pt-12 h-0">
                            {filteredLogs.map((log, index) => (
                                <div
                                    key={`${log.timestamp}-${index}`}
                                    className={cn(
                                        'py-1 px-2 hover:bg-white/5 rounded',
                                        getLevelBgColor(log.level)
                                    )}
                                >
                                    <span className="text-zinc-500">
                                        {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                                    </span>
                                    <span className={cn('mx-2 font-semibold', getLevelColor(log.level))}>
                                        [{log.level}]
                                        {'\u00A0'.repeat(Math.max(0, MAX_LOG_LEVEL_LENGTH - log.level.length))}
                                    </span>
                                    {log.tag && (
                                        <span className="text-blue-400 font-mono text-xs mr-2">
                                            [{log.tag}]
                                        </span>
                                    )}
                                    <span className="text-zinc-200 whitespace-pre-wrap break-all">
                                        {log.message}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Command Input */}
                {isInputable && onInput && (
                    <div className="bg-zinc-900 border-t border-zinc-800 p-2 flex items-center gap-2">
                        <span className="text-zinc-500 text-xs">$</span>
                        <input
                            ref={isModal ? modalInputRef : inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, isModal)}
                            placeholder="Type a command..."
                            className="flex-1 bg-transparent text-zinc-200 text-xs font-mono outline-none placeholder:text-zinc-600"
                        />
                        <button
                            onClick={() => handleSendCommand(isModal)}
                            disabled={!inputValue.trim()}
                            className={cn(
                                buttonVariants({ color: 'ghost', size: 'icon-sm' }),
                                "h-7"
                            )}
                            aria-label="Send command"
                        >
                            <Icon icon="material-symbols:send-rounded" className="size-4" />
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );

    return (
        <>
            {renderLogsContent(false)}

            {/* Fullscreen Modal */}
            <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
                <DialogContent
                    className="max-w-full w-screen h-screen !p-0 !bg-transparent !border-0 !rounded-none"
                    showCloseButton={false}
                    onInteractOutside={(e) => e.preventDefault()}
                    onPointerDownOutside={(e) => e.preventDefault()}
                >
                    {renderLogsContent(true)}
                </DialogContent>
            </Dialog>
        </>
    );
}
