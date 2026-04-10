import PrivacyPageClient from './_client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Politique de confidentialité',
    description: 'Comment nous collectons, traitons et protégeons vos données personnelles.',
};

export default function PrivacyPage() {
    return <PrivacyPageClient />;
}
