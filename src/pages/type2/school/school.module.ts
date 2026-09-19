import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2School } from './school';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    Type2School,
  ],
  imports: [
    IonicPageModule.forChild(Type2School),
    SharedComponentsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    Type2School
  ]
})
export class Type2SchoolModule {}
