'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import type { Avatar } from '@/lib/api/types';
import { useAvatar } from './AvatarContext';
import { TagList, getTagConfig } from '@/components/tag-list';

export default function AvatarTags({ avatar }: { avatar: Avatar | null }) {
    const [hover, setHover] = useState(false);
    const { canEdit } = useAvatar();

    const visibleTags = avatar?.tags?.filter(t => getTagConfig(t) !== null) ?? null;

    if (avatar && !canEdit && (visibleTags === null || visibleTags.length === 0)) return null;

    return (
        <Card
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-fd-muted-foreground uppercase tracking-wide">Tags</h2>
                    {canEdit && avatar ? (
                        <Link href={`/a/${avatar.id}@${avatar.server}/edit#tags`}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn('size-6', !hover && 'opacity-0', 'transition-opacity')}
                            >
                                <Icon icon="material-symbols:edit-rounded" className="size-4" />
                            </Button>
                        </Link>
                    ) : null}
                </div>
            </CardHeader>
            <CardContent>
                <TagList list={visibleTags} />
            </CardContent>
        </Card>
    );
}
