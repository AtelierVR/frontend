import { useState } from 'react';
import { CurrentUser } from '@/lib/api/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { TAG_EDIT_REGEX } from './page';

interface TagsSectionProps {
  tags: string[] | null | undefined;
  currentUser: CurrentUser | null;
  tagsFlag: number;
  canSaveFlag: number;
  onTagsChange: (tags: string[]) => void;
  onFlagChange: (flag: number) => void;
}

export default function TagsSection({
  tags,
  currentUser,
  tagsFlag,
  canSaveFlag,
  onTagsChange,
  onFlagChange,
}: TagsSectionProps) {
  const currentTags = tags !== undefined ? tags : (currentUser?.tags || []);

  const handleAddTag = () => {
    const newTag = 'usr:';
    const updatedTags = [...(currentTags || []), newTag];
    onTagsChange(updatedTags);
    onFlagChange(tagsFlag | canSaveFlag);
  };

  const handleChangeTag = (index: number, value: string) => {
    if (!TAG_EDIT_REGEX.test(value)) return;
    const updatedTags = [...(currentTags || [])];
    updatedTags[index] = value;
    onTagsChange(updatedTags);
    onFlagChange(tagsFlag | canSaveFlag);
  };

  const handleRemoveTag = (index: number) => {
    // Only allow removing user tags
    if (!currentTags || !TAG_EDIT_REGEX.test(currentTags[index])) return;

    const updatedTags = currentTags.filter((_, i) => i !== index);
    onTagsChange(updatedTags);
    onFlagChange(tagsFlag | canSaveFlag);
  };

  const isTagEditable = (tag: string) => TAG_EDIT_REGEX.test(tag);

  return (
    <section id="tags">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Tags</h2>
        <p className="text-sm text-fd-muted-foreground">
          Tags help categorize your profile.
          <br />
          Use the format snake case (like <code className="px-1 py-0.5 rounded bg-fd-muted text-xs">usr:tag_name</code>) to create custom tags.
          <br />
          System tags (without <code className="px-1 py-0.5 rounded bg-fd-muted">usr:</code> prefix) cannot be edited.
        </p>
        <p className="text-xs text-fd-muted-foreground pt-1">
        </p>

        <div className="space-y-2 pt-2">
          {(!currentTags || currentTags.length === 0) && (
            <div className="text-sm text-fd-muted-foreground text-center py-4 border border-dashed border-fd-border rounded-lg">
              No tags
            </div>
          )}

          <div className="border border-fd-border rounded-lg overflow-hidden divide-y divide-fd-border">
            {currentTags?.map((tag, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-fd-card hover:bg-fd-muted/50 transition-colors"
              >
                <Input
                  value={tag}
                  onChange={(e) => handleChangeTag(index, e.target.value)}
                  disabled={!isTagEditable(tag)}
                  className="flex-1 h-7 border-0 bg-transparent focus-visible:ring-0 disabled:opacity-70 px-0 text-sm"
                />
                {isTagEditable(tag) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTag(index)}
                    className="h-6 w-6 p-0 hover:bg-fd-muted"
                  >
                    <Icon icon="material-symbols:close-rounded" className="size-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center pt-2">
            <Button
              onClick={handleAddTag}
              variant="ghost"
              size="sm"
              className="w-3/4 h-8 hover:bg-fd-muted"
            >
              <Icon icon="material-symbols:add-rounded" className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
