import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: MainComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), MainComponent],
})
export class MainModule {}
