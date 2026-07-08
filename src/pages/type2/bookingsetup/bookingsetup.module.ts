import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BookingsetupPage } from './bookingsetup';
import { CommentForEmptinessPage } from '../commentforemptiness/commentforemptiness';
import { SharedmoduleModule } from '../../../pages/sharedmodule/sharedmodule.module'
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';
@NgModule({
  declarations: [
    BookingsetupPage,
    //CommentForEmptinessPage,
  ],
  imports: [
    IonicPageModule.forChild(BookingsetupPage),
    SharedmoduleModule,
    SharedComponentsModule
  ],
  providers: [ ThemeService ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class BookingsetupPageModule {}
