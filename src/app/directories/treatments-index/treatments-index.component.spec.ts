import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentsIndexComponent } from './treatments-index.component';

describe('TreatmentsIndexComponent', () => {
  let component: TreatmentsIndexComponent;
  let fixture: ComponentFixture<TreatmentsIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreatmentsIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentsIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
