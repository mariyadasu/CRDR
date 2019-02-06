import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalityCityIndexComponent } from './locality-city-index.component';

describe('LocalityCityIndexComponent', () => {
  let component: LocalityCityIndexComponent;
  let fixture: ComponentFixture<LocalityCityIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalityCityIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalityCityIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
