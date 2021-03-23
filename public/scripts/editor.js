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
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],24:[function(require,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],25:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],26:[function(require,module,exports){
var setPrototypeOf = require("./setPrototypeOf.js");

var isNativeReflectConstruct = require("./isNativeReflectConstruct.js");

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    module.exports = _construct = Reflect.construct;
    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) setPrototypeOf(instance, Class.prototype);
      return instance;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _construct.apply(null, arguments);
}

module.exports = _construct;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./isNativeReflectConstruct.js":33,"./setPrototypeOf.js":35}],27:[function(require,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],28:[function(require,module,exports){
var superPropBase = require("./superPropBase.js");

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    module.exports = _get = Reflect.get;
    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _get = function _get(target, property, receiver) {
      var base = superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _get(target, property, receiver || target);
}

module.exports = _get;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./superPropBase.js":36}],29:[function(require,module,exports){
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],30:[function(require,module,exports){
var setPrototypeOf = require("./setPrototypeOf.js");

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

module.exports = _inherits;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./setPrototypeOf.js":35}],31:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],32:[function(require,module,exports){
function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

module.exports = _isNativeFunction;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],33:[function(require,module,exports){
function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = _isNativeReflectConstruct;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],34:[function(require,module,exports){
var _typeof = require("@babel/runtime/helpers/typeof")["default"];

var assertThisInitialized = require("./assertThisInitialized.js");

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./assertThisInitialized.js":23,"@babel/runtime/helpers/typeof":37}],35:[function(require,module,exports){
function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],36:[function(require,module,exports){
var getPrototypeOf = require("./getPrototypeOf.js");

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

module.exports = _superPropBase;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./getPrototypeOf.js":29}],37:[function(require,module,exports){
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _typeof(obj);
}

module.exports = _typeof;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{}],38:[function(require,module,exports){
var getPrototypeOf = require("./getPrototypeOf.js");

var setPrototypeOf = require("./setPrototypeOf.js");

var isNativeFunction = require("./isNativeFunction.js");

var construct = require("./construct.js");

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  module.exports = _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return construct(Class, arguments, getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return setPrototypeOf(Wrapper, Class);
  };

  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _wrapNativeSuper(Class);
}

module.exports = _wrapNativeSuper;
module.exports["default"] = module.exports, module.exports.__esModule = true;
},{"./construct.js":26,"./getPrototypeOf.js":29,"./isNativeFunction.js":32,"./setPrototypeOf.js":35}],39:[function(require,module,exports){
module.exports = require("regenerator-runtime");

},{"regenerator-runtime":40}],40:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],41:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _FileOps = _interopRequireDefault(require("./modules/FileOps.js"));

var _Authenticate = _interopRequireDefault(require("./modules/Authenticate.js"));

var _Menu = _interopRequireDefault(require("./modules/Menu.js"));

var _QuestionPane = _interopRequireDefault(require("./modules/QuestionPane.js"));

var _EditorPane = _interopRequireDefault(require("./modules/EditorPane.js"));

var _Model = _interopRequireDefault(require("./modules/Model"));

require("./modules/GameBoard.js");

require("./modules/MultipleChoicePane.js");

require("./modules/CheckBox.js");

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Nidget = require("@thaerious/nidget");

var fileOps = new _FileOps["default"]();
var model = null;
var questionPane = null;
var editorPane = null;
window.onload = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          setup();

        case 1:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}));

function setup() {
  return _setup.apply(this, arguments);
}
/**
 * Save the model to the google app data folder.
 */


function _setup() {
  _setup = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
    var start, file, model, end, time;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            start = new Date();
            _context2.next = 3;
            return Nidget.NidgetElement.loadTemplateSnippet("snippets/check-box.html", "check-box");

          case 3:
            _context2.next = 5;
            return Nidget.NidgetElement.loadTemplateSnippet("snippets/multiple-choice-pane.html", "multiple-choice-pane");

          case 5:
            _context2.next = 7;
            return Nidget.NidgetElement.loadTemplateSnippet("snippets/game-board.html", "game-board");

          case 7:
            _context2.next = 9;
            return Nidget.NidgetElement.loadTemplateSnippet("snippets/question-pane.html", "question-pane");

          case 9:
            parseURLParameters();
            new _Menu["default"]().init("#menu");
            _context2.prev = 11;
            _context2.next = 14;
            return new _Authenticate["default"]().loadClient();

          case 14:
            _context2.next = 16;
            return fileOps.loadClient();

          case 16:
            _context2.next = 21;
            break;

          case 18:
            _context2.prev = 18;
            _context2.t0 = _context2["catch"](11);
            console.log(_context2.t0);

          case 21:
            _context2.next = 23;
            return fileOps.get(window.parameters.fileId);

          case 23:
            file = _context2.sent;
            model = new _Model["default"](fileOps).set(JSON.parse(file.body));
            window.model = model;
            document.querySelector("#game-name").textContent = model.name;
            editorPane = new _EditorPane["default"](model);
            editorPane.onSave = saveModel;
            end = new Date();
            time = end - start;
            console.log("Load Time " + time + " ms");

          case 32:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[11, 18]]);
  }));
  return _setup.apply(this, arguments);
}

function saveModel() {
  fileOps.setBody(window.parameters.fileId, JSON.stringify(window.model.get(), null, 2));
}
/**
 * Change the name of the file in google's app data folder.
 */


function renameModel() {
  var name = document.querySelector("#game-name").textContent;
  fileOps.rename(window.parameters.fileId, name + ".json");
  window.model.name = name;
  saveModel();
}
/**
 * Extract value from the URL string, store in 'window.parameters'.
 */


function parseURLParameters() {
  window.parameters = {};
  var parameters = window.location.search.substr(1).split("&");

  var _iterator = _createForOfIteratorHelper(parameters),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _split$;

      var parameter = _step.value;
      var split = parameter.split(/=/);
      window.parameters[split[0]] = (_split$ = split[1]) !== null && _split$ !== void 0 ? _split$ : "";
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}

},{"./modules/Authenticate.js":42,"./modules/CheckBox.js":43,"./modules/EditorPane.js":44,"./modules/FileOps.js":45,"./modules/GameBoard.js":46,"./modules/Menu.js":47,"./modules/Model":48,"./modules/MultipleChoicePane.js":49,"./modules/QuestionPane.js":50,"@babel/runtime/helpers/asyncToGenerator":24,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/regenerator":39,"@thaerious/nidget":22}],42:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

// see https://developers.google.com/drive/api/v3/quickstart/js?hl=en
var Authenticate = /*#__PURE__*/function () {
  function Authenticate() {
    (0, _classCallCheck2["default"])(this, Authenticate);
    Object.assign(this, require("./googleFields.js"));
  }

  (0, _createClass2["default"])(Authenticate, [{
    key: "loadClient",
    value: function loadClient() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        gapi.load('client:auth2', function () {
          return _this.__initClient(resolve, reject);
        });
      });
    }
  }, {
    key: "__initClient",
    value: function __initClient(resolve, reject) {
      gapi.client.init({
        apiKey: this.developerKey,
        clientId: this.clientId,
        discoveryDocs: this.discoveryDocs,
        scope: this.scope
      }).then(function (result) {
        resolve();
      }, function (error) {
        console.log("ERROR INIT");
        console.log(error);
        reject(error);
      });
    }
  }, {
    key: "isAuthorized",
    value: function isAuthorized() {
      var user = gapi.auth2.getAuthInstance().currentUser.get();
      return user.hasGrantedScopes(this.scope);
    }
  }, {
    key: "signIn",
    value: function signIn() {
      gapi.auth2.getAuthInstance().signIn();
    }
  }, {
    key: "signOut",
    value: function signOut() {
      gapi.auth2.getAuthInstance().signOut();
    }
  }]);
  return Authenticate;
}();

module.exports = Authenticate;

},{"./googleFields.js":51,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31}],43:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var NidgetElement = require("@Thaerious/nidget").NidgetElement;

var ValueUpadate = /*#__PURE__*/function (_CustomEvent) {
  (0, _inherits2["default"])(ValueUpadate, _CustomEvent);

  var _super = _createSuper(ValueUpadate);

  function ValueUpadate(value) {
    (0, _classCallCheck2["default"])(this, ValueUpadate);
    return _super.call(this, 'value-update', {
      detail: {
        value: value
      }
    });
  }

  return ValueUpadate;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(CustomEvent));

var CheckBox = /*#__PURE__*/function (_NidgetElement) {
  (0, _inherits2["default"])(CheckBox, _NidgetElement);

  var _super2 = _createSuper(CheckBox);

  function CheckBox() {
    (0, _classCallCheck2["default"])(this, CheckBox);
    return _super2.apply(this, arguments);
  }

  (0, _createClass2["default"])(CheckBox, [{
    key: "connectedCallback",
    value: function () {
      var _connectedCallback = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var _this = this;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                (0, _get2["default"])((0, _getPrototypeOf2["default"])(CheckBox.prototype), "connectedCallback", this).call(this);
                this.addEventListener("click", function () {
                  _this.toggle();
                });

              case 2:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function connectedCallback() {
        return _connectedCallback.apply(this, arguments);
      }

      return connectedCallback;
    }()
  }, {
    key: "toggle",
    value: function toggle() {
      if (this.checked === 'true') this.checked = 'false';else this.checked = 'true';
    }
  }, {
    key: "checked",
    get: function get() {
      if (!this.hasAttribute(CheckBox.CHECKED_ATTRIBUTE)) {
        this.setAttribute(CheckBox.CHECKED_ATTRIBUTE, 'false');
      }

      return this.getAttribute(CheckBox.CHECKED_ATTRIBUTE);
    },
    set: function set(value) {
      this.setAttribute(CheckBox.CHECKED_ATTRIBUTE, value);
      this.dispatchEvent(new ValueUpadate(value));
    }
  }]);
  return CheckBox;
}(NidgetElement);

CheckBox.CHECKED_ATTRIBUTE = "checked";
window.customElements.define('check-box', CheckBox);
module.exports = CheckBox;

},{"@Thaerious/nidget":22,"@babel/runtime/helpers/asyncToGenerator":24,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/get":28,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":34,"@babel/runtime/helpers/wrapNativeSuper":38,"@babel/runtime/regenerator":39}],44:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _Model = _interopRequireDefault(require("./Model.js"));

var DOM = {
  /* see EditorPane.constructor */
};

var MCAnswerCtrl = /*#__PURE__*/function () {
  function MCAnswerCtrl() {
    (0, _classCallCheck2["default"])(this, MCAnswerCtrl);
  }

  (0, _createClass2["default"])(MCAnswerCtrl, null, [{
    key: "run",
    value: function run(model, saveCB) {
      MCAnswerCtrl.model = model;
      MCAnswerCtrl.saveCB = saveCB;
      DOM.multipleChoicePane.show();

      for (var i = 0; i < 6; i++) {
        DOM.multipleChoicePane.setText(i, model.answers[i].text);
        DOM.multipleChoicePane.setChecked(i, model.answers[i].isTrue);
      }

      DOM.triangleRight.addEventListener("click", MCAnswerCtrl.cleanup);
      DOM.triangleLeft.addEventListener("click", MCAnswerCtrl.cleanup);
      DOM.multipleChoicePane.addEventListener("text-update", MCAnswerCtrl.textList);
      DOM.multipleChoicePane.addEventListener("value-update", MCAnswerCtrl.valueList);
      DOM.multipleChoicePane.addEventListener("button-question", MCAnswerCtrl.questList);
    }
  }, {
    key: "textList",
    value: function textList(event) {
      var index = parseInt(event.detail.index);
      MCAnswerCtrl.model.answers[index].text = event.detail.text;
      MCAnswerCtrl.saveCB();
    }
  }, {
    key: "valueList",
    value: function valueList(event) {
      var index = parseInt(event.detail.index);
      MCAnswerCtrl.model.answers[index].isTrue = event.detail.value;
      MCAnswerCtrl.saveCB();
    }
  }, {
    key: "questList",
    value: function questList(event) {
      MCAnswerCtrl.saveCB();
      MCAnswerCtrl.cleanup();
      MCQuestionCtrl.run(MCAnswerCtrl.model, MCAnswerCtrl.saveCB);
    }
  }, {
    key: "cleanup",
    value: function cleanup() {
      DOM.multipleChoicePane.hide();
      DOM.multipleChoicePane.removeEventListener("text-update", MCAnswerCtrl.textList);
      DOM.multipleChoicePane.removeEventListener("value-update", MCAnswerCtrl.valueList);
      DOM.multipleChoicePane.removeEventListener("button-question", MCAnswerCtrl.questList);
      DOM.triangleRight.removeEventListener("click", MCAnswerCtrl.cleanup);
      DOM.triangleLeft.removeEventListener("click", MCAnswerCtrl.cleanup);
    }
  }]);
  return MCAnswerCtrl;
}();

var MCQuestionCtrl = /*#__PURE__*/function () {
  function MCQuestionCtrl() {
    (0, _classCallCheck2["default"])(this, MCQuestionCtrl);
  }

  (0, _createClass2["default"])(MCQuestionCtrl, null, [{
    key: "run",
    value: function run(model, saveCB) {
      MCQuestionCtrl.model = model;
      MCQuestionCtrl.saveCB = saveCB;
      DOM.questionPane.setText(model.question);
      DOM.questionPane.show();
      DOM.questionPane.boardButton = false;
      DOM.questionPane.highlight('question');
      DOM.triangleRight.addEventListener("click", MCQuestionCtrl.cleanup);
      DOM.triangleLeft.addEventListener("click", MCQuestionCtrl.cleanup);
      DOM.questionPane.addEventListener("text-update", MCQuestionCtrl.textList);
      DOM.questionPane.addEventListener("button-answer", MCQuestionCtrl.answerList);
    }
  }, {
    key: "textList",
    value: function textList(event) {
      MCQuestionCtrl.model.question = event.detail.text;
      MCQuestionCtrl.saveCB();
    }
  }, {
    key: "answerList",
    value: function answerList() {
      MCQuestionCtrl.cleanup();
      MCAnswerCtrl.run(MCQuestionCtrl.model, MCQuestionCtrl.saveCB);
    }
  }, {
    key: "cleanup",
    value: function cleanup() {
      DOM.questionPane.hide();
      DOM.questionPane.removeEventListener("text-update", MCQuestionCtrl.textList);
      DOM.questionPane.removeEventListener("button-answer", MCQuestionCtrl.answerList);
      DOM.triangleRight.removeEventListener("click", MCQuestionCtrl.cleanup);
      DOM.triangleLeft.removeEventListener("click", MCQuestionCtrl.cleanup);
    }
  }]);
  return MCQuestionCtrl;
}();

var QuestionPaneCtrl = /*#__PURE__*/function () {
  function QuestionPaneCtrl() {
    (0, _classCallCheck2["default"])(this, QuestionPaneCtrl);
  }

  (0, _createClass2["default"])(QuestionPaneCtrl, null, [{
    key: "run",
    value:
    /**
     * @param model - the question model object
     * @param field - which model field to read/write from {'a', 'q'}
     * @param saveCB - call this method to save the model
     */
    function run(field, model, saveCB, closeCB) {
      QuestionPaneCtrl.model = model !== null && model !== void 0 ? model : QuestionPaneCtrl.model;
      QuestionPaneCtrl.field = field !== null && field !== void 0 ? field : QuestionPaneCtrl.field;
      QuestionPaneCtrl.saveCB = saveCB !== null && saveCB !== void 0 ? saveCB : QuestionPaneCtrl.saveCB;
      QuestionPaneCtrl.closeCB = closeCB !== null && closeCB !== void 0 ? closeCB : QuestionPaneCtrl.closeCB;
      DOM.questionPane.setText(QuestionPaneCtrl.model[QuestionPaneCtrl.field.substr(0, 1)]);
      DOM.questionPane.boardButton = true;
      DOM.questionPane.show();
      DOM.gameBoard.hide();
      DOM.questionPane.addEventListener("text-update", QuestionPaneCtrl.textList);
      DOM.questionPane.addEventListener("button-board", QuestionPaneCtrl.boardList);
      DOM.questionPane.addEventListener("button-question", QuestionPaneCtrl.questionList);
      DOM.questionPane.addEventListener("button-answer", QuestionPaneCtrl.answerList);
      DOM.questionPane.highlight(QuestionPaneCtrl.field);
    }
  }, {
    key: "textList",
    value: function textList(event) {
      QuestionPaneCtrl.model[QuestionPaneCtrl.field.substr(0, 1)] = event.detail.text;
      QuestionPaneCtrl.saveCB();
    }
  }, {
    key: "boardList",
    value: function boardList(event) {
      QuestionPaneCtrl.cleanup();
      QuestionPaneCtrl.closeCB();
    }
  }, {
    key: "answerList",
    value: function answerList(event) {
      QuestionPaneCtrl.cleanup();
      QuestionPaneCtrl.run('answer');
    }
  }, {
    key: "questionList",
    value: function questionList(vent) {
      QuestionPaneCtrl.cleanup();
      QuestionPaneCtrl.run('question');
    }
  }, {
    key: "cleanup",
    value: function cleanup() {
      DOM.questionPane.removeEventListener("text-update", QuestionPaneCtrl.textList);
      DOM.questionPane.removeEventListener("button-board", QuestionPaneCtrl.boardList);
      DOM.questionPane.removeEventListener("button-answer", QuestionPaneCtrl.answerList);
      DOM.questionPane.removeEventListener("button-question", QuestionPaneCtrl.questionList);
    }
  }]);
  return QuestionPaneCtrl;
}();

var EditorPane = /*#__PURE__*/function () {
  function EditorPane(model) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, EditorPane);
    this.model = model;
    DOM.multipleChoicePane = document.querySelector("#multiple-choice-pane");
    DOM.triangleRight = document.querySelector("#triangle-right");
    DOM.triangleLeft = document.querySelector("#triangle-left");
    DOM.roundLabel = document.querySelector("#round-number > .text");
    DOM.gameName = document.querySelector("#game-name");
    DOM.gameBoard = document.querySelector("#game-board");
    DOM.questionPane = document.querySelector("#question-pane");
    DOM.menuIncreaseValue = document.querySelector("#menu-value-plus");
    DOM.menuDecreaseValue = document.querySelector("#menu-value-minus");
    document.querySelector("#menu-download").addEventListener("click", function () {
      var json = JSON.stringify(_this.model.gameModel, null, 2);
      var blob = new Blob([json], {
        type: "application/json"
      });
      var url = window.URL.createObjectURL(blob);
      var anchor = document.querySelector("#download-anchor");
      anchor.href = url;
      anchor.download = _this.model.name;
      anchor.click();
    });
    document.querySelector("#menu-remove-round").addEventListener("click", function () {
      _this.model.removeRound();

      _this.updateTriangleView();

      _this.onSave();

      _this.updateView();
    });
    document.querySelector("#menu-home-screen").addEventListener("click", function () {
      location.href = "home.html";
    });
    DOM.menuIncreaseValue.addEventListener("click", function () {
      _this.model.increaseValue();

      _this.onSave();

      _this.updateView();
    });
    DOM.menuDecreaseValue.addEventListener("click", function () {
      _this.model.decreaseValue();

      _this.onSave();

      _this.updateView();
    });
    DOM.triangleRight.addEventListener("click", function () {
      _this.model.incrementRound();

      _this.updateView();
    });
    DOM.triangleLeft.addEventListener("click", function () {
      _this.model.decrementRound();

      _this.updateView();
    });
    DOM.gameName.addEventListener("keydown", function (event) {
      if (event.which === 13) {
        _this.updateName();

        event.stopPropagation();
        event.preventDefault();
        document.querySelector("#game-board-container").focus();
        return false;
      }
    });
    document.querySelector("#menu-add-category").addEventListener("click", function () {
      _this.model.addCategoryRound();

      _this.updateView();

      _this.onSave();
    });
    document.querySelector("#menu-add-multiple-choice").addEventListener("click", function () {
      _this.model.addMultipleChoiceRound();

      _this.updateView();

      _this.onSave();
    }); // game-board change category text

    DOM.gameBoard.addEventListener("header-update", function (event) {
      var col = event.detail.col;
      _this.model.getColumn(col).category = event.detail.value;
      _this.model.getColumn(col).fontSize = event.detail.fontSize;

      _this.onSave();
    }); // game-board select cell

    DOM.gameBoard.addEventListener("cell-select", function (event) {
      var row = event.detail.row;
      var col = event.detail.col;

      _this.hideNavigation();

      QuestionPaneCtrl.run('question', _this.model.getCell(row, col), function () {
        return _this.onSave();
      }, function () {
        return _this.updateView();
      });
    });
    this.updateView();
  }

  (0, _createClass2["default"])(EditorPane, [{
    key: "onSave",
    value: function onSave() {// override me
    }
  }, {
    key: "updateName",
    value: function updateName() {// override me
    }
  }, {
    key: "hideNavigation",
    value: function hideNavigation() {
      DOM.triangleLeft.classList.add("hidden");
      DOM.triangleRight.classList.add("hidden");
    }
  }, {
    key: "updateView",
    value: function updateView(model) {
      var _model;

      model = (_model = model) !== null && _model !== void 0 ? _model : this.model;
      this.updateTriangleView();
      DOM.questionPane.hide();
      DOM.gameBoard.hide();
      DOM.multipleChoicePane.hide();
      if (model.getRound().type === _Model["default"].questionType.CATEGORY) this.categoryView(model);
      if (model.getRound().type === _Model["default"].questionType.MULTIPLE_CHOICE) this.multipleChoiceView(model);
    }
  }, {
    key: "updateTriangleView",
    value: function updateTriangleView() {
      DOM.triangleLeft.classList.remove("hidden");
      DOM.triangleRight.classList.remove("hidden");
      if (this.model.currentRound === 0) DOM.triangleLeft.classList.add("hidden");
      if (this.model.currentRound >= this.model.roundCount - 1) DOM.triangleRight.classList.add("hidden");
      DOM.roundLabel.textContent = "Round " + (this.model.currentRound + 1);
    }
  }, {
    key: "multipleChoiceView",
    value: function multipleChoiceView(model) {
      var _this2 = this;

      DOM.menuDecreaseValue.hide();
      DOM.menuIncreaseValue.hide();
      MCQuestionCtrl.run(this.model.getRound(), function () {
        return _this2.onSave();
      });
    }
  }, {
    key: "categoryView",
    value: function categoryView(model) {
      DOM.menuDecreaseValue.show();
      DOM.menuIncreaseValue.show();
      DOM.gameBoard.show();

      for (var col = 0; col < 6; col++) {
        var column = model.getColumn(col);
        DOM.gameBoard.getHeader(col).fitText.lock = "vh";
        DOM.gameBoard.setHeader(col, column.category, column.fontSize);

        for (var row = 0; row < 5; row++) {
          DOM.gameBoard.setCell(row, col, column.cell[row].value);
          if (column.cell[row].q === "") DOM.gameBoard.setComplete(row, col, "false");else if (column.cell[row].a === "") DOM.gameBoard.setComplete(row, col, "partial");else DOM.gameBoard.setComplete(row, col, "true");
        }
      }
    }
  }]);
  return EditorPane;
}();

module.exports = EditorPane;

},{"./Model.js":48,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31}],45:[function(require,module,exports){
"use strict"; // see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var FileOps = /*#__PURE__*/function () {
  function FileOps() {
    (0, _classCallCheck2["default"])(this, FileOps);
  }

  (0, _createClass2["default"])(FileOps, [{
    key: "load",
    value: function () {
      var _load = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.loadClient();

              case 2:
                _context.next = 4;
                return this.loadDrive();

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function load() {
        return _load.apply(this, arguments);
      }

      return load;
    }()
  }, {
    key: "loadClient",
    value: function loadClient() {
      return new Promise(function (resolve, reject) {
        gapi.load('client', function () {
          return resolve();
        });
      });
    }
  }, {
    key: "loadDrive",
    value: function loadDrive() {
      return new Promise(function (resolve, reject) {
        gapi.client.load('drive', 'v3', resolve());
      });
    }
  }, {
    key: "create",
    value: function () {
      var _create = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files.create({
                    name: FileOps.filename,
                    parents: ['appDataFolder'],
                    fields: "id"
                  }).then(function (res) {
                    resolve(res.result.id);
                  }, function (error) {
                    reject(error);
                  });
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function create() {
        return _create.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: "delete",
    value: function () {
      var _delete2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(fileId) {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files["delete"]({
                    fileId: fileId
                  }).then(function (res) {
                    resolve(res.result);
                  }, function (error) {
                    reject(error.message);
                  });
                }));

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function _delete(_x) {
        return _delete2.apply(this, arguments);
      }

      return _delete;
    }()
  }, {
    key: "list",
    value: function () {
      var _list = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                return _context4.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files.list({
                    // q: `name contains '.json'`,
                    spaces: 'appDataFolder',
                    fields: 'files/name,files/id,files/modifiedTime'
                  }).then(function (res) {
                    resolve(res.result.files);
                  }, function (error) {
                    reject(error);
                  });
                }));

              case 1:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));

      function list() {
        return _list.apply(this, arguments);
      }

      return list;
    }()
  }, {
    key: "get",
    value: function () {
      var _get = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(fileId) {
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files.get({
                    fileId: fileId,
                    alt: 'media'
                  }).then(function (res) {
                    resolve(res);
                  }, function (error) {
                    console.log(error);
                    reject(error.message);
                  });
                }));

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5);
      }));

      function get(_x2) {
        return _get.apply(this, arguments);
      }

      return get;
    }()
  }, {
    key: "setBody",
    value: function () {
      var _setBody = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6(fileId, body) {
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.request({
                    path: "upload/drive/v3/files/" + fileId,
                    method: "PATCH",
                    params: {
                      uploadType: "media"
                    },
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: body
                  }).then(function (res) {
                    resolve(JSON.parse(res.body));
                  }, function (error) {
                    console.log(error);
                    reject(error.message);
                  });
                }));

              case 1:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6);
      }));

      function setBody(_x3, _x4) {
        return _setBody.apply(this, arguments);
      }

      return setBody;
    }()
  }, {
    key: "rename",
    value: function () {
      var _rename = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7(fileId, filename) {
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                return _context7.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files.update({
                    fileId: fileId,
                    name: filename
                  }).then(function (res) {
                    resolve(JSON.parse(res.body));
                  }, function (error) {
                    console.log(error);
                    reject(error.message);
                  });
                }));

              case 1:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7);
      }));

      function rename(_x5, _x6) {
        return _rename.apply(this, arguments);
      }

      return rename;
    }()
  }]);
  return FileOps;
}();

FileOps.filename = "Game Name.json";
var _default = FileOps;
exports["default"] = _default;

},{"@babel/runtime/helpers/asyncToGenerator":24,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/regenerator":39}],46:[function(require,module,exports){
"use strict";
/** View-Controller for the HTML game board element
    This is the classical "Jeopardy" type board
    This is model agnostic, see EditorPane.js for model methods
    generates the following events:
        cell-select (row, col): when a user clicks a cell
        header-update (value, col, fontsize) : when the header text changes (and blurs)
 **/

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var NidgetElement = require("@Thaerious/nidget").NidgetElement;

var CellSelectEvent = /*#__PURE__*/function (_CustomEvent) {
  (0, _inherits2["default"])(CellSelectEvent, _CustomEvent);

  var _super = _createSuper(CellSelectEvent);

  function CellSelectEvent(row, col) {
    (0, _classCallCheck2["default"])(this, CellSelectEvent);
    return _super.call(this, 'cell-select', {
      detail: {
        row: row,
        col: col
      }
    });
  }

  return CellSelectEvent;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(CustomEvent));

var HeaderUpdateEvent = /*#__PURE__*/function (_CustomEvent2) {
  (0, _inherits2["default"])(HeaderUpdateEvent, _CustomEvent2);

  var _super2 = _createSuper(HeaderUpdateEvent);

  function HeaderUpdateEvent(col, value, fontSize) {
    (0, _classCallCheck2["default"])(this, HeaderUpdateEvent);
    return _super2.call(this, 'header-update', {
      detail: {
        value: value,
        col: col,
        fontSize: fontSize
      }
    });
  }

  return HeaderUpdateEvent;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(CustomEvent));

var GameBoard = /*#__PURE__*/function (_NidgetElement) {
  (0, _inherits2["default"])(GameBoard, _NidgetElement);

  var _super3 = _createSuper(GameBoard);

  function GameBoard() {
    (0, _classCallCheck2["default"])(this, GameBoard);
    return _super3.call(this);
  }

  (0, _createClass2["default"])(GameBoard, [{
    key: "ready",
    value: function () {
      var _ready = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var _this = this;

        var _loop, col;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _get2["default"])((0, _getPrototypeOf2["default"])(GameBoard.prototype), "ready", this).call(this);

              case 2:
                _loop = function _loop(col) {
                  _this.getHeader(col).addEventListener("input", function (event) {
                    return event.target.fitText.notify(1, 1);
                  });

                  _this.getHeader(col).addEventListener("blur", function (event) {
                    var fontSize = window.getComputedStyle(event.target)["font-size"];

                    _this.dispatchEvent(new HeaderUpdateEvent(col, event.target.text, fontSize));
                  });

                  var _loop2 = function _loop2(row) {
                    _this.getCell(row, col).addEventListener("click", function () {
                      _this.dispatchEvent(new CellSelectEvent(row, col));
                    });
                  };

                  for (var row = 0; row < 5; row++) {
                    _loop2(row);
                  }
                };

                for (col = 0; col < 6; col++) {
                  _loop(col);
                }

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function ready() {
        return _ready.apply(this, arguments);
      }

      return ready;
    }()
    /**
     * Set the value of a category
     * @param index
     * @param value
     * @param value
     */

  }, {
    key: "setHeader",
    value: function setHeader(index, value, fontSize) {
      var element = this.getHeader(index);
      element.text = value;
      if (fontSize) element.style["font-size"] = fontSize;
    }
    /**
     * Retrieve the header html element
     * @param index
     * @param value
     */

  }, {
    key: "getHeader",
    value: function getHeader(index) {
      if (typeof index !== "number" || index < 0 || index > 6) throw new Error("Invalid index: " + index);
      var selector = "[data-row='h'][data-col='".concat(index, "'] > .value");
      return this.querySelector(selector);
    }
    /**
     * Set the value of a non-category cell.
     * @param row
     * @param col
     * @param value
     */

  }, {
    key: "setCell",
    value: function setCell(row, col) {
      var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
      this.getCell(row, col).textContent = value;
    }
  }, {
    key: "getCell",
    value: function getCell(row, col) {
      var selector = "[data-row=\"".concat(row, "\"][data-col=\"").concat(col, "\"] > .value");
      return this.querySelector(selector);
    }
  }, {
    key: "setComplete",
    value: function setComplete(row, col, value) {
      if (typeof row !== "number" || row < 0 || row > 6) throw new Error("Invalid row: " + row);
      if (typeof col !== "number" || col < 0 || col > 5) throw new Error("Invalid col: " + col);
      this.getCell(row, col).setAttribute("data-complete", value);
    }
  }]);
  return GameBoard;
}(NidgetElement);

window.customElements.define('game-board', GameBoard);
module.exports = GameBoard;

},{"@Thaerious/nidget":22,"@babel/runtime/helpers/asyncToGenerator":24,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/get":28,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":34,"@babel/runtime/helpers/wrapNativeSuper":38,"@babel/runtime/regenerator":39}],47:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Menu = /*#__PURE__*/function () {
  function Menu() {
    (0, _classCallCheck2["default"])(this, Menu);
  }

  (0, _createClass2["default"])(Menu, [{
    key: "init",
    value: function init(menuSelector) {
      var _this = this;

      this.menuSelector = menuSelector;
      this.menuButton.addEventListener("click", function () {
        return _this.toggleMenu();
      });
      this.positionMenu();
      this.menuArea.addEventListener("mouseleave", function () {
        return _this.mouseLeave();
      });
      this.menuButton.addEventListener("mouseleave", function () {
        return _this.mouseLeave();
      });
      this.menuArea.addEventListener("mouseenter", function () {
        return _this.mouseEnter();
      });
      this.menuButton.addEventListener("mouseenter", function () {
        return _this.mouseEnter();
      });
      document.querySelectorAll("[data-autoclose='true'").forEach(function (ele) {
        ele.addEventListener("click", function () {
          return _this.close();
        });
      });
      document.querySelectorAll(".sub-menu").forEach(function (ele) {
        ele.querySelector(".menu-label").addEventListener("click", function () {
          _this.toggleMenu(ele);
        });
      });
      return this;
    }
  }, {
    key: "close",
    value: function close() {
      this.menuArea.classList.add("hidden");
      document.querySelectorAll(".sub-menu > .menu-area").forEach(function (ele) {
        ele.classList.add("hidden");
      });
    }
  }, {
    key: "open",
    value: function open() {
      this.menuArea.classList.remove("hidden");
      this.positionMenu();
    }
  }, {
    key: "mouseLeave",
    value: function mouseLeave() {
      var _this2 = this;

      if (this.timeout) return;
      this.timeout = setTimeout(function () {
        _this2.close();

        _this2.timeout = null;
      }, 500);
    }
  }, {
    key: "mouseEnter",
    value: function mouseEnter() {
      if (!this.timeout) return;
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }, {
    key: "toggleMenu",
    value: function toggleMenu(element) {
      var _element;

      element = (_element = element) !== null && _element !== void 0 ? _element : this.menuArea;

      if (!element.classList.contains("menu-area")) {
        element = element.querySelector(".menu-area");
      }

      if (element.classList.contains("hidden")) {
        element.classList.remove("hidden");
      } else {
        if (element.classList.contains("menu-area")) {
          element.classList.add("hidden");
        }

        element.querySelectorAll(".menu-area").forEach(function (ele) {
          ele.classList.add("hidden");
        });
      }
    }
  }, {
    key: "positionMenu",
    value: function positionMenu() {
      var left = this.menuButton.getBoundingClientRect().left;
      var bWidth = this.menuButton.getBoundingClientRect().width;
      var mWidth = this.menuArea.getBoundingClientRect().width;

      if (left + bWidth + mWidth + 2 > window.innerWidth) {
        this.setMenuLeft();
      } else {
        this.setMenuRight();
      }
    }
  }, {
    key: "setMenuLeft",
    value: function setMenuLeft() {
      var left = this.menuButton.offsetLeft;
      var width = this.menuArea.offsetWidth;
      this.menuArea.style.left = left - width - 2 + "px";
    }
  }, {
    key: "setMenuRight",
    value: function setMenuRight() {
      var left = this.menuButton.offsetLeft;
      var width = this.menuButton.offsetWidth;
      this.menuArea.style.left = left + width + 2 + "px";
    }
  }, {
    key: "menu",
    get: function get() {
      return document.querySelector(this.menuSelector);
    }
  }, {
    key: "menuButton",
    get: function get() {
      return this.menu.querySelector(".menu-icon");
    }
  }, {
    key: "menuArea",
    get: function get() {
      return this.menu.querySelector(".menu-area");
    }
  }]);
  return Menu;
}();

module.exports = Menu;

},{"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31}],48:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Model = /*#__PURE__*/function () {
  function Model() {
    (0, _classCallCheck2["default"])(this, Model);
  }

  (0, _createClass2["default"])(Model, [{
    key: "init",
    value: function init() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Game Name";
      this.currentRound = 0;
      this.gameModel = {
        name: name,
        rounds: []
      };
      this.addCategoryRound();
      return this;
    }
  }, {
    key: "name",
    get: function get() {
      return this.gameModel.name;
    },
    set: function set(string) {
      this.gameModel.name = string;
    }
  }, {
    key: "set",
    value: function set(gameModel) {
      this.currentRound = 0;
      this.gameModel = gameModel;
      return this;
    }
  }, {
    key: "get",
    value: function get() {
      return this.gameModel;
    }
  }, {
    key: "getRound",
    value: function getRound(index) {
      var _index;

      index = (_index = index) !== null && _index !== void 0 ? _index : this.currentRound;
      return this.gameModel.rounds[index];
    }
  }, {
    key: "getColumn",
    value: function getColumn(index) {
      return this.getRound().column[index];
    }
  }, {
    key: "getCell",
    value: function getCell(row, column) {
      return this.getColumn(column).cell[row];
    }
  }, {
    key: "removeRound",
    value: function removeRound() {
      if (this.roundCount === 1) return;
      this.gameModel.rounds.splice(this.currentRound, 1);
      if (this.currentRound >= this.roundCount) this.currentRound = this.roundCount - 1;
    }
  }, {
    key: "addMultipleChoiceRound",
    value: function addMultipleChoiceRound() {
      var round = {
        type: Model.questionType.MULTIPLE_CHOICE,
        question: "",
        answers: []
      };

      for (var i = 0; i < 6; i++) {
        round.answers[i] = {
          text: "",
          isTrue: false
        };
      }

      this.gameModel.rounds.push(round);
      return round;
    }
  }, {
    key: "addCategoryRound",
    value: function addCategoryRound() {
      var round = {
        type: Model.questionType.CATEGORY,
        column: []
      };

      for (var i = 0; i < 6; i++) {
        round.column[i] = {
          category: "",
          cell: []
        };

        for (var j = 0; j < 5; j++) {
          round.column[i].cell[j] = {
            value: (j + 1) * 100,
            type: "text",
            q: "",
            a: ""
          };
        }
      }

      this.gameModel.rounds.push(round);
      return round;
    }
  }, {
    key: "roundCount",
    get: function get() {
      return this.gameModel.rounds.length;
    }
  }, {
    key: "incrementRound",
    value: function incrementRound() {
      this.currentRound++;
      if (this.currentRound >= this.roundCount) this.currentRound = this.roundCount - 1;
    }
  }, {
    key: "decrementRound",
    value: function decrementRound() {
      this.currentRound--;
      if (this.currentRound < 0) this.currentRound = 0;
    }
  }, {
    key: "increaseValue",
    value: function increaseValue() {
      var round = this.getRound();

      for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 5; j++) {
          round.column[i].cell[j].value *= 2;
        }
      }
    }
  }, {
    key: "decreaseValue",
    value: function decreaseValue() {
      var round = this.getRound();

      for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 5; j++) {
          round.column[i].cell[j].value /= 2;
        }
      }
    }
  }]);
  return Model;
}();

Model.questionType = {
  CATEGORY: "choice",
  MULTIPLE_CHOICE: "multiple_choice"
};
var _default = Model;
exports["default"] = _default;

},{"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31}],49:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var NidgetElement = require("@Thaerious/nidget").NidgetElement;

require("./CheckBox.js");

var TextUpdate = /*#__PURE__*/function (_CustomEvent) {
  (0, _inherits2["default"])(TextUpdate, _CustomEvent);

  var _super = _createSuper(TextUpdate);

  function TextUpdate(index, text) {
    (0, _classCallCheck2["default"])(this, TextUpdate);
    return _super.call(this, 'text-update', {
      detail: {
        index: index,
        text: text
      }
    });
  }

  return TextUpdate;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(CustomEvent));

var ValueUpdate = /*#__PURE__*/function (_CustomEvent2) {
  (0, _inherits2["default"])(ValueUpdate, _CustomEvent2);

  var _super2 = _createSuper(ValueUpdate);

  function ValueUpdate(index, value) {
    (0, _classCallCheck2["default"])(this, ValueUpdate);
    return _super2.call(this, 'value-update', {
      detail: {
        index: index,
        value: value
      }
    });
  }

  return ValueUpdate;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(CustomEvent));

var QuestionClick = /*#__PURE__*/function (_CustomEvent3) {
  (0, _inherits2["default"])(QuestionClick, _CustomEvent3);

  var _super3 = _createSuper(QuestionClick);

  function QuestionClick() {
    (0, _classCallCheck2["default"])(this, QuestionClick);
    return _super3.call(this, 'button-question');
  }

  return QuestionClick;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(CustomEvent));

var MultipleChoicePane = /*#__PURE__*/function (_NidgetElement) {
  (0, _inherits2["default"])(MultipleChoicePane, _NidgetElement);

  var _super4 = _createSuper(MultipleChoicePane);

  function MultipleChoicePane() {
    (0, _classCallCheck2["default"])(this, MultipleChoicePane);
    return _super4.apply(this, arguments);
  }

  (0, _createClass2["default"])(MultipleChoicePane, [{
    key: "setModel",
    value: function setModel(model) {
      this.model = model;
    }
  }, {
    key: "ready",
    value: function () {
      var _ready = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var _this = this;

        var _iterator, _step, element, _iterator2, _step2, _element;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _get2["default"])((0, _getPrototypeOf2["default"])(MultipleChoicePane.prototype), "connectedCallback", this).call(this);

              case 2:
                _iterator = _createForOfIteratorHelper(this.querySelectorAll(".answer > nidget-text"));

                try {
                  for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    element = _step.value;
                    element.fitText.lock = "vh";
                    element.addEventListener("keypress", function (event) {
                      return _this.txtListener(event);
                    });
                    element.addEventListener("blur", function (event) {
                      var index = event.target.getAttribute("data-index");

                      var text = _this.querySelector("nidget-text[data-index=\"".concat(index, "\"]")).text;

                      _this.dispatchEvent(new TextUpdate(index, text));
                    });
                  }
                } catch (err) {
                  _iterator.e(err);
                } finally {
                  _iterator.f();
                }

                _iterator2 = _createForOfIteratorHelper(this.querySelectorAll("check-box"));

                try {
                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                    _element = _step2.value;

                    _element.addEventListener("value-update", function (event) {
                      var index = window.getComputedStyle(event.target).getPropertyValue("--index");
                      var value = event.detail.value;

                      _this.dispatchEvent(new ValueUpdate(index, value));
                    });
                  }
                } catch (err) {
                  _iterator2.e(err);
                } finally {
                  _iterator2.f();
                }

                this.querySelector("#show-question").addEventListener("click", function () {
                  _this.dispatchEvent(new QuestionClick());
                });

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function ready() {
        return _ready.apply(this, arguments);
      }

      return ready;
    }()
  }, {
    key: "txtListener",
    value: function txtListener(event) {
      if (event.which === 13) {
        event.stopPropagation();
        event.preventDefault();
        var index = window.getComputedStyle(event.target).getPropertyValue("--index");
        index = parseInt(index);

        if (index >= 5) {
          event.target.blur();
        } else {
          var selector = "nidget-text[data-index=\"".concat(index + 1, "\"]");
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

  }, {
    key: "highlight",
    value: function highlight(button) {
      var _iterator3 = _createForOfIteratorHelper(this.querySelectorAll(".selected")),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var ele = _step3.value;
          ele.classList.remove("selected");
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      this.querySelector("#show-".concat(button)).classList.add("selected");
    }
  }, {
    key: "setText",
    value: function setText(index, text) {
      this.querySelector("nidget-text[data-index=\"".concat(index, "\"]")).text = text;
    }
  }, {
    key: "setChecked",
    value: function setChecked(index, value) {
      this.querySelector("check-box[data-index=\"".concat(index, "\"]")).checked = value;
    }
  }]);
  return MultipleChoicePane;
}(NidgetElement);

window.customElements.define('multiple-choice-pane', MultipleChoicePane);
module.exports = MultipleChoicePane;

},{"./CheckBox.js":43,"@Thaerious/nidget":22,"@babel/runtime/helpers/asyncToGenerator":24,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/get":28,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":34,"@babel/runtime/helpers/wrapNativeSuper":38,"@babel/runtime/regenerator":39}],50:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var NidgetElement = require("@Thaerious/nidget").NidgetElement;

var TextUpdate = /*#__PURE__*/function (_CustomEvent) {
  (0, _inherits2["default"])(TextUpdate, _CustomEvent);

  var _super = _createSuper(TextUpdate);

  function TextUpdate(text) {
    (0, _classCallCheck2["default"])(this, TextUpdate);
    return _super.call(this, 'text-update', {
      detail: {
        text: text
      }
    });
  }

  return TextUpdate;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(CustomEvent));

var BoardClick = /*#__PURE__*/function (_CustomEvent2) {
  (0, _inherits2["default"])(BoardClick, _CustomEvent2);

  var _super2 = _createSuper(BoardClick);

  function BoardClick() {
    (0, _classCallCheck2["default"])(this, BoardClick);
    return _super2.call(this, 'button-board');
  }

  return BoardClick;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(CustomEvent));

var QuestionClick = /*#__PURE__*/function (_CustomEvent3) {
  (0, _inherits2["default"])(QuestionClick, _CustomEvent3);

  var _super3 = _createSuper(QuestionClick);

  function QuestionClick() {
    (0, _classCallCheck2["default"])(this, QuestionClick);
    return _super3.call(this, 'button-question');
  }

  return QuestionClick;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(CustomEvent));

var AnswerClick = /*#__PURE__*/function (_CustomEvent4) {
  (0, _inherits2["default"])(AnswerClick, _CustomEvent4);

  var _super4 = _createSuper(AnswerClick);

  function AnswerClick() {
    (0, _classCallCheck2["default"])(this, AnswerClick);
    return _super4.call(this, 'button-answer');
  }

  return AnswerClick;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(CustomEvent));

var QuestionPane = /*#__PURE__*/function (_NidgetElement) {
  (0, _inherits2["default"])(QuestionPane, _NidgetElement);

  var _super5 = _createSuper(QuestionPane);

  function QuestionPane() {
    (0, _classCallCheck2["default"])(this, QuestionPane);
    return _super5.apply(this, arguments);
  }

  (0, _createClass2["default"])(QuestionPane, [{
    key: "ready",
    value: function () {
      var _ready = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var _this = this;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return (0, _get2["default"])((0, _getPrototypeOf2["default"])(QuestionPane.prototype), "ready", this).call(this);

              case 2:
                this.querySelector("#show-board").addEventListener("click", function () {
                  _this.dispatchEvent(new BoardClick());
                });
                this.querySelector("#show-question").addEventListener("click", function () {
                  _this.dispatchEvent(new QuestionClick());
                });
                this.querySelector("#show-answer").addEventListener("click", function () {
                  _this.dispatchEvent(new AnswerClick());
                });
                this.addEventListener("click", function () {
                  return _this.querySelector(".text-contents").focus();
                });
                this.querySelector("#text-contents").addEventListener("blur", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
                  var text;
                  return _regenerator["default"].wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          text = _this.querySelector(".text-contents").text;

                          _this.dispatchEvent(new TextUpdate(text.trim()));

                        case 2:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee);
                })));

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function ready() {
        return _ready.apply(this, arguments);
      }

      return ready;
    }()
  }, {
    key: "clear",
    value: function clear() {
      this.querySelector(".text-contents").text = "";
    }
  }, {
    key: "setText",
    value: function setText(text) {
      this.querySelector(".text-contents").text = text;
    }
    /**
     * @param button {'question', 'answer'}
     */

  }, {
    key: "highlight",
    value: function highlight(button) {
      var _iterator = _createForOfIteratorHelper(this.querySelectorAll(".selected")),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var ele = _step.value;
          ele.classList.remove("selected");
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.querySelector("#show-".concat(button)).classList.add("selected");
    }
  }, {
    key: "boardButton",
    set: function set(value) {
      if (value) {
        this.querySelector("#show-board").show();
      } else {
        this.querySelector("#show-board").hide();
      }
    }
  }]);
  return QuestionPane;
}(NidgetElement);

window.customElements.define('question-pane', QuestionPane);
module.exports = QuestionPane;

},{"@Thaerious/nidget":22,"@babel/runtime/helpers/asyncToGenerator":24,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/get":28,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":34,"@babel/runtime/helpers/wrapNativeSuper":38,"@babel/runtime/regenerator":39}],51:[function(require,module,exports){
"use strict";

module.exports = {
  // The Browser API key obtained from the Google API Console.
  developerKey: 'AIzaSyABcdLmT6HH_7Go82q_IBGI3jm6UL4w4Q0',
  // The Client ID obtained from the Google API Console. Replace with your own Client ID.
  clientId: "158823134681-98bgkangoltk636ukf8pofeis7pa7jbk.apps.googleusercontent.com",
  // Replace with your own project number from console.developers.google.com.
  appId: "158823134681",
  // Array of API discovery doc URLs for APIs used by the quickstart
  discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
  // Scope to use to access user's Drive items.
  scope: "https://www.googleapis.com/auth/drive.file"
};

},{}]},{},[41])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0Fic3RyYWN0TW9kZWwuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0RyYWdIYW5kbGVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9GaWxlT3BlcmF0aW9ucy5qcyIsIi4uLy4uL25pZGdldC9zcmMvSW50ZXJmYWNlcy5qcyIsIi4uLy4uL25pZGdldC9zcmMvTW91c2VVdGlsaXRpZXMuanMiLCIuLi8uLi9uaWRnZXQvc3JjL05pZGdldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0RWxlbWVudC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0U3R5bGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL1RyYW5zZm9ybWVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b24uanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblNldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU3RhdGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldENvbnRhaW5lci5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SFRNTEltYWdlLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRJbWFnZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0VGV4dC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJhZy5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJvcC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvTW91c2UuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL01vdmFibGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL1Jlc2l6ZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvcHJvamVjdEZpbGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3luY1RvR2VuZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2suanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jb25zdHJ1Y3QuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jcmVhdGVDbGFzcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2dldC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2dldFByb3RvdHlwZU9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pc05hdGl2ZUZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvcG9zc2libGVDb25zdHJ1Y3RvclJldHVybi5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3NldFByb3RvdHlwZU9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvc3VwZXJQcm9wQmFzZS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZi5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3dyYXBOYXRpdmVTdXBlci5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUuanMiLCJzcmMvY2xpZW50L2VkaXRvci5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9BdXRoZW50aWNhdGUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvQ2hlY2tCb3guanMiLCJzcmMvY2xpZW50L21vZHVsZXMvRWRpdG9yUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9GaWxlT3BzLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0dhbWVCb2FyZC5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9NZW51LmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL01vZGVsLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL011bHRpcGxlQ2hvaWNlUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9RdWVzdGlvblBhbmUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvZ29vZ2xlRmllbGRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7OztBQzV1QkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBSkEsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLG1CQUFELENBQXRCOztBQU1BLElBQUksT0FBTyxHQUFHLElBQUksbUJBQUosRUFBZDtBQUNBLElBQUksS0FBSyxHQUFHLElBQVo7QUFDQSxJQUFJLFlBQVksR0FBRyxJQUFuQjtBQUNBLElBQUksVUFBVSxHQUFHLElBQWpCO0FBRUEsTUFBTSxDQUFDLE1BQVAsOEZBQWdCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDWixVQUFBLEtBQUs7O0FBRE87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBaEI7O1NBSWUsSzs7O0FBOEJmO0FBQ0E7QUFDQTs7Ozt5RkFoQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ1EsWUFBQSxLQURSLEdBQ2dCLElBQUksSUFBSixFQURoQjtBQUFBO0FBQUEsbUJBRVUsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsbUJBQXJCLENBQXlDLHlCQUF6QyxFQUFvRSxXQUFwRSxDQUZWOztBQUFBO0FBQUE7QUFBQSxtQkFHVSxNQUFNLENBQUMsYUFBUCxDQUFxQixtQkFBckIsQ0FBeUMsb0NBQXpDLEVBQStFLHNCQUEvRSxDQUhWOztBQUFBO0FBQUE7QUFBQSxtQkFJVSxNQUFNLENBQUMsYUFBUCxDQUFxQixtQkFBckIsQ0FBeUMsMEJBQXpDLEVBQXFFLFlBQXJFLENBSlY7O0FBQUE7QUFBQTtBQUFBLG1CQUtVLE1BQU0sQ0FBQyxhQUFQLENBQXFCLG1CQUFyQixDQUF5Qyw2QkFBekMsRUFBd0UsZUFBeEUsQ0FMVjs7QUFBQTtBQU9JLFlBQUEsa0JBQWtCO0FBQ2xCLGdCQUFJLGdCQUFKLEdBQVcsSUFBWCxDQUFnQixPQUFoQjtBQVJKO0FBQUE7QUFBQSxtQkFXYyxJQUFJLHdCQUFKLEdBQW1CLFVBQW5CLEVBWGQ7O0FBQUE7QUFBQTtBQUFBLG1CQVljLE9BQU8sQ0FBQyxVQUFSLEVBWmQ7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQWNRLFlBQUEsT0FBTyxDQUFDLEdBQVI7O0FBZFI7QUFBQTtBQUFBLG1CQWlCcUIsT0FBTyxDQUFDLEdBQVIsQ0FBWSxNQUFNLENBQUMsVUFBUCxDQUFrQixNQUE5QixDQWpCckI7O0FBQUE7QUFpQlEsWUFBQSxJQWpCUjtBQWtCUSxZQUFBLEtBbEJSLEdBa0JnQixJQUFJLGlCQUFKLENBQVUsT0FBVixFQUFtQixHQUFuQixDQUF1QixJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxJQUFoQixDQUF2QixDQWxCaEI7QUFtQkksWUFBQSxNQUFNLENBQUMsS0FBUCxHQUFlLEtBQWY7QUFFQSxZQUFBLFFBQVEsQ0FBQyxhQUFULENBQXVCLFlBQXZCLEVBQXFDLFdBQXJDLEdBQW1ELEtBQUssQ0FBQyxJQUF6RDtBQUNBLFlBQUEsVUFBVSxHQUFHLElBQUksc0JBQUosQ0FBZSxLQUFmLENBQWI7QUFDQSxZQUFBLFVBQVUsQ0FBQyxNQUFYLEdBQW9CLFNBQXBCO0FBRUksWUFBQSxHQXpCUixHQXlCYyxJQUFJLElBQUosRUF6QmQ7QUEwQlEsWUFBQSxJQTFCUixHQTBCZSxHQUFHLEdBQUcsS0ExQnJCO0FBMkJJLFlBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxlQUFlLElBQWYsR0FBc0IsS0FBbEM7O0FBM0JKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEc7Ozs7QUFpQ0EsU0FBUyxTQUFULEdBQXFCO0FBQ2pCLEVBQUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsTUFBbEMsRUFBMEMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxNQUFNLENBQUMsS0FBUCxDQUFhLEdBQWIsRUFBZixFQUFtQyxJQUFuQyxFQUF5QyxDQUF6QyxDQUExQztBQUNIO0FBRUQ7QUFDQTtBQUNBOzs7QUFDQSxTQUFTLFdBQVQsR0FBdUI7QUFDbkIsTUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsWUFBdkIsRUFBcUMsV0FBaEQ7QUFDQSxFQUFBLE9BQU8sQ0FBQyxNQUFSLENBQWUsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsTUFBakMsRUFBeUMsSUFBSSxHQUFHLE9BQWhEO0FBQ0EsRUFBQSxNQUFNLENBQUMsS0FBUCxDQUFhLElBQWIsR0FBb0IsSUFBcEI7QUFDQSxFQUFBLFNBQVM7QUFDWjtBQUVEO0FBQ0E7QUFDQTs7O0FBQ0EsU0FBUyxrQkFBVCxHQUE4QjtBQUMxQixFQUFBLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLEVBQXBCO0FBQ0EsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFFBQVAsQ0FBZ0IsTUFBaEIsQ0FBdUIsTUFBdkIsQ0FBOEIsQ0FBOUIsRUFBaUMsS0FBakMsQ0FBdUMsR0FBdkMsQ0FBbkI7O0FBRjBCLDZDQUdGLFVBSEU7QUFBQTs7QUFBQTtBQUcxQix3REFBb0M7QUFBQTs7QUFBQSxVQUF6QixTQUF5QjtBQUNoQyxVQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBVixDQUFnQixHQUFoQixDQUFkO0FBQ0EsTUFBQSxNQUFNLENBQUMsVUFBUCxDQUFrQixLQUFLLENBQUMsQ0FBRCxDQUF2QixlQUE4QixLQUFLLENBQUMsQ0FBRCxDQUFuQyw2Q0FBMEMsRUFBMUM7QUFDSDtBQU55QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBTzdCOzs7Ozs7Ozs7OztBQzlFRDtJQUVNLFk7QUFDRiwwQkFBYTtBQUFBO0FBQ1QsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQWQsRUFBb0IsT0FBTyxDQUFDLG1CQUFELENBQTNCO0FBQ0g7Ozs7V0FFRCxzQkFBYTtBQUFBOztBQUNULGFBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUNwQyxRQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsY0FBVixFQUEwQjtBQUFBLGlCQUFNLEtBQUksQ0FBQyxZQUFMLENBQWtCLE9BQWxCLEVBQTJCLE1BQTNCLENBQU47QUFBQSxTQUExQjtBQUNILE9BRk0sQ0FBUDtBQUdIOzs7V0FFRCxzQkFBYSxPQUFiLEVBQXNCLE1BQXRCLEVBQThCO0FBQzFCLE1BQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFaLENBQWlCO0FBQ2IsUUFBQSxNQUFNLEVBQUUsS0FBSyxZQURBO0FBRWIsUUFBQSxRQUFRLEVBQUUsS0FBSyxRQUZGO0FBR2IsUUFBQSxhQUFhLEVBQUUsS0FBSyxhQUhQO0FBSWIsUUFBQSxLQUFLLEVBQUUsS0FBSztBQUpDLE9BQWpCLEVBS0csSUFMSCxDQUtRLFVBQVUsTUFBVixFQUFrQjtBQUN0QixRQUFBLE9BQU87QUFDVixPQVBELEVBT0csVUFBUyxLQUFULEVBQWdCO0FBQ2YsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFlBQVo7QUFDQSxRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWjtBQUNBLFFBQUEsTUFBTSxDQUFDLEtBQUQsQ0FBTjtBQUNILE9BWEQ7QUFZSDs7O1dBRUQsd0JBQWM7QUFDVixVQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBTCxDQUFXLGVBQVgsR0FBNkIsV0FBN0IsQ0FBeUMsR0FBekMsRUFBWDtBQUNBLGFBQU8sSUFBSSxDQUFDLGdCQUFMLENBQXNCLEtBQUssS0FBM0IsQ0FBUDtBQUNIOzs7V0FFRCxrQkFBUTtBQUNKLE1BQUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxlQUFYLEdBQTZCLE1BQTdCO0FBQ0g7OztXQUVELG1CQUFTO0FBQ0wsTUFBQSxJQUFJLENBQUMsS0FBTCxDQUFXLGVBQVgsR0FBNkIsT0FBN0I7QUFDSDs7Ozs7QUFJTCxNQUFNLENBQUMsT0FBUCxHQUFpQixZQUFqQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzQ0EsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG1CQUFELENBQVAsQ0FBNkIsYUFBbkQ7O0lBRU0sWTs7Ozs7QUFDRix3QkFBWSxLQUFaLEVBQW1CO0FBQUE7QUFBQSw2QkFDVCxjQURTLEVBRVg7QUFBQyxNQUFBLE1BQU0sRUFBRztBQUFDLFFBQUEsS0FBSyxFQUFHO0FBQVQ7QUFBVixLQUZXO0FBSWxCOzs7a0RBTHVCLFc7O0lBUXRCLFE7Ozs7Ozs7Ozs7Ozs7NkdBQ0Y7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNJO0FBQ0EscUJBQUssZ0JBQUwsQ0FBc0IsT0FBdEIsRUFBK0IsWUFBSTtBQUMvQixrQkFBQSxLQUFJLENBQUMsTUFBTDtBQUNILGlCQUZEOztBQUZKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7V0FPQSxrQkFBUTtBQUNKLFVBQUksS0FBSyxPQUFMLEtBQWlCLE1BQXJCLEVBQTZCLEtBQUssT0FBTCxHQUFlLE9BQWYsQ0FBN0IsS0FDSyxLQUFLLE9BQUwsR0FBZSxNQUFmO0FBQ1I7OztTQUVELGVBQWE7QUFDVCxVQUFJLENBQUMsS0FBSyxZQUFMLENBQWtCLFFBQVEsQ0FBQyxpQkFBM0IsQ0FBTCxFQUFtRDtBQUMvQyxhQUFLLFlBQUwsQ0FBa0IsUUFBUSxDQUFDLGlCQUEzQixFQUE4QyxPQUE5QztBQUNIOztBQUNELGFBQU8sS0FBSyxZQUFMLENBQWtCLFFBQVEsQ0FBQyxpQkFBM0IsQ0FBUDtBQUNILEs7U0FFRCxhQUFZLEtBQVosRUFBa0I7QUFDZCxXQUFLLFlBQUwsQ0FBa0IsUUFBUSxDQUFDLGlCQUEzQixFQUE4QyxLQUE5QztBQUNBLFdBQUssYUFBTCxDQUFtQixJQUFJLFlBQUosQ0FBaUIsS0FBakIsQ0FBbkI7QUFDSDs7O0VBdkJrQixhOztBQTBCdkIsUUFBUSxDQUFDLGlCQUFULEdBQTZCLFNBQTdCO0FBQ0EsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsTUFBdEIsQ0FBNkIsV0FBN0IsRUFBMEMsUUFBMUM7QUFDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQUFqQjs7Ozs7Ozs7Ozs7QUN0Q0E7O0FBQ0EsSUFBTSxHQUFHLEdBQUc7QUFBQztBQUFELENBQVo7O0lBRU0sWTs7Ozs7OztXQUNGLGFBQVcsS0FBWCxFQUFrQixNQUFsQixFQUEwQjtBQUN0QixNQUFBLFlBQVksQ0FBQyxLQUFiLEdBQXNCLEtBQXRCO0FBQ0EsTUFBQSxZQUFZLENBQUMsTUFBYixHQUFzQixNQUF0QjtBQUVBLE1BQUEsR0FBRyxDQUFDLGtCQUFKLENBQXVCLElBQXZCOztBQUVBLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsQ0FBcEIsRUFBdUIsQ0FBQyxFQUF4QixFQUE0QjtBQUN4QixRQUFBLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixPQUF2QixDQUErQixDQUEvQixFQUFrQyxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsRUFBaUIsSUFBbkQ7QUFDQSxRQUFBLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixVQUF2QixDQUFrQyxDQUFsQyxFQUFxQyxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsRUFBaUIsTUFBdEQ7QUFDSDs7QUFFRCxNQUFBLEdBQUcsQ0FBQyxhQUFKLENBQWtCLGdCQUFsQixDQUFtQyxPQUFuQyxFQUE0QyxZQUFZLENBQUMsT0FBekQ7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLGdCQUFqQixDQUFrQyxPQUFsQyxFQUEyQyxZQUFZLENBQUMsT0FBeEQ7QUFDQSxNQUFBLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixnQkFBdkIsQ0FBd0MsYUFBeEMsRUFBdUQsWUFBWSxDQUFDLFFBQXBFO0FBQ0EsTUFBQSxHQUFHLENBQUMsa0JBQUosQ0FBdUIsZ0JBQXZCLENBQXdDLGNBQXhDLEVBQXdELFlBQVksQ0FBQyxTQUFyRTtBQUNBLE1BQUEsR0FBRyxDQUFDLGtCQUFKLENBQXVCLGdCQUF2QixDQUF3QyxpQkFBeEMsRUFBMkQsWUFBWSxDQUFDLFNBQXhFO0FBQ0g7OztXQUVELGtCQUFnQixLQUFoQixFQUF1QjtBQUNuQixVQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFkLENBQXBCO0FBQ0EsTUFBQSxZQUFZLENBQUMsS0FBYixDQUFtQixPQUFuQixDQUEyQixLQUEzQixFQUFrQyxJQUFsQyxHQUF5QyxLQUFLLENBQUMsTUFBTixDQUFhLElBQXREO0FBQ0EsTUFBQSxZQUFZLENBQUMsTUFBYjtBQUNIOzs7V0FFRCxtQkFBaUIsS0FBakIsRUFBd0I7QUFDcEIsVUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBZCxDQUFwQjtBQUNBLE1BQUEsWUFBWSxDQUFDLEtBQWIsQ0FBbUIsT0FBbkIsQ0FBMkIsS0FBM0IsRUFBa0MsTUFBbEMsR0FBMkMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUF4RDtBQUNBLE1BQUEsWUFBWSxDQUFDLE1BQWI7QUFDSDs7O1dBRUQsbUJBQWlCLEtBQWpCLEVBQXdCO0FBQ3BCLE1BQUEsWUFBWSxDQUFDLE1BQWI7QUFDQSxNQUFBLFlBQVksQ0FBQyxPQUFiO0FBQ0EsTUFBQSxjQUFjLENBQUMsR0FBZixDQUFtQixZQUFZLENBQUMsS0FBaEMsRUFBdUMsWUFBWSxDQUFDLE1BQXBEO0FBQ0g7OztXQUVELG1CQUFpQjtBQUNiLE1BQUEsR0FBRyxDQUFDLGtCQUFKLENBQXVCLElBQXZCO0FBQ0EsTUFBQSxHQUFHLENBQUMsa0JBQUosQ0FBdUIsbUJBQXZCLENBQTJDLGFBQTNDLEVBQTBELFlBQVksQ0FBQyxRQUF2RTtBQUNBLE1BQUEsR0FBRyxDQUFDLGtCQUFKLENBQXVCLG1CQUF2QixDQUEyQyxjQUEzQyxFQUEyRCxZQUFZLENBQUMsU0FBeEU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixtQkFBdkIsQ0FBMkMsaUJBQTNDLEVBQThELFlBQVksQ0FBQyxTQUEzRTtBQUNBLE1BQUEsR0FBRyxDQUFDLGFBQUosQ0FBa0IsbUJBQWxCLENBQXNDLE9BQXRDLEVBQStDLFlBQVksQ0FBQyxPQUE1RDtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsbUJBQWpCLENBQXFDLE9BQXJDLEVBQThDLFlBQVksQ0FBQyxPQUEzRDtBQUNIOzs7OztJQUdDLGM7Ozs7Ozs7V0FDRixhQUFXLEtBQVgsRUFBa0IsTUFBbEIsRUFBMEI7QUFDdEIsTUFBQSxjQUFjLENBQUMsS0FBZixHQUF3QixLQUF4QjtBQUNBLE1BQUEsY0FBYyxDQUFDLE1BQWYsR0FBd0IsTUFBeEI7QUFFQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLE9BQWpCLENBQXlCLEtBQUssQ0FBQyxRQUEvQjtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsSUFBakI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLFdBQWpCLEdBQStCLEtBQS9CO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixTQUFqQixDQUEyQixVQUEzQjtBQUVBLE1BQUEsR0FBRyxDQUFDLGFBQUosQ0FBa0IsZ0JBQWxCLENBQW1DLE9BQW5DLEVBQTRDLGNBQWMsQ0FBQyxPQUEzRDtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsZ0JBQWpCLENBQWtDLE9BQWxDLEVBQTJDLGNBQWMsQ0FBQyxPQUExRDtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsZ0JBQWpCLENBQWtDLGFBQWxDLEVBQWlELGNBQWMsQ0FBQyxRQUFoRTtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsZ0JBQWpCLENBQWtDLGVBQWxDLEVBQW1ELGNBQWMsQ0FBQyxVQUFsRTtBQUNIOzs7V0FFRCxrQkFBZ0IsS0FBaEIsRUFBdUI7QUFDbkIsTUFBQSxjQUFjLENBQUMsS0FBZixDQUFxQixRQUFyQixHQUFnQyxLQUFLLENBQUMsTUFBTixDQUFhLElBQTdDO0FBQ0EsTUFBQSxjQUFjLENBQUMsTUFBZjtBQUNIOzs7V0FFRCxzQkFBb0I7QUFDaEIsTUFBQSxjQUFjLENBQUMsT0FBZjtBQUNBLE1BQUEsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsY0FBYyxDQUFDLEtBQWhDLEVBQXVDLGNBQWMsQ0FBQyxNQUF0RDtBQUNIOzs7V0FFRCxtQkFBaUI7QUFDYixNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLElBQWpCO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixtQkFBakIsQ0FBcUMsYUFBckMsRUFBb0QsY0FBYyxDQUFDLFFBQW5FO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixtQkFBakIsQ0FBcUMsZUFBckMsRUFBc0QsY0FBYyxDQUFDLFVBQXJFO0FBQ0EsTUFBQSxHQUFHLENBQUMsYUFBSixDQUFrQixtQkFBbEIsQ0FBc0MsT0FBdEMsRUFBK0MsY0FBYyxDQUFDLE9BQTlEO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixtQkFBakIsQ0FBcUMsT0FBckMsRUFBOEMsY0FBYyxDQUFDLE9BQTdEO0FBQ0g7Ozs7O0lBR0MsZ0I7Ozs7Ozs7O0FBQ0Y7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNJLGlCQUFXLEtBQVgsRUFBa0IsS0FBbEIsRUFBeUIsTUFBekIsRUFBaUMsT0FBakMsRUFBMEM7QUFDdEMsTUFBQSxnQkFBZ0IsQ0FBQyxLQUFqQixHQUEyQixLQUEzQixhQUEyQixLQUEzQixjQUEyQixLQUEzQixHQUFvQyxnQkFBZ0IsQ0FBQyxLQUFyRDtBQUNBLE1BQUEsZ0JBQWdCLENBQUMsS0FBakIsR0FBMkIsS0FBM0IsYUFBMkIsS0FBM0IsY0FBMkIsS0FBM0IsR0FBb0MsZ0JBQWdCLENBQUMsS0FBckQ7QUFDQSxNQUFBLGdCQUFnQixDQUFDLE1BQWpCLEdBQTJCLE1BQTNCLGFBQTJCLE1BQTNCLGNBQTJCLE1BQTNCLEdBQXFDLGdCQUFnQixDQUFDLE1BQXREO0FBQ0EsTUFBQSxnQkFBZ0IsQ0FBQyxPQUFqQixHQUEyQixPQUEzQixhQUEyQixPQUEzQixjQUEyQixPQUEzQixHQUFzQyxnQkFBZ0IsQ0FBQyxPQUF2RDtBQUVBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsT0FBakIsQ0FBeUIsZ0JBQWdCLENBQUMsS0FBakIsQ0FBdUIsZ0JBQWdCLENBQUMsS0FBakIsQ0FBdUIsTUFBdkIsQ0FBOEIsQ0FBOUIsRUFBaUMsQ0FBakMsQ0FBdkIsQ0FBekI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLFdBQWpCLEdBQStCLElBQS9CO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixJQUFqQjtBQUNBLE1BQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxJQUFkO0FBRUEsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixnQkFBakIsQ0FBa0MsYUFBbEMsRUFBaUQsZ0JBQWdCLENBQUMsUUFBbEU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLGdCQUFqQixDQUFrQyxjQUFsQyxFQUFrRCxnQkFBZ0IsQ0FBQyxTQUFuRTtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsZ0JBQWpCLG9CQUFxRCxnQkFBZ0IsQ0FBQyxZQUF0RTtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsZ0JBQWpCLGtCQUFtRCxnQkFBZ0IsQ0FBQyxVQUFwRTtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsU0FBakIsQ0FBMkIsZ0JBQWdCLENBQUMsS0FBNUM7QUFDSDs7O1dBRUQsa0JBQWdCLEtBQWhCLEVBQXVCO0FBQ25CLE1BQUEsZ0JBQWdCLENBQUMsS0FBakIsQ0FBdUIsZ0JBQWdCLENBQUMsS0FBakIsQ0FBdUIsTUFBdkIsQ0FBOEIsQ0FBOUIsRUFBaUMsQ0FBakMsQ0FBdkIsSUFBOEQsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUEzRTtBQUNBLE1BQUEsZ0JBQWdCLENBQUMsTUFBakI7QUFDSDs7O1dBRUQsbUJBQWlCLEtBQWpCLEVBQXdCO0FBQ3BCLE1BQUEsZ0JBQWdCLENBQUMsT0FBakI7QUFDQSxNQUFBLGdCQUFnQixDQUFDLE9BQWpCO0FBQ0g7OztXQUVELG9CQUFrQixLQUFsQixFQUF5QjtBQUNyQixNQUFBLGdCQUFnQixDQUFDLE9BQWpCO0FBQ0EsTUFBQSxnQkFBZ0IsQ0FBQyxHQUFqQixDQUFxQixRQUFyQjtBQUNIOzs7V0FFRCxzQkFBb0IsSUFBcEIsRUFBMEI7QUFDdEIsTUFBQSxnQkFBZ0IsQ0FBQyxPQUFqQjtBQUNBLE1BQUEsZ0JBQWdCLENBQUMsR0FBakIsQ0FBcUIsVUFBckI7QUFDSDs7O1dBRUQsbUJBQWlCO0FBQ2IsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixtQkFBakIsQ0FBcUMsYUFBckMsRUFBb0QsZ0JBQWdCLENBQUMsUUFBckU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLG1CQUFqQixDQUFxQyxjQUFyQyxFQUFxRCxnQkFBZ0IsQ0FBQyxTQUF0RTtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsbUJBQWpCLENBQXFDLGVBQXJDLEVBQXNELGdCQUFnQixDQUFDLFVBQXZFO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixtQkFBakIsQ0FBcUMsaUJBQXJDLEVBQXdELGdCQUFnQixDQUFDLFlBQXpFO0FBQ0g7Ozs7O0lBR0MsVTtBQUNGLHNCQUFZLEtBQVosRUFBbUI7QUFBQTs7QUFBQTtBQUNmLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFFQSxJQUFBLEdBQUcsQ0FBQyxrQkFBSixHQUF5QixRQUFRLENBQUMsYUFBVCxDQUF1Qix1QkFBdkIsQ0FBekI7QUFDQSxJQUFBLEdBQUcsQ0FBQyxhQUFKLEdBQW9CLFFBQVEsQ0FBQyxhQUFULENBQXVCLGlCQUF2QixDQUFwQjtBQUNBLElBQUEsR0FBRyxDQUFDLFlBQUosR0FBbUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsZ0JBQXZCLENBQW5CO0FBQ0EsSUFBQSxHQUFHLENBQUMsVUFBSixHQUFpQixRQUFRLENBQUMsYUFBVCxDQUF1Qix1QkFBdkIsQ0FBakI7QUFDQSxJQUFBLEdBQUcsQ0FBQyxRQUFKLEdBQWUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsWUFBdkIsQ0FBZjtBQUNBLElBQUEsR0FBRyxDQUFDLFNBQUosR0FBZ0IsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsYUFBdkIsQ0FBaEI7QUFDQSxJQUFBLEdBQUcsQ0FBQyxZQUFKLEdBQW1CLFFBQVEsQ0FBQyxhQUFULENBQXVCLGdCQUF2QixDQUFuQjtBQUNBLElBQUEsR0FBRyxDQUFDLGlCQUFKLEdBQXdCLFFBQVEsQ0FBQyxhQUFULENBQXVCLGtCQUF2QixDQUF4QjtBQUNBLElBQUEsR0FBRyxDQUFDLGlCQUFKLEdBQXdCLFFBQVEsQ0FBQyxhQUFULENBQXVCLG1CQUF2QixDQUF4QjtBQUVBLElBQUEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsZ0JBQXZCLEVBQXlDLGdCQUF6QyxDQUEwRCxPQUExRCxFQUFtRSxZQUFJO0FBQ25FLFVBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFMLENBQWUsS0FBSSxDQUFDLEtBQUwsQ0FBVyxTQUExQixFQUFxQyxJQUFyQyxFQUEyQyxDQUEzQyxDQUFiO0FBQ0EsVUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFKLENBQVMsQ0FBQyxJQUFELENBQVQsRUFBaUI7QUFBQyxRQUFBLElBQUksRUFBRTtBQUFQLE9BQWpCLENBQWI7QUFDQSxVQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBUCxDQUFXLGVBQVgsQ0FBMkIsSUFBM0IsQ0FBWjtBQUNBLFVBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFULENBQXVCLGtCQUF2QixDQUFmO0FBQ0EsTUFBQSxNQUFNLENBQUMsSUFBUCxHQUFjLEdBQWQ7QUFDQSxNQUFBLE1BQU0sQ0FBQyxRQUFQLEdBQWtCLEtBQUksQ0FBQyxLQUFMLENBQVcsSUFBN0I7QUFDQSxNQUFBLE1BQU0sQ0FBQyxLQUFQO0FBQ0gsS0FSRDtBQVVBLElBQUEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsb0JBQXZCLEVBQTZDLGdCQUE3QyxDQUE4RCxPQUE5RCxFQUF1RSxZQUFNO0FBQ3pFLE1BQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxXQUFYOztBQUNBLE1BQUEsS0FBSSxDQUFDLGtCQUFMOztBQUNBLE1BQUEsS0FBSSxDQUFDLE1BQUw7O0FBQ0EsTUFBQSxLQUFJLENBQUMsVUFBTDtBQUNILEtBTEQ7QUFPQSxJQUFBLFFBQVEsQ0FBQyxhQUFULENBQXVCLG1CQUF2QixFQUE0QyxnQkFBNUMsQ0FBNkQsT0FBN0QsRUFBc0UsWUFBTTtBQUN4RSxNQUFBLFFBQVEsQ0FBQyxJQUFULEdBQWdCLFdBQWhCO0FBQ0gsS0FGRDtBQUlBLElBQUEsR0FBRyxDQUFDLGlCQUFKLENBQXNCLGdCQUF0QixDQUF1QyxPQUF2QyxFQUFnRCxZQUFNO0FBQ2xELE1BQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxhQUFYOztBQUNBLE1BQUEsS0FBSSxDQUFDLE1BQUw7O0FBQ0EsTUFBQSxLQUFJLENBQUMsVUFBTDtBQUNILEtBSkQ7QUFNQSxJQUFBLEdBQUcsQ0FBQyxpQkFBSixDQUFzQixnQkFBdEIsQ0FBdUMsT0FBdkMsRUFBZ0QsWUFBTTtBQUNsRCxNQUFBLEtBQUksQ0FBQyxLQUFMLENBQVcsYUFBWDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxNQUFMOztBQUNBLE1BQUEsS0FBSSxDQUFDLFVBQUw7QUFDSCxLQUpEO0FBTUEsSUFBQSxHQUFHLENBQUMsYUFBSixDQUFrQixnQkFBbEIsQ0FBbUMsT0FBbkMsRUFBNEMsWUFBTTtBQUM5QyxNQUFBLEtBQUksQ0FBQyxLQUFMLENBQVcsY0FBWDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxVQUFMO0FBQ0gsS0FIRDtBQUtBLElBQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsZ0JBQWpCLENBQWtDLE9BQWxDLEVBQTJDLFlBQU07QUFDN0MsTUFBQSxLQUFJLENBQUMsS0FBTCxDQUFXLGNBQVg7O0FBQ0EsTUFBQSxLQUFJLENBQUMsVUFBTDtBQUNILEtBSEQ7QUFLQSxJQUFBLEdBQUcsQ0FBQyxRQUFKLENBQWEsZ0JBQWIsQ0FBOEIsU0FBOUIsRUFBeUMsVUFBQyxLQUFELEVBQVc7QUFDaEQsVUFBSSxLQUFLLENBQUMsS0FBTixLQUFnQixFQUFwQixFQUF3QjtBQUNwQixRQUFBLEtBQUksQ0FBQyxVQUFMOztBQUNBLFFBQUEsS0FBSyxDQUFDLGVBQU47QUFDQSxRQUFBLEtBQUssQ0FBQyxjQUFOO0FBQ0EsUUFBQSxRQUFRLENBQUMsYUFBVCxDQUF1Qix1QkFBdkIsRUFBZ0QsS0FBaEQ7QUFDQSxlQUFPLEtBQVA7QUFDSDtBQUNKLEtBUkQ7QUFVQSxJQUFBLFFBQVEsQ0FBQyxhQUFULENBQXVCLG9CQUF2QixFQUE2QyxnQkFBN0MsQ0FBOEQsT0FBOUQsRUFBdUUsWUFBTTtBQUN6RSxNQUFBLEtBQUksQ0FBQyxLQUFMLENBQVcsZ0JBQVg7O0FBQ0EsTUFBQSxLQUFJLENBQUMsVUFBTDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxNQUFMO0FBQ0gsS0FKRDtBQU1BLElBQUEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsMkJBQXZCLEVBQW9ELGdCQUFwRCxDQUFxRSxPQUFyRSxFQUE4RSxZQUFNO0FBQ2hGLE1BQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxzQkFBWDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxVQUFMOztBQUNBLE1BQUEsS0FBSSxDQUFDLE1BQUw7QUFDSCxLQUpELEVBeEVlLENBOEVmOztBQUNBLElBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxnQkFBZCxDQUErQixlQUEvQixFQUFnRCxVQUFBLEtBQUssRUFBSTtBQUNyRCxVQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTixDQUFhLEdBQXZCO0FBQ0EsTUFBQSxLQUFJLENBQUMsS0FBTCxDQUFXLFNBQVgsQ0FBcUIsR0FBckIsRUFBMEIsUUFBMUIsR0FBcUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFsRDtBQUNBLE1BQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxTQUFYLENBQXFCLEdBQXJCLEVBQTBCLFFBQTFCLEdBQXFDLEtBQUssQ0FBQyxNQUFOLENBQWEsUUFBbEQ7O0FBQ0EsTUFBQSxLQUFJLENBQUMsTUFBTDtBQUNILEtBTEQsRUEvRWUsQ0FzRmY7O0FBQ0EsSUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLGdCQUFkLENBQStCLGFBQS9CLEVBQThDLFVBQUEsS0FBSyxFQUFJO0FBQ25ELFVBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFOLENBQWEsR0FBdkI7QUFDQSxVQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTixDQUFhLEdBQXZCOztBQUNBLE1BQUEsS0FBSSxDQUFDLGNBQUw7O0FBRUEsTUFBQSxnQkFBZ0IsQ0FBQyxHQUFqQixDQUNJLFVBREosRUFFSSxLQUFJLENBQUMsS0FBTCxDQUFXLE9BQVgsQ0FBbUIsR0FBbkIsRUFBd0IsR0FBeEIsQ0FGSixFQUdJO0FBQUEsZUFBTSxLQUFJLENBQUMsTUFBTCxFQUFOO0FBQUEsT0FISixFQUlJO0FBQUEsZUFBTSxLQUFJLENBQUMsVUFBTCxFQUFOO0FBQUEsT0FKSjtBQU1ILEtBWEQ7QUFhQSxTQUFLLFVBQUw7QUFDSDs7OztXQUVELGtCQUFTLENBQ0w7QUFDSDs7O1dBRUQsc0JBQWEsQ0FDVDtBQUNIOzs7V0FFRCwwQkFBaUI7QUFDYixNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLFNBQWpCLENBQTJCLEdBQTNCLENBQStCLFFBQS9CO0FBQ0EsTUFBQSxHQUFHLENBQUMsYUFBSixDQUFrQixTQUFsQixDQUE0QixHQUE1QixDQUFnQyxRQUFoQztBQUNIOzs7V0FFRCxvQkFBVyxLQUFYLEVBQWtCO0FBQUE7O0FBQ2QsTUFBQSxLQUFLLGFBQUcsS0FBSCwyQ0FBWSxLQUFLLEtBQXRCO0FBQ0EsV0FBSyxrQkFBTDtBQUVBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsSUFBakI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsSUFBZDtBQUNBLE1BQUEsR0FBRyxDQUFDLGtCQUFKLENBQXVCLElBQXZCO0FBRUEsVUFBSSxLQUFLLENBQUMsUUFBTixHQUFpQixJQUFqQixLQUEwQixrQkFBTSxZQUFOLENBQW1CLFFBQWpELEVBQTJELEtBQUssWUFBTCxDQUFrQixLQUFsQjtBQUMzRCxVQUFJLEtBQUssQ0FBQyxRQUFOLEdBQWlCLElBQWpCLEtBQTBCLGtCQUFNLFlBQU4sQ0FBbUIsZUFBakQsRUFBa0UsS0FBSyxrQkFBTCxDQUF3QixLQUF4QjtBQUNyRTs7O1dBRUQsOEJBQXFCO0FBQ2pCLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsU0FBakIsQ0FBMkIsTUFBM0IsQ0FBa0MsUUFBbEM7QUFDQSxNQUFBLEdBQUcsQ0FBQyxhQUFKLENBQWtCLFNBQWxCLENBQTRCLE1BQTVCLENBQW1DLFFBQW5DO0FBQ0EsVUFBSSxLQUFLLEtBQUwsQ0FBVyxZQUFYLEtBQTRCLENBQWhDLEVBQW1DLEdBQUcsQ0FBQyxZQUFKLENBQWlCLFNBQWpCLENBQTJCLEdBQTNCLENBQStCLFFBQS9CO0FBQ25DLFVBQUksS0FBSyxLQUFMLENBQVcsWUFBWCxJQUEyQixLQUFLLEtBQUwsQ0FBVyxVQUFYLEdBQXdCLENBQXZELEVBQTBELEdBQUcsQ0FBQyxhQUFKLENBQWtCLFNBQWxCLENBQTRCLEdBQTVCLENBQWdDLFFBQWhDO0FBQzFELE1BQUEsR0FBRyxDQUFDLFVBQUosQ0FBZSxXQUFmLEdBQTZCLFlBQVksS0FBSyxLQUFMLENBQVcsWUFBWCxHQUEwQixDQUF0QyxDQUE3QjtBQUNIOzs7V0FFRCw0QkFBbUIsS0FBbkIsRUFBMEI7QUFBQTs7QUFDdEIsTUFBQSxHQUFHLENBQUMsaUJBQUosQ0FBc0IsSUFBdEI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxpQkFBSixDQUFzQixJQUF0QjtBQUVBLE1BQUEsY0FBYyxDQUFDLEdBQWYsQ0FDSSxLQUFLLEtBQUwsQ0FBVyxRQUFYLEVBREosRUFFSTtBQUFBLGVBQU0sTUFBSSxDQUFDLE1BQUwsRUFBTjtBQUFBLE9BRko7QUFJSDs7O1dBRUQsc0JBQWEsS0FBYixFQUFvQjtBQUNoQixNQUFBLEdBQUcsQ0FBQyxpQkFBSixDQUFzQixJQUF0QjtBQUNBLE1BQUEsR0FBRyxDQUFDLGlCQUFKLENBQXNCLElBQXRCO0FBQ0EsTUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLElBQWQ7O0FBRUEsV0FBSyxJQUFJLEdBQUcsR0FBRyxDQUFmLEVBQWtCLEdBQUcsR0FBRyxDQUF4QixFQUEyQixHQUFHLEVBQTlCLEVBQWtDO0FBQzlCLFlBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxTQUFOLENBQWdCLEdBQWhCLENBQWI7QUFFQSxRQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsU0FBZCxDQUF3QixHQUF4QixFQUE2QixPQUE3QixDQUFxQyxJQUFyQyxHQUE0QyxJQUE1QztBQUNBLFFBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxTQUFkLENBQXdCLEdBQXhCLEVBQTZCLE1BQU0sQ0FBQyxRQUFwQyxFQUE4QyxNQUFNLENBQUMsUUFBckQ7O0FBRUEsYUFBSyxJQUFJLEdBQUcsR0FBRyxDQUFmLEVBQWtCLEdBQUcsR0FBRyxDQUF4QixFQUEyQixHQUFHLEVBQTlCLEVBQWtDO0FBQzlCLFVBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxPQUFkLENBQXNCLEdBQXRCLEVBQTJCLEdBQTNCLEVBQWdDLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FBWixFQUFpQixLQUFqRDtBQUNBLGNBQUksTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUFaLEVBQWlCLENBQWpCLEtBQXVCLEVBQTNCLEVBQStCLEdBQUcsQ0FBQyxTQUFKLENBQWMsV0FBZCxDQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxPQUFwQyxFQUEvQixLQUNLLElBQUksTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUFaLEVBQWlCLENBQWpCLEtBQXVCLEVBQTNCLEVBQStCLEdBQUcsQ0FBQyxTQUFKLENBQWMsV0FBZCxDQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxTQUFwQyxFQUEvQixLQUNBLEdBQUcsQ0FBQyxTQUFKLENBQWMsV0FBZCxDQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxNQUFwQztBQUNSO0FBQ0o7QUFDSjs7Ozs7QUFHTCxNQUFNLENBQUMsT0FBUCxHQUFpQixVQUFqQjs7O0FDalRBLGEsQ0FDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFFTSxPOzs7Ozs7OztnR0FFRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx1QkFDVSxLQUFLLFVBQUwsRUFEVjs7QUFBQTtBQUFBO0FBQUEsdUJBRVUsS0FBSyxTQUFMLEVBRlY7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7OztXQUtBLHNCQUFhO0FBQ1QsYUFBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3BDLFFBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxRQUFWLEVBQW9CO0FBQUEsaUJBQU0sT0FBTyxFQUFiO0FBQUEsU0FBcEI7QUFDSCxPQUZNLENBQVA7QUFHSDs7O1dBRUQscUJBQVk7QUFDUixhQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDcEMsUUFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLElBQVosQ0FBaUIsT0FBakIsRUFBMEIsSUFBMUIsRUFBZ0MsT0FBTyxFQUF2QztBQUNILE9BRk0sQ0FBUDtBQUdIOzs7O2tHQUVEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrREFDVyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQW9CO0FBQ25DLGtCQUFBLElBQUksQ0FBQyxNQUFMLENBQVksS0FBWixDQUFrQixLQUFsQixDQUF3QixNQUF4QixDQUErQjtBQUMzQixvQkFBQSxJQUFJLEVBQUcsT0FBTyxDQUFDLFFBRFk7QUFFM0Isb0JBQUEsT0FBTyxFQUFFLENBQUMsZUFBRCxDQUZrQjtBQUczQixvQkFBQSxNQUFNLEVBQUU7QUFIbUIsbUJBQS9CLEVBSUcsSUFKSCxDQUlRLFVBQUEsR0FBRyxFQUFFO0FBQ1Qsb0JBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFKLENBQVcsRUFBWixDQUFQO0FBQ0gsbUJBTkQsRUFNRyxVQUFVLEtBQVYsRUFBaUI7QUFDaEIsb0JBQUEsTUFBTSxDQUFDLEtBQUQsQ0FBTjtBQUNILG1CQVJEO0FBU0gsaUJBVk0sQ0FEWDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7Ozs7OzttR0FjQSxrQkFBYSxNQUFiO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrREFDVyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQW9CO0FBQ25DLGtCQUFBLElBQUksQ0FBQyxNQUFMLENBQVksS0FBWixDQUFrQixLQUFsQixXQUErQjtBQUMzQixvQkFBQSxNQUFNLEVBQUc7QUFEa0IsbUJBQS9CLEVBRUcsSUFGSCxDQUVRLFVBQUEsR0FBRyxFQUFFO0FBQ1Qsb0JBQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFMLENBQVA7QUFDSCxtQkFKRCxFQUlHLFVBQVUsS0FBVixFQUFpQjtBQUNoQixvQkFBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQVAsQ0FBTjtBQUNILG1CQU5EO0FBT0gsaUJBUk0sQ0FEWDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7Ozs7OztnR0FZQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0RBQ1csSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFvQjtBQUNuQyxrQkFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLEtBQVosQ0FBa0IsS0FBbEIsQ0FBd0IsSUFBeEIsQ0FBNkI7QUFDekI7QUFDQSxvQkFBQSxNQUFNLEVBQUUsZUFGaUI7QUFHekIsb0JBQUEsTUFBTSxFQUFFO0FBSGlCLG1CQUE3QixFQUlHLElBSkgsQ0FJUSxVQUFBLEdBQUcsRUFBRTtBQUNULG9CQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBSixDQUFXLEtBQVosQ0FBUDtBQUNILG1CQU5ELEVBTUcsVUFBVSxLQUFWLEVBQWlCO0FBQ2hCLG9CQUFBLE1BQU0sQ0FBQyxLQUFELENBQU47QUFDSCxtQkFSRDtBQVNILGlCQVZNLENBRFg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7Ozs7K0ZBY0Esa0JBQVUsTUFBVjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0RBQ1csSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFvQjtBQUNuQyxrQkFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLEtBQVosQ0FBa0IsS0FBbEIsQ0FBd0IsR0FBeEIsQ0FBNEI7QUFDeEIsb0JBQUEsTUFBTSxFQUFFLE1BRGdCO0FBRXhCLG9CQUFBLEdBQUcsRUFBRTtBQUZtQixtQkFBNUIsRUFHRyxJQUhILENBR1EsVUFBQSxHQUFHLEVBQUU7QUFDVCxvQkFBQSxPQUFPLENBQUMsR0FBRCxDQUFQO0FBQ0gsbUJBTEQsRUFLRyxVQUFVLEtBQVYsRUFBaUI7QUFDaEIsb0JBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxLQUFaO0FBQ0Esb0JBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFQLENBQU47QUFDSCxtQkFSRDtBQVNILGlCQVZNLENBRFg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7Ozs7bUdBY0Esa0JBQWMsTUFBZCxFQUFzQixJQUF0QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0RBQ1csSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFvQjtBQUNuQyxrQkFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLE9BQVosQ0FBb0I7QUFDaEIsb0JBQUEsSUFBSSxFQUFHLDJCQUEyQixNQURsQjtBQUVoQixvQkFBQSxNQUFNLEVBQUcsT0FGTztBQUdoQixvQkFBQSxNQUFNLEVBQUc7QUFDTCxzQkFBQSxVQUFVLEVBQUc7QUFEUixxQkFITztBQU1oQixvQkFBQSxPQUFPLEVBQUc7QUFDTixzQ0FBaUI7QUFEWCxxQkFOTTtBQVNoQixvQkFBQSxJQUFJLEVBQUc7QUFUUyxtQkFBcEIsRUFVRyxJQVZILENBVVEsVUFBQSxHQUFHLEVBQUU7QUFDVCxvQkFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFHLENBQUMsSUFBZixDQUFELENBQVA7QUFDSCxtQkFaRCxFQVlHLFVBQVUsS0FBVixFQUFpQjtBQUNoQixvQkFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQVo7QUFDQSxvQkFBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQVAsQ0FBTjtBQUNILG1CQWZEO0FBZ0JILGlCQWpCTSxDQURYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7O2tHQXFCQSxrQkFBYSxNQUFiLEVBQXFCLFFBQXJCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxrREFDVyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQW9CO0FBQ25DLGtCQUFBLElBQUksQ0FBQyxNQUFMLENBQVksS0FBWixDQUFrQixLQUFsQixDQUF3QixNQUF4QixDQUErQjtBQUMzQixvQkFBQSxNQUFNLEVBQUUsTUFEbUI7QUFFM0Isb0JBQUEsSUFBSSxFQUFFO0FBRnFCLG1CQUEvQixFQUdHLElBSEgsQ0FHUSxVQUFBLEdBQUcsRUFBRTtBQUNULG9CQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBTCxDQUFXLEdBQUcsQ0FBQyxJQUFmLENBQUQsQ0FBUDtBQUNILG1CQUxELEVBS0csVUFBVSxLQUFWLEVBQWlCO0FBQ2hCLG9CQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWjtBQUNBLG9CQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBUCxDQUFOO0FBQ0gsbUJBUkQ7QUFTSCxpQkFWTSxDQURYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7OztBQWVKLE9BQU8sQ0FBQyxRQUFSLEdBQW1CLGdCQUFuQjtlQUVlLE87Ozs7QUNsSGY7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsbUJBQUQsQ0FBUCxDQUE2QixhQUFuRDs7SUFFTSxlOzs7OztBQUNGLDJCQUFZLEdBQVosRUFBaUIsR0FBakIsRUFBc0I7QUFBQTtBQUFBLDZCQUNaLGFBRFksRUFFWjtBQUFDLE1BQUEsTUFBTSxFQUFHO0FBQUMsUUFBQSxHQUFHLEVBQUcsR0FBUDtBQUFZLFFBQUEsR0FBRyxFQUFHO0FBQWxCO0FBQVYsS0FGWTtBQUlyQjs7O2tEQUwwQixXOztJQVF6QixpQjs7Ozs7QUFDRiw2QkFBWSxHQUFaLEVBQWlCLEtBQWpCLEVBQXdCLFFBQXhCLEVBQWtDO0FBQUE7QUFBQSw4QkFDeEIsZUFEd0IsRUFFMUI7QUFBQyxNQUFBLE1BQU0sRUFBRztBQUFDLFFBQUEsS0FBSyxFQUFHLEtBQVQ7QUFBZ0IsUUFBQSxHQUFHLEVBQUcsR0FBdEI7QUFBMkIsUUFBQSxRQUFRLEVBQUc7QUFBdEM7QUFBVixLQUYwQjtBQUlqQzs7O2tEQUw0QixXOztJQVEzQixTOzs7OztBQUNGLHVCQUFjO0FBQUE7QUFBQTtBQUViOzs7OztpR0FFRDtBQUFBOztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLHVDQUVhLEdBRmI7QUFHUSxrQkFBQSxLQUFJLENBQUMsU0FBTCxDQUFlLEdBQWYsRUFBb0IsZ0JBQXBCLENBQXFDLE9BQXJDLEVBQThDLFVBQUMsS0FBRDtBQUFBLDJCQUFTLEtBQUssQ0FBQyxNQUFOLENBQWEsT0FBYixDQUFxQixNQUFyQixDQUE0QixDQUE1QixFQUErQixDQUEvQixDQUFUO0FBQUEsbUJBQTlDOztBQUVBLGtCQUFBLEtBQUksQ0FBQyxTQUFMLENBQWUsR0FBZixFQUFvQixnQkFBcEIsQ0FBcUMsTUFBckMsRUFBNkMsVUFBQyxLQUFELEVBQVM7QUFDbEQsd0JBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixLQUFLLENBQUMsTUFBOUIsRUFBc0MsV0FBdEMsQ0FBZjs7QUFDQSxvQkFBQSxLQUFJLENBQUMsYUFBTCxDQUFtQixJQUFJLGlCQUFKLENBQXNCLEdBQXRCLEVBQTJCLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBeEMsRUFBOEMsUUFBOUMsQ0FBbkI7QUFDSCxtQkFIRDs7QUFMUiwrQ0FVaUIsR0FWakI7QUFXWSxvQkFBQSxLQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsRUFBa0IsR0FBbEIsRUFBdUIsZ0JBQXZCLENBQXdDLE9BQXhDLEVBQWlELFlBQU07QUFDbkQsc0JBQUEsS0FBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBSSxlQUFKLENBQW9CLEdBQXBCLEVBQXlCLEdBQXpCLENBQW5CO0FBQ0gscUJBRkQ7QUFYWjs7QUFVUSx1QkFBSyxJQUFJLEdBQUcsR0FBRyxDQUFmLEVBQWtCLEdBQUcsR0FBRyxDQUF4QixFQUEyQixHQUFHLEVBQTlCLEVBQWtDO0FBQUEsMkJBQXpCLEdBQXlCO0FBSWpDO0FBZFQ7O0FBRUkscUJBQVMsR0FBVCxHQUFlLENBQWYsRUFBa0IsR0FBRyxHQUFHLENBQXhCLEVBQTJCLEdBQUcsRUFBOUIsRUFBa0M7QUFBQSx3QkFBekIsR0FBeUI7QUFhakM7O0FBZkw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7QUFrQkE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0ksbUJBQVUsS0FBVixFQUFpQixLQUFqQixFQUF3QixRQUF4QixFQUFpQztBQUM3QixVQUFJLE9BQU8sR0FBRyxLQUFLLFNBQUwsQ0FBZSxLQUFmLENBQWQ7QUFDQSxNQUFBLE9BQU8sQ0FBQyxJQUFSLEdBQWUsS0FBZjtBQUNBLFVBQUksUUFBSixFQUFjLE9BQU8sQ0FBQyxLQUFSLENBQWMsV0FBZCxJQUE2QixRQUE3QjtBQUNqQjtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSxtQkFBVSxLQUFWLEVBQWdCO0FBQ1osVUFBSSxPQUFPLEtBQVAsS0FBaUIsUUFBakIsSUFBNkIsS0FBSyxHQUFHLENBQXJDLElBQTBDLEtBQUssR0FBRyxDQUF0RCxFQUF5RCxNQUFNLElBQUksS0FBSixDQUFVLG9CQUFvQixLQUE5QixDQUFOO0FBQ3pELFVBQUksUUFBUSxzQ0FBK0IsS0FBL0IsZ0JBQVo7QUFDQSxhQUFPLEtBQUssYUFBTCxDQUFtQixRQUFuQixDQUFQO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSxpQkFBUSxHQUFSLEVBQWEsR0FBYixFQUE2QjtBQUFBLFVBQVgsS0FBVyx1RUFBSCxFQUFHO0FBQ3pCLFdBQUssT0FBTCxDQUFhLEdBQWIsRUFBa0IsR0FBbEIsRUFBdUIsV0FBdkIsR0FBcUMsS0FBckM7QUFDSDs7O1dBRUQsaUJBQVEsR0FBUixFQUFhLEdBQWIsRUFBaUI7QUFDYixVQUFJLFFBQVEseUJBQWlCLEdBQWpCLDRCQUFvQyxHQUFwQyxpQkFBWjtBQUNBLGFBQU8sS0FBSyxhQUFMLENBQW1CLFFBQW5CLENBQVA7QUFDSDs7O1dBRUQscUJBQVksR0FBWixFQUFpQixHQUFqQixFQUFzQixLQUF0QixFQUE0QjtBQUN4QixVQUFJLE9BQU8sR0FBUCxLQUFlLFFBQWYsSUFBMkIsR0FBRyxHQUFHLENBQWpDLElBQXNDLEdBQUcsR0FBRyxDQUFoRCxFQUFtRCxNQUFNLElBQUksS0FBSixDQUFVLGtCQUFrQixHQUE1QixDQUFOO0FBQ25ELFVBQUksT0FBTyxHQUFQLEtBQWUsUUFBZixJQUEyQixHQUFHLEdBQUcsQ0FBakMsSUFBc0MsR0FBRyxHQUFHLENBQWhELEVBQW1ELE1BQU0sSUFBSSxLQUFKLENBQVUsa0JBQWtCLEdBQTVCLENBQU47QUFDbkQsV0FBSyxPQUFMLENBQWEsR0FBYixFQUFrQixHQUFsQixFQUF1QixZQUF2QixDQUFvQyxlQUFwQyxFQUFxRCxLQUFyRDtBQUNIOzs7RUFqRW1CLGE7O0FBb0V4QixNQUFNLENBQUMsY0FBUCxDQUFzQixNQUF0QixDQUE2QixZQUE3QixFQUEyQyxTQUEzQztBQUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQWpCOzs7Ozs7Ozs7OztJQ2pHTSxJOzs7Ozs7O1dBQ0YsY0FBSyxZQUFMLEVBQWtCO0FBQUE7O0FBQ2QsV0FBSyxZQUFMLEdBQW9CLFlBQXBCO0FBQ0EsV0FBSyxVQUFMLENBQWdCLGdCQUFoQixDQUFpQyxPQUFqQyxFQUEwQztBQUFBLGVBQUksS0FBSSxDQUFDLFVBQUwsRUFBSjtBQUFBLE9BQTFDO0FBQ0EsV0FBSyxZQUFMO0FBRUEsV0FBSyxRQUFMLENBQWMsZ0JBQWQsQ0FBK0IsWUFBL0IsRUFBNkM7QUFBQSxlQUFLLEtBQUksQ0FBQyxVQUFMLEVBQUw7QUFBQSxPQUE3QztBQUNBLFdBQUssVUFBTCxDQUFnQixnQkFBaEIsQ0FBaUMsWUFBakMsRUFBK0M7QUFBQSxlQUFLLEtBQUksQ0FBQyxVQUFMLEVBQUw7QUFBQSxPQUEvQztBQUNBLFdBQUssUUFBTCxDQUFjLGdCQUFkLENBQStCLFlBQS9CLEVBQTZDO0FBQUEsZUFBSyxLQUFJLENBQUMsVUFBTCxFQUFMO0FBQUEsT0FBN0M7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsZ0JBQWhCLENBQWlDLFlBQWpDLEVBQStDO0FBQUEsZUFBSyxLQUFJLENBQUMsVUFBTCxFQUFMO0FBQUEsT0FBL0M7QUFFQSxNQUFBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQix3QkFBMUIsRUFBb0QsT0FBcEQsQ0FBNEQsVUFBQyxHQUFELEVBQVE7QUFDaEUsUUFBQSxHQUFHLENBQUMsZ0JBQUosQ0FBcUIsT0FBckIsRUFBOEI7QUFBQSxpQkFBSSxLQUFJLENBQUMsS0FBTCxFQUFKO0FBQUEsU0FBOUI7QUFDSCxPQUZEO0FBSUEsTUFBQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsV0FBMUIsRUFBdUMsT0FBdkMsQ0FBK0MsVUFBQyxHQUFELEVBQU87QUFDbEQsUUFBQSxHQUFHLENBQUMsYUFBSixDQUFrQixhQUFsQixFQUFpQyxnQkFBakMsQ0FBa0QsT0FBbEQsRUFBMkQsWUFBSTtBQUMzRCxVQUFBLEtBQUksQ0FBQyxVQUFMLENBQWdCLEdBQWhCO0FBQ0gsU0FGRDtBQUdILE9BSkQ7QUFNQSxhQUFPLElBQVA7QUFDSDs7O1dBRUQsaUJBQU87QUFDSCxXQUFLLFFBQUwsQ0FBYyxTQUFkLENBQXdCLEdBQXhCLENBQTRCLFFBQTVCO0FBRUEsTUFBQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsd0JBQTFCLEVBQW9ELE9BQXBELENBQTRELFVBQUMsR0FBRCxFQUFPO0FBQy9ELFFBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxHQUFkLENBQWtCLFFBQWxCO0FBQ0gsT0FGRDtBQUdIOzs7V0FFRCxnQkFBTTtBQUNGLFdBQUssUUFBTCxDQUFjLFNBQWQsQ0FBd0IsTUFBeEIsQ0FBK0IsUUFBL0I7QUFDQSxXQUFLLFlBQUw7QUFDSDs7O1dBRUQsc0JBQVk7QUFBQTs7QUFDUixVQUFJLEtBQUssT0FBVCxFQUFrQjtBQUNsQixXQUFLLE9BQUwsR0FBZSxVQUFVLENBQUMsWUFBSTtBQUMxQixRQUFBLE1BQUksQ0FBQyxLQUFMOztBQUNBLFFBQUEsTUFBSSxDQUFDLE9BQUwsR0FBZSxJQUFmO0FBQ0gsT0FId0IsRUFHdEIsR0FIc0IsQ0FBekI7QUFJSDs7O1dBRUQsc0JBQVk7QUFDUixVQUFJLENBQUMsS0FBSyxPQUFWLEVBQW1CO0FBQ25CLE1BQUEsWUFBWSxDQUFDLEtBQUssT0FBTixDQUFaO0FBQ0EsV0FBSyxPQUFMLEdBQWUsSUFBZjtBQUNIOzs7V0FFRCxvQkFBVyxPQUFYLEVBQW1CO0FBQUE7O0FBQ2YsTUFBQSxPQUFPLGVBQUcsT0FBSCwrQ0FBYyxLQUFLLFFBQTFCOztBQUNBLFVBQUksQ0FBQyxPQUFPLENBQUMsU0FBUixDQUFrQixRQUFsQixDQUEyQixXQUEzQixDQUFMLEVBQTZDO0FBQ3pDLFFBQUEsT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFSLENBQXNCLFlBQXRCLENBQVY7QUFDSDs7QUFFRCxVQUFJLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFFBQWxCLENBQTJCLFFBQTNCLENBQUosRUFBeUM7QUFDckMsUUFBQSxPQUFPLENBQUMsU0FBUixDQUFrQixNQUFsQixDQUF5QixRQUF6QjtBQUNILE9BRkQsTUFFTztBQUNILFlBQUksT0FBTyxDQUFDLFNBQVIsQ0FBa0IsUUFBbEIsQ0FBMkIsV0FBM0IsQ0FBSixFQUE0QztBQUN4QyxVQUFBLE9BQU8sQ0FBQyxTQUFSLENBQWtCLEdBQWxCLENBQXNCLFFBQXRCO0FBQ0g7O0FBQ0QsUUFBQSxPQUFPLENBQUMsZ0JBQVIsQ0FBeUIsWUFBekIsRUFBdUMsT0FBdkMsQ0FDSSxVQUFDLEdBQUQsRUFBUztBQUNMLFVBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxHQUFkLENBQWtCLFFBQWxCO0FBQ0gsU0FITDtBQUtIO0FBQ0o7OztXQUVELHdCQUFjO0FBQ1YsVUFBTSxJQUFJLEdBQUcsS0FBSyxVQUFMLENBQWdCLHFCQUFoQixHQUF3QyxJQUFyRDtBQUNBLFVBQU0sTUFBTSxHQUFHLEtBQUssVUFBTCxDQUFnQixxQkFBaEIsR0FBd0MsS0FBdkQ7QUFDQSxVQUFNLE1BQU0sR0FBRyxLQUFLLFFBQUwsQ0FBYyxxQkFBZCxHQUFzQyxLQUFyRDs7QUFDQSxVQUFLLElBQUksR0FBRyxNQUFQLEdBQWdCLE1BQWhCLEdBQXlCLENBQTFCLEdBQStCLE1BQU0sQ0FBQyxVQUExQyxFQUFxRDtBQUNqRCxhQUFLLFdBQUw7QUFDSCxPQUZELE1BRU87QUFDSCxhQUFLLFlBQUw7QUFDSDtBQUNKOzs7V0FFRCx1QkFBYTtBQUNULFVBQU0sSUFBSSxHQUFHLEtBQUssVUFBTCxDQUFnQixVQUE3QjtBQUNBLFVBQU0sS0FBSyxHQUFHLEtBQUssUUFBTCxDQUFjLFdBQTVCO0FBQ0EsV0FBSyxRQUFMLENBQWMsS0FBZCxDQUFvQixJQUFwQixHQUE0QixJQUFJLEdBQUcsS0FBUCxHQUFlLENBQWhCLEdBQXFCLElBQWhEO0FBQ0g7OztXQUVELHdCQUFjO0FBQ1YsVUFBTSxJQUFJLEdBQUcsS0FBSyxVQUFMLENBQWdCLFVBQTdCO0FBQ0EsVUFBTSxLQUFLLEdBQUcsS0FBSyxVQUFMLENBQWdCLFdBQTlCO0FBQ0EsV0FBSyxRQUFMLENBQWMsS0FBZCxDQUFvQixJQUFwQixHQUE0QixJQUFJLEdBQUcsS0FBUCxHQUFlLENBQWhCLEdBQXFCLElBQWhEO0FBQ0g7OztTQUVELGVBQVU7QUFDTixhQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQUssWUFBNUIsQ0FBUDtBQUNIOzs7U0FFRCxlQUFnQjtBQUNaLGFBQU8sS0FBSyxJQUFMLENBQVUsYUFBVixDQUF3QixZQUF4QixDQUFQO0FBQ0g7OztTQUVELGVBQWM7QUFDVixhQUFPLEtBQUssSUFBTCxDQUFVLGFBQVYsQ0FBd0IsWUFBeEIsQ0FBUDtBQUNIOzs7OztBQUdMLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQWpCOzs7Ozs7Ozs7Ozs7Ozs7O0lDM0dNLEs7Ozs7Ozs7V0FDRixnQkFBeUI7QUFBQSxVQUFwQixJQUFvQix1RUFBYixXQUFhO0FBQ3JCLFdBQUssWUFBTCxHQUFvQixDQUFwQjtBQUVBLFdBQUssU0FBTCxHQUFpQjtBQUNiLFFBQUEsSUFBSSxFQUFFLElBRE87QUFFYixRQUFBLE1BQU0sRUFBRTtBQUZLLE9BQWpCO0FBS0EsV0FBSyxnQkFBTDtBQUNBLGFBQU8sSUFBUDtBQUNIOzs7U0FNRCxlQUFXO0FBQ1AsYUFBTyxLQUFLLFNBQUwsQ0FBZSxJQUF0QjtBQUNILEs7U0FORCxhQUFTLE1BQVQsRUFBaUI7QUFDYixXQUFLLFNBQUwsQ0FBZSxJQUFmLEdBQXNCLE1BQXRCO0FBQ0g7OztXQU1ELGFBQUksU0FBSixFQUFlO0FBQ1gsV0FBSyxZQUFMLEdBQW9CLENBQXBCO0FBQ0EsV0FBSyxTQUFMLEdBQWlCLFNBQWpCO0FBQ0EsYUFBTyxJQUFQO0FBQ0g7OztXQUVELGVBQU07QUFDRixhQUFPLEtBQUssU0FBWjtBQUNIOzs7V0FFRCxrQkFBUyxLQUFULEVBQWdCO0FBQUE7O0FBQ1osTUFBQSxLQUFLLGFBQUcsS0FBSCwyQ0FBWSxLQUFLLFlBQXRCO0FBQ0EsYUFBTyxLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLEtBQXRCLENBQVA7QUFDSDs7O1dBRUQsbUJBQVUsS0FBVixFQUFpQjtBQUNiLGFBQU8sS0FBSyxRQUFMLEdBQWdCLE1BQWhCLENBQXVCLEtBQXZCLENBQVA7QUFDSDs7O1dBRUQsaUJBQVEsR0FBUixFQUFhLE1BQWIsRUFBcUI7QUFDakIsYUFBTyxLQUFLLFNBQUwsQ0FBZSxNQUFmLEVBQXVCLElBQXZCLENBQTRCLEdBQTVCLENBQVA7QUFDSDs7O1dBRUQsdUJBQWM7QUFDVixVQUFJLEtBQUssVUFBTCxLQUFvQixDQUF4QixFQUEyQjtBQUMzQixXQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLE1BQXRCLENBQTZCLEtBQUssWUFBbEMsRUFBZ0QsQ0FBaEQ7QUFDQSxVQUFJLEtBQUssWUFBTCxJQUFxQixLQUFLLFVBQTlCLEVBQTBDLEtBQUssWUFBTCxHQUFvQixLQUFLLFVBQUwsR0FBa0IsQ0FBdEM7QUFDN0M7OztXQUVELGtDQUF3QjtBQUNwQixVQUFJLEtBQUssR0FBRztBQUNSLFFBQUEsSUFBSSxFQUFFLEtBQUssQ0FBQyxZQUFOLENBQW1CLGVBRGpCO0FBRVIsUUFBQSxRQUFRLEVBQUcsRUFGSDtBQUdSLFFBQUEsT0FBTyxFQUFHO0FBSEYsT0FBWjs7QUFNQSxXQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLENBQXBCLEVBQXVCLENBQUMsRUFBeEIsRUFBMkI7QUFDdkIsUUFBQSxLQUFLLENBQUMsT0FBTixDQUFjLENBQWQsSUFBbUI7QUFDZixVQUFBLElBQUksRUFBRyxFQURRO0FBRWYsVUFBQSxNQUFNLEVBQUc7QUFGTSxTQUFuQjtBQUlIOztBQUVELFdBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsSUFBdEIsQ0FBMkIsS0FBM0I7QUFDQSxhQUFPLEtBQVA7QUFDSDs7O1dBRUQsNEJBQW1CO0FBQ2YsVUFBSSxLQUFLLEdBQUc7QUFDUixRQUFBLElBQUksRUFBRSxLQUFLLENBQUMsWUFBTixDQUFtQixRQURqQjtBQUVSLFFBQUEsTUFBTSxFQUFFO0FBRkEsT0FBWjs7QUFLQSxXQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLENBQXBCLEVBQXVCLENBQUMsRUFBeEIsRUFBNEI7QUFDeEIsUUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsSUFBa0I7QUFDZCxVQUFBLFFBQVEsRUFBRSxFQURJO0FBRWQsVUFBQSxJQUFJLEVBQUU7QUFGUSxTQUFsQjs7QUFLQSxhQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLENBQXBCLEVBQXVCLENBQUMsRUFBeEIsRUFBNEI7QUFDeEIsVUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsRUFBZ0IsSUFBaEIsQ0FBcUIsQ0FBckIsSUFBMEI7QUFDdEIsWUFBQSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBTCxJQUFVLEdBREs7QUFFdEIsWUFBQSxJQUFJLEVBQUUsTUFGZ0I7QUFHdEIsWUFBQSxDQUFDLEVBQUUsRUFIbUI7QUFJdEIsWUFBQSxDQUFDLEVBQUU7QUFKbUIsV0FBMUI7QUFNSDtBQUNKOztBQUVELFdBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsSUFBdEIsQ0FBMkIsS0FBM0I7QUFDQSxhQUFPLEtBQVA7QUFDSDs7O1NBRUQsZUFBaUI7QUFDYixhQUFPLEtBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsTUFBN0I7QUFDSDs7O1dBRUQsMEJBQWdCO0FBQ1osV0FBSyxZQUFMO0FBQ0EsVUFBSSxLQUFLLFlBQUwsSUFBcUIsS0FBSyxVQUE5QixFQUEwQyxLQUFLLFlBQUwsR0FBb0IsS0FBSyxVQUFMLEdBQWtCLENBQXRDO0FBQzdDOzs7V0FFRCwwQkFBZ0I7QUFDWixXQUFLLFlBQUw7QUFDQSxVQUFJLEtBQUssWUFBTCxHQUFvQixDQUF4QixFQUEyQixLQUFLLFlBQUwsR0FBb0IsQ0FBcEI7QUFDOUI7OztXQUVELHlCQUFnQjtBQUNaLFVBQUksS0FBSyxHQUFHLEtBQUssUUFBTCxFQUFaOztBQUVBLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsQ0FBcEIsRUFBdUIsQ0FBQyxFQUF4QixFQUE0QjtBQUN4QixhQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLENBQXBCLEVBQXVCLENBQUMsRUFBeEIsRUFBNEI7QUFDeEIsVUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsRUFBZ0IsSUFBaEIsQ0FBcUIsQ0FBckIsRUFBd0IsS0FBeEIsSUFBaUMsQ0FBakM7QUFDSDtBQUNKO0FBQ0o7OztXQUVELHlCQUFnQjtBQUNaLFVBQUksS0FBSyxHQUFHLEtBQUssUUFBTCxFQUFaOztBQUVBLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsQ0FBcEIsRUFBdUIsQ0FBQyxFQUF4QixFQUE0QjtBQUN4QixhQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLENBQXBCLEVBQXVCLENBQUMsRUFBeEIsRUFBNEI7QUFDeEIsVUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLENBQWIsRUFBZ0IsSUFBaEIsQ0FBcUIsQ0FBckIsRUFBd0IsS0FBeEIsSUFBaUMsQ0FBakM7QUFDSDtBQUNKO0FBQ0o7Ozs7O0FBR0wsS0FBSyxDQUFDLFlBQU4sR0FBcUI7QUFDakIsRUFBQSxRQUFRLEVBQUcsUUFETTtBQUVqQixFQUFBLGVBQWUsRUFBRztBQUZELENBQXJCO2VBS2UsSzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDdElmLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxtQkFBRCxDQUFQLENBQTZCLGFBQW5EOztBQUNBLE9BQU8sQ0FBQyxlQUFELENBQVA7O0lBRU0sVTs7Ozs7QUFDRixzQkFBWSxLQUFaLEVBQW1CLElBQW5CLEVBQXlCO0FBQUE7QUFBQSw2QkFDZixhQURlLEVBRWpCO0FBQUMsTUFBQSxNQUFNLEVBQUc7QUFBQyxRQUFBLEtBQUssRUFBRyxLQUFUO0FBQWdCLFFBQUEsSUFBSSxFQUFHO0FBQXZCO0FBQVYsS0FGaUI7QUFJeEI7OztrREFMcUIsVzs7SUFRcEIsVzs7Ozs7QUFDRix1QkFBWSxLQUFaLEVBQW1CLEtBQW5CLEVBQTBCO0FBQUE7QUFBQSw4QkFDaEIsY0FEZ0IsRUFFbEI7QUFBQyxNQUFBLE1BQU0sRUFBRztBQUFDLFFBQUEsS0FBSyxFQUFHLEtBQVQ7QUFBZ0IsUUFBQSxLQUFLLEVBQUc7QUFBeEI7QUFBVixLQUZrQjtBQUl6Qjs7O2tEQUxzQixXOztJQVFyQixhOzs7OztBQUNGLDJCQUFjO0FBQUE7QUFBQSw4QkFDSixpQkFESTtBQUViOzs7a0RBSHdCLFc7O0lBTXZCLGtCOzs7Ozs7Ozs7Ozs7V0FFRixrQkFBUyxLQUFULEVBQWU7QUFDWCxXQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0g7Ozs7aUdBRUQ7QUFBQTs7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSx1REFFd0IsS0FBSyxnQkFBTCxDQUFzQix1QkFBdEIsQ0FGeEI7O0FBQUE7QUFFSSxzRUFBbUU7QUFBMUQsb0JBQUEsT0FBMEQ7QUFDL0Qsb0JBQUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEIsR0FBdUIsSUFBdkI7QUFDQSxvQkFBQSxPQUFPLENBQUMsZ0JBQVIsQ0FBeUIsVUFBekIsRUFBcUMsVUFBQyxLQUFEO0FBQUEsNkJBQVMsS0FBSSxDQUFDLFdBQUwsQ0FBaUIsS0FBakIsQ0FBVDtBQUFBLHFCQUFyQztBQUNBLG9CQUFBLE9BQU8sQ0FBQyxnQkFBUixDQUF5QixNQUF6QixFQUFpQyxVQUFDLEtBQUQsRUFBUztBQUN0QywwQkFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxZQUFiLENBQTBCLFlBQTFCLENBQVo7O0FBQ0EsMEJBQUksSUFBSSxHQUFHLEtBQUksQ0FBQyxhQUFMLG9DQUE4QyxLQUE5QyxVQUF5RCxJQUFwRTs7QUFDQSxzQkFBQSxLQUFJLENBQUMsYUFBTCxDQUFtQixJQUFJLFVBQUosQ0FBZSxLQUFmLEVBQXNCLElBQXRCLENBQW5CO0FBQ0gscUJBSkQ7QUFLSDtBQVZMO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUEsd0RBWXdCLEtBQUssZ0JBQUwsQ0FBc0IsV0FBdEIsQ0FaeEI7O0FBQUE7QUFZSSx5RUFBdUQ7QUFBOUMsb0JBQUEsUUFBOEM7O0FBQ25ELG9CQUFBLFFBQU8sQ0FBQyxnQkFBUixDQUF5QixjQUF6QixFQUF5QyxVQUFDLEtBQUQsRUFBUztBQUM5QywwQkFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLGdCQUFQLENBQXdCLEtBQUssQ0FBQyxNQUE5QixFQUFzQyxnQkFBdEMsQ0FBdUQsU0FBdkQsQ0FBWjtBQUNBLDBCQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQXpCOztBQUNBLHNCQUFBLEtBQUksQ0FBQyxhQUFMLENBQW1CLElBQUksV0FBSixDQUFnQixLQUFoQixFQUF1QixLQUF2QixDQUFuQjtBQUNILHFCQUpEO0FBS0g7QUFsQkw7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFvQkkscUJBQUssYUFBTCxDQUFtQixnQkFBbkIsRUFBcUMsZ0JBQXJDLENBQXNELE9BQXRELEVBQStELFlBQUk7QUFDL0Qsa0JBQUEsS0FBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBSSxhQUFKLEVBQW5CO0FBQ0gsaUJBRkQ7O0FBcEJKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7V0F5QkEscUJBQVksS0FBWixFQUFtQjtBQUNmLFVBQUksS0FBSyxDQUFDLEtBQU4sS0FBZ0IsRUFBcEIsRUFBdUI7QUFDbkIsUUFBQSxLQUFLLENBQUMsZUFBTjtBQUNBLFFBQUEsS0FBSyxDQUFDLGNBQU47QUFFQSxZQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsS0FBSyxDQUFDLE1BQTlCLEVBQXNDLGdCQUF0QyxDQUF1RCxTQUF2RCxDQUFaO0FBQ0EsUUFBQSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUQsQ0FBaEI7O0FBQ0EsWUFBSSxLQUFLLElBQUksQ0FBYixFQUFlO0FBQ1gsVUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWI7QUFDSCxTQUZELE1BRU87QUFDSCxjQUFJLFFBQVEsc0NBQThCLEtBQUssR0FBRyxDQUF0QyxRQUFaO0FBQ0EsZUFBSyxhQUFMLENBQW1CLFFBQW5CLEVBQTZCLEtBQTdCO0FBQ0g7O0FBRUQsZUFBTyxLQUFQO0FBQ0g7O0FBQ0QsTUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLE9BQWIsQ0FBcUIsTUFBckIsQ0FBNEIsQ0FBNUIsRUFBK0IsQ0FBL0I7QUFDQSxhQUFPLElBQVA7QUFDSDtBQUVEO0FBQ0o7QUFDQTs7OztXQUNJLG1CQUFVLE1BQVYsRUFBaUI7QUFBQSxrREFDRyxLQUFLLGdCQUFMLGFBREg7QUFBQTs7QUFBQTtBQUNiO0FBQUEsY0FBUyxHQUFUO0FBQW9ELFVBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxNQUFkLENBQXFCLFVBQXJCO0FBQXBEO0FBRGE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFFYixXQUFLLGFBQUwsaUJBQTRCLE1BQTVCLEdBQXNDLFNBQXRDLENBQWdELEdBQWhELENBQW9ELFVBQXBEO0FBQ0g7OztXQUVELGlCQUFRLEtBQVIsRUFBZSxJQUFmLEVBQW9CO0FBQ2hCLFdBQUssYUFBTCxvQ0FBOEMsS0FBOUMsVUFBeUQsSUFBekQsR0FBZ0UsSUFBaEU7QUFDSDs7O1dBRUQsb0JBQVcsS0FBWCxFQUFrQixLQUFsQixFQUF3QjtBQUNwQixXQUFLLGFBQUwsa0NBQTRDLEtBQTVDLFVBQXVELE9BQXZELEdBQWlFLEtBQWpFO0FBQ0g7OztFQWpFNEIsYTs7QUFvRWpDLE1BQU0sQ0FBQyxjQUFQLENBQXNCLE1BQXRCLENBQTZCLHNCQUE3QixFQUFxRCxrQkFBckQ7QUFDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixrQkFBakI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDOUZBLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxtQkFBRCxDQUFQLENBQTZCLGFBQW5EOztJQUVNLFU7Ozs7O0FBQ0Ysc0JBQVksSUFBWixFQUFrQjtBQUFBO0FBQUEsNkJBQ1IsYUFEUSxFQUVWO0FBQUMsTUFBQSxNQUFNLEVBQUc7QUFBQyxRQUFBLElBQUksRUFBRztBQUFSO0FBQVYsS0FGVTtBQUlqQjs7O2tEQUxxQixXOztJQVFwQixVOzs7OztBQUNGLHdCQUFjO0FBQUE7QUFBQSw4QkFDSixjQURJO0FBRWI7OztrREFIcUIsVzs7SUFNcEIsYTs7Ozs7QUFDRiwyQkFBYztBQUFBO0FBQUEsOEJBQ0osaUJBREk7QUFFYjs7O2tEQUh3QixXOztJQU12QixXOzs7OztBQUNGLHlCQUFjO0FBQUE7QUFBQSw4QkFDSixlQURJO0FBRWI7OztrREFIc0IsVzs7SUFNckIsWTs7Ozs7Ozs7Ozs7OztpR0FFRjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUdJLHFCQUFLLGFBQUwsQ0FBbUIsYUFBbkIsRUFBa0MsZ0JBQWxDLENBQW1ELE9BQW5ELEVBQTRELFlBQUk7QUFDNUQsa0JBQUEsS0FBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBSSxVQUFKLEVBQW5CO0FBQ0gsaUJBRkQ7QUFJQSxxQkFBSyxhQUFMLENBQW1CLGdCQUFuQixFQUFxQyxnQkFBckMsQ0FBc0QsT0FBdEQsRUFBK0QsWUFBSTtBQUMvRCxrQkFBQSxLQUFJLENBQUMsYUFBTCxDQUFtQixJQUFJLGFBQUosRUFBbkI7QUFDSCxpQkFGRDtBQUlBLHFCQUFLLGFBQUwsQ0FBbUIsY0FBbkIsRUFBbUMsZ0JBQW5DLENBQW9ELE9BQXBELEVBQTZELFlBQUk7QUFDN0Qsa0JBQUEsS0FBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBSSxXQUFKLEVBQW5CO0FBQ0gsaUJBRkQ7QUFJQSxxQkFBSyxnQkFBTCxDQUFzQixPQUF0QixFQUErQjtBQUFBLHlCQUFJLEtBQUksQ0FBQyxhQUFMLENBQW1CLGdCQUFuQixFQUFxQyxLQUFyQyxFQUFKO0FBQUEsaUJBQS9CO0FBRUEscUJBQUssYUFBTCxDQUFtQixnQkFBbkIsRUFBcUMsZ0JBQXJDLENBQXNELE1BQXRELDZGQUE4RDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDdEQsMEJBQUEsSUFEc0QsR0FDL0MsS0FBSSxDQUFDLGFBQUwsQ0FBbUIsZ0JBQW5CLEVBQXFDLElBRFU7O0FBRTFELDBCQUFBLEtBQUksQ0FBQyxhQUFMLENBQW1CLElBQUksVUFBSixDQUFlLElBQUksQ0FBQyxJQUFMLEVBQWYsQ0FBbkI7O0FBRjBEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUE5RDs7QUFqQko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7OztXQXVCQSxpQkFBTztBQUNILFdBQUssYUFBTCxDQUFtQixnQkFBbkIsRUFBcUMsSUFBckMsR0FBNEMsRUFBNUM7QUFDSDs7O1dBRUQsaUJBQVEsSUFBUixFQUFhO0FBQ1QsV0FBSyxhQUFMLENBQW1CLGdCQUFuQixFQUFxQyxJQUFyQyxHQUE0QyxJQUE1QztBQUNIO0FBRUQ7QUFDSjtBQUNBOzs7O1dBQ0ksbUJBQVUsTUFBVixFQUFpQjtBQUFBLGlEQUNHLEtBQUssZ0JBQUwsYUFESDtBQUFBOztBQUFBO0FBQ2I7QUFBQSxjQUFTLEdBQVQ7QUFBb0QsVUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLE1BQWQsQ0FBcUIsVUFBckI7QUFBcEQ7QUFEYTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUViLFdBQUssYUFBTCxpQkFBNEIsTUFBNUIsR0FBc0MsU0FBdEMsQ0FBZ0QsR0FBaEQsQ0FBb0QsVUFBcEQ7QUFDSDs7O1NBRUQsYUFBZ0IsS0FBaEIsRUFBc0I7QUFDbEIsVUFBSSxLQUFKLEVBQVU7QUFDTixhQUFLLGFBQUwsQ0FBbUIsYUFBbkIsRUFBa0MsSUFBbEM7QUFDSCxPQUZELE1BRUs7QUFDRCxhQUFLLGFBQUwsQ0FBbUIsYUFBbkIsRUFBa0MsSUFBbEM7QUFDSDtBQUNKOzs7RUEvQ3NCLGE7O0FBa0QzQixNQUFNLENBQUMsY0FBUCxDQUFzQixNQUF0QixDQUE2QixlQUE3QixFQUE4QyxZQUE5QztBQUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFlBQWpCOzs7OztBQzlFQSxNQUFNLENBQUMsT0FBUCxHQUFpQjtBQUNiO0FBQ0EsRUFBQSxZQUFZLEVBQUcseUNBRkY7QUFJYjtBQUNBLEVBQUEsUUFBUSxFQUFHLDBFQUxFO0FBT2I7QUFDQSxFQUFBLEtBQUssRUFBRyxjQVJLO0FBVWI7QUFDQSxFQUFBLGFBQWEsRUFBRyxDQUFDLDREQUFELENBWEg7QUFhYjtBQUNBLEVBQUEsS0FBSyxFQUFFO0FBZE0sQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCc7XG5jbGFzcyBBYnN0cmFjdE1vZGVsIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgYWJzdHJhY3QgbW9kZWwuICBJZiBkZWxlZ2F0ZSBpcyBwcm92aWRlZCB0aGVuIGFsbCBsaXN0ZW5lclxuICAgICAqIGFkZHMgYW5kIG5vdGlmaWVzIGFyZSBwZXJmb3JtZWQgb24gdGhlIGRlbGVnYXRlIGxpc3RlbmVyIGNvbGxlY3Rpb24uXG4gICAgICogQHBhcmFtIHt0eXBlfSBkZWxlZ2F0ZVxuICAgICAqIEByZXR1cm5zIHtubSRfQWJzdHJhY3RNb2RlbC5BYnN0cmFjdE1vZGVsfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmRlbGVnYXRlID0gdGhpcztcbiAgICAgICAgdGhpcy5hYnN0cmFjdE1vZGVsTGlzdGVuZXJzID0gW107ICAgICAgICBcbiAgICB9XG5cbiAgICBnZXREZWxlZ2F0ZSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZTtcbiAgICB9XG4gICAgXG4gICAgc2V0RGVsZWdhdGUoZGVsZWdhdGUgPSBudWxsKXtcbiAgICAgICAgaWYgKGRlbGVnYXRlID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmRlbGVnYXRlID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuYWJzdHJhY3RNb2RlbExpc3RlbmVycyA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IGRlbGVnYXRlLmRlbGVnYXRlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5kZWxlZ2F0ZSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInVuZGVmaW5lZCBkZWxlZ2F0ZVwiKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBhZGRMaXN0ZW5lcihsaXN0ZW5lcikge1xuICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSBcIm9iamVjdFwiKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgQWJzdHJhY3RNb2RlbCBsaXN0ZW5lciB0eXBlOiBcIiArIHR5cGVvZiBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kZWxlZ2F0ZS5hYnN0cmFjdE1vZGVsTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGwgYXMgbm90aWZ5TGlzdGVuZXJzKG1ldGhvZE5hbWUsIFttZXRob2RBcmd1bWVudDAsIC4uLiBtZXRob2RBcmd1bWVudE5dKVxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWV0aG9kXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnlMaXN0ZW5lcnMobWV0aG9kKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRVZFTlQgXCIgKyB0aGlzLmRlbGVnYXRlLmNvbnN0cnVjdG9yLm5hbWUgKyBcIiBcIiArIG1ldGhvZCk7XG5cbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnNoaWZ0LmFwcGx5KGFyZ3VtZW50cyk7XG4gICAgICAgIGxldCBldmVudCA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgICAgYXJnczogYXJndW1lbnRzLFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLFxuICAgICAgICAgICAgbGlzdGVuZXJzOiBbXVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgd2luZG93Lmxhc3RFdmVudCA9IGV2ZW50O1xuICAgICAgICB3aW5kb3cubkV2ZW50cy5wdXNoKHdpbmRvdy5sYXN0RXZlbnQpO1xuXG4gICAgICAgIGZvciAobGV0IGxpc3RlbmVyIG9mIHRoaXMuZGVsZWdhdGUuYWJzdHJhY3RNb2RlbExpc3RlbmVycykge1xuICAgICAgICAgICAgaWYgKGxpc3RlbmVyW21ldGhvZF0pe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiICsgXCIgKyBsaXN0ZW5lci5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgKyBtZXRob2QpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sYXN0RXZlbnQubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIuY29uc3RydWN0b3IubmFtZSk7ICAgICAgIFxuICAgICAgICAgICAgICAgIGF3YWl0IGxpc3RlbmVyW21ldGhvZF0uYXBwbHkobGlzdGVuZXIsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJbQWJzdHJhY3RNb2RlbC5kZWZhdWx0TGlzdGVuZXJdKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIiArIFwiICsgbGlzdGVuZXIuY29uc3RydWN0b3IubmFtZSArIFwiIFwiICsgQWJzdHJhY3RNb2RlbC5kZWZhdWx0TGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sYXN0RXZlbnQubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIuY29uc3RydWN0b3IubmFtZSk7ICAgICAgIFxuICAgICAgICAgICAgICAgIGF3YWl0IGxpc3RlbmVyW0Fic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyXS5hcHBseShsaXN0ZW5lciwgd2luZG93Lmxhc3RFdmVudCk7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5BYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lciA9IFwibmlkZ2V0TGlzdGVuZXJcIjtcbndpbmRvdy5uRXZlbnRzID0gW107XG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0TW9kZWw7IiwiJ3VzZSBzdHJpY3QnO1xuLyoqXG4gKiBTaW5nbGV0b24gY2xhc3MgdG8gcHJvdmlkaW5nIGZ1bmN0aW9uYWxpdHkgdG8gRHJhZ05pZGdldHMgYW5kIERyb3BOaWRnZXRzLlxuICogSXQgc3RvcmVzIHRoZSBOaWRnZXQgY3VycmVudGx5IGJlaW5nIGRyYWdnZWQuXG4gKi9cbmNsYXNzIERyYWdIYW5kbGVye1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG51bGw7XG4gICAgICAgIHRoaXMub3ZlciA9IFtdO1xuICAgIH1cbiAgICBcbiAgICBwdXNoT3ZlcihuaWRnZXQpe1xuICAgICAgICBpZiAodGhpcy5vdmVySGFzKG5pZGdldCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhpcy5vdmVyLnB1c2gobmlkZ2V0KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIFxuICAgIHJlbW92ZU92ZXIobmlkZ2V0KXtcbiAgICAgICAgaWYgKCF0aGlzLm92ZXJIYXMobmlkZ2V0KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLm92ZXIuc3BsaWNlKHRoaXMub3Zlci5pbmRleE9mKG5pZGdldCksIDEpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9ICAgIFxuICAgIFxuICAgIG92ZXJIYXMobmlkZ2V0KXtcbiAgICAgICAgcmV0dXJuIHRoaXMub3Zlci5pbmRleE9mKG5pZGdldCkgIT09IC0xO1xuICAgIH1cbiAgICBcbiAgICBzZXQobmlkZ2V0KXtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbmlkZ2V0O1xuICAgIH1cbiAgICBcbiAgICBnZXQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudDtcbiAgICB9XG4gICAgXG4gICAgaGFzKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQgIT09IG51bGw7XG4gICAgfVxuICAgIFxuICAgIGNsZWFyKCl7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG51bGw7XG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBnZXRJbnN0YW5jZSgpe1xuICAgICAgICByZXR1cm4gRHJhZ0hhbmRsZXIuaW5zdGFuY2U7XG4gICAgfSAgICBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRHJhZ0hhbmRsZXIoKTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuL05pZGdldEVsZW1lbnRcIik7XG5cbi8qIGdsb2JhbCBVdGlsaXR5ICovXG5jbGFzcyBGaWxlT3BlcmF0aW9ucyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGRvbSBlbGVtZW50IGZyb20gYSBmaWxlICh1cmwpLiAgTWFwIHZhcmlhYmxlcyAoJHsuLi59KSB0byBcbiAgICAgKiBhIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gdXJsXG4gICAgICogQHBhcmFtIHt0eXBlfSBtYXBcbiAgICAgKiBAcmV0dXJucyB7bm9kZXxGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudC5kb21FbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBsb2FkTmlkZ2V0KHVybCwgbWFwKXsgICAgICAgIFxuICAgICAgICBsZXQgZWxlbWVudCA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50KHVybCwgbWFwKTtcbiAgICAgICAgcmV0dXJuIG5ldyBOaWRnZXRFbGVtZW50KGVsZW1lbnQpO1xuICAgIH0gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGRvbSBlbGVtZW50IGZyb20gYSBmaWxlICh1cmwpLiAgTWFwIHZhcmlhYmxlcyAoJHsuLi59KSB0byBcbiAgICAgKiBhIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gdXJsXG4gICAgICogQHBhcmFtIHt0eXBlfSBtYXBcbiAgICAgKiBAcmV0dXJucyB7bm9kZXxGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudC5kb21FbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBsb2FkRE9NRWxlbWVudCh1cmwsIG1hcCA9IG5ldyBNYXAoKSl7ICAgICAgICBcbiAgICAgICAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCA9PT0gZmFsc2UpIG1hcCA9IEZpbGVPcGVyYXRpb25zLm9iamVjdFRvTWFwKG1hcCk7ICAgICAgIFxuICAgICAgICBsZXQgdGV4dCA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLmdldFVSTCh1cmwpO1xuICAgICAgICByZXR1cm4gRmlsZU9wZXJhdGlvbnMuc3RyaW5nVG9ET01FbGVtZW50KHRleHQsIG1hcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGRvbSBlbGVtZW50IGZyb20gdGV4dC5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHRleHRcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1hcFxuICAgICAqIEByZXR1cm5zIHtub2RlfEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50LmRvbUVsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIHN0cmluZ1RvRE9NRWxlbWVudCh0ZXh0LCBtYXAgPSBuZXcgTWFwKCkpe1xuICAgICAgICAvKiByZXBsYWNlIHZhcmlhYmxlcyB3aXRoIHZhbHVlcyAqL1xuICAgICAgICBmb3IgKGxldCBrZXkgb2YgbWFwLmtleXMoKSl7ICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBtYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGBbJF1be10/JHtrZXl9W31dYCwgYGdgKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsIHZhbHVlKTsgICAgXG4gICAgICAgIH1cblxuICAgICAgICAvKiByZXBsYWNlIHVuZmlsbGVkIHZhcmlhYmxlcyB3aXRoIGVtcHR5ICovXG4gICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XVtefV0qW31dYCwgYGdgKTtcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgXCJcIik7IFxuXG4gICAgICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gdGV4dDtcbiAgICAgICAgbGV0IGRvbUVsZW1lbnQgPSBudWxsO1xuICAgICAgICBjb25zb2xlLmxvZyhlbGVtZW50KTtcblxuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICBzdGF0aWMgb2JqZWN0VG9NYXAob2JqZWN0KXtcbiAgICAgICAgbGV0IG1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgZm9yIChsZXQgZmllbGQgaW4gb2JqZWN0KXsgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0W2ZpZWxkXSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2Ygb2JqZWN0W2ZpZWxkXSA9PT0gXCJudW1iZXJcIil7XG4gICAgICAgICAgICAgICAgbWFwLnNldChmaWVsZCwgb2JqZWN0W2ZpZWxkXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG5cbiAgICBcblxuICAgIC8qXG4gICAgICogVHJhbnNmZXIgY29udGVudHMgb2YgJ2ZpbGVuYW1lJyBmcm9tIHNlcnZlciB0byBjbGllbnQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gc3VjY2Vzc0NhbGxiYWNrXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZXJyb3JDYWxsYmFja1xuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IGNvbnRlbnRzIG9mIGZpbGVcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0VVJMKHVybCkge1xuICAgICAgICBsZXQgY2FsbGJhY2sgPSBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB2YXIgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICAgICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh4aHR0cC5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHR0cC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh4aHR0cC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHR0cCA6IHhodHRwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cyA6IHhodHRwLnN0YXR1cywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA6IHhodHRwLnJlc3BvbnNlVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmwgOiB1cmxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xuICAgICAgICAgICAgeGh0dHAuc2VuZChudWxsKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIHRleHQuXG4gICAgICogQHBhcmFtIHt0eXBlfSB0ZXh0XG4gICAgICogQHBhcmFtIHt0eXBlfSBtYXBcbiAgICAgKiBAcmV0dXJucyB7bm9kZXxGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudC5kb21FbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBnZXRGaWxlKHVybCwgbWFwID0gbmV3IE1hcCgpKXtcbiAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRVUkwodXJsKTtcblxuICAgICAgICAvKiByZXBsYWNlIHZhcmlhYmxlcyB3aXRoIHZhbHVlcyAqL1xuICAgICAgICBmb3IgKGxldCBrZXkgb2YgbWFwLmtleXMoKSl7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBtYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGBbJF1be10/JHtrZXl9W31dYCwgYGdgKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIHJlcGxhY2UgdW5maWxsZWQgdmFyaWFibGVzIHdpdGggZW1wdHkgKi9cbiAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdW159XSpbfV1gLCBgZ2ApO1xuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCBcIlwiKTtcblxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFRyYW5zZmVyIGNvbnRlbnRzIG9mICdmaWxlbmFtZScgZnJvbSBzZXJ2ZXIgdG8gY2xpZW50IHVzaW5nIGN1cnJlbnQgd2luZG93IGxvY2F0aW9uLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHN1Y2Nlc3NDYWxsYmFja1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGVycm9yQ2FsbGJhY2tcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRMb2NhbChmaWxlbmFtZSkge1xuICAgICAgICBsZXQgY2FsbGJhY2sgPSBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB2YXIgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgICAgICB2YXIgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWYgKyBcIi9cIiArIGZpbGVuYW1lO1xuXG4gICAgICAgICAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHhodHRwLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHhodHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoeGh0dHAuc3RhdHVzLCB4aHR0cC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xuICAgICAgICAgICAgeGh0dHAuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGNhbGxiYWNrKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogQ2F1c2UgJ3RleHQnIHRvIGJlIHNhdmVkIGFzICdmaWxlbmFtZScgY2xpZW50IHNpZGUuXG4gICAgICogQHBhcmFtIHt0eXBlfSBmaWxlbmFtZSBUaGUgZGVmYXVsdCBmaWxlbmFtZSB0byBzYXZlIHRoZSB0ZXh0IGFzLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gdGV4dCBUaGUgdGV4dCB0byBzYXZlIHRvIGZpbGVuYW1lLlxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgc3RhdGljIHNhdmVUb0ZpbGUodGV4dCwgZmlsZW5hbWUpIHtcbiAgICAgICAgbGV0IGFuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgbGV0IGRhdGEgPSBcInRleHQ7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KTtcbiAgICAgICAgYW5jaG9yLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgXCJkYXRhOlwiICsgZGF0YSk7XG4gICAgICAgIGFuY2hvci5zZXRBdHRyaWJ1dGUoXCJkb3dubG9hZFwiLCBmaWxlbmFtZSk7XG4gICAgICAgIGFuY2hvci5jbGljaygpO1xuICAgIH1cbn1cblxuRmlsZU9wZXJhdGlvbnMuTm9kZVR5cGUgPSB7XG4gICAgRUxFTUVOVCA6IDEsXG4gICAgQVRUUklCVVRFIDogMixcbiAgICBURVhUIDogMywgXG4gICAgQ0RBVEFTRUNUSU9OIDogNCxcbiAgICBFTlRJVFlSRUZFUk5DRSA6IDUsXG4gICAgRU5USVRZIDogNixcbiAgICBQUk9DRVNTSU5HSU5TVFJVQ1RJT04gOiA3LFxuICAgIENPTU1FTlQgOiA4LFxuICAgIERPQ1VNRU5UIDogOSxcbiAgICBET0NVTUVOVFRZUEUgOiAxMCxcbiAgICBET0NVTUVOVEZSQUdNRU5UIDogMTEsXG4gICAgTk9UQVRJT04gOiAxMlxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3BlcmF0aW9uczsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBtb3VzZSA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL01vdXNlXCIpLCBcbiAgICBkcmFnIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvRHJhZ1wiKSxcbiAgICBkcm9wIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvRHJvcFwiKSxcbiAgICBtb3ZhYmxlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvTW92YWJsZVwiKSxcbiAgICByZXNpemUgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9SZXNpemVcIilcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogU2luZ2x0b24gY2xhc3MgdG8gYWRkIGZ1bmN0aW9uYWxpdHkgdG8gdGhlIG1vdXNlLlxuICovXG5jbGFzcyBNb3VzZVV0aWxpdGllcyB7XG4gICAgXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQgPSBudWxsO1xuICAgICAgICB0aGlzLmxhc3RYID0gMDtcbiAgICAgICAgdGhpcy5sYXN0WSA9IDA7XG4gICAgfVxuICAgIFxuICAgIGlzVW5kZXIoZXZlbnQsIGVsZW1lbnQpIHtcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYO1xuICAgICAgICBsZXQgeSA9IGV2ZW50LmNsaWVudFk7XG4gICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcblxuICAgICAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnQgPT09IGVsZW1lbnQpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0VW5kZXIoZXZlbnQpIHtcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYO1xuICAgICAgICBsZXQgeSA9IGV2ZW50LmNsaWVudFk7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuICAgIH1cblxuICAgIHNldCBlbGVtZW50KGVsZW1lbnQpe1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZEVsZW1lbnQgIT09IG51bGwpe1xuICAgICAgICAgICAgdGhpcy5kZXRhY2hFbGVtZW50KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbGVtZW50IHx8IGVsZW1lbnQgPT09IG51bGwgfHwgZWxlbWVudCA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRoaXMuZGV0YWNoRWxlbWVudCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBlbGVtZW50KCl7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dGFjaGVkRWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggYW4gZWxlbWVudC4gIElmIHRoZSBlbGVtZW50IGRvZXNuJ3QgaGF2ZSBhIHBhcmVudCBpdCB3aWxsIGJlXG4gICAgICogYXR0YWNoZWQgdG8gdGhlIGRvY3VtZW50IGFuZCB3aWxsIGJlIGRldGFjaGVkIHdoZW4gZGV0YWNoRWxlbWVudCBpcyBjYWxsZWQuXG4gICAgICogQHBhcmFtIHt0eXBlfSBlbGVtZW50XG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBhdHRhY2hFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICBcbiAgICAgICAgaWYgKGVsZW1lbnQucGFyZW50KXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgYXR0YWNoIGVsZW1lbnQgdG8gbW91c2UgaWYgdGhlIGVsZW1lbnQgaGFzIGEgcGFyZW50IGVsZW1lbnQuXCIpO1xuICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKGVsZW1lbnQpO1xuICAgICAgICBlbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiOyBcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSBldmVudC5jbGllbnRZICsgXCJweFwiO1xuICAgICAgICBlbGVtZW50LnN0eWxlLmxlZnQgPSBldmVudC5jbGllbnRYICsgXCJweFwiO1xuICAgICAgICBlbGVtZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSBcIm5vbmVcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS56SW5kZXggPSBcIjEwMDAwXCI7XG4gICAgICAgIFxuICAgICAgICB0aGlzLm1vdmVDYWxsQmFjayA9IChldmVudCk9PnRoaXMub25Nb3VzZU1vdmUoZXZlbnQpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdmVDYWxsQmFjayk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGxpc3RlbmVycyBmcm9tIHRoZSBhdHRhY2hlZCBlbGVtZW50LCBkbyBub3QgcmVtb3ZlIGl0IGZyb20gdGhlXG4gICAgICogZG9jdW1lbnQuXG4gICAgICogQHJldHVybnMge3R5cGV9XG4gICAgICovXG4gICAgZGV0YWNoRWxlbWVudCgpe1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZEVsZW1lbnQgPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW92ZUNhbGxCYWNrKTsgICAgICAgIFxuICAgICAgICBsZXQgcnZhbHVlID0gdGhpcy5hdHRhY2hlZEVsZW1lbnQ7XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50ID0gbnVsbDsgICAgICAgIFxuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHJ2YWx1ZSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcnZhbHVlO1xuICAgIH1cblxuICAgIG9uTW91c2VNb3ZlKGV2ZW50KSB7ICAgICAgICBcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5sYXN0WCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIHRoaXMubGFzdFkgPSBldmVudC5jbGllbnRZO1xuXG4gICAgICAgIC8vIHNldCB0aGUgZWxlbWVudCdzIG5ldyBwb3NpdGlvbjpcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQuc3R5bGUudG9wID0gZXZlbnQuY2xpZW50WSArIFwicHhcIjtcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQuc3R5bGUubGVmdCA9IGV2ZW50LmNsaWVudFggKyBcInB4XCI7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb3VzZVV0aWxpdGllcygpOyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcHJlZml4OiBcImRhdGEtbmlkZ2V0XCIsXG4gICAgZWxlbWVudEF0dHJpYnV0ZTogXCJkYXRhLW5pZGdldC1lbGVtZW50XCIsXG4gICAgc3JjQXR0cmlidXRlOiBcInNyY1wiLFxuICAgIHRlbXBsYXRlU3JjQXR0cmlidXRlOiBcInRlbXBsYXRlLXNyY1wiLFxuICAgIG5hbWVBdHRyaWJ1dGU6IFwibmFtZVwiLFxuICAgIGludGVyZmFjZUF0dHJpYnV0ZTogXCJpbnRlcmZhY2VzXCIsXG4gICAgdGVtcGxhdGVBdHRyaWJ1dGU6IFwidGVtcGxhdGVcIixcbiAgICBpbnRlcmZhY2VEYXRhRmllbGQ6IFwiaW50ZXJmYWNlRGF0YVwiLFxuICAgIG1vZGVsRGF0YUZpZWxkOiBcIm1vZGVsRGF0YVwiLFxuICAgIHN0eWxlQXR0cmlidXRlOiBcIm5pZGdldC1zdHlsZVwiXG59OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgRmlsZU9wZXJhdGlvbnMgPSByZXF1aXJlKFwiLi9GaWxlT3BlcmF0aW9uc1wiKTtcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCIuL05pZGdldFwiKTtcbmNvbnN0IEludGVyZmFjZXMgPSByZXF1aXJlKFwiLi9JbnRlcmZhY2VzXCIpO1xuY29uc3QgVHJhbnNmb3JtZXIgPSByZXF1aXJlKFwiLi9UcmFuc2Zvcm1lclwiKTtcbmNvbnN0IE5pZGdldFN0eWxlID0gcmVxdWlyZShcIi4vTmlkZ2V0U3R5bGVcIik7XG5cbi8qKlxuICogQ2FsY3VsYXRlIHRoZSB3OmggYXNwZWN0IHJhdGlvIGFuZCBhZGp1c3QgdGhlIHByb3BvcnRpb25zIGFjY29yZGluZ2x5LlxuICpcbiAqL1xuY2xhc3MgQXNwZWN0UmF0aW97XG4gICAgY29uc3RydWN0b3IobmlkZ2V0KSB7XG4gICAgICAgIHRoaXMubmlkZ2V0ID0gbmlkZ2V0O1xuICAgICAgICB0aGlzLm9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpPT50aGlzLm9uUmVzaXplKCkpO1xuICAgICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUodGhpcy5uaWRnZXQpO1xuICAgICAgICB0aGlzLnBhcnNlVmFsdWVzKCk7XG4gICAgICAgIHRoaXMub25SZXNpemUoKTtcbiAgICAgICAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXRWYWx1ZSgpe1xuICAgICAgICByZXR1cm4gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShBc3BlY3RSYXRpby5DU1NfQVRUUklCVVRFKTtcbiAgICB9XG5cbiAgICBwYXJzZVZhbHVlcygpe1xuICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG4gICAgICAgIGxldCBzcGxpdCA9IHZhbHVlLnNwbGl0KC9bICw7XS9nKTtcblxuICAgICAgICBmb3IgKGxldCBzIG9mIHNwbGl0KXtcbiAgICAgICAgICAgIGlmIChzLnNwbGl0KC9bLTpdLykubGVuZ3RoID09PSAyKXtcbiAgICAgICAgICAgICAgICBsZXQgcmF0aW8gPSBzLnNwbGl0KC9bLTpdLyk7XG4gICAgICAgICAgICAgICAgdGhpcy53aWR0aCA9IHBhcnNlSW50KHJhdGlvWzBdKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhlaWdodCA9IHBhcnNlSW50KHJhdGlvWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHMgPT09IFwiaFwiKXtcbiAgICAgICAgICAgICAgICB0aGlzLm9uUmVzaXplID0gKCk9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLm5pZGdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLndpZHRoID0gKGhlaWdodCAqIHRoaXMud2lkdGggLyB0aGlzLmhlaWdodCkgKyBcInB4XCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblJlc2l6ZSgpe1xuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLm5pZGdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuaGVpZ2h0ID0gKHdpZHRoICogdGhpcy5oZWlnaHQgLyB0aGlzLndpZHRoKSArIFwicHhcIjtcbiAgICB9XG59XG5cbkFzcGVjdFJhdGlvLkNTU19BVFRSSUJVVEUgPSBcIi0tbmlkZ2V0LWFzcGVjdC1yYXRpb1wiO1xuXG4vKipcbiAqIEEgTmlkZ2V0RWxlbWVudCBpcyBhIDE6MSBjbGFzcy1vYmplY3Q6ZG9tLW9iamVjdCBwYWlyaW5nLiAgQWN0aW9ucyBvbiB0aGUgRE9NIFxuICogb2JqZWN0IHNob3VsZCBvbmx5IGJlIGNhbGxlZCBieSB0aGUgTmlkZ2V0RWxlbWVudCBvYmplY3QuICBUaGUgaW50ZXJmYWNlRGF0YVxuICogZmllbGQgaXMgcmVzZXJ2ZWQgZm9yIGRhdGEgZnJvbSBpbnRlcmZhY2VzLiAgSW50ZXJmYWNlcyBzaG91bGQgcHV0IHRoZWlyIFxuICogY3VzdG9tIGRhdGEgdW5kZXIgW2ludGVyZmFjZURhdGFGaWVsZF0uW2ludGVyZmFjZU5hbWVdLiAgVGhlIGludGVyZmFjZSBkYXRhXG4gKiBhdHRyaWJ1dGUgaXMgc2V0IHdpdGggdGhlIHN0YXRpYyB2YWx1ZSBOaWRnZXQuaW50ZXJmYWNlRGF0YUZpZWxkLlxuICogXG4gKiBDYWxsaW5nIG1ldGhvZHMgb24gdGhlIG5pZGdldCB3aWxsIHRyZWF0IHNoYWRvdyBjb250ZW50cyBhcyByZWd1bGFyIGNvbnRlbnRzLlxuICovXG5jbGFzcyBOaWRnZXRFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBOaWRnZXQgYXNzb2NpYXRlZCB3aXRoICdlbGVtZW50Jy4gIEFuIGVycm9yIHdpbGwgYmUgdGhyb3duXG4gICAgICogaWYgdGhlICdlbGVtZW50JyBpcyBhbHJlYWR5IGFzc29jaWF0ZWQgd2l0aCBhIE5pZGdldC5cbiAgICAgKiBcbiAgICAgKiBEaXNhYmxlZCBjbGFzcyBpbmRpY2F0ZXMgdGhpcyBuaWRnZXQgd2lsbCBpZ25vcmUgbW91c2UgZXZlbnRzLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7dHlwZX0gZWxlbWVudCBKUXVlcnkgc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJuIHtubSRfTmlkZ2V0Lk5pZGdldEVsZW1lbnR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IodGVtcGxhdGVJZCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzW05pZGdldC5pbnRlcmZhY2VEYXRhRmllbGRdID0ge307XG4gICAgICAgIHRoaXNbTmlkZ2V0Lm1vZGVsRGF0YUZpZWxkXSA9IHt9O1xuICAgICAgICB0aGlzLnRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybWVyKHRoaXMpO1xuICAgICAgICB0aGlzLm9ic2VydmVycyA9IHt9O1xuXG4gICAgICAgIGlmICh0ZW1wbGF0ZUlkKXtcbiAgICAgICAgICAgIHRoaXMuYXBwbHlUZW1wbGF0ZSh0ZW1wbGF0ZUlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjayBpcyBpbnZva2VkIGVhY2ggdGltZSB0aGUgY3VzdG9tIGVsZW1lbnQgaXMgYXBwZW5kZWQgaW50byBhIGRvY3VtZW50LWNvbm5lY3RlZCBlbGVtZW50XG4gICAgICovXG4gICAgYXN5bmMgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHRoaXMuc2hhZG93Q29udGVudHMgPSB0aGlzO1xuXG4gICAgICAgIC8vIHNldCB0aGUgaHRtbCBvZiB0aGlzIGVsZW1lbnQgdG8gdGhlIGNvbnRlbnRzIG9mIHRoZSBmaWxlIChub3QgYSBzaGFkb3cgZWxlbWVudClcbiAgICAgICAgLy8gYWxsIGRhdGEtIGF0dHJpYnV0ZXMgd2lsbCBiZSB1c2VkIHRvIGZpbGwgaW4gJHt9IHZhcmlhYmxlcyBpbiB0aGUgc291cmNlIGZpbGVcbiAgICAgICAgLy8gZG9lc24ndCB3b3JrIG9uIGVkZ2VcbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0cmlidXRlKE5pZGdldC5zcmNBdHRyaWJ1dGUpKSBhd2FpdCB0aGlzLnJldHJpZXZlU291cmNlKHRoaXMuZGF0YUF0dHJpYnV0ZXMoKSk7XG4gICAgICAgIGlmICh0aGlzLmhhc0F0dHJpYnV0ZShOaWRnZXQudGVtcGxhdGVTcmNBdHRyaWJ1dGUpKSBhd2FpdCB0aGlzLnJldHJpZXZlVGVtcGxhdGUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZSBhIG1hcCBvZiBhbGwgZGF0YSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybnMge01hcDxhbnksIGFueT59XG4gICAgICovXG4gICAgZGF0YUF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIGxldCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGZvciAobGV0IGF0dHIgb2YgdGhpcy5hdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBpZiAoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoXCJkYXRhLVwiKSkge1xuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gYXR0ci5uYW1lLnN1YnN0cig1KTtcbiAgICAgICAgICAgICAgICBtYXBbbmFtZV0gPSBhdHRyLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuXG4gICAgbm90aWZ5U3R5bGVzKCl7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgYXIgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMpLmdldFByb3BlcnR5VmFsdWUoQXNwZWN0UmF0aW8uQ1NTX0FUVFJJQlVURSk7XG4gICAgICAgICAgICAgICAgaWYgKGFyICE9PSBcIlwiKSBuZXcgQXNwZWN0UmF0aW8odGhpcyk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCBjb250ZW50cyBvZiBmaWxlIGFzIGEgdGVtcGxldGUgYW5kIGFwcGx5IHRoYXQgdGVtcGxhdGUgdG8gdGhpcyBlbGVtZW50LlxuICAgICAqIFJlcGxhY2UgYWxsICR7fSB2YXJpYWJsZXMgd2l0aCBjb250ZW50cyBvZiAnbWFwJy5cbiAgICAgKiBUaGUgdGVtcGxhdGUgd2lsbCBiZSBnaXZlbiB0aGUgaWQgZGVyaXZlZCBmcm9tIHRoZSBzcmMgYXR0cmlidXRlLlxuICAgICAqL1xuICAgIGFzeW5jIHJldHJpZXZlVGVtcGxhdGUoKXtcbiAgICAgICAgbGV0IHNyYyA9IHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldC50ZW1wbGF0ZVNyY0F0dHJpYnV0ZSk7XG4gICAgICAgIGxldCBpZCA9IHNyYy5yZXBsYWNlKC9bXFwvLyAuLV0rL2csIFwiX1wiKTtcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aWR9YCk7XG4gICAgICAgIGlmICh0ZW1wbGF0ZSkgYXdhaXQgdGhpcy5pbmplY3RUZW1wbGF0ZSh0ZW1wbGF0ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGEgc2hhZG93IGVsZW1lbnQgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIHRlbXBsYXRlIG5hbWVkICh0ZW1wbGF0ZUlEKS5cbiAgICAgKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgYXBwbHlUZW1wbGF0ZSh0ZW1wbGF0ZUlkKSB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRlbXBsYXRlSWQpO1xuXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHRocm93IG5ldyBFcnJvcihcIlRlbXBsYXRlICdcIiArIHRlbXBsYXRlSWQgKyBcIicgbm90IGZvdW5kLlwiKTtcbiAgICAgICAgaWYgKHRlbXBsYXRlLnRhZ05hbWUudG9VcHBlckNhc2UoKSAhPT0gXCJURU1QTEFURVwiKSB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtZW50IHdpdGggaWQgJ1wiICsgdGVtcGxhdGVJZCArIFwiJyBpcyBub3QgYSB0ZW1wbGF0ZS5cIik7XG5cbiAgICAgICAgdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6ICdvcGVuJ30pLmFwcGVuZENoaWxkKHRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpKTtcbiAgICB9XG5cbiAgICBhc3luYyBpbmplY3RUZW1wbGF0ZSh0ZW1wbGF0ZSl7XG4gICAgICAgIGlmICh0aGlzLnNoYWRvd1Jvb3QgIT09IG51bGwpIHJldHVybjtcbiAgICAgICAgdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6ICdvcGVuJ30pLmFwcGVuZENoaWxkKHRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgICAgYXdhaXQgdGhpcy5ub3RpZnlTdHlsZXMoKTtcbiAgICAgICAgYXdhaXQgdGhpcy5yZWFkeSgpO1xuICAgIH1cblxuICAgIGFzeW5jIHJlYWR5KCl7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGNvbnRlbnRzIG9mIGZpbGUgaW50byB0aGlzIGVsZW1lbnQuXG4gICAgICogUmVwbGFjZSBhbGwgJHt9IHZhcmlhYmxlcyB3aXRoIGNvbnRlbnRzIG9mICdtYXAnLlxuICAgICAqL1xuICAgIGFzeW5jIHJldHJpZXZlU291cmNlKG1hcCl7XG4gICAgICAgIGxldCBzcmMgPSB0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXQuc3JjQXR0cmlidXRlKTtcbiAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRGaWxlKHNyYywgbWFwKTtcbiAgICAgICAgdGhpcy5pbm5lckhUTUwgPSB0ZXh0O1xuICAgIH1cblxuICAgIHN0YXRpYyBhc3luYyBsb2FkVGVtcGxhdGVTbmlwcGV0KGZpbGVuYW1lLCB0YWduYW1lKXtcbiAgICAgICAgbGV0IGlkID0gZmlsZW5hbWUucmVwbGFjZSgvW1xcLy8gLi1dKy9nLCBcIl9cIik7XG5cbiAgICAgICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtpZH1gKSl7XG4gICAgICAgICAgICBsZXQgdGV4dCA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLmdldEZpbGUoZmlsZW5hbWUpO1xuICAgICAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRlbXBsYXRlXCIpO1xuICAgICAgICAgICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gdGV4dDtcbiAgICAgICAgICAgIHRlbXBsYXRlLnNldEF0dHJpYnV0ZShcImlkXCIsIGlkKTtcbiAgICAgICAgICAgIGlmICh0YWduYW1lKSB0ZW1wbGF0ZS5zZXRBdHRyaWJ1dGUoXCJkYXRhLW5pZGdldFwiLCB0YWduYW1lKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2lkfWApO1xuXG4gICAgICAgIGZvciAobGV0IGVsZSBvZiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRhZ25hbWUpKXtcbiAgICAgICAgICAgIGF3YWl0IGVsZS5pbmplY3RUZW1wbGF0ZSh0ZW1wbGF0ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgJ2hpZGRlbicgY2xhc3MuXG4gICAgICovXG4gICAgc2hvdygpIHtcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCAnaGlkZGVuJyBjbGFzcy5cbiAgICAgKi9cbiAgICBoaWRlKCkge1xuICAgICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBkaXNhYmxlZCBmbGFnIHRoYXQgaXMgcmVhZCBieSBuaWRnZXQgbW91c2UgZnVuY3Rpb25zLlxuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqL1xuICAgIHNldCBkaXNhYmxlZCh2YWx1ZSl7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUsIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZGlzYWJsZWQgZmxhZyB0aGF0IGlzIHJlYWQgYnkgbmlkZ2V0IG1vdXNlIGZ1bmN0aW9ucy5cbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKi9cbiAgICBnZXQgZGlzYWJsZWQoKXtcbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dHJpYnV0ZShOaWRnZXRFbGVtZW50LkRJU0FCTEVEX0FUVFJJQlVURSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldEVsZW1lbnQuRElTQUJMRURfQVRUUklCVVRFKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIGVsZW1lbnQgd2FzIHVuZGVyIHRoZSBtb3VzZSBmb3IgdGhlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZXZlbnRcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzVW5kZXJNb3VzZShldmVudCkge1xuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WTtcbiAgICAgICAgbGV0IGN1cnJlbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuXG4gICAgICAgIHdoaWxlIChjdXJyZW50KSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudCA9PT0gdGhpcykgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW4gdGhlIHF1ZXJ5IHNlbGVjdG9yIG9uIHRoaXMgZWxlbWVudC5cbiAgICAgKiBJZiB0aGlzIGVsZW1lbnQgaGFzIGEgc2hhZG93LCBydW4gaXQgb24gdGhhdCBpbnN0ZWFkLlxuICAgICAqIEBwYXJhbSBzZWxlY3RvcnNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdfVxuICAgICAqL1xuICAgcXVlcnlTZWxlY3RvcihzZWxlY3RvcnMpIHtcbiAgICAgICAgaWYgKHRoaXMuc2hhZG93Um9vdCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW4gdGhlIHF1ZXJ5IHNlbGVjdG9yIG9uIHRoaXMgZWxlbWVudC5cbiAgICAgKiBJZiB0aGlzIGVsZW1lbnQgaGFzIGEgc2hhZG93LCBydW4gaXQgb24gdGhhdCBpbnN0ZWFkLlxuICAgICAqIEBwYXJhbSBzZWxlY3RvcnNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdfVxuICAgICAqL1xuICAgIHF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKSB7XG4gICAgICAgIGlmICh0aGlzLnNoYWRvd1Jvb3Qpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIHRoaXMgZWxlbWVudCBmcm9tIGl0J3MgcGFyZW50LlxuICAgICAqL1xuICAgIGRldGFjaCgpe1xuICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5kZXggd2l0aGluIHRoZSBwYXJlbnQgZWxlbWVudC5cbiAgICAgKi9cbiAgICBpbmRleCgpe1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnBhcmVudEVsZW1lbnQuY2hpbGRyZW4pLmluZGV4T2YodGhpcyk7XG4gICAgfVxufVxuXG4vLyBOaWRnZXRFbGVtZW50Lm11dGF0aW9uT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkLCBvYnNlcnZlcik9Pntcbi8vICAgICByZWNvcmQuZm9yRWFjaCgobXV0YXRpb24pID0+IHtcbi8vICAgICAgICAgaWYgKCFtdXRhdGlvbi5hZGRlZE5vZGVzKSByZXR1cm5cbi8vICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtdXRhdGlvbi5hZGRlZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4vLyAgICAgICAgICAgICBsZXQgbm9kZSA9IG11dGF0aW9uLmFkZGVkTm9kZXNbaV07XG4vLyAgICAgICAgICAgICBpZiAobm9kZS50YWdOYW1lID09PSBcIlRFTVBMQVRFXCIpIHtcbi8vICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhub2RlLnRhZ05hbWUpO1xuLy8gICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5vZGUuZ2V0QXR0cmlidXRlKFwiZGF0YS1uaWRnZXRcIikpO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgfSk7XG4vLyB9KTtcbi8vXG4vLyBOaWRnZXRFbGVtZW50Lm11dGF0aW9uT2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwge1xuLy8gICAgIGNoaWxkTGlzdDogdHJ1ZSxcbi8vICAgICBzdWJ0cmVlOiB0cnVlLFxuLy8gICAgIGF0dHJpYnV0ZXM6IGZhbHNlLFxuLy8gICAgIGNoYXJhY3RlckRhdGE6IGZhbHNlXG4vLyB9KTtcblxuTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUgPSBcIm5pZGdldC1kaXNhYmxlZFwiO1xud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWVsZW1lbnQnLCBOaWRnZXRFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0RWxlbWVudDsiLCIndXNlIHN0cmljdCc7XG4vKipcbiAqIE1hbmlwdWxhdGVzIHRoZSBlbGVtZW50cyBzdHlsZSB3aXRoIGpzIHJvdXRpbmVzIGFjY29yZGluZyB0byBjc3MgZmxhZ3MuXG4gKiBOaWRnZXQgc3R5bGUgaXMgYXBwbGllZCB0byBhbGwgbmlkZ2V0LWVsZW1lbnRzIHVubGVzcyB0aGV5IGhhdmUgdGhlIG5pZGdldC1zdHlsZVxuICogYXR0cmlidXRlIHNldCB0byAnZmFsc2UnLlxuICovXG5cbmNsYXNzIE5pZGdldFN0eWxlIHtcblxuICAgIGNvbnN0cnVjdG9yKG5pZGdldCkge1xuICAgICAgICB0aGlzLm5pZGdldCA9IG5pZGdldDtcbiAgICAgICAgdGhpcy5hcHBseSgpO1xuICAgIH1cbiAgICBcbiAgICBhcHBseSgpIHtcbiAgICAgICAgdGhpcy5uaWRnZXRXaWR0aFJhdGlvKCk7XG4gICAgICAgIHRoaXMubmlkZ2V0SGVpZ2h0UmF0aW8oKTtcbiAgICAgICAgdGhpcy5uaWRnZXRGaXRUZXh0KCk7XG4gICAgICAgIHRoaXMubmlkZ2V0Rml0VGV4dFdpZHRoKCk7XG4gICAgICAgIHRoaXMubmlkZ2V0VmVydEFsaWduVGV4dCgpO1xuICAgIH1cbiAgICBcbiAgICBuaWRnZXRXaWR0aFJhdGlvKCkge1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtd2lkdGgtcmF0aW9cIik7XG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjsgICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4geyAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5uaWRnZXQud2lkdGggPSB0aGlzLm5pZGdldC5oZWlnaHQgKiByYXRpbztcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7ICAgICAgXG4gICAgfVxuICAgIFxuICAgIG5pZGdldEhlaWdodFJhdGlvKCkge1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtaGVpZ2h0LXJhdGlvXCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47ICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHsgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LmhlaWdodCA9IHRoaXMubmlkZ2V0LndpZHRoICogcmF0aW87XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbGwgdGhlIHRleHQgaGVpZ2h0IHRvIG1hdGNoIHRoZSBlbGVtZW50IGhlaWdodC5cbiAgICAgKiBDaGFuZ2UgdGhlIHJhdGlvIHZhbHVlIChvciB0aGUgZm9udFNpemUpIGFkanVzdC5cbiAgICAgKi9cbiAgICBuaWRnZXRGaXRUZXh0KCkge1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtZml0LXRleHRcIik7ICAgICAgICBcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xuXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgLS1uaWRnZXQtZml0LXRleHQgJHtyYXRpb31gKVxuICAgICAgICAgICAgbGV0IGggPSB0aGlzLm5pZGdldC5vZmZzZXRIZWlnaHQgKiByYXRpbztcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gaCArIFwicHhcIjtcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7ICAgICAgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIFdpbGwgY2hhbmdlIHRoZSBmb250IHNpemUgc28gdGhhdCB0aGUgdGV4dCBmaXQncyBpbiB0aGUgcGFyZW50IGVsZW1lbnQuXG4gICAgICogIERvbid0IHNldCB0aGUgd2lkdGggb2YgdGhlIGVsZW1lbnQuXG4gICAgICovXG4gICAgbmlkZ2V0Rml0VGV4dFdpZHRoKCkge1xuICAgICAgICBsZXQgcmVtb3ZlID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0LXdpZHRoXCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmVtb3ZlKSkgcmV0dXJuO1xuXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50XG5cbiAgICAgICAgICAgIGxldCB0ZXh0VyA9IHRoaXMubmlkZ2V0LnNjcm9sbFdpZHRoO1xuICAgICAgICAgICAgbGV0IGNvbnRXID0gdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgIGNvbnRXID0gY29udFcgLSByZW1vdmU7XG4gICAgICAgICAgICBsZXQgZHcgPSBjb250Vy90ZXh0VztcbiAgICAgICAgICAgIGxldCBjb21wdXRlZEZvbnRTaXplID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQtc2l6ZScpXG4gICAgICAgICAgICBjb21wdXRlZEZvbnRTaXplID0gcGFyc2VJbnQoY29tcHV0ZWRGb250U2l6ZSk7XG4gICAgICAgICAgICBjb21wdXRlZEZvbnRTaXplID0gTWF0aC5yb3VuZChjb21wdXRlZEZvbnRTaXplKTtcbiAgICAgICAgICAgIGxldCBuZXdGb250U2l6ZSA9IE1hdGgucm91bmQoY29tcHV0ZWRGb250U2l6ZSAqIGR3KTtcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5uaWRnZXQub2Zmc2V0SGVpZ2h0XG5cbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhjb21wdXRlZEZvbnRTaXplIC0gbmV3Rm9udFNpemUpIDw9IDIpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKG5ld0ZvbnRTaXplID4gaCkgbmV3Rm9udFNpemUgPSBoO1xuXG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IG5ld0ZvbnRTaXplICsgXCJweFwiO1xuICAgICAgICB9KS5vYnNlcnZlKHRoaXMubmlkZ2V0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGxpbmUgaGVpZ2h0IHRvIHRoZSBvZmZzZXQgaGVpZ2h0IG11bHRpcGxpZWQgYnkgcmF0aW8uXG4gICAgICovXG4gICAgbmlkZ2V0VmVydEFsaWduVGV4dCgpe1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtdmVydC1hbGlnbi10ZXh0XCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XG5cbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5uaWRnZXQub2Zmc2V0SGVpZ2h0ICogcmF0aW87XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5saW5lSGVpZ2h0ID0gaCArIFwicHhcIjtcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldFN0eWxlOyIsIid1c2Ugc3RyaWN0JztcbmNsYXNzIFRyYW5zZm9ybXtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSl7XG4gICAgICAgIGxldCBpbmRleE9mID0gdmFsdWUuaW5kZXhPZihcIihcIik7XG4gICAgICAgIHRoaXMubmFtZSA9IHZhbHVlLnN1YnN0cmluZygwLCBpbmRleE9mKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlLnN1YnN0cmluZyh0aGlzLm5hbWUubGVuZ3RoICsgMSwgdmFsdWUubGVuZ3RoIC0gMSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiLCBcIiArIHRoaXMudmFsdWUpO1xuICAgIH1cbiAgICBcbiAgICB0b1N0cmluZygpe1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lICsgXCIoXCIgKyB0aGlzLnZhbHVlICsgXCIpXCI7XG4gICAgfSAgICBcbn1cblxuY2xhc3MgVHJhbnNmb3JtZXIge1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cbiAgICBcbiAgICBhcHBlbmQoKXtcbiAgICAgICAgbGV0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmVsZW1lbnQpW1widHJhbnNmb3JtXCJdO1xuICAgICAgICBpZiAoY29tcHV0ZWRTdHlsZSAhPT0gXCJub25lXCIpIHRoaXMucHVzaChjb21wdXRlZFN0eWxlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIGNsZWFyKCl7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBcIlwiO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgdW5zaGlmdCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSB2YWx1ZSArIFwiIFwiICsgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybTtcbiAgICB9XG4gICAgXG4gICAgcHVzaCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtICsgXCIgXCIgKyB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSAgICBcbiAgICBcbiAgICBzaGlmdCgpe1xuICAgICAgICBsZXQgYXJyYXkgPSB0aGlzLnNwbGl0KCk7XG4gICAgICAgIGlmIChhcnJheS5sZW5ndGggPT09IDApIHJldHVybiBcIlwiO1xuICAgICAgICBhcnJheS5zaGlmdCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBwb3AoKXtcbiAgICAgICAgbGV0IGFycmF5ID0gdGhpcy5zcGxpdCgpO1xuICAgICAgICBpZiAoYXJyYXkubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcbiAgICAgICAgYXJyYXkucG9wKCk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBhcnJheS5qb2luKFwiIFwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7ICAgICAgXG4gICAgfVxuICAgIFxuICAgIHJlcGxhY2UodmFsdWUpe1xuICAgICAgICBsZXQgbmV3VHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybSh2YWx1ZSk7XG4gICAgICAgIGxldCBhcnJheSA9IHRoaXMuc3BsaXQoKTtcbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGVudHJ5ID0gYXJyYXlbaV07XG4gICAgICAgICAgICBsZXQgdHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybShlbnRyeSk7XG4gICAgICAgICAgICBpZiAodHJhbnNmb3JtLm5hbWUgPT09IG5ld1RyYW5zZm9ybS5uYW1lKXtcbiAgICAgICAgICAgICAgICBhcnJheVtpXSA9IG5ld1RyYW5zZm9ybS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBhcnJheS5qb2luKFwiIFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgc3BsaXQoKXtcbiAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybTtcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcbiAgICAgICAgbGV0IHJ2YWx1ZSA9IFtdO1xuICAgICAgICBsZXQgbGFzdCA9ICcnO1xuICAgICAgICBsZXQgc2tpcCA9IGZhbHNlO1xuICAgICAgICBsZXQgbmVzdGVkUCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGlmICghc2tpcCAmJiB2YWx1ZVtpXSA9PT0gJyAnICYmIGxhc3QgPT09ICcgJyl7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFza2lwICYmIHZhbHVlW2ldID09PSAnICcpIHtcbiAgICAgICAgICAgICAgICBydmFsdWUucHVzaCh2YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIGkpKTtcbiAgICAgICAgICAgICAgICBzdGFydCA9IGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlW2ldID09PSAnKCcpIHtcbiAgICAgICAgICAgICAgICBuZXN0ZWRQKys7XG4gICAgICAgICAgICAgICAgc2tpcCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlW2ldID09PSAnKScpIHtcbiAgICAgICAgICAgICAgICBuZXN0ZWRQLS07XG4gICAgICAgICAgICAgICAgaWYgKG5lc3RlZFAgPT09IDApIHNraXAgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhc3QgPSB2YWx1ZVtpXTtcbiAgICAgICAgfVxuICAgICAgICBydmFsdWUucHVzaCh2YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIHZhbHVlLmxlbmd0aCkpO1xuICAgICAgICByZXR1cm4gcnZhbHVlO1xuICAgIH1cbiAgICBcbiAgICB0b1N0cmluZygpe1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhbnNmb3JtZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBOaWRnZXQgdGhhdCBjaGFuZ2VzIHRoZSBpbWFnZSBmb3IgaG92ZXIsIGRpc2FibGVkLCBwcmVzcywgYW5kIGlkbGUuXG4gKiBGaXJlcyBhIGNsaWNrIGV2ZW50IHdoZW4gY2xpY2tlZC5cbiAqXG4gKiBXaWxsIHNldCB0aGUgY3VycmVudCBzdGF0ZSBhcyBkYXRhLXN0YXRlIHNvIHRoYXQgY3NzIGNhbiBhY2Nlc3MgaXQuXG4gKi9cbmNsYXNzIE5pZGdldEJ1dHRvbiBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgICAgIHRoaXMuYWxwaGFUb2xlcmFuY2UgPSAwOyAvLyBhbHBoYSBuZWVkcyB0byBiZSA+IHRvbGVyYW5jZSB0byB0cmlnZ2VyIGV2ZW50cy5cblxuICAgICAgICB0aGlzLnN0cmluZ0hvdmVyID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdIT1ZFUiddXCI7XG4gICAgICAgIHRoaXMuc3RyaW5nRGlzYWJsZWQgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J0RJU0FCTEVEJ11cIjtcbiAgICAgICAgdGhpcy5zdHJpbmdQcmVzcyA9IFwibmlkZ2V0LWJ1dHRvbi1zdGF0ZVtzdGF0ZT0nUFJFU1MnXVwiO1xuICAgICAgICB0aGlzLnN0cmluZ0lkbGUgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J0lETEUnXVwiO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcImlkbGVcIjtcbiAgICB9XG5cbiAgICBpc0luU2V0KCkge1xuICAgICAgICBsZXQgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICAgICAgICB3aGlsZSAocGFyZW50ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChwYXJlbnQudGFnTmFtZSA9PT0gXCJOSURHRVQtQlVUVE9OLVNFVFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbmlkZ2V0UmVhZHkoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nRGlzYWJsZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSWRsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlzSW5TZXQoKSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgdGhpcy5tb3VzZUVudGVyKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlTGVhdmUpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZVByZXNzKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlUmVsZWFzZSk7XG5cbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5kaXNhYmxlZCkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBpc1VuZGVyKGV2ZW50KSB7XG4gICAgICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LmVsZW1lbnRzRnJvbVBvaW50KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuICAgICAgICBpZiAoZWxlbWVudHMuaW5kZXhPZih0aGlzLmFjdGl2ZU5pZGdldCkgPT0gLTEpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuYWN0aXZlTmlkZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFggLSByZWN0Lng7XG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WSAtIHJlY3QueTtcblxuICAgICAgICByZXR1cm4gdGhpcy50ZXN0QWxwaGEoeCwgeSk7XG4gICAgfVxuXG4gICAgZ2V0IGRpc2FibGVkKCkge1xuICAgICAgICByZXR1cm4gc3VwZXIuZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgc2V0IGRpc2FibGVkKHZhbHVlKSB7XG4gICAgICAgIHN1cGVyLmRpc2FibGVkID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nRGlzYWJsZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiaW5cIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0hvdmVyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwicHJlc3NcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ1ByZXNzO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSWRsZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3VzZVJlbGVhc2UoZSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XG4gICAgfVxuXG4gICAgbW91c2VQcmVzcyhlKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBcInByZXNzXCI7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdQcmVzcztcbiAgICB9XG5cbiAgICBoaWRlQWxsSW1hZ2VzKCkge1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdIb3ZlcikuaGlkZSgpO1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdEaXNhYmxlZCkuaGlkZSgpO1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdQcmVzcykuaGlkZSgpO1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdJZGxlKS5oaWRlKCk7XG4gICAgfVxuXG4gICAgc2V0IGFjdGl2ZU5pZGdldChzZWxlY3Rvcikge1xuICAgICAgICB0aGlzLmhpZGVBbGxJbWFnZXMoKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlTmlkZ2V0ID0gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlTmlkZ2V0LnNob3coKTtcbiAgICB9XG5cbiAgICBnZXQgYWN0aXZlTmlkZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlTmlkZ2V0O1xuICAgIH1cblxuICAgIHNldCBzdGF0ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcImRhdGEtc3RhdGVcIiwgdmFsdWUpO1xuICAgIH1cblxuICAgIGdldCBzdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiKTtcbiAgICB9XG5cbiAgICB0ZXN0QWxwaGEoeCwgeSkge1xuICAgICAgICBsZXQgcGl4ZWwgPSB0aGlzLmFjdGl2ZU5pZGdldC5nZXRQaXhlbCh4LCB5KTtcbiAgICAgICAgcmV0dXJuIHBpeGVsWzNdID4gdGhpcy5hbHBoYVRvbGVyYW5jZTtcbiAgICB9XG5cbiAgICBtb3VzZUxlYXZlKCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJvdXRcIjtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgfVxuXG4gICAgbW91c2VBY3RpdmUoKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBcImhvdmVyXCI7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcbiAgICB9XG5cbiAgICBtb3VzZU1vdmUoZSkge1xuICAgICAgICBpZiAoIXRoaXMudGVzdEFscGhhKGUuY2xpZW50WCwgZS5jbGllbnRZKSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcbiAgICAgICAgfVxuICAgIH1cbn1cbjtcblxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWJ1dHRvbicsIE5pZGdldEJ1dHRvbik7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEJ1dHRvbjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcclxuXHJcbmNsYXNzIE5pZGdldEJ1dHRvblNldCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcclxuICAgICAgICB0aGlzLmFscGhhVG9sZXJhbmNlID0gMDsgLy8gYWxwaGEgbmVlZHMgdG8gYmUgPiB0b2xlcmFuY2UgdG8gdHJpZ2dlciBldmVudHMuXHJcblxyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlUHJlc3MpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVJlbGVhc2UpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZSk7XHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlTGVhdmUpO1xyXG5cclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBuaWRnZXRSZWFkeSgpe1xyXG4gICAgICAgIHRoaXMuYnV0dG9ucyA9IHRoaXMucXVlcnlTZWxlY3RvckFsbChcIm5pZGdldC1idXR0b25cIik7XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VQcmVzcyhlKXtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlUHJlc3MoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcInByZXNzXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VSZWxlYXNlKGUpe1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5idXR0b25zKSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzVW5kZXIoZSkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXRlID09IFwicHJlc3NcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcImJ1dHRvbi1jbGlja2VkXCIsIHtkZXRhaWw6IGVsZW1lbnR9KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlUmVsZWFzZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZU1vdmUoZSl7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpe1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlQWN0aXZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZUxlYXZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VMZWF2ZShlKXtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBlbGVtZW50Lm1vdXNlTGVhdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldCBzdGF0ZSh2YWx1ZSl7XHJcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIsIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc3RhdGUoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtYnV0dG9uLXNldCcsIE5pZGdldEJ1dHRvblNldCk7XHJcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0QnV0dG9uU2V0OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBOaWRnZXQgdGhhdCBjaGFuZ2VzIHRoZSBpbWFnZSBmb3IgaG92ZXIsIGRpc2FibGVkLCBwcmVzcywgYW5kIGlkbGUuXG4gKiBGaXJlcyBhIGNsaWNrIGV2ZW50IHdoZW4gY2xpY2tlZC5cbiAqIFxuICogVGhpcyBpcyB0aGUgaHRtbCBlbGVtZW50IFwibmlkZ2V0LWJ1dHRvblwiLlxuICogSWYgdGhlIG5pZGdldC1idXR0b24gaGFzIHRoZSBhdHRyaWJ1dGUgYGltZy1wcmVmaXggPSBcInByZWZpeFwiYCB0aGVuIHRoZSBcbiAqIGZvbGxvd2luZyBpbWFnZXMuICBgaW1nLXN1ZmZpeGAgPSBcInN1ZmZpeFwiIHdpbGwgb3ZlcnJpZGUgdGhlIFwiLnBuZ1wiLlxuICogd2lsbCBiZSB1c2VkOlxuICogLSBwcmVmaXgtaG92ZXIucG5nXG4gKiAtIHByZWZpeC1kaXNhYmxlZC5wbmdcbiAqIC0gcHJlZml4LXByZXNzLnBuZ1xuICogLSBwcmVmaXgtaWRsZS5wbmdcbiAqL1xuY2xhc3MgTmlkZ2V0QnV0dG9uU3RhdGUgZXh0ZW5kcyBOaWRnZXQge1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgbmlkZ2V0UmVhZHkoKXtcbiAgICAgICAgdGhpcy5pbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICB0aGlzLmltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdGhpcy5nZXRBdHRyaWJ1dGUoXCJpbWFnZS1zcmNcIikpO1xuICAgICAgICB0aGlzLmFwcGVuZCh0aGlzLmltZyk7XG4gICAgfVxuXG4gICAgc2hvdygpe1xuICAgICAgICBzdXBlci5zaG93KCk7XG4gICAgICAgIHRoaXMubG9hZENhbnZhcygpO1xuICAgIH1cblxuICAgIGxvYWRDYW52YXMoKXtcbiAgICAgICAgaWYgKCF0aGlzLmltZyB8fCB0aGlzLmNhbnZhcykgcmV0dXJuO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuaW1nLm5hdHVyYWxXaWR0aDtcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5pbWcubmF0dXJhbEhlaWdodDtcbiAgICAgICAgdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXM7XG4gICAgfVxuXG4gICAgZ2V0UGl4ZWwoeCwgeSl7XG4gICAgICAgIHRoaXMubG9hZENhbnZhcygpO1xuICAgICAgICBsZXQgZHggPSB0aGlzLmNhbnZhcy53aWR0aCAvIHRoaXMub2Zmc2V0V2lkdGg7XG4gICAgICAgIGxldCBkeSA9IHRoaXMuY2FudmFzLmhlaWdodCAvIHRoaXMub2Zmc2V0SGVpZ2h0O1xuICAgICAgICBsZXQgcGl4ZWwgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLmdldEltYWdlRGF0YShkeCAqIHgsIGR5ICogeSwgMSwgMSkuZGF0YTtcbiAgICAgICAgcmV0dXJuIHBpeGVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBzdGF0ZSB0byBIT1ZFUiwgRElTQUJMRUQsIFBSRVNTLCBJRExFLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gc3RhdGVcbiAgICAgKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgc2V0IHN0YXRlKHN0YXRlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwic3RhdGVcIiwgc3RhdGUudG9VcHBlckNhc2UoKSk7XG4gICAgfVxuXG4gICAgZ2V0IHN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyaWJ1dGUoXCJzdGF0ZVwiKTtcbiAgICB9XG5cbiAgICBzZXQgc291cmNlKGltZykge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInNyY1wiLCBpbWcpO1xuICAgIH1cblxuICAgIGdldCBzb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHJpYnV0ZShcInNyY1wiKTtcbiAgICB9XG59XG47XG5cbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1idXR0b24tc3RhdGUnLCBOaWRnZXRCdXR0b25TdGF0ZSk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEJ1dHRvblN0YXRlO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyoqXG4gKiBBIGNvbXBvbmVudCB0aGF0IGhhcyBldmVudHMgZm9yIGFkZGluZyBuaWRnZXRzLCByZW1vdmluZyBuaWRnZXRzLCBhbmQgXG4gKiByZXNpemluZyB0aGUgY29udGFpbmVyLiAgV2hlbiB0aGUgY29udGFpbmVyIHNpemUgaXMgY2hhbmdlZCwgdGhlIG51bWJlclxuICogb2YgY29tcG9uZW50cyBjaGFuZ2UsIG9yIHRoZSBsYXlvdXQgYXR0cmlidXRlIGNoYW5nZXMsIHRoZSBkb0xheW91dCBmdW5jdGlvblxuICogaXMgY2FsbGVkLlxuICogXG4gKiBUaGUgY29tcG9uZW50cyBhcmUgYXJyYWdlZCBhY2NvcmRpbmcgdG8gdGhlIHNlbGVjdGVkIGxheW91dCBhdHRyaWJ1dGUuICBJZiBcbiAqIG5vIGxheW91dCBhdHRyaWJ1dGUgaXMgY2hvc2VuLCBkb0xheW91dCBpcyBzdGlsbCBjYWxsZWQgYXMgaXQgaXMgYXNzdW1lZCBcbiAqIGEgY3VzdG9tIGZ1bmN0aW9uIGhhcyBiZWVuIHByb3ZpZGVkLlxuICovXG5cbmNsYXNzIE5pZGdldENvbnRhaW5lciBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgICAgICBsZXQgcmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIodGhpcy5kb0xheW91dCk7XG4gICAgICAgIHJlc2l6ZU9ic2VydmVyLm9ic2VydmUodGhpcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiBbTmlkZ2V0Q29udGFpbmVyLmxheW91dEF0dHJpYnV0ZV07XG4gICAgfVxuXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKG5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgICBpZiAob2xkVmFsdWUgPT09IG5ld1ZhbHVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuZG9MYXlvdXQoKTtcbiAgICB9XG5cbiAgICBzZXQgbGF5b3V0KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKE5pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgbGF5b3V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0Q29udGFpbmVyLmxheW91dEF0dHJpYnV0ZSk7XG4gICAgfSAgICAgIFxuXG4gICAgZG9MYXlvdXQoKSB7XG4gICAgICAgIGlmICghdGhpcy5sYXlvdXQpIHJldHVybjtcbiAgICAgICAgaWYgKCFMYXlvdXRzW3RoaXMubGF5b3V0XSkgdGhyb3cgYGludmFsaWQgbGF5b3V0OiAke3RoaXMubGF5b3V0fWA7XG4gICAgICAgIExheW91dHNbdGhpcy5sYXlvdXRdO1xuICAgIH1cbn1cblxuY2xhc3MgTGF5b3V0cyB7XG4gICAgLyoqXG4gICAgICogRml0IGFsbCBuaWRnZXRzIGV2ZW5seSBpbiBhIGhvcml6b250YWwgcm93LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gbmlkZ2V0XG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHN0YXRpYyByb3cobmlkZ2V0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2l6ZSk7XG4gICAgfVxufVxuXG5cbk5pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGUgPSBcImxheW91dFwiO1xud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWNvbnRhaW5lcicsIE5pZGdldENvbnRhaW5lcik7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldENvbnRhaW5lcjsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRcIik7XG5jb25zdCBUcmFuc2Zvcm1lciA9IHJlcXVpcmUoXCIuLi9UcmFuc2Zvcm1lclwiKTtcblxuLyoqXG4gKiBEb24ndCBmb3JnZXQgdG8gc2V0ICdpcycgd2hlbiBwdXR0aW5nIGVsZW1lbnQgZGlyZWN0bHkgaW4gaHRtbCBhcyBvcHBvc2VkIHRvXG4gKiBwcm9ncmFtaWNhbGx5LlxuICogPGltZyBpcz1cInJlZ2lzdGVyZWQtbmFtZVwiIHNyYz1cImltYWdlLnBuZ1wiPjwvaW1nPlxuICogXG4gKiBpbmNsdWRlIGEgY3VzdG9tIGVsZW1lbnQgZGVmaW5pdGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBjbGFzcy48YnI+XG4gKiB3aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdyZWdpc3RlcmVkLW5hbWUnLCBDbGFzcywge2V4dGVuZHM6IFwiaW1nXCJ9KTtcbiAqL1xuY2xhc3MgTmlkZ2V0SFRNTEltYWdlIGV4dGVuZHMgSFRNTEltYWdlRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubGFzdERpc3BsYXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtZXIodGhpcyk7XG4gICAgfVxuXG4gICAgc2NhbGUoZHcsIGRoKSB7XG4gICAgICAgIGlmICghZGgpIGRoID0gZHc7XG4gICAgICAgIGxldCB3ID0gdGhpcy53aWR0aCAqIGR3O1xuICAgICAgICBsZXQgaCA9IHRoaXMuaGVpZ2h0ICogZGg7XG4gICAgICAgIHRoaXMud2lkdGggPSB3O1xuICAgICAgICB0aGlzLmhlaWdodCA9IGg7XG4gICAgfSAgICAgICAgXG5cbiAgICBzZXQgc3JjKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwic3JjXCIsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgc3JjKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJzcmNcIik7XG4gICAgfVxuXG4gICAgbG9jYXRlKGxlZnQsIHRvcCkge1xuICAgICAgICB0aGlzLmxlZnQgPSBsZWZ0O1xuICAgICAgICB0aGlzLnRvcCA9IHRvcDtcbiAgICB9XG5cbiAgICBnZXQgbGVmdCgpIHtcbiAgICAgICAgbGV0IHcgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5sZWZ0O1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh3KTtcbiAgICB9XG5cbiAgICBnZXQgdG9wKCkge1xuICAgICAgICBsZXQgaCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMpLnRvcDtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaCk7XG4gICAgfVxuXG4gICAgc2V0IGxlZnQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5zdHlsZS5sZWZ0ID0gdmFsdWUgKyBcInB4XCI7XG4gICAgfVxuXG4gICAgc2V0IHRvcCh2YWx1ZSkge1xuICAgICAgICB0aGlzLnN0eWxlLnRvcCA9IHZhbHVlICsgXCJweFwiO1xuICAgIH0gICAgXG5cbiAgICBzZXQgd2lkdGgodykge1xuICAgICAgICB0aGlzLnN0eWxlLndpZHRoID0gdyArIFwicHhcIjtcbiAgICB9XG5cbiAgICBzZXQgaGVpZ2h0KHcpIHtcbiAgICAgICAgdGhpcy5zdHlsZS5oZWlnaHQgPSB3ICsgXCJweFwiO1xuICAgIH1cblxuICAgIGdldCB3aWR0aCgpIHtcbiAgICAgICAgbGV0IHcgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS53aWR0aDtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodyk7XG4gICAgfVxuXG4gICAgZ2V0IGhlaWdodCgpIHtcbiAgICAgICAgbGV0IGggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5oZWlnaHQ7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGgpO1xuICAgIH0gICAgICAgIFxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgaWYgKHRoaXMubGFzdERpc3BsYXkpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IHRoaXMubGFzdERpc3BsYXk7XG4gICAgICAgICAgICB0aGlzLmxhc3REaXNwbGF5ID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhpZGUoKSB7XG4gICAgICAgIHRoaXMubGFzdERpc3BsYXkgPSB0aGlzLnN0eWxlLmRpc3BsYXk7XG4gICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIH1cblxuICAgIHNldCBkaXNwbGF5KHZhbHVlKXtcbiAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gdmFsdWU7XG4gICAgfVxuICAgIFxuICAgIGdldCBkaXNwbGF5KCl7XG4gICAgICAgIHJldHVybiB3aW5kb3cuY2FsY3VsYXRlU3R5bGUodGhpcylbXCJkaXNwbGF5XCJdO1xuICAgIH1cblxuICAgIGRldGFjaCgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHRoaXMpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHNldCBkaXNhYmxlZCh2YWx1ZSl7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBkaXNhYmxlZCgpe1xuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0cmlidXRlKFwiZGlzYWJsZWRcIikpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIik7XG4gICAgfSAgICBcbiAgICBcbiAgICBjbGVhclBvcygpe1xuICAgICAgICB0aGlzLnN0eWxlLnRvcCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3R5bGUubGVmdCA9IG51bGw7XG4gICAgfVxuXG4gICAgY2xlYXJEaW1zKCl7XG4gICAgICAgIHRoaXMuc3R5bGUud2lkdGggPSBudWxsO1xuICAgICAgICB0aGlzLnN0eWxlLmhlaWdodCA9IG51bGw7XG4gICAgfSAgICBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRIVE1MSW1hZ2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyoqXG4gKiBBIE5pZGdldCB0aGF0IGNvbnRhaW5zIGltYWdlcy5cbiAqL1xuY2xhc3MgTmlkZ2V0SW1hZ2UgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKHNyYyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgaWYgKHNyYykgdGhpcy5zcmMgPSBzcmM7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKXtcbiAgICAgICAgbGV0IHNyYyA9IHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldEltYWdlLnNyY0F0dHJpYnV0ZSk7ICAgICAgICBcbiAgICAgICAgaWYgKHNyYykgdGhpcy5pbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIHNyYyk7ICAgICAgIFxuICAgICAgICB0aGlzLmFwcGVuZENoaWxkKHRoaXMuaW1nKTtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBnZXQgc3JjKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmltZy5nZXRBdHRyaWJ1dGUoXCJzcmNcIik7XG4gICAgfVxuXG4gICAgc2V0IHNyYyh2YWx1ZSl7XG4gICAgICAgIHRoaXMuaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2l6ZSh3aWR0aCwgaGVpZ2h0KXtcbiAgICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IHdpZHRoXG4gICAgICAgIHRoaXMuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgICAgIHRoaXMuaW1nLnN0eWxlLndpZHRoID0gd2lkdGhcbiAgICAgICAgdGhpcy5pbWcuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgfVxuICAgIFxuICAgIHNjYWxlKGR3LCBkaCl7XG4gICAgICAgIGlmICghZGgpIGRoID0gZHc7XG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMub2Zmc2V0V2lkdGggKiBkdztcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMub2Zmc2V0SGVpZ2h0ICogZGg7XG4gICAgICAgIHRoaXMuc2l6ZShgJHt3aWR0aH1weGAsIGAke2hlaWdodH1weGApO1xuICAgIH1cbiAgICBcbiAgICBzaG93KCl7XG4gICAgICAgIGlmICh0aGlzLnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiKXtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnN0eWxlLmRpc3BsYXk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaGlkZSgpe1xuICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG59XG5cbk5pZGdldEltYWdlLnNyY0F0dHJpYnV0ZSA9IFwic3JjXCI7XG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtaW1hZ2UnLCBOaWRnZXRJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEltYWdlOyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIFdoZW4gdXNpbmcgLS1uaWRnZXQtZml0LXRleHQsIGRvIG5vdCBpbmNsdWRlIGhlaWdodCBhbmQgd2lkdGggYXR0cmlidXRlcy5cbiAqIEEgZm9udCBzaXplIGNhbiBiZSB1c2VkIGFzIGEgc3RhcnRpbmcgcG9pbnQuXG4gKi9cbmNsYXNzIEZpdFRleHQge1xuICAgIGNvbnN0cnVjdG9yKG5pZGdldCl7XG4gICAgICAgIHRoaXMubmlkZ2V0ID0gbmlkZ2V0O1xuICAgICAgICB0aGlzLmxvY2sgPSBcIm5vbmVcIjtcbiAgICAgICAgdGhpcy5wYXJzZUFyZ3VtZW50cygpO1xuICAgIH1cblxuICAgIGxpc3Rlbigpe1xuICAgICAgICB0aGlzLm9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpPT50aGlzLmRlbGF5UmVzaXplKHRoaXMuaFZhbHVlLCB0aGlzLndWYWx1ZSkpO1xuICAgICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUodGhpcy5uaWRnZXQucGFyZW50RWxlbWVudCk7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcbiAgICAgICAgdGhpcy5kZWxheSA9IDI1O1xuICAgICAgICB0aGlzLmRlbGF5UmVzaXplKHRoaXMuaFZhbHVlLCB0aGlzLndWYWx1ZSk7XG4gICAgICAgIHRoaXMuc3RvcCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGRlbGF5UmVzaXplKGhWYWx1ZSwgd1ZhbHVlKXtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAwO1xuICAgICAgICBpZiAodGhpcy50aW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+dGhpcy5vblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSksIHRoaXMuZGVsYXkpO1xuICAgIH1cblxuICAgIG5vdGlmeShoVmFsdWUsIHdWYWx1ZSl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm90aWZ5XCIpO1xuICAgICAgICB0aGlzLnN0b3AgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZWxheVJlc2l6ZShoVmFsdWUsIHdWYWx1ZSk7XG4gICAgfVxuXG4gICAgcGFyc2VBcmd1bWVudHMoKXtcbiAgICAgICAgbGV0IGFyZ3MgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtZml0LXRleHRcIik7XG5cbiAgICAgICAgaWYgKCFhcmdzIHx8IGFyZ3MgPT09IGZhbHNlIHx8IGFyZ3MgPT09IFwiZmFsc2VcIil7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhWYWx1ZSA9IHRoaXMud1ZhbHVlID0gdHJ1ZTtcblxuICAgICAgICBpZiAodHlwZW9mKGFyZ3MpID09IFwic3RyaW5nXCIpe1xuICAgICAgICAgICAgbGV0IG9iaiA9IEpTT04ucGFyc2UoYXJncyk7XG4gICAgICAgICAgICBpZiAob2JqW1wiZml0XCJdICE9PSB1bmRlZmluZWQgJiYgb2JqW1wiZml0XCJdID09PSBcIndpZHRoXCIpIHRoaXMuaFZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAob2JqW1wiZml0XCJdICE9PSB1bmRlZmluZWQgJiYgb2JqW1wiZml0XCJdID09PSBcImhlaWdodFwiKSB0aGlzLndWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKG9ialtcImxvY2tcIl0gIT09IHVuZGVmaW5lZCkgdGhpcy5sb2NrID0gKG9ialtcImxvY2tcIl0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25SZXNpemUoaFZhbHVlLCB3VmFsdWUpe1xuICAgICAgICBkZWxldGUgdGhpcy50aW1lb3V0O1xuXG4gICAgICAgIGlmICh0aGlzLnN0b3ApIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMubmlkZ2V0LnRleHRDb250ZW50ID09PSBcIlwiKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRXaWR0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5uaWRnZXQuc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIpIHJldHVybjtcblxuICAgICAgICBpZiAoIWhWYWx1ZSAmJiAhd1ZhbHVlKSByZXR1cm47XG5cbiAgICAgICAgbGV0IGhEaXIgPSB0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAtIHRoaXMubmlkZ2V0LnNjcm9sbEhlaWdodDtcbiAgICAgICAgbGV0IHdEaXIgPSB0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC0gdGhpcy5uaWRnZXQuc2Nyb2xsV2lkdGg7XG5cbiAgICAgICAgaWYgKCFoVmFsdWUpIGhEaXIgPSAwO1xuICAgICAgICBpZiAoIXdWYWx1ZSkgd0RpciA9IDA7XG5cbiAgICAgICAgbGV0IGRpciA9IE1hdGguc2lnbihoRGlyIHwgd0Rpcik7IC8vIHdpbGwgcHJlZmVyIHRvIHNocmlua1xuICAgICAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09IDApIHRoaXMuZGlyZWN0aW9uID0gZGlyOyAvLyBrZWVwIHByZXZpb3VzIGRpcmVjdGlvblxuXG4gICAgICAgIGxldCBmb250U2l6ZSA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpW1wiZm9udC1zaXplXCJdKVxuICAgICAgICBsZXQgbmV3U2l6ZSA9IGZvbnRTaXplICsgKHRoaXMuZGlyZWN0aW9uKTtcblxuICAgICAgICBpZiAobmV3U2l6ZSAhPT0gZm9udFNpemUgJiYgdGhpcy5kaXJlY3Rpb24gPT09IGRpcikge1xuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBuZXdTaXplICsgXCJweFwiO1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZW91dCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT50aGlzLm9uUmVzaXplKGhWYWx1ZSwgd1ZhbHVlKSwgdGhpcy5kZWxheSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGlyIDwgMCAmJiB0aGlzLmRpcmVjdGlvbiA+IDApIHsgLy8gcmV2ZXJzZSBkaXJlY3Rpb24gaWYgZ3Jvd2luZyB0b28gbGFyZ2VcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gLTE7XG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT50aGlzLm9uUmVzaXplKGhWYWx1ZSwgd1ZhbHVlKSwgdGhpcy5kZWxheSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2NrID09PSBcInZoXCIpIHtcbiAgICAgICAgICAgICAgICBsZXQgZm9udFJhdGlvID0gbmV3U2l6ZSAvIHdpbmRvdy5pbm5lckhlaWdodCAqIDEwMDtcbiAgICAgICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IGZvbnRSYXRpbyArIFwidmhcIjtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmxvY2sgPT09IFwidndcIil7XG4gICAgICAgICAgICAgICAgbGV0IGZvbnRSYXRpbyA9IG5ld1NpemUgLyB3aW5kb3cuaW5uZXJXaWR0aCAqIDEwMDtcbiAgICAgICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IGZvbnRSYXRpbyArIFwidndcIjtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAwO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEEgbmlkZ2V0IGVsZW1lbnQgZm9yIGRpc3BsYXlpbmcgdGV4dC5cbiAqIHB1dCAnLS1uaWRnZXQtZml0LXRleHQ6IDEuMDsnIGludG8gY3NzIGZvciB0aGlzIGVsZW1lbnQgdG8gZW5hYmxlIHNjYWxpbmcuXG4gKiBzZWU6IE5pZGdldFN0eWxlLmpzXG4gKi9cbmNsYXNzIE5pZGdldFRleHQgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm9ic2VydmVyc1tcImZpdC10ZXh0LXdpZHRoLXRvbGVyYW5jZVwiXSA9IDAuMDI7XG4gICAgICAgIHRoaXMuZml0VGV4dCA9IG5ldyBGaXRUZXh0KHRoaXMpO1xuICAgIH1cblxuICAgIHJlbW92ZSgpe1xuICAgICAgICBpZiAodGhpcy5maXRUZXh0KSB7XG4gICAgICAgICAgICB0aGlzLmZpdFRleHQuc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmZpdFRleHQub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyLnJlbW92ZSgpO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgICAgICBsZXQgZml0UHJvcCA9IGdldENvbXB1dGVkU3R5bGUodGhpcykuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0XCIpO1xuXG4gICAgICAgIGlmIChmaXRQcm9wICE9PSB1bmRlZmluZWQgJiYgZml0UHJvcCAhPT0gXCJcIil7XG4gICAgICAgICAgICB0aGlzLmZpdFRleHQubGlzdGVuKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXQgdGV4dCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuaW5uZXJUZXh0ID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLmZpdFRleHQgJiYgdGhpcy5maXRUZXh0LnN0b3AgPT09IGZhbHNlKXtcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dC5kZWxheVJlc2l6ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHRleHQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5uZXJUZXh0O1xuICAgIH1cblxuICAgIHNjYWxlKGFtb3VudCkge1xuICAgICAgICBsZXQgc3R5bGVGb250U2l6ZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoXCJmb250LXNpemVcIik7XG4gICAgICAgIGxldCBmb250U2l6ZSA9IHBhcnNlRmxvYXQoc3R5bGVGb250U2l6ZSk7XG4gICAgICAgIHRoaXMuc3R5bGUuZm9udFNpemUgPSAoZm9udFNpemUgKiBhbW91bnQpICsgXCJweFwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgbGluZSBoZWlnaHQgdG8gdGhlIG9mZnNldCBoZWlnaHQgbXVsdGlwbGllZCBieSByYXRpby5cbiAgICAgKiBDYWxsaW5nIHRoaXMgbWV0aG9kIGRpcmVjdG9yeSB3aWxsIG92ZXJyaWRlIHRoZSB2YWx1ZSBzZXQgYnkgY3NzXG4gICAgICovXG4gICAgbmlkZ2V0VmVydEFsaWduVGV4dCh2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkoXCItLW5pZGdldC12ZXJ0LWFsaWduLXRleHRcIiwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9uUmVzaXplID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtdmVydC1hbGlnbi10ZXh0XCIpO1xuICAgICAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IGggPSB0aGlzLm9mZnNldEhlaWdodCAqIHJhdGlvO1xuICAgICAgICAgICAgdGhpcy5zdHlsZS5saW5lSGVpZ2h0ID0gaCArIFwicHhcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9ic2VydmVycy52ZXJ0QWxpZ25UZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLnZlcnRBbGlnblRleHQgPSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUpO1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMudmVydEFsaWduVGV4dC5vYnNlcnZlKHRoaXMpXG4gICAgICAgIH1cbiAgICAgICAgb25SZXNpemUoKVxuICAgIH1cblxuICAgIHZlcnRBbGlnblRleHQocmF0aW8gPSAxLjApe1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XG4gICAgICAgIGxldCBoID0gdGhpcy5vZmZzZXRIZWlnaHQgKiByYXRpbztcbiAgICAgICAgdGhpcy5zdHlsZS5saW5lSGVpZ2h0ID0gaCArIFwicHhcIjtcbiAgICB9XG59XG47XG5cbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC10ZXh0JywgTmlkZ2V0VGV4dCk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldFRleHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBkcmFnSGFuZGxlciA9IHJlcXVpcmUoXCIuLi9EcmFnSGFuZGxlclwiKS5pbnN0YW5jZTtcblxuXG5mdW5jdGlvbiBvbkRyYWdTdGFydChldmVudCl7ICAgIFxuICAgIGRyYWdIYW5kbGVyLnNldCh0aGlzKTtcbiAgICB3aW5kb3cueCA9IHRoaXM7XG4gICAgY29uc29sZS5sb2coXCInXCIgKyB0aGlzLm5hbWUoKSArIFwiJ1wiKTtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdTdGFydFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25EcmFnRW5kKGV2ZW50KXtcbiAgICBpZiAoZHJhZ0hhbmRsZXIuZ2V0KCkgIT09IHRoaXMpIHJldHVybjtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdFbmRcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG4gICAgZHJhZ0hhbmRsZXIuY2xlYXIoKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5zZXRBdHRyaWJ1dGUoXCJkcmFnZ2FibGVcIiwgXCJ0cnVlXCIpOyAgIFxuICAgIFxuICAgIG5pZGdldC5vbkRyYWdTdGFydCA9IG9uRHJhZ1N0YXJ0LmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25EcmFnRW5kID0gb25EcmFnRW5kLmJpbmQobmlkZ2V0KTtcbiAgICBcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnc3RhcnRcIiwgbmlkZ2V0Lm9uRHJhZ1N0YXJ0KTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW5kXCIsIG5pZGdldC5vbkRyYWdFbmQpOyAgICBcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBkcmFnSGFuZGxlciA9IHJlcXVpcmUoXCIuLi9EcmFnSGFuZGxlclwiKS5pbnN0YW5jZTtcbmNvbnN0IE1vdXNlVXRpbGl0aWVzID0gcmVxdWlyZShcIi4uL01vdXNlVXRpbGl0aWVzXCIpO1xuXG5mdW5jdGlvbiBvbkRyYWdPdmVyKGV2ZW50KXtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxldCBkcmFnTmlkZ2V0ID0gZHJhZ0hhbmRsZXIuZ2V0KCk7XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnT3ZlclwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzLCBkcmFnTmlkZ2V0KTtcbn1cblxuZnVuY3Rpb24gb25EcmFnRW50ZXIoZXZlbnQpe1xuICAgIGlmICghZHJhZ0hhbmRsZXIuaGFzKCkpIHJldHVybjtcbiAgICBpZiAoIWRyYWdIYW5kbGVyLnB1c2hPdmVyKHRoaXMpKSByZXR1cm47XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnRW50ZXJcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uRHJhZ0xlYXZlKGV2ZW50KXtcbiAgICBpZiAoIWRyYWdIYW5kbGVyLmhhcygpKSByZXR1cm47XG4gICAgaWYgKE1vdXNlVXRpbGl0aWVzLmlzVW5kZXIodGhpcy5nZXRFbGVtZW50KCkpKSByZXR1cm47XG4gICAgaWYgKCFkcmFnSGFuZGxlci5yZW1vdmVPdmVyKHRoaXMpKSByZXR1cm47XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnTGVhdmVcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uRHJvcChldmVudCl7XG4gICAgbGV0IGRyYWdOaWRnZXQgPSBkcmFnSGFuZGxlci5nZXQoKTtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyb3BcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcywgZHJhZ05pZGdldCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBuaWRnZXQub25EcmFnT3ZlciA9IG9uRHJhZ092ZXIuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbkRyb3AgPSBvbkRyb3AuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbkRyYWdFbnRlciA9IG9uRHJhZ0VudGVyLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25EcmFnTGVhdmUgPSBvbkRyYWdMZWF2ZS5iaW5kKG5pZGdldCk7XG4gICAgXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgbmlkZ2V0Lm9uRHJhZ092ZXIpO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgbmlkZ2V0Lm9uRHJvcCk7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIG5pZGdldC5vbkRyYWdFbnRlcik7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2xlYXZlXCIsIG5pZGdldC5vbkRyYWdMZWF2ZSk7ICAgIFxufTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE1vdXNlVXRpbGl0aWVzID0gcmVxdWlyZShcIi4uL01vdXNlVXRpbGl0aWVzXCIpO1xuXG5mdW5jdGlvbiBvbkNsaWNrKGV2ZW50KXsgICAgXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJjbGlja1wiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZURvd24oZXZlbnQpeyAgICBcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcIm1vdXNlRG93blwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZVVwKGV2ZW50KXsgICAgXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZVVwXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlRW50ZXIoZXZlbnQpeyAgICBcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcIm1vdXNlRW50ZXJcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VMZWF2ZShldmVudCl7XG4gICAgaWYgKE1vdXNlVXRpbGl0aWVzLmlzVW5kZXIodGhpcy5nZXRFbGVtZW50KCkpKSByZXR1cm47XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZUV4aXRcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBjb25zb2xlLmxvZyhcIm1vdXNlIHNldHVwXCIpO1xuICAgIFxuICAgIG5pZGdldC5vbkNsaWNrID0gb25DbGljay5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uTW91c2VEb3duID0gb25Nb3VzZURvd24uYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbk1vdXNlVXAgPSBvbk1vdXNlVXAuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbk1vdXNlRW50ZXIgPSBvbk1vdXNlRW50ZXIuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbk1vdXNlTGVhdmUgPSBvbk1vdXNlTGVhdmUuYmluZChuaWRnZXQpO1xuICAgIFxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIG5pZGdldC5vbkNsaWNrKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgbmlkZ2V0Lm9uTW91c2VEb3duKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG5pZGdldC5vbk1vdXNlVXApO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgbmlkZ2V0Lm9uTW91c2VFbnRlcik7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgbmlkZ2V0Lm9uTW91c2VMZWF2ZSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogRW5hYmxlIHRoZSBuaWRnZXQgdG8gYmUgbW92ZWQgYnkgZHJhZ2dpbmcuICBXaWxsIGRyYWcgYnkgYW55IGNoaWxkIGVsZWVtZW50XG4gKiB0aGUgJy5uaWRnZXQtaGVhZGVyJyBjbGFzcywgb3RoZXJ3aXNlIG1vdmFibGUgYnkgY2xpY2tpbmcgYW55d2hlcmUuXG4gKiBAcGFyYW0ge3R5cGV9IGVcbiAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAqL1xuXG5mdW5jdGlvbiBvbk1vdXNlTW92ZShlKXsgICAgXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICghdGhpcy5fX21vdmFibGUuYWN0aXZlKSByZXR1cm47ICAgIFxuXG4gICAgLy8gY2FsY3VsYXRlIHRoZSBuZXcgY3Vyc29yIHBvc2l0aW9uOlxuICAgIGxldCBkZWx0YVggPSB0aGlzLl9fbW92YWJsZS5sYXN0WCAtIGUuY2xpZW50WDtcbiAgICBsZXQgZGVsdGFZID0gdGhpcy5fX21vdmFibGUubGFzdFkgLSBlLmNsaWVudFk7XG4gICAgdGhpcy5fX21vdmFibGUubGFzdFggPSBlLmNsaWVudFg7XG4gICAgdGhpcy5fX21vdmFibGUubGFzdFkgPSBlLmNsaWVudFk7XG4gICAgXG4gICAgLy8gc2V0IHRoZSBlbGVtZW50J3MgbmV3IHBvc2l0aW9uOlxuICAgIHRoaXMuc3R5bGUudG9wID0gKHRoaXMub2Zmc2V0VG9wIC0gZGVsdGFZKSArIFwicHhcIjtcbiAgICB0aGlzLnN0eWxlLmxlZnQgPSAodGhpcy5vZmZzZXRMZWZ0IC0gZGVsdGFYKSArIFwicHhcIjtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZURvd24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuX19tb3ZhYmxlLmFjdGl2ZSA9IHRydWU7XG4gICAgXG4gICAgLy8gZ2V0IHRoZSBtb3VzZSBjdXJzb3IgcG9zaXRpb24gYXQgc3RhcnR1cDpcbiAgICB0aGlzLl9fbW92YWJsZS5sYXN0WCA9IGUuY2xpZW50WDtcbiAgICB0aGlzLl9fbW92YWJsZS5sYXN0WSA9IGUuY2xpZW50WTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZVVwKGUpe1xuICAgIHRoaXMuX19tb3ZhYmxlLmFjdGl2ZSA9IGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgbmlkZ2V0Ll9fbW92YWJsZSA9IHtcbiAgICAgICAgbGFzdFggOiAwLFxuICAgICAgICBsYXN0WSA6IDAsXG4gICAgICAgIGFjdGl2ZSA6IGZhbHNlXG4gICAgfTtcbiAgICBcbiAgICBuaWRnZXQub25Nb3VzZURvd24gPSBvbk1vdXNlRG93bi5iaW5kKG5pZGdldCk7ICAgICAgICBcbiAgICBcbiAgICBpZiAobmlkZ2V0LnF1ZXJ5U2VsZWN0b3IoXCIubmlkZ2V0LWhlYWRlclwiKSl7XG4gICAgICAgIG5pZGdldC5xdWVyeVNlbGVjdG9yKFwiLm5pZGdldC1oZWFkZXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBuaWRnZXQub25Nb3VzZURvd24pOyAgICAgICAgXG4gICAgfSBlbHNlIHtcbiAgICAgICAgbmlkZ2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgbmlkZ2V0Lm9uTW91c2VEb3duKTtcbiAgICB9XG4gICAgXG4gICAgbmlkZ2V0Lm9uTW91c2VNb3ZlID0gb25Nb3VzZU1vdmUuYmluZChuaWRnZXQpOyAgICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBuaWRnZXQub25Nb3VzZU1vdmUpO1xuXG4gICAgbmlkZ2V0Lm9uTW91c2VVcCA9IG9uTW91c2VVcC5iaW5kKG5pZGdldCk7ICAgIFxuICAgIG5pZGdldC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBuaWRnZXQub25Nb3VzZVVwKTtcblxufTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRcIik7XG53aW5kb3cuTmlkZ2V0ID0gTmlkZ2V0O1xuXG4vKipcbiAqIEFkZCBhIHJlc2l6ZSBvYnNlcnZlciB0byB0aGUgZWxlbWVudCB0aGF0IHdpbGwgY2FsbCBhIG9uUmVzaXplKCkgZnVuY3Rpb24uXG4gKiBUaGUgcGFyYW1ldGVycyBwYXNzZWQgaW4gYXJlIChwcmV2aW91c19kaW1lbnNpb25zKS4gIFRvIHVzZSBhZGRcbiAqIGludGVyZmFjZXM9XCJyZXNpemVcIiB0byB0aGUgZWxlbWVudCBpbiBodG1sIGFuZCBhIG1ldGhvZCBvblJlc2l6ZSgpIHRvIHRoZSBcbiAqIGNsYXNzIG9iamVjdC4gIElmIHRoZXJlIGlzIG5vIGNsYXNzIG9iamVjdCBjcmVhdGUgYSBmdW5jdGlvbiBhbmQgYmluZCBpdC5cbiAqIGllOiBlbGVtZW50Lm9uUmVzaXplID0gZnVuY3Rpb24uYmluZChlbGVtZW50KTsgXG4gKi9cblxubGV0IG9uUmVzaXplID0gZnVuY3Rpb24oKXtcbiAgICBsZXQgZGF0YSA9IHRoaXNbTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZF0ucmVzaXplO1xuICAgIGxldCBwcmV2ID0gZGF0YS5wcmV2O1xuICAgIGlmICghdGhpcy5vblJlc2l6ZSkgcmV0dXJuO1xuICAgIHRoaXMub25SZXNpemUocHJldik7XG4gICAgbG9hZFByZXZpb3VzKHRoaXMpO1xufTtcblxubGV0IGxvYWRQcmV2aW91cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgbGV0IGRhdGEgPSBuaWRnZXRbTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZF0ucmVzaXplO1xuICAgIGRhdGEucHJldiA9IHtcbiAgICAgICAgd2lkdGggOiBuaWRnZXQub2Zmc2V0V2lkdGgsXG4gICAgICAgIGhlaWdodCA6IG5pZGdldC5vZmZzZXRIZWlnaHRcbiAgICB9OyAgICBcbn07XG5cbi8qKlxuICogU2V0dXAgYSByZXNpemUgb2JzZXJ2ZXIgZm9yIHRoZSBuaWRnZXQgdGhhdCB0cmlnZ2VycyB0aGUgb25SZXNpemUgbWV0aG9kIGlmIFxuICogYXZhaWxhYmxlLlxuICogLSBvblJlc2l6ZSh0aGlzLCBwcmV2aW91c19kaW1lbnNpb25zKSA6IG5vbmVcbiAqIEBwYXJhbSB7dHlwZX0gbmlkZ2V0XG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBpZiAodHlwZW9mKG5pZGdldCkgIT09IFwib2JqZWN0XCIpIHRocm93IG5ldyBcIk9iamVjdCBleGVjdGVkXCI7XG4gICAgbGV0IHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKG9uUmVzaXplLmJpbmQobmlkZ2V0KSk7XG4gICAgcmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZShuaWRnZXQpO1xuICAgIGxvYWRQcmV2aW91cyhuaWRnZXQpO1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBBYnN0cmFjdE1vZGVsIDogcmVxdWlyZShcIi4vQWJzdHJhY3RNb2RlbFwiKSxcbiAgICBOaWRnZXRFbGVtZW50IDogcmVxdWlyZShcIi4vTmlkZ2V0RWxlbWVudFwiKSxcbiAgICBGaWxlT3BlcmF0aW9ucyA6IHJlcXVpcmUoXCIuL0ZpbGVPcGVyYXRpb25zXCIpLFxuICAgIE5pZGdldEJ1dHRvblNldCA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblNldFwiKSxcbiAgICBOaWRnZXRCdXR0b24gOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b25cIiksXG4gICAgTmlkZ2V0QnV0dG9uU3RhdGUgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b25TdGF0ZVwiKSxcbiAgICBOaWRnZXRJbWFnZSA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEltYWdlXCIpLFxuICAgIE5pZGdldEhUTUxJbWFnZSA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEhUTUxJbWFnZVwiKSxcbiAgICBOaWRnZXRUZXh0IDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0VGV4dFwiKSxcbiAgICBOaWRnZXRDb250YWluZXIgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRDb250YWluZXJcIiksXG4gICAgTW91c2VVdGlsaXRpZXMgOiByZXF1aXJlKFwiLi9Nb3VzZVV0aWxpdGllc1wiKSxcbiAgICBDb25zdGFudHM6IHJlcXVpcmUoXCIuL05pZGdldFwiKSxcbiAgICBsYXlvdXRzOiB7fVxufTsiLCJmdW5jdGlvbiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpIHtcbiAgaWYgKHNlbGYgPT09IHZvaWQgMCkge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtcbiAgfVxuXG4gIHJldHVybiBzZWxmO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQ7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBrZXksIGFyZykge1xuICB0cnkge1xuICAgIHZhciBpbmZvID0gZ2VuW2tleV0oYXJnKTtcbiAgICB2YXIgdmFsdWUgPSBpbmZvLnZhbHVlO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJlamVjdChlcnJvcik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKGluZm8uZG9uZSkge1xuICAgIHJlc29sdmUodmFsdWUpO1xuICB9IGVsc2Uge1xuICAgIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihfbmV4dCwgX3Rocm93KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfYXN5bmNUb0dlbmVyYXRvcihmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIGdlbiA9IGZuLmFwcGx5KHNlbGYsIGFyZ3MpO1xuXG4gICAgICBmdW5jdGlvbiBfbmV4dCh2YWx1ZSkge1xuICAgICAgICBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIFwibmV4dFwiLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIF90aHJvdyhlcnIpIHtcbiAgICAgICAgYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBcInRocm93XCIsIGVycik7XG4gICAgICB9XG5cbiAgICAgIF9uZXh0KHVuZGVmaW5lZCk7XG4gICAgfSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2FzeW5jVG9HZW5lcmF0b3I7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfY2xhc3NDYWxsQ2hlY2s7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwidmFyIHNldFByb3RvdHlwZU9mID0gcmVxdWlyZShcIi4vc2V0UHJvdG90eXBlT2YuanNcIik7XG5cbnZhciBpc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QgPSByZXF1aXJlKFwiLi9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QuanNcIik7XG5cbmZ1bmN0aW9uIF9jb25zdHJ1Y3QoUGFyZW50LCBhcmdzLCBDbGFzcykge1xuICBpZiAoaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KCkpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9jb25zdHJ1Y3QgPSBSZWZsZWN0LmNvbnN0cnVjdDtcbiAgICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIH0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfY29uc3RydWN0ID0gZnVuY3Rpb24gX2NvbnN0cnVjdChQYXJlbnQsIGFyZ3MsIENsYXNzKSB7XG4gICAgICB2YXIgYSA9IFtudWxsXTtcbiAgICAgIGEucHVzaC5hcHBseShhLCBhcmdzKTtcbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IEZ1bmN0aW9uLmJpbmQuYXBwbHkoUGFyZW50LCBhKTtcbiAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBDb25zdHJ1Y3RvcigpO1xuICAgICAgaWYgKENsYXNzKSBzZXRQcm90b3R5cGVPZihpbnN0YW5jZSwgQ2xhc3MucHJvdG90eXBlKTtcbiAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIF9jb25zdHJ1Y3QuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfY29uc3RydWN0O1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gIGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gIHJldHVybiBDb25zdHJ1Y3Rvcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfY3JlYXRlQ2xhc3M7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwidmFyIHN1cGVyUHJvcEJhc2UgPSByZXF1aXJlKFwiLi9zdXBlclByb3BCYXNlLmpzXCIpO1xuXG5mdW5jdGlvbiBfZ2V0KHRhcmdldCwgcHJvcGVydHksIHJlY2VpdmVyKSB7XG4gIGlmICh0eXBlb2YgUmVmbGVjdCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBSZWZsZWN0LmdldCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX2dldCA9IFJlZmxlY3QuZ2V0O1xuICAgIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9nZXQgPSBmdW5jdGlvbiBfZ2V0KHRhcmdldCwgcHJvcGVydHksIHJlY2VpdmVyKSB7XG4gICAgICB2YXIgYmFzZSA9IHN1cGVyUHJvcEJhc2UodGFyZ2V0LCBwcm9wZXJ0eSk7XG4gICAgICBpZiAoIWJhc2UpIHJldHVybjtcbiAgICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihiYXNlLCBwcm9wZXJ0eSk7XG5cbiAgICAgIGlmIChkZXNjLmdldCkge1xuICAgICAgICByZXR1cm4gZGVzYy5nZXQuY2FsbChyZWNlaXZlcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gX2dldCh0YXJnZXQsIHByb3BlcnR5LCByZWNlaXZlciB8fCB0YXJnZXQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9nZXQ7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBfZ2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3QuZ2V0UHJvdG90eXBlT2YgOiBmdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2Yobykge1xuICAgIHJldHVybiBvLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobyk7XG4gIH07XG4gIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgcmV0dXJuIF9nZXRQcm90b3R5cGVPZihvKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfZ2V0UHJvdG90eXBlT2Y7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwidmFyIHNldFByb3RvdHlwZU9mID0gcmVxdWlyZShcIi4vc2V0UHJvdG90eXBlT2YuanNcIik7XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBzdWJDbGFzcyxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIHNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaW5oZXJpdHM7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBcImRlZmF1bHRcIjogb2JqXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdDtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfaXNOYXRpdmVGdW5jdGlvbihmbikge1xuICByZXR1cm4gRnVuY3Rpb24udG9TdHJpbmcuY2FsbChmbikuaW5kZXhPZihcIltuYXRpdmUgY29kZV1cIikgIT09IC0xO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pc05hdGl2ZUZ1bmN0aW9uO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSB7XG4gIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhUmVmbGVjdC5jb25zdHJ1Y3QpIHJldHVybiBmYWxzZTtcbiAgaWYgKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pIHJldHVybiBmYWxzZTtcbiAgaWYgKHR5cGVvZiBQcm94eSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdHJ1ZTtcblxuICB0cnkge1xuICAgIEJvb2xlYW4ucHJvdG90eXBlLnZhbHVlT2YuY2FsbChSZWZsZWN0LmNvbnN0cnVjdChCb29sZWFuLCBbXSwgZnVuY3Rpb24gKCkge30pKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3Q7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwidmFyIF90eXBlb2YgPSByZXF1aXJlKFwiQGJhYmVsL3J1bnRpbWUvaGVscGVycy90eXBlb2ZcIilbXCJkZWZhdWx0XCJdO1xuXG52YXIgYXNzZXJ0VGhpc0luaXRpYWxpemVkID0gcmVxdWlyZShcIi4vYXNzZXJ0VGhpc0luaXRpYWxpemVkLmpzXCIpO1xuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7XG4gIGlmIChjYWxsICYmIChfdHlwZW9mKGNhbGwpID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgcmV0dXJuIGNhbGw7XG4gIH1cblxuICByZXR1cm4gYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gX3NldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7XG4gICAgby5fX3Byb3RvX18gPSBwO1xuICAgIHJldHVybiBvO1xuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgcmV0dXJuIF9zZXRQcm90b3R5cGVPZihvLCBwKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfc2V0UHJvdG90eXBlT2Y7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwidmFyIGdldFByb3RvdHlwZU9mID0gcmVxdWlyZShcIi4vZ2V0UHJvdG90eXBlT2YuanNcIik7XG5cbmZ1bmN0aW9uIF9zdXBlclByb3BCYXNlKG9iamVjdCwgcHJvcGVydHkpIHtcbiAgd2hpbGUgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSkpIHtcbiAgICBvYmplY3QgPSBnZXRQcm90b3R5cGVPZihvYmplY3QpO1xuICAgIGlmIChvYmplY3QgPT09IG51bGwpIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfc3VwZXJQcm9wQmFzZTtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7XG5cbiAgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIH0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gX3R5cGVvZihvYmopO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF90eXBlb2Y7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwidmFyIGdldFByb3RvdHlwZU9mID0gcmVxdWlyZShcIi4vZ2V0UHJvdG90eXBlT2YuanNcIik7XG5cbnZhciBzZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuL3NldFByb3RvdHlwZU9mLmpzXCIpO1xuXG52YXIgaXNOYXRpdmVGdW5jdGlvbiA9IHJlcXVpcmUoXCIuL2lzTmF0aXZlRnVuY3Rpb24uanNcIik7XG5cbnZhciBjb25zdHJ1Y3QgPSByZXF1aXJlKFwiLi9jb25zdHJ1Y3QuanNcIik7XG5cbmZ1bmN0aW9uIF93cmFwTmF0aXZlU3VwZXIoQ2xhc3MpIHtcbiAgdmFyIF9jYWNoZSA9IHR5cGVvZiBNYXAgPT09IFwiZnVuY3Rpb25cIiA/IG5ldyBNYXAoKSA6IHVuZGVmaW5lZDtcblxuICBtb2R1bGUuZXhwb3J0cyA9IF93cmFwTmF0aXZlU3VwZXIgPSBmdW5jdGlvbiBfd3JhcE5hdGl2ZVN1cGVyKENsYXNzKSB7XG4gICAgaWYgKENsYXNzID09PSBudWxsIHx8ICFpc05hdGl2ZUZ1bmN0aW9uKENsYXNzKSkgcmV0dXJuIENsYXNzO1xuXG4gICAgaWYgKHR5cGVvZiBDbGFzcyAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBfY2FjaGUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmIChfY2FjaGUuaGFzKENsYXNzKSkgcmV0dXJuIF9jYWNoZS5nZXQoQ2xhc3MpO1xuXG4gICAgICBfY2FjaGUuc2V0KENsYXNzLCBXcmFwcGVyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBXcmFwcGVyKCkge1xuICAgICAgcmV0dXJuIGNvbnN0cnVjdChDbGFzcywgYXJndW1lbnRzLCBnZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3Rvcik7XG4gICAgfVxuXG4gICAgV3JhcHBlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENsYXNzLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IFdyYXBwZXIsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHNldFByb3RvdHlwZU9mKFdyYXBwZXIsIENsYXNzKTtcbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIHJldHVybiBfd3JhcE5hdGl2ZVN1cGVyKENsYXNzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfd3JhcE5hdGl2ZVN1cGVyO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlZ2VuZXJhdG9yLXJ1bnRpbWVcIik7XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbnZhciBydW50aW1lID0gKGZ1bmN0aW9uIChleHBvcnRzKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIHZhciBPcCA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBoYXNPd24gPSBPcC5oYXNPd25Qcm9wZXJ0eTtcbiAgdmFyIHVuZGVmaW5lZDsgLy8gTW9yZSBjb21wcmVzc2libGUgdGhhbiB2b2lkIDAuXG4gIHZhciAkU3ltYm9sID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiID8gU3ltYm9sIDoge307XG4gIHZhciBpdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG4gIHZhciBhc3luY0l0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5hc3luY0l0ZXJhdG9yIHx8IFwiQEBhc3luY0l0ZXJhdG9yXCI7XG4gIHZhciB0b1N0cmluZ1RhZ1N5bWJvbCA9ICRTeW1ib2wudG9TdHJpbmdUYWcgfHwgXCJAQHRvU3RyaW5nVGFnXCI7XG5cbiAgZnVuY3Rpb24gZGVmaW5lKG9iaiwga2V5LCB2YWx1ZSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgcmV0dXJuIG9ialtrZXldO1xuICB9XG4gIHRyeSB7XG4gICAgLy8gSUUgOCBoYXMgYSBicm9rZW4gT2JqZWN0LmRlZmluZVByb3BlcnR5IHRoYXQgb25seSB3b3JrcyBvbiBET00gb2JqZWN0cy5cbiAgICBkZWZpbmUoe30sIFwiXCIpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBkZWZpbmUgPSBmdW5jdGlvbihvYmosIGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBvYmpba2V5XSA9IHZhbHVlO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gSWYgb3V0ZXJGbiBwcm92aWRlZCBhbmQgb3V0ZXJGbi5wcm90b3R5cGUgaXMgYSBHZW5lcmF0b3IsIHRoZW4gb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IuXG4gICAgdmFyIHByb3RvR2VuZXJhdG9yID0gb3V0ZXJGbiAmJiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvciA/IG91dGVyRm4gOiBHZW5lcmF0b3I7XG4gICAgdmFyIGdlbmVyYXRvciA9IE9iamVjdC5jcmVhdGUocHJvdG9HZW5lcmF0b3IucHJvdG90eXBlKTtcbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0IHx8IFtdKTtcblxuICAgIC8vIFRoZSAuX2ludm9rZSBtZXRob2QgdW5pZmllcyB0aGUgaW1wbGVtZW50YXRpb25zIG9mIHRoZSAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMuXG4gICAgZ2VuZXJhdG9yLl9pbnZva2UgPSBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfVxuICBleHBvcnRzLndyYXAgPSB3cmFwO1xuXG4gIC8vIFRyeS9jYXRjaCBoZWxwZXIgdG8gbWluaW1pemUgZGVvcHRpbWl6YXRpb25zLiBSZXR1cm5zIGEgY29tcGxldGlvblxuICAvLyByZWNvcmQgbGlrZSBjb250ZXh0LnRyeUVudHJpZXNbaV0uY29tcGxldGlvbi4gVGhpcyBpbnRlcmZhY2UgY291bGRcbiAgLy8gaGF2ZSBiZWVuIChhbmQgd2FzIHByZXZpb3VzbHkpIGRlc2lnbmVkIHRvIHRha2UgYSBjbG9zdXJlIHRvIGJlXG4gIC8vIGludm9rZWQgd2l0aG91dCBhcmd1bWVudHMsIGJ1dCBpbiBhbGwgdGhlIGNhc2VzIHdlIGNhcmUgYWJvdXQgd2VcbiAgLy8gYWxyZWFkeSBoYXZlIGFuIGV4aXN0aW5nIG1ldGhvZCB3ZSB3YW50IHRvIGNhbGwsIHNvIHRoZXJlJ3Mgbm8gbmVlZFxuICAvLyB0byBjcmVhdGUgYSBuZXcgZnVuY3Rpb24gb2JqZWN0LiBXZSBjYW4gZXZlbiBnZXQgYXdheSB3aXRoIGFzc3VtaW5nXG4gIC8vIHRoZSBtZXRob2QgdGFrZXMgZXhhY3RseSBvbmUgYXJndW1lbnQsIHNpbmNlIHRoYXQgaGFwcGVucyB0byBiZSB0cnVlXG4gIC8vIGluIGV2ZXJ5IGNhc2UsIHNvIHdlIGRvbid0IGhhdmUgdG8gdG91Y2ggdGhlIGFyZ3VtZW50cyBvYmplY3QuIFRoZVxuICAvLyBvbmx5IGFkZGl0aW9uYWwgYWxsb2NhdGlvbiByZXF1aXJlZCBpcyB0aGUgY29tcGxldGlvbiByZWNvcmQsIHdoaWNoXG4gIC8vIGhhcyBhIHN0YWJsZSBzaGFwZSBhbmQgc28gaG9wZWZ1bGx5IHNob3VsZCBiZSBjaGVhcCB0byBhbGxvY2F0ZS5cbiAgZnVuY3Rpb24gdHJ5Q2F0Y2goZm4sIG9iaiwgYXJnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwibm9ybWFsXCIsIGFyZzogZm4uY2FsbChvYmosIGFyZykgfTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHJldHVybiB7IHR5cGU6IFwidGhyb3dcIiwgYXJnOiBlcnIgfTtcbiAgICB9XG4gIH1cblxuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRTdGFydCA9IFwic3VzcGVuZGVkU3RhcnRcIjtcbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkWWllbGQgPSBcInN1c3BlbmRlZFlpZWxkXCI7XG4gIHZhciBHZW5TdGF0ZUV4ZWN1dGluZyA9IFwiZXhlY3V0aW5nXCI7XG4gIHZhciBHZW5TdGF0ZUNvbXBsZXRlZCA9IFwiY29tcGxldGVkXCI7XG5cbiAgLy8gUmV0dXJuaW5nIHRoaXMgb2JqZWN0IGZyb20gdGhlIGlubmVyRm4gaGFzIHRoZSBzYW1lIGVmZmVjdCBhc1xuICAvLyBicmVha2luZyBvdXQgb2YgdGhlIGRpc3BhdGNoIHN3aXRjaCBzdGF0ZW1lbnQuXG4gIHZhciBDb250aW51ZVNlbnRpbmVsID0ge307XG5cbiAgLy8gRHVtbXkgY29uc3RydWN0b3IgZnVuY3Rpb25zIHRoYXQgd2UgdXNlIGFzIHRoZSAuY29uc3RydWN0b3IgYW5kXG4gIC8vIC5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgcHJvcGVydGllcyBmb3IgZnVuY3Rpb25zIHRoYXQgcmV0dXJuIEdlbmVyYXRvclxuICAvLyBvYmplY3RzLiBGb3IgZnVsbCBzcGVjIGNvbXBsaWFuY2UsIHlvdSBtYXkgd2lzaCB0byBjb25maWd1cmUgeW91clxuICAvLyBtaW5pZmllciBub3QgdG8gbWFuZ2xlIHRoZSBuYW1lcyBvZiB0aGVzZSB0d28gZnVuY3Rpb25zLlxuICBmdW5jdGlvbiBHZW5lcmF0b3IoKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cblxuICAvLyBUaGlzIGlzIGEgcG9seWZpbGwgZm9yICVJdGVyYXRvclByb3RvdHlwZSUgZm9yIGVudmlyb25tZW50cyB0aGF0XG4gIC8vIGRvbid0IG5hdGl2ZWx5IHN1cHBvcnQgaXQuXG4gIHZhciBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuICBJdGVyYXRvclByb3RvdHlwZVtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdmFyIGdldFByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuICB2YXIgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90byAmJiBnZXRQcm90byhnZXRQcm90byh2YWx1ZXMoW10pKSk7XG4gIGlmIChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAmJlxuICAgICAgTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgIT09IE9wICYmXG4gICAgICBoYXNPd24uY2FsbChOYXRpdmVJdGVyYXRvclByb3RvdHlwZSwgaXRlcmF0b3JTeW1ib2wpKSB7XG4gICAgLy8gVGhpcyBlbnZpcm9ubWVudCBoYXMgYSBuYXRpdmUgJUl0ZXJhdG9yUHJvdG90eXBlJTsgdXNlIGl0IGluc3RlYWRcbiAgICAvLyBvZiB0aGUgcG9seWZpbGwuXG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBOYXRpdmVJdGVyYXRvclByb3RvdHlwZTtcbiAgfVxuXG4gIHZhciBHcCA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLnByb3RvdHlwZSA9XG4gICAgR2VuZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoSXRlcmF0b3JQcm90b3R5cGUpO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5wcm90b3R5cGUgPSBHcC5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEdlbmVyYXRvckZ1bmN0aW9uO1xuICBHZW5lcmF0b3JGdW5jdGlvbi5kaXNwbGF5TmFtZSA9IGRlZmluZShcbiAgICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSxcbiAgICB0b1N0cmluZ1RhZ1N5bWJvbCxcbiAgICBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgKTtcblxuICAvLyBIZWxwZXIgZm9yIGRlZmluaW5nIHRoZSAubmV4dCwgLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzIG9mIHRoZVxuICAvLyBJdGVyYXRvciBpbnRlcmZhY2UgaW4gdGVybXMgb2YgYSBzaW5nbGUgLl9pbnZva2UgbWV0aG9kLlxuICBmdW5jdGlvbiBkZWZpbmVJdGVyYXRvck1ldGhvZHMocHJvdG90eXBlKSB7XG4gICAgW1wibmV4dFwiLCBcInRocm93XCIsIFwicmV0dXJuXCJdLmZvckVhY2goZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgICBkZWZpbmUocHJvdG90eXBlLCBtZXRob2QsIGZ1bmN0aW9uKGFyZykge1xuICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlKG1ldGhvZCwgYXJnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgZXhwb3J0cy5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgaWYgKE9iamVjdC5zZXRQcm90b3R5cGVPZikge1xuICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKGdlbkZ1biwgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnZW5GdW4uX19wcm90b19fID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICAgICBkZWZpbmUoZ2VuRnVuLCB0b1N0cmluZ1RhZ1N5bWJvbCwgXCJHZW5lcmF0b3JGdW5jdGlvblwiKTtcbiAgICB9XG4gICAgZ2VuRnVuLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoR3ApO1xuICAgIHJldHVybiBnZW5GdW47XG4gIH07XG5cbiAgLy8gV2l0aGluIHRoZSBib2R5IG9mIGFueSBhc3luYyBmdW5jdGlvbiwgYGF3YWl0IHhgIGlzIHRyYW5zZm9ybWVkIHRvXG4gIC8vIGB5aWVsZCByZWdlbmVyYXRvclJ1bnRpbWUuYXdyYXAoeClgLCBzbyB0aGF0IHRoZSBydW50aW1lIGNhbiB0ZXN0XG4gIC8vIGBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpYCB0byBkZXRlcm1pbmUgaWYgdGhlIHlpZWxkZWQgdmFsdWUgaXNcbiAgLy8gbWVhbnQgdG8gYmUgYXdhaXRlZC5cbiAgZXhwb3J0cy5hd3JhcCA9IGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiB7IF9fYXdhaXQ6IGFyZyB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIEFzeW5jSXRlcmF0b3IoZ2VuZXJhdG9yLCBQcm9taXNlSW1wbCkge1xuICAgIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goZ2VuZXJhdG9yW21ldGhvZF0sIGdlbmVyYXRvciwgYXJnKTtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHJlamVjdChyZWNvcmQuYXJnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXN1bHQgPSByZWNvcmQuYXJnO1xuICAgICAgICB2YXIgdmFsdWUgPSByZXN1bHQudmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSAmJlxuICAgICAgICAgICAgdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbCh2YWx1ZSwgXCJfX2F3YWl0XCIpKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2VJbXBsLnJlc29sdmUodmFsdWUuX19hd2FpdCkudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgaW52b2tlKFwibmV4dFwiLCB2YWx1ZSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGludm9rZShcInRocm93XCIsIGVyciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlSW1wbC5yZXNvbHZlKHZhbHVlKS50aGVuKGZ1bmN0aW9uKHVud3JhcHBlZCkge1xuICAgICAgICAgIC8vIFdoZW4gYSB5aWVsZGVkIFByb21pc2UgaXMgcmVzb2x2ZWQsIGl0cyBmaW5hbCB2YWx1ZSBiZWNvbWVzXG4gICAgICAgICAgLy8gdGhlIC52YWx1ZSBvZiB0aGUgUHJvbWlzZTx7dmFsdWUsZG9uZX0+IHJlc3VsdCBmb3IgdGhlXG4gICAgICAgICAgLy8gY3VycmVudCBpdGVyYXRpb24uXG4gICAgICAgICAgcmVzdWx0LnZhbHVlID0gdW53cmFwcGVkO1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAvLyBJZiBhIHJlamVjdGVkIFByb21pc2Ugd2FzIHlpZWxkZWQsIHRocm93IHRoZSByZWplY3Rpb24gYmFja1xuICAgICAgICAgIC8vIGludG8gdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBzbyBpdCBjYW4gYmUgaGFuZGxlZCB0aGVyZS5cbiAgICAgICAgICByZXR1cm4gaW52b2tlKFwidGhyb3dcIiwgZXJyb3IsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBwcmV2aW91c1Byb21pc2U7XG5cbiAgICBmdW5jdGlvbiBlbnF1ZXVlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBmdW5jdGlvbiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlSW1wbChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJldmlvdXNQcm9taXNlID1cbiAgICAgICAgLy8gSWYgZW5xdWV1ZSBoYXMgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIHdlIHdhbnQgdG8gd2FpdCB1bnRpbFxuICAgICAgICAvLyBhbGwgcHJldmlvdXMgUHJvbWlzZXMgaGF2ZSBiZWVuIHJlc29sdmVkIGJlZm9yZSBjYWxsaW5nIGludm9rZSxcbiAgICAgICAgLy8gc28gdGhhdCByZXN1bHRzIGFyZSBhbHdheXMgZGVsaXZlcmVkIGluIHRoZSBjb3JyZWN0IG9yZGVyLiBJZlxuICAgICAgICAvLyBlbnF1ZXVlIGhhcyBub3QgYmVlbiBjYWxsZWQgYmVmb3JlLCB0aGVuIGl0IGlzIGltcG9ydGFudCB0b1xuICAgICAgICAvLyBjYWxsIGludm9rZSBpbW1lZGlhdGVseSwgd2l0aG91dCB3YWl0aW5nIG9uIGEgY2FsbGJhY2sgdG8gZmlyZSxcbiAgICAgICAgLy8gc28gdGhhdCB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIGhhcyB0aGUgb3Bwb3J0dW5pdHkgdG8gZG9cbiAgICAgICAgLy8gYW55IG5lY2Vzc2FyeSBzZXR1cCBpbiBhIHByZWRpY3RhYmxlIHdheS4gVGhpcyBwcmVkaWN0YWJpbGl0eVxuICAgICAgICAvLyBpcyB3aHkgdGhlIFByb21pc2UgY29uc3RydWN0b3Igc3luY2hyb25vdXNseSBpbnZva2VzIGl0c1xuICAgICAgICAvLyBleGVjdXRvciBjYWxsYmFjaywgYW5kIHdoeSBhc3luYyBmdW5jdGlvbnMgc3luY2hyb25vdXNseVxuICAgICAgICAvLyBleGVjdXRlIGNvZGUgYmVmb3JlIHRoZSBmaXJzdCBhd2FpdC4gU2luY2Ugd2UgaW1wbGVtZW50IHNpbXBsZVxuICAgICAgICAvLyBhc3luYyBmdW5jdGlvbnMgaW4gdGVybXMgb2YgYXN5bmMgZ2VuZXJhdG9ycywgaXQgaXMgZXNwZWNpYWxseVxuICAgICAgICAvLyBpbXBvcnRhbnQgdG8gZ2V0IHRoaXMgcmlnaHQsIGV2ZW4gdGhvdWdoIGl0IHJlcXVpcmVzIGNhcmUuXG4gICAgICAgIHByZXZpb3VzUHJvbWlzZSA/IHByZXZpb3VzUHJvbWlzZS50aGVuKFxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnLFxuICAgICAgICAgIC8vIEF2b2lkIHByb3BhZ2F0aW5nIGZhaWx1cmVzIHRvIFByb21pc2VzIHJldHVybmVkIGJ5IGxhdGVyXG4gICAgICAgICAgLy8gaW52b2NhdGlvbnMgb2YgdGhlIGl0ZXJhdG9yLlxuICAgICAgICAgIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnXG4gICAgICAgICkgOiBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZygpO1xuICAgIH1cblxuICAgIC8vIERlZmluZSB0aGUgdW5pZmllZCBoZWxwZXIgbWV0aG9kIHRoYXQgaXMgdXNlZCB0byBpbXBsZW1lbnQgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiAoc2VlIGRlZmluZUl0ZXJhdG9yTWV0aG9kcykuXG4gICAgdGhpcy5faW52b2tlID0gZW5xdWV1ZTtcbiAgfVxuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhBc3luY0l0ZXJhdG9yLnByb3RvdHlwZSk7XG4gIEFzeW5jSXRlcmF0b3IucHJvdG90eXBlW2FzeW5jSXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBleHBvcnRzLkFzeW5jSXRlcmF0b3IgPSBBc3luY0l0ZXJhdG9yO1xuXG4gIC8vIE5vdGUgdGhhdCBzaW1wbGUgYXN5bmMgZnVuY3Rpb25zIGFyZSBpbXBsZW1lbnRlZCBvbiB0b3Agb2ZcbiAgLy8gQXN5bmNJdGVyYXRvciBvYmplY3RzOyB0aGV5IGp1c3QgcmV0dXJuIGEgUHJvbWlzZSBmb3IgdGhlIHZhbHVlIG9mXG4gIC8vIHRoZSBmaW5hbCByZXN1bHQgcHJvZHVjZWQgYnkgdGhlIGl0ZXJhdG9yLlxuICBleHBvcnRzLmFzeW5jID0gZnVuY3Rpb24oaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QsIFByb21pc2VJbXBsKSB7XG4gICAgaWYgKFByb21pc2VJbXBsID09PSB2b2lkIDApIFByb21pc2VJbXBsID0gUHJvbWlzZTtcblxuICAgIHZhciBpdGVyID0gbmV3IEFzeW5jSXRlcmF0b3IoXG4gICAgICB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSxcbiAgICAgIFByb21pc2VJbXBsXG4gICAgKTtcblxuICAgIHJldHVybiBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24ob3V0ZXJGbilcbiAgICAgID8gaXRlciAvLyBJZiBvdXRlckZuIGlzIGEgZ2VuZXJhdG9yLCByZXR1cm4gdGhlIGZ1bGwgaXRlcmF0b3IuXG4gICAgICA6IGl0ZXIubmV4dCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3VsdC5kb25lID8gcmVzdWx0LnZhbHVlIDogaXRlci5uZXh0KCk7XG4gICAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCkge1xuICAgIHZhciBzdGF0ZSA9IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQ7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IG1ldGhvZDtcbiAgICAgIGNvbnRleHQuYXJnID0gYXJnO1xuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgZGVsZWdhdGVSZXN1bHQgPSBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcbiAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCA9PT0gQ29udGludWVTZW50aW5lbCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gZGVsZWdhdGVSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIC8vIFNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICAgICAgY29udGV4dC5zZW50ID0gY29udGV4dC5fc2VudCA9IGNvbnRleHQuYXJnO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCkge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAgIHRocm93IGNvbnRleHQuYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dC5tZXRob2QgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgICBjb250ZXh0LmFicnVwdChcInJldHVyblwiLCBjb250ZXh0LmFyZyk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZSA9IEdlblN0YXRlRXhlY3V0aW5nO1xuXG4gICAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcbiAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgICAgLy8gSWYgYW4gZXhjZXB0aW9uIGlzIHRocm93biBmcm9tIGlubmVyRm4sIHdlIGxlYXZlIHN0YXRlID09PVxuICAgICAgICAgIC8vIEdlblN0YXRlRXhlY3V0aW5nIGFuZCBsb29wIGJhY2sgZm9yIGFub3RoZXIgaW52b2NhdGlvbi5cbiAgICAgICAgICBzdGF0ZSA9IGNvbnRleHQuZG9uZVxuICAgICAgICAgICAgPyBHZW5TdGF0ZUNvbXBsZXRlZFxuICAgICAgICAgICAgOiBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC5hcmcgPT09IENvbnRpbnVlU2VudGluZWwpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogcmVjb3JkLmFyZyxcbiAgICAgICAgICAgIGRvbmU6IGNvbnRleHQuZG9uZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcbiAgICAgICAgICAvLyBEaXNwYXRjaCB0aGUgZXhjZXB0aW9uIGJ5IGxvb3BpbmcgYmFjayBhcm91bmQgdG8gdGhlXG4gICAgICAgICAgLy8gY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZykgY2FsbCBhYm92ZS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLy8gQ2FsbCBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF0oY29udGV4dC5hcmcpIGFuZCBoYW5kbGUgdGhlXG4gIC8vIHJlc3VsdCwgZWl0aGVyIGJ5IHJldHVybmluZyBhIHsgdmFsdWUsIGRvbmUgfSByZXN1bHQgZnJvbSB0aGVcbiAgLy8gZGVsZWdhdGUgaXRlcmF0b3IsIG9yIGJ5IG1vZGlmeWluZyBjb250ZXh0Lm1ldGhvZCBhbmQgY29udGV4dC5hcmcsXG4gIC8vIHNldHRpbmcgY29udGV4dC5kZWxlZ2F0ZSB0byBudWxsLCBhbmQgcmV0dXJuaW5nIHRoZSBDb250aW51ZVNlbnRpbmVsLlxuICBmdW5jdGlvbiBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIG1ldGhvZCA9IGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXTtcbiAgICBpZiAobWV0aG9kID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIEEgLnRocm93IG9yIC5yZXR1cm4gd2hlbiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIG5vIC50aHJvd1xuICAgICAgLy8gbWV0aG9kIGFsd2F5cyB0ZXJtaW5hdGVzIHRoZSB5aWVsZCogbG9vcC5cbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAvLyBOb3RlOiBbXCJyZXR1cm5cIl0gbXVzdCBiZSB1c2VkIGZvciBFUzMgcGFyc2luZyBjb21wYXRpYmlsaXR5LlxuICAgICAgICBpZiAoZGVsZWdhdGUuaXRlcmF0b3JbXCJyZXR1cm5cIl0pIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGVsZWdhdGUgaXRlcmF0b3IgaGFzIGEgcmV0dXJuIG1ldGhvZCwgZ2l2ZSBpdCBhXG4gICAgICAgICAgLy8gY2hhbmNlIHRvIGNsZWFuIHVwLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBtYXliZUludm9rZURlbGVnYXRlKGRlbGVnYXRlLCBjb250ZXh0KTtcblxuICAgICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICAvLyBJZiBtYXliZUludm9rZURlbGVnYXRlKGNvbnRleHQpIGNoYW5nZWQgY29udGV4dC5tZXRob2QgZnJvbVxuICAgICAgICAgICAgLy8gXCJyZXR1cm5cIiB0byBcInRocm93XCIsIGxldCB0aGF0IG92ZXJyaWRlIHRoZSBUeXBlRXJyb3IgYmVsb3cuXG4gICAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiVGhlIGl0ZXJhdG9yIGRvZXMgbm90IHByb3ZpZGUgYSAndGhyb3cnIG1ldGhvZFwiKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKG1ldGhvZCwgZGVsZWdhdGUuaXRlcmF0b3IsIGNvbnRleHQuYXJnKTtcblxuICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuXG4gICAgaWYgKCEgaW5mbykge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXCJpdGVyYXRvciByZXN1bHQgaXMgbm90IGFuIG9iamVjdFwiKTtcbiAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuXG4gICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgLy8gQXNzaWduIHRoZSByZXN1bHQgb2YgdGhlIGZpbmlzaGVkIGRlbGVnYXRlIHRvIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIHZhcmlhYmxlIHNwZWNpZmllZCBieSBkZWxlZ2F0ZS5yZXN1bHROYW1lIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0W2RlbGVnYXRlLnJlc3VsdE5hbWVdID0gaW5mby52YWx1ZTtcblxuICAgICAgLy8gUmVzdW1lIGV4ZWN1dGlvbiBhdCB0aGUgZGVzaXJlZCBsb2NhdGlvbiAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcblxuICAgICAgLy8gSWYgY29udGV4dC5tZXRob2Qgd2FzIFwidGhyb3dcIiBidXQgdGhlIGRlbGVnYXRlIGhhbmRsZWQgdGhlXG4gICAgICAvLyBleGNlcHRpb24sIGxldCB0aGUgb3V0ZXIgZ2VuZXJhdG9yIHByb2NlZWQgbm9ybWFsbHkuIElmXG4gICAgICAvLyBjb250ZXh0Lm1ldGhvZCB3YXMgXCJuZXh0XCIsIGZvcmdldCBjb250ZXh0LmFyZyBzaW5jZSBpdCBoYXMgYmVlblxuICAgICAgLy8gXCJjb25zdW1lZFwiIGJ5IHRoZSBkZWxlZ2F0ZSBpdGVyYXRvci4gSWYgY29udGV4dC5tZXRob2Qgd2FzXG4gICAgICAvLyBcInJldHVyblwiLCBhbGxvdyB0aGUgb3JpZ2luYWwgLnJldHVybiBjYWxsIHRvIGNvbnRpbnVlIGluIHRoZVxuICAgICAgLy8gb3V0ZXIgZ2VuZXJhdG9yLlxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kICE9PSBcInJldHVyblwiKSB7XG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlLXlpZWxkIHRoZSByZXN1bHQgcmV0dXJuZWQgYnkgdGhlIGRlbGVnYXRlIG1ldGhvZC5cbiAgICAgIHJldHVybiBpbmZvO1xuICAgIH1cblxuICAgIC8vIFRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBpcyBmaW5pc2hlZCwgc28gZm9yZ2V0IGl0IGFuZCBjb250aW51ZSB3aXRoXG4gICAgLy8gdGhlIG91dGVyIGdlbmVyYXRvci5cbiAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgfVxuXG4gIC8vIERlZmluZSBHZW5lcmF0b3IucHJvdG90eXBlLntuZXh0LHRocm93LHJldHVybn0gaW4gdGVybXMgb2YgdGhlXG4gIC8vIHVuaWZpZWQgLl9pbnZva2UgaGVscGVyIG1ldGhvZC5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEdwKTtcblxuICBkZWZpbmUoR3AsIHRvU3RyaW5nVGFnU3ltYm9sLCBcIkdlbmVyYXRvclwiKTtcblxuICAvLyBBIEdlbmVyYXRvciBzaG91bGQgYWx3YXlzIHJldHVybiBpdHNlbGYgYXMgdGhlIGl0ZXJhdG9yIG9iamVjdCB3aGVuIHRoZVxuICAvLyBAQGl0ZXJhdG9yIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbiBpdC4gU29tZSBicm93c2VycycgaW1wbGVtZW50YXRpb25zIG9mIHRoZVxuICAvLyBpdGVyYXRvciBwcm90b3R5cGUgY2hhaW4gaW5jb3JyZWN0bHkgaW1wbGVtZW50IHRoaXMsIGNhdXNpbmcgdGhlIEdlbmVyYXRvclxuICAvLyBvYmplY3QgdG8gbm90IGJlIHJldHVybmVkIGZyb20gdGhpcyBjYWxsLiBUaGlzIGVuc3VyZXMgdGhhdCBkb2Vzbid0IGhhcHBlbi5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9pc3N1ZXMvMjc0IGZvciBtb3JlIGRldGFpbHMuXG4gIEdwW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEdwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBHZW5lcmF0b3JdXCI7XG4gIH07XG5cbiAgZnVuY3Rpb24gcHVzaFRyeUVudHJ5KGxvY3MpIHtcbiAgICB2YXIgZW50cnkgPSB7IHRyeUxvYzogbG9jc1swXSB9O1xuXG4gICAgaWYgKDEgaW4gbG9jcykge1xuICAgICAgZW50cnkuY2F0Y2hMb2MgPSBsb2NzWzFdO1xuICAgIH1cblxuICAgIGlmICgyIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmZpbmFsbHlMb2MgPSBsb2NzWzJdO1xuICAgICAgZW50cnkuYWZ0ZXJMb2MgPSBsb2NzWzNdO1xuICAgIH1cblxuICAgIHRoaXMudHJ5RW50cmllcy5wdXNoKGVudHJ5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2V0VHJ5RW50cnkoZW50cnkpIHtcbiAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbiB8fCB7fTtcbiAgICByZWNvcmQudHlwZSA9IFwibm9ybWFsXCI7XG4gICAgZGVsZXRlIHJlY29yZC5hcmc7XG4gICAgZW50cnkuY29tcGxldGlvbiA9IHJlY29yZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIENvbnRleHQodHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBUaGUgcm9vdCBlbnRyeSBvYmplY3QgKGVmZmVjdGl2ZWx5IGEgdHJ5IHN0YXRlbWVudCB3aXRob3V0IGEgY2F0Y2hcbiAgICAvLyBvciBhIGZpbmFsbHkgYmxvY2spIGdpdmVzIHVzIGEgcGxhY2UgdG8gc3RvcmUgdmFsdWVzIHRocm93biBmcm9tXG4gICAgLy8gbG9jYXRpb25zIHdoZXJlIHRoZXJlIGlzIG5vIGVuY2xvc2luZyB0cnkgc3RhdGVtZW50LlxuICAgIHRoaXMudHJ5RW50cmllcyA9IFt7IHRyeUxvYzogXCJyb290XCIgfV07XG4gICAgdHJ5TG9jc0xpc3QuZm9yRWFjaChwdXNoVHJ5RW50cnksIHRoaXMpO1xuICAgIHRoaXMucmVzZXQodHJ1ZSk7XG4gIH1cblxuICBleHBvcnRzLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbihza2lwVGVtcFJlc2V0KSB7XG4gICAgICB0aGlzLnByZXYgPSAwO1xuICAgICAgdGhpcy5uZXh0ID0gMDtcbiAgICAgIC8vIFJlc2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgdGhpcy5zZW50ID0gdGhpcy5fc2VudCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuZG9uZSA9IGZhbHNlO1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIGlmICghc2tpcFRlbXBSZXNldCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICAvLyBOb3Qgc3VyZSBhYm91dCB0aGUgb3B0aW1hbCBvcmRlciBvZiB0aGVzZSBjb25kaXRpb25zOlxuICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PT0gXCJ0XCIgJiZcbiAgICAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgbmFtZSkgJiZcbiAgICAgICAgICAgICAgIWlzTmFOKCtuYW1lLnNsaWNlKDEpKSkge1xuICAgICAgICAgICAgdGhpc1tuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuXG4gICAgICAgIGlmIChjYXVnaHQpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgZGlzcGF0Y2hlZCBleGNlcHRpb24gd2FzIGNhdWdodCBieSBhIGNhdGNoIGJsb2NrLFxuICAgICAgICAgIC8vIHRoZW4gbGV0IHRoYXQgY2F0Y2ggYmxvY2sgaGFuZGxlIHRoZSBleGNlcHRpb24gbm9ybWFsbHkuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAhISBjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDw9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgIC8vIElnbm9yZSB0aGUgZmluYWxseSBlbnRyeSBpZiBjb250cm9sIGlzIG5vdCBqdW1waW5nIHRvIGFcbiAgICAgICAgLy8gbG9jYXRpb24gb3V0c2lkZSB0aGUgdHJ5L2NhdGNoIGJsb2NrLlxuICAgICAgICBmaW5hbGx5RW50cnkgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVjb3JkID0gZmluYWxseUVudHJ5ID8gZmluYWxseUVudHJ5LmNvbXBsZXRpb24gOiB7fTtcbiAgICAgIHJlY29yZC50eXBlID0gdHlwZTtcbiAgICAgIHJlY29yZC5hcmcgPSBhcmc7XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkpIHtcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2M7XG4gICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5jb21wbGV0ZShyZWNvcmQpO1xuICAgIH0sXG5cbiAgICBjb21wbGV0ZTogZnVuY3Rpb24ocmVjb3JkLCBhZnRlckxvYykge1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICByZWNvcmQudHlwZSA9PT0gXCJjb250aW51ZVwiKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IHJlY29yZC5hcmc7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInJldHVyblwiKSB7XG4gICAgICAgIHRoaXMucnZhbCA9IHRoaXMuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICB0aGlzLm5leHQgPSBcImVuZFwiO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIiAmJiBhZnRlckxvYykge1xuICAgICAgICB0aGlzLm5leHQgPSBhZnRlckxvYztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGZpbmlzaDogZnVuY3Rpb24oZmluYWxseUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS5maW5hbGx5TG9jID09PSBmaW5hbGx5TG9jKSB7XG4gICAgICAgICAgdGhpcy5jb21wbGV0ZShlbnRyeS5jb21wbGV0aW9uLCBlbnRyeS5hZnRlckxvYyk7XG4gICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgXCJjYXRjaFwiOiBmdW5jdGlvbih0cnlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSB0cnlMb2MpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcbiAgICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgdmFyIHRocm93biA9IHJlY29yZC5hcmc7XG4gICAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRocm93bjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUaGUgY29udGV4dC5jYXRjaCBtZXRob2QgbXVzdCBvbmx5IGJlIGNhbGxlZCB3aXRoIGEgbG9jYXRpb25cbiAgICAgIC8vIGFyZ3VtZW50IHRoYXQgY29ycmVzcG9uZHMgdG8gYSBrbm93biBjYXRjaCBibG9jay5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgY2F0Y2ggYXR0ZW1wdFwiKTtcbiAgICB9LFxuXG4gICAgZGVsZWdhdGVZaWVsZDogZnVuY3Rpb24oaXRlcmFibGUsIHJlc3VsdE5hbWUsIG5leHRMb2MpIHtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSB7XG4gICAgICAgIGl0ZXJhdG9yOiB2YWx1ZXMoaXRlcmFibGUpLFxuICAgICAgICByZXN1bHROYW1lOiByZXN1bHROYW1lLFxuICAgICAgICBuZXh0TG9jOiBuZXh0TG9jXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcblxuICAvLyBSZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlXG4gIC8vIG9yIG5vdCwgcmV0dXJuIHRoZSBydW50aW1lIG9iamVjdCBzbyB0aGF0IHdlIGNhbiBkZWNsYXJlIHRoZSB2YXJpYWJsZVxuICAvLyByZWdlbmVyYXRvclJ1bnRpbWUgaW4gdGhlIG91dGVyIHNjb3BlLCB3aGljaCBhbGxvd3MgdGhpcyBtb2R1bGUgdG8gYmVcbiAgLy8gaW5qZWN0ZWQgZWFzaWx5IGJ5IGBiaW4vcmVnZW5lcmF0b3IgLS1pbmNsdWRlLXJ1bnRpbWUgc2NyaXB0LmpzYC5cbiAgcmV0dXJuIGV4cG9ydHM7XG5cbn0oXG4gIC8vIElmIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZSwgdXNlIG1vZHVsZS5leHBvcnRzXG4gIC8vIGFzIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgbmFtZXNwYWNlLiBPdGhlcndpc2UgY3JlYXRlIGEgbmV3IGVtcHR5XG4gIC8vIG9iamVjdC4gRWl0aGVyIHdheSwgdGhlIHJlc3VsdGluZyBvYmplY3Qgd2lsbCBiZSB1c2VkIHRvIGluaXRpYWxpemVcbiAgLy8gdGhlIHJlZ2VuZXJhdG9yUnVudGltZSB2YXJpYWJsZSBhdCB0aGUgdG9wIG9mIHRoaXMgZmlsZS5cbiAgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIiA/IG1vZHVsZS5leHBvcnRzIDoge31cbikpO1xuXG50cnkge1xuICByZWdlbmVyYXRvclJ1bnRpbWUgPSBydW50aW1lO1xufSBjYXRjaCAoYWNjaWRlbnRhbFN0cmljdE1vZGUpIHtcbiAgLy8gVGhpcyBtb2R1bGUgc2hvdWxkIG5vdCBiZSBydW5uaW5nIGluIHN0cmljdCBtb2RlLCBzbyB0aGUgYWJvdmVcbiAgLy8gYXNzaWdubWVudCBzaG91bGQgYWx3YXlzIHdvcmsgdW5sZXNzIHNvbWV0aGluZyBpcyBtaXNjb25maWd1cmVkLiBKdXN0XG4gIC8vIGluIGNhc2UgcnVudGltZS5qcyBhY2NpZGVudGFsbHkgcnVucyBpbiBzdHJpY3QgbW9kZSwgd2UgY2FuIGVzY2FwZVxuICAvLyBzdHJpY3QgbW9kZSB1c2luZyBhIGdsb2JhbCBGdW5jdGlvbiBjYWxsLiBUaGlzIGNvdWxkIGNvbmNlaXZhYmx5IGZhaWxcbiAgLy8gaWYgYSBDb250ZW50IFNlY3VyaXR5IFBvbGljeSBmb3JiaWRzIHVzaW5nIEZ1bmN0aW9uLCBidXQgaW4gdGhhdCBjYXNlXG4gIC8vIHRoZSBwcm9wZXIgc29sdXRpb24gaXMgdG8gZml4IHRoZSBhY2NpZGVudGFsIHN0cmljdCBtb2RlIHByb2JsZW0uIElmXG4gIC8vIHlvdSd2ZSBtaXNjb25maWd1cmVkIHlvdXIgYnVuZGxlciB0byBmb3JjZSBzdHJpY3QgbW9kZSBhbmQgYXBwbGllZCBhXG4gIC8vIENTUCB0byBmb3JiaWQgRnVuY3Rpb24sIGFuZCB5b3UncmUgbm90IHdpbGxpbmcgdG8gZml4IGVpdGhlciBvZiB0aG9zZVxuICAvLyBwcm9ibGVtcywgcGxlYXNlIGRldGFpbCB5b3VyIHVuaXF1ZSBwcmVkaWNhbWVudCBpbiBhIEdpdEh1YiBpc3N1ZS5cbiAgRnVuY3Rpb24oXCJyXCIsIFwicmVnZW5lcmF0b3JSdW50aW1lID0gclwiKShydW50aW1lKTtcbn1cbiIsImltcG9ydCBGaWxlT3BzIGZyb20gXCIuL21vZHVsZXMvRmlsZU9wcy5qc1wiO1xyXG5pbXBvcnQgQXV0aGVudGljYXRlIGZyb20gXCIuL21vZHVsZXMvQXV0aGVudGljYXRlLmpzXCI7XHJcbmltcG9ydCBNZW51IGZyb20gXCIuL21vZHVsZXMvTWVudS5qc1wiO1xyXG5pbXBvcnQgUXVlc3Rpb25QYW5lIGZyb20gXCIuL21vZHVsZXMvUXVlc3Rpb25QYW5lLmpzXCI7XHJcbmltcG9ydCBFZGl0b3JQYW5lIGZyb20gXCIuL21vZHVsZXMvRWRpdG9yUGFuZS5qc1wiO1xyXG5pbXBvcnQgTW9kZWwgZnJvbSBcIi4vbW9kdWxlcy9Nb2RlbFwiO1xyXG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiQHRoYWVyaW91cy9uaWRnZXRcIilcclxuXHJcbmltcG9ydCBcIi4vbW9kdWxlcy9HYW1lQm9hcmQuanNcIjtcclxuaW1wb3J0IFwiLi9tb2R1bGVzL011bHRpcGxlQ2hvaWNlUGFuZS5qc1wiO1xyXG5pbXBvcnQgXCIuL21vZHVsZXMvQ2hlY2tCb3guanNcIjtcclxuXHJcbmxldCBmaWxlT3BzID0gbmV3IEZpbGVPcHMoKTtcclxubGV0IG1vZGVsID0gbnVsbDtcclxubGV0IHF1ZXN0aW9uUGFuZSA9IG51bGw7XHJcbmxldCBlZGl0b3JQYW5lID0gbnVsbDtcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBzZXR1cCgpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBzZXR1cCgpe1xyXG4gICAgbGV0IHN0YXJ0ID0gbmV3IERhdGUoKTtcclxuICAgIGF3YWl0IE5pZGdldC5OaWRnZXRFbGVtZW50LmxvYWRUZW1wbGF0ZVNuaXBwZXQoXCJzbmlwcGV0cy9jaGVjay1ib3guaHRtbFwiLCBcImNoZWNrLWJveFwiKTtcclxuICAgIGF3YWl0IE5pZGdldC5OaWRnZXRFbGVtZW50LmxvYWRUZW1wbGF0ZVNuaXBwZXQoXCJzbmlwcGV0cy9tdWx0aXBsZS1jaG9pY2UtcGFuZS5odG1sXCIsIFwibXVsdGlwbGUtY2hvaWNlLXBhbmVcIik7XHJcbiAgICBhd2FpdCBOaWRnZXQuTmlkZ2V0RWxlbWVudC5sb2FkVGVtcGxhdGVTbmlwcGV0KFwic25pcHBldHMvZ2FtZS1ib2FyZC5odG1sXCIsIFwiZ2FtZS1ib2FyZFwiKTtcclxuICAgIGF3YWl0IE5pZGdldC5OaWRnZXRFbGVtZW50LmxvYWRUZW1wbGF0ZVNuaXBwZXQoXCJzbmlwcGV0cy9xdWVzdGlvbi1wYW5lLmh0bWxcIiwgXCJxdWVzdGlvbi1wYW5lXCIpO1xyXG5cclxuICAgIHBhcnNlVVJMUGFyYW1ldGVycygpO1xyXG4gICAgbmV3IE1lbnUoKS5pbml0KFwiI21lbnVcIik7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBuZXcgQXV0aGVudGljYXRlKCkubG9hZENsaWVudCgpO1xyXG4gICAgICAgIGF3YWl0IGZpbGVPcHMubG9hZENsaWVudCgpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZmlsZSA9IGF3YWl0IGZpbGVPcHMuZ2V0KHdpbmRvdy5wYXJhbWV0ZXJzLmZpbGVJZCk7XHJcbiAgICBsZXQgbW9kZWwgPSBuZXcgTW9kZWwoZmlsZU9wcykuc2V0KEpTT04ucGFyc2UoZmlsZS5ib2R5KSk7XHJcbiAgICB3aW5kb3cubW9kZWwgPSBtb2RlbDtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtbmFtZVwiKS50ZXh0Q29udGVudCA9IG1vZGVsLm5hbWU7XHJcbiAgICBlZGl0b3JQYW5lID0gbmV3IEVkaXRvclBhbmUobW9kZWwpO1xyXG4gICAgZWRpdG9yUGFuZS5vblNhdmUgPSBzYXZlTW9kZWw7XHJcblxyXG4gICAgbGV0IGVuZCA9IG5ldyBEYXRlKCk7XHJcbiAgICBsZXQgdGltZSA9IGVuZCAtIHN0YXJ0O1xyXG4gICAgY29uc29sZS5sb2coXCJMb2FkIFRpbWUgXCIgKyB0aW1lICsgXCIgbXNcIik7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTYXZlIHRoZSBtb2RlbCB0byB0aGUgZ29vZ2xlIGFwcCBkYXRhIGZvbGRlci5cclxuICovXHJcbmZ1bmN0aW9uIHNhdmVNb2RlbCgpIHtcclxuICAgIGZpbGVPcHMuc2V0Qm9keSh3aW5kb3cucGFyYW1ldGVycy5maWxlSWQsIEpTT04uc3RyaW5naWZ5KHdpbmRvdy5tb2RlbC5nZXQoKSwgbnVsbCwgMikpO1xyXG59XHJcblxyXG4vKipcclxuICogQ2hhbmdlIHRoZSBuYW1lIG9mIHRoZSBmaWxlIGluIGdvb2dsZSdzIGFwcCBkYXRhIGZvbGRlci5cclxuICovXHJcbmZ1bmN0aW9uIHJlbmFtZU1vZGVsKCkge1xyXG4gICAgbGV0IG5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtbmFtZVwiKS50ZXh0Q29udGVudDtcclxuICAgIGZpbGVPcHMucmVuYW1lKHdpbmRvdy5wYXJhbWV0ZXJzLmZpbGVJZCwgbmFtZSArIFwiLmpzb25cIik7XHJcbiAgICB3aW5kb3cubW9kZWwubmFtZSA9IG5hbWU7XHJcbiAgICBzYXZlTW9kZWwoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEV4dHJhY3QgdmFsdWUgZnJvbSB0aGUgVVJMIHN0cmluZywgc3RvcmUgaW4gJ3dpbmRvdy5wYXJhbWV0ZXJzJy5cclxuICovXHJcbmZ1bmN0aW9uIHBhcnNlVVJMUGFyYW1ldGVycygpIHtcclxuICAgIHdpbmRvdy5wYXJhbWV0ZXJzID0ge307XHJcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSkuc3BsaXQoXCImXCIpO1xyXG4gICAgZm9yIChjb25zdCBwYXJhbWV0ZXIgb2YgcGFyYW1ldGVycykge1xyXG4gICAgICAgIGNvbnN0IHNwbGl0ID0gcGFyYW1ldGVyLnNwbGl0KC89Lyk7XHJcbiAgICAgICAgd2luZG93LnBhcmFtZXRlcnNbc3BsaXRbMF1dID0gc3BsaXRbMV0gPz8gXCJcIjtcclxuICAgIH1cclxufSIsIi8vIHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9kcml2ZS9hcGkvdjMvcXVpY2tzdGFydC9qcz9obD1lblxyXG5cclxuY2xhc3MgQXV0aGVudGljYXRlIHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCByZXF1aXJlKFwiLi9nb29nbGVGaWVsZHMuanNcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDbGllbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZ2FwaS5sb2FkKCdjbGllbnQ6YXV0aDInLCAoKSA9PiB0aGlzLl9faW5pdENsaWVudChyZXNvbHZlLCByZWplY3QpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfX2luaXRDbGllbnQocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZ2FwaS5jbGllbnQuaW5pdCh7XHJcbiAgICAgICAgICAgIGFwaUtleTogdGhpcy5kZXZlbG9wZXJLZXksXHJcbiAgICAgICAgICAgIGNsaWVudElkOiB0aGlzLmNsaWVudElkLFxyXG4gICAgICAgICAgICBkaXNjb3ZlcnlEb2NzOiB0aGlzLmRpc2NvdmVyeURvY3MsXHJcbiAgICAgICAgICAgIHNjb3BlOiB0aGlzLnNjb3BlXHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkVSUk9SIElOSVRcIik7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBpc0F1dGhvcml6ZWQoKXtcclxuICAgICAgICB2YXIgdXNlciA9IGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuY3VycmVudFVzZXIuZ2V0KCk7XHJcbiAgICAgICAgcmV0dXJuIHVzZXIuaGFzR3JhbnRlZFNjb3Blcyh0aGlzLnNjb3BlKTtcclxuICAgIH1cclxuXHJcbiAgICBzaWduSW4oKXtcclxuICAgICAgICBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLnNpZ25JbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHNpZ25PdXQoKXtcclxuICAgICAgICBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLnNpZ25PdXQoKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQXV0aGVudGljYXRlOyIsImNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiQFRoYWVyaW91cy9uaWRnZXRcIikuTmlkZ2V0RWxlbWVudDtcclxuXHJcbmNsYXNzIFZhbHVlVXBhZGF0ZSBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKHZhbHVlKSB7XHJcbiAgICAgICAgc3VwZXIoJ3ZhbHVlLXVwZGF0ZScsXHJcbiAgICAgICAgICAgIHtkZXRhaWwgOiB7dmFsdWUgOiB2YWx1ZX19XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgQ2hlY2tCb3ggZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuICAgIGFzeW5jIGNvbm5lY3RlZENhbGxiYWNrKCl7XHJcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHRvZ2dsZSgpe1xyXG4gICAgICAgIGlmICh0aGlzLmNoZWNrZWQgPT09ICd0cnVlJykgdGhpcy5jaGVja2VkID0gJ2ZhbHNlJztcclxuICAgICAgICBlbHNlIHRoaXMuY2hlY2tlZCA9ICd0cnVlJ1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBjaGVja2VkKCl7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dHJpYnV0ZShDaGVja0JveC5DSEVDS0VEX0FUVFJJQlVURSkpe1xyXG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShDaGVja0JveC5DSEVDS0VEX0FUVFJJQlVURSwgJ2ZhbHNlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShDaGVja0JveC5DSEVDS0VEX0FUVFJJQlVURSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGNoZWNrZWQodmFsdWUpe1xyXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFLCB2YWx1ZSk7XHJcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBWYWx1ZVVwYWRhdGUodmFsdWUpKTtcclxuICAgIH1cclxufVxyXG5cclxuQ2hlY2tCb3guQ0hFQ0tFRF9BVFRSSUJVVEUgPSBcImNoZWNrZWRcIjtcclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnY2hlY2stYm94JywgQ2hlY2tCb3gpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IENoZWNrQm94OyIsImltcG9ydCBNb2RlbCBmcm9tIFwiLi9Nb2RlbC5qc1wiO1xyXG5jb25zdCBET00gPSB7Lyogc2VlIEVkaXRvclBhbmUuY29uc3RydWN0b3IgKi99O1xyXG5cclxuY2xhc3MgTUNBbnN3ZXJDdHJsIHtcclxuICAgIHN0YXRpYyBydW4obW9kZWwsIHNhdmVDQikge1xyXG4gICAgICAgIE1DQW5zd2VyQ3RybC5tb2RlbCAgPSBtb2RlbDtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwuc2F2ZUNCID0gc2F2ZUNCO1xyXG5cclxuICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLnNob3coKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5zZXRUZXh0KGksIG1vZGVsLmFuc3dlcnNbaV0udGV4dCk7XHJcbiAgICAgICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUuc2V0Q2hlY2tlZChpLCBtb2RlbC5hbnN3ZXJzW2ldLmlzVHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNBbnN3ZXJDdHJsLmNsZWFudXApO1xyXG4gICAgICAgIERPTS50cmlhbmdsZUxlZnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIE1DQW5zd2VyQ3RybC5jbGVhbnVwKTtcclxuICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLmFkZEV2ZW50TGlzdGVuZXIoXCJ0ZXh0LXVwZGF0ZVwiLCBNQ0Fuc3dlckN0cmwudGV4dExpc3QpO1xyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUuYWRkRXZlbnRMaXN0ZW5lcihcInZhbHVlLXVwZGF0ZVwiLCBNQ0Fuc3dlckN0cmwudmFsdWVMaXN0KTtcclxuICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLmFkZEV2ZW50TGlzdGVuZXIoXCJidXR0b24tcXVlc3Rpb25cIiwgTUNBbnN3ZXJDdHJsLnF1ZXN0TGlzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHRleHRMaXN0KGV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gcGFyc2VJbnQoZXZlbnQuZGV0YWlsLmluZGV4KTtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwubW9kZWwuYW5zd2Vyc1tpbmRleF0udGV4dCA9IGV2ZW50LmRldGFpbC50ZXh0O1xyXG4gICAgICAgIE1DQW5zd2VyQ3RybC5zYXZlQ0IoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgdmFsdWVMaXN0KGV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gcGFyc2VJbnQoZXZlbnQuZGV0YWlsLmluZGV4KTtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwubW9kZWwuYW5zd2Vyc1tpbmRleF0uaXNUcnVlID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xyXG4gICAgICAgIE1DQW5zd2VyQ3RybC5zYXZlQ0IoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgcXVlc3RMaXN0KGV2ZW50KSB7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLnNhdmVDQigpO1xyXG4gICAgICAgIE1DQW5zd2VyQ3RybC5jbGVhbnVwKCk7XHJcbiAgICAgICAgTUNRdWVzdGlvbkN0cmwucnVuKE1DQW5zd2VyQ3RybC5tb2RlbCwgTUNBbnN3ZXJDdHJsLnNhdmVDQik7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNsZWFudXAoKSB7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5oaWRlKCk7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwidGV4dC11cGRhdGVcIiwgTUNBbnN3ZXJDdHJsLnRleHRMaXN0KTtcclxuICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ2YWx1ZS11cGRhdGVcIiwgTUNBbnN3ZXJDdHJsLnZhbHVlTGlzdCk7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiYnV0dG9uLXF1ZXN0aW9uXCIsIE1DQW5zd2VyQ3RybC5xdWVzdExpc3QpO1xyXG4gICAgICAgIERPTS50cmlhbmdsZVJpZ2h0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBNQ0Fuc3dlckN0cmwuY2xlYW51cCk7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlTGVmdC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNBbnN3ZXJDdHJsLmNsZWFudXApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBNQ1F1ZXN0aW9uQ3RybCB7XHJcbiAgICBzdGF0aWMgcnVuKG1vZGVsLCBzYXZlQ0IpIHtcclxuICAgICAgICBNQ1F1ZXN0aW9uQ3RybC5tb2RlbCAgPSBtb2RlbDtcclxuICAgICAgICBNQ1F1ZXN0aW9uQ3RybC5zYXZlQ0IgPSBzYXZlQ0I7XHJcblxyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuc2V0VGV4dChtb2RlbC5xdWVzdGlvbik7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5zaG93KCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5ib2FyZEJ1dHRvbiA9IGZhbHNlO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuaGlnaGxpZ2h0KCdxdWVzdGlvbicpXHJcblxyXG4gICAgICAgIERPTS50cmlhbmdsZVJpZ2h0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBNQ1F1ZXN0aW9uQ3RybC5jbGVhbnVwKTtcclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBNQ1F1ZXN0aW9uQ3RybC5jbGVhbnVwKTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmFkZEV2ZW50TGlzdGVuZXIoXCJ0ZXh0LXVwZGF0ZVwiLCBNQ1F1ZXN0aW9uQ3RybC50ZXh0TGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKFwiYnV0dG9uLWFuc3dlclwiLCBNQ1F1ZXN0aW9uQ3RybC5hbnN3ZXJMaXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgdGV4dExpc3QoZXZlbnQpIHtcclxuICAgICAgICBNQ1F1ZXN0aW9uQ3RybC5tb2RlbC5xdWVzdGlvbiA9IGV2ZW50LmRldGFpbC50ZXh0O1xyXG4gICAgICAgIE1DUXVlc3Rpb25DdHJsLnNhdmVDQigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhbnN3ZXJMaXN0KCkge1xyXG4gICAgICAgIE1DUXVlc3Rpb25DdHJsLmNsZWFudXAoKTtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwucnVuKE1DUXVlc3Rpb25DdHJsLm1vZGVsLCBNQ1F1ZXN0aW9uQ3RybC5zYXZlQ0IpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjbGVhbnVwKCkge1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuaGlkZSgpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRleHQtdXBkYXRlXCIsIE1DUXVlc3Rpb25DdHJsLnRleHRMaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJidXR0b24tYW5zd2VyXCIsIE1DUXVlc3Rpb25DdHJsLmFuc3dlckxpc3QpO1xyXG4gICAgICAgIERPTS50cmlhbmdsZVJpZ2h0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBNQ1F1ZXN0aW9uQ3RybC5jbGVhbnVwKTtcclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBNQ1F1ZXN0aW9uQ3RybC5jbGVhbnVwKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUXVlc3Rpb25QYW5lQ3RybCB7XHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSBtb2RlbCAtIHRoZSBxdWVzdGlvbiBtb2RlbCBvYmplY3RcclxuICAgICAqIEBwYXJhbSBmaWVsZCAtIHdoaWNoIG1vZGVsIGZpZWxkIHRvIHJlYWQvd3JpdGUgZnJvbSB7J2EnLCAncSd9XHJcbiAgICAgKiBAcGFyYW0gc2F2ZUNCIC0gY2FsbCB0aGlzIG1ldGhvZCB0byBzYXZlIHRoZSBtb2RlbFxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcnVuKGZpZWxkLCBtb2RlbCwgc2F2ZUNCLCBjbG9zZUNCKSB7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5tb2RlbCAgID0gbW9kZWwgPz8gUXVlc3Rpb25QYW5lQ3RybC5tb2RlbDtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLmZpZWxkICAgPSBmaWVsZCA/PyBRdWVzdGlvblBhbmVDdHJsLmZpZWxkO1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwuc2F2ZUNCICA9IHNhdmVDQiA/PyBRdWVzdGlvblBhbmVDdHJsLnNhdmVDQjtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLmNsb3NlQ0IgPSBjbG9zZUNCID8/IFF1ZXN0aW9uUGFuZUN0cmwuY2xvc2VDQjtcclxuXHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5zZXRUZXh0KFF1ZXN0aW9uUGFuZUN0cmwubW9kZWxbUXVlc3Rpb25QYW5lQ3RybC5maWVsZC5zdWJzdHIoMCwgMSldKTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmJvYXJkQnV0dG9uID0gdHJ1ZTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnNob3coKTtcclxuICAgICAgICBET00uZ2FtZUJvYXJkLmhpZGUoKTtcclxuXHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKFwidGV4dC11cGRhdGVcIiwgUXVlc3Rpb25QYW5lQ3RybC50ZXh0TGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKFwiYnV0dG9uLWJvYXJkXCIsIFF1ZXN0aW9uUGFuZUN0cmwuYm9hcmRMaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmFkZEV2ZW50TGlzdGVuZXIoYGJ1dHRvbi1xdWVzdGlvbmAsIFF1ZXN0aW9uUGFuZUN0cmwucXVlc3Rpb25MaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmFkZEV2ZW50TGlzdGVuZXIoYGJ1dHRvbi1hbnN3ZXJgLCBRdWVzdGlvblBhbmVDdHJsLmFuc3dlckxpc3QpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuaGlnaGxpZ2h0KFF1ZXN0aW9uUGFuZUN0cmwuZmllbGQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyB0ZXh0TGlzdChldmVudCkge1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwubW9kZWxbUXVlc3Rpb25QYW5lQ3RybC5maWVsZC5zdWJzdHIoMCwgMSldID0gZXZlbnQuZGV0YWlsLnRleHQ7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5zYXZlQ0IoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYm9hcmRMaXN0KGV2ZW50KSB7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5jbGVhbnVwKCk7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5jbG9zZUNCKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFuc3dlckxpc3QoZXZlbnQpIHtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLmNsZWFudXAoKTtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLnJ1bignYW5zd2VyJyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHF1ZXN0aW9uTGlzdCh2ZW50KSB7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5jbGVhbnVwKCk7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5ydW4oJ3F1ZXN0aW9uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNsZWFudXAoKSB7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwidGV4dC11cGRhdGVcIiwgUXVlc3Rpb25QYW5lQ3RybC50ZXh0TGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiYnV0dG9uLWJvYXJkXCIsIFF1ZXN0aW9uUGFuZUN0cmwuYm9hcmRMaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJidXR0b24tYW5zd2VyXCIsIFF1ZXN0aW9uUGFuZUN0cmwuYW5zd2VyTGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiYnV0dG9uLXF1ZXN0aW9uXCIsIFF1ZXN0aW9uUGFuZUN0cmwucXVlc3Rpb25MaXN0KTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgRWRpdG9yUGFuZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcihtb2RlbCkge1xyXG4gICAgICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuXHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbXVsdGlwbGUtY2hvaWNlLXBhbmVcIik7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlUmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RyaWFuZ2xlLXJpZ2h0XCIpO1xyXG4gICAgICAgIERPTS50cmlhbmdsZUxlZnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RyaWFuZ2xlLWxlZnRcIik7XHJcbiAgICAgICAgRE9NLnJvdW5kTGFiZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JvdW5kLW51bWJlciA+IC50ZXh0XCIpO1xyXG4gICAgICAgIERPTS5nYW1lTmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1uYW1lXCIpO1xyXG4gICAgICAgIERPTS5nYW1lQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtYm9hcmRcIik7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcXVlc3Rpb24tcGFuZVwiKVxyXG4gICAgICAgIERPTS5tZW51SW5jcmVhc2VWYWx1ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS12YWx1ZS1wbHVzXCIpXHJcbiAgICAgICAgRE9NLm1lbnVEZWNyZWFzZVZhbHVlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LXZhbHVlLW1pbnVzXCIpXHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1kb3dubG9hZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwuZ2FtZU1vZGVsLCBudWxsLCAyKTtcclxuICAgICAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtqc29uXSwge3R5cGU6IFwiYXBwbGljYXRpb24vanNvblwifSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xyXG4gICAgICAgICAgICBjb25zdCBhbmNob3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Rvd25sb2FkLWFuY2hvclwiKTtcclxuICAgICAgICAgICAgYW5jaG9yLmhyZWYgPSB1cmw7XHJcbiAgICAgICAgICAgIGFuY2hvci5kb3dubG9hZCA9IHRoaXMubW9kZWwubmFtZTtcclxuICAgICAgICAgICAgYW5jaG9yLmNsaWNrKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1yZW1vdmUtcm91bmRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5yZW1vdmVSb3VuZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRyaWFuZ2xlVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LWhvbWUtc2NyZWVuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBcImhvbWUuaHRtbFwiO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBET00ubWVudUluY3JlYXNlVmFsdWUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5pbmNyZWFzZVZhbHVlKCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBET00ubWVudURlY3JlYXNlVmFsdWUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5kZWNyZWFzZVZhbHVlKCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmluY3JlbWVudFJvdW5kKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuZGVjcmVtZW50Um91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIERPTS5nYW1lTmFtZS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVOYW1lKCk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtYm9hcmQtY29udGFpbmVyXCIpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LWFkZC1jYXRlZ29yeVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmFkZENhdGVnb3J5Um91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1hZGQtbXVsdGlwbGUtY2hvaWNlXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuYWRkTXVsdGlwbGVDaG9pY2VSb3VuZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZS1ib2FyZCBjaGFuZ2UgY2F0ZWdvcnkgdGV4dFxyXG4gICAgICAgIERPTS5nYW1lQm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImhlYWRlci11cGRhdGVcIiwgZXZlbnQgPT4ge1xyXG4gICAgICAgICAgICBsZXQgY29sID0gZXZlbnQuZGV0YWlsLmNvbDtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5nZXRDb2x1bW4oY29sKS5jYXRlZ29yeSA9IGV2ZW50LmRldGFpbC52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5nZXRDb2x1bW4oY29sKS5mb250U2l6ZSA9IGV2ZW50LmRldGFpbC5mb250U2l6ZTtcclxuICAgICAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gZ2FtZS1ib2FyZCBzZWxlY3QgY2VsbFxyXG4gICAgICAgIERPTS5nYW1lQm9hcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNlbGwtc2VsZWN0XCIsIGV2ZW50ID0+IHtcclxuICAgICAgICAgICAgbGV0IHJvdyA9IGV2ZW50LmRldGFpbC5yb3c7XHJcbiAgICAgICAgICAgIGxldCBjb2wgPSBldmVudC5kZXRhaWwuY29sO1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVOYXZpZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBRdWVzdGlvblBhbmVDdHJsLnJ1bihcclxuICAgICAgICAgICAgICAgICdxdWVzdGlvbicsXHJcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGVsLmdldENlbGwocm93LCBjb2wpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gdGhpcy5vblNhdmUoKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHRoaXMudXBkYXRlVmlldygpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uU2F2ZSgpIHtcclxuICAgICAgICAvLyBvdmVycmlkZSBtZVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZU5hbWUoKSB7XHJcbiAgICAgICAgLy8gb3ZlcnJpZGUgbWVcclxuICAgIH1cclxuXHJcbiAgICBoaWRlTmF2aWdhdGlvbigpIHtcclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlUmlnaHQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVWaWV3KG1vZGVsKSB7XHJcbiAgICAgICAgbW9kZWwgPSBtb2RlbCA/PyB0aGlzLm1vZGVsO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVHJpYW5nbGVWaWV3KCk7XHJcblxyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuaGlkZSgpO1xyXG4gICAgICAgIERPTS5nYW1lQm9hcmQuaGlkZSgpO1xyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUuaGlkZSgpO1xyXG5cclxuICAgICAgICBpZiAobW9kZWwuZ2V0Um91bmQoKS50eXBlID09PSBNb2RlbC5xdWVzdGlvblR5cGUuQ0FURUdPUlkpIHRoaXMuY2F0ZWdvcnlWaWV3KG1vZGVsKTtcclxuICAgICAgICBpZiAobW9kZWwuZ2V0Um91bmQoKS50eXBlID09PSBNb2RlbC5xdWVzdGlvblR5cGUuTVVMVElQTEVfQ0hPSUNFKSB0aGlzLm11bHRpcGxlQ2hvaWNlVmlldyhtb2RlbCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlVHJpYW5nbGVWaWV3KCkge1xyXG4gICAgICAgIERPTS50cmlhbmdsZUxlZnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRSb3VuZCA9PT0gMCkgRE9NLnRyaWFuZ2xlTGVmdC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRSb3VuZCA+PSB0aGlzLm1vZGVsLnJvdW5kQ291bnQgLSAxKSBET00udHJpYW5nbGVSaWdodC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIERPTS5yb3VuZExhYmVsLnRleHRDb250ZW50ID0gXCJSb3VuZCBcIiArICh0aGlzLm1vZGVsLmN1cnJlbnRSb3VuZCArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIG11bHRpcGxlQ2hvaWNlVmlldyhtb2RlbCkge1xyXG4gICAgICAgIERPTS5tZW51RGVjcmVhc2VWYWx1ZS5oaWRlKCk7XHJcbiAgICAgICAgRE9NLm1lbnVJbmNyZWFzZVZhbHVlLmhpZGUoKTtcclxuXHJcbiAgICAgICAgTUNRdWVzdGlvbkN0cmwucnVuKFxyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmdldFJvdW5kKCksXHJcbiAgICAgICAgICAgICgpID0+IHRoaXMub25TYXZlKClcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIGNhdGVnb3J5Vmlldyhtb2RlbCkge1xyXG4gICAgICAgIERPTS5tZW51RGVjcmVhc2VWYWx1ZS5zaG93KCk7XHJcbiAgICAgICAgRE9NLm1lbnVJbmNyZWFzZVZhbHVlLnNob3coKTtcclxuICAgICAgICBET00uZ2FtZUJvYXJkLnNob3coKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgNjsgY29sKyspIHtcclxuICAgICAgICAgICAgbGV0IGNvbHVtbiA9IG1vZGVsLmdldENvbHVtbihjb2wpO1xyXG5cclxuICAgICAgICAgICAgRE9NLmdhbWVCb2FyZC5nZXRIZWFkZXIoY29sKS5maXRUZXh0LmxvY2sgPSBcInZoXCI7XHJcbiAgICAgICAgICAgIERPTS5nYW1lQm9hcmQuc2V0SGVhZGVyKGNvbCwgY29sdW1uLmNhdGVnb3J5LCBjb2x1bW4uZm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgNTsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIERPTS5nYW1lQm9hcmQuc2V0Q2VsbChyb3csIGNvbCwgY29sdW1uLmNlbGxbcm93XS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29sdW1uLmNlbGxbcm93XS5xID09PSBcIlwiKSBET00uZ2FtZUJvYXJkLnNldENvbXBsZXRlKHJvdywgY29sLCBcImZhbHNlXCIpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY29sdW1uLmNlbGxbcm93XS5hID09PSBcIlwiKSBET00uZ2FtZUJvYXJkLnNldENvbXBsZXRlKHJvdywgY29sLCBcInBhcnRpYWxcIik7XHJcbiAgICAgICAgICAgICAgICBlbHNlIERPTS5nYW1lQm9hcmQuc2V0Q29tcGxldGUocm93LCBjb2wsIFwidHJ1ZVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3JQYW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG4vLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZHJpdmUvYXBpL3YzL3F1aWNrc3RhcnQvanM/aGw9ZW5cclxuXHJcbmNsYXNzIEZpbGVPcHMge1xyXG5cclxuICAgIGFzeW5jIGxvYWQoKXtcclxuICAgICAgICBhd2FpdCB0aGlzLmxvYWRDbGllbnQoKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmxvYWREcml2ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDbGllbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZ2FwaS5sb2FkKCdjbGllbnQnLCAoKSA9PiByZXNvbHZlKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWREcml2ZSgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5sb2FkKCdkcml2ZScsICd2MycsIHJlc29sdmUoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgY3JlYXRlKCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgICAgbmFtZSA6IEZpbGVPcHMuZmlsZW5hbWUsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRzOiBbJ2FwcERhdGFGb2xkZXInXSxcclxuICAgICAgICAgICAgICAgIGZpZWxkczogXCJpZFwiXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy5yZXN1bHQuaWQpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGRlbGV0ZShmaWxlSWQpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuZGVsZXRlKHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZCA6IGZpbGVJZFxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0KTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGxpc3QoKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmxpc3Qoe1xyXG4gICAgICAgICAgICAgICAgLy8gcTogYG5hbWUgY29udGFpbnMgJy5qc29uJ2AsXHJcbiAgICAgICAgICAgICAgICBzcGFjZXM6ICdhcHBEYXRhRm9sZGVyJyxcclxuICAgICAgICAgICAgICAgIGZpZWxkczogJ2ZpbGVzL25hbWUsZmlsZXMvaWQsZmlsZXMvbW9kaWZpZWRUaW1lJ1xyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0LmZpbGVzKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXQoZmlsZUlkKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmdldCh7XHJcbiAgICAgICAgICAgICAgICBmaWxlSWQ6IGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIGFsdDogJ21lZGlhJ1xyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgc2V0Qm9keShmaWxlSWQsIGJvZHkpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQucmVxdWVzdCh7XHJcbiAgICAgICAgICAgICAgICBwYXRoIDogXCJ1cGxvYWQvZHJpdmUvdjMvZmlsZXMvXCIgKyBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICBtZXRob2QgOiBcIlBBVENIXCIsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXMgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkVHlwZSA6IFwibWVkaWFcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnMgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIiA6IFwiYXBwbGljYXRpb24vanNvblwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYm9keSA6IGJvZHlcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXMuYm9keSkpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVuYW1lKGZpbGVJZCwgZmlsZW5hbWUpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZDogZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogZmlsZW5hbWVcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXMuYm9keSkpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkZpbGVPcHMuZmlsZW5hbWUgPSBcIkdhbWUgTmFtZS5qc29uXCI7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBGaWxlT3BzOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqIFZpZXctQ29udHJvbGxlciBmb3IgdGhlIEhUTUwgZ2FtZSBib2FyZCBlbGVtZW50XHJcbiAgICBUaGlzIGlzIHRoZSBjbGFzc2ljYWwgXCJKZW9wYXJkeVwiIHR5cGUgYm9hcmRcclxuICAgIFRoaXMgaXMgbW9kZWwgYWdub3N0aWMsIHNlZSBFZGl0b3JQYW5lLmpzIGZvciBtb2RlbCBtZXRob2RzXHJcbiAgICBnZW5lcmF0ZXMgdGhlIGZvbGxvd2luZyBldmVudHM6XHJcbiAgICAgICAgY2VsbC1zZWxlY3QgKHJvdywgY29sKTogd2hlbiBhIHVzZXIgY2xpY2tzIGEgY2VsbFxyXG4gICAgICAgIGhlYWRlci11cGRhdGUgKHZhbHVlLCBjb2wsIGZvbnRzaXplKSA6IHdoZW4gdGhlIGhlYWRlciB0ZXh0IGNoYW5nZXMgKGFuZCBibHVycylcclxuICoqL1xyXG5cclxuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCJAVGhhZXJpb3VzL25pZGdldFwiKS5OaWRnZXRFbGVtZW50O1xyXG5cclxuY2xhc3MgQ2VsbFNlbGVjdEV2ZW50IGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3Iocm93LCBjb2wpIHtcclxuICAgICAgICBzdXBlcignY2VsbC1zZWxlY3QnLFxyXG4gICAgICAgICAgICAgIHtkZXRhaWwgOiB7cm93IDogcm93LCBjb2wgOiBjb2wgfX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBIZWFkZXJVcGRhdGVFdmVudCBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKGNvbCwgdmFsdWUsIGZvbnRTaXplKSB7XHJcbiAgICAgICAgc3VwZXIoJ2hlYWRlci11cGRhdGUnLFxyXG4gICAgICAgICAgICB7ZGV0YWlsIDoge3ZhbHVlIDogdmFsdWUsIGNvbCA6IGNvbCwgZm9udFNpemUgOiBmb250U2l6ZX19XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgR2FtZUJvYXJkIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlYWR5KCl7XHJcbiAgICAgICAgYXdhaXQgc3VwZXIucmVhZHkoKTtcclxuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCA2OyBjb2wrKykge1xyXG4gICAgICAgICAgICB0aGlzLmdldEhlYWRlcihjb2wpLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXZlbnQpPT5ldmVudC50YXJnZXQuZml0VGV4dC5ub3RpZnkoMSwgMSkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZXRIZWFkZXIoY29sKS5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCAoZXZlbnQpPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgZm9udFNpemUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShldmVudC50YXJnZXQpW1wiZm9udC1zaXplXCJdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBIZWFkZXJVcGRhdGVFdmVudChjb2wsIGV2ZW50LnRhcmdldC50ZXh0LCBmb250U2l6ZSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IDU7IHJvdysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldENlbGwocm93LCBjb2wpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDZWxsU2VsZWN0RXZlbnQocm93LCBjb2wpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSB2YWx1ZSBvZiBhIGNhdGVnb3J5XHJcbiAgICAgKiBAcGFyYW0gaW5kZXhcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIHNldEhlYWRlcihpbmRleCwgdmFsdWUsIGZvbnRTaXplKXtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuZ2V0SGVhZGVyKGluZGV4KTtcclxuICAgICAgICBlbGVtZW50LnRleHQgPSB2YWx1ZTtcclxuICAgICAgICBpZiAoZm9udFNpemUpIGVsZW1lbnQuc3R5bGVbXCJmb250LXNpemVcIl0gPSBmb250U2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlIHRoZSBoZWFkZXIgaHRtbCBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gaW5kZXhcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBnZXRIZWFkZXIoaW5kZXgpe1xyXG4gICAgICAgIGlmICh0eXBlb2YgaW5kZXggIT09IFwibnVtYmVyXCIgfHwgaW5kZXggPCAwIHx8IGluZGV4ID4gNikgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbmRleDogXCIgKyBpbmRleCk7XHJcbiAgICAgICAgbGV0IHNlbGVjdG9yID0gYFtkYXRhLXJvdz0naCddW2RhdGEtY29sPScke2luZGV4fSddID4gLnZhbHVlYDtcclxuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgdmFsdWUgb2YgYSBub24tY2F0ZWdvcnkgY2VsbC5cclxuICAgICAqIEBwYXJhbSByb3dcclxuICAgICAqIEBwYXJhbSBjb2xcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBzZXRDZWxsKHJvdywgY29sLCB2YWx1ZSA9IFwiXCIpe1xyXG4gICAgICAgIHRoaXMuZ2V0Q2VsbChyb3csIGNvbCkudGV4dENvbnRlbnQgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDZWxsKHJvdywgY29sKXtcclxuICAgICAgICBsZXQgc2VsZWN0b3IgPSBgW2RhdGEtcm93PVwiJHtyb3d9XCJdW2RhdGEtY29sPVwiJHtjb2x9XCJdID4gLnZhbHVlYDtcclxuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDb21wbGV0ZShyb3csIGNvbCwgdmFsdWUpe1xyXG4gICAgICAgIGlmICh0eXBlb2Ygcm93ICE9PSBcIm51bWJlclwiIHx8IHJvdyA8IDAgfHwgcm93ID4gNikgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCByb3c6IFwiICsgcm93KTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbCAhPT0gXCJudW1iZXJcIiB8fCBjb2wgPCAwIHx8IGNvbCA+IDUpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgY29sOiBcIiArIGNvbCk7XHJcbiAgICAgICAgdGhpcy5nZXRDZWxsKHJvdywgY29sKS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWNvbXBsZXRlXCIsIHZhbHVlKTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZ2FtZS1ib2FyZCcsIEdhbWVCb2FyZCk7XHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZUJvYXJkOyIsImNsYXNzIE1lbnV7XHJcbiAgICBpbml0KG1lbnVTZWxlY3Rvcil7XHJcbiAgICAgICAgdGhpcy5tZW51U2VsZWN0b3IgPSBtZW51U2VsZWN0b3I7XHJcbiAgICAgICAgdGhpcy5tZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy50b2dnbGVNZW51KCkpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb25NZW51KCk7XHJcblxyXG4gICAgICAgIHRoaXMubWVudUFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCk9PiB0aGlzLm1vdXNlTGVhdmUoKSk7XHJcbiAgICAgICAgdGhpcy5tZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpPT4gdGhpcy5tb3VzZUxlYXZlKCkpO1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCk9PiB0aGlzLm1vdXNlRW50ZXIoKSk7XHJcbiAgICAgICAgdGhpcy5tZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpPT4gdGhpcy5tb3VzZUVudGVyKCkpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtYXV0b2Nsb3NlPSd0cnVlJ1wiKS5mb3JFYWNoKChlbGUpPT4ge1xyXG4gICAgICAgICAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLmNsb3NlKCkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnN1Yi1tZW51XCIpLmZvckVhY2goKGVsZSk9PntcclxuICAgICAgICAgICAgZWxlLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1sYWJlbFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTWVudShlbGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoKXtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc3ViLW1lbnUgPiAubWVudS1hcmVhXCIpLmZvckVhY2goKGVsZSk9PntcclxuICAgICAgICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb3Blbigpe1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uTWVudSgpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlTGVhdmUoKXtcclxuICAgICAgICBpZiAodGhpcy50aW1lb3V0KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgfSwgNTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZUVudGVyKCl7XHJcbiAgICAgICAgaWYgKCF0aGlzLnRpbWVvdXQpIHJldHVybjtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgICB0aGlzLnRpbWVvdXQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRvZ2dsZU1lbnUoZWxlbWVudCl7XHJcbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQgPz8gdGhpcy5tZW51QXJlYTtcclxuICAgICAgICBpZiAoIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWVudS1hcmVhXCIpKXtcclxuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tZW51LWFyZWFcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJoaWRkZW5cIikpe1xyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWVudS1hcmVhXCIpKXtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudS1hcmVhXCIpLmZvckVhY2goXHJcbiAgICAgICAgICAgICAgICAoZWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBvc2l0aW9uTWVudSgpe1xyXG4gICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLm1lbnVCdXR0b24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgICAgICBjb25zdCBiV2lkdGggPSB0aGlzLm1lbnVCdXR0b24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XHJcbiAgICAgICAgY29uc3QgbVdpZHRoID0gdGhpcy5tZW51QXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuICAgICAgICBpZiAoKGxlZnQgKyBiV2lkdGggKyBtV2lkdGggKyAyKSA+IHdpbmRvdy5pbm5lcldpZHRoKXtcclxuICAgICAgICAgICAgdGhpcy5zZXRNZW51TGVmdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TWVudVJpZ2h0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldE1lbnVMZWZ0KCl7XHJcbiAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMubWVudUJ1dHRvbi5vZmZzZXRMZWZ0O1xyXG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5tZW51QXJlYS5vZmZzZXRXaWR0aDtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLnN0eWxlLmxlZnQgPSAobGVmdCAtIHdpZHRoIC0gMikgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWVudVJpZ2h0KCl7XHJcbiAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMubWVudUJ1dHRvbi5vZmZzZXRMZWZ0O1xyXG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5tZW51QnV0dG9uLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuc3R5bGUubGVmdCA9IChsZWZ0ICsgd2lkdGggKyAyKSArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWVudSgpe1xyXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMubWVudVNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWVudUJ1dHRvbigpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1lbnUucXVlcnlTZWxlY3RvcihcIi5tZW51LWljb25cIik7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG1lbnVBcmVhKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWVudS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYXJlYVwiKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51OyIsImNsYXNzIE1vZGVsIHtcclxuICAgIGluaXQobmFtZSA9IFwiR2FtZSBOYW1lXCIpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsID0ge1xyXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICByb3VuZHM6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDYXRlZ29yeVJvdW5kKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IG5hbWUoc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwubmFtZSA9IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbmFtZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWwubmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQoZ2FtZU1vZGVsKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQgPSAwO1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsID0gZ2FtZU1vZGVsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Um91bmQoaW5kZXgpIHtcclxuICAgICAgICBpbmRleCA9IGluZGV4ID8/IHRoaXMuY3VycmVudFJvdW5kO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5yb3VuZHNbaW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbHVtbihpbmRleCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvdW5kKCkuY29sdW1uW2luZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDZWxsKHJvdywgY29sdW1uKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29sdW1uKGNvbHVtbikuY2VsbFtyb3ddO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZVJvdW5kKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnJvdW5kQ291bnQgPT09IDEpIHJldHVybjtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5yb3VuZHMuc3BsaWNlKHRoaXMuY3VycmVudFJvdW5kLCAxKTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um91bmQgPj0gdGhpcy5yb3VuZENvdW50KSB0aGlzLmN1cnJlbnRSb3VuZCA9IHRoaXMucm91bmRDb3VudCAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkTXVsdGlwbGVDaG9pY2VSb3VuZCgpe1xyXG4gICAgICAgIGxldCByb3VuZCA9IHtcclxuICAgICAgICAgICAgdHlwZTogTW9kZWwucXVlc3Rpb25UeXBlLk1VTFRJUExFX0NIT0lDRSxcclxuICAgICAgICAgICAgcXVlc3Rpb24gOiBcIlwiLFxyXG4gICAgICAgICAgICBhbnN3ZXJzIDogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKyl7XHJcbiAgICAgICAgICAgIHJvdW5kLmFuc3dlcnNbaV0gPSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0IDogXCJcIixcclxuICAgICAgICAgICAgICAgIGlzVHJ1ZSA6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5wdXNoKHJvdW5kKTtcclxuICAgICAgICByZXR1cm4gcm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkQ2F0ZWdvcnlSb3VuZCgpIHtcclxuICAgICAgICBsZXQgcm91bmQgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IE1vZGVsLnF1ZXN0aW9uVHlwZS5DQVRFR09SWSxcclxuICAgICAgICAgICAgY29sdW1uOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXSA9IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgY2VsbDogW11cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXS5jZWxsW2pdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAoaiArIDEpICogMTAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHE6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYTogXCJcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5yb3VuZHMucHVzaChyb3VuZCk7XHJcbiAgICAgICAgcmV0dXJuIHJvdW5kO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCByb3VuZENvdW50KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5yb3VuZHMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIGluY3JlbWVudFJvdW5kKCl7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQrKztcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um91bmQgPj0gdGhpcy5yb3VuZENvdW50KSB0aGlzLmN1cnJlbnRSb3VuZCA9IHRoaXMucm91bmRDb3VudCAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgZGVjcmVtZW50Um91bmQoKXtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZC0tO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3VuZCA8IDApIHRoaXMuY3VycmVudFJvdW5kID0gMFxyXG4gICAgfVxyXG5cclxuICAgIGluY3JlYXNlVmFsdWUoKSB7XHJcbiAgICAgICAgbGV0IHJvdW5kID0gdGhpcy5nZXRSb3VuZCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldLmNlbGxbal0udmFsdWUgKj0gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWNyZWFzZVZhbHVlKCkge1xyXG4gICAgICAgIGxldCByb3VuZCA9IHRoaXMuZ2V0Um91bmQoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXS5jZWxsW2pdLnZhbHVlIC89IDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbk1vZGVsLnF1ZXN0aW9uVHlwZSA9IHtcclxuICAgIENBVEVHT1JZIDogXCJjaG9pY2VcIixcclxuICAgIE1VTFRJUExFX0NIT0lDRSA6IFwibXVsdGlwbGVfY2hvaWNlXCJcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vZGVsOyIsImNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiQFRoYWVyaW91cy9uaWRnZXRcIikuTmlkZ2V0RWxlbWVudDtcclxucmVxdWlyZShcIi4vQ2hlY2tCb3guanNcIik7XHJcblxyXG5jbGFzcyBUZXh0VXBkYXRlIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoaW5kZXgsIHRleHQpIHtcclxuICAgICAgICBzdXBlcigndGV4dC11cGRhdGUnLFxyXG4gICAgICAgICAgICB7ZGV0YWlsIDoge2luZGV4IDogaW5kZXgsIHRleHQgOiB0ZXh0fX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBWYWx1ZVVwZGF0ZSBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKGluZGV4LCB2YWx1ZSkge1xyXG4gICAgICAgIHN1cGVyKCd2YWx1ZS11cGRhdGUnLFxyXG4gICAgICAgICAgICB7ZGV0YWlsIDoge2luZGV4IDogaW5kZXgsIHZhbHVlIDogdmFsdWV9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFF1ZXN0aW9uQ2xpY2sgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcignYnV0dG9uLXF1ZXN0aW9uJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE11bHRpcGxlQ2hvaWNlUGFuZSBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG5cclxuICAgIHNldE1vZGVsKG1vZGVsKXtcclxuICAgICAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVhZHkoKXtcclxuICAgICAgICBhd2FpdCBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKFwiLmFuc3dlciA+IG5pZGdldC10ZXh0XCIpKXtcclxuICAgICAgICAgICAgZWxlbWVudC5maXRUZXh0LmxvY2sgPSBcInZoXCI7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChldmVudCk9PnRoaXMudHh0TGlzdGVuZXIoZXZlbnQpKTtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCAoZXZlbnQpPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1pbmRleFwiKTtcclxuICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gdGhpcy5xdWVyeVNlbGVjdG9yKGBuaWRnZXQtdGV4dFtkYXRhLWluZGV4PVwiJHtpbmRleH1cIl1gKS50ZXh0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBUZXh0VXBkYXRlKGluZGV4LCB0ZXh0KSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMucXVlcnlTZWxlY3RvckFsbChcImNoZWNrLWJveFwiKSl7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInZhbHVlLXVwZGF0ZVwiLCAoZXZlbnQpPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShldmVudC50YXJnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLWluZGV4XCIpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBWYWx1ZVVwZGF0ZShpbmRleCwgdmFsdWUpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1xdWVzdGlvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBRdWVzdGlvbkNsaWNrKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHR4dExpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxMyl7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZXZlbnQudGFyZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1pbmRleFwiKTtcclxuICAgICAgICAgICAgaW5kZXggPSBwYXJzZUludChpbmRleCk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA+PSA1KXtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5ibHVyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBgbmlkZ2V0LXRleHRbZGF0YS1pbmRleD1cIiR7aW5kZXggKyAxfVwiXWA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXZlbnQudGFyZ2V0LmZpdFRleHQubm90aWZ5KDEsIDEpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIGJ1dHRvbiB7J3F1ZXN0aW9uJywgJ2Fuc3dlcid9XHJcbiAgICAgKi9cclxuICAgIGhpZ2hsaWdodChidXR0b24pe1xyXG4gICAgICAgIGZvciAobGV0IGVsZSBvZiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoYC5zZWxlY3RlZGApKSBlbGUuY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihgI3Nob3ctJHtidXR0b259YCkuY2xhc3NMaXN0LmFkZChcInNlbGVjdGVkXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRleHQoaW5kZXgsIHRleHQpe1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihgbmlkZ2V0LXRleHRbZGF0YS1pbmRleD1cIiR7aW5kZXh9XCJdYCkudGV4dCA9IHRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q2hlY2tlZChpbmRleCwgdmFsdWUpe1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihgY2hlY2stYm94W2RhdGEtaW5kZXg9XCIke2luZGV4fVwiXWApLmNoZWNrZWQgPSB2YWx1ZTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbXVsdGlwbGUtY2hvaWNlLXBhbmUnLCBNdWx0aXBsZUNob2ljZVBhbmUpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE11bHRpcGxlQ2hvaWNlUGFuZTsiLCJjb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcblxyXG5jbGFzcyBUZXh0VXBkYXRlIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IodGV4dCkge1xyXG4gICAgICAgIHN1cGVyKCd0ZXh0LXVwZGF0ZScsXHJcbiAgICAgICAgICAgIHtkZXRhaWwgOiB7dGV4dCA6IHRleHR9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEJvYXJkQ2xpY2sgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcignYnV0dG9uLWJvYXJkJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFF1ZXN0aW9uQ2xpY2sgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcignYnV0dG9uLXF1ZXN0aW9uJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEFuc3dlckNsaWNrIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoJ2J1dHRvbi1hbnN3ZXInKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUXVlc3Rpb25QYW5lIGV4dGVuZHMgTmlkZ2V0RWxlbWVudHtcclxuXHJcbiAgICBhc3luYyByZWFkeSgpe1xyXG4gICAgICAgIGF3YWl0IHN1cGVyLnJlYWR5KCk7XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LWJvYXJkXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEJvYXJkQ2xpY2soKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LXF1ZXN0aW9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFF1ZXN0aW9uQ2xpY2soKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LWFuc3dlclwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBBbnN3ZXJDbGljaygpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpLmZvY3VzKCkpO1xyXG5cclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjdGV4dC1jb250ZW50c1wiKS5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCBhc3luYyAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpLnRleHQ7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgVGV4dFVwZGF0ZSh0ZXh0LnRyaW0oKSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyKCl7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiLnRleHQtY29udGVudHNcIikudGV4dCA9IFwiXCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGV4dCh0ZXh0KXtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dC1jb250ZW50c1wiKS50ZXh0ID0gdGV4dDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSBidXR0b24geydxdWVzdGlvbicsICdhbnN3ZXInfVxyXG4gICAgICovXHJcbiAgICBoaWdobGlnaHQoYnV0dG9uKXtcclxuICAgICAgICBmb3IgKGxldCBlbGUgb2YgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKGAuc2VsZWN0ZWRgKSkgZWxlLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoYCNzaG93LSR7YnV0dG9ufWApLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgYm9hcmRCdXR0b24odmFsdWUpe1xyXG4gICAgICAgIGlmICh2YWx1ZSl7XHJcbiAgICAgICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LWJvYXJkXCIpLnNob3coKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctYm9hcmRcIikuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgncXVlc3Rpb24tcGFuZScsIFF1ZXN0aW9uUGFuZSk7XHJcbm1vZHVsZS5leHBvcnRzID0gUXVlc3Rpb25QYW5lO1xyXG5cclxuXHJcblxyXG4iLCJcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAvLyBUaGUgQnJvd3NlciBBUEkga2V5IG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS5cclxuICAgIGRldmVsb3BlcktleSA6ICdBSXphU3lBQmNkTG1UNkhIXzdHbzgycV9JQkdJM2ptNlVMNHc0UTAnLFxyXG5cclxuICAgIC8vIFRoZSBDbGllbnQgSUQgb2J0YWluZWQgZnJvbSB0aGUgR29vZ2xlIEFQSSBDb25zb2xlLiBSZXBsYWNlIHdpdGggeW91ciBvd24gQ2xpZW50IElELlxyXG4gICAgY2xpZW50SWQgOiBcIjE1ODgyMzEzNDY4MS05OGJna2FuZ29sdGs2MzZ1a2Y4cG9mZWlzN3BhN2piay5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwiLFxyXG5cclxuICAgIC8vIFJlcGxhY2Ugd2l0aCB5b3VyIG93biBwcm9qZWN0IG51bWJlciBmcm9tIGNvbnNvbGUuZGV2ZWxvcGVycy5nb29nbGUuY29tLlxyXG4gICAgYXBwSWQgOiBcIjE1ODgyMzEzNDY4MVwiLFxyXG5cclxuICAgIC8vIEFycmF5IG9mIEFQSSBkaXNjb3ZlcnkgZG9jIFVSTHMgZm9yIEFQSXMgdXNlZCBieSB0aGUgcXVpY2tzdGFydFxyXG4gICAgZGlzY292ZXJ5RG9jcyA6IFtcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Rpc2NvdmVyeS92MS9hcGlzL2RyaXZlL3YzL3Jlc3RcIl0sXHJcblxyXG4gICAgLy8gU2NvcGUgdG8gdXNlIHRvIGFjY2VzcyB1c2VyJ3MgRHJpdmUgaXRlbXMuXHJcbiAgICBzY29wZTogXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLmZpbGVcIlxyXG59Il19