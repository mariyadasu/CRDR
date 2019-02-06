import { Component, OnInit } from '@angular/core';
import { UserInfo,AlexaSourceResponse } from '@aa/structures/user.interface';
import { AuthService } from "angular2-social-login";
import { AAAuthService } from '@aa/services/auth.service';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { Observable } from 'rxjs/Observable';
import { constants as c } from './../constants';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { Router, ActivatedRoute } from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { NgForm } from '@angular/forms';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

@Component({
  	selector: 'app-alexa-login',
  	templateUrl: './alexa-login.component.html',
  	styleUrls: ['./alexa-login.component.scss']
})
export class AlexaLoginComponent implements OnInit {
	  sub: Subscription;

    signupStatus = 1;
    ui = {} as UserInfo;
    bsConfig: Partial<BsDatepickerConfig>;
    loginPhone: string;
    response:any;
    alexaSourceData: AlexaSourceResponse = {} as AlexaSourceResponse;

    socialData:{};
    maxDate: Date;
    public now: Date = new Date();
    day:any;
    month:any;
    year:any;
    app_state:string;
    maxDateNew=new Date();
  	constructor(private _auth: AuthService, 
    public aaa: AAAuthService,
    private router: Router,
    private spinnerService: Ng4LoadingSpinnerService,
    private route: ActivatedRoute,
    private bsLocaleService: BsLocaleService) 
    {
      this.bsLocaleService.use('en-gb');
    }

  	ngOnInit() 
  	{
      this.bsConfig = Object.assign({}, { containerClass: 'theme-orange', dateInputFormat: 'DD/MM/YYYY' });
      // future dates disabling
      this.maxDate = new Date();
      this.maxDate.setDate(this.maxDate.getDate() - 1);

      this.app_state = this.route.snapshot.queryParamMap.get('state');
  	}
  	signIn(provider)
  	{
  		let nameSlice: string[];
    	
      this.sub = this._auth.login(provider).subscribe(
      	(data: any) => {
          this.socialData = data;
      
          if(data.name != '') 
          {
          	nameSlice = data.name.split(" ");
          	this.ui.firstName = (nameSlice.slice(0, nameSlice.length - 1)).join(" ");
          	this.ui.lastName = nameSlice.length > 1 ? nameSlice[nameSlice.length - 1] : '';
         	} 
         	else 
         	{
         		this.ui.firstName = '';
         		this.ui.lastName = '';
        	}

        	this.ui.SocialLoginId = data.uid;
          this.ui.SocialLoginType = provider == 'google'? 'G' : 'F';
              
          // verifing the email is comming from socila login or not 
          if(data.email) 
          {
           	this.ui.email = data.email;
          	this.ui.IsEmailVerified = "1";
          	this.aaa.processAlexaSocialLogin(data,this.ui).subscribe(
      				(res: any) => {
                this.response = res;
                if(this.response.ResponceCode =='0') //  Response success
                {
                  this.alexaSourceData = JSON.parse(this.response.Result);
                  if(this.alexaSourceData.Token) // alexa true -- start
                  {
                    if(this.alexaSourceData.PhoneNumberVerified)
                    {
                      let url_params = 'state='+this.app_state+'&access_token='+this.response.Result+'&token_type=Bearer';
                      //window.open(c.AlexaRedirectUrl+url_params,'_blank');
                      const a = document.createElement("a");
                      a.href = c.AlexaRedirectUrl+url_params;
                      a.target = "_blank";
                      a.rel = "noopener";
                      a.click();
                    }
                    else
                    {
                      this.signupStatus = 2;
                    }
                  } // alexa true -- end
                  else // alexa false
                  {
                    this.signupStatus = 2;
                  } // alexa false -- end 
                }
                else
                {
                  this.signupStatus = 2;
                }
              },
      				(error: any) => {
                alert('Internal server error');
      	      }
      			);
          } 
          else 
          {
            alert('EmailId not found. Please try again');
            this.signupStatus = 1;
        	}
  			},
  			(err:any) => {
          alert('Internal server error');
  			}
    	);
  	}

    // save user details
    saveUserDetails(f: NgForm)
    {
      this.ui.gender = f.value.gender;
      this.ui.mobileNumber = f.value.mobileNumber;
      this.loginPhone = this.ui.mobileNumber;

      var d = new Date(f.value.dob);
      this.month = '' + (d.getMonth() + 1);
      this.day = '' + d.getDate();
      this.year = d.getFullYear();

      if (this.month.length < 2) this.month = '0' + this.month;
      if (this.day.length < 2) this.day = '0' + this.day;

      this.ui.dateofBirth = [this.month, this.day, this.year].join('/');
      this.spinnerService.show();
      this.aaa.processPhoneNumberAlexa(this.ui).subscribe(
        (res: any) => {
          this.spinnerService.hide();
          if (res.status == 'success') 
          {
            this.signupStatus = 3;
          } 
          else
          {
            alert('OTP not yet sent. Please try again');
            this.signupStatus = 1;
          }
        },
        (err:any) => {
          this.spinnerService.hide();
          alert('Internal server error');
        }
      );
    }

    verifyOTP(f: NgForm)
    {
      this.spinnerService.show();
      this.aaa.updateAlexa(this.ui, f.value.otp).subscribe(
        (data: any) => {
          this.spinnerService.hide();
          this.response = data;
                
          if(this.response.ResponceCode =='0') //  Response success
          {
            this.signupStatus = 1;
            this.alexaSourceData = JSON.parse(this.response.Result);
            let url_params = 'state='+this.app_state+'&access_token='+this.response.Result+'&token_type=Bearer';
            //window.open(c.AlexaRedirectUrl+url_params,'_blank');
            const a = document.createElement("a");
            a.href = c.AlexaRedirectUrl+url_params;
            a.target = "_blank";
            a.rel = "noopener";
            a.click();
          }
          else if(this.response.ResponceCode =='15')
          {
            alert('OTP verification failed.');
          }
          else 
          {
            alert('Internal server error. Please try again.');
          }
        },
        (err:any) => {
          this.spinnerService.hide();
          alert('Internal server error');
        });
    }

    resendOTP() 
    {
      this.aaa.processPhoneNumberAlexa(this.ui).subscribe(
        (res: any) => {
          this.spinnerService.hide();
          if (res.status == 'success') 
          {
            alert('OTP sent');
          } 
          else
          {
            alert('OTP not yet sent. Please try again');
          }
        },
        (err:any) => {
          this.spinnerService.hide();
          alert('Internal server error');
        }
      );
    }

    ngOnDestroy() 
    {
      if(this.sub != null) this.sub.unsubscribe();
    }
}
