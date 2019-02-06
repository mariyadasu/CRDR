import { AAAuthService } from '@aa/services/auth.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserInfo } from '@aa/structures/user.interface';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-signup-otp-health-library',
  templateUrl: './signup-otp.component.html',
  styleUrls: ['./signup-otp.component.scss']
})
export class SignupOtpHealthLibraryComponent implements OnInit {

  ep: string;
  otp: any = "";
  otpResponse: any;
  showUhid: string;
  otpError: string = "";
  headerMessage: string;
  Uhids: any[] = [];
  selectedUhid: any = "Choose";
  selectUhidName: any = "";

  constructor(
    public aaa: AAAuthService,
    private modalService: BsModalService,
    private router: Router,
    private spinnerService: Ng4LoadingSpinnerService,
    private zone: NgZone,
    private cs: CommonService,
  ) { }

  ngOnInit()
  {
    this.ep = this.aaa.loginPhoneOrEmail;
    this.showUhid = "N";
    this.headerMessage = "Verify Mobile number";
  }

  verifyOTP()
  {
    if (this.otp == undefined || this.otp == null || this.otp == '')
    {
      alert('Otp is mandatory');
    }
    else
    {
      localStorage.removeItem('loginType');

      let userData = this.aaa.getuserInfo();
      console.log('1111');
      console.log(userData);
      if(userData.SocialLoginType == "G" || userData.SocialLoginType == "F")
      {
        console.log('SocialLoginType test');
        localStorage.setItem("loginType", "S");
        this.verifyOtpOfSocialSites(userData);
        localStorage.setItem('authName','');
        this.aaa.setSessionStatusForAuth(false);
      }
      else
      {
        alert('Invalid login type. Please try again later.');
      }
    }

  }

  verifyOtpOfSocialSites(userInfo: UserInfo)
  {
    console.log('verifyOtpOfSocialSites called test');
    this.getUids(userInfo);
  }

  getUids(userInfo: UserInfo)
  {
    this.aaa.loadingShow('loadingid');
    console.log('getUids called test');
    console.log(userInfo);
    this.Uhids = [];
    this.aaa.getUhids(userInfo.mobileNumber, this.otp).subscribe(
      (data: any) => {
        this.aaa.loadingHide('loadingid');
        console.log('getUids called get response');
        console.log(data);
        if (data != null)
        {
          data = data[0];

          if(data.StatusMessage != undefined && data.StatusMessage != null && data.StatusMessage == "OTP Invalid or Expired, Please Try Again.")
          {
            this.showUhid = "N";
            this.zone.run(() => { // <== added
              console.log(this.showUhid + 'ss')
            });
            console.log('showUhid n called get response');
            alert(data.StatusMessage);
          }
          else
          {
            if(data != null && data.UserData != null && data.UserData.response != null && data.UserData.response.signUpUserData != null)
            {
              console.log('showUhid y called get response');
              this.headerMessage = "Select a UHID to simplify your booking process";
              this.showUhid = "Y";
              this.zone.run(() => { // <== added
                console.log(this.showUhid + 'ss')
              });
              this.Uhids = data.UserData.response.signUpUserData;
              //this.aaa.setBookingParams(13);
            }
            else
            {
              console.log('showUhid yy called get response');
              this.headerMessage = "Select a UHID to simplify your booking process";
              this.showUhid = "Y";
              this.zone.run(() => { // <== added
                console.log(this.showUhid + 'ss')
              });
              this.Uhids = [];
            }
          }

        }
        else
        {
          console.log('showUhid nn called get response');
           
          this.showUhid = "N";
          this.zone.run(() => { // <== added
            console.log(this.showUhid + 'ss')
          });
          alert('Invalid OTP');
        }

      });
  }














  


  

  resendOTP()
  {

    let userData = this.aaa.getuserInfo();
    if (userData.SocialLoginType == "G" || userData.SocialLoginType == "F") {
      this.aaa.processPhoneNumber(userData);

    } else {
      //this.aaa.resendOTP(this.ep);

      localStorage.setItem("loginType", "M");
      localStorage.setItem("loginUserIdForGuest", this.ep);
      //let eop = this.us.checkEmailOrPhone(this.ep);

      this.aaa.sendOTPForHOPEGuest(this.ep).subscribe(
        (data: any) => {
          if (+data[0].ResponseCode == 1) {
            this.aaa.loginPhoneOrEmail = this.ep;
            //this.aaa.setSignupStatus(3);
          }
        }
      );



    }


  }
  setUHID(uhid: any) {
    if (uhid == null) {
      this.selectedUhid = "Choose";
      this.selectUhidName = "";
    } else {
      this.selectedUhid = uhid.UHID;
      this.selectUhidName = uhid.userName;
    }
  }
  finish()
  {
    alert('Done');
    this.aaa.loadingShow('loadingid');
    if(this.selectedUhid !== "Choose")
    {
      this.aaa.userInfo.uhid = this.selectedUhid;
      let selectedUhidNew = this.Uhids.filter(u => {
        return u.UHID == this.selectedUhid;
      })[0];

      localStorage.setItem('loginTypeusrredirection', 'su');
    }
    else
    {
      this.aaa.userInfo.uhid = "";
    }
    this.aaa.SocialMediaLoginRegisterHealthLibrary(this.aaa.userInfo, this.otp)
      .subscribe(
        (data: any) => {
          this.aaa.loadingHide('loadingid');
          this.aaa.processSocialLoginHealthLibrary(this.aaa.userInfo.SocialLoginType);
          this.modalService._hideModal(1);
      });
  }

  getName(type: any, name: any) {
    if (name == null || name == "") {
      return "--";
    }
    if (type == 'f') {
      let names = name.split(' ');
      if (names.length > 0) {
        return names[0];
      }

    }
    if (type == 'l') {
      let names = name.split(' ');
      if (names.length >= 2) {
        return names[1];
      }
    }

    return "--";
  }

}
