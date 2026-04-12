'use client';

import { useApi } from '@/lib/api';
import Link from 'next/link';
import { UserDropdownMenu } from './user-dropdown-menu';
import { UserNavMenu } from './user-nav-menu';

interface UserAuthProps {
    useDropdown?: boolean;
}

export function UserAuth({ useDropdown = false }: UserAuthProps = {}) {
    const api = useApi();

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

    if (useDropdown) {
        return <UserDropdownMenu user={api.currentUser} onLogout={() => api.fetchLogout()} />;
    }

    return <UserNavMenu user={api.currentUser} onLogout={() => api.fetchLogout()} />;
}
