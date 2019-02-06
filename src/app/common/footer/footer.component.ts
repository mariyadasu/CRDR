import { Component, OnInit } from '@angular/core';
import { UtilsService } from '@aa/services/utils.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
	activeTab = this.us.TAB_PHYSICAL_APPOINTMENT;
  	constructor(public us: UtilsService,
  		private router: Router) 
  	{

  	}

  	ngOnInit() 
  	{
  		this.us.navigationTabTracker.subscribe(
	      (tab: number) => {
	        this.activeTab = tab;
	        //this.searchString = "";
	        /*if(this.activeTab == 2){
	          this.clearSearchString();
	        } */
	        //this.clearSearchString();      
	      }
	    );
  	}
		goToDoctorSearch(url,city)
  	{
      localStorage.setItem("SearchId", 'AskSpec_35');
      localStorage.setItem("SearchText", url);
      localStorage.setItem("CityId", '');

      localStorage.setItem("city", city);
      city = city.split(' ').join('-');
      city = city.toLowerCase();

      url = url.split(' ').join('-');
      url = url.toLowerCase();
			
      this.router.navigate(['/online-doctors-consultation/speciality/'+url+'/'+city]);
  	}
}
