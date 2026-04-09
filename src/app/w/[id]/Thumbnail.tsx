'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { World } from '@/lib/api/types';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useWorld } from './WorldContext';

export default function WorldThumbnail({ world }: { world: World | null }) {
    const [hover, setHover] = useState(false);
    const { canEdit } = useWorld();
    const editHref = world ? `/w/${world.id}@${world.server}/edit#thumbnail` : '#';

    return (
        <div
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
            className={cn(
                "relative w-full",
                "border-b border-fd-border",
                "bg-fd-muted/50 dark:bg-fd-muted/30"
            )}
        >
            {(!world || !world.thumbnail) && (
                <div
                    className={cn(
                        "w-full h-48",
                        "bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-fd-muted/30",
                        !world && "animate-pulse"
                    )}
                />
            )}
            {world?.thumbnail && (
                <Image
                    src={world.thumbnail}
                    alt={world.title}
                    width={1024}
                    height={256}
                    className="object-cover w-full rounded-b-lg"
                    style={{ aspectRatio: '128 / 45' }}
                    unoptimized
                />
            )}
            {canEdit && world && (
                <Link
                    href={editHref}
                    className={cn(
                        "absolute inset-0",
                        "bg-black/25",
                        "transition-opacity",
                        "opacity-0",
                        "hover:opacity-100",
                        "flex items-center justify-center"
                    )}
                >
                    <Icon icon="material-symbols:edit-rounded" className={cn("size-11 text-white", hover && "block")} />
                </Link>
            )}
        </div>
    );
}
