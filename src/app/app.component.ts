import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/timer';

interface MeasurementObservable {
  observable: Observable<string>;
  name: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private httpClient: HttpClient) { }

  ip: string =  null;
  observables: MeasurementObservable[] = [];

  betterNames = {
    temperature: 'Temperature',
    temperature2: 'Temperature (second sensor)',
    humidity: 'Humidity',
    co2: 'CO₂'
  }

  units = {
    temperature: '°C',
    temperature2: '°C',
    humidity: '%',
    co2: 'ppm'
  }

  icons = {
    temperature: 'fa-thermometer-half',
    temperature2: 'fa-thermometer-half',
    humidity: 'fa-tint',
    co2: 'fa-cloud'
  }

  add(ip: string) {
    this.ip = ip;
    localStorage.setItem('deviceIp', ip);
    this.subscribe(ip);
  }

  ngOnInit() {
    this.ip = localStorage.getItem('deviceIp');
    if (this.ip) {
      this.subscribe(this.ip);
    }
  }

  private subscribe(ip: string) {
    const url = 'http://' + ip + '/';
    this.httpClient.get(url + 'list', { responseType: 'text' })
      .map(info => info.split(' '))
      .subscribe(names => {
        names.forEach((name, index) => {
          this.observables.push({
            name: name,
            observable: Observable
              .timer(index*1000, 10000)
              .switchMap(i => this.httpClient.get(url + name, { responseType: 'text' }))
              .map(value => Number.parseFloat(value).toFixed(2))
          });
        })
      });
  }
}
