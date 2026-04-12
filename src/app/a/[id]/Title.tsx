'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Avatar, AvatarAsset, User } from '@/lib/api/types';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useApi, isError } from '@/lib/api';
import { useAvatar } from './AvatarContext';

const PLATFORM_ICONS: Record<string, { icon: string; label: string; color: string }> = {
    windows: { icon: 'mdi:microsoft-windows', label: 'Windows', color: '#0079D5' },
    linux: { icon: 'mdi:linux', label: 'Linux', color: '#F7C530' },
    macos: { icon: 'mdi:apple', label: 'macOS', color: '#A2AAAD' },
    android: { icon: 'mdi:android', label: 'Android', color: '#2FD77F' },
    ios: { icon: 'mdi:apple-ios', label: 'iOS', color: '#A2AAAD' },
    visionos: { icon: 'mdi:glasses', label: 'visionOS', color: '#BA50B1' },
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

export default function AvatarTitle({ avatar, assets, actions }: { avatar: Avatar | null; assets: AvatarAsset[] | null; actions?: ReactNode }) {
    const Api = useApi();
    const { canEdit } = useAvatar();
    const [owner, setOwner] = useState<User | null>(null);

    useEffect(() => {
        if (!Api || !avatar) return;
        const { id, server } = parseSid(avatar.owner);
        Api.getOrFetchUser(id, server).then(res => {
            if (!isError(res)) setOwner(res);
        });
    }, [avatar?.owner, Api]);

    const sized = assets ? assets.filter(a => a.size !== null && a.size! > 0) : null;
    const maxSize = sized && sized.length > 0 ? Math.max(...sized.map(a => a.size!)) : null;
    const platforms = assets ? [...new Set(assets.map(a => a.platform))] : null;

    const ownerLabel = owner
        ? (owner.display || owner.username)
        : avatar
            ? (avatar.owner.startsWith('u:') ? avatar.owner.slice(2) : avatar.owner)
            : null;

    return (
        <div>
            <h1 className="group text-2xl font-bold flex items-center gap-2">
                {avatar ? (
                    <>
                        <span className="text-fd-foreground">{avatar.title}</span>
                        {canEdit && (
                            <Link href={`/a/${avatar.id}@${avatar.server}/edit#title`}>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity size-7">
                                    <Icon icon="material-symbols:edit-rounded" className="size-4" />
                                </Button>
                            </Link>
                        )}
                        {actions && <span className="ml-auto">{actions}</span>}
                    </>
                ) : (
                    <div
                        style={{ inlineSize: '30%' }}
                        className="animate-pulse rounded-md bg-fd-muted h-8"
                    />
                )}
            </h1>

            {avatar ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-fd-muted-foreground">
                    <span>By</span>
                    <Link
                        href={ownerHref(avatar.owner)}
                        className="font-mono hover:underline text-fd-foreground"
                    >
                        {ownerLabel}
                    </Link>

                    {platforms && platforms.length > 0 && (
                        <>
                            <span>·</span>
                            <div className="flex items-center gap-1">
                                {platforms.map(p => {
                                    const info = PLATFORM_ICONS[p.toLowerCase()];
                                    return info ? (
                                        <span key={p} title={info.label}><Icon icon={info.icon} className="size-4" style={{ color: info.color }} /></span>
                                    ) : (
                                        <span key={p} className="capitalize text-xs">{p}</span>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {maxSize !== null && (
                        <>
                            <span>·</span>
                            <span>{formatSize(maxSize)}</span>
                        </>
                    )}
                </div>
            ) : (
                <div className="mt-1 animate-pulse rounded-sm bg-fd-muted h-4 w-48" />
            )}
        </div>
    );
}
