import { ragService } from './src/services/RAGService';

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function testRAG() {
    console.log("==========================================");
    console.log("🚀 RAG PIPELINE DIAGNOSTIC VERIFICATION 🚀");
    console.log("==========================================\n");

    console.log("------------------------------------------");
    console.log("[1/5] Backend Startup & File Loading");
    console.log("------------------------------------------");
    let attempts = 0;
    while (!ragService.isReady && attempts < 20) {
        console.log("Waiting for initialization (downloading HuggingFace weights if first run)...");
        await sleep(2000);
        attempts++;
    }

    // Access private members using any
    const service: any = ragService;
    
    if (service.knowledgeBase.length > 0) {
        console.log(`✅ SUCCESS: rag_knowledge_base.json loaded successfully (${service.knowledgeBase.length} entries).`);
    } else {
        console.log(`❌ ERROR: rag_knowledge_base.json is empty or failed to load. (Are you sure it's placed in src/data/?)`);
    }

    if (service.faissIndex !== null) {
        console.log(`✅ SUCCESS: counsel_chat_faiss.index loaded successfully into FAISS memory.`);
    } else {
        console.log(`❌ ERROR: counsel_chat_faiss.index is NULL. (File missing from src/data/ or corrupt.)`);
    }

    console.log("\n------------------------------------------");
    console.log("[2/5] Query Embedding Generation Test");
    console.log("------------------------------------------");
    const testQuery = "I feel overwhelmed and anxious";
    let embedding: number[] = [];
    try {
        embedding = await service.generateEmbedding(testQuery);
        console.log(`✅ SUCCESS: @xenova/transformers successfully generated a ${embedding.length}-dimensional embedding for the query.`);
    } catch (e: any) {
        console.log(`❌ ERROR: Embedding failed -> ${e.message}`);
    }

    console.log("\n------------------------------------------");
    console.log("[3/5] FAISS Retrieval Test");
    console.log("------------------------------------------");
    try {
        if (!service.faissIndex) {
            console.log(`⚠️ SKIPPED: FAISS search skipped because counsel_chat_faiss.index is missing.`);
        } else {
            const results = await ragService.findRelevant(testQuery, 3);
            console.log(`✅ SUCCESS: FAISS semantic search completed. Returned ${results.length} most relevant indices.`);
        }
    } catch (e: any) {
        console.log(`❌ ERROR: FAISS retrieval failed -> ${e.message}`);
    }

    console.log("\n------------------------------------------");
    console.log("[4/5] Context Formatting & Prompt Construction");
    console.log("------------------------------------------");
    try {
        const context = await ragService.buildContext(testQuery);
        if (context.length > 0) {
            console.log(`✅ SUCCESS: System safely built formatted context string!\n\nContext Preview:\n${context.substring(0, 300)}...\n`);
        } else {
            console.log(`⚠️ WARNING: Context is empty. (Expected if FAISS is missing and returning []).`);
        }
    } catch (e: any) {
        console.log(`❌ ERROR: Context construction failed -> ${e.message}`);
    }

    console.log("\n------------------------------------------");
    console.log("✅ DIAGNOSTIC COMPLETE");
    console.log("==========================================");
}

testRAG().catch(e => console.error("Test script crashed: ", e));
