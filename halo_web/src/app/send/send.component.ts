import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GiftsService } from 'src/app/gifts.service';
import { Gifts } from 'src/app/gifts.model';

@Component({
  selector: 'send',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss']
})
export class SendComponent implements OnInit {
  componentproperty;
  email;
  gift_amount;
  gift_url;
  gift_type;
  submitted;
  formdata;

  gifts: Gifts[];
  constructor(private giftsService: GiftsService) { }

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
    this.gift_type = data.gift_type;

    let gifts: Gifts = new Gifts();
    gifts.timestamp=new Date();
    gifts.sender="Rehan";
    gifts.recipient="Jackie";
    gifts.amount=100;
    gifts.url="gift_url";

    console.log(this.gifts);
    this.create(gifts);

  }

  onToggleClick(data) {
      this.gift_type=data;
  }
}
