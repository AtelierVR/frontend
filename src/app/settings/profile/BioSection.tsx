import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { CurrentUser } from '@/lib/api/types';

interface BioSectionProps {
  bio: string | null | undefined;
  currentUser: CurrentUser | null;
  bioFlag: number;
  canSaveFlag: number;
  onBioChange: (value: string) => void;
  onFlagChange: (flag: number) => void;
}

export default function BioSection({
  bio,
  currentUser,
  bioFlag,
  canSaveFlag,
  onBioChange,
  onFlagChange,
}: BioSectionProps) {
  return (
    <section>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Bio</h2>
        <p className="text-sm text-fd-muted-foreground">
          Your bio is a short description about yourself.
          <br />
          It appears on your profile page.
        </p>
        <InputGroup>
          <InputGroupTextarea
            id="bio"
            value={(bio === undefined ? currentUser?.bio : bio) || ''}
            onChange={(e) => {
              onBioChange(e.target.value);
              onFlagChange(bioFlag | canSaveFlag);
            }}
            placeholder={currentUser?.bio || "Tell us about yourself..."}
            rows={12}
            maxLength={500}
          />
          <InputGroupAddon align="block-end">
            <InputGroupText className="text-xs tabular-nums">
              {(bio === undefined ? currentUser?.bio : bio)?.length || 0}/500 characters
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </section>
  );
}
