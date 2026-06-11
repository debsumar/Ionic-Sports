# APIs Not Sending `app_type`, `device_type`, `device_id`, `updated_by`

This document lists API calls (from `src/shared/constants/api_constants.ts`) whose request
payloads do **not** include all four tracking params: **`app_type`**, **`device_type`**,
**`device_id`**, **`updated_by`**.

## How this was determined

- These four params are **not** injected globally in `http.service.ts`. They are added
  per-call inside the request payload object passed to `httpService.post/get/put/delete(...)`.
- A call is considered **OK** when the payload object (inline literal or a typed
  "common input" object) contains all four fields.
- A call is **MISSING** when the payload omits one or more of the four. GET calls that only
  pass URL segments / query params are MISSING by definition.
- Commented-out calls were excluded (e.g. `publish_football.ts`, `language.service.ts`
  `APP_LANGUAGE`, `result_input.ts` `UPDATE_RESULT_ENTITY`).

Legend: **ALL 4** = all four params missing. Otherwise only the listed params are missing.

---

## courtbooking

| Constant | Endpoint | Missing | Location |
|---|---|---|---|
| `GET_RECURRING_LIST` | `courtbooking/getrecurringlist` | ALL 4 | recuringbooking.ts:185 |
| `CANCEL_RECURRING_V3` | `courtbooking/cancelrecurring_v3` | ALL 4 | recuringbooking.ts:320 |
| `CANCEL_RECURRING_BY_ID` | `courtbooking/cancelrecurringbyid` | ALL 4 | recuringbooking.ts:343 |
| `CREATE_RECURRING_V3` | `courtbooking/createrecurring_v3` | ALL 4 | addrecuringbooking.ts:369 |
| `ALL_BOOKING_BY_COURT` | `courtbooking/allbookingbycourt` | ALL 4 | bulkslotcancellation.ts:165 |
| `BULK_CANCEL_RECURRING_BY_ID` | `courtbooking/bulkcancelrecurringbyid` | ALL 4 | bulkslotcancellation.ts:260 |
| `CANCEL_COURT` | `courtbooking/cancelCourt` | ALL 4 | activebookingdetail.ts:178 |
| `CANCEL_SLOT_WITH_ID` | `courtbooking/cancelslotwithid` | ALL 4 | activebookingdetail.ts:205 |
| `GET_SLOT_BY_ID` | `courtbooking/getslotbyid` | ALL 4 | activebookingdetail.ts:227 |
| `ALL_ACTIVE_BOOKING_BY_COURT` | `courtbooking/allactivebookingbycourt` | ALL 4 | booking.ts:310 |
| `ACTIVE_BOOKING_IN_RANGE` | `courtbooking/activebookinginrangebycourt` | ALL 4 | booking.ts:347, filterbookings.ts:243 |
| `GET_MULTI_COURT_SLOT` | `courtbooking/getmulticourtslot` | ALL 4 | newviewcourt.ts:278 |
| `BOOK_FOR_ADMIN` | `courtbooking/bookforadmin` | ALL 4 | newviewcourt.ts:544, bookingcourt.ts:167 |
| `COURT_BOOKING_HISTORY` | `courtbooking/bookingHistory` | ALL 4 | filterbookings.ts:207 |
| `CANCEL_RECURRING_BOOKING_V2` | `courtbooking/cancelrecurringbooking_v2` | ALL 4 | recurringbookingdetail.ts:164 |
| `COURT_BOOKING_SUMMARY_V2` | `courtbooking/bookingsummary_v2` | ALL 4 | dashboard.ts:1010 |

---

## ladder

| Constant | Endpoint | Missing | Location |
|---|---|---|---|
| `LADDER_GET_CONFIGS` | `ladder/getConfigs` | ALL 4 | matchladder.ts:247 |
| `LADDER_GET_RANKINGS` | `ladder/getRankings` | ALL 4 | matchladder.ts:274 |
| `LADDER_INIT_RANKINGS` | `ladder/initRankings` | ALL 4 | matchladder.ts:299 |
| `LADDER_ISSUE_CHALLENGE` | `ladder/issueChallenge` | device_id, updated_by | matchladder.ts:328 |
| `LADDER_GET_CHALLENGES` | `ladder/getChallenges` | ALL 4 | matchladder.ts:352 |
| `LADDER_RESPOND_CHALLENGE` | `ladder/respondChallenge` | ALL 4 | matchladder.ts:384 |
| `LADDER_CANCEL_CHALLENGE` | `ladder/cancelChallenge` | ALL 4 | matchladder.ts:401 |
| `LADDER_SAVE_CONFIG` | `ladder/saveConfig` | ALL 4 | matchladder.ts:473 |

---

## leaderboard

| Constant | Endpoint | Missing | Location |
|---|---|---|---|
| `LEADERBOARD_GET_USER_LEADERBOARD` | `leaderboard/getUserLeaderboard` | ALL 4 | matchladder.ts:215 |

---

## league

| Constant | Endpoint | Missing | Location |
|---|---|---|---|
| `DELETE_LEAGUE_MATCHES` | `league/deleteLeagueMatches` | ALL 4 | leaguedetails.ts:655, league_match_info.ts:1067 |
| `GET_LEAGUE_MATCHES` | `league/getLeagueMatches` | app_type, device_id, updated_by | leaguedetails.ts:1239, 1897 |
| `GET_GROUPS` | `league/getGroups` | ALL 4 | leaguedetails.ts:1461 |
| `GET_PARTICIPANT_GROUPS` | `league/getParticipantGroups` | ALL 4 | leaguedetails.ts:1464 |
| `GET_PAIRS` | `league/getPairs` | ALL 4 | leaguedetails.ts:1474, creatematchleague.ts:643, updateleaguematch.ts:131 |
| `CREATE_PAIR` | `league/createPair` | ALL 4 | leaguedetails.ts:1501 |
| `REMOVE_PAIR` | `league/removePair` | ALL 4 | leaguedetails.ts:1518 |
| `ASSIGN_PARTICIPANT_TO_GROUP` | `league/assignParticipantToGroup` | ALL 4 | leaguedetails.ts:1594 |
| `CREATE_GROUPS` | `league/createGroups` | ALL 4 | leaguedetails.ts:1610, 1627 |
| `RENAME_GROUP` | `league/renameGroup` | ALL 4 | leaguedetails.ts:1651 |
| `DELETE_GROUP` | `league/deleteGroup` | ALL 4 | leaguedetails.ts:1673 |
| `GET_LEAGUE_OR_MATCH_TYPES` | `league/getTypes` | varies* | autocreatematch.ts:137, createleague.ts:334, editleague.ts:452 |
| `GET_LEAGUE_CATEGORIES` | `league/getCategories` | varies* | createleague.ts:305, editleague.ts:444 |
| `GET_ALL_LEAGUES` | `league/get-all-leagues` | ALL 4 | leagueteamlisting.ts:580 |
| `DELETE_TEAM_FORMATION` | `league/lineup/deleteTeamFormation` | ALL 4 | lineup.ts:1226 |

\* `GET_LEAGUE_OR_MATCH_TYPES`: autocreatematch.ts:137 missing only `updated_by`;
createleague.ts:334 missing `app_type, device_id, updated_by`; editleague.ts:452 missing ALL 4.
`GET_LEAGUE_CATEGORIES`: createleague.ts:305 missing `app_type, device_id, updated_by`;
editleague.ts:444 missing ALL 4.

---

## match

| Constant | Endpoint | Missing | Location |
|---|---|---|---|
| `PUBLISH_RESULT_STANDALONE` | `match/PublishResultStandAlone` | device_id, updated_by | matchdetails.ts:796 |
| `GET_MATCH_PARTICIPANTS` | `match/getMatchParticipants` | ALL 4 | matchdetails.ts:929 |
| `ADD_PLAYERS_TO_MATCH` | `match/AddPlayersToMatch` | ALL 4 | matchdetails.ts:996 |
| `UPDATE_STANDALONE_PARTICIPATION_STATUS` | `match/UpdateStandaloneParticipationStatus` | ALL 4 | matchdetails.ts:1007 |
| `UPDATE_TEAM_MATCH_PARTICIPANT_PAYMENT` | `match/UpdateTeamMatchParticipantPayment` | ALL 4 (uses `UpdatedBy` PascalCase, not `updated_by`) | matchpayment.ts:146 |
| `CREATE_RECURRING_MATCHES` | `match/CreateRecurringMatches` | device_type | addrecurringmatches.ts:161 |

---

## coach

| Constant | Endpoint | Missing | Location |
|---|---|---|---|
| `FETCH_COACHES` | `coach/FetchCoaches` | app_type, device_id, updated_by | createleague.ts:389 |

> Note: `FETCH_COACHES` **does** send all four in `view_coaches.ts:144`. Only the
> `createleague.ts` call is missing params.

---

## loyalty

| Constant | Endpoint | Missing | Location |
|---|---|---|---|
| `LOYALTY_REWARD_POINTS_BULK_V2` | `loyalty/rewardpointsbulk_v2` | ALL 4 | sessionweeklyloyalty.ts:214, sessionloyalty.ts:235 |

---

## pause_monthly_subscription

| Constant | Endpoint | Missing | Location |
|---|---|---|---|
| `PAUSE_MONTHLY_SUBSCRIPTION` | `pause_monthly_subscription` | ALL 4 | monthly_session_dets.ts:418, pause_monthly_session_subscription.ts:89 |

---

## session-waiting-list

| Constant | Endpoint | Missing | Location |
|---|---|---|---|
| `WAITING_LIST_GET_BY_MODULE` | `session-waiting-list/get-by-module` | device_type | weekly-session-details.ts:889 |

> Note: `WAITING_LIST_UPDATE_STATUS` sends all four (weekly-session-details.ts:975).

---

## parentclub

| Constant | Endpoint | Missing | Location |
|---|---|---|---|
| `GET_ALL_PARENTCLUBS_LIST` | `parentclub/get_all_parentclubs` | ALL 4 | appadmindashboard.ts:73 |

---

## parentclubuser

| Constant | Endpoint | Missing | Location |
|---|---|---|---|
| `GET_PARENTCLUB_USER_BY_FIREBASEID` | `parentclubuser/by_firebase_loggedinkey` | ALL 4 | appadmindashboard.ts:127, login.ts:310 |

---

## superadmin

| Constant | Endpoint | Missing | Location |
|---|---|---|---|
| `GET_SUPERADMIN_MEMBER_COUNT` | `superadmin/membercount` | ALL 4 | superdashboarddetails.ts:45 |

---

## Summary by controller

| Controller | Calls missing params |
|---|---|
| courtbooking | 16 |
| league | 15 (incl. partials) |
| ladder | 8 |
| match | 6 |
| loyalty | 2 |
| pause_monthly_subscription | 2 |
| parentclubuser | 2 |
| leaderboard | 1 |
| coach | 1 |
| session-waiting-list | 1 (partial) |
| parentclub | 1 |
| superadmin | 1 |

### Excluded (commented-out / not active calls)
- `publish_football.ts` – all `httpService` calls commented out.
- `language.service.ts` – `APP_LANGUAGE` call commented out (active call uses a raw hardcoded URL).
- `result_input.ts:348` – `UPDATE_RESULT_ENTITY` commented out.
- `team_image_upload.service.ts` – no `API.` constant calls (uses raw HttpClient / presigned URL).
