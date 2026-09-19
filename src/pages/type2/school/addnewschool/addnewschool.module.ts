import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddnewSchool } from './addnewschool';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../services/theme.service';

@NgModule({
  declarations: [
    AddnewSchool,
  ],
  imports: [
    IonicPageModule.forChild(AddnewSchool),
    SharedComponentsModule,
  ],
  providers: [ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    AddnewSchool
  ]
})
export class AddnewSchoolModule {}
