Conversao do site para APK com Expo

O projeto Expo foi criado na pasta expo-app e usa WebView para abrir seu site HTML/CSS/JS dentro do app.

Arquitetura
- App React Native: expo-app/App.js
- Conteudo web embutido: expo-app/app/webContent.js
- Script de atualizacao: expo-app/scripts/build-web-content.mjs

Fluxo para gerar APK
1. Instale Node.js LTS (se ainda nao tiver)
2. Abra terminal na pasta expo-app
3. Rode: npm install
4. Rode: npm run build:webcontent
5. Rode: npx expo start (teste local)
6. Faça login na Expo: npx expo login
7. Gere APK de teste: npx eas build -p android --profile preview

Observacoes importantes
- Sempre que mudar index.html, CSS/style.css ou JS/script.js, rode novamente npm run build:webcontent.
- O perfil preview em eas.json foi configurado para gerar APK.
- O perfil production gera AAB para Play Store.
