const request = require('supertest');
const app = require('../../src/app.js'); // seu app Express
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const registerService = require('../../src/services/registerService.js')
require('dotenv').config();

 async function prepareDatabaseToTest(dbConnection) {
    const sqlPath = path.join(__dirname, "../../../scripts/db_delete_users_api_tests.sql");
    const query = fs.readFileSync(sqlPath, "utf-8");
    await dbConnection.query(query);
 }

 function getKeywordToRegisterUser(){
  return process.env.KEYWORD_TO_REGISTER;
 }

 function getDefaultValidUserPassword(){
  return 'a'.repeat(registerService.MAX_PASSWORD_CHARS);
 }

 function getDefaultValidUserName(){
  return "user test";
 }

describe('User Registration', () => {

  let connection;

  beforeAll(async () => {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    prepareDatabaseToTest(connection);
    kwToRegister = getKeywordToRegisterUser();
  });

  afterAll(async () => {
    await connection.end();
  });

  test("TC1 - Do Valid User Registration", async () => {
    password = 'a'.repeat(registerService.MAX_PASSWORD_CHARS);
    const testBody = {
        "name": getDefaultValidUserName(),
        "whatsappNumber": "988776655",
        "password": password,
        "passwordConfirmation": password,
        "isAdmin": false,
        "keyword": kwToRegister
    };

    const response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(200);

    // Body
    expect(response.body).toEqual({"message": "Cadastro realizado com sucesso!"});
  });

    test("TC2 - Try register user with empty name", async () => {
    const testBody = {
        "name": "",
        "whatsappNumber": "988776655",
        "password": "123456",
        "passwordConfirmation": "123456",
        "isAdmin": false,
        "keyword": kwToRegister
    };

    const response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(400);

    // Body
    expect(response.body).toEqual({"message": "Nome não foi informado."});
  });


    test("TC3 - Try register user with empty password", async () => {
    const testBody = {
        "name": getDefaultValidUserName(),
        "whatsappNumber": "988776655",
        "password": "",
        "passwordConfirmation": "",
        "isAdmin": false,
        "keyword": kwToRegister
    };

    const response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(400);

    // Body
    expect(response.body).toEqual({"message": 'Senha tem menos de ' + registerService.MIN_PASSWORD_CHARS + 
        ' caracteres ou mais de ' + registerService.MAX_PASSWORD_CHARS + 'caracteres.'});
  });

  test("TC4 - Try register user with a big password", async () => {
    password='a'.repeat(registerService.MAX_PASSWORD_CHARS + 1);
    const testBody = {
        "name": getDefaultValidUserName(),
        "whatsappNumber": "988776655",
        "password": password,
        "passwordConfirmation": password,
        "isAdmin": false,
        "keyword": kwToRegister
    };

    const response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(400);

    // Body
    expect(response.body).toEqual({"message": 'Senha tem menos de ' + registerService.MIN_PASSWORD_CHARS + 
        ' caracteres ou mais de ' + registerService.MAX_PASSWORD_CHARS + 'caracteres.'});
  });

  test("TC5 - Try register user with a small password", async () => {
    password='a'.repeat(registerService.MIN_PASSWORD_CHARS - 1);
    const testBody = {
        "name": getDefaultValidUserName(),
        "whatsappNumber": "988776655",
        "password": password,
        "passwordConfirmation": password,
        "isAdmin": false,
        "keyword": kwToRegister
    };

    const response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(400);

    // Body
    expect(response.body).toEqual({"message": 'Senha tem menos de ' + registerService.MIN_PASSWORD_CHARS + 
        ' caracteres ou mais de ' + registerService.MAX_PASSWORD_CHARS + 'caracteres.'});
  });

  test("TC6 - Try register user with a different passwords", async () => {
    password1='a'.repeat(registerService.MIN_PASSWORD_CHARS);
    password2='a'.repeat(registerService.MIN_PASSWORD_CHARS + 1);
    const testBody = {
        "name": getDefaultValidUserName(),
        "whatsappNumber": "988776655",
        "password": password1,
        "passwordConfirmation": password2,
        "isAdmin": false,
        "keyword": kwToRegister
    };

    const response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(400);

    // Body
    expect(response.body).toEqual({"message": 'Senhas diferentes.'});
  });

  test("TC7 - Try register user with invalid Whatsapp number", async () => {
    password = 'a'.repeat(registerService.MIN_PASSWORD_CHARS);
    const testBody = {
        "name": getDefaultValidUserName(),
        "whatsappNumber": "2",
        "password": password,
        "passwordConfirmation": password,
        "isAdmin": false,
        "keyword": kwToRegister
    };

    const response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(400);

    // Body
    expect(response.body).toEqual({"message": "Número do Whatsapp não é válido."});
  });

  test("TC8 - Try register user with the same Whatsapp number used for another user", async () => {
    password = 'a'.repeat(registerService.MAX_PASSWORD_CHARS);
    const testBody = {
        "name": getDefaultValidUserName(),
        "whatsappNumber": "988776655",
        "password": password,
        "passwordConfirmation": password,
        "isAdmin": false,
        "keyword": kwToRegister
    };

    const response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(400);

    // Body
    expect(response.body).toEqual({"message": "Usuário com mesmo número de Whatsapp já cadastrado."});
  });

  test("TC9 - Do Valid User Registration with keyword in uppercase", async () => {
    password = 'a'.repeat(registerService.MAX_PASSWORD_CHARS);
    const testBody = {
        "name": getDefaultValidUserName(),
        "whatsappNumber": "999887766",
        "password": password,
        "passwordConfirmation": password,
        "isAdmin": false,
        "keyword": String(kwToRegister).toUpperCase()
    };

    const response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(200);

    // Body
    expect(response.body).toEqual({"message": "Cadastro realizado com sucesso!"});
  });

test("TC10 - Try register user with empty keyword", async () => {
    password = 'a'.repeat(registerService.MAX_PASSWORD_CHARS);
    const testBody = {
        "name": getDefaultValidUserName(),
        "whatsappNumber": "988776655",
        "password": password,
        "passwordConfirmation": password,
        "isAdmin": false,
        "keyword": ""
    };

    const response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(400);

    // Body
    expect(response.body).toEqual({"message": "Palavra-chave para realizar cadastro não foi recebida"});
  });

test("TC11 - Try register user with wrong keyword", async () => {
    password = 'a'.repeat(registerService.MAX_PASSWORD_CHARS);
    const testBody = {
        "name": getDefaultValidUserName(),
        "whatsappNumber": "988776655",
        "password": password,
        "passwordConfirmation": password,
        "isAdmin": false,
        "keyword": "xyz"
    };

    const response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(400);

    // Body
    expect(response.body).toEqual({"message": "Palavra-chave para realizar cadastro incorreta"});
  });

  test("TC12 - Do Valid Adm User Registration", async () => {
    password = 'a'.repeat(registerService.MAX_PASSWORD_CHARS);
    const testBody = {
        "name": getDefaultValidUserName(),
        "whatsappNumber": "+5521988776655",
        "password": password,
        "passwordConfirmation": password,
        "isAdmin": true,
        "keyword": kwToRegister
    };

    const response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(200);

    // Body
    expect(response.body).toEqual({"message": "Cadastro realizado com sucesso!"});
  });

});


describe('Login and Logout', () => {

  let connection;

  beforeAll(async () => {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    prepareDatabaseToTest(connection);

    //Register users that will be use in login e logout tests:
    //User that is not Adm:
    let testBody = {
        "name": getDefaultValidUserName(),
        "whatsappNumber": "998765432",
        "password": getDefaultValidUserPassword(),
        "passwordConfirmation": getDefaultValidUserPassword(),
        "isAdmin": false,
        "keyword": kwToRegister
    };

    let response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');

    //User that is Adm:
    testBody = {
        "name": getDefaultValidUserName(),
        "whatsappNumber": "21987654321",
        "password": getDefaultValidUserPassword(),
        "passwordConfirmation": getDefaultValidUserPassword(),
        "isAdmin": true,
        "keyword": kwToRegister
    };

    response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');
  });

  afterAll(async () => {
    await connection.end();
  });

  test("TC1 - Do login and logout with user not admin", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    console.log("SET-COOKIE:", response.headers['set-cookie']);

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');
      

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC2 - Do login and logout with admin user", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21987654321",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');
      
    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC3 - Try login with Whatsapp number incorret", async () => {

    let testBody = {
        "whatsappNumber": "21977777777",
        "password": getDefaultValidUserPassword()
    };

    let response = await request(app)
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(401);
    // Body
    expect(response.body).toEqual({"message": "Credenciais inválidas"});
  });

  test("TC4 - Try login with password incorret", async () => {

    let testBody = {
        "whatsappNumber": "998765432",
        "password": "abc123"
    };

    let response = await request(app)
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(401);
    // Body
    expect(response.body).toEqual({"message": "Credenciais inválidas"});
  });

  test("TC5 - Try login with Whatsapp number and password incorret", async () => {

    let testBody = {
        "whatsappNumber": "21977777777",
        "password": "abc123"
    };

    let response = await request(app)
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    // Status
    expect(response.status).toBe(401);
    // Body
    expect(response.body).toEqual({"message": "Credenciais inválidas"});
  });

});
