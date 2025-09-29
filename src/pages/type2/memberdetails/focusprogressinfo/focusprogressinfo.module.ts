import { NgModule } from '@angular/core';
import { IonicModule, IonicPageModule } from 'ionic-angular';
import { FocusprogressinfoPage } from './focusprogressinfo';
import { ComponentsModule } from '../../../../components/components.module';

@NgModule({
  declarations: [
    FocusprogressinfoPage,
  ],
  imports: [
    IonicPageModule.forChild(FocusprogressinfoPage),
    ComponentsModule,
    IonicModule
  ],
})
export class FocusprogressinfoPageModule { }
