'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { useApi, isError, RelayPlayersResult } from '@/lib/api';

export default function InstancePlayersPage() {
  const params = useParams();
  const Api = useApi();
  const [data, setData] = useState<RelayPlayersResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const relayId = Number(params.id);
  const iid = params.iid as string;

  useEffect(() => {
    const load = async () => {
      if (!Api || !relayId || !iid) return;
      setLoading(true);
      setError(undefined);
      try {
        const res = await Api.fetchInstancePlayers(relayId, iid);
        if (isError(res)) { setError(res.message); return; }
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load players');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [Api, relayId, iid]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/settings/relays/${relayId}/instances`}>
          <Button variant="ghost" size="icon">
            <Icon icon="material-symbols:arrow-back-rounded" className="size-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-lg font-semibold">Players — Instance #{iid}</h2>
          <p className="text-sm text-fd-muted-foreground">
            Relay #{relayId}
          </p>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <Icon icon="material-symbols:error-circle-rounded" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
        <>
          {data && (
            <div className="text-sm text-fd-muted-foreground">
              {data.total} joueur{data.total !== 1 ? 's' : ''}
            </div>
          )}
          {(data?.players ?? []).length === 0 ? (
            <Card className="p-8 text-center text-fd-muted-foreground">
              <Icon icon="material-symbols:group-rounded" className="size-12 mx-auto mb-4 opacity-50" />
              <p>No players in this instance</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {data!.players.map((player, idx) => (
                <Card key={player.id ?? idx} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Icon icon="material-symbols:person-rounded" className="size-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{player.display || `Player #${player.id}`}</div>
                      <div className="text-xs text-fd-muted-foreground font-mono">
                        id:{player.id} • client:{player.client_id}
                      </div>
                    </div>
                    {player.flags !== 0 && (
                      <span className="text-xs font-mono text-fd-muted-foreground">
                        flags:{player.flags}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
