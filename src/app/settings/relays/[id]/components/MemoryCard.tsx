'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { MiniChart } from './MiniChart';
import { useLerpedValue } from '../hooks';
import { formatBytes } from '../utils';

interface MemoryCardProps {
  memory: [number, number];
}

export function MemoryCard({ memory }: MemoryCardProps) {
  const [history, setHistory] = useState<number[]>([]);
  const lerpedUsed = useLerpedValue(memory[0], 500);
  const lerpedTotal = useLerpedValue(memory[1], 500);
  
  // Créer une clé pour détecter les changements réels
  const memoryKey = useMemo(() => JSON.stringify(memory), [memory]);

  useEffect(() => {
    if (!memory || memory[1] === 0) return;
    
    const maxHistory = 30;
    const memoryPercent = (memory[0] / memory[1]) * 100;
    setHistory(prev => [...prev.slice(-maxHistory + 1), memoryPercent]);
  }, [memoryKey]);

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Icon icon="material-symbols:memory-rounded" className="size-5 text-green-500" />
          </div>
          <div className="text-sm text-fd-muted-foreground uppercase tracking-wider">Mémoire</div>
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
        <MiniChart data={history} color="rgb(34, 197, 94)" />
      </div>
    </Card>
  );
}
