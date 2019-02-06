import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthRiskQuestionnaireComponent } from './health-risk-questionnaire.component';

describe('HealthRiskQuestionnaireComponent', () => {
  let component: HealthRiskQuestionnaireComponent;
  let fixture: ComponentFixture<HealthRiskQuestionnaireComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthRiskQuestionnaireComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthRiskQuestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
