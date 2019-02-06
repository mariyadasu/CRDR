import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HRQQuestionAndAnswers,SelectedDiagnose } from '@aa/structures/healthcheck.interface';
import { HealthcheckService } from '@aa/services/healthcheck.service';


@Component({
  selector: 'app-allergy',
  templateUrl: './allergy.component.html',
  styleUrls: ['./allergy.component.scss']
})
export class AllergyComponent implements OnInit {

  SelectedDiagnose:SelectedDiagnose[]=[];
  HRQQuestionAndAnswers: HRQQuestionAndAnswers[] = [];  
  HRQQuestionAndAnswersLeveTwo: HRQQuestionAndAnswers[] = [];
  public gender:any;
  flagstatus = false;
  constructor(private router: Router,private hcs: HealthcheckService,) { }

  ngOnInit() {
  	var sd = <SelectedDiagnose>{};
     sd.RegionId = localStorage.getItem("regionId");
     sd.SystemId = '9497769';
     sd.SymptomIds = '32175744';
  	this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
  		(HRQQuestionAndAnswers:HRQQuestionAndAnswers[]) => {            
             this.HRQQuestionAndAnswers = HRQQuestionAndAnswers;
         });
  }
  allergyclick(status){
  	if(status == 'Yes'){
      this.flagstatus = true;
     var sd = <SelectedDiagnose>{};
     sd.RegionId = localStorage.getItem("regionId");
     sd.SystemId = '9497769';
     sd.SymptomIds = '32175747,9467335,9467333';
  	this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
  		(HRQQuestionAndAnswers:HRQQuestionAndAnswers[]) => {            
             this.HRQQuestionAndAnswersLeveTwo = HRQQuestionAndAnswers;
         }); 
  	}else if(status == 'No'){
      this.flagstatus = false;
     //this.router.navigate(['/health-risk-questionnaire/familyhistory']);	
  	}
  }
  nextSymptom(){
    
      if(this.HRQQuestionAndAnswers!= null){
       for (let qa of this.HRQQuestionAndAnswers) {
        //this.processData(qa,qa.SymptomId);
        this.hcs.prepareDynamicData(+qa.SymptomId, 9497769, qa);
      }
      for (let qa of this.HRQQuestionAndAnswersLeveTwo) {
        //this.processData(qa,qa.SymptomId);
        this.hcs.prepareDynamicData(+qa.SymptomId, 9497769, qa);
      }
    }
    this.gender = localStorage.getItem("HRAQuestionnaireGender");
    // if(this.gender == 2){
    //   this.router.navigate(['/health-risk-questionnaire/pregnantwomen']);
    // }else{
    //   this.router.navigate(['health-risk-questionnaire/familyhistory']);
    //   //this.router.navigate(['/health-risk-questionnaire/healthcomplaints']);
    // }
  	this.router.navigate(['health-risk-questionnaire/familyhistory']);
  }
}
