import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AgentContext, AgentDecision } from '@devis/shared';
import { AIProvider } from './interfaces/ai-provider.interface';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenaiProvider } from './providers/openai.provider';

@Injectable()
export class AiService implements AIProvider {
  private readonly provider: AIProvider;

  constructor(
    private config: ConfigService,
    private gemini: GeminiProvider,
    private openai: OpenaiProvider,
  ) {
    const providerName = config.get('ai.provider') || 'gemini';
    this.provider = providerName === 'openai' ? this.openai : this.gemini;
  }

  decideNextAction(context: AgentContext): Promise<AgentDecision> {
    return this.provider.decideNextAction(context);
  }
}
