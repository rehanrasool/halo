import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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

  constructor() { }

  ngOnInit() {
    this.formdata = new FormGroup({
         email: new FormControl("", Validators.compose([
            Validators.required,
            Validators.pattern("[^ @]*@[^ @]*")
         ]))
      });
  }

  onClickSubmit(data) {
    this.submitted = true;
    this.email = data.email;
    this.gift_amount = data.gift_amount;
    this.gift_url = data.gift_url;
    this.gift_type = data.gift_type;
  }

  onToggleClick(data) {
      this.gift_type=data;
  }
}
