# Implementation: Singles/Doubles Match Action Sheet in League Details

## Overview

**Current Behavior:** In `leaguedetails.ts`, clicking any match card calls `gotoLeagueMatchInfoPage()` which navigates to `LeagueMatchInfoPage` — appropriate for team matches but not for singles/doubles.

**Required Behavior:** For singles/doubles matches (`league_type === 1` or `league_type === 2`), clicking a match card should show an ActionSheet with:
- **Publish Result** (if result NOT published, i.e., `ResultStatus !== 1`)
- **View Result** (if result IS published, i.e., `ResultStatus === 1`)
- **Edit Match**
- **Delete Match**

---

## File to Modify

`src/pages/type2/league/leaguedetails/leaguedetails.ts`

---

## Current Match Click Handler (HTML)

```html
<!-- In leaguedetails.html, Matches Tab (index 1) -->
<div class="revamp-card" (click)="gotoLeagueMatchInfoPage(mat)" *ngFor="let mat of match">
```

**Change to:**
```html
<div class="revamp-card" (click)="onMatchCardClick(mat)" *ngFor="let mat of match">
```

---

## Implementation Logic

### New Method: `onMatchCardClick(mat: LeagueMatch)`

```typescript
onMatchCardClick(mat: LeagueMatch) {
  // Team matches → navigate to match info page (existing behavior)
  if (this.individualLeague.league_type === 3) {
    this.gotoLeagueMatchInfoPage(mat);
    return;
  }
  // Singles/Doubles → show action sheet
  this.showSinglesDoublesActionSheet(mat);
}
```

### New Method: `showSinglesDoublesActionSheet(mat: LeagueMatch)`

```typescript
showSinglesDoublesActionSheet(mat: LeagueMatch) {
  const isResultPublished = mat.ResultStatus === 1;

  const buttons: any[] = [];

  if (isResultPublished) {
    buttons.push({
      text: "View Result",
      handler: () => this.viewResult(mat)
    });
  } else {
    buttons.push({
      text: "Publish Result",
      handler: () => this.publishResultForSinglesDoubles(mat)
    });
  }

  buttons.push({
    text: "Edit Match",
    handler: () => this.gotoEditPage(mat)
  });

  buttons.push({
    text: "Delete Match",
    role: "destructive",
    handler: () => this.removeMatch(mat)
  });

  buttons.push({ text: "Cancel", role: "cancel" });

  const actionSheet = this.actionSheetCtrl.create({ buttons });
  actionSheet.present();
}
```

### New Method: `viewResult(mat: LeagueMatch)`

Navigates to `TennisSummaryTennisPage` (for tennis) with required params:

```typescript
viewResult(mat: LeagueMatch) {
  const params = {
    match: mat,
    leagueId: this.individualLeague.id,
    activityId: this.individualLeague.activity.Id,
    activityCode: this.individualLeague.activity.ActivityCode,
    homeTeam: { id: mat.home_participant_id, parentclubteam: { id: mat.home_team_id, teamName: mat.homeusername } },
    awayTeam: { id: mat.away_participant_id, parentclubteam: { id: mat.away_team_id, teamName: mat.awayusername } },
    isLeague: true
  };
  this.navCtrl.push("TennisSummaryTennisPage", params);
}
```

### New Method: `publishResultForSinglesDoubles(mat: LeagueMatch)`

Same navigation as `viewResult` — the `TennisSummaryTennisPage` handles both viewing and publishing:

```typescript
publishResultForSinglesDoubles(mat: LeagueMatch) {
  this.viewResult(mat); // Same page handles publish when ResultStatus !== 1
}
```

---

## Existing Methods Already Available (No Changes Needed)

| Action | Method | What it does |
|--------|--------|--------------|
| Edit Match | `gotoEditPage(mat)` | Navigates to `UpdateleaguematchPage` with match object |
| Delete Match | `removeMatch(mat)` | Shows confirm alert, then calls `removeLeagueMatch(mat)` |
| Delete API | `removeLeagueMatch(mat)` | POST to `API.DELETE_LEAGUE_MATCHES` with `{ leagueFixtureId: mat.fixture_id }` |

---

## APIs Used

| Action | Endpoint | Method | Payload |
|--------|----------|--------|---------|
| Get Match Result | `LeagueResult/getLeagueMatchResult` | POST | `{ parentclubId, clubId, activityId, ActivityCode, memberId, action_type, device_type, app_type, device_id, updated_by, created_by, MatchId }` |
| Publish Result | `LeagueResult/publishLeagueResultForActivities` | POST | `PublishLeagueResultForActivitiesInput` (see model below) |
| Delete Match | `league/deleteLeagueMatches` | POST | `{ leagueFixtureId: string }` |
| Edit Match | N/A (page navigation) | — | NavParams: `{ match: LeagueMatch }` |

---

## Key Models (already exist in codebase)

**File:** `src/shared/model/league_result.model.ts`

```typescript
interface PublishLeagueResultForActivitiesInput {
  parentclubId: string;
  clubId: string;
  activityId: string;
  memberId: string;
  action_type: number;
  device_type: number;
  app_type: number;
  device_id: string;
  updated_by: string;
  created_by: string;
  activityCode: number;
  leaguefixtureId: string;
  homeLeagueParticipationId: string;
  awayLeagueParticipationId: string;
  Tennis?: TennisSectionModel;
}
```

**File:** `src/pages/type2/league/models/location.model.ts`

Key field: `LeagueMatch.ResultStatus` — `1` = published, `0` = pending.

---

## Result Status Determination

From the match data returned by `API.GET_LEAGUE_MATCHES`:
- `mat.ResultStatus === 1` → Result is published → Show "View Result"
- `mat.ResultStatus !== 1` (0 or undefined) → Result pending → Show "Publish Result"

---

## Summary of Changes

1. **`leaguedetails.html`** — Change `(click)="gotoLeagueMatchInfoPage(mat)"` to `(click)="onMatchCardClick(mat)"`
2. **`leaguedetails.ts`** — Add 3 methods:
   - `onMatchCardClick(mat)` — routes based on league_type
   - `showSinglesDoublesActionSheet(mat)` — presents ActionSheet
   - `viewResult(mat)` / `publishResultForSinglesDoubles(mat)` — navigates to TennisSummaryTennisPage

No new pages, services, or API integrations needed — all functionality already exists in the codebase.
