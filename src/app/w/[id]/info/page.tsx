'use client';

import WorldInfo from '../WorldInfo';
import WorldContributors from '../WorldContributors';
import WorldTags from '../WorldTags';
import { useWorld } from '../WorldContext';

export default function WorldInfoPage() {
    const { world } = useWorld();
    return (
        <div className="space-y-6">
            <WorldInfo world={world} />
            <WorldContributors world={world} />
            <WorldTags world={world} />
        </div>
    );
}
