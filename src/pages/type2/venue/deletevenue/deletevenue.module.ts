import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DeleteVenue } from './deletevenue';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../services/theme.service';

@NgModule({
  declarations: [
    DeleteVenue,
  ],
  imports: [
    IonicPageModule.forChild(DeleteVenue),
    SharedComponentsModule,
  ],
  providers: [ ThemeService ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  exports: [
    DeleteVenue
  ]
})
export class Type2VenueModule {}
