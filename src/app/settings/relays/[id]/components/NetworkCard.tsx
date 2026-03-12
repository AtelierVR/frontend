'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { NetworkBars } from './NetworkBars';
import { MiniChart } from './MiniChart';
import { useLerpedValue } from '../hooks';
import { formatBytesPerSec } from '../utils';

interface NetData {
  u: number,
  b: number
}

interface NetworkCardProps {
  upload: NetData | null;
  download: NetData | null;
}

const maxHistory = 30;

export function NetworkCard(props: NetworkCardProps) {
  const [history, setHistory] = useState<number[]>(Array.from<number>({ length: maxHistory }).fill(0));
  const up = useLerpedValue(props.upload?.u ?? 0, 100);
  const down = useLerpedValue(props.download?.u ?? 0, 100);
  const maxBandwidth = Math.max(props.upload?.b ?? 0, props.download?.b ?? 0);

  const memo = useMemo(() => JSON.stringify([props.upload?.u ?? 0, props.download?.u ?? 0]), [props]);

  useEffect(() => {
    setHistory(prev => [...prev.slice(-maxHistory + 1), props.upload?.u ?? 0]);
  }, [memo]);

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <Icon icon="material-symbols:network-check" className="size-5 text-cyan-500" />
          </div>
          <div className="text-sm text-fd-muted-foreground uppercase tracking-wider">Réseau</div>
        </div>
        <div className="flex flex-col gap-1 text-lg font-bold font-mono mb-1">
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Icon icon="material-symbols:arrow-upward-rounded" className="size-4" />
            <span>{formatBytesPerSec(up)}</span>
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Icon icon="material-symbols:arrow-downward-rounded" className="size-4" />
            <span>{formatBytesPerSec(down)}</span>
          </div>
        </div>
      </div>
      {/* Mixed visualization: line chart + network bars */}
      <div className="absolute bottom-0 left-0 right-0 h-full">
        {/* Line chart in background */}
        <div className="absolute inset-0 opacity-15">
          <MiniChart data={history} min={0} max={maxBandwidth} color="rgb(6, 182, 212)" />
        </div>
        {/* Network bars in foreground */}
        <div className="absolute inset-0 opacity-50">
          <NetworkBars
            upload={up}
            download={down}
            maxBandwidth={maxBandwidth}
            uploadColor="rgb(249, 115, 22)"
            downloadColor="rgb(6, 182, 212)"
          />
        </div>
      </div>
    </Card>
  );
}
