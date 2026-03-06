import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText } from '@/components/ui/input-group';
import { CurrentUser } from '@/lib/api/types';

interface UsernameSectionProps {
  username: string | undefined;
  currentUser: CurrentUser | null;
  usernameFlag: number;
  canSaveFlag: number;
  onUsernameChange: (value: string) => void;
  onFlagChange: (flag: number) => void;
}

export default function UsernameSection({
  username,
  currentUser,
  usernameFlag,
  canSaveFlag,
  onUsernameChange,
  onFlagChange,
}: UsernameSectionProps) {
  const currentServer = currentUser?.server || 'unknown';

  return (
    <section id="username">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Username</h2>
        <p className="text-sm text-fd-muted-foreground">
          Your username is your unique identifier on the platform.
          <br />
          It is used to log in and is visible to others.
        </p>
        <InputGroup>
          <InputGroupInput
            id="username"
            value={username === undefined ? (currentUser?.username || '') : username}
            onChange={(e) => {
              onUsernameChange(e.target.value);
              onFlagChange(usernameFlag | canSaveFlag);
            }}
            placeholder={currentUser?.username || "Username"}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>@{currentServer}</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </section>
  );
}
