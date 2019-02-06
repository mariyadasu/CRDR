import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'gender'
})
export class GenderPipe implements PipeTransform 
{
	transform(value: any, args?: any): any 
	{
    	if(value == 'M')
    	{
    		return 'Male';
    	}
    	else if(value == 'F')
    	{
    		return 'Female'
		}
		else if(value == '1')
    	{
    		return 'Male'
		}
		else if(value == '2')
    	{
    		return 'Female'
    	}
    	else
    	{
    		return 'Others';
    	}
  	}

}
