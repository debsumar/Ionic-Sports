import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WeeklyPaymentReport } from './weeklypaymentreport';


@NgModule({
  declarations: [
    WeeklyPaymentReport,
  ],
  imports: [
    IonicPageModule.forChild(WeeklyPaymentReport),
  ],
  exports: [
    WeeklyPaymentReport
  ]
})
export class WeeklyPaymentReportModule {}
