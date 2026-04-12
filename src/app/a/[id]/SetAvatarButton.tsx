'use client';

import { useState } from 'react';
import { useApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';

export default function SetAvatarButton({ avatarSid }: { avatarSid: string }) {
    const Api = useApi();
    const [busy, setBusy] = useState(false);

    if (!Api?.currentUser) return null;

    const isActive = Api.currentUser.avatar === avatarSid;

    const toggle = async () => {
        if (!Api || busy) return;
        setBusy(true);
        await Api.updateUser({ avatar: isActive ? null : avatarSid });
        setBusy(false);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className={cn(
                'gap-1.5',
                isActive && 'text-purple-500 border-purple-500/40 hover:text-purple-500',
            )}
            onClick={toggle}
            disabled={busy}
        >
            <Icon
                icon="material-symbols:checkroom-rounded"
                className="size-4"
            />
        </Button>
    );
}
