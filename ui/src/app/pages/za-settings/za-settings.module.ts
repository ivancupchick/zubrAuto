import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import {MenubarModule} from 'primeng/menubar';
import {TableModule} from 'primeng/table';
import {CardModule} from 'primeng/card';
import {ToolbarModule} from 'primeng/toolbar';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {ToastModule} from 'primeng/toast';

import { ZASettingsComponent } from '../za-settings/za-settings.component';
import { SettingsFieldsComponent } from './settings-fields/settings-fields.component';
import { SettingHeaderComponent } from './setting-header/setting-header.component';
import { SettingFooterComponent } from './setting-footer/setting-footer.component';
import { CreateFieldComponent } from './modals/create-field/create-field.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldFormComponent } from './shared/fields/field-form/field-form.component';
import { SettingsClientsComponent } from './settings-clients/settings-clients.component';
import { GridComponent } from './shared/grid/grid.component';
import { CreateClientComponent } from './modals/create-client/create-client.component';
import { DynamicFormComponent } from './shared/dynamic-form/dynamic-form.component';



const routes: Routes = [{
  path: '',
  component: ZASettingsComponent,
  children: [{
      path: 'fields',
      component: SettingsFieldsComponent
    }, {
      path: 'clients',
      component: SettingsClientsComponent
    }
  ]
}]

@NgModule({
  declarations: [
    ZASettingsComponent,
    SettingsFieldsComponent,
    SettingHeaderComponent,
    SettingFooterComponent,
    CreateFieldComponent,
    FieldFormComponent,
    SettingsClientsComponent,
    GridComponent,
    CreateClientComponent,
    DynamicFormComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MenubarModule,
    TableModule,
    CardModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    DynamicDialogModule,
    InputTextModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextareaModule,
    ProgressSpinnerModule,
    MessagesModule,
    MessageModule,
    ToastModule
  ]
})
export class ZASettingsModule { }
