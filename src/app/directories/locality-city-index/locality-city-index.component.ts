import { Component, OnInit } from '@angular/core';
import { cityLocalityIndex } from '@aa/structures/city.interface';
import { DirectoriesService } from '@aa/services/directories.service';
import { AAAuthService } from '@aa/services/auth.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-locality-city-index',
  templateUrl: './locality-city-index.component.html',
  styleUrls: ['./locality-city-index.component.scss']
})
export class LocalityCityIndexComponent implements OnInit {

  selectedOption: any;
  cityLocalityIndex: cityLocalityIndex[];
  cityLocalistFilter: any = {CityName: ''};
  citylistLocalityComplex: any = [{CityName:''}];

  constructor(private cs:DirectoriesService,
  		public aaa: AAAuthService,
      private commonService: CommonService) { }

  	ngOnInit() {
      this.commonService.setPageTitle('List of Apollo Doctors in Hyper Locations - Ask Apollo');
      this.commonService.setPageDescription('Browse through a complete list of all Apollo Doctors in Diffrent Hyper Locations. Find a doctor in your city and book appointments online instantly!');
      
  		this.aaa.loadingShow('loadingid');
  		this.cs.getCityLocalityIndexData().subscribe(
		      	(data: cityLocalityIndex[]) => {		      		      		
		      		this.cityLocalityIndex = data; 
                    this.citylistLocalityComplex = data;
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
    searchCityLocality(form){

    }

}
