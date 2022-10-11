import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import StationsList from 'src/app/common/stations.json'
import { Station } from '../common/models/Station';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  // myControl = new FormControl('');
  // options: string[] = ['One', 'Two', 'Three'];
  // filteredOptions = new Observable<string[]>;
  Stations = StationsList;
  valFromStation: any;
  valToStation: any;
  valTicketClass: any;
  valTicketType: any;


  calculatorForm = new FormGroup({
    fromStation: new FormControl('', Validators.required),
    toStation: new FormControl('', Validators.required),
    ticketClass: new FormControl('', Validators.required),
    ticketType: new FormControl('', Validators.required),
  })

  ngOnInit() {
    // this.filteredOptions = this.myControl.valueChanges.pipe(
    //   startWith(''),
    //   map(value => this._filter(value || '')),
    // );
  }

  // private _filter(value: string): string[] {
  //   const filterValue = value.toLowerCase();

  //   return this.options.filter(option => option.toLowerCase().includes(filterValue));
  // }


  getPrice() {
    var dist = 0.0;
    this.initData()
    dist = this.getDistance(this.valFromStation, this.valToStation)
    console.log(this.calThirdClass(dist))
    

  }

  initData() {
    this.valFromStation = this.calculatorForm.value.fromStation;
    this.valToStation = this.calculatorForm.value.toStation;
    this.valTicketClass = this.calculatorForm.value.ticketClass;
    this.valTicketType = this.calculatorForm.value.ticketType;
  }

  getDistance(fromStation: Station, toStation: Station):number {
    if (fromStation.keyline == "00" || toStation.keyline == "00") //Include Fort one of the stations
    {
      return (Math.abs(fromStation.distance - toStation.distance))
    }
    else if (fromStation.keyline.charAt(0) == toStation.keyline.charAt(0)) //same line
    {
      return (Math.abs(fromStation.distance - toStation.distance))
    } else return 0.0
  }

  calculatePrice() {

  }

  calThirdClass(distance:number) {
    /** Third Class
    * <=10   - *2.6
    * <=50   - *2.4
    * <=100  - *1.7
    * <=200  - *1.4
    * >200   - *1.1
    */

    var price = 0.0
    if      (distance<=10)  price = distance*2.6
    else if (distance<=50)  price = (distance-10)*2.4 + 2.6*10
    else if (distance<=100) price = (distance-50-10)*1.7 + 2.6*10 + 2.4*(50-10)
    else if (distance<=200) price = (distance-100-50)*1.4 + 2.6*10 + 2.4*(50-10) + 1.7*(100-50)
    else if (distance>200)  price = (distance-200-100)*1.1 + 2.6*10 + 2.4*(50-10) + 1.7*(100-50) + 1.4*(200-100)
debugger
    return price != 0.0 ? this.ceiling(price,20) : null

  }

  ceiling(num:number, significance:number) {
    return Math.ceil(num / significance) * significance;
  }
}
