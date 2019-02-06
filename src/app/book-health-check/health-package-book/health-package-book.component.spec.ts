import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthPackageBookComponent } from './health-package-book.component';

describe('HealthPackageBookComponent', () => {
  let component: HealthPackageBookComponent;
  let fixture: ComponentFixture<HealthPackageBookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthPackageBookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthPackageBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
