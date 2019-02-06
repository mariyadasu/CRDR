import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Subject } from 'rxjs/Subject';

import { constants } from './../constants';
import { Observable } from 'rxjs';
import { calendarTracker, appointmentSlotsTracker, appointmentSlot } from './../structures/calendar.tracker.interface';
import * as moment from 'moment';

@Injectable()
export class CalendarService {

  datesTracker = new Subject<calendarTracker>();
  dates: string[] = [];

  slotsTracker = new Subject<appointmentSlotsTracker>();

  constructor(private httpClient: HttpClient) { }

  getDocDates(hospital: string, docId: number, hosId: number) {
    this.httpClient.get(constants.BaseApiurl + 'api/eDocConsultation/GetAllConsulationAppointmentDatesByDoctorIdAndHospitalId' + '/' + hospital + '/' + docId).subscribe(
      (data) => {
        if(data != '')
        {
          if (data[0].name != null) {
            this.dates = data[0].name.split(",");
            this.datesTracker.next({
              docId: docId,
              hosId: hosId,
              dates: this.dates.slice()
            });
          }
          else
          {
             this.datesTracker.next({
                docId: docId,
                hosId: hosId,
                dates: []
              });   
          }
        }
        else
        {
          this.datesTracker.next({
            docId: docId,
            hosId: hosId,
            dates: []
          });
        }
      }
    );
  }

  addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  getDocTimesC(currentDaySlotsSample: any[]): Observable<any> {
    let currentDaySlots: any[] = [];
    currentDaySlotsSample.forEach(element => {
      let today = new Date();
      let todaydate = moment(today).format('DD-MM-YYYY')
      if (todaydate == element.Apdate) {
        let hh = element.SlotTime.split('-')[0].split(':')[0];
        let mm = element.SlotTime.split('-')[0].split(':')[1];

        let h = this.addZero(today.getHours());
        let m = this.addZero(today.getMinutes() + 15);
        if (h < hh) {
          currentDaySlots.push(element);
        }
        else if (h == hh) {
          if (m < mm) {
            currentDaySlots.push(element);
          }
        }
      }
      else {
        currentDaySlots.push(element);
      }
    });
    return Observable.of(currentDaySlots);
  }

  getDocDatesCc(hospital: string, docId: number, hosId: string, days: any, ConsultationType: string): Observable<any> {
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";


    var date = new Date()
    if (ConsultationType == "Specialist") {
      date.setDate(date.getDate() + 1);
    }
    var dates = "";
    for (var i = 0; i < 13; i++) {

      var dd = date.getDate();
      var mm = date.getMonth();
      var y = date.getFullYear();
      var dN = date.getDay();
      var day = weekday[dN];
      if (days.indexOf(day) != -1) {
        var someFormattedDate = dd + '/' + mm + '/' + y;
        //dates.push(someFormattedDate);
        dates = dates + someFormattedDate + ",";

      }
      date.setDate(date.getDate() + 1);

    }
    if (dates != "") {
      dates = dates.substring(0, dates.length - 1);
      this.dates = dates.split(',');
    } else {
      this.dates = [];
    }


    return Observable.of([
      {
        "docId": docId,
        "hosId": hosId,
        "dates": this.dates.slice()
      }
    ]);


  }

  getDocDatesC(hospital: string, docId: number, hosId: string, days: any): Observable<any> {
    
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";


    var date = new Date()
     date.setDate(date.getDate() + 1);
    var dates = "";
    for (var i = 0; i < 13; i++) {

      var dd = date.getDate();
      var mm = date.getMonth();
      var y = date.getFullYear();
      var dN = date.getDay();
      var day = weekday[dN];
      if (days.indexOf(day) != -1) {
        var someFormattedDate = dd + '/' + mm + '/' + y;
        //dates.push(someFormattedDate);
        dates = dates + someFormattedDate + ",";
       
      }
       date.setDate(date.getDate() + 1);

    }
    if (dates != "") {
      dates=dates.substring(0,dates.length-1);
      this.dates = dates.split(',');
    } else {
      this.dates = [];
    }


    return Observable.of([
      {
        "docId": docId,
        "hosId": hosId,
        "dates": this.dates.slice()
      }
    ]);


  }

  getDocSlotsDate(docId: number, hospital: string, date: string) {
    this.httpClient.get(constants.BaseApiurl + 'api/eDocConsultation/GetAvailableConsulationSlotsByDoctorIdAndHospitalIdAndAppDate' + '/' + docId + '/' + hospital + '/' + date).subscribe(
      (data) => {
        this.slotsTracker.next({
          docId: docId,
          date: date,
          morningSlots: <appointmentSlot[]>data['morningSlotTime'],
          afternoonSlots: <appointmentSlot[]>data['afternoonSlotTime'],
          eveningSlots: <appointmentSlot[]>data['eveningSlotTime'],
          nightSlots: <appointmentSlot[]>data['nightSlottTime'],
          morningSlotRequestApptEnabled: data['morningSlotRequestApptEnabled'],
          afternoonSlotRequestApptEnabled: data['afternoonSlotRequestApptEnabled'],
          eveningSlotRequestApptEnabled: data['eveningSlotRequestApptEnabled'],
          nightSlotRequestApptEnabled: data['nightSlotRequestApptEnabled'],
        });
      }
    );
  }
  
  getDocSlotsDateC(docId: string, date: string,zone:string): Observable<any> {
    
    let apiEndpoint = constants.OCApiUrl + 'GetSlotsByDoctorIdandDateForSourceApp';
    let params = 
    // {
    //   'AdminId': constants.AdminId,
    //   'AdminPassword': constants.AdminPassword,
    //   'EdocDoctorId': docId,
    //   'Date': date,
    //   'sourceApp': constants.OCSourceApp,
    // }
    {

      "AdminId": constants.AdminId,
      "AdminPassword": constants.AdminPassword,
      "EdocDoctorId": docId.toString(),  
      "Date": date,    
      "timezone":zone,  
      "sourceApp": constants.OCSourceApp
    
    }

    return this.httpClient.post<any>(apiEndpoint, params);

    
  }

}
