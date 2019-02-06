import { Component, OnInit, Input } from '@angular/core';

import { BookingService } from '@aa/services/booking.service';
import { CommonService } from '@aa/services/common.service';

import { currentAppointment, patientInfo } from '@aa/structures/calendar.tracker.interface';
import {  BsLocaleService } from 'ngx-bootstrap/datepicker';
interface country {
  id: number,
  name: string;
}

interface state {
  id: number,
  name: string;
}

interface district {
  id: number,
  name: string;
}

interface city {
  id: number,
  name: string;
}

@Component({
  selector: 'app-register-uhid',
  templateUrl: './register-uhid.component.html',
  styleUrls: ['./register-uhid.component.scss']
})
export class RegisterUhidComponent implements OnInit {

  @Input() ca: currentAppointment;
  pi: patientInfo;

  salutations = ['Mr.', 'Mrs.', 'Miss'];
  selectedSalutation: string;

  guardians = ['Mother', 'Father', 'Spouse', 'Other'];
  selectedGuardian: string;

  statuses = ['Married', 'Unmarried'];
  maritalStatus: string;

  countries: country[] = [];
  selectedCountry: country = { id: -1, name: 'Select Country' };

  states: state[] = [];
  selectedState: state = { id: -1, name: 'Select State' };

  districts: district[] = [];
  selectedDistrict: district = { id: -1, name: 'Select District' };

  cities: city[] = [];
  selectedCity: city = { id: -1, name: 'Select City' };
  maxDate=new Date();
  constructor(private bs: BookingService,
    private cs: CommonService,
    private bsLocaleService: BsLocaleService) {
      this.bsLocaleService.use('en-gb');
     }

  ngOnInit() {
    this.pi = this.bs.getPatientInfo();

    this.selectedSalutation = this.salutations[0];
    this.selectedGuardian = this.guardians[0];
    this.maritalStatus = this.statuses[0];

    this.cs.getAllCountriesHOPE()
      .map((response: any[]) => {
        return response.map(
          (element) => {
            return { id: element.id, name: element.name }
          })
      })
      .subscribe(
        (countries: country[]) => {
          this.countries = countries;
          let fc = this.countries.filter(
            (c: country) => {
              return c.name.toLowerCase() == "india";
            })
          this.setCountry((fc.length > 0) ? fc[0] : this.countries[0]);
        });
  }

  setSalutation(s: string) {
    this.selectedSalutation = s;
  }

  setGuardian(g: string) {
    this.selectedGuardian = g;
  }

  setCountry(c: country) {
    this.selectedCountry = c;
    this.states = [];
    this.selectedState = { id: -1, name: 'Select State' };
    this.getStates();
  }

  getStates() {
    this.cs.getAllStatesHOPE(this.selectedCountry.id)
      .map((response: any[]) => {
        return response.map(
          (element) => {
            return { id: element.id, name: element.name };
          });
      })
      .subscribe(
        (states: state[]) => {
          this.states = states;
        }
      );
  }

  setState(s: state) {
    this.selectedState = s;
    this.districts = [];
    this.selectedDistrict = { id: -1, name: 'Select District' };
    this.getDistricts();
  }

  getDistricts() {
    this.cs.getAllDistrictsHOPE(this.selectedState.id)
      .map((response: any[]) => {
        return response.map(
          (element) => {
            return { id: element.id, name: element.name };
          });
      })
      .subscribe(
        (districts: district[]) => {
          this.districts = districts;
        }
      );
  }

  setDistrict(d: district) {
    this.selectedDistrict = d;
    this.cities = [];
    this.selectedCity = { id: -1, name: 'Select City' };
    this.getCities();
  }

  getCities() {
    this.cs.getAllCitiesByDistrictHOPE(this.selectedDistrict.id)
      .map((response: any[]) => {
        return response.map(
          (element) => {
            return { id: element.id, name: element.name };
          }
        )
      })
      .subscribe(
        (cities: city[]) => {
          this.cities = cities;
        }
      );
  }

  setCity(c: city) {
    this.selectedCity = c;
  }

  setMaritalStatus(status: string) {
    this.maritalStatus = status;
  }

}
