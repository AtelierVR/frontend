'use client';

import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { isError, useApi } from "@/lib/api";
import type { User } from "@/lib/api/types";
import { getSIDById } from "@/lib/api/utils";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import Banner from "./Banner";
import Thumbnail from "./Thumbnail";
import Display from "./Display";
import Bio from "./Bio";
import LinkBox from "./LinkBox";
import TagBox from "./TagBox";
import FollowStats from "./FollowStats";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Pencil } from "lucide-react";
import { PresenceIcon } from "@/components/ui/presence-icon";
import { HomeLayout } from '@/components/layout/home';
import { baseOptions } from '@/lib/layout.shared';
import Link from "next/link";
import { FollowAddButton } from "./FollowAddButton";
import { FollowRemoveButton } from "./FollowRemoveButton";
import { FollowRequestButton } from "./FollowRequest";

// Presence configuration
const PRESENCE_CONFIG: Record<string, { bgColor: string; label: string }> = {
    'oja': { bgColor: 'cyan', label: 'Online - Join All' },
    'ojf': { bgColor: 'blue', label: 'Online - Join Friends' },
    'online': { bgColor: 'green', label: 'Online' },
    'busy': { bgColor: 'orange', label: 'Busy' },
    'dnd': { bgColor: 'red', label: 'Do Not Disturb' },
    'stream': { bgColor: 'purple', label: 'Streaming' },
    'offline': { bgColor: 'gray', label: 'Offline' },
};

export default function UserPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const Api = useApi();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!Api) return;

        async function fetchUser() {
            if (!id || Array.isArray(id)) {
                setError('User not found');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            // Parse the id - could be "username@server" or just "id"
            let userId: string | number = id;
            let server: string | undefined;

            if (id.includes('@')) {
                const [username, srv] = id.split('@');
                userId = username;
                server = srv;
            }

            const result = await Api.fetchUser(userId, server);
            
            if (isError(result)) {
                setError(result.message || 'Failed to load user');
                setLoading(false);
                return;
            }

            setUser(result);
            setLoading(false);
        }

        fetchUser();
    }, [id]);

    const isSame = Api && Api.currentUser && user 
        && getSIDById(Api.currentUser.id, Api.currentUser.server) === getSIDById(user.id, user.server);

    const presenceConfig = user?.presence ? PRESENCE_CONFIG[user.presence.status] : null;

    if (loading) {
        return (
            <div className="container max-w-6xl mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                    <div className="space-y-6">
                        <Card className="relative overflow-hidden">
                            <Skeleton className="w-full h-48" />
                            <div className="relative flex items-center ms-12 h-16">
                                <Skeleton className="w-[8em] h-[8em] rounded-xl absolute -top-[4em]" />
                            </div>
                            <div className="p-6 space-y-4">
                                <Skeleton className="h-8 w-1/3" />
                                <Skeleton className="h-5 w-1/2" />
                            </div>
                        </Card>
                        <Card className="p-6">
                            <Skeleton className="h-24 w-full" />
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card className="p-6">
                            <Skeleton className="h-32 w-full" />
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="container max-w-6xl mx-auto py-8 px-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error || 'User not found'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <HomeLayout {...baseOptions()}>
            <div className="container max-w-6xl mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                {/* Main content */}
                <div className="space-y-6">
                    <Card className="relative overflow-hidden">
                        {/* Presence status overlay */}
                        {user?.presence && presenceConfig && (
                            isSame ? (
                                <Link 
                                    href="/settings/profile#presence"
                                    className={cn(
                                        "absolute top-3 left-3 z-10",
                                        "flex items-center",
                                        user.presence.text ? "gap-2 px-3 py-1.5" : "gap-0 p-1.5",
                                        "rounded-full",
                                        "backdrop-blur-md bg-black/40",
                                        "group cursor-pointer",
                                        "hover:bg-black/50 transition-all"
                                    )}
                                >
                                    <PresenceIcon 
                                        status={user.presence.status} 
                                        size={18}
                                    />
                                    {user.presence.text && (
                                        <span className="text-sm font-medium text-white">
                                            {user.presence.text}
                                        </span>
                                    )}
                                    <div className={cn(
                                        "overflow-hidden transition-all duration-200",
                                        user.presence.text ? "w-0 group-hover:w-4" : "w-0 group-hover:w-4 group-hover:ml-1.5"
                                    )}>
                                        <Pencil className="size-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-150" />
                                    </div>
                                </Link>
                            ) : (
                                user.presence.text ? (
                                    <div className={cn(
                                        "absolute top-3 left-3 z-10",
                                        "flex items-center gap-2",
                                        "px-3 py-1.5",
                                        "rounded-full",
                                        "backdrop-blur-md bg-black/40"
                                    )}>
                                        <PresenceIcon 
                                            status={user.presence.status} 
                                            size={18}
                                        />
                                        <span className="text-sm font-medium text-white">
                                            {user.presence.text}
                                        </span>
                                    </div>
                                ) : (
                                    <div className={cn(
                                        "absolute top-3 left-3 z-10",
                                        "p-1.5",
                                        "rounded-full",
                                        "backdrop-blur-md bg-black/40"
                                    )}>
                                        <PresenceIcon 
                                            status={user.presence.status} 
                                            size={18}
                                        />
                                    </div>
                                )
                            )
                        )}

                        <Banner user={user} />
                        <div className="relative flex items-center ms-12 h-16">
                            <Thumbnail user={user} />
                            <div className="absolute w-full flex items-center justify-end pe-4 gap-2">
                                {Api && Api.currentUser && !isSame && user && !user?.relations?.out && (
                                    <FollowAddButton user={user} setUser={setUser} />
                                )}
                                {Api && Api.currentUser && !isSame && user && user?.relations?.out && (
                                    <FollowRemoveButton user={user} type={user.relations.out} setUser={setUser} />
                                )}
                                {Api && Api.currentUser && !isSame && user && user?.relations?.in === "REQUEST" && (
                                    <FollowRequestButton user={user} setUser={setUser} />
                                )}
                            </div>
                        </div>
                        <div className="w-full p-6 space-y-5">
                            <Display user={user} />
                        </div>
                    </Card>

                    <Bio user={user} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <FollowStats user={user} />
                    <LinkBox user={user} />
                    <TagBox user={user} />
                </div>
            </div>
            </div>
        </HomeLayout>
    );
}
