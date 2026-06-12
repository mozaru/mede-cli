
Regras obrigatórias de formato do unified git diff:
- cada hunk deve ter um cabeçalho completo no formato exato: @@ -<linha_antiga>,<contagem> +<linha_nova>,<contagem> @@
- para arquivo novo (criação do zero), usar: @@ -0,0 +1,<total_linhas> @@
- nunca gerar cabeçalho de hunk incompleto como apenas "@@" sem os ranges;
- nunca omitir os @@ finais do cabeçalho;
- linhas adicionadas começam com "+", linhas removidas com "-", contexto com " " (espaço);
- o diff gerado deve ser compatível com parsers padrão de unified git diff.
- para atualização de arquivo existente, nunca anexar uma segunda cópia completa do documento ao final;
- se for necessário reescrever o documento inteiro, o diff deve remover/substituir o conteúdo antigo no mesmo hunk, não duplicá-lo.

Exemplo correto para criação de arquivo novo:
--- /dev/null
+++ b/docs/atas-de-reuniao/ata-20260611-001.md
@@ -0,0 +1,5 @@
+# Ata de Reunião – 2026-06-11
+
+**Projeto:** MeuProjeto
+**Tipo:** Consolidação
+**Participantes:** Equipe
