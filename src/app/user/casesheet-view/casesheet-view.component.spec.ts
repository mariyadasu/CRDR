import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasesheetViewComponent } from './casesheet-view.component';

describe('CasesheetViewComponent', () => {
  let component: CasesheetViewComponent;
  let fixture: ComponentFixture<CasesheetViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CasesheetViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CasesheetViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
