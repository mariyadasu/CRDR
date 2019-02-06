import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { AuthService } from "angular2-social-login";

import { AAAuthService } from '@aa/services/auth.service';

@Component({
  	selector: 'app-signup-health-library',
  	templateUrl: './signup.component.html',
  	styleUrls: ['./signup.component.scss']
})
export class SignupHealthLibraryComponent implements OnInit, OnDestroy {

  	signupStatus = 1;
  	signupStatusSubscription: Subscription;

  	constructor(
    	private cd: ChangeDetectorRef,
    	public _auth: AuthService, // Third party module to handle Social Logins
    	public aaa: AAAuthService, // Our module to service various auth needs
    	public modalRef: BsModalRef)
  	{ 

  	}

  	ngOnInit()
  	{ 
		this.signupStatusSubscription = this.aaa.signupStatusTracker.subscribe(
      		(status: number) => {
        		this.signupStatus = status;
        		this.cd.detectChanges(); // Inform Angular that the view needs to be updated
      		}
    	)
  	}
  	ngOnDestroy()
  	{
    	this.signupStatusSubscription.unsubscribe();
  	}

















  

  signIn(provider){
    this._auth.login(provider).subscribe(
      (data) => {
        // console.log(data);
      }
    )
  }
 
  logout(){
    this._auth.logout().subscribe(
      (data) => {
        // console.log(data);
      } 
    );
  }

  signUp(f: NgForm) {
    // console.log(f.value);
  }

  skipSocialToBookAppointment() {
    this.signupStatus = this.aaa.SIGNUP_STATUS_SHOW_MOBILE_OTP;
    this.aaa.setBookingParams(this.aaa.BOOKING_PARAMS_NS_NU);
  }

}

