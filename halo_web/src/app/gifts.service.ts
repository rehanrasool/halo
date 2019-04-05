import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Gifts } from 'src/app/gifts.model';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class GiftsService {

  constructor(private firestore: AngularFirestore) { }

  getGifts() {
    return this.firestore.collection('gifts').snapshotChanges();
  }

  getGiftsByUid(uid) {
    return this.firestore.collection('gifts', (ref) => ref.where("sender", '==', uid));
  }

  createGifts(gifts: Gifts){
    const time = firebase.firestore.FieldValue.serverTimestamp();
    gifts.timestamp=time;
    return this.firestore.collection('gifts').add(gifts);
  }

  updateGifts(gifts: Gifts, giftsId: string){
    // delete gifts.id;
    this.firestore.doc('gifts/' + giftsId).update(gifts);
  }

  deleteGifts(giftsId: string){
    this.firestore.doc('gifts/' + giftsId).delete();
  }
}
