'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { MiniChart } from './MiniChart';
import { useLerpedValue } from '../hooks';
import { formatBytes } from '../utils';

interface StorageCardProps {
  storage: [number, number];
}

export function StorageCard({ storage }: StorageCardProps) {
  const [history, setHistory] = useState<number[]>([]);
  const lerpedUsed = useLerpedValue(storage[0], 500);
  const lerpedTotal = useLerpedValue(storage[1], 500);
  
  // Créer une clé pour détecter les changements réels
  const storageKey = useMemo(() => JSON.stringify(storage), [storage]);

  useEffect(() => {
    if (!storage || storage[1] === 0) return;
    
    const maxHistory = 30;
    const storagePercent = (storage[0] / storage[1]) * 100;
    setHistory(prev => [...prev.slice(-maxHistory + 1), storagePercent]);
  }, [storageKey]);

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Icon icon="material-symbols:storage-rounded" className="size-5 text-purple-500" />
          </div>
          <div className="text-sm text-fd-muted-foreground uppercase tracking-wider">Stockage</div>
        </div>
        <div className="text-3xl font-bold font-mono mb-1 whitespace-nowrap">
          {formatBytes(lerpedUsed)}
        </div>
        <div className="text-xs text-fd-muted-foreground font-mono">
          {formatBytes(lerpedTotal)} total
        </div>
      </div>
      {/* Mini graph */}
      <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20">
        <MiniChart data={history} color="rgb(168, 85, 247)" />
      </div>
    </Card>
  );
}
