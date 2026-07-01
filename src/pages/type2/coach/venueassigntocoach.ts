import { Component, Renderer2 } from '@angular/core';
import { NavController, PopoverController, LoadingController, NavParams, Events } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import {IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { HttpService } from '../../../services/http.service';
import { API } from '../../../shared/constants/api_constants';
import { AppType } from '../../../shared/constants/module.constants';
import { take } from 'rxjs/operators';
import { ThemeService } from '../../../services/theme.service';
@IonicPage()
@Component({
    selector: 'venueassigntocoach-page',
    templateUrl: 'venueassigntocoach.html',
    providers: [HttpService]
})

export class Type2VenueAssignCoach {
    themeType: number;
    isDarkTheme: boolean = true;
    selectedParentclubKey: any;
    selectedClubKey: any;
    clubs: any;
    selectedclub: any;
    activities: any;
    selectedActivities: any;
    coachKey: "";
    tempCoachObj: any;
    clubupadefinished: any;
    clubObj = {
        City: "",
        ClubAdminEmailID: "",
        ClubContactName: "",
        ClubDescription: "",
        ClubName: "",
        ClubShortName: "",
        ContactPhone: "",
        FirstLineAddress: "",
        IsActive: true,
        IsEnable: true,
        OriginalClubKey: "",
        PostCode: "",
        SecondLineAddress: "",
        State: "",
        Type: "",
        ParentClubKey: "",
        ClubKey: ""
    }

    coachObj = {
        ParentClubKey: "",
        FirstName: "",
        MiddleName: "",
        LastName: "",
        Gender: "",
        EmailID: "",
        PhoneNumber: "",
        DOB: "",
        DBSNumber: "",
        RegistrationNumber: "",
        Recognition: "",
        ShortDescription: "",
        DetailDescription: "",
        IsActive: true,
        IsEnabled: true,
        IsVenueAssigned: false,
        CoachKey: ""
    }

    activityObj = {
        ActivityCode: "",
        ActivityName: "",
        AliasName: ""
    }
    clubupadefinished1: any;
    tempCoachArr = [];
    act: any;
    clubcall: any;
    //TempActivities = [];
    constructor(
         public navParams: NavParams, 
         public loadingCtrl: LoadingController,
          public storage: Storage, public fb: FirebaseService, 
          public navCtrl: NavController, 
          public sharedservice: SharedServices, 
          public popoverCtrl: PopoverController,
          private comonService: CommonService,
          private httpService: HttpService,
          private renderer: Renderer2,
          private themeService: ThemeService,
          public events: Events,) {



        this.themeType = sharedservice.getThemeType();
        this.tempCoachObj = navParams.get('CoachInfo');

        // ── Load the venue catalog + the coach's existing assignments via REST ──
        // (coach/get-venue-assignments + club/GetParentClubVenues + club_activity/get_club_activities)
        this.loadVenueAssignments();

        /* LEGACY: Firebase-based venue/activity loading. Replaced by the REST APIs above.
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.selectedParentclubKey = club.ParentClubKey;
                    this.clubcall = this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentclubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
                        this.clubs = data;
                        if (data.length > 0) {
                            this.selectedclub = data[0];
                            this.selectedClubKey = data[0].$key;
                            // this.getActivities();
                            // this.selectedClubKey = data[0].$key;
                            //this.getActivities();
                            for (let i = 0; i < this.clubs.length; i++) {
                                this.act = this.fb.getAll("/Activity/" + this.selectedParentclubKey + "/" + this.clubs[i].$key).subscribe((data) => {

                                    this.activities = data;
                                 
                                    if (data.length > 0) {
                                        this.clubs[i].IsSelected = false;
                                        this.clubs[i].Activities = data;
                                        //this.clubs[i].TempActivities = [];
                                        this.selectedActivities = data[0];
                                        if (this.clubs[i].Activities.length != undefined) {
                                            for (let j = 0; j < this.clubs[i].Activities.length; j++) {
                                                this.clubs[i].Activities[j].IsSelected = false;
                                            }
                                        }

                                        if (this.clubs[i].Activities.length != undefined) {
                                            if (this.tempCoachObj.Club != undefined) {
                                                for (let s = 0; s < this.tempCoachObj.Club.length; s++) {
                                                    if (this.clubs[i].$key == this.tempCoachObj.Club[s].Key) {
                                                        this.clubs[i].IsSelected = true;
                                                        for (let r = 0; r < this.clubs[i].Activities.length; r++) {
                                                            if (this.tempCoachObj.Club[s].Activity != undefined) {
                                                                for (let t = 0; t < this.tempCoachObj.Club[s].Activity.length; t++) {
                                                                    if (this.clubs[i].Activities[r].$key == this.tempCoachObj.Club[s].Activity[t].Key) {
                                                                        this.clubs[i].Activities[r].disabled = true;
                                                                        this.clubs[i].Activities[r].IsSelected = true;
                                                                        //this.clubs[i].IsSelected = true;
                                                                        break;
                                                                    }
                                                                    else {
                                                                        this.clubs[i].Activities[r].disabled = false;

                                                                    }
                                                                }
                                                            }

                                                        }
                                                    }
                                                }
                                            }

                                        }

                                    }


                                });

                                if (this.tempCoachObj.Club != undefined) {
                                    for (let k = 0; k < this.tempCoachObj.Club.length; k++) {
                                        if (this.clubs[i].$key == this.tempCoachObj.Club[k].Key) {
                                            this.clubs[i].disabled = true;
                                            this.clubs[i].IsSelected = true;
                                            break;
                                        }
                                        else {
                                            this.clubs[i].disabled = false;
                                            this.clubs[i].IsSelected = false;
                                        }
                                    }
                                }







                            }
                     
                        }
                    });



                    // this.getCoachList();
                    // this.getClubList();

                }
        })
        */
    }

    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }

    ionViewWillEnter() {
        // 🌗 Theme setup
        this.loadTheme();
        this.themeService.isDarkTheme$.subscribe(isDark => this.applyTheme(isDark));
        this.events.subscribe('theme:changed', (isDark) => this.applyTheme(isDark));
    }

    ionViewWillLeave() {
        this.events.unsubscribe('theme:changed');
    }

    // 🌗 Theme: load persisted preference and apply
    async loadTheme() {
        const isDarkTheme = await this.storage.get('dashboardTheme');
        const isDark = isDarkTheme !== null ? isDarkTheme : true;
        this.isDarkTheme = isDark;
        this.applyTheme(isDark);
    }

    // 🌗 Theme: toggle light-theme class on the page element
    applyTheme(isDark: boolean) {
        this.isDarkTheme = isDark;
        const pageElement = document.querySelector('venueassigntocoach-page');
        if (pageElement) {
            isDark ? this.renderer.removeClass(pageElement, 'light-theme')
                   : this.renderer.addClass(pageElement, 'light-theme');
        }
    }


    // assignVenueToCoach() {
    //     try {
    //         this.act.unsubscribe();
    //         this.clubcall.unsubscribe();
    //         this.coachObj.ParentClubKey = this.selectedParentclubKey;
    //         this.coachObj.FirstName = this.tempCoachObj.FirstName;
    //         this.coachObj.MiddleName = this.tempCoachObj.MiddleName || "";
    //         this.coachObj.LastName = this.tempCoachObj.LastName;
    //         this.coachObj.Gender = this.tempCoachObj.Gender;
    //         this.coachObj.EmailID = this.tempCoachObj.EmailID;
    //         this.coachObj.PhoneNumber = this.tempCoachObj.PhoneNumber;
    //         this.coachObj.DOB = this.tempCoachObj.DOB;
    //         this.coachObj.DBSNumber = this.tempCoachObj.DBSNumber;
    //         this.coachObj.RegistrationNumber = this.tempCoachObj.RegistrationNumber;
    //         this.coachObj.Recognition = this.tempCoachObj.Recognition;
    //         this.coachObj.ShortDescription = this.tempCoachObj.ShortDescription ? this.tempCoachObj.ShortDescription:"";
    //         this.coachObj.DetailDescription = this.tempCoachObj.DetailDescription ? this.tempCoachObj.DetailDescription :"";
    //         this.coachObj.IsActive = this.tempCoachObj.IsActive;
    //         this.coachObj.IsEnabled = this.tempCoachObj.IsEnabled;
    //         this.coachObj.IsVenueAssigned = true;
    //         this.coachObj.CoachKey = this.tempCoachObj.$key;

    //         for (let i = 0; i < this.clubs.length; i++) {
    //             if (this.clubs[i].IsSelected == true) {
    //                 this.clubs[i].IsChecked = true;
    //                 for (let k = 0; k < this.clubs[i].Activities.length; k++) {
    //                     if (this.clubs[i].Activities[k].IsSelected == true) {
    //                         this.clubs[i].Activities[k].IsChecked = true;
    //                     }

    //                 }
    //             }
    //         }
    //         for (let i = 0; i < this.clubs.length; i++) {
    //             if (this.clubs[i].IsChecked == true) {

    //                 this.clubObj.City = this.clubs[i].City;
    //                 this.clubObj.ClubAdminEmailID = this.clubs[i].ClubAdminEmailID;
    //                 this.clubObj.ClubContactName = this.clubs[i].ClubContactName;
    //                 this.clubObj.ClubDescription = this.clubs[i].ClubDescription ? this.clubs[i].ClubDescription:"";
    //                 this.clubObj.ClubName = this.clubs[i].ClubName;
    //                 this.clubObj.ClubShortName = this.clubs[i].ClubShortName;
    //                 this.clubObj.ContactPhone = this.clubs[i].ContactPhone ? this.clubs[i].ContactPhone : "";
    //                 this.clubObj.FirstLineAddress = this.clubs[i].FirstLineAddress;
    //                 this.clubObj.IsActive = true;
    //                 this.clubObj.IsEnable = true;
    //                 this.clubObj.OriginalClubKey = this.clubs[i].OriginalClubKey;
    //                 this.clubObj.PostCode = this.clubs[i].PostCode;
    //                 this.clubObj.SecondLineAddress = this.clubs[i].SecondLineAddress ? this.clubs[i].SecondLineAddress:"";
    //                 this.clubObj.State = this.clubs[i].City;
    //                 this.clubObj.Type = this.clubs[i].Type;
    //                 this.clubObj.ParentClubKey = this.selectedParentclubKey;
    //                 this.clubObj.ClubKey = this.clubs[i].$key;

    //                 this.clubupadefinished = this.fb.update(this.clubs[i].$key, "/Coach/Type2/" + this.selectedParentclubKey + "/" + this.coachObj.CoachKey + "/Club/", this.clubObj);

    //                 this.fb.update(this.coachObj.CoachKey, "/Club/Type2/" + this.selectedParentclubKey + "/" + this.clubs[i].$key + "/Coach/", this.coachObj);
    //                 this.fb.update(this.coachObj.CoachKey, "/Coach/Type2/" + this.selectedParentclubKey + "/", { IsVenueAssigned: true });

    //                 if (this.clubs[i].Activities != undefined) {
    //                     for (let k = 0; k < this.clubs[i].Activities.length; k++) {
    //                         if (this.clubs[i].Activities[k].IsChecked == true) {
    //                             this.activityObj.ActivityCode = this.clubs[i].Activities[k].ActivityCode;
    //                             this.activityObj.ActivityName = this.clubs[i].Activities[k].ActivityName;
    //                             this.activityObj.AliasName = this.clubs[i].Activities[k].AliasName;
    //                             this.clubupadefinished = this.fb.update(this.clubs[i].Activities[k].$key, "/Coach/Type2/" + this.selectedParentclubKey + "/" + this.coachObj.CoachKey + "/Club/" + this.clubs[i].$key + "/Activity/", this.activityObj);
    //                             this.fb.update(this.clubs[i].Activities[k].$key, "/Coach/Type2/" + this.selectedParentclubKey + "/" + this.coachObj.CoachKey + "/Activity/", this.activityObj);
    //                             this.fb.update(this.coachObj.CoachKey, "/Activity/" + this.selectedParentclubKey + "/" + this.clubs[i].$key + "/" + this.clubs[i].Activities[k].$key + "/Coach/", this.coachObj);
    //                             this.activityObj = {
    //                                 ActivityCode: "",
    //                                 ActivityName: "",
    //                                 AliasName: ""
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }

    //         if (this.clubupadefinished != undefined) {
    //             this.comonService.toastMessage("Saved successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    //             this.comonService.updateCategory("coach_list");
    //             this.navCtrl.pop();
    //         } else {
    //             this.comonService.toastMessage("Please select at least one venue", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    //         }
    //     }catch (error) {
    //         console.error("Error assigning venue to coach:", error);
    //         this.comonService.toastMessage("Failed to save. Please try again.", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    //     }
    // }

    /* LEGACY: mapped Firebase keys to Postgres ids before saving. Replaced by the
       get-venue-assignments / save-venue-assignments implementation below.
    async assignVenueToCoach() {
        try {
            // Stop the Firebase listeners set up in the constructor.
            if (this.act && this.act.unsubscribe) { this.act.unsubscribe(); }
            if (this.clubcall && this.clubcall.unsubscribe) { this.clubcall.unsubscribe(); }

            // 1) Gather the venues/activities the admin selected (Firebase keys).
            const selectedVenues: { clubKey: string; activityKeys: string[] }[] = [];
            for (const club of (this.clubs || [])) {
                if (club.IsSelected !== true) { continue; }
                const activityKeys = (club.Activities || [])
                    .filter((activity: any) => activity.IsSelected === true)
                    .map((activity: any) => activity.$key);
                selectedVenues.push({ clubKey: club.$key, activityKeys });
            }

            if (selectedVenues.length === 0) {
                this.comonService.toastMessage("Please select at least one venue", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                return;
            }

            // 2) Resolve the Postgres ids the backend expects.
            const parentClubId = this.sharedservice.getPostgreParentClubId();
            const coachId = this.tempCoachObj && this.tempCoachObj.Id;
            if (!coachId || !parentClubId) {
                this.comonService.toastMessage("Unable to identify the coach or club. Please try again.", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                return;
            }

            this.comonService.showLoader("Saving venue assignments...");

            const commonIds = {
                app_type: AppType.ADMIN_NEW,
                device_type: this.sharedservice.getPlatform() == "android" ? 1 : 2,
                device_id: this.sharedservice.getDeviceId() || 'web',
                updated_by: this.sharedservice.getLoggedInUserId() || 'system'
            };

            // 2a) Map venue Firebase key -> Postgres club id.
            const venuesRes: any = await this.httpService
                .post(API.GET_PARENT_CLUB_VENUES, { parentclub_id: parentClubId, ...commonIds })
                .pipe(take(1)).toPromise();
            const venueIdMap = new Map<string, string>();
            (venuesRes && venuesRes.data ? venuesRes.data : []).forEach((venue: any) => {
                if (venue.FirebaseId) { venueIdMap.set(venue.FirebaseId, venue.Id); }
            });

            // 3) Build the assignments payload, translating activity keys per venue.
            const assignments: { venueId: string; activityIds: string[] }[] = [];
            for (const selected of selectedVenues) {
                const venuePostgreId = venueIdMap.get(selected.clubKey);
                if (!venuePostgreId) { continue; }

                let activityIds: string[] = [];
                if (selected.activityKeys.length > 0) {
                    const activitiesRes: any = await this.httpService
                        .post(API.CLUB_ACTIVITIES, { parentclubId: parentClubId, clubId: venuePostgreId, ...commonIds })
                        .pipe(take(1)).toPromise();
                    const clubActivities = (activitiesRes && activitiesRes.data && activitiesRes.data.club_activities) || [];
                    const activityIdMap = new Map<string, string>();
                    clubActivities.forEach((ca: any) => {
                        if (ca.activity_key && ca.activity && ca.activity.Id) {
                            activityIdMap.set(ca.activity_key, ca.activity.Id);
                        }
                    });
                    activityIds = selected.activityKeys
                        .map((key: string) => activityIdMap.get(key))
                        .filter((id: string) => !!id);
                }

                assignments.push({ venueId: venuePostgreId, activityIds });
            }

            if (assignments.length === 0) {
                this.comonService.hideLoader();
                this.comonService.toastMessage("Could not resolve the selected venues. Please try again.", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                return;
            }

            // 4) Persist via the backend (it dual-writes to Firebase).
            const payload = { coach_id: coachId, parent_club_id: parentClubId, assignments };
            await this.httpService.post(API.SAVE_VENUE_ASSIGNMENTS, payload).pipe(take(1)).toPromise();

            this.comonService.hideLoader();
            this.comonService.toastMessage("Saved successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            this.comonService.updateCategory("coach_list");
            this.navCtrl.pop();
        } catch (error) {
            this.comonService.hideLoader();
            console.error("Error assigning venue to coach:", error);
            this.comonService.toastMessage("Failed to save. Please try again.", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
    }
    */

    // ─────────────────────────────────────────────────────────────────────────
    //  Venue assignment via REST (mirrors the APWeb-Admin coach-edit page)
    //  - club/GetParentClubVenues        → full venue catalog
    //  - club_activity/get_club_activities → activities per venue
    //  - coach/get-venue-assignments      → existing active/inactive status
    //  - coach/save-venue-assignments     → persist the selected assignments
    // ─────────────────────────────────────────────────────────────────────────

    /** Common identity fields expected by the backend REST envelope. */
    private buildCommonIds() {
        return {
            app_type: AppType.ADMIN_NEW,
            device_type: this.sharedservice.getPlatform() == "android" ? 1 : 2,
            device_id: this.sharedservice.getDeviceId() || 'web',
            updated_by: this.sharedservice.getLoggedInUserId() || 'system'
        };
    }

    /** Normalises a backend status value (boolean / 1 / '1' / 'active' / 'true') to a boolean. */
    private toBool(v: any): boolean {
        if (typeof v === 'boolean') { return v; }
        if (typeof v === 'number') { return v === 1; }
        const s = String(v == null ? '' : v).toLowerCase();
        return s === 'true' || s === '1' || s === 'active';
    }

    /**
     * Loads the venue catalog + the coach's existing assignments and renders them
     * into `this.clubs` (consumed by the template). Activity selection is seeded
     * from coach/get-venue-assignments.
     */
    async loadVenueAssignments() {
        try {
            const parentClubId = this.sharedservice.getPostgreParentClubId();
            const coachId = this.navParams.get('CoachId') || (this.tempCoachObj && (this.tempCoachObj.Id || this.tempCoachObj.id));
            if (!coachId || !parentClubId) {
                this.comonService.toastMessage("Unable to identify the coach or club.", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                return;
            }

            this.comonService.showLoader("Loading venues...");
            const commonIds = this.buildCommonIds();

            // 1) Existing assignments → status map keyed by `${venueId}::${activityId}`.
            //    Response shape: { data: [{ id, name, activity: [{ id, name, status }] }] }
            const assignmentsRes: any = await this.httpService
                .post(API.GET_VENUE_ASSIGNMENTS, { coach_id: coachId, ...commonIds })
                .pipe(take(1)).toPromise();
            const statusMap = new Map<string, boolean>();
            const assignedVenues: any[] = (assignmentsRes && assignmentsRes.data) || [];
            assignedVenues.forEach((v: any) => {
                (v.activity || []).forEach((a: any) => {
                    statusMap.set(`${v.id}::${a.id}`, this.toBool(a.status));
                });
            });

            // 2) Full venue catalog. Response: { data: ClubVenueDto[] } (Id = postgres venue id).
            const venuesRes: any = await this.httpService
                .post(API.GET_PARENT_CLUB_VENUES, { parentclub_id: parentClubId, ...commonIds })
                .pipe(take(1)).toPromise();
            const venueList: any[] = (venuesRes && venuesRes.data) || [];

            // 3) Activities per venue, overlaying the assignment status.
            const builtClubs: any[] = [];
            for (const venue of venueList) {
                const venueId = venue.Id;
                const activitiesRes: any = await this.httpService
                    .post(API.CLUB_ACTIVITIES, { parentclubId: parentClubId, clubId: venueId, ...commonIds })
                    .pipe(take(1)).toPromise();
                const rawActivities: any[] = (activitiesRes && activitiesRes.data && activitiesRes.data.club_activities) || [];

                // Deduplicate by activity_key — the API sometimes returns duplicate rows
                // when multiple records share the same Firebase activity key.
                const seenKeys = new Set<string>();
                const clubActivities: any[] = rawActivities.filter((ca: any) => {
                    const key = ca.activity_key || (ca.activity && (ca.activity.Id || ca.activity.id));
                    if (!key || seenKeys.has(key)) { return false; }
                    seenKeys.add(key);
                    return true;
                });

                const activities = clubActivities.map((ca: any) => {
                    const activityId = (ca.activity && (ca.activity.Id || ca.activity.id)) || ca.Id || ca.activity_id;
                    const activityName = (ca.activity && (ca.activity.ActivityName || ca.activity.activity_name))
                        || ca.ActivityName || ca.activity_name || '';
                    return {
                        Id: activityId,
                        activity_key: ca.activity_key,
                        ActivityName: activityName,
                        IsSelected: statusMap.get(`${venueId}::${activityId}`) || false,
                        disabled: false
                    };
                });

                builtClubs.push({
                    Id: venueId,
                    $key: venue.FirebaseId,
                    ClubName: venue.ClubName,
                    IsSelected: activities.some((a: any) => a.IsSelected),
                    // Auto-expand venues that already have selections so admin can see them
                    _expanded: activities.some((a: any) => a.IsSelected),
                    // A venue with no activities cannot be assigned, so it is not selectable.
                    disabled: activities.length === 0,
                    Activities: activities
                });
            }

            this.clubs = builtClubs;
            this.comonService.hideLoader();
        } catch (error) {
            this.comonService.hideLoader();
            console.error("Error loading venue assignments:", error);
            this.comonService.toastMessage("Failed to load venues. Please try again.", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
    }

    /**
     * Master toggle for a venue. Selecting a venue selects all of its activities;
     * deselecting it clears them. Venues with no activities are not selectable.
     */
    onVenueToggle(club: any, checked: boolean) {
        if (!club || club.disabled) { return; }

        const activities = club.Activities || [];
        if (activities.length === 0) {
            // Guard: nothing to assign, keep the venue unselected.
            club.IsSelected = false;
            return;
        }

        club.IsSelected = checked;
        activities.forEach((activity: any) => {
            if (!activity.disabled) {
                activity.IsSelected = checked;
            }
        });
    }

    /**
     * Keeps the venue checkbox in sync with its activities: the venue is considered
     * selected when at least one of its activities is selected.
     */
    onActivityToggle(club: any, activity: any, checked: boolean) {
        if (!activity || activity.disabled) { return; }
        activity.IsSelected = checked;

        if (!club) { return; }
        const activities = club.Activities || [];
        club.IsSelected = activities.some((a: any) => a.IsSelected);
    }

    /**
     * Persists the selected venue/activity assignments in a single call via
     * coach/save-venue-assignments. Every venue+activity is sent with its current
     * status so both activations and deactivations are saved.
     */
    async assignVenueToCoach() {
        try {
            const parentClubId = this.sharedservice.getPostgreParentClubId();
            const coachId = this.navParams.get('CoachId') || (this.tempCoachObj && (this.tempCoachObj.Id || this.tempCoachObj.id));
            if (!coachId || !parentClubId) {
                this.comonService.toastMessage("Unable to identify the coach or club.", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                return;
            }

            // Build assignments: each venue with activities, every activity carrying its status.
            const assignments: { venueId: string; activities: { activityId: string; status: boolean }[] }[] = [];
            for (const club of (this.clubs || [])) {
                const activities = (club.Activities || [])
                    .filter((a: any) => !!a.Id)
                    .map((a: any) => ({ activityId: a.Id, status: !!a.IsSelected }));
                if (activities.length > 0) {
                    assignments.push({ venueId: club.Id, activities });
                }
            }

            const hasAnySelected = assignments.some(v => v.activities.some(a => a.status));
            if (!hasAnySelected) {
                this.comonService.toastMessage("Please select at least one venue activity", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                return;
            }

            this.comonService.showLoader("Saving venue assignments...");
            const payload = {
                coach_id: coachId,
                parent_club_id: parentClubId,
                assignments,
                ...this.buildCommonIds()
            };
            await this.httpService.post(API.SAVE_VENUE_ASSIGNMENTS, payload).pipe(take(1)).toPromise();

            this.comonService.hideLoader();
            this.comonService.toastMessage("Saved successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            this.comonService.updateCategory("coach_list");
            this.navCtrl.pop();
        } catch (error) {
            this.comonService.hideLoader();
            console.error("Error assigning venue to coach:", error);
            this.comonService.toastMessage("Failed to save. Please try again.", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
    }

    saveCoach() {


    }

    cancelVenueToCoach() {
        this.navCtrl.pop();
    }

    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

}
