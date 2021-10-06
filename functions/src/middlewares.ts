import * as admin from "firebase-admin";
import { Request, Response, NextFunction } from "express";

import { db, itemCollection } from ".";

export default async function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const query = await db.collection(itemCollection).doc(req.params.itemId).get();
        const result = query.data();
        const idToken = req.headers.authorization;
        if (!idToken) {
            res.status(403).send("Please provide an ID Token in the request authorization header");
        } else {
            const user = await admin.auth().verifyIdToken(idToken);
            if (result) {
                if (user.uid === result.owner_id) {
                    next();
                } else {
                    res.status(403).send("Access Denied");
                }
            } else {
                res.status(404).send(`Item's ID of ${req.params.itemId} was not found`);
            }
        }
    } catch (error) {
        res.status(500).send(error);
    }
}
