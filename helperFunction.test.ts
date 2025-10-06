import assert from 'assert';
import { TextExtraction } from './TextExtraction';

function runTests() {
  const tx = new TextExtraction();

  const cases = [
    {
      name: 'Two blocks simple',
      input:
        '1: Abra (from: {x:12, y:34}, to: {x:56, y:78})\n' +
        '2: Cookie (from: {x:90, y:12}, to: {x:34, y:56})\n' +
        'Number of text blocks: 2',
      expectedList: ['Abra', 'Cookie'],
      expectedCount: 2,
    },
    {
      name: 'Three blocks larger coords',
      input:
        '1: First (from: {x:1, y:2}, to: {x:3, y:4})\n' +
        '2: Second (from: {x:5, y:6}, to: {x:7, y:8})\n' +
        '3: Third (from: {x:9, y:10}, to: {x:11, y:12})\n' +
        'Number of text blocks: 3',
      expectedList: ['First', 'Second', 'Third'],
      expectedCount: 3,
    },
  ];

  let failed = false;

  for (const c of cases) {
    try {
      const list = tx.parseNumberedTextList(c.input);
      const count = tx.extractDeclaredCount(c.input);
      console.log(`\nTest: ${c.name}`);
      console.log('Parsed list:', JSON.stringify(list));
      console.log('Declared count:', count);

      assert.deepStrictEqual(list, c.expectedList, `List mismatch for "${c.name}"`);
      assert.strictEqual(count, c.expectedCount, `Count mismatch for "${c.name}"`);
      console.log('→ PASS');
    } catch (err) {
      failed = true;
      console.error(`→ FAIL: ${c.name}`);
      console.error((err as Error).message);
    }
  }

  if (failed) {
    console.error('\nSome tests failed.');
    process.exit(1);
  } else {
    console.log('\nAll tests passed.');
    process.exit(0);
  }
}
function testParseCoordinatesList() {
    console.log("🧪 Running testParseCoordinatesList...");

    const extractor = new TextExtraction();

    // --- Test 1: Normal well-formatted OCR output ---
    const response1 = `
    1: Welcome to class (from: {x:10, y:20}, to: {x:120, y:40})
    2: Enjoy your learning (from: {x:15, y:60}, to: {x:130, y:80})
    Number of text blocks: 2
    `;
    const coords1 = extractor.parseCoordinatesList(response1);

    assert.strictEqual(coords1.length, 2, "Should parse 2 coordinate blocks");
    assert.deepStrictEqual(coords1[0].fromCoord, { x: 10, y: 20 });
    assert.deepStrictEqual(coords1[0].toCoord, { x: 120, y: 40 });
    assert.deepStrictEqual(coords1[1].fromCoord, { x: 15, y: 60 });
    assert.deepStrictEqual(coords1[1].toCoord, { x: 130, y: 80 });

    console.log("✅ Test passed: normal formatted coordinates");
}

if (require.main === module) {
  runTests();
  testParseCoordinatesList();
}
