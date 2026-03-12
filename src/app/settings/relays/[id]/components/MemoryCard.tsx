'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { MiniChart } from './MiniChart';
import { useLerpedValue } from '../hooks';
import { formatBytes } from '../utils';

interface MemoryCardProps {
  value: {
    u: number,
    t: number
  } | null
}

const maxHistory = 30;

export function MemoryCard(props: MemoryCardProps) {
  const [history, setHistory] = useState<number[]>(Array.from<number>({ length: maxHistory }).fill(0));
  const used = useLerpedValue(props.value?.u ?? 0, 100);
  const total = props.value?.t ?? 0;

  const memo = useMemo(() => props.value?.u ?? 0, [props]);

  useEffect(() => {
    setHistory(prev => [...prev.slice(-maxHistory + 1), props.value?.u ?? 0]);
  }, [memo]);

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
          {formatBytes(used)}
        </div>
        <div className="text-xs text-fd-muted-foreground font-mono">
          {formatBytes(total)} total
        </div>
      </div>
      {/* Mini graph */}
      <div className="absolute bottom-0 left-0 right-0 h-full opacity-20">
        <MiniChart data={history} min={0} max={total} color="rgb(34, 197, 94)" />
      </div>
    </Card>
  );
}
