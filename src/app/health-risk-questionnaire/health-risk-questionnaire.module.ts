import { NgModule } from '@angular/core';
import { HealthRiskQuestionnaireComponent } from './health-risk-questionnaire.component';
import { Routes, RouterModule } from '@angular/router';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import { SharedModule } from '../shared/shared.module';
import { AppointmentlistComponent } from './appointmentlist/appointmentlist.component';
import { DiagnoseslistComponent } from './diagnoseslist/diagnoseslist.component';
import { SymptomComponent } from './symptom/symptom.component';
import { SmokeComponent } from './smoke/smoke.component';
import { DignoseasthmaComponent } from './dignoseasthma/dignoseasthma.component';
import { HappinessscoreComponent } from './happinessscore/happinessscore.component';
import { DietComponent } from './diet/diet.component';
import { ExerciseComponent } from './exercise/exercise.component';
import { AlcoholComponent } from './alcohol/alcohol.component';
import { PregnantwomenComponent } from './pregnantwomen/pregnantwomen.component';
import { FinalquestionnaireComponent } from './finalquestionnaire/finalquestionnaire.component';
import { AllergyComponent } from './allergy/allergy.component';
import { FamilyhistoryComponent } from './familyhistory/familyhistory.component';
import { HealthComplaintsComponent } from './health-complaints/health-complaints.component';
import { FamilyinfoComponent } from './familyinfo/familyinfo.component';

const HealthRoutes: Routes = [
  { path: '', component: HealthRiskQuestionnaireComponent, children: [
    { path: 'appointmentlist', component: AppointmentlistComponent },
    { path: 'diagnoseslist', component: DiagnoseslistComponent },
    { path: 'symptom', component: SymptomComponent },
    { path: 'smoke',component:SmokeComponent},
    { path: 'alcohol',component:AlcoholComponent},
    { path: 'happinessscore',component:HappinessscoreComponent},
    { path: 'diet',component:DietComponent},
    { path: 'exercise',component:ExerciseComponent},
    { path: 'finalquestionnaire',component:FinalquestionnaireComponent},
    { path: 'allergy',component:AllergyComponent},
    { path: 'familyhistory',component:FamilyhistoryComponent},
    { path: 'pregnantwomen',component:PregnantwomenComponent},
    { path: 'healthcomplaints',component:HealthComplaintsComponent}
  ] }
]

@NgModule({
  imports: [
    SharedModule,
    Ng4LoadingSpinnerModule.forRoot(),
    RouterModule.forChild(HealthRoutes),
  ],
  providers: [],
  declarations: [HealthRiskQuestionnaireComponent,
     AppointmentlistComponent,
     DiagnoseslistComponent,
     SymptomComponent,
     SmokeComponent,
     DignoseasthmaComponent,
     HappinessscoreComponent,
     DietComponent,
     ExerciseComponent,
     AlcoholComponent,
     PregnantwomenComponent,
     FinalquestionnaireComponent,
     AllergyComponent,
     FamilyhistoryComponent,
     HealthComplaintsComponent,     
     FamilyinfoComponent
      ],
  exports: [
    RouterModule
  ]
})
export class HealthRiskQuestionnaireModule { }
