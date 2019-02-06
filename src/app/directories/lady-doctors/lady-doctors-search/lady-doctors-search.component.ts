import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy,Renderer2,Inject } from '@angular/core';
import {
  Router, Params, UrlTree, UrlSegmentGroup, NavigationEnd,
  UrlSegment, PRIMARY_OUTLET, ActivatedRoute
} from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { CommonService } from '@aa/services/common.service';
import { UtilsService } from '@aa/services/utils.service';
import { SearchService, boilerContent } from '@aa/services/search.service';
import { hospital } from '@aa/structures/hospital.interface';
import { doctor,doctorNew } from '@aa/structures/doctor.interface';
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
  selector: 'app-lady-doctors-search',
  templateUrl: './lady-doctors-search.component.html',
  styleUrls: ['./lady-doctors-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LadyDoctorsSearchComponent implements OnInit, OnDestroy, AfterViewInit {

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
  speciality:string;
  language:string;
  hospital:string;
  hyperlocal:string;

  message: any = '';
  pageHeading: string = '';
  
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

  ngOnInit() 
  {
    this.aaa.loadingShow('loadingid');
    this.aaa.SHOW_SKIP = true;
    this.us.setActiveTab(this.us.TAB_PHYSICAL_APPOINTMENT);
    this.cs.setPageTitle("Book your doctor appointment today - Ask Apollo");
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

        this.currentCity = urlSegments[0] != null ? urlSegments[0].toString() : 'hyderabad';

        this.getDocsForUrl(urlSegments);
      }
    );

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


  

  getDocsForUrl(urlSegments: UrlSegment[]) 
  {
    this.currentSearch = urlSegments;
    if(urlSegments.length == 2)
    {
        this.speciality = '0';
        this.hospital = '0';
        this.currentPage = 1;
        this.hyperlocal = '0';
    }
    if(urlSegments.length == 3)
    {
        this.speciality = urlSegments[2] != null ? urlSegments[2].toString() : '';
        this.hospital = '0';
        this.currentPage = 1;
        this.hyperlocal = '0';
    }
    if(urlSegments.length == 4) // hospital
    {
        this.speciality = urlSegments[2] != null ? urlSegments[2].toString() : '';
        this.hospital = urlSegments[3] != null ? urlSegments[3].toString() : '';
        this.currentPage = 1;
        this.hyperlocal = '0';
    }
    if(urlSegments.length == 5) // hyperlocal
    {
        this.speciality = urlSegments[2] != null ? urlSegments[2].toString() : '';
        this.hospital = '0';
        this.currentPage = 1;
        this.hyperlocal = urlSegments[4] != null ? urlSegments[4].toString() : '';
    }
    this.getLadyDoctors();
  }
  /*
  *  Get all doctors list
  */
  getLadyDoctors()
  {
    // When call to this function, scroll to the top of the page
    document.getElementById('mh').scrollIntoView();

  	this.aaa.loadingShow('loadingid');
    this.srs.getLadyDoctors(this.currentCity,this.speciality,this.hospital,this.hyperlocal,this.currentPage)
        .subscribe(
          (data:doctorNew) => {
            this.aaa.loadingHide('loadingid');

            this.doctorsNew = data;
            this.srs.gotDocsList(this.doctorsNew['objAPIRDoctorSearchPageModelBO']);

            this.cs.setPageTitle(this.doctorsNew.objAPITitleandDescriptionBO.PageTitle);
            this.cs.setPageDescription(this.doctorsNew.objAPITitleandDescriptionBO.PageDescription);
            this.message = this.doctorsNew.objAPITitleandDescriptionBO.PageContent;

            this.maxPaginationLength = this.doctorsNew.MaxPaginationLength;
            this.totalDoctors = this.doctorsNew.TotalRecords;

            this.setScheme();
           },(err)=>{
            this.aaa.loadingHide('loadingid');
            this.errLog.log('lady-doctors-search.component.ts','getLadyDoctors()',err);
        }
    );

    // Most searched localities
    this.srs.getSidebarLinks4DoctorSearchCity(this.currentCity);
  }

  getPage(page: number) 
  {
    this.currentPage = page;
    this.getLadyDoctors();
  }

  getPageSchema()
  {
      var text = '{ "@context":"http://schema.org/" , "@type":"WebSite","name":"test","url":"https://www.askapollo.com/"}'
      var obj = JSON.parse(text);
      obj.name =  this.doctorsNew.objAPITitleandDescriptionBO.PageTitle;     
      obj.url = this.cs.getPresentUrl();

      this.cs.doctorInfoschema(obj,this._renderer2);
  }

  setOGGraph()
  {
      this.meta.addTag({ name: 'og:title', content: this.doctorsNew.objAPITitleandDescriptionBO.PageTitle });
      this.meta.addTag({ name: 'og:site_name', content: 'Ask Apollo' });
      this.meta.addTag({ name: 'og:url', content: this.cs.getPresentUrl() });
      this.meta.addTag({ name: 'og:description', content: this.doctorsNew.objAPITitleandDescriptionBO.PageDescription });
      this.meta.addTag({ name: 'og:type', content: 'website' });
      this.meta.addTag({ name: 'og:image', content: this.cs.getDomain()+'/assets/askapollo-logo.png' });
  }
  setTwitterCard()
  {
      this.meta.addTag({ name: 'twitter:card', content: 'Summary' });
      this.meta.addTag({ name: 'twitter:site', content: '@HospitalsApollo' });
      this.meta.addTag({ name: 'twitter:title', content: this.doctorsNew.objAPITitleandDescriptionBO.PageTitle });
      this.meta.addTag({ name: 'twitter:description', content: this.doctorsNew.objAPITitleandDescriptionBO.PageDescription });
  }
  /*
  *    Get the first letter capital
  */
  getFirstLetterCapital(str)
  {
      return str.charAt(0).toUpperCase() + str.slice(1);
  }

  setScheme()
  {
    this.getPageSchema();
    this.cs.setCanonicallink(window.location.href);
    this.setOGGraph();
    this.setTwitterCard();
    if(this.currentSearch.length == 2)
    {
      this.pageHeading = 'Top Lady Doctors in '+this.us.deSanitizeURLParam(this.currentCity);

      this.breadcrumbs = [
        { name: this.us.deSanitizeURLParam(this.currentCity), url: '/'+this.currentCity },
        { name: 'Lady Doctors', url: '/'+this.currentCity+'/'+'ladydoctors' }
        ];
        
      let breadcrumbsSchema = [
          { name: 'Home', url: '/' },
          { name: this.currentCity, url: '/'+this.currentCity }
      ];

      this.cs.languageBreadsrcumsschema(breadcrumbsSchema,2,this._renderer2);
      // Most searched localities 
      this.srs.getSidebarLinks4DoctorSearchCity(this.currentCity);
    }
    if(this.currentSearch.length == 3)
    {
      this.pageHeading = 'Female '+this.us.deSanitizeURLParam(this.speciality)+ ' in '+this.us.deSanitizeURLParam(this.currentCity)

      this.breadcrumbs = [
        { name: this.us.deSanitizeURLParam(this.currentCity), url: '/'+this.currentCity },
        { name: 'Lady Doctors', url: '/'+this.currentCity+'/'+'ladydoctors' },
        { name: this.speciality, url: '/'+this.currentCity+'/'+'ladydoctors/'+this.speciality }
        ];
        
      let breadcrumbsSchema = [
          { name: 'Home', url: '/' },
          { name: this.currentCity, url: '/'+this.currentCity },
          { name: 'Lady Doctors', url: '/'+this.currentCity+'/ladydoctors' },
          { name: this.speciality, url: '/'+this.currentCity+'/ladydoctors/'+this.speciality }
      ];

      this.cs.languageBreadsrcumsschema(breadcrumbsSchema,4,this._renderer2);
      // Most searched localities 
      this.srs.getSidebarLinks4DoctorSearchCity(this.currentCity);
    }
    if(this.currentSearch.length == 4) // Hospital
    {
      this.pageHeading = 'Lady '+this.us.deSanitizeURLParam(this.speciality)+ ' in '+this.us.deSanitizeURLParam(this.hospital)

      this.breadcrumbs = [
        { name: this.us.deSanitizeURLParam(this.currentCity), url: '/'+this.currentCity },
        { name: 'Lady Doctors', url: '/'+this.currentCity+'/'+'ladydoctors' },
        { name: this.speciality, url: '/'+this.currentCity+'/'+'ladydoctors/'+this.speciality },
        { name: this.hospital, url: '/'+this.currentCity+'/'+'ladydoctors/'+this.speciality+'/'+this.hospital }
        ];
        
      let breadcrumbsSchema = [
          { name: 'Home', url: '/' },
          { name: this.currentCity, url: '/'+this.currentCity },
          { name: 'Lady Doctors', url: '/'+this.currentCity+'/ladydoctors' },
          { name: this.speciality, url: '/'+this.currentCity+'/ladydoctors/'+this.speciality },
          { name: this.hospital, url: '/'+this.currentCity+'/ladydoctors/'+this.speciality+'/'+this.hospital }
      ];

      this.cs.languageBreadsrcumsschema(breadcrumbsSchema,5,this._renderer2);
      // Most searched localities 
      this.srs.getSidebarLinks4DoctorSearchCity(this.currentCity);
    }
    if(this.currentSearch.length == 5) // Hyperlocal
    {
      this.pageHeading = 'Lady '+this.us.deSanitizeURLParam(this.speciality)+ ' in '+this.us.deSanitizeURLParam(this.hyperlocal)+', '+this.us.deSanitizeURLParam(this.currentCity);

      this.breadcrumbs = [
        { name: this.us.deSanitizeURLParam(this.currentCity), url: '/'+this.currentCity },
        { name: 'Lady Doctors', url: '/'+this.currentCity+'/'+'ladydoctors' },
        { name: this.speciality, url: '/'+this.currentCity+'/'+'ladydoctors/'+this.speciality },
        { name: this.hyperlocal, url: '/'+this.currentCity+'/'+'ladydoctors/'+this.speciality+'/hyperlocal/'+this.hyperlocal }
        ];
        
      let breadcrumbsSchema = [
          { name: 'Home', url: '/' },
          { name: this.currentCity, url: '/'+this.currentCity },
          { name: 'Lady Doctors', url: '/'+this.currentCity+'/ladydoctors' },
          { name: this.speciality, url: '/'+this.currentCity+'/ladydoctors/'+this.speciality },
          { name: this.hyperlocal, url: '/'+this.currentCity+'/ladydoctors/'+this.speciality+'/hyperlocal/'+this.hyperlocal }
      ];

      this.cs.languageBreadsrcumsschema(breadcrumbsSchema,5,this._renderer2);
      // Most searched localities 
      this.srs.getSidebarLinks4DoctorSearchCity(this.currentCity);
    }
  }

  
 
  sanitization(val)
  {
    return this.us.sanitizeURLParam(val);
  }

  ngOnDestroy() 
  {
    this.docTrackerSub.unsubscribe();
    this.hosTrackerSub.unsubscribe();
  }
}

