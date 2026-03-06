import { type RefObject, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@iconify/react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  inputRef?: RefObject<HTMLInputElement>;
}

export function MessageInput({
  value,
  onChange,
  onSubmit,
  inputRef
}: MessageInputProps) {
  return (
    <div className="sticky bottom-0 z-10">
      <form onSubmit={onSubmit} className="flex items-end gap-3 py-4 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Tapez votre message..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="py-6 resize-none rounded-2xl border-fd-border bg-fd-secondary focus-visible:ring-fd-ring"
            autoFocus
          />
          <Button 
            type="submit" 
            disabled={!value.trim()}
            size="icon"
            className="absolute right-2 bottom-2 rounded-full size-9"
          >
            <Icon icon="material-symbols:send-rounded" className="size-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
