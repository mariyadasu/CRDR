import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyfamilyComponent } from './myfamily.component';

describe('MyfamilyComponent', () => {
  let component: MyfamilyComponent;
  let fixture: ComponentFixture<MyfamilyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyfamilyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyfamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
