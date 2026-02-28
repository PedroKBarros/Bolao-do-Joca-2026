# Backend - Configuração da Segurança de Cookies por Ambiente

Quando um usuário realiza login, um cookie contendo o token de acesso é criado no lado do cliente. A configuração "secure" do cookie muda de acordo com o ambiente, pois ela indica se o cookie pode ser ou não manipulado com HTTP. 
Quando 'true', o cookie apenas pode ser manipulado com HTTPS, o que é fundamental no ambiente de produção, mas inviabiliza os testes de api realizados no ambiente de desenvolvimento já que o supertest utiliza HTTP.
Para resolver o problema, essa configuração está dinâmica, respeitando o valor da chave "BACKEND_ENV" do .env \("dev" ou "prod"\).