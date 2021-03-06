import {
  BrowserModule,
  BrowserTransferStateModule
} from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

// Halo App Modules
import { CoreModule } from './core/core.module';
import { UploadsModule } from './uploads/uploads.module';
import { UiModule } from './ui/ui.module';
import { NotesModule } from './notes/notes.module';

// @angular/fire/ Modules
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { SendComponent } from './send/send.component';

// IMPORTANT
// Add your own project credentials to environments/*.ts

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MyGiftsComponent } from './my-gifts/my-gifts.component';
import { AccountComponent } from './account/account.component';
import { GiftDetailsComponent } from './gift-details/gift-details.component';

import { HttpModule } from '@angular/http';

import { MatNativeDateModule } from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {DemoMaterialModule} from './material-module';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { SafeHtmlPipe } from './safe-html.pipe';

@NgModule({
  declarations: [AppComponent, SendComponent, MyGiftsComponent, AccountComponent, GiftDetailsComponent, LeaderboardComponent, SafeHtmlPipe],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserTransferStateModule,
    AppRoutingModule,
    CoreModule,
    UiModule,
    NotesModule,
    UploadsModule,
    AngularFireModule.initializeApp(environment.firebase, 'halo-ct'),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    HttpModule,
    FormsModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    DemoMaterialModule,
    ServiceWorkerModule.register('/ngsw-worker.js', {
      enabled: environment.production
    })
  ],
  exports: [
    SafeHtmlPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
