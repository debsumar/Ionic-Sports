import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { CancelMembershipPage } from './cancelmembership';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [CancelMembershipPage],
  imports: [
    IonicPageModule.forChild(CancelMembershipPage),
    CommonModule,
    SharedComponentsModule,
  ],
})
export class CancelMembershipPageModule {}
