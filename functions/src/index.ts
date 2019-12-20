
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as serviceAccount from './permissions.json';

const params = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url
}

functions.config().firebase = {
  credential: admin.credential.cert(params),
  databaseURL: "https://secretsantadb-7faa5.firebaseio.com"
};
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const app = express();
const main = express();

main.use('/api/v1', app);
main.use(bodyParser.json());

export const webApi = functions.https.onRequest(main);
app.use(cors({ origin: true }));

app.get('/warm', async (req, res) => {

  const empRef = db.collection('CompanyMaster').doc('LTI').collection('EmpMaster').where('Department', '==', 'DevOps');
  var data: any = [];
  await empRef.get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        // doc.data() is never undefined for query doc snapshots
        data.push({ docID: doc.id, Emp: doc.data() });
        console.log(doc.id, " => ", doc.data());

      });
    })
    .catch(function (error) {
      console.log("Error getting documents: ", error);
    });
  res.send(data);

})

app.get('/warmTo', (req, res) => {
  res.send('Calentando para la pelea');
})


app.post('/Login', async (request, response) => {

  try {
    const document = db.collection('CompanyMaster/' + request.body.CompanyCode + '/EmpMaster').doc('/' + request.body.PSNo + '/');
    let emp = await document.get();
    let empData = emp.data();
    if (empData && empData.Password === request.body.Password) {
      return response.status(200).send({ Success: true, Message: 'success' });
    } else {
      return response.status(200).send({ Success: false, Message: 'failed' });
    }

  } catch (error) {
    console.log(error);
    return response.status(500).send(error);
  }
});

app.post('/Register', async (request, response) => {

  try {
    const query = db.collection('CompanyMaster');
    var isExist = false;
    await query.get().then(querySnapshot => {
      let docs = querySnapshot.docs;
      for (let doc of docs) {
        if (doc.id === request.body.CompanyCode) {
          isExist = true;
          break;
        }
      }
      return null;
    }).catch((err) => { console.error(err); });

    const document = db.collection('CompanyMaster').doc('/' + request.body.CompanyCode + '/');
    var userData = request.body.EmpMaster;
    userData.SecretSanta = '';
    if (isExist) {
      userData.IsAdmin = false;
    } else {
      userData.IsAdmin = true;
      await document.create({
        CompanyCode: request.body.CompanyCode,
        Address: request.body.Address
      });
    }
    document.collection('EmpMaster').doc('/' + userData.PSNo + '/').create(userData);
    document.collection('DepartmentMaster').doc('/' + userData.Department + '/').create({ name: userData.Department });
    return response.status(200).send({ Success: true, Message: 'registered' });

  } catch (error) {
    return response.status(500).send(error);
  }
});

//get dept
app.post('/GetDepartmentList', async (request, response) => {

  try {
    let responseData: any = [];
    await db.collection('CompanyMaster').doc(request.body.CompanyCode).get()
      .then(async doc => {
        if (doc.exists) {
          await db.collection('CompanyMaster/' + request.body.CompanyCode + '/DepartmentMaster').get().
            then(sub => {
              if (sub.docs.length > 0) {
                for (let doc of sub.docs) {
                  const selectedItem = {
                    Name: doc.id,
                  };
                  responseData.push(selectedItem);
                }
              }
            });
        }
      }).catch((err) => { console.error(err); });
    return response.status(200).send({ Success: true, Message: 'Department List', data: responseData });
  } catch (error) {
    return response.status(500).send(error);
  }
});

//get Company
app.get('/GetCompanyList', async (req, res) => {
  try {
    let query = await db.collection('CompanyMaster');
    let responseData: any = [];
    await query.get().then(querySnapshot => {
      let docs = querySnapshot.docs;
      //console.log(docs);
      for (let doc of docs) {
        const selectedItem = {
          CompanyCode: doc.id,
        };
        responseData.push(selectedItem);
      }
      // return responseData;
    }).catch((err) => { console.error(err); });
    return res.status(200).send({ Success: true, Message: 'Company List', data: responseData });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

app.post('/GetEmpWishlist', async (req, res) => {

  try {
    const document = db.collection('CompanyMaster/' + req.body.CompanyCode + '/EmpMaster/' + req.body.PSNo + '/wishlist').doc('wishlist');
    let wish = await document.get();
    let wishList = wish.data();
    if (wishList) {
      return res.status(200).send({ Success: true, Message: 'found', data: wishList });
    }
    return res.status(200).send({ Success: false, Message: 'not found', data: {} });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

app.post('/UpdateEmpWishList', async (req, res) => {
  try {
    console.log(req.body.WishList);
    const document = db.collection('CompanyMaster/' + req.body.CompanyCode + '/EmpMaster/' + req.body.PSNo + '/wishlist').doc('wishlist');
    await document.create(req.body.WishList);
    return res.status(200).send({ Success: true, Message: 'wishlist created' });
  } catch (error) {
    return res.status(500).send(error);
  }
});

app.post('/GetEmpProfile', async (req, res) => {
  try {
    let document = db.collection('CompanyMaster/' + req.body.CompanyCode + '/EmpMaster').doc('/' + req.body.PSNo + '/');
    let profile = await document.get();
    let profileData = profile.data();
    if (profileData) {
      delete profileData.Password;
      return res.status(200).send({ Success: true, Message: 'found', data: profileData});
    } else {
      return res.status(200).send({ Success: false, Message: 'not found', data: {} });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});


// app.post('/Register', async (request, response) => {

//   try {
//     const { CompanyCode, Address, EmpMaster } = request.body;
//     const data = {
//       CompanyCode,
//       Address,
//       EmpMaster
//     }

//     //check here if company does not exsist
//     EmpMaster['IsAdmin'] = true;

//     const companyRef = await db.collection('CompanyMaster').doc(data.CompanyCode).set({
//       CompanyCode,
//       Address
//     });
//     companyRef.writeTime;

//     await db.collection('CompanyMaster').doc(data.CompanyCode)
//       .collection('DepartmentMaster').add({ Name: EmpMaster.Department });

//     const empRef = await db.collection('CompanyMaster').doc(data.CompanyCode)
//       .collection('EmpMaster').doc(EmpMaster['PSNo']).set(EmpMaster);

//     empRef.writeTime;

//     response.json({ success: 'true', message: 'You Have successfully registered' });

//   } catch (error) {

//     response.status(500).send(error);

//   }
// });

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
