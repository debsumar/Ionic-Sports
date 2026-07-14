import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { LoyaltyProfile } from './loyaltyprofile';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [LoyaltyProfile],
  imports: [
    IonicPageModule.forChild(LoyaltyProfile),
    CommonModule,
    SharedComponentsModule,
  ],
})
export class LoyaltyProfileModule {}
