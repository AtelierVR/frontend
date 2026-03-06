'use client';

import { Card } from '@/components/ui/card';
import { Icon } from '@iconify/react';

export default function RelayPlayersPage() {
  return (
    <Card className="p-8 text-center text-fd-muted-foreground">
      <Icon icon="material-symbols:group-rounded" className="size-12 mx-auto mb-4 opacity-50" />
      <p className="font-medium">Données non disponibles</p>
      <p className="text-sm mt-1">Les détails des joueurs ne sont plus transmis par le relay.</p>
    </Card>
  );
}
