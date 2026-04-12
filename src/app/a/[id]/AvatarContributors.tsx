'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Avatar } from '@/lib/api/types';
import { ContributorRow } from '@/components/contributor-row';

export default function AvatarContributors({ avatar }: { avatar: Avatar | null }) {
    if (!avatar) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Contributors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="size-8 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-1">
                                <Skeleton className="h-3.5 w-28" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    const all = [
        { sid: avatar.owner, isOwner: true },
        ...avatar.contributors
            .filter(c => c !== avatar.owner)
            .map(c => ({ sid: c, isOwner: false })),
    ];

    if (all.length === 0) return null;

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-fd-muted-foreground uppercase tracking-wide">Contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {all.map(({ sid, isOwner }) => (
                    <ContributorRow key={sid} sid={sid} isOwner={isOwner} />
                ))}
            </CardContent>
        </Card>
    );
}
