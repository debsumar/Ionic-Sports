import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { Type2RecurringCourtBook } from './recurringcourtbook';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    Type2RecurringCourtBook,
  ],
  imports: [
    IonicPageModule.forChild(Type2RecurringCourtBook),
    CommonModule,
    SharedComponentsModule,
  ],
  exports: [
    Type2RecurringCourtBook
  ]
})
export class Type2RecurringCourtBookModule {}