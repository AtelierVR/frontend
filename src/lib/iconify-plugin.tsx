import type { LoaderConfig } from 'fumadocs-core/source';
import { Icon } from '@iconify/react';

/**
 * Custom Iconify plugin for Fumadocs
 * Replaces the lucide-icons plugin with Iconify Material Symbols (Rounded)
 */

// Icon mapping from common names to Iconify Material Symbols (Rounded)
const iconMap: Record<string, string> = {
  // Navigation & Actions
  'arrow-left': 'material-symbols:arrow-back-rounded',
  'arrow-right': 'material-symbols:arrow-forward-rounded',
  'arrow-up': 'material-symbols:arrow-upward-rounded',
  'arrow-down': 'material-symbols:arrow-downward-rounded',
  'chevron-left': 'material-symbols:chevron-left-rounded',
  'chevron-right': 'material-symbols:chevron-right-rounded',
  'chevron-down': 'material-symbols:keyboard-arrow-down-rounded',
  'chevron-up': 'material-symbols:keyboard-arrow-up-rounded',
  'menu': 'material-symbols:menu-rounded',
  'close': 'material-symbols:close-rounded',
  'x': 'material-symbols:close-rounded',
  
  // Common Icons
  'home': 'material-symbols:home-rounded',
  'search': 'material-symbols:search-rounded',
  'settings': 'material-symbols:settings-rounded',
  'user': 'material-symbols:person-rounded',
  'users': 'material-symbols:group-rounded',
  'info': 'material-symbols:info-rounded',
  'help': 'material-symbols:help-rounded',
  'question': 'material-symbols:help-rounded',
  
  // Status
  'check': 'material-symbols:check-rounded',
  'check-circle': 'material-symbols:check-circle-rounded',
  'alert-circle': 'material-symbols:error-circle-rounded',
  'alert-triangle': 'material-symbols:warning-rounded',
  'error': 'material-symbols:error-circle-rounded',
  'warning': 'material-symbols:warning-rounded',
  
  // Files & Documents
  'file': 'material-symbols:description-rounded',
  'file-text': 'material-symbols:description-rounded',
  'folder': 'material-symbols:folder-rounded',
  'book': 'material-symbols:book-rounded',
  'bookmark': 'material-symbols:bookmark-rounded',
  
  // Edit & Create
  'edit': 'material-symbols:edit-rounded',
  'pencil': 'material-symbols:edit-rounded',
  'plus': 'material-symbols:add-rounded',
  'minus': 'material-symbols:remove-rounded',
  'trash': 'material-symbols:delete-rounded',
  'copy': 'material-symbols:content-copy-rounded',
  
  // Communication
  'mail': 'material-symbols:mail-rounded',
  'message': 'material-symbols:message-rounded',
  'send': 'material-symbols:send-rounded',
  
  // Media
  'image': 'material-symbols:image-rounded',
  'video': 'material-symbols:videocam-rounded',
  'music': 'material-symbols:music-note-rounded',
  
  // Technical
  'code': 'material-symbols:code-rounded',
  'terminal': 'material-symbols:terminal-rounded',
  'server': 'material-symbols:dns-rounded',
  'database': 'material-symbols:database-rounded',
  'box': 'material-symbols:deployed-code-rounded',
  
  // UI
  'link': 'material-symbols:link-rounded',
  'external-link': 'material-symbols:open-in-new-rounded',
  'download': 'material-symbols:download-rounded',
  'upload': 'material-symbols:upload-rounded',
  'share': 'material-symbols:share-rounded',
  'eye': 'material-symbols:visibility-rounded',
  'eye-off': 'material-symbols:visibility-off-rounded',
  
  // Security
  'lock': 'material-symbols:lock-rounded',
  'unlock': 'material-symbols:lock-open-rounded',
  'shield': 'material-symbols:shield-rounded',
  'key': 'material-symbols:key-rounded',
  
  // Time
  'clock': 'material-symbols:schedule-rounded',
  'calendar': 'material-symbols:calendar-today-rounded',
  
  // Others
  'globe': 'material-symbols:public-rounded',
  'star': 'material-symbols:star-rounded',
  'heart': 'material-symbols:favorite-rounded',
  'tag': 'material-symbols:label-rounded',
  'refresh': 'material-symbols:refresh-rounded',
  'power': 'material-symbols:power-settings-new-rounded',
  'sun': 'material-symbols:light-mode-rounded',
  'moon': 'material-symbols:dark-mode-rounded',
};

/**
 * Iconify plugin for Fumadocs
 * Converts icon strings to Iconify Icon components
 */
export function iconifyPlugin() {
  return {
    name: 'iconify-icons',
    async transform({ source }: { source: any }) {
      // Process icon fields in frontmatter
      if (source.data && typeof source.data === 'object') {
        const data = source.data as Record<string, unknown>;
        
        // Handle icon field
        if (typeof data.icon === 'string') {
          const iconName = data.icon.toLowerCase();
          const iconifyIcon = iconMap[iconName] || `material-symbols:${iconName}-rounded`;
          data.icon = <Icon icon={iconifyIcon} />;
        }
        
        // Handle icons array
        if (Array.isArray(data.icons)) {
          data.icons = data.icons.map((icon: unknown) => {
            if (typeof icon === 'string') {
              const iconName = icon.toLowerCase();
              const iconifyIcon = iconMap[iconName] || `material-symbols:${iconName}-rounded`;
              return <Icon icon={iconifyIcon} />;
            }
            return icon;
          });
        }
      }
      
      return source;
    },
  };
}

/**
 * Helper function to get Iconify icon name from common name
 */
export function getIconifyName(iconName: string): string {
  const normalized = iconName.toLowerCase();
  return iconMap[normalized] || `material-symbols:${normalized}-rounded`;
}

/**
 * Helper component to render an icon by name
 */
export function IconifyIcon({ 
  name, 
  className 
}: { 
  name: string; 
  className?: string;
}) {
  const iconName = getIconifyName(name);
  return <Icon icon={iconName} className={className} />;
}
