'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Avatar, AvatarAsset, User } from '@/lib/api/types';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useApi, isError } from '@/lib/api';
import { useAvatar } from './AvatarContext';
import { IdentifierCopy } from '@/components/ui/identifier-copy';
import { PLATFORM_ICONS, formatSize, parseSid, sidToUserHref } from '@/lib/platform';

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
                        href={sidToUserHref(avatar.owner)}
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
                    <span>·</span>
                    <IdentifierCopy identifier={avatar.alias?.find((a: any) => a.key === 'nid')?.value ?? `${avatar.id}@${avatar.server}`} />
                </div>
            ) : (
                <div className="mt-1 animate-pulse rounded-sm bg-fd-muted h-4 w-48" />
            )}
        </div>
    );
}
