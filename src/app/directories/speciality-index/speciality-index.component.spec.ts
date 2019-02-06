import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecialityIndexComponent } from './speciality-index.component';

describe('SpecialityIndexComponent', () => {
  let component: SpecialityIndexComponent;
  let fixture: ComponentFixture<SpecialityIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecialityIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialityIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
