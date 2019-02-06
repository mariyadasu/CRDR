import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnoseslistComponent } from './diagnoseslist.component';

describe('DiagnoseslistComponent', () => {
  let component: DiagnoseslistComponent;
  let fixture: ComponentFixture<DiagnoseslistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiagnoseslistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnoseslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
