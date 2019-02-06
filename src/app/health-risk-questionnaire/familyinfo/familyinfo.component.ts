import { Component, OnInit, Input } from '@angular/core';
import { HealtchCheckComplaints, SelectedDiagnose, HRQQuestionAndAnswers } from '@aa/structures/healthcheck.interface';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { HealthcheckService } from '@aa/services/healthcheck.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-familyinfo',
  templateUrl: './familyinfo.component.html',
  styleUrls: ['./familyinfo.component.scss']
})
export class FamilyinfoComponent implements OnInit {

  HRQQuestionAndAnswersLeveTwo: HRQQuestionAndAnswers[] = [];
  SelectedDiagnose: SelectedDiagnose[] = [];
  @Input() attrid: any;
  symptom:any;
  str: string = 'abcdefghij'; 

  constructor(private router: Router,
    public hcs: HealthcheckService,    
    private spinnerService: Ng4LoadingSpinnerService) { }

  ngOnInit() {
  	var symptomids = ''; 
    if(this.attrid == 9467304){
       var sd = <SelectedDiagnose>{};
        sd.RegionId = localStorage.getItem("regionId");
        sd.SystemId = '9497631';
        sd.SymptomIds = '9467308,9467307,9467327';
        this.spinnerService.show();
        this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
          (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
          this.spinnerService.hide();
          this.HRQQuestionAndAnswersLeveTwo = HRQQuestionAndAnswers;
          
        });
    }else if(this.attrid == 9467305){
      var sd = <SelectedDiagnose>{};
        sd.RegionId = localStorage.getItem("regionId");
        sd.SystemId = '9497631';
        sd.SymptomIds = '9467309,9467306,9467326';
        this.spinnerService.show();
        this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
        (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
          this.spinnerService.hide();
          this.HRQQuestionAndAnswersLeveTwo = HRQQuestionAndAnswers;
        });
    }else if(this.attrid == 9467310 || this.attrid == 9467312 || this.attrid == 9467321 
      || this.attrid == 9467301){
      this.symptom = (this.attrid == 9467310)?'9729667':(this.attrid == 9467312)? '9467325':(this.attrid == 9467321)? '9467329':(this.attrid == 9467301)?'9467324':'';
      var sd = <SelectedDiagnose>{};
        sd.RegionId = localStorage.getItem("regionId");
        sd.SystemId = '9497631';
        sd.SymptomIds = this.symptom;
        this.spinnerService.show();
        this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
        (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
          this.spinnerService.hide();
          this.HRQQuestionAndAnswersLeveTwo = HRQQuestionAndAnswers;
        });
    }

  }
}
