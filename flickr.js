
window.flickr = {
    $root: null,
    flickrApi: "https://api.flickr.com/services/feeds/photos_public.gne?tags=universe&format=json&jsoncallback=$CALLBACK",
    state: {
        viewportItems: [],
        selectedImage: {src: null},
        imagePool: [],
        loading: false,

    },

    renderScreen: () => {

        var params = ["div", {key: 100, className: "flex-container"}].concat(flickr.state.viewportItems),
            modalNode = null;

        if (flickr.state.selectedImage.src) {
            modalNode = vdom.node("div", {key: 80, className: "modal", onclick: function() {
                        flickr.state.selectedImage.src = null;
                        flickr.renderScreen();
                    }},
                vdom.node("img", {src: flickr.state.selectedImage.src})
            );
        }


        var imgContainer = vdom.node.apply(null, params),
            app = null;

        if (flickr.state.selectedImage.src) {
            app = vdom.node("div", {key: 101},
                vdom.node("div",{key: 102, className: "top-bar"}, "flickr"),
                modalNode
            );
        } else {
            app = vdom.node("div", {key: 101},
                vdom.node("div",{key: 102, className: "top-bar"}, "flickr"),
                imgContainer
            );
        }

        vdom.renderDom(flickr.$root, app);
    },

    isLoadingNode: function(node) {
        return node.children[0] && node.children[0].startsWith("loading");
    },
    
    promiseMeImages: () => {
        return new Promise(function (r, e) {
            if (flickr.state.loading) return e("rejecting");
            if (flickr.state.imagePool.length>=20) {
                r(flickr.state.imagePool);
            } else {
                flickr.state.loading = true;
                utils.jsonp(flickr.flickrApi, function(data) {
                    flickr.state.loading = false;
                    var items = data.items;
                    items.forEach((item) => {
                        flickr.state.imagePool.push(item);
                    });
                    r(flickr.state.imagePool);
                });
            }

        });
    },

    pullImages: () => {
        flickr.promiseMeImages().then((items) => {
            flickr.state.viewportItems = flickr.state.viewportItems.map((img) => {
                if(flickr.isLoadingNode(img)) {
                    var item = items.shift();
                    if (item)
                        img = vdom.node("img", {key: img.props.key, onclick: function() {
                                flickr.state.selectedImage.src = this.src;
                                flickr.renderScreen();
                            }, className: "flex-item", src: item.media.m});
                }
                return img;
            });
        })
        .catch((error) => {})
        .finally(() => {
            flickr.renderScreen();
        });
    },

    put20Nodes: () => {
        var slots = flickr.state.viewportItems.length,
            lastIndex = flickr.state.viewportItems.length>0?flickr.state.viewportItems[slots-1].props.key:0;
        for(var i=lastIndex+1; i<=lastIndex+(20-slots); i++) {
            flickr.state.viewportItems.push(vdom.node("div", {key: i, className: "flex-item loading"}, "loading"))
        }
        flickr.pullImages();
    },

    flickrApp: ($root) => {
        flickr.$root = $root;
        flickr.put20Nodes();
        flickr.renderScreen();
    },

    restoreScrollPos: function() {
        var rect = flickr.state.viewportItems[0].ref.getBoundingClientRect(),
            underScreen = false,
            previousScrollY = 0;

        if (rect.top<0) {
            underScreen = true;
            previousScrollY = window.scrollY;
        } else {
            previousScrollY = flickr.state.viewportItems[0].ref.offsetTop - window.scrollY - 74;
        }

        flickr.renderScreen(flickr.state.viewportItems);

        if (underScreen)
            window.scrollTo(0, previousScrollY);
        else
            window.scrollTo(0, Math.abs(previousScrollY));
    },

    sliceOutOfViewport: function() {
        var clonedItems = flickr.state.viewportItems.slice(0),
            i = 0,
            head = clonedItems[i];

        while(head && head.ref && window.utils.shouldRemove(head.ref)) {
            flickr.state.viewportItems = utils.removeElement(flickr.state.viewportItems, head);
            head = clonedItems[i+1];
            i++;
        }

        flickr.put20Nodes();
        flickr.restoreScrollPos();
    }
};
