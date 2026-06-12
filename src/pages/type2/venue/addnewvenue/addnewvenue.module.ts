import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddNewVenue } from './addnewvenue';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../services/theme.service';


@NgModule({
  declarations: [
    AddNewVenue,
  ],
  imports: [
    IonicPageModule.forChild(AddNewVenue),
    SharedComponentsModule,
  ],
  providers: [ ThemeService ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  exports: [
    AddNewVenue
  ]
})
export class Type2EditVenueModule {}
