import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Subject } from 'rxjs/Subject';

import { UtilsService } from '@aa/services/utils.service';

import { constants as c } from './../constants';
import { city, trend } from '@aa/structures/city.interface';
import { hospital } from '@aa/structures/hospital.interface';
import { doctor, docDetail, doctorNew } from '@aa/structures/doctor.interface';
import { speciality } from '@aa/structures/speciality.interface';
import { Observable } from 'rxjs';

import { ErrlogService } from '@aa/services/errlog.service';
import { CommonService } from '@aa/services/common.service';
import { StoreService } from '@aa/services/store.service';

import { AAAuthService } from '@aa/services/auth.service';
//let  AllCitiesJson = require('./../../assets/json/cities.json');

export interface searchResult {
  value: string;
  label: string;
  type: number; // 1 - Groupname; 2 - Speciality
}

export interface boilerContent {
   city: string;
  speciality: string;
  SpecialityContent: string;
  BoilerContent: string;
}

@Injectable()
export class SearchService {

  selectedCityTracker = new Subject<city>();
  citiesTracker = new Subject<city[]>();
  selectedCity: city;
  cities: city[] = [];

  hospitalsTracker = new Subject<hospital[]>();
  hospitals: hospital[] = [];

  doctorListTracker = new Subject<doctor[]>();
  doctors: doctor[] = [];
  filteredDocList: doctor[] = [];
  doctorsNew: doctorNew;

  autoSuggestTracker = new Subject<searchResult[]>();
  docDetailTracker = new Subject<docDetail>();
  trendsTracker = new Subject<trend[]>();
  boilerContentTracker = new Subject<boilerContent>();

  // If a doctor has been selected from Auto Suggest options,
  // we inquire the server for the doctor's speciality.
  // This speciality helps us in building the right URL string
  // to be hit when the user clicks on Search button
  selectedDocSpeciality = '';

  constructor(
    private httpClient: HttpClient,
    private utilsService: UtilsService,
    private errLog: ErrlogService,
    private cs: CommonService,
    private ss: StoreService,
    private aaa: AAAuthService
  ) { }

  checkAvailabilityFilters(filters: { name: string, value: any }[]) {
    let filterString = ['0', '0', '0', '0'];

    filters.forEach(
      (f: { name: string, value: any }) => {
        switch (f.name) {
          case 'at':
            filterString[0] = '1';
            break;
          case 'am':
            filterString[1] = '1';
            break;
          case 'aa':
            filterString[2] = '1';
            break;
          case 'ae':
            filterString[3] = '1';
            break;
          default:
            break;
        }
      }
    );

    return filterString.join('');

  }

  getAllCities() 
  {
    this.httpClient.get(c.Apiurl + 'GetAllCitiesForHospitals').subscribe(
      (data: city[]) => {
        this.cities = data;
        this.citiesTracker.next(this.cities.slice());
      },
      (err)=>{
        this.errLog.log('search.service.ts','getAllCities()',err);
      }
    );
  }

  getAllCitiesNew() 
  {
    return this.httpClient.get(c.Apiurl + 'GetAllCitiesForHospitals');
  }
  saveCities(cities)
  {
    this.cities = cities;
  }

  getHospitalsFromLocalStorage() {
    return this.hospitals;
  }

  getHospitalsInCity(cityId: string) 
  {
    if(parseInt(cityId) > 0)
    {
      this.httpClient.get(c.Apiurl + 'GetAllHospitalsByCityId/' + cityId).subscribe(
      (data: hospital[]) => {
        this.hospitals = data;
        this.hospitalsTracker.next(this.hospitals.slice());
      },
      (err)=>{
        this.errLog.log('search.service.ts','getHospitalsInCity()',err);
      }
    );
    }
  }
 
  getHospitalsInCityNew(cityId: string):Observable<any> 
  {
    if(parseInt(cityId) > 0)
    {
      return this.httpClient.get(c.Apiurl + 'GetAllHospitalsByCityId/' + cityId);
    }
  }


  getHospitalsByCitySpeciality(cityId: string, speciality: string) {
    this.httpClient.get(c.Apiurl + 'GetHospitalDetailsByCityIdAndSpecialitylId/' + cityId + '/' + speciality).subscribe(
      (data: hospital[]) => {
        // console.log(data);
        this.hospitals = data;
        this.hospitalsTracker.next(this.hospitals.slice());
      }
    );
  }

  getHospitalsByCityGroup(cityId: string, group: string) {
    this.httpClient.get(c.Apiurl + 'GetHospitalDetailsByCityIdAndGroupId/' + cityId + '/' + group).subscribe(
      (data: hospital[]) => {
        // console.log(data);
        this.hospitals = data;
        this.hospitalsTracker.next(this.hospitals.slice());
      }
    );
  }

  getHospitalsByCitySpecialityNew(cityId: string, speciality: string) 
  {
    return this.httpClient.get(c.Apiurl + 'GetHospitalDetailsByCityIdAndSpecialitylId/' + cityId + '/' + speciality);
  }
  getHospitalsByCitySymptom(cityId: string, symptom: string) 
  {
    return this.httpClient.get(c.Apiurl + 'GetHospitalDetailsByCityIdAndSymptomId/' + cityId + '/' + symptom);
  }




  gotDocsList(docs: doctor[]) 
  {
    this.doctors = docs;
    this.filteredDocList = docs;
    this.doctorListTracker.next(this.doctors.slice());
  }

  getDocsCity(city: string, filters: { name: string, value: any }[]) 
  {
    return this.httpClient.get(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv5' + '/' + this.utilsService.sanitizeURLParam(city) + '/' + this.checkAvailabilityFilters(filters));
  }

  getDocsCityHospital(city: string, hospital: string, filters: { name: string, value: any }[]) 
  {
    return this.httpClient.get(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv5' + '/' + this.utilsService.sanitizeURLParam(city) + '/hospital/' + this.utilsService.sanitizeURLParam(hospital) + '/' + this.checkAvailabilityFilters(filters));
  }

  getDocsCitySpeciality(city: string, speciality: string, filters: { name: string, value: any }[]) 
  {
    return this.httpClient.get(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv5' + '/' + this.utilsService.sanitizeURLParam(city) + '/' + this.utilsService.sanitizeURLParam(speciality) + '/' + this.checkAvailabilityFilters(filters));
  }
  getDocsCityHospitalSpeciality(city: string, hospital: string, speciality: string, filters: { name: string, value: any }[]) 
  {
    return this.httpClient.get(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv5' + '/' + this.utilsService.sanitizeURLParam(city) + '/hospital/' + this.utilsService.sanitizeURLParam(hospital) + '/' + this.utilsService.sanitizeURLParam(speciality) + '/' + this.checkAvailabilityFilters(filters));
  }

  getDocsCitySymptom(city: string, symptom: string, filters: { name: string, value: any }[]) 
  {
    return this.httpClient.get(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv5' + '/' + this.utilsService.sanitizeURLParam(city) + '/symptom/' + this.utilsService.sanitizeURLParam(symptom) + '/' + this.checkAvailabilityFilters(filters));
  }

  getDocsCityHospitalSymptomname(city: string, hospital: string, symptomname: string, filters: { name: string, value: any }[]) 
  {
    return this.httpClient.get(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv5' + '/' + this.utilsService.sanitizeURLParam(city) + '/hospital/' + this.utilsService.sanitizeURLParam(hospital) + '/symptom/' + symptomname + '/' + this.checkAvailabilityFilters(filters));
  }

  getDocsCitySpecialityHyperlocal(city: string, speciality: string, hyperlocal: string, filters: { name: string, value: any }[]) 
  {
    return this.httpClient.get(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv5' + '/' + this.utilsService.sanitizeURLParam(city) + '/' + this.utilsService.sanitizeURLParam(speciality) + '/hyperlocal/' + hyperlocal + '/' + this.checkAvailabilityFilters(filters));
  }

  getDocsCityHyperlocal(city: string, hyperlocal: string, filters: { name: string, value: any }[]) 
  {
    return this.httpClient.get(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv5' + '/' + this.utilsService.sanitizeURLParam(city) + '/hyperlocal/' + hyperlocal + '/' + this.checkAvailabilityFilters(filters));
  }

  getDocsCityLanguage(city: string, language: string, filters: { name: string, value: any }[]) 
  {
    return this.httpClient.get(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv5' + '/' + this.utilsService.sanitizeURLParam(city) + '/language/' + language + '/' + this.checkAvailabilityFilters(filters));
  }
 

  // v6 with filters doctor search  -- start
  getDocsCityV6(city: string, filters: { name: string, value: any }[],pageNo,genderFilter,sortFilter,languageFilter) 
  {
    return this.httpClient.post(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv6' + '/' + this.utilsService.sanitizeURLParam(city) + '/' + this.checkAvailabilityFilters(filters) + '/' + pageNo,{Sort:sortFilter,Gender:genderFilter,Language:languageFilter});
  }

  getDocsCityHospitalV6(city: string, hospital: string, filters: { name: string, value: any }[],pageNo,genderFilter,sortFilter,languageFilter) 
  {
    return this.httpClient.post(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv6' + '/' + this.utilsService.sanitizeURLParam(city) + '/hospital/' + this.utilsService.sanitizeURLParam(hospital) + '/' + this.checkAvailabilityFilters(filters) + '/' + pageNo,{Sort:sortFilter,Gender:genderFilter,Language:languageFilter});
  }

  getDocsCitySpecialityV6(city: string, speciality: string, filters: { name: string, value: any }[],pageNo,genderFilter,sortFilter,languageFilter) 
  {
    return this.httpClient.post(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv6' + '/' + this.utilsService.sanitizeURLParam(city) + '/' + this.utilsService.sanitizeURLParam(speciality) + '/' + this.checkAvailabilityFilters(filters)+ '/' + pageNo,{Sort:sortFilter,Gender:genderFilter,Language:languageFilter});
  }

  getDocsCityHospitalSpecialityV6(city: string, hospital: string, speciality: string, filters: { name: string, value: any }[],pageNo,genderFilter,sortFilter,languageFilter) 
  {
    return this.httpClient.post(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv6' + '/' + this.utilsService.sanitizeURLParam(city) + '/hospital/' + this.utilsService.sanitizeURLParam(hospital) + '/' + this.utilsService.sanitizeURLParam(speciality) + '/' + this.checkAvailabilityFilters(filters)+ '/' + pageNo,{Sort:sortFilter,Gender:genderFilter,Language:languageFilter});
  }

  getDocsCitySymptomV6(city: string, symptom: string, filters: { name: string, value: any }[],pageNo,genderFilter,sortFilter,languageFilter) 
  {
    return this.httpClient.post(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv6' + '/' + this.utilsService.sanitizeURLParam(city) + '/symptom/' + this.utilsService.sanitizeURLParam(symptom) + '/' + this.checkAvailabilityFilters(filters)+ '/' + pageNo,{Sort:sortFilter,Gender:genderFilter,Language:languageFilter});
  }

  getDocsCityHospitalSymptomnameV6(city: string, hospital: string, symptomname: string, filters: { name: string, value: any }[],pageNo,genderFilter,sortFilter,languageFilter) 
  {
    return this.httpClient.post(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv6' + '/' + this.utilsService.sanitizeURLParam(city) + '/hospital/' + this.utilsService.sanitizeURLParam(hospital) + '/symptom/' + symptomname + '/' + this.checkAvailabilityFilters(filters)+ '/' + pageNo,{Sort:sortFilter,Gender:genderFilter,Language:languageFilter});
  }

  getDocsCitySpecialityHyperlocalV6(city: string, speciality: string, hyperlocal: string, filters: { name: string, value: any }[],pageNo,genderFilter,sortFilter,languageFilter) 
  {
    return this.httpClient.post(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv6' + '/' + this.utilsService.sanitizeURLParam(city) + '/' + this.utilsService.sanitizeURLParam(speciality) + '/hyperlocal/' + hyperlocal + '/' + this.checkAvailabilityFilters(filters)+ '/' + pageNo,{Sort:sortFilter,Gender:genderFilter,Language:languageFilter});
  }

  getDocsCityHyperlocalV6(city: string, hyperlocal: string, filters: { name: string, value: any }[],pageNo,genderFilter,sortFilter,languageFilter) 
  {
    return this.httpClient.post(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv6' + '/' + this.utilsService.sanitizeURLParam(city) + '/hyperlocal/' + hyperlocal + '/' + this.checkAvailabilityFilters(filters)+ '/' + pageNo,{Sort:sortFilter,Gender:genderFilter,Language:languageFilter});
  }

  getDocsCityLanguageV6(city: string, language: string, filters: { name: string, value: any }[],pageNo,genderFilter,sortFilter,languageFilter) 
  {
    return this.httpClient.post(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv6' + '/' + this.utilsService.sanitizeURLParam(city) + '/language/' + language + '/' + this.checkAvailabilityFilters(filters)+ '/' + pageNo,{Sort:sortFilter,Gender:genderFilter,Language:languageFilter});
  }

  // v6 with filters doctor search -- end



  getApolloDoctors(speciality,language,alphabet,pageNo) 
  {
    return this.httpClient.get(c.MultiSpecialityUrl + 'GetApolloDoctorsInPaginatedView'+'/'+speciality+'/'+language+'/'+alphabet+'/'+pageNo);
  }
  getLadyDoctors(city,speciality,hospital,hyperlocal,pageNo) 
  {
    return this.httpClient.get(c.MultiSpecialityUrl + 'GetApolloLadyDoctorsInPaginatedView/2'+'/'+city+'/'+speciality+'/'+hospital+'/'+hyperlocal+'/'+pageNo);
  }
  getDoctorsForDiseasesAndTreatments(service_type_id,service_name,city,hyperlocal,pageNo) 
  {
    return this.httpClient.get(c.MultiSpecialityUrl + 'GetAllApolloDoctorsBasedOnServiceType'+'/'+service_type_id+'/'+service_name+'/'+city+'/'+hyperlocal+'/'+pageNo);
  }






  

  

  getDoctoreForConsultation(searchByText: string, searchByType: string): Observable<any> {
    let apiEndpoint = c.OCApiUrl + 'GetSpecialityiesBySearchwithTextandType';
    let params = {
      'adminId': c.AdminId,
      'adminPassword': c.AdminPassword,
      'SearchByText': searchByText,
      'SearchByType': searchByType,
      'sourceApp': c.OCSourceApp,
    }



    return this.httpClient.post<any>(apiEndpoint, params);

  }




  // Need to update the API endpoints from here

  getDocsCityGroupname(city: string, groupname: string, filters: { name: string, value: any }[]) {
    this.httpClient.get(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv4' + '/' + this.utilsService.sanitizeURLParam(city) + '/groupname/' + this.utilsService.sanitizeURLParam(groupname) + '/' + this.checkAvailabilityFilters(filters)).subscribe(
      (data: doctor[]) => {
        this.gotDocsList(data);
      }
    );
  }

  

  

  

  getDocsCityHospitalText(city: string, hospital: string, text: string, filters: { name: string, value: any }[]) {
    this.httpClient.get(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv4' + '/' + this.utilsService.sanitizeURLParam(city) + '/' + this.utilsService.sanitizeURLParam(hospital) + '/' + text + '/' + this.checkAvailabilityFilters(filters)).subscribe(
      (data: doctor[]) => {
        this.gotDocsList(data);
      }
    );
  }

  getDocsCityHospitalGroupname(city: string, hospital: string, groupname: string, filters: { name: string, value: any }[]) {
    this.httpClient.get(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv4' + '/' + this.utilsService.sanitizeURLParam(city) + '/hospital/' + this.utilsService.sanitizeURLParam(hospital) + '/groupname/' + groupname + '/' + this.checkAvailabilityFilters(filters)).subscribe(
      (data: doctor[]) => {
        this.gotDocsList(data);
      }
    );
  }
  // End of need for API endpoint update
  

  getDocsCityLatLong(city: string, latitude: string, longitude: string, filters: { name: string, value: any }[]) {
    this.httpClient.get(c.Apiurl + 'GetDoctorDataforDoctorSearchwithFilterv4' + '/' + this.utilsService.sanitizeURLParam(city) + '/' + latitude + '/' + longitude + '/' + this.checkAvailabilityFilters(filters)).subscribe(
      (data: doctor[]) => {
        this.gotDocsList(data);
      }
    );
  }

  getAutoSuggestions(city: string, searchHospital: string, searchString: string) {

    let ApiEndpoint = '';

    ApiEndpoint = c.MultiSpecialityUrl + 'GetAutoSuggestionFromAskApolloForAngular/' + city + '/' + this.utilsService.sanitizeURLParam(searchString);
    this.httpClient.get(ApiEndpoint).subscribe(
      (data: searchResult[]) => {
        this.autoSuggestTracker.next(data);
      }
    );
  }
  getAutoSuggestionsC(searchString: string): Observable<any> {
    //let apiEndpoint = c.OCApiUrl + 'GetSearchAnonymousforSourceApp'; // Sandeep was changed this end point by 04-09-2018
    let apiEndpoint = c.OCApiUrl + 'GetSearchDetailsAnonymousforSourceApp';
    let params = {
      'AdminId': c.AdminId,
      'AdminPassword': c.AdminPassword,
      'searchText': searchString,
      'sourceApp': c.OCSourceApp,
    }

    return this.httpClient.post<any>(apiEndpoint, params);
  }

  getDoctorSpeciality(id: string) {
    let ApiEndpoint = 'GetDoctorSpecialityBasedonDoctorIdV4/' + id;
    this.httpClient.get(c.Apiurl + ApiEndpoint).subscribe(
      (data: any) => {
        this.selectedDocSpeciality = data[0].SpecialtyKeyword;
      }
    );
  }

  // Gender: Male (1); Female (2)
  // Language: English; Hindi; Telugu
  // Time: Morning (1); Afternoon (2); Evening ()
  filterSearchResults(filters: { name: string, value: any }[]) {
    // If the list is empty, there is nothing to sort.
    if (this.doctors.length == 0) return;

    // Save a local list of doctors that can be iterated upon to apply multiple filters
    let fl = this.doctors;
    filters.forEach(
      (f: { name: string, value: any }) => {
        switch (f.name) {
          case 'g':
            fl = this.doctors.filter(
              (d: doctor) => {
                return d.gender == f.value;
              });
            break;
          case 'l':
            fl = fl.filter(
              (d: doctor) => {
                let rlangs = f.value.split(',');
                let isValid = false;
                rlangs.forEach(element => {
                  // This unit (doctor) is valid even if one of the required languages is available
                  isValid = isValid || d.LanguagesKnown.indexOf(element) > -1;
                });
                return isValid;
              });
            break;
          default:
            break;
        }
      }
    );
    // Saved the filtered doc list, for sorting needs
    this.filteredDocList = fl;
    this.doctorListTracker.next(fl.slice());

  }

  sortSearchResults(sortBy: string) {
    let sl = this.filteredDocList;
    switch (sortBy) {
      case 'e':
        // Sort the filtered doc to account for any filters
        sl = this.filteredDocList.sort(
          (d1, d2) => {
            return (d1.YearsOfExperience < d2.YearsOfExperience) ? 1 : ((d1.YearsOfExperience > d2.YearsOfExperience) ? -1 : 0);
          }
        );
        break;
      case 'r':
        sl = this.filteredDocList.sort(
          (d1, d2) => {
            return (d1.Recommendations < d2.Recommendations) ? 1 : ((d1.Recommendations > d2.Recommendations) ? -1 : 0);
          }
        );
        break;
      default:
        break;
    }
    this.doctorListTracker.next(sl.slice());
  }

  getDocProfile(city: string, speciality: string, doctor: string) {
    this.aaa.loadingShow('loadingid');
    this.httpClient.get(c.Apiurl + 'GetDoctorInfoCitySpecilaityDoctornamev4' + '/' + this.utilsService.sanitizeURLParam(city) + '/' + this.utilsService.sanitizeURLParam(speciality) + '/' + this.utilsService.sanitizeURLParam(doctor)).subscribe(
      (data: docDetail) => {
        this.aaa.loadingHide('loadingid');
        this.docDetailTracker.next(data);
      }
    );
  }

  getDocProfileC(city: string, speciality: string, doctor: string) {
    this.aaa.loadingShow('loadingid');
    this.httpClient.get(c.Apiurl + 'GetDoctorInfoCitySpecilaityDoctornamev4' + '/' + this.utilsService.sanitizeURLParam(city) + '/' + this.utilsService.sanitizeURLParam(speciality) + '/' + this.utilsService.sanitizeURLParam(doctor)).subscribe(
      (data: docDetail) => {
        this.aaa.loadingHide('loadingid');
        this.docDetailTracker.next(data);
      }
    );
  }

  getCurrentCity() 
  {
    return this.selectedCity != null ? this.selectedCity : { id: '-1', name: 'hyderabad' };
  }

  getSelectedCity() 
  {
    return this.selectedCity != null ? this.selectedCity : { id: '-1', name: '' };
  }

  selectedCityChanged(c: city) 
  {
    this.selectedCity = c;
    this.selectedCityTracker.next(this.selectedCity);
    this.getHospitalsInCity(this.selectedCity.id);
  }

  selectedCityChangedNew(c: city) 
  {
    this.selectedCity = c;
    this.getHospitalsInCityNew(this.selectedCity.id).subscribe(
      (data: hospital[]) => {
        this.hospitals = data;
      }
    );
  }

  getSidebarLinks4DoctorSearchCity(city: string) 
  {
    if(city)
    {
      let ApiEndpoint = 'GetAllRandomHyperLocationsbasedonCityNamev4/' + city;
      this.httpClient.get(c.Apiurl + ApiEndpoint).subscribe(
        (data: any) => {
          this.trendsTracker.next(data);
        },(err)=>{
          this.errLog.log('search.service.ts','getSidebarLinks4DoctorSearchCity()',err);
        }
      );  
    }
    
    /*if (this.cities != null) 
    {
      let ApiEndpoint = 'GetAllRandomHyperLocationsbasedonCityIdv4/' + this.getIdForCity(city);
      this.httpClient.get(c.Apiurl + ApiEndpoint).subscribe(
        (data: any) => {
          this.trendsTracker.next(data);
        },(err)=>{
          this.errLog.log('search.service.ts','getSidebarLinks4DoctorSearchCity()',err);
        }
      );
    } 
    else 
    {
      setTimeout(() => {
        return this.getSidebarLinks4DoctorSearchCity(city);
      }, 500)
    }*/
  }

  getSidebarLinks4DoctorSearchCitySpeciality(city: string, speciality: string)
  {
    let ApiEndpoint = 'GetAllRandomHyperLocationsbasedonCityNameandSpecialityNamev4/' + city + '/' + this.utilsService.sanitizeURLParam(speciality);
      this.httpClient.get(c.Apiurl + ApiEndpoint).subscribe(
        (data: any) => {
          this.trendsTracker.next(data);
        }
      );
    /*if (this.cities != null) {
      let ApiEndpoint = 'GetAllRandomHyperLocationsbasedonCityIdandSpecialityNamev4/' + this.getIdForCity(city) + '/' + this.utilsService.sanitizeURLParam(speciality);
      this.httpClient.get(c.Apiurl + ApiEndpoint).subscribe(
        (data: any) => {
          this.trendsTracker.next(data);
        }
      );
    } else {
      setTimeout(() => {
        return this.getSidebarLinks4DoctorSearchCitySpeciality(city, speciality);
      }, 500)
    }*/
  }

  getIdForCity(city: string) {
    //console.log('cities - '+this.cities);
    if (this.cities != null) {
      let filteredCities = this.cities.filter(
        (c: city) => {
          return city.toLowerCase() == c.name.toLowerCase();
        }
      );
      return filteredCities.length > 0 ? filteredCities[0].id : -1;
    } else {
      setTimeout(() => {
        return this.getIdForCity(city);
      }, 500)
    }

  }

  getBoilerContent(city: string, speciality: string) {
    let apiEndpoint = c.Apiurl + 'GetSpecialityandBoilerContentv4/' + city + '/' + speciality;
    this.httpClient.get(apiEndpoint).subscribe(
      (data: any) => {
        this.boilerContentTracker.next({
          city: city,
          speciality: speciality,
          BoilerContent: data.BoilerContent,
          SpecialityContent: data.SpecialityContent
        });
      }
    );
  }

  getdsExtraData(): Observable<any> {
    let apiEndpoint = c.OCApiUrl + 'GetSpecialityiesBySearchwithTextandType';

    //return this.httpClient.get<any>(apiEndpoint);

    return Observable.of('Find the best advice for all your  health needs, Ask Apollo portal offers appointments with the best specialists in Hyderabad to cater to all your medical problems. Ask Apollo offers hassle-free, quick appointments with the finest specialists in Hyderabad.  Avail Excellent treatment options for all your health problems and ensure your well-being with their expertise and care')
  }

  getOnlineDocProfile(docId: any): Observable<any> {

    let api = c.OCApiUrl + 'GetDoctorDetailsByDoctorIdforSourceApp';
    let params = {
      "AdminId": c.AdminId,
      "AdminPassword": c.AdminPassword,
      "doctorId": docId.toString(),
      "sourceApp": c.OCSourceApp,
    };

    return this.httpClient.post(api, params);

  }

  getAllApolloDoctorsDiseasesAndTreatments(status: number, diseasename: string) {

    this.httpClient.get(c.MultiSpecialityUrl + 'GetAllApolloDoctorsForDiseasesAndTreatments' + '/' + status + '/' + diseasename).subscribe(
      (data: doctor[]) => {
        this.gotDocsList(data);
      });
  }
  /*
 * Doctor search page title and description
 */
  getPageTitleandDecriptionDoctorSearch(metapage) {
    return this.httpClient.get(c.Apiurl + 'GetPageTitleandDecriptionforDoctorSearchv4' + '/' + metapage);
  }
  getExtraData(param): Observable<any> {
    let apiEndpoint = c.MultiSpecialityUrl + 'GetPageContentForDoctorSearchPage/' + param;
    return this.httpClient.get<any>(apiEndpoint);
  }
  /*
 * Apollo Doctors list.
 */
  getApolloDoc() {

    this.httpClient.get(c.MultiSpecialityUrl + 'GetAllApolloDoctors').subscribe(
      (data: doctor[]) => {
        this.gotDocsList(data);
      });

  }
  phsyicalSortSearchResults(sortBy: string) {
    let sl = this.filteredDocList;
    switch (sortBy) {
      case 'hl':
        // Sort the filtered doc to account for any filters
        sl = this.filteredDocList.sort(
          (d1, d2) => {

            return (d1.YearsOfExperience < d2.YearsOfExperience) ? 1 : ((d1.YearsOfExperience > d2.YearsOfExperience) ? -1 : 0);
          }
        );
        break;
      case 'lh':
        sl = this.filteredDocList.sort(
          (d1, d2) => {
            return (d1.YearsOfExperience > d2.YearsOfExperience) ? 1 : ((d1.YearsOfExperience < d2.YearsOfExperience) ? -1 : 0);
          }
        );
        break;
      default:
        break;
    }
    this.doctorListTracker.next(sl.slice());
  }

  getHospitalInformation(city: string, speciality: string) {
    let apiEndpoint = c.MultiSpecialityUrl + 'GetHospitalInformationForAngularOnCityIdandHospitalId/' + city + '/' + speciality;
    return this.httpClient.get(apiEndpoint);
  }


}
