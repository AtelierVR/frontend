'use client';

import { useApi } from '@/lib/api';
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
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';

interface UserAuthProps {
  /**
   * Use dropdown menu instead of navigation menu (for mobile or contexts outside NavigationMenu)
   */
  useDropdown?: boolean;
}

export function UserAuth({ useDropdown = false }: UserAuthProps = {}) {
  const api = useApi();

  // Si pas d'utilisateur connecté, afficher le bouton Login
  if (!api.currentUser) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-full border bg-fd-secondary/50 p-1.5 ps-2.5 pe-3 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
      >
        Login
      </Link>
    );
  }

  const avatarContent = (
    <Avatar>
      <AvatarImage
        src={api.currentUser.thumbnail}
        alt={api.currentUser.display || api.currentUser.username}
      />
      <AvatarFallback className="bg-fd-accent text-fd-accent-foreground font-semibold text-sm">
        {(api.currentUser.display || api.currentUser.username).replace(/[^a-zA-Z ]/g, '').split(' ').map(n => n[0]).join('').toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );

  const menuContentCards = (
    <div className="grid grid-cols-6 gap-2">
      <NavigationMenuLink asChild>
        <Link
          href={api.currentUser.alias?.find(a => a.key === 'profile')?.value || `/u/${api.currentUser.username}`}
          className="col-span-2 row-span-2 flex flex-col items-center justify-center gap-2 rounded-lg border bg-fd-card p-4 transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground"
        >
          <Avatar className="size-12">
            <AvatarImage
              src={api.currentUser.thumbnail}
              alt={api.currentUser.display || api.currentUser.username}
            />
            <AvatarFallback className="bg-fd-accent text-fd-accent-foreground font-semibold">
              {(api.currentUser.display || api.currentUser.username).replace(/[^a-zA-Z ]/g, '').split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-sm font-medium text-center leading-tight">
              {api.currentUser.display || api.currentUser.username}
            </span>
            <span className="text-xs text-fd-muted-foreground">
              @{api.currentUser.username}
            </span>
          </div>
        </Link>
      </NavigationMenuLink>

      <NavigationMenuLink asChild>
        <Link
          href="/messages"
          className="col-span-2 flex items-center gap-3 rounded-lg border bg-fd-card p-3 transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground"
        >
          <Icon icon="material-symbols:mail-rounded" className="size-5" />
          <span className="text-sm font-medium">Messages</span>
        </Link>
      </NavigationMenuLink>

      <NavigationMenuLink asChild>
        <Link
          href="/settings"
          className="col-span-2 flex items-center gap-3 rounded-lg border bg-fd-card p-3 transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground"
        >
          <Icon icon="material-symbols:settings-rounded" className="size-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </NavigationMenuLink>

      <NavigationMenuLink asChild>
        <button
          onClick={() => api.fetchLogout()}
          className="col-span-4 flex items-center gap-3 rounded-lg border bg-fd-card p-3 transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground text-fd-destructive w-full text-left"
        >
          <Icon icon="material-symbols:logout-rounded" className="size-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </NavigationMenuLink>
    </div>
  );

  // Version dropdown pour mobile ou contextes en dehors du NavigationMenu
  if (useDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({
              color: 'ghost',
              size: 'icon',
            }),
            'rounded-full p-0'
          )}
        >
          {avatarContent}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {api.currentUser.display || api.currentUser.username}
              </p>
              <p className="text-xs leading-none text-fd-muted-foreground">
                @{api.currentUser.username}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={api.currentUser.alias?.find(a => a.key === 'profile')?.value || `/u/${api.currentUser.username}`} className="cursor-pointer">
              <Icon icon="material-symbols:person-rounded" className="mr-2 size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/messages" className="cursor-pointer">
              <Icon icon="material-symbols:mail-rounded" className="mr-2 size-4" />
              Messages
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="cursor-pointer">
              <Icon icon="material-symbols:settings-rounded" className="mr-2 size-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => api.fetchLogout()}
            className="cursor-pointer text-fd-destructive focus:text-fd-destructive"
          >
            <Icon icon="material-symbols:logout-rounded" className="mr-2 size-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Version NavigationMenuItem pour desktop
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger
        className={cn(
          buttonVariants({
            color: 'ghost',
            size: 'icon',
          }),
          'rounded-full p-0'
        )}
      >
        {avatarContent}
      </NavigationMenuTrigger>
      <NavigationMenuContent className="flex flex-col gap-2 p-4 min-w-[340px]">
        {menuContentCards}
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}
