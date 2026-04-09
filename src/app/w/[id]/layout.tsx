'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { isError, useApi } from '@/lib/api';
import { getSIDById } from '@/lib/api/utils';
import type { World, WorldAsset } from '@/lib/api/types';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icon } from '@iconify/react';
import { HomeLayout } from '@/components/layout/home';
import { baseOptions } from '@/lib/layout.shared';
import WorldThumbnail from './Thumbnail';
import WorldTitle from './Title';
import WorldInfo from './WorldInfo';
import WorldTags from './WorldTags';
import WorldContributors from './WorldContributors';
import { WorldContext } from './WorldContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FavoriteButton from './FavoriteButton';

export default function WorldLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const id = params?.id as string;
    const Api = useApi();
    const pathname = usePathname();
    const router = useRouter();

    const [world, setWorld] = useState<World | null>(null);
    const [allAssets, setAllAssets] = useState<WorldAsset[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);

    const refresh = () => setRefreshTick(t => t + 1);

    useEffect(() => {
        if (!Api || !id || Array.isArray(id)) return;

        async function fetchData() {
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
                setLoading(false);
                return;
            }

            setWorld(result);

            const assetsResult = await Api.fetchWorldAssets(worldId, server);
            setAllAssets(isError(assetsResult) ? [] : assetsResult.items);
            setLoading(false);
        }

        fetchData();
    }, [id, refreshTick]);

    const baseHref = `/w/${id}`;
    const activeTab =
        pathname === `${baseHref}/versions` ? 'versions' :
        pathname === `${baseHref}/info` ? 'info' :
        pathname === `${baseHref}/edit` ? 'edit' :
        'description';

    // Release-filtered assets for the title (size / platforms of the recommended release)
    const releaseAssets =
        world && allAssets
            ? allAssets.filter(a => a.version === world.release)
            : null;

    if (loading)
        return (
            <HomeLayout {...baseOptions()}>
                <div className="container max-w-6xl mx-auto py-8 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                        <div className="space-y-6">
                            <Card className="relative overflow-hidden">
                                <Skeleton className="w-full h-48" />
                                <div className="p-6 space-y-4">
                                    <Skeleton className="h-8 w-1/3" />
                                    <Skeleton className="h-5 w-2/3" />
                                    <Skeleton className="h-5 w-1/4" />
                                </div>
                            </Card>
                            <Skeleton className="h-9 w-64 rounded-lg" />
                            <Card>
                                <Skeleton className="h-24 w-full" />
                            </Card>
                        </div>
                        <div className="hidden md:block space-y-6">
                            <Card className="p-6">
                                <Skeleton className="h-32 w-full" />
                            </Card>
                        </div>
                    </div>
                </div>
            </HomeLayout>
        );

    if (error || !world)
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

    const normalizeRef = (s: string) => s.startsWith('u:') ? s.slice(2) : s;
    const myRef = Api?.currentUser ? getSIDById(Api.currentUser.id, Api.currentUser.server) : null;
    const canEdit = world !== null && myRef !== null && (
        normalizeRef(world.owner) === myRef ||
        world.contributors.some(c => normalizeRef(c) === myRef)
    );

    return (
        <WorldContext.Provider value={{ world, allAssets, loading, error, canEdit, refresh }}>
            <HomeLayout {...baseOptions()}>
                <div className="container max-w-6xl mx-auto py-8 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                        {/* Main content */}
                        <div className="space-y-6">
                            <Card className="relative overflow-hidden">
                                <WorldThumbnail world={world} />
                                <div className="w-full p-6 space-y-5">
                                    <WorldTitle
                                        world={world}
                                        assets={releaseAssets}
                                        actions={<FavoriteButton worldSid={`${world.id}@${world.server}`} />}
                                    />
                                </div>
                            </Card>

                            <Tabs
                                value={activeTab}
                                onValueChange={v => {
                                    if (v === 'versions') router.push(`${baseHref}/versions`);
                                    else if (v === 'info') router.push(`${baseHref}/info`);
                                    else if (v === 'edit') router.push(`${baseHref}/edit`);
                                    else router.push(baseHref);
                                }}
                            >
                                <TabsList className="w-full justify-start">
                                    <TabsTrigger value="description">Description</TabsTrigger>
                                    <TabsTrigger value="versions">Versions</TabsTrigger>
                                    <TabsTrigger value="info" className="md:hidden">Infos</TabsTrigger>
                                    {canEdit && <TabsTrigger value="edit" className="ml-auto">Edit</TabsTrigger>}
                                </TabsList>
                            </Tabs>

                            {children}
                        </div>

                        {/* Sidebar */}
                        <div className="hidden md:block space-y-6">
                            <WorldInfo world={world} />
                            <WorldContributors world={world} />
                            <WorldTags world={world} />
                        </div>
                    </div>
                </div>
            </HomeLayout>
        </WorldContext.Provider>
    );
}
