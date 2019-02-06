import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { UtilsService } from '@aa/services/utils.service';
import { AAAuthService } from '@aa/services/auth.service';


@Component({
  selector: 'app-navya-post-login',
  templateUrl: './navya-post-login.component.html',
  styleUrls: ['./navya-post-login.component.scss']
})
export class NavyaPostLoginComponent implements OnInit {

  iFrameUrl = '';
  
  constructor(
    private us: UtilsService,
    private aaa: AAAuthService,
    private sanitizer: DomSanitizer,
    private router: Router) { }

  ngOnInit() {
debugger;
    this.us.setActiveTab(this.us.TAB_CANCER_CARE);
    this.iFrameUrl =localStorage.getItem('navyaUrl');// this.aaa.navyaUrl;

    if(this.iFrameUrl == '') {
      this.router.navigate(['/']);
    }else{
      console.log('iframe trigger');
      this.aaa.gotoNavyaInjector();
    }
    //window.location.href=window.location.href;
  }

  getiFrameUrl() {
    // console.log(this.iFrameUrl);
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.iFrameUrl);
  }

}
