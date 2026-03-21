import MarkdownPage from '../_components/MarkdownPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Conditions générales d'utilisation",
    description: "Les conditions régissant l'utilisation de la plateforme et de ses services.",
};

export default function TermsPage() {
    return <MarkdownPage src="/api/terms.md" fallbackTitle="Conditions générales d'utilisation" />;
}
