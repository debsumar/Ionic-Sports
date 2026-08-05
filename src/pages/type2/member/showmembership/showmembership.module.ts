import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ShowmembershipPage } from './showmembership';
@NgModule({
  declarations: [
    ShowmembershipPage,
  ],
  imports: [
    IonicPageModule.forChild(ShowmembershipPage),
    SharedComponentsModule,
  ],
  providers: [
    CallNumber
  ]
})
export class ShowmembershipPageModule {}
