import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HappinessscoreComponent } from './happinessscore.component';

describe('HappinessscoreComponent', () => {
  let component: HappinessscoreComponent;
  let fixture: ComponentFixture<HappinessscoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HappinessscoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HappinessscoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
