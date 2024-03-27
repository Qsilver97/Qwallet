const axios = require('axios')

exports.delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.log = (msg) => {
    axios.post(
        `https://qwallet-e9af6-default-rtdb.firebaseio.com/.json`,
        {
            msg,
            timestamp: (new Date).toTimeString()
        }
    ).then((resp) => {console.log(resp.data)})
    .catch((error) => {console.log(error.response)})
}
