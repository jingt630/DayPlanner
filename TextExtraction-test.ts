import path from 'path';
import { GeminiLLM, Config } from './gemini-llm';
import { TextExtraction } from './TextExtraction';

/**
 * Load configuration from config.json
 */
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

async function main(): Promise<void> {
  console.log('🧪 TextExtraction simple test');
  const config = loadConfig();
  const llm = new GeminiLLM(config);
  const extractor = new TextExtraction();

  // Use the requested image file
  const imagePath = path.resolve('Manga.png'); // Change to your test image path
  console.log('Using image path:', imagePath);

  try {
    const extracted = await extractor.extractTextFromMedia(llm, imagePath);
    console.log('\n✅ Extraction result (truncated):');
    console.log(extracted ? extracted.slice(0, 1000) : '<no text>');
  } catch (err) {
    console.error('❌ Test failed:', (err as Error).message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
