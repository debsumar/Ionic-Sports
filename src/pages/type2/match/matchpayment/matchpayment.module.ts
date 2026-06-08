import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MatchpaymentPage } from './matchpayment';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [ MatchpaymentPage ],
  imports: [ IonicPageModule.forChild(MatchpaymentPage), SharedComponentsModule ],
})
export class MatchpaymentPageModule {}
