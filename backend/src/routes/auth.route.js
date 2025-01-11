import express from "express";
import { studentSignup, verifyStudentEmail, studentLogin, studentLogout, studentForgotPassword, studentResetPassword, studentCheckAuth,  companySignup , verifyCompanyEmail, companyLogin , companyLogout, companyForgotPassword , companyResetPassword, companyCheckAuth} from "../controllers/auth.controller.js";
import { verifyUserToken } from "../middleware/verifyUserToken.js";
import { verifyCompanyToken } from "../middleware/verifyCompanyToken.js";

const router = express.Router();
import multer from "multer";
import cloudinary from "cloudinary";

import dotenv from "dotenv";
dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post("/student-signup", studentSignup);
router.post("/verify-student-email",verifyStudentEmail);
router.post("/student-login", studentLogin);
router.post("/student-logout", studentLogout);
router.post("/student-forgot-password", studentForgotPassword);
router.post("/student-reset-password/:token", studentResetPassword);
router.get("/student-check-auth", verifyUserToken, studentCheckAuth);

router.post("/company-signup", companySignup);
router.post("/verify-company-email",verifyCompanyEmail);
router.post("/company-login", companyLogin);
router.post("/company-logout", companyLogout);
router.post("/company-forgot-password", companyForgotPassword);
router.post("/company-reset-password/:token", companyResetPassword);
router.get("/company-check-auth", verifyCompanyToken, companyCheckAuth);


router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const result = await cloudinary.v2.uploader.upload(req.file.path);
        res.json({ url: result.secure_url }); // Send back the URL of the uploaded image
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        res.status(500).json({ message: "Image upload failed" });
    }
});


router.post("/company-signup", companySignup);





export default router;
