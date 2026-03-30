import nodemailer from "nodemailer";

import { config } from "../config/env";

const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
    },
});

export async function sendMailTo(to: string, subject: string, text: string): Promise<void> {
    await transporter.sendMail({
        from: config.smtpFrom,
        to,
        subject,
        text,
    });
}