'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@iconify/react';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { useApi, isError } from '@/lib/api';
import FollowProfile from '../FollowProfile';

const FOLLOWING_PER_PAGE = 20;

interface Following {
  user: string;
  at: number;
}

export default function FollowingsPage() {
  const Api = useApi();
  const [followings, setFollowings] = useState<Following[]>([]);
  const [total, setTotal] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadPage = async (page: number) => {
    if (loading || !Api) return;

    setLoading(true);
    setError(undefined);

    try {
      const res = await Api.fetchMyFollowing(FOLLOWING_PER_PAGE, page * FOLLOWING_PER_PAGE);

      if (isError(res)) {
        setError(res.message);
        setLoading(false);
        return;
      }

      if (total === -1) {
        setTotal(res.total);
      }

      // Filter out duplicates based on user ID
      setFollowings((prev) => {
        const existingIds = new Set(prev.map(f => f.user));
        const newFollowings = res.following.filter(f => !existingIds.has(f.user));
        return [...prev, ...newFollowings];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load following');
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

  const hasMore = followings.length < total;

  return (
    <DocsPage toc={[]} footer={{ enabled: false }}>
      <DocsTitle>
        <div className='flex flex-row items-center gap-3 justify-between'>
          <span>Followings</span>

          {total === -1 ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            <p className="text-sm text-fd-muted-foreground">
              {total === 0 ? 'No followings yet' : `${total} following${total > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
      </DocsTitle>
      <DocsDescription>
        People you follow. Manage your following list here.
      </DocsDescription>
      <DocsBody>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <Icon icon="material-symbols:error-circle-rounded" className="size-4" />
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

          {/* Following List */}
          {followings.length > 0 && (
            <div className="space-y-2">
              {followings.map((following, index) => (
                <FollowProfile key={`${following.user}-${index}`} sid={following.user} at={following.at} />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => loadPage(Math.floor(followings.length / FOLLOWING_PER_PAGE))}
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
