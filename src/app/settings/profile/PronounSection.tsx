import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { CurrentUser } from '@/lib/api/types';

interface PronounSectionProps {
  pronoun: string | null | undefined;
  currentUser: CurrentUser | null;
  pronounFlag: number;
  canSaveFlag: number;
  onPronounChange: (value: string) => void;
  onFlagChange: (flag: number) => void;
}

export default function PronounSection({
  pronoun,
  currentUser,
  pronounFlag,
  canSaveFlag,
  onPronounChange,
  onFlagChange,
}: PronounSectionProps) {
  return (
    <section id="pronoun">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Pronoun</h2>
        <p className="text-sm text-fd-muted-foreground">
          Your pronoun helps others know how to refer to you.
        </p>
        <InputGroup>
          <InputGroupInput
            id="pronoun"
            value={pronoun === undefined ? (currentUser?.pronoun ?? '') : (pronoun ?? '')}
            onChange={(e) => {
              onPronounChange(e.target.value);
              onFlagChange(pronounFlag | canSaveFlag);
            }}
            placeholder={currentUser?.pronoun || "e.g., they/them, she/her, he/him"}
          />
        </InputGroup>
      </div>
    </section>
  );
}
