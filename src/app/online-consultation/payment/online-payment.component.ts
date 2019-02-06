import { CommonService } from '@aa/services/common.service';
//import { RequestAppointmentComponent } from '../request-appointment/request-appointment.component';
import { element } from 'protractor';
import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { BsDatepickerConfig, BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
// import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
// import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

import { AAAuthService } from '@aa/services/auth.service';
import { UtilsService } from '@aa/services/utils.service';
import { CalendarService } from '@aa/services/calendar.service';
import { BookingService } from '@aa/services/booking.service';

import { hospital } from '@aa/structures/hospital.interface';
import { doctorC, services } from '@aa/structures/doctor.interface';
import {
    calendarTracker, appointmentSlotsTracker,
    appointmentSlot, currentAppointment, aaDateSlotObject
} from '@aa/structures/calendar.tracker.interface';

import { SignupComponent } from './../../user/signup/signup.component';

import * as moment from 'moment';
import { FormBuilder } from '@angular/forms';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { constants as c } from './../../constants';


@Component({
    selector: 'online-payment',
    templateUrl: './online-payment.component.html',
    styleUrls: ['./online-payment.component.scss']
})

export class OnlinepaymentComponent implements OnInit {
    //timeString:any;
    location:any;
    walletFlag: string = c.wallet;
    walletRedeem: number = 0;
    requestId: string;
    walletOTP: any;
    redeem:boolean=false;
    walletValid:string="1";
    couponValid: boolean = false;
    walletPointsValue: number;
    specialityExistConsultationType = 2;
    specialityNotExistConsultationType = 3;
    AppointmentDocInfo: any = {
        doctorname: '',
        AppointmentDate: '',
        AppointmentTime: '',
        AppointmentDisplayTime:'',
        Category: '',
        CategoryId: '1',
        VisitId: "",
        Speciality: '',
        specialityId: 0,
        location: '',
        fee: 0,
        feeType: '',
        afterDiscount: 0,
        discountAmount: 0,
        couponAmount: 0,
        walletAmount: 0,
        RedeemRequestId:"",
        walletBalanceCredits: 0,
        walletApplied:false,
        patientMobileNo: '',
        patientemail: '',
        patientDOB: "",
        merchantId: '',
        relationId: '0',
        createdDate: this.utilsService.setDate(),
        hospitalId: '',
        timeZone: "",
        reviewRemarks: '',
        doctorId: '',
        locationId: '',
        consultationTypeId: "",
        edocDocId: '',
        redeemWalletrequest: '',
        blockId: '',
        displayFeeType:"",
        sourceApp: c.OCSourceApp,
        patientId: '',
        PatientName: '',
        PatientFirstName: '',
        PatientLastName: '',
        EmailId: '',
        MobileNo: '',
        authenticationTicket: '',
        //ReturnURL: window.location.origin+"/#/onlinependingcasesheet",
        ReturnURL: c.WindowLocationOrigin + "/onlinependingcasesheet",
        GatewayName: "Paytem",
        IsCouponApplied: false,
        DiscountPercent:0,
        AppointmentID: '',
        couponId: '0'
    }

    paymentInfo: any = {
        couponCode: '',
        wallet: '',
        couponId: '0'
    }
    modalRef: BsModalRef;
    fssForm = this.fb.group({
        sourceApp: [''],
    });
    config = {
        backdrop: true,
        ignoreBackdropClick: true
    };
    paymentURL: string;
    FSSpaymentUrl: string;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private cd: ChangeDetectorRef,
        private cs: CommonService,
        private calendarService: CalendarService,
        private utilsService: UtilsService,
        private aaa: AAAuthService,
        private bs: BookingService,
        private spinnerService: Ng4LoadingSpinnerService,
        private modalService: BsModalService) { }

    getIdForCategory(category: any) {
        switch (category) {
            case "email":
                return 1;
            case "video":
                return 2;
            case "voice":
                return 3;
        }
    }

    appForm = this.fb.group({
        sourceApp: [''],
    });
    paymentType: string = 'fss';
    selectPaymentMethod(type: any) {
        this.paymentType = type;
    }
    selectedType: string = '1';
    selectType(type: any) {
        this.selectedType = type;
    }

    ngOnInit() {
        this.aaa.checkPendingCaseSheet();
        let zone=new Date().toString().match(/([-\+][0-9]+)\s/)[1];
        this.AppointmentDocInfo.timeZone=(zone.slice(0,3)+":"+zone.slice(3,5))
        let userInfo = this.aaa.getuserInfo();
        this.location=this.aaa.location;
        this.utilsService.setActiveTab(this.utilsService.TAB_ONLINE_CONSULTATION);
        let appointmentInfo = JSON.parse(localStorage.getItem('onlineslotDetails'));
        if (appointmentInfo) {
        this.AppointmentDocInfo.doctorname = appointmentInfo.docName;
        this.AppointmentDocInfo.AppointmentDate = appointmentInfo.date;
        this.AppointmentDocInfo.AppointmentTime = appointmentInfo.timeSlot;
        this.AppointmentDocInfo.AppointmentDisplayTime= appointmentInfo.DisplayTime;
        this.AppointmentDocInfo.Category = appointmentInfo.mode;
        this.AppointmentDocInfo.CategoryId = this.getIdForCategory(appointmentInfo.mode);
        this.AppointmentDocInfo.VisitId = 0;
        this.AppointmentDocInfo.Speciality = appointmentInfo.docSpeciality;
        this.AppointmentDocInfo.specialityId = appointmentInfo.docSpecialityId;
        this.AppointmentDocInfo.location = appointmentInfo.docCity;
        this.AppointmentDocInfo.patientemail = userInfo.email;
        this.AppointmentDocInfo.patientMobileNo = userInfo.mobileNumber;
        this.AppointmentDocInfo.hospitalId = appointmentInfo.hosId;
        this.AppointmentDocInfo.doctorId = appointmentInfo.docId;
        this.AppointmentDocInfo.locationId = appointmentInfo.locationId;
        this.AppointmentDocInfo.edocDocId = appointmentInfo.edocDocId;
        this.AppointmentDocInfo.patientId = userInfo.AskApolloReferenceIdForSelf;
        this.AppointmentDocInfo.PatientName = userInfo.firstName + " " + userInfo.lastName;
        this.AppointmentDocInfo.EmailId = userInfo.email,
        this.AppointmentDocInfo.MobileNo = userInfo.mobileNumber,
        this.AppointmentDocInfo.authenticationTicket = userInfo.AuthTokenForPR;
        this.AppointmentDocInfo.PatientFirstName = userInfo.firstName;
        this.AppointmentDocInfo.PatientLastName = userInfo.lastName;
        this.AppointmentDocInfo.Gender = userInfo.gender;
        this.AppointmentDocInfo.patientDOB = userInfo.dateofBirth;
        if(this.aaa.location==="International")
        {
            this.AppointmentDocInfo.fee = appointmentInfo.feeUsd;
        this.AppointmentDocInfo.feeType = (appointmentInfo.feeTypeUsd);
        this.AppointmentDocInfo.displayFeeType=appointmentInfo.feeTypeUsd;
        this.AppointmentDocInfo.afterDiscount = appointmentInfo.feeUsd;
        }
        else
        {
       this.AppointmentDocInfo.fee = appointmentInfo.feeInr;
        this.AppointmentDocInfo.feeType = appointmentInfo.feeTypeInr;
        this.AppointmentDocInfo.displayFeeType="Rs";
        this.AppointmentDocInfo.afterDiscount = appointmentInfo.feeInr;     
        }
    }
    //this.timeStringName();
        if(localStorage.getItem("paymentDone")!=="true")
        {   
            this.requestId=localStorage.getItem("requestID") 
        this.aaa.lmsCancelRedeem(this.AppointmentDocInfo.MobileNo,this.requestId).subscribe(data=>{   
            if(data.ResponceCode=="0")
            {
                let details=JSON.parse(data.Result);
                this.AppointmentDocInfo.walletBalanceCredits=Math.floor(details.BalancePoints);
                this.AppointmentDocInfo.walletAmount=0;
                this.AppointmentDocInfo.afterDiscount = this.AppointmentDocInfo.fee;          
                this.walletValid="1";
                this.redeem=false;
                this.walletOTP="";
                this.AppointmentDocInfo.walletApplied=false;     
                this.applyCouponDiscount();
            }
        })
        }
        this.getMerchntId();
        this.getWalletForLms(this.AppointmentDocInfo.patientemail);

        this.fssForm.patchValue({
            sourceApp: this.AppointmentDocInfo.sourceApp,
        });

        this.appForm.patchValue({
            sourceApp: this.AppointmentDocInfo.sourceApp,
        });
        this.paymentURL = c.paymentURL;
        this.FSSpaymentUrl = c.FSSpaymentUrl;
        


    }
    // LMS wallet points and registration handeling
    getWalletForLms(email) {
        this.spinnerService.show();
        if (this.walletFlag == "lms") {
            this.aaa.getWalletPointsForlms(email).subscribe(data => {
               
               // this.spinnerService.hide();
                if (data.ResponceCode === "1") {
                    this.lmsRegistration()
                }
                else {
                    let walletRes = data.Result.split("-");
                   
                    this.AppointmentDocInfo.walletBalanceCredits = (walletRes[0] == null ? 0 : walletRes[0]);
                    this.AppointmentDocInfo.walletBalanceCredits = Math.floor(this.AppointmentDocInfo.walletBalanceCredits);
                    this.lmsWalletValue(walletRes[0], walletRes[1])
                }

            });
        }
        //spinnerService.hide()
    }
    // LMS point calculation
    lmsWalletValue(points: number, value: number) {
        this.walletPointsValue = Math.round(value / points);
    }
    // LMS Registration
    lmsRegistration() {
        if (this.walletFlag == "lms") {
            let perams = {
                "patientID": this.AppointmentDocInfo.patientId,
                "FirstName": this.AppointmentDocInfo.PatientFirstName,
                "LastName": this.AppointmentDocInfo.PatientLastName,
                "registration_date": this.AppointmentDocInfo.createdDate,
                "Mobile": this.AppointmentDocInfo.MobileNo,
                "Email": this.AppointmentDocInfo.patientemail,
                "Gender": (this.AppointmentDocInfo.Gender == "1" ? "male" : (this.AppointmentDocInfo.Gender == "2"?"female":"others")),
                "DOB": this.AppointmentDocInfo.patientDOB
            }

            this.aaa.getRegisterForlms(perams).subscribe(data => {
                console.log(data)
                if (data.ResponceCode == "0") {
                   
                }
            })
        }

    }
    // LMS sms request
    lmsSmsRequest() {
        this.spinnerService.show();
        this.redeem=true;
        this.lmsWalletCal();
        
        let perams =
            {
                "Email": this.AppointmentDocInfo.patientemail,
                "PatientId": this.AppointmentDocInfo.patientId,
                "InterBookAppId": this.AppointmentDocInfo.blockId,
                "Mobile": this.AppointmentDocInfo.MobileNo,
                "CreditPoints":this.walletRedeem.toString()
            }

        this.aaa.lmsSmsRequest(perams).subscribe(data=>{
            this.spinnerService.hide();
            if(data.ResponceCode=="0")
            {
                let result=data.Result.split(",");
                    this.requestId=result[2];
                    this.AppointmentDocInfo.RedeemRequestId=result[2];
            }
            else
            {
                this.spinnerService.hide()
                alert(data.Result)
            }
        })
    }

    // LMS WALLET CALCULATIONS
    lmsWalletCal() {
        
        if (this.AppointmentDocInfo.afterDiscount <this.AppointmentDocInfo.walletBalanceCredits * this.walletPointsValue) {
            this.walletRedeem = this.AppointmentDocInfo.afterDiscount;
        }
        else if (this.AppointmentDocInfo.afterDiscount > this.AppointmentDocInfo.walletBalanceCredits * this.walletPointsValue || this.AppointmentDocInfo.afterDiscount == this.AppointmentDocInfo.walletBalanceCredits * this.walletPointsValue) {
            this.walletRedeem = this.AppointmentDocInfo.walletBalanceCredits * this.walletPointsValue;
        }
        this.applyCouponDiscount();
    }

    //LMS resend sms request
    lmsSmsResend() {
        this.spinnerService.show();
        let params =
            {
                "RedeemRequestId": this.requestId,
                "Mobile":this.AppointmentDocInfo.MobileNo
            }
        this.aaa.lmsResendSms(params).subscribe(data => {
            this.spinnerService.hide();
            if (data.ResponceCode == "0") {
                alert(data.Result);
            }
            else {
                this.spinnerService.hide()
                alert("some wrong try again...")
            }

        })
    }
    //LMS OTP verification.
    lmsOTPvalidate(otp) {
        this.spinnerService.show();
        let params =
            {

                "RedeemRequestId": this.requestId,
                "Mobile":this.AppointmentDocInfo.MobileNo,
                "OTP": otp.otp
            }
        this.aaa.lmsOTPvalidate(params).subscribe(data=>{
            this.spinnerService.hide();
            let details=JSON.parse(data.Result);
            if(data.ResponceCode=="0")
            {
                

                this.lmsWalletValue(Math.floor(details.RedeemedPoints),Math.floor(details.PointsValue));
                this.AppointmentDocInfo.walletBalanceCredits=Math.floor(details.BalancePoints);
                this.AppointmentDocInfo.walletAmount = Math.floor(details.RedeemedPoints);
                this.walletValid="2";
                alert(this.AppointmentDocInfo.walletAmount+" credits have been redeemed successfully")
                this.AppointmentDocInfo.walletApplied=true;
                this.redeem=false;
                
                localStorage.setItem("requestID",details.RequestNumber);
                this.applyCouponDiscount();      
            }
            else{
                
                this.spinnerService.hide()
                this.walletValid="1";
                this.AppointmentDocInfo.walletApplied=false;
                alert(details.Message);
            }
        })
    }

    // LMS cancel request
    lmsCancel()
    {
        this.spinnerService.show();
        this.aaa.lmsCancelRedeem(this.AppointmentDocInfo.MobileNo,this.requestId).subscribe(data=>{
            this.spinnerService.hide();
            if(data.ResponceCode=="0")
            {
                let details=JSON.parse(data.Result);

                this.AppointmentDocInfo.walletBalanceCredits=Math.floor(details.BalancePoints);
                this.AppointmentDocInfo.walletAmount=0;
                this.AppointmentDocInfo.afterDiscount = this.AppointmentDocInfo.fee;    
                this.redeem=false;      
                this.walletValid="1";
                this.walletOTP="";
                this.AppointmentDocInfo.walletApplied=false;
                this.applyCouponDiscount();
                alert(details.Message);

            }
        })
        this.spinnerService.hide()
    }
    lmsCancelRe()
    {
       this.spinnerService.show()
        this.aaa.lmsCancelRedeem(this.AppointmentDocInfo.MobileNo,this.requestId).subscribe(data=>{
            this.spinnerService.hide()
            if(data.ResponceCode=="0")
            {
                let details=JSON.parse(data.Result);
                this.AppointmentDocInfo.walletBalanceCredits=Math.floor(details.BalancePoints);
                this.AppointmentDocInfo.walletAmount=0;
                this.AppointmentDocInfo.afterDiscount = this.AppointmentDocInfo.fee;          
                this.walletValid="1";
                this.redeem=false;
                this.walletOTP="";
                this.AppointmentDocInfo.walletApplied=false;     
                this.applyCouponDiscount();
                

            }
        })
    }

    // time stringg
// timeStringName()
// {
//     let zone=new Date().toString()
//     this.timeString = zone.split("(")[1];
//     this.timeString =this.timeString.split(")")[0];
//  }




    getMerchntId() {
     
        this.aaa.getMarchantIdAnonymousforSourceApp().subscribe(t => {
          
            if (t.ResponceCode == "0" && t.Result != "") {
                this.AppointmentDocInfo.merchantId = t.Result;
                this.getSpecialitiesConsultationType();

            } else {
                this.spinnerService.hide();
                alert(t.Result);
            }
        })
    }

    getSpecialitiesConsultationType() {
      

        this.aaa.getSpecialitiesAnonymousByFlagForSourceApp().subscribe(t => {
           
            if (t.ResponceCode == "0" && t.Result != "") {
                this.spinnerService.hide();
                let isSpecialityExist = true;
                let specialities = JSON.parse(t.Result);
                for (let d of specialities) {
                    if (d.SpecialityId == this.AppointmentDocInfo.specialityId) {
                        isSpecialityExist = false;
                    }
                }

                this.AppointmentDocInfo.consultationTypeId = isSpecialityExist ?
                    this.specialityExistConsultationType : this.specialityNotExistConsultationType;

                this.blockSlot();
            } else {
                this.spinnerService.hide();
                alert(t.Result);
            }
        })
    }
    isShowCoupon: boolean = false;

    showCouponCode() {
        this.paymentInfo.couponCode = '';
        this.isShowCoupon = !this.isShowCoupon;
        this.AppointmentDocInfo.couponAmount = 0;
        this.clearCoupon();
    }

    clearWallet() {
        this.AppointmentDocInfo.walletAmount = 0;
        this.AppointmentDocInfo.walletBalanceCredits = 0;
        this.AppointmentDocInfo.redeemWalletrequest = 0;
        this.applyCouponDiscount();
    }

    clearCoupon() {
        this.AppointmentDocInfo.couponId = "0";
        this.AppointmentDocInfo.IsCouponApplied = false;
        this.AppointmentDocInfo.couponAmount = 0;
        this.applyCouponDiscount();
        
    }
    couponCancel() {
        this.paymentInfo.couponCode = "";
        this.couponValid = false;
        this.clearCoupon();
    }
    Coupon(coupon){
        if (this.paymentInfo.couponCode.trim() == '') {
            alert('invalid coupon');
            this.clearCoupon();
            return;
        }
        this.clearCoupon();
            this.aaa.getCouponDetailsAnonymousForSourceApp(coupon.code, this.AppointmentDocInfo.blockId).subscribe(result => {
                let res = JSON.parse(result.Result)[0];
                if (result.ResponceCode === "23") {
                    this.AppointmentDocInfo.couponId = res.CouponId;
                    this.AppointmentDocInfo.DiscountPercent=res.DiscountPercentage;
                    this.AppointmentDocInfo.couponAmount = (res.IsPercentage === true ? this.calculatePercentage(this.AppointmentDocInfo.DiscountPercent) : Number(res.DiscountAmount));
                    this.applyCouponDiscount();
                    this.AppointmentDocInfo.IsCouponApplied = true;
                    this.couponValid = true;
                }
                else if (result.ResponceCode === "22") {
                    alert(res)
                    this.clearCoupon();
                }
            })
    }
    calculatePercentage(percentage: number) {
        return Math.floor((percentage / 100) * this.AppointmentDocInfo.fee)
    }
   

    checkCouponSupportForSpeciality(couponDetails: any) {
        this.aaa.getCouponSpecialitiesAnonymousForSourceApp(couponDetails.CouponId).subscribe(t => {
          
            let isSpecialityExist: boolean = false;
            if (t.ResponceCode == "0" && t.Result != "") {
                var couponSpecialitiesDetails = JSON.parse(t.Result);

                for (let c of couponSpecialitiesDetails) {
                    if (c.SpecialityId == this.AppointmentDocInfo.specialityId) {
                        isSpecialityExist = true;
                    }
                }

                if (isSpecialityExist) {
                    let discountAmount = couponDetails.IsPercentage ? this.calculatePercentage(couponDetails.DiscountPercentage) : couponDetails.DiscountAmount;
                    this.AppointmentDocInfo.couponAmount = discountAmount;
                    this.AppointmentDocInfo.IsCouponApplied = true;
                    this.applyCouponDiscount();
                }

            } else {
                alert(t.Result);
            }
        })

    }
    applyCouponDiscount() {
       
         if (this.AppointmentDocInfo.afterDiscount > 0) {
             this.AppointmentDocInfo.afterDiscount = this.AppointmentDocInfo.fee - (this.AppointmentDocInfo.couponAmount + this.AppointmentDocInfo.walletAmount);
             this.AppointmentDocInfo.afterDiscount = this.AppointmentDocInfo.afterDiscount<0?0: this.AppointmentDocInfo.afterDiscount;
             this.AppointmentDocInfo.discountAmount = this.AppointmentDocInfo.fee -this.AppointmentDocInfo.afterDiscount;
         }
 
     }
    isShowWallet: boolean = false;
    showWallet() {
        this.paymentInfo.wallet = '';
        this.isShowWallet = !this.isShowWallet;
        this.clearWallet();

        this.aaa.getWalletBalncePointsForOneApollo().subscribe(t => {
          
            if (t.ResponceCode == "0" && t.Result != "") {

                this.AppointmentDocInfo.walletBalanceCredits = t.Result;

            } else {
                //this.AppointmentDocInfo.walletBalanceCredits = 0;
                alert(t.Result);
            }
        })

        //this.applyCouponDiscount();

    }

    applyWallet(template: any) {

        if (this.paymentInfo.wallet == '') {
            alert('invalid wallet');
            return;
        }

        this.paymentInfo.wallet = 1;
        this.clearWallet();

        this.aaa.getWalletPointsForOneApollo(this.paymentInfo.wallet, this.AppointmentDocInfo.blockId).subscribe(t => {
         
            if (t.ResponceCode == "0" && t.Result != "") {
           
                let waleetData = t.Result.split(',')
                this.AppointmentDocInfo.walletAmount = waleetData[1];
                this.AppointmentDocInfo.redeemWalletrequest = waleetData[2];
                this.modalRef = this.modalService.show(template, this.config);

            } else {
                alert(t.Result);
            }
        })

    }
    otp: any = "";
    onModelClose() {
        this.modalRef.hide();
    }
    resendOTP() {
        if (this.paymentInfo.wallet == '') {
            alert('invalid wallet');
            return;
        }
        this.clearCoupon();

        this.aaa.resendOTPForOneApollo(this.paymentInfo.couponCode, 0).subscribe(t => {
            
            if (t.ResponceCode == "0" && t.Result != "") {
                //var couponDetails = JSON.parse(t.Result);
                //console.log(couponDetails[0]);
            } else {
                alert(t.Result);
            }
        })
    }
    verifyOTP() {
        if (this.otp == "") {
            alert("invalid otp");
        }

        if (this.paymentInfo.wallet == '') {
            alert('invalid wallet');
            return;
        }

        this.clearWallet();

        let param = {
            'passCode': this.otp,
            'refBillNo': this.AppointmentDocInfo.merchantId,
            'redeemWalletrequest': '',
            'customerPoints': this.paymentInfo.wallet
        };

        this.aaa.getWalletPointsRedeemptionOneApolloForSourceApp(param).subscribe(t => {
           
            if (t.ResponceCode == "0" && t.Result != "") {
                this.applyCouponDiscount();


            } else {
                //alert(t.Result);
            }
        })
    }

    thirdPartyPayment() {
        let payment = {
            'marchantId': this.AppointmentDocInfo.merchantId,
            'amount': this.AppointmentDocInfo.fee,
            'DiscAmount': this.AppointmentDocInfo.couponAmount + this.AppointmentDocInfo.walletAmount,
            'IsCouponApplied': this.AppointmentDocInfo.couponAmount > 0 ? true : false,
            'CouponId': this.paymentInfo.couponId,
            'TransactionAmount': this.AppointmentDocInfo.afterDiscount,
            'WalletPoints': this.paymentInfo.wallet,
            'CurrencyFormat': this.AppointmentDocInfo.fee
        }
        this.aaa.thirdPartyPayment(payment).subscribe(t => {
        })
    }
    gateWay: any = "";
    onSubmit(e: any): void {
        localStorage.setItem("totalDetails",JSON.stringify(this.AppointmentDocInfo));       
        let modeofpay: string;
        if (this.selectedType == '1') {
            modeofpay = 'Credit card';
        }
        else if (this.selectedType == '2') {
            modeofpay = 'Debit card';
        }
        else if (this.selectedType == '3') {
            modeofpay = 'Debit card + ATM pin';
        }
        else if (this.selectedType == '4') {
            modeofpay = 'Net banking';
        }

        this.cs.setGA('Online Appointment Payment', 'Online Consultations Mode of Payment', 'Online Consultations_Mode of Payment', 'Online Consultations_<' + modeofpay + '>_<' + this.paymentType + '>_<' + this.AppointmentDocInfo.IsCouponApplied + '>');
       
        
        if(this.AppointmentDocInfo.afterDiscount==0)
        {
            this.paymentBypass()
        }
        else
        {
            e.target.submit();
        }
    }
    //zero payment bypass service
    paymentBypass() {
        let perams = {
            "authenticationTicket": this.AppointmentDocInfo.authenticationTicket,
            "PatientId": this.AppointmentDocInfo.patientId,
            "IntermAppId": this.AppointmentDocInfo.blockId,
            "MarchantId": this.AppointmentDocInfo.merchantId,
            "OneapolloCouponId": this.AppointmentDocInfo.couponId,
            "OneApolloWalletId": "0",
            "AskApolloCouponId": this.AppointmentDocInfo.couponId,
            "TotalAmount": this.AppointmentDocInfo.fee,
            "NetAmount": this.AppointmentDocInfo.afterDiscount,
            "DiscountPercent": this.AppointmentDocInfo.DiscountPercent,
            "Discamount": this.AppointmentDocInfo.discountAmount
        }

        this.aaa.zeroPaymentBypass(perams).subscribe(data => {
            if (data.ResponceCode == "0") {
                alert("payment done successfully . Thank You")
                this.router.navigate(['onlinependingcasesheet']);
            }
            else {
                alert(data.ResponceCode);
            }
        })
    }


    // disable button
    disable() {
        this.gateWay = "";
    }


    submitPay() {
        this.thirdPartyPayment();
    }

    blockSlot() {

        this.aaa.BlockAppointmentEdocforSourceApp(this.AppointmentDocInfo).subscribe(t => {
          
            if (t.ResponceCode == "0" && t.Result != "") {
                if (Number(t.Result)) {
                    this.AppointmentDocInfo.blockId = t.Result;
                    //this.thirdPartyPayment();
                } else {
                    let uri = localStorage.getItem('dsuri');
                    //window.
                    alert(t.Result);
                    window.location.href = uri;
                }
            } else {
                let uri = localStorage.getItem('dsuri');
                //window.
                alert(t.Result);
                window.location.href = uri;
            }
        })

        //this.router.navigate(['onlinependingcasesheet']);
    }

    changeSearch() {
        let uri = localStorage.getItem('dsuri');
        window.location.href = uri;
    }

}
