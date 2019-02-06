import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorProfileNewComponent } from './doctor-profile-new.component';

describe('DoctorProfileNewComponent', () => {
  let component: DoctorProfileNewComponent;
  let fixture: ComponentFixture<DoctorProfileNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoctorProfileNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorProfileNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
