import { GeminiLLM } from './gemini-llm';
import fs from 'fs';
import path from 'path';
import config from './config.json';

// ---------- State Types ----------
export interface Coordinates {
  x: number;
  y: number;
}

export interface ExtractionResult {
  source: string; // filename
  extractedText: string;
  fromCoord: Coordinates;
  toCoord: Coordinates;
}

export class TextExtraction {
  private results: ExtractionResult[] = [];

    // // ---------- ACTION 1: extract ----------
    // async extract(mediaPath: string): Promise<ExtractionResult[]> {
    //     if (!fs.existsSync(mediaPath)) throw new Error("Media file not found");

    //     const imageData = {
    //     inlineData: {
    //         data: fs.readFileSync(mediaPath).toString("base64"),
    //         mimeType: "image/png", // or image/jpeg
    //     },
    //     };

    //     const prompt = `
    // You are an OCR system.
    // Identify ALL visible text blocks in this image.
    // For EACH text block, return JSON like:
    // [
    // {"text": "example", "fromCoord": {"x": 12, "y": 34}, "toCoord": {"x": 98, "y": 70}}
    // ]
    // Only return valid JSON. Do NOT include explanations.
    //     `;

    //     const response = await model.generateContent([prompt, imageData]);
    //     const text = response.response.text();

    //     try {
    //     const parsed = JSON.parse(text);
    //     this.results = parsed.map((p: any) => ({
    //         source: path.basename(mediaPath),
    //         extractedText: p.text,
    //         fromCoord: p.fromCoord,
    //         toCoord: p.toCoord,
    //     }));
    //     return this.results;
    //     } catch (e) {
    //     console.error("Invalid JSON from LLM:", text);
    //     throw new Error("LLM output could not be parsed");
    //     }
    // }

  async extractTextFromMedia(llm: GeminiLLM, imagePath: string): Promise<string> {
    try {
        if (!fs.existsSync(imagePath)) throw new Error("Image file not found");
        console.log(`🧠 Extracting text from: ${imagePath}`);

        // Compose a single string payload that includes the prompt and the base64 image.
        // Clear markers help the model identify the image data.
        const payload = `You are an OCR assistant. Read all visible text in the given image
        and return only the readable text. Do not describe the image or repeat the base64 data.
        Return plain text only, formatted for readability.`;

        // Pass prompt + image to Gemini
            const text = await llm.executeLLM(payload, imagePath);

            console.log('✅ Text extraction complete!');
            console.log('Extracted text:', text);
            return text;

        } catch (error) {
            console.error('❌ Error extracting text:', (error as Error).message);
            throw error;
        }
    }
  // ---------- ACTION 2: editExtractText ----------
  editExtractText(index: number, newText: string) {
    if (!this.results[index]) throw new Error("Extraction not found");
    this.results[index].extractedText = newText;
  }

  // ---------- ACTION 3: editLocation ----------
  editLocation(index: number, fromCoord: Coordinates, toCoord: Coordinates) {
    if (!this.results[index]) throw new Error("Extraction not found");
    if (fromCoord.x < 0 || fromCoord.y < 0 || toCoord.x < 0 || toCoord.y < 0)
      throw new Error("Coordinates must be non-negative");
    this.results[index].fromCoord = fromCoord;
    this.results[index].toCoord = toCoord;
  }

  // ---------- ACTION 4: addExtractionTxt ----------
  addExtractionTxt(
    media: string,
    fromCoord: Coordinates,
    toCoord: Coordinates
  ): ExtractionResult {
    if (fromCoord.x < 0 || fromCoord.y < 0 || toCoord.x < 0 || toCoord.y < 0)
      throw new Error("Invalid coordinates");
    const overlap = this.results.some((r) =>
      this.overlaps(r.fromCoord, r.toCoord, fromCoord, toCoord)
    );
    if (overlap) throw new Error("Overlapping extraction area");
    const newItem: ExtractionResult = {
      source: media,
      extractedText: "",
      fromCoord,
      toCoord,
    };
    this.results.push(newItem);
    return newItem;
  }

  // ---------- UTIL: overlaps ----------
  // Check if two rectangles overlap
  private overlaps(
    a1: Coordinates,
    a2: Coordinates,
    b1: Coordinates,
    b2: Coordinates
  ) {
    return !(
      a2.x < b1.x ||
      a1.x > b2.x ||
      a2.y < b1.y ||
      a1.y > b2.y
    );
  }

  getAll(): ExtractionResult[] {
    return this.results;
  }
}
