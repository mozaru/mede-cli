import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// Replace the real LLM provider with a fake whose generateText is controlled per
// test. This exercises the real service pipeline (prompt assembly, retry, diff
// validation, change-set + chunk persistence) without any network call.
const { generateText } = vi.hoisted(() => ({ generateText: vi.fn() }))

vi.mock('../shared/llm/llm-provider-factory.js', () => ({
  LlmProviderFactory: {
    create: () => ({
      setSystemPrompt: vi.fn(),
      setExtraInfo: vi.fn(),
      setUserPrompt: vi.fn(),
      setOptions: vi.fn(),
      addMessage: vi.fn(),
      addAttachment: vi.fn(),
      addInputDoc: vi.fn(),
      addOutputDoc: vi.fn(),
      generateText,
    }),
  },
}))

import { BetterSqliteConnectionFactory } from '../db/better-sqlite-connection-factory.js'
import { UnitOfWork } from '../db/unit-of-work.js'
import { ProjectRepository } from '../repositories/project-repository.js'
import { CycleRepository } from '../repositories/cycle-repository.js'
import { PhaseRepository } from '../repositories/phase-repository.js'
import { CycleArtifactRepository } from '../repositories/cycle-artifact-repository.js'
import { ChangeSetRepository } from '../repositories/change-set-repository.js'
import { ChangeChunkRepository } from '../repositories/change-chunk-repository.js'
import { PhaseConversationRepository } from '../repositories/phase-conversation-repository.js'
import { PhaseAttachmentRepository } from '../repositories/phase-attachment-repository.js'
import { BacklogRepository } from '../repositories/backlog-repository.js'
import { PhaseConversationService } from './phase-conversation-service.js'
import { ProjectEntity } from '../entities/project-entity.js'
import { CycleEntity } from '../entities/cycle-entity.js'
import { PhaseEntity } from '../entities/phase-entity.js'
import { CycleArtifactEntity } from '../entities/cycle-artifact-entity.js'
import { MedeConfigModelEntity } from '../entities/mede-config-model-entity.js'

let uow: UnitOfWork
let root: string
let docsRoot: string
let service: PhaseConversationService
let project: ProjectEntity
let phase: PhaseEntity
let config: MedeConfigModelEntity
let changeChunks: ChangeChunkRepository
let conversations: PhaseConversationRepository

function setup(): void {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'mede-phaseconv-'))
  docsRoot = path.join(root, 'docs')
  fs.mkdirSync(docsRoot, { recursive: true })
  // The placeholder builder reads the current-state document; provide a minimal one.
  fs.writeFileSync(path.join(docsRoot, 'situacao-atual.md'), '# Situação Atual\n')

  uow = new UnitOfWork(new BetterSqliteConnectionFactory({ projectRootPath: root }))
  uow.ensureConnection()

  const projects = new ProjectRepository(uow)
  const cycles = new CycleRepository(uow)
  const phases = new PhaseRepository(uow)
  const artifacts = new CycleArtifactRepository(uow)
  changeChunks = new ChangeChunkRepository(uow)
  conversations = new PhaseConversationRepository(uow)

  const now = new Date().toISOString()

  const projectEntity = new ProjectEntity()
  projectEntity.name = 'demo'
  projectEntity.rootProjectPath = root
  projectEntity.docsRootPath = docsRoot
  projectEntity.documentationLanguage = 'pt-BR'
  projectEntity.createdAt = now
  projectEntity.updatedAt = now
  project = projects.insert(projectEntity)

  const cycle = new CycleEntity()
  cycle.projectId = project.id
  cycle.status = 'OPEN'
  cycle.currentPhaseIndex = 1
  cycle.phaseCount = 11
  cycle.autoMode = 'NONE'
  cycle.startedAt = now
  cycle.finishedAt = ''
  const cycleId = cycles.insert(cycle).id

  const outputFile = path.join(docsRoot, 'atas', 'min-001.md')

  const phaseEntity = new PhaseEntity()
  phaseEntity.cycleId = cycleId
  phaseEntity.name = 'GENERATE_MEETING'
  phaseEntity.index = 1
  phaseEntity.inputFiles = []
  phaseEntity.outputFile = outputFile
  phaseEntity.docTypeOutput = 'HISTORICAL'
  phaseEntity.promptName = 'meeting'
  phaseEntity.status = 'REFINING'
  phaseEntity.proposalState = 'NOT_GENERATED'
  phaseEntity.startedAt = now
  phaseEntity.finishedAt = ''
  phase = phases.insert(phaseEntity)

  // Pre-create the output artifact so the service finds it instead of touching disk.
  const artifact = new CycleArtifactEntity()
  artifact.cycleId = cycleId
  artifact.backupContent = ''
  artifact.currentContent = ''
  artifact.canonicalName = ''
  artifact.canonicalType = 'HISTORICAL'
  artifact.artifactPath = outputFile
  artifact.startedAt = now
  artifact.updatedAt = now
  artifacts.insert(artifact)

  config = new MedeConfigModelEntity()
  config.docsRoot = docsRoot

  service = new PhaseConversationService(
    conversations,
    new PhaseAttachmentRepository(uow),
    artifacts,
    new ChangeSetRepository(uow),
    changeChunks,
    phases,
    new BacklogRepository(uow),
  )
}

beforeEach(() => {
  generateText.mockReset()
  setup()
})

afterEach(() => {
  uow[Symbol.dispose]()
  fs.rmSync(root, { recursive: true, force: true })
})

describe('PhaseConversationService.sendMessage with a fake LLM', () => {
  it('turns the LLM diff into a persisted change-set with chunks', async () => {
    generateText.mockResolvedValue({
      rawText: '@@ -0,0 +1,3 @@\n+# Ata da Reunião\n+Decisão registrada\n+Fim',
    })

    const changeSet = await service.sendMessage(project, config, phase, '', [])

    expect(changeSet).not.toBeNull()
    expect(changeSet!.changeChunkCount).toBe(1)

    const chunks = changeChunks.list(changeSet!.id)
    expect(chunks).toHaveLength(1)
    expect(chunks[0].status).toBe('AWAITING_APPROVAL')
  })

  it('records both the user and assistant turns of the conversation', async () => {
    generateText.mockResolvedValue({ rawText: '@@ -0,0 +1,1 @@\n+conteúdo' })

    await service.sendMessage(project, config, phase, 'gere a ata', [])

    const turns = conversations.list(phase.id)
    expect(turns).toHaveLength(2)
    expect(turns.map((t) => t.actor)).toEqual(['user', 'assistant'])
  })

  it('retries a transient LLM failure and still succeeds', async () => {
    generateText
      .mockRejectedValueOnce(new Error('503 service unavailable'))
      .mockResolvedValue({ rawText: '@@ -0,0 +1,1 @@\n+ok' })

    const changeSet = await service.sendMessage(project, config, phase, '', [])

    expect(changeSet).not.toBeNull()
    expect(generateText).toHaveBeenCalledTimes(2)
  })

  it('rejects a malformed diff returned by the LLM', async () => {
    generateText.mockResolvedValue({ rawText: '@@ not a real header @@\n+x' })

    await expect(service.sendMessage(project, config, phase, '', [])).rejects.toThrow(
      /diff malformado/,
    )
  })
})
