import { Component, OnInit } from '@angular/core';
import { DirectoriesService } from '@aa/services/directories.service';
import { AAAuthService } from '@aa/services/auth.service';
import {NgForm} from '@angular/forms';

import { language } from '@aa/structures/language.interface';
import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-language-index',
  templateUrl: './language-index.component.html',
  styleUrls: ['./language-index.component.scss']
})
export class LanguageIndexComponent implements OnInit {

    languages: language[];
	langFilter: any = {LanguageName:''};
	constructor(private cs:DirectoriesService,
  		public aaa: AAAuthService,
      private commonService: CommonService){
	}

  	ngOnInit() 
  	{
      this.commonService.setPageTitle('Doctors speaking different languages in Apollo Hospitals - Ask Apollo');
      this.commonService.setPageDescription('Book an appointment online to consult doctors speaking different languages in Apollo Hospitals at Ask Apollo. View their profile, experience and feedback.');

  		this.aaa.loadingShow('loadingid');
  		this.cs.getLanguageIndexData().subscribe(
	      	(data: language[]) => {
	      		this.aaa.loadingHide('loadingid');
	      		this.languages = data;
	      	},
	      	err=> {
				this.aaa.loadingHide('loadingid');
				alert("something went wrong!");
			}
	    );
  	}
  	searchLanguage(form){
  	
  	}

}
