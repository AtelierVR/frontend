'use client';

import Bio from './Bio';
import { useUser } from './UserContext';

export default function UserDescriptionPage() {
    const { user } = useUser();
    return <Bio user={user} />;
}
