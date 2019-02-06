import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LadyDoctorsComponent } from './lady-doctors.component';

describe('LadyDoctorsComponent', () => {
  let component: LadyDoctorsComponent;
  let fixture: ComponentFixture<LadyDoctorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LadyDoctorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LadyDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
