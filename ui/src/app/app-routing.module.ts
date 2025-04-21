import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsFieldsComponent } from './pages/za-settings/settings-fields/settings-fields.component';
import { ZASettingsComponent } from './pages/za-settings/za-settings.component';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/main/main.module').then((m) => m.MainModule),
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./pages/za-settings/za-settings.module').then(
        (m) => m.ZASettingsModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
