'use client';

import { cn } from '@/lib/cn';
import { useApi } from '@/lib/api';
import type { User } from '@/lib/api/types';
import { getSIDById } from '@/lib/api/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Icon } from '@iconify/react';
import Link from 'next/link';

export default function FollowStats({ user }: { user: User | null }) {
    const Api = useApi();
    const isSame = Api && Api.currentUser && user && getSIDById(Api.currentUser.id, Api.currentUser.server) === getSIDById(user.id, user.server);

    if (!user) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-around items-center">
                        {[0, 1].map((i) => (
                            <div key={i} className="text-center">
                                <div className={cn(
                                    "animate-pulse rounded-md",
                                    "bg-fd-muted",
                                    "h-8 w-16 mx-auto mb-2"
                                )} />
                                <div className={cn(
                                    "animate-pulse rounded-md",
                                    "bg-fd-muted",
                                    "h-4 w-20 mx-auto"
                                )} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Don't show if both followers and following are -1 (hidden)
    if (user.followers === -1 && user.following === -1) {
        return null;
    }

    const followers = user.followers;
    const following = user.following;

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-around items-center">
                    {followers > -1 && (
                        <StatItem 
                            count={followers} 
                            label="Followers" 
                            href={isSame ? "/settings/follow/followers" : undefined}
                            icon={<Icon icon="material-symbols:group-rounded" className="size-5" />}
                        />
                    )}
                    {followers > -1 && following > -1 && (
                        <div className="h-8 w-px bg-fd-border" />
                    )}
                    {following > -1 && (
                        <StatItem 
                            count={following} 
                            label="Following" 
                            href={isSame ? "/settings/follow/followings" : undefined}
                            icon={<Icon icon="material-symbols:how-to-reg-rounded" className="size-5" />}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function StatItem({ 
    count, 
    label, 
    href, 
    icon 
}: { 
    count: number; 
    label: string; 
    href?: string;
    icon: React.ReactNode;
}) {
    const content = (
        <>
            <div className="flex items-center justify-center mb-2">
                <span className="text-fd-muted-foreground mr-1">{icon}</span>
                <span className="text-2xl font-bold text-fd-foreground">
                    {count.toLocaleString()}
                </span>
            </div>
            <span className="text-sm text-fd-muted-foreground">
                {label}
            </span>
        </>
    );

    if (href) {
        return (
            <Link href={href} className="text-center group hover:opacity-80 transition-opacity">
                {content}
            </Link>
        );
    }

    return <div className="text-center">{content}</div>;
}
