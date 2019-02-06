import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { AAAuthService } from '@aa/services/auth.service';

import { UserInfo } from '@aa/structures/user.interface';
//import {MyDatePicker, IMyOptions, IMyDateModel} from 'mydatepicker';
import { DatepickerOptions } from 'ng2-datepicker';
import { DatePipe } from '@angular/common';
import {  BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsModalService } from 'ngx-bootstrap/modal';
@Component({
  selector: 'app-signup-details',
  templateUrl: './signup-details.component.html',
  styleUrls: ['./signup-details.component.scss']
})
export class SignupDetailsComponent implements OnInit {
  countryCode:any[];
  ui: UserInfo;
  bsConfig: Partial<BsDatepickerConfig>;
  // @ViewChild('mydp') mydp: MyDatePicker;
  // public myDatePickerOptions: IMyOptions = {
  //   // other options...
  //   dateFormat: 'dd.mm.yyyy',
  //   showTodayBtn:false,
  //   showClearDateBtn:false,
  //   openSelectorOnInputClick:true
  // };

  // Initialized to specific date (09.10.2018).
  public model: any = { date: { year: 2018, month: 10, day: 9 } };
	maxDate=new Date();
  options: DatepickerOptions = {
    minYear: 1965,
    maxYear: 2030,
    maxDate:new Date(),
    displayFormat: 'DD/MM/YYYY',
    barTitleFormat: 'MMMM YYYY',
    dayNamesFormat: 'dd',
    firstCalendarDay: 0, // 0 - Sunday, 1 - Monday
    // locale: frLocale,
    // minDate: new Date(Date.now()), // Minimal selectable date
    // maxDate: new Date(Date.now()),  // Maximal selectable date
    barTitleIfEmpty: 'Click to select a date',
    placeholder: 'Click to select a date', // HTML input placeholder attribute (default: '')
    addClass: 'form-control', // Optional, value to pass on to [ngClass] on the input field
    addStyle: {}, // Optional, value to pass to [ngStyle] on the input field
    fieldId: 'my-date-picker', // ID to assign to the input field. Defaults to datepicker-<counter>
    useEmptyBarTitle: false, // Defaults to true. If set to false then barTitleIfEmpty will be disregarded and a date will always be shown 
  };
  constructor(
    public aaa: AAAuthService,
    private datePipe: DatePipe,
    private bsLocaleService: BsLocaleService,
    private modalService: BsModalService,) {
      this.bsLocaleService.use('en-gb');
     }
  // onToggleSelector(event: any) {
  //         event.stopPropagation();
  //         this.mydp.openBtnClicked();
  //     }
  ngOnInit() {
    this.ui = this.aaa.getuserInfo();
    this.getCountryCode();
    this.bsConfig = Object.assign({}, { containerClass: 'theme-orange', dateInputFormat: 'DD/MM/YYYY' });
  }

  saveUserDetails(f: NgForm) {
       if(f.value.dob!=undefined && f.value.dob!=null && f.value.dob.length!=10){
      f.value.dob = this.datePipe.transform(f.value.dob, 'dd-MM-yyyy');
    }   
    this.ui.dateofBirth = f.value.dob;
   this.ui.countryCode=f.value.countryCode;
   if(this.ui.dateofBirth != undefined && this.ui.gender)
   {
     //console.log(this.ui);
     //console.log(this.aaa.userInfo);
     if(this.ui.countryCode == '91')
     {
       this.aaa.processPhoneNumber(this.ui);
     }
     else
     {
       let otp = '';
       this.aaa.loadingShow('loadingid');
       this.aaa.SocialMediaLoginRegister(this.aaa.userInfo, otp).subscribe(
        (data: any) => {
          //this.aaa.loadingHide('loadingid');
          if (this.aaa.userInfo.uhid == "") {
            this.aaa.processSocialLogin(this.aaa.userInfo.SocialLoginType);
            
          } else {
            this.aaa.processSocialLogin(this.aaa.userInfo.SocialLoginType);
          }
          this.modalService._hideModal(1);

        });
     }
   }
   else
   {
     alert('All fields are manditory.');
   }
  }

  getCountryCode()
  {
    this.aaa.getCountryCodeForRegistration().subscribe(data=>{
      this.countryCode=JSON.parse(data)
     
    })
  }

}
