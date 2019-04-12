import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { GiftsService } from 'src/app/gifts.service';
import { map } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

@Component({
	selector: 'gift-details',
	templateUrl: './gift-details.component.html',
	styleUrls: ['./gift-details.component.scss']
})
export class GiftDetailsComponent implements OnInit {
	giftCollection: Observable<any>;
	gift: Observable<any[]>;
	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private giftsService: GiftsService
		) {
			// this.giftCollection=this.giftsService.getGiftById();

	}

	ngOnInit() {
		
		let id = this.route.snapshot.paramMap.get('id');
   		this.giftCollection=this.giftsService.getGiftById(id);
        // console.log(giftCollection);
   		// this.giftCollection.subscribe(val => this.gift = val );

        this.giftCollection.subscribe(val => this.gift = val.data());

    	// Create a reference to the file we want to download
        var storageRef = firebase.storage().ref();
        // var storageRef = firebase.storage().refFromURL("gs://halo-ct.appspot.com/"+id);
        console.log(storageRef);
        storageRef.child(id + '.webm').getDownloadURL().then(function(url) {
        // `url` is the download URL for 'images/stars.jpg'
            console.log(url);
            var video = document.querySelector('video');
            video.src = url;
            video.loop = true;
        }).catch(function(error) {
        // Handle any errors
        });


	}


  // function replaceBackslash(s:string) {
  //   return s.replace("\\",'');
  // }

}
