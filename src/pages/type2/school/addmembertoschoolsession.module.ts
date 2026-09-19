import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddMemberSchoolSession } from './addmembertoschoolsession';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    Type2AddMemberSchoolSession,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddMemberSchoolSession),
    SharedComponentsModule,
  ],
  exports: [
    Type2AddMemberSchoolSession
  ]
})
export class Type2AddMemberSchoolSessionModule {}