import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApi, isError } from '@/lib/api';
import { CurrentUser } from '@/lib/api/types';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';
import { VerificationModal } from '@/components/verification-modal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';
import { Loader2, Trash2 } from 'lucide-react';
import { useVerificationModal } from '@/lib/hooks/useVerificationModal';

interface TwoFactorAuthSectionProps {
  currentUser: CurrentUser | null;
  setError: (error: string | undefined) => void;
  setSuccess: (success: string | undefined) => void;
}

export default function TwoFactorAuthSection({
  currentUser,
  setError,
  setSuccess,
}: TwoFactorAuthSectionProps) {
  const { t } = useTranslation();
  const Api = useApi();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
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

  useEffect(() => {
    if (currentUser) {
      setTwoFactorEnabled(currentUser.twofa_enabled || false);
    }
  }, [currentUser]);

  const handleEnable2FA = async () => {
    if (!Api) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const res = await Api.setupTotp();
      if (isError(res)) {
        setError(res.message);
      } else {
        setQrCode(res.qrCodeUrl);
        setSecret(res.secret);
        setShowSetupDialog(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.security.two_factor.failed_setup'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!Api || !verificationCode) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const res = await Api.enableTotp(secret, verificationCode);
      if (isError(res)) {
        setError(res.message);
      } else {
        setSuccess(t('settings.security.two_factor.enabled_success'));
        setTwoFactorEnabled(true);
        setShowSetupDialog(false);
        setVerificationCode('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.security.two_factor.failed_enable'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSuccess = async (code: string) => {
    setShowVerificationModal(false);
    setIsLoading(true);
    try {
      const res = await Api!.disableTotp(code);
      if (isError(res)) {
        setError(res.message);
        verificationResolveRef.current?.(null);
      } else {
        setSuccess(t('settings.security.two_factor.disabled_success'));
        setTwoFactorEnabled(false);
        verificationResolveRef.current?.(code);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.security.two_factor.failed_disable'));
      verificationResolveRef.current?.(null);
    } finally {
      verificationResolveRef.current = null;
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!Api) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const res = await Api.disableTotp(undefined, handleVerificationRequired);
      if (isError(res)) {
        setError(res.message);
      } else {
        setSuccess(t('settings.security.two_factor.disabled_success'));
        setTwoFactorEnabled(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.security.two_factor.failed_disable'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section id="2fa">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('settings.security.two_factor.title')}</h2>
            <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
              {twoFactorEnabled ? (
                <>
                  <Icon icon="material-symbols:shield-rounded" className="mr-1 size-3" />
                  {t('settings.security.two_factor.enabled')}
                </>
              ) : (
                <>
                  <Icon icon="material-symbols:shield-rounded" className="mr-1 size-3" />
                  {t('settings.security.two_factor.disabled')}
                </>
              )}
            </Badge>
          </div>

          <p className="text-sm text-fd-muted-foreground">
            {twoFactorEnabled
              ? t('settings.security.two_factor.enabled_description')
              : t('settings.security.two_factor.disabled_description')}
          </p>

          <div className="pt-2">
            {twoFactorEnabled ? (
              <Button
                onClick={handleDisable2FA}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
              {isLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 size-4" />
              )}
                {isLoading ? t('settings.security.two_factor.disabling') : t('settings.security.two_factor.disable')}
              </Button>
            ) : (
              <Button
                onClick={handleEnable2FA}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <Icon icon="material-symbols:shield-rounded" className="mr-2 size-4" />
                {isLoading ? t('settings.security.two_factor.setting_up') : t('settings.security.two_factor.enable')}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* 2FA Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-lg md:max-w-xl transition-all duration-200">
          <DialogHeader>
            <DialogTitle>{t('settings.security.two_factor.setup_title')}</DialogTitle>
            <DialogDescription>
              {t('settings.security.two_factor.setup_description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {qrCode && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="bg-fd-background p-4 rounded-lg border border-fd-border">
                  <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-fd-muted-foreground mb-2">
                    {t('settings.security.two_factor.manual_code')}
                  </p>
                  <code className="px-3 py-1.5 rounded bg-fd-muted text-sm font-mono">
                    {secret}
                  </code>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="2fa-code" className="text-sm font-medium">
                {t('settings.security.two_factor.verification_code')}
              </label>
              <InputGroup>
                <InputGroupInput
                  id="2fa-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder={t('settings.security.two_factor.enter_code')}
                  maxLength={6}
                />
              </InputGroup>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={handleVerify2FA}
                disabled={!verificationCode || verificationCode.length !== 6 || isLoading}
                variant="primary"
              >
                {isLoading ? t('settings.security.two_factor.verifying') : t('settings.security.two_factor.verify_enable')}
              </Button>
              <Button
                onClick={() => {
                  setShowSetupDialog(false);
                  setVerificationCode('');
                }}
                variant="ghost"
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
      />
    </>
  );
}
