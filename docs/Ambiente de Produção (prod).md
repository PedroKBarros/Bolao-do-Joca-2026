# Ambiente de Produção (prod)

## Introdução:
O ambiente de produção, abreviado como "prod" nos arquivos de configuração da aplicação, é o ambiente hospedado na VPS de IP 2.25.130.138 (servidor da Hostinger).

## Local do Projeto:
O projeto está localizado em:
/var/www/app
Pasta: /BJ-2026

## Tecnologias Utilizadas:

* Frontend: Boostrap 5, HTML 5, CSS 3 e Javascript;
* Backend: Node.js, Express, JWT, bcrypt, cookie-parser, cors, dotenv, jsonwebtoken, mysql12
* Base de Dados: MYSQL
* Testes: -
* Infra: 
*    SO servidor/VPS: Ubuntu server 24.04 LTS
*    Gerenciador de processos do Node.js: PM2
*    Gerenciador do Servidor Web e Proxy Reverso: nginx
*    Configuração Firewall: Uncomplicated Firewall (UFW)
*    Utilização de Protocolo HTTPS: Certbot e Let's Encrypt     

## Arquitetura:

Internet
   ↓
HTTPS
   ↓
Nginx
   ├── Frontend estático
   └── /api → Node.js + Express (127.0.0.1:3000)
                          ↓
                        MySQL

## Endereços do Frontend e do Backend:
* Frontend: 127.0.0.1:3000
* Backend: 127.0.0.1:3000
* URL Internet: https://bjcdm.tech

## Uso de CORs:
Não utiliza.

## Bases de Dados:
Possui 1 base de dados MySQL dedicada exclusivamente para os usuários finais da aplicação.
* Nome base: bj_2026
* Tipo de conexão: via pool
* Limite de conexões: 10
* Limite de Fila: 0
* Porta: 3306

## Procedimentos:

### Procedimentos Recorrentes:
* Proc 14 -> 1x / dia, entre 06h às 09h
* Proc 2B -> 1x / semana, entre 00h e 05h

### Proc 1 - Conectar-se com o Servidor/VPS:
Pré-condições:
* Terminal aberto.

Observações:
* O servidor possui o usuário "root" e o usuário "deploy". Na maioria dos casos, conectar-se com usuário "deploy".

Passos:
1. **EXECUTAR:** realizar conexão via SSH:
```ssh deploy@2.25.130.138```
1. **EXECUTAR:** Informar a senha (consultar KeePass) e confirmar

*OBSERVAÇÃO: execute ```exit``` para sair da seção.*

### Proc 2A - Reiniciar Ubuntu Server:
Pré-condições:
* Estar conectado a VPS via terminal.

Observações: -

Passos:
1. **EXECUTAR:** Reiniciar servidor: ```sudo reboot```
2. **AGUARDAR:** 3 minutos
3. **EXECUTAR:** *Procedimento Proc 1*
4. **EXECUTAR:** *Procedimento Proc 3*

### Proc 2B - Atualizar Ubuntu Server:
Pré-condições:
* Estar conectado a VPS via terminal.

Observações: -

Passos:
1. **EXECUTAR:** ```sudo apt update```
2. **EXECUTAR:** ```sudo apt upgrade -y```
3. **EXECUTAR:** *Procedimento 2A*

### Proc 2C - Ver Processos:
Pré-condições:
* Estar conectado a VPS via terminal.

Observações: -

Passos:
1. **EXECUTAR:** ```top```

### Proc 2D - Ver Espaço em Disco:
Pré-condições:
* Estar conectado a VPS via terminal.

Observações: -

Passos:
1. **EXECUTAR:** ```df -h```

### Proc 3 - Checar Se o PM2 Está Sendo Executado Corretamente:
Pré-condições:
* Estar conectado a VPS via terminal.

Observações: -

Passos:
1. **EXECUTAR:** ```pm2 status```
2. **VERIFICAR:** Status retornado deve ser "Online"
3. **SE:** status não é igual a "Online"
   **ENTÃO:** **EXECUTAR:** *Procedimento Proc 4*

### Proc 4 - Executar PM2 Manualmente:
Pré-condições:
* Proc 3 ter sido executado.
* Estar conectado a VPS via terminal.

Observações: -

Passos:
**SE:** o comando pm2 status não exibiu processos **E** isso ocorreu após reiniciar o servidor:
**ENTÃO:**
  1. **EXECUTAR:** ```pm2 resurrect```
  2. **EXECUTAR:** *Procedimento Proc 3*
  3. **SE:** o comando pm2 continuou sem exibir processos:
    4. **EXECUTAR:** ```pm2 startup```
    5. **EXECUTAR:** comando que ele retornar
    *OBSERVAÇÃO: o comando deve ser semelhante a 'sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy'*
    6. **EXECUTAR:** ```pm2 save```
    7. **EXECUTAR:** *Procedimento Proc 3*
**SENÃO:**
1. **EXECUTAR:** ```pm2 restart app-backend``` **OU** ```pm2 start app-backend```

### Proc 5 - Checar Se o MySQL Server Está Sendo Executado Corretamente:
Pré-condições:
* Estar conectado a VPS via terminal.

Observações: -

Passos:
1. **EXECUTAR:** ```sudo systemctl status mysql```
2. **VERIFICAR:** Deve retornar "Active: active (running)"
3. **SE:** seja igual a "inactive" ou "failed"
   **ENTÃO:** **EXECUTAR:** *Procedimento Proc 6*
   **OU SE:** seja igual a "activating" ou "deactivating"
   **ENTÃO:** **AGUARDAR:** aguardar 3 minutos **E** **EXECUTAR:** retornar ao *Passo 1*

### Proc 6 - Iniciar MySQL Server Manualmente:
Pré-condições:
* Proc 5 ter sido executado.
* Estar conectado a VPS via terminal.

Observações: -

Passos:
1. **EXECUTAR:** ```sudo systemctl start mysql```
2. **EXECUTAR:** ```sudo systemctl enable mysql``` para executar automaticamente durante os boot
3. **EXECUTAR:** *Procedimento 5*

### Proc 7 - Checar Se o NGINX Está Sendo Executado Corretamente:
Pré-condições:
* Estar conectado a VPS via terminal.

Observações: -

Passos:
1. **EXECUTAR:** ```sudo systemctl status nginx```
2. **VERIFICAR:** Deve retornar "Active: active (running)"
3. **SE:** seja igual a "inactive" ou "failed"
   **ENTÃO:** **EXECUTAR:** *Procedimento Proc 8*
   **OU SE:** seja igual a "activating" ou "deactivating"
   **ENTÃO:** **AGUARDAR:** aguardar 3 minutos **E** **EXECUTAR:** retornar ao *Passo 1*

### Proc 8A - Analisar Falha no NGINX:
Pré-condições:
* Estar conectado a VPS via terminal.

Observações: -

Passos:
1. **EXECUTAR:** Realizar teste de conexão ```sudo nginx -t```
2. **VERIFICAR:** Deve retornar "syntax is ok" e "test is successful"
3. **SE:** retorno indicar erro, provavelmente é erro no arquivo de configurações do NGINX
*OBSERVAÇÃO: o arquivo de configurações do NGINX está alocado em "/etc/nginx/sites-available/bj2026"*
   **ENTÃO:** **EXECUTAR:** analise o arquivo **E** corrigir arquivo **E** **EXECUTE:** *Procedimento Proc 8B*
   **OU SE:** retorno indicou outro tipo de erro.
   **ENTÃO:** **EXECUTAR:** ```sudo journalctl -u nginx -n 50``` para obter logs
   **E** **EXECUTAR:** continuar análise até que causa do problema seja descoberta 
   **E** **EXECUTAR:** realizar correção **E** **EXECUTAR:** *Procedimento Proc 8B*

### Proc 8B - Executar NGINX Manualmente:
Pré-condições:
* Proc 8A ter sido executado.
* Estar conectado a VPS via terminal.

Observações: -

Passos:
1. **SE:** NGINX não estiver parado
   **EXECUTAR:** ```sudo systemctl stop nginx```
   **E** **EXECUTAR:** ```sudo systemctl start nginx```
2. **EXECUTAR:** ```sudo systemctl enable nginx``` para configurar auto start durante boot
3. **EXECUTAR:** *Procedimento 7*

### Proc 9 - Checar Se UFW (utilitário Firewall) Está Rodando:
Pré-condições:
* Estar conectado a VPS via terminal.

Observações: -

Passos:
1. **EXECUTAR:** ```sudo ufw status verbose```
2. **VERIFICAR:** Deve retornar
   Status: active

   Default: deny (incoming), allow (outgoing)

   To                         Action      From
   --                         ------      ----
   22/tcp (OpenSSH)           ALLOW IN    Anywhere
   80,443/tcp (Nginx Full)    ALLOW IN    Anywhere
3. **SE:** status não for igual a "active"
   **ENTÃO:** **EXECUTAR:** *Procedimento Proc 10*

### Proc 10 - Executar Manualmente o UFW (utilitário Firewall):
Pré-condições:
* Proc 9 ter sido executado.
* Estar conectado a VPS via terminal.

Observações: -

Passos:
1. **EXECUTAR:** ```sudo ufw allow OpenSSH```
*OBSERVAÇÃO: o SSH liberado é importante para não perder acesso a VPS.*
2. **EXECUTAR:** ```sudo ufw enable```
3. **EXECUTAR:** *Procedimento 9*

### Proc 11 - Checar Se Portas Estão Protegidas:
Pré-condições:
* Estar conectado a VPS via terminal.

Observações: -

Passos:
1. **EXECUTAR:** ```nmap bjcmd.tech```
2. **VERIFICAR:** Deve retornar somente "22, 80 e 443"
3. **EXECUTAR:** ```nmap 2.25.130.138```
4. **VERIFICAR:** Deve retornar somente "22, 80 e 443"
*OBSERVAÇÃO: esses retornos são as únicas portas que deveriam estar públicas. Jamais deve aparecer 3000 ou 3306.*

### Proc 12 - Procedimento para Detecção e Correção da Causa da Aplicação Offline:
Pré-condições:
* Estar conectado a VPS via terminal.

Observações: -

Passos:
1. **EXECUTAR:** *Procedimento 7*
2. **EXECUTAR:** *Procedimento 3*
3. **EXECUTAR:** ```curl http://127.0.0.1:3000/api```
4. **VERIFICAR:** deve indicar que backend está acessível
5. **EXECUTAR:** acessar aplicação via browser (bjcmd.tech)
6. **VERIFICAR:** frontend deve estar acessível

### Proc 13 - Procedimento Padrão de Deploy:
Pré-condições:
* Estar conectado a VPS via terminal.
* Branch do repositório remoto contendo os commits necessários.
* Caso o deploy não envolva correção emergencial, realizá-lo a partir das 00:00h

Observações: -

Passos:
1. **EXECUTAR:** ```Git pull```
2. **EXECUTAR:** ```npm install``` para instalar possíveis novas dependências
3. **EXECUTAR:** ```pm2 restart app-backend``` para reiniciar backend

### Proc 14 - Checagem Matutina do Estado da VPS e da Aplicação:
1. **EXECUTAR:** *Procedimento 3*
2. **EXECUTAR:** *Procedimento 5*
3. **EXECUTAR:** *Procedimento 7*
4. **EXECUTAR:** *Procedimento 9*
5. **EXECUTAR:** *Procedimento 11*
6. **EXECUTAR:** acessar aplicação via browser (bjcmd.tech)
7. **VERIFICAR:** frontend deve estar acessível

### Proc 15 - Tirar a Aplicação do Ar Temporariamente:
Pré-condições:
* Estar conectado a VPS via terminal;
* Ambiente de produção estar acessível (pm2 e nginx sendo executados corretamente).

1. **EXECUTAR:** ```sudo systemctl stop nginx```
2. **EXECUTAR:** ```pm2 stop app-backend```
3. **VERIFICAR:** aplicação não deve estar acessível via https://bjcdm.tech
*OBSERVAÇÃO: O domínio continuará existindo, mas qualquer acesso a https://bjcdm.tech falhará porque não haverá nenhum serviço escutando nas portas 80 e 443.*

### Proc 16 - Colocar a Aplicação no Ar Após Ter Sido Tirada do Ar Temporariamente:
Pré-condições:
* Estar conectado a VPS via terminal;
* Proc. 15 ter sido executado.

1. **EXECUTAR:** ```sudo systemctl start nginx```
2. **EXECUTAR:** ```pm2 start app-backend``` **OU** ```pm2 restart app-backend```
3. **EXECUTAR:** *Procedimento 3*
4. **EXECUTAR:** *Procedimento 7*

Escrita

### Proc 15 - Tirar a Aplicação do Ar por Tempo Indeterminado:

**Pré-condições:**

* Estar conectado à VPS via terminal;
* Ambiente de produção estar acessível (pm2 e nginx sendo executados corretamente). 

**Observações:**

- O NGINX e o PM2 devem permanecer instalados e disponíveis para utilização futura;
- O NGINX deve continuar habilitado para inicialização automática;
- O arquivo de configuração `/etc/nginx/sites-available/bj2026` deve ser preservado para permitir a reativação futura da aplicação;
- O backend da aplicação é identificado no PM2 pelo nome `app-backend` e utiliza a porta `3000`.

**Passos:**

1. **EXECUTAR:** verificar as configurações habilitadas no NGINX:```
   ls -l /etc/nginx/sites-enabled/
   ```
2. **EXECUTAR:** remover o link simbólico responsável por habilitar a publicação de `bjcdm.tech`:```
   sudo unlink /etc/nginx/sites-enabled/bj2026
   ```
3. **EXECUTAR:** validar as configurações do NGINX:```
   sudo nginx -t
   ```
4. **VERIFICAR:** o comando deve retornar `syntax is ok` e `test is successful`.
   - **SE:** o comando indicar erro. **ENTÃO:** **EXECUTAR:** analisar e corrigir o problema antes de prosseguir.
5. **VERIFICAR:** o NGINX está em execução:```
   sudo systemctl is-active nginx
   ```
   - **SE:** retornar `inactive`. **ENTÃO:** **EXECUTAR:** iniciar o serviço:```
     sudo systemctl start nginx
     ```
   - **SE:** retornar `active`. **ENTÃO:** **EXECUTAR:** recarregar a configuração:```
     sudo systemctl reload nginx
     ```
6. **VERIFICAR:** a inicialização automática do NGINX permanece habilitada:```
   sudo systemctl is-enabled nginx
   ```
   - **VERIFICAR:** o retorno deve ser `enabled`.
   - **OBSERVAÇÃO:** não executar `systemctl disable nginx`, `systemctl mask nginx` ou `systemctl stop nginx`, pois o serviço deverá permanecer disponível para aplicações futuras.
7. **EXECUTAR:** verificar os processos gerenciados pelo PM2, utilizando o usuário Linux responsável pelo backend:```
   pm2 list
   ```
8. **EXECUTAR:** remover o backend da lista de processos do PM2:```
   pm2 delete app-backend
   ```
9. **EXECUTAR:** salvar a lista atualizada de processos:```
   pm2 save
   ```
10. **OBSERVAÇÃO:** não executar `pm2 unstartup`, pois a configuração de inicialização automática do PM2 deve ser preservada para uso futuro.
11. **VERIFICAR:** confirmar que o backend não aparece mais na lista do PM2:```
    pm2 list
    ```
12. **VERIFICAR:** confirmar que não há processos escutando na porta `3000`:```
    sudo ss -lntp | grep ':3000'
    ```
    - **VERIFICAR:** não deve haver saída, desde que a porta `3000` seja exclusiva do backend.
    - **SE:** houver saída. **ENTÃO:** **EXECUTAR:** identificar o processo responsável e investigar se existe outro mecanismo mantendo o backend em execução.
13. **VERIFICAR:** confirmar que a configuração `bj2026` não está mais habilitada:```
    ls -l /etc/nginx/sites-enabled/
    ```
    - **VERIFICAR:** o link simbólico `bj2026` não deve aparecer.
    - **OBSERVAÇÃO:** o arquivo `/etc/nginx/sites-available/bj2026` deve permanecer preservado.
14. **EXECUTAR:** verificar se existem scripts, serviços do `systemd`, agendamentos ou rotinas de deploy que possam iniciar novamente o backend.
    - **SE:** houver algum mecanismo de inicialização automática específico do `app-backend`. **ENTÃO:** **EXECUTAR:** corrigir ou desabilitar somente esse mecanismo, preservando a inicialização automática do PM2 para uso futuro.
15. **EXECUTAR:** testar a disponibilidade do domínio a partir de uma máquina externa à VPS:```
    curl -I --max-time 10 https://bjcdm.tech
    ```
    - **VERIFICAR:** a aplicação não deve estar acessível pelo domínio.
    - **OBSERVAÇÃO:** uma resposta HTTP pode indicar que outro servidor ou uma configuração padrão está atendendo à requisição. Investigar se necessário.
16. **VERIFICAR:** registrar a conclusão do procedimento somente após confirmar que:
    - O NGINX permanece `active` e `enabled`;
    - O link simbólico `bj2026` não existe em `/etc/nginx/sites-enabled/`;
    - O processo `app-backend` não consta na lista salva do PM2;
    - Não há outro mecanismo conhecido que reinicie automaticamente o backend;
    - A aplicação não está acessível pelo domínio público.

**Observação final:** o procedimento preserva o código-fonte, os dados, o arquivo de configuração do NGINX e os certificados TLS. Para reativar a aplicação futuramente, será necessário habilitar novamente o site no NGINX e iniciar o backend conforme o procedimento de deploy do projeto.

Escrita

### Proc 16 - Reativar a Aplicação Após Executar o Proc 15:

**Pré-condições:**

- Estar conectado à VPS via terminal;
- O código-fonte da aplicação estar disponível em `/var/www/app/BJ-2026/`;
- O arquivo de configuração do NGINX estar preservado em `/etc/nginx/sites-available/bj2026`;
- Conhecer o procedimento de inicialização do backend Node.js;
- Possuir os certificados TLS necessários para o domínio `bjcdm.tech`.

**Observações:**

- O NGINX e o PM2 devem permanecer instalados;
- O procedimento Proc 15 remove o backend da lista de processos do PM2 e desabilita a configuração do site no NGINX, mas preserva os arquivos da aplicação;
- A aplicação utiliza a porta `3000` para o backend e o NGINX para publicar o frontend e encaminhar as requisições `/api/`;
- O procedimento deve ser executado na ordem apresentada, para evitar a publicação do site antes de o backend estar funcional.

**Passos:**

1. **EXECUTAR:** verificar se o NGINX está instalado e disponível:```
   sudo systemctl status nginx --no-pager
   ```
2. **SE:** o NGINX estiver parado. **ENTÃO:** **EXECUTAR:** iniciar o serviço:```
   sudo systemctl start nginx
   ```
3. **VERIFICAR:** confirmar que o NGINX está ativo:```
   sudo systemctl is-active nginx
   ```
   - **VERIFICAR:** o retorno deve ser `active`.
   - **SE:** o serviço não iniciar. **ENTÃO:** **EXECUTAR:** analisar os logs:```
     sudo journalctl -u nginx -n 50 --no-pager
     ```
     **E** **EXECUTAR:** corrigir a causa do problema antes de prosseguir.
4. **EXECUTAR:** verificar se o backend já está em execução:```
   pm2 list
   ```
   - **SE:** `app-backend` já estiver listado e funcionando. **ENTÃO:** prosseguir para a etapa 7.
   - **SE:** `app-backend` não estiver listado. **ENTÃO:** prosseguir para a etapa 5.
5. **EXECUTAR:** acessar o diretório do backend e iniciar a aplicação conforme o procedimento de deploy do projeto.
   - **OBSERVAÇÃO:** utilizar o comando de inicialização já definido no projeto, respeitando as variáveis de ambiente, dependências e configurações de produção.
   - **OBSERVAÇÃO:** se o projeto utilizar um arquivo `ecosystem.config.js`, poderá ser necessário executar o comando correspondente:```
     pm2 start ecosystem.config.js
     ```
     **ATENÇÃO:** executar esse comando somente se o arquivo existir e estiver configurado corretamente para iniciar o backend `app-backend`.
6. **EXECUTAR:** salvar a lista atualizada de processos do PM2:```
   pm2 save
   ```
7. **VERIFICAR:** confirmar que o backend está em execução:```
   pm2 list
   ```
   - **VERIFICAR:** o processo `app-backend` deve aparecer com estado `online`.
   - **EXECUTAR:** verificar se existe um processo escutando na porta `3000`:```
     sudo ss -lntp | grep ':3000'
     ```
   - **SE:** o backend não estiver funcionando. **ENTÃO:** **EXECUTAR:** analisar os logs:```
     pm2 logs app-backend --lines 50
     ```
     **E** **EXECUTAR:** corrigir a causa do problema antes de prosseguir.
8. **EXECUTAR:** reabilitar a configuração do site no NGINX:```
   sudo ln -s /etc/nginx/sites-available/bj2026 /etc/nginx/sites-enabled/bj2026
   ```
   - **OBSERVAÇÃO:** executar somente se o link simbólico ainda não existir.
   - **SE:** o link já existir. **ENTÃO:** não executar novamente o comando.
9. **EXECUTAR:** validar a configuração do NGINX:```
   sudo nginx -t
   ```
   - **VERIFICAR:** o comando deve retornar `syntax is ok` e `test is successful`.
   - **SE:** houver erros. **ENTÃO:** **EXECUTAR:** corrigir os problemas antes de prosseguir. Não recarregar o NGINX enquanto a configuração for inválida.
10. **EXECUTAR:** recarregar o NGINX para habilitar a publicação da aplicação:```
    sudo systemctl reload nginx
    ```
11. **VERIFICAR:** confirmar que o NGINX está ativo:```
    sudo systemctl is-active nginx
    ```
    - **VERIFICAR:** o retorno deve ser `active`.
12. **EXECUTAR:** verificar se o NGINX está escutando nas portas HTTP e HTTPS:```
    sudo ss -lntp | grep -E ':(80|443)\b'
    ```
    - **OBSERVAÇÃO:** a presença das portas depende das diretivas `listen` e da configuração efetivamente carregada pelo NGINX.
13. **EXECUTAR:** testar a disponibilidade do domínio:```
    curl -I --max-time 10 https://bjcdm.tech
    ```
    - **VERIFICAR:** o domínio deve responder conforme a configuração da aplicação.
    - **OBSERVAÇÃO:** um retorno HTTP `200`, `301`, `302` ou outro código não representa necessariamente uma falha; verificar se o comportamento é compatível com o esperado para a aplicação.
14. **EXECUTAR:** validar o funcionamento do frontend e do backend:
    - **VERIFICAR:** acessar `https://bjcdm.tech` em um navegador;
    - **VERIFICAR:** confirmar que o frontend é exibido corretamente;
    - **VERIFICAR:** executar uma operação que dependa da API e confirmar que o backend responde adequadamente.
15. **VERIFICAR:** confirmar que a inicialização automática está habilitada para os serviços necessários:```
    sudo systemctl is-enabled nginx
    ```
    - **VERIFICAR:** o retorno deve ser `enabled`.
    - **OBSERVAÇÃO:** se a inicialização automática do PM2 estiver configurada, confirmar que o processo `app-backend` foi salvo com `pm2 save` e que o mecanismo de inicialização do PM2 permanece habilitado.
16. **VERIFICAR:** registrar a conclusão do procedimento somente após confirmar que:
    - O backend `app-backend` está em execução no PM2;
    - O backend responde na porta `3000`;
    - A configuração `bj2026` está habilitada no NGINX;
    - O NGINX está ativo e atendendo às portas configuradas;
    - O frontend e as operações da API funcionam por meio de `https://bjcdm.tech`.

**Observação final:** este procedimento reativa a aplicação preservada pelo Proc 15. Caso o backend não possa ser iniciado pelo comando previsto no projeto, consultar o procedimento de deploy antes de realizar alterações adicionais.

## Diferenças entre o ambiente de produção e o ambiente de desenvolvimento:

* Produção não utiliza CORs, pois tanto o frontend quanto o backend rodam em uma mesma porta;
* Produção não utiliza nodemon para executar o backend. Ao invés disso, ela utiliza nginx.
* Não executamos testes em produção!
