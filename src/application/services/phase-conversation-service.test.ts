import { describe, it, expect } from "vitest";
import { PhaseConversationService } from "./phase-conversation-service.js";
import { MedeConfigModelEntity } from "../../domain/entities/mede-config-model-entity.js";
import * as LlmPrompts from "../../infrastructure/llm/llm-prompts-provider.js";

describe("PhaseConversationService - prompt priority resolution unit tests", () => {
  const service = new PhaseConversationService(
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    null,
    null
  );

  describe("getSystemPrompt", () => {
    it("returns prompt defined in config.systemPrompts when present", () => {
      const config = {
        systemPrompts: {
          meeting: "Custom meeting system prompt",
          architecturalDecisions: "Custom ADR system prompt",
        },
      } as unknown as MedeConfigModelEntity;

      expect(service.getSystemPrompt(config, "meeting")).toBe("Custom meeting system prompt");
      expect(service.getSystemPrompt(config, "architecturalDecisions")).toBe("Custom ADR system prompt");
    });

    it("falls back to LlmPrompts system default when systemPrompts is missing, undefined, or empty", () => {
      const config = {
        systemPrompts: {
          meeting: "",
          architecturalDecisions: "   ",
        },
      } as unknown as MedeConfigModelEntity;

      expect(service.getSystemPrompt(config, "meeting")).toBe(LlmPrompts.SYSTEM_PROMPT_MEETING);
      expect(service.getSystemPrompt(config, "architecturalDecisions")).toBe(LlmPrompts.SYSTEM_PROMPT_ADR);

      const emptyConfig = {} as MedeConfigModelEntity;
      expect(service.getSystemPrompt(emptyConfig, "meeting")).toBe(LlmPrompts.SYSTEM_PROMPT_MEETING);
    });

    it("returns empty string for an unknown system prompt name", () => {
      const config = {} as MedeConfigModelEntity;
      expect(service.getSystemPrompt(config, "nonExistentPrompt")).toBe("");
    });
  });

  describe("getPrompt", () => {
    it("returns prompt defined in config.prompts when present", () => {
      const config = {
        prompts: {
          meeting: "Custom meeting user prompt",
          architecturalDecisions: "Custom ADR user prompt",
        },
      } as unknown as MedeConfigModelEntity;

      expect(service.getPrompt(config, "meeting")).toBe("Custom meeting user prompt");
      expect(service.getPrompt(config, "architecturalDecisions")).toBe("Custom ADR user prompt");
    });

    it("falls back to LlmPrompts user default when prompts is missing, undefined, or empty", () => {
      const config = {
        prompts: {
          meeting: "",
          architecturalDecisions: "   ",
        },
      } as unknown as MedeConfigModelEntity;

      expect(service.getPrompt(config, "meeting")).toBe(LlmPrompts.USER_PROMPT_MEETING);
      expect(service.getPrompt(config, "architecturalDecisions")).toBe(LlmPrompts.USER_PROMPT_ADR);

      const emptyConfig = {} as MedeConfigModelEntity;
      expect(service.getPrompt(emptyConfig, "meeting")).toBe(LlmPrompts.USER_PROMPT_MEETING);
    });

    it("returns empty string for an unknown prompt name", () => {
      const config = {} as MedeConfigModelEntity;
      expect(service.getPrompt(config, "nonExistentPrompt")).toBe("");
    });
  });
});
