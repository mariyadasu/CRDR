import { Component, OnInit } from '@angular/core';
import { UtilsService } from '@aa/services/utils.service';

@Component({
  selector: 'book-health-check-booking',
  templateUrl: './book-health-check.component.html',
  styleUrls: ['./book-health-check.component.scss']
})
export class BookHealthCheckComponent implements OnInit {


  constructor(
    private us: UtilsService
  ) { }

  ngOnInit() {
    this.us.setActiveTab(this.us.TAB_BOOK_HEALTHCHECK);
  }

}
