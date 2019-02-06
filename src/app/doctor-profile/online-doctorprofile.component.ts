import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit, Renderer2, OnDestroy } from '@angular/core';
import {
  ActivatedRoute, Router, UrlTree, NavigationEnd,
  UrlSegmentGroup, UrlSegment, PRIMARY_OUTLET
} from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { TabsetComponent } from 'ngx-bootstrap';

import { UtilsService } from '@aa/services/utils.service';
import { CommonService } from '@aa/services/common.service';
import { SearchService } from './../services/search.service';
import { Title } from '@angular/platform-browser'
import { docDetail, docDetailC, docDetailSummary, docDetailInfo, docDetailHealthFeed, docDetailSummaryC } from '@aa/structures/doctor.interface';
import { doctorC, docDetailLocation } from '@aa/structures/doctor.interface';

import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'online-doctor-profile',
  templateUrl: './online-doctorprofile.component.html',
  styleUrls: ['./online-doctorprofile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OnlineDoctorProfileComponent implements OnInit, OnDestroy, AfterViewInit {

  gettingDataFromServer: boolean;

  doc: doctorC = {} as doctorC;
  docSummary: docDetailSummaryC = {} as docDetailSummaryC;
  docInfoTab: docDetailInfo = {} as docDetailInfo;
  docHealthFeedTab: docDetailHealthFeed = {} as docDetailHealthFeed;
  docProfileId: string;
  docDetailSub: Subscription;
  breadcrumbs: any[];
  urlTree: UrlTree;
  urlSegmentGroup: UrlSegmentGroup;
  urlSegments: UrlSegment[];
  docC: doctorC;
  docDetailLocation: docDetailLocation;
  isDataAvailable: boolean = false;

  PageTitle: string;
  PageDescription: string;

  constructor(
    private us: UtilsService,
    private cs: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private title: Title,
    private meta: Meta,
    private _renderer2: Renderer2
  ) { }

  ngOnInit() {
    this.cs.setCanonicallink(window.location.href);
    localStorage.setItem('dsuri', window.location.href);
    let url = this.router.url
    this.breadcrumbs = url.toLocaleLowerCase().split("/");
    this.getDocId(this.us.searchText(this.breadcrumbs[5]));
    this.bindText();
    this.us.setActiveTab(this.us.TAB_ONLINE_CONSULTATION);

    this.getPageSchema();
    this.setTwitterCard();
    //localStorage.getItem('docProfileId');

    // if (this.docProfileId == "0") {
    //   // this.isDataAvailable = true;
    //   // let docProfileStorage = JSON.parse(localStorage.getItem('docProfile'));

    //   // if (docProfileStorage) {
    //   //   this.doc = docProfileStorage;
    //   // }
    //   // this.docDetailLocation = {
    //   //   DoctorprofileSlotDayandTilmeList: [],
    //   //   HospitalAddress: '',
    //   //   HospitalId: 0,
    //   //   HospitalName: '',
    //   //   Latitude: 0,
    //   //   Longituge: 0
    //   // }

    //   // this.docSummary = {
    //   //   docId: this.doc.DoctorId,
    //   //   docName: this.doc.FirstName + " " + this.doc.LastName,
    //   //   docPhotoURL: this.doc.CompletePhotoUrl,
    //   //   docCity: this.doc.CityName.toString(),
    //   //   docSpeciality: this.doc.Speciality,
    //   //   docQualification: this.doc.Qualification,
    //   //   notInterestedIneDoc: '0',
    //   //   specialityId: +this.doc.SpecialityId
    //   // };



    //   // this.router.events.subscribe((evt) => {
    //   //   if (evt instanceof NavigationEnd) {
    //   //     document.getElementById('mh').scrollIntoView();
    //   //   }
    //   // });
    // } else {

    //   //docProfileId = "7e7246e7-0b75-4eb8-b302-165ac3a5f709";
    //   //docProfileId = '085cf7fa-1e60-4bec-be29-18bdf12d3342';

    //   // this.searchService.getOnlineDocProfile(this.docProfileId).subscribe(data => {
    //   //   if (data != null && data.ResponceCode == "0" && data.Result != "" && data.Result != "[]") {
    //   //     let docInfo = JSON.parse(data.Result);
    //   //     docInfo = docInfo[0];

    //   //     this.doc = {
    //   //       Achievements: docInfo.Achievements,
    //   //       CityId: docInfo.CityId,
    //   //       CityName: docInfo.CityName,
    //   //       CompletePhotoUrl: docInfo.CompletePhotoUrl,
    //   //       DayofWeek: docInfo.DayOfWeek,
    //   //       DOB: docInfo.DateOfBirth,
    //   //       DoctorId: this.docProfileId,
    //   //       Email: docInfo.Email,
    //   //       Experience: docInfo.YearsOfExperience,
    //   //       FirstName: docInfo.FirstName,
    //   //       Gender: docInfo.Gender,
    //   //       HasEmail: docInfo.HasEmail,
    //   //       HasVideo: docInfo.HasVideo,
    //   //       HasVoice: docInfo.HasVoice,
    //   //       HospitalId: docInfo.HospitalId,
    //   //       HospitalName: docInfo.HospitalName,
    //   //       LanguagesKnown: docInfo.LanguagesKnown,
    //   //       LastName: docInfo.LastName,
    //   //       LocationId: docInfo.LocationId,
    //   //       LocationName: '',
    //   //       PhotoUrl: docInfo.PhotoUrl,
    //   //       ProfessionalMemberships: docInfo.ProfessionalMemberships,
    //   //       Publications: docInfo.Publications,
    //   //       Qualification: docInfo.Qualification,
    //   //       RegistrationNo: docInfo.RegistrationNo,
    //   //       SemContent: '',
    //   //       Speciality: docInfo.Speciality,
    //   //       SpecialityId: docInfo.SpecialityId,
    //   //       Tariff: docInfo.Tariff,
    //   //       USD: docInfo.USD,
    //   //       UserId: docInfo.UserId
    //   //     }
    //   //     this.docDetailLocation = {
    //   //       DoctorprofileSlotDayandTilmeList: [],
    //   //       HospitalAddress: '',
    //   //       HospitalId: 0,
    //   //       HospitalName: '',
    //   //       Latitude: 0,
    //   //       Longituge: 0
    //   //     }

    //   //     this.docSummary = {
    //   //       docId:this.docProfileId,
    //   //       docName: docInfo.FirstName + " " + docInfo.LastName,
    //   //       docPhotoURL: docInfo.CompletePhotoUrl,
    //   //       docCity: docInfo.CityName.toString(),
    //   //       docSpeciality: docInfo.Speciality,
    //   //       docQualification: docInfo.Qualification,
    //   //       notInterestedIneDoc: '0',
    //   //       specialityId: +this.doc.SpecialityId
    //   //     };
    //   //     this.isDataAvailable = true;
    //   //     this.title.setTitle(this.docSummary.docName+" - Top "+this.docSummary.docSpeciality+" Doctor | Ask Apollo");
    //   //     this.cs.updateMeta(this.docSummary.docName+" is the top "+this.docSummary.docSpeciality+" doctor at Apollo Hospitals. Book an online appointment with "+this.docSummary.docName+" at Ask Apollo.s");

    //   //   } else {
    //   //     alert('Doctor not found');
    //   //     this.router.navigate(['onlineconsultation']);
    //   //   }
    //   // })
    // }
  }

  getDocId(searchByText: string) {
    this.searchService.getDoctoreForConsultation(searchByText, "AskDoc").subscribe(details => {
      // let x = JSON.parse(details.Result)[0];
      // this.docProfileId=x.DoctorId;
      // console.log(details)
      // this.searchService.getOnlineDocProfile(this.docProfileId).subscribe(details => {

      if (details != null && details.ResponceCode == "0" && details.Result != "" && details.Result != "[]") {
        let docInfo = JSON.parse(details.Result);
        docInfo = docInfo[0];
        this.doc = {
          Achievements: docInfo.Achievements,
          CityId: docInfo.CityId,
          CityName: docInfo.CityName,
          CompletePhotoUrl: docInfo.CompletePhotoUrl,
          DayofWeek: docInfo.DayofWeek,
          DOB: docInfo.DOB,
          DoctorId: docInfo.DoctorId,
          Email: docInfo.Email,
          Experience: docInfo.Experience,
          FirstName: docInfo.FirstName,
          Gender: docInfo.Gender,
          HasEmail: docInfo.HasEmail,
          HasVideo: docInfo.HasVideo,
          HasVoice: docInfo.HasVoice,
          HospitalId: docInfo.HospitalId,
          HospitalName: docInfo.HospitalName,
          LanguagesKnown: docInfo.LanguagesKnown,
          LastName: docInfo.LastName,
          LocationId: docInfo.LocationId,
          LocationName: docInfo.LocationName,
          PhotoUrl: docInfo.PhotoUrl,
          ProfessionalMemberships: docInfo.ProfessionalMemberships,
          Publications: docInfo.Publications,
          Qualification: docInfo.Qualification,
          RegistrationNo: docInfo.RegistrationNo,
          SemContent: docInfo.SemContent,
          Speciality: docInfo.Speciality,
          SpecialityId: docInfo.SpecialityId,
          Tariff: docInfo.Tariff,
          USD: docInfo.USD,
          UserId: docInfo.UserId
        }
        this.docDetailLocation = {
          DoctorprofileSlotDayandTilmeList: [],
          HospitalAddress: '',
          HospitalId: 0,
          HospitalName: '',
          Latitude: 0,
          Longituge: 0
        }

        this.docSummary = {
          docId: docInfo.DoctorId,
          docName: docInfo.FirstName + " " + docInfo.LastName,
          docPhotoURL: docInfo.CompletePhotoUrl,
          docCity: docInfo.CityName.toString(),
          docSpeciality: docInfo.Speciality,
          docQualification: docInfo.Qualification,
          notInterestedIneDoc: '0',
          specialityId: docInfo.SpecialityId
        };
        this.isDataAvailable = true;
        this.title.setTitle(this.docSummary.docName + " - Top " + this.docSummary.docSpeciality + " Doctor | Ask Apollo");
        this.cs.updateMeta(this.docSummary.docName + " is the top " + this.docSummary.docSpeciality + " doctor at Apollo Hospitals. Book an online appointment with " + this.docSummary.docName + " at Ask Apollo.s");

        this.PageTitle = this.docSummary.docName + " - Top " + this.docSummary.docSpeciality + " Doctor | Ask Apollo";
        this.PageDescription = this.docSummary.docName + " is the top " + this.docSummary.docSpeciality + " doctor at Apollo Hospitals. Book an online appointment with " + this.docSummary.docName + " at Ask Apollo.s";
      }
      else {
        alert('Doctor not found');
        this.router.navigate(['online-doctors-consultation']);
      }
      //})
    })
  }

  ngOnDestroy() {
    //  this.docDetailSub.unsubscribe();

  }

  ngAfterViewInit() {
    document.getElementById('mh').scrollIntoView();
  }

  @ViewChild('staticTabs') staticTabs: TabsetComponent;

  selectTab(tab_id: number) {
    this.staticTabs.tabs[tab_id].active = true;
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
  direct(x) {

    if (x === 1) this.router.navigate(["/online-doctors-consultation"]);
    else {
      this.router.navigate(["/online-doctors-consultation/speciality/" + x]);
    }
  }
  goToDoctorSearch() {
    this.router.navigate(['/online-doctors-consultation/speciality/' + this.us.sanitizeURLParamC(this.breadcrumbs[3]) + '/' + this.us.sanitizeURLParamC(this.breadcrumbs[4])]);
  }
  getPageSchema() {
 //   debugger;
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
