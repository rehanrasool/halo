import { Component, OnInit, Injectable, AfterContentInit, Pipe } from '@angular/core';
import { GiftsService } from 'src/app/gifts.service';
import { Gifts } from 'src/app/gifts.model';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit, AfterContentInit {
  user;

  all_users;
  all_gifts;

  // total_value;

  users_order_gifts_sent;
  users_order_gifts_received;
  users_order_value_sent;
  users_order_value_received;

  skip_users=["rr756@cornell.edu", "bf326@cornell.edu", "ip235@cornell.edu", "mv456@cornell.edu"];
  // skip_users=[];

  constructor(private afs: AngularFirestore, private giftsService: GiftsService) {
    this.user=JSON.parse(localStorage.getItem('user'));
  }

  ngOnInit() {
    this.giftsService.getUsers().subscribe(data => {
      this.all_users = data.map(e => {
        return {
          ...e.payload.doc.data()
        }
      })
    });

    this.giftsService.getUsersOrderBy("giftsSent").subscribe(data => {
      var index=0;
      this.users_order_gifts_sent = data.map(e => {
        if (this.skip_users.includes(e.payload.doc.data()['email'])) {
          // console.log(e.payload.doc.data());
          return {}
        } else {
            index++;
            return {
            index,
            ...e.payload.doc.data()
          }
        }
      })
    });

    this.giftsService.getUsersOrderBy("giftsReceived").subscribe(data => {
      var index=0;
      this.users_order_gifts_received = data.map(e => {
        if (this.skip_users.includes(e.payload.doc.data()['email'])) {
          // console.log(e.payload.doc.data());
          return {}
        } else {
            index++;
            return {
            index,
            ...e.payload.doc.data()
          }
        }
      })
    });

    this.giftsService.getUsersOrderBy("valueSent").subscribe(data => {
      var index=0;
      this.users_order_value_sent = data.map(e => {
        if (this.skip_users.includes(e.payload.doc.data()['email'])) {
          // console.log(e.payload.doc.data());
          return {}
        } else {
            index++;
            return {
            index,
            ...e.payload.doc.data()
          }
        }
      })
    });

    this.giftsService.getUsersOrderBy("valueReceived").subscribe(data => {
      var index=0;
      this.users_order_value_received = data.map(e => {
        if (this.skip_users.includes(e.payload.doc.data()['email'])) {
          // console.log(e.payload.doc.data());
          return {}
        } else {
            index++;
            return {
            index,
            ...e.payload.doc.data()
          }
        }
      })
    });

    this.giftsService.getGifts().subscribe(data => {
      this.all_gifts = data.map(e => {
        return {
          ...e.payload.doc.data()
        }
      })
    });
  }

  ngAfterContentInit() {
  }

}
