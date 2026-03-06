'use client';

import { cn } from '@/lib/cn';
import { useApi } from '@/lib/api';
import { useState } from 'react';
import type { User } from '@/lib/api/types';
import { getSIDById } from '@/lib/api/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Pencil, ExternalLink } from 'lucide-react';
import Image from 'next/image';

// Simplified link structure - adapt based on your actual API
interface UserLink {
    label?: string;
    value: string;
}

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function cleanDomainName(domain: string): string {
    return domain.replace(/^www\./, '');
}

function getFaviconUrl(domain: string): string {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export default function LinkBox({ user }: { user: User | null }) {
    const [hover, setHover] = useState(false);
    const Api = useApi();
    const isSame = Api && Api.currentUser && user && getSIDById(Api.currentUser.id, Api.currentUser.server) === getSIDById(user.id, user.server);

    // Extract links from user.alias
    const links: UserLink[] = user?.links || [];

    return (
        <Card
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className={cn("size-6", !isSame && "invisible")} />
                    <h2 className="text-lg font-semibold">Links</h2>
                    {isSame ? (
                        <Link href="/settings/profile#links">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className={cn("size-6", !hover && "opacity-0", "transition-opacity")}
                            >
                                <Pencil className="size-4" />
                            </Button>
                        </Link>
                    ) : (
                        <div className="size-6" />
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <LinkGrid list={links} />
            </CardContent>
        </Card>
    );
}

function LinkGrid({ list }: { list: UserLink[] }) {
    return (
        <div className="flex flex-wrap gap-2 items-center justify-center">
            {list?.map((link, i) => <LinkItem key={i} link={link} />)}
            {list?.length === 0 && (
                <div className="text-fd-muted-foreground text-sm">No links</div>
            )}
            {!list && Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="animate-pulse bg-fd-muted h-8 w-24 rounded-full" />
            ))}
        </div>
    );
}

function LinkItem({ link }: { link: UserLink }) {
    const [imageError, setImageError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    if (!isValidUrl(link.value)) {
        return (
            <Badge variant="destructive" className="gap-2">
                <span>?</span>
                <span>Invalid URL</span>
            </Badge>
        );
    }

    const url = new URL(link.value);
    const domain = url.hostname;
    const displayName = link.label || cleanDomainName(domain);
    const faviconUrl = getFaviconUrl(domain);

    return (
        <a 
            href={link.value} 
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5",
                "bg-fd-secondary hover:bg-fd-secondary/80",
                "text-fd-secondary-foreground",
                "rounded-full text-sm",
                "border border-fd-border",
                "transition-colors"
            )}
            title={`Visit ${displayName}`}
        >
            {/* Favicon */}
            <div className="relative w-4 h-4 flex-shrink-0">
                {!imageError ? (
                    <>
                        <Image
                            src={faviconUrl}
                            alt={`${displayName} favicon`}
                            width={16}
                            height={16}
                            className={cn(
                                "w-full h-full object-contain transition-opacity",
                                isLoaded ? "opacity-100" : "opacity-0"
                            )}
                            onLoad={() => setIsLoaded(true)}
                            onError={() => setImageError(true)}
                            unoptimized
                        />
                        {!isLoaded && (
                            <div className="absolute inset-0 animate-pulse bg-fd-muted rounded-full" />
                        )}
                    </>
                ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-fd-primary/60 to-fd-primary/40 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                            {displayName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            {/* Display name */}
            <span className="font-medium">{displayName}</span>
        </a>
    );
}
