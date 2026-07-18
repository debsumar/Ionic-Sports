import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventPaymentReport } from './eventpaymentreport';


@NgModule({
  declarations: [
    EventPaymentReport,
  ],
  imports: [
    IonicPageModule.forChild(EventPaymentReport),
  ],
  exports: [
    EventPaymentReport
  ]
})
export class EventPaymentReportModule {}
