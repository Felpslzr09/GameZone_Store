# 🎮 GameZone Store

Um site fictício de e-commerce de jogos digitais, desenvolvido para estudos e prática de programação.

---

## 📌 Escopo do Projeto

### ✨ Funcionalidades Principais
- **Catálogo de Jogos** → Exibição de jogos com imagens, descrições e categorias.  
- **Filtros** → O usuário pode filtrar os jogos por tipo (Ação, Aventura, RPG, Estratégia, etc.).  
- **Busca de Jogos** → Barra de pesquisa para encontrar jogos pelo nome.  
- **Carrinho de Compras** → Adicionar jogos ao carrinho e visualizar o total da compra.  
- **Pagamento via QR Code** → Geração de QR Code com os dados da transação.  
- **Integração com APIs** →  
  - [RAWG.io](https://rawg.io/apidocs) para buscar dados dos jogos.  
  - [QR Code API](https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}&format=png&margin=10&ecc=M) para gerar o código de pagamento.  
  - [OpenStreetMap](https://{s}.tile.openstreetmap.org) para exibir mapas interativos com localização da loja ou outros recursos geográficos.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5**, **CSS3**, **JavaScript**  
- [Tailwind CSS](https://tailwindcss.com/) → estilização responsiva  
- [Font Awesome](https://fontawesome.com/) → ícones  
- [Leaflet.js](https://leafletjs.com/) → biblioteca JS para mapas interativos (utilizando tiles do OpenStreetMap)

### Backend / Integrações
- **RAWG.io API** → informações sobre jogos  
- **QR Code API** → geração do código de pagamento  
  - `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}&format=png&margin=10&ecc=M`  
- **OpenStreetMap Tiles** → exibição de mapas interativos

### Outras ferramentas
- **GitHub** → controle de versão e hospedagem do repositório

---

## 🎯 Objetivos
- Criar um site funcional que permita **buscar, filtrar, comprar e pagar por jogos online**.  
- Utilizar **APIs externas** para enriquecer a experiência do usuário.  
- Integrar **mapas interativos** com localização da loja ou recursos adicionais.  
- Aplicar **boas práticas de desenvolvimento** (uso de Git/GitHub, organização de código, versionamento).

---

## 💡 Motivo do Projeto
O projeto nasceu da **paixão por jogos** e do interesse em **explorar conceitos de comércio digital**, unindo diversão e aprendizado em uma aplicação prática.

---
