import { Component, OnInit } from '@angular/core';
import { HealthcheckService } from '@aa/services/healthcheck.service';
import { HealtchCheckComplaints, SelectedDiagnose, HRQQuestionAndAnswers,HealthRequestAppointment } from '@aa/structures/healthcheck.interface';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { Router, ActivatedRoute } from '@angular/router';

import { ObjHRAAnswers, LstHRAQuestionsAnswersBO, LstHRAQuestionsBOForHealth, SubmitHRQQuestionAndAnswersFinal } from '@aa/structures/healthcheck.interface';


@Component({
	selector: 'app-health-complaints',
	templateUrl: './health-complaints.component.html',
	styleUrls: ['./health-complaints.component.scss']
})
export class HealthComplaintsComponent implements OnInit {

	regionid;
	HealtchCheckComplaints: HealtchCheckComplaints[] = [];
	SelectedDiagnose: SelectedDiagnose[] = [];
	HRQQuestionAndAnswers: HRQQuestionAndAnswers[] = [];
	HealthRequestAppointment: HealthRequestAppointment[] = [];
	poshealthcheck: any = 0;
	possymptomid: any = 0;
	button = 'Next';
	appointmentId:Number;
	constructor(public hcs: HealthcheckService,
		private spinnerService: Ng4LoadingSpinnerService,
		private router: Router) { }

	ngOnInit() {

		var hr = <HealthRequestAppointment>{};
	    hr.RequestId = +localStorage.getItem("RequestId"),
	    hr.MMAppointmentId = +localStorage.getItem("MMAppointmentId");
	    hr.RegionID = +localStorage.getItem("regionId");		
		this.spinnerService.show();
		this.hcs.GetHRQHealtchCheckComplaints(hr).subscribe(
			(HealtchCheckComplaints: HealtchCheckComplaints[]) => {
				this.spinnerService.hide();
				this.HealtchCheckComplaints = HealtchCheckComplaints;
				if (this.HealtchCheckComplaints.length != 0) {
					var sd = <SelectedDiagnose>{};
					sd.RegionId = localStorage.getItem("regionId");
					
			        this.submitHRQQuestionAndAnswersFinal.RequestId= +localStorage.getItem("RequestId");
			        this.submitHRQQuestionAndAnswersFinal.MMAppointmentId= +localStorage.getItem("MMAppointmentId");
			        this.submitHRQQuestionAndAnswersFinal.PAHCNumber= localStorage.getItem("PAHCNumber");
			        this.submitHRQQuestionAndAnswersFinal.RegionID= +localStorage.getItem("regionId");
			        this.submitHRQQuestionAndAnswersFinal.Loginid= localStorage.getItem("Loginid");
			        this.submitHRQQuestionAndAnswersFinal.PatientUHID= localStorage.getItem("PatientUHID");

					this.submitHRQQuestionAndAnswersFinal.lstHRAQuestionsBO = [];
					sd.SystemId = this.HealtchCheckComplaints[this.poshealthcheck]['SystemId'];
					sd.SymptomIds = this.HealtchCheckComplaints[this.poshealthcheck]['SymptomIds'];
					this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
						(HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
							this.HRQQuestionAndAnswers = HRQQuestionAndAnswers;
						});
				} else {
					this.router.navigate(['health-risk-questionnaire/finalquestionnaire']);
				}
			}), err => {
				alert("something went wrong!");
			};


	}
	submitHRQQuestionAndAnswersFinal: SubmitHRQQuestionAndAnswersFinal = {};
	nextSymptom() {
		var healthcomplaintslength = this.HealtchCheckComplaints.length;
		if(this.poshealthcheck == healthcomplaintslength-2){
			this.button = 'Submit';			
		}
		if (this.poshealthcheck == healthcomplaintslength - 1) {			

			let index = Number.parseInt(this.poshealthcheck);			
			this.spinnerService.show();
			var AppointmentId = this.HealtchCheckComplaints[index]['AppointmentId'];
			var SystemId = this.HealtchCheckComplaints[index]['SystemId'];
			var SymptomIds = this.HealtchCheckComplaints[index]['SymptomIds'];
			for (let sy of this.HRQQuestionAndAnswers) {		
			this.hcs.prepareDynamicData(sy.SymptomId,+SystemId,sy);	
		    }		
			this.hcs.SubmitHRQQuestionsAndAnswers().subscribe(res => {
				this.spinnerService.hide();
				if (res.errCode == 1 || res.errCode == 0 ){				
				this.router.navigate(['health-risk-questionnaire/finalquestionnaire']);
				}else{
					alert('Ref Error:'+res.errorMsg);
				}
			});

		} else {
			let index = Number.parseInt(this.poshealthcheck);
			var AppointmentId = this.HealtchCheckComplaints[index]['AppointmentId'];
			var SystemId = this.HealtchCheckComplaints[index]['SystemId'];
			var SymptomIds = this.HealtchCheckComplaints[index]['SymptomIds'];
			for (let sy of this.HRQQuestionAndAnswers) {			
			this.hcs.prepareDynamicData(sy.SymptomId,+SystemId,sy);	
		    }
			this.poshealthcheck = Number.parseInt(this.poshealthcheck) + 1;		    
			var sd = <SelectedDiagnose>{};
			sd.RegionId = localStorage.getItem("regionId");
			sd.SystemId = this.HealtchCheckComplaints[this.poshealthcheck]['SystemId'];
			sd.SymptomIds = this.HealtchCheckComplaints[this.poshealthcheck]['SymptomIds'];
			this.spinnerService.show();
			this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
				(HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
					this.spinnerService.hide();
					this.HRQQuestionAndAnswers = HRQQuestionAndAnswers;
				});
		}
	}
}