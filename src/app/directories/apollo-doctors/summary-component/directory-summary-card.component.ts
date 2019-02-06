
import { CommonService } from '@aa/services/common.service';
import { DirectoryRequestAppointmentComponent } from './../request-appointment/directory-request-appointment.component';
import { element } from 'protractor';
import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, OnDestroy,Renderer2,Inject, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';

import { BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { AAAuthService } from '@aa/services/auth.service';
import { UtilsService } from '@aa/services/utils.service';
import { CalendarService } from '@aa/services/calendar.service';
import { BookingService } from '@aa/services/booking.service';

import { hospital } from '@aa/structures/hospital.interface';
import { doctor, services } from '@aa/structures/doctor.interface';
import {
  calendarTracker, appointmentSlotsTracker,
  appointmentSlot, currentAppointment, aaDateSlotObject
} from '@aa/structures/calendar.tracker.interface';

import { SignupComponent } from '../../../user/signup/signup.component';

import * as moment from 'moment';

import { RequestAppointmentComponent } from '../../../doctor-search/request-appointment/request-appointment.component';

@Component({
  selector: 'directory-summary-card',
  templateUrl: './directory-summary-card.component.html',
  styleUrls: ['./directory-summary-card.component.scss']
})

export class DirectorySummaryCardComponent implements OnInit, OnDestroy {

  @Input('d') doc: doctor;
  isCollapsed = true;

  @ViewChild(BsDatepickerDirective) datepicker: BsDatepickerDirective;
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
  // waitingForSession = false;
  cas: appointmentSlot;

  datePickedFromCalendar: aaDateSlotObject;
  appointmentSlots: appointmentSlotsTracker[] = [];
  currentDaySlots: appointmentSlotsTracker = {} as appointmentSlotsTracker;

  profileURL = '';

  availableHospitals: hospital[] = [];
  selectedHospital: hospital;
  doctorSchema: any;
  tempData: any;

   @ViewChild('template') public openPopupForNoSlots: TemplateRef<any>;

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    private cs: CommonService,
    private calendarService: CalendarService,
    private utilsService: UtilsService,
    private aaa: AAAuthService,
    private bs: BookingService,
    private modalService: BsModalService,
    private _renderer2: Renderer2) { }

  ngOnInit() {

    this.bsConfig = Object.assign({}, { containerClass: 'theme-orange', dateInputFormat: 'DD/MM/YYYY' });
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() + 90);

    this.profileURL = '/' + this.utilsService.sanitizeURLParam(this.doc.CityName) + '/' + this.utilsService.sanitizeURLParam(this.doc.MultiSpecialityKeyword) + '/' + this.utilsService.sanitizeURLParam(this.doc.doctorName);
    this.doc.HospitalNames = this.doc.HospitalNames.split('@').join(', ');

    this.tempData = this.doc;
     
    this.doctorSchema = this.tempData.objSEOSchemaonDoctorProfile;
    this.doctorSchema.url = location.protocol + "//" + location.host + '/' + this.doctorSchema.url;

    this.cs.doctorInfoschema(this.doctorSchema,this._renderer2);

    this.calendarService.datesTracker.subscribe(
      (d: calendarTracker) => {
        if (d.docId == this.doc.doctorId) {
          this.dates = [];
          d.dates.forEach(element => {
            this.dates.push(this.incrementMonthinDateString(element));
          });
          if(this.dates.length == 0)
          {
            //this.isCollapsed = !this.isCollapsed;
            this.openNoSlotsModal();
          }
          else
          {
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
            this.calendarService.getDocSlotsDate(this.doc.doctorId,
              this.selectedHospital.hospitalId.toString(),
              this.selectedDate.split('/').join('-'));
          }
        }
      }
    );

    this.calendarService.slotsTracker.subscribe(
      (s: appointmentSlotsTracker) => {
        if (s.docId == this.doc.doctorId) {
          this.appointmentSlots.push(s);
          // console.log('Selected Date: ' + this.selectedDate);
          // console.log('Received Date: ' + s.date.split('-').join('/'));
          if (this.selectedDate == s.date.split('-').join('/')) {
            this.currentDaySlots = s;
          }
        }
      }
    );

    // this.aaa.sessionStatusTracker.subscribe(
    //   (status: boolean) => {
    //     if(status && this.waitingForSession) {
    //       this.bookAppointment(this.cs);
    //       this.waitingForSession = false;
    //     }
    //   }
    // );

    let names = this.doc.HospitalNames.split(', ');
    let ids = this.doc.HospitalIds.split(',');

    names.forEach((name, i) => {
      let h: hospital = { hospitalName: name, hospitalId: +ids[i], hospitalType: '' };
      this.availableHospitals.push(h);
    });

    this.selectedHospital = this.availableHospitals[0];

  }

  incrementMonthinDateString(d: string) {
    let t = d.split('/');
    t[1] = (+t[1] + 1).toString();
    let ds = +t[0] < 10 ? '0' + (+t[0]) : t[0];
    let ms = +t[1] < 10 ? '0' + (+t[1]) : t[1];
    return ds + '/' + ms + '/' + t[2];
  }

  makeAppointment() {
    this.isCollapsed = !this.isCollapsed;

    if (!this.isCollapsed) {
      this.calendarService.getDocDates(this.selectedHospital.hospitalId.toString(), this.doc.doctorId, this.selectedHospital.hospitalId);
    }
  }

  selectedService(s: services) {
    // What should we do when someone clicks on a service
  }

  slotSelected(cs: appointmentSlot) {

    if (this.selectedHospital == null) {
      alert(this.doc.doctorName + ' is available at multiple hospitals. Please select a hospital to start booking your appointment');
      return;
    }

    let ca: currentAppointment = {
      docId: this.doc.doctorId.toString(),
      docName: this.doc.doctorName,
      docPhotoURL: this.doc.completePhotoURL,
      docCity: this.doc.CityName,
      docHospital: this.selectedHospital.hospitalName,
      docHospitalAddress: this.doc.CityName,
      docHospitalGMapLink: this.doc.CityName,
      docSpeciality: this.doc.MultiSpecialityKeyword,
      docSpecialityId:this.doc.specialityId,
      docQualification: this.doc.qualification,
      hosId: this.selectedHospital.hospitalId.toString(),
      date: this.selectedDate,
      timeSlot: cs.slotTime,
      slotId: cs.slotId
    };

    this.bs.setAppointmentSlot(ca);
    localStorage.setItem('slotDetails', JSON.stringify(ca));
    this.bs.prevURL = this.router.url;
    //let userState=this.aaa.getBookingParams();
    let userState = localStorage.getItem('loginTypeusrredirection');
    let loginType = localStorage.getItem('loginType');
    if (loginType == 'C') {
      if (userState == "nsnu") {
        //this.router.navigate(['/book-appointment/patient-info-confirm']);
        this.router.navigate(['/book-appointment/patient-info']);
      } else {
        this.router.navigate(['/book-appointment/patient-info-confirm']);
      }

    } else {
      if (!this.aaa.getSessionStatus()) {
        this.cas = cs;
        this.aaa.setAuthCalledFrom(this.aaa.AUTH_CALLED_FROM_DOCTOR_SEARCH);

        let config = {
          keyboard: false,
          backdrop: false,
          ignoreBackdropClick: true
        };


        this.modalRef = this.modalService.show(SignupComponent,config);

      } else if (userState == "nsnu") {
        //this.router.navigate(['/book-appointment/patient-info-confirm']);
        this.router.navigate(['/book-appointment/patient-info']);
      } else {
        this.router.navigate(['/book-appointment/patient-info-confirm']);
      }
    }
  }

  onSelectedHos(selected) {
    this.selectedHospital = this.availableHospitals.filter((h) => {
      return h.hospitalId == selected.target.value;
    })[0];
    this.isCollapsed = !this.isCollapsed;
    this.makeAppointment();
    //this.getSlotsDate(this.selectedDate, false, this.pickedFromCalendar);

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
    //console.log(d);
    if(d == 'undefined')
    {
      this.selectedDateString = d.split('/').join('-');

      this.calendarService.getDocSlotsDate(this.doc.doctorId,
        this.selectedHospital.hospitalId.toString(),
        this.selectedDate.split('/').join('-'));
    }
    else
    {
        this.selectedDateString = d.split('/').join('-');

        this.calendarService.getDocSlotsDate(this.doc.doctorId,
          this.selectedHospital.hospitalId.toString(),
          this.selectedDate.split('/').join('-'));
    }
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
      DoctorId: this.doc.doctorId,
      Speciality: this.doc.MultiSpecialityKeyword,
      SpecialityId: this.doc.specialityId,
      City: this.doc.CityName,
      CityId: this.cs.getCityIdFromName(this.doc.CityName)
    };
    this.modalService.show(RequestAppointmentComponent, { initialState });
    //this.modalService.show(DirectoryRequestAppointmentComponent, { initialState });
  }

  ngOnDestroy() {
    this.aaa.setAuthCalledFrom(this.aaa.AUTH_CALLED_FROM_HOME);
  }

  replaceLinks(text: any) {
    return this.utilsService.sanitizeURLParam(text);
  }
  moreServices: boolean = true;
  showMoreService() {
    this.moreServices = !this.moreServices;
  }
  openNoSlotsModal() 
  {
    this.firstWeek = [];
    this.secondWeek = [];
    this.currentDaySlots.morningSlots = null;
    this.currentDaySlots.afternoonSlots = null;
    this.currentDaySlots.eveningSlots = null;
    if(this.availableHospitals.length <= 1)
    {
      this.isCollapsed = !this.isCollapsed;
    }
    this.modalRef = this.modalService.show(this.openPopupForNoSlots);
  }
  error(event,gender)
  {
    event.target.src = this.cs.noImage(gender)
  }

}
