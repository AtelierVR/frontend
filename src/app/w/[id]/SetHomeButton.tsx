'use client';

import { useState } from 'react';
import { useApi, isError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';

export default function SetHomeButton({ worldSid }: { worldSid: string }) {
    const Api = useApi();
    const [busy, setBusy] = useState(false);

    if (!Api?.currentUser) return null;

    const isHome = Api.currentUser.home === worldSid;

    const toggle = async () => {
        if (!Api || busy) return;
        setBusy(true);
        await Api.updateUser({ home: isHome ? null : worldSid });
        setBusy(false);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className={cn(
                'gap-1.5',
                isHome && 'text-blue-500 border-blue-500/40 hover:text-blue-500',
            )}
            onClick={toggle}
            disabled={busy}
        >
            <Icon
                icon={isHome ? 'material-symbols:home-rounded' : 'material-symbols:home-outline-rounded'}
                className="size-4"
            />
        </Button>
    );
}
