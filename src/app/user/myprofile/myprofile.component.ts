import { Component, OnInit } from '@angular/core';
import { AAAuthService } from '@aa/services/auth.service';
import { UserService } from '@aa/services/user.service';
import { CommonService } from '@aa/services/common.service';
import { UserInfo, aaToken, OCUserInfo } from '@aa/structures/user.interface';
import { country } from '@aa/structures/country.interface';
import { state } from '@aa/structures/state.interface';
import { city, occity } from '@aa/structures/city.interface';

import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';

import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { Subject } from 'rxjs/Subject';
import { FormBuilder, FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { ValidationManager } from "ng2-validation-manager";

import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { DatePipe } from '@angular/common';
import { constants as c } from './../../constants';
import { Subscription } from 'rxjs/Subscription';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { UtilsService } from '@aa/services/utils.service';
@Component({
	selector: 'app-myprofile',
	templateUrl: './myprofile.component.html',
	styleUrls: ['./myprofile.component.scss'],
	providers: [DatePipe]
})
export class MyprofileComponent implements OnInit {
	walletFlag:string=c.wallet;
	DEFAULT_COUNTRY_NAME = 'Select Country';
	DEFAULT_STATE_NAME = 'Select State';
	DEFAULT_CITY_NAME = 'Select City';
	countries: country[] = [];
	selectedCountry: country;
	conutryresponse: any;
	states: state[] = [];
	selectedState: state;
	statesresponse: any;
	cities: occity[] = [];
	selectedCity: occity;
	cityresponse: any;
	response: any;
	myProfileForm;
	selectedcountry: country;
	userInfo: UserInfo = {} as UserInfo;
	ocUserInfo: OCUserInfo = {} as OCUserInfo;
	wallet:any={
		walletPoints:"0",
		walletSlab:"Nun",
		Benefits:"nill"	};
	ocUserSubscription = new Subscription;
	public errorMessage: string = '';

	private base64textString: String = "";

	countryName: string;
	public show: boolean = false;
	countryCode: string;
	countryId: string;
	stateId: string;
	state: string;
	cityId: string;
	city: string;
	imageData: any;
	bloodGroup: string;
	code:any[];
	day: any;
	month: any;
	year: any;
	age: any;
	public now: Date = new Date();
	res: any;
	maxDate=new Date();
	constructor(private userService: UserService,
		private us:UtilsService,
		private auth: AAAuthService,
		private frmbuilder: FormBuilder,
		private cs: CommonService,
		private spinnerService: Ng4LoadingSpinnerService,
		private _datePipe: DatePipe,
		private router: Router,
		private bsLocaleService: BsLocaleService) {
		this.bsLocaleService.use('en-gb');
		this.selectedCountry = { CountryId: -1, CountryName: this.DEFAULT_COUNTRY_NAME };
		this.selectedState = { StateId: -1, StateName: this.DEFAULT_STATE_NAME };
		this.selectedCity = { CityId: -1, CityName: this.DEFAULT_CITY_NAME };

		this.myProfileForm = new ValidationManager({
			'countryCode': '',
			'countryId': 'required',
			'stateId': 'required',
			'state': 'required',
			'cityId': 'required',
			'city': 'required',
			'zipCode': 'required|number',

			'address': '',
			'phoneNo': 'required|minLength:10|maxLength:10|number',
			'altPhoneNo': '|minLength:10|maxLength:10|number',
			'age': '',
			'gender': 'required',


			'firstName': 'required',
			'emailId': 'required',

			'MMUhid': '',
			'MobileOTP': '',
			'dob': '',
			'createdDate': '',
			'imageName': '',
			'filename': '',
			'fileext': '',
			'filecontent': '',
			'patientId': '',
			'bloodGroup': ''

		});
		this.myProfileForm.setErrorMessage('countryId', 'required', 'Country is required');
		this.myProfileForm.setErrorMessage('stateId', 'required', 'State is required');
		this.myProfileForm.setErrorMessage('cityId', 'required', 'City is required');

		this.myProfileForm.setErrorMessage('phoneNo', 'required', 'Mobile No is required');
		this.myProfileForm.setErrorMessage('phoneNo', 'minLength', 'Mobile No is invalid');
		this.myProfileForm.setErrorMessage('phoneNo', 'maxLength', 'Mobile No is invalid');
		this.myProfileForm.setErrorMessage('phoneNo', 'number', 'Mobile No is invalid');

		this.myProfileForm.setErrorMessage('altPhoneNo', 'minLength', 'Aleternate Mobile no is invalid');
		this.myProfileForm.setErrorMessage('altPhoneNo', 'maxLength', 'Aleternate Mobile no is invalid');
		this.myProfileForm.setErrorMessage('altPhoneNo', 'number', 'Aleternate Mobile no is invalid');
	}

	ngOnInit() {
		// this.auth.getCountryCodeForRegistration().subscribe(data=>{
		// this.code=JSON.parse(data);
		// console.log(this.code)
		// })
		this.auth.checkPendingCaseSheet();
		this.cs.GetCountries().subscribe(res => {
			this.conutryresponse = res;
			this.countries = JSON.parse(this.conutryresponse.Result);
		});
		// get the user data -- start
		this.userInfo = this.auth.getuserInfo();
		this.userService.getOCUserDetails();

		this.spinnerService.show();
		this.getWalletForLms();
		this.ocUserSubscription = this.userService.ocUserTracker.subscribe(
			(data) => {
				//this.spinnerService.hide();
				this.res = data;
				this.spinnerService.hide();
				if (this.res.ResponceCode == 6) {
					alert('Your session has expired. You are now being redirected to the home page.');
					this.auth.logoutUser();
				}
				else {
					if (this.res.ResponceCode == 0) {
						this.ocUserInfo = JSON.parse(this.res.Result)[0];
						// set the form data if exist -- start
						this.countryCode = this.ocUserInfo.CountryCode;
						this.myProfileForm.setValue({
							'countryCode': this.ocUserInfo.CountryCode,
							'countryId': this.ocUserInfo.CountryId,
							'zipCode': this.ocUserInfo.Pin,
							'address': this.ocUserInfo.Adddress,

							'phoneNo': this.ocUserInfo.Mobileno,
							'altPhoneNo': this.ocUserInfo.AlternateNumber,
							'dob': this._datePipe.transform(this.ocUserInfo.DOB, 'dd/MM/yyy'),
							'firstName': this.ocUserInfo.FirstName,
							'emailId': this.ocUserInfo.EmailId,
							'MMUhid': this.ocUserInfo.MMUhid,
							//'gender':this.ocUserInfo.Gender,
							'imageName': this.ocUserInfo.ImageName,
							'filename': this.ocUserInfo.ImageName,
							'fileext': this.ocUserInfo.PhotoExt,
							'filecontent': this.ocUserInfo.Photocontent,
							'patientId': this.ocUserInfo.PatientId,
							'bloodGroup': this.ocUserInfo.BloodGroup,


						});
						this.bloodGroup = this.ocUserInfo.BloodGroup;
						// dob manipulation  (date is comming in this format '/Date(723666600000)/' )-- start

						/* var str = this.ocUserInfo.DOB;
						   var res = str.substring(1, 21);
						   let a = res.replace('Date','');
						   let b = a.replace('(','');
						   let c = b.replace(')','');
						   var dob = c.replace('/','');
					   
						   var d = new Date(parseInt(dob));
						   dob = d.toLocaleString()
						   dob = dob.substring(0, 10);
						   this.myProfileForm.setValue('dob', dob);*/

						// dob manipulation -- end



						if (this.ocUserInfo.Photocontent != '') {
							this.imageData = 'data:image/jpg;base64,' + this.ocUserInfo.Photocontent;
							this.url = this.imageData;
						}
						if (this.ocUserInfo.CountryId != 0) {
							this.selectedCountry = { CountryId: this.ocUserInfo.CountryId, CountryName: this.ocUserInfo.CountryName };
							this.myProfileForm.setValue({ 'countryId': this.ocUserInfo.CountryId });
						}
						else {
							this.myProfileForm.setValue({ 'countryId': '' });
						}
						if (this.ocUserInfo.StateId != 0) {
							this.selectedState = { StateId: this.ocUserInfo.StateId, StateName: this.ocUserInfo.State };

							this.myProfileForm.setValue({
								'stateId': this.ocUserInfo.StateId,
								'state': this.ocUserInfo.State,
							});


							this.cs.GetStatesByCountry(this.ocUserInfo.CountryId).subscribe(res => {
								this.statesresponse = res;
								this.states = JSON.parse(this.statesresponse.Result);
							});
						}
						else {
							this.myProfileForm.setValue({
								'stateId': '',
								'state': this.DEFAULT_STATE_NAME,
							});
						}
						if (this.ocUserInfo.CityId != 0) {
							this.selectedCity = { CityId: this.ocUserInfo.CityId, CityName: this.ocUserInfo.City };
							this.myProfileForm.setValue({
								'cityId': this.ocUserInfo.CityId,
								'city': this.ocUserInfo.City,
							});
							this.cs.GetCitiesByState(this.ocUserInfo.StateId).subscribe(res => {
								this.cityresponse = res;

								this.cities = JSON.parse(this.cityresponse.Result);
							});
						}
						else {
							this.myProfileForm.setValue({
								'cityId': '',
								'city': this.DEFAULT_CITY_NAME,
							});
						}
						// Gender value setting
						if (this.ocUserInfo.Gender == 'Male' || this.ocUserInfo.Gender == 'M') {
							this.myProfileForm.setValue('gender', '1');
						}
						else if (this.ocUserInfo.Gender == 'FeMale' || this.ocUserInfo.Gender == 'F') {
							this.myProfileForm.setValue('gender', '2');
						}
						else if (this.ocUserInfo.Gender == 'Others' || this.ocUserInfo.Gender == 'O') {
							this.myProfileForm.setValue('gender', '3');
						}
						else {
							this.myProfileForm.setValue('gender', this.ocUserInfo.Gender.toString());
						}
						
					}
					else {
						alert('Unable to get the user details.');
						this.router.navigate(['/my/dashboard']);
					}
					
				}
				
				
				

			}, (err) => {
				this.spinnerService.hide();
			}
		);
		

		
		// get the user data  -- end
	}
	/*
	*	submit the form
	*/
	postMyProfile() {
		if (this.myProfileForm.isValid()) {
			var d = new Date(this.myProfileForm.getData().dob);
			this.month = '' + (d.getMonth() + 1);
			this.day = '' + d.getDate();
			this.year = d.getFullYear();

			if (this.month.length < 2) this.month = '0' + this.month;
			if (this.day.length < 2) this.day = '0' + this.day;

			this.myProfileForm.setValue({ 'dob': [this.month, this.day, this.year].join('/') });

			//this.myProfileForm.get('dob').setValue([this.month, this.day, this.year].join('/'));


			var today = new Date();
			var nowyear = today.getFullYear();
			var nowmonth = today.getMonth();
			var nowday = today.getDate();


			this.age = nowyear - this.year;
			var age_month = nowmonth - this.month;
			var age_day = nowday - this.day;

			this.age = parseInt(this.age);

			this.myProfileForm.setValue({ 'createdDate': this._datePipe.transform(this.now, 'yyyy-MM-dd HH:mm:SS.SSS') });
			this.myProfileForm.setValue({ 'age': this.age });

			if (this.show) {
				if (this.myProfileForm.getData().MobileOTP) {
					this.spinnerService.show();
					this.userService.updateUprofile(this.myProfileForm.getData())
						.subscribe(result => {
							this.res = result;
							this.spinnerService.hide();
							if (this.res.ResponceCode == '0') {
								this.userService.getOCUserDetails();
								this.show = false;
								this.myProfileForm.setValue({ 'MobileOTP': '' });
								alert('Updated successfully.');
							}
							else if (this.res.ResponceCode == '15') {
								alert('Invalid OTP');
							}
							else {
								alert('Something went wrong');
							}

						}, err => {
							this.spinnerService.hide();
							alert("something went wrong!");
						});
				}
				else {
					alert('Please enter OTP.');
				}
			}
			else {
				this.show = true;
				this.sendOTP(this.myProfileForm.getData().emailId, this.myProfileForm.getData().phoneNo);
			}

		}
		else {
			alert('Invalid form data');
		}


		//this.form.reset();
	}
	url :any;
	onSelectFile(event) {
		if (event.target.files && event.target.files[0]) {
			var ext = event.target.files[0].name.split('.').pop();
			let isValid = this.validateImage(event.target.files[0]);
			if (isValid) {
				this.myProfileForm.setValue('imageName', event.target.files[0].name);
				this.myProfileForm.setValue('filename', event.target.files[0].name);
				this.myProfileForm.setValue('fileext', ext);

				var reader = new FileReader();
				reader.readAsDataURL(event.target.files[0]); // read file as data url

				reader.onload = (event) => { // called once readAsDataURL is completed
					this.url = reader.result;
				}
				this.convertToBase64(event.target.files[0]);
			}
			else {
				alert('Upload Image and Max Upload size is 1MB only');
			}
		}
	}
	convertToBase64(e) {
		var reader = new FileReader();
		reader.onload = this._handleReaderLoaded.bind(this);
		reader.readAsBinaryString(e);
	}
	_handleReaderLoaded(readerEvt) {
		var binaryString = readerEvt.target.result;
		this.base64textString = btoa(binaryString);
		this.myProfileForm.setValue({ 'filecontent': this.base64textString });
	}
	setCountryCode(countryCode) {
		this.countryCode = countryCode;
		this.myProfileForm.setValue({ 'countryCode': countryCode });
	}
	setBloodGroup(bloodGroupString) {
		this.bloodGroup = bloodGroupString;
		this.myProfileForm.setValue({ 'bloodGroup': bloodGroupString });
	}

	setCurrentCountry(co: country) {
		// put the state as empty --start
		this.myProfileForm.setValue({
			'stateId': '',
			'state': this.DEFAULT_STATE_NAME,
		});
		this.selectedState = { StateId: -1, StateName: this.DEFAULT_STATE_NAME };
		// put the state as empty --end
		// put the city as empty --start
		this.myProfileForm.setValue({
			'cityId': '',
			'city': this.DEFAULT_CITY_NAME,
		});
		this.selectedCity = { CityId: -1, CityName: this.DEFAULT_CITY_NAME };
		// put the city as empty --end

		this.selectedCountry = co;
		this.myProfileForm.setValue({ 'countryId': co.CountryId });

		this.cs.GetStatesByCountry(co.CountryId).subscribe(res => {
			this.statesresponse = res;
			this.states = JSON.parse(this.statesresponse.Result);
		});
	}
	setCurrentState(st: state) {
		// put the city as empty --start
		this.myProfileForm.setValue({
			'cityId': '',
			'city': this.DEFAULT_CITY_NAME,
		});
		this.selectedCity = { CityId: -1, CityName: this.DEFAULT_CITY_NAME };
		// put the city as empty --end

		this.selectedState = st;
		this.myProfileForm.setValue({
			'stateId': st.StateId,
			'state': st.StateName,
		});
		this.cs.GetCitiesByState(st.StateId).subscribe(res => {
			this.cityresponse = res;

			this.cities = JSON.parse(this.cityresponse.Result);
		});
	}
	setCurrentCity(ci: occity) {
		this.selectedCity = ci;
		this.myProfileForm.setValue({
			'cityId': ci.CityId,
			'city': ci.CityName,
		});
	}
	sendOTP(email, mobile) {
		this.spinnerService.show();
		this.userService.sendOTP(email, mobile)
			.subscribe(
				(data: any) => {
					this.spinnerService.hide();
					if (data.mobileOTP && data.mobileOTP == 'sent' && data.status && data.status == 'success') {
						alert('OTP sent');
					}
					else {
						alert('OTP sending fail.');
					}

				}
			), err => {
				this.spinnerService.hide();
				this.errorMessage = err;
				alert(err);

			};
	}
	// Validate the image
	validateImage(file) {
		var ext = file.name.split('.').pop();
		if (ext != "jpeg" && ext != "jpg" && ext != "png" && ext != "gif") {
			alert('Please select a valid image file');
			return false;
		}
		if (file.size > 1024000) {
			alert('Max Upload size is 1MB only');
			return false;
		}
		return true;
	}

	ngOnDestroy() {
		this.ocUserSubscription.unsubscribe();
	}


	getWalletForLms() {
        if (this.walletFlag == "lms") {
            this.auth.getWalletPointsForlms(this.userInfo.email).subscribe(data => {
                if (data.ResponceCode === "1") {
                   // this.lmsRegistration();
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
		// lmsRegistration() {
		// 	if (this.walletFlag == "lms") {
		// 		let perams = {
		// 			"patientID": this.userInfo.patientId,
		// 			"FirstName": this.userInfo.firstName,
		// 			"LastName": this.userInfo.lastName,
		// 			"registration_date": this.us.setDate(),
		// 			"Mobile": this.userInfo.mobileNumber,
		// 			"Email": this.userInfo.email,
		// 			"Gender": (this.userInfo.gender.toString() == "1" ? "male" : "female"),
		// 			"DOB": this.userInfo.dateofBirth
		// 		}
	
		// 		this.auth.getRegisterForlms(perams).subscribe(data => {
		// 			if (data.ResponceCode == "0") {
					   
		// 			}
		// 		})
		// 	}
	
		// }

}
