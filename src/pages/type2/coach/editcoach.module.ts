import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditCoach } from './editcoach';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';

@NgModule({
  declarations: [
    Type2EditCoach,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditCoach),
    SharedComponentsModule,
  ],
  exports: [
    Type2EditCoach
  ],
  providers: [ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class Type2EditCoachModule {}
