'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@iconify/react';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { useApi, isError } from '@/lib/api';
import FollowProfile from '../FollowProfile';

const FOLLOWERS_PER_PAGE = 20;

interface Follower {
  user: string;
  at: number;
}

export default function FollowersPage() {
  const Api = useApi();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [total, setTotal] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadPage = async (page: number) => {
    if (loading || !Api) return;

    setLoading(true);
    setError(undefined);

    try {
      const res = await Api.fetchMyFollowers(FOLLOWERS_PER_PAGE, page * FOLLOWERS_PER_PAGE);

      if (isError(res)) {
        setError(res.message);
        setLoading(false);
        return;
      }

      if (total === -1) {
        setTotal(res.total);
      }

      // Filter out duplicates based on user ID
      setFollowers((prev) => {
        const existingIds = new Set(prev.map(f => f.user));
        const newFollowers = res.followers.filter(f => !existingIds.has(f.user));
        return [...prev, ...newFollowers];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load followers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasLoaded) {
      loadPage(0);
      setHasLoaded(true);
    }
  }, [hasLoaded]);

  const hasMore = followers.length < total;

  return (
    <DocsPage toc={[]} footer={{ enabled: false }}>
      <DocsTitle>
        <div className='flex flex-row items-center gap-3 justify-between'>
          <span>Followers</span>
          
          {total === -1 ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            <p className="text-sm text-fd-muted-foreground">
              {total === 0 ? 'No followers yet' : `${total} follower${total > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      </DocsTitle>
      <DocsDescription>
        People who follow you. You can see who follows you here.
      </DocsDescription>
      <DocsBody>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <Icon icon="material-symbols:error-circle-rounded" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">

          {/* Loading Skeletons */}
          {total === -1 && (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-fd-border bg-fd-accent/10">
                  <Skeleton className="size-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-3 w-16 flex-shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Followers List */}
          {followers.length > 0 && (
            <div className="space-y-2">
              {followers.map((follower, index) => (
                <FollowProfile key={`${follower.user}-${index}`} sid={follower.user} at={follower.at} />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => loadPage(Math.floor(followers.length / FOLLOWERS_PER_PAGE))}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      </DocsBody>
    </DocsPage>
  );
}
