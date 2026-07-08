import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CourtSetupHome } from './courtsetuphome';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';

@NgModule({
  declarations: [
    Type2CourtSetupHome,
  ],
  imports: [
    IonicPageModule.forChild(Type2CourtSetupHome),
    SharedComponentsModule
  ],
  providers: [ ThemeService ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  exports: [
    Type2CourtSetupHome
  ]
})
export class Type2CourtSetupHomeModule {}
