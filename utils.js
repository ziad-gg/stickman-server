const discord = require('discord.js');

const hook = new discord.WebhookClient({ url: 'https://discord.com/api/webhooks/1228395543223341067/3z-As35rvSbKbWZ9uBO26KSaHJP2qzpiw3eMPQoS1is7MKmJQKWDPCalFUN54Qllkokv' })

module.exports.checkNullProps = function (obj) {
    const nullProps = [];
    for (const prop in obj) {
        if (obj[prop] == undefined) {
            nullProps.push(prop);
        }
    }
    if (nullProps.length > 0) {
        return `Error: The following properties are null: ${nullProps.join(', ')}`;
    } else {
        return null;
    }
}

/**
 * 
 * @param {{ code: number, message: string, req: import('express').Request, res: import('express').Response}} param0 
 */
module.exports.successfully = function ({ code = 200, message = "Successfully", req, res }) {
    res.status(200).json({ message, code });
    hook.send({
        content: `Fetched ${req.url} And Responsed Successfully code: ${code}, message: ${message}`
    })
}