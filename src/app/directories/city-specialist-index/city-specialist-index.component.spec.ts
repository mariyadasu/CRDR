import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CitySpecialistIndexComponent } from './city-specialist-index.component';

describe('CitySpecialistIndexComponent', () => {
  let component: CitySpecialistIndexComponent;
  let fixture: ComponentFixture<CitySpecialistIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CitySpecialistIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CitySpecialistIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
