import { Component, OnInit } from '@angular/core';
import { DirectoriesService } from '@aa/services/directories.service';
import { AAAuthService } from '@aa/services/auth.service';
import {NgForm} from '@angular/forms';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { specialist } from '@aa/structures/specialist.interface';
import { CommonService } from '@aa/services/common.service';

@Component({
  	selector: 'app-specialist-index',
  	templateUrl: './specialist-index.component.html',
  	styleUrls: ['./specialist-index.component.scss']
})
export class SpecialistIndexComponent implements OnInit {	
	specialities: specialist[];
	spListFilter: any = {SpecialityId:'',Keyword: ''};	
  selectedOption: any;    
  specialistComplex: any = [{Keyword:''}];

  	constructor(private cs:DirectoriesService,
  		public aaa: AAAuthService,
      private commonService: CommonService){ 
  	}

  	ngOnInit() 
  	{
      this.commonService.setPageTitle('List of all Medical Specialists in Apollo Hospitals - Ask Apollo');
      this.commonService.setPageDescription('Browse through a complete list of all medical specialists in Apollo Hospitals. Find a specialist near your city and book appointments online instantly!');

      this.aaa.loadingShow('loadingid');
  		this.cs.getSpecialistIndex().subscribe(
	      	(data: specialist[]) => {
	      		this.aaa.loadingHide('loadingid');    		
	      		this.specialities = data;
            this.specialistComplex = data;
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
    searchSpeciallist(form){

    }
  	
}
