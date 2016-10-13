var FCM = require('fcm-node');

var serverKey = 'AIzaSyDp0xta1drbJbd1HhzxsaSTTZ-xakTM4_I';
var fcm = new FCM(serverKey);

var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to: 'd1N3gl9-mTE:APA91bG977lJd3SvuxvqnvoviN-IU2-5DhPAIsI7vaqio1DLtj4jjff6l0ilDpfDm5rBNm7WCxpMOjJO5UlaxgmrYtsNu9S8hwPPVdhCa8xco8jcwUR-6U6WsHUyazfg8M_8G55bCrgU',
    collapse_key: 'your_collapse_key',

    notification: {
        title: 'TEST~~',
        body: '베이비'
    },

    data: {  //you can send only notification or only data(or include both)
        my_key: 'my value',
        my_another_key: 'my another value'
    }
};

fcm.send(message, function(err, response){
    if (err) {
        console.log("Something has gone wrong!");
    } else {
        console.log("Successfully sent with response: ", response);
    }
});
