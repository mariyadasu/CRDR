import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCasesheetComponent } from './view-casesheet.component';

describe('ViewCasesheetComponent', () => {
  let component: ViewCasesheetComponent;
  let fixture: ComponentFixture<ViewCasesheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCasesheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCasesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
