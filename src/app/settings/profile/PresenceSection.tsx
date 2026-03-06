import { ButtonGroup } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { PresenceIcon, PRESENCE_CONFIG, type PresenceStatus } from '@/components/ui/presence-icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { CurrentUser } from '@/lib/api/types';

interface PresenceSectionProps {
  presence: PresenceStatus | undefined;
  presenceStatus: string | undefined;
  currentUser: CurrentUser | null;
  presenceFlag: number;
  statusFlag: number;
  canSaveFlag: number;
  onPresenceChange: (status: PresenceStatus) => void;
  onStatusChange: (value: string) => void;
  onFlagChange: (flag: number) => void;
}

const presenceOptions: PresenceStatus[] = ['oja', 'ojf', 'online', 'busy', 'dnd', 'stream', 'offline'];

export default function PresenceSection({
  presence,
  presenceStatus,
  currentUser,
  presenceFlag,
  statusFlag,
  canSaveFlag,
  onPresenceChange,
  onStatusChange,
  onFlagChange,
}: PresenceSectionProps) {
  const currentPresence = presence ?? currentUser?.presence?.status ?? 'offline';
  const currentStatus = presenceStatus ?? currentUser?.presence?.text ?? '';
  const isOffline = currentPresence === 'offline';

  return (
    <section id="presence">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Presence</h2>
        <p className="text-sm text-fd-muted-foreground">
          Choose your presence status and set a custom status message.
        </p>
        <ButtonGroup className="w-full">
          <Select value={currentPresence} onValueChange={(value) => {
            onPresenceChange(value as PresenceStatus);
            onFlagChange(presenceFlag | canSaveFlag);
          }}>
            <SelectTrigger className="w-fit">
              <PresenceIcon status={currentPresence} size={20} />
            </SelectTrigger>
            <SelectContent position="popper" side="bottom" align="start">
              {presenceOptions.map((status) => {
                const config = PRESENCE_CONFIG[status];
                return (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2.5">
                      <PresenceIcon status={status} size={16} />
                      <div className="flex flex-col">
                        <span className="font-medium">{config.label}</span>
                        <span className="text-xs text-fd-muted-foreground">
                          {config.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Input
            placeholder={isOffline ? "Status hidden when offline" : "What are you up to?"}
            value={currentStatus}
            onChange={(e) => {
              onStatusChange(e.target.value.slice(0, 128));
              onFlagChange(statusFlag | canSaveFlag);
            }}
            maxLength={128}
            disabled={isOffline}
            className="flex-1"
          />
        </ButtonGroup>
        <p className="text-xs text-fd-muted-foreground">
          {currentStatus.length}/128 characters
          {isOffline && ' • Custom status is hidden when offline'}
        </p>
      </div>
    </section>
  );
}
