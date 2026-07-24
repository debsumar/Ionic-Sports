import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { AddMorePhotosPage } from './addmorephotos';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { ImageUploadService } from '../imageupload.service';
import { SharedComponentsModule } from '../../../../shared/components/shared-components.module';
import { ThemeService } from '../../../../services/theme.service';
@NgModule({
  declarations: [
    AddMorePhotosPage,
  ],
  imports: [
    IonicPageModule.forChild(AddMorePhotosPage),
    CommonModule,
    SharedComponentsModule,
  ],
  providers:[Camera,File,ImageUploadService,ThemeService]
})
export class AddMorePhotosPageModule {}
