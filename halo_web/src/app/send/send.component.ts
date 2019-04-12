import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Http, Headers, Response, URLSearchParams } from '@angular/http';

import { HttpClient } from '@angular/common/http';


// import { Http, Response, URLSearchParams } from '@angular/http';
// import { HttpClient, HttpHeaders } from "@angular/common/http";
import {Observable} from 'rxjs';

import { GiftsService } from 'src/app/gifts.service';
import { Gifts } from 'src/app/gifts.model';

@Component({
  selector: 'send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnInit {
  componentproperty;

  user;
  recipientEmail;
  gift_amount;
  gift_url;

  submitted;
  formdata;

  all_users;

  gifts: Gifts[];
  constructor(private giftsService: GiftsService, private http: Http) { }

  ngOnInit() {
    this.formdata = new FormGroup({
         email: new FormControl("", Validators.compose([
            Validators.required,
            Validators.pattern("[^ @]*@[^ @]*")
         ]))
      });

    this.giftsService.getGifts().subscribe(data => {
      this.gifts = data.map(e => {
        return {
          ...e.payload.doc.data()
        } as Gifts;
      })
    });

    this.giftsService.getUsers().subscribe(data => {
      this.all_users = data.map(e => {
        return {
          ...e.payload.doc.data()
        }
      })
    });

    this.user = JSON.parse(localStorage.getItem('user'));
  }

  create(gifts: Gifts){
     console.log(gifts);
     var data = JSON.parse(JSON.stringify(gifts));
     this.giftsService.createGifts(data);
  }

  getUser(email) {
    var i;
    for (i=0; i<this.all_users.length; i++) {
      if (this.all_users[i]['email'] == email) {
        return this.all_users[i];
      }
    }
    return null;
  }

  transferValue() {
    var sender=this.getUser(this.user.email);
    var recipient=this.getUser(this.recipientEmail);

    // deduct from sender
    var newSenderVal=sender['cardValue']-this.gift_amount;
    this.giftsService.updateUserValue(sender['uid'], newSenderVal);

    if (recipient != null) { // add value to recipient
      var newRecipientVal=recipient['cardValue']+this.gift_amount;
      this.giftsService.updateUserValue(recipient['uid'], newRecipientVal);
    } else { // add to pending (added when user signs up)
      var tx = {};
      tx['from']=this.user.email;
      tx['to']=this.recipientEmail;
      tx['amount']=this.gift_amount;

      this.giftsService.createPendingTransfer(tx);
    }
  }

  onClickSubmit(data) {
    this.submitted = true;
    this.recipientEmail = data.email;
    this.gift_amount = data.gift_amount;
    this.gift_url = data.gift_url;

    let gift: Gifts = new Gifts();
    gift.senderUid=this.user.uid;
    gift.senderName=this.user.displayName;
    gift.senderEmail=this.user.email;
    // gift.recipientUid; get if user already exists
    gift.recipientEmail=this.recipientEmail;
    gift.amount=this.gift_amount;
    gift.url=this.gift_url;

    // console.log(this.gifts);

    this.create(gift);
    this.transferValue();
    this.sendEmail();
  }

  sendEmail() {

      let url = 'https://us-central1-halo-ct.cloudfunctions.net/httpEmail'
      let params: URLSearchParams = new URLSearchParams();
      // let headers = new Headers({'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });

      params.set('to', this.recipientEmail);
      params.set('from', "noreply@halo-ct.firebaseapp.com");
      params.set('subject', "Halo! You got a gift from " + this.user.displayName);
      params.set('content', `Wow! You've just received a gift from ` + this.user.displayName
                            + `!\n\n<Add details>\n\nSign up at halo-ct.firebaseapp.com to redeem!`);

      return this.http.post(url, params)
                      .toPromise()
                      .then( res => {
                        console.log(res)
                      })
                      .catch(err => {
                        console.log(err)
                      })

    }

}
