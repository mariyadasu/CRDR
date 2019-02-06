import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy,Renderer2 } from '@angular/core';
import { Router, ActivatedRoute, UrlTree, Params, NavigationEnd, UrlSegment, UrlSegmentGroup, PRIMARY_OUTLET } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { SearchService, boilerContent } from '@aa/services/search.service';
import { hospital } from '@aa/structures/hospital.interface';
import { doctor, doctorNew } from '@aa/structures/doctor.interface';
import { city, trend } from '@aa/structures/city.interface';
import { CommonService } from '@aa/services/common.service';
import { StoreService } from '@aa/services/store.service';
import { ErrlogService } from '@aa/services/errlog.service';
import { UtilsService } from '@aa/services/utils.service';
import { AAAuthService } from '@aa/services/auth.service';
import { Meta } from '@angular/platform-browser';

// interface for breadcrumbs
export interface bc {
  name: string,
  url: string
}

@Component({
  selector: 'app-doctor-disease-treatment',
  templateUrl: './doctor-disease-treatment.component.html',
  styleUrls: ['./doctor-disease-treatment.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DoctorDiseaseTreatmentComponent implements OnInit, OnDestroy, AfterViewInit {

  gettingDataFromServer = true;

  selectHospitalString = 'Select Hospital';
  hospitals: hospital[] = [];

  doctors: doctor[] = [];
  currentPage = 1;
  itemsPerPage = 15;
  totalDoctors: number;
  status: number;
  getCityTrackerSub: Subscription;
  docTrackerSub = new Subscription;
  hosTrackerSub = new Subscription;
  trends: trend[];
  serviceName: string;
  currentCity: string;
  name:string;
  message: any = '';
  urlLength: number;
  currentSearch: UrlSegment[];

  serviceTypeId: number;
  hyperlocal: string;
  doctorsNew: doctorNew;
  maxPaginationLength: number;
  currentCityForLocality:string;
  pageHeading: string = '';

  breadcrumbs: bc[] = [];
  
  constructor(
    private cs: CommonService,
    private srs: SearchService,
    private route: ActivatedRoute,
    private router: Router,
    private _renderer2: Renderer2,
    private ss: StoreService,
    private errLog: ErrlogService,
    public aaa: AAAuthService,
    private us: UtilsService,
    private meta: Meta) { }


  ngOnInit() 
  {
    //this.spinnerService.show();
    this.aaa.SHOW_SKIP = true;
    this.us.setActiveTab(this.us.TAB_PHYSICAL_APPOINTMENT);
    this.cs.setPageTitle("Book your doctor appointment today - Ask Apollo");

    this.getUrlSegments();

    this.docTrackerSub = this.srs.doctorListTracker.subscribe(
      (docs: doctor[]) => {
        
        this.gettingDataFromServer = false;
        this.doctors = docs;
       // this.spinnerService.hide();
      }
    )










    /*let urlTree: UrlTree;
    let urlSegmentGroup: UrlSegmentGroup;
    let urlSegments: UrlSegment[]; 
    this.status = this.route.snapshot.url[0].path == 'treatments' ? 1 : 2;
    this.name = this.route.snapshot.url[1].path; 
    this.serviceName = this.route.snapshot.paramMap.get('servicename');
    this.spinnerService.show();
    this.srs.getAllApolloDoctorsDiseasesAndTreatments(this.status,
      this.serviceName);
    this.docTrackerSub = this.srs.doctorListTracker.subscribe(
      (docs: doctor[]) => {
        this.spinnerService.hide();
        this.gettingDataFromServer = false;
        this.doctors = docs;
       
      }
    );*/

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
  }

  getUrlSegments()
  {
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

  getDocsForUrl(urlSegments: UrlSegment[]) 
  {
    this.currentSearch = urlSegments;
    // diseases/atrial-flutter
    if (urlSegments.length == 2)
    {
      let type = urlSegments[0].toString();
      if(type == 'diseases')
      {
        this.serviceTypeId = 2;
      }
      if(type == 'treatments')
      {
        this.serviceTypeId = 1;
      }
      this.currentCity = '0';
  
      
      this.serviceName = this.sanitization(urlSegments[1].toString());
      this.hyperlocal = '0';
      this.currentPage = 1;
      this.getDoctorsForDiseasesAndTreatments();

      
      var data = this.ss.getToken(this.ss.TOKEN_CITY);
      this.currentCityForLocality = data.name;
      this.srs.getSidebarLinks4DoctorSearchCity(this.currentCityForLocality);
    }
    if (urlSegments.length == 3)
    {
      let type = urlSegments[1].toString();
      if(type == 'diseases')
      {
        this.serviceTypeId = 2;
      }
      if(type == 'treatments')
      {
        this.serviceTypeId = 1;
      }
      this.currentCity = '0';
      this.currentCity = this.sanitization(urlSegments[0].toString());
      
      this.serviceName = this.sanitization(urlSegments[2].toString());
      this.hyperlocal = '0';
      this.currentPage = 1;
      this.getDoctorsForDiseasesAndTreatments();
      
      this.currentCityForLocality = this.currentCity;

      this.srs.getSidebarLinks4DoctorSearchCity(this.currentCityForLocality);
      
    }
    if (urlSegments.length == 4)
    {
      let type = urlSegments[1].toString();
      if(type == 'diseases')
      {
        this.serviceTypeId = 2;
      }
      if(type == 'treatments')
      {
        this.serviceTypeId = 1;
      }
      this.currentCity = this.sanitization(urlSegments[0].toString());
      
      this.serviceName = this.sanitization(urlSegments[2].toString());
      this.hyperlocal = this.sanitization(urlSegments[3].toString());;
      this.currentPage = 1;
      this.getDoctorsForDiseasesAndTreatments();
      
      this.currentCityForLocality = this.currentCity;
      
      this.srs.getSidebarLinks4DoctorSearchCity(this.currentCityForLocality);
    
    }
  }

  /*
  *  Get all doctors list
  */
  getDoctorsForDiseasesAndTreatments()
  {
    this.aaa.loadingShow('loadingid');
    this.srs.getDoctorsForDiseasesAndTreatments(this.serviceTypeId,this.serviceName,this.currentCity,this.hyperlocal,this.currentPage)
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
            this.errLog.log('doctor-disease-treatment/doctor-diseases-treatment.component.ts','getDoctorsForDiseasesAndTreatments()',err);
        }
    );
 }
  getPage(page: number) 
  {
    this.currentPage = page;
    this.getDoctorsForDiseasesAndTreatments();
  }

  ngOnDestroy() 
  {
    this.docTrackerSub.unsubscribe();
    this.hosTrackerSub.unsubscribe();
  }

  

  ngAfterViewInit() 
  {
    document.getElementById('mh').scrollIntoView();
  }

  pn = '';
  sendAppLink() {
    if (this.pn.length != 10) alert('Please enter a valid 10 digit number: ' + this.pn);
    else this.cs.sendAppLinkToMobile(this.pn);
  }

  
  getUrlWithSpecialityCharacters(keyword: string) 
  {
    keyword = keyword.split(' ').join('-');
    keyword = keyword.split('&').join('and');
    return keyword.toLowerCase();
  }
  sendAppLinkEnter()
  {
    this.sendAppLink();
  }
  sanitization(val)
  {
    return this.us.sanitizeURLParam(val);
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

    let type = this.currentSearch[1].toString();
    
    /*if(this.currentSearch.length == 2)
    {
      this.pageHeading = 'Top Lady Doctors in '+this.getFirstLetterCapital(this.currentCity)

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
    */
    if(this.currentSearch.length == 3)
    {
      if(type == 'treatments')
      {
        this.pageHeading = this.getFirstLetterCapital(this.us.deSanitizeURLParam(this.serviceName))+ ' in '+this.getFirstLetterCapital(this.currentCity);

        this.breadcrumbs = [
          { name: this.us.deSanitizeURLParam(this.currentCity), url: '/'+this.currentCity },
          { name: 'Treatments', url: '/'+this.currentCity+'/treatments'},
          { name: this.us.deSanitizeURLParam(this.serviceName), url: '/'+this.currentCity+'/treatments/'+this.us.sanitizeURLParam(this.serviceName)}
          ];
          
        let breadcrumbsSchema = [
            { name: 'Home', url: '/' },
            { name: this.us.deSanitizeURLParam(this.currentCity), url: '/'+this.currentCity },
            { name: 'Treatments', url: '/'+this.currentCity+'/treatments' },
            { name: this.us.deSanitizeURLParam(this.serviceName), url: '/'+this.currentCity+'/treatments/'+this.us.sanitizeURLParam(this.serviceName)}
        ];

        this.cs.languageBreadsrcumsschema(breadcrumbsSchema,4,this._renderer2);
        this.srs.getSidebarLinks4DoctorSearchCity(this.currentCity);
      }
      if(type == 'diseases')
      {
        this.pageHeading = this.getFirstLetterCapital(this.us.deSanitizeURLParam(this.serviceName))+ ' in '+this.getFirstLetterCapital(this.currentCity);

        this.breadcrumbs = [
          { name: this.us.deSanitizeURLParam(this.currentCity), url: '/'+this.currentCity },
          { name: 'Diseases', url: '/'+this.currentCity+'/diseases'},
          { name: this.us.deSanitizeURLParam(this.serviceName), url: '/'+this.currentCity+'/diseases/'+this.us.sanitizeURLParam(this.serviceName)}
          ];
          
        let breadcrumbsSchema = [
            { name: 'Home', url: '/' },
            { name: this.us.deSanitizeURLParam(this.currentCity), url: '/'+this.currentCity },
            { name: 'Diseases', url: '/'+this.currentCity+'/diseases' },
            { name: this.us.deSanitizeURLParam(this.serviceName), url: '/'+this.currentCity+'/diseases/'+this.us.sanitizeURLParam(this.serviceName)}
        ];

        this.cs.languageBreadsrcumsschema(breadcrumbsSchema,4,this._renderer2);
        this.srs.getSidebarLinks4DoctorSearchCity(this.currentCity);
      }
    }
    
    if(this.currentSearch.length == 4)
    {
      if(type == 'treatments')
      {
        this.pageHeading = this.getFirstLetterCapital(this.us.deSanitizeURLParam(this.serviceName))+ ' in '+this.getFirstLetterCapital(this.hyperlocal)+' '+this.getFirstLetterCapital(this.currentCity);

        this.breadcrumbs = [
          { name: this.us.deSanitizeURLParam(this.currentCity), url: '/'+this.currentCity },
          { name: 'Treatments', url: '/'+this.currentCity+'/treatments'},
          { name: this.us.deSanitizeURLParam(this.serviceName), url: '/'+this.currentCity+'/treatments/'+this.us.sanitizeURLParam(this.serviceName)},
          { name: this.us.deSanitizeURLParam(this.hyperlocal), url: '/'+this.currentCity+'/treatments/'+this.us.sanitizeURLParam(this.serviceName)+'/'+this.us.sanitizeURLParam(this.hyperlocal)}
          ];
          
        let breadcrumbsSchema = [
            { name: 'Home', url: '/' },
            { name: this.us.deSanitizeURLParam(this.currentCity), url: '/'+this.currentCity },
            { name: 'Treatments', url: '/'+this.currentCity+'/treatments' },
            { name: this.us.deSanitizeURLParam(this.serviceName), url: '/'+this.currentCity+'/treatments/'+this.us.sanitizeURLParam(this.serviceName)},
            { name: this.us.deSanitizeURLParam(this.hyperlocal), url: '/'+this.currentCity+'/treatments/'+this.us.sanitizeURLParam(this.serviceName)+'/'+this.us.sanitizeURLParam(this.hyperlocal)}
        ];

        this.cs.languageBreadsrcumsschema(breadcrumbsSchema,5,this._renderer2);
        this.srs.getSidebarLinks4DoctorSearchCity(this.currentCity);
      }
      if(type == 'diseases')
      {
        this.pageHeading = this.getFirstLetterCapital(this.us.deSanitizeURLParam(this.serviceName))+ ' in '+this.getFirstLetterCapital(this.hyperlocal)+' '+this.getFirstLetterCapital(this.currentCity);

        this.breadcrumbs = [
          { name: this.us.deSanitizeURLParam(this.currentCity), url: '/'+this.currentCity },
          { name: 'Diseases', url: '/specialities-diseases'},
          { name: this.us.deSanitizeURLParam(this.serviceName), url: '/'+this.currentCity+'/diseases/'+this.us.sanitizeURLParam(this.serviceName)},
          { name: this.us.deSanitizeURLParam(this.hyperlocal), url: '/'+this.currentCity+'/diseases/'+this.us.sanitizeURLParam(this.serviceName)+'/'+this.us.sanitizeURLParam(this.hyperlocal)}
          ];
          
        let breadcrumbsSchema = [
            { name: 'Home', url: '/' },
            { name: this.us.deSanitizeURLParam(this.currentCity), url: '/'+this.currentCity },
            { name: 'Diseases', url: '/specialities-diseases' },
            { name: this.us.deSanitizeURLParam(this.serviceName), url: '/'+this.currentCity+'/diseases/'+this.us.sanitizeURLParam(this.serviceName)},
            { name: this.us.deSanitizeURLParam(this.hyperlocal), url: '/'+this.currentCity+'/diseases/'+this.us.sanitizeURLParam(this.serviceName)+'/'+this.us.sanitizeURLParam(this.hyperlocal)}
        ];

        this.cs.languageBreadsrcumsschema(breadcrumbsSchema,5,this._renderer2);
        this.srs.getSidebarLinks4DoctorSearchCity(this.currentCity);
      }
    }
    /*
    if(this.currentSearch.length == 5) // Hyperlocal
    {
      this.pageHeading = 'Lady '+this.getFirstLetterCapital(this.speciality)+ ' in '+this.getFirstLetterCapital(this.hyperlocal)+', '+this.getFirstLetterCapital(this.currentCity);

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
    }*/
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
  removeSpaces(keyword: string) 
  {
    return this.us.removeSpaces(keyword);
  }
}
