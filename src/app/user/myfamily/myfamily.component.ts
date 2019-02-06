import { Component, OnInit, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { AAAuthService } from '@aa/services/auth.service';
import { UserService } from '@aa/services/user.service';
import { CommonService } from '@aa/services/common.service';
import { UserInfo, aaToken, UHID } from '@aa/structures/user.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { Subject } from 'rxjs/Subject';
import { FormBuilder, FormGroup, FormControl, Validators, NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
@Component({
	selector: 'app-myfamily',
	templateUrl: './myfamily.component.html',
	styleUrls: ['./myfamily.component.scss'],
	providers: [DatePipe]
})
export class MyfamilyComponent implements OnInit {
	response: any;
	relationshipTypes: any;
	addMemberResponse: any;
	allMembersdata: any;
	addmember: FormGroup;
	private base64textString: String = "";
	public now: Date = new Date();
	day: any;
	month: any;
	year: any;
	age: any;
	public isCollapsed = true;
	public isCount = false;
	PatRelationId: number;
	modalRef: BsModalRef;

	maxDate: Date;
	maxDateNew=new Date();
	constructor(private userService: UserService,
		private auth: AAAuthService,
		private frmbuilder: FormBuilder,
		private cs: CommonService,
		private _datePipe: DatePipe,
		private modalService: BsModalService,
		private router: Router,
		private bsLocaleService: BsLocaleService) {
			this.bsLocaleService.use('en-gb');
		this.addmember = frmbuilder.group({
			relationFirstName: ['', Validators.compose([Validators.required, Validators.maxLength(50),])],
			relationLastName: ['', Validators.compose([Validators.required, Validators.maxLength(50),])],
			dob: ['', Validators.compose([Validators.required])],
			gender: ['', Validators.compose([Validators.required])],
			relationId: ['', Validators.compose([Validators.required])],
			createdDate: [''],
			imageName: [''],
			filecontent: [''],
			filename: [''],
			fileext: [''],
			age: ['']
		});

		// future dates disabling
		this.maxDate = new Date();
		this.maxDate.setDate(this.maxDate.getDate() - 1);
	}

	ngOnInit() {
		// get the family members data -- start
		this.getAllFamilyData();
		// get the family members data
		this.cs.setPageTitle("Book your doctor appointment today - Ask Apollo");
		this.auth.loadingShow('loadingid');
		this.userService.getUserDetails()
			.subscribe(
			(data: any) => {
				this.auth.loadingHide('loadingid');
				if (data.ResponceCode == 0) {
					this.response = JSON.parse(data.Result)[0];
				}
				else {
					alert('Unable to get the user details.');
					this.router.navigate(['/my/dashboard']);
				}

				//console.error(this.response);

			}
			), err => {
				this.auth.loadingHide('loadingid');
				alert("something went wrong!");
			};
		// get the user data  -- end
		// get the relationship data -- start
		this.auth.loadingShow('loadingid');
		this.userService.getRelationshipsData()
			.subscribe(
			(data: any) => {
				this.auth.loadingHide('loadingid');
				//console.error(data);
				this.relationshipTypes = JSON.parse(data.Result);
				//console.error(this.relationshipTypes);

			}
			), err => {
				this.auth.loadingHide('loadingid');
				alert("something went wrong!");
			};
		// get the relationship data  -- end

		// default gender set to Male
		this.addmember.get('gender').setValue('M');
		this.getUHID();
	}
	/*
	*	submit the form
	*/
	postAddMember(addmember: FormGroup) {
		this.isCollapsed = true;
		var d = new Date(addmember.value.dob);
		this.month = '' + (d.getMonth() + 1);
		this.day = '' + d.getDate();
		this.year = d.getFullYear();

		if (this.month.length < 2) this.month = '0' + this.month;
		if (this.day.length < 2) this.day = '0' + this.day;

		this.addmember.get('dob').setValue([this.month, this.day, this.year].join('/'));


		var today = new Date();
		var nowyear = today.getFullYear();
		var nowmonth = today.getMonth();
		var nowday = today.getDate();


		this.age = nowyear - this.year;
		var age_month = nowmonth - this.month;
		var age_day = nowday - this.day;
		this.age = parseInt(this.age);

		// created date set to form field
		this.addmember.get('createdDate').setValue(this._datePipe.transform(this.now, 'yyyy-MM-dd HH:mm:SS.SSS'));
		this.addmember.get('age').setValue(this.age);
		this.auth.loadingShow('loadingid');

		this.userService.addFamilyMember(addmember.value, this.response, this.selectedUHID.uhid)
			.subscribe(res => {
				this.auth.loadingHide('loadingid');
				this.addMemberResponse = res;
				this.getAllFamilyData();
				this.url = '';
				addmember.reset();
				alert(this.addMemberResponse.Result);

			}, err => {
				this.auth.loadingHide('loadingid');
				alert("something went wrong!");
			});
	}
	/*
	*	Get the all family members data
	*/
	getAllFamilyData() {
		this.auth.loadingShow('loadingid');
		this.userService.getAllFamilyMembersData()
			.subscribe(
			(data: any) => {
				this.auth.loadingHide('loadingid');
				this.allMembersdata = JSON.parse(data.Result);
				if (this.allMembersdata.length > 0) {
					this.isCount = true;
				}
				else {
					this.isCount = false;
				}
				//console.log(this.allMembersdata.length);
				//console.error(this.allMembersdata);
			}
			), err => {
				this.auth.loadingHide('loadingid');
				alert("something went wrong!");
			};
	}

	url:any = '';
	onSelectFile(event) {
		if (event.target.files && event.target.files[0]) {
			var reader = new FileReader();
			this.addmember.get('imageName').setValue(event.target.files[0].name);
			this.addmember.get('filename').setValue(event.target.files[0].name);

			var ext = event.target.files[0].name.split('.').pop();
			this.addmember.get('fileext').setValue(ext);
			reader.readAsDataURL(event.target.files[0]); // read file as data url

			reader.onload = (event) => { // called once readAsDataURL is completed
				this.url = reader.result;
			}
			this.convertToBase64(event.target.files[0]);
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
		this.addmember.get('filecontent').setValue(this.base64textString);
	}

    /*
    *	Open model popup
    */
	openModal(template: TemplateRef<any>, PatRelationId) {
		this.PatRelationId = PatRelationId;
		this.modalRef = this.modalService.show(template);
	}

	/*
	*	Delete member process
	*/
	deleteMember(PatRelationId) {
		this.modalRef.hide();
		this.auth.loadingShow('loadingid');
		this.userService.disableRelativeByPatientforSourceApp(PatRelationId, this.response.PatientId)
			.subscribe(
			(data: any) => {
				this.auth.loadingHide('loadingid');
				//console.log(data);
				this.getAllFamilyData();
			}
			), err => {
				this.auth.loadingHide('loadingid');
				alert("something went wrong!");
			};
	}
	uhids: UHID[] = [];
	selectedUHID: UHID = {
		uhid: "0",
		firstName: "Choose"
	}
	showNewPatient() {
		this.selectedUHID = {
			uhid: "0",
			firstName: "Choose"
		}
	}
	getUHID() {

		this.auth.getUhidsUsingPrism().subscribe(
			(data: any) => {
				if (data != null) {

					let userData = data;
					if (userData[0] != null && userData[0].UserData != null &&
						userData[0].UserData.response != null
						&& userData[0].UserData.response.signUpUserData != null
						&& userData[0].UserData.response.signUpUserData.length > 0) {

						for (let d of userData[0].UserData.response.signUpUserData) {
							if (d.UHID != null && d.UHID != "") {
								let uhidData: UHID = {
									firstName: d.FirstName,
									lastName: d.LastName,
									uhid: d.UHID,
									email: d.EMail == null ? '---' : d.EMail,
									gender: d.Gender == null ? '---' : d.Gender,
									mobileNumber: d.MobileNumber == null ? '---' : d.MobileNumber,
									dob: d.DateOfBirth == null ? '---' : d.DateOfBirth,
									isRelation: false
								}
								this.uhids.push(uhidData);
							}
						}
					}
				}
			});
	}
	setUHID(uhid: UHID) {
		this.selectedUHID = uhid;
	}
}
