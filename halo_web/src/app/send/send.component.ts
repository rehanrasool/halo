import { Component, OnInit, AfterContentInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { Http, Headers, Response, URLSearchParams } from '@angular/http';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { HttpClient } from '@angular/common/http';

// import { Http, Response, URLSearchParams } from '@angular/http';
// import { HttpClient, HttpHeaders } from "@angular/common/http";
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

import { GiftsService } from 'src/app/gifts.service';
import { Gifts } from 'src/app/gifts.model';
import * as firebase from "firebase";
import * as  RecordRTC from 'recordrtc';

declare var CodeMirror: any;
declare var Firepad: any;
declare var self: any;

@Component({
  selector: 'send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})

export class SendComponent implements OnInit, AfterContentInit {
  myControl = new FormControl();
  options : string[];
  filteredOptions: Observable<string[]>;

  prefilled_recipient;

  componentproperty;
  notPreview;
  user;
  recipientEmail;
  recipientName;
  gift_amount;
  gift_url;

  submitted;
  failed;
  email_incorrect;
  refreshed_options;
  formdata;

  all_users;
  sender_card_value;

  message;
  video;
  firepad;
  self: this;

  gifts: Gifts[];
  users_search;
  constructor(private giftsService: GiftsService, private http: Http, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.notPreview = true;
    this.submitted=false;
    this.failed=false;
    this.email_incorrect=false;
    this.refreshed_options=false;

    this.formdata = new FormGroup({
     email: new FormControl("", Validators.compose([
      Validators.required,
      Validators.pattern("[^ @]*@[^ @]*")
      ]))
   });

    // var captureVideoButton =
    // document.querySelector('.capture-button');
    let captureVideoButton: HTMLElement = document.getElementsByClassName('capture-button')[0] as HTMLElement;
    var stopButton: HTMLElement = document.querySelector('#stop-button') as HTMLElement;
    var disableLoop: HTMLElement = document.querySelector('#loop-button') as HTMLElement;
    var video: HTMLElement = document.querySelector('#cssfilters video') as HTMLElement;
    var videoElement: HTMLMediaElement = video as HTMLMediaElement;
    var iconMute:  HTMLElement = document.querySelector('#icon-mute') as HTMLElement;
    var muteButton:  HTMLElement = document.querySelector('#mute-button') as HTMLElement;
    videoElement.muted = true;


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
      videoElement.muted = true;
      const constraints = {
        audio: true,
        video: {width: {min: 1280}, height: {min: 720}}

      };
      navigator.mediaDevices.getUserMedia(constraints).
      then(handleSuccess).catch(handleError);

      // constraints = {
        //    audio: true

        // };
        // navigator.mediaDevices.getUserMedia(constraints).
        // then(handleSuccess).catch(handleError);
      };

      video.onclick = function() {
        video.className = filters[filterIndex++ % filters.length];
      };
      var qq;
      var cc;
      stopButton.onclick = function() {
        recorder.stopRecording(function(){
          var blob = recorder.blob;
          var url = URL.createObjectURL(blob);
          qq = videoElement.srcObject;
          videoElement.muted = false;
          cc = url;
          stopStream();
          videoElement.srcObject = null;
          videoElement.src = url;
          self.video = blob;
        });
      }

      function stopStream() {
        // @ts-ignore
        if (!window.streamReference) return;
        // @ts-ignore

        window.streamReference.getAudioTracks().forEach(function(track) {
          track.stop();
        });
        // @ts-ignore

        window.streamReference.getVideoTracks().forEach(function(track) {
          track.stop();
        });
        // @ts-ignore

        window.streamReference = null;
      }

      disableLoop.onclick = function() {
       var loopLabel : HTMLElement = document.querySelector('#loop-label') as HTMLElement;
       videoElement.loop = !videoElement.loop;

       if(videoElement.loop) {
        loopLabel.innerText = "Loop OFF"
        // videoElement.srcObject = qq;
        // videoElement.src = cc;
        videoElement.src = cc;
        videoElement.loop = true;

      } else{
        loopLabel.innerText = "Loop ON"
        videoElement.loop = false;

      }
    }

    function handleSuccess(stream) {
      // @ts-ignore
      window.streamReference = stream;
      recorder = RecordRTC(stream, {type:'video'})
      recorder.startRecording();
      var video = document.querySelector('#cssfilters video');
      videoElement.srcObject = stream;
    }

    function handleError(error) {
      console.error('Error: ', error);
    }

    let email_input = document.getElementById("email");
    email_input.addEventListener("focus", (e:Event) => this.updateOptions());
    this.prefilled_recipient=this.route.snapshot.paramMap.get('id');
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  updateOptions(){
    console.log("update user search");

    // temporary code used to insert users_search data
    // let json_data=[
    //   ["Rehan","Rasool","rr756@cornell.edu"  ],
    // ];

    // var i;
    // for (i=0; i<json_data.length; i++) {
      //   console.log(json_data[i]);
      //   var user_data='{"first_name": "'+json_data[i][0]+'","last_name": "'+json_data[i][1]+'","email": "'+json_data[i][2]+'"}';
      //   this.giftsService.createUsersSearch(JSON.parse(user_data));
      // }

    // if (this.refreshed_options || !this.user.email.endsWith("@cornell.edu")) // external people shouldn't be able to see Cornell emails
    if (this.refreshed_options)
      return;

      // console.log(this.users_search);

      this.options = [];

      var j;
      var option;
      for (j=0; j<this.users_search.length; j++) {
        option=this.users_search[j]['first_name'] + " " + this.users_search[j]['last_name'] + " <" + this.users_search[j]['email'] + ">";
        this.options.push(option);
      }

      this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
        );

      this.refreshed_options=true;
    }

    ngAfterContentInit() {
     // Get Firebase Database reference.
     var r = Math.random().toString(36).substring(7);
     var firepadRef = firebase.database().ref(r);
     // Create CodeMirror (with lineWrapping on).
     var codeMirror = CodeMirror(document.getElementById('firepad-container'), { lineWrapping: true });

     // Create Firepad (with rich text toolbar and shortcuts enabled).
     this.firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
      { richTextShortcuts: true, richTextToolbar: true);
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

     this.giftsService.getUsersSearch().subscribe(data => {
      this.users_search = data.map(e => {
        return {
          ...e.payload.doc.data()
        }
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

      if (sender===recipient)
        return true;

      if (recipient != null) { // add value to recipient and update stats
        var newRecipientVal=recipient['cardValue']+this.gift_amount;
        var recipient_gifts_received=(recipient['giftsReceived']==null ? 1 : recipient['giftsReceived']) + 1;
        var recipient_value_received=(recipient['valueReceived']==null ? this.gift_amount : recipient['valueReceived']) + this.gift_amount;
        this.giftsService.updateUser(recipient['uid'], {"cardValue":newRecipientVal, "giftsReceived":recipient_gifts_received, "valueReceived":recipient_value_received});
        // this.giftsService.updateUser(recipient['uid'], {});
      } else { // add to pending (added when user signs up)
        var tx = {};
        tx['from']=this.user.email;
        tx['to']=this.recipientEmail;
        tx['amount']=this.gift_amount;

        this.giftsService.createPendingTransfer(tx);
      }

      // update stats for sender
      var sender_gifts_sent=(sender['giftsSent']==null ? 1 : sender['giftsSent']) + 1;
      var sender_value_sent=(sender['valueSent']==null ? this.gift_amount : sender['valueSent']) + this.gift_amount;
      this.giftsService.updateUser(sender['uid'], {"cardValue":newSenderVal, "giftsSent":sender_gifts_sent, "valueSent":sender_value_sent});

      return true;
    }

    onClickSubmit(data) {
      // this.recipientEmail = data.email;
      if (this.myControl.value.search("<")!=-1 && this.myControl.value.search(">")!=-1) {
        this.recipientEmail = this.myControl.value.substring(this.myControl.value.search("<")+1,this.myControl.value.search(">"));
        this.recipientName = this.myControl.value.substring(0,this.myControl.value.search("<")-1);
      } else {
        this.recipientEmail = this.myControl.value;
        this.recipientName = "";
      }

      if (!validateEmail(this.recipientEmail)) {
        this.email_incorrect=true;
        return;
      }

      this.email_incorrect=false;

      this.gift_amount = data.gift_amount;
      this.message = data.message;
      this.gift_url = data.gift_url;
      this.message = this.firepad.getHtml();
      let gift: Gifts = new Gifts();
      gift.senderUid=this.user.uid;
      gift.senderName=this.user.displayName;
      gift.senderEmail=this.user.email;
      // gift.recipientUid; get if user already exists
      gift.recipientName=this.recipientName;
      gift.recipientEmail=this.recipientEmail;
      gift.amount=this.gift_amount;
      gift.message=this.message;
      gift.url=this.gift_url;
      gift.video = self.video;
      gift.message = this.firepad.getHtml();
      gift.accepted = "";

      // console.log(this.gifts);

      if (this.transferValue()) {
        this.create(gift);
        // this.sendEmail();
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
                       `<h1 style="color:green">Hey `+this.recipientName.substring(0,this.recipientName.search(" "))+`!</h1>`;

      var content_tail=`<h4><a style="color:orange" href="https://halo-ct.firebaseapp.com/" target="_blank">Check It Out</a></h4>` +
                       `<p style="color:black">Remember, you can always decide to add the value of your gift to your Halo card instead.<br/>` +
                       `Either way, be sure to say thanks for the gift :)</p>` +
                       `<p style="color:black"><strong>Don’t know about Halo?</strong> Halo is an awesome gift giving platform that allows you to get gifts from multiple friends on a single virtual card. <a style="color:green" href="halo-ct.firebaseapp.com" target="_blank">Learn more here.</a></p>` +
                       `<p style="color:black"><strong>Don’t have a Halo account?</strong> To redeem your gift, you’ll need to <a style="color:purple" href="https://halo-ct.firebaseapp.com/" target="_blank">create an account</a> on Halo using this email address.</p>` +
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

  function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }