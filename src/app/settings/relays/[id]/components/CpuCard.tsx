'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import { MiniChart } from './MiniChart';
import { useLerpedValue } from '../hooks';

interface CpuCardProps {
  cpu: number;
}

export function CpuCard({ cpu }: CpuCardProps) {
  const [history, setHistory] = useState<number[]>([]);
  const lerpedCpu = useLerpedValue(cpu, 500);
  
  // Créer une clé pour détecter les changements réels
  const cpuKey = useMemo(() => cpu, [cpu]);

  useEffect(() => {
    if (cpu === undefined || cpu === null) return;
    
    const maxHistory = 30;
    setHistory(prev => [...prev.slice(-maxHistory + 1), cpu]);
  }, [cpuKey]);

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
          {isNaN(lerpedCpu) || lerpedCpu === undefined ? '0.0' : lerpedCpu.toFixed(1)}%
        </div>
        <div className="text-xs text-fd-muted-foreground">
          Process Usage
        </div>
      </div>
      {/* Line chart visualization */}
      <div className="absolute bottom-0 left-0 right-0 h-24 opacity-15">
        <MiniChart data={history} color="rgb(59, 130, 246)" />
      </div>
    </Card>
  );
}
