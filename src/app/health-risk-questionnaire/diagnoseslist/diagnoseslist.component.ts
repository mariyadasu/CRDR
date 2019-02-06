import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, NgForm, FormArray } from '@angular/forms';
import { HealthcheckService } from '@aa/services/healthcheck.service';
import { HelathCheckDiagnose, SelectedDiagnose,HealthAppointmentdata } from '@aa/structures/healthcheck.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Component({
  selector: 'app-diagnoseslist',
  templateUrl: './diagnoseslist.component.html',
  styleUrls: ['./diagnoseslist.component.scss']
})
export class DiagnoseslistComponent implements OnInit {

  healthgroup: FormGroup;
  dignoseFormArray;
  public diagnosevalue: number[];
  public position: any;
  HelathCheckDiagnoses: HelathCheckDiagnose[] = [];
  SelectedDiagnose: SelectedDiagnose[] = [];
  HealthAppointmentdata: HealthAppointmentdata[] = [];
  public appid: string;
  constructor(private frmbuilder: FormBuilder,
    public hcs: HealthcheckService,
    private router: Router,
    private spinnerService: Ng4LoadingSpinnerService,
    private route: ActivatedRoute) {

    this.healthgroup = frmbuilder.group({
      healthdiagnose: this.frmbuilder.array([])
    });
  }
actualSyntomsPossition:any;
  ngOnInit() {
    localStorage.removeItem("submitHRQQuestionAndAnswersFinal");
    this.spinnerService.show();
    //this.appid = this.route.snapshot.paramMap.get('appointmentid');     
    this.route.queryParams.subscribe(
      (params) => {
        this.appid = params['hrakey'];
      }
    )    
    var ha = <HealthAppointmentdata>{};
    ha.appointmentData = this.appid;
    this.hcs.getHealthCheckDiagnoseList(ha).subscribe(
      (HelathCheckDiagnoses: HelathCheckDiagnose[]) => {
        this.spinnerService.hide();
        this.HelathCheckDiagnoses = HelathCheckDiagnoses;
        this.actualSyntomsPossition=this.HelathCheckDiagnoses["objHRQSymptomBO"];

        localStorage.setItem('RequestId', this.HelathCheckDiagnoses['RequestId']);
        localStorage.setItem('MMAppointmentId', this.HelathCheckDiagnoses['MMAppointmentId']);
        localStorage.setItem('PAHCNumber', this.HelathCheckDiagnoses['PAHCNumber']);
        localStorage.setItem('Loginid', this.HelathCheckDiagnoses['Loginid']);
        localStorage.setItem('PatientUHID', this.HelathCheckDiagnoses['PatientUHID']);
        if (HelathCheckDiagnoses['objPatientMMInfo'] != null) {
          localStorage.setItem('HRAQuestionnaireGender', HelathCheckDiagnoses['objPatientMMInfo'].Gender);
        } else {
          localStorage.setItem('HRAQuestionnaireGender', '2');
        }
      }
    ), err => {
      alert("something went wrong!");
    };
  }
  onChange(healthdignose: string, isChecked: boolean) {
    this.dignoseFormArray = <FormArray>this.healthgroup.controls.healthdiagnose;

    if (isChecked) {
      this.dignoseFormArray.push(new FormControl(healthdignose));
    } else {
      let index = this.dignoseFormArray.controls.findIndex(x => x.value == healthdignose)
      this.dignoseFormArray.removeAt(index);
    }
    //console.log(this.dignoseFormArray);
  }
  nextClick(regionid,appid,systemid) {
    let diagnosevalueactual=[];
    this.diagnosevalue = this.healthgroup.get('healthdiagnose').value;
    if(this.diagnosevalue.length>0){
      for(let data of this.actualSyntomsPossition){
        let isExist=this.diagnosevalue.findIndex(x=>x==data.SymptomId);

        if(isExist!=-1){
          diagnosevalueactual.push(data.SymptomId);
        }
      }
    }
    this.diagnosevalue=diagnosevalueactual;
    var sd = <SelectedDiagnose>{};
    sd.RegionId = regionid;
    sd.SystemId = systemid;
    sd.SymptomIds = this.diagnosevalue.toString();
    this.position = 0;
    localStorage.setItem("apptmentId", appid);
    localStorage.setItem("regionId", regionid);
    localStorage.setItem("position", this.position);
    localStorage.setItem("symptomIds", JSON.stringify(this.diagnosevalue));
    localStorage.setItem("selecteddiagnose", JSON.stringify(sd));
    if (this.diagnosevalue.length != 0) {
      this.router.navigate(['health-risk-questionnaire/symptom']);
    } else {
      //alert('Please select atleast one condition');
      this.router.navigate(['/health-risk-questionnaire/smoke']);
    }
  }

}
