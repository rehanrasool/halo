import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GiftsService } from 'src/app/gifts.service';
import { Gifts } from 'src/app/gifts.model';
import * as firebase from "firebase";
import * as  RecordRTC from 'recordrtc';
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
  gift_type;
  submitted;
  formdata;
  video;
  firepad;
  self: this;
  gifts: Gifts[];

  constructor(private giftsService: GiftsService) { }

  ngOnInit() {
    // var self = this;
    this.formdata = new FormGroup({
     email: new FormControl("", Validators.compose([
      Validators.required,
      Validators.pattern("[^ @]*@[^ @]*")
      ]))
   });

    firebase.initializeApp({
      apiKey: 'AIzaSyB0AMMGGH2ImlwapyrgpKAs1szsNtWE3tE',
      databaseURL: 'https://halo-ct.firebaseio.com',
      storageBucket: 'gs://halo-ct.appspot.com'
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

      // setTimeout(function(){
        //   recorder.stopRecording(function(){
          //     var blob = recorder.blob;
          //     var url = URL.createObjectURL(blob);
          //     video.src = url;
          //     video.muted = false;

          //   });
          // }, 5 * 1000);
        }
        function handleError(error) {
          console.error('Error: ', error);
        }

        // var config = {
          //  apiKey: "AIzaSyB0AMMGGH2ImlwapyrgpKAs1szsNtWE3tE",
          //  authDomain: "halo-ct.firebaseapp.com",
          //  databaseURL: "https://halo-ct.firebaseio.com"
          // };

          // Get Firebase Database reference.
          var firepadRef = firebase.database().ref();

          // Create CodeMirror (with lineWrapping on).
          var codeMirror = CodeMirror(document.getElementById('firepad-container'), { lineWrapping: true });

          // Create Firepad (with rich text toolbar and shortcuts enabled).
          self.firepad = Firepad.fromCodeMirror(firepadRef, codeMirror,
            { richTextShortcuts: true, richTextToolbar: true, defaultText: 'Hello, World!' });




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

       onClickSubmit(data) {
        this.submitted = true;
        this.email = data.email;
        this.gift_amount = data.gift_amount;
        this.gift_url = data.gift_url;
        this.gift_type = data.gift_type;
        this.message = self.firepad.getHtml(); 
        let gifts: Gifts = new Gifts();

        gifts.senderUid=this.user.uid;
        gifts.senderEmail=this.user.email;
        // gifts.recipientUid; get if user already exists
        gifts.recipientEmail=this.email;
        gifts.amount=this.gift_amount;
        gifts.url=this.gift_url;
        gifts.video = self.video;
        gifts.message = self.firepad.getHtml(); 
        console.log(gifts);
          this.create(gifts);
        }

        onToggleClick(data) {
          this.gift_type=data;
        }




      }
