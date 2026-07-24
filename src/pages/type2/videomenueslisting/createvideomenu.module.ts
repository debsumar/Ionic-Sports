import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { CreatevideomenuPage } from './createvideomenu';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';

@NgModule({
  declarations: [
    CreatevideomenuPage,
  ],
  imports: [
    IonicPageModule.forChild(CreatevideomenuPage),
    CommonModule,
    SharedComponentsModule,
  ],
  providers: [ThemeService],
})
export class CreatevideomenuPageModule {}
