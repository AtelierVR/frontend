'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import type { World } from '@/lib/api/types';

export default function WorldContributors({ world }: { world: World | null }) {
    if (!world) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Contributors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        );
    }

    const all = [
        { sid: world.owner, isOwner: true },
        ...world.contributors
            .filter(c => c !== world.owner)
            .map(c => ({ sid: c, isOwner: false })),
    ];

    if (all.length === 0) return null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-fd-muted-foreground uppercase tracking-wide">Contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {all.map(({ sid, isOwner }) => {
                    const [idPart, serverPart] = sid.startsWith('u:') ? [sid.slice(2).split('@')[0], sid.split('@')[1]] : [sid, undefined];
                    const href = serverPart ? `/u/${idPart}@${serverPart}` : `/u/${idPart}`;
                    return (
                        <Link
                            key={sid}
                            href={href}
                            className="flex items-center gap-2 text-sm hover:underline"
                        >
                            <Icon
                                icon={isOwner ? 'material-symbols:star-rounded' : 'material-symbols:person-rounded'}
                                className="size-4 text-fd-muted-foreground"
                            />
                            <span className="font-mono text-xs truncate">{sid}</span>
                        </Link>
                    );
                })}
            </CardContent>
        </Card>
    );
}
