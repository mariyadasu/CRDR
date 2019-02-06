import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookHealthCheckComponent } from './book-health-check.component';

import { BookHealthCheckIndexComponent } from './index/index.component';
import { ConfirmLogedUserComponent } from './confirm-loged-user/confirm-loged-user.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HealthPackageListingComponent } from './health-package-listing/health-package-listing.component';
import { HealthPackageDetailsComponent } from './health-package-details/health-package-details.component';
import { HealthPackageBookComponent } from './health-package-book/health-package-book.component';

const bookHealthCheckRoutes: Routes = [
  {
    path: '',
    component: BookHealthCheckComponent,
    canActivateChild: [],
    children: [
      {
        path: 'index',
        component: BookHealthCheckIndexComponent,
        canActivate: []
      },
      {
        path: 'confirmation-loged-user',
        component: ConfirmLogedUserComponent,
        canActivate: []
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: []
      },
      {
        path: 'health-package-book',
        component: HealthPackageBookComponent,
        canActivate: []
      },
      {
        path: 'health-package-detail',
        component: HealthPackageDetailsComponent,
        canActivate: []
      },
      {
        path: 'health-package-listing',
        component: HealthPackageListingComponent,
        canActivate: []
      },
    ]
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(bookHealthCheckRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class BookHealthCheckRoutingModule {

}