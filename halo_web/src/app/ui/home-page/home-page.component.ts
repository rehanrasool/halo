import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../core/auth.service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

import { GiftsService } from 'src/app/gifts.service';
import { Gifts } from 'src/app/gifts.model';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  giftsCollection: AngularFirestoreCollection<any>;
  gifts: Observable<any[]>;

  constructor(private giftsService: GiftsService, public auth: AuthService) {
    this.giftsCollection=this.giftsService.getGiftsCollection(20);
  }

  ngOnInit() {
    this.gifts=this.giftsCollection.snapshotChanges().pipe(
      map((actions) => {
        return actions.map((a) => {
          const data = a.payload.doc.data();
          data.timestamp=timeSince(data.timestamp.toDate()); // convert from firebase format
          return { id: a.payload.doc.id, ...data };
        });
      })
    );
  }
}

function timeSince(date) {

  var seconds = Math.floor((+new Date() - date) / 1000);

  var interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + " years ago";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months ago";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days ago";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours ago";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}