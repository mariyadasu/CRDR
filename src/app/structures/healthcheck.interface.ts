export interface healthCheckIndex {
	HospitalName: string,
	UrlHospitalName: string,
	CityName: string,
	UrlCityName: string,
	HealthCheckName: string,
	UrlHealthCheckName: string
	//HealthCheckList:[]
}
export interface HealthCheckAutoSuggestion {
	CityName: string
	HealthCheckName: string
	HospitalName: string
	UrlCityName: string
	UrlHealthCheckName: string
	UrlHospitalName: string
	HealthCheckId: number;
}

export interface HelathCheckDiagnose {

	RequestId:number,
	MMAppointmentId:number,
	AppointmentId: number,
	HRAStatusCode: number,
	SystemId: number,
	objPatientMMInfo:
	{
		Gender: number
	},
	objHRQSymptomBO: [
		{
			SymptomId: number,
			SymptomName: string
		}
	],
}

export interface SelectedDiagnose{
	  RegionId : any;
	  SystemId : any;
	  SymptomIds:any;
}

export interface HRQQuestionAndAnswersLevelTwo {

	SymptomId: number,
	SymptomHeading: string,
	lstHRAQuestionsAnswersBO: [{
		AttributeID: number,
		HRAQuestion: string,
		Answer: string,
		objHRAAnswers: [{
			ControlID: number,
			AttributeValue: string,
			Selected: number,
			checked?:boolean
		}]
	}]
}

export interface HRQQuestionAndAnswers {

	SymptomId: number,
	SymptomHeading: string,
	levelTwo?:HRQQuestionAndAnswersLevelTwo[]
	lstHRAQuestionsAnswersBO: [{
		AttributeID: number,
		HRAQuestion: string,
		Answer: string,
		objHRAAnswers: [{
			ControlID: number,
			AttributeValue: string,
			Selected: number,
			checked?:boolean
		}],
	}]
}
export interface SubmitHRQQuestionAndAnswers {

	AppointmentId: number,
	SystemId: number,
	lstHRAQuestionsBO: [{
		SymptomId: number,
		lstHRAQuestionsAnswersBO: [{
			AttributeID: number,
			objHRAAnswers: [{
				ControlID: string,
				AttributeValue: string,
			}]
		}]
	}]

}
export interface ObjHRAAnswers {
	controlID?: number,
	attributeValue?: any
}
export interface LstHRAQuestionsAnswersBO {
	attributeID?: number,
	objHRAAnswers?: ObjHRAAnswers[]
}
export interface LstHRAQuestionsBO {
	systemId?: number,
	symptomId?: number,
	lstHRAQuestionsAnswersBO?:LstHRAQuestionsAnswersBO[]
}

export interface LstHRAQuestionsBOForHealth {
	systemId?: number,
	symptomId?: any,
	lstHRAQuestionsAnswersBO?:LstHRAQuestionsAnswersBO[]
}

export interface SubmitHRQQuestionAndAnswersFinal {

	RequestId?: number,
 	MMAppointmentId?:number,
 	PAHCNumber?:string,
 	RegionID?:number,
 	Loginid?:string,
 	PatientUHID?:string
	lstHRAQuestionsBO?: LstHRAQuestionsBO[];
}
export interface HealtchCheckComplaints{	
	AppointmentId:number,
	SystemId:number,
	SymptomIds:number
}

export interface HealthAppointmentdata{
	appointmentData:any;
}
export interface HealthRequestAppointment{

	RequestId:number,
	MMAppointmentId:number,
	RegionID:number
}