'use client';

import WorldDescription from './Description';
import { useWorld } from './WorldContext';

export default function WorldPage() {
    const { world } = useWorld();
    return <WorldDescription world={world} />;
}
