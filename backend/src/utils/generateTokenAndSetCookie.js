import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, companyid) => {
    const token = jwt.sign({ companyid }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("token", token, {
        httpOnly: true, //XSS attack
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", //csrf
        maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    });


    return token;
};