const CDP = require('chrome-remote-interface');

CDP((client) => {
    // extract domains
    const {Network, Page} = client;
    // setup handlers
    Network.requestWillBeSent((params) => {
        console.log(params.request.url);
    });
    Page.loadEventFired(() => {
        client.close();
    });
    // enable events then start!
    Promise.all([
        Network.enable(),
        Page.enable()
    ]).then(() => {
        return Page.navigate({url: 'https://latest.pinterest.com'});
    }).then(() => {
        return new Promise(resolve => {
            CDP.List(function (err, targets) {
                if (!err) {
                    // console.log('targets:', targets);
                    resolve()
                }
            });
        })
    }).catch((err) => {
        console.error(err);
        client.close();
    });
}).on('error', (err) => {
    // cannot connect to the remote endpoint
    console.error(err);
});