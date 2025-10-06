<concept_spec>
concept TextExtraction

purpose
    Identify and extract text from uploaded image
principle
    Given an image, AI would try to recognize
    text within the image, and label each text
    block with two coordinate to represent their
    location area in the image. All the textblock
    recognized will be stored in a list ExtractionResult,
    which you then can manually edit the text and coordinates.

state
    a set of ExtractionResults with
        - image (FilePath)
        - extractedText (String)
        - position (Location)

    a set of Location with
        - an ExtractionResult
        - two Coordinate (Number,Number)

    FilePath is a string.

    invariants
        The numbers in coordinate are all non-negative.
        The rectangle created by Location must not be overlapping with each other.

actions
    async extractTextFromMedia(image:FilePath): (result: ExtractionResult)
    **require:** image exists and accessible
    **effect:** create new ExtractionResults that is associated with the image

    editExtractText(index:number, newText:String)
    **require** index is inbound
    **effect** modify extractedText in extraction to newText

    editLocation(index: number, fromCoord: Coordinate, toCoord: Coordinate)
    **require** index is inbound, the coordinates doesn't inclue negative numbers
    **effect** modify the position of extraction, with the new given fromCoord and toCoord, that gives us the area of image that the extractedText occupies[^2]

    addExtractionTxt(media: FilePath, fromCoord: Coordinate, toCoord: Coordinate):(result: ExtractionResult)
    **require** media exists, numbers are non-negative. The rectangle area formed by the two Coordinates doesn't overlap with other extractionResults associated with the same media.
    **effect** Add a new empty text extractionResult associated with media. The extractionResult will have a position though.

    deleteExtraction(index: Number)
    **require** index is not out of bound
    **effect** remove the extractedResult at index
</concept_spec>
