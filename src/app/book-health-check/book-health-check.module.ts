import { NgModule } from '@angular/core';

import { BookHealthCheckRoutingModule } from './book-health-check-routing.module';

import { BookHealthCheckIndexComponent } from './index/index.component';
import { BookHealthCheckComponent } from './book-health-check.component';
import { ConfirmLogedUserComponent } from './confirm-loged-user/confirm-loged-user.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HealthPackageListingComponent } from './health-package-listing/health-package-listing.component';
import { HealthPackageDetailsComponent } from './health-package-details/health-package-details.component';
import { HealthPackageBookComponent } from './health-package-book/health-package-book.component';

import { BookHealhCheckService } from './services/book-health-check.service'
@NgModule({
    imports:
        [
            BookHealthCheckRoutingModule
        ],
    declarations:
        [
            BookHealthCheckComponent,
            BookHealthCheckIndexComponent,
            ConfirmLogedUserComponent,
            DashboardComponent,
            HealthPackageListingComponent,
            HealthPackageDetailsComponent,
            HealthPackageBookComponent,
        ],
    providers:
        [
            BookHealhCheckService
        ],
    entryComponents: [

    ]
})
export class BookHealthCheckModule { }
