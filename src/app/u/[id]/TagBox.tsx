'use client';

import { cn } from '@/lib/cn';
import { useApi } from '@/lib/api';
import { useState } from 'react';
import type { User } from '@/lib/api/types';
import { getSIDById } from '@/lib/api/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Pencil, Shield, Globe, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCountries } from '@/lib/hooks/useCountries';
import { useLanguages } from '@/lib/hooks/useLanguages';
import type { Country } from '@/lib/countries';
import type { Language } from '@/lib/languages';

interface TagPlaceholder {
    text?: string;
    color?: [number, number, number];
    icon?: React.ReactNode;
}

// Configuration des tags basée sur front/src/config/config.tsx
const getTagConfig = (tag: string, countries: Country[], languages: Language[]): TagPlaceholder | null => {
    // Tags système qui doivent être cachés
    if (tag.match(/^dft:/) || tag.match(/^[a-z]{3}:hide_/)) {
        return null;
    }

    // Tags système avec icônes
    if (tag === 'sys:auto_reject_follow') {
        return { text: "Auto reject", color: [255, 0, 0], icon: <AlertCircle className="size-4" /> };
    }
    if (tag === 'sys:manual_follow_validation') {
        return { text: "Manual validation", color: [255, 128, 128], icon: <CheckCircle className="size-4" /> };
    }
    if (tag === 'dft:can_instance_create') {
        return { text: "Create instances", color: [0, 166, 244], icon: <Users className="size-4" /> };
    }
    if (tag === 'dft:can_world_create') {
        return { text: "Create worlds", color: [0, 201, 80], icon: <Globe className="size-4" /> };
    }
    if (tag === 'sys:unverified') {
        return { text: "Unverified", color: [240, 177, 0], icon: <AlertCircle className="size-4" /> };
    }
    if (tag === 'sys:admin') {
        return { text: "Admin", color: [255, 128, 128], icon: <Shield className="size-4" /> };
    }

    // Tags de pays (usr:country_XX)
    if (tag.match(/^usr:country_[a-z]{2,3}$/)) {
        const iso = tag.split('_')[1].toUpperCase();
        const country = countries.find(c => c.cca2 === iso);
        if (country) {
            return {
                text: country.name.common,
                color: undefined,
                icon: <span className="text-base leading-none">{country.flag}</span>
            };
        }
        return { text: `Country: ${iso}`, color: undefined };
    }

    // Tags de langue (usr:lang_XX)
    if (tag.match(/^usr:lang_[a-z]{2,3}$/)) {
        const langCode = tag.split('_')[1];
        const language = languages.find(l => l.code.toLowerCase() === langCode.toLowerCase());
        return {
            text: language?.name || `Language: ${langCode}`,
            color: undefined,
            icon: language ? <span className="text-base leading-none">{language.flag}</span> : <span className="text-xs font-mono uppercase bg-fd-muted px-1 rounded">{langCode}</span>
        };
    }

    // Tags utilisateur personnalisés (usr:*)
    if (tag.startsWith('usr:')) {
        const value = tag.slice(4);
        return { text: value, color: [211, 186, 243] };
    }

    // Tag par défaut
    const displayName = tag.includes(':') 
        ? tag.split(':', 2)[1].split('_').map((word: string) => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        : tag;

    return { text: displayName, color: undefined };
};

export default function TagBox({ user }: { user: User | null }) {
    const [hover, setHover] = useState(false);
    const Api = useApi();
    const { countries } = useCountries();
    const { languages } = useLanguages();
    const isSame = Api && Api.currentUser && user && getSIDById(Api.currentUser.id, Api.currentUser.server) === getSIDById(user.id, user.server);

    return (
        <Card
            onMouseOver={() => setHover(true)}
            onMouseOut={() => setHover(false)}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className={cn("size-6", !isSame && "invisible")} />
                    <h2 className="text-lg font-semibold">Tags</h2>
                    {isSame ? (
                        <Link href="/settings/account#tags">
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
                <TagList list={user?.tags || null} countries={countries} languages={languages} />
            </CardContent>
        </Card>
    );
}

function TagList({ list, countries, languages }: { list: string[] | null; countries: Country[]; languages: Language[] }) {
    return (
        <div className="flex flex-wrap gap-2 items-center justify-center">
            {list?.map((tag, i) => <TagItem key={i} tag={tag} countries={countries} languages={languages} />)}
            {list?.length === 0 && (
                <div className="text-fd-muted-foreground text-sm">No tags</div>
            )}
            {!list && [75, 60, 80].map((k, i) => (
                <div 
                    key={i}
                    style={{ inlineSize: `${k}px` }} 
                    className={cn(
                        "bg-fd-muted",
                        "animate-pulse rounded-full",
                        "h-8"
                    )} 
                />
            ))}
        </div>
    );
}

function TagItem({ tag, countries, languages }: { tag: string; countries: Country[]; languages: Language[] }) {
    const config = getTagConfig(tag, countries, languages);

    // Tag à cacher
    if (config === null) {
        return null;
    }

    const colorSaturation = (color: [number, number, number], saturation: number) => 
        color.map(value => Math.round(value * saturation));

    const customStyles = config.color ? {
        backgroundColor: `rgb(${config.color.join(', ')})`,
        borderColor: `rgb(${colorSaturation(config.color, 0.7).join(', ')})`,
        color: config.color[0] * 0.299 + config.color[1] * 0.587 + config.color[2] * 0.114 > 128 ? '#000000' : '#ffffff'
    } : {};

    return (
        <div
            style={customStyles}
            className={cn(
                "inline-flex items-center gap-2",
                "px-3 py-1",
                "rounded-full text-sm",
                "border",
                "transition-colors",
                config.color ? undefined : "bg-fd-secondary",
                config.color ? undefined : "text-fd-secondary-foreground",
                config.color ? undefined : "border-fd-border"
            )}
        >
            {config.icon && <span className="flex-shrink-0">{config.icon}</span>}
            <span className="font-medium">{config.text || tag}</span>
        </div>
    );
}
