'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { buttonVariants } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';
import { useApi } from '@/lib/api';
import Image from 'next/image';
import { NoxWellKnown } from '@/lib/api/config';
import { ThemeLogo } from '@/lib/theme-logo';


// ---------- Page ----------
export default function HomePage() {
  const { t } = useTranslation();
  const Api = useApi();

  let state = 0; // 0 = loading, 1 = online, 2 = offline
  if (Api.server instanceof Error) state = 2;
  else if (Api.server) state = 1;

  let server: NoxWellKnown | null = state === 1 && Api.server ? Api.server as NoxWellKnown : null;

  return (
    <div className="flex flex-col flex-1 w-full">

      {/* ── Hero ── */}
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-b to-transparent h-screen flex items-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.18),transparent)]"
        />
        <div className="relative max-w-3xl mx-auto px-6 py-16 flex flex-col items-center text-center gap-5">

          <ThemeLogo className="size-32 rounded-lg drop-shadow-lg" />

          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            {state === 1 ? server?.metadata?.title ?? 'Nox Node' : 'Nox Node'}
          </h1>
          <p className="text-fd-muted-foreground text-lg max-w-lg leading-relaxed">
            {state === 1 ? server?.metadata?.description ?? 'A federated VR & social node. Meet people, explore worlds, build community.' : 'A federated VR & social node. Meet people, explore worlds, build community.'}
          </p>


          <div className="flex gap-3 py-32 pb-64 flex-wrap justify-center items-center">
            {state === 1 ? <>
              <Link href="/register" className={buttonVariants({ variant: 'primary' })}>
                <Icon icon="material-symbols:person-add-rounded" />
                {t('home.join_this_node')}
              </Link>
              <Link href="/login" className={buttonVariants({ variant: 'outline' })}>
                {t('home.sign_in')}
              </Link>
            </> : state === 2 ? <>
              <span className="size-2 rounded-full bg-red-400 animate-ping" />
              <span className="text-xs text-fd-muted-foreground font-medium uppercase tracking-widest ml-1">
                {t('home.node_offline')}
              </span>
            </> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
