import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';

import { Subscription } from 'rxjs';

import { BookingService } from '@aa/services/booking.service';
import { AAAuthService } from '@aa/services/auth.service';

import { patientInfo } from '@aa/structures/calendar.tracker.interface';
import { UHID, UserInfo } from '@aa/structures/user.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { PatientInfoComponent } from '../patient-info/patient-info.component';
import { NgForm } from '@angular/forms';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import * as moment from 'moment';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-patient-info-uhid',
  templateUrl: './patient-info-uhid.component.html',
  styleUrls: ['./patient-info-uhid.component.scss']
})
export class PatientInfoUhidComponent implements OnInit, OnDestroy {
  @ViewChild(PatientInfoComponent) _patientInfoComponent:

    PatientInfoComponent;
  UHIDTrackedSub: Subscription;
  bookingErrorTrackerSub: Subscription;

  selectedUHID = {} as UHID;
  availableUHIDs = [];
  availableUHIDsFilter = [];

  booking = false;
  buttonString = 'Confirm Appointment';
  bookingErrorMsg = '';
  userData: UserInfo;
  isSignedin = false;
  showUhidOfRelative: boolean = false;
  relativeToolTip: string = "You need to Signin to be able to use this feature";
  maxDate = new Date();
  agreeTeram: boolean = true;

  modalRef: BsModalRef;
  constructor(
    public aaa: AAAuthService,
    private route: Router,
    private bs: BookingService,
    private bsLocaleService: BsLocaleService,
    private modalService: BsModalService) {
    this.bsLocaleService.use('en-gb');
  }

  formateDate(date: any) {

    if (date == null) {
      return "16/05/1990";
    }
    if (date == '') {
      return "16/05/1990";
    }

    if (date.indexOf('/Date') >= 0) {
      return "16/05/1990";
    }
    return date;

    // if (Object.prototype.toString.call(date) === "[object Date]") {
    //   // it is a date
    //   if (isNaN(date.getTime())) {  // d.valueOf() could also work
    //      return "16/05/1990";
    //   } else {
    //     // date is valid
    //     return date;
    //   }
    // } else {
    //    return "16/05/1990";
    // }
  }

  ngOnInit() {


    this.isSignedin = this.aaa.getSessionStatus();
    this.userData = this.aaa.getuserInfo();
    if (this.isSignedin && this.userData != null && this.userData.AuthTokenForPR != null) {
      this.aaa.setAppointmentType('13');
      this.availableUHIDs = [];
      this.aaa.loadingShow('loadingid');
      this.availableUHIDsFilter = [];
      this.relativeToolTip = "";
      //this.aaa.getUhidsUsingPrism().subscribe(

      this.aaa.getUhidsUsingPrism().subscribe(
        (data: any) => {

          if (data != null) {

            let userData = data;
            if (userData[0] != null && userData[0].UserData != null &&
              userData[0].UserData.response != null
              && userData[0].UserData.response.signUpUserData != null
              && userData[0].UserData.response.signUpUserData.length > 0) {

              for (let d of userData[0].UserData.response.signUpUserData) {
                if (d.UHID != null && d.UHID != "") {
                  let uhidData: UHID = {
                    firstName: d.FirstName,
                    lastName: d.LastName,
                    uhid: d.UHID,
                    email: d.EMail == null ? '---' : d.EMail,
                    gender: d.Gender == null ? '---' : d.Gender,
                    mobileNumber: d.MobileNumber == null ? '---' : d.MobileNumber,
                    dob: this.formateDate(d.DateOfBirth),// d.DateOfBirth == null ? '---' : d.DateOfBirth,
                    isRelation: false
                  }
                  this.availableUHIDs.push(uhidData);
                  this.availableUHIDsFilter.push(uhidData);
                }
              }
            }
          }

          this.aaa.getAllFamilyMembersDataForBooking().subscribe(
            (data: any) => {
              this.aaa.loadingHide('loadingid');


              let userLoginData: UHID = {
                firstName: this.userData.firstName,
                lastName: this.userData.lastName,
                uhid: this.userData.uhid,
                email: this.userData.email,
                gender: this.userData.gender == 1 ? "Male" : (this.userData.gender == 2) ? "Female" : "Other",
                mobileNumber: this.userData.mobileNumber,
                dob: this.formateDate(this.userData.dateofBirth),
                isRelation: false
              }
              this.availableUHIDs.push(userLoginData);
              this.availableUHIDsFilter.push(userLoginData);
              this.showUhidOfRelative = false;
              this.selectedUHID = userLoginData;

              //debugger;
              if (data != null) {
                if (data.Result != undefined && data.Result != null) {
                  let res = JSON.parse(data.Result);

                  for (let d of res) {
                    let uhidData: UHID = {
                      firstName: d.FirstName,
                      lastName: d.LastName,
                      uhid: d.Uhid == null ? '---' : d.Uhid,
                      email: this.userData.email,
                      gender: d.Gender == null ? '---' : (d.Gender == 1) ? 'Male' : (d.Gender == 2) ? 'Female' : 'Other',
                      mobileNumber: this.userData.mobileNumber,
                      //dob: d.Dob == null ? '---' : d.Dob,
                      dob: this.formateDate(d.Dob), //moment(d.Dob, 'DD/MM/YYYY').toDate(),
                      isRelation: true
                    }
                    this.availableUHIDs.push(uhidData);
                    this.availableUHIDsFilter.push(uhidData);
                  }


                  if (this.userData.uhid != null && this.userData.uhid != "") {
                    this.availableUHIDs = this.availableUHIDs.filter(u => {
                      return u.uhid != this.userData.uhid;
                    })
                  } else {
                    this.availableUHIDs = this.availableUHIDs.filter(u => {
                      return u.isRelation == false;
                    })
                    this.showUhidOfRelative = true;
                  }
                }

              }

            });

        });


    } else {
      //debugger;
      this.relativeToolTip = "You need to Signin to be able to use this feature";

      this.showUhidOfRelative = true;
      let loginType = localStorage.getItem('loginType');
      if (loginType == "C") {
        localStorage.removeItem('loginType');
        this.availableUHIDs = [];
        let userData = JSON.parse(localStorage.getItem("cuserData"));
        if (userData.UHID != null && userData.UHID != "") {
          let uhidData: UHID = {
            firstName: userData.FirstName,
            lastName: userData.LastName,
            uhid: userData.UHID,
            email: userData.EMail == null ? '---' : userData.EMail,
            gender: userData.Gender == 2 ? "Female" : userData.Gender == 1 ? "Male" : "Other",
            mobileNumber: userData.Mobile == null ? '---' : userData.Mobile,
            dob: this.formateDate(userData.DateofBirth), //userData.DateofBirth == null ? '---' : userData.DateofBirth,
          }

          this.availableUHIDs.push(uhidData);


        }

        if (userData.RelationBO != null && userData.RelationBO.length > 0) {
          for (let d of userData.RelationBO) {
            if (d.UHID != null && d.UHID != "") {
              let uhidData: UHID = {
                firstName: userData.FirstName,
                lastName: userData.LastName,
                uhid: userData.UHID,
                email: userData.EMail == null ? '---' : userData.EMail,
                gender: userData.Gender == 2 ? "Female" : userData.Gender == 1 ? "Male" : '',
                mobileNumber: userData.Mobile == null ? '---' : userData.Mobile,
                dob: this.formateDate(userData.DateofBirth), //userData.DateofBirth == null ? '---' : userData.DateofBirth,
              }
              this.availableUHIDs.push(uhidData);
            }
          }
        }
        this.selectedUHID = this.availableUHIDs[0];
      }

      if (loginType == "M") {
        this.aaa.setAppointmentType('16')
        this.availableUHIDs = [];
        let userData = JSON.parse(localStorage.getItem("guestData"));

        if (userData != null && userData[0].UserData != null &&
          userData[0].UserData.response != null
          && userData[0].UserData.response.signUpUserData != null
          && userData[0].UserData.response.signUpUserData.length > 0) {

          for (let d of userData[0].UserData.response.signUpUserData) {
            if (d.UHID != null && d.UHID != "") {
              let uhidData: UHID = {
                firstName: this.getName('f', d.userName),
                lastName: this.getName('l', d.userName),
                uhid: d.UHID,
                email: d.EMail == null ? '---' : d.EMail,
                gender: d.Gender == null ? '---' : d.Gender,
                mobileNumber: d.MobileNumber == null ? '---' : d.MobileNumber,
                dob: this.formateDate(d.DateOfBirth), //d.DateOfBirth == null ? '---' : d.DateOfBirth,
              }
              this.availableUHIDs.push(uhidData);
            }
          }

          this.selectedUHID = this.availableUHIDs[0];

        }

      }


    }

    this.bookingErrorTrackerSub = this.bs.bookingErrorTracker.subscribe(
      (data: { failStatus: number, failMessage: string }) => {
        this.bookingErrorMsg = data.failMessage;
        //this.buttonString="Confirm Appointment";
        this.aaa.loadingHide('loadingid');
      }
    );

  }

  getName(type: any, name: any) {
    if (name == null || name == "") {
      return "--";
    }
    if (type == 'f') {
      let names = name.split(' ');
      if (names.length > 0) {
        return names;
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
  showUHID: boolean = true;

  self() {
    //debugger;
    if(this.selectedUHID!=undefined && this.selectedUHID!=null
      && this.relativeToolTip == "You need to Signin to be able to use this feature"){
      if(this.selectedUHID.firstName=="new"){
        this.aaa.setAppointmentType('16')
        return;
      }
    }

    this.aaa.setAppointmentType('13');
    this.showAddPatient = false;
    this.showUHID = true;
    //this.buttonString = "Booking";
    this.bookingErrorMsg = "";
    if (this.relativeToolTip == "") {

      if (this.userData.uhid != null && this.userData.uhid != "") {
        this.showUhidOfRelative = false;
        this.selectedUHID = this.availableUHIDsFilter.filter(u => {
          return u.uhid == this.userData.uhid;
        })[0];
      } else {
        this.availableUHIDs = this.availableUHIDsFilter.filter(u => {
          return u.isRelation == false;
        })
        this.selectedUHID = this.availableUHIDs[0];
        this.showUhidOfRelative = true;
      }

    }
  }
  checkMsg() {
    if (this.relativeToolTip == "") {
      return true;
    } else {
      return false;
    }

  }
  relative() {
    //debugger;
    
    if (this.relativeToolTip == "You need to Signin to be able to use this feature") {
      return;
    }
    this.showAddPatient = false;
    //this.buttonString = "Booking";
    this.aaa.setAppointmentType('11');
    this.bookingErrorMsg = "";
    if (this.relativeToolTip == "") {
      this.showUHID = false;
      this.showUhidOfRelative = true;
      this.availableUHIDs = this.availableUHIDsFilter.filter(u => {
        return u.isRelation == true;
      })
      if (this.availableUHIDs != null && this.availableUHIDs.length > 0) {
        this.selectedUHID = this.availableUHIDs[0];
        this.aaa.setAppointmentType('11');
      } else {
        this.aaa.setAppointmentType('12');
        this.showAddPatient = true;

        let uhid: UHID = {
          uhid: "",
          firstName: "new",
          lastName: "patient",
          isRelation: true
        }
        this.selectedUHID = uhid;

        // localStorage.setItem('isNewUserFromLogin', 'Y');

        this.isSignedin = this.aaa.getSessionStatus();
        let ep = localStorage.getItem('loginUserIdForGuest');
        if (this.isSignedin) {

          let userInfo = this.aaa.getuserInfo();
          this.email = userInfo.email;
          this.phone = userInfo.mobileNumber;
          this.showEmailOrMobile = false;

        } else {
          if (this.checkEmailOrPhone(ep) == 1) {
            this.email = ep;
          } else {
            this.phone = ep;
          }
        }

      }


    }
  }

  ngOnDestroy() {
    this.bookingErrorTrackerSub.unsubscribe();
  }

  bookAppointment() {
    this.aaa.loadingShow('loadingid');
    // debugger;
    //let dob = this.selectedUHID.dob.split(' ')[0].split('-').join('/');
    let pi: patientInfo = {
      fn: this.selectedUHID.firstName,
      ln: this.selectedUHID.lastName,
      email: this.selectedUHID.email,
      gender: this.selectedUHID.gender == 'male' ? 1 : 2,
      pn: this.selectedUHID.mobileNumber,
      uhid: this.selectedUHID.uhid,
      pnv: true,
      dob: this.selectedUHID.dob
    };
    // pi.uhid = [ this.selectedUHID ];
    this.bs.savePatientInfo(pi);
    let ca = JSON.parse(localStorage.getItem("slotDetails"));
    this.bs.setAppointmentSlot(ca)

    this.bookingErrorMsg = '';
    //this.buttonString = 'Booking ...';
    this.booking = true;
    this.bs.bookAppointment();
  }

  setUHID(uhid: UHID) {
    if (this.showAddPatient)
      this.showAddPatient = !this.showAddPatient;

    this.selectedUHID = uhid;
    if(this.isSignedin){
      this.aaa.setAppointmentType('13');
    }else{
      this.aaa.setAppointmentType('16');
    }
  }
  showAddPatient: boolean = false;
  showNewPatient() {
    this.isSignedin = this.aaa.getSessionStatus();
    if(this.isSignedin){
      this.aaa.setAppointmentType('12');
    }else{
      this.aaa.setAppointmentType('17');
    }
    //this.aaa.setAppointmentType('12');
    if (confirm('Are you sure you want to proceed with new user')) {
      this.showAddPatient = true;

      let uhid: UHID = {
        uhid: "",
        firstName: "new",
        lastName: "patient",
        isRelation: true
      }
      this.selectedUHID = uhid;

      // localStorage.setItem('isNewUserFromLogin', 'Y');

      this.isSignedin = this.aaa.getSessionStatus();
      let ep = localStorage.getItem('loginUserIdForGuest');
      if (this.isSignedin) {

        let userInfo = this.aaa.getuserInfo();
        this.email = userInfo.email;
        this.phone = userInfo.mobileNumber;
        this.showEmailOrMobile = false;

      } else {
        if (this.checkEmailOrPhone(ep) == 1) {
          this.email = ep;
        } else {
          this.phone = ep;
        }
      }


    }
  }

  processPatientInfo(f: NgForm) {
    this.aaa.loadingShow('loadingid');
    this.bookingErrorMsg = '';
    //this.buttonString = 'Booking ...';
    this.booking = true;

    let pi: patientInfo = { ...f.value };
    if (!this.showEmailOrMobile) {
      let useInfo = this.aaa.getuserInfo();
      pi.email = useInfo.email;
      pi.pn = useInfo.mobileNumber;
    } else {
      pi.email = this.email;
      pi.pn = this.phone;
    }

    let ca = JSON.parse(localStorage.getItem("slotDetails"));
    this.bs.setAppointmentSlot(ca)

    this.bs.savePatientInfo(pi);

    this.bookingErrorMsg = '';
    // this.buttonString = 'Booking ...';
    this.booking = true;
    this.bs.bookAppointment();

  }
  pi: patientInfo = {} as patientInfo;
  phone = '';
  email = '';
  dob: Date;
  showEmailOrMobile: boolean = true;

  checkEmailOrPhone(str: string) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(str).toLowerCase()) ? 1 : 2; // 1 => email; 2 => phone;
  }
  terms(template: TemplateRef<any>)
  {
    this.modalRef = this.modalService.show(template);
  }

}
