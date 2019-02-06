import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DoctorSearchComponent } from './doctor-search/doctor-search.component';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';
import { OnlineConsultationComponent } from './online-consultation/online-consultation.component';
import { NavyaHomeComponent } from './navya/navya-home/navya-home.component';
import { NavyaPostLoginComponent } from './navya/navya-post-login/navya-post-login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AlexaLoginComponent } from './alexa-login/alexa-login.component';
import { AuthGuard } from './services/auth.guard';
import { OnlineDoctorSearchComponent } from './online-consultation/doctor-search/online-doctorsearch.component';
import { OnlineDoctorProfileComponent } from './doctor-profile/online-doctorprofile.component';
import { OnlinepaymentComponent } from './online-consultation/payment/online-payment.component';
import { OnlinePendingCaseSheetComponent } from './online-consultation/pending-casesheet/pending-casesheet.component';
import { DoctorDiseaseTreatmentComponent } from './doctor-disease-treatment/doctor-disease-treatment.component';
import { SpecialistIndexComponent } from './directories/specialist-index/specialist-index.component';
import { LocalityCityIndexComponent } from './directories/locality-city-index/locality-city-index.component';
import { LadyDoctorsComponent } from './directories/lady-doctors/lady-doctors.component';
import { CityHospitalsIndexComponent } from './directories/city-hospitals-index/city-hospitals-index.component';
import { SpecialityIndexComponent } from './directories/speciality-index/speciality-index.component';
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
import { ContactUsComponent } from './directories/contact-us/contact-us.component';
import { AboutUsComponent } from './directories/about-us/about-us.component';
import { HospitalInformationComponent } from './hospital-information/hospital-information.component';
import { FaqComponent } from './directories/faq/faq.component';
import { SiteMapComponent } from './directories/site-map/site-map.component';
import { FeedbackComponent } from './feedback/feedback.compnent';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';
import { HealthChecksComponent } from './health-checks/health-checks.component';
import { DoctorSearchNewComponent } from './doctor-search/doctor-search-new.component';
import { DoctorProfileNewComponent } from './doctor-profile/doctor-profile-new/doctor-profile-new.component';
import { LadyDoctorsSearchComponent } from './directories/lady-doctors/lady-doctors-search/lady-doctors-search.component';
import { HealthLibrary } from './health-library/health-library.component';
import { OnlineCasesheetComponent } from './online-consultation/online-casesheet/online-casesheet.component';
import { constants as c } from './constants';
export const appRoutes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { 
    path: 'book-health-check', 
    loadChildren: './book-health-check/book-health-check.module#BookHealthCheckModule'
  },
  { path: 'health-library', component: HealthLibrary },
  { path: 'health-library/signin', component: HealthLibrary },
  { path: 'online-doctors-consultation/speciality/:speciality', component: OnlineDoctorSearchComponent },
  { path: 'online-doctors-consultation/symptom/:symptom', component: OnlineDoctorSearchComponent },
  { path: 'online-doctors-consultation/disease/:disease', component: OnlineDoctorSearchComponent },
  { path: 'online-doctors-consultation/treatment/:treatment', component: OnlineDoctorSearchComponent },
  { path: 'online-doctors-consultation/doctor/:doctor', component: OnlineDoctorSearchComponent },
  { path: 'online-doctors-consultation/speciality/:speciality/:city', component: OnlineDoctorSearchComponent },
  { path: 'online-doctors-consultation/doctor/:speciality/:city/:doctor', component: OnlineDoctorProfileComponent },
  // { path: 'online-consultation/doctorsearch,', component: OnlineDoctorSearchComponent },
  // { path: 'online-consultation/doctorsearch/:doctor/:name', component: OnlineDoctorSearchComponent },
  { path: 'doctorsearch/:city', component: DoctorSearchComponent },

  { path: 'india', component: ApolloDoctorsComponent },
  { path: 'india/language/:language', component: ApolloDoctorsComponent },
  { path: 'india/:letter', component: ApolloDoctorsComponent },
  { path: ':city/language/:value', component: DoctorSearchNewComponent },
  { path: ':city/hospital/:hospital', component: DoctorSearchNewComponent },
  { path: ':city/hospital/:hospital/:speciality', component: DoctorSearchNewComponent },
  { path: ':city/symptom/:symptom', component: DoctorSearchNewComponent },
  { path: ':city/hospital/:hospital/symptom/:symptomname', component: DoctorSearchNewComponent },
  { path: ':city/hyperlocal/:hyperlocal', component: DoctorSearchNewComponent },
  { path: ':city/hyperlocal/:speciality/:hyperlocal', component: DoctorSearchNewComponent },
  { path: ':city/ladydoctors', component: LadyDoctorsSearchComponent },
  { path: ':city/ladydoctors/:speciality', component: LadyDoctorsSearchComponent },
  { path: ':city/ladydoctors/:speciality/:hospital', component: LadyDoctorsSearchComponent },
  { path: ':city/ladydoctors/:speciality/hyperlocal/:hyperlocal', component: LadyDoctorsSearchComponent },
  { path: 'diseases/:servicename', component: DoctorDiseaseTreatmentComponent },
  { path: ':city/diseases/:servicename', component: DoctorDiseaseTreatmentComponent },
  { path: ':city/diseases/:servicename/:hyperlocal', component: DoctorDiseaseTreatmentComponent },
  { path: 'treatments/:servicename', component: DoctorDiseaseTreatmentComponent },
  { path: ':city/treatments/:servicename', component: DoctorDiseaseTreatmentComponent },
  { path: ':city/treatments/:servicename/:hyperlocal', component: DoctorDiseaseTreatmentComponent },
  { path: ':city/:speciality/:doctor', component: DoctorProfileNewComponent },







  { path: 'doctorsearch/:city/:speciality', component: DoctorSearchComponent },
  { path: 'doctorsearch/:city/hospital/:hospital', component: DoctorSearchComponent },
  { path: 'doctorsearch/:city/groupname/:groupname', component: DoctorSearchComponent },
  { path: 'doctorsearch/:city/hyperlocal/:hyperlocal', component: DoctorSearchComponent },
  { path: 'doctorsearch/:city/hospital/:hospital/:speciality', component: DoctorSearchComponent },
  { path: 'doctorsearch/:city/hospital/:hospital/groupname/:groupname', component: DoctorSearchComponent },
  { path: 'doctorsearch/:city/:speciality/hyperlocal/:hyperlocal', component: DoctorSearchComponent },
  { path: 'doctorsearch/:city/symptom/:symptom', component: DoctorSearchComponent },
  { path: 'doctorsearch/:city/hospital/:hospital/symptom/:symptomname', component: DoctorSearchComponent },
  { path: 'doctor/:city/:speciality/:doctor', component: DoctorProfileComponent },

  { path: 'online-doctors-consultation', component: OnlineConsultationComponent },
  { path: 'onlinependingcasesheet', component: c.onlineCasesheetType == 'new' ? OnlineCasesheetComponent : OnlinePendingCaseSheetComponent },
  { path: 'onlinepayment', component: OnlinepaymentComponent },
  { path: 'canceropinion', component: NavyaHomeComponent },
  { path: 'cancercare', component: NavyaPostLoginComponent },
  { path: 'my', canActivate: [AuthGuard], loadChildren: './user/user.module#UserModule' },
  { path: 'book-appointment', loadChildren: './book-appointment/book-appointment.module#BookAppointmentModule' },
  { path: 'alexa-login', component: AlexaLoginComponent },

  { path: 'treatments/:servicename', component: DoctorDiseaseTreatmentComponent },
  { path: 'specialistdirectory', component: SpecialistIndexComponent },
  { path: 'locality-city-index', component: LocalityCityIndexComponent },
  { path: 'ladydoctorsindex', component: LadyDoctorsComponent },
  { path: 'city-hospitals', component: CityHospitalsIndexComponent },
  { path: 'specialtydirectory', component: SpecialityIndexComponent },
  { path: 'doctorsindex', component: DoctorsIndexComponent },
  { path: 'specialities-diseases', component: DiseasesIndexComponent },
  { path: 'languagesindex', component: LanguageIndexComponent },
  { path: 'city-index', component: CityIndexComponent },

  { path: 'doctors/:speciality/:letter', component: ApolloDoctorsComponent },
  { path: 'specialities-treatments', component: TreatmentsIndexComponent },
  { path: 'city-language-index', component: CityLanguageIndexComponent },
  { path: 'city-speciality-index', component: CitySpecialityIndexComponent },
  { path: 'city-hyperlocations-specialities', component: CityLocalitySpecialistIndexComponent },
  { path: 'city-groupname-specialities', component: CityGroupnameIndexComponent },
  { path: 'city-specialist-index', component: CitySpecialistIndexComponent },
  { path: 'city-index', component: CityIndexComponent },
  { path: 'hospitals-healthcheck-list', component: HealthChecksDirectoryComponent },
  { path: 'diseases-complication-glossary', component: MedicalGlossaryComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'faqs', component: FaqComponent },
  { path: 'site-map', component: SiteMapComponent },
  { path: 'feedback', component: FeedbackComponent },
  { path: 'hospitalinformation/:city/hospital/:hospital', component: HospitalInformationComponent },
  { path: 'terms-of-use', component: TermsOfUseComponent },
  { path: 'health-risk-questionnaire', loadChildren: './health-risk-questionnaire/health-risk-questionnaire.module#HealthRiskQuestionnaireModule' },
  { path: 'health-checks', component: HealthChecksComponent },
  { path: '404', component: PageNotFoundComponent },
  { path: ':city', component: DoctorSearchNewComponent },
  { path: ':city/:value', component: DoctorSearchNewComponent },
  
  
  { path: '**', component: PageNotFoundComponent }

]

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
