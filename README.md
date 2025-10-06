# DayPlanner
A simple day planner. This implementation focuses on the core concept of organizing activities for a single day with both manual and AI-assisted scheduling.

## Concept: DayPlanner

**Purpose**: Help you organize activities for a single day
**Principle**: You can add activities one at a time, assign them to times, and then observe the completed schedule

### Core State
- **Activities**: Set of activities with title, duration, and optional startTime
- **Assignments**: Set of activity-to-time assignments
- **Time System**: All times in half-hour slots starting at midnight (0 = 12:00 AM, 13 = 6:30 AM)

### Core Actions
- `addActivity(title: string, duration: number): Activity`
- `removeActivity(activity: Activity)`
- `assignActivity(activity: Activity, startTime: number)`
- `unassignActivity(activity: Activity)`
- `requestAssignmentsFromLLM()` - AI-assisted scheduling with hardwired preferences

## Prerequisites

- **Node.js** (version 14 or higher)
- **TypeScript** (will be installed automatically)
- **Google Gemini API Key** (free at [Google AI Studio](https://makersuite.google.com/app/apikey))

## Quick Setup

### 0. Clone the repo locally and navigate to it
```cd intro-gemini-schedule```

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Your API Key

**Why use a template?** The `config.json` file contains your private API key and should never be committed to version control. The template approach lets you:
- Keep the template file in git (safe to share)
- Create your own `config.json` locally (keeps your API key private)
- Easily set up the project on any machine

**Step 1:** Copy the template file:
```bash
cp config.json.template config.json
```

**Step 2:** Edit `config.json` and add your API key:
```json
{
  "apiKey": "YOUR_GEMINI_API_KEY_HERE"
}
```

**To get your API key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it into `config.json` (replacing `YOUR_GEMINI_API_KEY_HERE`)

### 3. Run the Application

**Run all test cases:**
```bash
npm start
```

**Run specific test cases:**
```bash
npm run manual    # Manual scheduling only
npm run llm       # LLM-assisted scheduling only
npm run mixed     # Mixed manual + LLM scheduling
```

## File Structure

```
dayplanner/
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── config.json               # Your Gemini API key
├── dayplanner-types.ts       # Core type definitions
├── dayplanner.ts             # DayPlanner class implementation
├── dayplanner-llm.ts         # LLM integration
├── dayplanner-tests.ts       # Test cases and examples
├── dist/                     # Compiled JavaScript output
└── README.md                 # This file
```

## Test Cases

The application includes three comprehensive test cases:

### 1. Manual Scheduling
Demonstrates adding activities and manually assigning them to time slots:

```typescript
const planner = new DayPlanner();
const breakfast = planner.addActivity('Breakfast', 1); // 30 minutes
planner.assignActivity(breakfast, 14); // 7:00 AM
```

### 2. LLM-Assisted Scheduling
Shows AI-powered scheduling with hardwired preferences:

```typescript
const planner = new DayPlanner();
planner.addActivity('Morning Jog', 2);
planner.addActivity('Math Homework', 4);
await llm.requestAssignmentsFromLLM(planner);
```

### 3. Mixed Scheduling
Combines manual assignments with AI assistance for remaining activities.

## Sample Output

```
📅 Daily Schedule
==================
7:00 AM - Breakfast (30 min)
8:00 AM - Morning Workout (1 hours)
10:00 AM - Study Session (1.5 hours)
1:00 PM - Lunch (30 min)
3:00 PM - Team Meeting (1 hours)
7:00 PM - Dinner (30 min)
9:00 PM - Evening Reading (1 hours)

📋 Unassigned Activities
========================
All activities are assigned!
```

## Key Features

- **Simple State Management**: Activities and assignments stored in memory
- **Flexible Time System**: Half-hour slots from midnight (0-47)
- **Query-Based Display**: Schedule generated on-demand, not stored sorted
- **AI Integration**: Hardwired preferences in LLM prompt (no external hints)
- **Conflict Detection**: Prevents overlapping activities
- **Clean Architecture**: First principles implementation with no legacy code

## LLM Preferences (Hardwired)

The AI uses these built-in preferences:
- Exercise activities: Morning (6:00 AM - 10:00 AM)
- Study/Classes: Focused hours (9:00 AM - 5:00 PM)
- Meals: Regular intervals (breakfast 7-9 AM, lunch 12-1 PM, dinner 6-8 PM)
- Social/Relaxation: Evenings (6:00 PM - 10:00 PM)
- Avoid: Demanding activities after 10:00 PM

## Troubleshooting

### "Could not load config.json"
- Ensure `config.json` exists with your API key
- Check JSON format is correct

### "Error calling Gemini API"
- Verify API key is correct
- Check internet connection
- Ensure API access is enabled in Google AI Studio

### Build Issues
- Use `npm run build` to compile TypeScript
- Check that all dependencies are installed with `npm install`

## Next Steps

Try extending the DayPlanner:
- Add weekly scheduling
- Implement activity categories
- Add location information
- Create a web interface
- Add conflict resolution strategies
- Implement recurring activities

## Resources

- [Google Generative AI Documentation](https://ai.google.dev/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

# AI-augumentation of Concept 2 - TextExtraction

## Original concept specification:
**Concept** TextExtraction [MediaFile]

**Purpose** Extract text from uploaded media for the AI to learn and translate

**Principle** Given a MediaFile, AI would run extraction to recognize text within the media, and produce a transcript with metadata for the media. One media can have many ExtractionResults.

**State**
a set of ExtractionResults with

    - source (MediaFile)
    - extractedText (String)
    - position (Coordinates/Timestamp)[^1]

**Actions**

extract(media:MediaFile): (result: ExtractionResult)
**require:** media exists
**effect:** create new ExtractionResults that is associated with the media
[^1]: Depending on if it's flat media or video, use coordinates or timestamp

## AI-augumented Concept:
The original concept already considered of using AI to help with the job of identifying blocks of text in different language from medias and their location in relevant in the media. I'm modifying to constrain media into just common image files like jpg or png for now so I can implement. The AI-augment concept will be similar as the remaining TextExtraction concept, where it's goal is still recognizing text within the image and create textbox components, containing the text's location, in the application. Since created by AI, human edit is allowed on the extraction result, whether it's the location, text, or failure to recognize all the text areas. I will also be adding 3 new actions for this concept.

editExtractText(extraction: ExtractionResults, newText:String)
**require** extraction exists
**effect** modify extractedText in extraction to newText

editLocation(extraction: ExtractionResults, fromCoord: (Number,Number), toCoord: (Number,Number))
**require** extraction exists, the coordinates doesn't inclue negative numbers
**effect** modify the position of extraction, with the new given fromCoord and toCoord, that gives us the area of image that the extractedText occupies[^2]

[^2]: position compose of two Coordinate (Number, Number) where one is fromCoordinate and toCoordinate that can create a rectangle area if we were to drag a rectangle space from fromCoord to toCoord.

addExtractionTxt(media: MediaFile, fromCoord: (Number,Number), toCoord: (Number, Number)):(result: ExtractionResult)
**require** media exists, numbers are non-negative. The rectangle area formed by the two Coordinates doesn't overlap with other extractionResults associated with the same media.
**effect** Add a new empty text extractionResult associated with media. The extractionResult will have a position though.

## User Interaction
For the image "Inputting image to AI", the one of the two context the AI get from the user is a single image file. The AI is always programmed with the request to identity all text blocks in the image and their position in the image. The user can input the image file by clicking on the upload button.

The "Pop-up after uploading img" will show to ask for the language, from the selection, the user would like the AI to translate to, the second context the user can input to the AI.

After giving the inputs from the user to the AI, the AI will spit its output by automatically creating textbox component in the application and filling it out. The AI doesn't return in a way like chatbox. The user can revise the original text and its location in the textbox component created by AI.

*Sketch includes translation due to the synchronizations as described in assignment 2.
### User Journey:
User A wants to see what is said in a Chinese text version movie poster, but he only knows English. He uploads the image of the movie poster to TEPKonjac and then select the language English in the popup tab. The AI recognizes two different text area on the poster and created two textbox component, with the text in the original language, in English, and the rectangle area of the image the AI thinks the text is on. User A saw the AI put 6.21 along with the movie title in textbox 1, but he just felt like it's not necessary to translate numbers. So he changed the to coordinate in location for textbox 1 from (12,5). Then when user A press the save button for textbox 1, the AI refreshed and wouldn't recognize 6.21 in textbox 1 and automatically deletes it from textbox 1 and the associated translation. Now user A can tell that the movie poster is of the movie 'Spirited Away' and is by Miyazaki Hayao.
