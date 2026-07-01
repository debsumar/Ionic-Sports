import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2CourtSetupList } from './courtsetuplist';
import { SharedmoduleModule } from '../../../pages/sharedmodule/sharedmodule.module'
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';
@NgModule({
  declarations: [
    Type2CourtSetupList,
  ],
  imports: [
    IonicPageModule.forChild(Type2CourtSetupList),
    SharedmoduleModule,
    SharedComponentsModule
  ],
  providers: [ ThemeService ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  exports: [
    Type2CourtSetupList
  ]
})
export class Type2CourtSetupListModule {}
