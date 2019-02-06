import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PregnantwomenComponent } from './pregnantwomen.component';

describe('PregnantwomenComponent', () => {
  let component: PregnantwomenComponent;
  let fixture: ComponentFixture<PregnantwomenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PregnantwomenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PregnantwomenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
