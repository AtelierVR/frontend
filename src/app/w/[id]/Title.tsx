'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import type { World, WorldAsset, User } from '@/lib/api/types';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useApi, isError } from '@/lib/api';

const PLATFORM_ICONS: Record<string, { icon: string; label: string }> = {
    windows: { icon: 'mdi:microsoft-windows', label: 'Windows' },
    linux: { icon: 'mdi:linux', label: 'Linux' },
    macos: { icon: 'mdi:apple', label: 'macOS' },
    android: { icon: 'mdi:android', label: 'Android' },
    ios: { icon: 'mdi:apple-ios', label: 'iOS' },
    visionos: { icon: 'mdi:glasses', label: 'visionOS' },
};

function formatSize(bytes: number): string {
    if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(2)} Go`;
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} Mo`;
    if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} ko`;
    return `${bytes} o`;
}

function parseSid(sid: string): { id: number | string; server?: string } {
    const bare = sid.startsWith('u:') ? sid.slice(2) : sid;
    const atIdx = bare.lastIndexOf('@');
    if (atIdx === -1) return { id: bare };
    const id = bare.slice(0, atIdx);
    const server = bare.slice(atIdx + 1);
    return {
        id: isNaN(parseInt(id, 10)) ? id : parseInt(id, 10),
        server: server === '::' ? undefined : server || undefined,
    };
}

function ownerHref(sid: string): string {
    const bare = sid.startsWith('u:') ? sid.slice(2) : sid;
    return `/u/${bare}`;
}

export default function WorldTitle({ world, assets }: { world: World | null; assets: WorldAsset[] | null }) {
    const Api = useApi();
    const [copied, setCopied] = useState(false);
    const [owner, setOwner] = useState<User | null>(null);

    useEffect(() => {
        if (!Api || !world) return;
        const { id, server } = parseSid(world.owner);
        Api.getOrFetchUser(id, server).then(res => {
            if (!isError(res)) setOwner(res);
        });
    }, [world?.owner, Api]);

    const handleCopy = () => {
        if (world) {
            navigator.clipboard.writeText(`${world.id}@${world.server}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const sized = assets ? assets.filter(a => a.size !== null && a.size! > 0) : null;
    const maxSize = sized && sized.length > 0 ? Math.max(...sized.map(a => a.size!)) : null;
    const platforms = assets ? [...new Set(assets.map(a => a.platform))] : null;

    const ownerLabel = owner
        ? (owner.display || owner.username)
        : world
            ? (world.owner.startsWith('u:') ? world.owner.slice(2) : world.owner)
            : null;

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
                <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 ms-2.5 mt-1 text-sm text-fd-muted-foreground")}>
                    <span>By</span>
                    <Link
                        href={ownerHref(world.owner)}
                        className="font-mono hover:underline text-fd-foreground"
                    >
                        {ownerLabel}
                    </Link>
                    {maxSize !== null && (
                        <>
                            <span>·</span>
                            <span className="font-medium">{formatSize(maxSize)}</span>
                        </>
                    )}
                    {platforms && platforms.length > 0 && (
                        <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                                {platforms.map(p => {
                                    const info = PLATFORM_ICONS[p.toLowerCase()];
                                    return info ? (
                                        <Icon
                                            key={p}
                                            icon={info.icon}
                                            className="size-4"
                                            title={info.label}
                                        />
                                    ) : (
                                        <span key={p} className="text-xs font-mono">{p}</span>
                                    );
                                })}
                            </span>
                        </>
                    )}
                    <span>·</span>
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
                <div className="ms-2.5 mt-1 animate-pulse rounded-md bg-fd-muted h-4 w-2/3" />
            )}

            {world ? (
                <div className="flex items-center gap-1 ms-2.5 mt-1">

                </div>
            ) : (
                <div className="ms-2.5 mt-1 animate-pulse rounded-md bg-fd-muted h-4 w-1/4" />
            )}
        </div>
    );
}
