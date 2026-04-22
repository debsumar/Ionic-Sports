import { NgModule,  } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewcourtPage } from './viewcourt';
import { CalendarModule } from 'ionic3-calendar-en';
import { ThemeService } from '../../../../../services/theme.service';


@NgModule({
  declarations: [
    ViewcourtPage
    
  ],
  imports: [
    IonicPageModule.forChild(ViewcourtPage),
    CalendarModule
  ],
  providers: [ThemeService],
 
})
export class ViewcourtPageModule {}
