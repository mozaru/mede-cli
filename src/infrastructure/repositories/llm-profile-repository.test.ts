import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { BetterSqliteConnectionFactory } from "../db/better-sqlite-connection-factory.js";
import { UnitOfWork } from "../db/unit-of-work.js";
import { LlmProfileRepository } from "./llm-profile-repository.js";
import { LlmProfileEntity } from "../../domain/entities/llm-profile-entity.js";

let uow: UnitOfWork;
let repository: LlmProfileRepository;

function makeProfile(projectId: number, name: string): LlmProfileEntity {
  const profile = new LlmProfileEntity();
  profile.projectId = projectId;
  profile.profileName = name;
  profile.provider = "openai-compatible";
  profile.model = "gpt-4.1";
  profile.endpoint = "https://api.openai.com/v1";
  profile.apiKeyEnv = "OPENAI_API_KEY";
  profile.temperature = 0.2;
  profile.maxTokens = 1234;
  profile.timeoutMs = 9999;
  profile.retryJson = '{"attempts":2}';
  profile.active = 1 as unknown as boolean;
  return profile;
}

beforeEach(() => {
  uow = new UnitOfWork(new BetterSqliteConnectionFactory({ inMemory: true }));
  uow.ensureConnection();
  uow.connection
    .prepare(
      "insert into project (id,name,rootProjectPath,docsRootPath,documentationLanguage,createdAt,updatedAt) values (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(1, "one", "/one", "/one/docs", "pt-BR", "", "");
  uow.connection
    .prepare(
      "insert into project (id,name,rootProjectPath,docsRootPath,documentationLanguage,createdAt,updatedAt) values (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(2, "two", "/two", "/two/docs", "pt-BR", "", "");
  repository = new LlmProfileRepository(uow);
});

afterEach(() => {
  uow[Symbol.dispose]();
});

describe("LlmProfileRepository", () => {
  it("inserts, lists, and fetches profiles", () => {
    const inserted = repository.insert(makeProfile(1, "default"));

    expect(inserted.id).toBeGreaterThan(0);
    expect(repository.list(1)).toHaveLength(1);
    expect(repository.list(2)).toHaveLength(0);
    expect(repository.getById(inserted.id)).toMatchObject({
      profileName: "default",
      model: "gpt-4.1",
      maxTokens: 1234,
    });
  });

  it("deletes one profile or all profiles from a project", () => {
    const first = repository.insert(makeProfile(1, "one"));
    repository.insert(makeProfile(1, "two"));
    repository.insert(makeProfile(2, "other"));

    expect(repository.delete(first.id)).toBe(true);
    expect(repository.delete(first.id)).toBe(false);
    expect(repository.list(1).map((p) => p.profileName)).toEqual(["two"]);

    expect(repository.deleteFromProject(1)).toBe(true);
    expect(repository.deleteFromProject(1)).toBe(false);
    expect(repository.list(1)).toEqual([]);
    expect(repository.list(2)).toHaveLength(1);
  });

  it("returns null for unknown ids", () => {
    expect(repository.getById(999)).toBeNull();
  });
});
