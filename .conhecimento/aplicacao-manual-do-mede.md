# Ciclo de Atualização do MEDE

## Descrição Operacional do Processo Manual de Consolidação Documental

## 1. Finalidade do ciclo

O ciclo de atualização do MEDE é o processo periódico por meio do qual o estado documental de um projeto é reconsolidado a partir dos eventos, interações, decisões e entregas ocorridos em um determinado intervalo de tempo.

Historicamente, esse intervalo foi tratado como semanal. Entretanto, com o uso intensivo de agentes de LLM, ferramentas de geração de código e ambientes de programação assistida, como Codex e Claude Code, tornou-se possível executar em poucas horas ou em um único dia um volume de análise, implementação, revisão e consolidação que antes ocuparia vários dias ou semanas. Por isso, a unidade metodológica central da MEDE deixa de ser a semana e passa a ser o **ciclo documental**.

O ciclo documental é uma unidade causal de consolidação. Ele é identificado por data e por um número sequencial de ciclo, permitindo que múltiplas atas, ADRs, ESMs e registros de entrega sejam produzidos no mesmo dia sem perda de rastreabilidade.

Seu objetivo não é apenas “manter a documentação atualizada”. Essa formulação é insuficiente e, metodologicamente, pobre. O objetivo real do ciclo é **transformar evidências dispersas da evolução do projeto em uma cadeia documental causal, revisada e consistente**, de forma que:

* o entendimento da solução seja preservado;
* as decisões relevantes permaneçam rastreáveis;
* a documentação viva reflita o estado atual consolidado do sistema;
* a trajetória evolutiva do projeto permaneça reconstruível;
* o conhecimento do projeto não dependa apenas da memória do fornecedor, do cliente ou dos membros atuais da equipe.

O ciclo, portanto, é um mecanismo de **consolidação epistemológica** de uma unidade causal de trabalho. Ele pega um conjunto difuso de sinais brutos — conversas, reuniões, mensagens, anotações, decisões parciais, correções, mudanças de entendimento, entregas realizadas, alterações geradas por agentes de LLM e validações humanas — e os transforma em um estado documental mais coerente, mais auditável e mais útil para continuidade técnica.

No processo manual atualmente praticado, esse ciclo é conduzido com apoio de LLMs, mas sempre sob supervisão humana intensa. A LLM não é responsável por decidir o projeto, nem por “escrever a verdade” do sistema. Ela atua como mecanismo assistivo de consolidação, proposta de redação, análise de impacto e geração de diffs, sendo continuamente validada, corrigida e refinada pelo responsável pelo projeto.

---

## 2. Visão geral do ciclo

Em sua forma prática atual, o ciclo segue a seguinte lógica macro:

1. durante o ciclo, são coletados e acumulados insumos brutos do projeto;
2. ao final do ciclo, esses insumos são consolidados em uma **ata de ciclo**, que se torna a entrada causal formal da evolução;
3. a partir da ata consolidada, são gerados os artefatos derivados de natureza estrutural e evolutiva, especialmente **ADR** e **ESM**;
4. com base no conjunto formado por **ata + ADR + ESM**, avalia-se quais documentos vivos precisam ser alterados;
5. cada documento vivo necessário é revisado por meio de propostas de alteração, normalmente em formato de **diff**, até atingir um estado satisfatório;
6. após a atualização dos documentos vivos, gera-se o **log de entregas** do ciclo;
7. ao final, gera-se o documento de **situação atual**, que funciona como síntese consolidada do estado do projeto após aquele ciclo;
8. então é executada uma **verificação global de consistência cruzada** entre os artefatos do ciclo e os documentos vivos, com novos loops de refinamento quando necessário.

Esse processo não é linear no sentido estrito. Ele é melhor descrito como um fluxo em etapas com **múltiplos laços de refinamento local** e um **laço final de consistência sistêmica**.

---

## 3. Janela temporal e identificação do ciclo

No processo descrito originalmente, o ciclo possuía cadência semanal. Essa cadência continua admissível em projetos convencionais, mas não deve ser tratada como restrição metodológica.
 
A disciplina central passa a ser: **uma ata por ciclo documental**. Isso significa que cada unidade causal relevante de trabalho deve ser consolidada em uma ata própria, mesmo que ocorram múltiplos ciclos no mesmo dia.
 
Durante o ciclo, o projeto produz sinais. Esses sinais são acumulados. Apenas no momento de consolidação eles são reorganizados e convertidos em entrada documental formal.
 
Na prática convencional, um ciclo pode coincidir com a semana de trabalho:

* ao longo da semana são coletados materiais diversos;
* às segundas-feiras ocorre uma reunião de acompanhamento, na qual se apresenta o que foi entregue e se discutem novas ações;
* na terça-feira subsequente ocorre a etapa principal de consolidação documental, em que a ata semanal é produzida e refinada.

Essa disciplina é extremamente importante porque impede que a documentação viva seja alterada por impulsos fragmentários. O projeto não muda documentalmente a cada mensagem ou observação isolada; ele muda quando a semana é consolidada em um evento documental formal.

Entretanto, em projetos conduzidos com apoio intensivo de agentes de LLM e ferramentas de geração de código, podem existir vários ciclos documentais no mesmo dia. Nesse cenário, a data isolada deixa de ser suficiente para identificar a ata e seus artefatos derivados.

Por isso, cada ciclo documental deve possuir um número sequencial. O ciclo inicial do projeto é `000`, e cada nova ata consolidada incrementa esse número. Como convenção prática, recomenda-se o uso de três dígitos (`000`, `001`, `002`...), podendo-se ampliar a quantidade de dígitos em projetos de maior duração ou maior volume documental.

Essa disciplina é extremamente importante porque impede que a documentação viva seja alterada por impulsos fragmentários. O projeto não muda documentalmente a cada mensagem, geração automática ou observação isolada; ele muda quando um ciclo é consolidado em um evento documental formal.

### Convenção de nomenclatura dos artefatos históricos do ciclo

A convenção geral para artefatos históricos passa a ser:

```text
prefixo-aaaammdd-ciclo-descritivo-curto.md
```

ou, quando não houver descritivo necessário:

```text
prefixo-aaaammdd-ciclo.md
```

No contexto da metodologia:

* `ata-aaaammdd-ciclo-descritivo-curto.md`
* `adr-aaaammdd-ciclo-descritivo-curto.md`
* `esm-aaaammdd-ciclo.md` ou `esm-aaaammdd-ciclo-descritivo-curto.md`
* `leg-aaaammdd-ciclo.md` ou `leg-aaaammdd-ciclo-descritivo-curto.md`

O número do ciclo vincula causalmente ata, ADR, ESM, LEG e demais registros históricos derivados da mesma consolidação.

---

## 4. Natureza dos insumos brutos

Antes da geração da ata, existe uma fase implícita, mas fundamental, que é a **coleta e acumulação de material bruto**.

Esse material é heterogêneo. Ele não entra ainda como verdade documental. Ele entra como evidência potencial de evolução. No processo manual atual, esse material pode incluir:

* transcrições de reuniões;
* anotações de reuniões presenciais;
* resumos pessoais feitos durante a semana;
* mensagens trocadas por e-mail;
* conversas relevantes em aplicativos de mensagem;
* observações oriundas de validações funcionais;
* decisões informais tomadas em discussões técnicas;
* registros de entregas efetivamente realizadas;
* dúvidas levantadas e respondidas durante o ciclo;
* percepções sobre inconsistências nos documentos existentes;
* evidências de mudanças de entendimento do cliente;
* alterações arquiteturais ou funcionais já implementadas;
* problemas operacionais ocorridos durante o período.

Esses itens normalmente são guardados em um espaço temporário de trabalho, uma espécie de **pasta de staging semântico** da semana. O papel dessa pasta não é ser parte do estado durável do projeto. Ela é uma área de acumulação transitória de evidências, usada para alimentar a consolidação posterior.

Do ponto de vista do mede-cli, isso sugere que deve existir um conceito claro de **entrada bruta temporária do ciclo**, separada do espaço documental oficial.

---

## 5. Entradas formais e entradas informais do ciclo

Uma distinção importante para a futura implementação é separar o que entra no ciclo como **entrada informal** e o que entra como **entrada formal**.

### 5.1 Entradas informais

São os materiais brutos acumulados durante a semana. Exemplos:

* transcrições;
* notas;
* mensagens;
* listas de pendências;
* relatos operacionais;
* observações manuais.

Essas entradas têm função de evidência. Elas ajudam a reconstruir o que ocorreu, mas ainda não são consideradas artefatos oficiais do projeto.

### 5.2 Entradas formais

São os documentos persistentes já existentes no projeto, usados como base de contexto e de coerência. Entre eles:

* `entendimento-inicial.md`
* `visao-e-escopo.md`
* `requisitos-funcionais.md`
* `requisitos-nao-funcionais.md`
* `modelo-de-dados.md`
* `readme.md`
* `situacao-atual.md`
* atas anteriores
* ADRs anteriores
* ESMs anteriores
* logs de entrega anteriores

Esses documentos já fazem parte do estado documental do projeto e precisam ser respeitados, confrontados e, quando necessário, atualizados.

No processo manual, a geração da nova ata parte dos insumos brutos, mas em contexto com o estado documental prévio. A LLM não deveria consolidar a semana no vácuo. Ela precisa receber o material bruto e, em certos momentos, também o contexto documental já consolidado.

---

## 6. Etapa 1 — Preparação do ciclo

A primeira etapa explícita do ciclo é a preparação do material de consolidação.

Nessa etapa, o operador humano reúne os insumos brutos da semana e organiza minimamente o que será fornecido à LLM para a geração da ata. O objetivo aqui não é já interpretar tudo em profundidade, mas garantir que o material relevante esteja acessível, suficientemente legível e com o mínimo de redundância tóxica.

Essa preparação pode envolver:

* reunir arquivos espalhados em uma pasta temporária;
* renomear arquivos para facilitar referência temporal;
* descartar material nitidamente irrelevante;
* separar ruído puro de conteúdo potencialmente decisório;
* montar um pacote ou lista de insumos do ciclo;
* indicar o período temporal coberto pelo ciclo;
* identificar, quando necessário, a reunião principal da semana.

Essa etapa é importante porque a qualidade da ata depende muito da qualidade da entrada. Uma LLM alimentada com material caótico, desordenado ou excessivamente redundante tende a produzir atas superficiais, prolixas ou semanticamente frágeis.

Do ponto de vista do mede-cli, essa etapa sugere a necessidade de um subfluxo de **ingestão e normalização de insumos** antes da consolidação propriamente dita.

### Saídas da etapa 1

* conjunto organizado de insumos brutos do ciclo;
* delimitação temporal explícita da semana;
* contexto mínimo para geração da ata.

---

## 7. Etapa 2 — Geração da ata semanal

A ata é o primeiro artefato formal gerado no ciclo e, metodologicamente, o mais importante. No processo descrito, ela é produzida a partir do conjunto completo de sinais da semana e funciona como **consolidação oficial do entendimento compartilhado** daquele período.

A ata não é uma simples minuta de reunião. Ela é a reconstrução documental do que a semana significou para o projeto. Seu papel é consolidar:

* o que foi entregue;
* o que foi observado;
* o que foi discutido;
* o que foi decidido;
* o que mudou no entendimento;
* o que passou a demandar ação futura;
* o que impacta a solução em termos funcionais, técnicos ou documentais.

A LLM entra aqui como instrumento de síntese e estruturação. Ela recebe os materiais da semana e propõe uma primeira versão da ata. Essa primeira versão, entretanto, não é aceita automaticamente.

### 7.1 Primeiro loop de refinamento: ata

O processo manual descrito envolve um loop iterativo de validação e aprimoramento da ata, mas esse loop não deve ser entendido como uma sequência de “regenerações completas” do documento a partir do zero. Essa seria uma simplificação incorreta do processo real.

Na prática, a LLM normalmente gera uma **primeira versão integral da ata**, que serve como ponto de partida. A partir desse momento, o refinamento passa a ocorrer predominantemente por **diffs sobre o arquivo atual**, e não por substituição integral contínua do documento.

O fluxo real é mais próximo do seguinte:

1. a LLM gera uma versão inicial da ata;
2. o operador humano lê criticamente essa primeira versão;
3. identifica trechos corretos, trechos parciais, trechos inadequados, omissões, ambiguidades, exageros, inferências indevidas ou falta de precisão;
4. em vez de simplesmente pedir “gere a ata novamente”, o operador normalmente pede um **diff sobre a ata atual**, acompanhado de instruções sobre o que precisa ser corrigido, ampliado, removido ou reescrito;
5. a LLM propõe alterações localizadas sobre o arquivo atual;
6. o operador humano avalia esse diff e pode:
   - aceitar apenas parte das alterações;
   - rejeitar outras;
   - editar manualmente o arquivo resultante;
   - manter trechos do documento original que já estavam corretos;
7. após essa seleção parcial, forma-se um **novo estado atual do arquivo**, que passa a ser a base do próximo refinamento;
8. esse arquivo atualizado é então reenviado, junto com os artefatos relevantes e novas instruções, solicitando-se novo diff sobre o estado corrente;
9. o ciclo se repete até que a ata seja considerada suficientemente consolidada.

Esse ponto é central: a ata não surge pronta, nem é necessariamente regenerada por inteiro a cada rodada. Ela emerge de um processo supervisionado de refinamento incremental, no qual cada iteração parte do **documento atualmente consolidado até aquele momento**.

Esse detalhe é metodologicamente importante porque evita duas interpretações erradas:

- a de que cada ciclo de correção equivale a descartar a versão anterior e gerar outra do zero;
- a de que cada diff proposto pela LLM é aceito integralmente ou rejeitado integralmente.

Na prática, o que existe é um processo de curadoria incremental. Um mesmo diff pode conter partes boas e partes ruins. O operador pode aceitar algumas, rejeitar outras, fazer ajustes manuais adicionais e então seguir para uma nova rodada. O refinamento, portanto, não ocorre em blocos monolíticos de aprovação, mas em uma sequência de microdecisões supervisionadas sobre o conteúdo do arquivo.


Na prática, os critérios de qualidade da ata tendem a incluir:

* aderência aos fatos da semana;
* clareza sobre entregas e pendências;
* separação adequada entre fatos, decisões e hipóteses;
* ausência de invenções ou extrapolações sem base;
* linguagem suficientemente estável para derivação posterior;
* capacidade de servir de base para ADR e ESM.

### Entradas da etapa 2

* pacote de insumos brutos da semana;
* eventualmente contexto documental prévio;
* convenções do projeto para atas.

### Saída principal da etapa 2

* `ata-aaaammdd-ciclo-...md` consolidada.

---

## 8. Papel metodológico da ata dentro do ciclo

A ata consolidada é o pivô do ciclo. Depois que ela é aceita, o restante do fluxo passa a tratá-la como **entrada causal formal**.

Isso significa que o projeto não deriva ADR e ESM diretamente de mensagens, e-mails ou transcrições brutas. Esses materiais já cumpriram seu papel ao alimentar a ata. A partir daí, a ata funciona como filtro semântico e jurídico-metodológico do que a semana passou a significar.

Isso traz várias vantagens:

* reduz ruído causal;
* evita que múltiplos canais informais governem o projeto;
* cria um ponto único de consolidação temporal;
* permite auditoria mais clara do que foi entendido;
* estabiliza a entrada para os artefatos seguintes.

Na implementação do mede-cli, isso sugere que a ata não deve ser apenas “mais um arquivo gerado”. Ela deve ser tratada como o **marco de transição entre material bruto e documentação oficial**, mas também como um artefato sujeito a consolidação incremental por revisões parciais.

Em outras palavras: depois da geração inicial, a ata entra em um regime de refinamento orientado a diff sobre o **arquivo atual**, não em um regime de sucessivas reescritas integrais obrigatórias.

---

## 9. Etapa 3 — Derivação de ADR e ESM a partir da ata

Com a ata consolidada, inicia-se a geração dos artefatos derivados. No processo manual atual, isso ocorre tomando a ata como entrada principal.

Os dois principais artefatos derivados são:

* **ADR**, quando a ata contém decisões ou revisões de impacto arquitetural ou estrutural relevante;
* **ESM**, quando a ata contém necessidades de manutenção, ajuste, evolução funcional, regra operacional ou detalhamento ainda não consolidado nos documentos vivos.

A razão para derivar esses documentos da ata, e não diretamente dos insumos brutos, é metodológica: a ata já consolidou o entendimento da semana. ADR e ESM são especializações desse entendimento.

### 9.1 Geração de ADR

A LLM analisa a ata e identifica decisões que têm natureza arquitetural ou estrutural. Nem toda semana necessariamente produzirá ADR. Quando produz, o ADR deve registrar de forma clara:

* qual decisão foi tomada;
* qual problema ou contexto a motivou;
* qual direção foi escolhida;
* quais consequências decorrem disso;
* eventualmente, quais alternativas foram descartadas.

Também aqui existe loop de refinamento. Esse loop, novamente, não deve ser entendido como uma sequência de gerações integrais completas do ADR a cada iteração. O padrão real é o mesmo da ata: normalmente há uma primeira versão do documento, e depois o refinamento passa a ocorrer por diffs sobre o **arquivo corrente daquele ADR**.

O operador humano valida se:

* aquilo realmente merece ADR;
* a decisão está corretamente formulada;
* a motivação está fiel;
* não houve inflacionamento artificial de importância.

Ao revisar o diff proposto, o operador pode aceitar apenas parte das alterações, editar o arquivo manualmente e submeter o novo estado do documento para nova rodada de refinamento. Assim, o ADR evolui como um documento em consolidação progressiva, e não como uma peça textual descartada e reescrita integralmente a cada ajuste.

### 9.2 Geração de ESM

Em paralelo ou em sequência, a LLM deriva da ata as especificações intermediárias de evolução/manutenção. O ESM ocupa o espaço entre a ata e a alteração efetiva dos documentos vivos. Ele ajuda a explicitar o que precisa ser tratado como ajuste, correção, evolução ou regra operacional ainda em consolidação.

O loop de refinamento do ESM tende a ser ainda mais importante, porque ESMs frágeis ou ambíguos contaminam a atualização posterior dos documentos vivos.
Também aqui o refinamento deve ser entendido como **edição incremental do arquivo atual via diffs parciais**, e não como substituição integral contínua.

Um ESM pode começar com uma primeira redação aceitável em alguns trechos e ruim em outros. O operador humano pode preservar o que está bom, corrigir o que está fraco, solicitar novo diff apenas para os problemas remanescentes e seguir assim até a consolidação.

### Entradas da etapa 3

* ata consolidada;
* eventualmente contexto documental prévio;
* convenções de ADR e ESM do projeto.

### Saídas da etapa 3

* zero ou mais `adr-*.md`;
* um ou mais `esm-*.md`, conforme o recorte adotado;
* conjunto refinado e aceito desses artefatos.

---

## 10. Segundo loop de refinamento: derivação especializada

Assim como na ata, a geração de ADR e ESM ocorre em modo iterativo.

Mas é importante registrar com precisão a natureza dessa iteração: o operador humano não fica apenas pedindo “gere novamente” até chegar a uma versão boa. O padrão real é mais controlado. Em geral:

1. existe uma geração inicial do documento;
2. em seguida, o operador passa a trabalhar sobre o **arquivo atual em anexo**;
3. novas instruções são fornecidas à LLM, explicando o que está errado, o que precisa ser ajustado e o que deve ser preservado;
4. a LLM então propõe um **diff do arquivo atual**, e não necessariamente uma reescrita integral;
5. o operador aceita parcialmente esse diff, rejeita parcialmente, pode editar manualmente o arquivo e produz um novo estado corrente;
6. o próximo loop parte desse novo estado.

O operador humano não aceita automaticamente o primeiro texto gerado. Ele entra em loop até que os documentos estejam:

* semanticamente corretos;
* proporcionais ao ocorrido;
* bem delimitados;
* úteis para orientar a atualização documental seguinte.

Esse loop é especialmente importante porque a LLM tem algumas tendências problemáticas aqui:

* transformar qualquer detalhe em “decisão arquitetural”;
* misturar manutenção rotineira com decisão estrutural;
* ampliar conclusões além do que a ata autoriza;
* gerar documentação excessivamente genérica;
* introduzir formalismo vazio.

Portanto, no mede-cli, a derivação de ADR e ESM provavelmente precisa ser tratada como uma fase com **pontos explícitos de aprovação humana**, suporte a **aprovação parcial de diffs** e preservação do **estado corrente do arquivo** entre uma iteração e outra.

---

## 11. Etapa 4 — Identificação dos documentos vivos impactados

Depois que o trio principal do ciclo está consolidado — **ata + ADR + ESM** — inicia-se a etapa de análise de impacto sobre os documentos vivos.

Essa etapa é crucial. Ela responde à pergunta:

**quais documentos persistentes do projeto precisam ser alterados para refletir o novo entendimento consolidado?**

Aqui a LLM não entra ainda para reescrever tudo diretamente. Primeiro ela é usada como mecanismo de análise. Dado o conjunto de artefatos do ciclo e os documentos vivos existentes, pede-se que ela identifique:

* quais arquivos precisam mudar;
* por que precisam mudar;
* qual a natureza da alteração esperada em cada um;
* quais documentos podem permanecer inalterados.

Esse momento é muito importante porque evita alteração cega e desnecessária. Ele também ajuda a preservar estabilidade documental. Nem toda semana todos os documentos devem mudar. Em muitos casos, apenas alguns serão impactados.

### Entradas da etapa 4

* ata consolidada;
* ADRs do ciclo;
* ESMs do ciclo;
* conjunto atual de documentos vivos.

### Saída da etapa 4

* lista priorizada de documentos vivos impactados;
* justificativa de impacto por documento.

---

## 12. Etapa 5 — Atualização dos documentos vivos por diffs

Identificados os documentos vivos impactados, inicia-se a atualização propriamente dita. No processo manual descrito, isso não é feito por substituição integral cega de cada arquivo. A prática preferida é solicitar à LLM um **diff de alteração por documento**.

Isso é metodologicamente muito importante.

O diff obriga a mudança a ser observável. Em vez de receber um documento inteiro reescrito, o operador humano consegue enxergar:

* o que está sendo acrescentado;
* o que está sendo removido;
* o que está sendo reformulado;
* se a alteração está proporcional ao impacto real do ciclo.

Essa escolha reduz o risco de reescrita indevida, regressão semântica e degradação acidental do documento.

### 12.1 Processo por documento

Para cada documento vivo impactado, o fluxo manual tende a ser:

1. fornecer à LLM o documento atual;
2. fornecer a ata, o ADR e o ESM relevantes;
3. pedir análise de alteração necessária;
4. solicitar um diff proposto sobre o **arquivo atual em anexo**;
5. revisar o diff manualmente;
6. aceitar apenas as partes adequadas do diff;
7. rejeitar as partes inadequadas;
8. eventualmente editar manualmente o documento resultante;
9. formar um novo estado atual do arquivo;
10. reenviar esse arquivo atualizado, juntamente com os artefatos originais e novas instruções, pedindo novo diff sobre o estado corrente;
11. repetir até considerar o documento satisfatório;
12. seguir para o próximo documento.

Esse detalhe precisa ficar muito claro: o refinamento documental não é um processo binário em que “o diff veio bom” ou “o diff veio ruim”. Frequentemente, um mesmo diff contém trechos aproveitáveis e trechos inadequados. A operação real do método envolve seleção parcial, edição intermediária e novo ciclo de proposta sobre o documento já parcialmente consolidado.

Esse fluxo é **serial por documento**, embora conceitualmente pudesse ser paralelizado no futuro. No processo humano supervisionado atual, a serialização é valiosa porque mantém foco e reduz dispersão cognitiva.

### Entradas da etapa 5

* lista de documentos impactados;
* documento atual a ser alterado;
* ata/ADR/ESM;
* critérios documentais do projeto.

### Saídas da etapa 5

* diffs aprovados por documento;
* documentos vivos atualizados e aceitos.

---

## 13. Terceiro loop de refinamento: diff por arquivo

Essa é uma das partes mais importantes para a futura implementação do mede-cli.

O loop por documento não é trivial. Ele envolve pelo menos quatro dimensões de validação:

1. **fidelidade causal**: o diff realmente decorre de ata/ADR/ESM?
2. **proporcionalidade**: a mudança está no tamanho certo ou está reescrevendo demais?
3. **coerência local**: o documento continua legível e internamente coerente após a alteração?
4. **coerência sistêmica parcial**: a mudança não cria contradição óbvia com outros documentos?

O operador vai refinando o diff até que ele esteja satisfatório. Depois passa para o próximo arquivo. Esse “até achar que o documento está ok” não é um gesto arbitrário; é um julgamento técnico de suficiência documental.

Convém explicitar melhor como esse refinamento ocorre de fato. O ciclo real não funciona apenas assim: “a LLM propõe um diff; o humano aprova ou reprova; pede outro diff completo”. O que ocorre com frequência é:

- a LLM propõe um diff;
- o humano identifica blocos corretos e blocos problemáticos;
- aplica apenas parte do diff;
- ajusta manualmente alguns trechos;
- mantém partes do documento anterior que já estavam boas;
- então submete o **novo documento atual** para nova rodada, junto com instruções mais precisas.

Portanto, o objeto do refinamento não é apenas o diff em si, mas o **estado do arquivo após cada rodada parcial de curadoria**. O diff é um instrumento de proposta de mudança. O documento atual consolidado é o verdadeiro objeto de trabalho entre uma iteração e outra.

Na implementação, esse ponto pode exigir mecanismos como:

* apresentação de diff estruturado;
* comentário humano por bloco;
* aceitação parcial de alterações;
* manutenção explícita do arquivo corrente após aplicação parcial;
* reiteração controlada sobre o novo estado do arquivo;
* aprovação explícita antes de aplicação integral ou parcial.

---

## 14. Ordem de atualização dos documentos vivos

Embora o processo possa variar conforme o projeto, existe uma lógica metodológica útil na ordem de atualização:

1. documentos mais centrais e estáveis do entendimento;
2. documentos de requisitos ou modelo;
3. documentos de apoio operacional;
4. por último, a síntese do estado do projeto.

Essa lógica é coerente com a prática que você descreveu, na qual `situacao-atual.md` é deixado para o final. Isso faz sentido porque a situação atual não deve liderar a verdade do projeto; ela deve consolidar a verdade já ajustada nos demais artefatos.

Portanto, na implementação do fluxo, `situacao-atual.md` deve ser tratado como **documento de fechamento**, não como primeiro alvo de alteração.

---

## 15. Etapa 6 — Geração do log de entregas

Uma vez atualizados os documentos vivos relevantes, o ciclo já possui base suficiente para gerar o registro histórico do que efetivamente foi entregue ou consolidado naquele período.

Nesse momento entra o **log de entregas**. Seu papel não é repetir a ata, nem substituir o histórico decisório. Ele registra a materialização do ciclo em termos de evolução efetiva do projeto.

Ele deve refletir, por exemplo:

* entregas realizadas;
* documentos alterados;
* avanços relevantes;
* aspectos estabilizados;
* marcos da semana;
* pendências remanescentes significativas.

Metodologicamente, o log de entregas ajuda a separar três planos:

* o que foi discutido;
* o que foi especificado;
* o que foi efetivamente incorporado ao projeto.

### Entradas da etapa 6

* ata consolidada;
* ADR e ESM do ciclo;
* documentos vivos já atualizados.

### Saída da etapa 6

* `leg-aaaammdd-ciclo.md`, `leg-aaaammdd-ciclo-descritivo-curto.md` ou atualização do arquivo correspondente à convenção do projeto.

---

## 16. Etapa 7 — Geração de `situacao-atual.md`

No fluxo descrito, esse é o último grande artefato de fechamento do ciclo.

Isso é uma escolha metodologicamente muito boa. `situacao-atual.md` não deve funcionar como um documento adivinhatório ou como um painel escrito no início do processo. Ele deve ser a síntese final do estado consolidado após:

* ata fechada;
* ADR/ESM consolidados;
* documentos vivos atualizados;
* log de entregas produzido.

Nesse momento, a LLM recebe o conjunto dos artefatos já estabilizados e ajuda a produzir uma visão sintética e operacional do estado do projeto naquele instante.

Esse documento costuma ser especialmente útil para:

* leitura rápida do momento do projeto;
* acompanhamento executivo;
* transição entre ciclos;
* retomada de contexto em semanas futuras;
* suporte a novos participantes;
* comunicação com cliente ou equipe.

### Entradas da etapa 7

* ata;
* ADR;
* ESM;
* documentos vivos atualizados;
* log de entregas.

### Saída da etapa 7

* `situacao-atual.md` atualizado.

---

## 17. Etapa 8 — Verificação global de consistência

Essa etapa é uma das mais sofisticadas do processo e uma das que mais diferenciam o método de um fluxo documental superficial.

Depois de gerar todos os artefatos do ciclo, você executa uma verificação cruzada de consistência entre:

* a ata;
* o ADR;
* o ESM;
* todos os documentos vivos;
* o log de entregas;
* a situação atual.

O objetivo é verificar se o conjunto está semanticamente coerente como sistema documental, e não apenas se cada arquivo individual parece bom isoladamente.

Esse ponto é decisivo. Muitos processos falham porque validam documentos localmente, mas não verificam o conjunto. O resultado é uma documentação em que cada texto parece razoável, porém o sistema inteiro contém contradições, lacunas ou sobreposições.

### 17.1 O papel da LLM na consistência global

Aqui a LLM atua como mecanismo de auditoria semântica assistida. Ela recebe o conjunto completo dos artefatos e é solicitada a:

* identificar inconsistências;
* apontar divergências entre documentos;
* detectar omissões relevantes;
* indicar desalinhamentos entre documentos históricos e vivos;
* propor, para cada problema, diffs específicos por arquivo.

Essa etapa não substitui a revisão humana. Ela amplia a capacidade de inspeção cruzada.

### 17.2 Loop final de consistência

Quando inconsistências são apontadas, o processo não termina. Ele entra em novo loop:

1. a LLM aponta inconsistências;
2. propõe diffs por arquivo afetado, sempre tomando como base o **estado atual de cada arquivo**;
3. o operador revisa;
4. pode aceitar apenas parte dos diffs;
5. pode editar manualmente os arquivos;
6. os arquivos corrigidos passam a constituir o novo estado vigente;
7. roda-se nova verificação de consistência sobre esse novo estado;
8. o processo se repete até que o conjunto esteja satisfatoriamente consistente.

Esse detalhe é importante porque a consistência global também não é resolvida por substituições integrais cegas. Ela é resolvida por sucessivos ajustes localizados sobre o conjunto documental corrente.

Esse é o **laço sistêmico de fechamento** do ciclo.

---


## 18. Critério de encerramento do ciclo

Um ciclo não está encerrado quando a ata foi escrita. Nem quando os documentos vivos foram alterados. Nem quando a situação atual foi gerada.

O ciclo só está encerrado quando o conjunto documental resultante atinge um nível aceitável de consistência cruzada e estabilidade suficiente para servir de base ao próximo ciclo.

Na prática, isso significa que o encerramento do ciclo depende de critérios como:

* ata consolidada e aprovada;
* ADR e ESM aprovados;
* documentos vivos impactados atualizados;
* log de entregas produzido;
* situação atual gerada;
* inconsistências relevantes resolvidas;
* conjunto documental aceito como novo estado vigente do projeto.

Esse critério de encerramento é importante para o mede-cli porque indica que o comando de ciclo provavelmente não deveria ser tratado como uma simples rotina monolítica que sempre “termina”. Em muitos casos, ele deve deixar claro se o ciclo está:

* em preparação;
* em consolidação da ata;
* em derivação;
* em atualização documental;
* em fechamento;
* ou ainda com pendências de consistência.

---

## 19. Papel humano ao longo do ciclo

Embora haja uso intensivo de LLM em vários pontos, o processo manual descrito é explicitamente supervisionado. Isso precisa ficar muito claro na documentação do método e na arquitetura do mede-cli.

O humano atua como:

* curador dos insumos brutos;
* validador semântico da ata;
* julgador do que merece ADR;
* refinador do ESM;
* aprovador parcial ou total dos diffs por documento;
* editor intermediário dos arquivos entre uma iteração e outra;
* árbitro de conflitos de consistência;
* definidor do critério de suficiência documental.

A LLM, por sua vez, atua como:

* sintetizadora de material bruto;
* redatora assistiva;
* extratora de decisões e impactos;
* analisadora de documentos impactados;
* geradora de diffs incrementais sobre o arquivo atual;
* auditora semântica de consistência.

Essa distinção não é detalhe. Ela é estrutural. O MEDE não delega a governança do projeto à IA. Ele usa IA para ampliar a capacidade humana de consolidação e verificação.

Mais especificamente, a governança humana se expressa não apenas na aprovação final de um documento, mas no controle fino de cada iteração: seleção parcial de alterações, manutenção de trechos já validados, edição manual de estados intermediários e formulação de novas instruções a partir do documento efetivamente resultante da rodada anterior.

---

## 20. Onde a LLM entra em cada etapa

Para fins de futura implementação, vale descrever explicitamente os pontos de entrada da LLM no ciclo:

### 20.1 Consolidação da ata

A LLM recebe insumos brutos e propõe a ata do ciclo documental.

### 20.2 Refinamento da ata

A LLM recebe feedback humano e produz diffs sucessivos sobre o arquivo atual da ata, até fechamento.

### 20.3 Derivação de ADR

A LLM analisa a ata e propõe registros de decisão arquitetural quando aplicável.

### 20.4 Derivação de ESM

A LLM analisa a ata e propõe especificações de evolução/manutenção, que depois entram em refinamento incremental sobre o arquivo corrente.

### 20.5 Análise de impacto em documentos vivos

A LLM examina o trio principal do ciclo e aponta quais documentos precisam mudar.

### 20.6 Geração de diff por documento

A LLM produz propostas de alteração estruturadas para cada arquivo impactado, sempre referenciando o arquivo atual em anexo como base da mudança.

### 20.7 Refinamento de diff

A LLM reage a comentários humanos e ajusta o diff sobre o novo estado do arquivo, após aplicação parcial, rejeição parcial ou edição manual do ciclo anterior.

### 20.8 Geração do log de entregas

A LLM ajuda a consolidar o que foi efetivamente entregue no período.

### 20.9 Geração da situação atual

A LLM produz a síntese final do estado do projeto.

### 20.10 Auditoria de consistência global

A LLM compara os artefatos entre si e propõe correções.

Essa enumeração ajuda muito a transformar o processo em pipeline implementável.

---

## 21. Modelo de entradas e saídas por fase

Para facilitar a futura engenharia do mede-cli, segue uma visão mais formal das fases.

### Fase A — Ingestão do ciclo

**Entradas:** arquivos temporários, notas, transcrições, mensagens, observações.
**Saídas:** pacote organizado de insumos do ciclo.

### Fase B — Consolidação da ata

**Entradas:** pacote de insumos, contexto do projeto.
**Saídas:** ata consolidada.

### Fase C — Derivação especializada

**Entradas:** ata consolidada.
**Saídas:** ADR(s) e ESM(s) refinados.

### Fase D — Análise de impacto documental

**Entradas:** ata, ADR, ESM, documentos vivos.
**Saídas:** lista de documentos impactados e racional de alteração.

### Fase E — Atualização por diffs

**Entradas:** documentos impactados + artefatos do ciclo.
**Saídas:** documentos vivos atualizados.

### Fase F — Log de entregas

**Entradas:** artefatos do ciclo + documentos atualizados.
**Saídas:** log de entregas.

### Fase G — Situação atual

**Entradas:** conjunto final do ciclo.
**Saídas:** `situacao-atual.md`.

### Fase H — Consistência global

**Entradas:** todos os artefatos gerados e atualizados.
**Saídas:** diffs corretivos adicionais ou aceite do ciclo.

---

## 22. Natureza dos loops de refinamento

O processo manual possui pelo menos quatro tipos de loop, e o mede-cli deve tratá-los como entidades explícitas, não como detalhe acidental.

Além disso, todos esses loops compartilham uma característica importante: eles operam sobre **um estado corrente do artefato**, e não apenas sobre uma sequência de versões completas geradas independentemente umas das outras.

### 22.1 Loop de consolidação textual

Usado na ata, ADR, ESM e situação atual.
Objetivo: melhorar o texto até atingir precisão e suficiência, por meio de diffs sucessivos sobre o documento atual, com possibilidade de aceitação parcial e edição humana intermediária.

### 22.2 Loop de alteração localizada

Usado nos diffs por documento.
Objetivo: refinar mudanças específicas sem reescrever o arquivo inteiro, sempre tomando como base o estado mais recente do arquivo após cada rodada parcial.

### 22.3 Loop de impacto

Usado na identificação de quais documentos mudar.
Objetivo: revisar a análise de impacto até que a lista de documentos afetados faça sentido.


### 22.4 Loop de consistência sistêmica

Usado no fechamento do ciclo.
Objetivo: alinhar o conjunto inteiro de artefatos entre si.

Essa classificação pode ser muito útil na arquitetura do mede-cli, porque cada tipo de loop possui comportamento, critérios de saída e interface distintos.

---

## 23. Riscos operacionais do ciclo

Documentar bem o processo também exige reconhecer seus riscos.

### 23.1 Risco de atas ruins

Se a ata for incompleta ou imprecisa, o restante do ciclo é contaminado. Como ela é a entrada causal formal, uma ata ruim compromete ADR, ESM e atualização documental.

### 23.2 Risco de inflação documental

Se toda mudança virar ADR ou ESM sem critério, a metodologia perde foco e gera sobrecarga.

### 23.3 Risco de reescrita excessiva

Sem uso de diff, a LLM pode reescrever documentos demais, introduzindo regressões.

### 23.4 Risco de perfeccionismo infinito

Os loops de refinamento são valiosos, mas precisam de critério de parada. O objetivo é coerência operacional suficiente, não perfeição abstrata interminável.

### 23.5 Risco de consistência apenas local

Um documento pode parecer excelente isoladamente e ainda assim contradizer o resto. Por isso o laço final de consistência global é indispensável.

---

## 24. Implicações para a implementação do mede-cli

O processo descrito sugere que o mede-cli não deve ser construído como um simples gerador linear de arquivos. Ele precisa refletir a natureza real do trabalho metodológico.

Algumas implicações práticas são claras.

### 24.1 O ciclo precisa ser stateful

O comando deve saber em que fase está, o que já foi aprovado, o que ainda está pendente e quais loops estão abertos.

### 24.2 Mudanças devem ser aprováveis

Toda proposta relevante da LLM deve ser revisável e aprovável antes de aplicação, especialmente diffs em documentos vivos.

Mas isso ainda não é suficiente. Na prática, o sistema precisa suportar:

- aprovação parcial de diffs;
- rejeição parcial de diffs;
- edição manual do arquivo após aplicação parcial;
- persistência do novo estado corrente do arquivo;
- novo pedido de diff tomando esse estado como base.

### 24.3 A ata precisa ser tratada como milestone do ciclo

Sem ata consolidada, o resto não deveria avançar.

### 24.4 O motor precisa separar análise de alteração de aplicação de alteração

Primeiro identificar impacto, depois propor diff, só então aplicar.

Além disso, precisa separar:

- **proposta de diff**;
- **seleção parcial do diff**;
- **materialização do novo arquivo atual**;
- **nova iteração sobre esse arquivo**.

### 24.5 O fechamento deve incluir auditoria cruzada

Não basta gerar arquivos; o sistema precisa verificar coerência entre eles.

### 24.6 O estado do ciclo deve ser retomável

Como o fluxo tem muitos loops, o mede-cli precisa ser capaz de pausar e retomar sem perder contexto operacional.

Isso inclui, idealmente:

- o último estado consolidado de cada arquivo em refinamento;
- o histórico recente de diffs propostos;
- quais partes foram aceitas ou rejeitadas;
- quais instruções humanas motivaram a rodada seguinte.

---

## 25. Síntese conceitual do ciclo

Em termos mais profundos, o ciclo documental do MEDE pode ser entendido como um processo de transformação em camadas:
 
* **camada bruta**: sinais dispersos do ciclo;
* **camada causal**: ata consolidada;
* **camada especializada**: ADR e ESM;
* **camada consolidada**: documentos vivos atualizados;
* **camada histórica de execução**: log de entregas;
* **camada sintética do estado**: situação atual;
* **camada de integridade**: verificação global de consistência.

Essa estrutura ajuda a explicar por que o processo funciona. Ele não tenta fazer tudo de uma vez. Ele transforma o conhecimento do projeto por estágios, cada um com papel próprio e com checkpoints humanos de validação.

---

## 26. Conclusão

O ciclo de atualização do MEDE, tal como executado manualmente, é um processo de **consolidação documental causal supervisionada**. Seu valor não está apenas na produção de documentos, mas na disciplina com que transforma evidências dispersas em uma base documental consistente, evolutiva e útil para continuidade técnica.

A escolha de operar com **uma ata por ciclo documental** é o núcleo causal do método. É ela que converte uma unidade de trabalho em unidade de entendimento formal. A partir dessa consolidação, a derivação de ADR e ESM, a atualização controlada dos documentos vivos, o log de entregas, a situação atual e a auditoria final de consistência formam um pipeline coerente de preservação do conhecimento do projeto.

A operação em ciclos de uma semana estabelece o ritmo ideal de comunicação com clientes e partes interessadas. Mais do que um prazo, esse período funciona como um filtro contra decisões precipitadas, garantindo que o entendimento do projeto amadureça o suficiente antes de ser consolidado e integrado à governança.

O uso de LLM é intensivo, porém sempre supervisionado. A IA participa da síntese, da redação inicial, da análise de impacto, da geração de diffs incrementais e da auditoria de coerência, mas a decisão sobre o que o projeto realmente significa permanece humana. Essa combinação entre governança metodológica e assistência automatizada é justamente o que torna o processo reproduzível e escalável.

Também é importante registrar, de forma explícita, que a unidade prática de refinamento do ciclo não é simplesmente “um novo documento gerado pela LLM”, mas o **arquivo atual em consolidação**, sobre o qual a LLM propõe mudanças parciais. O operador humano então aceita parte dessas mudanças, rejeita outras, edita o que for necessário e submete novamente o resultado. Esse padrão vale para a ata, para ADR, para ESM, para documentos vivos, para o log de entregas, para a situação atual e para os ajustes de consistência global.

Sem essa explicitação, o processo poderia ser interpretado erroneamente como uma cadeia de gerações integrais sucessivas de arquivos. Com ela, fica claro que o MEDE, na prática, opera como um processo de refinamento supervisionado e incremental de artefatos documentais vivos e históricos, ancorado em diffs, curadoria humana e consolidação progressiva.

Para o mede-cli, esse fluxo serve como base de implementação porque explicita:

* os insumos do ciclo;
* os artefatos intermediários;
* os pontos de entrada da LLM;
* os laços de refinamento;
* os critérios de progressão;
* e a lógica de fechamento do ciclo.

Mais do que automatizar escrita, o que o mede-cli tende a operacionalizar é a própria **disciplina de engenharia documental do MEDE**.

