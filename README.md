# Como colocar o Portal de Acertos no ar — passo a passo

Este guia parte do zero. Não precisa saber nada além do que está escrito aqui.

A ideia geral, em uma frase: **o site (as páginas HTML) fica hospedado de graça
no GitHub, e os dados que você salva ficam guardados de graça no Firebase
(um serviço do Google).** São duas "casas" diferentes, e vamos configurar as
duas.

---

## Antes de começar: um aviso importante

Os dados que essas ferramentas salvam envolvem informações funcionais de
servidores (nome, matrícula, valores). Antes de usar isso com dados **reais**
de servidores do IBRAM, vale alinhar com a DTI/setor de TI do órgão, porque
tecnicamente o dado passaria a ficar num serviço fora da infraestrutura do
GDF. Enquanto isso não estiver formalizado, trate o portal como uma
ferramenta de cálculo — e, se for salvar algo, prefira salvar só os números
do cálculo, sem nome/matrícula reais, até ter isso resolvido.

---

## Parte 1 — Colocar o site no ar (GitHub Pages)

### Passo 1 — Criar conta no GitHub
1. Acesse **github.com** e clique em "Sign up".
2. Crie a conta com seu e-mail, um nome de usuário e uma senha.

### Passo 2 — Criar o repositório (a "pasta" do seu projeto)
1. Logado no GitHub, clique no `+` no canto superior direito → **New repository**.
2. Dê o nome `portal-acertos`.
3. Marque como **Public** (precisa ser público para o Pages funcionar de graça).
4. Clique em **Create repository**.

### Passo 3 — Subir os arquivos
Você recebeu uma pasta chamada `portal-acertos` com estes arquivos:
```
portal-acertos/
├── index.html                          → página principal (o menu)
├── login.html                          → tela de login
├── assets/
│   ├── firebase-config.js              → você vai preencher no Passo 6
│   └── firebase-init.js                → já pronto, não mexe
└── modulos/
    └── EXEMPLO-integracao.html         → exemplo de como plugar seus HTMLs reais
```
Na página do repositório que você criou, clique em **uploading an existing
file**, arraste essa pasta inteira (ou os arquivos um a um mantendo a mesma
estrutura de pastas) e clique em **Commit changes**.

Depois, copie os seus 4 arquivos reais (o `Acerto_Brigadistas_1_25.html` e os
outros três) para dentro da pasta `modulos/`, com os nomes usados no
`index.html`:
- `modulos/brigadistas.html`
- `modulos/comissionado-sem-vinculo.html`
- `modulos/comissionado-com-vinculo.html`
- `modulos/efetivos.html`

### Passo 4 — Ativar o GitHub Pages
1. No repositório, vá em **Settings** → **Pages** (menu à esquerda).
2. Em "Branch", selecione `main` e a pasta `/ (root)`.
3. Clique em **Save**.
4. Espere 1–2 minutos. O GitHub vai te dar uma URL parecida com:
   `https://seu-usuario.github.io/portal-acertos/`

Isso já é o site no ar — mas o botão "Salvar" ainda não funciona, porque
falta a Parte 2.

---

## Parte 2 — Criar o banco de dados (Firebase)

### Passo 5 — Criar o projeto no Firebase
1. Acesse **console.firebase.google.com** (use sua conta Google).
2. Clique em **Adicionar projeto** (ou "Add project").
3. Dê um nome, ex: `portal-acertos-ibram`.
4. Pode desativar o Google Analytics (não precisa dele) e clicar em **Criar
   projeto**.

### Passo 6 — Pegar a configuração e colar no arquivo
1. Dentro do projeto, clique no ícone `</>` (Web) para "adicionar um app da
   Web".
2. Dê um apelido, ex: `portal-web`, e clique em **Registrar app**.
3. O Firebase vai mostrar um bloco de código com algo assim:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "portal-acertos-ibram.firebaseapp.com",
     projectId: "portal-acertos-ibram",
     storageBucket: "portal-acertos-ibram.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
4. Copie **só os valores** (o que está entre aspas) e cole no arquivo
   `assets/firebase-config.js` do seu projeto, substituindo cada
   `"COLE_AQUI"`.
5. Suba esse arquivo atualizado no GitHub (Passo 3, de novo, só esse arquivo).

### Passo 7 — Ativar o banco de dados (Firestore)
1. No menu à esquerda do Firebase, clique em **Firestore Database**.
2. Clique em **Criar banco de dados**.
3. Escolha **Iniciar em modo de produção** (mais seguro) e a região
   `southamerica-east1` (São Paulo — mais rápido para o Brasil).
4. Clique em **Ativar**.

### Passo 8 — Ativar o login (Authentication)
1. No menu à esquerda, clique em **Authentication** → **Get started**.
2. Na aba "Sign-in method", clique em **E-mail/senha** e ative.
3. Vá na aba **Users** → **Add user**.
4. Cadastre seu próprio e-mail e uma senha — é com isso que você vai entrar
   no portal (não é a sua conta do Google, é uma conta separada só para o
   sistema).

### Passo 9 — Proteger o banco de dados (regras de segurança)
Isso impede que qualquer pessoa na internet leia ou grave dados no seu banco.
1. No Firestore, vá na aba **Regras** ("Rules").
2. Apague o que estiver lá e cole isto:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
3. Clique em **Publicar**. Isso diz: "só deixa ler ou gravar quem estiver
   logado".

---

## Parte 3 — Testar

1. Acesse a URL do GitHub Pages (`https://seu-usuario.github.io/portal-acertos/`).
2. A bolinha no topo deve ficar verde: "conectado ao banco de dados".
3. Abra `modulos/EXEMPLO-integracao.html` pela URL do site (não abrindo o
   arquivo direto no computador — tem que ser pela URL publicada).
4. Vai pedir login → use o e-mail/senha que você criou no Passo 8.
5. Preencha os campos de teste e clique em "Salvar acerto". Deve aparecer na
   lista logo abaixo.

Se funcionou aqui, o padrão é o mesmo para plugar dentro dos seus 4 HTMLs
reais — copiando as 3 partes marcadas no `EXEMPLO-integracao.html`.

---

## Como funciona por dentro, resumindo

- `firebase-config.js` = a "chave" que diz ao seu site qual projeto do
  Firebase ele deve usar.
- `firebase-init.js` = tem as funções prontas `salvarAcerto()`,
  `listarAcertos()` e `login()` — você só chama elas, não precisa reescrever.
- Cada acerto salvo vira um registro no banco com um campo `tipo`
  (`brigadista`, `comissionado_sem_vinculo`, `comissionado_com_vinculo` ou
  `efetivo`), então dá pra guardar os 4 tipos no mesmo lugar e depois filtrar
  por tipo na hora de listar.

## Próximo passo

Quando você tiver feito os Passos 1 a 9 e testado o exemplo, me avise e eu
te ajudo a plugar essas 3 partes dentro do `Acerto_Brigadistas_1_25.html` de
verdade — aí é só repetir para os outros três.
