import { Component, OnInit } from '@angular/core';
import { HealthcheckService } from '@aa/services/healthcheck.service';
import { HRQQuestionAndAnswers,SelectedDiagnose } from '@aa/structures/healthcheck.interface';
import { Router } from '@angular/router';
import { ObjHRAAnswers, LstHRAQuestionsAnswersBO, LstHRAQuestionsBO } from '@aa/structures/healthcheck.interface';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-diet',
  templateUrl: './diet.component.html',
  styleUrls: ['./diet.component.scss']
})
export class DietComponent implements OnInit {

  SelectedDiagnose:SelectedDiagnose[]=[];
  HRQQuestionAndAnswers: HRQQuestionAndAnswers[] = [];
  possymptomid:any = 0;
  paramsJson: any;
  constructor(private hcs: HealthcheckService,private router: Router,
    private spinnerService: Ng4LoadingSpinnerService) { }

  ngOnInit() {

  	var sd = <SelectedDiagnose>{};
     sd.RegionId = localStorage.getItem("regionId");
     sd.SystemId = '9497578';
     sd.SymptomIds = '9467279';        
     this.spinnerService.show();
  	 this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
  		(HRQQuestionAndAnswers:HRQQuestionAndAnswers[]) => {
      this.spinnerService.hide();            
             this.HRQQuestionAndAnswers = HRQQuestionAndAnswers;
         }); 
  }
  nextSymptom(){

    let qa=this.HRQQuestionAndAnswers[Number.parseInt(this.possymptomid)];    

     
    for (let qa of this.HRQQuestionAndAnswers) {
      //this.processData(qa,qa.SymptomId);
      this.hcs.prepareDynamicData(+qa.SymptomId,9497578,qa);
    }
    
    this.router.navigate(['/health-risk-questionnaire/exercise']);
  }

}
