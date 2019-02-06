import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageIndexComponent } from './language-index.component';

describe('LanguageIndexComponent', () => {
  let component: LanguageIndexComponent;
  let fixture: ComponentFixture<LanguageIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LanguageIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
