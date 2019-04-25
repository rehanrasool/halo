import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Gifts } from 'src/app/gifts.model';
import * as firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class GiftsService {

  constructor(private firestore: AngularFirestore) { }

  // --------------------------------- Gifts --------------------------------- //
  getGifts() {
    return this.firestore.collection('gifts').snapshotChanges();
  }

  getGiftsCollection(entries) {
    return this.firestore.collection('gifts', (ref) => ref.orderBy("timestamp", "desc").limit(entries));
  }

  getGiftsBySender(uid) {
    return this.firestore.collection('gifts', (ref) => ref.where("senderUid", '==', uid).orderBy("timestamp", "desc"));
  }

  getGiftById(id) {
    console.log(this.firestore.doc('gifts/' + id).get());
    return this.firestore.doc('gifts/' + id).get();
    // return this.firestore.collection('gifts', (ref) => ref.where("senderEmail", '==', 'mv456@cornell.edu'));
  }

  getGiftsByRecipient(email) {
    return this.firestore.collection('gifts', (ref) => ref.where("recipientEmail", '==', email).orderBy("timestamp", "desc"));
  }

  createGifts(gifts: Gifts){
    const time = firebase.firestore.FieldValue.serverTimestamp();
    gifts.timestamp=time;
    return this.firestore.collection('gifts').add(gifts);
  }

  updateGift(giftsId: string, value_map: any){
    // delete gifts.id;
    this.firestore.doc('gifts/' + giftsId).update(value_map);
  }

  deleteGifts(giftsId: string){
    this.firestore.doc('gifts/' + giftsId).delete();
  }

  // --------------------------------- Users --------------------------------- //
  getUsers() {
    return this.firestore.collection('users').snapshotChanges();
  }

  getUsersOrderBy(orderby, entries=5) {
    return this.firestore.collection('users', (ref) => ref.orderBy(orderby, "desc").limit(entries)).snapshotChanges();
  }

  getUserById(id) {
    return this.firestore.doc('users/' + id).get();
  }

  updateUser(uid: string, value_map: any){
    console.log("update user val: " + uid);
    this.firestore.doc('users/' + uid).update(value_map);
  }

  // ------------------------------ Users Search ------------------------------ //
  getUsersSearch() {
    return this.firestore.collection('users_search').snapshotChanges();
  }

  createUsersSearch(users){
    return this.firestore.collection('users_search').add(users);
  }

  // ---------------------------- Pending Transfers ---------------------------- //
  getPendingTransfers() {
    return this.firestore.collection('pending_transfers').snapshotChanges();
  }

  createPendingTransfer(tx){
    return this.firestore.collection('pending_transfers').add(tx);
  }

  deletePendingTransfer(txId: string){
    this.firestore.doc('pending_transfers/' + txId).delete();
  }

}
