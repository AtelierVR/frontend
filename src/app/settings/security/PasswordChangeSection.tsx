import { useState } from 'react';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { useApi, isError } from '@/lib/api';
import { Icon } from '@iconify/react';
import { VerificationModal } from '@/components/verification-modal';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useVerificationModal } from '@/lib/hooks/useVerificationModal';

interface PasswordChangeSectionProps {
  setError: (error: string | undefined) => void;
  setSuccess: (success: string | undefined) => void;
}

export default function PasswordChangeSection({
  setError,
  setSuccess,
}: PasswordChangeSectionProps) {
  const { t } = useTranslation();
  const Api = useApi();
  const [showDialog, setShowDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    showVerificationModal,
    verificationMethods,
    verificationResolveRef,
    handleVerificationRequired,
    handleVerificationClose,
    setShowVerificationModal,
  } = useVerificationModal(() => {
    setIsLoading(false);
  });

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) resetForm();
    setShowDialog(open);
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
        setSuccess(t('settings.security.password.changed_success'));
        resetForm();
        setShowDialog(false);
        verificationResolveRef.current?.(code);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.security.password.failed'));
      verificationResolveRef.current?.(null);
    } finally {
      verificationResolveRef.current = null;
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!Api) return;

    if (newPassword !== confirmPassword) {
      setError(t('settings.security.password.mismatch'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('settings.security.password.too_short'));
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
        setSuccess(t('settings.security.password.changed_success'));
        resetForm();
        setShowDialog(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.security.password.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section id="password">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">{t('settings.security.password.title')}</h2>
          <p className="text-sm text-fd-muted-foreground">
            {t('settings.security.password.description')}
          </p>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDialog(true)}
            >
              <Icon icon="material-symbols:lock-reset-rounded" className="mr-2 size-4" />
              {t('settings.security.password.change_button')}
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('settings.security.password.dialog_title')}</DialogTitle>
            <DialogDescription>
              {t('settings.security.password.dialog_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="relative">
              <InputGroup>
                <InputGroupInput
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('settings.security.password.current_password_placeholder')}
                />
              </InputGroup>
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-fd-muted-foreground hover:text-fd-foreground"
              >
                {showCurrentPassword
                  ? <Icon icon="material-symbols:visibility-off-rounded" className="size-4" />
                  : <Icon icon="material-symbols:visibility-rounded" className="size-4" />}
              </button>
            </div>

            <div className="relative">
              <InputGroup>
                <InputGroupInput
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('settings.security.password.new_password_placeholder')}
                />
              </InputGroup>
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-fd-muted-foreground hover:text-fd-foreground"
              >
                {showNewPassword
                  ? <Icon icon="material-symbols:visibility-off-rounded" className="size-4" />
                  : <Icon icon="material-symbols:visibility-rounded" className="size-4" />}
              </button>
            </div>

            <div className="relative">
              <InputGroup>
                <InputGroupInput
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('settings.security.password.confirm_password_placeholder')}
                />
              </InputGroup>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-fd-muted-foreground hover:text-fd-foreground"
              >
                {showConfirmPassword
                  ? <Icon icon="material-symbols:visibility-off-rounded" className="size-4" />
                  : <Icon icon="material-symbols:visibility-rounded" className="size-4" />}
              </button>
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-red-500">{t('settings.security.password.mismatch')}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || isLoading}
                variant="primary"
              >
                {isLoading ? t('settings.security.password.changing') : t('settings.security.password.change_button')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleDialogClose(false)}
                disabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={handleVerificationClose}
        onSuccess={handleVerificationSuccess}
        methods={verificationMethods}
        title="Verify Password Change"
        username={Api?.currentUser?.username}
      />
    </>
  );
}
