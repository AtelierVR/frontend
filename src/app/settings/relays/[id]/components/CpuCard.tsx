'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { MiniChart } from './MiniChart';
import { useLerpedValue } from '../hooks';
import { formatPercentage } from '../utils';

interface CpuCardProps {
  value: {
    u: number,
    c: number
  } | null
}

const maxHistory = 30;

export function CpuCard(props: CpuCardProps) {
  const [history, setHistory] = useState<number[]>(Array.from<number>({ length: maxHistory }).fill(0));
  const used = useLerpedValue(props.value?.u ?? 0, 100);
  const cores = props.value?.c ?? 0;

  const memo = useMemo(() => props.value?.u ?? 0, [props]);

  useEffect(() => {
    setHistory(prev => [...prev.slice(-maxHistory + 1), props.value?.u ?? 0]);
  }, [memo]);

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Icon icon="material-symbols:memory" className="size-5 text-blue-500" />
          </div>
          <div className="text-sm text-fd-muted-foreground uppercase tracking-wider">CPU</div>
        </div>
        <div className="text-3xl font-bold font-mono mb-1 whitespace-nowrap">
          {formatPercentage(used, cores)}
        </div>
        <div className="text-xs text-fd-muted-foreground">
          {formatPercentage(cores * 100, cores, false)} total
        </div>
      </div>
      {/* Line chart visualization */}
      <div className="absolute bottom-0 left-0 right-0 h-full opacity-15">
        <MiniChart data={history} min={0} max={cores} color="rgb(59, 130, 246)" />
      </div>
    </Card>
  );
}
