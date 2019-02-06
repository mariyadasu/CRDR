import { Component, OnInit } from '@angular/core';
import { treatmentdiseaseIndex } from '@aa/structures/treatmentdisease.interface';
import { DirectoriesService } from '@aa/services/directories.service';
import { AAAuthService } from '@aa/services/auth.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-treatments-index',
  templateUrl: './treatments-index.component.html',
  styleUrls: ['./treatments-index.component.scss']
})
export class TreatmentsIndexComponent implements OnInit {

  selectedOption: any;
  treatmentchecks: treatmentdiseaseIndex[];
  treatmentlistFilter: any = {Keyword: ''};
  treatmentlistComplex: any = [{Keyword:''}];

  constructor(private cs:DirectoriesService,
  		public aaa: AAAuthService,
      private commonService: CommonService) { }

  	ngOnInit() {
      this.commonService.setPageTitle('List of all Disease Treatments in Apollo Hospitals - Ask Apollo');
      this.commonService.setPageDescription('Book an appointment online to consult doctors for disease treatments in Apollo Hospitals in India at Ask Apollo. View their profile, experience or feedback.');

  		this.aaa.loadingShow('loadingid');
  		this.cs.getDiseaseTreatmentIndexData(1).subscribe(
		      	(data: treatmentdiseaseIndex[]) => {		      		      		
		      		this.treatmentchecks = data; 
              		this.treatmentlistComplex = data;
		      		this.aaa.loadingHide('loadingid');			
				},
		      	err=> {
					this.aaa.loadingHide('loadingid');
					alert("something went wrong!");
				}
		    );
    }
    onSelect(event: TypeaheadMatch): void 
    {
      this.selectedOption = event.item;
    } 
    searchTreatment(form){

    }

}
