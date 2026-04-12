'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { World, WorldAsset, User } from '@/lib/api/types';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { IdentifierCopy } from '@/components/ui/identifier-copy';
import Link from 'next/link';
import { useApi, isError } from '@/lib/api';
import { useWorld } from './WorldContext';
import { PLATFORM_ICONS, formatSize, parseSid, sidToUserHref } from '@/lib/platform';

export default function WorldTitle({ world, assets, actions }: { world: World | null; assets: WorldAsset[] | null; actions?: ReactNode }) {
    const Api = useApi();
    const { canEdit } = useWorld();
    const [owner, setOwner] = useState<User | null>(null);

    useEffect(() => {
        if (!Api || !world) return;
        const { id, server } = parseSid(world.owner);
        Api.getOrFetchUser(id, server).then(res => {
            if (!isError(res)) setOwner(res);
        });
    }, [world?.owner, Api]);

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
            <h1 className="group text-2xl font-bold flex items-center gap-2">
                {world ? (
                    <>
                        <span className="text-fd-foreground">{world.title}</span>
                        {canEdit && (
                            <Link href={`/w/${world.id}@${world.server}/edit#title`}>
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

            {world ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-fd-muted-foreground">
                    <span>By</span>
                    <Link
                        href={sidToUserHref(world.owner)}
                        className="font-mono hover:underline text-fd-foreground"
                    >
                        {ownerLabel}
                    </Link>
                    {platforms && platforms.length > 0 && (
                        <>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                                {platforms.map(p => {
                                    const info = PLATFORM_ICONS[p.toLowerCase()];
                                    return info ? (
                                        <span key={p} title={info.label}>
                                            <Icon
                                                icon={info.icon}
                                                className="size-4"
                                                style={{ color: info.color }}
                                            />
                                        </span>
                                    ) : (
                                        <span key={p} className="text-xs font-mono">{p}</span>
                                    );
                                })}
                            </span>
                        </>
                    )}
                    {maxSize !== null && (
                        <>
                            <span>·</span>
                            <span className="font-medium">{formatSize(maxSize)}</span>
                        </>
                    )}
                    <span>·</span>
                    <IdentifierCopy identifier={world.alias?.find((a: any) => a.key === 'nid')?.value ?? `${world.id}@${world.server}`} />
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
