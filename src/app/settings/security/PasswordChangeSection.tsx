import { useState, useRef } from 'react';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { useApi, isError } from '@/lib/api';
import type { VerificationMethod, ApiError } from '@/lib/api';
import { Icon } from '@iconify/react';
import { VerificationModal } from '@/components/verification-modal';

interface PasswordChangeSectionProps {
  setError: (error: string | undefined) => void;
  setSuccess: (success: string | undefined) => void;
}

export default function PasswordChangeSection({
  setError,
  setSuccess,
}: PasswordChangeSectionProps) {
  const Api = useApi();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationMethods, setVerificationMethods] = useState<VerificationMethod[]>([]);
  const verificationResolveRef = useRef<((code: string | null) => void) | null>(null);

  const handleVerificationRequired = async (error: ApiError, methods: VerificationMethod[]): Promise<string | null> => {
    setVerificationMethods(methods);
    setShowVerificationModal(true);
    setIsLoading(false);

    return new Promise((resolve) => {
      verificationResolveRef.current = resolve;
    });
  };

  const handleVerificationSuccess = async (code: string) => {
    setShowVerificationModal(false);
    setIsLoading(true);

    try {
      const res = await Api.updateUser({
        password: newPassword,
        current_password: currentPassword,
      }, code);

      if (isError(res)) {
        setError(res.message);
        verificationResolveRef.current?.(null);
      } else {
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        verificationResolveRef.current?.(code);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
      verificationResolveRef.current?.(null);
    } finally {
      verificationResolveRef.current = null;
      setIsLoading(false);
    }
  };

  const handleVerificationClose = () => {
    setShowVerificationModal(false);
    setIsLoading(false);
    verificationResolveRef.current?.(null);
    verificationResolveRef.current = null;
  };

  const handleChangePassword = async () => {
    if (!Api) return;

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      const res = await Api.updateUser({
        password: newPassword,
        current_password: currentPassword,
      }, undefined, handleVerificationRequired);

      if (isError(res)) {
        setError(res.message);
      } else {
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="password">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <p className="text-sm text-fd-muted-foreground">
          Update your password to keep your account secure.
          <br />
          Use a strong password with at least 8 characters.
        </p>

        <div className="space-y-3 pt-2 max-w-md">
          <div className="relative">
            <InputGroup>
              <InputGroupInput
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
              />
            </InputGroup>
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fd-muted-foreground hover:text-fd-foreground"
            >
              {showCurrentPassword ? <Icon icon="material-symbols:visibility-off-rounded" className="size-4" /> : <Icon icon="material-symbols:visibility-rounded" className="size-4" />}
            </button>
          </div>

          <div className="relative">
            <InputGroup>
              <InputGroupInput
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
              />
            </InputGroup>
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fd-muted-foreground hover:text-fd-foreground"
            >
              {showNewPassword ? <Icon icon="material-symbols:visibility-off-rounded" className="size-4" /> : <Icon icon="material-symbols:visibility-rounded" className="size-4" />}
            </button>
          </div>

          <div className="relative">
            <InputGroup>
              <InputGroupInput
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </InputGroup>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fd-muted-foreground hover:text-fd-foreground"
            >
              {showConfirmPassword ? <Icon icon="material-symbols:visibility-off-rounded" className="size-4" /> : <Icon icon="material-symbols:visibility-rounded" className="size-4" />}
            </button>
          </div>

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-sm text-red-500">Passwords do not match</p>
          )}

          <Button
            onClick={handleChangePassword}
            disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || isLoading}
            variant="primary"
          >
            {isLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </div>
      </div>

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={handleVerificationClose}
        onSuccess={handleVerificationSuccess}
        methods={verificationMethods}
        title="Verify Password Change"
        username={Api?.currentUser?.username}
      />
    </section>
  );
}
