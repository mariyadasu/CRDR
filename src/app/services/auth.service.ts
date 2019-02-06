import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs/Subject';

import { CommonService } from '@aa/services/common.service';
import { StoreService } from './store.service';
import { UtilsService } from '@aa/services/utils.service';

import { UserInfo, aaToken, UHID, AlexaSourceResponse } from '@aa/structures/user.interface';
import { patientInfo } from './../structures/calendar.tracker.interface';

import { constants as c } from './../constants';
import * as moment from 'moment';

import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Observable } from 'rxjs/Observable';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';

@Injectable()
export class AAAuthService {

  public BOOKING_PARAMS_NS_NU = 11; // No Session. No UHID
  public BOOKING_PARAMS_NS_U = 12; // No Session. Yes UHID
  public BOOKING_PARAMS_S_NU = 14; // Yes Session. No UHID
  public BOOKING_PARAMS_S_U = 13; // Yes Session. Yes UHID
  public BOOKING_PARAMS_S_NU_R = 15; // Yes Session. Yes UHID

  public SIGNUP_STATUS_SHOW_BASIC = 1;
  public SINGUP_STATUS_SHOW_DETAILS = 2;
  public SIGNUP_STATUS_SHOW_OTP = 3;

  public SIGNUP_STATUS_SHOW_MOBILE_OTP = 12;
  public SIGNUP_STATUS_SELECT_UHID = 13;

  public AUTH_CALLED_FROM_HOME = 27;
  public AUTH_CALLED_FROM_DOCTOR_SEARCH = 28;
  public AUTH_CALLED_FROM_NAVYA = 29;

  public CALLED_FROM_NORMAL = 27;
  public CALLED_FROM_DOCTORSEARCH = 28;

  public SHOW_SKIP = true

  authCalledFrom = this.AUTH_CALLED_FROM_HOME;

  userInfo: UserInfo = {} as UserInfo;
  loginPhoneOrEmail: string;
  loginPhoneOrEmailStatusId: string;

  navyaUrl: string = '';
  navyaUrlTracker = new Subject<string>();
  location: any;
  signupStatus = 1;
  signupStatusTracker = new Subject<number>();
  uhidTracker = new Subject<UHID[]>();

  sessionStatusTracker = new Subject<boolean>();
  sessionStatus = false;
  sessionToken = {} as aaToken;

  bookingParams = this.BOOKING_PARAMS_NS_NU;
  bookingParamsTracker = new Subject<number>();

  uhids: UHID[] = [];

  userInfoTracker = new Subject<UserInfo>();

  navigationTracker = new Subject<string>();
  sessionStatusTrackerForAuth = new Subject<boolean>();

  signedInForAnonimus: boolean = false;

  constructor(
    private hc: HttpClient,
    private router: Router,
    private modalService: BsModalService,
    private us: UtilsService,
    private cs: CommonService,
    private ss: StoreService,
    private spinnerService: Ng4LoadingSpinnerService,
    private idle: Idle, private keepalive: Keepalive
  ) { }

  isLocal: boolean = false;

  getIsLocal() {
    return c.isLocal;
  }

  getWebsiteForRedirect() {
    return c.websiteForRedirect;
  }

  getUserStatus(): Observable<any> {
    let apiEndpoint = c.Apiurl + 'AuthenticateUserWithOnlineConsultationUsingSocialLoginForAngular';

    let params = {
      SocialLoginId: this.userInfo.SocialLoginId,
      SocialLoginType: this.userInfo.SocialLoginType,
      email: this.userInfo.email,
      FullName: this.userInfo.firstName + ' ' + this.userInfo.lastName,
      logId: this.getLogId()
    }

    let logiD = this.getLogId();
    return this.hc.post(apiEndpoint, params);
  }

  getGender(type: any) {
    if (type == 1) {
      return "male";
    }
    if (type == 2) {
      return "female";
    }
    if (type == 3) {
      return "un known";
    }
  }

  finalStepNevy(otp: any) {
    let apiEndpoint = c.Apiurl + 'AuthenticateUser4mOnlinePhysicalNavya';
    let params = {
      firstName: this.userInfo.firstName,
      lastName: this.userInfo.lastName,
      email: this.userInfo.email,
      mobileNumber: this.userInfo.mobileNumber,
      IsEmailVerified: this.userInfo.IsEmailVerified,
      SocialLoginId: this.userInfo.SocialLoginId,
      SocialLoginType: this.userInfo.SocialLoginType,
      dateofBirth: this.userInfo.dateofBirth.replace("-", "/").replace("-", "/").replace("-", "/"),
      gender: this.getGender(this.userInfo.gender),
      UserValidationsWithServicesFlag: "3",
      MobileOtp: otp,
      CountryCode: '91',
    }
    this.hc.post(apiEndpoint, params).subscribe(
      (data: any) => {
        this.loadingHide('loadingid');
        if (data.requestStatus == 0) {
          this.navyaUrl = c.CancerOpinionURL + '?token=' + data.token + '&userid=' + data.navyaUserid + '&referrer=' + data.referrer;
          this.navyaUrlTracker.next(this.navyaUrl);
          localStorage.setItem('navyaUrl', this.navyaUrl)
          this.modalService._hideModal(1);
          this.cs.navyaIframeTracker.next(true);
          //this.router.navigate(['/cancercare']);
          window.location.href = c.WindowLocationOrigin + "/cancercare";

        } else if (data.requestStatus == 3) {
          alert(data.requestStatusMsg);
        } else {
          alert("We are facing few technical difficulties. Please try again.\r StatusCode : " + data.requestStatus)
        }
      }
    );
  }
  processPhoneNumber(ui: UserInfo) {

    if (this.authCalledFrom == this.AUTH_CALLED_FROM_NAVYA) {
      this.userInfo = { ...ui };
      let apiEndpoint = c.Apiurl + 'AuthenticateUser4mOnlinePhysicalNavya';
      let params = {
        firstName: this.userInfo.firstName,
        email: this.userInfo.email,
        mobileNumber: this.userInfo.mobileNumber,
        IsEmailVerified: this.userInfo.IsEmailVerified,
        SocialLoginId: this.userInfo.SocialLoginId,
        SocialLoginType: this.userInfo.SocialLoginType,
        dateofBirth: this.userInfo.dateofBirth,
        gender: this.userInfo.gender,
        UserValidationsWithServicesFlag: "2",
        MobileOtp: "",
        CountryCode: '91',
      }
      this.hc.post(apiEndpoint, params).subscribe(
        (data: any) => {
          this.loadingHide('loadingid');
          if (data.requestStatus == 2) {
            this.loginPhoneOrEmail = ui.mobileNumber;
            this.setSignupStatus(3);
            //this.setSessionStatus(true);
          } else if (data.requestStatus == 0) {

          }
        }
      );
    } else {
      this.userInfo = { ...ui };
      let apiEndpoint = c.Apiurl + 'GetMobileOtpFromOnlineConsulation';
      let params = {
        email: this.userInfo.email,
        mobileNumber: this.userInfo.countryCode + this.userInfo.mobileNumber,
        logId: this.getLogId()
      }
      this.hc.post(apiEndpoint, params).subscribe(
        (data: any) => {
          this.loadingHide('loadingid');
          if (data.mobileOTP && data.mobileOTP == 'sent' && data.status && data.status == 'success' && ui.countryCode == "91") {
            this.loginPhoneOrEmail = ui.mobileNumber;
            this.setSignupStatus(3);
            //this.setSessionStatus(true);
          }

          else if (data.requestStatus == 0) {
            //this.setSessionStatus(true);

            this.navyaUrl = c.CancerOpinionURL + '?token=' + data.token + '&userid=' + data.navyaUserid + '&referrer=' + data.referrer;
            this.navyaUrlTracker.next(this.navyaUrl);

            this.router.navigate(['/cancercare']);
          }
        }
      );


    }

  }

  verifyOTP(ep: string, otp: string): Observable<any> {

    let apiEndpoint = c.MultiSpecialityUrl + 'GetPatientandRelativeDetailsonEmailorMobileV4';
    let params = {
      "EmailorMobile": ep,
      "RequestId": "3",
      "StatusId": this.loginPhoneOrEmailStatusId,
      "ValidationOTP": otp
    }
    return this.hc.post(apiEndpoint, params);
  }

  logoutUserIdeal() {
    //console.log('final logout');
    this.getLocalStorageValues('Before Idle Logout');
    this.clearLogId();
    this.userInfo = {} as UserInfo;

    // Remove session and user details from localStorage
    this.ss.clearToken(this.ss.TOKEN_USER);
    this.ss.clearToken(this.ss.TOKEN_AUTH_TOKEN);

    this.setSessionStatus(false);

    this.getLocalStorageValues('After Idle Logout');

    this.router.navigate(['/']);
  }
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
  signOutTime = c.signOutTime;
  signOutTimeAlert = c.signOutTimeAlert;

  startIdleTime() {
    //console.log('idle time called');
    // sets an idle timeout of 5 seconds, for testing purposes.
    this.idle.setIdle(this.signOutTime);
    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    this.idle.setTimeout(this.signOutTimeAlert);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.onIdleEnd.subscribe(() => this.idleState = 'No longer idle.');
    this.idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      this.timedOut = true;
      //console.log("ontimeout=" + this.idleState);
      document.getElementById("autoLogout").style.display = "none";
      this.logoutUserIdeal();

    });
    this.idle.onIdleStart.subscribe(() => this.idleState = 'You\'ve gone idle!');
    this.idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = 'Your login session will get expired in ' + countdown + ' seconds. Please close this alert to continue.'
      //console.log("onTimeOutWarning=" + this.idleState);
      var ele = document.getElementById("autoLogout");
      var style = window.getComputedStyle(ele);
      if (style.display === "none") {
        document.getElementById("autoLogout").style.display = "block";
        document.getElementById("autoLogOutBody").innerHTML = this.idleState;
      } else {
        document.getElementById("autoLogOutBody").innerHTML = this.idleState;
      }
    }
    );

    // sets the ping interval to 15 seconds
    //this.keepalive.interval(15);

    this.keepalive.onPing.subscribe(() => {
      var ele = document.getElementById("autoLogout");
      var style = window.getComputedStyle(ele);
      if (style.display === "none") {
        this.lastPing = new Date();
        //console.log("onPing=" + this.lastPing);
      } else {
        document.getElementById("autoLogout").style.display = "none";
        this.lastPing = new Date();
        //console.log("onPing=" + this.lastPing)
      }
    });

    this.reset();
  }

  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    //console.log('started idle service')
    this.timedOut = false;
  }
  stopIdle() {
    this.idle.stop();
  }


  processSocialLogin(type: String) {

    if (this.authCalledFrom == this.AUTH_CALLED_FROM_NAVYA) {
      this.loadingHide('loadingid');
      this.gotoNavya();
    }
    else {
      let apiEndpoint = c.Apiurl + 'AuthenticateUserWithOnlineConsultationUsingSocialLoginForAngular';
      let params = {
        SocialLoginId: this.userInfo.SocialLoginId,
        SocialLoginType: this.userInfo.SocialLoginType,
        email: this.userInfo.email,
        FullName: this.userInfo.firstName + ' ' + this.userInfo.lastName,
        logId: this.getLogId()
      }
      this.hc.post(apiEndpoint, params).subscribe(
        (data: any) => {
          this.setLogId(data.logId);
          this.loadingHide('loadingid');
          if (+data.requestStatus == 1) {
            this.loadingHide('loadingid');
            this.setSignupStatus(2);
            this.setSessionStatus(false);
          } else if (data.requestStatus == '0') {

            this.setUserInfo({
              dateofBirth: data.DateOfBirth,
              gender: data.Gender,
              mobileNumber: data.mobileNumber,
              IsPhoneVerified: true,
              userId: data.edocUserId,
              patientId: data.eDocPatientId,
              AuthTokenForPR: data.OnlineConsultToken,
              AskApolloReferenceIdForSelf: data.AskApolloReferenceIdForSelf,
              uhid: data.UHID,
              email: data.emailId,
              PatientOrigin: data.PatientOrigin
            });

            this.setSessionToken({
              AskApolloReferenceIdForSelf: data.AskApolloReferenceIdForSelf,
              OnlineConsultToken: data.OnlineConsultToken
            });

            if(data.HealthLibrary)
            {
              document.cookie = "healthLibraryCookie="+data.HealthLibrary;
              localStorage.setItem('healthLibraryCookie',data.HealthLibrary);
            }
            this.setSessionStatus(true);

            this.getLocalStorageValues('After Social Login');
            // this.setUserInfo(this.userInfo);
            this.uhids = [];
            let navigationStatus = localStorage.getItem('loginedirect');

            var hostname = c.WindowLocationOrigin;
            //console.log('host name:' + hostname);

            let redirectPatientInfoConfirmationUrl = '';
            let redirectOnlinePaymentUrl = '';
            let redirectOnlinePendingCasesheetUrl = '';
            this.startIdleTime();
            if (!this.isLocal) {
              redirectPatientInfoConfirmationUrl = c.WindowLocationOrigin + "/book-appointment/patient-info-confirm";
              redirectOnlinePaymentUrl = c.WindowLocationOrigin + "/onlinepayment";
              redirectOnlinePendingCasesheetUrl = c.WindowLocationOrigin + "/onlinependingcasesheet";
            } else {
              redirectPatientInfoConfirmationUrl = c.WindowLocationOrigin + "/book-appointment/patient-info-confirm";
              redirectOnlinePaymentUrl = c.WindowLocationOrigin + "/onlinepayment";
              redirectOnlinePendingCasesheetUrl = c.WindowLocationOrigin + "/onlinependingcasesheet";
            }

            if (data.UHID != '') {
              localStorage.setItem('loginTypeusrredirection', 'su');
              this.setBookingParams(this.BOOKING_PARAMS_S_U);

              if (navigationStatus == 'Y') {


                //this.router.navigate(['/book-appointment/patient-info-confirm']);

                window.location.href = redirectPatientInfoConfirmationUrl;
              }

              if (navigationStatus == 'o') {
                this.loadingHide('loadingid');

                this.getPendingCaseSheet().subscribe(t => {
                  if (t.ResponceCode == "0" && t.Result != "" && t.Result != "[]") {
                    window.location.href = redirectOnlinePendingCasesheetUrl;
                    //this.router.navigate(['onlinependingcasesheet']);
                  } else {
                    window.location.href = redirectOnlinePaymentUrl;
                    //this.router.navigate(['onlinepayment']);
                  }
                })

              }


            } else {

              this.getAllFamilyMembersDataForBooking().subscribe(
                (data: any) => {
                  this.loadingHide('loadingid');

                  if (data.Result != undefined && data.Result != null) {
                    let res = JSON.parse(data.Result);
                    if (res.length <= 0) {
                      localStorage.setItem('loginTypeusrredirection', 'snu');
                      this.setBookingParams(this.BOOKING_PARAMS_S_NU);

                      if (navigationStatus == 'Y') {

                        // window.location.href = "http://localhost:4200/book-appointment/patient-info-confirm";
                        window.location.href = redirectPatientInfoConfirmationUrl;
                        //this.router.navigate(['/book-appointment/patient-info-confirm']);
                      }

                      if (navigationStatus == 'o') {
                        this.loadingHide('loadingid');

                        this.getPendingCaseSheet().subscribe(t => {
                          if (t.ResponceCode == "0" && t.Result != "" && t.Result != "[]") {
                            window.location.href = redirectOnlinePendingCasesheetUrl;
                            //this.router.navigate(['onlinependingcasesheet']);
                          } else {
                            window.location.href = redirectOnlinePaymentUrl;
                            //this.router.navigate(['onlinepayment']);
                          }
                        })

                      }

                    } else {
                      this.loadingHide('loadingid');
                      localStorage.setItem('loginTypeusrredirection', 'snur');
                      this.setBookingParams(this.BOOKING_PARAMS_S_NU_R);

                      if (navigationStatus == 'Y') {

                        //window.location.href = "http://localhost:4200/book-appointment/patient-info-confirm";
                        window.location.href = redirectPatientInfoConfirmationUrl;
                        //this.router.navigate(['/book-appointment/patient-info-confirm']);
                      }

                      if (navigationStatus == 'o') {
                        this.loadingHide('loadingid');

                        this.getPendingCaseSheet().subscribe(t => {
                          if (t.ResponceCode == "0" && t.Result != "" && t.Result != "[]") {
                            window.location.href = redirectOnlinePendingCasesheetUrl;
                            //this.router.navigate(['onlinependingcasesheet']);
                          } else {
                            window.location.href = redirectOnlinePaymentUrl;
                            //this.router.navigate(['onlinepayment']);
                          }
                        })

                      }
                    }
                  } else {
                    localStorage.setItem('loginTypeusrredirection', 'snu');
                    this.setBookingParams(this.BOOKING_PARAMS_S_NU);

                    if (navigationStatus == 'Y') {

                      //window.location.href = "http://localhost:4200/book-appointment/patient-info-confirm";
                      window.location.href = redirectPatientInfoConfirmationUrl;
                      //this.router.navigate(['/book-appointment/patient-info-confirm']);
                    }

                    if (navigationStatus == 'o') {
                      this.loadingHide('loadingid');

                      this.getPendingCaseSheet().subscribe(t => {
                        if (t.ResponceCode == "0" && t.Result != "" && t.Result != "[]") {
                          window.location.href = redirectOnlinePendingCasesheetUrl;
                          //this.router.navigate(['onlinependingcasesheet']);
                        } else {
                          window.location.href = redirectOnlinePaymentUrl;
                          //this.router.navigate(['onlinepayment']);
                        }
                      })

                    }

                  }
                });
              this.modalService._hideModal(1);
            }

            this.modalService._hideModal(1);

          }
        });
    }

  }
  gotoNavyaInjector() {
    this.cs.navyaIframeTracker.next(true);
  }

  gotoNavya() {
    let apiEndpoint = c.Apiurl + 'AuthenticateUser4mOnlinePhysicalNavya';
    this.hc.post(apiEndpoint, { ...this.userInfo, UserValidationsWithServicesFlag: 1 }).subscribe(
      (data: any) => {

        this.loadingHide('loadingid');
        if (data.requestStatus == 0) {
          this.navyaUrl = c.CancerOpinionURL + '?token=' + data.token + '&userid=' + data.navyaUserid + '&referrer=' + data.referrer;
          this.navyaUrlTracker.next(this.navyaUrl);
          localStorage.setItem('navyaUrl', this.navyaUrl)
          this.modalService._hideModal(1);
          //this.cs.navyaIframeTracker.next(true);
          //this.router.navigate(['/cancercare']);
          window.location.href = c.WindowLocationOrigin + "/cancercare";
        }

        if (data.requestStatus == "1") {
          this.loadingHide('loadingid');
          this.setSignupStatus(2);
          this.setSessionStatus(false);
        }
      }
    );
  }

  signInUsingMobileEmail(ep: string) {
    let apiEndpoint = c.MultiSpecialityUrl + 'GetPatientandRelativeDetailsonEmailorMobileV4';
    this.hc.post(apiEndpoint, { EmailorMobile: ep, RequestId: "1" }).subscribe(
      (data: any) => {
        this.loadingHide('loadingid');
        if (data != null) data = data[0];

        if (data.StatusId == 0) {
          //alert('No account found with this phone number or email address. Please sign up using Facebook or Google account');
        } else {
          this.loginPhoneOrEmail = ep;
          this.loginPhoneOrEmailStatusId = data.StatusId;
          this.setSignupStatus(3);
        }

      }
    );
  }

  convertDOB(dob: string) {
    if (dob != '') {
      let s = dob.split('/');
      let d = new Date(s[1] + '/' + s[0] + '/' + s[2]);
      return d;
    } else return null;

  }

  sendOTPForHOPEGuest(ep: string) {

    let ae = c.MultiSpecialityUrl + 'GetUHIDonEmailorMobileV4';
    let params = {
      EmailorMobile: ep,
      RequestId: 1,
      logId: this.getLogId()
    };

    return this.hc.post(ae, params);

  }

  getUHIDsForHOPEGuest(ep: string, otp: string) {
    this.uhids = [];

    let ae = c.MultiSpecialityUrl + 'GetUHIDonEmailorMobileV4';
    let params = {
      RequestId: 2,
      EmailorMobile: ep,
      ValidationOTP: otp,
      logId: this.getLogId()
    };

    this.hc.post(ae, params).subscribe(
      (data: any) => {
        this.loadingHide('loadingid');

        //console.log(data);
        let authToken = data[0].token;
        let uhidstrings = []; //uhid strings

        if (data[0].UserData == null) {
          alert('OTP Invalid or Expired, Please Try Again.');
          return;
        }
        localStorage.removeItem("guestData");
        localStorage.setItem("guestData", JSON.stringify(data));
        if (data[0].UserData.response && data[0].UserData.response.signUpUserData != null &&
          data[0].UserData.response.signUpUserData.length > 0) {

          localStorage.setItem('loginTypeusrredirection', 'nsu');
          this.router.navigate(['book-appointment/patient-info-confirm']);
          this.modalService._hideModal(1);

        }
        else {
          localStorage.setItem('loginTypeusrredirection', 'nsnu');
          this.setBookingParams(this.BOOKING_PARAMS_NS_NU);
          this.router.navigate(['/book-appointment/patient-info', { phoneOrEmail: ep }]);
          this.modalService._hideModal(1);
        }
      }
    );
  }

  getUHIDsForHOPEGuestSameScreen(ep: string, otp: string) {
    this.uhids = [];

    let ae = c.MultiSpecialityUrl + 'GetUHIDonEmailorMobileV4';
    let params = {
      RequestId: 2,
      EmailorMobile: ep,
      ValidationOTP: otp,
      logId: this.getLogId()
    };

    this.hc.post(ae, params).subscribe(
      (data: any) => {
        this.loadingHide('loadingid');
        localStorage.removeItem('mobileforguest');

        //console.log(data);
        let authToken = data[0].token;
        let uhidstrings = []; //uhid strings

        if (data[0].UserData == null) {
          alert('OTP Invalid or Expired, Please Try Again.');
          return;
        }
        localStorage.removeItem("guestData");
        localStorage.setItem("guestData", JSON.stringify(data));
        // alert('You are logged in as guest, you can continue to book appointment.To access full features please sign up with social accounts.');
        if (data[0].UserData.response && data[0].UserData.response.signUpUserData != null &&
          data[0].UserData.response.signUpUserData.length > 0) {

          localStorage.setItem('loginTypeusrredirection', 'nsu');
          //this.router.navigate(['book-appointment/patient-info-confirm']);
          this.modalService._hideModal(1);

        }
        else {
          localStorage.setItem('loginTypeusrredirection', 'nsnu');
          this.setBookingParams(this.BOOKING_PARAMS_NS_NU);
          localStorage.setItem('mobileforguest', ep);
          //this.router.navigate(['/book-appointment/patient-info', { phoneOrEmail: ep }]);
          this.modalService._hideModal(1);
        }
      }
    );
  }



  PHRTokenWithOTPforSourceApp(userInfo: UserInfo, otp: any) {
    let apiEndpoint = c.OCApiUrl + "PHRTokenWithOTPforSourceApp";

    let params = {
      "OTP": otp,
      "countrycode": "91",
      "phonenumber": userInfo.mobileNumber,
      "sourceApp": "85bb5f00-5f45-464b-8965-1f0a7e331d29~web"
    }
    return this.hc.post(apiEndpoint, params);
  }

  SocialMediaLoginRegister(userInfo: UserInfo, otp: any): Observable<any> {
    let apiEndpoint = c.Apiurl + "RegisterUserWithOnlineConsultatuionAndeDocUsingSocialLoginForAngular";
    let params = {
      "firstName": userInfo.firstName,
      "middlename": "",
      "lastName": userInfo.lastName,
      "email": userInfo.email,
      "mobileNumber": userInfo.mobileNumber,
      "dateofBirth": userInfo.dateofBirth,
      "gender": userInfo.gender,
      "SocialLoginType": userInfo.SocialLoginType,
      "SocialLoginId": userInfo.SocialLoginId,
      "MobileOtp": otp,
      "CountryCode": (userInfo.countryCode) ? userInfo.countryCode : "91",
      "MMUhid": userInfo.uhid,
      "logId": this.getLogId()
    }
    return this.hc.post(apiEndpoint, params);
  }

  resendOTP(ep: string) {
    let apiEndpoint = c.MultiSpecialityUrl + 'GetPatientandRelativeDetailsonEmailorMobileV4';
    let params = {
      "EmailorMobile": ep,
      "RequestId": "2",
      "StatusId": this.loginPhoneOrEmailStatusId,
    }
    this.hc.post(apiEndpoint, params).subscribe(
      (data: any) => {
        //console.log(data);
      }
    );
  }

  setSignupStatus(status: number) {
    this.signupStatus = status;

    this.signupStatusTracker.next(this.signupStatus);
  }

  getAuthCalledFrom() {
    return this.authCalledFrom;
  }

  setAuthCalledFrom(status: number) {
    this.authCalledFrom = status;
  }

  logoutUser() {
    this.getLocalStorageValues('Before Social Logout');
    this.logId = '';
    this.userInfo = {} as UserInfo;

    // Remove session and user details from localStorage
    this.ss.clearToken(this.ss.TOKEN_USER);
    this.ss.clearToken(this.ss.TOKEN_AUTH_TOKEN);

    this.setSessionStatus(false);

    localStorage.removeItem('loginType');
    localStorage.removeItem('loginUserIdForGuest');

    this.setSessionStatusForAuth(false);

    localStorage.setItem('authName', '');
    
    this.getLocalStorageValues('After Social Logout');

    document.cookie = "healthLibraryCookie=";
    localStorage.removeItem('healthLibraryCookie');

    this.router.navigate(['/']);
  }

  logoutUserWithoughtRedirect() {
    this.logId = '';
    this.userInfo = {} as UserInfo;

    // Remove session and user details from localStorage
    this.ss.clearToken(this.ss.TOKEN_USER);
    this.ss.clearToken(this.ss.TOKEN_AUTH_TOKEN);

    this.setSessionStatus(false);

    localStorage.removeItem('loginType');
    localStorage.removeItem('loginUserIdForGuest');

    this.setSessionStatusForAuth(false);

    localStorage.setItem('authName', '');

    document.cookie = "healthLibraryCookie=";
    localStorage.removeItem('healthLibraryCookie');

  }

  getFirstName() {
    return this.userInfo.firstName || '';
  }
  getUserId() {
    return this.userInfo.userId || '';
  }

  getImage(): String {
    return this.userInfo.imageUrl || '';
  }

  getuserInfo() {
    return this.userInfo;
  }
  private logId: any;
  setLogId(id: any) {
    localStorage.setItem("logId", id);
  }
  getLogId() {
    return this.logId = localStorage.getItem("logId");
  }
  clearLogId() {
    localStorage.setItem("logId", '0');
  }

  setUserInfo(data: any) {

    this.userInfo = {
      ...this.userInfo,
      ...data
    };
    this.ss.saveToken(this.ss.TOKEN_USER, this.userInfo);
  }

  setSessionToken(data: aaToken) {
    this.sessionToken = data;
    this.ss.saveToken(this.ss.TOKEN_AUTH_TOKEN, this.sessionToken);

    //this.getAuthTokenForUHIDsUsingEmail(this.userInfo.email); // After login completes, get UHIDs available for the user.
  }


  getAuthTokenForUHIDsUsingPhone(phone: string, otp: string) {
    let ae = c.OCApiUrl + 'PHRTokenWithOTPforSourceApp';
    let params = {
      "OTP": otp,
      "countrycode": "91",
      "phonenumber": phone,
      "sourceApp": "85bb5f00-5f45-464b-8965-1f0a7e331d29~web"
    }
    let authToken = '';

    this.hc.post(ae, params).subscribe(
      (data: any) => {
        this.loadingHide('loadingid');
        if (+data.ResponceCode == 0) {
          authToken = JSON.parse(data.Result).Token;
          // console.log(JSON.parse(data.Result));
          this.getUHIDsFromServer(authToken, "8794872464", 1);
        }
        // console.log('Printing call to get Auth Key');
        // console.log(data);
      }
    );
  }

  getAuthTokenForUHIDsUsingEmail(email: string) {
    let apiEndpoint = c.PRApiUrl + "getauthtoken?email=" + email;
    let uhidEndpoint

    let authToken = '';
    this.hc.get(apiEndpoint).subscribe(
      (data: any) => {
        // console.log('Printing call to get Auth Key');
        // console.log(data);
        this.loadingHide('loadingid');
        if (data.response != null) {
          authToken = data.response;
          this.getUHIDsFromServer(authToken, email, 1);
        } else {
          this.setUserInfo({ uhid: [] });
        }
      }
    );
  }

  getUHIDsFromServer(authToken: string, emailOrPhone: string, ep: number) { // ep = 1 for email and ep = 2 for phone
    let sp = (ep == 1) ? "&email=" + emailOrPhone : "&mobile=" + emailOrPhone;
    let apiEndpoint = c.PRApiUrl + "getusers?authToken=" + authToken + sp;
    this.hc.get(apiEndpoint).subscribe(
      (data: any) => {
        // console.log('Printing call to get UHIDs');
        // console.log(data);
      });
  }

  getUHIDs() {
    return this.uhids.slice();
  }

  getSessionToken() {
    return this.sessionToken;
  }

  setSessionStatus(status: boolean) {
    this.location = this.userInfo.PatientOrigin;
    this.sessionStatus = status;
    this.sessionStatusTracker.next(this.sessionStatus);
  }

  setSessionStatusForAuth(status: boolean) {

    this.sessionStatusTrackerForAuth.next(status);
  }

  getSessionStatus() {
    return this.sessionStatus;
  }

  getDetailsByUHID(uhid: UHID) {
    let api = c.Apiurl + '';
    let params = {
      ...uhid
    };
    this.hc.post(api, params).subscribe(
      (data: any) => {
        //console.log(data);
      }
    );
  }

  getBookingParams() {
    return this.bookingParams;
  }

  setBookingParams(param: number) {
    this.bookingParams = param;
    this.bookingParamsTracker.next(this.bookingParams);
  }

  processAlexaSocialLogin(sdata, ui) {
    let apiEndpoint = c.OCApiUrl + 'CheckUserForAlexaSourceApp';
    let params = {
      AdminId: c.AdminId,
      AdminPassword: c.AdminPassword,
      originIdentity: "mobileclient",
      Name: ui.firstName + ' ' + ui.lastName,
      EmailId: ui.email,
      PhoneNumber: ui.mobileNumber || "",
      ProviderKey: ui.SocialLoginId,
      ProviderId: ui.SocialLoginType,
      EntryType: "0",
      GCMID: "000",
      DeviceInfo: "",
      DevideId: "",
      DOB: ui.dateofBirth || "",
      MarritalStatus: "",
      Gender: ui.gender || "1",
      sourceApp: c.OCSourceApp

    }
    return this.hc.post(apiEndpoint, params)
      .catch(this.errorHandler);
  }

  processPhoneNumberAlexa(userInfo) {
    let apiEndpoint = 'https://app.askapollo.com/ApolloServices/apollo/mobile/getOTP';
    let params = {
      mobileNumber: '91' + userInfo.mobileNumber,
      email: ''
    }
    return this.hc.post(apiEndpoint, params);
  }

  updateAlexa(ui, otp: string) {
    let apiEndpoint = c.OCApiUrl + 'RegistrationAndUpdateForAlexaForSourceApp';
    let params = {
      AdminId: c.AdminId,
      AdminPassword: c.AdminPassword,
      originIdentity: "mobileclient",
      Name: ui.firstName + ' ' + ui.lastName,
      EmailId: ui.email,
      countryCode: '91',
      PhoneNumber: ui.mobileNumber,
      ProviderKey: ui.SocialLoginId,
      ProviderId: ui.SocialLoginType,
      EntryType: "",
      GCMID: "000",
      DeviceInfo: "",
      DevideId: "",
      DOB: ui.dateofBirth,
      MarritalStatus: "",
      Gender: ui.gender,
      SourceApp: c.OCSourceApp,
      IsEmailVerified: '1',
      MobileOTP: otp,
      state: '',
      city: '',
      zipCode: '',
      address: '',
      countryId: '',
      stateId: '',
      cityId: '',
      MMUhid: ''
    }
    return this.hc.post(apiEndpoint, params)
      .catch(this.errorHandler);
  }

  errorHandler(error: HttpErrorResponse) {
    return Observable.throw(error.message || "Server Error");
  }

  getPRToken(): Observable<any> {
    let api = c.OCApiUrl + 'PHRTokenforSourceApp';
    let params = {
      "authenticationTicket": this.userInfo.AuthTokenForPR,
      "patientId": this.userInfo.AskApolloReferenceIdForSelf,
      "phonenumber": this.userInfo.mobileNumber,
      "sourceApp": "85BB5F00-5F45-464B-8965-1F0A7E331D29~web"
    };
    return this.hc.post(api, params);
  }
  getUhids(emaiormobile: any, otp: any): Observable<any> {
    //http://blue.phrdemo.com/ui//data/getusers?authToken=<authToken>&mobile=<mobile number>

    let api = c.MultiSpecialityUrl + 'GetUHIDonEmailorMobileV4';
    let params = {
      RequestId: 2,
      EmailorMobile: emaiormobile,
      ValidationOTP: otp,
      logId: this.getLogId()
    };

    return this.hc.post(api, params);

  }

  getUhidsUsingPrism(): Observable<any> {
    let api = c.MultiSpecialityUrl + 'GetUHIDonOcTokenMobileandOCPatienIdV4';
    let params = {
      "authenticationTicket": this.userInfo.AuthTokenForPR,
      "patientId": this.userInfo.AskApolloReferenceIdForSelf,
      "phonenumber": this.userInfo.mobileNumber,
      "sourceApp": "85BB5F00-5F45-464B-8965-1F0A7E331D29~web"
    };
    return this.hc.post(api, params);

  }

  verifyOTPForOnlineConsultancy(ep: string, otp: string): Observable<any> {

    let apiEndpoint = c.MultiSpecialityUrl + "GetPatientandRelativeDetailsonEmailorMobileV4";
    let params = {
      "EmailorMobile": ep,
      "RequestId": "3",
      "StatusId": this.loginPhoneOrEmailStatusId,
      "ValidationOTP": otp
    }
    return this.hc.post(apiEndpoint, params);
  }

  getAllFamilyMembersDataForBooking() {
    let apiEndpoint = c.OCApiUrl + 'GetAllRelativesByPatientforSourceApp';
    let params = {
      'authenticationTicket': this.userInfo.AuthTokenForPR,
      'patientId': this.userInfo.AskApolloReferenceIdForSelf,
      'sourceApp': c.OCSourceApp,
      'logId': this.getLogId()
    }
    return this.hc.post(apiEndpoint, params);
  }



  getCouponSpecialitiesAnonymousForSourceApp(couponId: any): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/GetCouponSpecialitiesAnonymousForSourceApp 

    let api = c.OCApiUrl + 'GetCouponSpecialitiesAnonymousForSourceApp';
    let params = {
      "authenticationTicket": this.userInfo.AuthTokenForPR,
      "CouponId": couponId,
      'IsConnectNow': "false",
      "sourceApp": c.OCSourceApp
    };
    return this.hc.post(api, params);
    // return Observable.of({
    //   "ResponceCode": "0",
    //   "Result": "[{\"CouponSpecialityId\":99,\"CouponId\":3,\"SpecialityId\":88,\"IsActive\":true,\"IsConnectNow\":false,\"EntityState\":2,\"EntityKey\":{\"EntitySetName\":\"Master_CouponSpecialities\",\"EntityContainerName\":\"AskApolloEntities\",\"EntityKeyValues\":[{\"Key\":\"CouponSpecialityId\",\"Value\":99}],\"IsTemporary\":false}},{\"CouponSpecialityId\":100,\"CouponId\":3,\"SpecialityId\":90,\"IsActive\":true,\"IsConnectNow\":false,\"EntityState\":2,\"EntityKey\":{\"EntitySetName\":\"Master_CouponSpecialities\",\"EntityContainerName\":\"AskApolloEntities\",\"EntityKeyValues\":[{\"Key\":\"CouponSpecialityId\",\"Value\":100}],\"IsTemporary\":false}},{\"CouponSpecialityId\":101,\"CouponId\":3,\"SpecialityId\":91,\"IsActive\":true,\"IsConnectNow\":false,\"EntityState\":2,\"EntityKey\":{\"EntitySetName\":\"Master_CouponSpecialities\",\"EntityContainerName\":\"AskApolloEntities\",\"EntityKeyValues\":[{\"Key\":\"CouponSpecialityId\",\"Value\":101}],\"IsTemporary\":false}}]"
    // })
  }

  getCouponDetailsAnonymousForSourceApp(couponCode: any, blockId: any): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/GetCouponDetailsAnonymousForSourceApp 

    // let api = c.OCApiUrl + 'GetCouponDetailsAnonymousForSourceApp';
    let api = c.OCApiUrl + 'ValidateCouponAnonymousForSourceApp';

    let params = {
      "authenticationTicket": this.userInfo.AuthTokenForPR,
      "couponCode": couponCode,
      "intermbookappointmentId": blockId,
      "sourceApp": c.OCSourceApp
    };
    //console.log(params)
    return this.hc.post(api, params);
  }
  /*getCouponDetailsAnonymousForSourceApp(couponCode: any): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/GetCouponDetailsAnonymousForSourceApp 

    let api = c.OCApiUrl + 'GetCouponDetailsAnonymousForSourceApp';
    let params = {
      "authenticationTicket": this.userInfo.AuthTokenForPR,
      "CouponCode": couponCode,
      "sourceApp": c.OCSourceApp
    };
    return this.hc.post(api, params);
    // return Observable.of({
    //   "ResponceCode": "0",
    //   "Result": "[{\"CouponId\":3,\"CouponCode\":\"AXAA10\",\"FromDate\":\"\\/Date(1469039400000)\\/\",\"ToDate\":\"\\/Date(1488306600000)\\/\",\"DiscountPercentage\":\"10\",\"CorporateName\":\"\",\"CorpotateCode\":\"\",\"CreatedDate\":\"\\/Date(1459276200000)\\/\",\"IsActive\":true,\"ApplyForFamilyPhysician\":true,\"ApplyForSpecialist\":true,\"ApplyForBoard\":false,\"DiscountAmount\":\"0\",\"IsPercentage\":true,\"CreatedBy\":null,\"ModifiedBy\":\"2e2df542-61ea-4136-ab0e-11a01ebab4b2\",\"ModifiedDate\":\"\\/Date(1485768104727)\\/\",\"IsMultipleSpecialities\":true,\"IsMultipleConnectNow\":true,\"CurrencyType\":null,\"EntityState\":2,\"EntityKey\":{\"EntitySetName\":\"Master_Coupon\",\"EntityContainerName\":\"AskApolloEntities\",\"EntityKeyValues\":[{\"Key\":\"CouponId\",\"Value\":3}],\"IsTemporary\":false}}]"
    // }
    // )
  }*/



  getWalletPointsRedeemptionOneApolloForSourceApp(request: any): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/GetWalletPointsRedeemptionOneApolloForSourceApp

    let api = c.OCApiUrl + 'GetWalletPointsRedeemptionOneApolloForSourceApp';
    let params = {
      "AdminId": c.AdminId,
      "AdminPassword": c.AdminPassword,
      "MobileNo": this.userInfo.mobileNumber,
      "CustomerPoints": request.customerPoints,
      "passCode": request.passCode,
      "refBillNo": request.refBillNo,
      "storeCode": c.storeCode,
      "RedeemWalletrequest": request.redeemWalletrequest,
      "Source": c.OCSourceApp
    };
    return this.hc.post(api, params);

  }

  getWalletPointsForOneApollo(CustomerPoints: any, blockId: any): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/GetWalletPointsForOneApollo

    let api = c.OCApiUrl + 'GetWalletPointsForOneApolloForSourceApp';
    let params = {
      "adminId": c.AdminId,
      "adminPassword": c.AdminPassword,
      "MobileNo": this.userInfo.mobileNumber,
      "CustomerPoints": CustomerPoints.toString(),
      "PatientId": this.userInfo.AskApolloReferenceIdForSelf,
      "IntremAppId": blockId.toString(),
      "Source": c.OCSourceApp
    };
    return this.hc.post(api, params);
  }

  getWalletBalncePointsForOneApollo(): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/GetMyWalletBalanceForOneApolloForSourceApp

    let api = c.OCApiUrl + 'GetMyWalletBalanceForOneApolloForSourceApp';
    let params = {
      "adminId": c.AdminId,
      "adminPassword": c.AdminPassword,
      "MobileNo": this.userInfo.mobileNumber,
      "SourceApp": c.OCSourceApp
    };
    return this.hc.post(api, params);

  }

  getSpecialitiesAnonymousByFlagForSourceApp(): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/GetSpecialitiesAnonymousByFlagForSourceApp

    let api = c.OCApiUrl + 'GetSpecialitiesAnonymousByFlagForSourceApp';
    let params = {
      "adminId": c.AdminId,
      "adminPassword": c.AdminPassword,
      'Flag': 'true',
      "SourceApp": c.OCSourceApp
    };
    return this.hc.post(api, params);

  }

  getWalletPointsRedeemptionOneApollo(CustomerPoints: any): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/GetWalletPointsRedeemptionOneApollo

    let api = c.OCApiUrl + 'GetWalletPointsRedeemptionOneApollo';
    let params = {
      "adminId": c.AdminId,
      "adminPassword": c.AdminPassword,
      "MobileNo": this.userInfo.mobileNumber,
      "CustomerPoints": CustomerPoints,
      "passCode": "",
      "refBillNo": "",
      "storeCode": "",
      "RedeemWalletrequest": "",
      "sourceApp": c.OCSourceApp
    };
    return this.hc.post(api, params);

  }

  resendOTPForOneApollo(CustomerPoints: any, IntremID: any): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/ResendOTPForOneApollo

    let api = c.OCApiUrl + 'ResendOTPForOneApollo';
    let params = {
      "adminId": c.AdminId,
      "adminPassword": c.AdminPassword,
      "MobileNo": this.userInfo.mobileNumber,
      "IntremID": IntremID,
      "UserId": this.userInfo.AskApolloReferenceIdForSelf,
      "sourceApp": c.OCSourceApp
    };
    return this.hc.post(api, params);

  }

  getMarchantIdAnonymousforSourceApp(): Observable<any> {
    //http://rest.askapollo.com:9047/restservice.svc/GetMarchantIdAnonymousforSourceApp 


    let api = c.OCApiUrl + 'GetMarchantIdAnonymousforSourceApp';
    let params = {
      "AdminId": c.AdminId,
      "AdminPassword": c.AdminPassword,
      "sourceApp": c.OCSourceApp
    };
    return this.hc.post(api, params);

  }

  BlockAppointmentEdocforSourceApp(request: any): Observable<any> {

    let api = c.OCApiUrl + 'BlockAppointmentEdocforSourceApp';
    let params = {
      "authenticationTicket": this.userInfo.AuthTokenForPR,
      "doctorId": request.doctorId,
      'patientId': this.userInfo.AskApolloReferenceIdForSelf,
      'relationId': request.relationId.toString(),
      //'createdDate': request.createdDate.toLocaleDateString("en-US"),
      'createdDate': this.getDDMMYYYFormate(new Date()),
      'amount': request.afterDiscount.toString(),
      'marchantId': request.merchantId,
      'locationId': request.locationId.toString(),
      "specialityId": request.specialityId.toString(),
      'hospitalId': request.hospitalId.toString(),
      'consultationTypeId': request.consultationTypeId.toString(),
      'categoryId': request.CategoryId.toString(),
      'appointmentDate': request.AppointmentDate.replace('/', '-').replace('/', '-').replace('/', '-'),
      'appointmentTime': request.AppointmentTime,
      'reviewReferenceVisitId': request.VisitId.toString(),
      'edocDoctorId': request.edocDocId.toString(),
      'CurrencyFormat': request.feeType,
      'TimeZone': request.timeZone,
      'ReviewRemarks': request.reviewRemarks,
      'pgId': '1001',
      "sourceApp": c.OCSourceApp
    };
    return this.hc.post(api, params);
  }

  getDDMMYYYFormate(date: any) {

    var dd = date.getDate();
    var mm = date.getMonth() + 1; //January is 0!

    var yyyy = date.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }

    return dd + '-' + mm + '-' + yyyy;

  }

  insertPaytmRequestInfoForSourceApp(paymentInfo: any): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/InsertPaytmRequestInfoForSourceApp 

    let api = c.OCApiUrl + 'InsertPaytmRequestInfoForSourceApp';
    let params = {
      "authenticationTicket": this.userInfo.AuthTokenForPR,
      "patientId": this.userInfo.AskApolloReferenceIdForSelf,
      'marchantId': paymentInfo.marchantId,
      'amount': paymentInfo.amount,
      'MobileNo': this.userInfo.mobileNumber,
      'EmailId': this.userInfo.email,
      'createdBy': '',
      'InterBookAppointmentId': '',
      "sourceApp": c.OCSourceApp
    };
    return this.hc.post(api, params);

  }

  thirdPartyPayment(paymentInfo: any): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/InsertPaytmRequestInfoForSourceApp 
    let api = c.paymentURL;

    let returnURL = c.returnURL;
    let params = {
      "sourceApp": c.OCSourceApp,
      "patientId": this.userInfo.AskApolloReferenceIdForSelf,
      "PatientName": this.userInfo.firstName + " " + this.userInfo.lastName,
      'EmailId': this.userInfo.email,
      'MobileNo': this.userInfo.mobileNumber,
      "authenticationTicket": this.userInfo.AuthTokenForPR,
      'marchantId': paymentInfo.marchantId,
      'amount': paymentInfo.amount,
      'DiscAmount': paymentInfo.DiscAmount,
      'InterBookAppointmentId': '0',
      'IsCouponApplied': paymentInfo.IsCouponApplied,
      'CouponId': paymentInfo.CouponId,
      'GatewayName': 'Paytm',
      'TransactionAmount': paymentInfo.TransactionAmount,
      'WalletPoints': paymentInfo.WalletPoints,
      'ReturnURL': returnURL,
      'CurrencyFormat': paymentInfo.CurrencyFormat,
      'IsboardPayment': 'flase',
      'AppointmentID': '0',
      'BoardappDetailsId': '0',
    };
    return this.hc.post(api, params);

  }


  getPromoCouponInfoForOneApollo(couponCode: any): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/GetPromoCouponInfoForOneApollo

    let api = c.OCApiUrl + 'GetPromoCouponInfoForOneApollo';
    let params = {
      "adminId": c.AdminId,
      "adminPassword": c.AdminPassword,
      "couponCode": couponCode,
      "storeCode": "TelHel",
      "refBillNo": "201712221550159",
      "type": "0",
      "IntremAppID": "16657",
      "RWPID": "0",
      "RCCID": "65",
      "UserID": this.userInfo.AskApolloReferenceIdForSelf,
      "CouponDiscAmt": "10",
      "sourceApp": c.OCSourceApp
    };
    //return this.hc.post(api, params);
    return Observable.of({
      "ResponceCode": "0",
      "Result": "[{\"CouponId\":3,\"CouponCode\":\"AXAA10\",\"FromDate\":\"\\/Date(1469039400000)\\/\",\"ToDate\":\"\\/Date(1488306600000)\\/\",\"DiscountPercentage\":\"10\",\"CorporateName\":\"\",\"CorpotateCode\":\"\",\"CreatedDate\":\"\\/Date(1459276200000)\\/\",\"IsActive\":true,\"ApplyForFamilyPhysician\":true,\"ApplyForSpecialist\":true,\"ApplyForBoard\":false,\"DiscountAmount\":\"0\",\"IsPercentage\":true,\"CreatedBy\":null,\"ModifiedBy\":\"2e2df542-61ea-4136-ab0e-11a01ebab4b2\",\"ModifiedDate\":\"\\/Date(1485768104727)\\/\",\"IsMultipleSpecialities\":true,\"IsMultipleConnectNow\":true,\"CurrencyType\":null,\"EntityState\":2,\"EntityKey\":{\"EntitySetName\":\"Master_Coupon\",\"EntityContainerName\":\"AskApolloEntities\",\"EntityKeyValues\":[{\"Key\":\"CouponId\",\"Value\":3}],\"IsTemporary\":false}}]"
    }
    )
  }

  getPendingCaseSheet(): Observable<any> {
    let zone = new Date().toString().match(/([-\+][0-9]+)\s/)[1];
    let timeZone = (zone.slice(0, 3) + ":" + zone.slice(3, 5));
    let api = c.OCApiUrl + 'GetPendingCasesheetForSourceAppbytimezone';
    let params = {
      "authenticationTicket": this.userInfo.AuthTokenForPR,
      "patientId": this.userInfo.AskApolloReferenceIdForSelf,
      "sourceApp": c.OCSourceApp,
      "timezone": timeZone
    };
    return this.hc.post(api, params);

  }

  // getPendingCaseSheet(): Observable<any> {

  //   let api = c.OCApiUrl + 'GetPendingCasesheetForSourceApp';
  //   let params = {
  //     "authenticationTicket": this.userInfo.AuthTokenForPR,
  //     "patientId": this.userInfo.AskApolloReferenceIdForSelf,
  //     "sourceApp": c.OCSourceApp
  //   };
  //   return this.hc.post(api, params);

  // }

  getPendingCaseSheetAllDetails(visitId: any): Observable<any> {


    let api = c.OCApiUrl + 'getSavedCasesheetForSourceApp';
    let params = {
      "adminId": "AskApollo",
      "VisitID": visitId.toString(),
      "adminPassword": "AskApollo"
    };
    return this.hc.post(api, params);
    //return Observable.of({ "authenticationTicket": "B971B249097472BC1B995A7BECE773A9C706E523E3B0ED56551BB1E351452EFC6CD561A09ABE6D8C9388E5A239EAAB879DDA6B1BF8F7B3827DF3979A39D6C606825C24A2C0F3C3227D73C03558FEA43B6AC7F1B7BA4FD95385784FAAEFB0CE3D188F7FAA4597F829CA49D54E47695AF547708FD766DE08A7030E40D4DC887207E63900C3E245D469140D86C7B8E265616F5D51A18A314CEA87D3F6E049161DA80DB5CA62", "patientId": "8a0dc71d-772a-4610-a730-f3d6961b3628", "visitId": "5900", "relationId": 0, "uhid": "AC01.0003220618", "height": "34  (100.6 cms)", "weight": "2 kg (2.2 lbs)", "presentComplaints": "complaints", "pastHistory": "", "familyHistory": "None", "personalHistory": "{\"fName\":\"fname\",\"lName\":\"lname\",\"haveUVisitApolloHospital\":\"No\",\"city\":\"Hyd\",\"age\":\"26\",\"gender\":\"Male\",\"occupation\":\"\",\"foodPreferance\":\"\",\"tobacco\":\"\",\"alcohol\":\"\",\"OtherInformation\":\"\"}", "presentMedication": "[{\"index\":0,\"medicine\":\"M1\",\"dosage\":\"Once in a day\",\"started\":\"22/07/2018\"},{\"index\":1,\"medicine\":\"M2\",\"dosage\":\"Twice in a day\",\"started\":\"22/07/2018\"}]", "allergies": "[{\"item_id\":1,\"item_text\":\"Food\"},{\"item_id\":2,\"item_text\":\"Medicine\"}]", "anyOtherDetails": "", "reviewReferenceVisitId": "0", "patientRelationId": "0", "bloodGroup": "", "PatientUHID": "AC01.0003220618" }
    //)
  }

  getNewPendingCaseSheetAllDetails(visitId: any): Observable<any> {


    let api = c.OCApiUrl + 'GetNewSavedCasesheetForSourceApp';
    let params = {
      "adminID": "AskApollo",
      "VisitID": visitId.toString(),
      "adminPassword": "AskApollo"
    };
    return this.hc.post(api, params);
    //return Observable.of({ "authenticationTicket": "B971B249097472BC1B995A7BECE773A9C706E523E3B0ED56551BB1E351452EFC6CD561A09ABE6D8C9388E5A239EAAB879DDA6B1BF8F7B3827DF3979A39D6C606825C24A2C0F3C3227D73C03558FEA43B6AC7F1B7BA4FD95385784FAAEFB0CE3D188F7FAA4597F829CA49D54E47695AF547708FD766DE08A7030E40D4DC887207E63900C3E245D469140D86C7B8E265616F5D51A18A314CEA87D3F6E049161DA80DB5CA62", "patientId": "8a0dc71d-772a-4610-a730-f3d6961b3628", "visitId": "5900", "relationId": 0, "uhid": "AC01.0003220618", "height": "34  (100.6 cms)", "weight": "2 kg (2.2 lbs)", "presentComplaints": "complaints", "pastHistory": "", "familyHistory": "None", "personalHistory": "{\"fName\":\"fname\",\"lName\":\"lname\",\"haveUVisitApolloHospital\":\"No\",\"city\":\"Hyd\",\"age\":\"26\",\"gender\":\"Male\",\"occupation\":\"\",\"foodPreferance\":\"\",\"tobacco\":\"\",\"alcohol\":\"\",\"OtherInformation\":\"\"}", "presentMedication": "[{\"index\":0,\"medicine\":\"M1\",\"dosage\":\"Once in a day\",\"started\":\"22/07/2018\"},{\"index\":1,\"medicine\":\"M2\",\"dosage\":\"Twice in a day\",\"started\":\"22/07/2018\"}]", "allergies": "[{\"item_id\":1,\"item_text\":\"Food\"},{\"item_id\":2,\"item_text\":\"Medicine\"}]", "anyOtherDetails": "", "reviewReferenceVisitId": "0", "patientRelationId": "0", "bloodGroup": "", "PatientUHID": "AC01.0003220618" }
    //)
  }

  getDocumentsForCaseSheetforSourceApp(visitId: any): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/GetDocumentsForCaseSheetforSourceApp 

    let api = c.OCApiUrl + 'GetDocumentsForCaseSheetforSourceApp';
    let params = {
      "authenticationTicket": this.userInfo.AuthTokenForPR,
      "visitId": visitId,
      "sourceApp": c.OCSourceApp
    };
    return this.hc.post(api, params);
    // return Observable.of({
    //   "ResponceCode": "0",
    //   "Result": "[{\"Sno\":1,\"DocumentName\":\"Prescription\",\"FileName\":\"ATHS201703091618180036.pdf\",\"Description\":\"Prescription\",\"VisitId\":3697,\"DocumentId\":1759,\"FileFormat\":\"pdf\",\"size\":213776}]"
    // }
    // )
  }

  // AppointmentPatientInfo: any = {
  //   type: 'self',

  //   firstName: '',
  //   lastNmae: '',
  //   dob: '',
  //   gender: 'male',

  //   bmi: '',
  //   city: '',
  //   haveUVisitApolloHospital: 'No',
  //   uhidSelf: '',
  // }


  saveCaseSheet(appointmentInfo: any, patientInfo: any): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/SaveCaseSheet

    let api = c.OCApiUrl + 'SaveCaseSheet';
    let params = {
      "authenticationTicket": this.userInfo.AuthTokenForPR,
      "visitId": appointmentInfo.VisitId,
      "relationId": patientInfo.relativeId,
      "uhid": patientInfo.uhidRelative,
      "height": patientInfo.height,
      'weight': patientInfo.weight,
      'presentComplaints': patientInfo.complaints,
      'pastHistory': '',
      'familyHistory': '',
      'personalHistory': '',
      'presentMedication': patientInfo.medications,
      'allergies': patientInfo.allergies,
      'anyOtherDetails': '',
      'reviewReferenceVisitId': '',
      'patientRelationId': '',
      'bloodGroup': '',
      'PatientUHID': patientInfo.uhidSelf,
      "sourceApp": c.OCSourceApp
    };
    return this.hc.post(api, params);
    // return Observable.of({
    //   "ResponceCode": "0",
    //   "Result": "[{\"Sno\":1,\"DocumentName\":\"Prescription\",\"FileName\":\"ATHS201703091618180036.pdf\",\"Description\":\"Prescription\",\"VisitId\":3697,\"DocumentId\":1759,\"FileFormat\":\"pdf\",\"size\":213776}]"
    // }
    // )
  }

  saveAndSubmitCaseSheet(appointmentInfo: any, patientInfo: any, selectedUHIDSelf: any, type: any): Observable<any> {


    let pHistoryString = "age:" + patientInfo.age + ",gender:" + patientInfo.gender + ",occupation:Select Occupation,foodPreferance:1,tobacco:No,alcohol:No";

    let api = c.OCApiUrl + 'SaveAndSubmitCaseSheetForSourceApp';
    if (type == 'save') {
      api = c.OCApiUrl + 'SaveCaseSheetForSourceApp';
    }

    let allergies = '';
    let medications = '';

    for (let m of patientInfo.presentMedicationObject) {
      let patdate = moment(m.started, "DD/MM/YYYY").format('DD/MM/YYYY');
      if (medications == '') {
        medications = m.medicine + ',' + m.dosage + "," + patdate;
      } else {
        medications = medications + ";" + m.medicine + ',' + m.dosage + "," + patdate;
      }
    }

    for (let m of patientInfo.allergiesObject) {
      if (allergies == '') {
        allergies = m.item_text;
      } else {
        allergies = allergies + "," + m.item_text;
      }
    }



    let params = {
      "authenticationTicket": this.userInfo.AuthTokenForPR,
      "patientId": this.userInfo.AskApolloReferenceIdForSelf,
      "visitId": appointmentInfo.VisitId.toString(),
      "relationId": patientInfo.relationId.toString(),//has to check this is really required
      "uhid": this.userInfo.uhid,
      "height": patientInfo.height,
      'weight': patientInfo.weight,
      'presentComplaints': patientInfo.presentComplains,
      'pastHistory': patientInfo.pastHistory,
      'familyHistory': 'None',
      'personalHistory': pHistoryString,
      'presentMedication': medications,
      'allergies': allergies,
      'anyOtherDetails': '',
      'reviewReferenceVisitId': '0',
      'patientRelationId': patientInfo.relationId.toString(),
      'bloodGroup': '',
      'PatientUHID': patientInfo.patientUHID,
      "AllergiesObject": JSON.stringify(patientInfo.allergiesObject),
      "PresentMedicationObject": JSON.stringify(patientInfo.presentMedicationObject),
      "SourceApp": c.OCSourceApp,
      "City": patientInfo.city
    };

    return this.hc.post(api, params);

  }

  saveAndSubmitNewCaseSheet(appointmentInfo: any, patientInfo: any, selectedUHIDSelf: any, type: any): Observable<any> {


    let pHistoryString = "age:" + patientInfo.age + ",gender:" + patientInfo.gender + ",occupation:Select Occupation,foodPreferance:1,tobacco:No,alcohol:No";

    let api = c.OCApiUrl + 'SaveAndSubmitNewCaseSheetForSourceApp';
    if (type == 'save') {
      api = c.OCApiUrl + 'SaveNewCaseSheetForSourceApp';
    }

    let allergies = '';
    let medications = '';

    let allergiesObject = patientInfo.allergiesObject;
    let presentComplaintsObject = patientInfo.presentComplaintsObject;
    // for (let m of patientInfo.presentMedicationObject) {
    //   let patdate = moment(m.started, "MM/DD/YYYY").format('MM/DD/YYYY');
    //   m.started = patdate;
    // }

    // for (let m of patientInfo.allergiesObject) {
    //   if (allergies == '') {
    //     allergies = m.item_text;
    //   } else {
    //     allergies = allergies + "," + m.item_text;
    //   }
    // }
    for (let m of allergiesObject) {
      if (m.item_text == 'Others') {
        m.item_description = patientInfo.OtherAllergies;
      }
    }
var prlen=presentComplaintsObject.length;
    for (let m of presentComplaintsObject) {
      if(m.symptoms==undefined){
        if (m[0].symptoms == 'Others' || m[0].symptoms == "Others") {
          m[0].symptomsdescription = patientInfo.OtherpresentComplaints;
        }
      }else{
      if (m.symptoms == 'Others' || m.symptoms == "Others") {
        m.symptomsdescription = patientInfo.OtherpresentComplaints;
      }
    }
    }


    let params = {
      "authenticationTicket": this.userInfo.AuthTokenForPR,
      "patientId": this.userInfo.AskApolloReferenceIdForSelf,
      "visitId": appointmentInfo.VisitId.toString(),
      "PatientRelationID": patientInfo.relationId.toString(),//has to check this is really required
      'PatientUHID': (patientInfo.patientUHID == 'Not sure.. proceed!' || patientInfo.patientUHID == '') ? '' : patientInfo.patientUHID,
      "uhid": this.userInfo.uhid,

      'BloodGroup': '',
      'height': patientInfo.height,
      'weight': patientInfo.weight,

      'IsSmoker': patientInfo.isSmoker,
      'smokingstoppeddate': patientInfo.whendidyoustoppedSmoking,
      'Howmanycigeratesperday': patientInfo.howManyCigarretesperDay,
      'Howmanyyearssmoked': patientInfo.howManyYearsSmoked,
      'HowFrequentlySmoke': patientInfo.howFrequentlySmoke,

      'IsDrinker': patientInfo.isDrinker,
      'HowlongUrDrinking': patientInfo.howlongUrDrinking,
      'HowFrequentlyDrink': patientInfo.HowFrequentlyDrink,
      'Whendidyoustoppeddrinking': patientInfo.whendidyoustoppedDrinking,

      'Diet': patientInfo.Diet,
      'DoyouExcersiceDaily': patientInfo.doyouExcerciseDaily,
      'Whichexcersize': '',
      'howmanydaysinaweek': '',
      'howmuchtimeperday': '',

      'Hypertension': patientInfo.hypertension,
      'Diabeties': patientInfo.diabeties,
      'HeartDisease': patientInfo.heartDisease,
      'Anemia': patientInfo.anemia,
      'Cancer': patientInfo.cancer,

      'HypertensioninFamily': patientInfo.hypertensioninFamily,
      'DiabetiesinFamily': patientInfo.diabetiesinFamily,
      'HeartDiseaseinFamily': patientInfo.heartDiseaseinFamily,
      'AnemiainFamily': patientInfo.anemiainFamily,
      'CancerinFamily': patientInfo.cancerinFamily,

      'presentComplaints': patientInfo.presentComplains,
      'PresentcomplaintsObject': JSON.stringify(presentComplaintsObject),

      'presentMedication': medications,
      'PresentMedicationObject': JSON.stringify(patientInfo.presentMedicationObject),

      'Allergies': '',
      'AllergiesObject': JSON.stringify(allergiesObject),

      'anyOtherDetails': '',
      'City': patientInfo.city,
      'SourceApp': c.OCSourceApp
    };
    //console.log(params);
    return this.hc.post(api, params);

  }

  createSocketInformaion(): Observable<any> {
    let apiEndpoint = c.OCApiUrl + 'SocketURl';
    let params = {
      'authenticationTicket': this.userInfo.AuthTokenForPR,
      'patientId': this.userInfo.AskApolloReferenceIdForSelf,
      'sourceApp': c.OCSourceApp,
    }
    return this.hc.post<any>(apiEndpoint, params);

  }


  loadSocket() {

    this.createSocketInformaion().subscribe(data => {

      if (data != null && data.ResponceCode == "0" && data.Result != '') {
        //console.log('socket data  received');
        let socDetails = JSON.parse(data.Result);
        this.sockURL = socDetails.SockURL;
        this.sockUserID = socDetails.UserId.toLowerCase();
        this.socketVideoURL = socDetails.VideoURL;
        this.startSocket(this.sockURL, this.sockUserID, this.socketVideoURL);

      } else {
        //console.log('socket data  unable to get');
      }
    })
  }

  sock: WebSocket;
  sockURL: any;
  sockUserID: any;
  socketVideoURL: any;
  scketResponse: any;

  reOpenSocket() {
   // console.log('open socket');
    this.sock.onopen = () => this.sock.send(JSON.stringify({
      type: 'userID',
      value: this.sockUserID
    }));;

  }

  openopoup() {
    document.getElementById('myModal').style.display = "block";;
  }
  closepopup() {
    document.getElementById('myModal').style.display = "none";;
  }
  startSocket(websocketServerLocation, userId, viedeoUrl) {
    //console.log('strt socket');
    var callStatus = "";
    this.sock = new WebSocket(websocketServerLocation);
    var socket = this.sock;
    var docName = "";

    this.sock.onmessage = function (event) {

      //console.log('strt recived message');
      let dataRes = JSON.parse(event.data);

      docName = dataRes.message.doctor_name;
      localStorage.setItem('dataFromTestVideo', event.data);
      openopoup();

      setTimeout(function () {
        UnAnsercall();
        window.location.reload();
      }, 60000);

    };
    this.reOpenSocket();

    this.sock.onclose = function () {
      //console.log('close socket');
      // Try to reconnect in 5 seconds
      setTimeout(function () { this.start(websocketServerLocation) }, 5000);
    };

    function openopoup() {
      document.getElementById('myModal').style.display = "block";
      document.getElementById("pMsg").innerHTML = "you have appointment with " + docName + " Do you wants to contine video call?"
    }
    function closepopup() {
      document.getElementById('myModal').style.display = "none";
    }

    function UnAnsercall() {
      //console.log('call rejected socket');
      let data = JSON.parse(localStorage.getItem('dataFromTestVideo'));

      var scketResponse = {
        type: data.type,
        message: data.message.message,
        client_id: data.message.client_id,
        serverKey: data.message.serverKey,
        accessKey: data.message.accessKey,
        patient_name: data.message.patient_name,
        doctor_id: data.message.doctor_id,
        doctor_name: data.message.doctor_name,
        patient_id: data.message.patient_id,
        visit_id: data.message.visit_id,
        consultation_slot: data.message.consultation_slot,
        token: data.message.token,
        speciality: data.message.speciality,
        send_list: data.message.send_list,
        sending_from: data.message.sending_from,
        time: data.message.time
      }

      socket.send(JSON.stringify({
        type: 'unanswered',
        send_list: [scketResponse.doctor_id],
        sending_from: scketResponse.patient_name
      }))
    }
  }

  acceptCall() {

    document.getElementById('myModal').style.display = "none";
    let data = JSON.parse(localStorage.getItem('dataFromTestVideo'));

    this.scketResponse = {
      type: data.type,
      message: data.message.message,
      client_id: data.message.client_id,
      serverKey: data.message.serverKey,
      accessKey: data.message.accessKey,
      patient_name: data.message.patient_name,
      doctor_id: data.message.doctor_id,
      doctor_name: data.message.doctor_name,
      patient_id: data.message.patient_id,
      visit_id: data.message.visit_id,
      consultation_slot: data.message.consultation_slot,
      token: data.message.token,
      speciality: data.message.speciality,
      send_list: data.message.send_list,
      sending_from: data.message.sending_from,
      time: data.message.time
    }

    this.sock.send(JSON.stringify({
      type: 'callAccepted',
      send_list: [this.scketResponse.doctor_id],
      sending_from: this.scketResponse.patient_name
    }))


    window.open(this.socketVideoURL + 'token=' + this.scketResponse.token +
      '&visit_id=' + this.scketResponse.visit_id + '&user_id=' + this.sockUserID + '', '_blank');
    this.sock.send(JSON.stringify({
      type: 'userID',
      value: this.sockUserID //$('#hfUserId').val()
    }))

  }

  rejectVideoCall() {
    document.getElementById('myModal').style.display = "none";
    let data = JSON.parse(localStorage.getItem('dataFromTestVideo'));

    this.scketResponse = {
      type: data.type,
      message: data.message.message,
      client_id: data.message.client_id,
      serverKey: data.message.serverKey,
      accessKey: data.message.accessKey,
      patient_name: data.message.patient_name,
      doctor_id: data.message.doctor_id,
      doctor_name: data.message.doctor_name,
      patient_id: data.message.patient_id,
      visit_id: data.message.visit_id,
      consultation_slot: data.message.consultation_slot,
      token: data.message.token,
      speciality: data.message.speciality,
      send_list: data.message.send_list,
      sending_from: data.message.sending_from,
      time: data.message.time
    }

    this.sock.send(JSON.stringify({
      type: 'rejectCall',
      send_list: [this.scketResponse.doctor_id],
      sending_from: this.scketResponse.patient_name
    }))

  }


  RejectCallService(visitId: any): Observable<any> {
    let apiEndpoint = c.OCApiUrl + 'RejectCallService';
    let params = {
      'authenticationTicket': this.userInfo.AuthTokenForPR,
      'patientId': this.userInfo.AskApolloReferenceIdForSelf,
      'visitId': visitId,
      'sourceApp': c.OCSourceApp,
    }
    return this.hc.post<any>(apiEndpoint, params);

  }
  logoutUserSideNav() // saravana 
  {
    this.userInfo = {} as UserInfo;

    // Remove session and user details from localStorage
    this.ss.clearToken(this.ss.TOKEN_USER);
    this.ss.clearToken(this.ss.TOKEN_AUTH_TOKEN);

    this.setSessionStatus(false);
    localStorage.clear();
    return true;
  }

  addFeedBack(feedBackTitle: string, feedback: string, email: string, reason: string): Observable<any> {
    let apiEndpoint = c.OCApiUrl + 'SubmitFeedBackForSourceApp';
    //let apiEndpoint = 'http://rest.askapollo.com:9047/RestService.svc/SubmitFeedBackForSourceApp';
    let params = {
      'adminId': c.AdminId,
      'adminPassword': c.AdminPassword,
      'PatientId': this.userInfo.AskApolloReferenceIdForSelf,
      'Rating': feedBackTitle,
      'RatingOption': reason,
      'RatingComments': feedback,
      'SourceApp': c.OCSourceApp
    }
    return this.hc.post(apiEndpoint, params);
    /*let apiEndpoint =  "https://service.askapollo.com:44344/physicalconsultapi/api/MultiSpecialitytoDoctors/PostSaveFeedBackv4";
    let params = {
      feedbackTitle: feedBackTitle,
      feedback: feedback,
      doctorId: '',//integrate doc id
      createdBy: this.userInfo.firstName + ' ' + this.userInfo.lastName,
      createdIP: ''
    }
    return this.hc.post(apiEndpoint, params);*/
  }

  loadingHide(id: any) {
    var el = document.getElementById(id);
    if (el != undefined && el != null)
      el.style.display = "none";

    // var el = document.getElementById('contentId');
    //el.style.display = "block";
  }
  loadingShow(id: any) {
    var el = document.getElementById(id);
    if (el != undefined && el != null)
      el.style.display = "block";

    //var el = document.getElementById('contentId');
    //el.style.display = "none";
  }
  headerTextTracker = new Subject<string>();
  headerSuggesionTracker(val: any) {
    this.headerTextTracker.next(val);
  }

  setAppointmentType(type: any) {
    //11  login - for relative 
    //12 login - not sure
    //13 login - self
    //14 not login - email
    //15 mot login - mobile
    //16 not login - uhid
    //17 not login - not sure
    localStorage.setItem('appointmentType', type);
  }
  getAppointmentType() {
    //11  login - for relative 
    //12 login - not sure
    //13 login - self
    //14 not login - email
    //15 mot login - mobile
    //16 not login - uhid
    //17 not login - not sure
    return localStorage.getItem('appointmentType');
  }
  getRegisterForlms(req: any): Observable<any> {
    let api = c.OCApiUrl + "PushCustomerDataForOneApolloLMS";

    let params =
    {
      "adminID": c.AdminId,
      "adminPassword": c.AdminPassword,
      "patientID": req.patientID,
      "FirstName": req.FirstName,
      "LastName": req.LastName,
      "registration_date": req.registration_date,
      "Mobile": req.Mobile,
      "AlterMobile": "",
      "EmergencyMobile": "",
      "Email": req.Email,
      "Gender": req.Gender,
      "DOB": "",
      "ReferMobile": "",
      "Source": c.OCSourceApp
    }

    return this.hc.post(api, params);
  }
  getWalletPointsForlms(req: string): Observable<any> {
    let api = c.OCApiUrl + "GetByBUIDForOneApolloLMSForSourceApp";

    let params =

    {
      "adminID": c.AdminId,
      "adminPassword": c.AdminPassword,
      "ByBUID": req,
      "SourceApp": c.OCSourceApp
    }
    return this.hc.post(api, params);
  }

  lmsSmsRequest(req: any): Observable<any> {
    let api = c.OCApiUrl + "SendOTPForOneApolloLMS";

    let params =
    {
      "adminID": c.AdminId,
      "adminPassword": c.AdminPassword,
      "Email": req.Email,
      "PatientId": req.PatientId,
      "InterBookAppId": req.InterBookAppId,
      "Mobile": req.Mobile,
      "CreditPoints": req.CreditPoints,
      "SourceApp": c.OCSourceApp
    }

    return this.hc.post(api, params);
  }

  lmsResendSms(req: any): Observable<any> {
    let api = c.OCApiUrl + "ResendOTPForOneApolloLMS";
    let params =
    {
      "adminID": c.AdminId,
      "adminPassword": c.AdminPassword,
      "RedeemRequestId": req.RedeemRequestId,
      "Mobile": req.Mobile
    }
    return this.hc.post(api, params);
  }

  lmsOTPvalidate(req: any): Observable<any> {
    let api = c.OCApiUrl + "ValidateOTPForOneApolloLMS";
    let params =
    {
      "adminID": c.AdminId,
      "adminPassword": c.AdminPassword,
      "RedeemRequestId": req.RedeemRequestId,
      "Mobile": req.Mobile,
      "OTP": req.OTP
    }
    return this.hc.post(api, params);
  }

  lmsCancelRedeem(mobile: string, requestId: string): Observable<any> {
    let api = c.OCApiUrl + 'CancelRedemptionForOneApolloLMS';
    let params =
    {

      "adminID": c.AdminId,
      "adminPassword": c.AdminPassword,
      "RedeemRequestId": requestId,
      "Mobile": mobile

    }

    return this.hc.post(api, params);
  }

  lmssubmission(details): Observable<any> {
    let api = c.OCApiUrl + 'BlockVoucherAndWalletPointsForOneApolloLMS';
    let params =
    {
      "adminID": c.AdminId,
      "adminPassword": c.AdminPassword,
      "Email": details.Email,
      "MobileNo": details.MobileNo,
      "RedeemRequestId": details.RedeemRequestId,
      "CreditPoints": details.CreditPoints,
      "VoucherCode": details.VoucherCode,
      "VoucherID": details.VoucherCode,
      "IntermAppId": details.IntermAppId,
      "SourceApp": c.OCSourceApp
    }

    return this.hc.post(api, params);
  }

  lmsCouponCode(email: string, blockId: string, voucher: string) {
    let api = c.OCApiUrl + 'GetVoucherdetailsForOneApolloLMS';
    let params =
    {
      "adminID": c.AdminId,
      "adminPassword": c.AdminPassword,
      "IntermBookAppId": blockId,
      "Email": email,
      "Voucher": voucher,
      "SourceApp": c.OCSourceApp
    }
    return this.hc.post(api, params);
  }

  zeroPaymentBypass(req: any): Observable<any> {
    let api = c.OCApiUrl + 'ConfirmOneApolloByPassAppointmentForSourceApp';
    let params =
    {
      "authenticationTicket": req.authenticationTicket,
      "PatientId": req.PatientId,
      "IntermAppId": req.IntermAppId,
      "MarchantId": req.MarchantId,
      "OneapolloCouponId": req.OneapolloCouponId.toString(),
      "OneApolloWalletId": req.OneApolloWalletId,
      "AskApolloCouponId": req.AskApolloCouponId.toString(),
      "TotalAmount": req.TotalAmount.toString(),
      "NetAmount": req.NetAmount.toString(),
      "DiscountPercent": req.DiscountPercent.toString(),
      "Discamount": req.Discamount.toString(),
      "sourceApp": c.OCSourceApp
    }


    return this.hc.post(api, params);
  }

  checkPendingCaseSheet(): any {

    let status = this.getSessionStatus()
    if (status) {
      this.getPendingCaseSheet().subscribe(t => {
        this.spinnerService.hide();
        if (t.ResponceCode == "0" && t.Result != "" && t.Result != "[]") {
          this.router.navigate(['onlinependingcasesheet']);
        }
      })
    }


  }

  getCountryCodeForRegistration(): Observable<any> {
    let api = c.OCApiUrl + "GetCountryCode";
    let params =
    {
      "adminId": c.AdminId,
      "adminPassword": c.AdminPassword,
      "sourceApp": c.OCSourceApp
    }
    return this.hc.post(api, params);
  }
  getLocationStatus() {
    return this.location
  }

  getSpecialitySymptomsForSourceApp(specialityId: any): Observable<any> {
    //http://rest.askapollo.com:9047/RestService.svc/GetCouponSpecialitiesAnonymousForSourceApp 

    let api = c.OCApiUrl + 'CasesheetSymptomsForSourceApp';
    let params = {
      "AuthenticationTicket": this.userInfo.AuthTokenForPR,
      "SpecialityId": specialityId,
      "SourceApp": c.OCSourceApp
    };
    return this.hc.post(api, params);
  }

  /*
  *  Procede health library socual login
  */
  processSocialLoginHealthLibrary(type: String) {
    let apiEndpoint = c.Apiurl + 'AuthenticateUserWithOnlineConsultationUsingSocialLoginForAngular';
    let params = {
      SocialLoginId: this.userInfo.SocialLoginId,
      SocialLoginType: this.userInfo.SocialLoginType,
      email: this.userInfo.email,
      FullName: this.userInfo.firstName + ' ' + this.userInfo.lastName,
      logId: this.getLogId()
    }
    this.hc.post(apiEndpoint, params).subscribe(
      (data: any) => {

        console.log('AuthenticateUserWithOnlineConsultationUsingSocialLoginForAngular');
        console.log(data);
        this.setLogId(data.logId);
        this.loadingHide('loadingid');
        if (+data.requestStatus == 1) {
          this.loadingHide('loadingid');
          this.setSignupStatus(2);
          this.setSessionStatus(false);
        }
        else if (data.requestStatus == '0') {
          this.setUserInfo({
            dateofBirth: data.DateOfBirth,
            gender: data.Gender,
            mobileNumber: data.mobileNumber,
            IsPhoneVerified: true,
            userId: data.edocUserId,
            patientId: data.eDocPatientId,
            AuthTokenForPR: data.OnlineConsultToken,
            AskApolloReferenceIdForSelf: data.AskApolloReferenceIdForSelf,
            uhid: data.UHID,
            email: data.emailId,
            PatientOrigin: data.PatientOrigin,
            firstName: data.firstname,
            lastName: data.lastname,
          });

          this.setSessionToken({
            AskApolloReferenceIdForSelf: data.AskApolloReferenceIdForSelf,
            OnlineConsultToken: data.OnlineConsultToken
          });

          console.log('User Details');
          console.log(this.getuserInfo());
          if(data.HealthLibrary)
          {
            document.cookie = "healthLibraryCookie="+data.HealthLibrary;
            localStorage.setItem('healthLibraryCookie',data.HealthLibrary);
          }

          this.setSessionStatus(true);

          this.modalService._hideModal(1);
        }
      }); // API call end (AuthenticateUserWithOnlineConsultationUsingSocialLoginForAngular)
  }
  /*
  *  Registration in Health library
  */
  processPhoneNumberHealthLibrary(ui: UserInfo) {
    this.userInfo = { ...ui };
    console.log('Registration Health Library');
    console.log(this.userInfo);
    let apiEndpoint = c.Apiurl + 'GetMobileOtpFromOnlineConsulation';
    let params = {
      email: this.userInfo.email,
      mobileNumber: this.userInfo.countryCode + this.userInfo.mobileNumber,
      logId: this.getLogId()
    }
    this.hc.post(apiEndpoint, params).subscribe(
      (data: any) => {
        this.loadingHide('loadingid');

        console.log('GetMobileOtpFromOnlineConsulation');
        console.log(data);
        if (data.mobileOTP && data.mobileOTP == 'sent' && data.status && data.status == 'success' && ui.countryCode == "91") {
          this.loginPhoneOrEmail = ui.mobileNumber;
          this.setSignupStatus(3);
        }
        else {
          alert('We are facing technical difficulties. Please contact with our support team.');
        }
      }
    );
  }
  /*
  *  Social media Registration for Health Library 
  */
  SocialMediaLoginRegisterHealthLibrary(userInfo: UserInfo, otp: any): Observable<any> {
    let apiEndpoint = c.Apiurl + "RegisterUserWithOnlineConsultatuionAndeDocUsingSocialLoginForAngular";
    let params = {
      "firstName": userInfo.firstName,
      "middlename": "",
      "lastName": userInfo.lastName,
      "email": userInfo.email,
      "mobileNumber": userInfo.mobileNumber,
      "dateofBirth": userInfo.dateofBirth,
      "gender": userInfo.gender,
      "SocialLoginType": userInfo.SocialLoginType,
      "SocialLoginId": userInfo.SocialLoginId,
      "MobileOtp": otp,
      "CountryCode": (userInfo.countryCode) ? userInfo.countryCode : "91",
      "MMUhid": userInfo.uhid,
      "logId": this.getLogId()
    }
    return this.hc.post(apiEndpoint, params);
  }

  getLocalStorageValues(flag)
  {
    let userInfo = this.getuserInfo();
    let userToken = this.ss.getToken(this.ss.TOKEN_USER);
    let userAuthToken = this.ss.getToken(this.ss.TOKEN_AUTH_TOKEN);
    let getSessionStatus = this.getSessionStatus();
    let loginType = localStorage.getItem('loginType');
    let loginUserIdForGuest = localStorage.getItem('loginUserIdForGuest');
    let loginedirect = localStorage.getItem('loginedirect');

    //let str = flag + " : userId - "+userInfo.userId+' , userToken - '+userToken+' , userAuthToken - '+userAuthToken+' , getSessionStatus - '+getSessionStatus+' , loginType - '+loginType+' , loginUserIdForGuest - '+loginUserIdForGuest+', loginedirect - '+loginedirect;
    

    let userInfoJ = userInfo!=null && userInfo!=undefined? JSON.stringify(userInfo):userInfo;
    let userTokenJ = userToken!=null && userToken!=undefined? JSON.stringify(userToken):userToken;
    let userAuthTokenJ = userAuthToken!=null && userAuthToken!=undefined? JSON.stringify(userAuthToken):userAuthToken;
    let getSessionStatusJ = getSessionStatus!=null && getSessionStatus!=undefined? JSON.stringify(getSessionStatus):getSessionStatus;
    let loginTypeJ = loginType!=null && loginType!=undefined? JSON.stringify(loginType):loginType;
    let loginUserIdForGuestJ = loginUserIdForGuest!=null && loginUserIdForGuest!=undefined? JSON.stringify(loginUserIdForGuest):loginUserIdForGuest;
    let loginedirectJ = loginedirect!=null && loginedirect!=undefined? JSON.stringify(loginedirect):loginedirect;

    
    let str = flag + " : userId - "+userInfoJ+' , userToken - '+userTokenJ+' , userAuthToken - '+userAuthTokenJ+' , getSessionStatus - '+getSessionStatusJ+' , loginType - '+loginTypeJ+' , loginUserIdForGuest - '+loginUserIdForGuestJ+', loginedirect - '+loginedirectJ;

    this.cs.localStorageTracker(str,flag);
  }

}
