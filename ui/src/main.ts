import { enableProdMode, importProvidersFrom } from '@angular/core';


import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app/app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { ServerErrorMessageInterceptor } from './app/services/interseptors/server-error-message-interceptor.service';
import { HTTP_INTERCEPTORS, withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { HIGHLIGHT_OPTIONS, HighlightModule } from 'ngx-highlightjs';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule, HighlightModule, DynamicDialogModule, DialogModule),
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
    MessageService,
    DialogService,
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
  ]
})
  .catch((err) => console.error(err));
