import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HealthcheckService } from '@aa/services/healthcheck.service';
import { HRQQuestionAndAnswers,SelectedDiagnose } from '@aa/structures/healthcheck.interface';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-alcohol',
  templateUrl: './alcohol.component.html',
  styleUrls: ['./alcohol.component.scss']
})
export class AlcoholComponent implements OnInit {

  SelectedDiagnose:SelectedDiagnose[]=[];
  HRQQuestionAndAnswers: HRQQuestionAndAnswers[] = [];  
  HRQQuestionAndAnswersLeveTwo: HRQQuestionAndAnswers[] = [];
  flagstatus = false;
  constructor(private hcs: HealthcheckService,private router: Router,
    private spinnerService: Ng4LoadingSpinnerService) { }

  ngOnInit() {
  	var sd = <SelectedDiagnose>{};
     sd.RegionId = localStorage.getItem("regionId");
     sd.SystemId = '9497578';
     sd.SymptomIds = '9467277';
     this.spinnerService.show();
  	this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
  		(HRQQuestionAndAnswers:HRQQuestionAndAnswers[]) => { 
             this.spinnerService.hide();           
             this.HRQQuestionAndAnswers = HRQQuestionAndAnswers;
         }); 
  }
  nextSymptom(){
     for (let qa of this.HRQQuestionAndAnswers) {
      //this.processData(qa,qa.SymptomId);
      this.hcs.prepareDynamicData(+qa.SymptomId,9497578,qa);
    }
     for (let qa of this.HRQQuestionAndAnswersLeveTwo) {
      //this.processData(qa,qa.SymptomId);
      this.hcs.prepareDynamicData(+qa.SymptomId,9497578,qa);
    }
  	this.router.navigate(['/health-risk-questionnaire/diet']);
  }
  alcoholclick(status){
  	if(status == 'Yes'){
      this.flagstatus = true;
  		var sd = <SelectedDiagnose>{};
     sd.RegionId = localStorage.getItem("regionId");
     sd.SystemId = '9497578';
     sd.SymptomIds = '9467278,9467294';
     this.spinnerService.show();
  	this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
  		(HRQQuestionAndAnswers:HRQQuestionAndAnswers[]) => { 
              this.spinnerService.hide();           
              this.HRQQuestionAndAnswersLeveTwo = HRQQuestionAndAnswers;
         }); 
  	}else if(status == 'Not Anymore'){
      this.flagstatus = true;
  		var sd = <SelectedDiagnose>{};
     sd.RegionId = localStorage.getItem("regionId");
     sd.SystemId = '9497578';
     sd.SymptomIds = '9467282';
     this.spinnerService.show();
  	this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
  		(HRQQuestionAndAnswers:HRQQuestionAndAnswers[]) => {  
              this.spinnerService.hide();          
              this.HRQQuestionAndAnswersLeveTwo = HRQQuestionAndAnswers;
         }); 
  	}else{
      this.flagstatus = false;
    }
  }

}
