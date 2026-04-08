'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { World } from '@/lib/api/types';

export default function WorldDescription({ world }: { world: World | null }) {
    if (!world)
        return <Card>
            <CardContent className="pt-6 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardContent>
        </Card>;

    return <Card>
        <CardContent className="pt-6">
            {world.description
                ? <p className="text-fd-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {world.description}
                </p>
                : <p className="text-fd-muted-foreground italic text-sm">
                    No description provided.
                </p>}
        </CardContent>
    </Card>;
}
