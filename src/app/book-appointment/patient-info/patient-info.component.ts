import { UtilsService } from '@aa/services/utils.service';
import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Params, Router, ActivatedRoute } from '@angular/router';

import * as moment from 'moment';
import { Subscription } from 'rxjs/Subscription';

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { AAAuthService } from '@aa/services/auth.service';
import { BookingService } from '@aa/services/booking.service';

import { patientInfo, } from '@aa/structures/calendar.tracker.interface';
import { UserInfo, RelativeData } from '@aa/structures/user.interface';
import { UserService } from '@aa/services/user.service';
import {  BsLocaleService } from 'ngx-bootstrap/datepicker';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-patient-info',
  templateUrl: './patient-info.component.html',
  styleUrls: ['./patient-info.component.scss']
})
export class PatientInfoComponent implements OnInit, OnDestroy {

  bsConfig: Partial<BsDatepickerConfig>;
  bsValue: Date = new Date();

  pi: patientInfo = {} as patientInfo;
  phone = '';
  email = '';
  dob: Date;

  showUHID = false;
  isSignedin = false;
  showOTP = true;

  booking = false;
  buttonString = 'Book Appointment';

  userInfoTrackerSub: Subscription;
  bookingErrorTrackerSub: Subscription;
  bookingErrorMsg = '';
  allMembersdata: any;
  public isCount = false;
  selectedRelative: any;
  availableRelatives = {} as RelativeData;
  res: any;
  userInfo = {} as UserInfo;
  gen: number;
  maxDate=new Date();

  modalRef: BsModalRef;
  constructor(
    private us: UtilsService,
    private aaa: AAAuthService,
    private bs: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private bsLocaleService: BsLocaleService,
    private modalService: BsModalService) {
      this.bsLocaleService.use('en-gb');
     }

  ngOnInit() {
    this.aaa.loadingHide('loadingid');
  
    this.userInfo = this.aaa.getuserInfo();

      this.isSignedin = this.aaa.getSessionStatus();
      this.aaa.sessionStatusTracker.subscribe(
        (signedin: boolean) => {
          this.isSignedin = signedin;
        }
      );

      this.route.params.subscribe(
        (params: Params) => {
          if (params == null) return;

          if (this.us.checkEmailOrPhone(params.phoneOrEmail) == 1) {
            this.email = params.phoneOrEmail;
            this.aaa.setAppointmentType('14');
          } else {
            this.phone = params.phoneOrEmail;
            this.aaa.setAppointmentType('15');
          }

        });

      this.bsConfig = Object.assign({}, { containerClass: 'theme-orange', dateInputFormat: 'DD/MM/YYYY' });

      if (this.isSignedin) {
        this.pi = this.bs.getPatientInfo();
        this.phone = this.pi.pn;
        this.email = this.pi.email;
        if (this.pi.dob == null || this.pi.dob == '') {
          this.dob = null;
        } else {
          this.dob = moment(this.pi.dob, 'DD/MM/YYYY').toDate();
        }

      }

      this.userInfoTrackerSub = this.aaa.userInfoTracker.subscribe(
        (ui: UserInfo) => {
          this.pi.fn = ui.firstName;
          this.pi.ln = ui.lastName;
          this.pi.email = ui.email;
          this.pi.dob = ui.dateofBirth;
          this.pi.gender = ui.gender;
          this.pi.pn = ui.mobileNumber;
          this.pi.uhid = ui.uhid;

          this.dob = moment(this.pi.dob, 'DD/MM/YYYY').toDate();
          this.phone = ui.mobileNumber;
          this.email = ui.email;
        }
      );


    this.bookingErrorTrackerSub = this.bs.bookingErrorTracker.subscribe(
      (errInfo: { failStatus: number, failMessage: string }) => {
        if (errInfo.failStatus = this.bs.BOOKING_STATUS_PATIENT_DETAILS_FAILED) {
          this.bookingErrorMsg = errInfo.failMessage;
          this.buttonString = 'Book Appointment';
          this.booking = false;
          this.aaa.loadingHide('loadingid');
        }
      }
    );

  }

  processPatientInfo(f: NgForm) {
    this.aaa.loadingShow('loadingid');
    this.bookingErrorMsg = '';
    this.buttonString = 'Booking ...';
    this.booking = true;

    let pi: patientInfo = { ...f.value };

    this.bs.savePatientInfo(pi);

    this.bookingErrorMsg = '';
    this.buttonString = 'Booking ...';
    this.booking = true;
    this.bs.bookAppointment();

  }

  setShowUHID(status: boolean) {
    // Click on self rdisplay the old data
   
    
    if (!status) {
      if (this.isSignedin) {
        this.pi = this.bs.getPatientInfo();
        this.phone = this.pi.pn;
        this.email = this.pi.email;
        if (this.pi.dob == null || this.pi.dob == '') {
          this.dob = null;
        } else {
          this.dob = moment(this.pi.dob, 'DD/MM/YYYY').toDate();
        }

        this.pi.fn = this.userInfo.firstName;
        this.pi.ln = this.userInfo.lastName;
        this.pi.email = this.userInfo.email;
        this.pi.dob = this.userInfo.dateofBirth;
        this.pi.gender = this.userInfo.gender;
        this.pi.pn = this.userInfo.mobileNumber;
        this.pi.uhid = this.userInfo.uhid;
      }
    }
    this.showUHID = status;
  }
  setData(member) {
    // If user select dropdown except first value i.e.,Not sure... Proceed|
    if (member) {
      if (member.Gender == 'M') {
        this.gen = 1;
      }
      else if (member.Gender == 'F') {
        this.gen = 2;
      }
      else {
        this.gen = 3;
      }

      this.pi.fn = member.FirstName;
      this.pi.ln = member.LastName;
      this.pi.email = this.userInfo.email;
      this.pi.dob = this.userInfo.dateofBirth;
      this.pi.gender = this.gen;
      this.pi.pn = this.userInfo.mobileNumber;
      this.pi.uhid = this.userInfo.uhid;

      this.dob = moment(this.pi.dob, 'DD/MM/YYYY').toDate();
      this.phone = this.userInfo.mobileNumber;
      this.email = this.userInfo.email;
      this.selectedRelative = {
        Uhid: this.pi.uhid,
        FirstName: this.pi.fn,
        LastName: this.pi.ln
      };

    }
    else {
      this.pi.fn = '';
      this.pi.ln = '';
      this.pi.email = this.userInfo.email;
      this.pi.dob = '';
      //this.pi.gender = null;
      this.pi.pn = this.userInfo.mobileNumber;
      this.pi.uhid = '';

      //this.dob = null;
      this.phone = this.userInfo.mobileNumber;
      this.email = this.userInfo.email;
      this.selectedRelative = {
        Uhid: 'Not sure... Proceed !',
        FirstName: '',
        LastName: ''
      };
    }

  } 
  terms(template: TemplateRef<any>)
  {
    this.modalRef = this.modalService.show(template);
  }

  ngOnDestroy() {
    if (this.userInfoTrackerSub) {
      this.userInfoTrackerSub.unsubscribe();
      this.bookingErrorTrackerSub.unsubscribe();
    }
  }

}
