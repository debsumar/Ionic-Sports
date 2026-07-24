import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { UpdateprofilePage } from './updateprofile';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    UpdateprofilePage,
  ],
  imports: [
    IonicPageModule.forChild(UpdateprofilePage),
    CommonModule,
    SharedComponentsModule,
  ],
})
export class UpdateprofilePageModule {}
