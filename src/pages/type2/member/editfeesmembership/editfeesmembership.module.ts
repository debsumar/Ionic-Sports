import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { EditFeesMembershipPage } from './editfeesmembership';
@NgModule({
  declarations: [
    EditFeesMembershipPage,
  ],
  imports: [
    IonicPageModule.forChild(EditFeesMembershipPage),
    SharedComponentsModule,
  ],
})
export class EditFeesMembershipPageModule {}
