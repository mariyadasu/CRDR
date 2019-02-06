import { Component, OnInit } from '@angular/core';
import { DirectoriesService } from '@aa/services/directories.service';
import {NgForm} from '@angular/forms';
import { AAAuthService } from '@aa/services/auth.service';
import { city } from '@aa/structures/city.interface';
import { CommonService } from '@aa/services/common.service';

@Component({
  	selector: 'app-city-index',
  	templateUrl: './city-index.component.html',
  	styleUrls: ['./city-index.component.scss']
})
export class CityIndexComponent implements OnInit {

	cities: city[];
	cityFilter: any = {id:'', name: '' };
	constructor(private cs:DirectoriesService,
  		public aaa: AAAuthService,
      private commonService: CommonService) 
  	{ 

  	}

  	ngOnInit() 
  	{
      this.commonService.setPageTitle('List of all Apollo Doctors in Different Cities in India - Ask Apollo');
        this.commonService.setPageDescription('Browse through a complete list of all Apollo doctors in different cities in India. Find a doctor in your city and book appointments online at Ask Apollo.');
  		this.aaa.loadingShow('loadingid');
  		this.cs.geCityIndexData().subscribe(
	      	(data: city[]) => {
	      		this.aaa.loadingHide('loadingid');
	      		this.cities = data;
	      	},
	      	err=> {
				this.aaa.loadingHide('loadingid');
				alert("something went wrong!");
			}
	    );
  	}
  	search(c)
  	{
  		console.log(c);
  	}
    removeSpaces(item) 
    {
        item = item.replace(/ /g, '-');
        item = item.replace(/%20/g, '-');
        return item.toLowerCase();
    }
}
