'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page';
import { useApi } from '@/lib/api';
import { fetchApi, isResponseError } from '@/lib/api/utils';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/cn';
import ActionButton from '../ActionButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n/config';

interface ConfigEntry {
  key: string;
  label: string;
  description: string | null;
  default: string;
  environment: string | null;
  override: string | null;
  forced: boolean;
  risky: boolean;
}

type ConfigsResponse = ConfigEntry[];

interface PatchResult {
  key: string;
  ok: boolean;
  error?: string;
}

/** Returns the effective value shown to the server at runtime */
function effectiveValue(cfg: ConfigEntry): string {
  if (cfg.forced && cfg.environment !== null) return cfg.environment;
  if (cfg.override !== null) return cfg.override;
  if (cfg.environment !== null) return cfg.environment;
  return cfg.default;
}

/** Which source is active */
function valueSource(cfg: ConfigEntry): 'forced' | 'db' | 'env' | 'default' {
  if (cfg.forced) return 'forced';
  if (cfg.override !== null) return 'db';
  if (cfg.environment !== null) return 'env';
  return 'default';
}

const SOURCE_COLORS: Record<string, string> = {
  forced: 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/40',
  db: 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40',
  env: 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/40',
  default: 'bg-fd-muted/60 text-fd-muted-foreground border-fd-border',
};

const SOURCE_LABELS: Record<string, string> = {
  forced: 'forced',
  db: 'db override',
  env: 'env var',
  default: 'default',
};

function ConfigRow({
  cfg,
  editValue,
  onChange,
  onReset,
  dirty,
  saveError,
}: {
  cfg: ConfigEntry;
  editValue: string;
  onChange: (v: string) => void;
  onReset: () => void;
  dirty: boolean;
  saveError?: string;
}) {
  const source = valueSource(cfg);
  const isForced = cfg.forced;

  return (
    <div className={cn(
      'rounded-md border bg-fd-card text-fd-card-foreground p-4 flex flex-col gap-3 transition-colors',
      dirty && 'border-fd-ring/40 bg-fd-primary/5',
      saveError && 'border-fd-destructive/50 bg-fd-destructive/5',
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{cfg.label}</span>
            <code className="text-xs bg-fd-muted px-1.5 py-0.5 rounded-sm font-mono">{cfg.key}</code>
            <Badge
              className={cn(
                'text-xs font-medium rounded-sm border',
                SOURCE_COLORS[source],
              )}
            >
              {SOURCE_LABELS[source]}
            </Badge>
          </div>
          {cfg.description && (
            <p className="text-xs text-fd-muted-foreground mt-1">{cfg.description}</p>
          )}
        </div>
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={editValue}
          onChange={e => onChange(e.target.value)}
          disabled={isForced}
          placeholder={isForced ? '(forced by environment — cannot edit)' : `Default: ${cfg.default}`}
          className={cn(
            'h-9 text-sm',
            dirty && 'border-fd-ring ring-fd-ring/30 ring-[3px]',
          )}
        />
        {!isForced && (
          <Button
            title="Reset to env/default (remove db override)"
            onClick={onReset}
            color="outline"
            size="icon-sm"
            disabled={cfg.override === null}
            className="shrink-0 h-9 w-9"
          >
            <Icon icon="material-symbols:settings-backup-restore-rounded" className="size-4" />
          </Button>
        )}
      </div>

      {/* Context hints */}
      <div className="flex gap-4 text-xs text-fd-muted-foreground flex-wrap">
        {cfg.environment !== null && (
          <span>
            <span className="opacity-60">env:</span>{' '}
            <code className="bg-fd-muted px-1 py-0.5 rounded-sm font-mono">{cfg.environment}</code>
          </span>
        )}
        <span>
          <span className="opacity-60">default:</span>{' '}
          <code className="bg-fd-muted px-1 py-0.5 rounded-sm font-mono">{cfg.default || '(empty)'}</code>
        </span>
      </div>

      {saveError && (
        <p className="text-xs text-fd-destructive">{saveError}</p>
      )}
    </div>
  );
}

export default function ConfigsPage() {
  const { t } = useTranslation();
  const Api = useApi();
  const router = useRouter();

  const [configs, setConfigs] = useState<ConfigEntry[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [resets, setResets] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [error, setError] = useState<string>();
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});
  const [filterText, setFilterText] = useState('');
  const [filterSources, setFilterSources] = useState<Set<string>>(new Set());
  const [showRisky, setShowRisky] = useState(false);

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetchApi<ConfigsResponse>('/api/server/configs');
      if (isResponseError(res)) {
        if (res.error.status === 403) {
          router.push('/settings');
          return;
        }
        setError(res.error.message);
        return;
      }
      setConfigs(res.data);
      // Initialise edits from current db overrides
      const init: Record<string, string> = {};
      for (const cfg of res.data) {
        init[cfg.key] = cfg.override ?? '';
      }
      setEdits(init);
      setResets(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load configs');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!Api?.currentUser) return;
    const isAdmin = Api.currentUser?.tags?.includes('sys:admin') ?? false;
    if (!isAdmin) { router.push('/settings'); return; }
    loadConfigs();
  }, [Api?.currentUser, router, loadConfigs]);

  const isDirty = useCallback(
    (cfg: ConfigEntry) => {
      if (resets.has(cfg.key)) return true; // marked for reset
      const editVal = edits[cfg.key] ?? '';
      const currentDb = cfg.override ?? '';
      return editVal !== currentDb;
    },
    [edits, resets],
  );

  const handleChange = (key: string, value: string) => {
    setEdits(prev => ({ ...prev, [key]: value }));
    setResets(prev => { const n = new Set(prev); n.delete(key); return n; });
    setSavedOk(false);
  };

  const handleReset = (key: string) => {
    setResets(prev => new Set(prev).add(key));
    setEdits(prev => ({ ...prev, [key]: '' }));
    setSavedOk(false);
  };

  const hasAnyChanges = configs.some(isDirty);

  const filteredConfigs = configs.filter(cfg => {
    if (!showRisky && cfg.risky) return false;
    if (filterSources.size > 0 && !filterSources.has(valueSource(cfg))) return false;
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      const matchesKey = cfg.key.toLowerCase().includes(q);
      const matchesLabel = cfg.label.toLowerCase().includes(q);
      const matchesDesc = cfg.description?.toLowerCase().includes(q) ?? false;
      if (!matchesKey && !matchesLabel && !matchesDesc) return false;
    }
    return true;
  });

  const toggleSourceFilter = (source: string) => {
    setFilterSources(prev => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source); else next.add(source);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveErrors({});
    setSavedOk(false);

    const payload: { key: string; value: string | null }[] = [];
    for (const cfg of configs) {
      if (!isDirty(cfg)) continue;
      const value = resets.has(cfg.key) ? null : (edits[cfg.key]?.trim() || null);
      payload.push({ key: cfg.key, value });
    }

    try {
      const res = await fetchApi<{ results: PatchResult[] }>('/api/server/configs', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      if (isResponseError(res)) {
        setError(res.error.message);
        return;
      }

      const errs: Record<string, string> = {};
      for (const r of res.data.results) {
        if (!r.ok) errs[r.key] = r.error ?? 'error';
      }
      if (Object.keys(errs).length > 0) {
        setSaveErrors(errs);
      } else {
        setSavedOk(true);
        await loadConfigs();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('settings.configs.save_failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DocsPage toc={[]} footer={{ enabled: false }}>
      <DocsTitle className="flex items-center justify-between">
        <span>{t('settings.configs.title')}</span>
        <ActionButton
          variant="save"
          onClick={handleSave}
          disabled={!hasAnyChanges}
          isLoading={saving}
        />
      </DocsTitle>
      <DocsDescription>
        {t('settings.configs.description')}
      </DocsDescription>
      <DocsBody>
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4 min-w-0">
          {/* Search input */}
          <div className="relative flex-1 min-w-0">
            <Icon
              icon="material-symbols:search-rounded"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-fd-muted-foreground pointer-events-none"
            />
            <Input
              type="text"
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              placeholder={t('settings.configs.filter_placeholder')}
              className="pl-8 pr-8 h-9 text-sm"
            />
            {filterText && (
              <Button
                onClick={() => setFilterText('')}
                color="ghost"
                size="icon-xs"
                className="absolute right-1.5 top-1/2 -translate-y-1/2"
              >
                <Icon icon="material-symbols:close-rounded" className="size-4" />
              </Button>
            )}
          </div>
          {/* Risky toggle */}
          <button
            onClick={() => setShowRisky(v => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-xs font-medium border transition-colors whitespace-nowrap flex-shrink-0',
              showRisky
                ? 'bg-orange-500 text-black border-orange-500/80 hover:bg-orange-500/80'
                : 'border-fd-border bg-fd-background text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground',
            )}
          >
            <Icon icon="material-symbols:warning-rounded" className="size-3.5" />
            {t('settings.configs.risky')}
          </button>
          {/* Source filter chips */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {(['forced', 'db', 'env', 'default'] as const).map(s => {
              const count = configs.filter(c => valueSource(c) === s).length;
              const active = filterSources.has(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSourceFilter(s)}
                  className={cn(
                    'inline-flex items-center gap-1 h-9 px-3 rounded-md text-xs font-medium border transition-colors whitespace-nowrap',
                    active
                      ? SOURCE_COLORS[s]
                      : 'border-fd-border bg-fd-background text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground',
                  )}
                >
                  {SOURCE_LABELS[s]}
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-md border border-fd-destructive/30 bg-fd-destructive/10 p-3 text-sm text-fd-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-fd-muted-foreground py-12 justify-center">
            <Icon icon="material-symbols:progress-activity" className="size-5 animate-spin" />
            Loading configurations…
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredConfigs.length === 0 ? (
              <div className="py-12 text-center text-fd-muted-foreground text-sm">
                No configurations match your filters.
              </div>
            ) : filteredConfigs.map(cfg => (
              <ConfigRow
                key={cfg.key}
                cfg={cfg}
                editValue={edits[cfg.key] ?? ''}
                onChange={v => handleChange(cfg.key, v)}
                onReset={() => handleReset(cfg.key)}
                dirty={isDirty(cfg)}
                saveError={saveErrors[cfg.key]}
              />
            ))}
          </div>
        )}
      </DocsBody>
    </DocsPage>
  );
}
