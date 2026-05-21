import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import Fuse, { type IFuseOptions } from 'fuse.js';
import { Observable, map, of, shareReplay, switchMap } from 'rxjs';

import {
  ConversationLine,
  EntryDetail,
  Locale,
  TermSummary,
} from './models/glossary.models';

/**
 * Single source of truth for glossary data. Loads JSON from `assets/data/`
 * (mirrored from the legacy Cordova app) and exposes typed, cached observables
 * plus a Fuse.js-powered full-text search across all locales.
 */
@Injectable({ providedIn: 'root' })
export class GlossaryService {
  private readonly http = inject(HttpClient);

  /** UI/content locale, as a reactive signal. */
  readonly locale = signal<Locale>('eng');

  private readonly base = 'assets/data';

  // ---- cached HTTP responses (one network call per resource) -------------

  private readonly categories$ = this.http
    .get<Record<string, Record<string, string>>>(`${this.base}/categories.json`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  private readonly tree$ = this.http
    .get<unknown>(`${this.base}/tree-map.json`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  private readonly termsCache = new Map<Locale, Observable<TermSummary[]>>();
  private readonly entryCache = new Map<string, Observable<EntryDetail>>();

  // ---- categories / tree -------------------------------------------------

  getCategories(): Observable<Record<string, Record<string, string>>> {
    return this.categories$;
  }

  getCategoryTree(): Observable<unknown> {
    return this.tree$;
  }

  // ---- terms list (per locale) -------------------------------------------

  getTerms(locale: Locale = this.locale()): Observable<TermSummary[]> {
    let cached = this.termsCache.get(locale);
    if (!cached) {
      cached = this.http
        .get<Array<{ Term: { uuid: string }; TermTranslation: TermSummary }>>(
          `${this.base}/${locale}/terms.json`,
        )
        .pipe(
          map((rows) =>
            rows.map<TermSummary>((row) => ({
              uuid: row.Term.uuid,
              term: row.TermTranslation.term,
              definition: row.TermTranslation.definition ?? '',
              locale: row.TermTranslation.locale as Locale,
            })),
          ),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
      this.termsCache.set(locale, cached);
    }
    return cached;
  }

  // ---- full entry (all locales for one uuid) -----------------------------

  getEntry(uuid: string): Observable<EntryDetail> {
    let cached = this.entryCache.get(uuid);
    if (!cached) {
      cached = this.http
        .get<EntryDetail>(`${this.base}/entries/${uuid}.json`)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
      this.entryCache.set(uuid, cached);
    }
    return cached;
  }

  // ---- search ------------------------------------------------------------

  /**
   * Fuzzy, diacritic-insensitive search across `term` and `definition` for
   * the current locale. Returns an empty array for an empty query.
   */
  search(query: string, locale: Locale = this.locale()): Observable<TermSummary[]> {
    const q = query.trim();
    if (!q) return this.getTerms(locale);
    return this.getTerms(locale).pipe(
      map((terms) => {
        const fuse = new Fuse<TermSummary>(terms, FUSE_OPTIONS);
        return fuse.search(q).map((r) => r.item);
      }),
    );
  }

  // ---- conversations -----------------------------------------------------

  getConversation(
    name = 'McGill_Pain_Questionnaire',
    locale: Locale = this.locale(),
  ): Observable<ConversationLine[]> {
    return this.http
      .get<Record<string, { Translations: ConversationLine['translations'] }>>(
        `${this.base}/conversation/${locale}/${name}.json`,
      )
      .pipe(
        map((dict) =>
          Object.entries(dict).map(([id, value]) => ({
            id,
            translations: value.Translations ?? [],
          })),
        ),
      );
  }

  // ---- helpers -----------------------------------------------------------

  /** Resource URL for an audio file referenced by a conversation/entry. */
  audioUrl(filename: string, subfolder?: string): string {
    return subfolder
      ? `${this.base}/audio/${subfolder}/${filename}`
      : `${this.base}/audio/${filename}`;
  }

  /**
   * Resolve the URL for a conversation audio clip. The legacy data lays out
   * pain-questionnaire audio under `audio/conversation_crj/` (East Cree
   * Southern) and `audio/conversation_crl/` (Northern); we pick the folder
   * based on the locale tag attached to the translation row.
   */
  conversationAudioUrl(filename: string, locale: string): string {
    const folder =
      locale === 'crl' ? 'conversation_crl' : locale === 'crj' ? 'conversation_crj' : '';
    return this.audioUrl(filename, folder || undefined);
  }

  /** Resource URL for a diagram/image asset. */
  imageUrl(filename: string): string {
    return `${this.base}/images/${filename}`;
  }

  // ---- per-term pronunciation audio --------------------------------------

  /**
   * Single-word pronunciation clips live under `audio/crj/` and `audio/crl/`
   * with the filename equal to the Cree term itself (e.g. `uskun.mp3`).
   * `audio-manifest.json` lists what exists so we can render a play button
   * only when there's actually a recording to play.
   */
  private readonly audioManifest$ = this.http
    .get<{ crj?: string[]; crl?: string[] }>(`${this.base}/audio-manifest.json`)
    .pipe(
      map((m) => ({
        crj: new Set(m.crj ?? []),
        crl: new Set(m.crl ?? []),
      })),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

  audioManifest(): Observable<{ crj: Set<string>; crl: Set<string> }> {
    return this.audioManifest$;
  }

  /**
   * URL of the pronunciation clip for `term` in the given Cree dialect, or
   * `null` if no such recording is bundled. Synchronous wrapper around the
   * cached manifest; callers should subscribe to `audioManifest()` once
   * first (the Glossary tab does this on init).
   */
  termAudioUrl(term: string, locale: string, manifest: { crj: Set<string>; crl: Set<string> }): string | null {
    if (locale !== 'crj' && locale !== 'crl') return null;
    const key = term.trim();
    if (!key || !manifest[locale].has(key)) return null;
    return this.audioUrl(`${key}.mp3`, locale);
  }

  /** Convenience: switch locale and return the matching terms stream. */
  setLocale(locale: Locale): Observable<TermSummary[]> {
    this.locale.set(locale);
    return of(locale).pipe(switchMap((l) => this.getTerms(l)));
  }
}

const FUSE_OPTIONS: IFuseOptions<TermSummary> = {
  keys: [
    { name: 'term', weight: 0.7 },
    { name: 'definition', weight: 0.3 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  ignoreDiacritics: true,
  minMatchCharLength: 2,
};
