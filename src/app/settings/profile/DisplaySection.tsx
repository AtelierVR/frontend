import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { CurrentUser } from '@/lib/api/types';

interface DisplaySectionProps {
  display: string | undefined;
  currentUser: CurrentUser | null;
  displayFlag: number;
  canSaveFlag: number;
  onDisplayChange: (value: string) => void;
  onFlagChange: (flag: number) => void;
}

export default function DisplaySection({
  display,
  currentUser,
  displayFlag,
  canSaveFlag,
  onDisplayChange,
  onFlagChange,
}: DisplaySectionProps) {
  return (
    <section id="basic-information">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Display</h2>
        <p className="text-sm text-fd-muted-foreground">
          Your display name is what others see when they visit your profile.
          <br />
          And in the Nameplate in the app.
        </p>
        <InputGroup>
          <InputGroupInput
            id="display"
            value={display === undefined ? (currentUser?.display || '') : display}
            onChange={(e) => {
              onDisplayChange(e.target.value);
              onFlagChange(displayFlag | canSaveFlag);
            }}
            placeholder={currentUser?.display || "Display name"}
          />
        </InputGroup>
      </div>
    </section>
  );
}
