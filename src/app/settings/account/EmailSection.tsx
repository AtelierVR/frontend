import { useState } from 'react';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { CurrentUser } from '@/lib/api/types';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useApi, isError } from '@/lib/api';

interface EmailSectionProps {
  email: string;
  confirmEmail: string;
  currentUser: CurrentUser | null;
  emailFlag: number;
  canSaveFlag: number;
  onEmailChange: (value: string) => void;
  onConfirmEmailChange: (value: string) => void;
  onFlagChange: (flag: number) => void;
  isLoading: boolean;
  setError: (error: string | undefined) => void;
  setSuccess: (success: string | undefined) => void;
}

export default function EmailSection({
  email,
  confirmEmail,
  currentUser,
  emailFlag,
  canSaveFlag,
  onEmailChange,
  onConfirmEmailChange,
  onFlagChange,
  isLoading,
  setError,
  setSuccess,
}: EmailSectionProps) {
  const Api = useApi();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  const hasEmail = !!currentUser?.email;
  const isEmailVerified = currentUser?.email_verified || false;

  const handleSaveEmail = async () => {
    if (!Api || isSavingEmail || !email || email !== confirmEmail) return;

    setIsSavingEmail(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      const res = await Api.updateUser({ email });
      
      if (isError(res)) {
        setError(res.message);
      } else {
        setSuccess('Email updated successfully!');
        setIsEditingEmail(false);
        onEmailChange('');
        onConfirmEmailChange('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleSendVerification = async () => {
    if (!Api || isSendingVerification) return;

    setIsSendingVerification(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      const res = await Api.sendVerificationCode('email');
      if (isError(res)) {
        setError(res.message);
      } else {
        setSuccess('Verification email sent! Please check your inbox.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setIsSendingVerification(false);
    }
  };

  return (
    <section id="email">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Email Address</h2>
          {hasEmail && (
            <Badge variant={isEmailVerified ? "default" : "secondary"}>
              {isEmailVerified ? (
                <>
                  <CheckCircle className="mr-1 size-3" />
                  Verified
                </>
              ) : (
                <>
                  <XCircle className="mr-1 size-3" />
                  Unverified
                </>
              )}
            </Badge>
          )}
        </div>

        <p className="text-sm text-fd-muted-foreground">
          {hasEmail ? (
            <>
              Current email: <span className="font-medium">{currentUser?.email}</span>
              <br />
              {isEmailVerified
                ? 'Your email address is verified. You can change it at any time.'
                : 'Please verify your email address to enable recovery and notifications.'}
            </>
          ) : (
            'Add an email address for account recovery and notifications.'
          )}
        </p>

        {!isEditingEmail && hasEmail && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingEmail(true)}
            >
              Change Email
            </Button>
            {!isEmailVerified && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendVerification}
                disabled={isSendingVerification}
              >
                <Mail className="mr-2 size-4" />
                {isSendingVerification ? 'Sending...' : 'Send Verification'}
              </Button>
            )}
          </div>
        )}

        {(isEditingEmail || !hasEmail) && (
          <div className="space-y-3 pt-2">
            <InputGroup>
              <InputGroupInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  onEmailChange(e.target.value);
                  onFlagChange(emailFlag | canSaveFlag);
                }}
                placeholder="new.email@example.com"
              />
            </InputGroup>

            <InputGroup>
              <InputGroupInput
                id="confirmEmail"
                type="email"
                value={confirmEmail}
                onChange={(e) => {
                  onConfirmEmailChange(e.target.value);
                  onFlagChange(emailFlag | canSaveFlag);
                }}
                placeholder="Confirm new email"
              />
            </InputGroup>

            {email !== confirmEmail && confirmEmail.length > 0 && (
              <p className="text-sm text-red-500">Emails do not match</p>
            )}

            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveEmail}
                disabled={isSavingEmail || !email || email !== confirmEmail}
              >
                {isSavingEmail ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Email'
                )}
              </Button>
              
              {isEditingEmail && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditingEmail(false);
                    onEmailChange('');
                    onConfirmEmailChange('');
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
