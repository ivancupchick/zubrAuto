import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZASettingsComponent } from '../za-settings/za-settings.component';
import { SettingsFieldsComponent } from './settings-fields/settings-fields.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: '',
  pathMatch: 'full',
  component: ZASettingsComponent
}, {
  path: 'fields',
  component: SettingsFieldsComponent
}]

@NgModule({
  declarations: [
    ZASettingsComponent,
    SettingsFieldsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule
  ]
})
export class ZASettingsModule { }
