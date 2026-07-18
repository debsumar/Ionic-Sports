import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { MonthlyRecord } from './monthlyrecord';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    MonthlyRecord,
  ],
  imports: [
    IonicPageModule.forChild(MonthlyRecord),
    CommonModule,
    SharedComponentsModule,
  ],
  exports: [
    MonthlyRecord
  ]
})
export class MonthlyRecordModule {}
