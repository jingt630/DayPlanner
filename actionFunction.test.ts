import assert from 'assert';
import { TextExtraction } from './TextExtraction'; // adjust path

function runTests() {
  const extractor = new TextExtraction();
  extractor.results = [
    { source: 'media1', extractedText: 'text1', fromCoord: { x: 0, y: 0 }, toCoord: { x: 10, y: 10 } },
    { source: 'media1', extractedText: 'text2', fromCoord: { x: 20, y: 20 }, toCoord: { x: 30, y: 30 } },
  ];

  console.log('Testing editExtractText...');
  extractor.editExtractText(0, 'new text');
  assert.strictEqual(extractor.results[0].extractedText, 'new text');
  try {
    extractor.editExtractText(5, 'fail');
    assert.fail('Expected error for invalid index');
  } catch (e: any) {
    assert.strictEqual(e.message, 'Extraction not found');
  }
  console.log('editExtractText passed ✅');

  console.log('Testing editLocation...');
  extractor.editLocation(0, { x: 0, y: 0 }, { x: 5, y: 5 });
  assert.deepStrictEqual(extractor.results[0].toCoord, { x: 5, y: 5 });
  try {
    extractor.editLocation(0, { x: -1, y: 0 }, { x: 5, y: 5 });
    assert.fail('Expected error for negative coords');
  } catch (e: any) {
    assert.strictEqual(e.message, 'Coordinates must be non-negative');
  }
  console.log('editLocation passed ✅');

  console.log('Testing addExtractionTxt...');
  const newExtraction = extractor.addExtractionTxt('media3', { x: 40, y: 40 }, { x: 50, y: 50 });
  assert.ok(extractor.results.includes(newExtraction));
  assert.strictEqual(newExtraction.extractedText, '');
  try {
    extractor.addExtractionTxt('media3', { x: 5, y: 5 }, { x: 25, y: 25 });
    assert.fail('Expected error for overlapping');
  } catch (e: any) {
    assert.strictEqual(e.message, 'Overlapping extraction area');
  }
  console.log('addExtractionTxt passed ✅');

  console.log('Testing deleteExtraction...');
  extractor.deleteExtraction(0);
  assert.strictEqual(extractor.results.length, 2); // newExtraction + media2 left
  try {
    extractor.deleteExtraction(10);
    assert.fail('Expected error for invalid index');
  } catch (e: any) {
    assert.strictEqual(e.message, 'Extraction not found');
  }
  console.log('deleteExtraction passed ✅');

  console.log('All tests passed 🎉');
}

runTests();
