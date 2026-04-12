import { useState, useRef } from 'react';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Button } from '@/components/ui/button';
import { CurrentUser } from '@/lib/api/types';
import { CheckCircle, XCircle, Mail, Loader2, Trash2, Plus, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useApi, isError } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';
import { VerificationModal } from '@/components/verification-modal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useVerificationModal } from '@/lib/hooks/useVerificationModal';

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
  const { t } = useTranslation();
  const Api = useApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isDeletingEmail, setIsDeletingEmail] = useState(false);
  const {
    showVerificationModal,
    verificationMethods,
    verificationResolveRef,
    handleVerificationRequired,
    setShowVerificationModal,
  } = useVerificationModal();
  // undefined = no pending action, null = delete pending, string = save with this email
  const pendingEmailRef = useRef<string | null | undefined>(undefined);

  const handleVerificationClose = () => {
    setShowVerificationModal(false);
    verificationResolveRef.current?.(null);
    verificationResolveRef.current = null;
    pendingEmailRef.current = undefined;
  };

  const hasEmail = !!currentUser?.email;
  const isEmailVerified = currentUser?.email_verified || false;

  const handleVerificationSuccess = async (code: string) => {
    setShowVerificationModal(false);
    const pending = pendingEmailRef.current;
    if (pending === undefined) return;

    if (pending !== null) {
      setIsSavingEmail(true);
      try {
        const res = await Api!.updateUser({ email: pending }, code);
        if (isError(res)) {
          setError(res.message);
          verificationResolveRef.current?.(null);
        } else {
          setSuccess(t('settings.security.email.updated_success'));
          setIsModalOpen(false);
          onEmailChange('');
          onConfirmEmailChange('');
          verificationResolveRef.current?.(code);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('settings.security.email.failed_update'));
        verificationResolveRef.current?.(null);
      } finally {
        verificationResolveRef.current = null;
        pendingEmailRef.current = undefined;
        setIsSavingEmail(false);
      }
    } else {
      setIsDeletingEmail(true);
      try {
        const res = await Api!.updateUser({ email: null }, code);
        if (isError(res)) {
          setError(res.message);
          verificationResolveRef.current?.(null);
        } else {
          setSuccess(t('settings.security.email.removed_success'));
          verificationResolveRef.current?.(code);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('settings.security.email.failed_remove'));
        verificationResolveRef.current?.(null);
      } finally {
        verificationResolveRef.current = null;
        pendingEmailRef.current = undefined;
        setIsDeletingEmail(false);
      }
    }
  };

  const handleSaveEmail = async () => {
    if (!Api || isSavingEmail || !email || email !== confirmEmail) return;

    setIsSavingEmail(true);
    pendingEmailRef.current = email;

    try {
      const res = await Api.updateUser({ email }, undefined, handleVerificationRequired);

      if (isError(res)) {
        setError(res.message);
      } else {
        setSuccess(t('settings.security.email.updated_success'));
        setIsModalOpen(false);
        onEmailChange('');
        onConfirmEmailChange('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.security.email.failed_update'));
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
      const res = await Api.resendEmailVerification();
      if (isError(res)) {
        setError(res.message);
      } else {
        setSuccess(t('settings.security.email.verification_sent'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.security.email.failed_send_verification'));
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleDeleteEmail = async () => {
    if (!Api || isDeletingEmail) return;

    setIsDeletingEmail(true);
    setError(undefined);
    setSuccess(undefined);
    pendingEmailRef.current = null;

    try {
      const res = await Api.updateUser({ email: null }, undefined, handleVerificationRequired);
      if (isError(res)) {
        setError(res.message);
      } else {
        setSuccess(t('settings.security.email.removed_success'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.security.email.failed_remove'));
    } finally {
      setIsDeletingEmail(false);
    }
  };

  const handleOpenModal = () => {
    onEmailChange('');
    onConfirmEmailChange('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onEmailChange('');
    onConfirmEmailChange('');
  };

  return (
    <>
      <section id="email">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('settings.security.email.title')}</h2>
          {hasEmail && (
            <Badge variant={isEmailVerified ? "default" : "secondary"}>
              {isEmailVerified ? (
                <>
                  <CheckCircle className="mr-1 size-3" />
                  {t('settings.security.email.verified')}
                </>
              ) : (
                <>
                  <XCircle className="mr-1 size-3" />
                  {t('settings.security.email.unverified')}
                </>
              )}
            </Badge>
          )}
        </div>

        <p className="text-sm text-fd-muted-foreground">
          {hasEmail ? (
            <>
              {t('settings.security.email.current_email')} <span className="font-medium">{currentUser?.email}</span>
              <br />
              {isEmailVerified
                ? t('settings.security.email.verified_description')
                : t('settings.security.email.unverified_description')}
            </>
          ) : (
            t('settings.security.email.no_email_description')
          )}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenModal}
          >
            {hasEmail ? (
              <>
                <Pencil className="mr-2 size-4" />
                {t('settings.security.email.change_email')}
              </>
            ) : (
              <>
                <Plus className="mr-2 size-4" />
                {t('settings.security.email.add_email')}
              </>
            )}
          </Button>

          {hasEmail && !isEmailVerified && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendVerification}
              disabled={isSendingVerification}
            >
              <Mail className="mr-2 size-4" />
              {isSendingVerification ? t('settings.security.email.sending') : t('settings.security.email.send_verification')}
            </Button>
          )}

          {hasEmail && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteEmail}
              disabled={isDeletingEmail}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              {isDeletingEmail ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
              {isDeletingEmail ? t('settings.security.email.removing') : t('settings.security.email.remove_email')}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) handleCloseModal(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{hasEmail ? t('settings.security.email.change_email_title') : t('settings.security.email.add_email_title')}</DialogTitle>
            <DialogDescription>
              {hasEmail
                ? t('settings.security.email.change_email_desc')
                : t('settings.security.email.add_email_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <InputGroup>
              <InputGroupInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  onEmailChange(e.target.value);
                  onFlagChange(emailFlag | canSaveFlag);
                }}
                placeholder={t('settings.security.email.new_email_placeholder')}
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
                placeholder={t('settings.security.email.confirm_email_placeholder')}
              />
            </InputGroup>

            {email !== confirmEmail && confirmEmail.length > 0 && (
              <p className="text-sm text-red-500">{t('settings.security.email.emails_mismatch')}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveEmail}
              disabled={isSavingEmail || !email || email !== confirmEmail}
            >
              {isSavingEmail ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t('settings.security.email.saving_email')}
                </>
              ) : (
                hasEmail ? t('settings.security.email.update_email') : t('settings.security.email.add_email')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={handleVerificationClose}
        onSuccess={handleVerificationSuccess}
        methods={verificationMethods}
      />
    </>
  );
}


