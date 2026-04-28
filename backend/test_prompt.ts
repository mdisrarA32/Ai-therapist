import { ragService } from './src/services/RAGService';

async function generatePrompt() {
    // Wait for Hugging Face loader just in case
    while (!ragService.isReady) {
        await new Promise(r => setTimeout(r, 1000));
    }

    const userMessage = "How can I get out of my head";
    const ragContext = await ragService.buildContext(userMessage);

    let systemInstructions = `You are an expert AI therapist trained in Cognitive Behavioral Therapy (CBT).
            Analyze the user's input, emotional state, and risk level in the context of the previous conversation...`;

    const prompt = `${systemInstructions}\n\nREFERENCE EXAMPLES FROM LICENSED THERAPISTS:\n${ragContext}\n\nUser Message: "${userMessage}"`;

    console.log("--- Full Prompt sent to Gemini ---");
    console.log(prompt);
    console.log("------------------------------------");
}

generatePrompt().catch(console.error);
