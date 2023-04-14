import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
//import StationsList from 'src/assets/json/stations.json'
import { Station } from '../common/models/Station';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SlrStations } from '../common/models/SlrStations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  apiDistance = 0;

  constructor(private http: HttpClient) {
    // this.http.get('assets/json/Stations.json').subscribe((res) => {
    //   this.StationList = res;
    //   this.Stations = this.StationList;
    // });

    this.http.get('/assets/json/SlrStations.json').subscribe((response) => {
      this.SlrStationList = response;
      this.SlrStations = this.SlrStationList;
    });
  }

  StationList: any
  SlrStationList: any

  myControl = new FormControl('');
  DIST1 = 10;
  DIST2 = 50;
  DIST3 = 100;
  DIST4 = 200;

  RATE11 = 10.4;
  RATE12 = 9.6;
  RATE13 = 6.8;
  RATE14 = 5.6;
  RATE15 = 4.4;

  RATE21 = 5.2;
  RATE22 = 4.8;
  RATE23 = 3.4;
  RATE24 = 2.8;
  RATE25 = 2.2;

  RATE31 = 2.6;
  RATE32 = 2.4;
  RATE33 = 1.7;
  RATE34 = 1.4;
  RATE35 = 1.1;

  Stations: Station[];
  SlrStations: SlrStations[];
  valFromStation: any;
  valToStation: any;
  valTicketClass: any;
  valTicketType: any;
  valDistance: number;
  valTicketPrice = 0.0;
  searchText1 = '';
  searchText2 = '';

  fromStation = new FormControl('', Validators.required);
  toStation = new FormControl('', Validators.required);
  ticketClass = new FormControl('', Validators.required);
  ticketType = new FormControl('', Validators.required);

  ngOnInit() {
    this.ticketClass.setValue("3")
    this.ticketType.setValue("1")
    this.filterStations()

  }

  filterStations() {
  }

  async getPrice() {
    this.valDistance = 0.0;
    this.initData()
    //this.valDistance = this.getDistance(this.valFromStation, this.valToStation)
    await this.getAPIDistance(this.valFromStation, this.valToStation).then(()=>{
      this.valTicketPrice = this.calculatePrice(this.apiDistance) ?? 0.0;
    })
  }

  initData() {
    //this.valFromStation = this.calculatorForm.value.fromStation;
    this.valFromStation = this.getStation(this.fromStation.value?.toString() ?? "")
    this.valToStation = this.getStation(this.toStation.value?.toString() ?? "")
    //this.valToStation = this.calculatorForm.value.toStation;
    this.valTicketClass = this.ticketClass.value;
    this.valTicketType = this.ticketType.value;
  }

  async getAPIDistance(fromStation: SlrStations, toStation: SlrStations) {
    this.apiDistance = 0;

    const url = 'railway.gov.lk/web/index2.php?option=com_gettot&task=gettot&to=' + toStation.stationcode + '&from=' + fromStation.stationcode + '&amount=&special_items=4&train_type=1&lang=en';
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const finalUrl = proxyUrl + url;
    await fetch(finalUrl, {
      method: 'post',
      headers: {
        'x-cors-headers': JSON.stringify({
        'cookies': 'x=123'
        })
      }
    }).then(res => res.text().then((resp) => {
      const regex = /Distance:\s+(\d+\.\d+)\s+Km/;
      const match = regex.exec(resp.toString());
      if (match) {
        this.apiDistance = +match[1];   
      } else {
      }
    }))
  }

  getDistance(fromStation: Station, toStation: Station): number {
    if (fromStation?.keyline == "00" || toStation?.keyline == "00") //Include Fort one of the stations
    {
      return (Math.abs(fromStation?.distance - toStation?.distance))
    }
    else if (fromStation?.keyline.charAt(0) == toStation?.keyline.charAt(0)) //same line
    {
      return (Math.abs(fromStation?.distance - toStation?.distance))
    } else if (fromStation?.keyline.charAt(0) != toStation?.keyline.charAt(0)) {
      let zeroStation = new Station();
      this.Stations.forEach(element => {
        if (element.keyline == "00") {
          zeroStation = element;
        }
      });

      let junctionStation = null

      this.Stations.forEach(element => {
        if ((fromStation?.keyline.charAt(0) == element?.isJunction?.charAt(0))) {
          junctionStation = new Station();
          junctionStation = element;
        }
      })

      if (junctionStation == null) {
        this.Stations.forEach(element => {
          if ((toStation?.keyline.charAt(0) == element?.isJunction?.charAt(0))) {
            junctionStation = new Station();
            junctionStation = element;
          }
        })
      }
      if (junctionStation == null) junctionStation = zeroStation

      return Math.abs((fromStation.distance + toStation.distance) - Math.abs(junctionStation.distance - zeroStation.distance))

    }

    else return 0.0
  }

  calculatePrice(distance: number) {
    let ticketPrice = 0.0;
    if (this.valTicketClass == "1") {
      ticketPrice = this.calFirstClass(distance)
    } else if (this.valTicketClass == "2") {
      ticketPrice = this.calSecondClass(distance)
    } else if (this.valTicketClass == "3") {
      ticketPrice = this.calThirdClass(distance)
    }

    if (this.valTicketType == "1") {
      return ticketPrice;
    } else if (this.valTicketType == "2") {
      return this.ceiling(ticketPrice * 24, 100);
    } else if (this.valTicketType == "3") {
      return ticketPrice * 6;
    }
  }

  calFirstClass(distance: number) {
    /** Third Class
    * <=10   - *2.6
    * <=50   - *2.4
    * <=100  - *1.7
    * <=200  - *1.4
    * >200   - *1.1
    */

    var price = 0.0
    if (distance <= this.DIST1) price = distance * this.RATE11
    else if (distance <= this.DIST2) price = ((distance - this.DIST1) * this.RATE12) + (this.RATE11 * this.DIST1)
    else if (distance <= this.DIST3) price = ((distance - this.DIST2) * this.RATE13) + (this.RATE11 * this.DIST1) + (this.RATE12 * (this.DIST2 - this.DIST1))
    else if (distance <= this.DIST4) price = ((distance - this.DIST3) * this.RATE14) + (this.RATE11 * this.DIST1) + (this.RATE12 * (this.DIST2 - this.DIST1)) + (this.RATE13 * (this.DIST3 - this.DIST2))
    else if (distance > this.DIST4) price = ((distance - this.DIST4) * this.RATE15) + (this.RATE11 * this.DIST1) + (this.RATE12 * (this.DIST2 - this.DIST1)) + (this.RATE13 * (this.DIST3 - this.DIST2)) + (this.RATE14 * (this.DIST4 - this.DIST3))

    if (price > 0 && price <= 100) {
      return 100;
    } else if (price > 100) {
      return this.ceiling(price, 50)
    } else
      return price;

  }

  calSecondClass(distance: number) {
    /** Third Class
    * <=10   - *2.6
    * <=50   - *2.4
    * <=100  - *1.7
    * <=200  - *1.4
    * >200   - *1.1
    */

    var price = 0.0
    if (distance <= this.DIST1) price = distance * this.RATE21
    else if (distance <= this.DIST2) price = ((distance - this.DIST1) * this.RATE22) + (this.RATE21 * this.DIST1)
    else if (distance <= this.DIST3) price = ((distance - this.DIST2) * this.RATE23) + (this.RATE21 * this.DIST1) + (this.RATE22 * (this.DIST2 - this.DIST1))
    else if (distance <= this.DIST4) price = ((distance - this.DIST3) * this.RATE24) + (this.RATE21 * this.DIST1) + (this.RATE22 * (this.DIST2 - this.DIST1)) + (this.RATE23 * (this.DIST3 - this.DIST2))
    else if (distance > this.DIST4) price = ((distance - this.DIST4) * this.RATE25) + (this.RATE21 * this.DIST1) + (this.RATE22 * (this.DIST2 - this.DIST1)) + (this.RATE23 * (this.DIST3 - this.DIST2)) + (this.RATE24 * (this.DIST4 - this.DIST3))
    //console.log(price + "second")
    return price != 0.0 ? this.ceiling(price, 50) : 0.0

  }

  calThirdClass(distance: number) {
    /** Third Class
    * 0<=10   - *2.6
    * 11<=50   - *2.4
    * 51<=100  - *1.7
    * 101<=200  - *1.4
    * >200   - *1.1
    */
    var price = 0.0
    if (distance <= this.DIST1) price = distance * this.RATE31
    else if (distance <= this.DIST2) price = ((distance - this.DIST1) * this.RATE32) + (this.RATE31 * this.DIST1)
    else if (distance <= this.DIST3) price = ((distance - this.DIST2) * this.RATE33) + (this.RATE31 * this.DIST1) + (this.RATE32 * (this.DIST2 - this.DIST1))
    else if (distance <= this.DIST4) price = ((distance - this.DIST3) * this.RATE34) + (this.RATE31 * this.DIST1) + (this.RATE32 * (this.DIST2 - this.DIST1)) + (this.RATE33 * (this.DIST3 - this.DIST2))
    else if (distance > this.DIST4) price = ((distance - this.DIST4) * this.RATE35) + (this.RATE31 * this.DIST1) + (this.RATE32 * (this.DIST2 - this.DIST1)) + (this.RATE33 * (this.DIST3 - this.DIST2)) + (this.RATE34 * (this.DIST4 - this.DIST3))

    return price != 0.0 ? this.ceiling(price, 20) : 0.0

  }

  ceiling(num: number, significance: number) {
    return Math.ceil(num / significance) * significance;
  }

  getStation(stationName: string) {
    let station = new SlrStations()
    this.SlrStations.forEach(element => {
      if (element.station == stationName) {
        station = element;
      }
    });
    return station
  }
}
