'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { buttonVariants } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';
import type { CurrentUser } from '@/lib/api/types';

function initials(user: CurrentUser) {
    return (user.display || user.username).replace(/[^a-zA-Z ]/g, '').split(' ').map(n => n[0]).join('').toUpperCase();
}

interface UserDropdownMenuProps {
    user: CurrentUser;
    onLogout: () => void;
}

export function UserDropdownMenu({ user, onLogout }: UserDropdownMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ color: 'ghost', size: 'icon' }), 'rounded-full p-0')}>
                <Avatar>
                    <AvatarImage src={user.thumbnail} alt={user.display || user.username} />
                    <AvatarFallback className="bg-fd-accent text-fd-accent-foreground font-semibold text-sm">{initials(user)}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.display || user.username}</p>
                        <p className="text-xs leading-none text-fd-muted-foreground">@{user.username}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={user.alias?.find(a => a.key === 'profile')?.value || `/u/${user.username}`} className="cursor-pointer">
                        <Icon icon="material-symbols:person-rounded" className="mr-2 size-4" />Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/messages" className="cursor-pointer">
                        <Icon icon="material-symbols:mail-rounded" className="mr-2 size-4" />Messages
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                        <Icon icon="material-symbols:settings-rounded" className="mr-2 size-4" />Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-fd-destructive focus:text-fd-destructive">
                    <Icon icon="material-symbols:logout-rounded" className="mr-2 size-4" />Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
