const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'tkhara@gmail.com',
        subject: 'Thanks for joining in',
        text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'tkhara@gmail.com',
        subject: 'We\'re sorry to see you leave',
        text: `Could we have done anything better, ${name}? Please do let me know.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}