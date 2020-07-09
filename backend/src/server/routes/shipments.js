import express from 'express';
let router = express.Router();

import shipmentsController from "#root/server/controllers/shipments";

const {
    postShipment,
    getShipment,
    getShipmentQuote, 
    cancelShipment
} = shipmentsController

router.get("/id/:shipment_id", getShipment)
router.delete("/id/:shipment_id", cancelShipment)
router.post("/", postShipment)
router.post("/quote", getShipmentQuote)


export default router;