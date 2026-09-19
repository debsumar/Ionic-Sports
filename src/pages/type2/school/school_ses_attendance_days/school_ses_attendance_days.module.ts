import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SchooSesAttendanceDaysPage } from './school_ses_attendance_days';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../services/theme.service';

@NgModule({
  declarations: [
    SchooSesAttendanceDaysPage,
  ],
  imports: [
    IonicPageModule.forChild(SchooSesAttendanceDaysPage),
    SharedComponentsModule,
  ],
  providers: [ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SchooSesAttendanceDaysPageModule {}
