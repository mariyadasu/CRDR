import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
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

@Component({
  selector: 'app-location-summary-card',
  templateUrl: './location-summary-card.component.html',
  styleUrls: ['./location-summary-card.component.scss']
})
export class LocationSummaryCardComponent implements OnInit {

  @Input('dl') docLocation: docDetailLocation;
  @Input('ds') docSummary: docDetailSummary;
   modalRef: BsModalRef;

  @ViewChild(BsDatepickerDirective) datepicker: BsDatepickerDirective;

  isCollapsed = true;

  bsConfig: Partial<BsDatepickerConfig>;
  minDate: Date;
  maxDate: Date;
  dpopen = false;

  hosAddressLink = '';

  dates: string[] = [];
  firstWeek: aaDateSlotObject[] = [];
  secondWeek: aaDateSlotObject[] = [];

  selectedDate: string;
  selectedDateString: string;
  pickedFromCalendar = false;
  activateCalendar = false;

  datePickedFromCalendar: aaDateSlotObject;
  appointmentSlots: appointmentSlotsTracker[] = [];
  currentDaySlots: appointmentSlotsTracker = {} as appointmentSlotsTracker;

  @ViewChild('template') public openPopupForNoSlots: TemplateRef<any>;

  constructor(
    private cs: CommonService,
    private router: Router,
    private calendarService: CalendarService,
    private utilsService: UtilsService,
    private bs: BookingService,
    private modalService: BsModalService,
    private aaa: AAAuthService,
  ) { }

  ngOnInit() {

    this.bsConfig = Object.assign({}, { containerClass: 'theme-orange', dateInputFormat: 'DD/MM/YYYY' });
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() + 90);

    this.calendarService.datesTracker.subscribe(
      (d: calendarTracker) => {
        if (d.hosId == this.docLocation.HospitalId) 
        {
          this.dates = [];
          d.dates.forEach(element => {
            this.dates.push(this.incrementMonthinDateString(element));
          });
          if(this.dates.length == 0)
          {
            this.isCollapsed = !this.isCollapsed;
            this.openNoSlotsModal();
          }
          else
          {
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

    this.selectedDateString = d.split('/').join('-');
    this.calendarService.getDocSlotsDate(this.docSummary.docId,
      this.docLocation.HospitalId.toString(),
      d.split('/').join('-'));
  }

  bookAppointment(cs: appointmentSlot) {

    let speciId="0";
    if(this.docSummary.docSpecialityId!=undefined && this.docSummary.docSpecialityId!=null){
      speciId=this.docSummary.docSpecialityId;
    }

    if(speciId=="0"){
      speciId=this.docSummary.specialityId;
    }
    let ca: currentAppointment = {
      docId: this.docSummary.docId.toString(),
      docName: this.docSummary.docName,
      docPhotoURL: this.docSummary.docPhotoURL,
      docCity: this.docSummary.docCity,
      docHospital: this.docLocation.HospitalName,
      docHospitalAddress: this.docLocation.HospitalAddress,
      docHospitalGMapLink: this.hosAddressLink,
      docSpeciality: this.docSummary.docSpeciality,
      docSpecialityId: speciId,
      docQualification: this.docSummary.docQualification,
      hosId: this.docLocation.HospitalId.toString(),
      date: this.selectedDate,
      timeSlot: cs.slotTime,
      slotId: cs.slotId
    };

    this.bs.setAppointmentSlot(ca);
    localStorage.setItem('slotDetails', JSON.stringify(ca));
    this.bs.prevURL = this.router.url;
    //debugger;
    //let userState=this.aaa.getBookingParams();
    let userState = localStorage.getItem('loginTypeusrredirection');
    let loginType = localStorage.getItem('loginType');
    if (loginType == 'M') {
      if (userState == "nsnu") {
        //this.router.navigate(['/book-appointment/patient-info-confirm']);
        let phone=localStorage.getItem('mobileforguest');
        this.router.navigate(['/book-appointment/patient-info', { phoneOrEmail: phone }]);
        //this.router.navigate(['/book-appointment/patient-info']);
      } else {
        this.router.navigate(['/book-appointment/patient-info-confirm']);
      }

    } else {
      if (!this.aaa.getSessionStatus()) {
       // this.cas = cs;
        this.aaa.setAuthCalledFrom(this.aaa.AUTH_CALLED_FROM_DOCTOR_SEARCH);
        this.modalRef = this.modalService.show(SignupComponent);
        localStorage.setItem('loginedirect', 'Y');

      } else if (userState == "nsnu") {
        //this.router.navigate(['/book-appointment/patient-info-confirm']);
        this.router.navigate(['/book-appointment/patient-info']);
      } else {
        this.router.navigate(['/book-appointment/patient-info-confirm']);
      }
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
      SpecialityId: this.docSummary.specialityId,
      City: this.docSummary.docCity,
      CityId: this.cs.getCityIdFromName(this.docSummary.docCity)
    };

    this.modalService.show(RequestAppointmentComponent, { initialState });
  }
  // split string and join 
  splitString(string)
  {
    if(string && string != null)
    {
      var old_array = string.split(',');
      var new_string = old_array.join(', ');

      return new_string;
    }
    return string;
  }
  openNoSlotsModal() 
  {
    this.firstWeek = [];
    this.secondWeek = [];
    this.currentDaySlots.morningSlots = null;
    this.currentDaySlots.afternoonSlots = null;
    this.currentDaySlots.eveningSlots = null;
    this.modalRef = this.modalService.show(this.openPopupForNoSlots);
  }
}
