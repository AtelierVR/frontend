'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { isError, useApi } from '@/lib/api';
import { getSIDById } from '@/lib/api/utils';
import type { Avatar, AvatarAsset } from '@/lib/api/types';
import { Card } from '@/components/ui/card';
import { HomeLayout } from '@/components/layout/home';
import { baseOptions } from '@/lib/layout.shared';
import AvatarThumbnail from './Thumbnail';
import AvatarTitle from './Title';
import AvatarInfo from './AvatarInfo';
import AvatarTags from './AvatarTags';
import AvatarContributors from './AvatarContributors';
import { AvatarContext } from './AvatarContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FavoriteButton from './FavoriteButton';
import SetAvatarButton from './SetAvatarButton';
import { AvatarLayoutSkeleton } from './LayoutSkeleton';
import { AvatarLayoutError } from './LayoutError';

export default function AvatarLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const id = params?.id as string;
    const Api = useApi();
    const pathname = usePathname();
    const router = useRouter();

    const [avatar, setAvatar] = useState<Avatar | null>(null);
    const [allAssets, setAllAssets] = useState<AvatarAsset[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);

    const refresh = () => setRefreshTick(t => t + 1);

    useEffect(() => {
        if (!Api || !id || Array.isArray(id)) return;

        async function fetchData() {
            setLoading(true);
            setError(null);

            let avatarId: string | number = id;
            let server: string | undefined;

            if (id.includes('@')) {
                const atIndex = id.lastIndexOf('@');
                avatarId = id.slice(0, atIndex);
                server = id.slice(atIndex + 1);
            }

            const result = await Api.fetchAvatar(avatarId, server);
            if (isError(result)) {
                setError(result.message || 'Failed to load avatar');
                setLoading(false);
                return;
            }

            setAvatar(result);

            const assetsResult = await Api.fetchAvatarAssets(avatarId, server);
            setAllAssets(isError(assetsResult) ? [] : assetsResult.items);
            setLoading(false);
        }

        fetchData();
    }, [id, refreshTick]);

    const baseHref = `/a/${id}`;
    const activeTab =
        pathname === `${baseHref}/versions` ? 'versions' :
        pathname === `${baseHref}/info` ? 'info' :
        pathname === `${baseHref}/edit` ? 'edit' :
        'description';

    const releaseAssets =
        avatar && allAssets
            ? allAssets.filter(a => a.version === avatar.release)
            : null;

    if (loading) return <AvatarLayoutSkeleton />;

    if (error || !avatar) return <AvatarLayoutError message={error || 'Avatar not found'} />;

    const normalizeRef = (s: string) => s.startsWith('u:') ? s.slice(2) : s;
    const myRef = Api?.currentUser ? getSIDById(Api.currentUser.id, Api.currentUser.server) : null;
    const canEdit = avatar !== null && myRef !== null && (
        normalizeRef(avatar.owner) === myRef ||
        avatar.contributors.some(c => normalizeRef(c) === myRef)
    );

    return (
        <AvatarContext.Provider value={{ avatar, allAssets, loading, error, canEdit, refresh }}>
            <HomeLayout {...baseOptions()}>
                <div className="container max-w-6xl mx-auto py-8 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                        {/* Main content */}
                        <div className="space-y-6">
                            <Card className="relative overflow-hidden">
                                <AvatarThumbnail avatar={avatar} />
                                <div className="w-full p-6 space-y-5">
                                    <AvatarTitle
                                        avatar={avatar}
                                        assets={releaseAssets}
                                        actions={
                                            <div className="flex items-center gap-2">
                                                <SetAvatarButton avatarSid={`${avatar.id}@${avatar.server}`} />
                                                <FavoriteButton avatarSid={`${avatar.id}@${avatar.server}`} />
                                            </div>
                                        }
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
                            <AvatarInfo avatar={avatar} />
                            <AvatarContributors avatar={avatar} />
                            <AvatarTags avatar={avatar} />
                        </div>
                    </div>
                </div>
            </HomeLayout>
        </AvatarContext.Provider>
    );
}
