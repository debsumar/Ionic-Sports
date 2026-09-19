import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SchoolattendencePage } from './schoolattendence';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../services/theme.service';

@NgModule({
  declarations: [
    SchoolattendencePage,
  ],
  imports: [
    IonicPageModule.forChild(SchoolattendencePage),
    SharedComponentsModule,
  ],
  providers: [ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SchoolattendencePageModule {}
