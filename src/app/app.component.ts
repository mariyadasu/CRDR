import { AAAuthService } from './services/auth.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { CommonService } from './services/common.service';
import { StoreService } from '@aa/services/store.service';
import { Router } from '@angular/router';
import { UserService } from '@aa/services/user.service';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Subscription } from 'rxjs/Subscription';

import { MatSidenav } from '@angular/material/sidenav';

declare var jquery: any;
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  isNavya = false;
  leftNavStatus: string = '1';
  subscription: Subscription;

  @ViewChild('sidenav') sidenav: MatSidenav;

  constructor(private cs: CommonService,
    private aaa: AAAuthService,
    private ss: StoreService,
    public router: Router,
    private userService: UserService) { }

  ngOnInit() {
    //http://askapollo.com
    //https://askapollo.com
    //http://www.askapollo.com
    //https://www.askapollo.com
    /*let doamin=window.location.hostname;
    let protcol=window.location.protocol;
    let website=protcol+"//"+doamin;
    let isLocal=this.aaa.getIsLocal();
    console.log("website"+ website);
    if(website!='https://www.askapollo.com' && !isLocal){
     window.location.href = "https://www.askapollo.com/";
    }*/

    // if (location.href.toString().indexOf('http://www') != 0) {
    //   window.location.href = location.href.replace('http://www', 'https://www');
    // }
    // else if (location.href.toString().indexOf('http:') != 0) {
    //   window.location.href = location.href.replace('http', 'https');
    // }
    // else if ((location.href.toString().indexOf('https://www.') != 0)) {
    //   window.location.href = location.href.replace('https', 'https://www.');
    // }
    //window.location.href = "https://www.askapollo.com/";
    this.subscription = this.userService.isLeftNavClosed.subscribe(
      (message) => {
        this.sidenav.toggle();
      }
    );


    // this.socket();
    this.cs.navyaIframeTracker.subscribe(
      (data) => this.isNavya = data
    )
    if (this.ss.getToken(this.ss.TOKEN_USER)) {
      this.aaa.setUserInfo(this.ss.getToken(this.ss.TOKEN_USER));

      //this.aaa.setSessionStatus(true);
    }
    if (this.ss.getToken(this.ss.TOKEN_AUTH_TOKEN)) {
      this.aaa.setSessionToken(this.ss.getToken(this.ss.TOKEN_AUTH_TOKEN));
    }
    //this.aaa.loadSocket();
  }
  acceptCall() {
    this.aaa.acceptCall();
  }
  rejectVideoCall() {
    this.aaa.rejectVideoCall();
  }
  closepopup() {

  }
  ngOnDestroy() {
    //this.subscription.unsubscribe();

  }
  closeAlertForIdle() {
    document.getElementById("autoLogout").style.display = "none";
    //this.demoServiceService.reset();
  }
}
