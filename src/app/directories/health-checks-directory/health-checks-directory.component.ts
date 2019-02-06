import { Component, OnInit } from '@angular/core';
import { healthCheckIndex, HealthCheckAutoSuggestion } from '@aa/structures/healthcheck.interface';

import { DirectoriesService } from '@aa/services/directories.service';
import { AAAuthService } from '@aa/services/auth.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { convertToParamMap } from '@angular/router';
import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-health-checks-directory',
  templateUrl: './health-checks-directory.component.html',
  styleUrls: ['./health-checks-directory.component.scss']
})
export class HealthChecksDirectoryComponent implements OnInit {
  searchPlaceholder: string;
  selectedOption: any;
  healthchecks: healthCheckIndex[];
  autoSuggestions: HealthCheckAutoSuggestion[];
  hospitallistFilter: any = { HospitalName: '' };
  hospitallistComplex: any = [{ HospitalName: '' }];
  healthCheckListComplex: any = [{ HealthCheckName: '' }];
  selectedSearch: HealthCheckAutoSuggestion;

  searchString:string='';
  constructor(private cs: DirectoriesService,
    public aaa: AAAuthService,
    private commonService: CommonService) { }

  ngOnInit() {
    this.commonService.setPageTitle('List of Health Checkup Packages in Apollo Hospitals - Ask Apollo');
    this.commonService.setPageDescription('Browse through a complete list of all health checkup packages in Apollo Hospitals. Find the best health check package near you & book appointments.');

    this.aaa.loadingShow('loadingid');
    this.cs.getHealthChecksIndexData().subscribe(
      (data: healthCheckIndex[]) => {
        this.healthchecks = data;
        this.hospitallistComplex = data;
        this.aaa.loadingHide('loadingid');
      },
      err => {
        this.aaa.loadingHide('loadingid');
        alert("something went wrong!");
      }
    );
  }

  AutoSuggestiononSelect(event: TypeaheadMatch): void {
    let urlHealthCheck: HealthCheckAutoSuggestion[] = this.autoSuggestions.filter(
      (s: HealthCheckAutoSuggestion) => {
        if (s.HealthCheckName != undefined && s.HealthCheckName != null && s.HealthCheckName.toString() == event.toString()) {
          return s.HealthCheckId;
        }
        else if (s.HealthCheckName == undefined && s.HealthCheckName == null) {
          return s.HealthCheckId = -1;
        }
      });

    if (urlHealthCheck[0].HealthCheckId > 0) {
      this.aaa.loadingShow('loadingid');
      this.cs.GetHealthChecksOnSelectedAutoSuggestion(urlHealthCheck[0].HealthCheckId).subscribe((data: healthCheckIndex[]) => {
        this.healthchecks = data;
        this.aaa.loadingHide('loadingid');
      },
        err => {
          this.aaa.loadingHide('loadingid');
          alert("something went wrong while fetching Data");
        })
    }
  }

  getAutoSuggestion($event) {
    let searchString = $event.target.value;
    // Get auto suggestions only if user has entered at least 1 character
    if (searchString.length > 0) {
      // console.log('non-empty search string');
      this.cs.GetHealthCheckAutoSuggestions(searchString).subscribe((data: HealthCheckAutoSuggestion[]) => {
        this.autoSuggestions = data;
        let suggestionStrings = [];
        data.forEach(
          (s: HealthCheckAutoSuggestion) => {
            suggestionStrings.push(s.HealthCheckName);
          }
        )
        this.healthCheckListComplex = suggestionStrings;
      })
    }
  }
  searchHealthHospital(val)
  {
    console.log(val);
  }
}
