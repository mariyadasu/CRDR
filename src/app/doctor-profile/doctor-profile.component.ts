import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, OnDestroy,Renderer2,Inject } from '@angular/core';
import {
  ActivatedRoute, Router, UrlTree, NavigationEnd,
  UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET
} from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { TabsetComponent } from 'ngx-bootstrap';

import { UtilsService } from '@aa/services/utils.service';
import { CommonService } from '@aa/services/common.service';
import { SearchService } from './../services/search.service';

import { docDetail, docDetailSummary, docDetailInfo, docDetailHealthFeed,doctorProfileSchema,breadcrumbsDocProfileSchema,itemListElement } from '@aa/structures/doctor.interface';
import { city, trend } from '@aa/structures/city.interface';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DoctorProfileComponent implements OnInit, OnDestroy, AfterViewInit {

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
  constructor(
    private us: UtilsService,
    private cs: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private _renderer2: Renderer2,
    private meta: Meta) { }



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
          this.cityFromUrl = arr[2];
          this.specialityFromUrl = arr[3];
          this.docNameFromUrl = arr[4];
          /*
            0:"",
            1:"doctor",
            2:"hyderabad",
            3:"cardiologist"
            4:"dr-(col)-m-sitaram"
          */
          
          this.gettingDataFromServer = true;
          this.searchService.getDocProfile(arr[2],arr[3],arr[4]); // city, speciality,doctor name
        }
        else
        {    

          this.cityFromUrl = this.urlSegments[1].toString();
          this.specialityFromUrl = this.urlSegments[2].toString();
          this.docNameFromUrl = this.urlSegments[3].toString();

          this.gettingDataFromServer = true;
          this.searchService.getDocProfile(
            this.urlSegments[1].toString(),
            this.urlSegments[2].toString(),
            this.urlSegments[3].toString());
        }
      }
    );

    this.docDetailSub = this.searchService.docDetailTracker.subscribe(
      (dd: docDetail) => {
        //debugger;
        this.doc = dd;
        this.docInfoTab = this.doc.DoctorInfotabList[0];
        this.docHealthFeedTab = this.doc.DoctorHealthFeedtabList[0];
        this.doc.objSEOSchemaonDoctorProfile.url = window.location.href;
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
        var breadsrcumsschemaarray = [this.urlSegments[0].toString(),this.urlSegments[1].toString(),this.urlSegments[2].toString(),this.doc.DoctorName,this.doc.CompletePhotoURL,'doctorprofile'];
        this.cs.breadsrcumsschema(breadsrcumsschemaarray,this.urlSegments.length,this._renderer2);
        this.cs.setOgGraph(this.doc.DoctorName,this.doc.MultiSpeciltyKeyword,window.location.href,dd.DoctorPageTitleandDescription.PageDescription,this.doc.CompletePhotoURL,'Ask Apollo');
        this.cs.settwittercard(this.doc.DoctorName,this.doc.MultiSpeciltyKeyword,dd.DoctorPageTitleandDescription.PageDescription,'@HospitalsApollo');
        this.cs.setlink(window.location.href);
        this.cs.doctorInfoschema(dd.objSEOSchemaonDoctorProfile,this._renderer2);
      }
    );

    // When coming into this page, scroll to the top of the page
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        document.getElementById('mh').scrollIntoView();
      }
    });

    // most searched localities -- start
    this.currentCity = this.searchService.getSelectedCity().name.toLowerCase();
    
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
         this.searchService.getAllCities();
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
  

}
