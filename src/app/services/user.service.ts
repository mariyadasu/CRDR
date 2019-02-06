import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse } from '@angular/common/http';
import { Response } from "@angular/http";
import { Router,NavigationEnd } from '@angular/router';

import { AAAuthService } from '@aa/services/auth.service';
import { UserInfo, aaToken, OCUserInfo, OrderMedicines,appointmentDetails } from '@aa/structures/user.interface';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { constants as c } from './../constants';

import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs';
import * as moment from 'moment';
import { CommonService } from '@aa/services/common.service';



@Injectable()
export class UserService 
{
	userInfo: UserInfo = {} as UserInfo;
	ocUserTracker = new Subject<OCUserInfo>();

	appointmentDetails: appointmentDetails = {} as appointmentDetails;

	ocOrderMedicinesTracker = new Subject<OrderMedicines>();

	private appointmentIdTracker = new BehaviorSubject('');
  	currentAppointmentId = this.appointmentIdTracker.asObservable();

  	private visitIdTracker = new BehaviorSubject('');
  	currentVisitedId = this.visitIdTracker.asObservable();

  	private appointmentDetailsTracker = new BehaviorSubject(this.appointmentDetails);
  	currentAppointment = this.appointmentDetailsTracker.asObservable();

  	public isLeftNavClosed = new Subject<string>();

	constructor(private http: HttpClient,
  		private route:Router,
  		private auth: AAAuthService,
		  private cs: CommonService
		 ) 
  	{ 

  	}

  	getOCUserDetails() 
  	{
  		let apiEndpoint = c.OCApiUrl + 'GetUserDetailsforSourceApp';
	    let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      'userId': this.auth.getSessionToken().AskApolloReferenceIdForSelf,
	      'sourceApp': c.OCSourceApp,
	    }
  		this.http.post(apiEndpoint, params)
  		.subscribe(
	      (data: OCUserInfo) => {
	        this.ocUserTracker.next(data);
	      }
	    );
    }

  	/*
	*  Get the consultants details 
	*/
	geConsultations() 
	{
		this.userInfo = this.auth.getuserInfo();
		let apiEndpoint = c.Apiurl + 'GetAllAppointmentsForDashboardUsingUseridAndPatientIdv4/'+this.cs.edocEncryption(this.userInfo.userId)+'/'+this.cs.edocEncryption(this.userInfo.patientId);
	    return this.http.get(apiEndpoint);
	}
	/*
	*  Get the current user details
	*/
	getUserDetails():Observable<OCUserInfo> 
	{
		let apiEndpoint = c.OCApiUrl + 'GetUserDetailsforSourceApp';
	    let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      'userId': this.auth.getSessionToken().AskApolloReferenceIdForSelf,
	      'sourceApp': c.OCSourceApp,
	    }

	     return this.http.post<OCUserInfo>(apiEndpoint, params)
	     				 .catch(this.errorHandler);
	}
	/*
	*	For handling http errors
	*/
	errorHandler(error:HttpErrorResponse)
	{
		return Observable.throw(error.message || "Server Error");
	}
	/*
	* online consultation upcommingAppointements List
	*/
	// getUpcomingAppointmentDetails(){

	// 	let apiEndpoint = c.OCApiUrl + 'GetAppointmentDetailsforWeb';
	//     let params = {
	//       'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	//       'patientId': this.auth.getSessionToken().AskApolloReferenceIdForSelf,
	//       'sourceApp': c.OCSourceApp
	// 	}
	// 	debugger
	//     return this.http.post(apiEndpoint, params);
	// }

	getUpcomingAppointmentDetails(timeZone:string){

		let apiEndpoint = c.OCApiUrl + 'GetAppDetailsforWeb';
	    let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      'patientId': this.auth.getSessionToken().AskApolloReferenceIdForSelf,
		  'sourceApp': c.OCSourceApp,
		  'timezone':timeZone
		}
	    return this.http.post(apiEndpoint, params);
	}
	/*
	* online consultation PastAppointements List
	*/
	// getPastAppointmentDetails()
	// {
	
	// 	let apiEndpoint = c.OCApiUrl + 'GetPastAppointmentDetailsforWeb';
	//     let params = {
	//       'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	//       'patientId': this.auth.getSessionToken().AskApolloReferenceIdForSelf,
	//       'sourceApp': c.OCSourceApp
	//     }
	//     return this.http.post(apiEndpoint, params);
	// }

	getPastAppointmentDetails(timeZone:string)
	{
	
		let apiEndpoint = c.OCApiUrl + 'GetPastAppDetailsforWeb';
	    let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      'patientId': this.auth.getSessionToken().AskApolloReferenceIdForSelf,
		  'sourceApp': c.OCSourceApp,
		  'timezone':timeZone
		}
	
	    return this.http.post(apiEndpoint, params);
	}
	/*
	* online consultation Appointementid based patient details displayed
	*/
	getAppointmentDetailsByAppointmentId(appid,apptype){

		let apiEndpoint = c.OCApiUrl + 'GetAppointmentDetailsByAppointmentIdforSourceApp';
		let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      'patientId': this.auth.getSessionToken().AskApolloReferenceIdForSelf,
	      'sourceApp': c.OCSourceApp,
	      'appointmentId':appid,
	      'type':apptype,
	      'isCaseclosed':'0',
	    }
	    return this.http.post(apiEndpoint, params);
	}

	/*
	*  Get the relationships data
	*/
	getRelationshipsData() 
	{
		let apiEndpoint = c.OCApiUrl + 'GetRelationsforSourceApp';
	    let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      'sourceApp': c.OCSourceApp,
	    }
		return this.http.post(apiEndpoint, params);
	}
	/*
	*  Add family member
	*/
	addFamilyMember(formData,userData,uhid:string):Observable<any> 
	{
		let apiEndpoint = c.OCApiUrl + 'AddRelativeforSourceApp';
	    let params = {
	    	"authenticationTicket":this.auth.getSessionToken().OnlineConsultToken,
			"patientId":userData.PatientId,
			"relationFirstName":formData.relationFirstName,
			"relationLastName":formData.relationLastName,
			"age":formData.age,
			"gender":formData.gender,
			"relationId":formData.relationId,
			"ruhid":uhid=="0"?"":uhid,
			"createdBy":userData.PatientId,
			"createdDate":formData.createdDate,
			"imageName":formData.imageName,
			"filename":formData.filename,
			"fileext":formData.fileext,
			"filecontent":formData.filecontent,
			"DOB":formData.dob,
			"sourceApp":c.OCSourceApp,
		}

		return this.http.post(apiEndpoint, params);
	}

	addFamilyMemberinCasesheet(formData,uhid:string):Observable<any> 
	{
		let apiEndpoint = c.OCApiUrl + 'AddRelativeforSourceApp';
	    let params = {
	    	"authenticationTicket":this.auth.getSessionToken().OnlineConsultToken,
			"patientId":this.auth.getSessionToken().AskApolloReferenceIdForSelf,
			"relationFirstName":formData.relationFirstName,
			"relationLastName":formData.relationLastName,
			"age":formData.age,
			"gender":formData.gender,
			"relationId":formData.relationId,
			"ruhid":"",
			"createdBy":this.auth.getSessionToken().AskApolloReferenceIdForSelf,
			"createdDate":formData.createdDate,
			"imageName":formData.imageName,
			"filename":formData.filename,
			"fileext":formData.fileext,
			"filecontent":formData.filecontent,
			"DOB":formData.dob,
			"sourceApp":c.OCSourceApp,
		}

		return this.http.post(apiEndpoint, params);
	}
	/*
	*  Get the all family members data
	*/
	getAllFamilyMembersData() 
	{
		let apiEndpoint = c.OCApiUrl + 'GetAllRelativesByPatientforSourceApp';
	   	let params = {
	     	'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	     	'patientId': this.auth.getSessionToken().AskApolloReferenceIdForSelf,
			 'sourceApp': c.OCSourceApp,
			 'logId':localStorage.getItem('logId')
	   	}
		return this.http.post(apiEndpoint, params);
	}
	/*
	* Cancel the appointment
	*/
	cancelAppointment(cancelReason,appId,visitId){

    	let apiEndpoint = c.OCApiUrl + 'CloseAppointmentforSourceApp';
    	let params = {
	     "authenticationTicket": this.auth.getSessionToken().OnlineConsultToken,     
	     "appId":appId,
	     "visitId":visitId,
	     "cancelReason":cancelReason,
	     "sourceApp":c.OCSourceApp,
    	}  
	    return this.http.post(apiEndpoint, params);
    }
    /*
    *	Disable the family member
    */
    disableRelativeByPatientforSourceApp(PatRelationId,PatientId) 
	{
		let apiEndpoint = c.OCApiUrl + 'DisableRelativeByPatientforSourceApp';
	    let params = {
	    	"authenticationTicket":this.auth.getSessionToken().OnlineConsultToken,
			"patientId":PatientId,
			"patRelationId":PatRelationId,
			"sourceApp":c.OCSourceApp,
		}

		return this.http.post(apiEndpoint, params);
	}
	/*
	*	Send OTP
	*/
	sendOTP(email,mobile) 
	{
    let apiEndpoint = c.Apiurl + 'GetMobileOtpFromOnlineConsulation';
    let params = {
      email: email,
	  mobileNumber: '91' + mobile,
	  logId:localStorage.getItem('logId')
    }
    return this.http.post(apiEndpoint, params);
  }
  	/*
	*  update profile
	*/
	updateUprofile(userData) 
	{
		let apiEndpoint = c.OCApiUrl + 'UpdateProfileWithBloodforSourceApp';
		let params = {
	    	"authenticationTicket":this.auth.getSessionToken().OnlineConsultToken,
			"patientId":userData.patientId,
			"countryCode":userData.countryCode,
			"state":userData.state,
			"city":userData.city,
			"zipCode":userData.zipCode,
			"address":userData.address,
			"phoneNo":userData.phoneNo,
			"altPhoneNo":userData.altPhoneNo,
			"createdBy":userData.patientId,
			"createdDate":userData.createdDate,
			"age":userData.age,
			"gender":userData.gender,
			"ImageName":userData.imageName,
			"filename":userData.filename,
			"fileext":userData.fileext,
			"filecontent":userData.filecontent,
			"countryId":userData.countryId,
			"stateId":userData.stateId,
			"cityId":userData.cityId,
			"DOB":userData.dob,
			"MobileOTP":userData.MobileOTP,
			"BloodGroup":userData.bloodGroup,
			"MMUhid":userData.MMUhid,
			"sourceApp":c.OCSourceApp,
		}
		/*
		let params = {
	    	"authenticationTicket":this.auth.getSessionToken().OnlineConsultToken,
			"patientId":userData.patientId,
			"countryCode":userData.countryCode,
			"state":userData.state,
			"city":userData.city,
			"zipCode":userData.zipCode,
			"address":userData.address,
			"phoneNo":userData.phoneNo,
			"altPhoneNo":userData.altPhoneNo,
			"createdBy":userData.patientId,
			"createdDate":userData.createdDate,
			"age":userData.age,
			"gender":userData.gender,
			"ImageName":userData.imageName,
			"filename":userData.filename,
			"fileext":userData.fileext,
			"filecontent":userData.filecontent,
			"countryId":userData.countryId,
			"stateId":userData.stateId,
			"cityId":userData.cityId,
			"DOB":userData.dob,
			"MobileOTP":userData.MobileOTP,
			"MMUhid":userData.uhid,
			"sourceApp":c.OCSourceApp,
		}*/

		return this.http.post(apiEndpoint, params);
	}
	/*
	*	Get the all order medicines details
	*/
	getOrderMedicines() 
  	{
  		let apiEndpoint = c.OCApiUrl + 'MyOrderPharmacyDetailsByPatientforSourceApp';
	    let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      'patientId': this.auth.getSessionToken().AskApolloReferenceIdForSelf,
	      'sourceApp': c.OCSourceApp,
	    }
  		this.http.post(apiEndpoint, params)
  		.subscribe(
	      (data: OrderMedicines) => {
	        this.ocOrderMedicinesTracker.next(data);
	      }
	    );
    }
    /*
    *	Save the feedback
    */
    saveFeedback(feedbackData)
    {
    	let apiEndpoint = c.OCApiUrl + 'SetFeedbackByPatientIdforSourceApp';
	    let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      'patientId': this.auth.getSessionToken().AskApolloReferenceIdForSelf,
	      'appointmentId': feedbackData.appointmentId,
	      'otherInfo': 'other info',
	      'rating': feedbackData.rating,
	      'question': feedbackData.question,
	      'answer': feedbackData.answer,
	      'sourceApp': c.OCSourceApp
	    }
	    return this.http.post(apiEndpoint, params);
    }
    /*
    *	Appointment id tracker
    */
    changeAppointmentId(appointId: string) 
  	{
    	this.appointmentIdTracker.next(appointId)
  	}
    /*
    *	Save the order medicine form
    */
    saveOrderMedicine(orderMedicineData,userInfo,appointmentId,age)
    {
    	// gender manipulation 
    	var gender;
    	if(userInfo.Gender == 'Male' || userInfo.Gender == 1 || userInfo.Gender == 'M')
    	{
    		gender = '1';
    	}
    	else if(userInfo.Gender == 'FeMale' || userInfo.Gender == 2 || userInfo.Gender == 'F')
    	{
    		gender = '2';
    	}
    	else if(userInfo.Gender == 'Others' || userInfo.Gender == 3 || userInfo.Gender == 'O')
    	{
    		gender = '3';
    	}
    	else
    	{
    		gender = '1';
    	}
    	let apiEndpoint = c.OCApiUrl + 'SubmitPharmacyRequestDefaultDetailsforSourceApp';
	    let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      'FirstName': userInfo.FirstName,
	      'LastName': userInfo.LastName || userInfo.FirstName,
	      'Gender': gender,
	      'Age': userInfo.Age || age,
	      'MobileNo': userInfo.Mobileno,
	      'City': orderMedicineData.city,
	      'Zip': orderMedicineData.zipCode,
	      'Address': orderMedicineData.address,
	      'MailID': userInfo.EmailId,
	      'ShippingMethod': orderMedicineData.ShippingMethod,
	      'PaymentMethod': 'COD',
	      'SiteID': '102',
	      'VendorName': c.AdminId,
	      'URL': c.DomainURL,
	      'Source': 'Website',
	      'AppointmentId': appointmentId,
	      'CreatedDate': moment().format('DD-MM-YYYY'),
	      'PatientType': 'Self',
	      'sourceApp': c.OCSourceApp
	    }
	    return this.http.post(apiEndpoint, params);
    }
    /*
    *	Save the support form
    */
    saveSupport(supportData)
    {
    	let apiEndpoint = c.OCApiUrl + 'InsertPatinetSupport';
	    let params = {
	      'adminId': c.AdminId,
	      'adminPassword': c.AdminPassword,
	      'SupportHead': supportData.supportOption,
	      'AppointmentID': 0,
	      'ConsultMode': '',
	      'SupportOption': '',
	      'ChangeNumber': supportData.mobileNumber || '',
	      'CreatedBy': this.auth.getSessionToken().AskApolloReferenceIdForSelf,
	      "sourceApp": c.OCSourceApp
	    }
	    return this.http.post(apiEndpoint, params);
    }
    /*
    *	change the consultation mode type
    */
    changeConsultationMode(consultationMode,appointmentId)
    {
    	let apiEndpoint = c.OCApiUrl + 'InsertPatinetSupport';
	    let params = {
	      'adminId': c.AdminId,
	      'adminPassword': c.AdminPassword,
	      'SupportHead': 'I want to change mode of consultation',
	      'AppointmentID': appointmentId,
	      'ConsultMode': consultationMode,
	      'SupportOption': '',
	      'ChangeNumber': '',
	      'CreatedBy': this.auth.getSessionToken().AskApolloReferenceIdForSelf,
	      "sourceApp": c.OCSourceApp
	    }
	    return this.http.post(apiEndpoint, params);
    }
    /*
    *	submit the invoice
    */
    submitInvoice(consultationMode,appointmentId)
    {
    	let apiEndpoint = c.OCApiUrl + 'InsertPatinetSupport';
	    let params = {
	      'adminId': c.AdminId,
	      'adminPassword': c.AdminPassword,
	      'SupportHead': 'I need copy of my Invoice',
	      'AppointmentID': appointmentId,
	      'ConsultMode': consultationMode,
	      'SupportOption': '',
	      'ChangeNumber': '',
	      'CreatedBy': this.auth.getSessionToken().AskApolloReferenceIdForSelf,
	      "sourceApp": c.OCSourceApp
	    }
	    return this.http.post(apiEndpoint, params);
	}
    /*
    *	Get the doctor details based on doctor id
    */
    getDoctorDetails(doctorId)
    {
    	let apiEndpoint = c.OCApiUrl + 'GetDoctorDetailsByDoctorIdforSourceApp';
	    let params = {
	      "AdminId": c.AdminId,
		  "AdminPassword": c.AdminPassword,
		  "doctorId": doctorId,
		  "sourceApp": c.OCSourceApp
	    }
	    return this.http.post(apiEndpoint, params);
    }
    /*
    *	Get all calrifications options
    */
    getClarificationOptions()
    {
    	let apiEndpoint = c.OCApiUrl + 'GetClarificationCategoryForSOurceApp';
	    let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
		  "sourceApp": c.OCSourceApp
	    }
	    return this.http.post(apiEndpoint, params);	
    }
    /*
    *	Submit clarifications
    */
    submitClarifications(questions,answers,appointmentId)
    {
    	let apiEndpoint = c.OCApiUrl + 'SetClarificationRequestforSourceApp';
	    let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      "appointmentId": appointmentId.toString(),
	      "clarificationCategoryId": questions,
	      "patientQuery": answers,
	      'patientId': this.auth.getSessionToken().AskApolloReferenceIdForSelf,
	      "sourceApp": c.OCSourceApp
	    }
	    return this.http.post(apiEndpoint, params);	
    }
    /*
    *	Download prescription
    */
    downloadPrescription(visitedId)
    {
    	let apiEndpoint = c.OCApiUrl + 'GetDownloadPrescriptionforSourceApp';
	    let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      "visitId": visitedId.toString(),
		  "sourceApp": c.OCSourceApp
	    }
	    return this.http.post(apiEndpoint, params);	
    }
    /*
    *	Submit the free review
    */
    submitFreeReview(params)
    {
    	//console.log('In services');
    	//console.log(params);
    	let apiEndpoint = c.OCApiUrl + 'BlockAppointmentEdocforSourceApp';
	    return this.http.post(apiEndpoint, params);	
    }
    /*
    *	Upload report
    */
    submitUploadReports(formData,params)
    {
    	let apiEndpoint = c.uploadReports + 'UploadDocument.ashx?'+params;
    	return this.http.post(apiEndpoint, formData);	
    }
    /*
    * set visit id
    */
    setVisitId(value: string) 
    {
    	this.visitIdTracker.next(value);
   	}
   	
   	/*
    * Appointment details
    */
    setAppointmentDetails(value) 
    {
    	this.appointmentDetailsTracker.next(value);
   	}
  	/*	
  	* Get case sheet details
    */
    getCasesheetDetails(visitedId)
    {
    	let apiEndpoint = c.OCApiUrl + 'GetCasesheetDetailsforSourceApp';
    	let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      "visitId": visitedId.toString(),
		  "sourceApp": c.OCSourceApp
	    }
    	return this.http.post(apiEndpoint, params);	
    }
    /*	
  	* Get prescription details
    */
    getPrescriptionDetails(visitedId)
    {
    	let apiEndpoint = c.OCApiUrl + 'GetPrescriptionforSourceApp';
    	let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      "visitId": visitedId.toString(),
		  "sourceApp": c.OCSourceApp
	    }
    	return this.http.post(apiEndpoint, params);	
    }
     /*	
  	* Get prescription and case sheets attachments
    */
    getAttachmentss(visitedId)
    {
    	let apiEndpoint = c.OCApiUrl + 'GetDocumentsForCaseSheetforSourceApp';
    	let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      "visitId": visitedId.toString(),
		  "sourceApp": c.OCSourceApp
	    }
    	return this.http.post(apiEndpoint, params);	
	}
	deleteAttachmentss(documentId)
    {
    	let apiEndpoint = c.OCApiUrl + 'DeleteUploads';
    	let params = {
	      'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      "documentId": documentId.toString()
	    }
    	return this.http.post(apiEndpoint, params);	
    }
     /*	
  	* Appointment reschedule
    */
    reschedule(appData,slot_date,slot_time)
    {
    	let apiEndpoint = c.OCApiUrl + 'EdocChangeDoctorRescheduleforSourceApp';
    	let params = {
	      	'authenticationTicket': this.auth.getSessionToken().OnlineConsultToken,
	      	"appointmentId": appData.AppointmentId,
	      	"isRescheduleRequest": "true",
	      	"reScheduledDate": slot_date, // "2015-08-08"
	      	"reScheduledTime": slot_time, // "12:15-12:30"
	      	"doctorId":appData.DoctorId,
	       	"sourceApp": c.OCSourceApp
		}
		
    	return this.http.post(apiEndpoint, params);	
    }
    /*
	* Cancel the appointment for physical appointments
	*/
	cancelPhysicalAppointment(cancelReason,appId)
	{

    	let apiEndpoint = c.BaseApiurl + 'api/eDocConsultation/CancelConsultationAppointmentIneDoc/';
    	let params = {
	     	"appointmentId": appId,
	     	"modifiedBy": ((this.auth.getuserInfo().userId) ? this.auth.getuserInfo().userId : 0),
	     	"comments":cancelReason,
	     	"modifiedIP":this.cs.getIP(),
	     	"LogId":this.auth.getLogId()
    	}  
	    return this.http.post(apiEndpoint, params);
	}
	GetHospitalInformationOnHospitalName(HospitalName)
	{
		let apiEndpoint = c.MultiSpecialityUrl + 'GetHospitalLatLongForAngularOnHospitalName/'+ HospitalName;
	    return this.http.get(apiEndpoint);
	}

	/*
	*	Left nav tracker
	*/
	changeLeftNavStatus(value: string) 
  	{
    	this.isLeftNavClosed.next(value); //it is publishing this value to all the subscribers that have already subscribed to this message
	  }
	  


}
