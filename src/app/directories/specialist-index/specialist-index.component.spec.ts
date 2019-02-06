import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialistIndexComponent } from './specialist-index.component';

describe('SpecialistIndexComponent', () => {
  let component: SpecialistIndexComponent;
  let fixture: ComponentFixture<SpecialistIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialistIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialistIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
