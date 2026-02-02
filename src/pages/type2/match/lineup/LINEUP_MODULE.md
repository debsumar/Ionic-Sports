# Lineup Module Documentation

## Overview
The Lineup module allows users to create, edit, and manage team formations for matches. It supports both standalone matches and league matches with different API contexts.

## File Structure
```
src/pages/type2/match/lineup/
├── lineup.ts          # Component logic
├── lineup.html        # Template
├── lineup.scss        # Styles
├── lineup.module.ts   # Lazy-loaded module
└── LINEUP_MODULE.md   # This documentation
```

## Navigation Parameters (NavParams)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `match` | object | Yes | Match object with team info |
| `matchId` | string | Yes | Match identifier |
| `activityId` | string | Yes | Activity/sport identifier |
| `isCreateNew` | boolean | Yes | `true` = new lineup, `false` = edit existing |
| `formationSetupId` | string | No | Formation ID when editing saved lineup |
| `lineupName` | string | No | Lineup name (default: 'Starting line-up') |
| `teamId` | string | No | Pre-selected team ID |
| `teamSize` | number | No | Pre-selected team size |
| `isLeague` | boolean | No | `true` = league context, `false` = standalone match |
| `leagueId` | string | No | League ID (required when `isLeague=true`) |
| `homeUserId` | string | Yes | Home team ID |
| `awayUserId` | string | Yes | Away team ID |
| `homeUserName` | string | Yes | Home team name |
| `awayUserName` | string | Yes | Away team name |

## APIs Used

### 1. GET_TEAM_FORMATIONS
**Endpoint:** `POST league/lineup/getTeamFormations`

**Purpose:** Fetch available formations for a team size

**Input:**
```typescript
{
  parentclubId: string,
  clubId: string,
  memberId: string,
  action_type: 0,
  device_type: number,      // 1=Android, 2=iOS
  app_type: number,         // AppType.ADMIN_NEW
  device_id: string,
  updated_by: string,
  activityId: string,
  teamSize: number,         // 5, 6, 7, 8, 9, 10, 11
  matchId: string,          // Empty if isCreateNew
  teamId: string            // Empty if isCreateNew
}
```

**Response:**
```typescript
{
  status: number,
  message: string,
  data: TeamFormation[],    // Array of formations
  type: string,
  isArray: boolean
}
```

### 2. GetIndividualMatchParticipant (Non-League)
**Endpoint:** `POST match/GetIndividualMatchParticipant`

**Purpose:** Fetch players for standalone matches

**Input:**
```typescript
{
  parentclubId: string,
  clubId: string,
  activityId: string,
  memberId: string,
  action_type: LeagueMatchActionType.MATCH,
  device_type: number,
  app_type: AppType.ADMIN_NEW,
  device_id: string,
  updated_by: string,
  MatchId: string,
  TeamId: string,
  leagueTeamPlayerStatusType: LeagueTeamPlayerStatusType.All
}
```

### 3. Get_League_Match_Participant (League)
**Endpoint:** `POST league/GetLeagueMatchParticipant`

**Purpose:** Fetch players for league matches

**Input:**
```typescript
{
  parentclubId: string,
  clubId: string,
  activityId: string,
  memberId: string,
  action_type: 0,
  device_type: number,
  app_type: AppType.ADMIN_NEW,
  device_id: string,
  updated_by: string,
  LeagueId: string,
  MatchId: string,
  TeamId: string,
  TeamId2: string,
  leagueTeamPlayerStatusType: LeagueTeamPlayerStatusType.PLAYINGPLUSBENCH
}
```

### 4. Update_League_Match_Participation_Status
**Endpoint:** `POST league/UpdateLeagueMatchParticipationStatus`

**Purpose:** Update player status (Playing/Bench/Pending)

**Input:**
```typescript
{
  parentclubId: string,
  clubId: string,
  activityId: string,
  memberId: string,
  action_type: number,      // 0 for league, LeagueMatchActionType.MATCH for standalone
  device_type: number,
  app_type: AppType.ADMIN_NEW,
  device_id: string,
  updated_by: string,
  LeagueId: string,         // Empty for standalone matches
  MatchId: string,
  ParticipationId: string,
  ParticipationStatus: number  // LeagueParticipationStatus enum
}
```

### 5. SAVE_TEAM_FORMATION
**Endpoint:** `POST league/lineup/saveTeamFormation`

**Purpose:** Save lineup with positions and substitutes

**Input:**
```typescript
{
  parentclubId: string,
  clubId: string,
  activityId: string,
  memberId: string,
  action_type: 0,
  device_type: number,
  app_type: AppType.ADMIN_NEW,
  device_id: string,
  updated_by: string,
  formationSetupId: string,
  matchId: string,
  leagueId: string,
  teamId: string,
  lineup_name: string,
  visibility: number,       // LineupVisibility enum
  teamSize: number,
  positions: PositionPayload[],
  substitutes: SubstitutePayload[],
  createdBy: string
}
```

### 6. DELETE_TEAM_FORMATION
**Endpoint:** `POST league/lineup/deleteTeamFormation`

**Purpose:** Delete a saved lineup

**Input:**
```typescript
{
  matchId: string,
  teamId: string,
  formationSetupId: string,
  deletedBy: string
}
```

## Key Enums

```typescript
enum LineupVisibility {
  ALL_INVITEES = 1,
  TEAM_ONLY = 2,
  COACHES_ONLY = 3
}

enum LeagueParticipationStatus {
  PENDING = 0,
  PARTICIPANT = 1,        // Playing
  NON_PARTICIPANT = 2,    // Bench
  EXTRA = 3,
  INJURED = 4
}

enum LeagueTeamPlayerStatusType {
  All = 0,
  PLAYING = 1,
  BENCH = 2,
  PLAYINGPLUSBENCH = 3
}
```

## Code Flow

### Initialization Flow
```
constructor()
  ├── initializeFromNavParams()    // Extract nav params
  ├── initializeApiInputs()        // Setup API payloads
  └── subscribeToThemeEvents()     // Theme handling

ionViewDidLoad()
  ├── loadTheme()
  ├── fetchTeamFormations()        // GET_TEAM_FORMATIONS API
  └── fetchPlayersForTeam()        // Branch based on isLeague
        ├── fetchPlayersForMatch()     // GetIndividualMatchParticipant
        └── fetchPlayersForLeague()    // Get_League_Match_Participant
```

### Formation Loading Flow
```
fetchTeamFormations()
  └── handleFormationsResponse()
        ├── Store allTeamFormations
        ├── If !isCreateNew && formationSetupId:
        │     ├── Find matched formation
        │     ├── Set selectedFormation
        │     └── Bind visibility from saved formation
        ├── transformApiToFormationData()
        ├── validateAndSetFormation()
        └── updateFormation()
```

### Player Assignment Flow
```
onPlayerNodeClick(position)
  ├── If selectedSubstitute && empty position:
  │     └── assignSubstituteToPosition()
  ├── If position has player:
  │     └── Show player options modal
  └── If position empty:
        └── Show player selection modal

assignPlayer(player)
  ├── If activePosition exists:
  │     └── Assign to position directly
  └── If adding to substitutes:
        └── Call Update_League_Match_Participation_Status API
```

### Save Flow
```
save()
  ├── Validate matchId, teamId
  ├── Validate all positions assigned
  └── Show confirmation alert
        └── performSave()
              ├── Build positions payload
              ├── Build substitutes payload
              ├── Call SAVE_TEAM_FORMATION API
              └── Dismiss with LineupDismissData
```

### Team Switch Flow
```
onTeamChange(team)
  ├── Update selectedTeam, selectedTeamId
  ├── initializeApiInputs()        // Re-init with new teamId
  ├── resetToDefaults()            // Clear positions/substitutes
  ├── fetchTeamFormations()        // Fetch for new team
  └── fetchPlayersForTeam()        // Fetch players for new team
```

## HTML Structure

```html
<ion-header>
  <!-- Navbar with Save button -->
</ion-header>

<ion-content>
  <!-- Match Info Header (conditional: isLeague) -->
  
  <div class="lineup-container">
    <!-- Lineup Name Input -->
    
    <!-- Settings Section -->
    ├── Team Dropdown
    ├── Visibility Dropdown
    ├── Team Size Dropdown
    └── Formation Dropdown
    
    <!-- Football Pitch -->
    <div class="pitch">
      <!-- Player Nodes (ngFor currentPositions) -->
    </div>
    
    <!-- Substitutes Section -->
    <div class="substitutes-section">
      <!-- Substitute items + Add button -->
    </div>
    
    <!-- Delete Option (if !isCreateNew) -->
  </div>
</ion-content>

<!-- Modals Overlay -->
├── Player Selection Modal
└── Player Options Modal (Replace/Move/Remove)
```

## SCSS Patterns

### Theme Support
```scss
page-lineup {
  // Light theme (default)
  .lineup-container { background: #f5f5f5; }
  
  // Dark theme applied via class
  &.dark-theme {
    .lineup-container { background: #1a1a1a; }
  }
}
```

### Key CSS Classes
| Class | Purpose |
|-------|---------|
| `.lineup-navbar` | Header with gradient background |
| `.match-info-header` | Match details banner |
| `.settings-section` | Dropdown settings container |
| `.setting-row` | Individual setting with dropdown |
| `.dropdown-menu` | Glassmorphism dropdown overlay |
| `.pitch-container` | Football pitch wrapper |
| `.pitch` | Green pitch with markings |
| `.player-node` | Position marker on pitch |
| `.substitutes-section` | Horizontal scroll substitutes |
| `.modals-overlay` | Modal backdrop |
| `.modal-card` | Modal content container |

### Pitch Positioning
- Positions use percentage-based coordinates (0-100)
- `x`: Left to right percentage
- `y`: Top to bottom percentage
- Pitch aspect ratio: `padding-bottom: 140%`

## Key Models

### TeamFormation (API Response)
```typescript
interface TeamFormation {
  id: string;
  formation_name: string;
  team_size: number;
  positions: ApiPosition[];
  visibility?: number;
  is_saved?: boolean;
}
```

### PlayerPosition (UI State)
```typescript
interface PlayerPosition {
  role: string;
  x: number;
  y: number;
  playerid?: string | null;
  image?: string | null;
  player?: Player | null;
}
```

### Player
```typescript
interface Player {
  playerid: string;
  participationId?: string;
  name: string;
  image?: string;
  status?: number;  // 1=PLAYING, 2=BENCH
}
```

## State Management

### UI State Variables
```typescript
showTeamDropdown: boolean
showTeamSizeDropdown: boolean
showFormationDropdown: boolean
showVisibilityDropdown: boolean
showPlayerSelection: boolean
showPlayerOptions: boolean
activePosition: PlayerPosition | null
selectedSubstitute: Player | null
```

### Data State Variables
```typescript
currentPositions: PlayerPosition[]    // Players on pitch
availablePlayers: Player[]            // PLAYING status players
substitutes: Player[]                 // BENCH status players
allTeamFormations: TeamFormation[]    // API formations
apiFormationData: TeamSizeFormation[] // Transformed formations
```

## Context Differences: League vs Standalone

| Aspect | Standalone Match | League Match |
|--------|------------------|--------------|
| `isLeague` | `false` | `true` |
| Player API | `GetIndividualMatchParticipant` | `Get_League_Match_Participant` |
| `action_type` | `LeagueMatchActionType.MATCH` | `0` |
| `LeagueId` | Empty string | Actual league ID |
| Match header | Uses `match.homeUserName` | Uses `match.homeusername` |
