import { Component, OnInit } from '@angular/core';

import { AAAuthService } from '@aa/services/auth.service';
import { UtilsService } from '@aa/services/utils.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-signup-mobile-otp',
  templateUrl: './signup-mobile-otp.component.html',
  styleUrls: ['./signup-mobile-otp.component.scss']
})
export class SignupMobileOtpComponent implements OnInit {

  requestedOTP = false;

  phoneOrEmail = '';
  otp = '';

  constructor(
    private aaa: AAAuthService,
    private spinnerService: Ng4LoadingSpinnerService,
    private us: UtilsService) { }

  ngOnInit() {
  }

  resendOTP() {
    this.requestedOTP = false;
    this.processForm();
  }
  
  processForm() {
    
    //debugger;
    localStorage.setItem("loginType","M");
    localStorage.setItem("loginUserIdForGuest",this.phoneOrEmail);
    let eop = this.us.checkEmailOrPhone(this.phoneOrEmail);
    if(!this.requestedOTP) {
      this.aaa.sendOTPForHOPEGuest(this.phoneOrEmail).subscribe(
        (data: any) => {
          if(+data[0].ResponseCode == 1) {
            this.requestedOTP = true;
          }
        }
      );
    } else {
      if(this.otp==""){
        alert('Otp is mandatory');
        //return false;
      }else{
        this.aaa.loadingShow('loadingid');
        this.aaa.getUHIDsForHOPEGuest(this.phoneOrEmail, this.otp);
        localStorage.setItem('authName','Guest: '+this.phoneOrEmail);
        this.aaa.setSessionStatusForAuth(true);
      }
      
    }
  }

}
