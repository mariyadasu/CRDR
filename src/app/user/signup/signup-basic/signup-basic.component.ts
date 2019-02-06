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
import { constants as c } from './../../../constants';

import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-signup-basic',
  templateUrl: './signup-basic.component.html',
  styleUrls: ['./signup-basic.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SignupBasicComponent implements OnInit, OnDestroy {

  sub: Subscription;

  showOnlySocial = false; // Used to hide phone number when popped from book appointment
  // isNavya = false; // used to hide phone number when popped from Cancer Care / Navya

  modalRef: BsModalRef;
  activeTab = this.us.TAB_PHYSICAL_APPOINTMENT;
  showMobile: any = undefined;
  constructor(
    private router: Router,
    private us: UtilsService,
    private _auth: AuthService,
    private aaa: AAAuthService,
    private modalService: BsModalService,
    private cs: CommonService) { }

  ngOnInit() {
    //Canonical and Google Analytics
    this.cs.setCanonicallink(window.location.href);
    //debugger;

    this.showOnlySocial = this.aaa.getAuthCalledFrom() != this.aaa.AUTH_CALLED_FROM_HOME;
    if (window.location.href.indexOf('online-doctors-consultation') != -1) {
      this.showOnlySocial = true;
    }


    this.aaa.loadingHide('loadingid');

    // this.aaa.showMobileNoInLoginFlow.subscribe(
    //   (status: any) => {
    //     debugger;
    //     // var screen=this.aaa.getAuthCalledFrom();

    //     // if(screen==this.aaa.AUTH_CALLED_FROM_HOME){
    //     //   this.showOnlySocial=false;
    //     //   return;
    //     // }
    //     // if(screen==this.aaa.AUTH_CALLED_FROM_DOCTOR_SEARCH){
    //     //   this.showOnlySocial=false;
    //     //   return;
    //     // }

    //     // this.showOnlySocial = true;
    //   });
    var authCall = this.aaa.getAuthCalledFrom();
    if (this.cs.showMobileNumFiels &&  authCall== this.aaa.AUTH_CALLED_FROM_DOCTOR_SEARCH) {
      this.showOnlySocial = false;
    }
  }
  isTermsAccepted: boolean = true;

  signIn(provider) {
    this.cs.setGA('Consult Doctor Online Login/Signup', 'Login/Signup', 'Online Consultations_Login/Signup', 'Login/Signup_<' + provider + '>');

    if (this.isTermsAccepted) {
      let nameSlice: string[];
      let ui = {} as UserInfo;
      //this.spinnerService.show();
      this.aaa.loadingShow('loadingid');
      this.sub = this._auth.login(provider).subscribe(
        (data: any) => {
          //this.spinnerService.show();

          this.aaa.loadingShow('loadingid');
          if (data.name != '') {
            nameSlice = data.name.split(" ");
            ui.firstName = (nameSlice.slice(0, nameSlice.length - 1)).join(" ");
            ui.lastName = nameSlice.length > 1 ? nameSlice[nameSlice.length - 1] : '';
          }
          else {
            ui.firstName = '';
            ui.lastName = '';
          }

          ui.SocialLoginId = data.uid;
          ui.SocialLoginType = provider == 'google' ? 'G' : 'F';

          if (data.email && data.email != '') {
            ui.email = data.email;
            ui.IsEmailVerified = "1";
            ui.imageUrl = data.image;
            this.aaa.setUserInfo(ui);
            this.aaa.processSocialLogin(ui.SocialLoginType);
            //this.spinnerService.hide();




            //this.spinnerService.hide();


            let oclocation = (this.router.url.split("/"))[1];
            if (oclocation == 'online-doctors-consultation') {
              this.aaa.getUserStatus().subscribe(d => {

                if (+d.requestStatus == 1) {

                } else {
                  this.aaa.getUserStatus().subscribe(d => {
                    if (+d.requestStatus == 1) {
                    } else {
                      // this.spinnerService.show();
                      this.aaa.getPendingCaseSheet().subscribe(t => {
                        if (t.ResponceCode == "0" && t.Result != "" && t.Result != "[]") {
                          this.router.navigate(['onlinependingcasesheet']);
                        }
                        // else {
                        //   //this.router.navigate(['onlinepayment']);
                        // }
                      })
                    }

                  });

                }
              });

            }
            let navigationStatus = localStorage.getItem('loginedirect');
            if (navigationStatus == 'Y') {
              this.aaa.getUserStatus().subscribe(d => {
                debugger;
                if (+d.requestStatus == 1) {

                } else {
                  this.router.navigate(['/book-appointment/patient-info-confirm']);
                }
              });
            }

          }
          else {
            this.aaa.loadingHide('loadingid');
            this.aaa.setSignupStatus(2);
          }
        }
      )
    } else {
      alert('please accept terms & conditions');
    }
  }

  signInUsingPhoneEmail(f: NgForm) {
    if(this.cs.showMobileNumFiels){
      this.aaa.logoutUserWithoughtRedirect();
    }else{
      this.aaa.logoutUser();
    }
   
    //this.aaa.signInUsingMobileEmail(f.value.EmailorMobile);
    this.mobileOrEmail = f.value.EmailorMobile;
    this.requestedOTP = false;
    this.processForm();
  }
  requestedOTP: boolean = false;
  mobileOrEmail: string = '';
  resendOTP() {
    this.requestedOTP = false;
    this.processForm();
  }

  // processFormOne() {

  //   //debugger;
  //   localStorage.setItem("loginType","M");
  //   localStorage.setItem("loginUserIdForGuest",this.mobileOrEmail);
  //   let eop = this.us.checkEmailOrPhone(this.mobileOrEmail);
  //   if(!this.requestedOTP) {
  //     this.aaa.sendOTPForHOPEGuest(this.mobileOrEmail).subscribe(
  //       (data: any) => {
  //         if(+data[0].ResponseCode == 1) {
  //           this.requestedOTP = true;
  //         }
  //       }
  //     );
  //   } else {
  //     if(this.otp==""){
  //       alert('Otp is mandatory');
  //       //return false;
  //     }else{
  //       this.aaa.loadingShow('loadingid');
  //       this.aaa.getUHIDsForHOPEGuest(this.phoneOrEmail, this.otp);
  //       localStorage.setItem('authName','Guest: '+this.phoneOrEmail);
  //       this.aaa.setSessionStatusForAuth(true);
  //     }

  //   }
  // }

  processForm() {

    localStorage.setItem("loginType", "C");
    localStorage.setItem("loginUserIdForGuest", this.mobileOrEmail);
    let eop = this.us.checkEmailOrPhone(this.mobileOrEmail);
    if (!this.requestedOTP) {
      this.aaa.sendOTPForHOPEGuest(this.mobileOrEmail).subscribe(
        (data: any) => {
          if (+data[0].ResponseCode == 1) {
            this.requestedOTP = true;
            this.aaa.loginPhoneOrEmail = this.mobileOrEmail;
            this.aaa.setSignupStatus(3);
          }
        }
      );
    } else {
      //this.spinnerService.show();
      //this.aaa.getUHIDsForHOPEGuest(this.mobileOrEmail, this.otp);
    }
  }


  ngOnDestroy() {
    if (this.sub != null) this.sub.unsubscribe();
  }

  showtnc(tnc: TemplateRef<any>) {

    this.modalRef = this.modalService.show(tnc);
  }

}
