# API Integration

Structure professionnelle pour l'intégration de l'API Nox avec Fumadocs.

## Structure

```
src/lib/api/
├── config.ts           # Configuration de l'API
├── index.ts            # Point d'entrée principal
├── interface.ts        # Interface TypeScript pour l'API
├── provider.tsx        # Provider React pour le contexte API
├── types/
│   └── index.ts        # Types TypeScript
├── services/
│   ├── index.ts        # Export des services
│   ├── authService.ts  # Service d'authentification
│   └── userService.ts  # Service utilisateur
└── utils/
    └── index.ts        # Utilitaires (fetchApi, isError, etc.)
```

## Usage

### Dans votre application

Le provider est déjà intégré dans [src/app/layout.tsx](../../../app/layout.tsx):

```tsx
import { ApiProvider } from '@/lib/api';

export default function Layout({ children }) {
  return (
    <RootProvider>
      <ApiProvider>
        {children}
      </ApiProvider>
    </RootProvider>
  );
}
```

### Dans vos composants

```tsx
'use client';

import { useApi } from '@/lib/api';

export function MyComponent() {
  const api = useApi();

  useEffect(() => {
    async function loadUser() {
      const user = await api.fetchCurrentUser();
      if (!api.isError(user)) {
        console.log('Current user:', user);
      }
    }
    loadUser();
  }, []);

  return <div>...</div>;
}
```

## Services disponibles

### AuthService
- `login(identifier, password, factor_code?, onVerificationRequired?)`
- `logout()`
- `register(data)`

### UserService
- `fetchCurrentUser()`
- `fetchUser(id, server?)`
- `getOrFetchUser(id, server?)`
- `updateUser(data, onVerificationRequired?)`
- `uploadUserThumbnail(file)`
- `uploadUserBanner(file)`

## Types

Tous les types sont exportés depuis `@/lib/api`:
- `User`
- `UserMe`
- `ApiError`
- `RegisterForm`
- `UpdateUser`
- etc.

## Configuration

Variables d'environnement dans `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Extension

Pour ajouter un nouveau service:

1. Créer le fichier dans `services/` (ex: `messageService.ts`)
2. Exporter depuis `services/index.ts`
3. Ajouter les méthodes dans `interface.ts`
4. Initialiser le service dans `provider.tsx`
5. Ajouter les méthodes au contexte
