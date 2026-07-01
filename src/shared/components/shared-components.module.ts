import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "ionic-angular";
import { ExpandableSectionComponent } from "./expandable-section/expandable-section.component";
import { AccessToggleComponent } from "./access-toggle/access-toggle.component";
import { PillTabsComponent } from "./pill-tabs/pill-tabs.component";
import { SearchBarComponent } from "./search-bar/search-bar.component";
import { ListCardComponent } from "./list-card/list-card.component";
import { BottomSheetComponent } from "./bottom-sheet/bottom-sheet.component";
import { FabComponent } from "./fab/fab.component";

import { GlassButtonComponent } from "./glass-button/glass-button.component";
import { MapPickerComponent } from "./map-picker/map-picker.component";
import { MapPickerModalComponent } from "./map-picker/map-picker-modal.component";
import { FormFieldComponent } from "./form-field/form-field.component";
import { DetailHeaderComponent } from "./detail-header/detail-header.component";
import { ProgressBarComponent } from "./progress-bar/progress-bar";
import { PrimaryCardComponent } from "./primary-card/primary-card.component";
import { CheckboxComponent } from "./checkbox/checkbox.component";
import { FeatureAnnouncementModalComponent } from "./feature-announcement-modal/feature-announcement-modal.component";
import { SectionHeaderComponent } from "./section-header/section-header.component";
import { StatusBadgeComponent } from "./status-badge/status-badge.component";
import { EmptyStateComponent } from "./empty-state/empty-state.component";
import { SelectFieldComponent } from "./select-field/select-field.component";

@NgModule({
  declarations: [
    ExpandableSectionComponent,
    AccessToggleComponent,
    PillTabsComponent,
    SearchBarComponent,
    ListCardComponent,
    BottomSheetComponent,
    FabComponent,
    GlassButtonComponent,
    MapPickerComponent,
    FormFieldComponent,
    DetailHeaderComponent,
    ProgressBarComponent,
    PrimaryCardComponent,
    CheckboxComponent,
    FeatureAnnouncementModalComponent,
    SectionHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    SelectFieldComponent,
  ],
  imports: [CommonModule, FormsModule, IonicModule],
  exports: [
    ExpandableSectionComponent,
    AccessToggleComponent,
    PillTabsComponent,
    SearchBarComponent,
    ListCardComponent,
    BottomSheetComponent,
    FabComponent,
    GlassButtonComponent,
    MapPickerComponent,
    FormFieldComponent,
    DetailHeaderComponent,
    ProgressBarComponent,
    PrimaryCardComponent,
    CheckboxComponent,
    FeatureAnnouncementModalComponent,
    SectionHeaderComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
    SelectFieldComponent,
  ],
})
export class SharedComponentsModule {}
