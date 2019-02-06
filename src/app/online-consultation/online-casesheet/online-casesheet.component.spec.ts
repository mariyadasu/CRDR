import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineCasesheetComponent } from './online-casesheet.component';

describe('OnlineCasesheetComponent', () => {
  let component: OnlineCasesheetComponent;
  let fixture: ComponentFixture<OnlineCasesheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineCasesheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineCasesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
