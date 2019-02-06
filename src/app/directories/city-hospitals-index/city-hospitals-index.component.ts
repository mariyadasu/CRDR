import { Component, OnInit } from '@angular/core';
import { cityHospitalIndex } from '@aa/structures/city.interface';
import { DirectoriesService } from '@aa/services/directories.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { CommonService } from '@aa/services/common.service';
import { AAAuthService } from '@aa/services/auth.service';

@Component({
  selector: 'app-city-hospitals-index',
  templateUrl: './city-hospitals-index.component.html',
  styleUrls: ['./city-hospitals-index.component.scss']
})
export class CityHospitalsIndexComponent implements OnInit {

    selectedOption: any;
    cityHosIndex: cityHospitalIndex[];
    cityHoslistFilter: any = {CityName: ''};
    citylistHosComplex: any = [{CityName:''}];
 
    constructor(private cs:DirectoriesService,
  		private commonService: CommonService,
      public aaa: AAAuthService) { }

  	ngOnInit() {
      this.commonService.setPageTitle('City Wise List of Apollo Hospitals & Clinics in India - Ask Apollo');
        this.commonService.setPageDescription('Find the city wise list of Apollo Hospitals and clinics in India. Book an appointment today at a hospital near you through Ask Apollo.');
  		this.aaa.loadingShow('loadingid');
  		this.cs.getCityHospitalIndexData().subscribe(
		      	(data: cityHospitalIndex[]) => {		      		      		
		      		this.cityHosIndex = data; 
                    this.citylistHosComplex = data;
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
    searchCityHospital(form){

    }

}
