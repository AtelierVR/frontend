'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { useApi } from '@/lib/api';

export default function FollowSettingsPage() {
  const Api = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  const handleSave = async () => {
    if (!Api) return;

    setLoading(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      // TODO: Implement actual save functionality when API is ready
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      setSuccess('Follow settings saved successfully!');

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(undefined);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DocsPage toc={[]} footer={{ enabled: false }}>
      <DocsTitle>Follow Overview</DocsTitle>
      <DocsDescription>
        Configure your follower and following preferences.
      </DocsDescription>
      <DocsBody>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <Icon icon="material-symbols:error-circle-rounded" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100">
            <Icon icon="material-symbols:check-circle-rounded" className="size-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Privacy Settings */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Privacy</h2>
            <div className="rounded-lg border border-fd-border p-4 bg-fd-muted/30">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-medium">Private Account</div>
                  <div className="text-sm text-fd-muted-foreground">
                    When your account is private, only people you approve can see your content
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </section>

          {/* Follow Requests */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Follow Requests</h2>
            <div className="rounded-lg border border-fd-border p-4 bg-fd-muted/30">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-medium">Manual Approval</div>
                  <div className="text-sm text-fd-muted-foreground">
                    Manually approve follow requests before someone can follow you
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <div className="space-y-2">
              <div className="rounded-lg border border-fd-border p-4 bg-fd-muted/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">New Followers</div>
                    <div className="text-sm text-fd-muted-foreground">
                      Get notified when someone follows you
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-fd-border p-4 bg-fd-muted/30">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-medium">Follow Requests</div>
                    <div className="text-sm text-fd-muted-foreground">
                      Get notified when someone requests to follow you
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </DocsBody>
    </DocsPage>
  );
}
