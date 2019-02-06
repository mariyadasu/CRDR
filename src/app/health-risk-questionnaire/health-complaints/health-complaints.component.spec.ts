import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthComplaintsComponent } from './health-complaints.component';

describe('HealthComplaintsComponent', () => {
  let component: HealthComplaintsComponent;
  let fixture: ComponentFixture<HealthComplaintsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthComplaintsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthComplaintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
