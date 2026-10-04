import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Type, Modality, LiveServerMessage } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY;

// Initialize GoogleGenAI client with required User-Agent
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Appraisal response schema
const appraisalSchema = {
  type: Type.OBJECT,
  properties: {
    assetName: {
      type: Type.STRING,
      description: 'Brand, exact model name, edition, or variant',
    },
    category: {
      type: Type.STRING,
      description: 'mobility | collectibles | apparel | electronics | tools | other',
    },
    confidenceRating: {
      type: Type.STRING,
      description: 'HIGH (99%+) | MEDIUM (80-98%) | INSUFFICIENT (<80%)',
    },
    confidenceExplanation: {
      type: Type.STRING,
      description: 'Reasoning behind the confidence score based on visible tags and details',
    },
    missingDataAlert: {
      type: Type.STRING,
      description: 'Exact supplementary photo or serial close-up required if confidence is below 99%, or null if verified',
    },
    identification: {
      type: Type.OBJECT,
      properties: {
        manufacturer: { type: Type.STRING },
        modelLine: { type: Type.STRING },
        exactSkuOrVariant: { type: Type.STRING },
        specsOrDimensions: { type: Type.STRING },
        detectedSerialOrTags: { type: Type.STRING },
      },
      required: ['manufacturer', 'modelLine', 'exactSkuOrVariant', 'specsOrDimensions'],
    },
    conditionReport: {
      type: Type.OBJECT,
      properties: {
        conditionTier: { type: Type.STRING, description: 'e.g. Near Mint, Grade B Refurbished, Lightly Used, Good' },
        visibleDefects: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Bullet list of every visible scratch, scuff, fray, or wear mark',
        },
        authenticityRisk: { type: Type.STRING, description: 'Low, Medium, or High risk of replica or dispute' },
        mechanicalOrWearStatus: { type: Type.STRING, description: 'Tire, battery, zipper, centering, or hardware assessment' },
      },
      required: ['conditionTier', 'visibleDefects', 'authenticityRisk', 'mechanicalOrWearStatus'],
    },
    financials: {
      type: Type.OBJECT,
      properties: {
        fastCashPrice: { type: Type.NUMBER, description: 'Quick local cash pickup price within 24-48 hrs, no platform fee' },
        maxYieldPrice: { type: Type.NUMBER, description: 'Higher asking price on online platforms like eBay or Mercari' },
        estimatedFeesAndShipping: { type: Type.NUMBER, description: '13-15% platform commission + label cost' },
        netInPocketYield: { type: Type.NUMBER, description: 'Realistic money in hand after all friction' },
        bottomDollarWalkAwayPrice: { type: Type.NUMBER, description: 'Hard floor below which offer MUST be rejected' },
        sellThroughRatePercent: { type: Type.NUMBER, description: 'Historical 90-day sold listings percentage (e.g. 78)' },
        medianDaysToSell: { type: Type.NUMBER, description: 'Average days to clear at recommended price' },
        recommendedRoute: { type: Type.STRING, description: 'LOCAL_CASH_ONLY | SPECIALIZED_BUYLIST | ONLINE_MARKETPLACE' },
        routeJustification: { type: Type.STRING, description: 'Why this channel was chosen' },
      },
      required: [
        'fastCashPrice',
        'maxYieldPrice',
        'estimatedFeesAndShipping',
        'netInPocketYield',
        'bottomDollarWalkAwayPrice',
        'sellThroughRatePercent',
        'medianDaysToSell',
        'recommendedRoute',
        'routeJustification',
      ],
    },
    turnkeyListing: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Keyword-optimized marketplace title (under 80 characters)' },
        disputeProofDescription: { type: Type.STRING, description: 'Honest, condition-transparent description eliminating return excuses' },
        suggestedPlatformTags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['title', 'disputeProofDescription', 'suggestedPlatformTags'],
    },
    negotiationScripts: {
      type: Type.OBJECT,
      properties: {
        onInitialInquiry: { type: Type.STRING, description: 'Response to "Is this still available?"' },
        onLowballOffer: { type: Type.STRING, description: 'Response to ridiculous offers' },
        onElectronicPaymentScam: { type: Type.STRING, description: 'Response when buyer pushes fake Zelle/Venmo or business upgrade' },
        onTestRideOrInspection: { type: Type.STRING, description: 'Cash-in-hand test ride requirement' },
      },
      required: ['onInitialInquiry', 'onLowballOffer', 'onElectronicPaymentScam', 'onTestRideOrInspection'],
    },
    safetyAndScamWarning: {
      type: Type.STRING,
      description: 'The single highest risk factor with this specific item category and how to neutralize it',
    },
    singleImmediateAction: {
      type: Type.STRING,
      description: 'Exactly 1 physical task the operator must execute in the next 30 minutes',
    },
  },
  required: [
    'assetName',
    'category',
    'confidenceRating',
    'confidenceExplanation',
    'identification',
    'conditionReport',
    'financials',
    'turnkeyListing',
    'negotiationScripts',
    'safetyAndScamWarning',
    'singleImmediateAction',
  ],
};

// Add your multiple API tokens to your .env and reference them here:
const apifyToken = process.env.APIFY_API_TOKEN;
const googleSearchApiToken = process.env.GOOGLE_SEARCH_API_TOKEN;

// The Omni-Aggregator Endpoint (V2 Optimized)
app.post('/api/appraise', async (req, res) => {
  try {
    const { images, categoryHint, operatorNotes } = req.body;
    if (!images || images.length === 0) return res.status(400).json({ error: 'Image required.' });
    if (!ai) throw new Error("Gemini API not configured. Check your GEMINI_API_KEY secret.");

    // 1. Process Images
    const parts: any[] = [];
    for (const img of images) {
      const matches = img.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      parts.push({
        inlineData: {
          mimeType: matches ? matches[1] : 'image/jpeg',
          data: matches ? matches[2] : img,
        },
      });
    }

    // ---------------------------------------------------------
    // PASS 1: SCOUT & IDENTITY GENERATION (Heavy Image Process)
    // ---------------------------------------------------------
    const keywordPrompt = `
Analyze the attached image(s). Identify the exact item. 
Output ONLY a raw JSON object with this exact schema:
{ 
  "keyword": "Specific Brand and Model Name (for search scraping)",
  "visualDescription": "Highly detailed description of the actual item in the photo, including color, visible condition, wear and tear, and specific physical features."
}
`;
    
    const keywordResponse = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: { role: 'user', parts: [...parts, { text: keywordPrompt }] },
      config: { responseMimeType: 'application/json', temperature: 0.1 }
    });
    
    const parsedScout = JSON.parse(keywordResponse.text || '{"keyword":"", "visualDescription":""}');
    const searchTarget = parsedScout.keyword;
    const visualProfile = parsedScout.visualDescription;

    let marketDataStr = "No comps found.";
    let calculatedMedian = 0;

    if (searchTarget && apifyToken && googleSearchApiToken) {
      console.log(`[SHUTTERBUCK OMNI-AGGREGATOR V2] Firing parallel scrape for: ${searchTarget}`);

      // ---------------------------------------------------------
      // PASS 2: FAN-OUT FETCH WITH 8-SECOND KILL SWITCH
      // ---------------------------------------------------------
      
      // Resource 1: eBay Sold Comps (8s Timeout)
      const ebayPromise = fetch(`https://api.apify.com/v2/actors/caffein.dev~ebay-sold-listings/run-sync-get-dataset-items?token=${apifyToken}`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: [searchTarget], count: 8 }),
        signal: AbortSignal.timeout(8000)
      }).then(res => res.json());

      // Resource 2: Mercari Active/Sold Comps (8s Timeout)
      const mercariPromise = fetch(`https://api.apify.com/v2/actors/automation-lab~mercari-us-listings-scraper/run-sync-get-dataset-items?token=${apifyToken}`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchKeywords: [searchTarget], maxListings: 5 }),
        signal: AbortSignal.timeout(8000)
      }).then(res => res.json());

      // Resource 3: Google Search API (Lightning fast, 8s Timeout added for safety)
      const searchPromise = fetch('https://google.serper.dev/search', {
        method: 'POST', 
        headers: { 'X-API-KEY': googleSearchApiToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: `${searchTarget} "sold for" OR "price" site:liveauctioneers.com OR site:offerup.com` }),
        signal: AbortSignal.timeout(8000)
      }).then(res => res.json());

      // Await all resources. allSettled prevents a TimeoutError from crashing the entire block.
      const results = await Promise.allSettled([ebayPromise, mercariPromise, searchPromise]);

      // ---------------------------------------------------------
      // PASS 3: THE COMPILER
      // ---------------------------------------------------------
      const allPrices: number[] = [];
      let evidenceLog = "";

      if (results[0].status === 'fulfilled' && Array.isArray(results[0].value)) {
        results[0].value.forEach((item: any) => {
          if (item.totalPrice) {
            allPrices.push(Number(item.totalPrice));
            evidenceLog += `[eBay Sold] $${item.totalPrice}\n`;
          }
        });
      } else if (results[0].status === 'rejected') {
        console.warn(`[SHUTTERBUCK] eBay Scraper Failed or Timed Out:`, results[0].reason);
      }

      if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) {
        results[1].value.forEach((item: any) => {
          if (item.price) {
            allPrices.push(Number(item.price));
            evidenceLog += `[Mercari ${item.isSold ? 'Sold' : 'Active'}] $${item.price}\n`;
          }
        });
      } else if (results[1].status === 'rejected') {
        console.warn(`[SHUTTERBUCK] Mercari Scraper Failed or Timed Out:`, results[1].reason);
      }

      if (results[2].status === 'fulfilled' && results[2].value.organic) {
        results[2].value.organic.forEach((result: any) => {
          const priceMatch = result.snippet.match(/\$(\d{1,3}(,\d{3})*(\.\d{2})?)/);
          if (priceMatch) {
            const price = parseFloat(priceMatch[1].replace(/,/g, ''));
            allPrices.push(price);
            evidenceLog += `[Auction/Web Snippet] $${price} via ${result.domain}\n`;
          }
        });
      } else if (results[2].status === 'rejected') {
        console.warn(`[SHUTTERBUCK] Serper Scraper Failed or Timed Out:`, results[2].reason);
      }

      if (allPrices.length > 0) {
        allPrices.sort((a, b) => a - b);
        const mid = Math.floor(allPrices.length / 2);
        calculatedMedian = allPrices.length % 2 !== 0 ? allPrices[mid] : (allPrices[mid - 1] + allPrices[mid]) / 2;
        
        marketDataStr = `
TOTAL COMPS FOUND: ${allPrices.length}
MATHEMATICAL MEDIAN PRICE: $${calculatedMedian.toFixed(2)}
RAW EVIDENCE LOG:
${evidenceLog}
`;
      }
    }

    // ---------------------------------------------------------
    // PASS 4: THE EDUCATED EVALUATION (Text Only - No Images)
    // ---------------------------------------------------------
    const finalPrompt = `
You are the formatting engine. Output strictly in the defined JSON schema for the asset: "${searchTarget}".

PHYSICAL DESCRIPTION:
Use this exact visual profile to fill out the description and condition fields:
"${visualProfile}"

OMNI-AGGREGATOR MARKET DATA:
The mathematical median from all active and sold resources is $${calculatedMedian}.
Use this median to dictate the fast cash and max yield prices. 
${marketDataStr}

${categoryHint ? `Category: ${categoryHint}` : ''}
${operatorNotes ? `Notes: ${operatorNotes}` : ''}
`;

    // Note: 'parts' array is no longer passed here to save heavy token compute. 
    // We only pass the text prompt containing the asset name and scraped prices.
    const finalResponse = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: { role: 'user', parts: [{ text: finalPrompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: appraisalSchema,
        temperature: 0.1, 
      },
    });

    const parsedData = JSON.parse(finalResponse.text || '{}');
    return res.json({ success: true, dossier: parsedData, isLiveModel: true });

  } catch (error: any) {
    console.error('Appraisal error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Custom script generation endpoint (Optimized model)
app.post('/api/generate-script', async (req, res) => {
  try {
    const { buyerMessage, itemTitle, askingPrice, bottomPrice } = req.body;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `You are the ruthless Anti-Scam Negotiation Shield for an operator selling "${itemTitle}" (Listed at $${askingPrice}, bottom floor $${bottomPrice}).
The buyer just messaged: "${buyerMessage}"

Provide:
1. Threat / Scam Assessment (is this an advance fee scam, fake Zelle confirmation, aggressive lowballer, or legitimate buyer?)
2. Exact copy-paste response script that protects the seller's cash, safety, and price floor.
3. Rule to enforce during meetup.

Keep it concise and tactical.`,
        config: {
          temperature: 0.2,
        },
      });

      return res.json({ success: true, analysis: response.text });
    }

    const analysis = generateFallbackNegotiationScript(buyerMessage, itemTitle, askingPrice, bottomPrice);
    return res.json({ success: true, analysis });
  } catch (err: any) {
    console.error('Script generation error:', err);
    const analysis = generateFallbackNegotiationScript(req.body.buyerMessage, req.body.itemTitle, req.body.askingPrice, req.body.bottomPrice);
    return res.json({ success: true, analysis });
  }
});

// API: Multi-Turn Gemini Chatbot (Optimized with startChat and production models)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemInstruction, taskType } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // OPTIMIZATION: Mapped to current production stable endpoints
    let modelName = 'gemini-1.5-flash';
    if (taskType === 'complex' || req.body.model?.includes('pro')) {
      modelName = 'gemini-1.5-pro';
    } else if (taskType === 'fast' || req.body.model?.includes('lite') || req.body.model?.includes('8b')) {
      modelName = 'gemini-1.5-flash-8b'; // Ultra-low latency endpoint
    }

    if (!ai) {
      return res.json({
        success: true,
        reply: `[OFFLINE COPILOT (${modelName})]: Operating in local knowledge mode. Recommended action: inspect serial stamp, check battery voltage with multimeter, and adhere strictly to the 50/40/10 Fortress Vault split.`,
        modelUsed: modelName,
      });
    }

    // OPTIMIZATION: Extract history vs the latest prompt for stateful chat sessions
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text || '' }],
    }));
    const latestMessage = messages[messages.length - 1].text;

    try {
      // OPTIMIZATION: Use the native chat abstraction for compound-memory retention
      const chatSession = ai.chats.create({
        model: modelName,
        history: history,
        config: {
          systemInstruction: systemInstruction || 'You are the Master Overseer & LEV Shop Copilot for an independent Los Angeles light-electric-vehicle repair and resale business. Provide direct, tactical, profit-maximizing, and safety-critical guidance. Zero fluff.',
          temperature: taskType === 'complex' ? 0.3 : 0.7,
        },
      });

      const response = await chatSession.sendMessage({ message: latestMessage });

      return res.json({
        success: true,
        reply: response.text || 'No response generated.',
        modelUsed: modelName,
      });
    } catch (genError: any) {
      // Graceful fallback from pro model
      if (modelName === 'gemini-1.5-pro') {
        const fallbackChatSession = ai.chats.create({
          model: 'gemini-1.5-flash',
          history: history,
          config: {
            systemInstruction: systemInstruction || 'You are the Master Overseer Copilot.',
          },
        });
        const fallbackRes = await fallbackChatSession.sendMessage({ message: latestMessage });
        
        return res.json({
          success: true,
          reply: fallbackRes.text || '',
          modelUsed: 'gemini-1.5-flash (auto-fallback)',
        });
      }
      throw genError;
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: error.message || 'Chat generation failed' });
  }
});

// API: Google Search Grounding (Optimized model)
app.post('/api/search-grounding', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    if (!ai) {
      return res.json({
        success: true,
        text: `Search Grounding offline. Market comps for "${query}" suggest checking recent 90-day sold eBay listings and local OfferUp pickups.`,
        sources: [],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Provide accurate, up-to-date market intelligence and technical analysis for: ${query}. Include recent sold comps, recalls, pricing trends, and supplier availability.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: Array<{ title: string; uri: string }> = [];
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri) {
        sources.push({
          title: chunk.web.title || chunk.web.uri,
          uri: chunk.web.uri,
        });
      }
    });

    return res.json({
      success: true,
      text: response.text || '',
      sources,
    });
  } catch (error: any) {
    console.error('Search grounding error:', error);
    return res.status(500).json({ error: error.message || 'Search grounding failed' });
  }
});

// API: Google Maps Grounding (Optimized model)
app.post('/api/maps-grounding', async (req, res) => {
  try {
    const { query, latitude, longitude } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Maps query is required.' });
    }

    if (!ai) {
      return res.json({
        success: true,
        text: `Maps Grounding offline. Recommendation: Use LAPD Police Safe Exchange Zones and 24/7 bank lobbies for safe in-person cash transactions.`,
        places: [],
      });
    }

    const lat = latitude || 34.0522; 
    const lng = longitude || -118.2437;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `Find and recommend specific real-world locations for: ${query}. Focus on safety, public visibility, safe exchange zones, or verified parts suppliers.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng,
            },
          },
        },
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const places: Array<{ title: string; uri: string }> = [];
    chunks.forEach((chunk: any) => {
      if (chunk.maps?.uri) {
        places.push({
          title: chunk.maps.title || 'View Location on Google Maps',
          uri: chunk.maps.uri,
        });
      }
    });

    return res.json({
      success: true,
      text: response.text || '',
      places,
    });
  } catch (error: any) {
    console.error('Maps grounding error:', error);
    return res.status(500).json({ error: error.message || 'Maps grounding failed' });
  }
});

function generateDomainFallback(images: any[], categoryHint?: string, notes?: string) {
  const noteLower = (notes || '').toLowerCase();
  const cat = (categoryHint || '').toLowerCase();

  if (cat.includes('mobility') || noteLower.includes('scooter') || noteLower.includes('ninebot') || noteLower.includes('ebike') || noteLower.includes('bike')) {
    const isEbike = noteLower.includes('super73') || noteLower.includes('ebike') || noteLower.includes('rad') || noteLower.includes('bike');
    if (isEbike) {
      return {
        assetName: 'Super73 RX Electric Motorbike (Obsidian)',
        category: 'mobility',
        confidenceRating: 'HIGH (99%+)',
        confidenceExplanation: 'Frame geometry, inverted coil-spring fork, integrated headlight, and 960Wh down-tube battery identified with forensic certainty.',
        missingDataAlert: null,
        identification: {
          manufacturer: 'Super73',
          modelLine: 'RX Series / High Performance',
          exactSkuOrVariant: 'Super73-RX-OBS-2022',
          specsOrDimensions: '960Wh 48V battery, 1200W peak rear hub motor, 20x4" BDGR tires, 4-piston hydraulic disc brakes',
          detectedSerialOrTags: 'S73-RX-78942-CA verified on bottom bracket',
        },
        conditionReport: {
          conditionTier: 'Very Good Used (Grade B+)',
          visibleDefects: [
            'Light cosmetic scuffs on battery mount bracket',
            'Minor tire tread wear (approx 85% life remaining)',
            'Small surface scratch on left pedal crank',
          ],
          authenticityRisk: 'Low (Authentic Super73 frame stamping and display)',
          mechanicalOrWearStatus: 'Display functional, battery holds 54.6V full charge, hydraulic brake levers firm',
        },
        financials: {
          fastCashPrice: 1650,
          maxYieldPrice: 1950,
          estimatedFeesAndShipping: 280,
          netInPocketYield: 1650,
          bottomDollarWalkAwayPrice: 1500,
          sellThroughRatePercent: 88,
          medianDaysToSell: 3,
          recommendedRoute: 'LOCAL_CASH_ONLY',
          routeJustification: 'Shipping a 960Wh lithium battery triggers hazardous material shipping fees ($150+) and high fraud risk. Local cash in daylight avoids 13% platform fees.',
        },
        turnkeyListing: {
          title: 'Super73 RX Electric Bike - Mint Working Order, Charger & Keys Included - CASH ONLY',
          disputeProofDescription: 'Selling my authentic Super73 RX in great working condition. Battery holds full charge, hydraulic brakes bite sharp, all 4 riding modes switch smoothly. Comes with original Super73 fast charger and battery key lock. Minor cosmetic marks from gentle commuting as pictured. Clean serial number on bottom bracket ready to transfer. Local cash in person only at local Police Safe Zone.',
          suggestedPlatformTags: ['Super73', 'Ebike', 'Electric Bike', 'Super73 RX', 'Electric Scooter', 'Commuter'],
        },
        negotiationScripts: {
          onInitialInquiry: 'Yes, it is available. I can meet today between 2 PM and 5 PM at the Police Station Safe Zone on Main St. Are you paying cash?',
          onLowballOffer: 'Thanks for reaching out, but the lowest cash price I will accept today is $1,500. Let me know if that works for you.',
          onElectronicPaymentScam: 'Strict policy: I only accept cash in person at the police station lobby. No electronic transfers, checks, or third-party couriers.',
          onTestRideOrInspection: 'You are welcome to test ride it! Standard policy: the full $1,650 cash price goes physically into my hands before your feet touch the pedals. If you decide not to buy, I hand your cash right back.',
        },
        safetyAndScamWarning: 'HIGH THEFT RISK ON TEST RIDES. Never allow a buyer onto the e-bike without holding the entire cash amount in your physical hand. Do not accept digital payments.',
        singleImmediateAction: 'Wipe frame and wheels with a clean microfiber rag, charge battery to 100%, and take 4 daylight photos outside against a clean wall.',
      };
    } else {
      return {
        assetName: 'Segway Ninebot KickScooter MAX G30P',
        category: 'mobility',
        confidenceRating: 'HIGH (99%+)',
        confidenceExplanation: 'Iconic dark gray tubular frame, orange rear wheel accent ring, rear-wheel drive hub, and integrated front LED match Segway MAX G30P specs.',
        missingDataAlert: null,
        identification: {
          manufacturer: 'Segway-Ninebot',
          modelLine: 'KickScooter MAX Series',
          exactSkuOrVariant: 'Ninebot MAX G30P (Gen 2 Motor)',
          specsOrDimensions: '350W nominal motor, 551Wh internal battery, 10-inch self-healing pneumatic tires, 40.4 mi rated range',
          detectedSerialOrTags: 'N4GSD-XXXX-G30P underside QR tag',
        },
        conditionReport: {
          conditionTier: 'Good Working Condition',
          visibleDefects: [
            'Scuff marks along lower kickstand and folding latch hinge',
            'Foot deck rubber grip has light dirt staining',
            'Rear fender reflector has slight road dust',
          ],
          authenticityRisk: 'Low',
          mechanicalOrWearStatus: 'Stem latch locks tight with zero wobble; tires hold 45 PSI; throttle responsive; LED dashboard bright',
        },
        financials: {
          fastCashPrice: 420,
          maxYieldPrice: 520,
          estimatedFeesAndShipping: 78,
          netInPocketYield: 420,
          bottomDollarWalkAwayPrice: 380,
          sellThroughRatePercent: 92,
          medianDaysToSell: 2,
          recommendedRoute: 'LOCAL_CASH_ONLY',
          routeJustification: 'Extremely high local commuter demand. 92% sell-through rate on Facebook Marketplace and OfferUp within 48 hours for under $450.',
        },
        turnkeyListing: {
          title: 'Segway Ninebot MAX G30P Electric Scooter - 40 Mile Range - Mint - CASH ONLY',
          disputeProofDescription: 'Selling an authentic Segway Ninebot KickScooter MAX G30P in solid working shape. Battery charges to 100%, original AC charging cord included (built-in internal charger). Tires are in good shape with self-healing slime intact, drum brake stops instantly. Folds down smoothly for trunk or train. Cash only in person at bank lobby or police station.',
          suggestedPlatformTags: ['Segway', 'Ninebot Max', 'G30P', 'Electric Scooter', 'Commuter Scooter'],
        },
        negotiationScripts: {
          onInitialInquiry: 'Yes, it is available. I can meet today at the Chase Bank lobby or Police station. Are you paying cash?',
          onLowballOffer: 'Appreciate the offer, but $380 cash is my absolute rock-bottom price today.',
          onElectronicPaymentScam: 'Cash in hand only at the meetup spot. No Zelle email requests or Venmo holds.',
          onTestRideOrInspection: 'You can test ride it right outside the bank lobby; full cash price must be in my hand while riding.',
        },
        safetyAndScamWarning: 'Watch out for buyers claiming to send a family member with a cashier check or requesting your Zelle email to "upgrade" your account. Instant block.',
        singleImmediateAction: 'Plug scooter in to reach 100% battery, snap a photo of the illuminated speedometer showing zero error codes.',
      };
    }
  }

  if (cat.includes('collectible') || noteLower.includes('card') || noteLower.includes('pokemon') || noteLower.includes('charizard') || noteLower.includes('tcg')) {
    return {
      assetName: '1999 Pokémon Base Set Unlimited Shadowless Holo Charizard #4/102',
      category: 'collectibles',
      confidenceRating: 'MEDIUM (88%)',
      confidenceExplanation: 'Card artwork, font weight, and rarity star match 1999 Base Set. Shadowless border confirmed, but sub-surface foil micro-scratches require glare-free lighting.',
      missingDataAlert: 'Take a close-up photo of the card back on a black background to assess corner whitening, plus an angled shot under direct light to check holo foil scratch depth.',
      identification: {
        manufacturer: 'Wizards of the Coast / Nintendo',
        modelLine: 'Pokémon Trading Card Game - Base Set',
        exactSkuOrVariant: 'Shadowless Unlimited Holofoil #4/102',
        specsOrDimensions: 'Standard 2.5 x 3.5 in TCG card, Raw (Ungraded)',
        detectedSerialOrTags: 'Set Number 4/102, Copyright 1995, 96, 98, 99 Wizards',
      },
      conditionReport: {
        conditionTier: 'Lightly Played (LP) - Strict Conservative Rating',
        visibleDefects: [
          'Mild whitening along top right reverse border corner',
          'Slight horizontal micro-scuff across bottom yellow front border',
          'Centering: approximately 55/45 left-to-right (well within standard)',
        ],
        authenticityRisk: 'Medium-High if selling online without escrow (counterfeit risk leads to buyer chargeback scams)',
        mechanicalOrWearStatus: 'No creases, no water damage, holo pattern has full gloss with minor age wear',
      },
      financials: {
        fastCashPrice: 580,
        maxYieldPrice: 850,
        estimatedFeesAndShipping: 135,
        netInPocketYield: 580,
        bottomDollarWalkAwayPrice: 520,
        sellThroughRatePercent: 84,
        medianDaysToSell: 5,
        recommendedRoute: 'SPECIALIZED_BUYLIST',
        routeJustification: 'Selling raw high-end vintage cards on a fresh eBay account risks 21-day escrow holds, buyer swap scams, and condition disputes. Sell in person to a vetted Local Card Shop (LCS) or TCGplayer direct buylist for guaranteed immediate cash.',
      },
      turnkeyListing: {
        title: '1999 Pokemon Base Set Charizard 4/102 Holo - Shadowless - LP Condition - Authentic',
        disputeProofDescription: 'Authentic 1999 Pokemon Base Set Charizard #4/102 Holo (Shadowless border). Conservatively graded as Lightly Played (LP). Zero creases or structural bends, clean eye appeal with minor surface wear and edge whitening on reverse as documented in high-resolution macro photos. Shipped in penny sleeve, magnetic one-touch case, and bubble-wrapped tracked box. Signature required.',
        suggestedPlatformTags: ['Pokemon', 'Charizard', 'Base Set', 'Vintage TCG', 'WOTC', 'Shadowless'],
      },
      negotiationScripts: {
        onInitialInquiry: 'Yes, available. The card is kept in a magnetic UV-safe one-touch case. Are you interested in local inspection at [Local Hobby Shop/Bank]?',
        onLowballOffer: 'Thank you, but recent verified sold comps for this exact condition average $750+. My bottom-line cash price is $550.',
        onElectronicPaymentScam: 'All transactions for vintage collectibles over $200 are in-person cash or verified PayPal Goods & Services with signature confirmation upon delivery.',
        onTestRideOrInspection: 'Card can be inspected out of sleeve in person inside the card shop under their loupe/lighting.',
      },
      safetyAndScamWarning: 'THE CARD-SWAP SCAM: Dishonest buyers receive your authentic card, open a return claim, and ship back an empty envelope or damaged counterfeit. If selling locally, meet inside a licensed card shop.',
      singleImmediateAction: 'Place card into a fresh penny sleeve and rigid top-loader. Take 2 photos on a dark matte surface showing both sides with clean light.',
    };
  }

  if (cat.includes('electronics') || noteLower.includes('sony') || noteLower.includes('headphone') || noteLower.includes('audio') || noteLower.includes('switch') || noteLower.includes('ipad')) {
    return {
      assetName: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
      category: 'electronics',
      confidenceRating: 'HIGH (99%+)',
      confidenceExplanation: 'Confirmed dual-hinge ear cup design, integrated microphone grille arrays, and authentic Sony serial labeling inside headband.',
      missingDataAlert: null,
      identification: {
        manufacturer: 'Sony',
        modelLine: '1000X Series Premium ANC',
        exactSkuOrVariant: 'WH1000XM5/B (Black)',
        specsOrDimensions: '30mm carbon fiber drivers, 30hr battery life, LDAC & Hi-Res Audio certified',
        detectedSerialOrTags: 'S01-582190-J on interior left headband slider',
      },
      conditionReport: {
        conditionTier: 'Excellent Pre-Owned (Grade A)',
        visibleDefects: [
          'Leatherette ear cushions are supple with zero cracking or flaking',
          'Soft-touch matte earcups show minor faint fingerprint sheen',
        ],
        authenticityRisk: 'Low (Authentic Sony firmware pairing & companion app confirmed)',
        mechanicalOrWearStatus: 'ANC switches instantly, touch gestures responsive, battery health 96%',
      },
      financials: {
        fastCashPrice: 190,
        maxYieldPrice: 245,
        estimatedFeesAndShipping: 36,
        netInPocketYield: 190,
        bottomDollarWalkAwayPrice: 170,
        sellThroughRatePercent: 91,
        medianDaysToSell: 3,
        recommendedRoute: 'LOCAL_CASH_ONLY',
        routeJustification: 'Extremely liquid electronics item. High local student and commuter demand clears for cash within 72 hours with 0% platform take-rate.',
      },
      turnkeyListing: {
        title: 'Sony WH-1000XM5 ANC Headphones - Mint Shape, Case & Cables - Cash Only',
        disputeProofDescription: 'Selling authentic Sony WH-1000XM5 active noise-canceling headphones in black. Pristine acoustic condition, active noise cancellation is whisper quiet, battery holds full 30-hour charge. Includes original magnetic hard travel case, 3.5mm audio cable, and USB-C charging cord. Clean serial number. Local cash in person at safe public meetup zone.',
        suggestedPlatformTags: ['Sony', 'WH1000XM5', 'Noise Canceling', 'Headphones', 'Audiophile'],
      },
      negotiationScripts: {
        onInitialInquiry: 'Yes, the XM5s are available and in great working order. Can meet today in daylight at the bank lobby or police station safe zone.',
        onLowballOffer: 'Thanks for reaching out, but these retail at $399. The lowest cash price I can accept today is $175.',
        onElectronicPaymentScam: 'Strict policy: in-person cash only at the public meetup spot. No electronic app holds.',
        onTestRideOrInspection: 'You are welcome to pair your phone via Bluetooth and test audio/ANC in person before handing over cash.',
      },
      safetyAndScamWarning: 'Watch for fake electronic payment transfers. Insist on physical cash counted in hand.',
      singleImmediateAction: 'Wipe ear cushions with audio-safe clean cloth, fully charge, and pack neatly into travel case.',
    };
  }

  if (cat.includes('tools') || noteLower.includes('drill') || noteLower.includes('dewalt') || noteLower.includes('milwaukee') || noteLower.includes('saw')) {
    return {
      assetName: 'Milwaukee M18 FUEL 1/2" Hammer Drill & Impact Driver Combo Kit',
      category: 'tools',
      confidenceRating: 'HIGH (99%+)',
      confidenceExplanation: 'Brushless POWERSTATE motor badging, REDLINK PLUS electronics serial tags, and 5.0Ah XC battery pack confirmed.',
      missingDataAlert: null,
      identification: {
        manufacturer: 'Milwaukee Tool',
        modelLine: 'M18 FUEL Heavy Duty',
        exactSkuOrVariant: 'Kit 2997-22 (Hammer Drill 2804-20 + Impact 2853-20)',
        specsOrDimensions: '18V Brushless, 1,200 in-lbs peak torque, 2x M18 5.0Ah XC RedLithium batteries + M18/M12 multi-voltage charger',
        detectedSerialOrTags: 'Serials H42A-21948 & G89D-81024',
      },
      conditionReport: {
        conditionTier: 'Very Good Working Shape (Trade Grade B+)',
        visibleDefects: [
          'Normal jobsite scuffs on rubber overmold grip bumpers',
          'Chuck has light surface metal rub from bit changes',
          'Battery fuel gauges both light up all 4 green LED bars',
        ],
        authenticityRisk: 'Low',
        mechanicalOrWearStatus: 'All clutch settings click firm, hammer mode engages cleanly, forward/reverse triggers smooth',
      },
      financials: {
        fastCashPrice: 220,
        maxYieldPrice: 280,
        estimatedFeesAndShipping: 44,
        netInPocketYield: 220,
        bottomDollarWalkAwayPrice: 195,
        sellThroughRatePercent: 89,
        medianDaysToSell: 2,
        recommendedRoute: 'LOCAL_CASH_ONLY',
        routeJustification: 'Local tradesmen, contractors, and DIYers on Marketplace buy M18 FUEL kits in under 48 hours for fast green cash.',
      },
      turnkeyListing: {
        title: 'Milwaukee M18 FUEL Hammer Drill & Impact Driver Combo - 2x 5.0Ah Batteries - Cash',
        disputeProofDescription: 'Selling authentic Milwaukee M18 FUEL brushless hammer drill and 1/4" hex impact driver. Both tools test 100% functional with monster torque. Includes two genuine Milwaukee 5.0Ah XC battery packs (hold full 4-bar charge) and M18/M12 multi-voltage fast charger. Clean tools ready for jobsite work. Cash in person only at safe public meetup zone.',
        suggestedPlatformTags: ['Milwaukee', 'M18 FUEL', 'Impact Driver', 'Hammer Drill', 'Power Tools'],
      },
      negotiationScripts: {
        onInitialInquiry: 'Yes, the Milwaukee M18 FUEL kit is available. I can meet today between 1 PM and 5 PM at Home Depot parking lot or Police Safe Zone.',
        onLowballOffer: 'Appreciate the offer, but kit sells for $399 new and sold comps are $240+. My lowest cash price today is $200.',
        onElectronicPaymentScam: 'Cash in hand only at the meetup point. No electronic payment apps.',
        onTestRideOrInspection: 'Bring a scrap 2x4 and screws to test drive both tools on the spot.',
      },
      safetyAndScamWarning: 'High liquidity target for local tool theft rings. Always check buyer profile and meet in daylight.',
      singleImmediateAction: 'Charge both 5.0Ah batteries to 4 bars, test variable speed triggers, and take photos of both serial badges.',
    };
  }

  return {
    assetName: 'Arc\'teryx Beta LT Gore-Tex Hooded Jacket (Men\'s Large)',
    category: 'apparel',
    confidenceRating: 'HIGH (99%+)',
    confidenceExplanation: 'Embroidered bird logo, Gore-Tex Pro interior seam tape, WaterTight front zipper, and neck heat-transfer size label verified against factory references.',
    missingDataAlert: null,
    identification: {
      manufacturer: 'Arc\'teryx',
      modelLine: 'Beta LT Jacket',
      exactSkuOrVariant: 'Model 26844 / CA#34438 / RN#13128',
      specsOrDimensions: 'Men\'s Size L, 3-layer GORE-TEX with tricot backer, Black',
      detectedSerialOrTags: 'Interior hip wash tag shows style code 26844-128743',
    },
    conditionReport: {
      conditionTier: 'Excellent Pre-Owned Condition',
      visibleDefects: [
        'Zero delamination on interior neck or hem seams',
        'Minor superficial dust mark near right wrist cuff (easily cleaned)',
        'DWR water-repellent coating intact and beading water',
      ],
      authenticityRisk: 'Low (Arc\'teryx embroidery micro-stitches and YKK Vislon zipper codes match authentic Canadian/OEM production)',
      mechanicalOrWearStatus: 'All drawcords, pit zips, and Velcro cuffs functional',
    },
    financials: {
      fastCashPrice: 240,
      maxYieldPrice: 320,
      estimatedFeesAndShipping: 48,
      netInPocketYield: 240,
      bottomDollarWalkAwayPrice: 210,
      sellThroughRatePercent: 86,
      medianDaysToSell: 4,
      recommendedRoute: 'ONLINE_MARKETPLACE',
      routeJustification: 'Outdoor and streetwear technical outerwear commands premium nationwide demand on Mercari, eBay, and Poshmark with low shipping weight (<1.2 lbs).',
    },
    turnkeyListing: {
      title: 'Arc\'teryx Beta LT GORE-TEX Jacket Men\'s Large Black - Authentic - Mint Seams',
      disputeProofDescription: 'Authentic Arc\'teryx Beta LT jacket in Men\'s Large (Black). Features 3L Gore-Tex waterproof breathable membrane. Seam tape is 100% factory fresh with zero delamination, bubbling, or peeling. Zippers glide smoothly, pit vents fully operational, cuffs crisp. Stored on wide hanger in smoke-free home. Fast same-day USPS Priority shipping with tracking.',
      suggestedPlatformTags: ['Arcteryx', 'Beta LT', 'Gore-Tex', 'Outdoors', 'Technical Outerwear', 'Gorpcore'],
    },
    negotiationScripts: {
      onInitialInquiry: 'Yes, the Beta LT is still available and ready to ship today via tracked Priority Mail or meet locally in [City].',
      onLowballOffer: 'Thanks for your offer, but this model retails at $450 and sold comps in this condition are $280-$340. The lowest I can accept is $220.',
      onElectronicPaymentScam: 'All transactions go through the official platform checkout with tracking for buyer and seller protection.',
      onTestRideOrInspection: 'Fit is true to modern Arc\'teryx regular shell sizing, designed to layer over a fleece or atom LT.',
    },
    safetyAndScamWarning: 'Be wary of counterfeit claims; always photograph the interior white wash tag style number (26844) and seam tape clearly in the listing photos to shut down fraudulent "item not as described" disputes.',
    singleImmediateAction: 'Wipe down exterior with slightly damp microfiber cloth, hang on a sturdy hanger against a white door, and take 3 photos (front, back, and interior neck seam tape).',
  };
}

function generateFallbackNegotiationScript(buyerMessage: string = '', itemTitle: string = 'Item', askingPrice: number = 300, bottomPrice: number = 240) {
  const msg = buyerMessage.toLowerCase();

  let threatLevel = 'LOW';
  let threatAnalysis = 'Standard buyer inquiry.';
  let script = `Yes, it is available. I can meet today between 1 PM and 5 PM at the Chase Bank lobby or Police Station Safe Zone. Are you paying cash in person?`;
  let safetyRule = 'Meet in daylight inside a bank lobby or police station parking lot. Cash in hand only.';

  if (msg.includes('zelle') || msg.includes('venmo') || msg.includes('email') || msg.includes('courier') || msg.includes('mover') || msg.includes('business account')) {
    threatLevel = 'CRITICAL (99% PHISHING / ADVANCE-FEE SCAM)';
    threatAnalysis = 'The buyer is attempting a classic Overpayment or Fake Business Account Upgrade scam. They will send a forged email claiming your funds are "pending" until you pay a fee or refund excess.';
    script = `I do not accept electronic payments, Zelle, or third-party pickups. This transaction is CASH ONLY in person at the local Police Station Safe Exchange Zone. If you cannot bring physical cash, do not reply.`;
    safetyRule = 'DO NOT provide your phone number, email address, or banking credentials. Block this buyer if they insist on electronic verification.';
  } else if (msg.includes('lowest') || msg.includes('offer') || msg.match(/\$\d+/) || msg.includes('half')) {
    threatLevel = 'MODERATE (PRICE NEGOTIATION / LOWBALL)';
    threatAnalysis = 'Buyer is testing your price discipline and emotional urgency.';
    script = `Thanks for reaching out. The item is priced fairly based on recent verified sold comps. The absolute lowest cash price I will accept today is $${bottomPrice}. Let me know if that works for you.`;
    safetyRule = 'Do not accept anything below your bottom-dollar price. Sunk-cost discipline preserves your working capital.';
  } else if (msg.includes('test ride') || msg.includes('ride') || msg.includes('try')) {
    threatLevel = 'HIGH THEFT RISK (DRIVE-OFF RISK)';
    threatAnalysis = 'Unsecured test rides lead to drive-off vehicle theft with e-bikes and scooters.';
    script = `You are welcome to test ride it! Standard policy: the full asking price of $${askingPrice} in cash goes physically into my hands before your feet touch the pedals. If you don't love it, I hand your cash right back on the spot.`;
    safetyRule = 'NEVER surrender the vehicle without counting and holding the full cash amount in your hands. Never hold collateral like car keys or fake IDs.';
  }

  return `
### THREAT ASSESSMENT: ${threatLevel}
**Analysis:** ${threatAnalysis}

### COPY-PASTE SCRIPT:
"${script}"

### NON-NEGOTIABLE SAFETY PROTOCOL:
- ${safetyRule}
`;
}

// Live API WebSocket Server for Gemini real-time voice conversations
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const urlObj = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
  if (urlObj.pathname === '/api/live' || urlObj.pathname === '/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[LIVE API] Client connected for voice session');
  if (!ai) {
    clientWs.send(JSON.stringify({ type: 'error', message: 'Gemini API not configured on server' }));
    clientWs.close();
    return;
  }

  let session: any = null;
  try {
    session = await ai.live.connect({
      model: 'gemini-2.0-flash-exp', // OPTIMIZATION: Updated for Live API compatibility
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'You are the Live Voice Copilot for LEV Shop Command Center. You assist the hands-on technician in real-time while working with tools, inspecting electric scooters, e-bikes, lithium batteries, and electronics. Speak concisely, clearly, and authoritatively on mechanical, electrical, and safety rules.',
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ type: 'audio', audio }));
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }
          const textPart = message.serverContent?.modelTurn?.parts?.[0]?.text;
          if (textPart) {
            clientWs.send(JSON.stringify({ type: 'text', text: textPart }));
          }
        },
      },
    });

    clientWs.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.audio) {
          session.sendRealtimeInput({
            audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (msg.text) {
          session.sendRealtimeInput({
            text: msg.text,
          });
        }
      } catch (err) {
        console.error('[LIVE API] Error sending input to session:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('[LIVE API] Client disconnected');
      if (session) {
        try {
          session.close();
        } catch (_) {}
      }
    });
  } catch (err: any) {
    console.error('[LIVE API] Failed to establish Live session:', err);
    clientWs.send(JSON.stringify({ type: 'error', message: err.message || 'Live session initialization failed' }));
    clientWs.close();
  }
});

// In production, serve built frontend; in dev, Vite handles it
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Mount Vite dev server
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[SHUTTERBUCK SERVER] Running on port ${PORT}`);
});
