import { Component, OnInit } from '@angular/core';
import { spGroupCityIndex } from '@aa/structures/city.interface';
import { DirectoriesService } from '@aa/services/directories.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { AAAuthService } from '@aa/services/auth.service';

@Component({
  selector: 'app-city-groupname-index',
  templateUrl: './city-groupname-index.component.html',
  styleUrls: ['./city-groupname-index.component.scss']
})
export class CityGroupnameIndexComponent implements OnInit {

  selectedOption: any;
  cityGroupIndex: spGroupCityIndex[];
  cityGrouplistFilter: any = {CityName: ''};
  citylistGroupComplex: any = [{CityName:''}];

  constructor(private cs:DirectoriesService,public aaa: AAAuthService) { }

  	ngOnInit() {
  		this.aaa.loadingShow('loadingid');
  		this.cs.getCityGroupnameIndexData().subscribe(
		      	(data: spGroupCityIndex[]) => {		      		      		
              this.cityGroupIndex = data; 
              this.citylistGroupComplex = data;
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
    searchCityGroup(form){

    }

}
