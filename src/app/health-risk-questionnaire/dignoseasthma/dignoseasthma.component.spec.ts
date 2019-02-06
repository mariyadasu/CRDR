import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DignoseasthmaComponent } from './dignoseasthma.component';

describe('DignoseasthmaComponent', () => {
  let component: DignoseasthmaComponent;
  let fixture: ComponentFixture<DignoseasthmaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DignoseasthmaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DignoseasthmaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
