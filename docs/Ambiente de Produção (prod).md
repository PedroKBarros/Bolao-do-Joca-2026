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

### Proc 16 - Colocar a Aplicação no Ar:
Pré-condições:
* Estar conectado a VPS via terminal;
* Aplicação estar fora do ar por interrupção do nginx e do pm2.

1. **EXECUTAR:** ```sudo systemctl start nginx```
2. **EXECUTAR:** ```pm2 start app-backend``` **OU** ```pm2 restart app-backend```
3. **EXECUTAR:** *Procedimento 3*
4. **EXECUTAR:** *Procedimento 7*

## Diferenças entre o ambiente de produção e o ambiente de desenvolvimento:

* Produção não utiliza CORs, pois tanto o frontend quanto o backend rodam em uma mesma porta;
* Produção não utiliza nodemon para executar o backend. Ao invés disso, ela utiliza nginx.
* Não executamos testes em produção!