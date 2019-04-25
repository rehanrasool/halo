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
	gift: any;
	gift_id;
	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private giftsService: GiftsService
		) {
			// this.giftCollection=this.giftsService.getGiftById();
	}

	ngOnInit() {
		
		this.gift_id = this.route.snapshot.paramMap.get('id');
   		this.giftCollection=this.giftsService.getGiftById(this.gift_id);
		this.giftCollection.subscribe(val => this.gift = val.data());
    	// Create a reference to the file we want to download
        var storageRef = firebase.storage().ref();
        storageRef.child(this.gift_id + '.webm').getDownloadURL().then(function(url) {
        // `url` is the download URL for 'images/stars.jpg'
            var video = document.querySelector('video');
            video.src = url;
            video.loop = true;
        }).catch(function(error) {
        // Handle any errors
        });


	}

	giftAccepted() {
		let gift_accepted_button = document.getElementById('halo-decision-gift');
		let value_accepted_button = document.getElementById('halo-decision-value');

		console.log(this.gift);

		this.gift['accepted']="yes";
		this.giftsService.updateGift(this.gift_id, {'accepted':'yes'});

		var sender_gifts_accepted=this.giftsService.getUserById(this.gift['senderUid'])['giftsAccepted'];
		if (sender_gifts_accepted) {
			this.giftsService.updateUser(this.gift['senderUid'],{"giftsAccepted":sender_gifts_accepted+1});
		} else {
			this.giftsService.updateUser(this.gift['senderUid'],{"giftsAccepted":1});
		}
	}

	valueAccepted() {
		let value_accepted_button = document.getElementById('halo-decision-value');
		let gift_accepted_button = document.getElementById('halo-decision-gift');

		this.gift['accepted']="no";
		this.giftsService.updateGift(this.gift_id, {'accepted':'no'});

		var sender_values_accepted=this.giftsService.getUserById(this.gift['senderUid'])['valuesAccepted'];
		if (sender_values_accepted) {
			this.giftsService.updateUser(this.gift['senderUid'],{"valuesAccepted":sender_values_accepted+1});
		} else {
			this.giftsService.updateUser(this.gift['senderUid'],{"valuesAccepted":1});
		}
	}

	decisionDisabled() {
		return this.gift['accepted']=='yes' || this.gift['accepted']=='no';
	}


  // function replaceBackslash(s:string) {
  //   return s.replace("\\",'');
  // }

}
