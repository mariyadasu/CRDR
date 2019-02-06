import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { constants as c } from './../constants';

@Injectable()
export class APIInterceptor implements HttpInterceptor{

    APIKey = 'A3ECAC20-996B-4DD7-8452-557717024355';
    constructor() {}

    intercept(req: HttpRequest<any>, next: HttpHandler) : Observable<HttpEvent<any>>{
        if(req.url.indexOf(c.EdocApiIdentifier) != -1) 
        {
            let clone = req.clone({
                url: req.url + '/' + this.APIKey
            });
            return next.handle(clone);
        } 
        else 
        {
            return next.handle(req);
        }
        
    }
}