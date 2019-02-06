import { city } from './../structures/city.interface';
import { NgForm } from '@angular/forms';
import { Injectable, Renderer2, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UrlTree, UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';
import { breadcrumbsDocProfileSchema, itemListElement } from '@aa/structures/doctor.interface';
import { constants as c } from './../constants';
import { DOCUMENT } from '@angular/platform-browser';
import { ErrlogService } from '@aa/services/errlog.service';

import { GoogleAnalyticsService } from 'angular-ga';
//let AllCitiesJson = require('./../../assets/json/cities.json');

@Injectable()
export class CommonService {

  public DOCTOR_SEARCH_URL_STRING = "doctorsearch";
  public DOCTOR_PROFILE_URL_STRING = "doctor";
  public ONLINE_CONSULTATION_URL_STRING = "online-doctors-consultation";

  getCityTracker = new Subject<any>();
  navyaIframeTracker = new Subject<boolean>();
  getInTouchTracker = new Subject<boolean>();

  userIPAddress = '';

  cities: city[] = [];
  private jsonld: any;


  constructor(
    private httpClient: HttpClient,
    private meta: Meta,
    private title: Title,
    private router: Router,
    private errLog: ErrlogService,
    private ga: GoogleAnalyticsService,
    @Inject(DOCUMENT) private _document) { }

  setPageTitle(title: string) {
    this.title.setTitle(title);
  }

  setPageDescription(desc: string) {
    this.meta.addTag({ name: 'description', content: desc });
  }
  removeMeta() {
    this.meta.removeTag('name="description"');
  }
  updateMeta(desc: string) {
    this.meta.updateTag({ name: 'description', content: desc });
  }
  setOgGraph(docname, docspeciality, url, desc, image, site) {
    this.meta.addTags([
      { property: 'og:title', content: docname + '-' + docspeciality + '- Ask Apollo' },
      { property: 'og:site_name', content: site },
      { property: 'og:url', content: url },
      { property: 'og:description', content: desc },
      { property: 'og:type', content: 'article' },
      { property: 'og:image', content: image }
    ]);
  }
  settwittercard(docname, docspeciality, desc, site) {
    this.meta.addTags([
      { name: 'twitter:card', content: 'Summary' },
      { name: 'twitter:site', content: site },
      { property: 'twitter:title', content: docname + '-' + docspeciality + '- Ask Apollo' },
      { property: 'twitter:description', content: desc },
    ]);
  }
  setlink(url) {
    var c = document.createElement('link');
    c.rel = "canonical";
    c.href = url;
    document.head.appendChild(c);
  }
  setGA(pageTitle, pagecategory, pageaction, pagelabel) {
    this.ga.configure(c.ga_trackingid);
    this.ga.pageview.emit({ page: window.location.href, title: pageTitle });
    this.ga.event.emit({ category: pagecategory, action: pageaction, label: pagelabel });
  }
  setCanonicallink(url) {
    //debugger;
    // var linklist = document.getElementsByTagName("link");
    // let relflag: boolean;
    // for (var i = 0; i < linklist.length; i++) {

    //   var rell = linklist[i].rel;
    //   if (linklist[i].rel == 'canonical') {
    //     relflag = true;
    //     linklist[i].href = url;
    //   }
    // }
    // if (relflag != true) {
    //   var c = document.createElement('link');
    //   c.rel = "canonical";
    //   c.href = url;
    //   document.head.appendChild(c);
    // }
    var link=document.querySelectorAll("link[rel='canonical']");
    if (link != undefined && link != null) {
      link[0].setAttribute("href",url);
    }
   
  }
  getCityFromLatLong(latitude: string, longitude: string) {

    this.httpClient.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latitude + ',' + longitude + '&sensor=false').subscribe(
      (data: any) => {
        let results = data.results;

        if (data.status === 'OK') {
          if (results[1]) {
            for (var i = 0; i < results[0].address_components.length; i++) {
              for (var b = 0; b < results[0].address_components[i].types.length; b++) {
                if (results[0].address_components[i].types[b] === "locality") {
                  let city = results[0].address_components[i];
                  this.getCityTracker.next({ success: true, city: city });
                  break;
                }
              }
            }
          }
        }
      }, (err) => {
        this.errLog.log('common.service.ts', 'getCityFromLatLong()', err);
      }
    );
  }

  saveCitiesList(cities: city[]) {
    this.cities = cities;
  }

  getCityIdFromName(cityName: string) {
    if (this.cities.length == 0) return -1;
    else {
      let fc = this.cities.filter((f: city) => {
        return cityName.toLowerCase() == f.name.toLowerCase();
      });
      return fc.length > 0 ? fc[0].id : -1;
    }
  }

  loadNavya(status: boolean) {
    this.navyaIframeTracker.next(status);
  }

  navyaGetInTouch(params: any) {
    let apiEndpoint = c.Apiurl + 'SaveNavyaRequestCallInfo';
    this.httpClient.post(apiEndpoint, params).subscribe(
      (data: any) => {
        this.getInTouchTracker.next(true);
      }
    );
  }

  determineIPAddress() {
    /*this.httpClient.get<{ip:string}>('https://jsonip.com')
    .subscribe( data => {
      this.userIPAddress = data.ip;
      this.saveIP(data.ip);
    });*/
  }

  saveIP(ip: string) {
    this.userIPAddress = ip;
  }

  getIP() {
    return this.userIPAddress;
  }

  sendAppLinkToMobile(pn: string) {
    //let apiEndpoint = 'http://rest.askapollo.com:9047/RestService.svc/SendAppLinks';
    let apiEndpoint = c.OCApiUrl + 'SendAppLinks';
    let params = {
      'adminId': 'AskApollo',
      'adminPassword': 'AskApollo',
      'type': '0',
      'mobileno': pn,
      'countryCode': '91'
    }

    this.httpClient.post(apiEndpoint, params).subscribe(
      (data: any) => alert(data.Result)
    );
  }

  GetTopSpecialitiesList() {

    let apiEndpoint = c.OCApiUrl + 'GetTopSpecialitiesListForSourceApp';
    let params = {
      "AdminId": c.AdminId,
      "AdminPassword": c.AdminPassword,
      "sourceApp": "85BB5F00-5F45-464B-8965-1F0A7E331D29~web"
    }
    return this.httpClient.post(apiEndpoint, params);
  }
  GetTopDoctorsAnonymous() {

    let apiEndpoint = c.OCApiUrl + 'GetTopDoctorsAnonymousforSourceApp';
    let params = { "adminId": c.AdminId, "adminPassword": c.AdminPassword, "sourceApp": " 85BB5F00-5F45-464B-8965-1F0A7E331D29~web " }

    return this.httpClient.post(apiEndpoint, params);
  }
  GetCountries() {

    let apiEndpoint = c.OCApiUrl + 'GetCountriesforSourceApp';
    let params = {
      "AdminId": c.AdminId, "AdminPassword": c.AdminPassword,
      "sourceApp": "85BB5F00-5F45-464B-8965-1F0A7E331D29~web"
    }

    return this.httpClient.post(apiEndpoint, params);
  }
  GetStatesByCountry(countryid: any) {

    let apiEndpoint = c.OCApiUrl + 'GetStatesByCountryforSourceApp';

    let params = {
      "AdminId": c.AdminId, "AdminPassword": c.AdminPassword,
      "CountryCode": countryid, "sourceApp": "85BB5F00-5F45-464B-8965-1F0A7E331D29~web"
    }

    return this.httpClient.post(apiEndpoint, params);
  }
  GetCitiesByState(stateid: any) {

    let apiEndpoint = c.OCApiUrl + 'GetCitiesByStateforSourceApp';
    let params = {
      "AdminId": c.AdminId, "AdminPassword": c.AdminPassword,
      "StateCode": stateid, "sourceApp": "85BB5F00-5F45-464B-8965-1F0A7E331D29~web"
    }

    return this.httpClient.post(apiEndpoint, params);
  }

  /*
  **onlineconsultation homepage submit query
  */
  submitQuery(data: any) {
    let apiEndpoint = c.OCApiUrl + 'SubmitQuery';
    let params = {
      "adminId": c.AdminId,
      "adminPassword": c.AdminPassword,
      "Name": data.Name,
      "Email": data.Email,
      "Mobile": data.Mobile,
      "Query": data.Query,
      "Speciality": "",
      "UTMtags": ""
    }
    return this.httpClient.post(apiEndpoint, params);
  }

  // The following methods are primarily used for UHID Registration in HOPE

  HOPEUtilsApiUrl = c.HOPEUtilsApiUrl;
  getAllCountriesHOPE() {
    let ae = this.HOPEUtilsApiUrl + 'GetAllCountries';
    return this.httpClient.get(ae);
  }

  getAllStatesHOPE(countryId: number) {
    let ae = this.HOPEUtilsApiUrl + 'GetAllStates/' + countryId;
    return this.httpClient.get(ae);
  }

  getAllDistrictsHOPE(stateId: number) {
    let ae = this.HOPEUtilsApiUrl + 'GetAllDistricts/' + stateId;
    return this.httpClient.get(ae);
  }

  getAllCitiesByDistrictHOPE(districtId: number) {
    let ae = this.HOPEUtilsApiUrl + 'GetAllCitiesByDistrictId/' + districtId;
    return this.httpClient.get(ae);
  }
  edocEncryption(value) {
    // (2x+y)
    return (2 * Number(value)) + Number(c.edocEncKey);
    //return value;
  }
  edoDecryption(value) {
    return (Number(value) - Number(c.edocEncKey)) / 2;
  }
  breadsrcumsschema(arr, length, renderer2) {
    //starting breadcrums schema in doctorprofile.        
    let breadcrumbsDocProfileSchema: breadcrumbsDocProfileSchema = {
      "@context": "http://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: []
    };
    var itemid = '';
    var itemid1 = '';
    var itemname = '';
    var itemname1 = '';
    if (arr[5] == 'doctorprofile') {
      itemid = window.location.origin + "/" + arr[0] + "/" + arr[1] + "/" + arr[2];
      itemname = arr[2];

      itemid1 = window.location.origin + "/" + arr[0] + "/" + arr[3];
      itemname1 = arr[3];

    } else if (arr.length == 5 && arr.findIndex(x => x === '/')) {
      itemid = window.location.origin + "/" + arr[0] + "/" + arr[3];
      itemname = arr[3] + ' in ' + arr[1];

      itemid1 = window.location.origin + "/" + arr[0] + "/" + arr[4];
      itemname1 = arr[3] + ' in ' + arr[2] + ' , ' + arr[1];
    }
    else {
      itemid = window.location.origin + "/" + arr[0] + "/" + arr[3];
      itemname = arr[2];
    }
    for (var i = 0; i < length; i++) {
      let control: itemListElement = {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@id": (i == 0) ? window.location.origin : (i == 1) ? window.location.origin + "/" + arr[0] + "/" + arr[1] : (i == 2) ? itemid : (i == 3) ? itemid1 : '',
          name: (i == 0) ? 'Home' : (i == 1) ? arr[1] : (i == 2) ? itemname : (i == 3) ? itemname1 : '',
          image: (i == 0 || i == 1 || i == 2) ? window.location.origin + '/assets/askapollo-logo.png' : (i == 3) ? arr[4] : ''

        }

      }
      breadcrumbsDocProfileSchema.itemListElement.push(control);
    }
    this.jsonld = JSON.stringify(breadcrumbsDocProfileSchema);
    let s = renderer2.createElement('script');
    s.type = `application/ld+json`;
    s.text = this.jsonld;
    renderer2.appendChild(this._document.body, s);
    //ending breadcrums schema in doctorprofile.
  }
  doctorInfoschema(docinfo, renderer2) {
    this.jsonld = JSON.stringify(docinfo);
    let s = renderer2.createElement('script');
    s.type = `application/ld+json`;
    s.text = this.jsonld;
    renderer2.appendChild(this._document.body, s);
  }
  onlineconsultationschema(docinfo, renderer2) {
    var scriptlist = document.getElementsByTagName("script");
    for (var i = 0; i < scriptlist.length; i++) {

      if (scriptlist[i].type == 'application/ld+json') {
        var objj = JSON.parse(scriptlist[i].text);
        if (objj['@type'] == 'WebSite') {
          scriptlist[i].parentNode.removeChild(scriptlist[i]);
        }
      }
    }
    this.jsonld = JSON.stringify(docinfo);
    let s = renderer2.createElement('script');
    s.type = `application/ld+json`;
    s.text = this.jsonld;
    renderer2.appendChild(this._document.body, s);
  }
  languageBreadsrcumsschema(arr, length, renderer2) {
    let breadcrumbsDocProfileSchema: breadcrumbsDocProfileSchema = {
      "@context": "http://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: []
    };
    for (var i = 0; i < length; i++) {
      let control: itemListElement = {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@id": this.getDomain() + arr[i]['url'],
          name: arr[i]['name'],
          image: this.getDomain() + '/assets/askapollo-logo.png'
        }
      }
      breadcrumbsDocProfileSchema.itemListElement.push(control);
    }


    this.jsonld = JSON.stringify(breadcrumbsDocProfileSchema);
    let s = renderer2.createElement('script');
    s.type = `application/ld+json`;
    s.text = this.jsonld;
    renderer2.appendChild(this._document.body, s);
  }
  getPresentUrl() {
    return location.protocol + "//" + location.host + this.router.url;
  }
  getDomain() {
    return location.protocol + "//" + location.host;
  }
  showMobileNumFiels=false;
  setShowMobileNoInLoginFlow(value: boolean) {
   
    this.showMobileNumFiels=value
  }
  noImage(gender)
  {
    if(gender == 2)
      return c.defaultDummyFeMale;
    else
      return c.defaultDummyMale;
  }
  localStorageTracker(string:any,flag:any)
  {
    if(c.isLocalStorageVariablesTracking)
    {
      console.log(string);
      //let ePoint=c.MultiSpecialityUrl+"AngularAppLog"
      //let apiEndpoint ="http://apollostage.quad1test.com/Stage_Rest_Services/api/MultiSpecialitytoDoctors/AngularAppLog/25D26DB7-9DF5-487E-B121-CDEB2E149273";
      let apiEndpoint = c.MultiSpecialityUrl+"AngularAppLog";
      let params = {
        "id":flag,
        "name":string
      };
      this.httpClient.post(apiEndpoint, params)
      .subscribe(
         (data) => {
            console.log(data);
          }, (err) => {
            this.errLog.log('common.service.ts', 'localStorageTracker()', err);
          }
        );
    }
    
  }
}
