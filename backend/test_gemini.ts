import * as dotenv from 'dotenv';
dotenv.config();

import { TherapyService } from './src/services/TherapyService';

async function testGemini() {
    console.log("------------------------------------------");
    console.log("[5/5] Gemini API Integration Test (with auth)");
    console.log("------------------------------------------");
    
    try {
        console.log("Sending message to Gemini...");
        const response = await TherapyService.processTherapyMessage(
            "I feel overwhelmed and anxious", 
            [], 
            "MEDIUM", 
            "NORMAL"
        );
        
        console.log("✅ SUCCESS: Received response from Gemini!");
        console.log("Raw Payload Output:", JSON.stringify(response, null, 2));
    } catch (e: any) {
        console.log(`❌ ERROR: Gemini API call failed -> ${e.message}`);
    }
}

testGemini().catch(console.error);
