import { Component, OnInit, TemplateRef, OnDestroy, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';


import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { UtilsService } from '@aa/services/utils.service';
import { AAAuthService } from '@aa/services/auth.service';
import { CommonService } from './../../services/common.service';

import { Subscription } from 'rxjs/Subscription';

import { SignupComponent } from './../../user/signup/signup.component';

@Component({
  selector: 'app-navya-home',
  templateUrl: './navya-home.component.html',
  styleUrls: ['./navya-home.component.scss']
})
export class NavyaHomeComponent implements OnInit, OnDestroy {

  // Modal for login popup
  modalRef: BsModalRef;
  @ViewChild('thankyou') public thankyou: TemplateRef<any>;
  getInTouchTrackerSub: Subscription;

  cc = '91';
  cctag = 'IND';

  gitf: NgForm;

  constructor(
    private modalService: BsModalService,
    private us: UtilsService,
    private aaa: AAAuthService,
    private cs: CommonService) { }


  ngOnInit() {
    this.us.setActiveTab(this.us.TAB_CANCER_CARE);
    this.aaa.setAuthCalledFrom(this.aaa.AUTH_CALLED_FROM_NAVYA);

    this.getInTouchTrackerSub = this.cs.getInTouchTracker.subscribe(
      (status: boolean) => {
        if (status) {
          if (this.gitf != null) this.gitf.resetForm();
          this.modalRef = this.modalService.show(this.thankyou);
        }
      }
    );

  }

  setCC(cc: string, cctag: string) {
    this.cc = cc;
    this.cctag = cctag;
  }

  ngOnDestroy() {
    this.aaa.setAuthCalledFrom(this.aaa.AUTH_CALLED_FROM_NAVYA);
  }

  openSignup() {

    if (this.aaa.getSessionStatus()) {
      this.aaa.gotoNavya();
    } else {
      this.modalRef = this.modalService.show(SignupComponent);
    }
  }

  getInTouch(f: NgForm) {
    let params = f.value;
    params.countryCode = this.cc;
    params.createdIP = this.cs.getIP();
    this.gitf = f;
    this.cs.navyaGetInTouch(params);
  }

  closeThankyou(): void {
    this.modalRef.hide();
  }


}
