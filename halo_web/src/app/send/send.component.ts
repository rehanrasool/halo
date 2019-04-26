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
  email_to_yourself;
  invalid_url;
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
    this.email_to_yourself=false;
    this.invalid_url=false;
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
    if (this.refreshed_options || this.users_search==null)
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
     this.firepad = Firepad.fromCodeMirror(firepadRef, codeMirror, { richTextShortcuts: true, richTextToolbar: true});
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

      if (!validateUrl(data.gift_url)) {
        this.invalid_url=true;
        return;
      }

      if (this.recipientEmail==this.user.email) {
        this.email_to_yourself=true;
        return;
      }

      this.email_incorrect=false;
      this.email_to_yourself=false;
      this.invalid_url=false;

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
      gift.opened = false;

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

      var content_head=`<center>` +
                       `<h1 style="color:#4e61ff">Hey `+this.recipientName.substring(0,this.recipientName.search(" "))+`!</h1>`;

      var content_tail=`<h2><a style="color:#f2c94c" href="https://halo-ct.firebaseapp.com/" target="_blank">Check It Out</a></h2>` +
                       `<br/>` +
                       `<h4>Your Halo Gift Card comes with:</h4>` +
                       `<ul style="list-style-type: none;">` +
                       `<li>😊 A personalized video and text message by the gifter</li>` +
                       `<li>🎁 A product or experience chosen specifically for you</li>` +
                       `<li>💳 The flexibility to accept and receive the gift or spend the value anywhere</li>` +
                       `</ul>` +
                       `<br/>` +
                       `<h4>You have received this virtual gift as part of the Cornell Tech Gifting Contest. This is how it works:</h4>`+
                       `<ul style="list-style-type: none;">`+
                       `<li>💵 Everyone who signs up gets $200 in Virtual Halo Money</li>`+
                       `<li>🎁 Send your classmates virtual gifts with personalized messages</li>`+
                       `<li>🏆 At the end of the contest, the best gifter gets a real world gift (to be revealed later)</li>`+
                       `</ul>`+
                       `<br/>` +
                       `<h4>Check out our website at <a style="color:#f2c94c" href="http://halo.gift" target="_blank">halo.gift</h4>`+
                       `<h5><span style="font-style: italic;">Disclaimer: The gift has no monetary value. It is for demonstrative purposes only.</span></h4>`;

      var content_title1=`<h3>Your day just got a little better.<br/><br/>` +
      `<span style="color:#4e61ff">` + this.user.displayName + `</span> has just sent you a gift on Halo!</h3>`;

      var content_title2=`<h3>Oh Snap! You just got a gift from <span style="color:#4e61ff">` + this.user.displayName + `</span> on Halo!`;

      var content_title3=`<h3>Today’s your lucky day.<br/><br/>` +
      `<span style="color:#4e61ff">` + this.user.displayName + `</span> just sent you a gift on Halo!</h3>`;

      var content_gif1=`<div align="center">` +
      `<img src="https://media.giphy.com/media/kKo2x2QSWMNfW/giphy.gif" alt="Halo Gif"></a></div>`;

      var content_gif2=`<div align="center">` +
      `<img src="https://media.giphy.com/media/5Y2bU7FqLOuzK/giphy.gif" alt="Halo Gif"></a></div>`;

      var content_gif3=`<div align="center">` +
      `<img src="https://media.giphy.com/media/l4hLGvgARVqVFLlIc/giphy.gif" alt="Halo Gif"></a></div>`;

      var content_titles=[content_title1,content_title2,content_title3];
      var content_gifs=[content_gif1,content_gif2,content_gif3];

      var random_title = content_titles[Math.floor(Math.random() * content_titles.length)];
      var random_gif = content_gifs[Math.floor(Math.random() * content_gifs.length)];

      var content=content_head+random_title+random_gif+content_tail;

      params.set('to', this.recipientEmail);
      params.set('from', "noreply@halo-ct.firebaseapp.com");
      params.set('fromname', "Halo");
      params.set('subject', "You got a gift from " + this.user.displayName + " on Halo!");
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

  function validateUrl(userInput) {
      var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
      return urlregex.test(userInput);
  }
