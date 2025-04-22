import { Component, OnInit } from '@angular/core';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'za-new-worksheet',
  templateUrl: './new-worksheet.component.html',
  styleUrls: ['./new-worksheet.component.scss'],
  standalone: true,
  imports: [SpinnerComponent],
})
export class NewWorksheetComponent implements OnInit {
  loading = false;

  constructor() {}

  ngOnInit(): void {}
}
