import { Component, OnInit } from '@angular/core';
import { specialitylist } from '@aa/structures/speciality.interface';
import { DirectoriesService } from '@aa/services/directories.service';
import { AAAuthService } from '@aa/services/auth.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-speciality-index',
  templateUrl: './speciality-index.component.html',
  styleUrls: ['./speciality-index.component.scss']
})
export class SpecialityIndexComponent implements OnInit {

	speciality: specialitylist[];	
	specialitytFilter: any = {SpecialityId:'',Keyword: ''};		
	specialityComplex: any = [{Keyword:''}];
	selectedOption: any;

  	constructor(private cs:DirectoriesService,
  		public aaa: AAAuthService,
  		private commonService: CommonService) { }

	ngOnInit() {
		this.commonService.setPageTitle('List of all Speciality Doctors in Apollo Hospitals - Ask Apollo');
      	this.commonService.setPageDescription('Browse through a complete list of all speciality doctors in Apollo Hospitals in India. Find a specialist near your city and book appointments online instantly!');
		this.aaa.loadingShow('loadingid');
	  	this.cs.getSpecialityIndex().subscribe(
		      	(data: specialitylist[]) => {
		      		this.aaa.loadingHide('loadingid');		
		      		this.speciality = data;
		      		this.specialityComplex = data;
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
	searchSpeciality(form){

	}
}
