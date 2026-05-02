const request = require('supertest');
const app = require('../../src/app.js'); // seu app Express
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const registerService = require('../../src/services/registerService.js');
const sweepsService = require("../../src/services/sweepsService.js");

 async function prepareDatabaseToTest(dbConnection, restore_db_script_sufixe_name, addPreviousDataFuncName=null) {
    const sqlPath = path.join(__dirname, "../../../scripts/db_prepare_base_api_tests_" + restore_db_script_sufixe_name + ".sql");
    const queriesStr = fs.readFileSync(sqlPath, "utf-8");
    /*
    * Como o driver de Mysql utilizado não executa SQL
    * com múltiplas consultas (questões de segurança), 
    * é necessário fazer o parser de cada consulta contida
    * no script para depois executá-las individualmente:
    */
    const queries = queriesStr
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length); 
      
    for (const q of queries) {
      await dbConnection.query(q);
    }

    if(addPreviousDataFuncName !== null){
      await addPreviousDataFuncName();
    }
 }

 function getKeywordToRegisterUser(){
  return process.env.KEYWORD_TO_REGISTER;
 }

 function getDefaultValidUserPassword(){
  return 'a'.repeat(registerService.MAX_PASSWORD_CHARS);
 }

 function getDefaultValidUserName(){
  return "user test api";
 }

 async function addLoginAndLogoutPreviousData(){
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
 }

 async function addCreateSweepsPreviousData(){
    //Register users that will be use in create sweeps tests:

    //User that is not Adm:
    let testBody = {
        "name": getDefaultValidUserName() + " sweeps",
        "whatsappNumber": "21999876543",
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
        "name": getDefaultValidUserName() + " sweeps",
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword(),
        "passwordConfirmation": getDefaultValidUserPassword(),
        "isAdmin": true,
        "keyword": kwToRegister
    };

    response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');
 }

 async function addGetSweepsPreviousData(){
    //Register users that will be use in get sweeps tests:

    //User that is not Adm:
    let testBody = {
        "name": getDefaultValidUserName() + " get sweeps",
        "whatsappNumber": "21999876511",
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
        "name": getDefaultValidUserName() + " get sweeps",
        "whatsappNumber": "21998765411",
        "password": getDefaultValidUserPassword(),
        "passwordConfirmation": getDefaultValidUserPassword(),
        "isAdmin": true,
        "keyword": kwToRegister
    };

    response = await request(app)
      .post('/api/register')
      .send(testBody)
      .set('Accept', 'application/json');
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

    prepareDatabaseToTest(connection, "user_registration");
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

    await prepareDatabaseToTest(connection, "login_and_logout", addLoginAndLogoutPreviousData);
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


describe('Create Sweepstakes', () => {

  let connection;

  beforeAll(async () => {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    await prepareDatabaseToTest(connection, "create_sweepstakes", addCreateSweepsPreviousData);
  });

  afterAll(async () => {
    await connection.end();
  });

  test("TC1 - Do create sweepstake with admin user and with one day of participation period", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    swwepsEndDate = sweepsStarDate;
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = swwepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":sweepsService.MIN_SWEEPS_QUOTA,
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ "message": "Bolão criado com sucesso!" });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC2 - Do create sweepstake with admin user and with one more than one day of participation period", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 2",
      "sweepsKeyword":"a".repeat(sweepsService.MAX_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":sweepsService.MAX_SWEEPS_QUOTA,
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ "message": "Bolão criado com sucesso!" });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC3 - Try create sweepstake with not admin user", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21999876543",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"12345",
      "sweepsQuota":"12",
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "O usuário não é administrador. Apenas usuários administradores podem criar bolões." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC4 - Try create sweepstake with empty name", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"",
      "sweepsKeyword":"12345",
      "sweepsQuota":"12",
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "O nome do bolão não foi informado." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC5 - Try create sweepstake with a big name", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"x".repeat(sweepsService.MAX_SWEEPS_NAME_CHARS + 1),
      "sweepsKeyword":"12345",
      "sweepsQuota":"12",
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "O nome do bolão tem mais do que " + sweepsService.MAX_SWEEPS_NAME_CHARS + " caracteres." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC6 - Try create sweepstake with the same name of other sweepstake", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    swwepsEndDate = sweepsStarDate;
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = swwepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api",
      "sweepsKeyword":"12345",
      "sweepsQuota":"12",
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "Já existe bolão com esse nome cadastrado no sistema." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC7 - Try create sweepstake with empty keyword", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"",
      "sweepsQuota":"12",
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "A palavra chave não foi informada." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC8 - Try create sweepstake with a small keyword", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS - 1),
      "sweepsQuota":"12",
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "A palavra chave tem menos de " + sweepsService.MIN_SWEEPS_KEYWORD_CHARS + 
                " ou mais de " + sweepsService.MAX_SWEEPS_KEYWORD_CHARS + " caracteres." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC9 - Try create sweepstake with a big keyword", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MAX_SWEEPS_KEYWORD_CHARS + 1),
      "sweepsQuota":"12",
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "A palavra chave tem menos de " + sweepsService.MIN_SWEEPS_KEYWORD_CHARS + 
                " ou mais de " + sweepsService.MAX_SWEEPS_KEYWORD_CHARS + " caracteres." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC10 - Try create sweepstake with a keyword equals name of sweepstake", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":"12",
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "A palavra chave não pode ser igual ao nome do bolão." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC11 - Try create sweepstake with empty quota", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":"",
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "A cota não foi informada. Caso o bolão não possua cota, preencha-a com 0,00." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC12 - Try create sweepstake with negative quota", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":"-10,00",
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "O valor da cota não é um número válido. A cota deve ser um número maior ou igual a " + sweepsService.MIN_SWEEPS_QUOTA + "." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC13 - Try create sweepstake with not a number quota", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":"abc",
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "O valor da cota não é um número válido. A cota deve ser um número maior ou igual a " + sweepsService.MIN_SWEEPS_QUOTA + "." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC14 - Try create sweepstake with a big quota", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":sweepsService.MAX_SWEEPS_QUOTA+0.01,
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "O valor da cota deve ser maior ou igual a " + sweepsService.MIN_SWEEPS_QUOTA + " e menor ou igual a " + sweepsService.MAX_SWEEPS_QUOTA + "." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC15 - Try create sweepstake with empty start participation date", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":sweepsService.MAX_SWEEPS_QUOTA,
      "sweepsStartDateParticipation":"",
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "A data de início do período de participação não foi informada." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC16 - Try create sweepstake with empty end participation date", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":sweepsService.MAX_SWEEPS_QUOTA,
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":"",
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "A data de término do período de participação não foi informada." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC17 - Try create sweepstake with start participation date in not ISO format", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":sweepsService.MAX_SWEEPS_QUOTA,
      "sweepsStartDateParticipation":"02/02/2000",
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "A data de início do período de participação é inválida. Ela deve estar no formato \'aaaa-mm-dd\'." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC18 - Try create sweepstake with end participation date in not ISO format", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":sweepsService.MAX_SWEEPS_QUOTA,
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":"02/02/2100",
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "A data de término do período de participação é inválida. Ela deve estar no formato \'aaaa-mm-dd\'." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC19 - Try create sweepstake with invalid start participation date", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":sweepsService.MAX_SWEEPS_QUOTA,
      "sweepsStartDateParticipation":"abc",
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "A data de início do período de participação é inválida. Ela deve estar no formato \'aaaa-mm-dd\'." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC20 - Try create sweepstake with invalid end participation date", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":sweepsService.MAX_SWEEPS_QUOTA,
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":"abc",
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "A data de término do período de participação é inválida. Ela deve estar no formato \'aaaa-mm-dd\'." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC21 - Try create sweepstake with start participation date less than current date", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsStarDate.setDate(sweepsStarDate.getDate()-1);
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":sweepsService.MAX_SWEEPS_QUOTA,
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "A data inicial do período de participação informada é menor do que a data de hoje." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC22 - Try create sweepstake with start participation date more than end participation date", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsStarDate.setDate(sweepsStarDate.getDate()+11);
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":sweepsService.MAX_SWEEPS_QUOTA,
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"chat.whatsapp.com/Opgor9384ssmKuiURJ12"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "A data inicial do período de participação informada é maior do que a data de término." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });


  test("TC23 - Try create sweepstake with empty link group of Whatsapp", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":"12",
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":""
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "O link do grupo do Whatsapp não foi informado." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC24 - Try create sweepstake with invalid link group of Whatsapp", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765432",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Create Sweeps:
    sweepsStarDate = new Date();
    sweepsEndDate = new Date();
    sweepsEndDate.setDate(sweepsEndDate.getDate() + 10);
    sweepsStartDateStr = sweepsStarDate.toISOString().split("T")[0];
    sweepsEndDateStr = sweepsEndDate.toISOString().split("T")[0];
    
    testBody = {
      "sweepsName":"Sweepstake test api 3",
      "sweepsKeyword":"a".repeat(sweepsService.MIN_SWEEPS_KEYWORD_CHARS),
      "sweepsQuota":"12",
      "sweepsStartDateParticipation":sweepsStartDateStr,
      "sweepsEndDateParticipation":sweepsEndDateStr,
      "sweepsWhatsappGroupLink":"https://google.com"
    };

    response = await agent
      .post('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    console.log(response.body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ "message": "O link do grupo do Whatsapp informado é inválido. Links de grupos do Whatsapp devem começar com 'chat.whatsapp.com' (não é necessário colocar 'https://' no início do link). Exemplos: 'chat.whatsapp.com/Ab12' ou 'https://chat.whatsapp.com/Ab12'." });

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });


});


describe('Get Sweepstakes', () => {

  let connection;

  beforeAll(async () => {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    await prepareDatabaseToTest(connection, "get_sweepstakes", addGetSweepsPreviousData);
  });

  afterAll(async () => {
    await connection.end();
  });

  /*Teste está comentado, pois enquanto a base de testes não for criada será impossível executá-lo, já que ele depende
  de uma base de testes sem sweepstakes.
  test("TC1 - Try to get sweepstakes from a admin user when system doens't have sweepstakes", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765411",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Getting Sweeps:
    response = await agent
      .get('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({});


    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });*/

  test("TC2 - Try to get sweepstakes from a not admin user who is not participating in any sweepstakes", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21999876511",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Getting Sweeps:
    response = await agent
      .get('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({});

    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

  test("TC3 - Try to get sweepstakes from an admin user", async () => {

  // Using agent to persist login cookie between requests:
  // So, cookie will persist in logout request.
  const agent = request.agent(app);

    let testBody = {
        "whatsappNumber": "21998765411",
        "password": getDefaultValidUserPassword()
    };

    //Login:
    let response = await agent
      .post('/api/login')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Login efetuado com sucesso!"});
    

    //Getting Sweeps:
    response = await agent
      .get('/api/sweeps')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(Object.keys(response.body).length).toBeGreaterThan(0);


    //Logout:
    response = await agent
      .post('/api/logout')
      .send(testBody)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({"message": "Logout efetuado com sucesso!"});
  });

});