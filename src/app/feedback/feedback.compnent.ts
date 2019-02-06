import { UserInfo } from '@aa/structures/user.interface';
import { Component, OnInit, ViewEncapsulation, OnDestroy, TemplateRef, Input } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';

import { AuthService } from "angular2-social-login";
import { AAAuthService } from '@aa/services/auth.service';
import { UtilsService } from '@aa/services/utils.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FeedbackComponent implements OnInit {
  showOtherReason: string = 'N';
  reason: string = 'Book an Appointment';
  otherReason = '';
  reasons: string[] = ['Book an Appointment', 'Consult Doctor Online',
    'Book Health Check', 'Cancer Opinion', 'Health Library', 'Health Records', 'Others'];
  feedbackContentLike = '';
  feedbackContentAspect = '';
  email = '';
  showAspectHideLike = 'N';
  feedBackType: string = '';
  res:any;
  modalRef: BsModalRef;
  userEmail:string;


  constructor(
    private router: Router,
    private us: UtilsService,
    private _auth: AuthService,
    private aaa: AAAuthService,
    private modalService: BsModalService) { }

  ngOnInit() {
    this.userEmail = this.aaa.getuserInfo().email;
    this.email = this.userEmail;
  }
  setReason(selectedReason: any) {
    let s = this.reasons.filter(r => {
      return r == selectedReason.value
    })[0];
    this.reason = s;
    this.showOtherReason = 'N';
    this.otherReason = '';
    if (s == "Others") {
      this.showOtherReason = 'Y';
    }
  }
  clear() {
    this.showOtherReason = 'N';
    this.reason = 'Book an Appointment';
    this.otherReason = '';
    this.feedbackContentAspect = '';
    this.feedbackContentLike = '';
    //this.email = '';
    this.feedBackType = "";

  }
  setFeedBackType(val: any, type: any) {
    this.feedbackContentAspect = '';
    this.feedbackContentLike = '';
    this.feedBackType = type;
    if (val == 'aspect') {
      this.showAspectHideLike = 'Y';
    }
 
    if (val == 'like') {
      this.showAspectHideLike = 'N';
    }
  }
  sendFeedBack(template: TemplateRef<any>) 
  {
    let feedBackText:any='';
    
    if (this.feedBackType == '' ||
      (this.showAspectHideLike == 'Y' && this.feedbackContentAspect == '') ||
      (this.showAspectHideLike == 'N' && this.feedbackContentLike == '') ||
      this.email == '') 
    {
      alert('All fields are mandatory')
    }
    else
    {
      if(this.showAspectHideLike == 'Y')
      {
        feedBackText=this.feedbackContentAspect;
      }
      if(this.showAspectHideLike == 'N')
      {
        feedBackText=this.feedbackContentLike;
      }

      // email validation
      var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if(this.email.match(mailformat))
      {
        feedBackText = this.otherReason+'~'+feedBackText;
        this.aaa.addFeedBack(this.feedBackType,feedBackText,this.email,this.reason).subscribe(
        d=>{
              this.res = d;
              if(this.res.ResponceCode == 0)
              {
                this.clear();
                // remove tick mark
                var els = document.getElementsByClassName('chk-cont active');
                for (var i = 0; i < els.length; i++) 
                {
                   els[i].classList.remove('active');
                }


                this.email = this.userEmail;
                this.modalRef = this.modalService.show(template);
              }
              else
              {
                alert('Something went wrong.');
              }
          });
      }
      else
      {
        alert("You have entered an invalid email address!");
        return false;
      }

      
    }
  }
}
