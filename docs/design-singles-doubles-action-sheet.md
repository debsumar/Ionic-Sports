# Design Document: Singles/Doubles Match Action Sheet

## Problem Statement

In the League Details page (`leaguedetails`), clicking a match card in the Matches tab always navigates to `LeagueMatchInfoPage`. This is correct for **Team** matches (league_type=3), but for **Singles** (league_type=1) and **Doubles** (league_type=2) matches, the user should see a themed bottom-sheet with contextual options and an inline publish result dialog (matching the Angular app's p-dialog approach).

---

## Design

### User Flow

```
User taps match card in Matches tab
        │
        ├── league_type === 3 (Team)
        │       └── Navigate to LeagueMatchInfoPage (existing behavior)
        │
        └── league_type === 1 or 2 (Singles/Doubles)
                └── Show themed app-bottom-sheet
                        │
                        ├── ResultStatus === 1 (Published)
                        │       └── "View Result" → Opens inline result dialog (pre-populated)
                        │
                        ├── ResultStatus !== 1 (Pending)
                        │       └── "Publish Result" → Opens inline result dialog
                        │
                        ├── "Edit Match" → UpdateleaguematchPage
                        │
                        └── "Delete Match" → Confirm Alert → DELETE API
```

### Components Affected

| File | Change |
|------|--------|
| `leaguedetails.html` | Match card click handler + bottom-sheet + result dialog |
| `leaguedetails.ts` | `onMatchCardClick()`, `onMatchAction()`, `openPublishDialog()`, score helpers, `publishResult()` |
| `leaguedetails.scss` | Result dialog styling (dark + light theme) |

### Theming

- **Action Sheet**: Uses `app-bottom-sheet` component (same as `league_match_info`) instead of Ionic's `ActionSheetController`
- **Result Dialog**: Custom overlay dialog styled with project's glassmorphism theme (dark: `#1e293b` bg, light: `#ffffff` bg)

---

## API Used (Same as Angular App)

### Publish Result
- **Endpoint:** `POST LeagueResult/publishLeagueResultForActivities`
- **Same payload structure as Angular `tournament-detail.component.ts`:**
  ```json
  {
    "parentclubId": "string",
    "clubId": "",
    "activityId": "string",
    "memberId": "string",
    "action_type": 0,
    "device_type": 2,
    "app_type": 10,
    "device_id": "",
    "updated_by": "string",
    "created_by": "string",
    "activityCode": number,
    "leaguefixtureId": "string",
    "homeLeagueParticipationId": "string",
    "awayLeagueParticipationId": "string",
    "Tennis": {
      "LEAGUE_FIXTURE_ID": "string",
      "POTM": [],
      "RESULT": { "RESULT_STATUS": "1|4|5", "WINNER_ID": "", "LOSER_ID": "", "DESCRIPTION": "" },
      "HOME_TEAM": { "TEAM_NAME": "", "TEAM_ID": "", "SETS_WON": "0", ... },
      "AWAY_TEAM": { "TEAM_NAME": "", "TEAM_ID": "", "SETS_WON": "0", ... },
      "SET_SCORES": [{ "SET_NUMBER": "1", "SCORE": "6-4", "WINNER": "", "WINNER_TEAM_ID": "" }]
    }
  }
  ```

### Delete Match
- **Endpoint:** `POST league/deleteLeagueMatches`
- **Payload:** `{ leagueFixtureId: string }`

### Edit Match
- **Navigation:** `UpdateleaguematchPage` with `{ match: LeagueMatch }`

---

## Result Dialog Features (Matching Angular App)

1. **Scoreboard** — Home vs Away with avatars and live sets-won count
2. **Score Display** — Shows formatted score text (e.g., "6-4  7-5")
3. **Winner Display** — Shows winner name with trophy icon
4. **Result Type** — Dropdown: Completed / Retired Hurt / Walkover
5. **Retired/Walkover Player** — Who retired/withdrew selector
6. **Match Format** — Best of 1/3/5 selector
7. **Set Scores** — Input fields with auto-advance, tiebreak support, auto-add next set
8. **Publish Button** — Calls same API as Angular app

---

## Result Status Mapping

| resultType | RESULT_STATUS | Meaning |
|-----------|---------------|---------|
| `normal` | 1 | Completed |
| `walkover` | 4 | Walkover |
| `retired` | 5 | Retired Hurt |
