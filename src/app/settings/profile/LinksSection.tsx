'use client';

import { CurrentUser, UserLink } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@iconify/react';
import { useState } from 'react';

interface LinksSectionProps {
  links: UserLink[] | undefined;
  currentUser: CurrentUser | null;
  linksFlag: number;
  canSaveFlag: number;
  onLinksChange: (value: UserLink[]) => void;
  onFlagChange: (flag: number) => void;
}

export default function LinksSection({
  links,
  currentUser,
  linksFlag,
  canSaveFlag,
  onLinksChange,
  onFlagChange,
}: LinksSectionProps) {
  const currentLinks = links !== undefined ? links : (currentUser?.links || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleChange = (index: number, field: 'label' | 'value', value: string) => {
    const updatedLinks = [...currentLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    onLinksChange(updatedLinks);
    onFlagChange(linksFlag | canSaveFlag);
  };

  const handleDelete = (index: number) => {
    const updatedLinks = [...currentLinks];
    updatedLinks.splice(index, 1);
    onLinksChange(updatedLinks);
    onFlagChange(linksFlag | canSaveFlag);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleAdd = () => {
    const updatedLinks = [...currentLinks, { label: '', value: 'https://' }];
    onLinksChange(updatedLinks);
    onFlagChange(linksFlag | canSaveFlag);
    setEditingIndex(updatedLinks.length - 1);
  };

  return (
    <section id="links">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Links</h2>
          <p className="text-sm text-fd-muted-foreground">
            Add links to your social media accounts, websites, or anything else you want to share.
          </p>
        </div>

        {/* Current Links Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Your Links</h3>
          <div className="space-y-2">
            {currentLinks.length > 0 ? (
              currentLinks.map((link, index) => (
                <div key={index}>
                  {editingIndex === index ? (
                    <div className="flex flex-col gap-2 p-3 rounded-lg border bg-fd-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-fd-muted-foreground w-12 flex-shrink-0">
                          Label:
                        </label>
                        <Input
                          type="text"
                          value={link.label}
                          onChange={(e) => handleChange(index, 'label', e.target.value)}
                          placeholder="e.g., Website, GitHub, Twitter..."
                          className="flex-1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-fd-muted-foreground w-12 flex-shrink-0">
                          URL:
                        </label>
                        <Input
                          type="url"
                          value={link.value}
                          onChange={(e) => handleChange(index, 'value', e.target.value)}
                          placeholder="https://example.com"
                          className="flex-1"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingIndex(null)}
                        >
                          Done
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(index)}
                          className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        >
                          <Icon icon="material-symbols:delete-rounded" className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 rounded-lg border bg-fd-card hover:bg-fd-muted/50 transition-colors">
                      <Icon icon="material-symbols:link-rounded" className="size-4 text-fd-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {link.label || 'Untitled'}
                        </div>
                        <div className="text-xs text-fd-muted-foreground truncate">
                          {link.value}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingIndex(index)}
                        className="flex-shrink-0"
                      >
                        <Icon icon="material-symbols:edit-rounded" className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-fd-muted-foreground">No links added</p>
            )}
          </div>
        </div>

        {/* Add Link Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="gap-2"
          >
            <Icon icon="material-symbols:add-rounded" className="h-4 w-4" />
            Add Link
          </Button>
        </div>

        <p className="text-xs text-fd-muted-foreground">
          Make sure to include the full URL with the protocol (http:// or https://).
        </p>
      </div>
    </section>
  );
}
