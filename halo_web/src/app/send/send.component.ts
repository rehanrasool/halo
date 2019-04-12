import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Http, Headers, Response, URLSearchParams } from '@angular/http';

import { HttpClient } from '@angular/common/http';


// import { Http, Response, URLSearchParams } from '@angular/http';
// import { HttpClient, HttpHeaders } from "@angular/common/http";
import {Observable} from 'rxjs';

import { GiftsService } from 'src/app/gifts.service';
import { Gifts } from 'src/app/gifts.model';
import * as firebase from "firebase";
import * as  RecordRTC from 'recordrtc';
@Component({
  selector: 'send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnInit, AfterContentInit() {
  componentproperty;

  user;
  recipientEmail;
  gift_amount;
  gift_url;

  submitted;
  failed;
  formdata;

  all_users;
  sender_card_value;

  video;
  firepad;
  self: this;

  gifts: Gifts[];
  constructor(private giftsService: GiftsService, private http: Http) { }

  ngOnInit() {
    this.formdata = new FormGroup({
     email: new FormControl("", Validators.compose([
      Validators.required,
      Validators.pattern("[^ @]*@[^ @]*")
      ]))
   });

    // var captureVideoButton =
    // document.querySelector('.capture-button');
    let captureVideoButton: HTMLElement = document.getElementsByClassName('capture-button')[0] as HTMLElement;
    var stopButton = document.querySelector('#stop-button');
    var video = document.querySelector('#cssfilters video');

    // let video: HTMLElement = document.querySelector('#cssfilters video')[0] as HTMLElement;
    var watermark = document.querySelector('a.powered-by-firepad');
    var recorder;

    // watermark.className = 'notVisible'

    let filterIndex = 0;
    const filters = [
      'grayscale',
      'sepia',
      'blur',
      'brightness',
      'contrast',
      'hue-rotate',
      'hue-rotate2',
      'hue-rotate3',
      'saturate',
      'invert',
      ''
    ];

    captureVideoButton.onclick = function() {
      const constraints = {
        video: {width: {min: 1280}, height: {min: 720}}
      };
      navigator.mediaDevices.getUserMedia(constraints).
      then(handleSuccess).catch(handleError);
    };

    video.onclick = function() {
      video.className = filters[filterIndex++ % filters.length];
    };

    stopButton.onclick = function() {
      recorder.stopRecording(function(){
        var blob = recorder.blob;
        var url = URL.createObjectURL(blob);
        video.srcObject = null;
        video.loop = true;

        video.src = url;
        video.muted = false;
        self.video = blob;
      });
    }

    function handleSuccess(stream) {
      recorder = RecordRTC(stream, {type:'video'})
      recorder.startRecording();
      var video = document.querySelector('#cssfilters video');
      video.srcObject = stream;
    }

    function handleError(error) {
      console.error('Error: ', error);
    }

<<<<<<< HEAD
    // Get Firebase Database reference.
=======
      
   
  }

  ngAfterContentInit() {
    console.log("s");
     // Get Firebase Database reference.
>>>>>>> 69a8fe3e599837abf430c8cb98ac0b5c17b54a24
    var firepadRef = firebase.database().ref();

    // Create CodeMirror (with lineWrapping on).
    var codeMirror = CodeMirror(document.getElementById('firepad-container'), { lineWrapping: true });

    // Create Firepad (with rich text toolbar and shortcuts enabled).
    self.firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
      { richTextShortcuts: true, richTextToolbar: true, defaultText: 'Hello, World!' });

    this.giftsService.getUsers().subscribe(data => {
      this.all_users = data.map(e => {
        return {
          ...e.payload.doc.data()
        }
      })
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

  // create(gifts: Gifts){
  //    console.log(gifts);
  //    var data = JSON.parse(JSON.stringify(gifts));
  //    this.giftsService.createGifts(data);
  // }

  create(gifts: Gifts){
    var data = JSON.parse(JSON.stringify(gifts));
    this.giftsService.createGifts(data).then(function(data){
    var storageRef = firebase.storage().ref(data.id + ".webm");

    // var storageRef = firebase.storage().ref("videos/" + gifts.senderEmail + "/" + gifts.recipientEmail + "/" + data.id + ".webm");
    var file = new File([self.video], data.id + ".webm", {
      type: 'video/webm'
    });
    var uploadTask = storageRef.put(file);
    });
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
    this.sender_card_value=sender['cardValue'];
    var newSenderVal=this.sender_card_value-this.gift_amount;
    if (newSenderVal < 0) {
      return false;
    }
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

    return true;
  }

  onClickSubmit(data) {
    this.recipientEmail = data.email;
    this.gift_amount = data.gift_amount;
    this.gift_url = data.gift_url;
    this.message = self.firepad.getHtml();

    let gift: Gifts = new Gifts();
    gift.senderUid=this.user.uid;
    gift.senderName=this.user.displayName;
    gift.senderEmail=this.user.email;
    // gift.recipientUid; get if user already exists
    gift.recipientEmail=this.recipientEmail;
    gift.amount=this.gift_amount;
    gift.url=this.gift_url;
    gift.video = self.video;
    gift.message = self.firepad.getHtml(); 

    // console.log(this.gifts);

    if (this.transferValue()) {
      this.create(gift);
      this.sendEmail();
      this.submitted=true;
      this.failed=false;
    } else {
      this.submitted=false;
      this.failed=true;
    }
  }

  sendEmail() {

      let url = 'https://us-central1-halo-ct.cloudfunctions.net/httpEmail'
      let params: URLSearchParams = new URLSearchParams();
      // let headers = new Headers({'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });

      var content_head=`<body style="font: 16px Assistant, sans-serif;">` +
                       `<center>` +
                       `<h1 style="color:green">Hey!</h1>`;

      var content_tail=`<h4><a style="color:orange" href="halo-ct.firebaseapp.com" target="_blank">Check It Out</a></h4>` +
                       `<p style="color:black">Remember, you can always decide to add the value of your gift to your Halo card instead.<br/>` +
                       `Either way, be sure to say thanks for the gift :)</p>` +
                       `<p style="color:black"><strong>Don’t know about Halo?</strong> Halo is an awesome gift giving platform that allows you to get gifts from multiple friends on a single virtual card. <a style="color:green" href="halo-ct.firebaseapp.com" target="_blank">Learn more here.</a></p>` +
                       `<p style="color:black"><strong>Don’t have a Halo account?</strong> To redeem your gift, you’ll need to <a style="color:purple" href="halo-ct.firebaseapp.com" target="_blank">create an account</a> on Halo using this email address.</p>` +
                       `</center>`;

      var content_title1=`<h3>Your day just got a little better.<br/><br/>` +
                         `<span style="color:teal">` + this.user.displayName + `</span> has just sent you a gift on Halo!</h3>`;

      var content_title2=`<h3>Oh Snap! You just got a gift from <span style="color:teal">` + this.user.displayName + `</span> on Halo!`;

      var content_title3=`<h3>Today’s your lucky day.<br/><br/>` +
                         `<span style="color:teal">` + this.user.displayName + `</span> just sent you a gift on Halo!</h3>`;

      var content_gif1=`<div align="center">` +
                       `<img src="https://media.giphy.com/media/kKo2x2QSWMNfW/giphy.gif" alt="Halo Gif"></a></div>`;

      var content_gif2=`<div align="center">` +
                       `<img src="https://media.giphy.com/media/5Y2bU7FqLOuzK/giphy.gif" alt="Halo Gif"></a></div>`;

      var content_gif3=`<div align="center">` +
                       `<img src="https://media.giphy.com/media/arXSjaMhRnKV2/giphy.gif" alt="Halo Gif"></a></div>`;

      var content_titles=[content_title1,content_title2,content_title3];
      var content_gifs=[content_gif1,content_gif2,content_gif3];

      var random_title = content_titles[Math.floor(Math.random() * content_titles.length)];
      var random_gif = content_gifs[Math.floor(Math.random() * content_gifs.length)];

      var content=content_head+random_title+random_gif+content_tail;

      params.set('to', this.recipientEmail);
      params.set('from', "noreply@halo-ct.firebaseapp.com");
      params.set('subject', "Halo! You got a gift from " + this.user.displayName);
      params.set('content', content);

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