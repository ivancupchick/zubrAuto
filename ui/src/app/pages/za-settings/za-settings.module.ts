import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import {MenubarModule} from 'primeng/menubar';
import {TableModule} from 'primeng/table';
import {CardModule} from 'primeng/card';

import { ZASettingsComponent } from '../za-settings/za-settings.component';
import { SettingsFieldsComponent } from './settings-fields/settings-fields.component';
import { SettingHeaderComponent } from './setting-header/setting-header.component';
import { SettingFooterComponent } from './setting-footer/setting-footer.component';



const routes: Routes = [{
  path: '',
  component: ZASettingsComponent,
  children: [
    {
      path: 'fields',
      component: SettingsFieldsComponent
    }
  ]
}]

@NgModule({
  declarations: [
    ZASettingsComponent,
    SettingsFieldsComponent,
    SettingHeaderComponent,
    SettingFooterComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MenubarModule,
    TableModule,
    CardModule
  ]
})
export class ZASettingsModule { }
