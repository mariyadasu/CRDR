import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '@aa/services/user.service';
import { AAAuthService } from '@aa/services/auth.service';
import { UserInfo, aaToken, OCUserInfo, Clarification, DownloadPrescription, CasesheetDetails, Attachments, appointmentDetails } from '@aa/structures/user.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { constants as c } from './../../constants';

@Component({
	selector: 'app-view-casesheet',
	templateUrl: './view-casesheet.component.html',
	styleUrls: ['./view-casesheet.component.scss']
})
export class ViewCasesheetComponent implements OnInit {

	ocUserSubscription = new Subscription;
	res: any;
	ocUserInfo: OCUserInfo = {} as OCUserInfo;
	casesheetDetails: CasesheetDetails = {} as CasesheetDetails;
	visitIdSubscription: Subscription;
	visitId: string;
	response: any;

	attachments: Attachments;

	appDetailsSubscription: Subscription;
	appointmentDetails: appointmentDetails;

	apointmentDate:number;
	allergiesArray:any;
	medictionsArray:any;

	constructor(private us: UserService,
		private auth: AAAuthService,
		private router: Router) {

	}

	ngOnInit() {
		
		this.us.getOCUserDetails();
		this.ocUserSubscription = this.us.ocUserTracker.subscribe(
			(data) => {
				this.res = data;
				if (this.res.ResponceCode == 0) {
					this.ocUserInfo = JSON.parse(this.res.Result)[0];
				}
				else {
					this.router.navigate(['/my/dashboard-oc']);
				}
	
			}, (err) => {
				//this.spinnerService.hide();
				console.log(err);
			}
		);
		// get the visit id  -- start

		/*this.visitIdSubscription = this.us.currentVisitedId.subscribe(
			(value) => {
				this.visitId = value;
				console.log('Visit id');
				console.log(this.visitId);
			}
		);*/
		this.appDetailsSubscription = this.us.currentAppointment.subscribe(
			(data) => {
				this.appointmentDetails = data;
				if(this.appointmentDetails.AppointmentDate)
				{
					var dtstr = this.appointmentDetails.AppointmentDate;
					this.apointmentDate = new Date(dtstr.split("/").reverse().join("-")).getTime();
					console.log(this.apointmentDate)
				}
			}
		);
		

		// get the visit id  -- end
		 if(!this.appointmentDetails.AppointmentDate)
		 {
		   this.router.navigate(['/my/dashboard-oc']);
		 }

		// get the case sheet data  -- start
		this.auth.loadingShow('loadingid');
		this.us.getCasesheetDetails(this.appointmentDetails.VisitId).subscribe(cdata => {
				this.auth.loadingHide('loadingid');
				this.response = cdata;
				this.casesheetDetails = JSON.parse(this.response.Result)[0];
				this.formateAllrgies(this.casesheetDetails.Allergies);
				this.medictionsArray=[];
				this.formateMedications(this.casesheetDetails.AnyOtherTreatmentUnderTaken);
				this.formateGender(this.casesheetDetails.gender);
			}, err => {
				this.auth.loadingHide('loadingid');
				alert('Something went wrong');
				console.log(err);
			});
		// get the case sheet data  -- end
		this.auth.loadingShow('loadingid');
		this.us.getAttachmentss(this.appointmentDetails.VisitId) //ex : 6397
			.subscribe(cdata => {
				this.auth.loadingHide('loadingid');
				this.response = cdata;
				this.attachments = JSON.parse(this.response.Result);
			}, err => {
				this.auth.loadingHide('loadingid');
				//alert('Something went wrong'); 
				console.log(err);
			});
		// get the attachments data  -- end
			
	}

	ngOnDestroy() {
		this.appDetailsSubscription.unsubscribe();
		this.ocUserSubscription.unsubscribe();
	}

	formateAllrgies(allergiesString) {
		let allergiesArray = allergiesString.split(',');
		this.allergiesArray = allergiesArray;
	}
	formateMedications(medicationString) {
		let mArray = medicationString.split(';');
		
		for (let m of mArray) {
			let mArrayInside=m.split(',');
			let medication = {
				name: mArrayInside[0],
				time: mArrayInside[1],
				sDate: mArrayInside[2]
			};
			this.medictionsArray.push(medication);

		}
	}
	formateGender(genderString){
		let genderArrayArray=genderString.split(',');
		let gArrayInside=genderArrayArray[1];
		let glevelThree=gArrayInside.split(':');
		this.casesheetDetails.gender=glevelThree[1];
	}
	/*
    *  View casesheet
    */
    viewCasesheet(fileDetails)
    {
	 if(fileDetails.Description=="FinalPrescription")
	 {
		let x =JSON.parse(localStorage.getItem("dataForPris"))
	  var url = c.downloadPrescriptionUrl + "?appid=" + x.AppointmentId + "&visitid=" + x.VisitId + "&uhid=" + x.Uhid + "&user=Patient&PatientName=" + x.PatientName;
	 }
	 else{
	  var url = c.viewDocument + fileDetails.VisitId + '/'+ fileDetails.DocumentId + '/' + fileDetails.FileName;
	 }
      window.open(url, '_blank');
    }

}
