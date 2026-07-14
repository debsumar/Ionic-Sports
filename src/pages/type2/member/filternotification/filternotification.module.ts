import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { Filternotification } from './filternotification';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    Filternotification,
  ],
  imports: [
    IonicPageModule.forChild(Filternotification),
    CommonModule,
    SharedComponentsModule,
  ],
})
export class FilternotificationPageModule {}
