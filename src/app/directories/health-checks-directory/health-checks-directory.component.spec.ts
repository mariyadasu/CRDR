import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthChecksDirectoryComponent } from './health-checks-directory.component';

describe('HealthChecksDirectoryComponent', () => {
  let component: HealthChecksDirectoryComponent;
  let fixture: ComponentFixture<HealthChecksDirectoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthChecksDirectoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthChecksDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
