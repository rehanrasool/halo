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
    this.giftsCollection=this.giftsService.getGiftsCollection(10);
  }

  ngOnInit() {
    this.gifts=this.giftsCollection.snapshotChanges().pipe(
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
