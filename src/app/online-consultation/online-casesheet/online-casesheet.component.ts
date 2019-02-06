import { Component, OnInit, ViewEncapsulation, AfterViewInit, TemplateRef, OnDestroy } from '@angular/core';
import {
  Router, Params, UrlTree, UrlSegmentGroup, NavigationEnd,
  UrlSegment, PRIMARY_OUTLET, ActivatedRoute
} from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { CommonService } from '@aa/services/common.service';
import { UtilsService } from '@aa/services/utils.service';
import { SearchService, boilerContent } from '@aa/services/search.service';

import { hospital } from '@aa/structures/hospital.interface';
import { doctorC } from '@aa/structures/doctor.interface';
import { trend } from '@aa/structures/city.interface';
import { AAAuthService } from '@aa/services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FormArray, FormControl } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UHID, UserInfo } from '@aa/structures/user.interface';
import * as moment from 'moment';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { UserService } from '@aa/services/user.service';
import { BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import * as $ from 'jquery';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap';
import { DatePipe } from '@angular/common';
import { GenderPipe } from '../../pipes/gender.pipe';

//declare var $: any;

// interface for breadcrumbs 
export interface bc {
  name: string,
  url: string
}
@Component({
  selector: 'app-online-casesheet',
  templateUrl: './online-casesheet.component.html',
  styleUrls: ['./online-casesheet.component.scss'],
  providers: [GenderPipe]
})
export class OnlineCasesheetComponent implements OnInit {

  dpopen = false;
  bsConfig: Partial<BsDatepickerConfig>;
  minDate: Date;
  maxDate: Date;

  @ViewChild(BsDatepickerDirective) datepicker: BsDatepickerDirective;
  showStep2: boolean = false;

  AppointmentDocInfo: any = {
    doctorname: '',
    AppointmentDate: '',
    AppointmentTime: '',
    Category: '',
    VisitId: "",
    patientID: "",
    FirstName: "",
    LastName: "",
    registration_date: "",
    Mobile: "",
    Email: "",
    Gender: "",
    DOB: ""
  }

  AppointmentPatientInfo: any = {
    firstName: '',
    lastName: '',
    dob: '',

    type: 'self',
    age: '',
    patientUHID: "Not sure.. proceed!",
    gender: 'Male',
    height: '',
    weight: '',
    heightText: 'select height',
    weightText: 'select weight',

    isSmoker: 'No',
    howmanycigarretesyousmokeDaily: 'Select',
    smokingsincehowmanyYears: 'Select',
    whendidyoustoppedSmoking: 'Select',
    howManyCigarretesperDay: 'Select',
    howManyYearsSmoked: 'Select',
    howFrequentlySmoke: '',

    isDrinker: 'No',
    howlongUrDrinking: 'Select',
    HowFrequentlyDrink: '',
    whendidyoustoppedDrinking: 'Select',

    Diet: 'Non Veg',
    doyouExcerciseDaily: 'No',
    whichExcersize: '',
    howManyDaysInaWeek: '',
    howMuchTimePerDay: '',

    hypertension: '',
    diabeties: '',
    heartDisease: '',
    anemia: '',
    cancer: '',

    hypertensioninFamily: '',
    diabetiesinFamily: '',
    heartDiseaseinFamily: '',
    anemiainFamily: '',
    cancerinFamily: '',

    bmi: '',
    city: '',
    pastHistory: 'No',
    presentComplains: '',
    isCaseSheetSubmitted: '',
    isMedication: 'No',
    isAllergetic: 'No',
    presentMedicationObject: [],
    presentComplaintsObject: [],
    allergiesObject: [],
    OtherpresentComplaints: '',
    OtherAllergies: ''
  }
  AddRelativeInfo: any = {
    Name: '',
    relationship: '',
    dateofBirth: '',
    gender: '',
    city: ''
  }
  casesheetSymptoms = [];
  dropdownList = [];
  selectedAllergies = [];
  dropdownSettings = {};
  Allergies = [];
  selectedFile: File = null;
  response: any;
  uploadedDocuments = [];

  addmember: FormGroup;
  relationshipTypes: any;
  addMemberResponse: any;
  private base64textString: String = "";
  day: any;
  month: any;
  year: any;
  age: any;
  public now: Date = new Date();
  modalRef: BsModalRef;
  submitResponse: string;
  submitResponseData: string;
  isConsentUploaded: boolean;
  isSymptomsEmpty: boolean;
  isSymptomsOthersDisplay: boolean;
  isValid: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private frmbuilder: FormBuilder,
    private cs: CommonService,
    private us: UtilsService,
    private srs: SearchService,
    private route: ActivatedRoute,
    private aaa: AAAuthService,
    private router: Router,
    private spinnerService: Ng4LoadingSpinnerService,
    private userService: UserService,
    private gender: GenderPipe,
    private _datePipe: DatePipe,
    private modalService: BsModalService) {
    this.addmember = frmbuilder.group({
      relationFirstName: ['', Validators.compose([Validators.required, Validators.maxLength(50),])],
      relationLastName: ['', Validators.compose([Validators.required, Validators.maxLength(50),])],
      dob: ['', Validators.compose([Validators.required])],
      gender: ['', Validators.compose([Validators.required])],
      relationId: ['', Validators.compose([Validators.required])],
      createdDate: [''],
      imageName: [''],
      filecontent: [''],
      filename: [''],
      fileext: [''],
      age: ['']
    });
  }

  prepareEmptyPendingCasehhet() {
    this.userData = this.aaa.getuserInfo();

    this.AppointmentPatientInfo = {
      firstName: this.userData.firstName,
      lastName: this.userData.lastName,
      dob: this.userData.dateofBirth,

      type: 'self',
      age: '',
      patientUHID: "Not sure.. proceed!",
      gender: this.gender.transform(this.userData.gender),
      height: '',
      weight: '',
      heightText: 'select height',
      weightText: 'select weight',

      isSmoker: 'No',
      howmanycigarretesyousmokeDaily: 'Select',
      smokingsincehowmanyYears: 'Select',
      whendidyoustoppedSmoking: 'Select',
      howManyCigarretesperDay: 'Select',
      howManyYearsSmoked: 'Select',
      howFrequentlySmoke: '',

      isDrinker: 'No',
      howlongUrDrinking: 'Select',
      HowFrequentlyDrink: '',
      whendidyoustoppedDrinking: 'Select',

      Diet: 'Non Veg',
      doyouExcerciseDaily: 'No',
      whichExcersize: '',
      howManyDaysInaWeek: '',
      howMuchTimePerDay: '',

      hypertension: '',
      diabeties: '',
      heartDisease: '',
      anemia: '',
      cancer: '',

      hypertensioninFamily: '',
      diabetiesinFamily: '',
      heartDiseaseinFamily: '',
      anemiainFamily: '',
      cancerinFamily: '',

      bmi: '',
      city: '',
      pastHistory: 'No',
      presentComplains: '',
      isCaseSheetSubmitted: '',
      isMedication: 'No',
      isAllergetic: 'No',
      presentMedicationObject: [],
      presentComplaintsObject: [],
      allergiesObject: [],
      OtherpresentComplaints: '',
      OtherAllergies: ''
    }
  }
  specialitySymptoms = [];
  availableRelatives = [];
  selectedRelative = {} as UHID;
  showRelativesFlag: boolean = false;
  feetData = [];
  weightData = [];
  cigarDrinkData = [];
  showRelatives() {
    if (this.availableRelatives.length > 0) {
      this.showRelativesFlag = true;
      this.selectedRelative = this.availableRelatives[0];
      this.AppointmentPatientInfo.firstName = this.selectedRelative.firstName;
      this.AppointmentPatientInfo.lastName = this.selectedRelative.lastName;
      this.AppointmentPatientInfo.dob = this.selectedRelative.dob;
      this.AppointmentPatientInfo.gender = this.gender.transform(this.selectedRelative.gender);

    } else {

      this.AppointmentPatientInfo.type = "Self";
      alert('No relatives found');
      return false;
    }

  }

  setHavYouVisited(uhid: any) {
    if (uhid == undefined || uhid == null || uhid == "") {
      return "No";
    }
    // let userInfo = this.aaa.getuserInfo();

    // if (userInfo.uhid == uhid) {
    //   return "No";
    // }
    let rUhid = this.availableUHIDSelf.filter(u => {
      return u.uhid == uhid;
    })[0];
    this.showUhids();
    this.selectedUHIDSelf = rUhid;

    return "Yes";
  }

  setAppointmentType(relationId: any) {
    if (relationId == undefined || relationId == null || relationId == "" || relationId == "0") {
      return "Self";
    }

    let rUhid = this.availableRelatives.filter(u => {
      return u.patRelationId == relationId;
    })[0];
    this.showRelatives();
    this.selectedRelative = rUhid;
    this.AppointmentPatientInfo.firstName = this.selectedRelative.firstName;
    this.AppointmentPatientInfo.lastName = this.selectedRelative.lastName;
    this.AppointmentPatientInfo.dob = this.selectedRelative.dob;
    this.AppointmentPatientInfo.gender = this.gender.transform(this.selectedRelative.gender);
    return "Relative";
  }

  getAllRelations() {
    this.availableRelatives = [];
    this.aaa.getAllFamilyMembersDataForBooking().subscribe(
      (data: any) => {


        if (data != null) {
          if (data.Result != undefined && data.Result != null) {
            let res = JSON.parse(data.Result);

            for (let d of res) {
              let uhidData: UHID = {
                firstName: d.FirstName + " ",
                lastName: d.LastName,
                uhid: d.Uhid == null ? '---' : d.Uhid,
                email: this.userData.email,
                gender: d.Gender == null ? '---' : d.Gender,
                mobileNumber: this.userData.mobileNumber,
                dob: this.formateDate(d.Dob),
                isRelation: true,
                patRelationId: d.PatRelationId
              }
              this.availableRelatives.push(uhidData);
              this.selectedRelative = this.availableRelatives[0];
              this.AppointmentPatientInfo.firstName = this.selectedRelative.firstName;
              this.AppointmentPatientInfo.lastName = this.selectedRelative.lastName;
              this.AppointmentPatientInfo.dob = this.selectedRelative.dob;
              this.AppointmentPatientInfo.gender = this.gender.transform(this.selectedRelative.gender);
            }
          }

        }
        // this.getSignUserUhids();
      });

  }
  setType(type: string) {
    this.AppointmentPatientInfo.type = type;
    if (type === 'Self') {
      this.AppointmentPatientInfo.firstName = this.userData.firstName;
      this.AppointmentPatientInfo.lastName = this.userData.lastName;
      this.AppointmentPatientInfo.dob = this.userData.dateofBirth;
      this.AppointmentPatientInfo.gender = this.gender.transform(this.userData.gender);
      this.AppointmentPatientInfo.patientUHID = 'Not sure.. proceed!';
      this.AppointmentPatientInfo.relationId = '';
    } else if (type === 'Relative') {
      //this.AppointmentPatientInfo.patientUHID = 'Add New';
      this.getAllRelations();
      // this.AppointmentPatientInfo.firstName = this.selectedRelative.firstName;
      // this.AppointmentPatientInfo.lastName = this.selectedRelative.lastName;
      // this.AppointmentPatientInfo.dob = this.selectedRelative.dob;
      // this.AppointmentPatientInfo.gender = this.gender.transform(this.selectedRelative.gender);
    }

  }
  setRelative(uhid: any) {
    this.selectedRelative = uhid;
    this.AppointmentPatientInfo.patientUHID = uhid.uhid;
    this.AppointmentPatientInfo.firstName = uhid.firstName;
    this.AppointmentPatientInfo.lastName = uhid.lastName;
    this.AppointmentPatientInfo.dob = uhid.dob;
    this.AppointmentPatientInfo.gender = this.gender.transform(uhid.gender);
  }

  removeRelative() {
    this.showRelativesFlag = false;
  }

  getSignUserUhids() {

    this.availableUHIDSelf = [];
    this.aaa.loadingShow('loadingid');
    this.aaa.getUhidsUsingPrism().subscribe(
      (data: any) => {

        this.aaa.loadingHide('loadingid');
        this.getPendingCasesheet();
        if (data != null) {

          let userData = data;
          if (userData[0] != null && userData[0].UserData != null &&
            userData[0].UserData.response != null
            && userData[0].UserData.response.signUpUserData != null
            && userData[0].UserData.response.signUpUserData.length > 0) {

            for (let d of userData[0].UserData.response.signUpUserData) {
              if (d.UHID != null && d.UHID != "") {
                let uhidData: UHID = {
                  firstName: d.FirstName,
                  lastName: d.LastName,
                  uhid: d.UHID,
                  email: d.EMail == null ? '---' : d.EMail,
                  gender: d.Gender == null ? '---' : d.Gender,
                  mobileNumber: d.MobileNumber == null ? '---' : d.MobileNumber,
                  dob: this.formateDate(d.DateOfBirth),// d.DateOfBirth == null ? '---' : d.DateOfBirth,
                  isRelation: false
                }
                this.availableUHIDSelf.push(uhidData);
              }
            }
          }
        }
      }), err => {
        this.aaa.loadingHide('loadingid');
        this.getPendingCasesheet();
      };;

  }

  setUHIDSelf(uhid: UHID) {
    this.selectedUHIDSelf = uhid;
    this.AppointmentPatientInfo.patientUHID = uhid.uhid;
  }

  showUhids() {
    if (this.availableUHIDSelf.length > 0) {
      this.showSelfUhid = true;
      this.selectedUHIDSelf = this.availableUHIDSelf[0];
    } else {

      this.AppointmentPatientInfo.pastHistory = "No";
      alert('Uhid not found');
      return false;
    }

  }

  removeUhids() {
    this.showSelfUhid = false;
    this.AppointmentPatientInfo.pastHistory = "No";
  }

  getBMI(weight: any, height: any) {

    if (weight == undefined || weight == null || weight == "" ||
      height == undefined || height == null || height == ""
    ) {
      return 0;
    }
    if (isNaN(weight)) {
      return 0;
    }

    if (isNaN(height)) {
      return 0;
    }

    var bmi = ((weight / Math.pow(height, 2)) * 703);
    return bmi.toFixed(2);
  }

  getPendignCaseSheetInfo() {

    this.aaa.getPendingCaseSheet().subscribe(t => {
      this.aaa.loadingHide('loadingid');
      if (t.ResponceCode == "0" && t.Result != "") {
        var apointinfo = JSON.parse(t.Result);
        this.AppointmentDocInfo = apointinfo[0];
        this.getReports();
        this.aaa.loadingShow('loadingid');
        this.aaa.getNewPendingCaseSheetAllDetails(this.AppointmentDocInfo.VisitId).subscribe(t => {
          this.aaa.loadingHide('loadingid');
          if (t.ResponceCode == "0" && t.Result != undefined && t.Result != null && t.Result != "" && t.Result != "[]") {
            let cInfo = JSON.parse(t.Result);

            if (cInfo.length > 0) {
              let pIngo = cInfo[0];


              // let pInfp = pIngo.PersonalHistory.toString().includes(',') ? pIngo.PersonalHistory.split(',') : '';
              // let ageA = (pIngo.PersonalHistory.toString().includes(',') && pInfp[0].toString().includes(':')) ? pInfp[0].split(':') : '';
              // let agel = (pIngo.PersonalHistory.toString().includes(',') && pInfp[0].toString().includes(':')) ? ageA[1] : '';

              // let genderA = (pIngo.PersonalHistory.toString().includes(',') && pInfp[0].toString().includes(':')) ? pInfp[1].split(':') : '';
              // let genderl = (pIngo.PersonalHistory.toString().includes(',') && pInfp[0].toString().includes(':')) ? genderA[1] : '';

              this.AppointmentPatientInfo = {
                firstName: this.userData.firstName,
                lastName: this.userData.lastName,
                dob: this.userData.dateofBirth,
                type: this.setAppointmentType(pIngo.RelationId),
                height: pIngo.Height,
                heightText: (pIngo.Height == "" || pIngo.Height == null) ? "select height" : pIngo.Height,
                weight: pIngo.Weight,
                weightText: (pIngo.Weight == "" || pIngo.Weight == null) ? "select weight" : pIngo.Weight + " kg",

                isSmoker: (pIngo.IsSmoker == "" || pIngo.IsSmoker == null) ? "No" : pIngo.IsSmoker,
                howmanycigarretesyousmokeDaily: 'Select',
                smokingsincehowmanyYears: 'Select',
                whendidyoustoppedSmoking: (pIngo.smokingstoppeddate == "" || pIngo.smokingstoppeddate == null) ? "Select" : pIngo.smokingstoppeddate,
                howManyCigarretesperDay: (pIngo.Howmanycigeratesperday == "" || pIngo.Howmanycigeratesperday == null) ? "Select" : pIngo.Howmanycigeratesperday,
                howManyYearsSmoked: (pIngo.Howmanyyearssmoked == "" || pIngo.Howmanyyearssmoked == null) ? "Select" : pIngo.Howmanyyearssmoked,
                howFrequentlySmoke: (pIngo.HowFrequentlySmoke == "" || pIngo.HowFrequentlySmoke == null) ? "" : pIngo.HowFrequentlySmoke,

                isDrinker: (pIngo.IsDrinker == "" || pIngo.IsDrinker == null) ? "No" : pIngo.IsDrinker,
                howlongUrDrinking: (pIngo.HowlongUrDrinking == "" || pIngo.HowlongUrDrinking == null) ? "Select" : pIngo.HowlongUrDrinking,
                HowFrequentlyDrink: (pIngo.HowFrequentlyDrink == "" || pIngo.HowFrequentlyDrink == null) ? "" : pIngo.HowFrequentlyDrink,
                whendidyoustoppedDrinking: (pIngo.Whendidyoustoppeddrinking == "" || pIngo.Whendidyoustoppeddrinking == null) ? "Select" : pIngo.Whendidyoustoppeddrinking,

                Diet: (pIngo.Dite == "" || pIngo.Dite == null) ? "Non Veg" : pIngo.Dite,
                doyouExcerciseDaily: (pIngo.DoyouExcerciseDaily == "" || pIngo.DoyouExcerciseDaily == null) ? "No" : pIngo.DoyouExcerciseDaily,
                whichExcersize: '',
                howManyDaysInaWeek: '',
                howMuchTimePerDay: '',

                hypertension: (pIngo.Hypertension == "" || pIngo.Hypertension == null) ? "" : pIngo.Hypertension,
                diabeties: (pIngo.Diabeties == "" || pIngo.Diabeties == null) ? "" : pIngo.Diabeties,
                heartDisease: (pIngo.HeartDisease == "" || pIngo.HeartDisease == null) ? "" : pIngo.HeartDisease,
                anemia: (pIngo.Anemia == "" || pIngo.Anemia == null) ? "" : pIngo.Anemia,
                cancer: (pIngo.Cancer == "" || pIngo.Cancer == null) ? "" : pIngo.Cancer,

                hypertensioninFamily: (pIngo.HypertensioninFamily == "" || pIngo.HypertensioninFamily == null) ? "" : pIngo.HypertensioninFamily,
                diabetiesinFamily: (pIngo.DiabetiesinFamily == "" || pIngo.DiabetiesinFamily == null) ? "" : pIngo.DiabetiesinFamily,
                heartDiseaseinFamily: (pIngo.HeartDiseaseinFamily == "" || pIngo.HeartDiseaseinFamily == null) ? "" : pIngo.HeartDiseaseinFamily,
                anemiainFamily: (pIngo.AnemiainFamily == "" || pIngo.AnemiainFamily == null) ? "" : pIngo.AnemiainFamily,
                cancerinFamily: (pIngo.CancerinFamily == "" || pIngo.CancerinFamily == null) ? "" : pIngo.CancerinFamily,

                patientUHID: pIngo.Uhid == "" ? "Not sure.. proceed!" : pIngo.Uhid,
                presentComplains: pIngo.PresentComplains,
                age: '',//agel,
                gender: pIngo.Gender,
                isCaseSheetSubmitted: pIngo.IsCaseSheetSubmitted,
                presentMedicationObject: (pIngo.PresentMedicationObject === "[]" || pIngo.PresentMedicationObject === null || pIngo.PresentMedicationObject === "") ? [] : JSON.parse(pIngo.PresentMedicationObject),
                allergiesObject: (pIngo.AllergiesObject === "[]" || pIngo.AllergiesObject === null || pIngo.AllergiesObject === "") ? [] : JSON.parse(pIngo.AllergiesObject),
                city: pIngo.City,
                pastHistory: this.setHavYouVisited(pIngo.PatientUHID),
                bmi: this.getBMI(pIngo.Weight, pIngo.Height),
                presentComplaintsObject: (pIngo.PresentComplainsObject === "[]" || pIngo.PresentComplainsObject == null || pIngo.PresentComplainsObject === "") ? [] : JSON.parse(pIngo.PresentComplainsObject),
                isMedication: (pIngo.PresentMedicationObject === "[]" || pIngo.PresentMedicationObject === null || pIngo.PresentMedicationObject === "") ? "No" : "Yes",
                isAllergetic: (pIngo.AllergiesObject === "[]" || pIngo.AllergiesObject === null || pIngo.AllergiesObject === "") ? "No" : "Yes",
                OtherpresentComplaints: '',
                OtherAllergies: ''
              }

              // console.log(this.AppointmentPatientInfo);
              this.selectedAllergies = this.AppointmentPatientInfo.allergiesObject;

              if (this.AppointmentPatientInfo.allergiesObject.length > 0) {
                for (let m of this.AppointmentPatientInfo.allergiesObject) {
                  if (m.item_id == '0') {
                    this.AppointmentPatientInfo.OtherAllergies = m.item_description;
                    break;
                  }
                }
              }
              if (this.AppointmentPatientInfo.presentComplaintsObject.length > 0) {
                for (let m of this.AppointmentPatientInfo.presentComplaintsObject) {
                  if (m.symptomsId == '0') {
                    this.AppointmentPatientInfo.OtherpresentComplaints = m.symptomsdescription;
                    break;
                  }
                }
              }
              if (this.AppointmentPatientInfo.presentMedicationObject.length > 0) {
                // this.initialMedication();
                // this.medications.push(this.AppointmentPatientInfo.presentMedicationObject);
                for (let m of this.AppointmentPatientInfo.presentMedicationObject) {
                  let patdate = moment(m.started, "MM/DD/YYYY").format('MM/DD/YYYY');
                  let initial = { index: m.index, medicine: m.medicine, dosage: m.dosage, started: patdate };
                  this.medications.push(initial);
                }
              }
              // else
              //   this.initialMedication();
            } else {
              this.prepareEmptyPendingCasehhet();
            }
          } else {
            this.prepareEmptyPendingCasehhet();
          }
          this.getSpecialitySymptomsForSourceApp();
          this.loadAllergies();
        });
      }
    })
  }

  ngOnInit() {
    this.maxDate = new Date();
    this.aaa.loadingShow('loadingid');

    if (this.aaa.location === "International") {
      $('#dvInternational').show();
    }
    this.userData = this.aaa.getuserInfo();
    this.AppointmentPatientInfo.firstName = this.userData.firstName;
    this.AppointmentPatientInfo.lastName = this.userData.lastName;
    this.AppointmentPatientInfo.dob = this.userData.dateofBirth;
    this.AppointmentPatientInfo.gender = this.gender.transform(this.userData.gender);

    this.initialMedication();
    this.us.setActiveTab(this.us.TAB_ONLINE_CONSULTATION);
    var params = {};
    var queryString = window.location.href;
    var regex = /([^&=]+)=([^&]*)/g;
    var m;
    let fssResponsecode = this.activatedRoute.snapshot.queryParamMap.get("responsecode");


    while (m = regex.exec(queryString)) {
      params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    let visitId = "1";
    let paymantError = "Payment error";
    // FSS failure handling
    if (params["visitid"] != undefined && params["visitid"] != null) {
      visitId = params["visitid"];
      this.AppointmentDocInfo.VisitId = visitId;
    }
    if (params["visitId"] != undefined && params["visitId"] != null) {
      visitId = params["visitId"];
      this.AppointmentDocInfo.VisitId = visitId;
    }
    this.getAllRelations();
    this.getSignUserUhids();
    if (visitId == "0") {
      if (params["ResponseMessage"] != undefined && params["ResponseMessage"] != null) {
        paymantError = params["ResponseMessage"];
        alert(paymantError);

      }
      // FSS failure handling
      if (fssResponsecode == "0") {
        alert(this.activatedRoute.snapshot.queryParamMap.get("responsemessage"))
      }


      let uri = localStorage.getItem('dsuri');
      window.location.href = uri;
    } else {
      // this.getSpecialitySymptomsForSourceApp();
      // this.getAllRelations();
      //this.loadAllergies();


      //this.getPendingCasesheet();
      this.miltiSelectDropSettings();
    }

    this.feetData = [];
    for (let feet = 1; feet <= 9; feet++) {
      for (let inches = 0; inches <= 11; inches++) {
        this.feetData.push({ ft: feet, in: inches });
      }
    }
    this.weightData = [];
    for (let wht = 1; wht <= 250; wht++) {
      this.weightData.push({ wt: wht });
    }

    this.cigarDrinkData = [];
    for (let cig = 1; cig <= 10; cig++) {
      if ((cig % 2) === 0)
        this.cigarDrinkData.push({ cg: (cig !== 10 ? cig : (cig.toString() + '+')) });
    }

    // default gender set to Male
    this.addmember.get('gender').setValue('M');

    localStorage.setItem("paymentDone", "true");
    // this.lmsLog();
    this.getRelationData();
  }
  getRelationData() {
    // get the relationship data  -- end
    this.userService.getRelationshipsData()
      .subscribe(
        (data: any) => {
          //this.aaa.loadingHide('loadingid');
          //console.error(data);
          this.relationshipTypes = JSON.parse(data.Result);
          //console.error(this.relationshipTypes);

        }
      ), err => {
        //this.aaa.loadingHide('loadingid');
        alert("something went wrong!");
      };
  }
  ngAfterViewInit() {
    var self = this;
    $(document).ready(function () {
      let current: number; current = 1;
      let current_step: any;
      let next_step: any;
      let steps: number;

      steps = $("fieldset").length;
      $(".next-call").click(function () {

        current_step = $(this).parents("fieldset");
        next_step = $(this).parents("fieldset").next();
        next_step.show();
        current_step.hide();
        setProgressBar(++current);
      });
      $(".next").click(function () {
        self.setValidation(current);
        if (self.isValid) {
          current_step = $(this).parent().parent();
          next_step = $(this).parent().parent().next();
          next_step.show();
          current_step.hide();
          setProgressBar(++current);
        }
      });
      $(".previous").click(function () {

        current_step = $(this).parent().parent();
        next_step = $(this).parent().parent().prev();
        next_step.show();
        current_step.hide();
        setProgressBar(--current);
      });
      $("#callfldsetPersonalinfo").click(function () {

        current_step = $(this).parent().parent();
        // next_step = $(this).parent().parent().prev();
        // next_step.show();
        $("#fldsetPersonalinfo").show();
        current_step.hide();
        current = 2;
        setProgressBar(--current);
      });
      $("#callfldsetHabbits").click(function () {

        current_step = $(this).parent().parent();
        // next_step = $(this).parent().parent().prev();
        // next_step.show();
        $("#fldsetHabbits").show();
        current_step.hide();
        current = 3;
        setProgressBar(--current);
      });
      $("#callfldsetSymptoms").click(function () {

        current_step = $(this).parent().parent();
        // next_step = $(this).parent().parent().prev();
        // next_step.show();
        $("#fldsetSymptoms").show();
        current_step.hide();
        current = 4;
        setProgressBar(--current);
      });
      $("#callfldsetMedication").click(function () {

        current_step = $(this).parent().parent();
        // next_step = $(this).parent().parent().prev();
        // next_step.show();
        $("#fldsetMedication").show();
        current_step.hide();
        current = 5;
        setProgressBar(--current);
      });
      $("#callfldsetAllergies").click(function () {

        current_step = $(this).parent().parent();
        // next_step = $(this).parent().parent().prev();
        // next_step.show();
        $("#fldsetAllergies").show();
        current_step.hide();
        current = 6;
        setProgressBar(--current);
      });
      $("#callfldsetHistory").click(function () {

        current_step = $(this).parent().parent();
        // next_step = $(this).parent().parent().prev();
        // next_step.show();
        $("#fldsetHistory").show();
        current_step.hide();
        current = 7;
        setProgressBar(--current);
      });
      $("#callfldsetReports").click(function () {

        current_step = $(this).parent().parent();
        // next_step = $(this).parent().parent().prev();
        // next_step.show();
        $("#fldsetReports").show();
        current_step.hide();
        current = 8;
        setProgressBar(--current);
      });
      setProgressBar(current);
      // Change progress bar action
      function setProgressBar(curStep) {
        let percent: number;
        percent = parseFloat((100 / steps).toString()) * curStep;
        percent = Number(percent.toFixed());
        $(".progress-bar")
          .css("width", percent + "%")
          .html(percent + "%");

        if (percent >= 90) {
          // alert("Hi");
          $(".progress-bar").addClass("progress-bar-success");
          $(".progress-bar").removeClass("progress-bar-info");
          $(".progress-bar").removeClass("progress-bar-warning");
        }

        else {
          if (percent >= 35) {
            // alert("Hi");
            $(".progress-bar").addClass("progress-bar-warning");
            $(".progress-bar").removeClass("progress-bar-info");
            $(".progress-bar").removeClass("progress-bar-success");
          }
          else {
            $(".progress-bar").addClass("progress-bar-info");
            $(".progress-bar").removeClass("progress-bar-warning");
            $(".progress-bar").removeClass("progress-bar-success");

          }
        }
      }

      // submit message view
      $("#regiration_form").submit(function (event) {
        $('.alert-success').removeClass('hide').html("Handler for .submit() called and see console logs for your posted variable");
        //console.log($(this).serialize());
        event.preventDefault();
      });

      //Medication clone function
      function clone() {
        $(this).parents(".repeat-row").clone()
          .appendTo(".repeat-cont")
          .on('click', '.clone-btn', clone)
          .on('click', '.remove-btn', remove);
      }
      function remove() {
        $(this).parents(".repeat-row").remove();
      }
      // $(".clone-btn").on("click", clone);
      // $(".remove-btn").on("click", remove);
    });
  }
  //LMS log
  payDetails: any;
  lmsLog() {

    this.payDetails = localStorage.getItem("totalDetails");
    this.payDetails = JSON.parse(this.payDetails);
    this.payDetails.walletApplied = (this.payDetails.walletApplied == null ? false : this.payDetails.walletApplied);
    if (this.payDetails.walletApplied == true && this.payDetails.walletApplied !== null) {
      let params =
      {

        "Email": this.payDetails.EmailId,
        "MobileNo": this.payDetails.MobileNo,
        "RedeemRequestId": this.payDetails.RedeemRequestId,
        "CreditPoints": this.payDetails.walletAmount.toString(),
        "VoucherCode": "",
        "VoucherID": "",
        "IntermAppId": this.payDetails.blockId
      }
      this.aaa.lmssubmission(params).subscribe(data => {
        //console.log(data);
      })
    }
  }

  getPendingCasesheet() {
    this.aaa.loadingShow('loadingid');
    this.aaa.getPendingCaseSheet().subscribe(t => {
      if (t.ResponceCode == "0" && t.Result != "" && t.Result != "[]") {
        this.getPendignCaseSheetInfo();
      } else {
        this.aaa.loadingHide('loadingid');
        this.prepareEmptyPendingCasehhet();
        let appointmentInfo = JSON.parse(localStorage.getItem('onlineslotDetails'));
        if (appointmentInfo) {
          this.AppointmentDocInfo.doctorname = appointmentInfo.docName;
          this.AppointmentDocInfo.AppointmentDate = appointmentInfo.date;
          this.AppointmentDocInfo.AppointmentTime = appointmentInfo.timeSlot;
          this.AppointmentDocInfo.Category = appointmentInfo.mode;
          this.AppointmentDocInfo.VisitId = 0;
          this.AppointmentDocInfo.Speciality = appointmentInfo.docSpeciality;
          this.AppointmentDocInfo.SpecialityId = appointmentInfo.docSpecialityId;
          this.AppointmentDocInfo.location = appointmentInfo.docCity;
          this.AppointmentDocInfo.fee = appointmentInfo.fee;
          this.AppointmentDocInfo.feeType = appointmentInfo.feeType;
          this.AppointmentDocInfo.afterDiscount = appointmentInfo.fee;
        }
        this.getSpecialitySymptomsForSourceApp();
        this.loadAllergies();
      }
    });
  }

  miltiSelectDropSettings() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      //selectAllText: 'Select All',
      //unSelectAllText: 'UnSelect All',
      //itemsShowLimit: 3,
      allowSearchFilter: false,
      enableCheckAll: false
    };
  }

  loadAllergies() {
    this.Allergies = [
      { item_id: 1, item_text: 'Food', item_description: '', status: false },
      { item_id: 2, item_text: 'Medicine', item_description: '', status: false },
      { item_id: 3, item_text: 'Air borne allergies', item_description: '', status: false },
      { item_id: 4, item_text: 'Seasonal Variations', item_description: '', status: false },
      { item_id: 5, item_text: 'Latex or any substance you touch', item_description: '', status: false },
      { item_id: 0, item_text: 'Others', item_description: '', status: false },
    ];
    if (this.AppointmentPatientInfo.allergiesObject.length > 0) {
      for (let d of this.Allergies) {
        for (let c of this.AppointmentPatientInfo.allergiesObject) {
          if (d.item_id === c.item_id) {
            d.status = c.status;
            if (c.item_id === '0') {
              this.AppointmentPatientInfo.OtherAllergies = c.item_description;
            }
          }
        }
      }
    }
  }

  medications = [];

  initialMedication() {
    let initial = { index: 0, medicine: '', dosage: 'Dosage', started: '' };
    this.medications.push(initial);

    // let initial1 = { index: 1, medicine: 'Dart', dosage: 'Thrice in a day', started: '' };
    // this.medications.push(initial1);
    // console.log(this.medications)
  }

  addMedication(ln: any) {

    let med: any;
    med = this.medications;
    if (med[0].medicine != '' && med[0].dosage != 'Dosage' && med[0].started != '') {


      this.medications = [];
      this.AppointmentPatientInfo.presentMedicationObject = [];
      let initial = { index: this.medications.length, medicine: '', dosage: 'Dosage', started: '' };
      this.medications.push(initial);
      for (let j = 0; j < med.length; j++) {
        med[j].index = (j + 1);
        let patdate = moment(med[j].started, "MM/DD/YYYY").format('MM/DD/YYYY');
        med[j].started = patdate;
        this.medications.push(med[j]);
        this.AppointmentPatientInfo.presentMedicationObject.push(med[j]);
      }
    }
  }

  deleteMedication(index: any) {


    if (confirm('Are you sure you want to delete medication')) {
      // this.medications = this.medications.filter(m => {
      //   return m.index != index;
      // });
      let med: any;

      med = this.medications;

      this.medications = [];
      this.AppointmentPatientInfo.presentMedicationObject = [];
      let initial = { index: this.medications.length, medicine: '', dosage: 'Dosage', started: '' };
      this.medications.push(initial);
      let i: number = 0;

      for (let j = 0; j < med.length; j++) {

        if (med[j].index != index && med[j].index != 0) {
          med[j].index = (i + 1);
          this.medications.push(med[j]);
          if (med[j].index != 0)
            this.AppointmentPatientInfo.presentMedicationObject.push(med[j]);
          i++;
        }
      }
    }



  }

  onItemSelect(item: any) {
    //console.log(item);
  }

  onSelectAll(items: any) {
    //console.log(items);
  }

  setHeight(height: any, inch: any) {
    this.AppointmentPatientInfo.height = height + ' Foot' + inch + ' inch';
    this.AppointmentPatientInfo.heightText = height + ' Foot' + inch + ' inch';
    this.AppointmentPatientInfo.bmi = this.getBMI(this.AppointmentPatientInfo.weight, this.AppointmentPatientInfo.height);

  }

  setWeight(weight: any) {
    this.AppointmentPatientInfo.weight = weight;
    this.AppointmentPatientInfo.weightText = weight + " kg";
    this.AppointmentPatientInfo.bmi = this.getBMI(this.AppointmentPatientInfo.weight, this.AppointmentPatientInfo.height);
  }

  setcigarDrinkData(key: string, value: any) {

    // if (key == 'howmanycigarretesyousmokeDaily') {
    //   this.AppointmentPatientInfo.howmanycigarretesyousmokeDaily = value;
    // } else if (key == 'smokingsincehowmanyYears') {
    //   this.AppointmentPatientInfo.smokingsincehowmanyYears = value;
    // } else 
    if (key == 'whendidyoustoppedSmoking') {
      this.AppointmentPatientInfo.whendidyoustoppedSmoking = value;
    } else if (key == 'howManyCigarretesperDay') {
      this.AppointmentPatientInfo.howManyCigarretesperDay = value;
    } else if (key == 'howManyYearsSmoked') {
      this.AppointmentPatientInfo.howManyYearsSmoked = value;
    } else if (key == 'howlongUrDrinking') {
      this.AppointmentPatientInfo.howlongUrDrinking = value;
    } else if (key == 'whendidyoustoppedDrinking') {
      this.AppointmentPatientInfo.whendidyoustoppedDrinking = value;
    }
  }

  formateDate(date: any) {
    // 
    if (date == null) {
      return "16/05/1990";
    }
    if (date == '') {
      return "16/05/1990";
    }

    if (date.indexOf('/Date') >= 0) {
      return "16/05/1990";
    }
    return date;

  }

  showUhidOfRelative: boolean = false;
  selectedUHID = {} as UHID;
  availableUHIDs = [];
  userData: UserInfo;

  selectedUHIDSelf = {} as UHID;
  availableUHIDSelf = [];
  showSelfUhid: boolean = false;


  showSetepTwo() {
    this.showStep2 = !this.showStep2;
  }

  saveAndSubmit() {
    if (this.aaa.location === 'International') {
      if (this.isConsentUploaded == false) {
        alert('Please download and upload a duly signed consent form (By the Patient or the Patient’s Relative)');
        return;
      }
    }
    if (this.AppointmentPatientInfo.type == '' ||
      //this.AppointmentPatientInfo.age.trim() == '' ||
      this.AppointmentPatientInfo.gender == '' ||
      this.AppointmentPatientInfo.heightText == 'select height' ||
      this.AppointmentPatientInfo.weightText == 'select weight' ||
      this.AppointmentPatientInfo.city == '' || this.AppointmentPatientInfo.city == null ||
      this.AppointmentPatientInfo.presentComplaintsObject.length == 0
    ) {
      alert('Please fill mandatory fields');
      return;
    }

    if (this.AppointmentPatientInfo.isAllergetic === 'Yes') {
      if (this.AppointmentPatientInfo.allergiesObject.length == 0) {
        alert('Please fill atleast one allergy');
        return;
      }
    }
    //this.AppointmentPatientInfo.patientUHID = "";
    if (this.AppointmentPatientInfo.type == "Self") {
      this.AppointmentPatientInfo.relationId = "0";
    } else {
      this.AppointmentPatientInfo.relationId = this.selectedRelative.patRelationId;
    }

    // if (this.AppointmentPatientInfo.pastHistory == "No") {
    //   let userData = this.aaa.getuserInfo();
    //   this.AppointmentPatientInfo.patientUHID = '';
    // } else {
    //   this.AppointmentPatientInfo.patientUHID = this.selectedUHIDSelf.uhid;
    // }

    if (this.AppointmentPatientInfo.isMedication === 'Yes') {
      this.addMedication('');
      if (this.AppointmentPatientInfo.presentMedicationObject.length == 0) {
        alert('Please enter medicine details or select No');
        return;
      }
      else {
        for (let data of this.AppointmentPatientInfo.presentMedicationObject) {
          //let initial = { index: 0, medicine: '', dosage: 'Dosage', started: '' };
          let isDataMissing: boolean = false;
          if (data.medicine.trim() == '' ||
            data.dosage.trim() == 'Dosage' ||
            data.started == ''
          ) {
            isDataMissing = true;
          }

          if (isDataMissing) {

            alert('inavlid medication entered please check');
            return;
          }
        }
      }
    }

    if (this.AppointmentPatientInfo.isSmoker === 'Yes') {
      if (this.AppointmentPatientInfo.howManyCigarretesperDay === 'Select' && this.AppointmentPatientInfo.howManyYearsSmoked === 'Select') {
        alert('Please fill Smoke details or select No');
        return;
      }
    } else if (this.AppointmentPatientInfo.isSmoker === 'Not Anymore') {
      if (this.AppointmentPatientInfo.whendidyoustoppedSmoking === 'Select' && this.AppointmentPatientInfo.howManyCigarretesperDay === 'Select' && this.AppointmentPatientInfo.howManyYearsSmoked === 'Select') {
        alert('Please fill Smoke details or select No');
        return;
      }
    }

    if (this.AppointmentPatientInfo.isDrinker === 'Yes') {
      if (this.AppointmentPatientInfo.howlongUrDrinking === 'Select' && this.AppointmentPatientInfo.HowFrequentlyDrink === '') {
        alert('Please fill Alcohol consumption details or select No');
        return;
      }
    } else if (this.AppointmentPatientInfo.isDrinker === 'Not Anymore') {
      if (this.AppointmentPatientInfo.whendidyoustoppedDrinking === 'Select') {
        alert('Please fill Alcohol consumption details or select No');
        return;
      }
    }

    // this.AppointmentPatientInfo.presentMedicationObject = this.medications;
    // this.AppointmentPatientInfo.allergiesObject = this.selectedAllergies;

    // this.spinnerService.show();
    this.aaa.loadingShow('loadingid');
    this.aaa.saveAndSubmitNewCaseSheet(this.AppointmentDocInfo, this.AppointmentPatientInfo, this.selectedUHIDSelf, 'saveandsubmit').subscribe(t => {

      if (t != undefined && t != null) {
        this.aaa.loadingHide('loadingid');
        this.aaa.loadingShow('loadingid');
        if (t != undefined && t != null && t.ResponceCode == "0" && t.Result != "") {
          this.aaa.loadingHide('loadingid');
          this.submitResponse = 'Success';
          this.submitResponseData = 'Appointment created successfully';
          alert('Appointment created successfully');
          this.router.navigate(['my/dashboard-oc']);
        } else {
          this.submitResponse = 'Failure';
          this.submitResponseData = 'error while booking appointment. please try again later';
          alert('error while booking appointment. please try again later');
        }

        // let tResult = JSON.parse(t);
        // if (tResult.length >= 2) {
        //   if (tResult[0] == "ResponseCode : 0" && tResult[1] != undefined && tResult[1] != null && tResult[1] != "") {

        //     alert('Appointment created successfully');
        //     this.router.navigate(['my/dashboard-oc']);
        //   } else {
        //     alert('error while booking appointment. please try again later');
        //   }
        // } else {
        //   alert('error while booking appointment. please try again later');
        // }
      } else {
        alert('error while booking appointment. please try again later');
      }
    })
  }

  saveAsDraft() {
    this.AppointmentPatientInfo.patientUHID = "";
    if (this.AppointmentPatientInfo.type == "Self") {
      this.AppointmentPatientInfo.relationId = "0";
    } else {
      this.AppointmentPatientInfo.relationId = this.selectedRelative.patRelationId;
    }

    if (this.AppointmentPatientInfo.pastHistory == "No") {
      let userData = this.aaa.getuserInfo();
      this.AppointmentPatientInfo.patientUHID = '';
    } else {
      this.AppointmentPatientInfo.patientUHID = this.selectedUHIDSelf.uhid;
    }

    for (let data of this.medications) {
      let isDataMissing: boolean = false;
      if (data.medicine.trim() == '' ||
        data.dosage.trim() == 'Dosage' ||
        data.started == ''
      ) {
        isDataMissing = true;
      }
    }

    // this.AppointmentPatientInfo.presentMedicationObject = this.medications;
    // this.AppointmentPatientInfo.allergiesObject = this.selectedAllergies;
    if (this.AppointmentPatientInfo.isMedication === 'Yes') {
      this.addMedication('');
    }

    this.aaa.saveAndSubmitNewCaseSheet(this.AppointmentDocInfo, this.AppointmentPatientInfo, this.selectedUHIDSelf, 'save').subscribe(t => {
      // 
      if (t != undefined && t != null && t.ResponceCode == "0" && t.Result != "") {
        alert('casesheet saved successfully');
      } else {
        alert('error while saving casesheet. please try again later');
      }
    })

  }

  setDossage(dosage: any, master: any) {
    master.dosage = dosage;
  }

  /*
  *  Upload reports
  */
  reportUpload(event) {
    this.selectedFile = <File>event.target.files[0];
    const fd = new FormData();
    fd.append('file', this.selectedFile, this.selectedFile.name);

    var patientId = this.aaa.getSessionToken().AskApolloReferenceIdForSelf;
    var reportName = this.selectedFile.name;
    var fieldDescription = this.selectedFile.name;
    var fileFormat = this.selectedFile.type;
    var visitId = this.AppointmentDocInfo.VisitId.toString();  // "1199";
    var uploadedDate = moment().format('DD-MM-YYYY');
    var Uploadurl = '';
    var token = this.aaa.getSessionToken().OnlineConsultToken;

    let params = 'patientId=' + patientId + '&reportName=' + reportName + '&fieldDescription=' + fieldDescription + '&filename=' + this.selectedFile.name + '&fileFormat=' + fileFormat + '&visitId=' + visitId + '&uploadedDate=' + uploadedDate + '&Token=' + token + '&FileSize=' + this.selectedFile.size.toString();

    let file_size = ((this.selectedFile.size) / 1024 / 1024).toFixed();
    let file_ext = this.selectedFile.name.split('.').pop();

    var allowedExtensions = ['pdf', 'PDF', 'jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'];

    if (allowedExtensions.indexOf(file_ext) <= -1) {
      alert('Upload images or pdf files');
      return false;
    }
    else if (file_size < '30') {
      this.spinnerService.show();
      this.userService.submitUploadReports(fd, params)
        .subscribe(res => {
          this.spinnerService.hide();
          this.response = res;
          if (this.response.Status == 1) {
            alert("Report Uploaded Successfully");
            this.getReports();
          }
          else {
            alert(this.response.ErrorMessage);
          }
          //console.log(res);
        }, err => {
          this.spinnerService.hide();
          alert('Something went wrong');
          //console.log(err);
        });
    }
    else {
      alert('File is too Large');
      return false;
    }
  }

  reportConsent(event) {
    this.selectedFile = <File>event.target.files[0];
    const fd = new FormData();
    fd.append('file', this.selectedFile, this.selectedFile.name);

    var patientId = this.aaa.getSessionToken().AskApolloReferenceIdForSelf;
    var reportName = 'ConsentForm';//this.selectedFile.name;
    var fieldDescription = 'ConsentForm';//this.selectedFile.name;
    var fileFormat = this.selectedFile.type;
    var visitId = this.AppointmentDocInfo.VisitId.toString();  // "1199";
    var uploadedDate = moment().format('DD-MM-YYYY');
    var Uploadurl = '';
    var token = this.aaa.getSessionToken().OnlineConsultToken;

    let params = 'patientId=' + patientId + '&reportName=' + reportName + '&fieldDescription=' + fieldDescription + '&filename=' + this.selectedFile.name + '&fileFormat=' + fileFormat + '&visitId=' + visitId + '&uploadedDate=' + uploadedDate + '&Token=' + token + '&FileSize=' + this.selectedFile.size.toString();

    let file_size = ((this.selectedFile.size) / 1024 / 1024).toFixed();
    let file_ext = this.selectedFile.name.split('.').pop();

    var allowedExtensions = ['pdf', 'PDF', 'jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF'];

    if (allowedExtensions.indexOf(file_ext) <= -1) {
      alert('Upload images or pdf files');
      return false;
    }
    else if (file_size < '30') {
      this.spinnerService.show();
      this.userService.submitUploadReports(fd, params)
        .subscribe(res => {
          this.spinnerService.hide();
          this.response = res;
          if (this.response.Status == 1) {
            alert("Report Uploaded Successfully");
            if (this.aaa.location === 'International') {
              this.isConsentUploaded = true;
            }
            this.getReports();
          }
          else {
            alert(this.response.ErrorMessage);
          }
          //console.log(res);
        }, err => {
          this.spinnerService.hide();
          alert('Something went wrong');
          //console.log(err);
        });
    }
    else {
      alert('File is too Large');
      return false;
    }
  }

  selectedDate: string;
  selectedDateString: string;
  pickedFromCalendar = false;
  activateCalendar = false;

  hideDP() {
    this.activateCalendar = false;
    this.datepicker.hide();
    this.dpopen = false;
  }

  openDP() {
    this.activateCalendar = true;
    this.datepicker.show();
    this.dpopen = true;
  }

  ngOnDestroy() {
    localStorage.clear();
  }

  smoker(type: string) {

    this.AppointmentPatientInfo.isSmoker = type;
    if (type == 'No') {
      this.AppointmentPatientInfo.howmanycigarretesyousmokeDaily = 'Select';
      this.AppointmentPatientInfo.smokingsincehowmanyYears = 'Select';
      this.AppointmentPatientInfo.whendidyoustoppedSmoking = 'Select';
      this.AppointmentPatientInfo.howManyCigarretesperDay = 'Select';
      this.AppointmentPatientInfo.howManyYearsSmoked = 'Select';
      this.AppointmentPatientInfo.howFrequentlySmoke = '';
    }
  }

  drinker(type: string) {

    this.AppointmentPatientInfo.isDrinker = type;
    if (type == 'No') {
      this.AppointmentPatientInfo.howlongUrDrinking = 'Select';
      this.AppointmentPatientInfo.HowFrequentlyDrink = '';
      this.AppointmentPatientInfo.whendidyoustoppedDrinking = 'Select';
    }
  }

  Medication(type: string) {
    this.AppointmentPatientInfo.isMedication = type;
    this.AppointmentPatientInfo.PresentMedicationObject = [];
  }

  Allergetic(type: string) {
    this.AppointmentPatientInfo.isAllergetic = type;
    this.AppointmentPatientInfo.allergiesObject = [];
  }

  // Diet(type: string) {
  //   this.AppointmentPatientInfo.Diet = type;
  // }
  // exercise(type: string) {
  //   this.AppointmentPatientInfo.doyouExcerciseDaily = type;
  // }

  // getSpecialitySymptomsForSourceApp() {
  //   this.aaa.getSpecialitySymptomsForSourceApp(this.AppointmentDocInfo.specialityId).subscribe(t => {

  //     if (t.ResponceCode == "0" && t.Result != "") {
  //       var couponSpecialitySymptoms = JSON.parse(t.Result);


  //     } else {
  //       alert(t.Result);
  //     }
  //   })

  // }

  getSpecialitySymptomsForSourceApp() {
    this.specialitySymptoms = [];
    this.aaa.getSpecialitySymptomsForSourceApp(this.AppointmentDocInfo.SpecialityId).subscribe(
      (data: any) => {
        if (data != null) {
          if (data.Result != undefined && data.Result != null) {
            let res = JSON.parse(data.Result);
            this.casesheetSymptoms = [];
            for (let d of res) {
              let symptomsData = { symptomsId: d.SymptomsId, symptoms: d.Symptoms, symptomsdescription: '', status: false };

              this.casesheetSymptoms.push(symptomsData);
            }

            let symptomsData = { symptomsId: 0, symptoms: 'Others', symptomsdescription: '', status: this.casesheetSymptoms.length > 0 ? false : true };
            this.casesheetSymptoms.push(symptomsData);
            // this.AppointmentPatientInfo.presentComplaintsObject.push(this.casesheetSymptoms);

            if (this.casesheetSymptoms.length > 1) {
              this.isSymptomsEmpty = false;
              this.isSymptomsOthersDisplay = true;
            }
            else {
              this.isSymptomsEmpty = true;
              this.isSymptomsOthersDisplay = false;
              this.AppointmentPatientInfo.OtherpresentComplaints = '  ';
              if (this.AppointmentPatientInfo.presentComplaintsObject.length == 0) {
                //this.AppointmentPatientInfo.presentComplaintsObject.push(this.casesheetSymptoms);
                this.AppointmentPatientInfo.presentComplaintsObject = this.casesheetSymptoms;
              }
            }

            if (this.AppointmentPatientInfo.presentComplaintsObject.length > 0) {
              for (let d of this.casesheetSymptoms) {
                for (let c of this.AppointmentPatientInfo.presentComplaintsObject) {
                  if (d.symptomsId === c.symptomsId) {
                    d.status = c.status;
                    if (c.symptomsId === 0 || c.symptomsId === '0') {
                      this.AppointmentPatientInfo.OtherpresentComplaints = c.symptomsdescription;
                      this.isSymptomsEmpty = true;
                    }
                  }
                }
              }
            }
          }
        }

      });

  }

  setSymptoms(symptomsId: string, symptoms: string) {

    this.AppointmentPatientInfo.presentComplaintsObject = [];
    for (let d of this.casesheetSymptoms) {
      if (d.symptomsId === symptomsId) {
        d.status = d.status === true ? false : true;
      }
      if (d.status === true)
        this.AppointmentPatientInfo.presentComplaintsObject.push(d);
    }
  }

  setAllergies(item_id: string, item_name: string) {

    this.AppointmentPatientInfo.allergiesObject = [];
    for (let d of this.Allergies) {
      if (d.item_id === item_id) {
        d.status = d.status === true ? false : true;
      }
      // else{
      //   d.status=false;
      // }
      if (d.status === true)
        this.AppointmentPatientInfo.allergiesObject.push(d);
      // if (d.status === true)
      //   this.AppointmentPatientInfo.allergiesObject.push(d);
    }


  }

  getReports() {

    this.userService.getAttachmentss(this.AppointmentDocInfo.VisitId).subscribe(
      (data: any) => {
        if (data != null) {
          if (data.Result != undefined && data.Result != null) {
            let res = JSON.parse(data.Result);
            //console.log(res);
            this.uploadedDocuments = [];
            for (let d of res) {
              this.uploadedDocuments.push(d);
            }
          }
        }

      });

  }

  deleteReports(documentId: string, DocumentName: string) {

    this.userService.deleteAttachmentss(documentId).subscribe(
      (data: any) => {
        if (this.aaa.location === 'International') {
          if (DocumentName === 'ConsentForm') {
            this.isConsentUploaded = false;
          }
        }
        // if (data != null) {
        //   if (data.Result != undefined && data.Result != null) {
        alert("Report Deleted Successfully");
        this.getReports();
        //   }
        // }

      });

  }


  postAddMember(addmember: FormGroup) {
    var d = new Date(addmember.value.dob);
    this.month = '' + (d.getMonth() + 1);
    this.day = '' + d.getDate();
    this.year = d.getFullYear();

    if (this.month.length < 2) this.month = '0' + this.month;
    if (this.day.length < 2) this.day = '0' + this.day;

    this.addmember.get('dob').setValue([this.month, this.day, this.year].join('/'));


    var today = new Date();
    var nowyear = today.getFullYear();
    var nowmonth = today.getMonth();
    var nowday = today.getDate();


    this.age = nowyear - this.year;
    var age_month = nowmonth - this.month;
    var age_day = nowday - this.day;
    this.age = parseInt(this.age);

    // created date set to form field
    this.addmember.get('createdDate').setValue(this._datePipe.transform(this.now, 'yyyy-MM-dd HH:mm:SS.SSS'));
    this.addmember.get('age').setValue(this.age);
    this.aaa.loadingShow('loadingid');

    this.userService.addFamilyMemberinCasesheet(addmember.value, this.selectedUHIDSelf.uhid)
      .subscribe(res => {
        this.aaa.loadingHide('loadingid');
        this.addMemberResponse = res;
        this.getAllRelations();
        this.url = '';
        addmember.reset();
        alert(this.addMemberResponse.Result);

      }, err => {
        this.aaa.loadingHide('loadingid');
        alert("something went wrong!");
      });
  }

  url: any = '';
  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      this.addmember.get('imageName').setValue(event.target.files[0].name);
      this.addmember.get('filename').setValue(event.target.files[0].name);

      var ext = event.target.files[0].name.split('.').pop();
      this.addmember.get('fileext').setValue(ext);
      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event) => { // called once readAsDataURL is completed
        this.url = reader.result;
      }
      this.convertToBase64(event.target.files[0]);
    }
  }
  convertToBase64(e) {
    var reader = new FileReader();
    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsBinaryString(e);
  }
  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.base64textString = btoa(binaryString);
    this.addmember.get('filecontent').setValue(this.base64textString);
  }
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  gotoDashboard() {
    this.router.navigate(['my/dashboard-oc']);
  }
  setValidation(current: number) {
    this.isValid = true;
    let alertmsg: string;
    alertmsg = '';
    if (current == 1) {
      if (this.AppointmentPatientInfo.type == '' || this.AppointmentPatientInfo.type == null) {
        alertmsg += 'type';
      } if (this.AppointmentPatientInfo.gender == '' || this.AppointmentPatientInfo.gender == null) {
        alertmsg += alertmsg.length > 0 ? ', gender' : 'gender';
      } if (this.AppointmentPatientInfo.heightText == 'select height' || this.AppointmentPatientInfo.heightText == null) {
        alertmsg += alertmsg.length > 0 ? ', height' : 'height';
      } if (this.AppointmentPatientInfo.weightText == 'select weight' || this.AppointmentPatientInfo.weightText == null) {
        alertmsg += alertmsg.length > 0 ? ', weight' : 'weight';
      } if (this.AppointmentPatientInfo.city == '' || this.AppointmentPatientInfo.city == null) {
        alertmsg += alertmsg.length > 0 ? ', city' : 'city';
      }
      if (alertmsg.length > 0) {
        this.isValid = false;
        alert('Please fill ' + alertmsg + ' details');
        return;
      }
    } else if (current == 2) {
      //Smoke validation
      if (this.AppointmentPatientInfo.isSmoker === 'Yes') {
        if (this.AppointmentPatientInfo.howManyCigarretesperDay === 'Select' && this.AppointmentPatientInfo.howManyYearsSmoked === 'Select') {
          this.isValid = false;
          alert('Please fill Smoke details or select No');
          return;
        }
      } else if (this.AppointmentPatientInfo.isSmoker === 'Not Anymore') {
        if (this.AppointmentPatientInfo.whendidyoustoppedSmoking === 'Select' && this.AppointmentPatientInfo.howManyCigarretesperDay === 'Select' && this.AppointmentPatientInfo.howManyYearsSmoked === 'Select') {
          this.isValid = false;
          alert('Please fill Smoke details or select No');
          return;
        }
      }

      //Drink validation
      if (this.AppointmentPatientInfo.isDrinker === 'Yes') {
        if (this.AppointmentPatientInfo.howlongUrDrinking === 'Select' && this.AppointmentPatientInfo.HowFrequentlyDrink === '') {
          this.isValid = false;
          alert('Please fill Alcohol consumption details or select No');
          return;
        }
      } else if (this.AppointmentPatientInfo.isDrinker === 'Not Anymore') {
        if (this.AppointmentPatientInfo.whendidyoustoppedDrinking === 'Select') {
          this.isValid = false;
          alert('Please fill Alcohol consumption details or select No');
          return;
        }
      }
    } else if (current == 3) {
      if (
        this.AppointmentPatientInfo.presentComplaintsObject.length == 0
      ) {
        this.isValid = false;
        alert('Please fill symptom details');
        return;
      }
    } else if (current == 4) {
      if (this.AppointmentPatientInfo.isMedication === 'Yes') {
        this.addMedication('');
        if (this.AppointmentPatientInfo.presentMedicationObject.length == 0) {

          //if (this.AppointmentPatientInfo.presentMedicationObject.length == 0) {
          this.isValid = false;
          alert('Please enter medicine details or select No');
          return;
          //}
        }
        else {
          for (let data of this.AppointmentPatientInfo.presentMedicationObject) {
            //let initial = { index: 0, medicine: '', dosage: 'Dosage', started: '' };
            let isDataMissing: boolean = false;
            if (data.medicine.trim() == '' ||
              data.dosage.trim() == 'Dosage' ||
              data.started == ''
            ) {
              isDataMissing = true;
            }

            if (isDataMissing) {
              this.isValid = false;
              alert('inavlid medication entered please check');
              return;
            }
          }
        }
      }
    } else if (current == 5) {
      if (this.AppointmentPatientInfo.isAllergetic === 'Yes') {
        if (this.AppointmentPatientInfo.allergiesObject.length == 0) {
          this.isValid = false;
          alert('Please fill atleast one allergy');
          return;
        }
      }
    } else if (current == 6) {
      if (this.aaa.location === 'International') {
        if (this.isConsentUploaded == false) {
          this.isValid = false;
          alert('Please download and upload a duly signed consent form (By the Patient or the Patient’s Relative)');
          return;
        }
      }
    } else if (current == 7) {

    }
  }
}
