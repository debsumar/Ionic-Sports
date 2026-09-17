import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FiltermemberPage } from './filtermember';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';

@NgModule({
  declarations: [
    FiltermemberPage,
  ],
  imports: [
    IonicPageModule.forChild(FiltermemberPage),
    SharedComponentsModule,
  ],
})
export class FiltermemberPageModule {}
