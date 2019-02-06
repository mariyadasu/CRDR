import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy, Renderer2 } from '@angular/core';
import {
  Router, Params, UrlTree, UrlSegmentGroup, NavigationEnd,
  UrlSegment, PRIMARY_OUTLET, ActivatedRoute
} from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { CommonService } from '@aa/services/common.service';
import { UtilsService } from '@aa/services/utils.service';
import { SearchService, boilerContent } from '@aa/services/search.service';

import { hospital } from '@aa/structures/hospital.interface';
import { doctor, docPageTitleandDescription } from '@aa/structures/doctor.interface';
import { trend } from '@aa/structures/city.interface';
import { AAAuthService } from '@aa/services/auth.service';

// interface for breadcrumbs
export interface bc {
  name: string,
  url: string
}

@Component({
  selector: 'app-doctor-search',
  templateUrl: './doctor-search.component.html',
  styleUrls: ['./doctor-search.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DoctorSearchComponent implements OnInit, OnDestroy, AfterViewInit {

  gettingDataFromServer = true;
  sortByString = 'Sort';

  selectHospitalString = 'Select Hospital';
  hospitals: hospital[] = [];

  doctors: doctor[] = [];
  // To keep track of all filters applied to current search
  filtersApplied: { name: string, value: any }[] = [];

  // To handle pagination
  currentPage = 1;
  itemsPerPage = 10;
  doctorsPaginated: doctor[] = [];

  breadcrumbs: bc[] = [];

  docTrackerSub = new Subscription;
  hosTrackerSub = new Subscription;

  isCollapsed = true;

  
  availableLanguages = [];
  availableLanguagesMale = [];
  availableLanguagesFemale = [];
  availableLanguagesActual = [];

  availableGenders = [];

  currentSearch: UrlSegment[];

  currentCity: string;
  trends: trend[];
  bc: boilerContent = null;
  metapage: string;
  gender: string = 'Gender';
  language: string = 'Language';

  constructor(
    private cs: CommonService,
    private us: UtilsService,
    private srs: SearchService,
    private route: ActivatedRoute,
    public aaa: AAAuthService,
    private router: Router,
    private _renderer2: Renderer2) { }

  shortServices: any;

  ngOnInit() {
    
    this.aaa.SHOW_SKIP = true;
    this.us.setActiveTab(this.us.TAB_PHYSICAL_APPOINTMENT);
    this.cs.setPageTitle("Book your doctor appointment today - Ask Apollo");

    let urlTree: UrlTree;
    let urlSegmentGroup: UrlSegmentGroup;
    let urlSegments: UrlSegment[];

    // When starting a new search from within the Doctor Search Page, Angular doesn't reload the Doctor-Search component
    // It simply refreshses the URL. So, we need to subscribe to the URL and act on it.
    this.route.url.subscribe(
      () => {
        urlTree = this.router.parseUrl(this.router.url);
        urlSegmentGroup = urlTree.root.children[PRIMARY_OUTLET];
        urlSegments = urlSegmentGroup.segments;
        this.currentCity = urlSegments[1] != null ? urlSegments[1].toString() : 'hyderabad';
        this.gettingDataFromServer = true;
        this.getDocsForUrl(urlSegments);

        // Get boilerplate whenever city and speciality are available
        if (urlSegments.length == 3) {
          this.srs.getBoilerContent(this.currentCity, urlSegments[2].toString());
          this.srs.boilerContentTracker.subscribe(
            (bc: boilerContent) => {
              if (bc.city == this.currentCity && bc.speciality == urlSegments[2].toString())
                this.bc = bc
            }
          );
        } else if (urlSegments.length == 5) {
          if (urlSegments[3].toString() == 'hyperlocal') {
            this.srs.getBoilerContent(this.currentCity, urlSegments[2].toString());
          }
          else if (urlSegments[2].toString() == 'hospital') {
            this.srs.getBoilerContent(this.currentCity, urlSegments[3].toString());
          }
        } else {
          this.bc = null;
        }
        this.srs.boilerContentTracker.subscribe(
          (bc: boilerContent) => {
            if (bc.city == this.currentCity && bc.speciality == urlSegments[2].toString())
              this.bc = bc
          }
        );
        // End boilerplate
      }
    );

    this.docTrackerSub = this.srs.doctorListTracker.subscribe(
      (docs: doctor[]) => {
        //debugger;
        this.gettingDataFromServer = false;
        this.doctors = docs;
        this.doctorsPaginated = this.doctors.slice(0, 11);
        for (let d of this.doctorsPaginated) {
          d.ApiServicesBosShort = d.ApiServicesBos.slice(0, 2);
        }
 
        // In More Filters, the list of languages should be extracted from those available in the current search list
        // So, get all the available languages and then strip out duplicated using the filter method
        
        docs.forEach(element => {
          //debugger;
          this.availableLanguages.push(...element.LanguagesKnown.split(','));
          this.availableLanguagesActual.push(...element.LanguagesKnown.split(','));
          if (+element.gender == 1) 
          {
            this.availableLanguagesMale.push(...element.LanguagesKnown.split(','));
            this.availableGenders.push(element.gender);
          }
          if (+element.gender == 2) 
          {
            this.availableLanguagesFemale.push(...element.LanguagesKnown.split(','));
            this.availableGenders.push(element.gender);
          }

        });
        this.availableLanguages = this.availableLanguages.filter((x, i, a) => a.indexOf(x) == i);
        this.availableLanguagesActual = this.availableLanguagesActual.filter((x, i, a) => a.indexOf(x) == i);
        this.availableLanguagesMale = this.availableLanguagesMale.filter((x, i, a) => a.indexOf(x) == i);
        this.availableLanguagesFemale = this.availableLanguagesFemale.filter((x, i, a) => a.indexOf(x) == i);

        this.availableGenders = this.availableGenders.filter((x, i, a) => a.indexOf(x) == i);

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

    this.getSidebarUrls(urlSegments);
    this.bindText();


  }

  getSidebarUrls(urlSegments: UrlSegment[]) {
    let city = '';
    if (urlSegments.length > 1) {
      city = urlSegments[1].toString();      
    }
    if (urlSegments.length == 2 || urlSegments.length == 4 || urlSegments.length == 6) {
      this.srs.getSidebarLinks4DoctorSearchCity(city);
    }
    else if (urlSegments.length == 3) {
      this.srs.getSidebarLinks4DoctorSearchCitySpeciality(city, urlSegments[2].toString());
    }
    else if (urlSegments.length == 5) {
      if (urlSegments[3].toString() == 'hyperlocal') {
        this.srs.getSidebarLinks4DoctorSearchCitySpeciality(city, urlSegments[2].toString());
      }
      else if (urlSegments[2].toString() == 'hospital') {
        this.srs.getSidebarLinks4DoctorSearchCitySpeciality(city, urlSegments[4].toString());
      }
    }
  }

  ngOnDestroy() {
    this.docTrackerSub.unsubscribe();
    this.hosTrackerSub.unsubscribe();
  }

  getDocsForUrl(urlSegments: UrlSegment[]) {
    this.getSidebarUrls(urlSegments);
    this.bindText();
    this.currentSearch = urlSegments;
    let city = '';

    if (urlSegments.length > 1) {
      city = urlSegments[1].toString();
    }
    if (urlSegments.length == 2) {
      this.srs.getDocsCity(city, this.filtersApplied);
      this.breadcrumbs = [{ name: this.us.deSanitizeURLParam(city), url: city }];
      this.metapage = city;
      this.setPageTitleDescription(this.metapage);
      this.cs.breadsrcumsschema(urlSegments,urlSegments.length,this._renderer2);

    }
    else if (urlSegments.length == 3) {
      this.srs.getDocsCitySpeciality(city, urlSegments[2].toString(), this.filtersApplied);
      this.breadcrumbs = [
        { name: this.us.deSanitizeURLParam(city), url: city },
        { name: this.us.deSanitizeURLParam(urlSegments[2].toString()), url: city + '/' + urlSegments[2].toString() }
      ];
      this.metapage = city + '/' + urlSegments[2].toString();
      this.setPageTitleDescription(this.metapage);
     this.cs.breadsrcumsschema(urlSegments,urlSegments.length,this._renderer2);
    }




    else if (urlSegments.length == 4) 
    {
      if (urlSegments[2].toString() == 'hospital') {
        this.srs.getDocsCityHospital(city, urlSegments[3].toString(), this.filtersApplied);
        this.breadcrumbs = [
          { name: this.us.deSanitizeURLParam(city), url: city },
          { name: this.us.deSanitizeURLParam(urlSegments[3].toString()), url: city + '/hospital/' + urlSegments[3].toString() }
        ];
        this.metapage = city + '/hospital/' + urlSegments[3].toString();
        this.setPageTitleDescription(this.metapage);
        var breadsrcumsschemaarray = [urlSegments[0].toString(),urlSegments[1].toString(),urlSegments[3].toString(),this.metapage];
        this.cs.breadsrcumsschema(breadsrcumsschemaarray,urlSegments.length-1,this._renderer2);
      }
      else if (urlSegments[2].toString() == 'groupname') {
        this.srs.getDocsCityGroupname(city, urlSegments[3].toString(), this.filtersApplied);
        this.breadcrumbs = [
          { name: this.us.deSanitizeURLParam(city), url: city },
          { name: this.us.deSanitizeURLParam(urlSegments[3].toString()), url: city + '/groupname/' + urlSegments[3].toString() }
        ];
        this.metapage = city + '/groupname/' + urlSegments[3].toString();
        this.setPageTitleDescription(this.metapage);
        var breadsrcumsschemaarray = [urlSegments[0].toString(),urlSegments[1].toString(),urlSegments[3].toString(),this.metapage];
        this.cs.breadsrcumsschema(breadsrcumsschemaarray,urlSegments.length-1,this._renderer2);
      }
      else if (urlSegments[2].toString() == 'hyperlocal') {
        this.breadcrumbs = [
          { name: this.us.deSanitizeURLParam(city), url: city },
          { name: this.us.deSanitizeURLParam(urlSegments[3].toString()), url: city + '/hyperlocal/' + urlSegments[3].toString() }
        ];
        this.srs.getDocsCityHyperlocal(city, urlSegments[3].toString(), this.filtersApplied);
        this.metapage = city + '/' + urlSegments[3].toString();
        this.setPageTitleDescription(this.metapage);
        var breadsrcumsschemaarray = [urlSegments[0].toString(),urlSegments[1].toString(),urlSegments[3].toString(),this.metapage];
        this.cs.breadsrcumsschema(breadsrcumsschemaarray,urlSegments.length-1,this._renderer2);
      }
      else if (urlSegments[2].toString() == 'symptom') {
        this.srs.getDocsCitySymptom(city, urlSegments[3].toString(), this.filtersApplied);
        this.breadcrumbs = [
          { name: this.us.deSanitizeURLParam(city), url: city },
          { name: this.us.deSanitizeURLParam(urlSegments[3].toString()), url: city + '/symptom/' + urlSegments[3].toString() }
        ];
        this.metapage = city + '/symptom/' + urlSegments[3].toString();
        this.setPageTitleDescription(this.metapage);
        var breadsrcumsschemaarray = [urlSegments[0].toString(),urlSegments[1].toString(),urlSegments[3].toString(),this.metapage];
        this.cs.breadsrcumsschema(breadsrcumsschemaarray,urlSegments.length-1,this._renderer2);

      }
    }



    else if (urlSegments.length == 5) 
    {      
      if (urlSegments[3].toString() == 'hyperlocal') {
        this.srs.getDocsCitySpecialityHyperlocal(city, urlSegments[2].toString(), urlSegments[4].toString(), this.filtersApplied);

        this.breadcrumbs = [
          { name: this.us.deSanitizeURLParam(city), url: city },
          { name: this.us.deSanitizeURLParam(urlSegments[3].toString()), url: urlSegments[2].toString() },
          { name: this.us.deSanitizeURLParam(urlSegments[3].toString()), url: urlSegments[4].toString() }
        ];
        this.metapage = city + '/' + urlSegments[2].toString() + '/' + urlSegments[4].toString();
        this.setPageTitleDescription(this.metapage);
      }
    

    
      else if (urlSegments[2].toString() == 'hospital') 
      {
        this.srs.getDocsCityHospitalSpeciality(city, urlSegments[3].toString(), urlSegments[4].toString(), this.filtersApplied);

        this.breadcrumbs = [
          { name: this.us.deSanitizeURLParam(city), url: city },
          { name: this.us.deSanitizeURLParam(urlSegments[3].toString()), url: urlSegments[3].toString() },
          { name: this.us.deSanitizeURLParam(urlSegments[4].toString()), url: city + '/' + urlSegments[4].toString() }
        ];
        this.metapage = city + '/' + urlSegments[4].toString();
        this.setPageTitleDescription(this.metapage);
      }





    }
    else if (urlSegments.length == 6) {      
      if (urlSegments[4].toString() == 'symptom') {
        this.breadcrumbs = [
          { name: this.us.deSanitizeURLParam(city), url: city },
          { name: this.us.deSanitizeURLParam(urlSegments[3].toString()), url: city + '/hospital/' + urlSegments[3].toString() },
          { name: this.us.deSanitizeURLParam(urlSegments[5].toString()), url: city + '/hospital/' + urlSegments[3].toString() + '/symptom/' + urlSegments[5].toString() }
        ];
        this.srs.getDocsCityHospitalSymptomname(city, urlSegments[3].toString(), urlSegments[5].toString(), this.filtersApplied);
        this.metapage = city + '/hospital/' + urlSegments[3].toString() + '/symptom/' + urlSegments[5].toString();
        this.setPageTitleDescription(this.metapage);
        var breadsrcumsschemaarray = [urlSegments[0].toString(),urlSegments[1].toString(),urlSegments[3].toString(),urlSegments[5].toString(),this.metapage];
        this.cs.breadsrcumsschema(breadsrcumsschemaarray,urlSegments.length-2,this._renderer2);       
      } else {
        this.breadcrumbs = [
          { name: this.us.deSanitizeURLParam(city), url: city },
          { name: this.us.deSanitizeURLParam(urlSegments[3].toString()), url: city + '/hospital/' + urlSegments[3].toString() },
          { name: this.us.deSanitizeURLParam(urlSegments[5].toString()), url: city + '/hospital/' + urlSegments[3].toString() + '/groupname/' + urlSegments[5].toString() }
        ];
        this.srs.getDocsCityHospitalGroupname(city, urlSegments[3].toString(), urlSegments[5].toString(), this.filtersApplied);
        this.metapage = city + '/hospital/' + urlSegments[3].toString() + '/groupname/' + urlSegments[5].toString();
        this.setPageTitleDescription(this.metapage);         
        var breadsrcumsschemaarray = [urlSegments[0].toString(),urlSegments[1].toString(),urlSegments[3].toString(),urlSegments[5].toString(),this.metapage];
        this.cs.breadsrcumsschema(breadsrcumsschemaarray,urlSegments.length-2,this._renderer2);       
      }
    }

  }

  setCurrentHospital(h: hospital) {
    this.selectHospitalString = h.hospitalName;
  }

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
      this.language = value;
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
    }

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

    // this.searchService.filterSearchResults(this.filtersApplied);
  }
  timeDefults = "Time";
  filterTiming(name: string) {
    if(name=='am'){
      this.timeDefults="Morning";
    }
     if(name=='aa'){
      this.timeDefults="Afternoon";
    }
     if(name=='ae'){
      this.timeDefults="Evening";
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
    this.getDocsForUrl(this.currentSearch);
    // this.searchService.filterSearchResults(this.filtersApplied);
  }

  sortBy(method: string) {
    this.srs.phsyicalSortSearchResults(method);
  }

  pageChanged(data: { page: number, itemsPerPage: number },scrollContainer) {
    this.doctorsPaginated = this.doctors.slice((data.page - 1) * this.itemsPerPage, data.page * this.itemsPerPage);
    for (let d of this.doctorsPaginated) {
      d.ApiServicesBosShort = d.ApiServicesBos.slice(0, 2);
    }
    var elmnt = document.getElementById("scrolTop");
    elmnt.scrollIntoView();
  }

  ngAfterViewInit() {
    document.getElementById('mh').scrollIntoView();
  }

  setPageTitleDescription(metapage: string) {
    this.srs.getPageTitleandDecriptionDoctorSearch(this.metapage).subscribe(
      (dtd: docPageTitleandDescription) => {
        this.cs.setPageTitle(dtd.PageTitle);
        this.cs.setPageDescription(dtd.PageDescription);
      });
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
  message: any = '';
  bindText() {
    let param = 'doctorsearch-' + this.currentCity;
    this.srs.getExtraData(param).subscribe(data => {
      this.message = data.OnPageContent;
    })
  }
  removeSpaces(item) {
    item = item.replace(/ /g, '-');
    item = item.replace(/%20/g, '-');
    return item;
  }
  getUrlWithSpecialityCharacters(keyword: string) {
    keyword = keyword.split(' ').join('-');
    keyword = keyword.split('&').join('and');
    return keyword.toLowerCase();
  }
  // Hide filters section when click on outside
  onClickedOutside(e: Event) 
  {
    //this.isCollapsed = true;
  }
  sendAppLinkEnter()
  {
    this.sendAppLink();
  }

}
