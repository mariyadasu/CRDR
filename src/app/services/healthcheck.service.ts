import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { constants as c } from '../constants';
import { CommonService } from '@aa/services/common.service';
import { HRQQuestionAndAnswers, ObjHRAAnswers, LstHRAQuestionsAnswersBO, LstHRAQuestionsBO, SubmitHRQQuestionAndAnswersFinal } from '@aa/structures/healthcheck.interface';
@Injectable()
export class HealthcheckService {
  public radiocontrol = 199;
  public textcontrol = 196;
  public checkboxcontrol = 198;
  public startHRAStatusCode = 0;
  public initiateHRAStatusCode = 1;
  public submitHRAStatusCode = 2;
  public icon =['icon-blood-pressure','icon-thyroid','icon-blood','icon-blood',
   'icon-heartbeat','icon-inhalator','icon-pharmacy','icon-femur',
   'icon-cancer-ribbon','icon-blood','icon-blood','icon-liver',
   'icon-knee','icon-blood'];
  public AppointmentHRAStatusCode = 3;
  healthDignoseTracker = new Subject<any>();
  healthDignosePosition = new Subject<string>();

  constructor(private http: HttpClient,
    private route: Router,
    private cs: CommonService) { }
    private httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  /*Diagnose List Api */
  getHealthCheckDiagnoseList(params) {
    let apiEndpoint = c.HRAQuestionnaireUrl + 'InitiateHRAAndGetAllHRQSymptoms';
    return this.http.post(apiEndpoint, params, this.httpOptions);
  } 

  /* Symptoms displayed api */
  GetHRQQuestionsAndAnswers(params) {    
    
    let apiEndpoint = c.HRAQuestionnaireUrl + 'GetHRAQuestionsAndAnswers';
    return this.http.post(apiEndpoint, params, this.httpOptions);
  }
  GetHRQHealtchCheckComplaints(params) {
    let apiEndpoint = c.HRAQuestionnaireUrl + 'GetHRASymptomsForHealtchCheckComplaints';
    return this.http.post(apiEndpoint, params, this.httpOptions);

  }
  GetHRASymptomsForFamilyHistory(params){
    let apiEndpoint = c.HRAQuestionnaireUrl + 'GetHRASymptomsForFamilyHistory';
    return this.http.post(apiEndpoint, params, this.httpOptions);    
  }

  /* store subjects checked diagnoses ids */
  setDiagnoseId(diagnoseid: any) {
    this.healthDignoseTracker.next(diagnoseid); //it is publishing this value to all the subscribers that have already subscribed to this message
  }
  /* store subjects diagnoses position */
  setDiagnosePosition(pos: string) {
    this.healthDignosePosition.next(pos);
  }

  //das
  
  
  SubmitHRQQuestionsAndAnswers(): Observable<any> {
    //debugger;    
    let apiEndpoint = c.HRAQuestionnaireUrl + 'SubmitHRQDetails';
    let params = JSON.parse(localStorage.getItem("submitHRQQuestionAndAnswersFinal"));

    let p2=params;

    for(let sy of p2.lstHRAQuestionsBO){
      sy.remove=true;
      if(sy.lstHRAQuestionsAnswersBO!=undefined && sy.lstHRAQuestionsAnswersBO!=null){
        for(let qa of sy.lstHRAQuestionsAnswersBO){
          
          if(qa.objHRAAnswers.length>0){
            for(let qab of qa.objHRAAnswers){
              if(qab.attributeValue!=undefined && qab.attributeValue!=null){
                sy.remove=false;
              }
            }
           
          }
        }
      }
    }

    params = JSON.stringify(params);
    console.log("p1");
    console.log(params);

    let actual=p2.lstHRAQuestionsBO.filter(s=>{
      return !s.remove;
    })
    p2.lstHRAQuestionsBO=actual;
    let params2 = JSON.stringify(p2);
    console.log(params2);
    
    return this.http.post(apiEndpoint, params2, this.httpOptions);
  }

  errorHandler(error: HttpErrorResponse) {
    return Observable.throw(error.message || "Server Error");
  }

  prepareDynamicData(syntomId: Number, systemId: Number, qa: HRQQuestionAndAnswers) {

    let lstHRAQuestionsBO: LstHRAQuestionsBO = {
      symptomId: +syntomId,
      systemId: +systemId,
      lstHRAQuestionsAnswersBO: []
    };

    for (let qs of qa.lstHRAQuestionsAnswersBO) {

      let control: LstHRAQuestionsAnswersBO = {
        attributeID: qs.AttributeID,
        objHRAAnswers: []
      };

      //Answer
      //AttributeID

      for (let q of qs.objHRAAnswers) {
        if (q.ControlID == 196) {
          let objHRAAnswers: ObjHRAAnswers = {
            controlID: q.ControlID,
            attributeValue: qs.Answer
          }
          control.objHRAAnswers.push(objHRAAnswers);
        }

        if (q.ControlID == 199 || q.ControlID == 197 ) {
          if (q.AttributeValue == qs.Answer) {
            let objHRAAnswers: ObjHRAAnswers = {
              controlID: q.ControlID,
              attributeValue: qs.Answer
            }
            control.objHRAAnswers.push(objHRAAnswers);
          }
        }

        if (q.ControlID == 198) {
          if (q.checked) {
            let objHRAAnswers: ObjHRAAnswers = {
              controlID: q.ControlID,
              attributeValue: q.AttributeValue
            }
            control.objHRAAnswers.push(objHRAAnswers);
          }

        }

        //AttributeValue
        //ControlID
        //Checked
      }
      lstHRAQuestionsBO.lstHRAQuestionsAnswersBO.push(control);
    }
    let formData: SubmitHRQQuestionAndAnswersFinal = JSON.parse(localStorage.getItem('submitHRQQuestionAndAnswersFinal'));
    if(formData!=null){
    formData.lstHRAQuestionsBO.push(lstHRAQuestionsBO);
    }
    localStorage.setItem('submitHRQQuestionAndAnswersFinal', JSON.stringify(formData));
    //let formData: SubmitHRQQuestionAndAnswersFinal = JSON.parse(localStorage.getItem('submitHRQQuestionAndAnswersFinal'));
    //formData.lstHRAQuestionsBO.push(lstHRAQuestionsBO);
    //localStorage.setItem('submitHRQQuestionAndAnswersFinal', JSON.stringify(formData));
  }




}
class lstHRAQuestionsBO{
  symptomId:any
  systemId:any
}
class appointmentIngo{
  RequestId:any
  MMAppointmentId:any
  PAHCNumber:any
  RegionID:any
  Loginid:any
  PatientUHID:any
  lstHRAQuestionsBO:any

}
