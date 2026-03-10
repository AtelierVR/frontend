'use client';

import { cn } from '@/lib/cn';
import { useApi } from '@/lib/api';
import { useState } from 'react';
import type { User } from '@/lib/api/types';
import { getSIDById } from '@/lib/api/utils';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';

export default function Display({ user }: { user: User | null }) {
    const [hover, setHover] = useState(false);
    const [copied, setCopied] = useState(false);
    const Api = useApi();
    const isSame = Api && Api.currentUser && user && getSIDById(Api.currentUser.id, Api.currentUser.server) === getSIDById(user.id, user.server);

    const handleCopy = () => {
        if (user) {
            const sid = `${user.username}@${user.server}`;
            navigator.clipboard.writeText(sid);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
        >
            <h1 className="ms-2.5 text-2xl font-bold flex items-center gap-2">
                {user?.display ? (
                    <span className="text-fd-foreground">{user.display}</span>
                ) : (
                    <div
                        style={{ inlineSize: `25%` }}
                        className={cn(
                            "animate-pulse rounded-md",
                            "bg-fd-muted",
                            "h-8"
                        )}
                    />
                )}
                {isSame && (
                    <Link href="/settings/profile#display">
                        <Button variant="ghost" size="icon" className={cn("size-6", !hover && "opacity-0", "transition-opacity")}>
                            <Icon icon="material-symbols:edit-rounded" className="size-4" />
                        </Button>
                    </Link>
                )}
            </h1>
            {user?.username ? (
                <div className="flex items-center space-x-2 ms-2.5">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleCopy}
                        className="text-fd-muted-foreground hover:text-fd-foreground font-mono h-auto py-0 px-1"
                    >
                        <span className="text-sm">{user.username}@{user.server}</span>
                        {copied ? (
                            <Icon icon="material-symbols:check-rounded" className="ml-1 size-3 text-green-500" />
                        ) : (
                            <Icon icon="material-symbols:content-copy-rounded" className="ml-1 size-3" />
                        )}
                    </Button>
                    {user?.pronoun && (
                        <>
                            <span className="text-fd-muted-foreground text-sm">•</span>
                            <span className="text-fd-muted-foreground text-sm font-medium">{user.pronoun}</span>
                        </>
                    )}
                </div>
            ) : (
                <div
                    style={{ width: `35%` }}
                    className={cn(
                        "animate-pulse rounded-md",
                        "bg-fd-muted",
                        "h-5",
                        "mt-2 ms-2.5"
                    )}
                />
            )}
        </div>
    );
}
