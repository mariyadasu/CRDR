import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CityLocalitySpecialistIndexComponent } from './city-locality-specialist-index.component';

describe('CityLocalitySpecialistIndexComponent', () => {
  let component: CityLocalitySpecialistIndexComponent;
  let fixture: ComponentFixture<CityLocalitySpecialistIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CityLocalitySpecialistIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityLocalitySpecialistIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
