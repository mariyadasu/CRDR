import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AAAuthService } from '@aa/services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
	signedIn: boolean;
	constructor(private router : Router,
		 		private aaa: AAAuthService){}
  	canActivate(
    	next: ActivatedRouteSnapshot,
    	state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
  		this.signedIn = this.aaa.getSessionStatus();
  		if (this.signedIn)
    	{
    		return true;
    	}
    	else
    	{
    		this.router.navigate(['/']);
	    	return false;		
    	}
   	}

}
