import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AgentContext, AgentDecision } from '@devis/shared';
import { AIProvider } from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenaiProvider implements AIProvider {
  private readonly logger = new Logger(OpenaiProvider.name);
  private client: OpenAI | null = null;

  constructor(private config: ConfigService) {
    const apiKey = config.get<string>('ai.openaiApiKey');
    if (apiKey && apiKey.trim()) {
      // Only instantiate if key is provided — avoids throwing at startup
      this.client = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OpenAI API key not configured — OpenAI provider disabled');
    }
  }

  async decideNextAction(context: AgentContext): Promise<AgentDecision> {
    if (!this.client) {
      return { type: 'FINAL', message: 'OpenAI provider is not configured. Set OPENAI_API_KEY in .env' };
    }

    const prompt = this.buildPrompt(context);

    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      const text = response.choices[0]?.message?.content || '';
      return this.parseResponse(text);
    } catch (error) {
      this.logger.error('OpenAI API error', error);
      throw error;
    }
  }

  private buildPrompt(context: AgentContext): string {
    return `
You are DeVis.ai, a personal AI agent. Decide the next action.

User Request: "${context.userRequest}"
Current Step: ${context.currentStep}
Available Tools: ${context.availableTools.join(', ')}
Previous Results: ${JSON.stringify(context.previousResults)}

Respond ONLY with valid JSON:
Tool call: {"type":"TOOL_CALL","tool":"tool_name","arguments":{"key":"value"}}
Final: {"type":"FINAL","message":"result"}
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
