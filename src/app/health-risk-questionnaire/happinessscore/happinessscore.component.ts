import { Component, OnInit } from '@angular/core';
import { HealthcheckService } from '@aa/services/healthcheck.service';
import { HRQQuestionAndAnswers,SelectedDiagnose } from '@aa/structures/healthcheck.interface';
import { Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';


@Component({
  selector: 'app-happinessscore',
  templateUrl: './happinessscore.component.html',
  styleUrls: ['./happinessscore.component.scss']
})
export class HappinessscoreComponent implements OnInit {

  SelectedDiagnose:SelectedDiagnose[]=[];
  HRQQuestionAndAnswers: HRQQuestionAndAnswers[] = [];
  possymptomid = 0;
  
  constructor(private hcs: HealthcheckService,private router: Router,
    private spinnerService: Ng4LoadingSpinnerService) { }

  ngOnInit() {
  	var sd = <SelectedDiagnose>{};
     sd.RegionId = localStorage.getItem("regionId");
     sd.SystemId = '1497';
     sd.SymptomIds = '32175907';
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
      this.hcs.prepareDynamicData(+qa.SymptomId, 1497, qa);
    }
    this.router.navigate(['/health-risk-questionnaire/allergy']);
  }
  removeSpaces(item) {
    item = item.replace(/ /g, '-');
    item = item.replace(/%20/g, '-');
    return item;
  }
}
