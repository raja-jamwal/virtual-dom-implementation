window.vdom = {
    trackId: 0,
    oldDom: null,
    createElement: (node) => {
        if (typeof node === 'string') {
            return document.createTextNode(node);
        }

        const $el = document.createElement(node.type);
        node.ref = $el;
        node.trackId = node.props.key;
        $el.setAttribute("trackId", node.props.key);
        Object.assign($el, node.props);
        node.children
            .map(window.vdom.createElement)
            .forEach($el.appendChild.bind($el));
        return $el;
    },
    changed: (node1, node2) => {
        var result = typeof node1 !== typeof node2 ||
            typeof node1 === 'string' && node1 !== node2 ||
            node1.type !== node2.type || ( (node1.props && node2.props) && node1.props.key !== node2.props.key);
        return result;
    },
    deletePool: {},
    updateElement: ($parent, newNode, oldNode, index = 0) => {
        if (!oldNode) {
            $parent.appendChild(
                window.vdom.createElement(newNode)
            );
        } else if (!newNode) {
            // add to delete pool for deleting later
            const $trackId = $parent.getAttribute("trackId");
            const existingChildren = window.vdom.deletePool[$trackId] && window.vdom.deletePool[$trackId].children || [];
            existingChildren.push($parent.childNodes[index]);
            window.vdom.deletePool[$trackId] = {$parent: $parent, children: existingChildren};
        } else if (window.vdom.changed(newNode, oldNode)) {
            $parent.replaceChild(
                window.vdom.createElement(newNode),
                $parent.childNodes[index]
            );
        } else if (newNode.type) {
            const newLength = newNode.children.length;
            const oldLength = oldNode.children.length;
            for (let i = 0; i < newLength || i < oldLength; i++) {
                window.vdom.updateElement(
                    $parent.childNodes[index],
                    newNode.children[i],
                    oldNode.children[i],
                    i
                );
            }
        }
    },
    node: (type, props, ...children) => {
        return { type, props, children };
    },
    renderDom: ($root, newDom) => {
        window.vdom.updateElement($root, newDom, window.vdom.oldDom);
        Object.keys(window.vdom.deletePool).forEach((id) => {
            const $parent = window.vdom.deletePool[id].$parent;
            const children = window.vdom.deletePool[id].children;
            children.forEach((child) => $parent.removeChild(child));
        });
        window.vdom.oldDom = newDom;
        window.vdom.deletePool = {};
    }
};