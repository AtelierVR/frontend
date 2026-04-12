'use client';

import { useState, useEffect } from 'react';
import { useApi, isError } from '@/lib/api';
import { parseSid } from '@/lib/platform';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import type { User } from '@/lib/api/types';

interface UploaderLabelProps {
    sid: string;
}

export function UploaderLabel({ sid }: UploaderLabelProps) {
    const Api = useApi();
    const [user, setUser] = useState<User | null | undefined>(undefined);

    useEffect(() => {
        if (!Api) return;
        const { id, server } = parseSid(sid);
        Api.getOrFetchUser(id, server).then(res => {
            setUser(isError(res) ? null : res);
        });
    }, [sid, Api]);

    const label = user
        ? (user.display || user.username)
        : (sid.startsWith('u:') ? sid.slice(2) : sid);

    return <Link className="group flex items-center gap-1 text-xs text-fd-muted-foreground" href={`/u/${sid}`}>
        <Icon icon="material-symbols:upload-rounded" className="size-3.5 flex-shrink-0" />
        {user === undefined
            ? <span className="inline-block w-20 h-3 rounded animate-pulse bg-fd-muted" />
            : <span className="font-mono truncate max-w-[12rem] group-hover:underline">{label}</span>
        }
    </Link>;
}
