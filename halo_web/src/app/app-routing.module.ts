import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './core/auth.guard';
import { UserLoginComponent } from './ui/user-login/user-login.component';
import { HomePageComponent } from './ui/home-page/home-page.component';
import { NotesListComponent } from './notes/notes-list/notes-list.component';
import { UploadPageComponent } from './uploads/upload-page/upload-page.component';

import { SsrPageComponent } from './ui/ssr-page/ssr-page.component';

import { SendComponent } from './send/send.component';
import { MyGiftsComponent } from './my-gifts/my-gifts.component';
import { GiftDetailsComponent } from './gift-details/gift-details.component';
import { AccountComponent } from './account/account.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: UserLoginComponent },
  { path: 'notes', component: NotesListComponent,  canActivate: [AuthGuard] },
  { path: 'uploads',  component: UploadPageComponent,  canActivate: [AuthGuard] },

  { path: 'ssr', component: SsrPageComponent },

  { path: 'send', component: SendComponent },
  { path: 'my-gifts', component: MyGiftsComponent },
  { path: 'account', component: AccountComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'gift-details/:id', component: GiftDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
