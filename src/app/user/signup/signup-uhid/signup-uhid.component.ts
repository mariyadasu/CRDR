import { Component, OnInit } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';

import { AAAuthService } from '@aa/services/auth.service';

import { UHID } from '@aa/structures/user.interface';

@Component({
  selector: 'app-signup-uhid',
  templateUrl: './signup-uhid.component.html',
  styleUrls: ['./signup-uhid.component.scss']
})
export class SignupUhidComponent implements OnInit {

  MobileOrEmail = this.aaa.userInfo.email;
  UHIDTrackedSub: Subscription;
  
  selectedUHID = {} as UHID;
  availableUHIDs = [];

  constructor(
    private aaa: AAAuthService,
    private modalService: BsModalService) { }

  ngOnInit() {
    this.selectedUHID = {} as UHID;
    this.getPRToken();
    //this.availableUHIDs = this.aaa.getUHIDs();
  }

  getPRToken(){
    this.aaa.getPRToken().subscribe(
      (data: any) => {
        let response=data;
      });
  }

  setUHID(uhid: UHID) {
    this.selectedUHID = uhid;
    this.aaa.getDetailsByUHID(uhid);
  }

  finish() {
   
    this.modalService._hideModal(1);
  }

}
