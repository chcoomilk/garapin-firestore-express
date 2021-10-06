import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";

admin.initializeApp(functions.config().firebase);

export const db = admin.firestore();
export const itemCollection = "items";

import router from "./handlers";

const app = express();
const main = express();

app.get("/", (_, res) => {
    res.status(200).send("Hello!");
});
app.use("/", router);

main.use("", app);
main.use(express.json());
main.use(express.urlencoded({ extended: false }));

export const webApi = functions.https.onRequest(main);
