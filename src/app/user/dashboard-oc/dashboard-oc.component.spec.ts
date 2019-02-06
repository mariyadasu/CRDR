import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardOcComponent } from './dashboard-oc.component';

describe('DashboardOcComponent', () => {
  let component: DashboardOcComponent;
  let fixture: ComponentFixture<DashboardOcComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardOcComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardOcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
