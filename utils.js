window.utils = {
    jsonp: function(url, callback) {
        var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());

        window[callbackName] = function(data) {
            delete window[callbackName];
            document.body.removeChild(script);
            callback(data);
        };

        var script = document.createElement('script');
        script.src = url.replace("$CALLBACK", callbackName);
        document.body.appendChild(script);
    },

    shouldRemove: function(element) {
        return element.getBoundingClientRect().bottom < 0;
    },

    removeElement:function (array, object) {
        return array.filter((item) => item.props.key !== object.props.key);
    },
};