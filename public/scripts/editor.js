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
        if (this.hasAttribute(Nidget.templateSrcAttribute)) await this.retrieveTemplate(this.dataAttributes());

        // manipulate (css) styles programmatically
        window.addEventListener("load", (event)=>this.onLoad());
    }

    /**
     * Target of the window load event.
     * Override this method.
     */
    onLoad(){

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

    /**
     * Load contents of file into this element.
     * Replace all ${} variables with contents of 'map'.
     */
    async retrieveSource(map){
        let src = this.getAttribute(Nidget.srcAttribute);
        let text = await FileOperations.getFile(src, map);
        this.innerHTML = text;
    }

    /**
     * Load contents of file as a templete and apply that template to this element.
     * Replace all ${} variables with contents of 'map'.
     * The template will be given the id derived from the src attribute.
     */
    async retrieveTemplate(map){
        let src = this.getAttribute(Nidget.templateSrcAttribute);
        let id = src.replace(/[\// .-]+/g, "_");

        if (!document.querySelector(`#${id}`)){
            let text = await FileOperations.getFile(src, map);
            let template = document.createElement("template");
            template.innerHTML = text;
            template.setAttribute("id", id);
            document.body.append(template);
        }

        let template = document.querySelector(`#${id}`);
        this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
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
            this.setAttribute("data-disabled", true);
        } else {
            this.removeAttribute("data-disabled", false);
        }
    }

    /**
     * Get the disabled flag that is read by nidget mouse functions.
     * @param value
     */
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
        if (!this.fitText){
            this.fitText = new FitText(this);
        }
        if (lock) this.fitText.lock = lock;
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
const Menu = require("./modules/Menu.js");
const QuestionPane = require("./modules/QuestionPane.js");
const EditorPane = require("./modules/EditorPane.js");
const Model = require("./modules/Model");

require("@thaerious/nidget")
require("./modules/GameBoard.js");
require("./modules/MultipleChoicePane.js");

let fileOps = new FileOps();
let model = null;
let questionPane = null;
let editorPane = null;

window.onload = async () => {
    new Menu().init("#menu");
    parseURLParameters();

    try {
        await fileOps.loadClient();
        questionPane = new QuestionPane();
    } catch (err) {
        console.log(err);
    }

    if (window.parameters.action === "load") {
        let file = await fileOps.get(window.parameters.fileId);
        let model = JSON.parse(file.body);
        window.model = model = new Model(fileOps).set(model);
    }

    document.querySelector("#game-name").textContent = window.model.name;
    editorPane = new EditorPane(window.model);
    editorPane.onSave = saveModel;
    questionPane.onSave = saveModel;
    questionPane.onClose = () => editorPane.updateView();
    editorPane.updateName = renameModel;
    editorPane.updateView();

    document.querySelector("game-board").addEventListener("cell-select", (event)=>{
        let row = event.detail.row;
        let col = event.detail.col;
        questionPane.showQuestion(window.model.getCell(row, col));
        editorPane.hideAll();
    });
}

function saveModel() {
    fileOps.setBody(window.parameters.fileId, JSON.stringify(window.model.get(), null, 2));
}

function renameModel() {
    let name = document.querySelector("#game-name").textContent;
    fileOps.rename(window.parameters.fileId, name + ".json");
    window.model.name = name;
    saveModel();
}

function parseURLParameters() {
    window.parameters = {};
    const parameters = window.location.search.substr(1).split("&");
    for (const parameter of parameters) {
        const split = parameter.split(/=/);
        window.parameters[split[0]] = split[1] ?? "";
    }
}
},{"./modules/EditorPane.js":25,"./modules/FileOps.js":26,"./modules/GameBoard.js":27,"./modules/Menu.js":28,"./modules/Model":29,"./modules/MultipleChoicePane.js":30,"./modules/QuestionPane.js":31,"@thaerious/nidget":22}],24:[function(require,module,exports){
// see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

class AbstractFile {
    constructor(){
        Object.assign(this, require("./googleFields.js"));
    }

    loadClient() {
        return new Promise((resolve, reject)=> {
            gapi.load('client:auth2', ()=>this.__initClient(resolve, reject));
        });
    }

    __initClient(resolve, reject) {
        gapi.client.init({
            apiKey: this.developerKey,
            clientId: this.clientId,
            discoveryDocs: this.discoveryDocs,
            scope: this.scope
        }).then(function () {
            resolve();
        }, function(error) {
            console.log(error);
            reject(error);
        });
    }
}

module.exports = AbstractFile;
},{"./googleFields.js":32}],25:[function(require,module,exports){
const Model = require("./Model.js");

class EditorPane{
    constructor(gameModel) {
        this.gameModel = gameModel;
        this.triangleRight = document.querySelector("#triangle-right");
        this.triangleLeft = document.querySelector("#triangle-left");
        this.roundLabel = document.querySelector("#round-number");
        this.gameName = document.querySelector("#game-name");

        this.updateTriangleView();

        document.querySelector("#menu-add-category").addEventListener("click", ()=>{
            this.gameModel.addCategoryRound();
            this.updateTriangleView();
            this.onSave();
        });

        document.querySelector("#menu-add-multiple-choice").addEventListener("click", ()=>{
            this.gameModel.addMultipleChoiceRound();
            this.updateTriangleView();
            this.onSave();
        });

        document.querySelector("#menu-remove-round").addEventListener("click", ()=>this.menuRemove());
        document.querySelector("#menu-home-screen").addEventListener("click", ()=>this.menuHome());
        document.querySelector("#menu-value-plus").addEventListener("click", ()=>this.menuPlus());
        document.querySelector("#menu-value-minus").addEventListener("click", ()=>this.menuMinus());

        this.triangleRight.addEventListener("click", ()=> this.nextRound());
        this.triangleLeft.addEventListener("click", ()=> this.prevRound());
        // this.gameName.addEventListener("blur", ()=> this.updateName());
        this.gameName.addEventListener("keydown", (event)=>this.inputName(event));

        this.onSave = function(){}; // set this in main to save .json model
        this.updateName = function(){}; // called to change the file name
    }

    inputName(event){
        window.e = event;
        if (event.which === 13){
            this.updateName();
            e.stopPropagation();
            e.preventDefault();
            document.querySelector("#game-board-container").focus();
            return false;
        }
    }

    hideAll(){
        this.triangleLeft.classList.add("hidden");
        this.triangleRight.classList.add("hidden");
    }

    updateTriangleView(){
        this.triangleLeft.classList.remove("hidden");
        this.triangleRight.classList.remove("hidden");
        if (this.gameModel.currentRound === 0) this.triangleLeft.classList.add("hidden");
        if (this.gameModel.currentRound >= this.gameModel.roundCount - 1) this.triangleRight.classList.add("hidden");
        this.roundLabel.textContent = "Round " + (this.gameModel.currentRound + 1);
    }

    updateView(model) {
        model = model ?? this.gameModel;
        this.updateTriangleView();
        model = model ?? window.model;

        document.getElementById("game-board").hide();
        document.getElementById("multiple-choice-pane").hide();

        if (model.getRound().type === Model.questionType.CATEGORY) this.categoryView(model);
        if (model.getRound().type === Model.questionType.MULTIPLE_CHOICE) this.multipleChoiceView(model);
    }

    multipleChoiceView(){

    }

    categoryView(model){
        let gameBoard = document.getElementById("game-board");
        if (!gameBoard) throw new Error("Game board not found");
        gameBoard.show();

        for (let col = 0; col < 6; col++) {
            let column = model.getColumn(col);

            gameBoard.getHeader(col).initFitText("vh");
            gameBoard.setHeader(col, column.category, column.fontsize);

            for (let row = 0; row < 5; row++) {
                gameBoard.setCell(row, col, column.cell[row].value);
                if (column.cell[row].q === "") gameBoard.setComplete(row, col, "false");
                else if (column.cell[row].a === "") gameBoard.setComplete(row, col, "partial");
                else gameBoard.setComplete(row, col, "true");
            }
        }
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

    menuPlus(){
        this.gameModel.increaseValue();
        this.onSave();
        this.updateView();
    }

    menuMinus(){
        this.gameModel.decreaseValue();
        this.onSave();
        this.updateView();
    }

    menuRemove(){
        this.gameModel.removeRound();
        this.updateTriangleView();
        this.onSave();
        this.updateView();
    }

    menuHome(){
        location.href = "home.html";
    }
}

module.exports = EditorPane;
},{"./Model.js":29}],26:[function(require,module,exports){
"use strict";
// see https://developers.google.com/drive/api/v3/quickstart/js?hl=en

const AbstractFiles = require("./Authenticate.js");

class FileOps extends AbstractFiles{
    constructor(){
        super();
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
                reject(error.message);
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

FileOps.filename = "Game Name.json";

module.exports = FileOps;
},{"./AbstractFile.js":24}],27:[function(require,module,exports){
"use strict";

/** View-Controller for the HTML game board element             **/
/** This is the classical "Jeopardy" type board                 **/
/** This is model agnostic, see EditorPane.js for model methods **/

const NidgetElement = require("@Thaerious/nidget").NidgetElement;
const FileOps = require("./FileOps.js");
let fileOps = new FileOps();

function headerChangeListener(event) {
    event.target.fitText.notify(1, 1);
    let col = parseInt(event.target.parentElement.getAttribute("data-col"));
    window.model.getColumn(col).category = event.target.text;
}

async function headerFocusListener(event) {
    let col = parseInt(event.target.parentElement.getAttribute("data-col"));
    event.target.text = window.model.getColumn(col).category;
    window.model.getColumn(col).fontsize = event.target.style["font-size"];
    await fileOps.setBody(window.parameters.fileId, JSON.stringify(window.model.get(), null, 2));
}

class CellSelectEvent extends  CustomEvent{
    constructor(row, col) {
        super('cell-select',
              {detail : {row : row, col : col }}
        );
    }
}

class GameBoard extends NidgetElement {
    constructor() {
        super();
        window.addEventListener("load", async ()=>{
            try {
                await fileOps.loadClient();
            } catch (err) {
                console.log(err);
            }

            this.addListeners();
        });
    }

    setModel(model){

    }

    addListeners() {
        let gameBoard = document.getElementById("game-board");
        for (let col = 0; col < 6; col++) {
            gameBoard.getHeader(col).addEventListener("input", headerChangeListener);
            gameBoard.getHeader(col).addEventListener("blur", headerFocusListener);

            for (let row = 0; row < 5; row++) {
                gameBoard.getCell(row, col).addEventListener("click", () => {
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
},{"./FileOps.js":26,"@Thaerious/nidget":22}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){
class Model {
    init(name = "Game Name") {
        this.currentRound = 0;

        this.gameModel = {
            name: name,
            rounds: []
        };

        this.addRound();
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
},{}],30:[function(require,module,exports){
const NidgetElement = require("@Thaerious/nidget").NidgetElement;

class MultipleChoicePane extends NidgetElement {

}

window.customElements.define('multiple-choice-pane', MultipleChoicePane);
module.exports = MultipleChoicePane;
},{"@Thaerious/nidget":22}],31:[function(require,module,exports){

class QuestionPane{

    /**
     * Call constructor after window has loaded
     * @param (function) savecb callback to save model
     */
    constructor() {
        this.textQuestion = document.querySelector("#text-question");
        this.textContents = this.textQuestion.querySelector(".text-contents");
        this.navBoard = document.querySelector("#show-board");
        this.navQuestion = document.querySelector("#show-question");
        this.navAnswer = document.querySelector("#show-answer");

        document.querySelector("#show-board").addEventListener("click", ()=>{
            this.hideAll();
            this.onClose();
        });

        document.querySelector("#show-question").addEventListener("click", ()=>{
            this.showQuestion();
        });

        document.querySelector("#show-answer").addEventListener("click", ()=>{
            this.showAnswer();
        });

        this.textQuestion.addEventListener("click", ()=>this.textContents.focus());

        this.textContents.addEventListener("blur", async ()=>{
           this.cell[this.status] = this.textContents.text.trim();
           await this.onSave();
        });

        this.onSave = function(){}; // set this in main to save .json model
        this.onClose = function(){}; // called when this panel is hidden.
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



},{}],32:[function(require,module,exports){

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
    scope : 'https://www.googleapis.com/auth/drive.file'
}
},{}]},{},[23])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvQWJzdHJhY3RNb2RlbC5qcyIsIi4uLy4uL25pZGdldC9zcmMvRHJhZ0hhbmRsZXIuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0ZpbGVPcGVyYXRpb25zLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9JbnRlcmZhY2VzLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9Nb3VzZVV0aWxpdGllcy5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0LmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9OaWRnZXRFbGVtZW50LmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9OaWRnZXRTdHlsZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvVHJhbnNmb3JtZXIuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvbi5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU2V0LmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b25TdGF0ZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0Q29udGFpbmVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRIVE1MSW1hZ2UuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldEltYWdlLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRUZXh0LmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtaW50ZXJmYWNlcy9EcmFnLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtaW50ZXJmYWNlcy9Ecm9wLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtaW50ZXJmYWNlcy9Nb3VzZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvTW92YWJsZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvUmVzaXplLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9wcm9qZWN0RmlsZS5qcyIsInNyYy9jbGllbnQvZWRpdG9yLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0Fic3RyYWN0RmlsZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9FZGl0b3JQYW5lLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0ZpbGVPcHMuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvR2FtZUJvYXJkLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL01lbnUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvTW9kZWwuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvTXVsdGlwbGVDaG9pY2VQYW5lLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL1F1ZXN0aW9uUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9nb29nbGVGaWVsZHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcbmNsYXNzIEFic3RyYWN0TW9kZWwge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBhYnN0cmFjdCBtb2RlbC4gIElmIGRlbGVnYXRlIGlzIHByb3ZpZGVkIHRoZW4gYWxsIGxpc3RlbmVyXG4gICAgICogYWRkcyBhbmQgbm90aWZpZXMgYXJlIHBlcmZvcm1lZCBvbiB0aGUgZGVsZWdhdGUgbGlzdGVuZXIgY29sbGVjdGlvbi5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IGRlbGVnYXRlXG4gICAgICogQHJldHVybnMge25tJF9BYnN0cmFjdE1vZGVsLkFic3RyYWN0TW9kZWx9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZGVsZWdhdGUgPSB0aGlzO1xuICAgICAgICB0aGlzLmFic3RyYWN0TW9kZWxMaXN0ZW5lcnMgPSBbXTsgICAgICAgIFxuICAgIH1cblxuICAgIGdldERlbGVnYXRlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbGVnYXRlO1xuICAgIH1cbiAgICBcbiAgICBzZXREZWxlZ2F0ZShkZWxlZ2F0ZSA9IG51bGwpe1xuICAgICAgICBpZiAoZGVsZWdhdGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5hYnN0cmFjdE1vZGVsTGlzdGVuZXJzID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlbGVnYXRlID0gZGVsZWdhdGUuZGVsZWdhdGU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLmRlbGVnYXRlID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5kZWZpbmVkIGRlbGVnYXRlXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGFkZExpc3RlbmVyKGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09IFwib2JqZWN0XCIpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBBYnN0cmFjdE1vZGVsIGxpc3RlbmVyIHR5cGU6IFwiICsgdHlwZW9mIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRlbGVnYXRlLmFic3RyYWN0TW9kZWxMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbCBhcyBub3RpZnlMaXN0ZW5lcnMobWV0aG9kTmFtZSwgW21ldGhvZEFyZ3VtZW50MCwgLi4uIG1ldGhvZEFyZ3VtZW50Tl0pXG4gICAgICogQHBhcmFtIHt0eXBlfSBtZXRob2RcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeUxpc3RlbmVycyhtZXRob2QpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJFVkVOVCBcIiArIHRoaXMuZGVsZWdhdGUuY29uc3RydWN0b3IubmFtZSArIFwiIFwiICsgbWV0aG9kKTtcblxuICAgICAgICBBcnJheS5wcm90b3R5cGUuc2hpZnQuYXBwbHkoYXJndW1lbnRzKTtcbiAgICAgICAgbGV0IGV2ZW50ID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgICBhcmdzOiBhcmd1bWVudHMsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMsXG4gICAgICAgICAgICBsaXN0ZW5lcnM6IFtdXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB3aW5kb3cubGFzdEV2ZW50ID0gZXZlbnQ7XG4gICAgICAgIHdpbmRvdy5uRXZlbnRzLnB1c2god2luZG93Lmxhc3RFdmVudCk7XG5cbiAgICAgICAgZm9yIChsZXQgbGlzdGVuZXIgb2YgdGhpcy5kZWxlZ2F0ZS5hYnN0cmFjdE1vZGVsTGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJbbWV0aG9kXSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCIgKyBcIiArIGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUgKyBcIiBcIiArIG1ldGhvZCk7XG4gICAgICAgICAgICAgICAgd2luZG93Lmxhc3RFdmVudC5saXN0ZW5lcnMucHVzaChsaXN0ZW5lci5jb25zdHJ1Y3Rvci5uYW1lKTsgICAgICAgXG4gICAgICAgICAgICAgICAgYXdhaXQgbGlzdGVuZXJbbWV0aG9kXS5hcHBseShsaXN0ZW5lciwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcltBYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lcl0pe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiICsgXCIgKyBsaXN0ZW5lci5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgKyBBYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgd2luZG93Lmxhc3RFdmVudC5saXN0ZW5lcnMucHVzaChsaXN0ZW5lci5jb25zdHJ1Y3Rvci5uYW1lKTsgICAgICAgXG4gICAgICAgICAgICAgICAgYXdhaXQgbGlzdGVuZXJbQWJzdHJhY3RNb2RlbC5kZWZhdWx0TGlzdGVuZXJdLmFwcGx5KGxpc3RlbmVyLCB3aW5kb3cubGFzdEV2ZW50KTsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbkFic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyID0gXCJuaWRnZXRMaXN0ZW5lclwiO1xud2luZG93Lm5FdmVudHMgPSBbXTtcbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RNb2RlbDsiLCIndXNlIHN0cmljdCc7XG4vKipcbiAqIFNpbmdsZXRvbiBjbGFzcyB0byBwcm92aWRpbmcgZnVuY3Rpb25hbGl0eSB0byBEcmFnTmlkZ2V0cyBhbmQgRHJvcE5pZGdldHMuXG4gKiBJdCBzdG9yZXMgdGhlIE5pZGdldCBjdXJyZW50bHkgYmVpbmcgZHJhZ2dlZC5cbiAqL1xuY2xhc3MgRHJhZ0hhbmRsZXJ7XG4gICAgXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5vdmVyID0gW107XG4gICAgfVxuICAgIFxuICAgIHB1c2hPdmVyKG5pZGdldCl7XG4gICAgICAgIGlmICh0aGlzLm92ZXJIYXMobmlkZ2V0KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLm92ZXIucHVzaChuaWRnZXQpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgcmVtb3ZlT3ZlcihuaWRnZXQpe1xuICAgICAgICBpZiAoIXRoaXMub3ZlckhhcyhuaWRnZXQpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMub3Zlci5zcGxpY2UodGhpcy5vdmVyLmluZGV4T2YobmlkZ2V0KSwgMSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gICAgXG4gICAgXG4gICAgb3ZlckhhcyhuaWRnZXQpe1xuICAgICAgICByZXR1cm4gdGhpcy5vdmVyLmluZGV4T2YobmlkZ2V0KSAhPT0gLTE7XG4gICAgfVxuICAgIFxuICAgIHNldChuaWRnZXQpe1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBuaWRnZXQ7XG4gICAgfVxuICAgIFxuICAgIGdldCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50O1xuICAgIH1cbiAgICBcbiAgICBoYXMoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudCAhPT0gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgY2xlYXIoKXtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIGdldEluc3RhbmNlKCl7XG4gICAgICAgIHJldHVybiBEcmFnSGFuZGxlci5pbnN0YW5jZTtcbiAgICB9ICAgIFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBEcmFnSGFuZGxlcigpO1xuXG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyogZ2xvYmFsIFV0aWxpdHkgKi9cbmNsYXNzIEZpbGVPcGVyYXRpb25zIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSBhIGZpbGUgKHVybCkuICBNYXAgdmFyaWFibGVzICgkey4uLn0pIHRvIFxuICAgICAqIGEgdmFsdWUuXG4gICAgICogQHBhcmFtIHt0eXBlfSB1cmxcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1hcFxuICAgICAqIEByZXR1cm5zIHtub2RlfEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50LmRvbUVsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGxvYWROaWRnZXQodXJsLCBtYXApeyAgICAgICAgXG4gICAgICAgIGxldCBlbGVtZW50ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQodXJsLCBtYXApO1xuICAgICAgICByZXR1cm4gbmV3IE5pZGdldEVsZW1lbnQoZWxlbWVudCk7XG4gICAgfSAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSBhIGZpbGUgKHVybCkuICBNYXAgdmFyaWFibGVzICgkey4uLn0pIHRvIFxuICAgICAqIGEgdmFsdWUuXG4gICAgICogQHBhcmFtIHt0eXBlfSB1cmxcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1hcFxuICAgICAqIEByZXR1cm5zIHtub2RlfEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50LmRvbUVsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGxvYWRET01FbGVtZW50KHVybCwgbWFwID0gbmV3IE1hcCgpKXsgICAgICAgIFxuICAgICAgICBpZiAobWFwIGluc3RhbmNlb2YgTWFwID09PSBmYWxzZSkgbWFwID0gRmlsZU9wZXJhdGlvbnMub2JqZWN0VG9NYXAobWFwKTsgICAgICAgXG4gICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0VVJMKHVybCk7XG4gICAgICAgIHJldHVybiBGaWxlT3BlcmF0aW9ucy5zdHJpbmdUb0RPTUVsZW1lbnQodGV4dCwgbWFwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSB0ZXh0LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gdGV4dFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgc3RyaW5nVG9ET01FbGVtZW50KHRleHQsIG1hcCA9IG5ldyBNYXAoKSl7XG4gICAgICAgIC8qIHJlcGxhY2UgdmFyaWFibGVzIHdpdGggdmFsdWVzICovXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBtYXAua2V5cygpKXsgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG1hcC5nZXQoa2V5KTtcbiAgICAgICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XT8ke2tleX1bfV1gLCBgZ2ApO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgdmFsdWUpOyAgICBcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIHJlcGxhY2UgdW5maWxsZWQgdmFyaWFibGVzIHdpdGggZW1wdHkgKi9cbiAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdW159XSpbfV1gLCBgZ2ApO1xuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCBcIlwiKTsgXG5cbiAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSB0ZXh0O1xuICAgICAgICBsZXQgZG9tRWxlbWVudCA9IG51bGw7XG4gICAgICAgIGNvbnNvbGUubG9nKGVsZW1lbnQpO1xuXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIHN0YXRpYyBvYmplY3RUb01hcChvYmplY3Qpe1xuICAgICAgICBsZXQgbWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBmb3IgKGxldCBmaWVsZCBpbiBvYmplY3QpeyAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmplY3RbZmllbGRdID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiBvYmplY3RbZmllbGRdID09PSBcIm51bWJlclwiKXtcbiAgICAgICAgICAgICAgICBtYXAuc2V0KGZpZWxkLCBvYmplY3RbZmllbGRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cblxuICAgIFxuXG4gICAgLypcbiAgICAgKiBUcmFuc2ZlciBjb250ZW50cyBvZiAnZmlsZW5hbWUnIGZyb20gc2VydmVyIHRvIGNsaWVudC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdWNjZXNzQ2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcnJvckNhbGxiYWNrXG4gICAgICogQHJldHVybnMge1N0cmluZ30gY29udGVudHMgb2YgZmlsZVxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRVUkwodXJsKSB7XG4gICAgICAgIGxldCBjYWxsYmFjayA9IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHZhciB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgICAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHhodHRwLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHhodHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwIDogeGh0dHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzIDogeGh0dHAuc3RhdHVzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0IDogeGh0dHAucmVzcG9uc2VUZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybCA6IHVybFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICB4aHR0cC5zZW5kKG51bGwpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGRvbSBlbGVtZW50IGZyb20gdGV4dC5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHRleHRcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1hcFxuICAgICAqIEByZXR1cm5zIHtub2RlfEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50LmRvbUVsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGdldEZpbGUodXJsLCBtYXAgPSBuZXcgTWFwKCkpe1xuICAgICAgICBsZXQgdGV4dCA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLmdldFVSTCh1cmwpO1xuXG4gICAgICAgIC8qIHJlcGxhY2UgdmFyaWFibGVzIHdpdGggdmFsdWVzICovXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBtYXAua2V5cygpKXtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG1hcC5nZXQoa2V5KTtcbiAgICAgICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XT8ke2tleX1bfV1gLCBgZ2ApO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogcmVwbGFjZSB1bmZpbGxlZCB2YXJpYWJsZXMgd2l0aCBlbXB0eSAqL1xuICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGBbJF1be11bXn1dKlt9XWAsIGBnYCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsIFwiXCIpO1xuXG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cblxuICAgIC8qXG4gICAgICogVHJhbnNmZXIgY29udGVudHMgb2YgJ2ZpbGVuYW1lJyBmcm9tIHNlcnZlciB0byBjbGllbnQgdXNpbmcgY3VycmVudCB3aW5kb3cgbG9jYXRpb24uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gc3VjY2Vzc0NhbGxiYWNrXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZXJyb3JDYWxsYmFja1xuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgc3RhdGljIGdldExvY2FsKGZpbGVuYW1lKSB7XG4gICAgICAgIGxldCBjYWxsYmFjayA9IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHZhciB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcbiAgICAgICAgICAgIHZhciB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZiArIFwiL1wiICsgZmlsZW5hbWU7XG5cbiAgICAgICAgICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoeGh0dHAucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGh0dHAuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh4aHR0cC5zdGF0dXMsIHhodHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICB4aHR0cC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoY2FsbGJhY2spO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBDYXVzZSAndGV4dCcgdG8gYmUgc2F2ZWQgYXMgJ2ZpbGVuYW1lJyBjbGllbnQgc2lkZS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IGZpbGVuYW1lIFRoZSBkZWZhdWx0IGZpbGVuYW1lIHRvIHNhdmUgdGhlIHRleHQgYXMuXG4gICAgICogQHBhcmFtIHt0eXBlfSB0ZXh0IFRoZSB0ZXh0IHRvIHNhdmUgdG8gZmlsZW5hbWUuXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgc2F2ZVRvRmlsZSh0ZXh0LCBmaWxlbmFtZSkge1xuICAgICAgICBsZXQgYW5jaG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBsZXQgZGF0YSA9IFwidGV4dDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpO1xuICAgICAgICBhbmNob3Iuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcImRhdGE6XCIgKyBkYXRhKTtcbiAgICAgICAgYW5jaG9yLnNldEF0dHJpYnV0ZShcImRvd25sb2FkXCIsIGZpbGVuYW1lKTtcbiAgICAgICAgYW5jaG9yLmNsaWNrKCk7XG4gICAgfVxufVxuXG5GaWxlT3BlcmF0aW9ucy5Ob2RlVHlwZSA9IHtcbiAgICBFTEVNRU5UIDogMSxcbiAgICBBVFRSSUJVVEUgOiAyLFxuICAgIFRFWFQgOiAzLCBcbiAgICBDREFUQVNFQ1RJT04gOiA0LFxuICAgIEVOVElUWVJFRkVSTkNFIDogNSxcbiAgICBFTlRJVFkgOiA2LFxuICAgIFBST0NFU1NJTkdJTlNUUlVDVElPTiA6IDcsXG4gICAgQ09NTUVOVCA6IDgsXG4gICAgRE9DVU1FTlQgOiA5LFxuICAgIERPQ1VNRU5UVFlQRSA6IDEwLFxuICAgIERPQ1VNRU5URlJBR01FTlQgOiAxMSxcbiAgICBOT1RBVElPTiA6IDEyXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcGVyYXRpb25zOyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1vdXNlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvTW91c2VcIiksIFxuICAgIGRyYWcgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9EcmFnXCIpLFxuICAgIGRyb3AgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9Ecm9wXCIpLFxuICAgIG1vdmFibGUgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9Nb3ZhYmxlXCIpLFxuICAgIHJlc2l6ZSA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL1Jlc2l6ZVwiKVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBTaW5nbHRvbiBjbGFzcyB0byBhZGQgZnVuY3Rpb25hbGl0eSB0byB0aGUgbW91c2UuXG4gKi9cbmNsYXNzIE1vdXNlVXRpbGl0aWVzIHtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudCA9IG51bGw7XG4gICAgICAgIHRoaXMubGFzdFggPSAwO1xuICAgICAgICB0aGlzLmxhc3RZID0gMDtcbiAgICB9XG4gICAgXG4gICAgaXNVbmRlcihldmVudCwgZWxlbWVudCkge1xuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WTtcbiAgICAgICAgbGV0IGN1cnJlbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuXG4gICAgICAgIHdoaWxlIChjdXJyZW50KSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudCA9PT0gZWxlbWVudCkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXRVbmRlcihldmVudCkge1xuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WTtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gICAgfVxuXG4gICAgc2V0IGVsZW1lbnQoZWxlbWVudCl7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkRWxlbWVudCAhPT0gbnVsbCl7XG4gICAgICAgICAgICB0aGlzLmRldGFjaEVsZW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVsZW1lbnQgfHwgZWxlbWVudCA9PT0gbnVsbCB8fCBlbGVtZW50ID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGhpcy5kZXRhY2hFbGVtZW50KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IGVsZW1lbnQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0YWNoZWRFbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhbiBlbGVtZW50LiAgSWYgdGhlIGVsZW1lbnQgZG9lc24ndCBoYXZlIGEgcGFyZW50IGl0IHdpbGwgYmVcbiAgICAgKiBhdHRhY2hlZCB0byB0aGUgZG9jdW1lbnQgYW5kIHdpbGwgYmUgZGV0YWNoZWQgd2hlbiBkZXRhY2hFbGVtZW50IGlzIGNhbGxlZC5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIGF0dGFjaEVsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIFxuICAgICAgICBpZiAoZWxlbWVudC5wYXJlbnQpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBhdHRhY2ggZWxlbWVudCB0byBtb3VzZSBpZiB0aGUgZWxlbWVudCBoYXMgYSBwYXJlbnQgZWxlbWVudC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQoZWxlbWVudCk7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7IFxuICAgICAgICBlbGVtZW50LnN0eWxlLnRvcCA9IGV2ZW50LmNsaWVudFkgKyBcInB4XCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IGV2ZW50LmNsaWVudFggKyBcInB4XCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9IFwibm9uZVwiO1xuICAgICAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IFwiMTAwMDBcIjtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubW92ZUNhbGxCYWNrID0gKGV2ZW50KT0+dGhpcy5vbk1vdXNlTW92ZShldmVudCk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW92ZUNhbGxCYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgbGlzdGVuZXJzIGZyb20gdGhlIGF0dGFjaGVkIGVsZW1lbnQsIGRvIG5vdCByZW1vdmUgaXQgZnJvbSB0aGVcbiAgICAgKiBkb2N1bWVudC5cbiAgICAgKiBAcmV0dXJucyB7dHlwZX1cbiAgICAgKi9cbiAgICBkZXRhY2hFbGVtZW50KCl7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkRWxlbWVudCA9PT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3ZlQ2FsbEJhY2spOyAgICAgICAgXG4gICAgICAgIGxldCBydmFsdWUgPSB0aGlzLmF0dGFjaGVkRWxlbWVudDtcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQgPSBudWxsOyAgICAgICAgXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQocnZhbHVlKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBydmFsdWU7XG4gICAgfVxuXG4gICAgb25Nb3VzZU1vdmUoZXZlbnQpIHsgICAgICAgIFxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmxhc3RYID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgdGhpcy5sYXN0WSA9IGV2ZW50LmNsaWVudFk7XG5cbiAgICAgICAgLy8gc2V0IHRoZSBlbGVtZW50J3MgbmV3IHBvc2l0aW9uOlxuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudC5zdHlsZS50b3AgPSBldmVudC5jbGllbnRZICsgXCJweFwiO1xuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudC5zdHlsZS5sZWZ0ID0gZXZlbnQuY2xpZW50WCArIFwicHhcIjtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vdXNlVXRpbGl0aWVzKCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBwcmVmaXg6IFwiZGF0YS1uaWRnZXRcIixcbiAgICBlbGVtZW50QXR0cmlidXRlOiBcImRhdGEtbmlkZ2V0LWVsZW1lbnRcIixcbiAgICBzcmNBdHRyaWJ1dGU6IFwic3JjXCIsXG4gICAgdGVtcGxhdGVTcmNBdHRyaWJ1dGU6IFwidGVtcGxhdGUtc3JjXCIsXG4gICAgbmFtZUF0dHJpYnV0ZTogXCJuYW1lXCIsXG4gICAgaW50ZXJmYWNlQXR0cmlidXRlOiBcImludGVyZmFjZXNcIixcbiAgICB0ZW1wbGF0ZUF0dHJpYnV0ZTogXCJ0ZW1wbGF0ZVwiLFxuICAgIGludGVyZmFjZURhdGFGaWVsZDogXCJpbnRlcmZhY2VEYXRhXCIsXG4gICAgbW9kZWxEYXRhRmllbGQ6IFwibW9kZWxEYXRhXCIsXG4gICAgc3R5bGVBdHRyaWJ1dGU6IFwibmlkZ2V0LXN0eWxlXCJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBGaWxlT3BlcmF0aW9ucyA9IHJlcXVpcmUoXCIuL0ZpbGVPcGVyYXRpb25zXCIpO1xuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIi4vTmlkZ2V0XCIpO1xuY29uc3QgSW50ZXJmYWNlcyA9IHJlcXVpcmUoXCIuL0ludGVyZmFjZXNcIik7XG5jb25zdCBUcmFuc2Zvcm1lciA9IHJlcXVpcmUoXCIuL1RyYW5zZm9ybWVyXCIpO1xuY29uc3QgTmlkZ2V0U3R5bGUgPSByZXF1aXJlKFwiLi9OaWRnZXRTdHlsZVwiKTtcblxuLyoqXG4gKiBBIE5pZGdldEVsZW1lbnQgaXMgYSAxOjEgY2xhc3Mtb2JqZWN0OmRvbS1vYmplY3QgcGFpcmluZy4gIEFjdGlvbnMgb24gdGhlIERPTSBcbiAqIG9iamVjdCBzaG91bGQgb25seSBiZSBjYWxsZWQgYnkgdGhlIE5pZGdldEVsZW1lbnQgb2JqZWN0LiAgVGhlIGludGVyZmFjZURhdGFcbiAqIGZpZWxkIGlzIHJlc2VydmVkIGZvciBkYXRhIGZyb20gaW50ZXJmYWNlcy4gIEludGVyZmFjZXMgc2hvdWxkIHB1dCB0aGVpciBcbiAqIGN1c3RvbSBkYXRhIHVuZGVyIFtpbnRlcmZhY2VEYXRhRmllbGRdLltpbnRlcmZhY2VOYW1lXS4gIFRoZSBpbnRlcmZhY2UgZGF0YVxuICogYXR0cmlidXRlIGlzIHNldCB3aXRoIHRoZSBzdGF0aWMgdmFsdWUgTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZC5cbiAqIFxuICogQ2FsbGluZyBtZXRob2RzIG9uIHRoZSBuaWRnZXQgd2lsbCB0cmVhdCBzaGFkb3cgY29udGVudHMgYXMgcmVndWxhciBjb250ZW50cy5cbiAqL1xuY2xhc3MgTmlkZ2V0RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgTmlkZ2V0IGFzc29jaWF0ZWQgd2l0aCAnZWxlbWVudCcuICBBbiBlcnJvciB3aWxsIGJlIHRocm93blxuICAgICAqIGlmIHRoZSAnZWxlbWVudCcgaXMgYWxyZWFkeSBhc3NvY2lhdGVkIHdpdGggYSBOaWRnZXQuXG4gICAgICogXG4gICAgICogRGlzYWJsZWQgY2xhc3MgaW5kaWNhdGVzIHRoaXMgbmlkZ2V0IHdpbGwgaWdub3JlIG1vdXNlIGV2ZW50cy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGVsZW1lbnQgSlF1ZXJ5IHNlbGVjdG9yXG4gICAgICogQHJldHVybiB7bm0kX05pZGdldC5OaWRnZXRFbGVtZW50fVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHRlbXBsYXRlSWQpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpc1tOaWRnZXQuaW50ZXJmYWNlRGF0YUZpZWxkXSA9IHt9O1xuICAgICAgICB0aGlzW05pZGdldC5tb2RlbERhdGFGaWVsZF0gPSB7fTtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1lciA9IG5ldyBUcmFuc2Zvcm1lcih0aGlzKTtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMgPSB7fTtcblxuICAgICAgICBpZiAodGVtcGxhdGVJZCl7XG4gICAgICAgICAgICB0aGlzLmFwcGx5VGVtcGxhdGUodGVtcGxhdGVJZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgICAgY29ubmVjdGVkQ2FsbGJhY2sgaXMgaW52b2tlZCBlYWNoIHRpbWUgdGhlIGN1c3RvbSBlbGVtZW50IGlzIGFwcGVuZGVkIGludG8gYSBkb2N1bWVudC1jb25uZWN0ZWQgZWxlbWVudFxuICAgICAqL1xuICAgIGFzeW5jIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICB0aGlzLnNoYWRvd0NvbnRlbnRzID0gdGhpcztcblxuICAgICAgICAvLyBzZXQgdGhlIGh0bWwgb2YgdGhpcyBlbGVtZW50IHRvIHRoZSBjb250ZW50cyBvZiB0aGUgZmlsZSAobm90IGEgc2hhZG93IGVsZW1lbnQpXG4gICAgICAgIC8vIGFsbCBkYXRhLSBhdHRyaWJ1dGVzIHdpbGwgYmUgdXNlZCB0byBmaWxsIGluICR7fSB2YXJpYWJsZXMgaW4gdGhlIHNvdXJjZSBmaWxlXG4gICAgICAgIC8vIGRvZXNuJ3Qgd29yayBvbiBlZGdlXG4gICAgICAgIGlmICh0aGlzLmhhc0F0dHJpYnV0ZShOaWRnZXQuc3JjQXR0cmlidXRlKSkgYXdhaXQgdGhpcy5yZXRyaWV2ZVNvdXJjZSh0aGlzLmRhdGFBdHRyaWJ1dGVzKCkpO1xuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoTmlkZ2V0LnRlbXBsYXRlU3JjQXR0cmlidXRlKSkgYXdhaXQgdGhpcy5yZXRyaWV2ZVRlbXBsYXRlKHRoaXMuZGF0YUF0dHJpYnV0ZXMoKSk7XG5cbiAgICAgICAgLy8gbWFuaXB1bGF0ZSAoY3NzKSBzdHlsZXMgcHJvZ3JhbW1hdGljYWxseVxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKGV2ZW50KT0+dGhpcy5vbkxvYWQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGFyZ2V0IG9mIHRoZSB3aW5kb3cgbG9hZCBldmVudC5cbiAgICAgKiBPdmVycmlkZSB0aGlzIG1ldGhvZC5cbiAgICAgKi9cbiAgICBvbkxvYWQoKXtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlIGEgbWFwIG9mIGFsbCBkYXRhIGF0dHJpYnV0ZXNcbiAgICAgKiBAcmV0dXJucyB7TWFwPGFueSwgYW55Pn1cbiAgICAgKi9cbiAgICBkYXRhQXR0cmlidXRlcygpIHtcbiAgICAgICAgbGV0IG1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgZm9yIChsZXQgYXR0ciBvZiB0aGlzLmF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIGlmIChhdHRyLm5hbWUuc3RhcnRzV2l0aChcImRhdGEtXCIpKSB7XG4gICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBhdHRyLm5hbWUuc3Vic3RyKDUpO1xuICAgICAgICAgICAgICAgIG1hcFtuYW1lXSA9IGF0dHIudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggYSBzaGFkb3cgZWxlbWVudCB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgdGVtcGxhdGUgbmFtZWQgKHRlbXBsYXRlSUQpLlxuICAgICAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBhcHBseVRlbXBsYXRlKHRlbXBsYXRlSWQpIHtcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGVtcGxhdGVJZCk7XG5cbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgdGhyb3cgbmV3IEVycm9yKFwiVGVtcGxhdGUgJ1wiICsgdGVtcGxhdGVJZCArIFwiJyBub3QgZm91bmQuXCIpO1xuICAgICAgICBpZiAodGVtcGxhdGUudGFnTmFtZS50b1VwcGVyQ2FzZSgpICE9PSBcIlRFTVBMQVRFXCIpIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgd2l0aCBpZCAnXCIgKyB0ZW1wbGF0ZUlkICsgXCInIGlzIG5vdCBhIHRlbXBsYXRlLlwiKTtcblxuICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogJ29wZW4nfSkuYXBwZW5kQ2hpbGQodGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgY29udGVudHMgb2YgZmlsZSBpbnRvIHRoaXMgZWxlbWVudC5cbiAgICAgKiBSZXBsYWNlIGFsbCAke30gdmFyaWFibGVzIHdpdGggY29udGVudHMgb2YgJ21hcCcuXG4gICAgICovXG4gICAgYXN5bmMgcmV0cmlldmVTb3VyY2UobWFwKXtcbiAgICAgICAgbGV0IHNyYyA9IHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldC5zcmNBdHRyaWJ1dGUpO1xuICAgICAgICBsZXQgdGV4dCA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLmdldEZpbGUoc3JjLCBtYXApO1xuICAgICAgICB0aGlzLmlubmVySFRNTCA9IHRleHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCBjb250ZW50cyBvZiBmaWxlIGFzIGEgdGVtcGxldGUgYW5kIGFwcGx5IHRoYXQgdGVtcGxhdGUgdG8gdGhpcyBlbGVtZW50LlxuICAgICAqIFJlcGxhY2UgYWxsICR7fSB2YXJpYWJsZXMgd2l0aCBjb250ZW50cyBvZiAnbWFwJy5cbiAgICAgKiBUaGUgdGVtcGxhdGUgd2lsbCBiZSBnaXZlbiB0aGUgaWQgZGVyaXZlZCBmcm9tIHRoZSBzcmMgYXR0cmlidXRlLlxuICAgICAqL1xuICAgIGFzeW5jIHJldHJpZXZlVGVtcGxhdGUobWFwKXtcbiAgICAgICAgbGV0IHNyYyA9IHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldC50ZW1wbGF0ZVNyY0F0dHJpYnV0ZSk7XG4gICAgICAgIGxldCBpZCA9IHNyYy5yZXBsYWNlKC9bXFwvLyAuLV0rL2csIFwiX1wiKTtcblxuICAgICAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2lkfWApKXtcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0RmlsZShzcmMsIG1hcCk7XG4gICAgICAgICAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGVtcGxhdGVcIik7XG4gICAgICAgICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSB0ZXh0O1xuICAgICAgICAgICAgdGVtcGxhdGUuc2V0QXR0cmlidXRlKFwiaWRcIiwgaWQpO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQodGVtcGxhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aWR9YCk7XG4gICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHttb2RlOiAnb3Blbid9KS5hcHBlbmRDaGlsZCh0ZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlICdoaWRkZW4nIGNsYXNzLlxuICAgICAqL1xuICAgIHNob3coKSB7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGQgJ2hpZGRlbicgY2xhc3MuXG4gICAgICovXG4gICAgaGlkZSgpIHtcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgZGlzYWJsZWQgZmxhZyB0aGF0IGlzIHJlYWQgYnkgbmlkZ2V0IG1vdXNlIGZ1bmN0aW9ucy5cbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKi9cbiAgICBzZXQgZGlzYWJsZWQodmFsdWUpe1xuICAgICAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiZGF0YS1kaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1kaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGRpc2FibGVkIGZsYWcgdGhhdCBpcyByZWFkIGJ5IG5pZGdldCBtb3VzZSBmdW5jdGlvbnMuXG4gICAgICogQHBhcmFtIHZhbHVlXG4gICAgICovXG4gICAgZ2V0IGRpc2FibGVkKCl7XG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRyaWJ1dGUoXCJkYXRhLWRpc2FibGVkXCIpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtZGlzYWJsZWRcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhpcyBlbGVtZW50IHdhcyB1bmRlciB0aGUgbW91c2UgZm9yIHRoZSBldmVudC5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IGV2ZW50XG4gICAgICogQHBhcmFtIHt0eXBlfSBlbGVtZW50XG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBpc1VuZGVyTW91c2UoZXZlbnQpIHtcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYO1xuICAgICAgICBsZXQgeSA9IGV2ZW50LmNsaWVudFk7XG4gICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcblxuICAgICAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnQgPT09IHRoaXMpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVuIHRoZSBxdWVyeSBzZWxlY3RvciBvbiB0aGlzIGVsZW1lbnQuXG4gICAgICogSWYgdGhpcyBlbGVtZW50IGhhcyBhIHNoYWRvdywgcnVuIGl0IG9uIHRoYXQgaW5zdGVhZC5cbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50VGFnTmFtZU1hcFtLXX1cbiAgICAgKi9cbiAgIHF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzKSB7XG4gICAgICAgIGlmICh0aGlzLnNoYWRvd1Jvb3Qpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVuIHRoZSBxdWVyeSBzZWxlY3RvciBvbiB0aGlzIGVsZW1lbnQuXG4gICAgICogSWYgdGhpcyBlbGVtZW50IGhhcyBhIHNoYWRvdywgcnVuIGl0IG9uIHRoYXQgaW5zdGVhZC5cbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JzXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50VGFnTmFtZU1hcFtLXX1cbiAgICAgKi9cbiAgICBxdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycykge1xuICAgICAgICBpZiAodGhpcy5zaGFkb3dSb290KXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSB0aGlzIGVsZW1lbnQgZnJvbSBpdCdzIHBhcmVudC5cbiAgICAgKi9cbiAgICBkZXRhY2goKXtcbiAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluZGV4IHdpdGhpbiB0aGUgcGFyZW50IGVsZW1lbnQuXG4gICAgICovXG4gICAgaW5kZXgoKXtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5wYXJlbnRFbGVtZW50LmNoaWxkcmVuKS5pbmRleE9mKHRoaXMpO1xuICAgIH1cbn1cblxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWVsZW1lbnQnLCBOaWRnZXRFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0RWxlbWVudDsiLCIndXNlIHN0cmljdCc7XG4vKipcbiAqIE1hbmlwdWxhdGVzIHRoZSBlbGVtZW50cyBzdHlsZSB3aXRoIGpzIHJvdXRpbmVzIGFjY29yZGluZyB0byBjc3MgZmxhZ3MuXG4gKiBOaWRnZXQgc3R5bGUgaXMgYXBwbGllZCB0byBhbGwgbmlkZ2V0LWVsZW1lbnRzIHVubGVzcyB0aGV5IGhhdmUgdGhlIG5pZGdldC1zdHlsZVxuICogYXR0cmlidXRlIHNldCB0byAnZmFsc2UnLlxuICovXG5cbmNsYXNzIE5pZGdldFN0eWxlIHtcblxuICAgIGNvbnN0cnVjdG9yKG5pZGdldCkge1xuICAgICAgICB0aGlzLm5pZGdldCA9IG5pZGdldDtcbiAgICAgICAgdGhpcy5hcHBseSgpO1xuICAgIH1cbiAgICBcbiAgICBhcHBseSgpIHtcbiAgICAgICAgdGhpcy5uaWRnZXRXaWR0aFJhdGlvKCk7XG4gICAgICAgIHRoaXMubmlkZ2V0SGVpZ2h0UmF0aW8oKTtcbiAgICAgICAgdGhpcy5uaWRnZXRGaXRUZXh0KCk7XG4gICAgICAgIHRoaXMubmlkZ2V0Rml0VGV4dFdpZHRoKCk7XG4gICAgICAgIHRoaXMubmlkZ2V0VmVydEFsaWduVGV4dCgpO1xuICAgIH1cbiAgICBcbiAgICBuaWRnZXRXaWR0aFJhdGlvKCkge1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtd2lkdGgtcmF0aW9cIik7XG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjsgICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4geyAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5uaWRnZXQud2lkdGggPSB0aGlzLm5pZGdldC5oZWlnaHQgKiByYXRpbztcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7ICAgICAgXG4gICAgfVxuICAgIFxuICAgIG5pZGdldEhlaWdodFJhdGlvKCkge1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtaGVpZ2h0LXJhdGlvXCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47ICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHsgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LmhlaWdodCA9IHRoaXMubmlkZ2V0LndpZHRoICogcmF0aW87XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbGwgdGhlIHRleHQgaGVpZ2h0IHRvIG1hdGNoIHRoZSBlbGVtZW50IGhlaWdodC5cbiAgICAgKiBDaGFuZ2UgdGhlIHJhdGlvIHZhbHVlIChvciB0aGUgZm9udFNpemUpIGFkanVzdC5cbiAgICAgKi9cbiAgICBuaWRnZXRGaXRUZXh0KCkge1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtZml0LXRleHRcIik7ICAgICAgICBcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xuXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgLS1uaWRnZXQtZml0LXRleHQgJHtyYXRpb31gKVxuICAgICAgICAgICAgbGV0IGggPSB0aGlzLm5pZGdldC5vZmZzZXRIZWlnaHQgKiByYXRpbztcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gaCArIFwicHhcIjtcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7ICAgICAgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIFdpbGwgY2hhbmdlIHRoZSBmb250IHNpemUgc28gdGhhdCB0aGUgdGV4dCBmaXQncyBpbiB0aGUgcGFyZW50IGVsZW1lbnQuXG4gICAgICogIERvbid0IHNldCB0aGUgd2lkdGggb2YgdGhlIGVsZW1lbnQuXG4gICAgICovXG4gICAgbmlkZ2V0Rml0VGV4dFdpZHRoKCkge1xuICAgICAgICBsZXQgcmVtb3ZlID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0LXdpZHRoXCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmVtb3ZlKSkgcmV0dXJuO1xuXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50XG5cbiAgICAgICAgICAgIGxldCB0ZXh0VyA9IHRoaXMubmlkZ2V0LnNjcm9sbFdpZHRoO1xuICAgICAgICAgICAgbGV0IGNvbnRXID0gdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgIGNvbnRXID0gY29udFcgLSByZW1vdmU7XG4gICAgICAgICAgICBsZXQgZHcgPSBjb250Vy90ZXh0VztcbiAgICAgICAgICAgIGxldCBjb21wdXRlZEZvbnRTaXplID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQtc2l6ZScpXG4gICAgICAgICAgICBjb21wdXRlZEZvbnRTaXplID0gcGFyc2VJbnQoY29tcHV0ZWRGb250U2l6ZSk7XG4gICAgICAgICAgICBjb21wdXRlZEZvbnRTaXplID0gTWF0aC5yb3VuZChjb21wdXRlZEZvbnRTaXplKTtcbiAgICAgICAgICAgIGxldCBuZXdGb250U2l6ZSA9IE1hdGgucm91bmQoY29tcHV0ZWRGb250U2l6ZSAqIGR3KTtcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5uaWRnZXQub2Zmc2V0SGVpZ2h0XG5cbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhjb21wdXRlZEZvbnRTaXplIC0gbmV3Rm9udFNpemUpIDw9IDIpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKG5ld0ZvbnRTaXplID4gaCkgbmV3Rm9udFNpemUgPSBoO1xuXG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IG5ld0ZvbnRTaXplICsgXCJweFwiO1xuICAgICAgICB9KS5vYnNlcnZlKHRoaXMubmlkZ2V0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGxpbmUgaGVpZ2h0IHRvIHRoZSBvZmZzZXQgaGVpZ2h0IG11bHRpcGxpZWQgYnkgcmF0aW8uXG4gICAgICovXG4gICAgbmlkZ2V0VmVydEFsaWduVGV4dCgpe1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtdmVydC1hbGlnbi10ZXh0XCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XG5cbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5uaWRnZXQub2Zmc2V0SGVpZ2h0ICogcmF0aW87XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5saW5lSGVpZ2h0ID0gaCArIFwicHhcIjtcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldFN0eWxlOyIsIid1c2Ugc3RyaWN0JztcbmNsYXNzIFRyYW5zZm9ybXtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSl7XG4gICAgICAgIGxldCBpbmRleE9mID0gdmFsdWUuaW5kZXhPZihcIihcIik7XG4gICAgICAgIHRoaXMubmFtZSA9IHZhbHVlLnN1YnN0cmluZygwLCBpbmRleE9mKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlLnN1YnN0cmluZyh0aGlzLm5hbWUubGVuZ3RoICsgMSwgdmFsdWUubGVuZ3RoIC0gMSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiLCBcIiArIHRoaXMudmFsdWUpO1xuICAgIH1cbiAgICBcbiAgICB0b1N0cmluZygpe1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lICsgXCIoXCIgKyB0aGlzLnZhbHVlICsgXCIpXCI7XG4gICAgfSAgICBcbn1cblxuY2xhc3MgVHJhbnNmb3JtZXIge1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cbiAgICBcbiAgICBhcHBlbmQoKXtcbiAgICAgICAgbGV0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmVsZW1lbnQpW1widHJhbnNmb3JtXCJdO1xuICAgICAgICBpZiAoY29tcHV0ZWRTdHlsZSAhPT0gXCJub25lXCIpIHRoaXMucHVzaChjb21wdXRlZFN0eWxlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIGNsZWFyKCl7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBcIlwiO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgdW5zaGlmdCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSB2YWx1ZSArIFwiIFwiICsgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybTtcbiAgICB9XG4gICAgXG4gICAgcHVzaCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtICsgXCIgXCIgKyB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSAgICBcbiAgICBcbiAgICBzaGlmdCgpe1xuICAgICAgICBsZXQgYXJyYXkgPSB0aGlzLnNwbGl0KCk7XG4gICAgICAgIGlmIChhcnJheS5sZW5ndGggPT09IDApIHJldHVybiBcIlwiO1xuICAgICAgICBhcnJheS5zaGlmdCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBwb3AoKXtcbiAgICAgICAgbGV0IGFycmF5ID0gdGhpcy5zcGxpdCgpO1xuICAgICAgICBpZiAoYXJyYXkubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcbiAgICAgICAgYXJyYXkucG9wKCk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBhcnJheS5qb2luKFwiIFwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7ICAgICAgXG4gICAgfVxuICAgIFxuICAgIHJlcGxhY2UodmFsdWUpe1xuICAgICAgICBsZXQgbmV3VHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybSh2YWx1ZSk7XG4gICAgICAgIGxldCBhcnJheSA9IHRoaXMuc3BsaXQoKTtcbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGVudHJ5ID0gYXJyYXlbaV07XG4gICAgICAgICAgICBsZXQgdHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybShlbnRyeSk7XG4gICAgICAgICAgICBpZiAodHJhbnNmb3JtLm5hbWUgPT09IG5ld1RyYW5zZm9ybS5uYW1lKXtcbiAgICAgICAgICAgICAgICBhcnJheVtpXSA9IG5ld1RyYW5zZm9ybS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBhcnJheS5qb2luKFwiIFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgc3BsaXQoKXtcbiAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybTtcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcbiAgICAgICAgbGV0IHJ2YWx1ZSA9IFtdO1xuICAgICAgICBsZXQgbGFzdCA9ICcnO1xuICAgICAgICBsZXQgc2tpcCA9IGZhbHNlO1xuICAgICAgICBsZXQgbmVzdGVkUCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGlmICghc2tpcCAmJiB2YWx1ZVtpXSA9PT0gJyAnICYmIGxhc3QgPT09ICcgJyl7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFza2lwICYmIHZhbHVlW2ldID09PSAnICcpIHtcbiAgICAgICAgICAgICAgICBydmFsdWUucHVzaCh2YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIGkpKTtcbiAgICAgICAgICAgICAgICBzdGFydCA9IGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlW2ldID09PSAnKCcpIHtcbiAgICAgICAgICAgICAgICBuZXN0ZWRQKys7XG4gICAgICAgICAgICAgICAgc2tpcCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlW2ldID09PSAnKScpIHtcbiAgICAgICAgICAgICAgICBuZXN0ZWRQLS07XG4gICAgICAgICAgICAgICAgaWYgKG5lc3RlZFAgPT09IDApIHNraXAgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhc3QgPSB2YWx1ZVtpXTtcbiAgICAgICAgfVxuICAgICAgICBydmFsdWUucHVzaCh2YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIHZhbHVlLmxlbmd0aCkpO1xuICAgICAgICByZXR1cm4gcnZhbHVlO1xuICAgIH1cbiAgICBcbiAgICB0b1N0cmluZygpe1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhbnNmb3JtZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBOaWRnZXQgdGhhdCBjaGFuZ2VzIHRoZSBpbWFnZSBmb3IgaG92ZXIsIGRpc2FibGVkLCBwcmVzcywgYW5kIGlkbGUuXG4gKiBGaXJlcyBhIGNsaWNrIGV2ZW50IHdoZW4gY2xpY2tlZC5cbiAqXG4gKiBXaWxsIHNldCB0aGUgY3VycmVudCBzdGF0ZSBhcyBkYXRhLXN0YXRlIHNvIHRoYXQgY3NzIGNhbiBhY2Nlc3MgaXQuXG4gKi9cbmNsYXNzIE5pZGdldEJ1dHRvbiBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgICAgIHRoaXMuYWxwaGFUb2xlcmFuY2UgPSAwOyAvLyBhbHBoYSBuZWVkcyB0byBiZSA+IHRvbGVyYW5jZSB0byB0cmlnZ2VyIGV2ZW50cy5cblxuICAgICAgICB0aGlzLnN0cmluZ0hvdmVyID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdIT1ZFUiddXCI7XG4gICAgICAgIHRoaXMuc3RyaW5nRGlzYWJsZWQgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J0RJU0FCTEVEJ11cIjtcbiAgICAgICAgdGhpcy5zdHJpbmdQcmVzcyA9IFwibmlkZ2V0LWJ1dHRvbi1zdGF0ZVtzdGF0ZT0nUFJFU1MnXVwiO1xuICAgICAgICB0aGlzLnN0cmluZ0lkbGUgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J0lETEUnXVwiO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcImlkbGVcIjtcbiAgICB9XG5cbiAgICBpc0luU2V0KCkge1xuICAgICAgICBsZXQgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICAgICAgICB3aGlsZSAocGFyZW50ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChwYXJlbnQudGFnTmFtZSA9PT0gXCJOSURHRVQtQlVUVE9OLVNFVFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbmlkZ2V0UmVhZHkoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nRGlzYWJsZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSWRsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlzSW5TZXQoKSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgdGhpcy5tb3VzZUVudGVyKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlTGVhdmUpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZVByZXNzKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlUmVsZWFzZSk7XG5cbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5kaXNhYmxlZCkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBpc1VuZGVyKGV2ZW50KSB7XG4gICAgICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LmVsZW1lbnRzRnJvbVBvaW50KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuICAgICAgICBpZiAoZWxlbWVudHMuaW5kZXhPZih0aGlzLmFjdGl2ZU5pZGdldCkgPT0gLTEpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuYWN0aXZlTmlkZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFggLSByZWN0Lng7XG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WSAtIHJlY3QueTtcblxuICAgICAgICByZXR1cm4gdGhpcy50ZXN0QWxwaGEoeCwgeSk7XG4gICAgfVxuXG4gICAgZ2V0IGRpc2FibGVkKCkge1xuICAgICAgICByZXR1cm4gc3VwZXIuZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgc2V0IGRpc2FibGVkKHZhbHVlKSB7XG4gICAgICAgIHN1cGVyLmRpc2FibGVkID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nRGlzYWJsZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiaW5cIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0hvdmVyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwicHJlc3NcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ1ByZXNzO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSWRsZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3VzZVJlbGVhc2UoZSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XG4gICAgfVxuXG4gICAgbW91c2VQcmVzcyhlKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBcInByZXNzXCI7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdQcmVzcztcbiAgICB9XG5cbiAgICBoaWRlQWxsSW1hZ2VzKCkge1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdIb3ZlcikuaGlkZSgpO1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdEaXNhYmxlZCkuaGlkZSgpO1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdQcmVzcykuaGlkZSgpO1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdJZGxlKS5oaWRlKCk7XG4gICAgfVxuXG4gICAgc2V0IGFjdGl2ZU5pZGdldChzZWxlY3Rvcikge1xuICAgICAgICB0aGlzLmhpZGVBbGxJbWFnZXMoKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlTmlkZ2V0ID0gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlTmlkZ2V0LnNob3coKTtcbiAgICB9XG5cbiAgICBnZXQgYWN0aXZlTmlkZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlTmlkZ2V0O1xuICAgIH1cblxuICAgIHNldCBzdGF0ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcImRhdGEtc3RhdGVcIiwgdmFsdWUpO1xuICAgIH1cblxuICAgIGdldCBzdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiKTtcbiAgICB9XG5cbiAgICB0ZXN0QWxwaGEoeCwgeSkge1xuICAgICAgICBsZXQgcGl4ZWwgPSB0aGlzLmFjdGl2ZU5pZGdldC5nZXRQaXhlbCh4LCB5KTtcbiAgICAgICAgcmV0dXJuIHBpeGVsWzNdID4gdGhpcy5hbHBoYVRvbGVyYW5jZTtcbiAgICB9XG5cbiAgICBtb3VzZUxlYXZlKCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJvdXRcIjtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgfVxuXG4gICAgbW91c2VBY3RpdmUoKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBcImhvdmVyXCI7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcbiAgICB9XG5cbiAgICBtb3VzZU1vdmUoZSkge1xuICAgICAgICBpZiAoIXRoaXMudGVzdEFscGhhKGUuY2xpZW50WCwgZS5jbGllbnRZKSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcbiAgICAgICAgfVxuICAgIH1cbn1cbjtcblxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWJ1dHRvbicsIE5pZGdldEJ1dHRvbik7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEJ1dHRvbjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcclxuXHJcbmNsYXNzIE5pZGdldEJ1dHRvblNldCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcclxuICAgICAgICB0aGlzLmFscGhhVG9sZXJhbmNlID0gMDsgLy8gYWxwaGEgbmVlZHMgdG8gYmUgPiB0b2xlcmFuY2UgdG8gdHJpZ2dlciBldmVudHMuXHJcblxyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlUHJlc3MpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVJlbGVhc2UpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZSk7XHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlTGVhdmUpO1xyXG5cclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBuaWRnZXRSZWFkeSgpe1xyXG4gICAgICAgIHRoaXMuYnV0dG9ucyA9IHRoaXMucXVlcnlTZWxlY3RvckFsbChcIm5pZGdldC1idXR0b25cIik7XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VQcmVzcyhlKXtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlUHJlc3MoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcInByZXNzXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VSZWxlYXNlKGUpe1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5idXR0b25zKSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzVW5kZXIoZSkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXRlID09IFwicHJlc3NcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcImJ1dHRvbi1jbGlja2VkXCIsIHtkZXRhaWw6IGVsZW1lbnR9KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlUmVsZWFzZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZU1vdmUoZSl7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpe1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlQWN0aXZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZUxlYXZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VMZWF2ZShlKXtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBlbGVtZW50Lm1vdXNlTGVhdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldCBzdGF0ZSh2YWx1ZSl7XHJcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIsIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc3RhdGUoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtYnV0dG9uLXNldCcsIE5pZGdldEJ1dHRvblNldCk7XHJcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0QnV0dG9uU2V0OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBOaWRnZXQgdGhhdCBjaGFuZ2VzIHRoZSBpbWFnZSBmb3IgaG92ZXIsIGRpc2FibGVkLCBwcmVzcywgYW5kIGlkbGUuXG4gKiBGaXJlcyBhIGNsaWNrIGV2ZW50IHdoZW4gY2xpY2tlZC5cbiAqIFxuICogVGhpcyBpcyB0aGUgaHRtbCBlbGVtZW50IFwibmlkZ2V0LWJ1dHRvblwiLlxuICogSWYgdGhlIG5pZGdldC1idXR0b24gaGFzIHRoZSBhdHRyaWJ1dGUgYGltZy1wcmVmaXggPSBcInByZWZpeFwiYCB0aGVuIHRoZSBcbiAqIGZvbGxvd2luZyBpbWFnZXMuICBgaW1nLXN1ZmZpeGAgPSBcInN1ZmZpeFwiIHdpbGwgb3ZlcnJpZGUgdGhlIFwiLnBuZ1wiLlxuICogd2lsbCBiZSB1c2VkOlxuICogLSBwcmVmaXgtaG92ZXIucG5nXG4gKiAtIHByZWZpeC1kaXNhYmxlZC5wbmdcbiAqIC0gcHJlZml4LXByZXNzLnBuZ1xuICogLSBwcmVmaXgtaWRsZS5wbmdcbiAqL1xuY2xhc3MgTmlkZ2V0QnV0dG9uU3RhdGUgZXh0ZW5kcyBOaWRnZXQge1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgbmlkZ2V0UmVhZHkoKXtcbiAgICAgICAgdGhpcy5pbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICB0aGlzLmltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdGhpcy5nZXRBdHRyaWJ1dGUoXCJpbWFnZS1zcmNcIikpO1xuICAgICAgICB0aGlzLmFwcGVuZCh0aGlzLmltZyk7XG4gICAgfVxuXG4gICAgc2hvdygpe1xuICAgICAgICBzdXBlci5zaG93KCk7XG4gICAgICAgIHRoaXMubG9hZENhbnZhcygpO1xuICAgIH1cblxuICAgIGxvYWRDYW52YXMoKXtcbiAgICAgICAgaWYgKCF0aGlzLmltZyB8fCB0aGlzLmNhbnZhcykgcmV0dXJuO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuaW1nLm5hdHVyYWxXaWR0aDtcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5pbWcubmF0dXJhbEhlaWdodDtcbiAgICAgICAgdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXM7XG4gICAgfVxuXG4gICAgZ2V0UGl4ZWwoeCwgeSl7XG4gICAgICAgIHRoaXMubG9hZENhbnZhcygpO1xuICAgICAgICBsZXQgZHggPSB0aGlzLmNhbnZhcy53aWR0aCAvIHRoaXMub2Zmc2V0V2lkdGg7XG4gICAgICAgIGxldCBkeSA9IHRoaXMuY2FudmFzLmhlaWdodCAvIHRoaXMub2Zmc2V0SGVpZ2h0O1xuICAgICAgICBsZXQgcGl4ZWwgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLmdldEltYWdlRGF0YShkeCAqIHgsIGR5ICogeSwgMSwgMSkuZGF0YTtcbiAgICAgICAgcmV0dXJuIHBpeGVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBzdGF0ZSB0byBIT1ZFUiwgRElTQUJMRUQsIFBSRVNTLCBJRExFLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gc3RhdGVcbiAgICAgKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgc2V0IHN0YXRlKHN0YXRlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwic3RhdGVcIiwgc3RhdGUudG9VcHBlckNhc2UoKSk7XG4gICAgfVxuXG4gICAgZ2V0IHN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyaWJ1dGUoXCJzdGF0ZVwiKTtcbiAgICB9XG5cbiAgICBzZXQgc291cmNlKGltZykge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInNyY1wiLCBpbWcpO1xuICAgIH1cblxuICAgIGdldCBzb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHJpYnV0ZShcInNyY1wiKTtcbiAgICB9XG59XG47XG5cbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1idXR0b24tc3RhdGUnLCBOaWRnZXRCdXR0b25TdGF0ZSk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEJ1dHRvblN0YXRlO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyoqXG4gKiBBIGNvbXBvbmVudCB0aGF0IGhhcyBldmVudHMgZm9yIGFkZGluZyBuaWRnZXRzLCByZW1vdmluZyBuaWRnZXRzLCBhbmQgXG4gKiByZXNpemluZyB0aGUgY29udGFpbmVyLiAgV2hlbiB0aGUgY29udGFpbmVyIHNpemUgaXMgY2hhbmdlZCwgdGhlIG51bWJlclxuICogb2YgY29tcG9uZW50cyBjaGFuZ2UsIG9yIHRoZSBsYXlvdXQgYXR0cmlidXRlIGNoYW5nZXMsIHRoZSBkb0xheW91dCBmdW5jdGlvblxuICogaXMgY2FsbGVkLlxuICogXG4gKiBUaGUgY29tcG9uZW50cyBhcmUgYXJyYWdlZCBhY2NvcmRpbmcgdG8gdGhlIHNlbGVjdGVkIGxheW91dCBhdHRyaWJ1dGUuICBJZiBcbiAqIG5vIGxheW91dCBhdHRyaWJ1dGUgaXMgY2hvc2VuLCBkb0xheW91dCBpcyBzdGlsbCBjYWxsZWQgYXMgaXQgaXMgYXNzdW1lZCBcbiAqIGEgY3VzdG9tIGZ1bmN0aW9uIGhhcyBiZWVuIHByb3ZpZGVkLlxuICovXG5cbmNsYXNzIE5pZGdldENvbnRhaW5lciBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgICAgICBsZXQgcmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIodGhpcy5kb0xheW91dCk7XG4gICAgICAgIHJlc2l6ZU9ic2VydmVyLm9ic2VydmUodGhpcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiBbTmlkZ2V0Q29udGFpbmVyLmxheW91dEF0dHJpYnV0ZV07XG4gICAgfVxuXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKG5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgICBpZiAob2xkVmFsdWUgPT09IG5ld1ZhbHVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuZG9MYXlvdXQoKTtcbiAgICB9XG5cbiAgICBzZXQgbGF5b3V0KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKE5pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgbGF5b3V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0Q29udGFpbmVyLmxheW91dEF0dHJpYnV0ZSk7XG4gICAgfSAgICAgIFxuXG4gICAgZG9MYXlvdXQoKSB7XG4gICAgICAgIGlmICghdGhpcy5sYXlvdXQpIHJldHVybjtcbiAgICAgICAgaWYgKCFMYXlvdXRzW3RoaXMubGF5b3V0XSkgdGhyb3cgYGludmFsaWQgbGF5b3V0OiAke3RoaXMubGF5b3V0fWA7XG4gICAgICAgIExheW91dHNbdGhpcy5sYXlvdXRdO1xuICAgIH1cbn1cblxuY2xhc3MgTGF5b3V0cyB7XG4gICAgLyoqXG4gICAgICogRml0IGFsbCBuaWRnZXRzIGV2ZW5seSBpbiBhIGhvcml6b250YWwgcm93LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gbmlkZ2V0XG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHN0YXRpYyByb3cobmlkZ2V0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2l6ZSk7XG4gICAgfVxufVxuXG5cbk5pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGUgPSBcImxheW91dFwiO1xud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWNvbnRhaW5lcicsIE5pZGdldENvbnRhaW5lcik7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldENvbnRhaW5lcjsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRcIik7XG5jb25zdCBUcmFuc2Zvcm1lciA9IHJlcXVpcmUoXCIuLi9UcmFuc2Zvcm1lclwiKTtcblxuLyoqXG4gKiBEb24ndCBmb3JnZXQgdG8gc2V0ICdpcycgd2hlbiBwdXR0aW5nIGVsZW1lbnQgZGlyZWN0bHkgaW4gaHRtbCBhcyBvcHBvc2VkIHRvXG4gKiBwcm9ncmFtaWNhbGx5LlxuICogPGltZyBpcz1cInJlZ2lzdGVyZWQtbmFtZVwiIHNyYz1cImltYWdlLnBuZ1wiPjwvaW1nPlxuICogXG4gKiBpbmNsdWRlIGEgY3VzdG9tIGVsZW1lbnQgZGVmaW5pdGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBjbGFzcy48YnI+XG4gKiB3aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdyZWdpc3RlcmVkLW5hbWUnLCBDbGFzcywge2V4dGVuZHM6IFwiaW1nXCJ9KTtcbiAqL1xuY2xhc3MgTmlkZ2V0SFRNTEltYWdlIGV4dGVuZHMgSFRNTEltYWdlRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubGFzdERpc3BsYXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtZXIodGhpcyk7XG4gICAgfVxuXG4gICAgc2NhbGUoZHcsIGRoKSB7XG4gICAgICAgIGlmICghZGgpIGRoID0gZHc7XG4gICAgICAgIGxldCB3ID0gdGhpcy53aWR0aCAqIGR3O1xuICAgICAgICBsZXQgaCA9IHRoaXMuaGVpZ2h0ICogZGg7XG4gICAgICAgIHRoaXMud2lkdGggPSB3O1xuICAgICAgICB0aGlzLmhlaWdodCA9IGg7XG4gICAgfSAgICAgICAgXG5cbiAgICBzZXQgc3JjKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwic3JjXCIsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgc3JjKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJzcmNcIik7XG4gICAgfVxuXG4gICAgbG9jYXRlKGxlZnQsIHRvcCkge1xuICAgICAgICB0aGlzLmxlZnQgPSBsZWZ0O1xuICAgICAgICB0aGlzLnRvcCA9IHRvcDtcbiAgICB9XG5cbiAgICBnZXQgbGVmdCgpIHtcbiAgICAgICAgbGV0IHcgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5sZWZ0O1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh3KTtcbiAgICB9XG5cbiAgICBnZXQgdG9wKCkge1xuICAgICAgICBsZXQgaCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMpLnRvcDtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaCk7XG4gICAgfVxuXG4gICAgc2V0IGxlZnQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5zdHlsZS5sZWZ0ID0gdmFsdWUgKyBcInB4XCI7XG4gICAgfVxuXG4gICAgc2V0IHRvcCh2YWx1ZSkge1xuICAgICAgICB0aGlzLnN0eWxlLnRvcCA9IHZhbHVlICsgXCJweFwiO1xuICAgIH0gICAgXG5cbiAgICBzZXQgd2lkdGgodykge1xuICAgICAgICB0aGlzLnN0eWxlLndpZHRoID0gdyArIFwicHhcIjtcbiAgICB9XG5cbiAgICBzZXQgaGVpZ2h0KHcpIHtcbiAgICAgICAgdGhpcy5zdHlsZS5oZWlnaHQgPSB3ICsgXCJweFwiO1xuICAgIH1cblxuICAgIGdldCB3aWR0aCgpIHtcbiAgICAgICAgbGV0IHcgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS53aWR0aDtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodyk7XG4gICAgfVxuXG4gICAgZ2V0IGhlaWdodCgpIHtcbiAgICAgICAgbGV0IGggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5oZWlnaHQ7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGgpO1xuICAgIH0gICAgICAgIFxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgaWYgKHRoaXMubGFzdERpc3BsYXkpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IHRoaXMubGFzdERpc3BsYXk7XG4gICAgICAgICAgICB0aGlzLmxhc3REaXNwbGF5ID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhpZGUoKSB7XG4gICAgICAgIHRoaXMubGFzdERpc3BsYXkgPSB0aGlzLnN0eWxlLmRpc3BsYXk7XG4gICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIH1cblxuICAgIHNldCBkaXNwbGF5KHZhbHVlKXtcbiAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gdmFsdWU7XG4gICAgfVxuICAgIFxuICAgIGdldCBkaXNwbGF5KCl7XG4gICAgICAgIHJldHVybiB3aW5kb3cuY2FsY3VsYXRlU3R5bGUodGhpcylbXCJkaXNwbGF5XCJdO1xuICAgIH1cblxuICAgIGRldGFjaCgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHRoaXMpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHNldCBkaXNhYmxlZCh2YWx1ZSl7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBkaXNhYmxlZCgpe1xuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0cmlidXRlKFwiZGlzYWJsZWRcIikpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIik7XG4gICAgfSAgICBcbiAgICBcbiAgICBjbGVhclBvcygpe1xuICAgICAgICB0aGlzLnN0eWxlLnRvcCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3R5bGUubGVmdCA9IG51bGw7XG4gICAgfVxuXG4gICAgY2xlYXJEaW1zKCl7XG4gICAgICAgIHRoaXMuc3R5bGUud2lkdGggPSBudWxsO1xuICAgICAgICB0aGlzLnN0eWxlLmhlaWdodCA9IG51bGw7XG4gICAgfSAgICBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRIVE1MSW1hZ2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyoqXG4gKiBBIE5pZGdldCB0aGF0IGNvbnRhaW5zIGltYWdlcy5cbiAqL1xuY2xhc3MgTmlkZ2V0SW1hZ2UgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKHNyYyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgaWYgKHNyYykgdGhpcy5zcmMgPSBzcmM7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKXtcbiAgICAgICAgbGV0IHNyYyA9IHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldEltYWdlLnNyY0F0dHJpYnV0ZSk7ICAgICAgICBcbiAgICAgICAgaWYgKHNyYykgdGhpcy5pbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIHNyYyk7ICAgICAgIFxuICAgICAgICB0aGlzLmFwcGVuZENoaWxkKHRoaXMuaW1nKTtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBnZXQgc3JjKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmltZy5nZXRBdHRyaWJ1dGUoXCJzcmNcIik7XG4gICAgfVxuXG4gICAgc2V0IHNyYyh2YWx1ZSl7XG4gICAgICAgIHRoaXMuaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2l6ZSh3aWR0aCwgaGVpZ2h0KXtcbiAgICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IHdpZHRoXG4gICAgICAgIHRoaXMuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgICAgIHRoaXMuaW1nLnN0eWxlLndpZHRoID0gd2lkdGhcbiAgICAgICAgdGhpcy5pbWcuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgfVxuICAgIFxuICAgIHNjYWxlKGR3LCBkaCl7XG4gICAgICAgIGlmICghZGgpIGRoID0gZHc7XG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMub2Zmc2V0V2lkdGggKiBkdztcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMub2Zmc2V0SGVpZ2h0ICogZGg7XG4gICAgICAgIHRoaXMuc2l6ZShgJHt3aWR0aH1weGAsIGAke2hlaWdodH1weGApO1xuICAgIH1cbiAgICBcbiAgICBzaG93KCl7XG4gICAgICAgIGlmICh0aGlzLnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiKXtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnN0eWxlLmRpc3BsYXk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaGlkZSgpe1xuICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG59XG5cbk5pZGdldEltYWdlLnNyY0F0dHJpYnV0ZSA9IFwic3JjXCI7XG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtaW1hZ2UnLCBOaWRnZXRJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEltYWdlOyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIFdoZW4gdXNpbmcgLS1uaWRnZXQtZml0LXRleHQsIGRvIG5vdCBpbmNsdWRlIGhlaWdodCBhbmQgd2lkdGggYXR0cmlidXRlcy5cbiAqIEEgZm9udCBzaXplIGNhbiBiZSB1c2VkIGFzIGEgc3RhcnRpbmcgcG9pbnQuXG4gKi9cbmNsYXNzIEZpdFRleHQge1xuICAgIGNvbnN0cnVjdG9yKG5pZGdldCl7XG4gICAgICAgIHRoaXMubmlkZ2V0ID0gbmlkZ2V0O1xuICAgICAgICB0aGlzLmxvY2sgPSBcIm5vbmVcIjtcbiAgICAgICAgdGhpcy5wYXJzZUFyZ3VtZW50cygpO1xuICAgIH1cblxuICAgIGxpc3Rlbigpe1xuICAgICAgICB0aGlzLm9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpPT50aGlzLmRlbGF5UmVzaXplKHRoaXMuaFZhbHVlLCB0aGlzLndWYWx1ZSkpO1xuICAgICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUodGhpcy5uaWRnZXQucGFyZW50RWxlbWVudCk7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcbiAgICAgICAgdGhpcy5kZWxheSA9IDI1O1xuICAgICAgICB0aGlzLmRlbGF5UmVzaXplKHRoaXMuaFZhbHVlLCB0aGlzLndWYWx1ZSk7XG4gICAgICAgIHRoaXMuc3RvcCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGRlbGF5UmVzaXplKGhWYWx1ZSwgd1ZhbHVlKXtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAwO1xuICAgICAgICBpZiAodGhpcy50aW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+dGhpcy5vblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSksIHRoaXMuZGVsYXkpO1xuICAgIH1cblxuICAgIG5vdGlmeShoVmFsdWUsIHdWYWx1ZSl7XG4gICAgICAgIHRoaXMuc3RvcCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRlbGF5UmVzaXplKGhWYWx1ZSwgd1ZhbHVlKTtcbiAgICB9XG5cbiAgICBwYXJzZUFyZ3VtZW50cygpe1xuICAgICAgICBsZXQgYXJncyA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1maXQtdGV4dFwiKTtcblxuICAgICAgICBpZiAoIWFyZ3MgfHwgYXJncyA9PT0gZmFsc2UgfHwgYXJncyA9PT0gXCJmYWxzZVwiKXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaFZhbHVlID0gdGhpcy53VmFsdWUgPSB0cnVlO1xuXG4gICAgICAgIGlmICh0eXBlb2YoYXJncykgPT0gXCJzdHJpbmdcIil7XG4gICAgICAgICAgICBsZXQgb2JqID0gSlNPTi5wYXJzZShhcmdzKTtcbiAgICAgICAgICAgIGlmIChvYmpbXCJmaXRcIl0gIT09IHVuZGVmaW5lZCAmJiBvYmpbXCJmaXRcIl0gPT09IFwid2lkdGhcIikgdGhpcy5oVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChvYmpbXCJmaXRcIl0gIT09IHVuZGVmaW5lZCAmJiBvYmpbXCJmaXRcIl0gPT09IFwiaGVpZ2h0XCIpIHRoaXMud1ZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAob2JqW1wibG9ja1wiXSAhPT0gdW5kZWZpbmVkKSB0aGlzLmxvY2sgPSAob2JqW1wibG9ja1wiXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSl7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnRpbWVvdXQ7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RvcCkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5uaWRnZXQudGV4dENvbnRlbnQgPT09IFwiXCIpIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0ID09PSAwKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldFdpZHRoID09PSAwKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLm5pZGdldC5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIikgcmV0dXJuO1xuXG4gICAgICAgIGlmICghaFZhbHVlICYmICF3VmFsdWUpIHJldHVybjtcblxuICAgICAgICBsZXQgaERpciA9IHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0IC0gdGhpcy5uaWRnZXQuc2Nyb2xsSGVpZ2h0O1xuICAgICAgICBsZXQgd0RpciA9IHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLSB0aGlzLm5pZGdldC5zY3JvbGxXaWR0aDtcblxuICAgICAgICBpZiAoIWhWYWx1ZSkgaERpciA9IDA7XG4gICAgICAgIGlmICghd1ZhbHVlKSB3RGlyID0gMDtcblxuICAgICAgICBsZXQgZGlyID0gTWF0aC5zaWduKGhEaXIgfCB3RGlyKTsgLy8gd2lsbCBwcmVmZXIgdG8gc2hyaW5rXG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gMCkgdGhpcy5kaXJlY3Rpb24gPSBkaXI7IC8vIGtlZXAgcHJldmlvdXMgZGlyZWN0aW9uXG5cbiAgICAgICAgbGV0IGZvbnRTaXplID0gcGFyc2VJbnQoZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldClbXCJmb250LXNpemVcIl0pXG4gICAgICAgIGxldCBuZXdTaXplID0gZm9udFNpemUgKyAodGhpcy5kaXJlY3Rpb24pO1xuXG4gICAgICAgIGlmIChuZXdTaXplICE9PSBmb250U2l6ZSAmJiB0aGlzLmRpcmVjdGlvbiA9PT0gZGlyKSB7XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IG5ld1NpemUgKyBcInB4XCI7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PnRoaXMub25SZXNpemUoaFZhbHVlLCB3VmFsdWUpLCB0aGlzLmRlbGF5KTtcbiAgICAgICAgfSBlbHNlIGlmIChkaXIgPCAwICYmIHRoaXMuZGlyZWN0aW9uID4gMCkgeyAvLyByZXZlcnNlIGRpcmVjdGlvbiBpZiBncm93aW5nIHRvbyBsYXJnZVxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAtMTtcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PnRoaXMub25SZXNpemUoaFZhbHVlLCB3VmFsdWUpLCB0aGlzLmRlbGF5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2sgPT09IFwidmhcIikge1xuICAgICAgICAgICAgICAgIGxldCBmb250UmF0aW8gPSBuZXdTaXplIC8gd2luZG93LmlubmVySGVpZ2h0ICogMTAwO1xuICAgICAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gZm9udFJhdGlvICsgXCJ2aFwiO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMubG9jayA9PT0gXCJ2d1wiKXtcbiAgICAgICAgICAgICAgICBsZXQgZm9udFJhdGlvID0gbmV3U2l6ZSAvIHdpbmRvdy5pbm5lcldpZHRoICogMTAwO1xuICAgICAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gZm9udFJhdGlvICsgXCJ2d1wiO1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQSBuaWRnZXQgZWxlbWVudCBmb3IgZGlzcGxheWluZyB0ZXh0LlxuICogcHV0ICctLW5pZGdldC1maXQtdGV4dDogMS4wOycgaW50byBjc3MgZm9yIHRoaXMgZWxlbWVudCB0byBlbmFibGUgc2NhbGluZy5cbiAqIHNlZTogTmlkZ2V0U3R5bGUuanNcbiAqL1xuY2xhc3MgTmlkZ2V0VGV4dCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzW1wiZml0LXRleHQtd2lkdGgtdG9sZXJhbmNlXCJdID0gMC4wMjtcbiAgICB9XG5cbiAgICByZW1vdmUoKXtcbiAgICAgICAgaWYgKHRoaXMuZml0VGV4dCkge1xuICAgICAgICAgICAgdGhpcy5maXRUZXh0LnN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5maXRUZXh0Lm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlci5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBzZXQgdGV4dCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuaW5uZXJUZXh0ID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLmZpdFRleHQgJiYgdGhpcy5maXRUZXh0LnN0b3AgPT09IGZhbHNlKXtcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dC5kZWxheVJlc2l6ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHRleHQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5uZXJUZXh0O1xuICAgIH1cblxuICAgIHNjYWxlKGFtb3VudCkge1xuICAgICAgICBsZXQgc3R5bGVGb250U2l6ZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoXCJmb250LXNpemVcIik7XG4gICAgICAgIGxldCBmb250U2l6ZSA9IHBhcnNlRmxvYXQoc3R5bGVGb250U2l6ZSk7XG4gICAgICAgIHRoaXMuc3R5bGUuZm9udFNpemUgPSAoZm9udFNpemUgKiBhbW91bnQpICsgXCJweFwiO1xuICAgIH1cblxuICAgIGFwcGx5U3R5bGUoKSB7XG4gICAgICAgIHN1cGVyLmFwcGx5U3R5bGUoKTtcblxuICAgICAgICB0aGlzLmluaXRGaXRUZXh0KCk7XG4gICAgICAgIGxldCBmaXRQcm9wID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtZml0LXRleHRcIik7XG5cbiAgICAgICAgaWYgKGZpdFByb3AgIT09IHVuZGVmaW5lZCAmJiBmaXRQcm9wICE9PSBcIlwiKXtcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dC5saXN0ZW4oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbiBjYWxsIG11bHRpcGxlIHRpbWVzIHRvIGNoYW5nZSB0aGUgbG9jayB2YWx1ZS5cbiAgICAgKiBAcGFyYW0gKHN0cmluZykgbG9jayB2aCA9IGxvY2sgdG8gdmlldyBoZWlnaHQsIHZ3ID0gbG9jayB0byB2aWV3IHdpZHRoXG4gICAgICovXG4gICAgaW5pdEZpdFRleHQobG9jayl7XG4gICAgICAgIGlmICghdGhpcy5maXRUZXh0KXtcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dCA9IG5ldyBGaXRUZXh0KHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsb2NrKSB0aGlzLmZpdFRleHQubG9jayA9IGxvY2s7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBsaW5lIGhlaWdodCB0byB0aGUgb2Zmc2V0IGhlaWdodCBtdWx0aXBsaWVkIGJ5IHJhdGlvLlxuICAgICAqIENhbGxpbmcgdGhpcyBtZXRob2QgZGlyZWN0b3J5IHdpbGwgb3ZlcnJpZGUgdGhlIHZhbHVlIHNldCBieSBjc3NcbiAgICAgKi9cbiAgICBuaWRnZXRWZXJ0QWxpZ25UZXh0KHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tbmlkZ2V0LXZlcnQtYWxpZ24tdGV4dFwiLCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb25SZXNpemUgPSAoKSA9PiB7XG4gICAgICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC12ZXJ0LWFsaWduLXRleHRcIik7XG4gICAgICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XG4gICAgICAgICAgICBsZXQgaCA9IHRoaXMub2Zmc2V0SGVpZ2h0ICogcmF0aW87XG4gICAgICAgICAgICB0aGlzLnN0eWxlLmxpbmVIZWlnaHQgPSBoICsgXCJweFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZXJzLnZlcnRBbGlnblRleHQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMudmVydEFsaWduVGV4dCA9IG5ldyBSZXNpemVPYnNlcnZlcihvblJlc2l6ZSk7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy52ZXJ0QWxpZ25UZXh0Lm9ic2VydmUodGhpcylcbiAgICAgICAgfVxuICAgICAgICBvblJlc2l6ZSgpXG4gICAgfVxuXG4gICAgdmVydEFsaWduVGV4dChyYXRpbyA9IDEuMCl7XG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjtcbiAgICAgICAgbGV0IGggPSB0aGlzLm9mZnNldEhlaWdodCAqIHJhdGlvO1xuICAgICAgICB0aGlzLnN0eWxlLmxpbmVIZWlnaHQgPSBoICsgXCJweFwiO1xuICAgIH1cbn1cbjtcblxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LXRleHQnLCBOaWRnZXRUZXh0KTtcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0VGV4dDsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IGRyYWdIYW5kbGVyID0gcmVxdWlyZShcIi4uL0RyYWdIYW5kbGVyXCIpLmluc3RhbmNlO1xuXG5cbmZ1bmN0aW9uIG9uRHJhZ1N0YXJ0KGV2ZW50KXsgICAgXG4gICAgZHJhZ0hhbmRsZXIuc2V0KHRoaXMpO1xuICAgIHdpbmRvdy54ID0gdGhpcztcbiAgICBjb25zb2xlLmxvZyhcIidcIiArIHRoaXMubmFtZSgpICsgXCInXCIpO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ1N0YXJ0XCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbkRyYWdFbmQoZXZlbnQpe1xuICAgIGlmIChkcmFnSGFuZGxlci5nZXQoKSAhPT0gdGhpcykgcmV0dXJuO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ0VuZFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbiAgICBkcmFnSGFuZGxlci5jbGVhcigpO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLnNldEF0dHJpYnV0ZShcImRyYWdnYWJsZVwiLCBcInRydWVcIik7ICAgXG4gICAgXG4gICAgbmlkZ2V0Lm9uRHJhZ1N0YXJ0ID0gb25EcmFnU3RhcnQuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbkRyYWdFbmQgPSBvbkRyYWdFbmQuYmluZChuaWRnZXQpO1xuICAgIFxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCBuaWRnZXQub25EcmFnU3RhcnQpO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbmRcIiwgbmlkZ2V0Lm9uRHJhZ0VuZCk7ICAgIFxufTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IGRyYWdIYW5kbGVyID0gcmVxdWlyZShcIi4uL0RyYWdIYW5kbGVyXCIpLmluc3RhbmNlO1xuY29uc3QgTW91c2VVdGlsaXRpZXMgPSByZXF1aXJlKFwiLi4vTW91c2VVdGlsaXRpZXNcIik7XG5cbmZ1bmN0aW9uIG9uRHJhZ092ZXIoZXZlbnQpe1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgbGV0IGRyYWdOaWRnZXQgPSBkcmFnSGFuZGxlci5nZXQoKTtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdPdmVyXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMsIGRyYWdOaWRnZXQpO1xufVxuXG5mdW5jdGlvbiBvbkRyYWdFbnRlcihldmVudCl7XG4gICAgaWYgKCFkcmFnSGFuZGxlci5oYXMoKSkgcmV0dXJuO1xuICAgIGlmICghZHJhZ0hhbmRsZXIucHVzaE92ZXIodGhpcykpIHJldHVybjtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdFbnRlclwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25EcmFnTGVhdmUoZXZlbnQpe1xuICAgIGlmICghZHJhZ0hhbmRsZXIuaGFzKCkpIHJldHVybjtcbiAgICBpZiAoTW91c2VVdGlsaXRpZXMuaXNVbmRlcih0aGlzLmdldEVsZW1lbnQoKSkpIHJldHVybjtcbiAgICBpZiAoIWRyYWdIYW5kbGVyLnJlbW92ZU92ZXIodGhpcykpIHJldHVybjtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdMZWF2ZVwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25Ecm9wKGV2ZW50KXtcbiAgICBsZXQgZHJhZ05pZGdldCA9IGRyYWdIYW5kbGVyLmdldCgpO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJvcFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzLCBkcmFnTmlkZ2V0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIG5pZGdldC5vbkRyYWdPdmVyID0gb25EcmFnT3Zlci5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uRHJvcCA9IG9uRHJvcC5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uRHJhZ0VudGVyID0gb25EcmFnRW50ZXIuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbkRyYWdMZWF2ZSA9IG9uRHJhZ0xlYXZlLmJpbmQobmlkZ2V0KTtcbiAgICBcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBuaWRnZXQub25EcmFnT3Zlcik7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJvcFwiLCBuaWRnZXQub25Ecm9wKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW50ZXJcIiwgbmlkZ2V0Lm9uRHJhZ0VudGVyKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnbGVhdmVcIiwgbmlkZ2V0Lm9uRHJhZ0xlYXZlKTsgICAgXG59OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTW91c2VVdGlsaXRpZXMgPSByZXF1aXJlKFwiLi4vTW91c2VVdGlsaXRpZXNcIik7XG5cbmZ1bmN0aW9uIG9uQ2xpY2soZXZlbnQpeyAgICBcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImNsaWNrXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlRG93bihldmVudCl7ICAgIFxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VEb3duXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlVXAoZXZlbnQpeyAgICBcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcIm1vdXNlVXBcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VFbnRlcihldmVudCl7ICAgIFxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VFbnRlclwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZUxlYXZlKGV2ZW50KXtcbiAgICBpZiAoTW91c2VVdGlsaXRpZXMuaXNVbmRlcih0aGlzLmdldEVsZW1lbnQoKSkpIHJldHVybjtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcIm1vdXNlRXhpdFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIGNvbnNvbGUubG9nKFwibW91c2Ugc2V0dXBcIik7XG4gICAgXG4gICAgbmlkZ2V0Lm9uQ2xpY2sgPSBvbkNsaWNrLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Nb3VzZURvd24gPSBvbk1vdXNlRG93bi5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uTW91c2VVcCA9IG9uTW91c2VVcC5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uTW91c2VFbnRlciA9IG9uTW91c2VFbnRlci5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uTW91c2VMZWF2ZSA9IG9uTW91c2VMZWF2ZS5iaW5kKG5pZGdldCk7XG4gICAgXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgbmlkZ2V0Lm9uQ2xpY2spO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBuaWRnZXQub25Nb3VzZURvd24pO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgbmlkZ2V0Lm9uTW91c2VVcCk7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCBuaWRnZXQub25Nb3VzZUVudGVyKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCBuaWRnZXQub25Nb3VzZUxlYXZlKTtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBFbmFibGUgdGhlIG5pZGdldCB0byBiZSBtb3ZlZCBieSBkcmFnZ2luZy4gIFdpbGwgZHJhZyBieSBhbnkgY2hpbGQgZWxlZW1lbnRcbiAqIHRoZSAnLm5pZGdldC1oZWFkZXInIGNsYXNzLCBvdGhlcndpc2UgbW92YWJsZSBieSBjbGlja2luZyBhbnl3aGVyZS5cbiAqIEBwYXJhbSB7dHlwZX0gZVxuICogQHJldHVybiB7dW5kZWZpbmVkfVxuICovXG5cbmZ1bmN0aW9uIG9uTW91c2VNb3ZlKGUpeyAgICBcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKCF0aGlzLl9fbW92YWJsZS5hY3RpdmUpIHJldHVybjsgICAgXG5cbiAgICAvLyBjYWxjdWxhdGUgdGhlIG5ldyBjdXJzb3IgcG9zaXRpb246XG4gICAgbGV0IGRlbHRhWCA9IHRoaXMuX19tb3ZhYmxlLmxhc3RYIC0gZS5jbGllbnRYO1xuICAgIGxldCBkZWx0YVkgPSB0aGlzLl9fbW92YWJsZS5sYXN0WSAtIGUuY2xpZW50WTtcbiAgICB0aGlzLl9fbW92YWJsZS5sYXN0WCA9IGUuY2xpZW50WDtcbiAgICB0aGlzLl9fbW92YWJsZS5sYXN0WSA9IGUuY2xpZW50WTtcbiAgICBcbiAgICAvLyBzZXQgdGhlIGVsZW1lbnQncyBuZXcgcG9zaXRpb246XG4gICAgdGhpcy5zdHlsZS50b3AgPSAodGhpcy5vZmZzZXRUb3AgLSBkZWx0YVkpICsgXCJweFwiO1xuICAgIHRoaXMuc3R5bGUubGVmdCA9ICh0aGlzLm9mZnNldExlZnQgLSBkZWx0YVgpICsgXCJweFwiO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlRG93bihlKXtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5fX21vdmFibGUuYWN0aXZlID0gdHJ1ZTtcbiAgICBcbiAgICAvLyBnZXQgdGhlIG1vdXNlIGN1cnNvciBwb3NpdGlvbiBhdCBzdGFydHVwOlxuICAgIHRoaXMuX19tb3ZhYmxlLmxhc3RYID0gZS5jbGllbnRYO1xuICAgIHRoaXMuX19tb3ZhYmxlLmxhc3RZID0gZS5jbGllbnRZO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlVXAoZSl7XG4gICAgdGhpcy5fX21vdmFibGUuYWN0aXZlID0gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBuaWRnZXQuX19tb3ZhYmxlID0ge1xuICAgICAgICBsYXN0WCA6IDAsXG4gICAgICAgIGxhc3RZIDogMCxcbiAgICAgICAgYWN0aXZlIDogZmFsc2VcbiAgICB9O1xuICAgIFxuICAgIG5pZGdldC5vbk1vdXNlRG93biA9IG9uTW91c2VEb3duLmJpbmQobmlkZ2V0KTsgICAgICAgIFxuICAgIFxuICAgIGlmIChuaWRnZXQucXVlcnlTZWxlY3RvcihcIi5uaWRnZXQtaGVhZGVyXCIpKXtcbiAgICAgICAgbmlkZ2V0LnF1ZXJ5U2VsZWN0b3IoXCIubmlkZ2V0LWhlYWRlclwiKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIG5pZGdldC5vbk1vdXNlRG93bik7ICAgICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgICBuaWRnZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBuaWRnZXQub25Nb3VzZURvd24pO1xuICAgIH1cbiAgICBcbiAgICBuaWRnZXQub25Nb3VzZU1vdmUgPSBvbk1vdXNlTW92ZS5iaW5kKG5pZGdldCk7ICAgIFxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG5pZGdldC5vbk1vdXNlTW92ZSk7XG5cbiAgICBuaWRnZXQub25Nb3VzZVVwID0gb25Nb3VzZVVwLmJpbmQobmlkZ2V0KTsgICAgXG4gICAgbmlkZ2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG5pZGdldC5vbk1vdXNlVXApO1xuXG59OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIi4uL05pZGdldFwiKTtcbndpbmRvdy5OaWRnZXQgPSBOaWRnZXQ7XG5cbi8qKlxuICogQWRkIGEgcmVzaXplIG9ic2VydmVyIHRvIHRoZSBlbGVtZW50IHRoYXQgd2lsbCBjYWxsIGEgb25SZXNpemUoKSBmdW5jdGlvbi5cbiAqIFRoZSBwYXJhbWV0ZXJzIHBhc3NlZCBpbiBhcmUgKHByZXZpb3VzX2RpbWVuc2lvbnMpLiAgVG8gdXNlIGFkZFxuICogaW50ZXJmYWNlcz1cInJlc2l6ZVwiIHRvIHRoZSBlbGVtZW50IGluIGh0bWwgYW5kIGEgbWV0aG9kIG9uUmVzaXplKCkgdG8gdGhlIFxuICogY2xhc3Mgb2JqZWN0LiAgSWYgdGhlcmUgaXMgbm8gY2xhc3Mgb2JqZWN0IGNyZWF0ZSBhIGZ1bmN0aW9uIGFuZCBiaW5kIGl0LlxuICogaWU6IGVsZW1lbnQub25SZXNpemUgPSBmdW5jdGlvbi5iaW5kKGVsZW1lbnQpOyBcbiAqL1xuXG5sZXQgb25SZXNpemUgPSBmdW5jdGlvbigpe1xuICAgIGxldCBkYXRhID0gdGhpc1tOaWRnZXQuaW50ZXJmYWNlRGF0YUZpZWxkXS5yZXNpemU7XG4gICAgbGV0IHByZXYgPSBkYXRhLnByZXY7XG4gICAgaWYgKCF0aGlzLm9uUmVzaXplKSByZXR1cm47XG4gICAgdGhpcy5vblJlc2l6ZShwcmV2KTtcbiAgICBsb2FkUHJldmlvdXModGhpcyk7XG59O1xuXG5sZXQgbG9hZFByZXZpb3VzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBsZXQgZGF0YSA9IG5pZGdldFtOaWRnZXQuaW50ZXJmYWNlRGF0YUZpZWxkXS5yZXNpemU7XG4gICAgZGF0YS5wcmV2ID0ge1xuICAgICAgICB3aWR0aCA6IG5pZGdldC5vZmZzZXRXaWR0aCxcbiAgICAgICAgaGVpZ2h0IDogbmlkZ2V0Lm9mZnNldEhlaWdodFxuICAgIH07ICAgIFxufTtcblxuLyoqXG4gKiBTZXR1cCBhIHJlc2l6ZSBvYnNlcnZlciBmb3IgdGhlIG5pZGdldCB0aGF0IHRyaWdnZXJzIHRoZSBvblJlc2l6ZSBtZXRob2QgaWYgXG4gKiBhdmFpbGFibGUuXG4gKiAtIG9uUmVzaXplKHRoaXMsIHByZXZpb3VzX2RpbWVuc2lvbnMpIDogbm9uZVxuICogQHBhcmFtIHt0eXBlfSBuaWRnZXRcbiAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIGlmICh0eXBlb2YobmlkZ2V0KSAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IFwiT2JqZWN0IGV4ZWN0ZWRcIjtcbiAgICBsZXQgcmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUuYmluZChuaWRnZXQpKTtcbiAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKG5pZGdldCk7XG4gICAgbG9hZFByZXZpb3VzKG5pZGdldCk7XG59OyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIEFic3RyYWN0TW9kZWwgOiByZXF1aXJlKFwiLi9BYnN0cmFjdE1vZGVsXCIpLFxuICAgIE5pZGdldEVsZW1lbnQgOiByZXF1aXJlKFwiLi9OaWRnZXRFbGVtZW50XCIpLFxuICAgIEZpbGVPcGVyYXRpb25zIDogcmVxdWlyZShcIi4vRmlsZU9wZXJhdGlvbnNcIiksXG4gICAgTmlkZ2V0QnV0dG9uU2V0IDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU2V0XCIpLFxuICAgIE5pZGdldEJ1dHRvbiA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblwiKSxcbiAgICBOaWRnZXRCdXR0b25TdGF0ZSA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblN0YXRlXCIpLFxuICAgIE5pZGdldEltYWdlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SW1hZ2VcIiksXG4gICAgTmlkZ2V0SFRNTEltYWdlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SFRNTEltYWdlXCIpLFxuICAgIE5pZGdldFRleHQgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRUZXh0XCIpLFxuICAgIE5pZGdldENvbnRhaW5lciA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldENvbnRhaW5lclwiKSxcbiAgICBNb3VzZVV0aWxpdGllcyA6IHJlcXVpcmUoXCIuL01vdXNlVXRpbGl0aWVzXCIpLFxuICAgIENvbnN0YW50czogcmVxdWlyZShcIi4vTmlkZ2V0XCIpLFxuICAgIGxheW91dHM6IHt9XG59OyIsImNvbnN0IEZpbGVPcHMgPSByZXF1aXJlKFwiLi9tb2R1bGVzL0ZpbGVPcHMuanNcIik7XHJcbmNvbnN0IE1lbnUgPSByZXF1aXJlKFwiLi9tb2R1bGVzL01lbnUuanNcIik7XHJcbmNvbnN0IFF1ZXN0aW9uUGFuZSA9IHJlcXVpcmUoXCIuL21vZHVsZXMvUXVlc3Rpb25QYW5lLmpzXCIpO1xyXG5jb25zdCBFZGl0b3JQYW5lID0gcmVxdWlyZShcIi4vbW9kdWxlcy9FZGl0b3JQYW5lLmpzXCIpO1xyXG5jb25zdCBNb2RlbCA9IHJlcXVpcmUoXCIuL21vZHVsZXMvTW9kZWxcIik7XHJcblxyXG5yZXF1aXJlKFwiQHRoYWVyaW91cy9uaWRnZXRcIilcclxucmVxdWlyZShcIi4vbW9kdWxlcy9HYW1lQm9hcmQuanNcIik7XHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvTXVsdGlwbGVDaG9pY2VQYW5lLmpzXCIpO1xyXG5cclxubGV0IGZpbGVPcHMgPSBuZXcgRmlsZU9wcygpO1xyXG5sZXQgbW9kZWwgPSBudWxsO1xyXG5sZXQgcXVlc3Rpb25QYW5lID0gbnVsbDtcclxubGV0IGVkaXRvclBhbmUgPSBudWxsO1xyXG5cclxud2luZG93Lm9ubG9hZCA9IGFzeW5jICgpID0+IHtcclxuICAgIG5ldyBNZW51KCkuaW5pdChcIiNtZW51XCIpO1xyXG4gICAgcGFyc2VVUkxQYXJhbWV0ZXJzKCk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBmaWxlT3BzLmxvYWRDbGllbnQoKTtcclxuICAgICAgICBxdWVzdGlvblBhbmUgPSBuZXcgUXVlc3Rpb25QYW5lKCk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh3aW5kb3cucGFyYW1ldGVycy5hY3Rpb24gPT09IFwibG9hZFwiKSB7XHJcbiAgICAgICAgbGV0IGZpbGUgPSBhd2FpdCBmaWxlT3BzLmdldCh3aW5kb3cucGFyYW1ldGVycy5maWxlSWQpO1xyXG4gICAgICAgIGxldCBtb2RlbCA9IEpTT04ucGFyc2UoZmlsZS5ib2R5KTtcclxuICAgICAgICB3aW5kb3cubW9kZWwgPSBtb2RlbCA9IG5ldyBNb2RlbChmaWxlT3BzKS5zZXQobW9kZWwpO1xyXG4gICAgfVxyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1uYW1lXCIpLnRleHRDb250ZW50ID0gd2luZG93Lm1vZGVsLm5hbWU7XHJcbiAgICBlZGl0b3JQYW5lID0gbmV3IEVkaXRvclBhbmUod2luZG93Lm1vZGVsKTtcclxuICAgIGVkaXRvclBhbmUub25TYXZlID0gc2F2ZU1vZGVsO1xyXG4gICAgcXVlc3Rpb25QYW5lLm9uU2F2ZSA9IHNhdmVNb2RlbDtcclxuICAgIHF1ZXN0aW9uUGFuZS5vbkNsb3NlID0gKCkgPT4gZWRpdG9yUGFuZS51cGRhdGVWaWV3KCk7XHJcbiAgICBlZGl0b3JQYW5lLnVwZGF0ZU5hbWUgPSByZW5hbWVNb2RlbDtcclxuICAgIGVkaXRvclBhbmUudXBkYXRlVmlldygpO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJnYW1lLWJvYXJkXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjZWxsLXNlbGVjdFwiLCAoZXZlbnQpPT57XHJcbiAgICAgICAgbGV0IHJvdyA9IGV2ZW50LmRldGFpbC5yb3c7XHJcbiAgICAgICAgbGV0IGNvbCA9IGV2ZW50LmRldGFpbC5jb2w7XHJcbiAgICAgICAgcXVlc3Rpb25QYW5lLnNob3dRdWVzdGlvbih3aW5kb3cubW9kZWwuZ2V0Q2VsbChyb3csIGNvbCkpO1xyXG4gICAgICAgIGVkaXRvclBhbmUuaGlkZUFsbCgpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNhdmVNb2RlbCgpIHtcclxuICAgIGZpbGVPcHMuc2V0Qm9keSh3aW5kb3cucGFyYW1ldGVycy5maWxlSWQsIEpTT04uc3RyaW5naWZ5KHdpbmRvdy5tb2RlbC5nZXQoKSwgbnVsbCwgMikpO1xyXG59XHJcblxyXG5mdW5jdGlvbiByZW5hbWVNb2RlbCgpIHtcclxuICAgIGxldCBuYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lLW5hbWVcIikudGV4dENvbnRlbnQ7XHJcbiAgICBmaWxlT3BzLnJlbmFtZSh3aW5kb3cucGFyYW1ldGVycy5maWxlSWQsIG5hbWUgKyBcIi5qc29uXCIpO1xyXG4gICAgd2luZG93Lm1vZGVsLm5hbWUgPSBuYW1lO1xyXG4gICAgc2F2ZU1vZGVsKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlVVJMUGFyYW1ldGVycygpIHtcclxuICAgIHdpbmRvdy5wYXJhbWV0ZXJzID0ge307XHJcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSkuc3BsaXQoXCImXCIpO1xyXG4gICAgZm9yIChjb25zdCBwYXJhbWV0ZXIgb2YgcGFyYW1ldGVycykge1xyXG4gICAgICAgIGNvbnN0IHNwbGl0ID0gcGFyYW1ldGVyLnNwbGl0KC89Lyk7XHJcbiAgICAgICAgd2luZG93LnBhcmFtZXRlcnNbc3BsaXRbMF1dID0gc3BsaXRbMV0gPz8gXCJcIjtcclxuICAgIH1cclxufSIsIi8vIHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9kcml2ZS9hcGkvdjMvcXVpY2tzdGFydC9qcz9obD1lblxyXG5cclxuY2xhc3MgQWJzdHJhY3RGaWxlIHtcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCByZXF1aXJlKFwiLi9nb29nbGVGaWVsZHMuanNcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDbGllbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmxvYWQoJ2NsaWVudDphdXRoMicsICgpPT50aGlzLl9faW5pdENsaWVudChyZXNvbHZlLCByZWplY3QpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBfX2luaXRDbGllbnQocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgZ2FwaS5jbGllbnQuaW5pdCh7XHJcbiAgICAgICAgICAgIGFwaUtleTogdGhpcy5kZXZlbG9wZXJLZXksXHJcbiAgICAgICAgICAgIGNsaWVudElkOiB0aGlzLmNsaWVudElkLFxyXG4gICAgICAgICAgICBkaXNjb3ZlcnlEb2NzOiB0aGlzLmRpc2NvdmVyeURvY3MsXHJcbiAgICAgICAgICAgIHNjb3BlOiB0aGlzLnNjb3BlXHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RGaWxlOyIsImNvbnN0IE1vZGVsID0gcmVxdWlyZShcIi4vTW9kZWwuanNcIik7XHJcblxyXG5jbGFzcyBFZGl0b3JQYW5le1xyXG4gICAgY29uc3RydWN0b3IoZ2FtZU1vZGVsKSB7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwgPSBnYW1lTW9kZWw7XHJcbiAgICAgICAgdGhpcy50cmlhbmdsZVJpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0cmlhbmdsZS1yaWdodFwiKTtcclxuICAgICAgICB0aGlzLnRyaWFuZ2xlTGVmdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdHJpYW5nbGUtbGVmdFwiKTtcclxuICAgICAgICB0aGlzLnJvdW5kTGFiZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JvdW5kLW51bWJlclwiKTtcclxuICAgICAgICB0aGlzLmdhbWVOYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lLW5hbWVcIik7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlVHJpYW5nbGVWaWV3KCk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1hZGQtY2F0ZWdvcnlcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU1vZGVsLmFkZENhdGVnb3J5Um91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVUcmlhbmdsZVZpZXcoKTtcclxuICAgICAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LWFkZC1tdWx0aXBsZS1jaG9pY2VcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZU1vZGVsLmFkZE11bHRpcGxlQ2hvaWNlUm91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVUcmlhbmdsZVZpZXcoKTtcclxuICAgICAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LXJlbW92ZS1yb3VuZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMubWVudVJlbW92ZSgpKTtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtaG9tZS1zY3JlZW5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLm1lbnVIb21lKCkpO1xyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS12YWx1ZS1wbHVzXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy5tZW51UGx1cygpKTtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtdmFsdWUtbWludXNcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLm1lbnVNaW51cygpKTtcclxuXHJcbiAgICAgICAgdGhpcy50cmlhbmdsZVJpZ2h0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+IHRoaXMubmV4dFJvdW5kKCkpO1xyXG4gICAgICAgIHRoaXMudHJpYW5nbGVMZWZ0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+IHRoaXMucHJldlJvdW5kKCkpO1xyXG4gICAgICAgIC8vIHRoaXMuZ2FtZU5hbWUuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgKCk9PiB0aGlzLnVwZGF0ZU5hbWUoKSk7XHJcbiAgICAgICAgdGhpcy5nYW1lTmFtZS5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpPT50aGlzLmlucHV0TmFtZShldmVudCkpO1xyXG5cclxuICAgICAgICB0aGlzLm9uU2F2ZSA9IGZ1bmN0aW9uKCl7fTsgLy8gc2V0IHRoaXMgaW4gbWFpbiB0byBzYXZlIC5qc29uIG1vZGVsXHJcbiAgICAgICAgdGhpcy51cGRhdGVOYW1lID0gZnVuY3Rpb24oKXt9OyAvLyBjYWxsZWQgdG8gY2hhbmdlIHRoZSBmaWxlIG5hbWVcclxuICAgIH1cclxuXHJcbiAgICBpbnB1dE5hbWUoZXZlbnQpe1xyXG4gICAgICAgIHdpbmRvdy5lID0gZXZlbnQ7XHJcbiAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxMyl7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTmFtZSgpO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1ib2FyZC1jb250YWluZXJcIikuZm9jdXMoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoaWRlQWxsKCl7XHJcbiAgICAgICAgdGhpcy50cmlhbmdsZUxlZnQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLnRyaWFuZ2xlUmlnaHQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVUcmlhbmdsZVZpZXcoKXtcclxuICAgICAgICB0aGlzLnRyaWFuZ2xlTGVmdC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMudHJpYW5nbGVSaWdodC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLmdhbWVNb2RlbC5jdXJyZW50Um91bmQgPT09IDApIHRoaXMudHJpYW5nbGVMZWZ0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2FtZU1vZGVsLmN1cnJlbnRSb3VuZCA+PSB0aGlzLmdhbWVNb2RlbC5yb3VuZENvdW50IC0gMSkgdGhpcy50cmlhbmdsZVJpZ2h0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5yb3VuZExhYmVsLnRleHRDb250ZW50ID0gXCJSb3VuZCBcIiArICh0aGlzLmdhbWVNb2RlbC5jdXJyZW50Um91bmQgKyAxKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVWaWV3KG1vZGVsKSB7XHJcbiAgICAgICAgbW9kZWwgPSBtb2RlbCA/PyB0aGlzLmdhbWVNb2RlbDtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRyaWFuZ2xlVmlldygpO1xyXG4gICAgICAgIG1vZGVsID0gbW9kZWwgPz8gd2luZG93Lm1vZGVsO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWUtYm9hcmRcIikuaGlkZSgpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXVsdGlwbGUtY2hvaWNlLXBhbmVcIikuaGlkZSgpO1xyXG5cclxuICAgICAgICBpZiAobW9kZWwuZ2V0Um91bmQoKS50eXBlID09PSBNb2RlbC5xdWVzdGlvblR5cGUuQ0FURUdPUlkpIHRoaXMuY2F0ZWdvcnlWaWV3KG1vZGVsKTtcclxuICAgICAgICBpZiAobW9kZWwuZ2V0Um91bmQoKS50eXBlID09PSBNb2RlbC5xdWVzdGlvblR5cGUuTVVMVElQTEVfQ0hPSUNFKSB0aGlzLm11bHRpcGxlQ2hvaWNlVmlldyhtb2RlbCk7XHJcbiAgICB9XHJcblxyXG4gICAgbXVsdGlwbGVDaG9pY2VWaWV3KCl7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGNhdGVnb3J5Vmlldyhtb2RlbCl7XHJcbiAgICAgICAgbGV0IGdhbWVCb2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZS1ib2FyZFwiKTtcclxuICAgICAgICBpZiAoIWdhbWVCb2FyZCkgdGhyb3cgbmV3IEVycm9yKFwiR2FtZSBib2FyZCBub3QgZm91bmRcIik7XHJcbiAgICAgICAgZ2FtZUJvYXJkLnNob3coKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgNjsgY29sKyspIHtcclxuICAgICAgICAgICAgbGV0IGNvbHVtbiA9IG1vZGVsLmdldENvbHVtbihjb2wpO1xyXG5cclxuICAgICAgICAgICAgZ2FtZUJvYXJkLmdldEhlYWRlcihjb2wpLmluaXRGaXRUZXh0KFwidmhcIik7XHJcbiAgICAgICAgICAgIGdhbWVCb2FyZC5zZXRIZWFkZXIoY29sLCBjb2x1bW4uY2F0ZWdvcnksIGNvbHVtbi5mb250c2l6ZSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCA1OyByb3crKykge1xyXG4gICAgICAgICAgICAgICAgZ2FtZUJvYXJkLnNldENlbGwocm93LCBjb2wsIGNvbHVtbi5jZWxsW3Jvd10udmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbHVtbi5jZWxsW3Jvd10ucSA9PT0gXCJcIikgZ2FtZUJvYXJkLnNldENvbXBsZXRlKHJvdywgY29sLCBcImZhbHNlXCIpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY29sdW1uLmNlbGxbcm93XS5hID09PSBcIlwiKSBnYW1lQm9hcmQuc2V0Q29tcGxldGUocm93LCBjb2wsIFwicGFydGlhbFwiKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgZ2FtZUJvYXJkLnNldENvbXBsZXRlKHJvdywgY29sLCBcInRydWVcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmV4dFJvdW5kKCl7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwuY3VycmVudFJvdW5kKys7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUcmlhbmdsZVZpZXcoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcmV2Um91bmQoKXtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5jdXJyZW50Um91bmQtLTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVRyaWFuZ2xlVmlldygpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgfVxyXG5cclxuICAgIG1lbnVQbHVzKCl7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwuaW5jcmVhc2VWYWx1ZSgpO1xyXG4gICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgbWVudU1pbnVzKCl7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwuZGVjcmVhc2VWYWx1ZSgpO1xyXG4gICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgbWVudVJlbW92ZSgpe1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJlbW92ZVJvdW5kKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUcmlhbmdsZVZpZXcoKTtcclxuICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgfVxyXG5cclxuICAgIG1lbnVIb21lKCl7XHJcbiAgICAgICAgbG9jYXRpb24uaHJlZiA9IFwiaG9tZS5odG1sXCI7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRWRpdG9yUGFuZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2RyaXZlL2FwaS92My9xdWlja3N0YXJ0L2pzP2hsPWVuXHJcblxyXG5jb25zdCBBYnN0cmFjdEZpbGVzID0gcmVxdWlyZShcIi4vQWJzdHJhY3RGaWxlLmpzXCIpO1xyXG5cclxuY2xhc3MgRmlsZU9wcyBleHRlbmRzIEFic3RyYWN0RmlsZXN7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgY3JlYXRlKCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5jcmVhdGUoe1xyXG4gICAgICAgICAgICAgICAgbmFtZSA6IEZpbGVPcHMuZmlsZW5hbWUsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRzOiBbJ2FwcERhdGFGb2xkZXInXSxcclxuICAgICAgICAgICAgICAgIGZpZWxkczogXCJpZFwiXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy5yZXN1bHQuaWQpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZGVsZXRlKGZpbGVJZCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5kZWxldGUoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkIDogZmlsZUlkXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy5yZXN1bHQpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgbGlzdCgpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMubGlzdCh7XHJcbiAgICAgICAgICAgICAgICAvLyBxOiBgbmFtZSBjb250YWlucyAnLmpzb24nYCxcclxuICAgICAgICAgICAgICAgIHNwYWNlczogJ2FwcERhdGFGb2xkZXInLFxyXG4gICAgICAgICAgICAgICAgZmllbGRzOiAnZmlsZXMvbmFtZSxmaWxlcy9pZCxmaWxlcy9tb2RpZmllZFRpbWUnXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy5yZXN1bHQuZmlsZXMpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0KGZpbGVJZCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5nZXQoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkOiBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICBhbHQ6ICdtZWRpYSdcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHNldEJvZHkoZmlsZUlkLCBib2R5KXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LnJlcXVlc3Qoe1xyXG4gICAgICAgICAgICAgICAgcGF0aCA6IFwidXBsb2FkL2RyaXZlL3YzL2ZpbGVzL1wiICsgZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kIDogXCJQQVRDSFwiLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zIDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZFR5cGUgOiBcIm1lZGlhXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzIDoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCIgOiBcImFwcGxpY2F0aW9uL2pzb25cIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGJvZHkgOiBib2R5XHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVzLmJvZHkpKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlbmFtZShmaWxlSWQsIGZpbGVuYW1lKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBmaWxlSWQ6IGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIG5hbWU6IGZpbGVuYW1lXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVzLmJvZHkpKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5GaWxlT3BzLmZpbGVuYW1lID0gXCJHYW1lIE5hbWUuanNvblwiO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3BzOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqIFZpZXctQ29udHJvbGxlciBmb3IgdGhlIEhUTUwgZ2FtZSBib2FyZCBlbGVtZW50ICAgICAgICAgICAgICoqL1xyXG4vKiogVGhpcyBpcyB0aGUgY2xhc3NpY2FsIFwiSmVvcGFyZHlcIiB0eXBlIGJvYXJkICAgICAgICAgICAgICAgICAqKi9cclxuLyoqIFRoaXMgaXMgbW9kZWwgYWdub3N0aWMsIHNlZSBFZGl0b3JQYW5lLmpzIGZvciBtb2RlbCBtZXRob2RzICoqL1xyXG5cclxuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCJAVGhhZXJpb3VzL25pZGdldFwiKS5OaWRnZXRFbGVtZW50O1xyXG5jb25zdCBGaWxlT3BzID0gcmVxdWlyZShcIi4vRmlsZU9wcy5qc1wiKTtcclxubGV0IGZpbGVPcHMgPSBuZXcgRmlsZU9wcygpO1xyXG5cclxuZnVuY3Rpb24gaGVhZGVyQ2hhbmdlTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgIGV2ZW50LnRhcmdldC5maXRUZXh0Lm5vdGlmeSgxLCAxKTtcclxuICAgIGxldCBjb2wgPSBwYXJzZUludChldmVudC50YXJnZXQucGFyZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWNvbFwiKSk7XHJcbiAgICB3aW5kb3cubW9kZWwuZ2V0Q29sdW1uKGNvbCkuY2F0ZWdvcnkgPSBldmVudC50YXJnZXQudGV4dDtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gaGVhZGVyRm9jdXNMaXN0ZW5lcihldmVudCkge1xyXG4gICAgbGV0IGNvbCA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC5wYXJlbnRFbGVtZW50LmdldEF0dHJpYnV0ZShcImRhdGEtY29sXCIpKTtcclxuICAgIGV2ZW50LnRhcmdldC50ZXh0ID0gd2luZG93Lm1vZGVsLmdldENvbHVtbihjb2wpLmNhdGVnb3J5O1xyXG4gICAgd2luZG93Lm1vZGVsLmdldENvbHVtbihjb2wpLmZvbnRzaXplID0gZXZlbnQudGFyZ2V0LnN0eWxlW1wiZm9udC1zaXplXCJdO1xyXG4gICAgYXdhaXQgZmlsZU9wcy5zZXRCb2R5KHdpbmRvdy5wYXJhbWV0ZXJzLmZpbGVJZCwgSlNPTi5zdHJpbmdpZnkod2luZG93Lm1vZGVsLmdldCgpLCBudWxsLCAyKSk7XHJcbn1cclxuXHJcbmNsYXNzIENlbGxTZWxlY3RFdmVudCBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKHJvdywgY29sKSB7XHJcbiAgICAgICAgc3VwZXIoJ2NlbGwtc2VsZWN0JyxcclxuICAgICAgICAgICAgICB7ZGV0YWlsIDoge3JvdyA6IHJvdywgY29sIDogY29sIH19XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgR2FtZUJvYXJkIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBhc3luYyAoKT0+e1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgZmlsZU9wcy5sb2FkQ2xpZW50KCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcnMoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNb2RlbChtb2RlbCl7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGFkZExpc3RlbmVycygpIHtcclxuICAgICAgICBsZXQgZ2FtZUJvYXJkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYW1lLWJvYXJkXCIpO1xyXG4gICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDY7IGNvbCsrKSB7XHJcbiAgICAgICAgICAgIGdhbWVCb2FyZC5nZXRIZWFkZXIoY29sKS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgaGVhZGVyQ2hhbmdlTGlzdGVuZXIpO1xyXG4gICAgICAgICAgICBnYW1lQm9hcmQuZ2V0SGVhZGVyKGNvbCkuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgaGVhZGVyRm9jdXNMaXN0ZW5lcik7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCA1OyByb3crKykge1xyXG4gICAgICAgICAgICAgICAgZ2FtZUJvYXJkLmdldENlbGwocm93LCBjb2wpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDZWxsU2VsZWN0RXZlbnQocm93LCBjb2wpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSB2YWx1ZSBvZiBhIGNhdGVnb3J5XHJcbiAgICAgKiBAcGFyYW0gaW5kZXhcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIHNldEhlYWRlcihpbmRleCwgdmFsdWUsIGZvbnRTaXplKXtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuZ2V0SGVhZGVyKGluZGV4KTtcclxuICAgICAgICBlbGVtZW50LnRleHQgPSB2YWx1ZTtcclxuICAgICAgICBpZiAoZm9udFNpemUpIGVsZW1lbnQuc3R5bGVbXCJmb250LXNpemVcIl0gPSBmb250U2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlIHRoZSBoZWFkZXIgaHRtbCBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gaW5kZXhcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBnZXRIZWFkZXIoaW5kZXgpe1xyXG4gICAgICAgIGlmICh0eXBlb2YgaW5kZXggIT09IFwibnVtYmVyXCIgfHwgaW5kZXggPCAwIHx8IGluZGV4ID4gNikgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbmRleDogXCIgKyBpbmRleCk7XHJcbiAgICAgICAgbGV0IHNlbGVjdG9yID0gYFtkYXRhLXJvdz0naCddW2RhdGEtY29sPScke2luZGV4fSddID4gLnZhbHVlYDtcclxuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgdmFsdWUgb2YgYSBub24tY2F0ZWdvcnkgY2VsbC5cclxuICAgICAqIEBwYXJhbSByb3dcclxuICAgICAqIEBwYXJhbSBjb2xcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBzZXRDZWxsKHJvdywgY29sLCB2YWx1ZSA9IFwiXCIpe1xyXG4gICAgICAgIHRoaXMuZ2V0Q2VsbChyb3csIGNvbCkudGV4dENvbnRlbnQgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDZWxsKHJvdywgY29sKXtcclxuICAgICAgICBsZXQgc2VsZWN0b3IgPSBgW2RhdGEtcm93PVwiJHtyb3d9XCJdW2RhdGEtY29sPVwiJHtjb2x9XCJdID4gLnZhbHVlYDtcclxuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDb21wbGV0ZShyb3csIGNvbCwgdmFsdWUpe1xyXG4gICAgICAgIGlmICh0eXBlb2Ygcm93ICE9PSBcIm51bWJlclwiIHx8IHJvdyA8IDAgfHwgcm93ID4gNikgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCByb3c6IFwiICsgcm93KTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbCAhPT0gXCJudW1iZXJcIiB8fCBjb2wgPCAwIHx8IGNvbCA+IDUpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgY29sOiBcIiArIGNvbCk7XHJcbiAgICAgICAgdGhpcy5nZXRDZWxsKHJvdywgY29sKS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWNvbXBsZXRlXCIsIHZhbHVlKTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZ2FtZS1ib2FyZCcsIEdhbWVCb2FyZCk7XHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZUJvYXJkOyIsImNsYXNzIE1lbnV7XHJcbiAgICBpbml0KG1lbnVTZWxlY3Rvcil7XHJcbiAgICAgICAgdGhpcy5tZW51U2VsZWN0b3IgPSBtZW51U2VsZWN0b3I7XHJcbiAgICAgICAgdGhpcy5tZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy50b2dnbGVNZW51KCkpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb25NZW51KCk7XHJcblxyXG4gICAgICAgIHRoaXMubWVudUFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCk9PiB0aGlzLm1vdXNlTGVhdmUoKSk7XHJcbiAgICAgICAgdGhpcy5tZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpPT4gdGhpcy5tb3VzZUxlYXZlKCkpO1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCk9PiB0aGlzLm1vdXNlRW50ZXIoKSk7XHJcbiAgICAgICAgdGhpcy5tZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpPT4gdGhpcy5tb3VzZUVudGVyKCkpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtYXV0b2Nsb3NlPSd0cnVlJ1wiKS5mb3JFYWNoKChlbGUpPT4ge1xyXG4gICAgICAgICAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLmNsb3NlKCkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnN1Yi1tZW51XCIpLmZvckVhY2goKGVsZSk9PntcclxuICAgICAgICAgICAgZWxlLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1sYWJlbFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTWVudShlbGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoKXtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc3ViLW1lbnUgPiAubWVudS1hcmVhXCIpLmZvckVhY2goKGVsZSk9PntcclxuICAgICAgICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb3Blbigpe1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uTWVudSgpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlTGVhdmUoKXtcclxuICAgICAgICBpZiAodGhpcy50aW1lb3V0KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgfSwgNTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZUVudGVyKCl7XHJcbiAgICAgICAgaWYgKCF0aGlzLnRpbWVvdXQpIHJldHVybjtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgICB0aGlzLnRpbWVvdXQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRvZ2dsZU1lbnUoZWxlbWVudCl7XHJcbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQgPz8gdGhpcy5tZW51QXJlYTtcclxuICAgICAgICBpZiAoIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWVudS1hcmVhXCIpKXtcclxuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tZW51LWFyZWFcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJoaWRkZW5cIikpe1xyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWVudS1hcmVhXCIpKXtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudS1hcmVhXCIpLmZvckVhY2goXHJcbiAgICAgICAgICAgICAgICAoZWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBvc2l0aW9uTWVudSgpe1xyXG4gICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLm1lbnVCdXR0b24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgICAgICBjb25zdCBiV2lkdGggPSB0aGlzLm1lbnVCdXR0b24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XHJcbiAgICAgICAgY29uc3QgbVdpZHRoID0gdGhpcy5tZW51QXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuICAgICAgICBpZiAoKGxlZnQgKyBiV2lkdGggKyBtV2lkdGggKyAyKSA+IHdpbmRvdy5pbm5lcldpZHRoKXtcclxuICAgICAgICAgICAgdGhpcy5zZXRNZW51TGVmdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TWVudVJpZ2h0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldE1lbnVMZWZ0KCl7XHJcbiAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMubWVudUJ1dHRvbi5vZmZzZXRMZWZ0O1xyXG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5tZW51QXJlYS5vZmZzZXRXaWR0aDtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLnN0eWxlLmxlZnQgPSAobGVmdCAtIHdpZHRoIC0gMikgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWVudVJpZ2h0KCl7XHJcbiAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMubWVudUJ1dHRvbi5vZmZzZXRMZWZ0O1xyXG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5tZW51QnV0dG9uLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuc3R5bGUubGVmdCA9IChsZWZ0ICsgd2lkdGggKyAyKSArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWVudSgpe1xyXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMubWVudVNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWVudUJ1dHRvbigpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1lbnUucXVlcnlTZWxlY3RvcihcIi5tZW51LWljb25cIik7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG1lbnVBcmVhKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWVudS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYXJlYVwiKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51OyIsImNsYXNzIE1vZGVsIHtcclxuICAgIGluaXQobmFtZSA9IFwiR2FtZSBOYW1lXCIpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsID0ge1xyXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICByb3VuZHM6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRSb3VuZCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBuYW1lKHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLm5hbWUgPSBzdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsLm5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0KGdhbWVNb2RlbCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFJvdW5kID0gMDtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbCA9IGdhbWVNb2RlbDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBnZXQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJvdW5kKGluZGV4KSB7XHJcbiAgICAgICAgaW5kZXggPSBpbmRleCA/PyB0aGlzLmN1cnJlbnRSb3VuZDtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWwucm91bmRzW2luZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb2x1bW4oaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb3VuZCgpLmNvbHVtbltpbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2VsbChyb3csIGNvbHVtbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldENvbHVtbihjb2x1bW4pLmNlbGxbcm93XTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVSb3VuZCgpIHtcclxuICAgICAgICBpZiAodGhpcy5yb3VuZENvdW50ID09PSAxKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwucm91bmRzLnNwbGljZSh0aGlzLmN1cnJlbnRSb3VuZCwgMSk7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdW5kID49IHRoaXMucm91bmRDb3VudCkgdGhpcy5jdXJyZW50Um91bmQgPSB0aGlzLnJvdW5kQ291bnQgLSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZE11bHRpcGxlQ2hvaWNlUm91bmQoKXtcclxuICAgICAgICBsZXQgcm91bmQgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IE1vZGVsLnF1ZXN0aW9uVHlwZS5NVUxUSVBMRV9DSE9JQ0UsXHJcbiAgICAgICAgICAgIHF1ZXN0aW9uIDogXCJcIixcclxuICAgICAgICAgICAgYW5zd2VycyA6IFtcclxuICAgICAgICAgICAgICAgIC8vIHZhbHVlIDoge3RydWUsIGZhbHNlfSwgdGV4dFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwucm91bmRzLnB1c2gocm91bmQpO1xyXG4gICAgICAgIHJldHVybiByb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICBhZGRDYXRlZ29yeVJvdW5kKCkge1xyXG4gICAgICAgIGxldCByb3VuZCA9IHtcclxuICAgICAgICAgICAgdHlwZTogTW9kZWwucXVlc3Rpb25UeXBlLkNBVEVHT1JZLFxyXG4gICAgICAgICAgICBjb2x1bW46IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldID0ge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBjZWxsOiBbXVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldLmNlbGxbal0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IChqICsgMSkgKiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcTogXCJcIixcclxuICAgICAgICAgICAgICAgICAgICBhOiBcIlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5wdXNoKHJvdW5kKTtcclxuICAgICAgICByZXR1cm4gcm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHJvdW5kQ291bnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgaW5jcmVhc2VWYWx1ZSgpIHtcclxuICAgICAgICBsZXQgcm91bmQgPSB0aGlzLmdldFJvdW5kKCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgNTsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICByb3VuZC5jb2x1bW5baV0uY2VsbFtqXS52YWx1ZSAqPSAyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRlY3JlYXNlVmFsdWUoKSB7XHJcbiAgICAgICAgbGV0IHJvdW5kID0gdGhpcy5nZXRSb3VuZCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldLmNlbGxbal0udmFsdWUgLz0gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuTW9kZWwucXVlc3Rpb25UeXBlID0ge1xyXG4gICAgQ0FURUdPUlkgOiBcImNob2ljZVwiLFxyXG4gICAgTVVMVElQTEVfQ0hPSUNFIDogXCJtdWx0aXBsZV9jaG9pY2VcIlxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb2RlbDsiLCJjb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcblxyXG5jbGFzcyBNdWx0aXBsZUNob2ljZVBhbmUgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuXHJcbn1cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ211bHRpcGxlLWNob2ljZS1wYW5lJywgTXVsdGlwbGVDaG9pY2VQYW5lKTtcclxubW9kdWxlLmV4cG9ydHMgPSBNdWx0aXBsZUNob2ljZVBhbmU7IiwiXHJcbmNsYXNzIFF1ZXN0aW9uUGFuZXtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGwgY29uc3RydWN0b3IgYWZ0ZXIgd2luZG93IGhhcyBsb2FkZWRcclxuICAgICAqIEBwYXJhbSAoZnVuY3Rpb24pIHNhdmVjYiBjYWxsYmFjayB0byBzYXZlIG1vZGVsXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMudGV4dFF1ZXN0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZXh0LXF1ZXN0aW9uXCIpO1xyXG4gICAgICAgIHRoaXMudGV4dENvbnRlbnRzID0gdGhpcy50ZXh0UXVlc3Rpb24ucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpO1xyXG4gICAgICAgIHRoaXMubmF2Qm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctYm9hcmRcIik7XHJcbiAgICAgICAgdGhpcy5uYXZRdWVzdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1xdWVzdGlvblwiKTtcclxuICAgICAgICB0aGlzLm5hdkFuc3dlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1hbnN3ZXJcIik7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1ib2FyZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5oaWRlQWxsKCk7XHJcbiAgICAgICAgICAgIHRoaXMub25DbG9zZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctcXVlc3Rpb25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1F1ZXN0aW9uKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1hbnN3ZXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0Fuc3dlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnRleHRRdWVzdGlvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMudGV4dENvbnRlbnRzLmZvY3VzKCkpO1xyXG5cclxuICAgICAgICB0aGlzLnRleHRDb250ZW50cy5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCBhc3luYyAoKT0+e1xyXG4gICAgICAgICAgIHRoaXMuY2VsbFt0aGlzLnN0YXR1c10gPSB0aGlzLnRleHRDb250ZW50cy50ZXh0LnRyaW0oKTtcclxuICAgICAgICAgICBhd2FpdCB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm9uU2F2ZSA9IGZ1bmN0aW9uKCl7fTsgLy8gc2V0IHRoaXMgaW4gbWFpbiB0byBzYXZlIC5qc29uIG1vZGVsXHJcbiAgICAgICAgdGhpcy5vbkNsb3NlID0gZnVuY3Rpb24oKXt9OyAvLyBjYWxsZWQgd2hlbiB0aGlzIHBhbmVsIGlzIGhpZGRlbi5cclxuICAgIH1cclxuXHJcbiAgICBoaWRlQWxsKCl7XHJcbiAgICAgICAgdGhpcy5uYXZCb2FyZC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMubmF2UXVlc3Rpb24uY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLm5hdkFuc3dlci5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMudGV4dFF1ZXN0aW9uLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd1F1ZXN0aW9uKGNlbGwpe1xyXG4gICAgICAgIGlmIChjZWxsKSB0aGlzLmNlbGwgPSBjZWxsO1xyXG4gICAgICAgIGNlbGwgPSBjZWxsID8/IHRoaXMuY2VsbDtcclxuXHJcbiAgICAgICAgdGhpcy5uYXZBbnN3ZXIuY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xyXG4gICAgICAgIHRoaXMubmF2UXVlc3Rpb24uY2xhc3NMaXN0LmFkZChcInNlbGVjdGVkXCIpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXR1cyA9IFwicVwiO1xyXG5cclxuICAgICAgICB0aGlzLm5hdkJvYXJkLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5uYXZRdWVzdGlvbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMubmF2QW5zd2VyLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcblxyXG4gICAgICAgIHRoaXMudGV4dFF1ZXN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy50ZXh0UXVlc3Rpb24ucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpLnRleHQgPSBjZWxsLnE7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd0Fuc3dlcihjZWxsKXtcclxuICAgICAgICBpZiAoY2VsbCkgdGhpcy5jZWxsID0gY2VsbDtcclxuICAgICAgICBjZWxsID0gY2VsbCA/PyB0aGlzLmNlbGw7XHJcblxyXG4gICAgICAgIHRoaXMubmF2QW5zd2VyLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICB0aGlzLm5hdlF1ZXN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBcImFcIjtcclxuXHJcbiAgICAgICAgdGhpcy5uYXZCb2FyZC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMubmF2UXVlc3Rpb24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLm5hdkFuc3dlci5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICB0aGlzLnRleHRRdWVzdGlvbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMudGV4dFF1ZXN0aW9uLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dC1jb250ZW50c1wiKS50ZXh0ID0gY2VsbC5hO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXN0aW9uUGFuZTtcclxuXHJcblxyXG4iLCJcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAvLyBUaGUgQnJvd3NlciBBUEkga2V5IG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS5cclxuICAgIGRldmVsb3BlcktleSA6ICdBSXphU3lBQmNkTG1UNkhIXzdHbzgycV9JQkdJM2ptNlVMNHc0UTAnLFxyXG5cclxuICAgIC8vIFRoZSBDbGllbnQgSUQgb2J0YWluZWQgZnJvbSB0aGUgR29vZ2xlIEFQSSBDb25zb2xlLiBSZXBsYWNlIHdpdGggeW91ciBvd24gQ2xpZW50IElELlxyXG4gICAgY2xpZW50SWQgOiBcIjE1ODgyMzEzNDY4MS05OGJna2FuZ29sdGs2MzZ1a2Y4cG9mZWlzN3BhN2piay5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwiLFxyXG5cclxuICAgIC8vIFJlcGxhY2Ugd2l0aCB5b3VyIG93biBwcm9qZWN0IG51bWJlciBmcm9tIGNvbnNvbGUuZGV2ZWxvcGVycy5nb29nbGUuY29tLlxyXG4gICAgYXBwSWQgOiBcIjE1ODgyMzEzNDY4MVwiLFxyXG5cclxuICAgIC8vIEFycmF5IG9mIEFQSSBkaXNjb3ZlcnkgZG9jIFVSTHMgZm9yIEFQSXMgdXNlZCBieSB0aGUgcXVpY2tzdGFydFxyXG4gICAgZGlzY292ZXJ5RG9jcyA6IFtcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Rpc2NvdmVyeS92MS9hcGlzL2RyaXZlL3YzL3Jlc3RcIl0sXHJcblxyXG4gICAgLy8gU2NvcGUgdG8gdXNlIHRvIGFjY2VzcyB1c2VyJ3MgRHJpdmUgaXRlbXMuXHJcbiAgICBzY29wZSA6ICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLmZpbGUnXHJcbn0iXX0=
