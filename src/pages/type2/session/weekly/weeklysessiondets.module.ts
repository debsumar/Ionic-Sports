import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WeeklysessiondetsPage } from './weeklysessiondets';
import { CallNumber } from '@ionic-native/call-number';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    WeeklysessiondetsPage,
  ],
  imports: [
    IonicPageModule.forChild(WeeklysessiondetsPage),
    SharedComponentsModule,
  ],
  providers: [
    CallNumber,
  ]
})
export class WeeklysessiondetsPageModule {}
