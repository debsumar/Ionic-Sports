import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { FilterbookingsPage } from './filterbookings';
import { CalendarModule } from 'ionic3-calendar-en';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    FilterbookingsPage,
  ],
  imports: [
    IonicPageModule.forChild(FilterbookingsPage),
    CommonModule,
    CalendarModule,
    SharedComponentsModule,
  ],
})
export class FilterbookingsPageModule {}
