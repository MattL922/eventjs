const newBroker = (state, update) => {
    // stop the previous observer
    document.Eventjs && document.Eventjs.observer
        ? document.Eventjs.observer.disconnect()
        : null;

    document.Eventjs = {
        subscribers: {},
        state,
        update,
    };

    document.Eventjs.observer = new MutationObserver((mutations, _) => {
        // removed nodes
        mutations
            .map(m => m.removedNodes)
            .map(l => Array.from(l))
            .reduce((acc, cur) => acc.concat(cur), [])
            .filter(n => n.attributes)
            .filter(n => n.attributes.subscribe)
            .filter(n => n.attributes.id)
            .forEach(n => delete document.Eventjs.subscribers[n.attributes.id.value]);

        // updated nodes
        mutations
            .filter(m => m.type === "attributes")
            .filter(m => m.attributeName === "subscribe")
            .filter(m => m.target.attributes)
            .filter(m => m.target.attributes.subscribe)
            .filter(m => m.target.attributes.id)
            .forEach(m => document.Eventjs.subscribers[m.target.attributes.id.value] = m.target.attributes.subscribe.value.split(" "));

        // added nodes
        mutations
            .map(m => m.addedNodes)
            .map(l => Array.from(l))
            .reduce((acc, cur) => acc.concat(cur), [])
            .filter(n => n.attributes)
            .filter(n => n.attributes.subscribe)
            .filter(n => n.attributes.id)
            .forEach(n => document.Eventjs.subscribers[n.attributes.id.value] = n.attributes.subscribe.value.split(" "));
    });

    document.Eventjs.observer.observe(
        document.querySelector("body"),
        {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ["subscribe"],
            characterData: false,
        },
    );
};


const dispatch = e => {
    document.Eventjs.state = document.Eventjs.update(document.Eventjs.state, e);
    e = new CustomEvent(e.type, { detail: document.Eventjs.state });
    Object.keys(document.Eventjs.subscribers)
        .filter(k => document.Eventjs.subscribers[k].includes(e.type))
        .forEach(k => setTimeout(() => document.querySelector(`#${k}`).dispatchEvent(e)));
};
