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

deleteExtraction(index: Number)
    **require** index is not out of bound
    **effect** remove the extractedResult at index

## User Interaction
For the image "Inputting image to AI", the one of the two context the AI get from the user is a single image file. The AI is always programmed with the request to identity all text blocks in the image and their position in the image. The user can input the image file by clicking on the upload button.

The "Pop-up after uploading img" will show to ask for the language, from the selection, the user would like the AI to translate to, the second context the user can input to the AI.

After giving the inputs from the user to the AI, the AI will spit its output by automatically creating textbox component in the application and filling it out. The AI doesn't return in a way like chatbox. The user can revise the original text and its location in the textbox component created by AI.

*Sketch includes translation due to the synchronizations as described in assignment 2.
### User Journey:
User A wants to see what is said in a Chinese text version movie poster, but he only knows English. He uploads the image of the movie poster to TEPKonjac and then select the language English in the popup tab. The AI recognizes two different text area on the poster and created two textbox component, with the text in the original language, in English, and the rectangle area of the image the AI thinks the text is on. User A saw the AI put 6.21 along with the movie title in textbox 1, but he just felt like it's not necessary to translate numbers. So he changed the to coordinate in location for textbox 1 from (12,5). Then when user A press the save button for textbox 1, the AI refreshed and wouldn't recognize 6.21 in textbox 1 and automatically deletes it from textbox 1 and the associated translation. Now user A can tell that the movie poster is of the movie 'Spirited Away' and is by Miyazaki Hayao.
