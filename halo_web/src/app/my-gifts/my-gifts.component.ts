import { Component, OnInit } from '@angular/core';
import { GiftsService } from 'src/app/gifts.service';
import { Gifts } from 'src/app/gifts.model';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { RouterModule, Routes, Router }  from '@angular/router';

@Component({
  selector: 'my-gifts',
  templateUrl: './my-gifts.component.html',
  styleUrls: ['./my-gifts.component.scss']
})
export class MyGiftsComponent implements OnInit {

  user;
  giftsCollection: AngularFirestoreCollection<any>;
  gifts: Observable<any[]>;

  constructor(private giftsService: GiftsService, private router: Router) {
  	this.user=JSON.parse(localStorage.getItem('user'));
    this.giftsCollection=this.giftsService.getGiftsByRecipient(this.user.email);
  }

  ngOnInit() {
  	this.gifts=this.getGifts();
  }

  goToDetails(gift) {
    this.router.navigateByUrl('/gift-details', gift);
  }

  getGifts(): Observable<any[]> {
    return this.giftsCollection.snapshotChanges().pipe(
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

  if (seconds < 0) {
    return "0 seconds ago";
  } else {
    return Math.floor(seconds) + " seconds ago";
  }
}