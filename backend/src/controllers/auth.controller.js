// Import required models for database operations
import User from "../models/user.model.js";
import Company from "../models/company.model.js";

// Import libraries for password hashing and token generation
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Import utility functions for token generation and email sending
import { generateUserTokenAndSetCookie } from "../utils/generateUserToken.js";
import { generateCompanyTokenAndSetCookie } from "../utils/generateCompanyToken.js";
import { sendUserVerificationEmail, sendUserWelcomeEmail, sendUserPasswordResetEmail, sendUserPasswordResetSuccessEmail, sendCompanyVerificationEmail, sendCompanyWelcomeEmail, sendCompanyPasswordResetEmail, sendCompanyPasswordResetSuccessEmail  } from "../mailtrap/emails.js";


// Student Authentication Controllers

// Handle student registration
export const studentSignup = async (req, res) => {
    const { first_Name, last_Name, gender, date_of_birth, phone_number, email, password, confirm_password, state_of_residence } = req.body;
    try{
        // validate input data
        if (password !== confirm_password) {
            return res.status(400).json({ message: "Password and Confirm Password must match" });
        }
        if (phone_number.length < 10 || phone_number.length > 15) {
            return res.status(400).json({ message: "Invalid phone number" });
        }
        if(!first_Name || !last_Name || !gender || !date_of_birth || !phone_number || !email || !password || !confirm_password || !state_of_residence){
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6){
            return res.status(400).json({ message: "password must be at least 6 characters" });
        }

        // Check if user already exists
        const user = await User.findOne({email})

        if (user) return res.status(400).json({message: "Email already exist" });

        // Hash password and create verification token
        const salt =  await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        // Create new user in database
        const newUser = new User({
            first_Name,
            last_Name,
            gender,
            date_of_birth,
            phone_number,
            email,
            password:hashedPassword,
            confirm_password:hashedPassword,
            state_of_residence,
        });

        if(newUser) {
            // Generate JWT and send verification emails
            generateUserTokenAndSetCookie(res,newUser._id);
            await sendUserVerificationEmail(newUser.email, newUser.verificationToken);
            await sendUserWelcomeEmail(newUser.email, newUser.first_Name, newUser.last_Name);
            await newUser.save();

            res.status(201).json({
                _id:newUser._id,
                first_Name: newUser.first_Name,
                last_Name: newUser.last_Name,
                gender: newUser.gender,
                date_of_birth: newUser.date_of_birth,
                phone_number: newUser.phone_number,
                email: newUser.email,
                password: newUser.password,
                confirm_password: undefined,
                state_of_residence: newUser.state_of_residence,
            });

        }else {
            res.status(400).json({ message: "Invalid user data"});
        }

    } catch (error) {
        console.log("Error in student login controller", error.message);
        res.status(500).json({ message: "Internal server error" });

    }
};

// Verify student email address
export const verifyStudentEmail = async (req, res) => {
    const { code } = req.body;
    console.log("Verification code received:", code);
    try {
        // Find user with valid verification token
        const newUser = await User.findOne({ verificationToken: code, verificationTokenExpire: { $gt: Date.now() } });
        console.log("User found in verifyEmail:", newUser);
        if (!newUser) {
            return res.status(400).json({ success: false, msg: "Invalid or expired verification code" });
        }
        // Update user verification status
        newUser.isVerified = true;
        newUser.verificationToken = undefined;
        newUser.verificationTokenExpire = undefined;
        await newUser.save();

        generateUserTokenAndSetCookie(res, newUser._id);

        await sendUserWelcomeEmail(newUser.email, newUser.first_Name, newUser.last_Name);

        res.status(200).json({
            success: true, msg: "Email verified successfully",
            
            newUser: {
                ...newUser._doc,
                password: undefined,
            }
        });

    } catch (error) {
        console.log("error in verifyingEmail", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

// Handle student login
export const studentLogin = async (req, res) => {
    const {email, password} = req.body;
    try {
        // Find user and verify password
        const newUser = await User.findOne({email}).select("+password");
        if(!newUser){
            return res.status(400).json({success:false, msg: "Invalid credentials"});
        }
        const isPasswordValid = await bcrypt.compare(password, newUser.password);
        if(!isPasswordValid){
            return res.status(400).json({success:false, msg: "Invalid credentials"});
        }

        // Generate token and update last login
        generateUserTokenAndSetCookie(res, newUser._id);

        newUser.lastLogin = new Date();
        await newUser.save();

        res.status(200).json({
            success:true,
            msg: "Logged in successfully",
            newUser: {
                ...newUser._doc,
                password: undefined,
                confirmPassword: undefined,
            },
        })

    }catch(error){
        console.log("Error in login", error);
        res.status(400).json({success:false, msg: error.message});
    }
};

// Handle student logout
export const studentLogout = async (req, res) => {
    res.clearCookie("userToken");
    res.status(200).json({success:true, msg: "Logged out successfully"});  
};

// Handle student forgot password request
export const studentForgotPassword = async (req, res) => {
    const {email} = req.body;
    console.log("Received forgot password request for email:", email); 
    try{
        const newUser = await User.findOne({email});
        console.log("User found:", newUser); 
        
        if(!newUser){
            return res.status(400).json({success:false, msg: "User not found"});
        }
        // Generate reset token valid for 10 minutes
        const resetToken = crypto.randomBytes(20).toString("hex");
        const restTokenExpire = Date.now() + 10 * 60 * 1000;

        newUser.resetPasswordToken = resetToken;
        newUser.resetPasswordExpire = restTokenExpire;

        await newUser.save();

        await sendUserPasswordResetEmail(newUser.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
        res.status(200).json({success:true, msg: "Reset password email sent successfully"});

    }catch(error){
        console.log("Error in forgot password", error);
        res.status(400).json({success:false, msg: error.message});
    }
};

// Handle student password reset
export const studentResetPassword = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;
        const newUser = await User.findOne({resetPasswordToken: token,
            resetPasswordExpire: {$gt: Date.now()}
        });

        if(!newUser){
            return res.status(400).json({success:false, msg: "Invalid or expired reset token"});
        }

        // Update password and clear reset token
        const hashedPassword = await bcryptjs.hash(password, 10);
        newUser.password = hashedPassword;
        newUser.resetPasswordToken = undefined;
        newUser.resetPasswordExpire = undefined;
        await newUser.save();

        await sendUserPasswordResetSuccessEmail(newUser.email);

        res.status(200).json({success:true, msg: "Password reset successfully"});
    }catch(error){
        console.log("Error in reset password", error);
        res.status(400).json({success:false, msg: error.message});
    }
};

// Check student authentication status
export const studentCheckAuth = async (req, res) => {
    try{
        const newUser = await User.findById(req.user.userid).select("-password");
        if(!newUser){
            return res.status(400).json({success:false, msg: "User not found"});
        }

        res.status(200).json({success: true,  newUser});

    }catch(error){
        console.log("Error in checkAuth", error);
        res.status(400).json({success:false, msg: error.message});
    }
};  





// Company Authentication Controllers

// Handle company registration
export const companySignup = async (req, res) => {
    console.log("Received signup request");

    const { companyName, companyPhoneNumber, companyEmail, password, confirmPassword, industryType, headquarterLocation, companySize, yearOfEstablishment, pointOfContactFirstName, pointOfContactLastName, pointOfContactDesignation, pointOfContactEmail, pointOfContactPhoneNumber, jobRoles, areasOfExpertiseSought, companyLogo, companyWebsite, linkedInProfile } = req.body;

    try {
        // validate request fields
        console.log("Request body:", req.body);
        if (!companyName || !companyPhoneNumber || !companyEmail || !password || !confirmPassword || !industryType || !headquarterLocation || !companySize || !yearOfEstablishment || !pointOfContactFirstName || !pointOfContactLastName || !pointOfContactDesignation || !pointOfContactEmail || !pointOfContactPhoneNumber || !jobRoles || !areasOfExpertiseSought || !companyWebsite || !linkedInProfile) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                msg: "Passwords do not match",
            });
        }

        // check if company already exists
        const companyAlreadyExists = await Company.findOne({ companyEmail });
        if (companyAlreadyExists) {
            return res.status(400).json({ success: false, msg: "Company already exists" });
        }

        // Hash password and create verification token
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        // Parse JSON strings for job roles and expertise
        const parsedJobRoles = JSON.parse(jobRoles);
        const parsedExpertise = JSON.parse(areasOfExpertiseSought);

        // Create new company in database
        const company = new Company({
            companyName,
            companyPhoneNumber,
            companyEmail,
            password: hashedPassword,
            confirmPassword,
            industryType,
            headquarterLocation,
            companySize,
            yearOfEstablishment,
            pointOfContactFirstName,
            pointOfContactLastName,
            pointOfContactDesignation,
            pointOfContactEmail,
            pointOfContactPhoneNumber,
            jobRoles: parsedJobRoles,
            areasOfExpertiseSought: parsedExpertise,
            companyLogo,
            companyWebsite,
            linkedInProfile,
            verificationToken,
            verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000,
        });

        await company.save();

        // Generate JWT and send verification emails
        generateCompanyTokenAndSetCookie(res,company._id);

        await sendCompanyVerificationEmail( companyEmail,verificationToken);
        await sendCompanyWelcomeEmail(company.companyEmail, company.companyName, company.pointOfContactFirstName, company.pointOfContactEmail);

        res.status(201).json({
            success: true,
            msg: "Company created successfully",
            company: {
                ...company._doc,
                password: undefined,
                confirmPassword: undefined,
            },
        });
    } catch (error) {
        res.status(400).json({ success: false, msg: error.message });
    }
};

// Verify company email address
export const verifyCompanyEmail = async (req, res) => {
    console.log("Request body:", req.body);
    const { code } = req.body;
    console.log("Verification token lookup:", { code });
    
    console.log("Received code:", code);
    if (!code) {
        return res.status(400).json({ success: false, msg: "Verification code is required" });
    }
    console.log("Verification code received:", code);
    try {
        // Find company with valid verification token
        const company = await Company.findOne({ verificationToken: code, verificationTokenExpire: { $gt: Date.now() } });
        console.log("Company found:", company);
        if (!company) {
            return res.status(400).json({ success: false, msg: "Invalid or expired verification code" });
        }

        // Update company verification status
        company.isVerified = true;
        company.verificationToken = undefined;
        company.verificationTokenExpire = undefined;
        await company.save();

        console.log("Company marked as verified:", company);

        await sendCompanyWelcomeEmail(company.companyEmail, company.companyName, company.pointOfContactEmail, company.pointOfContactFirstName);

        generateCompanyTokenAndSetCookie(res, company._id);

        res.status(200).json({
            success: true, msg: "Email verified successfully",
            company: {
                ...company._doc,
                password: undefined,
            }
        });

    } catch (error) {
        console.log("error in verifyingEmail", error);
        res.status(500).json({ success: false, msg: "Server error" });
    }
}

// Handle company login
export const companyLogin = async (req, res) => {
    const {companyEmail, password} = req.body;
    console.log("Received login request for email:", {companyEmail});
    try {
        // Find company and verify password
        const company = await Company.findOne({companyEmail}).select("+password");
        console.log("Company found:", company);
        if(!company){
            return res.status(400).json({success:false, msg: "Invalid credentials"});
        }
        const isPasswordValid = await bcrypt.compare(password, company.password);
        if(!isPasswordValid){
            return res.status(400).json({success:false, msg: "Invalid credentials"});
        }

        // Generate token and update last login
        generateCompanyTokenAndSetCookie(res, company._id);

        company.lastLogin = new Date();
        await company.save();

        res.status(200).json({
            success:true,
            msg: "Logged in successfully",
            company: {
                ...company._doc,
                password: undefined,
                confirmPassword: undefined,
            },
        })

    }catch(error){
        console.log("Error in login", error);
        res.status(400).json({success:false, msg: error.message});
    }
};

// Handle company logout
export const companyLogout = async (req, res) => {
    res.clearCookie("companyToken");
    res.status(200).json({success:true, msg: "Logged out successfully"});  
};

// Handle company forgot password request
export const companyForgotPassword = async (req, res) => {
    const {companyEmail} = req.body;
    console.log("Received forgot password request for email:", companyEmail); 
    try{
        // Find company by email
        const company = await Company.findOne({companyEmail});
        console.log("Company found:", company); 
        
        if(!company){
            return res.status(400).json({success:false, msg: "Company not found"});
        }
        // Generate reset token valid for 10 minutes
        const resetToken = crypto.randomBytes(20).toString("hex");
        const restTokenExpire = Date.now() + 10 * 60 * 1000;

        company.resetPasswordToken = resetToken;
        company.resetPasswordExpire = restTokenExpire;

        await company.save();

        // Send password reset email
        await sendCompanyPasswordResetEmail(company.companyEmail, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
        res.status(200).json({success:true, msg: "Reset password email sent successfully"});

    }catch(error){
        console.log("Error in forgot password", error);
        res.status(400).json({success:false, msg: error.message});
    }
};

// Handle company password reset
export const companyResetPassword = async (req, res) => {
    try {
        const {token} = req.params;
        const {password} = req.body;

        // Find company with valid reset token
        const company = await Company.findOne({resetPasswordToken: token,
            resetPasswordExpire: {$gt: Date.now()}
        });

        if(!company){
            return res.status(400).json({success:false, msg: "Invalid or expired reset token"});
        }

        // Update password and clear reset token
        const hashedPassword = await bcryptjs.hash(password, 10);
        company.password = hashedPassword;
        company.resetPasswordToken = undefined;
        company.resetPasswordExpire = undefined;
        await company.save();

        await sendCompanyPasswordResetSuccessEmail(company.companyEmail);

        res.status(200).json({success:true, msg: "Password reset successfully"});
    }catch(error){
        console.log("Error in reset password", error);
        res.status(400).json({success:false, msg: error.message});
    }
};

// Check company authentication status
export const companyCheckAuth = async (req, res) => {
    try{
        // Find company by ID and verify existence
        const company = await Company.findById(req.company.companyid).select("-password");
        if(!company){
            return res.status(400).json({success:false, msg: "Company not found"});
        }

        res.status(200).json({success: true, company});

    }catch(error){
        console.log("Error in checkAuth", error);
        res.status(400).json({success:false, msg: error.message});
    }
};