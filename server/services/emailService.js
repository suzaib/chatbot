const sendEmai = require("./resendService");

const sendOTPToEmail = async (email, otp) => {
    const subject = "Verify Your Account";

    const html = `
        <div style="font-family: Arial, sans-serif;">
            <h2>Email Verification</h2>
            <p>Your OTP for verification is:</p>

            <h1 style="letter-spacing: 5px;">
                ${otp}
            </h1>

            <p>This OTP will expire in 5 minutes.</p>

            <p>If you did not request this OTP, please ignore this email.</p>
        </div>
    `;

    return await sendEmail({
        to: email,
        subject,
        html,
    });
};

module.exports=sendOTPToEmail
