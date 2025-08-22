---
inclusion: always
---

# ActivityPro Coding Standards & Patterns

Essential coding patterns and conventions for ActivityPro development.

## Key Feature Modules
- **league/**: League and tournament management
- **match/**: Match scheduling and results  
- **team/**: Team management
- **member/**: Member management
- **session/**: Session management
- **court/**: Court booking system
- **wallet/**: Payment features
- **gallery/**: Media management

## TypeScript Patterns

### Component Structure
```typescript
@IonicPage()
@Component({
  selector: 'page-name',
  templateUrl: 'page-name.html'
})
export class PageName {
  // Properties
  data: any[] = [];
  loading: boolean = false;
  
  // Subscriptions
  private subscriptions: Subscription[] = [];
  
  constructor(
    public navCtrl: NavController,
    public commonService: CommonService
  ) {}
  
  ionViewDidLoad() {
    this.loadData();
  }
  
  ionViewWillLeave() {
    // Always cleanup subscriptions
    this.subscriptions.forEach(sub => {
      if (sub && !sub.closed) {
        sub.unsubscribe();
      }
    });
  }
}
```

### API Input Classes
```typescript
class ApiInput {
  parentclubId: string; // 🏢 Parent club ID
  clubId: string; // 🏟️ Club ID
  activityId: string; // ⚽ Activity ID
  memberId: string; // 👤 Member ID
  action_type: number; // ⚙️ Action type
  device_type: number; // 📱 Device type (1=Android, 2=iOS)
  app_type: number; // 📱 App type
  device_id: string; // 🆔 Device ID
  updated_by: string; // ✍️ User who updated
}
```

### Model Classes
```typescript
export class DataModel {
  id: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  is_active: boolean;
  is_enable: boolean;
}

export interface IActivityDetails {
  Id: string;
  ActivityName: string;
  ActivityCode: string;
  FirebaseActivityKey: string;
}
```

### Common Enums
```typescript
export enum ToastMessageType {
  Success,
  Error,
  Info,
}

export enum LeagueParticipationStatus {
  PENDING = 0,
  PARTICIPANT = 1,
  NON_PARTICIPANT = 2,
  EXTRA = 3,
  INJURED = 4
}
```

## HTML Template Patterns

### Standard Page Structure
```html
<ion-header>
  <ion-navbar>
    <ion-title>Page Title</ion-title>
  </ion-navbar>
</ion-header>

<ion-content>
  <ion-card>
    <ion-card-content>
      <!-- Content -->
    </ion-card-content>
  </ion-card>
  
  <ion-list>
    <ion-item *ngFor="let item of items">
      <ion-label>{{item.name}}</ion-label>
    </ion-item>
  </ion-list>
</ion-content>
```

### Form Patterns
```html
<ion-item class="input_item">
  <ion-label>Label</ion-label>
  <ion-input [(ngModel)]="model.property"></ion-input>
</ion-item>

<ion-item>
  <ion-label>Select</ion-label>
  <ion-select [(ngModel)]="selectedValue">
    <ion-option *ngFor="let option of options" [value]="option.value">
      {{option.label}}
    </ion-option>
  </ion-select>
</ion-item>
```

### Modal/Popup Pattern
```html
<div class="custom-popup" *ngIf="isPopupVisible">
  <div class="popup-container">
    <div class="popup-header">
      <h3>Title</h3>
      <button (click)="closePopup()">×</button>
    </div>
    <div class="popup-content">
      <!-- Content -->
    </div>
    <div class="popup-buttons">
      <button ion-button (click)="cancel()">Cancel</button>
      <button ion-button (click)="confirm()">Confirm</button>
    </div>
  </div>
</div>
```

## SCSS/CSS Patterns

### Color Scheme
```scss
$primary-blue: #2b92bb;        // Main theme
$secondary-blue: #35adff;      // Secondary theme
$light-blue: #3fbcd3;         // Accent color
$success-green: #32db64;       // Success states
$error-red: #f53d3d;          // Error states
$warning-orange: #f76e04;      // Warning states
```

### Page-Specific Styling
```scss
page-name {
  $themecolor: #35adff;
  
  .scroll-content {
    background-image: none !important;
    padding: 0px !important;
  }
  
  .local-class {
    // Component styles
  }
}
```

### Common Classes
```scss
// Utility classes
.textright { text-align: right; }
.tk-center { text-align: center; }
.margin_0 { margin: 0px; }
.nopad { padding: 0px; }

// Form styling
.input_item {
  padding-top: 7px !important;
  padding-bottom: 7px !important;
}

// Card styling
.customcard {
  border-radius: 0px;
  margin: 0px;
  width: 100%;
}

// Button styling
.foobtn {
  background-color: #5be283;
  height: 3.6rem;
  font-size: 1.4rem;
  color: white;
}
```

### Statistics/Chart Styling
```scss
.barDiv {
  width: 100%;
  height: 10px;
  background: #e0e0e0 !important;
  border-radius: 5px;
}

.bar-fill {
  height: 10px;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.bar-fill.rma { background: green; }  // Home team
.bar-fill.atm { background: red; }    // Away team
```

## Service Patterns

### HTTP Service Usage
```typescript
// Service method
getData(params: any): Observable<any> {
  return this.httpService.get<any>('api/endpoint', params);
}

// Component usage
loadData() {
  this.commonService.showLoader('Loading...');
  
  this.dataService.getData(this.params).subscribe(
    (response) => {
      this.data = response;
      this.commonService.hideLoader();
    },
    (error) => {
      this.commonService.hideLoader();
      this.commonService.toastMessage(
        'Failed to load data',
        2500,
        ToastMessageType.Error
      );
    }
  );
}
```

### Modal Patterns
```typescript
// Ionic modal
presentModal() {
  let modal = this.modalCtrl.create('ModalPage', {
    data: this.selectedItem
  });
  
  modal.onDidDismiss((data) => {
    if (data) {
      this.handleModalResult(data);
    }
  });
  
  modal.present();
}

// Alert
showConfirmAlert() {
  this.commonService.commonAlter(
    'Confirm Action',
    'Are you sure?',
    () => this.performAction()
  );
}
```

## API Patterns

### API Constants
```typescript
export const API = {
  USER_UPDATE: 'user',
  GET_LEAGUE_MATCHES: 'league/getLeagueMatches',
  UPDATE_RESULT_ENTITY: 'LeagueResult/updateResultEntity',
  CREATE_EVENT: 'events/create_event',
};
```

### Error Handling
```typescript
handleError(error: any) {
  let message = 'An error occurred';
  
  if (error.status === 0) {
    message = 'Network connection error';
  } else if (error.status >= 500) {
    message = 'Server error';
  }
  
  this.commonService.toastMessage(
    message,
    3000,
    ToastMessageType.Error
  );
}
```

## Navigation Patterns
```typescript
// Standard navigation
this.navCtrl.push('PageName', { data: this.selectedItem });

// Modal navigation
let modal = this.modalCtrl.create('ModalPage', { data: this.item });
modal.present();

// Receiving data
constructor(public navParams: NavParams) {
  this.item = this.navParams.get('item');
}
```

## Storage Patterns
```typescript
// Store/retrieve data
this.storage.set('userObj', JSON.stringify(userData));
this.storage.get('userObj').then((val) => {
  if (val) this.user = JSON.parse(val);
});

// SharedServices usage
this.sharedService.setUserData(userData);
this.sharedService.getUserData();
```

## Best Practices
- Use `@IonicPage()` for lazy loading
- Always cleanup subscriptions in `ionViewWillLeave()`
- Handle HTTP errors with user-friendly messages
- Use TypeScript interfaces for type safety
- Use emoji comments: `// 🏢 Parent club ID`
- Cache frequently accessed data
- Validate all user inputs
- **NO OPTIONAL CHAINING**: Avoid using optional chaining (`?.`) - use explicit null checks instead