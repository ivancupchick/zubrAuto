import { Component, OnInit } from '@angular/core';
import {MenuItem} from 'primeng/api';

const menuItems : MenuItem[]  = [
  {
    label: 'Машины',
    items: [{
        label: 'Список',
        icon: 'pi pi-fw pi-list',
        routerLink: 'fields'
        // items: [
        //   {
        //     label: 'Project'
        //   }, {
        //     label: 'Other'
        //   },
        // ]
      },{
        label: 'Open'
      }, {
        label: 'Quit'
      }
    ]
  },
  {
    label: 'Edit',
    icon: 'pi pi-fw pi-pencil',
    items: [
      {
        label: 'Delete',
        icon: 'pi pi-fw pi-trash'
      }, {
        label: 'Refresh',
        icon: 'pi pi-fw pi-refresh'
      }
    ]
  }
];

@Component({
  selector: 'za-setting-header',
  templateUrl: './setting-header.component.html',
  styleUrls: ['./setting-header.component.scss']
})
export class SettingHeaderComponent implements OnInit {
  items: MenuItem[] = [];

  constructor() { }

  ngOnInit(): void {
    this.items = menuItems;
  }

}
