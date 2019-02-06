import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders,HttpErrorResponse } from '@angular/common/http';
import { UtilsService } from '@aa/services/utils.service';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {

  constructor(private router: Router,private http: HttpClient,private us: UtilsService) { }

  ngOnInit() 
  {
    this.us.setActiveTab(1);
  	this.router.navigate(['/404']);
  }

}
