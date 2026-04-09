import type { Root } from 'fumadocs-core/page-tree';
import { Icon } from '@iconify/react';
import type { CurrentUser } from '@/lib/api';
import type { TFunction } from 'i18next';

export const getPageTree = (currentUser: CurrentUser | null, t: TFunction): Root => {
  const isAdmin = currentUser?.tags?.includes('sys:admin') ?? false;

  return {
    name: t('settings.nav.root'),
    children: [
      {
        type: 'separator',
        name: t('settings.nav.separator_general'),
      },
      {
        type: 'page',
        name: t('settings.nav.profile'),
        url: '/settings/profile',
        icon: <Icon icon="material-symbols:person-rounded" />,
      },
      {
        type: 'page',
        name: t('settings.nav.account'),
        url: '/settings/account',
        icon: <Icon icon="material-symbols:manage-accounts-rounded" />,
      },
      {
        type: 'folder',
        name: t('settings.nav.follow'),
        icon: <Icon icon="material-symbols:group-rounded" />,
        index: {
          type: 'page',
          url: '/settings/follow',
          name: t('settings.nav.follow_overview'),
          icon: <Icon icon="material-symbols:settings-rounded" />,
        },
        children: [
          {
            type: 'page',
            name: t('settings.nav.follow_followers'),
            url: '/settings/follow/followers',
            icon: <Icon icon="material-symbols:person-add-rounded" />,
          },
          {
            type: 'page',
            name: t('settings.nav.follow_followings'),
            url: '/settings/follow/followings',
            icon: <Icon icon="material-symbols:how-to-reg-rounded" />,
          }
        ],
      },
      {
        type: 'separator',
        name: t('settings.nav.separator_access'),
      },
      {
        type: 'page',
        name: 'Tables',
        url: '/settings/tables',
        icon: <Icon icon="material-symbols:table-rows-rounded" />,
      },
      {
        type: 'page',
        name: t('settings.nav.security'),
        url: '/settings/security',
        icon: <Icon icon="material-symbols:shield-rounded" />,
      },
      {
        type: 'page',
        name: t('settings.nav.sessions'),
        url: '/settings/sessions',
        icon: <Icon icon="material-symbols:desktop-windows-rounded" />,
      },

      ...(isAdmin ? [{
        type: 'separator',
        name: t('settings.nav.separator_admin'),
      },
      {
        type: 'page',
        name: t('settings.nav.relays'),
        url: '/settings/relays',
        icon: <Icon icon="material-symbols:dns" />,
      },
      {
        type: 'page',
        name: t('settings.nav.logs'),
        url: '/settings/logs',
        icon: <Icon icon="material-symbols:list-alt-rounded" />,
      },
      {
        type: 'page',
        name: t('settings.nav.configs'),
        url: '/settings/configs',
        icon: <Icon icon="material-symbols:tune-rounded" />,
      }] as any : [])
    ]
  };
}
