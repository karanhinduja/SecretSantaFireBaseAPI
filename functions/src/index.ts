
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as serviceAccount from './permissions.json';
// import * as firebase from 'firebase/database';

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
// const database = admin.database().ref();


// const database = firebase.database();

const app = express();
const main = express();

main.use('/api/v1', app);
main.use(bodyParser.json());

export const webApi = functions.https.onRequest(main);
app.use(cors({ origin: true }));

// app.get('/warm', async (req, res) => {

//   const empRef = db.collection('CompanyMaster').doc('LTI').collection('EmpMaster').where('Department', '==', 'DevOps');
//   let data: any = [];
//   await empRef.get()
//     .then(function (querySnapshot) {
//       querySnapshot.forEach(function (doc) {
//         // doc.data() is never undefined for query doc snapshots
//         data.push({ docID: doc.id, Emp: doc.data() });
//         console.log(doc.id, " => ", doc.data());

//       });
//     })
//     .catch(function (error) {
//       console.log("Error getting documents: ", error);
//     });
//   res.send(data);

// })

// app.get('/warmTo', (req, res) => {
//   res.send('Calentando para la pelea');
// })


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
    let isExist = false;
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
    let userData = request.body.EmpMaster;
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
    await document.set(req.body.WishList);
    return res.status(200).send({ Success: true, Message: 'wishlist created' });
  } catch (error) {
    console.log(error)
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
      return res.status(200).send({ Success: true, Message: 'found', data: profileData });
    } else {
      return res.status(200).send({ Success: false, Message: 'not found', data: {} });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

app.post('/UpdateEmpProfile', async (req, res) => {
  console.log(req.body);
  try {
    const document = db.collection('CompanyMaster/' + req.body.CompanyCode + '/EmpMaster').doc('/' + req.body.PSNo + '/');

    if (document !== undefined) {
      await (await document.update(req.body)).writeTime;
      return res.status(200).send({ Success: true, Message: 'updated' });
    }
    return res.status(200).send({ Success: false, Message: 'not updated' });
  } catch (error) {
    return res.status(500).send(error);
  }
});


app.post('/StartMatching', async (req, res) => {
  try {
    db.collection('CompanyMaster/' + req.body.CompanyCode + '/EmpMaster')
      .where('Department', 'in', req.body.Department.split(',')).get()
      .then(snapshot => {
        if (snapshot.empty) {
          console.log('No matching documents.');
          return;
        }
        let empData: any = [];

        let i = 1;
        snapshot.forEach(doc => {
          empData.push({ ID: i, DocID: doc.id, Data: doc.data() });
          i++;
          // console.log(doc.id, '=>', doc.data());
        });

        let tempList: any = empData.filter((item: any, index: number, array: any) => {
          return (!item.Data.SecretSanta);
        }).map((item: any) => item.Data.PSNo);

        let previousMapped: string = ''
        let batch = db.batch();
        for (let j = 0, k = empData.length; j < k; j++) {

          if (!empData[j].Data.SecretSanta) {
            let randamNo = Math.floor(Math.random() * Math.floor(tempList.length));
            while (empData[j].DocID === tempList[randamNo] && tempList.length > 1) {
              randamNo = Math.floor(Math.random() * Math.floor(tempList.length));
            }

            if (empData[j].DocID !== tempList[randamNo]) {
              empData[j].Data.SecretSanta = tempList[randamNo];
              console.log('Value:- ', tempList[randamNo]);
              console.log('randamNo:- ', randamNo);
            }
            else {
              empData[j].Data.SecretSanta = previousMapped;
              empData[j - 1].Data.SecretSanta = tempList[randamNo];

              let tref1 = db.collection('CompanyMaster/' + req.body.CompanyCode + '/EmpMaster').doc(empData[j - 1].DocID);
              batch.update(tref1, { SecretSanta: empData[j - 1].Data.SecretSanta });

              let tref2 = db.collection('CompanyMaster/' + req.body.CompanyCode + '/EmpMaster').doc(empData[j - 1].Data.SecretSanta);
              batch.update(tref2, { Recipient: empData[j - 1].Data.PSNo });
            }

            let ref1 = db.collection('CompanyMaster/' + req.body.CompanyCode + '/EmpMaster').doc(empData[j].DocID);
            batch.update(ref1, { SecretSanta: empData[j].Data.SecretSanta });

            let ref2 = db.collection('CompanyMaster/' + req.body.CompanyCode + '/EmpMaster').doc(empData[j].Data.SecretSanta);
            batch.update(ref2, { Recipient: empData[j].Data.PSNo });

            previousMapped = tempList[randamNo];
            tempList.splice(randamNo, 1);
            console.log('Loop:- ', j);
            console.log('ref1:- ', ref1);
            console.log('ref1:- ', ref2);
          }
        }
        batch.commit().then(function () {
          // ...
          console.log('Task done');
        });
        console.log(empData);

      }).catch(err => {
        console.log('Error getting documents', err);
      });

    // let response: any = [], allocated = [];
    // await query.get().then(querySnapshot => {
    //   let docs = querySnapshot.docs;
    //   for (let doc of docs) {
    //     let selectedItem = {
    //       Id: doc.id,
    //       Name: doc.data().FullName,
    //       SecretSanta: doc.data().SecretSanta
    //     }
    //     response.push(selectedItem);
    //   }
    // }).catch((err) => { console.error(err); });

    // for (let i = response.length - 1; i >= 0; i--) {
    //   if (response[i].SecretSanta !== undefined && response[i].SecretSanta !== "") {
    //     allocated.push(response[i].SecretSanta);
    //   }
    // }

    // for (let j = 0; j <= response.length - 1; j++) {
    //   //console.log(response[j].id +" ---- "+ response[j].santa+" ----> "+j);
    //   while (response[j].SecretSanta === "") {
    //     if (j === response.length - 1 && allocated.indexOf(response[j].id) === -1) {
    //       response[j].SecretSanta = response[j - 1].SecretSanta;
    //       response[j - 1].SecretSanta = String(response[j].id);
    //       allocated.push(response[j].id);
    //       const document = query.doc('/' + response[j - 1].id + '/');
    //       document.update({
    //         santa: response[j - 1].santa
    //       });
    //     } else {
    //       let rand = Math.floor(Math.random() * response.length);
    //       while (rand === j) {
    //         rand = Math.floor(Math.random() * response.length);
    //       }
    //       if (allocated.indexOf(response[rand].id) === -1) {
    //         response[j].santa = response[rand].id;
    //         allocated.push(response[j].santa);
    //       }
    //     }
    //   }
    //   const document = db.collection('CompanyMaster/' + req.body.CompanyCode + '/EmpMaster').doc('/' + response[j].id + '/');
    //   if (response[j].santa === undefined) {
    //     document.set({
    //       santa: response[j].santa
    //     });
    //   } else {
    //     document.update({
    //       santa: response[j].santa
    //     });
    //   }

    // }
    return res.status(200).send('allocated');
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});


app.post('/ResetMatching', async (req, res) => {
  try {
    db.collection('CompanyMaster/' + req.body.CompanyCode + '/EmpMaster')
      .where('Department', 'in', req.body.Department.split(',')).get()
      .then(snapshot => {
        if (snapshot.empty) {
          console.log('No matching documents.');
          return;
        }
        let batch = db.batch();
        snapshot.forEach(doc => {
          let ref1 = db.collection('CompanyMaster/' + req.body.CompanyCode + '/EmpMaster').doc(doc.id);
          batch.update(ref1, { SecretSanta: '', Recipient: '' });
        });
        batch.commit().then(function () {
          // ...
          console.log('Task done');
        });
      }).catch(err => {
        console.log('Error getting documents', err);
      });
    return res.status(200).send('allocated');
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
