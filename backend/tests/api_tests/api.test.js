const request = require('supertest');
const app = require('../../src/app.js'); // seu app Express
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const registerService = require('../../src/services/registerService.js')
require('dotenv').config();

 async function prepareDatabaseToTest(dbConnection) {
    const sqlPath = path.join(__dirname, "../../../scripts/db_delete_users_test_registration.sql");
    const query = fs.readFileSync(sqlPath, "utf-8");
    await dbConnection.query(query);
 }

 function getKeywordToRegisterUser(){
  return process.env.KEYWORD_TO_REGISTER;
 }

describe('API Tests of user registration using supertest and Jest', () => {

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
        "name": "teste",
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
        "name": "teste",
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
        "name": "teste",
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
        "name": "teste",
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
        "name": "teste",
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
        "name": "teste",
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
        "name": "teste",
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
        "name": "teste",
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
        "name": "teste",
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
        "name": "teste",
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



});