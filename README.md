# Health Connect (Frontend)

Este é o repositório do frontend do Health Connect, um aplicativo de saúde para agendamento de consultas com especialistas. O projeto é desenvolvido com React Native e Expo, focado em uma arquitetura moderna, escalável e de fácil manutenção.

## 🚀 Tecnologias Utilizadas

- **React Native**: Estrutura principal para desenvolvimento de aplicativos móveis multiplataforma (iOS e Android).
- **Expo**: Plataforma e conjunto de ferramentas que simplificam o desenvolvimento, build e deploy de apps React Native.
- **Expo Router**: Sistema de roteamento baseado em arquivos para criar uma navegação nativa e intuitiva.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática para um código mais seguro e robusto.
- **Axios**: Cliente HTTP para realizar a comunicação com a API do backend.
- **Context API**: Para gerenciamento de estado global, especialmente o de autenticação.

---

## ✅ Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:
- [Node.js](https://nodejs.org/en/) (versão LTS, 18.x ou superior)
- [NPM](https://www.npmjs.com/)
- O aplicativo **Expo Go** instalado no seu celular:
  - [Link para Android (Google Play Store)](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - [Link para iOS (App Store)](https://apps.apple.com/us/app/expo-go/id982107779)

---

## ⚙️ Instalação

Siga os passos abaixo para configurar o ambiente de desenvolvimento:

1. **Clone o repositório:**
   ```bash
   git clone[ https://github.com/Alquieri/healthconnect-frontend-mobile.git
   ```

2.  **Navegue até a pasta do projeto:**

    ```bash
    cd healthconnect-frontend
    ```

3.  **Instale as dependências:**

    ```bash
    npm install
    ```
-----

## 📱 Como Rodar o Projeto no Celular (via QR Code)

Para visualizar e testar o aplicativo em tempo real no seu próprio celular, siga estes passos:

1.  **Inicie o Servidor de Desenvolvimento:**
    No terminal, dentro da pasta do projeto, execute o comando:

    ```bash
    npx expo start
    ```

    Este comando iniciará o servidor Metro Bundler. Após alguns segundos, ele exibirá um **QR Code** no seu terminal e abrirá uma aba no seu navegador com as ferramentas de desenvolvedor.

2.  **Prepare seu Celular:**

      - **IMPORTANTE:** Certifique-se de que seu computador e seu celular estão conectados **exatamente na mesma rede Wi-Fi**. Esta é a causa mais comum de problemas de conexão.
      - Abra o aplicativo **Expo Go** que você instalou previamente.

3.  **Escaneie o QR Code:**

      - **No Android:** Dentro do Expo Go, vá para a aba "Scan" (ou "Escanear") e aponte a câmera do celular para o QR Code que apareceu no seu terminal.
      - **No iOS (iPhone):** Abra o aplicativo de **Câmera** padrão do seu iPhone e aponte-a para o QR Code. Uma notificação aparecerá no topo da tela, toque nela para abrir o projeto no Expo Go.

4.  **Aguarde o Carregamento:**
    O Expo Go começará a baixar o *bundle* JavaScript do seu computador. Este processo pode levar de alguns segundos a um minuto na primeira vez.

Pronto\! O aplicativo Health Connect será aberto no seu celular e será recarregado automaticamente toda vez que você salvar uma alteração no código.

## 📂 Estrutura de Pastas

Uma visão geral da organização do projeto:

  - **/app**: Contém todos os arquivos de rota, gerenciados pelo Expo Router.
      - **(auth)/**: Grupo de rotas públicas (Login, Cadastro).
      - **(app)/**: Grupo de rotas privadas, acessíveis apenas após a autenticação.
  - **/src**: Contém a maior parte do código-fonte da aplicação.
      - **/components**: Componentes reutilizáveis (botões, inputs, etc.).
      - **/context**: Provedores de contexto para gerenciamento de estado global.
      - **/services**: Lógica de comunicação com APIs externas.
      - **/assets**: Imagens, fontes e outros arquivos estáticos.

<!-- end list -->

```
```
