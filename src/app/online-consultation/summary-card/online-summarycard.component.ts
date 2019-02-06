import { CommonService } from '@aa/services/common.service';
//import { RequestAppointmentComponent } from '../request-appointment/request-appointment.component';
import { element } from 'protractor';
import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { AAAuthService } from '@aa/services/auth.service';
import { UtilsService } from '@aa/services/utils.service';
import { CalendarService } from '@aa/services/calendar.service';
import { BookingService } from '@aa/services/booking.service';

import { hospital } from '@aa/structures/hospital.interface';
import { doctorC, services } from '@aa/structures/doctor.interface';
import {
  calendarTracker, appointmentSlotsTracker,
  appointmentSlot, currentAppointment, aaDateSlotObject
} from '@aa/structures/calendar.tracker.interface';

import { SignupComponent } from './../../user/signup/signup.component';

import * as moment from 'moment';

import { constants as c } from './../../constants';

@Component({
  selector: 'online-summary-card',
  templateUrl: './online-summarycard.component.html',
  styleUrls: ['./online-summarycard.component.scss']
})

export class OnlineSummaryCardComponent implements OnInit, OnDestroy {

  @Input('d') doc: doctorC;
  isCollapsed = true;

  @ViewChild(BsDatepickerDirective) datepicker: BsDatepickerDirective;
  dpopen = false;

  bsConfig: Partial<BsDatepickerConfig>;
  minDate: Date;
  maxDate: Date;
  HasVideo:boolean;
  HasVoice:boolean;
  HasEmail:boolean;
  dates: string[] = [];
  firstWeek: aaDateSlotObject[] = [];
  secondWeek: aaDateSlotObject[] = [];

  selectedDate: string;
  selectedDateString: string;
  pickedFromCalendar = false;
  activateCalendar = false;

  modalRef: BsModalRef;
  cas: appointmentSlot;

  datePickedFromCalendar: aaDateSlotObject;
  appointmentSlots: appointmentSlotsTracker[] = [];
  currentDaySlots: any[] = [];
  timeZone:string;
  profileURL = '';
  zone:any;
  availableHospitals: hospital[] = [];
  selectedHospital: hospital;
  docName: string = "";
  fee: any = "RS 500";
  feeInt: number = 0;
  feeType: string = "";
  appointmentMode: string = ""
  availableTreamentsshort = [];
  availableTreaments = [];
  SEOSchema: any;
  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private cs: CommonService,
    private calendarService: CalendarService,
    private utilsService: UtilsService,
    private aaa: AAAuthService,
    private bs: BookingService,
    private modalService: BsModalService) { }

  ngOnInit() {
    this.SEOSchema = [{ "@context": 'http://schema.org', "@type": 'Physician', name: this.doc.FirstName + ' ' + this.doc.LastName, url: this.cs.getPresentUrl(), image: this.doc.CompletePhotoUrl, description: '' }];
    this.cs.setCanonicallink(window.location.href);
    this.docName = this.doc.FirstName + " " + this.doc.LastName;
    this.bsConfig = Object.assign({}, { containerClass: 'theme-orange', dateInputFormat: 'DD/MM/YYYY' });
    this.minDate = new Date();
    this.maxDate = new Date();
    this.zone=new Date().toString().match(/([-\+][0-9]+)\s/)[1];
    this.timeZone=(this.zone.slice(0,3)+":"+this.zone.slice(3,5));
    if (this.doc.ConsultationType == "Specialist") {
      this.minDate.setDate(this.minDate.getDate() + 1);
    }
  
    this.maxDate.setDate(this.maxDate.getDate() + 90);

    if (this.zone === "+0530") {
      this.local();
    } else {
      this.international();
    }
    if (this.doc.Treatment) {
      var doctreatment = this.doc.Treatment;
      var treatment = doctreatment.split(',').slice(0, 2);
      treatment.forEach((name, i) => {
        this.availableTreamentsshort = treatment;
      });

      var treatmentdata = doctreatment.split(',');
      treatmentdata.forEach((name, i) => {
        this.availableTreaments = treatmentdata;
      });
    }



    this.profileURL = "/online-doctors-consultation/doctor/" + this.utilsService.sanitizeURLParam(this.doc.Speciality) + "/" + this.utilsService.sanitizeURLParam(this.doc.CityName) + "/" + this.utilsService.sanitizeURLParam(this.docName);

    if(this.aaa.location==="International")
    {
      this.international();
    }
    else if(this.aaa.location===null)
    {
      this.local();
    }
  }

  incrementMonthinDateString(d: string) {
    let t = d.split('/');
    t[1] = (+t[1] + 1).toString();
    let ds = +t[0] < 10 ? '0' + (+t[0]) : t[0];
    let ms = +t[1] < 10 ? '0' + (+t[1]) : t[1];
    return ds + '/' + ms + '/' + t[2];
  }
  addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  getTime(h: any, m: any) {
    let sTime = "00";
    let eTime = "00";

    if (m <= 15) {
      sTime = h + ":00";
      eTime = h + ":15";

      return sTime + "-" + eTime;
    }
    if (m <= 30) {
      sTime = h + ":15";
      eTime = h + ":30";
      return sTime + "-" + eTime;
    }
    if (m <= 45) {
      sTime = h + ":30";
      eTime = h + ":45";
      return sTime + "-" + eTime;
    }
    if (m <= 60) {
      sTime = h + ":45";
      let nextH = +h + 1;
      eTime = nextH + ":00";
      return sTime + "-" + eTime;
    }
  }

  makeAppointment(mode: any) {

    this.cs.setGA('Online Appointment Listing Page', 'Online Consultations Listing Page', 'Online Consultations_Doctor chosen via ' + mode + ' mode', 'Online Consultations_Listing_' + mode + '_' + this.doc.Speciality + ' _' + this.docName + '');
    this.appointmentMode = mode;
   
    if (mode == "email") {


      let today = new Date();
      let dd = today.getDate();
      let mm = today.getMonth() + 1;
      let h = this.addZero(today.getHours());
      let m = this.addZero(today.getMinutes());

      let ddString = "";
      let mmString = "";

      var yyyy = today.getFullYear();
      if (dd < 10) {
        ddString = '0' + dd;
      }
      else {
        ddString = dd.toString();
      }
      if (mm < 10) {
        mmString = '0' + mm;
      }
      else {
        mmString = mm.toString();
      }
      let todayString = ddString + '/' + mmString + '/' + yyyy.toString();

      


      let ca: currentAppointment = {
        docId: this.doc.DoctorId.toString(),
        docName: this.docName,
        docPhotoURL: this.doc.CompletePhotoUrl,
        docCity: this.doc.CityName,
        docHospital: this.doc.HospitalName,
        docHospitalAddress: this.doc.CityName,
        docHospitalGMapLink: this.doc.CityName,
        docSpeciality: this.doc.Speciality,
        docSpecialityId: this.doc.SpecialityId,
        docQualification: this.doc.Qualification,
        hosId: this.doc.HospitalId.toString(),
        date: todayString,
        timeSlot: h + ":" + m, //this.getTime(h,m),
        DisplayTime:h + ":" + m,
        slotId: 0,
        mode: this.appointmentMode,
        feeInr: Number(this.doc.Tariff),
        feeUsd:Number(this.doc.USD),
        feeTypeInr: "INR",
        feeTypeUsd:"USD",
        locationId: this.doc.LocationId,
        edocDocId: this.doc.UserId
      };


      this.bs.setAppointmentSlot(ca);
      localStorage.setItem('onlineslotDetails', JSON.stringify(ca));
      this.bs.prevURL = this.router.url;


      if (!this.aaa.getSessionStatus()) {
        localStorage.setItem('loginedirect', 'o');

        this.aaa.setAuthCalledFrom(this.aaa.AUTH_CALLED_FROM_DOCTOR_SEARCH);

        let config = {
          keyboard: false,
          backdrop: false,
          ignoreBackdropClick: true
        };

        this.modalRef = this.modalService.show(SignupComponent, config);

      } else {
        this.aaa.getPendingCaseSheet().subscribe(t => {
          if (t.ResponceCode == "0" && t.Result != "" && t.Result != "[]") {
            this.router.navigate(['onlinependingcasesheet']);
          } else {
            this.router.navigate(['onlinepayment']);
          }
        })
      }
    } else {
      this.currentDaySlots = [];
      this.isCollapsed = false;
      this.calendarService.getDocDatesCc(this.doc.HospitalName, +this.doc.DoctorId,this.doc.HospitalId, this.doc.DayofWeek, this.doc.ConsultationType).subscribe(data => {
          if (data != null) {
            this.dates = [];
            data[0].dates.forEach(element => {
              this.dates.push(this.incrementMonthinDateString(element));
            });

            let firstWeekDates = this.dates.slice(0, 6);
            let secondWeekDates = this.dates.slice(6, 10);

            this.firstWeek = [];
            this.secondWeek = [];
            firstWeekDates.forEach(element => {
              this.firstWeek.push(this.utilsService.getDateStringsForAppointmentDisplay(element));
            });

            secondWeekDates.forEach(element => {
              this.secondWeek.push(this.utilsService.getDateStringsForAppointmentDisplay(element));
            });

            this.selectedDate = this.dates[0];

            this.calendarService.getDocSlotsDateC(this.doc.UserId,this.selectedDate.split('/').join('-'),this.timeZone).subscribe(t => {
                if (t.ResponceCode == "0" && t.Result != "") {
                  this.currentDaySlots = JSON.parse(t.Result);
                  this.slotseperation();
                 

                }

              });
          }

        });
    }

  }

  international()
  {
    this.fee = "USD " + this.doc.USD;
      this.feeInt = +this.doc.USD;
      this.feeType = "USD";
      this.HasVoice=JSON.parse("false");
      this.HasEmail=this.doc.HasEmail;
      this.HasVideo=this.doc.HasVideo;
  }

  local()
  {
    this.fee = "RS " + this.doc.Tariff;
      this.feeInt = +this.doc.Tariff;
      this.feeType = "RS";
      //this.timeZone="+05:30";
      this.HasVoice=this.doc.HasVoice;
      this.HasEmail=this.doc.HasEmail;
      this.HasVideo=this.doc.HasVideo;
  }

  morning:any[]=[];
  afternoon:any[]=[];
  night:any[]=[];
  slotseperation()
  {
    for(let i=0;i<this.currentDaySlots.length;i++)
    {
   let x= Number(this.currentDaySlots[i].SlotTime.split("-")[0].slice(0,2));
    if(x<12)this.morning.push(this.currentDaySlots[i]);
    else if((x>=12) && x<=15)this.afternoon.push(this.currentDaySlots[i]);
    else {this.night.push(this.currentDaySlots[i])};
    }
  }



  slotSelected(cs: any) {

    // if (this.selectedHospital == null) {
    //   alert(this.doc.FirstName + ' is available at multiple hospitals. Please select a hospital to start booking your appointment');
    //   return;
    // 
    let ca: currentAppointment = {
      docId: this.doc.DoctorId.toString(),
      docName: this.docName,
      docPhotoURL: this.doc.CompletePhotoUrl,
      docCity: this.doc.CityName,
      docHospital: this.doc.HospitalName,
      docHospitalAddress: this.doc.CityName,
      docHospitalGMapLink: this.doc.CityName,
      docSpeciality: this.doc.Speciality,
      docSpecialityId: this.doc.SpecialityId,
      docQualification: this.doc.Qualification,
      hosId: this.doc.HospitalId.toString(),
      date: this.selectedDate,
      timeSlot: cs.SlotTime,
      DisplayTime:cs.DisplayTime,
      slotId: 0,
      mode: this.appointmentMode,
      feeInr: Number(this.doc.Tariff),
      feeUsd:Number(this.doc.USD),
      feeTypeInr: "INR",
      feeTypeUsd:"USD",
      locationId: this.doc.LocationId,
      edocDocId: this.doc.UserId
    };

    this.bs.setAppointmentSlot(ca);
    localStorage.setItem('onlineslotDetails', JSON.stringify(ca));
    this.bs.prevURL = this.router.url;

    if (!this.aaa.getSessionStatus()) {
      localStorage.setItem('loginedirect', 'o');
      this.cas = cs;
      this.aaa.setAuthCalledFrom(this.aaa.AUTH_CALLED_FROM_DOCTOR_SEARCH);

      let config = {
        keyboard: false,
        backdrop: false,
        ignoreBackdropClick: true
      };

      this.modalRef = this.modalService.show(SignupComponent, config);

    } else {

      this.aaa.getPendingCaseSheet().subscribe(t => {
        if (t.ResponceCode == "0" && t.Result != "" && t.Result != "[]") {
          this.router.navigate(['onlinependingcasesheet']);
        } else {
          this.router.navigate(['onlinepayment']);
        }
      })
    }
  }

  onSelectedHos(selected) {
    this.selectedHospital = this.availableHospitals.filter((h) => {
      return h.hospitalId == selected.target.value;
    })[0];

    this.getSlotsDate(this.selectedDate, false, this.pickedFromCalendar);

  }

  toggleCalendar() {
    if (!this.dpopen) {
      this.openDP();
    }
    else {
      this.hideDP();
    }
  }

  hideDP() {
    this.activateCalendar = false;
    this.datepicker.hide();
    this.dpopen = false;
  }

  openDP() {
    this.activateCalendar = true;
    this.datepicker.show();
    this.dpopen = true;
  }

  getSlotsDate(d: string, incrementMonth: boolean, pickedFromCal: boolean) {
    this.pickedFromCalendar = pickedFromCal;
    this.selectedDate = d;
    this.currentDaySlots = [];
    this.selectedDateString = d.split('/').join('-');
    this.calendarService.getDocSlotsDateC(this.doc.UserId,this.selectedDate.split('/').join('-'),this.timeZone).subscribe(t => {
        if (t.ResponceCode == "0" && t.Result != "") {
          this.currentDaySlots = JSON.parse(t.Result);
          this.slotseperation()
        }
      })
  }

  onDatePicked(sd: string) {
    let fsd = moment(sd).format('DD/MM/YYYY');
    if (this.activateCalendar) {
      this.selectedDate = fsd;
      this.datePickedFromCalendar = this.utilsService.getDateStringsForAppointmentDisplay(fsd);
      this.pickedFromCalendar = true;
      this.cd.detectChanges();
      this.getSlotsDate(this.datePickedFromCalendar.fullDate, false, true);
    }
  }

  getPickedDateSlots() {
    this.getSlotsDate(this.datePickedFromCalendar.fullDate, false, true);
  }

  requestAppointment() {

    const initialState = {
      DoctorId: this.doc.DoctorId,
      Speciality: this.doc.Speciality,
      SpecialityId: this.doc.SpecialityId,
      City: this.doc.CityName,
      CityId: this.cs.getCityIdFromName(this.doc.CityName)
    };

  }

  ngOnDestroy() {
    this.aaa.setAuthCalledFrom(this.aaa.AUTH_CALLED_FROM_HOME);
  }
  storeDocDeatils(docId: any) {
    localStorage.setItem('docProfileId', docId);
    localStorage.setItem("docProfile", JSON.stringify(this.doc));
  }
  moreServices: boolean = true;
  showMoreService() {
    this.moreServices = !this.moreServices;
  }

}
