import { Component, OnInit } from '@angular/core';
import { SearchService } from '@aa/services/search.service';
import { ActivatedRoute } from '@angular/router';
import { hospitalInformation } from '@aa/structures/hospital.interface';
import { Subscription } from 'rxjs/Subscription';
import { doctor,docPageTitleandDescription } from '@aa/structures/doctor.interface';
import { CommonService } from '@aa/services/common.service';
import { trend } from '@aa/structures/city.interface';
import { UtilsService } from '@aa/services/utils.service';


@Component({
  selector: 'app-hospital-information',
  templateUrl: './hospital-information.component.html',
  styleUrls: ['./hospital-information.component.scss']
})
export class HospitalInformationComponent implements OnInit {

  text = "&nbsp;&nbsp;";
  public city: string;
  public hospital: string;
  hospitalInformations: hospitalInformation[];
  displayhospitalname :string;
  filtersApplied: { name: string, value: any }[] = [];
  docTrackerSub = new Subscription;
  doctors: doctor[] = [];
  doctorsPaginated: doctor[] = [];
  gettingDataFromServer = true;
  availableLanguages = [];
  trends: trend[]; 
  displayname: string;
  workingType: string;
  noOfBeds: string;
  yearsOfEstablishment: string;
  facebookLink:string;
  twitterLink:string;
  gPlusLink:string;
  linkedinLink:string;
  paymentModes:string;
  hospitalName:string;
  mobileNumber:string;
  address:string;
  otherCenter:string;
  aboutHospital:string;
  amenities:string;

  constructor(private srs: SearchService,private route: ActivatedRoute,private cs: CommonService,private us: UtilsService) { } 

  ngOnInit() {
    this.city = this.route.snapshot.paramMap.get('city');
    this.hospital = this.route.snapshot.paramMap.get('hospital');    

    this.srs.getHospitalInformation(this.city,this.hospital).subscribe(
        (hospitalInformations: hospitalInformation[]) => {                        
          this.hospitalInformations = hospitalInformations; 
          this.displayname = this.hospitalInformations['DisplayHospitalName']; 
          this.workingType = this.hospitalInformations['WorkingType']; 
          this.noOfBeds = this.hospitalInformations['NoOfBeds']; 
          this.yearsOfEstablishment = this.hospitalInformations['YearsOfEstablishment']; 
          this.facebookLink = this.hospitalInformations['FacebookLink']; 
          this.twitterLink = this.hospitalInformations['TwitterLink']; 
          this.gPlusLink = this.hospitalInformations['GPlusLink']; 
          this.linkedinLink = this.hospitalInformations['LinkedinLink'];
          this.paymentModes = this.hospitalInformations['PaymentModes'];
          this.hospitalName = this.hospitalInformations['HospitalName'];
          this.mobileNumber = this.hospitalInformations['objHospitalInfoContactTab']['MobileNumber'];
          this.address = this.hospitalInformations['objHospitalInfoContactTab']['Address'];
          this.aboutHospital = this.hospitalInformations['objHospitalInfoOverviewTab']['AboutHospital'];
          this.amenities = this.hospitalInformations['objHospitalInfoOverviewTab']['Amenities'];
          this.otherCenter = this.hospitalInformations['lstHospitalInfoOtherCenterTab'];
         
    },
        err=> {
      alert("something went wrong!");
    }
    );
    this.srs.getDocsCityHospital(this.city, this.hospital,this.filtersApplied);
      this.docTrackerSub = this.srs.doctorListTracker.subscribe(
      (docs: doctor[]) => {
        //debugger;
        this.gettingDataFromServer = false;
        this.doctors = docs;
        this.doctorsPaginated = this.doctors.slice(0, 11);
        for (let d of this.doctorsPaginated) {
          d.ApiServicesBosShort = d.ApiServicesBos.slice(0, 2);
        }

        // In More Filters, the list of languages should be extracted from those available in the current search list
        // So, get all the available languages and then strip out duplicated using the filter method
        docs.forEach(element => {
          this.availableLanguages.push(...element.LanguagesKnown.split(','));
        });
        this.availableLanguages = this.availableLanguages.filter((x, i, a) => a.indexOf(x) == i)

      }
    );
    this.srs.getSidebarLinks4DoctorSearchCity(this.city);  
    this.srs.trendsTracker.subscribe(
      (trends: trend[]) => {
        this.trends = trends;
      }
    );

  }
  pn = '';
  sendAppLink() {
    if (this.pn.length != 10) alert('Please enter a valid 10 digit number: ' + this.pn);
    else this.cs.sendAppLinkToMobile(this.pn);
  }
  sendAppLinkEnter()
    {
      this.sendAppLink();
    }
  removeSpaces(keyword: string) 
  {
    return this.us.removeSpaces(keyword);
  }
  
}
