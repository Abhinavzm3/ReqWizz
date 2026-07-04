import express from "express";

import {
  sendRequest,
  getHistory,
  deleteHistory,
  createCollection,
  getCollections,
  updateCollection,
  addRequestToCollection,
  deleteRequestFromCollection,
  deleteCollection,
} from "../controllers/api.controller.js";

const router = express.Router();

router.post("/send-request", sendRequest);

router.get("/history", getHistory);
router.post("/history/delete", deleteHistory);

router.post("/collections", createCollection);
router.get("/collections", getCollections);
router.put("/collections/:id", updateCollection);
router.delete("/collections/:id", deleteCollection);

router.post(
  "/collections/:id/requests",
  addRequestToCollection
);

router.delete(
  "/collections/:collectionId/requests/:requestId",
  deleteRequestFromCollection
);

export default router;