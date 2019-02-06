import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CityGroupnameIndexComponent } from './city-groupname-index.component';

describe('CityGroupnameIndexComponent', () => {
  let component: CityGroupnameIndexComponent;
  let fixture: ComponentFixture<CityGroupnameIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CityGroupnameIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityGroupnameIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
