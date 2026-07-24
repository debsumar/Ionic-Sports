import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { ShowvideofromlistPage } from './showvideofromlist';
import { SocialSharing } from '@ionic-native/social-sharing';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';

@NgModule({
  declarations: [
    ShowvideofromlistPage,
  ],
  imports: [
    IonicPageModule.forChild(ShowvideofromlistPage),
    CommonModule,
    SharedComponentsModule,
  ],
  providers: [SocialSharing, ThemeService],
})
export class ShowvideofromlistPageModule {}
