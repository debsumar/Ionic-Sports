import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BookinghistoryPage } from './bookinghistory';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    BookinghistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(BookinghistoryPage),
    SharedComponentsModule,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class BookinghistoryPageModule {}
