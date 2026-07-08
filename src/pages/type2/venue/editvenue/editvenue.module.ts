import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2EditVenue } from './editvenue';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../services/theme.service';


@NgModule({
  declarations: [
    Type2EditVenue,
  ],
  imports: [
    IonicPageModule.forChild(Type2EditVenue),
    SharedComponentsModule,
  ],
  providers: [ ThemeService ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  exports: [
    Type2EditVenue
  ]
})
export class Type2EditVenueModule {}
