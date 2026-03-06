'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AlertCircle, Home, RefreshCw, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { HomeLayout } from '@/components/layout/home';
import { baseOptions } from '@/lib/layout.shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    const handleCopyError = async () => {
        const errorText = [
            `${error.name}: ${error.message}`,
            error.stack || '',
            error.digest ? `Digest: ${error.digest}` : ''
        ].filter(Boolean).join('\n');

        await navigator.clipboard.writeText(errorText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <HomeLayout {...baseOptions()}>
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
                <Empty className="max-w-4xl">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <div className="relative">
                                <AlertCircle className="text-destructive animate-pulse" size={48} />
                                <div className="absolute inset-0 text-destructive/20 blur-xl">
                                    <AlertCircle size={48} />
                                </div>
                            </div>
                        </EmptyMedia>
                        <EmptyTitle className="text-2xl">Oops! Something went wrong</EmptyTitle>
                        <EmptyDescription className="text-base">
                            We encountered an unexpected error while processing your request.
                            Don't worry, you can try reloading the page or return to the home page.
                        </EmptyDescription>
                    </EmptyHeader>

                    {error.digest && (
                        <div className="w-full max-w-md">
                            <div className="bg-muted/50 border border-border rounded-lg px-4 py-2.5">
                                <p className="text-xs font-medium text-muted-foreground text-center">
                                    Error Reference: <span className="font-mono text-foreground">{error.digest}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {process.env.NODE_ENV === 'development' && error.message && (
                        <div className="w-full space-y-2">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="w-full flex items-center justify-between bg-muted/50 hover:bg-muted border border-border rounded-lg px-4 py-2.5 transition-colors"
                            >
                                <span className="text-sm font-medium ellipsis">
                                    {error.name}: {error.message}
                                </span>
                                {showDetails ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                            </button>

                            {showDetails && (
                                <div className={cn(
                                    "bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-3 animate-in slide-in-from-top-2",
                                    "text-xs font-mono overflow-x-auto max-h-64",
                                    "text-left whitespace-pre-wrap relative"
                                )}>
                                    <button
                                        onClick={handleCopyError}
                                        className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                                        title="Copy error details"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                        )}
                                    </button>
                                    {error.name}: {error.message}
                                    {error.stack ? <span className='mt-4 block'>{error.stack}</span> : null}
                                    {error.digest ? <span className='mt-4 block'>{error.digest}</span> : null}
                                </div>
                            )}
                        </div>
                    )}

                    <EmptyContent>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                            <Button
                                onClick={reset}
                                variant="primary"
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </Button>
                            <Link href="/">
                                <Button variant="outline" className="gap-2 w-full sm:w-auto">
                                    <Home className="h-4 w-4" />
                                    Go Home
                                </Button>
                            </Link>
                        </div>
                    </EmptyContent>
                </Empty>
            </div>
        </HomeLayout>
    );
}
