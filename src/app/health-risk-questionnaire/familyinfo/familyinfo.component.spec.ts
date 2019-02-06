import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyinfoComponent } from './familyinfo.component';

describe('FamilyinfoComponent', () => {
  let component: FamilyinfoComponent;
  let fixture: ComponentFixture<FamilyinfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FamilyinfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
