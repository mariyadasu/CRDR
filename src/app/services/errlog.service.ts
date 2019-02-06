import { Injectable } from '@angular/core';

@Injectable()
export class ErrlogService 
{
  	constructor() 
  	{ 

  	}
  	log(fileName,methodName,err)
  	{
  		console.log(fileName);
  		console.log(methodName);
      console.log(err);
  		console.log(err.toString());
  	}
}
