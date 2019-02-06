import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders,HttpErrorResponse } from '@angular/common/http';

import { constants as c } from './../constants';

@Injectable()
export class DirectoriesService {

  	constructor(private http: HttpClient) 
  	{ 

  	}
  	/*
	*  Get the city index date
	*/
	geCityIndexData() 
	{
		let apiEndpoint = c.Apiurl + 'GetAllCitiesForHospitals';
	    return this.http.get(apiEndpoint);
	}
	/*
	* Get specialist list index data
	*/
	getSpecialistIndex(){
		let specialistEndpoint = c.MultiSpecialityUrl + 'GetSpecialistIndexForApolloDirectory';
	    return this.http.get(specialistEndpoint);
	}
	/*
	*	Get the specialist directories data
	*/
	getSpecialistAutoSuggestionData(searchString)
	{
		let apiEndpoint = c.Apiurl + 'GetAutoSuggestionFromAskApollov3/12/'+searchString;
	    return this.http.get(apiEndpoint);
	}
	/*
	*	Get the speciality directories data
	*/
	getSpecialityIndex(){
		let specialityEndpoint = c.MultiSpecialityUrl + 'GetSpecialityIndexForApolloDirectory';
	    return this.http.get(specialityEndpoint);
	}
	/*
	*	Get the doctor index data
	*/
	getDoctorsIndex(){
		let doctorsEndpoint = c.MultiSpecialityUrl + 'GetDoctorsIndexForApolloDirectory';
	    return this.http.get(doctorsEndpoint);
	}
	/*
	*	Get the city language index data
	*/
	getCityLanguageIndex(){
		let cityLanguageEndpoint = c.MultiSpecialityUrl + 'GetCityLanguageIndexForApolloDirectory';
	    return this.http.get(cityLanguageEndpoint);
	}
	/*
	*	Get the language index data
	*/
	getLanguageIndexData(){
		let languageEndpoint = c.MultiSpecialityUrl + 'GetLanguageIndexForApolloDirectory';
	    return this.http.get(languageEndpoint);
	}
	/*
	*	Get the city speciality index data
	*/
	getCitySpecialityIndexData(){
		let languageEndpoint = c.MultiSpecialityUrl + 'GetCitySpecialityIndexForApolloDirectory';
	    return this.http.get(languageEndpoint);
	}
	/*
	*	Get the city specialist index data
	*/
	getCitySpecialistIndexData(){
		let languageEndpoint = c.MultiSpecialityUrl + 'GetCitySpecialistIndexForApolloDirectory';
	    return this.http.get(languageEndpoint);
	}
	/*
	*	Get the Health checks index data
	*/
	getHealthChecksIndexData(){
		let languageEndpoint = c.MultiSpecialityUrl + 'GetHealthChecksIndexForApolloDirectory';
	    return this.http.get(languageEndpoint);
	}
	//Added By Saravana for Health Check Auto Suggestions
	GetHealthCheckAutoSuggestions(searchText:string){
		let varHealthCheckAutoSuggestionEndPoint = c.MultiSpecialityUrl + "GetHealthChecksAutoSuggestionForApolloDirectory/" + searchText;
		return this.http.get(varHealthCheckAutoSuggestionEndPoint);
	}
	GetHealthChecksOnSelectedAutoSuggestion(healthCheckId:number){
		let varHealthCheckAutoSuggestionResultsEndPoint = c.MultiSpecialityUrl + "GetHealthChecksAutoSuggestionResultsForApolloDirectory/" + healthCheckId;
		return this.http.get(varHealthCheckAutoSuggestionResultsEndPoint);
	}
	/*
	* Get the Diseases&Treatments index data
	* status:1(Treatments),2(Diseases)
	*/
	getDiseaseTreatmentIndexData(status){
		let dtEndpoint = c.MultiSpecialityUrl + 'GetDiseasesAndTreatmentsIndexForApolloDirectory/'+status;
	    return this.http.get(dtEndpoint);
	}

	/*
	* Get the City Groupname index data
	*/
	getCityGroupnameIndexData(){
		let cgEndpoint = c.MultiSpecialityUrl + 'GetCityGroupNameIndexForApolloDirectory';
	    return this.http.get(cgEndpoint);
	}

	/*
	*	Get the Medical Glossary index data
	*/
	getMedicalGlossaryIndexData(index){
		let mgEndpoint = c.MultiSpecialityUrl + 'GetMedicalGlossaryForApolloDirectory/'+index;
	    return this.http.get(mgEndpoint);
	}
	/*
	*	Get the city Hospital index data
	*/
	getCityHospitalIndexData(){
		let cHosEndpoint = c.MultiSpecialityUrl + 'GetCityHospitalForApolloDirectory';
	    return this.http.get(cHosEndpoint);
	}
	/*
	*	Get the city locality index data
	*/
	getCityLocalityIndexData(){
		let cLocEndpoint = c.MultiSpecialityUrl + 'GetCityLocalityForApolloDirectory';
	    return this.http.get(cLocEndpoint);
	}
	

}
