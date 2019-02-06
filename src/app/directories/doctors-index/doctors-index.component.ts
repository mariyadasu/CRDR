import { Component, OnInit } from '@angular/core';
import { doctorsIndex } from '@aa/structures/doctor.interface';
import { DirectoriesService } from '@aa/services/directories.service';
import { AAAuthService } from '@aa/services/auth.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-doctors-index',
  templateUrl: './doctors-index.component.html',
  styleUrls: ['./doctors-index.component.scss']
})
export class DoctorsIndexComponent implements OnInit {
    
    selectedOption: any;
    doctors: doctorsIndex[];
    groupSelected: string;
    docComplex: any = [{FullName:''}];
    docFillter: any = {FullName:''};

  	constructor(private cs:DirectoriesService,
  		public aaa: AAAuthService,
      private commonService: CommonService) { }

  	ngOnInit() {
      this.commonService.setPageTitle('List of all Best Doctors in Apollo Hospitals - Ask Apollo');
      this.commonService.setPageDescription('Browse through a complete list of all best doctors in Apollo Hospitals across various cities. Find a doctor near your city and book appointments instantly!');
  		this.aaa.loadingShow('loadingid');
  		this.cs.getDoctorsIndex().subscribe(
		      	(data: doctorsIndex[]) => {		      		      		
		      		this.doctors = data; 
              this.docComplex = data;
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
    searchdoctor(form){

    }   
    
}
