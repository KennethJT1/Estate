import {
  AWSSES,
  DATABASE,
  EMAIL_FROM,
  REPLY_TO,
  JWT_SECRET,
  CLIENT_URL,
} from "../config";

const style = `
background: #eee;
padding: 20px;
border-radius:20px;
`;

export const emailTemplate = (
  email: any,
  content: any,
  replyTo: any,
  subject: any
) => {
  return {
    Source: EMAIL_FROM,
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
              <h1>Welcome to KJT realist Estate</h1>
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
