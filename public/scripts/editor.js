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
        if (this.hasAttribute(Nidget.interfaceAttribute)) this.applyInterfaces();

        // set the html of this element to the contents of the file (not a shadow element)
        // all data- attributes will be used to fill in ${} variables in the source file
        // doesn't work on edge
        if (this.hasAttribute(Nidget.srcAttribute)) await this.retrieveSource(this.dataAttributes());

        // load the referenced template into this element (as a shadow element)
        if (this.hasAttribute(Nidget.templateAttribute)) this.applyTemplate(this.getAttribute(Nidget.templateAttribute));

        // call the 'nidgetReady' method which is overridden by the implementor
        if (this.nidgetReady) window.addEventListener("load", (event)=>this.nidgetReady(event));

        // manipulate (css) styles programmatically
        window.addEventListener("load", (event)=>this.applyStyle());
    }

    /**
     * Extend this method to do something when the model is set.
     * This is called by ModelElement.linkModels().  All elements with
     * data-model set to the model name will have this method called.
     * This can be overridden to do something with the model after it
     * is decoded.
     * @param name
     * @param value
     */
    setModel(name, value){
        this[Nidget.modelDataField][name] = value;
    }

    getModel(name){
        if (!name){
            return this[Nidget.modelDataField][Object.keys(this[Nidget.modelDataField])[0]];
        } else {
            return this[Nidget.modelDataField][name];
        }
    }

    applyStyle(){
        this.nidgetWidthRatio();
        this.nidgetHeightRatio();
    }

    nidgetWidthRatio(value) {
        if (value){
            this.style.setProperty("--nidget-width-ratio", value);
        }

        let onResize = () => {
            let ratio = getComputedStyle(this).getPropertyValue("--nidget-width-ratio");
            if (!parseFloat(ratio)) return;
            this.width = this.height * ratio;
        }

        if (this.observers.widthRatio === undefined) {
            this.observers.widthRatio = new ResizeObserver(onResize);
            this.observers.widthRatio.observe(this)
        }
        onResize()
    }

    nidgetHeightRatio(value) {
        if (value){
            this.style.setProperty("--nidget-height-ratio", value);
        }

        let onResize = () => {
            let ratio = getComputedStyle(this).getPropertyValue("--nidget-height-ratio");
            if (!parseFloat(ratio)) return;
            this.height = this.width * ratio;
        }

        if (this.observers.heightRatio === undefined) {
            this.observers.heightRatio = new ResizeObserver(onResize);
            this.observers.heightRatio.observe(this)
        }
        onResize()
    }

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

    /**
     * If the 'template' attribute is set, this method will be called. It will attach a shadow element with the contents
     * of the template named (templateID).
     * @return {undefined}
     */
    applyTemplate(templateId) {
        let template = document.getElementById(templateId);

        if (!template) throw new Error("Template '" + templateId + "' not found.");
        if (template.tagName.toUpperCase() !== "TEMPLATE") throw new Error("Element with id '" + templateId + "' is not a template.");

        this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
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

    applyInterfaces() {
        for (let interfaceName of this.interfaces()) {
            if (typeof Interfaces[interfaceName] === "function") {
                this[Nidget.interfaceDataField][interfaceName] = {};
                window.addEventListener("load", () => Interfaces[interfaceName](this));
            }
        }
    }

    locate(left, top) {
        this.left = left;
        this.top = top;
    }

    interfaces() {
        let interfaceText = $(this).attr(Nidget.interfaceAttribute);
        if (typeof interfaceText !== "string") return [];
        return interfaceText.split(/[ ,\t]+/);
    }

    show() {
        this.setAttribute("data-hidden", false);
    }

    hide() {
        this.setAttribute("data-hidden", true);
    }

    set hidden(value){
        if (value) this.hide();
        else this.show();
    }

    get hidden(){
        let attr = this.getAttribute("data-hidden");
        if (attr == null) return false;
        return attr === "true";
    }

    set display(value){
        this.style.display = value;
    }
    
    get display(){
        return window.getComputedStyle(this)["display"];
    }

    set disabled(value){
        if (value === true) {
            this.setAttribute("data-disabled", true);
        } else {
            this.removeAttribute("data-disabled", false);
        }
    }
    
    get disabled(){
        if (!this.hasAttribute("data-disabled")) return false;
        return this.getAttribute("data-disabled");
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
     * Scale this and all hex-element children.
     * @param {type} amount
     * @return {undefined}
     */
    scale(w, h, propagate = true) {
        if (!h) h = w;
        this.width = this.width * w;
        this.height = this.height * h;

        if (propagate) {
            for (let element of this.children) {
                if (element.scale) element.scale(w, h, propagate);
            }
        }
    }

    /**
     * Scale this and all hex-element children.
     * @param {type} amount
     * @return {undefined}
     */
    scaleTo(w, h, propagate = true) {
        let dw = w / this.width;
        let dh = dw;
        if (h) dh = h / this.height;
        dw = Math.trunc(dw * 1000, 3) / 1000;
        dh = Math.trunc(dh * 1000, 3) / 1000;
        this.scale(dw, dh, propagate);
    }    

    set width(w) {
        this.style.width = w + "px";
    }

    set height(h) {
        this.style.height = h + "px";
    }

    get width() {
        let w = window.getComputedStyle(this).width;
        return parseFloat(w);
    }

    get height() {
        let h = window.getComputedStyle(this).height;
        return parseFloat(h);
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
    
    clearPos(){
        this.style.top = null;
        this.style.left = null;
    }

    clearDims(){
        this.style.width = null;
        this.style.height = null;
    }

    querySelector(selectors) {
        if (this.shadowRoot){
            return this.shadowRoot.querySelector(selectors);
        } else {
            return super.querySelector(selectors);
        }
    }

    querySelectorAll(selectors) {
        if (this.shadowRoot){
            return this.shadowRoot.querySelectorAll(selectors);
        } else {
            return super.querySelectorAll(selectors);
        }
    }

    detach(){
        this.parentNode.removeChild(this);
    }
    
    static query(selector, cb = null){
        let queryResult = document.querySelectorAll(selector);        
        if (cb !== null){
            for (let e of queryResult){
                cb(e);
            }
        }
        return queryResult;
    }

    /**
     * Index within the parent element.
     */
    index(){
        return Array.from(this.parentElement.children).indexOf(this);
    }
}

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

    applyStyle() {
        super.applyStyle();

        this.initFitText();
        let fitProp = getComputedStyle(this).getPropertyValue("--nidget-fit-text");

        if (fitProp !== undefined && fitProp !== ""){
            this.fitText.listen();
        }
    }

    /**
     * Can call multiple times to change the lock value.
     * @param (string) lock vh = lock to view height, vw = lock to view width
     */
    initFitText(lock){
        if (lock) this.fitText.lock = lock;
        if (!this.fitText){
            this.fitText = new FitText(this);
        }
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
const Menu = require("./modules/Menu.js");
const QuestionPane = require("./modules/QuestionPane.js");
const EditorPane = require("./modules/EditorPane.js");

require("@thaerious/nidget")
require("./modules/GameBoard.js");

let fileOps = new FileOps();
let model = null;
let questionPane = null;

window.onload = async ()=> {
    window.menu = new Menu("#menu");
    parseURLParameters();

    try {
        await fileOps.loadClient();
        questionPane = new QuestionPane(()=>{
            fileOps.setBody(
                window.parameters.fileId, JSON.stringify(window.model.get(), null, 2)
            )
        });
    } catch (err) {
        console.log(err);
    }

    if (window.parameters.action === "new"){
        window.model = model = await new Model(fileOps).init();
        updateView(window.model);
        addListeners();

        try {
            let fp = await fileOps.create(window.parameters.dirId, "Game Name");
            await fileOps.setBody(fp.id, JSON.stringify(window.model.get(), null, 2));
            location.href = location.origin + "/editor.html?action=load&fileId=" + fp.id;
        } catch (err) {
            console.log(err);
        }
    }

    if (window.parameters.action === "load"){
        let file = await fileOps.get(window.parameters.fileId);
        let model = JSON.parse(file.body);
        window.model = model = new Model(fileOps).set(model);
        updateView(window.model);
        addListeners();
    }

    let editorPane = new EditorPane(window.model);
    editorPane.onSave = saveModel;
    editorPane.updateView = updateView;
}

function saveModel(){
    console.log(window.model.get());
    fileOps.setBody(window.parameters.fileId, JSON.stringify(window.model.get(), null, 2));
}

function parseURLParameters(){
    window.parameters = {};
    const parameters = window.location.search.substr(1).split("&");
    for (const parameter of parameters){
        const split = parameter.split(/=/);
        window.parameters[split[0]] = split[1] ?? "";
    }
}

function addListeners(){
    let gameBoard = document.getElementById("game-board");
    for (let col = 0; col < 6; col++){
        gameBoard.getHeader(col).addEventListener("input", headerChangeListener);
        gameBoard.getHeader(col).addEventListener("blur", headerFocusListener);

        for (let row = 0; row < 5; row++){
            gameBoard.getCell(row, col).addEventListener("click", ()=>{
                questionPane.showQuestion(window.model.getCell(row, col));
            });
        }
    }
}

function headerChangeListener(event){
    event.target.fitText.notify(1, 1);
    let col = parseInt(event.target.parentElement.getAttribute("data-col"));
    window.model.getColumn(col).category = event.target.text;
}

async function headerFocusListener(event){
    let col = parseInt(event.target.parentElement.getAttribute("data-col"));
    event.target.text = window.model.getColumn(col).category;
    window.model.getColumn(col).fontsize = event.target.style["font-size"];
    await fileOps.setBody(window.parameters.fileId, JSON.stringify(window.model.get(), null, 2));
}

function updateView(model){
    let gameBoard = document.getElementById("game-board");
    if (!gameBoard) throw new Error("Game board not found");
    model = model ?? window.model;

    let round = model.getRound();

    for (let col = 0; col < 6; col++){
        let column = model.getColumn(col);

        gameBoard.getHeader(col).initFitText("vh");
        gameBoard.setHeader(col, column.category);
        gameBoard.getHeader(col).fitText.delayResize(1, 1);

        for (let row = 0; row < 5; row++){
            gameBoard.setCell(row, col, column.cell[row].value);
        }
    }
}

class Model{
    init(){
        this.currentRound = 0;

        this.gameModel = {
            rounds : []
        };

        this.addRound();
        return this;
    }

    set(gameModel){
        this.currentRound = 0;
        this.gameModel = gameModel;
        return this;
    }

    get(){
        return this.gameModel;
    }
    
    getRound(index){
        index = index ?? this.currentRound;
        return this.gameModel.rounds[index];
    }

    getColumn(index){
        return this.getRound().column[index];
    }

    getCell(column, row){
        return this.getColumn(column).cell[row];
    }

    addRound(){
        let round = {
            type : "choice",
            column : []
        };

        for (let i = 0; i < 6; i++){
            round.column[i] = {
                category : "",
                cell : []
            }

            for (let j = 0; j < 5; j++){
                round.column[i].cell[j] = {
                    value : (j + 1) * 100,
                    type : "text",
                    q : "",
                    a : ""
                }
            }
        }

        this.gameModel.rounds.push(round);
        return round;
    }

    get roundCount(){
        return this.gameModel.rounds.length;
    }
}


},{"./modules/EditorPane.js":24,"./modules/FileOps.js":25,"./modules/GameBoard.js":26,"./modules/Menu.js":27,"./modules/QuestionPane.js":28,"@thaerious/nidget":22}],24:[function(require,module,exports){

class EditorPane{
    constructor(gameModel) {
        this.gameModel = gameModel;
        this.triangleRight = document.querySelector("#triangle-right");
        this.triangleLeft = document.querySelector("#triangle-left");

        this.updateTriangleView();

        document.querySelector("#menu-add-round").addEventListener("click", ()=>this.menuAdd());
        document.querySelector("#menu-remove-round").addEventListener("click", ()=>this.menuRemove());
        document.querySelector("#menu-home-screen").addEventListener("click", ()=>this.menuHome());
        this.triangleRight.addEventListener("click", ()=> this.nextRound());
        this.triangleLeft.addEventListener("click", ()=> this.prevRound());

        this.onSave = function(){}; // set this in main to save .json model
        this.updateView = function(){}; // set this in main to update view
    }

    updateTriangleView(){
        this.triangleLeft.classList.remove("hidden");
        this.triangleRight.classList.remove("hidden");
        if (this.gameModel.currentRound === 0) this.triangleLeft.classList.add("hidden");
        if (this.gameModel.currentRound >= this.gameModel.roundCount - 1) this.triangleRight.classList.add("hidden");
    }

    nextRound(){
        this.gameModel.currentRound++;
        this.updateTriangleView();
        this.updateView();
    }

    prevRound(){
        this.gameModel.currentRound--;
        this.updateTriangleView();
        this.updateView();
    }

    menuAdd(){
        console.log("menu add");
        this.gameModel.addRound();
        this.updateTriangleView();
        this.onSave();
    }

    menuRemove(){

    }

    menuHome(){

    }
}

module.exports = EditorPane;
},{}],25:[function(require,module,exports){
// see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

class FileOps {
    constructor(){
        // The Browser API key obtained from the Google API Console.
        this.developerKey = 'AIzaSyABcdLmT6HH_7Go82q_IBGI3jm6UL4w4Q0';

        // The Client ID obtained from the Google API Console. Replace with your own Client ID.
        this.clientId = "158823134681-98bgkangoltk636ukf8pofeis7pa7jbk.apps.googleusercontent.com"

        // Replace with your own project number from console.developers.google.com.
        this.appId = "158823134681";

        // Array of API discovery doc URLs for APIs used by the quickstart
        this.discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

        // Scope to use to access user's Drive items.
        this.scope = 'https://www.googleapis.com/auth/drive.file';
    }

    loadClient() {
        return new Promise((resolve, reject)=> {
            gapi.load('client:auth2', ()=>this.initClient(resolve, reject));
        });
    }

    initClient(resolve, reject) {
        gapi.client.init({
            apiKey: this.developerKey,
            clientId: this.clientId,
            discoveryDocs: this.discoveryDocs,
            scope: this.scope
        }).then(function () {
            resolve();
        }, function(error) {
            reject(error);
        });
    }

    async create(dirToken, filename){
        return new Promise((resolve, reject)=> {
            gapi.client.drive.files.create({
                name: filename,
                parents: [dirToken]
            }).then(res=>{
                resolve(JSON.parse(res.body));
            }, function (error) {
                reject(error.message);
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

module.exports = FileOps;
},{}],26:[function(require,module,exports){
"use strict";

class GameBoard extends HTMLElement {
    /**
     * Set the value of a category
     * @param index
     * @param value
     */
    setHeader(index, value){
        if (typeof index !== "number" || index < 0 || index > 6) throw new Error("Invalid index: " + index);
        let selector = `[data-row='h'][data-col='${index}'] > .value`;
        let element = this.querySelector(selector);
        element.text = value;
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
        if (typeof row !== "number" || row < 0 || row > 6) throw new Error("Invalid row: " + row);
        if (typeof col !== "number" || col < 0 || col > 5) throw new Error("Invalid col: " + col);

        let selector = `[data-row="${row}"][data-col="${col}"] > .value`;
        this.querySelector(selector).textContent = value;
    }

    getCell(row, col){
        let selector = `[data-row="${row}"][data-col="${col}"] > .value`;
        return this.querySelector(selector);
    }
}

window.customElements.define('game-board', GameBoard);
module.exports = GameBoard;
},{}],27:[function(require,module,exports){
class Menu{
    constructor(menuSelector) {
        this.menuSelector = menuSelector;
        this.menuButton.addEventListener("click", ()=>this.toggleMenu());
        this.positionMenu();
    }

    toggleMenu(){
        if (this.menuArea.classList.contains("hidden")){
            this.menuArea.classList.remove("hidden");
            this.positionMenu();
        } else {
            this.menuArea.classList.add("hidden");
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
},{}],28:[function(require,module,exports){

class QuestionPane{

    /**
     * Call constructor after window has loaded
     * @param (function) savecb callback to save model
     */
    constructor(savecb) {
        this.textQuestion = document.querySelector("#text-question");
        this.navBoard = document.querySelector("#show-board");
        this.navQuestion = document.querySelector("#show-question");
        this.navAnswer = document.querySelector("#show-answer");

        document.querySelector("#show-board").addEventListener("click", ()=>{
            this.hideAll();
        });

        document.querySelector("#show-question").addEventListener("click", ()=>{
            this.showQuestion();
        });

        document.querySelector("#show-answer").addEventListener("click", ()=>{
            this.showAnswer();
        });

        this.textQuestion.querySelector(".text-contents").addEventListener("blur", async ()=>{
           this.cell[this.status] = this.textQuestion.querySelector(".text-contents").text;
           await savecb();
        });
    }

    hideAll(){
        this.navBoard.classList.add("hidden");
        this.navQuestion.classList.add("hidden");
        this.navAnswer.classList.add("hidden");
        this.textQuestion.classList.add("hidden");
    }

    showQuestion(cell){
        if (cell) this.cell = cell;
        cell = cell ?? this.cell;

        this.navAnswer.classList.remove("selected");
        this.navQuestion.classList.add("selected");

        this.status = "q";

        this.navBoard.classList.remove("hidden");
        this.navQuestion.classList.remove("hidden");
        this.navAnswer.classList.remove("hidden");

        this.textQuestion.classList.remove("hidden");
        this.textQuestion.querySelector(".text-contents").text = cell.q;
    }

    showAnswer(cell){
        if (cell) this.cell = cell;
        cell = cell ?? this.cell;

        this.navAnswer.classList.add("selected");
        this.navQuestion.classList.remove("selected");

        this.status = "a";

        this.navBoard.classList.remove("hidden");
        this.navQuestion.classList.remove("hidden");
        this.navAnswer.classList.remove("hidden");

        this.textQuestion.classList.remove("hidden");
        this.textQuestion.querySelector(".text-contents").text = cell.a;
    }
}

module.exports = QuestionPane;



},{}]},{},[23])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0Fic3RyYWN0TW9kZWwuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0RyYWdIYW5kbGVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9GaWxlT3BlcmF0aW9ucy5qcyIsIi4uLy4uL25pZGdldC9zcmMvSW50ZXJmYWNlcy5qcyIsIi4uLy4uL25pZGdldC9zcmMvTW91c2VVdGlsaXRpZXMuanMiLCIuLi8uLi9uaWRnZXQvc3JjL05pZGdldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0RWxlbWVudC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0U3R5bGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL1RyYW5zZm9ybWVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b24uanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblNldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU3RhdGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldENvbnRhaW5lci5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SFRNTEltYWdlLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRJbWFnZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0VGV4dC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJhZy5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJvcC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvTW91c2UuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL01vdmFibGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL1Jlc2l6ZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvcHJvamVjdEZpbGUuanMiLCJzcmMvY2xpZW50L2VkaXRvci5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9FZGl0b3JQYW5lLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0ZpbGVPcHMuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvR2FtZUJvYXJkLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL01lbnUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvUXVlc3Rpb25QYW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xuY2xhc3MgQWJzdHJhY3RNb2RlbCB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGFic3RyYWN0IG1vZGVsLiAgSWYgZGVsZWdhdGUgaXMgcHJvdmlkZWQgdGhlbiBhbGwgbGlzdGVuZXJcbiAgICAgKiBhZGRzIGFuZCBub3RpZmllcyBhcmUgcGVyZm9ybWVkIG9uIHRoZSBkZWxlZ2F0ZSBsaXN0ZW5lciBjb2xsZWN0aW9uLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZGVsZWdhdGVcbiAgICAgKiBAcmV0dXJucyB7bm0kX0Fic3RyYWN0TW9kZWwuQWJzdHJhY3RNb2RlbH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHRoaXM7XG4gICAgICAgIHRoaXMuYWJzdHJhY3RNb2RlbExpc3RlbmVycyA9IFtdOyAgICAgICAgXG4gICAgfVxuXG4gICAgZ2V0RGVsZWdhdGUoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVsZWdhdGU7XG4gICAgfVxuICAgIFxuICAgIHNldERlbGVnYXRlKGRlbGVnYXRlID0gbnVsbCl7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmFic3RyYWN0TW9kZWxMaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUgPSBkZWxlZ2F0ZS5kZWxlZ2F0ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKHRoaXMuZGVsZWdhdGUgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ1bmRlZmluZWQgZGVsZWdhdGVcIik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYWRkTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gXCJvYmplY3RcIil7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIEFic3RyYWN0TW9kZWwgbGlzdGVuZXIgdHlwZTogXCIgKyB0eXBlb2YgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGVsZWdhdGUuYWJzdHJhY3RNb2RlbExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsIGFzIG5vdGlmeUxpc3RlbmVycyhtZXRob2ROYW1lLCBbbWV0aG9kQXJndW1lbnQwLCAuLi4gbWV0aG9kQXJndW1lbnROXSlcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1ldGhvZFxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgYXN5bmMgbm90aWZ5TGlzdGVuZXJzKG1ldGhvZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVWRU5UIFwiICsgdGhpcy5kZWxlZ2F0ZS5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgKyBtZXRob2QpO1xuXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5zaGlmdC5hcHBseShhcmd1bWVudHMpO1xuICAgICAgICBsZXQgZXZlbnQgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3VtZW50cyxcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcyxcbiAgICAgICAgICAgIGxpc3RlbmVyczogW11cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5sYXN0RXZlbnQgPSBldmVudDtcbiAgICAgICAgd2luZG93Lm5FdmVudHMucHVzaCh3aW5kb3cubGFzdEV2ZW50KTtcblxuICAgICAgICBmb3IgKGxldCBsaXN0ZW5lciBvZiB0aGlzLmRlbGVnYXRlLmFic3RyYWN0TW9kZWxMaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lclttZXRob2RdKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIiArIFwiICsgbGlzdGVuZXIuY29uc3RydWN0b3IubmFtZSArIFwiIFwiICsgbWV0aG9kKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cubGFzdEV2ZW50Lmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUpOyAgICAgICBcbiAgICAgICAgICAgICAgICBhd2FpdCBsaXN0ZW5lclttZXRob2RdLmFwcGx5KGxpc3RlbmVyLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpc3RlbmVyW0Fic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyXSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCIgKyBcIiArIGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUgKyBcIiBcIiArIEFic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cubGFzdEV2ZW50Lmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUpOyAgICAgICBcbiAgICAgICAgICAgICAgICBhd2FpdCBsaXN0ZW5lcltBYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lcl0uYXBwbHkobGlzdGVuZXIsIHdpbmRvdy5sYXN0RXZlbnQpOyAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuQWJzdHJhY3RNb2RlbC5kZWZhdWx0TGlzdGVuZXIgPSBcIm5pZGdldExpc3RlbmVyXCI7XG53aW5kb3cubkV2ZW50cyA9IFtdO1xubW9kdWxlLmV4cG9ydHMgPSBBYnN0cmFjdE1vZGVsOyIsIid1c2Ugc3RyaWN0Jztcbi8qKlxuICogU2luZ2xldG9uIGNsYXNzIHRvIHByb3ZpZGluZyBmdW5jdGlvbmFsaXR5IHRvIERyYWdOaWRnZXRzIGFuZCBEcm9wTmlkZ2V0cy5cbiAqIEl0IHN0b3JlcyB0aGUgTmlkZ2V0IGN1cnJlbnRseSBiZWluZyBkcmFnZ2VkLlxuICovXG5jbGFzcyBEcmFnSGFuZGxlcntcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLm92ZXIgPSBbXTtcbiAgICB9XG4gICAgXG4gICAgcHVzaE92ZXIobmlkZ2V0KXtcbiAgICAgICAgaWYgKHRoaXMub3ZlckhhcyhuaWRnZXQpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMub3Zlci5wdXNoKG5pZGdldCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBcbiAgICByZW1vdmVPdmVyKG5pZGdldCl7XG4gICAgICAgIGlmICghdGhpcy5vdmVySGFzKG5pZGdldCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhpcy5vdmVyLnNwbGljZSh0aGlzLm92ZXIuaW5kZXhPZihuaWRnZXQpLCAxKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSAgICBcbiAgICBcbiAgICBvdmVySGFzKG5pZGdldCl7XG4gICAgICAgIHJldHVybiB0aGlzLm92ZXIuaW5kZXhPZihuaWRnZXQpICE9PSAtMTtcbiAgICB9XG4gICAgXG4gICAgc2V0KG5pZGdldCl7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5pZGdldDtcbiAgICB9XG4gICAgXG4gICAgZ2V0KCl7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQ7XG4gICAgfVxuICAgIFxuICAgIGhhcygpe1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50ICE9PSBudWxsO1xuICAgIH1cbiAgICBcbiAgICBjbGVhcigpe1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xuICAgIH1cbiAgICBcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoKXtcbiAgICAgICAgcmV0dXJuIERyYWdIYW5kbGVyLmluc3RhbmNlO1xuICAgIH0gICAgXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IERyYWdIYW5kbGVyKCk7XG5cbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKiBnbG9iYWwgVXRpbGl0eSAqL1xuY2xhc3MgRmlsZU9wZXJhdGlvbnMge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIGEgZmlsZSAodXJsKS4gIE1hcCB2YXJpYWJsZXMgKCR7Li4ufSkgdG8gXG4gICAgICogYSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHVybFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgbG9hZE5pZGdldCh1cmwsIG1hcCl7ICAgICAgICBcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudCh1cmwsIG1hcCk7XG4gICAgICAgIHJldHVybiBuZXcgTmlkZ2V0RWxlbWVudChlbGVtZW50KTtcbiAgICB9ICAgIFxuICAgIFxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIGEgZmlsZSAodXJsKS4gIE1hcCB2YXJpYWJsZXMgKCR7Li4ufSkgdG8gXG4gICAgICogYSB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHVybFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgbG9hZERPTUVsZW1lbnQodXJsLCBtYXAgPSBuZXcgTWFwKCkpeyAgICAgICAgXG4gICAgICAgIGlmIChtYXAgaW5zdGFuY2VvZiBNYXAgPT09IGZhbHNlKSBtYXAgPSBGaWxlT3BlcmF0aW9ucy5vYmplY3RUb01hcChtYXApOyAgICAgICBcbiAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRVUkwodXJsKTtcbiAgICAgICAgcmV0dXJuIEZpbGVPcGVyYXRpb25zLnN0cmluZ1RvRE9NRWxlbWVudCh0ZXh0LCBtYXApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIHRleHQuXG4gICAgICogQHBhcmFtIHt0eXBlfSB0ZXh0XG4gICAgICogQHBhcmFtIHt0eXBlfSBtYXBcbiAgICAgKiBAcmV0dXJucyB7bm9kZXxGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudC5kb21FbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBzdHJpbmdUb0RPTUVsZW1lbnQodGV4dCwgbWFwID0gbmV3IE1hcCgpKXtcbiAgICAgICAgLyogcmVwbGFjZSB2YXJpYWJsZXMgd2l0aCB2YWx1ZXMgKi9cbiAgICAgICAgZm9yIChsZXQga2V5IG9mIG1hcC5rZXlzKCkpeyAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IHZhbHVlID0gbWFwLmdldChrZXkpO1xuICAgICAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdPyR7a2V5fVt9XWAsIGBnYCk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCB2YWx1ZSk7ICAgIFxuICAgICAgICB9XG5cbiAgICAgICAgLyogcmVwbGFjZSB1bmZpbGxlZCB2YXJpYWJsZXMgd2l0aCBlbXB0eSAqL1xuICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGBbJF1be11bXn1dKlt9XWAsIGBnYCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsIFwiXCIpOyBcblxuICAgICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IHRleHQ7XG4gICAgICAgIGxldCBkb21FbGVtZW50ID0gbnVsbDtcbiAgICAgICAgY29uc29sZS5sb2coZWxlbWVudCk7XG5cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgc3RhdGljIG9iamVjdFRvTWFwKG9iamVjdCl7XG4gICAgICAgIGxldCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGZvciAobGV0IGZpZWxkIGluIG9iamVjdCl7ICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9iamVjdFtmaWVsZF0gPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIG9iamVjdFtmaWVsZF0gPT09IFwibnVtYmVyXCIpe1xuICAgICAgICAgICAgICAgIG1hcC5zZXQoZmllbGQsIG9iamVjdFtmaWVsZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuXG4gICAgXG5cbiAgICAvKlxuICAgICAqIFRyYW5zZmVyIGNvbnRlbnRzIG9mICdmaWxlbmFtZScgZnJvbSBzZXJ2ZXIgdG8gY2xpZW50LlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHN1Y2Nlc3NDYWxsYmFja1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGVycm9yQ2FsbGJhY2tcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfSBjb250ZW50cyBvZiBmaWxlXG4gICAgICovXG4gICAgc3RhdGljIGdldFVSTCh1cmwpIHtcbiAgICAgICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoeGh0dHAucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGh0dHAuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAgOiB4aHR0cCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMgOiB4aHR0cC5zdGF0dXMsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgOiB4aHR0cC5yZXNwb25zZVRleHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsIDogdXJsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICAgICAgICAgIHhodHRwLnNlbmQobnVsbCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSB0ZXh0LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gdGV4dFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgZ2V0RmlsZSh1cmwsIG1hcCA9IG5ldyBNYXAoKSl7XG4gICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0VVJMKHVybCk7XG5cbiAgICAgICAgLyogcmVwbGFjZSB2YXJpYWJsZXMgd2l0aCB2YWx1ZXMgKi9cbiAgICAgICAgZm9yIChsZXQga2V5IG9mIG1hcC5rZXlzKCkpe1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gbWFwLmdldChrZXkpO1xuICAgICAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdPyR7a2V5fVt9XWAsIGBnYCk7XG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiByZXBsYWNlIHVuZmlsbGVkIHZhcmlhYmxlcyB3aXRoIGVtcHR5ICovXG4gICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XVtefV0qW31dYCwgYGdgKTtcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgXCJcIik7XG5cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBUcmFuc2ZlciBjb250ZW50cyBvZiAnZmlsZW5hbWUnIGZyb20gc2VydmVyIHRvIGNsaWVudCB1c2luZyBjdXJyZW50IHdpbmRvdyBsb2NhdGlvbi5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdWNjZXNzQ2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcnJvckNhbGxiYWNrXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0TG9jYWwoZmlsZW5hbWUpIHtcbiAgICAgICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICAgICAgdmFyIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmICsgXCIvXCIgKyBmaWxlbmFtZTtcblxuICAgICAgICAgICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh4aHR0cC5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHR0cC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh4aHR0cC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHhodHRwLnN0YXR1cywgeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgICAgICAgICAgIHhodHRwLnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShjYWxsYmFjayk7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIENhdXNlICd0ZXh0JyB0byBiZSBzYXZlZCBhcyAnZmlsZW5hbWUnIGNsaWVudCBzaWRlLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZmlsZW5hbWUgVGhlIGRlZmF1bHQgZmlsZW5hbWUgdG8gc2F2ZSB0aGUgdGV4dCBhcy5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHRleHQgVGhlIHRleHQgdG8gc2F2ZSB0byBmaWxlbmFtZS5cbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHN0YXRpYyBzYXZlVG9GaWxlKHRleHQsIGZpbGVuYW1lKSB7XG4gICAgICAgIGxldCBhbmNob3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgIGxldCBkYXRhID0gXCJ0ZXh0O2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUklDb21wb25lbnQodGV4dCk7XG4gICAgICAgIGFuY2hvci5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIFwiZGF0YTpcIiArIGRhdGEpO1xuICAgICAgICBhbmNob3Iuc2V0QXR0cmlidXRlKFwiZG93bmxvYWRcIiwgZmlsZW5hbWUpO1xuICAgICAgICBhbmNob3IuY2xpY2soKTtcbiAgICB9XG59XG5cbkZpbGVPcGVyYXRpb25zLk5vZGVUeXBlID0ge1xuICAgIEVMRU1FTlQgOiAxLFxuICAgIEFUVFJJQlVURSA6IDIsXG4gICAgVEVYVCA6IDMsIFxuICAgIENEQVRBU0VDVElPTiA6IDQsXG4gICAgRU5USVRZUkVGRVJOQ0UgOiA1LFxuICAgIEVOVElUWSA6IDYsXG4gICAgUFJPQ0VTU0lOR0lOU1RSVUNUSU9OIDogNyxcbiAgICBDT01NRU5UIDogOCxcbiAgICBET0NVTUVOVCA6IDksXG4gICAgRE9DVU1FTlRUWVBFIDogMTAsXG4gICAgRE9DVU1FTlRGUkFHTUVOVCA6IDExLFxuICAgIE5PVEFUSU9OIDogMTJcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wZXJhdGlvbnM7IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbW91c2UgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9Nb3VzZVwiKSwgXG4gICAgZHJhZyA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL0RyYWdcIiksXG4gICAgZHJvcCA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL0Ryb3BcIiksXG4gICAgbW92YWJsZSA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL01vdmFibGVcIiksXG4gICAgcmVzaXplIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvUmVzaXplXCIpXG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFNpbmdsdG9uIGNsYXNzIHRvIGFkZCBmdW5jdGlvbmFsaXR5IHRvIHRoZSBtb3VzZS5cbiAqL1xuY2xhc3MgTW91c2VVdGlsaXRpZXMge1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5sYXN0WCA9IDA7XG4gICAgICAgIHRoaXMubGFzdFkgPSAwO1xuICAgIH1cbiAgICBcbiAgICBpc1VuZGVyKGV2ZW50LCBlbGVtZW50KSB7XG4gICAgICAgIGxldCB4ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG5cbiAgICAgICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50ID09PSBlbGVtZW50KSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGdldFVuZGVyKGV2ZW50KSB7XG4gICAgICAgIGxldCB4ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcbiAgICB9XG5cbiAgICBzZXQgZWxlbWVudChlbGVtZW50KXtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWRFbGVtZW50ICE9PSBudWxsKXtcbiAgICAgICAgICAgIHRoaXMuZGV0YWNoRWxlbWVudCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZWxlbWVudCB8fCBlbGVtZW50ID09PSBudWxsIHx8IGVsZW1lbnQgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aGlzLmRldGFjaEVsZW1lbnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoRWxlbWVudChlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgZWxlbWVudCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5hdHRhY2hlZEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGFuIGVsZW1lbnQuICBJZiB0aGUgZWxlbWVudCBkb2Vzbid0IGhhdmUgYSBwYXJlbnQgaXQgd2lsbCBiZVxuICAgICAqIGF0dGFjaGVkIHRvIHRoZSBkb2N1bWVudCBhbmQgd2lsbCBiZSBkZXRhY2hlZCB3aGVuIGRldGFjaEVsZW1lbnQgaXMgY2FsbGVkLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZWxlbWVudFxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgYXR0YWNoRWxlbWVudChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50ID0gZWxlbWVudDtcbiAgICAgICAgXG4gICAgICAgIGlmIChlbGVtZW50LnBhcmVudCl7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gbm90IGF0dGFjaCBlbGVtZW50IHRvIG1vdXNlIGlmIHRoZSBlbGVtZW50IGhhcyBhIHBhcmVudCBlbGVtZW50LlwiKTtcbiAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZChlbGVtZW50KTtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjsgXG4gICAgICAgIGVsZW1lbnQuc3R5bGUudG9wID0gZXZlbnQuY2xpZW50WSArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gZXZlbnQuY2xpZW50WCArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJub25lXCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIxMDAwMFwiO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5tb3ZlQ2FsbEJhY2sgPSAoZXZlbnQpPT50aGlzLm9uTW91c2VNb3ZlKGV2ZW50KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3ZlQ2FsbEJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBsaXN0ZW5lcnMgZnJvbSB0aGUgYXR0YWNoZWQgZWxlbWVudCwgZG8gbm90IHJlbW92ZSBpdCBmcm9tIHRoZVxuICAgICAqIGRvY3VtZW50LlxuICAgICAqIEByZXR1cm5zIHt0eXBlfVxuICAgICAqL1xuICAgIGRldGFjaEVsZW1lbnQoKXtcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWRFbGVtZW50ID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIFxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdmVDYWxsQmFjayk7ICAgICAgICBcbiAgICAgICAgbGV0IHJ2YWx1ZSA9IHRoaXMuYXR0YWNoZWRFbGVtZW50O1xuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudCA9IG51bGw7ICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChydmFsdWUpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHJ2YWx1ZTtcbiAgICB9XG5cbiAgICBvbk1vdXNlTW92ZShldmVudCkgeyAgICAgICAgXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMubGFzdFggPSBldmVudC5jbGllbnRYO1xuICAgICAgICB0aGlzLmxhc3RZID0gZXZlbnQuY2xpZW50WTtcblxuICAgICAgICAvLyBzZXQgdGhlIGVsZW1lbnQncyBuZXcgcG9zaXRpb246XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50LnN0eWxlLnRvcCA9IGV2ZW50LmNsaWVudFkgKyBcInB4XCI7XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50LnN0eWxlLmxlZnQgPSBldmVudC5jbGllbnRYICsgXCJweFwiO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW91c2VVdGlsaXRpZXMoKTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHByZWZpeDogXCJkYXRhLW5pZGdldFwiLFxuICAgIGVsZW1lbnRBdHRyaWJ1dGU6IFwiZGF0YS1uaWRnZXQtZWxlbWVudFwiLFxuICAgIHNyY0F0dHJpYnV0ZTogXCJzcmNcIixcbiAgICBuYW1lQXR0cmlidXRlOiBcIm5hbWVcIixcbiAgICBpbnRlcmZhY2VBdHRyaWJ1dGU6IFwiaW50ZXJmYWNlc1wiLFxuICAgIHRlbXBsYXRlQXR0cmlidXRlOiBcInRlbXBsYXRlXCIsXG4gICAgaW50ZXJmYWNlRGF0YUZpZWxkOiBcImludGVyZmFjZURhdGFcIixcbiAgICBtb2RlbERhdGFGaWVsZDogXCJtb2RlbERhdGFcIixcbiAgICBzdHlsZUF0dHJpYnV0ZTogXCJuaWRnZXQtc3R5bGVcIlxufTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IEZpbGVPcGVyYXRpb25zID0gcmVxdWlyZShcIi4vRmlsZU9wZXJhdGlvbnNcIik7XG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi9OaWRnZXRcIik7XG5jb25zdCBJbnRlcmZhY2VzID0gcmVxdWlyZShcIi4vSW50ZXJmYWNlc1wiKTtcbmNvbnN0IFRyYW5zZm9ybWVyID0gcmVxdWlyZShcIi4vVHJhbnNmb3JtZXJcIik7XG5jb25zdCBOaWRnZXRTdHlsZSA9IHJlcXVpcmUoXCIuL05pZGdldFN0eWxlXCIpO1xuXG4vKipcbiAqIEEgTmlkZ2V0RWxlbWVudCBpcyBhIDE6MSBjbGFzcy1vYmplY3Q6ZG9tLW9iamVjdCBwYWlyaW5nLiAgQWN0aW9ucyBvbiB0aGUgRE9NIFxuICogb2JqZWN0IHNob3VsZCBvbmx5IGJlIGNhbGxlZCBieSB0aGUgTmlkZ2V0RWxlbWVudCBvYmplY3QuICBUaGUgaW50ZXJmYWNlRGF0YVxuICogZmllbGQgaXMgcmVzZXJ2ZWQgZm9yIGRhdGEgZnJvbSBpbnRlcmZhY2VzLiAgSW50ZXJmYWNlcyBzaG91bGQgcHV0IHRoZWlyIFxuICogY3VzdG9tIGRhdGEgdW5kZXIgW2ludGVyZmFjZURhdGFGaWVsZF0uW2ludGVyZmFjZU5hbWVdLiAgVGhlIGludGVyZmFjZSBkYXRhXG4gKiBhdHRyaWJ1dGUgaXMgc2V0IHdpdGggdGhlIHN0YXRpYyB2YWx1ZSBOaWRnZXQuaW50ZXJmYWNlRGF0YUZpZWxkLlxuICogXG4gKiBDYWxsaW5nIG1ldGhvZHMgb24gdGhlIG5pZGdldCB3aWxsIHRyZWF0IHNoYWRvdyBjb250ZW50cyBhcyByZWd1bGFyIGNvbnRlbnRzLlxuICovXG5jbGFzcyBOaWRnZXRFbGVtZW50IGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBOaWRnZXQgYXNzb2NpYXRlZCB3aXRoICdlbGVtZW50Jy4gIEFuIGVycm9yIHdpbGwgYmUgdGhyb3duXG4gICAgICogaWYgdGhlICdlbGVtZW50JyBpcyBhbHJlYWR5IGFzc29jaWF0ZWQgd2l0aCBhIE5pZGdldC5cbiAgICAgKiBcbiAgICAgKiBEaXNhYmxlZCBjbGFzcyBpbmRpY2F0ZXMgdGhpcyBuaWRnZXQgd2lsbCBpZ25vcmUgbW91c2UgZXZlbnRzLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7dHlwZX0gZWxlbWVudCBKUXVlcnkgc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJuIHtubSRfTmlkZ2V0Lk5pZGdldEVsZW1lbnR9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IodGVtcGxhdGVJZCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzW05pZGdldC5pbnRlcmZhY2VEYXRhRmllbGRdID0ge307XG4gICAgICAgIHRoaXNbTmlkZ2V0Lm1vZGVsRGF0YUZpZWxkXSA9IHt9O1xuICAgICAgICB0aGlzLnRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybWVyKHRoaXMpO1xuICAgICAgICB0aGlzLm9ic2VydmVycyA9IHt9O1xuXG4gICAgICAgIGlmICh0ZW1wbGF0ZUlkKXtcbiAgICAgICAgICAgIHRoaXMuYXBwbHlUZW1wbGF0ZSh0ZW1wbGF0ZUlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjayBpcyBpbnZva2VkIGVhY2ggdGltZSB0aGUgY3VzdG9tIGVsZW1lbnQgaXMgYXBwZW5kZWQgaW50byBhIGRvY3VtZW50LWNvbm5lY3RlZCBlbGVtZW50XG4gICAgICovXG4gICAgYXN5bmMgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHRoaXMuc2hhZG93Q29udGVudHMgPSB0aGlzO1xuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoTmlkZ2V0LmludGVyZmFjZUF0dHJpYnV0ZSkpIHRoaXMuYXBwbHlJbnRlcmZhY2VzKCk7XG5cbiAgICAgICAgLy8gc2V0IHRoZSBodG1sIG9mIHRoaXMgZWxlbWVudCB0byB0aGUgY29udGVudHMgb2YgdGhlIGZpbGUgKG5vdCBhIHNoYWRvdyBlbGVtZW50KVxuICAgICAgICAvLyBhbGwgZGF0YS0gYXR0cmlidXRlcyB3aWxsIGJlIHVzZWQgdG8gZmlsbCBpbiAke30gdmFyaWFibGVzIGluIHRoZSBzb3VyY2UgZmlsZVxuICAgICAgICAvLyBkb2Vzbid0IHdvcmsgb24gZWRnZVxuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoTmlkZ2V0LnNyY0F0dHJpYnV0ZSkpIGF3YWl0IHRoaXMucmV0cmlldmVTb3VyY2UodGhpcy5kYXRhQXR0cmlidXRlcygpKTtcblxuICAgICAgICAvLyBsb2FkIHRoZSByZWZlcmVuY2VkIHRlbXBsYXRlIGludG8gdGhpcyBlbGVtZW50IChhcyBhIHNoYWRvdyBlbGVtZW50KVxuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoTmlkZ2V0LnRlbXBsYXRlQXR0cmlidXRlKSkgdGhpcy5hcHBseVRlbXBsYXRlKHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldC50ZW1wbGF0ZUF0dHJpYnV0ZSkpO1xuXG4gICAgICAgIC8vIGNhbGwgdGhlICduaWRnZXRSZWFkeScgbWV0aG9kIHdoaWNoIGlzIG92ZXJyaWRkZW4gYnkgdGhlIGltcGxlbWVudG9yXG4gICAgICAgIGlmICh0aGlzLm5pZGdldFJlYWR5KSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKGV2ZW50KT0+dGhpcy5uaWRnZXRSZWFkeShldmVudCkpO1xuXG4gICAgICAgIC8vIG1hbmlwdWxhdGUgKGNzcykgc3R5bGVzIHByb2dyYW1tYXRpY2FsbHlcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIChldmVudCk9PnRoaXMuYXBwbHlTdHlsZSgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFeHRlbmQgdGhpcyBtZXRob2QgdG8gZG8gc29tZXRoaW5nIHdoZW4gdGhlIG1vZGVsIGlzIHNldC5cbiAgICAgKiBUaGlzIGlzIGNhbGxlZCBieSBNb2RlbEVsZW1lbnQubGlua01vZGVscygpLiAgQWxsIGVsZW1lbnRzIHdpdGhcbiAgICAgKiBkYXRhLW1vZGVsIHNldCB0byB0aGUgbW9kZWwgbmFtZSB3aWxsIGhhdmUgdGhpcyBtZXRob2QgY2FsbGVkLlxuICAgICAqIFRoaXMgY2FuIGJlIG92ZXJyaWRkZW4gdG8gZG8gc29tZXRoaW5nIHdpdGggdGhlIG1vZGVsIGFmdGVyIGl0XG4gICAgICogaXMgZGVjb2RlZC5cbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqL1xuICAgIHNldE1vZGVsKG5hbWUsIHZhbHVlKXtcbiAgICAgICAgdGhpc1tOaWRnZXQubW9kZWxEYXRhRmllbGRdW25hbWVdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0TW9kZWwobmFtZSl7XG4gICAgICAgIGlmICghbmFtZSl7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1tOaWRnZXQubW9kZWxEYXRhRmllbGRdW09iamVjdC5rZXlzKHRoaXNbTmlkZ2V0Lm1vZGVsRGF0YUZpZWxkXSlbMF1dO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXNbTmlkZ2V0Lm1vZGVsRGF0YUZpZWxkXVtuYW1lXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFwcGx5U3R5bGUoKXtcbiAgICAgICAgdGhpcy5uaWRnZXRXaWR0aFJhdGlvKCk7XG4gICAgICAgIHRoaXMubmlkZ2V0SGVpZ2h0UmF0aW8oKTtcbiAgICB9XG5cbiAgICBuaWRnZXRXaWR0aFJhdGlvKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KFwiLS1uaWRnZXQtd2lkdGgtcmF0aW9cIiwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9uUmVzaXplID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtd2lkdGgtcmF0aW9cIik7XG4gICAgICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLndpZHRoID0gdGhpcy5oZWlnaHQgKiByYXRpbztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9ic2VydmVycy53aWR0aFJhdGlvID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLndpZHRoUmF0aW8gPSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUpO1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMud2lkdGhSYXRpby5vYnNlcnZlKHRoaXMpXG4gICAgICAgIH1cbiAgICAgICAgb25SZXNpemUoKVxuICAgIH1cblxuICAgIG5pZGdldEhlaWdodFJhdGlvKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSl7XG4gICAgICAgICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KFwiLS1uaWRnZXQtaGVpZ2h0LXJhdGlvXCIsIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvblJlc2l6ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCByYXRpbyA9IGdldENvbXB1dGVkU3R5bGUodGhpcykuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWhlaWdodC1yYXRpb1wiKTtcbiAgICAgICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy53aWR0aCAqIHJhdGlvO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZXJzLmhlaWdodFJhdGlvID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmhlaWdodFJhdGlvID0gbmV3IFJlc2l6ZU9ic2VydmVyKG9uUmVzaXplKTtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLmhlaWdodFJhdGlvLm9ic2VydmUodGhpcylcbiAgICAgICAgfVxuICAgICAgICBvblJlc2l6ZSgpXG4gICAgfVxuXG4gICAgZGF0YUF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIGxldCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGZvciAobGV0IGF0dHIgb2YgdGhpcy5hdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBpZiAoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoXCJkYXRhLVwiKSkge1xuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gYXR0ci5uYW1lLnN1YnN0cig1KTtcbiAgICAgICAgICAgICAgICBtYXBbbmFtZV0gPSBhdHRyLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSWYgdGhlICd0ZW1wbGF0ZScgYXR0cmlidXRlIGlzIHNldCwgdGhpcyBtZXRob2Qgd2lsbCBiZSBjYWxsZWQuIEl0IHdpbGwgYXR0YWNoIGEgc2hhZG93IGVsZW1lbnQgd2l0aCB0aGUgY29udGVudHNcbiAgICAgKiBvZiB0aGUgdGVtcGxhdGUgbmFtZWQgKHRlbXBsYXRlSUQpLlxuICAgICAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBhcHBseVRlbXBsYXRlKHRlbXBsYXRlSWQpIHtcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGVtcGxhdGVJZCk7XG5cbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgdGhyb3cgbmV3IEVycm9yKFwiVGVtcGxhdGUgJ1wiICsgdGVtcGxhdGVJZCArIFwiJyBub3QgZm91bmQuXCIpO1xuICAgICAgICBpZiAodGVtcGxhdGUudGFnTmFtZS50b1VwcGVyQ2FzZSgpICE9PSBcIlRFTVBMQVRFXCIpIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgd2l0aCBpZCAnXCIgKyB0ZW1wbGF0ZUlkICsgXCInIGlzIG5vdCBhIHRlbXBsYXRlLlwiKTtcblxuICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogJ29wZW4nfSkuYXBwZW5kQ2hpbGQodGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgY29udGVudHMgb2YgZmlsZSBpbnRvIHRoaXMgZWxlbWVudC5cbiAgICAgKiBSZXBsYWNlIGFsbCAke30gdmFyaWFibGVzIHdpdGggY29udGVudHMgb2YgJ21hcCcuXG4gICAgICovXG4gICAgYXN5bmMgcmV0cmlldmVTb3VyY2UobWFwKXtcbiAgICAgICAgbGV0IHNyYyA9IHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldC5zcmNBdHRyaWJ1dGUpO1xuICAgICAgICBsZXQgdGV4dCA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLmdldEZpbGUoc3JjLCBtYXApO1xuICAgICAgICB0aGlzLmlubmVySFRNTCA9IHRleHQ7XG4gICAgfVxuXG4gICAgYXBwbHlJbnRlcmZhY2VzKCkge1xuICAgICAgICBmb3IgKGxldCBpbnRlcmZhY2VOYW1lIG9mIHRoaXMuaW50ZXJmYWNlcygpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIEludGVyZmFjZXNbaW50ZXJmYWNlTmFtZV0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRoaXNbTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZF1baW50ZXJmYWNlTmFtZV0gPSB7fTtcbiAgICAgICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKCkgPT4gSW50ZXJmYWNlc1tpbnRlcmZhY2VOYW1lXSh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2NhdGUobGVmdCwgdG9wKSB7XG4gICAgICAgIHRoaXMubGVmdCA9IGxlZnQ7XG4gICAgICAgIHRoaXMudG9wID0gdG9wO1xuICAgIH1cblxuICAgIGludGVyZmFjZXMoKSB7XG4gICAgICAgIGxldCBpbnRlcmZhY2VUZXh0ID0gJCh0aGlzKS5hdHRyKE5pZGdldC5pbnRlcmZhY2VBdHRyaWJ1dGUpO1xuICAgICAgICBpZiAodHlwZW9mIGludGVyZmFjZVRleHQgIT09IFwic3RyaW5nXCIpIHJldHVybiBbXTtcbiAgICAgICAgcmV0dXJuIGludGVyZmFjZVRleHQuc3BsaXQoL1sgLFxcdF0rLyk7XG4gICAgfVxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkYXRhLWhpZGRlblwiLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgaGlkZSgpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkYXRhLWhpZGRlblwiLCB0cnVlKTtcbiAgICB9XG5cbiAgICBzZXQgaGlkZGVuKHZhbHVlKXtcbiAgICAgICAgaWYgKHZhbHVlKSB0aGlzLmhpZGUoKTtcbiAgICAgICAgZWxzZSB0aGlzLnNob3coKTtcbiAgICB9XG5cbiAgICBnZXQgaGlkZGVuKCl7XG4gICAgICAgIGxldCBhdHRyID0gdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWhpZGRlblwiKTtcbiAgICAgICAgaWYgKGF0dHIgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gYXR0ciA9PT0gXCJ0cnVlXCI7XG4gICAgfVxuXG4gICAgc2V0IGRpc3BsYXkodmFsdWUpe1xuICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSB2YWx1ZTtcbiAgICB9XG4gICAgXG4gICAgZ2V0IGRpc3BsYXkoKXtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMpW1wiZGlzcGxheVwiXTtcbiAgICB9XG5cbiAgICBzZXQgZGlzYWJsZWQodmFsdWUpe1xuICAgICAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiZGF0YS1kaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1kaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IGRpc2FibGVkKCl7XG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRyaWJ1dGUoXCJkYXRhLWRpc2FibGVkXCIpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtZGlzYWJsZWRcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhpcyBlbGVtZW50IHdhcyB1bmRlciB0aGUgbW91c2UgZm9yIHRoZSBldmVudC5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IGV2ZW50XG4gICAgICogQHBhcmFtIHt0eXBlfSBlbGVtZW50XG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1VuZGVyTW91c2UoZXZlbnQpIHtcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYO1xuICAgICAgICBsZXQgeSA9IGV2ZW50LmNsaWVudFk7XG4gICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcblxuICAgICAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnQgPT09IHRoaXMpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2NhbGUgdGhpcyBhbmQgYWxsIGhleC1lbGVtZW50IGNoaWxkcmVuLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gYW1vdW50XG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHNjYWxlKHcsIGgsIHByb3BhZ2F0ZSA9IHRydWUpIHtcbiAgICAgICAgaWYgKCFoKSBoID0gdztcbiAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMud2lkdGggKiB3O1xuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuaGVpZ2h0ICogaDtcblxuICAgICAgICBpZiAocHJvcGFnYXRlKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5zY2FsZSkgZWxlbWVudC5zY2FsZSh3LCBoLCBwcm9wYWdhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2NhbGUgdGhpcyBhbmQgYWxsIGhleC1lbGVtZW50IGNoaWxkcmVuLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gYW1vdW50XG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHNjYWxlVG8odywgaCwgcHJvcGFnYXRlID0gdHJ1ZSkge1xuICAgICAgICBsZXQgZHcgPSB3IC8gdGhpcy53aWR0aDtcbiAgICAgICAgbGV0IGRoID0gZHc7XG4gICAgICAgIGlmIChoKSBkaCA9IGggLyB0aGlzLmhlaWdodDtcbiAgICAgICAgZHcgPSBNYXRoLnRydW5jKGR3ICogMTAwMCwgMykgLyAxMDAwO1xuICAgICAgICBkaCA9IE1hdGgudHJ1bmMoZGggKiAxMDAwLCAzKSAvIDEwMDA7XG4gICAgICAgIHRoaXMuc2NhbGUoZHcsIGRoLCBwcm9wYWdhdGUpO1xuICAgIH0gICAgXG5cbiAgICBzZXQgd2lkdGgodykge1xuICAgICAgICB0aGlzLnN0eWxlLndpZHRoID0gdyArIFwicHhcIjtcbiAgICB9XG5cbiAgICBzZXQgaGVpZ2h0KGgpIHtcbiAgICAgICAgdGhpcy5zdHlsZS5oZWlnaHQgPSBoICsgXCJweFwiO1xuICAgIH1cblxuICAgIGdldCB3aWR0aCgpIHtcbiAgICAgICAgbGV0IHcgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS53aWR0aDtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodyk7XG4gICAgfVxuXG4gICAgZ2V0IGhlaWdodCgpIHtcbiAgICAgICAgbGV0IGggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5oZWlnaHQ7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGgpO1xuICAgIH0gICAgICBcblxuICAgIGdldCBsZWZ0KCkge1xuICAgICAgICBsZXQgdyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMpLmxlZnQ7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHcpO1xuICAgIH1cblxuICAgIGdldCB0b3AoKSB7XG4gICAgICAgIGxldCBoID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykudG9wO1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChoKTtcbiAgICB9ICAgICAgXG5cbiAgICBzZXQgbGVmdCh2YWx1ZSkge1xuICAgICAgICB0aGlzLnN0eWxlLmxlZnQgPSB2YWx1ZSArIFwicHhcIjtcbiAgICB9XG5cbiAgICBzZXQgdG9wKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc3R5bGUudG9wID0gdmFsdWUgKyBcInB4XCI7XG4gICAgfVxuICAgIFxuICAgIGNsZWFyUG9zKCl7XG4gICAgICAgIHRoaXMuc3R5bGUudG9wID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdHlsZS5sZWZ0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBjbGVhckRpbXMoKXtcbiAgICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3R5bGUuaGVpZ2h0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBxdWVyeVNlbGVjdG9yKHNlbGVjdG9ycykge1xuICAgICAgICBpZiAodGhpcy5zaGFkb3dSb290KXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKSB7XG4gICAgICAgIGlmICh0aGlzLnNoYWRvd1Jvb3Qpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGV0YWNoKCl7XG4gICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIHF1ZXJ5KHNlbGVjdG9yLCBjYiA9IG51bGwpe1xuICAgICAgICBsZXQgcXVlcnlSZXN1bHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTsgICAgICAgIFxuICAgICAgICBpZiAoY2IgIT09IG51bGwpe1xuICAgICAgICAgICAgZm9yIChsZXQgZSBvZiBxdWVyeVJlc3VsdCl7XG4gICAgICAgICAgICAgICAgY2IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHF1ZXJ5UmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluZGV4IHdpdGhpbiB0aGUgcGFyZW50IGVsZW1lbnQuXG4gICAgICovXG4gICAgaW5kZXgoKXtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5wYXJlbnRFbGVtZW50LmNoaWxkcmVuKS5pbmRleE9mKHRoaXMpO1xuICAgIH1cbn1cblxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWVsZW1lbnQnLCBOaWRnZXRFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0RWxlbWVudDsiLCIndXNlIHN0cmljdCc7XG4vKipcbiAqIE1hbmlwdWxhdGVzIHRoZSBlbGVtZW50cyBzdHlsZSB3aXRoIGpzIHJvdXRpbmVzIGFjY29yZGluZyB0byBjc3MgZmxhZ3MuXG4gKiBOaWRnZXQgc3R5bGUgaXMgYXBwbGllZCB0byBhbGwgbmlkZ2V0LWVsZW1lbnRzIHVubGVzcyB0aGV5IGhhdmUgdGhlIG5pZGdldC1zdHlsZVxuICogYXR0cmlidXRlIHNldCB0byAnZmFsc2UnLlxuICovXG5cbmNsYXNzIE5pZGdldFN0eWxlIHtcblxuICAgIGNvbnN0cnVjdG9yKG5pZGdldCkge1xuICAgICAgICB0aGlzLm5pZGdldCA9IG5pZGdldDtcbiAgICAgICAgdGhpcy5hcHBseSgpO1xuICAgIH1cbiAgICBcbiAgICBhcHBseSgpIHtcbiAgICAgICAgdGhpcy5uaWRnZXRXaWR0aFJhdGlvKCk7XG4gICAgICAgIHRoaXMubmlkZ2V0SGVpZ2h0UmF0aW8oKTtcbiAgICAgICAgdGhpcy5uaWRnZXRGaXRUZXh0KCk7XG4gICAgICAgIHRoaXMubmlkZ2V0Rml0VGV4dFdpZHRoKCk7XG4gICAgICAgIHRoaXMubmlkZ2V0VmVydEFsaWduVGV4dCgpO1xuICAgIH1cbiAgICBcbiAgICBuaWRnZXRXaWR0aFJhdGlvKCkge1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtd2lkdGgtcmF0aW9cIik7XG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjsgICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4geyAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5uaWRnZXQud2lkdGggPSB0aGlzLm5pZGdldC5oZWlnaHQgKiByYXRpbztcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7ICAgICAgXG4gICAgfVxuICAgIFxuICAgIG5pZGdldEhlaWdodFJhdGlvKCkge1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtaGVpZ2h0LXJhdGlvXCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47ICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHsgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LmhlaWdodCA9IHRoaXMubmlkZ2V0LndpZHRoICogcmF0aW87XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbGwgdGhlIHRleHQgaGVpZ2h0IHRvIG1hdGNoIHRoZSBlbGVtZW50IGhlaWdodC5cbiAgICAgKiBDaGFuZ2UgdGhlIHJhdGlvIHZhbHVlIChvciB0aGUgZm9udFNpemUpIGFkanVzdC5cbiAgICAgKi9cbiAgICBuaWRnZXRGaXRUZXh0KCkge1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtZml0LXRleHRcIik7ICAgICAgICBcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xuXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgLS1uaWRnZXQtZml0LXRleHQgJHtyYXRpb31gKVxuICAgICAgICAgICAgbGV0IGggPSB0aGlzLm5pZGdldC5vZmZzZXRIZWlnaHQgKiByYXRpbztcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gaCArIFwicHhcIjtcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7ICAgICAgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIFdpbGwgY2hhbmdlIHRoZSBmb250IHNpemUgc28gdGhhdCB0aGUgdGV4dCBmaXQncyBpbiB0aGUgcGFyZW50IGVsZW1lbnQuXG4gICAgICogIERvbid0IHNldCB0aGUgd2lkdGggb2YgdGhlIGVsZW1lbnQuXG4gICAgICovXG4gICAgbmlkZ2V0Rml0VGV4dFdpZHRoKCkge1xuICAgICAgICBsZXQgcmVtb3ZlID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0LXdpZHRoXCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmVtb3ZlKSkgcmV0dXJuO1xuXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50XG5cbiAgICAgICAgICAgIGxldCB0ZXh0VyA9IHRoaXMubmlkZ2V0LnNjcm9sbFdpZHRoO1xuICAgICAgICAgICAgbGV0IGNvbnRXID0gdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgIGNvbnRXID0gY29udFcgLSByZW1vdmU7XG4gICAgICAgICAgICBsZXQgZHcgPSBjb250Vy90ZXh0VztcbiAgICAgICAgICAgIGxldCBjb21wdXRlZEZvbnRTaXplID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQtc2l6ZScpXG4gICAgICAgICAgICBjb21wdXRlZEZvbnRTaXplID0gcGFyc2VJbnQoY29tcHV0ZWRGb250U2l6ZSk7XG4gICAgICAgICAgICBjb21wdXRlZEZvbnRTaXplID0gTWF0aC5yb3VuZChjb21wdXRlZEZvbnRTaXplKTtcbiAgICAgICAgICAgIGxldCBuZXdGb250U2l6ZSA9IE1hdGgucm91bmQoY29tcHV0ZWRGb250U2l6ZSAqIGR3KTtcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5uaWRnZXQub2Zmc2V0SGVpZ2h0XG5cbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhjb21wdXRlZEZvbnRTaXplIC0gbmV3Rm9udFNpemUpIDw9IDIpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKG5ld0ZvbnRTaXplID4gaCkgbmV3Rm9udFNpemUgPSBoO1xuXG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IG5ld0ZvbnRTaXplICsgXCJweFwiO1xuICAgICAgICB9KS5vYnNlcnZlKHRoaXMubmlkZ2V0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGxpbmUgaGVpZ2h0IHRvIHRoZSBvZmZzZXQgaGVpZ2h0IG11bHRpcGxpZWQgYnkgcmF0aW8uXG4gICAgICovXG4gICAgbmlkZ2V0VmVydEFsaWduVGV4dCgpe1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtdmVydC1hbGlnbi10ZXh0XCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XG5cbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5uaWRnZXQub2Zmc2V0SGVpZ2h0ICogcmF0aW87XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5saW5lSGVpZ2h0ID0gaCArIFwicHhcIjtcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldFN0eWxlOyIsIid1c2Ugc3RyaWN0JztcbmNsYXNzIFRyYW5zZm9ybXtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSl7XG4gICAgICAgIGxldCBpbmRleE9mID0gdmFsdWUuaW5kZXhPZihcIihcIik7XG4gICAgICAgIHRoaXMubmFtZSA9IHZhbHVlLnN1YnN0cmluZygwLCBpbmRleE9mKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlLnN1YnN0cmluZyh0aGlzLm5hbWUubGVuZ3RoICsgMSwgdmFsdWUubGVuZ3RoIC0gMSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiLCBcIiArIHRoaXMudmFsdWUpO1xuICAgIH1cbiAgICBcbiAgICB0b1N0cmluZygpe1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lICsgXCIoXCIgKyB0aGlzLnZhbHVlICsgXCIpXCI7XG4gICAgfSAgICBcbn1cblxuY2xhc3MgVHJhbnNmb3JtZXIge1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cbiAgICBcbiAgICBhcHBlbmQoKXtcbiAgICAgICAgbGV0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmVsZW1lbnQpW1widHJhbnNmb3JtXCJdO1xuICAgICAgICBpZiAoY29tcHV0ZWRTdHlsZSAhPT0gXCJub25lXCIpIHRoaXMucHVzaChjb21wdXRlZFN0eWxlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIGNsZWFyKCl7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBcIlwiO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgdW5zaGlmdCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSB2YWx1ZSArIFwiIFwiICsgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybTtcbiAgICB9XG4gICAgXG4gICAgcHVzaCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtICsgXCIgXCIgKyB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSAgICBcbiAgICBcbiAgICBzaGlmdCgpe1xuICAgICAgICBsZXQgYXJyYXkgPSB0aGlzLnNwbGl0KCk7XG4gICAgICAgIGlmIChhcnJheS5sZW5ndGggPT09IDApIHJldHVybiBcIlwiO1xuICAgICAgICBhcnJheS5zaGlmdCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBwb3AoKXtcbiAgICAgICAgbGV0IGFycmF5ID0gdGhpcy5zcGxpdCgpO1xuICAgICAgICBpZiAoYXJyYXkubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcbiAgICAgICAgYXJyYXkucG9wKCk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBhcnJheS5qb2luKFwiIFwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7ICAgICAgXG4gICAgfVxuICAgIFxuICAgIHJlcGxhY2UodmFsdWUpe1xuICAgICAgICBsZXQgbmV3VHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybSh2YWx1ZSk7XG4gICAgICAgIGxldCBhcnJheSA9IHRoaXMuc3BsaXQoKTtcbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGVudHJ5ID0gYXJyYXlbaV07XG4gICAgICAgICAgICBsZXQgdHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybShlbnRyeSk7XG4gICAgICAgICAgICBpZiAodHJhbnNmb3JtLm5hbWUgPT09IG5ld1RyYW5zZm9ybS5uYW1lKXtcbiAgICAgICAgICAgICAgICBhcnJheVtpXSA9IG5ld1RyYW5zZm9ybS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBhcnJheS5qb2luKFwiIFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgc3BsaXQoKXtcbiAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybTtcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcbiAgICAgICAgbGV0IHJ2YWx1ZSA9IFtdO1xuICAgICAgICBsZXQgbGFzdCA9ICcnO1xuICAgICAgICBsZXQgc2tpcCA9IGZhbHNlO1xuICAgICAgICBsZXQgbmVzdGVkUCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGlmICghc2tpcCAmJiB2YWx1ZVtpXSA9PT0gJyAnICYmIGxhc3QgPT09ICcgJyl7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFza2lwICYmIHZhbHVlW2ldID09PSAnICcpIHtcbiAgICAgICAgICAgICAgICBydmFsdWUucHVzaCh2YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIGkpKTtcbiAgICAgICAgICAgICAgICBzdGFydCA9IGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlW2ldID09PSAnKCcpIHtcbiAgICAgICAgICAgICAgICBuZXN0ZWRQKys7XG4gICAgICAgICAgICAgICAgc2tpcCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlW2ldID09PSAnKScpIHtcbiAgICAgICAgICAgICAgICBuZXN0ZWRQLS07XG4gICAgICAgICAgICAgICAgaWYgKG5lc3RlZFAgPT09IDApIHNraXAgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhc3QgPSB2YWx1ZVtpXTtcbiAgICAgICAgfVxuICAgICAgICBydmFsdWUucHVzaCh2YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIHZhbHVlLmxlbmd0aCkpO1xuICAgICAgICByZXR1cm4gcnZhbHVlO1xuICAgIH1cbiAgICBcbiAgICB0b1N0cmluZygpe1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhbnNmb3JtZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBOaWRnZXQgdGhhdCBjaGFuZ2VzIHRoZSBpbWFnZSBmb3IgaG92ZXIsIGRpc2FibGVkLCBwcmVzcywgYW5kIGlkbGUuXG4gKiBGaXJlcyBhIGNsaWNrIGV2ZW50IHdoZW4gY2xpY2tlZC5cbiAqXG4gKiBXaWxsIHNldCB0aGUgY3VycmVudCBzdGF0ZSBhcyBkYXRhLXN0YXRlIHNvIHRoYXQgY3NzIGNhbiBhY2Nlc3MgaXQuXG4gKi9cbmNsYXNzIE5pZGdldEJ1dHRvbiBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgICAgIHRoaXMuYWxwaGFUb2xlcmFuY2UgPSAwOyAvLyBhbHBoYSBuZWVkcyB0byBiZSA+IHRvbGVyYW5jZSB0byB0cmlnZ2VyIGV2ZW50cy5cblxuICAgICAgICB0aGlzLnN0cmluZ0hvdmVyID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdIT1ZFUiddXCI7XG4gICAgICAgIHRoaXMuc3RyaW5nRGlzYWJsZWQgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J0RJU0FCTEVEJ11cIjtcbiAgICAgICAgdGhpcy5zdHJpbmdQcmVzcyA9IFwibmlkZ2V0LWJ1dHRvbi1zdGF0ZVtzdGF0ZT0nUFJFU1MnXVwiO1xuICAgICAgICB0aGlzLnN0cmluZ0lkbGUgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J0lETEUnXVwiO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcImlkbGVcIjtcbiAgICB9XG5cbiAgICBpc0luU2V0KCkge1xuICAgICAgICBsZXQgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICAgICAgICB3aGlsZSAocGFyZW50ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChwYXJlbnQudGFnTmFtZSA9PT0gXCJOSURHRVQtQlVUVE9OLVNFVFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbmlkZ2V0UmVhZHkoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nRGlzYWJsZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSWRsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlzSW5TZXQoKSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgdGhpcy5tb3VzZUVudGVyKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlTGVhdmUpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZVByZXNzKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlUmVsZWFzZSk7XG5cbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5kaXNhYmxlZCkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBpc1VuZGVyKGV2ZW50KSB7XG4gICAgICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LmVsZW1lbnRzRnJvbVBvaW50KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuICAgICAgICBpZiAoZWxlbWVudHMuaW5kZXhPZih0aGlzLmFjdGl2ZU5pZGdldCkgPT0gLTEpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuYWN0aXZlTmlkZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFggLSByZWN0Lng7XG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WSAtIHJlY3QueTtcblxuICAgICAgICByZXR1cm4gdGhpcy50ZXN0QWxwaGEoeCwgeSk7XG4gICAgfVxuXG4gICAgZ2V0IGRpc2FibGVkKCkge1xuICAgICAgICByZXR1cm4gc3VwZXIuZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgc2V0IGRpc2FibGVkKHZhbHVlKSB7XG4gICAgICAgIHN1cGVyLmRpc2FibGVkID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nRGlzYWJsZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiaW5cIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0hvdmVyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwicHJlc3NcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ1ByZXNzO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSWRsZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3VzZVJlbGVhc2UoZSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XG4gICAgfVxuXG4gICAgbW91c2VQcmVzcyhlKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBcInByZXNzXCI7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdQcmVzcztcbiAgICB9XG5cbiAgICBoaWRlQWxsSW1hZ2VzKCkge1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdIb3ZlcikuaGlkZSgpO1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdEaXNhYmxlZCkuaGlkZSgpO1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdQcmVzcykuaGlkZSgpO1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdJZGxlKS5oaWRlKCk7XG4gICAgfVxuXG4gICAgc2V0IGFjdGl2ZU5pZGdldChzZWxlY3Rvcikge1xuICAgICAgICB0aGlzLmhpZGVBbGxJbWFnZXMoKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlTmlkZ2V0ID0gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlTmlkZ2V0LnNob3coKTtcbiAgICB9XG5cbiAgICBnZXQgYWN0aXZlTmlkZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlTmlkZ2V0O1xuICAgIH1cblxuICAgIHNldCBzdGF0ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcImRhdGEtc3RhdGVcIiwgdmFsdWUpO1xuICAgIH1cblxuICAgIGdldCBzdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiKTtcbiAgICB9XG5cbiAgICB0ZXN0QWxwaGEoeCwgeSkge1xuICAgICAgICBsZXQgcGl4ZWwgPSB0aGlzLmFjdGl2ZU5pZGdldC5nZXRQaXhlbCh4LCB5KTtcbiAgICAgICAgcmV0dXJuIHBpeGVsWzNdID4gdGhpcy5hbHBoYVRvbGVyYW5jZTtcbiAgICB9XG5cbiAgICBtb3VzZUxlYXZlKCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJvdXRcIjtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgfVxuXG4gICAgbW91c2VBY3RpdmUoKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBcImhvdmVyXCI7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcbiAgICB9XG5cbiAgICBtb3VzZU1vdmUoZSkge1xuICAgICAgICBpZiAoIXRoaXMudGVzdEFscGhhKGUuY2xpZW50WCwgZS5jbGllbnRZKSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcbiAgICAgICAgfVxuICAgIH1cbn1cbjtcblxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWJ1dHRvbicsIE5pZGdldEJ1dHRvbik7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEJ1dHRvbjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcclxuXHJcbmNsYXNzIE5pZGdldEJ1dHRvblNldCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcclxuICAgICAgICB0aGlzLmFscGhhVG9sZXJhbmNlID0gMDsgLy8gYWxwaGEgbmVlZHMgdG8gYmUgPiB0b2xlcmFuY2UgdG8gdHJpZ2dlciBldmVudHMuXHJcblxyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlUHJlc3MpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVJlbGVhc2UpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZSk7XHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlTGVhdmUpO1xyXG5cclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBuaWRnZXRSZWFkeSgpe1xyXG4gICAgICAgIHRoaXMuYnV0dG9ucyA9IHRoaXMucXVlcnlTZWxlY3RvckFsbChcIm5pZGdldC1idXR0b25cIik7XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VQcmVzcyhlKXtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlUHJlc3MoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcInByZXNzXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VSZWxlYXNlKGUpe1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5idXR0b25zKSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzVW5kZXIoZSkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXRlID09IFwicHJlc3NcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcImJ1dHRvbi1jbGlja2VkXCIsIHtkZXRhaWw6IGVsZW1lbnR9KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlUmVsZWFzZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZU1vdmUoZSl7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpe1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlQWN0aXZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZUxlYXZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VMZWF2ZShlKXtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBlbGVtZW50Lm1vdXNlTGVhdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldCBzdGF0ZSh2YWx1ZSl7XHJcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIsIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc3RhdGUoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtYnV0dG9uLXNldCcsIE5pZGdldEJ1dHRvblNldCk7XHJcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0QnV0dG9uU2V0OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBOaWRnZXQgdGhhdCBjaGFuZ2VzIHRoZSBpbWFnZSBmb3IgaG92ZXIsIGRpc2FibGVkLCBwcmVzcywgYW5kIGlkbGUuXG4gKiBGaXJlcyBhIGNsaWNrIGV2ZW50IHdoZW4gY2xpY2tlZC5cbiAqIFxuICogVGhpcyBpcyB0aGUgaHRtbCBlbGVtZW50IFwibmlkZ2V0LWJ1dHRvblwiLlxuICogSWYgdGhlIG5pZGdldC1idXR0b24gaGFzIHRoZSBhdHRyaWJ1dGUgYGltZy1wcmVmaXggPSBcInByZWZpeFwiYCB0aGVuIHRoZSBcbiAqIGZvbGxvd2luZyBpbWFnZXMuICBgaW1nLXN1ZmZpeGAgPSBcInN1ZmZpeFwiIHdpbGwgb3ZlcnJpZGUgdGhlIFwiLnBuZ1wiLlxuICogd2lsbCBiZSB1c2VkOlxuICogLSBwcmVmaXgtaG92ZXIucG5nXG4gKiAtIHByZWZpeC1kaXNhYmxlZC5wbmdcbiAqIC0gcHJlZml4LXByZXNzLnBuZ1xuICogLSBwcmVmaXgtaWRsZS5wbmdcbiAqL1xuY2xhc3MgTmlkZ2V0QnV0dG9uU3RhdGUgZXh0ZW5kcyBOaWRnZXQge1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgbmlkZ2V0UmVhZHkoKXtcbiAgICAgICAgdGhpcy5pbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICB0aGlzLmltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdGhpcy5nZXRBdHRyaWJ1dGUoXCJpbWFnZS1zcmNcIikpO1xuICAgICAgICB0aGlzLmFwcGVuZCh0aGlzLmltZyk7XG4gICAgfVxuXG4gICAgc2hvdygpe1xuICAgICAgICBzdXBlci5zaG93KCk7XG4gICAgICAgIHRoaXMubG9hZENhbnZhcygpO1xuICAgIH1cblxuICAgIGxvYWRDYW52YXMoKXtcbiAgICAgICAgaWYgKCF0aGlzLmltZyB8fCB0aGlzLmNhbnZhcykgcmV0dXJuO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuaW1nLm5hdHVyYWxXaWR0aDtcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5pbWcubmF0dXJhbEhlaWdodDtcbiAgICAgICAgdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXM7XG4gICAgfVxuXG4gICAgZ2V0UGl4ZWwoeCwgeSl7XG4gICAgICAgIHRoaXMubG9hZENhbnZhcygpO1xuICAgICAgICBsZXQgZHggPSB0aGlzLmNhbnZhcy53aWR0aCAvIHRoaXMub2Zmc2V0V2lkdGg7XG4gICAgICAgIGxldCBkeSA9IHRoaXMuY2FudmFzLmhlaWdodCAvIHRoaXMub2Zmc2V0SGVpZ2h0O1xuICAgICAgICBsZXQgcGl4ZWwgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLmdldEltYWdlRGF0YShkeCAqIHgsIGR5ICogeSwgMSwgMSkuZGF0YTtcbiAgICAgICAgcmV0dXJuIHBpeGVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBzdGF0ZSB0byBIT1ZFUiwgRElTQUJMRUQsIFBSRVNTLCBJRExFLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gc3RhdGVcbiAgICAgKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgc2V0IHN0YXRlKHN0YXRlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwic3RhdGVcIiwgc3RhdGUudG9VcHBlckNhc2UoKSk7XG4gICAgfVxuXG4gICAgZ2V0IHN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyaWJ1dGUoXCJzdGF0ZVwiKTtcbiAgICB9XG5cbiAgICBzZXQgc291cmNlKGltZykge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInNyY1wiLCBpbWcpO1xuICAgIH1cblxuICAgIGdldCBzb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHJpYnV0ZShcInNyY1wiKTtcbiAgICB9XG59XG47XG5cbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1idXR0b24tc3RhdGUnLCBOaWRnZXRCdXR0b25TdGF0ZSk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEJ1dHRvblN0YXRlO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyoqXG4gKiBBIGNvbXBvbmVudCB0aGF0IGhhcyBldmVudHMgZm9yIGFkZGluZyBuaWRnZXRzLCByZW1vdmluZyBuaWRnZXRzLCBhbmQgXG4gKiByZXNpemluZyB0aGUgY29udGFpbmVyLiAgV2hlbiB0aGUgY29udGFpbmVyIHNpemUgaXMgY2hhbmdlZCwgdGhlIG51bWJlclxuICogb2YgY29tcG9uZW50cyBjaGFuZ2UsIG9yIHRoZSBsYXlvdXQgYXR0cmlidXRlIGNoYW5nZXMsIHRoZSBkb0xheW91dCBmdW5jdGlvblxuICogaXMgY2FsbGVkLlxuICogXG4gKiBUaGUgY29tcG9uZW50cyBhcmUgYXJyYWdlZCBhY2NvcmRpbmcgdG8gdGhlIHNlbGVjdGVkIGxheW91dCBhdHRyaWJ1dGUuICBJZiBcbiAqIG5vIGxheW91dCBhdHRyaWJ1dGUgaXMgY2hvc2VuLCBkb0xheW91dCBpcyBzdGlsbCBjYWxsZWQgYXMgaXQgaXMgYXNzdW1lZCBcbiAqIGEgY3VzdG9tIGZ1bmN0aW9uIGhhcyBiZWVuIHByb3ZpZGVkLlxuICovXG5cbmNsYXNzIE5pZGdldENvbnRhaW5lciBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgICAgICBsZXQgcmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIodGhpcy5kb0xheW91dCk7XG4gICAgICAgIHJlc2l6ZU9ic2VydmVyLm9ic2VydmUodGhpcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiBbTmlkZ2V0Q29udGFpbmVyLmxheW91dEF0dHJpYnV0ZV07XG4gICAgfVxuXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKG5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgICBpZiAob2xkVmFsdWUgPT09IG5ld1ZhbHVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuZG9MYXlvdXQoKTtcbiAgICB9XG5cbiAgICBzZXQgbGF5b3V0KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKE5pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgbGF5b3V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0Q29udGFpbmVyLmxheW91dEF0dHJpYnV0ZSk7XG4gICAgfSAgICAgIFxuXG4gICAgZG9MYXlvdXQoKSB7XG4gICAgICAgIGlmICghdGhpcy5sYXlvdXQpIHJldHVybjtcbiAgICAgICAgaWYgKCFMYXlvdXRzW3RoaXMubGF5b3V0XSkgdGhyb3cgYGludmFsaWQgbGF5b3V0OiAke3RoaXMubGF5b3V0fWA7XG4gICAgICAgIExheW91dHNbdGhpcy5sYXlvdXRdO1xuICAgIH1cbn1cblxuY2xhc3MgTGF5b3V0cyB7XG4gICAgLyoqXG4gICAgICogRml0IGFsbCBuaWRnZXRzIGV2ZW5seSBpbiBhIGhvcml6b250YWwgcm93LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gbmlkZ2V0XG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHN0YXRpYyByb3cobmlkZ2V0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2l6ZSk7XG4gICAgfVxufVxuXG5cbk5pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGUgPSBcImxheW91dFwiO1xud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWNvbnRhaW5lcicsIE5pZGdldENvbnRhaW5lcik7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldENvbnRhaW5lcjsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRcIik7XG5jb25zdCBUcmFuc2Zvcm1lciA9IHJlcXVpcmUoXCIuLi9UcmFuc2Zvcm1lclwiKTtcblxuLyoqXG4gKiBEb24ndCBmb3JnZXQgdG8gc2V0ICdpcycgd2hlbiBwdXR0aW5nIGVsZW1lbnQgZGlyZWN0bHkgaW4gaHRtbCBhcyBvcHBvc2VkIHRvXG4gKiBwcm9ncmFtaWNhbGx5LlxuICogPGltZyBpcz1cInJlZ2lzdGVyZWQtbmFtZVwiIHNyYz1cImltYWdlLnBuZ1wiPjwvaW1nPlxuICogXG4gKiBpbmNsdWRlIGEgY3VzdG9tIGVsZW1lbnQgZGVmaW5pdGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBjbGFzcy48YnI+XG4gKiB3aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdyZWdpc3RlcmVkLW5hbWUnLCBDbGFzcywge2V4dGVuZHM6IFwiaW1nXCJ9KTtcbiAqL1xuY2xhc3MgTmlkZ2V0SFRNTEltYWdlIGV4dGVuZHMgSFRNTEltYWdlRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubGFzdERpc3BsYXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtZXIodGhpcyk7XG4gICAgfVxuXG4gICAgc2NhbGUoZHcsIGRoKSB7XG4gICAgICAgIGlmICghZGgpIGRoID0gZHc7XG4gICAgICAgIGxldCB3ID0gdGhpcy53aWR0aCAqIGR3O1xuICAgICAgICBsZXQgaCA9IHRoaXMuaGVpZ2h0ICogZGg7XG4gICAgICAgIHRoaXMud2lkdGggPSB3O1xuICAgICAgICB0aGlzLmhlaWdodCA9IGg7XG4gICAgfSAgICAgICAgXG5cbiAgICBzZXQgc3JjKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwic3JjXCIsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgc3JjKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJzcmNcIik7XG4gICAgfVxuXG4gICAgbG9jYXRlKGxlZnQsIHRvcCkge1xuICAgICAgICB0aGlzLmxlZnQgPSBsZWZ0O1xuICAgICAgICB0aGlzLnRvcCA9IHRvcDtcbiAgICB9XG5cbiAgICBnZXQgbGVmdCgpIHtcbiAgICAgICAgbGV0IHcgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5sZWZ0O1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh3KTtcbiAgICB9XG5cbiAgICBnZXQgdG9wKCkge1xuICAgICAgICBsZXQgaCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMpLnRvcDtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaCk7XG4gICAgfVxuXG4gICAgc2V0IGxlZnQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5zdHlsZS5sZWZ0ID0gdmFsdWUgKyBcInB4XCI7XG4gICAgfVxuXG4gICAgc2V0IHRvcCh2YWx1ZSkge1xuICAgICAgICB0aGlzLnN0eWxlLnRvcCA9IHZhbHVlICsgXCJweFwiO1xuICAgIH0gICAgXG5cbiAgICBzZXQgd2lkdGgodykge1xuICAgICAgICB0aGlzLnN0eWxlLndpZHRoID0gdyArIFwicHhcIjtcbiAgICB9XG5cbiAgICBzZXQgaGVpZ2h0KHcpIHtcbiAgICAgICAgdGhpcy5zdHlsZS5oZWlnaHQgPSB3ICsgXCJweFwiO1xuICAgIH1cblxuICAgIGdldCB3aWR0aCgpIHtcbiAgICAgICAgbGV0IHcgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS53aWR0aDtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodyk7XG4gICAgfVxuXG4gICAgZ2V0IGhlaWdodCgpIHtcbiAgICAgICAgbGV0IGggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5oZWlnaHQ7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGgpO1xuICAgIH0gICAgICAgIFxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgaWYgKHRoaXMubGFzdERpc3BsYXkpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IHRoaXMubGFzdERpc3BsYXk7XG4gICAgICAgICAgICB0aGlzLmxhc3REaXNwbGF5ID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhpZGUoKSB7XG4gICAgICAgIHRoaXMubGFzdERpc3BsYXkgPSB0aGlzLnN0eWxlLmRpc3BsYXk7XG4gICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIH1cblxuICAgIHNldCBkaXNwbGF5KHZhbHVlKXtcbiAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gdmFsdWU7XG4gICAgfVxuICAgIFxuICAgIGdldCBkaXNwbGF5KCl7XG4gICAgICAgIHJldHVybiB3aW5kb3cuY2FsY3VsYXRlU3R5bGUodGhpcylbXCJkaXNwbGF5XCJdO1xuICAgIH1cblxuICAgIGRldGFjaCgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHRoaXMpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHNldCBkaXNhYmxlZCh2YWx1ZSl7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBkaXNhYmxlZCgpe1xuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0cmlidXRlKFwiZGlzYWJsZWRcIikpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIik7XG4gICAgfSAgICBcbiAgICBcbiAgICBjbGVhclBvcygpe1xuICAgICAgICB0aGlzLnN0eWxlLnRvcCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3R5bGUubGVmdCA9IG51bGw7XG4gICAgfVxuXG4gICAgY2xlYXJEaW1zKCl7XG4gICAgICAgIHRoaXMuc3R5bGUud2lkdGggPSBudWxsO1xuICAgICAgICB0aGlzLnN0eWxlLmhlaWdodCA9IG51bGw7XG4gICAgfSAgICBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRIVE1MSW1hZ2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyoqXG4gKiBBIE5pZGdldCB0aGF0IGNvbnRhaW5zIGltYWdlcy5cbiAqL1xuY2xhc3MgTmlkZ2V0SW1hZ2UgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKHNyYyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgaWYgKHNyYykgdGhpcy5zcmMgPSBzcmM7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKXtcbiAgICAgICAgbGV0IHNyYyA9IHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldEltYWdlLnNyY0F0dHJpYnV0ZSk7ICAgICAgICBcbiAgICAgICAgaWYgKHNyYykgdGhpcy5pbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIHNyYyk7ICAgICAgIFxuICAgICAgICB0aGlzLmFwcGVuZENoaWxkKHRoaXMuaW1nKTtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBnZXQgc3JjKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmltZy5nZXRBdHRyaWJ1dGUoXCJzcmNcIik7XG4gICAgfVxuXG4gICAgc2V0IHNyYyh2YWx1ZSl7XG4gICAgICAgIHRoaXMuaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2l6ZSh3aWR0aCwgaGVpZ2h0KXtcbiAgICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IHdpZHRoXG4gICAgICAgIHRoaXMuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgICAgIHRoaXMuaW1nLnN0eWxlLndpZHRoID0gd2lkdGhcbiAgICAgICAgdGhpcy5pbWcuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgfVxuICAgIFxuICAgIHNjYWxlKGR3LCBkaCl7XG4gICAgICAgIGlmICghZGgpIGRoID0gZHc7XG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMub2Zmc2V0V2lkdGggKiBkdztcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMub2Zmc2V0SGVpZ2h0ICogZGg7XG4gICAgICAgIHRoaXMuc2l6ZShgJHt3aWR0aH1weGAsIGAke2hlaWdodH1weGApO1xuICAgIH1cbiAgICBcbiAgICBzaG93KCl7XG4gICAgICAgIGlmICh0aGlzLnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiKXtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnN0eWxlLmRpc3BsYXk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaGlkZSgpe1xuICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG59XG5cbk5pZGdldEltYWdlLnNyY0F0dHJpYnV0ZSA9IFwic3JjXCI7XG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtaW1hZ2UnLCBOaWRnZXRJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEltYWdlOyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIFdoZW4gdXNpbmcgLS1uaWRnZXQtZml0LXRleHQsIGRvIG5vdCBpbmNsdWRlIGhlaWdodCBhbmQgd2lkdGggYXR0cmlidXRlcy5cbiAqIEEgZm9udCBzaXplIGNhbiBiZSB1c2VkIGFzIGEgc3RhcnRpbmcgcG9pbnQuXG4gKi9cbmNsYXNzIEZpdFRleHQge1xuICAgIGNvbnN0cnVjdG9yKG5pZGdldCl7XG4gICAgICAgIHRoaXMubmlkZ2V0ID0gbmlkZ2V0O1xuICAgICAgICB0aGlzLmxvY2sgPSBcIm5vbmVcIjtcbiAgICAgICAgdGhpcy5wYXJzZUFyZ3VtZW50cygpO1xuICAgIH1cblxuICAgIGxpc3Rlbigpe1xuICAgICAgICB0aGlzLm9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpPT50aGlzLmRlbGF5UmVzaXplKHRoaXMuaFZhbHVlLCB0aGlzLndWYWx1ZSkpO1xuICAgICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUodGhpcy5uaWRnZXQucGFyZW50RWxlbWVudCk7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcbiAgICAgICAgdGhpcy5kZWxheSA9IDI1O1xuICAgICAgICB0aGlzLmRlbGF5UmVzaXplKHRoaXMuaFZhbHVlLCB0aGlzLndWYWx1ZSk7XG4gICAgICAgIHRoaXMuc3RvcCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGRlbGF5UmVzaXplKGhWYWx1ZSwgd1ZhbHVlKXtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAwO1xuICAgICAgICBpZiAodGhpcy50aW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+dGhpcy5vblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSksIHRoaXMuZGVsYXkpO1xuICAgIH1cblxuICAgIG5vdGlmeShoVmFsdWUsIHdWYWx1ZSl7XG4gICAgICAgIHRoaXMuc3RvcCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRlbGF5UmVzaXplKGhWYWx1ZSwgd1ZhbHVlKTtcbiAgICB9XG5cbiAgICBwYXJzZUFyZ3VtZW50cygpe1xuICAgICAgICBsZXQgYXJncyA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1maXQtdGV4dFwiKTtcblxuICAgICAgICBpZiAoIWFyZ3MgfHwgYXJncyA9PT0gZmFsc2UgfHwgYXJncyA9PT0gXCJmYWxzZVwiKXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaFZhbHVlID0gdGhpcy53VmFsdWUgPSB0cnVlO1xuXG4gICAgICAgIGlmICh0eXBlb2YoYXJncykgPT0gXCJzdHJpbmdcIil7XG4gICAgICAgICAgICBsZXQgb2JqID0gSlNPTi5wYXJzZShhcmdzKTtcbiAgICAgICAgICAgIGlmIChvYmpbXCJmaXRcIl0gIT09IHVuZGVmaW5lZCAmJiBvYmpbXCJmaXRcIl0gPT09IFwid2lkdGhcIikgdGhpcy5oVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChvYmpbXCJmaXRcIl0gIT09IHVuZGVmaW5lZCAmJiBvYmpbXCJmaXRcIl0gPT09IFwiaGVpZ2h0XCIpIHRoaXMud1ZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAob2JqW1wibG9ja1wiXSAhPT0gdW5kZWZpbmVkKSB0aGlzLmxvY2sgPSAob2JqW1wibG9ja1wiXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSl7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnRpbWVvdXQ7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RvcCkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5uaWRnZXQudGV4dENvbnRlbnQgPT09IFwiXCIpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0ID09PSAwKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldFdpZHRoID09PSAwKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLm5pZGdldC5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIikgcmV0dXJuO1xuXG4gICAgICAgIGlmICghaFZhbHVlICYmICF3VmFsdWUpIHJldHVybjtcblxuICAgICAgICBsZXQgaERpciA9IHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gdGhpcy5uaWRnZXQuc2Nyb2xsSGVpZ2h0O1xuICAgICAgICBsZXQgd0RpciA9IHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLSB0aGlzLm5pZGdldC5zY3JvbGxXaWR0aDtcblxuICAgICAgICBpZiAoIWhWYWx1ZSkgaERpciA9IDA7XG4gICAgICAgIGlmICghd1ZhbHVlKSB3RGlyID0gMDtcblxuICAgICAgICBsZXQgZGlyID0gTWF0aC5zaWduKGhEaXIgfCB3RGlyKTsgLy8gd2lsbCBwcmVmZXIgdG8gc2hyaW5rXG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gMCkgdGhpcy5kaXJlY3Rpb24gPSBkaXI7IC8vIGtlZXAgcHJldmlvdXMgZGlyZWN0aW9uXG5cbiAgICAgICAgbGV0IGZvbnRTaXplID0gcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldClbXCJmb250LXNpemVcIl0pXG4gICAgICAgIGxldCBuZXdTaXplID0gZm9udFNpemUgKyAodGhpcy5kaXJlY3Rpb24pO1xuXG4gICAgICAgIGlmIChuZXdTaXplICE9PSBmb250U2l6ZSAmJiB0aGlzLmRpcmVjdGlvbiA9PT0gZGlyKSB7XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IG5ld1NpemUgKyBcInB4XCI7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PnRoaXMub25SZXNpemUoaFZhbHVlLCB3VmFsdWUpLCB0aGlzLmRlbGF5KTtcbiAgICAgICAgfSBlbHNlIGlmIChkaXIgPCAwICYmIHRoaXMuZGlyZWN0aW9uID4gMCkgeyAvLyByZXZlcnNlIGRpcmVjdGlvbiBpZiBncm93aW5nIHRvbyBsYXJnZVxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAtMTtcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PnRoaXMub25SZXNpemUoaFZhbHVlLCB3VmFsdWUpLCB0aGlzLmRlbGF5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2sgPT09IFwidmhcIikge1xuICAgICAgICAgICAgICAgIGxldCBmb250UmF0aW8gPSBuZXdTaXplIC8gd2luZG93LmlubmVySGVpZ2h0ICogMTAwO1xuICAgICAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gZm9udFJhdGlvICsgXCJ2aFwiO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMubG9jayA9PT0gXCJ2d1wiKXtcbiAgICAgICAgICAgICAgICBsZXQgZm9udFJhdGlvID0gbmV3U2l6ZSAvIHdpbmRvdy5pbm5lcldpZHRoICogMTAwO1xuICAgICAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gZm9udFJhdGlvICsgXCJ2d1wiO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQSBuaWRnZXQgZWxlbWVudCBmb3IgZGlzcGxheWluZyB0ZXh0LlxuICogcHV0ICctLW5pZGdldC1maXQtdGV4dDogMS4wOycgaW50byBjc3MgZm9yIHRoaXMgZWxlbWVudCB0byBlbmFibGUgc2NhbGluZy5cbiAqIHNlZTogTmlkZ2V0U3R5bGUuanNcbiAqL1xuY2xhc3MgTmlkZ2V0VGV4dCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzW1wiZml0LXRleHQtd2lkdGgtdG9sZXJhbmNlXCJdID0gMC4wMjtcbiAgICB9XG5cbiAgICByZW1vdmUoKXtcbiAgICAgICAgaWYgKHRoaXMuZml0VGV4dCkge1xuICAgICAgICAgICAgdGhpcy5maXRUZXh0LnN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5maXRUZXh0Lm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlci5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBzZXQgdGV4dCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuaW5uZXJUZXh0ID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLmZpdFRleHQgJiYgdGhpcy5maXRUZXh0LnN0b3AgPT09IGZhbHNlKXtcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dC5kZWxheVJlc2l6ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHRleHQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5uZXJUZXh0O1xuICAgIH1cblxuICAgIHNjYWxlKGFtb3VudCkge1xuICAgICAgICBsZXQgc3R5bGVGb250U2l6ZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoXCJmb250LXNpemVcIik7XG4gICAgICAgIGxldCBmb250U2l6ZSA9IHBhcnNlRmxvYXQoc3R5bGVGb250U2l6ZSk7XG4gICAgICAgIHRoaXMuc3R5bGUuZm9udFNpemUgPSAoZm9udFNpemUgKiBhbW91bnQpICsgXCJweFwiO1xuICAgIH1cblxuICAgIGFwcGx5U3R5bGUoKSB7XG4gICAgICAgIHN1cGVyLmFwcGx5U3R5bGUoKTtcblxuICAgICAgICB0aGlzLmluaXRGaXRUZXh0KCk7XG4gICAgICAgIGxldCBmaXRQcm9wID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtZml0LXRleHRcIik7XG5cbiAgICAgICAgaWYgKGZpdFByb3AgIT09IHVuZGVmaW5lZCAmJiBmaXRQcm9wICE9PSBcIlwiKXtcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dC5saXN0ZW4oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbiBjYWxsIG11bHRpcGxlIHRpbWVzIHRvIGNoYW5nZSB0aGUgbG9jayB2YWx1ZS5cbiAgICAgKiBAcGFyYW0gKHN0cmluZykgbG9jayB2aCA9IGxvY2sgdG8gdmlldyBoZWlnaHQsIHZ3ID0gbG9jayB0byB2aWV3IHdpZHRoXG4gICAgICovXG4gICAgaW5pdEZpdFRleHQobG9jayl7XG4gICAgICAgIGlmIChsb2NrKSB0aGlzLmZpdFRleHQubG9jayA9IGxvY2s7XG4gICAgICAgIGlmICghdGhpcy5maXRUZXh0KXtcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dCA9IG5ldyBGaXRUZXh0KHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBsaW5lIGhlaWdodCB0byB0aGUgb2Zmc2V0IGhlaWdodCBtdWx0aXBsaWVkIGJ5IHJhdGlvLlxuICAgICAqIENhbGxpbmcgdGhpcyBtZXRob2QgZGlyZWN0b3J5IHdpbGwgb3ZlcnJpZGUgdGhlIHZhbHVlIHNldCBieSBjc3NcbiAgICAgKi9cbiAgICBuaWRnZXRWZXJ0QWxpZ25UZXh0KHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tbmlkZ2V0LXZlcnQtYWxpZ24tdGV4dFwiLCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb25SZXNpemUgPSAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC12ZXJ0LWFsaWduLXRleHRcIik7XG4gICAgICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XG4gICAgICAgICAgICBsZXQgaCA9IHRoaXMub2Zmc2V0SGVpZ2h0ICogcmF0aW87XG4gICAgICAgICAgICB0aGlzLnN0eWxlLmxpbmVIZWlnaHQgPSBoICsgXCJweFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZXJzLnZlcnRBbGlnblRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMudmVydEFsaWduVGV4dCA9IG5ldyBSZXNpemVPYnNlcnZlcihvblJlc2l6ZSk7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy52ZXJ0QWxpZ25UZXh0Lm9ic2VydmUodGhpcylcbiAgICAgICAgfVxuICAgICAgICBvblJlc2l6ZSgpXG4gICAgfVxufVxuO1xuXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtdGV4dCcsIE5pZGdldFRleHQpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRUZXh0OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgZHJhZ0hhbmRsZXIgPSByZXF1aXJlKFwiLi4vRHJhZ0hhbmRsZXJcIikuaW5zdGFuY2U7XG5cblxuZnVuY3Rpb24gb25EcmFnU3RhcnQoZXZlbnQpeyAgICBcbiAgICBkcmFnSGFuZGxlci5zZXQodGhpcyk7XG4gICAgd2luZG93LnggPSB0aGlzO1xuICAgIGNvbnNvbGUubG9nKFwiJ1wiICsgdGhpcy5uYW1lKCkgKyBcIidcIik7XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnU3RhcnRcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uRHJhZ0VuZChldmVudCl7XG4gICAgaWYgKGRyYWdIYW5kbGVyLmdldCgpICE9PSB0aGlzKSByZXR1cm47XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnRW5kXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xuICAgIGRyYWdIYW5kbGVyLmNsZWFyKCk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuc2V0QXR0cmlidXRlKFwiZHJhZ2dhYmxlXCIsIFwidHJ1ZVwiKTsgICBcbiAgICBcbiAgICBuaWRnZXQub25EcmFnU3RhcnQgPSBvbkRyYWdTdGFydC5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uRHJhZ0VuZCA9IG9uRHJhZ0VuZC5iaW5kKG5pZGdldCk7XG4gICAgXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIG5pZGdldC5vbkRyYWdTdGFydCk7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VuZFwiLCBuaWRnZXQub25EcmFnRW5kKTsgICAgXG59OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgZHJhZ0hhbmRsZXIgPSByZXF1aXJlKFwiLi4vRHJhZ0hhbmRsZXJcIikuaW5zdGFuY2U7XG5jb25zdCBNb3VzZVV0aWxpdGllcyA9IHJlcXVpcmUoXCIuLi9Nb3VzZVV0aWxpdGllc1wiKTtcblxuZnVuY3Rpb24gb25EcmFnT3ZlcihldmVudCl7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBsZXQgZHJhZ05pZGdldCA9IGRyYWdIYW5kbGVyLmdldCgpO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ092ZXJcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcywgZHJhZ05pZGdldCk7XG59XG5cbmZ1bmN0aW9uIG9uRHJhZ0VudGVyKGV2ZW50KXtcbiAgICBpZiAoIWRyYWdIYW5kbGVyLmhhcygpKSByZXR1cm47XG4gICAgaWYgKCFkcmFnSGFuZGxlci5wdXNoT3Zlcih0aGlzKSkgcmV0dXJuO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ0VudGVyXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbkRyYWdMZWF2ZShldmVudCl7XG4gICAgaWYgKCFkcmFnSGFuZGxlci5oYXMoKSkgcmV0dXJuO1xuICAgIGlmIChNb3VzZVV0aWxpdGllcy5pc1VuZGVyKHRoaXMuZ2V0RWxlbWVudCgpKSkgcmV0dXJuO1xuICAgIGlmICghZHJhZ0hhbmRsZXIucmVtb3ZlT3Zlcih0aGlzKSkgcmV0dXJuO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ0xlYXZlXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbkRyb3AoZXZlbnQpe1xuICAgIGxldCBkcmFnTmlkZ2V0ID0gZHJhZ0hhbmRsZXIuZ2V0KCk7XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcm9wXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMsIGRyYWdOaWRnZXQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgbmlkZ2V0Lm9uRHJhZ092ZXIgPSBvbkRyYWdPdmVyLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Ecm9wID0gb25Ecm9wLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25EcmFnRW50ZXIgPSBvbkRyYWdFbnRlci5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uRHJhZ0xlYXZlID0gb25EcmFnTGVhdmUuYmluZChuaWRnZXQpO1xuICAgIFxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIG5pZGdldC5vbkRyYWdPdmVyKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIG5pZGdldC5vbkRyb3ApO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbnRlclwiLCBuaWRnZXQub25EcmFnRW50ZXIpO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdsZWF2ZVwiLCBuaWRnZXQub25EcmFnTGVhdmUpOyAgICBcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBNb3VzZVV0aWxpdGllcyA9IHJlcXVpcmUoXCIuLi9Nb3VzZVV0aWxpdGllc1wiKTtcblxuZnVuY3Rpb24gb25DbGljayhldmVudCl7ICAgIFxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiY2xpY2tcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VEb3duKGV2ZW50KXsgICAgXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZURvd25cIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VVcChldmVudCl7ICAgIFxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VVcFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZUVudGVyKGV2ZW50KXsgICAgXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZUVudGVyXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlTGVhdmUoZXZlbnQpe1xuICAgIGlmIChNb3VzZVV0aWxpdGllcy5pc1VuZGVyKHRoaXMuZ2V0RWxlbWVudCgpKSkgcmV0dXJuO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VFeGl0XCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgY29uc29sZS5sb2coXCJtb3VzZSBzZXR1cFwiKTtcbiAgICBcbiAgICBuaWRnZXQub25DbGljayA9IG9uQ2xpY2suYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbk1vdXNlRG93biA9IG9uTW91c2VEb3duLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Nb3VzZVVwID0gb25Nb3VzZVVwLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Nb3VzZUVudGVyID0gb25Nb3VzZUVudGVyLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Nb3VzZUxlYXZlID0gb25Nb3VzZUxlYXZlLmJpbmQobmlkZ2V0KTtcbiAgICBcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBuaWRnZXQub25DbGljayk7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIG5pZGdldC5vbk1vdXNlRG93bik7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBuaWRnZXQub25Nb3VzZVVwKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIG5pZGdldC5vbk1vdXNlRW50ZXIpO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIG5pZGdldC5vbk1vdXNlTGVhdmUpO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIEVuYWJsZSB0aGUgbmlkZ2V0IHRvIGJlIG1vdmVkIGJ5IGRyYWdnaW5nLiAgV2lsbCBkcmFnIGJ5IGFueSBjaGlsZCBlbGVlbWVudFxuICogdGhlICcubmlkZ2V0LWhlYWRlcicgY2xhc3MsIG90aGVyd2lzZSBtb3ZhYmxlIGJ5IGNsaWNraW5nIGFueXdoZXJlLlxuICogQHBhcmFtIHt0eXBlfSBlXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gb25Nb3VzZU1vdmUoZSl7ICAgIFxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoIXRoaXMuX19tb3ZhYmxlLmFjdGl2ZSkgcmV0dXJuOyAgICBcblxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgbmV3IGN1cnNvciBwb3NpdGlvbjpcbiAgICBsZXQgZGVsdGFYID0gdGhpcy5fX21vdmFibGUubGFzdFggLSBlLmNsaWVudFg7XG4gICAgbGV0IGRlbHRhWSA9IHRoaXMuX19tb3ZhYmxlLmxhc3RZIC0gZS5jbGllbnRZO1xuICAgIHRoaXMuX19tb3ZhYmxlLmxhc3RYID0gZS5jbGllbnRYO1xuICAgIHRoaXMuX19tb3ZhYmxlLmxhc3RZID0gZS5jbGllbnRZO1xuICAgIFxuICAgIC8vIHNldCB0aGUgZWxlbWVudCdzIG5ldyBwb3NpdGlvbjpcbiAgICB0aGlzLnN0eWxlLnRvcCA9ICh0aGlzLm9mZnNldFRvcCAtIGRlbHRhWSkgKyBcInB4XCI7XG4gICAgdGhpcy5zdHlsZS5sZWZ0ID0gKHRoaXMub2Zmc2V0TGVmdCAtIGRlbHRhWCkgKyBcInB4XCI7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VEb3duKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLl9fbW92YWJsZS5hY3RpdmUgPSB0cnVlO1xuICAgIFxuICAgIC8vIGdldCB0aGUgbW91c2UgY3Vyc29yIHBvc2l0aW9uIGF0IHN0YXJ0dXA6XG4gICAgdGhpcy5fX21vdmFibGUubGFzdFggPSBlLmNsaWVudFg7XG4gICAgdGhpcy5fX21vdmFibGUubGFzdFkgPSBlLmNsaWVudFk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VVcChlKXtcbiAgICB0aGlzLl9fbW92YWJsZS5hY3RpdmUgPSBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIG5pZGdldC5fX21vdmFibGUgPSB7XG4gICAgICAgIGxhc3RYIDogMCxcbiAgICAgICAgbGFzdFkgOiAwLFxuICAgICAgICBhY3RpdmUgOiBmYWxzZVxuICAgIH07XG4gICAgXG4gICAgbmlkZ2V0Lm9uTW91c2VEb3duID0gb25Nb3VzZURvd24uYmluZChuaWRnZXQpOyAgICAgICAgXG4gICAgXG4gICAgaWYgKG5pZGdldC5xdWVyeVNlbGVjdG9yKFwiLm5pZGdldC1oZWFkZXJcIikpe1xuICAgICAgICBuaWRnZXQucXVlcnlTZWxlY3RvcihcIi5uaWRnZXQtaGVhZGVyXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgbmlkZ2V0Lm9uTW91c2VEb3duKTsgICAgICAgIFxuICAgIH0gZWxzZSB7XG4gICAgICAgIG5pZGdldC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIG5pZGdldC5vbk1vdXNlRG93bik7XG4gICAgfVxuICAgIFxuICAgIG5pZGdldC5vbk1vdXNlTW92ZSA9IG9uTW91c2VNb3ZlLmJpbmQobmlkZ2V0KTsgICAgXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbmlkZ2V0Lm9uTW91c2VNb3ZlKTtcblxuICAgIG5pZGdldC5vbk1vdXNlVXAgPSBvbk1vdXNlVXAuYmluZChuaWRnZXQpOyAgICBcbiAgICBuaWRnZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgbmlkZ2V0Lm9uTW91c2VVcCk7XG5cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0XCIpO1xud2luZG93Lk5pZGdldCA9IE5pZGdldDtcblxuLyoqXG4gKiBBZGQgYSByZXNpemUgb2JzZXJ2ZXIgdG8gdGhlIGVsZW1lbnQgdGhhdCB3aWxsIGNhbGwgYSBvblJlc2l6ZSgpIGZ1bmN0aW9uLlxuICogVGhlIHBhcmFtZXRlcnMgcGFzc2VkIGluIGFyZSAocHJldmlvdXNfZGltZW5zaW9ucykuICBUbyB1c2UgYWRkXG4gKiBpbnRlcmZhY2VzPVwicmVzaXplXCIgdG8gdGhlIGVsZW1lbnQgaW4gaHRtbCBhbmQgYSBtZXRob2Qgb25SZXNpemUoKSB0byB0aGUgXG4gKiBjbGFzcyBvYmplY3QuICBJZiB0aGVyZSBpcyBubyBjbGFzcyBvYmplY3QgY3JlYXRlIGEgZnVuY3Rpb24gYW5kIGJpbmQgaXQuXG4gKiBpZTogZWxlbWVudC5vblJlc2l6ZSA9IGZ1bmN0aW9uLmJpbmQoZWxlbWVudCk7IFxuICovXG5cbmxldCBvblJlc2l6ZSA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRhdGEgPSB0aGlzW05pZGdldC5pbnRlcmZhY2VEYXRhRmllbGRdLnJlc2l6ZTtcbiAgICBsZXQgcHJldiA9IGRhdGEucHJldjtcbiAgICBpZiAoIXRoaXMub25SZXNpemUpIHJldHVybjtcbiAgICB0aGlzLm9uUmVzaXplKHByZXYpO1xuICAgIGxvYWRQcmV2aW91cyh0aGlzKTtcbn07XG5cbmxldCBsb2FkUHJldmlvdXMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIGxldCBkYXRhID0gbmlkZ2V0W05pZGdldC5pbnRlcmZhY2VEYXRhRmllbGRdLnJlc2l6ZTtcbiAgICBkYXRhLnByZXYgPSB7XG4gICAgICAgIHdpZHRoIDogbmlkZ2V0Lm9mZnNldFdpZHRoLFxuICAgICAgICBoZWlnaHQgOiBuaWRnZXQub2Zmc2V0SGVpZ2h0XG4gICAgfTsgICAgXG59O1xuXG4vKipcbiAqIFNldHVwIGEgcmVzaXplIG9ic2VydmVyIGZvciB0aGUgbmlkZ2V0IHRoYXQgdHJpZ2dlcnMgdGhlIG9uUmVzaXplIG1ldGhvZCBpZiBcbiAqIGF2YWlsYWJsZS5cbiAqIC0gb25SZXNpemUodGhpcywgcHJldmlvdXNfZGltZW5zaW9ucykgOiBub25lXG4gKiBAcGFyYW0ge3R5cGV9IG5pZGdldFxuICogQHJldHVybiB7dW5kZWZpbmVkfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgaWYgKHR5cGVvZihuaWRnZXQpICE9PSBcIm9iamVjdFwiKSB0aHJvdyBuZXcgXCJPYmplY3QgZXhlY3RlZFwiO1xuICAgIGxldCByZXNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcihvblJlc2l6ZS5iaW5kKG5pZGdldCkpO1xuICAgIHJlc2l6ZU9ic2VydmVyLm9ic2VydmUobmlkZ2V0KTtcbiAgICBsb2FkUHJldmlvdXMobmlkZ2V0KTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQWJzdHJhY3RNb2RlbCA6IHJlcXVpcmUoXCIuL0Fic3RyYWN0TW9kZWxcIiksXG4gICAgTmlkZ2V0RWxlbWVudCA6IHJlcXVpcmUoXCIuL05pZGdldEVsZW1lbnRcIiksXG4gICAgRmlsZU9wZXJhdGlvbnMgOiByZXF1aXJlKFwiLi9GaWxlT3BlcmF0aW9uc1wiKSxcbiAgICBOaWRnZXRCdXR0b25TZXQgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b25TZXRcIiksXG4gICAgTmlkZ2V0QnV0dG9uIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uXCIpLFxuICAgIE5pZGdldEJ1dHRvblN0YXRlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU3RhdGVcIiksXG4gICAgTmlkZ2V0SW1hZ2UgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRJbWFnZVwiKSxcbiAgICBOaWRnZXRIVE1MSW1hZ2UgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRIVE1MSW1hZ2VcIiksXG4gICAgTmlkZ2V0VGV4dCA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldFRleHRcIiksXG4gICAgTmlkZ2V0Q29udGFpbmVyIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0Q29udGFpbmVyXCIpLFxuICAgIE1vdXNlVXRpbGl0aWVzIDogcmVxdWlyZShcIi4vTW91c2VVdGlsaXRpZXNcIiksXG4gICAgQ29uc3RhbnRzOiByZXF1aXJlKFwiLi9OaWRnZXRcIiksXG4gICAgbGF5b3V0czoge31cbn07IiwiY29uc3QgRmlsZU9wcyA9IHJlcXVpcmUoXCIuL21vZHVsZXMvRmlsZU9wcy5qc1wiKTtcclxuY29uc3QgTWVudSA9IHJlcXVpcmUoXCIuL21vZHVsZXMvTWVudS5qc1wiKTtcclxuY29uc3QgUXVlc3Rpb25QYW5lID0gcmVxdWlyZShcIi4vbW9kdWxlcy9RdWVzdGlvblBhbmUuanNcIik7XHJcbmNvbnN0IEVkaXRvclBhbmUgPSByZXF1aXJlKFwiLi9tb2R1bGVzL0VkaXRvclBhbmUuanNcIik7XHJcblxyXG5yZXF1aXJlKFwiQHRoYWVyaW91cy9uaWRnZXRcIilcclxucmVxdWlyZShcIi4vbW9kdWxlcy9HYW1lQm9hcmQuanNcIik7XHJcblxyXG5sZXQgZmlsZU9wcyA9IG5ldyBGaWxlT3BzKCk7XHJcbmxldCBtb2RlbCA9IG51bGw7XHJcbmxldCBxdWVzdGlvblBhbmUgPSBudWxsO1xyXG5cclxud2luZG93Lm9ubG9hZCA9IGFzeW5jICgpPT4ge1xyXG4gICAgd2luZG93Lm1lbnUgPSBuZXcgTWVudShcIiNtZW51XCIpO1xyXG4gICAgcGFyc2VVUkxQYXJhbWV0ZXJzKCk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBmaWxlT3BzLmxvYWRDbGllbnQoKTtcclxuICAgICAgICBxdWVzdGlvblBhbmUgPSBuZXcgUXVlc3Rpb25QYW5lKCgpPT57XHJcbiAgICAgICAgICAgIGZpbGVPcHMuc2V0Qm9keShcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5wYXJhbWV0ZXJzLmZpbGVJZCwgSlNPTi5zdHJpbmdpZnkod2luZG93Lm1vZGVsLmdldCgpLCBudWxsLCAyKVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh3aW5kb3cucGFyYW1ldGVycy5hY3Rpb24gPT09IFwibmV3XCIpe1xyXG4gICAgICAgIHdpbmRvdy5tb2RlbCA9IG1vZGVsID0gYXdhaXQgbmV3IE1vZGVsKGZpbGVPcHMpLmluaXQoKTtcclxuICAgICAgICB1cGRhdGVWaWV3KHdpbmRvdy5tb2RlbCk7XHJcbiAgICAgICAgYWRkTGlzdGVuZXJzKCk7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBmcCA9IGF3YWl0IGZpbGVPcHMuY3JlYXRlKHdpbmRvdy5wYXJhbWV0ZXJzLmRpcklkLCBcIkdhbWUgTmFtZVwiKTtcclxuICAgICAgICAgICAgYXdhaXQgZmlsZU9wcy5zZXRCb2R5KGZwLmlkLCBKU09OLnN0cmluZ2lmeSh3aW5kb3cubW9kZWwuZ2V0KCksIG51bGwsIDIpKTtcclxuICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IGxvY2F0aW9uLm9yaWdpbiArIFwiL2VkaXRvci5odG1sP2FjdGlvbj1sb2FkJmZpbGVJZD1cIiArIGZwLmlkO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAod2luZG93LnBhcmFtZXRlcnMuYWN0aW9uID09PSBcImxvYWRcIil7XHJcbiAgICAgICAgbGV0IGZpbGUgPSBhd2FpdCBmaWxlT3BzLmdldCh3aW5kb3cucGFyYW1ldGVycy5maWxlSWQpO1xyXG4gICAgICAgIGxldCBtb2RlbCA9IEpTT04ucGFyc2UoZmlsZS5ib2R5KTtcclxuICAgICAgICB3aW5kb3cubW9kZWwgPSBtb2RlbCA9IG5ldyBNb2RlbChmaWxlT3BzKS5zZXQobW9kZWwpO1xyXG4gICAgICAgIHVwZGF0ZVZpZXcod2luZG93Lm1vZGVsKTtcclxuICAgICAgICBhZGRMaXN0ZW5lcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZWRpdG9yUGFuZSA9IG5ldyBFZGl0b3JQYW5lKHdpbmRvdy5tb2RlbCk7XHJcbiAgICBlZGl0b3JQYW5lLm9uU2F2ZSA9IHNhdmVNb2RlbDtcclxuICAgIGVkaXRvclBhbmUudXBkYXRlVmlldyA9IHVwZGF0ZVZpZXc7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVNb2RlbCgpe1xyXG4gICAgY29uc29sZS5sb2cod2luZG93Lm1vZGVsLmdldCgpKTtcclxuICAgIGZpbGVPcHMuc2V0Qm9keSh3aW5kb3cucGFyYW1ldGVycy5maWxlSWQsIEpTT04uc3RyaW5naWZ5KHdpbmRvdy5tb2RlbC5nZXQoKSwgbnVsbCwgMikpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZVVSTFBhcmFtZXRlcnMoKXtcclxuICAgIHdpbmRvdy5wYXJhbWV0ZXJzID0ge307XHJcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSkuc3BsaXQoXCImXCIpO1xyXG4gICAgZm9yIChjb25zdCBwYXJhbWV0ZXIgb2YgcGFyYW1ldGVycyl7XHJcbiAgICAgICAgY29uc3Qgc3BsaXQgPSBwYXJhbWV0ZXIuc3BsaXQoLz0vKTtcclxuICAgICAgICB3aW5kb3cucGFyYW1ldGVyc1tzcGxpdFswXV0gPSBzcGxpdFsxXSA/PyBcIlwiO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcnMoKXtcclxuICAgIGxldCBnYW1lQm9hcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWUtYm9hcmRcIik7XHJcbiAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCA2OyBjb2wrKyl7XHJcbiAgICAgICAgZ2FtZUJvYXJkLmdldEhlYWRlcihjb2wpLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCBoZWFkZXJDaGFuZ2VMaXN0ZW5lcik7XHJcbiAgICAgICAgZ2FtZUJvYXJkLmdldEhlYWRlcihjb2wpLmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIGhlYWRlckZvY3VzTGlzdGVuZXIpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCA1OyByb3crKyl7XHJcbiAgICAgICAgICAgIGdhbWVCb2FyZC5nZXRDZWxsKHJvdywgY29sKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgICAgIHF1ZXN0aW9uUGFuZS5zaG93UXVlc3Rpb24od2luZG93Lm1vZGVsLmdldENlbGwocm93LCBjb2wpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoZWFkZXJDaGFuZ2VMaXN0ZW5lcihldmVudCl7XHJcbiAgICBldmVudC50YXJnZXQuZml0VGV4dC5ub3RpZnkoMSwgMSk7XHJcbiAgICBsZXQgY29sID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1jb2xcIikpO1xyXG4gICAgd2luZG93Lm1vZGVsLmdldENvbHVtbihjb2wpLmNhdGVnb3J5ID0gZXZlbnQudGFyZ2V0LnRleHQ7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhlYWRlckZvY3VzTGlzdGVuZXIoZXZlbnQpe1xyXG4gICAgbGV0IGNvbCA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC5wYXJlbnRFbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtY29sXCIpKTtcclxuICAgIGV2ZW50LnRhcmdldC50ZXh0ID0gd2luZG93Lm1vZGVsLmdldENvbHVtbihjb2wpLmNhdGVnb3J5O1xyXG4gICAgd2luZG93Lm1vZGVsLmdldENvbHVtbihjb2wpLmZvbnRzaXplID0gZXZlbnQudGFyZ2V0LnN0eWxlW1wiZm9udC1zaXplXCJdO1xyXG4gICAgYXdhaXQgZmlsZU9wcy5zZXRCb2R5KHdpbmRvdy5wYXJhbWV0ZXJzLmZpbGVJZCwgSlNPTi5zdHJpbmdpZnkod2luZG93Lm1vZGVsLmdldCgpLCBudWxsLCAyKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZVZpZXcobW9kZWwpe1xyXG4gICAgbGV0IGdhbWVCb2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZS1ib2FyZFwiKTtcclxuICAgIGlmICghZ2FtZUJvYXJkKSB0aHJvdyBuZXcgRXJyb3IoXCJHYW1lIGJvYXJkIG5vdCBmb3VuZFwiKTtcclxuICAgIG1vZGVsID0gbW9kZWwgPz8gd2luZG93Lm1vZGVsO1xyXG5cclxuICAgIGxldCByb3VuZCA9IG1vZGVsLmdldFJvdW5kKCk7XHJcblxyXG4gICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgNjsgY29sKyspe1xyXG4gICAgICAgIGxldCBjb2x1bW4gPSBtb2RlbC5nZXRDb2x1bW4oY29sKTtcclxuXHJcbiAgICAgICAgZ2FtZUJvYXJkLmdldEhlYWRlcihjb2wpLmluaXRGaXRUZXh0KFwidmhcIik7XHJcbiAgICAgICAgZ2FtZUJvYXJkLnNldEhlYWRlcihjb2wsIGNvbHVtbi5jYXRlZ29yeSk7XHJcbiAgICAgICAgZ2FtZUJvYXJkLmdldEhlYWRlcihjb2wpLmZpdFRleHQuZGVsYXlSZXNpemUoMSwgMSk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IDU7IHJvdysrKXtcclxuICAgICAgICAgICAgZ2FtZUJvYXJkLnNldENlbGwocm93LCBjb2wsIGNvbHVtbi5jZWxsW3Jvd10udmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTW9kZWx7XHJcbiAgICBpbml0KCl7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWVNb2RlbCA9IHtcclxuICAgICAgICAgICAgcm91bmRzIDogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmFkZFJvdW5kKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0KGdhbWVNb2RlbCl7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQgPSAwO1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsID0gZ2FtZU1vZGVsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0Um91bmQoaW5kZXgpe1xyXG4gICAgICAgIGluZGV4ID0gaW5kZXggPz8gdGhpcy5jdXJyZW50Um91bmQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsLnJvdW5kc1tpbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29sdW1uKGluZGV4KXtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb3VuZCgpLmNvbHVtbltpbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2VsbChjb2x1bW4sIHJvdyl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29sdW1uKGNvbHVtbikuY2VsbFtyb3ddO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZFJvdW5kKCl7XHJcbiAgICAgICAgbGV0IHJvdW5kID0ge1xyXG4gICAgICAgICAgICB0eXBlIDogXCJjaG9pY2VcIixcclxuICAgICAgICAgICAgY29sdW1uIDogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKyl7XHJcbiAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXSA9IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5IDogXCJcIixcclxuICAgICAgICAgICAgICAgIGNlbGwgOiBbXVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKyl7XHJcbiAgICAgICAgICAgICAgICByb3VuZC5jb2x1bW5baV0uY2VsbFtqXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA6IChqICsgMSkgKiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZSA6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHEgOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGEgOiBcIlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5wdXNoKHJvdW5kKTtcclxuICAgICAgICByZXR1cm4gcm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHJvdW5kQ291bnQoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWwucm91bmRzLmxlbmd0aDtcclxuICAgIH1cclxufVxyXG5cclxuIiwiXHJcbmNsYXNzIEVkaXRvclBhbmV7XHJcbiAgICBjb25zdHJ1Y3RvcihnYW1lTW9kZWwpIHtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbCA9IGdhbWVNb2RlbDtcclxuICAgICAgICB0aGlzLnRyaWFuZ2xlUmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RyaWFuZ2xlLXJpZ2h0XCIpO1xyXG4gICAgICAgIHRoaXMudHJpYW5nbGVMZWZ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0cmlhbmdsZS1sZWZ0XCIpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVRyaWFuZ2xlVmlldygpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtYWRkLXJvdW5kXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy5tZW51QWRkKCkpO1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1yZW1vdmUtcm91bmRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLm1lbnVSZW1vdmUoKSk7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LWhvbWUtc2NyZWVuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy5tZW51SG9tZSgpKTtcclxuICAgICAgICB0aGlzLnRyaWFuZ2xlUmlnaHQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT4gdGhpcy5uZXh0Um91bmQoKSk7XHJcbiAgICAgICAgdGhpcy50cmlhbmdsZUxlZnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT4gdGhpcy5wcmV2Um91bmQoKSk7XHJcblxyXG4gICAgICAgIHRoaXMub25TYXZlID0gZnVuY3Rpb24oKXt9OyAvLyBzZXQgdGhpcyBpbiBtYWluIHRvIHNhdmUgLmpzb24gbW9kZWxcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcgPSBmdW5jdGlvbigpe307IC8vIHNldCB0aGlzIGluIG1haW4gdG8gdXBkYXRlIHZpZXdcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVUcmlhbmdsZVZpZXcoKXtcclxuICAgICAgICB0aGlzLnRyaWFuZ2xlTGVmdC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMudHJpYW5nbGVSaWdodC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLmdhbWVNb2RlbC5jdXJyZW50Um91bmQgPT09IDApIHRoaXMudHJpYW5nbGVMZWZ0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2FtZU1vZGVsLmN1cnJlbnRSb3VuZCA+PSB0aGlzLmdhbWVNb2RlbC5yb3VuZENvdW50IC0gMSkgdGhpcy50cmlhbmdsZVJpZ2h0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgbmV4dFJvdW5kKCl7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwuY3VycmVudFJvdW5kKys7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUcmlhbmdsZVZpZXcoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcmV2Um91bmQoKXtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5jdXJyZW50Um91bmQtLTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRyaWFuZ2xlVmlldygpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgfVxyXG5cclxuICAgIG1lbnVBZGQoKXtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIm1lbnUgYWRkXCIpO1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLmFkZFJvdW5kKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUcmlhbmdsZVZpZXcoKTtcclxuICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIG1lbnVSZW1vdmUoKXtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgbWVudUhvbWUoKXtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yUGFuZTsiLCIvLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZHJpdmUvYXBpL3YzL3F1aWNrc3RhcnQvanM/aGw9ZW5cclxuXHJcbmNsYXNzIEZpbGVPcHMge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICAvLyBUaGUgQnJvd3NlciBBUEkga2V5IG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS5cclxuICAgICAgICB0aGlzLmRldmVsb3BlcktleSA9ICdBSXphU3lBQmNkTG1UNkhIXzdHbzgycV9JQkdJM2ptNlVMNHc0UTAnO1xyXG5cclxuICAgICAgICAvLyBUaGUgQ2xpZW50IElEIG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS4gUmVwbGFjZSB3aXRoIHlvdXIgb3duIENsaWVudCBJRC5cclxuICAgICAgICB0aGlzLmNsaWVudElkID0gXCIxNTg4MjMxMzQ2ODEtOThiZ2thbmdvbHRrNjM2dWtmOHBvZmVpczdwYTdqYmsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb21cIlxyXG5cclxuICAgICAgICAvLyBSZXBsYWNlIHdpdGggeW91ciBvd24gcHJvamVjdCBudW1iZXIgZnJvbSBjb25zb2xlLmRldmVsb3BlcnMuZ29vZ2xlLmNvbS5cclxuICAgICAgICB0aGlzLmFwcElkID0gXCIxNTg4MjMxMzQ2ODFcIjtcclxuXHJcbiAgICAgICAgLy8gQXJyYXkgb2YgQVBJIGRpc2NvdmVyeSBkb2MgVVJMcyBmb3IgQVBJcyB1c2VkIGJ5IHRoZSBxdWlja3N0YXJ0XHJcbiAgICAgICAgdGhpcy5kaXNjb3ZlcnlEb2NzID0gW1wiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vZGlzY292ZXJ5L3YxL2FwaXMvZHJpdmUvdjMvcmVzdFwiXTtcclxuXHJcbiAgICAgICAgLy8gU2NvcGUgdG8gdXNlIHRvIGFjY2VzcyB1c2VyJ3MgRHJpdmUgaXRlbXMuXHJcbiAgICAgICAgdGhpcy5zY29wZSA9ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLmZpbGUnO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDbGllbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmxvYWQoJ2NsaWVudDphdXRoMicsICgpPT50aGlzLmluaXRDbGllbnQocmVzb2x2ZSwgcmVqZWN0KSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdENsaWVudChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBnYXBpLmNsaWVudC5pbml0KHtcclxuICAgICAgICAgICAgYXBpS2V5OiB0aGlzLmRldmVsb3BlcktleSxcclxuICAgICAgICAgICAgY2xpZW50SWQ6IHRoaXMuY2xpZW50SWQsXHJcbiAgICAgICAgICAgIGRpc2NvdmVyeURvY3M6IHRoaXMuZGlzY292ZXJ5RG9jcyxcclxuICAgICAgICAgICAgc2NvcGU6IHRoaXMuc2NvcGVcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgY3JlYXRlKGRpclRva2VuLCBmaWxlbmFtZSl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgICAgbmFtZTogZmlsZW5hbWUsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRzOiBbZGlyVG9rZW5dXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVzLmJvZHkpKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldChmaWxlSWQpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuZ2V0KHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZDogZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgYWx0OiAnbWVkaWEnXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBzZXRCb2R5KGZpbGVJZCwgYm9keSl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5yZXF1ZXN0KHtcclxuICAgICAgICAgICAgICAgIHBhdGggOiBcInVwbG9hZC9kcml2ZS92My9maWxlcy9cIiArIGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIG1ldGhvZCA6IFwiUEFUQ0hcIixcclxuICAgICAgICAgICAgICAgIHBhcmFtcyA6IHtcclxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRUeXBlIDogXCJtZWRpYVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaGVhZGVycyA6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiIDogXCJhcHBsaWNhdGlvbi9qc29uXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBib2R5IDogYm9keVxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcy5ib2R5KSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZW5hbWUoZmlsZUlkLCBmaWxlbmFtZSl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkOiBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBmaWxlbmFtZVxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcy5ib2R5KSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3BzOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuY2xhc3MgR2FtZUJvYXJkIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIHZhbHVlIG9mIGEgY2F0ZWdvcnlcclxuICAgICAqIEBwYXJhbSBpbmRleFxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIHNldEhlYWRlcihpbmRleCwgdmFsdWUpe1xyXG4gICAgICAgIGlmICh0eXBlb2YgaW5kZXggIT09IFwibnVtYmVyXCIgfHwgaW5kZXggPCAwIHx8IGluZGV4ID4gNikgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbmRleDogXCIgKyBpbmRleCk7XHJcbiAgICAgICAgbGV0IHNlbGVjdG9yID0gYFtkYXRhLXJvdz0naCddW2RhdGEtY29sPScke2luZGV4fSddID4gLnZhbHVlYDtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICAgICAgZWxlbWVudC50ZXh0ID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRyaWV2ZSB0aGUgaGVhZGVyIGh0bWwgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIGluZGV4XHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqL1xyXG4gICAgZ2V0SGVhZGVyKGluZGV4KXtcclxuICAgICAgICBpZiAodHlwZW9mIGluZGV4ICE9PSBcIm51bWJlclwiIHx8IGluZGV4IDwgMCB8fCBpbmRleCA+IDYpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5kZXg6IFwiICsgaW5kZXgpO1xyXG4gICAgICAgIGxldCBzZWxlY3RvciA9IGBbZGF0YS1yb3c9J2gnXVtkYXRhLWNvbD0nJHtpbmRleH0nXSA+IC52YWx1ZWA7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIHZhbHVlIG9mIGEgbm9uLWNhdGVnb3J5IGNlbGwuXHJcbiAgICAgKiBAcGFyYW0gcm93XHJcbiAgICAgKiBAcGFyYW0gY29sXHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqL1xyXG4gICAgc2V0Q2VsbChyb3csIGNvbCwgdmFsdWUgPSBcIlwiKXtcclxuICAgICAgICBpZiAodHlwZW9mIHJvdyAhPT0gXCJudW1iZXJcIiB8fCByb3cgPCAwIHx8IHJvdyA+IDYpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcm93OiBcIiArIHJvdyk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb2wgIT09IFwibnVtYmVyXCIgfHwgY29sIDwgMCB8fCBjb2wgPiA1KSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGNvbDogXCIgKyBjb2wpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZWN0b3IgPSBgW2RhdGEtcm93PVwiJHtyb3d9XCJdW2RhdGEtY29sPVwiJHtjb2x9XCJdID4gLnZhbHVlYDtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLnRleHRDb250ZW50ID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2VsbChyb3csIGNvbCl7XHJcbiAgICAgICAgbGV0IHNlbGVjdG9yID0gYFtkYXRhLXJvdz1cIiR7cm93fVwiXVtkYXRhLWNvbD1cIiR7Y29sfVwiXSA+IC52YWx1ZWA7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICB9XHJcbn1cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2dhbWUtYm9hcmQnLCBHYW1lQm9hcmQpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVCb2FyZDsiLCJjbGFzcyBNZW51e1xyXG4gICAgY29uc3RydWN0b3IobWVudVNlbGVjdG9yKSB7XHJcbiAgICAgICAgdGhpcy5tZW51U2VsZWN0b3IgPSBtZW51U2VsZWN0b3I7XHJcbiAgICAgICAgdGhpcy5tZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy50b2dnbGVNZW51KCkpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb25NZW51KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdG9nZ2xlTWVudSgpe1xyXG4gICAgICAgIGlmICh0aGlzLm1lbnVBcmVhLmNsYXNzTGlzdC5jb250YWlucyhcImhpZGRlblwiKSl7XHJcbiAgICAgICAgICAgIHRoaXMubWVudUFyZWEuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbk1lbnUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm1lbnVBcmVhLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBvc2l0aW9uTWVudSgpe1xyXG4gICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLm1lbnVCdXR0b24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgICAgICBjb25zdCBiV2lkdGggPSB0aGlzLm1lbnVCdXR0b24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XHJcbiAgICAgICAgY29uc3QgbVdpZHRoID0gdGhpcy5tZW51QXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuICAgICAgICBpZiAoKGxlZnQgKyBiV2lkdGggKyBtV2lkdGggKyAyKSA+IHdpbmRvdy5pbm5lcldpZHRoKXtcclxuICAgICAgICAgICAgdGhpcy5zZXRNZW51TGVmdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TWVudVJpZ2h0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldE1lbnVMZWZ0KCl7XHJcbiAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMubWVudUJ1dHRvbi5vZmZzZXRMZWZ0O1xyXG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5tZW51QXJlYS5vZmZzZXRXaWR0aDtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLnN0eWxlLmxlZnQgPSAobGVmdCAtIHdpZHRoIC0gMikgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWVudVJpZ2h0KCl7XHJcbiAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMubWVudUJ1dHRvbi5vZmZzZXRMZWZ0O1xyXG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5tZW51QnV0dG9uLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuc3R5bGUubGVmdCA9IChsZWZ0ICsgd2lkdGggKyAyKSArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWVudSgpe1xyXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMubWVudVNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWVudUJ1dHRvbigpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1lbnUucXVlcnlTZWxlY3RvcihcIi5tZW51LWljb25cIik7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG1lbnVBcmVhKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWVudS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYXJlYVwiKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51OyIsIlxyXG5jbGFzcyBRdWVzdGlvblBhbmV7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsIGNvbnN0cnVjdG9yIGFmdGVyIHdpbmRvdyBoYXMgbG9hZGVkXHJcbiAgICAgKiBAcGFyYW0gKGZ1bmN0aW9uKSBzYXZlY2IgY2FsbGJhY2sgdG8gc2F2ZSBtb2RlbFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihzYXZlY2IpIHtcclxuICAgICAgICB0aGlzLnRleHRRdWVzdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGV4dC1xdWVzdGlvblwiKTtcclxuICAgICAgICB0aGlzLm5hdkJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzaG93LWJvYXJkXCIpO1xyXG4gICAgICAgIHRoaXMubmF2UXVlc3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctcXVlc3Rpb25cIik7XHJcbiAgICAgICAgdGhpcy5uYXZBbnN3ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctYW5zd2VyXCIpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctYm9hcmRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZUFsbCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctcXVlc3Rpb25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1F1ZXN0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1hbnN3ZXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0Fuc3dlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnRleHRRdWVzdGlvbi5xdWVyeVNlbGVjdG9yKFwiLnRleHQtY29udGVudHNcIikuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgYXN5bmMgKCk9PntcclxuICAgICAgICAgICB0aGlzLmNlbGxbdGhpcy5zdGF0dXNdID0gdGhpcy50ZXh0UXVlc3Rpb24ucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpLnRleHQ7XHJcbiAgICAgICAgICAgYXdhaXQgc2F2ZWNiKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZUFsbCgpe1xyXG4gICAgICAgIHRoaXMubmF2Qm9hcmQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLm5hdlF1ZXN0aW9uLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5uYXZBbnN3ZXIuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLnRleHRRdWVzdGlvbi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3dRdWVzdGlvbihjZWxsKXtcclxuICAgICAgICBpZiAoY2VsbCkgdGhpcy5jZWxsID0gY2VsbDtcclxuICAgICAgICBjZWxsID0gY2VsbCA/PyB0aGlzLmNlbGw7XHJcblxyXG4gICAgICAgIHRoaXMubmF2QW5zd2VyLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICB0aGlzLm5hdlF1ZXN0aW9uLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBcInFcIjtcclxuXHJcbiAgICAgICAgdGhpcy5uYXZCb2FyZC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMubmF2UXVlc3Rpb24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLm5hdkFuc3dlci5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICB0aGlzLnRleHRRdWVzdGlvbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMudGV4dFF1ZXN0aW9uLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dC1jb250ZW50c1wiKS50ZXh0ID0gY2VsbC5xO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3dBbnN3ZXIoY2VsbCl7XHJcbiAgICAgICAgaWYgKGNlbGwpIHRoaXMuY2VsbCA9IGNlbGw7XHJcbiAgICAgICAgY2VsbCA9IGNlbGwgPz8gdGhpcy5jZWxsO1xyXG5cclxuICAgICAgICB0aGlzLm5hdkFuc3dlci5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIik7XHJcbiAgICAgICAgdGhpcy5uYXZRdWVzdGlvbi5jbGFzc0xpc3QucmVtb3ZlKFwic2VsZWN0ZWRcIik7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gXCJhXCI7XHJcblxyXG4gICAgICAgIHRoaXMubmF2Qm9hcmQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLm5hdlF1ZXN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5uYXZBbnN3ZXIuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuXHJcbiAgICAgICAgdGhpcy50ZXh0UXVlc3Rpb24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLnRleHRRdWVzdGlvbi5xdWVyeVNlbGVjdG9yKFwiLnRleHQtY29udGVudHNcIikudGV4dCA9IGNlbGwuYTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBRdWVzdGlvblBhbmU7XHJcblxyXG5cclxuIl19
