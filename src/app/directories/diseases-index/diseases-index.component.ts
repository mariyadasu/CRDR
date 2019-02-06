import { Component, OnInit } from '@angular/core';
import { treatmentdiseaseIndex } from '@aa/structures/treatmentdisease.interface';
import { DirectoriesService } from '@aa/services/directories.service';
import { AAAuthService } from '@aa/services/auth.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { ErrlogService } from '@aa/services/errlog.service';
import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-diseases-index',
  templateUrl: './diseases-index.component.html',
  styleUrls: ['./diseases-index.component.scss']
})
export class DiseasesIndexComponent implements OnInit {

  selectedOption: any;
  diseasechecks: treatmentdiseaseIndex[];
  diseaselistFilter: any = {Keyword: ''};
  diseaselistComplex: any = [{Keyword:''}];

  constructor(private cs:DirectoriesService,
  		public aaa: AAAuthService,
      private errLog: ErrlogService,
      private commonService: CommonService) 
  { 

  }

	ngOnInit() 
  {
    this.commonService.setPageTitle('Clinical Specialties | Specialities and Diseases - Ask Apollo');
    this.commonService.setPageDescription('Book an instant appointment online to consult the best doctors in India for clinical specialties and diseases at Ask Apollo. View their profile or feedback.');
		this.aaa.loadingShow('loadingid');
		this.cs.getDiseaseTreatmentIndexData(2).subscribe(
    	(data: treatmentdiseaseIndex[]) => {		      		      		
    		this.diseasechecks = data; 
        this.diseaselistComplex = data;
    		this.aaa.loadingHide('loadingid');
		},
	  err=> {
		  this.aaa.loadingHide('loadingid');
      this.errLog.log('directories/diseases-index.component.ts','ngOnInit()',err);
			alert("something went wrong!");
		});
  }
  onSelect(event: TypeaheadMatch): void 
  {
    this.selectedOption = event.item;
  } 
  searchDisease(form){

  }

}
