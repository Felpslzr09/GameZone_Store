# 📋 Testes - GameZone Store

Este documento registra os **testes realizados** na branch `testes` para validar as funcionalidades principais do site **GameZone Store**.

---

## ✅ Casos de Teste

### 1 - Adicionar item ao carrinho  
- [x] Verificar se o item aparece na lista do carrinho.

### 2 - Remover item do carrinho  
- [x] Conferir se o item some da lista corretamente.

### 3 - Alterar quantidade de um item (se aplicável)  
- [x] Exemplo: adicionar 2x o mesmo jogo → total deve atualizar.

### 4 - Menu de navegação  
- [x] Clique em **Home** → deve voltar para a página inicial.  
- [x] Clique em **Pagamento** → deve abrir `payment.html`.  
- [x] Clique em **Assinatura** → deve abrir `assinatura.html`.

### 5 - Botão do carrinho (ícone no topo)  
- [x] Clique no botão do carrinho → a barra lateral deve abrir.  
- [x] Clique no **X** → a barra deve fechar.  
- [x] Clique no botão → mais jogos devem aparecer no catálogo.

### 6 - Filtros da barra lateral  
- [ ] Marque **Ação** → apenas jogos de ação devem aparecer.  
- [ ] Marque **Esporte** junto → devem aparecer jogos de Ação + Esporte.  
- [ ] Clique em **Limpar Filtros** → todos os jogos voltam.  
⚠️ **Não funcionou**: filtros não aplicaram corretamente.

### 7 - Busca de jogos  
- [x] Digite um nome existente → os jogos correspondentes aparecem.  
- [x] Digite algo inexistente → deve mostrar **“0 jogos encontrados”**.

### 8 - Adicionar ao carrinho  
- [x] Clique em **Adicionar ao carrinho** em qualquer jogo → o carrinho deve atualizar o contador (`cartCount`).

### 9 - Finalizar compra no carrinho  
- [x] Adicione pelo menos 1 item → botão **"Finalizar Compra"** deve habilitar.  
- [x] Clique nele → deve ir para `payment.html`.

### 10 - Rodapé  
- [x] Clique em qualquer área do rodapé → não deve quebrar nem redirecionar para lugar errado (estático, mas conferido).

---

## 📌 Resumo dos Testes
- Total de testes: **10**  
- Passaram: **9**  
- Falharam: **1** (Filtros da barra lateral)

---

## 🚩 Observação
O **filtro lateral** não está funcionando conforme esperado.  
→ Sugestão: revisar a lógica de filtragem no `script.js`, garantindo que os jogos renderizados respeitem as categorias marcadas.
