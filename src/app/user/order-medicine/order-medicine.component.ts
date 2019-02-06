import { Component, OnInit } from '@angular/core';
import { UserService } from '@aa/services/user.service';

import { OCUserInfo, OrderMedicines, UserInfo, aaToken } from '@aa/structures/user.interface';
import { Subscription } from 'rxjs/Subscription';

import { ValidationManager } from "ng2-validation-manager";
import { AAAuthService } from '@aa/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

@Component({
	selector: 'app-order-medicine',
	templateUrl: './order-medicine.component.html',
	styleUrls: ['./order-medicine.component.scss']
})
export class OrderMedicineComponent implements OnInit {
	//orderMedicines: OrderMedicines = {} as OrderMedicines;
	orderMedicines: any;
	orderMedicineTracker = new Subscription;
	res: any;

	orderMedicine;
	ocUserSubscription = new Subscription;
	ocUserInfo: OCUserInfo = {} as OCUserInfo;
	isFirstTab: boolean = true;

	appointmentId: string;
	constructor(private us: UserService,
		private auth: AAAuthService,
		private router: Router) {
		// Form validations --start
		this.orderMedicine = new ValidationManager({
			'ShippingMethod': 'required',
			'zipCode': 'required|number|maxLength:15',
			'city': 'required|maxLength:20',
			'address': 'required|maxLength:250',
		});
		this.orderMedicine.setErrorMessage('ShippingMethod', 'required', 'Shipping Method is required');
		this.orderMedicine.setErrorMessage('zipCode', 'required', 'Pin is required');
		this.orderMedicine.setErrorMessage('zipCode', 'number', 'Only numbers allowed');
		this.orderMedicine.setErrorMessage('zipCode', 'maxLength', 'Max length is 15 ');
		this.orderMedicine.setErrorMessage('city', 'required', 'City is required');
		this.orderMedicine.setErrorMessage('city', 'maxLength', 'City should be lessthan 20 characters');
		this.orderMedicine.setErrorMessage('address', 'required', 'Address is required');
		this.orderMedicine.setErrorMessage('address', 'maxLength', 'Address should be lessthan 250 characters');
		// Form validations --end
	}

	ngOnInit() {
		// get the appointment id from previous request
		this.us.currentAppointmentId.subscribe(value => this.appointmentId = value);
		if (this.appointmentId == '') {
			this.router.navigate(['/my/dashboard-oc']);
		}
		// get the user data -- start

		this.us.getOCUserDetails();
		this.auth.loadingShow('loadingid');

		this.ocUserSubscription = this.us.ocUserTracker.subscribe(
			(data) => {
				this.res = data;
				if (this.res.ResponceCode == 6) {
					alert('Your session has expired. You are now being redirected to the home page.');
					this.auth.logoutUser();
				}
				this.auth.loadingHide('loadingid');
				this.ocUserInfo = JSON.parse(this.res.Result)[0];
			}, (err) => {
				console.log(err);
				this.auth.loadingHide('loadingid');
				//alert('Something went wrong.');
			}
		);

		// get the user data  -- end
		// get the order medicines data -- start
		this.getOrderMedicines();
	}

	// Place the order medicine
	postOrderMedicine() {
		if (this.orderMedicine.isValid()) {
			//console.log(this.us.saveOrderMedicine(this.orderMedicine.getData(),this.ocUserInfo,this.appointmentId));
			var age = moment(this.ocUserInfo.DOB, "MM/DD/YYYY").fromNow().split(" ")[0];
			this.auth.loadingShow('loadingid');
			this.us.saveOrderMedicine(this.orderMedicine.getData(), this.ocUserInfo, this.appointmentId, age)
				.subscribe(
					(data) => {
						this.auth.loadingHide('loadingid');
						this.res = data;
						if (this.res.ResponceCode == 0) {
							this.orderMedicine.reset();
							this.getOrderMedicines();
							alert(this.res.Result);
						}
						else {
							alert('Something went wrong');
						}
					}
				), err => {
					this.auth.loadingHide('loadingid');
					alert(err);

				};
		}
	}
	/*
	*	Tab selects changes according to the user click 
	*/
	tabSelection() {
		this.isFirstTab = !this.isFirstTab;
	}
	ngOnDestroy() {
		this.orderMedicineTracker.unsubscribe();
	}

	getOrderMedicines() {
		this.us.getOrderMedicines();
		this.auth.loadingShow('loadingid');
		this.orderMedicineTracker = this.us.ocOrderMedicinesTracker.subscribe(
			(data) => {
				this.res = data;
				if (this.res.ResponceCode == 0) {
					this.orderMedicines = JSON.parse(this.res.Result);
				}
				else if (this.res.ResponceCode == 6) {
					this.auth.loadingHide('loadingid');
					alert('Your session has expired. You are now being redirected to the home page.');
					this.auth.logoutUser();
				}
				else {
					this.auth.loadingHide('loadingid');
					alert('Something went wrong.');
				}
			}, (err) => {
				this.auth.loadingHide('loadingid');
				console.log(err);
			}
		);
	}
}
