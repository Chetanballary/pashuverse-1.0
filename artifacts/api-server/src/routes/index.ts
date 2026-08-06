import { Router, type IRouter } from "express";
import healthRouter from "./health";
import animalsRouter from "./animals";
import healthRecordsRouter from "./health_records";
import vaccinationsRouter from "./vaccinations";
import appointmentsRouter from "./appointments";
import diseasePredictionsRouter from "./disease_predictions";
import marketplaceRouter from "./marketplace";
import insuranceRouter from "./insurance";
import communityRouter from "./community";
import notificationsRouter from "./notifications";
import sosRouter from "./sos";
import dashboardRouter from "./dashboard";
import usersRouter from "./users";
import ttsRouter from "./tts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(animalsRouter);
router.use(healthRecordsRouter);
router.use(vaccinationsRouter);
router.use(appointmentsRouter);
router.use(diseasePredictionsRouter);
router.use(marketplaceRouter);
router.use(insuranceRouter);
router.use(communityRouter);
router.use(notificationsRouter);
router.use(sosRouter);
router.use(dashboardRouter);
router.use(usersRouter);
router.use(ttsRouter);

export default router;
