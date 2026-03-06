import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApi, isError } from '@/lib/api';
import { CurrentUser } from '@/lib/api/types';
import { Icon } from '@iconify/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputGroup, InputGroupInput } from '@/components/ui/input-group';

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
  const Api = useApi();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');

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
      const res = null as any // await Api.setupTwoFactor();
      throw new Error('Not implemented');
      if (isError(res)) {
        setError(res.message);
      } else {
        setQrCode(res.qr_code);
        setSecret(res.secret);
        setShowSetupDialog(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!Api || !verificationCode) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const res = null as any // await Api.enableTwoFactor(verificationCode);
      throw new Error('Not implemented');
      if (isError(res)) {
        setError(res.message);
      } else {
        setSuccess('Two-factor authentication enabled successfully!');
        setTwoFactorEnabled(true);
        setShowSetupDialog(false);
        setVerificationCode('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!Api) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const res = null as any // await Api.disableTwoFactor();
      throw new Error('Not implemented');
      if (isError(res)) {
        setError(res.message);
      } else {
        setSuccess('Two-factor authentication disabled successfully!');
        setTwoFactorEnabled(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section id="2fa">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
            <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
              {twoFactorEnabled ? (
                <>
                  <Icon icon="material-symbols:shield-rounded" className="mr-1 size-3" />
                  Enabled
                </>
              ) : (
                <>
                  <Icon icon="material-symbols:shield-rounded" className="mr-1 size-3" />
                  Disabled
                </>
              )}
            </Badge>
          </div>

          <p className="text-sm text-fd-muted-foreground">
            {twoFactorEnabled
              ? 'Two-factor authentication is currently enabled. Your account is protected with an additional security layer.'
              : 'Add an extra layer of security to your account by requiring a code from your authenticator app.'}
          </p>

          <div className="pt-2">
            {twoFactorEnabled ? (
              <Button
                onClick={handleDisable2FA}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? 'Disabling...' : 'Disable 2FA'}
              </Button>
            ) : (
              <Button
                onClick={handleEnable2FA}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                <Icon icon="material-symbols:shield-rounded" className="mr-2 size-4" />
                {isLoading ? 'Setting up...' : 'Enable 2FA'}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* 2FA Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app, then enter the verification code.
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
                    Or enter this code manually:
                  </p>
                  <code className="px-3 py-1.5 rounded bg-fd-muted text-sm font-mono">
                    {secret}
                  </code>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="2fa-code" className="text-sm font-medium">
                Verification Code
              </label>
              <InputGroup>
                <InputGroupInput
                  id="2fa-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </InputGroup>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleVerify2FA}
                disabled={!verificationCode || verificationCode.length !== 6 || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
              <Button
                onClick={() => {
                  setShowSetupDialog(false);
                  setVerificationCode('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
