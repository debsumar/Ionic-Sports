import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssignActivityPage } from './assignactivity';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../services/theme.service';



@NgModule({
  declarations: [
    AssignActivityPage,
  ],
  imports: [
    IonicPageModule.forChild(AssignActivityPage),
    SharedComponentsModule,
  ],
  providers: [ ThemeService ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  exports: [
    AssignActivityPage
  ]
})
export class Type2EditVenueModule {}
