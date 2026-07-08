import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { Type2CourtBookList } from './courtbooklist';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    Type2CourtBookList,
  ],
  imports: [
    IonicPageModule.forChild(Type2CourtBookList),
    CommonModule,
    SharedComponentsModule,
  ],
  exports: [
    Type2CourtBookList
  ]
})
export class Type2CourtBookListModule {}