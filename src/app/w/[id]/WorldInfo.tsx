'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@iconify/react';
import type { World } from '@/lib/api/types';

export default function WorldInfo({ world }: { world: World | null }) {
    if (!world) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
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
                        <Icon icon="material-symbols:group-rounded" className="size-4" />
                        Capacity
                    </span>
                    <span className="font-medium">{world.capacity || 'Unlimited'}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-fd-muted-foreground">
                        <Icon icon="material-symbols:update-rounded" className="size-4" />
                        Version
                    </span>
                    <span className="font-medium font-mono">
                        {world.release >= 0 ? `v${world.release}` : 'None'}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
