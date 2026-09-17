import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Filteremail } from './filteremail';
import { HttpModule } from '@angular/http';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
@NgModule({
  declarations: [
    Filteremail,
  ],
  imports: [
    HttpModule,
    IonicPageModule.forChild(Filteremail),
    SharedComponentsModule,
  ],
})
export class FilteremailPageModule {}
