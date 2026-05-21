import { Component, inject } from '@angular/core';

import { SettingsService } from './core/settings.service';
import { UserDataService } from './core/user-data.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  // Construct eagerly so persisted theme/font-scale and favorites/history
  // are loaded before the first view renders.
  private readonly settings = inject(SettingsService);
  private readonly userData = inject(UserDataService);
}
