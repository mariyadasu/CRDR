import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as moment from 'moment';

import { BookingService } from '@aa/services/booking.service';
import { AAAuthService } from '@aa/services/auth.service';

import { currentAppointment } from '@aa/structures/calendar.tracker.interface';

@Component({
  selector: 'app-confirm-request',
  templateUrl: './confirm-request.component.html',
  styleUrls: ['./confirm-request.component.scss']
})
export class ConfirmRequestComponent implements OnInit {

  isLead = true;
  bookingId = '';

  enableManageAppointment = false;
  showUHIDRegistration = false;

  ca: currentAppointment;
  ds: string;

  constructor(
    private aaa: AAAuthService,
    public bs: BookingService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.aaa.loadingHide('loadingid');
    this.bookingId = this.bs.appointmentId;
    this.ca = this.bs.getAppointmentSlot();
    this.ds = moment(this.ca.date, "DD/MM/YYYY").format('MMMM D, YYYY');

    this.enableManageAppointment = this.aaa.getBookingParams() == this.aaa.BOOKING_PARAMS_NS_NU || this.aaa.getBookingParams() == this.aaa.BOOKING_PARAMS_NS_U;
    this.showUHIDRegistration = this.aaa.getBookingParams() == this.aaa.BOOKING_PARAMS_S_NU;

    this.route.queryParams.subscribe(
      (params) => {
        this.isLead = +params['isLead'] == 0 ? false : true;
      }
    )
  }

}
