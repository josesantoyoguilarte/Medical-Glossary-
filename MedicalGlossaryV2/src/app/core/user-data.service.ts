import { Injectable, computed, effect, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const KEY_FAVORITES = 'favorites:v1';
const KEY_HISTORY = 'history:v1';
const HISTORY_LIMIT = 25;

/**
 * Per-user, on-device preferences for favorites and recently viewed terms.
 * Uses `@capacitor/preferences`, which transparently maps to:
 *   - `UserDefaults` on iOS
 *   - `SharedPreferences` on Android
 *   - `localStorage` on the web/PWA
 *
 * State is exposed as Angular signals so views can react without manual
 * subscriptions.
 */
@Injectable({ providedIn: 'root' })
export class UserDataService {
  private readonly _favorites = signal<Set<string>>(new Set());
  private readonly _history = signal<string[]>([]);

  readonly favorites = computed(() => this._favorites());
  readonly history = computed(() => this._history());

  constructor() {
    void this.load();
    effect(() => {
      const fav = Array.from(this._favorites());
      void Preferences.set({ key: KEY_FAVORITES, value: JSON.stringify(fav) });
    });
    effect(() => {
      void Preferences.set({
        key: KEY_HISTORY,
        value: JSON.stringify(this._history()),
      });
    });
  }

  isFavorite(uuid: string): boolean {
    return this._favorites().has(uuid);
  }

  toggleFavorite(uuid: string): void {
    const next = new Set(this._favorites());
    if (!next.delete(uuid)) next.add(uuid);
    this._favorites.set(next);
  }

  recordView(uuid: string): void {
    const next = [uuid, ...this._history().filter((u) => u !== uuid)].slice(
      0,
      HISTORY_LIMIT,
    );
    this._history.set(next);
  }

  clearHistory(): void {
    this._history.set([]);
  }

  private async load(): Promise<void> {
    const [{ value: fav }, { value: hist }] = await Promise.all([
      Preferences.get({ key: KEY_FAVORITES }),
      Preferences.get({ key: KEY_HISTORY }),
    ]);
    try {
      if (fav) this._favorites.set(new Set(JSON.parse(fav) as string[]));
      if (hist) this._history.set(JSON.parse(hist) as string[]);
    } catch {
      // ignore corrupt stored value
    }
  }
}
