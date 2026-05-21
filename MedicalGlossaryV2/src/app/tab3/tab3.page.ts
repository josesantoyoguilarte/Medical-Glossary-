import { Component, inject } from '@angular/core';

import { GlossaryService } from '../core/glossary.service';
import { Locale } from '../core/models/glossary.models';
import { SettingsService, ThemeMode } from '../core/settings.service';
import { UserDataService } from '../core/user-data.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  private readonly glossary = inject(GlossaryService);
  private readonly settings = inject(SettingsService);
  private readonly userData = inject(UserDataService);

  readonly locale = this.glossary.locale;
  readonly theme = this.settings.theme;
  readonly fontScale = this.settings.fontScale;
  readonly favorites = this.userData.favorites;
  readonly history = this.userData.history;

  setLocale(value: Locale): void {
    this.glossary.setLocale(value).subscribe();
  }

  setTheme(value: ThemeMode): void {
    this.settings.setTheme(value);
  }

  onFontScaleChange(value: unknown): void {
    if (typeof value === 'number') this.settings.setFontScale(value);
  }

  clearHistory(): void {
    this.userData.clearHistory();
  }
}
