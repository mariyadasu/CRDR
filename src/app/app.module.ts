import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';

import { MatSidenavModule } from '@angular/material';
import { Angular2SocialLoginModule } from "angular2-social-login";

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { UtilsService } from '@aa/services/utils.service';
import { APIInterceptor } from '@aa/services/api.interceptor';
import { CommonService } from '@aa/services/common.service';
import { CalendarService } from '@aa/services/calendar.service';
import { StoreService } from '@aa/services/store.service';
import { SearchService } from '@aa/services/search.service';
import { BookingService } from '@aa/services/booking.service';
import { AAAuthService } from '@aa/services/auth.service';
import { UserService } from '@aa/services/user.service';
import { DirectoriesService } from '@aa/services/directories.service';
import { HealthcheckService } from '@aa/services/healthcheck.service';
import { ErrlogService } from '@aa/services/errlog.service';

import { AppComponent } from './app.component';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { SidenavComponent } from './common/sidenav/sidenav.component';
import { HomeComponent } from './home/home.component';
import { DoctorSearchComponent } from './doctor-search/doctor-search.component';
import { DoctorSearchNewComponent } from './doctor-search/doctor-search-new.component';
import { SummaryCardComponent } from './doctor-search/summary-card/summary-card.component';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';

import { OnlineLocationSummaryCardComponent } from './doctor-profile/location-summary-card/online-location-summary-card.component';

import { LocationSummaryCardComponent } from './doctor-profile/location-summary-card/location-summary-card.component';
import { OnlineConsultationComponent } from './online-consultation/online-consultation.component';

import { NavyaHomeComponent } from './navya/navya-home/navya-home.component';
import { NavyaPostLoginComponent } from './navya/navya-post-login/navya-post-login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { SignupComponent } from './user/signup/signup.component';
import { SignupBasicComponent } from './user/signup/signup-basic/signup-basic.component';
import { SignupDetailsComponent } from './user/signup/signup-details/signup-details.component';
import { SignupOtpComponent } from './user/signup/signup-otp/signup-otp.component';
import { SignupUhidComponent } from './user/signup/signup-uhid/signup-uhid.component';

import { DoctorListComponent } from './online-consultation/doctor-list/doctor-list.component';
import { DoctorNotAvailableComponent } from './online-consultation/doctor-not-available/doctor-not-available.component';

import { SignupMobileOtpComponent } from './user/signup/signup-mobile-otp/signup-mobile-otp.component';
import { RequestAppointmentComponent } from './doctor-search/request-appointment/request-appointment.component';
import { AlexaLoginComponent } from './alexa-login/alexa-login.component';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import { AuthGuard } from './services/auth.guard';

import { OnlineDoctorSearchComponent } from './online-consultation/doctor-search/online-doctorsearch.component';
import { OnlineSummaryCardComponent } from './online-consultation/summary-card/online-summarycard.component';
import { OnlineDoctorProfileComponent } from './doctor-profile/online-doctorprofile.component';

import { OnlinepaymentComponent } from './online-consultation/payment/online-payment.component';
import { OnlinePendingCaseSheetComponent } from './online-consultation/pending-casesheet/pending-casesheet.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { ShareButtonsModule } from 'ngx-sharebuttons';
import { DoctorDiseaseTreatmentComponent } from './doctor-disease-treatment/doctor-disease-treatment.component';

import { SpecialistIndexComponent } from './directories/specialist-index/specialist-index.component';
import { DoctorsIndexComponent } from './directories/doctors-index/doctors-index.component';
import { DiseasesIndexComponent } from './directories/diseases-index/diseases-index.component';
import { LanguageIndexComponent } from './directories/language-index/language-index.component';
import { CityIndexComponent } from './directories/city-index/city-index.component';
import { ApolloDoctorsComponent } from './directories/apollo-doctors/apollo-doctors.component';
import { DirectoryRequestAppointmentComponent } from './directories/apollo-doctors/request-appointment/directory-request-appointment.component';
import { DirectorySummaryCardComponent } from './directories/apollo-doctors/summary-component/directory-summary-card.component';
import { TreatmentsIndexComponent } from './directories/treatments-index/treatments-index.component';
import { CityLanguageIndexComponent } from './directories/city-language-index/city-language-index.component';
import { CitySpecialityIndexComponent } from './directories/city-speciality-index/city-speciality-index.component';
import { CityLocalitySpecialistIndexComponent } from './directories/city-locality-specialist-index/city-locality-specialist-index.component';
import { CityGroupnameIndexComponent } from './directories/city-groupname-index/city-groupname-index.component';
import { CitySpecialistIndexComponent } from './directories/city-specialist-index/city-specialist-index.component';
import { HealthChecksDirectoryComponent } from './directories/health-checks-directory/health-checks-directory.component';
import { MedicalGlossaryComponent } from './directories/medical-glossary/medical-glossary.component';
import { LocalityCityIndexComponent } from './directories/locality-city-index/locality-city-index.component';
import { LadyDoctorsComponent } from './directories/lady-doctors/lady-doctors.component';
import { CityHospitalsIndexComponent } from './directories/city-hospitals-index/city-hospitals-index.component';
import { SpecialityIndexComponent } from './directories/speciality-index/speciality-index.component';
import { DirectoriesComponent } from './directories/directories.component';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';
import { appRoutes } from './app-routing.module';
import { ContactUsComponent } from './directories/contact-us/contact-us.component';
import { AboutUsComponent } from './directories/about-us/about-us.component';
import { HospitalInformationComponent } from './hospital-information/hospital-information.component';
import { FaqComponent } from './directories/faq/faq.component';
import { SiteMapComponent } from './directories/site-map/site-map.component';
import { FeedbackComponent } from './feedback/feedback.compnent';

import { ClickOutsideModule } from 'ng-click-outside';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';
import { YoutubePlayerModule } from 'ngx-youtube-player';
import { HealthChecksComponent } from './health-checks/health-checks.component';
import { DatePipe } from '@angular/common';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { NgxJsonLdModule } from '@ngx-lite/json-ld';
import {NgxPaginationModule} from 'ngx-pagination';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';


import { defineLocale } from 'ngx-bootstrap/chronos';
import { enGbLocale } from 'ngx-bootstrap/locale';
defineLocale('en-gb', enGbLocale); 
import { HealthLibrary  } from './health-library/health-library.component';
import { OnlineCasesheetComponent } from './online-consultation/online-casesheet/online-casesheet.component';
import { GenderPipe } from '../app/pipes/gender.pipe';

let providers = {
  "google": {
    "clientId": "991359739117-ku2gaadtkmc7m2nra2mu4tgjlfvkoi3j.apps.googleusercontent.com"
  }
  ,
  "facebook": {
    "clientId": "109396262830197",
    "apiVersion": "v2.12" //like v2.4
  }
};
import { NgDatepickerModule } from 'ng2-datepicker';
import { DoctorProfileNewComponent } from './doctor-profile/doctor-profile-new/doctor-profile-new.component';
import { LadyDoctorsSearchComponent } from './directories/lady-doctors/lady-doctors-search/lady-doctors-search.component';

import { GoogleAnalyticsModule, GA_TOKEN } from 'angular-ga';
import { CookieService } from 'ngx-cookie-service';

import { DefaultUrlSerializer, UrlTree, UrlSerializer } from '@angular/router';

import { SignupHealthLibraryComponent } from './user/signup/health-library/signup.component';
import { SignupBasicHealthLibraryComponent } from './user/signup/health-library/signup-basic/signup-basic.component';
import { SignupDetailsHealthLibraryComponent } from './user/signup/health-library/signup-details/signup-details.component';
import { SignupOtpHealthLibraryComponent } from './user/signup/health-library/signup-otp/signup-otp.component';


 export class LowerCaseUrlSerializer extends DefaultUrlSerializer {
   parse(url: string): UrlTree {
      return super.parse(url.toLowerCase());
  }
}




@NgModule({
  declarations: [
    AppComponent,

    HomeComponent,
    HeaderComponent,
    FooterComponent,
    SidenavComponent,

    DoctorSearchComponent,
    DoctorSearchNewComponent,
    SummaryCardComponent,

    DoctorProfileComponent,
    LocationSummaryCardComponent,
    OnlineLocationSummaryCardComponent,

    OnlineConsultationComponent,
    DoctorListComponent,
    DoctorNotAvailableComponent,

    NavyaHomeComponent,
    NavyaPostLoginComponent,

    PageNotFoundComponent,

    OnlineDoctorSearchComponent,
    OnlineSummaryCardComponent,
    OnlineDoctorProfileComponent,
    OnlinePendingCaseSheetComponent,
    OnlinepaymentComponent,

    SignupComponent,
    SignupBasicComponent,
    SignupDetailsComponent,
    SignupOtpComponent,
    SignupMobileOtpComponent,
    SignupUhidComponent,
    RequestAppointmentComponent,

    AlexaLoginComponent,
    DoctorDiseaseTreatmentComponent,
    SpecialistIndexComponent,
    DirectoryRequestAppointmentComponent,
    DirectorySummaryCardComponent,
    LocalityCityIndexComponent,
    LadyDoctorsComponent,
    CityHospitalsIndexComponent,
    SpecialityIndexComponent,
    DoctorsIndexComponent,
    DiseasesIndexComponent,
    LanguageIndexComponent,
    CityIndexComponent,
    ApolloDoctorsComponent,
    TreatmentsIndexComponent,
    CityLanguageIndexComponent,
    CitySpecialityIndexComponent,
    CityLocalitySpecialistIndexComponent,
    CityGroupnameIndexComponent,
    CitySpecialistIndexComponent,
    HealthChecksDirectoryComponent,
    MedicalGlossaryComponent,
    DirectoriesComponent,
    ContactUsComponent,
    AboutUsComponent,
    HospitalInformationComponent,
    FaqComponent,
    SiteMapComponent,
    FeedbackComponent,
    TermsOfUseComponent,
    HealthChecksComponent,
    DoctorProfileNewComponent,
    LadyDoctorsSearchComponent,
    HealthLibrary,
    OnlineCasesheetComponent,
    SignupHealthLibraryComponent,
    SignupBasicHealthLibraryComponent,
    SignupDetailsHealthLibraryComponent,
    SignupOtpHealthLibraryComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FilterPipeModule,
    SharedModule,

    MatSidenavModule,
    AppRoutingModule,
   // RouterModule.forRoot(appRoutes, { useHash: true }),
    // RouterModule.forRoot(appRoutes), //, { enableTracing: true, useHash: true }
    Angular2SocialLoginModule,
    Ng4LoadingSpinnerModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    ShareButtonsModule.forRoot(),
    ClickOutsideModule,
    YoutubePlayerModule,
    NgDatepickerModule,
    NgIdleKeepaliveModule.forRoot(),
    NgxJsonLdModule,
    NgxPaginationModule,
    GoogleAnalyticsModule.forRoot(),
    ScrollToModule.forRoot()
  ],
  providers: [
    //{provide:localStorage,useClass:HashLocationStrategy},
    CommonService,
    SearchService,
    CalendarService,
    StoreService,
    UserService,
    DirectoriesService,
    ErrlogService,
    UtilsService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: APIInterceptor,
      multi: true
    },
    BookingService,
    AAAuthService,
    HealthcheckService,
    BsModalRef,
    AuthGuard,
    DatePipe,
    CookieService,
    {
        provide: UrlSerializer,
       useClass: LowerCaseUrlSerializer
    },
    GenderPipe,
  ],
  bootstrap: [
    AppComponent
  ],
  entryComponents: [
    SignupComponent,
    RequestAppointmentComponent,
    SignupHealthLibraryComponent
  ],

})
export class AppModule { }

Angular2SocialLoginModule.loadProvidersScripts(providers);
