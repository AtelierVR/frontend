'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import type { World } from '@/lib/api/types';
import { useWorld } from './WorldContext';
import { TagList, getTagConfig } from '@/components/tag-list';

export default function WorldTags({ world }: { world: World | null }) {
    const [hover, setHover] = useState(false);
    const { canEdit } = useWorld();

    const visibleTags = world?.tags?.filter(t => getTagConfig(t) !== null) ?? null;

    if (world && !canEdit && (visibleTags === null || visibleTags.length === 0)) return null;

    return (
        <Card
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-fd-muted-foreground uppercase tracking-wide">Tags</h2>
                    {canEdit && world ? (
                        <Link href={`/w/${world.id}@${world.server}/edit#tags`}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn('size-6', !hover && 'opacity-0', 'transition-opacity')}
                            >
                                <Icon icon="material-symbols:edit-rounded" className="size-4" />
                            </Button>
                        </Link>
                    ) : (
                        <div className="size-6" />
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <TagList list={world ? (visibleTags ?? []) : null} />
            </CardContent>
        </Card>
    );
}
