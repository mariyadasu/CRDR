import { Component, OnInit, TemplateRef } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { UtilsService } from './../services/utils.service';
import { CommonService } from '@aa/services/common.service';
import { SearchService } from '@aa/services/search.service';

import { city } from '@aa/structures/city.interface';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  //currentCity = 'hyderabad';
  currentCity = '';
  pn = '';

  modalRef: BsModalRef;

  id = 'pAARTdnGUeA';
  private player;
  private ytEvent;

  constructor(
    private us: UtilsService,
    private cs: CommonService,
    private ss: SearchService,
    private router: Router,
    private modalService: BsModalService,) { }

  ngOnInit() {
    this.us.setActiveTab(this.us.TAB_PHYSICAL_APPOINTMENT);
    this.cs.setShowMobileNoInLoginFlow(false);
    
    this.cs.setPageTitle("Top Doctors at Apollo Hospitals. Book Appointment Now | AskApollo");
    this.cs.setPageDescription('We have the Top Specialists across departments at Apollo ' 
      + 'Hospitals. Consult with the best doctor practicing with Apollo Hospitals near you, ranked among the ' 
      + ' best hospitals and clinics in India. Book an Instant Online Appointment Now through AskApollo.');

    this.currentCity = this.ss.getSelectedCity().name.toLowerCase();

    this.ss.selectedCityTracker.subscribe(
      (c: city) => {
        this.currentCity = c.name.toLowerCase();        
      }
    );

    this.cs.setCanonicallink(window.location.href);
  }
  doctorlink(speciality){
      this.router.navigate(['/india', this.us.sanitizeURLParam(speciality)]);
  }

  sendAppLink() {
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
  sendAppLinkEnter()
  {
    this.sendAppLink();
  }

  openVideo(template: TemplateRef<any>)
  {    
    this.cs.setGA('Consult Doctors Home Page','Physical Consultations Home Page','Physical Consultation_How it Works?','Physical Consultation _How it Works?');
    this.modalRef = this.modalService.show(template);
  }

}
