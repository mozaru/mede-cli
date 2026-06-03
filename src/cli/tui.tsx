import { Box, render, Text, useApp, useInput } from "ink";
import React, { useEffect, useState } from "react";
import { clearSharedContainer, createContainer, getContainer, setSharedContainer } from "./container.js";
import { formatCliError } from "./error-handler.js";
import { ProjectEntity } from "../domain/entities/project-entity.js";
import { CycleEntity } from "../domain/entities/cycle-entity.js";
import { PhaseEntity } from "../domain/entities/phase-entity.js";
import { ChangeSetEntity } from "../domain/entities/change-set-entity.js";
import { ChangeChunkEntity } from "../domain/entities/change-chunk-entity.js";

// Helper to check if TTY is available
export function isTty(): boolean {
  return process.stdout.isTTY;
}

interface TuiProps {
  onExit: () => void;
}

function Tui({ onExit }: TuiProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const container = getContainer() as any;
  const { exit } = useApp();

  // State
  const [screen, setScreen] = useState<"status" | "diffs" | "refine">("status");
  const [project, setProject] = useState<ProjectEntity | null>(null);
  const [cycle, setCycle] = useState<CycleEntity | null>(null);
  const [phase, setPhase] = useState<PhaseEntity | null>(null);
  const [changeSet, setChangeSet] = useState<ChangeSetEntity | null>(null);
  const [chunks, setChunks] = useState<ChangeChunkEntity[]>([]);
  const [selectedChunkIdx, setSelectedChunkIdx] = useState<number>(0);

  // Status/Messages
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"info" | "success" | "error">("info");

  // Refine input
  const [refinePrompt, setRefinePrompt] = useState("");

  // Load state from DB
  const refreshData = () => {
    try {
      const p = container.projectRepository.getCurrent();
      setProject(p);
      if (p) {
        const c = container.cycleRepository.getCurrent(p.id);
        setCycle(c);
        if (c) {
          const ph = container.phaseRepository.getByIndex(c.id, c.currentPhaseIndex);
          setPhase(ph);
          if (ph) {
            const cs = container.changeSetRepository.getCurrent(ph.id);
            setChangeSet(cs);
            if (cs) {
              const chs = container.changeChunkRepository.list(cs.id);
              setChunks(chs);
              // reset selected chunk if out of range
              if (selectedChunkIdx >= chs.length) {
                setSelectedChunkIdx(Math.max(0, chs.length - 1));
              }
            } else {
              setChangeSet(null);
              setChunks([]);
            }
          } else {
            setPhase(null);
            setChangeSet(null);
            setChunks([]);
          }
        } else {
          setCycle(null);
          setPhase(null);
          setChangeSet(null);
          setChunks([]);
        }
      }
    } catch (err) {
      setMsg(`Erro ao ler dados: ${err instanceof Error ? err.message : String(err)}`, "error");
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const setMsg = (text: string, type: "info" | "success" | "error" = "info") => {
    setMessage(text);
    setMessageType(type);
  };

  const handleStartCycle = async () => {
    setLoading(true);
    setMsg("Iniciando ciclo e primeira fase...", "info");
    try {
      const resp = await container.cycleService.cycle("", []);
      setMsg(resp, "success");
      refreshData();
    } catch (err) {
      setMsg(`Erro ao iniciar ciclo: ${formatCliError(err)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!cycle || !phase) return;
    setLoading(true);
    setMsg("Aprovando fase...", "info");
    try {
      const resp = await container.cycleService.approve(false);
      setMsg(resp, "success");
      refreshData();
    } catch (err) {
      setMsg(`Erro ao aprovar: ${formatCliError(err)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!cycle || !phase) return;
    setLoading(true);
    setMsg("Rejeitando fase...", "info");
    try {
      const resp = await container.cycleService.reject(false);
      setMsg(resp, "success");
      refreshData();
    } catch (err) {
      setMsg(`Erro ao rejeitar: ${formatCliError(err)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!refinePrompt.trim()) return;
    setLoading(true);
    setMsg("Refinando fase...", "info");
    const promptText = refinePrompt;
    setRefinePrompt("");
    setScreen("status");
    try {
      const resp = await container.cycleService.refine(promptText, []);
      setMsg(resp, "success");
      refreshData();
    } catch (err) {
      setMsg(`Erro ao refinar: ${formatCliError(err)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    setLoading(true);
    setMsg("Confirmando ciclo (commit)...", "info");
    try {
      const resp = container.cycleService.commit();
      setMsg(resp, "success");
      refreshData();
    } catch (err) {
      setMsg(`Erro no commit: ${formatCliError(err)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async () => {
    setLoading(true);
    setMsg("Desfazendo ciclo (rollback)...", "info");
    try {
      const resp = container.cycleService.rollback();
      setMsg(resp, "success");
      refreshData();
    } catch (err) {
      setMsg(`Erro no rollback: ${formatCliError(err)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChunk = async (chunk: ChangeChunkEntity, index: number) => {
    if (!changeSet || !phase) return;
    setLoading(true);
    setMsg(`Aplicando trecho #${chunk.index}...`, "info");
    try {
      // Set the chunk index in the DB to make it the active one
      container.uow.requireTransaction();
      try {
        container.changeSetRepository.updateChunkIndex(changeSet.id, index, changeSet.currentOffset);
        container.uow.commit();
      } catch (err) {
        container.uow.rollback();
        throw err;
      }
      container.changesService.apply(false);
      setMsg(`Trecho #${chunk.index} aplicado.`, "success");
      refreshData();
    } catch (err) {
      setMsg(`Erro ao aplicar trecho: ${formatCliError(err)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscardChunk = async (chunk: ChangeChunkEntity, index: number) => {
    if (!changeSet || !phase) return;
    setLoading(true);
    setMsg(`Descartando trecho #${chunk.index}...`, "info");
    try {
      container.uow.requireTransaction();
      try {
        container.changeSetRepository.updateChunkIndex(changeSet.id, index, changeSet.currentOffset);
        container.uow.commit();
      } catch (err) {
        container.uow.rollback();
        throw err;
      }
      container.changesService.discard(false);
      setMsg(`Trecho #${chunk.index} descartado.`, "success");
      refreshData();
    } catch (err) {
      setMsg(`Erro ao descartar trecho: ${formatCliError(err)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Keyboard navigation
  useInput((input, key) => {
    if (loading) return;

    if (key.escape || input === "q") {
      exit();
      onExit();
      return;
    }

    if (screen === "refine") {
      if (key.return) {
        handleRefine();
      } else if (key.backspace) {
        setRefinePrompt((p) => p.slice(0, -1));
      } else if (input && !key.ctrl && !key.meta) {
        setRefinePrompt((p) => p + input);
      }
      return;
    }

    if (screen === "diffs") {
      if (key.upArrow) {
        setSelectedChunkIdx((i) => (i > 0 ? i - 1 : chunks.length - 1));
      } else if (key.downArrow) {
        setSelectedChunkIdx((i) => (i < chunks.length - 1 ? i + 1 : 0));
      } else if (input === "s" || key.return) {
        setScreen("status");
      } else if (input === "a") {
        const chunk = chunks[selectedChunkIdx];
        if (chunk && chunk.status === "AWAITING_APPROVAL") {
          handleApplyChunk(chunk, selectedChunkIdx);
        }
      } else if (input === "d") {
        const chunk = chunks[selectedChunkIdx];
        if (chunk && chunk.status === "AWAITING_APPROVAL") {
          handleDiscardChunk(chunk, selectedChunkIdx);
        }
      }
      return;
    }

    // Default status screen keys
    if (input === "i" && (!cycle || cycle.status === "ROLLEDBACK" || cycle.status === "COMMITTED")) {
      handleStartCycle();
    } else if (input === "a" && phase?.status === "AWAITING_APPROVAL") {
      handleApprove();
    } else if (input === "r" && phase?.status === "AWAITING_APPROVAL") {
      handleReject();
    } else if (input === "f" && phase?.status === "AWAITING_APPROVAL") {
      setScreen("refine");
    } else if (input === "d" && chunks.length > 0) {
      setScreen("diffs");
    } else if (input === "c" && cycle?.status === "AWAITING_COMMIT") {
      handleCommit();
    } else if (input === "b" && cycle && cycle.status !== "ROLLEDBACK" && cycle.status !== "COMMITTED") {
      handleRollback();
    } else if (input === "s") {
      refreshData();
      setMsg("Status atualizado.", "info");
    }
  });

  // Render helpers
  const renderHeader = () => {
    return (
      <Box borderStyle="single" borderColor="cyan" paddingX={1} flexDirection="column">
        <Text bold color="cyan">
          MEDE-CLI — Painel Interativo TUI
        </Text>
        <Box flexDirection="row" justifyContent="space-between">
          <Text dimColor>Projeto: {project?.name || "Nenhum"}</Text>
          <Text dimColor>Idioma: {project?.documentationLanguage || "--"}</Text>
          <Text dimColor>Docs: {project?.docsRootPath || "--"}</Text>
        </Box>
      </Box>
    );
  };

  const renderStatusScreen = () => {
    const isCycleActive = cycle && cycle.status !== "ROLLEDBACK" && cycle.status !== "COMMITTED";

    return (
      <Box flexDirection="column" marginY={1}>
        <Box flexDirection="row" justifyContent="space-between" marginX={1}>
          <Box flexDirection="column" width="45%">
            <Text bold color="white" underline>
              Estado do Ciclo
            </Text>
            <Text>Ciclo Ativo: {isCycleActive ? `Sim (ID: ${cycle.id})` : "Não"}</Text>
            {isCycleActive && (
              <>
                <Text>Status: {cycle.status}</Text>
                <Text>Fase Atual: {phase?.name || "--"}</Text>
                <Text>
                  Passo: {cycle.currentPhaseIndex + 1}/{cycle.phaseCount}
                </Text>
              </>
            )}
          </Box>

          <Box flexDirection="column" width="45%">
            <Text bold color="white" underline>
              Estado da Fase
            </Text>
            {isCycleActive && phase ? (
              <>
                <Text>Status da Fase: {phase.status}</Text>
                <Text>Resultado: {phase.proposalState === "EMPTY" ? "Vazio" : phase.proposalState === "NON_EMPTY" ? "Alterações pendentes" : "Não gerado"}</Text>
                <Text>Arquivo Alvo: {changeSet?.fileName || "-"}</Text>
                <Text>Trechos Diffs: {chunks.length} total ({chunks.filter(c => c.status === "AWAITING_APPROVAL").length} pendentes)</Text>
              </>
            ) : (
              <Text dimColor>Nenhuma fase activa no momento</Text>
            )}
          </Box>
        </Box>

        <Box borderStyle="round" borderColor="gray" marginY={1} paddingX={1} flexDirection="column">
          <Text bold>Ações Disponíveis:</Text>
          {!isCycleActive && <Text color="green">[i] Iniciar Novo Ciclo</Text>}
          {phase?.status === "AWAITING_APPROVAL" && (
            <>
              <Text color="green">[a] Aprovar Fase e Aplicar Alterações</Text>
              <Text color="red">[r] Rejeitar Fase</Text>
              <Text color="yellow">[f] Refinar Fase (enviar feedback ao LLM)</Text>
            </>
          )}
          {phase?.status === "REFINING" && chunks.length > 0 && (
            <Text color="cyan">[d] Navegar e Aplicar/Descartar Trechos Diffs ({chunks.filter(c => c.status === "AWAITING_APPROVAL").length} pendentes)</Text>
          )}
          {cycle?.status === "AWAITING_COMMIT" && <Text color="green">[c] Confirmar Alterações (Commit)</Text>}
          {isCycleActive && <Text color="red">[b] Cancelar Ciclo (Rollback)</Text>}
          <Text dimColor>[s] Atualizar Status  |  [q / Esc] Sair da TUI</Text>
        </Box>
      </Box>
    );
  };

  const renderRefineScreen = () => {
    return (
      <Box flexDirection="column" marginY={1} paddingX={2}>
        <Text bold color="yellow">
          Refinamento da Fase: {phase?.name}
        </Text>
        <Text dimColor>Digite o seu feedback/instruções para que o LLM regenere a documentação:</Text>
        <Box borderStyle="single" borderColor="yellow" marginY={1} paddingX={1}>
          <Text>{refinePrompt}</Text>
          <Text>_</Text>
        </Box>
        <Text dimColor>Pressione [Enter] para enviar ou [Esc] para cancelar.</Text>
      </Box>
    );
  };

  const renderDiffScreen = () => {
    if (chunks.length === 0) {
      return (
        <Box padding={2}>
          <Text>Sem trechos diffs para visualizar.</Text>
        </Box>
      );
    }

    const chunk = chunks[selectedChunkIdx];
    const diffContent = chunk?.changeContent || "";

    return (
      <Box flexDirection="column" marginY={1} height={14}>
        <Text bold color="cyan">
          Navegação de Diff — Arquivo: {changeSet?.fileName} (Trecho {selectedChunkIdx + 1} de {chunks.length})
        </Text>
        <Box flexDirection="row" flexGrow={1} borderStyle="single" borderColor="cyan" minHeight={8}>
          {/* Left panel: List of chunks */}
          <Box flexDirection="column" width="30%" borderStyle="single" borderColor="gray">
            {chunks.map((ch, idx) => {
              const isSelected = idx === selectedChunkIdx;
              const isApplied = ch.status === "APPLIED";
              const isDiscarded = ch.status === "DISCARDED";
              let statusLabel = "[Pendente]";
              let statusColor = "yellow";
              if (isApplied) {
                statusLabel = "[Aplicado]";
                statusColor = "green";
              } else if (isDiscarded) {
                statusLabel = "[Descartado]";
                statusColor = "red";
              }

              return (
                <Text key={ch.id} bold={isSelected} color={isSelected ? "cyan" : "white"}>
                  {isSelected ? "> " : "  "}
                  Trecho #{ch.index} <Text color={statusColor}>{statusLabel}</Text>
                </Text>
              );
            })}
          </Box>

          {/* Right panel: Diff preview */}
          <Box flexDirection="column" width="70%" paddingX={1}>
            <Text bold underline>Localização: {chunk?.blockLocation}</Text>
            <Box flexDirection="column" marginY={1}>
              {diffContent.split("\n").slice(0, 8).map((line: string, i: number) => {
                let color = "white";
                if (line.startsWith("+")) color = "green";
                else if (line.startsWith("-")) color = "red";
                else if (line.startsWith("@")) color = "cyan";
                return (
                  <Text key={i} color={color}>
                    {line}
                  </Text>
                );
              })}
              {diffContent.split("\n").length > 8 && (
                <Text dimColor>... ({diffContent.split("\n").length - 8} linhas omitidas)</Text>
              )}
            </Box>
          </Box>
        </Box>

        <Box flexDirection="row" justifyContent="space-between">
          <Text dimColor>↑↓: Navegar  |  [Esc / s]: Voltar  |  [q]: Sair</Text>
          {chunk?.status === "AWAITING_APPROVAL" ? (
            <Box>
              <Text color="green">[a] Aplicar Trecho</Text>
              <Text>   </Text>
              <Text color="red">[d] Descartar Trecho</Text>
            </Box>
          ) : (
            <Text dimColor>Este trecho já foi resolvido ({chunk?.status})</Text>
          )}
        </Box>
      </Box>
    );
  };

  const renderFooter = () => {
    let msgColor = "cyan";
    if (messageType === "success") msgColor = "green";
    if (messageType === "error") msgColor = "red";

    return (
      <Box borderStyle="single" borderColor="gray" paddingX={1} flexDirection="column">
        {loading ? (
          <Text bold color="yellow">
            ⏳ Carregando... Por favor, aguarde.
          </Text>
        ) : (
          <Text color={msgColor}>
            {message || "Pronto. Use as teclas indicadas para operar."}
          </Text>
        )}
      </Box>
    );
  };

  return (
    <Box flexDirection="column" width={80}>
      {renderHeader()}
      {screen === "status" && renderStatusScreen()}
      {screen === "refine" && renderRefineScreen()}
      {screen === "diffs" && renderDiffScreen()}
      {renderFooter()}
    </Box>
  );
}

export async function startTui(): Promise<void> {
  const container = createContainer();
  setSharedContainer(container);
  try {
    await new Promise<void>((resolve) => {
      const app = render(<Tui onExit={() => resolve()} />);
      app.waitUntilExit().then(() => {
        resolve();
      });
    });
  } finally {
    clearSharedContainer();
    container.dispose();
  }
}
