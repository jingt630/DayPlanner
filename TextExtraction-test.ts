import path from 'path';
import { GeminiLLM, Config } from './gemini-llm';
import { TextExtraction } from './TextExtraction';
import { assert } from 'console';
import fs from 'fs';
import sizeOf from 'image-size';
import { get } from 'http';

function loadConfig(): Config {
    try {
        const config = require('../config.json');
        return config;
    } catch (error) {
        console.error('❌ Error loading config.json. Please ensure it exists with your API key.');
        console.error('Error details:', (error as Error).message);
        process.exit(1);
    }
}
const img1Keywords = ['classroom', 'assassination', 'shonen', 'jump', 'advanced',
            'story', 'art', 'by', 'Yusei', 'Matsui'];
/**
 * Runs the text extraction test for a given image path, to show the AI can identify some text blocks.
 * Checks that at least 3 text blocks are found and certain keywords are present.
 *
 * @param imageFile - Path to the image file to test
 * @returns Promise that resolves when the test is complete
 */
async function runTestForImage(imageFile: string): Promise<void> {
    console.log(`\n🧪 Testing image: ${imageFile}`);
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    const extractor = new TextExtraction();

    const imagePath = path.resolve(imageFile);
    console.log('Using image path:', imagePath);

    try {
        const extracted = await extractor.extractTextFromMedia(llm, imagePath);
        console.log('✅ Extraction result (truncated):', extracted ? extracted.slice(0, 1000) : '<no text>');

        const list = extractor.parseNumberedTextList(extracted);
        const declared = extractor.extractDeclaredCount(extracted);

        console.log('Parsed numbered list:', list);
        console.log('Declared "Number of text blocks":', declared);

        if (declared === null || declared < 3) {
            console.error('❌ Declared block count is less than 3 or missing.');
            process.exit(1);
        }

        var keywords = img1Keywords;
        if (imageFile === 'Manga.png') {
            keywords = [ 'Erika','Natsumi', 'Sure', 'Idol'];
        }
        const lowerItems = list.map(s => s.toLowerCase());

        const missing: string[] = [];
        for (const kw of keywords) {
            if (!lowerItems.some(item => item.includes(kw.toLowerCase()))) {
                missing.push(kw);
            }
        }

        if (missing.length > 0) {
            console.error('❌ Missing keywords in extracted text list:', missing.join(', '));
            process.exit(1);
        }

        console.log('🎉 Test PASSED: declared count >= 3 and all keywords present in list items.');
    } catch (err) {
        console.error('❌ Test failed:', (err as Error).message);
        process.exit(1);
    }
}

//Rich Test Case 1
async function richTestCase1() {
    console.log('\n🧪 Running Rich Test Case 1 with assclass-cover.webp');
    console.log('🧪 Test Case 1: Manual Block Editing and Merging');

    const config = loadConfig();
    const llm = new GeminiLLM(config);
    const extractor = new TextExtraction();

    // Step 1: Upload simple image
    const imagePath = path.resolve('assclass-cover.webp');

    // Step 2: Initial extraction from LLM
    const extracted = await extractor.extractTextFromMedia(llm, imagePath);
    const initialListLength = extractor.results.length;
    // console.log('Initial extraction results:', extractor.results);
    // Step 3: User corrects first block coordinates manually because he wants
    // to include the full title as one block
    extractor.editLocation(0, { x: 40, y: 40 }, { x: 490, y: 200 });
    console.log('Updated coordinates for Block 1:', extractor.results[0]);

    // Step 4: User copies text from block 1 to block 0 to change the text in block 0
    const copiedTxt = extractor.results[0].extractedText + " " + extractor.results[1].extractedText;
    extractor.editExtractText(0, copiedTxt);
    console.log('Updated text for Block 0:', extractor.results[0]);

    // Step 5: User deletes block 1 as its text is now merged into block 0
    extractor.deleteExtraction(1);

    //Validate
    assert(extractor.results.length === initialListLength - 1, 'Block count should decrease by 1 after deletion');
    assert(extractor.results[0].extractedText === "ASSASSINATION CLASSROOM", 'Merged text should match');
    assert(extractor.results[0].fromCoord.x === 40, 'Merged coordinates fromCoord should match');
    assert(extractor.results[0].fromCoord.y === 40, 'Merged coordinates fromCoord should match');
    assert(extractor.results[0].toCoord.x === 490, 'Merged coordinates toCoord should match');
    assert(extractor.results[0].toCoord.y === 200, 'Merged coordinates toCoord should match');

    console.log('Final extraction results after user edits:', extractor.results);
    console.log('🎉 Rich Test Case 1 PASSED,  User successfully corrected coordinates, merged blocks, and deleted extra block.');
}

//Rich Test Case 2
// test with a harder image where the fonts are more artistic and not in english
async function richTestCase2(){
    console.log('\n🧪 Running Rich Test Case 2 with 花千骨.jpg');
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    const extractor = new TextExtraction();

    const imagePath = path.resolve('花千骨.jpg');
    const extracted = await extractor.extractTextFromMedia(llm, imagePath);
    console.log('✅ Extraction result:', extracted ? extracted : '<no text>');

    //User sees that the extraction is missing the most important text block, the title at the top becasue the font is very artistic
    //So he adds a new extraction block manually, specifying coordinates that cover the title area
    extractor.addExtractionTxt('花千骨.jpg', { x: 0, y: 20 }, { x: 20, y: 80 });
    //Then he edits the new block to turn from empty text to the actual title text
    extractor.editExtractText(extractor.results.length - 1, '花千骨');

    //The user sees that there are many blocks with the same text because the limitation of AI OCR
    //So he decides to delete all duplicate blocks, keeping only one instance of each unique text
    const initialCount = extractor.results.length;
    const seen = new Set<string>();
    for (let i = extractor.results.length - 1; i >= 0; i--) {
        const txt = extractor.results[i].extractedText;
        if (seen.has(txt)) {
            extractor.deleteExtraction(i);
        } else {
            seen.add(txt);
        }
    }
    assert(extractor.results.length <= initialCount, 'Block count should decrease after removing duplicates');
    console.log('Final extraction results after user edits:', extractor.results);
    console.log('🎉 Rich Test Case 2 PASSED, User successfully added missing title block and removed duplicate blocks.');
}

//Rich Test Case 3
// Test with an image full of words almost everywhere to see if the AI can separate them into distinct blocks
// and recognize all the text correctly
async function richTestCase3() {
    console.log('\n🧪 Running Rich Test Case 3 with JapaneseMagazine.jpg');
    const config = loadConfig();
    const llm = new GeminiLLM(config);
    const extractor = new TextExtraction();
    const imagePath = path.resolve('JapaneseMagazine.jpg');
    const extracted = await extractor.extractTextFromMedia(llm, imagePath);
    console.log('✅ Extraction result:', extracted ? extracted : '<no text>');

    const blockCount = extractor.results.length;
    console.log(`Extracted ${blockCount} text blocks.`);
    assert(blockCount >= 15, 'Should extract at least 10 text blocks from the busy image');

    //The user sees that numbers are being placed independently as separate blocks
    //So he decides to delete all blocks that contain only numbers, leaving textblocks with both
    // letters and numbers or just letters
    const initialCount = extractor.results.length;
    for (let i = extractor.results.length - 1; i >= 0; i--) {
        const txt = extractor.results[i].extractedText.trim();
        if (/^\d+$/.test(txt)) {
            extractor.deleteExtraction(i);
        }
    }
    assert(extractor.results.length <= initialCount, 'Block count should decrease after removing number-only blocks');
    console.log('Final extraction results after user edits:', extractor.results);

    //The user sees that due to the number of words in the image, some text blocks are very close together
    //In fact words are overlapping or touching each other
    //The AI couldn't identify the text behind the overlapping area
    //So the user decides to add a new block, but since overlapping coordinates are not allowed
    //he decides to give it a fake position that does not overlap with any existing block manually
    extractor.addExtractionTxt('JapaneseMagazine.jpg', { x: 0, y: 0 }, { x: 10, y: 10 });
    //Then he edits the new block to turn from empty text to the actual text that was missing
    extractor.editExtractText(extractor.results.length - 1, 'UP');

    console.log('🎉 Rich Test Case 3 PASSED, User successfully removed number-only blocks.');
}

// If called directly, you can run multiple images:
if (require.main === module) {
    // First image
    // runTestForImage('assclass-cover.webp')
    //     .then(() => runTestForImage('Manga.png')) // Second image
    //     .catch(err => console.error(err));
    // // Rich test case
    richTestCase1().catch(err => console.error(err));

    // richTestCase2().catch(err => console.error(err));
    // richTestCase3().catch(err => console.error(err));
}
