import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2AddCoach } from './addcoach';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';

@NgModule({
  declarations: [
    Type2AddCoach,
  ],
  imports: [
    IonicPageModule.forChild(Type2AddCoach),
    SharedComponentsModule,
  ],
  providers: [ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    Type2AddCoach
  ]
})
export class Type2AddCoachModule {}
