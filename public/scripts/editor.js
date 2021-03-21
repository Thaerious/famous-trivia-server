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
            }, 100);
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
        await this.ready();
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
    setup();
}

async function setup(){
    let start = new Date();
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

    let end = new Date();
    let time = end - start;
    console.log("Load Time " + time + " ms");
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

class ValueUpadate extends  CustomEvent{
    constructor(value) {
        super('value-update',
            {detail : {value : value}}
        );
    }
}

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
        this.setAttribute(CheckBox.CHECKED_ATTRIBUTE, value);
        this.dispatchEvent(new ValueUpadate(value));
    }
}

CheckBox.CHECKED_ATTRIBUTE = "checked";
window.customElements.define('check-box', CheckBox);
module.exports = CheckBox;
},{"@Thaerious/nidget":22}],26:[function(require,module,exports){
const Model = require("./Model.js");
const DOM = {/* see EditorPane.constructor */};

class MCAnswerCtrl {
    static run(model, saveCB) {
        MCAnswerCtrl.model  = model;
        MCAnswerCtrl.saveCB = saveCB;

        DOM.multipleChoicePane.show();

        for (let i = 0; i < 6; i++) {
            DOM.multipleChoicePane.setText(i, model.answers[i].text);
            DOM.multipleChoicePane.setChecked(i, model.answers[i].isTrue);
        }

        DOM.triangleRight.addEventListener("click", MCAnswerCtrl.cleanup);
        DOM.triangleLeft.addEventListener("click", MCAnswerCtrl.cleanup);
        DOM.multipleChoicePane.addEventListener("text-update", MCAnswerCtrl.textList);
        DOM.multipleChoicePane.addEventListener("value-update", MCAnswerCtrl.valueList);
        DOM.multipleChoicePane.addEventListener("button-question", MCAnswerCtrl.questList);
    }

    static textList(event) {
        let index = parseInt(event.detail.index);
        MCAnswerCtrl.model.answers[index].text = event.detail.text;
        MCAnswerCtrl.saveCB();
    }

    static valueList(event) {
        let index = parseInt(event.detail.index);
        MCAnswerCtrl.model.answers[index].isTrue = event.detail.value;
        MCAnswerCtrl.saveCB();
    }

    static questList(event) {
        MCAnswerCtrl.saveCB();
        MCAnswerCtrl.cleanup();
        MCQuestionCtrl.run(MCAnswerCtrl.model, MCAnswerCtrl.saveCB);
    }

    static cleanup() {
        DOM.multipleChoicePane.hide();
        DOM.multipleChoicePane.removeEventListener("text-update", MCAnswerCtrl.textList);
        DOM.multipleChoicePane.removeEventListener("value-update", MCAnswerCtrl.valueList);
        DOM.multipleChoicePane.removeEventListener("button-question", MCAnswerCtrl.questList);
        DOM.triangleRight.removeEventListener("click", MCAnswerCtrl.cleanup);
        DOM.triangleLeft.removeEventListener("click", MCAnswerCtrl.cleanup);
    }
}

class MCQuestionCtrl {
    static run(model, saveCB) {
        MCQuestionCtrl.model  = model;
        MCQuestionCtrl.saveCB = saveCB;

        DOM.questionPane.setText(model.question);
        DOM.questionPane.show();
        DOM.questionPane.boardButton = false;
        DOM.questionPane.highlight('question')

        DOM.triangleRight.addEventListener("click", MCQuestionCtrl.cleanup);
        DOM.triangleLeft.addEventListener("click", MCQuestionCtrl.cleanup);
        DOM.questionPane.addEventListener("text-update", MCQuestionCtrl.textList);
        DOM.questionPane.addEventListener("button-answer", MCQuestionCtrl.answerList);
    }

    static textList(event) {
        MCQuestionCtrl.model.question = event.detail.text;
        MCQuestionCtrl.saveCB();
    }

    static answerList() {
        MCQuestionCtrl.cleanup();
        MCAnswerCtrl.run(MCQuestionCtrl.model, MCQuestionCtrl.saveCB);
    }

    static cleanup() {
        DOM.questionPane.hide();
        DOM.questionPane.removeEventListener("text-update", MCQuestionCtrl.textList);
        DOM.questionPane.removeEventListener("button-answer", MCQuestionCtrl.answerList);
        DOM.triangleRight.removeEventListener("click", MCQuestionCtrl.cleanup);
        DOM.triangleLeft.removeEventListener("click", MCQuestionCtrl.cleanup);
    }
}

class QuestionPaneCtrl {
    /**
     * @param model - the question model object
     * @param field - which model field to read/write from {'a', 'q'}
     * @param saveCB - call this method to save the model
     */
    static run(field, model, saveCB, closeCB) {
        QuestionPaneCtrl.model   = model ?? QuestionPaneCtrl.model;
        QuestionPaneCtrl.field   = field ?? QuestionPaneCtrl.field;
        QuestionPaneCtrl.saveCB  = saveCB ?? QuestionPaneCtrl.saveCB;
        QuestionPaneCtrl.closeCB = closeCB ?? QuestionPaneCtrl.closeCB;

        DOM.questionPane.setText(QuestionPaneCtrl.model[QuestionPaneCtrl.field]);
        DOM.questionPane.boardButton = true;
        DOM.questionPane.show();
        DOM.gameBoard.hide();

        DOM.questionPane.addEventListener("text-update", QuestionPaneCtrl.textList);
        DOM.questionPane.addEventListener("button-board", QuestionPaneCtrl.boardList);
        DOM.questionPane.addEventListener(`button-${QuestionPaneCtrl.field}`, QuestionPaneCtrl.questionList);
        DOM.questionPane.highlight(QuestionPaneCtrl.field);
    }

    static textList(event) {
        QuestionPaneCtrl.model[QuestionPaneCtrl.field] = event.detail.text;
        QuestionPaneCtrl.saveCB();
    }

    static boardList(event) {
        QuestionPaneCtrl.cleanup();
        QuestionPaneCtrl.closeCB();
    }

    static answerList(event) {
        QuestionPaneCtrl.cleanup();
        QuestionPaneCtrl.run('answer');
    }

    static questionList(vent) {
        QuestionPaneCtrl.cleanup();
        QuestionPaneCtrl.run('question');
    }

    static cleanup() {
        DOM.questionPane.removeEventListener("text-update", QuestionPaneCtrl.textList);
        DOM.questionPane.removeEventListener("button-board", QuestionPaneCtrl.boardList);
        DOM.questionPane.removeEventListener("button-answer", QuestionPaneCtrl.answerList);
        DOM.questionPane.removeEventListener("button-question", QuestionPaneCtrl.questionList);
    }
}

class EditorPane {
    constructor(model) {
        this.model = model;

        DOM.multipleChoicePane = document.querySelector("#multiple-choice-pane");
        DOM.triangleRight = document.querySelector("#triangle-right");
        DOM.triangleLeft = document.querySelector("#triangle-left");
        DOM.roundLabel = document.querySelector("#round-number");
        DOM.gameName = document.querySelector("#game-name");
        DOM.gameBoard = document.querySelector("#game-board");
        DOM.questionPane = document.querySelector("#question-pane")

        document.querySelector("#menu-remove-round").addEventListener("click", () => {
            this.model.removeRound();
            this.updateTriangleView();
            this.onSave();
            this.updateView();
        });

        document.querySelector("#menu-home-screen").addEventListener("click", () => {
            location.href = "home.html";
        });

        document.querySelector("#menu-value-plus").addEventListener("click", () => {
            this.model.increaseValue();
            this.onSave();
            this.updateView();
        });

        document.querySelector("#menu-value-minus").addEventListener("click", () => {
            this.model.decreaseValue();
            this.onSave();
            this.updateView();
        });

        DOM.triangleRight.addEventListener("click", () => {
            this.model.incrementRound();
            this.updateView();
        });

        DOM.triangleLeft.addEventListener("click", () => {
            this.model.decrementRound();
            this.updateView();
        });

        DOM.gameName.addEventListener("keydown", (event) => {
            if (event.which === 13) {
                this.updateName();
                event.stopPropagation();
                event.preventDefault();
                document.querySelector("#game-board-container").focus();
                return false;
            }
        });

        document.querySelector("#menu-add-category").addEventListener("click", () => {
            this.model.addCategoryRound();
            this.updateView();
            this.onSave();
        });

        document.querySelector("#menu-add-multiple-choice").addEventListener("click", () => {
            this.model.addMultipleChoiceRound();
            this.updateView();
            this.onSave();
        });

        // game-board change category text
        DOM.gameBoard.addEventListener("header-update", event => {
            let col = event.detail.col;
            this.model.getColumn(col).category = event.detail.value;
            this.model.getColumn(col).fontSize = event.detail.fontSize;
            this.onSave();
        });

        // game-board select cell
        DOM.gameBoard.addEventListener("cell-select", event => {
            let row = event.detail.row;
            let col = event.detail.col;
            this.hideNavigation();

            QuestionPaneCtrl.run(
                'question',
                this.model.getCell(row, col),
                () => this.onSave(),
                () => this.updateView()
            );
        });

        this.updateView();
    }

    onSave() {
        // override me
    }

    updateName() {
        // override me
    }

    hideNavigation() {
        DOM.triangleLeft.classList.add("hidden");
        DOM.triangleRight.classList.add("hidden");
    }

    updateView(model) {
        model = model ?? this.model;
        this.updateTriangleView();

        DOM.questionPane.hide();
        DOM.gameBoard.hide();
        DOM.multipleChoicePane.hide();

        if (model.getRound().type === Model.questionType.CATEGORY) this.categoryView(model);
        if (model.getRound().type === Model.questionType.MULTIPLE_CHOICE) this.multipleChoiceView(model);
    }

    updateTriangleView() {
        DOM.triangleLeft.classList.remove("hidden");
        DOM.triangleRight.classList.remove("hidden");
        if (this.model.currentRound === 0) DOM.triangleLeft.classList.add("hidden");
        if (this.model.currentRound >= this.model.roundCount - 1) DOM.triangleRight.classList.add("hidden");
        DOM.roundLabel.textContent = "Round " + (this.model.currentRound + 1);
    }

    multipleChoiceView(model) {
        MCQuestionCtrl.run(
            this.model.getRound(),
            () => this.onSave()
        );
    }

    categoryView(model) {
        DOM.gameBoard.show();

        for (let col = 0; col < 6; col++) {
            let column = model.getColumn(col);

            DOM.gameBoard.getHeader(col).fitText.lock = "vh";
            DOM.gameBoard.setHeader(col, column.category, column.fontSize);

            for (let row = 0; row < 5; row++) {
                DOM.gameBoard.setCell(row, col, column.cell[row].value);
                if (column.cell[row].q === "") DOM.gameBoard.setComplete(row, col, "false");
                else if (column.cell[row].a === "") DOM.gameBoard.setComplete(row, col, "partial");
                else DOM.gameBoard.setComplete(row, col, "true");
            }
        }
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
            answers : []
        };

        for (let i = 0; i < 6; i++){
            round.answers[i] = {
                text : "",
                isTrue : false
            }
        }

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

    incrementRound(){
        this.currentRound++;
        if (this.currentRound >= this.roundCount) this.currentRound = this.roundCount - 1;
    }

    decrementRound(){
        this.currentRound--;
        if (this.currentRound < 0) this.currentRound = 0
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

class TextUpdate extends  CustomEvent{
    constructor(index, text) {
        super('text-update',
            {detail : {index : index, text : text}}
        );
    }
}

class ValueUpdate extends  CustomEvent{
    constructor(index, value) {
        super('value-update',
            {detail : {index : index, value : value}}
        );
    }
}

class QuestionClick extends  CustomEvent{
    constructor() {
        super('button-question');
    }
}

class MultipleChoicePane extends NidgetElement {

    setModel(model){
        this.model = model;
    }

    async ready(){
        await super.connectedCallback();
        for (let element of this.querySelectorAll(".answer > nidget-text")){
            element.fitText.lock = "vh";
            element.addEventListener("keypress", (event)=>this.txtListener(event));
            element.addEventListener("blur", (event)=>{
                let index = event.target.getAttribute("data-index");
                let text = this.querySelector(`nidget-text[data-index="${index}"]`).text;
                this.dispatchEvent(new TextUpdate(index, text))
            });
        }

        for (let element of this.querySelectorAll("check-box")){
            element.addEventListener("value-update", (event)=>{
                let index = window.getComputedStyle(event.target).getPropertyValue("--index");
                let value = event.detail.value;
                this.dispatchEvent(new ValueUpdate(index, value));
            });
        }

        this.querySelector("#show-question").addEventListener("click", ()=>{
            this.dispatchEvent(new QuestionClick());
        });
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

            return false;
        }
        event.target.fitText.notify(1, 1);
        return true;
    }

    /**
     * @param button {'question', 'answer'}
     */
    highlight(button){
        for (let ele of this.querySelectorAll(`.selected`)) ele.classList.remove("selected");
        this.querySelector(`#show-${button}`).classList.add("selected");
    }

    setText(index, text){
        this.querySelector(`nidget-text[data-index="${index}"]`).text = text;
    }

    setChecked(index, value){
        this.querySelector(`check-box[data-index="${index}"]`).checked = value;
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
     * @param button {'question', 'answer'}
     */
    highlight(button){
        for (let ele of this.querySelectorAll(`.selected`)) ele.classList.remove("selected");
        this.querySelector(`#show-${button}`).classList.add("selected");
    }

    set boardButton(value){
        if (value){
            this.querySelector("#show-board").show();
        }else{
            this.querySelector("#show-board").hide();
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0Fic3RyYWN0TW9kZWwuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0RyYWdIYW5kbGVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9GaWxlT3BlcmF0aW9ucy5qcyIsIi4uLy4uL25pZGdldC9zcmMvSW50ZXJmYWNlcy5qcyIsIi4uLy4uL25pZGdldC9zcmMvTW91c2VVdGlsaXRpZXMuanMiLCIuLi8uLi9uaWRnZXQvc3JjL05pZGdldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0RWxlbWVudC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0U3R5bGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL1RyYW5zZm9ybWVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b24uanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblNldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU3RhdGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldENvbnRhaW5lci5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SFRNTEltYWdlLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRJbWFnZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0VGV4dC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJhZy5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJvcC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvTW91c2UuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL01vdmFibGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL1Jlc2l6ZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvcHJvamVjdEZpbGUuanMiLCJzcmMvY2xpZW50L2VkaXRvci5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9BdXRoZW50aWNhdGUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvQ2hlY2tCb3guanMiLCJzcmMvY2xpZW50L21vZHVsZXMvRWRpdG9yUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9GaWxlT3BzLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0dhbWVCb2FyZC5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9NZW51LmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL01vZGVsLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL011bHRpcGxlQ2hvaWNlUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9RdWVzdGlvblBhbmUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvZ29vZ2xlRmllbGRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuY2xhc3MgQWJzdHJhY3RNb2RlbCB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGFic3RyYWN0IG1vZGVsLiAgSWYgZGVsZWdhdGUgaXMgcHJvdmlkZWQgdGhlbiBhbGwgbGlzdGVuZXJcbiAgICAgKiBhZGRzIGFuZCBub3RpZmllcyBhcmUgcGVyZm9ybWVkIG9uIHRoZSBkZWxlZ2F0ZSBsaXN0ZW5lciBjb2xsZWN0aW9uLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZGVsZWdhdGVcbiAgICAgKiBAcmV0dXJucyB7bm0kX0Fic3RyYWN0TW9kZWwuQWJzdHJhY3RNb2RlbH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHRoaXM7XG4gICAgICAgIHRoaXMuYWJzdHJhY3RNb2RlbExpc3RlbmVycyA9IFtdOyAgICAgICAgXG4gICAgfVxuXG4gICAgZ2V0RGVsZWdhdGUoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVsZWdhdGU7XG4gICAgfVxuICAgIFxuICAgIHNldERlbGVnYXRlKGRlbGVnYXRlID0gbnVsbCl7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmFic3RyYWN0TW9kZWxMaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUgPSBkZWxlZ2F0ZS5kZWxlZ2F0ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuZGVsZWdhdGUgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmRlZmluZWQgZGVsZWdhdGVcIik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYWRkTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gXCJvYmplY3RcIil7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIEFic3RyYWN0TW9kZWwgbGlzdGVuZXIgdHlwZTogXCIgKyB0eXBlb2YgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGVsZWdhdGUuYWJzdHJhY3RNb2RlbExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsIGFzIG5vdGlmeUxpc3RlbmVycyhtZXRob2ROYW1lLCBbbWV0aG9kQXJndW1lbnQwLCAuLi4gbWV0aG9kQXJndW1lbnROXSlcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1ldGhvZFxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5TGlzdGVuZXJzKG1ldGhvZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVWRU5UIFwiICsgdGhpcy5kZWxlZ2F0ZS5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgKyBtZXRob2QpO1xuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5zaGlmdC5hcHBseShhcmd1bWVudHMpO1xuICAgICAgICBsZXQgZXZlbnQgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3VtZW50cyxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcyxcbiAgICAgICAgICAgIGxpc3RlbmVyczogW11cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5sYXN0RXZlbnQgPSBldmVudDtcbiAgICAgICAgd2luZG93Lm5FdmVudHMucHVzaCh3aW5kb3cubGFzdEV2ZW50KTtcblxuICAgICAgICBmb3IgKGxldCBsaXN0ZW5lciBvZiB0aGlzLmRlbGVnYXRlLmFic3RyYWN0TW9kZWxMaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lclttZXRob2RdKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIiArIFwiICsgbGlzdGVuZXIuY29uc3RydWN0b3IubmFtZSArIFwiIFwiICsgbWV0aG9kKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cubGFzdEV2ZW50Lmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUpOyAgICAgICBcbiAgICAgICAgICAgICAgICBhd2FpdCBsaXN0ZW5lclttZXRob2RdLmFwcGx5KGxpc3RlbmVyLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpc3RlbmVyW0Fic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyXSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCIgKyBcIiArIGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUgKyBcIiBcIiArIEFic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cubGFzdEV2ZW50Lmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUpOyAgICAgICBcbiAgICAgICAgICAgICAgICBhd2FpdCBsaXN0ZW5lcltBYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lcl0uYXBwbHkobGlzdGVuZXIsIHdpbmRvdy5sYXN0RXZlbnQpOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuQWJzdHJhY3RNb2RlbC5kZWZhdWx0TGlzdGVuZXIgPSBcIm5pZGdldExpc3RlbmVyXCI7XG53aW5kb3cubkV2ZW50cyA9IFtdO1xubW9kdWxlLmV4cG9ydHMgPSBBYnN0cmFjdE1vZGVsOyIsIid1c2Ugc3RyaWN0Jztcbi8qKlxuICogU2luZ2xldG9uIGNsYXNzIHRvIHByb3ZpZGluZyBmdW5jdGlvbmFsaXR5IHRvIERyYWdOaWRnZXRzIGFuZCBEcm9wTmlkZ2V0cy5cbiAqIEl0IHN0b3JlcyB0aGUgTmlkZ2V0IGN1cnJlbnRseSBiZWluZyBkcmFnZ2VkLlxuICovXG5jbGFzcyBEcmFnSGFuZGxlcntcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLm92ZXIgPSBbXTtcbiAgICB9XG4gICAgXG4gICAgcHVzaE92ZXIobmlkZ2V0KXtcbiAgICAgICAgaWYgKHRoaXMub3ZlckhhcyhuaWRnZXQpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMub3Zlci5wdXNoKG5pZGdldCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBcbiAgICByZW1vdmVPdmVyKG5pZGdldCl7XG4gICAgICAgIGlmICghdGhpcy5vdmVySGFzKG5pZGdldCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhpcy5vdmVyLnNwbGljZSh0aGlzLm92ZXIuaW5kZXhPZihuaWRnZXQpLCAxKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSAgICBcbiAgICBcbiAgICBvdmVySGFzKG5pZGdldCl7XG4gICAgICAgIHJldHVybiB0aGlzLm92ZXIuaW5kZXhPZihuaWRnZXQpICE9PSAtMTtcbiAgICB9XG4gICAgXG4gICAgc2V0KG5pZGdldCl7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5pZGdldDtcbiAgICB9XG4gICAgXG4gICAgZ2V0KCl7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQ7XG4gICAgfVxuICAgIFxuICAgIGhhcygpe1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50ICE9PSBudWxsO1xuICAgIH1cbiAgICBcbiAgICBjbGVhcigpe1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xuICAgIH1cbiAgICBcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoKXtcbiAgICAgICAgcmV0dXJuIERyYWdIYW5kbGVyLmluc3RhbmNlO1xuICAgIH0gICAgXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IERyYWdIYW5kbGVyKCk7XG5cbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKiBnbG9iYWwgVXRpbGl0eSAqL1xuY2xhc3MgRmlsZU9wZXJhdGlvbnMge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIGEgZmlsZSAodXJsKS4gIE1hcCB2YXJpYWJsZXMgKCR7Li4ufSkgdG8gXG4gICAgICogYSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHVybFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgbG9hZE5pZGdldCh1cmwsIG1hcCl7ICAgICAgICBcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudCh1cmwsIG1hcCk7XG4gICAgICAgIHJldHVybiBuZXcgTmlkZ2V0RWxlbWVudChlbGVtZW50KTtcbiAgICB9ICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIGEgZmlsZSAodXJsKS4gIE1hcCB2YXJpYWJsZXMgKCR7Li4ufSkgdG8gXG4gICAgICogYSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHVybFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgbG9hZERPTUVsZW1lbnQodXJsLCBtYXAgPSBuZXcgTWFwKCkpeyAgICAgICAgXG4gICAgICAgIGlmIChtYXAgaW5zdGFuY2VvZiBNYXAgPT09IGZhbHNlKSBtYXAgPSBGaWxlT3BlcmF0aW9ucy5vYmplY3RUb01hcChtYXApOyAgICAgICBcbiAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRVUkwodXJsKTtcbiAgICAgICAgcmV0dXJuIEZpbGVPcGVyYXRpb25zLnN0cmluZ1RvRE9NRWxlbWVudCh0ZXh0LCBtYXApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIHRleHQuXG4gICAgICogQHBhcmFtIHt0eXBlfSB0ZXh0XG4gICAgICogQHBhcmFtIHt0eXBlfSBtYXBcbiAgICAgKiBAcmV0dXJucyB7bm9kZXxGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudC5kb21FbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBzdHJpbmdUb0RPTUVsZW1lbnQodGV4dCwgbWFwID0gbmV3IE1hcCgpKXtcbiAgICAgICAgLyogcmVwbGFjZSB2YXJpYWJsZXMgd2l0aCB2YWx1ZXMgKi9cbiAgICAgICAgZm9yIChsZXQga2V5IG9mIG1hcC5rZXlzKCkpeyAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHZhbHVlID0gbWFwLmdldChrZXkpO1xuICAgICAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdPyR7a2V5fVt9XWAsIGBnYCk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCB2YWx1ZSk7ICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgLyogcmVwbGFjZSB1bmZpbGxlZCB2YXJpYWJsZXMgd2l0aCBlbXB0eSAqL1xuICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGBbJF1be11bXn1dKlt9XWAsIGBnYCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsIFwiXCIpOyBcblxuICAgICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IHRleHQ7XG4gICAgICAgIGxldCBkb21FbGVtZW50ID0gbnVsbDtcbiAgICAgICAgY29uc29sZS5sb2coZWxlbWVudCk7XG5cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgc3RhdGljIG9iamVjdFRvTWFwKG9iamVjdCl7XG4gICAgICAgIGxldCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGZvciAobGV0IGZpZWxkIGluIG9iamVjdCl7ICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9iamVjdFtmaWVsZF0gPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIG9iamVjdFtmaWVsZF0gPT09IFwibnVtYmVyXCIpe1xuICAgICAgICAgICAgICAgIG1hcC5zZXQoZmllbGQsIG9iamVjdFtmaWVsZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuXG4gICAgXG5cbiAgICAvKlxuICAgICAqIFRyYW5zZmVyIGNvbnRlbnRzIG9mICdmaWxlbmFtZScgZnJvbSBzZXJ2ZXIgdG8gY2xpZW50LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHN1Y2Nlc3NDYWxsYmFja1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGVycm9yQ2FsbGJhY2tcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBjb250ZW50cyBvZiBmaWxlXG4gICAgICovXG4gICAgc3RhdGljIGdldFVSTCh1cmwpIHtcbiAgICAgICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoeGh0dHAucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGh0dHAuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAgOiB4aHR0cCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMgOiB4aHR0cC5zdGF0dXMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgOiB4aHR0cC5yZXNwb25zZVRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsIDogdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICAgICAgICAgIHhodHRwLnNlbmQobnVsbCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSB0ZXh0LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gdGV4dFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgZ2V0RmlsZSh1cmwsIG1hcCA9IG5ldyBNYXAoKSl7XG4gICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0VVJMKHVybCk7XG5cbiAgICAgICAgLyogcmVwbGFjZSB2YXJpYWJsZXMgd2l0aCB2YWx1ZXMgKi9cbiAgICAgICAgZm9yIChsZXQga2V5IG9mIG1hcC5rZXlzKCkpe1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gbWFwLmdldChrZXkpO1xuICAgICAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdPyR7a2V5fVt9XWAsIGBnYCk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiByZXBsYWNlIHVuZmlsbGVkIHZhcmlhYmxlcyB3aXRoIGVtcHR5ICovXG4gICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XVtefV0qW31dYCwgYGdgKTtcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgXCJcIik7XG5cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBUcmFuc2ZlciBjb250ZW50cyBvZiAnZmlsZW5hbWUnIGZyb20gc2VydmVyIHRvIGNsaWVudCB1c2luZyBjdXJyZW50IHdpbmRvdyBsb2NhdGlvbi5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdWNjZXNzQ2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcnJvckNhbGxiYWNrXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0TG9jYWwoZmlsZW5hbWUpIHtcbiAgICAgICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICAgICAgdmFyIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmICsgXCIvXCIgKyBmaWxlbmFtZTtcblxuICAgICAgICAgICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh4aHR0cC5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHR0cC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh4aHR0cC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHhodHRwLnN0YXR1cywgeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICAgICAgICAgIHhodHRwLnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShjYWxsYmFjayk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIENhdXNlICd0ZXh0JyB0byBiZSBzYXZlZCBhcyAnZmlsZW5hbWUnIGNsaWVudCBzaWRlLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZmlsZW5hbWUgVGhlIGRlZmF1bHQgZmlsZW5hbWUgdG8gc2F2ZSB0aGUgdGV4dCBhcy5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHRleHQgVGhlIHRleHQgdG8gc2F2ZSB0byBmaWxlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHN0YXRpYyBzYXZlVG9GaWxlKHRleHQsIGZpbGVuYW1lKSB7XG4gICAgICAgIGxldCBhbmNob3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGxldCBkYXRhID0gXCJ0ZXh0O2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUklDb21wb25lbnQodGV4dCk7XG4gICAgICAgIGFuY2hvci5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIFwiZGF0YTpcIiArIGRhdGEpO1xuICAgICAgICBhbmNob3Iuc2V0QXR0cmlidXRlKFwiZG93bmxvYWRcIiwgZmlsZW5hbWUpO1xuICAgICAgICBhbmNob3IuY2xpY2soKTtcbiAgICB9XG59XG5cbkZpbGVPcGVyYXRpb25zLk5vZGVUeXBlID0ge1xuICAgIEVMRU1FTlQgOiAxLFxuICAgIEFUVFJJQlVURSA6IDIsXG4gICAgVEVYVCA6IDMsIFxuICAgIENEQVRBU0VDVElPTiA6IDQsXG4gICAgRU5USVRZUkVGRVJOQ0UgOiA1LFxuICAgIEVOVElUWSA6IDYsXG4gICAgUFJPQ0VTU0lOR0lOU1RSVUNUSU9OIDogNyxcbiAgICBDT01NRU5UIDogOCxcbiAgICBET0NVTUVOVCA6IDksXG4gICAgRE9DVU1FTlRUWVBFIDogMTAsXG4gICAgRE9DVU1FTlRGUkFHTUVOVCA6IDExLFxuICAgIE5PVEFUSU9OIDogMTJcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wZXJhdGlvbnM7IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbW91c2UgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9Nb3VzZVwiKSwgXG4gICAgZHJhZyA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL0RyYWdcIiksXG4gICAgZHJvcCA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL0Ryb3BcIiksXG4gICAgbW92YWJsZSA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL01vdmFibGVcIiksXG4gICAgcmVzaXplIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvUmVzaXplXCIpXG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFNpbmdsdG9uIGNsYXNzIHRvIGFkZCBmdW5jdGlvbmFsaXR5IHRvIHRoZSBtb3VzZS5cbiAqL1xuY2xhc3MgTW91c2VVdGlsaXRpZXMge1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5sYXN0WCA9IDA7XG4gICAgICAgIHRoaXMubGFzdFkgPSAwO1xuICAgIH1cbiAgICBcbiAgICBpc1VuZGVyKGV2ZW50LCBlbGVtZW50KSB7XG4gICAgICAgIGxldCB4ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG5cbiAgICAgICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50ID09PSBlbGVtZW50KSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGdldFVuZGVyKGV2ZW50KSB7XG4gICAgICAgIGxldCB4ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgICB9XG5cbiAgICBzZXQgZWxlbWVudChlbGVtZW50KXtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWRFbGVtZW50ICE9PSBudWxsKXtcbiAgICAgICAgICAgIHRoaXMuZGV0YWNoRWxlbWVudCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZWxlbWVudCB8fCBlbGVtZW50ID09PSBudWxsIHx8IGVsZW1lbnQgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aGlzLmRldGFjaEVsZW1lbnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoRWxlbWVudChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgZWxlbWVudCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRhY2hlZEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGFuIGVsZW1lbnQuICBJZiB0aGUgZWxlbWVudCBkb2Vzbid0IGhhdmUgYSBwYXJlbnQgaXQgd2lsbCBiZVxuICAgICAqIGF0dGFjaGVkIHRvIHRoZSBkb2N1bWVudCBhbmQgd2lsbCBiZSBkZXRhY2hlZCB3aGVuIGRldGFjaEVsZW1lbnQgaXMgY2FsbGVkLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgYXR0YWNoRWxlbWVudChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgXG4gICAgICAgIGlmIChlbGVtZW50LnBhcmVudCl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGF0dGFjaCBlbGVtZW50IHRvIG1vdXNlIGlmIHRoZSBlbGVtZW50IGhhcyBhIHBhcmVudCBlbGVtZW50LlwiKTtcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZChlbGVtZW50KTtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjsgXG4gICAgICAgIGVsZW1lbnQuc3R5bGUudG9wID0gZXZlbnQuY2xpZW50WSArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gZXZlbnQuY2xpZW50WCArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJub25lXCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIxMDAwMFwiO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5tb3ZlQ2FsbEJhY2sgPSAoZXZlbnQpPT50aGlzLm9uTW91c2VNb3ZlKGV2ZW50KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3ZlQ2FsbEJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBsaXN0ZW5lcnMgZnJvbSB0aGUgYXR0YWNoZWQgZWxlbWVudCwgZG8gbm90IHJlbW92ZSBpdCBmcm9tIHRoZVxuICAgICAqIGRvY3VtZW50LlxuICAgICAqIEByZXR1cm5zIHt0eXBlfVxuICAgICAqL1xuICAgIGRldGFjaEVsZW1lbnQoKXtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWRFbGVtZW50ID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdmVDYWxsQmFjayk7ICAgICAgICBcbiAgICAgICAgbGV0IHJ2YWx1ZSA9IHRoaXMuYXR0YWNoZWRFbGVtZW50O1xuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudCA9IG51bGw7ICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChydmFsdWUpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJ2YWx1ZTtcbiAgICB9XG5cbiAgICBvbk1vdXNlTW92ZShldmVudCkgeyAgICAgICAgXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMubGFzdFggPSBldmVudC5jbGllbnRYO1xuICAgICAgICB0aGlzLmxhc3RZID0gZXZlbnQuY2xpZW50WTtcblxuICAgICAgICAvLyBzZXQgdGhlIGVsZW1lbnQncyBuZXcgcG9zaXRpb246XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50LnN0eWxlLnRvcCA9IGV2ZW50LmNsaWVudFkgKyBcInB4XCI7XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50LnN0eWxlLmxlZnQgPSBldmVudC5jbGllbnRYICsgXCJweFwiO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW91c2VVdGlsaXRpZXMoKTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHByZWZpeDogXCJkYXRhLW5pZGdldFwiLFxuICAgIGVsZW1lbnRBdHRyaWJ1dGU6IFwiZGF0YS1uaWRnZXQtZWxlbWVudFwiLFxuICAgIHNyY0F0dHJpYnV0ZTogXCJzcmNcIixcbiAgICB0ZW1wbGF0ZVNyY0F0dHJpYnV0ZTogXCJ0ZW1wbGF0ZS1zcmNcIixcbiAgICBuYW1lQXR0cmlidXRlOiBcIm5hbWVcIixcbiAgICBpbnRlcmZhY2VBdHRyaWJ1dGU6IFwiaW50ZXJmYWNlc1wiLFxuICAgIHRlbXBsYXRlQXR0cmlidXRlOiBcInRlbXBsYXRlXCIsXG4gICAgaW50ZXJmYWNlRGF0YUZpZWxkOiBcImludGVyZmFjZURhdGFcIixcbiAgICBtb2RlbERhdGFGaWVsZDogXCJtb2RlbERhdGFcIixcbiAgICBzdHlsZUF0dHJpYnV0ZTogXCJuaWRnZXQtc3R5bGVcIlxufTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IEZpbGVPcGVyYXRpb25zID0gcmVxdWlyZShcIi4vRmlsZU9wZXJhdGlvbnNcIik7XG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi9OaWRnZXRcIik7XG5jb25zdCBJbnRlcmZhY2VzID0gcmVxdWlyZShcIi4vSW50ZXJmYWNlc1wiKTtcbmNvbnN0IFRyYW5zZm9ybWVyID0gcmVxdWlyZShcIi4vVHJhbnNmb3JtZXJcIik7XG5jb25zdCBOaWRnZXRTdHlsZSA9IHJlcXVpcmUoXCIuL05pZGdldFN0eWxlXCIpO1xuXG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgdzpoIGFzcGVjdCByYXRpbyBhbmQgYWRqdXN0IHRoZSBwcm9wb3J0aW9ucyBhY2NvcmRpbmdseS5cbiAqXG4gKi9cbmNsYXNzIEFzcGVjdFJhdGlve1xuICAgIGNvbnN0cnVjdG9yKG5pZGdldCkge1xuICAgICAgICB0aGlzLm5pZGdldCA9IG5pZGdldDtcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKT0+dGhpcy5vblJlc2l6ZSgpKTtcbiAgICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKHRoaXMubmlkZ2V0KTtcbiAgICAgICAgdGhpcy5wYXJzZVZhbHVlcygpO1xuICAgICAgICB0aGlzLm9uUmVzaXplKCk7XG4gICAgICAgIHRoaXMubG9hZGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0VmFsdWUoKXtcbiAgICAgICAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoQXNwZWN0UmF0aW8uQ1NTX0FUVFJJQlVURSk7XG4gICAgfVxuXG4gICAgcGFyc2VWYWx1ZXMoKXtcbiAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuICAgICAgICBsZXQgc3BsaXQgPSB2YWx1ZS5zcGxpdCgvWyAsO10vZyk7XG5cbiAgICAgICAgZm9yIChsZXQgcyBvZiBzcGxpdCl7XG4gICAgICAgICAgICBpZiAocy5zcGxpdCgvWy06XS8pLmxlbmd0aCA9PT0gMil7XG4gICAgICAgICAgICAgICAgbGV0IHJhdGlvID0gcy5zcGxpdCgvWy06XS8pO1xuICAgICAgICAgICAgICAgIHRoaXMud2lkdGggPSBwYXJzZUludChyYXRpb1swXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBwYXJzZUludChyYXRpb1sxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzID09PSBcImhcIil7XG4gICAgICAgICAgICAgICAgdGhpcy5vblJlc2l6ZSA9ICgpPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5uaWRnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS53aWR0aCA9IChoZWlnaHQgKiB0aGlzLndpZHRoIC8gdGhpcy5oZWlnaHQpICsgXCJweFwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25SZXNpemUoKXtcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5uaWRnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmhlaWdodCA9ICh3aWR0aCAqIHRoaXMuaGVpZ2h0IC8gdGhpcy53aWR0aCkgKyBcInB4XCI7XG4gICAgfVxufVxuXG5Bc3BlY3RSYXRpby5DU1NfQVRUUklCVVRFID0gXCItLW5pZGdldC1hc3BlY3QtcmF0aW9cIjtcblxuLyoqXG4gKiBBIE5pZGdldEVsZW1lbnQgaXMgYSAxOjEgY2xhc3Mtb2JqZWN0OmRvbS1vYmplY3QgcGFpcmluZy4gIEFjdGlvbnMgb24gdGhlIERPTSBcbiAqIG9iamVjdCBzaG91bGQgb25seSBiZSBjYWxsZWQgYnkgdGhlIE5pZGdldEVsZW1lbnQgb2JqZWN0LiAgVGhlIGludGVyZmFjZURhdGFcbiAqIGZpZWxkIGlzIHJlc2VydmVkIGZvciBkYXRhIGZyb20gaW50ZXJmYWNlcy4gIEludGVyZmFjZXMgc2hvdWxkIHB1dCB0aGVpciBcbiAqIGN1c3RvbSBkYXRhIHVuZGVyIFtpbnRlcmZhY2VEYXRhRmllbGRdLltpbnRlcmZhY2VOYW1lXS4gIFRoZSBpbnRlcmZhY2UgZGF0YVxuICogYXR0cmlidXRlIGlzIHNldCB3aXRoIHRoZSBzdGF0aWMgdmFsdWUgTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZC5cbiAqIFxuICogQ2FsbGluZyBtZXRob2RzIG9uIHRoZSBuaWRnZXQgd2lsbCB0cmVhdCBzaGFkb3cgY29udGVudHMgYXMgcmVndWxhciBjb250ZW50cy5cbiAqL1xuY2xhc3MgTmlkZ2V0RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgTmlkZ2V0IGFzc29jaWF0ZWQgd2l0aCAnZWxlbWVudCcuICBBbiBlcnJvciB3aWxsIGJlIHRocm93blxuICAgICAqIGlmIHRoZSAnZWxlbWVudCcgaXMgYWxyZWFkeSBhc3NvY2lhdGVkIHdpdGggYSBOaWRnZXQuXG4gICAgICogXG4gICAgICogRGlzYWJsZWQgY2xhc3MgaW5kaWNhdGVzIHRoaXMgbmlkZ2V0IHdpbGwgaWdub3JlIG1vdXNlIGV2ZW50cy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGVsZW1lbnQgSlF1ZXJ5IHNlbGVjdG9yXG4gICAgICogQHJldHVybiB7bm0kX05pZGdldC5OaWRnZXRFbGVtZW50fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHRlbXBsYXRlSWQpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpc1tOaWRnZXQuaW50ZXJmYWNlRGF0YUZpZWxkXSA9IHt9O1xuICAgICAgICB0aGlzW05pZGdldC5tb2RlbERhdGFGaWVsZF0gPSB7fTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1lciA9IG5ldyBUcmFuc2Zvcm1lcih0aGlzKTtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMgPSB7fTtcblxuICAgICAgICBpZiAodGVtcGxhdGVJZCl7XG4gICAgICAgICAgICB0aGlzLmFwcGx5VGVtcGxhdGUodGVtcGxhdGVJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgICAgY29ubmVjdGVkQ2FsbGJhY2sgaXMgaW52b2tlZCBlYWNoIHRpbWUgdGhlIGN1c3RvbSBlbGVtZW50IGlzIGFwcGVuZGVkIGludG8gYSBkb2N1bWVudC1jb25uZWN0ZWQgZWxlbWVudFxuICAgICAqL1xuICAgIGFzeW5jIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICB0aGlzLnNoYWRvd0NvbnRlbnRzID0gdGhpcztcblxuICAgICAgICAvLyBzZXQgdGhlIGh0bWwgb2YgdGhpcyBlbGVtZW50IHRvIHRoZSBjb250ZW50cyBvZiB0aGUgZmlsZSAobm90IGEgc2hhZG93IGVsZW1lbnQpXG4gICAgICAgIC8vIGFsbCBkYXRhLSBhdHRyaWJ1dGVzIHdpbGwgYmUgdXNlZCB0byBmaWxsIGluICR7fSB2YXJpYWJsZXMgaW4gdGhlIHNvdXJjZSBmaWxlXG4gICAgICAgIC8vIGRvZXNuJ3Qgd29yayBvbiBlZGdlXG4gICAgICAgIGlmICh0aGlzLmhhc0F0dHJpYnV0ZShOaWRnZXQuc3JjQXR0cmlidXRlKSkgYXdhaXQgdGhpcy5yZXRyaWV2ZVNvdXJjZSh0aGlzLmRhdGFBdHRyaWJ1dGVzKCkpO1xuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoTmlkZ2V0LnRlbXBsYXRlU3JjQXR0cmlidXRlKSkgYXdhaXQgdGhpcy5yZXRyaWV2ZVRlbXBsYXRlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgYSBtYXAgb2YgYWxsIGRhdGEgYXR0cmlidXRlc1xuICAgICAqIEByZXR1cm5zIHtNYXA8YW55LCBhbnk+fVxuICAgICAqL1xuICAgIGRhdGFBdHRyaWJ1dGVzKCkge1xuICAgICAgICBsZXQgbWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBmb3IgKGxldCBhdHRyIG9mIHRoaXMuYXR0cmlidXRlcykge1xuICAgICAgICAgICAgaWYgKGF0dHIubmFtZS5zdGFydHNXaXRoKFwiZGF0YS1cIikpIHtcbiAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IGF0dHIubmFtZS5zdWJzdHIoNSk7XG4gICAgICAgICAgICAgICAgbWFwW25hbWVdID0gYXR0ci52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cblxuICAgIG5vdGlmeVN0eWxlcygpe1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGFyID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5nZXRQcm9wZXJ0eVZhbHVlKEFzcGVjdFJhdGlvLkNTU19BVFRSSUJVVEUpO1xuICAgICAgICAgICAgICAgIGlmIChhciAhPT0gXCJcIikgbmV3IEFzcGVjdFJhdGlvKHRoaXMpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgY29udGVudHMgb2YgZmlsZSBhcyBhIHRlbXBsZXRlIGFuZCBhcHBseSB0aGF0IHRlbXBsYXRlIHRvIHRoaXMgZWxlbWVudC5cbiAgICAgKiBSZXBsYWNlIGFsbCAke30gdmFyaWFibGVzIHdpdGggY29udGVudHMgb2YgJ21hcCcuXG4gICAgICogVGhlIHRlbXBsYXRlIHdpbGwgYmUgZ2l2ZW4gdGhlIGlkIGRlcml2ZWQgZnJvbSB0aGUgc3JjIGF0dHJpYnV0ZS5cbiAgICAgKi9cbiAgICBhc3luYyByZXRyaWV2ZVRlbXBsYXRlKCl7XG4gICAgICAgIGxldCBzcmMgPSB0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXQudGVtcGxhdGVTcmNBdHRyaWJ1dGUpO1xuICAgICAgICBsZXQgaWQgPSBzcmMucmVwbGFjZSgvW1xcLy8gLi1dKy9nLCBcIl9cIik7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2lkfWApO1xuICAgICAgICBpZiAodGVtcGxhdGUpIGF3YWl0IHRoaXMuaW5qZWN0VGVtcGxhdGUodGVtcGxhdGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhIHNoYWRvdyBlbGVtZW50IHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSB0ZW1wbGF0ZSBuYW1lZCAodGVtcGxhdGVJRCkuXG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIGFwcGx5VGVtcGxhdGUodGVtcGxhdGVJZCkge1xuICAgICAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0ZW1wbGF0ZUlkKTtcblxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB0aHJvdyBuZXcgRXJyb3IoXCJUZW1wbGF0ZSAnXCIgKyB0ZW1wbGF0ZUlkICsgXCInIG5vdCBmb3VuZC5cIik7XG4gICAgICAgIGlmICh0ZW1wbGF0ZS50YWdOYW1lLnRvVXBwZXJDYXNlKCkgIT09IFwiVEVNUExBVEVcIikgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCB3aXRoIGlkICdcIiArIHRlbXBsYXRlSWQgKyBcIicgaXMgbm90IGEgdGVtcGxhdGUuXCIpO1xuXG4gICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiAnb3Blbid9KS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgaW5qZWN0VGVtcGxhdGUodGVtcGxhdGUpe1xuICAgICAgICBpZiAodGhpcy5zaGFkb3dSb290ICE9PSBudWxsKSByZXR1cm47XG4gICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiAnb3Blbid9KS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKSk7XG4gICAgICAgIGF3YWl0IHRoaXMubm90aWZ5U3R5bGVzKCk7XG4gICAgICAgIGF3YWl0IHRoaXMucmVhZHkoKTtcbiAgICB9XG5cbiAgICBhc3luYyByZWFkeSgpe1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCBjb250ZW50cyBvZiBmaWxlIGludG8gdGhpcyBlbGVtZW50LlxuICAgICAqIFJlcGxhY2UgYWxsICR7fSB2YXJpYWJsZXMgd2l0aCBjb250ZW50cyBvZiAnbWFwJy5cbiAgICAgKi9cbiAgICBhc3luYyByZXRyaWV2ZVNvdXJjZShtYXApe1xuICAgICAgICBsZXQgc3JjID0gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0LnNyY0F0dHJpYnV0ZSk7XG4gICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0RmlsZShzcmMsIG1hcCk7XG4gICAgICAgIHRoaXMuaW5uZXJIVE1MID0gdGV4dDtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgbG9hZFRlbXBsYXRlU25pcHBldChmaWxlbmFtZSwgdGFnbmFtZSl7XG4gICAgICAgIGxldCBpZCA9IGZpbGVuYW1lLnJlcGxhY2UoL1tcXC8vIC4tXSsvZywgXCJfXCIpO1xuXG4gICAgICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aWR9YCkpe1xuICAgICAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRGaWxlKGZpbGVuYW1lKTtcbiAgICAgICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZW1wbGF0ZVwiKTtcbiAgICAgICAgICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IHRleHQ7XG4gICAgICAgICAgICB0ZW1wbGF0ZS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpZCk7XG4gICAgICAgICAgICBpZiAodGFnbmFtZSkgdGVtcGxhdGUuc2V0QXR0cmlidXRlKFwiZGF0YS1uaWRnZXRcIiwgdGFnbmFtZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZCh0ZW1wbGF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtpZH1gKTtcblxuICAgICAgICBmb3IgKGxldCBlbGUgb2YgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0YWduYW1lKSl7XG4gICAgICAgICAgICBhd2FpdCBlbGUuaW5qZWN0VGVtcGxhdGUodGVtcGxhdGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlICdoaWRkZW4nIGNsYXNzLlxuICAgICAqL1xuICAgIHNob3coKSB7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgJ2hpZGRlbicgY2xhc3MuXG4gICAgICovXG4gICAgaGlkZSgpIHtcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgZGlzYWJsZWQgZmxhZyB0aGF0IGlzIHJlYWQgYnkgbmlkZ2V0IG1vdXNlIGZ1bmN0aW9ucy5cbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKi9cbiAgICBzZXQgZGlzYWJsZWQodmFsdWUpe1xuICAgICAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKE5pZGdldEVsZW1lbnQuRElTQUJMRURfQVRUUklCVVRFLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKE5pZGdldEVsZW1lbnQuRElTQUJMRURfQVRUUklCVVRFLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGRpc2FibGVkIGZsYWcgdGhhdCBpcyByZWFkIGJ5IG5pZGdldCBtb3VzZSBmdW5jdGlvbnMuXG4gICAgICogQHBhcmFtIHZhbHVlXG4gICAgICovXG4gICAgZ2V0IGRpc2FibGVkKCl7XG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRyaWJ1dGUoTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXRFbGVtZW50LkRJU0FCTEVEX0FUVFJJQlVURSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhpcyBlbGVtZW50IHdhcyB1bmRlciB0aGUgbW91c2UgZm9yIHRoZSBldmVudC5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IGV2ZW50XG4gICAgICogQHBhcmFtIHt0eXBlfSBlbGVtZW50XG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1VuZGVyTW91c2UoZXZlbnQpIHtcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYO1xuICAgICAgICBsZXQgeSA9IGV2ZW50LmNsaWVudFk7XG4gICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcblxuICAgICAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnQgPT09IHRoaXMpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVuIHRoZSBxdWVyeSBzZWxlY3RvciBvbiB0aGlzIGVsZW1lbnQuXG4gICAgICogSWYgdGhpcyBlbGVtZW50IGhhcyBhIHNoYWRvdywgcnVuIGl0IG9uIHRoYXQgaW5zdGVhZC5cbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50VGFnTmFtZU1hcFtLXX1cbiAgICAgKi9cbiAgIHF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzKSB7XG4gICAgICAgIGlmICh0aGlzLnNoYWRvd1Jvb3Qpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVuIHRoZSBxdWVyeSBzZWxlY3RvciBvbiB0aGlzIGVsZW1lbnQuXG4gICAgICogSWYgdGhpcyBlbGVtZW50IGhhcyBhIHNoYWRvdywgcnVuIGl0IG9uIHRoYXQgaW5zdGVhZC5cbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50VGFnTmFtZU1hcFtLXX1cbiAgICAgKi9cbiAgICBxdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycykge1xuICAgICAgICBpZiAodGhpcy5zaGFkb3dSb290KXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSB0aGlzIGVsZW1lbnQgZnJvbSBpdCdzIHBhcmVudC5cbiAgICAgKi9cbiAgICBkZXRhY2goKXtcbiAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluZGV4IHdpdGhpbiB0aGUgcGFyZW50IGVsZW1lbnQuXG4gICAgICovXG4gICAgaW5kZXgoKXtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5wYXJlbnRFbGVtZW50LmNoaWxkcmVuKS5pbmRleE9mKHRoaXMpO1xuICAgIH1cbn1cblxuLy8gTmlkZ2V0RWxlbWVudC5tdXRhdGlvbk9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZCwgb2JzZXJ2ZXIpPT57XG4vLyAgICAgcmVjb3JkLmZvckVhY2goKG11dGF0aW9uKSA9PiB7XG4vLyAgICAgICAgIGlmICghbXV0YXRpb24uYWRkZWROb2RlcykgcmV0dXJuXG4vLyAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbXV0YXRpb24uYWRkZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuLy8gICAgICAgICAgICAgbGV0IG5vZGUgPSBtdXRhdGlvbi5hZGRlZE5vZGVzW2ldO1xuLy8gICAgICAgICAgICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gXCJURU1QTEFURVwiKSB7XG4vLyAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobm9kZS50YWdOYW1lKTtcbi8vICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhub2RlLmdldEF0dHJpYnV0ZShcImRhdGEtbmlkZ2V0XCIpKTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgIH0pO1xuLy8gfSk7XG4vL1xuLy8gTmlkZ2V0RWxlbWVudC5tdXRhdGlvbk9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQsIHtcbi8vICAgICBjaGlsZExpc3Q6IHRydWUsXG4vLyAgICAgc3VidHJlZTogdHJ1ZSxcbi8vICAgICBhdHRyaWJ1dGVzOiBmYWxzZSxcbi8vICAgICBjaGFyYWN0ZXJEYXRhOiBmYWxzZVxuLy8gfSk7XG5cbk5pZGdldEVsZW1lbnQuRElTQUJMRURfQVRUUklCVVRFID0gXCJuaWRnZXQtZGlzYWJsZWRcIjtcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1lbGVtZW50JywgTmlkZ2V0RWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEVsZW1lbnQ7IiwiJ3VzZSBzdHJpY3QnO1xuLyoqXG4gKiBNYW5pcHVsYXRlcyB0aGUgZWxlbWVudHMgc3R5bGUgd2l0aCBqcyByb3V0aW5lcyBhY2NvcmRpbmcgdG8gY3NzIGZsYWdzLlxuICogTmlkZ2V0IHN0eWxlIGlzIGFwcGxpZWQgdG8gYWxsIG5pZGdldC1lbGVtZW50cyB1bmxlc3MgdGhleSBoYXZlIHRoZSBuaWRnZXQtc3R5bGVcbiAqIGF0dHJpYnV0ZSBzZXQgdG8gJ2ZhbHNlJy5cbiAqL1xuXG5jbGFzcyBOaWRnZXRTdHlsZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihuaWRnZXQpIHtcbiAgICAgICAgdGhpcy5uaWRnZXQgPSBuaWRnZXQ7XG4gICAgICAgIHRoaXMuYXBwbHkoKTtcbiAgICB9XG4gICAgXG4gICAgYXBwbHkoKSB7XG4gICAgICAgIHRoaXMubmlkZ2V0V2lkdGhSYXRpbygpO1xuICAgICAgICB0aGlzLm5pZGdldEhlaWdodFJhdGlvKCk7XG4gICAgICAgIHRoaXMubmlkZ2V0Rml0VGV4dCgpO1xuICAgICAgICB0aGlzLm5pZGdldEZpdFRleHRXaWR0aCgpO1xuICAgICAgICB0aGlzLm5pZGdldFZlcnRBbGlnblRleHQoKTtcbiAgICB9XG4gICAgXG4gICAgbmlkZ2V0V2lkdGhSYXRpbygpIHtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LXdpZHRoLXJhdGlvXCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47ICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHsgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LndpZHRoID0gdGhpcy5uaWRnZXQuaGVpZ2h0ICogcmF0aW87XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxuICAgIH1cbiAgICBcbiAgICBuaWRnZXRIZWlnaHRSYXRpbygpIHtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWhlaWdodC1yYXRpb1wiKTtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuOyAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7ICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLm5pZGdldC5oZWlnaHQgPSB0aGlzLm5pZGdldC53aWR0aCAqIHJhdGlvO1xuICAgICAgICB9KS5vYnNlcnZlKHRoaXMubmlkZ2V0KTsgICAgICBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaWxsIHRoZSB0ZXh0IGhlaWdodCB0byBtYXRjaCB0aGUgZWxlbWVudCBoZWlnaHQuXG4gICAgICogQ2hhbmdlIHRoZSByYXRpbyB2YWx1ZSAob3IgdGhlIGZvbnRTaXplKSBhZGp1c3QuXG4gICAgICovXG4gICAgbmlkZ2V0Rml0VGV4dCgpIHtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0XCIpOyAgICAgICAgXG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjtcblxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYC0tbmlkZ2V0LWZpdC10ZXh0ICR7cmF0aW99YClcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5uaWRnZXQub2Zmc2V0SGVpZ2h0ICogcmF0aW87XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IGggKyBcInB4XCI7XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqICBXaWxsIGNoYW5nZSB0aGUgZm9udCBzaXplIHNvIHRoYXQgdGhlIHRleHQgZml0J3MgaW4gdGhlIHBhcmVudCBlbGVtZW50LlxuICAgICAqICBEb24ndCBzZXQgdGhlIHdpZHRoIG9mIHRoZSBlbGVtZW50LlxuICAgICAqL1xuICAgIG5pZGdldEZpdFRleHRXaWR0aCgpIHtcbiAgICAgICAgbGV0IHJlbW92ZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1maXQtdGV4dC13aWR0aFwiKTtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJlbW92ZSkpIHJldHVybjtcblxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudFxuXG4gICAgICAgICAgICBsZXQgdGV4dFcgPSB0aGlzLm5pZGdldC5zY3JvbGxXaWR0aDtcbiAgICAgICAgICAgIGxldCBjb250VyA9IHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICBjb250VyA9IGNvbnRXIC0gcmVtb3ZlO1xuICAgICAgICAgICAgbGV0IGR3ID0gY29udFcvdGV4dFc7XG4gICAgICAgICAgICBsZXQgY29tcHV0ZWRGb250U2l6ZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0LCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKCdmb250LXNpemUnKVxuICAgICAgICAgICAgY29tcHV0ZWRGb250U2l6ZSA9IHBhcnNlSW50KGNvbXB1dGVkRm9udFNpemUpO1xuICAgICAgICAgICAgY29tcHV0ZWRGb250U2l6ZSA9IE1hdGgucm91bmQoY29tcHV0ZWRGb250U2l6ZSk7XG4gICAgICAgICAgICBsZXQgbmV3Rm9udFNpemUgPSBNYXRoLnJvdW5kKGNvbXB1dGVkRm9udFNpemUgKiBkdyk7XG4gICAgICAgICAgICBsZXQgaCA9IHRoaXMubmlkZ2V0Lm9mZnNldEhlaWdodFxuXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoY29tcHV0ZWRGb250U2l6ZSAtIG5ld0ZvbnRTaXplKSA8PSAyKSByZXR1cm47XG5cbiAgICAgICAgICAgIGlmIChuZXdGb250U2l6ZSA+IGgpIG5ld0ZvbnRTaXplID0gaDtcblxuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBuZXdGb250U2l6ZSArIFwicHhcIjtcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBsaW5lIGhlaWdodCB0byB0aGUgb2Zmc2V0IGhlaWdodCBtdWx0aXBsaWVkIGJ5IHJhdGlvLlxuICAgICAqL1xuICAgIG5pZGdldFZlcnRBbGlnblRleHQoKXtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LXZlcnQtYWxpZ24tdGV4dFwiKTtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xuXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaCA9IHRoaXMubmlkZ2V0Lm9mZnNldEhlaWdodCAqIHJhdGlvO1xuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUubGluZUhlaWdodCA9IGggKyBcInB4XCI7XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRTdHlsZTsiLCIndXNlIHN0cmljdCc7XG5jbGFzcyBUcmFuc2Zvcm17XG4gICAgY29uc3RydWN0b3IodmFsdWUpe1xuICAgICAgICBsZXQgaW5kZXhPZiA9IHZhbHVlLmluZGV4T2YoXCIoXCIpO1xuICAgICAgICB0aGlzLm5hbWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgaW5kZXhPZik7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcodGhpcy5uYW1lLmxlbmd0aCArIDEsIHZhbHVlLmxlbmd0aCAtIDEpO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIiwgXCIgKyB0aGlzLnZhbHVlKTtcbiAgICB9XG4gICAgXG4gICAgdG9TdHJpbmcoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArIFwiKFwiICsgdGhpcy52YWx1ZSArIFwiKVwiO1xuICAgIH0gICAgXG59XG5cbmNsYXNzIFRyYW5zZm9ybWVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG4gICAgXG4gICAgYXBwZW5kKCl7XG4gICAgICAgIGxldCBjb21wdXRlZFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50KVtcInRyYW5zZm9ybVwiXTtcbiAgICAgICAgaWYgKGNvbXB1dGVkU3R5bGUgIT09IFwibm9uZVwiKSB0aGlzLnB1c2goY29tcHV0ZWRTdHlsZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBjbGVhcigpe1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gXCJcIjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHVuc2hpZnQodmFsdWUpe1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gdmFsdWUgKyBcIiBcIiArIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XG4gICAgfVxuICAgIFxuICAgIHB1c2godmFsdWUpe1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSArIFwiIFwiICsgdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gICAgXG4gICAgXG4gICAgc2hpZnQoKXtcbiAgICAgICAgbGV0IGFycmF5ID0gdGhpcy5zcGxpdCgpO1xuICAgICAgICBpZiAoYXJyYXkubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcbiAgICAgICAgYXJyYXkuc2hpZnQoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IGFycmF5LmpvaW4oXCIgXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcG9wKCl7XG4gICAgICAgIGxldCBhcnJheSA9IHRoaXMuc3BsaXQoKTtcbiAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIFwiXCI7XG4gICAgICAgIGFycmF5LnBvcCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XG4gICAgICAgIHJldHVybiB0aGlzOyAgICAgIFxuICAgIH1cbiAgICBcbiAgICByZXBsYWNlKHZhbHVlKXtcbiAgICAgICAgbGV0IG5ld1RyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0odmFsdWUpO1xuICAgICAgICBsZXQgYXJyYXkgPSB0aGlzLnNwbGl0KCk7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBlbnRyeSA9IGFycmF5W2ldO1xuICAgICAgICAgICAgbGV0IHRyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0oZW50cnkpO1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybS5uYW1lID09PSBuZXdUcmFuc2Zvcm0ubmFtZSl7XG4gICAgICAgICAgICAgICAgYXJyYXlbaV0gPSBuZXdUcmFuc2Zvcm0udG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHNwbGl0KCl7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XG4gICAgICAgIGxldCBzdGFydCA9IDA7XG4gICAgICAgIGxldCBydmFsdWUgPSBbXTtcbiAgICAgICAgbGV0IGxhc3QgPSAnJztcbiAgICAgICAgbGV0IHNraXAgPSBmYWxzZTtcbiAgICAgICAgbGV0IG5lc3RlZFAgPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBpZiAoIXNraXAgJiYgdmFsdWVbaV0gPT09ICcgJyAmJiBsYXN0ID09PSAnICcpe1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghc2tpcCAmJiB2YWx1ZVtpXSA9PT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgcnZhbHVlLnB1c2godmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCBpKSk7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVtpXSA9PT0gJygnKSB7XG4gICAgICAgICAgICAgICAgbmVzdGVkUCsrO1xuICAgICAgICAgICAgICAgIHNraXAgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVtpXSA9PT0gJyknKSB7XG4gICAgICAgICAgICAgICAgbmVzdGVkUC0tO1xuICAgICAgICAgICAgICAgIGlmIChuZXN0ZWRQID09PSAwKSBza2lwID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0ID0gdmFsdWVbaV07XG4gICAgICAgIH1cbiAgICAgICAgcnZhbHVlLnB1c2godmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCB2YWx1ZS5sZW5ndGgpKTtcbiAgICAgICAgcmV0dXJuIHJ2YWx1ZTtcbiAgICB9XG4gICAgXG4gICAgdG9TdHJpbmcoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zZm9ybWVyOyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIEEgTmlkZ2V0IHRoYXQgY2hhbmdlcyB0aGUgaW1hZ2UgZm9yIGhvdmVyLCBkaXNhYmxlZCwgcHJlc3MsIGFuZCBpZGxlLlxuICogRmlyZXMgYSBjbGljayBldmVudCB3aGVuIGNsaWNrZWQuXG4gKlxuICogV2lsbCBzZXQgdGhlIGN1cnJlbnQgc3RhdGUgYXMgZGF0YS1zdGF0ZSBzbyB0aGF0IGNzcyBjYW4gYWNjZXNzIGl0LlxuICovXG5jbGFzcyBOaWRnZXRCdXR0b24gZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgICAgICB0aGlzLmFscGhhVG9sZXJhbmNlID0gMDsgLy8gYWxwaGEgbmVlZHMgdG8gYmUgPiB0b2xlcmFuY2UgdG8gdHJpZ2dlciBldmVudHMuXG5cbiAgICAgICAgdGhpcy5zdHJpbmdIb3ZlciA9IFwibmlkZ2V0LWJ1dHRvbi1zdGF0ZVtzdGF0ZT0nSE9WRVInXVwiO1xuICAgICAgICB0aGlzLnN0cmluZ0Rpc2FibGVkID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdESVNBQkxFRCddXCI7XG4gICAgICAgIHRoaXMuc3RyaW5nUHJlc3MgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J1BSRVNTJ11cIjtcbiAgICAgICAgdGhpcy5zdHJpbmdJZGxlID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdJRExFJ11cIjtcblxuICAgICAgICB0aGlzLnN0YXRlID0gXCJpZGxlXCI7XG4gICAgfVxuXG4gICAgaXNJblNldCgpIHtcbiAgICAgICAgbGV0IHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgICAgICAgd2hpbGUgKHBhcmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAocGFyZW50LnRhZ05hbWUgPT09IFwiTklER0VULUJVVFRPTi1TRVRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIG5pZGdldFJlYWR5KCkge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0Rpc2FibGVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc0luU2V0KCkpIHJldHVybjtcblxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIHRoaXMubW91c2VFbnRlcik7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZUxlYXZlKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2VQcmVzcyk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVJlbGVhc2UpO1xuXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgaXNVbmRlcihldmVudCkge1xuICAgICAgICBsZXQgZWxlbWVudHMgPSBkb2N1bWVudC5lbGVtZW50c0Zyb21Qb2ludChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmluZGV4T2YodGhpcy5hY3RpdmVOaWRnZXQpID09IC0xKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmFjdGl2ZU5pZGdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYIC0gcmVjdC54O1xuICAgICAgICBsZXQgeSA9IGV2ZW50LmNsaWVudFkgLSByZWN0Lnk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudGVzdEFscGhhKHgsIHkpO1xuICAgIH1cblxuICAgIGdldCBkaXNhYmxlZCgpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmRpc2FibGVkO1xuICAgIH1cblxuICAgIHNldCBkaXNhYmxlZCh2YWx1ZSkge1xuICAgICAgICBzdXBlci5kaXNhYmxlZCA9IHZhbHVlO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0Rpc2FibGVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImluXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcInByZXNzXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdQcmVzcztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW91c2VSZWxlYXNlKGUpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0hvdmVyO1xuICAgIH1cblxuICAgIG1vdXNlUHJlc3MoZSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJwcmVzc1wiO1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nUHJlc3M7XG4gICAgfVxuXG4gICAgaGlkZUFsbEltYWdlcygpIHtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nSG92ZXIpLmhpZGUoKTtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nRGlzYWJsZWQpLmhpZGUoKTtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nUHJlc3MpLmhpZGUoKTtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nSWRsZSkuaGlkZSgpO1xuICAgIH1cblxuICAgIHNldCBhY3RpdmVOaWRnZXQoc2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5oaWRlQWxsSW1hZ2VzKCk7XG4gICAgICAgIHRoaXMuX2FjdGl2ZU5pZGdldCA9IHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIHRoaXMuX2FjdGl2ZU5pZGdldC5zaG93KCk7XG4gICAgfVxuXG4gICAgZ2V0IGFjdGl2ZU5pZGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGl2ZU5pZGdldDtcbiAgICB9XG5cbiAgICBzZXQgc3RhdGUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgc3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtc3RhdGVcIik7XG4gICAgfVxuXG4gICAgdGVzdEFscGhhKHgsIHkpIHtcbiAgICAgICAgbGV0IHBpeGVsID0gdGhpcy5hY3RpdmVOaWRnZXQuZ2V0UGl4ZWwoeCwgeSk7XG4gICAgICAgIHJldHVybiBwaXhlbFszXSA+IHRoaXMuYWxwaGFUb2xlcmFuY2U7XG4gICAgfVxuXG4gICAgbW91c2VMZWF2ZSgpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdJZGxlO1xuICAgIH1cblxuICAgIG1vdXNlQWN0aXZlKCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XG4gICAgfVxuXG4gICAgbW91c2VNb3ZlKGUpIHtcbiAgICAgICAgaWYgKCF0aGlzLnRlc3RBbHBoYShlLmNsaWVudFgsIGUuY2xpZW50WSkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdJZGxlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcbiAgICAgICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XG4gICAgICAgIH1cbiAgICB9XG59XG47XG5cbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1idXR0b24nLCBOaWRnZXRCdXR0b24pO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRCdXR0b247XG5cbiIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XHJcblxyXG5jbGFzcyBOaWRnZXRCdXR0b25TZXQgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xyXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgdGhpcy5hbHBoYVRvbGVyYW5jZSA9IDA7IC8vIGFscGhhIG5lZWRzIHRvIGJlID4gdG9sZXJhbmNlIHRvIHRyaWdnZXIgZXZlbnRzLlxyXG5cclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZVByZXNzKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VSZWxlYXNlKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmUpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZUxlYXZlKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVkKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbmlkZ2V0UmVhZHkoKXtcclxuICAgICAgICB0aGlzLmJ1dHRvbnMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoXCJuaWRnZXQtYnV0dG9uXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlUHJlc3MoZSl7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNVbmRlcihlKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZVByZXNzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJwcmVzc1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlUmVsZWFzZShlKXtcclxuICAgICAgICB0aGlzLnN0YXRlID0gXCJvdXRcIjtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5zdGF0ZSA9PSBcInByZXNzXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJidXR0b24tY2xpY2tlZFwiLCB7ZGV0YWlsOiBlbGVtZW50fSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZVJlbGVhc2UoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcImhvdmVyXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VNb3ZlKGUpe1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5idXR0b25zKXtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNVbmRlcihlKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZUFjdGl2ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQubW91c2VMZWF2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlTGVhdmUoZSl7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5tb3VzZUxlYXZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXQgc3RhdGUodmFsdWUpe1xyXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiLCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHN0YXRlKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiKTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWJ1dHRvbi1zZXQnLCBOaWRnZXRCdXR0b25TZXQpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEJ1dHRvblNldDsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIEEgTmlkZ2V0IHRoYXQgY2hhbmdlcyB0aGUgaW1hZ2UgZm9yIGhvdmVyLCBkaXNhYmxlZCwgcHJlc3MsIGFuZCBpZGxlLlxuICogRmlyZXMgYSBjbGljayBldmVudCB3aGVuIGNsaWNrZWQuXG4gKiBcbiAqIFRoaXMgaXMgdGhlIGh0bWwgZWxlbWVudCBcIm5pZGdldC1idXR0b25cIi5cbiAqIElmIHRoZSBuaWRnZXQtYnV0dG9uIGhhcyB0aGUgYXR0cmlidXRlIGBpbWctcHJlZml4ID0gXCJwcmVmaXhcImAgdGhlbiB0aGUgXG4gKiBmb2xsb3dpbmcgaW1hZ2VzLiAgYGltZy1zdWZmaXhgID0gXCJzdWZmaXhcIiB3aWxsIG92ZXJyaWRlIHRoZSBcIi5wbmdcIi5cbiAqIHdpbGwgYmUgdXNlZDpcbiAqIC0gcHJlZml4LWhvdmVyLnBuZ1xuICogLSBwcmVmaXgtZGlzYWJsZWQucG5nXG4gKiAtIHByZWZpeC1wcmVzcy5wbmdcbiAqIC0gcHJlZml4LWlkbGUucG5nXG4gKi9cbmNsYXNzIE5pZGdldEJ1dHRvblN0YXRlIGV4dGVuZHMgTmlkZ2V0IHtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgIH1cblxuICAgIG5pZGdldFJlYWR5KCl7XG4gICAgICAgIHRoaXMuaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgdGhpcy5pbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIHRoaXMuZ2V0QXR0cmlidXRlKFwiaW1hZ2Utc3JjXCIpKTtcbiAgICAgICAgdGhpcy5hcHBlbmQodGhpcy5pbWcpO1xuICAgIH1cblxuICAgIHNob3coKXtcbiAgICAgICAgc3VwZXIuc2hvdygpO1xuICAgICAgICB0aGlzLmxvYWRDYW52YXMoKTtcbiAgICB9XG5cbiAgICBsb2FkQ2FudmFzKCl7XG4gICAgICAgIGlmICghdGhpcy5pbWcgfHwgdGhpcy5jYW52YXMpIHJldHVybjtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmltZy5uYXR1cmFsV2lkdGg7XG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuaW1nLm5hdHVyYWxIZWlnaHQ7XG4gICAgICAgIHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJykuZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzO1xuICAgIH1cblxuICAgIGdldFBpeGVsKHgsIHkpe1xuICAgICAgICB0aGlzLmxvYWRDYW52YXMoKTtcbiAgICAgICAgbGV0IGR4ID0gdGhpcy5jYW52YXMud2lkdGggLyB0aGlzLm9mZnNldFdpZHRoO1xuICAgICAgICBsZXQgZHkgPSB0aGlzLmNhbnZhcy5oZWlnaHQgLyB0aGlzLm9mZnNldEhlaWdodDtcbiAgICAgICAgbGV0IHBpeGVsID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5nZXRJbWFnZURhdGEoZHggKiB4LCBkeSAqIHksIDEsIDEpLmRhdGE7XG4gICAgICAgIHJldHVybiBwaXhlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgc3RhdGUgdG8gSE9WRVIsIERJU0FCTEVELCBQUkVTUywgSURMRS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHN0YXRlXG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHNldCBzdGF0ZShzdGF0ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInN0YXRlXCIsIHN0YXRlLnRvVXBwZXJDYXNlKCkpO1xuICAgIH1cblxuICAgIGdldCBzdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cmlidXRlKFwic3RhdGVcIik7XG4gICAgfVxuXG4gICAgc2V0IHNvdXJjZShpbWcpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgaW1nKTtcbiAgICB9XG5cbiAgICBnZXQgc291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyaWJ1dGUoXCJzcmNcIik7XG4gICAgfVxufVxuO1xuXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtYnV0dG9uLXN0YXRlJywgTmlkZ2V0QnV0dG9uU3RhdGUpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRCdXR0b25TdGF0ZTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBjb21wb25lbnQgdGhhdCBoYXMgZXZlbnRzIGZvciBhZGRpbmcgbmlkZ2V0cywgcmVtb3ZpbmcgbmlkZ2V0cywgYW5kIFxuICogcmVzaXppbmcgdGhlIGNvbnRhaW5lci4gIFdoZW4gdGhlIGNvbnRhaW5lciBzaXplIGlzIGNoYW5nZWQsIHRoZSBudW1iZXJcbiAqIG9mIGNvbXBvbmVudHMgY2hhbmdlLCBvciB0aGUgbGF5b3V0IGF0dHJpYnV0ZSBjaGFuZ2VzLCB0aGUgZG9MYXlvdXQgZnVuY3Rpb25cbiAqIGlzIGNhbGxlZC5cbiAqIFxuICogVGhlIGNvbXBvbmVudHMgYXJlIGFycmFnZWQgYWNjb3JkaW5nIHRvIHRoZSBzZWxlY3RlZCBsYXlvdXQgYXR0cmlidXRlLiAgSWYgXG4gKiBubyBsYXlvdXQgYXR0cmlidXRlIGlzIGNob3NlbiwgZG9MYXlvdXQgaXMgc3RpbGwgY2FsbGVkIGFzIGl0IGlzIGFzc3VtZWQgXG4gKiBhIGN1c3RvbSBmdW5jdGlvbiBoYXMgYmVlbiBwcm92aWRlZC5cbiAqL1xuXG5jbGFzcyBOaWRnZXRDb250YWluZXIgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICAgICAgbGV0IHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHRoaXMuZG9MYXlvdXQpO1xuICAgICAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKHRoaXMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4gW05pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGVdO1xuICAgIH1cblxuICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgaWYgKG9sZFZhbHVlID09PSBuZXdWYWx1ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmRvTGF5b3V0KCk7XG4gICAgfVxuXG4gICAgc2V0IGxheW91dCh2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShOaWRnZXRDb250YWluZXIubGF5b3V0QXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IGxheW91dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGUpO1xuICAgIH0gICAgICBcblxuICAgIGRvTGF5b3V0KCkge1xuICAgICAgICBpZiAoIXRoaXMubGF5b3V0KSByZXR1cm47XG4gICAgICAgIGlmICghTGF5b3V0c1t0aGlzLmxheW91dF0pIHRocm93IGBpbnZhbGlkIGxheW91dDogJHt0aGlzLmxheW91dH1gO1xuICAgICAgICBMYXlvdXRzW3RoaXMubGF5b3V0XTtcbiAgICB9XG59XG5cbmNsYXNzIExheW91dHMge1xuICAgIC8qKlxuICAgICAqIEZpdCBhbGwgbmlkZ2V0cyBldmVubHkgaW4gYSBob3Jpem9udGFsIHJvdy5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IG5pZGdldFxuICAgICAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcm93KG5pZGdldCkge1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpemUpO1xuICAgIH1cbn1cblxuXG5OaWRnZXRDb250YWluZXIubGF5b3V0QXR0cmlidXRlID0gXCJsYXlvdXRcIjtcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1jb250YWluZXInLCBOaWRnZXRDb250YWluZXIpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRDb250YWluZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0XCIpO1xuY29uc3QgVHJhbnNmb3JtZXIgPSByZXF1aXJlKFwiLi4vVHJhbnNmb3JtZXJcIik7XG5cbi8qKlxuICogRG9uJ3QgZm9yZ2V0IHRvIHNldCAnaXMnIHdoZW4gcHV0dGluZyBlbGVtZW50IGRpcmVjdGx5IGluIGh0bWwgYXMgb3Bwb3NlZCB0b1xuICogcHJvZ3JhbWljYWxseS5cbiAqIDxpbWcgaXM9XCJyZWdpc3RlcmVkLW5hbWVcIiBzcmM9XCJpbWFnZS5wbmdcIj48L2ltZz5cbiAqIFxuICogaW5jbHVkZSBhIGN1c3RvbSBlbGVtZW50IGRlZmluaXRpb24gYXQgdGhlIGVuZCBvZiB0aGUgY2xhc3MuPGJyPlxuICogd2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgncmVnaXN0ZXJlZC1uYW1lJywgQ2xhc3MsIHtleHRlbmRzOiBcImltZ1wifSk7XG4gKi9cbmNsYXNzIE5pZGdldEhUTUxJbWFnZSBleHRlbmRzIEhUTUxJbWFnZUVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmxhc3REaXNwbGF5ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybWVyKHRoaXMpO1xuICAgIH1cblxuICAgIHNjYWxlKGR3LCBkaCkge1xuICAgICAgICBpZiAoIWRoKSBkaCA9IGR3O1xuICAgICAgICBsZXQgdyA9IHRoaXMud2lkdGggKiBkdztcbiAgICAgICAgbGV0IGggPSB0aGlzLmhlaWdodCAqIGRoO1xuICAgICAgICB0aGlzLndpZHRoID0gdztcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoO1xuICAgIH0gICAgICAgIFxuXG4gICAgc2V0IHNyYyh2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInNyY1wiLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IHNyYygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwic3JjXCIpO1xuICAgIH1cblxuICAgIGxvY2F0ZShsZWZ0LCB0b3ApIHtcbiAgICAgICAgdGhpcy5sZWZ0ID0gbGVmdDtcbiAgICAgICAgdGhpcy50b3AgPSB0b3A7XG4gICAgfVxuXG4gICAgZ2V0IGxlZnQoKSB7XG4gICAgICAgIGxldCB3ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykubGVmdDtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodyk7XG4gICAgfVxuXG4gICAgZ2V0IHRvcCgpIHtcbiAgICAgICAgbGV0IGggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS50b3A7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGgpO1xuICAgIH1cblxuICAgIHNldCBsZWZ0KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc3R5bGUubGVmdCA9IHZhbHVlICsgXCJweFwiO1xuICAgIH1cblxuICAgIHNldCB0b3AodmFsdWUpIHtcbiAgICAgICAgdGhpcy5zdHlsZS50b3AgPSB2YWx1ZSArIFwicHhcIjtcbiAgICB9ICAgIFxuXG4gICAgc2V0IHdpZHRoKHcpIHtcbiAgICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IHcgKyBcInB4XCI7XG4gICAgfVxuXG4gICAgc2V0IGhlaWdodCh3KSB7XG4gICAgICAgIHRoaXMuc3R5bGUuaGVpZ2h0ID0gdyArIFwicHhcIjtcbiAgICB9XG5cbiAgICBnZXQgd2lkdGgoKSB7XG4gICAgICAgIGxldCB3ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykud2lkdGg7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHcpO1xuICAgIH1cblxuICAgIGdldCBoZWlnaHQoKSB7XG4gICAgICAgIGxldCBoID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykuaGVpZ2h0O1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChoKTtcbiAgICB9ICAgICAgICBcblxuICAgIHNob3coKSB7XG4gICAgICAgIGlmICh0aGlzLmxhc3REaXNwbGF5KSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSB0aGlzLmxhc3REaXNwbGF5O1xuICAgICAgICAgICAgdGhpcy5sYXN0RGlzcGxheSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoaWRlKCkge1xuICAgICAgICB0aGlzLmxhc3REaXNwbGF5ID0gdGhpcy5zdHlsZS5kaXNwbGF5O1xuICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG5cbiAgICBzZXQgZGlzcGxheSh2YWx1ZSl7XG4gICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IHZhbHVlO1xuICAgIH1cbiAgICBcbiAgICBnZXQgZGlzcGxheSgpe1xuICAgICAgICByZXR1cm4gd2luZG93LmNhbGN1bGF0ZVN0eWxlKHRoaXMpW1wiZGlzcGxheVwiXTtcbiAgICB9XG5cbiAgICBkZXRhY2goKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcih0aGlzKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBzZXQgZGlzYWJsZWQodmFsdWUpe1xuICAgICAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgZGlzYWJsZWQoKXtcbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dHJpYnV0ZShcImRpc2FibGVkXCIpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xuICAgIH0gICAgXG4gICAgXG4gICAgY2xlYXJQb3MoKXtcbiAgICAgICAgdGhpcy5zdHlsZS50b3AgPSBudWxsO1xuICAgICAgICB0aGlzLnN0eWxlLmxlZnQgPSBudWxsO1xuICAgIH1cblxuICAgIGNsZWFyRGltcygpe1xuICAgICAgICB0aGlzLnN0eWxlLndpZHRoID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdHlsZS5oZWlnaHQgPSBudWxsO1xuICAgIH0gICAgXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0SFRNTEltYWdlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBOaWRnZXQgdGhhdCBjb250YWlucyBpbWFnZXMuXG4gKi9cbmNsYXNzIE5pZGdldEltYWdlIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcihzcmMpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgIGlmIChzcmMpIHRoaXMuc3JjID0gc3JjO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCl7XG4gICAgICAgIGxldCBzcmMgPSB0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXRJbWFnZS5zcmNBdHRyaWJ1dGUpOyAgICAgICAgXG4gICAgICAgIGlmIChzcmMpIHRoaXMuaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCBzcmMpOyAgICAgICBcbiAgICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLmltZyk7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgZ2V0IHNyYygpe1xuICAgICAgICByZXR1cm4gdGhpcy5pbWcuZ2V0QXR0cmlidXRlKFwic3JjXCIpO1xuICAgIH1cblxuICAgIHNldCBzcmModmFsdWUpe1xuICAgICAgICB0aGlzLmltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdmFsdWUpO1xuICAgIH1cblxuICAgIHNpemUod2lkdGgsIGhlaWdodCl7XG4gICAgICAgIHRoaXMuc3R5bGUud2lkdGggPSB3aWR0aFxuICAgICAgICB0aGlzLnN0eWxlLmhlaWdodCA9IGhlaWdodFxuICAgICAgICB0aGlzLmltZy5zdHlsZS53aWR0aCA9IHdpZHRoXG4gICAgICAgIHRoaXMuaW1nLnN0eWxlLmhlaWdodCA9IGhlaWdodFxuICAgIH1cbiAgICBcbiAgICBzY2FsZShkdywgZGgpe1xuICAgICAgICBpZiAoIWRoKSBkaCA9IGR3O1xuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLm9mZnNldFdpZHRoICogZHc7XG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLm9mZnNldEhlaWdodCAqIGRoO1xuICAgICAgICB0aGlzLnNpemUoYCR7d2lkdGh9cHhgLCBgJHtoZWlnaHR9cHhgKTtcbiAgICB9XG4gICAgXG4gICAgc2hvdygpe1xuICAgICAgICBpZiAodGhpcy5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIil7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5zdHlsZS5kaXNwbGF5O1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGhpZGUoKXtcbiAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxufVxuXG5OaWRnZXRJbWFnZS5zcmNBdHRyaWJ1dGUgPSBcInNyY1wiO1xud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWltYWdlJywgTmlkZ2V0SW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRJbWFnZTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyoqXG4gKiBXaGVuIHVzaW5nIC0tbmlkZ2V0LWZpdC10ZXh0LCBkbyBub3QgaW5jbHVkZSBoZWlnaHQgYW5kIHdpZHRoIGF0dHJpYnV0ZXMuXG4gKiBBIGZvbnQgc2l6ZSBjYW4gYmUgdXNlZCBhcyBhIHN0YXJ0aW5nIHBvaW50LlxuICovXG5jbGFzcyBGaXRUZXh0IHtcbiAgICBjb25zdHJ1Y3RvcihuaWRnZXQpe1xuICAgICAgICB0aGlzLm5pZGdldCA9IG5pZGdldDtcbiAgICAgICAgdGhpcy5sb2NrID0gXCJub25lXCI7XG4gICAgICAgIHRoaXMucGFyc2VBcmd1bWVudHMoKTtcbiAgICB9XG5cbiAgICBsaXN0ZW4oKXtcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKT0+dGhpcy5kZWxheVJlc2l6ZSh0aGlzLmhWYWx1ZSwgdGhpcy53VmFsdWUpKTtcbiAgICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQpO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XG4gICAgICAgIHRoaXMuZGVsYXkgPSAyNTtcbiAgICAgICAgdGhpcy5kZWxheVJlc2l6ZSh0aGlzLmhWYWx1ZSwgdGhpcy53VmFsdWUpO1xuICAgICAgICB0aGlzLnN0b3AgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBkZWxheVJlc2l6ZShoVmFsdWUsIHdWYWx1ZSl7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcbiAgICAgICAgaWYgKHRoaXMudGltZW91dCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PnRoaXMub25SZXNpemUoaFZhbHVlLCB3VmFsdWUpLCB0aGlzLmRlbGF5KTtcbiAgICB9XG5cbiAgICBub3RpZnkoaFZhbHVlLCB3VmFsdWUpe1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdGlmeVwiKTtcbiAgICAgICAgdGhpcy5zdG9wID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGVsYXlSZXNpemUoaFZhbHVlLCB3VmFsdWUpO1xuICAgIH1cblxuICAgIHBhcnNlQXJndW1lbnRzKCl7XG4gICAgICAgIGxldCBhcmdzID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0XCIpO1xuXG4gICAgICAgIGlmICghYXJncyB8fCBhcmdzID09PSBmYWxzZSB8fCBhcmdzID09PSBcImZhbHNlXCIpe1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5oVmFsdWUgPSB0aGlzLndWYWx1ZSA9IHRydWU7XG5cbiAgICAgICAgaWYgKHR5cGVvZihhcmdzKSA9PSBcInN0cmluZ1wiKXtcbiAgICAgICAgICAgIGxldCBvYmogPSBKU09OLnBhcnNlKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKG9ialtcImZpdFwiXSAhPT0gdW5kZWZpbmVkICYmIG9ialtcImZpdFwiXSA9PT0gXCJ3aWR0aFwiKSB0aGlzLmhWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKG9ialtcImZpdFwiXSAhPT0gdW5kZWZpbmVkICYmIG9ialtcImZpdFwiXSA9PT0gXCJoZWlnaHRcIikgdGhpcy53VmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChvYmpbXCJsb2NrXCJdICE9PSB1bmRlZmluZWQpIHRoaXMubG9jayA9IChvYmpbXCJsb2NrXCJdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUmVzaXplKGhWYWx1ZSwgd1ZhbHVlKXtcbiAgICAgICAgZGVsZXRlIHRoaXMudGltZW91dDtcblxuICAgICAgICBpZiAodGhpcy5zdG9wKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLm5pZGdldC50ZXh0Q29udGVudCA9PT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgPT09IDApIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0V2lkdGggPT09IDApIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMubmlkZ2V0LnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiKSByZXR1cm47XG5cbiAgICAgICAgaWYgKCFoVmFsdWUgJiYgIXdWYWx1ZSkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBoRGlyID0gdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLSB0aGlzLm5pZGdldC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIGxldCB3RGlyID0gdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAtIHRoaXMubmlkZ2V0LnNjcm9sbFdpZHRoO1xuXG4gICAgICAgIGlmICghaFZhbHVlKSBoRGlyID0gMDtcbiAgICAgICAgaWYgKCF3VmFsdWUpIHdEaXIgPSAwO1xuXG4gICAgICAgIGxldCBkaXIgPSBNYXRoLnNpZ24oaERpciB8IHdEaXIpOyAvLyB3aWxsIHByZWZlciB0byBzaHJpbmtcbiAgICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAwKSB0aGlzLmRpcmVjdGlvbiA9IGRpcjsgLy8ga2VlcCBwcmV2aW91cyBkaXJlY3Rpb25cblxuICAgICAgICBsZXQgZm9udFNpemUgPSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KVtcImZvbnQtc2l6ZVwiXSlcbiAgICAgICAgbGV0IG5ld1NpemUgPSBmb250U2l6ZSArICh0aGlzLmRpcmVjdGlvbik7XG5cbiAgICAgICAgaWYgKG5ld1NpemUgIT09IGZvbnRTaXplICYmIHRoaXMuZGlyZWN0aW9uID09PSBkaXIpIHtcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gbmV3U2l6ZSArIFwicHhcIjtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVvdXQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+dGhpcy5vblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSksIHRoaXMuZGVsYXkpO1xuICAgICAgICB9IGVsc2UgaWYgKGRpciA8IDAgJiYgdGhpcy5kaXJlY3Rpb24gPiAwKSB7IC8vIHJldmVyc2UgZGlyZWN0aW9uIGlmIGdyb3dpbmcgdG9vIGxhcmdlXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IC0xO1xuICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+dGhpcy5vblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSksIHRoaXMuZGVsYXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMubG9jayA9PT0gXCJ2aFwiKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZvbnRSYXRpbyA9IG5ld1NpemUgLyB3aW5kb3cuaW5uZXJIZWlnaHQgKiAxMDA7XG4gICAgICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBmb250UmF0aW8gKyBcInZoXCI7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5sb2NrID09PSBcInZ3XCIpe1xuICAgICAgICAgICAgICAgIGxldCBmb250UmF0aW8gPSBuZXdTaXplIC8gd2luZG93LmlubmVyV2lkdGggKiAxMDA7XG4gICAgICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBmb250UmF0aW8gKyBcInZ3XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBIG5pZGdldCBlbGVtZW50IGZvciBkaXNwbGF5aW5nIHRleHQuXG4gKiBwdXQgJy0tbmlkZ2V0LWZpdC10ZXh0OiAxLjA7JyBpbnRvIGNzcyBmb3IgdGhpcyBlbGVtZW50IHRvIGVuYWJsZSBzY2FsaW5nLlxuICogc2VlOiBOaWRnZXRTdHlsZS5qc1xuICovXG5jbGFzcyBOaWRnZXRUZXh0IGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnNbXCJmaXQtdGV4dC13aWR0aC10b2xlcmFuY2VcIl0gPSAwLjAyO1xuICAgICAgICB0aGlzLmZpdFRleHQgPSBuZXcgRml0VGV4dCh0aGlzKTtcbiAgICB9XG5cbiAgICByZW1vdmUoKXtcbiAgICAgICAgaWYgKHRoaXMuZml0VGV4dCkge1xuICAgICAgICAgICAgdGhpcy5maXRUZXh0LnN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5maXRUZXh0Lm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlci5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICAgICAgbGV0IGZpdFByb3AgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1maXQtdGV4dFwiKTtcblxuICAgICAgICBpZiAoZml0UHJvcCAhPT0gdW5kZWZpbmVkICYmIGZpdFByb3AgIT09IFwiXCIpe1xuICAgICAgICAgICAgdGhpcy5maXRUZXh0Lmxpc3RlbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0IHRleHQodmFsdWUpe1xuICAgICAgICB0aGlzLmlubmVyVGV4dCA9IHZhbHVlO1xuICAgICAgICBpZiAodGhpcy5maXRUZXh0ICYmIHRoaXMuZml0VGV4dC5zdG9wID09PSBmYWxzZSl7XG4gICAgICAgICAgICB0aGlzLmZpdFRleHQuZGVsYXlSZXNpemUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCB0ZXh0KCl7XG4gICAgICAgIHJldHVybiB0aGlzLmlubmVyVGV4dDtcbiAgICB9XG5cbiAgICBzY2FsZShhbW91bnQpIHtcbiAgICAgICAgbGV0IHN0eWxlRm9udFNpemUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKFwiZm9udC1zaXplXCIpO1xuICAgICAgICBsZXQgZm9udFNpemUgPSBwYXJzZUZsb2F0KHN0eWxlRm9udFNpemUpO1xuICAgICAgICB0aGlzLnN0eWxlLmZvbnRTaXplID0gKGZvbnRTaXplICogYW1vdW50KSArIFwicHhcIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGxpbmUgaGVpZ2h0IHRvIHRoZSBvZmZzZXQgaGVpZ2h0IG11bHRpcGxpZWQgYnkgcmF0aW8uXG4gICAgICogQ2FsbGluZyB0aGlzIG1ldGhvZCBkaXJlY3Rvcnkgd2lsbCBvdmVycmlkZSB0aGUgdmFsdWUgc2V0IGJ5IGNzc1xuICAgICAqL1xuICAgIG5pZGdldFZlcnRBbGlnblRleHQodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KFwiLS1uaWRnZXQtdmVydC1hbGlnbi10ZXh0XCIsIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvblJlc2l6ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCByYXRpbyA9IGdldENvbXB1dGVkU3R5bGUodGhpcykuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LXZlcnQtYWxpZ24tdGV4dFwiKTtcbiAgICAgICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjtcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5vZmZzZXRIZWlnaHQgKiByYXRpbztcbiAgICAgICAgICAgIHRoaXMuc3R5bGUubGluZUhlaWdodCA9IGggKyBcInB4XCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vYnNlcnZlcnMudmVydEFsaWduVGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy52ZXJ0QWxpZ25UZXh0ID0gbmV3IFJlc2l6ZU9ic2VydmVyKG9uUmVzaXplKTtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLnZlcnRBbGlnblRleHQub2JzZXJ2ZSh0aGlzKVxuICAgICAgICB9XG4gICAgICAgIG9uUmVzaXplKClcbiAgICB9XG5cbiAgICB2ZXJ0QWxpZ25UZXh0KHJhdGlvID0gMS4wKXtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xuICAgICAgICBsZXQgaCA9IHRoaXMub2Zmc2V0SGVpZ2h0ICogcmF0aW87XG4gICAgICAgIHRoaXMuc3R5bGUubGluZUhlaWdodCA9IGggKyBcInB4XCI7XG4gICAgfVxufVxuO1xuXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtdGV4dCcsIE5pZGdldFRleHQpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRUZXh0OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgZHJhZ0hhbmRsZXIgPSByZXF1aXJlKFwiLi4vRHJhZ0hhbmRsZXJcIikuaW5zdGFuY2U7XG5cblxuZnVuY3Rpb24gb25EcmFnU3RhcnQoZXZlbnQpeyAgICBcbiAgICBkcmFnSGFuZGxlci5zZXQodGhpcyk7XG4gICAgd2luZG93LnggPSB0aGlzO1xuICAgIGNvbnNvbGUubG9nKFwiJ1wiICsgdGhpcy5uYW1lKCkgKyBcIidcIik7XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnU3RhcnRcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uRHJhZ0VuZChldmVudCl7XG4gICAgaWYgKGRyYWdIYW5kbGVyLmdldCgpICE9PSB0aGlzKSByZXR1cm47XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnRW5kXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xuICAgIGRyYWdIYW5kbGVyLmNsZWFyKCk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuc2V0QXR0cmlidXRlKFwiZHJhZ2dhYmxlXCIsIFwidHJ1ZVwiKTsgICBcbiAgICBcbiAgICBuaWRnZXQub25EcmFnU3RhcnQgPSBvbkRyYWdTdGFydC5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uRHJhZ0VuZCA9IG9uRHJhZ0VuZC5iaW5kKG5pZGdldCk7XG4gICAgXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIG5pZGdldC5vbkRyYWdTdGFydCk7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VuZFwiLCBuaWRnZXQub25EcmFnRW5kKTsgICAgXG59OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgZHJhZ0hhbmRsZXIgPSByZXF1aXJlKFwiLi4vRHJhZ0hhbmRsZXJcIikuaW5zdGFuY2U7XG5jb25zdCBNb3VzZVV0aWxpdGllcyA9IHJlcXVpcmUoXCIuLi9Nb3VzZVV0aWxpdGllc1wiKTtcblxuZnVuY3Rpb24gb25EcmFnT3ZlcihldmVudCl7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBsZXQgZHJhZ05pZGdldCA9IGRyYWdIYW5kbGVyLmdldCgpO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ092ZXJcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcywgZHJhZ05pZGdldCk7XG59XG5cbmZ1bmN0aW9uIG9uRHJhZ0VudGVyKGV2ZW50KXtcbiAgICBpZiAoIWRyYWdIYW5kbGVyLmhhcygpKSByZXR1cm47XG4gICAgaWYgKCFkcmFnSGFuZGxlci5wdXNoT3Zlcih0aGlzKSkgcmV0dXJuO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ0VudGVyXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbkRyYWdMZWF2ZShldmVudCl7XG4gICAgaWYgKCFkcmFnSGFuZGxlci5oYXMoKSkgcmV0dXJuO1xuICAgIGlmIChNb3VzZVV0aWxpdGllcy5pc1VuZGVyKHRoaXMuZ2V0RWxlbWVudCgpKSkgcmV0dXJuO1xuICAgIGlmICghZHJhZ0hhbmRsZXIucmVtb3ZlT3Zlcih0aGlzKSkgcmV0dXJuO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ0xlYXZlXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbkRyb3AoZXZlbnQpe1xuICAgIGxldCBkcmFnTmlkZ2V0ID0gZHJhZ0hhbmRsZXIuZ2V0KCk7XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcm9wXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMsIGRyYWdOaWRnZXQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgbmlkZ2V0Lm9uRHJhZ092ZXIgPSBvbkRyYWdPdmVyLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Ecm9wID0gb25Ecm9wLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25EcmFnRW50ZXIgPSBvbkRyYWdFbnRlci5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uRHJhZ0xlYXZlID0gb25EcmFnTGVhdmUuYmluZChuaWRnZXQpO1xuICAgIFxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIG5pZGdldC5vbkRyYWdPdmVyKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIG5pZGdldC5vbkRyb3ApO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbnRlclwiLCBuaWRnZXQub25EcmFnRW50ZXIpO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdsZWF2ZVwiLCBuaWRnZXQub25EcmFnTGVhdmUpOyAgICBcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBNb3VzZVV0aWxpdGllcyA9IHJlcXVpcmUoXCIuLi9Nb3VzZVV0aWxpdGllc1wiKTtcblxuZnVuY3Rpb24gb25DbGljayhldmVudCl7ICAgIFxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiY2xpY2tcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VEb3duKGV2ZW50KXsgICAgXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZURvd25cIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VVcChldmVudCl7ICAgIFxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VVcFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZUVudGVyKGV2ZW50KXsgICAgXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZUVudGVyXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlTGVhdmUoZXZlbnQpe1xuICAgIGlmIChNb3VzZVV0aWxpdGllcy5pc1VuZGVyKHRoaXMuZ2V0RWxlbWVudCgpKSkgcmV0dXJuO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VFeGl0XCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgY29uc29sZS5sb2coXCJtb3VzZSBzZXR1cFwiKTtcbiAgICBcbiAgICBuaWRnZXQub25DbGljayA9IG9uQ2xpY2suYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbk1vdXNlRG93biA9IG9uTW91c2VEb3duLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Nb3VzZVVwID0gb25Nb3VzZVVwLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Nb3VzZUVudGVyID0gb25Nb3VzZUVudGVyLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Nb3VzZUxlYXZlID0gb25Nb3VzZUxlYXZlLmJpbmQobmlkZ2V0KTtcbiAgICBcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBuaWRnZXQub25DbGljayk7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIG5pZGdldC5vbk1vdXNlRG93bik7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBuaWRnZXQub25Nb3VzZVVwKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIG5pZGdldC5vbk1vdXNlRW50ZXIpO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIG5pZGdldC5vbk1vdXNlTGVhdmUpO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIEVuYWJsZSB0aGUgbmlkZ2V0IHRvIGJlIG1vdmVkIGJ5IGRyYWdnaW5nLiAgV2lsbCBkcmFnIGJ5IGFueSBjaGlsZCBlbGVlbWVudFxuICogdGhlICcubmlkZ2V0LWhlYWRlcicgY2xhc3MsIG90aGVyd2lzZSBtb3ZhYmxlIGJ5IGNsaWNraW5nIGFueXdoZXJlLlxuICogQHBhcmFtIHt0eXBlfSBlXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gb25Nb3VzZU1vdmUoZSl7ICAgIFxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoIXRoaXMuX19tb3ZhYmxlLmFjdGl2ZSkgcmV0dXJuOyAgICBcblxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgbmV3IGN1cnNvciBwb3NpdGlvbjpcbiAgICBsZXQgZGVsdGFYID0gdGhpcy5fX21vdmFibGUubGFzdFggLSBlLmNsaWVudFg7XG4gICAgbGV0IGRlbHRhWSA9IHRoaXMuX19tb3ZhYmxlLmxhc3RZIC0gZS5jbGllbnRZO1xuICAgIHRoaXMuX19tb3ZhYmxlLmxhc3RYID0gZS5jbGllbnRYO1xuICAgIHRoaXMuX19tb3ZhYmxlLmxhc3RZID0gZS5jbGllbnRZO1xuICAgIFxuICAgIC8vIHNldCB0aGUgZWxlbWVudCdzIG5ldyBwb3NpdGlvbjpcbiAgICB0aGlzLnN0eWxlLnRvcCA9ICh0aGlzLm9mZnNldFRvcCAtIGRlbHRhWSkgKyBcInB4XCI7XG4gICAgdGhpcy5zdHlsZS5sZWZ0ID0gKHRoaXMub2Zmc2V0TGVmdCAtIGRlbHRhWCkgKyBcInB4XCI7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VEb3duKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLl9fbW92YWJsZS5hY3RpdmUgPSB0cnVlO1xuICAgIFxuICAgIC8vIGdldCB0aGUgbW91c2UgY3Vyc29yIHBvc2l0aW9uIGF0IHN0YXJ0dXA6XG4gICAgdGhpcy5fX21vdmFibGUubGFzdFggPSBlLmNsaWVudFg7XG4gICAgdGhpcy5fX21vdmFibGUubGFzdFkgPSBlLmNsaWVudFk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VVcChlKXtcbiAgICB0aGlzLl9fbW92YWJsZS5hY3RpdmUgPSBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIG5pZGdldC5fX21vdmFibGUgPSB7XG4gICAgICAgIGxhc3RYIDogMCxcbiAgICAgICAgbGFzdFkgOiAwLFxuICAgICAgICBhY3RpdmUgOiBmYWxzZVxuICAgIH07XG4gICAgXG4gICAgbmlkZ2V0Lm9uTW91c2VEb3duID0gb25Nb3VzZURvd24uYmluZChuaWRnZXQpOyAgICAgICAgXG4gICAgXG4gICAgaWYgKG5pZGdldC5xdWVyeVNlbGVjdG9yKFwiLm5pZGdldC1oZWFkZXJcIikpe1xuICAgICAgICBuaWRnZXQucXVlcnlTZWxlY3RvcihcIi5uaWRnZXQtaGVhZGVyXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgbmlkZ2V0Lm9uTW91c2VEb3duKTsgICAgICAgIFxuICAgIH0gZWxzZSB7XG4gICAgICAgIG5pZGdldC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIG5pZGdldC5vbk1vdXNlRG93bik7XG4gICAgfVxuICAgIFxuICAgIG5pZGdldC5vbk1vdXNlTW92ZSA9IG9uTW91c2VNb3ZlLmJpbmQobmlkZ2V0KTsgICAgXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbmlkZ2V0Lm9uTW91c2VNb3ZlKTtcblxuICAgIG5pZGdldC5vbk1vdXNlVXAgPSBvbk1vdXNlVXAuYmluZChuaWRnZXQpOyAgICBcbiAgICBuaWRnZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgbmlkZ2V0Lm9uTW91c2VVcCk7XG5cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0XCIpO1xud2luZG93Lk5pZGdldCA9IE5pZGdldDtcblxuLyoqXG4gKiBBZGQgYSByZXNpemUgb2JzZXJ2ZXIgdG8gdGhlIGVsZW1lbnQgdGhhdCB3aWxsIGNhbGwgYSBvblJlc2l6ZSgpIGZ1bmN0aW9uLlxuICogVGhlIHBhcmFtZXRlcnMgcGFzc2VkIGluIGFyZSAocHJldmlvdXNfZGltZW5zaW9ucykuICBUbyB1c2UgYWRkXG4gKiBpbnRlcmZhY2VzPVwicmVzaXplXCIgdG8gdGhlIGVsZW1lbnQgaW4gaHRtbCBhbmQgYSBtZXRob2Qgb25SZXNpemUoKSB0byB0aGUgXG4gKiBjbGFzcyBvYmplY3QuICBJZiB0aGVyZSBpcyBubyBjbGFzcyBvYmplY3QgY3JlYXRlIGEgZnVuY3Rpb24gYW5kIGJpbmQgaXQuXG4gKiBpZTogZWxlbWVudC5vblJlc2l6ZSA9IGZ1bmN0aW9uLmJpbmQoZWxlbWVudCk7IFxuICovXG5cbmxldCBvblJlc2l6ZSA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRhdGEgPSB0aGlzW05pZGdldC5pbnRlcmZhY2VEYXRhRmllbGRdLnJlc2l6ZTtcbiAgICBsZXQgcHJldiA9IGRhdGEucHJldjtcbiAgICBpZiAoIXRoaXMub25SZXNpemUpIHJldHVybjtcbiAgICB0aGlzLm9uUmVzaXplKHByZXYpO1xuICAgIGxvYWRQcmV2aW91cyh0aGlzKTtcbn07XG5cbmxldCBsb2FkUHJldmlvdXMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIGxldCBkYXRhID0gbmlkZ2V0W05pZGdldC5pbnRlcmZhY2VEYXRhRmllbGRdLnJlc2l6ZTtcbiAgICBkYXRhLnByZXYgPSB7XG4gICAgICAgIHdpZHRoIDogbmlkZ2V0Lm9mZnNldFdpZHRoLFxuICAgICAgICBoZWlnaHQgOiBuaWRnZXQub2Zmc2V0SGVpZ2h0XG4gICAgfTsgICAgXG59O1xuXG4vKipcbiAqIFNldHVwIGEgcmVzaXplIG9ic2VydmVyIGZvciB0aGUgbmlkZ2V0IHRoYXQgdHJpZ2dlcnMgdGhlIG9uUmVzaXplIG1ldGhvZCBpZiBcbiAqIGF2YWlsYWJsZS5cbiAqIC0gb25SZXNpemUodGhpcywgcHJldmlvdXNfZGltZW5zaW9ucykgOiBub25lXG4gKiBAcGFyYW0ge3R5cGV9IG5pZGdldFxuICogQHJldHVybiB7dW5kZWZpbmVkfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgaWYgKHR5cGVvZihuaWRnZXQpICE9PSBcIm9iamVjdFwiKSB0aHJvdyBuZXcgXCJPYmplY3QgZXhlY3RlZFwiO1xuICAgIGxldCByZXNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcihvblJlc2l6ZS5iaW5kKG5pZGdldCkpO1xuICAgIHJlc2l6ZU9ic2VydmVyLm9ic2VydmUobmlkZ2V0KTtcbiAgICBsb2FkUHJldmlvdXMobmlkZ2V0KTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQWJzdHJhY3RNb2RlbCA6IHJlcXVpcmUoXCIuL0Fic3RyYWN0TW9kZWxcIiksXG4gICAgTmlkZ2V0RWxlbWVudCA6IHJlcXVpcmUoXCIuL05pZGdldEVsZW1lbnRcIiksXG4gICAgRmlsZU9wZXJhdGlvbnMgOiByZXF1aXJlKFwiLi9GaWxlT3BlcmF0aW9uc1wiKSxcbiAgICBOaWRnZXRCdXR0b25TZXQgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b25TZXRcIiksXG4gICAgTmlkZ2V0QnV0dG9uIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uXCIpLFxuICAgIE5pZGdldEJ1dHRvblN0YXRlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU3RhdGVcIiksXG4gICAgTmlkZ2V0SW1hZ2UgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRJbWFnZVwiKSxcbiAgICBOaWRnZXRIVE1MSW1hZ2UgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRIVE1MSW1hZ2VcIiksXG4gICAgTmlkZ2V0VGV4dCA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldFRleHRcIiksXG4gICAgTmlkZ2V0Q29udGFpbmVyIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0Q29udGFpbmVyXCIpLFxuICAgIE1vdXNlVXRpbGl0aWVzIDogcmVxdWlyZShcIi4vTW91c2VVdGlsaXRpZXNcIiksXG4gICAgQ29uc3RhbnRzOiByZXF1aXJlKFwiLi9OaWRnZXRcIiksXG4gICAgbGF5b3V0czoge31cbn07IiwiY29uc3QgRmlsZU9wcyA9IHJlcXVpcmUoXCIuL21vZHVsZXMvRmlsZU9wcy5qc1wiKTtcclxuY29uc3QgQXV0aGVudGljYXRlID0gcmVxdWlyZShcIi4vbW9kdWxlcy9BdXRoZW50aWNhdGUuanNcIik7XHJcbmNvbnN0IE1lbnUgPSByZXF1aXJlKFwiLi9tb2R1bGVzL01lbnUuanNcIik7XHJcbmNvbnN0IFF1ZXN0aW9uUGFuZSA9IHJlcXVpcmUoXCIuL21vZHVsZXMvUXVlc3Rpb25QYW5lLmpzXCIpO1xyXG5jb25zdCBFZGl0b3JQYW5lID0gcmVxdWlyZShcIi4vbW9kdWxlcy9FZGl0b3JQYW5lLmpzXCIpO1xyXG5jb25zdCBNb2RlbCA9IHJlcXVpcmUoXCIuL21vZHVsZXMvTW9kZWxcIik7XHJcblxyXG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiQHRoYWVyaW91cy9uaWRnZXRcIilcclxucmVxdWlyZShcIi4vbW9kdWxlcy9HYW1lQm9hcmQuanNcIik7XHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvTXVsdGlwbGVDaG9pY2VQYW5lLmpzXCIpO1xyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL0NoZWNrQm94LmpzXCIpO1xyXG5cclxubGV0IGZpbGVPcHMgPSBuZXcgRmlsZU9wcygpO1xyXG5sZXQgbW9kZWwgPSBudWxsO1xyXG5sZXQgcXVlc3Rpb25QYW5lID0gbnVsbDtcclxubGV0IGVkaXRvclBhbmUgPSBudWxsO1xyXG5cclxud2luZG93Lm9ubG9hZCA9IGFzeW5jICgpID0+IHtcclxuICAgIHNldHVwKCk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNldHVwKCl7XHJcbiAgICBsZXQgc3RhcnQgPSBuZXcgRGF0ZSgpO1xyXG4gICAgYXdhaXQgTmlkZ2V0Lk5pZGdldEVsZW1lbnQubG9hZFRlbXBsYXRlU25pcHBldChcInNuaXBwZXRzL2NoZWNrLWJveC5odG1sXCIsIFwiY2hlY2stYm94XCIpO1xyXG4gICAgYXdhaXQgTmlkZ2V0Lk5pZGdldEVsZW1lbnQubG9hZFRlbXBsYXRlU25pcHBldChcInNuaXBwZXRzL211bHRpcGxlLWNob2ljZS1wYW5lLmh0bWxcIiwgXCJtdWx0aXBsZS1jaG9pY2UtcGFuZVwiKTtcclxuICAgIGF3YWl0IE5pZGdldC5OaWRnZXRFbGVtZW50LmxvYWRUZW1wbGF0ZVNuaXBwZXQoXCJzbmlwcGV0cy9nYW1lLWJvYXJkLmh0bWxcIiwgXCJnYW1lLWJvYXJkXCIpO1xyXG4gICAgYXdhaXQgTmlkZ2V0Lk5pZGdldEVsZW1lbnQubG9hZFRlbXBsYXRlU25pcHBldChcInNuaXBwZXRzL3F1ZXN0aW9uLXBhbmUuaHRtbFwiLCBcInF1ZXN0aW9uLXBhbmVcIik7XHJcblxyXG4gICAgcGFyc2VVUkxQYXJhbWV0ZXJzKCk7XHJcbiAgICBuZXcgTWVudSgpLmluaXQoXCIjbWVudVwiKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IG5ldyBBdXRoZW50aWNhdGUoKS5sb2FkQ2xpZW50KCk7XHJcbiAgICAgICAgYXdhaXQgZmlsZU9wcy5sb2FkQ2xpZW50KCk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBmaWxlID0gYXdhaXQgZmlsZU9wcy5nZXQod2luZG93LnBhcmFtZXRlcnMuZmlsZUlkKTtcclxuICAgIGxldCBtb2RlbCA9IG5ldyBNb2RlbChmaWxlT3BzKS5zZXQoSlNPTi5wYXJzZShmaWxlLmJvZHkpKTtcclxuICAgIHdpbmRvdy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1uYW1lXCIpLnRleHRDb250ZW50ID0gbW9kZWwubmFtZTtcclxuICAgIGVkaXRvclBhbmUgPSBuZXcgRWRpdG9yUGFuZShtb2RlbCk7XHJcbiAgICBlZGl0b3JQYW5lLm9uU2F2ZSA9IHNhdmVNb2RlbDtcclxuXHJcbiAgICBsZXQgZW5kID0gbmV3IERhdGUoKTtcclxuICAgIGxldCB0aW1lID0gZW5kIC0gc3RhcnQ7XHJcbiAgICBjb25zb2xlLmxvZyhcIkxvYWQgVGltZSBcIiArIHRpbWUgKyBcIiBtc1wiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhdmUgdGhlIG1vZGVsIHRvIHRoZSBnb29nbGUgYXBwIGRhdGEgZm9sZGVyLlxyXG4gKi9cclxuZnVuY3Rpb24gc2F2ZU1vZGVsKCkge1xyXG4gICAgZmlsZU9wcy5zZXRCb2R5KHdpbmRvdy5wYXJhbWV0ZXJzLmZpbGVJZCwgSlNPTi5zdHJpbmdpZnkod2luZG93Lm1vZGVsLmdldCgpLCBudWxsLCAyKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGFuZ2UgdGhlIG5hbWUgb2YgdGhlIGZpbGUgaW4gZ29vZ2xlJ3MgYXBwIGRhdGEgZm9sZGVyLlxyXG4gKi9cclxuZnVuY3Rpb24gcmVuYW1lTW9kZWwoKSB7XHJcbiAgICBsZXQgbmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1uYW1lXCIpLnRleHRDb250ZW50O1xyXG4gICAgZmlsZU9wcy5yZW5hbWUod2luZG93LnBhcmFtZXRlcnMuZmlsZUlkLCBuYW1lICsgXCIuanNvblwiKTtcclxuICAgIHdpbmRvdy5tb2RlbC5uYW1lID0gbmFtZTtcclxuICAgIHNhdmVNb2RlbCgpO1xyXG59XHJcblxyXG4vKipcclxuICogRXh0cmFjdCB2YWx1ZSBmcm9tIHRoZSBVUkwgc3RyaW5nLCBzdG9yZSBpbiAnd2luZG93LnBhcmFtZXRlcnMnLlxyXG4gKi9cclxuZnVuY3Rpb24gcGFyc2VVUkxQYXJhbWV0ZXJzKCkge1xyXG4gICAgd2luZG93LnBhcmFtZXRlcnMgPSB7fTtcclxuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKS5zcGxpdChcIiZcIik7XHJcbiAgICBmb3IgKGNvbnN0IHBhcmFtZXRlciBvZiBwYXJhbWV0ZXJzKSB7XHJcbiAgICAgICAgY29uc3Qgc3BsaXQgPSBwYXJhbWV0ZXIuc3BsaXQoLz0vKTtcclxuICAgICAgICB3aW5kb3cucGFyYW1ldGVyc1tzcGxpdFswXV0gPSBzcGxpdFsxXSA/PyBcIlwiO1xyXG4gICAgfVxyXG59IiwiLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2RyaXZlL2FwaS92My9xdWlja3N0YXJ0L2pzP2hsPWVuXHJcblxyXG5jbGFzcyBBdXRoZW50aWNhdGUge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHJlcXVpcmUoXCIuL2dvb2dsZUZpZWxkcy5qc1wiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZENsaWVudCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmxvYWQoJ2NsaWVudDphdXRoMicsICgpID0+IHRoaXMuX19pbml0Q2xpZW50KHJlc29sdmUsIHJlamVjdCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9faW5pdENsaWVudChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBnYXBpLmNsaWVudC5pbml0KHtcclxuICAgICAgICAgICAgYXBpS2V5OiB0aGlzLmRldmVsb3BlcktleSxcclxuICAgICAgICAgICAgY2xpZW50SWQ6IHRoaXMuY2xpZW50SWQsXHJcbiAgICAgICAgICAgIGRpc2NvdmVyeURvY3M6IHRoaXMuZGlzY292ZXJ5RG9jcyxcclxuICAgICAgICAgICAgc2NvcGU6IHRoaXMuc2NvcGVcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1IgSU5JVFwiKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlzQXV0aG9yaXplZCgpe1xyXG4gICAgICAgIHZhciB1c2VyID0gZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKS5jdXJyZW50VXNlci5nZXQoKTtcclxuICAgICAgICByZXR1cm4gdXNlci5oYXNHcmFudGVkU2NvcGVzKHRoaXMuc2NvcGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNpZ25Jbigpe1xyXG4gICAgICAgIGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuc2lnbkluKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2lnbk91dCgpe1xyXG4gICAgICAgIGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuc2lnbk91dCgpO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBdXRoZW50aWNhdGU7IiwiY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCJAVGhhZXJpb3VzL25pZGdldFwiKS5OaWRnZXRFbGVtZW50O1xyXG5cclxuY2xhc3MgVmFsdWVVcGFkYXRlIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IodmFsdWUpIHtcclxuICAgICAgICBzdXBlcigndmFsdWUtdXBkYXRlJyxcclxuICAgICAgICAgICAge2RldGFpbCA6IHt2YWx1ZSA6IHZhbHVlfX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBDaGVja0JveCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgYXN5bmMgY29ubmVjdGVkQ2FsbGJhY2soKXtcclxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdG9nZ2xlKCl7XHJcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tlZCA9PT0gJ3RydWUnKSB0aGlzLmNoZWNrZWQgPSAnZmFsc2UnO1xyXG4gICAgICAgIGVsc2UgdGhpcy5jaGVja2VkID0gJ3RydWUnXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGNoZWNrZWQoKXtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFKSl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFLCAnZmFsc2UnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgY2hlY2tlZCh2YWx1ZSl7XHJcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoQ2hlY2tCb3guQ0hFQ0tFRF9BVFRSSUJVVEUsIHZhbHVlKTtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFZhbHVlVXBhZGF0ZSh2YWx1ZSkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5DaGVja0JveC5DSEVDS0VEX0FUVFJJQlVURSA9IFwiY2hlY2tlZFwiO1xyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdjaGVjay1ib3gnLCBDaGVja0JveCk7XHJcbm1vZHVsZS5leHBvcnRzID0gQ2hlY2tCb3g7IiwiY29uc3QgTW9kZWwgPSByZXF1aXJlKFwiLi9Nb2RlbC5qc1wiKTtcclxuY29uc3QgRE9NID0gey8qIHNlZSBFZGl0b3JQYW5lLmNvbnN0cnVjdG9yICovfTtcclxuXHJcbmNsYXNzIE1DQW5zd2VyQ3RybCB7XHJcbiAgICBzdGF0aWMgcnVuKG1vZGVsLCBzYXZlQ0IpIHtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwubW9kZWwgID0gbW9kZWw7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLnNhdmVDQiA9IHNhdmVDQjtcclxuXHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5zaG93KCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUuc2V0VGV4dChpLCBtb2RlbC5hbnN3ZXJzW2ldLnRleHQpO1xyXG4gICAgICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLnNldENoZWNrZWQoaSwgbW9kZWwuYW5zd2Vyc1tpXS5pc1RydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlUmlnaHQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIE1DQW5zd2VyQ3RybC5jbGVhbnVwKTtcclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBNQ0Fuc3dlckN0cmwuY2xlYW51cCk7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5hZGRFdmVudExpc3RlbmVyKFwidGV4dC11cGRhdGVcIiwgTUNBbnN3ZXJDdHJsLnRleHRMaXN0KTtcclxuICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLmFkZEV2ZW50TGlzdGVuZXIoXCJ2YWx1ZS11cGRhdGVcIiwgTUNBbnN3ZXJDdHJsLnZhbHVlTGlzdCk7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5hZGRFdmVudExpc3RlbmVyKFwiYnV0dG9uLXF1ZXN0aW9uXCIsIE1DQW5zd2VyQ3RybC5xdWVzdExpc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyB0ZXh0TGlzdChldmVudCkge1xyXG4gICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGV2ZW50LmRldGFpbC5pbmRleCk7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLm1vZGVsLmFuc3dlcnNbaW5kZXhdLnRleHQgPSBldmVudC5kZXRhaWwudGV4dDtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwuc2F2ZUNCKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHZhbHVlTGlzdChldmVudCkge1xyXG4gICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGV2ZW50LmRldGFpbC5pbmRleCk7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLm1vZGVsLmFuc3dlcnNbaW5kZXhdLmlzVHJ1ZSA9IGV2ZW50LmRldGFpbC52YWx1ZTtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwuc2F2ZUNCKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHF1ZXN0TGlzdChldmVudCkge1xyXG4gICAgICAgIE1DQW5zd2VyQ3RybC5zYXZlQ0IoKTtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwuY2xlYW51cCgpO1xyXG4gICAgICAgIE1DUXVlc3Rpb25DdHJsLnJ1bihNQ0Fuc3dlckN0cmwubW9kZWwsIE1DQW5zd2VyQ3RybC5zYXZlQ0IpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjbGVhbnVwKCkge1xyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUuaGlkZSgpO1xyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRleHQtdXBkYXRlXCIsIE1DQW5zd2VyQ3RybC50ZXh0TGlzdCk7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwidmFsdWUtdXBkYXRlXCIsIE1DQW5zd2VyQ3RybC52YWx1ZUxpc3QpO1xyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJ1dHRvbi1xdWVzdGlvblwiLCBNQ0Fuc3dlckN0cmwucXVlc3RMaXN0KTtcclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNBbnN3ZXJDdHJsLmNsZWFudXApO1xyXG4gICAgICAgIERPTS50cmlhbmdsZUxlZnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIE1DQW5zd2VyQ3RybC5jbGVhbnVwKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTUNRdWVzdGlvbkN0cmwge1xyXG4gICAgc3RhdGljIHJ1bihtb2RlbCwgc2F2ZUNCKSB7XHJcbiAgICAgICAgTUNRdWVzdGlvbkN0cmwubW9kZWwgID0gbW9kZWw7XHJcbiAgICAgICAgTUNRdWVzdGlvbkN0cmwuc2F2ZUNCID0gc2F2ZUNCO1xyXG5cclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnNldFRleHQobW9kZWwucXVlc3Rpb24pO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuc2hvdygpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuYm9hcmRCdXR0b24gPSBmYWxzZTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmhpZ2hsaWdodCgncXVlc3Rpb24nKVxyXG5cclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNRdWVzdGlvbkN0cmwuY2xlYW51cCk7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlTGVmdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNRdWVzdGlvbkN0cmwuY2xlYW51cCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKFwidGV4dC11cGRhdGVcIiwgTUNRdWVzdGlvbkN0cmwudGV4dExpc3QpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuYWRkRXZlbnRMaXN0ZW5lcihcImJ1dHRvbi1hbnN3ZXJcIiwgTUNRdWVzdGlvbkN0cmwuYW5zd2VyTGlzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHRleHRMaXN0KGV2ZW50KSB7XHJcbiAgICAgICAgTUNRdWVzdGlvbkN0cmwubW9kZWwucXVlc3Rpb24gPSBldmVudC5kZXRhaWwudGV4dDtcclxuICAgICAgICBNQ1F1ZXN0aW9uQ3RybC5zYXZlQ0IoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYW5zd2VyTGlzdCgpIHtcclxuICAgICAgICBNQ1F1ZXN0aW9uQ3RybC5jbGVhbnVwKCk7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLnJ1bihNQ1F1ZXN0aW9uQ3RybC5tb2RlbCwgTUNRdWVzdGlvbkN0cmwuc2F2ZUNCKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgY2xlYW51cCgpIHtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmhpZGUoKTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0ZXh0LXVwZGF0ZVwiLCBNQ1F1ZXN0aW9uQ3RybC50ZXh0TGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiYnV0dG9uLWFuc3dlclwiLCBNQ1F1ZXN0aW9uQ3RybC5hbnN3ZXJMaXN0KTtcclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNRdWVzdGlvbkN0cmwuY2xlYW51cCk7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlTGVmdC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNRdWVzdGlvbkN0cmwuY2xlYW51cCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFF1ZXN0aW9uUGFuZUN0cmwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0gbW9kZWwgLSB0aGUgcXVlc3Rpb24gbW9kZWwgb2JqZWN0XHJcbiAgICAgKiBAcGFyYW0gZmllbGQgLSB3aGljaCBtb2RlbCBmaWVsZCB0byByZWFkL3dyaXRlIGZyb20geydhJywgJ3EnfVxyXG4gICAgICogQHBhcmFtIHNhdmVDQiAtIGNhbGwgdGhpcyBtZXRob2QgdG8gc2F2ZSB0aGUgbW9kZWxcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHJ1bihmaWVsZCwgbW9kZWwsIHNhdmVDQiwgY2xvc2VDQikge1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwubW9kZWwgICA9IG1vZGVsID8/IFF1ZXN0aW9uUGFuZUN0cmwubW9kZWw7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5maWVsZCAgID0gZmllbGQgPz8gUXVlc3Rpb25QYW5lQ3RybC5maWVsZDtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLnNhdmVDQiAgPSBzYXZlQ0IgPz8gUXVlc3Rpb25QYW5lQ3RybC5zYXZlQ0I7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5jbG9zZUNCID0gY2xvc2VDQiA/PyBRdWVzdGlvblBhbmVDdHJsLmNsb3NlQ0I7XHJcblxyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuc2V0VGV4dChRdWVzdGlvblBhbmVDdHJsLm1vZGVsW1F1ZXN0aW9uUGFuZUN0cmwuZmllbGRdKTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmJvYXJkQnV0dG9uID0gdHJ1ZTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnNob3coKTtcclxuICAgICAgICBET00uZ2FtZUJvYXJkLmhpZGUoKTtcclxuXHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKFwidGV4dC11cGRhdGVcIiwgUXVlc3Rpb25QYW5lQ3RybC50ZXh0TGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKFwiYnV0dG9uLWJvYXJkXCIsIFF1ZXN0aW9uUGFuZUN0cmwuYm9hcmRMaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmFkZEV2ZW50TGlzdGVuZXIoYGJ1dHRvbi0ke1F1ZXN0aW9uUGFuZUN0cmwuZmllbGR9YCwgUXVlc3Rpb25QYW5lQ3RybC5xdWVzdGlvbkxpc3QpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuaGlnaGxpZ2h0KFF1ZXN0aW9uUGFuZUN0cmwuZmllbGQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyB0ZXh0TGlzdChldmVudCkge1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwubW9kZWxbUXVlc3Rpb25QYW5lQ3RybC5maWVsZF0gPSBldmVudC5kZXRhaWwudGV4dDtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLnNhdmVDQigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBib2FyZExpc3QoZXZlbnQpIHtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLmNsZWFudXAoKTtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLmNsb3NlQ0IoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYW5zd2VyTGlzdChldmVudCkge1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwuY2xlYW51cCgpO1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwucnVuKCdhbnN3ZXInKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgcXVlc3Rpb25MaXN0KHZlbnQpIHtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLmNsZWFudXAoKTtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLnJ1bigncXVlc3Rpb24nKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgY2xlYW51cCgpIHtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0ZXh0LXVwZGF0ZVwiLCBRdWVzdGlvblBhbmVDdHJsLnRleHRMaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJidXR0b24tYm9hcmRcIiwgUXVlc3Rpb25QYW5lQ3RybC5ib2FyZExpc3QpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJ1dHRvbi1hbnN3ZXJcIiwgUXVlc3Rpb25QYW5lQ3RybC5hbnN3ZXJMaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJidXR0b24tcXVlc3Rpb25cIiwgUXVlc3Rpb25QYW5lQ3RybC5xdWVzdGlvbkxpc3QpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBFZGl0b3JQYW5lIHtcclxuICAgIGNvbnN0cnVjdG9yKG1vZGVsKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtdWx0aXBsZS1jaG9pY2UtcGFuZVwiKTtcclxuICAgICAgICBET00udHJpYW5nbGVSaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdHJpYW5nbGUtcmlnaHRcIik7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlTGVmdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdHJpYW5nbGUtbGVmdFwiKTtcclxuICAgICAgICBET00ucm91bmRMYWJlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcm91bmQtbnVtYmVyXCIpO1xyXG4gICAgICAgIERPTS5nYW1lTmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1uYW1lXCIpO1xyXG4gICAgICAgIERPTS5nYW1lQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtYm9hcmRcIik7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcXVlc3Rpb24tcGFuZVwiKVxyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtcmVtb3ZlLXJvdW5kXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwucmVtb3ZlUm91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVUcmlhbmdsZVZpZXcoKTtcclxuICAgICAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1ob21lLXNjcmVlblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gXCJob21lLmh0bWxcIjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LXZhbHVlLXBsdXNcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5pbmNyZWFzZVZhbHVlKCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtdmFsdWUtbWludXNcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5kZWNyZWFzZVZhbHVlKCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmluY3JlbWVudFJvdW5kKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuZGVjcmVtZW50Um91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIERPTS5nYW1lTmFtZS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVOYW1lKCk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtYm9hcmQtY29udGFpbmVyXCIpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LWFkZC1jYXRlZ29yeVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmFkZENhdGVnb3J5Um91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1hZGQtbXVsdGlwbGUtY2hvaWNlXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuYWRkTXVsdGlwbGVDaG9pY2VSb3VuZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZS1ib2FyZCBjaGFuZ2UgY2F0ZWdvcnkgdGV4dFxyXG4gICAgICAgIERPTS5nYW1lQm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImhlYWRlci11cGRhdGVcIiwgZXZlbnQgPT4ge1xyXG4gICAgICAgICAgICBsZXQgY29sID0gZXZlbnQuZGV0YWlsLmNvbDtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5nZXRDb2x1bW4oY29sKS5jYXRlZ29yeSA9IGV2ZW50LmRldGFpbC52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5nZXRDb2x1bW4oY29sKS5mb250U2l6ZSA9IGV2ZW50LmRldGFpbC5mb250U2l6ZTtcclxuICAgICAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZS1ib2FyZCBzZWxlY3QgY2VsbFxyXG4gICAgICAgIERPTS5nYW1lQm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNlbGwtc2VsZWN0XCIsIGV2ZW50ID0+IHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IGV2ZW50LmRldGFpbC5yb3c7XHJcbiAgICAgICAgICAgIGxldCBjb2wgPSBldmVudC5kZXRhaWwuY29sO1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVOYXZpZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBRdWVzdGlvblBhbmVDdHJsLnJ1bihcclxuICAgICAgICAgICAgICAgICdxdWVzdGlvbicsXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmdldENlbGwocm93LCBjb2wpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gdGhpcy5vblNhdmUoKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHRoaXMudXBkYXRlVmlldygpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uU2F2ZSgpIHtcclxuICAgICAgICAvLyBvdmVycmlkZSBtZVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZU5hbWUoKSB7XHJcbiAgICAgICAgLy8gb3ZlcnJpZGUgbWVcclxuICAgIH1cclxuXHJcbiAgICBoaWRlTmF2aWdhdGlvbigpIHtcclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlUmlnaHQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVWaWV3KG1vZGVsKSB7XHJcbiAgICAgICAgbW9kZWwgPSBtb2RlbCA/PyB0aGlzLm1vZGVsO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVHJpYW5nbGVWaWV3KCk7XHJcblxyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuaGlkZSgpO1xyXG4gICAgICAgIERPTS5nYW1lQm9hcmQuaGlkZSgpO1xyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUuaGlkZSgpO1xyXG5cclxuICAgICAgICBpZiAobW9kZWwuZ2V0Um91bmQoKS50eXBlID09PSBNb2RlbC5xdWVzdGlvblR5cGUuQ0FURUdPUlkpIHRoaXMuY2F0ZWdvcnlWaWV3KG1vZGVsKTtcclxuICAgICAgICBpZiAobW9kZWwuZ2V0Um91bmQoKS50eXBlID09PSBNb2RlbC5xdWVzdGlvblR5cGUuTVVMVElQTEVfQ0hPSUNFKSB0aGlzLm11bHRpcGxlQ2hvaWNlVmlldyhtb2RlbCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlVHJpYW5nbGVWaWV3KCkge1xyXG4gICAgICAgIERPTS50cmlhbmdsZUxlZnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRSb3VuZCA9PT0gMCkgRE9NLnRyaWFuZ2xlTGVmdC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRSb3VuZCA+PSB0aGlzLm1vZGVsLnJvdW5kQ291bnQgLSAxKSBET00udHJpYW5nbGVSaWdodC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIERPTS5yb3VuZExhYmVsLnRleHRDb250ZW50ID0gXCJSb3VuZCBcIiArICh0aGlzLm1vZGVsLmN1cnJlbnRSb3VuZCArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIG11bHRpcGxlQ2hvaWNlVmlldyhtb2RlbCkge1xyXG4gICAgICAgIE1DUXVlc3Rpb25DdHJsLnJ1bihcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5nZXRSb3VuZCgpLFxyXG4gICAgICAgICAgICAoKSA9PiB0aGlzLm9uU2F2ZSgpXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjYXRlZ29yeVZpZXcobW9kZWwpIHtcclxuICAgICAgICBET00uZ2FtZUJvYXJkLnNob3coKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgNjsgY29sKyspIHtcclxuICAgICAgICAgICAgbGV0IGNvbHVtbiA9IG1vZGVsLmdldENvbHVtbihjb2wpO1xyXG5cclxuICAgICAgICAgICAgRE9NLmdhbWVCb2FyZC5nZXRIZWFkZXIoY29sKS5maXRUZXh0LmxvY2sgPSBcInZoXCI7XHJcbiAgICAgICAgICAgIERPTS5nYW1lQm9hcmQuc2V0SGVhZGVyKGNvbCwgY29sdW1uLmNhdGVnb3J5LCBjb2x1bW4uZm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgNTsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIERPTS5nYW1lQm9hcmQuc2V0Q2VsbChyb3csIGNvbCwgY29sdW1uLmNlbGxbcm93XS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29sdW1uLmNlbGxbcm93XS5xID09PSBcIlwiKSBET00uZ2FtZUJvYXJkLnNldENvbXBsZXRlKHJvdywgY29sLCBcImZhbHNlXCIpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY29sdW1uLmNlbGxbcm93XS5hID09PSBcIlwiKSBET00uZ2FtZUJvYXJkLnNldENvbXBsZXRlKHJvdywgY29sLCBcInBhcnRpYWxcIik7XHJcbiAgICAgICAgICAgICAgICBlbHNlIERPTS5nYW1lQm9hcmQuc2V0Q29tcGxldGUocm93LCBjb2wsIFwidHJ1ZVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3JQYW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG4vLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZHJpdmUvYXBpL3YzL3F1aWNrc3RhcnQvanM/aGw9ZW5cclxuXHJcbmNsYXNzIEZpbGVPcHMge1xyXG5cclxuICAgIGFzeW5jIGxvYWQoKXtcclxuICAgICAgICBhd2FpdCB0aGlzLmxvYWRDbGllbnQoKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmxvYWREcml2ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDbGllbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZ2FwaS5sb2FkKCdjbGllbnQnLCAoKSA9PiByZXNvbHZlKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWREcml2ZSgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5sb2FkKCdkcml2ZScsICd2MycsIHJlc29sdmUoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgY3JlYXRlKCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgICAgbmFtZSA6IEZpbGVPcHMuZmlsZW5hbWUsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRzOiBbJ2FwcERhdGFGb2xkZXInXSxcclxuICAgICAgICAgICAgICAgIGZpZWxkczogXCJpZFwiXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy5yZXN1bHQuaWQpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGRlbGV0ZShmaWxlSWQpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuZGVsZXRlKHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZCA6IGZpbGVJZFxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0KTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGxpc3QoKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmxpc3Qoe1xyXG4gICAgICAgICAgICAgICAgLy8gcTogYG5hbWUgY29udGFpbnMgJy5qc29uJ2AsXHJcbiAgICAgICAgICAgICAgICBzcGFjZXM6ICdhcHBEYXRhRm9sZGVyJyxcclxuICAgICAgICAgICAgICAgIGZpZWxkczogJ2ZpbGVzL25hbWUsZmlsZXMvaWQsZmlsZXMvbW9kaWZpZWRUaW1lJ1xyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0LmZpbGVzKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXQoZmlsZUlkKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmdldCh7XHJcbiAgICAgICAgICAgICAgICBmaWxlSWQ6IGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIGFsdDogJ21lZGlhJ1xyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgc2V0Qm9keShmaWxlSWQsIGJvZHkpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQucmVxdWVzdCh7XHJcbiAgICAgICAgICAgICAgICBwYXRoIDogXCJ1cGxvYWQvZHJpdmUvdjMvZmlsZXMvXCIgKyBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICBtZXRob2QgOiBcIlBBVENIXCIsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXMgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkVHlwZSA6IFwibWVkaWFcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnMgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIiA6IFwiYXBwbGljYXRpb24vanNvblwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYm9keSA6IGJvZHlcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXMuYm9keSkpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVuYW1lKGZpbGVJZCwgZmlsZW5hbWUpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZDogZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogZmlsZW5hbWVcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXMuYm9keSkpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkZpbGVPcHMuZmlsZW5hbWUgPSBcIkdhbWUgTmFtZS5qc29uXCI7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcHM7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKiogVmlldy1Db250cm9sbGVyIGZvciB0aGUgSFRNTCBnYW1lIGJvYXJkIGVsZW1lbnRcclxuICAgIFRoaXMgaXMgdGhlIGNsYXNzaWNhbCBcIkplb3BhcmR5XCIgdHlwZSBib2FyZFxyXG4gICAgVGhpcyBpcyBtb2RlbCBhZ25vc3RpYywgc2VlIEVkaXRvclBhbmUuanMgZm9yIG1vZGVsIG1ldGhvZHNcclxuICAgIGdlbmVyYXRlcyB0aGUgZm9sbG93aW5nIGV2ZW50czpcclxuICAgICAgICBjZWxsLXNlbGVjdCAocm93LCBjb2wpOiB3aGVuIGEgdXNlciBjbGlja3MgYSBjZWxsXHJcbiAgICAgICAgaGVhZGVyLXVwZGF0ZSAodmFsdWUsIGNvbCwgZm9udHNpemUpIDogd2hlbiB0aGUgaGVhZGVyIHRleHQgY2hhbmdlcyAoYW5kIGJsdXJzKVxyXG4gKiovXHJcblxyXG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcblxyXG5jbGFzcyBDZWxsU2VsZWN0RXZlbnQgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3Rvcihyb3csIGNvbCkge1xyXG4gICAgICAgIHN1cGVyKCdjZWxsLXNlbGVjdCcsXHJcbiAgICAgICAgICAgICAge2RldGFpbCA6IHtyb3cgOiByb3csIGNvbCA6IGNvbCB9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEhlYWRlclVwZGF0ZUV2ZW50IGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoY29sLCB2YWx1ZSwgZm9udFNpemUpIHtcclxuICAgICAgICBzdXBlcignaGVhZGVyLXVwZGF0ZScsXHJcbiAgICAgICAgICAgIHtkZXRhaWwgOiB7dmFsdWUgOiB2YWx1ZSwgY29sIDogY29sLCBmb250U2l6ZSA6IGZvbnRTaXplfX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBHYW1lQm9hcmQgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVhZHkoKXtcclxuICAgICAgICBhd2FpdCBzdXBlci5yZWFkeSgpO1xyXG4gICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDY7IGNvbCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0SGVhZGVyKGNvbCkuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldmVudCk9PmV2ZW50LnRhcmdldC5maXRUZXh0Lm5vdGlmeSgxLCAxKSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldEhlYWRlcihjb2wpLmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIChldmVudCk9PntcclxuICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGV2ZW50LnRhcmdldClbXCJmb250LXNpemVcIl07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEhlYWRlclVwZGF0ZUV2ZW50KGNvbCwgZXZlbnQudGFyZ2V0LnRleHQsIGZvbnRTaXplKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgNTsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Q2VsbChyb3csIGNvbCkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IENlbGxTZWxlY3RFdmVudChyb3csIGNvbCkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIHZhbHVlIG9mIGEgY2F0ZWdvcnlcclxuICAgICAqIEBwYXJhbSBpbmRleFxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqL1xyXG4gICAgc2V0SGVhZGVyKGluZGV4LCB2YWx1ZSwgZm9udFNpemUpe1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy5nZXRIZWFkZXIoaW5kZXgpO1xyXG4gICAgICAgIGVsZW1lbnQudGV4dCA9IHZhbHVlO1xyXG4gICAgICAgIGlmIChmb250U2l6ZSkgZWxlbWVudC5zdHlsZVtcImZvbnQtc2l6ZVwiXSA9IGZvbnRTaXplO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmUgdGhlIGhlYWRlciBodG1sIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSBpbmRleFxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIGdldEhlYWRlcihpbmRleCl7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpbmRleCAhPT0gXCJudW1iZXJcIiB8fCBpbmRleCA8IDAgfHwgaW5kZXggPiA2KSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGluZGV4OiBcIiArIGluZGV4KTtcclxuICAgICAgICBsZXQgc2VsZWN0b3IgPSBgW2RhdGEtcm93PSdoJ11bZGF0YS1jb2w9JyR7aW5kZXh9J10gPiAudmFsdWVgO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSB2YWx1ZSBvZiBhIG5vbi1jYXRlZ29yeSBjZWxsLlxyXG4gICAgICogQHBhcmFtIHJvd1xyXG4gICAgICogQHBhcmFtIGNvbFxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIHNldENlbGwocm93LCBjb2wsIHZhbHVlID0gXCJcIil7XHJcbiAgICAgICAgdGhpcy5nZXRDZWxsKHJvdywgY29sKS50ZXh0Q29udGVudCA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENlbGwocm93LCBjb2wpe1xyXG4gICAgICAgIGxldCBzZWxlY3RvciA9IGBbZGF0YS1yb3c9XCIke3Jvd31cIl1bZGF0YS1jb2w9XCIke2NvbH1cIl0gPiAudmFsdWVgO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldENvbXBsZXRlKHJvdywgY29sLCB2YWx1ZSl7XHJcbiAgICAgICAgaWYgKHR5cGVvZiByb3cgIT09IFwibnVtYmVyXCIgfHwgcm93IDwgMCB8fCByb3cgPiA2KSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHJvdzogXCIgKyByb3cpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29sICE9PSBcIm51bWJlclwiIHx8IGNvbCA8IDAgfHwgY29sID4gNSkgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBjb2w6IFwiICsgY29sKTtcclxuICAgICAgICB0aGlzLmdldENlbGwocm93LCBjb2wpLnNldEF0dHJpYnV0ZShcImRhdGEtY29tcGxldGVcIiwgdmFsdWUpO1xyXG4gICAgfVxyXG59XHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdnYW1lLWJvYXJkJywgR2FtZUJvYXJkKTtcclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lQm9hcmQ7IiwiY2xhc3MgTWVudXtcclxuICAgIGluaXQobWVudVNlbGVjdG9yKXtcclxuICAgICAgICB0aGlzLm1lbnVTZWxlY3RvciA9IG1lbnVTZWxlY3RvcjtcclxuICAgICAgICB0aGlzLm1lbnVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLnRvZ2dsZU1lbnUoKSk7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbk1lbnUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5tZW51QXJlYS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKT0+IHRoaXMubW91c2VMZWF2ZSgpKTtcclxuICAgICAgICB0aGlzLm1lbnVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCk9PiB0aGlzLm1vdXNlTGVhdmUoKSk7XHJcbiAgICAgICAgdGhpcy5tZW51QXJlYS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKT0+IHRoaXMubW91c2VFbnRlcigpKTtcclxuICAgICAgICB0aGlzLm1lbnVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCk9PiB0aGlzLm1vdXNlRW50ZXIoKSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1hdXRvY2xvc2U9J3RydWUnXCIpLmZvckVhY2goKGVsZSk9PiB7XHJcbiAgICAgICAgICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMuY2xvc2UoKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc3ViLW1lbnVcIikuZm9yRWFjaCgoZWxlKT0+e1xyXG4gICAgICAgICAgICBlbGUucXVlcnlTZWxlY3RvcihcIi5tZW51LWxhYmVsXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVNZW51KGVsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSgpe1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zdWItbWVudSA+IC5tZW51LWFyZWFcIikuZm9yRWFjaCgoZWxlKT0+e1xyXG4gICAgICAgICAgICBlbGUuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBvcGVuKCl7XHJcbiAgICAgICAgdGhpcy5tZW51QXJlYS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb25NZW51KCk7XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VMZWF2ZSgpe1xyXG4gICAgICAgIGlmICh0aGlzLnRpbWVvdXQpIHJldHVybjtcclxuICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gbnVsbDtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlRW50ZXIoKXtcclxuICAgICAgICBpZiAoIXRoaXMudGltZW91dCkgcmV0dXJuO1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xyXG4gICAgICAgIHRoaXMudGltZW91dCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdG9nZ2xlTWVudShlbGVtZW50KXtcclxuICAgICAgICBlbGVtZW50ID0gZWxlbWVudCA/PyB0aGlzLm1lbnVBcmVhO1xyXG4gICAgICAgIGlmICghZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJtZW51LWFyZWFcIikpe1xyXG4gICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYXJlYVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImhpZGRlblwiKSl7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJtZW51LWFyZWFcIikpe1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5tZW51LWFyZWFcIikuZm9yRWFjaChcclxuICAgICAgICAgICAgICAgIChlbGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlbGUuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcG9zaXRpb25NZW51KCl7XHJcbiAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMubWVudUJ1dHRvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gICAgICAgIGNvbnN0IGJXaWR0aCA9IHRoaXMubWVudUJ1dHRvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuICAgICAgICBjb25zdCBtV2lkdGggPSB0aGlzLm1lbnVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG4gICAgICAgIGlmICgobGVmdCArIGJXaWR0aCArIG1XaWR0aCArIDIpID4gd2luZG93LmlubmVyV2lkdGgpe1xyXG4gICAgICAgICAgICB0aGlzLnNldE1lbnVMZWZ0KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRNZW51UmlnaHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWVudUxlZnQoKXtcclxuICAgICAgICBjb25zdCBsZWZ0ID0gdGhpcy5tZW51QnV0dG9uLm9mZnNldExlZnQ7XHJcbiAgICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLm1lbnVBcmVhLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuc3R5bGUubGVmdCA9IChsZWZ0IC0gd2lkdGggLSAyKSArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNZW51UmlnaHQoKXtcclxuICAgICAgICBjb25zdCBsZWZ0ID0gdGhpcy5tZW51QnV0dG9uLm9mZnNldExlZnQ7XHJcbiAgICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLm1lbnVCdXR0b24ub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgdGhpcy5tZW51QXJlYS5zdHlsZS5sZWZ0ID0gKGxlZnQgKyB3aWR0aCArIDIpICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBtZW51KCl7XHJcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5tZW51U2VsZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBtZW51QnV0dG9uKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWVudS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtaWNvblwiKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWVudUFyZWEoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZW51LnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hcmVhXCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbnU7IiwiY2xhc3MgTW9kZWwge1xyXG4gICAgaW5pdChuYW1lID0gXCJHYW1lIE5hbWVcIikge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFJvdW5kID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXHJcbiAgICAgICAgICAgIHJvdW5kczogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmFkZENhdGVnb3J5Um91bmQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBzZXQgbmFtZShzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5uYW1lID0gc3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBuYW1lKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5uYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHNldChnYW1lTW9kZWwpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZCA9IDA7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwgPSBnYW1lTW9kZWw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3VuZChpbmRleCkge1xyXG4gICAgICAgIGluZGV4ID0gaW5kZXggPz8gdGhpcy5jdXJyZW50Um91bmQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsLnJvdW5kc1tpbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29sdW1uKGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um91bmQoKS5jb2x1bW5baW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENlbGwocm93LCBjb2x1bW4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDb2x1bW4oY29sdW1uKS5jZWxsW3Jvd107XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlUm91bmQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucm91bmRDb3VudCA9PT0gMSkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5zcGxpY2UodGhpcy5jdXJyZW50Um91bmQsIDEpO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3VuZCA+PSB0aGlzLnJvdW5kQ291bnQpIHRoaXMuY3VycmVudFJvdW5kID0gdGhpcy5yb3VuZENvdW50IC0gMTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRNdWx0aXBsZUNob2ljZVJvdW5kKCl7XHJcbiAgICAgICAgbGV0IHJvdW5kID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBNb2RlbC5xdWVzdGlvblR5cGUuTVVMVElQTEVfQ0hPSUNFLFxyXG4gICAgICAgICAgICBxdWVzdGlvbiA6IFwiXCIsXHJcbiAgICAgICAgICAgIGFuc3dlcnMgOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKXtcclxuICAgICAgICAgICAgcm91bmQuYW5zd2Vyc1tpXSA9IHtcclxuICAgICAgICAgICAgICAgIHRleHQgOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgaXNUcnVlIDogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwucm91bmRzLnB1c2gocm91bmQpO1xyXG4gICAgICAgIHJldHVybiByb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICBhZGRDYXRlZ29yeVJvdW5kKCkge1xyXG4gICAgICAgIGxldCByb3VuZCA9IHtcclxuICAgICAgICAgICAgdHlwZTogTW9kZWwucXVlc3Rpb25UeXBlLkNBVEVHT1JZLFxyXG4gICAgICAgICAgICBjb2x1bW46IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldID0ge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBjZWxsOiBbXVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldLmNlbGxbal0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IChqICsgMSkgKiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcTogXCJcIixcclxuICAgICAgICAgICAgICAgICAgICBhOiBcIlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5wdXNoKHJvdW5kKTtcclxuICAgICAgICByZXR1cm4gcm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHJvdW5kQ291bnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgaW5jcmVtZW50Um91bmQoKXtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZCsrO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3VuZCA+PSB0aGlzLnJvdW5kQ291bnQpIHRoaXMuY3VycmVudFJvdW5kID0gdGhpcy5yb3VuZENvdW50IC0gMTtcclxuICAgIH1cclxuXHJcbiAgICBkZWNyZW1lbnRSb3VuZCgpe1xyXG4gICAgICAgIHRoaXMuY3VycmVudFJvdW5kLS07XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdW5kIDwgMCkgdGhpcy5jdXJyZW50Um91bmQgPSAwXHJcbiAgICB9XHJcblxyXG4gICAgaW5jcmVhc2VWYWx1ZSgpIHtcclxuICAgICAgICBsZXQgcm91bmQgPSB0aGlzLmdldFJvdW5kKCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgNTsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICByb3VuZC5jb2x1bW5baV0uY2VsbFtqXS52YWx1ZSAqPSAyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRlY3JlYXNlVmFsdWUoKSB7XHJcbiAgICAgICAgbGV0IHJvdW5kID0gdGhpcy5nZXRSb3VuZCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldLmNlbGxbal0udmFsdWUgLz0gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuTW9kZWwucXVlc3Rpb25UeXBlID0ge1xyXG4gICAgQ0FURUdPUlkgOiBcImNob2ljZVwiLFxyXG4gICAgTVVMVElQTEVfQ0hPSUNFIDogXCJtdWx0aXBsZV9jaG9pY2VcIlxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb2RlbDsiLCJjb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcbnJlcXVpcmUoXCIuL0NoZWNrQm94LmpzXCIpO1xyXG5cclxuY2xhc3MgVGV4dFVwZGF0ZSBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKGluZGV4LCB0ZXh0KSB7XHJcbiAgICAgICAgc3VwZXIoJ3RleHQtdXBkYXRlJyxcclxuICAgICAgICAgICAge2RldGFpbCA6IHtpbmRleCA6IGluZGV4LCB0ZXh0IDogdGV4dH19XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgVmFsdWVVcGRhdGUgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcihpbmRleCwgdmFsdWUpIHtcclxuICAgICAgICBzdXBlcigndmFsdWUtdXBkYXRlJyxcclxuICAgICAgICAgICAge2RldGFpbCA6IHtpbmRleCA6IGluZGV4LCB2YWx1ZSA6IHZhbHVlfX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBRdWVzdGlvbkNsaWNrIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoJ2J1dHRvbi1xdWVzdGlvbicpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBNdWx0aXBsZUNob2ljZVBhbmUgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuXHJcbiAgICBzZXRNb2RlbChtb2RlbCl7XHJcbiAgICAgICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlYWR5KCl7XHJcbiAgICAgICAgYXdhaXQgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMucXVlcnlTZWxlY3RvckFsbChcIi5hbnN3ZXIgPiBuaWRnZXQtdGV4dFwiKSl7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuZml0VGV4dC5sb2NrID0gXCJ2aFwiO1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZXZlbnQpPT50aGlzLnR4dExpc3RlbmVyKGV2ZW50KSk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgKGV2ZW50KT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtaW5kZXhcIik7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMucXVlcnlTZWxlY3RvcihgbmlkZ2V0LXRleHRbZGF0YS1pbmRleD1cIiR7aW5kZXh9XCJdYCkudGV4dDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgVGV4dFVwZGF0ZShpbmRleCwgdGV4dCkpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoXCJjaGVjay1ib3hcIikpe1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ2YWx1ZS11cGRhdGVcIiwgKGV2ZW50KT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZXZlbnQudGFyZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1pbmRleFwiKTtcclxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IGV2ZW50LmRldGFpbC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgVmFsdWVVcGRhdGUoaW5kZXgsIHZhbHVlKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctcXVlc3Rpb25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgUXVlc3Rpb25DbGljaygpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0eHRMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICAgIGlmIChldmVudC53aGljaCA9PT0gMTMpe1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGV2ZW50LnRhcmdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0taW5kZXhcIik7XHJcbiAgICAgICAgICAgIGluZGV4ID0gcGFyc2VJbnQoaW5kZXgpO1xyXG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gNSl7XHJcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQuYmx1cigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gYG5pZGdldC10ZXh0W2RhdGEtaW5kZXg9XCIke2luZGV4ICsgMX1cIl1gO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS5mb2N1cygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGV2ZW50LnRhcmdldC5maXRUZXh0Lm5vdGlmeSgxLCAxKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSBidXR0b24geydxdWVzdGlvbicsICdhbnN3ZXInfVxyXG4gICAgICovXHJcbiAgICBoaWdobGlnaHQoYnV0dG9uKXtcclxuICAgICAgICBmb3IgKGxldCBlbGUgb2YgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKGAuc2VsZWN0ZWRgKSkgZWxlLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoYCNzaG93LSR7YnV0dG9ufWApLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUZXh0KGluZGV4LCB0ZXh0KXtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoYG5pZGdldC10ZXh0W2RhdGEtaW5kZXg9XCIke2luZGV4fVwiXWApLnRleHQgPSB0ZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIHNldENoZWNrZWQoaW5kZXgsIHZhbHVlKXtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoYGNoZWNrLWJveFtkYXRhLWluZGV4PVwiJHtpbmRleH1cIl1gKS5jaGVja2VkID0gdmFsdWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ211bHRpcGxlLWNob2ljZS1wYW5lJywgTXVsdGlwbGVDaG9pY2VQYW5lKTtcclxubW9kdWxlLmV4cG9ydHMgPSBNdWx0aXBsZUNob2ljZVBhbmU7IiwiY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCJAVGhhZXJpb3VzL25pZGdldFwiKS5OaWRnZXRFbGVtZW50O1xyXG5cclxuY2xhc3MgVGV4dFVwZGF0ZSBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKHRleHQpIHtcclxuICAgICAgICBzdXBlcigndGV4dC11cGRhdGUnLFxyXG4gICAgICAgICAgICB7ZGV0YWlsIDoge3RleHQgOiB0ZXh0fX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBCb2FyZENsaWNrIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoJ2J1dHRvbi1ib2FyZCcpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBRdWVzdGlvbkNsaWNrIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoJ2J1dHRvbi1xdWVzdGlvbicpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBBbnN3ZXJDbGljayBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCdidXR0b24tYW5zd2VyJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFF1ZXN0aW9uUGFuZSBleHRlbmRzIE5pZGdldEVsZW1lbnR7XHJcblxyXG4gICAgYXN5bmMgcmVhZHkoKXtcclxuICAgICAgICBhd2FpdCBzdXBlci5yZWFkeSgpO1xyXG5cclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1ib2FyZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBCb2FyZENsaWNrKCkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1xdWVzdGlvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBRdWVzdGlvbkNsaWNrKCkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1hbnN3ZXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQW5zd2VyQ2xpY2soKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dC1jb250ZW50c1wiKS5mb2N1cygpKTtcclxuXHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3RleHQtY29udGVudHNcIikuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgYXN5bmMgKCk9PntcclxuICAgICAgICAgICAgbGV0IHRleHQgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dC1jb250ZW50c1wiKS50ZXh0O1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFRleHRVcGRhdGUodGV4dC50cmltKCkpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjbGVhcigpe1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpLnRleHQgPSBcIlwiO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRleHQodGV4dCl7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiLnRleHQtY29udGVudHNcIikudGV4dCA9IHRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0gYnV0dG9uIHsncXVlc3Rpb24nLCAnYW5zd2VyJ31cclxuICAgICAqL1xyXG4gICAgaGlnaGxpZ2h0KGJ1dHRvbil7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlIG9mIHRoaXMucXVlcnlTZWxlY3RvckFsbChgLnNlbGVjdGVkYCkpIGVsZS5jbGFzc0xpc3QucmVtb3ZlKFwic2VsZWN0ZWRcIik7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKGAjc2hvdy0ke2J1dHRvbn1gKS5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGJvYXJkQnV0dG9uKHZhbHVlKXtcclxuICAgICAgICBpZiAodmFsdWUpe1xyXG4gICAgICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1ib2FyZFwiKS5zaG93KCk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LWJvYXJkXCIpLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ3F1ZXN0aW9uLXBhbmUnLCBRdWVzdGlvblBhbmUpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXN0aW9uUGFuZTtcclxuXHJcblxyXG5cclxuIiwiXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgLy8gVGhlIEJyb3dzZXIgQVBJIGtleSBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuXHJcbiAgICBkZXZlbG9wZXJLZXkgOiAnQUl6YVN5QUJjZExtVDZISF83R284MnFfSUJHSTNqbTZVTDR3NFEwJyxcclxuXHJcbiAgICAvLyBUaGUgQ2xpZW50IElEIG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS4gUmVwbGFjZSB3aXRoIHlvdXIgb3duIENsaWVudCBJRC5cclxuICAgIGNsaWVudElkIDogXCIxNTg4MjMxMzQ2ODEtOThiZ2thbmdvbHRrNjM2dWtmOHBvZmVpczdwYTdqYmsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb21cIixcclxuXHJcbiAgICAvLyBSZXBsYWNlIHdpdGggeW91ciBvd24gcHJvamVjdCBudW1iZXIgZnJvbSBjb25zb2xlLmRldmVsb3BlcnMuZ29vZ2xlLmNvbS5cclxuICAgIGFwcElkIDogXCIxNTg4MjMxMzQ2ODFcIixcclxuXHJcbiAgICAvLyBBcnJheSBvZiBBUEkgZGlzY292ZXJ5IGRvYyBVUkxzIGZvciBBUElzIHVzZWQgYnkgdGhlIHF1aWNrc3RhcnRcclxuICAgIGRpc2NvdmVyeURvY3MgOiBbXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9kaXNjb3ZlcnkvdjEvYXBpcy9kcml2ZS92My9yZXN0XCJdLFxyXG5cclxuICAgIC8vIFNjb3BlIHRvIHVzZSB0byBhY2Nlc3MgdXNlcidzIERyaXZlIGl0ZW1zLlxyXG4gICAgc2NvcGU6IFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9kcml2ZS5maWxlXCJcclxufSJdfQ==
