import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalquestionnaireComponent } from './finalquestionnaire.component';

describe('FinalquestionnaireComponent', () => {
  let component: FinalquestionnaireComponent;
  let fixture: ComponentFixture<FinalquestionnaireComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalquestionnaireComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalquestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
