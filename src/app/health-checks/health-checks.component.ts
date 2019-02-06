import { Component, OnInit } from '@angular/core';
import { AAAuthService } from '@aa/services/auth.service';
import { Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-health-checks',
  templateUrl: './health-checks.component.html',
  styleUrls: ['./health-checks.component.scss']
})
export class HealthChecksComponent implements OnInit {

 signedIn: boolean;
  constructor(private aaa: AAAuthService,private router: Router) { 

  	if (aaa.getSessionStatus()) {
      router.navigate(['/health-risk-questionnaire']);
    }

  }

  ngOnInit() {
  	// alert("aaa");
  	// this.signedIn = this.aaa.getSessionStatus();
  	// console.log(this.signedIn);
  	// if (this.signedIn){
  	// 	this.router.navigate(['/health-risk-questionnaire']);
  	// }
  }

}
