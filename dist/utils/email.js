"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplate = void 0;
const config_1 = require("../config");
const style = `
background: #eee;
padding: 20px;
border-radius:20px;
`;
const emailTemplate = (email, content, replyTo, subject) => {
    return {
        Source: config_1.EMAIL_FROM,
        Destination: {
            ToAddresses: [email],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `
              <html>
              <div style="${style}">
              <h1>Welcome to KJT Estate App</h1>
                ${content}
              <p>&copy; ${new Date().getFullYear()}</p>
              </div>
              </html>               
           `,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
    };
};
exports.emailTemplate = emailTemplate;
