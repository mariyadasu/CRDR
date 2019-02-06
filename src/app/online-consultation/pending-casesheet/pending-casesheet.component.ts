import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy } from '@angular/core';
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


// interface for breadcrumbs 
export interface bc {
  name: string,
  url: string
}


@Component({
  selector: 'online-pending-casesheet',
  templateUrl: './pending-casesheet.component.html',
  styleUrls: ['./pending-casesheet.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OnlinePendingCaseSheetComponent implements OnInit {

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
    patientID:"",
    FirstName:"",
    LastName:"",
    registration_date:"",
    Mobile:"",
    Email:"",
    Gender:"",
    DOB:""
  }
  
  
    



  AppointmentPatientInfo: any = {
    type: 'self',
    age: '',
    patientUHID: "",
    gender: 'Male',
    height: '',
    weight: '',
    heightText: 'select height',
    weightText: 'select weight',
    bmi: '',
    city: '',
    pastHistory: 'No',
    presentComplains: '',
    isCaseSheetSubmitted: '',
    presentMedicationObject: [],
    allergiesObject: [],
  }

  dropdownList = [];
  selectedAllergies = [];
  dropdownSettings = {};
  Allergies = [];
  selectedFile: File = null;
  response: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private cs: CommonService,
    private us: UtilsService,
    private srs: SearchService,
    private route: ActivatedRoute,
    private aaa: AAAuthService,
    private router: Router,
    private spinnerService: Ng4LoadingSpinnerService,
    private userService: UserService) { }

  prepareEmptyPendingCasehhet() {
    this.AppointmentPatientInfo = {
      type: 'self',
      age: '',
      patientUHID: "",
      gender: 'male',
      height: '',
      weight: '',
      heightText: 'select height',
      weightText: 'select weight',
      bmi: '',
      city: '',
      pastHistory: 'No',
      presentComplains: '',
      isCaseSheetSubmitted: '',
      presentMedicationObject: [],
      allergiesObject: []
    }
  }

  availableRelatives = [];
  selectedRelative = {} as UHID;
  showRelativesFlag: boolean = false;
  feetData = [];
  weightData = [];
  showRelatives() {
    if (this.availableRelatives.length > 0) {
      this.showRelativesFlag = true;
      this.selectedRelative = this.availableRelatives[0];
    } else {

      this.AppointmentPatientInfo.type = "self";
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
      return "self";
    }

    let rUhid = this.availableRelatives.filter(u => {
      return u.relationId == relationId;
    })[0];
    this.showRelatives();
    this.selectedRelative = rUhid;

    return "relative";
  }

  getAllRelations() {
    this.availableRelatives = [];
    this.aaa.getAllFamilyMembersDataForBooking().subscribe(
      (data: any) => {

        this.userData = this.aaa.getuserInfo();
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
            }
          }

        }
        this.getSignUserUhids();
      });

  }

  setRelative(uhid: any) {
    this.selectedRelative = uhid;
  }
  removeRelative() {
    this.showRelativesFlag = false;
  }

  getSignUserUhids() {
    this.availableUHIDSelf = [];
    this.spinnerService.show();
    this.aaa.getUhidsUsingPrism().subscribe(
      (data: any) => {

        this.spinnerService.hide();
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
          this.getPendingCasesheet();
        }
      });

  }


  setUHIDSelf(uhid: UHID) {
    this.selectedUHIDSelf = uhid;
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
     
      if (t.ResponceCode == "0" && t.Result != "" && t.Result != "[]") {
        var apointinfo = JSON.parse(t.Result);
        this.AppointmentDocInfo = apointinfo[0];
      
        this.aaa.getPendingCaseSheetAllDetails(this.AppointmentDocInfo.VisitId).subscribe(t => {

          if (t.ResponceCode == "0" && t.Result != undefined && t.Result != null && t.Result != "" && t.Result != "[]") {
            let cInfo = JSON.parse(t.Result);
            
            if (cInfo.length > 0) {
              let pIngo = cInfo[0];

              let pInfp = pIngo.PersonalHistory.split(',');
              let ageA = pInfp[0].split(':');
              let agel = ageA[1];

              let genderA = pInfp[1].split(':');
              let genderl = genderA[1];

              this.AppointmentPatientInfo = {
                type: this.setAppointmentType(pIngo.relationId),
                height: pIngo.Height,
                heightText: pIngo.Height == "" ? "select height" : pIngo.Height,
                weight: pIngo.Weight,
                weightText: pIngo.Weight == "" ? "select weight" : pIngo.Weight + " kg",
                patientUHID: pIngo.PatientUHID,
                presentComplains: pIngo.PresentComplains,
                age: agel,
                gender: genderl,
                isCaseSheetSubmitted: pIngo.IsCaseSheetSubmitted,
                presentMedicationObject: JSON.parse(pIngo.PresentMedicationObject),
                allergiesObject: JSON.parse(pIngo.AllergiesObject),
                city: pIngo.city,
                pastHistory: this.setHavYouVisited(pIngo.PatientUHID),
                bmi: this.getBMI(pIngo.Weight, pIngo.Height)
              }

              this.selectedAllergies = this.AppointmentPatientInfo.allergiesObject;
              this.medications = this.AppointmentPatientInfo.presentMedicationObject;
            } else {
              this.prepareEmptyPendingCasehhet();
            }
          } else {
            this.prepareEmptyPendingCasehhet();
          }

        })
      }
    })
  }


  ngOnInit() {
   
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
      this.getAllRelations();
      this.loadAllergies();
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
    localStorage.setItem("paymentDone","true");
     this.lmsLog();
    
  }
  //LMS log
  payDetails:any;
  lmsLog()
  {
    
    this.payDetails=localStorage.getItem("totalDetails");
    this.payDetails=JSON.parse( this.payDetails);
    this.payDetails.walletApplied= (this.payDetails.walletApplied==null?false:this.payDetails.walletApplied);
    if(this.payDetails.walletApplied==true && this.payDetails.walletApplied !==null )
   { let params=
    {
      
      "Email" : this.payDetails.EmailId,
      "MobileNo": this.payDetails.MobileNo,
      "RedeemRequestId": this.payDetails.RedeemRequestId,
      "CreditPoints":this.payDetails.walletAmount.toString(),
      "VoucherCode": "",
      "VoucherID": "",
      "IntermAppId": this.payDetails.blockId
      }  
      this.aaa.lmssubmission(params).subscribe(data=>{
      })}
  }

  getPendingCasesheet() {
    this.aaa.getPendingCaseSheet().subscribe(t => {
      if (t.ResponceCode == "0" && t.Result != "") {
        this.getPendignCaseSheetInfo();
      } else {
        this.prepareEmptyPendingCasehhet();
        let appointmentInfo = JSON.parse(localStorage.getItem('onlineslotDetails'));
        if (appointmentInfo) {
          this.AppointmentDocInfo.doctorname = appointmentInfo.docName;
          this.AppointmentDocInfo.AppointmentDate = appointmentInfo.date;
          this.AppointmentDocInfo.AppointmentTime = appointmentInfo.timeSlot;
          this.AppointmentDocInfo.Category = appointmentInfo.mode;
          this.AppointmentDocInfo.VisitId = 0;
          this.AppointmentDocInfo.Speciality = appointmentInfo.docSpeciality;
          this.AppointmentDocInfo.specialityId = appointmentInfo.docSpecialityId;
          this.AppointmentDocInfo.location = appointmentInfo.docCity;
          this.AppointmentDocInfo.fee = appointmentInfo.fee;
          this.AppointmentDocInfo.feeType = appointmentInfo.feeType;
          this.AppointmentDocInfo.afterDiscount = appointmentInfo.fee;
        }

      }
    })
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
      { item_id: 6, item_text: 'No allergies' },
      { item_id: 1, item_text: 'Food' },
      { item_id: 2, item_text: 'Medicine' },
      { item_id: 3, item_text: 'Air borne allergies' },
      { item_id: 4, item_text: 'Seasonal Variations' },
      { item_id: 5, item_text: 'Latex or any substance you touch' },
    ];
  }

  medications = [];

  initialMedication() {
    let initial = { index: 0, medicine: '', dosage: 'Dosage', started: '' };
    this.medications.push(initial);
  }
  addMedication() {
    let initial = { index: this.medications.length, medicine: '', dosage: 'Dosage', started: '' };
    this.medications.push(initial);
  }
  deleteMedication(index: any) {


    if (confirm('Are you sure you want to delete medication')) {
      this.medications = this.medications.filter(m => {
        return m.index != index;
      });
    }

    //this.medications.slice(index,1);

  }

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }

  setHeight(height: any, inch: any) {
    this.AppointmentPatientInfo.height = height;
    this.AppointmentPatientInfo.heightText = height + ' Foot' + inch + ' inch';
    this.AppointmentPatientInfo.bmi = this.getBMI(this.AppointmentPatientInfo.weight, this.AppointmentPatientInfo.height);

  }

  setWeight(weight: any) {
    this.AppointmentPatientInfo.weight = weight;
    this.AppointmentPatientInfo.weightText = weight + " kg";
    this.AppointmentPatientInfo.bmi = this.getBMI(this.AppointmentPatientInfo.weight, this.AppointmentPatientInfo.height);
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
    if (this.AppointmentPatientInfo.type == '' ||
      this.AppointmentPatientInfo.age.trim() == '' ||
      this.AppointmentPatientInfo.gender == '' ||
      this.AppointmentPatientInfo.heightText == 'select height' ||
      this.AppointmentPatientInfo.weightText == 'select weight' ||
      this.AppointmentPatientInfo.city == '' ||
      this.AppointmentPatientInfo.presentComplains == ''
    ) {
      alert('Please fill mandatory fields');
      return;
    }

    if (this.selectedAllergies.length == 0) {
      alert('Please fill atleast one allergy');
      return;
    }
    this.AppointmentPatientInfo.patientUHID = "";
    if (this.AppointmentPatientInfo.type == "self") {
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

    this.AppointmentPatientInfo.presentMedicationObject = this.medications;
    this.AppointmentPatientInfo.allergiesObject = this.selectedAllergies;
   
    this.spinnerService.show();
    this.aaa.saveAndSubmitCaseSheet(this.AppointmentDocInfo, this.AppointmentPatientInfo, this.selectedUHIDSelf, 'saveandsubmit').subscribe(t => {
      this.spinnerService.hide();
      if (t != undefined && t != null) {

        if (t != undefined && t != null && t.ResponceCode == "0" && t.Result != "") {
          alert('Appointment created successfully');
          this.router.navigate(['my/dashboard-oc']);
        } else {
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
    if (this.AppointmentPatientInfo.type == "self") {
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

    this.AppointmentPatientInfo.presentMedicationObject = this.medications;
    this.AppointmentPatientInfo.allergiesObject = this.selectedAllergies;
  

    this.aaa.saveAndSubmitCaseSheet(this.AppointmentDocInfo, this.AppointmentPatientInfo, this.selectedUHIDSelf, 'save').subscribe(t => {
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
  reportUpload(event, up) {
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
          }
          else {
            alert(this.response.ErrorMessage);
          }
          console.log(res);
        }, err => {
          this.spinnerService.hide();
          alert('Something went wrong');
          console.log(err);
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

  ngOnDestroy() 
  {
    localStorage.clear();
  }
}
