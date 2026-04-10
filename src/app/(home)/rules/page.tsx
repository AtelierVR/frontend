import RulesPageClient from './_client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Règlement de la communauté',
    description: 'Les règles et normes de comportement attendues au sein de la plateforme.',
};

export default function RulesPage() {
    return <RulesPageClient />;
}
