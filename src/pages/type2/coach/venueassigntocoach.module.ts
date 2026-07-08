import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2VenueAssignCoach } from './venueassigntocoach';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';

@NgModule({
  declarations: [
    Type2VenueAssignCoach,
  ],
  imports: [
    IonicPageModule.forChild(Type2VenueAssignCoach),
    SharedComponentsModule,
  ],
  providers: [ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    Type2VenueAssignCoach
  ]
})
export class Type2VenueAssignCoachModule {}
