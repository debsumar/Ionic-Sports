import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { SharedComponentsModule } from '../../../../../shared/components/shared-components.module';
import { HolidaycampaymentsdetailsPage } from './holidaycampaymentsdetails';

@NgModule({
  declarations: [HolidaycampaymentsdetailsPage],
  imports: [
    CommonModule,
    IonicPageModule.forChild(HolidaycampaymentsdetailsPage),
    SharedComponentsModule
  ]
})
export class HolidaycampaymentsdetailsPageModule {}
