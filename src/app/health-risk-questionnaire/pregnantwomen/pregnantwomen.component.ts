import { Component, OnInit } from '@angular/core';
import { HealthcheckService } from '@aa/services/healthcheck.service';
import { HRQQuestionAndAnswers,SelectedDiagnose } from '@aa/structures/healthcheck.interface';
import { Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-pregnantwomen',
  templateUrl: './pregnantwomen.component.html',
  styleUrls: ['./pregnantwomen.component.scss']
})
export class PregnantwomenComponent implements OnInit {

  SelectedDiagnose:SelectedDiagnose[]=[];
  HRQQuestionAndAnswers: HRQQuestionAndAnswers[] = [];
  possymptomid = 0;
  constructor(private hcs: HealthcheckService,private router: Router,
    private spinnerService: Ng4LoadingSpinnerService,) { }

  ngOnInit() {
  	var sd = <SelectedDiagnose>{};
     sd.RegionId = localStorage.getItem("regionId");
     sd.SystemId = '1609';
     sd.SymptomIds = '9372196';
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
      this.hcs.prepareDynamicData(9372196, 1609, qa);
    }
    this.router.navigate(['/health-risk-questionnaire/healthcomplaints']);
  }

}
