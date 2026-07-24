import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateventsandnewsPage } from './createventsandnews';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { ImageUploadService } from './imageupload.service';
import { SharedComponentsModule } from '../../../shared/components/shared-components.module';
import { ThemeService } from '../../../services/theme.service';

@NgModule({
  declarations: [
    CreateventsandnewsPage,  
  ],
  imports: [
    IonicPageModule.forChild(CreateventsandnewsPage),
    SharedComponentsModule,
  ],
  providers:[Camera,File,ImageUploadService,ThemeService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateventsandnewsPageModule {}
