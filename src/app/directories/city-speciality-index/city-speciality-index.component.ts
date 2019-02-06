import { Component, OnInit } from '@angular/core';
import { spCityIndex } from '@aa/structures/city.interface';
import { DirectoriesService } from '@aa/services/directories.service';
import { AAAuthService } from '@aa/services/auth.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-city-speciality-index',
  templateUrl: './city-speciality-index.component.html',
  styleUrls: ['./city-speciality-index.component.scss']
})
export class CitySpecialityIndexComponent implements OnInit {
  
  selectedOption: any;
  specialityCityIndex: spCityIndex[];
  citylistFilter: any = {CityName: ''}; 
  citylistComplex: any = [{CityName:''}];

   constructor(private cs:DirectoriesService,
  		public aaa: AAAuthService,
      private commonService: CommonService) { }

  	ngOnInit() {
      this.commonService.setPageTitle('List of all Speciality Doctors in Different Cities - Ask Apollo');
      this.commonService.setPageDescription('Get a complete list of all speciality doctors in different cities practicing in Apollo Hospitals. Find best speciality doctors near you and book appointments.');

  		this.aaa.loadingShow('loadingid');
  		this.cs.getCitySpecialityIndexData().subscribe(
		      	(data: spCityIndex[]) => {		      		      		
		      		this.specialityCityIndex = data; 
              this.citylistComplex = data;
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
    searchCitySpeciality(form){

    }

}
