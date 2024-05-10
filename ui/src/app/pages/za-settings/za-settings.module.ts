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
import {CalendarModule} from 'primeng/calendar';
import {AccordionModule} from 'primeng/accordion';
import {CarouselModule} from 'primeng/carousel';
import {ImageModule} from 'primeng/image';
import {FileUploadModule} from 'primeng/fileupload';
import {ChartModule} from 'primeng/chart';
import {TimelineModule} from 'primeng/timeline';
import {SliderModule} from 'primeng/slider';
import {MultiSelectModule} from 'primeng/multiselect';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {ContextMenuModule} from 'primeng/contextmenu';
import {EditorModule} from 'primeng/editor';
import {TooltipModule} from 'primeng/tooltip';


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
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
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
import { NewQuestionnaireComponent } from './new-questionnaire/new-questionnaire.component';
import { TransformToCarShooting } from './modals/transform-to-car-shooting/transform-to-car-shooting.component';
import { CreateCarFormComponent } from './modals/create-car-form/create-car-form.component';
import { UploadCarMediaComponent } from './modals/upload-car-media/upload-car-media.component';
import { ChangeCarStatusComponent } from './modals/change-car-status/change-car-status.component';
import { SelectCarComponent } from './modals/select-car/select-car.component';
import { ManageCarShowingComponent } from './modals/manage-car-showing/manage-car-showing.component';
import { CreateCarShowingComponent } from './modals/create-car-showing/create-car-showing.component';
import { CustomerServiceCallComponent } from './modals/customer-service-call/customer-service-call.component';
import { CompleteClientDealComponent } from './modals/complete-client-deal/complete-client-deal.component';
import { ServerErrorMessageInterceptor } from 'src/app/services/interseptors/server-error-message-interceptor.service';
import { MessageService } from 'primeng/api';
import { ChangeCarOwnerNumberComponent } from './modals/change-car-owner-number/change-car-owner-number.component';
import { ClientPreviewComponent } from './client/modals/client-preview/client-preview.component';
import { HighlightModule } from 'ngx-highlightjs';
import { DashboardModule } from './dashboard/dashboard.module';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';
import { UserService } from 'src/app/services/user/user.service';



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
      canActivate: [AuthGuard],
      component: NewWorksheetComponent
    }, {
      path: 'new-questionnaire',
      canActivate: [AuthGuard],
      component: NewQuestionnaireComponent
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
    SettingsCarsComponent,
    CreateCarComponent,
    SettingsRolesComponent,
    CreateRoleComponent,
    SettingsUsersComponent,
    CreateUserComponent,
    SelectAccessComponent,
    SettingsHomeComponent,
    CreateCallBaseComponent,
    NewWorksheetComponent,
    NewQuestionnaireComponent,
    TransformToCarShooting,
    CreateCarFormComponent,
    UploadCarMediaComponent,
    ChangeCarStatusComponent,
    SelectCarComponent,
    ManageCarShowingComponent,
    CreateCarShowingComponent,
    CustomerServiceCallComponent,
    CompleteClientDealComponent,
    ChangeCarOwnerNumberComponent,
    ClientPreviewComponent,
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
    SpinnerComponent,
    HttpClientModule,
    AvatarModule,
    AvatarGroupModule,
    ChipModule,
    ChipsModule,
    RadioButtonModule,
    TabViewModule,
    CheckboxModule,
    CalendarModule,
    AccordionModule,
    CarouselModule,
    ImageModule,
    FileUploadModule,
    ChartModule,
    TimelineModule,
    SliderModule,
    MultiSelectModule,
    OverlayPanelModule,
    ContextMenuModule,
    EditorModule,
    TooltipModule,
    ModalsAuthModule,
    DynamicFormModule,
    HighlightModule,
    DashboardModule,
    GridComponent,
    CreateClientComponent
  ],
  providers: [
    AuthService,
    AuthGuard,
    SettingsResolver,
    SessionService,
    FieldService,
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorMessageInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    RequestService,
    UserService
  ]
})
export class ZASettingsModule { }
