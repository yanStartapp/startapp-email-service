'use strict';
var templateService = require('../template.service.js'),
    nodemailer = require('nodemailer');

class NodemailerProvider {
    constructor(config) {
        this.name = "nodemailer";
        this.transport = nodemailer.createTransport(config);
    }

    send(template, mailSettings, templateData) {

        let from = typeof mailSettings.from !== 'undefined' ? mailSettings.from : template.from;

        return new Promise((resolve, reject) => {
            templateService.getHtml(template, templateData).then((stringHtml) => {

                // prepare options object
                var transportOptions = {
                    from: `${from.name} <${from.email}>`, // Do not change - must be verified email address of startapp.com
                    to: mailSettings.to,
                    sender: mailSettings.sender || template.sender,
                    replyTo: mailSettings.replyTo || template.replyTo,
                    subject: mailSettings.subject || template.subject,
                    html: stringHtml
                };
                
                // send email
                this.transport.sendMail(transportOptions, (err, responses) => {
                    this.transport.close();
                    if (err) {
                        return reject(err);
                    }

                    let results = [];

                    responses.accepted.forEach((accepted) => {
                        results.push({
                            status: 'sent',
                            email: accepted
                        });
                    });

                    responses.rejected.forEach((rejected) => {
                        results.push({
                            status: 'rejected',
                            email: rejected
                        });
                    });

                    resolve(results);
                });
            }, (err) => {
                return reject(err);
            });
        });
    }
}

module.exports = NodemailerProvider;
