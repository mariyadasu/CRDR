import { Component, OnInit } from '@angular/core';
import { HealthcheckService } from '@aa/services/healthcheck.service';
import { HRQQuestionAndAnswers, SelectedDiagnose,ObjHRAAnswers } from '@aa/structures/healthcheck.interface';
import { Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.scss']
})
export class ExerciseComponent implements OnInit {

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
    sd.SymptomIds = '9467372';
    this.spinnerService.show();
    this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
      (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
        this.spinnerService.hide();
        this.HRQQuestionAndAnswers = HRQQuestionAndAnswers;
      });
  }
  exerciseclick(status) {
    if (status == 'Yes') {
      this.flagstatus = true;
      var sd = <SelectedDiagnose>{};
      sd.RegionId = localStorage.getItem("regionId");
      sd.SystemId = '9497578';
      sd.SymptomIds = '9452666,9452667,9452668,9452670,32175783';
      this.spinnerService.show();
      this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
        (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
          this.spinnerService.hide();          
          this.HRQQuestionAndAnswersLeveTwo = HRQQuestionAndAnswers;
        });
    }else{
      this.flagstatus = false;
    }

  }
  nextSymptom() {

    for (let qa of this.HRQQuestionAndAnswers) {
      this.hcs.prepareDynamicData(+qa.SymptomId, 9497578, qa);
    }
    for (let qa of this.HRQQuestionAndAnswersLeveTwo) {
      this.hcs.prepareDynamicData(+qa.SymptomId, 9497578, qa);
    }

    this.router.navigate(['/health-risk-questionnaire/happinessscore']);
  }

}
