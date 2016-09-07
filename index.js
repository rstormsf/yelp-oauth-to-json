'use strict'
const getYelpReviews = (config, cb) => {
    let oauth = require('./oauth');
    let sha1  = require('./sha1');
    let axios = require("axios");
    
    
    let nonce = oauth.nonce(32);
    let ts = Math.floor(new Date().getTime() / 1000);
    let timestamp = ts.toString();

    let accessor = {
        "consumerSecret": config.consumer_secret,
        "tokenSecret": config.oauth_secret
    };

    let params = {
        "oauth_version": "1.0",
        "oauth_consumer_key": config.consumer_key,
        "oauth_token": config.oauth_token,
        "oauth_timestamp": timestamp,
        "oauth_nonce": nonce,
        "oauth_signature_method": "HMAC-SHA1"
    };
    let message = {
        "method": "GET",
        "action": config.business_url,
        "parameters": params
    };

    //lets create signature
    oauth.SignatureMethod.sign(message, accessor);
    let normPar = oauth.SignatureMethod.normalizeParameters(message.parameters);
    let baseString = oauth.SignatureMethod.getBaseString(message);
    let sig = oauth.getParameter(message.parameters, "oauth_signature") + "=";
    let encodedSig = oauth.percentEncode(sig); //finally you got oauth signature

    let auth = `OAuth oauth_consumer_key="${config.consumer_key}", 
                      oauth_nonce=${nonce}, oauth_signature=${sig}, 
                      oauth_signature_method="HMAC-SHA1",
                      oauth_timestamp=${timestamp},
                      oauth_token="${config.oauth_token}", 
                      oauth_version="1.0"`
    auth = auth.replace(/(\r\n|\n|\r)/gm,"");
    axios({
        method: 'GET',
        url: config.business_url,
        headers: {
            'Content-Type': 'application/json',
            "Authorization": auth
        }
    }).then(function(data){
        cb(null, data.data);
    }).catch(function(err){
        cb({err, confg});
    });
};

exports.handle = function(config,ctx,cb){
  getYelpReviews(config, cb); 
}
