import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { BarComponent } from '../bar/bar.component';

@Component({
  selector: 'dvmv-vis',
  templateUrl: './vis.component.html',
  styleUrls: ['./vis.component.scss']
})
export class VisComponent implements OnInit, AfterViewInit {

  @ViewChild(BarComponent) bar;
  changeTrigger = 0;
  years = { "1990": false, "1991": false, "1992": false, "1993": false,
    "1994": false, "1995": false, "1996": false, "1997": false, "1998": false,
    "1999": false, "2000": false, "2001": false, "2002": false, "2003": false,
    "2004": false, "2005": false, "2006": false, "2007": false, "2008": false,
    "2009": false, "2010": false, "2011": false, "2012": false, "2013": false,
    "2014": false, "2015": false, "2016": false, "2017": false, "2018": false,
    "2019": false
  }

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.years = this.bar.selectedYears;
    this.changeTrigger = this.bar.changeTrigger;
  }
}
