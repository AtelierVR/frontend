'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { NetworkBars } from './NetworkBars';
import { MiniChart } from './MiniChart';
import { useLerpedValue } from '../hooks';
import { formatBytesPerSec } from '../utils';

interface NetworkCardProps {
  upload: [number, number];
  download: [number, number];
}

export function NetworkCard({ upload, download }: NetworkCardProps) {
  const [history, setHistory] = useState<number[]>([]);
  const lerpedUpload = useLerpedValue(upload[0], 500);
  const lerpedDownload = useLerpedValue(download[0], 500);
  
  // Créer une clé pour détecter les changements réels
  const networkKey = useMemo(() => JSON.stringify([upload, download]), [upload, download]);

  useEffect(() => {
    if (!upload || upload[1] === 0) return;
    
    const maxHistory = 30;
    const networkPercent = (upload[0] / Math.max(upload[1], 1)) * 100;
    setHistory(prev => [...prev.slice(-maxHistory + 1), networkPercent]);
  }, [networkKey]);

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
            <span>{formatBytesPerSec(lerpedUpload)}</span>
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <Icon icon="material-symbols:arrow-downward-rounded" className="size-4" />
            <span>{formatBytesPerSec(lerpedDownload)}</span>
          </div>
        </div>
      </div>
      {/* Mixed visualization: line chart + network bars */}
      <div className="absolute bottom-0 left-0 right-0 h-24">
        {/* Line chart in background */}
        <div className="absolute inset-0 opacity-15">
          <MiniChart data={history} color="rgb(6, 182, 212)" />
        </div>
        {/* Network bars in foreground */}
        <div className="absolute inset-0 opacity-50">
          <NetworkBars 
            upload={lerpedUpload} 
            download={lerpedDownload} 
            maxBandwidth={Math.max(upload[1], download[1])}
            uploadColor="rgb(249, 115, 22)" 
            downloadColor="rgb(6, 182, 212)" 
          />
        </div>
      </div>
    </Card>
  );
}
