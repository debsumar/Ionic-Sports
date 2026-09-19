import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CalendarModule } from 'ionic3-calendar-en';
import { BulkSlotCancellation } from './bulkslotcancellation';
import { SharedComponentsModule } from '../../../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../../../services/theme.service';

@NgModule({
  declarations: [
    BulkSlotCancellation,
  ],
  imports: [
    IonicPageModule.forChild(BulkSlotCancellation),
    CalendarModule,
    SharedComponentsModule
  ],
  providers: [
    ThemeService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class bulkslotcancellationModule {}
