'use client';

import { useApi } from '@/lib/api';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';

export default function UserInline() {
  const Api = useApi();
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-fd-border rounded-lg bg-fd-card">
      <div
        className={cn(
          'size-16 border border-fd-border rounded-xl overflow-hidden bg-fd-muted',
          !Api || !Api.currentUser ? 'animate-pulse' : ''
        )}
      >
        {!imageError && Api?.currentUser?.thumbnail && (
          <Link href={`/u/${Api.currentUser.username}`}>
            <Image
              className="w-full h-full object-cover"
              src={Api.currentUser.thumbnail}
              alt={Api.currentUser.display || 'Thumbnail'}
              width={128}
              height={128}
              priority
              onError={() => setImageError(true)}
            />
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        {(!Api || !Api.currentUser) && (
          <>
            <div className="w-32 h-6 bg-fd-muted rounded-md animate-pulse" />
            <div className="w-24 h-4 bg-fd-muted rounded-md animate-pulse mt-1" />
          </>
        )}
        {Api?.currentUser && (
          <>
            <h3 className="text-lg font-semibold">
              <Link
                href={`/u/${Api.currentUser.username}`}
                className="hover:text-fd-primary transition-colors"
              >
                {Api.currentUser.display}
              </Link>
            </h3>
            <Link
              className="text-sm text-fd-muted-foreground hover:text-fd-foreground transition-colors"
              href={`/u/${Api.currentUser.username}`}
            >
              {Api.currentUser.username}@{Api.currentUser.server}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
