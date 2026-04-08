'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { isError, useApi } from '@/lib/api';
import type { World } from '@/lib/api/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { HomeLayout } from '@/components/layout/home';
import { baseOptions } from '@/lib/layout.shared';
import WorldThumbnail from './Thumbnail';
import WorldTitle from './Title';
import WorldDescription from './Description';
import WorldInfo from './WorldInfo';
import WorldTags from './WorldTags';
import WorldContributors from './WorldContributors';

export default function WorldPage() {
    const params = useParams();
    const id = params?.id as string;
    const Api = useApi();

    const [world, setWorld] = useState<World | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!Api || !id || Array.isArray(id)) return;

        async function fetchWorld() {
            setLoading(true);
            setError(null);

            let worldId: string | number = id;
            let server: string | undefined;

            if (id.includes('@')) {
                const atIndex = id.lastIndexOf('@');
                worldId = id.slice(0, atIndex);
                server = id.slice(atIndex + 1);
            }

            const result = await Api.fetchWorld(worldId, server);
            if (isError(result)) {
                setError(result.message || 'Failed to load world');
            } else {
                setWorld(result);
            }
            setLoading(false);
        }

        fetchWorld();
    }, [id]);

    if (loading) {
        return (
            <HomeLayout {...baseOptions()}>
                <div className="container max-w-6xl mx-auto py-8 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                        <div className="space-y-6">
                            <Card className="relative overflow-hidden">
                                <Skeleton className="w-full h-48" />
                                <div className="relative flex items-center ms-12 h-16">
                                    <Skeleton className="w-[8em] h-[8em] rounded-xl absolute -top-[4em]" />
                                </div>
                                <div className="p-6 space-y-4">
                                    <Skeleton className="h-8 w-1/3" />
                                    <Skeleton className="h-5 w-1/4" />
                                </div>
                            </Card>
                            <Card>
                                <Skeleton className="h-24 w-full" />
                            </Card>
                        </div>
                        <div className="space-y-6">
                            <Card className="p-6">
                                <Skeleton className="h-32 w-full" />
                            </Card>
                        </div>
                    </div>
                </div>
            </HomeLayout>
        );
    }

    if (error || !world) {
        return (
            <HomeLayout {...baseOptions()}>
                <div className="container max-w-6xl mx-auto py-8 px-4">
                    <Alert variant="destructive">
                        <Icon icon="material-symbols:error-circle-rounded" className="h-4 w-4" />
                        <AlertDescription>{error || 'World not found'}</AlertDescription>
                    </Alert>
                </div>
            </HomeLayout>
        );
    }

    return (
        <HomeLayout {...baseOptions()}>
            <div className="container max-w-6xl mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">

                    {/* Main content */}
                    <div className="space-y-6">
                        <Card className="relative overflow-hidden">
                            {/* Header gradient */}
                            <div className="w-full h-48 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-fd-muted/30 border-b border-fd-border" />

                            {/* Thumbnail positioned over the header */}
                            <div className="relative flex items-center ms-12 h-16">
                                <WorldThumbnail world={world} />
                            </div>

                            <div className="w-full p-6 space-y-5">
                                <WorldTitle world={world} />
                            </div>
                        </Card>

                        <WorldDescription world={world} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <WorldInfo world={world} />
                        <WorldContributors world={world} />
                        <WorldTags world={world} />
                    </div>
                </div>
            </div>
        </HomeLayout>
    );
}
