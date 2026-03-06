'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Icon } from '@iconify/react';
import { Skeleton } from '@/components/ui/skeleton';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { useApi, isError, IRSession } from '@/lib/api';
import { useCountries } from '@/lib/hooks/useCountries';
import { UAParser } from 'ua-parser-js';
import { cn } from '@/lib/cn';

const SESSIONS_PER_PAGE = 10;

interface ParsedDevice {
  user_agent: string;
  ip: string;
  last_seen: number;
  result: UAParser.IResult;
}

interface IpLocation {
  country: string;
  country_name: string;
  city: string;
  region: string;
}

interface ParsedSession extends IRSession {
  devices: ParsedDevice[];
}

function parseSession(session: IRSession): ParsedSession {
  const devices = session.devices?.map((device) => {
    // Check for custom Nox client format: Nox/0.0.9 (en=unity; pn=windows)
    const noxRegex = /Nox\/([0-9.]+)\s\((.+)\)/;
    const parser = new UAParser(device.user_agent);
    const result = parser.getResult();

    const match = device.user_agent.match(noxRegex);
    if (match) {
      const dict = match[2].split(';').reduce((acc: Record<string, string>, item: string) => {
        const [key, value] = item.split('=');
        acc[key.trim()] = value.trim();
        return acc;
      }, {});

      result.browser.name = 'Nox';
      result.browser.version = match[1];
      result.os.name = dict['pn'];
      (result.engine as any).name = dict['en'] || 'custom';
      result.device.type = 'embedded' as any;
    }

    return {
      ...device,
      result,
    };
  }) || [];

  return {
    ...session,
    devices,
  };
}

function getDeviceIcon(device: ParsedDevice) {
  console.log(device.result);

  // browser-based icons
  if ((device.result.browser?.name?.length || 0) > 0)
    return 'material-symbols:web-asset';

  // os-based icons for embedded devices
  const os = device.result.os.name?.toLowerCase() || 'unknown';
  if (['windows', 'macos', 'linux'].includes(os))
    return 'material-symbols:monitor-rounded';
  if (['android', 'ios'].includes(os))
    return 'material-symbols:smartphone';

  return 'material-symbols:deployed-code';
}

function SessionCard({
  session,
  isCurrent,
  onDelete
}: {
  session: ParsedSession;
  isCurrent: boolean;
  onDelete?: () => void;
}) {
  const device = session.devices[0];
  const iconName = device ? getDeviceIcon(device) : 'material-symbols:navigation-rounded';
  const lastSeen = device ? device.last_seen : session.created_at;
  const [ipLocations, setIpLocations] = useState<Record<string, IpLocation | null>>({});
  const [loadingIps, setLoadingIps] = useState<Record<string, boolean>>({});
  const { countries } = useCountries();

  const fetchIpLocation = async (ip: string) => {
    if (ipLocations[ip] !== undefined || loadingIps[ip]) return;

    setLoadingIps(prev => ({ ...prev, [ip]: true }));
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`);
      if (res.ok) {
        const data = await res.json();
        setIpLocations(prev => ({ ...prev, [ip]: data }));
      } else {
        setIpLocations(prev => ({ ...prev, [ip]: null }));
      }
    } catch (err) {
      setIpLocations(prev => ({ ...prev, [ip]: null }));
    } finally {
      setLoadingIps(prev => ({ ...prev, [ip]: false }));
    }
  };

  const handleAccordionChange = (value: string) => {
    if (value && session.devices.length > 0) {
      session.devices.forEach(device => fetchIpLocation(device.ip));
    }
  };

  return (
    <div className={cn(
      'rounded-lg border border-fd-border',
      'bg-fd-accent/10'
    )}>
      <Accordion type="single" collapsible onValueChange={handleAccordionChange}>
        <AccordionItem value="details" className="border-0">
          <AccordionTrigger className="px-4 hover:no-underline hover:bg-fd-accent/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className={cn(
                "size-10 rounded-full flex items-center justify-center flex-shrink-0",
                isCurrent
                  ? 'bg-fd-primary text-fd-primary-foreground'
                  : 'bg-fd-muted'
              )}>
                <Icon icon={iconName} className="size-5" />
              </div>
              <div className="flex flex-col items-start text-left">
                <div className="font-medium">
                  {device ? (
                    <>
                      {device.result.browser.name} • <span className="capitalize">{device.result.os.name}</span>
                    </>
                  ) : (
                    'Unknown Device'
                  )}
                </div>
                <div className="text-xs text-fd-muted-foreground">
                  {new Date(lastSeen).toLocaleString()}
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="px-4 mt-4">
            <div className="space-y-4 text-sm">
              {/* Session Info */}
              <div className="rounded-md bg-fd-muted/50 p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-fd-muted-foreground">Created</span>
                  <span className="text-xs">{new Date(session.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fd-muted-foreground">Expires</span>
                  <span className="text-xs">{new Date(session.expires_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Devices */}
              {session.devices.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-fd-muted-foreground uppercase tracking-wider">
                    Devices ({session.devices.length})
                  </div>
                  <div className="space-y-2">
                    {session.devices.map((device, idx) => (
                      <div key={idx} className="rounded-md bg-fd-muted/50 p-3 space-y-2">

                        <div className="flex justify-between">
                          <span className="text-fd-muted-foreground">IP</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{device.ip}</span>
                            {loadingIps[device.ip] && (
                              <Icon icon="material-symbols:progress-activity" className="size-3 animate-spin text-fd-muted-foreground" />
                            )}
                            {ipLocations[device.ip]?.country && (() => {
                              const country = countries.find(
                                c => c.cca2 === ipLocations[device.ip]?.country
                              );
                              const locationText = `${ipLocations[device.ip]?.city}, ${ipLocations[device.ip]?.region}, ${ipLocations[device.ip]?.country_name}`;

                              return country ? (
                                <img
                                  src={country.flags.svg}
                                  alt={country.name.common}
                                  title={locationText}
                                  className="h-4 w-auto rounded-sm mt-0 mb-0"
                                />
                              ) : (
                                <span className="text-xs" title={locationText}>
                                  {String.fromCodePoint(
                                    ...ipLocations[device.ip]!.country.split('').map(
                                      char => 127397 + char.charCodeAt(0)
                                    )
                                  )}
                                </span>
                              );
                            })()}
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-fd-muted-foreground">Last Seen</span>
                          <span className="text-xs">{new Date(device.last_seen).toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-fd-muted-foreground">User Agent</span>
                          <span className="font-mono break-all text-xs">{device.user_agent}</span>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {!isCurrent && onDelete && (
                <Button
                  onClick={onDelete}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Revoke Session
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default function SessionsPage() {
  const Api = useApi();
  const router = useRouter();
  const [sessions, setSessions] = useState<ParsedSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ParsedSession | null>(null);
  const [total, setTotal] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false);

  const loadPage = async (page: number) => {
    if (loading || !Api) return;

    setLoading(true);
    setError(undefined);

    try {
      const [sessionsRes, currentRes] = await Promise.all([
        Api.fetchMySessions(SESSIONS_PER_PAGE, page * SESSIONS_PER_PAGE),
        currentSession ? Promise.resolve(currentSession) : Api.fetchCurrentSession(),
      ]);

      if (isError(currentRes)) {
        setError(currentRes.message);
        setLoading(false);
        return;
      }

      if (!currentSession) {
        setCurrentSession(parseSession(currentRes));
      }

      if (isError(sessionsRes)) {
        setError(sessionsRes.message);
        setLoading(false);
        return;
      }

      if (total === -1) {
        setTotal(sessionsRes.total);
      }

      const parsedSessions = sessionsRes.sessions.map(parseSession);

      // Éviter les doublons en filtrant les sessions déjà présentes
      setSessions((prev) => {
        const existingIds = new Set(prev.map(s => s.id));
        const newSessions = parsedSessions.filter(s => !existingIds.has(s.id));
        return [...prev, ...newSessions];
      });

      setTotal(sessionsRes.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (loading || !Api) return;

    setLoading(true);
    setError(undefined);
    setSessionToDelete(null);

    try {
      const res = await Api.deleteMySession(id);
      if (isError(res)) {
        setError(res.message);
        setLoading(false);
        return;
      }

      setSessions((prev) => prev.filter((s) => s.id !== id));
      setTotal((prev) => prev - 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAll = async () => {
    if (loading || !Api) return;

    setLoading(true);
    setError(undefined);
    setShowRevokeAllDialog(false);

    try {
      const res = await Api.deleteMySessions();
      if (isError(res)) {
        setError(res.message);
        setLoading(false);
        return;
      }

      // If logout is true, the current session was also deleted
      if (res.logout) {
        // Log out the user and redirect to home page
        await Api.fetchLogout();
        router.push('/');
        return;
      }

      // Clear all sessions except current
      setSessions([]);
      setTotal(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke all sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(0);
  }, []);

  const otherSessions = sessions.filter((s) => !s.current && s.id !== currentSession?.id);
  const hasMore = sessions.length < total;

  return (
    <DocsPage toc={[]} footer={{ enabled: false }}>
      <DocsTitle>Sessions</DocsTitle>
      <DocsDescription>
        Manage your active sessions. You can revoke access from any device.
      </DocsDescription>
      <DocsBody>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <Icon icon="material-symbols:error-circle-rounded" className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {/* Current Session */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Current Session</h2>
            {currentSession ? (
              <SessionCard session={currentSession} isCurrent={true} />
            ) : (
              <div className="border border-fd-border rounded-lg p-4 bg-fd-accent/10">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Other Sessions */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Other Sessions</h2>
              <div className="flex items-center gap-4">
                {total > 0 && (
                  <span className="text-sm text-fd-muted-foreground">
                    {otherSessions.length} / {total - 1}
                  </span>
                )}
                {otherSessions.length > 0 && (
                  <Button
                    onClick={() => setShowRevokeAllDialog(true)}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    Revoke All
                  </Button>
                )}
              </div>
            </div>

            {total === -1 && (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border border-fd-border rounded-lg p-4 bg-fd-accent/10">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {total === 0 && (
              <p className="text-center py-8 text-fd-muted-foreground">
                No other sessions found
              </p>
            )}

            {total === 1 && (
              <p className="text-center py-8 text-fd-muted-foreground">
                No other sessions
              </p>
            )}

            {otherSessions.length > 0 && (
              <div className="space-y-3">
                {otherSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    isCurrent={false}
                    onDelete={() => setSessionToDelete(session.id)}
                  />
                ))}
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => loadPage(Math.floor(sessions.length / SESSIONS_PER_PAGE))}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Revoking...' : 'Revoke'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Dialogs */}
        <Dialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
          <DialogContent className='max-w-lg'>
            <DialogHeader>
              <DialogTitle>Revoke Session</DialogTitle>
              <DialogDescription>
                Are you sure you want to revoke this session? This will immediately log out this device.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSessionToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => sessionToDelete && handleDeleteSession(sessionToDelete)}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon icon="material-symbols:progress-activity" className="mr-2 size-4 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  'Revoke'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showRevokeAllDialog} onOpenChange={setShowRevokeAllDialog}>
          <DialogContent className='max-w-lg'>
            <DialogHeader>
              <DialogTitle>Revoke All Sessions</DialogTitle>
              <DialogDescription className="space-y-2">
                <p>
                  This action will revoke <strong>all sessions</strong> including your current one.
                </p>
                <p className="text-fd-destructive font-medium">
                  You will be logged out and redirected to the home page.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRevokeAllDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleRevokeAll}
                disabled={loading}
              >
                {loading ? 'Revoking...' : 'Revoke All & Logout'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DocsBody>
    </DocsPage>
  );
}
