import type { Root } from 'fumadocs-core/page-tree';
import { Icon } from '@iconify/react';
import type { CurrentUser } from '@/lib/api';

export const getPageTree = (currentUser: CurrentUser | null): Root => {
  const isAdmin = currentUser?.tags?.includes('sys:admin') ?? false;

  return {
    name: 'Settings',
    children: [
      {
        type: 'separator',
        name: 'General',
      },
      {
        type: 'page',
        name: 'Public Profile',
        url: '/settings/profile',
        icon: <Icon icon="material-symbols:person-rounded" />,
      },
      {
        type: 'page',
        name: 'Account',
        url: '/settings/account',
        icon: <Icon icon="material-symbols:manage-accounts-rounded" />,
      },
      {
        type: 'folder',
        name: 'Follow',
        icon: <Icon icon="material-symbols:group-rounded" />,
        index: {
          type: 'page',
          url: '/settings/follow',
          name: 'Overview',
          icon: <Icon icon="material-symbols:settings-rounded" />,
        },
        children: [
          {
            type: 'page',
            name: 'Followers',
            url: '/settings/follow/followers',
            icon: <Icon icon="material-symbols:person-add-rounded" />,
          },
          {
            type: 'page',
            name: 'Followings',
            url: '/settings/follow/followings',
            icon: <Icon icon="material-symbols:how-to-reg-rounded" />,
          }
        ],
      },
      {
        type: 'separator',
        name: 'Access',
      },
      {
        type: 'page',
        name: 'Security & Authentication',
        url: '/settings/security',
        icon: <Icon icon="material-symbols:shield-rounded" />,
      },
      {
        type: 'page',
        name: 'Sessions',
        url: '/settings/sessions',
        icon: <Icon icon="material-symbols:desktop-windows-rounded" />,
      },

      ...(isAdmin ? [{
        type: 'separator',
        name: 'Administration',
      },
      {
        type: 'page',
        name: 'Relays',
        url: '/settings/relays',
        icon: <Icon icon="material-symbols:dns" />,
      },
      {
        type: 'page',
        name: 'Logs',
        url: '/settings/logs',
        icon: <Icon icon="material-symbols:list-alt-rounded" />,
      },
      {
        type: 'page',
        name: 'Configuration',
        url: '/settings/configs',
        icon: <Icon icon="material-symbols:tune-rounded" />,
      }] as any : [])
    ]
  };
}
