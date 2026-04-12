'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { NavigationMenuLink } from '@/components/ui/navigation-menu';

interface NavMenuCardProps {
    href: string;
    icon: string;
    label: string;
    className?: string;
    colSpan?: 2 | 4;
    asButton?: boolean;
    onClick?: () => void;
}

export function NavMenuCard({ href, icon, label, className, colSpan = 2, onClick }: NavMenuCardProps) {
    const baseClass = `col-span-${colSpan} flex items-center gap-3 rounded-lg border bg-fd-card p-3 transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground ${className ?? ''}`;
    return (
        <NavigationMenuLink asChild>
            <Link href={href} className={baseClass} onClick={onClick}>
                <Icon icon={icon} className="size-5" />
                <span className="text-sm font-medium">{label}</span>
            </Link>
        </NavigationMenuLink>
    );
}

interface NavMenuButtonProps {
    icon: string;
    label: string;
    className?: string;
    colSpan?: 2 | 4;
    onClick?: () => void;
}

export function NavMenuButton({ icon, label, className, colSpan = 4, onClick }: NavMenuButtonProps) {
    const baseClass = `col-span-${colSpan} flex items-center gap-3 rounded-lg border bg-fd-card p-3 transition-colors hover:bg-fd-accent/80 hover:text-fd-accent-foreground w-full text-left ${className ?? ''}`;
    return (
        <NavigationMenuLink asChild>
            <button onClick={onClick} className={baseClass}>
                <Icon icon={icon} className="size-5" />
                <span className="text-sm font-medium">{label}</span>
            </button>
        </NavigationMenuLink>
    );
}
