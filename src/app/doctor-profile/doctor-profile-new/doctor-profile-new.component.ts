import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy,Renderer2,Inject } from '@angular/core';
import {
  ActivatedRoute, Router, UrlTree, NavigationEnd,
  UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET
} from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { TabsetComponent } from 'ngx-bootstrap';

import { UtilsService } from '@aa/services/utils.service';
import { CommonService } from '@aa/services/common.service';
import { SearchService } from '@aa/services/search.service';

import { docDetail, docDetailSummary, docDetailInfo, docDetailHealthFeed,doctorProfileSchema,breadcrumbsDocProfileSchema,itemListElement } from '@aa/structures/doctor.interface';
import { city, trend } from '@aa/structures/city.interface';
import { ErrlogService } from '@aa/services/errlog.service';
import { Meta } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-doctor-profile-new',
  templateUrl: './doctor-profile-new.component.html',
  styleUrls: ['./doctor-profile-new.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DoctorProfileNewComponent implements OnInit, OnDestroy, AfterViewInit {

  gettingDataFromServer: boolean;

  doc: docDetail = {} as docDetail;  
  docSummary: docDetailSummary = {} as docDetailSummary;
  doctorProfileSchema: doctorProfileSchema = {} as doctorProfileSchema;
  docInfoTab: docDetailInfo = {} as docDetailInfo;
  docHealthFeedTab: docDetailHealthFeed = {} as docDetailHealthFeed;
  docDetailSub: Subscription;
  urlTree: UrlTree;
  urlSegmentGroup: UrlSegmentGroup;
  urlSegments: UrlSegment[];
  workExp: any = '';
  private jsonld: any;
  public jsonLDString: any;;
  getCityTrackerSub: Subscription;
  currentCity = '';
  trends: trend[]; 
  citiesTrackerSub: Subscription;
  cities: city[] = [];

  cityFromUrl:string;
  specialityFromUrl:string;
  docNameFromUrl:string;
  seoSchemaForDoctorProfile: any;
  tempData: any;
  servicesList: string = '';

  constructor(
    private us: UtilsService,
    private cs: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private _renderer2: Renderer2,
    private meta: Meta,
    private sanitizer: DomSanitizer) { }



  ngOnInit() {

    this.us.setActiveTab(this.us.TAB_PHYSICAL_APPOINTMENT);
    this.bindText();

    // When starting a new search from within the Doctor Search Page, Angular doesn't reload the Doctor-Search component
    // It simply refreshses the URL. So, we need to subscribe to the URL and act on it.
    this.route.url.subscribe(
      () => {
        this.urlTree = this.router.parseUrl(this.router.url);
        this.urlSegmentGroup = this.urlTree.root.children[PRIMARY_OUTLET];
        this.urlSegments = this.urlSegmentGroup.segments;        
        // When () is come in url then change the flow
        if(this.router.url.indexOf('(') != -1)
        {
          var arr = this.router.url.split ("/");
          this.cityFromUrl = arr[1];
          this.specialityFromUrl = arr[2];
          this.docNameFromUrl = arr[3];

          /*
            0:"",
            1:"hyderabad",
            2:"cardiologist"
            3:"dr-(col)-m-sitaram"
          */
          // 404 redirection if doctor name contains '.
          if(this.docNameFromUrl.includes("."))
          {
            this.router.navigate(['/404']);
          }
          
          this.gettingDataFromServer = true;
          this.searchService.getDocProfile(arr[1],arr[2],arr[3]); // city, speciality,doctor name
          //this.cs.doctorInfoschema(this.cityFromUrl,this.specialityFromUrl,this.docNameFromUrl,this._renderer2);          
        }
        else
        {    

          this.cityFromUrl = this.urlSegments[0].toString();
          this.specialityFromUrl = this.urlSegments[1].toString();
          this.docNameFromUrl = this.urlSegments[2].toString();

          // 404 redirection if doctor name contains '.
          if(this.docNameFromUrl.includes("."))
          {
            this.router.navigate(['/404']);
          }

          this.gettingDataFromServer = true;
          this.searchService.getDocProfile(
            this.urlSegments[0].toString(),
            this.urlSegments[1].toString(),
            this.urlSegments[2].toString());
          //this.cs.doctorInfoschema(this.urlSegments[1],this.urlSegments[2],this.urlSegments[3],this._renderer2);          
        }
      }
    );

    this.docDetailSub = this.searchService.docDetailTracker.subscribe(
      (dd: docDetail) => {       
        //debugger;
        this.doc = dd;
        
        // 404 redirection if doctor id == 0 or null
        if(this.doc.DoctorId == 0 || this.doc.DoctorId == null)
        {
          this.router.navigate(['/404']);
        }

        this.docInfoTab = this.doc.DoctorInfotabList[0];
        if(this.docInfoTab.ServicesList && this.docInfoTab.ServicesList.length > 0)
        {
          let servicesLength = this.docInfoTab.ServicesList.length;
          for(let i=0;i<servicesLength;i++)
          {
            this.servicesList += this.docInfoTab.ServicesList[i].serviceName;
            if(this.docInfoTab.ServicesList[i+1])
            {
              this.servicesList += ', ';
            }
          }  
        }


        
        this.docHealthFeedTab = this.doc.DoctorHealthFeedtabList[0];
        this.docSummary = {
          docId: this.doc.DoctorId,
          docName: this.doc.DoctorName,
          docPhotoURL: this.doc.CompletePhotoURL,
          docCity: this.cityFromUrl,
          docSpeciality: this.doc.MultiSpeciltyKeyword,
          docQualification: this.doc.Qualification,
          //notInterestedIneDoc: this.doc.notInterestedIneDoc,
          notInterestedIneDoc: 0,
          IsInterestedInEdoc:this.doc.IsInterestedInEdoc,
          specialityId: this.doc.MultiSpecialtyId
        };
        this.cs.setPageTitle(dd.DoctorPageTitleandDescription.PageTitle);
        this.cs.setPageDescription(dd.DoctorPageTitleandDescription.PageDescription);        
        this.cs.breadsrcumsschema(this.urlSegments,this.urlSegments.length-1,this._renderer2);
        this.setScheme();

        this.tempData = this.doc;
        this.seoSchemaForDoctorProfile = this.tempData.objSEOSchemaonDoctorProfile;

        this.seoSchemaForDoctorProfile.url = location.protocol + "//" + location.host + '/' + this.seoSchemaForDoctorProfile.url;


        let breadcrumbsSchema = [
            { name: 'Home', url: '/' },
            { name: this.us.sanitizeURLParam(this.currentCity), url: '/'+this.us.deSanitizeURLParam(this.currentCity) },
            { name: this.us.sanitizeURLParam(this.doc.MultiSpeciltyKeyword), url: '/'+this.us.deSanitizeURLParam((this.doc.MultiSpeciltyKeyword)) },
            { name: this.us.sanitizeURLParam(this.doc.DoctorName), url: '/'+this.us.deSanitizeURLParam(this.doc.DoctorName) }
        ];

        this.cs.languageBreadsrcumsschema(breadcrumbsSchema,4,this._renderer2);

      }
    );

    // When coming into this page, scroll to the top of the page
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        document.getElementById('mh').scrollIntoView();
      }
    });

    // most searched localities -- start
    //this.currentCity = this.searchService.getSelectedCity().name.toLowerCase();
    this.currentCity = this.cityFromUrl;
    
      this.getCityTrackerSub = this.searchService.selectedCityTracker.subscribe(
        (c: city) => {
          this.currentCity = c.name.toLowerCase(); 
          this.searchService.getSidebarLinks4DoctorSearchCity(this.currentCity.toString()); 
        }
      )
      this.searchService.trendsTracker.subscribe(
        (trends: trend[]) => {
          this.trends = trends;
        }
      );
      if(this.currentCity)
      {
        this.searchService.getSidebarLinks4DoctorSearchCity(this.currentCity.toString()); 
      }
      else
      {
        //Subscribe to 'Get All Cities'
         //this.searchService.getAllCities();
        // Subscribe to 'Get All Cities'
        this.citiesTrackerSub = this.searchService.citiesTracker.subscribe(
          (cities: city[]) => {
            this.cities = cities;
            this.cs.saveCitiesList(this.cities);
            this.cities=this.cities.slice(0,5);
          }
        );
      }
      // most searched localities -- end

  }

  ngOnDestroy() {
    this.docDetailSub.unsubscribe();
    this.getCityTrackerSub.unsubscribe();
  }

  ngAfterViewInit() {
    document.getElementById('mh').scrollIntoView();
  }

  @ViewChild('staticTabs') staticTabs: TabsetComponent;

  selectTab(tab_id: number) {
    this.staticTabs.tabs[tab_id].active = true;
  }
  replaceLinks(text: any) {
    return this.us.sanitizeURLParam(text);
  }

  message: any = '';
  bindText() {
    this.searchService.getdsExtraData().subscribe(data => {
      this.message = data;
    })
  }  

    pn = '';
  sendAppLink() {
    if (this.pn.length != 10) alert('Please enter a valid 10 digit number: ' + this.pn);
    else this.cs.sendAppLinkToMobile(this.pn);
  }
  sendAppLinkEnter()
  {
    this.sendAppLink();
  }
  sanitization(val)
  {
  	return this.us.sanitizeURLParam(val);
  }

  setScheme()
  {
    this.getPageSchema();
    this.cs.setCanonicallink(window.location.href);
    this.setOGGraph();
    this.setTwitterCard();
  }
  getPageSchema()
  {
      var text = '{ "@context":"http://schema.org/" , "@type":"WebSite","name":"test","url":"https://www.askapollo.com/"}'
      var obj = JSON.parse(text);
      obj.name =  this.doc.DoctorPageTitleandDescription.PageTitle;     
      obj.url = this.cs.getPresentUrl();

      this.cs.doctorInfoschema(obj,this._renderer2);
  }
  setOGGraph()
  {
      this.meta.addTag({ name: 'og:title', content: this.doc.DoctorPageTitleandDescription.PageTitle });
      this.meta.addTag({ name: 'og:site_name', content: 'Ask Apollo' });
      this.meta.addTag({ name: 'og:url', content: this.cs.getPresentUrl() });
      this.meta.addTag({ name: 'og:description', content: this.doc.DoctorPageTitleandDescription.PageDescription });
      this.meta.addTag({ name: 'og:type', content: 'website' });
      this.meta.addTag({ name: 'og:image', content: this.cs.getDomain()+'/assets/askapollo-logo.png' });
  }
  setTwitterCard()
  {
      this.meta.addTag({ name: 'twitter:card', content: 'Summary' });
      this.meta.addTag({ name: 'twitter:site', content: '@HospitalsApollo' });
      this.meta.addTag({ name: 'twitter:title', content: this.doc.DoctorPageTitleandDescription.PageTitle });
      this.meta.addTag({ name: 'twitter:description', content: this.doc.DoctorPageTitleandDescription.PageDescription });
  }
  /*
  *    Get the first letter capital
  */
  getFirstLetterCapital(str)
  {
      return str.charAt(0).toUpperCase() + str.slice(1);
  }
  removeSpaces(keyword: string) 
  {
    return this.us.removeSpaces(keyword);
  }
  error(event)
  {
    if(this.docInfoTab && this.docInfoTab.GenderInteger)
      event.target.src = this.cs.noImage(this.docInfoTab.GenderInteger);
    else
      event.target.src = this.cs.noImage(1);
    /*setTimeout(()=>{
      event.target.src = this.cs.noImage(this.docInfoTab.GenderInteger)
   }, 3000);*/
  }
  getVideoURL(videoUrl)
  {
    return this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
  }
}

