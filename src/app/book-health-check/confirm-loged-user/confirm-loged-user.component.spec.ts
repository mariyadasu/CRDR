import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmLogedUserComponent } from './confirm-loged-user.component';

describe('ConfirmLogedUserComponent', () => {
  let component: ConfirmLogedUserComponent;
  let fixture: ComponentFixture<ConfirmLogedUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmLogedUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmLogedUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
