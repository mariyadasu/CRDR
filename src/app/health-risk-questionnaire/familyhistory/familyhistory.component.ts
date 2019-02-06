import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HealthcheckService } from '@aa/services/healthcheck.service';
import { HealtchCheckComplaints, SelectedDiagnose, HRQQuestionAndAnswers, HealthRequestAppointment } from '@aa/structures/healthcheck.interface';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ObjHRAAnswers, LstHRAQuestionsAnswersBO, LstHRAQuestionsBOForHealth, SubmitHRQQuestionAndAnswersFinal } from '@aa/structures/healthcheck.interface';

@Component({
  selector: 'app-familyhistory',
  templateUrl: './familyhistory.component.html',
  styleUrls: ['./familyhistory.component.scss']
})
export class FamilyhistoryComponent implements OnInit {

  public gender: any;
  appid;
  HealtchCheckComplaints: HealtchCheckComplaints[] = [];
  SelectedDiagnose: SelectedDiagnose[] = [];
  HRQQuestionAndAnswers: HRQQuestionAndAnswers[] = [];
  HRQQuestionAndAnswersLeveTwo: HRQQuestionAndAnswers[] = [];
  HealthRequestAppointment: HealthRequestAppointment[] = [];

  poshealthcheck: any = 0;
  possymptomid: any = 0;
  str: string = 'abcdefghij';
  selectedTopics: any[] = [];
  attrid: any;
  symptom: any;
  constructor(private router: Router,
    public hcs: HealthcheckService,
    private spinnerService: Ng4LoadingSpinnerService) { }

  ngOnInit() {

    var hr = <HealthRequestAppointment>{};
    hr.RequestId = +localStorage.getItem("RequestId"),
      hr.MMAppointmentId = +localStorage.getItem("MMAppointmentId");
    hr.RegionID = +localStorage.getItem("regionId");
    this.appid = localStorage.getItem("apptmentId");
    this.hcs.GetHRASymptomsForFamilyHistory(hr).subscribe(
      (HealtchCheckComplaints: HealtchCheckComplaints[]) => {
        this.spinnerService.hide();
        this.HealtchCheckComplaints = HealtchCheckComplaints;
        var familydata = "";
        HealtchCheckComplaints.forEach(element => {
          familydata += element.SymptomIds.toString() + ',';
        });
        familydata = familydata.slice(0, -1);
        var sd = <SelectedDiagnose>{};
        sd.RegionId = localStorage.getItem("regionId");
        sd.SystemId = '9497631';
        sd.SymptomIds = familydata;
        this.spinnerService.show();
        this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
          (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
            this.spinnerService.hide();
            this.HRQQuestionAndAnswers = HRQQuestionAndAnswers;            
            for (let data of this.HRQQuestionAndAnswers) {
              this.attrid = data.SymptomId;
              if (this.attrid == 9467301) {               
                var sd = <SelectedDiagnose>{};
                sd.RegionId = localStorage.getItem("regionId");
                sd.SystemId = '9497631';
                sd.SymptomIds = '32178108';
                this.spinnerService.show();
                this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
                  (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
                    this.spinnerService.hide();
                    data.levelTwo = HRQQuestionAndAnswers;
                  });
              }
              else if (this.attrid == 9467304) {
                var sd = <SelectedDiagnose>{};
                sd.RegionId = localStorage.getItem("regionId");
                sd.SystemId = '9497631';
                sd.SymptomIds = '9467308,9467307,9467327';
                this.spinnerService.show();
                this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
                  (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
                    this.spinnerService.hide();
                    //this.HRQQuestionAndAnswersLeveTwo = HRQQuestionAndAnswers;
                    data.levelTwo = HRQQuestionAndAnswers;
                  });
              } else if (this.attrid == 9467305) {
                var sd = <SelectedDiagnose>{};
                sd.RegionId = localStorage.getItem("regionId");
                sd.SystemId = '9497631';
                sd.SymptomIds = '9467309,9467306,9467326';
                this.spinnerService.show();
                this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
                  (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
                    this.spinnerService.hide();
                    //this.HRQQuestionAndAnswersLeveTwo = HRQQuestionAndAnswers;
                    data.levelTwo = HRQQuestionAndAnswers;
                  });
              } else if (this.attrid == 9467310 || this.attrid == 9467312 || this.attrid == 9467321) {
                this.symptom = (this.attrid == 9467310) ? '9729667' : (this.attrid == 9467312) ? '9467325' : (this.attrid == 9467321) ? '9467329' : (this.attrid == 9467301) ? '9467324' : '';
                var sd = <SelectedDiagnose>{};
                sd.RegionId = localStorage.getItem("regionId");
                sd.SystemId = '9497631';
                sd.SymptomIds = this.symptom;
                this.spinnerService.show();
                this.hcs.GetHRQQuestionsAndAnswers(sd).subscribe(
                  (HRQQuestionAndAnswers: HRQQuestionAndAnswers[]) => {
                    this.spinnerService.hide();
                    //this.HRQQuestionAndAnswersLeveTwo = HRQQuestionAndAnswers;
                    data.levelTwo = HRQQuestionAndAnswers;
                  });
              }
            }

          });

      }), err => {
        alert("something went wrong!");
      };
  }
  familyhistoryClick(Attrid, Attrvalue) {
    if ((Attrid == 9467304 && Attrvalue.trim().toLowerCase()  == 'expired' || Attrid == 9467305 && Attrvalue.toLowerCase() == 'expired')) {

      var e = document.getElementById('realtion_' + Attrid);
      if (e.style.display == 'block') {
        e.style.display = 'none';
      } else {
        e.style.display = 'block';
      }

    } else {
      var e = document.getElementById('realtion_' + Attrid);
      e.style.display = 'none';
    }
  }
  selectedTopicsNew: any = [];
  checkedFamily(event: any, Attrid, familyindex) {
    var e = document.getElementById('realtion_' + Attrid);
      console.log(e);
    if (event.target.checked) {
      this.selectedTopics.push(Attrid + '_' + familyindex);
      this.selectedTopicsNew.push(Attrid);
    } else {
      let index = this.selectedTopics.indexOf(Attrid + '_' + familyindex);
      this.selectedTopics.splice(index, 1);
      let index1 = this.selectedTopicsNew.indexOf(Attrid);
      this.selectedTopicsNew.splice(index1, 1);
    }
    console.log(this.selectedTopics);

    let isExist = this.selectedTopicsNew.indexOf(Attrid);


    if ((Attrid == 9467310 || Attrid == 9467312 || Attrid == 9467321 || Attrid == 9467301 || Attrid == 9467311) && isExist != -1) {

      e.style.display = 'block';
    } else {
      var e = document.getElementById('realtion_' + Attrid);
      e.style.display = 'none';
    }
  }
  nextSymptom() {

    for (let qa of this.HRQQuestionAndAnswers) {
      this.hcs.prepareDynamicData(+qa.SymptomId, 9497631, qa);

      if (qa.levelTwo != undefined && qa.levelTwo != null && qa.levelTwo.length > 0) {
        for (let qa1 of qa.levelTwo) {
          this.hcs.prepareDynamicData(+qa1.SymptomId, 9497631, qa1);
        }
      }
    }
    // for (let qa of this.HRQQuestionAndAnswersLeveTwo) {
    //   this.hcs.prepareDynamicData(+qa.SymptomId, 9497631, qa);
    // }
    this.gender = localStorage.getItem("HRAQuestionnaireGender");
    if (this.gender == 2) {
      this.router.navigate(['/health-risk-questionnaire/pregnantwomen']);
    } else {
      this.router.navigate(['/health-risk-questionnaire/healthcomplaints']);
    }
  }
}
