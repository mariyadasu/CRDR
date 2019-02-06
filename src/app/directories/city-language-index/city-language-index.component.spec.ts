import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CityLanguageIndexComponent } from './city-language-index.component';

describe('CityLanguageIndexComponent', () => {
  let component: CityLanguageIndexComponent;
  let fixture: ComponentFixture<CityLanguageIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CityLanguageIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityLanguageIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
