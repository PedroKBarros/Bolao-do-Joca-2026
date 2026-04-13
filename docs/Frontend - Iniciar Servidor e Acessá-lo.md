# Frontend - Iniciar Servidor e Acessá-lo

## Contexto:

O ES Modules é uma das formas de tornar importável funções, variáveis e constantes de um arquivo JavaScript.
No backend utilizamos "module.export" para tornar importáveis funções, variáveis e constantes. Porém, essa forma é exclusiva do Node.js. Portanto, não é passível de ser utilizada no front-end.

## Consequência do Uso de ES Modules e Como Iniciar o Servidor:

Devido ao uso de ES Modules em alguns arquivos Javascript do front-end, para podermos testar as páginas no ambiente de desenvolvimento, é necessário utilizar o Live Server, extensão do VS Code.
Com ela instalada basta:
1. Clicar em "Go Live", opção do Live Server que costuma estar disponível na parte inferior direita do VS Code
Provavelmente será aberto um navegador com url indicando endereço "0.0.0.0:5500"
Observação: o host do Live Server foi configurado para "0.0.0.0". Isso foi feito para permitir que dispositivos externos conectados a mesma rede wi-fi do dispositivo que iniciou o Live Server, consigam acessar o servidor, tornando-se útil para testar a aplicação web em smarthphones e outros dispositivos.
2. Alterar endereço para 127.0.0.1:5500 ou localhost:5500
3. Acessar a página do front-end desejada 

## Acessando Servidor por Dispositivo Externo:

Para acessar o servidor por host diferente do host que iniciou o Live Server, é necessário que:
1. Ambos os hosts estejam na mesma rede wi-fi
2. Live Server esteja com IP do host configurado para "0.0.0.0" (Ir em Settings do VSCode e pesquisar por "liveServer.settings.host")
3. Acesse o servidor usando o IP do host que iniciou o Live Server + a porta do Live Server (geralmente é a 5500)

Caso ocorra timeout ao tentar acessar o servidor pelo host externo, adicione regra no Firewall para permitir acesso a porta utilizada pelo Live Server (por padrão é a 5500). No Windows, faça:

1. Abra Painel de Controle → Sistema e Segurança → Windows Defender Firewall → Configurações Avançadas
2. Clique em Regras de Entrada → Nova Regra
3. Tipo de regra: Porta
4. Protocolo: TCP
5. Porta específica: 5500
6. Ação: Permitir a conexão
7. Perfis: marque Domínio, Privado, Público
8. Nome: Live Server 5500
9. Conclua

Caso o problema persista, outra possível causa é que o Firewall esteja bloqueando o aplicativo, ou seja, o VS Code. No Windows, faça:
1. Abra Windows Defender Firewall
2. Clique Permitir um aplicativo pelo firewall
3. Permita Node.js e VS Code

Caso o problema continue persistindo, é possível que a rede possua alguma configuração que isola os dispositivos a ela conectados (AP Isolation / Client Isolation). Nesse caso, como uma das soluções possíveis, faça:
1. Crie um hotspot no dispositivo que iniciou o Live Server
   No Windows vá em: Windows → Configurações → Rede e Internet → Hotspot móvel
2. Conecte o dispositivo externo a ele
3. Tente acessar novamente o servidor

Caso o problema ainda assim persista, revise todas as soluções realizadas e, caso não encontre nenhum problema, faça uma oração para São Computação!!!