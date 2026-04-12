'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { PLATFORM_ICONS, formatSize } from '@/lib/platform';
import { UploaderLabel } from '@/components/uploader-label';

export interface AssetLike {
    id: number;
    version: number;
    engine: string;
    platform: string;
    hash: string | null;
    size: number | null;
    features: string[];
    uploader: string | null;
}

function AssetRow({ asset, isRelease }: { asset: AssetLike; isRelease: boolean }) {
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

            {(asset.uploader || asset.features.length > 0) && (
                <div className="flex flex-wrap items-center gap-2">
                    {asset.uploader && <UploaderLabel sid={asset.uploader} />}
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

export function VersionCard({
    version,
    assets,
    isRelease,
}: {
    version: number;
    assets: AssetLike[];
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
