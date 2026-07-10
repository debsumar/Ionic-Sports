import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CallNumber } from '@ionic-native/call-number';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { AssignmembershipsPage } from './assignmemberships';
@NgModule({
  declarations: [
    AssignmembershipsPage,
  ],
  imports: [
    IonicPageModule.forChild(AssignmembershipsPage),
    SharedComponentsModule,
  ],
  providers: [
    CallNumber
  ]
})
export class AssignmembershipsPageModule {}
