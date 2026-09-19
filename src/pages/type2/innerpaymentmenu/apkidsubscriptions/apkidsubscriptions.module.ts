import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Apkidsubscriptions } from './apkidsubscriptions';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    Apkidsubscriptions,
  ],
  imports: [
    IonicPageModule.forChild(Apkidsubscriptions),
    SharedComponentsModule,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class ApkidsubscriptionsPageModule {}
