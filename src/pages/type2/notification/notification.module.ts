import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2notification } from './notification';

import { HttpModule } from '@angular/http';
import { Clipboard } from '@ionic-native/clipboard';

@NgModule({
  declarations: [
    Type2notification,
  ],
  imports: [
    IonicPageModule.forChild(Type2notification),
    HttpModule,

  ],
  exports: [
    Type2notification
  ],
  providers:[Clipboard]
})
export class Type2notificationModule { }