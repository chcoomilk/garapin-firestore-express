import * as admin from "firebase-admin";
import * as express from "express";
import { db, itemCollection } from ".";
import AuthMiddleware from "./middlewares";

const router = express.Router();

interface Item {
    name: String,
    cost: String,
    description: String,
    owner_id: String,
}

router.post("/items", async (req, res) => {
    try {
        let idToken = req.headers.authorization;
        if (idToken) {
            const user = await admin.auth().verifyIdToken(idToken);
            const item: Item = {
                name: req.body.name,
                cost: req.body.cost,
                description: req.body.description,
                owner_id: user.uid,
            }

            const newDoc = await db.collection(itemCollection).add(item);
            res.status(201).send(`Created a new item: ${newDoc.id}`);
        } else {
            res.status(403).send("Please provide an ID Token in the request authorization header");
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/items', async (_, res) => {
    try {
        const itemQuerySnapshot = await db.collection(itemCollection).get();
        const items: any[] = [];
        itemQuerySnapshot.forEach((doc) => {
            items.push({
                id: doc.id,
                data: doc.data(),
            })
        });

        res.status(200).json(items);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get('/items/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    db.collection(itemCollection).doc(itemId).get()
        .then(item => {
            if (item.exists) {
                res.status(200).json({
                    id: item.id,
                    data: item.data()
                });
            } else {
                res.status(404).send(`Item's ID of ${itemId} was not found`);
            }
        })
        .catch(error => res.status(500).send(error));
});

router.delete('/items/:itemId', AuthMiddleware, async (req, res) => {
    try {
        await db.collection(itemCollection).doc(req.params.itemId).delete();
        res.status(200).send("OK!");
    } catch (error) {
        res.status(500).send(error);
    }
});

router.patch('/items/:itemId', AuthMiddleware, async (req, res) => {
    try {
        await db.collection(itemCollection).doc(req.params.itemId).set(req.body, { merge: true });
        res.status(200).send(`Successfully edited ${req.params.itemId}`);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put('/items/:itemId', AuthMiddleware, async (req, res) => {
    try {
        await db.collection(itemCollection).doc(req.params.itemId).set(req.body, { merge: false });
        res.status(200).send(`Successfully edited ${req.params.itemId}`);
    } catch (error) {
        res.status(500).send(error);
    }
});

export default router;
