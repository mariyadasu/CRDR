import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Router, UrlTree, UrlSegmentGroup, UrlSegment,
  NavigationEnd, PRIMARY_OUTLET, ActivatedRoute
} from '@angular/router';
import { Location } from '@angular/common';

import { Subscription } from 'rxjs';
import * as moment from 'moment';

import { constants as c } from '../constants';

import { AAAuthService } from '@aa/services/auth.service';
import { BookingService } from '@aa/services/booking.service';

import { currentAppointment } from '@aa/structures/calendar.tracker.interface';

@Component({
  selector: 'app-book-appointment',
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.scss']
})
export class BookAppointmentComponent implements OnInit, OnDestroy {

  completionLevel = 0;
  ca: currentAppointment;
  ds: string; // Date String that will allow us to override the use of datepipe, which breaks IE
  LeadOrAppointment = 'Appointment';

  bookingPrams: number;
  bookingParamsTrackerSub: Subscription;
  isPrintAppointmentDisplay:boolean = true;

  constructor(
    public aaa: AAAuthService,
    private bs: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private hc: HttpClient
  ) { }

  ngOnInit() {

    this.bookingPrams = this.aaa.getBookingParams();
    this.bookingParamsTrackerSub = this.aaa.bookingParamsTracker.subscribe(
      (bp: number) => {
        this.bookingPrams = bp;
        console.log(this.bookingPrams);
      }
    );

    this.completionLevel = this.bs.BOOKING_STATUS_PATIENT_DETAILS_OK;
    this.bs.bookingStatusTracker.subscribe(
      (currentStatus: number) => {
        this.completionLevel = currentStatus;
        this.bookingPrams = this.aaa.bookingParams;
      }
    );

    //this.ca = this.bs.getAppointmentSlot();
    //debugger;
    this.ca=JSON.parse(localStorage.getItem("slotDetails"));
    this.ds = moment(this.ca.date, "DD/MM/YYYY").format('MMMM D, YYYY');

    // When coming into this page, scroll to the top of the page
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        if (this.completionLevel == 2) {
          document.getElementById('mh').scrollIntoView();
        }
      }
    });

    this.route.queryParams.subscribe(
      (params) => {
        this.LeadOrAppointment = +params['isLead'] == 0 ? 'Appointment' : 'Request';
        if(params['isLead'] == 0)
        {
          this.isPrintAppointmentDisplay = true;
        }
        else
        {
          this.isPrintAppointmentDisplay = false;
        }
      }
    );
  }

  printIPR() {
    let api = c.Apiurl + 'GetPrintIPRFormV4/' + this.bs.appointmentId + '/' + c.EdocAthenticationKey;
    this.hc.get(api).subscribe(
      (data: string) => {
        var myWindow = window.open("", "print IPR", "width=600,height=600");
        myWindow.document.write(data);
      }
    );
  }

  saveIPR() {
    let api = c.Apiurl + 'GetPrintPdfIPRFormV4/' + this.bs.appointmentId + '/'+ c.EdocAthenticationKey;
    this.hc.get(api).subscribe(
      data => console.log(data)
    );
  }

  printAppointmentConfirmation() {
    let api = c.Apiurl + 'GetPrintAppointmentSummaryV4/' + this.bs.appointmentId + '/'+ c.EdocAthenticationKey;
    this.hc.get(api).subscribe(
      (data: string) => {
        var myWindow = window.open("", "printAppointmentConfirmation", "width=600,height=600");
        myWindow.document.write(data);
      }
    );
  }

  saveAppointmentConfirmation() {
    let api = c.Apiurl + 'GetPrintPdfAppointmentSummaryV4/' + this.bs.appointmentId + '/'+ c.EdocAthenticationKey;
    this.hc.get(api).subscribe(
      data => console.log(data)
    );
  }

  goBackToSearch() {
    this.router.navigate([this.bs.prevURL]);
  }

  ngOnDestroy() {
    if(this.bookingParamsTrackerSub) {
      this.bookingParamsTrackerSub.unsubscribe();
    }
  }
}
