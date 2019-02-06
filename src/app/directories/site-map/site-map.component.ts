import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { CommonService } from '@aa/services/common.service';
import { SearchService } from '@aa/services/search.service';

import { city } from '@aa/structures/city.interface';
import { trend } from '@aa/structures/city.interface';
import { UtilsService } from '@aa/services/utils.service';

@Component({
  	selector: 'app-site-map',
  	templateUrl: './site-map.component.html',
  	styleUrls: ['./site-map.component.scss']
})
export class SiteMapComponent implements OnInit {

  	getCityTrackerSub: Subscription;
	currentCity = '';
	trends: trend[]; 
	citiesTrackerSub: Subscription;
	cities: city[] = [];
  	constructor(private cs: CommonService,
    			private ss: SearchService,
    			private us: UtilsService,) 
  	{ 

  	}

  	ngOnInit() 
  	{
  		this.currentCity = this.ss.getSelectedCity().name.toLowerCase();

	    this.getCityTrackerSub = this.ss.selectedCityTracker.subscribe(
	      (c: city) => {
	        this.currentCity = c.name.toLowerCase(); 
	        this.ss.getSidebarLinks4DoctorSearchCity(this.currentCity.toString()); 
	      }
	    )
	    this.ss.trendsTracker.subscribe(
	      (trends: trend[]) => {
	        this.trends = trends;
	      }
	    );
	    if(this.currentCity)
	    {
	    	this.ss.getSidebarLinks4DoctorSearchCity(this.currentCity.toString()); 
	    }
	    else
	    {
	    	// Subscribe to 'Get All Cities'
		     this.ss.getAllCities();
	    	// Subscribe to 'Get All Cities'
		    this.citiesTrackerSub = this.ss.citiesTracker.subscribe(
		      (cities: city[]) => {
		        this.cities = cities;
		        this.cs.saveCitiesList(this.cities);
		        this.cities=this.cities.slice(0,5);
		      }
		    );
	    }

  	}
  	/*
  	*	Send app link
  	*/
  	pn = '';
	sendAppLink() 
	{
		if (this.pn.length != 10)
	    {
	        alert('Please enter a valid 10 digit number: ' + this.pn);
	    }
	    else 
	    {
	      this.cs.sendAppLinkToMobile(this.pn);
	      this.pn = '';
	    }
	}
	ngOnDestroy() 
   	{
    	this.getCityTrackerSub.unsubscribe();
    	//this.citiesTrackerSub.unsubscribe();
   	}
   	sendAppLinkEnter()
  	{
    	this.sendAppLink();
  	}
  	removeSpaces(keyword: string) 
	{
	    return this.us.removeSpaces(keyword);
	}
}
