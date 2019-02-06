import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class StoreService {

  public TOKEN_CITY = 'tc';
  public TOKEN_USER = 'tu';
  public TOKEN_AUTH_TOKEN = 'at';

  constructor() { }

  saveToken(tokenId: string, tokenValue: any) 
  {
    switch (tokenId) {
      default:
      case this.TOKEN_CITY:
        localStorage.setItem(tokenId + '_city', JSON.stringify(tokenValue));
        break;
      case this.TOKEN_USER:
        localStorage.setItem(tokenId + '_ui', JSON.stringify(tokenValue));
        break;
      case this.TOKEN_AUTH_TOKEN:
        // Save the time of token, to account for potential expiry time
        let m = moment().toNow();
        let sessionToken = { ...tokenValue, m }
        localStorage.setItem(tokenId + '_at', JSON.stringify(sessionToken));
        break;
    }
  }

  getToken(tokenId: string) 
  {
    switch (tokenId) {
      default:
      case this.TOKEN_CITY:
        return localStorage.getItem(tokenId + '_city') ? JSON.parse(localStorage.getItem(tokenId + '_city')) : null;
      case this.TOKEN_USER:
        return localStorage.getItem(tokenId + '_ui') ? JSON.parse(localStorage.getItem(tokenId + '_ui')) : null;
      case this.TOKEN_AUTH_TOKEN:
        return localStorage.getItem(tokenId + '_at') ? JSON.parse(localStorage.getItem(tokenId + '_at')) : null;
    }
  }

  clearToken(tokenId: string) {
    switch (tokenId) {
      default:
      case this.TOKEN_USER:
        if(localStorage.getItem(tokenId + '_ui')) {
          localStorage.removeItem(tokenId + '_ui');
        } 
      case this.TOKEN_AUTH_TOKEN:
        if (localStorage.getItem(tokenId + '_at')) {
          localStorage.removeItem(tokenId + '_at');
          localStorage.removeItem(tokenId + '_st');
        }
    }
  }

  // setSession(si: any) {

  // }
}
