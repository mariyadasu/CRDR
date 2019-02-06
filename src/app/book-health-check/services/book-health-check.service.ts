
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { constants as c } from '../../constants';
import { BookHealthCheckAppointment, HealthCheckDetails } from '../models/bookhealthcheck'

@Injectable()
export class BookHealhCheckService {

    constructor(private http: HttpClient) { }

    getHealthChecks(): Observable<HealthCheckDetails> {

        let uri = c.Apiurl + 'getAllHEalthChecks/';

        return this.http.get<HealthCheckDetails>(uri);
    }

    bookHealthCheck(details: BookHealthCheckAppointment): Observable<HealthCheckDetails> {
        let uri = c.Apiurl + 'bookHealthCheck';

        let params = {
            'userId': details.userId,
        }
        return this.http.post<HealthCheckDetails>(uri, params);
    }

}
