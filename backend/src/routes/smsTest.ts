import express from "express";
import { testSMS } from "../controllers/smsTest";

const router = express.Router();

router.get("/test-sms", testSMS);

export default router;
