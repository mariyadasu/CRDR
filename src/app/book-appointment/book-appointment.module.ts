import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from './../shared/shared.module';

import { BookAppointmentComponent } from './book-appointment.component';
import { AppointmentInfoComponent } from './appointment-info/appointment-info.component';
import { PatientInfoComponent } from './patient-info/patient-info.component';
import { VerifyMobileComponent } from './verify-mobile/verify-mobile.component';
import { ConfirmRequestComponent } from './confirm-request/confirm-request.component';
import { RegisterUhidComponent } from './register-uhid/register-uhid.component';
import { PatientInfoUhidComponent } from './patient-info-uhid/patient-info-uhid.component';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';

const bookingRoutes: Routes = [
  { path: '', component: BookAppointmentComponent, children: [
    { path: 'patient-info', component: PatientInfoComponent },
    { path: 'patient-info-confirm', component: PatientInfoUhidComponent },
    { path: 'verify-mobile', component: VerifyMobileComponent },
    { path: 'confirm-request', component: ConfirmRequestComponent },
  ] }
]

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(bookingRoutes),
    Ng4LoadingSpinnerModule.forRoot(),
  ],
  declarations: [
    AppointmentInfoComponent,
    PatientInfoComponent,
    VerifyMobileComponent,
    ConfirmRequestComponent,
    RegisterUhidComponent,
    BookAppointmentComponent,
    PatientInfoUhidComponent
  ],
  exports: [
    RouterModule
  ]
})
export class BookAppointmentModule { }
