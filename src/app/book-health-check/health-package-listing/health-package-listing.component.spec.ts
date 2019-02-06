import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthPackageListingComponent } from './health-package-listing.component';

describe('HealthPackageListingComponent', () => {
  let component: HealthPackageListingComponent;
  let fixture: ComponentFixture<HealthPackageListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthPackageListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthPackageListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
