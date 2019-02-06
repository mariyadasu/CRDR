import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CityHospitalsIndexComponent } from './city-hospitals-index.component';

describe('CityHospitalsIndexComponent', () => {
  let component: CityHospitalsIndexComponent;
  let fixture: ComponentFixture<CityHospitalsIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CityHospitalsIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityHospitalsIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
