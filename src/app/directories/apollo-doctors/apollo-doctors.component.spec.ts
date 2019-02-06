import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApolloDoctorsComponent } from './apollo-doctors.component';

describe('ApolloDoctorsComponent', () => {
  let component: ApolloDoctorsComponent;
  let fixture: ComponentFixture<ApolloDoctorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApolloDoctorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApolloDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
