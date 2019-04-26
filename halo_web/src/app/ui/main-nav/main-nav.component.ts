import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';

import { GiftsService } from 'src/app/gifts.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

@Component({
  selector: 'main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent {
  user;
  gifts;
  gift_count: any;

  show = false;

  constructor(public auth: AuthService, private giftsService: GiftsService) { }

  toggleCollapse() {
    this.show = !this.show;
  }

  ngOnInit() {
    this.user=JSON.parse(localStorage.getItem('user'));

    this.giftsService.getGiftsByRecipient(this.user.email).snapshotChanges().subscribe(data => {
      this.gift_count=0;
      this.gifts = data.map(e => {
        if (!e.payload.doc.data()['opened'])
          this.gift_count+=1;
        return {
          ...e.payload.doc.data()
        }
      })
    });

  }

}
