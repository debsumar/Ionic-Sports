import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { EditmembershipPage } from './editmembership';

@NgModule({
  declarations: [
    EditmembershipPage,
  ],
  imports: [
    IonicPageModule.forChild(EditmembershipPage),
    SharedComponentsModule,
  ],
})
export class EditmembershipPageModule {}
