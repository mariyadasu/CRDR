import { HttpClient } from '@angular/common/http';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import {
  Router, Params, UrlTree, UrlSegmentGroup, UrlSegment,
  NavigationEnd, PRIMARY_OUTLET, ActivatedRoute
} from '@angular/router';
import { Location } from '@angular/common';

import { constants as c } from './../../constants';
import * as moment from 'moment';

import { BookingService } from '@aa/services/booking.service';
import { UserService } from '@aa/services/user.service';
import { currentAppointment } from '@aa/structures/calendar.tracker.interface';
import { HospitalLatLong } from '@aa/structures/user.interface';
import { Jsonp } from '@angular/http';
import { AAAuthService } from '@aa/services/auth.service';

@Component({
  selector: 'app-appointment-info',
  templateUrl: './appointment-info.component.html',
  styleUrls: ['./appointment-info.component.scss']
})


export class AppointmentInfoComponent implements OnInit, AfterViewInit {

  completionLevel;
  ca: currentAppointment;
  dll: HospitalLatLong; //Get Hospital Latitude and Longitude
  ds: string; // Date String that will allow us to override the use of datepipe, which breaks IE
  latlong: string; //Displaying value as a link 
  LeadOrAppointment = 'Appointment';

  referrer: string;

  broad: boolean = false; // Used to change the width of the component as needed

  constructor(
    private aaa: AAAuthService,
    private userService: UserService,
    private bs: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private hc: HttpClient) { }

  ngOnInit() {
    this.completionLevel = this.bs.BOOKING_STATUS_PATIENT_DETAILS_OK;
    this.bs.bookingStatusTracker.subscribe(
      (currentStatus: number) => {
        this.completionLevel = currentStatus;
        if (currentStatus == this.bs.BOOKING_STATUS_OTP_VERIFIED_COMPLETED_OK) {
          this.broad = true;
        }
      }
    );

    //this.ca = this.bs.getAppointmentSlot();
    this.ca = JSON.parse(localStorage.getItem("slotDetails"));
    this.ds = moment(this.ca.date, "DD/MM/YYYY").format('MMMM D, YYYY');
    //Getting Hospital latitude and longitude based on Hospital Name -- Added by Saravana
    this.userService.GetHospitalInformationOnHospitalName(this.ca.docHospital.split(' ').join('-'))
      .subscribe(
        (data: HospitalLatLong) => {
          this.dll = data;
          this.latlong = this.dll.Latitude + "," + this.dll.Longitude;
        }
      ), err => {
        alert(err);
      };


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
      }
    );
  }

  ngAfterViewInit() {
    if (this.completionLevel == 2) {
      document.getElementById('mh').scrollIntoView();
    }
  }

  goBackToSearch() {
    //debugger;
    let redirectUri=localStorage.getItem('dcRedirectUrl');
    if(redirectUri==''){
      this.router.navigate([this.bs.prevURL]);
    }else{
      //this.router.navigate([redirectUri]);
      window.location.href=this.aaa.getWebsiteForRedirect() +redirectUri;
    }
  }
}
