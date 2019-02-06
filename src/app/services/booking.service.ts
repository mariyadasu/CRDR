import { CommonService } from '@aa/services/common.service';
import { Subscription } from 'rxjs/Subscription';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';

import { StoreService } from './../services/store.service';
import { AAAuthService } from '@aa/services/auth.service';
import { SearchService } from '@aa/services/search.service';

import { currentAppointment, patientInfo } from '@aa/structures/calendar.tracker.interface';
import { UserInfo } from '@aa/structures/user.interface';

import { constants as c } from '../constants';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Injectable()
export class BookingService implements OnInit {

  BOOKING_STATUS_APPT_DETAILS_OK = 0;
  BOOKING_STATUS_PATIENT_DETAILS_OK = 1;
  BOOKING_STATUS_PATIENT_DETAILS_FAILED = -1;

  BOOKING_STATUS_OTP_GENERATED = 2;
  BOOKING_STATUS_OTP_GENERATION_FAILED = -2;

  BOOKING_STATUS_OTP_VERIFIED_COMPLETED_OK = 3;
  BOOKING_STATUS_OTP_VERIFICATION_FAILED = -3;

  BOOKING_STATUS_COMPLETED_FAIL = -1;

  bookingStatusTracker = new Subject<number>();
  bookingStatus = this.BOOKING_STATUS_PATIENT_DETAILS_OK;

  bookingErrorTracker = new Subject<{ failStatus: number, failMessage: string }>();

  appointmentId = '';

  appointmentDetails: currentAppointment;

  userInfo: UserInfo = {} as UserInfo;
  patientInfo: patientInfo = {} as patientInfo;
  prevURL = '/';

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private storeService: StoreService,
    private aaa: AAAuthService,
    private ss: SearchService,
    private spinnerService: Ng4LoadingSpinnerService,
    private cs: CommonService) { }

  ngOnInit() {
    this.aaa.sessionStatusTracker.subscribe(
      (status: boolean) => {
        if (!status) this.patientInfo = {} as patientInfo;
      }
    );
  }

  setAppointmentSlot(as: currentAppointment) {
    this.appointmentDetails = as;
  }

  getAppointmentSlot() {
    return this.appointmentDetails;
  }

  savePatientInfo(pi: patientInfo) {
    this.patientInfo = pi;
  }

  getPatientInfo() {
    if (Object.keys(this.patientInfo).length == 0) {
      //debugger;
      this.userInfo = this.aaa.getuserInfo();



      let fpn = '';
      if (this.userInfo.mobileNumber) {
        fpn = this.userInfo.mobileNumber.length > 10 ? this.userInfo.mobileNumber.trim().substring(2) : this.userInfo.mobileNumber.trim();
      }

      this.patientInfo = {
        fn: this.userInfo.firstName,
        ln: this.userInfo.lastName,
        email: this.userInfo.email,
        gender: this.userInfo.gender,
        pn: fpn,
        uhid: '',
        pnv: this.userInfo.IsPhoneVerified ? true : false,
        dob: this.userInfo.dateofBirth
      }
    }
    return this.patientInfo;
  }

  getBookingInfo() {
    return;
  }

  sendOTP() {
    let userInfo;
    let apiEndpoint = c.Apiurl + 'AuthenticateUser4mOnlinePhysical';

    // If DoB is picked from datepicker, you get the date in Date format
    // If DoB is provided by the backend, you get it as a string. Act accordingly.
    let d = typeof this.patientInfo.dob;
    let fsd = '';
    if (d != 'string') {
      fsd = moment(this.patientInfo.dob).format('DD/MM/YYYY');
    }

    // Sometimes, the backend sends you a phone number with 91 prepended.
    // In such a case, strip the 91 and send just the 10 digit phone number
    let pn = '';
    if (this.patientInfo.pn.length > 10) {
      pn = this.patientInfo.pn.trim().substring(2);
    } else {
      pn = this.patientInfo.pn.trim();
    }

    let patientInfo = {
      "userId": 0,
      "patientId": 0,
      "firstName": this.patientInfo.fn,
      "lastName": this.patientInfo.ln,
      "email": this.patientInfo.email,
      "mobileNumber": pn,
      "dateofBirth": d == 'string' ? this.patientInfo.dob : fsd,
      "IsEmailVerified": 1,
      "gender": +this.patientInfo.gender == 1 ? 'male' : 'female',
      "CountryCode": "91",

      "SocialLoginType": this.userInfo.SocialLoginType,
      "SocialLoginId": this.userInfo.SocialLoginId,
      "MobileOtp": "",
      "PatientRoleId": 4,
      "AskApolloReferenceIdForSelf": null,
      "VerificationOTP": 0,
      "UserValidationsWithServicesFlag": "2"
    };

    this.httpClient.post(apiEndpoint, patientInfo).subscribe(
      (data: any) => {
        // console.log(data);
        if (data.requestStatus == 2) {
          this.bookingStatus = this.BOOKING_STATUS_OTP_GENERATED;
          this.bookingStatusTracker.next(this.bookingStatus);

          this.router.navigate(['/book-appointment/verify-mobile']);
        } else if (data.requestStatus == '0') {
          this.bookAppointment();
        } else {
          this.bookingErrorTracker.next({ failStatus: this.BOOKING_STATUS_OTP_GENERATION_FAILED, failMessage: 'Something went wrong. Please try again.' });
        }
      }
    );

  }

  verifyOTP(otp: string) {
    let apiEndpoint = c.Apiurl + 'AuthenticateUser4mOnlinePhysical';

    let d = typeof this.patientInfo.dob;
    let fsd = '';
    if (d != 'string') {
      fsd = moment(this.patientInfo.dob).format('DD/MM/YYYY');
    }

    let pi = {
      "userId": 0,
      "patientId": 0,
      "firstName": this.patientInfo.fn,
      "lastName": this.patientInfo.ln,
      "email": this.patientInfo.email,
      "mobileNumber": this.patientInfo.pn.length == 10 ? this.patientInfo.pn : this.patientInfo.pn.substring(2),
      "dateofBirth": d == 'string' ? this.patientInfo.dob : fsd,
      "IsEmailVerified": "1",
      "gender": +this.patientInfo.gender == 1 ? 'male' : 'female',
      "CountryCode": "91",

      "SocialLoginType": this.userInfo.SocialLoginType,
      "SocialLoginId": this.userInfo.SocialLoginId,
      "MobileOtp": otp,
      "PatientRoleId": 4,
      "AskApolloReferenceIdForSelf": null,
      "VerificationOTP": 0,
      "UserValidationsWithServicesFlag": "3",
    }

    this.httpClient.post(apiEndpoint, pi).subscribe(
      (data: any) => {
        this.spinnerService.hide();
        // console.log(data);
        if (data.requestStatus == '0') {
          this.bookAppointment();
        } else if (data.requestStatus == '3') {
          this.bookingErrorTracker.next({ failStatus: this.BOOKING_STATUS_OTP_VERIFICATION_FAILED, failMessage: data.requestStatusMsg });
        }
      }
    );

  }

  bookAppointment() {
    /*console.log('Userinfo');
    console.log(this.userInfo);
    console.log('Patient info');
    console.log(this.patientInfo);
    console.log(':ength ');
    console.log(this.patientInfo.pn.length);

    console.log('session token');
    console.log(this.aaa.getSessionToken());
    console.log(this.aaa.getSessionToken().AskApolloReferenceIdForSelf);
    debugger;*/
    this.userInfo=this.aaa.getuserInfo();
    let loggedIn = this.userInfo.email != null;

    let d = typeof this.patientInfo.dob;
    let fsd = '';
    if (d != 'string') {
      fsd = moment(this.patientInfo.dob).format('DD/MM/YYYY');
    }

    // Sometimes, the backend sends you a phone number with 91 prepended.
    // In such a case, strip the 91 and send just the 10 digit phone number
    let pn  = '';
    if(this.patientInfo.pn == undefined || this.patientInfo.pn == null || this.patientInfo.pn == '')
    {
      pn = '';
    }
    else
    {
      pn = this.patientInfo.pn.trim();
      if (pn.length > 10) {
        pn = pn.substring(2);
      }  
    }
    
    // Sometimes, the backend sends you a phone number with 91 prepended.
    // In such a case, strip the 91 and send just the 10 digit phone number
    let upn = '';
    if (loggedIn) 
    {
      if(this.userInfo.mobileNumber == undefined || this.userInfo.mobileNumber == null || this.userInfo.mobileNumber == '')
      {
        upn = ''; 
      }
      else
      {
        upn = this.userInfo.mobileNumber.trim();
        if (upn.length > 10) {
          upn = upn.substring(2);
        } 
      }
    }
    /*console.log('Userinfo');
    console.log(this.userInfo);
    console.log('Patient info');
    console.log(this.patientInfo);
    console.log(this.patientInfo.fn[0]);
    console.log(this.patientInfo.fn[1]);*/
    var patientInfo = {};
    if (this.appointmentDetails.appointmentId) {
      var apiEndpoint = c.BaseApiurl + 'api/eDocConsultation/RescheduleConsultationAppointmentIneDoc';
      patientInfo = {
        slotTime: this.appointmentDetails.timeSlot,
        slotId: this.appointmentDetails.slotId,
        modifiedIp: this.cs.getIP(),
        appointmentDate: this.appointmentDetails.date.split('-').join('/'),
        appointmentId: this.appointmentDetails.appointmentId,
        rescheduleBy: ((this.aaa.getuserInfo().userId) ? this.aaa.getuserInfo().userId : 0),
        LogId:this.aaa.getLogId()
      }
    }
    else {
      var apiEndpoint = c.BaseApiurl + 'api/eDocConsultation/BookConsultationAppointmentIneDoc';
      /*patientInfo = {
        SocialLoginType: loggedIn ? this.userInfo.SocialLoginType : '',
        SocialLoginId: loggedIn ? this.userInfo.SocialLoginId : 0,
        userId: loggedIn ? this.userInfo.userId : 0,
        patientId: loggedIn ? this.userInfo.patientId : 0,
        userFirstName: loggedIn ? this.userInfo.firstName : this.patientInfo.fn[0],
        userLastName: loggedIn ? this.userInfo.lastName : this.patientInfo.ln,
        emailId: loggedIn ? this.userInfo.email : this.patientInfo.email,
        mobileNo: upn == '' ? pn : upn,

        patientFirstName: this.patientInfo.fn[0],
        patientLastName: this.patientInfo.ln,
        patientEmailId: this.patientInfo.email,
        patientMobileNo: pn,

        salutation: 'Ms.',
        relationTypeId: 1,
        dateOfBirth: d == 'string' ? this.patientInfo.dob.split('-').join('/') : fsd,
        gender: this.patientInfo.gender,
        appointmentTypeId: 1,
        appointmentDate: this.appointmentDetails.date.split('-').join('/'),
        slotTime: this.appointmentDetails.timeSlot,
        slotId: this.appointmentDetails.slotId,
        hospitalId: this.appointmentDetails.hosId,
        hospitalName: this.appointmentDetails.docHospital,
        cityId: this.ss.getIdForCity(this.appointmentDetails.docCity),
        cityName: this.appointmentDetails.docCity,
        doctorId: this.appointmentDetails.docId,
        doctorName: this.appointmentDetails.docName,
        specialityId: 341,
        speciality: this.appointmentDetails.docSpeciality,
        askApolloReferenceIdForSelf: this.aaa.getSessionToken().AskApolloReferenceIdForSelf ? this.aaa.getSessionToken().AskApolloReferenceIdForSelf: '',
        askApolloReferenceIdForRelation: "",
        createdIP: this.cs.getIP(),
        uhid: this.aaa.getBookingParams() == this.aaa.BOOKING_PARAMS_NS_NU ? '' : this.patientInfo.uhid,
        leadsource: 'Angular-PhysicalAppointment'
      }*/
      // interger values are set with -0 and string values are set with - '' 
      let fname = '';
      if(Array.isArray(this.patientInfo.fn))
      {
        fname = this.patientInfo.fn[0];
      }
      else
      {
        fname = this.patientInfo.fn;
      }
      patientInfo = {
        appointmentTypeId: 1,
        userFirstName: loggedIn ? this.userInfo.firstName : fname,
        userLastName: loggedIn ? this.userInfo.lastName : this.patientInfo.ln,
        patientFirstName: fname,
        patientLastName: this.patientInfo.ln,
        salutation: (this.patientInfo.gender == 1) ? 1 : 3,
        relationTypeId: 1,
        leadsource: c.EdocLeadSource,
        appointmentDate: this.appointmentDetails.date.split('-').join('/'),
        slotTime: this.appointmentDetails.timeSlot,
        slotId: this.appointmentDetails.slotId,
        userId: loggedIn ? this.userInfo.userId : 0,
        patientId: loggedIn ? this.userInfo.patientId : 0,
        hospitalId: this.appointmentDetails.hosId,
        hospitalName: this.appointmentDetails.docHospital,
        cityId: this.ss.getIdForCity(this.appointmentDetails.docCity),
        cityName: this.appointmentDetails.docCity,
        doctorId: this.appointmentDetails.docId,
        doctorName: this.appointmentDetails.docName,
        createdBy: loggedIn ? this.userInfo.userId : 0,
        createdIP: this.cs.getIP(),
        sessionId: '',
        specialityId: this.appointmentDetails.docSpecialityId,
        speciality: this.appointmentDetails.docSpeciality,
        subSpecialityId: 0,
        subSpeciality: '',
        fileNumber: '',
        hospitalAppointmentConfirmationNumber: '',
        askApolloReferenceIdForSelf: this.aaa.getSessionToken().AskApolloReferenceIdForSelf ? this.aaa.getSessionToken().AskApolloReferenceIdForSelf: '',
        askApolloReferenceIdForRelation: '',
        dateOfBirth: d == 'string' ? this.patientInfo.dob.split('-').join('/') : fsd,
        gender: (this.patientInfo.gender == null) ? 0 : this.patientInfo.gender,
        maritalStatus: 6,
        address: '',
        pinCode: '',
        guardianType: '',
        guardianName: '',
        patientEmailId: this.patientInfo.email,
        patientMobileNo: pn,
        patientUHID: this.aaa.getBookingParams() == this.aaa.BOOKING_PARAMS_NS_NU ? '' : this.patientInfo.uhid,
        patientPRNNumber: '',
        sourceId: 0,
        sugarClinicComments: '',
        isFollowupAppt: 0,
        apptRequestModeId: 0,
        AppointmentBookingType:this.aaa.getAppointmentType(),
        LogId:this.aaa.getLogId()
      }
    }
    console.log(patientInfo);

    this.httpClient.post(apiEndpoint, patientInfo).subscribe(
      (data: any) => {
        console.log(data);
        if (data.appointmentId > 0) {
          this.appointmentId = data.appointmentId;
          this.router.navigate(['/book-appointment/confirm-request'], { relativeTo: this.route, queryParams: { isLead: 0 } });

          this.bookingStatus = this.BOOKING_STATUS_OTP_VERIFIED_COMPLETED_OK;
          this.bookingStatusTracker.next(this.bookingStatus);

        } else if (data.leadId > 0) {
          this.appointmentId = data.leadId;
          this.router.navigate(['/book-appointment/confirm-request'], { relativeTo: this.route, queryParams: { isLead: 1 } });

          this.bookingStatus = this.BOOKING_STATUS_OTP_VERIFIED_COMPLETED_OK;
          this.bookingStatusTracker.next(this.bookingStatus);

        } else {
          this.bookingErrorTracker.next({ failStatus: this.BOOKING_STATUS_PATIENT_DETAILS_FAILED, failMessage: data.errorMsg });
        }
        this.spinnerService.hide();
      },
      (errorResponse: any) => {
        this.spinnerService.hide();
        this.bookingErrorTracker.next({ failStatus: this.BOOKING_STATUS_PATIENT_DETAILS_FAILED, failMessage: errorResponse.error.Message });
      }
    );
  }

  requestAppointment(ai: any)
  {
    let apiEndpoint = c.MultiSpecialityUrl + "SaveRequestAppointmentDetailsV4";
    let params = {
      ...ai,
      CreatedIp: this.cs.getIP(),
      CreatedBy: this.aaa.getSessionStatus() ? this.aaa.getuserInfo().userId : 0,
      LeadSource: c.EdocLeadSource
    }
    //console.log(params);

    return this.httpClient.post(apiEndpoint, params);
  }

  startSession(ui: UserInfo) {
    if (!this.aaa.sessionStatus) {
      this.aaa.setUserInfo(ui);
    }
  }
  

}
