import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import * as m from 'moment';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class UtilsService {

  public TAB_PHYSICAL_APPOINTMENT = 1;
  public TAB_ONLINE_CONSULTATION = 2;
  public TAB_CANCER_CARE = 3;
  public TAB_HEALTH_LIBRARY = 4;
  public TAB_BOOK_HEALTHCHECK = 5;


  navigationTabTracker = new Subject<number>();

  constructor() { }

  sanitizeURLParam(param: string) {   
    if(param!=undefined){
    let sp = param.split(' ').join('-');
    sp = sp.split('&').join('and');
    return sp.toLocaleLowerCase();
    }
  }
  sanitizeURLParamC(param: string) {
    if(param!=undefined){
    let sp = param.split(' ').join('-');
    // sp = sp.split('&').join('and');
    // sp = sp.split('/').join('by');
    return sp.toLocaleLowerCase();
    }
  }
  searchText(param: string) {
    if(param!=undefined){
    let sp = param.split('-').join(' ');
    //sp = sp.split('and').join('&');
    //sp = sp.split('by').join('/');
    return sp.toLocaleLowerCase();
    }
  }
    toCamelCase(x:string){
    let data=x.split(" ");
    let city="";
    for(let i=0;i<data.length;i++)
    {
      if(data[i]!=null)
      {
        city += city==''? data[i].charAt(0).toUpperCase()+data[i].slice(1):' '+data[i].charAt(0).toUpperCase()+data[i].slice(1);
      }
      //data[i]=data[i].charAt(0).toUpperCase()+data[i].slice(1);
    }
    
    
    //console.log(city)
    return city;    
  }

  deSanitizeURLParam(param: string) {
    if(param!=undefined){
    let dsp = param.split('-and-').join(' & ');
    dsp = dsp.split('-').join(' ');
    return dsp;
    }
  }

  getDateStringsForAppointmentDisplay(d: string) {

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let tom = m(d, 'DD/MM/YYYY'); 
    
    let sweek = dayNames[tom.day()];
    let sdate = tom.date();
    let smonth = monthNames[tom.month()];

    return { fullDate:d, weekday: sweek, date: sdate, month: smonth}
  }

  // getDateString(d: string, splittor: string, joiner: string) {
  //   let date = d.split(splittor);
  //   let ds: string = +date[0] < 10 ? '0'+(+date[0]) : date[0]; 
  //   let ms = +date[1] < 10 ? '0'+(+date[1]) : date[1];

  //   return ds + joiner + ms + joiner + date[2];
    
  // }

  setActiveTab(tab: number) {
    this.navigationTabTracker.next(tab);
  }
  setDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let h = this.addZero(today.getHours());
    let m = this.addZero(today.getMinutes());
    let ddString = "";
    let mmString = "";
    var yyyy = today.getFullYear();
    if (dd < 10) {
        ddString = '0' + dd;
    }
    else {
        ddString = dd.toString();
    }
    if (mm < 10) {
        mmString = '0' + mm;
    }
    else {
        mmString = mm.toString();
    }
    return yyyy.toString() + '-' + mmString + '-' + ddString;
}
addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

  checkEmailOrPhone(str: string) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(str).toLowerCase()) ? 1 : 2; // 1 => email; 2 => phone;
  }

  serializePostParams(paramsObj: any) {
    let httpParams = new HttpParams();
    Object.keys(paramsObj).forEach(function (key) {
      httpParams = httpParams.append(key, paramsObj[key]);
    });
    return httpParams;
  }
  removeSpaces(keyword: string) 
  {
    if(keyword)
    {
      keyword = keyword.split(' ').join('-');
      keyword = keyword.split('&').join('and');
      return keyword.toLowerCase();
    }
    else
    return keyword;
  }

}
