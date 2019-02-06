import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { UserService } from '@aa/services/user.service';
import { AAAuthService } from '@aa/services/auth.service';
import { ocUpcomingAppointmentDetails, ocpastAppointmentDetails, AppointmentDetailsByAppointmentId } from '@aa/structures/user.interface';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap';
import { NgForm } from '@angular/forms';
import { ValidationManager } from "ng2-validation-manager";
import { FormGroup, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { UserInfo, aaToken, OCUserInfo, Clarification, DownloadPrescription } from '@aa/structures/user.interface';

import { CalendarService } from '@aa/services/calendar.service';
import {
  calendarTracker, appointmentSlotsTracker,
  appointmentSlot, currentAppointment, aaDateSlotObject, appointmentSlotNew
} from '@aa/structures/calendar.tracker.interface';
import { UtilsService } from '@aa/services/utils.service';
import { hospital } from '@aa/structures/hospital.interface';
import { doctor, services, doctorC } from '@aa/structures/doctor.interface';
import * as moment from 'moment';
import { constants as c } from './../../constants';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse } from '@angular/common/http'

import { BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
@Component({
  selector: 'app-dashboard-oc',
  templateUrl: './dashboard-oc.component.html',
  styleUrls: ['./dashboard-oc.component.scss'],
  providers: [DatePipe]
})
export class DashboardOcComponent implements OnInit {

  modalRef: BsModalRef;
  ocUpcomingAppointmentDetails: ocUpcomingAppointmentDetails[] = [];
  ocpastAppointmentDetails: ocpastAppointmentDetails[] = [];
  AppointmentDetailsByAppointmentId: AppointmentDetailsByAppointmentId[] = [];
  response: any;
  moreLessText = 'more';
  @ViewChild(BsDatepickerDirective) datepicker: BsDatepickerDirective;
  @ViewChild(BsDatepickerDirective) datepickerFreeReview: BsDatepickerDirective;
  @ViewChild('cancelAppointment') public cancelAppointment: TemplateRef<any>;
  public loading = true;
  appId: string;
  visitId: string;
  isMobileNumberChange: boolean = false;

  config = {
    animated: true
  };
  feedBackForm;
  supportForm;
  private questionOptions: any;
  res: any;
  ocUserSubscription = new Subscription;
  ocUserInfo: OCUserInfo = {} as OCUserInfo;
  clarifications: Clarification = {} as Clarification;
  prescriptionData: DownloadPrescription = {} as DownloadPrescription;


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
  activateCalendarFreeReview = false;

  waitingForSession = false;
  cs: appointmentSlot;
  csNew: appointmentSlotNew;

  datePickedFromCalendar: aaDateSlotObject;
  appointmentSlots: appointmentSlotsTracker[] = [];
  currentDaySlots: appointmentSlotsTracker = {} as appointmentSlotsTracker;

  availableHospitals: hospital[] = [];
  selectedHospital: hospital;
  timeZone: string;
  hospitalId: number;
  doctorId: number;
  doctorC: doctorC = {} as doctorC;
  docDetailsRes: any;
  zone: any;
  dpopen = false;
  dpopenFreeReview = false;
  appointmentId: string;
  currentAppointmentData: any;
  freeReviewSubmittedData: any;
  marchantId: string;

  public now: Date = new Date();

  public progress: number;
  public message: string;

  selectedFile: File = null;
  currentDaySlotsFreeReview: any[] = [];
  currentDaySlotsReshedule: any[] = [];
  constructor(private us: UserService,
    private auth: AAAuthService,
    private spinnerService: Ng4LoadingSpinnerService,
    private modalService: BsModalService,
    private router: Router,
    private calendarService: CalendarService,
    private utilsService: UtilsService,
    private cd: ChangeDetectorRef,
    private _datePipe: DatePipe,
  ) {
    // Feedback form validations --start
    this.feedBackForm = new ValidationManager({
      'rating': 'required',
      'question': '',
      'answer': 'required|maxLength:250',
      'email': 'required|email',
      'appointmentId': ''
    });
    this.feedBackForm.setErrorMessage('rating', 'required', 'Rating is required');
    this.feedBackForm.setErrorMessage('answer', 'required', 'Answer is required');
    this.feedBackForm.setErrorMessage('answer', 'maxLength', 'Answer should be lessthan 250 characters');
    this.feedBackForm.setErrorMessage('email', 'required', 'Email is required');
    this.feedBackForm.setErrorMessage('email', 'email', 'Email is not valid');
    // Feedback form validations --end
    // questions options
    this.questionOptions = [
      {
        id: 1,
        label: "Which aspect of the website should we improve upon?",
        value: 'Which aspect of the website should we improve upon?'
      }, {
        id: 2,
        label: "What did you like on the website?",
        value: 'What did you like on the website?'
      }
    ];
    this.feedBackForm.setValue({ 'question': this.questionOptions[0].value });

    // Support Form form validations --start
    this.supportForm = new ValidationManager({
      'supportOption': 'required',
      'mobileNumber': 'minLength:10|maxLength:10|number'
    });
    this.supportForm.setErrorMessage('supportOption', 'required', 'Support option is required');
    this.supportForm.setErrorMessage('mobileNumber', 'minLength', 'Mobile No is invalid');
    this.supportForm.setErrorMessage('mobileNumber', 'maxLength', 'Mobile No is invalid');
    this.supportForm.setErrorMessage('mobileNumber', 'number', 'Mobile No is invalid');
    // Support Form validations --end
  }

  ngOnInit() {
    this.auth.checkPendingCaseSheet();
    this.zone = new Date().toString().match(/([-\+][0-9]+)\s/)[1];
    this.timeZone = (this.zone.slice(0, 3) + ":" + this.zone.slice(3, 5));
    this.getAllAppointments();

    // get the user data -- start
    this.us.getOCUserDetails();
    //this.spinnerService.show();
    this.ocUserSubscription = this.us.ocUserTracker.subscribe(
      (data) => {
        //this.spinnerService.hide();
        this.res = data;
        if (this.res.ResponceCode == 6) {
          this.auth.logoutUser();
        }
        if (this.res.ResponceCode == 0) {
          this.ocUserInfo = JSON.parse(this.res.Result)[0];
        }
        else {
          this.router.navigate(['/my/dashboard']);
        }
      }, (err) => {
        //this.spinnerService.hide();
        console.log(err);
      }
    );

    // get the user data  -- end

    // Slats related (For reschedule )code --start
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

    // Slats related (For reschedule )code --end
    this.auth.loadSocket();
  }

  /*
  *  Get the appointments data
  */
  getAllAppointments() {
    this.spinnerService.show();
    this.us.getUpcomingAppointmentDetails(this.timeZone).subscribe(res => {
      // this.spinnerService.hide();
      this.response = res;
      if (this.response.ResponceCode == 6) {
        alert('Your session has expired. You are now being redirected to the home page.');
        this.auth.logoutUser();
      }
      this.spinnerService.hide(); debugger;
      this.ocUpcomingAppointmentDetails = JSON.parse(JSON.parse(this.response.Result));

    }, err => {
      this.spinnerService.hide();
      console.log(err);
    });
    this.spinnerService.show();
    this.us.getPastAppointmentDetails(this.timeZone).subscribe(res => {
      // this.spinnerService.hide();
      this.response = res;
      if (this.response.ResponceCode == 6) {
        alert('Your session has expired. You are now being redirected to the home page.');
        this.auth.logoutUser();
      }
      this.spinnerService.hide();
      this.ocpastAppointmentDetails = JSON.parse(JSON.parse(this.response.Result));

    }, err => {
      this.spinnerService.hide();
      console.log(err);
    });
  }

  /*
  *  show hide the mode
  */
  showHideMode(index) {
    var e = document.getElementById('showHideMode' + index);
    if (e.style.display == 'block') {
      e.style.display = 'none';
    }
    else {
      e.style.display = 'block';
    }
  }
  /*
  *  show more for upcoming apointments 
  */
  showMoreUpcoming(index) {
    var e = document.getElementById('showMoreUpcoming' + index);
    if (e.style.display == 'block') {
      e.style.display = 'none';
      document.getElementById("moreLessTextUpcomming" + index).innerHTML = "Show more";
    }
    else {
      e.style.display = 'block';
      document.getElementById("moreLessTextUpcomming" + index).innerHTML = "Show less";
    }
  }
  /*
  *  show more for past apointments 
  */
  showMorePast(index) {
    var e = document.getElementById('showMorePast' + index);
    if (e.style.display == 'block') {
      e.style.display = 'none';
      document.getElementById("moreLessTextPast" + index).innerHTML = "Show more";
    }
    else {
      e.style.display = 'block';
      document.getElementById("moreLessTextPast" + index).innerHTML = "Show less";
    }
  }

  //------------------------------ Reschedule code starts ---------------------------------------------------
  /*
  *  Get the doctor slots when user clicks on reschedule button
  */
  reschedule(index, appData) {

    this.rescheduleShowHide(index);
    this.docDetailsRes = appData;
    this.hospitalId = Number(this.docDetailsRes.HospitalId);
    this.doctorId = this.docDetailsRes.EdocDoctorId;


    this.currentDaySlotsReshedule = [];
    if (!this.docDetailsRes.DayofWeek)
      this.docDetailsRes.DayofWeek = "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday";
    this.calendarService
      .getDocDatesCc(this.docDetailsRes.HospitalName, +this.docDetailsRes.DoctorId,
        this.docDetailsRes.HospitalId, this.docDetailsRes.DayofWeek, this.docDetailsRes.consultationType)
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
          this.calendarService.getDocSlotsDateC(this.docDetailsRes.EdocDoctorId, this.selectedDate.split('/').join('-'), this.timeZone).subscribe(t => {
            if (t.ResponceCode == "0" && t.Result != "" && t.Result != "No Slots Found") {
              //this.currentDaySlotsReshedule = JSON.parse(t.Result);
              this.currentDaySlotsReshedule = JSON.parse(t.Result);
              console.log(this.currentDaySlotsReshedule)
              // this.calendarService.getDocTimesC(this.currentDaySlotsReshedule).subscribe(data => {
              //   if (data != null) {
              //     this.currentDaySlotsReshedule = [];
              //     this.currentDaySlotsReshedule=data;
              //   }
              // });
            }

          });
        }

      });
    // window.location.reload();
  }


  /*
  *  show / hide reschedule section
  */
  rescheduleShowHide(index) {
    var e = document.getElementById('rescheduleShowHide' + index);
    if (e.style.display == 'block') {
      e.style.display = 'none';
    }
    else {
      e.style.display = 'block';
    }
  }
  /*
  * Internal fuction for reschedule slot selection
  */
  incrementMonthinDateString(d: string) {
    let t = d.split('/');
    t[1] = (+t[1] + 1).toString();
    let ds = +t[0] < 10 ? '0' + (+t[0]) : t[0];
    let ms = +t[1] < 10 ? '0' + (+t[1]) : t[1];
    return ds + '/' + ms + '/' + t[2];
  }
  /*
  * Get the slots for reschedule
  */
  getSlotsDateReschedule(d: string, incrementMonth: boolean, pickedFromCal: boolean) {
    this.pickedFromCalendar = pickedFromCal;
    this.selectedDate = d;

    this.selectedDateString = d.split('/').join('-');
    this.calendarService.getDocSlotsDate(this.doctorId,
      this.hospitalId.toString(),
      this.selectedDate.split('/').join('-'));

    this.pickedFromCalendar = pickedFromCal;
    this.selectedDate = d;
    this.currentDaySlotsReshedule = [];
    this.selectedDateString = d.split('/').join('-');
    this.calendarService.getDocSlotsDateC(this.docDetailsRes.EdocDoctorId, this.selectedDate.split('/').join('-'), this.timeZone).subscribe(t => {
      if (t.ResponceCode == "0" && t.Result != "" && t.Result != "No Slots Found") {
        //this.currentDaySlotsReshedule = JSON.parse(t.Result);
        this.currentDaySlotsReshedule = JSON.parse(t.Result);
        console.log(this.currentDaySlotsReshedule)
        // this.calendarService.getDocTimesC(this.currentDaySlotsReshedule).subscribe(data => {
        //   if (data != null) {
        //     this.currentDaySlotsReshedule = [];
        //     this.currentDaySlotsReshedule=data;
        //   }
        // });
      }
    })


  }
  getPickedDateSlotsReschedule() {
    this.getSlotsDateReschedule(this.datePickedFromCalendar.fullDate, false, true);
  }
  slotSelectedReshedule(cs, appData) {

    this.spinnerService.show();
    this.us.reschedule(appData, cs.Apdate, cs.SlotTime).subscribe(res => {
      this.spinnerService.hide();
      this.response = res;
      alert(this.response.Result);
      this.getAllAppointments();
    }, err => {
      this.spinnerService.hide();
      console.log(err);
      alert('Something went wrong.');
    });
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


  onDatePickedReschedule(sd: string) {
    let fsd = moment(sd).format('DD/MM/YYYY');
    if (this.activateCalendar) {
      this.selectedDate = fsd;
      this.datePickedFromCalendar = this.utilsService.getDateStringsForAppointmentDisplay(fsd);
      this.pickedFromCalendar = true;
      this.cd.detectChanges();
      this.getSlotsDateReschedule(this.datePickedFromCalendar.fullDate, false, true);
    }
  }

  getPickedDateSlots() {
    this.getSlotsDate(this.datePickedFromCalendar.fullDate, false, true);
  }

  //------------------------------ Reschedule code ends ---------------------------------------------------

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
  showHidePast(index, appid, apptype) {
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

  //---------------------------cancel appointment start---------------
  cancelappointement(apptid, visitid) {
    this.appId = apptid;
    this.visitId = visitid;
    this.modalRef = this.modalService.show(this.cancelAppointment);
  }
  submitCancelAppointment(f: NgForm) {

    this.spinnerService.show();
    this.us.cancelAppointment(f.value.cancelReason, f.value.appId, f.value.visitId)
      .subscribe(res => {
        this.spinnerService.hide();
        this.response = res;
        f.reset();
        alert(this.response.Result);
        this.getAllAppointments();
      }, err => {
        this.spinnerService.hide();

        alert('Something went wrong.');
      });

  }
  //---------------------------cancel appointment ends---------------

  //---------------------------Change the mode starts----------------
  changeMode(m: NgForm, appointmentId, index) {
    this.spinnerService.show();
    this.us.changeConsultationMode(m.value.consultationMode, appointmentId)
      .subscribe(
        (data) => {
          this.spinnerService.hide();
          this.showHideMode(index);
          alert('Thanks For Choosing Our Support Team.Our Support Team Contact You Back Soon..!');
        }
      ), err => {
        this.spinnerService.hide();
        alert(err);
      };
  }
  //---------------------------Change the mode ends----------------
  /*
  *  Open Feedback modal
  */
  openFeedBackModal(feedback: TemplateRef<any>, appointmentId) {
    this.feedBackForm.setValue({ 'appointmentId': appointmentId });
    this.modalRef = this.modalService.show(feedback, this.config);
  }

  /*
  *  Save Feedback
  */
  saveFeedback() {
    if (this.feedBackForm.isValid()) {
      this.spinnerService.show();
      this.us.saveFeedback(this.feedBackForm.getData())
        .subscribe(
          (data) => {
            this.spinnerService.hide();
            this.res = data;
            if (this.res.ResponceCode == 0) {
              this.feedBackForm.reset();
              this.modalRef.hide();
              this.feedBackForm.setValue({ 'question': this.questionOptions[0].value });
              alert(this.res.Result);
            }
            else {
              alert('Something went wrong.');
            }
          }
        ), err => {
          this.spinnerService.hide();
          alert(err);
        };
    }
  }

  /*
  *  Set the rating 
  */
  selectRating(value) {
    this.feedBackForm.setValue({ 'rating': value });
  }
  /*
  *  Redirect order medicine page
  */
  gotoOrderMedicine(appointmentId) {
    // Pass the appointment id to the next request
    this.us.changeAppointmentId(appointmentId);
    this.router.navigate(['/my/order-medicine']);
  }
  /*
  *  Save Support Form
  */
  saveSupportForm() {
    if (this.supportForm.isValid()) {
      if (this.supportForm.getData().supportOption == 'I want to change my mobile number.') {
        if (this.supportForm.getData().mobileNumber) {
          this.submitSupportForm(this.supportForm.getData());
        }
        else {
          alert('Mobile number is required');
        }
      }
      else {
        this.submitSupportForm(this.supportForm.getData());
      }
    }
  }
  /*
  *  Get the selected support option
  */
  supportOptionSelection(value) {
    if (value == 4) {
      this.isMobileNumberChange = true;
    }
    else {
      this.isMobileNumberChange = false;
    }
  }
  /*
  *  Submit the support form
  */
  submitSupportForm(supportFormData) {
    this.spinnerService.show();
    this.us.saveSupport(this.supportForm.getData())
      .subscribe(
        (data) => {
          this.spinnerService.hide();
          //this.res = data;
          this.supportForm.reset();
          alert('Thanks For Choosing Our Support Team.Our Support Team Contact You Back Soon..!');
        }
      ), err => {
        this.spinnerService.hide();
        alert(err);
      };
  }
  /*
  *  Verify the microphone is working or not
  */
  testMicroPhone() {
    window.open("https://staging.askapollo.com/online-consultation/VoiceSpekarTest/VoiceSpeakerTest.aspx", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400");
  }
  /*
 *  Verify the microphone is working or not
 */
  testCamera() {
    window.open("https://staging.askapollo.com/online-consultation/Patient/TestWebcam.aspx", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400");
  }
  /*
  *  Download video plugin link
  */
  downloadVideoPlugin() {
    window.open("https://uvd.vidyocloud.com/download.html?lang=en#", "_blank");
  }
  /*
  *  Invoice submission
  */
  submitInvoice(mode, appointmentId) {
    let consultationMode = '';
    if (mode == 'Email') {
      consultationMode = '1';
    }
    else if (mode == 'Video') {
      consultationMode = '2';
    }
    else if (mode == 'Voice') {
      consultationMode = '3';
    }
    this.spinnerService.show();
    this.us.submitInvoice(consultationMode, appointmentId)
      .subscribe(
        (data) => {
          this.spinnerService.hide();
          alert('Thanks For Choosing Our Support Team.Our Support Team Contact You Back Soon..!');
        }
      ), err => {
        this.spinnerService.hide();
        alert(err);
      };
  }
  //---------------------------Change the mode ends----------------

  /*
  *  Opens the clarification model popup 
  */
  openClarificationModel(clarification: TemplateRef<any>, appointmentId) {
    this.appointmentId = appointmentId;
    this.spinnerService.show();
    this.us.getClarificationOptions()
      .subscribe(
        (data) => {
          this.spinnerService.hide();
          this.response = data;
          this.clarifications = JSON.parse(this.response.Result);
          this.modalRef = this.modalService.show(clarification);
        }
      ), err => {
        this.spinnerService.hide();
        console.log(err);
      };
  }
  /*
  *  submit the clarifications 
  */
  submitClarification(c) {
    var questions = "";
    var answers = "";
    Object.keys(c.value).forEach(function (key) {
      if (c.value[key]) {
        questions += key + "~";
        answers += c.value[key] + "~";
      }
    });
    questions = questions.slice(0, -1);
    answers = answers.slice(0, -1);

    this.spinnerService.show();
    this.us.submitClarifications(questions, answers, this.appointmentId)
      .subscribe(
        (data) => {
          this.spinnerService.hide();
          this.response = data;
          c.reset();
          this.modalRef.hide();
          if (this.response.ResponceCode == 0) {
            alert(this.response.Result);
          }
          else {
            alert('Something went wrong');
          }
        }
      ), err => {
        this.spinnerService.hide();
        console.log(err);
      };
  }
  /*
  *  Download prescription
  */
  downloadPrescription(past) {

    var endPoint = c.downloadPrescriptionUrl + "?appid=" + past.AppointmentId + "&visitid=" + past.VisitId + "&uhid=" + past.Uhid + "&user=Patient&PatientName=" + past.PatientName;
    window.open(endPoint, '_blank');

  }
  //------------------------------ Free Review code starts ---------------------------------------------------
  /*
  *  Get the doctor slots when user clicks on Free Review button
  */
  freeReview(index, appData, freeReviewModel) {
    this.docDetailsRes = appData;
    this.hospitalId = Number(this.docDetailsRes.HospitalId);
    this.doctorId = this.docDetailsRes.EdocDoctorId;

    if (appData.Category === "Email") {

      this.modalRef = this.modalService.show(freeReviewModel);
      this.currentAppointmentData = appData;
      this.auth.getMarchantIdAnonymousforSourceApp().subscribe(t => {
        if (t.ResponceCode == "0" && t.Result != "" && t.Result != "No Slots Found") {
          this.marchantId = t.Result;
          this.getAllAppointments();

        } else {
          alert("Something went wrong");
        }
      })


    }
    else {

      this.freeReviewShowHide(index);

      this.currentDaySlotsFreeReview = [];
      if (!this.docDetailsRes.DayofWeek)
        this.docDetailsRes.DayofWeek = "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday";
      this.calendarService.getDocDatesC(this.docDetailsRes.HospitalName, +this.docDetailsRes.DoctorId, this.docDetailsRes.HospitalId, this.docDetailsRes.DayofWeek).subscribe(data => {
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
          this.calendarService.getDocSlotsDateC(this.docDetailsRes.EdocDoctorId, this.selectedDate.split('/').join('-'), this.timeZone).subscribe(t => {
            if (t.ResponceCode == "0" && t.Result != "" && t.Result != "No Slots Found") {
              this.currentDaySlotsFreeReview = JSON.parse(t.Result);
            }

          });
        }

      });

    }


  }



  /*
  *  show / hide free review section
  */
  freeReviewShowHide(index) {
    var e = document.getElementById('freeReviewShowHide' + index);
    if (e.style.display == 'block') {
      e.style.display = 'none';
    }
    else {
      e.style.display = 'block';
    }
  }

  getSlotsDateFreeReview(d: string, incrementMonth: boolean, pickedFromCal: boolean) {
    this.pickedFromCalendar = pickedFromCal;
    this.selectedDate = d;

    this.selectedDateString = d.split('/').join('-');
    this.calendarService.getDocSlotsDate(this.doctorId,
      this.hospitalId.toString(),
      this.selectedDate.split('/').join('-'));

    this.pickedFromCalendar = pickedFromCal;
    this.selectedDate = d;
    this.currentDaySlotsFreeReview = [];
    this.selectedDateString = d.split('/').join('-');
    this.calendarService.getDocSlotsDateC(this.docDetailsRes.EdocDoctorId, this.selectedDate.split('/').join('-'), (this.zone.slice(0, 3) + ":" + this.zone.slice(3, 5))).subscribe(t => {
      if (t.ResponceCode == "0" && t.Result != "" && t.Result != "No Slots Found") {
        //this.currentDaySlotsFreeReview = JSON.parse(t.Result);
        this.currentDaySlotsFreeReview = JSON.parse(t.Result);
        // this.calendarService.getDocTimesC(this.currentDaySlotsFreeReview).subscribe(data => {
        //   if (data != null) {
        //     this.currentDaySlotsFreeReview = [];
        //     this.currentDaySlotsFreeReview=data;
        //   }
        // });
      }
    })


  }

  getPickedDateSlotsFreeReview() {
    this.getSlotsDateFreeReview(this.datePickedFromCalendar.fullDate, false, true);
  }

  // sselect slot
  slotSelectedFreeReview(freeReviewModel: TemplateRef<any>, css: appointmentSlotNew, pastAppData) {
    this.csNew = css;
    this.currentAppointmentData = pastAppData;

    this.auth.getMarchantIdAnonymousforSourceApp().subscribe(t => {
      if (t.ResponceCode == "0" && t.Result != "" && t.Result != "No Slots Found") {
        this.marchantId = t.Result;
        this.getAllAppointments();

      } else {
        alert("Something went wrong");
      }
    })
    this.modalRef = this.modalService.show(freeReviewModel);
  }
  // submit the reason for review
  submitReasonForReview(r) {

    let categoryId = '';
    if (this.currentAppointmentData.Category == 'Email') {
      categoryId = '1';
    }
    else if (this.currentAppointmentData.Category == 'Video') {
      categoryId = '2';
    }
    else if (this.currentAppointmentData.Category == 'Voice') {
      categoryId = '3';
    }
    if (categoryId == '1') {

      let today = new Date();
      let time = today.getHours() + ":" + today.getMinutes();
      let date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
      this.freeReviewSubmittedData = {
        authenticationTicket: this.auth.getSessionToken().OnlineConsultToken,
        doctorId: this.currentAppointmentData.DoctorId,
        patientId: this.auth.getSessionToken().AskApolloReferenceIdForSelf,
        relationId: '0',
        createdDate: this._datePipe.transform(this.now, 'yyyy-MM-dd HH:mm:SS.SSS'),
        amount: '0',
        marchantId: this.marchantId,
        locationId: this.docDetailsRes.LocationId.toString(),
        specialityId: this.docDetailsRes.SpecialityId.toString(),
        hospitalId: this.docDetailsRes.HospitalId.toString(),
        consultationTypeId: this.docDetailsRes.consultationType == 'Specialist' ? '2' : '3',
        categoryId: categoryId,
        appointmentDate: date,
        appointmentTime: time,
        reviewReferenceVisitId: this.currentAppointmentData.VisitId.toString(),
        edocDoctorId: this.currentAppointmentData.EdocDoctorId.toString(),
        CurrencyFormat: 'INR',
        TimeZone: '+05:30',
        ReviewRemarks: r.value.reasonReview,
        pgId: '101',
        sourceApp: c.OCSourceApp
      };

    }
    else {

      this.freeReviewSubmittedData = {
        authenticationTicket: this.auth.getSessionToken().OnlineConsultToken,
        doctorId: this.currentAppointmentData.DoctorId,
        patientId: this.auth.getSessionToken().AskApolloReferenceIdForSelf,
        relationId: '0',
        createdDate: this._datePipe.transform(this.now, 'yyyy-MM-dd HH:mm:SS.SSS'),
        amount: '0',
        marchantId: this.marchantId,
        locationId: this.docDetailsRes.LocationId.toString(),
        specialityId: this.docDetailsRes.SpecialityId.toString(),
        hospitalId: this.docDetailsRes.HospitalId.toString(),
        consultationTypeId: this.docDetailsRes.consultationType == 'Specialist' ? '2' : '3',
        categoryId: categoryId,
        appointmentDate: this.selectedDate.replace('/', '-').replace('/', '-').replace('/', '-'),
        appointmentTime: this.csNew.SlotTime,
        reviewReferenceVisitId: this.currentAppointmentData.VisitId.toString(),
        edocDoctorId: this.currentAppointmentData.EdocDoctorId.toString(),
        CurrencyFormat: 'INR',
        TimeZone: '+05:30',
        ReviewRemarks: r.value.reasonReview,
        pgId: '101',
        sourceApp: c.OCSourceApp
      };

    }
    console.log(this.freeReviewSubmittedData);

    this.spinnerService.show();
    r.reset();
    this.modalRef.hide();
    this.us.submitFreeReview(this.freeReviewSubmittedData).subscribe(res => {
      this.spinnerService.hide();
      this.response = res;

      if (this.response.ResponceCode == 0) {
        this.getAllAppointments();
        alert("Your appointment has been confirmed");
      }
      else {
        alert('Something went wrong');
      }
    }, err => {
      this.spinnerService.hide();
      alert('Something went wrong');
      console.log(err);
    });
  }



  toggleCalendarFreeReview() {
    if (!this.dpopenFreeReview) {
      this.openDPfreeReview();
    }
    else {
      this.hideDPfreeReview();
    }
  }

  hideDPfreeReview() {
    this.activateCalendarFreeReview = false;
    //this.datepickerFreeReview.hide();
    this.dpopenFreeReview = false;
  }

  openDPfreeReview() {
    this.activateCalendarFreeReview = true;
    //this.datepickerFreeReview.show();
    this.dpopenFreeReview = true;
  }

  onDatePickedFreeReview(sd: string) {
    let fsd = moment(sd).format('DD/MM/YYYY');
    if (this.activateCalendarFreeReview) {
      this.selectedDate = fsd;
      this.datePickedFromCalendar = this.utilsService.getDateStringsForAppointmentDisplay(fsd);
      this.pickedFromCalendar = true;
      this.cd.detectChanges();
      this.getSlotsDateFreeReview(this.datePickedFromCalendar.fullDate, false, true);
    }
  }

  //------------------------------ Free Review code ends ---------------------------------------------------
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
  /*
  *  Upload reports
  */
  reportUpload(event, up) {
    this.selectedFile = <File>event.target.files[0];
    const fd = new FormData();
    fd.append('file', this.selectedFile, this.selectedFile.name);

    var patientId = this.auth.getSessionToken().AskApolloReferenceIdForSelf;     // "3F792F4E-93E9-4447-9427-52F5D8737297";
    var reportName = this.selectedFile.name;
    var fieldDescription = this.selectedFile.name;
    var fileFormat = this.selectedFile.type;
    var visitId = up.VisitId.toString();  // "1199";
    var uploadedDate = moment().format('DD-MM-YYYY');
    var Uploadurl = '';
    var token = this.auth.getSessionToken().OnlineConsultToken;

    let params = 'patientId=' + patientId + '&reportName=' + reportName + '&fieldDescription=' + fieldDescription + '&filename=' + this.selectedFile.name + '&fileFormat=' + fileFormat + '&visitId=' + visitId + '&uploadedDate=' + uploadedDate + '&Token=' + token + '&FileSize=' + this.selectedFile.size.toString();

    let file_size = ((this.selectedFile.size) / 1024 / 1024).toFixed();
    let file_ext = this.selectedFile.name.split('.').pop();

    var allowedExtensions = ['pdf', 'PDF', 'jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'];

    if (allowedExtensions.indexOf(file_ext) <= -1) {
      alert('Upload images or pdf files');
      return false;
    }
    else if (file_size < '30') {
      this.spinnerService.show();
      this.us.submitUploadReports(fd, params)
        .subscribe(res => {
          this.spinnerService.hide();
          this.response = res;
          if (this.response.Status == 1) {
            alert("File Uploaded Successfully");
          }
          else {
            alert(this.response.ErrorMessage);
          }
        }, err => {
          this.spinnerService.hide();
          alert('Something went wrong');
          console.log(err);
        });
    }
    else {
      alert('File is too Large');
      return false;
    }
  }

  /*
  * View casesheet
  */
  viewCaseSheet(appData) {
    debugger;
    this.us.setAppointmentDetails(appData);
    localStorage.setItem("dataForPris", JSON.stringify(appData));
    if (c.onlineCasesheetType == 'new') {
      if (appData.CaseSheetVersion != null)
        this.router.navigate(['/my/casesheetview']);
      else
        this.router.navigate(['/my/viewcasesheet']);
    }
    else {
      this.router.navigate(['/my/viewcasesheet']);
    }
  }
  /*
  * View prescription
  */
  viewPrescription(past) {

    localStorage.setItem("dataForPris", JSON.stringify(past));
    this.us.setVisitId(past.VisitId);
    this.router.navigate(['/my/viewprescription']);
  }
}
