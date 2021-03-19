(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';
class AbstractModel {
    /**
     * Create a new abstract model.  If delegate is provided then all listener
     * adds and notifies are performed on the delegate listener collection.
     * @param {type} delegate
     * @returns {nm$_AbstractModel.AbstractModel}
     */
    constructor() {
        this.delegate = this;
        this.abstractModelListeners = [];        
    }

    getDelegate(){
        return this.delegate;
    }
    
    setDelegate(delegate = null){
        if (delegate === null) {
            this.delegate = this;
            this.abstractModelListeners = [];
        } else {
            this.delegate = delegate.delegate;
        }
        
        if (this.delegate === undefined){
            throw new Error("undefined delegate");
        }
    }
    
    addListener(listener) {
        if (typeof listener !== "object"){
            throw new Error("invalid AbstractModel listener type: " + typeof listener);
        }
        this.delegate.abstractModelListeners.push(listener);
    }

    /**
     * Call as notifyListeners(methodName, [methodArgument0, ... methodArgumentN])
     * @param {type} method
     * @returns {undefined}
     */
    async notifyListeners(method) {
        console.log("EVENT " + this.delegate.constructor.name + " " + method);

        Array.prototype.shift.apply(arguments);
        let event = {
            method: method,
            args: arguments,
            source: this,
            listeners: []
        };
        
        window.lastEvent = event;
        window.nEvents.push(window.lastEvent);

        for (let listener of this.delegate.abstractModelListeners) {
            if (listener[method]){
                console.log(" + " + listener.constructor.name + " " + method);
                window.lastEvent.listeners.push(listener.constructor.name);       
                await listener[method].apply(listener, arguments);
            }
            if (listener[AbstractModel.defaultListener]){
                console.log(" + " + listener.constructor.name + " " + AbstractModel.defaultListener);
                window.lastEvent.listeners.push(listener.constructor.name);       
                await listener[AbstractModel.defaultListener].apply(listener, window.lastEvent);                
            }
        }
    }
}

AbstractModel.defaultListener = "nidgetListener";
window.nEvents = [];
module.exports = AbstractModel;
},{}],2:[function(require,module,exports){
'use strict';
/**
 * Singleton class to providing functionality to DragNidgets and DropNidgets.
 * It stores the Nidget currently being dragged.
 */
class DragHandler{
    
    constructor(){
        this.current = null;
        this.over = [];
    }
    
    pushOver(nidget){
        if (this.overHas(nidget)) return false;
        this.over.push(nidget);
        return true;
    }
    
    removeOver(nidget){
        if (!this.overHas(nidget)) return false;
        this.over.splice(this.over.indexOf(nidget), 1);
        return true;
    }    
    
    overHas(nidget){
        return this.over.indexOf(nidget) !== -1;
    }
    
    set(nidget){
        this.current = nidget;
    }
    
    get(){
        return this.current;
    }
    
    has(){
        return this.current !== null;
    }
    
    clear(){
        this.current = null;
    }
    
    static getInstance(){
        return DragHandler.instance;
    }    
}

module.exports = new DragHandler();


},{}],3:[function(require,module,exports){
'use strict';
const NidgetElement = require("./NidgetElement");

/* global Utility */
class FileOperations {
    /**
     * Create a new dom element from a file (url).  Map variables (${...}) to 
     * a value.
     * @param {type} url
     * @param {type} map
     * @returns {node|FileOperations.loadDOMElement.domElement}
     */
    static async loadNidget(url, map){        
        let element = await FileOperations.loadDOMElement(url, map);
        return new NidgetElement(element);
    }    
    
    /**
     * Create a new dom element from a file (url).  Map variables (${...}) to 
     * a value.
     * @param {type} url
     * @param {type} map
     * @returns {node|FileOperations.loadDOMElement.domElement}
     */
    static async loadDOMElement(url, map = new Map()){        
        if (map instanceof Map === false) map = FileOperations.objectToMap(map);       
        let text = await FileOperations.getURL(url);
        return FileOperations.stringToDOMElement(text, map);
    }

    /**
     * Create a new dom element from text.
     * @param {type} text
     * @param {type} map
     * @returns {node|FileOperations.loadDOMElement.domElement}
     */
    static stringToDOMElement(text, map = new Map()){
        /* replace variables with values */
        for (let key of map.keys()){                  
            let value = map.get(key);
            let regex = new RegExp(`[$][{]?${key}[}]`, `g`);
            text = text.replace(regex, value);    
        }

        /* replace unfilled variables with empty */
        let regex = new RegExp(`[$][{][^}]*[}]`, `g`);
        text = text.replace(regex, ""); 

        let element = document.createElement('div');
        element.innerHTML = text;
        let domElement = null;
        console.log(element);

        return element;
    }

    static objectToMap(object){
        let map = new Map();
        for (let field in object){            
            if (typeof object[field] === "string" || typeof object[field] === "number"){
                map.set(field, object[field]);
            }
        }
        return map;
    }

    

    /*
     * Transfer contents of 'filename' from server to client.
     * @param {String} filename
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @returns {String} contents of file
     */
    static getURL(url) {
        let callback = function (resolve, reject) {
            var xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function () {
                if (xhttp.readyState === 4) {
                    if (xhttp.status === 200) {
                        resolve(xhttp.responseText);
                    } else {
                        reject({
                            xhttp : xhttp,
                            status : xhttp.status, 
                            text : xhttp.responseText,
                            url : url
                        });
                    }
                }
            };
            
            xhttp.open("GET", url, true);
            xhttp.send(null);
        };

        return new Promise(callback);
    }

    /**
     * Create a new dom element from text.
     * @param {type} text
     * @param {type} map
     * @returns {node|FileOperations.loadDOMElement.domElement}
     */
    static async getFile(url, map = new Map()){
        let text = await FileOperations.getURL(url);

        /* replace variables with values */
        for (let key of map.keys()){
            let value = map.get(key);
            let regex = new RegExp(`[$][{]?${key}[}]`, `g`);
            text = text.replace(regex, value);
        }

        /* replace unfilled variables with empty */
        let regex = new RegExp(`[$][{][^}]*[}]`, `g`);
        text = text.replace(regex, "");

        return text;
    }

    /*
     * Transfer contents of 'filename' from server to client using current window location.
     * @param {String} filename
     * @param {Function} successCallback
     * @param {Function} errorCallback
     * @returns {undefined}
     */
    static getLocal(filename) {
        let callback = function (resolve, reject) {
            var xhttp = new XMLHttpRequest();
            var data = {};
            var url = window.location.href + "/" + filename;

            xhttp.onreadystatechange = function () {
                if (xhttp.readyState === 4) {
                    if (xhttp.status === 200) {
                        resolve(xhttp.responseText);
                    } else {
                        reject(xhttp.status, xhttp.responseText);
                    }
                }
            };

            xhttp.open("GET", url, true);
            xhttp.send(JSON.stringify(data));
        };

        return new Promise(callback);
    }
    
    /**
     * Cause 'text' to be saved as 'filename' client side.
     * @param {type} filename The default filename to save the text as.
     * @param {type} text The text to save to filename.
     * @returns {undefined}
     */
    static saveToFile(text, filename) {
        let anchor = document.createElement('a');
        let data = "text;charset=utf-8," + encodeURIComponent(text);
        anchor.setAttribute("href", "data:" + data);
        anchor.setAttribute("download", filename);
        anchor.click();
    }
}

FileOperations.NodeType = {
    ELEMENT : 1,
    ATTRIBUTE : 2,
    TEXT : 3, 
    CDATASECTION : 4,
    ENTITYREFERNCE : 5,
    ENTITY : 6,
    PROCESSINGINSTRUCTION : 7,
    COMMENT : 8,
    DOCUMENT : 9,
    DOCUMENTTYPE : 10,
    DOCUMENTFRAGMENT : 11,
    NOTATION : 12
};

module.exports = FileOperations;
},{"./NidgetElement":7}],4:[function(require,module,exports){
'use strict';
module.exports = {
    mouse : require("./nidget-interfaces/Mouse"), 
    drag : require("./nidget-interfaces/Drag"),
    drop : require("./nidget-interfaces/Drop"),
    movable : require("./nidget-interfaces/Movable"),
    resize : require("./nidget-interfaces/Resize")
};
},{"./nidget-interfaces/Drag":17,"./nidget-interfaces/Drop":18,"./nidget-interfaces/Mouse":19,"./nidget-interfaces/Movable":20,"./nidget-interfaces/Resize":21}],5:[function(require,module,exports){
"use strict";

/**
 * Singlton class to add functionality to the mouse.
 */
class MouseUtilities {
    
    constructor(){
        this.attachedElement = null;
        this.lastX = 0;
        this.lastY = 0;
    }
    
    isUnder(event, element) {
        let x = event.clientX;
        let y = event.clientY;
        let current = document.elementFromPoint(x, y);

        while (current) {
            if (current === element) return true;
            current = current.parentElement;
        }
        return false;
    }

    getUnder(event) {
        let x = event.clientX;
        let y = event.clientY;
        return document.elementFromPoint(x, y);
    }

    set element(element){
        if (this.attachedElement !== null){
            this.detachElement();
        }
        if (!element || element === null || element === undefined){
            this.detachElement();
        } else {
            this.attachElement(element);
        }
    }
    
    get element(){
        return this.attachedElement;
    }

    /**
     * Attach an element.  If the element doesn't have a parent it will be
     * attached to the document and will be detached when detachElement is called.
     * @param {type} element
     * @returns {undefined}
     */
    attachElement(element) {
        this.attachedElement = element;
        
        if (element.parent){
            throw new Error("Can not attach element to mouse if the element has a parent element.");
        }
                
        document.body.append(element);
        element.style.position = "absolute"; 
        element.style.top = event.clientY + "px";
        element.style.left = event.clientX + "px";
        element.style.pointerEvents = "none";
        element.style.zIndex = "10000";
        
        this.moveCallBack = (event)=>this.onMouseMove(event);
        window.addEventListener("mousemove", this.moveCallBack);
    }

    /**
     * Remove listeners from the attached element, do not remove it from the
     * document.
     * @returns {type}
     */
    detachElement(){
        if (this.attachedElement === null) return;
        
        window.removeEventListener("mousemove", this.moveCallBack);        
        let rvalue = this.attachedElement;
        this.attachedElement = null;        
        document.body.removeChild(rvalue);
        
        return rvalue;
    }

    onMouseMove(event) {        
        event.preventDefault();
        this.lastX = event.clientX;
        this.lastY = event.clientY;

        // set the element's new position:
        this.attachedElement.style.top = event.clientY + "px";
        this.attachedElement.style.left = event.clientX + "px";
    }
}

module.exports = new MouseUtilities();
},{}],6:[function(require,module,exports){
'use strict';

module.exports = {
    prefix: "data-nidget",
    elementAttribute: "data-nidget-element",
    srcAttribute: "src",
    templateSrcAttribute: "template-src",
    nameAttribute: "name",
    interfaceAttribute: "interfaces",
    templateAttribute: "template",
    interfaceDataField: "interfaceData",
    modelDataField: "modelData",
    styleAttribute: "nidget-style"
};
},{}],7:[function(require,module,exports){
"use strict";
const FileOperations = require("./FileOperations");
const Nidget = require("./Nidget");
const Interfaces = require("./Interfaces");
const Transformer = require("./Transformer");
const NidgetStyle = require("./NidgetStyle");

/**
 * Calculate the w:h aspect ratio and adjust the proportions accordingly.
 *
 */
class AspectRatio{
    constructor(nidget) {
        this.nidget = nidget;
        this.observer = new ResizeObserver(()=>this.onResize());
        this.observer.observe(this.nidget);
        this.parseValues();
        this.onResize();
        this.loaded = false;
    }

    getValue(){
        return getComputedStyle(this.nidget).getPropertyValue(AspectRatio.CSS_ATTRIBUTE);
    }

    parseValues(){
        let value = this.getValue();
        let split = value.split(/[ ,;]/g);

        for (let s of split){
            if (s.split(/[-:]/).length === 2){
                let ratio = s.split(/[-:]/);
                this.width = parseInt(ratio[0]);
                this.height = parseInt(ratio[1]);
            }
            else if (s === "h"){
                this.onResize = ()=> {
                    let height = this.nidget.getBoundingClientRect().height;
                    this.nidget.style.width = (height * this.width / this.height) + "px"
                }
            }
        }
    }

    onResize(){
        let width = this.nidget.getBoundingClientRect().width;
        this.nidget.style.height = (width * this.height / this.width) + "px";
    }
}

AspectRatio.CSS_ATTRIBUTE = "--nidget-aspect-ratio";

/**
 * A NidgetElement is a 1:1 class-object:dom-object pairing.  Actions on the DOM 
 * object should only be called by the NidgetElement object.  The interfaceData
 * field is reserved for data from interfaces.  Interfaces should put their 
 * custom data under [interfaceDataField].[interfaceName].  The interface data
 * attribute is set with the static value Nidget.interfaceDataField.
 * 
 * Calling methods on the nidget will treat shadow contents as regular contents.
 */
class NidgetElement extends HTMLElement {
    /**
     * Create a new Nidget associated with 'element'.  An error will be thrown
     * if the 'element' is already associated with a Nidget.
     * 
     * Disabled class indicates this nidget will ignore mouse events.
     * 
     * @param {type} element JQuery selector
     * @return {nm$_Nidget.NidgetElement}
     */
    constructor(templateId) {
        super();
        this[Nidget.interfaceDataField] = {};
        this[Nidget.modelDataField] = {};
        this.transformer = new Transformer(this);
        this.observers = {};

        if (templateId){
            this.applyTemplate(templateId);
        }
    }

    /**
        connectedCallback is invoked each time the custom element is appended into a document-connected element
     */
    async connectedCallback() {
        this.shadowContents = this;

        // set the html of this element to the contents of the file (not a shadow element)
        // all data- attributes will be used to fill in ${} variables in the source file
        // doesn't work on edge
        if (this.hasAttribute(Nidget.srcAttribute)) await this.retrieveSource(this.dataAttributes());
        if (this.hasAttribute(Nidget.templateSrcAttribute)) await this.retrieveTemplate();
    }

    /**
     * Retrieve a map of all data attributes
     * @returns {Map<any, any>}
     */
    dataAttributes() {
        let map = new Map();
        for (let attr of this.attributes) {
            if (attr.name.startsWith("data-")) {
                let name = attr.name.substr(5);
                map[name] = attr.value;
            }
        }
        return map;
    }

    notifyStyles(){
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let ar = getComputedStyle(this).getPropertyValue(AspectRatio.CSS_ATTRIBUTE);
                if (ar !== "") new AspectRatio(this);
                resolve();
            }, 0);
        });
    }

    /**
     * Load contents of file as a templete and apply that template to this element.
     * Replace all ${} variables with contents of 'map'.
     * The template will be given the id derived from the src attribute.
     */
    async retrieveTemplate(){
        let src = this.getAttribute(Nidget.templateSrcAttribute);
        let id = src.replace(/[\// .-]+/g, "_");
        let template = document.querySelector(`#${id}`);
        if (template) await this.injectTemplate(template);
    }

    /**
     * Attach a shadow element with the contents of the template named (templateID).
     * @return {undefined}
     */
    applyTemplate(templateId) {
        let template = document.getElementById(templateId);

        if (!template) throw new Error("Template '" + templateId + "' not found.");
        if (template.tagName.toUpperCase() !== "TEMPLATE") throw new Error("Element with id '" + templateId + "' is not a template.");

        this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
    }

    async injectTemplate(template){
        if (this.shadowRoot !== null) return;
        this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
        await this.notifyStyles();
    }

    async ready(){

    }

    /**
     * Load contents of file into this element.
     * Replace all ${} variables with contents of 'map'.
     */
    async retrieveSource(map){
        let src = this.getAttribute(Nidget.srcAttribute);
        let text = await FileOperations.getFile(src, map);
        this.innerHTML = text;
    }

    static async loadTemplateSnippet(filename, tagname){
        let id = filename.replace(/[\// .-]+/g, "_");

        if (!document.querySelector(`#${id}`)){
            let text = await FileOperations.getFile(filename);
            let template = document.createElement("template");
            template.innerHTML = text;
            template.setAttribute("id", id);
            if (tagname) template.setAttribute("data-nidget", tagname);
            document.body.append(template);
        }

        let template = document.querySelector(`#${id}`);

        for (let ele of document.querySelectorAll(tagname)){
            await ele.injectTemplate(template);
            await ele.ready();
        }
    }

    /**
     * Remove 'hidden' class.
     */
    show() {
        this.classList.remove("hidden");
    }

    /**
     * Add 'hidden' class.
     */
    hide() {
        this.classList.add("hidden");
    }

    /**
     * Set the disabled flag that is read by nidget mouse functions.
     * @param value
     */
    set disabled(value){
        if (value === true) {
            this.setAttribute(NidgetElement.DISABLED_ATTRIBUTE, true);
        } else {
            this.removeAttribute(NidgetElement.DISABLED_ATTRIBUTE, false);
        }
    }

    /**
     * Get the disabled flag that is read by nidget mouse functions.
     * @param value
     */
    get disabled(){
        if (!this.hasAttribute(NidgetElement.DISABLED_ATTRIBUTE)) return false;
        return this.getAttribute(NidgetElement.DISABLED_ATTRIBUTE);
    }

    /**
     * Return true if this element was under the mouse for the event.
     * @param {type} event
     * @param {type} element
     * @return {Boolean}
     */
    isUnderMouse(event) {
        let x = event.clientX;
        let y = event.clientY;
        let current = document.elementFromPoint(x, y);

        while (current) {
            if (current === this) return true;
            current = current.parentElement;
        }
        return false;
    }

    /**
     * Run the query selector on this element.
     * If this element has a shadow, run it on that instead.
     * @param selectors
     * @returns {HTMLElementTagNameMap[K]}
     */
   querySelector(selectors) {
        if (this.shadowRoot){
            return this.shadowRoot.querySelector(selectors);
        } else {
            return super.querySelector(selectors);
        }
    }

    /**
     * Run the query selector on this element.
     * If this element has a shadow, run it on that instead.
     * @param selectors
     * @returns {HTMLElementTagNameMap[K]}
     */
    querySelectorAll(selectors) {
        if (this.shadowRoot){
            return this.shadowRoot.querySelectorAll(selectors);
        } else {
            return super.querySelectorAll(selectors);
        }
    }

    /**
     * Remove this element from it's parent.
     */
    detach(){
        this.parentNode.removeChild(this);
    }

    /**
     * Index within the parent element.
     */
    index(){
        return Array.from(this.parentElement.children).indexOf(this);
    }
}

// NidgetElement.mutationObserver = new MutationObserver((record, observer)=>{
//     record.forEach((mutation) => {
//         if (!mutation.addedNodes) return
//         for (let i = 0; i < mutation.addedNodes.length; i++) {
//             let node = mutation.addedNodes[i];
//             if (node.tagName === "TEMPLATE") {
//                 console.log(node.tagName);
//                 console.log(node.getAttribute("data-nidget"));
//             }
//         }
//     });
// });
//
// NidgetElement.mutationObserver.observe(document, {
//     childList: true,
//     subtree: true,
//     attributes: false,
//     characterData: false
// });

NidgetElement.DISABLED_ATTRIBUTE = "nidget-disabled";
window.customElements.define('nidget-element', NidgetElement);
module.exports = NidgetElement;
},{"./FileOperations":3,"./Interfaces":4,"./Nidget":6,"./NidgetStyle":8,"./Transformer":9}],8:[function(require,module,exports){
'use strict';
/**
 * Manipulates the elements style with js routines according to css flags.
 * Nidget style is applied to all nidget-elements unless they have the nidget-style
 * attribute set to 'false'.
 */

class NidgetStyle {

    constructor(nidget) {
        this.nidget = nidget;
        this.apply();
    }
    
    apply() {
        this.nidgetWidthRatio();
        this.nidgetHeightRatio();
        this.nidgetFitText();
        this.nidgetFitTextWidth();
        this.nidgetVertAlignText();
    }
    
    nidgetWidthRatio() {
        let ratio = getComputedStyle(this.nidget).getPropertyValue("--nidget-width-ratio");
        if (!parseFloat(ratio)) return;                
        
        new ResizeObserver(() => {            
            this.nidget.width = this.nidget.height * ratio;
        }).observe(this.nidget);      
    }
    
    nidgetHeightRatio() {
        let ratio = getComputedStyle(this.nidget).getPropertyValue("--nidget-height-ratio");
        if (!parseFloat(ratio)) return;                
        
        new ResizeObserver(() => {                        
            this.nidget.height = this.nidget.width * ratio;
        }).observe(this.nidget);      
    }

    /**
     * Fill the text height to match the element height.
     * Change the ratio value (or the fontSize) adjust.
     */
    nidgetFitText() {
        let ratio = getComputedStyle(this.nidget).getPropertyValue("--nidget-fit-text");        
        if (!parseFloat(ratio)) return;

        new ResizeObserver(() => {
            console.log(`--nidget-fit-text ${ratio}`)
            let h = this.nidget.offsetHeight * ratio;
            this.nidget.style.fontSize = h + "px";
        }).observe(this.nidget);      
    }

    /**
     *  Will change the font size so that the text fit's in the parent element.
     *  Don't set the width of the element.
     */
    nidgetFitTextWidth() {
        let remove = getComputedStyle(this.nidget).getPropertyValue("--nidget-fit-text-width");
        if (!parseFloat(remove)) return;

        new ResizeObserver(() => {
            this.nidget.parentElement

            let textW = this.nidget.scrollWidth;
            let contW = this.nidget.parentElement.offsetWidth;
            contW = contW - remove;
            let dw = contW/textW;
            let computedFontSize = window.getComputedStyle(this.nidget, null).getPropertyValue('font-size')
            computedFontSize = parseInt(computedFontSize);
            computedFontSize = Math.round(computedFontSize);
            let newFontSize = Math.round(computedFontSize * dw);
            let h = this.nidget.offsetHeight

            if (Math.abs(computedFontSize - newFontSize) <= 2) return;

            if (newFontSize > h) newFontSize = h;

            this.nidget.style.fontSize = newFontSize + "px";
        }).observe(this.nidget);
    }

    /**
     * Set the line height to the offset height multiplied by ratio.
     */
    nidgetVertAlignText(){
        let ratio = getComputedStyle(this.nidget).getPropertyValue("--nidget-vert-align-text");
        if (!parseFloat(ratio)) return;

        new ResizeObserver(() => {
            let h = this.nidget.offsetHeight * ratio;
            this.nidget.style.lineHeight = h + "px";
        }).observe(this.nidget);
    }
}

module.exports = NidgetStyle;
},{}],9:[function(require,module,exports){
'use strict';
class Transform{
    constructor(value){
        let indexOf = value.indexOf("(");
        this.name = value.substring(0, indexOf);
        this.value = value.substring(this.name.length + 1, value.length - 1);
        console.log(this.name + ", " + this.value);
    }
    
    toString(){
        return this.name + "(" + this.value + ")";
    }    
}

class Transformer {

    constructor(element) {
        this.element = element;
    }
    
    append(){
        let computedStyle = window.getComputedStyle(this.element)["transform"];
        if (computedStyle !== "none") this.push(computedStyle);
        return this;
    }
    
    clear(){
        this.element.style.transform = "";
        return this;
    }
    
    unshift(value){
        this.element.style.transform = value + " " + this.element.style.transform;
    }
    
    push(value){
        this.element.style.transform = this.element.style.transform + " " + value;
        return this;
    }    
    
    shift(){
        let array = this.split();
        if (array.length === 0) return "";
        array.shift();
        this.element.style.transform = array.join(" ");
        return this;
    }
    
    pop(){
        let array = this.split();
        if (array.length === 0) return "";
        array.pop();
        this.element.style.transform = array.join(" ");
        return this;      
    }
    
    replace(value){
        let newTransform = new Transform(value);
        let array = this.split();
        
        for (let i = 0; i < array.length; i++){
            let entry = array[i];
            let transform = new Transform(entry);
            if (transform.name === newTransform.name){
                array[i] = newTransform.toString();
                this.element.style.transform = array.join(" ");
                return this;
            }
        }
        return this;
    }
    
    split(){
        let value = this.element.style.transform;
        let start = 0;
        let rvalue = [];
        let last = '';
        let skip = false;
        let nestedP = 0;
        
        for (let i = 0; i < value.length; i++){
            if (!skip && value[i] === ' ' && last === ' '){
                start = i + 1;
            }
            else if (!skip && value[i] === ' ') {
                rvalue.push(value.substring(start, i));
                start = i;
            } else if (value[i] === '(') {
                nestedP++;
                skip = true;
            } else if (value[i] === ')') {
                nestedP--;
                if (nestedP === 0) skip = false;
            }
            last = value[i];
        }
        rvalue.push(value.substring(start, value.length));
        return rvalue;
    }
    
    toString(){
        return this.element.style.transform;
    }
}

module.exports = Transformer;
},{}],10:[function(require,module,exports){
"use strict";
const NidgetElement = require("../NidgetElement");

/**
 * A Nidget that changes the image for hover, disabled, press, and idle.
 * Fires a click event when clicked.
 *
 * Will set the current state as data-state so that css can access it.
 */
class NidgetButton extends NidgetElement {

    connectedCallback() {
        super.connectedCallback();
        this.alphaTolerance = 0; // alpha needs to be > tolerance to trigger events.

        this.stringHover = "nidget-button-state[state='HOVER']";
        this.stringDisabled = "nidget-button-state[state='DISABLED']";
        this.stringPress = "nidget-button-state[state='PRESS']";
        this.stringIdle = "nidget-button-state[state='IDLE']";

        this.state = "idle";
    }

    isInSet() {
        let parent = this.parentNode;
        while (parent != null) {
            if (parent.tagName === "NIDGET-BUTTON-SET") {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    }

    nidgetReady() {
        if (this.disabled) {
            this.activeNidget = this.stringDisabled;
        } else {
            this.activeNidget = this.stringIdle;
        }

        if (this.isInSet()) return;

        this.addEventListener("mouseenter", this.mouseEnter);
        this.addEventListener("mouseleave", this.mouseLeave);
        this.addEventListener("mousedown", this.mousePress);
        this.addEventListener("mouseup", this.mouseRelease);

        this.addEventListener("click", (e) => {
            if (!this.disabled) return true;
            e.stopPropagation();
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        });

    }

    isUnder(event) {
        let elements = document.elementsFromPoint(event.clientX, event.clientY);
        if (elements.indexOf(this.activeNidget) == -1) return false;

        let rect = this.activeNidget.getBoundingClientRect();
        let x = event.clientX - rect.x;
        let y = event.clientY - rect.y;

        return this.testAlpha(x, y);
    }

    get disabled() {
        return super.disabled;
    }

    set disabled(value) {
        super.disabled = value;

        if (value === true) {
            this.activeNidget = this.stringDisabled;
        } else {
            switch (this.state) {
                case "in":
                    this.activeNidget = this.stringHover;
                    break;
                case "press":
                    this.activeNidget = this.stringPress;
                    break;
                default:
                    this.activeNidget = this.stringIdle;
                    break;
            }
        }
    }

    mouseRelease(e) {
        this.state = "hover";
        if (this.disabled) return;
        this.activeNidget = this.stringHover;
    }

    mousePress(e) {
        this.state = "press";
        if (this.disabled) return;
        this.activeNidget = this.stringPress;
    }

    hideAllImages() {
        this.querySelector(this.stringHover).hide();
        this.querySelector(this.stringDisabled).hide();
        this.querySelector(this.stringPress).hide();
        this.querySelector(this.stringIdle).hide();
    }

    set activeNidget(selector) {
        this.hideAllImages();
        this._activeNidget = this.querySelector(selector);
        this._activeNidget.show();
    }

    get activeNidget() {
        return this._activeNidget;
    }

    set state(value) {
        this.setAttribute("data-state", value);
    }

    get state() {
        return this.getAttribute("data-state");
    }

    testAlpha(x, y) {
        let pixel = this.activeNidget.getPixel(x, y);
        return pixel[3] > this.alphaTolerance;
    }

    mouseLeave() {
        this.state = "out";
        if (this.disabled) return;
        this.activeNidget = this.stringIdle;
    }

    mouseActive() {
        this.state = "hover";
        if (this.disabled) return;
        this.activeNidget = this.stringHover;
    }

    mouseMove(e) {
        if (!this.testAlpha(e.clientX, e.clientY)) {
            this.state = "out";
            if (this.disabled) return;
            this.activeNidget = this.stringIdle;
        } else {
            this.state = "hover";
            if (this.disabled) return;
            this.activeNidget = this.stringHover;
        }
    }
}
;

window.customElements.define('nidget-button', NidgetButton);
module.exports = NidgetButton;


},{"../NidgetElement":7}],11:[function(require,module,exports){
"use strict";
const NidgetElement = require("../NidgetElement");

class NidgetButtonSet extends NidgetElement {
    connectedCallback() {
        super.connectedCallback();
        this.alphaTolerance = 0; // alpha needs to be > tolerance to trigger events.

        this.addEventListener("mousedown", this.mousePress);
        this.addEventListener("mouseup", this.mouseRelease);
        this.addEventListener("mousemove", this.mouseMove);
        this.addEventListener("mouseleave", this.mouseLeave);

        this.addEventListener("click", function (e) {
            if (!this.disabled) return true;
            e.stopPropagation();
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        });
    }

    nidgetReady(){
        this.buttons = this.querySelectorAll("nidget-button");
    }

    mousePress(e){
        for (let element of this.buttons) {
            if (element.isUnder(e)) {
                element.mousePress();
                this.state = "press";
            }
        }
    }

    mouseRelease(e){
        this.state = "out";
        for (let element of this.buttons) {
            if (element.isUnder(e)) {
                if (element.state == "press"){
                    this.dispatchEvent(new CustomEvent("button-clicked", {detail: element}));
                }
                element.mouseRelease();
                this.state = "hover";
            }
        }
    }

    mouseMove(e){
        this.state = "out";
        for (let element of this.buttons){
            if (element.isUnder(e)) {
                element.mouseActive();
                this.state = "hover";
            } else {
                element.mouseLeave();
            }
        }
    }

    mouseLeave(e){
        for (let element of this.buttons) {
            element.mouseLeave();
            this.state = "out";
        }
    }

    set state(value){
        this.setAttribute("data-state", value);
    }

    get state(){
        return this.getAttribute("data-state");
    }
}

window.customElements.define('nidget-button-set', NidgetButtonSet);
module.exports = NidgetButtonSet;
},{"../NidgetElement":7}],12:[function(require,module,exports){
"use strict";
const Nidget = require("../NidgetElement");

/**
 * A Nidget that changes the image for hover, disabled, press, and idle.
 * Fires a click event when clicked.
 * 
 * This is the html element "nidget-button".
 * If the nidget-button has the attribute `img-prefix = "prefix"` then the 
 * following images.  `img-suffix` = "suffix" will override the ".png".
 * will be used:
 * - prefix-hover.png
 * - prefix-disabled.png
 * - prefix-press.png
 * - prefix-idle.png
 */
class NidgetButtonState extends Nidget {

    connectedCallback() {
        super.connectedCallback();
    }

    nidgetReady(){
        this.img = document.createElement("img");
        this.img.setAttribute("src", this.getAttribute("image-src"));
        this.append(this.img);
    }

    show(){
        super.show();
        this.loadCanvas();
    }

    loadCanvas(){
        if (!this.img || this.canvas) return;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.img.naturalWidth;
        this.canvas.height = this.img.naturalHeight;
        this.canvas.getContext('2d').drawImage(this.img, 0, 0);
        return this.canvas;
    }

    getPixel(x, y){
        this.loadCanvas();
        let dx = this.canvas.width / this.offsetWidth;
        let dy = this.canvas.height / this.offsetHeight;
        let pixel = this.canvas.getContext('2d').getImageData(dx * x, dy * y, 1, 1).data;
        return pixel;
    }

    /**
     * Set state to HOVER, DISABLED, PRESS, IDLE.
     * @param {type} state
     * @return {undefined}
     */
    set state(state) {
        this.setAttribute("state", state.toUpperCase());
    }

    get state() {
        return this.setAttribute("state");
    }

    set source(img) {
        this.setAttribute("src", img);
    }

    get source() {
        return this.setAttribute("src");
    }
}
;

window.customElements.define('nidget-button-state', NidgetButtonState);
module.exports = NidgetButtonState;


},{"../NidgetElement":7}],13:[function(require,module,exports){
"use strict";
const NidgetElement = require("../NidgetElement");

/**
 * A component that has events for adding nidgets, removing nidgets, and 
 * resizing the container.  When the container size is changed, the number
 * of components change, or the layout attribute changes, the doLayout function
 * is called.
 * 
 * The components are arraged according to the selected layout attribute.  If 
 * no layout attribute is chosen, doLayout is still called as it is assumed 
 * a custom function has been provided.
 */

class NidgetContainer extends NidgetElement {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        let resizeObserver = new ResizeObserver(this.doLayout);
        resizeObserver.observe(this);
    }

    static get observedAttributes() {
        return [NidgetContainer.layoutAttribute];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        this.doLayout();
    }

    set layout(value) {
        this.setAttribute(NidgetContainer.layoutAttribute, value);
    }

    get layout() {
        return this.getAttribute(NidgetContainer.layoutAttribute);
    }      

    doLayout() {
        if (!this.layout) return;
        if (!Layouts[this.layout]) throw `invalid layout: ${this.layout}`;
        Layouts[this.layout];
    }
}

class Layouts {
    /**
     * Fit all nidgets evenly in a horizontal row.
     * @param {type} nidget
     * @return {undefined}
     */
    static row(nidget) {
        console.log(this.size);
    }
}


NidgetContainer.layoutAttribute = "layout";
window.customElements.define('nidget-container', NidgetContainer);
module.exports = NidgetContainer;
},{"../NidgetElement":7}],14:[function(require,module,exports){
"use strict";
const Nidget = require("../Nidget");
const Transformer = require("../Transformer");

/**
 * Don't forget to set 'is' when putting element directly in html as opposed to
 * programically.
 * <img is="registered-name" src="image.png"></img>
 * 
 * include a custom element definition at the end of the class.<br>
 * window.customElements.define('registered-name', Class, {extends: "img"});
 */
class NidgetHTMLImage extends HTMLImageElement {
    constructor() {
        super();
        this.lastDisplay = undefined;
        this.transformer = new Transformer(this);
    }

    scale(dw, dh) {
        if (!dh) dh = dw;
        let w = this.width * dw;
        let h = this.height * dh;
        this.width = w;
        this.height = h;
    }        

    set src(value) {
        this.setAttribute("src", value);
    }

    get src() {
        return this.getAttribute("src");
    }

    locate(left, top) {
        this.left = left;
        this.top = top;
    }

    get left() {
        let w = window.getComputedStyle(this).left;
        return parseFloat(w);
    }

    get top() {
        let h = window.getComputedStyle(this).top;
        return parseFloat(h);
    }

    set left(value) {
        this.style.left = value + "px";
    }

    set top(value) {
        this.style.top = value + "px";
    }    

    set width(w) {
        this.style.width = w + "px";
    }

    set height(w) {
        this.style.height = w + "px";
    }

    get width() {
        let w = window.getComputedStyle(this).width;
        return parseFloat(w);
    }

    get height() {
        let h = window.getComputedStyle(this).height;
        return parseFloat(h);
    }        

    show() {
        if (this.lastDisplay) {
            this.style.display = this.lastDisplay;
            this.lastDisplay = undefined;
        } else {
            this.style.display = "inline-block";
        }
    }

    hide() {
        this.lastDisplay = this.style.display;
        this.style.display = "none";
    }

    set display(value){
        this.style.display = value;
    }
    
    get display(){
        return window.calculateStyle(this)["display"];
    }

    detach() {
        try {
            this.parentNode.removeChild(this);
        } catch (err) {
            console.error(this);
            console.error(err);
        }
    }
    
    set disabled(value){
        if (value === true) {
            this.setAttribute("disabled", true);
        } else {
            this.removeAttribute("disabled", false);
        }
    }
    
    get disabled(){
        if (!this.hasAttribute("disabled")) return false;
        return this.getAttribute("disabled");
    }    
    
    clearPos(){
        this.style.top = null;
        this.style.left = null;
    }

    clearDims(){
        this.style.width = null;
        this.style.height = null;
    }    
}

module.exports = NidgetHTMLImage;

},{"../Nidget":6,"../Transformer":9}],15:[function(require,module,exports){
"use strict";
const NidgetElement = require("../NidgetElement");

/**
 * A Nidget that contains images.
 */
class NidgetImage extends NidgetElement {

    constructor(src){
        super();
        this.img = document.createElement("img");
        if (src) this.src = src;
    }

    connectedCallback(){
        let src = this.getAttribute(NidgetImage.srcAttribute);        
        if (src) this.img.setAttribute("src", src);       
        this.appendChild(this.img);
        super.connectedCallback();
    }

    get src(){
        return this.img.getAttribute("src");
    }

    set src(value){
        this.img.setAttribute("src", value);
    }

    size(width, height){
        this.style.width = width
        this.style.height = height
        this.img.style.width = width
        this.img.style.height = height
    }
    
    scale(dw, dh){
        if (!dh) dh = dw;
        let width = this.offsetWidth * dw;
        let height = this.offsetHeight * dh;
        this.size(`${width}px`, `${height}px`);
    }
    
    show(){
        if (this.style.display === "none"){
            delete this.style.display;
        }
    }
    
    hide(){
        this.style.display = "none";
    }
}

NidgetImage.srcAttribute = "src";
window.customElements.define('nidget-image', NidgetImage);
module.exports = NidgetImage;
},{"../NidgetElement":7}],16:[function(require,module,exports){
"use strict";
const NidgetElement = require("../NidgetElement");

/**
 * When using --nidget-fit-text, do not include height and width attributes.
 * A font size can be used as a starting point.
 */
class FitText {
    constructor(nidget){
        this.nidget = nidget;
        this.lock = "none";
        this.parseArguments();
    }

    listen(){
        this.observer = new ResizeObserver(()=>this.delayResize(this.hValue, this.wValue));
        this.observer.observe(this.nidget.parentElement);
        this.direction = 0;
        this.delay = 25;
        this.delayResize(this.hValue, this.wValue);
        this.stop = false;
    }

    delayResize(hValue, wValue){
        this.direction = 0;
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(()=>this.onResize(hValue, wValue), this.delay);
    }

    notify(hValue, wValue){
        console.log("notify");
        this.stop = false;
        this.delayResize(hValue, wValue);
    }

    parseArguments(){
        let args = getComputedStyle(this.nidget).getPropertyValue("--nidget-fit-text");

        if (!args || args === false || args === "false"){
            return;
        }

        this.hValue = this.wValue = true;

        if (typeof(args) == "string"){
            let obj = JSON.parse(args);
            if (obj["fit"] !== undefined && obj["fit"] === "width") this.hValue = false;
            if (obj["fit"] !== undefined && obj["fit"] === "height") this.wValue = false;
            if (obj["lock"] !== undefined) this.lock = (obj["lock"]);
        }
    }

    onResize(hValue, wValue){
        delete this.timeout;

        if (this.stop) return;
        if (this.nidget.textContent === "") return;
        if (this.nidget.parentElement.offsetHeight === 0) return;
        if (this.nidget.parentElement.offsetWidth === 0) return;
        if (this.nidget.style.display === "none") return;

        if (!hValue && !wValue) return;

        let hDir = this.nidget.parentElement.offsetHeight - this.nidget.scrollHeight;
        let wDir = this.nidget.parentElement.offsetWidth - this.nidget.scrollWidth;

        if (!hValue) hDir = 0;
        if (!wValue) wDir = 0;

        let dir = Math.sign(hDir | wDir); // will prefer to shrink
        if (this.direction === 0) this.direction = dir; // keep previous direction

        let fontSize = parseInt(getComputedStyle(this.nidget)["font-size"])
        let newSize = fontSize + (this.direction);

        if (newSize !== fontSize && this.direction === dir) {
            this.nidget.style.fontSize = newSize + "px";
            if (this.timeout) clearTimeout(this.timeout);
            this.timeout = setTimeout(()=>this.onResize(hValue, wValue), this.delay);
        } else if (dir < 0 && this.direction > 0) { // reverse direction if growing too large
            this.direction = -1;
            this.timeout = setTimeout(()=>this.onResize(hValue, wValue), this.delay);
        } else {
            if (this.lock === "vh") {
                let fontRatio = newSize / window.innerHeight * 100;
                this.nidget.style.fontSize = fontRatio + "vh";
                this.stop = true;
            } else if (this.lock === "vw"){
                let fontRatio = newSize / window.innerWidth * 100;
                this.nidget.style.fontSize = fontRatio + "vw";
                this.stop = true;
            }
            this.direction = 0;
        }
    }
}

/**
 * A nidget element for displaying text.
 * put '--nidget-fit-text: 1.0;' into css for this element to enable scaling.
 * see: NidgetStyle.js
 */
class NidgetText extends NidgetElement {

    constructor() {
        super();
        this.observers["fit-text-width-tolerance"] = 0.02;
        this.fitText = new FitText(this);
    }

    remove(){
        if (this.fitText) {
            this.fitText.stop = true;
            this.fitText.observer.disconnect();
        }
        super.remove();
    }

    connectedCallback() {
        super.connectedCallback();
        let fitProp = getComputedStyle(this).getPropertyValue("--nidget-fit-text");

        if (fitProp !== undefined && fitProp !== ""){
            this.fitText.listen();
        }
    }

    set text(value){
        this.innerText = value;
        if (this.fitText && this.fitText.stop === false){
            this.fitText.delayResize();
        }
    }

    get text(){
        return this.innerText;
    }

    scale(amount) {
        let styleFontSize = window.getComputedStyle(this, null).getPropertyValue("font-size");
        let fontSize = parseFloat(styleFontSize);
        this.style.fontSize = (fontSize * amount) + "px";
    }

    /**
     * Set the line height to the offset height multiplied by ratio.
     * Calling this method directory will override the value set by css
     */
    nidgetVertAlignText(value) {
        if (value) {
            this.style.setProperty("--nidget-vert-align-text", value);
        }

        let onResize = () => {
            let ratio = getComputedStyle(this).getPropertyValue("--nidget-vert-align-text");
            if (!parseFloat(ratio)) return;
            let h = this.offsetHeight * ratio;
            this.style.lineHeight = h + "px";
        }

        if (this.observers.vertAlignText === undefined) {
            this.observers.vertAlignText = new ResizeObserver(onResize);
            this.observers.vertAlignText.observe(this)
        }
        onResize()
    }

    vertAlignText(ratio = 1.0){
        if (!parseFloat(ratio)) return;
        let h = this.offsetHeight * ratio;
        this.style.lineHeight = h + "px";
    }
}
;

window.customElements.define('nidget-text', NidgetText);
module.exports = NidgetText;
},{"../NidgetElement":7}],17:[function(require,module,exports){
"use strict";
const dragHandler = require("../DragHandler").instance;


function onDragStart(event){    
    dragHandler.set(this);
    window.x = this;
    console.log("'" + this.name() + "'");
    this.notifyListeners("dragStart" + this.name(), event, this);
}

function onDragEnd(event){
    if (dragHandler.get() !== this) return;
    this.notifyListeners("dragEnd" + this.name(), event, this);
    dragHandler.clear();
}


module.exports = function(nidget){
    nidget.getElement().setAttribute("draggable", "true");   
    
    nidget.onDragStart = onDragStart.bind(nidget);
    nidget.onDragEnd = onDragEnd.bind(nidget);
    
    nidget.getElement().addEventListener("dragstart", nidget.onDragStart);
    nidget.getElement().addEventListener("dragend", nidget.onDragEnd);    
};
},{"../DragHandler":2}],18:[function(require,module,exports){
"use strict";
const dragHandler = require("../DragHandler").instance;
const MouseUtilities = require("../MouseUtilities");

function onDragOver(event){
    event.preventDefault();
    let dragNidget = dragHandler.get();
    this.notifyListeners("dragOver" + this.name(), event, this, dragNidget);
}

function onDragEnter(event){
    if (!dragHandler.has()) return;
    if (!dragHandler.pushOver(this)) return;
    this.notifyListeners("dragEnter" + this.name(), event, this);
}

function onDragLeave(event){
    if (!dragHandler.has()) return;
    if (MouseUtilities.isUnder(this.getElement())) return;
    if (!dragHandler.removeOver(this)) return;
    this.notifyListeners("dragLeave" + this.name(), event, this);
}

function onDrop(event){
    let dragNidget = dragHandler.get();
    this.notifyListeners("drop" + this.name(), event, this, dragNidget);
}

module.exports = function(nidget){
    nidget.onDragOver = onDragOver.bind(nidget);
    nidget.onDrop = onDrop.bind(nidget);
    nidget.onDragEnter = onDragEnter.bind(nidget);
    nidget.onDragLeave = onDragLeave.bind(nidget);
    
    nidget.getElement().addEventListener("dragover", nidget.onDragOver);
    nidget.getElement().addEventListener("drop", nidget.onDrop);
    nidget.getElement().addEventListener("dragenter", nidget.onDragEnter);
    nidget.getElement().addEventListener("dragleave", nidget.onDragLeave);    
};
},{"../DragHandler":2,"../MouseUtilities":5}],19:[function(require,module,exports){
"use strict";
const MouseUtilities = require("../MouseUtilities");

function onClick(event){    
    this.notifyListeners("click" + this.name(), event, this);
}

function onMouseDown(event){    
    this.notifyListeners("mouseDown" + this.name(), event, this);
}

function onMouseUp(event){    
    this.notifyListeners("mouseUp" + this.name(), event, this);
}

function onMouseEnter(event){    
    this.notifyListeners("mouseEnter" + this.name(), event, this);
}

function onMouseLeave(event){
    if (MouseUtilities.isUnder(this.getElement())) return;
    this.notifyListeners("mouseExit" + this.name(), event, this);
}

module.exports = function(nidget){
    console.log("mouse setup");
    
    nidget.onClick = onClick.bind(nidget);
    nidget.onMouseDown = onMouseDown.bind(nidget);
    nidget.onMouseUp = onMouseUp.bind(nidget);
    nidget.onMouseEnter = onMouseEnter.bind(nidget);
    nidget.onMouseLeave = onMouseLeave.bind(nidget);
    
    nidget.getElement().addEventListener("click", nidget.onClick);
    nidget.getElement().addEventListener("mousedown", nidget.onMouseDown);
    nidget.getElement().addEventListener("mouseup", nidget.onMouseUp);
    nidget.getElement().addEventListener("mouseenter", nidget.onMouseEnter);
    nidget.getElement().addEventListener("mouseout", nidget.onMouseLeave);
};

},{"../MouseUtilities":5}],20:[function(require,module,exports){
"use strict";

/**
 * Enable the nidget to be moved by dragging.  Will drag by any child eleement
 * the '.nidget-header' class, otherwise movable by clicking anywhere.
 * @param {type} e
 * @return {undefined}
 */

function onMouseMove(e){    
    e.preventDefault();
    if (!this.__movable.active) return;    

    // calculate the new cursor position:
    let deltaX = this.__movable.lastX - e.clientX;
    let deltaY = this.__movable.lastY - e.clientY;
    this.__movable.lastX = e.clientX;
    this.__movable.lastY = e.clientY;
    
    // set the element's new position:
    this.style.top = (this.offsetTop - deltaY) + "px";
    this.style.left = (this.offsetLeft - deltaX) + "px";
}

function onMouseDown(e){
    e.preventDefault();
    this.__movable.active = true;
    
    // get the mouse cursor position at startup:
    this.__movable.lastX = e.clientX;
    this.__movable.lastY = e.clientY;
}

function onMouseUp(e){
    this.__movable.active = false;
}

module.exports = function(nidget){
    nidget.__movable = {
        lastX : 0,
        lastY : 0,
        active : false
    };
    
    nidget.onMouseDown = onMouseDown.bind(nidget);        
    
    if (nidget.querySelector(".nidget-header")){
        nidget.querySelector(".nidget-header").addEventListener("mousedown", nidget.onMouseDown);        
    } else {
        nidget.addEventListener("mousedown", nidget.onMouseDown);
    }
    
    nidget.onMouseMove = onMouseMove.bind(nidget);    
    window.addEventListener("mousemove", nidget.onMouseMove);

    nidget.onMouseUp = onMouseUp.bind(nidget);    
    nidget.addEventListener("mouseup", nidget.onMouseUp);

};
},{}],21:[function(require,module,exports){
"use strict";
const Nidget = require("../Nidget");
window.Nidget = Nidget;

/**
 * Add a resize observer to the element that will call a onResize() function.
 * The parameters passed in are (previous_dimensions).  To use add
 * interfaces="resize" to the element in html and a method onResize() to the 
 * class object.  If there is no class object create a function and bind it.
 * ie: element.onResize = function.bind(element); 
 */

let onResize = function(){
    let data = this[Nidget.interfaceDataField].resize;
    let prev = data.prev;
    if (!this.onResize) return;
    this.onResize(prev);
    loadPrevious(this);
};

let loadPrevious = function(nidget){
    let data = nidget[Nidget.interfaceDataField].resize;
    data.prev = {
        width : nidget.offsetWidth,
        height : nidget.offsetHeight
    };    
};

/**
 * Setup a resize observer for the nidget that triggers the onResize method if 
 * available.
 * - onResize(this, previous_dimensions) : none
 * @param {type} nidget
 * @return {undefined}
 */
module.exports = function(nidget){
    if (typeof(nidget) !== "object") throw new "Object exected";
    let resizeObserver = new ResizeObserver(onResize.bind(nidget));
    resizeObserver.observe(nidget);
    loadPrevious(nidget);
};
},{"../Nidget":6}],22:[function(require,module,exports){
'use strict';
module.exports = {
    AbstractModel : require("./AbstractModel"),
    NidgetElement : require("./NidgetElement"),
    FileOperations : require("./FileOperations"),
    NidgetButtonSet : require("./nidget-components/NidgetButtonSet"),
    NidgetButton : require("./nidget-components/NidgetButton"),
    NidgetButtonState : require("./nidget-components/NidgetButtonState"),
    NidgetImage : require("./nidget-components/NidgetImage"),
    NidgetHTMLImage : require("./nidget-components/NidgetHTMLImage"),
    NidgetText : require("./nidget-components/NidgetText"),
    NidgetContainer : require("./nidget-components/NidgetContainer"),
    MouseUtilities : require("./MouseUtilities"),
    Constants: require("./Nidget"),
    layouts: {}
};
},{"./AbstractModel":1,"./FileOperations":3,"./MouseUtilities":5,"./Nidget":6,"./NidgetElement":7,"./nidget-components/NidgetButton":10,"./nidget-components/NidgetButtonSet":11,"./nidget-components/NidgetButtonState":12,"./nidget-components/NidgetContainer":13,"./nidget-components/NidgetHTMLImage":14,"./nidget-components/NidgetImage":15,"./nidget-components/NidgetText":16}],23:[function(require,module,exports){
const FileOps = require("./modules/FileOps.js");
const Authenticate = require("./modules/Authenticate.js");
const Menu = require("./modules/Menu.js");
const QuestionPane = require("./modules/QuestionPane.js");
const EditorPane = require("./modules/EditorPane.js");
const Model = require("./modules/Model");

const Nidget = require("@thaerious/nidget")
require("./modules/GameBoard.js");
require("./modules/MultipleChoicePane.js");
require("./modules/CheckBox.js");

let fileOps = new FileOps();
let model = null;
let questionPane = null;
let editorPane = null;

window.onload = async () => {
    setTimeout(setup, 2000);
}

async function setup(){
    await Nidget.NidgetElement.loadTemplateSnippet("snippets/check-box.html", "check-box");
    await Nidget.NidgetElement.loadTemplateSnippet("snippets/multiple-choice-pane.html", "multiple-choice-pane");
    await Nidget.NidgetElement.loadTemplateSnippet("snippets/game-board.html", "game-board");
    await Nidget.NidgetElement.loadTemplateSnippet("snippets/question-pane.html", "question-pane");

    parseURLParameters();
    new Menu().init("#menu");

    try {
        await new Authenticate().loadClient();
        await fileOps.loadClient();
    } catch (err) {
        console.log(err);
    }

    let file = await fileOps.get(window.parameters.fileId);
    let model = new Model(fileOps).set(JSON.parse(file.body));
    window.model = model;

    document.querySelector("#game-name").textContent = model.name;
    editorPane = new EditorPane(model);
    editorPane.onSave = saveModel;
}

/**
 * Save the model to the google app data folder.
 */
function saveModel() {
    fileOps.setBody(window.parameters.fileId, JSON.stringify(window.model.get(), null, 2));
}

/**
 * Change the name of the file in google's app data folder.
 */
function renameModel() {
    let name = document.querySelector("#game-name").textContent;
    fileOps.rename(window.parameters.fileId, name + ".json");
    window.model.name = name;
    saveModel();
}

/**
 * Extract value from the URL string, store in 'window.parameters'.
 */
function parseURLParameters() {
    window.parameters = {};
    const parameters = window.location.search.substr(1).split("&");
    for (const parameter of parameters) {
        const split = parameter.split(/=/);
        window.parameters[split[0]] = split[1] ?? "";
    }
}
},{"./modules/Authenticate.js":24,"./modules/CheckBox.js":25,"./modules/EditorPane.js":26,"./modules/FileOps.js":27,"./modules/GameBoard.js":28,"./modules/Menu.js":29,"./modules/Model":30,"./modules/MultipleChoicePane.js":31,"./modules/QuestionPane.js":32,"@thaerious/nidget":22}],24:[function(require,module,exports){
// see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

class Authenticate {
    constructor(){
        Object.assign(this, require("./googleFields.js"));
    }

    loadClient() {
        return new Promise((resolve, reject) => {
            gapi.load('client:auth2', () => this.__initClient(resolve, reject));
        });
    }

    __initClient(resolve, reject) {
        gapi.client.init({
            apiKey: this.developerKey,
            clientId: this.clientId,
            discoveryDocs: this.discoveryDocs,
            scope: this.scope
        }).then(function (result) {
            resolve();
        }, function(error) {
            console.log("ERROR INIT");
            console.log(error);
            reject(error);
        });
    }

    isAuthorized(){
        var user = gapi.auth2.getAuthInstance().currentUser.get();
        return user.hasGrantedScopes(this.scope);
    }

    signIn(){
        gapi.auth2.getAuthInstance().signIn();
    }

    signOut(){
        gapi.auth2.getAuthInstance().signOut();
    }

}

module.exports = Authenticate;
},{"./googleFields.js":33}],25:[function(require,module,exports){
const NidgetElement = require("@Thaerious/nidget").NidgetElement;

class CheckBox extends NidgetElement {
    async connectedCallback(){
        super.connectedCallback();
        this.addEventListener("click", ()=>{
            this.toggle();
        });
    }

    toggle(){
        if (this.checked === 'true') this.checked = 'false';
        else this.checked = 'true'
    }

    get checked(){
        if (!this.hasAttribute(CheckBox.CHECKED_ATTRIBUTE)){
            this.setAttribute(CheckBox.CHECKED_ATTRIBUTE, 'false');
        }
        return this.getAttribute(CheckBox.CHECKED_ATTRIBUTE);
    }

    set checked(value){
        return this.setAttribute(CheckBox.CHECKED_ATTRIBUTE, value);
    }
}

CheckBox.CHECKED_ATTRIBUTE = "checked";
window.customElements.define('check-box', CheckBox);
module.exports = CheckBox;
},{"@Thaerious/nidget":22}],26:[function(require,module,exports){
const Model = require("./Model.js");

// showQuestion(cell){
//     if (cell) this.cell = cell;
//     cell = cell ?? this.cell;
//
//     this.navAnswer.classList.remove("selected");
//     this.navQuestion.classList.add("selected");
//
//     this.status = "q";
//
//     this.navBoard.classList.remove("hidden");
//     this.navQuestion.classList.remove("hidden");
//     this.navAnswer.classList.remove("hidden");
//
//     this.textQuestion.classList.remove("hidden");
//     this.textQuestion.querySelector(".text-contents").text = cell.q;
// }
//
// showAnswer(cell){
//     if (cell) this.cell = cell;
//     cell = cell ?? this.cell;
//
//     this.navAnswer.classList.add("selected");
//     this.navQuestion.classList.remove("selected");
//
//     this.status = "a";
//
//     this.navBoard.classList.remove("hidden");
//     this.navQuestion.classList.remove("hidden");
//     this.navAnswer.classList.remove("hidden");
//
//     this.textQuestion.classList.remove("hidden");
//     this.textQuestion.querySelector(".text-contents").text = cell.a;
// }

class EditQuestionPane{
    /**
     * @param gameBoard
     * @param questionPane
     * @param model - the question model object
     * @param field - which model field to read/write from {'a', 'q'}
     * @param saveCB - call this method to save the model
     */
    constructor(gameBoard, questionPane, model, field, saveCB, closeCB) {
        this.questionPane = questionPane;

        questionPane.setText(model[field]);

        this.textList = (event)=>{
            model[field] = event.detail.text;
            saveCB();
        }

        this.boardList = (event)=>{
            questionPane.hide();
            this.cleanup();
            gameBoard.show();
            closeCB();
        }

        this.answerList = (event)=>{
            this.cleanup();
            new EditQuestionPane(gameBoard, questionPane, model, 'a', saveCB, closeCB);
        }

        this.questionList = (event)=>{
            this.cleanup();
            new EditQuestionPane(gameBoard, questionPane, model, 'q', saveCB, closeCB);
        }

        questionPane.addEventListener("text-update", this.textList);
        questionPane.addEventListener("button-board", this.boardList);

        if (field === 'a'){
            questionPane.addEventListener("button-question", this.questionList);
            questionPane.highlight('answer');
        }
        else if (field === 'q'){
            questionPane.addEventListener("button-answer", this.answerList);
            questionPane.highlight('question');
        }
    }

    cleanup(){
        this.questionPane.removeEventListener("text-update", this.textList);
        this.questionPane.removeEventListener("button-board", this.boardList);
        this.questionPane.removeEventListener("button-answer", this.answerList);
        this.questionPane.removeEventListener("question-answer", this.questionList);
    }

    onSave(){}
    onClose(){}
}

class EditorPane{
    constructor(model) {
        this.model = model;
        this.triangleRight = document.querySelector("#triangle-right");
        this.triangleLeft  = document.querySelector("#triangle-left");
        this.roundLabel    = document.querySelector("#round-number");
        this.gameName      = document.querySelector("#game-name");

        this.multipleChoicePane = document.getElementById("multiple-choice-pane");
        this.gameBoard          = document.getElementById("game-board");
        this.questionPane       = document.getElementById("question-pane");

        document.querySelector("#menu-add-category").addEventListener("click", ()=>{
            this.model.addCategoryRound();
            this.updateTriangleView();
            this.onSave();
        });

        document.querySelector("#menu-add-multiple-choice").addEventListener("click", ()=>{
            this.model.addMultipleChoiceRound();
            this.updateTriangleView();
            this.onSave();
        });

        document.querySelector("#menu-remove-round").addEventListener("click", ()=>this.menuRemove());
        document.querySelector("#menu-home-screen").addEventListener("click", ()=>this.menuHome());
        document.querySelector("#menu-value-plus").addEventListener("click", ()=>this.menuPlus());
        document.querySelector("#menu-value-minus").addEventListener("click", ()=>this.menuMinus());

        this.triangleRight.addEventListener("click", ()=> this.nextRound());
        this.triangleLeft.addEventListener("click", ()=> this.prevRound());
        this.gameName.addEventListener("keydown", (event)=>this.inputName(event));

        // game-board change category text
        this.gameBoard.addEventListener("header-update", event =>{
            let col = event.detail.col;
            this.model.getColumn(col).category = event.detail.value;
            this.model.getColumn(col).fontSize = event.detail.fontSize;
            this.onSave();
        });

        // game-board select cell
        this.gameBoard.addEventListener("cell-select", event =>{
            let row = event.detail.row;
            let col = event.detail.col;
            this.gameBoard.hide();
            this.questionPane.show();
            this.hideNavigation();
            new EditQuestionPane(this.gameBoard, this.questionPane, this.model.getCell(row, col), 'q', ()=>this.onSave(), ()=>this.updateView());
        });

        this.linkPanes();
        this.updateView();
    }

    onSave(){}
    updateName(){}

    linkPanes(){
        let multipleChoice = document.getElementById("multiple-choice-pane");
        let gameBoard = document.getElementById("game-board");
        let questionPane = document.getElementById("question-pane");
    }

    inputName(event){
        if (event.which === 13){
            this.updateName();
            event.stopPropagation();
            event.preventDefault();
            document.querySelector("#game-board-container").focus();
            return false;
        }
    }

    hideNavigation(){
        this.triangleLeft.classList.add("hidden");
        this.triangleRight.classList.add("hidden");
    }

    updateView(model) {
        model = model ?? this.model;
        this.updateTriangleView();

        document.getElementById("game-board").hide();
        document.getElementById("multiple-choice-pane").hide();

        if (model.getRound().type === Model.questionType.CATEGORY) this.categoryView(model);
        if (model.getRound().type === Model.questionType.MULTIPLE_CHOICE) this.multipleChoiceView(model);
    }

    updateTriangleView(){
        console.log("update triangle view");
        this.triangleLeft.classList.remove("hidden");
        this.triangleRight.classList.remove("hidden");
        if (this.model.currentRound === 0) this.triangleLeft.classList.add("hidden");
        if (this.model.currentRound >= this.model.roundCount - 1) this.triangleRight.classList.add("hidden");
        this.roundLabel.textContent = "Round " + (this.model.currentRound + 1);
    }

    multipleChoiceView(){
        let pane = document.getElementById("multiple-choice-pane");
        pane.show();
    }

    categoryView(model){
        let gameBoard = document.getElementById("game-board");
        gameBoard.show();

        for (let col = 0; col < 6; col++) {
            let column = model.getColumn(col);

            gameBoard.getHeader(col).fitText.lock = "vh";
            gameBoard.setHeader(col, column.category, column.fontSize);

            for (let row = 0; row < 5; row++) {
                gameBoard.setCell(row, col, column.cell[row].value);
                if (column.cell[row].q === "") gameBoard.setComplete(row, col, "false");
                else if (column.cell[row].a === "") gameBoard.setComplete(row, col, "partial");
                else gameBoard.setComplete(row, col, "true");
            }
        }
    }

    nextRound(){
        this.model.currentRound++;
        this.updateView();
    }

    prevRound(){
        this.model.currentRound--;
        this.updateView();
    }

    menuPlus(){
        this.model.increaseValue();
        this.onSave();
        this.updateView();
    }

    menuMinus(){
        this.model.decreaseValue();
        this.onSave();
        this.updateView();
    }

    menuRemove(){
        this.model.removeRound();
        this.updateTriangleView();
        this.onSave();
        this.updateView();
    }

    menuHome(){
        location.href = "home.html";
    }
}

module.exports = EditorPane;
},{"./Model.js":30}],27:[function(require,module,exports){
"use strict";
// see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

class FileOps {

    async load(){
        await this.loadClient();
        await this.loadDrive();
    }

    loadClient() {
        return new Promise((resolve, reject) => {
            gapi.load('client', () => resolve());
        });
    }

    loadDrive() {
        return new Promise((resolve, reject) => {
            gapi.client.load('drive', 'v3', resolve());
        });
    }

    async create(){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.create({
                name : FileOps.filename,
                parents: ['appDataFolder'],
                fields: "id"
            }).then(res=>{
                resolve(res.result.id);
            }, function (error) {
                reject(error);
            });
        });
    }

    async delete(fileId){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.delete({
                fileId : fileId
            }).then(res=>{
                resolve(res.result);
            }, function (error) {
                reject(error.message);
            });
        });
    }

    async list(){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.list({
                // q: `name contains '.json'`,
                spaces: 'appDataFolder',
                fields: 'files/name,files/id,files/modifiedTime'
            }).then(res=>{
                resolve(res.result.files);
            }, function (error) {
                reject(error);
            });
        });
    }

    async get(fileId){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            }).then(res=>{
                resolve(res);
            }, function (error) {
                console.log(error);
                reject(error.message);
            });
        });
    }

    async setBody(fileId, body){
        return new Promise((resolve, reject)=> {
            gapi.client.request({
                path : "upload/drive/v3/files/" + fileId,
                method : "PATCH",
                params : {
                    uploadType : "media"
                },
                headers : {
                    "Content-Type" : "application/json"
                },
                body : body
            }).then(res=>{
                resolve(JSON.parse(res.body));
            }, function (error) {
                console.log(error);
                reject(error.message);
            });
        });
    }

    async rename(fileId, filename){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.update({
                fileId: fileId,
                name: filename
            }).then(res=>{
                resolve(JSON.parse(res.body));
            }, function (error) {
                console.log(error);
                reject(error.message);
            });
        });
    }
}

FileOps.filename = "Game Name.json";

module.exports = FileOps;
},{}],28:[function(require,module,exports){
"use strict";

/** View-Controller for the HTML game board element
    This is the classical "Jeopardy" type board
    This is model agnostic, see EditorPane.js for model methods
    generates the following events:
        cell-select (row, col): when a user clicks a cell
        header-update (value, col, fontsize) : when the header text changes (and blurs)
 **/

const NidgetElement = require("@Thaerious/nidget").NidgetElement;

class CellSelectEvent extends  CustomEvent{
    constructor(row, col) {
        super('cell-select',
              {detail : {row : row, col : col }}
        );
    }
}

class HeaderUpdateEvent extends  CustomEvent{
    constructor(col, value, fontSize) {
        super('header-update',
            {detail : {value : value, col : col, fontSize : fontSize}}
        );
    }
}

class GameBoard extends NidgetElement {
    constructor() {
        super();
    }

    async ready(){
        await super.ready();
        for (let col = 0; col < 6; col++) {
            this.getHeader(col).addEventListener("input", (event)=>event.target.fitText.notify(1, 1));

            this.getHeader(col).addEventListener("blur", (event)=>{
                let fontSize = window.getComputedStyle(event.target)["font-size"];
                this.dispatchEvent(new HeaderUpdateEvent(col, event.target.text, fontSize));
            });

            for (let row = 0; row < 5; row++) {
                this.getCell(row, col).addEventListener("click", () => {
                    this.dispatchEvent(new CellSelectEvent(row, col));
                });
            }
        }
    }

    /**
     * Set the value of a category
     * @param index
     * @param value
     * @param value
     */
    setHeader(index, value, fontSize){
        let element = this.getHeader(index);
        element.text = value;
        if (fontSize) element.style["font-size"] = fontSize;
    }

    /**
     * Retrieve the header html element
     * @param index
     * @param value
     */
    getHeader(index){
        if (typeof index !== "number" || index < 0 || index > 6) throw new Error("Invalid index: " + index);
        let selector = `[data-row='h'][data-col='${index}'] > .value`;
        return this.querySelector(selector);
    }

    /**
     * Set the value of a non-category cell.
     * @param row
     * @param col
     * @param value
     */
    setCell(row, col, value = ""){
        this.getCell(row, col).textContent = value;
    }

    getCell(row, col){
        let selector = `[data-row="${row}"][data-col="${col}"] > .value`;
        return this.querySelector(selector);
    }

    setComplete(row, col, value){
        if (typeof row !== "number" || row < 0 || row > 6) throw new Error("Invalid row: " + row);
        if (typeof col !== "number" || col < 0 || col > 5) throw new Error("Invalid col: " + col);
        this.getCell(row, col).setAttribute("data-complete", value);
    }
}

window.customElements.define('game-board', GameBoard);
module.exports = GameBoard;
},{"@Thaerious/nidget":22}],29:[function(require,module,exports){
class Menu{
    init(menuSelector){
        this.menuSelector = menuSelector;
        this.menuButton.addEventListener("click", ()=>this.toggleMenu());
        this.positionMenu();

        this.menuArea.addEventListener("mouseleave", ()=> this.mouseLeave());
        this.menuButton.addEventListener("mouseleave", ()=> this.mouseLeave());
        this.menuArea.addEventListener("mouseenter", ()=> this.mouseEnter());
        this.menuButton.addEventListener("mouseenter", ()=> this.mouseEnter());

        document.querySelectorAll("[data-autoclose='true'").forEach((ele)=> {
            ele.addEventListener("click", ()=>this.close());
        });

        document.querySelectorAll(".sub-menu").forEach((ele)=>{
            ele.querySelector(".menu-label").addEventListener("click", ()=>{
                this.toggleMenu(ele);
            });
        });

        return this;
    }

    close(){
        this.menuArea.classList.add("hidden");

        document.querySelectorAll(".sub-menu > .menu-area").forEach((ele)=>{
            ele.classList.add("hidden");
        });
    }

    open(){
        this.menuArea.classList.remove("hidden");
        this.positionMenu();
    }

    mouseLeave(){
        if (this.timeout) return;
        this.timeout = setTimeout(()=>{
            this.close();
            this.timeout = null;
        }, 500);
    }

    mouseEnter(){
        if (!this.timeout) return;
        clearTimeout(this.timeout);
        this.timeout = null;
    }

    toggleMenu(element){
        element = element ?? this.menuArea;
        if (!element.classList.contains("menu-area")){
            element = element.querySelector(".menu-area");
        }

        if (element.classList.contains("hidden")){
            element.classList.remove("hidden");
        } else {
            if (element.classList.contains("menu-area")){
                element.classList.add("hidden");
            }
            element.querySelectorAll(".menu-area").forEach(
                (ele) => {
                    ele.classList.add("hidden");
                }
            );
        }
    }

    positionMenu(){
        const left = this.menuButton.getBoundingClientRect().left;
        const bWidth = this.menuButton.getBoundingClientRect().width;
        const mWidth = this.menuArea.getBoundingClientRect().width;
        if ((left + bWidth + mWidth + 2) > window.innerWidth){
            this.setMenuLeft();
        } else {
            this.setMenuRight();
        }
    }

    setMenuLeft(){
        const left = this.menuButton.offsetLeft;
        const width = this.menuArea.offsetWidth;
        this.menuArea.style.left = (left - width - 2) + "px";
    }

    setMenuRight(){
        const left = this.menuButton.offsetLeft;
        const width = this.menuButton.offsetWidth;
        this.menuArea.style.left = (left + width + 2) + "px";
    }

    get menu(){
        return document.querySelector(this.menuSelector);
    }

    get menuButton(){
        return this.menu.querySelector(".menu-icon");
    }

    get menuArea(){
        return this.menu.querySelector(".menu-area");
    }
}

module.exports = Menu;
},{}],30:[function(require,module,exports){
class Model {
    init(name = "Game Name") {
        this.currentRound = 0;

        this.gameModel = {
            name: name,
            rounds: []
        };

        this.addCategoryRound();
        return this;
    }

    set name(string) {
        this.gameModel.name = string;
    }

    get name() {
        return this.gameModel.name;
    }

    set(gameModel) {
        this.currentRound = 0;
        this.gameModel = gameModel;
        return this;
    }

    get() {
        return this.gameModel;
    }

    getRound(index) {
        index = index ?? this.currentRound;
        return this.gameModel.rounds[index];
    }

    getColumn(index) {
        return this.getRound().column[index];
    }

    getCell(row, column) {
        return this.getColumn(column).cell[row];
    }

    removeRound() {
        if (this.roundCount === 1) return;
        this.gameModel.rounds.splice(this.currentRound, 1);
        if (this.currentRound >= this.roundCount) this.currentRound = this.roundCount - 1;
    }

    addMultipleChoiceRound(){
        let round = {
            type: Model.questionType.MULTIPLE_CHOICE,
            question : "",
            answers : [
                // value : {true, false}, text
            ]
        };

        this.gameModel.rounds.push(round);
        return round;
    }

    addCategoryRound() {
        let round = {
            type: Model.questionType.CATEGORY,
            column: []
        };

        for (let i = 0; i < 6; i++) {
            round.column[i] = {
                category: "",
                cell: []
            }

            for (let j = 0; j < 5; j++) {
                round.column[i].cell[j] = {
                    value: (j + 1) * 100,
                    type: "text",
                    q: "",
                    a: ""
                }
            }
        }

        this.gameModel.rounds.push(round);
        return round;
    }

    get roundCount() {
        return this.gameModel.rounds.length;
    }

    increaseValue() {
        let round = this.getRound();

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 5; j++) {
                round.column[i].cell[j].value *= 2;
            }
        }
    }

    decreaseValue() {
        let round = this.getRound();

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 5; j++) {
                round.column[i].cell[j].value /= 2;
            }
        }
    }
}

Model.questionType = {
    CATEGORY : "choice",
    MULTIPLE_CHOICE : "multiple_choice"
};

module.exports = Model;
},{}],31:[function(require,module,exports){
const NidgetElement = require("@Thaerious/nidget").NidgetElement;
require("./CheckBox.js");

class MultipleChoicePane extends NidgetElement {

    setModel(model){
        this.model = model;
    }

    async connectedCallback(){
        await super.connectedCallback();
        for (let element of this.querySelectorAll(".answer > nidget-text")){
            element.fitText.lock = "vh";
            // element.addEventListener("input", txtListener);
            element.addEventListener("keypress", (event)=>this.txtListener(event));
        }
    }

    txtListener(event) {
        if (event.which === 13){
            event.stopPropagation();
            event.preventDefault();

            let index = window.getComputedStyle(event.target).getPropertyValue("--index");
            index = parseInt(index);
            if (index >= 5){
                event.target.blur();
            } else {
                let selector = `nidget-text[data-index="${index + 1}"]`;
                this.querySelector(selector).focus();
            }

            model[index] = {
                correct : "",
                text : this.querySelector(`nidget-text[data-index="${index}"]`).text
            }

            return false;
        }
        event.target.fitText.notify(1, 1);
        return true;
    }
}

window.customElements.define('multiple-choice-pane', MultipleChoicePane);
module.exports = MultipleChoicePane;
},{"./CheckBox.js":25,"@Thaerious/nidget":22}],32:[function(require,module,exports){
const NidgetElement = require("@Thaerious/nidget").NidgetElement;

class TextUpdate extends  CustomEvent{
    constructor(text) {
        super('text-update',
            {detail : {text : text}}
        );
    }
}

class BoardClick extends  CustomEvent{
    constructor() {
        super('button-board');
    }
}

class QuestionClick extends  CustomEvent{
    constructor() {
        super('button-question');
    }
}

class AnswerClick extends  CustomEvent{
    constructor() {
        super('button-answer');
    }
}

class QuestionPane extends NidgetElement{

    async ready(){
        await super.ready();

        this.querySelector("#show-board").addEventListener("click", ()=>{
            this.dispatchEvent(new BoardClick());
        });

        this.querySelector("#show-question").addEventListener("click", ()=>{
            this.dispatchEvent(new QuestionClick());
        });

        this.querySelector("#show-answer").addEventListener("click", ()=>{
            this.dispatchEvent(new AnswerClick());
        });

        // this.addEventListener("click", ()=>this.querySelector(".text-contents").focus());

        this.querySelector("#text-contents").addEventListener("blur", async ()=>{
            let text = this.querySelector(".text-contents").text;
            this.dispatchEvent(new TextUpdate(text.trim()));
        });
    }

    clear(){
        this.querySelector(".text-contents").text = "";
    }

    setText(text){
        this.querySelector(".text-contents").text = text;
    }

    /**
     *
     * @param button {'question', 'answer'}
     */
    highlight(button){
        for (let ele of this.querySelectorAll(`.selected`)) ele.classList.remove("selected");
        this.querySelector(`#show-${button}`).classList.add("selected");
    }
}

window.customElements.define('question-pane', QuestionPane);
module.exports = QuestionPane;




},{"@Thaerious/nidget":22}],33:[function(require,module,exports){

module.exports = {
    // The Browser API key obtained from the Google API Console.
    developerKey : 'AIzaSyABcdLmT6HH_7Go82q_IBGI3jm6UL4w4Q0',

    // The Client ID obtained from the Google API Console. Replace with your own Client ID.
    clientId : "158823134681-98bgkangoltk636ukf8pofeis7pa7jbk.apps.googleusercontent.com",

    // Replace with your own project number from console.developers.google.com.
    appId : "158823134681",

    // Array of API discovery doc URLs for APIs used by the quickstart
    discoveryDocs : ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],

    // Scope to use to access user's Drive items.
    scope: "https://www.googleapis.com/auth/drive.file"
}
},{}]},{},[23])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0Fic3RyYWN0TW9kZWwuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0RyYWdIYW5kbGVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9GaWxlT3BlcmF0aW9ucy5qcyIsIi4uLy4uL25pZGdldC9zcmMvSW50ZXJmYWNlcy5qcyIsIi4uLy4uL25pZGdldC9zcmMvTW91c2VVdGlsaXRpZXMuanMiLCIuLi8uLi9uaWRnZXQvc3JjL05pZGdldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0RWxlbWVudC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0U3R5bGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL1RyYW5zZm9ybWVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b24uanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblNldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU3RhdGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldENvbnRhaW5lci5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SFRNTEltYWdlLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRJbWFnZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0VGV4dC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJhZy5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJvcC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvTW91c2UuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL01vdmFibGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL1Jlc2l6ZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvcHJvamVjdEZpbGUuanMiLCJzcmMvY2xpZW50L2VkaXRvci5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9BdXRoZW50aWNhdGUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvQ2hlY2tCb3guanMiLCJzcmMvY2xpZW50L21vZHVsZXMvRWRpdG9yUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9GaWxlT3BzLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0dhbWVCb2FyZC5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9NZW51LmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL01vZGVsLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL011bHRpcGxlQ2hvaWNlUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9RdWVzdGlvblBhbmUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvZ29vZ2xlRmllbGRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuY2xhc3MgQWJzdHJhY3RNb2RlbCB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGFic3RyYWN0IG1vZGVsLiAgSWYgZGVsZWdhdGUgaXMgcHJvdmlkZWQgdGhlbiBhbGwgbGlzdGVuZXJcbiAgICAgKiBhZGRzIGFuZCBub3RpZmllcyBhcmUgcGVyZm9ybWVkIG9uIHRoZSBkZWxlZ2F0ZSBsaXN0ZW5lciBjb2xsZWN0aW9uLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZGVsZWdhdGVcbiAgICAgKiBAcmV0dXJucyB7bm0kX0Fic3RyYWN0TW9kZWwuQWJzdHJhY3RNb2RlbH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHRoaXM7XG4gICAgICAgIHRoaXMuYWJzdHJhY3RNb2RlbExpc3RlbmVycyA9IFtdOyAgICAgICAgXG4gICAgfVxuXG4gICAgZ2V0RGVsZWdhdGUoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVsZWdhdGU7XG4gICAgfVxuICAgIFxuICAgIHNldERlbGVnYXRlKGRlbGVnYXRlID0gbnVsbCl7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmFic3RyYWN0TW9kZWxMaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUgPSBkZWxlZ2F0ZS5kZWxlZ2F0ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuZGVsZWdhdGUgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmRlZmluZWQgZGVsZWdhdGVcIik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYWRkTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gXCJvYmplY3RcIil7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIEFic3RyYWN0TW9kZWwgbGlzdGVuZXIgdHlwZTogXCIgKyB0eXBlb2YgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGVsZWdhdGUuYWJzdHJhY3RNb2RlbExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsIGFzIG5vdGlmeUxpc3RlbmVycyhtZXRob2ROYW1lLCBbbWV0aG9kQXJndW1lbnQwLCAuLi4gbWV0aG9kQXJndW1lbnROXSlcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1ldGhvZFxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5TGlzdGVuZXJzKG1ldGhvZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVWRU5UIFwiICsgdGhpcy5kZWxlZ2F0ZS5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgKyBtZXRob2QpO1xuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5zaGlmdC5hcHBseShhcmd1bWVudHMpO1xuICAgICAgICBsZXQgZXZlbnQgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3VtZW50cyxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcyxcbiAgICAgICAgICAgIGxpc3RlbmVyczogW11cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5sYXN0RXZlbnQgPSBldmVudDtcbiAgICAgICAgd2luZG93Lm5FdmVudHMucHVzaCh3aW5kb3cubGFzdEV2ZW50KTtcblxuICAgICAgICBmb3IgKGxldCBsaXN0ZW5lciBvZiB0aGlzLmRlbGVnYXRlLmFic3RyYWN0TW9kZWxMaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lclttZXRob2RdKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIiArIFwiICsgbGlzdGVuZXIuY29uc3RydWN0b3IubmFtZSArIFwiIFwiICsgbWV0aG9kKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cubGFzdEV2ZW50Lmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUpOyAgICAgICBcbiAgICAgICAgICAgICAgICBhd2FpdCBsaXN0ZW5lclttZXRob2RdLmFwcGx5KGxpc3RlbmVyLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpc3RlbmVyW0Fic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyXSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCIgKyBcIiArIGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUgKyBcIiBcIiArIEFic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cubGFzdEV2ZW50Lmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUpOyAgICAgICBcbiAgICAgICAgICAgICAgICBhd2FpdCBsaXN0ZW5lcltBYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lcl0uYXBwbHkobGlzdGVuZXIsIHdpbmRvdy5sYXN0RXZlbnQpOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuQWJzdHJhY3RNb2RlbC5kZWZhdWx0TGlzdGVuZXIgPSBcIm5pZGdldExpc3RlbmVyXCI7XG53aW5kb3cubkV2ZW50cyA9IFtdO1xubW9kdWxlLmV4cG9ydHMgPSBBYnN0cmFjdE1vZGVsOyIsIid1c2Ugc3RyaWN0Jztcbi8qKlxuICogU2luZ2xldG9uIGNsYXNzIHRvIHByb3ZpZGluZyBmdW5jdGlvbmFsaXR5IHRvIERyYWdOaWRnZXRzIGFuZCBEcm9wTmlkZ2V0cy5cbiAqIEl0IHN0b3JlcyB0aGUgTmlkZ2V0IGN1cnJlbnRseSBiZWluZyBkcmFnZ2VkLlxuICovXG5jbGFzcyBEcmFnSGFuZGxlcntcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLm92ZXIgPSBbXTtcbiAgICB9XG4gICAgXG4gICAgcHVzaE92ZXIobmlkZ2V0KXtcbiAgICAgICAgaWYgKHRoaXMub3ZlckhhcyhuaWRnZXQpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMub3Zlci5wdXNoKG5pZGdldCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBcbiAgICByZW1vdmVPdmVyKG5pZGdldCl7XG4gICAgICAgIGlmICghdGhpcy5vdmVySGFzKG5pZGdldCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhpcy5vdmVyLnNwbGljZSh0aGlzLm92ZXIuaW5kZXhPZihuaWRnZXQpLCAxKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSAgICBcbiAgICBcbiAgICBvdmVySGFzKG5pZGdldCl7XG4gICAgICAgIHJldHVybiB0aGlzLm92ZXIuaW5kZXhPZihuaWRnZXQpICE9PSAtMTtcbiAgICB9XG4gICAgXG4gICAgc2V0KG5pZGdldCl7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5pZGdldDtcbiAgICB9XG4gICAgXG4gICAgZ2V0KCl7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQ7XG4gICAgfVxuICAgIFxuICAgIGhhcygpe1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50ICE9PSBudWxsO1xuICAgIH1cbiAgICBcbiAgICBjbGVhcigpe1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xuICAgIH1cbiAgICBcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoKXtcbiAgICAgICAgcmV0dXJuIERyYWdIYW5kbGVyLmluc3RhbmNlO1xuICAgIH0gICAgXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IERyYWdIYW5kbGVyKCk7XG5cbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKiBnbG9iYWwgVXRpbGl0eSAqL1xuY2xhc3MgRmlsZU9wZXJhdGlvbnMge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIGEgZmlsZSAodXJsKS4gIE1hcCB2YXJpYWJsZXMgKCR7Li4ufSkgdG8gXG4gICAgICogYSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHVybFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgbG9hZE5pZGdldCh1cmwsIG1hcCl7ICAgICAgICBcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudCh1cmwsIG1hcCk7XG4gICAgICAgIHJldHVybiBuZXcgTmlkZ2V0RWxlbWVudChlbGVtZW50KTtcbiAgICB9ICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIGEgZmlsZSAodXJsKS4gIE1hcCB2YXJpYWJsZXMgKCR7Li4ufSkgdG8gXG4gICAgICogYSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHVybFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgbG9hZERPTUVsZW1lbnQodXJsLCBtYXAgPSBuZXcgTWFwKCkpeyAgICAgICAgXG4gICAgICAgIGlmIChtYXAgaW5zdGFuY2VvZiBNYXAgPT09IGZhbHNlKSBtYXAgPSBGaWxlT3BlcmF0aW9ucy5vYmplY3RUb01hcChtYXApOyAgICAgICBcbiAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRVUkwodXJsKTtcbiAgICAgICAgcmV0dXJuIEZpbGVPcGVyYXRpb25zLnN0cmluZ1RvRE9NRWxlbWVudCh0ZXh0LCBtYXApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIHRleHQuXG4gICAgICogQHBhcmFtIHt0eXBlfSB0ZXh0XG4gICAgICogQHBhcmFtIHt0eXBlfSBtYXBcbiAgICAgKiBAcmV0dXJucyB7bm9kZXxGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudC5kb21FbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBzdHJpbmdUb0RPTUVsZW1lbnQodGV4dCwgbWFwID0gbmV3IE1hcCgpKXtcbiAgICAgICAgLyogcmVwbGFjZSB2YXJpYWJsZXMgd2l0aCB2YWx1ZXMgKi9cbiAgICAgICAgZm9yIChsZXQga2V5IG9mIG1hcC5rZXlzKCkpeyAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHZhbHVlID0gbWFwLmdldChrZXkpO1xuICAgICAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdPyR7a2V5fVt9XWAsIGBnYCk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCB2YWx1ZSk7ICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgLyogcmVwbGFjZSB1bmZpbGxlZCB2YXJpYWJsZXMgd2l0aCBlbXB0eSAqL1xuICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGBbJF1be11bXn1dKlt9XWAsIGBnYCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsIFwiXCIpOyBcblxuICAgICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IHRleHQ7XG4gICAgICAgIGxldCBkb21FbGVtZW50ID0gbnVsbDtcbiAgICAgICAgY29uc29sZS5sb2coZWxlbWVudCk7XG5cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgc3RhdGljIG9iamVjdFRvTWFwKG9iamVjdCl7XG4gICAgICAgIGxldCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGZvciAobGV0IGZpZWxkIGluIG9iamVjdCl7ICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9iamVjdFtmaWVsZF0gPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIG9iamVjdFtmaWVsZF0gPT09IFwibnVtYmVyXCIpe1xuICAgICAgICAgICAgICAgIG1hcC5zZXQoZmllbGQsIG9iamVjdFtmaWVsZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuXG4gICAgXG5cbiAgICAvKlxuICAgICAqIFRyYW5zZmVyIGNvbnRlbnRzIG9mICdmaWxlbmFtZScgZnJvbSBzZXJ2ZXIgdG8gY2xpZW50LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHN1Y2Nlc3NDYWxsYmFja1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGVycm9yQ2FsbGJhY2tcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBjb250ZW50cyBvZiBmaWxlXG4gICAgICovXG4gICAgc3RhdGljIGdldFVSTCh1cmwpIHtcbiAgICAgICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoeGh0dHAucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGh0dHAuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAgOiB4aHR0cCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMgOiB4aHR0cC5zdGF0dXMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgOiB4aHR0cC5yZXNwb25zZVRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsIDogdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICAgICAgICAgIHhodHRwLnNlbmQobnVsbCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSB0ZXh0LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gdGV4dFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgZ2V0RmlsZSh1cmwsIG1hcCA9IG5ldyBNYXAoKSl7XG4gICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0VVJMKHVybCk7XG5cbiAgICAgICAgLyogcmVwbGFjZSB2YXJpYWJsZXMgd2l0aCB2YWx1ZXMgKi9cbiAgICAgICAgZm9yIChsZXQga2V5IG9mIG1hcC5rZXlzKCkpe1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gbWFwLmdldChrZXkpO1xuICAgICAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdPyR7a2V5fVt9XWAsIGBnYCk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiByZXBsYWNlIHVuZmlsbGVkIHZhcmlhYmxlcyB3aXRoIGVtcHR5ICovXG4gICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XVtefV0qW31dYCwgYGdgKTtcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgXCJcIik7XG5cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBUcmFuc2ZlciBjb250ZW50cyBvZiAnZmlsZW5hbWUnIGZyb20gc2VydmVyIHRvIGNsaWVudCB1c2luZyBjdXJyZW50IHdpbmRvdyBsb2NhdGlvbi5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdWNjZXNzQ2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcnJvckNhbGxiYWNrXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0TG9jYWwoZmlsZW5hbWUpIHtcbiAgICAgICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICAgICAgdmFyIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmICsgXCIvXCIgKyBmaWxlbmFtZTtcblxuICAgICAgICAgICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh4aHR0cC5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHR0cC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh4aHR0cC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHhodHRwLnN0YXR1cywgeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICAgICAgICAgIHhodHRwLnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShjYWxsYmFjayk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIENhdXNlICd0ZXh0JyB0byBiZSBzYXZlZCBhcyAnZmlsZW5hbWUnIGNsaWVudCBzaWRlLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZmlsZW5hbWUgVGhlIGRlZmF1bHQgZmlsZW5hbWUgdG8gc2F2ZSB0aGUgdGV4dCBhcy5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHRleHQgVGhlIHRleHQgdG8gc2F2ZSB0byBmaWxlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHN0YXRpYyBzYXZlVG9GaWxlKHRleHQsIGZpbGVuYW1lKSB7XG4gICAgICAgIGxldCBhbmNob3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGxldCBkYXRhID0gXCJ0ZXh0O2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUklDb21wb25lbnQodGV4dCk7XG4gICAgICAgIGFuY2hvci5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIFwiZGF0YTpcIiArIGRhdGEpO1xuICAgICAgICBhbmNob3Iuc2V0QXR0cmlidXRlKFwiZG93bmxvYWRcIiwgZmlsZW5hbWUpO1xuICAgICAgICBhbmNob3IuY2xpY2soKTtcbiAgICB9XG59XG5cbkZpbGVPcGVyYXRpb25zLk5vZGVUeXBlID0ge1xuICAgIEVMRU1FTlQgOiAxLFxuICAgIEFUVFJJQlVURSA6IDIsXG4gICAgVEVYVCA6IDMsIFxuICAgIENEQVRBU0VDVElPTiA6IDQsXG4gICAgRU5USVRZUkVGRVJOQ0UgOiA1LFxuICAgIEVOVElUWSA6IDYsXG4gICAgUFJPQ0VTU0lOR0lOU1RSVUNUSU9OIDogNyxcbiAgICBDT01NRU5UIDogOCxcbiAgICBET0NVTUVOVCA6IDksXG4gICAgRE9DVU1FTlRUWVBFIDogMTAsXG4gICAgRE9DVU1FTlRGUkFHTUVOVCA6IDExLFxuICAgIE5PVEFUSU9OIDogMTJcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wZXJhdGlvbnM7IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbW91c2UgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9Nb3VzZVwiKSwgXG4gICAgZHJhZyA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL0RyYWdcIiksXG4gICAgZHJvcCA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL0Ryb3BcIiksXG4gICAgbW92YWJsZSA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL01vdmFibGVcIiksXG4gICAgcmVzaXplIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvUmVzaXplXCIpXG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFNpbmdsdG9uIGNsYXNzIHRvIGFkZCBmdW5jdGlvbmFsaXR5IHRvIHRoZSBtb3VzZS5cbiAqL1xuY2xhc3MgTW91c2VVdGlsaXRpZXMge1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5sYXN0WCA9IDA7XG4gICAgICAgIHRoaXMubGFzdFkgPSAwO1xuICAgIH1cbiAgICBcbiAgICBpc1VuZGVyKGV2ZW50LCBlbGVtZW50KSB7XG4gICAgICAgIGxldCB4ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG5cbiAgICAgICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50ID09PSBlbGVtZW50KSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGdldFVuZGVyKGV2ZW50KSB7XG4gICAgICAgIGxldCB4ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgICB9XG5cbiAgICBzZXQgZWxlbWVudChlbGVtZW50KXtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWRFbGVtZW50ICE9PSBudWxsKXtcbiAgICAgICAgICAgIHRoaXMuZGV0YWNoRWxlbWVudCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZWxlbWVudCB8fCBlbGVtZW50ID09PSBudWxsIHx8IGVsZW1lbnQgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aGlzLmRldGFjaEVsZW1lbnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoRWxlbWVudChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgZWxlbWVudCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRhY2hlZEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGFuIGVsZW1lbnQuICBJZiB0aGUgZWxlbWVudCBkb2Vzbid0IGhhdmUgYSBwYXJlbnQgaXQgd2lsbCBiZVxuICAgICAqIGF0dGFjaGVkIHRvIHRoZSBkb2N1bWVudCBhbmQgd2lsbCBiZSBkZXRhY2hlZCB3aGVuIGRldGFjaEVsZW1lbnQgaXMgY2FsbGVkLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgYXR0YWNoRWxlbWVudChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgXG4gICAgICAgIGlmIChlbGVtZW50LnBhcmVudCl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGF0dGFjaCBlbGVtZW50IHRvIG1vdXNlIGlmIHRoZSBlbGVtZW50IGhhcyBhIHBhcmVudCBlbGVtZW50LlwiKTtcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZChlbGVtZW50KTtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjsgXG4gICAgICAgIGVsZW1lbnQuc3R5bGUudG9wID0gZXZlbnQuY2xpZW50WSArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gZXZlbnQuY2xpZW50WCArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJub25lXCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIxMDAwMFwiO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5tb3ZlQ2FsbEJhY2sgPSAoZXZlbnQpPT50aGlzLm9uTW91c2VNb3ZlKGV2ZW50KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3ZlQ2FsbEJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBsaXN0ZW5lcnMgZnJvbSB0aGUgYXR0YWNoZWQgZWxlbWVudCwgZG8gbm90IHJlbW92ZSBpdCBmcm9tIHRoZVxuICAgICAqIGRvY3VtZW50LlxuICAgICAqIEByZXR1cm5zIHt0eXBlfVxuICAgICAqL1xuICAgIGRldGFjaEVsZW1lbnQoKXtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWRFbGVtZW50ID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdmVDYWxsQmFjayk7ICAgICAgICBcbiAgICAgICAgbGV0IHJ2YWx1ZSA9IHRoaXMuYXR0YWNoZWRFbGVtZW50O1xuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudCA9IG51bGw7ICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChydmFsdWUpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJ2YWx1ZTtcbiAgICB9XG5cbiAgICBvbk1vdXNlTW92ZShldmVudCkgeyAgICAgICAgXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMubGFzdFggPSBldmVudC5jbGllbnRYO1xuICAgICAgICB0aGlzLmxhc3RZID0gZXZlbnQuY2xpZW50WTtcblxuICAgICAgICAvLyBzZXQgdGhlIGVsZW1lbnQncyBuZXcgcG9zaXRpb246XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50LnN0eWxlLnRvcCA9IGV2ZW50LmNsaWVudFkgKyBcInB4XCI7XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50LnN0eWxlLmxlZnQgPSBldmVudC5jbGllbnRYICsgXCJweFwiO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW91c2VVdGlsaXRpZXMoKTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHByZWZpeDogXCJkYXRhLW5pZGdldFwiLFxuICAgIGVsZW1lbnRBdHRyaWJ1dGU6IFwiZGF0YS1uaWRnZXQtZWxlbWVudFwiLFxuICAgIHNyY0F0dHJpYnV0ZTogXCJzcmNcIixcbiAgICB0ZW1wbGF0ZVNyY0F0dHJpYnV0ZTogXCJ0ZW1wbGF0ZS1zcmNcIixcbiAgICBuYW1lQXR0cmlidXRlOiBcIm5hbWVcIixcbiAgICBpbnRlcmZhY2VBdHRyaWJ1dGU6IFwiaW50ZXJmYWNlc1wiLFxuICAgIHRlbXBsYXRlQXR0cmlidXRlOiBcInRlbXBsYXRlXCIsXG4gICAgaW50ZXJmYWNlRGF0YUZpZWxkOiBcImludGVyZmFjZURhdGFcIixcbiAgICBtb2RlbERhdGFGaWVsZDogXCJtb2RlbERhdGFcIixcbiAgICBzdHlsZUF0dHJpYnV0ZTogXCJuaWRnZXQtc3R5bGVcIlxufTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IEZpbGVPcGVyYXRpb25zID0gcmVxdWlyZShcIi4vRmlsZU9wZXJhdGlvbnNcIik7XG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi9OaWRnZXRcIik7XG5jb25zdCBJbnRlcmZhY2VzID0gcmVxdWlyZShcIi4vSW50ZXJmYWNlc1wiKTtcbmNvbnN0IFRyYW5zZm9ybWVyID0gcmVxdWlyZShcIi4vVHJhbnNmb3JtZXJcIik7XG5jb25zdCBOaWRnZXRTdHlsZSA9IHJlcXVpcmUoXCIuL05pZGdldFN0eWxlXCIpO1xuXG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgdzpoIGFzcGVjdCByYXRpbyBhbmQgYWRqdXN0IHRoZSBwcm9wb3J0aW9ucyBhY2NvcmRpbmdseS5cbiAqXG4gKi9cbmNsYXNzIEFzcGVjdFJhdGlve1xuICAgIGNvbnN0cnVjdG9yKG5pZGdldCkge1xuICAgICAgICB0aGlzLm5pZGdldCA9IG5pZGdldDtcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKT0+dGhpcy5vblJlc2l6ZSgpKTtcbiAgICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKHRoaXMubmlkZ2V0KTtcbiAgICAgICAgdGhpcy5wYXJzZVZhbHVlcygpO1xuICAgICAgICB0aGlzLm9uUmVzaXplKCk7XG4gICAgICAgIHRoaXMubG9hZGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0VmFsdWUoKXtcbiAgICAgICAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoQXNwZWN0UmF0aW8uQ1NTX0FUVFJJQlVURSk7XG4gICAgfVxuXG4gICAgcGFyc2VWYWx1ZXMoKXtcbiAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuICAgICAgICBsZXQgc3BsaXQgPSB2YWx1ZS5zcGxpdCgvWyAsO10vZyk7XG5cbiAgICAgICAgZm9yIChsZXQgcyBvZiBzcGxpdCl7XG4gICAgICAgICAgICBpZiAocy5zcGxpdCgvWy06XS8pLmxlbmd0aCA9PT0gMil7XG4gICAgICAgICAgICAgICAgbGV0IHJhdGlvID0gcy5zcGxpdCgvWy06XS8pO1xuICAgICAgICAgICAgICAgIHRoaXMud2lkdGggPSBwYXJzZUludChyYXRpb1swXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBwYXJzZUludChyYXRpb1sxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzID09PSBcImhcIil7XG4gICAgICAgICAgICAgICAgdGhpcy5vblJlc2l6ZSA9ICgpPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5uaWRnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS53aWR0aCA9IChoZWlnaHQgKiB0aGlzLndpZHRoIC8gdGhpcy5oZWlnaHQpICsgXCJweFwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25SZXNpemUoKXtcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5uaWRnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmhlaWdodCA9ICh3aWR0aCAqIHRoaXMuaGVpZ2h0IC8gdGhpcy53aWR0aCkgKyBcInB4XCI7XG4gICAgfVxufVxuXG5Bc3BlY3RSYXRpby5DU1NfQVRUUklCVVRFID0gXCItLW5pZGdldC1hc3BlY3QtcmF0aW9cIjtcblxuLyoqXG4gKiBBIE5pZGdldEVsZW1lbnQgaXMgYSAxOjEgY2xhc3Mtb2JqZWN0OmRvbS1vYmplY3QgcGFpcmluZy4gIEFjdGlvbnMgb24gdGhlIERPTSBcbiAqIG9iamVjdCBzaG91bGQgb25seSBiZSBjYWxsZWQgYnkgdGhlIE5pZGdldEVsZW1lbnQgb2JqZWN0LiAgVGhlIGludGVyZmFjZURhdGFcbiAqIGZpZWxkIGlzIHJlc2VydmVkIGZvciBkYXRhIGZyb20gaW50ZXJmYWNlcy4gIEludGVyZmFjZXMgc2hvdWxkIHB1dCB0aGVpciBcbiAqIGN1c3RvbSBkYXRhIHVuZGVyIFtpbnRlcmZhY2VEYXRhRmllbGRdLltpbnRlcmZhY2VOYW1lXS4gIFRoZSBpbnRlcmZhY2UgZGF0YVxuICogYXR0cmlidXRlIGlzIHNldCB3aXRoIHRoZSBzdGF0aWMgdmFsdWUgTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZC5cbiAqIFxuICogQ2FsbGluZyBtZXRob2RzIG9uIHRoZSBuaWRnZXQgd2lsbCB0cmVhdCBzaGFkb3cgY29udGVudHMgYXMgcmVndWxhciBjb250ZW50cy5cbiAqL1xuY2xhc3MgTmlkZ2V0RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgTmlkZ2V0IGFzc29jaWF0ZWQgd2l0aCAnZWxlbWVudCcuICBBbiBlcnJvciB3aWxsIGJlIHRocm93blxuICAgICAqIGlmIHRoZSAnZWxlbWVudCcgaXMgYWxyZWFkeSBhc3NvY2lhdGVkIHdpdGggYSBOaWRnZXQuXG4gICAgICogXG4gICAgICogRGlzYWJsZWQgY2xhc3MgaW5kaWNhdGVzIHRoaXMgbmlkZ2V0IHdpbGwgaWdub3JlIG1vdXNlIGV2ZW50cy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGVsZW1lbnQgSlF1ZXJ5IHNlbGVjdG9yXG4gICAgICogQHJldHVybiB7bm0kX05pZGdldC5OaWRnZXRFbGVtZW50fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHRlbXBsYXRlSWQpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpc1tOaWRnZXQuaW50ZXJmYWNlRGF0YUZpZWxkXSA9IHt9O1xuICAgICAgICB0aGlzW05pZGdldC5tb2RlbERhdGFGaWVsZF0gPSB7fTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1lciA9IG5ldyBUcmFuc2Zvcm1lcih0aGlzKTtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMgPSB7fTtcblxuICAgICAgICBpZiAodGVtcGxhdGVJZCl7XG4gICAgICAgICAgICB0aGlzLmFwcGx5VGVtcGxhdGUodGVtcGxhdGVJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgICAgY29ubmVjdGVkQ2FsbGJhY2sgaXMgaW52b2tlZCBlYWNoIHRpbWUgdGhlIGN1c3RvbSBlbGVtZW50IGlzIGFwcGVuZGVkIGludG8gYSBkb2N1bWVudC1jb25uZWN0ZWQgZWxlbWVudFxuICAgICAqL1xuICAgIGFzeW5jIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICB0aGlzLnNoYWRvd0NvbnRlbnRzID0gdGhpcztcblxuICAgICAgICAvLyBzZXQgdGhlIGh0bWwgb2YgdGhpcyBlbGVtZW50IHRvIHRoZSBjb250ZW50cyBvZiB0aGUgZmlsZSAobm90IGEgc2hhZG93IGVsZW1lbnQpXG4gICAgICAgIC8vIGFsbCBkYXRhLSBhdHRyaWJ1dGVzIHdpbGwgYmUgdXNlZCB0byBmaWxsIGluICR7fSB2YXJpYWJsZXMgaW4gdGhlIHNvdXJjZSBmaWxlXG4gICAgICAgIC8vIGRvZXNuJ3Qgd29yayBvbiBlZGdlXG4gICAgICAgIGlmICh0aGlzLmhhc0F0dHJpYnV0ZShOaWRnZXQuc3JjQXR0cmlidXRlKSkgYXdhaXQgdGhpcy5yZXRyaWV2ZVNvdXJjZSh0aGlzLmRhdGFBdHRyaWJ1dGVzKCkpO1xuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoTmlkZ2V0LnRlbXBsYXRlU3JjQXR0cmlidXRlKSkgYXdhaXQgdGhpcy5yZXRyaWV2ZVRlbXBsYXRlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgYSBtYXAgb2YgYWxsIGRhdGEgYXR0cmlidXRlc1xuICAgICAqIEByZXR1cm5zIHtNYXA8YW55LCBhbnk+fVxuICAgICAqL1xuICAgIGRhdGFBdHRyaWJ1dGVzKCkge1xuICAgICAgICBsZXQgbWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBmb3IgKGxldCBhdHRyIG9mIHRoaXMuYXR0cmlidXRlcykge1xuICAgICAgICAgICAgaWYgKGF0dHIubmFtZS5zdGFydHNXaXRoKFwiZGF0YS1cIikpIHtcbiAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IGF0dHIubmFtZS5zdWJzdHIoNSk7XG4gICAgICAgICAgICAgICAgbWFwW25hbWVdID0gYXR0ci52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cblxuICAgIG5vdGlmeVN0eWxlcygpe1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGFyID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5nZXRQcm9wZXJ0eVZhbHVlKEFzcGVjdFJhdGlvLkNTU19BVFRSSUJVVEUpO1xuICAgICAgICAgICAgICAgIGlmIChhciAhPT0gXCJcIikgbmV3IEFzcGVjdFJhdGlvKHRoaXMpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGNvbnRlbnRzIG9mIGZpbGUgYXMgYSB0ZW1wbGV0ZSBhbmQgYXBwbHkgdGhhdCB0ZW1wbGF0ZSB0byB0aGlzIGVsZW1lbnQuXG4gICAgICogUmVwbGFjZSBhbGwgJHt9IHZhcmlhYmxlcyB3aXRoIGNvbnRlbnRzIG9mICdtYXAnLlxuICAgICAqIFRoZSB0ZW1wbGF0ZSB3aWxsIGJlIGdpdmVuIHRoZSBpZCBkZXJpdmVkIGZyb20gdGhlIHNyYyBhdHRyaWJ1dGUuXG4gICAgICovXG4gICAgYXN5bmMgcmV0cmlldmVUZW1wbGF0ZSgpe1xuICAgICAgICBsZXQgc3JjID0gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0LnRlbXBsYXRlU3JjQXR0cmlidXRlKTtcbiAgICAgICAgbGV0IGlkID0gc3JjLnJlcGxhY2UoL1tcXC8vIC4tXSsvZywgXCJfXCIpO1xuICAgICAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtpZH1gKTtcbiAgICAgICAgaWYgKHRlbXBsYXRlKSBhd2FpdCB0aGlzLmluamVjdFRlbXBsYXRlKHRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggYSBzaGFkb3cgZWxlbWVudCB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgdGVtcGxhdGUgbmFtZWQgKHRlbXBsYXRlSUQpLlxuICAgICAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBhcHBseVRlbXBsYXRlKHRlbXBsYXRlSWQpIHtcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGVtcGxhdGVJZCk7XG5cbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgdGhyb3cgbmV3IEVycm9yKFwiVGVtcGxhdGUgJ1wiICsgdGVtcGxhdGVJZCArIFwiJyBub3QgZm91bmQuXCIpO1xuICAgICAgICBpZiAodGVtcGxhdGUudGFnTmFtZS50b1VwcGVyQ2FzZSgpICE9PSBcIlRFTVBMQVRFXCIpIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgd2l0aCBpZCAnXCIgKyB0ZW1wbGF0ZUlkICsgXCInIGlzIG5vdCBhIHRlbXBsYXRlLlwiKTtcblxuICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogJ29wZW4nfSkuYXBwZW5kQ2hpbGQodGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgIH1cblxuICAgIGFzeW5jIGluamVjdFRlbXBsYXRlKHRlbXBsYXRlKXtcbiAgICAgICAgaWYgKHRoaXMuc2hhZG93Um9vdCAhPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogJ29wZW4nfSkuYXBwZW5kQ2hpbGQodGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgICBhd2FpdCB0aGlzLm5vdGlmeVN0eWxlcygpO1xuICAgIH1cblxuICAgIGFzeW5jIHJlYWR5KCl7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGNvbnRlbnRzIG9mIGZpbGUgaW50byB0aGlzIGVsZW1lbnQuXG4gICAgICogUmVwbGFjZSBhbGwgJHt9IHZhcmlhYmxlcyB3aXRoIGNvbnRlbnRzIG9mICdtYXAnLlxuICAgICAqL1xuICAgIGFzeW5jIHJldHJpZXZlU291cmNlKG1hcCl7XG4gICAgICAgIGxldCBzcmMgPSB0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXQuc3JjQXR0cmlidXRlKTtcbiAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRGaWxlKHNyYywgbWFwKTtcbiAgICAgICAgdGhpcy5pbm5lckhUTUwgPSB0ZXh0O1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBsb2FkVGVtcGxhdGVTbmlwcGV0KGZpbGVuYW1lLCB0YWduYW1lKXtcbiAgICAgICAgbGV0IGlkID0gZmlsZW5hbWUucmVwbGFjZSgvW1xcLy8gLi1dKy9nLCBcIl9cIik7XG5cbiAgICAgICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtpZH1gKSl7XG4gICAgICAgICAgICBsZXQgdGV4dCA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLmdldEZpbGUoZmlsZW5hbWUpO1xuICAgICAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRlbXBsYXRlXCIpO1xuICAgICAgICAgICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gdGV4dDtcbiAgICAgICAgICAgIHRlbXBsYXRlLnNldEF0dHJpYnV0ZShcImlkXCIsIGlkKTtcbiAgICAgICAgICAgIGlmICh0YWduYW1lKSB0ZW1wbGF0ZS5zZXRBdHRyaWJ1dGUoXCJkYXRhLW5pZGdldFwiLCB0YWduYW1lKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2lkfWApO1xuXG4gICAgICAgIGZvciAobGV0IGVsZSBvZiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRhZ25hbWUpKXtcbiAgICAgICAgICAgIGF3YWl0IGVsZS5pbmplY3RUZW1wbGF0ZSh0ZW1wbGF0ZSk7XG4gICAgICAgICAgICBhd2FpdCBlbGUucmVhZHkoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSAnaGlkZGVuJyBjbGFzcy5cbiAgICAgKi9cbiAgICBzaG93KCkge1xuICAgICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkICdoaWRkZW4nIGNsYXNzLlxuICAgICAqL1xuICAgIGhpZGUoKSB7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGRpc2FibGVkIGZsYWcgdGhhdCBpcyByZWFkIGJ5IG5pZGdldCBtb3VzZSBmdW5jdGlvbnMuXG4gICAgICogQHBhcmFtIHZhbHVlXG4gICAgICovXG4gICAgc2V0IGRpc2FibGVkKHZhbHVlKXtcbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShOaWRnZXRFbGVtZW50LkRJU0FCTEVEX0FUVFJJQlVURSwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShOaWRnZXRFbGVtZW50LkRJU0FCTEVEX0FUVFJJQlVURSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBkaXNhYmxlZCBmbGFnIHRoYXQgaXMgcmVhZCBieSBuaWRnZXQgbW91c2UgZnVuY3Rpb25zLlxuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqL1xuICAgIGdldCBkaXNhYmxlZCgpe1xuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0cmlidXRlKE5pZGdldEVsZW1lbnQuRElTQUJMRURfQVRUUklCVVRFKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoaXMgZWxlbWVudCB3YXMgdW5kZXIgdGhlIG1vdXNlIGZvciB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHt0eXBlfSBldmVudFxuICAgICAqIEBwYXJhbSB7dHlwZX0gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNVbmRlck1vdXNlKGV2ZW50KSB7XG4gICAgICAgIGxldCB4ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG5cbiAgICAgICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50ID09PSB0aGlzKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1biB0aGUgcXVlcnkgc2VsZWN0b3Igb24gdGhpcyBlbGVtZW50LlxuICAgICAqIElmIHRoaXMgZWxlbWVudCBoYXMgYSBzaGFkb3csIHJ1biBpdCBvbiB0aGF0IGluc3RlYWQuXG4gICAgICogQHBhcmFtIHNlbGVjdG9yc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudFRhZ05hbWVNYXBbS119XG4gICAgICovXG4gICBxdWVyeVNlbGVjdG9yKHNlbGVjdG9ycykge1xuICAgICAgICBpZiAodGhpcy5zaGFkb3dSb290KXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1biB0aGUgcXVlcnkgc2VsZWN0b3Igb24gdGhpcyBlbGVtZW50LlxuICAgICAqIElmIHRoaXMgZWxlbWVudCBoYXMgYSBzaGFkb3csIHJ1biBpdCBvbiB0aGF0IGluc3RlYWQuXG4gICAgICogQHBhcmFtIHNlbGVjdG9yc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudFRhZ05hbWVNYXBbS119XG4gICAgICovXG4gICAgcXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpIHtcbiAgICAgICAgaWYgKHRoaXMuc2hhZG93Um9vdCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgdGhpcyBlbGVtZW50IGZyb20gaXQncyBwYXJlbnQuXG4gICAgICovXG4gICAgZGV0YWNoKCl7XG4gICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbmRleCB3aXRoaW4gdGhlIHBhcmVudCBlbGVtZW50LlxuICAgICAqL1xuICAgIGluZGV4KCl7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMucGFyZW50RWxlbWVudC5jaGlsZHJlbikuaW5kZXhPZih0aGlzKTtcbiAgICB9XG59XG5cbi8vIE5pZGdldEVsZW1lbnQubXV0YXRpb25PYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKChyZWNvcmQsIG9ic2VydmVyKT0+e1xuLy8gICAgIHJlY29yZC5mb3JFYWNoKChtdXRhdGlvbikgPT4ge1xuLy8gICAgICAgICBpZiAoIW11dGF0aW9uLmFkZGVkTm9kZXMpIHJldHVyblxuLy8gICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG11dGF0aW9uLmFkZGVkTm9kZXMubGVuZ3RoOyBpKyspIHtcbi8vICAgICAgICAgICAgIGxldCBub2RlID0gbXV0YXRpb24uYWRkZWROb2Rlc1tpXTtcbi8vICAgICAgICAgICAgIGlmIChub2RlLnRhZ05hbWUgPT09IFwiVEVNUExBVEVcIikge1xuLy8gICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5vZGUudGFnTmFtZSk7XG4vLyAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobm9kZS5nZXRBdHRyaWJ1dGUoXCJkYXRhLW5pZGdldFwiKSk7XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cbi8vICAgICB9KTtcbi8vIH0pO1xuLy9cbi8vIE5pZGdldEVsZW1lbnQubXV0YXRpb25PYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LCB7XG4vLyAgICAgY2hpbGRMaXN0OiB0cnVlLFxuLy8gICAgIHN1YnRyZWU6IHRydWUsXG4vLyAgICAgYXR0cmlidXRlczogZmFsc2UsXG4vLyAgICAgY2hhcmFjdGVyRGF0YTogZmFsc2Vcbi8vIH0pO1xuXG5OaWRnZXRFbGVtZW50LkRJU0FCTEVEX0FUVFJJQlVURSA9IFwibmlkZ2V0LWRpc2FibGVkXCI7XG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtZWxlbWVudCcsIE5pZGdldEVsZW1lbnQpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRFbGVtZW50OyIsIid1c2Ugc3RyaWN0Jztcbi8qKlxuICogTWFuaXB1bGF0ZXMgdGhlIGVsZW1lbnRzIHN0eWxlIHdpdGgganMgcm91dGluZXMgYWNjb3JkaW5nIHRvIGNzcyBmbGFncy5cbiAqIE5pZGdldCBzdHlsZSBpcyBhcHBsaWVkIHRvIGFsbCBuaWRnZXQtZWxlbWVudHMgdW5sZXNzIHRoZXkgaGF2ZSB0aGUgbmlkZ2V0LXN0eWxlXG4gKiBhdHRyaWJ1dGUgc2V0IHRvICdmYWxzZScuXG4gKi9cblxuY2xhc3MgTmlkZ2V0U3R5bGUge1xuXG4gICAgY29uc3RydWN0b3IobmlkZ2V0KSB7XG4gICAgICAgIHRoaXMubmlkZ2V0ID0gbmlkZ2V0O1xuICAgICAgICB0aGlzLmFwcGx5KCk7XG4gICAgfVxuICAgIFxuICAgIGFwcGx5KCkge1xuICAgICAgICB0aGlzLm5pZGdldFdpZHRoUmF0aW8oKTtcbiAgICAgICAgdGhpcy5uaWRnZXRIZWlnaHRSYXRpbygpO1xuICAgICAgICB0aGlzLm5pZGdldEZpdFRleHQoKTtcbiAgICAgICAgdGhpcy5uaWRnZXRGaXRUZXh0V2lkdGgoKTtcbiAgICAgICAgdGhpcy5uaWRnZXRWZXJ0QWxpZ25UZXh0KCk7XG4gICAgfVxuICAgIFxuICAgIG5pZGdldFdpZHRoUmF0aW8oKSB7XG4gICAgICAgIGxldCByYXRpbyA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC13aWR0aC1yYXRpb1wiKTtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuOyAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7ICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLm5pZGdldC53aWR0aCA9IHRoaXMubmlkZ2V0LmhlaWdodCAqIHJhdGlvO1xuICAgICAgICB9KS5vYnNlcnZlKHRoaXMubmlkZ2V0KTsgICAgICBcbiAgICB9XG4gICAgXG4gICAgbmlkZ2V0SGVpZ2h0UmF0aW8oKSB7XG4gICAgICAgIGxldCByYXRpbyA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1oZWlnaHQtcmF0aW9cIik7XG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjsgICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4geyAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5uaWRnZXQuaGVpZ2h0ID0gdGhpcy5uaWRnZXQud2lkdGggKiByYXRpbztcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7ICAgICAgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlsbCB0aGUgdGV4dCBoZWlnaHQgdG8gbWF0Y2ggdGhlIGVsZW1lbnQgaGVpZ2h0LlxuICAgICAqIENoYW5nZSB0aGUgcmF0aW8gdmFsdWUgKG9yIHRoZSBmb250U2l6ZSkgYWRqdXN0LlxuICAgICAqL1xuICAgIG5pZGdldEZpdFRleHQoKSB7XG4gICAgICAgIGxldCByYXRpbyA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1maXQtdGV4dFwiKTsgICAgICAgIFxuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XG5cbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGAtLW5pZGdldC1maXQtdGV4dCAke3JhdGlvfWApXG4gICAgICAgICAgICBsZXQgaCA9IHRoaXMubmlkZ2V0Lm9mZnNldEhlaWdodCAqIHJhdGlvO1xuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBoICsgXCJweFwiO1xuICAgICAgICB9KS5vYnNlcnZlKHRoaXMubmlkZ2V0KTsgICAgICBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAgV2lsbCBjaGFuZ2UgdGhlIGZvbnQgc2l6ZSBzbyB0aGF0IHRoZSB0ZXh0IGZpdCdzIGluIHRoZSBwYXJlbnQgZWxlbWVudC5cbiAgICAgKiAgRG9uJ3Qgc2V0IHRoZSB3aWR0aCBvZiB0aGUgZWxlbWVudC5cbiAgICAgKi9cbiAgICBuaWRnZXRGaXRUZXh0V2lkdGgoKSB7XG4gICAgICAgIGxldCByZW1vdmUgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtZml0LXRleHQtd2lkdGhcIik7XG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyZW1vdmUpKSByZXR1cm47XG5cbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnRcblxuICAgICAgICAgICAgbGV0IHRleHRXID0gdGhpcy5uaWRnZXQuc2Nyb2xsV2lkdGg7XG4gICAgICAgICAgICBsZXQgY29udFcgPSB0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgY29udFcgPSBjb250VyAtIHJlbW92ZTtcbiAgICAgICAgICAgIGxldCBkdyA9IGNvbnRXL3RleHRXO1xuICAgICAgICAgICAgbGV0IGNvbXB1dGVkRm9udFNpemUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZSgnZm9udC1zaXplJylcbiAgICAgICAgICAgIGNvbXB1dGVkRm9udFNpemUgPSBwYXJzZUludChjb21wdXRlZEZvbnRTaXplKTtcbiAgICAgICAgICAgIGNvbXB1dGVkRm9udFNpemUgPSBNYXRoLnJvdW5kKGNvbXB1dGVkRm9udFNpemUpO1xuICAgICAgICAgICAgbGV0IG5ld0ZvbnRTaXplID0gTWF0aC5yb3VuZChjb21wdXRlZEZvbnRTaXplICogZHcpO1xuICAgICAgICAgICAgbGV0IGggPSB0aGlzLm5pZGdldC5vZmZzZXRIZWlnaHRcblxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKGNvbXB1dGVkRm9udFNpemUgLSBuZXdGb250U2l6ZSkgPD0gMikgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAobmV3Rm9udFNpemUgPiBoKSBuZXdGb250U2l6ZSA9IGg7XG5cbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gbmV3Rm9udFNpemUgKyBcInB4XCI7XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgbGluZSBoZWlnaHQgdG8gdGhlIG9mZnNldCBoZWlnaHQgbXVsdGlwbGllZCBieSByYXRpby5cbiAgICAgKi9cbiAgICBuaWRnZXRWZXJ0QWxpZ25UZXh0KCl7XG4gICAgICAgIGxldCByYXRpbyA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC12ZXJ0LWFsaWduLXRleHRcIik7XG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjtcblxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgbGV0IGggPSB0aGlzLm5pZGdldC5vZmZzZXRIZWlnaHQgKiByYXRpbztcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmxpbmVIZWlnaHQgPSBoICsgXCJweFwiO1xuICAgICAgICB9KS5vYnNlcnZlKHRoaXMubmlkZ2V0KTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0U3R5bGU7IiwiJ3VzZSBzdHJpY3QnO1xuY2xhc3MgVHJhbnNmb3Jte1xuICAgIGNvbnN0cnVjdG9yKHZhbHVlKXtcbiAgICAgICAgbGV0IGluZGV4T2YgPSB2YWx1ZS5pbmRleE9mKFwiKFwiKTtcbiAgICAgICAgdGhpcy5uYW1lID0gdmFsdWUuc3Vic3RyaW5nKDAsIGluZGV4T2YpO1xuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWUuc3Vic3RyaW5nKHRoaXMubmFtZS5sZW5ndGggKyAxLCB2YWx1ZS5sZW5ndGggLSAxKTtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5uYW1lICsgXCIsIFwiICsgdGhpcy52YWx1ZSk7XG4gICAgfVxuICAgIFxuICAgIHRvU3RyaW5nKCl7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWUgKyBcIihcIiArIHRoaXMudmFsdWUgKyBcIilcIjtcbiAgICB9ICAgIFxufVxuXG5jbGFzcyBUcmFuc2Zvcm1lciB7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgfVxuICAgIFxuICAgIGFwcGVuZCgpe1xuICAgICAgICBsZXQgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudClbXCJ0cmFuc2Zvcm1cIl07XG4gICAgICAgIGlmIChjb21wdXRlZFN0eWxlICE9PSBcIm5vbmVcIikgdGhpcy5wdXNoKGNvbXB1dGVkU3R5bGUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgY2xlYXIoKXtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IFwiXCI7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICB1bnNoaWZ0KHZhbHVlKXtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IHZhbHVlICsgXCIgXCIgKyB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtO1xuICAgIH1cbiAgICBcbiAgICBwdXNoKHZhbHVlKXtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gKyBcIiBcIiArIHZhbHVlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9ICAgIFxuICAgIFxuICAgIHNoaWZ0KCl7XG4gICAgICAgIGxldCBhcnJheSA9IHRoaXMuc3BsaXQoKTtcbiAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIFwiXCI7XG4gICAgICAgIGFycmF5LnNoaWZ0KCk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBhcnJheS5qb2luKFwiIFwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHBvcCgpe1xuICAgICAgICBsZXQgYXJyYXkgPSB0aGlzLnNwbGl0KCk7XG4gICAgICAgIGlmIChhcnJheS5sZW5ndGggPT09IDApIHJldHVybiBcIlwiO1xuICAgICAgICBhcnJheS5wb3AoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IGFycmF5LmpvaW4oXCIgXCIpO1xuICAgICAgICByZXR1cm4gdGhpczsgICAgICBcbiAgICB9XG4gICAgXG4gICAgcmVwbGFjZSh2YWx1ZSl7XG4gICAgICAgIGxldCBuZXdUcmFuc2Zvcm0gPSBuZXcgVHJhbnNmb3JtKHZhbHVlKTtcbiAgICAgICAgbGV0IGFycmF5ID0gdGhpcy5zcGxpdCgpO1xuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBsZXQgZW50cnkgPSBhcnJheVtpXTtcbiAgICAgICAgICAgIGxldCB0cmFuc2Zvcm0gPSBuZXcgVHJhbnNmb3JtKGVudHJ5KTtcbiAgICAgICAgICAgIGlmICh0cmFuc2Zvcm0ubmFtZSA9PT0gbmV3VHJhbnNmb3JtLm5hbWUpe1xuICAgICAgICAgICAgICAgIGFycmF5W2ldID0gbmV3VHJhbnNmb3JtLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IGFycmF5LmpvaW4oXCIgXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBzcGxpdCgpe1xuICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtO1xuICAgICAgICBsZXQgc3RhcnQgPSAwO1xuICAgICAgICBsZXQgcnZhbHVlID0gW107XG4gICAgICAgIGxldCBsYXN0ID0gJyc7XG4gICAgICAgIGxldCBza2lwID0gZmFsc2U7XG4gICAgICAgIGxldCBuZXN0ZWRQID0gMDtcbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgaWYgKCFza2lwICYmIHZhbHVlW2ldID09PSAnICcgJiYgbGFzdCA9PT0gJyAnKXtcbiAgICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIXNraXAgJiYgdmFsdWVbaV0gPT09ICcgJykge1xuICAgICAgICAgICAgICAgIHJ2YWx1ZS5wdXNoKHZhbHVlLnN1YnN0cmluZyhzdGFydCwgaSkpO1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gaTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVbaV0gPT09ICcoJykge1xuICAgICAgICAgICAgICAgIG5lc3RlZFArKztcbiAgICAgICAgICAgICAgICBza2lwID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVbaV0gPT09ICcpJykge1xuICAgICAgICAgICAgICAgIG5lc3RlZFAtLTtcbiAgICAgICAgICAgICAgICBpZiAobmVzdGVkUCA9PT0gMCkgc2tpcCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdCA9IHZhbHVlW2ldO1xuICAgICAgICB9XG4gICAgICAgIHJ2YWx1ZS5wdXNoKHZhbHVlLnN1YnN0cmluZyhzdGFydCwgdmFsdWUubGVuZ3RoKSk7XG4gICAgICAgIHJldHVybiBydmFsdWU7XG4gICAgfVxuICAgIFxuICAgIHRvU3RyaW5nKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2Zvcm1lcjsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyoqXG4gKiBBIE5pZGdldCB0aGF0IGNoYW5nZXMgdGhlIGltYWdlIGZvciBob3ZlciwgZGlzYWJsZWQsIHByZXNzLCBhbmQgaWRsZS5cbiAqIEZpcmVzIGEgY2xpY2sgZXZlbnQgd2hlbiBjbGlja2VkLlxuICpcbiAqIFdpbGwgc2V0IHRoZSBjdXJyZW50IHN0YXRlIGFzIGRhdGEtc3RhdGUgc28gdGhhdCBjc3MgY2FuIGFjY2VzcyBpdC5cbiAqL1xuY2xhc3MgTmlkZ2V0QnV0dG9uIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICAgICAgdGhpcy5hbHBoYVRvbGVyYW5jZSA9IDA7IC8vIGFscGhhIG5lZWRzIHRvIGJlID4gdG9sZXJhbmNlIHRvIHRyaWdnZXIgZXZlbnRzLlxuXG4gICAgICAgIHRoaXMuc3RyaW5nSG92ZXIgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J0hPVkVSJ11cIjtcbiAgICAgICAgdGhpcy5zdHJpbmdEaXNhYmxlZCA9IFwibmlkZ2V0LWJ1dHRvbi1zdGF0ZVtzdGF0ZT0nRElTQUJMRUQnXVwiO1xuICAgICAgICB0aGlzLnN0cmluZ1ByZXNzID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdQUkVTUyddXCI7XG4gICAgICAgIHRoaXMuc3RyaW5nSWRsZSA9IFwibmlkZ2V0LWJ1dHRvbi1zdGF0ZVtzdGF0ZT0nSURMRSddXCI7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaWRsZVwiO1xuICAgIH1cblxuICAgIGlzSW5TZXQoKSB7XG4gICAgICAgIGxldCBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gICAgICAgIHdoaWxlIChwYXJlbnQgIT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKHBhcmVudC50YWdOYW1lID09PSBcIk5JREdFVC1CVVRUT04tU0VUXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcmVudCA9IHBhcmVudC5wYXJlbnROb2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBuaWRnZXRSZWFkeSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdEaXNhYmxlZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdJZGxlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuaXNJblNldCgpKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCB0aGlzLm1vdXNlRW50ZXIpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VMZWF2ZSk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlUHJlc3MpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VSZWxlYXNlKTtcblxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVkKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIGlzVW5kZXIoZXZlbnQpIHtcbiAgICAgICAgbGV0IGVsZW1lbnRzID0gZG9jdW1lbnQuZWxlbWVudHNGcm9tUG9pbnQoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSk7XG4gICAgICAgIGlmIChlbGVtZW50cy5pbmRleE9mKHRoaXMuYWN0aXZlTmlkZ2V0KSA9PSAtMSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5hY3RpdmVOaWRnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGxldCB4ID0gZXZlbnQuY2xpZW50WCAtIHJlY3QueDtcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZIC0gcmVjdC55O1xuXG4gICAgICAgIHJldHVybiB0aGlzLnRlc3RBbHBoYSh4LCB5KTtcbiAgICB9XG5cbiAgICBnZXQgZGlzYWJsZWQoKSB7XG4gICAgICAgIHJldHVybiBzdXBlci5kaXNhYmxlZDtcbiAgICB9XG5cbiAgICBzZXQgZGlzYWJsZWQodmFsdWUpIHtcbiAgICAgICAgc3VwZXIuZGlzYWJsZWQgPSB2YWx1ZTtcblxuICAgICAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdEaXNhYmxlZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJpblwiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJwcmVzc1wiOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nUHJlc3M7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdJZGxlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG1vdXNlUmVsZWFzZShlKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBcImhvdmVyXCI7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcbiAgICB9XG5cbiAgICBtb3VzZVByZXNzKGUpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwicHJlc3NcIjtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ1ByZXNzO1xuICAgIH1cblxuICAgIGhpZGVBbGxJbWFnZXMoKSB7XG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3Rvcih0aGlzLnN0cmluZ0hvdmVyKS5oaWRlKCk7XG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3Rvcih0aGlzLnN0cmluZ0Rpc2FibGVkKS5oaWRlKCk7XG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3Rvcih0aGlzLnN0cmluZ1ByZXNzKS5oaWRlKCk7XG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3Rvcih0aGlzLnN0cmluZ0lkbGUpLmhpZGUoKTtcbiAgICB9XG5cbiAgICBzZXQgYWN0aXZlTmlkZ2V0KHNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMuaGlkZUFsbEltYWdlcygpO1xuICAgICAgICB0aGlzLl9hY3RpdmVOaWRnZXQgPSB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICAgICB0aGlzLl9hY3RpdmVOaWRnZXQuc2hvdygpO1xuICAgIH1cblxuICAgIGdldCBhY3RpdmVOaWRnZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hY3RpdmVOaWRnZXQ7XG4gICAgfVxuXG4gICAgc2V0IHN0YXRlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IHN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIpO1xuICAgIH1cblxuICAgIHRlc3RBbHBoYSh4LCB5KSB7XG4gICAgICAgIGxldCBwaXhlbCA9IHRoaXMuYWN0aXZlTmlkZ2V0LmdldFBpeGVsKHgsIHkpO1xuICAgICAgICByZXR1cm4gcGl4ZWxbM10gPiB0aGlzLmFscGhhVG9sZXJhbmNlO1xuICAgIH1cblxuICAgIG1vdXNlTGVhdmUoKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSWRsZTtcbiAgICB9XG5cbiAgICBtb3VzZUFjdGl2ZSgpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0hvdmVyO1xuICAgIH1cblxuICAgIG1vdXNlTW92ZShlKSB7XG4gICAgICAgIGlmICghdGhpcy50ZXN0QWxwaGEoZS5jbGllbnRYLCBlLmNsaWVudFkpKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJvdXRcIjtcbiAgICAgICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSWRsZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcImhvdmVyXCI7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0hvdmVyO1xuICAgICAgICB9XG4gICAgfVxufVxuO1xuXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtYnV0dG9uJywgTmlkZ2V0QnV0dG9uKTtcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0QnV0dG9uO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xyXG5cclxuY2xhc3MgTmlkZ2V0QnV0dG9uU2V0IGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XHJcbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcclxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xyXG4gICAgICAgIHRoaXMuYWxwaGFUb2xlcmFuY2UgPSAwOyAvLyBhbHBoYSBuZWVkcyB0byBiZSA+IHRvbGVyYW5jZSB0byB0cmlnZ2VyIGV2ZW50cy5cclxuXHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2VQcmVzcyk7XHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlUmVsZWFzZSk7XHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2VNb3ZlKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsIHRoaXMubW91c2VMZWF2ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5kaXNhYmxlZCkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG5pZGdldFJlYWR5KCl7XHJcbiAgICAgICAgdGhpcy5idXR0b25zID0gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKFwibmlkZ2V0LWJ1dHRvblwiKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZVByZXNzKGUpe1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5idXR0b25zKSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzVW5kZXIoZSkpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQubW91c2VQcmVzcygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwicHJlc3NcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZVJlbGVhc2UoZSl7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNVbmRlcihlKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuc3RhdGUgPT0gXCJwcmVzc1wiKXtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEN1c3RvbUV2ZW50KFwiYnV0dG9uLWNsaWNrZWRcIiwge2RldGFpbDogZWxlbWVudH0pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsZW1lbnQubW91c2VSZWxlYXNlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlTW92ZShlKXtcclxuICAgICAgICB0aGlzLnN0YXRlID0gXCJvdXRcIjtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucyl7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzVW5kZXIoZSkpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQubW91c2VBY3RpdmUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcImhvdmVyXCI7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlTGVhdmUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZUxlYXZlKGUpe1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5idXR0b25zKSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQubW91c2VMZWF2ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJvdXRcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHN0YXRlKHZhbHVlKXtcclxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcImRhdGEtc3RhdGVcIiwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzdGF0ZSgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtc3RhdGVcIik7XHJcbiAgICB9XHJcbn1cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1idXR0b24tc2V0JywgTmlkZ2V0QnV0dG9uU2V0KTtcclxubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRCdXR0b25TZXQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyoqXG4gKiBBIE5pZGdldCB0aGF0IGNoYW5nZXMgdGhlIGltYWdlIGZvciBob3ZlciwgZGlzYWJsZWQsIHByZXNzLCBhbmQgaWRsZS5cbiAqIEZpcmVzIGEgY2xpY2sgZXZlbnQgd2hlbiBjbGlja2VkLlxuICogXG4gKiBUaGlzIGlzIHRoZSBodG1sIGVsZW1lbnQgXCJuaWRnZXQtYnV0dG9uXCIuXG4gKiBJZiB0aGUgbmlkZ2V0LWJ1dHRvbiBoYXMgdGhlIGF0dHJpYnV0ZSBgaW1nLXByZWZpeCA9IFwicHJlZml4XCJgIHRoZW4gdGhlIFxuICogZm9sbG93aW5nIGltYWdlcy4gIGBpbWctc3VmZml4YCA9IFwic3VmZml4XCIgd2lsbCBvdmVycmlkZSB0aGUgXCIucG5nXCIuXG4gKiB3aWxsIGJlIHVzZWQ6XG4gKiAtIHByZWZpeC1ob3Zlci5wbmdcbiAqIC0gcHJlZml4LWRpc2FibGVkLnBuZ1xuICogLSBwcmVmaXgtcHJlc3MucG5nXG4gKiAtIHByZWZpeC1pZGxlLnBuZ1xuICovXG5jbGFzcyBOaWRnZXRCdXR0b25TdGF0ZSBleHRlbmRzIE5pZGdldCB7XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBuaWRnZXRSZWFkeSgpe1xuICAgICAgICB0aGlzLmltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgIHRoaXMuaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCB0aGlzLmdldEF0dHJpYnV0ZShcImltYWdlLXNyY1wiKSk7XG4gICAgICAgIHRoaXMuYXBwZW5kKHRoaXMuaW1nKTtcbiAgICB9XG5cbiAgICBzaG93KCl7XG4gICAgICAgIHN1cGVyLnNob3coKTtcbiAgICAgICAgdGhpcy5sb2FkQ2FudmFzKCk7XG4gICAgfVxuXG4gICAgbG9hZENhbnZhcygpe1xuICAgICAgICBpZiAoIXRoaXMuaW1nIHx8IHRoaXMuY2FudmFzKSByZXR1cm47XG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5pbWcubmF0dXJhbFdpZHRoO1xuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmltZy5uYXR1cmFsSGVpZ2h0O1xuICAgICAgICB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCk7XG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcztcbiAgICB9XG5cbiAgICBnZXRQaXhlbCh4LCB5KXtcbiAgICAgICAgdGhpcy5sb2FkQ2FudmFzKCk7XG4gICAgICAgIGxldCBkeCA9IHRoaXMuY2FudmFzLndpZHRoIC8gdGhpcy5vZmZzZXRXaWR0aDtcbiAgICAgICAgbGV0IGR5ID0gdGhpcy5jYW52YXMuaGVpZ2h0IC8gdGhpcy5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIGxldCBwaXhlbCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJykuZ2V0SW1hZ2VEYXRhKGR4ICogeCwgZHkgKiB5LCAxLCAxKS5kYXRhO1xuICAgICAgICByZXR1cm4gcGl4ZWw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHN0YXRlIHRvIEhPVkVSLCBESVNBQkxFRCwgUFJFU1MsIElETEUuXG4gICAgICogQHBhcmFtIHt0eXBlfSBzdGF0ZVxuICAgICAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzZXQgc3RhdGUoc3RhdGUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJzdGF0ZVwiLCBzdGF0ZS50b1VwcGVyQ2FzZSgpKTtcbiAgICB9XG5cbiAgICBnZXQgc3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHJpYnV0ZShcInN0YXRlXCIpO1xuICAgIH1cblxuICAgIHNldCBzb3VyY2UoaW1nKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwic3JjXCIsIGltZyk7XG4gICAgfVxuXG4gICAgZ2V0IHNvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cmlidXRlKFwic3JjXCIpO1xuICAgIH1cbn1cbjtcblxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWJ1dHRvbi1zdGF0ZScsIE5pZGdldEJ1dHRvblN0YXRlKTtcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0QnV0dG9uU3RhdGU7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIEEgY29tcG9uZW50IHRoYXQgaGFzIGV2ZW50cyBmb3IgYWRkaW5nIG5pZGdldHMsIHJlbW92aW5nIG5pZGdldHMsIGFuZCBcbiAqIHJlc2l6aW5nIHRoZSBjb250YWluZXIuICBXaGVuIHRoZSBjb250YWluZXIgc2l6ZSBpcyBjaGFuZ2VkLCB0aGUgbnVtYmVyXG4gKiBvZiBjb21wb25lbnRzIGNoYW5nZSwgb3IgdGhlIGxheW91dCBhdHRyaWJ1dGUgY2hhbmdlcywgdGhlIGRvTGF5b3V0IGZ1bmN0aW9uXG4gKiBpcyBjYWxsZWQuXG4gKiBcbiAqIFRoZSBjb21wb25lbnRzIGFyZSBhcnJhZ2VkIGFjY29yZGluZyB0byB0aGUgc2VsZWN0ZWQgbGF5b3V0IGF0dHJpYnV0ZS4gIElmIFxuICogbm8gbGF5b3V0IGF0dHJpYnV0ZSBpcyBjaG9zZW4sIGRvTGF5b3V0IGlzIHN0aWxsIGNhbGxlZCBhcyBpdCBpcyBhc3N1bWVkIFxuICogYSBjdXN0b20gZnVuY3Rpb24gaGFzIGJlZW4gcHJvdmlkZWQuXG4gKi9cblxuY2xhc3MgTmlkZ2V0Q29udGFpbmVyIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgICAgIGxldCByZXNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcih0aGlzLmRvTGF5b3V0KTtcbiAgICAgICAgcmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcbiAgICAgICAgcmV0dXJuIFtOaWRnZXRDb250YWluZXIubGF5b3V0QXR0cmlidXRlXTtcbiAgICB9XG5cbiAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2sobmFtZSwgb2xkVmFsdWUsIG5ld1ZhbHVlKSB7XG4gICAgICAgIGlmIChvbGRWYWx1ZSA9PT0gbmV3VmFsdWUpIHJldHVybjtcbiAgICAgICAgdGhpcy5kb0xheW91dCgpO1xuICAgIH1cblxuICAgIHNldCBsYXlvdXQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoTmlkZ2V0Q29udGFpbmVyLmxheW91dEF0dHJpYnV0ZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIGdldCBsYXlvdXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXRDb250YWluZXIubGF5b3V0QXR0cmlidXRlKTtcbiAgICB9ICAgICAgXG5cbiAgICBkb0xheW91dCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxheW91dCkgcmV0dXJuO1xuICAgICAgICBpZiAoIUxheW91dHNbdGhpcy5sYXlvdXRdKSB0aHJvdyBgaW52YWxpZCBsYXlvdXQ6ICR7dGhpcy5sYXlvdXR9YDtcbiAgICAgICAgTGF5b3V0c1t0aGlzLmxheW91dF07XG4gICAgfVxufVxuXG5jbGFzcyBMYXlvdXRzIHtcbiAgICAvKipcbiAgICAgKiBGaXQgYWxsIG5pZGdldHMgZXZlbmx5IGluIGEgaG9yaXpvbnRhbCByb3cuXG4gICAgICogQHBhcmFtIHt0eXBlfSBuaWRnZXRcbiAgICAgKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgc3RhdGljIHJvdyhuaWRnZXQpIHtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5zaXplKTtcbiAgICB9XG59XG5cblxuTmlkZ2V0Q29udGFpbmVyLmxheW91dEF0dHJpYnV0ZSA9IFwibGF5b3V0XCI7XG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtY29udGFpbmVyJywgTmlkZ2V0Q29udGFpbmVyKTtcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0Q29udGFpbmVyOyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIi4uL05pZGdldFwiKTtcbmNvbnN0IFRyYW5zZm9ybWVyID0gcmVxdWlyZShcIi4uL1RyYW5zZm9ybWVyXCIpO1xuXG4vKipcbiAqIERvbid0IGZvcmdldCB0byBzZXQgJ2lzJyB3aGVuIHB1dHRpbmcgZWxlbWVudCBkaXJlY3RseSBpbiBodG1sIGFzIG9wcG9zZWQgdG9cbiAqIHByb2dyYW1pY2FsbHkuXG4gKiA8aW1nIGlzPVwicmVnaXN0ZXJlZC1uYW1lXCIgc3JjPVwiaW1hZ2UucG5nXCI+PC9pbWc+XG4gKiBcbiAqIGluY2x1ZGUgYSBjdXN0b20gZWxlbWVudCBkZWZpbml0aW9uIGF0IHRoZSBlbmQgb2YgdGhlIGNsYXNzLjxicj5cbiAqIHdpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ3JlZ2lzdGVyZWQtbmFtZScsIENsYXNzLCB7ZXh0ZW5kczogXCJpbWdcIn0pO1xuICovXG5jbGFzcyBOaWRnZXRIVE1MSW1hZ2UgZXh0ZW5kcyBIVE1MSW1hZ2VFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5sYXN0RGlzcGxheSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1lciA9IG5ldyBUcmFuc2Zvcm1lcih0aGlzKTtcbiAgICB9XG5cbiAgICBzY2FsZShkdywgZGgpIHtcbiAgICAgICAgaWYgKCFkaCkgZGggPSBkdztcbiAgICAgICAgbGV0IHcgPSB0aGlzLndpZHRoICogZHc7XG4gICAgICAgIGxldCBoID0gdGhpcy5oZWlnaHQgKiBkaDtcbiAgICAgICAgdGhpcy53aWR0aCA9IHc7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaDtcbiAgICB9ICAgICAgICBcblxuICAgIHNldCBzcmModmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdmFsdWUpO1xuICAgIH1cblxuICAgIGdldCBzcmMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShcInNyY1wiKTtcbiAgICB9XG5cbiAgICBsb2NhdGUobGVmdCwgdG9wKSB7XG4gICAgICAgIHRoaXMubGVmdCA9IGxlZnQ7XG4gICAgICAgIHRoaXMudG9wID0gdG9wO1xuICAgIH1cblxuICAgIGdldCBsZWZ0KCkge1xuICAgICAgICBsZXQgdyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMpLmxlZnQ7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHcpO1xuICAgIH1cblxuICAgIGdldCB0b3AoKSB7XG4gICAgICAgIGxldCBoID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykudG9wO1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChoKTtcbiAgICB9XG5cbiAgICBzZXQgbGVmdCh2YWx1ZSkge1xuICAgICAgICB0aGlzLnN0eWxlLmxlZnQgPSB2YWx1ZSArIFwicHhcIjtcbiAgICB9XG5cbiAgICBzZXQgdG9wKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc3R5bGUudG9wID0gdmFsdWUgKyBcInB4XCI7XG4gICAgfSAgICBcblxuICAgIHNldCB3aWR0aCh3KSB7XG4gICAgICAgIHRoaXMuc3R5bGUud2lkdGggPSB3ICsgXCJweFwiO1xuICAgIH1cblxuICAgIHNldCBoZWlnaHQodykge1xuICAgICAgICB0aGlzLnN0eWxlLmhlaWdodCA9IHcgKyBcInB4XCI7XG4gICAgfVxuXG4gICAgZ2V0IHdpZHRoKCkge1xuICAgICAgICBsZXQgdyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMpLndpZHRoO1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh3KTtcbiAgICB9XG5cbiAgICBnZXQgaGVpZ2h0KCkge1xuICAgICAgICBsZXQgaCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMpLmhlaWdodDtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaCk7XG4gICAgfSAgICAgICAgXG5cbiAgICBzaG93KCkge1xuICAgICAgICBpZiAodGhpcy5sYXN0RGlzcGxheSkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gdGhpcy5sYXN0RGlzcGxheTtcbiAgICAgICAgICAgIHRoaXMubGFzdERpc3BsYXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGlkZSgpIHtcbiAgICAgICAgdGhpcy5sYXN0RGlzcGxheSA9IHRoaXMuc3R5bGUuZGlzcGxheTtcbiAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxuXG4gICAgc2V0IGRpc3BsYXkodmFsdWUpe1xuICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSB2YWx1ZTtcbiAgICB9XG4gICAgXG4gICAgZ2V0IGRpc3BsYXkoKXtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5jYWxjdWxhdGVTdHlsZSh0aGlzKVtcImRpc3BsYXlcIl07XG4gICAgfVxuXG4gICAgZGV0YWNoKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IodGhpcyk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgc2V0IGRpc2FibGVkKHZhbHVlKXtcbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IGRpc2FibGVkKCl7XG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcbiAgICB9ICAgIFxuICAgIFxuICAgIGNsZWFyUG9zKCl7XG4gICAgICAgIHRoaXMuc3R5bGUudG9wID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdHlsZS5sZWZ0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBjbGVhckRpbXMoKXtcbiAgICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3R5bGUuaGVpZ2h0ID0gbnVsbDtcbiAgICB9ICAgIFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEhUTUxJbWFnZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIEEgTmlkZ2V0IHRoYXQgY29udGFpbnMgaW1hZ2VzLlxuICovXG5jbGFzcyBOaWRnZXRJbWFnZSBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xuXG4gICAgY29uc3RydWN0b3Ioc3JjKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5pbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICBpZiAoc3JjKSB0aGlzLnNyYyA9IHNyYztcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpe1xuICAgICAgICBsZXQgc3JjID0gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0SW1hZ2Uuc3JjQXR0cmlidXRlKTsgICAgICAgIFxuICAgICAgICBpZiAoc3JjKSB0aGlzLmltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgc3JjKTsgICAgICAgXG4gICAgICAgIHRoaXMuYXBwZW5kQ2hpbGQodGhpcy5pbWcpO1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgIH1cblxuICAgIGdldCBzcmMoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW1nLmdldEF0dHJpYnV0ZShcInNyY1wiKTtcbiAgICB9XG5cbiAgICBzZXQgc3JjKHZhbHVlKXtcbiAgICAgICAgdGhpcy5pbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBzaXplKHdpZHRoLCBoZWlnaHQpe1xuICAgICAgICB0aGlzLnN0eWxlLndpZHRoID0gd2lkdGhcbiAgICAgICAgdGhpcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHRcbiAgICAgICAgdGhpcy5pbWcuc3R5bGUud2lkdGggPSB3aWR0aFxuICAgICAgICB0aGlzLmltZy5zdHlsZS5oZWlnaHQgPSBoZWlnaHRcbiAgICB9XG4gICAgXG4gICAgc2NhbGUoZHcsIGRoKXtcbiAgICAgICAgaWYgKCFkaCkgZGggPSBkdztcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5vZmZzZXRXaWR0aCAqIGR3O1xuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5vZmZzZXRIZWlnaHQgKiBkaDtcbiAgICAgICAgdGhpcy5zaXplKGAke3dpZHRofXB4YCwgYCR7aGVpZ2h0fXB4YCk7XG4gICAgfVxuICAgIFxuICAgIHNob3coKXtcbiAgICAgICAgaWYgKHRoaXMuc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIpe1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuc3R5bGUuZGlzcGxheTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBoaWRlKCl7XG4gICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIH1cbn1cblxuTmlkZ2V0SW1hZ2Uuc3JjQXR0cmlidXRlID0gXCJzcmNcIjtcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1pbWFnZScsIE5pZGdldEltYWdlKTtcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0SW1hZ2U7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogV2hlbiB1c2luZyAtLW5pZGdldC1maXQtdGV4dCwgZG8gbm90IGluY2x1ZGUgaGVpZ2h0IGFuZCB3aWR0aCBhdHRyaWJ1dGVzLlxuICogQSBmb250IHNpemUgY2FuIGJlIHVzZWQgYXMgYSBzdGFydGluZyBwb2ludC5cbiAqL1xuY2xhc3MgRml0VGV4dCB7XG4gICAgY29uc3RydWN0b3IobmlkZ2V0KXtcbiAgICAgICAgdGhpcy5uaWRnZXQgPSBuaWRnZXQ7XG4gICAgICAgIHRoaXMubG9jayA9IFwibm9uZVwiO1xuICAgICAgICB0aGlzLnBhcnNlQXJndW1lbnRzKCk7XG4gICAgfVxuXG4gICAgbGlzdGVuKCl7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCk9PnRoaXMuZGVsYXlSZXNpemUodGhpcy5oVmFsdWUsIHRoaXMud1ZhbHVlKSk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50KTtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAwO1xuICAgICAgICB0aGlzLmRlbGF5ID0gMjU7XG4gICAgICAgIHRoaXMuZGVsYXlSZXNpemUodGhpcy5oVmFsdWUsIHRoaXMud1ZhbHVlKTtcbiAgICAgICAgdGhpcy5zdG9wID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZGVsYXlSZXNpemUoaFZhbHVlLCB3VmFsdWUpe1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XG4gICAgICAgIGlmICh0aGlzLnRpbWVvdXQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT50aGlzLm9uUmVzaXplKGhWYWx1ZSwgd1ZhbHVlKSwgdGhpcy5kZWxheSk7XG4gICAgfVxuXG4gICAgbm90aWZ5KGhWYWx1ZSwgd1ZhbHVlKXtcbiAgICAgICAgY29uc29sZS5sb2coXCJub3RpZnlcIik7XG4gICAgICAgIHRoaXMuc3RvcCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRlbGF5UmVzaXplKGhWYWx1ZSwgd1ZhbHVlKTtcbiAgICB9XG5cbiAgICBwYXJzZUFyZ3VtZW50cygpe1xuICAgICAgICBsZXQgYXJncyA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1maXQtdGV4dFwiKTtcblxuICAgICAgICBpZiAoIWFyZ3MgfHwgYXJncyA9PT0gZmFsc2UgfHwgYXJncyA9PT0gXCJmYWxzZVwiKXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaFZhbHVlID0gdGhpcy53VmFsdWUgPSB0cnVlO1xuXG4gICAgICAgIGlmICh0eXBlb2YoYXJncykgPT0gXCJzdHJpbmdcIil7XG4gICAgICAgICAgICBsZXQgb2JqID0gSlNPTi5wYXJzZShhcmdzKTtcbiAgICAgICAgICAgIGlmIChvYmpbXCJmaXRcIl0gIT09IHVuZGVmaW5lZCAmJiBvYmpbXCJmaXRcIl0gPT09IFwid2lkdGhcIikgdGhpcy5oVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChvYmpbXCJmaXRcIl0gIT09IHVuZGVmaW5lZCAmJiBvYmpbXCJmaXRcIl0gPT09IFwiaGVpZ2h0XCIpIHRoaXMud1ZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAob2JqW1wibG9ja1wiXSAhPT0gdW5kZWZpbmVkKSB0aGlzLmxvY2sgPSAob2JqW1wibG9ja1wiXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSl7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnRpbWVvdXQ7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RvcCkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5uaWRnZXQudGV4dENvbnRlbnQgPT09IFwiXCIpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0ID09PSAwKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldFdpZHRoID09PSAwKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLm5pZGdldC5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIikgcmV0dXJuO1xuXG4gICAgICAgIGlmICghaFZhbHVlICYmICF3VmFsdWUpIHJldHVybjtcblxuICAgICAgICBsZXQgaERpciA9IHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gdGhpcy5uaWRnZXQuc2Nyb2xsSGVpZ2h0O1xuICAgICAgICBsZXQgd0RpciA9IHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLSB0aGlzLm5pZGdldC5zY3JvbGxXaWR0aDtcblxuICAgICAgICBpZiAoIWhWYWx1ZSkgaERpciA9IDA7XG4gICAgICAgIGlmICghd1ZhbHVlKSB3RGlyID0gMDtcblxuICAgICAgICBsZXQgZGlyID0gTWF0aC5zaWduKGhEaXIgfCB3RGlyKTsgLy8gd2lsbCBwcmVmZXIgdG8gc2hyaW5rXG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gMCkgdGhpcy5kaXJlY3Rpb24gPSBkaXI7IC8vIGtlZXAgcHJldmlvdXMgZGlyZWN0aW9uXG5cbiAgICAgICAgbGV0IGZvbnRTaXplID0gcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldClbXCJmb250LXNpemVcIl0pXG4gICAgICAgIGxldCBuZXdTaXplID0gZm9udFNpemUgKyAodGhpcy5kaXJlY3Rpb24pO1xuXG4gICAgICAgIGlmIChuZXdTaXplICE9PSBmb250U2l6ZSAmJiB0aGlzLmRpcmVjdGlvbiA9PT0gZGlyKSB7XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IG5ld1NpemUgKyBcInB4XCI7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PnRoaXMub25SZXNpemUoaFZhbHVlLCB3VmFsdWUpLCB0aGlzLmRlbGF5KTtcbiAgICAgICAgfSBlbHNlIGlmIChkaXIgPCAwICYmIHRoaXMuZGlyZWN0aW9uID4gMCkgeyAvLyByZXZlcnNlIGRpcmVjdGlvbiBpZiBncm93aW5nIHRvbyBsYXJnZVxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAtMTtcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PnRoaXMub25SZXNpemUoaFZhbHVlLCB3VmFsdWUpLCB0aGlzLmRlbGF5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2sgPT09IFwidmhcIikge1xuICAgICAgICAgICAgICAgIGxldCBmb250UmF0aW8gPSBuZXdTaXplIC8gd2luZG93LmlubmVySGVpZ2h0ICogMTAwO1xuICAgICAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gZm9udFJhdGlvICsgXCJ2aFwiO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMubG9jayA9PT0gXCJ2d1wiKXtcbiAgICAgICAgICAgICAgICBsZXQgZm9udFJhdGlvID0gbmV3U2l6ZSAvIHdpbmRvdy5pbm5lcldpZHRoICogMTAwO1xuICAgICAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gZm9udFJhdGlvICsgXCJ2d1wiO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQSBuaWRnZXQgZWxlbWVudCBmb3IgZGlzcGxheWluZyB0ZXh0LlxuICogcHV0ICctLW5pZGdldC1maXQtdGV4dDogMS4wOycgaW50byBjc3MgZm9yIHRoaXMgZWxlbWVudCB0byBlbmFibGUgc2NhbGluZy5cbiAqIHNlZTogTmlkZ2V0U3R5bGUuanNcbiAqL1xuY2xhc3MgTmlkZ2V0VGV4dCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzW1wiZml0LXRleHQtd2lkdGgtdG9sZXJhbmNlXCJdID0gMC4wMjtcbiAgICAgICAgdGhpcy5maXRUZXh0ID0gbmV3IEZpdFRleHQodGhpcyk7XG4gICAgfVxuXG4gICAgcmVtb3ZlKCl7XG4gICAgICAgIGlmICh0aGlzLmZpdFRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dC5zdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dC5vYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIucmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgICAgIGxldCBmaXRQcm9wID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtZml0LXRleHRcIik7XG5cbiAgICAgICAgaWYgKGZpdFByb3AgIT09IHVuZGVmaW5lZCAmJiBmaXRQcm9wICE9PSBcIlwiKXtcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dC5saXN0ZW4oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldCB0ZXh0KHZhbHVlKXtcbiAgICAgICAgdGhpcy5pbm5lclRleHQgPSB2YWx1ZTtcbiAgICAgICAgaWYgKHRoaXMuZml0VGV4dCAmJiB0aGlzLmZpdFRleHQuc3RvcCA9PT0gZmFsc2Upe1xuICAgICAgICAgICAgdGhpcy5maXRUZXh0LmRlbGF5UmVzaXplKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgdGV4dCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5pbm5lclRleHQ7XG4gICAgfVxuXG4gICAgc2NhbGUoYW1vdW50KSB7XG4gICAgICAgIGxldCBzdHlsZUZvbnRTaXplID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcywgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShcImZvbnQtc2l6ZVwiKTtcbiAgICAgICAgbGV0IGZvbnRTaXplID0gcGFyc2VGbG9hdChzdHlsZUZvbnRTaXplKTtcbiAgICAgICAgdGhpcy5zdHlsZS5mb250U2l6ZSA9IChmb250U2l6ZSAqIGFtb3VudCkgKyBcInB4XCI7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBsaW5lIGhlaWdodCB0byB0aGUgb2Zmc2V0IGhlaWdodCBtdWx0aXBsaWVkIGJ5IHJhdGlvLlxuICAgICAqIENhbGxpbmcgdGhpcyBtZXRob2QgZGlyZWN0b3J5IHdpbGwgb3ZlcnJpZGUgdGhlIHZhbHVlIHNldCBieSBjc3NcbiAgICAgKi9cbiAgICBuaWRnZXRWZXJ0QWxpZ25UZXh0KHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tbmlkZ2V0LXZlcnQtYWxpZ24tdGV4dFwiLCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb25SZXNpemUgPSAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC12ZXJ0LWFsaWduLXRleHRcIik7XG4gICAgICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XG4gICAgICAgICAgICBsZXQgaCA9IHRoaXMub2Zmc2V0SGVpZ2h0ICogcmF0aW87XG4gICAgICAgICAgICB0aGlzLnN0eWxlLmxpbmVIZWlnaHQgPSBoICsgXCJweFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZXJzLnZlcnRBbGlnblRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMudmVydEFsaWduVGV4dCA9IG5ldyBSZXNpemVPYnNlcnZlcihvblJlc2l6ZSk7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy52ZXJ0QWxpZ25UZXh0Lm9ic2VydmUodGhpcylcbiAgICAgICAgfVxuICAgICAgICBvblJlc2l6ZSgpXG4gICAgfVxuXG4gICAgdmVydEFsaWduVGV4dChyYXRpbyA9IDEuMCl7XG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjtcbiAgICAgICAgbGV0IGggPSB0aGlzLm9mZnNldEhlaWdodCAqIHJhdGlvO1xuICAgICAgICB0aGlzLnN0eWxlLmxpbmVIZWlnaHQgPSBoICsgXCJweFwiO1xuICAgIH1cbn1cbjtcblxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LXRleHQnLCBOaWRnZXRUZXh0KTtcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0VGV4dDsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IGRyYWdIYW5kbGVyID0gcmVxdWlyZShcIi4uL0RyYWdIYW5kbGVyXCIpLmluc3RhbmNlO1xuXG5cbmZ1bmN0aW9uIG9uRHJhZ1N0YXJ0KGV2ZW50KXsgICAgXG4gICAgZHJhZ0hhbmRsZXIuc2V0KHRoaXMpO1xuICAgIHdpbmRvdy54ID0gdGhpcztcbiAgICBjb25zb2xlLmxvZyhcIidcIiArIHRoaXMubmFtZSgpICsgXCInXCIpO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ1N0YXJ0XCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbkRyYWdFbmQoZXZlbnQpe1xuICAgIGlmIChkcmFnSGFuZGxlci5nZXQoKSAhPT0gdGhpcykgcmV0dXJuO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ0VuZFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbiAgICBkcmFnSGFuZGxlci5jbGVhcigpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLnNldEF0dHJpYnV0ZShcImRyYWdnYWJsZVwiLCBcInRydWVcIik7ICAgXG4gICAgXG4gICAgbmlkZ2V0Lm9uRHJhZ1N0YXJ0ID0gb25EcmFnU3RhcnQuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbkRyYWdFbmQgPSBvbkRyYWdFbmQuYmluZChuaWRnZXQpO1xuICAgIFxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCBuaWRnZXQub25EcmFnU3RhcnQpO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbmRcIiwgbmlkZ2V0Lm9uRHJhZ0VuZCk7ICAgIFxufTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IGRyYWdIYW5kbGVyID0gcmVxdWlyZShcIi4uL0RyYWdIYW5kbGVyXCIpLmluc3RhbmNlO1xuY29uc3QgTW91c2VVdGlsaXRpZXMgPSByZXF1aXJlKFwiLi4vTW91c2VVdGlsaXRpZXNcIik7XG5cbmZ1bmN0aW9uIG9uRHJhZ092ZXIoZXZlbnQpe1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgbGV0IGRyYWdOaWRnZXQgPSBkcmFnSGFuZGxlci5nZXQoKTtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdPdmVyXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMsIGRyYWdOaWRnZXQpO1xufVxuXG5mdW5jdGlvbiBvbkRyYWdFbnRlcihldmVudCl7XG4gICAgaWYgKCFkcmFnSGFuZGxlci5oYXMoKSkgcmV0dXJuO1xuICAgIGlmICghZHJhZ0hhbmRsZXIucHVzaE92ZXIodGhpcykpIHJldHVybjtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdFbnRlclwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25EcmFnTGVhdmUoZXZlbnQpe1xuICAgIGlmICghZHJhZ0hhbmRsZXIuaGFzKCkpIHJldHVybjtcbiAgICBpZiAoTW91c2VVdGlsaXRpZXMuaXNVbmRlcih0aGlzLmdldEVsZW1lbnQoKSkpIHJldHVybjtcbiAgICBpZiAoIWRyYWdIYW5kbGVyLnJlbW92ZU92ZXIodGhpcykpIHJldHVybjtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdMZWF2ZVwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25Ecm9wKGV2ZW50KXtcbiAgICBsZXQgZHJhZ05pZGdldCA9IGRyYWdIYW5kbGVyLmdldCgpO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJvcFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzLCBkcmFnTmlkZ2V0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIG5pZGdldC5vbkRyYWdPdmVyID0gb25EcmFnT3Zlci5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uRHJvcCA9IG9uRHJvcC5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uRHJhZ0VudGVyID0gb25EcmFnRW50ZXIuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbkRyYWdMZWF2ZSA9IG9uRHJhZ0xlYXZlLmJpbmQobmlkZ2V0KTtcbiAgICBcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBuaWRnZXQub25EcmFnT3Zlcik7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCBuaWRnZXQub25Ecm9wKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW50ZXJcIiwgbmlkZ2V0Lm9uRHJhZ0VudGVyKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnbGVhdmVcIiwgbmlkZ2V0Lm9uRHJhZ0xlYXZlKTsgICAgXG59OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTW91c2VVdGlsaXRpZXMgPSByZXF1aXJlKFwiLi4vTW91c2VVdGlsaXRpZXNcIik7XG5cbmZ1bmN0aW9uIG9uQ2xpY2soZXZlbnQpeyAgICBcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImNsaWNrXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlRG93bihldmVudCl7ICAgIFxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VEb3duXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlVXAoZXZlbnQpeyAgICBcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcIm1vdXNlVXBcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VFbnRlcihldmVudCl7ICAgIFxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VFbnRlclwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZUxlYXZlKGV2ZW50KXtcbiAgICBpZiAoTW91c2VVdGlsaXRpZXMuaXNVbmRlcih0aGlzLmdldEVsZW1lbnQoKSkpIHJldHVybjtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcIm1vdXNlRXhpdFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIGNvbnNvbGUubG9nKFwibW91c2Ugc2V0dXBcIik7XG4gICAgXG4gICAgbmlkZ2V0Lm9uQ2xpY2sgPSBvbkNsaWNrLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Nb3VzZURvd24gPSBvbk1vdXNlRG93bi5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uTW91c2VVcCA9IG9uTW91c2VVcC5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uTW91c2VFbnRlciA9IG9uTW91c2VFbnRlci5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uTW91c2VMZWF2ZSA9IG9uTW91c2VMZWF2ZS5iaW5kKG5pZGdldCk7XG4gICAgXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgbmlkZ2V0Lm9uQ2xpY2spO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBuaWRnZXQub25Nb3VzZURvd24pO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgbmlkZ2V0Lm9uTW91c2VVcCk7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBuaWRnZXQub25Nb3VzZUVudGVyKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCBuaWRnZXQub25Nb3VzZUxlYXZlKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBFbmFibGUgdGhlIG5pZGdldCB0byBiZSBtb3ZlZCBieSBkcmFnZ2luZy4gIFdpbGwgZHJhZyBieSBhbnkgY2hpbGQgZWxlZW1lbnRcbiAqIHRoZSAnLm5pZGdldC1oZWFkZXInIGNsYXNzLCBvdGhlcndpc2UgbW92YWJsZSBieSBjbGlja2luZyBhbnl3aGVyZS5cbiAqIEBwYXJhbSB7dHlwZX0gZVxuICogQHJldHVybiB7dW5kZWZpbmVkfVxuICovXG5cbmZ1bmN0aW9uIG9uTW91c2VNb3ZlKGUpeyAgICBcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKCF0aGlzLl9fbW92YWJsZS5hY3RpdmUpIHJldHVybjsgICAgXG5cbiAgICAvLyBjYWxjdWxhdGUgdGhlIG5ldyBjdXJzb3IgcG9zaXRpb246XG4gICAgbGV0IGRlbHRhWCA9IHRoaXMuX19tb3ZhYmxlLmxhc3RYIC0gZS5jbGllbnRYO1xuICAgIGxldCBkZWx0YVkgPSB0aGlzLl9fbW92YWJsZS5sYXN0WSAtIGUuY2xpZW50WTtcbiAgICB0aGlzLl9fbW92YWJsZS5sYXN0WCA9IGUuY2xpZW50WDtcbiAgICB0aGlzLl9fbW92YWJsZS5sYXN0WSA9IGUuY2xpZW50WTtcbiAgICBcbiAgICAvLyBzZXQgdGhlIGVsZW1lbnQncyBuZXcgcG9zaXRpb246XG4gICAgdGhpcy5zdHlsZS50b3AgPSAodGhpcy5vZmZzZXRUb3AgLSBkZWx0YVkpICsgXCJweFwiO1xuICAgIHRoaXMuc3R5bGUubGVmdCA9ICh0aGlzLm9mZnNldExlZnQgLSBkZWx0YVgpICsgXCJweFwiO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlRG93bihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5fX21vdmFibGUuYWN0aXZlID0gdHJ1ZTtcbiAgICBcbiAgICAvLyBnZXQgdGhlIG1vdXNlIGN1cnNvciBwb3NpdGlvbiBhdCBzdGFydHVwOlxuICAgIHRoaXMuX19tb3ZhYmxlLmxhc3RYID0gZS5jbGllbnRYO1xuICAgIHRoaXMuX19tb3ZhYmxlLmxhc3RZID0gZS5jbGllbnRZO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlVXAoZSl7XG4gICAgdGhpcy5fX21vdmFibGUuYWN0aXZlID0gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBuaWRnZXQuX19tb3ZhYmxlID0ge1xuICAgICAgICBsYXN0WCA6IDAsXG4gICAgICAgIGxhc3RZIDogMCxcbiAgICAgICAgYWN0aXZlIDogZmFsc2VcbiAgICB9O1xuICAgIFxuICAgIG5pZGdldC5vbk1vdXNlRG93biA9IG9uTW91c2VEb3duLmJpbmQobmlkZ2V0KTsgICAgICAgIFxuICAgIFxuICAgIGlmIChuaWRnZXQucXVlcnlTZWxlY3RvcihcIi5uaWRnZXQtaGVhZGVyXCIpKXtcbiAgICAgICAgbmlkZ2V0LnF1ZXJ5U2VsZWN0b3IoXCIubmlkZ2V0LWhlYWRlclwiKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIG5pZGdldC5vbk1vdXNlRG93bik7ICAgICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgICBuaWRnZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBuaWRnZXQub25Nb3VzZURvd24pO1xuICAgIH1cbiAgICBcbiAgICBuaWRnZXQub25Nb3VzZU1vdmUgPSBvbk1vdXNlTW92ZS5iaW5kKG5pZGdldCk7ICAgIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG5pZGdldC5vbk1vdXNlTW92ZSk7XG5cbiAgICBuaWRnZXQub25Nb3VzZVVwID0gb25Nb3VzZVVwLmJpbmQobmlkZ2V0KTsgICAgXG4gICAgbmlkZ2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG5pZGdldC5vbk1vdXNlVXApO1xuXG59OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIi4uL05pZGdldFwiKTtcbndpbmRvdy5OaWRnZXQgPSBOaWRnZXQ7XG5cbi8qKlxuICogQWRkIGEgcmVzaXplIG9ic2VydmVyIHRvIHRoZSBlbGVtZW50IHRoYXQgd2lsbCBjYWxsIGEgb25SZXNpemUoKSBmdW5jdGlvbi5cbiAqIFRoZSBwYXJhbWV0ZXJzIHBhc3NlZCBpbiBhcmUgKHByZXZpb3VzX2RpbWVuc2lvbnMpLiAgVG8gdXNlIGFkZFxuICogaW50ZXJmYWNlcz1cInJlc2l6ZVwiIHRvIHRoZSBlbGVtZW50IGluIGh0bWwgYW5kIGEgbWV0aG9kIG9uUmVzaXplKCkgdG8gdGhlIFxuICogY2xhc3Mgb2JqZWN0LiAgSWYgdGhlcmUgaXMgbm8gY2xhc3Mgb2JqZWN0IGNyZWF0ZSBhIGZ1bmN0aW9uIGFuZCBiaW5kIGl0LlxuICogaWU6IGVsZW1lbnQub25SZXNpemUgPSBmdW5jdGlvbi5iaW5kKGVsZW1lbnQpOyBcbiAqL1xuXG5sZXQgb25SZXNpemUgPSBmdW5jdGlvbigpe1xuICAgIGxldCBkYXRhID0gdGhpc1tOaWRnZXQuaW50ZXJmYWNlRGF0YUZpZWxkXS5yZXNpemU7XG4gICAgbGV0IHByZXYgPSBkYXRhLnByZXY7XG4gICAgaWYgKCF0aGlzLm9uUmVzaXplKSByZXR1cm47XG4gICAgdGhpcy5vblJlc2l6ZShwcmV2KTtcbiAgICBsb2FkUHJldmlvdXModGhpcyk7XG59O1xuXG5sZXQgbG9hZFByZXZpb3VzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBsZXQgZGF0YSA9IG5pZGdldFtOaWRnZXQuaW50ZXJmYWNlRGF0YUZpZWxkXS5yZXNpemU7XG4gICAgZGF0YS5wcmV2ID0ge1xuICAgICAgICB3aWR0aCA6IG5pZGdldC5vZmZzZXRXaWR0aCxcbiAgICAgICAgaGVpZ2h0IDogbmlkZ2V0Lm9mZnNldEhlaWdodFxuICAgIH07ICAgIFxufTtcblxuLyoqXG4gKiBTZXR1cCBhIHJlc2l6ZSBvYnNlcnZlciBmb3IgdGhlIG5pZGdldCB0aGF0IHRyaWdnZXJzIHRoZSBvblJlc2l6ZSBtZXRob2QgaWYgXG4gKiBhdmFpbGFibGUuXG4gKiAtIG9uUmVzaXplKHRoaXMsIHByZXZpb3VzX2RpbWVuc2lvbnMpIDogbm9uZVxuICogQHBhcmFtIHt0eXBlfSBuaWRnZXRcbiAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIGlmICh0eXBlb2YobmlkZ2V0KSAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IFwiT2JqZWN0IGV4ZWN0ZWRcIjtcbiAgICBsZXQgcmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUuYmluZChuaWRnZXQpKTtcbiAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKG5pZGdldCk7XG4gICAgbG9hZFByZXZpb3VzKG5pZGdldCk7XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIEFic3RyYWN0TW9kZWwgOiByZXF1aXJlKFwiLi9BYnN0cmFjdE1vZGVsXCIpLFxuICAgIE5pZGdldEVsZW1lbnQgOiByZXF1aXJlKFwiLi9OaWRnZXRFbGVtZW50XCIpLFxuICAgIEZpbGVPcGVyYXRpb25zIDogcmVxdWlyZShcIi4vRmlsZU9wZXJhdGlvbnNcIiksXG4gICAgTmlkZ2V0QnV0dG9uU2V0IDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU2V0XCIpLFxuICAgIE5pZGdldEJ1dHRvbiA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblwiKSxcbiAgICBOaWRnZXRCdXR0b25TdGF0ZSA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblN0YXRlXCIpLFxuICAgIE5pZGdldEltYWdlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SW1hZ2VcIiksXG4gICAgTmlkZ2V0SFRNTEltYWdlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SFRNTEltYWdlXCIpLFxuICAgIE5pZGdldFRleHQgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRUZXh0XCIpLFxuICAgIE5pZGdldENvbnRhaW5lciA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldENvbnRhaW5lclwiKSxcbiAgICBNb3VzZVV0aWxpdGllcyA6IHJlcXVpcmUoXCIuL01vdXNlVXRpbGl0aWVzXCIpLFxuICAgIENvbnN0YW50czogcmVxdWlyZShcIi4vTmlkZ2V0XCIpLFxuICAgIGxheW91dHM6IHt9XG59OyIsImNvbnN0IEZpbGVPcHMgPSByZXF1aXJlKFwiLi9tb2R1bGVzL0ZpbGVPcHMuanNcIik7XHJcbmNvbnN0IEF1dGhlbnRpY2F0ZSA9IHJlcXVpcmUoXCIuL21vZHVsZXMvQXV0aGVudGljYXRlLmpzXCIpO1xyXG5jb25zdCBNZW51ID0gcmVxdWlyZShcIi4vbW9kdWxlcy9NZW51LmpzXCIpO1xyXG5jb25zdCBRdWVzdGlvblBhbmUgPSByZXF1aXJlKFwiLi9tb2R1bGVzL1F1ZXN0aW9uUGFuZS5qc1wiKTtcclxuY29uc3QgRWRpdG9yUGFuZSA9IHJlcXVpcmUoXCIuL21vZHVsZXMvRWRpdG9yUGFuZS5qc1wiKTtcclxuY29uc3QgTW9kZWwgPSByZXF1aXJlKFwiLi9tb2R1bGVzL01vZGVsXCIpO1xyXG5cclxuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIkB0aGFlcmlvdXMvbmlkZ2V0XCIpXHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvR2FtZUJvYXJkLmpzXCIpO1xyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL011bHRpcGxlQ2hvaWNlUGFuZS5qc1wiKTtcclxucmVxdWlyZShcIi4vbW9kdWxlcy9DaGVja0JveC5qc1wiKTtcclxuXHJcbmxldCBmaWxlT3BzID0gbmV3IEZpbGVPcHMoKTtcclxubGV0IG1vZGVsID0gbnVsbDtcclxubGV0IHF1ZXN0aW9uUGFuZSA9IG51bGw7XHJcbmxldCBlZGl0b3JQYW5lID0gbnVsbDtcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBzZXRUaW1lb3V0KHNldHVwLCAyMDAwKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2V0dXAoKXtcclxuICAgIGF3YWl0IE5pZGdldC5OaWRnZXRFbGVtZW50LmxvYWRUZW1wbGF0ZVNuaXBwZXQoXCJzbmlwcGV0cy9jaGVjay1ib3guaHRtbFwiLCBcImNoZWNrLWJveFwiKTtcclxuICAgIGF3YWl0IE5pZGdldC5OaWRnZXRFbGVtZW50LmxvYWRUZW1wbGF0ZVNuaXBwZXQoXCJzbmlwcGV0cy9tdWx0aXBsZS1jaG9pY2UtcGFuZS5odG1sXCIsIFwibXVsdGlwbGUtY2hvaWNlLXBhbmVcIik7XHJcbiAgICBhd2FpdCBOaWRnZXQuTmlkZ2V0RWxlbWVudC5sb2FkVGVtcGxhdGVTbmlwcGV0KFwic25pcHBldHMvZ2FtZS1ib2FyZC5odG1sXCIsIFwiZ2FtZS1ib2FyZFwiKTtcclxuICAgIGF3YWl0IE5pZGdldC5OaWRnZXRFbGVtZW50LmxvYWRUZW1wbGF0ZVNuaXBwZXQoXCJzbmlwcGV0cy9xdWVzdGlvbi1wYW5lLmh0bWxcIiwgXCJxdWVzdGlvbi1wYW5lXCIpO1xyXG5cclxuICAgIHBhcnNlVVJMUGFyYW1ldGVycygpO1xyXG4gICAgbmV3IE1lbnUoKS5pbml0KFwiI21lbnVcIik7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBuZXcgQXV0aGVudGljYXRlKCkubG9hZENsaWVudCgpO1xyXG4gICAgICAgIGF3YWl0IGZpbGVPcHMubG9hZENsaWVudCgpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZmlsZSA9IGF3YWl0IGZpbGVPcHMuZ2V0KHdpbmRvdy5wYXJhbWV0ZXJzLmZpbGVJZCk7XHJcbiAgICBsZXQgbW9kZWwgPSBuZXcgTW9kZWwoZmlsZU9wcykuc2V0KEpTT04ucGFyc2UoZmlsZS5ib2R5KSk7XHJcbiAgICB3aW5kb3cubW9kZWwgPSBtb2RlbDtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtbmFtZVwiKS50ZXh0Q29udGVudCA9IG1vZGVsLm5hbWU7XHJcbiAgICBlZGl0b3JQYW5lID0gbmV3IEVkaXRvclBhbmUobW9kZWwpO1xyXG4gICAgZWRpdG9yUGFuZS5vblNhdmUgPSBzYXZlTW9kZWw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYXZlIHRoZSBtb2RlbCB0byB0aGUgZ29vZ2xlIGFwcCBkYXRhIGZvbGRlci5cclxuICovXHJcbmZ1bmN0aW9uIHNhdmVNb2RlbCgpIHtcclxuICAgIGZpbGVPcHMuc2V0Qm9keSh3aW5kb3cucGFyYW1ldGVycy5maWxlSWQsIEpTT04uc3RyaW5naWZ5KHdpbmRvdy5tb2RlbC5nZXQoKSwgbnVsbCwgMikpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hhbmdlIHRoZSBuYW1lIG9mIHRoZSBmaWxlIGluIGdvb2dsZSdzIGFwcCBkYXRhIGZvbGRlci5cclxuICovXHJcbmZ1bmN0aW9uIHJlbmFtZU1vZGVsKCkge1xyXG4gICAgbGV0IG5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtbmFtZVwiKS50ZXh0Q29udGVudDtcclxuICAgIGZpbGVPcHMucmVuYW1lKHdpbmRvdy5wYXJhbWV0ZXJzLmZpbGVJZCwgbmFtZSArIFwiLmpzb25cIik7XHJcbiAgICB3aW5kb3cubW9kZWwubmFtZSA9IG5hbWU7XHJcbiAgICBzYXZlTW9kZWwoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEV4dHJhY3QgdmFsdWUgZnJvbSB0aGUgVVJMIHN0cmluZywgc3RvcmUgaW4gJ3dpbmRvdy5wYXJhbWV0ZXJzJy5cclxuICovXHJcbmZ1bmN0aW9uIHBhcnNlVVJMUGFyYW1ldGVycygpIHtcclxuICAgIHdpbmRvdy5wYXJhbWV0ZXJzID0ge307XHJcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSkuc3BsaXQoXCImXCIpO1xyXG4gICAgZm9yIChjb25zdCBwYXJhbWV0ZXIgb2YgcGFyYW1ldGVycykge1xyXG4gICAgICAgIGNvbnN0IHNwbGl0ID0gcGFyYW1ldGVyLnNwbGl0KC89Lyk7XHJcbiAgICAgICAgd2luZG93LnBhcmFtZXRlcnNbc3BsaXRbMF1dID0gc3BsaXRbMV0gPz8gXCJcIjtcclxuICAgIH1cclxufSIsIi8vIHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9kcml2ZS9hcGkvdjMvcXVpY2tzdGFydC9qcz9obD1lblxyXG5cclxuY2xhc3MgQXV0aGVudGljYXRlIHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCByZXF1aXJlKFwiLi9nb29nbGVGaWVsZHMuanNcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDbGllbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZ2FwaS5sb2FkKCdjbGllbnQ6YXV0aDInLCAoKSA9PiB0aGlzLl9faW5pdENsaWVudChyZXNvbHZlLCByZWplY3QpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfX2luaXRDbGllbnQocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZ2FwaS5jbGllbnQuaW5pdCh7XHJcbiAgICAgICAgICAgIGFwaUtleTogdGhpcy5kZXZlbG9wZXJLZXksXHJcbiAgICAgICAgICAgIGNsaWVudElkOiB0aGlzLmNsaWVudElkLFxyXG4gICAgICAgICAgICBkaXNjb3ZlcnlEb2NzOiB0aGlzLmRpc2NvdmVyeURvY3MsXHJcbiAgICAgICAgICAgIHNjb3BlOiB0aGlzLnNjb3BlXHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SIElOSVRcIik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpc0F1dGhvcml6ZWQoKXtcclxuICAgICAgICB2YXIgdXNlciA9IGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuY3VycmVudFVzZXIuZ2V0KCk7XHJcbiAgICAgICAgcmV0dXJuIHVzZXIuaGFzR3JhbnRlZFNjb3Blcyh0aGlzLnNjb3BlKTtcclxuICAgIH1cclxuXHJcbiAgICBzaWduSW4oKXtcclxuICAgICAgICBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLnNpZ25JbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHNpZ25PdXQoKXtcclxuICAgICAgICBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLnNpZ25PdXQoKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXV0aGVudGljYXRlOyIsImNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiQFRoYWVyaW91cy9uaWRnZXRcIikuTmlkZ2V0RWxlbWVudDtcclxuXHJcbmNsYXNzIENoZWNrQm94IGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XHJcbiAgICBhc3luYyBjb25uZWN0ZWRDYWxsYmFjaygpe1xyXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy50b2dnbGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0b2dnbGUoKXtcclxuICAgICAgICBpZiAodGhpcy5jaGVja2VkID09PSAndHJ1ZScpIHRoaXMuY2hlY2tlZCA9ICdmYWxzZSc7XHJcbiAgICAgICAgZWxzZSB0aGlzLmNoZWNrZWQgPSAndHJ1ZSdcclxuICAgIH1cclxuXHJcbiAgICBnZXQgY2hlY2tlZCgpe1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRyaWJ1dGUoQ2hlY2tCb3guQ0hFQ0tFRF9BVFRSSUJVVEUpKXtcclxuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoQ2hlY2tCb3guQ0hFQ0tFRF9BVFRSSUJVVEUsICdmYWxzZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoQ2hlY2tCb3guQ0hFQ0tFRF9BVFRSSUJVVEUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBjaGVja2VkKHZhbHVlKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyaWJ1dGUoQ2hlY2tCb3guQ0hFQ0tFRF9BVFRSSUJVVEUsIHZhbHVlKTtcclxuICAgIH1cclxufVxyXG5cclxuQ2hlY2tCb3guQ0hFQ0tFRF9BVFRSSUJVVEUgPSBcImNoZWNrZWRcIjtcclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnY2hlY2stYm94JywgQ2hlY2tCb3gpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IENoZWNrQm94OyIsImNvbnN0IE1vZGVsID0gcmVxdWlyZShcIi4vTW9kZWwuanNcIik7XHJcblxyXG4vLyBzaG93UXVlc3Rpb24oY2VsbCl7XHJcbi8vICAgICBpZiAoY2VsbCkgdGhpcy5jZWxsID0gY2VsbDtcclxuLy8gICAgIGNlbGwgPSBjZWxsID8/IHRoaXMuY2VsbDtcclxuLy9cclxuLy8gICAgIHRoaXMubmF2QW5zd2VyLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcclxuLy8gICAgIHRoaXMubmF2UXVlc3Rpb24uY2xhc3NMaXN0LmFkZChcInNlbGVjdGVkXCIpO1xyXG4vL1xyXG4vLyAgICAgdGhpcy5zdGF0dXMgPSBcInFcIjtcclxuLy9cclxuLy8gICAgIHRoaXMubmF2Qm9hcmQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuLy8gICAgIHRoaXMubmF2UXVlc3Rpb24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuLy8gICAgIHRoaXMubmF2QW5zd2VyLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbi8vXHJcbi8vICAgICB0aGlzLnRleHRRdWVzdGlvbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4vLyAgICAgdGhpcy50ZXh0UXVlc3Rpb24ucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpLnRleHQgPSBjZWxsLnE7XHJcbi8vIH1cclxuLy9cclxuLy8gc2hvd0Fuc3dlcihjZWxsKXtcclxuLy8gICAgIGlmIChjZWxsKSB0aGlzLmNlbGwgPSBjZWxsO1xyXG4vLyAgICAgY2VsbCA9IGNlbGwgPz8gdGhpcy5jZWxsO1xyXG4vL1xyXG4vLyAgICAgdGhpcy5uYXZBbnN3ZXIuY2xhc3NMaXN0LmFkZChcInNlbGVjdGVkXCIpO1xyXG4vLyAgICAgdGhpcy5uYXZRdWVzdGlvbi5jbGFzc0xpc3QucmVtb3ZlKFwic2VsZWN0ZWRcIik7XHJcbi8vXHJcbi8vICAgICB0aGlzLnN0YXR1cyA9IFwiYVwiO1xyXG4vL1xyXG4vLyAgICAgdGhpcy5uYXZCb2FyZC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4vLyAgICAgdGhpcy5uYXZRdWVzdGlvbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4vLyAgICAgdGhpcy5uYXZBbnN3ZXIuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuLy9cclxuLy8gICAgIHRoaXMudGV4dFF1ZXN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbi8vICAgICB0aGlzLnRleHRRdWVzdGlvbi5xdWVyeVNlbGVjdG9yKFwiLnRleHQtY29udGVudHNcIikudGV4dCA9IGNlbGwuYTtcclxuLy8gfVxyXG5cclxuY2xhc3MgRWRpdFF1ZXN0aW9uUGFuZXtcclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIGdhbWVCb2FyZFxyXG4gICAgICogQHBhcmFtIHF1ZXN0aW9uUGFuZVxyXG4gICAgICogQHBhcmFtIG1vZGVsIC0gdGhlIHF1ZXN0aW9uIG1vZGVsIG9iamVjdFxyXG4gICAgICogQHBhcmFtIGZpZWxkIC0gd2hpY2ggbW9kZWwgZmllbGQgdG8gcmVhZC93cml0ZSBmcm9tIHsnYScsICdxJ31cclxuICAgICAqIEBwYXJhbSBzYXZlQ0IgLSBjYWxsIHRoaXMgbWV0aG9kIHRvIHNhdmUgdGhlIG1vZGVsXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGdhbWVCb2FyZCwgcXVlc3Rpb25QYW5lLCBtb2RlbCwgZmllbGQsIHNhdmVDQiwgY2xvc2VDQikge1xyXG4gICAgICAgIHRoaXMucXVlc3Rpb25QYW5lID0gcXVlc3Rpb25QYW5lO1xyXG5cclxuICAgICAgICBxdWVzdGlvblBhbmUuc2V0VGV4dChtb2RlbFtmaWVsZF0pO1xyXG5cclxuICAgICAgICB0aGlzLnRleHRMaXN0ID0gKGV2ZW50KT0+e1xyXG4gICAgICAgICAgICBtb2RlbFtmaWVsZF0gPSBldmVudC5kZXRhaWwudGV4dDtcclxuICAgICAgICAgICAgc2F2ZUNCKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmJvYXJkTGlzdCA9IChldmVudCk9PntcclxuICAgICAgICAgICAgcXVlc3Rpb25QYW5lLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5jbGVhbnVwKCk7XHJcbiAgICAgICAgICAgIGdhbWVCb2FyZC5zaG93KCk7XHJcbiAgICAgICAgICAgIGNsb3NlQ0IoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYW5zd2VyTGlzdCA9IChldmVudCk9PntcclxuICAgICAgICAgICAgdGhpcy5jbGVhbnVwKCk7XHJcbiAgICAgICAgICAgIG5ldyBFZGl0UXVlc3Rpb25QYW5lKGdhbWVCb2FyZCwgcXVlc3Rpb25QYW5lLCBtb2RlbCwgJ2EnLCBzYXZlQ0IsIGNsb3NlQ0IpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5xdWVzdGlvbkxpc3QgPSAoZXZlbnQpPT57XHJcbiAgICAgICAgICAgIHRoaXMuY2xlYW51cCgpO1xyXG4gICAgICAgICAgICBuZXcgRWRpdFF1ZXN0aW9uUGFuZShnYW1lQm9hcmQsIHF1ZXN0aW9uUGFuZSwgbW9kZWwsICdxJywgc2F2ZUNCLCBjbG9zZUNCKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKFwidGV4dC11cGRhdGVcIiwgdGhpcy50ZXh0TGlzdCk7XHJcbiAgICAgICAgcXVlc3Rpb25QYW5lLmFkZEV2ZW50TGlzdGVuZXIoXCJidXR0b24tYm9hcmRcIiwgdGhpcy5ib2FyZExpc3QpO1xyXG5cclxuICAgICAgICBpZiAoZmllbGQgPT09ICdhJyl7XHJcbiAgICAgICAgICAgIHF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKFwiYnV0dG9uLXF1ZXN0aW9uXCIsIHRoaXMucXVlc3Rpb25MaXN0KTtcclxuICAgICAgICAgICAgcXVlc3Rpb25QYW5lLmhpZ2hsaWdodCgnYW5zd2VyJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGZpZWxkID09PSAncScpe1xyXG4gICAgICAgICAgICBxdWVzdGlvblBhbmUuYWRkRXZlbnRMaXN0ZW5lcihcImJ1dHRvbi1hbnN3ZXJcIiwgdGhpcy5hbnN3ZXJMaXN0KTtcclxuICAgICAgICAgICAgcXVlc3Rpb25QYW5lLmhpZ2hsaWdodCgncXVlc3Rpb24nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYW51cCgpe1xyXG4gICAgICAgIHRoaXMucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0ZXh0LXVwZGF0ZVwiLCB0aGlzLnRleHRMaXN0KTtcclxuICAgICAgICB0aGlzLnF1ZXN0aW9uUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiYnV0dG9uLWJvYXJkXCIsIHRoaXMuYm9hcmRMaXN0KTtcclxuICAgICAgICB0aGlzLnF1ZXN0aW9uUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiYnV0dG9uLWFuc3dlclwiLCB0aGlzLmFuc3dlckxpc3QpO1xyXG4gICAgICAgIHRoaXMucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJxdWVzdGlvbi1hbnN3ZXJcIiwgdGhpcy5xdWVzdGlvbkxpc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uU2F2ZSgpe31cclxuICAgIG9uQ2xvc2UoKXt9XHJcbn1cclxuXHJcbmNsYXNzIEVkaXRvclBhbmV7XHJcbiAgICBjb25zdHJ1Y3Rvcihtb2RlbCkge1xyXG4gICAgICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuICAgICAgICB0aGlzLnRyaWFuZ2xlUmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RyaWFuZ2xlLXJpZ2h0XCIpO1xyXG4gICAgICAgIHRoaXMudHJpYW5nbGVMZWZ0ICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdHJpYW5nbGUtbGVmdFwiKTtcclxuICAgICAgICB0aGlzLnJvdW5kTGFiZWwgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JvdW5kLW51bWJlclwiKTtcclxuICAgICAgICB0aGlzLmdhbWVOYW1lICAgICAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtbmFtZVwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5tdWx0aXBsZUNob2ljZVBhbmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm11bHRpcGxlLWNob2ljZS1wYW5lXCIpO1xyXG4gICAgICAgIHRoaXMuZ2FtZUJvYXJkICAgICAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYW1lLWJvYXJkXCIpO1xyXG4gICAgICAgIHRoaXMucXVlc3Rpb25QYW5lICAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJxdWVzdGlvbi1wYW5lXCIpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtYWRkLWNhdGVnb3J5XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmFkZENhdGVnb3J5Um91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVUcmlhbmdsZVZpZXcoKTtcclxuICAgICAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LWFkZC1tdWx0aXBsZS1jaG9pY2VcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuYWRkTXVsdGlwbGVDaG9pY2VSb3VuZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRyaWFuZ2xlVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtcmVtb3ZlLXJvdW5kXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy5tZW51UmVtb3ZlKCkpO1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1ob21lLXNjcmVlblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMubWVudUhvbWUoKSk7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LXZhbHVlLXBsdXNcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLm1lbnVQbHVzKCkpO1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS12YWx1ZS1taW51c1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMubWVudU1pbnVzKCkpO1xyXG5cclxuICAgICAgICB0aGlzLnRyaWFuZ2xlUmlnaHQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT4gdGhpcy5uZXh0Um91bmQoKSk7XHJcbiAgICAgICAgdGhpcy50cmlhbmdsZUxlZnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT4gdGhpcy5wcmV2Um91bmQoKSk7XHJcbiAgICAgICAgdGhpcy5nYW1lTmFtZS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpPT50aGlzLmlucHV0TmFtZShldmVudCkpO1xyXG5cclxuICAgICAgICAvLyBnYW1lLWJvYXJkIGNoYW5nZSBjYXRlZ29yeSB0ZXh0XHJcbiAgICAgICAgdGhpcy5nYW1lQm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImhlYWRlci11cGRhdGVcIiwgZXZlbnQgPT57XHJcbiAgICAgICAgICAgIGxldCBjb2wgPSBldmVudC5kZXRhaWwuY29sO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmdldENvbHVtbihjb2wpLmNhdGVnb3J5ID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmdldENvbHVtbihjb2wpLmZvbnRTaXplID0gZXZlbnQuZGV0YWlsLmZvbnRTaXplO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBnYW1lLWJvYXJkIHNlbGVjdCBjZWxsXHJcbiAgICAgICAgdGhpcy5nYW1lQm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNlbGwtc2VsZWN0XCIsIGV2ZW50ID0+e1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gZXZlbnQuZGV0YWlsLnJvdztcclxuICAgICAgICAgICAgbGV0IGNvbCA9IGV2ZW50LmRldGFpbC5jb2w7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZUJvYXJkLmhpZGUoKTtcclxuICAgICAgICAgICAgdGhpcy5xdWVzdGlvblBhbmUuc2hvdygpO1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVOYXZpZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIG5ldyBFZGl0UXVlc3Rpb25QYW5lKHRoaXMuZ2FtZUJvYXJkLCB0aGlzLnF1ZXN0aW9uUGFuZSwgdGhpcy5tb2RlbC5nZXRDZWxsKHJvdywgY29sKSwgJ3EnLCAoKT0+dGhpcy5vblNhdmUoKSwgKCk9PnRoaXMudXBkYXRlVmlldygpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saW5rUGFuZXMoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBvblNhdmUoKXt9XHJcbiAgICB1cGRhdGVOYW1lKCl7fVxyXG5cclxuICAgIGxpbmtQYW5lcygpe1xyXG4gICAgICAgIGxldCBtdWx0aXBsZUNob2ljZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXVsdGlwbGUtY2hvaWNlLXBhbmVcIik7XHJcbiAgICAgICAgbGV0IGdhbWVCb2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZS1ib2FyZFwiKTtcclxuICAgICAgICBsZXQgcXVlc3Rpb25QYW5lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJxdWVzdGlvbi1wYW5lXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlucHV0TmFtZShldmVudCl7XHJcbiAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxMyl7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTmFtZSgpO1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lLWJvYXJkLWNvbnRhaW5lclwiKS5mb2N1cygpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhpZGVOYXZpZ2F0aW9uKCl7XHJcbiAgICAgICAgdGhpcy50cmlhbmdsZUxlZnQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLnRyaWFuZ2xlUmlnaHQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVWaWV3KG1vZGVsKSB7XHJcbiAgICAgICAgbW9kZWwgPSBtb2RlbCA/PyB0aGlzLm1vZGVsO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVHJpYW5nbGVWaWV3KCk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZS1ib2FyZFwiKS5oaWRlKCk7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtdWx0aXBsZS1jaG9pY2UtcGFuZVwiKS5oaWRlKCk7XHJcblxyXG4gICAgICAgIGlmIChtb2RlbC5nZXRSb3VuZCgpLnR5cGUgPT09IE1vZGVsLnF1ZXN0aW9uVHlwZS5DQVRFR09SWSkgdGhpcy5jYXRlZ29yeVZpZXcobW9kZWwpO1xyXG4gICAgICAgIGlmIChtb2RlbC5nZXRSb3VuZCgpLnR5cGUgPT09IE1vZGVsLnF1ZXN0aW9uVHlwZS5NVUxUSVBMRV9DSE9JQ0UpIHRoaXMubXVsdGlwbGVDaG9pY2VWaWV3KG1vZGVsKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVUcmlhbmdsZVZpZXcoKXtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInVwZGF0ZSB0cmlhbmdsZSB2aWV3XCIpO1xyXG4gICAgICAgIHRoaXMudHJpYW5nbGVMZWZ0LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy50cmlhbmdsZVJpZ2h0LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuY3VycmVudFJvdW5kID09PSAwKSB0aGlzLnRyaWFuZ2xlTGVmdC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRSb3VuZCA+PSB0aGlzLm1vZGVsLnJvdW5kQ291bnQgLSAxKSB0aGlzLnRyaWFuZ2xlUmlnaHQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLnJvdW5kTGFiZWwudGV4dENvbnRlbnQgPSBcIlJvdW5kIFwiICsgKHRoaXMubW9kZWwuY3VycmVudFJvdW5kICsgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgbXVsdGlwbGVDaG9pY2VWaWV3KCl7XHJcbiAgICAgICAgbGV0IHBhbmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm11bHRpcGxlLWNob2ljZS1wYW5lXCIpO1xyXG4gICAgICAgIHBhbmUuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGNhdGVnb3J5Vmlldyhtb2RlbCl7XHJcbiAgICAgICAgbGV0IGdhbWVCb2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZS1ib2FyZFwiKTtcclxuICAgICAgICBnYW1lQm9hcmQuc2hvdygpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCA2OyBjb2wrKykge1xyXG4gICAgICAgICAgICBsZXQgY29sdW1uID0gbW9kZWwuZ2V0Q29sdW1uKGNvbCk7XHJcblxyXG4gICAgICAgICAgICBnYW1lQm9hcmQuZ2V0SGVhZGVyKGNvbCkuZml0VGV4dC5sb2NrID0gXCJ2aFwiO1xyXG4gICAgICAgICAgICBnYW1lQm9hcmQuc2V0SGVhZGVyKGNvbCwgY29sdW1uLmNhdGVnb3J5LCBjb2x1bW4uZm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgNTsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIGdhbWVCb2FyZC5zZXRDZWxsKHJvdywgY29sLCBjb2x1bW4uY2VsbFtyb3ddLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGlmIChjb2x1bW4uY2VsbFtyb3ddLnEgPT09IFwiXCIpIGdhbWVCb2FyZC5zZXRDb21wbGV0ZShyb3csIGNvbCwgXCJmYWxzZVwiKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNvbHVtbi5jZWxsW3Jvd10uYSA9PT0gXCJcIikgZ2FtZUJvYXJkLnNldENvbXBsZXRlKHJvdywgY29sLCBcInBhcnRpYWxcIik7XHJcbiAgICAgICAgICAgICAgICBlbHNlIGdhbWVCb2FyZC5zZXRDb21wbGV0ZShyb3csIGNvbCwgXCJ0cnVlXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5leHRSb3VuZCgpe1xyXG4gICAgICAgIHRoaXMubW9kZWwuY3VycmVudFJvdW5kKys7XHJcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJldlJvdW5kKCl7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5jdXJyZW50Um91bmQtLTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBtZW51UGx1cygpe1xyXG4gICAgICAgIHRoaXMubW9kZWwuaW5jcmVhc2VWYWx1ZSgpO1xyXG4gICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgbWVudU1pbnVzKCl7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5kZWNyZWFzZVZhbHVlKCk7XHJcbiAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBtZW51UmVtb3ZlKCl7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5yZW1vdmVSb3VuZCgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVHJpYW5nbGVWaWV3KCk7XHJcbiAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBtZW51SG9tZSgpe1xyXG4gICAgICAgIGxvY2F0aW9uLmhyZWYgPSBcImhvbWUuaHRtbFwiO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvclBhbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vIHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9kcml2ZS9hcGkvdjMvcXVpY2tzdGFydC9qcz9obD1lblxyXG5cclxuY2xhc3MgRmlsZU9wcyB7XHJcblxyXG4gICAgYXN5bmMgbG9hZCgpe1xyXG4gICAgICAgIGF3YWl0IHRoaXMubG9hZENsaWVudCgpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMubG9hZERyaXZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZENsaWVudCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmxvYWQoJ2NsaWVudCcsICgpID0+IHJlc29sdmUoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZERyaXZlKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmxvYWQoJ2RyaXZlJywgJ3YzJywgcmVzb2x2ZSgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBjcmVhdGUoKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgICAgICBuYW1lIDogRmlsZU9wcy5maWxlbmFtZSxcclxuICAgICAgICAgICAgICAgIHBhcmVudHM6IFsnYXBwRGF0YUZvbGRlciddLFxyXG4gICAgICAgICAgICAgICAgZmllbGRzOiBcImlkXCJcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLnJlc3VsdC5pZCk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZGVsZXRlKGZpbGVJZCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5kZWxldGUoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkIDogZmlsZUlkXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy5yZXN1bHQpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgbGlzdCgpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMubGlzdCh7XHJcbiAgICAgICAgICAgICAgICAvLyBxOiBgbmFtZSBjb250YWlucyAnLmpzb24nYCxcclxuICAgICAgICAgICAgICAgIHNwYWNlczogJ2FwcERhdGFGb2xkZXInLFxyXG4gICAgICAgICAgICAgICAgZmllbGRzOiAnZmlsZXMvbmFtZSxmaWxlcy9pZCxmaWxlcy9tb2RpZmllZFRpbWUnXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy5yZXN1bHQuZmlsZXMpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldChmaWxlSWQpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuZ2V0KHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZDogZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgYWx0OiAnbWVkaWEnXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBzZXRCb2R5KGZpbGVJZCwgYm9keSl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5yZXF1ZXN0KHtcclxuICAgICAgICAgICAgICAgIHBhdGggOiBcInVwbG9hZC9kcml2ZS92My9maWxlcy9cIiArIGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIG1ldGhvZCA6IFwiUEFUQ0hcIixcclxuICAgICAgICAgICAgICAgIHBhcmFtcyA6IHtcclxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRUeXBlIDogXCJtZWRpYVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaGVhZGVycyA6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiIDogXCJhcHBsaWNhdGlvbi9qc29uXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBib2R5IDogYm9keVxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcy5ib2R5KSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZW5hbWUoZmlsZUlkLCBmaWxlbmFtZSl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkOiBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBmaWxlbmFtZVxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcy5ib2R5KSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuRmlsZU9wcy5maWxlbmFtZSA9IFwiR2FtZSBOYW1lLmpzb25cIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wczsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKiBWaWV3LUNvbnRyb2xsZXIgZm9yIHRoZSBIVE1MIGdhbWUgYm9hcmQgZWxlbWVudFxyXG4gICAgVGhpcyBpcyB0aGUgY2xhc3NpY2FsIFwiSmVvcGFyZHlcIiB0eXBlIGJvYXJkXHJcbiAgICBUaGlzIGlzIG1vZGVsIGFnbm9zdGljLCBzZWUgRWRpdG9yUGFuZS5qcyBmb3IgbW9kZWwgbWV0aG9kc1xyXG4gICAgZ2VuZXJhdGVzIHRoZSBmb2xsb3dpbmcgZXZlbnRzOlxyXG4gICAgICAgIGNlbGwtc2VsZWN0IChyb3csIGNvbCk6IHdoZW4gYSB1c2VyIGNsaWNrcyBhIGNlbGxcclxuICAgICAgICBoZWFkZXItdXBkYXRlICh2YWx1ZSwgY29sLCBmb250c2l6ZSkgOiB3aGVuIHRoZSBoZWFkZXIgdGV4dCBjaGFuZ2VzIChhbmQgYmx1cnMpXHJcbiAqKi9cclxuXHJcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiQFRoYWVyaW91cy9uaWRnZXRcIikuTmlkZ2V0RWxlbWVudDtcclxuXHJcbmNsYXNzIENlbGxTZWxlY3RFdmVudCBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKHJvdywgY29sKSB7XHJcbiAgICAgICAgc3VwZXIoJ2NlbGwtc2VsZWN0JyxcclxuICAgICAgICAgICAgICB7ZGV0YWlsIDoge3JvdyA6IHJvdywgY29sIDogY29sIH19XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgSGVhZGVyVXBkYXRlRXZlbnQgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3Rvcihjb2wsIHZhbHVlLCBmb250U2l6ZSkge1xyXG4gICAgICAgIHN1cGVyKCdoZWFkZXItdXBkYXRlJyxcclxuICAgICAgICAgICAge2RldGFpbCA6IHt2YWx1ZSA6IHZhbHVlLCBjb2wgOiBjb2wsIGZvbnRTaXplIDogZm9udFNpemV9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEdhbWVCb2FyZCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZWFkeSgpe1xyXG4gICAgICAgIGF3YWl0IHN1cGVyLnJlYWR5KCk7XHJcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgNjsgY29sKyspIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRIZWFkZXIoY29sKS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KT0+ZXZlbnQudGFyZ2V0LmZpdFRleHQubm90aWZ5KDEsIDEpKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0SGVhZGVyKGNvbCkuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgKGV2ZW50KT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZXZlbnQudGFyZ2V0KVtcImZvbnQtc2l6ZVwiXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgSGVhZGVyVXBkYXRlRXZlbnQoY29sLCBldmVudC50YXJnZXQudGV4dCwgZm9udFNpemUpKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCA1OyByb3crKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRDZWxsKHJvdywgY29sKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ2VsbFNlbGVjdEV2ZW50KHJvdywgY29sKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgdmFsdWUgb2YgYSBjYXRlZ29yeVxyXG4gICAgICogQHBhcmFtIGluZGV4XHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBzZXRIZWFkZXIoaW5kZXgsIHZhbHVlLCBmb250U2l6ZSl7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLmdldEhlYWRlcihpbmRleCk7XHJcbiAgICAgICAgZWxlbWVudC50ZXh0ID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKGZvbnRTaXplKSBlbGVtZW50LnN0eWxlW1wiZm9udC1zaXplXCJdID0gZm9udFNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRyaWV2ZSB0aGUgaGVhZGVyIGh0bWwgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIGluZGV4XHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqL1xyXG4gICAgZ2V0SGVhZGVyKGluZGV4KXtcclxuICAgICAgICBpZiAodHlwZW9mIGluZGV4ICE9PSBcIm51bWJlclwiIHx8IGluZGV4IDwgMCB8fCBpbmRleCA+IDYpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5kZXg6IFwiICsgaW5kZXgpO1xyXG4gICAgICAgIGxldCBzZWxlY3RvciA9IGBbZGF0YS1yb3c9J2gnXVtkYXRhLWNvbD0nJHtpbmRleH0nXSA+IC52YWx1ZWA7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIHZhbHVlIG9mIGEgbm9uLWNhdGVnb3J5IGNlbGwuXHJcbiAgICAgKiBAcGFyYW0gcm93XHJcbiAgICAgKiBAcGFyYW0gY29sXHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqL1xyXG4gICAgc2V0Q2VsbChyb3csIGNvbCwgdmFsdWUgPSBcIlwiKXtcclxuICAgICAgICB0aGlzLmdldENlbGwocm93LCBjb2wpLnRleHRDb250ZW50ID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2VsbChyb3csIGNvbCl7XHJcbiAgICAgICAgbGV0IHNlbGVjdG9yID0gYFtkYXRhLXJvdz1cIiR7cm93fVwiXVtkYXRhLWNvbD1cIiR7Y29sfVwiXSA+IC52YWx1ZWA7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29tcGxldGUocm93LCBjb2wsIHZhbHVlKXtcclxuICAgICAgICBpZiAodHlwZW9mIHJvdyAhPT0gXCJudW1iZXJcIiB8fCByb3cgPCAwIHx8IHJvdyA+IDYpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcm93OiBcIiArIHJvdyk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb2wgIT09IFwibnVtYmVyXCIgfHwgY29sIDwgMCB8fCBjb2wgPiA1KSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGNvbDogXCIgKyBjb2wpO1xyXG4gICAgICAgIHRoaXMuZ2V0Q2VsbChyb3csIGNvbCkuc2V0QXR0cmlidXRlKFwiZGF0YS1jb21wbGV0ZVwiLCB2YWx1ZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2dhbWUtYm9hcmQnLCBHYW1lQm9hcmQpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVCb2FyZDsiLCJjbGFzcyBNZW51e1xyXG4gICAgaW5pdChtZW51U2VsZWN0b3Ipe1xyXG4gICAgICAgIHRoaXMubWVudVNlbGVjdG9yID0gbWVudVNlbGVjdG9yO1xyXG4gICAgICAgIHRoaXMubWVudUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMudG9nZ2xlTWVudSgpKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uTWVudSgpO1xyXG5cclxuICAgICAgICB0aGlzLm1lbnVBcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpPT4gdGhpcy5tb3VzZUxlYXZlKCkpO1xyXG4gICAgICAgIHRoaXMubWVudUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKT0+IHRoaXMubW91c2VMZWF2ZSgpKTtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpPT4gdGhpcy5tb3VzZUVudGVyKCkpO1xyXG4gICAgICAgIHRoaXMubWVudUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKT0+IHRoaXMubW91c2VFbnRlcigpKTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWF1dG9jbG9zZT0ndHJ1ZSdcIikuZm9yRWFjaCgoZWxlKT0+IHtcclxuICAgICAgICAgICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy5jbG9zZSgpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zdWItbWVudVwiKS5mb3JFYWNoKChlbGUpPT57XHJcbiAgICAgICAgICAgIGVsZS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtbGFiZWxcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZU1lbnUoZWxlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlKCl7XHJcbiAgICAgICAgdGhpcy5tZW51QXJlYS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnN1Yi1tZW51ID4gLm1lbnUtYXJlYVwiKS5mb3JFYWNoKChlbGUpPT57XHJcbiAgICAgICAgICAgIGVsZS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9wZW4oKXtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbk1lbnUoKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZUxlYXZlKCl7XHJcbiAgICAgICAgaWYgKHRoaXMudGltZW91dCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PntcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VFbnRlcigpe1xyXG4gICAgICAgIGlmICghdGhpcy50aW1lb3V0KSByZXR1cm47XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XHJcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0b2dnbGVNZW51KGVsZW1lbnQpe1xyXG4gICAgICAgIGVsZW1lbnQgPSBlbGVtZW50ID8/IHRoaXMubWVudUFyZWE7XHJcbiAgICAgICAgaWYgKCFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIm1lbnUtYXJlYVwiKSl7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hcmVhXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaGlkZGVuXCIpKXtcclxuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIm1lbnUtYXJlYVwiKSl7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnUtYXJlYVwiKS5mb3JFYWNoKFxyXG4gICAgICAgICAgICAgICAgKGVsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwb3NpdGlvbk1lbnUoKXtcclxuICAgICAgICBjb25zdCBsZWZ0ID0gdGhpcy5tZW51QnV0dG9uLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgICAgICAgY29uc3QgYldpZHRoID0gdGhpcy5tZW51QnV0dG9uLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG4gICAgICAgIGNvbnN0IG1XaWR0aCA9IHRoaXMubWVudUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XHJcbiAgICAgICAgaWYgKChsZWZ0ICsgYldpZHRoICsgbVdpZHRoICsgMikgPiB3aW5kb3cuaW5uZXJXaWR0aCl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TWVudUxlZnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNldE1lbnVSaWdodCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRNZW51TGVmdCgpe1xyXG4gICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLm1lbnVCdXR0b24ub2Zmc2V0TGVmdDtcclxuICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXMubWVudUFyZWEub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgdGhpcy5tZW51QXJlYS5zdHlsZS5sZWZ0ID0gKGxlZnQgLSB3aWR0aCAtIDIpICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1lbnVSaWdodCgpe1xyXG4gICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLm1lbnVCdXR0b24ub2Zmc2V0TGVmdDtcclxuICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXMubWVudUJ1dHRvbi5vZmZzZXRXaWR0aDtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLnN0eWxlLmxlZnQgPSAobGVmdCArIHdpZHRoICsgMikgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG1lbnUoKXtcclxuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm1lbnVTZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG1lbnVCdXR0b24oKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZW51LnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1pY29uXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBtZW51QXJlYSgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1lbnUucXVlcnlTZWxlY3RvcihcIi5tZW51LWFyZWFcIik7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVudTsiLCJjbGFzcyBNb2RlbCB7XHJcbiAgICBpbml0KG5hbWUgPSBcIkdhbWUgTmFtZVwiKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWVNb2RlbCA9IHtcclxuICAgICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICAgICAgcm91bmRzOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ2F0ZWdvcnlSb3VuZCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBuYW1lKHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLm5hbWUgPSBzdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsLm5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0KGdhbWVNb2RlbCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFJvdW5kID0gMDtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbCA9IGdhbWVNb2RlbDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBnZXQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJvdW5kKGluZGV4KSB7XHJcbiAgICAgICAgaW5kZXggPSBpbmRleCA/PyB0aGlzLmN1cnJlbnRSb3VuZDtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWwucm91bmRzW2luZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb2x1bW4oaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb3VuZCgpLmNvbHVtbltpbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2VsbChyb3csIGNvbHVtbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldENvbHVtbihjb2x1bW4pLmNlbGxbcm93XTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVSb3VuZCgpIHtcclxuICAgICAgICBpZiAodGhpcy5yb3VuZENvdW50ID09PSAxKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwucm91bmRzLnNwbGljZSh0aGlzLmN1cnJlbnRSb3VuZCwgMSk7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdW5kID49IHRoaXMucm91bmRDb3VudCkgdGhpcy5jdXJyZW50Um91bmQgPSB0aGlzLnJvdW5kQ291bnQgLSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZE11bHRpcGxlQ2hvaWNlUm91bmQoKXtcclxuICAgICAgICBsZXQgcm91bmQgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IE1vZGVsLnF1ZXN0aW9uVHlwZS5NVUxUSVBMRV9DSE9JQ0UsXHJcbiAgICAgICAgICAgIHF1ZXN0aW9uIDogXCJcIixcclxuICAgICAgICAgICAgYW5zd2VycyA6IFtcclxuICAgICAgICAgICAgICAgIC8vIHZhbHVlIDoge3RydWUsIGZhbHNlfSwgdGV4dFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwucm91bmRzLnB1c2gocm91bmQpO1xyXG4gICAgICAgIHJldHVybiByb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICBhZGRDYXRlZ29yeVJvdW5kKCkge1xyXG4gICAgICAgIGxldCByb3VuZCA9IHtcclxuICAgICAgICAgICAgdHlwZTogTW9kZWwucXVlc3Rpb25UeXBlLkNBVEVHT1JZLFxyXG4gICAgICAgICAgICBjb2x1bW46IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldID0ge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBjZWxsOiBbXVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldLmNlbGxbal0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IChqICsgMSkgKiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcTogXCJcIixcclxuICAgICAgICAgICAgICAgICAgICBhOiBcIlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5wdXNoKHJvdW5kKTtcclxuICAgICAgICByZXR1cm4gcm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHJvdW5kQ291bnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgaW5jcmVhc2VWYWx1ZSgpIHtcclxuICAgICAgICBsZXQgcm91bmQgPSB0aGlzLmdldFJvdW5kKCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgNTsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICByb3VuZC5jb2x1bW5baV0uY2VsbFtqXS52YWx1ZSAqPSAyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRlY3JlYXNlVmFsdWUoKSB7XHJcbiAgICAgICAgbGV0IHJvdW5kID0gdGhpcy5nZXRSb3VuZCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldLmNlbGxbal0udmFsdWUgLz0gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuTW9kZWwucXVlc3Rpb25UeXBlID0ge1xyXG4gICAgQ0FURUdPUlkgOiBcImNob2ljZVwiLFxyXG4gICAgTVVMVElQTEVfQ0hPSUNFIDogXCJtdWx0aXBsZV9jaG9pY2VcIlxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb2RlbDsiLCJjb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcbnJlcXVpcmUoXCIuL0NoZWNrQm94LmpzXCIpO1xyXG5cclxuY2xhc3MgTXVsdGlwbGVDaG9pY2VQYW5lIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XHJcblxyXG4gICAgc2V0TW9kZWwobW9kZWwpe1xyXG4gICAgICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBjb25uZWN0ZWRDYWxsYmFjaygpe1xyXG4gICAgICAgIGF3YWl0IHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYW5zd2VyID4gbmlkZ2V0LXRleHRcIikpe1xyXG4gICAgICAgICAgICBlbGVtZW50LmZpdFRleHQubG9jayA9IFwidmhcIjtcclxuICAgICAgICAgICAgLy8gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdHh0TGlzdGVuZXIpO1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZXZlbnQpPT50aGlzLnR4dExpc3RlbmVyKGV2ZW50KSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHR4dExpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxMyl7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZXZlbnQudGFyZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1pbmRleFwiKTtcclxuICAgICAgICAgICAgaW5kZXggPSBwYXJzZUludChpbmRleCk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA+PSA1KXtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5ibHVyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBgbmlkZ2V0LXRleHRbZGF0YS1pbmRleD1cIiR7aW5kZXggKyAxfVwiXWA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG1vZGVsW2luZGV4XSA9IHtcclxuICAgICAgICAgICAgICAgIGNvcnJlY3QgOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgdGV4dCA6IHRoaXMucXVlcnlTZWxlY3RvcihgbmlkZ2V0LXRleHRbZGF0YS1pbmRleD1cIiR7aW5kZXh9XCJdYCkudGV4dFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGV2ZW50LnRhcmdldC5maXRUZXh0Lm5vdGlmeSgxLCAxKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbXVsdGlwbGUtY2hvaWNlLXBhbmUnLCBNdWx0aXBsZUNob2ljZVBhbmUpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE11bHRpcGxlQ2hvaWNlUGFuZTsiLCJjb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcblxyXG5jbGFzcyBUZXh0VXBkYXRlIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IodGV4dCkge1xyXG4gICAgICAgIHN1cGVyKCd0ZXh0LXVwZGF0ZScsXHJcbiAgICAgICAgICAgIHtkZXRhaWwgOiB7dGV4dCA6IHRleHR9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEJvYXJkQ2xpY2sgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcignYnV0dG9uLWJvYXJkJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFF1ZXN0aW9uQ2xpY2sgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcignYnV0dG9uLXF1ZXN0aW9uJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEFuc3dlckNsaWNrIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoJ2J1dHRvbi1hbnN3ZXInKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUXVlc3Rpb25QYW5lIGV4dGVuZHMgTmlkZ2V0RWxlbWVudHtcclxuXHJcbiAgICBhc3luYyByZWFkeSgpe1xyXG4gICAgICAgIGF3YWl0IHN1cGVyLnJlYWR5KCk7XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LWJvYXJkXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEJvYXJkQ2xpY2soKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LXF1ZXN0aW9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFF1ZXN0aW9uQ2xpY2soKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LWFuc3dlclwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBBbnN3ZXJDbGljaygpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpLmZvY3VzKCkpO1xyXG5cclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjdGV4dC1jb250ZW50c1wiKS5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCBhc3luYyAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpLnRleHQ7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgVGV4dFVwZGF0ZSh0ZXh0LnRyaW0oKSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyKCl7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiLnRleHQtY29udGVudHNcIikudGV4dCA9IFwiXCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGV4dCh0ZXh0KXtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dC1jb250ZW50c1wiKS50ZXh0ID0gdGV4dDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gYnV0dG9uIHsncXVlc3Rpb24nLCAnYW5zd2VyJ31cclxuICAgICAqL1xyXG4gICAgaGlnaGxpZ2h0KGJ1dHRvbil7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlIG9mIHRoaXMucXVlcnlTZWxlY3RvckFsbChgLnNlbGVjdGVkYCkpIGVsZS5jbGFzc0xpc3QucmVtb3ZlKFwic2VsZWN0ZWRcIik7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKGAjc2hvdy0ke2J1dHRvbn1gKS5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIik7XHJcbiAgICB9XHJcbn1cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ3F1ZXN0aW9uLXBhbmUnLCBRdWVzdGlvblBhbmUpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXN0aW9uUGFuZTtcclxuXHJcblxyXG5cclxuIiwiXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgLy8gVGhlIEJyb3dzZXIgQVBJIGtleSBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuXHJcbiAgICBkZXZlbG9wZXJLZXkgOiAnQUl6YVN5QUJjZExtVDZISF83R284MnFfSUJHSTNqbTZVTDR3NFEwJyxcclxuXHJcbiAgICAvLyBUaGUgQ2xpZW50IElEIG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS4gUmVwbGFjZSB3aXRoIHlvdXIgb3duIENsaWVudCBJRC5cclxuICAgIGNsaWVudElkIDogXCIxNTg4MjMxMzQ2ODEtOThiZ2thbmdvbHRrNjM2dWtmOHBvZmVpczdwYTdqYmsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb21cIixcclxuXHJcbiAgICAvLyBSZXBsYWNlIHdpdGggeW91ciBvd24gcHJvamVjdCBudW1iZXIgZnJvbSBjb25zb2xlLmRldmVsb3BlcnMuZ29vZ2xlLmNvbS5cclxuICAgIGFwcElkIDogXCIxNTg4MjMxMzQ2ODFcIixcclxuXHJcbiAgICAvLyBBcnJheSBvZiBBUEkgZGlzY292ZXJ5IGRvYyBVUkxzIGZvciBBUElzIHVzZWQgYnkgdGhlIHF1aWNrc3RhcnRcclxuICAgIGRpc2NvdmVyeURvY3MgOiBbXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9kaXNjb3ZlcnkvdjEvYXBpcy9kcml2ZS92My9yZXN0XCJdLFxyXG5cclxuICAgIC8vIFNjb3BlIHRvIHVzZSB0byBhY2Nlc3MgdXNlcidzIERyaXZlIGl0ZW1zLlxyXG4gICAgc2NvcGU6IFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9kcml2ZS5maWxlXCJcclxufSJdfQ==
