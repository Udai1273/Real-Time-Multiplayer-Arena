const { default: axios } = require("axios");

const BACKEND_URL = "http://localhost:3000";
const WS_URL= "ws://localhost:3001";
describe("Authentication", () => {
  test("User is able to sign up", async () => {
    const username = "udai" + Math.random();
    const password = "12345678";
    const reponse = await axios.post(BACKEND_URL + "/api/v1/signup", {
      username,
      password,
      type: "admin",
    });
    expect(reponse.statusCode).toBe(200);
    const updatedReponse = await axios.post(BACKEND_URL + "/api/v1/signup", {
      username,
      password,
      type: "admin",
    });
    expect(updatedReponse.statusCode).toBe(400);
  });
  test("Signup request fails if user name is empty", async () => {
    const password = "12345678";
    const reponse = await axios.post(BACKEND_URL + "/api/v1/singup", {
      password,
    });
    expect(reponse.statusCode).toBe(400);
  });
  test("Signin  successful if user user name and password is correct", async () => {
    const username = "udai" + Math.random();
    const password = "12345678";
    await axios.post(BACKEND_URL + "/api/v1/signup", {
      username,
      password,
      type: "admin",
    });
    const reponse = await axios.post(BACKEND_URL + "/api/v1/signin", {
      username,
      password,
    });
    expect(reponse.statusCode).toBe(200);
    expect(reponse.body.token).toBeDefined();
  });
  test("Signin fails if username and password are incorrect", async () => {
    const username = "udai" + Math.random();
    await axios.post(BACKEND_URL + "/api/v1/signup", {
      username,
      password: "12345678",
    });
    const reponse = await axios.post(BACKEND_URL + "/api/v1/signin", {
      username,
      password: "wrong_password",
    });
    expect(reponse.statusCode).toBe(403);
  });
});
describe("User Metadata Endpoints", () => {
  let token = "";
  let avatarId = "";
  beforeAll(async () => {
    const username = "udai" + Math.random();
    const password = "12345678";
    await axios.post(BACKEND_URL + "/api/v1/signup", {
      username,
      password,
      type: "admin",
    });
    const response = await axios.post(BACKEND_URL + "/api/v1/signin", {
      username,
      password,
    });
    token = response.data.token;
    const avatarResponse = await axios.post(
      BACKEND_URL + "/api/v1/admin/avatar",
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      }
    );
    avatarId = avatarResponse.data.avatarId;
  });
  test("User cannt update their matadeta with wrong avatar id", async () => {
    const reponse = await axios.post(
      BACKEND_URL + "/api/v1/user/metadata",
      {
        avatarId: "wrong_id",
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    expect(response.statusCode).toBe(400);
  });
  test("User can update their matadeta with correct avatar id", async () => {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/user/metadata",
      {
        avatarId,
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    expect(response.statusCode).toBe(200);
  });
  test("User is not able to update their meta data if the auth header is not present", async () => {
    const response = await axios.post(BACKEND_URL + "/api/v1/user/metadata", {
      avatarId,
    });
    expect(response.statusCode).toBe(403);
  });
});
describe("User avatar information", () => {
  let avatarId;
  let token;
  let userId;
  beforeAll(async () => {
    const username = "udai" + Math.random();
    const password = "12345678";
    const signupResponse = await axios.post(BACKEND_URL + "/api/v1/signup", {
      username,
      password,
      type: "admin",
    });
    userId = signupResponse.data.userId;
    const response = await axios.post(BACKEND_URL + "/api/v1/signin", {
      username,
      password,
    });
    token = response.data.token;
    const avatarResponse = await axios.post(
      BACKEND_URL + "/api/v1/admin/avatar",
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",  
      },{
         headers: {
          authorization: `Bearer ${token}`, 
         }
      }
    );
    avatarId = avatarResponse.data.avatarId;
  });
  test("Get back avatar information for user", async () => {
    const response = axios.get(
      BACKEND_URL + "/api/v1/user/metadata/bulk?ids=[${userId}]"
    );
    expect(response.data.avatars.length).toBe(1);
    expect(response.data.avatars[0].userId).toBe(userId);
  });
  test("Available avatars lists the recently covered avatar", async () => {
    const response = await axios.get(BACKEND_URL + "/api/v1/avatars");
    expect(response.data.avatars.length).not.toBe(0);
    const currentAvatar = response.data.avatars.find((x) => x.id == avatarId);
    expect(currentAvatar).toBeDefined();
  });
});
describe("Space Information", () => {
  let mapId;
  let element1Id;
  let element2Id;
  let adminToken;
  let adminId;
  let userId;
  let userToken;
  beforeAll(async () => {
    const username = "udai" + Math.random();
    const password = "12345678";
    const signupResponse = await axios.post(BACKEND_URL + "/api/v1/signup", {
      username:username+"-user",
      password,
      type: "admin",
    });
    adminId = signupResponse.data.userId;
    const response = await axios.post(BACKEND_URL + "/api/v1/signin", {
      username:username+"-user",
      password,
    });
    adminToken = response.data.token;

    const userSignupResponse = await axios.post(
      BACKEND_URL + "/api/v1/signup",
      {
        username,
        password,
        type: "user",
      }
    );
    userId = userSignupResponse.data.userId;
    const userSigninResponse = await axios.post(
      BACKEND_URL + "/api/v1/signin",
      {
        username,
        password,
      }
    );
    userToken = userSigninResponse.data.token;

    const element1Response = await axios.post(
      BACKEND_URL + "/api/v1/admin/element",
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const element2Response = await axios.post(
      BACKEND_URL + "/api/v1/admin/element",
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;
    const mapResponse = await axios.post(
      BACKEND_URL + "/api/v1/admin/map",
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    mapId = mapResponse.data.id;
  });
  test("user is able to create a space", async () => {
    const response = axios.post(
      "BACKEND_URL+/api/v1/space",
      {
        name: "Test",
        dimensions: "100x200",
        mapId: mapId,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(response.data.spaceId).toBeDefined;
  });
  test("user is able to create a space without mapid(empty space)", async () => {
    const response = axios.post(
      "BACKEND_URL+/api/v1/space",
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(response.data.spaceId).toBeDefined;
  });
  test("user is not able to create a space without mapid(empty space) and dimentions", async () => {
    const response = axios.post(
      "BACKEND_URL+/api/v1/space",
      {
        name: "Test",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    expect(response.data.spaceId).toBe(400);
  });
  test("user is not able to delete a space that doesnt exist", async () => {
    const response = axios.delete("BACKEND_URL+/api/v1/space/randomid", {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    expect(response.data.spaceId).toBe(400);
  });
  test("user is able to delet an existing space", async () => {
    const response = axios.post("BACKEND_URL+/api/v1/space",{
      name: "Test",
      dimensions: "100x200",
     },{
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    const deleteResponse = await axios.delete(`BACKEND_URL+/api/v1/space/${response.data.spaceId}`,{
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    })
    expect(deleteResonse.statusCode).toBe(200);
  }); 
  test("user shouldnt be able to delete space created by another user", async () => {
    const response = axios.post(
      "BACKEND_URL+/api/v1/space",
      {
        name: "Test",
        dimensions: "100x200",
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );

    const deleteResponse = await axios.delete(
      `BACKEND_URL+/api/v1/space/${response.data.spaceId}`,
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    expect(deleteResonse.statusCode).toBe(400);
  })
  test("admin has no spaces initailly",async ()=>{
    const response= await axios.get(BACKEND_URL+'/api/v1/space/all',{
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    expect(response.data.spaces.length).toBe(0);
  })
  test("admin has no spaces initailly", async () => {
    const spaceCreateResponse = await axios.post(BACKEND_URL + "/api/v1/space/",{
      name: "Test",
      dimensions: "100x200",
    },{
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    const response = await axios.get(BACKEND_URL + "/api/v1/space/all",{
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    });
    const filteredSpace = response.data.spaces.find(x=>x.id==spaceCreateResponse.spaceId);
    expect(response.data.spaces.length).toBe(1);
    expect(filteredSpace).toBeDefined();
  });
});
describe("Arena Endpoints",()=>{
  let mapId;
  let element1Id;
  let element2Id;
  let adminToken;
  let adminId;
  let userId;
  let userToken;
  let spaceId;
  beforeAll(async () => {
    const username = "udai" + Math.random();
    const password = "12345678";
    const signupResponse = await axios.post(BACKEND_URL + "/api/v1/signup", {
      username,
      password,
      type: "admin",
    });
    adminId = signupResponse.data.userId;
    const response = await axios.post(BACKEND_URL + "/api/v1/signin", {
      username:username,
      password,
    });
    adminToken = response.data.token;

    const userSignupResponse = await axios.post(
      BACKEND_URL + "/api/v1/signup",
      {
        username:username+'-user',
        password,
        type: "user",
      }
    );
    userId = userSignupResponse.data.userId;
    const userSigninResponse = await axios.post(
      BACKEND_URL + "/api/v1/signin",
      {
        username:username+'-user',
        password,
      }
    );
    userToken = userSigninResponse.data.token;

    const element1Response = await axios.post(
      BACKEND_URL + "/api/v1/admin/element",
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const element2Response = await axios.post(
      BACKEND_URL + "/api/v1/admin/element",
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;
    const mapResponse = await axios.post(
      BACKEND_URL + "/api/v1/admin/map",
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    mapId = mapResponse.data.id;
    const spaceResponse = await axios.post(BACKEND_URL+'/api/v1/',{
      "name": "Test",
      "dimensions":"100x200",
      "mapId":mapId
     },{
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    })
    spaceId = spaceResponse.data.spaceId;
  });
  test('incorrect space id returns 400',async()=>{
    const response=await axios.get(BACKEND_URL+'/api/v1/space/something',{
      headers: {
        authorization: `Bearer ${userToken}`,
      }
    });
    expect(response.statusCode).toBe(400);
  }) 
  test('correct space id returns all the elements',async()=>{
    const response=await axios.get(BACKEND_URL+'/api/v1/space/${spaceId}',{
      headers: {
        authorization: `Bearer ${userToken}`,
      }
    });
    expect(response.data.dimensions).toBe("100x200")
    exepct(response.data.elements.length).toBe(3)
  })
  test('delete endpoint is able to delete an element ',async()=>{
    await axios.delete(BACKEND_URL+'/api/v1/space/element',{
       spaceId: spaceId,
       elementId:response.data.elements[0].id
    },{
      headers: {
        authorization: `Bearer ${userToken}`,
      }
    });
    const response=await axios.get(BACKEND_URL+'/api/v1/space/${spaceId}',{
      headers: {
        authorization: `Bearer ${userToken}`,
      }
    });
    exepct(response.data.elements.length).toBe(2)
  })
  test('adding an element fails if element lies outside the dimentions',async()=>{
    await axios.post(BACKEND_URL+'/api/v1/space/element',{
      "elementId": element1Id,
      "spaceId": spaceId,
      "x": 10000,
      "y": 22000
    },{
      headers: {
        authorization: `Bearer ${userToken}`,
      }
    });
    const response=await axios.get(BACKEND_URL+'/api/v1/space/${spaceId}',{
      headers: {
        authorization: `Bearer ${userToken}`,
      }
    });
    exepct(response.statusCode).toBe(400)
  })
  test('adding an element',async()=>{
    await axios.post(BACKEND_URL+'/api/v1/space/element',{
      "elementId": element1Id,
      "spaceId": spaceId,
      "x": 50,
      "y": 20
    },{
      headers: {
        authorization: `Bearer ${userToken}`,
      }
    } );
    const response=await axios.get(BACKEND_URL+'/api/v1/space/${spaceId}',{
      headers: {
        authorization: `Bearer ${userToken}`,
      }
    });
    exepct(response.data.elements.length).toBe(3)
  })
})
describe("admin endpoints",()=>{
  let adminToken;
  let adminId;
  let userId;
  let userToken;
  beforeAll(async () => {
    const username = "udai" + Math.random();
    const password = "12345678";
    const signupResponse = await axios.post(BACKEND_URL + "/api/v1/signup", {
      username,
      password,
      type: "admin",
    });
    adminId = signupResponse.data.userId;
    const response = await axios.post(BACKEND_URL + "/api/v1/signin", {
      username:username,
      password,
    });
    adminToken = response.data.token;

    const userSignupResponse = await axios.post(
      BACKEND_URL + "/api/v1/signup",
      {
        username:username+'-user',
        password,
        type: "user",
      }
    );
    userId = userSignupResponse.data.userId;
    const userSigninResponse = await axios.post(
      BACKEND_URL + "/api/v1/signin",
      {
        username:username+'-user',
        password,
      }
    );
    userToken = userSigninResponse.data.token;
  });
  test('user isnt able to hit admin endpoints', async () => {
    const elementResponse = await axios.post(
      BACKEND_URL + "/api/v1/admin/element",
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    
    const mapResponse = await axios.post(
      BACKEND_URL + "/api/v1/admin/map",
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        defaultElements: [],
      },
      {
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    const avatarResponse = await axios.post(
      BACKEND_URL + "/api/v1/admin/avatar",
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },{
        headers: {
          authorization: `Bearer ${userToken}`,
        },
      }
    );
    const updateElement = await axios.put(BACKEND_URL+'/api/v1/admin/element/123',{
      imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
    },{
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    })
    expect(elementResponse.status).toBe(403);
    expect(mapResponse.status).toBe(403);
    expect(avatarResponse.status).toBe(403);
    expect(updateElement.status).toBe(403);
  })
  test('admin can hit admin endpoints', async () => {
    const elementResponse = await axios.post(
      BACKEND_URL + "/api/v1/admin/element",
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    
    const mapResponse = await axios.post(
      BACKEND_URL + "/api/v1/admin/map",
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        defaultElements: [],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const avatarResponse = await axios.post(
      BACKEND_URL + "/api/v1/admin/avatar",
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
        name: "Timmy",
      },{
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(elementResponse.status).toBe(403);
    expect(mapResponse.status).toBe(403);
    expect(avatarResponse.status).toBe(403);
  })
  test('admin can update a space',async()=>{
    const elementResponse = await axios.post(
      BACKEND_URL + "/api/v1/admin/element",
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const updateElementResponse=await axios.put(BACKEND_URL+'/api/v1/admin/element/${elementResponse.data.id}',{
      imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
    },{
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
    })
    expect(updateElementResponse.statusCode).toBe(200); 
  })
})
describe("websocket tests",()=>{
  let adminToken;
  let adminUserId;
  let userToken;
  let userId;
  let mapId;
  let element1Id;
  let element2Id;
  let spaceId;
  let ws1;
  let ws2;
  let ws1Messages=[];
  let ws2Messages=[];
  let userX;
  let userY;
  let adminX;
  let adminY;
  function waitForAndPopLatestMessage(messageArray){
    return new Promise(r=>{
      if(messageArray.length>0){
        return messageArray.shift();
      }else{
        let interval=setInterval(()=>{
          if(messageArray.length>0){
            resolve(messageArray.shift());
            clearInterval(interval);
          }
        },100)
      }
    })
  }
  async function setupHTTP(){
    const username='udai'+Math.random();
    const password='12345678';
    const adminSignupResponse= await axios.post(BACKEND_URL+'/api/v1/signup',{
      username,
      password,
      type:'admin',
    })
    const adminSigninResponse= await axios.post(BACKEND_URL+'/api/v1/signin',{
      username,
      password,
    })
    adminUserId=adminSignupResponse.data.userId;
    adminToken=adminSigninResponse.data.token;
    const userSignupResponse= await axios.post(BACKEND_URL+'/api/v1/signup',{
      username:username+'-user',
      password,
      type:'user',
    })
    const userSigninResponse= await axios.post(BACKEND_URL+'/api/v1/signin',{
      username:username+'-user',
      password,
    })
    userId=userSignupResponse.data.userId;
    userToken=userSigninResponse.data.token;
    const element1Response = await axios.post(
      BACKEND_URL + "/api/v1/admin/element",
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    const element2Response = await axios.post(
      BACKEND_URL + "/api/v1/admin/element",
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    element1Id = element1Response.data.id;
    element2Id = element2Response.data.id;
    const mapResponse = await axios.post(
      BACKEND_URL + "/api/v1/admin/map",
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        defaultElements: [
          {
            elementId: element1Id,
            x: 20,
            y: 20,
          },
          {
            elementId: element1Id,
            x: 18,
            y: 20,
          },
          {
            elementId: element2Id,
            x: 19,
            y: 20,
          },
        ],
      },
      {
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      }
    );
    mapId = mapResponse.data.id;
    const spaceResponse = await axios.post(BACKEND_URL+'/api/v1/',{
      "name": "Test",
      "dimensions":"100x200",
      "mapId":mapId
     },{
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    })
    spaceId = spaceResponse.data.spaceId;
  }
  async function setupWs(){
    ws1=new WebSocket(WS_URL);
    await new Promise(r=>{
      ws1.onopen=r;
    })
    ws1.onmessage=(event)=>{
      ws1Messages.push(JSON.parse(event.data))
    }
    ws2=new WebSocket(WS_URL);
    await new Promise(r=>{
      ws2.onopen=r;
    })
    ws2.onmessage=(event)=>{
      ws2Messages.push(JSON.parse(event.data))
    } 
  }
  beforeAll(()=>{
    setupHTTP()
    setupWs()
  })
  test('Get back acknowledgement for joining the space', async()=>{
    ws1.send(JSON.stringify({
        "type": "join",
        "payload": {
          "spaceId": spaceId,
          "token": adminToken,
        }
    }));
    const message1=await waitForAndPopLatestMessage(ws1Messages);
    ws2.send(JSON.stringify({
        "type": "join",
        "payload": {
          "spaceId": spaceId,
          "token": userToken,
        }
    }));
    const message2=await waitForAndPopLatestMessage(ws2Messages);
    const message3=await waitForAndPopLatestMessage(ws1Messages);

    expect(message1.type).toBe('space-joined');
    expect(message2.type).toBe('space-joined');

    expect(message1.payload.users.length).toBe(0);
    expect(message2.payload.users.length).toBe(1);
    expect(message3.type).toBe('user-join');
    expect(message3.playload.x).toBe(message2.payload.spawn.x);
    expect(message3.playload.y).toBe(message2.payload.spawn.y);
    expect(message3.playload.userId).toBe(userId);
    

    adminX=message1.payload.spawn.x;
    adminY=message1.payload.spawn.y;

    userX=message2.payload.spawn.x;
    userY=message2.payload.spawn.y;
  })
  test('user shouldnt be able to move across the boundry of the wall',async()=>{
    ws1.send(JSON.stringify({
      type:"movement",
      payload:{
        x:1000000,
        y:1000000
      }
    }))
    const message= await waitForAndPopLatestMessage(ws1Messages);
    expect(message.type).toBe('movement-rejected');
    expect(message.payload.x).toBe(adminX);
    expect(message.payload.y).toBe(adminY);
  })
  test('user shouldnt be able to move two blocks at the same time',async()=>{
    ws1.send(JSON.stringify({
      type:"movement",
      payload:{
        x:adminX+2,
        y:adminY
      }
    }))
    const message= await waitForAndPopLatestMessage(ws1Messages);
    expect(message.type).toBe('movement-rejected');
    expect(message.payload.x).toBe(adminX);
    expect(message.payload.y).toBe(adminY);
  })
  test('correct moment should be braodcasted to the socket',async()=>{
    ws1.send(JSON.stringify({
      type:"movement",
      payload:{
        x:adminX+1,
        y:adminY,
        userId:adminId
      }
    }))
    const message= await waitForAndPopLatestMessage(ws2Messages);
    expect(message.type).toBe('movement');
    expect(message.payload.x).toBe(adminX+1);
    expect(message.payload.y).toBe(adminY);
  })
  test('if a user leaves the other users recieve a leave event',async()=>{
    ws1.close()
    const message= await waitForAndPopLatestMessage(ws2Messages);
    expect(message.type).toBe('user-left');
    expect(message.payload.userID).toBe(adminUserId);
  })
})