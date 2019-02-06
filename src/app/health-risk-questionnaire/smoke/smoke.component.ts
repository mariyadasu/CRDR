import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HealthcheckService } from '@aa/services/healthcheck.service';
import { HRQQuestionAndAnswers, SelectedDiagnose } from '@aa/structures/healthcheck.interface';
import { ObjHRAAnswers, LstHRAQuestionsAnswersBO, LstHRAQuestionsBO, SubmitHRQQuestionAndAnswersFinal } from '@aa/structures/healthcheck.interface';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-smoke',
  templateUrl: './smoke.component.html',
  styleUrls: ['./smoke.component.scss']
})
export class SmokeComponent implements OnInit {

  SelectedDiagnose: SelectedDiagnose[] = [];
  HRQQuestionAndAnswers: HRQQuestionAndAnswers[] = [];
  HRQQuestionAndAnswersLeveTwo: HRQQuestionAndAnswers[] = [];
  flagstatus = false;
  constructor(private hcs: HealthcheckService, private router: Router,
     private spinnerService: Ng4LoadingSpinnerService) { }

  ngOnInit() {
    var sd = <SelectedDiagnose>{};
    sd.RegionId = localStorage.getItem("regionId");
    sd.SystemId = '9497578';
    sd.SymptomIds = '9467276';
    this.spinnerService.show();
    this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
      (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
        this.spinnerService.hide();
        this.HRQQuestionAndAnswers = HRQQuestionAndAnswers;
      });
  }
  smokeclick(status) {
    if (status == 'Yes') {
      this.flagstatus = true;
      var sd = <SelectedDiagnose>{};
      sd.RegionId = localStorage.getItem("regionId");
      sd.SystemId = '9497578';
      sd.SymptomIds = '9467293,9467284,9467296';

      this.spinnerService.show();
      this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
        (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
          this.spinnerService.hide();
          this.HRQQuestionAndAnswersLeveTwo = HRQQuestionAndAnswers;
        });
    } else if (status == 'Not Anymore') {
      this.flagstatus = true;
      var sd = <SelectedDiagnose>{};
      sd.RegionId = localStorage.getItem("regionId");
      sd.SystemId = '9497578';
      sd.SymptomIds = '9467295,9467293,9467284';
      this.spinnerService.show();
      this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
        (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
          this.spinnerService.hide();
          this.HRQQuestionAndAnswersLeveTwo = HRQQuestionAndAnswers;
        });
    }else {
    	this.flagstatus = false;
    }

  }
  nextSymptom() {
    for (let qa of this.HRQQuestionAndAnswers) {
      //this.processData(qa,qa.SymptomId);
      this.hcs.prepareDynamicData(+qa.SymptomId,9497578,qa);
    }
     for (let qa of this.HRQQuestionAndAnswersLeveTwo) {
      //this.processData(qa,qa.SymptomId);
      this.hcs.prepareDynamicData(+qa.SymptomId,9497578,qa);
    }
    this.router.navigate(['/health-risk-questionnaire/alcohol']);
  }
}
