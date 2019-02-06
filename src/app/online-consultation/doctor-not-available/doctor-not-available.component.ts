import { Component, OnInit } from '@angular/core';
import { UtilsService } from '@aa/services/utils.service';

@Component({
  selector: 'app-doctor-not-available',
  templateUrl: './doctor-not-available.component.html',
  styleUrls: ['./doctor-not-available.component.scss']
})
export class DoctorNotAvailableComponent implements OnInit {

  constructor(private us: UtilsService) { }

  ngOnInit() {
    this.us.setActiveTab(this.us.TAB_ONLINE_CONSULTATION);
  }

}
