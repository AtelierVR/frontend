'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import {
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { NavMenuCard, NavMenuButton } from './nav-menu-item';
import { cn } from '@/lib/cn';
import type { CurrentUser } from '@/lib/api/types';

function initials(user: CurrentUser) {
    return (user.display || user.username).replace(/[^a-zA-Z ]/g, '').split(' ').map(n => n[0]).join('').toUpperCase();
}

interface UserNavMenuProps {
    user: CurrentUser;
    onLogout: () => void;
}

export function UserNavMenu({ user, onLogout }: UserNavMenuProps) {
    const profileHref = user.alias?.find(a => a.key === 'profile')?.value || `/u/${user.username}`;

    return (
        <NavigationMenuItem>
            <NavigationMenuTrigger className={cn(
                buttonVariants({ color: 'ghost', size: 'icon' }),
                'rounded-full p-0',
            )}>
                <Avatar>
                    <AvatarImage src={user.thumbnail} alt={user.display || user.username} />
                    <AvatarFallback className="bg-fd-accent text-fd-accent-foreground font-semibold text-sm">{initials(user)}</AvatarFallback>
                </Avatar>
            </NavigationMenuTrigger>
            <NavigationMenuContent className="flex flex-col gap-2 p-4 min-w-[340px]">
                <div className="grid grid-cols-6 gap-2">
                    <Link
                        href={profileHref}
                        className="col-span-2 row-span-2 flex flex-col items-center justify-center gap-2 rounded-lg border bg-fd-card p-4 transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground"
                    >
                        <Avatar className="size-12">
                            <AvatarImage src={user.thumbnail} alt={user.display || user.username} />
                            <AvatarFallback className="bg-fd-accent text-fd-accent-foreground font-semibold">{initials(user)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-center gap-0.5">
                            <span className="text-sm font-medium text-center leading-tight">{user.display || user.username}</span>
                            <span className="text-xs text-fd-muted-foreground">@{user.username}</span>
                        </div>
                    </Link>
                    <NavMenuCard href="/messages" icon="material-symbols:mail-rounded" label="Messages" />
                    <NavMenuCard href="/settings" icon="material-symbols:settings-rounded" label="Settings" />
                    <NavMenuButton icon="material-symbols:logout-rounded" label="Logout" className="text-fd-destructive" onClick={onLogout} />
                </div>
            </NavigationMenuContent>
        </NavigationMenuItem>
    );
}
