import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type ThemeMode = 'system' | 'light' | 'dark';

const KEY_THEME = 'settings:theme:v1';
const KEY_FONT = 'settings:font-scale:v1';

const MIN_SCALE = 0.85;
const MAX_SCALE = 1.5;
const DEFAULT_SCALE = 1;

/**
 * Display preferences (color scheme + font scaling). Mirrors the OS dark-mode
 * choice by default and lets the user override. Values are persisted via
 * Capacitor Preferences and applied to <html> as a class + CSS variable so the
 * existing Ionic theme variables react automatically.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly doc = inject(DOCUMENT);
  private readonly mql = this.doc.defaultView?.matchMedia(
    '(prefers-color-scheme: dark)',
  );

  readonly theme = signal<ThemeMode>('system');
  readonly fontScale = signal<number>(DEFAULT_SCALE);

  constructor() {
    void this.load();
    effect(() => {
      this.applyTheme(this.theme());
      void Preferences.set({ key: KEY_THEME, value: this.theme() });
    });
    effect(() => {
      this.applyFontScale(this.fontScale());
      void Preferences.set({ key: KEY_FONT, value: String(this.fontScale()) });
    });
    this.mql?.addEventListener('change', () => {
      if (this.theme() === 'system') this.applyTheme('system');
    });
  }

  setTheme(value: ThemeMode): void {
    this.theme.set(value);
  }

  setFontScale(value: number): void {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
    this.fontScale.set(Number(clamped.toFixed(2)));
  }

  private applyTheme(value: ThemeMode): void {
    const wantsDark =
      value === 'dark' || (value === 'system' && !!this.mql?.matches);
    const html = this.doc.documentElement;
    html.classList.toggle('ion-palette-dark', wantsDark);
    html.classList.toggle('dark', wantsDark);
    html.style.colorScheme = wantsDark ? 'dark' : 'light';
  }

  private applyFontScale(scale: number): void {
    this.doc.documentElement.style.fontSize = `${Math.round(scale * 100)}%`;
  }

  private async load(): Promise<void> {
    const [{ value: t }, { value: f }] = await Promise.all([
      Preferences.get({ key: KEY_THEME }),
      Preferences.get({ key: KEY_FONT }),
    ]);
    if (t === 'light' || t === 'dark' || t === 'system') this.theme.set(t);
    const parsed = f ? Number(f) : NaN;
    if (Number.isFinite(parsed)) this.setFontScale(parsed);
  }
}
