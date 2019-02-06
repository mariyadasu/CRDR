import { Component, OnInit } from '@angular/core';
import { spCityIndex } from '@aa/structures/city.interface';
import { DirectoriesService } from '@aa/services/directories.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { UtilsService } from '@aa/services/utils.service';
import { CommonService } from '@aa/services/common.service';
import { AAAuthService } from '@aa/services/auth.service';

@Component({
  selector: 'app-city-specialist-index',
  templateUrl: './city-specialist-index.component.html',
  styleUrls: ['./city-specialist-index.component.scss']
})
export class CitySpecialistIndexComponent implements OnInit {

  selectedOption: any;
  specialistCityIndex: spCityIndex[];
  citylistFilter: any = {CityName: ''};
  citylistComplex: any = [{CityName:''}];

  constructor(private cs:DirectoriesService,
  		public aaa: AAAuthService,
      private us: UtilsService,
      private commonService: CommonService) { }

  	ngOnInit() {
      this.commonService.setPageTitle('List of all Specialists in Different Hyper Locations - Ask Apollo');
      this.commonService.setPageDescription('Get complete list of all specialists in different hyper locations practicing in Apollo Hospitals. Find best specialists near you and book instant appointments.');

  		this.aaa.loadingShow('loadingid');
  		this.cs.getCitySpecialistIndexData().subscribe(
		      	(data: spCityIndex[]) => {		      		      		
		      		this.specialistCityIndex = data; 
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
    searchCitySpecialist(form){

    }
    sanitization(val)
    {
      return this.us.sanitizeURLParam(val);
    }

}
