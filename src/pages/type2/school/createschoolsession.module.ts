import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CreateSchoolSession } from './createschoolsession';
import { SharedmoduleModule } from '../../../pages/sharedmodule/sharedmodule.module'
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';
@NgModule({
  declarations: [
    Type2CreateSchoolSession,
  ],
  imports: [
    IonicPageModule.forChild(Type2CreateSchoolSession),
    SharedmoduleModule,
    SharedComponentsModule,
  ],
  providers: [ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    Type2CreateSchoolSession
  ]
})
export class Type2CreateSchoolSessionModule {}
