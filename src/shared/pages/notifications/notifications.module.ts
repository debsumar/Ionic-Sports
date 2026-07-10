import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { NotificationsPage } from './notifications';
import { HttpModule } from '@angular/http';

@NgModule({
  declarations: [
    NotificationsPage,
  ],
  imports: [
    IonicPageModule.forChild(NotificationsPage),
    CommonModule,
    HttpModule
  ],
  exports: [
    NotificationsPage
  ]
})
export class NotificationsPageModule {}
