import { Component, OnInit } from '@angular/core';
import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-terms-of-use',
  templateUrl: './terms-of-use.component.html',
  styleUrls: ['./terms-of-use.component.scss']
})
export class TermsOfUseComponent implements OnInit {

  constructor(private commonService: CommonService) { }

  ngOnInit() {
  	this.commonService.setPageTitle('Terms of Use - Ask Apollo');
    this.commonService.setPageDescription('Terms & Conditions. Ask Apollo (services run by Apollo Hospitals Enterprise Limited) is providing online consultations with Apollo Hospitals.');
  }

}
