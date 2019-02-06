import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { BookingService } from '@aa/services/booking.service';

@Component({
  selector: 'directory-request-appointment',
  templateUrl: './directory-request-appointment.component.html',
  styleUrls: ['./directory-request-appointment.component.scss']
})
export class DirectoryRequestAppointmentComponent implements OnInit {

  DoctorId: string;
  Speciality: string;
  SpecialityId: string;
  City: string;
  CityId: number;
  requestSubmitted = false;

  constructor(
    private bs: BookingService,
    public modalRef: BsModalRef
  ) { }

  ngOnInit() { }

  submitAppointmentRequest(raf: NgForm) {
    console.log(raf);
    let params =
    {
      PatientName: raf.value.name, 
      Email: raf.value.email,
      MobileNo: raf.value.mobile,
      CityId: this.CityId,
      City: this.City,
      SpecialityId: this.SpecialityId,
      Speciality: this.Speciality,
      DoctorId: this.DoctorId,
    };

    this.bs.requestAppointment(params).subscribe(
      (data: any) => {
        this.requestSubmitted = true;
        console.log(data);
      }
    );
  }

}
