import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const TELEGRAM_URL = 'https://t.me/s/goldcurrencyupdate';

async function scrapeTelegram() {
    try {
        console.log(`Fetching data from ${TELEGRAM_URL}...`);
        const response = await fetch(TELEGRAM_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        const html = await response.text();
        const $ = cheerio.load(html);
        
        let lastMessageText = '';
        const messages = $('.tgme_widget_message_text').toArray();
        if (messages.length === 0) {
            console.warn('No .tgme_widget_message_text found. Possibly channel is private or layout changed.');
            lastMessageText = $('body').text().substring(0, 1500); // fallback to text on body
        } else {
            // Get the last 3 messages just in case the final one is an image without text
            const lastTexts = messages.slice(-3).map(el => {
                const elHtml = $(el).html() || '';
                return cheerio.load(elHtml.replace(/<br\s*\/?>/ig, '\n')).text().trim();
            }).filter(t => t.length > 30); // only keep messages with reasonable length for extraction
            
            if (lastTexts.length > 0) {
                lastMessageText = lastTexts[lastTexts.length - 1]; // take the last meaningful message
            }
        }
        
        return lastMessageText;
    } catch (error) {
        console.error('Error scraping Telegram:', error.message);
        process.exit(1);
    }
}

async function extractDataWithGemini(rawText) {
    try {
        console.log('Sending text to Gemini for extraction...');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const prompt = `
Extract the date, USD buy/sell exchange rates, and 16 Pe Gold buy/sell prices from the following raw text.
Return the result STRICTLY as a JSON object with no markdown formatting.
Remove any commas from numeric values so they are plain numbers. If missing, return null for that field.

Format:
{
  "date": "...",
  "usd_buy": 1234,
  "usd_sell": 1234,
  "gold_buy": 12345678,
  "gold_sell": 12345678
}

Raw Text:
${rawText}
`;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        
        if (text.startsWith('```')) {
            text = text.replace(/```json\n?/, '').replace(/```$/, '').trim();
        }
        
        return JSON.parse(text);
    } catch (error) {
        console.error('Error extracting data with Gemini:', error.message);
        process.exit(1);
    }
}

async function main() {
    const rawText = await scrapeTelegram();
    console.log('\n--- Raw Extracted Text ---');
    console.log(rawText);
    console.log('--------------------------\n');
    
    if (!rawText || !rawText.trim()) {
        console.error('Could not find any text to process.');
        process.exit(1);
    }
    
    const extractedData = await extractDataWithGemini(rawText);
    console.log('\n--- Parsed JSON Data ---');
    console.log(extractedData);
    console.log('------------------------\n');
    
    const outputPath = path.join(process.cwd(), 'data.json');
    fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2), 'utf8');
    console.log(`Successfully saved data to ${outputPath}`);
}

main();
