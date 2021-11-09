import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'za-new-worksheet',
  templateUrl: './new-worksheet.component.html',
  styleUrls: ['./new-worksheet.component.scss']
})
export class NewWorksheetComponent implements OnInit {
  loading = false;

  constructor() { }

  ngOnInit(): void {
  }

}
