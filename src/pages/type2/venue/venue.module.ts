import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Type2Venue } from './venue';
import { ThemeService } from '../../../services/theme.service';

@NgModule({
  declarations: [
    Type2Venue,
  ],
  imports: [
    IonicPageModule.forChild(Type2Venue),
  ],
  providers: [ ThemeService ],
  exports: [
    Type2Venue
  ]
})
export class Type2VenueModule {}
