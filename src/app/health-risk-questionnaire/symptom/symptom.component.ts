import { Component, OnInit } from '@angular/core';
import { HealthcheckService } from '@aa/services/healthcheck.service';
import { HRQQuestionAndAnswers } from '@aa/structures/healthcheck.interface';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

import { ObjHRAAnswers, LstHRAQuestionsAnswersBO, LstHRAQuestionsBO, SubmitHRQQuestionAndAnswersFinal } from '@aa/structures/healthcheck.interface';

@Component({
  selector: 'app-symptom',
  templateUrl: './symptom.component.html',
  styleUrls: ['./symptom.component.scss']
})
export class SymptomComponent implements OnInit {

  HRQQuestionAndAnswers: HRQQuestionAndAnswers[] = [];
  HRQQuestionAndAnswersFinal: HRQQuestionAndAnswers[] = [];

  submitHRQQuestionAndAnswersFinal: SubmitHRQQuestionAndAnswersFinal = {};
  //lstHRAQuestionsBO: LstHRAQuestionsBO[] = [];

  systomsArray: Number[] = [];
  paramsJson: any;

  possymptomid;
  res: any;
  systomIds: any;
  params: any;
  flagstatus = false;
  questionstatus: boolean = false;
  attrid: number;
  constructor(private hcs: HealthcheckService,
    private router: Router,
    private spinnerService: Ng4LoadingSpinnerService) { }

  ngOnInit() {

    this.systomIds = localStorage.getItem("symptomIds");
    this.possymptomid = localStorage.getItem("position");
    this.params = localStorage.getItem("selecteddiagnose");
    localStorage.removeItem("submitHRQQuestionAndAnswersFinal");

    this.paramsJson = JSON.parse(this.params);
    if (this.paramsJson != undefined && this.paramsJson != null) {
      this.submitHRQQuestionAndAnswersFinal.RequestId = +localStorage.getItem("RequestId");
      this.submitHRQQuestionAndAnswersFinal.MMAppointmentId = +localStorage.getItem("MMAppointmentId");
      this.submitHRQQuestionAndAnswersFinal.PAHCNumber = localStorage.getItem("PAHCNumber");
      this.submitHRQQuestionAndAnswersFinal.RegionID = +localStorage.getItem("regionId");
      this.submitHRQQuestionAndAnswersFinal.Loginid = localStorage.getItem("Loginid");
      this.submitHRQQuestionAndAnswersFinal.PatientUHID = localStorage.getItem("PatientUHID");
      this.submitHRQQuestionAndAnswersFinal.lstHRAQuestionsBO = [];

      localStorage.setItem('submitHRQQuestionAndAnswersFinal', JSON.stringify(this.submitHRQQuestionAndAnswersFinal));

      this.systomsArray = this.paramsJson.SymptomIds.split(',');
    }
    this.spinnerService.show();
    this.hcs.GetHRQQuestionsAndAnswers(this.params).subscribe(
      (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
        this.spinnerService.hide();
        this.HRQQuestionAndAnswers = HRQQuestionAndAnswers;
        var length = this.HRQQuestionAndAnswers[0].lstHRAQuestionsAnswersBO.length;
        if (this.HRQQuestionAndAnswers[0].SymptomId == 14721374 || this.HRQQuestionAndAnswers[0].SymptomId == 14721392 ||
          this.HRQQuestionAndAnswers[0].SymptomId == 14721387 || this.HRQQuestionAndAnswers[0].SymptomId == 14721389 ||
          this.HRQQuestionAndAnswers[0].SymptomId == 14721388 || this.HRQQuestionAndAnswers[0].SymptomId == 14721414 ||
          this.HRQQuestionAndAnswers[0].SymptomId == 14721427) {
          this.attrid = this.HRQQuestionAndAnswers[0].lstHRAQuestionsAnswersBO[length - 1].AttributeID;
        }

      });
  }
  symptomclick(status, symptomid, attrid) {

    if (symptomid == '14721406' && status == 'Yes') {
      this.flagstatus = true;
    } else {
      this.flagstatus = false;
    }
    if (attrid == '32182490' || attrid == '32173413' || attrid == '32182877' || attrid == '32172621' || attrid == '32175905' || attrid == '32175948' || attrid == '32175906') {
      if ((symptomid == '14721374' || symptomid == '14721392' || symptomid == '14721387' || symptomid == '14721389' || symptomid == '14721388' || symptomid == '14721414' || symptomid == '14721427') && status == 'Yes') {
        this.questionstatus = true;
      } else {
        this.questionstatus = false;        
      }
    }

  }
  nextSymptom(symptomid) {

    var systomlength = this.systomIds.split(',').length;
    if (this.possymptomid == systomlength - 1) {
      let syntomId = this.systomsArray[Number.parseInt(this.possymptomid)];
      let qa = this.HRQQuestionAndAnswers[Number.parseInt(this.possymptomid)];
      if ((symptomid == 14721374 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32182490).Answer == undefined)
        || (symptomid == 14721392 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32173413).Answer == undefined)
        || (symptomid == 14721387 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32182877).Answer == undefined)
        || (symptomid == 14721389 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32172621).Answer == undefined)
        || (symptomid == 14721388 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32175905).Answer == undefined)
        || (symptomid == 14721414 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32175906).Answer == undefined)
        || (symptomid == 14721427 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32175948).Answer == undefined)) {
        alert('Are you on medications is required');
      } else if ((symptomid == 14721374 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32182490).Answer.trim() == 'Yes' && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 14729446).Answer == undefined)
        || (symptomid == 14721388 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32175905).Answer.trim() == 'Yes' && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 14729448).Answer == undefined)
        || (symptomid == 14721427 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32175948).Answer.trim() == 'Yes' && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 14729473).Answer == undefined)
        || (symptomid == 14721414 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32175906).Answer.trim() == 'Yes' && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 14729545).Answer == undefined)
        || (symptomid == 14721392 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32173413).Answer.trim() == 'Yes' && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 14729476).objHRAAnswers.find(y => y.checked) == undefined)
        || (symptomid == 14721387 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32182877).Answer.trim() == 'Yes' && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 14729470).Answer == undefined)
        || (symptomid == 14721389 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32172621).Answer.trim() == 'Yes' && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 14729441).Answer == undefined)) {
        alert('Do you take your medications regularly is required');
      }
      else {
        this.possymptomid = Number.parseInt(this.possymptomid) + 1;
        this.hcs.prepareDynamicData(+syntomId, +this.paramsJson.SystemId, qa);
        this.router.navigate(['/health-risk-questionnaire/smoke']);
      }
    } else {
      let syntomId = this.systomsArray[Number.parseInt(this.possymptomid)];
      let qa = this.HRQQuestionAndAnswers[Number.parseInt(this.possymptomid)];
      if ((symptomid == 14721374 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32182490).Answer == undefined) ||
        (symptomid == 14721392 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32173413).Answer == undefined) ||
        (symptomid == 14721387 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32182877).Answer == undefined) ||
        (symptomid == 14721389 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32172621).Answer == undefined) ||
        (symptomid == 14721388 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32175905).Answer == undefined) ||
        (symptomid == 14721414 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32175906).Answer == undefined) ||
        (symptomid == 14721427 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32175948).Answer == undefined)) {
        alert('Are you on medications is required');
      } else if ((symptomid == 14721374 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32182490).Answer.trim() == 'Yes' && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 14729446).Answer == undefined) 
        || (symptomid == 14721388 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32175905).Answer.trim() == 'Yes' && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 14729448).Answer == undefined)
        || (symptomid == 14721427 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32175948).Answer.trim() == 'Yes' && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 14729473).Answer == undefined)
        || (symptomid == 14721414 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32175906).Answer.trim() == 'Yes' && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 14729545).Answer == undefined)
        || (symptomid == 14721392 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32173413).Answer.trim() == 'Yes' && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 14729476).objHRAAnswers.find(y => y.checked) == undefined)
        || (symptomid == 14721387 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32182877).Answer.trim() == 'Yes' && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 14729470).Answer == undefined)
        || (symptomid == 14721389 && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 32172621).Answer.trim() == 'Yes'
          && qa.lstHRAQuestionsAnswersBO.find(x => x.AttributeID == 14729441).Answer == undefined)) {
        alert('Do you take your medications regularly is required');
      } else {
        this.possymptomid = Number.parseInt(this.possymptomid) + 1;
        this.hcs.prepareDynamicData(+syntomId, +this.paramsJson.SystemId, qa);
        this.spinnerService.show();
        this.hcs.GetHRQQuestionsAndAnswers(this.params).subscribe(
          (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
            this.HRQQuestionAndAnswers = HRQQuestionAndAnswers;
            var length = this.HRQQuestionAndAnswers[this.possymptomid].lstHRAQuestionsAnswersBO.length;
            this.questionstatus = false;
            if (this.HRQQuestionAndAnswers[this.possymptomid].SymptomId == 14721374 ||
              this.HRQQuestionAndAnswers[this.possymptomid].SymptomId == 14721392 ||
              this.HRQQuestionAndAnswers[this.possymptomid].SymptomId == 14721387 ||
              this.HRQQuestionAndAnswers[this.possymptomid].SymptomId == 14721389 ||
              this.HRQQuestionAndAnswers[this.possymptomid].SymptomId == 14721388 ||
              this.HRQQuestionAndAnswers[this.possymptomid].SymptomId == 14721414 ||
              this.HRQQuestionAndAnswers[this.possymptomid].SymptomId == 14721427) {
              this.attrid = this.HRQQuestionAndAnswers[this.possymptomid].lstHRAQuestionsAnswersBO[length - 1].AttributeID;
            }
            this.spinnerService.hide();
          });
      }
    }
  }
  perviousSymptom() {
    var systomlength = this.systomIds.split(',').length;

    console.log(this.possymptomid);
    if (this.possymptomid == 0) {

      this.router.navigate(['/health-risk-questionnaire/diagnoseslist']);
    } else {
      this.possymptomid = Number.parseInt(this.possymptomid) - 1;
      this.hcs.GetHRQQuestionsAndAnswers(this.params).subscribe(
        (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
          this.HRQQuestionAndAnswers = HRQQuestionAndAnswers;
        });
    }
  }
  saveUserDetails(f: NgForm) {
    console.log(f.value);
  }

}
