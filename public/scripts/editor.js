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
"use strict";

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var FileOps = require("./modules/FileOps.js");

var Authenticate = require("./modules/Authenticate.js");

var Menu = require("./modules/Menu.js");

var QuestionPane = require("./modules/QuestionPane.js");

var EditorPane = require("./modules/EditorPane.js");

var Model = require("./modules/Model");

var Nidget = require("@thaerious/nidget");

require("./modules/GameBoard.js");

require("./modules/MultipleChoicePane.js");

require("./modules/CheckBox.js");

var fileOps = new FileOps();
var model = null;
var questionPane = null;
var editorPane = null;
window.onload = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  return regeneratorRuntime.wrap(function _callee$(_context) {
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
  _setup = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var start, file, model, end, time;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
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
            new Menu().init("#menu");
            _context2.prev = 11;
            _context2.next = 14;
            return new Authenticate().loadClient();

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
            model = new Model(fileOps).set(JSON.parse(file.body));
            window.model = model;
            document.querySelector("#game-name").textContent = model.name;
            editorPane = new EditorPane(model);
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

},{"./modules/Authenticate.js":24,"./modules/CheckBox.js":25,"./modules/EditorPane.js":26,"./modules/FileOps.js":27,"./modules/GameBoard.js":28,"./modules/Menu.js":29,"./modules/Model":30,"./modules/MultipleChoicePane.js":31,"./modules/QuestionPane.js":32,"@thaerious/nidget":22}],24:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// see https://developers.google.com/drive/api/v3/quickstart/js?hl=en
var Authenticate = /*#__PURE__*/function () {
  function Authenticate() {
    _classCallCheck(this, Authenticate);

    Object.assign(this, require("./googleFields.js"));
  }

  _createClass(Authenticate, [{
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

},{"./googleFields.js":33}],25:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var NidgetElement = require("@Thaerious/nidget").NidgetElement;

var ValueUpadate = /*#__PURE__*/function (_CustomEvent) {
  _inherits(ValueUpadate, _CustomEvent);

  var _super = _createSuper(ValueUpadate);

  function ValueUpadate(value) {
    _classCallCheck(this, ValueUpadate);

    return _super.call(this, 'value-update', {
      detail: {
        value: value
      }
    });
  }

  return ValueUpadate;
}( /*#__PURE__*/_wrapNativeSuper(CustomEvent));

var CheckBox = /*#__PURE__*/function (_NidgetElement) {
  _inherits(CheckBox, _NidgetElement);

  var _super2 = _createSuper(CheckBox);

  function CheckBox() {
    _classCallCheck(this, CheckBox);

    return _super2.apply(this, arguments);
  }

  _createClass(CheckBox, [{
    key: "connectedCallback",
    value: function () {
      var _connectedCallback = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this = this;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _get(_getPrototypeOf(CheckBox.prototype), "connectedCallback", this).call(this);

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

},{"@Thaerious/nidget":22}],26:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Model = require("./Model.js");

var DOM = {
  /* see EditorPane.constructor */
};

var MCAnswerCtrl = /*#__PURE__*/function () {
  function MCAnswerCtrl() {
    _classCallCheck(this, MCAnswerCtrl);
  }

  _createClass(MCAnswerCtrl, null, [{
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
    _classCallCheck(this, MCQuestionCtrl);
  }

  _createClass(MCQuestionCtrl, null, [{
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
    _classCallCheck(this, QuestionPaneCtrl);
  }

  _createClass(QuestionPaneCtrl, null, [{
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

    _classCallCheck(this, EditorPane);

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

  _createClass(EditorPane, [{
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
      if (model.getRound().type === Model.questionType.CATEGORY) this.categoryView(model);
      if (model.getRound().type === Model.questionType.MULTIPLE_CHOICE) this.multipleChoiceView(model);
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

},{"./Model.js":30}],27:[function(require,module,exports){
"use strict"; // see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var FileOps = /*#__PURE__*/function () {
  function FileOps() {
    _classCallCheck(this, FileOps);
  }

  _createClass(FileOps, [{
    key: "load",
    value: function () {
      var _load = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
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
      var _create = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
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
      var _delete2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(fileId) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
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
      var _list = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
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
      var _get = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(fileId) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
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
      var _setBody = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(fileId, body) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
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
      var _rename = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(fileId, filename) {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
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

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var NidgetElement = require("@Thaerious/nidget").NidgetElement;

var CellSelectEvent = /*#__PURE__*/function (_CustomEvent) {
  _inherits(CellSelectEvent, _CustomEvent);

  var _super = _createSuper(CellSelectEvent);

  function CellSelectEvent(row, col) {
    _classCallCheck(this, CellSelectEvent);

    return _super.call(this, 'cell-select', {
      detail: {
        row: row,
        col: col
      }
    });
  }

  return CellSelectEvent;
}( /*#__PURE__*/_wrapNativeSuper(CustomEvent));

var HeaderUpdateEvent = /*#__PURE__*/function (_CustomEvent2) {
  _inherits(HeaderUpdateEvent, _CustomEvent2);

  var _super2 = _createSuper(HeaderUpdateEvent);

  function HeaderUpdateEvent(col, value, fontSize) {
    _classCallCheck(this, HeaderUpdateEvent);

    return _super2.call(this, 'header-update', {
      detail: {
        value: value,
        col: col,
        fontSize: fontSize
      }
    });
  }

  return HeaderUpdateEvent;
}( /*#__PURE__*/_wrapNativeSuper(CustomEvent));

var GameBoard = /*#__PURE__*/function (_NidgetElement) {
  _inherits(GameBoard, _NidgetElement);

  var _super3 = _createSuper(GameBoard);

  function GameBoard() {
    _classCallCheck(this, GameBoard);

    return _super3.call(this);
  }

  _createClass(GameBoard, [{
    key: "ready",
    value: function () {
      var _ready = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this = this;

        var _loop, col;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _get(_getPrototypeOf(GameBoard.prototype), "ready", this).call(this);

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

},{"@Thaerious/nidget":22}],29:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Menu = /*#__PURE__*/function () {
  function Menu() {
    _classCallCheck(this, Menu);
  }

  _createClass(Menu, [{
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

},{}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Model = /*#__PURE__*/function () {
  function Model() {
    _classCallCheck(this, Model);
  }

  _createClass(Model, [{
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

},{}],31:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var NidgetElement = require("@Thaerious/nidget").NidgetElement;

require("./CheckBox.js");

var TextUpdate = /*#__PURE__*/function (_CustomEvent) {
  _inherits(TextUpdate, _CustomEvent);

  var _super = _createSuper(TextUpdate);

  function TextUpdate(index, text) {
    _classCallCheck(this, TextUpdate);

    return _super.call(this, 'text-update', {
      detail: {
        index: index,
        text: text
      }
    });
  }

  return TextUpdate;
}( /*#__PURE__*/_wrapNativeSuper(CustomEvent));

var ValueUpdate = /*#__PURE__*/function (_CustomEvent2) {
  _inherits(ValueUpdate, _CustomEvent2);

  var _super2 = _createSuper(ValueUpdate);

  function ValueUpdate(index, value) {
    _classCallCheck(this, ValueUpdate);

    return _super2.call(this, 'value-update', {
      detail: {
        index: index,
        value: value
      }
    });
  }

  return ValueUpdate;
}( /*#__PURE__*/_wrapNativeSuper(CustomEvent));

var QuestionClick = /*#__PURE__*/function (_CustomEvent3) {
  _inherits(QuestionClick, _CustomEvent3);

  var _super3 = _createSuper(QuestionClick);

  function QuestionClick() {
    _classCallCheck(this, QuestionClick);

    return _super3.call(this, 'button-question');
  }

  return QuestionClick;
}( /*#__PURE__*/_wrapNativeSuper(CustomEvent));

var MultipleChoicePane = /*#__PURE__*/function (_NidgetElement) {
  _inherits(MultipleChoicePane, _NidgetElement);

  var _super4 = _createSuper(MultipleChoicePane);

  function MultipleChoicePane() {
    _classCallCheck(this, MultipleChoicePane);

    return _super4.apply(this, arguments);
  }

  _createClass(MultipleChoicePane, [{
    key: "setModel",
    value: function setModel(model) {
      this.model = model;
    }
  }, {
    key: "ready",
    value: function () {
      var _ready = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _this = this;

        var _iterator, _step, element, _iterator2, _step2, _element;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _get(_getPrototypeOf(MultipleChoicePane.prototype), "connectedCallback", this).call(this);

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

},{"./CheckBox.js":25,"@Thaerious/nidget":22}],32:[function(require,module,exports){
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function _construct(Parent, args, Class) { if (_isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var NidgetElement = require("@Thaerious/nidget").NidgetElement;

var TextUpdate = /*#__PURE__*/function (_CustomEvent) {
  _inherits(TextUpdate, _CustomEvent);

  var _super = _createSuper(TextUpdate);

  function TextUpdate(text) {
    _classCallCheck(this, TextUpdate);

    return _super.call(this, 'text-update', {
      detail: {
        text: text
      }
    });
  }

  return TextUpdate;
}( /*#__PURE__*/_wrapNativeSuper(CustomEvent));

var BoardClick = /*#__PURE__*/function (_CustomEvent2) {
  _inherits(BoardClick, _CustomEvent2);

  var _super2 = _createSuper(BoardClick);

  function BoardClick() {
    _classCallCheck(this, BoardClick);

    return _super2.call(this, 'button-board');
  }

  return BoardClick;
}( /*#__PURE__*/_wrapNativeSuper(CustomEvent));

var QuestionClick = /*#__PURE__*/function (_CustomEvent3) {
  _inherits(QuestionClick, _CustomEvent3);

  var _super3 = _createSuper(QuestionClick);

  function QuestionClick() {
    _classCallCheck(this, QuestionClick);

    return _super3.call(this, 'button-question');
  }

  return QuestionClick;
}( /*#__PURE__*/_wrapNativeSuper(CustomEvent));

var AnswerClick = /*#__PURE__*/function (_CustomEvent4) {
  _inherits(AnswerClick, _CustomEvent4);

  var _super4 = _createSuper(AnswerClick);

  function AnswerClick() {
    _classCallCheck(this, AnswerClick);

    return _super4.call(this, 'button-answer');
  }

  return AnswerClick;
}( /*#__PURE__*/_wrapNativeSuper(CustomEvent));

var QuestionPane = /*#__PURE__*/function (_NidgetElement) {
  _inherits(QuestionPane, _NidgetElement);

  var _super5 = _createSuper(QuestionPane);

  function QuestionPane() {
    _classCallCheck(this, QuestionPane);

    return _super5.apply(this, arguments);
  }

  _createClass(QuestionPane, [{
    key: "ready",
    value: function () {
      var _ready = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _this = this;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return _get(_getPrototypeOf(QuestionPane.prototype), "ready", this).call(this);

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
                this.querySelector("#text-contents").addEventListener("blur", /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                  var text;
                  return regeneratorRuntime.wrap(function _callee$(_context) {
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

},{"@Thaerious/nidget":22}],33:[function(require,module,exports){
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

},{}]},{},[23])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvQWJzdHJhY3RNb2RlbC5qcyIsIi4uLy4uL25pZGdldC9zcmMvRHJhZ0hhbmRsZXIuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0ZpbGVPcGVyYXRpb25zLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9JbnRlcmZhY2VzLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9Nb3VzZVV0aWxpdGllcy5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0LmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9OaWRnZXRFbGVtZW50LmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9OaWRnZXRTdHlsZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvVHJhbnNmb3JtZXIuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvbi5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU2V0LmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b25TdGF0ZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0Q29udGFpbmVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRIVE1MSW1hZ2UuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldEltYWdlLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRUZXh0LmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtaW50ZXJmYWNlcy9EcmFnLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtaW50ZXJmYWNlcy9Ecm9wLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtaW50ZXJmYWNlcy9Nb3VzZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvTW92YWJsZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvUmVzaXplLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9wcm9qZWN0RmlsZS5qcyIsInNyYy9jbGllbnQvZWRpdG9yLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0F1dGhlbnRpY2F0ZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9DaGVja0JveC5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9FZGl0b3JQYW5lLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0ZpbGVPcHMuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvR2FtZUJvYXJkLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL01lbnUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvTW9kZWwuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvTXVsdGlwbGVDaG9pY2VQYW5lLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL1F1ZXN0aW9uUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9nb29nbGVGaWVsZHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7OztBQ2ZBLElBQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyxzQkFBRCxDQUF2Qjs7QUFDQSxJQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsMkJBQUQsQ0FBNUI7O0FBQ0EsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLG1CQUFELENBQXBCOztBQUNBLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQywyQkFBRCxDQUE1Qjs7QUFDQSxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMseUJBQUQsQ0FBMUI7O0FBQ0EsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGlCQUFELENBQXJCOztBQUVBLElBQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxtQkFBRCxDQUF0Qjs7QUFDQSxPQUFPLENBQUMsd0JBQUQsQ0FBUDs7QUFDQSxPQUFPLENBQUMsaUNBQUQsQ0FBUDs7QUFDQSxPQUFPLENBQUMsdUJBQUQsQ0FBUDs7QUFFQSxJQUFJLE9BQU8sR0FBRyxJQUFJLE9BQUosRUFBZDtBQUNBLElBQUksS0FBSyxHQUFHLElBQVo7QUFDQSxJQUFJLFlBQVksR0FBRyxJQUFuQjtBQUNBLElBQUksVUFBVSxHQUFHLElBQWpCO0FBRUEsTUFBTSxDQUFDLE1BQVAsd0VBQWdCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDWixVQUFBLEtBQUs7O0FBRE87QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBaEI7O1NBSWUsSzs7O0FBOEJmO0FBQ0E7QUFDQTs7OzttRUFoQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ1EsWUFBQSxLQURSLEdBQ2dCLElBQUksSUFBSixFQURoQjtBQUFBO0FBQUEsbUJBRVUsTUFBTSxDQUFDLGFBQVAsQ0FBcUIsbUJBQXJCLENBQXlDLHlCQUF6QyxFQUFvRSxXQUFwRSxDQUZWOztBQUFBO0FBQUE7QUFBQSxtQkFHVSxNQUFNLENBQUMsYUFBUCxDQUFxQixtQkFBckIsQ0FBeUMsb0NBQXpDLEVBQStFLHNCQUEvRSxDQUhWOztBQUFBO0FBQUE7QUFBQSxtQkFJVSxNQUFNLENBQUMsYUFBUCxDQUFxQixtQkFBckIsQ0FBeUMsMEJBQXpDLEVBQXFFLFlBQXJFLENBSlY7O0FBQUE7QUFBQTtBQUFBLG1CQUtVLE1BQU0sQ0FBQyxhQUFQLENBQXFCLG1CQUFyQixDQUF5Qyw2QkFBekMsRUFBd0UsZUFBeEUsQ0FMVjs7QUFBQTtBQU9JLFlBQUEsa0JBQWtCO0FBQ2xCLGdCQUFJLElBQUosR0FBVyxJQUFYLENBQWdCLE9BQWhCO0FBUko7QUFBQTtBQUFBLG1CQVdjLElBQUksWUFBSixHQUFtQixVQUFuQixFQVhkOztBQUFBO0FBQUE7QUFBQSxtQkFZYyxPQUFPLENBQUMsVUFBUixFQVpkOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFjUSxZQUFBLE9BQU8sQ0FBQyxHQUFSOztBQWRSO0FBQUE7QUFBQSxtQkFpQnFCLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBTSxDQUFDLFVBQVAsQ0FBa0IsTUFBOUIsQ0FqQnJCOztBQUFBO0FBaUJRLFlBQUEsSUFqQlI7QUFrQlEsWUFBQSxLQWxCUixHQWtCZ0IsSUFBSSxLQUFKLENBQVUsT0FBVixFQUFtQixHQUFuQixDQUF1QixJQUFJLENBQUMsS0FBTCxDQUFXLElBQUksQ0FBQyxJQUFoQixDQUF2QixDQWxCaEI7QUFtQkksWUFBQSxNQUFNLENBQUMsS0FBUCxHQUFlLEtBQWY7QUFFQSxZQUFBLFFBQVEsQ0FBQyxhQUFULENBQXVCLFlBQXZCLEVBQXFDLFdBQXJDLEdBQW1ELEtBQUssQ0FBQyxJQUF6RDtBQUNBLFlBQUEsVUFBVSxHQUFHLElBQUksVUFBSixDQUFlLEtBQWYsQ0FBYjtBQUNBLFlBQUEsVUFBVSxDQUFDLE1BQVgsR0FBb0IsU0FBcEI7QUFFSSxZQUFBLEdBekJSLEdBeUJjLElBQUksSUFBSixFQXpCZDtBQTBCUSxZQUFBLElBMUJSLEdBMEJlLEdBQUcsR0FBRyxLQTFCckI7QUEyQkksWUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGVBQWUsSUFBZixHQUFzQixLQUFsQzs7QUEzQko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7OztBQWlDQSxTQUFTLFNBQVQsR0FBcUI7QUFDakIsRUFBQSxPQUFPLENBQUMsT0FBUixDQUFnQixNQUFNLENBQUMsVUFBUCxDQUFrQixNQUFsQyxFQUEwQyxJQUFJLENBQUMsU0FBTCxDQUFlLE1BQU0sQ0FBQyxLQUFQLENBQWEsR0FBYixFQUFmLEVBQW1DLElBQW5DLEVBQXlDLENBQXpDLENBQTFDO0FBQ0g7QUFFRDtBQUNBO0FBQ0E7OztBQUNBLFNBQVMsV0FBVCxHQUF1QjtBQUNuQixNQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixZQUF2QixFQUFxQyxXQUFoRDtBQUNBLEVBQUEsT0FBTyxDQUFDLE1BQVIsQ0FBZSxNQUFNLENBQUMsVUFBUCxDQUFrQixNQUFqQyxFQUF5QyxJQUFJLEdBQUcsT0FBaEQ7QUFDQSxFQUFBLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBYixHQUFvQixJQUFwQjtBQUNBLEVBQUEsU0FBUztBQUNaO0FBRUQ7QUFDQTtBQUNBOzs7QUFDQSxTQUFTLGtCQUFULEdBQThCO0FBQzFCLEVBQUEsTUFBTSxDQUFDLFVBQVAsR0FBb0IsRUFBcEI7QUFDQSxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFoQixDQUF1QixNQUF2QixDQUE4QixDQUE5QixFQUFpQyxLQUFqQyxDQUF1QyxHQUF2QyxDQUFuQjs7QUFGMEIsNkNBR0YsVUFIRTtBQUFBOztBQUFBO0FBRzFCLHdEQUFvQztBQUFBOztBQUFBLFVBQXpCLFNBQXlCO0FBQ2hDLFVBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFWLENBQWdCLEdBQWhCLENBQWQ7QUFDQSxNQUFBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQUssQ0FBQyxDQUFELENBQXZCLGVBQThCLEtBQUssQ0FBQyxDQUFELENBQW5DLDZDQUEwQyxFQUExQztBQUNIO0FBTnlCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFPN0I7Ozs7Ozs7Ozs7O0FDOUVEO0lBRU0sWTtBQUNGLDBCQUFhO0FBQUE7O0FBQ1QsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQWQsRUFBb0IsT0FBTyxDQUFDLG1CQUFELENBQTNCO0FBQ0g7Ozs7V0FFRCxzQkFBYTtBQUFBOztBQUNULGFBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUNwQyxRQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsY0FBVixFQUEwQjtBQUFBLGlCQUFNLEtBQUksQ0FBQyxZQUFMLENBQWtCLE9BQWxCLEVBQTJCLE1BQTNCLENBQU47QUFBQSxTQUExQjtBQUNILE9BRk0sQ0FBUDtBQUdIOzs7V0FFRCxzQkFBYSxPQUFiLEVBQXNCLE1BQXRCLEVBQThCO0FBQzFCLE1BQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFaLENBQWlCO0FBQ2IsUUFBQSxNQUFNLEVBQUUsS0FBSyxZQURBO0FBRWIsUUFBQSxRQUFRLEVBQUUsS0FBSyxRQUZGO0FBR2IsUUFBQSxhQUFhLEVBQUUsS0FBSyxhQUhQO0FBSWIsUUFBQSxLQUFLLEVBQUUsS0FBSztBQUpDLE9BQWpCLEVBS0csSUFMSCxDQUtRLFVBQVUsTUFBVixFQUFrQjtBQUN0QixRQUFBLE9BQU87QUFDVixPQVBELEVBT0csVUFBUyxLQUFULEVBQWdCO0FBQ2YsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFlBQVo7QUFDQSxRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWjtBQUNBLFFBQUEsTUFBTSxDQUFDLEtBQUQsQ0FBTjtBQUNILE9BWEQ7QUFZSDs7O1dBRUQsd0JBQWM7QUFDVixVQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBTCxDQUFXLGVBQVgsR0FBNkIsV0FBN0IsQ0FBeUMsR0FBekMsRUFBWDtBQUNBLGFBQU8sSUFBSSxDQUFDLGdCQUFMLENBQXNCLEtBQUssS0FBM0IsQ0FBUDtBQUNIOzs7V0FFRCxrQkFBUTtBQUNKLE1BQUEsSUFBSSxDQUFDLEtBQUwsQ0FBVyxlQUFYLEdBQTZCLE1BQTdCO0FBQ0g7OztXQUVELG1CQUFTO0FBQ0wsTUFBQSxJQUFJLENBQUMsS0FBTCxDQUFXLGVBQVgsR0FBNkIsT0FBN0I7QUFDSDs7Ozs7O0FBSUwsTUFBTSxDQUFDLE9BQVAsR0FBaUIsWUFBakI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDM0NBLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxtQkFBRCxDQUFQLENBQTZCLGFBQW5EOztJQUVNLFk7Ozs7O0FBQ0Ysd0JBQVksS0FBWixFQUFtQjtBQUFBOztBQUFBLDZCQUNULGNBRFMsRUFFWDtBQUFDLE1BQUEsTUFBTSxFQUFHO0FBQUMsUUFBQSxLQUFLLEVBQUc7QUFBVDtBQUFWLEtBRlc7QUFJbEI7OztpQ0FMdUIsVzs7SUFRdEIsUTs7Ozs7Ozs7Ozs7Ozs7dUZBQ0Y7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNJOztBQUNBLHFCQUFLLGdCQUFMLENBQXNCLE9BQXRCLEVBQStCLFlBQUk7QUFDL0Isa0JBQUEsS0FBSSxDQUFDLE1BQUw7QUFDSCxpQkFGRDs7QUFGSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7Ozs7O1dBT0Esa0JBQVE7QUFDSixVQUFJLEtBQUssT0FBTCxLQUFpQixNQUFyQixFQUE2QixLQUFLLE9BQUwsR0FBZSxPQUFmLENBQTdCLEtBQ0ssS0FBSyxPQUFMLEdBQWUsTUFBZjtBQUNSOzs7U0FFRCxlQUFhO0FBQ1QsVUFBSSxDQUFDLEtBQUssWUFBTCxDQUFrQixRQUFRLENBQUMsaUJBQTNCLENBQUwsRUFBbUQ7QUFDL0MsYUFBSyxZQUFMLENBQWtCLFFBQVEsQ0FBQyxpQkFBM0IsRUFBOEMsT0FBOUM7QUFDSDs7QUFDRCxhQUFPLEtBQUssWUFBTCxDQUFrQixRQUFRLENBQUMsaUJBQTNCLENBQVA7QUFDSCxLO1NBRUQsYUFBWSxLQUFaLEVBQWtCO0FBQ2QsV0FBSyxZQUFMLENBQWtCLFFBQVEsQ0FBQyxpQkFBM0IsRUFBOEMsS0FBOUM7QUFDQSxXQUFLLGFBQUwsQ0FBbUIsSUFBSSxZQUFKLENBQWlCLEtBQWpCLENBQW5CO0FBQ0g7Ozs7RUF2QmtCLGE7O0FBMEJ2QixRQUFRLENBQUMsaUJBQVQsR0FBNkIsU0FBN0I7QUFDQSxNQUFNLENBQUMsY0FBUCxDQUFzQixNQUF0QixDQUE2QixXQUE3QixFQUEwQyxRQUExQztBQUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQWpCOzs7Ozs7Ozs7OztBQ3RDQSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsWUFBRCxDQUFyQjs7QUFDQSxJQUFNLEdBQUcsR0FBRztBQUFDO0FBQUQsQ0FBWjs7SUFFTSxZOzs7Ozs7O1dBQ0YsYUFBVyxLQUFYLEVBQWtCLE1BQWxCLEVBQTBCO0FBQ3RCLE1BQUEsWUFBWSxDQUFDLEtBQWIsR0FBc0IsS0FBdEI7QUFDQSxNQUFBLFlBQVksQ0FBQyxNQUFiLEdBQXNCLE1BQXRCO0FBRUEsTUFBQSxHQUFHLENBQUMsa0JBQUosQ0FBdUIsSUFBdkI7O0FBRUEsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxDQUFwQixFQUF1QixDQUFDLEVBQXhCLEVBQTRCO0FBQ3hCLFFBQUEsR0FBRyxDQUFDLGtCQUFKLENBQXVCLE9BQXZCLENBQStCLENBQS9CLEVBQWtDLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxFQUFpQixJQUFuRDtBQUNBLFFBQUEsR0FBRyxDQUFDLGtCQUFKLENBQXVCLFVBQXZCLENBQWtDLENBQWxDLEVBQXFDLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxFQUFpQixNQUF0RDtBQUNIOztBQUVELE1BQUEsR0FBRyxDQUFDLGFBQUosQ0FBa0IsZ0JBQWxCLENBQW1DLE9BQW5DLEVBQTRDLFlBQVksQ0FBQyxPQUF6RDtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsZ0JBQWpCLENBQWtDLE9BQWxDLEVBQTJDLFlBQVksQ0FBQyxPQUF4RDtBQUNBLE1BQUEsR0FBRyxDQUFDLGtCQUFKLENBQXVCLGdCQUF2QixDQUF3QyxhQUF4QyxFQUF1RCxZQUFZLENBQUMsUUFBcEU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixnQkFBdkIsQ0FBd0MsY0FBeEMsRUFBd0QsWUFBWSxDQUFDLFNBQXJFO0FBQ0EsTUFBQSxHQUFHLENBQUMsa0JBQUosQ0FBdUIsZ0JBQXZCLENBQXdDLGlCQUF4QyxFQUEyRCxZQUFZLENBQUMsU0FBeEU7QUFDSDs7O1dBRUQsa0JBQWdCLEtBQWhCLEVBQXVCO0FBQ25CLFVBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQWQsQ0FBcEI7QUFDQSxNQUFBLFlBQVksQ0FBQyxLQUFiLENBQW1CLE9BQW5CLENBQTJCLEtBQTNCLEVBQWtDLElBQWxDLEdBQXlDLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBdEQ7QUFDQSxNQUFBLFlBQVksQ0FBQyxNQUFiO0FBQ0g7OztXQUVELG1CQUFpQixLQUFqQixFQUF3QjtBQUNwQixVQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFkLENBQXBCO0FBQ0EsTUFBQSxZQUFZLENBQUMsS0FBYixDQUFtQixPQUFuQixDQUEyQixLQUEzQixFQUFrQyxNQUFsQyxHQUEyQyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQXhEO0FBQ0EsTUFBQSxZQUFZLENBQUMsTUFBYjtBQUNIOzs7V0FFRCxtQkFBaUIsS0FBakIsRUFBd0I7QUFDcEIsTUFBQSxZQUFZLENBQUMsTUFBYjtBQUNBLE1BQUEsWUFBWSxDQUFDLE9BQWI7QUFDQSxNQUFBLGNBQWMsQ0FBQyxHQUFmLENBQW1CLFlBQVksQ0FBQyxLQUFoQyxFQUF1QyxZQUFZLENBQUMsTUFBcEQ7QUFDSDs7O1dBRUQsbUJBQWlCO0FBQ2IsTUFBQSxHQUFHLENBQUMsa0JBQUosQ0FBdUIsSUFBdkI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixtQkFBdkIsQ0FBMkMsYUFBM0MsRUFBMEQsWUFBWSxDQUFDLFFBQXZFO0FBQ0EsTUFBQSxHQUFHLENBQUMsa0JBQUosQ0FBdUIsbUJBQXZCLENBQTJDLGNBQTNDLEVBQTJELFlBQVksQ0FBQyxTQUF4RTtBQUNBLE1BQUEsR0FBRyxDQUFDLGtCQUFKLENBQXVCLG1CQUF2QixDQUEyQyxpQkFBM0MsRUFBOEQsWUFBWSxDQUFDLFNBQTNFO0FBQ0EsTUFBQSxHQUFHLENBQUMsYUFBSixDQUFrQixtQkFBbEIsQ0FBc0MsT0FBdEMsRUFBK0MsWUFBWSxDQUFDLE9BQTVEO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixtQkFBakIsQ0FBcUMsT0FBckMsRUFBOEMsWUFBWSxDQUFDLE9BQTNEO0FBQ0g7Ozs7OztJQUdDLGM7Ozs7Ozs7V0FDRixhQUFXLEtBQVgsRUFBa0IsTUFBbEIsRUFBMEI7QUFDdEIsTUFBQSxjQUFjLENBQUMsS0FBZixHQUF3QixLQUF4QjtBQUNBLE1BQUEsY0FBYyxDQUFDLE1BQWYsR0FBd0IsTUFBeEI7QUFFQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLE9BQWpCLENBQXlCLEtBQUssQ0FBQyxRQUEvQjtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsSUFBakI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLFdBQWpCLEdBQStCLEtBQS9CO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixTQUFqQixDQUEyQixVQUEzQjtBQUVBLE1BQUEsR0FBRyxDQUFDLGFBQUosQ0FBa0IsZ0JBQWxCLENBQW1DLE9BQW5DLEVBQTRDLGNBQWMsQ0FBQyxPQUEzRDtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsZ0JBQWpCLENBQWtDLE9BQWxDLEVBQTJDLGNBQWMsQ0FBQyxPQUExRDtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsZ0JBQWpCLENBQWtDLGFBQWxDLEVBQWlELGNBQWMsQ0FBQyxRQUFoRTtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsZ0JBQWpCLENBQWtDLGVBQWxDLEVBQW1ELGNBQWMsQ0FBQyxVQUFsRTtBQUNIOzs7V0FFRCxrQkFBZ0IsS0FBaEIsRUFBdUI7QUFDbkIsTUFBQSxjQUFjLENBQUMsS0FBZixDQUFxQixRQUFyQixHQUFnQyxLQUFLLENBQUMsTUFBTixDQUFhLElBQTdDO0FBQ0EsTUFBQSxjQUFjLENBQUMsTUFBZjtBQUNIOzs7V0FFRCxzQkFBb0I7QUFDaEIsTUFBQSxjQUFjLENBQUMsT0FBZjtBQUNBLE1BQUEsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsY0FBYyxDQUFDLEtBQWhDLEVBQXVDLGNBQWMsQ0FBQyxNQUF0RDtBQUNIOzs7V0FFRCxtQkFBaUI7QUFDYixNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLElBQWpCO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixtQkFBakIsQ0FBcUMsYUFBckMsRUFBb0QsY0FBYyxDQUFDLFFBQW5FO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixtQkFBakIsQ0FBcUMsZUFBckMsRUFBc0QsY0FBYyxDQUFDLFVBQXJFO0FBQ0EsTUFBQSxHQUFHLENBQUMsYUFBSixDQUFrQixtQkFBbEIsQ0FBc0MsT0FBdEMsRUFBK0MsY0FBYyxDQUFDLE9BQTlEO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixtQkFBakIsQ0FBcUMsT0FBckMsRUFBOEMsY0FBYyxDQUFDLE9BQTdEO0FBQ0g7Ozs7OztJQUdDLGdCOzs7Ozs7OztBQUNGO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDSSxpQkFBVyxLQUFYLEVBQWtCLEtBQWxCLEVBQXlCLE1BQXpCLEVBQWlDLE9BQWpDLEVBQTBDO0FBQ3RDLE1BQUEsZ0JBQWdCLENBQUMsS0FBakIsR0FBMkIsS0FBM0IsYUFBMkIsS0FBM0IsY0FBMkIsS0FBM0IsR0FBb0MsZ0JBQWdCLENBQUMsS0FBckQ7QUFDQSxNQUFBLGdCQUFnQixDQUFDLEtBQWpCLEdBQTJCLEtBQTNCLGFBQTJCLEtBQTNCLGNBQTJCLEtBQTNCLEdBQW9DLGdCQUFnQixDQUFDLEtBQXJEO0FBQ0EsTUFBQSxnQkFBZ0IsQ0FBQyxNQUFqQixHQUEyQixNQUEzQixhQUEyQixNQUEzQixjQUEyQixNQUEzQixHQUFxQyxnQkFBZ0IsQ0FBQyxNQUF0RDtBQUNBLE1BQUEsZ0JBQWdCLENBQUMsT0FBakIsR0FBMkIsT0FBM0IsYUFBMkIsT0FBM0IsY0FBMkIsT0FBM0IsR0FBc0MsZ0JBQWdCLENBQUMsT0FBdkQ7QUFFQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLE9BQWpCLENBQXlCLGdCQUFnQixDQUFDLEtBQWpCLENBQXVCLGdCQUFnQixDQUFDLEtBQWpCLENBQXVCLE1BQXZCLENBQThCLENBQTlCLEVBQWlDLENBQWpDLENBQXZCLENBQXpCO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixXQUFqQixHQUErQixJQUEvQjtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsSUFBakI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsSUFBZDtBQUVBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsZ0JBQWpCLENBQWtDLGFBQWxDLEVBQWlELGdCQUFnQixDQUFDLFFBQWxFO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixnQkFBakIsQ0FBa0MsY0FBbEMsRUFBa0QsZ0JBQWdCLENBQUMsU0FBbkU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLGdCQUFqQixvQkFBcUQsZ0JBQWdCLENBQUMsWUFBdEU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLGdCQUFqQixrQkFBbUQsZ0JBQWdCLENBQUMsVUFBcEU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLFNBQWpCLENBQTJCLGdCQUFnQixDQUFDLEtBQTVDO0FBQ0g7OztXQUVELGtCQUFnQixLQUFoQixFQUF1QjtBQUNuQixNQUFBLGdCQUFnQixDQUFDLEtBQWpCLENBQXVCLGdCQUFnQixDQUFDLEtBQWpCLENBQXVCLE1BQXZCLENBQThCLENBQTlCLEVBQWlDLENBQWpDLENBQXZCLElBQThELEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBM0U7QUFDQSxNQUFBLGdCQUFnQixDQUFDLE1BQWpCO0FBQ0g7OztXQUVELG1CQUFpQixLQUFqQixFQUF3QjtBQUNwQixNQUFBLGdCQUFnQixDQUFDLE9BQWpCO0FBQ0EsTUFBQSxnQkFBZ0IsQ0FBQyxPQUFqQjtBQUNIOzs7V0FFRCxvQkFBa0IsS0FBbEIsRUFBeUI7QUFDckIsTUFBQSxnQkFBZ0IsQ0FBQyxPQUFqQjtBQUNBLE1BQUEsZ0JBQWdCLENBQUMsR0FBakIsQ0FBcUIsUUFBckI7QUFDSDs7O1dBRUQsc0JBQW9CLElBQXBCLEVBQTBCO0FBQ3RCLE1BQUEsZ0JBQWdCLENBQUMsT0FBakI7QUFDQSxNQUFBLGdCQUFnQixDQUFDLEdBQWpCLENBQXFCLFVBQXJCO0FBQ0g7OztXQUVELG1CQUFpQjtBQUNiLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsbUJBQWpCLENBQXFDLGFBQXJDLEVBQW9ELGdCQUFnQixDQUFDLFFBQXJFO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixtQkFBakIsQ0FBcUMsY0FBckMsRUFBcUQsZ0JBQWdCLENBQUMsU0FBdEU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLG1CQUFqQixDQUFxQyxlQUFyQyxFQUFzRCxnQkFBZ0IsQ0FBQyxVQUF2RTtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsbUJBQWpCLENBQXFDLGlCQUFyQyxFQUF3RCxnQkFBZ0IsQ0FBQyxZQUF6RTtBQUNIOzs7Ozs7SUFHQyxVO0FBQ0Ysc0JBQVksS0FBWixFQUFtQjtBQUFBOztBQUFBOztBQUNmLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFFQSxJQUFBLEdBQUcsQ0FBQyxrQkFBSixHQUF5QixRQUFRLENBQUMsYUFBVCxDQUF1Qix1QkFBdkIsQ0FBekI7QUFDQSxJQUFBLEdBQUcsQ0FBQyxhQUFKLEdBQW9CLFFBQVEsQ0FBQyxhQUFULENBQXVCLGlCQUF2QixDQUFwQjtBQUNBLElBQUEsR0FBRyxDQUFDLFlBQUosR0FBbUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsZ0JBQXZCLENBQW5CO0FBQ0EsSUFBQSxHQUFHLENBQUMsVUFBSixHQUFpQixRQUFRLENBQUMsYUFBVCxDQUF1Qix1QkFBdkIsQ0FBakI7QUFDQSxJQUFBLEdBQUcsQ0FBQyxRQUFKLEdBQWUsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsWUFBdkIsQ0FBZjtBQUNBLElBQUEsR0FBRyxDQUFDLFNBQUosR0FBZ0IsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsYUFBdkIsQ0FBaEI7QUFDQSxJQUFBLEdBQUcsQ0FBQyxZQUFKLEdBQW1CLFFBQVEsQ0FBQyxhQUFULENBQXVCLGdCQUF2QixDQUFuQjtBQUNBLElBQUEsR0FBRyxDQUFDLGlCQUFKLEdBQXdCLFFBQVEsQ0FBQyxhQUFULENBQXVCLGtCQUF2QixDQUF4QjtBQUNBLElBQUEsR0FBRyxDQUFDLGlCQUFKLEdBQXdCLFFBQVEsQ0FBQyxhQUFULENBQXVCLG1CQUF2QixDQUF4QjtBQUVBLElBQUEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsb0JBQXZCLEVBQTZDLGdCQUE3QyxDQUE4RCxPQUE5RCxFQUF1RSxZQUFNO0FBQ3pFLE1BQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxXQUFYOztBQUNBLE1BQUEsS0FBSSxDQUFDLGtCQUFMOztBQUNBLE1BQUEsS0FBSSxDQUFDLE1BQUw7O0FBQ0EsTUFBQSxLQUFJLENBQUMsVUFBTDtBQUNILEtBTEQ7QUFPQSxJQUFBLFFBQVEsQ0FBQyxhQUFULENBQXVCLG1CQUF2QixFQUE0QyxnQkFBNUMsQ0FBNkQsT0FBN0QsRUFBc0UsWUFBTTtBQUN4RSxNQUFBLFFBQVEsQ0FBQyxJQUFULEdBQWdCLFdBQWhCO0FBQ0gsS0FGRDtBQUlBLElBQUEsR0FBRyxDQUFDLGlCQUFKLENBQXNCLGdCQUF0QixDQUF1QyxPQUF2QyxFQUFnRCxZQUFNO0FBQ2xELE1BQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxhQUFYOztBQUNBLE1BQUEsS0FBSSxDQUFDLE1BQUw7O0FBQ0EsTUFBQSxLQUFJLENBQUMsVUFBTDtBQUNILEtBSkQ7QUFNQSxJQUFBLEdBQUcsQ0FBQyxpQkFBSixDQUFzQixnQkFBdEIsQ0FBdUMsT0FBdkMsRUFBZ0QsWUFBTTtBQUNsRCxNQUFBLEtBQUksQ0FBQyxLQUFMLENBQVcsYUFBWDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxNQUFMOztBQUNBLE1BQUEsS0FBSSxDQUFDLFVBQUw7QUFDSCxLQUpEO0FBTUEsSUFBQSxHQUFHLENBQUMsYUFBSixDQUFrQixnQkFBbEIsQ0FBbUMsT0FBbkMsRUFBNEMsWUFBTTtBQUM5QyxNQUFBLEtBQUksQ0FBQyxLQUFMLENBQVcsY0FBWDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxVQUFMO0FBQ0gsS0FIRDtBQUtBLElBQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsZ0JBQWpCLENBQWtDLE9BQWxDLEVBQTJDLFlBQU07QUFDN0MsTUFBQSxLQUFJLENBQUMsS0FBTCxDQUFXLGNBQVg7O0FBQ0EsTUFBQSxLQUFJLENBQUMsVUFBTDtBQUNILEtBSEQ7QUFLQSxJQUFBLEdBQUcsQ0FBQyxRQUFKLENBQWEsZ0JBQWIsQ0FBOEIsU0FBOUIsRUFBeUMsVUFBQyxLQUFELEVBQVc7QUFDaEQsVUFBSSxLQUFLLENBQUMsS0FBTixLQUFnQixFQUFwQixFQUF3QjtBQUNwQixRQUFBLEtBQUksQ0FBQyxVQUFMOztBQUNBLFFBQUEsS0FBSyxDQUFDLGVBQU47QUFDQSxRQUFBLEtBQUssQ0FBQyxjQUFOO0FBQ0EsUUFBQSxRQUFRLENBQUMsYUFBVCxDQUF1Qix1QkFBdkIsRUFBZ0QsS0FBaEQ7QUFDQSxlQUFPLEtBQVA7QUFDSDtBQUNKLEtBUkQ7QUFVQSxJQUFBLFFBQVEsQ0FBQyxhQUFULENBQXVCLG9CQUF2QixFQUE2QyxnQkFBN0MsQ0FBOEQsT0FBOUQsRUFBdUUsWUFBTTtBQUN6RSxNQUFBLEtBQUksQ0FBQyxLQUFMLENBQVcsZ0JBQVg7O0FBQ0EsTUFBQSxLQUFJLENBQUMsVUFBTDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxNQUFMO0FBQ0gsS0FKRDtBQU1BLElBQUEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsMkJBQXZCLEVBQW9ELGdCQUFwRCxDQUFxRSxPQUFyRSxFQUE4RSxZQUFNO0FBQ2hGLE1BQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxzQkFBWDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxVQUFMOztBQUNBLE1BQUEsS0FBSSxDQUFDLE1BQUw7QUFDSCxLQUpELEVBOURlLENBb0VmOztBQUNBLElBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxnQkFBZCxDQUErQixlQUEvQixFQUFnRCxVQUFBLEtBQUssRUFBSTtBQUNyRCxVQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTixDQUFhLEdBQXZCO0FBQ0EsTUFBQSxLQUFJLENBQUMsS0FBTCxDQUFXLFNBQVgsQ0FBcUIsR0FBckIsRUFBMEIsUUFBMUIsR0FBcUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFsRDtBQUNBLE1BQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxTQUFYLENBQXFCLEdBQXJCLEVBQTBCLFFBQTFCLEdBQXFDLEtBQUssQ0FBQyxNQUFOLENBQWEsUUFBbEQ7O0FBQ0EsTUFBQSxLQUFJLENBQUMsTUFBTDtBQUNILEtBTEQsRUFyRWUsQ0E0RWY7O0FBQ0EsSUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLGdCQUFkLENBQStCLGFBQS9CLEVBQThDLFVBQUEsS0FBSyxFQUFJO0FBQ25ELFVBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFOLENBQWEsR0FBdkI7QUFDQSxVQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTixDQUFhLEdBQXZCOztBQUNBLE1BQUEsS0FBSSxDQUFDLGNBQUw7O0FBRUEsTUFBQSxnQkFBZ0IsQ0FBQyxHQUFqQixDQUNJLFVBREosRUFFSSxLQUFJLENBQUMsS0FBTCxDQUFXLE9BQVgsQ0FBbUIsR0FBbkIsRUFBd0IsR0FBeEIsQ0FGSixFQUdJO0FBQUEsZUFBTSxLQUFJLENBQUMsTUFBTCxFQUFOO0FBQUEsT0FISixFQUlJO0FBQUEsZUFBTSxLQUFJLENBQUMsVUFBTCxFQUFOO0FBQUEsT0FKSjtBQU1ILEtBWEQ7QUFhQSxTQUFLLFVBQUw7QUFDSDs7OztXQUVELGtCQUFTLENBQ0w7QUFDSDs7O1dBRUQsc0JBQWEsQ0FDVDtBQUNIOzs7V0FFRCwwQkFBaUI7QUFDYixNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLFNBQWpCLENBQTJCLEdBQTNCLENBQStCLFFBQS9CO0FBQ0EsTUFBQSxHQUFHLENBQUMsYUFBSixDQUFrQixTQUFsQixDQUE0QixHQUE1QixDQUFnQyxRQUFoQztBQUNIOzs7V0FFRCxvQkFBVyxLQUFYLEVBQWtCO0FBQUE7O0FBQ2QsTUFBQSxLQUFLLGFBQUcsS0FBSCwyQ0FBWSxLQUFLLEtBQXRCO0FBQ0EsV0FBSyxrQkFBTDtBQUVBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsSUFBakI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsSUFBZDtBQUNBLE1BQUEsR0FBRyxDQUFDLGtCQUFKLENBQXVCLElBQXZCO0FBRUEsVUFBSSxLQUFLLENBQUMsUUFBTixHQUFpQixJQUFqQixLQUEwQixLQUFLLENBQUMsWUFBTixDQUFtQixRQUFqRCxFQUEyRCxLQUFLLFlBQUwsQ0FBa0IsS0FBbEI7QUFDM0QsVUFBSSxLQUFLLENBQUMsUUFBTixHQUFpQixJQUFqQixLQUEwQixLQUFLLENBQUMsWUFBTixDQUFtQixlQUFqRCxFQUFrRSxLQUFLLGtCQUFMLENBQXdCLEtBQXhCO0FBQ3JFOzs7V0FFRCw4QkFBcUI7QUFDakIsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixTQUFqQixDQUEyQixNQUEzQixDQUFrQyxRQUFsQztBQUNBLE1BQUEsR0FBRyxDQUFDLGFBQUosQ0FBa0IsU0FBbEIsQ0FBNEIsTUFBNUIsQ0FBbUMsUUFBbkM7QUFDQSxVQUFJLEtBQUssS0FBTCxDQUFXLFlBQVgsS0FBNEIsQ0FBaEMsRUFBbUMsR0FBRyxDQUFDLFlBQUosQ0FBaUIsU0FBakIsQ0FBMkIsR0FBM0IsQ0FBK0IsUUFBL0I7QUFDbkMsVUFBSSxLQUFLLEtBQUwsQ0FBVyxZQUFYLElBQTJCLEtBQUssS0FBTCxDQUFXLFVBQVgsR0FBd0IsQ0FBdkQsRUFBMEQsR0FBRyxDQUFDLGFBQUosQ0FBa0IsU0FBbEIsQ0FBNEIsR0FBNUIsQ0FBZ0MsUUFBaEM7QUFDMUQsTUFBQSxHQUFHLENBQUMsVUFBSixDQUFlLFdBQWYsR0FBNkIsWUFBWSxLQUFLLEtBQUwsQ0FBVyxZQUFYLEdBQTBCLENBQXRDLENBQTdCO0FBQ0g7OztXQUVELDRCQUFtQixLQUFuQixFQUEwQjtBQUFBOztBQUN0QixNQUFBLEdBQUcsQ0FBQyxpQkFBSixDQUFzQixJQUF0QjtBQUNBLE1BQUEsR0FBRyxDQUFDLGlCQUFKLENBQXNCLElBQXRCO0FBRUEsTUFBQSxjQUFjLENBQUMsR0FBZixDQUNJLEtBQUssS0FBTCxDQUFXLFFBQVgsRUFESixFQUVJO0FBQUEsZUFBTSxNQUFJLENBQUMsTUFBTCxFQUFOO0FBQUEsT0FGSjtBQUlIOzs7V0FFRCxzQkFBYSxLQUFiLEVBQW9CO0FBQ2hCLE1BQUEsR0FBRyxDQUFDLGlCQUFKLENBQXNCLElBQXRCO0FBQ0EsTUFBQSxHQUFHLENBQUMsaUJBQUosQ0FBc0IsSUFBdEI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsSUFBZDs7QUFFQSxXQUFLLElBQUksR0FBRyxHQUFHLENBQWYsRUFBa0IsR0FBRyxHQUFHLENBQXhCLEVBQTJCLEdBQUcsRUFBOUIsRUFBa0M7QUFDOUIsWUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLFNBQU4sQ0FBZ0IsR0FBaEIsQ0FBYjtBQUVBLFFBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxTQUFkLENBQXdCLEdBQXhCLEVBQTZCLE9BQTdCLENBQXFDLElBQXJDLEdBQTRDLElBQTVDO0FBQ0EsUUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLFNBQWQsQ0FBd0IsR0FBeEIsRUFBNkIsTUFBTSxDQUFDLFFBQXBDLEVBQThDLE1BQU0sQ0FBQyxRQUFyRDs7QUFFQSxhQUFLLElBQUksR0FBRyxHQUFHLENBQWYsRUFBa0IsR0FBRyxHQUFHLENBQXhCLEVBQTJCLEdBQUcsRUFBOUIsRUFBa0M7QUFDOUIsVUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLE9BQWQsQ0FBc0IsR0FBdEIsRUFBMkIsR0FBM0IsRUFBZ0MsTUFBTSxDQUFDLElBQVAsQ0FBWSxHQUFaLEVBQWlCLEtBQWpEO0FBQ0EsY0FBSSxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVosRUFBaUIsQ0FBakIsS0FBdUIsRUFBM0IsRUFBK0IsR0FBRyxDQUFDLFNBQUosQ0FBYyxXQUFkLENBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLE9BQXBDLEVBQS9CLEtBQ0ssSUFBSSxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVosRUFBaUIsQ0FBakIsS0FBdUIsRUFBM0IsRUFBK0IsR0FBRyxDQUFDLFNBQUosQ0FBYyxXQUFkLENBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLFNBQXBDLEVBQS9CLEtBQ0EsR0FBRyxDQUFDLFNBQUosQ0FBYyxXQUFkLENBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLE1BQXBDO0FBQ1I7QUFDSjtBQUNKOzs7Ozs7QUFHTCxNQUFNLENBQUMsT0FBUCxHQUFpQixVQUFqQjs7O0FDdlNBLGEsQ0FDQTs7Ozs7Ozs7Ozs7O0lBRU0sTzs7Ozs7Ozs7MEVBRUY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsdUJBQ1UsS0FBSyxVQUFMLEVBRFY7O0FBQUE7QUFBQTtBQUFBLHVCQUVVLEtBQUssU0FBTCxFQUZWOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7V0FLQSxzQkFBYTtBQUNULGFBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUNwQyxRQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFvQjtBQUFBLGlCQUFNLE9BQU8sRUFBYjtBQUFBLFNBQXBCO0FBQ0gsT0FGTSxDQUFQO0FBR0g7OztXQUVELHFCQUFZO0FBQ1IsYUFBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3BDLFFBQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFaLENBQWlCLE9BQWpCLEVBQTBCLElBQTFCLEVBQWdDLE9BQU8sRUFBdkM7QUFDSCxPQUZNLENBQVA7QUFHSDs7Ozs0RUFFRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0RBQ1csSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFvQjtBQUNuQyxrQkFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLEtBQVosQ0FBa0IsS0FBbEIsQ0FBd0IsTUFBeEIsQ0FBK0I7QUFDM0Isb0JBQUEsSUFBSSxFQUFHLE9BQU8sQ0FBQyxRQURZO0FBRTNCLG9CQUFBLE9BQU8sRUFBRSxDQUFDLGVBQUQsQ0FGa0I7QUFHM0Isb0JBQUEsTUFBTSxFQUFFO0FBSG1CLG1CQUEvQixFQUlHLElBSkgsQ0FJUSxVQUFBLEdBQUcsRUFBRTtBQUNULG9CQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBSixDQUFXLEVBQVosQ0FBUDtBQUNILG1CQU5ELEVBTUcsVUFBVSxLQUFWLEVBQWlCO0FBQ2hCLG9CQUFBLE1BQU0sQ0FBQyxLQUFELENBQU47QUFDSCxtQkFSRDtBQVNILGlCQVZNLENBRFg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7Ozs7NkVBY0Esa0JBQWEsTUFBYjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0RBQ1csSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFvQjtBQUNuQyxrQkFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLEtBQVosQ0FBa0IsS0FBbEIsV0FBK0I7QUFDM0Isb0JBQUEsTUFBTSxFQUFHO0FBRGtCLG1CQUEvQixFQUVHLElBRkgsQ0FFUSxVQUFBLEdBQUcsRUFBRTtBQUNULG9CQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTCxDQUFQO0FBQ0gsbUJBSkQsRUFJRyxVQUFVLEtBQVYsRUFBaUI7QUFDaEIsb0JBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFQLENBQU47QUFDSCxtQkFORDtBQU9ILGlCQVJNLENBRFg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7Ozs7MEVBWUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtEQUNXLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBb0I7QUFDbkMsa0JBQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEtBQWxCLENBQXdCLElBQXhCLENBQTZCO0FBQ3pCO0FBQ0Esb0JBQUEsTUFBTSxFQUFFLGVBRmlCO0FBR3pCLG9CQUFBLE1BQU0sRUFBRTtBQUhpQixtQkFBN0IsRUFJRyxJQUpILENBSVEsVUFBQSxHQUFHLEVBQUU7QUFDVCxvQkFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQUosQ0FBVyxLQUFaLENBQVA7QUFDSCxtQkFORCxFQU1HLFVBQVUsS0FBVixFQUFpQjtBQUNoQixvQkFBQSxNQUFNLENBQUMsS0FBRCxDQUFOO0FBQ0gsbUJBUkQ7QUFTSCxpQkFWTSxDQURYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7O3lFQWNBLGtCQUFVLE1BQVY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtEQUNXLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBb0I7QUFDbkMsa0JBQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEtBQWxCLENBQXdCLEdBQXhCLENBQTRCO0FBQ3hCLG9CQUFBLE1BQU0sRUFBRSxNQURnQjtBQUV4QixvQkFBQSxHQUFHLEVBQUU7QUFGbUIsbUJBQTVCLEVBR0csSUFISCxDQUdRLFVBQUEsR0FBRyxFQUFFO0FBQ1Qsb0JBQUEsT0FBTyxDQUFDLEdBQUQsQ0FBUDtBQUNILG1CQUxELEVBS0csVUFBVSxLQUFWLEVBQWlCO0FBQ2hCLG9CQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWjtBQUNBLG9CQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBUCxDQUFOO0FBQ0gsbUJBUkQ7QUFTSCxpQkFWTSxDQURYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7OzZFQWNBLGtCQUFjLE1BQWQsRUFBc0IsSUFBdEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtEQUNXLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBb0I7QUFDbkMsa0JBQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxPQUFaLENBQW9CO0FBQ2hCLG9CQUFBLElBQUksRUFBRywyQkFBMkIsTUFEbEI7QUFFaEIsb0JBQUEsTUFBTSxFQUFHLE9BRk87QUFHaEIsb0JBQUEsTUFBTSxFQUFHO0FBQ0wsc0JBQUEsVUFBVSxFQUFHO0FBRFIscUJBSE87QUFNaEIsb0JBQUEsT0FBTyxFQUFHO0FBQ04sc0NBQWlCO0FBRFgscUJBTk07QUFTaEIsb0JBQUEsSUFBSSxFQUFHO0FBVFMsbUJBQXBCLEVBVUcsSUFWSCxDQVVRLFVBQUEsR0FBRyxFQUFFO0FBQ1Qsb0JBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBRyxDQUFDLElBQWYsQ0FBRCxDQUFQO0FBQ0gsbUJBWkQsRUFZRyxVQUFVLEtBQVYsRUFBaUI7QUFDaEIsb0JBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxLQUFaO0FBQ0Esb0JBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFQLENBQU47QUFDSCxtQkFmRDtBQWdCSCxpQkFqQk0sQ0FEWDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7Ozs7Ozs0RUFxQkEsa0JBQWEsTUFBYixFQUFxQixRQUFyQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0RBQ1csSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFvQjtBQUNuQyxrQkFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLEtBQVosQ0FBa0IsS0FBbEIsQ0FBd0IsTUFBeEIsQ0FBK0I7QUFDM0Isb0JBQUEsTUFBTSxFQUFFLE1BRG1CO0FBRTNCLG9CQUFBLElBQUksRUFBRTtBQUZxQixtQkFBL0IsRUFHRyxJQUhILENBR1EsVUFBQSxHQUFHLEVBQUU7QUFDVCxvQkFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFHLENBQUMsSUFBZixDQUFELENBQVA7QUFDSCxtQkFMRCxFQUtHLFVBQVUsS0FBVixFQUFpQjtBQUNoQixvQkFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQVo7QUFDQSxvQkFBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQVAsQ0FBTjtBQUNILG1CQVJEO0FBU0gsaUJBVk0sQ0FEWDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7Ozs7Ozs7O0FBZUosT0FBTyxDQUFDLFFBQVIsR0FBbUIsZ0JBQW5CO0FBRUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsT0FBakI7OztBQ2xIQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxtQkFBRCxDQUFQLENBQTZCLGFBQW5EOztJQUVNLGU7Ozs7O0FBQ0YsMkJBQVksR0FBWixFQUFpQixHQUFqQixFQUFzQjtBQUFBOztBQUFBLDZCQUNaLGFBRFksRUFFWjtBQUFDLE1BQUEsTUFBTSxFQUFHO0FBQUMsUUFBQSxHQUFHLEVBQUcsR0FBUDtBQUFZLFFBQUEsR0FBRyxFQUFHO0FBQWxCO0FBQVYsS0FGWTtBQUlyQjs7O2lDQUwwQixXOztJQVF6QixpQjs7Ozs7QUFDRiw2QkFBWSxHQUFaLEVBQWlCLEtBQWpCLEVBQXdCLFFBQXhCLEVBQWtDO0FBQUE7O0FBQUEsOEJBQ3hCLGVBRHdCLEVBRTFCO0FBQUMsTUFBQSxNQUFNLEVBQUc7QUFBQyxRQUFBLEtBQUssRUFBRyxLQUFUO0FBQWdCLFFBQUEsR0FBRyxFQUFHLEdBQXRCO0FBQTJCLFFBQUEsUUFBUSxFQUFHO0FBQXRDO0FBQVYsS0FGMEI7QUFJakM7OztpQ0FMNEIsVzs7SUFRM0IsUzs7Ozs7QUFDRix1QkFBYztBQUFBOztBQUFBO0FBRWI7Ozs7OzJFQUVEO0FBQUE7O0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsdUNBRWEsR0FGYjtBQUdRLGtCQUFBLEtBQUksQ0FBQyxTQUFMLENBQWUsR0FBZixFQUFvQixnQkFBcEIsQ0FBcUMsT0FBckMsRUFBOEMsVUFBQyxLQUFEO0FBQUEsMkJBQVMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxPQUFiLENBQXFCLE1BQXJCLENBQTRCLENBQTVCLEVBQStCLENBQS9CLENBQVQ7QUFBQSxtQkFBOUM7O0FBRUEsa0JBQUEsS0FBSSxDQUFDLFNBQUwsQ0FBZSxHQUFmLEVBQW9CLGdCQUFwQixDQUFxQyxNQUFyQyxFQUE2QyxVQUFDLEtBQUQsRUFBUztBQUNsRCx3QkFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLGdCQUFQLENBQXdCLEtBQUssQ0FBQyxNQUE5QixFQUFzQyxXQUF0QyxDQUFmOztBQUNBLG9CQUFBLEtBQUksQ0FBQyxhQUFMLENBQW1CLElBQUksaUJBQUosQ0FBc0IsR0FBdEIsRUFBMkIsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUF4QyxFQUE4QyxRQUE5QyxDQUFuQjtBQUNILG1CQUhEOztBQUxSLCtDQVVpQixHQVZqQjtBQVdZLG9CQUFBLEtBQUksQ0FBQyxPQUFMLENBQWEsR0FBYixFQUFrQixHQUFsQixFQUF1QixnQkFBdkIsQ0FBd0MsT0FBeEMsRUFBaUQsWUFBTTtBQUNuRCxzQkFBQSxLQUFJLENBQUMsYUFBTCxDQUFtQixJQUFJLGVBQUosQ0FBb0IsR0FBcEIsRUFBeUIsR0FBekIsQ0FBbkI7QUFDSCxxQkFGRDtBQVhaOztBQVVRLHVCQUFLLElBQUksR0FBRyxHQUFHLENBQWYsRUFBa0IsR0FBRyxHQUFHLENBQXhCLEVBQTJCLEdBQUcsRUFBOUIsRUFBa0M7QUFBQSwyQkFBekIsR0FBeUI7QUFJakM7QUFkVDs7QUFFSSxxQkFBUyxHQUFULEdBQWUsQ0FBZixFQUFrQixHQUFHLEdBQUcsQ0FBeEIsRUFBMkIsR0FBRyxFQUE5QixFQUFrQztBQUFBLHdCQUF6QixHQUF5QjtBQWFqQzs7QUFmTDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7OztBQWtCQTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7V0FDSSxtQkFBVSxLQUFWLEVBQWlCLEtBQWpCLEVBQXdCLFFBQXhCLEVBQWlDO0FBQzdCLFVBQUksT0FBTyxHQUFHLEtBQUssU0FBTCxDQUFlLEtBQWYsQ0FBZDtBQUNBLE1BQUEsT0FBTyxDQUFDLElBQVIsR0FBZSxLQUFmO0FBQ0EsVUFBSSxRQUFKLEVBQWMsT0FBTyxDQUFDLEtBQVIsQ0FBYyxXQUFkLElBQTZCLFFBQTdCO0FBQ2pCO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7OztXQUNJLG1CQUFVLEtBQVYsRUFBZ0I7QUFDWixVQUFJLE9BQU8sS0FBUCxLQUFpQixRQUFqQixJQUE2QixLQUFLLEdBQUcsQ0FBckMsSUFBMEMsS0FBSyxHQUFHLENBQXRELEVBQXlELE1BQU0sSUFBSSxLQUFKLENBQVUsb0JBQW9CLEtBQTlCLENBQU47QUFDekQsVUFBSSxRQUFRLHNDQUErQixLQUEvQixnQkFBWjtBQUNBLGFBQU8sS0FBSyxhQUFMLENBQW1CLFFBQW5CLENBQVA7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztXQUNJLGlCQUFRLEdBQVIsRUFBYSxHQUFiLEVBQTZCO0FBQUEsVUFBWCxLQUFXLHVFQUFILEVBQUc7QUFDekIsV0FBSyxPQUFMLENBQWEsR0FBYixFQUFrQixHQUFsQixFQUF1QixXQUF2QixHQUFxQyxLQUFyQztBQUNIOzs7V0FFRCxpQkFBUSxHQUFSLEVBQWEsR0FBYixFQUFpQjtBQUNiLFVBQUksUUFBUSx5QkFBaUIsR0FBakIsNEJBQW9DLEdBQXBDLGlCQUFaO0FBQ0EsYUFBTyxLQUFLLGFBQUwsQ0FBbUIsUUFBbkIsQ0FBUDtBQUNIOzs7V0FFRCxxQkFBWSxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCLEtBQXRCLEVBQTRCO0FBQ3hCLFVBQUksT0FBTyxHQUFQLEtBQWUsUUFBZixJQUEyQixHQUFHLEdBQUcsQ0FBakMsSUFBc0MsR0FBRyxHQUFHLENBQWhELEVBQW1ELE1BQU0sSUFBSSxLQUFKLENBQVUsa0JBQWtCLEdBQTVCLENBQU47QUFDbkQsVUFBSSxPQUFPLEdBQVAsS0FBZSxRQUFmLElBQTJCLEdBQUcsR0FBRyxDQUFqQyxJQUFzQyxHQUFHLEdBQUcsQ0FBaEQsRUFBbUQsTUFBTSxJQUFJLEtBQUosQ0FBVSxrQkFBa0IsR0FBNUIsQ0FBTjtBQUNuRCxXQUFLLE9BQUwsQ0FBYSxHQUFiLEVBQWtCLEdBQWxCLEVBQXVCLFlBQXZCLENBQW9DLGVBQXBDLEVBQXFELEtBQXJEO0FBQ0g7Ozs7RUFqRW1CLGE7O0FBb0V4QixNQUFNLENBQUMsY0FBUCxDQUFzQixNQUF0QixDQUE2QixZQUE3QixFQUEyQyxTQUEzQztBQUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQWpCOzs7Ozs7Ozs7OztJQ2pHTSxJOzs7Ozs7O1dBQ0YsY0FBSyxZQUFMLEVBQWtCO0FBQUE7O0FBQ2QsV0FBSyxZQUFMLEdBQW9CLFlBQXBCO0FBQ0EsV0FBSyxVQUFMLENBQWdCLGdCQUFoQixDQUFpQyxPQUFqQyxFQUEwQztBQUFBLGVBQUksS0FBSSxDQUFDLFVBQUwsRUFBSjtBQUFBLE9BQTFDO0FBQ0EsV0FBSyxZQUFMO0FBRUEsV0FBSyxRQUFMLENBQWMsZ0JBQWQsQ0FBK0IsWUFBL0IsRUFBNkM7QUFBQSxlQUFLLEtBQUksQ0FBQyxVQUFMLEVBQUw7QUFBQSxPQUE3QztBQUNBLFdBQUssVUFBTCxDQUFnQixnQkFBaEIsQ0FBaUMsWUFBakMsRUFBK0M7QUFBQSxlQUFLLEtBQUksQ0FBQyxVQUFMLEVBQUw7QUFBQSxPQUEvQztBQUNBLFdBQUssUUFBTCxDQUFjLGdCQUFkLENBQStCLFlBQS9CLEVBQTZDO0FBQUEsZUFBSyxLQUFJLENBQUMsVUFBTCxFQUFMO0FBQUEsT0FBN0M7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsZ0JBQWhCLENBQWlDLFlBQWpDLEVBQStDO0FBQUEsZUFBSyxLQUFJLENBQUMsVUFBTCxFQUFMO0FBQUEsT0FBL0M7QUFFQSxNQUFBLFFBQVEsQ0FBQyxnQkFBVCxDQUEwQix3QkFBMUIsRUFBb0QsT0FBcEQsQ0FBNEQsVUFBQyxHQUFELEVBQVE7QUFDaEUsUUFBQSxHQUFHLENBQUMsZ0JBQUosQ0FBcUIsT0FBckIsRUFBOEI7QUFBQSxpQkFBSSxLQUFJLENBQUMsS0FBTCxFQUFKO0FBQUEsU0FBOUI7QUFDSCxPQUZEO0FBSUEsTUFBQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsV0FBMUIsRUFBdUMsT0FBdkMsQ0FBK0MsVUFBQyxHQUFELEVBQU87QUFDbEQsUUFBQSxHQUFHLENBQUMsYUFBSixDQUFrQixhQUFsQixFQUFpQyxnQkFBakMsQ0FBa0QsT0FBbEQsRUFBMkQsWUFBSTtBQUMzRCxVQUFBLEtBQUksQ0FBQyxVQUFMLENBQWdCLEdBQWhCO0FBQ0gsU0FGRDtBQUdILE9BSkQ7QUFNQSxhQUFPLElBQVA7QUFDSDs7O1dBRUQsaUJBQU87QUFDSCxXQUFLLFFBQUwsQ0FBYyxTQUFkLENBQXdCLEdBQXhCLENBQTRCLFFBQTVCO0FBRUEsTUFBQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsd0JBQTFCLEVBQW9ELE9BQXBELENBQTRELFVBQUMsR0FBRCxFQUFPO0FBQy9ELFFBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxHQUFkLENBQWtCLFFBQWxCO0FBQ0gsT0FGRDtBQUdIOzs7V0FFRCxnQkFBTTtBQUNGLFdBQUssUUFBTCxDQUFjLFNBQWQsQ0FBd0IsTUFBeEIsQ0FBK0IsUUFBL0I7QUFDQSxXQUFLLFlBQUw7QUFDSDs7O1dBRUQsc0JBQVk7QUFBQTs7QUFDUixVQUFJLEtBQUssT0FBVCxFQUFrQjtBQUNsQixXQUFLLE9BQUwsR0FBZSxVQUFVLENBQUMsWUFBSTtBQUMxQixRQUFBLE1BQUksQ0FBQyxLQUFMOztBQUNBLFFBQUEsTUFBSSxDQUFDLE9BQUwsR0FBZSxJQUFmO0FBQ0gsT0FId0IsRUFHdEIsR0FIc0IsQ0FBekI7QUFJSDs7O1dBRUQsc0JBQVk7QUFDUixVQUFJLENBQUMsS0FBSyxPQUFWLEVBQW1CO0FBQ25CLE1BQUEsWUFBWSxDQUFDLEtBQUssT0FBTixDQUFaO0FBQ0EsV0FBSyxPQUFMLEdBQWUsSUFBZjtBQUNIOzs7V0FFRCxvQkFBVyxPQUFYLEVBQW1CO0FBQUE7O0FBQ2YsTUFBQSxPQUFPLGVBQUcsT0FBSCwrQ0FBYyxLQUFLLFFBQTFCOztBQUNBLFVBQUksQ0FBQyxPQUFPLENBQUMsU0FBUixDQUFrQixRQUFsQixDQUEyQixXQUEzQixDQUFMLEVBQTZDO0FBQ3pDLFFBQUEsT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFSLENBQXNCLFlBQXRCLENBQVY7QUFDSDs7QUFFRCxVQUFJLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFFBQWxCLENBQTJCLFFBQTNCLENBQUosRUFBeUM7QUFDckMsUUFBQSxPQUFPLENBQUMsU0FBUixDQUFrQixNQUFsQixDQUF5QixRQUF6QjtBQUNILE9BRkQsTUFFTztBQUNILFlBQUksT0FBTyxDQUFDLFNBQVIsQ0FBa0IsUUFBbEIsQ0FBMkIsV0FBM0IsQ0FBSixFQUE0QztBQUN4QyxVQUFBLE9BQU8sQ0FBQyxTQUFSLENBQWtCLEdBQWxCLENBQXNCLFFBQXRCO0FBQ0g7O0FBQ0QsUUFBQSxPQUFPLENBQUMsZ0JBQVIsQ0FBeUIsWUFBekIsRUFBdUMsT0FBdkMsQ0FDSSxVQUFDLEdBQUQsRUFBUztBQUNMLFVBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxHQUFkLENBQWtCLFFBQWxCO0FBQ0gsU0FITDtBQUtIO0FBQ0o7OztXQUVELHdCQUFjO0FBQ1YsVUFBTSxJQUFJLEdBQUcsS0FBSyxVQUFMLENBQWdCLHFCQUFoQixHQUF3QyxJQUFyRDtBQUNBLFVBQU0sTUFBTSxHQUFHLEtBQUssVUFBTCxDQUFnQixxQkFBaEIsR0FBd0MsS0FBdkQ7QUFDQSxVQUFNLE1BQU0sR0FBRyxLQUFLLFFBQUwsQ0FBYyxxQkFBZCxHQUFzQyxLQUFyRDs7QUFDQSxVQUFLLElBQUksR0FBRyxNQUFQLEdBQWdCLE1BQWhCLEdBQXlCLENBQTFCLEdBQStCLE1BQU0sQ0FBQyxVQUExQyxFQUFxRDtBQUNqRCxhQUFLLFdBQUw7QUFDSCxPQUZELE1BRU87QUFDSCxhQUFLLFlBQUw7QUFDSDtBQUNKOzs7V0FFRCx1QkFBYTtBQUNULFVBQU0sSUFBSSxHQUFHLEtBQUssVUFBTCxDQUFnQixVQUE3QjtBQUNBLFVBQU0sS0FBSyxHQUFHLEtBQUssUUFBTCxDQUFjLFdBQTVCO0FBQ0EsV0FBSyxRQUFMLENBQWMsS0FBZCxDQUFvQixJQUFwQixHQUE0QixJQUFJLEdBQUcsS0FBUCxHQUFlLENBQWhCLEdBQXFCLElBQWhEO0FBQ0g7OztXQUVELHdCQUFjO0FBQ1YsVUFBTSxJQUFJLEdBQUcsS0FBSyxVQUFMLENBQWdCLFVBQTdCO0FBQ0EsVUFBTSxLQUFLLEdBQUcsS0FBSyxVQUFMLENBQWdCLFdBQTlCO0FBQ0EsV0FBSyxRQUFMLENBQWMsS0FBZCxDQUFvQixJQUFwQixHQUE0QixJQUFJLEdBQUcsS0FBUCxHQUFlLENBQWhCLEdBQXFCLElBQWhEO0FBQ0g7OztTQUVELGVBQVU7QUFDTixhQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQUssWUFBNUIsQ0FBUDtBQUNIOzs7U0FFRCxlQUFnQjtBQUNaLGFBQU8sS0FBSyxJQUFMLENBQVUsYUFBVixDQUF3QixZQUF4QixDQUFQO0FBQ0g7OztTQUVELGVBQWM7QUFDVixhQUFPLEtBQUssSUFBTCxDQUFVLGFBQVYsQ0FBd0IsWUFBeEIsQ0FBUDtBQUNIOzs7Ozs7QUFHTCxNQUFNLENBQUMsT0FBUCxHQUFpQixJQUFqQjs7Ozs7Ozs7Ozs7Ozs7OztJQzNHTSxLOzs7Ozs7O1dBQ0YsZ0JBQXlCO0FBQUEsVUFBcEIsSUFBb0IsdUVBQWIsV0FBYTtBQUNyQixXQUFLLFlBQUwsR0FBb0IsQ0FBcEI7QUFFQSxXQUFLLFNBQUwsR0FBaUI7QUFDYixRQUFBLElBQUksRUFBRSxJQURPO0FBRWIsUUFBQSxNQUFNLEVBQUU7QUFGSyxPQUFqQjtBQUtBLFdBQUssZ0JBQUw7QUFDQSxhQUFPLElBQVA7QUFDSDs7O1NBTUQsZUFBVztBQUNQLGFBQU8sS0FBSyxTQUFMLENBQWUsSUFBdEI7QUFDSCxLO1NBTkQsYUFBUyxNQUFULEVBQWlCO0FBQ2IsV0FBSyxTQUFMLENBQWUsSUFBZixHQUFzQixNQUF0QjtBQUNIOzs7V0FNRCxhQUFJLFNBQUosRUFBZTtBQUNYLFdBQUssWUFBTCxHQUFvQixDQUFwQjtBQUNBLFdBQUssU0FBTCxHQUFpQixTQUFqQjtBQUNBLGFBQU8sSUFBUDtBQUNIOzs7V0FFRCxlQUFNO0FBQ0YsYUFBTyxLQUFLLFNBQVo7QUFDSDs7O1dBRUQsa0JBQVMsS0FBVCxFQUFnQjtBQUFBOztBQUNaLE1BQUEsS0FBSyxhQUFHLEtBQUgsMkNBQVksS0FBSyxZQUF0QjtBQUNBLGFBQU8sS0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixLQUF0QixDQUFQO0FBQ0g7OztXQUVELG1CQUFVLEtBQVYsRUFBaUI7QUFDYixhQUFPLEtBQUssUUFBTCxHQUFnQixNQUFoQixDQUF1QixLQUF2QixDQUFQO0FBQ0g7OztXQUVELGlCQUFRLEdBQVIsRUFBYSxNQUFiLEVBQXFCO0FBQ2pCLGFBQU8sS0FBSyxTQUFMLENBQWUsTUFBZixFQUF1QixJQUF2QixDQUE0QixHQUE1QixDQUFQO0FBQ0g7OztXQUVELHVCQUFjO0FBQ1YsVUFBSSxLQUFLLFVBQUwsS0FBb0IsQ0FBeEIsRUFBMkI7QUFDM0IsV0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixNQUF0QixDQUE2QixLQUFLLFlBQWxDLEVBQWdELENBQWhEO0FBQ0EsVUFBSSxLQUFLLFlBQUwsSUFBcUIsS0FBSyxVQUE5QixFQUEwQyxLQUFLLFlBQUwsR0FBb0IsS0FBSyxVQUFMLEdBQWtCLENBQXRDO0FBQzdDOzs7V0FFRCxrQ0FBd0I7QUFDcEIsVUFBSSxLQUFLLEdBQUc7QUFDUixRQUFBLElBQUksRUFBRSxLQUFLLENBQUMsWUFBTixDQUFtQixlQURqQjtBQUVSLFFBQUEsUUFBUSxFQUFHLEVBRkg7QUFHUixRQUFBLE9BQU8sRUFBRztBQUhGLE9BQVo7O0FBTUEsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxDQUFwQixFQUF1QixDQUFDLEVBQXhCLEVBQTJCO0FBQ3ZCLFFBQUEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLElBQW1CO0FBQ2YsVUFBQSxJQUFJLEVBQUcsRUFEUTtBQUVmLFVBQUEsTUFBTSxFQUFHO0FBRk0sU0FBbkI7QUFJSDs7QUFFRCxXQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLElBQXRCLENBQTJCLEtBQTNCO0FBQ0EsYUFBTyxLQUFQO0FBQ0g7OztXQUVELDRCQUFtQjtBQUNmLFVBQUksS0FBSyxHQUFHO0FBQ1IsUUFBQSxJQUFJLEVBQUUsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsUUFEakI7QUFFUixRQUFBLE1BQU0sRUFBRTtBQUZBLE9BQVo7O0FBS0EsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxDQUFwQixFQUF1QixDQUFDLEVBQXhCLEVBQTRCO0FBQ3hCLFFBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiLElBQWtCO0FBQ2QsVUFBQSxRQUFRLEVBQUUsRUFESTtBQUVkLFVBQUEsSUFBSSxFQUFFO0FBRlEsU0FBbEI7O0FBS0EsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxDQUFwQixFQUF1QixDQUFDLEVBQXhCLEVBQTRCO0FBQ3hCLFVBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiLEVBQWdCLElBQWhCLENBQXFCLENBQXJCLElBQTBCO0FBQ3RCLFlBQUEsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUwsSUFBVSxHQURLO0FBRXRCLFlBQUEsSUFBSSxFQUFFLE1BRmdCO0FBR3RCLFlBQUEsQ0FBQyxFQUFFLEVBSG1CO0FBSXRCLFlBQUEsQ0FBQyxFQUFFO0FBSm1CLFdBQTFCO0FBTUg7QUFDSjs7QUFFRCxXQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLElBQXRCLENBQTJCLEtBQTNCO0FBQ0EsYUFBTyxLQUFQO0FBQ0g7OztTQUVELGVBQWlCO0FBQ2IsYUFBTyxLQUFLLFNBQUwsQ0FBZSxNQUFmLENBQXNCLE1BQTdCO0FBQ0g7OztXQUVELDBCQUFnQjtBQUNaLFdBQUssWUFBTDtBQUNBLFVBQUksS0FBSyxZQUFMLElBQXFCLEtBQUssVUFBOUIsRUFBMEMsS0FBSyxZQUFMLEdBQW9CLEtBQUssVUFBTCxHQUFrQixDQUF0QztBQUM3Qzs7O1dBRUQsMEJBQWdCO0FBQ1osV0FBSyxZQUFMO0FBQ0EsVUFBSSxLQUFLLFlBQUwsR0FBb0IsQ0FBeEIsRUFBMkIsS0FBSyxZQUFMLEdBQW9CLENBQXBCO0FBQzlCOzs7V0FFRCx5QkFBZ0I7QUFDWixVQUFJLEtBQUssR0FBRyxLQUFLLFFBQUwsRUFBWjs7QUFFQSxXQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLENBQXBCLEVBQXVCLENBQUMsRUFBeEIsRUFBNEI7QUFDeEIsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxDQUFwQixFQUF1QixDQUFDLEVBQXhCLEVBQTRCO0FBQ3hCLFVBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiLEVBQWdCLElBQWhCLENBQXFCLENBQXJCLEVBQXdCLEtBQXhCLElBQWlDLENBQWpDO0FBQ0g7QUFDSjtBQUNKOzs7V0FFRCx5QkFBZ0I7QUFDWixVQUFJLEtBQUssR0FBRyxLQUFLLFFBQUwsRUFBWjs7QUFFQSxXQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLENBQXBCLEVBQXVCLENBQUMsRUFBeEIsRUFBNEI7QUFDeEIsYUFBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxDQUFwQixFQUF1QixDQUFDLEVBQXhCLEVBQTRCO0FBQ3hCLFVBQUEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxDQUFiLEVBQWdCLElBQWhCLENBQXFCLENBQXJCLEVBQXdCLEtBQXhCLElBQWlDLENBQWpDO0FBQ0g7QUFDSjtBQUNKOzs7Ozs7QUFHTCxLQUFLLENBQUMsWUFBTixHQUFxQjtBQUNqQixFQUFBLFFBQVEsRUFBRyxRQURNO0FBRWpCLEVBQUEsZUFBZSxFQUFHO0FBRkQsQ0FBckI7ZUFLZSxLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0SWYsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG1CQUFELENBQVAsQ0FBNkIsYUFBbkQ7O0FBQ0EsT0FBTyxDQUFDLGVBQUQsQ0FBUDs7SUFFTSxVOzs7OztBQUNGLHNCQUFZLEtBQVosRUFBbUIsSUFBbkIsRUFBeUI7QUFBQTs7QUFBQSw2QkFDZixhQURlLEVBRWpCO0FBQUMsTUFBQSxNQUFNLEVBQUc7QUFBQyxRQUFBLEtBQUssRUFBRyxLQUFUO0FBQWdCLFFBQUEsSUFBSSxFQUFHO0FBQXZCO0FBQVYsS0FGaUI7QUFJeEI7OztpQ0FMcUIsVzs7SUFRcEIsVzs7Ozs7QUFDRix1QkFBWSxLQUFaLEVBQW1CLEtBQW5CLEVBQTBCO0FBQUE7O0FBQUEsOEJBQ2hCLGNBRGdCLEVBRWxCO0FBQUMsTUFBQSxNQUFNLEVBQUc7QUFBQyxRQUFBLEtBQUssRUFBRyxLQUFUO0FBQWdCLFFBQUEsS0FBSyxFQUFHO0FBQXhCO0FBQVYsS0FGa0I7QUFJekI7OztpQ0FMc0IsVzs7SUFRckIsYTs7Ozs7QUFDRiwyQkFBYztBQUFBOztBQUFBLDhCQUNKLGlCQURJO0FBRWI7OztpQ0FId0IsVzs7SUFNdkIsa0I7Ozs7Ozs7Ozs7Ozs7V0FFRixrQkFBUyxLQUFULEVBQWU7QUFDWCxXQUFLLEtBQUwsR0FBYSxLQUFiO0FBQ0g7Ozs7MkVBRUQ7QUFBQTs7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSx1REFFd0IsS0FBSyxnQkFBTCxDQUFzQix1QkFBdEIsQ0FGeEI7O0FBQUE7QUFFSSxzRUFBbUU7QUFBMUQsb0JBQUEsT0FBMEQ7QUFDL0Qsb0JBQUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsSUFBaEIsR0FBdUIsSUFBdkI7QUFDQSxvQkFBQSxPQUFPLENBQUMsZ0JBQVIsQ0FBeUIsVUFBekIsRUFBcUMsVUFBQyxLQUFEO0FBQUEsNkJBQVMsS0FBSSxDQUFDLFdBQUwsQ0FBaUIsS0FBakIsQ0FBVDtBQUFBLHFCQUFyQztBQUNBLG9CQUFBLE9BQU8sQ0FBQyxnQkFBUixDQUF5QixNQUF6QixFQUFpQyxVQUFDLEtBQUQsRUFBUztBQUN0QywwQkFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxZQUFiLENBQTBCLFlBQTFCLENBQVo7O0FBQ0EsMEJBQUksSUFBSSxHQUFHLEtBQUksQ0FBQyxhQUFMLG9DQUE4QyxLQUE5QyxVQUF5RCxJQUFwRTs7QUFDQSxzQkFBQSxLQUFJLENBQUMsYUFBTCxDQUFtQixJQUFJLFVBQUosQ0FBZSxLQUFmLEVBQXNCLElBQXRCLENBQW5CO0FBQ0gscUJBSkQ7QUFLSDtBQVZMO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUEsd0RBWXdCLEtBQUssZ0JBQUwsQ0FBc0IsV0FBdEIsQ0FaeEI7O0FBQUE7QUFZSSx5RUFBdUQ7QUFBOUMsb0JBQUEsUUFBOEM7O0FBQ25ELG9CQUFBLFFBQU8sQ0FBQyxnQkFBUixDQUF5QixjQUF6QixFQUF5QyxVQUFDLEtBQUQsRUFBUztBQUM5QywwQkFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLGdCQUFQLENBQXdCLEtBQUssQ0FBQyxNQUE5QixFQUFzQyxnQkFBdEMsQ0FBdUQsU0FBdkQsQ0FBWjtBQUNBLDBCQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQXpCOztBQUNBLHNCQUFBLEtBQUksQ0FBQyxhQUFMLENBQW1CLElBQUksV0FBSixDQUFnQixLQUFoQixFQUF1QixLQUF2QixDQUFuQjtBQUNILHFCQUpEO0FBS0g7QUFsQkw7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFvQkkscUJBQUssYUFBTCxDQUFtQixnQkFBbkIsRUFBcUMsZ0JBQXJDLENBQXNELE9BQXRELEVBQStELFlBQUk7QUFDL0Qsa0JBQUEsS0FBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBSSxhQUFKLEVBQW5CO0FBQ0gsaUJBRkQ7O0FBcEJKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7V0F5QkEscUJBQVksS0FBWixFQUFtQjtBQUNmLFVBQUksS0FBSyxDQUFDLEtBQU4sS0FBZ0IsRUFBcEIsRUFBdUI7QUFDbkIsUUFBQSxLQUFLLENBQUMsZUFBTjtBQUNBLFFBQUEsS0FBSyxDQUFDLGNBQU47QUFFQSxZQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsS0FBSyxDQUFDLE1BQTlCLEVBQXNDLGdCQUF0QyxDQUF1RCxTQUF2RCxDQUFaO0FBQ0EsUUFBQSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUQsQ0FBaEI7O0FBQ0EsWUFBSSxLQUFLLElBQUksQ0FBYixFQUFlO0FBQ1gsVUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLElBQWI7QUFDSCxTQUZELE1BRU87QUFDSCxjQUFJLFFBQVEsc0NBQThCLEtBQUssR0FBRyxDQUF0QyxRQUFaO0FBQ0EsZUFBSyxhQUFMLENBQW1CLFFBQW5CLEVBQTZCLEtBQTdCO0FBQ0g7O0FBRUQsZUFBTyxLQUFQO0FBQ0g7O0FBQ0QsTUFBQSxLQUFLLENBQUMsTUFBTixDQUFhLE9BQWIsQ0FBcUIsTUFBckIsQ0FBNEIsQ0FBNUIsRUFBK0IsQ0FBL0I7QUFDQSxhQUFPLElBQVA7QUFDSDtBQUVEO0FBQ0o7QUFDQTs7OztXQUNJLG1CQUFVLE1BQVYsRUFBaUI7QUFBQSxrREFDRyxLQUFLLGdCQUFMLGFBREg7QUFBQTs7QUFBQTtBQUNiO0FBQUEsY0FBUyxHQUFUO0FBQW9ELFVBQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxNQUFkLENBQXFCLFVBQXJCO0FBQXBEO0FBRGE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFFYixXQUFLLGFBQUwsaUJBQTRCLE1BQTVCLEdBQXNDLFNBQXRDLENBQWdELEdBQWhELENBQW9ELFVBQXBEO0FBQ0g7OztXQUVELGlCQUFRLEtBQVIsRUFBZSxJQUFmLEVBQW9CO0FBQ2hCLFdBQUssYUFBTCxvQ0FBOEMsS0FBOUMsVUFBeUQsSUFBekQsR0FBZ0UsSUFBaEU7QUFDSDs7O1dBRUQsb0JBQVcsS0FBWCxFQUFrQixLQUFsQixFQUF3QjtBQUNwQixXQUFLLGFBQUwsa0NBQTRDLEtBQTVDLFVBQXVELE9BQXZELEdBQWlFLEtBQWpFO0FBQ0g7Ozs7RUFqRTRCLGE7O0FBb0VqQyxNQUFNLENBQUMsY0FBUCxDQUFzQixNQUF0QixDQUE2QixzQkFBN0IsRUFBcUQsa0JBQXJEO0FBQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsa0JBQWpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlGQSxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsbUJBQUQsQ0FBUCxDQUE2QixhQUFuRDs7SUFFTSxVOzs7OztBQUNGLHNCQUFZLElBQVosRUFBa0I7QUFBQTs7QUFBQSw2QkFDUixhQURRLEVBRVY7QUFBQyxNQUFBLE1BQU0sRUFBRztBQUFDLFFBQUEsSUFBSSxFQUFHO0FBQVI7QUFBVixLQUZVO0FBSWpCOzs7aUNBTHFCLFc7O0lBUXBCLFU7Ozs7O0FBQ0Ysd0JBQWM7QUFBQTs7QUFBQSw4QkFDSixjQURJO0FBRWI7OztpQ0FIcUIsVzs7SUFNcEIsYTs7Ozs7QUFDRiwyQkFBYztBQUFBOztBQUFBLDhCQUNKLGlCQURJO0FBRWI7OztpQ0FId0IsVzs7SUFNdkIsVzs7Ozs7QUFDRix5QkFBYztBQUFBOztBQUFBLDhCQUNKLGVBREk7QUFFYjs7O2lDQUhzQixXOztJQU1yQixZOzs7Ozs7Ozs7Ozs7OzsyRUFFRjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUdJLHFCQUFLLGFBQUwsQ0FBbUIsYUFBbkIsRUFBa0MsZ0JBQWxDLENBQW1ELE9BQW5ELEVBQTRELFlBQUk7QUFDNUQsa0JBQUEsS0FBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBSSxVQUFKLEVBQW5CO0FBQ0gsaUJBRkQ7QUFJQSxxQkFBSyxhQUFMLENBQW1CLGdCQUFuQixFQUFxQyxnQkFBckMsQ0FBc0QsT0FBdEQsRUFBK0QsWUFBSTtBQUMvRCxrQkFBQSxLQUFJLENBQUMsYUFBTCxDQUFtQixJQUFJLGFBQUosRUFBbkI7QUFDSCxpQkFGRDtBQUlBLHFCQUFLLGFBQUwsQ0FBbUIsY0FBbkIsRUFBbUMsZ0JBQW5DLENBQW9ELE9BQXBELEVBQTZELFlBQUk7QUFDN0Qsa0JBQUEsS0FBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBSSxXQUFKLEVBQW5CO0FBQ0gsaUJBRkQ7QUFJQSxxQkFBSyxnQkFBTCxDQUFzQixPQUF0QixFQUErQjtBQUFBLHlCQUFJLEtBQUksQ0FBQyxhQUFMLENBQW1CLGdCQUFuQixFQUFxQyxLQUFyQyxFQUFKO0FBQUEsaUJBQS9CO0FBRUEscUJBQUssYUFBTCxDQUFtQixnQkFBbkIsRUFBcUMsZ0JBQXJDLENBQXNELE1BQXRELHVFQUE4RDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDdEQsMEJBQUEsSUFEc0QsR0FDL0MsS0FBSSxDQUFDLGFBQUwsQ0FBbUIsZ0JBQW5CLEVBQXFDLElBRFU7O0FBRTFELDBCQUFBLEtBQUksQ0FBQyxhQUFMLENBQW1CLElBQUksVUFBSixDQUFlLElBQUksQ0FBQyxJQUFMLEVBQWYsQ0FBbkI7O0FBRjBEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGlCQUE5RDs7QUFqQko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7OztXQXVCQSxpQkFBTztBQUNILFdBQUssYUFBTCxDQUFtQixnQkFBbkIsRUFBcUMsSUFBckMsR0FBNEMsRUFBNUM7QUFDSDs7O1dBRUQsaUJBQVEsSUFBUixFQUFhO0FBQ1QsV0FBSyxhQUFMLENBQW1CLGdCQUFuQixFQUFxQyxJQUFyQyxHQUE0QyxJQUE1QztBQUNIO0FBRUQ7QUFDSjtBQUNBOzs7O1dBQ0ksbUJBQVUsTUFBVixFQUFpQjtBQUFBLGlEQUNHLEtBQUssZ0JBQUwsYUFESDtBQUFBOztBQUFBO0FBQ2I7QUFBQSxjQUFTLEdBQVQ7QUFBb0QsVUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLE1BQWQsQ0FBcUIsVUFBckI7QUFBcEQ7QUFEYTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUViLFdBQUssYUFBTCxpQkFBNEIsTUFBNUIsR0FBc0MsU0FBdEMsQ0FBZ0QsR0FBaEQsQ0FBb0QsVUFBcEQ7QUFDSDs7O1NBRUQsYUFBZ0IsS0FBaEIsRUFBc0I7QUFDbEIsVUFBSSxLQUFKLEVBQVU7QUFDTixhQUFLLGFBQUwsQ0FBbUIsYUFBbkIsRUFBa0MsSUFBbEM7QUFDSCxPQUZELE1BRUs7QUFDRCxhQUFLLGFBQUwsQ0FBbUIsYUFBbkIsRUFBa0MsSUFBbEM7QUFDSDtBQUNKOzs7O0VBL0NzQixhOztBQWtEM0IsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsTUFBdEIsQ0FBNkIsZUFBN0IsRUFBOEMsWUFBOUM7QUFDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixZQUFqQjs7Ozs7QUM5RUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFDYjtBQUNBLEVBQUEsWUFBWSxFQUFHLHlDQUZGO0FBSWI7QUFDQSxFQUFBLFFBQVEsRUFBRywwRUFMRTtBQU9iO0FBQ0EsRUFBQSxLQUFLLEVBQUcsY0FSSztBQVViO0FBQ0EsRUFBQSxhQUFhLEVBQUcsQ0FBQyw0REFBRCxDQVhIO0FBYWI7QUFDQSxFQUFBLEtBQUssRUFBRTtBQWRNLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuY2xhc3MgQWJzdHJhY3RNb2RlbCB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGFic3RyYWN0IG1vZGVsLiAgSWYgZGVsZWdhdGUgaXMgcHJvdmlkZWQgdGhlbiBhbGwgbGlzdGVuZXJcbiAgICAgKiBhZGRzIGFuZCBub3RpZmllcyBhcmUgcGVyZm9ybWVkIG9uIHRoZSBkZWxlZ2F0ZSBsaXN0ZW5lciBjb2xsZWN0aW9uLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZGVsZWdhdGVcbiAgICAgKiBAcmV0dXJucyB7bm0kX0Fic3RyYWN0TW9kZWwuQWJzdHJhY3RNb2RlbH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHRoaXM7XG4gICAgICAgIHRoaXMuYWJzdHJhY3RNb2RlbExpc3RlbmVycyA9IFtdOyAgICAgICAgXG4gICAgfVxuXG4gICAgZ2V0RGVsZWdhdGUoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVsZWdhdGU7XG4gICAgfVxuICAgIFxuICAgIHNldERlbGVnYXRlKGRlbGVnYXRlID0gbnVsbCl7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmFic3RyYWN0TW9kZWxMaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUgPSBkZWxlZ2F0ZS5kZWxlZ2F0ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuZGVsZWdhdGUgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmRlZmluZWQgZGVsZWdhdGVcIik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYWRkTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gXCJvYmplY3RcIil7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIEFic3RyYWN0TW9kZWwgbGlzdGVuZXIgdHlwZTogXCIgKyB0eXBlb2YgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGVsZWdhdGUuYWJzdHJhY3RNb2RlbExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsIGFzIG5vdGlmeUxpc3RlbmVycyhtZXRob2ROYW1lLCBbbWV0aG9kQXJndW1lbnQwLCAuLi4gbWV0aG9kQXJndW1lbnROXSlcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1ldGhvZFxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5TGlzdGVuZXJzKG1ldGhvZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVWRU5UIFwiICsgdGhpcy5kZWxlZ2F0ZS5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgKyBtZXRob2QpO1xuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5zaGlmdC5hcHBseShhcmd1bWVudHMpO1xuICAgICAgICBsZXQgZXZlbnQgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3VtZW50cyxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcyxcbiAgICAgICAgICAgIGxpc3RlbmVyczogW11cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5sYXN0RXZlbnQgPSBldmVudDtcbiAgICAgICAgd2luZG93Lm5FdmVudHMucHVzaCh3aW5kb3cubGFzdEV2ZW50KTtcblxuICAgICAgICBmb3IgKGxldCBsaXN0ZW5lciBvZiB0aGlzLmRlbGVnYXRlLmFic3RyYWN0TW9kZWxMaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lclttZXRob2RdKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIiArIFwiICsgbGlzdGVuZXIuY29uc3RydWN0b3IubmFtZSArIFwiIFwiICsgbWV0aG9kKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cubGFzdEV2ZW50Lmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUpOyAgICAgICBcbiAgICAgICAgICAgICAgICBhd2FpdCBsaXN0ZW5lclttZXRob2RdLmFwcGx5KGxpc3RlbmVyLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpc3RlbmVyW0Fic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyXSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCIgKyBcIiArIGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUgKyBcIiBcIiArIEFic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cubGFzdEV2ZW50Lmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUpOyAgICAgICBcbiAgICAgICAgICAgICAgICBhd2FpdCBsaXN0ZW5lcltBYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lcl0uYXBwbHkobGlzdGVuZXIsIHdpbmRvdy5sYXN0RXZlbnQpOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuQWJzdHJhY3RNb2RlbC5kZWZhdWx0TGlzdGVuZXIgPSBcIm5pZGdldExpc3RlbmVyXCI7XG53aW5kb3cubkV2ZW50cyA9IFtdO1xubW9kdWxlLmV4cG9ydHMgPSBBYnN0cmFjdE1vZGVsOyIsIid1c2Ugc3RyaWN0Jztcbi8qKlxuICogU2luZ2xldG9uIGNsYXNzIHRvIHByb3ZpZGluZyBmdW5jdGlvbmFsaXR5IHRvIERyYWdOaWRnZXRzIGFuZCBEcm9wTmlkZ2V0cy5cbiAqIEl0IHN0b3JlcyB0aGUgTmlkZ2V0IGN1cnJlbnRseSBiZWluZyBkcmFnZ2VkLlxuICovXG5jbGFzcyBEcmFnSGFuZGxlcntcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLm92ZXIgPSBbXTtcbiAgICB9XG4gICAgXG4gICAgcHVzaE92ZXIobmlkZ2V0KXtcbiAgICAgICAgaWYgKHRoaXMub3ZlckhhcyhuaWRnZXQpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMub3Zlci5wdXNoKG5pZGdldCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBcbiAgICByZW1vdmVPdmVyKG5pZGdldCl7XG4gICAgICAgIGlmICghdGhpcy5vdmVySGFzKG5pZGdldCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhpcy5vdmVyLnNwbGljZSh0aGlzLm92ZXIuaW5kZXhPZihuaWRnZXQpLCAxKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSAgICBcbiAgICBcbiAgICBvdmVySGFzKG5pZGdldCl7XG4gICAgICAgIHJldHVybiB0aGlzLm92ZXIuaW5kZXhPZihuaWRnZXQpICE9PSAtMTtcbiAgICB9XG4gICAgXG4gICAgc2V0KG5pZGdldCl7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5pZGdldDtcbiAgICB9XG4gICAgXG4gICAgZ2V0KCl7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQ7XG4gICAgfVxuICAgIFxuICAgIGhhcygpe1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50ICE9PSBudWxsO1xuICAgIH1cbiAgICBcbiAgICBjbGVhcigpe1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xuICAgIH1cbiAgICBcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoKXtcbiAgICAgICAgcmV0dXJuIERyYWdIYW5kbGVyLmluc3RhbmNlO1xuICAgIH0gICAgXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IERyYWdIYW5kbGVyKCk7XG5cbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKiBnbG9iYWwgVXRpbGl0eSAqL1xuY2xhc3MgRmlsZU9wZXJhdGlvbnMge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIGEgZmlsZSAodXJsKS4gIE1hcCB2YXJpYWJsZXMgKCR7Li4ufSkgdG8gXG4gICAgICogYSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHVybFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgbG9hZE5pZGdldCh1cmwsIG1hcCl7ICAgICAgICBcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudCh1cmwsIG1hcCk7XG4gICAgICAgIHJldHVybiBuZXcgTmlkZ2V0RWxlbWVudChlbGVtZW50KTtcbiAgICB9ICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIGEgZmlsZSAodXJsKS4gIE1hcCB2YXJpYWJsZXMgKCR7Li4ufSkgdG8gXG4gICAgICogYSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHVybFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgbG9hZERPTUVsZW1lbnQodXJsLCBtYXAgPSBuZXcgTWFwKCkpeyAgICAgICAgXG4gICAgICAgIGlmIChtYXAgaW5zdGFuY2VvZiBNYXAgPT09IGZhbHNlKSBtYXAgPSBGaWxlT3BlcmF0aW9ucy5vYmplY3RUb01hcChtYXApOyAgICAgICBcbiAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRVUkwodXJsKTtcbiAgICAgICAgcmV0dXJuIEZpbGVPcGVyYXRpb25zLnN0cmluZ1RvRE9NRWxlbWVudCh0ZXh0LCBtYXApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIHRleHQuXG4gICAgICogQHBhcmFtIHt0eXBlfSB0ZXh0XG4gICAgICogQHBhcmFtIHt0eXBlfSBtYXBcbiAgICAgKiBAcmV0dXJucyB7bm9kZXxGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudC5kb21FbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBzdHJpbmdUb0RPTUVsZW1lbnQodGV4dCwgbWFwID0gbmV3IE1hcCgpKXtcbiAgICAgICAgLyogcmVwbGFjZSB2YXJpYWJsZXMgd2l0aCB2YWx1ZXMgKi9cbiAgICAgICAgZm9yIChsZXQga2V5IG9mIG1hcC5rZXlzKCkpeyAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHZhbHVlID0gbWFwLmdldChrZXkpO1xuICAgICAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdPyR7a2V5fVt9XWAsIGBnYCk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCB2YWx1ZSk7ICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgLyogcmVwbGFjZSB1bmZpbGxlZCB2YXJpYWJsZXMgd2l0aCBlbXB0eSAqL1xuICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGBbJF1be11bXn1dKlt9XWAsIGBnYCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsIFwiXCIpOyBcblxuICAgICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IHRleHQ7XG4gICAgICAgIGxldCBkb21FbGVtZW50ID0gbnVsbDtcbiAgICAgICAgY29uc29sZS5sb2coZWxlbWVudCk7XG5cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgc3RhdGljIG9iamVjdFRvTWFwKG9iamVjdCl7XG4gICAgICAgIGxldCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGZvciAobGV0IGZpZWxkIGluIG9iamVjdCl7ICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9iamVjdFtmaWVsZF0gPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIG9iamVjdFtmaWVsZF0gPT09IFwibnVtYmVyXCIpe1xuICAgICAgICAgICAgICAgIG1hcC5zZXQoZmllbGQsIG9iamVjdFtmaWVsZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuXG4gICAgXG5cbiAgICAvKlxuICAgICAqIFRyYW5zZmVyIGNvbnRlbnRzIG9mICdmaWxlbmFtZScgZnJvbSBzZXJ2ZXIgdG8gY2xpZW50LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHN1Y2Nlc3NDYWxsYmFja1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGVycm9yQ2FsbGJhY2tcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBjb250ZW50cyBvZiBmaWxlXG4gICAgICovXG4gICAgc3RhdGljIGdldFVSTCh1cmwpIHtcbiAgICAgICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoeGh0dHAucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGh0dHAuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAgOiB4aHR0cCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMgOiB4aHR0cC5zdGF0dXMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgOiB4aHR0cC5yZXNwb25zZVRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsIDogdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICAgICAgICAgIHhodHRwLnNlbmQobnVsbCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSB0ZXh0LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gdGV4dFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgZ2V0RmlsZSh1cmwsIG1hcCA9IG5ldyBNYXAoKSl7XG4gICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0VVJMKHVybCk7XG5cbiAgICAgICAgLyogcmVwbGFjZSB2YXJpYWJsZXMgd2l0aCB2YWx1ZXMgKi9cbiAgICAgICAgZm9yIChsZXQga2V5IG9mIG1hcC5rZXlzKCkpe1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gbWFwLmdldChrZXkpO1xuICAgICAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdPyR7a2V5fVt9XWAsIGBnYCk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiByZXBsYWNlIHVuZmlsbGVkIHZhcmlhYmxlcyB3aXRoIGVtcHR5ICovXG4gICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XVtefV0qW31dYCwgYGdgKTtcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgXCJcIik7XG5cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBUcmFuc2ZlciBjb250ZW50cyBvZiAnZmlsZW5hbWUnIGZyb20gc2VydmVyIHRvIGNsaWVudCB1c2luZyBjdXJyZW50IHdpbmRvdyBsb2NhdGlvbi5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdWNjZXNzQ2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcnJvckNhbGxiYWNrXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0TG9jYWwoZmlsZW5hbWUpIHtcbiAgICAgICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICAgICAgdmFyIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmICsgXCIvXCIgKyBmaWxlbmFtZTtcblxuICAgICAgICAgICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh4aHR0cC5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHR0cC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh4aHR0cC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHhodHRwLnN0YXR1cywgeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICAgICAgICAgIHhodHRwLnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShjYWxsYmFjayk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIENhdXNlICd0ZXh0JyB0byBiZSBzYXZlZCBhcyAnZmlsZW5hbWUnIGNsaWVudCBzaWRlLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZmlsZW5hbWUgVGhlIGRlZmF1bHQgZmlsZW5hbWUgdG8gc2F2ZSB0aGUgdGV4dCBhcy5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHRleHQgVGhlIHRleHQgdG8gc2F2ZSB0byBmaWxlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHN0YXRpYyBzYXZlVG9GaWxlKHRleHQsIGZpbGVuYW1lKSB7XG4gICAgICAgIGxldCBhbmNob3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGxldCBkYXRhID0gXCJ0ZXh0O2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUklDb21wb25lbnQodGV4dCk7XG4gICAgICAgIGFuY2hvci5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIFwiZGF0YTpcIiArIGRhdGEpO1xuICAgICAgICBhbmNob3Iuc2V0QXR0cmlidXRlKFwiZG93bmxvYWRcIiwgZmlsZW5hbWUpO1xuICAgICAgICBhbmNob3IuY2xpY2soKTtcbiAgICB9XG59XG5cbkZpbGVPcGVyYXRpb25zLk5vZGVUeXBlID0ge1xuICAgIEVMRU1FTlQgOiAxLFxuICAgIEFUVFJJQlVURSA6IDIsXG4gICAgVEVYVCA6IDMsIFxuICAgIENEQVRBU0VDVElPTiA6IDQsXG4gICAgRU5USVRZUkVGRVJOQ0UgOiA1LFxuICAgIEVOVElUWSA6IDYsXG4gICAgUFJPQ0VTU0lOR0lOU1RSVUNUSU9OIDogNyxcbiAgICBDT01NRU5UIDogOCxcbiAgICBET0NVTUVOVCA6IDksXG4gICAgRE9DVU1FTlRUWVBFIDogMTAsXG4gICAgRE9DVU1FTlRGUkFHTUVOVCA6IDExLFxuICAgIE5PVEFUSU9OIDogMTJcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wZXJhdGlvbnM7IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbW91c2UgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9Nb3VzZVwiKSwgXG4gICAgZHJhZyA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL0RyYWdcIiksXG4gICAgZHJvcCA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL0Ryb3BcIiksXG4gICAgbW92YWJsZSA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL01vdmFibGVcIiksXG4gICAgcmVzaXplIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvUmVzaXplXCIpXG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFNpbmdsdG9uIGNsYXNzIHRvIGFkZCBmdW5jdGlvbmFsaXR5IHRvIHRoZSBtb3VzZS5cbiAqL1xuY2xhc3MgTW91c2VVdGlsaXRpZXMge1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5sYXN0WCA9IDA7XG4gICAgICAgIHRoaXMubGFzdFkgPSAwO1xuICAgIH1cbiAgICBcbiAgICBpc1VuZGVyKGV2ZW50LCBlbGVtZW50KSB7XG4gICAgICAgIGxldCB4ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG5cbiAgICAgICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50ID09PSBlbGVtZW50KSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGdldFVuZGVyKGV2ZW50KSB7XG4gICAgICAgIGxldCB4ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgICB9XG5cbiAgICBzZXQgZWxlbWVudChlbGVtZW50KXtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWRFbGVtZW50ICE9PSBudWxsKXtcbiAgICAgICAgICAgIHRoaXMuZGV0YWNoRWxlbWVudCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZWxlbWVudCB8fCBlbGVtZW50ID09PSBudWxsIHx8IGVsZW1lbnQgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aGlzLmRldGFjaEVsZW1lbnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoRWxlbWVudChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgZWxlbWVudCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRhY2hlZEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGFuIGVsZW1lbnQuICBJZiB0aGUgZWxlbWVudCBkb2Vzbid0IGhhdmUgYSBwYXJlbnQgaXQgd2lsbCBiZVxuICAgICAqIGF0dGFjaGVkIHRvIHRoZSBkb2N1bWVudCBhbmQgd2lsbCBiZSBkZXRhY2hlZCB3aGVuIGRldGFjaEVsZW1lbnQgaXMgY2FsbGVkLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgYXR0YWNoRWxlbWVudChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgXG4gICAgICAgIGlmIChlbGVtZW50LnBhcmVudCl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGF0dGFjaCBlbGVtZW50IHRvIG1vdXNlIGlmIHRoZSBlbGVtZW50IGhhcyBhIHBhcmVudCBlbGVtZW50LlwiKTtcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZChlbGVtZW50KTtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjsgXG4gICAgICAgIGVsZW1lbnQuc3R5bGUudG9wID0gZXZlbnQuY2xpZW50WSArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gZXZlbnQuY2xpZW50WCArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJub25lXCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIxMDAwMFwiO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5tb3ZlQ2FsbEJhY2sgPSAoZXZlbnQpPT50aGlzLm9uTW91c2VNb3ZlKGV2ZW50KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3ZlQ2FsbEJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBsaXN0ZW5lcnMgZnJvbSB0aGUgYXR0YWNoZWQgZWxlbWVudCwgZG8gbm90IHJlbW92ZSBpdCBmcm9tIHRoZVxuICAgICAqIGRvY3VtZW50LlxuICAgICAqIEByZXR1cm5zIHt0eXBlfVxuICAgICAqL1xuICAgIGRldGFjaEVsZW1lbnQoKXtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWRFbGVtZW50ID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdmVDYWxsQmFjayk7ICAgICAgICBcbiAgICAgICAgbGV0IHJ2YWx1ZSA9IHRoaXMuYXR0YWNoZWRFbGVtZW50O1xuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudCA9IG51bGw7ICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChydmFsdWUpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJ2YWx1ZTtcbiAgICB9XG5cbiAgICBvbk1vdXNlTW92ZShldmVudCkgeyAgICAgICAgXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMubGFzdFggPSBldmVudC5jbGllbnRYO1xuICAgICAgICB0aGlzLmxhc3RZID0gZXZlbnQuY2xpZW50WTtcblxuICAgICAgICAvLyBzZXQgdGhlIGVsZW1lbnQncyBuZXcgcG9zaXRpb246XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50LnN0eWxlLnRvcCA9IGV2ZW50LmNsaWVudFkgKyBcInB4XCI7XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50LnN0eWxlLmxlZnQgPSBldmVudC5jbGllbnRYICsgXCJweFwiO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW91c2VVdGlsaXRpZXMoKTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHByZWZpeDogXCJkYXRhLW5pZGdldFwiLFxuICAgIGVsZW1lbnRBdHRyaWJ1dGU6IFwiZGF0YS1uaWRnZXQtZWxlbWVudFwiLFxuICAgIHNyY0F0dHJpYnV0ZTogXCJzcmNcIixcbiAgICB0ZW1wbGF0ZVNyY0F0dHJpYnV0ZTogXCJ0ZW1wbGF0ZS1zcmNcIixcbiAgICBuYW1lQXR0cmlidXRlOiBcIm5hbWVcIixcbiAgICBpbnRlcmZhY2VBdHRyaWJ1dGU6IFwiaW50ZXJmYWNlc1wiLFxuICAgIHRlbXBsYXRlQXR0cmlidXRlOiBcInRlbXBsYXRlXCIsXG4gICAgaW50ZXJmYWNlRGF0YUZpZWxkOiBcImludGVyZmFjZURhdGFcIixcbiAgICBtb2RlbERhdGFGaWVsZDogXCJtb2RlbERhdGFcIixcbiAgICBzdHlsZUF0dHJpYnV0ZTogXCJuaWRnZXQtc3R5bGVcIlxufTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IEZpbGVPcGVyYXRpb25zID0gcmVxdWlyZShcIi4vRmlsZU9wZXJhdGlvbnNcIik7XG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi9OaWRnZXRcIik7XG5jb25zdCBJbnRlcmZhY2VzID0gcmVxdWlyZShcIi4vSW50ZXJmYWNlc1wiKTtcbmNvbnN0IFRyYW5zZm9ybWVyID0gcmVxdWlyZShcIi4vVHJhbnNmb3JtZXJcIik7XG5jb25zdCBOaWRnZXRTdHlsZSA9IHJlcXVpcmUoXCIuL05pZGdldFN0eWxlXCIpO1xuXG4vKipcbiAqIENhbGN1bGF0ZSB0aGUgdzpoIGFzcGVjdCByYXRpbyBhbmQgYWRqdXN0IHRoZSBwcm9wb3J0aW9ucyBhY2NvcmRpbmdseS5cbiAqXG4gKi9cbmNsYXNzIEFzcGVjdFJhdGlve1xuICAgIGNvbnN0cnVjdG9yKG5pZGdldCkge1xuICAgICAgICB0aGlzLm5pZGdldCA9IG5pZGdldDtcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKT0+dGhpcy5vblJlc2l6ZSgpKTtcbiAgICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKHRoaXMubmlkZ2V0KTtcbiAgICAgICAgdGhpcy5wYXJzZVZhbHVlcygpO1xuICAgICAgICB0aGlzLm9uUmVzaXplKCk7XG4gICAgICAgIHRoaXMubG9hZGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0VmFsdWUoKXtcbiAgICAgICAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoQXNwZWN0UmF0aW8uQ1NTX0FUVFJJQlVURSk7XG4gICAgfVxuXG4gICAgcGFyc2VWYWx1ZXMoKXtcbiAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuICAgICAgICBsZXQgc3BsaXQgPSB2YWx1ZS5zcGxpdCgvWyAsO10vZyk7XG5cbiAgICAgICAgZm9yIChsZXQgcyBvZiBzcGxpdCl7XG4gICAgICAgICAgICBpZiAocy5zcGxpdCgvWy06XS8pLmxlbmd0aCA9PT0gMil7XG4gICAgICAgICAgICAgICAgbGV0IHJhdGlvID0gcy5zcGxpdCgvWy06XS8pO1xuICAgICAgICAgICAgICAgIHRoaXMud2lkdGggPSBwYXJzZUludChyYXRpb1swXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBwYXJzZUludChyYXRpb1sxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzID09PSBcImhcIil7XG4gICAgICAgICAgICAgICAgdGhpcy5vblJlc2l6ZSA9ICgpPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5uaWRnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS53aWR0aCA9IChoZWlnaHQgKiB0aGlzLndpZHRoIC8gdGhpcy5oZWlnaHQpICsgXCJweFwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25SZXNpemUoKXtcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5uaWRnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmhlaWdodCA9ICh3aWR0aCAqIHRoaXMuaGVpZ2h0IC8gdGhpcy53aWR0aCkgKyBcInB4XCI7XG4gICAgfVxufVxuXG5Bc3BlY3RSYXRpby5DU1NfQVRUUklCVVRFID0gXCItLW5pZGdldC1hc3BlY3QtcmF0aW9cIjtcblxuLyoqXG4gKiBBIE5pZGdldEVsZW1lbnQgaXMgYSAxOjEgY2xhc3Mtb2JqZWN0OmRvbS1vYmplY3QgcGFpcmluZy4gIEFjdGlvbnMgb24gdGhlIERPTSBcbiAqIG9iamVjdCBzaG91bGQgb25seSBiZSBjYWxsZWQgYnkgdGhlIE5pZGdldEVsZW1lbnQgb2JqZWN0LiAgVGhlIGludGVyZmFjZURhdGFcbiAqIGZpZWxkIGlzIHJlc2VydmVkIGZvciBkYXRhIGZyb20gaW50ZXJmYWNlcy4gIEludGVyZmFjZXMgc2hvdWxkIHB1dCB0aGVpciBcbiAqIGN1c3RvbSBkYXRhIHVuZGVyIFtpbnRlcmZhY2VEYXRhRmllbGRdLltpbnRlcmZhY2VOYW1lXS4gIFRoZSBpbnRlcmZhY2UgZGF0YVxuICogYXR0cmlidXRlIGlzIHNldCB3aXRoIHRoZSBzdGF0aWMgdmFsdWUgTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZC5cbiAqIFxuICogQ2FsbGluZyBtZXRob2RzIG9uIHRoZSBuaWRnZXQgd2lsbCB0cmVhdCBzaGFkb3cgY29udGVudHMgYXMgcmVndWxhciBjb250ZW50cy5cbiAqL1xuY2xhc3MgTmlkZ2V0RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgTmlkZ2V0IGFzc29jaWF0ZWQgd2l0aCAnZWxlbWVudCcuICBBbiBlcnJvciB3aWxsIGJlIHRocm93blxuICAgICAqIGlmIHRoZSAnZWxlbWVudCcgaXMgYWxyZWFkeSBhc3NvY2lhdGVkIHdpdGggYSBOaWRnZXQuXG4gICAgICogXG4gICAgICogRGlzYWJsZWQgY2xhc3MgaW5kaWNhdGVzIHRoaXMgbmlkZ2V0IHdpbGwgaWdub3JlIG1vdXNlIGV2ZW50cy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGVsZW1lbnQgSlF1ZXJ5IHNlbGVjdG9yXG4gICAgICogQHJldHVybiB7bm0kX05pZGdldC5OaWRnZXRFbGVtZW50fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHRlbXBsYXRlSWQpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpc1tOaWRnZXQuaW50ZXJmYWNlRGF0YUZpZWxkXSA9IHt9O1xuICAgICAgICB0aGlzW05pZGdldC5tb2RlbERhdGFGaWVsZF0gPSB7fTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1lciA9IG5ldyBUcmFuc2Zvcm1lcih0aGlzKTtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMgPSB7fTtcblxuICAgICAgICBpZiAodGVtcGxhdGVJZCl7XG4gICAgICAgICAgICB0aGlzLmFwcGx5VGVtcGxhdGUodGVtcGxhdGVJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgICAgY29ubmVjdGVkQ2FsbGJhY2sgaXMgaW52b2tlZCBlYWNoIHRpbWUgdGhlIGN1c3RvbSBlbGVtZW50IGlzIGFwcGVuZGVkIGludG8gYSBkb2N1bWVudC1jb25uZWN0ZWQgZWxlbWVudFxuICAgICAqL1xuICAgIGFzeW5jIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICB0aGlzLnNoYWRvd0NvbnRlbnRzID0gdGhpcztcblxuICAgICAgICAvLyBzZXQgdGhlIGh0bWwgb2YgdGhpcyBlbGVtZW50IHRvIHRoZSBjb250ZW50cyBvZiB0aGUgZmlsZSAobm90IGEgc2hhZG93IGVsZW1lbnQpXG4gICAgICAgIC8vIGFsbCBkYXRhLSBhdHRyaWJ1dGVzIHdpbGwgYmUgdXNlZCB0byBmaWxsIGluICR7fSB2YXJpYWJsZXMgaW4gdGhlIHNvdXJjZSBmaWxlXG4gICAgICAgIC8vIGRvZXNuJ3Qgd29yayBvbiBlZGdlXG4gICAgICAgIGlmICh0aGlzLmhhc0F0dHJpYnV0ZShOaWRnZXQuc3JjQXR0cmlidXRlKSkgYXdhaXQgdGhpcy5yZXRyaWV2ZVNvdXJjZSh0aGlzLmRhdGFBdHRyaWJ1dGVzKCkpO1xuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoTmlkZ2V0LnRlbXBsYXRlU3JjQXR0cmlidXRlKSkgYXdhaXQgdGhpcy5yZXRyaWV2ZVRlbXBsYXRlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgYSBtYXAgb2YgYWxsIGRhdGEgYXR0cmlidXRlc1xuICAgICAqIEByZXR1cm5zIHtNYXA8YW55LCBhbnk+fVxuICAgICAqL1xuICAgIGRhdGFBdHRyaWJ1dGVzKCkge1xuICAgICAgICBsZXQgbWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBmb3IgKGxldCBhdHRyIG9mIHRoaXMuYXR0cmlidXRlcykge1xuICAgICAgICAgICAgaWYgKGF0dHIubmFtZS5zdGFydHNXaXRoKFwiZGF0YS1cIikpIHtcbiAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IGF0dHIubmFtZS5zdWJzdHIoNSk7XG4gICAgICAgICAgICAgICAgbWFwW25hbWVdID0gYXR0ci52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cblxuICAgIG5vdGlmeVN0eWxlcygpe1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGFyID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5nZXRQcm9wZXJ0eVZhbHVlKEFzcGVjdFJhdGlvLkNTU19BVFRSSUJVVEUpO1xuICAgICAgICAgICAgICAgIGlmIChhciAhPT0gXCJcIikgbmV3IEFzcGVjdFJhdGlvKHRoaXMpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgY29udGVudHMgb2YgZmlsZSBhcyBhIHRlbXBsZXRlIGFuZCBhcHBseSB0aGF0IHRlbXBsYXRlIHRvIHRoaXMgZWxlbWVudC5cbiAgICAgKiBSZXBsYWNlIGFsbCAke30gdmFyaWFibGVzIHdpdGggY29udGVudHMgb2YgJ21hcCcuXG4gICAgICogVGhlIHRlbXBsYXRlIHdpbGwgYmUgZ2l2ZW4gdGhlIGlkIGRlcml2ZWQgZnJvbSB0aGUgc3JjIGF0dHJpYnV0ZS5cbiAgICAgKi9cbiAgICBhc3luYyByZXRyaWV2ZVRlbXBsYXRlKCl7XG4gICAgICAgIGxldCBzcmMgPSB0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXQudGVtcGxhdGVTcmNBdHRyaWJ1dGUpO1xuICAgICAgICBsZXQgaWQgPSBzcmMucmVwbGFjZSgvW1xcLy8gLi1dKy9nLCBcIl9cIik7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2lkfWApO1xuICAgICAgICBpZiAodGVtcGxhdGUpIGF3YWl0IHRoaXMuaW5qZWN0VGVtcGxhdGUodGVtcGxhdGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhIHNoYWRvdyBlbGVtZW50IHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSB0ZW1wbGF0ZSBuYW1lZCAodGVtcGxhdGVJRCkuXG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIGFwcGx5VGVtcGxhdGUodGVtcGxhdGVJZCkge1xuICAgICAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0ZW1wbGF0ZUlkKTtcblxuICAgICAgICBpZiAoIXRlbXBsYXRlKSB0aHJvdyBuZXcgRXJyb3IoXCJUZW1wbGF0ZSAnXCIgKyB0ZW1wbGF0ZUlkICsgXCInIG5vdCBmb3VuZC5cIik7XG4gICAgICAgIGlmICh0ZW1wbGF0ZS50YWdOYW1lLnRvVXBwZXJDYXNlKCkgIT09IFwiVEVNUExBVEVcIikgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCB3aXRoIGlkICdcIiArIHRlbXBsYXRlSWQgKyBcIicgaXMgbm90IGEgdGVtcGxhdGUuXCIpO1xuXG4gICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiAnb3Blbid9KS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKSk7XG4gICAgfVxuXG4gICAgYXN5bmMgaW5qZWN0VGVtcGxhdGUodGVtcGxhdGUpe1xuICAgICAgICBpZiAodGhpcy5zaGFkb3dSb290ICE9PSBudWxsKSByZXR1cm47XG4gICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiAnb3Blbid9KS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKSk7XG4gICAgICAgIGF3YWl0IHRoaXMubm90aWZ5U3R5bGVzKCk7XG4gICAgICAgIGF3YWl0IHRoaXMucmVhZHkoKTtcbiAgICB9XG5cbiAgICBhc3luYyByZWFkeSgpe1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCBjb250ZW50cyBvZiBmaWxlIGludG8gdGhpcyBlbGVtZW50LlxuICAgICAqIFJlcGxhY2UgYWxsICR7fSB2YXJpYWJsZXMgd2l0aCBjb250ZW50cyBvZiAnbWFwJy5cbiAgICAgKi9cbiAgICBhc3luYyByZXRyaWV2ZVNvdXJjZShtYXApe1xuICAgICAgICBsZXQgc3JjID0gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0LnNyY0F0dHJpYnV0ZSk7XG4gICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0RmlsZShzcmMsIG1hcCk7XG4gICAgICAgIHRoaXMuaW5uZXJIVE1MID0gdGV4dDtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgbG9hZFRlbXBsYXRlU25pcHBldChmaWxlbmFtZSwgdGFnbmFtZSl7XG4gICAgICAgIGxldCBpZCA9IGZpbGVuYW1lLnJlcGxhY2UoL1tcXC8vIC4tXSsvZywgXCJfXCIpO1xuXG4gICAgICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aWR9YCkpe1xuICAgICAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRGaWxlKGZpbGVuYW1lKTtcbiAgICAgICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZW1wbGF0ZVwiKTtcbiAgICAgICAgICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IHRleHQ7XG4gICAgICAgICAgICB0ZW1wbGF0ZS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpZCk7XG4gICAgICAgICAgICBpZiAodGFnbmFtZSkgdGVtcGxhdGUuc2V0QXR0cmlidXRlKFwiZGF0YS1uaWRnZXRcIiwgdGFnbmFtZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZCh0ZW1wbGF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtpZH1gKTtcblxuICAgICAgICBmb3IgKGxldCBlbGUgb2YgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0YWduYW1lKSl7XG4gICAgICAgICAgICBhd2FpdCBlbGUuaW5qZWN0VGVtcGxhdGUodGVtcGxhdGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlICdoaWRkZW4nIGNsYXNzLlxuICAgICAqL1xuICAgIHNob3coKSB7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgJ2hpZGRlbicgY2xhc3MuXG4gICAgICovXG4gICAgaGlkZSgpIHtcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgZGlzYWJsZWQgZmxhZyB0aGF0IGlzIHJlYWQgYnkgbmlkZ2V0IG1vdXNlIGZ1bmN0aW9ucy5cbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKi9cbiAgICBzZXQgZGlzYWJsZWQodmFsdWUpe1xuICAgICAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKE5pZGdldEVsZW1lbnQuRElTQUJMRURfQVRUUklCVVRFLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKE5pZGdldEVsZW1lbnQuRElTQUJMRURfQVRUUklCVVRFLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGRpc2FibGVkIGZsYWcgdGhhdCBpcyByZWFkIGJ5IG5pZGdldCBtb3VzZSBmdW5jdGlvbnMuXG4gICAgICogQHBhcmFtIHZhbHVlXG4gICAgICovXG4gICAgZ2V0IGRpc2FibGVkKCl7XG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRyaWJ1dGUoTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXRFbGVtZW50LkRJU0FCTEVEX0FUVFJJQlVURSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhpcyBlbGVtZW50IHdhcyB1bmRlciB0aGUgbW91c2UgZm9yIHRoZSBldmVudC5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IGV2ZW50XG4gICAgICogQHBhcmFtIHt0eXBlfSBlbGVtZW50XG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1VuZGVyTW91c2UoZXZlbnQpIHtcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYO1xuICAgICAgICBsZXQgeSA9IGV2ZW50LmNsaWVudFk7XG4gICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcblxuICAgICAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnQgPT09IHRoaXMpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVuIHRoZSBxdWVyeSBzZWxlY3RvciBvbiB0aGlzIGVsZW1lbnQuXG4gICAgICogSWYgdGhpcyBlbGVtZW50IGhhcyBhIHNoYWRvdywgcnVuIGl0IG9uIHRoYXQgaW5zdGVhZC5cbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50VGFnTmFtZU1hcFtLXX1cbiAgICAgKi9cbiAgIHF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzKSB7XG4gICAgICAgIGlmICh0aGlzLnNoYWRvd1Jvb3Qpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVuIHRoZSBxdWVyeSBzZWxlY3RvciBvbiB0aGlzIGVsZW1lbnQuXG4gICAgICogSWYgdGhpcyBlbGVtZW50IGhhcyBhIHNoYWRvdywgcnVuIGl0IG9uIHRoYXQgaW5zdGVhZC5cbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50VGFnTmFtZU1hcFtLXX1cbiAgICAgKi9cbiAgICBxdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycykge1xuICAgICAgICBpZiAodGhpcy5zaGFkb3dSb290KXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSB0aGlzIGVsZW1lbnQgZnJvbSBpdCdzIHBhcmVudC5cbiAgICAgKi9cbiAgICBkZXRhY2goKXtcbiAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluZGV4IHdpdGhpbiB0aGUgcGFyZW50IGVsZW1lbnQuXG4gICAgICovXG4gICAgaW5kZXgoKXtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5wYXJlbnRFbGVtZW50LmNoaWxkcmVuKS5pbmRleE9mKHRoaXMpO1xuICAgIH1cbn1cblxuLy8gTmlkZ2V0RWxlbWVudC5tdXRhdGlvbk9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoKHJlY29yZCwgb2JzZXJ2ZXIpPT57XG4vLyAgICAgcmVjb3JkLmZvckVhY2goKG11dGF0aW9uKSA9PiB7XG4vLyAgICAgICAgIGlmICghbXV0YXRpb24uYWRkZWROb2RlcykgcmV0dXJuXG4vLyAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbXV0YXRpb24uYWRkZWROb2Rlcy5sZW5ndGg7IGkrKykge1xuLy8gICAgICAgICAgICAgbGV0IG5vZGUgPSBtdXRhdGlvbi5hZGRlZE5vZGVzW2ldO1xuLy8gICAgICAgICAgICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gXCJURU1QTEFURVwiKSB7XG4vLyAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobm9kZS50YWdOYW1lKTtcbi8vICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhub2RlLmdldEF0dHJpYnV0ZShcImRhdGEtbmlkZ2V0XCIpKTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgIH0pO1xuLy8gfSk7XG4vL1xuLy8gTmlkZ2V0RWxlbWVudC5tdXRhdGlvbk9ic2VydmVyLm9ic2VydmUoZG9jdW1lbnQsIHtcbi8vICAgICBjaGlsZExpc3Q6IHRydWUsXG4vLyAgICAgc3VidHJlZTogdHJ1ZSxcbi8vICAgICBhdHRyaWJ1dGVzOiBmYWxzZSxcbi8vICAgICBjaGFyYWN0ZXJEYXRhOiBmYWxzZVxuLy8gfSk7XG5cbk5pZGdldEVsZW1lbnQuRElTQUJMRURfQVRUUklCVVRFID0gXCJuaWRnZXQtZGlzYWJsZWRcIjtcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1lbGVtZW50JywgTmlkZ2V0RWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEVsZW1lbnQ7IiwiJ3VzZSBzdHJpY3QnO1xuLyoqXG4gKiBNYW5pcHVsYXRlcyB0aGUgZWxlbWVudHMgc3R5bGUgd2l0aCBqcyByb3V0aW5lcyBhY2NvcmRpbmcgdG8gY3NzIGZsYWdzLlxuICogTmlkZ2V0IHN0eWxlIGlzIGFwcGxpZWQgdG8gYWxsIG5pZGdldC1lbGVtZW50cyB1bmxlc3MgdGhleSBoYXZlIHRoZSBuaWRnZXQtc3R5bGVcbiAqIGF0dHJpYnV0ZSBzZXQgdG8gJ2ZhbHNlJy5cbiAqL1xuXG5jbGFzcyBOaWRnZXRTdHlsZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihuaWRnZXQpIHtcbiAgICAgICAgdGhpcy5uaWRnZXQgPSBuaWRnZXQ7XG4gICAgICAgIHRoaXMuYXBwbHkoKTtcbiAgICB9XG4gICAgXG4gICAgYXBwbHkoKSB7XG4gICAgICAgIHRoaXMubmlkZ2V0V2lkdGhSYXRpbygpO1xuICAgICAgICB0aGlzLm5pZGdldEhlaWdodFJhdGlvKCk7XG4gICAgICAgIHRoaXMubmlkZ2V0Rml0VGV4dCgpO1xuICAgICAgICB0aGlzLm5pZGdldEZpdFRleHRXaWR0aCgpO1xuICAgICAgICB0aGlzLm5pZGdldFZlcnRBbGlnblRleHQoKTtcbiAgICB9XG4gICAgXG4gICAgbmlkZ2V0V2lkdGhSYXRpbygpIHtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LXdpZHRoLXJhdGlvXCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47ICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHsgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LndpZHRoID0gdGhpcy5uaWRnZXQuaGVpZ2h0ICogcmF0aW87XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxuICAgIH1cbiAgICBcbiAgICBuaWRnZXRIZWlnaHRSYXRpbygpIHtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWhlaWdodC1yYXRpb1wiKTtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuOyAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7ICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLm5pZGdldC5oZWlnaHQgPSB0aGlzLm5pZGdldC53aWR0aCAqIHJhdGlvO1xuICAgICAgICB9KS5vYnNlcnZlKHRoaXMubmlkZ2V0KTsgICAgICBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaWxsIHRoZSB0ZXh0IGhlaWdodCB0byBtYXRjaCB0aGUgZWxlbWVudCBoZWlnaHQuXG4gICAgICogQ2hhbmdlIHRoZSByYXRpbyB2YWx1ZSAob3IgdGhlIGZvbnRTaXplKSBhZGp1c3QuXG4gICAgICovXG4gICAgbmlkZ2V0Rml0VGV4dCgpIHtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0XCIpOyAgICAgICAgXG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjtcblxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYC0tbmlkZ2V0LWZpdC10ZXh0ICR7cmF0aW99YClcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5uaWRnZXQub2Zmc2V0SGVpZ2h0ICogcmF0aW87XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IGggKyBcInB4XCI7XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqICBXaWxsIGNoYW5nZSB0aGUgZm9udCBzaXplIHNvIHRoYXQgdGhlIHRleHQgZml0J3MgaW4gdGhlIHBhcmVudCBlbGVtZW50LlxuICAgICAqICBEb24ndCBzZXQgdGhlIHdpZHRoIG9mIHRoZSBlbGVtZW50LlxuICAgICAqL1xuICAgIG5pZGdldEZpdFRleHRXaWR0aCgpIHtcbiAgICAgICAgbGV0IHJlbW92ZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1maXQtdGV4dC13aWR0aFwiKTtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJlbW92ZSkpIHJldHVybjtcblxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudFxuXG4gICAgICAgICAgICBsZXQgdGV4dFcgPSB0aGlzLm5pZGdldC5zY3JvbGxXaWR0aDtcbiAgICAgICAgICAgIGxldCBjb250VyA9IHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICBjb250VyA9IGNvbnRXIC0gcmVtb3ZlO1xuICAgICAgICAgICAgbGV0IGR3ID0gY29udFcvdGV4dFc7XG4gICAgICAgICAgICBsZXQgY29tcHV0ZWRGb250U2l6ZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0LCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKCdmb250LXNpemUnKVxuICAgICAgICAgICAgY29tcHV0ZWRGb250U2l6ZSA9IHBhcnNlSW50KGNvbXB1dGVkRm9udFNpemUpO1xuICAgICAgICAgICAgY29tcHV0ZWRGb250U2l6ZSA9IE1hdGgucm91bmQoY29tcHV0ZWRGb250U2l6ZSk7XG4gICAgICAgICAgICBsZXQgbmV3Rm9udFNpemUgPSBNYXRoLnJvdW5kKGNvbXB1dGVkRm9udFNpemUgKiBkdyk7XG4gICAgICAgICAgICBsZXQgaCA9IHRoaXMubmlkZ2V0Lm9mZnNldEhlaWdodFxuXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoY29tcHV0ZWRGb250U2l6ZSAtIG5ld0ZvbnRTaXplKSA8PSAyKSByZXR1cm47XG5cbiAgICAgICAgICAgIGlmIChuZXdGb250U2l6ZSA+IGgpIG5ld0ZvbnRTaXplID0gaDtcblxuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBuZXdGb250U2l6ZSArIFwicHhcIjtcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBsaW5lIGhlaWdodCB0byB0aGUgb2Zmc2V0IGhlaWdodCBtdWx0aXBsaWVkIGJ5IHJhdGlvLlxuICAgICAqL1xuICAgIG5pZGdldFZlcnRBbGlnblRleHQoKXtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LXZlcnQtYWxpZ24tdGV4dFwiKTtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xuXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaCA9IHRoaXMubmlkZ2V0Lm9mZnNldEhlaWdodCAqIHJhdGlvO1xuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUubGluZUhlaWdodCA9IGggKyBcInB4XCI7XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRTdHlsZTsiLCIndXNlIHN0cmljdCc7XG5jbGFzcyBUcmFuc2Zvcm17XG4gICAgY29uc3RydWN0b3IodmFsdWUpe1xuICAgICAgICBsZXQgaW5kZXhPZiA9IHZhbHVlLmluZGV4T2YoXCIoXCIpO1xuICAgICAgICB0aGlzLm5hbWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgaW5kZXhPZik7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcodGhpcy5uYW1lLmxlbmd0aCArIDEsIHZhbHVlLmxlbmd0aCAtIDEpO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIiwgXCIgKyB0aGlzLnZhbHVlKTtcbiAgICB9XG4gICAgXG4gICAgdG9TdHJpbmcoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArIFwiKFwiICsgdGhpcy52YWx1ZSArIFwiKVwiO1xuICAgIH0gICAgXG59XG5cbmNsYXNzIFRyYW5zZm9ybWVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG4gICAgXG4gICAgYXBwZW5kKCl7XG4gICAgICAgIGxldCBjb21wdXRlZFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50KVtcInRyYW5zZm9ybVwiXTtcbiAgICAgICAgaWYgKGNvbXB1dGVkU3R5bGUgIT09IFwibm9uZVwiKSB0aGlzLnB1c2goY29tcHV0ZWRTdHlsZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBjbGVhcigpe1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gXCJcIjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHVuc2hpZnQodmFsdWUpe1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gdmFsdWUgKyBcIiBcIiArIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XG4gICAgfVxuICAgIFxuICAgIHB1c2godmFsdWUpe1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSArIFwiIFwiICsgdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gICAgXG4gICAgXG4gICAgc2hpZnQoKXtcbiAgICAgICAgbGV0IGFycmF5ID0gdGhpcy5zcGxpdCgpO1xuICAgICAgICBpZiAoYXJyYXkubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcbiAgICAgICAgYXJyYXkuc2hpZnQoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IGFycmF5LmpvaW4oXCIgXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcG9wKCl7XG4gICAgICAgIGxldCBhcnJheSA9IHRoaXMuc3BsaXQoKTtcbiAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIFwiXCI7XG4gICAgICAgIGFycmF5LnBvcCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XG4gICAgICAgIHJldHVybiB0aGlzOyAgICAgIFxuICAgIH1cbiAgICBcbiAgICByZXBsYWNlKHZhbHVlKXtcbiAgICAgICAgbGV0IG5ld1RyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0odmFsdWUpO1xuICAgICAgICBsZXQgYXJyYXkgPSB0aGlzLnNwbGl0KCk7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBlbnRyeSA9IGFycmF5W2ldO1xuICAgICAgICAgICAgbGV0IHRyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0oZW50cnkpO1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybS5uYW1lID09PSBuZXdUcmFuc2Zvcm0ubmFtZSl7XG4gICAgICAgICAgICAgICAgYXJyYXlbaV0gPSBuZXdUcmFuc2Zvcm0udG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHNwbGl0KCl7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XG4gICAgICAgIGxldCBzdGFydCA9IDA7XG4gICAgICAgIGxldCBydmFsdWUgPSBbXTtcbiAgICAgICAgbGV0IGxhc3QgPSAnJztcbiAgICAgICAgbGV0IHNraXAgPSBmYWxzZTtcbiAgICAgICAgbGV0IG5lc3RlZFAgPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBpZiAoIXNraXAgJiYgdmFsdWVbaV0gPT09ICcgJyAmJiBsYXN0ID09PSAnICcpe1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghc2tpcCAmJiB2YWx1ZVtpXSA9PT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgcnZhbHVlLnB1c2godmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCBpKSk7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVtpXSA9PT0gJygnKSB7XG4gICAgICAgICAgICAgICAgbmVzdGVkUCsrO1xuICAgICAgICAgICAgICAgIHNraXAgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVtpXSA9PT0gJyknKSB7XG4gICAgICAgICAgICAgICAgbmVzdGVkUC0tO1xuICAgICAgICAgICAgICAgIGlmIChuZXN0ZWRQID09PSAwKSBza2lwID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0ID0gdmFsdWVbaV07XG4gICAgICAgIH1cbiAgICAgICAgcnZhbHVlLnB1c2godmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCB2YWx1ZS5sZW5ndGgpKTtcbiAgICAgICAgcmV0dXJuIHJ2YWx1ZTtcbiAgICB9XG4gICAgXG4gICAgdG9TdHJpbmcoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zZm9ybWVyOyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIEEgTmlkZ2V0IHRoYXQgY2hhbmdlcyB0aGUgaW1hZ2UgZm9yIGhvdmVyLCBkaXNhYmxlZCwgcHJlc3MsIGFuZCBpZGxlLlxuICogRmlyZXMgYSBjbGljayBldmVudCB3aGVuIGNsaWNrZWQuXG4gKlxuICogV2lsbCBzZXQgdGhlIGN1cnJlbnQgc3RhdGUgYXMgZGF0YS1zdGF0ZSBzbyB0aGF0IGNzcyBjYW4gYWNjZXNzIGl0LlxuICovXG5jbGFzcyBOaWRnZXRCdXR0b24gZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgICAgICB0aGlzLmFscGhhVG9sZXJhbmNlID0gMDsgLy8gYWxwaGEgbmVlZHMgdG8gYmUgPiB0b2xlcmFuY2UgdG8gdHJpZ2dlciBldmVudHMuXG5cbiAgICAgICAgdGhpcy5zdHJpbmdIb3ZlciA9IFwibmlkZ2V0LWJ1dHRvbi1zdGF0ZVtzdGF0ZT0nSE9WRVInXVwiO1xuICAgICAgICB0aGlzLnN0cmluZ0Rpc2FibGVkID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdESVNBQkxFRCddXCI7XG4gICAgICAgIHRoaXMuc3RyaW5nUHJlc3MgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J1BSRVNTJ11cIjtcbiAgICAgICAgdGhpcy5zdHJpbmdJZGxlID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdJRExFJ11cIjtcblxuICAgICAgICB0aGlzLnN0YXRlID0gXCJpZGxlXCI7XG4gICAgfVxuXG4gICAgaXNJblNldCgpIHtcbiAgICAgICAgbGV0IHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgICAgICAgd2hpbGUgKHBhcmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAocGFyZW50LnRhZ05hbWUgPT09IFwiTklER0VULUJVVFRPTi1TRVRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIG5pZGdldFJlYWR5KCkge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0Rpc2FibGVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc0luU2V0KCkpIHJldHVybjtcblxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIHRoaXMubW91c2VFbnRlcik7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZUxlYXZlKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2VQcmVzcyk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVJlbGVhc2UpO1xuXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgaXNVbmRlcihldmVudCkge1xuICAgICAgICBsZXQgZWxlbWVudHMgPSBkb2N1bWVudC5lbGVtZW50c0Zyb21Qb2ludChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmluZGV4T2YodGhpcy5hY3RpdmVOaWRnZXQpID09IC0xKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmFjdGl2ZU5pZGdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYIC0gcmVjdC54O1xuICAgICAgICBsZXQgeSA9IGV2ZW50LmNsaWVudFkgLSByZWN0Lnk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudGVzdEFscGhhKHgsIHkpO1xuICAgIH1cblxuICAgIGdldCBkaXNhYmxlZCgpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmRpc2FibGVkO1xuICAgIH1cblxuICAgIHNldCBkaXNhYmxlZCh2YWx1ZSkge1xuICAgICAgICBzdXBlci5kaXNhYmxlZCA9IHZhbHVlO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0Rpc2FibGVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImluXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcInByZXNzXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdQcmVzcztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW91c2VSZWxlYXNlKGUpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0hvdmVyO1xuICAgIH1cblxuICAgIG1vdXNlUHJlc3MoZSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJwcmVzc1wiO1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nUHJlc3M7XG4gICAgfVxuXG4gICAgaGlkZUFsbEltYWdlcygpIHtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nSG92ZXIpLmhpZGUoKTtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nRGlzYWJsZWQpLmhpZGUoKTtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nUHJlc3MpLmhpZGUoKTtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nSWRsZSkuaGlkZSgpO1xuICAgIH1cblxuICAgIHNldCBhY3RpdmVOaWRnZXQoc2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5oaWRlQWxsSW1hZ2VzKCk7XG4gICAgICAgIHRoaXMuX2FjdGl2ZU5pZGdldCA9IHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIHRoaXMuX2FjdGl2ZU5pZGdldC5zaG93KCk7XG4gICAgfVxuXG4gICAgZ2V0IGFjdGl2ZU5pZGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGl2ZU5pZGdldDtcbiAgICB9XG5cbiAgICBzZXQgc3RhdGUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgc3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtc3RhdGVcIik7XG4gICAgfVxuXG4gICAgdGVzdEFscGhhKHgsIHkpIHtcbiAgICAgICAgbGV0IHBpeGVsID0gdGhpcy5hY3RpdmVOaWRnZXQuZ2V0UGl4ZWwoeCwgeSk7XG4gICAgICAgIHJldHVybiBwaXhlbFszXSA+IHRoaXMuYWxwaGFUb2xlcmFuY2U7XG4gICAgfVxuXG4gICAgbW91c2VMZWF2ZSgpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdJZGxlO1xuICAgIH1cblxuICAgIG1vdXNlQWN0aXZlKCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XG4gICAgfVxuXG4gICAgbW91c2VNb3ZlKGUpIHtcbiAgICAgICAgaWYgKCF0aGlzLnRlc3RBbHBoYShlLmNsaWVudFgsIGUuY2xpZW50WSkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdJZGxlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcbiAgICAgICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XG4gICAgICAgIH1cbiAgICB9XG59XG47XG5cbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1idXR0b24nLCBOaWRnZXRCdXR0b24pO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRCdXR0b247XG5cbiIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XHJcblxyXG5jbGFzcyBOaWRnZXRCdXR0b25TZXQgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xyXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgdGhpcy5hbHBoYVRvbGVyYW5jZSA9IDA7IC8vIGFscGhhIG5lZWRzIHRvIGJlID4gdG9sZXJhbmNlIHRvIHRyaWdnZXIgZXZlbnRzLlxyXG5cclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZVByZXNzKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VSZWxlYXNlKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmUpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZUxlYXZlKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVkKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbmlkZ2V0UmVhZHkoKXtcclxuICAgICAgICB0aGlzLmJ1dHRvbnMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoXCJuaWRnZXQtYnV0dG9uXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlUHJlc3MoZSl7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNVbmRlcihlKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZVByZXNzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJwcmVzc1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlUmVsZWFzZShlKXtcclxuICAgICAgICB0aGlzLnN0YXRlID0gXCJvdXRcIjtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5zdGF0ZSA9PSBcInByZXNzXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJidXR0b24tY2xpY2tlZFwiLCB7ZGV0YWlsOiBlbGVtZW50fSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZVJlbGVhc2UoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcImhvdmVyXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VNb3ZlKGUpe1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5idXR0b25zKXtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNVbmRlcihlKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZUFjdGl2ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQubW91c2VMZWF2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlTGVhdmUoZSl7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5tb3VzZUxlYXZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXQgc3RhdGUodmFsdWUpe1xyXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiLCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHN0YXRlKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiKTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWJ1dHRvbi1zZXQnLCBOaWRnZXRCdXR0b25TZXQpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEJ1dHRvblNldDsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIEEgTmlkZ2V0IHRoYXQgY2hhbmdlcyB0aGUgaW1hZ2UgZm9yIGhvdmVyLCBkaXNhYmxlZCwgcHJlc3MsIGFuZCBpZGxlLlxuICogRmlyZXMgYSBjbGljayBldmVudCB3aGVuIGNsaWNrZWQuXG4gKiBcbiAqIFRoaXMgaXMgdGhlIGh0bWwgZWxlbWVudCBcIm5pZGdldC1idXR0b25cIi5cbiAqIElmIHRoZSBuaWRnZXQtYnV0dG9uIGhhcyB0aGUgYXR0cmlidXRlIGBpbWctcHJlZml4ID0gXCJwcmVmaXhcImAgdGhlbiB0aGUgXG4gKiBmb2xsb3dpbmcgaW1hZ2VzLiAgYGltZy1zdWZmaXhgID0gXCJzdWZmaXhcIiB3aWxsIG92ZXJyaWRlIHRoZSBcIi5wbmdcIi5cbiAqIHdpbGwgYmUgdXNlZDpcbiAqIC0gcHJlZml4LWhvdmVyLnBuZ1xuICogLSBwcmVmaXgtZGlzYWJsZWQucG5nXG4gKiAtIHByZWZpeC1wcmVzcy5wbmdcbiAqIC0gcHJlZml4LWlkbGUucG5nXG4gKi9cbmNsYXNzIE5pZGdldEJ1dHRvblN0YXRlIGV4dGVuZHMgTmlkZ2V0IHtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgIH1cblxuICAgIG5pZGdldFJlYWR5KCl7XG4gICAgICAgIHRoaXMuaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgdGhpcy5pbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIHRoaXMuZ2V0QXR0cmlidXRlKFwiaW1hZ2Utc3JjXCIpKTtcbiAgICAgICAgdGhpcy5hcHBlbmQodGhpcy5pbWcpO1xuICAgIH1cblxuICAgIHNob3coKXtcbiAgICAgICAgc3VwZXIuc2hvdygpO1xuICAgICAgICB0aGlzLmxvYWRDYW52YXMoKTtcbiAgICB9XG5cbiAgICBsb2FkQ2FudmFzKCl7XG4gICAgICAgIGlmICghdGhpcy5pbWcgfHwgdGhpcy5jYW52YXMpIHJldHVybjtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmltZy5uYXR1cmFsV2lkdGg7XG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuaW1nLm5hdHVyYWxIZWlnaHQ7XG4gICAgICAgIHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJykuZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzO1xuICAgIH1cblxuICAgIGdldFBpeGVsKHgsIHkpe1xuICAgICAgICB0aGlzLmxvYWRDYW52YXMoKTtcbiAgICAgICAgbGV0IGR4ID0gdGhpcy5jYW52YXMud2lkdGggLyB0aGlzLm9mZnNldFdpZHRoO1xuICAgICAgICBsZXQgZHkgPSB0aGlzLmNhbnZhcy5oZWlnaHQgLyB0aGlzLm9mZnNldEhlaWdodDtcbiAgICAgICAgbGV0IHBpeGVsID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5nZXRJbWFnZURhdGEoZHggKiB4LCBkeSAqIHksIDEsIDEpLmRhdGE7XG4gICAgICAgIHJldHVybiBwaXhlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgc3RhdGUgdG8gSE9WRVIsIERJU0FCTEVELCBQUkVTUywgSURMRS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHN0YXRlXG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHNldCBzdGF0ZShzdGF0ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInN0YXRlXCIsIHN0YXRlLnRvVXBwZXJDYXNlKCkpO1xuICAgIH1cblxuICAgIGdldCBzdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cmlidXRlKFwic3RhdGVcIik7XG4gICAgfVxuXG4gICAgc2V0IHNvdXJjZShpbWcpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgaW1nKTtcbiAgICB9XG5cbiAgICBnZXQgc291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyaWJ1dGUoXCJzcmNcIik7XG4gICAgfVxufVxuO1xuXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtYnV0dG9uLXN0YXRlJywgTmlkZ2V0QnV0dG9uU3RhdGUpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRCdXR0b25TdGF0ZTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBjb21wb25lbnQgdGhhdCBoYXMgZXZlbnRzIGZvciBhZGRpbmcgbmlkZ2V0cywgcmVtb3ZpbmcgbmlkZ2V0cywgYW5kIFxuICogcmVzaXppbmcgdGhlIGNvbnRhaW5lci4gIFdoZW4gdGhlIGNvbnRhaW5lciBzaXplIGlzIGNoYW5nZWQsIHRoZSBudW1iZXJcbiAqIG9mIGNvbXBvbmVudHMgY2hhbmdlLCBvciB0aGUgbGF5b3V0IGF0dHJpYnV0ZSBjaGFuZ2VzLCB0aGUgZG9MYXlvdXQgZnVuY3Rpb25cbiAqIGlzIGNhbGxlZC5cbiAqIFxuICogVGhlIGNvbXBvbmVudHMgYXJlIGFycmFnZWQgYWNjb3JkaW5nIHRvIHRoZSBzZWxlY3RlZCBsYXlvdXQgYXR0cmlidXRlLiAgSWYgXG4gKiBubyBsYXlvdXQgYXR0cmlidXRlIGlzIGNob3NlbiwgZG9MYXlvdXQgaXMgc3RpbGwgY2FsbGVkIGFzIGl0IGlzIGFzc3VtZWQgXG4gKiBhIGN1c3RvbSBmdW5jdGlvbiBoYXMgYmVlbiBwcm92aWRlZC5cbiAqL1xuXG5jbGFzcyBOaWRnZXRDb250YWluZXIgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICAgICAgbGV0IHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHRoaXMuZG9MYXlvdXQpO1xuICAgICAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKHRoaXMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4gW05pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGVdO1xuICAgIH1cblxuICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgaWYgKG9sZFZhbHVlID09PSBuZXdWYWx1ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmRvTGF5b3V0KCk7XG4gICAgfVxuXG4gICAgc2V0IGxheW91dCh2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShOaWRnZXRDb250YWluZXIubGF5b3V0QXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IGxheW91dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGUpO1xuICAgIH0gICAgICBcblxuICAgIGRvTGF5b3V0KCkge1xuICAgICAgICBpZiAoIXRoaXMubGF5b3V0KSByZXR1cm47XG4gICAgICAgIGlmICghTGF5b3V0c1t0aGlzLmxheW91dF0pIHRocm93IGBpbnZhbGlkIGxheW91dDogJHt0aGlzLmxheW91dH1gO1xuICAgICAgICBMYXlvdXRzW3RoaXMubGF5b3V0XTtcbiAgICB9XG59XG5cbmNsYXNzIExheW91dHMge1xuICAgIC8qKlxuICAgICAqIEZpdCBhbGwgbmlkZ2V0cyBldmVubHkgaW4gYSBob3Jpem9udGFsIHJvdy5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IG5pZGdldFxuICAgICAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcm93KG5pZGdldCkge1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpemUpO1xuICAgIH1cbn1cblxuXG5OaWRnZXRDb250YWluZXIubGF5b3V0QXR0cmlidXRlID0gXCJsYXlvdXRcIjtcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1jb250YWluZXInLCBOaWRnZXRDb250YWluZXIpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRDb250YWluZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0XCIpO1xuY29uc3QgVHJhbnNmb3JtZXIgPSByZXF1aXJlKFwiLi4vVHJhbnNmb3JtZXJcIik7XG5cbi8qKlxuICogRG9uJ3QgZm9yZ2V0IHRvIHNldCAnaXMnIHdoZW4gcHV0dGluZyBlbGVtZW50IGRpcmVjdGx5IGluIGh0bWwgYXMgb3Bwb3NlZCB0b1xuICogcHJvZ3JhbWljYWxseS5cbiAqIDxpbWcgaXM9XCJyZWdpc3RlcmVkLW5hbWVcIiBzcmM9XCJpbWFnZS5wbmdcIj48L2ltZz5cbiAqIFxuICogaW5jbHVkZSBhIGN1c3RvbSBlbGVtZW50IGRlZmluaXRpb24gYXQgdGhlIGVuZCBvZiB0aGUgY2xhc3MuPGJyPlxuICogd2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgncmVnaXN0ZXJlZC1uYW1lJywgQ2xhc3MsIHtleHRlbmRzOiBcImltZ1wifSk7XG4gKi9cbmNsYXNzIE5pZGdldEhUTUxJbWFnZSBleHRlbmRzIEhUTUxJbWFnZUVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmxhc3REaXNwbGF5ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybWVyKHRoaXMpO1xuICAgIH1cblxuICAgIHNjYWxlKGR3LCBkaCkge1xuICAgICAgICBpZiAoIWRoKSBkaCA9IGR3O1xuICAgICAgICBsZXQgdyA9IHRoaXMud2lkdGggKiBkdztcbiAgICAgICAgbGV0IGggPSB0aGlzLmhlaWdodCAqIGRoO1xuICAgICAgICB0aGlzLndpZHRoID0gdztcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoO1xuICAgIH0gICAgICAgIFxuXG4gICAgc2V0IHNyYyh2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInNyY1wiLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IHNyYygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwic3JjXCIpO1xuICAgIH1cblxuICAgIGxvY2F0ZShsZWZ0LCB0b3ApIHtcbiAgICAgICAgdGhpcy5sZWZ0ID0gbGVmdDtcbiAgICAgICAgdGhpcy50b3AgPSB0b3A7XG4gICAgfVxuXG4gICAgZ2V0IGxlZnQoKSB7XG4gICAgICAgIGxldCB3ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykubGVmdDtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodyk7XG4gICAgfVxuXG4gICAgZ2V0IHRvcCgpIHtcbiAgICAgICAgbGV0IGggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS50b3A7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGgpO1xuICAgIH1cblxuICAgIHNldCBsZWZ0KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc3R5bGUubGVmdCA9IHZhbHVlICsgXCJweFwiO1xuICAgIH1cblxuICAgIHNldCB0b3AodmFsdWUpIHtcbiAgICAgICAgdGhpcy5zdHlsZS50b3AgPSB2YWx1ZSArIFwicHhcIjtcbiAgICB9ICAgIFxuXG4gICAgc2V0IHdpZHRoKHcpIHtcbiAgICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IHcgKyBcInB4XCI7XG4gICAgfVxuXG4gICAgc2V0IGhlaWdodCh3KSB7XG4gICAgICAgIHRoaXMuc3R5bGUuaGVpZ2h0ID0gdyArIFwicHhcIjtcbiAgICB9XG5cbiAgICBnZXQgd2lkdGgoKSB7XG4gICAgICAgIGxldCB3ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykud2lkdGg7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHcpO1xuICAgIH1cblxuICAgIGdldCBoZWlnaHQoKSB7XG4gICAgICAgIGxldCBoID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykuaGVpZ2h0O1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChoKTtcbiAgICB9ICAgICAgICBcblxuICAgIHNob3coKSB7XG4gICAgICAgIGlmICh0aGlzLmxhc3REaXNwbGF5KSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSB0aGlzLmxhc3REaXNwbGF5O1xuICAgICAgICAgICAgdGhpcy5sYXN0RGlzcGxheSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoaWRlKCkge1xuICAgICAgICB0aGlzLmxhc3REaXNwbGF5ID0gdGhpcy5zdHlsZS5kaXNwbGF5O1xuICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG5cbiAgICBzZXQgZGlzcGxheSh2YWx1ZSl7XG4gICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IHZhbHVlO1xuICAgIH1cbiAgICBcbiAgICBnZXQgZGlzcGxheSgpe1xuICAgICAgICByZXR1cm4gd2luZG93LmNhbGN1bGF0ZVN0eWxlKHRoaXMpW1wiZGlzcGxheVwiXTtcbiAgICB9XG5cbiAgICBkZXRhY2goKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcih0aGlzKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBzZXQgZGlzYWJsZWQodmFsdWUpe1xuICAgICAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgZGlzYWJsZWQoKXtcbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dHJpYnV0ZShcImRpc2FibGVkXCIpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xuICAgIH0gICAgXG4gICAgXG4gICAgY2xlYXJQb3MoKXtcbiAgICAgICAgdGhpcy5zdHlsZS50b3AgPSBudWxsO1xuICAgICAgICB0aGlzLnN0eWxlLmxlZnQgPSBudWxsO1xuICAgIH1cblxuICAgIGNsZWFyRGltcygpe1xuICAgICAgICB0aGlzLnN0eWxlLndpZHRoID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdHlsZS5oZWlnaHQgPSBudWxsO1xuICAgIH0gICAgXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0SFRNTEltYWdlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBOaWRnZXQgdGhhdCBjb250YWlucyBpbWFnZXMuXG4gKi9cbmNsYXNzIE5pZGdldEltYWdlIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcihzcmMpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgIGlmIChzcmMpIHRoaXMuc3JjID0gc3JjO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCl7XG4gICAgICAgIGxldCBzcmMgPSB0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXRJbWFnZS5zcmNBdHRyaWJ1dGUpOyAgICAgICAgXG4gICAgICAgIGlmIChzcmMpIHRoaXMuaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCBzcmMpOyAgICAgICBcbiAgICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLmltZyk7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgZ2V0IHNyYygpe1xuICAgICAgICByZXR1cm4gdGhpcy5pbWcuZ2V0QXR0cmlidXRlKFwic3JjXCIpO1xuICAgIH1cblxuICAgIHNldCBzcmModmFsdWUpe1xuICAgICAgICB0aGlzLmltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdmFsdWUpO1xuICAgIH1cblxuICAgIHNpemUod2lkdGgsIGhlaWdodCl7XG4gICAgICAgIHRoaXMuc3R5bGUud2lkdGggPSB3aWR0aFxuICAgICAgICB0aGlzLnN0eWxlLmhlaWdodCA9IGhlaWdodFxuICAgICAgICB0aGlzLmltZy5zdHlsZS53aWR0aCA9IHdpZHRoXG4gICAgICAgIHRoaXMuaW1nLnN0eWxlLmhlaWdodCA9IGhlaWdodFxuICAgIH1cbiAgICBcbiAgICBzY2FsZShkdywgZGgpe1xuICAgICAgICBpZiAoIWRoKSBkaCA9IGR3O1xuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLm9mZnNldFdpZHRoICogZHc7XG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLm9mZnNldEhlaWdodCAqIGRoO1xuICAgICAgICB0aGlzLnNpemUoYCR7d2lkdGh9cHhgLCBgJHtoZWlnaHR9cHhgKTtcbiAgICB9XG4gICAgXG4gICAgc2hvdygpe1xuICAgICAgICBpZiAodGhpcy5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIil7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5zdHlsZS5kaXNwbGF5O1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGhpZGUoKXtcbiAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxufVxuXG5OaWRnZXRJbWFnZS5zcmNBdHRyaWJ1dGUgPSBcInNyY1wiO1xud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWltYWdlJywgTmlkZ2V0SW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRJbWFnZTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyoqXG4gKiBXaGVuIHVzaW5nIC0tbmlkZ2V0LWZpdC10ZXh0LCBkbyBub3QgaW5jbHVkZSBoZWlnaHQgYW5kIHdpZHRoIGF0dHJpYnV0ZXMuXG4gKiBBIGZvbnQgc2l6ZSBjYW4gYmUgdXNlZCBhcyBhIHN0YXJ0aW5nIHBvaW50LlxuICovXG5jbGFzcyBGaXRUZXh0IHtcbiAgICBjb25zdHJ1Y3RvcihuaWRnZXQpe1xuICAgICAgICB0aGlzLm5pZGdldCA9IG5pZGdldDtcbiAgICAgICAgdGhpcy5sb2NrID0gXCJub25lXCI7XG4gICAgICAgIHRoaXMucGFyc2VBcmd1bWVudHMoKTtcbiAgICB9XG5cbiAgICBsaXN0ZW4oKXtcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKT0+dGhpcy5kZWxheVJlc2l6ZSh0aGlzLmhWYWx1ZSwgdGhpcy53VmFsdWUpKTtcbiAgICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQpO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XG4gICAgICAgIHRoaXMuZGVsYXkgPSAyNTtcbiAgICAgICAgdGhpcy5kZWxheVJlc2l6ZSh0aGlzLmhWYWx1ZSwgdGhpcy53VmFsdWUpO1xuICAgICAgICB0aGlzLnN0b3AgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBkZWxheVJlc2l6ZShoVmFsdWUsIHdWYWx1ZSl7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcbiAgICAgICAgaWYgKHRoaXMudGltZW91dCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PnRoaXMub25SZXNpemUoaFZhbHVlLCB3VmFsdWUpLCB0aGlzLmRlbGF5KTtcbiAgICB9XG5cbiAgICBub3RpZnkoaFZhbHVlLCB3VmFsdWUpe1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdGlmeVwiKTtcbiAgICAgICAgdGhpcy5zdG9wID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGVsYXlSZXNpemUoaFZhbHVlLCB3VmFsdWUpO1xuICAgIH1cblxuICAgIHBhcnNlQXJndW1lbnRzKCl7XG4gICAgICAgIGxldCBhcmdzID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0XCIpO1xuXG4gICAgICAgIGlmICghYXJncyB8fCBhcmdzID09PSBmYWxzZSB8fCBhcmdzID09PSBcImZhbHNlXCIpe1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5oVmFsdWUgPSB0aGlzLndWYWx1ZSA9IHRydWU7XG5cbiAgICAgICAgaWYgKHR5cGVvZihhcmdzKSA9PSBcInN0cmluZ1wiKXtcbiAgICAgICAgICAgIGxldCBvYmogPSBKU09OLnBhcnNlKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKG9ialtcImZpdFwiXSAhPT0gdW5kZWZpbmVkICYmIG9ialtcImZpdFwiXSA9PT0gXCJ3aWR0aFwiKSB0aGlzLmhWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKG9ialtcImZpdFwiXSAhPT0gdW5kZWZpbmVkICYmIG9ialtcImZpdFwiXSA9PT0gXCJoZWlnaHRcIikgdGhpcy53VmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChvYmpbXCJsb2NrXCJdICE9PSB1bmRlZmluZWQpIHRoaXMubG9jayA9IChvYmpbXCJsb2NrXCJdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUmVzaXplKGhWYWx1ZSwgd1ZhbHVlKXtcbiAgICAgICAgZGVsZXRlIHRoaXMudGltZW91dDtcblxuICAgICAgICBpZiAodGhpcy5zdG9wKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLm5pZGdldC50ZXh0Q29udGVudCA9PT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgPT09IDApIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0V2lkdGggPT09IDApIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMubmlkZ2V0LnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiKSByZXR1cm47XG5cbiAgICAgICAgaWYgKCFoVmFsdWUgJiYgIXdWYWx1ZSkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBoRGlyID0gdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLSB0aGlzLm5pZGdldC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIGxldCB3RGlyID0gdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAtIHRoaXMubmlkZ2V0LnNjcm9sbFdpZHRoO1xuXG4gICAgICAgIGlmICghaFZhbHVlKSBoRGlyID0gMDtcbiAgICAgICAgaWYgKCF3VmFsdWUpIHdEaXIgPSAwO1xuXG4gICAgICAgIGxldCBkaXIgPSBNYXRoLnNpZ24oaERpciB8IHdEaXIpOyAvLyB3aWxsIHByZWZlciB0byBzaHJpbmtcbiAgICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAwKSB0aGlzLmRpcmVjdGlvbiA9IGRpcjsgLy8ga2VlcCBwcmV2aW91cyBkaXJlY3Rpb25cblxuICAgICAgICBsZXQgZm9udFNpemUgPSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KVtcImZvbnQtc2l6ZVwiXSlcbiAgICAgICAgbGV0IG5ld1NpemUgPSBmb250U2l6ZSArICh0aGlzLmRpcmVjdGlvbik7XG5cbiAgICAgICAgaWYgKG5ld1NpemUgIT09IGZvbnRTaXplICYmIHRoaXMuZGlyZWN0aW9uID09PSBkaXIpIHtcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gbmV3U2l6ZSArIFwicHhcIjtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVvdXQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+dGhpcy5vblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSksIHRoaXMuZGVsYXkpO1xuICAgICAgICB9IGVsc2UgaWYgKGRpciA8IDAgJiYgdGhpcy5kaXJlY3Rpb24gPiAwKSB7IC8vIHJldmVyc2UgZGlyZWN0aW9uIGlmIGdyb3dpbmcgdG9vIGxhcmdlXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IC0xO1xuICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+dGhpcy5vblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSksIHRoaXMuZGVsYXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMubG9jayA9PT0gXCJ2aFwiKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZvbnRSYXRpbyA9IG5ld1NpemUgLyB3aW5kb3cuaW5uZXJIZWlnaHQgKiAxMDA7XG4gICAgICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBmb250UmF0aW8gKyBcInZoXCI7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5sb2NrID09PSBcInZ3XCIpe1xuICAgICAgICAgICAgICAgIGxldCBmb250UmF0aW8gPSBuZXdTaXplIC8gd2luZG93LmlubmVyV2lkdGggKiAxMDA7XG4gICAgICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBmb250UmF0aW8gKyBcInZ3XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBIG5pZGdldCBlbGVtZW50IGZvciBkaXNwbGF5aW5nIHRleHQuXG4gKiBwdXQgJy0tbmlkZ2V0LWZpdC10ZXh0OiAxLjA7JyBpbnRvIGNzcyBmb3IgdGhpcyBlbGVtZW50IHRvIGVuYWJsZSBzY2FsaW5nLlxuICogc2VlOiBOaWRnZXRTdHlsZS5qc1xuICovXG5jbGFzcyBOaWRnZXRUZXh0IGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnNbXCJmaXQtdGV4dC13aWR0aC10b2xlcmFuY2VcIl0gPSAwLjAyO1xuICAgICAgICB0aGlzLmZpdFRleHQgPSBuZXcgRml0VGV4dCh0aGlzKTtcbiAgICB9XG5cbiAgICByZW1vdmUoKXtcbiAgICAgICAgaWYgKHRoaXMuZml0VGV4dCkge1xuICAgICAgICAgICAgdGhpcy5maXRUZXh0LnN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5maXRUZXh0Lm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlci5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICAgICAgbGV0IGZpdFByb3AgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1maXQtdGV4dFwiKTtcblxuICAgICAgICBpZiAoZml0UHJvcCAhPT0gdW5kZWZpbmVkICYmIGZpdFByb3AgIT09IFwiXCIpe1xuICAgICAgICAgICAgdGhpcy5maXRUZXh0Lmxpc3RlbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0IHRleHQodmFsdWUpe1xuICAgICAgICB0aGlzLmlubmVyVGV4dCA9IHZhbHVlO1xuICAgICAgICBpZiAodGhpcy5maXRUZXh0ICYmIHRoaXMuZml0VGV4dC5zdG9wID09PSBmYWxzZSl7XG4gICAgICAgICAgICB0aGlzLmZpdFRleHQuZGVsYXlSZXNpemUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCB0ZXh0KCl7XG4gICAgICAgIHJldHVybiB0aGlzLmlubmVyVGV4dDtcbiAgICB9XG5cbiAgICBzY2FsZShhbW91bnQpIHtcbiAgICAgICAgbGV0IHN0eWxlRm9udFNpemUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKFwiZm9udC1zaXplXCIpO1xuICAgICAgICBsZXQgZm9udFNpemUgPSBwYXJzZUZsb2F0KHN0eWxlRm9udFNpemUpO1xuICAgICAgICB0aGlzLnN0eWxlLmZvbnRTaXplID0gKGZvbnRTaXplICogYW1vdW50KSArIFwicHhcIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGxpbmUgaGVpZ2h0IHRvIHRoZSBvZmZzZXQgaGVpZ2h0IG11bHRpcGxpZWQgYnkgcmF0aW8uXG4gICAgICogQ2FsbGluZyB0aGlzIG1ldGhvZCBkaXJlY3Rvcnkgd2lsbCBvdmVycmlkZSB0aGUgdmFsdWUgc2V0IGJ5IGNzc1xuICAgICAqL1xuICAgIG5pZGdldFZlcnRBbGlnblRleHQodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KFwiLS1uaWRnZXQtdmVydC1hbGlnbi10ZXh0XCIsIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvblJlc2l6ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCByYXRpbyA9IGdldENvbXB1dGVkU3R5bGUodGhpcykuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LXZlcnQtYWxpZ24tdGV4dFwiKTtcbiAgICAgICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjtcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5vZmZzZXRIZWlnaHQgKiByYXRpbztcbiAgICAgICAgICAgIHRoaXMuc3R5bGUubGluZUhlaWdodCA9IGggKyBcInB4XCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vYnNlcnZlcnMudmVydEFsaWduVGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy52ZXJ0QWxpZ25UZXh0ID0gbmV3IFJlc2l6ZU9ic2VydmVyKG9uUmVzaXplKTtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLnZlcnRBbGlnblRleHQub2JzZXJ2ZSh0aGlzKVxuICAgICAgICB9XG4gICAgICAgIG9uUmVzaXplKClcbiAgICB9XG5cbiAgICB2ZXJ0QWxpZ25UZXh0KHJhdGlvID0gMS4wKXtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xuICAgICAgICBsZXQgaCA9IHRoaXMub2Zmc2V0SGVpZ2h0ICogcmF0aW87XG4gICAgICAgIHRoaXMuc3R5bGUubGluZUhlaWdodCA9IGggKyBcInB4XCI7XG4gICAgfVxufVxuO1xuXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtdGV4dCcsIE5pZGdldFRleHQpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRUZXh0OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgZHJhZ0hhbmRsZXIgPSByZXF1aXJlKFwiLi4vRHJhZ0hhbmRsZXJcIikuaW5zdGFuY2U7XG5cblxuZnVuY3Rpb24gb25EcmFnU3RhcnQoZXZlbnQpeyAgICBcbiAgICBkcmFnSGFuZGxlci5zZXQodGhpcyk7XG4gICAgd2luZG93LnggPSB0aGlzO1xuICAgIGNvbnNvbGUubG9nKFwiJ1wiICsgdGhpcy5uYW1lKCkgKyBcIidcIik7XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnU3RhcnRcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uRHJhZ0VuZChldmVudCl7XG4gICAgaWYgKGRyYWdIYW5kbGVyLmdldCgpICE9PSB0aGlzKSByZXR1cm47XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnRW5kXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xuICAgIGRyYWdIYW5kbGVyLmNsZWFyKCk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuc2V0QXR0cmlidXRlKFwiZHJhZ2dhYmxlXCIsIFwidHJ1ZVwiKTsgICBcbiAgICBcbiAgICBuaWRnZXQub25EcmFnU3RhcnQgPSBvbkRyYWdTdGFydC5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uRHJhZ0VuZCA9IG9uRHJhZ0VuZC5iaW5kKG5pZGdldCk7XG4gICAgXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIG5pZGdldC5vbkRyYWdTdGFydCk7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VuZFwiLCBuaWRnZXQub25EcmFnRW5kKTsgICAgXG59OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgZHJhZ0hhbmRsZXIgPSByZXF1aXJlKFwiLi4vRHJhZ0hhbmRsZXJcIikuaW5zdGFuY2U7XG5jb25zdCBNb3VzZVV0aWxpdGllcyA9IHJlcXVpcmUoXCIuLi9Nb3VzZVV0aWxpdGllc1wiKTtcblxuZnVuY3Rpb24gb25EcmFnT3ZlcihldmVudCl7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBsZXQgZHJhZ05pZGdldCA9IGRyYWdIYW5kbGVyLmdldCgpO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ092ZXJcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcywgZHJhZ05pZGdldCk7XG59XG5cbmZ1bmN0aW9uIG9uRHJhZ0VudGVyKGV2ZW50KXtcbiAgICBpZiAoIWRyYWdIYW5kbGVyLmhhcygpKSByZXR1cm47XG4gICAgaWYgKCFkcmFnSGFuZGxlci5wdXNoT3Zlcih0aGlzKSkgcmV0dXJuO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ0VudGVyXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbkRyYWdMZWF2ZShldmVudCl7XG4gICAgaWYgKCFkcmFnSGFuZGxlci5oYXMoKSkgcmV0dXJuO1xuICAgIGlmIChNb3VzZVV0aWxpdGllcy5pc1VuZGVyKHRoaXMuZ2V0RWxlbWVudCgpKSkgcmV0dXJuO1xuICAgIGlmICghZHJhZ0hhbmRsZXIucmVtb3ZlT3Zlcih0aGlzKSkgcmV0dXJuO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ0xlYXZlXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbkRyb3AoZXZlbnQpe1xuICAgIGxldCBkcmFnTmlkZ2V0ID0gZHJhZ0hhbmRsZXIuZ2V0KCk7XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcm9wXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMsIGRyYWdOaWRnZXQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgbmlkZ2V0Lm9uRHJhZ092ZXIgPSBvbkRyYWdPdmVyLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Ecm9wID0gb25Ecm9wLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25EcmFnRW50ZXIgPSBvbkRyYWdFbnRlci5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uRHJhZ0xlYXZlID0gb25EcmFnTGVhdmUuYmluZChuaWRnZXQpO1xuICAgIFxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIG5pZGdldC5vbkRyYWdPdmVyKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIG5pZGdldC5vbkRyb3ApO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbnRlclwiLCBuaWRnZXQub25EcmFnRW50ZXIpO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdsZWF2ZVwiLCBuaWRnZXQub25EcmFnTGVhdmUpOyAgICBcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBNb3VzZVV0aWxpdGllcyA9IHJlcXVpcmUoXCIuLi9Nb3VzZVV0aWxpdGllc1wiKTtcblxuZnVuY3Rpb24gb25DbGljayhldmVudCl7ICAgIFxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiY2xpY2tcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VEb3duKGV2ZW50KXsgICAgXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZURvd25cIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VVcChldmVudCl7ICAgIFxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VVcFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZUVudGVyKGV2ZW50KXsgICAgXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZUVudGVyXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlTGVhdmUoZXZlbnQpe1xuICAgIGlmIChNb3VzZVV0aWxpdGllcy5pc1VuZGVyKHRoaXMuZ2V0RWxlbWVudCgpKSkgcmV0dXJuO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VFeGl0XCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgY29uc29sZS5sb2coXCJtb3VzZSBzZXR1cFwiKTtcbiAgICBcbiAgICBuaWRnZXQub25DbGljayA9IG9uQ2xpY2suYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbk1vdXNlRG93biA9IG9uTW91c2VEb3duLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Nb3VzZVVwID0gb25Nb3VzZVVwLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Nb3VzZUVudGVyID0gb25Nb3VzZUVudGVyLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Nb3VzZUxlYXZlID0gb25Nb3VzZUxlYXZlLmJpbmQobmlkZ2V0KTtcbiAgICBcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBuaWRnZXQub25DbGljayk7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIG5pZGdldC5vbk1vdXNlRG93bik7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBuaWRnZXQub25Nb3VzZVVwKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIG5pZGdldC5vbk1vdXNlRW50ZXIpO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIG5pZGdldC5vbk1vdXNlTGVhdmUpO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIEVuYWJsZSB0aGUgbmlkZ2V0IHRvIGJlIG1vdmVkIGJ5IGRyYWdnaW5nLiAgV2lsbCBkcmFnIGJ5IGFueSBjaGlsZCBlbGVlbWVudFxuICogdGhlICcubmlkZ2V0LWhlYWRlcicgY2xhc3MsIG90aGVyd2lzZSBtb3ZhYmxlIGJ5IGNsaWNraW5nIGFueXdoZXJlLlxuICogQHBhcmFtIHt0eXBlfSBlXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gb25Nb3VzZU1vdmUoZSl7ICAgIFxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoIXRoaXMuX19tb3ZhYmxlLmFjdGl2ZSkgcmV0dXJuOyAgICBcblxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgbmV3IGN1cnNvciBwb3NpdGlvbjpcbiAgICBsZXQgZGVsdGFYID0gdGhpcy5fX21vdmFibGUubGFzdFggLSBlLmNsaWVudFg7XG4gICAgbGV0IGRlbHRhWSA9IHRoaXMuX19tb3ZhYmxlLmxhc3RZIC0gZS5jbGllbnRZO1xuICAgIHRoaXMuX19tb3ZhYmxlLmxhc3RYID0gZS5jbGllbnRYO1xuICAgIHRoaXMuX19tb3ZhYmxlLmxhc3RZID0gZS5jbGllbnRZO1xuICAgIFxuICAgIC8vIHNldCB0aGUgZWxlbWVudCdzIG5ldyBwb3NpdGlvbjpcbiAgICB0aGlzLnN0eWxlLnRvcCA9ICh0aGlzLm9mZnNldFRvcCAtIGRlbHRhWSkgKyBcInB4XCI7XG4gICAgdGhpcy5zdHlsZS5sZWZ0ID0gKHRoaXMub2Zmc2V0TGVmdCAtIGRlbHRhWCkgKyBcInB4XCI7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VEb3duKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLl9fbW92YWJsZS5hY3RpdmUgPSB0cnVlO1xuICAgIFxuICAgIC8vIGdldCB0aGUgbW91c2UgY3Vyc29yIHBvc2l0aW9uIGF0IHN0YXJ0dXA6XG4gICAgdGhpcy5fX21vdmFibGUubGFzdFggPSBlLmNsaWVudFg7XG4gICAgdGhpcy5fX21vdmFibGUubGFzdFkgPSBlLmNsaWVudFk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VVcChlKXtcbiAgICB0aGlzLl9fbW92YWJsZS5hY3RpdmUgPSBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIG5pZGdldC5fX21vdmFibGUgPSB7XG4gICAgICAgIGxhc3RYIDogMCxcbiAgICAgICAgbGFzdFkgOiAwLFxuICAgICAgICBhY3RpdmUgOiBmYWxzZVxuICAgIH07XG4gICAgXG4gICAgbmlkZ2V0Lm9uTW91c2VEb3duID0gb25Nb3VzZURvd24uYmluZChuaWRnZXQpOyAgICAgICAgXG4gICAgXG4gICAgaWYgKG5pZGdldC5xdWVyeVNlbGVjdG9yKFwiLm5pZGdldC1oZWFkZXJcIikpe1xuICAgICAgICBuaWRnZXQucXVlcnlTZWxlY3RvcihcIi5uaWRnZXQtaGVhZGVyXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgbmlkZ2V0Lm9uTW91c2VEb3duKTsgICAgICAgIFxuICAgIH0gZWxzZSB7XG4gICAgICAgIG5pZGdldC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIG5pZGdldC5vbk1vdXNlRG93bik7XG4gICAgfVxuICAgIFxuICAgIG5pZGdldC5vbk1vdXNlTW92ZSA9IG9uTW91c2VNb3ZlLmJpbmQobmlkZ2V0KTsgICAgXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbmlkZ2V0Lm9uTW91c2VNb3ZlKTtcblxuICAgIG5pZGdldC5vbk1vdXNlVXAgPSBvbk1vdXNlVXAuYmluZChuaWRnZXQpOyAgICBcbiAgICBuaWRnZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgbmlkZ2V0Lm9uTW91c2VVcCk7XG5cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0XCIpO1xud2luZG93Lk5pZGdldCA9IE5pZGdldDtcblxuLyoqXG4gKiBBZGQgYSByZXNpemUgb2JzZXJ2ZXIgdG8gdGhlIGVsZW1lbnQgdGhhdCB3aWxsIGNhbGwgYSBvblJlc2l6ZSgpIGZ1bmN0aW9uLlxuICogVGhlIHBhcmFtZXRlcnMgcGFzc2VkIGluIGFyZSAocHJldmlvdXNfZGltZW5zaW9ucykuICBUbyB1c2UgYWRkXG4gKiBpbnRlcmZhY2VzPVwicmVzaXplXCIgdG8gdGhlIGVsZW1lbnQgaW4gaHRtbCBhbmQgYSBtZXRob2Qgb25SZXNpemUoKSB0byB0aGUgXG4gKiBjbGFzcyBvYmplY3QuICBJZiB0aGVyZSBpcyBubyBjbGFzcyBvYmplY3QgY3JlYXRlIGEgZnVuY3Rpb24gYW5kIGJpbmQgaXQuXG4gKiBpZTogZWxlbWVudC5vblJlc2l6ZSA9IGZ1bmN0aW9uLmJpbmQoZWxlbWVudCk7IFxuICovXG5cbmxldCBvblJlc2l6ZSA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRhdGEgPSB0aGlzW05pZGdldC5pbnRlcmZhY2VEYXRhRmllbGRdLnJlc2l6ZTtcbiAgICBsZXQgcHJldiA9IGRhdGEucHJldjtcbiAgICBpZiAoIXRoaXMub25SZXNpemUpIHJldHVybjtcbiAgICB0aGlzLm9uUmVzaXplKHByZXYpO1xuICAgIGxvYWRQcmV2aW91cyh0aGlzKTtcbn07XG5cbmxldCBsb2FkUHJldmlvdXMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIGxldCBkYXRhID0gbmlkZ2V0W05pZGdldC5pbnRlcmZhY2VEYXRhRmllbGRdLnJlc2l6ZTtcbiAgICBkYXRhLnByZXYgPSB7XG4gICAgICAgIHdpZHRoIDogbmlkZ2V0Lm9mZnNldFdpZHRoLFxuICAgICAgICBoZWlnaHQgOiBuaWRnZXQub2Zmc2V0SGVpZ2h0XG4gICAgfTsgICAgXG59O1xuXG4vKipcbiAqIFNldHVwIGEgcmVzaXplIG9ic2VydmVyIGZvciB0aGUgbmlkZ2V0IHRoYXQgdHJpZ2dlcnMgdGhlIG9uUmVzaXplIG1ldGhvZCBpZiBcbiAqIGF2YWlsYWJsZS5cbiAqIC0gb25SZXNpemUodGhpcywgcHJldmlvdXNfZGltZW5zaW9ucykgOiBub25lXG4gKiBAcGFyYW0ge3R5cGV9IG5pZGdldFxuICogQHJldHVybiB7dW5kZWZpbmVkfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgaWYgKHR5cGVvZihuaWRnZXQpICE9PSBcIm9iamVjdFwiKSB0aHJvdyBuZXcgXCJPYmplY3QgZXhlY3RlZFwiO1xuICAgIGxldCByZXNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcihvblJlc2l6ZS5iaW5kKG5pZGdldCkpO1xuICAgIHJlc2l6ZU9ic2VydmVyLm9ic2VydmUobmlkZ2V0KTtcbiAgICBsb2FkUHJldmlvdXMobmlkZ2V0KTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQWJzdHJhY3RNb2RlbCA6IHJlcXVpcmUoXCIuL0Fic3RyYWN0TW9kZWxcIiksXG4gICAgTmlkZ2V0RWxlbWVudCA6IHJlcXVpcmUoXCIuL05pZGdldEVsZW1lbnRcIiksXG4gICAgRmlsZU9wZXJhdGlvbnMgOiByZXF1aXJlKFwiLi9GaWxlT3BlcmF0aW9uc1wiKSxcbiAgICBOaWRnZXRCdXR0b25TZXQgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b25TZXRcIiksXG4gICAgTmlkZ2V0QnV0dG9uIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uXCIpLFxuICAgIE5pZGdldEJ1dHRvblN0YXRlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU3RhdGVcIiksXG4gICAgTmlkZ2V0SW1hZ2UgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRJbWFnZVwiKSxcbiAgICBOaWRnZXRIVE1MSW1hZ2UgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRIVE1MSW1hZ2VcIiksXG4gICAgTmlkZ2V0VGV4dCA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldFRleHRcIiksXG4gICAgTmlkZ2V0Q29udGFpbmVyIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0Q29udGFpbmVyXCIpLFxuICAgIE1vdXNlVXRpbGl0aWVzIDogcmVxdWlyZShcIi4vTW91c2VVdGlsaXRpZXNcIiksXG4gICAgQ29uc3RhbnRzOiByZXF1aXJlKFwiLi9OaWRnZXRcIiksXG4gICAgbGF5b3V0czoge31cbn07IiwiY29uc3QgRmlsZU9wcyA9IHJlcXVpcmUoXCIuL21vZHVsZXMvRmlsZU9wcy5qc1wiKTtcclxuY29uc3QgQXV0aGVudGljYXRlID0gcmVxdWlyZShcIi4vbW9kdWxlcy9BdXRoZW50aWNhdGUuanNcIik7XHJcbmNvbnN0IE1lbnUgPSByZXF1aXJlKFwiLi9tb2R1bGVzL01lbnUuanNcIik7XHJcbmNvbnN0IFF1ZXN0aW9uUGFuZSA9IHJlcXVpcmUoXCIuL21vZHVsZXMvUXVlc3Rpb25QYW5lLmpzXCIpO1xyXG5jb25zdCBFZGl0b3JQYW5lID0gcmVxdWlyZShcIi4vbW9kdWxlcy9FZGl0b3JQYW5lLmpzXCIpO1xyXG5jb25zdCBNb2RlbCA9IHJlcXVpcmUoXCIuL21vZHVsZXMvTW9kZWxcIik7XHJcblxyXG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiQHRoYWVyaW91cy9uaWRnZXRcIilcclxucmVxdWlyZShcIi4vbW9kdWxlcy9HYW1lQm9hcmQuanNcIik7XHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvTXVsdGlwbGVDaG9pY2VQYW5lLmpzXCIpO1xyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL0NoZWNrQm94LmpzXCIpO1xyXG5cclxubGV0IGZpbGVPcHMgPSBuZXcgRmlsZU9wcygpO1xyXG5sZXQgbW9kZWwgPSBudWxsO1xyXG5sZXQgcXVlc3Rpb25QYW5lID0gbnVsbDtcclxubGV0IGVkaXRvclBhbmUgPSBudWxsO1xyXG5cclxud2luZG93Lm9ubG9hZCA9IGFzeW5jICgpID0+IHtcclxuICAgIHNldHVwKCk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNldHVwKCl7XHJcbiAgICBsZXQgc3RhcnQgPSBuZXcgRGF0ZSgpO1xyXG4gICAgYXdhaXQgTmlkZ2V0Lk5pZGdldEVsZW1lbnQubG9hZFRlbXBsYXRlU25pcHBldChcInNuaXBwZXRzL2NoZWNrLWJveC5odG1sXCIsIFwiY2hlY2stYm94XCIpO1xyXG4gICAgYXdhaXQgTmlkZ2V0Lk5pZGdldEVsZW1lbnQubG9hZFRlbXBsYXRlU25pcHBldChcInNuaXBwZXRzL211bHRpcGxlLWNob2ljZS1wYW5lLmh0bWxcIiwgXCJtdWx0aXBsZS1jaG9pY2UtcGFuZVwiKTtcclxuICAgIGF3YWl0IE5pZGdldC5OaWRnZXRFbGVtZW50LmxvYWRUZW1wbGF0ZVNuaXBwZXQoXCJzbmlwcGV0cy9nYW1lLWJvYXJkLmh0bWxcIiwgXCJnYW1lLWJvYXJkXCIpO1xyXG4gICAgYXdhaXQgTmlkZ2V0Lk5pZGdldEVsZW1lbnQubG9hZFRlbXBsYXRlU25pcHBldChcInNuaXBwZXRzL3F1ZXN0aW9uLXBhbmUuaHRtbFwiLCBcInF1ZXN0aW9uLXBhbmVcIik7XHJcblxyXG4gICAgcGFyc2VVUkxQYXJhbWV0ZXJzKCk7XHJcbiAgICBuZXcgTWVudSgpLmluaXQoXCIjbWVudVwiKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IG5ldyBBdXRoZW50aWNhdGUoKS5sb2FkQ2xpZW50KCk7XHJcbiAgICAgICAgYXdhaXQgZmlsZU9wcy5sb2FkQ2xpZW50KCk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBmaWxlID0gYXdhaXQgZmlsZU9wcy5nZXQod2luZG93LnBhcmFtZXRlcnMuZmlsZUlkKTtcclxuICAgIGxldCBtb2RlbCA9IG5ldyBNb2RlbChmaWxlT3BzKS5zZXQoSlNPTi5wYXJzZShmaWxlLmJvZHkpKTtcclxuICAgIHdpbmRvdy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1uYW1lXCIpLnRleHRDb250ZW50ID0gbW9kZWwubmFtZTtcclxuICAgIGVkaXRvclBhbmUgPSBuZXcgRWRpdG9yUGFuZShtb2RlbCk7XHJcbiAgICBlZGl0b3JQYW5lLm9uU2F2ZSA9IHNhdmVNb2RlbDtcclxuXHJcbiAgICBsZXQgZW5kID0gbmV3IERhdGUoKTtcclxuICAgIGxldCB0aW1lID0gZW5kIC0gc3RhcnQ7XHJcbiAgICBjb25zb2xlLmxvZyhcIkxvYWQgVGltZSBcIiArIHRpbWUgKyBcIiBtc1wiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhdmUgdGhlIG1vZGVsIHRvIHRoZSBnb29nbGUgYXBwIGRhdGEgZm9sZGVyLlxyXG4gKi9cclxuZnVuY3Rpb24gc2F2ZU1vZGVsKCkge1xyXG4gICAgZmlsZU9wcy5zZXRCb2R5KHdpbmRvdy5wYXJhbWV0ZXJzLmZpbGVJZCwgSlNPTi5zdHJpbmdpZnkod2luZG93Lm1vZGVsLmdldCgpLCBudWxsLCAyKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGFuZ2UgdGhlIG5hbWUgb2YgdGhlIGZpbGUgaW4gZ29vZ2xlJ3MgYXBwIGRhdGEgZm9sZGVyLlxyXG4gKi9cclxuZnVuY3Rpb24gcmVuYW1lTW9kZWwoKSB7XHJcbiAgICBsZXQgbmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1uYW1lXCIpLnRleHRDb250ZW50O1xyXG4gICAgZmlsZU9wcy5yZW5hbWUod2luZG93LnBhcmFtZXRlcnMuZmlsZUlkLCBuYW1lICsgXCIuanNvblwiKTtcclxuICAgIHdpbmRvdy5tb2RlbC5uYW1lID0gbmFtZTtcclxuICAgIHNhdmVNb2RlbCgpO1xyXG59XHJcblxyXG4vKipcclxuICogRXh0cmFjdCB2YWx1ZSBmcm9tIHRoZSBVUkwgc3RyaW5nLCBzdG9yZSBpbiAnd2luZG93LnBhcmFtZXRlcnMnLlxyXG4gKi9cclxuZnVuY3Rpb24gcGFyc2VVUkxQYXJhbWV0ZXJzKCkge1xyXG4gICAgd2luZG93LnBhcmFtZXRlcnMgPSB7fTtcclxuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKS5zcGxpdChcIiZcIik7XHJcbiAgICBmb3IgKGNvbnN0IHBhcmFtZXRlciBvZiBwYXJhbWV0ZXJzKSB7XHJcbiAgICAgICAgY29uc3Qgc3BsaXQgPSBwYXJhbWV0ZXIuc3BsaXQoLz0vKTtcclxuICAgICAgICB3aW5kb3cucGFyYW1ldGVyc1tzcGxpdFswXV0gPSBzcGxpdFsxXSA/PyBcIlwiO1xyXG4gICAgfVxyXG59IiwiLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2RyaXZlL2FwaS92My9xdWlja3N0YXJ0L2pzP2hsPWVuXHJcblxyXG5jbGFzcyBBdXRoZW50aWNhdGUge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHJlcXVpcmUoXCIuL2dvb2dsZUZpZWxkcy5qc1wiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZENsaWVudCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmxvYWQoJ2NsaWVudDphdXRoMicsICgpID0+IHRoaXMuX19pbml0Q2xpZW50KHJlc29sdmUsIHJlamVjdCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9faW5pdENsaWVudChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBnYXBpLmNsaWVudC5pbml0KHtcclxuICAgICAgICAgICAgYXBpS2V5OiB0aGlzLmRldmVsb3BlcktleSxcclxuICAgICAgICAgICAgY2xpZW50SWQ6IHRoaXMuY2xpZW50SWQsXHJcbiAgICAgICAgICAgIGRpc2NvdmVyeURvY3M6IHRoaXMuZGlzY292ZXJ5RG9jcyxcclxuICAgICAgICAgICAgc2NvcGU6IHRoaXMuc2NvcGVcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1IgSU5JVFwiKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlzQXV0aG9yaXplZCgpe1xyXG4gICAgICAgIHZhciB1c2VyID0gZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKS5jdXJyZW50VXNlci5nZXQoKTtcclxuICAgICAgICByZXR1cm4gdXNlci5oYXNHcmFudGVkU2NvcGVzKHRoaXMuc2NvcGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNpZ25Jbigpe1xyXG4gICAgICAgIGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuc2lnbkluKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2lnbk91dCgpe1xyXG4gICAgICAgIGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuc2lnbk91dCgpO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBdXRoZW50aWNhdGU7IiwiY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCJAVGhhZXJpb3VzL25pZGdldFwiKS5OaWRnZXRFbGVtZW50O1xyXG5cclxuY2xhc3MgVmFsdWVVcGFkYXRlIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IodmFsdWUpIHtcclxuICAgICAgICBzdXBlcigndmFsdWUtdXBkYXRlJyxcclxuICAgICAgICAgICAge2RldGFpbCA6IHt2YWx1ZSA6IHZhbHVlfX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBDaGVja0JveCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgYXN5bmMgY29ubmVjdGVkQ2FsbGJhY2soKXtcclxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdG9nZ2xlKCl7XHJcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tlZCA9PT0gJ3RydWUnKSB0aGlzLmNoZWNrZWQgPSAnZmFsc2UnO1xyXG4gICAgICAgIGVsc2UgdGhpcy5jaGVja2VkID0gJ3RydWUnXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGNoZWNrZWQoKXtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFKSl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFLCAnZmFsc2UnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgY2hlY2tlZCh2YWx1ZSl7XHJcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoQ2hlY2tCb3guQ0hFQ0tFRF9BVFRSSUJVVEUsIHZhbHVlKTtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFZhbHVlVXBhZGF0ZSh2YWx1ZSkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5DaGVja0JveC5DSEVDS0VEX0FUVFJJQlVURSA9IFwiY2hlY2tlZFwiO1xyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdjaGVjay1ib3gnLCBDaGVja0JveCk7XHJcbm1vZHVsZS5leHBvcnRzID0gQ2hlY2tCb3g7IiwiY29uc3QgTW9kZWwgPSByZXF1aXJlKFwiLi9Nb2RlbC5qc1wiKTtcclxuY29uc3QgRE9NID0gey8qIHNlZSBFZGl0b3JQYW5lLmNvbnN0cnVjdG9yICovfTtcclxuXHJcbmNsYXNzIE1DQW5zd2VyQ3RybCB7XHJcbiAgICBzdGF0aWMgcnVuKG1vZGVsLCBzYXZlQ0IpIHtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwubW9kZWwgID0gbW9kZWw7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLnNhdmVDQiA9IHNhdmVDQjtcclxuXHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5zaG93KCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUuc2V0VGV4dChpLCBtb2RlbC5hbnN3ZXJzW2ldLnRleHQpO1xyXG4gICAgICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLnNldENoZWNrZWQoaSwgbW9kZWwuYW5zd2Vyc1tpXS5pc1RydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlUmlnaHQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIE1DQW5zd2VyQ3RybC5jbGVhbnVwKTtcclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBNQ0Fuc3dlckN0cmwuY2xlYW51cCk7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5hZGRFdmVudExpc3RlbmVyKFwidGV4dC11cGRhdGVcIiwgTUNBbnN3ZXJDdHJsLnRleHRMaXN0KTtcclxuICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLmFkZEV2ZW50TGlzdGVuZXIoXCJ2YWx1ZS11cGRhdGVcIiwgTUNBbnN3ZXJDdHJsLnZhbHVlTGlzdCk7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5hZGRFdmVudExpc3RlbmVyKFwiYnV0dG9uLXF1ZXN0aW9uXCIsIE1DQW5zd2VyQ3RybC5xdWVzdExpc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyB0ZXh0TGlzdChldmVudCkge1xyXG4gICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGV2ZW50LmRldGFpbC5pbmRleCk7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLm1vZGVsLmFuc3dlcnNbaW5kZXhdLnRleHQgPSBldmVudC5kZXRhaWwudGV4dDtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwuc2F2ZUNCKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHZhbHVlTGlzdChldmVudCkge1xyXG4gICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGV2ZW50LmRldGFpbC5pbmRleCk7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLm1vZGVsLmFuc3dlcnNbaW5kZXhdLmlzVHJ1ZSA9IGV2ZW50LmRldGFpbC52YWx1ZTtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwuc2F2ZUNCKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHF1ZXN0TGlzdChldmVudCkge1xyXG4gICAgICAgIE1DQW5zd2VyQ3RybC5zYXZlQ0IoKTtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwuY2xlYW51cCgpO1xyXG4gICAgICAgIE1DUXVlc3Rpb25DdHJsLnJ1bihNQ0Fuc3dlckN0cmwubW9kZWwsIE1DQW5zd2VyQ3RybC5zYXZlQ0IpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjbGVhbnVwKCkge1xyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUuaGlkZSgpO1xyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRleHQtdXBkYXRlXCIsIE1DQW5zd2VyQ3RybC50ZXh0TGlzdCk7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwidmFsdWUtdXBkYXRlXCIsIE1DQW5zd2VyQ3RybC52YWx1ZUxpc3QpO1xyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJ1dHRvbi1xdWVzdGlvblwiLCBNQ0Fuc3dlckN0cmwucXVlc3RMaXN0KTtcclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNBbnN3ZXJDdHJsLmNsZWFudXApO1xyXG4gICAgICAgIERPTS50cmlhbmdsZUxlZnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIE1DQW5zd2VyQ3RybC5jbGVhbnVwKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTUNRdWVzdGlvbkN0cmwge1xyXG4gICAgc3RhdGljIHJ1bihtb2RlbCwgc2F2ZUNCKSB7XHJcbiAgICAgICAgTUNRdWVzdGlvbkN0cmwubW9kZWwgID0gbW9kZWw7XHJcbiAgICAgICAgTUNRdWVzdGlvbkN0cmwuc2F2ZUNCID0gc2F2ZUNCO1xyXG5cclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnNldFRleHQobW9kZWwucXVlc3Rpb24pO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuc2hvdygpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuYm9hcmRCdXR0b24gPSBmYWxzZTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmhpZ2hsaWdodCgncXVlc3Rpb24nKVxyXG5cclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNRdWVzdGlvbkN0cmwuY2xlYW51cCk7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlTGVmdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNRdWVzdGlvbkN0cmwuY2xlYW51cCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKFwidGV4dC11cGRhdGVcIiwgTUNRdWVzdGlvbkN0cmwudGV4dExpc3QpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuYWRkRXZlbnRMaXN0ZW5lcihcImJ1dHRvbi1hbnN3ZXJcIiwgTUNRdWVzdGlvbkN0cmwuYW5zd2VyTGlzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHRleHRMaXN0KGV2ZW50KSB7XHJcbiAgICAgICAgTUNRdWVzdGlvbkN0cmwubW9kZWwucXVlc3Rpb24gPSBldmVudC5kZXRhaWwudGV4dDtcclxuICAgICAgICBNQ1F1ZXN0aW9uQ3RybC5zYXZlQ0IoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYW5zd2VyTGlzdCgpIHtcclxuICAgICAgICBNQ1F1ZXN0aW9uQ3RybC5jbGVhbnVwKCk7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLnJ1bihNQ1F1ZXN0aW9uQ3RybC5tb2RlbCwgTUNRdWVzdGlvbkN0cmwuc2F2ZUNCKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgY2xlYW51cCgpIHtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmhpZGUoKTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0ZXh0LXVwZGF0ZVwiLCBNQ1F1ZXN0aW9uQ3RybC50ZXh0TGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiYnV0dG9uLWFuc3dlclwiLCBNQ1F1ZXN0aW9uQ3RybC5hbnN3ZXJMaXN0KTtcclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNRdWVzdGlvbkN0cmwuY2xlYW51cCk7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlTGVmdC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNRdWVzdGlvbkN0cmwuY2xlYW51cCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFF1ZXN0aW9uUGFuZUN0cmwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0gbW9kZWwgLSB0aGUgcXVlc3Rpb24gbW9kZWwgb2JqZWN0XHJcbiAgICAgKiBAcGFyYW0gZmllbGQgLSB3aGljaCBtb2RlbCBmaWVsZCB0byByZWFkL3dyaXRlIGZyb20geydhJywgJ3EnfVxyXG4gICAgICogQHBhcmFtIHNhdmVDQiAtIGNhbGwgdGhpcyBtZXRob2QgdG8gc2F2ZSB0aGUgbW9kZWxcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHJ1bihmaWVsZCwgbW9kZWwsIHNhdmVDQiwgY2xvc2VDQikge1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwubW9kZWwgICA9IG1vZGVsID8/IFF1ZXN0aW9uUGFuZUN0cmwubW9kZWw7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5maWVsZCAgID0gZmllbGQgPz8gUXVlc3Rpb25QYW5lQ3RybC5maWVsZDtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLnNhdmVDQiAgPSBzYXZlQ0IgPz8gUXVlc3Rpb25QYW5lQ3RybC5zYXZlQ0I7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5jbG9zZUNCID0gY2xvc2VDQiA/PyBRdWVzdGlvblBhbmVDdHJsLmNsb3NlQ0I7XHJcblxyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuc2V0VGV4dChRdWVzdGlvblBhbmVDdHJsLm1vZGVsW1F1ZXN0aW9uUGFuZUN0cmwuZmllbGQuc3Vic3RyKDAsIDEpXSk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5ib2FyZEJ1dHRvbiA9IHRydWU7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5zaG93KCk7XHJcbiAgICAgICAgRE9NLmdhbWVCb2FyZC5oaWRlKCk7XHJcblxyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuYWRkRXZlbnRMaXN0ZW5lcihcInRleHQtdXBkYXRlXCIsIFF1ZXN0aW9uUGFuZUN0cmwudGV4dExpc3QpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuYWRkRXZlbnRMaXN0ZW5lcihcImJ1dHRvbi1ib2FyZFwiLCBRdWVzdGlvblBhbmVDdHJsLmJvYXJkTGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKGBidXR0b24tcXVlc3Rpb25gLCBRdWVzdGlvblBhbmVDdHJsLnF1ZXN0aW9uTGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKGBidXR0b24tYW5zd2VyYCwgUXVlc3Rpb25QYW5lQ3RybC5hbnN3ZXJMaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmhpZ2hsaWdodChRdWVzdGlvblBhbmVDdHJsLmZpZWxkKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgdGV4dExpc3QoZXZlbnQpIHtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLm1vZGVsW1F1ZXN0aW9uUGFuZUN0cmwuZmllbGQuc3Vic3RyKDAsIDEpXSA9IGV2ZW50LmRldGFpbC50ZXh0O1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwuc2F2ZUNCKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGJvYXJkTGlzdChldmVudCkge1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwuY2xlYW51cCgpO1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwuY2xvc2VDQigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhbnN3ZXJMaXN0KGV2ZW50KSB7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5jbGVhbnVwKCk7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5ydW4oJ2Fuc3dlcicpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBxdWVzdGlvbkxpc3QodmVudCkge1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwuY2xlYW51cCgpO1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwucnVuKCdxdWVzdGlvbicpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjbGVhbnVwKCkge1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRleHQtdXBkYXRlXCIsIFF1ZXN0aW9uUGFuZUN0cmwudGV4dExpc3QpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJ1dHRvbi1ib2FyZFwiLCBRdWVzdGlvblBhbmVDdHJsLmJvYXJkTGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiYnV0dG9uLWFuc3dlclwiLCBRdWVzdGlvblBhbmVDdHJsLmFuc3dlckxpc3QpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJ1dHRvbi1xdWVzdGlvblwiLCBRdWVzdGlvblBhbmVDdHJsLnF1ZXN0aW9uTGlzdCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEVkaXRvclBhbmUge1xyXG4gICAgY29uc3RydWN0b3IobW9kZWwpIHtcclxuICAgICAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcblxyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI211bHRpcGxlLWNob2ljZS1wYW5lXCIpO1xyXG4gICAgICAgIERPTS50cmlhbmdsZVJpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0cmlhbmdsZS1yaWdodFwiKTtcclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0cmlhbmdsZS1sZWZ0XCIpO1xyXG4gICAgICAgIERPTS5yb3VuZExhYmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyb3VuZC1udW1iZXIgPiAudGV4dFwiKTtcclxuICAgICAgICBET00uZ2FtZU5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtbmFtZVwiKTtcclxuICAgICAgICBET00uZ2FtZUJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lLWJvYXJkXCIpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3F1ZXN0aW9uLXBhbmVcIilcclxuICAgICAgICBET00ubWVudUluY3JlYXNlVmFsdWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtdmFsdWUtcGx1c1wiKVxyXG4gICAgICAgIERPTS5tZW51RGVjcmVhc2VWYWx1ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS12YWx1ZS1taW51c1wiKVxyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtcmVtb3ZlLXJvdW5kXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwucmVtb3ZlUm91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVUcmlhbmdsZVZpZXcoKTtcclxuICAgICAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1ob21lLXNjcmVlblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gXCJob21lLmh0bWxcIjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgRE9NLm1lbnVJbmNyZWFzZVZhbHVlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuaW5jcmVhc2VWYWx1ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgRE9NLm1lbnVEZWNyZWFzZVZhbHVlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuZGVjcmVhc2VWYWx1ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlUmlnaHQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5pbmNyZW1lbnRSb3VuZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlTGVmdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmRlY3JlbWVudFJvdW5kKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBET00uZ2FtZU5hbWUuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC53aGljaCA9PT0gMTMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlTmFtZSgpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lLWJvYXJkLWNvbnRhaW5lclwiKS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1hZGQtY2F0ZWdvcnlcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5hZGRDYXRlZ29yeVJvdW5kKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtYWRkLW11bHRpcGxlLWNob2ljZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmFkZE11bHRpcGxlQ2hvaWNlUm91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGdhbWUtYm9hcmQgY2hhbmdlIGNhdGVnb3J5IHRleHRcclxuICAgICAgICBET00uZ2FtZUJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJoZWFkZXItdXBkYXRlXCIsIGV2ZW50ID0+IHtcclxuICAgICAgICAgICAgbGV0IGNvbCA9IGV2ZW50LmRldGFpbC5jb2w7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuZ2V0Q29sdW1uKGNvbCkuY2F0ZWdvcnkgPSBldmVudC5kZXRhaWwudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuZ2V0Q29sdW1uKGNvbCkuZm9udFNpemUgPSBldmVudC5kZXRhaWwuZm9udFNpemU7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGdhbWUtYm9hcmQgc2VsZWN0IGNlbGxcclxuICAgICAgICBET00uZ2FtZUJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJjZWxsLXNlbGVjdFwiLCBldmVudCA9PiB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSBldmVudC5kZXRhaWwucm93O1xyXG4gICAgICAgICAgICBsZXQgY29sID0gZXZlbnQuZGV0YWlsLmNvbDtcclxuICAgICAgICAgICAgdGhpcy5oaWRlTmF2aWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5ydW4oXHJcbiAgICAgICAgICAgICAgICAncXVlc3Rpb24nLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5nZXRDZWxsKHJvdywgY29sKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHRoaXMub25TYXZlKCksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLnVwZGF0ZVZpZXcoKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBvblNhdmUoKSB7XHJcbiAgICAgICAgLy8gb3ZlcnJpZGUgbWVcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVOYW1lKCkge1xyXG4gICAgICAgIC8vIG92ZXJyaWRlIG1lXHJcbiAgICB9XHJcblxyXG4gICAgaGlkZU5hdmlnYXRpb24oKSB7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlTGVmdC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIERPTS50cmlhbmdsZVJpZ2h0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlVmlldyhtb2RlbCkge1xyXG4gICAgICAgIG1vZGVsID0gbW9kZWwgPz8gdGhpcy5tb2RlbDtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRyaWFuZ2xlVmlldygpO1xyXG5cclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmhpZGUoKTtcclxuICAgICAgICBET00uZ2FtZUJvYXJkLmhpZGUoKTtcclxuICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLmhpZGUoKTtcclxuXHJcbiAgICAgICAgaWYgKG1vZGVsLmdldFJvdW5kKCkudHlwZSA9PT0gTW9kZWwucXVlc3Rpb25UeXBlLkNBVEVHT1JZKSB0aGlzLmNhdGVnb3J5Vmlldyhtb2RlbCk7XHJcbiAgICAgICAgaWYgKG1vZGVsLmdldFJvdW5kKCkudHlwZSA9PT0gTW9kZWwucXVlc3Rpb25UeXBlLk1VTFRJUExFX0NIT0lDRSkgdGhpcy5tdWx0aXBsZUNob2ljZVZpZXcobW9kZWwpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVRyaWFuZ2xlVmlldygpIHtcclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlUmlnaHQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5jdXJyZW50Um91bmQgPT09IDApIERPTS50cmlhbmdsZUxlZnQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICBpZiAodGhpcy5tb2RlbC5jdXJyZW50Um91bmQgPj0gdGhpcy5tb2RlbC5yb3VuZENvdW50IC0gMSkgRE9NLnRyaWFuZ2xlUmlnaHQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICBET00ucm91bmRMYWJlbC50ZXh0Q29udGVudCA9IFwiUm91bmQgXCIgKyAodGhpcy5tb2RlbC5jdXJyZW50Um91bmQgKyAxKTtcclxuICAgIH1cclxuXHJcbiAgICBtdWx0aXBsZUNob2ljZVZpZXcobW9kZWwpIHtcclxuICAgICAgICBET00ubWVudURlY3JlYXNlVmFsdWUuaGlkZSgpO1xyXG4gICAgICAgIERPTS5tZW51SW5jcmVhc2VWYWx1ZS5oaWRlKCk7XHJcblxyXG4gICAgICAgIE1DUXVlc3Rpb25DdHJsLnJ1bihcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5nZXRSb3VuZCgpLFxyXG4gICAgICAgICAgICAoKSA9PiB0aGlzLm9uU2F2ZSgpXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBjYXRlZ29yeVZpZXcobW9kZWwpIHtcclxuICAgICAgICBET00ubWVudURlY3JlYXNlVmFsdWUuc2hvdygpO1xyXG4gICAgICAgIERPTS5tZW51SW5jcmVhc2VWYWx1ZS5zaG93KCk7XHJcbiAgICAgICAgRE9NLmdhbWVCb2FyZC5zaG93KCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDY7IGNvbCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjb2x1bW4gPSBtb2RlbC5nZXRDb2x1bW4oY29sKTtcclxuXHJcbiAgICAgICAgICAgIERPTS5nYW1lQm9hcmQuZ2V0SGVhZGVyKGNvbCkuZml0VGV4dC5sb2NrID0gXCJ2aFwiO1xyXG4gICAgICAgICAgICBET00uZ2FtZUJvYXJkLnNldEhlYWRlcihjb2wsIGNvbHVtbi5jYXRlZ29yeSwgY29sdW1uLmZvbnRTaXplKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IDU7IHJvdysrKSB7XHJcbiAgICAgICAgICAgICAgICBET00uZ2FtZUJvYXJkLnNldENlbGwocm93LCBjb2wsIGNvbHVtbi5jZWxsW3Jvd10udmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbHVtbi5jZWxsW3Jvd10ucSA9PT0gXCJcIikgRE9NLmdhbWVCb2FyZC5zZXRDb21wbGV0ZShyb3csIGNvbCwgXCJmYWxzZVwiKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNvbHVtbi5jZWxsW3Jvd10uYSA9PT0gXCJcIikgRE9NLmdhbWVCb2FyZC5zZXRDb21wbGV0ZShyb3csIGNvbCwgXCJwYXJ0aWFsXCIpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBET00uZ2FtZUJvYXJkLnNldENvbXBsZXRlKHJvdywgY29sLCBcInRydWVcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yUGFuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2RyaXZlL2FwaS92My9xdWlja3N0YXJ0L2pzP2hsPWVuXHJcblxyXG5jbGFzcyBGaWxlT3BzIHtcclxuXHJcbiAgICBhc3luYyBsb2FkKCl7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5sb2FkQ2xpZW50KCk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5sb2FkRHJpdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkQ2xpZW50KCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGdhcGkubG9hZCgnY2xpZW50JywgKCkgPT4gcmVzb2x2ZSgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkRHJpdmUoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQubG9hZCgnZHJpdmUnLCAndjMnLCByZXNvbHZlKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGNyZWF0ZSgpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgIG5hbWUgOiBGaWxlT3BzLmZpbGVuYW1lLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50czogWydhcHBEYXRhRm9sZGVyJ10sXHJcbiAgICAgICAgICAgICAgICBmaWVsZHM6IFwiaWRcIlxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0LmlkKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBkZWxldGUoZmlsZUlkKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmRlbGV0ZSh7XHJcbiAgICAgICAgICAgICAgICBmaWxlSWQgOiBmaWxlSWRcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLnJlc3VsdCk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBsaXN0KCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5saXN0KHtcclxuICAgICAgICAgICAgICAgIC8vIHE6IGBuYW1lIGNvbnRhaW5zICcuanNvbidgLFxyXG4gICAgICAgICAgICAgICAgc3BhY2VzOiAnYXBwRGF0YUZvbGRlcicsXHJcbiAgICAgICAgICAgICAgICBmaWVsZHM6ICdmaWxlcy9uYW1lLGZpbGVzL2lkLGZpbGVzL21vZGlmaWVkVGltZSdcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLnJlc3VsdC5maWxlcyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0KGZpbGVJZCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5nZXQoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkOiBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICBhbHQ6ICdtZWRpYSdcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHNldEJvZHkoZmlsZUlkLCBib2R5KXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LnJlcXVlc3Qoe1xyXG4gICAgICAgICAgICAgICAgcGF0aCA6IFwidXBsb2FkL2RyaXZlL3YzL2ZpbGVzL1wiICsgZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kIDogXCJQQVRDSFwiLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zIDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZFR5cGUgOiBcIm1lZGlhXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzIDoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCIgOiBcImFwcGxpY2F0aW9uL2pzb25cIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGJvZHkgOiBib2R5XHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVzLmJvZHkpKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlbmFtZShmaWxlSWQsIGZpbGVuYW1lKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBmaWxlSWQ6IGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIG5hbWU6IGZpbGVuYW1lXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVzLmJvZHkpKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5GaWxlT3BzLmZpbGVuYW1lID0gXCJHYW1lIE5hbWUuanNvblwiO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3BzOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqIFZpZXctQ29udHJvbGxlciBmb3IgdGhlIEhUTUwgZ2FtZSBib2FyZCBlbGVtZW50XHJcbiAgICBUaGlzIGlzIHRoZSBjbGFzc2ljYWwgXCJKZW9wYXJkeVwiIHR5cGUgYm9hcmRcclxuICAgIFRoaXMgaXMgbW9kZWwgYWdub3N0aWMsIHNlZSBFZGl0b3JQYW5lLmpzIGZvciBtb2RlbCBtZXRob2RzXHJcbiAgICBnZW5lcmF0ZXMgdGhlIGZvbGxvd2luZyBldmVudHM6XHJcbiAgICAgICAgY2VsbC1zZWxlY3QgKHJvdywgY29sKTogd2hlbiBhIHVzZXIgY2xpY2tzIGEgY2VsbFxyXG4gICAgICAgIGhlYWRlci11cGRhdGUgKHZhbHVlLCBjb2wsIGZvbnRzaXplKSA6IHdoZW4gdGhlIGhlYWRlciB0ZXh0IGNoYW5nZXMgKGFuZCBibHVycylcclxuICoqL1xyXG5cclxuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCJAVGhhZXJpb3VzL25pZGdldFwiKS5OaWRnZXRFbGVtZW50O1xyXG5cclxuY2xhc3MgQ2VsbFNlbGVjdEV2ZW50IGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3Iocm93LCBjb2wpIHtcclxuICAgICAgICBzdXBlcignY2VsbC1zZWxlY3QnLFxyXG4gICAgICAgICAgICAgIHtkZXRhaWwgOiB7cm93IDogcm93LCBjb2wgOiBjb2wgfX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBIZWFkZXJVcGRhdGVFdmVudCBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKGNvbCwgdmFsdWUsIGZvbnRTaXplKSB7XHJcbiAgICAgICAgc3VwZXIoJ2hlYWRlci11cGRhdGUnLFxyXG4gICAgICAgICAgICB7ZGV0YWlsIDoge3ZhbHVlIDogdmFsdWUsIGNvbCA6IGNvbCwgZm9udFNpemUgOiBmb250U2l6ZX19XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgR2FtZUJvYXJkIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlYWR5KCl7XHJcbiAgICAgICAgYXdhaXQgc3VwZXIucmVhZHkoKTtcclxuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCA2OyBjb2wrKykge1xyXG4gICAgICAgICAgICB0aGlzLmdldEhlYWRlcihjb2wpLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoZXZlbnQpPT5ldmVudC50YXJnZXQuZml0VGV4dC5ub3RpZnkoMSwgMSkpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nZXRIZWFkZXIoY29sKS5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCAoZXZlbnQpPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgZm9udFNpemUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShldmVudC50YXJnZXQpW1wiZm9udC1zaXplXCJdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBIZWFkZXJVcGRhdGVFdmVudChjb2wsIGV2ZW50LnRhcmdldC50ZXh0LCBmb250U2l6ZSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IDU7IHJvdysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldENlbGwocm93LCBjb2wpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDZWxsU2VsZWN0RXZlbnQocm93LCBjb2wpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSB2YWx1ZSBvZiBhIGNhdGVnb3J5XHJcbiAgICAgKiBAcGFyYW0gaW5kZXhcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIHNldEhlYWRlcihpbmRleCwgdmFsdWUsIGZvbnRTaXplKXtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuZ2V0SGVhZGVyKGluZGV4KTtcclxuICAgICAgICBlbGVtZW50LnRleHQgPSB2YWx1ZTtcclxuICAgICAgICBpZiAoZm9udFNpemUpIGVsZW1lbnQuc3R5bGVbXCJmb250LXNpemVcIl0gPSBmb250U2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlIHRoZSBoZWFkZXIgaHRtbCBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gaW5kZXhcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBnZXRIZWFkZXIoaW5kZXgpe1xyXG4gICAgICAgIGlmICh0eXBlb2YgaW5kZXggIT09IFwibnVtYmVyXCIgfHwgaW5kZXggPCAwIHx8IGluZGV4ID4gNikgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbmRleDogXCIgKyBpbmRleCk7XHJcbiAgICAgICAgbGV0IHNlbGVjdG9yID0gYFtkYXRhLXJvdz0naCddW2RhdGEtY29sPScke2luZGV4fSddID4gLnZhbHVlYDtcclxuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgdmFsdWUgb2YgYSBub24tY2F0ZWdvcnkgY2VsbC5cclxuICAgICAqIEBwYXJhbSByb3dcclxuICAgICAqIEBwYXJhbSBjb2xcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBzZXRDZWxsKHJvdywgY29sLCB2YWx1ZSA9IFwiXCIpe1xyXG4gICAgICAgIHRoaXMuZ2V0Q2VsbChyb3csIGNvbCkudGV4dENvbnRlbnQgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDZWxsKHJvdywgY29sKXtcclxuICAgICAgICBsZXQgc2VsZWN0b3IgPSBgW2RhdGEtcm93PVwiJHtyb3d9XCJdW2RhdGEtY29sPVwiJHtjb2x9XCJdID4gLnZhbHVlYDtcclxuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDb21wbGV0ZShyb3csIGNvbCwgdmFsdWUpe1xyXG4gICAgICAgIGlmICh0eXBlb2Ygcm93ICE9PSBcIm51bWJlclwiIHx8IHJvdyA8IDAgfHwgcm93ID4gNikgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCByb3c6IFwiICsgcm93KTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbCAhPT0gXCJudW1iZXJcIiB8fCBjb2wgPCAwIHx8IGNvbCA+IDUpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgY29sOiBcIiArIGNvbCk7XHJcbiAgICAgICAgdGhpcy5nZXRDZWxsKHJvdywgY29sKS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWNvbXBsZXRlXCIsIHZhbHVlKTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZ2FtZS1ib2FyZCcsIEdhbWVCb2FyZCk7XHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZUJvYXJkOyIsImNsYXNzIE1lbnV7XHJcbiAgICBpbml0KG1lbnVTZWxlY3Rvcil7XHJcbiAgICAgICAgdGhpcy5tZW51U2VsZWN0b3IgPSBtZW51U2VsZWN0b3I7XHJcbiAgICAgICAgdGhpcy5tZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy50b2dnbGVNZW51KCkpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb25NZW51KCk7XHJcblxyXG4gICAgICAgIHRoaXMubWVudUFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCk9PiB0aGlzLm1vdXNlTGVhdmUoKSk7XHJcbiAgICAgICAgdGhpcy5tZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpPT4gdGhpcy5tb3VzZUxlYXZlKCkpO1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCk9PiB0aGlzLm1vdXNlRW50ZXIoKSk7XHJcbiAgICAgICAgdGhpcy5tZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpPT4gdGhpcy5tb3VzZUVudGVyKCkpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtYXV0b2Nsb3NlPSd0cnVlJ1wiKS5mb3JFYWNoKChlbGUpPT4ge1xyXG4gICAgICAgICAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLmNsb3NlKCkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnN1Yi1tZW51XCIpLmZvckVhY2goKGVsZSk9PntcclxuICAgICAgICAgICAgZWxlLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1sYWJlbFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTWVudShlbGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoKXtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc3ViLW1lbnUgPiAubWVudS1hcmVhXCIpLmZvckVhY2goKGVsZSk9PntcclxuICAgICAgICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb3Blbigpe1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uTWVudSgpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlTGVhdmUoKXtcclxuICAgICAgICBpZiAodGhpcy50aW1lb3V0KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgfSwgNTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZUVudGVyKCl7XHJcbiAgICAgICAgaWYgKCF0aGlzLnRpbWVvdXQpIHJldHVybjtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgICB0aGlzLnRpbWVvdXQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRvZ2dsZU1lbnUoZWxlbWVudCl7XHJcbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQgPz8gdGhpcy5tZW51QXJlYTtcclxuICAgICAgICBpZiAoIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWVudS1hcmVhXCIpKXtcclxuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tZW51LWFyZWFcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJoaWRkZW5cIikpe1xyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWVudS1hcmVhXCIpKXtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudS1hcmVhXCIpLmZvckVhY2goXHJcbiAgICAgICAgICAgICAgICAoZWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBvc2l0aW9uTWVudSgpe1xyXG4gICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLm1lbnVCdXR0b24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgICAgICBjb25zdCBiV2lkdGggPSB0aGlzLm1lbnVCdXR0b24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XHJcbiAgICAgICAgY29uc3QgbVdpZHRoID0gdGhpcy5tZW51QXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuICAgICAgICBpZiAoKGxlZnQgKyBiV2lkdGggKyBtV2lkdGggKyAyKSA+IHdpbmRvdy5pbm5lcldpZHRoKXtcclxuICAgICAgICAgICAgdGhpcy5zZXRNZW51TGVmdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TWVudVJpZ2h0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldE1lbnVMZWZ0KCl7XHJcbiAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMubWVudUJ1dHRvbi5vZmZzZXRMZWZ0O1xyXG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5tZW51QXJlYS5vZmZzZXRXaWR0aDtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLnN0eWxlLmxlZnQgPSAobGVmdCAtIHdpZHRoIC0gMikgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWVudVJpZ2h0KCl7XHJcbiAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMubWVudUJ1dHRvbi5vZmZzZXRMZWZ0O1xyXG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5tZW51QnV0dG9uLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuc3R5bGUubGVmdCA9IChsZWZ0ICsgd2lkdGggKyAyKSArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWVudSgpe1xyXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMubWVudVNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWVudUJ1dHRvbigpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1lbnUucXVlcnlTZWxlY3RvcihcIi5tZW51LWljb25cIik7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG1lbnVBcmVhKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWVudS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYXJlYVwiKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51OyIsImNsYXNzIE1vZGVsIHtcclxuICAgIGluaXQobmFtZSA9IFwiR2FtZSBOYW1lXCIpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsID0ge1xyXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICByb3VuZHM6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDYXRlZ29yeVJvdW5kKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IG5hbWUoc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwubmFtZSA9IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbmFtZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWwubmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQoZ2FtZU1vZGVsKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQgPSAwO1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsID0gZ2FtZU1vZGVsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Um91bmQoaW5kZXgpIHtcclxuICAgICAgICBpbmRleCA9IGluZGV4ID8/IHRoaXMuY3VycmVudFJvdW5kO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5yb3VuZHNbaW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbHVtbihpbmRleCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvdW5kKCkuY29sdW1uW2luZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDZWxsKHJvdywgY29sdW1uKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29sdW1uKGNvbHVtbikuY2VsbFtyb3ddO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZVJvdW5kKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnJvdW5kQ291bnQgPT09IDEpIHJldHVybjtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5yb3VuZHMuc3BsaWNlKHRoaXMuY3VycmVudFJvdW5kLCAxKTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um91bmQgPj0gdGhpcy5yb3VuZENvdW50KSB0aGlzLmN1cnJlbnRSb3VuZCA9IHRoaXMucm91bmRDb3VudCAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkTXVsdGlwbGVDaG9pY2VSb3VuZCgpe1xyXG4gICAgICAgIGxldCByb3VuZCA9IHtcclxuICAgICAgICAgICAgdHlwZTogTW9kZWwucXVlc3Rpb25UeXBlLk1VTFRJUExFX0NIT0lDRSxcclxuICAgICAgICAgICAgcXVlc3Rpb24gOiBcIlwiLFxyXG4gICAgICAgICAgICBhbnN3ZXJzIDogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKyl7XHJcbiAgICAgICAgICAgIHJvdW5kLmFuc3dlcnNbaV0gPSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0IDogXCJcIixcclxuICAgICAgICAgICAgICAgIGlzVHJ1ZSA6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5wdXNoKHJvdW5kKTtcclxuICAgICAgICByZXR1cm4gcm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkQ2F0ZWdvcnlSb3VuZCgpIHtcclxuICAgICAgICBsZXQgcm91bmQgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IE1vZGVsLnF1ZXN0aW9uVHlwZS5DQVRFR09SWSxcclxuICAgICAgICAgICAgY29sdW1uOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXSA9IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgY2VsbDogW11cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXS5jZWxsW2pdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAoaiArIDEpICogMTAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHE6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYTogXCJcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5yb3VuZHMucHVzaChyb3VuZCk7XHJcbiAgICAgICAgcmV0dXJuIHJvdW5kO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCByb3VuZENvdW50KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5yb3VuZHMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIGluY3JlbWVudFJvdW5kKCl7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQrKztcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um91bmQgPj0gdGhpcy5yb3VuZENvdW50KSB0aGlzLmN1cnJlbnRSb3VuZCA9IHRoaXMucm91bmRDb3VudCAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgZGVjcmVtZW50Um91bmQoKXtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZC0tO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3VuZCA8IDApIHRoaXMuY3VycmVudFJvdW5kID0gMFxyXG4gICAgfVxyXG5cclxuICAgIGluY3JlYXNlVmFsdWUoKSB7XHJcbiAgICAgICAgbGV0IHJvdW5kID0gdGhpcy5nZXRSb3VuZCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldLmNlbGxbal0udmFsdWUgKj0gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWNyZWFzZVZhbHVlKCkge1xyXG4gICAgICAgIGxldCByb3VuZCA9IHRoaXMuZ2V0Um91bmQoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXS5jZWxsW2pdLnZhbHVlIC89IDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbk1vZGVsLnF1ZXN0aW9uVHlwZSA9IHtcclxuICAgIENBVEVHT1JZIDogXCJjaG9pY2VcIixcclxuICAgIE1VTFRJUExFX0NIT0lDRSA6IFwibXVsdGlwbGVfY2hvaWNlXCJcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vZGVsOyIsImNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiQFRoYWVyaW91cy9uaWRnZXRcIikuTmlkZ2V0RWxlbWVudDtcclxucmVxdWlyZShcIi4vQ2hlY2tCb3guanNcIik7XHJcblxyXG5jbGFzcyBUZXh0VXBkYXRlIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoaW5kZXgsIHRleHQpIHtcclxuICAgICAgICBzdXBlcigndGV4dC11cGRhdGUnLFxyXG4gICAgICAgICAgICB7ZGV0YWlsIDoge2luZGV4IDogaW5kZXgsIHRleHQgOiB0ZXh0fX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBWYWx1ZVVwZGF0ZSBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKGluZGV4LCB2YWx1ZSkge1xyXG4gICAgICAgIHN1cGVyKCd2YWx1ZS11cGRhdGUnLFxyXG4gICAgICAgICAgICB7ZGV0YWlsIDoge2luZGV4IDogaW5kZXgsIHZhbHVlIDogdmFsdWV9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFF1ZXN0aW9uQ2xpY2sgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcignYnV0dG9uLXF1ZXN0aW9uJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE11bHRpcGxlQ2hvaWNlUGFuZSBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG5cclxuICAgIHNldE1vZGVsKG1vZGVsKXtcclxuICAgICAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVhZHkoKXtcclxuICAgICAgICBhd2FpdCBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKFwiLmFuc3dlciA+IG5pZGdldC10ZXh0XCIpKXtcclxuICAgICAgICAgICAgZWxlbWVudC5maXRUZXh0LmxvY2sgPSBcInZoXCI7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChldmVudCk9PnRoaXMudHh0TGlzdGVuZXIoZXZlbnQpKTtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCAoZXZlbnQpPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1pbmRleFwiKTtcclxuICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gdGhpcy5xdWVyeVNlbGVjdG9yKGBuaWRnZXQtdGV4dFtkYXRhLWluZGV4PVwiJHtpbmRleH1cIl1gKS50ZXh0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBUZXh0VXBkYXRlKGluZGV4LCB0ZXh0KSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMucXVlcnlTZWxlY3RvckFsbChcImNoZWNrLWJveFwiKSl7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInZhbHVlLXVwZGF0ZVwiLCAoZXZlbnQpPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShldmVudC50YXJnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLWluZGV4XCIpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBWYWx1ZVVwZGF0ZShpbmRleCwgdmFsdWUpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1xdWVzdGlvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBRdWVzdGlvbkNsaWNrKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHR4dExpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxMyl7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZXZlbnQudGFyZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1pbmRleFwiKTtcclxuICAgICAgICAgICAgaW5kZXggPSBwYXJzZUludChpbmRleCk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA+PSA1KXtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5ibHVyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBgbmlkZ2V0LXRleHRbZGF0YS1pbmRleD1cIiR7aW5kZXggKyAxfVwiXWA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXZlbnQudGFyZ2V0LmZpdFRleHQubm90aWZ5KDEsIDEpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIGJ1dHRvbiB7J3F1ZXN0aW9uJywgJ2Fuc3dlcid9XHJcbiAgICAgKi9cclxuICAgIGhpZ2hsaWdodChidXR0b24pe1xyXG4gICAgICAgIGZvciAobGV0IGVsZSBvZiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoYC5zZWxlY3RlZGApKSBlbGUuY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihgI3Nob3ctJHtidXR0b259YCkuY2xhc3NMaXN0LmFkZChcInNlbGVjdGVkXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRleHQoaW5kZXgsIHRleHQpe1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihgbmlkZ2V0LXRleHRbZGF0YS1pbmRleD1cIiR7aW5kZXh9XCJdYCkudGV4dCA9IHRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q2hlY2tlZChpbmRleCwgdmFsdWUpe1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihgY2hlY2stYm94W2RhdGEtaW5kZXg9XCIke2luZGV4fVwiXWApLmNoZWNrZWQgPSB2YWx1ZTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbXVsdGlwbGUtY2hvaWNlLXBhbmUnLCBNdWx0aXBsZUNob2ljZVBhbmUpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE11bHRpcGxlQ2hvaWNlUGFuZTsiLCJjb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcblxyXG5jbGFzcyBUZXh0VXBkYXRlIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IodGV4dCkge1xyXG4gICAgICAgIHN1cGVyKCd0ZXh0LXVwZGF0ZScsXHJcbiAgICAgICAgICAgIHtkZXRhaWwgOiB7dGV4dCA6IHRleHR9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEJvYXJkQ2xpY2sgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcignYnV0dG9uLWJvYXJkJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFF1ZXN0aW9uQ2xpY2sgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcignYnV0dG9uLXF1ZXN0aW9uJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEFuc3dlckNsaWNrIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoJ2J1dHRvbi1hbnN3ZXInKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUXVlc3Rpb25QYW5lIGV4dGVuZHMgTmlkZ2V0RWxlbWVudHtcclxuXHJcbiAgICBhc3luYyByZWFkeSgpe1xyXG4gICAgICAgIGF3YWl0IHN1cGVyLnJlYWR5KCk7XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LWJvYXJkXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEJvYXJkQ2xpY2soKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LXF1ZXN0aW9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFF1ZXN0aW9uQ2xpY2soKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LWFuc3dlclwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBBbnN3ZXJDbGljaygpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpLmZvY3VzKCkpO1xyXG5cclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjdGV4dC1jb250ZW50c1wiKS5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCBhc3luYyAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpLnRleHQ7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgVGV4dFVwZGF0ZSh0ZXh0LnRyaW0oKSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyKCl7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiLnRleHQtY29udGVudHNcIikudGV4dCA9IFwiXCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGV4dCh0ZXh0KXtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dC1jb250ZW50c1wiKS50ZXh0ID0gdGV4dDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSBidXR0b24geydxdWVzdGlvbicsICdhbnN3ZXInfVxyXG4gICAgICovXHJcbiAgICBoaWdobGlnaHQoYnV0dG9uKXtcclxuICAgICAgICBmb3IgKGxldCBlbGUgb2YgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKGAuc2VsZWN0ZWRgKSkgZWxlLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoYCNzaG93LSR7YnV0dG9ufWApLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgYm9hcmRCdXR0b24odmFsdWUpe1xyXG4gICAgICAgIGlmICh2YWx1ZSl7XHJcbiAgICAgICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LWJvYXJkXCIpLnNob3coKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctYm9hcmRcIikuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgncXVlc3Rpb24tcGFuZScsIFF1ZXN0aW9uUGFuZSk7XHJcbm1vZHVsZS5leHBvcnRzID0gUXVlc3Rpb25QYW5lO1xyXG5cclxuXHJcblxyXG4iLCJcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAvLyBUaGUgQnJvd3NlciBBUEkga2V5IG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS5cclxuICAgIGRldmVsb3BlcktleSA6ICdBSXphU3lBQmNkTG1UNkhIXzdHbzgycV9JQkdJM2ptNlVMNHc0UTAnLFxyXG5cclxuICAgIC8vIFRoZSBDbGllbnQgSUQgb2J0YWluZWQgZnJvbSB0aGUgR29vZ2xlIEFQSSBDb25zb2xlLiBSZXBsYWNlIHdpdGggeW91ciBvd24gQ2xpZW50IElELlxyXG4gICAgY2xpZW50SWQgOiBcIjE1ODgyMzEzNDY4MS05OGJna2FuZ29sdGs2MzZ1a2Y4cG9mZWlzN3BhN2piay5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwiLFxyXG5cclxuICAgIC8vIFJlcGxhY2Ugd2l0aCB5b3VyIG93biBwcm9qZWN0IG51bWJlciBmcm9tIGNvbnNvbGUuZGV2ZWxvcGVycy5nb29nbGUuY29tLlxyXG4gICAgYXBwSWQgOiBcIjE1ODgyMzEzNDY4MVwiLFxyXG5cclxuICAgIC8vIEFycmF5IG9mIEFQSSBkaXNjb3ZlcnkgZG9jIFVSTHMgZm9yIEFQSXMgdXNlZCBieSB0aGUgcXVpY2tzdGFydFxyXG4gICAgZGlzY292ZXJ5RG9jcyA6IFtcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Rpc2NvdmVyeS92MS9hcGlzL2RyaXZlL3YzL3Jlc3RcIl0sXHJcblxyXG4gICAgLy8gU2NvcGUgdG8gdXNlIHRvIGFjY2VzcyB1c2VyJ3MgRHJpdmUgaXRlbXMuXHJcbiAgICBzY29wZTogXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLmZpbGVcIlxyXG59Il19
