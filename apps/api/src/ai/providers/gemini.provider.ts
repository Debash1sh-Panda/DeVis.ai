import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AgentContext, AgentDecision } from '@devis/shared';
import { AIProvider } from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements AIProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private client: GoogleGenerativeAI | null = null;
  private readonly modelName = 'gemini-1.5-pro';

  constructor(private config: ConfigService) {
    const apiKey = config.get<string>('ai.geminiApiKey');
    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey);
    }
  }

  async decideNextAction(context: AgentContext): Promise<AgentDecision> {
    if (!this.client) {
      this.logger.warn('Gemini API key not configured');
      return { type: 'FINAL', message: 'AI provider not configured.' };
    }

    const model = this.client.getGenerativeModel({ model: this.modelName });
    const prompt = this.buildPrompt(context);

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return this.parseResponse(text);
    } catch (error) {
      this.logger.error('Gemini API error', error);
      throw error;
    }
  }

  private buildPrompt(context: AgentContext): string {
    return `
You are DeVis.ai, a personal AI agent. Your job is to decide the next action.

User Request: "${context.userRequest}"
Current Step: ${context.currentStep}
Available Tools: ${context.availableTools.join(', ')}
Previous Results: ${JSON.stringify(context.previousResults)}

Respond ONLY with valid JSON in one of these formats:

Tool call: {"type":"TOOL_CALL","tool":"tool_name","arguments":{"key":"value"}}
Final response: {"type":"FINAL","message":"Human-friendly result message"}
    `.trim();
  }

  private parseResponse(text: string): AgentDecision {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { type: 'FINAL', message: text };
    try {
      return JSON.parse(jsonMatch[0]) as AgentDecision;
    } catch {
      return { type: 'FINAL', message: text };
    }
  }
}
