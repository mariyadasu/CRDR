import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Subscription } from 'rxjs/Subscription';

import { BookingService } from '@aa/services/booking.service';

import { patientInfo } from '@aa/structures/calendar.tracker.interface';
import { AAAuthService } from '@aa/services/auth.service';

@Component({
  selector: 'app-verify-mobile',
  templateUrl: './verify-mobile.component.html',
  styleUrls: ['./verify-mobile.component.scss']
})
export class VerifyMobileComponent implements OnInit {

  sendOTPEnabled = true;
  sendOTPButtonText = 'Submit OTP';
  
  resendOTPEnabled = true;
  resendOTPButtonText = 'Resend OTP';
  
  bookingStatusTrackerSub: Subscription;
  verifyErrorTrackerSub: Subscription;

  pi: patientInfo;
  verifyErrorMsg = '';
  constructor(private bs: BookingService,
    private aaa: AAAuthService
   ) { }

  ngOnInit() {
    this.pi = this.bs.getPatientInfo();

    this.bookingStatusTrackerSub = this.bs.bookingStatusTracker.subscribe(
      (status: number) => {
        if(status = this.bs.BOOKING_STATUS_OTP_GENERATED) {
          this.resendOTPEnabled = true;
          this.resendOTPButtonText = 'Resend OTP';
        } else if (status = this.bs.BOOKING_STATUS_OTP_VERIFIED_COMPLETED_OK) {
          this.sendOTPEnabled = true;
          this.sendOTPButtonText = 'Submit OTP';
        }
      }
    )

    this.verifyErrorTrackerSub = this.bs.bookingErrorTracker.subscribe(
      (errInfo: {failStatus: number, failMessage: string}) => {
        if(errInfo.failStatus = this.bs.BOOKING_STATUS_OTP_VERIFICATION_FAILED) {
          this.verifyErrorMsg = errInfo.failMessage;
          this.sendOTPEnabled = true;
          this.sendOTPButtonText = 'Submit OTP';
        }
      }
    );
  }

  verifyOTP(f: NgForm) {
    this.aaa.loadingShow('loadingid');
    this.sendOTPEnabled = false;
    this.sendOTPButtonText = 'Verifying OTP ...';

    this.bs.verifyOTP(f.value.otp);
  }

  resendOTP() {
    this.resendOTPEnabled = false;
    this.resendOTPButtonText = 'Resending OTP ...';

    this.bs.sendOTP();
  }

}
