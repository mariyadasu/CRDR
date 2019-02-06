import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiseasesIndexComponent } from './diseases-index.component';

describe('DiseasesIndexComponent', () => {
  let component: DiseasesIndexComponent;
  let fixture: ComponentFixture<DiseasesIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiseasesIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiseasesIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
