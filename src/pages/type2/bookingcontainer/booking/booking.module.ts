import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BookingPage } from './booking';
import { CommentForEmptinessPage } from '../../commentforemptiness/commentforemptiness';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../services/theme.service';
@NgModule({
  declarations: [
    BookingPage,
    //CommentForEmptinessPage
  ],
  imports: [
    IonicPageModule.forChild(BookingPage),
    SharedComponentsModule,
  ],
  providers: [ ThemeService ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class BookingPageModule {}
