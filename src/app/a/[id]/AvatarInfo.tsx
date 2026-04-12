'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import type { Avatar } from '@/lib/api/types';
import { useAvatar } from './AvatarContext';

export default function AvatarInfo({ avatar }: { avatar: Avatar | null }) {
    const { canEdit } = useAvatar();

    if (!avatar) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-fd-muted-foreground uppercase tracking-wide">Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-fd-muted-foreground">
                        <Icon icon="material-symbols:update-rounded" className="size-4" />
                        Version
                    </span>
                    <div className="flex items-center gap-1">
                        <span className="font-medium font-mono">
                            {avatar.release >= 0 ? `v${avatar.release}` : 'None'}
                        </span>
                        {canEdit && (
                            <Link href={`/a/${avatar.id}@${avatar.server}/edit#release`}>
                                <Button variant="ghost" size="icon" className="size-6 opacity-0 hover:opacity-100 transition-opacity">
                                    <Icon icon="material-symbols:edit-rounded" className="size-3" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
