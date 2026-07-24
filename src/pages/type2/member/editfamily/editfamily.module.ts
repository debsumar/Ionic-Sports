import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { EditfamilyPage } from './editfamily';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    EditfamilyPage,
  ],
  imports: [
    IonicPageModule.forChild(EditfamilyPage),
    CommonModule,
    SharedComponentsModule,
  ],
})
export class EditfamilyPageModule {}
