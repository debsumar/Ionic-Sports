import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LeaguepaymentPage } from './leaguepayment';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    LeaguepaymentPage,
  ],
  imports: [
    IonicPageModule.forChild(LeaguepaymentPage),
    SharedComponentsModule
  ],
})
export class LeaguepaymentPageModule {}
