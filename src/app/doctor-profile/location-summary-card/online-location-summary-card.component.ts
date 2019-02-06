import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap/datepicker';

import { UtilsService } from './../../services/utils.service';
import { CalendarService } from '@aa/services/calendar.service';
import { BookingService } from '@aa/services/booking.service';

import { services, docDetailLocation, docDetailSummary } from '@aa/structures/doctor.interface';
import {
  calendarTracker, appointmentSlotsTracker,
  appointmentSlot, currentAppointment, aaDateSlotObject
} from '@aa/structures/calendar.tracker.interface';

import * as moment from 'moment';

import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { RequestAppointmentComponent } from '../../doctor-search/request-appointment/request-appointment.component';
import { CommonService } from '@aa/services/common.service';
import { AAAuthService } from '@aa/services/auth.service';
import { SignupComponent } from './../../user/signup/signup.component';
import { doctorC } from '@aa/structures/doctor.interface';

import { constants as c } from './../../constants';

@Component({
  selector: 'online-location-summary-card',
  templateUrl: './online-location-summary-card.component.html',
  styleUrls: ['./online-location-summary-card.component.scss']
})
export class OnlineLocationSummaryCardComponent implements OnInit {

  @Input('dl') docLocation: docDetailLocation;
  @Input('doc') doc: doctorC;
  @Input('ds') docSummary: docDetailSummary;

  modalRef: BsModalRef;

  @ViewChild(BsDatepickerDirective) datepicker: BsDatepickerDirective;

  isCollapsed = true;

  bsConfig: Partial<BsDatepickerConfig>;
  minDate: Date;
  maxDate: Date;
  dpopen = false;
  HasVideo:boolean;
  HasVoice:boolean;
  HasEmail:boolean;
  hosAddressLink = '';

  dates: string[] = [];
  firstWeek: aaDateSlotObject[] = [];
  secondWeek: aaDateSlotObject[] = [];
  timeZone:string;
  selectedDate: string;
  selectedDateString: string;
  pickedFromCalendar = false;
  activateCalendar = false;
  zone:any;
  datePickedFromCalendar: aaDateSlotObject;
  appointmentSlots: appointmentSlotsTracker[] = [];
  currentDaySlots: appointmentSlotsTracker = {} as appointmentSlotsTracker;
  fee: any = "RS 500";
  feeInt: number = 0;
  feeType: string = "";

  SEOSchema: any;
  constructor(
    private cs: CommonService,
    private router: Router,
    private calendarService: CalendarService,
    private utilsService: UtilsService,
    private bs: BookingService,
    private modalService: BsModalService,
    private aaa: AAAuthService
  ) { }

  ngOnInit() {
    this.docName = this.doc.FirstName + " " + this.doc.LastName;
    
  
    this.SEOSchema = [{ "@context": 'http://schema.org', "@type": 'Physician', name: this.doc.FirstName + ' ' + this.doc.LastName, url: this.cs.getPresentUrl(), image: this.doc.CompletePhotoUrl, description: '' }];
    this.zone=new Date().toString().match(/([-\+][0-9]+)\s/)[1];
    this.timeZone=(this.zone.slice(0,3)+":"+this.zone.slice(3,5));
    
    if (this.zone == "+0530") {
      this.local();
    } else {
      this.international();
    }
    this.bsConfig = Object.assign({}, { containerClass: 'theme-orange', dateInputFormat: 'DD/MM/YYYY' });
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() + 90);

    this.calendarService.datesTracker.subscribe(
      (d: calendarTracker) => {
        if (d.hosId == this.docLocation.HospitalId) {
          this.dates = [];
          d.dates.forEach(element => {
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
          this.calendarService.getDocSlotsDate(this.docSummary.docId,
            this.docLocation.HospitalId.toString(),
            this.selectedDate.split('/').join('-'));
        }
      }
    );

    this.calendarService.slotsTracker.subscribe(
      (s: appointmentSlotsTracker) => {
        this.appointmentSlots.push(s);
        if (this.selectedDate == s.date.split('-').join('/')) {
          this.currentDaySlots = s;
        }
      }
    );

    this.hosAddressLink = 'https://www.google.com/maps/?q=' + this.docLocation.Latitude.toString() + ',' + this.docLocation.Longituge.toString();
  
    if(this.aaa.location==="International")
    {
      this.international();
    }
    else if(this.aaa.location===null)
    {
      this.local();
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
  makeAppointment() {
    this.isCollapsed = !this.isCollapsed;

    if (!this.isCollapsed) {
      this.calendarService.getDocDates(this.docLocation.HospitalId.toString(), this.docSummary.docId, this.docLocation.HospitalId);
    }
  }

  incrementMonthinDateString(d: string) {
    let t = d.split('/');
    t[1] = (+t[1] + 1).toString();
    let ds = +t[0] < 10 ? '0' + (+t[0]) : t[0];
    let ms = +t[1] < 10 ? '0' + (+t[1]) : t[1];
    return ds + '/' + ms + '/' + t[2];
  }

  getSlotsDate(d: string, incrementMonth: boolean, pickedFromCal: boolean) {
    this.pickedFromCalendar = pickedFromCal;
    this.selectedDate = d;
    this.currentDaySlotsC = [];
    this.selectedDateString = d.split('/').join('-');

    this.calendarService.getDocSlotsDateC(this.doc.UserId,this.selectedDate.split('/').join('-'),this.timeZone).subscribe(t => {
        if (t.ResponceCode == "0" && t.Result != "") {
          //this.currentDaySlotsC = JSON.parse(t.Result);
          this.currentDaySlotsC = JSON.parse(t.Result);
          // this.calendarService.getDocTimesC(this.currentDaySlotsC).subscribe(data => {
          //   if (data != null) {
          //     this.currentDaySlotsC = [];
          //     this.currentDaySlotsC=data;
          //   }
          // });
          this.slotseperation()
        }

      });
  }

  morning:any[]=[];
afternoon:any[]=[];
night:any[]=[];
  slotseperation()
  {
    for(let i=0;i<this.currentDaySlotsC.length;i++)
    {
   let x= Number(this.currentDaySlotsC[i].SlotTime.split("-")[0].slice(0,2));
    if(x<12)this.morning.push(this.currentDaySlotsC[i]);
    else if((x>=12) && x<=15)this.afternoon.push(this.currentDaySlotsC[i]);
    else {this.night.push(this.currentDaySlotsC[i])};
    }
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

  onDatePicked(sd: string) {
    let fsd = moment(sd).format('DD/MM/YYYY');
    if (this.activateCalendar) {
      this.selectedDate = fsd;
      this.datePickedFromCalendar = this.utilsService.getDateStringsForAppointmentDisplay(fsd);
      this.pickedFromCalendar = true;
      this.getSlotsDate(this.datePickedFromCalendar.fullDate, false, true);
      this.getPickedDateSlots();
    }
  }

  getPickedDateSlots() {
    this.getSlotsDate(this.datePickedFromCalendar.fullDate, false, true);
  }
  makeAppointmentNew() {

  }

  requestAppointment() {
    const initialState = {
      DoctorId: this.docSummary.docId,
      Speciality: this.docSummary.docSpeciality,
      SpecialityId: this.docSummary.docId,
      City: this.docSummary.docCity,
      CityId: this.cs.getCityIdFromName(this.docSummary.docCity)
    };

    this.modalService.show(RequestAppointmentComponent, { initialState });
  }
  appointmentMode: string = "";
  currentDaySlotsC: any[] = [];

  addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  makeAppointmentC(mode: any) {    
    this.cs.setGA('Online Appointment Profile Page','Online Consultations Profile Page','Online Consultations_Book via '+mode+' Mode','Online Consultations_Profile_'+mode+'_'+this.docName+'');
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
      if (mm < 10) {
        mmString = '0' + mm;
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

        this.modalRef = this.modalService.show(SignupComponent,config);

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
      this.isCollapsed = false;
      this.currentDaySlotsC = [];
      this.calendarService
      .getDocDatesCc(this.doc.HospitalName, +this.doc.DoctorId,
        this.doc.HospitalId, this.doc.DayofWeek, this.doc.ConsultationType)
        .subscribe(data => {
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
            //debugger;
            this.calendarService.getDocSlotsDateC(this.doc.UserId,this.selectedDate.split('/').join('-'),this.timeZone).subscribe(t => {
                if (t.ResponceCode == "0" && t.Result != "") {
                  //this.currentDaySlotsC = JSON.parse(t.Result);
                  this.currentDaySlotsC = JSON.parse(t.Result);
                  // this.calendarService.getDocTimesC(this.currentDaySlotsC).subscribe(data => {
                  //   if (data != null) {
                  //     this.currentDaySlotsC = [];
                  //     this.currentDaySlotsC=data;
                  //   }
                  // });
                  this.slotseperation()
                }

              });
          }

        });
    }


  }
  docName: string = "";
  slotSelected(cs: any) {

   
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
      this.aaa.setAuthCalledFrom(this.aaa.AUTH_CALLED_FROM_DOCTOR_SEARCH);

      let config = {
        keyboard: false,
        backdrop: false,
        ignoreBackdropClick: true
      };


      this.modalRef = this.modalService.show(SignupComponent,config);

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

  // split the day of the week string
  splitDayOfWeek(dayofWeek)
  {
    var old_array = dayofWeek.split(',');
    var new_string = old_array.join(', ');

    return new_string;
  }

}
