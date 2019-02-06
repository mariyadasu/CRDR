import { Component, OnInit } from '@angular/core';
import { doctorsIndex } from '@aa/structures/doctor.interface';
import { DirectoriesService } from '@aa/services/directories.service';
import { AAAuthService } from '@aa/services/auth.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { UtilsService } from '@aa/services/utils.service';
import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-lady-doctors',
  templateUrl: './lady-doctors.component.html',
  styleUrls: ['./lady-doctors.component.scss']
})
export class LadyDoctorsComponent implements OnInit {

	selectedOption: any;
	ladydoctors: doctorsIndex[] = [];
	ladydocComplex: any = [{FullName:''}];
    ladydocFillter: any = {FullName:''};

  constructor(private cs:DirectoriesService,
  	public aaa: AAAuthService,
  		private us: UtilsService,
  		private commonService: CommonService) { }

  	ngOnInit() {
  		this.commonService.setPageTitle('List of Best Lady Doctors in Apollo Hospitals - Ask Apollo');
      	this.commonService.setPageDescription('Get a complete list of best lady doctors in Apollo Hospitals across various cities. Find a lady doctor near your city and book appointments instantly!');
  		this.aaa.loadingShow('loadingid');
  		this.cs.getDoctorsIndex().subscribe(
		      	(data: doctorsIndex[]) => {			      			      		
			            this.ladydoctors = [];
			            data.forEach(element => {			            	
			            	if(element.Gender == 2) {
			                this.ladydoctors.push(element);
			                this.ladydocComplex.push(element);
			                this.aaa.loadingHide('loadingid');
			              }			               
			            });         		  		
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
  	searchladydoctor(form){

  	} 
  	sanitization(val)
	{
	    return this.us.sanitizeURLParam(val);
	}

}
