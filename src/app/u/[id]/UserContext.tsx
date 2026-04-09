'use client';

import React, { createContext, useContext } from 'react';
import type { User } from '@/lib/api/types';

interface UserContextValue {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    isSame: boolean;
}

export const UserContext = createContext<UserContextValue>({
    user: null,
    setUser: () => {},
    isSame: false,
});

export function useUser() {
    return useContext(UserContext);
}
