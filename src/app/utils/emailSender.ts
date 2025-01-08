import nodemailer from 'nodemailer';

const emailSender = async (receiverEmail: string, html: string) => {
   const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
         user: 'mizanmahi.ph@gmail.com',
         pass: 'nnlq bssv inyp elex',
      },
   });

   // send mail with defined transport object
   const info = await transporter.sendMail({
      from: '"Next Mart" <support@nextmart.com>', // sender address
      to: receiverEmail, // list of receivers
      subject: 'Reset Password Link', // Subject line
      //   text: 'Hello world?', // plain text body
      html, // html body
   });

   console.log('Message sent: %s', info.messageId);
};

export default emailSender;
