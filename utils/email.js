const nodemailer = require('nodemailer');

const sendEmail = async options => {
    
    //1.create transpoter
    const transporter = nodemailer.createTransport({
        //1.service: 'Gmail',//it can be any yahoo,hotmail
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }

        //2.Activate the less secure app option in gmail
    })

    //2.Define the email options
    const mailOptions = {
        from: 'Eklavya Nath <nu1@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    //3.send the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;