import { Component, OnInit, ViewEncapsulation, AfterViewInit, OnDestroy, Renderer2, TemplateRef } from '@angular/core';
import {
  Router, Params, UrlTree, UrlSegmentGroup, NavigationEnd,
  UrlSegment, PRIMARY_OUTLET, ActivatedRoute
} from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { CommonService } from '@aa/services/common.service';
import { UtilsService } from '@aa/services/utils.service';
import { SearchService, boilerContent } from '@aa/services/search.service';

import { hospital } from '@aa/structures/hospital.interface';
import { doctorC } from '@aa/structures/doctor.interface';
import { trend } from '@aa/structures/city.interface';
import { AAAuthService } from '@aa/services/auth.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';

import { Meta } from '@angular/platform-browser';

declare var jquery: any;
declare var $: any;
// interface for breadcrumbs
export interface bc {
  name: string,
  url: string
}

@Component({
  selector: 'online-doctor-search',
  templateUrl: './online-doctorsearch.component.html',
  styleUrls: ['./online-doctorsearch.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OnlineDoctorSearchComponent implements OnInit, OnDestroy, AfterViewInit {

  gettingDataFromServer = true;
  sortByString = 'Select';
  selectHospitalString = 'Select Hospital';
  hospitals: hospital[] = [];
  doctors: doctorC[] = [];
  doctorsActual: doctorC[] = [];
  // To keep track of all filters applied to current search
  filtersApplied: { name: string, value: any }[] = [];
  // To handle pagination
  currentPage = 1;
  itemsPerPage = 10;
  doctorsPaginated: doctorC[] = [];
  breadcrumbs: bc[] = [];
  city: string;
  docTrackerSub = new Subscription;
  hosTrackerSub = new Subscription;
  isCollapsed = true;
  availableLanguages = [];
  currentSearch: UrlSegment[];
  currentCity: string;
  trends: trend[];
  bc: boilerContent = null;
  breadcrum: any[];
  cityId: any = '3';
  searchId: any = '';
  searchText: any = '';
  searchType: any = '';
  availableGenders = [];
  gender: string = 'Gender';
  urlTree: UrlTree;
  urlSegmentGroup: UrlSegmentGroup;
  urlSegments: UrlSegment[];

  PageTitle: string;
  PageDescription: string;

  constructor(
    private cs: CommonService,
    private us: UtilsService,
    private srs: SearchService,
    private route: ActivatedRoute,
    public aaa: AAAuthService,
    private spinnerService1: Ng4LoadingSpinnerService,
    private modalService: BsModalService,
    private router: Router,
    private meta: Meta,
    private _renderer2: Renderer2) { }

  ngOnInit() {
    this.cs.setCanonicallink(window.location.href);
    this.links();
    this.aaa.checkPendingCaseSheet();

    this.search();

    //this.spinnerService1.show();



    // When coming into this page, scroll to the top of the page 
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        document.getElementById('mh').scrollIntoView();
      }
    });



  }

  search() {
    this.citiesSelected = "cities";
    this.route.params.forEach(params => {
      // online consultation quick links city filtering
      let city = params['city'];
      this.city = city;
      let filteredCity = "";
      if (city) {
        city = this.us.searchText(city);
        if (city.includes(" ")) {
          filteredCity = this.us.toCamelCase(city);
          this.filterBy('city', filteredCity);
        } else {
          filteredCity = city.charAt(0).toUpperCase() + city.slice(1);
          this.filterBy('city', filteredCity);

        }
      }
      this.aaa.SHOW_SKIP = false;
      localStorage.setItem('dsuri', window.location.href);
      this.us.setActiveTab(this.us.TAB_ONLINE_CONSULTATION);

      if (this.breadcrum[2] == "speciality") {
        let speciality = params['speciality'].split('-').join(' ');
        this.searchText = speciality;
        this.searchType = "AskSpec";

        if (city) {
          this.PageTitle = "Online " + this.searchText + " Doctors in " + city + " - Ask Apollo";
          this.PageDescription = "Book online consultation with " + this.searchText + " doctors in " + city + " practicing at Apollo Hospitals. Consult best Doctors online at Ask Apollo.";
          this.cs.setPageTitle("Online " + this.searchText + " Doctors in " + city + " - Ask Apollo")
          this.cs.updateMeta("Book online consultation with " + this.searchText + " doctors in " + city + " practicing at Apollo Hospitals. Consult best Doctors online at Ask Apollo.");
        }
        else {
          this.PageTitle = "Online " + this.searchText + " Doctors in India - Ask Apollo";
          this.PageDescription = "Book an online consultation with the top " + this.searchText + " doctors in India practicing at Apollo Hospitals. Consult with the best doctors online at Ask Apollo.";
          this.cs.setPageTitle("Online " + this.searchText + " Doctors in India - Ask Apollo");
          this.cs.updateMeta("Book an online consultation with the top " + this.searchText + " doctors in India practicing at Apollo Hospitals. Consult with the best doctors online at Ask Apollo.")

        }
      }
      if (this.breadcrum[2] == "doctor") {
        let doctor = params['doctor'].split('-').join(' ');
        this.searchText = doctor;
        this.searchType = "AskDoc";
      }
      if (this.breadcrum[2] == "symptom") {
        let symptom = params['symptom'].split('-').join(' ');
        this.searchText = symptom;
        this.searchType = "AskSymp";
      }
      if (this.breadcrum[2] == "treatment") {
        let treatment = params['treatment'].split('-').join(' ');
        this.searchText = treatment;
        this.searchType = "AskTret";
      }
      if (this.breadcrum[2] == "disease") {
        let disease = params['disease'].split('-').join(' ');
        this.searchText = disease;
        this.searchType = "AskDise";
      }


      this.getDocsForUrl();
      //this.aaa.loadSocket();
      //this.loadSocket();

    });
  }



  direct() {
    this.router.navigate(["/online-doctors-consultation"]);
  }
  speRoute(x) {
    let y = x.charAt(0).toUpperCase() + x.slice(1);
    localStorage.setItem("SearchId", "Askspeciality");
    localStorage.setItem("SearchText", y);
    this.router.navigate(["/online-doctors-consultation/speciality/" + x]);
  }

  links() {
    let url = this.router.url;
    this.breadcrum = url.toLocaleLowerCase().split("/");
  }

  // loadSocket() {

  //   this.aaa.createSocketInformaion().subscribe(data => {

  //     if (data != null && data.ResponceCode == "0" && data.Result != '') {
  //       console.log('socket data  received');
  //       let socDetails = JSON.parse(data.Result);
  //       this.sockURL = socDetails.SockURL;
  //       this.sockUserID = socDetails.UserId.toLowerCase();
  //       this.socketVideoURL = socDetails.VideoURL;
  //       this.startSocket(this.sockURL, this.sockUserID, this.socketVideoURL);

  //     } else {
  //       console.log('socket data  unable to get');
  //     }
  //   })
  // }

  // sock: WebSocket;
  // sockURL: any;
  // sockUserID: any;
  // socketVideoURL: any;
  // scketResponse: any;

  // reOpenSocket() {
  //   console.log('open socket');
  //   this.sock.onopen = () => this.sock.send(JSON.stringify({
  //     type: 'userID',
  //     value: this.sockUserID
  //   }));;

  // }

  // openopoup() {
  //   document.getElementById('myModal').style.display = "block";;
  // }
  // closepopup() {
  //   document.getElementById('myModal').style.display = "none";;
  // }
  // startSocket(websocketServerLocation, userId, viedeoUrl) {
  //   console.log('strt socket');
  //   var callStatus = "";
  //   this.sock = new WebSocket(websocketServerLocation);
  //   var socket = this.sock;
  //   var docName = "";

  //   this.sock.onmessage = function (event) {

  //     console.log('strt recived message');
  //     let dataRes = JSON.parse(event.data);

  //     docName = dataRes.message.doctor_name;
  //     localStorage.setItem('dataFromTestVideo', event.data);
  //     openopoup();

  //     setTimeout(function () {
  //       UnAnsercall();
  //       window.location.reload();
  //     }, 60000);

  //   };
  //   this.reOpenSocket();

  //   this.sock.onclose = function () {
  //     console.log('close socket');

  //     setTimeout(function () { this.start(websocketServerLocation) }, 5000);
  //   };

  //   function openopoup() {
  //     document.getElementById('myModal').style.display = "block";
  //     document.getElementById("pMsg").innerHTML = "you have appointment with " + docName + " Do you wants to contine video call?"
  //   }
  //   function closepopup() {
  //     document.getElementById('myModal').style.display = "none";
  //   }

  //   function UnAnsercall() {
  //     console.log('call rejected socket');
  //     let data = JSON.parse(localStorage.getItem('dataFromTestVideo'));

  //     var scketResponse = {
  //       type: data.type,
  //       message: data.message.message,
  //       client_id: data.message.client_id,
  //       serverKey: data.message.serverKey,
  //       accessKey: data.message.accessKey,
  //       patient_name: data.message.patient_name,
  //       doctor_id: data.message.doctor_id,
  //       doctor_name: data.message.doctor_name,
  //       patient_id: data.message.patient_id,
  //       visit_id: data.message.visit_id,
  //       consultation_slot: data.message.consultation_slot,
  //       token: data.message.token,
  //       speciality: data.message.speciality,
  //       send_list: data.message.send_list,
  //       sending_from: data.message.sending_from,
  //       time: data.message.time
  //     }

  //     socket.send(JSON.stringify({
  //       type: 'unanswered',
  //       send_list: [scketResponse.doctor_id],
  //       sending_from: scketResponse.patient_name
  //     }))
  //   }
  // }

  acceptCall1() {
    this.aaa.acceptCall();
    //   document.getElementById('myModal').style.display = "none";
    //   let data = JSON.parse(localStorage.getItem('dataFromTestVideo'));

    //   this.scketResponse = {
    //     type: data.type,
    //     message: data.message.message,
    //     client_id: data.message.client_id,
    //     serverKey: data.message.serverKey,
    //     accessKey: data.message.accessKey,
    //     patient_name: data.message.patient_name,
    //     doctor_id: data.message.doctor_id,
    //     doctor_name: data.message.doctor_name,
    //     patient_id: data.message.patient_id,
    //     visit_id: data.message.visit_id,
    //     consultation_slot: data.message.consultation_slot,
    //     token: data.message.token,
    //     speciality: data.message.speciality,
    //     send_list: data.message.send_list,
    //     sending_from: data.message.sending_from,
    //     time: data.message.time
    //   }

    //   this.sock.send(JSON.stringify({
    //     type: 'callAccepted',
    //     send_list: [this.scketResponse.doctor_id],
    //     sending_from: this.scketResponse.patient_name
    //   }))


    //   window.open(this.socketVideoURL + 'token=' + this.scketResponse.token +
    //     '&visit_id=' + this.scketResponse.visit_id + '&user_id=' + this.sockUserID + '', '_blank');
    //   this.sock.send(JSON.stringify({
    //     type: 'userID',
    //     value: this.sockUserID //$('#hfUserId').val()
    //   }))

  }

  rejectVideoCall1() {
    this.aaa.rejectVideoCall();
    //   document.getElementById('myModal').style.display = "none";
    //   let data = JSON.parse(localStorage.getItem('dataFromTestVideo'));

    //   this.scketResponse = {
    //     type: data.type,
    //     message: data.message.message,
    //     client_id: data.message.client_id,
    //     serverKey: data.message.serverKey,
    //     accessKey: data.message.accessKey,
    //     patient_name: data.message.patient_name,
    //     doctor_id: data.message.doctor_id,
    //     doctor_name: data.message.doctor_name,
    //     patient_id: data.message.patient_id,
    //     visit_id: data.message.visit_id,
    //     consultation_slot: data.message.consultation_slot,
    //     token: data.message.token,
    //     speciality: data.message.speciality,
    //     send_list: data.message.send_list,
    //     sending_from: data.message.sending_from,
    //     time: data.message.time
    //   }

    //   this.sock.send(JSON.stringify({
    //     type: 'rejectCall',
    //     send_list: [this.scketResponse.doctor_id],
    //     sending_from: this.scketResponse.patient_name
    //   }))

  }

  getSidebarUrls(urlSegments: UrlSegment[]) {

    let city = '';
    if (urlSegments.length > 1) {
      city = urlSegments[1].toString();
    }

    if (urlSegments.length == 2) {
      this.srs.getSidebarLinks4DoctorSearchCity(city);
    } else if (urlSegments.length == 3) {
      this.srs.getSidebarLinks4DoctorSearchCitySpeciality(city, urlSegments[2].toString());
    } else if (urlSegments.length == 5) {
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
    this.cs.removeMeta();
  }
  applyFilter() {
    this.doctors = this.doctorsActual;

    for (let data of this.filtersApplied) {

      if (data.name == "g") {
        if (data.value == "1") {
          this.doctors = this.doctors.filter(d => {
            this.gender = 'Male Doctor';
            return d.Gender == "Male";
          })
        }
        if (data.value == "2") {
          this.doctors = this.doctors.filter(d => {
            this.gender = 'Female Doctor';
            return d.Gender == "Female";
          })
        }
      }

      if (data.name == "l") {
        this.doctors = this.doctors.filter(d => {
          let lan = d.LanguagesKnown;
          if (d.LanguagesKnown.indexOf(data.value) != -1) {
            return true;
          } else {
            return false;
          }
        })

      }

      if (data.name == "at") {
        let day = new Date().getDay();

        let dayName = this.getDay(day);

        this.doctors = this.doctors.filter(d => {
          let dayofWeek = d.DayofWeek;
          if (d.DayofWeek.indexOf(dayName) != -1) {
            return true;
          } else {
            return false;
          }
        })

      }

      if (data.name == "city") {

        this.doctors = this.doctors.filter(d => {
          return d.CityName == data.value;
        })
      }
      if (data.value == "all") {
        this.doctors = this.doctorsActual;
      }

    }



    this.doctorsPaginated = this.doctors.slice(0, 11);



  }
  applySort() {
    if (this.sortByString == "ohl") {
      this.doctors = this.doctors.sort(function (obj1, obj2) {
        // Ascending: first age less than the previous
        return +obj2.Experience - +obj1.Experience;
      })
    } else if (this.sortByString == "olh") {
      this.doctors = this.doctors.sort(function (obj1, obj2) {
        // Ascending: first age less than the previous
        return +obj1.Experience - +obj2.Experience;
      })
    }
    this.doctorsPaginated = this.doctors.slice(0, 11);
  }

  applySortNew(val: any) {
    if (val == "ohl") {
      this.doctors = this.doctors.sort(function (obj1, obj2) {
        // Ascending: first age less than the previous
        return +obj2.Experience - +obj1.Experience;
      })
      this.sortString = 'Experience High - Low';
    } else if (val == "olh") {
      this.doctors = this.doctors.sort(function (obj1, obj2) {
        // Ascending: first age less than the previous
        return +obj1.Experience - +obj2.Experience;
      })
      this.sortString = 'Experience Low - High';
    }
    this.doctorsPaginated = this.doctors.slice(0, 11);
  }
  sortString: any = 'Sort by:';
  applySortFee(val: any) {
    if (val == "ohl") {
      this.doctors = this.doctors.sort(function (obj1, obj2) {
        // Ascending: first age less than the previous
        return +obj2.Tariff - +obj1.Tariff;
      })
      this.sortString = 'Price High - Low';
    } else if (val == "olh") {
      this.doctors = this.doctors.sort(function (obj1, obj2) {
        // Ascending: first age less than the previous
        return +obj1.Tariff - +obj2.Tariff;
      })
      this.sortString = 'Price Low - High';
    }
    this.doctorsPaginated = this.doctors.slice(0, 11);
  }
  availableCities = [];
  getDocsForUrl() {

    this.srs.getDoctoreForConsultation(this.searchText, this.searchType).subscribe(data => {
      if (data != null && data.ResponceCode == "0" && data.Result != '') {
        this.gettingDataFromServer = false;
        this.doctors = JSON.parse(data.Result);
        this.doctorsActual = JSON.parse(data.Result);

        this.applyFilter();
        this.applySort();
        this.doctorsPaginated = this.doctors.slice(0, 11);
        this.links();
        this.getPageSchema();
        this.setTwitterCard();
        // In  More Filters, the list of languages should be extracted from those available in the current search list
        // So, get all the available languages and then strip out duplicated using the filter method
        this.availableGenders = [];
        this.doctors.forEach(element => {
          this.availableLanguages.push(...element.LanguagesKnown.split(','));
          this.availableCities.push(...element.CityName.split(','));

          if (element.Gender == 'Male') {
            this.availableGenders.push(1);
          }
          if (element.Gender == 'Female') {
            this.availableGenders.push(2);
          }

        });
        this.availableLanguages = this.availableLanguages.filter((x, i, a) => a.indexOf(x) == i)
        this.availableCities = this.availableCities.filter((x, i, a) => a.indexOf(x) == i)
        this.availableLanguages.push();
        this.availableCities.push();

        this.availableGenders = this.availableGenders.filter((x, i, a) => a.indexOf(x) == i);
        this.availableGenders.push();
      }
      this.spinnerService1.hide();
    })
  }

  setCurrentHospital(h: hospital) {
    this.selectHospitalString = h.hospitalName;
  }
  citiesSelected = "cities";
  filterBy(name: string, value: any) {
    if (name == "city") {
      this.citiesSelected = value;
    }
    // If the filter has been applied before, figure out the previous value.
    let currentValue = this.filtersApplied.findIndex(f => {
      return f.name == name;
    });

    // If the filter has never been applied before, add the filter
    if (currentValue == -1) {
      this.filtersApplied.push({ name: name, value: value });
      this.applyFilter();
      //this.srs.filterSearchResults(this.filtersApplied);
    }
    // If the value of filter param is same, no point in reapplying the filter
    else if (this.filtersApplied[currentValue].value == value) {
      return;
    }
    // If a new value has been added to an existing filter param, update the param
    else {
      this.filtersApplied[currentValue].value = value;
      this.applyFilter();
      //this.srs.filterSearchResults(this.filtersApplied);
    }

  }
  filterByCity(val: any) {
    this.doctors = this.doctorsActual;
    this.doctors = this.doctors.filter(d => {

      return d.CityName == val;
    });
    this.doctorsPaginated = this.doctors.slice(0, 11);
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
    this.applyFilter();
    //this.getDocsForUrl();

  }

  filterTiming(name: string) {

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
    this.getDocsForUrl();
    // this.searchService.filterSearchResults(this.filtersApplied);
  }

  sortBy(method: string) {
    this.sortByString = method;
    if (method == "ohl" || method == "olh") {
      this.getDocsForUrl();
    }

    //this.srs.sortSearchResults(method);
  }

  pageChanged(data: { page: number, itemsPerPage: number }) {
    this.doctorsPaginated = this.doctors.slice((data.page - 1) * this.itemsPerPage, data.page * this.itemsPerPage);
  }

  ngAfterViewInit() {
    document.getElementById('mh').scrollIntoView();
  }

  getDay(dayNum: any) {
    switch (dayNum) {
      case 0:
        return 'Sunday';
      case 1:
        return 'Monday';
      case 2:
        return 'Tuesday';
      case 3:
        return 'Wednesday';
      case 4:
        return 'Thursday';
      case 5:
        return 'Friday';
      case 6:
        return 'Saturday';
    }
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

  closeAlert() {
    document.getElementById("id01").style.display = "none";
  }
  showMore: boolean = false;

  showMoreFilterClick() {
    this.showMore = !this.showMore;
  }
  getPageSchema() {
    var text = '{ "@context":"http://schema.org/" , "@type":"WebSite","name":"test","url":"https://www.askapollo.com/india/language/english"}'

    var obj = JSON.parse(text);
    obj.name = this.PageTitle;
    obj.url = this.cs.getPresentUrl();
    this.cs.onlineconsultationschema(obj, this._renderer2);
  }
  setTwitterCard() {
    this.meta.addTag({ name: 'twitter:card', content: 'Summary' });
    this.meta.addTag({ name: 'twitter:site', content: '@HospitalsApollo' });
    this.meta.addTag({ name: 'twitter:title', content: this.PageTitle });
    this.meta.addTag({ name: 'twitter:description', content: this.PageDescription });
  }

}
