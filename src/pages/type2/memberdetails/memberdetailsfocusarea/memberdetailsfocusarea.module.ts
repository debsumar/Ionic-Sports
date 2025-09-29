import { NgModule } from '@angular/core';
import { IonicModule, IonicPageModule } from 'ionic-angular';
import { MemberdetailsfocusareaPage } from './memberdetailsfocusarea';
import { ProgressBarComponent } from '../../../../components/progress-bar/progress-bar';
import { ComponentsModule } from '../../../../components/components.module';

@NgModule({
  declarations: [
    MemberdetailsfocusareaPage,
  ],
  imports: [
    IonicPageModule.forChild(MemberdetailsfocusareaPage),
    ComponentsModule,
    IonicModule
  ],
})
export class MemberdetailsfocusareaPageModule { }
