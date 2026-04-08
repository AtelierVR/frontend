'use client';

import { createContext, useContext } from 'react';
import type { World, WorldAsset } from '@/lib/api/types';

export interface WorldContextType {
    world: World | null;
    allAssets: WorldAsset[] | null;
    loading: boolean;
    error: string | null;
    canEdit: boolean;
    refresh: () => void;
}

const defaultCtx: WorldContextType = {
    world: null,
    allAssets: null,
    loading: true,
    error: null,
    canEdit: false,
    refresh: () => {},
};

export const WorldContext = createContext<WorldContextType>(defaultCtx);

export function useWorld() {
    return useContext(WorldContext);
}
