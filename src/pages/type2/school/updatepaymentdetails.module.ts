import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UpdatePaymentDetails } from './updatepaymentdetails';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';

@NgModule({
  declarations: [
    UpdatePaymentDetails,
  ],
  imports: [
    IonicPageModule.forChild(UpdatePaymentDetails),
    SharedComponentsModule,
  ],
  providers: [ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    UpdatePaymentDetails
  ]
})
export class UpdatePaymentDetailsModule {}
