# Structure & Scripts

## Route Structure

| Route | Description |
|---|---|
| `app/(home)/` | Landing page and public browse |
| `app/login/` | Login and register flows |
| `app/u/[id]/` | User profile (info, worlds, followers, following) |
| `app/w/[id]/` | World detail (description, versions, info, edit) |
| `app/settings/` | Account and profile settings |
| `app/messages/` | Direct messaging |
| `src/lib/api/` | Typed API client (interface, services, provider) |
| `src/components/` | Shared UI components (shadcn/ui + custom) |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run types:check` | TypeScript type check |
