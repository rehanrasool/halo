import { Component, OnInit } from '@angular/core';
import { GiftsService } from 'src/app/gifts.service';
import { Gifts } from 'src/app/gifts.model';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { RouterModule, Routes }  from '@angular/router';
@Component({
  selector: 'my-gifts',
  templateUrl: './my-gifts.component.html',
  styleUrls: ['./my-gifts.component.scss']
})
export class MyGiftsComponent implements OnInit {

  user;
  giftsCollection: AngularFirestoreCollection<any>;
  gifts: Observable<any[]>;

  constructor(private giftsService: GiftsService) {
  	this.user=JSON.parse(localStorage.getItem('user'));
    this.giftsCollection=this.giftsService.getGiftsByRecipient(this.user.email);
  }

  ngOnInit() {
  	this.gifts=this.getGifts();
  }
  goToDetails(gift) {
    console.log(AppRoutingModule);
    AppRoutingModule.navigateByUrl('/gift-details', gift);
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
