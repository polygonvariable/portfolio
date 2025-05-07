import XRegExp from "xregexp";
import { JSDOM } from "jsdom";

const PLACEHOLDER_CODE = "__CODE__";
const PLACEHOLDER_KEY = "__KEY__";

/**
    * H12 transform function
    * @param {string} code The js code containing H12 component
    * @returns {string}
    * @description
    * * Transform version: `v2.2.0`
    * * Client version required: `v2.2.0`
    * * Github: https://github.com/ayushpaultirkey/h12
*/
function main(code = "", ignoreCheck = false) {

    if(!code.includes("<>") && !code.includes("</>") && !ignoreCheck) {
        return code;
    };

    let matchTemplate = XRegExp.matchRecursive(code, "<>", "</>", "gi");
    for(const template of matchTemplate) {

        let { list: brackets, text } = preFormatBrackets(template);

        const dom = new JSDOM(text);
        let pharsed = phraseDOM(dom.window.document.body.children[0]);

        for(const bracket in brackets) {
            pharsed = pharsed.replace(bracket.replace(/\{|\}/g, ""), brackets[bracket]);
        }

        const haveSubTemplate = pharsed.includes("<>") && pharsed.includes("</>");
        code = code.replace(`<>${template}</>`, (haveSubTemplate) ? main(pharsed, true) : pharsed);

    }

    return code;

}

function preFormatBrackets(text = "") {

    const matchBrackets = XRegExp.matchRecursive(text, "{", "}", "gi");

    let index = 0;
    let bracketList = {};

    for(const bracket of matchBrackets) {

        if(bracket.match(/\s/gm)) {

            const id = `{${PLACEHOLDER_CODE}${index}__}`;

            text = text.replace(`{${bracket}}`, id);

            bracketList[id] = bracket;
            index++;

        };

    };

    return { list: bracketList, text: text };

}

function pharseText(element) {

    if(!element || element.nodeType != 3) {
        return;
    }

    let keyList = [];
    let textList = [];
    let value = element.nodeValue;

    if(!value.match(/\w+(?:\.\w+)+|\w+|\S+/gm)) {
        return;
    }

    value = value.replace(/\n|\s\s/g, "");
    const keyMatch = value.match(/\{[^{}\s]*\}/gm);

    if(keyMatch) {

        let tempText = value;

        for(const key of keyMatch) {
            tempText = tempText.replace(key, PLACEHOLDER_KEY);
        }

        const textParts = tempText.split(PLACEHOLDER_KEY);

        for(let i = 0; i < keyMatch.length; i++) {
            textParts.splice(2 * i + 1, 0, keyMatch[i]);
        }
        for(const part of textParts) {
            if(part.length !== 0) {
                if(part.includes(PLACEHOLDER_CODE)) {
                    textList.push(part.replace(/\{|\}/g, ""));
                }
                else {

                    textList.push(`\`${part}\``);

                    // Only push keys if they are not placeholders
                    if(part.match(/\{[^{}\s]*\}/gm)) {
                        keyList.push(part);
                    }

                }
            }
        }

    }
    else {

        if(value.includes(PLACEHOLDER_CODE)) {
            textList.push(value.replace(/\{|\}/g, ""));
        }
        else {
            
            textList.push(`\`${value}\``);

            // Only push keys if they are not placeholders
            if(value.match(/\{[^{}\s]*\}/gm)) {
                keyList.push(value);
            };

        };


    }

    return { texts: textList, keys: keyList };

}

function pharseAttribute(element) {
    
    if(!element || element.nodeType != 1) {
        return;
    }

    let attributeList = [];
    const attributes = element.getAttributeNames();
    
    for(const attribute of attributes) {

        const attributeValue = element.getAttribute(attribute);

        const keyMatch = attributeValue.match(/\{[^{}\s]*\}/gm);
        const filterKey = (keyMatch) ? keyMatch.filter(x => !x.includes(PLACEHOLDER_CODE)) : [];

        if((attribute == "args" && attributeValue == "") || attribute == "alias" || attribute == "scope" || attribute == "svg") {
            continue;
        }

        if(!element.hasAttribute("args")) {
            if(attributeValue.includes(PLACEHOLDER_CODE)) {
                attributeList.push(`"${attribute}": { "value": ${attributeValue.replace(/\{|\}/g, "")}, "keys": ${JSON.stringify(filterKey)} }`);
            }
            else {
                attributeList.push(`"${attribute}": { "value": \`${attributeValue}\`, "keys": ${JSON.stringify(filterKey)} }`);
            }
        }
        else {
            if(attributeValue.includes(PLACEHOLDER_CODE)) {
                attributeList.push(`"${attribute}": ${attributeValue.replace(/\{|\}/g, "")}`);
            }
            else {
                attributeList.push(`"${attribute}": \`${attributeValue}\``);
            }
        }

    }

    return { attributes: attributeList };
    
}

function pharseNode(element) {
    
    if(!element) {
        return;
    }

    let keyList = [];
    let childList = [];
    const childNodes = element.childNodes;

    for(const child of childNodes) {
        switch(child.nodeType) {
            case 1:
                const node = phraseDOM(child);
                if(node) {
                    childList.push(node);
                }
                break;
            case 3:
                const text = pharseText(child);
                if(text && text.texts) {
                    childList = childList.concat(text.texts);
                    keyList = keyList.concat(text.keys);
                }
                break;
        }
    }

    return { child: childList, keys: keyList };
    
}

function phraseDOM(element) {

    if(!element) {
        return "";
    }

    const tag = element.tagName.toLowerCase();
    const svg = (element.namespaceURI === "http://www.w3.org/2000/svg" || element.hasAttribute("svg")) ? "http://www.w3.org/2000/svg" : "";

    const childs = pharseNode(element);
    const childCode = `[${childs.child.join(",")}]`;

    const attributes = pharseAttribute(element);
    const attributeCode = `{${attributes.attributes.join(",")}}`;

    const hasScope = element.hasAttribute("scope");
    const hasAlias = element.hasAttribute("alias");
    const isComponent = element.hasAttribute("args");

    const scope = (isComponent && hasScope) ? element.getAttribute("scope").replace(/\{|\}|\s+/g, "") :  "this";
    const method = isComponent ? "component" : "node";

    let name;
    if(isComponent) {
        if(hasAlias) {
            name = element.getAttribute("alias").replace(/\{|\}/g, "");
        }
        else {
            name = tag.charAt(0).toUpperCase() + tag.slice(1);
        }
    }
    else {
        if(hasAlias) {
            name = `"${element.getAttribute("alias").replace(/\{|\}/g, "")}"`;
        }
        else {
            name = `"${tag}"`;
        }
    }

    const code = `${scope}.${method}(${name},${childCode},${attributeCode},${JSON.stringify(childs.keys)},"${svg}")`;

    return code.replace(/,\)/g, ")");

}

export default main;