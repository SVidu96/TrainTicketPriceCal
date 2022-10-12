import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceCalculatorMainComponent } from './price-calculator-main.component';

describe('PriceCalculatorMainComponent', () => {
  let component: PriceCalculatorMainComponent;
  let fixture: ComponentFixture<PriceCalculatorMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceCalculatorMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceCalculatorMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
