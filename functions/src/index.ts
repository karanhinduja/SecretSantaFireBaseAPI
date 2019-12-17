
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

app.get('/warm', (req, res) => {
  res.send('Calentando para la pelea');
})

app.get('/warmTo', (req, res) => {
  res.send('Calentando para la pelea');
})

app.post('/Register', async (request, response) => {

  try {
    const { CompanyCode, Address, EmpMaster } = request.body;
    const data = {
      CompanyCode,
      Address,
      EmpMaster
    }

    //check here if company does not exsist
    EmpMaster['IsAdmin'] = true;

    const companyRef = await db.collection('CompanyMaster').doc(data.CompanyCode).set({
      CompanyCode,
      Address
    });
    companyRef.writeTime;

    await db.collection('CompanyMaster').doc(data.CompanyCode)
      .collection('DepartmentMaster').add({ Name: EmpMaster.Department });

    const empRef = await db.collection('CompanyMaster').doc(data.CompanyCode)
      .collection('EmpMaster').doc(EmpMaster['PSNo']).set(EmpMaster);

    empRef.writeTime;

    response.json({ success: 'true', message: 'You Have successfully registered' });

  } catch (error) {

    response.status(500).send(error);

  }
});

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
