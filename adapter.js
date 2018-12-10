let sprintf = require(`sprintf-js`).sprintf
    , instance = null
;

class Adapter {
    constructor() {
        wls.name = `wlsjs`;

        this.connection = require(`@steemit/steem-js`);
        this.reconnect();
    }

    static instance() {
        if (null === instance) {
            instance = new Adapter();
        }

        return instance;
    }

    reconnect() {
        wls.connection.api.setOptions({ url: 'wss://whaleshares.io/ws' });
        wls.connection.config.set('address_prefix', 'WLS');
        wls.connection.config.set('chain_id', 'de999ada2ff7ed3d3d580381f229b40b5a0261aec48eb830e540080817b72866');
    }

    async processAccountInfo(username, callback) {
        wls.reconnect();
        wls.connection.api.getAccounts([username], function (err, result) {
            if (err) {
                console.error(sprintf(`Adapter: Failed to load account info: "%s"`, username));
                console.error(err);

                return;
            }
            if (result.length < 1) {
                console.error(sprintf(`Adapter: Account "%s" not found.`, username));

                return;
            }

            callback(result[0]);
        });
    }

    async processGetContent(author, permlink, successCallback, failCallback) {
        wls.reconnect();
        wls.connection.api.getContent(author, permlink, function (err, result) {
            if (err) {
                console.info(author, permlink);
                console.error(`Error during getContent appeared.`);
                console.error(err);

                if (failCallback) {
                    failCallback()
                }

                return;
            }
            if (result.id === 0) {
                console.info(author, permlink);
                console.error(`Post not found.`);

                if (failCallback) {
                    failCallback(result);
                }

                return;
            }
            successCallback(result);
        });
    }

    async processVote(wif, voter, author, permlink, weight, successCallback, failCallback) {
        wls.reconnect();
        wls.connection.broadcast.vote(wif, voter, author, permlink, weight, function(err, result) {
            if (err) {
                console.info(voter, author, permlink, weight);
                console.error(`Error during vote appeared.`);
                console.error(err);

                if (failCallback) {
                    failCallback(result);
                }

                return;
            }
            successCallback(result);
        });
    }
}

module.exports.Adapter = Adapter;
