'use client';

import { useApi } from '@/lib/api';
import type { User } from '@/lib/api/types';
import { getSIDById } from '@/lib/api/utils';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { IdentifierCopy } from '@/components/ui/identifier-copy';

export default function Display({ user }: { user: User | null }) {
    const Api = useApi();
    const isSame = Api && Api.currentUser && user && getSIDById(Api.currentUser.id, Api.currentUser.server) === getSIDById(user.id, user.server);

    return (
        <div>
            <h1 className="group text-2xl font-bold flex items-center gap-2">
                {user?.display ? (
                    <span className="text-fd-foreground">{user.display}</span>
                ) : (
                    <div
                        style={{ inlineSize: `25%` }}
                        className="animate-pulse rounded-md bg-fd-muted h-8"
                    />
                )}
                {isSame && (
                    <Link href="/settings/profile#display">
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity size-7">
                            <Icon icon="material-symbols:edit-rounded" className="size-4" />
                        </Button>
                    </Link>
                )}
            </h1>
            {user?.username ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-fd-muted-foreground">
                    <IdentifierCopy identifier={`${user.username}@${user.server}`} />
                    {user?.pronoun && (
                        <>
                            <span>·</span>
                            <span className="font-medium">{user.pronoun}</span>
                        </>
                    )}
                </div>
            ) : (
                <div
                    style={{ width: `35%` }}
                    className="animate-pulse rounded-md bg-fd-muted h-4 mt-1 ms-2.5"
                />
            )}
        </div>
    );
}
