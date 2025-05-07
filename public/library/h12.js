/**
    * H12 component class
    * @description
    * * Client version: `v2.2.0`
    * * Transform version required: `v2.2.0`
    * * Github: https://github.com/ayushpaultirkey/h12
*/
export default class H12 {

    constructor() {

        /**
            * The unique identifier for the component. 
            * This ID is automatically generated using `H12.raid()` and should not be manually updated or changed 
            * after the component is rendered.
            * 
            * @type {string}
        */
        this.id = H12.raid();

         /**
            * The root element associated with this component.
            * 
            * @type {Element}
        */
        this.root = null;

        /**
            * Arguments passed to the component, which can be used to initialize or configure the component.
            * This object can store any data passed during initialization.
            * 
            * @type {any}
        */
        this.args = {};

         /**
            * The parent component of this instance.
            * This is used to refer to the component's parent within a hierarchical structure.
            * 
            * @type {H12}
        */
        this.parent = null;

        /**
            * A collection of child components.
            * The keys in this object represent identifiers, and the values are instances of child components (`H12`).
            * 
            * @type {Object<string, H12>}
        */
        this.child = {};

        /**
            * A collection of unique elements associated with this component.
            * 
            * @type {Object<string, Element>}
        */
        this.element = {};

        /**
            * A key-value pairs with setter functions for each key.
            * Alternatively, the `set()` function can be used to update values.
            * 
            * Note: The setter functions do not support appending via "++" (i.e., "{key}++").
            * 
            * @type {Object<string, function(value: any): void>}
            * 
            * @example
            * const { age } = this.key;
            * age(23);
            * // Equivalent to
            * this.set("{age}", 23);
        */
        this.key = {};

        /**
            * A data that is passed from the parent component to its child components.
            * If the child component doesnt have its own relay declared then it will
            * be appended along with the parent relay.
        */
        this.relay = null;

    }

    /**
        * A private object used to store bindings for the component.
        * - `element`: An array of elements associated with the binding.
        * - `data`: Data of the key.
        * - For text bindings, the `type` will be `0`.
        * - For element bindings, the `type` will be `1`.
        * - For attribute bindings, the `type` will be `2`.
        * 
        * @private
        * @type {Object<string, { element: Array<{ node: Element | Text, type: 0 | 1 | 2, parent?: Element, clone?: Element[], name?: string, map?: string }>, data: string }>}
    */
    #binding = {};

    /**
        * Adds a binding for the specified key with the associated data.
        * If the key doesn't already exist in the `#binding` object, it is initialized with an empty `element` array.
        * 
        * - For text bindings, the `type` will be `0`.
        * - For element bindings, the `type` will be `1`.
        * - For attribute bindings, the `type` will be `2`.
        * 
        * @private
        * @param {string} key - The key for the binding.
        * @param {{ node: Element | Text, type: 0 | 1 | 2, parent?: Element, clone?: Element[], name?: string, map?: string }} data - The data to be bound to the key.
    */
    #bind(key, data) {

        if (!this.key[key]) {
            const name = key.replace(/{|}/g, "");
            this.key[name] = (value, position) => this.set(position ? position.replace(/\w+/gm, key) : key, value);
        }
        const bind = this.#binding;
        if (!bind[key]) bind[key] = { element: [], data: "" };
        bind[key].element.push(data);
        
    }

    /**
        * This function is called after the component is built and ready to be rendered.
        * 
        * @param {*} args - The arguments passed by the `pre()` function. Alternatively, 
        * these can be accessed via `this.args`.
        * 
        * @example
        * async main(args = {}) {
        *   this.set("{color}", "red");
        * }
    */
    main(args = {}) {}

    /**
        * Creates a render template for the element.
        * 
        * @returns {Element | null} The rendered element or `null` if rendering fails.
        * 
        * @example
        * // Example usage:
        * render() {
        *   return <>
        *       <div>Hello world</div>
        *   </>;
        * }
        * 
        * // This will be converted to:
        * render() {
        *   return this.node("div", ["Hello world"]);
        * }
    */
    render() {
        return this.node("div");
    }

    /**
        * Prepares the component for rendering and initializes the values.
        * 
        * @param {string} element - The query selector of the element.
        * @param {*} args - The arguments to be passed while creating the component.
        * @returns {Element|null} A promise that resolves to the initialized element or `null` if initialization fails.
        * 
        * @example
        * document.body.appendChild(new App().init());
    */
    init() {
        try {

            this.root = this.render();
            this.#unique("id", this.element);
            this.main(this.args);

            return this.root;
            
        }
        catch(error) {
            console.error(error);
        }
    }

    /**
        * The node along with its attributes, children and keys.
        *
        * @typedef {Object} Node
        * @param {string} type - The name of the element or component to create.
        * @param {string[]} children - An array of child elements or strings to include as content.
        * @param {Object.<string, {value: string, keys: string[]}>} attributes - An object of attribute with their value and kets.
        * @param {string[]} keys - An array of keys for bindings, used when the current element's text, not its children.
        * @returns {Element} The created element.
        * 
        * @example
        * this.node("div", ["Hello world"]);
        * this.node("div", ["Hello {name}"], {}, [ "{name}" ]);
        * this.node("div", ["Hello world"], { class: { value: "bg-red-500" } });
        * this.node("div", ["Hello world"], { class: { value: "bg-{color}-500", keys: ["color"] } });
        * this.node("div", ["Hello world"], { onclick: { value: () => {} } });
    */
    node(type = "", children = [], attributes = {}, keys = [], svg) {

        const element = svg ? document.createElementNS(svg, type) : document.createElement(type);

        children.forEach(child => {

            const type = typeof(child);
            if (type === "string") {

                const textNode = document.createTextNode(child);
                element.append(textNode);

                if (!keys || !keys.includes(child)) return;

                this.#bind(child, { node: textNode, type: 0, parent: textNode.parentNode, clone: [] });

            }
            else {
                element.append(type === "function" ? child.bind(this)() : child);
            }

        });

        Object.entries(attributes).forEach(([attribute, { keys, value }]) => {

            if (keys) keys.forEach(key => this.#bind(key, { node: element, type: 2, name: attribute, map: value }));
    
            if (typeof value === "function") {
                const fname = attribute.slice(2);
                attribute.startsWith("on") ? element.addEventListener(fname, this.#addEvent(element, fname, value)) : element.setAttribute(attribute, value());
            }
            else {
                element.setAttribute(attribute, value);
            }
            
        });

        return element;

    }

    destroy() {
        this.#gc();
        Object.values(this.child).forEach(child => child.destroy());
        delete this.parent.child[this.id];
        this.root.remove();
    }

    #events = new Map();
    #gc(force = false) {
        for(const [element, data] of this.#events) {
            if(element.isConnected && !force) continue;
            data.forEach(([n, f]) => element.removeEventListener(n, f));
            this.#events.delete(element);
        }
    }
    #addEvent(element, name, method) {

        let bindedMethod = method.bind(this);
        let data = this.#events.get(element) || [];
        data.push([name, bindedMethod]);
        this.#events.set(element, data);

        return bindedMethod;

    }

    /**
        * Creates and initializes a child component, passing arguments and associating it with a parent.
        * 
        * @param {H12} node - The class constructor of the component to instantiate.
        * @param {Array<Element> | Function} children - An array of child elements for the child component.
        * @param {any} args - Arguments to be passed to the child component during initialization.
        * 
        * @returns {H12 | undefined} An initialized component or `undefined` if no valid node is provided.
    */
    component(node = null, children = [], args = {}) {
        if (node instanceof Object) {
            
            /**
             * @type {H12}
            */
            const component = new node();

            component.id = args.id || component.id;
            component.parent = this;
            component.args = { ... args, child: children[0] };
            component.relay = component.relay ? { ... this.relay, ... component.relay } : this.relay;

            this.child[component.id] = component;
            return component.init();

        }
    }

    /**
        * Checks if the provided value is of a valid type.
        * Valid types are: `string`, `number`, `boolean`, and `function`.
        *
        * @private
        * @param {*} value - The value to check.
        * @returns {boolean} `true` if the value is of a valid type; otherwise, `false`.
        *
        * @example
        * this.#isValidType("Hello"); // true
        * this.#isValidType(42); // true
        * this.#isValidType(false); // true
        * this.#isValidType(() => {}); // true
        * this.#isValidType([]); // false
    */
    #isValidType(value) {
        return ["string", "number", "boolean", "function"].includes(typeof(value));
    }

    /**
        * Updates the key's value and modifies any elements containing the corresponding key placeholders.
        * 
        * If the key has "++" at the end (e.g., `{item}++`), the value will be appended to the existing value.
        * Similarly, if "++" is placed before the key (e.g., `++{item}`), the value will be prepended to the existing value.
        * 
        * Note: If the value type changes (for example, if the current value is text and the new value is an element),
        * the old value will be replaced instead of being appended due to type incompatibility.
        * 
        * @param {string} key - The key that corresponds to the placeholder in the elements.
        * @param {string | Element | Function} value - The value to be set or the function to generate the value.
        * 
        * @example
        * 
        * this.set("{item}", "Red"); // value = Red
        * this.set("{item}++", "Apple"); // value = Red Apple
        * this.set("++{item}", "Fresh"); // value = Fresh Red Apple
        * this.set("{item}", <><i>Banana</i></>); // value = Banana
    */
    set(key = "", value = "") {
        
        const index = key.indexOf("++");
        key = key.replace("++", "");
        
        const mapping = this.#binding[key];
        if (!mapping) return;

        const elements = mapping.element;
        elements.forEach(element => {

            const node = element.node;
            const parent = element.parent || node.parentNode;
            const fValue = typeof(value) === "function" ? value() : value;

            if(element.type == 0) {
                if(fValue instanceof Element) {
                    parent.replaceChild(fValue, node);
                    element.type = 1;
                    element.node = fValue;
                }
                else if(this.#isValidType(fValue)) {
                    node.nodeValue = index < 0 ? fValue : (index === 0 ? fValue + node.nodeValue : node.nodeValue + fValue);
                }
            }
            else if(element.type == 1) {
                if(fValue instanceof Element) {
                    if(index !== -1) {
                        parent.insertAdjacentElement((index == 0) ? "afterbegin" : "beforeend", fValue);
                        element.clone.push(fValue);
                        return;
                    }
                    else {
                        parent.replaceChild(fValue, node);
                        element.node = fValue;
                    }
                }
                else if(this.#isValidType(fValue)) {
                    const textNode = document.createTextNode(fValue);
                    parent.replaceChild(textNode, node);
                    element.type = 0;
                    element.node = textNode;
                }
                element.clone.forEach(x => {
                    x.remove();
                });
                element.clone = [];
                node.remove();
                this.#gc();
            }
            else if(element.type == 2 && this.#isValidType(fValue)) {
                let elementMapping = element.map;
                let keyMatch = elementMapping.match(/\{[^{}\s]*\}/gm);
                if(keyMatch) {
                    keyMatch.forEach(keyFound => {
                        if(keyFound === key) {
                            elementMapping = elementMapping.replace(keyFound, fValue);
                        }
                        else {
                            const subKeyBinding = this.#binding[keyFound];
                            if (subKeyBinding) elementMapping = elementMapping.replace(keyFound, subKeyBinding.data);
                        }
                    });
                }
                node.setAttribute(element.name, elementMapping);
                this.#binding[key].data = fValue;
            }

        });

    }

    /**
        * Ensures that elements with the given unique attribute are stored in a specified object,
        * and updates the attribute to a new random value.
        * 
        * @param {string} - The attribute name used to identify unique elements.
        * @param {Object} - The object where elements are stored, indexed by their `unique` attribute values.
        * 
        * @example
        * // Store all elements with a "id" attribute in `this.elements`
        * this.#unique("id", this.elements);
    */
    #unique(unique = "id", store = this.element) {
        this.root.querySelectorAll(`[${unique}]`).forEach(x => {
            store[x.getAttribute(unique)] = x;
            x.setAttribute(unique, H12.raid());
        });
    }
    /**
        * Generates a random string to be used as a new unique identifier.
        * 
        * @returns {string} A random string.
    */
    static raid() {
        return Math.random().toString(36).slice(6);
    }

};