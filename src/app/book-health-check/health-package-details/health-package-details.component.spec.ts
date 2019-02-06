import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthPackageDetailsComponent } from './health-package-details.component';

describe('HealthPackageDetailsComponent', () => {
  let component: HealthPackageDetailsComponent;
  let fixture: ComponentFixture<HealthPackageDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthPackageDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthPackageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
