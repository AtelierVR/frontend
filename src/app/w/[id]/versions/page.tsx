'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { useApi, isError } from '@/lib/api';
import type { WorldAsset, User } from '@/lib/api/types';
import { useWorld } from '../WorldContext';

const PLATFORM_ICONS: Record<string, { icon: string; label: string }> = {
    windows: { icon: 'mdi:microsoft-windows', label: 'Windows' },
    linux: { icon: 'mdi:linux', label: 'Linux' },
    macos: { icon: 'mdi:apple', label: 'macOS' },
    android: { icon: 'mdi:android', label: 'Android' },
    ios: { icon: 'mdi:apple-ios', label: 'iOS' },
    visionos: { icon: 'mdi:glasses', label: 'visionOS' },
};

function formatSize(bytes: number): string {
    if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(2)} Go`;
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} Mo`;
    if (bytes >= 1_000) return `${Math.round(bytes / 1_000)} ko`;
    return `${bytes} o`;
}

function parseSid(sid: string): { id: number | string; server?: string } {
    const bare = sid.startsWith('u:') ? sid.slice(2) : sid;
    const atIdx = bare.lastIndexOf('@');
    if (atIdx === -1) return { id: bare };
    const id = bare.slice(0, atIdx);
    const server = bare.slice(atIdx + 1);
    return {
        id: isNaN(parseInt(id, 10)) ? id : parseInt(id, 10),
        server: server === '::' ? undefined : server || undefined,
    };
}

function UploaderLabel({ sid }: { sid: string }) {
    const Api = useApi();
    const [user, setUser] = useState<User | null | undefined>(undefined);

    useEffect(() => {
        if (!Api) return;
        const { id, server } = parseSid(sid);
        Api.getOrFetchUser(id, server).then(res => {
            setUser(isError(res) ? null : res);
        });
    }, [sid, Api]);

    const label = user
        ? (user.display || user.username)
        : (sid.startsWith('u:') ? sid.slice(2) : sid);

    return (
        <span className="flex items-center gap-1 text-xs text-fd-muted-foreground">
            <Icon icon="material-symbols:upload-rounded" className="size-3.5 flex-shrink-0" />
            {user === undefined
                ? <span className="inline-block w-20 h-3 rounded animate-pulse bg-fd-muted" />
                : <span className="font-mono truncate max-w-[12rem]">{label}</span>
            }
        </span>
    );
}

function AssetRow({ asset, isRelease }: { asset: WorldAsset; isRelease: boolean }) {
    const platformInfo = PLATFORM_ICONS[asset.platform.toLowerCase()];

    return (
        <div className="py-3 border-b border-fd-border last:border-0 space-y-2">
            {/* Top row: platform / engine / size / hash / release badge */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 w-36 flex-shrink-0">
                    {platformInfo ? (
                        <Icon icon={platformInfo.icon} className="size-4 text-fd-muted-foreground flex-shrink-0" />
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

            {/* Bottom row: uploader + feature badges */}
            {(asset.uploader || asset.features.length > 0) && (
                <div className="flex flex-wrap items-center gap-2">
                    {asset.uploader && (
                        <UploaderLabel sid={asset.uploader} />
                    )}
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
    assets: WorldAsset[];
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

export default function WorldVersionsPage() {
    const { world, allAssets } = useWorld();

    if (!world || !allAssets) {
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

    // Group by version, sort descending
    const byVersion: Record<number, WorldAsset[]> = {};
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
                    isRelease={v === world.release}
                />
            ))}
        </div>
    );
}
