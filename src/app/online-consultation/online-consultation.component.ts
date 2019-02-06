import { Component, OnInit, TemplateRef } from '@angular/core';

import { CommonService } from '@aa/services/common.service';
import { SearchService } from '@aa/services/search.service';
import { UtilsService } from './../services/utils.service';

import { city } from '@aa/structures/city.interface';

import { topspecialityList,topDoctorsAnonymous } from '@aa/structures/user.interface';
import { FormGroup, FormControl, FormArray} from '@angular/forms';
import { ValidationManager } from "ng2-validation-manager";

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

import { constants as c } from './../constants';
import { AAAuthService } from '@aa/services/auth.service';

@Component({
  selector: 'app-online-consultation',
  templateUrl: './online-consultation.component.html',
  styleUrls: ['./online-consultation.component.scss']
})
export class OnlineConsultationComponent implements OnInit {

  currentCity = 'hyderabad';
  pn = '';
  response: any;
  submitQueryForm;
  topspecialityList: topspecialityList[] = [];
  topspecialityList1: topspecialityList[] = [];
  topspecialityList2: topspecialityList[]=[];
  topspecialityList3: topspecialityList[]=[];
  topDoctorsAnonymous: topDoctorsAnonymous[] = [];

  modalRef: BsModalRef;

  id = 'pAARTdnGUeA';
  private player;
  private ytEvent;

  res:any;


  constructor(
    private us: UtilsService,
    private cs: CommonService,
    private ss: SearchService,
    private modalService: BsModalService,
    private router: Router,
    private spinnerService: Ng4LoadingSpinnerService,
    private aaa:AAAuthService) {

      this.submitQueryForm = new ValidationManager({            
            'Name'       : 'required',
            'Email'      : 'required|email',
            'Mobile'     : 'required',
            'Query'      : 'required'
        });

     }

  ngOnInit() {
    
    this.aaa.checkPendingCaseSheet();
    this.us.setActiveTab(this.us.TAB_ONLINE_CONSULTATION);
    
    //Canonical and Google Analytics
    this.cs.setCanonicallink(window.location.href);
    debugger;
    this.cs.setGA('consult Online','consult Online','consult Online','consult Online');    
    this.cs.setGA('Consult Doctors Online Home Page','Online Consultations_Ask Apollo Home Page','Online Consultations_Ask Apollo Home Page','Ask Apollo Online Consultation Home Page');
    this.cs.setPageTitle("Top Doctors at Apollo Hospitals. Book Appointment Now | AskApollo");
    this.cs.setPageDescription('We have the Top Specialists across departments at Apollo ' 
      + 'Hospitals. Consult with the best doctor practicing with Apollo Hospitals near you, ranked among the ' 
      + ' best hospitals and clinics in India. Book an Instant Online Appointment Now through AskApollo.');

    this.currentCity = this.ss.getCurrentCity().name.toLowerCase();

    this.ss.selectedCityTracker.subscribe(
      (c: city) => {
        this.currentCity = c.name.toLowerCase();
      }
    )
    
    /*this.cs.GetTopSpecialitiesList().subscribe(res => {            
            this.response = res;
            this.topspecialityList = JSON.parse(this.response.Result); 
            if(this.topspecialityList.length > 15 )
            {
               this.topspecialityList1=this.topspecialityList.slice(0,6);
              this.topspecialityList2=this.topspecialityList.slice(6,12);
              console.log(this.topspecialityList1);
              console.log(this.topspecialityList2);
              //this.topspecialityList3=this.topspecialityList.slice(12,15);
            }
            else if(this.topspecialityList.length > 6 && this.topspecialityList.length<12)
            {
              this.topspecialityList1=this.topspecialityList.slice(0,6);
              this.topspecialityList2=this.topspecialityList.slice(6,12);
            }
            else if(this.topspecialityList.length < 6)
            {
              this.topspecialityList1=this.topspecialityList.slice(0,6);
            }
            

    });*/

    this.cs.GetTopDoctorsAnonymous().subscribe(res => {            
            this.response = res;
            this.topDoctorsAnonymous = JSON.parse(this.response.Result); 
    });  
  }

  sendAppLink() 
  {  	
    if (this.pn.length != 10)
    {
        alert('Please enter a valid 10 digit number: ' + this.pn);
    }
    else 
    {
      this.cs.sendAppLinkToMobile(this.pn);
      this.pn = '';
    }
  }
  addSubmitQuery()
  {
    if(this.submitQueryForm.isValid())
    {
      var data = this.submitQueryForm.getData(); 
      this.spinnerService.show();
      this.cs.submitQuery(data)
        .subscribe(
          (data:any) => {
              this.spinnerService.hide();
               this.submitQueryForm.reset();
              alert("Your message has been submitted successfully!We will get in touch with you at the earliest.");
       }), err => {
          this.spinnerService.hide();
              alert(err);
           
      };
    }
    else
    {
      alert('All fields are required.');
    }    
  }
  openModal(template: TemplateRef<any>) 
  {
    this.modalRef = this.modalService.show(template);
  }
  onStateChange(event) {
    this.ytEvent = event.data;
  }
  savePlayer(player) {
    this.player = player;
  }
  
  playVideo() {
    this.player.playVideo();
  }
  
  pauseVideo() {
    this.player.pauseVideo();
  }
  topSpecialityRedirection(text)
  {    
    this.cs.setGA('Consult Doctors Online Home Page','Online Consultations Home Page','Online Consultation_Top Specialities','Online Consultation_Top Specialties_'+text);
    localStorage.setItem("SearchId", "Askspeciality");
    localStorage.setItem("SearchText", text);
    var url = "/online-doctors-consultation/speciality/"+text;
    this.router.navigate([url]);
  }
  sendAppLinkEnter()
  {
    this.sendAppLink();
  }
  openQuickEnquiry()
  {
    document.getElementById("cont-form").style.right = "0";
  }
  closeQuickEnquiry()
  {
   document.getElementById("cont-form").style.right = "-300px"; 
  }
  openVideo(template: TemplateRef<any>)
  {    
    this.cs.setGA('Consult Doctors Online Home Page','Online Consultations Home Page','Online Consultation_How it Works?','Online Consultation _How it Works?');
    this.modalRef = this.modalService.show(template);
  }
  openModalwork(template: TemplateRef<any>)
  {
    this.modalRef = this.modalService.show(template);
  }
  onlineAppStore()
  {    
    this.cs.setGA('Consult Doctors Online Home Page','Online Consultations Home Page','Online Consultations_Home Page_AppStore','Online Consultation_AppStore');
    window.open('https://itunes.apple.com/in/app/one-apollo/id1272088560?mt=8', '_blank'); 
  }
  onlinePlayStore()
  {    
    this.cs.setGA('Consult Doctors Online Home Page','Online Consultations Home Page','Online Consultation_Home Page_Playstore','Online Consultation_Playstore');
    window.open('https://play.google.com/store/apps/details?id=com.apollo.android&hl=en', '_blank');   
  }
}
