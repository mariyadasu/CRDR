import { Component, OnInit } from '@angular/core';
import { DirectoriesService } from '@aa/services/directories.service';
import { AAAuthService } from '@aa/services/auth.service';
import { medicalGlossaryIndex } from '@aa/structures/medical.interface';
import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-medical-glossary',
  templateUrl: './medical-glossary.component.html',
  styleUrls: ['./medical-glossary.component.scss']
})
export class MedicalGlossaryComponent implements OnInit {

  alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  default = 'all';
  activeclass:string = '';
  medicalindex: medicalGlossaryIndex[];  
  medicalFilter: any = {GlossaryShortName: ''};
  medicalComplex: any = [{GlossaryShortName:''}];

  constructor(private cs:DirectoriesService,
  		public aaa: AAAuthService,
      private commonService: CommonService) { }

  ngOnInit() {
    this.commonService.setPageTitle('Medical Glossary for Diseases and Complications (A-Z) - Ask Apollo');
    this.commonService.setPageDescription('Use our medical glossary of terms for Diseases and Complications from A to Z for better understanding. Visit Ask Apollo to know more!');
  	this.medicalglosary(this.default,'');
  }
  medicalglosary(event,i){
  	this.activeclass = i;
  	this.aaa.loadingShow('loadingid');
  		this.cs.getMedicalGlossaryIndexData(event).subscribe(
		      	(data: medicalGlossaryIndex[]) => {		      		      		
		      		this.medicalindex = data; 
              this.medicalComplex = data;
		      		this.aaa.loadingHide('loadingid');
				},
		      	err=> {
					this.aaa.loadingHide('loadingid');
					alert("something went wrong!");
				}
		    );
  }
  searchMedical(form){
  
  }
  onSelect(event)
  {
    console.log(event);
  }
}
