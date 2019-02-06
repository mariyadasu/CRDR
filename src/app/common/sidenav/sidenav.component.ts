import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AAAuthService } from './../../services/auth.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '@aa/services/user.service';
import { UserInfo, aaToken, OCUserInfo } from '@aa/structures/user.interface';
import {
  Router
} from '@angular/router';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  signedIn: boolean;
  firstName = '';
  loginStatusTrackerSub: Subscription;

  ocUserSubscription = new Subscription;
  imageUrl:String='';
  ocUserInfo: OCUserInfo = {} as OCUserInfo;
  public errorMessage: string = '';
  imageData: any;
  url: any;
  res : any;

  subscription: Subscription;


  constructor(private aaa: AAAuthService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private userService: UserService) {

  }
  image: String = '';
  leftNavStatus: string;

  ngOnInit() 
  {
    this.subscription = this.userService.isLeftNavClosed.subscribe(
      (message) => {
        this.leftNavStatus = message;
      }
    );



    this.signedIn = this.aaa.getSessionStatus();
    this.firstName = this.aaa.getFirstName();
    //this.image=this.aaa.getImage();
    
    this.loginStatusTrackerSub = this.aaa.sessionStatusTracker.subscribe(
      (status: boolean) => {
        // console.log('Received Broadcast. Why the fuck is this not moving then?');
        // console.log(this.aaa.getuserInfo());
        this.signedIn = status;
        this.firstName = status ? this.aaa.getFirstName() : '';
        this.cd.detectChanges();
      });

    // get the user data -- start
    if(this.userService.userInfo.AuthTokenForPR!=null)
      this.userService.getOCUserDetails();
      //this.imageUrl=this.aaa.getImage();

      this.ocUserSubscription = this.userService.ocUserTracker.subscribe(
          (data) => {
            this.res = data;
            if(this.res.ResponceCode == 6) 
            {
              this.aaa.logoutUser();
            }
            if(this.res.ResponceCode == 0) 
            {
              this.ocUserInfo = JSON.parse(this.res.Result)[0];
              if (this.ocUserInfo.Photocontent) 
              {
                this.imageData = 'data:image/jpg;base64,' + this.ocUserInfo.Photocontent;
                this.imageUrl = this.imageData;
              }
              else 
              {
                this.imageUrl = 'assets/dummy-user.jpg';
              }
            }
            else
            {
              console.log(this.res.Result);
              //alert('Unable to get the user details.');
            }
          },(err) => {
              console.log(err);
          }
        );

      // get the user data  -- end
  }
  navigateProfile() {
    this.router.navigate(['/my/profile']);
  }
  ngOnDestroy() {
    this.loginStatusTrackerSub.unsubscribe();
    //this.subscription.unsubscribe();

  }

  logout() {
    this.aaa.logoutUserSideNav();
    location.href = '/';
  }
  closeSideNav()
  {
    this.aaa.headerSuggesionTracker('');
    this.userService.changeLeftNavStatus('1');
  }
}
