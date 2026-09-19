import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditSchoolSessionDetails } from './editschoolsessiondetials';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';

@NgModule({
  declarations: [
    Type2EditSchoolSessionDetails,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditSchoolSessionDetails),
    SharedComponentsModule,
  ],
  providers: [ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    Type2EditSchoolSessionDetails
  ]
})
export class Type2EditSchoolSessionDetailsModule {}
