import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostBinding, Input, OnInit, ViewEncapsulation } from '@angular/core';

export const fadeInFadeOut = trigger('fadeInFadeOut', [
  transition(':enter', [
    style({opacity: 0}),
    animate(150, style({opacity: 1}))
  ]),
  transition(':leave', [
    style({opacity: 1}),
    animate(100, style({opacity: 0}))
  ])
]);

@Component({
  selector: 'za-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  animations: [ fadeInFadeOut ],
  encapsulation: ViewEncapsulation.None
})
export class SpinnerComponent implements OnInit {
  @Input() zIndex: number = 99999;
  @Input() text: string | undefined = undefined;
  @HostBinding('style.z-index') zIndexValue: number = 99999;

  ngOnInit() {
    this.zIndexValue = this.zIndex || 99999;
  }
}
