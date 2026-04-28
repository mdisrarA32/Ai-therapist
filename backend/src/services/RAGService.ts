import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';
import { pipeline } from '@xenova/transformers';
import { Index } from 'faiss-node';

export interface RAGEntry {
    id?: string | number;
    topic: string;
    question: string;
    answer: string;
}

class RAGService {
    private knowledgeBase: RAGEntry[] = [];
    private faissIndex: any = null;
    private extractorPipeline: any = null;
    public isReady: boolean = false;

    constructor() {
        this.initializeRAG();
    }

    private async initializeRAG() {
        try {
            logger.info("Initializing RAG Pipeline...");

            // 1. Load the JSON Knowledge Base
            const jsonPath = path.join(__dirname, '../data/rag_knowledge_base.json');
            if (fs.existsSync(jsonPath)) {
                this.knowledgeBase = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
                logger.info(`Loaded ${this.knowledgeBase.length} entries from JSON Knowledge Base.`);
            } else {
                logger.warn("rag_knowledge_base.json not found. Please drop your Colab file in src/data/");
            }

            // 2. Load FAISS Index
            const indexPath = path.join(__dirname, '../data/counsel_chat_faiss.index');
            if (fs.existsSync(indexPath)) {
                const stats = fs.statSync(indexPath);
                if (stats.size === 0) {
                    logger.warn("FAISS index file is exactly 0 bytes! Skipping C++ load to prevent faiss crash. Please replace with actual Colab export.");
                } else {
                    this.faissIndex = Index.read(indexPath);
                    logger.info("FAISS Index loaded dynamically!");
                }
            } else {
                logger.warn("FAISS index not found. Please drop counsel_chat_faiss.index in src/data/");
            }

            // Note: embeddings.npy is generally NOT needed locally as FAISS natively holds the vectors inside the .index!

            // 3. Load ONNX Sentence Transformer model offline inside Node.js
            // This pulls the same MiniLM V2 model you used in Python!
            this.extractorPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            logger.info("HuggingFace Transformer model loaded (all-MiniLM-L6-v2).");

            this.isReady = true;
        } catch (error) {
            logger.error("Failed to initialize RAG pipeline: ", error);
        }
    }

    /**
     * Converts a string into a 384-dimensional embedding vector matching your Python output.
     */
    private async generateEmbedding(text: string): Promise<number[]> {
        if (!this.extractorPipeline) throw new Error("Transformer not loaded yet.");
        
        // Use mean pooling and L2 normalization to match SentenceTransformers behavior
        const output = await this.extractorPipeline(text, { pooling: 'mean', normalize: true });
        
        // Output.data is a Float32Array containing the 384 dimensions
        return Array.from(output.data);
    }

    /**
     * Performs a vector similarity search using FAISS.
     */
    public async findRelevant(userMessage: string, topN: number = 3): Promise<RAGEntry[]> {
        if (!this.isReady || !this.faissIndex || this.knowledgeBase.length === 0) {
            logger.warn("RAG Pipeline is not fully loaded. Returning empty context.");
            return [];
        }

        try {
            // 1. Embed the query
            const queryEmbedding = await this.generateEmbedding(userMessage);

            // 2. Search FAISS index (requires array format)
            const results = this.faissIndex.search(queryEmbedding, topN);

            // faiss-node search returns { distances: number[], labels: number[] }
            // 'labels' correspond to the array index from your original sequence in Python.
            const relevantEntries: RAGEntry[] = [];
            for (const label of results.labels) {
                if (label >= 0 && label < this.knowledgeBase.length) {
                    relevantEntries.push(this.knowledgeBase[label]);
                }
            }

            return relevantEntries;

        } catch (error) {
            logger.error("Error searching FAISS index:", error);
            return [];
        }
    }

    /**
     * Builds the Gemini Context string based on actual semantic RAG search.
     */
    public async buildContext(userMessage: string): Promise<string> {
        const relevantEntries = await this.findRelevant(userMessage, 3);
        if (relevantEntries.length === 0) return "";

        return relevantEntries.map((entry, index) => 
            `Example ${index + 1} [Topic: ${entry.topic || 'General'}]:\nPatient: "${entry.question}"\nTherapist Response: "${entry.answer}"`
        ).join("\n\n");
    }

    /**
     * Extracts the topic from the most confident FAISS match.
     */
    public async detectTopic(userMessage: string): Promise<string> {
        const relevantEntries = await this.findRelevant(userMessage, 1);
        if (relevantEntries.length > 0) {
            return relevantEntries[0].topic || "General";
        }
        return "General";
    }
}

export const ragService = new RAGService();
