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
import { doctor, doctorNew } from '@aa/structures/doctor.interface';
import { trend } from '@aa/structures/city.interface';
import { AAAuthService } from '@aa/services/auth.service';
import { city } from '@aa/structures/city.interface';
import { StoreService } from '@aa/services/store.service';
import { ErrlogService } from '@aa/services/errlog.service';
import { Meta } from '@angular/platform-browser';


// interface for breadcrumbs
export interface bc {
  name: string,
  url: string
}

@Component({
  selector: 'app-apollo-doctors',
  templateUrl: './apollo-doctors.component.html',
  styleUrls: ['./apollo-doctors.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ApolloDoctorsComponent implements OnInit, OnDestroy, AfterViewInit {

  gettingDataFromServer = true;
  sortByString = 'Sort';
  selectHospitalString = 'Select Hospital';
  hospitals: hospital[] = [];
  doctors: doctor[] = [];
  // To keep track of all filters applied to current search
  filtersApplied: { name: string, value: any }[] = [];
  // To handle pagination
  currentPage = 1;
  itemsPerPage = 15;
  totalDoctors: number;
  doctorsPaginated: doctor[] = [];
  breadcrumbs: bc[] = [];
  docTrackerSub = new Subscription;
  hosTrackerSub = new Subscription;
  isCollapsed = true;
  availableLanguages = [];
  currentSearch: UrlSegment[];
  getCityTrackerSub: Subscription;
  currentCity = '';
  trends: trend[];
  citiesTrackerSub: Subscription;
  urlLength: number;
  bc: boilerContent = null;
  shortServices: any;

  doctorsNew: doctorNew;
  maxPaginationLength: number;
  availableAlphabets = [];
  speciality: string;
  alphabet: string;
  language: string;

  message: any = '';
  selectedIndex: number = null;
  allIndex: number = 1;

  urlTree: UrlTree;
  urlSegmentGroup: UrlSegmentGroup;
  urlSegments: UrlSegment[];

  heading: string;

  constructor(
    private cs: CommonService,
    private us: UtilsService,
    private srs: SearchService,
    private route: ActivatedRoute,
    public aaa: AAAuthService,
    private router: Router,
    private ss: StoreService,
    private errLog: ErrlogService,
    private meta: Meta,
    private _renderer2: Renderer2) { }

  ngOnInit() {
    this.cs.setPageTitle('List of Apollo Doctors in India - Ask Apollo');
    this.cs.setPageDescription('Browse through a complete list of all best doctors in Apollo Hospitals across India. Find a doctor near your city and book appointments instantly!');

    this.aaa.loadingShow('loadingid');
    this.aaa.SHOW_SKIP = true;
    this.us.setActiveTab(this.us.TAB_PHYSICAL_APPOINTMENT);

    this.getUrlSegments();

    this.docTrackerSub = this.srs.doctorListTracker.subscribe(
      (docs: doctor[]) => {

        this.gettingDataFromServer = false;
        this.doctors = docs;

        // In More Filters, the list of languages should be extracted from those available in the current search list
        // So, get all the available languages and then strip out duplicated using the filter method
        docs.forEach(element => {
          this.availableLanguages.push(...element.LanguagesKnown.split(','));
        });
        this.availableLanguages = this.availableLanguages.filter((x, i, a) => a.indexOf(x) == i)
        this.aaa.loadingHide('loadingid');
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

    var data = this.ss.getToken(this.ss.TOKEN_CITY);
    this.currentCity = data.name;
    this.srs.getSidebarLinks4DoctorSearchCity(this.currentCity);

    this.srs.trendsTracker.subscribe(
      (trends: trend[]) => {
        this.trends = trends;
      }
    );
  }

  setCurrentHospital(h: hospital) {
    this.selectHospitalString = h.hospitalName;
  }




  filterAvailableToday(event: any) {
    if (event.target.checked) {
      this.filtersApplied.push({ name: 'at', value: true });
    } else {
      let currentValue = this.filtersApplied.findIndex(f => {
        return f.name == 'at';
      });
      if (currentValue != -1) {
        this.filtersApplied.splice(currentValue, 1);
      }
    }

    this.getDocsForUrl(this.currentSearch);
    this.srs.filterSearchResults(this.filtersApplied);
  }



  ngAfterViewInit() {
    document.getElementById('mh').scrollIntoView();
  }

  pn = '';
  sendAppLink() {
    if (this.pn.length != 10) alert('Please enter a valid 10 digit number: ' + this.pn);
    else this.cs.sendAppLinkToMobile(this.pn);
  }


  //Added BY Saravana
  GetwithoutSpecialCharacter(speciality: string) {
    speciality = speciality.replace('-', ' ').toLowerCase();
    if (speciality.indexOf(' and ') > -1)
      speciality = speciality.replace('and', '&');
    return speciality.toLowerCase();
  }



  gender: string = 'Gender';
  lang: string = 'Language';

  availableLanguagesMale = [];
  availableLanguagesFemale = [];
  availableLanguagesActual = [];


  filterBy(name: string, value: any) {
    // Set the text to the button -- start
    if (value == 1) {
      this.gender = 'Male Doctor';
      this.availableLanguages = this.availableLanguagesMale;
    }
    else if (value == 2) {
      this.gender = 'Female Doctor';
      this.availableLanguages = this.availableLanguagesFemale;
    }
    else {
      this.lang = value;
      //this.availableLanguages=this.availableLanguagesActual;
    }

    // Set the text to the button -- end
    // If the filter has been applied before, figure out the previous value.
    let currentValue = this.filtersApplied.findIndex(f => {
      return f.name == name;
    });

    // If the filter has never been applied before, add the filter
    if (currentValue == -1) {
      this.filtersApplied.push({ name: name, value: value });
      this.srs.filterSearchResults(this.filtersApplied);
    }
    // If the value of filter param is same, no point in reapplying the filter
    else if (this.filtersApplied[currentValue].value == value) {
      return;
    }
    // If a new value has been added to an existing filter param, update the param
    else {
      this.filtersApplied[currentValue].value = value;
      this.srs.filterSearchResults(this.filtersApplied);


      if (this.doctors.length == 0) return;

      // Save a local list of doctors that can be iterated upon to apply multiple filters
      let fl = this.doctors;
      this.filtersApplied.forEach(
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
      //this.filteredDocList = fl;
      this.srs.doctorListTracker.next(fl.slice());


    }

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
    //this.getDocsForUrl(this.currentSearch);
    // this.searchService.filterSearchResults(this.filtersApplied);

    //this.srs.doctorListTracker.next(fl.slice());


  }

  sortBy(method: string) {
    this.srs.phsyicalSortSearchResults(method);
  }



  getDocsForUrl(urlSegments: UrlSegment[]) {
    this.urlTree = this.router.parseUrl(this.router.url);
    this.urlSegmentGroup = this.urlTree.root.children[PRIMARY_OUTLET];
    this.urlSegments = this.urlSegmentGroup.segments;

    this.currentSearch = urlSegments;
    if (urlSegments.length == 1) {
      this.speciality = '0';
      this.alphabet = '0';
      this.currentPage = 1;
      this.language = '0';

      this.heading = 'Apollo Doctors in India';

      this.breadcrumbs = [
        { name: 'India', url: '/india' },
      ];

      let breadcrumbsSchema = [
        { name: 'Home', url: '/' },
        { name: 'India', url: '/india' },
      ];

      this.cs.languageBreadsrcumsschema(breadcrumbsSchema, 2, this._renderer2);

      this.getApolloDoctors();
    }
    if (urlSegments.length == 2) {
      // If type.length == 1 the search from alphabet
      let type = urlSegments[1].toString()
      if (type.length == 1) {
        this.speciality = '0';
        this.alphabet = urlSegments[1].toString();
        this.currentPage = 1;
        this.language = '0';

      }
      else {
        this.speciality = urlSegments[1].toString();
        this.alphabet = '0';
        this.currentPage = 1;
        this.language = '0';
        this.heading = this.getFirstLetterCapital(this.us.deSanitizeURLParam(this.speciality)) + "'s in India";
      }
      this.getApolloDoctors();
    }
    if (urlSegments.length == 3) {
      let type = urlSegments[1] != null ? urlSegments[1].toString() : 'language';
      if (type == 'language') {
        this.speciality = '0';
        this.alphabet = '0';
        this.currentPage = 1;
        this.language = urlSegments[2] != null ? urlSegments[2].toString() : 'english';
        this.getApolloDoctors();

        this.heading = this.getFirstLetterCapital(this.language) + '  Speaking Doctors in India';
        this.breadcrumbs = [
          { name: 'India', url: '/india' },
          { name: this.us.deSanitizeURLParam(this.language), url: '/india/lanugage/' + this.language }
        ];

        let breadcrumbsSchema = [
          { name: 'Home', url: '/' },
          { name: 'India', url: '/india' },
          { name: 'Language', url: '/india/lanugage/' + this.language }
        ];

        this.cs.languageBreadsrcumsschema(breadcrumbsSchema, 3, this._renderer2);
      }
    }
  }
  /*
  *  Get all doctors list
  */
  getApolloDoctors() {
    // When call to this function, scroll to the top of the page
    document.getElementById('mh').scrollIntoView();

    this.aaa.loadingShow('loadingid');
    this.srs.getApolloDoctors(this.speciality, this.language, this.alphabet, this.currentPage)
      .subscribe(
        (data: doctorNew) => {
          this.aaa.loadingHide('loadingid');
          this.doctorsNew = data;
          this.srs.gotDocsList(this.doctorsNew['objAPIRDoctorSearchPageModelBO']);

          this.cs.setPageTitle(this.doctorsNew.objAPITitleandDescriptionBO.PageTitle);
          this.cs.setPageDescription(this.doctorsNew.objAPITitleandDescriptionBO.PageDescription);


          this.message = this.doctorsNew.objAPITitleandDescriptionBO.PageContent;

          this.availableAlphabets = this.doctorsNew.AvailableAlphabets;
          this.maxPaginationLength = this.doctorsNew.MaxPaginationLength;

          this.getPageSchema();
          this.cs.setCanonicallink(window.location.href);

          this.setOGGraph();
          this.setTwitterCard();
          this.totalDoctors = this.doctorsNew.TotalRecords;
        }, (err) => {
          this.aaa.loadingHide('loadingid');
          this.errLog.log('apollo-doctors.component.ts', 'getAllDoctors()', err);
        }
      );

    // Most searched localities
    this.srs.getSidebarLinks4DoctorSearchCity(this.currentCity);
  }

  getPage(page: number) {
    this.currentPage = page;
    this.getApolloDoctors();
  }

  setAlphabet(alp, index: number) {
    // In active and active alphabet
    this.selectedIndex = index;
    this.allIndex = null;
    this.alphabet = alp.toLowerCase();
    this.getApolloDoctors();
  }
  getAll() {
    // In active and active alphabet
    this.selectedIndex = null;
    this.allIndex = 1;

    this.getUrlSegments();
  }

  getUrlSegments() {
    let urlTree: UrlTree;
    let urlSegmentGroup: UrlSegmentGroup;
    let urlSegments: UrlSegment[] = [];
    this.route.url.subscribe(
      () => {
        urlTree = this.router.parseUrl(this.router.url);
        urlSegmentGroup = urlTree.root.children[PRIMARY_OUTLET];
        if (urlSegmentGroup.segments && urlSegmentGroup.segments.length > 0)
          urlSegments = urlSegmentGroup.segments;
        this.urlLength = urlSegments.length;
        this.gettingDataFromServer = true;

        this.getDocsForUrl(urlSegments);
      }
    );
  }
  getPageSchema() {
    var text = '{ "@context":"http://schema.org/" , "@type":"WebSite","name":"test","url":"https://www.askapollo.com/india/language/english"}'
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
  removeSpaces(keyword: string) {
    return this.us.removeSpaces(keyword);
  }

  ngOnDestroy() {
    this.docTrackerSub.unsubscribe();
    this.hosTrackerSub.unsubscribe();
  }
}

