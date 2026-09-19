import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Events } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../../services/graphql.service';
import { SharedServices } from '../../../services/sharedservice';
import { UsersModel } from '../../../../shared/model/users_list.model';
import { UsersListInput } from '../model/member';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
/**
 * Generated class for the FiltermemberPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-filtermember',
  templateUrl: 'filtermember.html',
  providers: [FirebaseService, CommonService]
})
export class FiltermemberPage {
  isDarkTheme: boolean = true;
  isLoading: boolean = false;
  hasLoaded: boolean = false;
  filteredMember: Array<any> = [];
  unmutated_memblist: Array<any> = [];
  members: Array<any> = [];
  parentClubKey: string = '';
  selectedClub: string = '';
  private searchTerms = new Subject<string>();
  private shouldFetchOnEnter: boolean = false;
  public isSelfFetching: boolean = false;
  hasMore: boolean = true;
  venus_user_input: UsersListInput = {
    parentclub_id: '',
    club_id: '',
    search_term: '',
    limit: 18,
    offset: 0,
    member_type: 1
  };

  constructor(public commonService: CommonService,
    public navCtrl: NavController, public navParams: NavParams,
    public viewCtrl: ViewController, public fb: FirebaseService,
    private storage: Storage, private events: Events,
    private graphqlService: GraphqlService, public sharedservice: SharedServices) {
    this.loadTheme();

    this.searchTerms.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      const term = searchTerm ? searchTerm.trim() : '';
      if (this.isSelfFetching) {
        this.venus_user_input.offset = 0;
        this.venus_user_input.limit = 18;
        this.hasMore = true;
        this.venus_user_input.search_term = term;
        this.getParentClubUsers(2);
        return;
      }

      if (term) {
        const normalizedTerm = term.toLowerCase();
        this.members = this.unmutated_memblist.filter(item => {
          const firstName = item && item.FirstName ? item.FirstName.toLowerCase() : '';
          const lastName = item && item.LastName ? item.LastName.toLowerCase() : '';
          return firstName.indexOf(normalizedTerm) > -1 || lastName.indexOf(normalizedTerm) > -1;
        });
      } else {
        this.members = this.unmutated_memblist;
      }
    });
  }

  private pendingPassedList: any[] = null;

  ionViewDidLoad() {
    console.log('ionViewDidLoad FiltermemberPage');

    const parentclubId = this.navParams.get('parentclub_id');
    const clubId = this.navParams.get('club_id');
    const memberType = this.navParams.get('member_type');
    const passedList = this.navParams.get('memberList');

    if (parentclubId || clubId) {
      this.isSelfFetching = true;
      this.venus_user_input.parentclub_id = parentclubId || this.sharedservice.getPostgreParentClubId();
      this.venus_user_input.club_id = clubId || '';
      this.venus_user_input.member_type = memberType !== undefined && memberType !== null ? memberType : 1;
      this.shouldFetchOnEnter = true;
    } else if (passedList !== undefined && passedList !== null) {
      this.pendingPassedList = passedList;
    } else {
      this.isSelfFetching = true;
      this.venus_user_input.parentclub_id = this.sharedservice.getPostgreParentClubId();
      this.venus_user_input.member_type = memberType !== undefined && memberType !== null ? memberType : 1;
      this.shouldFetchOnEnter = true;
    }
  }

  ionViewDidEnter() {
    if (this.shouldFetchOnEnter) {
      this.shouldFetchOnEnter = false;
      this.getParentClubUsers(2);
    } else if (this.pendingPassedList !== null) {
      this.setMembers(this.pendingPassedList);
      this.pendingPassedList = null;
      this.hasLoaded = true;
    }
  }

  private setMembers(list: any[], append: boolean = false) {
    const mappedMembers = list.map((member: UsersModel) => ({
      ...JSON.parse(JSON.stringify(member)),
      isSelected: this.filteredMember.some(selectedMember => selectedMember.Id === member.Id)
    }));

    if (append) {
      const existingIds = new Set(this.members.map(member => member.Id));
      mappedMembers.forEach(member => {
        if (!existingIds.has(member.Id)) {
          this.members.push(member);
          existingIds.add(member.Id);
        }
      });
    } else {
      this.members = mappedMembers;
    }

    this.unmutated_memblist = this.members;
  }

  doInfinite(infiniteScroll: any) {
    this.venus_user_input.offset += this.venus_user_input.limit;
    const request = this.getParentClubUsers(1);
    request.add(() => {
      setTimeout(() => infiniteScroll.complete(), 200);
    });
  }

  getParentClubUsers(type: number = 2) {
    const shouldShowLoader = type !== 1;
    this.isLoading = true;
    if (shouldShowLoader) {
      this.commonService.showLoader('Fetching users...');
    }
    const userQuery = gql`
      query getAllMembersByParentClubNMemberType($list_input: UsersListInput!) {
        getAllMembersByParentClubNMemberType(userInput: $list_input) {
          Id
          FirebaseKey
          FirstName
          LastName
          ClubKey
          IsChild
          DOB
          EmailID
          EmergencyContactName
          EmergencyNumber
          Gender
          MedicalCondition
          ParentClubKey
          ParentKey
          PhoneNumber
          IsEnable
          IsActive
          PromoEmailAllowed
        }
      }
    `;

    return this.graphqlService.query(userQuery, { list_input: this.venus_user_input }, 0)
      .subscribe(({ data }) => {
        const users = (data['getAllMembersByParentClubNMemberType'] || []) as UsersModel[];
        this.setMembers(users, type === 1);
        this.hasMore = users.length === this.venus_user_input.limit;
        this.hasLoaded = true;
        this.isLoading = false;
        if (shouldShowLoader) {
          this.commonService.hideLoader();
        }
      }, () => {
        if (shouldShowLoader) {
          this.commonService.hideLoader();
        }
        this.isLoading = false;
        this.hasLoaded = true;
        this.commonService.toastMessage('Users fetch failed', 3000, ToastMessageType.Error, ToastPlacement.Bottom);
      });
  }

  toggleMember(member: any, isChecked?: boolean) {
    const checked = (isChecked === undefined || isChecked === null) ? !member.isSelected : isChecked;
    member.isSelected = checked;
    const selectedIndex = this.filteredMember.findIndex(m => m.Id === member.Id);
    if (checked && selectedIndex === -1) { this.filteredMember.push(member); }
    else if (!checked && selectedIndex > -1) { this.filteredMember.splice(selectedIndex, 1); }
  }

  dismiss() {
    this.viewCtrl.dismiss({ selectedMembers: this.filteredMember });
  }

  cancel() {
    this.viewCtrl.dismiss({ selectedMembers: null });
  }

  getFilterItems(ev: any) {
    const searchTerm = ev && ev.target ? ev.target.value : '';
    this.searchTerms.next(searchTerm || '');
  }

  loadTheme() {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme !== null ? isDarkTheme : true;
      this.applyTheme();
    }).catch(() => { this.isDarkTheme = true; this.applyTheme(); });
    this.events.subscribe('theme:changed', (isDark) => { this.isDarkTheme = isDark; this.applyTheme(); });
  }

  applyTheme() {
    const el = document.querySelector('page-filtermember');
    if (el) {
      if (this.isDarkTheme) { el.classList.remove('light-theme'); } else { el.classList.add('light-theme'); }
    }
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }
}
