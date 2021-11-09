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
import {InputTextareaModule} from 'primeng/inputtextarea';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {ToastModule} from 'primeng/toast';
import {AvatarModule} from 'primeng/avatar';
import {AvatarGroupModule} from 'primeng/avatargroup';
import {ChipModule} from 'primeng/chip';
import {ChipsModule} from 'primeng/chips';
import {RadioButtonModule} from 'primeng/radiobutton';
import {TabViewModule} from 'primeng/tabview';
import {CheckboxModule} from 'primeng/checkbox';

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
import { FieldService } from 'src/app/services/field/field.service';
import { SettingsCarsComponent } from './settings-cars/settings-cars.component';
import { CreateCarComponent } from './modals/create-car/create-car.component';
import { SpinnerModule } from 'src/app/shared/components/spinner/spinner.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from 'src/app/interceptors/auth.interceptor';
import { AuthGuard } from './auth.guard';
import { SessionService } from 'src/app/services/session/session.service';
import { SettingsResolver } from './settings.resolver';
import { AuthService } from 'src/app/services/auth/auth.service';
import { ModalsAuthModule } from 'src/app/pages/za-settings/modals/modals-auth/modals-auth.module';
import { DynamicFormModule } from './shared/dynamic-form/dynamic-form.module';
import { RequestService } from 'src/app/services/request/request.service';
import { SettingsRolesComponent } from './settings-roles/settings-roles.component';
import { CreateRoleComponent } from './modals/create-role/create-role.component';
import { SettingsUsersComponent } from './settings-users/settings-users.component';
import { CreateUserComponent } from './modals/create-user/create-user.component';
import { SelectAccessComponent } from './modals/select-access/select-access.component';
import { SettingsHomeComponent } from './settings-home/settings-home.component';
import { CreateCallBaseComponent } from './modals/create-call-base/create-call-base.component';
import { NewWorksheetComponent } from './new-worksheet/new-worksheet.component';



const routes: Routes = [{
  path: '',
  component: ZASettingsComponent,
  resolve: {
    user: SettingsResolver
  },
  children: [{
      path: '',
      component: SettingsHomeComponent
    },{
      path: 'fields',
      canActivate: [AuthGuard],
      component: SettingsFieldsComponent
    }, {
      path: 'clients',
      canActivate: [AuthGuard],
      component: SettingsClientsComponent
    }, {
      path: 'cars',
      canActivate: [AuthGuard],
      component: SettingsCarsComponent
    }, {
      path: 'users',
      canActivate: [AuthGuard],
      component: SettingsUsersComponent
    }, {
      path: 'roles',
      canActivate: [AuthGuard],
      component: SettingsRolesComponent
    }, {
      path: 'new-worksheet',
      canActivate: [AuthGuard], // TODO: Add Guard for carShootingDepartment Users
      component: NewWorksheetComponent
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
    SettingsCarsComponent,
    CreateCarComponent,
    SettingsRolesComponent,
    CreateRoleComponent,
    SettingsUsersComponent,
    CreateUserComponent,
    SelectAccessComponent,
    SettingsHomeComponent,
    CreateCallBaseComponent,
    NewWorksheetComponent
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
    MessagesModule,
    MessageModule,
    ToastModule,
    SpinnerModule,
    HttpClientModule,
    AvatarModule,
    AvatarGroupModule,
    ChipModule,
    ChipsModule,
    RadioButtonModule,
    TabViewModule,
    CheckboxModule,
    ModalsAuthModule,
    DynamicFormModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    SettingsResolver,
    SessionService,
    FieldService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    RequestService
  ]
})
export class ZASettingsModule { }
