import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { firebase } from '@firebase/app';
import { auth } from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { NotifyService } from './notify.service';

import { Observable, of } from 'rxjs';
import { switchMap, startWith, tap, filter } from 'rxjs/operators';

import { GiftsService } from 'src/app/gifts.service';

interface User {
  uid: string;
  email?: string | null;
  photoURL?: string;
  displayName?: string;
  cardNumber?: string;
  cardCvc?: string;
  cardExpiration?: string;
  cardValue?: number;
  giftsSent?: number;
  giftsAccepted?: number;
  valueSent?: number;
  giftsReceived?: number;
  valueReceived?: number;
}

@Injectable()
export class AuthService {
  user: Observable<User | null>;

  pending_transfers;
  pending_value=0;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private notify: NotifyService,
    private giftsService: GiftsService
  ) {
    this.user = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      }),
      tap(user => localStorage.setItem('user', JSON.stringify(user)))
      // startWith(JSON.parse(localStorage.getItem('user')))
    );

    this.giftsService.getPendingTransfers().subscribe(data => {
      this.pending_transfers = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data()
        }
      })
    });
  }

  ////// OAuth Methods /////

  googleLogin() {
    const provider = new auth.GoogleAuthProvider();
    return this.oAuthLogin(provider);
  }

  githubLogin() {
    const provider = new auth.GithubAuthProvider();
    return this.oAuthLogin(provider);
  }

  facebookLogin() {
    const provider = new auth.FacebookAuthProvider();
    return this.oAuthLogin(provider);
  }

  twitterLogin() {
    const provider = new auth.TwitterAuthProvider();
    return this.oAuthLogin(provider);
  }

  private reviewPendingTransfers(user_email) {
    var i;
    for (i=0; i<this.pending_transfers.length; i++) {
      this.pending_value+=parseFloat(this.pending_transfers[i]['amount']);
      this.giftsService.deletePendingTransfer(this.pending_transfers[i]['id']);
    }
  }

  private oAuthLogin(provider: any) {
    return this.afAuth.auth
      .signInWithPopup(provider)
      .then(credential => {
        // this.notify.update('Signed in successfully!', 'success');
        this.reviewPendingTransfers(credential.user.email);
        return this.updateUserData(credential.user);
      })
      .catch(error => this.handleError(error));
  }

  //// Anonymous Auth ////

  anonymousLogin() {
    return this.afAuth.auth
      .signInAnonymously()
      .then(credential => {
        // this.notify.update('Signed in successfully!', 'success');
        return this.updateUserData(credential.user); // if using firestore
      })
      .catch(error => {
        this.handleError(error);
      });
  }

  //// Email/Password Auth ////

  emailSignUp(email: string, password: string) {
    return this.afAuth.auth
      .createUserWithEmailAndPassword(email, password)
      .then(credential => {
        this.notify.update('Welcome new user!', 'success');
        return this.updateUserData(credential.user); // if using firestore
      })
      .catch(error => this.handleError(error));
  }

  emailLogin(email: string, password: string) {
    return this.afAuth.auth
      .signInWithEmailAndPassword(email, password)
      .then(credential => {
        this.notify.update('Welcome back!', 'success');
        return this.updateUserData(credential.user);
      })
      .catch(error => this.handleError(error));
  }

  // Sends email allowing user to reset password
  resetPassword(email: string) {
    const fbAuth = auth();

    return fbAuth
      .sendPasswordResetEmail(email)
      .then(() => this.notify.update('Password update email sent', 'info'))
      .catch(error => this.handleError(error));
  }

  signOut() {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  // If error, console log and notify user
  private handleError(error: Error) {
    console.error(error);
    this.notify.update(error.message, 'error');
  }

  private generateCardNumber() {
    var min = 4400000000000000;
    var max = 5500000000000000;
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num.toString();
  }

  private generateCvc() {
    var min = 100;
    var max = 999;
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num.toString();
  }

  // Sets user data to firestore after succesful login
  private updateUserData(user: User) {
    const userRef: AngularFirestoreDocument<User> = this.afs.doc(
      `users/${user.uid}`
    );

    const data: User = {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || 'nameless user',
      cardNumber: this.generateCardNumber(),
      cardCvc: this.generateCvc(),
      cardExpiration: null,
      cardValue: this.pending_value + 200,
      photoURL: user.photoURL || 'https://goo.gl/Fz9nrQ',
      giftsSent: 0,
      giftsAccepted: 0,
      valueSent: 0,
      giftsReceived: 0,
      valueReceived: 0
    };
    return userRef.set(data);
  }
}
