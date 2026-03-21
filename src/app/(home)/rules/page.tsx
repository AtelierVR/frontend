import MarkdownPage from '../_components/MarkdownPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Règlement de la communauté',
    description: 'Les règles et normes de comportement attendues au sein de la plateforme.',
};

export default function RulesPage() {
    return <MarkdownPage src="/api/rules.md" fallbackTitle="Règlement de la communauté" />;
}
