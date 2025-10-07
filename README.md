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
![First User Page]("UI_1.png")

The "Pop-up after uploading img" will show to ask for the language, from the selection, the user would like the AI to translate to, the second context the user can input to the AI.
![Second User Page]("UI_2.png")

After giving the inputs from the user to the AI, the AI will spit its output by automatically creating textbox component in the application and filling it out. The AI doesn't return in a way like chatbox. The user can revise the original text and its location in the textbox component created by AI.
![Third User Page]("UI_3.png")

*Sketch includes translation due to the synchronizations as described in assignment 2.
### User Journey:
User A wants to see what is said in a Chinese text version movie poster, but he only knows English. He uploads the image of the movie poster to TEPKonjac and then select the language English in the popup tab. The AI recognizes two different text area on the poster and created two textbox component, with the text in the original language, in English, and the rectangle area of the image the AI thinks the text is on. User A saw the AI put 6.21 along with the movie title in textbox 1, but he just felt like it's not necessary to translate numbers. So he changed the to coordinate in location for textbox 1 from (12,5). Then when user A press the save button for textbox 1, the AI refreshed and wouldn't recognize 6.21 in textbox 1 and automatically deletes it from textbox 1 and the associated translation. Now user A can tell that the movie poster is of the movie 'Spirited Away' and is by Miyazaki Hayao.

## Rich Test Case Description

The full scenario is described with comments on the rich test cases in textExtraction-test.ts as well as here.

**Rich Test Case 1:**

Test Case 1 – Manual Block Editing and Merging:
The user starts with a simple, high-contrast image and runs the AI OCR extraction. They notice that the title is split across multiple blocks, so they manually adjust the coordinates of the first block to cover the full title, merge the text from the second block into the first, and then delete the now-redundant second block. This simulates a user correcting AI-imposed splits and ensures that the merged block contains the full title with accurate coordinates.

I started with a clear image (high contrast, simple background) and ran the default OCR extraction.
The LLM produced accurate text but tended to split one title into multiple blocks. I simulated a user
merging those manually because they might want the title of the poster not to be separated. The user
merge by editing the location to reflect both block, editing the text in the block to include both
word, and deleting the unnecessary block. What worked was AI was able to recognize all the text on the image.
However AI tends to split text by their position. If two words are in different row but in the same sentence,
it's still considered two different block. Another issue remaining is that the coordinates AI come up with
are just random without knowledge of the image's dimensions.

My next prompt inspired from this would be adding the following prompt to my current prompt: When two or
more short text segments appear close together (within the same logical phrase or line group), merge
them into a single text block rather than splitting them. Treat small vertical spacing as part of the
same block if the text forms a continuous sentence or title.

**Rich Test Case 2:**

Test Case 2 – Artistic and Non-English Fonts:
The user tests a more challenging image where the title uses highly stylized, non-English (Chinese) fonts. The AI OCR misses some important blocks due to the artistic nature of the text. The user manually adds a new extraction block for the missing title and edits it to contain the correct text. Additionally, the user cleans up duplicate text blocks generated by the AI, keeping only unique instances, simulating a user correcting errors caused by stylized fonts and AI hallucinations.

I tested a more visually challenging image with decorative, stylized fonts to simulate the user uploads a
visually complex image where the title and subtitles use artistic, stylized fonts — curved lettering,
uneven spacing, shadows, or outline effects. Also the user uploaded an image with a non-English language.
AI was indeed able to recognize the chinese in the movie poster,and this time able to put chinese characters
that are vertical (separated by row) together into one block. However, that only works for Chinese, the English
in the poster is still separated into different blocks. Also it gave so many blocks with the same text that
doesn't even appear on the poster at all (hallucination). It seems like the AI searched the web about the poster that it returns
the name of the main actress in the TV drama with the same title name. Other remaining issues are still the
wacky position it assigns to make up textblocks, and if the text isn't clear enough, it's unable to recognize it.

My next prompt inspired from this would be adding the following prompt to my current prompt:
Do not add, infer, or search for any information that is not explicitly readable.
Do not use external knowledge or guess missing words based on what the image might represent.
Apply the same grouping logic for all languages — English, Chinese, or others — merging vertically or
horizontally aligned characters that form a single title or phrase.
When estimating coordinates, ensure that (from) and (to) precisely cover only the visible text area.
Avoid random or uniform coordinates that do not match the actual layout.

**Rich Test Case 3:**

Test Case 3 – Crowded Image with Overlapping Text:
The user uploads a very busy image filled with words, where some numbers are isolated as single blocks and some text regions overlap. After AI extraction, the user removes number-only blocks to focus on meaningful text. To handle overlapping areas, they manually add a new block with coordinates that do not collide with existing blocks and edit it to include missing text. This scenario mimics a user managing complex layouts, correcting AI misassignments, and ensuring all relevant text is captured.

I tested with an image that includes overlapping text and filled with words everywhere
on the image to try to check for overlap coordinates assigned from AI. Since the response
from the AI was able to successfully be parsed into a list of ExtractionResult,
it was still able to pair textblocks with valid coordinates. The coordinates the AI gave
although doesn't reflect the image's actual size, when I was comparing different textblocks
coordinates to each other to see their relationship, it's pretty accurate
in the the direction and order they are away from each other. What is wrong this time is
that numbers are taking up a single textblock when there's no letters next to them. Also
if the coloring of the text is similar to the image background, AI is having a hard
time recognizing the word. This problem also exists to human eyes. The issues that still
remain are accurate coordinates to the image's actual dimensions, and incorrect word
recognition when text is small.

My next prompt from this would be:
Keep numeric elements together with their associated words (e.g., “2025” and “Festival”)
in a single text block whenever they belong to the same phrase or visual line.
The incoming image's dimensions is {width}x{length}. Label textblocks with accurate coordinates
that is relevant to the image's dimensions.

## Validators:

**Plausible Issues:**

Overlapping text blocks: Even if the AI assigns coordinates, two or more blocks might overlap due to misestimation of positions. This could make downstream processing or display unreliable. To solve this,
I created a function that checks for overlap, kind of like a checkRep(), and insert it to any function
that modifies the coordinates in the result list. Function is call overlaps() at line 204 in TextExtraction.ts.

Hallucinated text: The AI might include words that do not actually exist in the image, e.g., searching its knowledge or guessing text. This violates the invariant that extracted text must come from the image. Due to the computer not necessarily knowing what exactly
is in the image, the validator would have to be in the AI's prompt where it restricts
the AI from searching the web based on texts it recognize in the image. The prompt can be
found as const payload in TextExtraction.ts line 116.

Invalid Coordinates: AI can't identify the metadata of the image uploaded and thus can't
extract the image's dimension. This can lead to coordinate logical issues where the AI gives some location out of bound of the actual image size. The validator I created to
solve this problem is by providing the AI with the actual dimension for the incoming image in the prompt, and instructued the coordinate system the application is using.
The dimension extracting function is inside extractTextFromMedia() already starting at line 109.
