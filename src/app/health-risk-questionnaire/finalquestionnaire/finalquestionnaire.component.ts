import { Component, OnInit } from '@angular/core';
import { HealthcheckService } from '@aa/services/healthcheck.service';
import { HRQQuestionAndAnswers } from '@aa/structures/healthcheck.interface';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-finalquestionnaire',
  templateUrl: './finalquestionnaire.component.html',
  styleUrls: ['./finalquestionnaire.component.scss']
})
export class FinalquestionnaireComponent implements OnInit {

   constructor(private hcs: HealthcheckService,
    private router: Router) { }

  ngOnInit() {
  }
  submitQuestons(){
    this.hcs.SubmitHRQQuestionsAndAnswers().subscribe(res=>{
      
      console.log(res);
    });
  }

}
