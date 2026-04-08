'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { World } from '@/lib/api/types';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

export default function WorldTitle({ world }: { world: World | null }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (world) {
            navigator.clipboard.writeText(`${world.id}@${world.server}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div>
            <h1 className="ms-2.5 text-2xl font-bold flex items-center gap-2">
                {world ? (
                    <span className="text-fd-foreground">{world.title}</span>
                ) : (
                    <div
                        style={{ inlineSize: '30%' }}
                        className="animate-pulse rounded-md bg-fd-muted h-8"
                    />
                )}
            </h1>

            {world ? (
                <div className="flex items-center gap-1 ms-2.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="text-fd-muted-foreground hover:text-fd-foreground font-mono h-auto py-0 px-1"
                    >
                        {copied ? (
                            <Icon icon="material-symbols:check-rounded" className="size-4" />
                        ) : (
                            <span className="text-sm">{world.id}@{world.server}</span>
                        )}
                    </Button>
                </div>
            ) : (
                <div className="ms-2.5 mt-1 animate-pulse rounded-md bg-fd-muted h-4 w-1/4" />
            )}
        </div>
    );
}
