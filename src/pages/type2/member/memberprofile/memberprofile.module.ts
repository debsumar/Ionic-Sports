import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MemberprofilePage } from './memberprofile';
import { CallNumber } from '@ionic-native/call-number';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
@NgModule({
  declarations: [
    MemberprofilePage,
  ],
  imports: [
    IonicPageModule.forChild(MemberprofilePage),
    SharedComponentsModule,
  ],
  providers: [
    CallNumber
  ]
})
export class MemberprofilePageModule {}
