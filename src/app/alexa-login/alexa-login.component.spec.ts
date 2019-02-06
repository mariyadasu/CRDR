import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlexaLoginComponent } from './alexa-login.component';

describe('AlexaLoginComponent', () => {
  let component: AlexaLoginComponent;
  let fixture: ComponentFixture<AlexaLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlexaLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlexaLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
