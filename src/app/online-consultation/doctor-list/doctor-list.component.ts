import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, Params, UrlTree, UrlSegmentGroup, NavigationEnd,
  UrlSegment, PRIMARY_OUTLET, ActivatedRoute } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { CommonService } from '@aa/services/common.service';
import { UtilsService } from '@aa/services/utils.service';
import { SearchService } from '@aa/services/search.service';

import { doctor } from '@aa/structures/doctor.interface';

// interface for breadcrumbs
export interface bc {
  name: string,
  url: string
}

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.scss']
})
export class DoctorListComponent implements OnInit {

  gettingDataFromServer = true;
  sortByString = 'Select';
  
  doctors: doctor[] = [];
  // To keep track of all filters applied to current search
  filtersApplied: {name: string, value: any}[] = [];

  // To handle pagination
  currentPage = 1;
  itemsPerPage = 10;
  doctorsPaginated: doctor[] = [];

  breadcrumbs: bc[] = [];
  
  docTrackerSub = new Subscription;

  isCollapsed = true;

  availableLanguages = [];

  currentSearch: UrlSegment[];

  currentCity: string;

  constructor(private commonService: CommonService,
    private utilsService: UtilsService,
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {

    this.commonService.setPageTitle("Book your doctor appointment today - Ask Apollo");
    
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
      }
    );

    this.docTrackerSub = this.searchService.doctorListTracker.subscribe(
      (docs: doctor[]) => {
        this.gettingDataFromServer = false;
        this.doctors = docs;
        this.doctorsPaginated = this.doctors.slice(0,11);

        // In More Filters, the list of languages should be extracted from those available in the current search list
        // So, get all the available languages and then strip out duplicated using the filter method
        docs.forEach(element => {
          this.availableLanguages.push(...element.LanguagesKnown.split(','));
        });
        this.availableLanguages = this.availableLanguages.filter((x, i, a) => a.indexOf(x) == i)

      }
    )

    // When coming into this page, scroll to the top of the page
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        document.getElementById('mh').scrollIntoView();
      }
    });
    
  }

  ngOnDestroy() {
    this.docTrackerSub.unsubscribe();
  }

  getDocsForUrl(urlSegments: UrlSegment[]) {
    this.currentSearch = urlSegments;
    let city = '';
    
    if(urlSegments.length > 1) {
      city = urlSegments[1].toString();
    }

    if(urlSegments.length == 2) {
      this.searchService.getDocsCity(city, this.filtersApplied);
      this.breadcrumbs = [{name: this.utilsService.deSanitizeURLParam(city), url: city}];
    } 
    else if (urlSegments.length == 3) {
      this.searchService.getDocsCitySpeciality(city, urlSegments[2].toString(), this.filtersApplied);
      this.breadcrumbs = [
        {name: this.utilsService.deSanitizeURLParam(city), url: city},
        {name: this.utilsService.deSanitizeURLParam(urlSegments[2].toString()), url: city + '/' + urlSegments[2].toString()}
      ];
    }
    else if (urlSegments.length == 4) {  
      if(urlSegments[2].toString() == 'hospital') {
        this.searchService.getDocsCityHospital(city, urlSegments[3].toString(), this.filtersApplied);
        this.breadcrumbs = [
          {name: this.utilsService.deSanitizeURLParam(city), url: city},
          {name: this.utilsService.deSanitizeURLParam(urlSegments[3].toString()), url: city + '/hospital/' + urlSegments[3].toString()}
        ];
      } 
      else if (urlSegments[2].toString() == 'groupname') {
        this.searchService.getDocsCityGroupname(city, urlSegments[3].toString(), this.filtersApplied);
        this.breadcrumbs = [
          {name: this.utilsService.deSanitizeURLParam(city), url: city},
          {name: this.utilsService.deSanitizeURLParam(urlSegments[3].toString()), url: city + '/groupname/' + urlSegments[3].toString()}
        ];
      }
      else if (urlSegments[2].toString() == 'hyperlocal') {
        this.searchService.getDocsCityHyperlocal(city, urlSegments[3].toString(), this.filtersApplied);
      }

    } 
    else if (urlSegments.length == 5) {
      if(urlSegments[3].toString() == 'hyperlocal') {
        this.searchService.getDocsCitySpecialityHyperlocal(city, urlSegments[2].toString(), urlSegments[4].toString(), this.filtersApplied);

        this.breadcrumbs = [
          {name: this.utilsService.deSanitizeURLParam(city), url: city},
          {name: this.utilsService.deSanitizeURLParam(urlSegments[3].toString()), url: urlSegments[2].toString()},
          {name: this.utilsService.deSanitizeURLParam(urlSegments[3].toString()), url: urlSegments[4].toString()}
        ];
      } 
      else if (urlSegments[2].toString() == 'hospital') {
        this.searchService.getDocsCityHospitalSpeciality(city, urlSegments[3].toString(), urlSegments[4].toString(), this.filtersApplied);

        this.breadcrumbs = [
          {name: this.utilsService.deSanitizeURLParam(city), url: city},
          {name: this.utilsService.deSanitizeURLParam(urlSegments[3].toString()), url: urlSegments[3].toString()},
          {name: this.utilsService.deSanitizeURLParam(urlSegments[4].toString()), url: city + '/' + urlSegments[4].toString()}
        ];
      }
    }
    else if (urlSegments.length == 6) {
      this.breadcrumbs = [
        {name: this.utilsService.deSanitizeURLParam(city), url: city},
        {name: this.utilsService.deSanitizeURLParam(urlSegments[3].toString()), url: city + '/hospital/' + urlSegments[3].toString()},
        {name: this.utilsService.deSanitizeURLParam(urlSegments[5].toString()), url: city + '/hospital/' + urlSegments[3].toString() + '/groupname/' + urlSegments[5].toString()}
      ];
      this.searchService.getDocsCityHospitalGroupname(city, urlSegments[3].toString(), urlSegments[5].toString(), this.filtersApplied);
    }
  }

  filterBy(name: string, value: any) {

    // If the filter has been applied before, figure out the previous value.
    let currentValue = this.filtersApplied.findIndex(f => {
      return f.name == name;
    });

    // If the filter has never been applied before, add the filter
    if(currentValue == -1) {
      this.filtersApplied.push({name: name, value: value});
      this.searchService.filterSearchResults(this.filtersApplied);
    }
    // If the value of filter param is same, no point in reapplying the filter
    else if(this.filtersApplied[currentValue].value == value) {
      return;
    }
    // If a new value has been added to an existing filter param, update the param
    else {
      this.filtersApplied[currentValue].value = value;
      this.searchService.filterSearchResults(this.filtersApplied);
    }

  }

  filterTiming(name: string) {
    
    let currentValue = this.filtersApplied.findIndex(f => {
      return f.name == name;
    });

    // If this filter has been applied already, we have nothing new to do.
    if(currentValue != -1) return;

    // We have boolean properties in the doctor interface to indicate if a doctor is available at a time
    // Whenever the user applies a new timing filter, we need to ensure that all other timing filters are erased
    let cam = this.filtersApplied.findIndex(f => {
      return f.name == 'am';
    });
    if(cam != -1) this.filtersApplied.splice(currentValue, 1);

    let caa = this.filtersApplied.findIndex(f => {
      return f.name == 'aa';
    });
    if(caa != -1) this.filtersApplied.splice(currentValue, 1);

    let cae = this.filtersApplied.findIndex(f => {
      return f.name == 'ae';
    });
    if(cae != -1) this.filtersApplied.splice(currentValue, 1);

    // After all the timing filters are erased, add the currently selected one to the filters list and apply it
    this.filtersApplied.push({name: name, value: true});
    this.getDocsForUrl(this.currentSearch);
    // this.searchService.filterSearchResults(this.filtersApplied);
  }

  sortBy(method: string) {
    this.searchService.sortSearchResults(method);
  }

  pageChanged(data: {page: number, itemsPerPage: number}) {
    this.doctorsPaginated = this.doctors.slice((data.page - 1) * this.itemsPerPage, data.page * this.itemsPerPage);
  }

  ngAfterViewInit() {
    document.getElementById('mh').scrollIntoView();
  }

}
