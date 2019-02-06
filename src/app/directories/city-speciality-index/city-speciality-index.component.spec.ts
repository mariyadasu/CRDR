import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CitySpecialityIndexComponent } from './city-speciality-index.component';

describe('CitySpecialityIndexComponent', () => {
  let component: CitySpecialityIndexComponent;
  let fixture: ComponentFixture<CitySpecialityIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CitySpecialityIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CitySpecialityIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
