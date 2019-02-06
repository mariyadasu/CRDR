import { Component, OnInit, ViewEncapsulation, TemplateRef, ViewChild } from '@angular/core';
import { constants as c } from './../constants';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilsService } from '@aa/services/utils.service';
import { CommonService } from '@aa/services/common.service';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import {
    Router, Params, UrlTree, UrlSegmentGroup, NavigationEnd,
    UrlSegment, PRIMARY_OUTLET, ActivatedRoute
} from '@angular/router';

import { SignupHealthLibraryComponent } from './../user/signup/health-library/signup.component';
import { AAAuthService } from '@aa/services/auth.service';

@Component({
    selector: 'health-library',
    templateUrl: './health-library.component.html',
    styleUrls: ['./health-library.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class HealthLibrary implements OnInit {
    healthLibraryUri: string = '';

    urlTree: UrlTree;
    urlSegmentGroup: UrlSegmentGroup;
    urlSegments: UrlSegment[];

    modalRef: BsModalRef;
    modalRef1: BsModalRef;

    @ViewChild('guestLoginErrorPopup') public guestLoginErrorPopup: TemplateRef<any>;

    constructor(private sanitizer: DomSanitizer,
        private us: UtilsService,
        private cs: CommonService,
        private router: Router,
        private aaa: AAAuthService,
        private modalService: BsModalService) {
    }

    ngOnInit()
    {
        this.urlTree = this.router.parseUrl(this.router.url);
        this.urlSegmentGroup = this.urlTree.root.children[PRIMARY_OUTLET];
        this.urlSegments = this.urlSegmentGroup.segments;
        let str = this.urlSegments[0].toString();
        if(this.urlSegments.length == 2)
            var str1 = this.urlSegments[1].toString();

        if(str1 == 'signin')
        {
            if(this.aaa.getSessionStatus()) // user is loggedin using social login
            {
                console.log('User Information');
                console.log(this.aaa.getuserInfo());
                //alert('User is LoggedIn');
            }
            else // User is not loggedin using social login
            {
                // Check for guest login
                let authName = localStorage.getItem('authName');

                if (authName != undefined && authName != null && authName != '')
                {
                     console.log('Guest Login');
                     this.modalRef1 = this.modalService.show(this.guestLoginErrorPopup);
                } // user not yet all login
                else
                {
                    this.openSignupPopup();
                }

                console.log('User Information NOt signin');
                console.log(this.aaa.getuserInfo());
            }
        }

       this.us.setActiveTab(this.us.TAB_HEALTH_LIBRARY);
        this.healthLibraryUri = c.healthLibraryIframeUri;

    }
    confirm(): void 
    {
        console.log('LOgout Guest Login and Open Social Login');
        this.aaa.setSessionStatusForAuth(false);
        localStorage.removeItem('loginType');
        localStorage.removeItem('loginUserIdForGuest');
        localStorage.setItem('authName', '');

        this.modalRef1.hide();
        this.openSignupPopup();
    }
 
    decline(): void 
    {
        console.log('Cancel confirmation Guest');
        this.modalRef1.hide();
    }

    // open signup popup
    openSignupPopup()
    {
        localStorage.setItem('loginedirect', 'N');
        this.aaa.loadingHide('loadingid');
        let config = {
          keyboard: false,
          backdrop: false,
          ignoreBackdropClick: true
        };
        this.modalRef = this.modalService.show(SignupHealthLibraryComponent, config);
    }
    getHealthLibraryUri() {
        return this.sanitizer.bypassSecurityTrustResourceUrl(this.healthLibraryUri);
    }
    // Testing purpose
    hlIframeTest()
    {
        alert('Gopal');
    }
}
