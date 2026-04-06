import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from 'ionic-angular';
import { ExpandableSectionComponent } from './expandable-section/expandable-section.component';
import { AccessToggleComponent } from './access-toggle/access-toggle.component';
import { PillTabsComponent } from './pill-tabs/pill-tabs.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ListCardComponent } from './list-card/list-card.component';
import { BottomSheetComponent } from './bottom-sheet/bottom-sheet.component';
import { FabComponent } from './fab/fab.component';

@NgModule({
  declarations: [ExpandableSectionComponent, AccessToggleComponent, PillTabsComponent, SearchBarComponent, ListCardComponent, BottomSheetComponent, FabComponent],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [ExpandableSectionComponent, AccessToggleComponent, PillTabsComponent, SearchBarComponent, ListCardComponent, BottomSheetComponent, FabComponent]
})
export class SharedComponentsModule {}
