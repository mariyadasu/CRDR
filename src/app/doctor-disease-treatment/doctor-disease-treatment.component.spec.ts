import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDiseaseTreatmentComponent } from './doctor-disease-treatment.component';

describe('DoctorDiseaseTreatmentComponent', () => {
  let component: DoctorDiseaseTreatmentComponent;
  let fixture: ComponentFixture<DoctorDiseaseTreatmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoctorDiseaseTreatmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorDiseaseTreatmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
