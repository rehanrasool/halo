import { Component, OnInit, Injectable } from '@angular/core';
import { GiftsService } from 'src/app/gifts.service';
import { Gifts } from 'src/app/gifts.model';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  selector: 'account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  user;

  giftsCollection: AngularFirestoreCollection<any>;
  gifts: Observable<any[]>;

  constructor(private afs: AngularFirestore, private giftsService: GiftsService) {
    this.user=JSON.parse(localStorage.getItem('user'));
    // this.giftsCollection = this.afs.collection('gifts', (ref) => ref.where("sender", '==', this.user.uid));
    this.giftsCollection=this.giftsService.getGiftsBySender(this.user.uid);
  }

  ngOnInit() {
    this.gifts=this.getGifts();
  }

  getGifts(): Observable<any[]> {
    return this.giftsCollection.snapshotChanges().pipe(
      map((actions) => {
        return actions.map((a) => {
          const data = a.payload.doc.data();
          data.timestamp=data.timestamp.toDate(); // convert from firebase format
          return { id: a.payload.doc.id, ...data };
        });
      })
    );
  }
}
