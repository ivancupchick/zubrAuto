import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './pages/header/header.component';
import { FooterComponent } from './pages/footer/footer.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HIGHLIGHT_OPTIONS, HighlightModule } from 'ngx-highlightjs';
import { ServerErrorMessageInterceptor } from './services/interseptors/server-error-message-interceptor.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth/auth.service';
import { MessageService } from 'primeng/api';
import { AuthGuard } from './pages/za-settings/auth.guard';
import { SettingsResolver } from './pages/za-settings/settings.resolver';
import { CarService } from './services/car/car.service';
import { ClientService } from './services/client/client.service';
import { FieldService } from './services/field/field.service';
import { RequestService } from './services/request/request.service';
import { SessionService } from './services/session/session.service';
import { UserService } from './services/user/user.service';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';


@NgModule({
  declarations: [AppComponent, HeaderComponent, FooterComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightModule,
    DynamicDialogModule,
    DialogModule,
  ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          json: () => import('highlight.js/lib/languages/json'),
          xml: () => import('highlight.js/lib/languages/xml'),
        },
      },
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorMessageInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    // AuthService,
    // AuthGuard,
    // SettingsResolver,
    // SessionService,
    // FieldService,
    MessageService,
    // RequestService,
    // UserService,
    // CarService, // createClient from global toolbar ?
    // ClientService,
    DialogService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
