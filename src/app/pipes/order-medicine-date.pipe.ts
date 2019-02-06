import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'orderMedicineDate'
})
export class OrderMedicineDatePipe implements PipeTransform {

  	transform(value: any, args?: any): any 
	{
		// value - /Date(1528802848133)/
		/*var a = value.substr(1); // remove first character - Date(1528802848133)/
		var b = a.slice(0, -1); // remove last character - Date(1528802848133)
		var c = b.replace('Date', ''); // remove Date string - (1528802848133)
		var d = c.replace('(', ''); // remove (  - 1528802848133)
		var e = parseInt(d.replace(')', '')); // remove )  - 1528802848133

		const date = new Date(e);
		return date.toDateString();*/
		return moment(value).format("MMM DD, YYYY");
  	}

}
