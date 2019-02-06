import { Component, OnInit, TemplateRef, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Subscription } from 'rxjs/Subscription';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { SignupComponent } from './../../user/signup/signup.component';
import { SearchService, searchResult } from '@aa/services/search.service';
import { StoreService } from '@aa/services/store.service';
import { UtilsService } from '@aa/services/utils.service';
import { CommonService } from '@aa/services/common.service';
import { AAAuthService } from '@aa/services/auth.service';
import { city } from '@aa/structures/city.interface';
import { hospital } from '@aa/structures/hospital.interface';
import { ErrlogService } from '@aa/services/errlog.service';
import { constants as c } from './../../constants';
import { CookieService } from 'ngx-cookie-service';

import { SignupHealthLibraryComponent } from './../../user/signup/health-library/signup.component';

//const topCitiesJson = require('./../../../assets/json/top-cities.json');
//const otherCitiesJson = require('./../../../assets/json/other-cities.json');
//const AllCitiesJson = require('./../../../assets/json/cities.json');
//const AllHospitalsJson = require('./../../../assets/json/cities-hospitals.json');

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  DEFAULT_CITY_NAME = 'Select City';
  DEFAULT_HOSPITAL_NAME = 'Select Hospital';
  SEARCH_ENABLED_PLACEHOLDER = 'Enter Primary Speciality/Super Speciality/Doctor Name';
  SEARCH_DISABLED_PLACEHOLDER = 'Please select a city to enable search';

  activeTab = this.us.TAB_PHYSICAL_APPOINTMENT;
  cities: city[] = [];
  topCities: city[] = [];
  otherCities: city[] = [];
  //cities: city[] = AllCitiesJson;
  //Added by Saravana for grouping Cities
  //topCities: city[] = topCitiesJson;
  //otherCities: city[] = otherCitiesJson;
  selectedCity: city;
  hospitals: hospital[] = [];
  hospitalsList: hospital[] = [];
  clinicsList: hospital[] = [];
  selectedHospital: hospital;
  selectedSearch: searchResult;
  selectedSearchC: any;
  autoSuggestData = [];
  searchSuggestions = [];
  searchPlaceholder: string;
  //Temporary fix to overcome an issue with Typeahead. Need to revisit this.
  searchString = '';
  // Modal for login popup
  modalRef: BsModalRef;
  isCollapsedHeader = true;
  citiesTrackerSub: Subscription;
  hosTrackerSub: Subscription;
  autoSuggestTrackerSub: Subscription;
  getCityTrackerSub: Subscription;
  loginStatusTrackerSub: Subscription;
  navyaIframeTrackerSub: Subscription;

  signedIn: boolean;
  firstName = '';

  iFrame = false;
  isDefualtSelected: boolean = false;
  signedInForAnonimus: boolean = false;
  nameForAnno: string = "";

  constructor(
    private cd: ChangeDetectorRef,
    private srs: SearchService,
    private ss: StoreService,
    private us: UtilsService,
    private cs: CommonService,
    private aaa: AAAuthService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private router: Router,
    private errLog: ErrlogService,
    private cookieService: CookieService) {
    this.searchPlaceholder = this.SEARCH_DISABLED_PLACEHOLDER;
    this.selectedCity = { id: '-1', name: this.DEFAULT_CITY_NAME, cityType: 0 };
    this.selectedHospital = { hospitalId: -1, hospitalName: this.DEFAULT_HOSPITAL_NAME, hospitalType: 'default' };
  }
  logoutAnn() {
    this.aaa.getLocalStorageValues('Before Anonymous Logout');
    
    this.aaa.setSessionStatusForAuth(false);
    localStorage.removeItem('loginType');
    localStorage.removeItem('loginUserIdForGuest');
    localStorage.setItem('authName', '');

    this.aaa.getLocalStorageValues('After Anonymous Logout');

    document.cookie = "healthLibraryCookie=";
    localStorage.removeItem('healthLibraryCookie');

    this.router.navigate(['/']);
  }

  ngOnInit()
  {
    // get cities -- start
    this.aaa.loadingShow('loadingid');
    this.srs.getAllCitiesNew()
      .subscribe(
        (cities: city[]) => {
          this.aaa.loadingHide('loadingid');
          this.cities = cities;
          this.topCities = cities.filter(x => x.cityType == 1);
          this.otherCities = cities.filter(x => x.cityType == 0);
          this.cs.saveCitiesList(this.cities);
          this.srs.saveCities(this.cities);
        }, (err) => {
          this.aaa.loadingHide('loadingid');
          this.errLog.log('header.component.ts', 'ngOnInit()', err);
        }
      );
    
    // get cities -- end
    this.iFrame = false;
    let cookieCity = this.cookieService.get('citycookie');
    if (cookieCity != undefined && cookieCity != null && cookieCity != '') {
      let cookieCity = this.cookieService.get('citycookie');
      let cookieCityID = this.cookieService.get('citycookieId');
      this.selectedCity = { id: cookieCityID, name: cookieCity, cityType: 0 };
    }
    this.cs.setCanonicallink(window.location.href);
    this.aaa.headerTextTracker.subscribe(
      (val: any) => {
        this.searchString = val;
        this.selectedSearch = null;
      }
    )
    this.searchString = '';

    this.signedIn = this.aaa.getSessionStatus();
    this.firstName = this.aaa.getFirstName();
    let userId = this.aaa.getUserId();
    if (userId != undefined && userId != null && userId != '') {
      this.signedIn = true;
      this.aaa.setSessionStatus(true);
    }

    if (this.aaa.userInfo.AuthTokenForPR != null) {
      this.aaa.getUserStatus().subscribe(d => {
        if (+d.requestStatus == 1) {
          this.firstName = "";
          this.aaa.setSessionStatus(false);
        }
      },
        (err) => {
          this.errLog.log('header.component.ts', 'ngOnInit()', err);
        });
    }

    this.us.navigationTabTracker.subscribe(

      (tab: number) => {
        this.activeTab = tab;
        // Remove search string and reset hospitals while in home page
        if (this.router.url == '/' || this.router.url == '') {
          this.clearSearchString();
          setTimeout(() => {
            this.preferredCitySelected(this.selectedCity);
          }, 500);

        }
      }
    );


    // Now that we have the list of supported cities, get the user's location
    // Check if the user's location is available from local storage
    let cityFromLocalStorage = this.ss.getToken(this.ss.TOKEN_CITY);
    if (cityFromLocalStorage) {
      this.preferredCitySelected(cityFromLocalStorage);
      this.searchPlaceholder = this.SEARCH_ENABLED_PLACEHOLDER;

      // Now that the city is set, get list of hospitals for the city
      // alert(this.selectedCity.id);
      //this.srs.getHospitalsInCity(this.selectedCity.id);
    }
    // else // If user's location is not available in local storage, fetch it 
    // {
    //   // console.log('Should try to get location automagically from here');
    //   if (window.navigator.geolocation) {
    //     window.navigator.geolocation.getCurrentPosition(this.gotGeoLocation.bind(this));
    //   }
    // }
    // set the cities -- end


    // Subscribe to new data for "Search Autocomplete"
    this.autoSuggestTrackerSub = this.srs.autoSuggestTracker.subscribe(
      (suggestions: searchResult[]) => {
        this.autoSuggestData = suggestions;
        let suggestionStrings = [];
        suggestions.forEach(
          (s: searchResult) => {
            let searchAppnd = '';
            if (s.type == 1 || s.type == 2) {
              searchAppnd = "Speciality";
            }
            if (s.type == 3) {
              searchAppnd = "Doctor";
            }
            if (s.type == 4) {
              searchAppnd = "Symptom";
            }
            suggestionStrings.push(s.label + "<span>" + searchAppnd + "</span>");
          }
        )
        // console.log(suggestions);
        this.searchSuggestions = suggestionStrings;
      });

    // Subscribe to 'Get City from Browser'
    this.getCityTrackerSub = this.cs.getCityTracker.subscribe(
      (result: any) => {
        if (result.success) {
          let checkCity = this.cities.filter((f: city) => {
            return result.city.long_name.toLowerCase() == f.name.toLowerCase();
          });

          // Select city only if it's in the list of available cities
          if (checkCity.length > 0) {
            // As you get user's city, save it to local storage
            this.ss.saveToken(this.ss.TOKEN_CITY, { id: checkCity[0].id, name: checkCity[0].name });

            this.selectedCity = checkCity[0];

            this.preferredCitySelected(this.selectedCity);
            this.searchPlaceholder = 'Enter Speciality / Doctor Name';
          }
        }
      });

    this.loginStatusTrackerSub = this.aaa.sessionStatusTracker.subscribe(
      (status: boolean) => {
        this.signedIn = status;
        this.firstName = status ? this.aaa.getFirstName() : '';
        this.cd.detectChanges();
      });

    this.navyaIframeTrackerSub = this.cs.navyaIframeTracker.subscribe(
      (status: boolean) => {
        //console.log('iframe trigger received');
        this.iFrame = status;
      }
    )


    this.aaa.sessionStatusTrackerForAuth.subscribe(
      (status: boolean) => {
        //debugger;
        this.signedInForAnonimus = status;
        this.nameForAnno = localStorage.getItem('authName');
      });

    let authName = localStorage.getItem('authName');

    if (authName != undefined && authName != null && authName != '') {
      this.signedInForAnonimus = true;
      this.nameForAnno = localStorage.getItem('authName');
    }
  }
  // ngOnInit --- ends

  clearHospitalList() {
    this.hospitals = [];
    this.hospitalsList = [];
    this.clinicsList = [];
    this.selectedHospital = { hospitalId: -1, hospitalName: this.DEFAULT_HOSPITAL_NAME, hospitalType: 'default' };
  }
  clearSearch() {
    this.searchString = '';
    this.selectedSearch = null;
    this.cs.setShowMobileNoInLoginFlow(false);
  }

  clearSearchString() {
    this.searchString = '';
    this.selectedSearch = null;
    //this.srs.getHospitalsInCity(this.selectedCity.id);
  }

  ngOnDestroy() {
    this.citiesTrackerSub.unsubscribe();
    this.hosTrackerSub.unsubscribe();
    this.autoSuggestTrackerSub.unsubscribe();
    this.getCityTrackerSub.unsubscribe();
    this.loginStatusTrackerSub.unsubscribe();
  }

  // Translate geo position to city name
  // gotGeoLocation(position) {
  //   this.cs.getCityFromLatLong(position.coords.latitude, position.coords.longitude);
  // }

  preferredCitySelected(c: city) {
    this.clearSearchString();
    this.clearHospitalList();
    this.getHospitals();
    this.ss.saveToken(this.ss.TOKEN_CITY, { id: c.id, name: c.name });
  }

  preferredCitySelectedNew(c: any) {
    this.clearSearchString();
    this.clearHospitalList();
    if (c.value == "-1") {
      this.hospitals = [];
      this.isDefualtSelected = true;
      this.searchPlaceholder = this.SEARCH_DISABLED_PLACEHOLDER;
      this.selectedCity = {
        'id': "-1",
        'name': "Select City",
        'cityType': 0
      };

      let expDate = new Date();
      expDate.setDate(expDate.getDate() + 30);

      this.cookieService.set('citycookie', this.selectedCity.name, expDate);
      this.cookieService.set('citycookieId', this.selectedCity.id, expDate);
    }
    else {
      this.searchPlaceholder = this.SEARCH_ENABLED_PLACEHOLDER;
      this.isDefualtSelected = false;
      // Reset hospital list and search box before proceeding

      let s = this.cities.filter(ci => {
        return ci.id == c.value
      })[0];
      this.selectedCity = s;
      //this.getHospitalsInCity(this.selectedCity.id);
      this.getHospitals();
      let expDate = new Date();
      expDate.setDate(expDate.getDate() + 30);
      this.cookieService.set('citycookie', s.name, expDate);
      this.cookieService.set('citycookieId', s.id, expDate);


      // As you get user's city, save it to local storage
      this.ss.saveToken(this.ss.TOKEN_CITY, { id: s.id, name: s.name });
    }

  }

  setCurrentHospital(h: hospital) {
    this.selectedHospital = h;
  }

  setCurrentHospitalNew(h: any) {
    if (h.value == "Select Hospital") {
      this.clearHospitalList();
    }
    else {
      let s = this.hospitals.filter(ci => {
        return ci.hospitalId == h.value
      })[0];
      this.selectedHospital = s;
    }
  }

  getAutoSuggestion($event) {
    let searchString = $event.target.value;

    // Get auto suggestions only if user has entered at least 1 character
    if (searchString.length > 0) {
      // console.log('non-empty search string');
      if (this.selectedHospital.hospitalName != this.DEFAULT_HOSPITAL_NAME) {
        this.srs.getAutoSuggestions(this.selectedCity.id, this.selectedHospital.hospitalId.toString(), searchString);
      }
      else {
        this.srs.getAutoSuggestions(this.selectedCity.id, '', searchString);
      }
    }
    else if (this.selectedSearch.label != undefined && this.selectedSearch.label != null && this.selectedSearch.label != '') {
      this.clearHospitalList();
      this.getHospitalsInCity(this.selectedCity.id);
    }
  }

  searchSelected(e: TypeaheadMatch) {
    var v = e.item.split('<span>');
    this.searchString = v[0];
    let interestedSearch: searchResult[] = this.autoSuggestData.filter(
      (s: searchResult) => {
        if (s.label != undefined && s.label != null && s.label == v[0]) {
          return s;
        }
      });

    this.selectedSearch = interestedSearch[0];
    /*if (this.selectedSearch.type == 1) 
    {
      this.srs.getHospitalsByCityGroup(this.selectedCity.id, this.selectedSearch.value);
    }*/
    if (this.selectedSearch.type == 2) {
      this.getHospitalsByCitySpeciality(this.selectedCity.id, this.selectedSearch.value);
    }
    if (this.selectedSearch.type == 4) {
      this.getHospitalsByCitySymptom(this.selectedCity.id, this.selectedSearch.value);
    }
    else if (this.selectedSearch.type == 3) {
      this.hospitals = [];
      this.srs.getDoctorSpeciality(this.selectedSearch.value);
    }
  }

  goFetch() {
    localStorage.setItem('dcRedirectUrl', '');
    if (this.selectedCity == null || this.selectedCity == undefined || this.selectedCity.id == "-1" || this.isDefualtSelected == true) {
      alert('valid city is required');
      return;
    }
    else {
      if (this.selectedSearch == null) {
        // No hospital selection 
        if (this.selectedHospital.hospitalName == this.DEFAULT_HOSPITAL_NAME) {
          localStorage.setItem('dcRedirectUrl', '/' + this.us.sanitizeURLParam(this.selectedCity.name));
          this.router.navigate(['/' + this.us.sanitizeURLParam(this.selectedCity.name)]);
        } // Hospital selection is done
        else {
          localStorage.setItem('dcRedirectUrl', '/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/hospital/' + this.us.sanitizeURLParam(this.selectedHospital.hospitalName));
          this.router.navigate(['/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/hospital/' + this.us.sanitizeURLParam(this.selectedHospital.hospitalName)]);
        }
      }
      else if (this.selectedSearch.type == 2 || this.selectedSearch.type == 4) {
        // No hospital selection 
        if (this.selectedHospital.hospitalName == this.DEFAULT_HOSPITAL_NAME) {
          if (this.selectedSearch.type == 2) {
            localStorage.setItem('dcRedirectUrl', '/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/' + this.us.sanitizeURLParam(this.selectedSearch.label));
            this.router.navigate(['/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/' + this.us.sanitizeURLParam(this.selectedSearch.label)]);
          }
          else if (this.selectedSearch.type == 4) {
            localStorage.setItem('dcRedirectUrl', '/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/symptom/' + this.us.sanitizeURLParam(this.selectedSearch.label));
            this.router.navigate(['/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/symptom/' + this.us.sanitizeURLParam(this.selectedSearch.label)]);
          }
        }
        else  // Hospital selection is done 
        {
          if (this.selectedSearch.type == 4) {
            localStorage.setItem('dcRedirectUrl', '/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/hospital/' + this.us.sanitizeURLParam(this.selectedHospital.hospitalName) + '/symptom/' + this.us.sanitizeURLParam(this.selectedSearch.label));
            this.router.navigate(['/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/hospital/' + this.us.sanitizeURLParam(this.selectedHospital.hospitalName) + '/symptom/' + this.us.sanitizeURLParam(this.selectedSearch.label)]);
          }
          else {
            localStorage.setItem('dcRedirectUrl', '/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/hospital/' + this.us.sanitizeURLParam(this.selectedHospital.hospitalName) + '/' + this.us.sanitizeURLParam(this.selectedSearch.label));
            this.router.navigate(['/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/hospital/' + this.us.sanitizeURLParam(this.selectedHospital.hospitalName) + '/' + this.us.sanitizeURLParam(this.selectedSearch.label)]);
          }
        }
      }
      else {
        localStorage.setItem('dcRedirectUrl', '/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/' + this.us.sanitizeURLParam(this.srs.selectedDocSpeciality) + '/' + this.us.sanitizeURLParam(this.selectedSearch.label));
        this.router.navigate(['/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/' + this.us.sanitizeURLParam(this.srs.selectedDocSpeciality) + '/' + this.us.sanitizeURLParam(this.selectedSearch.label)]);
      }
    }

  }

  getAutoSuggestionC($event) {
    this.srs.getAutoSuggestionsC(this.searchString).subscribe(data => {
      //debugger;
      if (data != null && data.Result != null && data.Result != '' && data.ResponceCode == '0') {
        this.autoSuggestData = JSON.parse(data.Result);

        let suggestionStrings = [];
        this.autoSuggestData.forEach(
          (s: any) => {
            //debugger;
            let type = s.SearchId.toString().substring(3, 6);
            let searchAppnd = '';
            if (type.toLowerCase() == "spe") {
              searchAppnd = "speciality";
            }
            if (type.toLowerCase() == "doc") {
              searchAppnd = "doctor";
            }
            if (type.toLowerCase() == "sym") {
              searchAppnd = "symptoms";
            }
            if (type.toLowerCase() == "tre") {
              searchAppnd = "treatment";
            }
            if (type.toLowerCase() == "dis") {
              searchAppnd = "disease";
            }
            let searchIndexArray = s.Search.split('-');
            let searchText = '';
            if (searchIndexArray.length <= 2) {
              searchText = s.Search;
            } else {
              for (let d of searchIndexArray) {
                if (searchText == '') {
                  searchText = d;
                } else {
                  searchText = searchText + "-" + d;
                }
              }
            }
            suggestionStrings.push(searchText + "<span>" + searchAppnd + "</span>");
          }
        )
        this.searchSuggestions = suggestionStrings;

      } else {
        this.autoSuggestData = [];
        this.searchSuggestions = [];
      }
    });
  }

  searchSelectedC(e: TypeaheadMatch) {
    this.searchString = "";
    let acualData = '';
    let interestedSearch: any[] = this.autoSuggestData.filter(
      (s: any) => {
        acualData = '';
        let acualDataArray = e.value.split('<span>');

        if (acualDataArray.length == 2) {
          acualData = acualDataArray[0];
        } else {
          let index: number = 1;
          for (let d of acualDataArray) {
            if (acualData == '') {
              acualData = d;
            } else {
              if (index != acualDataArray.length) {
                acualData = acualData + "-" + d;
              }
            }
            index = index + 1;
          }
        }

        if (s.Search != undefined && s.Search != null && s.Search == acualData) {
          return s;
        }
      });

    this.selectedSearchC = interestedSearch[0];
    this.searchString = this.selectedSearchC.Search;
    this.goFetchC();
  }

  goFetchC() {
    localStorage.setItem('dcRedirectUrl', '');
    if (this.selectedSearchC == null || this.selectedSearchC.SearchId == undefined || this.selectedSearchC.SearchId == null || this.selectedSearchC.SearchId == '') {
      alert('please select valid auto suggestion');
      //this.router.navigate(['/onlinedoctorsearch/' + this.us.sanitizeURLParam(this.selectedCity.name)]);
    }
    else {
      let SearchId = this.selectedSearchC.SearchId.toString().substring(3, 6);
      localStorage.setItem("SearchId", this.selectedSearchC.SearchId);
      localStorage.setItem("SearchText", this.selectedSearchC.Search);
      localStorage.setItem("CityId", this.selectedCity.id);
      if (SearchId.toLowerCase() == "spe") {
        localStorage.setItem('dcRedirectUrl', "online-doctors-consultation/speciality/" + this.us.sanitizeURLParamC(this.selectedSearchC.Search));
        //this.router.navigate(['/' + this.cs.DOCTOR_SEARCH_URL_STRING + '/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/groupname/' + this.us.sanitizeURLParam(this.selectedSearch.label)]);
        this.router.navigate(["online-doctors-consultation/speciality/" + this.us.sanitizeURLParamC(this.selectedSearchC.Search)]);

        this.cs.setGA('Consult Doctors Online Home Page', 'Online Consultations Home Page', 'Online Consultations_Search', 'Home page_Search_specialty_' + this.us.sanitizeURLParamC(this.selectedSearchC.Search));
      }
      if (SearchId.toLowerCase() == "doc") {
        let docInfoA = this.selectedSearchC.SearchId.toString().split('_');

        let specName = docInfoA[1];
        let docId = docInfoA[2];
        localStorage.setItem('docProfileId', docId);
        localStorage.setItem('dcRedirectUrl', "/online-doctors-consultation/doctor/" + this.us.sanitizeURLParamC(this.selectedSearchC.Search));
        //this.router.navigate(['/' + this.cs.DOCTOR_PROFILE_URL_STRING + '/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/' + this.us.sanitizeURLParamC('dummy') + '/' + this.us.sanitizeURLParam(this.selectedSearch.label)]);
        this.router.navigate(["/online-doctors-consultation/doctor/" + this.us.sanitizeURLParamC(this.selectedSearchC.Search)]);

        this.cs.setGA('Consult Doctors Online Home Page', 'Online Consultations Home Page', 'Online Consultations_Search', 'Home page_Search_doctor_' + this.us.sanitizeURLParamC(this.selectedSearchC.Search));
      }
      if (SearchId.toLowerCase() == "sym") {
        localStorage.setItem('dcRedirectUrl', '/online-doctors-consultation/symptom/' + this.us.sanitizeURLParamC(this.selectedSearchC.Search));
        //this.router.navigate(['/' + this.cs.DOCTOR_SEARCH_URL_STRING + '/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/groupname/' + this.us.sanitizeURLParam(this.selectedSearch.label)]);
        this.router.navigate(['/online-doctors-consultation/symptom/' + this.us.sanitizeURLParamC(this.selectedSearchC.Search)]);

        this.cs.setGA('Consult Doctors Online Home Page', 'Online Consultations Home Page', 'Online Consultations_Search', 'Home page_Search_symptom_' + this.us.sanitizeURLParamC(this.selectedSearchC.Search));
      }
      if (SearchId.toLowerCase() == "tre") {
        localStorage.setItem('dcRedirectUrl', '/online-doctors-consultation/treatment/' + this.us.sanitizeURLParamC(this.selectedSearchC.Search));
        //this.router.navigate(['/' + this.cs.DOCTOR_SEARCH_URL_STRING + '/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/groupname/' + this.us.sanitizeURLParam(this.selectedSearch.label)]);
        this.router.navigate(['/online-doctors-consultation/treatment/' + this.us.sanitizeURLParamC(this.selectedSearchC.Search)]);

        this.cs.setGA('Consult Doctors Online Home Page', 'Online Consultations Home Page', 'Online Consultations_Search', 'Home page_Search_treatment_' + this.us.sanitizeURLParamC(this.selectedSearchC.Search));
      }
      if (SearchId.toLowerCase() == "dis") {
        localStorage.setItem('dcRedirectUrl', '/online-doctors-consultation/disease/' + this.us.sanitizeURLParamC(this.selectedSearchC.Search));
        //this.router.navigate(['/' + this.cs.DOCTOR_SEARCH_URL_STRING + '/' + this.us.sanitizeURLParam(this.selectedCity.name) + '/groupname/' + this.us.sanitizeURLParam(this.selectedSearch.label)]);
        this.router.navigate(['/online-doctors-consultation/disease/' + this.us.sanitizeURLParamC(this.selectedSearchC.Search)]);

        this.cs.setGA('Consult Doctors Online Home Page', 'Online Consultations Home Page', 'Online Consultations_Search', 'Home page_Search_disease_' + this.us.sanitizeURLParamC(this.selectedSearchC.Search));
      }
    }
  }
  openSignup() {
    localStorage.setItem('loginedirect', 'N');
    this.aaa.getLocalStorageValues('Before Social Login');
    this.aaa.loadingHide('loadingid');
    let config = {
      keyboard: false,
      backdrop: false,
      ignoreBackdropClick: true
    };
    this.modalRef = this.modalService.show(SignupComponent, config);
  }

  logout() {
    this.aaa.logoutUser();
  }
  iframelogout() {
    this.iFrame = false;
    this.router.navigate(['/']);
    //window.location.href = 'https://www.askapollo.com:44333';
  }
  // Hide other section when click on outside
  onClickedOutside(e: Event) {
    this.isCollapsedHeader = true;
  }
  submitSearch() {
    //this.goFetchC();
  }
  submitSearchPhy() {
    //this.goFetch();
  }
  userRoutes(currentRoute) {
    const array = ['/my/dashboard', '/my/dashboard-oc', '/my/profile', '/my/family', '/feedback', '/faqs', '/contact-us'];
    return array.indexOf(currentRoute) > -1;
  }

  OnlinewhatsApp() {
    this.cs.setGA('Consult Doctors Online Home Page', 'Online Consultations Home Page', 'Online Consultation_Home page_Whatsapp', 'Online Consultation_Whatsapp');

    window.open('https://api.whatsapp.com/send?phone=+917093840123&text=Hi, I contacted you Through your website.', '_blank');
  }

  OnlineoldSite() {
    this.cs.setGA('Consult Doctors Online Home Page', 'Online Consultations Home Page', 'Online Consultation_Visit Old Site', 'Online Consultation_Visit old site');
    window.open('https://www.askapollo.com/Online-Consultation/Account/PatientRegistration.aspx', '_blank');
    //window.open('https://www.askapollo.com/online-consultation/', '_blank');
  }
  searchBulr() {
    if (this.searchString == '' || this.searchString == null || this.searchString == undefined) {
      this.selectedSearch = null;
    }
    //alert(this.searchString);
  }

  getHospitalsByCitySpeciality(city, speciality) {
    this.aaa.loadingShow('loadingid');
    this.srs.getHospitalsByCitySpecialityNew(city, speciality)
      .subscribe(
        (hospitals: hospital[]) => {
          this.aaa.loadingHide('loadingid');
          this.hospitals = hospitals;
          this.hospitalsList = hospitals.filter(x => x.hospitalType == "1");
          this.clinicsList = hospitals.filter(x => x.hospitalType == "2");
          this.selectedHospital = { hospitalId: -1, hospitalName: this.DEFAULT_HOSPITAL_NAME, hospitalType: 'default' };
        }, (err) => {
          this.aaa.loadingHide('loadingid');
          this.errLog.log('header.component.ts', 'getHospitalsByCitySpeciality()', err);
        }
      );
  }
  getHospitalsByCitySymptom(city, symptom) {
    this.aaa.loadingShow('loadingid');
    this.srs.getHospitalsByCitySymptom(city, symptom)
      .subscribe(
        (hospitals: hospital[]) => {
          this.aaa.loadingHide('loadingid');
          this.hospitals = hospitals;
          this.hospitalsList = hospitals.filter(x => x.hospitalType == "1");
          this.clinicsList = hospitals.filter(x => x.hospitalType == "2");
          this.selectedHospital = { hospitalId: -1, hospitalName: this.DEFAULT_HOSPITAL_NAME, hospitalType: 'default' };
        }, (err) => {
          this.aaa.loadingHide('loadingid');
          this.errLog.log('header.component.ts', 'getHospitalsByCitySymptom()', err);
        }
      );
  }
  getHospitalsInCity(city) {
    this.aaa.loadingShow('loadingid');
    this.srs.getHospitalsInCityNew(city)
      .subscribe(
        (hospitals: hospital[]) => {
          this.aaa.loadingHide('loadingid');
          this.hospitals = hospitals;
          this.hospitalsList = hospitals.filter(x => x.hospitalType == "1");
          this.clinicsList = hospitals.filter(x => x.hospitalType == "2");
          this.selectedHospital = { hospitalId: -1, hospitalName: this.DEFAULT_HOSPITAL_NAME, hospitalType: 'default' };
        }, (err) => {
          this.aaa.loadingHide('loadingid');
          this.errLog.log('header.component.ts', 'getHospitalsInCity()', err);
        }
      );
  }

  /*
  *  Get hospitals from json file
  */
  getHospitalsFromJson() {
    this.hospitals = [];
    this.clinicsList = [];
    this.hospitalsList = [];

    let AllHospitalsJson = require('./../../../assets/json/cities-hospitals.json');


    this.hospitals = AllHospitalsJson;
    let hospitalsLength = AllHospitalsJson.length;

    var i;
    for (i = 0; i < hospitalsLength; i++) {
      if (AllHospitalsJson[i].cityId == this.selectedCity.id) {
        if (AllHospitalsJson[i].hospitalType == '2') {
          this.clinicsList.push(AllHospitalsJson[i]);
        }
        if (AllHospitalsJson[i].hospitalType == '1') {
          this.hospitalsList.push(AllHospitalsJson[i]);
        }
      }
    }
    /* console.log('Selected city ---');
     console.log(this.selectedCity);*/
    //this.selectedHospital = { hospitalId: -1, hospitalName: this.DEFAULT_HOSPITAL_NAME, hospitalType: 'default' };
    /* console.log('---all hospitals ---');
     console.log(this.hospitals);
     console.log('---hospitals ---');
     console.log(this.hospitalsList);
     console.log('---clinics ---');
     console.log(this.clinicsList);*/

  }
  /*
  *  Get all hospitals
  */
  getHospitals()
  {
    this.hospitals = [];
    this.clinicsList = [];
    this.hospitalsList = [];

    this.srs.getHospitalsInCityNew(this.selectedCity.id).subscribe(
      (data: hospital[]) => {
        this.hospitals = data;
          this.hospitalsList=this.hospitals.filter(x=>x.hospitalType=="1");
          this.clinicsList=this.hospitals.filter(x=>x.hospitalType=="2");
      }, (err) => {
        this.errLog.log('header.component.ts', 'preferredCitySelected()', err);
      }
    );
  }

  // signup health library
  openSignupHealthLibrary()
  {
    localStorage.setItem('loginedirect', 'N');
    this.aaa.loadingHide('loadingid');
    let config = {
      keyboard: false,
      backdrop: false,
      ignoreBackdropClick: true
    };
    this.modalRef = this.modalService.show(SignupHealthLibraryComponent, config);
  }
}

