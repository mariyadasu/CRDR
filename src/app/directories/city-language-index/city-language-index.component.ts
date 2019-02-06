import { Component, OnInit } from '@angular/core';
import { clanguageIndex } from '@aa/structures/city.interface';
import { DirectoriesService } from '@aa/services/directories.service';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { ErrlogService } from '@aa/services/errlog.service';
import { CommonService } from '@aa/services/common.service';
import { AAAuthService } from '@aa/services/auth.service';

@Component({
  selector: 'app-city-language-index',
  templateUrl: './city-language-index.component.html',
  styleUrls: ['./city-language-index.component.scss']
})
export class CityLanguageIndexComponent implements OnInit {
  selectedOption: any;
  citylanguages: clanguageIndex[];
  citylanguageFilter: any = {CityName: ''};
  citylanguageComplex: any = [{CityName:''}];

  constructor(private cs:DirectoriesService,
  		public aaa: AAAuthService,
      private errLog: ErrlogService,
      private commonService: CommonService) 
  { 

  }

  ngOnInit() 
  {
    this.commonService.setPageTitle('City wise list of doctors speaking different languages - Ask Apollo');
    this.commonService.setPageDescription('Get city wise list of doctors speaking different languages. Book an instant appointment with doctors at Ask Apollo. View their profile and feedback.');

		this.aaa.loadingShow('loadingid');
		this.cs.getCityLanguageIndex().subscribe(
	    (data: clanguageIndex[]) => {		      		      		
        this.aaa.loadingHide('loadingid');
    		this.citylanguages = data;
    		this.citylanguageComplex = data; 
    		
		},
	    err=> {
				this.aaa.loadingHide('loadingid');
        this.errLog.log('directories/city-language-index.component.ts','ngOnInit()',err);
				alert("something went wrong!");
			}
	  );
  }
  onSelect(event: TypeaheadMatch): void 
  {
    this.selectedOption = event.item;
  } 
  searchCityLanguage(form)
  {

  }

}
