import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CopyschoolsessionPage } from './copyschoolsession';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../services/theme.service';

@NgModule({
  declarations: [
    CopyschoolsessionPage,
  ],
  imports: [
    IonicPageModule.forChild(CopyschoolsessionPage),
    SharedComponentsModule,
  ],
  providers: [ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CopyschoolsessionPageModule {}
