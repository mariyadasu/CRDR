import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AAAuthService } from './../../services/auth.service';
import { UserService } from '@aa/services/user.service';
import { constants as c } from './../../constants';
import { UserInfo, aaToken, OCUserInfo } from '@aa/structures/user.interface';
import { Subscription } from 'rxjs/Subscription';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { UtilsService } from '@aa/services/utils.service';

@Component({
	selector: 'app-user-side-nav',
	templateUrl: './user-side-nav.component.html',
	styleUrls: ['./user-side-nav.component.scss']
})
export class UserSideNavComponent implements OnInit {
	ocUserInfo: OCUserInfo = {} as OCUserInfo;
	wallet:any={
		walletPoints:"0",
		walletSlab:"Nun",
		Benefits:"nill"	};
		userInfo:any;
	public errorMessage: string = '';
	imageData: any;
	url: any;
	res : any;
	ocUserSubscription = new Subscription;
	imageUrl:String='';
	constructor(
		private aaa: AAAuthService,
		private userService: UserService,
		private router: Router,
		private spinnerService: Ng4LoadingSpinnerService,
		private us:UtilsService
	) { }

	ngOnInit() 
	{
		// get the user data -- start
		
		this.userInfo = this.aaa.getuserInfo();
		  this.userService.getOCUserDetails();
		  //this.imageUrl=this.aaa.getImage();
		  this.spinnerService.show();
		  this.getWalletForLms();
  		this.ocUserSubscription = this.userService.ocUserTracker.subscribe(
        	(data) => {
        		this.res = data;
        		if(this.res.ResponceCode == 6) 
        		{
					alert('Your session has expired. You are now being redirected to the home page.');
					this.aaa.logoutUser();
				}
				this.spinnerService.hide();
				if(this.res.ResponceCode == 0) 
        		{
					this.ocUserInfo = JSON.parse(this.res.Result)[0];
				
					if (this.ocUserInfo.Photocontent) 
					{
						this.imageData = 'data:image/jpg;base64,' + this.ocUserInfo.Photocontent;
						this.imageUrl = this.imageData;
					}
					else 
					{
						this.imageUrl = 'assets/dummy-user.jpg';
					}
				}
				else
				{
				
					//alert('Unable to get the user details.');
				}
				
          		
        	},(err) => {
				this.spinnerService.hide();
          		console.log(err);
        	}
      	);

	    // get the user data  -- end
		  
		
	}
	walletFlag:string=c.wallet;
	getWalletForLms() {
		this.spinnerService.show();
        if (this.walletFlag == "lms") {
            this.aaa.getWalletPointsForlms(this.userInfo.email).subscribe(data => {
				this.spinnerService.hide();
                if (data.ResponceCode === "1") {
                    this.lmsRegistration();
                }
                else {
					
                    let walletRes = data.Result.split("-");
					this.wallet.walletPoints= Math.floor(walletRes[0])
					this.wallet.walletSlab=walletRes[2];
					this.wallet.Benefits=walletRes[3];
                }

            });
        }
	}
	
	   // LMS Registration
		lmsRegistration() {
			if (this.walletFlag == "lms") {
				let perams = {
					"patientID": this.userInfo.AskApolloReferenceIdForSelf,
					"FirstName": this.userInfo.firstName,
					"LastName": this.userInfo.lastName,
					"registration_date": this.us.setDate(),
					"Mobile": this.userInfo.mobileNumber,
					"Email": this.userInfo.email,
					"Gender": (this.userInfo.gender.toString() == "1" ? "male" : (this.userInfo.gender == "2"?"female":"others")),
					"DOB": this.userInfo.dateofBirth
				}
	
				this.aaa.getRegisterForlms(perams).subscribe(data => {
					if (data.ResponceCode == "0") {
						
					}
				
				})
			}
	
		}

	
  	logout() 
  	{
    	this.aaa.logoutUserSideNav();
    	location.href = '/';
  	}

	ngOnDestroy() 
    {
      //this.ocUserSubscription.unsubscribe();
    }

}
