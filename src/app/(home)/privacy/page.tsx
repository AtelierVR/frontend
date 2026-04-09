import MarkdownPage from '../_components/MarkdownPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Politique de confidentialité',
    description: 'Comment nous collectons, traitons et protégeons vos données personnelles.',
};

export default function PrivacyPage() {
    return <MarkdownPage src={"/api/privacy.md"} fallbackTitle="Politique de confidentialité" />;
}
