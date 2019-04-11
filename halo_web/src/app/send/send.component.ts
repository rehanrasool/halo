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
  email;
  gift_amount;
  gift_url;
  submitted;
  formdata;

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

    this.user = JSON.parse(localStorage.getItem('user'));
  }

  create(gifts: Gifts){
     console.log(gifts);
     var data = JSON.parse(JSON.stringify(gifts));
     this.giftsService.createGifts(data);
  }

  onClickSubmit(data) {
    this.submitted = true;
    this.email = data.email;
    this.gift_amount = data.gift_amount;
    this.gift_url = data.gift_url;

    let gifts: Gifts = new Gifts();
    gifts.senderUid=this.user.uid;
    gifts.senderName=this.user.displayName;
    gifts.senderEmail=this.user.email;
    // gifts.recipientUid; get if user already exists
    gifts.recipientEmail=this.email;
    gifts.amount=this.gift_amount;
    gifts.url=this.gift_url;

    // console.log(this.gifts);
    this.create(gifts);
    // this.sendEmail();
  }

  sendEmail() {

      let url = 'https://us-central1-halo-ct.cloudfunctions.net/httpEmail'
      let params: URLSearchParams = new URLSearchParams();
      // let headers = new Headers({'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });

      params.set('to', this.email);
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
