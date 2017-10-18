var _ = require('lodash');

module.exports = (apiMethod) => {
    return function (req, res, next) {
        var object = req.body;
        var options = _.extend({}, req.file, {ip: req.ip}, req.query, req.params, {
            context: { }
        });

        if (_.isEmpty(object)) {
            object = options;
            options = {};
        }

        return apiMethod(object, options).then(function then (response) {
            if (req.method === 'DELETE') {
                return res.status(204).end();
            }
            if (res.get('Content-Type') && res.get('Content-Type').indexOf('text/csv') === 0) {
                return res.status(200).send(response);
            }

            if (_.isFunction(response)) {
                return response(req, res, next);
            }

            res.json(response || {});
        }).catch(function onAPIError (error) {
            next(error);
        });
    };
};