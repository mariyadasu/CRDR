import { Component, OnInit } from '@angular/core';
import { BookHealhCheckService } from '../services/book-health-check.service'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private bhc: BookHealhCheckService) { }

  ngOnInit() {
    this.getHealthChecks();
  }
  getHealthChecks() {
    this.bhc.getHealthChecks().subscribe(data => {
      //logic
    }, error => {
      //error logic
    })
  }


}
