import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorsIndexComponent } from './doctors-index.component';

describe('DoctorsIndexComponent', () => {
  let component: DoctorsIndexComponent;
  let fixture: ComponentFixture<DoctorsIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoctorsIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorsIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
