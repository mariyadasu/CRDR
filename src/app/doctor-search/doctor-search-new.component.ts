import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy, Renderer2, Inject } from '@angular/core';
import {
    Router, Params, UrlTree, UrlSegmentGroup, NavigationEnd,
    UrlSegment, PRIMARY_OUTLET, ActivatedRoute
} from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { CommonService } from '@aa/services/common.service';
import { UtilsService } from '@aa/services/utils.service';
import { SearchService, boilerContent } from '@aa/services/search.service';

import { hospital } from '@aa/structures/hospital.interface';
import { doctor, docPageTitleandDescription, doctorNew } from '@aa/structures/doctor.interface';
import { trend } from '@aa/structures/city.interface';
import { AAAuthService } from '@aa/services/auth.service';
import { ErrlogService } from '@aa/services/errlog.service';
import { Meta } from '@angular/platform-browser';

import { city } from '@aa/structures/city.interface';

// interface for breadcrumbs
export interface bc {
    name: string,
    url: string
}

@Component({
    selector: 'app-doctor-search-new',
    templateUrl: './doctor-search-new.component.html',
    styleUrls: ['./doctor-search-new.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DoctorSearchNewComponent implements OnInit, OnDestroy, AfterViewInit {

    gettingDataFromServer = true;
    sortByString = 'Sort';

    selectHospitalString = 'Select Hospital';
    hospitals: hospital[] = [];

    doctors: doctor[] = [];
    // To keep track of all filters applied to current search
    filtersApplied: { name: string, value: any }[] = [];

    doctorsNew: doctorNew;
    seoSchema: any;

    // To handle pagination
    currentPage = 1;
    itemsPerPage = 15;
    doctorsPaginated: doctor[] = [];

    breadcrumbs: bc[] = [];

    docTrackerSub = new Subscription;
    hosTrackerSub = new Subscription;

    isCollapsed = true;

    currentSearch: UrlSegment[];

    currentCity: string;
    trends: trend[];
    bc: boilerContent = null;
    metapage: string;
    gender: string = 'Gender';
    language: string = 'Language';

    speciality: any;

    urlTree: UrlTree;
    urlSegmentGroup: UrlSegmentGroup;
    urlSegments: UrlSegment[];

    pageHeading: string = '';
    maxPaginationLength: number;
    totalDoctors: number;
    languagesAvailable: any;

    genderFilter: string = '';
    sortFilter: string = '';
    languageFilter: string = '';

    cities: city[] = [];
    hospitalsList: hospital[] = [];
    clinicsList: hospital[] = [];

    countryCode:any[];

    constructor(
        private cs: CommonService,
        private us: UtilsService,
        private srs: SearchService,
        private route: ActivatedRoute,
        public aaa: AAAuthService,
        private router: Router,
        private errLog: ErrlogService,
        private meta: Meta,
        private _renderer2: Renderer2) { }

    shortServices: any;
    filterType: any = '';
    message: any = '';

    ngOnInit() {

        // Redirect the perticular routes for SEO - bhaskar 10-01-2019
        this.urlTree = this.router.parseUrl(this.router.url);
        this.urlSegmentGroup = this.urlTree.root.children[PRIMARY_OUTLET];
        this.urlSegments = this.urlSegmentGroup.segments;
        let str = this.urlSegments[0].toString();
        if(this.urlSegments.length == 2)
            var str1 = this.urlSegments[1].toString();
        if(str == 'psychiatrist')
        {
            this.router.navigate(['/india/psychiatrist']);
        }
        if(str == 'neonatologist')
        {
            this.router.navigate(['/india/neonatologist']);
        }
        if(str == 'nephrologist')
        {
            this.router.navigate(['/india/nephrologist']);
        }
        if(str == 'gastroenterologist')
        {
            this.router.navigate(['/india/gastroenterologist']);
        }
        if(str == 'diabetologist')
        {
            this.router.navigate(['/india/diabetologist']);
        }

        if(str == 'neurologist')
        {
            this.router.navigate(['/india/neurologist']);
        }
        if(str == 'endocrinologist')
        {
            this.router.navigate(['/india/endocrinologist']);
        }
        if(str == 'oncologist')
        {
            this.router.navigate(['/india/oncologist']);
        }
        if(str == 'pediatrician')
        {
            this.router.navigate(['/india/pediatrician']);
        }

        if(str == 'gynecologist')
        {
            this.router.navigate(['/india/gynecologist']);
        }
        if(str == 'new-delhi')
        {
            this.router.navigate(['/delhi']);
        }
        if(str == 'indiaindex.aspx')
        {
            this.router.navigate(['/india']);
        }
        
        if(str == 'bengaluru' && str1 == 'surgical-oncologist')
        {
            this.router.navigate(['/bangalore/surgical-oncologist']);
        }
        if(str == 'mumbai' && str1 == 'hyperlocal')
        {
            this.router.navigate(['/mumbai']);
        }
        // Redirect the perticular routes for SEO - bhaskar 10-01-2019 -- end

        this.aaa.SHOW_SKIP = true;
        this.us.setActiveTab(this.us.TAB_PHYSICAL_APPOINTMENT);
        this.cs.setPageTitle("Book your doctor appointment today - Ask Apollo");

        // capture the parametrs from URL and perform action 
        this.getDocsForUrl();


        this.docTrackerSub = this.srs.doctorListTracker.subscribe(
            (docs: doctor[]) => {
                this.doctors = docs;
                this.gettingDataFromServer = false;
            }
        )

        this.hospitals = this.srs.getHospitalsFromLocalStorage();
        this.hosTrackerSub = this.srs.hospitalsTracker.subscribe(
            (hospitals: hospital[]) => {
                this.hospitals = hospitals;
            }
        );

        // When coming into this page, scroll to the top of the page
        this.router.events.subscribe((evt) => {
            if (evt instanceof NavigationEnd) {
                document.getElementById('mh').scrollIntoView();
            }
        });
        this.srs.trendsTracker.subscribe(
            (trends: trend[]) => {
                this.trends = trends;
            }
        );

        this.cs.setShowMobileNoInLoginFlow(true);

        this.aaa.loadingShow('loadingid');
        this.srs.getAllCitiesNew()
          .subscribe(
            (cities: city[]) => {
              this.aaa.loadingHide('loadingid');
              this.cities = cities;
              this.cs.saveCitiesList(this.cities);
              this.srs.saveCities(this.cities);
            }, (err) => {
              this.aaa.loadingHide('loadingid');
              this.errLog.log('doctor-search-new.component.ts', 'ngOnInit()', err);
            }
          );

        this.getCountryCode();
    }



    setCurrentHospital(h: hospital) {
        this.selectHospitalString = h.hospitalName;
    }

    filterBy(name: string, value: any) {
        if (name == 'g') {
            if (value == '')
                this.genderFilter = '';
            else
                this.genderFilter = value;
        }
        if (name == 'l') {
            if (value == '')
                this.languageFilter = '';
            else
                this.languageFilter = value;
        }
        if (name == 'e') {
            if (value == '')
                this.sortFilter = '';
            else
                this.sortFilter = value;
        }
        this.getDocsForUrl();
    }

    filterAvailableToday(event: any) {
        if (event.target.checked) {
            this.filtersApplied.push({ name: 'at', value: true });
        }
        else {
            let currentValue = this.filtersApplied.findIndex(f => {
                return f.name == 'at';
            });
            if (currentValue != -1) {
                this.filtersApplied.splice(currentValue, 1);
            }
        }
        this.currentPage = 1;
        this.getDocsForUrl();

        // this.searchService.filterSearchResults(this.filtersApplied);
    }
    timeDefults = "Time";
    filterTiming(name: string) {
        if (name == 'am') {
            this.timeDefults = "Morning";
        }
        if (name == 'aa') {
            this.timeDefults = "Afternoon";
        }
        if (name == 'ae') {
            this.timeDefults = "Evening";
        }
        let currentValue = this.filtersApplied.findIndex(f => {
            return f.name == name;
        });

        // If this filter has been applied already, we have nothing new to do.
        if (currentValue != -1) return;

        // We have boolean properties in the doctor interface to indicate if a doctor is available at a time
        // Whenever the user applies a new timing filter, we need to ensure that all other timing filters are erased
        let cam = this.filtersApplied.findIndex(f => {
            return f.name == 'am';
        });
        if (cam != -1) this.filtersApplied.splice(currentValue, 1);

        let caa = this.filtersApplied.findIndex(f => {
            return f.name == 'aa';
        });
        if (caa != -1) this.filtersApplied.splice(currentValue, 1);

        let cae = this.filtersApplied.findIndex(f => {
            return f.name == 'ae';
        });
        if (cae != -1) this.filtersApplied.splice(currentValue, 1);

        // After all the timing filters are erased, add the currently selected one to the filters list and apply it
        this.filtersApplied.push({ name: name, value: true });

        this.currentPage = 1;
        this.getDocsForUrl();
        // this.searchService.filterSearchResults(this.filtersApplied);
    }

    ngAfterViewInit() {
        document.getElementById('mh').scrollIntoView();
    }



    pn = '';
    sendAppLink() {
        if (this.pn.length != 10) {
            alert('Please enter a valid 10 digit number: ' + this.pn);
        }
        else {
            this.cs.sendAppLinkToMobile(this.pn);
            this.pn = '';
        }
    }
    removeSpaces(item) {
        item = item.replace(/ /g, '-');
        item = item.replace(/%20/g, '-');
        return item;
    }

    getUrlWithSpecialityCharacters(keyword: string) {
        if(keyword)
        {
            keyword = keyword.split(' ').join('-');
            keyword = keyword.split('&').join('and');
            return keyword.toLowerCase();    
        }
        else
            return keyword; 
    }
    // Hide filters section when click on outside
    onClickedOutside(e: Event) {
        //this.isCollapsed = true;
    }
    sendAppLinkEnter() {
        this.sendAppLink();
    }

    getDocsForUrl() {
        // When starting a new search from within the Doctor Search Page, Angular doesn't reload the Doctor-Search component
        // It simply refreshses the URL. So, we need to subscribe to the URL and act on it.
        this.route.url.subscribe(
            () => {
                this.urlTree = this.router.parseUrl(this.router.url);
                this.urlSegmentGroup = this.urlTree.root.children[PRIMARY_OUTLET];
                this.urlSegments = this.urlSegmentGroup.segments;
                this.currentCity = this.urlSegments[0] != null ? this.urlSegments[0].toString() : 'hyderabad';
                
                if (this.urlSegments.length == 1) {
                    this.getDoctorForCity(this.currentCity);
                }
                // http://localhost:4200/hyderabad/cardiologist
                if (this.urlSegments.length == 2) {
                    this.speciality = this.urlSegments[1] != null ? this.urlSegments[1].toString() : 'cardiologist';
                    this.getDoctoresForCitySpeciality(this.currentCity, this.speciality);
                }
                if (this.urlSegments.length == 3) {
                    this.filterType = this.urlSegments[1] != null ? this.urlSegments[1].toString() : 'language';

                    if (this.filterType.toLowerCase() === 'hospital') {
                        let hospital = this.urlSegments[2] != null ? this.urlSegments[2].toString() : '';
                        this.getDoctoresForCityHospital(this.currentCity, hospital);
                    }
                    if (this.filterType.toLowerCase() === 'symptom') {
                        let symptom = this.urlSegments[2] != null ? this.urlSegments[2].toString() : '';
                        this.getDocsCitySymptom(this.currentCity, symptom);
                    }
                    if (this.filterType.toLowerCase() === 'hyperlocal') {
                        let hyperlocal = this.urlSegments[2] != null ? this.urlSegments[2].toString() : '';
                        this.getDocsCityHyperlocal(this.currentCity, hyperlocal);
                    }
                    if (this.filterType.toLowerCase() === 'language') {
                        let language = this.urlSegments[2] != null ? this.urlSegments[2].toString() : 'english';
                        this.getDocsCityLanguage(this.currentCity, language);
                    }
                }
                if (this.urlSegments.length == 4) {
                    this.filterType = this.urlSegments[1] != null ? this.urlSegments[1].toString() : 'hospital';

                    if (this.filterType.toLowerCase() === 'hospital') {
                        let hospital = this.urlSegments[2] != null ? this.urlSegments[2].toString() : '';
                        let speciality = this.urlSegments[3] != null ? this.urlSegments[3].toString() : '';
                        this.getDocsCityHospitalSpeciality(this.currentCity, hospital, speciality);
                    }
                    if (this.filterType.toLowerCase() === 'hyperlocal') {
                        let speciality = this.urlSegments[2] != null ? this.urlSegments[2].toString() : '';
                        let hyperlocal = this.urlSegments[3] != null ? this.urlSegments[3].toString() : '';
                        this.getDocsCitySpecialityHyperlocal(this.currentCity, speciality, hyperlocal);
                    }
                }
                if (this.urlSegments.length == 5) {
                    this.filterType = this.urlSegments[3] != null ? this.urlSegments[3].toString() : '';

                    if (this.filterType.toLowerCase() === 'symptom') {
                        let hospital = this.urlSegments[2] != null ? this.urlSegments[2].toString() : '';
                        let symptom = this.urlSegments[4] != null ? this.urlSegments[4].toString() : '';
                        this.getDocsCityHospitalSymptom(this.currentCity, hospital, symptom);
                    }
                }
                //this.gettingDataFromServer = true;
            }
        );
    }
    /*
    *    get the doctors list based on city 
    */
    getDoctorForCity(city: any) {

        this.aaa.loadingShow('loadingid');
        this.srs.getDocsCityV6(city, this.filtersApplied, this.currentPage, this.genderFilter, this.sortFilter, this.languageFilter)
            .subscribe(
                (data: doctorNew) => {
                    this.aaa.loadingHide('loadingid');
                    this.doctorsNew = data;
                    this.srs.gotDocsList(this.doctorsNew['objAPIRDoctorSearchPageModelBO']);

                    this.cs.setPageTitle(this.doctorsNew.objAPITitleandDescriptionBO.PageTitle);
                    this.cs.setPageDescription(this.doctorsNew.objAPITitleandDescriptionBO.PageDescription);
                    this.message = this.doctorsNew.objAPITitleandDescriptionBO.PageContent;

                    this.maxPaginationLength = this.doctorsNew.MaxPaginationLength;
                    this.totalDoctors = this.doctorsNew.TotalRecords;
                    this.languagesAvailable = this.doctorsNew.LanguagesAvailable;

                    this.getPageSchema();
                    this.cs.setCanonicallink(window.location.href);

                    this.setOGGraph();
                    this.setTwitterCard();

                    this.pageHeading = 'Apollo Doctors in ' + this.us.deSanitizeURLParam(city);

                    this.setSEOSchema();
                }, (err) => {
                    this.aaa.loadingHide('loadingid');
                    this.errLog.log('doctor-search-new.component.ts', 'getDoctorForCity()', err);
                }
            );

        this.breadcrumbs = [{ name: this.us.deSanitizeURLParam(city), url: city }];

        let breadcrumbsSchema = [
            { name: 'Home', url: '/' },
            { name: city, url: '/' + city }
        ];

        this.cs.languageBreadsrcumsschema(breadcrumbsSchema, 2, this._renderer2);
        // Most searched localities
        this.srs.getSidebarLinks4DoctorSearchCity(city);
    }
    /*
    *    get the doctors list based on city and hospital name
    */
    getDoctoresForCityHospital(city: any, hospital: any) {
        this.aaa.loadingShow('loadingid');
        this.srs.getDocsCityHospitalV6(city, hospital, this.filtersApplied, this.currentPage, this.genderFilter, this.sortFilter, this.languageFilter)
            .subscribe(
                (data: doctorNew) => {
                    this.aaa.loadingHide('loadingid');
                    this.doctorsNew = data;
                    this.srs.gotDocsList(this.doctorsNew['objAPIRDoctorSearchPageModelBO']);

                    this.cs.setPageTitle(this.doctorsNew.objAPITitleandDescriptionBO.PageTitle);
                    this.cs.setPageDescription(this.doctorsNew.objAPITitleandDescriptionBO.PageDescription);
                    this.message = this.doctorsNew.objAPITitleandDescriptionBO.PageContent;


                    this.maxPaginationLength = this.doctorsNew.MaxPaginationLength;
                    this.totalDoctors = this.doctorsNew.TotalRecords;
                    this.languagesAvailable = this.doctorsNew.LanguagesAvailable;

                    this.cs.setCanonicallink(window.location.href);
                    this.setOGGraph();
                    this.setTwitterCard();

                    this.pageHeading = 'Apollo Doctors in ' + this.us.deSanitizeURLParam(hospital);

                    this.setSEOSchema();
                }, (err) => {
                    this.aaa.loadingHide('loadingid');
                    this.errLog.log('doctor-search-new.component.ts', 'getDoctoresForCityHospital()', err);
                }
            );

        this.breadcrumbs = [
            { name: this.us.deSanitizeURLParam(city), url: city },
            { name: this.us.deSanitizeURLParam(hospital), url: city + '/hospital/' + hospital }
        ];

        let breadcrumbsSchema = [
            { name: 'Home', url: '/' },
            { name: this.us.deSanitizeURLParam(city), url: '/' + this.us.sanitizeURLParam(city) },
            { name: this.us.deSanitizeURLParam(hospital), url: '/' + this.us.sanitizeURLParam(city) + '/hospital/' + this.us.sanitizeURLParam(hospital) }
        ];

        this.cs.languageBreadsrcumsschema(breadcrumbsSchema, 3, this._renderer2);

        // Most searched localities
        this.srs.getSidebarLinks4DoctorSearchCity(city);
    }
    /*
    *    get the doctors list based on city and hospital name
    */
    getDoctoresForCitySpeciality(city: any, speciality: any) {
        this.aaa.loadingShow('loadingid');
        this.srs.getDocsCitySpecialityV6(city, speciality, this.filtersApplied, this.currentPage, this.genderFilter, this.sortFilter, this.languageFilter)
            .subscribe(
                (data: doctorNew) => {
                    this.aaa.loadingHide('loadingid');
                    this.doctorsNew = data;
                    this.srs.gotDocsList(this.doctorsNew['objAPIRDoctorSearchPageModelBO']);

                    this.cs.setPageTitle(this.doctorsNew.objAPITitleandDescriptionBO.PageTitle);
                    this.cs.setPageDescription(this.doctorsNew.objAPITitleandDescriptionBO.PageDescription);
                    this.message = this.doctorsNew.objAPITitleandDescriptionBO.PageContent;

                    this.maxPaginationLength = this.doctorsNew.MaxPaginationLength;
                    this.totalDoctors = this.doctorsNew.TotalRecords;
                    this.languagesAvailable = this.doctorsNew.LanguagesAvailable;

                    this.getPageSchema();
                    this.cs.setCanonicallink(window.location.href);
                    this.setOGGraph();
                    this.setTwitterCard();

                    this.pageHeading = this.us.deSanitizeURLParam(speciality) + ' in ' + this.us.deSanitizeURLParam(city);

                    this.setSEOSchema();
                }, (err) => {
                    this.aaa.loadingHide('loadingid');
                    this.errLog.log('doctor-search-new.component.ts', 'getDoctoresForCitySpeciality()', err);
                }
            );

        this.breadcrumbs = [
            { name: this.us.deSanitizeURLParam(city), url: city },
            { name: this.us.deSanitizeURLParam(speciality), url: city + '/' + speciality }
        ];

        let breadcrumbsSchema = [
            { name: 'Home', url: '/' },
            { name: city, url: '/' + city },
            { name: speciality, url: '/' + city + '/' + speciality }
        ];

        this.cs.languageBreadsrcumsschema(breadcrumbsSchema, 3, this._renderer2);

        // Most searched localities
        this.srs.getSidebarLinks4DoctorSearchCitySpeciality(city, speciality);
    }


    /*
    *    get the doctors list based on city, hospital name and speciality
    */
    getDocsCityHospitalSpeciality(city: any, hospital: any, speciality: any) {
        this.aaa.loadingShow('loadingid');
        this.srs.getDocsCityHospitalSpecialityV6(city, hospital, speciality, this.filtersApplied, this.currentPage, this.genderFilter, this.sortFilter, this.languageFilter)
            .subscribe(
                (data: doctorNew) => {
                    this.aaa.loadingHide('loadingid');
                    this.doctorsNew = data;
                    this.srs.gotDocsList(this.doctorsNew['objAPIRDoctorSearchPageModelBO']);

                    this.cs.setPageTitle(this.doctorsNew.objAPITitleandDescriptionBO.PageTitle);
                    this.cs.setPageDescription(this.doctorsNew.objAPITitleandDescriptionBO.PageDescription);
                    this.message = this.doctorsNew.objAPITitleandDescriptionBO.PageContent;

                    this.maxPaginationLength = this.doctorsNew.MaxPaginationLength;
                    this.totalDoctors = this.doctorsNew.TotalRecords;
                    this.languagesAvailable = this.doctorsNew.LanguagesAvailable;

                    this.setSEOSchema();
                }, (err) => {
                    this.aaa.loadingHide('loadingid');
                    this.errLog.log('doctor-search-new.component.ts', 'getDocsCityHospitalSpeciality()', err);
                }
            );

        this.breadcrumbs = [
            { name: this.us.deSanitizeURLParam(city), url: city },
            { name: this.us.deSanitizeURLParam(hospital), url: city + '/hospital/' + hospital },
            { name: this.us.deSanitizeURLParam(speciality), url: city + '/hospital/' + hospital + '/' + speciality }
        ];
        this.metapage = city + '/hospital/' + hospital + '/' + speciality;

        // Most searched localities
        this.srs.getSidebarLinks4DoctorSearchCitySpeciality(city, speciality);
    }
    /*
    *    get the doctors list based on city and symptom
    */
    getDocsCitySymptom(city: any, symptom: any) {
        this.aaa.loadingShow('loadingid');
        this.srs.getDocsCitySymptomV6(city, symptom, this.filtersApplied, this.currentPage, this.genderFilter, this.sortFilter, this.languageFilter)
            .subscribe(
                (data: doctorNew) => {
                    this.aaa.loadingHide('loadingid');
                    this.doctorsNew = data;
                    this.srs.gotDocsList(this.doctorsNew['objAPIRDoctorSearchPageModelBO']);

                    this.cs.setPageTitle(this.doctorsNew.objAPITitleandDescriptionBO.PageTitle);
                    this.cs.setPageDescription(this.doctorsNew.objAPITitleandDescriptionBO.PageDescription);
                    this.message = this.doctorsNew.objAPITitleandDescriptionBO.PageContent;

                    this.maxPaginationLength = this.doctorsNew.MaxPaginationLength;
                    this.totalDoctors = this.doctorsNew.TotalRecords;
                    this.languagesAvailable = this.doctorsNew.LanguagesAvailable;

                    this.setSEOSchema();
                }, (err) => {
                    this.aaa.loadingHide('loadingid');
                    this.errLog.log('doctor-search-new.component.ts', 'getDocsCitySymptom()', err);
                }
            );

        this.breadcrumbs = [
            { name: this.us.deSanitizeURLParam(city), url: city },
            { name: this.us.deSanitizeURLParam(symptom), url: city + '/symptom/' + symptom }
        ];

        // Most searched localities
        this.srs.getSidebarLinks4DoctorSearchCity(city);
    }
    /*
    *    get the doctors list based on city, hospital and symptom
    */
    getDocsCityHospitalSymptom(city: any, hospital: any, symptom: any) {
        this.aaa.loadingShow('loadingid');
        this.srs.getDocsCityHospitalSymptomnameV6(city, hospital, symptom, this.filtersApplied, this.currentPage, this.genderFilter, this.sortFilter, this.languageFilter)
            .subscribe(
                (data: doctorNew) => {
                    this.aaa.loadingHide('loadingid');
                    this.doctorsNew = data;
                    this.srs.gotDocsList(this.doctorsNew['objAPIRDoctorSearchPageModelBO']);

                    this.cs.setPageTitle(this.doctorsNew.objAPITitleandDescriptionBO.PageTitle);
                    this.cs.setPageDescription(this.doctorsNew.objAPITitleandDescriptionBO.PageDescription);
                    this.message = this.doctorsNew.objAPITitleandDescriptionBO.PageContent;

                    this.maxPaginationLength = this.doctorsNew.MaxPaginationLength;
                    this.totalDoctors = this.doctorsNew.TotalRecords;
                    this.languagesAvailable = this.doctorsNew.LanguagesAvailable;
                    this.setSEOSchema();
                }, (err) => {
                    this.aaa.loadingHide('loadingid');
                    this.errLog.log('doctor-search-new.component.ts', 'getDocsCityHospitalSymptom()', err);
                }
            );

        this.breadcrumbs = [
            { name: this.us.deSanitizeURLParam(city), url: city },
            { name: this.us.deSanitizeURLParam(hospital), url: city + '/hospital/' + hospital },
            { name: this.us.deSanitizeURLParam(symptom), url: city + '/symptom/' + symptom }
        ];

        // Most searched localities
        this.srs.getSidebarLinks4DoctorSearchCity(city);
    }
    /*
    *    get the doctors list based on city, speciality and hyperlocal
    */
    getDocsCitySpecialityHyperlocal(city: any, speciality: any, hyperlocal: any) {
        this.aaa.loadingShow('loadingid');
        this.srs.getDocsCitySpecialityHyperlocalV6(city, speciality, hyperlocal, this.filtersApplied, this.currentPage, this.genderFilter, this.sortFilter, this.languageFilter)
            .subscribe(
                (data: doctorNew) => {
                    this.aaa.loadingHide('loadingid');
                    this.doctorsNew = data;
                    this.srs.gotDocsList(this.doctorsNew['objAPIRDoctorSearchPageModelBO']);

                    this.cs.setPageTitle(this.doctorsNew.objAPITitleandDescriptionBO.PageTitle);
                    this.cs.setPageDescription(this.doctorsNew.objAPITitleandDescriptionBO.PageDescription);
                    this.message = this.doctorsNew.objAPITitleandDescriptionBO.PageContent;

                    this.getPageSchema();
                    this.cs.setCanonicallink(window.location.href);
                    this.setOGGraph();
                    this.setTwitterCard();
                    this.pageHeading = this.us.deSanitizeURLParam(speciality) + ' in ' + this.us.deSanitizeURLParam(hyperlocal) + ', ' + this.us.deSanitizeURLParam(city);

                    this.maxPaginationLength = this.doctorsNew.MaxPaginationLength;
                    this.totalDoctors = this.doctorsNew.TotalRecords;
                    this.languagesAvailable = this.doctorsNew.LanguagesAvailable;

                    this.setSEOSchema();
                }, (err) => {
                    this.aaa.loadingHide('loadingid');
                    this.errLog.log('doctor-search-new.component.ts', 'getDocsCitySpecialityHyperlocal()', err);
                }
            );

        this.breadcrumbs = [
            { name: this.us.deSanitizeURLParam(city), url: city },
            { name: this.us.deSanitizeURLParam(speciality), url: city + '/' + speciality },
            { name: this.us.deSanitizeURLParam(hyperlocal), url: city + '/hyperlocal/' + speciality + '/' + hyperlocal }
        ];

        let breadcrumbsSchema = [
            { name: 'Home', url: '/' },
            { name: city, url: '/' + city },
            { name: speciality, url: '/' + city + '/' + speciality },
            { name: hyperlocal, url: '/' + city + '/hyperlocal/' + speciality + '/' + hyperlocal }
        ];
        this.cs.languageBreadsrcumsschema(breadcrumbsSchema, 4, this._renderer2);

        // Most searched localities
        this.srs.getSidebarLinks4DoctorSearchCitySpeciality(city, speciality);
    }
    /*
    *    get the doctors list based on city and hyperlocal
    */
    getDocsCityHyperlocal(city: any, hyperlocal: any) {
        this.aaa.loadingShow('loadingid');
        this.srs.getDocsCityHyperlocalV6(city, hyperlocal, this.filtersApplied, this.currentPage, this.genderFilter, this.sortFilter, this.languageFilter)
            .subscribe(
                (data: doctorNew) => {
                    this.aaa.loadingHide('loadingid');
                    this.doctorsNew = data;
                    this.srs.gotDocsList(this.doctorsNew['objAPIRDoctorSearchPageModelBO']);

                    this.cs.setPageTitle(this.doctorsNew.objAPITitleandDescriptionBO.PageTitle);
                    this.cs.setPageDescription(this.doctorsNew.objAPITitleandDescriptionBO.PageDescription);
                    this.message = this.doctorsNew.objAPITitleandDescriptionBO.PageContent;

                    this.getPageSchema();
                    this.cs.setCanonicallink(window.location.href);
                    this.setOGGraph();
                    this.setTwitterCard();

                    this.pageHeading = 'Apollo Doctors in ' + this.us.deSanitizeURLParam(hyperlocal) + ', ' + this.us.deSanitizeURLParam(city);
                    this.maxPaginationLength = this.doctorsNew.MaxPaginationLength;
                    this.totalDoctors = this.doctorsNew.TotalRecords;
                    this.languagesAvailable = this.doctorsNew.LanguagesAvailable;

                    this.setSEOSchema();
                }, (err) => {
                    this.aaa.loadingHide('loadingid');
                    this.errLog.log('doctor-search-new.component.ts', 'getDocsCityHyperlocal()', err);
                }
            );

        this.breadcrumbs = [
            { name: this.us.deSanitizeURLParam(city), url: city },
            { name: this.us.deSanitizeURLParam(hyperlocal), url: city + '/hyperlocal/' + hyperlocal }
        ];

        let breadcrumbsSchema = [
            { name: 'Home', url: '/' },
            { name: city, url: '/' + city },
            { name: hyperlocal, url: '/' + city + '/hyperlocal/' + hyperlocal }
        ];

        this.cs.languageBreadsrcumsschema(breadcrumbsSchema, 3, this._renderer2);

        // Most searched localities
        this.srs.getSidebarLinks4DoctorSearchCity(city);
    }
    /*
    *    get the doctors list based on city and language
    */
    getDocsCityLanguage(city: any, language: any) {
        this.aaa.loadingShow('loadingid');
        this.srs.getDocsCityLanguageV6(city, language, this.filtersApplied, this.currentPage, this.genderFilter, this.sortFilter, this.languageFilter)
            .subscribe(
                (data: doctorNew) => {
                    this.aaa.loadingHide('loadingid');
                    this.doctorsNew = data;
                    this.srs.gotDocsList(this.doctorsNew['objAPIRDoctorSearchPageModelBO']);

                    this.cs.setPageTitle(this.doctorsNew.objAPITitleandDescriptionBO.PageTitle);
                    this.cs.setPageDescription(this.doctorsNew.objAPITitleandDescriptionBO.PageDescription);
                    this.message = this.doctorsNew.objAPITitleandDescriptionBO.PageContent;

                    this.getPageSchema();
                    this.cs.setCanonicallink(window.location.href);
                    this.setOGGraph();
                    this.setTwitterCard();

                    this.pageHeading = this.us.deSanitizeURLParam(language) + ' Speaking Doctors in ' + this.us.deSanitizeURLParam(city);

                    this.maxPaginationLength = this.doctorsNew.MaxPaginationLength;
                    this.totalDoctors = this.doctorsNew.TotalRecords;
                    this.languagesAvailable = this.doctorsNew.LanguagesAvailable;
                }, (err) => {
                    this.aaa.loadingHide('loadingid');
                    this.errLog.log('doctor-search-new.component.ts', 'getDocsCityHyperlocal()', err);
                }
            );

        this.breadcrumbs = [
            { name: this.us.deSanitizeURLParam(city), url: city },
            { name: this.us.deSanitizeURLParam(language), url: city + '/language/' + language }
        ];

        let breadcrumbsSchema = [
            { name: 'Home', url: '/' },
            { name: city, url: '/' + city },
            { name: 'Language', url: '/' + city + '/lanugage/' + language }
        ];

        this.cs.languageBreadsrcumsschema(breadcrumbsSchema, 3, this._renderer2);

        // Most searched localities
        this.srs.getSidebarLinks4DoctorSearchCity(city);
    }
    /*
    *    Set the scheme for seo purpose
    */
    setSEOSchema() {
        if (this.doctorsNew['objSEOSchemaonDoctorSearchPageForHospitalInfo']) {
            this.seoSchema = this.doctorsNew['objSEOSchemaonDoctorSearchPageForHospitalInfo'];
        }
    }
    getPageSchema() {
        var text = '{ "@context":"http://schema.org/" , "@type":"WebSite","name":"test","url":"https://www.askapollo.com/"}'
        var obj = JSON.parse(text);
        obj.name = this.doctorsNew.objAPITitleandDescriptionBO.PageTitle;
        obj.url = this.cs.getPresentUrl();

        this.cs.doctorInfoschema(obj, this._renderer2);
    }

    setOGGraph() {
        this.meta.addTag({ name: 'og:title', content: this.doctorsNew.objAPITitleandDescriptionBO.PageTitle });
        this.meta.addTag({ name: 'og:site_name', content: 'Ask Apollo' });
        this.meta.addTag({ name: 'og:url', content: this.cs.getPresentUrl() });
        this.meta.addTag({ name: 'og:description', content: this.doctorsNew.objAPITitleandDescriptionBO.PageDescription });
        this.meta.addTag({ name: 'og:type', content: 'website' });
        this.meta.addTag({ name: 'og:image', content: this.cs.getDomain() + '/assets/askapollo-logo.png' });
    }
    setTwitterCard() {
        this.meta.addTag({ name: 'twitter:card', content: 'Summary' });
        this.meta.addTag({ name: 'twitter:site', content: '@HospitalsApollo' });
        this.meta.addTag({ name: 'twitter:title', content: this.doctorsNew.objAPITitleandDescriptionBO.PageTitle });
        this.meta.addTag({ name: 'twitter:description', content: this.doctorsNew.objAPITitleandDescriptionBO.PageDescription });
    }
    /*
    *    Get the first letter capital
    */
    getFirstLetterCapital(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    getPage(page: number) {
        // When call to this function, scroll to the top of the page
        document.getElementById('mh').scrollIntoView();

        this.currentPage = page;
        this.getDocsForUrl();
    }

    preferredCitySelectedNew(c: any)
    {
        console.log('Hello   ----- '+c);
        if (c.value != "-1")
        {
            this.aaa.loadingShow('loadingid');
            this.srs.getHospitalsInCityNew(c.value).subscribe(
              (data: hospital[]) => {
                  this.aaa.loadingHide('loadingid');
                this.hospitals = data;
                  this.hospitalsList=this.hospitals.filter(x=>x.hospitalType=="1");
                  this.clinicsList=this.hospitals.filter(x=>x.hospitalType=="2");
              }, (err) => {
                  this.aaa.loadingHide('loadingid');
                this.errLog.log('doctor-search-new.component.ts', 'preferredCitySelectedNew()', err);
              }
            );
        }
    }

    getCountryCode()
    {
        this.aaa.getCountryCodeForRegistration().subscribe(data=>{
          this.countryCode=JSON.parse(data)
         
        })
    }


    ngOnDestroy() {
        this.docTrackerSub.unsubscribe();
        this.hosTrackerSub.unsubscribe();
    }
}
