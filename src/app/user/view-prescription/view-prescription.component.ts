import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '@aa/services/user.service';
import { AAAuthService } from '@aa/services/auth.service';
import { UserInfo, aaToken, OCUserInfo, Clarification, DownloadPrescription, PrescriptionDetails, Attachments } from '@aa/structures/user.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { constants as c } from './../../constants';

@Component({
  selector: 'app-view-prescription',
  templateUrl: './view-prescription.component.html',
  styleUrls: ['./view-prescription.component.scss']
})
export class ViewPrescriptionComponent implements OnInit {
	res: any;
	prescriptionDetails: PrescriptionDetails = {} as PrescriptionDetails;
  attachments: Attachments = {} as Attachments;
	visitIdSubscription: Subscription;
	visitId: string;
	response:any;
  	constructor(private us: UserService,
    private auth: AAAuthService,
    private router: Router) 
    { 

    }

  	ngOnInit() 
  	{
      // get the visit id  -- start

      this.visitIdSubscription = this.us.currentVisitedId.subscribe(
        (value) => {
          this.visitId = value;
        }
      );
      if(!this.visitId)
      {
        this.router.navigate(['/my/dashboard-oc']);
      }
      // get the visit id  -- end
  		
	    this.auth.loadingShow('loadingid');
	    this.us.getPrescriptionDetails(this.visitId) //ex : 6264
	        .subscribe(cdata => {            
	            this.auth.loadingHide('loadingid');
	            this.response = cdata;
	            this.prescriptionDetails = JSON.parse(this.response.Result);
	      }, err => {
	          this.auth.loadingHide('loadingid');
	          //alert('Something went wrong');
	          console.log(err);
	      });
	    // get the prescription data  -- end
      // get the attachments data  -- start
      this.auth.loadingShow('loadingid');
      this.us.getAttachmentss(this.visitId) //ex : 6264
          .subscribe(cdata => {            
              this.auth.loadingHide('loadingid');
              this.response = cdata;
              this.attachments = JSON.parse(this.response.Result);
        }, err => {
            this.auth.loadingHide('loadingid');
            //alert('Something went wrong');
            console.log(err);
        });
      // get the attachments data  -- end
  	}
    /*
    *  View prescription
    */
    viewPrescription(fileDetails)
    {
      //var url = c.viewDocument + fileDetails.VisitId + '/'+ fileDetails.DocumentId + '/' + fileDetails.FileName;
      if(fileDetails.Description=="FinalPrescription")
      {
       let x =JSON.parse(localStorage.getItem("dataForPris"))
       var url = c.downloadPrescriptionUrl + "?appid=" + x.AppointmentId + "&visitid=" + x.VisitId + "&uhid=" + x.Uhid + "&user=Patient&PatientName=" + x.PatientName;
      }
      else{
       var url = c.viewDocument + fileDetails.VisitId + '/'+ fileDetails.DocumentId + '/' + fileDetails.FileName;
      }
      window.open(url, '_blank');
    }
  	ngOnDestroy() 
  	{
    	this.visitIdSubscription.unsubscribe();
    }
}
