'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAvatar } from '../AvatarContext';
import { VersionCard, type AssetLike } from '@/components/version-card';

export default function AvatarVersionsPage() {
    const { avatar, allAssets } = useAvatar();

    if (!avatar || !allAssets) {
        return (
            <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-2">
                            <Skeleton className="h-5 w-24" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (allAssets.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-fd-muted-foreground italic text-sm">
                    No assets uploaded yet.
                </CardContent>
            </Card>
        );
    }

    const byVersion: Record<number, AssetLike[]> = {};
    for (const asset of allAssets) {
        (byVersion[asset.version] ??= []).push(asset);
    }
    const versions = Object.keys(byVersion).map(Number).sort((a, b) => b - a);

    return (
        <div className="space-y-4">
            {versions.map(v => (
                <VersionCard
                    key={v}
                    version={v}
                    assets={byVersion[v]}
                    isRelease={v === avatar.release}
                />
            ))}
        </div>
    );
}
