import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CalendarModule } from 'ionic3-calendar-en';
import { NewViewcourtPage } from './newviewcourt';
import { ThemeService } from '../../../../../services/theme.service';


@NgModule({
  declarations: [
    NewViewcourtPage
    
  ],
  imports: [
    IonicPageModule.forChild(NewViewcourtPage),
    CalendarModule
  ],
  providers: [ThemeService],
 
})
export class NewViewcourtPageModule {}
