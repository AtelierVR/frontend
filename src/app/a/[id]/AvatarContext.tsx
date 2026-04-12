'use client';

import { createContext, useContext } from 'react';
import type { Avatar, AvatarAsset } from '@/lib/api/types';

export interface AvatarContextType {
    avatar: Avatar | null;
    allAssets: AvatarAsset[] | null;
    loading: boolean;
    error: string | null;
    canEdit: boolean;
    refresh: () => void;
}

const defaultCtx: AvatarContextType = {
    avatar: null,
    allAssets: null,
    loading: true,
    error: null,
    canEdit: false,
    refresh: () => {},
};

export const AvatarContext = createContext<AvatarContextType>(defaultCtx);

export function useAvatar() {
    return useContext(AvatarContext);
}
