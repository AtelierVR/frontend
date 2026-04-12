'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@iconify/react';
import type { AvatarAsset } from '@/lib/api/types';
import { useAvatar } from '../AvatarContext';

const PLATFORM_ICONS: Record<string, { icon: string; label: string; color: string }> = {
    windows: { icon: 'mdi:microsoft-windows', label: 'Windows', color: '#0079D5' },
    linux: { icon: 'mdi:linux', label: 'Linux', color: '#F7C530' },
    macos: { icon: 'mdi:apple', label: 'macOS', color: '#A2AAAD' },
    android: { icon: 'mdi:android', label: 'Android', color: '#2FD77F' },
    ios: { icon: 'mdi:apple-ios', label: 'iOS', color: '#A2AAAD' },
    visionos: { icon: 'mdi:glasses', label: 'visionOS', color: '#BA50B1' },
};

function formatSize(bytes: number): string {
    if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(2)} Go`;
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} Mo`;
    if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} ko`;
    return `${bytes} o`;
}

function AssetRow({ asset, isRelease }: { asset: AvatarAsset; isRelease: boolean }) {
    const platformInfo = PLATFORM_ICONS[asset.platform.toLowerCase()];

    return (
        <div className="py-3 border-b border-fd-border last:border-0 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 w-36 flex-shrink-0">
                    {platformInfo ? (
                        <Icon icon={platformInfo.icon} className="size-4 text-fd-muted-foreground flex-shrink-0" style={{ color: platformInfo.color }} />
                    ) : (
                        <Icon icon="material-symbols:devices-rounded" className="size-4 text-fd-muted-foreground flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium capitalize">
                        {platformInfo?.label ?? asset.platform}
                    </span>
                </div>

                <span className="text-xs text-fd-muted-foreground font-mono w-20 flex-shrink-0 capitalize">
                    {asset.engine}
                </span>

                <span className="text-sm text-fd-muted-foreground flex-1">
                    {asset.size ? formatSize(asset.size) : '—'}
                </span>

                {asset.hash && (
                    <span className="hidden sm:block text-xs font-mono text-fd-muted-foreground truncate max-w-[8rem]" title={asset.hash}>
                        {asset.hash.slice(0, 8)}…
                    </span>
                )}

                {isRelease && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">release</Badge>
                )}
            </div>

            {asset.features.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    {asset.features.map(f => (
                        <Badge key={f} variant="outline" className="text-xs font-normal">
                            {f}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}

function VersionCard({
    version,
    assets,
    isRelease,
}: {
    version: number;
    assets: AvatarAsset[];
    isRelease: boolean;
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon icon="material-symbols:box-rounded" className="size-4 text-fd-muted-foreground" />
                    <span className="font-mono">v{version}</span>
                    {isRelease && (
                        <Badge className="text-xs">recommended</Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {assets.map(a => (
                    <AssetRow key={a.id} asset={a} isRelease={isRelease} />
                ))}
            </CardContent>
        </Card>
    );
}

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

    const byVersion: Record<number, AvatarAsset[]> = {};
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
