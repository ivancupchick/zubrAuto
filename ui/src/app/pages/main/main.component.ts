import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'za-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(private router: Router) {
  }

  linkToSettings() {
    this.router.navigateByUrl('settings');
  }

  ngOnInit(): void {
  }

}
