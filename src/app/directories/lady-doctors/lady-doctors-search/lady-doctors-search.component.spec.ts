import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LadyDoctorsSearchComponent } from './lady-doctors-search.component';

describe('LadyDoctorsSearchComponent', () => {
  let component: LadyDoctorsSearchComponent;
  let fixture: ComponentFixture<LadyDoctorsSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LadyDoctorsSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LadyDoctorsSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
