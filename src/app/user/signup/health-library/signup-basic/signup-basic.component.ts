import { UserInfo } from '@aa/structures/user.interface';
import { Component, OnInit, ViewEncapsulation, OnDestroy, TemplateRef, Input } from '@angular/core';
import { NgForm } from '@angular/forms';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap/modal';

import { AuthService } from "angular2-social-login";
import { AAAuthService } from '@aa/services/auth.service';
import { UtilsService } from '@aa/services/utils.service';

import { Router } from '@angular/router';
import { constants as c } from './../../../../constants';

import { CommonService } from '@aa/services/common.service';

@Component({
  selector: 'app-signup-basic-health-library',
  templateUrl: './signup-basic.component.html',
  styleUrls: ['./signup-basic.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SignupBasicHealthLibraryComponent implements OnInit, OnDestroy {

  sub: Subscription;

  modalRef: BsModalRef;
  activeTab = this.us.TAB_PHYSICAL_APPOINTMENT;
  showMobile: any = undefined;
  constructor(
    private router: Router,
    private us: UtilsService,
    private _auth: AuthService,
    private aaa: AAAuthService,
    private modalService: BsModalService,
    private cs: CommonService) { }

  ngOnInit()
  {
    //Canonical and Google Analytics
    this.cs.setCanonicallink(window.location.href);
    this.aaa.loadingHide('loadingid');
  }
  isTermsAccepted: boolean = true;

  signIn(provider)
  {
    this.cs.setGA('Health Check Library Login/Signup', 'Login/Signup', 'Health Check Library_Login/Signup', 'Login/Signup_<' + provider + '>');
    if (this.isTermsAccepted)
    {
      let nameSlice: string[];
      let ui = {} as UserInfo;
      this.aaa.loadingShow('loadingid');
      this.sub = this._auth.login(provider).subscribe(
        (data: any) => {
          console.log('-- Login Data -- ');
          console.log(data);
          this.aaa.loadingShow('loadingid');
          if (data.name != '' && !data.name && data.name != undefined && data.name != 'undefined')
          {
            nameSlice = data.name.split(" ");
            ui.firstName = (nameSlice.slice(0, nameSlice.length - 1)).join(" ");
            ui.lastName = nameSlice.length > 1 ? nameSlice[nameSlice.length - 1] : '';
          }
          else
          {
            ui.firstName = '';
            ui.lastName = '';
          }

          ui.SocialLoginId = data.uid;
          ui.SocialLoginType = provider == 'google' ? 'G' : 'F';

          if (data.email && data.email != '')
          {
            ui.email = data.email;
            ui.IsEmailVerified = "1";
            ui.imageUrl = data.image;
            this.aaa.setUserInfo(ui);
            this.aaa.processSocialLoginHealthLibrary(ui.SocialLoginType);
          }
          else
          {
            this.aaa.loadingHide('loadingid');
            this.aaa.setSignupStatus(2);
          }
        }
      )
    }
    else
    {
      alert('please accept terms & conditions');
    }
  }

  ngOnDestroy()
  {
    if (this.sub != null) this.sub.unsubscribe();
  }

  showtnc(tnc: TemplateRef<any>)
  {
    this.modalRef = this.modalService.show(tnc);
  }
}
