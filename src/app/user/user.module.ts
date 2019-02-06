import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { UserComponent } from './user.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardOcComponent } from './dashboard-oc/dashboard-oc.component';
import { MyprofileComponent } from './myprofile/myprofile.component';
import { MyfamilyComponent } from './myfamily/myfamily.component';
import { UserSideNavComponent } from './user-side-nav/user-side-nav.component';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';

import { GenderPipe } from '../pipes/gender.pipe';
import { OrderMedicineComponent } from './order-medicine/order-medicine.component';
import { ViewCasesheetComponent } from './view-casesheet/view-casesheet.component';
import { ViewPrescriptionComponent } from './view-prescription/view-prescription.component';
import { OrderMedicineDatePipe } from './../pipes/order-medicine-date.pipe';
import { CasesheetViewComponent } from './casesheet-view/casesheet-view.component';

const userRoutes: Routes = [
  { path: '', component: UserComponent, children: [
    { path: 'dashboard', component: DashboardComponent },
    { path: 'dashboard-oc', component: DashboardOcComponent },
    { path: 'profile', component: MyprofileComponent },
    { path: 'family', component: MyfamilyComponent },
    { path: 'order-medicine', component: OrderMedicineComponent },
    { path: 'viewcasesheet', component: ViewCasesheetComponent },
    { path: 'viewprescription', component: ViewPrescriptionComponent },
    { path: 'casesheetview', component: CasesheetViewComponent },
  ] }
]

@NgModule({
  imports: [
    SharedModule,

    Ng4LoadingSpinnerModule.forRoot(),
    RouterModule.forChild(userRoutes),
  ],
  declarations: [
    UserComponent,
    DashboardComponent,
    DashboardOcComponent,
    MyprofileComponent,
    MyfamilyComponent,
    UserSideNavComponent,

    GenderPipe,

    OrderMedicineComponent,

    ViewCasesheetComponent,

    ViewPrescriptionComponent,
    OrderMedicineDatePipe,
    CasesheetViewComponent
  ],
  exports: [
    RouterModule
  ]
})
export class UserModule { }
