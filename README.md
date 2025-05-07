# H12 🪶
H12 is a lightweight(3kb) javascript front-end library inspired from ReactJS, that allow using components which can use used around multiple places.

## Index
- [Syntax](#syntax)
- [Basic Syntax](#basic-syntax)
  - [Template](#template)
    - [Basic Template Usage](#basic-template-usage)
    - [Using Template Variables](#using-template-variables)
  - [Components](#components)
    - [Basic component](#basic-component)
    - [Passing values/parameters](#passing-valuesparameters)
    - [Component hierarchy](#component-hierarchy)
    - [`alias` attribute](#alias-attribute)
    - [`scope` attribute](#scope-attribute)
  - [Elements](#elements)
    - [Assigning events](#assigning-events)
    - [Assigning values](#assigning-values)
- [Properties](#properties)
- [Methods](#methods)

## Syntax
```js
import H12 from "@library/h12";

class App extends H12 {
    constructor() {
        super();
    }
    main() {}
    render() {
        return <>
            <div>
                Hello world
            </div>
        </>;
    }
}

document.body.appendChild(new App().init());
```

## Basic Syntax:
- ### **Template:**
    - #### **Basic Template Usage:**
        In H12, every tag, whether it’s a component or an HTML element, should be encapsulated within `<>` and `</>`, also known as a fragment. This allows you to return multiple elements or components from the render method without adding extra nodes to the DOM.
        ```js
        render() {
            return <>
                <div>Hello world</div>
            </>
        }
        ```
    - #### **Using Template Variables:**
        You can also store templates in variables. This is useful for organizing complex templates or reusing parts of a template across different methods.
        ```js
        myTemplate() {
            const btn = <><button>Click</button></>
            const icon = <><Icon args src="home.png"></Icon></>
        }
        ```

- ### **Components:**
    Every component should have a `args` attribute. Components rely on this attribute to receive parameters and render correctly. Without `args`, the tag is interpreted as a standard HTML element, and any component-specific behavior or functionality will not be applied.
    - #### **Basic component:**
        ```js
        render() {
            return <>
                <div>
                    <Icon args></Icon>
                </div>
            </>;
        }
        ```
    - #### **Passing values/parameters:**
        The passed values like `altText` and `src` can be accessed in `Icon` class using the `this.args` property.
        ```js
        render() {
            const text = "Home";
            return <>
                <div>
                    <Icon args src="home.png" alttext={ text }></Icon>
                </div>
            </>;
        }
        // inside Icon
        // this.args.src, this.args.altText or
        // const { src, altText } = this.args;
        ```
    - #### **Component hierarchy:**
        The H12 components follows a hierarchy, each component have a `parent` and `child` property, which can be used to traverse along the components. You can assign a unique id to the component using the `id` attribute.
        ```js
        render() {
            return <>
                <div>
                    <Icon args id="icon1"></Icon>
                </div>
            </>;
        }
        hideIcon() {
            const { icon1 } = this.child;
            icon1.hide(); // hide() is a custom function in Icon.
        }
        hideParent() {
            // hide() is custom function in parent component.
            this.parent.hide();
        }
        ```
    - #### **`alias` attribute:**
        The `alias` can be used to assign an custom name to the tag.
        ```js
        render() {
            return <>
                <div>
                    <IconButton args text="home"></IconButton>
                    <icon args text="home" alias={ IconButton }></icon>
                </div>
            </>;
        }
        ```
    - #### **`scope` attribute:**
        The `scope` attribute allows you to control the parent-child relationship between components. By default, when a component is loaded or created within another component, the current component is automatically set as the parent of the newly loaded component.
        However, there may be scenarios where you want to designate a different parent component. This is where the `scope` attribute comes into play.
        ```js
        render() {
            return <>
                <div>
                    <List args id="list"></List>
                </div>
            </>;
        }
        add() {
            const { list } = this.child;
            // The parent of `Icon` will be current component
            list.add(<><Icon args></Icon></>);
            // The parent of `Icon` will be `list`
            list.add(<><Icon args scope={ list }></Icon></>);

        }
        ```
- ### **Elements:**
    1. #### **Assigning events:**
        The events can be assigned to elements in 3 different ways.
        1. ##### **Using attribute:**
            ```js
            render() {
                return <>
                    <div>
                        <button onclick={ this.validate }>Validate</button>
                    </div>
                </>;
            }
            validate() {
                alert("Validated");
            }
            ```

        2. ##### **Using inline function:**
            ```js
            render() {
                return <>
                    <div>
                        <button onclick={ () => { alert("Validated"); } }>Validate</button>
                    </div>
                </>;
            }
            ```

        3. ##### **Using `set()`:**
            ```js
            main() {

                this.set("{click}", this.validate);

                // Or

                const { click } = this.key;
                click(this.validate);

            }
            render() {
                return <>
                    <div>
                        <button onclick="{click}">Validate</button>
                    </div>
                </>;
            }
            validate() {
                alert("Validated");
            }
            ```

    2. #### **Assigning values:**
        The values can be assigned to elements in 2 different ways.

        1. ##### **Static binding:**
            This type of binding is static and cannot be updated. This have space between curly braces `{}`, `{ text }`, if there is no space then it will be considered as a dynamic binding.
            ```js
            render() {
                const text = "Click";
                return <>
                    <div>
                        <button>{ text }</button>
                    </div>
                </>;
            }
            ```
        2. ##### **Dynamic binding:**
            This type of binding is dynamic and can be updated. This have no space between curly braces `{}`, `{text}`.
            ```js
            main() {

                this.set("{text}", "Click");

                // Or

                const { text } = this.key;
                text("Click");

            }
            render() {
                return <>
                    <div>
                        <button>{text}</button>
                    </div>
                </>;
            }
            ```

## Properties
- **`id: string`**
    Unique id for component, it can be set while loading component by the tag.

    *example:*
    ```js
    const icon = <><Icon args id="icon1"></Icon><>
    ```

- **`root: Element`**
    The root element of the current component.

    *example:*
    ```js
    this.root.classList.add();
    this.root.remove();
    ```

- **`args: any`**
    The values passed while making the component.

    *example:*
    - While creating component.
        ```js
        const icon = <><Icon args src="home.png"></Icon><>
        ```
    - Inside the `Icon`'s class
        ```js
        render() {
            return <>
                <img src={ this.args.src }>
            </>;
        }
        ```

- **`parent: H12`**
    The parent component of the current component, it will be `null` if its root component.

    *example:*
    ```js
    console.log(this.parent)
    ```

- **`child: Object<string, H12>`**
    A collection of child components in the current component.

    *example:*
    ```js
    render() {
        return <>
            <Icon args id="icon1" src="home.png"></Icon>
            <Icon args id="icon2" src="link.png"></Icon>
        </>;
    }
    hide1() {
        this.hideIcon("icon1");
    }
    hide2() {
        this.hideIcon("icon2");
    }
    hideIcon(id) {
        this.child[id].hide(); // hide() is custom function in Icon class
    }
    ```

- **`element: Object<string, Element>`**
    A collection of unique elements in the current element.

    *example:*
    ```js
    render() {
        return <>
            <div>
                <input type="text" id="txtbox" />
            </div>
        </>;
    }
    getText() {
        const { txtbox } = this.element;
        console.log(txtbox.value);
    }
    ```

- **`key: Object<string, Function>`**
    A collection methods to update the key's value, its an alternatively method to `set()`.

    *example:*
    ```js
    main() {
        
        const { name } = this.key;
        name("Some Name");

        // Alternatively
        this.set("{name}", "Some Name");

    }
    render() {
        return <>
            <div>
                <label>{name}</label>
            </div>
        </>;
    }
    ```

- **`relay: any`**
    A data that passes from parent component to its child component. If a child component have its own relay then it will merge with parent's relay.

    *example:*
    ```js
    class App extends H12 {
        constructor() {
            super();
            this.relay = { name: "Some Name" };
        }
        render() {
            return <>
                <Button args></Button>
            </>;
        }
    }
    class Button extends H12 {
        constructor() {
            super();
        }
        main() {
            console.log(this.relay.name); // Output: "Some Name"
        }
    }
    ```

## Methods
- **`render()`**
    The function that returns template that is to be rendered.

    *example:*
    ```js
    render() {
        return <>
            <div>
                <button>Click</button>
            </div>
        </>;
    }

- **`main(args: any)`**
    The function is called when the component is ready to be rendered. The default values can be set in this function. The `args` parameter is passed while creating component and is similar to `this.args`.

    *example:*
    ```js
    main() {
        this.set("{link}", "home.png");
        this.set("{home}", <><button>Home</button></>);
        this.set("{icon}", <><Icon args src="icon.png"></Icon></>);

        const { name } = this.key;
        name("Some Name");
    }
    ```

- **`set(key: string, value: string | Element | Function)`**
    The `set` method in H12 is used to update or append values in the component's template using a unique key. This method supports various types of values, including `string`, `Element`, and `Function`.

    The values can also be appended using `++` operator. Note that, if the value type changed, then all the previous values will be cleared and a new value will be appened.
    *For example:* If the current value is `string` and an `Element` is appended then the previous `string` values will be removed.

    *example:*
    ```js
    main() {

        this.set("{link}", "home.png");
        this.set("{home}", <><button>Home</button></>); // add element
        this.set("{icon}", <><Icon args src="icon.png"></Icon></>); // add component

        this.set("{char}", "A");
        this.set("{char}++", "B"); // appending text
        this.set("{char}++", "C");
        this.set("++{char}", "D");

        this.set("{item}", <><li>Item 1</li></>);
        this.set("{item}++", <><li>Item 2</li></>); // appending element

        this.set("{click}", () => {
            console.log("Hello world");
        });

        // Alternatively you can use `key` method
        const { item } = this.key;
        item(<><li>Item 1</li></>);
        item(<><li>Item 2</li></>, "x++");

    }
    render() {
        return <>
            <div>
                <div>{link}</div>
                <div>{home}</div>
                <div>{icon}</div>
            </div>
        </>;
    }
    ```


- **`destroy()`**
    The function is used to destroy the component and remove it from the DOM and parent.

    *example:*
    ```js
    removeChild() {
        this.child["item"].destroy();
    }
    ```

---

## ☄️