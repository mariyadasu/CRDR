import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { UserService } from '@aa/services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

import { Subject } from 'rxjs/Subject';
import { pastAppointmentDetails, futureAppointmentDetails } from '@aa/structures/user.interface';

import { CalendarService } from '@aa/services/calendar.service';
import {
  calendarTracker, appointmentSlotsTracker,
  appointmentSlot, currentAppointment, aaDateSlotObject
} from '@aa/structures/calendar.tracker.interface';
import { UtilsService } from '@aa/services/utils.service';
import { hospital } from '@aa/structures/hospital.interface';
import { doctor, services } from '@aa/structures/doctor.interface';
import * as moment from 'moment';

import { BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BookingService } from '@aa/services/booking.service';
import { AAAuthService } from '@aa/services/auth.service';
import { SignupComponent } from './../../user/signup/signup.component';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-appointmentlist',
  templateUrl: './appointmentlist.component.html',
  styleUrls: ['./appointmentlist.component.scss']
})
export class AppointmentlistComponent implements OnInit {

  pastAppointmentDetails: pastAppointmentDetails[] = [];
  futureAppointmentDetails: futureAppointmentDetails[] = [];
  response: any;
  moreLessText = 'more';
  public isPastAppointments = false;
  public isFutureAppointments = false;
  isCollapsed = false;
  hospitalId: number;
  doctorId: number;

  @ViewChild(BsDatepickerDirective) datepicker: BsDatepickerDirective;
  @ViewChild('cancelappointment') public cancelappointment: TemplateRef<any>;
  dpopen = false;

  bsConfig: Partial<BsDatepickerConfig>;
  minDate: Date;
  maxDate: Date;

  dates: string[] = [];
  firstWeek: aaDateSlotObject[] = [];
  secondWeek: aaDateSlotObject[] = [];

  selectedDate: string;
  selectedDateString: string;
  pickedFromCalendar = false;
  activateCalendar = false;

  modalRef: BsModalRef;
  waitingForSession = false;
  cs: appointmentSlot;

  datePickedFromCalendar: aaDateSlotObject;
  appointmentSlots: appointmentSlotsTracker[] = [];
  currentDaySlots: appointmentSlotsTracker = {} as appointmentSlotsTracker;

  availableHospitals: hospital[] = [];
  selectedHospital: hospital;
  appointmentId: number;

  cancelAppointmentForm: FormGroup;
  constructor(private userService: UserService,
    private calendarService: CalendarService,
    private utilsService: UtilsService,
    private modalService: BsModalService,
    private bs: BookingService,
    private router: Router,
    private aaa: AAAuthService,
    private cd: ChangeDetectorRef,
    private spinnerService: Ng4LoadingSpinnerService,
    private fb: FormBuilder
  ) {
    this.cancelAppointmentForm = this.fb.group({
      cancelReason: ['', Validators.compose([Validators.required, Validators.maxLength(50),])],
    });
  }

  ngOnInit() {
    this.getConsultationDetails();

    this.bsConfig = Object.assign({}, { containerClass: 'theme-orange', dateInputFormat: 'DD/MM/YYYY' });
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() + 90);

    this.calendarService.datesTracker.subscribe(
      (d: calendarTracker) => {
        if (d.docId == this.doctorId) {
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
          this.calendarService.getDocSlotsDate(this.doctorId,
            this.hospitalId.toString(),
            this.selectedDate.split('/').join('-'));
        }
      }
    );

    this.calendarService.slotsTracker.subscribe(
      (s: appointmentSlotsTracker) => {
        if (s.docId == this.doctorId) {
          this.appointmentSlots.push(s);
          if (this.selectedDate == s.date.split('-').join('/')) {
            this.currentDaySlots = s;
          }
        }
      }
    );
  }

  showHide(index) {
    var e = document.getElementById('showHide' + index);
    if (e.style.display == 'block') {
      e.style.display = 'none';
      document.getElementById("moreLessText" + index).innerHTML = "Show more";
    }
    else {
      e.style.display = 'block';
      document.getElementById("moreLessText" + index).innerHTML = "Show less";
    }
  }
  showHidePast(index) {
    var e = document.getElementById('showHidePast' + index);
    if (e.style.display == 'block') {
      e.style.display = 'none';
      document.getElementById("moreLessTextPast" + index).innerHTML = "Show more";
    }
    else {
      e.style.display = 'block';
      document.getElementById("moreLessTextPast" + index).innerHTML = "Show less";
    }
  }
  pastBookAgain(index, hospitalId, doctorId) {
    this.pastBookAgainShowHide(index);
    this.hospitalId = hospitalId;
    this.doctorId = doctorId;
    this.calendarService.getDocDates(this.hospitalId.toString(), this.doctorId, this.hospitalId);

  }
  pastBookAgainShowHide(index) {
    var e = document.getElementById('pastBookAgainShowHide' + index);
    if (e.style.display == 'block') {
      e.style.display = 'none';
    }
    else {
      e.style.display = 'block';
    }
  }
  upcomingBookAgain(index, hospitalId, doctorId) {
    this.upcomingBookAgainShowHide(index);
    this.hospitalId = hospitalId;
    this.doctorId = doctorId;
    this.calendarService.getDocDates(this.hospitalId.toString(), this.doctorId, this.hospitalId);

  }
  upcomingBookAgainShowHide(index) {
    var e = document.getElementById('rescheduleShowHide' + index);
    if (e.style.display == 'block') {
      e.style.display = 'none';
    }
    else {
      e.style.display = 'block';
    }
  }

  incrementMonthinDateString(d: string) {
    let t = d.split('/');
    t[1] = (+t[1] + 1).toString();
    let ds = +t[0] < 10 ? '0' + (+t[0]) : t[0];
    let ms = +t[1] < 10 ? '0' + (+t[1]) : t[1];
    return ds + '/' + ms + '/' + t[2];
  }

  slotSelected(cs: appointmentSlot, pastAppData) {
    let ca: currentAppointment = {
      docId: pastAppData.doctorId.toString(),
      docName: pastAppData.doctorName,
      docPhotoURL: pastAppData.doctorProfileURL,
      docCity: pastAppData.cityName,
      docHospital: pastAppData.hospitalName,
      docHospitalAddress: pastAppData.cityName,
      docHospitalGMapLink: pastAppData.cityName,
      docSpeciality: pastAppData.speciality,
      docSpecialityId: pastAppData.docSpecialityId,
      docQualification: pastAppData.Qualification,
      hosId: pastAppData.hospitalId.toString(),
      date: this.selectedDate,
      timeSlot: cs.slotTime,
      slotId: cs.slotId,
      appointmentId: pastAppData.appointmentId
    };


    this.bs.setAppointmentSlot(ca);
    localStorage.setItem('slotDetails', JSON.stringify(ca));
    this.bs.prevURL = this.router.url;

    this.router.navigate(['/book-appointment/patient-info-confirm']);
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

    this.selectedDateString = d.split('/').join('-');
    this.calendarService.getDocSlotsDate(this.doctorId,
      this.hospitalId.toString(),
      this.selectedDate.split('/').join('-'));
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

  cancelappointement(appId) {
    this.appointmentId = appId;
    this.modalRef = this.modalService.show(this.cancelappointment);
  }
  /*
  * submit the appointment cancellation reason
  */
  submitCancelAppointment(f: FormGroup) {
    //this.spinnerService.show();
    this.userService.cancelPhysicalAppointment(f.value.cancelReason, this.appointmentId)
      .subscribe(res => {
        //this.spinnerService.hide();
        this.response = res;
        f.reset();
        this.modalRef.hide();
        this.getConsultationDetails();
        alert(this.response.errorMsg);
      }, err => {
        //this.spinnerService.hide();
        console.log(err);
        alert('Something went wrong.');
      });
  }
  showReason: boolean = false;
  showCancel(val: any) {
    this.showReason = val;
  }
  /*
  * Get the consultation details
  */
  getConsultationDetails() {
   // this.spinnerService.show();
    this.userService.geConsultations()
      .subscribe(res => {
       // this.spinnerService.hide();
        this.response = res;
        this.pastAppointmentDetails = this.response.lstPastAppointmentDetails;
        this.futureAppointmentDetails = this.response.lstFutureAppointmentDetails;
        if (this.pastAppointmentDetails.length > 0) {
          this.isPastAppointments = true;
        }
        else {
          this.isPastAppointments = false;
        }
        if (this.futureAppointmentDetails.length > 0) {
          this.isFutureAppointments = true;
        }
        else {
          this.isFutureAppointments = false;
        }
      }, err => {
        //this.spinnerService.hide();
        console.log(err);
      });
  }

}
