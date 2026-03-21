'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { fetchApi, isResponseError } from '@/lib/api/utils';
import type { ServerInfo, ServerStatistics } from '@/lib/api/services/server';
import type { RelayDetails, RelayInstanceSummary } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';

// ---------- Types ----------
interface WorldCard {
  relayId: number;
  instance: RelayInstanceSummary;
}

// ---------- Helpers ----------
function worldName(raw: string) {
  return raw.replace(/^wrld_/i, '').replace(/-/g, ' ').slice(0, 32) || 'Unknown world';
}

function occupancy(current: number, max: number) {
  if (!max) return 0;
  return Math.round((current / max) * 100);
}

// ---------- Sub-components ----------
function StatPill({
  icon,
  value,
  label,
  loading,
  accent,
  sub,
}: {
  icon: string;
  value: number | null;
  label: string;
  loading: boolean;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-[80px]">
      <div className={cn('flex items-center justify-center size-10 rounded-xl bg-fd-accent/60', accent)}>
        <Icon icon={icon} className="size-5" />
      </div>
      {loading ? (
        <Skeleton className="h-6 w-10" />
      ) : (
        <span className="text-2xl font-bold tabular-nums">{value ?? '—'}</span>
      )}
      <span className="text-xs text-fd-muted-foreground text-center leading-tight">{label}</span>
      {sub && <span className="text-[10px] text-fd-muted-foreground/60 text-center">{sub}</span>}
    </div>
  );
}

function WorldSlide({ card }: { card: WorldCard }) {
  const occ = occupancy(card.instance.player_count, card.instance.capacity);
  const color =
    occ > 75 ? 'text-red-400' : occ > 40 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="flex flex-col gap-3 px-8 py-10 h-full">
      <div className="flex items-center gap-2">
        <Icon icon="material-symbols:public-rounded" className="size-5 text-fd-muted-foreground shrink-0" />
        <span className="font-semibold text-lg leading-tight capitalize line-clamp-1">
          {worldName(card.instance.world)}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-fd-muted-foreground">
        <span className="flex items-center gap-1">
          <Icon icon="material-symbols:person-rounded" className="size-4" />
          <span className={cn('font-medium tabular-nums', color)}>
            {card.instance.player_count}
          </span>
          {card.instance.capacity > 0 && (
            <span>/ {card.instance.capacity}</span>
          )}
        </span>
        <span className="flex items-center gap-1">
          <Icon icon="material-symbols:dns-rounded" className="size-4" />
          Relay #{card.relayId}
        </span>
      </div>
      {card.instance.capacity > 0 && (
        <div className="w-full h-1.5 rounded-full bg-fd-accent overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              occ > 75 ? 'bg-red-400' : occ > 40 ? 'bg-amber-400' : 'bg-emerald-400',
            )}
            style={{ width: `${occ}%` }}
          />
        </div>
      )}
      <p className="text-xs text-fd-muted-foreground mt-auto">
        Instance <span className="font-mono">{card.instance.id.slice(0, 8)}…</span>
      </p>
    </div>
  );
}

function WorldsCarousel({ cards, loading }: { cards: WorldCard[]; loading: boolean }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = cards.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [paused, next, total]);

  if (loading) {
    return (
      <div className="rounded-xl border border-fd-border overflow-hidden">
        <Skeleton className="h-48 w-full rounded-none" />
      </div>
    );
  }

  if (!total) {
    return (
      <div className="rounded-xl border border-fd-border flex flex-col items-center justify-center gap-2 py-14 text-fd-muted-foreground">
        <Icon icon="material-symbols:sleep-rounded" className="size-8 opacity-40" />
        <p className="text-sm">No active instances right now</p>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-xl border border-fd-border overflow-hidden bg-gradient-to-br from-violet-500/10 to-indigo-500/5 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <WorldSlide card={cards[current]} />

      {total > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 bg-fd-card/70 border border-fd-border hover:bg-fd-accent transition-colors"
          >
            <Icon icon="material-symbols:chevron-left-rounded" className="size-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 bg-fd-card/70 border border-fd-border hover:bg-fd-accent transition-colors"
          >
            <Icon icon="material-symbols:chevron-right-rounded" className="size-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`World ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === current
                    ? 'w-5 bg-fd-foreground'
                    : 'w-1.5 bg-fd-muted-foreground/40 hover:bg-fd-muted-foreground',
                )}
              />
            ))}
          </div>
        </>
      )}

      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-fd-card/80 border border-fd-border text-xs text-fd-muted-foreground">
        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {total} instance{total > 1 ? 's' : ''} live
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: 'material-symbols:vrpano-rounded',
    label: 'VR Native',
    desc: 'Built for immersive headset experiences',
    accent: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    icon: 'material-symbols:hub-rounded',
    label: 'Federated',
    desc: 'Connect across multiple nodes',
    accent: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: 'material-symbols:group-rounded',
    label: 'Social',
    desc: 'Profiles, follows & presences',
    accent: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    icon: 'material-symbols:lock-open-rounded',
    label: 'Open source',
    desc: 'Self-hosted, your data, your rules',
    accent: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
];

// ---------- Page ----------
export default function HomePage() {
  const [info, setInfo] = useState<ServerInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [worlds, setWorlds] = useState<WorldCard[]>([]);
  const [worldsLoading, setWorldsLoading] = useState(true);
  const { t } = useTranslation();

  // Fetch server info (includes statistics)
  useEffect(() => {
    fetchApi<ServerInfo>('/api/server').then((res) => {
      if (!isResponseError(res)) setInfo(res.data);
      setInfoLoading(false);
    });
  }, []);

  // Fetch live world/instance data for carousel (requires relay API access)
  useEffect(() => {
    async function loadWorlds() {
      const res = await fetchApi<RelayDetails[]>('/api/relays');
      if (isResponseError(res)) { setWorldsLoading(false); return; }
      const cards: WorldCard[] = [];
      for (const relay of res.data) {
        if (!relay.running || typeof relay.status === 'string') continue;
        const ir = await fetchApi<{ total: number; instances: RelayInstanceSummary[] }>(
          `/api/relays/${relay.id}/instances?limit=10&offset=0`,
        );
        if (!isResponseError(ir)) {
          for (const inst of ir.data.instances)
            if (inst.player_count > 0) cards.push({ relayId: relay.id, instance: inst });
        }
      }
      setWorlds(cards.sort((a, b) => b.instance.player_count - a.instance.player_count));
      setWorldsLoading(false);
    }
    loadWorlds();
  }, []);

  const stats = info?.statistics;
  const statsLoading = infoLoading;

  return (
    <div className="flex flex-col flex-1 w-full">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden border-b border-fd-border bg-gradient-to-b from-fd-card/60 to-transparent">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.18),transparent)]"
        />
        <div className="relative max-w-3xl mx-auto px-6 py-16 flex flex-col items-center text-center gap-5">
          {info?.icon && (
            <img
              src={info.icon}
              alt={info.title}
              className="size-16 rounded-2xl border border-fd-border object-cover shadow-lg bg-gray-900"
            />
          )}
          <div className="flex items-center gap-2">
            {info 
              ? <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              :  <span className="size-2 rounded-full bg-red-400 animate-ping" />
            }
            <span className="text-xs text-fd-muted-foreground font-medium uppercase tracking-widest">
              {info ? <span>{t('home.node_online')}</span> : <span>{t('home.node_offline')}</span>} 
            </span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            {info?.title ?? 'Nox Node'}
          </h1>
          <p className="text-fd-muted-foreground text-lg max-w-lg leading-relaxed">
            {info?.description ?? 'A federated VR & social node. Meet people, explore worlds, build community.'}
          </p>
          <div className="flex gap-3 mt-1 flex-wrap justify-center">
            <Link href="/register" className={buttonVariants({ variant: 'primary' })}>
              <Icon icon="material-symbols:person-add-rounded" />
              {t('home.join_this_node')}
            </Link>
            <Link href="/login" className={buttonVariants({ variant: 'outline' })}>
              {t('home.sign_in')}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-6 py-10 flex flex-col gap-10">

      </div>
    </div>
  );
}
