import { Component, OnInit } from '@angular/core';
import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  constructor(private commonService: CommonService) { }

  ngOnInit() {
  	this.commonService.setPageTitle('Contact Us, Customer Support & Helpline Services – Ask Apollo');
    this.commonService.setPageDescription('Reach out to best medical professionals at Ask Apollo. Contact us for more details, queries or to book appointments online.');
  }

}
