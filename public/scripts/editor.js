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

const AbstractFiles = require("./AbstractFile.js");

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0Fic3RyYWN0TW9kZWwuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0RyYWdIYW5kbGVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9GaWxlT3BlcmF0aW9ucy5qcyIsIi4uLy4uL25pZGdldC9zcmMvSW50ZXJmYWNlcy5qcyIsIi4uLy4uL25pZGdldC9zcmMvTW91c2VVdGlsaXRpZXMuanMiLCIuLi8uLi9uaWRnZXQvc3JjL05pZGdldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0RWxlbWVudC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0U3R5bGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL1RyYW5zZm9ybWVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b24uanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblNldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU3RhdGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldENvbnRhaW5lci5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SFRNTEltYWdlLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRJbWFnZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0VGV4dC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJhZy5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJvcC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvTW91c2UuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL01vdmFibGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL1Jlc2l6ZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvcHJvamVjdEZpbGUuanMiLCJzcmMvY2xpZW50L2VkaXRvci5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9BYnN0cmFjdEZpbGUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvRWRpdG9yUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9GaWxlT3BzLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0dhbWVCb2FyZC5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9NZW51LmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL01vZGVsLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL011bHRpcGxlQ2hvaWNlUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9RdWVzdGlvblBhbmUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvZ29vZ2xlRmllbGRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCc7XG5jbGFzcyBBYnN0cmFjdE1vZGVsIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgYWJzdHJhY3QgbW9kZWwuICBJZiBkZWxlZ2F0ZSBpcyBwcm92aWRlZCB0aGVuIGFsbCBsaXN0ZW5lclxuICAgICAqIGFkZHMgYW5kIG5vdGlmaWVzIGFyZSBwZXJmb3JtZWQgb24gdGhlIGRlbGVnYXRlIGxpc3RlbmVyIGNvbGxlY3Rpb24uXG4gICAgICogQHBhcmFtIHt0eXBlfSBkZWxlZ2F0ZVxuICAgICAqIEByZXR1cm5zIHtubSRfQWJzdHJhY3RNb2RlbC5BYnN0cmFjdE1vZGVsfVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmRlbGVnYXRlID0gdGhpcztcbiAgICAgICAgdGhpcy5hYnN0cmFjdE1vZGVsTGlzdGVuZXJzID0gW107ICAgICAgICBcbiAgICB9XG5cbiAgICBnZXREZWxlZ2F0ZSgpe1xuICAgICAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZTtcbiAgICB9XG4gICAgXG4gICAgc2V0RGVsZWdhdGUoZGVsZWdhdGUgPSBudWxsKXtcbiAgICAgICAgaWYgKGRlbGVnYXRlID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmRlbGVnYXRlID0gdGhpcztcbiAgICAgICAgICAgIHRoaXMuYWJzdHJhY3RNb2RlbExpc3RlbmVycyA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IGRlbGVnYXRlLmRlbGVnYXRlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5kZWxlZ2F0ZSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInVuZGVmaW5lZCBkZWxlZ2F0ZVwiKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBhZGRMaXN0ZW5lcihsaXN0ZW5lcikge1xuICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSBcIm9iamVjdFwiKXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgQWJzdHJhY3RNb2RlbCBsaXN0ZW5lciB0eXBlOiBcIiArIHR5cGVvZiBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kZWxlZ2F0ZS5hYnN0cmFjdE1vZGVsTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGwgYXMgbm90aWZ5TGlzdGVuZXJzKG1ldGhvZE5hbWUsIFttZXRob2RBcmd1bWVudDAsIC4uLiBtZXRob2RBcmd1bWVudE5dKVxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWV0aG9kXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBhc3luYyBub3RpZnlMaXN0ZW5lcnMobWV0aG9kKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRVZFTlQgXCIgKyB0aGlzLmRlbGVnYXRlLmNvbnN0cnVjdG9yLm5hbWUgKyBcIiBcIiArIG1ldGhvZCk7XG5cbiAgICAgICAgQXJyYXkucHJvdG90eXBlLnNoaWZ0LmFwcGx5KGFyZ3VtZW50cyk7XG4gICAgICAgIGxldCBldmVudCA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxuICAgICAgICAgICAgYXJnczogYXJndW1lbnRzLFxuICAgICAgICAgICAgc291cmNlOiB0aGlzLFxuICAgICAgICAgICAgbGlzdGVuZXJzOiBbXVxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgd2luZG93Lmxhc3RFdmVudCA9IGV2ZW50O1xuICAgICAgICB3aW5kb3cubkV2ZW50cy5wdXNoKHdpbmRvdy5sYXN0RXZlbnQpO1xuXG4gICAgICAgIGZvciAobGV0IGxpc3RlbmVyIG9mIHRoaXMuZGVsZWdhdGUuYWJzdHJhY3RNb2RlbExpc3RlbmVycykge1xuICAgICAgICAgICAgaWYgKGxpc3RlbmVyW21ldGhvZF0pe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiICsgXCIgKyBsaXN0ZW5lci5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgKyBtZXRob2QpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sYXN0RXZlbnQubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIuY29uc3RydWN0b3IubmFtZSk7ICAgICAgIFxuICAgICAgICAgICAgICAgIGF3YWl0IGxpc3RlbmVyW21ldGhvZF0uYXBwbHkobGlzdGVuZXIsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJbQWJzdHJhY3RNb2RlbC5kZWZhdWx0TGlzdGVuZXJdKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIiArIFwiICsgbGlzdGVuZXIuY29uc3RydWN0b3IubmFtZSArIFwiIFwiICsgQWJzdHJhY3RNb2RlbC5kZWZhdWx0TGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sYXN0RXZlbnQubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIuY29uc3RydWN0b3IubmFtZSk7ICAgICAgIFxuICAgICAgICAgICAgICAgIGF3YWl0IGxpc3RlbmVyW0Fic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyXS5hcHBseShsaXN0ZW5lciwgd2luZG93Lmxhc3RFdmVudCk7ICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5BYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lciA9IFwibmlkZ2V0TGlzdGVuZXJcIjtcbndpbmRvdy5uRXZlbnRzID0gW107XG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0TW9kZWw7IiwiJ3VzZSBzdHJpY3QnO1xuLyoqXG4gKiBTaW5nbGV0b24gY2xhc3MgdG8gcHJvdmlkaW5nIGZ1bmN0aW9uYWxpdHkgdG8gRHJhZ05pZGdldHMgYW5kIERyb3BOaWRnZXRzLlxuICogSXQgc3RvcmVzIHRoZSBOaWRnZXQgY3VycmVudGx5IGJlaW5nIGRyYWdnZWQuXG4gKi9cbmNsYXNzIERyYWdIYW5kbGVye1xuICAgIFxuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG51bGw7XG4gICAgICAgIHRoaXMub3ZlciA9IFtdO1xuICAgIH1cbiAgICBcbiAgICBwdXNoT3ZlcihuaWRnZXQpe1xuICAgICAgICBpZiAodGhpcy5vdmVySGFzKG5pZGdldCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgdGhpcy5vdmVyLnB1c2gobmlkZ2V0KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIFxuICAgIHJlbW92ZU92ZXIobmlkZ2V0KXtcbiAgICAgICAgaWYgKCF0aGlzLm92ZXJIYXMobmlkZ2V0KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLm92ZXIuc3BsaWNlKHRoaXMub3Zlci5pbmRleE9mKG5pZGdldCksIDEpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9ICAgIFxuICAgIFxuICAgIG92ZXJIYXMobmlkZ2V0KXtcbiAgICAgICAgcmV0dXJuIHRoaXMub3Zlci5pbmRleE9mKG5pZGdldCkgIT09IC0xO1xuICAgIH1cbiAgICBcbiAgICBzZXQobmlkZ2V0KXtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbmlkZ2V0O1xuICAgIH1cbiAgICBcbiAgICBnZXQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudDtcbiAgICB9XG4gICAgXG4gICAgaGFzKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQgIT09IG51bGw7XG4gICAgfVxuICAgIFxuICAgIGNsZWFyKCl7XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG51bGw7XG4gICAgfVxuICAgIFxuICAgIHN0YXRpYyBnZXRJbnN0YW5jZSgpe1xuICAgICAgICByZXR1cm4gRHJhZ0hhbmRsZXIuaW5zdGFuY2U7XG4gICAgfSAgICBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRHJhZ0hhbmRsZXIoKTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuL05pZGdldEVsZW1lbnRcIik7XG5cbi8qIGdsb2JhbCBVdGlsaXR5ICovXG5jbGFzcyBGaWxlT3BlcmF0aW9ucyB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGRvbSBlbGVtZW50IGZyb20gYSBmaWxlICh1cmwpLiAgTWFwIHZhcmlhYmxlcyAoJHsuLi59KSB0byBcbiAgICAgKiBhIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gdXJsXG4gICAgICogQHBhcmFtIHt0eXBlfSBtYXBcbiAgICAgKiBAcmV0dXJucyB7bm9kZXxGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudC5kb21FbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBsb2FkTmlkZ2V0KHVybCwgbWFwKXsgICAgICAgIFxuICAgICAgICBsZXQgZWxlbWVudCA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50KHVybCwgbWFwKTtcbiAgICAgICAgcmV0dXJuIG5ldyBOaWRnZXRFbGVtZW50KGVsZW1lbnQpO1xuICAgIH0gICAgXG4gICAgXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGRvbSBlbGVtZW50IGZyb20gYSBmaWxlICh1cmwpLiAgTWFwIHZhcmlhYmxlcyAoJHsuLi59KSB0byBcbiAgICAgKiBhIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gdXJsXG4gICAgICogQHBhcmFtIHt0eXBlfSBtYXBcbiAgICAgKiBAcmV0dXJucyB7bm9kZXxGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudC5kb21FbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBsb2FkRE9NRWxlbWVudCh1cmwsIG1hcCA9IG5ldyBNYXAoKSl7ICAgICAgICBcbiAgICAgICAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCA9PT0gZmFsc2UpIG1hcCA9IEZpbGVPcGVyYXRpb25zLm9iamVjdFRvTWFwKG1hcCk7ICAgICAgIFxuICAgICAgICBsZXQgdGV4dCA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLmdldFVSTCh1cmwpO1xuICAgICAgICByZXR1cm4gRmlsZU9wZXJhdGlvbnMuc3RyaW5nVG9ET01FbGVtZW50KHRleHQsIG1hcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGRvbSBlbGVtZW50IGZyb20gdGV4dC5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHRleHRcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1hcFxuICAgICAqIEByZXR1cm5zIHtub2RlfEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50LmRvbUVsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIHN0cmluZ1RvRE9NRWxlbWVudCh0ZXh0LCBtYXAgPSBuZXcgTWFwKCkpe1xuICAgICAgICAvKiByZXBsYWNlIHZhcmlhYmxlcyB3aXRoIHZhbHVlcyAqL1xuICAgICAgICBmb3IgKGxldCBrZXkgb2YgbWFwLmtleXMoKSl7ICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBtYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGBbJF1be10/JHtrZXl9W31dYCwgYGdgKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsIHZhbHVlKTsgICAgXG4gICAgICAgIH1cblxuICAgICAgICAvKiByZXBsYWNlIHVuZmlsbGVkIHZhcmlhYmxlcyB3aXRoIGVtcHR5ICovXG4gICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XVtefV0qW31dYCwgYGdgKTtcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgXCJcIik7IFxuXG4gICAgICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gdGV4dDtcbiAgICAgICAgbGV0IGRvbUVsZW1lbnQgPSBudWxsO1xuICAgICAgICBjb25zb2xlLmxvZyhlbGVtZW50KTtcblxuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICB9XG5cbiAgICBzdGF0aWMgb2JqZWN0VG9NYXAob2JqZWN0KXtcbiAgICAgICAgbGV0IG1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgZm9yIChsZXQgZmllbGQgaW4gb2JqZWN0KXsgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0W2ZpZWxkXSA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2Ygb2JqZWN0W2ZpZWxkXSA9PT0gXCJudW1iZXJcIil7XG4gICAgICAgICAgICAgICAgbWFwLnNldChmaWVsZCwgb2JqZWN0W2ZpZWxkXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG5cbiAgICBcblxuICAgIC8qXG4gICAgICogVHJhbnNmZXIgY29udGVudHMgb2YgJ2ZpbGVuYW1lJyBmcm9tIHNlcnZlciB0byBjbGllbnQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gc3VjY2Vzc0NhbGxiYWNrXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZXJyb3JDYWxsYmFja1xuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IGNvbnRlbnRzIG9mIGZpbGVcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0VVJMKHVybCkge1xuICAgICAgICBsZXQgY2FsbGJhY2sgPSBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB2YXIgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgICAgICAgICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh4aHR0cC5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHR0cC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh4aHR0cC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHR0cCA6IHhodHRwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1cyA6IHhodHRwLnN0YXR1cywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA6IHhodHRwLnJlc3BvbnNlVGV4dCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmwgOiB1cmxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xuICAgICAgICAgICAgeGh0dHAuc2VuZChudWxsKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIHRleHQuXG4gICAgICogQHBhcmFtIHt0eXBlfSB0ZXh0XG4gICAgICogQHBhcmFtIHt0eXBlfSBtYXBcbiAgICAgKiBAcmV0dXJucyB7bm9kZXxGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudC5kb21FbGVtZW50fVxuICAgICAqL1xuICAgIHN0YXRpYyBhc3luYyBnZXRGaWxlKHVybCwgbWFwID0gbmV3IE1hcCgpKXtcbiAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRVUkwodXJsKTtcblxuICAgICAgICAvKiByZXBsYWNlIHZhcmlhYmxlcyB3aXRoIHZhbHVlcyAqL1xuICAgICAgICBmb3IgKGxldCBrZXkgb2YgbWFwLmtleXMoKSl7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBtYXAuZ2V0KGtleSk7XG4gICAgICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGBbJF1be10/JHtrZXl9W31dYCwgYGdgKTtcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIHJlcGxhY2UgdW5maWxsZWQgdmFyaWFibGVzIHdpdGggZW1wdHkgKi9cbiAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdW159XSpbfV1gLCBgZ2ApO1xuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCBcIlwiKTtcblxuICAgICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFRyYW5zZmVyIGNvbnRlbnRzIG9mICdmaWxlbmFtZScgZnJvbSBzZXJ2ZXIgdG8gY2xpZW50IHVzaW5nIGN1cnJlbnQgd2luZG93IGxvY2F0aW9uLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHN1Y2Nlc3NDYWxsYmFja1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGVycm9yQ2FsbGJhY2tcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRMb2NhbChmaWxlbmFtZSkge1xuICAgICAgICBsZXQgY2FsbGJhY2sgPSBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB2YXIgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgICAgICB2YXIgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWYgKyBcIi9cIiArIGZpbGVuYW1lO1xuXG4gICAgICAgICAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHhodHRwLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHhodHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoeGh0dHAuc3RhdHVzLCB4aHR0cC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xuICAgICAgICAgICAgeGh0dHAuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGNhbGxiYWNrKTtcbiAgICB9XG4gICAgXG4gICAgLyoqXG4gICAgICogQ2F1c2UgJ3RleHQnIHRvIGJlIHNhdmVkIGFzICdmaWxlbmFtZScgY2xpZW50IHNpZGUuXG4gICAgICogQHBhcmFtIHt0eXBlfSBmaWxlbmFtZSBUaGUgZGVmYXVsdCBmaWxlbmFtZSB0byBzYXZlIHRoZSB0ZXh0IGFzLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gdGV4dCBUaGUgdGV4dCB0byBzYXZlIHRvIGZpbGVuYW1lLlxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgc3RhdGljIHNhdmVUb0ZpbGUodGV4dCwgZmlsZW5hbWUpIHtcbiAgICAgICAgbGV0IGFuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgbGV0IGRhdGEgPSBcInRleHQ7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KTtcbiAgICAgICAgYW5jaG9yLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgXCJkYXRhOlwiICsgZGF0YSk7XG4gICAgICAgIGFuY2hvci5zZXRBdHRyaWJ1dGUoXCJkb3dubG9hZFwiLCBmaWxlbmFtZSk7XG4gICAgICAgIGFuY2hvci5jbGljaygpO1xuICAgIH1cbn1cblxuRmlsZU9wZXJhdGlvbnMuTm9kZVR5cGUgPSB7XG4gICAgRUxFTUVOVCA6IDEsXG4gICAgQVRUUklCVVRFIDogMixcbiAgICBURVhUIDogMywgXG4gICAgQ0RBVEFTRUNUSU9OIDogNCxcbiAgICBFTlRJVFlSRUZFUk5DRSA6IDUsXG4gICAgRU5USVRZIDogNixcbiAgICBQUk9DRVNTSU5HSU5TVFJVQ1RJT04gOiA3LFxuICAgIENPTU1FTlQgOiA4LFxuICAgIERPQ1VNRU5UIDogOSxcbiAgICBET0NVTUVOVFRZUEUgOiAxMCxcbiAgICBET0NVTUVOVEZSQUdNRU5UIDogMTEsXG4gICAgTk9UQVRJT04gOiAxMlxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3BlcmF0aW9uczsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBtb3VzZSA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL01vdXNlXCIpLCBcbiAgICBkcmFnIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvRHJhZ1wiKSxcbiAgICBkcm9wIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvRHJvcFwiKSxcbiAgICBtb3ZhYmxlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvTW92YWJsZVwiKSxcbiAgICByZXNpemUgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9SZXNpemVcIilcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogU2luZ2x0b24gY2xhc3MgdG8gYWRkIGZ1bmN0aW9uYWxpdHkgdG8gdGhlIG1vdXNlLlxuICovXG5jbGFzcyBNb3VzZVV0aWxpdGllcyB7XG4gICAgXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQgPSBudWxsO1xuICAgICAgICB0aGlzLmxhc3RYID0gMDtcbiAgICAgICAgdGhpcy5sYXN0WSA9IDA7XG4gICAgfVxuICAgIFxuICAgIGlzVW5kZXIoZXZlbnQsIGVsZW1lbnQpIHtcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYO1xuICAgICAgICBsZXQgeSA9IGV2ZW50LmNsaWVudFk7XG4gICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcblxuICAgICAgICB3aGlsZSAoY3VycmVudCkge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnQgPT09IGVsZW1lbnQpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0VW5kZXIoZXZlbnQpIHtcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYO1xuICAgICAgICBsZXQgeSA9IGV2ZW50LmNsaWVudFk7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuICAgIH1cblxuICAgIHNldCBlbGVtZW50KGVsZW1lbnQpe1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZEVsZW1lbnQgIT09IG51bGwpe1xuICAgICAgICAgICAgdGhpcy5kZXRhY2hFbGVtZW50KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFlbGVtZW50IHx8IGVsZW1lbnQgPT09IG51bGwgfHwgZWxlbWVudCA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRoaXMuZGV0YWNoRWxlbWVudCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBlbGVtZW50KCl7XG4gICAgICAgIHJldHVybiB0aGlzLmF0dGFjaGVkRWxlbWVudDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBdHRhY2ggYW4gZWxlbWVudC4gIElmIHRoZSBlbGVtZW50IGRvZXNuJ3QgaGF2ZSBhIHBhcmVudCBpdCB3aWxsIGJlXG4gICAgICogYXR0YWNoZWQgdG8gdGhlIGRvY3VtZW50IGFuZCB3aWxsIGJlIGRldGFjaGVkIHdoZW4gZGV0YWNoRWxlbWVudCBpcyBjYWxsZWQuXG4gICAgICogQHBhcmFtIHt0eXBlfSBlbGVtZW50XG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBhdHRhY2hFbGVtZW50KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICBcbiAgICAgICAgaWYgKGVsZW1lbnQucGFyZW50KXtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgYXR0YWNoIGVsZW1lbnQgdG8gbW91c2UgaWYgdGhlIGVsZW1lbnQgaGFzIGEgcGFyZW50IGVsZW1lbnQuXCIpO1xuICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKGVsZW1lbnQpO1xuICAgICAgICBlbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiOyBcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSBldmVudC5jbGllbnRZICsgXCJweFwiO1xuICAgICAgICBlbGVtZW50LnN0eWxlLmxlZnQgPSBldmVudC5jbGllbnRYICsgXCJweFwiO1xuICAgICAgICBlbGVtZW50LnN0eWxlLnBvaW50ZXJFdmVudHMgPSBcIm5vbmVcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS56SW5kZXggPSBcIjEwMDAwXCI7XG4gICAgICAgIFxuICAgICAgICB0aGlzLm1vdmVDYWxsQmFjayA9IChldmVudCk9PnRoaXMub25Nb3VzZU1vdmUoZXZlbnQpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdmVDYWxsQmFjayk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGxpc3RlbmVycyBmcm9tIHRoZSBhdHRhY2hlZCBlbGVtZW50LCBkbyBub3QgcmVtb3ZlIGl0IGZyb20gdGhlXG4gICAgICogZG9jdW1lbnQuXG4gICAgICogQHJldHVybnMge3R5cGV9XG4gICAgICovXG4gICAgZGV0YWNoRWxlbWVudCgpe1xuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZEVsZW1lbnQgPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW92ZUNhbGxCYWNrKTsgICAgICAgIFxuICAgICAgICBsZXQgcnZhbHVlID0gdGhpcy5hdHRhY2hlZEVsZW1lbnQ7XG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50ID0gbnVsbDsgICAgICAgIFxuICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHJ2YWx1ZSk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcnZhbHVlO1xuICAgIH1cblxuICAgIG9uTW91c2VNb3ZlKGV2ZW50KSB7ICAgICAgICBcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5sYXN0WCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIHRoaXMubGFzdFkgPSBldmVudC5jbGllbnRZO1xuXG4gICAgICAgIC8vIHNldCB0aGUgZWxlbWVudCdzIG5ldyBwb3NpdGlvbjpcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQuc3R5bGUudG9wID0gZXZlbnQuY2xpZW50WSArIFwicHhcIjtcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQuc3R5bGUubGVmdCA9IGV2ZW50LmNsaWVudFggKyBcInB4XCI7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb3VzZVV0aWxpdGllcygpOyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcHJlZml4OiBcImRhdGEtbmlkZ2V0XCIsXG4gICAgZWxlbWVudEF0dHJpYnV0ZTogXCJkYXRhLW5pZGdldC1lbGVtZW50XCIsXG4gICAgc3JjQXR0cmlidXRlOiBcInNyY1wiLFxuICAgIHRlbXBsYXRlU3JjQXR0cmlidXRlOiBcInRlbXBsYXRlLXNyY1wiLFxuICAgIG5hbWVBdHRyaWJ1dGU6IFwibmFtZVwiLFxuICAgIGludGVyZmFjZUF0dHJpYnV0ZTogXCJpbnRlcmZhY2VzXCIsXG4gICAgdGVtcGxhdGVBdHRyaWJ1dGU6IFwidGVtcGxhdGVcIixcbiAgICBpbnRlcmZhY2VEYXRhRmllbGQ6IFwiaW50ZXJmYWNlRGF0YVwiLFxuICAgIG1vZGVsRGF0YUZpZWxkOiBcIm1vZGVsRGF0YVwiLFxuICAgIHN0eWxlQXR0cmlidXRlOiBcIm5pZGdldC1zdHlsZVwiXG59OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgRmlsZU9wZXJhdGlvbnMgPSByZXF1aXJlKFwiLi9GaWxlT3BlcmF0aW9uc1wiKTtcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCIuL05pZGdldFwiKTtcbmNvbnN0IEludGVyZmFjZXMgPSByZXF1aXJlKFwiLi9JbnRlcmZhY2VzXCIpO1xuY29uc3QgVHJhbnNmb3JtZXIgPSByZXF1aXJlKFwiLi9UcmFuc2Zvcm1lclwiKTtcbmNvbnN0IE5pZGdldFN0eWxlID0gcmVxdWlyZShcIi4vTmlkZ2V0U3R5bGVcIik7XG5cbi8qKlxuICogQSBOaWRnZXRFbGVtZW50IGlzIGEgMToxIGNsYXNzLW9iamVjdDpkb20tb2JqZWN0IHBhaXJpbmcuICBBY3Rpb25zIG9uIHRoZSBET00gXG4gKiBvYmplY3Qgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGJ5IHRoZSBOaWRnZXRFbGVtZW50IG9iamVjdC4gIFRoZSBpbnRlcmZhY2VEYXRhXG4gKiBmaWVsZCBpcyByZXNlcnZlZCBmb3IgZGF0YSBmcm9tIGludGVyZmFjZXMuICBJbnRlcmZhY2VzIHNob3VsZCBwdXQgdGhlaXIgXG4gKiBjdXN0b20gZGF0YSB1bmRlciBbaW50ZXJmYWNlRGF0YUZpZWxkXS5baW50ZXJmYWNlTmFtZV0uICBUaGUgaW50ZXJmYWNlIGRhdGFcbiAqIGF0dHJpYnV0ZSBpcyBzZXQgd2l0aCB0aGUgc3RhdGljIHZhbHVlIE5pZGdldC5pbnRlcmZhY2VEYXRhRmllbGQuXG4gKiBcbiAqIENhbGxpbmcgbWV0aG9kcyBvbiB0aGUgbmlkZ2V0IHdpbGwgdHJlYXQgc2hhZG93IGNvbnRlbnRzIGFzIHJlZ3VsYXIgY29udGVudHMuXG4gKi9cbmNsYXNzIE5pZGdldEVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IE5pZGdldCBhc3NvY2lhdGVkIHdpdGggJ2VsZW1lbnQnLiAgQW4gZXJyb3Igd2lsbCBiZSB0aHJvd25cbiAgICAgKiBpZiB0aGUgJ2VsZW1lbnQnIGlzIGFscmVhZHkgYXNzb2NpYXRlZCB3aXRoIGEgTmlkZ2V0LlxuICAgICAqIFxuICAgICAqIERpc2FibGVkIGNsYXNzIGluZGljYXRlcyB0aGlzIG5pZGdldCB3aWxsIGlnbm9yZSBtb3VzZSBldmVudHMuXG4gICAgICogXG4gICAgICogQHBhcmFtIHt0eXBlfSBlbGVtZW50IEpRdWVyeSBzZWxlY3RvclxuICAgICAqIEByZXR1cm4ge25tJF9OaWRnZXQuTmlkZ2V0RWxlbWVudH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZUlkKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXNbTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZF0gPSB7fTtcbiAgICAgICAgdGhpc1tOaWRnZXQubW9kZWxEYXRhRmllbGRdID0ge307XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtZXIodGhpcyk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzID0ge307XG5cbiAgICAgICAgaWYgKHRlbXBsYXRlSWQpe1xuICAgICAgICAgICAgdGhpcy5hcHBseVRlbXBsYXRlKHRlbXBsYXRlSWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrIGlzIGludm9rZWQgZWFjaCB0aW1lIHRoZSBjdXN0b20gZWxlbWVudCBpcyBhcHBlbmRlZCBpbnRvIGEgZG9jdW1lbnQtY29ubmVjdGVkIGVsZW1lbnRcbiAgICAgKi9cbiAgICBhc3luYyBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgdGhpcy5zaGFkb3dDb250ZW50cyA9IHRoaXM7XG5cbiAgICAgICAgLy8gc2V0IHRoZSBodG1sIG9mIHRoaXMgZWxlbWVudCB0byB0aGUgY29udGVudHMgb2YgdGhlIGZpbGUgKG5vdCBhIHNoYWRvdyBlbGVtZW50KVxuICAgICAgICAvLyBhbGwgZGF0YS0gYXR0cmlidXRlcyB3aWxsIGJlIHVzZWQgdG8gZmlsbCBpbiAke30gdmFyaWFibGVzIGluIHRoZSBzb3VyY2UgZmlsZVxuICAgICAgICAvLyBkb2Vzbid0IHdvcmsgb24gZWRnZVxuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoTmlkZ2V0LnNyY0F0dHJpYnV0ZSkpIGF3YWl0IHRoaXMucmV0cmlldmVTb3VyY2UodGhpcy5kYXRhQXR0cmlidXRlcygpKTtcbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0cmlidXRlKE5pZGdldC50ZW1wbGF0ZVNyY0F0dHJpYnV0ZSkpIGF3YWl0IHRoaXMucmV0cmlldmVUZW1wbGF0ZSh0aGlzLmRhdGFBdHRyaWJ1dGVzKCkpO1xuXG4gICAgICAgIC8vIG1hbmlwdWxhdGUgKGNzcykgc3R5bGVzIHByb2dyYW1tYXRpY2FsbHlcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIChldmVudCk9PnRoaXMub25Mb2FkKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRhcmdldCBvZiB0aGUgd2luZG93IGxvYWQgZXZlbnQuXG4gICAgICogT3ZlcnJpZGUgdGhpcyBtZXRob2QuXG4gICAgICovXG4gICAgb25Mb2FkKCl7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZSBhIG1hcCBvZiBhbGwgZGF0YSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybnMge01hcDxhbnksIGFueT59XG4gICAgICovXG4gICAgZGF0YUF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIGxldCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGZvciAobGV0IGF0dHIgb2YgdGhpcy5hdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBpZiAoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoXCJkYXRhLVwiKSkge1xuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gYXR0ci5uYW1lLnN1YnN0cig1KTtcbiAgICAgICAgICAgICAgICBtYXBbbmFtZV0gPSBhdHRyLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGEgc2hhZG93IGVsZW1lbnQgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIHRlbXBsYXRlIG5hbWVkICh0ZW1wbGF0ZUlEKS5cbiAgICAgKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgYXBwbHlUZW1wbGF0ZSh0ZW1wbGF0ZUlkKSB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRlbXBsYXRlSWQpO1xuXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHRocm93IG5ldyBFcnJvcihcIlRlbXBsYXRlICdcIiArIHRlbXBsYXRlSWQgKyBcIicgbm90IGZvdW5kLlwiKTtcbiAgICAgICAgaWYgKHRlbXBsYXRlLnRhZ05hbWUudG9VcHBlckNhc2UoKSAhPT0gXCJURU1QTEFURVwiKSB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtZW50IHdpdGggaWQgJ1wiICsgdGVtcGxhdGVJZCArIFwiJyBpcyBub3QgYSB0ZW1wbGF0ZS5cIik7XG5cbiAgICAgICAgdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6ICdvcGVuJ30pLmFwcGVuZENoaWxkKHRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGNvbnRlbnRzIG9mIGZpbGUgaW50byB0aGlzIGVsZW1lbnQuXG4gICAgICogUmVwbGFjZSBhbGwgJHt9IHZhcmlhYmxlcyB3aXRoIGNvbnRlbnRzIG9mICdtYXAnLlxuICAgICAqL1xuICAgIGFzeW5jIHJldHJpZXZlU291cmNlKG1hcCl7XG4gICAgICAgIGxldCBzcmMgPSB0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXQuc3JjQXR0cmlidXRlKTtcbiAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRGaWxlKHNyYywgbWFwKTtcbiAgICAgICAgdGhpcy5pbm5lckhUTUwgPSB0ZXh0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgY29udGVudHMgb2YgZmlsZSBhcyBhIHRlbXBsZXRlIGFuZCBhcHBseSB0aGF0IHRlbXBsYXRlIHRvIHRoaXMgZWxlbWVudC5cbiAgICAgKiBSZXBsYWNlIGFsbCAke30gdmFyaWFibGVzIHdpdGggY29udGVudHMgb2YgJ21hcCcuXG4gICAgICogVGhlIHRlbXBsYXRlIHdpbGwgYmUgZ2l2ZW4gdGhlIGlkIGRlcml2ZWQgZnJvbSB0aGUgc3JjIGF0dHJpYnV0ZS5cbiAgICAgKi9cbiAgICBhc3luYyByZXRyaWV2ZVRlbXBsYXRlKG1hcCl7XG4gICAgICAgIGxldCBzcmMgPSB0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXQudGVtcGxhdGVTcmNBdHRyaWJ1dGUpO1xuICAgICAgICBsZXQgaWQgPSBzcmMucmVwbGFjZSgvW1xcLy8gLi1dKy9nLCBcIl9cIik7XG5cbiAgICAgICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtpZH1gKSl7XG4gICAgICAgICAgICBsZXQgdGV4dCA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLmdldEZpbGUoc3JjLCBtYXApO1xuICAgICAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRlbXBsYXRlXCIpO1xuICAgICAgICAgICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gdGV4dDtcbiAgICAgICAgICAgIHRlbXBsYXRlLnNldEF0dHJpYnV0ZShcImlkXCIsIGlkKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2lkfWApO1xuICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogJ29wZW4nfSkuYXBwZW5kQ2hpbGQodGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSAnaGlkZGVuJyBjbGFzcy5cbiAgICAgKi9cbiAgICBzaG93KCkge1xuICAgICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkICdoaWRkZW4nIGNsYXNzLlxuICAgICAqL1xuICAgIGhpZGUoKSB7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGRpc2FibGVkIGZsYWcgdGhhdCBpcyByZWFkIGJ5IG5pZGdldCBtb3VzZSBmdW5jdGlvbnMuXG4gICAgICogQHBhcmFtIHZhbHVlXG4gICAgICovXG4gICAgc2V0IGRpc2FibGVkKHZhbHVlKXtcbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcImRhdGEtZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShcImRhdGEtZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBkaXNhYmxlZCBmbGFnIHRoYXQgaXMgcmVhZCBieSBuaWRnZXQgbW91c2UgZnVuY3Rpb25zLlxuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqL1xuICAgIGdldCBkaXNhYmxlZCgpe1xuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0cmlidXRlKFwiZGF0YS1kaXNhYmxlZFwiKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWRpc2FibGVkXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoaXMgZWxlbWVudCB3YXMgdW5kZXIgdGhlIG1vdXNlIGZvciB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHt0eXBlfSBldmVudFxuICAgICAqIEBwYXJhbSB7dHlwZX0gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNVbmRlck1vdXNlKGV2ZW50KSB7XG4gICAgICAgIGxldCB4ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG5cbiAgICAgICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50ID09PSB0aGlzKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1biB0aGUgcXVlcnkgc2VsZWN0b3Igb24gdGhpcyBlbGVtZW50LlxuICAgICAqIElmIHRoaXMgZWxlbWVudCBoYXMgYSBzaGFkb3csIHJ1biBpdCBvbiB0aGF0IGluc3RlYWQuXG4gICAgICogQHBhcmFtIHNlbGVjdG9yc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudFRhZ05hbWVNYXBbS119XG4gICAgICovXG4gICBxdWVyeVNlbGVjdG9yKHNlbGVjdG9ycykge1xuICAgICAgICBpZiAodGhpcy5zaGFkb3dSb290KXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1biB0aGUgcXVlcnkgc2VsZWN0b3Igb24gdGhpcyBlbGVtZW50LlxuICAgICAqIElmIHRoaXMgZWxlbWVudCBoYXMgYSBzaGFkb3csIHJ1biBpdCBvbiB0aGF0IGluc3RlYWQuXG4gICAgICogQHBhcmFtIHNlbGVjdG9yc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudFRhZ05hbWVNYXBbS119XG4gICAgICovXG4gICAgcXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpIHtcbiAgICAgICAgaWYgKHRoaXMuc2hhZG93Um9vdCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgdGhpcyBlbGVtZW50IGZyb20gaXQncyBwYXJlbnQuXG4gICAgICovXG4gICAgZGV0YWNoKCl7XG4gICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbmRleCB3aXRoaW4gdGhlIHBhcmVudCBlbGVtZW50LlxuICAgICAqL1xuICAgIGluZGV4KCl7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMucGFyZW50RWxlbWVudC5jaGlsZHJlbikuaW5kZXhPZih0aGlzKTtcbiAgICB9XG59XG5cbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1lbGVtZW50JywgTmlkZ2V0RWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEVsZW1lbnQ7IiwiJ3VzZSBzdHJpY3QnO1xuLyoqXG4gKiBNYW5pcHVsYXRlcyB0aGUgZWxlbWVudHMgc3R5bGUgd2l0aCBqcyByb3V0aW5lcyBhY2NvcmRpbmcgdG8gY3NzIGZsYWdzLlxuICogTmlkZ2V0IHN0eWxlIGlzIGFwcGxpZWQgdG8gYWxsIG5pZGdldC1lbGVtZW50cyB1bmxlc3MgdGhleSBoYXZlIHRoZSBuaWRnZXQtc3R5bGVcbiAqIGF0dHJpYnV0ZSBzZXQgdG8gJ2ZhbHNlJy5cbiAqL1xuXG5jbGFzcyBOaWRnZXRTdHlsZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihuaWRnZXQpIHtcbiAgICAgICAgdGhpcy5uaWRnZXQgPSBuaWRnZXQ7XG4gICAgICAgIHRoaXMuYXBwbHkoKTtcbiAgICB9XG4gICAgXG4gICAgYXBwbHkoKSB7XG4gICAgICAgIHRoaXMubmlkZ2V0V2lkdGhSYXRpbygpO1xuICAgICAgICB0aGlzLm5pZGdldEhlaWdodFJhdGlvKCk7XG4gICAgICAgIHRoaXMubmlkZ2V0Rml0VGV4dCgpO1xuICAgICAgICB0aGlzLm5pZGdldEZpdFRleHRXaWR0aCgpO1xuICAgICAgICB0aGlzLm5pZGdldFZlcnRBbGlnblRleHQoKTtcbiAgICB9XG4gICAgXG4gICAgbmlkZ2V0V2lkdGhSYXRpbygpIHtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LXdpZHRoLXJhdGlvXCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47ICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHsgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LndpZHRoID0gdGhpcy5uaWRnZXQuaGVpZ2h0ICogcmF0aW87XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxuICAgIH1cbiAgICBcbiAgICBuaWRnZXRIZWlnaHRSYXRpbygpIHtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWhlaWdodC1yYXRpb1wiKTtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuOyAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7ICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLm5pZGdldC5oZWlnaHQgPSB0aGlzLm5pZGdldC53aWR0aCAqIHJhdGlvO1xuICAgICAgICB9KS5vYnNlcnZlKHRoaXMubmlkZ2V0KTsgICAgICBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaWxsIHRoZSB0ZXh0IGhlaWdodCB0byBtYXRjaCB0aGUgZWxlbWVudCBoZWlnaHQuXG4gICAgICogQ2hhbmdlIHRoZSByYXRpbyB2YWx1ZSAob3IgdGhlIGZvbnRTaXplKSBhZGp1c3QuXG4gICAgICovXG4gICAgbmlkZ2V0Rml0VGV4dCgpIHtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0XCIpOyAgICAgICAgXG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjtcblxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYC0tbmlkZ2V0LWZpdC10ZXh0ICR7cmF0aW99YClcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5uaWRnZXQub2Zmc2V0SGVpZ2h0ICogcmF0aW87XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IGggKyBcInB4XCI7XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqICBXaWxsIGNoYW5nZSB0aGUgZm9udCBzaXplIHNvIHRoYXQgdGhlIHRleHQgZml0J3MgaW4gdGhlIHBhcmVudCBlbGVtZW50LlxuICAgICAqICBEb24ndCBzZXQgdGhlIHdpZHRoIG9mIHRoZSBlbGVtZW50LlxuICAgICAqL1xuICAgIG5pZGdldEZpdFRleHRXaWR0aCgpIHtcbiAgICAgICAgbGV0IHJlbW92ZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1maXQtdGV4dC13aWR0aFwiKTtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJlbW92ZSkpIHJldHVybjtcblxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudFxuXG4gICAgICAgICAgICBsZXQgdGV4dFcgPSB0aGlzLm5pZGdldC5zY3JvbGxXaWR0aDtcbiAgICAgICAgICAgIGxldCBjb250VyA9IHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICBjb250VyA9IGNvbnRXIC0gcmVtb3ZlO1xuICAgICAgICAgICAgbGV0IGR3ID0gY29udFcvdGV4dFc7XG4gICAgICAgICAgICBsZXQgY29tcHV0ZWRGb250U2l6ZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0LCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKCdmb250LXNpemUnKVxuICAgICAgICAgICAgY29tcHV0ZWRGb250U2l6ZSA9IHBhcnNlSW50KGNvbXB1dGVkRm9udFNpemUpO1xuICAgICAgICAgICAgY29tcHV0ZWRGb250U2l6ZSA9IE1hdGgucm91bmQoY29tcHV0ZWRGb250U2l6ZSk7XG4gICAgICAgICAgICBsZXQgbmV3Rm9udFNpemUgPSBNYXRoLnJvdW5kKGNvbXB1dGVkRm9udFNpemUgKiBkdyk7XG4gICAgICAgICAgICBsZXQgaCA9IHRoaXMubmlkZ2V0Lm9mZnNldEhlaWdodFxuXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoY29tcHV0ZWRGb250U2l6ZSAtIG5ld0ZvbnRTaXplKSA8PSAyKSByZXR1cm47XG5cbiAgICAgICAgICAgIGlmIChuZXdGb250U2l6ZSA+IGgpIG5ld0ZvbnRTaXplID0gaDtcblxuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBuZXdGb250U2l6ZSArIFwicHhcIjtcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBsaW5lIGhlaWdodCB0byB0aGUgb2Zmc2V0IGhlaWdodCBtdWx0aXBsaWVkIGJ5IHJhdGlvLlxuICAgICAqL1xuICAgIG5pZGdldFZlcnRBbGlnblRleHQoKXtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LXZlcnQtYWxpZ24tdGV4dFwiKTtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xuXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaCA9IHRoaXMubmlkZ2V0Lm9mZnNldEhlaWdodCAqIHJhdGlvO1xuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUubGluZUhlaWdodCA9IGggKyBcInB4XCI7XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRTdHlsZTsiLCIndXNlIHN0cmljdCc7XG5jbGFzcyBUcmFuc2Zvcm17XG4gICAgY29uc3RydWN0b3IodmFsdWUpe1xuICAgICAgICBsZXQgaW5kZXhPZiA9IHZhbHVlLmluZGV4T2YoXCIoXCIpO1xuICAgICAgICB0aGlzLm5hbWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgaW5kZXhPZik7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcodGhpcy5uYW1lLmxlbmd0aCArIDEsIHZhbHVlLmxlbmd0aCAtIDEpO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIiwgXCIgKyB0aGlzLnZhbHVlKTtcbiAgICB9XG4gICAgXG4gICAgdG9TdHJpbmcoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArIFwiKFwiICsgdGhpcy52YWx1ZSArIFwiKVwiO1xuICAgIH0gICAgXG59XG5cbmNsYXNzIFRyYW5zZm9ybWVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG4gICAgXG4gICAgYXBwZW5kKCl7XG4gICAgICAgIGxldCBjb21wdXRlZFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50KVtcInRyYW5zZm9ybVwiXTtcbiAgICAgICAgaWYgKGNvbXB1dGVkU3R5bGUgIT09IFwibm9uZVwiKSB0aGlzLnB1c2goY29tcHV0ZWRTdHlsZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBjbGVhcigpe1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gXCJcIjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHVuc2hpZnQodmFsdWUpe1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gdmFsdWUgKyBcIiBcIiArIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XG4gICAgfVxuICAgIFxuICAgIHB1c2godmFsdWUpe1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSArIFwiIFwiICsgdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gICAgXG4gICAgXG4gICAgc2hpZnQoKXtcbiAgICAgICAgbGV0IGFycmF5ID0gdGhpcy5zcGxpdCgpO1xuICAgICAgICBpZiAoYXJyYXkubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcbiAgICAgICAgYXJyYXkuc2hpZnQoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IGFycmF5LmpvaW4oXCIgXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcG9wKCl7XG4gICAgICAgIGxldCBhcnJheSA9IHRoaXMuc3BsaXQoKTtcbiAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIFwiXCI7XG4gICAgICAgIGFycmF5LnBvcCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XG4gICAgICAgIHJldHVybiB0aGlzOyAgICAgIFxuICAgIH1cbiAgICBcbiAgICByZXBsYWNlKHZhbHVlKXtcbiAgICAgICAgbGV0IG5ld1RyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0odmFsdWUpO1xuICAgICAgICBsZXQgYXJyYXkgPSB0aGlzLnNwbGl0KCk7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBlbnRyeSA9IGFycmF5W2ldO1xuICAgICAgICAgICAgbGV0IHRyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0oZW50cnkpO1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybS5uYW1lID09PSBuZXdUcmFuc2Zvcm0ubmFtZSl7XG4gICAgICAgICAgICAgICAgYXJyYXlbaV0gPSBuZXdUcmFuc2Zvcm0udG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHNwbGl0KCl7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XG4gICAgICAgIGxldCBzdGFydCA9IDA7XG4gICAgICAgIGxldCBydmFsdWUgPSBbXTtcbiAgICAgICAgbGV0IGxhc3QgPSAnJztcbiAgICAgICAgbGV0IHNraXAgPSBmYWxzZTtcbiAgICAgICAgbGV0IG5lc3RlZFAgPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBpZiAoIXNraXAgJiYgdmFsdWVbaV0gPT09ICcgJyAmJiBsYXN0ID09PSAnICcpe1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghc2tpcCAmJiB2YWx1ZVtpXSA9PT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgcnZhbHVlLnB1c2godmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCBpKSk7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVtpXSA9PT0gJygnKSB7XG4gICAgICAgICAgICAgICAgbmVzdGVkUCsrO1xuICAgICAgICAgICAgICAgIHNraXAgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVtpXSA9PT0gJyknKSB7XG4gICAgICAgICAgICAgICAgbmVzdGVkUC0tO1xuICAgICAgICAgICAgICAgIGlmIChuZXN0ZWRQID09PSAwKSBza2lwID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0ID0gdmFsdWVbaV07XG4gICAgICAgIH1cbiAgICAgICAgcnZhbHVlLnB1c2godmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCB2YWx1ZS5sZW5ndGgpKTtcbiAgICAgICAgcmV0dXJuIHJ2YWx1ZTtcbiAgICB9XG4gICAgXG4gICAgdG9TdHJpbmcoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zZm9ybWVyOyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIEEgTmlkZ2V0IHRoYXQgY2hhbmdlcyB0aGUgaW1hZ2UgZm9yIGhvdmVyLCBkaXNhYmxlZCwgcHJlc3MsIGFuZCBpZGxlLlxuICogRmlyZXMgYSBjbGljayBldmVudCB3aGVuIGNsaWNrZWQuXG4gKlxuICogV2lsbCBzZXQgdGhlIGN1cnJlbnQgc3RhdGUgYXMgZGF0YS1zdGF0ZSBzbyB0aGF0IGNzcyBjYW4gYWNjZXNzIGl0LlxuICovXG5jbGFzcyBOaWRnZXRCdXR0b24gZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgICAgICB0aGlzLmFscGhhVG9sZXJhbmNlID0gMDsgLy8gYWxwaGEgbmVlZHMgdG8gYmUgPiB0b2xlcmFuY2UgdG8gdHJpZ2dlciBldmVudHMuXG5cbiAgICAgICAgdGhpcy5zdHJpbmdIb3ZlciA9IFwibmlkZ2V0LWJ1dHRvbi1zdGF0ZVtzdGF0ZT0nSE9WRVInXVwiO1xuICAgICAgICB0aGlzLnN0cmluZ0Rpc2FibGVkID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdESVNBQkxFRCddXCI7XG4gICAgICAgIHRoaXMuc3RyaW5nUHJlc3MgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J1BSRVNTJ11cIjtcbiAgICAgICAgdGhpcy5zdHJpbmdJZGxlID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdJRExFJ11cIjtcblxuICAgICAgICB0aGlzLnN0YXRlID0gXCJpZGxlXCI7XG4gICAgfVxuXG4gICAgaXNJblNldCgpIHtcbiAgICAgICAgbGV0IHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgICAgICAgd2hpbGUgKHBhcmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAocGFyZW50LnRhZ05hbWUgPT09IFwiTklER0VULUJVVFRPTi1TRVRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIG5pZGdldFJlYWR5KCkge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0Rpc2FibGVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc0luU2V0KCkpIHJldHVybjtcblxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIHRoaXMubW91c2VFbnRlcik7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZUxlYXZlKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2VQcmVzcyk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVJlbGVhc2UpO1xuXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgaXNVbmRlcihldmVudCkge1xuICAgICAgICBsZXQgZWxlbWVudHMgPSBkb2N1bWVudC5lbGVtZW50c0Zyb21Qb2ludChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmluZGV4T2YodGhpcy5hY3RpdmVOaWRnZXQpID09IC0xKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmFjdGl2ZU5pZGdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYIC0gcmVjdC54O1xuICAgICAgICBsZXQgeSA9IGV2ZW50LmNsaWVudFkgLSByZWN0Lnk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudGVzdEFscGhhKHgsIHkpO1xuICAgIH1cblxuICAgIGdldCBkaXNhYmxlZCgpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmRpc2FibGVkO1xuICAgIH1cblxuICAgIHNldCBkaXNhYmxlZCh2YWx1ZSkge1xuICAgICAgICBzdXBlci5kaXNhYmxlZCA9IHZhbHVlO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0Rpc2FibGVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImluXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcInByZXNzXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdQcmVzcztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW91c2VSZWxlYXNlKGUpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0hvdmVyO1xuICAgIH1cblxuICAgIG1vdXNlUHJlc3MoZSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJwcmVzc1wiO1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nUHJlc3M7XG4gICAgfVxuXG4gICAgaGlkZUFsbEltYWdlcygpIHtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nSG92ZXIpLmhpZGUoKTtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nRGlzYWJsZWQpLmhpZGUoKTtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nUHJlc3MpLmhpZGUoKTtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nSWRsZSkuaGlkZSgpO1xuICAgIH1cblxuICAgIHNldCBhY3RpdmVOaWRnZXQoc2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5oaWRlQWxsSW1hZ2VzKCk7XG4gICAgICAgIHRoaXMuX2FjdGl2ZU5pZGdldCA9IHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIHRoaXMuX2FjdGl2ZU5pZGdldC5zaG93KCk7XG4gICAgfVxuXG4gICAgZ2V0IGFjdGl2ZU5pZGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGl2ZU5pZGdldDtcbiAgICB9XG5cbiAgICBzZXQgc3RhdGUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgc3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtc3RhdGVcIik7XG4gICAgfVxuXG4gICAgdGVzdEFscGhhKHgsIHkpIHtcbiAgICAgICAgbGV0IHBpeGVsID0gdGhpcy5hY3RpdmVOaWRnZXQuZ2V0UGl4ZWwoeCwgeSk7XG4gICAgICAgIHJldHVybiBwaXhlbFszXSA+IHRoaXMuYWxwaGFUb2xlcmFuY2U7XG4gICAgfVxuXG4gICAgbW91c2VMZWF2ZSgpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdJZGxlO1xuICAgIH1cblxuICAgIG1vdXNlQWN0aXZlKCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XG4gICAgfVxuXG4gICAgbW91c2VNb3ZlKGUpIHtcbiAgICAgICAgaWYgKCF0aGlzLnRlc3RBbHBoYShlLmNsaWVudFgsIGUuY2xpZW50WSkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdJZGxlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcbiAgICAgICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XG4gICAgICAgIH1cbiAgICB9XG59XG47XG5cbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1idXR0b24nLCBOaWRnZXRCdXR0b24pO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRCdXR0b247XG5cbiIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XHJcblxyXG5jbGFzcyBOaWRnZXRCdXR0b25TZXQgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xyXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgdGhpcy5hbHBoYVRvbGVyYW5jZSA9IDA7IC8vIGFscGhhIG5lZWRzIHRvIGJlID4gdG9sZXJhbmNlIHRvIHRyaWdnZXIgZXZlbnRzLlxyXG5cclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZVByZXNzKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VSZWxlYXNlKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmUpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZUxlYXZlKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVkKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbmlkZ2V0UmVhZHkoKXtcclxuICAgICAgICB0aGlzLmJ1dHRvbnMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoXCJuaWRnZXQtYnV0dG9uXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlUHJlc3MoZSl7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNVbmRlcihlKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZVByZXNzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJwcmVzc1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlUmVsZWFzZShlKXtcclxuICAgICAgICB0aGlzLnN0YXRlID0gXCJvdXRcIjtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5zdGF0ZSA9PSBcInByZXNzXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJidXR0b24tY2xpY2tlZFwiLCB7ZGV0YWlsOiBlbGVtZW50fSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZVJlbGVhc2UoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcImhvdmVyXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VNb3ZlKGUpe1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5idXR0b25zKXtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNVbmRlcihlKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZUFjdGl2ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQubW91c2VMZWF2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlTGVhdmUoZSl7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5tb3VzZUxlYXZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXQgc3RhdGUodmFsdWUpe1xyXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiLCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHN0YXRlKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiKTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWJ1dHRvbi1zZXQnLCBOaWRnZXRCdXR0b25TZXQpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEJ1dHRvblNldDsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIEEgTmlkZ2V0IHRoYXQgY2hhbmdlcyB0aGUgaW1hZ2UgZm9yIGhvdmVyLCBkaXNhYmxlZCwgcHJlc3MsIGFuZCBpZGxlLlxuICogRmlyZXMgYSBjbGljayBldmVudCB3aGVuIGNsaWNrZWQuXG4gKiBcbiAqIFRoaXMgaXMgdGhlIGh0bWwgZWxlbWVudCBcIm5pZGdldC1idXR0b25cIi5cbiAqIElmIHRoZSBuaWRnZXQtYnV0dG9uIGhhcyB0aGUgYXR0cmlidXRlIGBpbWctcHJlZml4ID0gXCJwcmVmaXhcImAgdGhlbiB0aGUgXG4gKiBmb2xsb3dpbmcgaW1hZ2VzLiAgYGltZy1zdWZmaXhgID0gXCJzdWZmaXhcIiB3aWxsIG92ZXJyaWRlIHRoZSBcIi5wbmdcIi5cbiAqIHdpbGwgYmUgdXNlZDpcbiAqIC0gcHJlZml4LWhvdmVyLnBuZ1xuICogLSBwcmVmaXgtZGlzYWJsZWQucG5nXG4gKiAtIHByZWZpeC1wcmVzcy5wbmdcbiAqIC0gcHJlZml4LWlkbGUucG5nXG4gKi9cbmNsYXNzIE5pZGdldEJ1dHRvblN0YXRlIGV4dGVuZHMgTmlkZ2V0IHtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgIH1cblxuICAgIG5pZGdldFJlYWR5KCl7XG4gICAgICAgIHRoaXMuaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgdGhpcy5pbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIHRoaXMuZ2V0QXR0cmlidXRlKFwiaW1hZ2Utc3JjXCIpKTtcbiAgICAgICAgdGhpcy5hcHBlbmQodGhpcy5pbWcpO1xuICAgIH1cblxuICAgIHNob3coKXtcbiAgICAgICAgc3VwZXIuc2hvdygpO1xuICAgICAgICB0aGlzLmxvYWRDYW52YXMoKTtcbiAgICB9XG5cbiAgICBsb2FkQ2FudmFzKCl7XG4gICAgICAgIGlmICghdGhpcy5pbWcgfHwgdGhpcy5jYW52YXMpIHJldHVybjtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmltZy5uYXR1cmFsV2lkdGg7XG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuaW1nLm5hdHVyYWxIZWlnaHQ7XG4gICAgICAgIHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJykuZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzO1xuICAgIH1cblxuICAgIGdldFBpeGVsKHgsIHkpe1xuICAgICAgICB0aGlzLmxvYWRDYW52YXMoKTtcbiAgICAgICAgbGV0IGR4ID0gdGhpcy5jYW52YXMud2lkdGggLyB0aGlzLm9mZnNldFdpZHRoO1xuICAgICAgICBsZXQgZHkgPSB0aGlzLmNhbnZhcy5oZWlnaHQgLyB0aGlzLm9mZnNldEhlaWdodDtcbiAgICAgICAgbGV0IHBpeGVsID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5nZXRJbWFnZURhdGEoZHggKiB4LCBkeSAqIHksIDEsIDEpLmRhdGE7XG4gICAgICAgIHJldHVybiBwaXhlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgc3RhdGUgdG8gSE9WRVIsIERJU0FCTEVELCBQUkVTUywgSURMRS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHN0YXRlXG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHNldCBzdGF0ZShzdGF0ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInN0YXRlXCIsIHN0YXRlLnRvVXBwZXJDYXNlKCkpO1xuICAgIH1cblxuICAgIGdldCBzdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cmlidXRlKFwic3RhdGVcIik7XG4gICAgfVxuXG4gICAgc2V0IHNvdXJjZShpbWcpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgaW1nKTtcbiAgICB9XG5cbiAgICBnZXQgc291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyaWJ1dGUoXCJzcmNcIik7XG4gICAgfVxufVxuO1xuXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtYnV0dG9uLXN0YXRlJywgTmlkZ2V0QnV0dG9uU3RhdGUpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRCdXR0b25TdGF0ZTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBjb21wb25lbnQgdGhhdCBoYXMgZXZlbnRzIGZvciBhZGRpbmcgbmlkZ2V0cywgcmVtb3ZpbmcgbmlkZ2V0cywgYW5kIFxuICogcmVzaXppbmcgdGhlIGNvbnRhaW5lci4gIFdoZW4gdGhlIGNvbnRhaW5lciBzaXplIGlzIGNoYW5nZWQsIHRoZSBudW1iZXJcbiAqIG9mIGNvbXBvbmVudHMgY2hhbmdlLCBvciB0aGUgbGF5b3V0IGF0dHJpYnV0ZSBjaGFuZ2VzLCB0aGUgZG9MYXlvdXQgZnVuY3Rpb25cbiAqIGlzIGNhbGxlZC5cbiAqIFxuICogVGhlIGNvbXBvbmVudHMgYXJlIGFycmFnZWQgYWNjb3JkaW5nIHRvIHRoZSBzZWxlY3RlZCBsYXlvdXQgYXR0cmlidXRlLiAgSWYgXG4gKiBubyBsYXlvdXQgYXR0cmlidXRlIGlzIGNob3NlbiwgZG9MYXlvdXQgaXMgc3RpbGwgY2FsbGVkIGFzIGl0IGlzIGFzc3VtZWQgXG4gKiBhIGN1c3RvbSBmdW5jdGlvbiBoYXMgYmVlbiBwcm92aWRlZC5cbiAqL1xuXG5jbGFzcyBOaWRnZXRDb250YWluZXIgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICAgICAgbGV0IHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHRoaXMuZG9MYXlvdXQpO1xuICAgICAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKHRoaXMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4gW05pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGVdO1xuICAgIH1cblxuICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgaWYgKG9sZFZhbHVlID09PSBuZXdWYWx1ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmRvTGF5b3V0KCk7XG4gICAgfVxuXG4gICAgc2V0IGxheW91dCh2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShOaWRnZXRDb250YWluZXIubGF5b3V0QXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IGxheW91dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGUpO1xuICAgIH0gICAgICBcblxuICAgIGRvTGF5b3V0KCkge1xuICAgICAgICBpZiAoIXRoaXMubGF5b3V0KSByZXR1cm47XG4gICAgICAgIGlmICghTGF5b3V0c1t0aGlzLmxheW91dF0pIHRocm93IGBpbnZhbGlkIGxheW91dDogJHt0aGlzLmxheW91dH1gO1xuICAgICAgICBMYXlvdXRzW3RoaXMubGF5b3V0XTtcbiAgICB9XG59XG5cbmNsYXNzIExheW91dHMge1xuICAgIC8qKlxuICAgICAqIEZpdCBhbGwgbmlkZ2V0cyBldmVubHkgaW4gYSBob3Jpem9udGFsIHJvdy5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IG5pZGdldFxuICAgICAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcm93KG5pZGdldCkge1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpemUpO1xuICAgIH1cbn1cblxuXG5OaWRnZXRDb250YWluZXIubGF5b3V0QXR0cmlidXRlID0gXCJsYXlvdXRcIjtcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1jb250YWluZXInLCBOaWRnZXRDb250YWluZXIpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRDb250YWluZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0XCIpO1xuY29uc3QgVHJhbnNmb3JtZXIgPSByZXF1aXJlKFwiLi4vVHJhbnNmb3JtZXJcIik7XG5cbi8qKlxuICogRG9uJ3QgZm9yZ2V0IHRvIHNldCAnaXMnIHdoZW4gcHV0dGluZyBlbGVtZW50IGRpcmVjdGx5IGluIGh0bWwgYXMgb3Bwb3NlZCB0b1xuICogcHJvZ3JhbWljYWxseS5cbiAqIDxpbWcgaXM9XCJyZWdpc3RlcmVkLW5hbWVcIiBzcmM9XCJpbWFnZS5wbmdcIj48L2ltZz5cbiAqIFxuICogaW5jbHVkZSBhIGN1c3RvbSBlbGVtZW50IGRlZmluaXRpb24gYXQgdGhlIGVuZCBvZiB0aGUgY2xhc3MuPGJyPlxuICogd2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgncmVnaXN0ZXJlZC1uYW1lJywgQ2xhc3MsIHtleHRlbmRzOiBcImltZ1wifSk7XG4gKi9cbmNsYXNzIE5pZGdldEhUTUxJbWFnZSBleHRlbmRzIEhUTUxJbWFnZUVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmxhc3REaXNwbGF5ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybWVyKHRoaXMpO1xuICAgIH1cblxuICAgIHNjYWxlKGR3LCBkaCkge1xuICAgICAgICBpZiAoIWRoKSBkaCA9IGR3O1xuICAgICAgICBsZXQgdyA9IHRoaXMud2lkdGggKiBkdztcbiAgICAgICAgbGV0IGggPSB0aGlzLmhlaWdodCAqIGRoO1xuICAgICAgICB0aGlzLndpZHRoID0gdztcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoO1xuICAgIH0gICAgICAgIFxuXG4gICAgc2V0IHNyYyh2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInNyY1wiLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IHNyYygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwic3JjXCIpO1xuICAgIH1cblxuICAgIGxvY2F0ZShsZWZ0LCB0b3ApIHtcbiAgICAgICAgdGhpcy5sZWZ0ID0gbGVmdDtcbiAgICAgICAgdGhpcy50b3AgPSB0b3A7XG4gICAgfVxuXG4gICAgZ2V0IGxlZnQoKSB7XG4gICAgICAgIGxldCB3ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykubGVmdDtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodyk7XG4gICAgfVxuXG4gICAgZ2V0IHRvcCgpIHtcbiAgICAgICAgbGV0IGggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS50b3A7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGgpO1xuICAgIH1cblxuICAgIHNldCBsZWZ0KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc3R5bGUubGVmdCA9IHZhbHVlICsgXCJweFwiO1xuICAgIH1cblxuICAgIHNldCB0b3AodmFsdWUpIHtcbiAgICAgICAgdGhpcy5zdHlsZS50b3AgPSB2YWx1ZSArIFwicHhcIjtcbiAgICB9ICAgIFxuXG4gICAgc2V0IHdpZHRoKHcpIHtcbiAgICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IHcgKyBcInB4XCI7XG4gICAgfVxuXG4gICAgc2V0IGhlaWdodCh3KSB7XG4gICAgICAgIHRoaXMuc3R5bGUuaGVpZ2h0ID0gdyArIFwicHhcIjtcbiAgICB9XG5cbiAgICBnZXQgd2lkdGgoKSB7XG4gICAgICAgIGxldCB3ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykud2lkdGg7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHcpO1xuICAgIH1cblxuICAgIGdldCBoZWlnaHQoKSB7XG4gICAgICAgIGxldCBoID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykuaGVpZ2h0O1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChoKTtcbiAgICB9ICAgICAgICBcblxuICAgIHNob3coKSB7XG4gICAgICAgIGlmICh0aGlzLmxhc3REaXNwbGF5KSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSB0aGlzLmxhc3REaXNwbGF5O1xuICAgICAgICAgICAgdGhpcy5sYXN0RGlzcGxheSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoaWRlKCkge1xuICAgICAgICB0aGlzLmxhc3REaXNwbGF5ID0gdGhpcy5zdHlsZS5kaXNwbGF5O1xuICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG5cbiAgICBzZXQgZGlzcGxheSh2YWx1ZSl7XG4gICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IHZhbHVlO1xuICAgIH1cbiAgICBcbiAgICBnZXQgZGlzcGxheSgpe1xuICAgICAgICByZXR1cm4gd2luZG93LmNhbGN1bGF0ZVN0eWxlKHRoaXMpW1wiZGlzcGxheVwiXTtcbiAgICB9XG5cbiAgICBkZXRhY2goKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcih0aGlzKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBzZXQgZGlzYWJsZWQodmFsdWUpe1xuICAgICAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgZGlzYWJsZWQoKXtcbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dHJpYnV0ZShcImRpc2FibGVkXCIpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xuICAgIH0gICAgXG4gICAgXG4gICAgY2xlYXJQb3MoKXtcbiAgICAgICAgdGhpcy5zdHlsZS50b3AgPSBudWxsO1xuICAgICAgICB0aGlzLnN0eWxlLmxlZnQgPSBudWxsO1xuICAgIH1cblxuICAgIGNsZWFyRGltcygpe1xuICAgICAgICB0aGlzLnN0eWxlLndpZHRoID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdHlsZS5oZWlnaHQgPSBudWxsO1xuICAgIH0gICAgXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0SFRNTEltYWdlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBOaWRnZXQgdGhhdCBjb250YWlucyBpbWFnZXMuXG4gKi9cbmNsYXNzIE5pZGdldEltYWdlIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcihzcmMpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgIGlmIChzcmMpIHRoaXMuc3JjID0gc3JjO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCl7XG4gICAgICAgIGxldCBzcmMgPSB0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXRJbWFnZS5zcmNBdHRyaWJ1dGUpOyAgICAgICAgXG4gICAgICAgIGlmIChzcmMpIHRoaXMuaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCBzcmMpOyAgICAgICBcbiAgICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLmltZyk7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgZ2V0IHNyYygpe1xuICAgICAgICByZXR1cm4gdGhpcy5pbWcuZ2V0QXR0cmlidXRlKFwic3JjXCIpO1xuICAgIH1cblxuICAgIHNldCBzcmModmFsdWUpe1xuICAgICAgICB0aGlzLmltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdmFsdWUpO1xuICAgIH1cblxuICAgIHNpemUod2lkdGgsIGhlaWdodCl7XG4gICAgICAgIHRoaXMuc3R5bGUud2lkdGggPSB3aWR0aFxuICAgICAgICB0aGlzLnN0eWxlLmhlaWdodCA9IGhlaWdodFxuICAgICAgICB0aGlzLmltZy5zdHlsZS53aWR0aCA9IHdpZHRoXG4gICAgICAgIHRoaXMuaW1nLnN0eWxlLmhlaWdodCA9IGhlaWdodFxuICAgIH1cbiAgICBcbiAgICBzY2FsZShkdywgZGgpe1xuICAgICAgICBpZiAoIWRoKSBkaCA9IGR3O1xuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLm9mZnNldFdpZHRoICogZHc7XG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLm9mZnNldEhlaWdodCAqIGRoO1xuICAgICAgICB0aGlzLnNpemUoYCR7d2lkdGh9cHhgLCBgJHtoZWlnaHR9cHhgKTtcbiAgICB9XG4gICAgXG4gICAgc2hvdygpe1xuICAgICAgICBpZiAodGhpcy5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIil7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5zdHlsZS5kaXNwbGF5O1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGhpZGUoKXtcbiAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxufVxuXG5OaWRnZXRJbWFnZS5zcmNBdHRyaWJ1dGUgPSBcInNyY1wiO1xud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWltYWdlJywgTmlkZ2V0SW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRJbWFnZTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyoqXG4gKiBXaGVuIHVzaW5nIC0tbmlkZ2V0LWZpdC10ZXh0LCBkbyBub3QgaW5jbHVkZSBoZWlnaHQgYW5kIHdpZHRoIGF0dHJpYnV0ZXMuXG4gKiBBIGZvbnQgc2l6ZSBjYW4gYmUgdXNlZCBhcyBhIHN0YXJ0aW5nIHBvaW50LlxuICovXG5jbGFzcyBGaXRUZXh0IHtcbiAgICBjb25zdHJ1Y3RvcihuaWRnZXQpe1xuICAgICAgICB0aGlzLm5pZGdldCA9IG5pZGdldDtcbiAgICAgICAgdGhpcy5sb2NrID0gXCJub25lXCI7XG4gICAgICAgIHRoaXMucGFyc2VBcmd1bWVudHMoKTtcbiAgICB9XG5cbiAgICBsaXN0ZW4oKXtcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKT0+dGhpcy5kZWxheVJlc2l6ZSh0aGlzLmhWYWx1ZSwgdGhpcy53VmFsdWUpKTtcbiAgICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQpO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XG4gICAgICAgIHRoaXMuZGVsYXkgPSAyNTtcbiAgICAgICAgdGhpcy5kZWxheVJlc2l6ZSh0aGlzLmhWYWx1ZSwgdGhpcy53VmFsdWUpO1xuICAgICAgICB0aGlzLnN0b3AgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBkZWxheVJlc2l6ZShoVmFsdWUsIHdWYWx1ZSl7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcbiAgICAgICAgaWYgKHRoaXMudGltZW91dCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PnRoaXMub25SZXNpemUoaFZhbHVlLCB3VmFsdWUpLCB0aGlzLmRlbGF5KTtcbiAgICB9XG5cbiAgICBub3RpZnkoaFZhbHVlLCB3VmFsdWUpe1xuICAgICAgICB0aGlzLnN0b3AgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZWxheVJlc2l6ZShoVmFsdWUsIHdWYWx1ZSk7XG4gICAgfVxuXG4gICAgcGFyc2VBcmd1bWVudHMoKXtcbiAgICAgICAgbGV0IGFyZ3MgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtZml0LXRleHRcIik7XG5cbiAgICAgICAgaWYgKCFhcmdzIHx8IGFyZ3MgPT09IGZhbHNlIHx8IGFyZ3MgPT09IFwiZmFsc2VcIil7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhWYWx1ZSA9IHRoaXMud1ZhbHVlID0gdHJ1ZTtcblxuICAgICAgICBpZiAodHlwZW9mKGFyZ3MpID09IFwic3RyaW5nXCIpe1xuICAgICAgICAgICAgbGV0IG9iaiA9IEpTT04ucGFyc2UoYXJncyk7XG4gICAgICAgICAgICBpZiAob2JqW1wiZml0XCJdICE9PSB1bmRlZmluZWQgJiYgb2JqW1wiZml0XCJdID09PSBcIndpZHRoXCIpIHRoaXMuaFZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAob2JqW1wiZml0XCJdICE9PSB1bmRlZmluZWQgJiYgb2JqW1wiZml0XCJdID09PSBcImhlaWdodFwiKSB0aGlzLndWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKG9ialtcImxvY2tcIl0gIT09IHVuZGVmaW5lZCkgdGhpcy5sb2NrID0gKG9ialtcImxvY2tcIl0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25SZXNpemUoaFZhbHVlLCB3VmFsdWUpe1xuICAgICAgICBkZWxldGUgdGhpcy50aW1lb3V0O1xuXG4gICAgICAgIGlmICh0aGlzLnN0b3ApIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMubmlkZ2V0LnRleHRDb250ZW50ID09PSBcIlwiKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRXaWR0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5uaWRnZXQuc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIpIHJldHVybjtcblxuICAgICAgICBpZiAoIWhWYWx1ZSAmJiAhd1ZhbHVlKSByZXR1cm47XG5cbiAgICAgICAgbGV0IGhEaXIgPSB0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAtIHRoaXMubmlkZ2V0LnNjcm9sbEhlaWdodDtcbiAgICAgICAgbGV0IHdEaXIgPSB0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC0gdGhpcy5uaWRnZXQuc2Nyb2xsV2lkdGg7XG5cbiAgICAgICAgaWYgKCFoVmFsdWUpIGhEaXIgPSAwO1xuICAgICAgICBpZiAoIXdWYWx1ZSkgd0RpciA9IDA7XG5cbiAgICAgICAgbGV0IGRpciA9IE1hdGguc2lnbihoRGlyIHwgd0Rpcik7IC8vIHdpbGwgcHJlZmVyIHRvIHNocmlua1xuICAgICAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09IDApIHRoaXMuZGlyZWN0aW9uID0gZGlyOyAvLyBrZWVwIHByZXZpb3VzIGRpcmVjdGlvblxuXG4gICAgICAgIGxldCBmb250U2l6ZSA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpW1wiZm9udC1zaXplXCJdKVxuICAgICAgICBsZXQgbmV3U2l6ZSA9IGZvbnRTaXplICsgKHRoaXMuZGlyZWN0aW9uKTtcblxuICAgICAgICBpZiAobmV3U2l6ZSAhPT0gZm9udFNpemUgJiYgdGhpcy5kaXJlY3Rpb24gPT09IGRpcikge1xuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBuZXdTaXplICsgXCJweFwiO1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZW91dCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT50aGlzLm9uUmVzaXplKGhWYWx1ZSwgd1ZhbHVlKSwgdGhpcy5kZWxheSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGlyIDwgMCAmJiB0aGlzLmRpcmVjdGlvbiA+IDApIHsgLy8gcmV2ZXJzZSBkaXJlY3Rpb24gaWYgZ3Jvd2luZyB0b28gbGFyZ2VcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gLTE7XG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT50aGlzLm9uUmVzaXplKGhWYWx1ZSwgd1ZhbHVlKSwgdGhpcy5kZWxheSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2NrID09PSBcInZoXCIpIHtcbiAgICAgICAgICAgICAgICBsZXQgZm9udFJhdGlvID0gbmV3U2l6ZSAvIHdpbmRvdy5pbm5lckhlaWdodCAqIDEwMDtcbiAgICAgICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IGZvbnRSYXRpbyArIFwidmhcIjtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmxvY2sgPT09IFwidndcIil7XG4gICAgICAgICAgICAgICAgbGV0IGZvbnRSYXRpbyA9IG5ld1NpemUgLyB3aW5kb3cuaW5uZXJXaWR0aCAqIDEwMDtcbiAgICAgICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IGZvbnRSYXRpbyArIFwidndcIjtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAwO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEEgbmlkZ2V0IGVsZW1lbnQgZm9yIGRpc3BsYXlpbmcgdGV4dC5cbiAqIHB1dCAnLS1uaWRnZXQtZml0LXRleHQ6IDEuMDsnIGludG8gY3NzIGZvciB0aGlzIGVsZW1lbnQgdG8gZW5hYmxlIHNjYWxpbmcuXG4gKiBzZWU6IE5pZGdldFN0eWxlLmpzXG4gKi9cbmNsYXNzIE5pZGdldFRleHQgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm9ic2VydmVyc1tcImZpdC10ZXh0LXdpZHRoLXRvbGVyYW5jZVwiXSA9IDAuMDI7XG4gICAgfVxuXG4gICAgcmVtb3ZlKCl7XG4gICAgICAgIGlmICh0aGlzLmZpdFRleHQpIHtcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dC5zdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dC5vYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIucmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgc2V0IHRleHQodmFsdWUpe1xuICAgICAgICB0aGlzLmlubmVyVGV4dCA9IHZhbHVlO1xuICAgICAgICBpZiAodGhpcy5maXRUZXh0ICYmIHRoaXMuZml0VGV4dC5zdG9wID09PSBmYWxzZSl7XG4gICAgICAgICAgICB0aGlzLmZpdFRleHQuZGVsYXlSZXNpemUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCB0ZXh0KCl7XG4gICAgICAgIHJldHVybiB0aGlzLmlubmVyVGV4dDtcbiAgICB9XG5cbiAgICBzY2FsZShhbW91bnQpIHtcbiAgICAgICAgbGV0IHN0eWxlRm9udFNpemUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKFwiZm9udC1zaXplXCIpO1xuICAgICAgICBsZXQgZm9udFNpemUgPSBwYXJzZUZsb2F0KHN0eWxlRm9udFNpemUpO1xuICAgICAgICB0aGlzLnN0eWxlLmZvbnRTaXplID0gKGZvbnRTaXplICogYW1vdW50KSArIFwicHhcIjtcbiAgICB9XG5cbiAgICBhcHBseVN0eWxlKCkge1xuICAgICAgICBzdXBlci5hcHBseVN0eWxlKCk7XG5cbiAgICAgICAgdGhpcy5pbml0Rml0VGV4dCgpO1xuICAgICAgICBsZXQgZml0UHJvcCA9IGdldENvbXB1dGVkU3R5bGUodGhpcykuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0XCIpO1xuXG4gICAgICAgIGlmIChmaXRQcm9wICE9PSB1bmRlZmluZWQgJiYgZml0UHJvcCAhPT0gXCJcIil7XG4gICAgICAgICAgICB0aGlzLmZpdFRleHQubGlzdGVuKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYW4gY2FsbCBtdWx0aXBsZSB0aW1lcyB0byBjaGFuZ2UgdGhlIGxvY2sgdmFsdWUuXG4gICAgICogQHBhcmFtIChzdHJpbmcpIGxvY2sgdmggPSBsb2NrIHRvIHZpZXcgaGVpZ2h0LCB2dyA9IGxvY2sgdG8gdmlldyB3aWR0aFxuICAgICAqL1xuICAgIGluaXRGaXRUZXh0KGxvY2spe1xuICAgICAgICBpZiAoIXRoaXMuZml0VGV4dCl7XG4gICAgICAgICAgICB0aGlzLmZpdFRleHQgPSBuZXcgRml0VGV4dCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobG9jaykgdGhpcy5maXRUZXh0LmxvY2sgPSBsb2NrO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgbGluZSBoZWlnaHQgdG8gdGhlIG9mZnNldCBoZWlnaHQgbXVsdGlwbGllZCBieSByYXRpby5cbiAgICAgKiBDYWxsaW5nIHRoaXMgbWV0aG9kIGRpcmVjdG9yeSB3aWxsIG92ZXJyaWRlIHRoZSB2YWx1ZSBzZXQgYnkgY3NzXG4gICAgICovXG4gICAgbmlkZ2V0VmVydEFsaWduVGV4dCh2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkoXCItLW5pZGdldC12ZXJ0LWFsaWduLXRleHRcIiwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9uUmVzaXplID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtdmVydC1hbGlnbi10ZXh0XCIpO1xuICAgICAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IGggPSB0aGlzLm9mZnNldEhlaWdodCAqIHJhdGlvO1xuICAgICAgICAgICAgdGhpcy5zdHlsZS5saW5lSGVpZ2h0ID0gaCArIFwicHhcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9ic2VydmVycy52ZXJ0QWxpZ25UZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLnZlcnRBbGlnblRleHQgPSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUpO1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMudmVydEFsaWduVGV4dC5vYnNlcnZlKHRoaXMpXG4gICAgICAgIH1cbiAgICAgICAgb25SZXNpemUoKVxuICAgIH1cblxuICAgIHZlcnRBbGlnblRleHQocmF0aW8gPSAxLjApe1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XG4gICAgICAgIGxldCBoID0gdGhpcy5vZmZzZXRIZWlnaHQgKiByYXRpbztcbiAgICAgICAgdGhpcy5zdHlsZS5saW5lSGVpZ2h0ID0gaCArIFwicHhcIjtcbiAgICB9XG59XG47XG5cbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC10ZXh0JywgTmlkZ2V0VGV4dCk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldFRleHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBkcmFnSGFuZGxlciA9IHJlcXVpcmUoXCIuLi9EcmFnSGFuZGxlclwiKS5pbnN0YW5jZTtcblxuXG5mdW5jdGlvbiBvbkRyYWdTdGFydChldmVudCl7ICAgIFxuICAgIGRyYWdIYW5kbGVyLnNldCh0aGlzKTtcbiAgICB3aW5kb3cueCA9IHRoaXM7XG4gICAgY29uc29sZS5sb2coXCInXCIgKyB0aGlzLm5hbWUoKSArIFwiJ1wiKTtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdTdGFydFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25EcmFnRW5kKGV2ZW50KXtcbiAgICBpZiAoZHJhZ0hhbmRsZXIuZ2V0KCkgIT09IHRoaXMpIHJldHVybjtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdFbmRcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG4gICAgZHJhZ0hhbmRsZXIuY2xlYXIoKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5zZXRBdHRyaWJ1dGUoXCJkcmFnZ2FibGVcIiwgXCJ0cnVlXCIpOyAgIFxuICAgIFxuICAgIG5pZGdldC5vbkRyYWdTdGFydCA9IG9uRHJhZ1N0YXJ0LmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25EcmFnRW5kID0gb25EcmFnRW5kLmJpbmQobmlkZ2V0KTtcbiAgICBcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnc3RhcnRcIiwgbmlkZ2V0Lm9uRHJhZ1N0YXJ0KTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW5kXCIsIG5pZGdldC5vbkRyYWdFbmQpOyAgICBcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBkcmFnSGFuZGxlciA9IHJlcXVpcmUoXCIuLi9EcmFnSGFuZGxlclwiKS5pbnN0YW5jZTtcbmNvbnN0IE1vdXNlVXRpbGl0aWVzID0gcmVxdWlyZShcIi4uL01vdXNlVXRpbGl0aWVzXCIpO1xuXG5mdW5jdGlvbiBvbkRyYWdPdmVyKGV2ZW50KXtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxldCBkcmFnTmlkZ2V0ID0gZHJhZ0hhbmRsZXIuZ2V0KCk7XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnT3ZlclwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzLCBkcmFnTmlkZ2V0KTtcbn1cblxuZnVuY3Rpb24gb25EcmFnRW50ZXIoZXZlbnQpe1xuICAgIGlmICghZHJhZ0hhbmRsZXIuaGFzKCkpIHJldHVybjtcbiAgICBpZiAoIWRyYWdIYW5kbGVyLnB1c2hPdmVyKHRoaXMpKSByZXR1cm47XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnRW50ZXJcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uRHJhZ0xlYXZlKGV2ZW50KXtcbiAgICBpZiAoIWRyYWdIYW5kbGVyLmhhcygpKSByZXR1cm47XG4gICAgaWYgKE1vdXNlVXRpbGl0aWVzLmlzVW5kZXIodGhpcy5nZXRFbGVtZW50KCkpKSByZXR1cm47XG4gICAgaWYgKCFkcmFnSGFuZGxlci5yZW1vdmVPdmVyKHRoaXMpKSByZXR1cm47XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnTGVhdmVcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uRHJvcChldmVudCl7XG4gICAgbGV0IGRyYWdOaWRnZXQgPSBkcmFnSGFuZGxlci5nZXQoKTtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyb3BcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcywgZHJhZ05pZGdldCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBuaWRnZXQub25EcmFnT3ZlciA9IG9uRHJhZ092ZXIuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbkRyb3AgPSBvbkRyb3AuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbkRyYWdFbnRlciA9IG9uRHJhZ0VudGVyLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25EcmFnTGVhdmUgPSBvbkRyYWdMZWF2ZS5iaW5kKG5pZGdldCk7XG4gICAgXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgbmlkZ2V0Lm9uRHJhZ092ZXIpO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgbmlkZ2V0Lm9uRHJvcCk7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIG5pZGdldC5vbkRyYWdFbnRlcik7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2xlYXZlXCIsIG5pZGdldC5vbkRyYWdMZWF2ZSk7ICAgIFxufTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE1vdXNlVXRpbGl0aWVzID0gcmVxdWlyZShcIi4uL01vdXNlVXRpbGl0aWVzXCIpO1xuXG5mdW5jdGlvbiBvbkNsaWNrKGV2ZW50KXsgICAgXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJjbGlja1wiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZURvd24oZXZlbnQpeyAgICBcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcIm1vdXNlRG93blwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZVVwKGV2ZW50KXsgICAgXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZVVwXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlRW50ZXIoZXZlbnQpeyAgICBcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcIm1vdXNlRW50ZXJcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VMZWF2ZShldmVudCl7XG4gICAgaWYgKE1vdXNlVXRpbGl0aWVzLmlzVW5kZXIodGhpcy5nZXRFbGVtZW50KCkpKSByZXR1cm47XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZUV4aXRcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBjb25zb2xlLmxvZyhcIm1vdXNlIHNldHVwXCIpO1xuICAgIFxuICAgIG5pZGdldC5vbkNsaWNrID0gb25DbGljay5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uTW91c2VEb3duID0gb25Nb3VzZURvd24uYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbk1vdXNlVXAgPSBvbk1vdXNlVXAuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbk1vdXNlRW50ZXIgPSBvbk1vdXNlRW50ZXIuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbk1vdXNlTGVhdmUgPSBvbk1vdXNlTGVhdmUuYmluZChuaWRnZXQpO1xuICAgIFxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIG5pZGdldC5vbkNsaWNrKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgbmlkZ2V0Lm9uTW91c2VEb3duKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG5pZGdldC5vbk1vdXNlVXApO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgbmlkZ2V0Lm9uTW91c2VFbnRlcik7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgbmlkZ2V0Lm9uTW91c2VMZWF2ZSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogRW5hYmxlIHRoZSBuaWRnZXQgdG8gYmUgbW92ZWQgYnkgZHJhZ2dpbmcuICBXaWxsIGRyYWcgYnkgYW55IGNoaWxkIGVsZWVtZW50XG4gKiB0aGUgJy5uaWRnZXQtaGVhZGVyJyBjbGFzcywgb3RoZXJ3aXNlIG1vdmFibGUgYnkgY2xpY2tpbmcgYW55d2hlcmUuXG4gKiBAcGFyYW0ge3R5cGV9IGVcbiAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAqL1xuXG5mdW5jdGlvbiBvbk1vdXNlTW92ZShlKXsgICAgXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICghdGhpcy5fX21vdmFibGUuYWN0aXZlKSByZXR1cm47ICAgIFxuXG4gICAgLy8gY2FsY3VsYXRlIHRoZSBuZXcgY3Vyc29yIHBvc2l0aW9uOlxuICAgIGxldCBkZWx0YVggPSB0aGlzLl9fbW92YWJsZS5sYXN0WCAtIGUuY2xpZW50WDtcbiAgICBsZXQgZGVsdGFZID0gdGhpcy5fX21vdmFibGUubGFzdFkgLSBlLmNsaWVudFk7XG4gICAgdGhpcy5fX21vdmFibGUubGFzdFggPSBlLmNsaWVudFg7XG4gICAgdGhpcy5fX21vdmFibGUubGFzdFkgPSBlLmNsaWVudFk7XG4gICAgXG4gICAgLy8gc2V0IHRoZSBlbGVtZW50J3MgbmV3IHBvc2l0aW9uOlxuICAgIHRoaXMuc3R5bGUudG9wID0gKHRoaXMub2Zmc2V0VG9wIC0gZGVsdGFZKSArIFwicHhcIjtcbiAgICB0aGlzLnN0eWxlLmxlZnQgPSAodGhpcy5vZmZzZXRMZWZ0IC0gZGVsdGFYKSArIFwicHhcIjtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZURvd24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuX19tb3ZhYmxlLmFjdGl2ZSA9IHRydWU7XG4gICAgXG4gICAgLy8gZ2V0IHRoZSBtb3VzZSBjdXJzb3IgcG9zaXRpb24gYXQgc3RhcnR1cDpcbiAgICB0aGlzLl9fbW92YWJsZS5sYXN0WCA9IGUuY2xpZW50WDtcbiAgICB0aGlzLl9fbW92YWJsZS5sYXN0WSA9IGUuY2xpZW50WTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZVVwKGUpe1xuICAgIHRoaXMuX19tb3ZhYmxlLmFjdGl2ZSA9IGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgbmlkZ2V0Ll9fbW92YWJsZSA9IHtcbiAgICAgICAgbGFzdFggOiAwLFxuICAgICAgICBsYXN0WSA6IDAsXG4gICAgICAgIGFjdGl2ZSA6IGZhbHNlXG4gICAgfTtcbiAgICBcbiAgICBuaWRnZXQub25Nb3VzZURvd24gPSBvbk1vdXNlRG93bi5iaW5kKG5pZGdldCk7ICAgICAgICBcbiAgICBcbiAgICBpZiAobmlkZ2V0LnF1ZXJ5U2VsZWN0b3IoXCIubmlkZ2V0LWhlYWRlclwiKSl7XG4gICAgICAgIG5pZGdldC5xdWVyeVNlbGVjdG9yKFwiLm5pZGdldC1oZWFkZXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBuaWRnZXQub25Nb3VzZURvd24pOyAgICAgICAgXG4gICAgfSBlbHNlIHtcbiAgICAgICAgbmlkZ2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgbmlkZ2V0Lm9uTW91c2VEb3duKTtcbiAgICB9XG4gICAgXG4gICAgbmlkZ2V0Lm9uTW91c2VNb3ZlID0gb25Nb3VzZU1vdmUuYmluZChuaWRnZXQpOyAgICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBuaWRnZXQub25Nb3VzZU1vdmUpO1xuXG4gICAgbmlkZ2V0Lm9uTW91c2VVcCA9IG9uTW91c2VVcC5iaW5kKG5pZGdldCk7ICAgIFxuICAgIG5pZGdldC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBuaWRnZXQub25Nb3VzZVVwKTtcblxufTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRcIik7XG53aW5kb3cuTmlkZ2V0ID0gTmlkZ2V0O1xuXG4vKipcbiAqIEFkZCBhIHJlc2l6ZSBvYnNlcnZlciB0byB0aGUgZWxlbWVudCB0aGF0IHdpbGwgY2FsbCBhIG9uUmVzaXplKCkgZnVuY3Rpb24uXG4gKiBUaGUgcGFyYW1ldGVycyBwYXNzZWQgaW4gYXJlIChwcmV2aW91c19kaW1lbnNpb25zKS4gIFRvIHVzZSBhZGRcbiAqIGludGVyZmFjZXM9XCJyZXNpemVcIiB0byB0aGUgZWxlbWVudCBpbiBodG1sIGFuZCBhIG1ldGhvZCBvblJlc2l6ZSgpIHRvIHRoZSBcbiAqIGNsYXNzIG9iamVjdC4gIElmIHRoZXJlIGlzIG5vIGNsYXNzIG9iamVjdCBjcmVhdGUgYSBmdW5jdGlvbiBhbmQgYmluZCBpdC5cbiAqIGllOiBlbGVtZW50Lm9uUmVzaXplID0gZnVuY3Rpb24uYmluZChlbGVtZW50KTsgXG4gKi9cblxubGV0IG9uUmVzaXplID0gZnVuY3Rpb24oKXtcbiAgICBsZXQgZGF0YSA9IHRoaXNbTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZF0ucmVzaXplO1xuICAgIGxldCBwcmV2ID0gZGF0YS5wcmV2O1xuICAgIGlmICghdGhpcy5vblJlc2l6ZSkgcmV0dXJuO1xuICAgIHRoaXMub25SZXNpemUocHJldik7XG4gICAgbG9hZFByZXZpb3VzKHRoaXMpO1xufTtcblxubGV0IGxvYWRQcmV2aW91cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgbGV0IGRhdGEgPSBuaWRnZXRbTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZF0ucmVzaXplO1xuICAgIGRhdGEucHJldiA9IHtcbiAgICAgICAgd2lkdGggOiBuaWRnZXQub2Zmc2V0V2lkdGgsXG4gICAgICAgIGhlaWdodCA6IG5pZGdldC5vZmZzZXRIZWlnaHRcbiAgICB9OyAgICBcbn07XG5cbi8qKlxuICogU2V0dXAgYSByZXNpemUgb2JzZXJ2ZXIgZm9yIHRoZSBuaWRnZXQgdGhhdCB0cmlnZ2VycyB0aGUgb25SZXNpemUgbWV0aG9kIGlmIFxuICogYXZhaWxhYmxlLlxuICogLSBvblJlc2l6ZSh0aGlzLCBwcmV2aW91c19kaW1lbnNpb25zKSA6IG5vbmVcbiAqIEBwYXJhbSB7dHlwZX0gbmlkZ2V0XG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBpZiAodHlwZW9mKG5pZGdldCkgIT09IFwib2JqZWN0XCIpIHRocm93IG5ldyBcIk9iamVjdCBleGVjdGVkXCI7XG4gICAgbGV0IHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKG9uUmVzaXplLmJpbmQobmlkZ2V0KSk7XG4gICAgcmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZShuaWRnZXQpO1xuICAgIGxvYWRQcmV2aW91cyhuaWRnZXQpO1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBBYnN0cmFjdE1vZGVsIDogcmVxdWlyZShcIi4vQWJzdHJhY3RNb2RlbFwiKSxcbiAgICBOaWRnZXRFbGVtZW50IDogcmVxdWlyZShcIi4vTmlkZ2V0RWxlbWVudFwiKSxcbiAgICBGaWxlT3BlcmF0aW9ucyA6IHJlcXVpcmUoXCIuL0ZpbGVPcGVyYXRpb25zXCIpLFxuICAgIE5pZGdldEJ1dHRvblNldCA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblNldFwiKSxcbiAgICBOaWRnZXRCdXR0b24gOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b25cIiksXG4gICAgTmlkZ2V0QnV0dG9uU3RhdGUgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b25TdGF0ZVwiKSxcbiAgICBOaWRnZXRJbWFnZSA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEltYWdlXCIpLFxuICAgIE5pZGdldEhUTUxJbWFnZSA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEhUTUxJbWFnZVwiKSxcbiAgICBOaWRnZXRUZXh0IDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0VGV4dFwiKSxcbiAgICBOaWRnZXRDb250YWluZXIgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRDb250YWluZXJcIiksXG4gICAgTW91c2VVdGlsaXRpZXMgOiByZXF1aXJlKFwiLi9Nb3VzZVV0aWxpdGllc1wiKSxcbiAgICBDb25zdGFudHM6IHJlcXVpcmUoXCIuL05pZGdldFwiKSxcbiAgICBsYXlvdXRzOiB7fVxufTsiLCJjb25zdCBGaWxlT3BzID0gcmVxdWlyZShcIi4vbW9kdWxlcy9GaWxlT3BzLmpzXCIpO1xyXG5jb25zdCBNZW51ID0gcmVxdWlyZShcIi4vbW9kdWxlcy9NZW51LmpzXCIpO1xyXG5jb25zdCBRdWVzdGlvblBhbmUgPSByZXF1aXJlKFwiLi9tb2R1bGVzL1F1ZXN0aW9uUGFuZS5qc1wiKTtcclxuY29uc3QgRWRpdG9yUGFuZSA9IHJlcXVpcmUoXCIuL21vZHVsZXMvRWRpdG9yUGFuZS5qc1wiKTtcclxuY29uc3QgTW9kZWwgPSByZXF1aXJlKFwiLi9tb2R1bGVzL01vZGVsXCIpO1xyXG5cclxucmVxdWlyZShcIkB0aGFlcmlvdXMvbmlkZ2V0XCIpXHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvR2FtZUJvYXJkLmpzXCIpO1xyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL011bHRpcGxlQ2hvaWNlUGFuZS5qc1wiKTtcclxuXHJcbmxldCBmaWxlT3BzID0gbmV3IEZpbGVPcHMoKTtcclxubGV0IG1vZGVsID0gbnVsbDtcclxubGV0IHF1ZXN0aW9uUGFuZSA9IG51bGw7XHJcbmxldCBlZGl0b3JQYW5lID0gbnVsbDtcclxuXHJcbndpbmRvdy5vbmxvYWQgPSBhc3luYyAoKSA9PiB7XHJcbiAgICBuZXcgTWVudSgpLmluaXQoXCIjbWVudVwiKTtcclxuICAgIHBhcnNlVVJMUGFyYW1ldGVycygpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgZmlsZU9wcy5sb2FkQ2xpZW50KCk7XHJcbiAgICAgICAgcXVlc3Rpb25QYW5lID0gbmV3IFF1ZXN0aW9uUGFuZSgpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAod2luZG93LnBhcmFtZXRlcnMuYWN0aW9uID09PSBcImxvYWRcIikge1xyXG4gICAgICAgIGxldCBmaWxlID0gYXdhaXQgZmlsZU9wcy5nZXQod2luZG93LnBhcmFtZXRlcnMuZmlsZUlkKTtcclxuICAgICAgICBsZXQgbW9kZWwgPSBKU09OLnBhcnNlKGZpbGUuYm9keSk7XHJcbiAgICAgICAgd2luZG93Lm1vZGVsID0gbW9kZWwgPSBuZXcgTW9kZWwoZmlsZU9wcykuc2V0KG1vZGVsKTtcclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtbmFtZVwiKS50ZXh0Q29udGVudCA9IHdpbmRvdy5tb2RlbC5uYW1lO1xyXG4gICAgZWRpdG9yUGFuZSA9IG5ldyBFZGl0b3JQYW5lKHdpbmRvdy5tb2RlbCk7XHJcbiAgICBlZGl0b3JQYW5lLm9uU2F2ZSA9IHNhdmVNb2RlbDtcclxuICAgIHF1ZXN0aW9uUGFuZS5vblNhdmUgPSBzYXZlTW9kZWw7XHJcbiAgICBxdWVzdGlvblBhbmUub25DbG9zZSA9ICgpID0+IGVkaXRvclBhbmUudXBkYXRlVmlldygpO1xyXG4gICAgZWRpdG9yUGFuZS51cGRhdGVOYW1lID0gcmVuYW1lTW9kZWw7XHJcbiAgICBlZGl0b3JQYW5lLnVwZGF0ZVZpZXcoKTtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZ2FtZS1ib2FyZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2VsbC1zZWxlY3RcIiwgKGV2ZW50KT0+e1xyXG4gICAgICAgIGxldCByb3cgPSBldmVudC5kZXRhaWwucm93O1xyXG4gICAgICAgIGxldCBjb2wgPSBldmVudC5kZXRhaWwuY29sO1xyXG4gICAgICAgIHF1ZXN0aW9uUGFuZS5zaG93UXVlc3Rpb24od2luZG93Lm1vZGVsLmdldENlbGwocm93LCBjb2wpKTtcclxuICAgICAgICBlZGl0b3JQYW5lLmhpZGVBbGwoKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzYXZlTW9kZWwoKSB7XHJcbiAgICBmaWxlT3BzLnNldEJvZHkod2luZG93LnBhcmFtZXRlcnMuZmlsZUlkLCBKU09OLnN0cmluZ2lmeSh3aW5kb3cubW9kZWwuZ2V0KCksIG51bGwsIDIpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuYW1lTW9kZWwoKSB7XHJcbiAgICBsZXQgbmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1uYW1lXCIpLnRleHRDb250ZW50O1xyXG4gICAgZmlsZU9wcy5yZW5hbWUod2luZG93LnBhcmFtZXRlcnMuZmlsZUlkLCBuYW1lICsgXCIuanNvblwiKTtcclxuICAgIHdpbmRvdy5tb2RlbC5uYW1lID0gbmFtZTtcclxuICAgIHNhdmVNb2RlbCgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZVVSTFBhcmFtZXRlcnMoKSB7XHJcbiAgICB3aW5kb3cucGFyYW1ldGVycyA9IHt9O1xyXG4gICAgY29uc3QgcGFyYW1ldGVycyA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpLnNwbGl0KFwiJlwiKTtcclxuICAgIGZvciAoY29uc3QgcGFyYW1ldGVyIG9mIHBhcmFtZXRlcnMpIHtcclxuICAgICAgICBjb25zdCBzcGxpdCA9IHBhcmFtZXRlci5zcGxpdCgvPS8pO1xyXG4gICAgICAgIHdpbmRvdy5wYXJhbWV0ZXJzW3NwbGl0WzBdXSA9IHNwbGl0WzFdID8/IFwiXCI7XHJcbiAgICB9XHJcbn0iLCIvLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZHJpdmUvYXBpL3YzL3F1aWNrc3RhcnQvanM/aGw9ZW5cclxuXHJcbmNsYXNzIEFic3RyYWN0RmlsZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgcmVxdWlyZShcIi4vZ29vZ2xlRmllbGRzLmpzXCIpKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkQ2xpZW50KCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5sb2FkKCdjbGllbnQ6YXV0aDInLCAoKT0+dGhpcy5fX2luaXRDbGllbnQocmVzb2x2ZSwgcmVqZWN0KSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgX19pbml0Q2xpZW50KHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGdhcGkuY2xpZW50LmluaXQoe1xyXG4gICAgICAgICAgICBhcGlLZXk6IHRoaXMuZGV2ZWxvcGVyS2V5LFxyXG4gICAgICAgICAgICBjbGllbnRJZDogdGhpcy5jbGllbnRJZCxcclxuICAgICAgICAgICAgZGlzY292ZXJ5RG9jczogdGhpcy5kaXNjb3ZlcnlEb2NzLFxyXG4gICAgICAgICAgICBzY29wZTogdGhpcy5zY29wZVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0RmlsZTsiLCJjb25zdCBNb2RlbCA9IHJlcXVpcmUoXCIuL01vZGVsLmpzXCIpO1xyXG5cclxuY2xhc3MgRWRpdG9yUGFuZXtcclxuICAgIGNvbnN0cnVjdG9yKGdhbWVNb2RlbCkge1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsID0gZ2FtZU1vZGVsO1xyXG4gICAgICAgIHRoaXMudHJpYW5nbGVSaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdHJpYW5nbGUtcmlnaHRcIik7XHJcbiAgICAgICAgdGhpcy50cmlhbmdsZUxlZnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RyaWFuZ2xlLWxlZnRcIik7XHJcbiAgICAgICAgdGhpcy5yb3VuZExhYmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyb3VuZC1udW1iZXJcIik7XHJcbiAgICAgICAgdGhpcy5nYW1lTmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1uYW1lXCIpO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVRyaWFuZ2xlVmlldygpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtYWRkLWNhdGVnb3J5XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVNb2RlbC5hZGRDYXRlZ29yeVJvdW5kKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVHJpYW5nbGVWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1hZGQtbXVsdGlwbGUtY2hvaWNlXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVNb2RlbC5hZGRNdWx0aXBsZUNob2ljZVJvdW5kKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVHJpYW5nbGVWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1yZW1vdmUtcm91bmRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLm1lbnVSZW1vdmUoKSk7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LWhvbWUtc2NyZWVuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy5tZW51SG9tZSgpKTtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtdmFsdWUtcGx1c1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMubWVudVBsdXMoKSk7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LXZhbHVlLW1pbnVzXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy5tZW51TWludXMoKSk7XHJcblxyXG4gICAgICAgIHRoaXMudHJpYW5nbGVSaWdodC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PiB0aGlzLm5leHRSb3VuZCgpKTtcclxuICAgICAgICB0aGlzLnRyaWFuZ2xlTGVmdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PiB0aGlzLnByZXZSb3VuZCgpKTtcclxuICAgICAgICAvLyB0aGlzLmdhbWVOYW1lLmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsICgpPT4gdGhpcy51cGRhdGVOYW1lKCkpO1xyXG4gICAgICAgIHRoaXMuZ2FtZU5hbWUuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGV2ZW50KT0+dGhpcy5pbnB1dE5hbWUoZXZlbnQpKTtcclxuXHJcbiAgICAgICAgdGhpcy5vblNhdmUgPSBmdW5jdGlvbigpe307IC8vIHNldCB0aGlzIGluIG1haW4gdG8gc2F2ZSAuanNvbiBtb2RlbFxyXG4gICAgICAgIHRoaXMudXBkYXRlTmFtZSA9IGZ1bmN0aW9uKCl7fTsgLy8gY2FsbGVkIHRvIGNoYW5nZSB0aGUgZmlsZSBuYW1lXHJcbiAgICB9XHJcblxyXG4gICAgaW5wdXROYW1lKGV2ZW50KXtcclxuICAgICAgICB3aW5kb3cuZSA9IGV2ZW50O1xyXG4gICAgICAgIGlmIChldmVudC53aGljaCA9PT0gMTMpe1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU5hbWUoKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtYm9hcmQtY29udGFpbmVyXCIpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZUFsbCgpe1xyXG4gICAgICAgIHRoaXMudHJpYW5nbGVMZWZ0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy50cmlhbmdsZVJpZ2h0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlVHJpYW5nbGVWaWV3KCl7XHJcbiAgICAgICAgdGhpcy50cmlhbmdsZUxlZnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLnRyaWFuZ2xlUmlnaHQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBpZiAodGhpcy5nYW1lTW9kZWwuY3VycmVudFJvdW5kID09PSAwKSB0aGlzLnRyaWFuZ2xlTGVmdC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLmdhbWVNb2RlbC5jdXJyZW50Um91bmQgPj0gdGhpcy5nYW1lTW9kZWwucm91bmRDb3VudCAtIDEpIHRoaXMudHJpYW5nbGVSaWdodC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMucm91bmRMYWJlbC50ZXh0Q29udGVudCA9IFwiUm91bmQgXCIgKyAodGhpcy5nYW1lTW9kZWwuY3VycmVudFJvdW5kICsgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlVmlldyhtb2RlbCkge1xyXG4gICAgICAgIG1vZGVsID0gbW9kZWwgPz8gdGhpcy5nYW1lTW9kZWw7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUcmlhbmdsZVZpZXcoKTtcclxuICAgICAgICBtb2RlbCA9IG1vZGVsID8/IHdpbmRvdy5tb2RlbDtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYW1lLWJvYXJkXCIpLmhpZGUoKTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm11bHRpcGxlLWNob2ljZS1wYW5lXCIpLmhpZGUoKTtcclxuXHJcbiAgICAgICAgaWYgKG1vZGVsLmdldFJvdW5kKCkudHlwZSA9PT0gTW9kZWwucXVlc3Rpb25UeXBlLkNBVEVHT1JZKSB0aGlzLmNhdGVnb3J5Vmlldyhtb2RlbCk7XHJcbiAgICAgICAgaWYgKG1vZGVsLmdldFJvdW5kKCkudHlwZSA9PT0gTW9kZWwucXVlc3Rpb25UeXBlLk1VTFRJUExFX0NIT0lDRSkgdGhpcy5tdWx0aXBsZUNob2ljZVZpZXcobW9kZWwpO1xyXG4gICAgfVxyXG5cclxuICAgIG11bHRpcGxlQ2hvaWNlVmlldygpe1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjYXRlZ29yeVZpZXcobW9kZWwpe1xyXG4gICAgICAgIGxldCBnYW1lQm9hcmQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWUtYm9hcmRcIik7XHJcbiAgICAgICAgaWYgKCFnYW1lQm9hcmQpIHRocm93IG5ldyBFcnJvcihcIkdhbWUgYm9hcmQgbm90IGZvdW5kXCIpO1xyXG4gICAgICAgIGdhbWVCb2FyZC5zaG93KCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDY7IGNvbCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjb2x1bW4gPSBtb2RlbC5nZXRDb2x1bW4oY29sKTtcclxuXHJcbiAgICAgICAgICAgIGdhbWVCb2FyZC5nZXRIZWFkZXIoY29sKS5pbml0Rml0VGV4dChcInZoXCIpO1xyXG4gICAgICAgICAgICBnYW1lQm9hcmQuc2V0SGVhZGVyKGNvbCwgY29sdW1uLmNhdGVnb3J5LCBjb2x1bW4uZm9udHNpemUpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgNTsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIGdhbWVCb2FyZC5zZXRDZWxsKHJvdywgY29sLCBjb2x1bW4uY2VsbFtyb3ddLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGlmIChjb2x1bW4uY2VsbFtyb3ddLnEgPT09IFwiXCIpIGdhbWVCb2FyZC5zZXRDb21wbGV0ZShyb3csIGNvbCwgXCJmYWxzZVwiKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNvbHVtbi5jZWxsW3Jvd10uYSA9PT0gXCJcIikgZ2FtZUJvYXJkLnNldENvbXBsZXRlKHJvdywgY29sLCBcInBhcnRpYWxcIik7XHJcbiAgICAgICAgICAgICAgICBlbHNlIGdhbWVCb2FyZC5zZXRDb21wbGV0ZShyb3csIGNvbCwgXCJ0cnVlXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5leHRSb3VuZCgpe1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLmN1cnJlbnRSb3VuZCsrO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVHJpYW5nbGVWaWV3KCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJldlJvdW5kKCl7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwuY3VycmVudFJvdW5kLS07XHJcbiAgICAgICAgdGhpcy51cGRhdGVUcmlhbmdsZVZpZXcoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBtZW51UGx1cygpe1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLmluY3JlYXNlVmFsdWUoKTtcclxuICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgfVxyXG5cclxuICAgIG1lbnVNaW51cygpe1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLmRlY3JlYXNlVmFsdWUoKTtcclxuICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgfVxyXG5cclxuICAgIG1lbnVSZW1vdmUoKXtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5yZW1vdmVSb3VuZCgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVHJpYW5nbGVWaWV3KCk7XHJcbiAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBtZW51SG9tZSgpe1xyXG4gICAgICAgIGxvY2F0aW9uLmhyZWYgPSBcImhvbWUuaHRtbFwiO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvclBhbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vIHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9kcml2ZS9hcGkvdjMvcXVpY2tzdGFydC9qcz9obD1lblxyXG5cclxuY29uc3QgQWJzdHJhY3RGaWxlcyA9IHJlcXVpcmUoXCIuL0Fic3RyYWN0RmlsZS5qc1wiKTtcclxuXHJcbmNsYXNzIEZpbGVPcHMgZXh0ZW5kcyBBYnN0cmFjdEZpbGVze1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGNyZWF0ZSgpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgIG5hbWUgOiBGaWxlT3BzLmZpbGVuYW1lLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50czogWydhcHBEYXRhRm9sZGVyJ10sXHJcbiAgICAgICAgICAgICAgICBmaWVsZHM6IFwiaWRcIlxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0LmlkKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGRlbGV0ZShmaWxlSWQpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuZGVsZXRlKHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZCA6IGZpbGVJZFxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0KTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGxpc3QoKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmxpc3Qoe1xyXG4gICAgICAgICAgICAgICAgLy8gcTogYG5hbWUgY29udGFpbnMgJy5qc29uJ2AsXHJcbiAgICAgICAgICAgICAgICBzcGFjZXM6ICdhcHBEYXRhRm9sZGVyJyxcclxuICAgICAgICAgICAgICAgIGZpZWxkczogJ2ZpbGVzL25hbWUsZmlsZXMvaWQsZmlsZXMvbW9kaWZpZWRUaW1lJ1xyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0LmZpbGVzKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldChmaWxlSWQpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuZ2V0KHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZDogZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgYWx0OiAnbWVkaWEnXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBzZXRCb2R5KGZpbGVJZCwgYm9keSl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5yZXF1ZXN0KHtcclxuICAgICAgICAgICAgICAgIHBhdGggOiBcInVwbG9hZC9kcml2ZS92My9maWxlcy9cIiArIGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIG1ldGhvZCA6IFwiUEFUQ0hcIixcclxuICAgICAgICAgICAgICAgIHBhcmFtcyA6IHtcclxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRUeXBlIDogXCJtZWRpYVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaGVhZGVycyA6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiIDogXCJhcHBsaWNhdGlvbi9qc29uXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBib2R5IDogYm9keVxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcy5ib2R5KSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZW5hbWUoZmlsZUlkLCBmaWxlbmFtZSl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkOiBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBmaWxlbmFtZVxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcy5ib2R5KSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuRmlsZU9wcy5maWxlbmFtZSA9IFwiR2FtZSBOYW1lLmpzb25cIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wczsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKiBWaWV3LUNvbnRyb2xsZXIgZm9yIHRoZSBIVE1MIGdhbWUgYm9hcmQgZWxlbWVudCAgICAgICAgICAgICAqKi9cclxuLyoqIFRoaXMgaXMgdGhlIGNsYXNzaWNhbCBcIkplb3BhcmR5XCIgdHlwZSBib2FyZCAgICAgICAgICAgICAgICAgKiovXHJcbi8qKiBUaGlzIGlzIG1vZGVsIGFnbm9zdGljLCBzZWUgRWRpdG9yUGFuZS5qcyBmb3IgbW9kZWwgbWV0aG9kcyAqKi9cclxuXHJcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiQFRoYWVyaW91cy9uaWRnZXRcIikuTmlkZ2V0RWxlbWVudDtcclxuY29uc3QgRmlsZU9wcyA9IHJlcXVpcmUoXCIuL0ZpbGVPcHMuanNcIik7XHJcbmxldCBmaWxlT3BzID0gbmV3IEZpbGVPcHMoKTtcclxuXHJcbmZ1bmN0aW9uIGhlYWRlckNoYW5nZUxpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICBldmVudC50YXJnZXQuZml0VGV4dC5ub3RpZnkoMSwgMSk7XHJcbiAgICBsZXQgY29sID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0LnBhcmVudEVsZW1lbnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1jb2xcIikpO1xyXG4gICAgd2luZG93Lm1vZGVsLmdldENvbHVtbihjb2wpLmNhdGVnb3J5ID0gZXZlbnQudGFyZ2V0LnRleHQ7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGhlYWRlckZvY3VzTGlzdGVuZXIoZXZlbnQpIHtcclxuICAgIGxldCBjb2wgPSBwYXJzZUludChldmVudC50YXJnZXQucGFyZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWNvbFwiKSk7XHJcbiAgICBldmVudC50YXJnZXQudGV4dCA9IHdpbmRvdy5tb2RlbC5nZXRDb2x1bW4oY29sKS5jYXRlZ29yeTtcclxuICAgIHdpbmRvdy5tb2RlbC5nZXRDb2x1bW4oY29sKS5mb250c2l6ZSA9IGV2ZW50LnRhcmdldC5zdHlsZVtcImZvbnQtc2l6ZVwiXTtcclxuICAgIGF3YWl0IGZpbGVPcHMuc2V0Qm9keSh3aW5kb3cucGFyYW1ldGVycy5maWxlSWQsIEpTT04uc3RyaW5naWZ5KHdpbmRvdy5tb2RlbC5nZXQoKSwgbnVsbCwgMikpO1xyXG59XHJcblxyXG5jbGFzcyBDZWxsU2VsZWN0RXZlbnQgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3Rvcihyb3csIGNvbCkge1xyXG4gICAgICAgIHN1cGVyKCdjZWxsLXNlbGVjdCcsXHJcbiAgICAgICAgICAgICAge2RldGFpbCA6IHtyb3cgOiByb3csIGNvbCA6IGNvbCB9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEdhbWVCb2FyZCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgYXN5bmMgKCk9PntcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IGZpbGVPcHMubG9hZENsaWVudCgpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYWRkTGlzdGVuZXJzKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TW9kZWwobW9kZWwpe1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBhZGRMaXN0ZW5lcnMoKSB7XHJcbiAgICAgICAgbGV0IGdhbWVCb2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZS1ib2FyZFwiKTtcclxuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCA2OyBjb2wrKykge1xyXG4gICAgICAgICAgICBnYW1lQm9hcmQuZ2V0SGVhZGVyKGNvbCkuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGhlYWRlckNoYW5nZUxpc3RlbmVyKTtcclxuICAgICAgICAgICAgZ2FtZUJvYXJkLmdldEhlYWRlcihjb2wpLmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIGhlYWRlckZvY3VzTGlzdGVuZXIpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgNTsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIGdhbWVCb2FyZC5nZXRDZWxsKHJvdywgY29sKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ2VsbFNlbGVjdEV2ZW50KHJvdywgY29sKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgdmFsdWUgb2YgYSBjYXRlZ29yeVxyXG4gICAgICogQHBhcmFtIGluZGV4XHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBzZXRIZWFkZXIoaW5kZXgsIHZhbHVlLCBmb250U2l6ZSl7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLmdldEhlYWRlcihpbmRleCk7XHJcbiAgICAgICAgZWxlbWVudC50ZXh0ID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKGZvbnRTaXplKSBlbGVtZW50LnN0eWxlW1wiZm9udC1zaXplXCJdID0gZm9udFNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRyaWV2ZSB0aGUgaGVhZGVyIGh0bWwgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIGluZGV4XHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqL1xyXG4gICAgZ2V0SGVhZGVyKGluZGV4KXtcclxuICAgICAgICBpZiAodHlwZW9mIGluZGV4ICE9PSBcIm51bWJlclwiIHx8IGluZGV4IDwgMCB8fCBpbmRleCA+IDYpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5kZXg6IFwiICsgaW5kZXgpO1xyXG4gICAgICAgIGxldCBzZWxlY3RvciA9IGBbZGF0YS1yb3c9J2gnXVtkYXRhLWNvbD0nJHtpbmRleH0nXSA+IC52YWx1ZWA7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIHZhbHVlIG9mIGEgbm9uLWNhdGVnb3J5IGNlbGwuXHJcbiAgICAgKiBAcGFyYW0gcm93XHJcbiAgICAgKiBAcGFyYW0gY29sXHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqL1xyXG4gICAgc2V0Q2VsbChyb3csIGNvbCwgdmFsdWUgPSBcIlwiKXtcclxuICAgICAgICB0aGlzLmdldENlbGwocm93LCBjb2wpLnRleHRDb250ZW50ID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2VsbChyb3csIGNvbCl7XHJcbiAgICAgICAgbGV0IHNlbGVjdG9yID0gYFtkYXRhLXJvdz1cIiR7cm93fVwiXVtkYXRhLWNvbD1cIiR7Y29sfVwiXSA+IC52YWx1ZWA7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29tcGxldGUocm93LCBjb2wsIHZhbHVlKXtcclxuICAgICAgICBpZiAodHlwZW9mIHJvdyAhPT0gXCJudW1iZXJcIiB8fCByb3cgPCAwIHx8IHJvdyA+IDYpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcm93OiBcIiArIHJvdyk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb2wgIT09IFwibnVtYmVyXCIgfHwgY29sIDwgMCB8fCBjb2wgPiA1KSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGNvbDogXCIgKyBjb2wpO1xyXG4gICAgICAgIHRoaXMuZ2V0Q2VsbChyb3csIGNvbCkuc2V0QXR0cmlidXRlKFwiZGF0YS1jb21wbGV0ZVwiLCB2YWx1ZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2dhbWUtYm9hcmQnLCBHYW1lQm9hcmQpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVCb2FyZDsiLCJjbGFzcyBNZW51e1xyXG4gICAgaW5pdChtZW51U2VsZWN0b3Ipe1xyXG4gICAgICAgIHRoaXMubWVudVNlbGVjdG9yID0gbWVudVNlbGVjdG9yO1xyXG4gICAgICAgIHRoaXMubWVudUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMudG9nZ2xlTWVudSgpKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uTWVudSgpO1xyXG5cclxuICAgICAgICB0aGlzLm1lbnVBcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpPT4gdGhpcy5tb3VzZUxlYXZlKCkpO1xyXG4gICAgICAgIHRoaXMubWVudUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKT0+IHRoaXMubW91c2VMZWF2ZSgpKTtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpPT4gdGhpcy5tb3VzZUVudGVyKCkpO1xyXG4gICAgICAgIHRoaXMubWVudUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKT0+IHRoaXMubW91c2VFbnRlcigpKTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWF1dG9jbG9zZT0ndHJ1ZSdcIikuZm9yRWFjaCgoZWxlKT0+IHtcclxuICAgICAgICAgICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy5jbG9zZSgpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zdWItbWVudVwiKS5mb3JFYWNoKChlbGUpPT57XHJcbiAgICAgICAgICAgIGVsZS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtbGFiZWxcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZU1lbnUoZWxlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlKCl7XHJcbiAgICAgICAgdGhpcy5tZW51QXJlYS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnN1Yi1tZW51ID4gLm1lbnUtYXJlYVwiKS5mb3JFYWNoKChlbGUpPT57XHJcbiAgICAgICAgICAgIGVsZS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9wZW4oKXtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbk1lbnUoKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZUxlYXZlKCl7XHJcbiAgICAgICAgaWYgKHRoaXMudGltZW91dCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PntcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VFbnRlcigpe1xyXG4gICAgICAgIGlmICghdGhpcy50aW1lb3V0KSByZXR1cm47XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XHJcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0b2dnbGVNZW51KGVsZW1lbnQpe1xyXG4gICAgICAgIGVsZW1lbnQgPSBlbGVtZW50ID8/IHRoaXMubWVudUFyZWE7XHJcbiAgICAgICAgaWYgKCFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIm1lbnUtYXJlYVwiKSl7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hcmVhXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaGlkZGVuXCIpKXtcclxuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIm1lbnUtYXJlYVwiKSl7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnUtYXJlYVwiKS5mb3JFYWNoKFxyXG4gICAgICAgICAgICAgICAgKGVsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwb3NpdGlvbk1lbnUoKXtcclxuICAgICAgICBjb25zdCBsZWZ0ID0gdGhpcy5tZW51QnV0dG9uLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgICAgICAgY29uc3QgYldpZHRoID0gdGhpcy5tZW51QnV0dG9uLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG4gICAgICAgIGNvbnN0IG1XaWR0aCA9IHRoaXMubWVudUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XHJcbiAgICAgICAgaWYgKChsZWZ0ICsgYldpZHRoICsgbVdpZHRoICsgMikgPiB3aW5kb3cuaW5uZXJXaWR0aCl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TWVudUxlZnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNldE1lbnVSaWdodCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRNZW51TGVmdCgpe1xyXG4gICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLm1lbnVCdXR0b24ub2Zmc2V0TGVmdDtcclxuICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXMubWVudUFyZWEub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgdGhpcy5tZW51QXJlYS5zdHlsZS5sZWZ0ID0gKGxlZnQgLSB3aWR0aCAtIDIpICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1lbnVSaWdodCgpe1xyXG4gICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLm1lbnVCdXR0b24ub2Zmc2V0TGVmdDtcclxuICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXMubWVudUJ1dHRvbi5vZmZzZXRXaWR0aDtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLnN0eWxlLmxlZnQgPSAobGVmdCArIHdpZHRoICsgMikgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG1lbnUoKXtcclxuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm1lbnVTZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG1lbnVCdXR0b24oKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZW51LnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1pY29uXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBtZW51QXJlYSgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1lbnUucXVlcnlTZWxlY3RvcihcIi5tZW51LWFyZWFcIik7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVudTsiLCJjbGFzcyBNb2RlbCB7XHJcbiAgICBpbml0KG5hbWUgPSBcIkdhbWUgTmFtZVwiKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWVNb2RlbCA9IHtcclxuICAgICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICAgICAgcm91bmRzOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYWRkUm91bmQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBzZXQgbmFtZShzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5uYW1lID0gc3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBuYW1lKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5uYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHNldChnYW1lTW9kZWwpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZCA9IDA7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwgPSBnYW1lTW9kZWw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3VuZChpbmRleCkge1xyXG4gICAgICAgIGluZGV4ID0gaW5kZXggPz8gdGhpcy5jdXJyZW50Um91bmQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsLnJvdW5kc1tpbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q29sdW1uKGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Um91bmQoKS5jb2x1bW5baW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENlbGwocm93LCBjb2x1bW4pIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDb2x1bW4oY29sdW1uKS5jZWxsW3Jvd107XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlUm91bmQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucm91bmRDb3VudCA9PT0gMSkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5zcGxpY2UodGhpcy5jdXJyZW50Um91bmQsIDEpO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3VuZCA+PSB0aGlzLnJvdW5kQ291bnQpIHRoaXMuY3VycmVudFJvdW5kID0gdGhpcy5yb3VuZENvdW50IC0gMTtcclxuICAgIH1cclxuXHJcbiAgICBhZGRNdWx0aXBsZUNob2ljZVJvdW5kKCl7XHJcbiAgICAgICAgbGV0IHJvdW5kID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBNb2RlbC5xdWVzdGlvblR5cGUuTVVMVElQTEVfQ0hPSUNFLFxyXG4gICAgICAgICAgICBxdWVzdGlvbiA6IFwiXCIsXHJcbiAgICAgICAgICAgIGFuc3dlcnMgOiBbXHJcbiAgICAgICAgICAgICAgICAvLyB2YWx1ZSA6IHt0cnVlLCBmYWxzZX0sIHRleHRcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5wdXNoKHJvdW5kKTtcclxuICAgICAgICByZXR1cm4gcm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkQ2F0ZWdvcnlSb3VuZCgpIHtcclxuICAgICAgICBsZXQgcm91bmQgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IE1vZGVsLnF1ZXN0aW9uVHlwZS5DQVRFR09SWSxcclxuICAgICAgICAgICAgY29sdW1uOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXSA9IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgY2VsbDogW11cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXS5jZWxsW2pdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAoaiArIDEpICogMTAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHE6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYTogXCJcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5yb3VuZHMucHVzaChyb3VuZCk7XHJcbiAgICAgICAgcmV0dXJuIHJvdW5kO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCByb3VuZENvdW50KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5yb3VuZHMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIGluY3JlYXNlVmFsdWUoKSB7XHJcbiAgICAgICAgbGV0IHJvdW5kID0gdGhpcy5nZXRSb3VuZCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldLmNlbGxbal0udmFsdWUgKj0gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWNyZWFzZVZhbHVlKCkge1xyXG4gICAgICAgIGxldCByb3VuZCA9IHRoaXMuZ2V0Um91bmQoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXS5jZWxsW2pdLnZhbHVlIC89IDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbk1vZGVsLnF1ZXN0aW9uVHlwZSA9IHtcclxuICAgIENBVEVHT1JZIDogXCJjaG9pY2VcIixcclxuICAgIE1VTFRJUExFX0NIT0lDRSA6IFwibXVsdGlwbGVfY2hvaWNlXCJcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTW9kZWw7IiwiY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCJAVGhhZXJpb3VzL25pZGdldFwiKS5OaWRnZXRFbGVtZW50O1xyXG5cclxuY2xhc3MgTXVsdGlwbGVDaG9pY2VQYW5lIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XHJcblxyXG59XHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdtdWx0aXBsZS1jaG9pY2UtcGFuZScsIE11bHRpcGxlQ2hvaWNlUGFuZSk7XHJcbm1vZHVsZS5leHBvcnRzID0gTXVsdGlwbGVDaG9pY2VQYW5lOyIsIlxyXG5jbGFzcyBRdWVzdGlvblBhbmV7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsIGNvbnN0cnVjdG9yIGFmdGVyIHdpbmRvdyBoYXMgbG9hZGVkXHJcbiAgICAgKiBAcGFyYW0gKGZ1bmN0aW9uKSBzYXZlY2IgY2FsbGJhY2sgdG8gc2F2ZSBtb2RlbFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnRleHRRdWVzdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGV4dC1xdWVzdGlvblwiKTtcclxuICAgICAgICB0aGlzLnRleHRDb250ZW50cyA9IHRoaXMudGV4dFF1ZXN0aW9uLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dC1jb250ZW50c1wiKTtcclxuICAgICAgICB0aGlzLm5hdkJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzaG93LWJvYXJkXCIpO1xyXG4gICAgICAgIHRoaXMubmF2UXVlc3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctcXVlc3Rpb25cIik7XHJcbiAgICAgICAgdGhpcy5uYXZBbnN3ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctYW5zd2VyXCIpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctYm9hcmRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZUFsbCgpO1xyXG4gICAgICAgICAgICB0aGlzLm9uQ2xvc2UoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzaG93LXF1ZXN0aW9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLnNob3dRdWVzdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctYW5zd2VyXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLnNob3dBbnN3ZXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy50ZXh0UXVlc3Rpb24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLnRleHRDb250ZW50cy5mb2N1cygpKTtcclxuXHJcbiAgICAgICAgdGhpcy50ZXh0Q29udGVudHMuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgYXN5bmMgKCk9PntcclxuICAgICAgICAgICB0aGlzLmNlbGxbdGhpcy5zdGF0dXNdID0gdGhpcy50ZXh0Q29udGVudHMudGV4dC50cmltKCk7XHJcbiAgICAgICAgICAgYXdhaXQgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5vblNhdmUgPSBmdW5jdGlvbigpe307IC8vIHNldCB0aGlzIGluIG1haW4gdG8gc2F2ZSAuanNvbiBtb2RlbFxyXG4gICAgICAgIHRoaXMub25DbG9zZSA9IGZ1bmN0aW9uKCl7fTsgLy8gY2FsbGVkIHdoZW4gdGhpcyBwYW5lbCBpcyBoaWRkZW4uXHJcbiAgICB9XHJcblxyXG4gICAgaGlkZUFsbCgpe1xyXG4gICAgICAgIHRoaXMubmF2Qm9hcmQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLm5hdlF1ZXN0aW9uLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5uYXZBbnN3ZXIuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLnRleHRRdWVzdGlvbi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3dRdWVzdGlvbihjZWxsKXtcclxuICAgICAgICBpZiAoY2VsbCkgdGhpcy5jZWxsID0gY2VsbDtcclxuICAgICAgICBjZWxsID0gY2VsbCA/PyB0aGlzLmNlbGw7XHJcblxyXG4gICAgICAgIHRoaXMubmF2QW5zd2VyLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICB0aGlzLm5hdlF1ZXN0aW9uLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBcInFcIjtcclxuXHJcbiAgICAgICAgdGhpcy5uYXZCb2FyZC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMubmF2UXVlc3Rpb24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLm5hdkFuc3dlci5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICB0aGlzLnRleHRRdWVzdGlvbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMudGV4dFF1ZXN0aW9uLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dC1jb250ZW50c1wiKS50ZXh0ID0gY2VsbC5xO1xyXG4gICAgfVxyXG5cclxuICAgIHNob3dBbnN3ZXIoY2VsbCl7XHJcbiAgICAgICAgaWYgKGNlbGwpIHRoaXMuY2VsbCA9IGNlbGw7XHJcbiAgICAgICAgY2VsbCA9IGNlbGwgPz8gdGhpcy5jZWxsO1xyXG5cclxuICAgICAgICB0aGlzLm5hdkFuc3dlci5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIik7XHJcbiAgICAgICAgdGhpcy5uYXZRdWVzdGlvbi5jbGFzc0xpc3QucmVtb3ZlKFwic2VsZWN0ZWRcIik7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gXCJhXCI7XHJcblxyXG4gICAgICAgIHRoaXMubmF2Qm9hcmQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLm5hdlF1ZXN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5uYXZBbnN3ZXIuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuXHJcbiAgICAgICAgdGhpcy50ZXh0UXVlc3Rpb24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLnRleHRRdWVzdGlvbi5xdWVyeVNlbGVjdG9yKFwiLnRleHQtY29udGVudHNcIikudGV4dCA9IGNlbGwuYTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBRdWVzdGlvblBhbmU7XHJcblxyXG5cclxuIiwiXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgLy8gVGhlIEJyb3dzZXIgQVBJIGtleSBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuXHJcbiAgICBkZXZlbG9wZXJLZXkgOiAnQUl6YVN5QUJjZExtVDZISF83R284MnFfSUJHSTNqbTZVTDR3NFEwJyxcclxuXHJcbiAgICAvLyBUaGUgQ2xpZW50IElEIG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS4gUmVwbGFjZSB3aXRoIHlvdXIgb3duIENsaWVudCBJRC5cclxuICAgIGNsaWVudElkIDogXCIxNTg4MjMxMzQ2ODEtOThiZ2thbmdvbHRrNjM2dWtmOHBvZmVpczdwYTdqYmsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb21cIixcclxuXHJcbiAgICAvLyBSZXBsYWNlIHdpdGggeW91ciBvd24gcHJvamVjdCBudW1iZXIgZnJvbSBjb25zb2xlLmRldmVsb3BlcnMuZ29vZ2xlLmNvbS5cclxuICAgIGFwcElkIDogXCIxNTg4MjMxMzQ2ODFcIixcclxuXHJcbiAgICAvLyBBcnJheSBvZiBBUEkgZGlzY292ZXJ5IGRvYyBVUkxzIGZvciBBUElzIHVzZWQgYnkgdGhlIHF1aWNrc3RhcnRcclxuICAgIGRpc2NvdmVyeURvY3MgOiBbXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9kaXNjb3ZlcnkvdjEvYXBpcy9kcml2ZS92My9yZXN0XCJdLFxyXG5cclxuICAgIC8vIFNjb3BlIHRvIHVzZSB0byBhY2Nlc3MgdXNlcidzIERyaXZlIGl0ZW1zLlxyXG4gICAgc2NvcGUgOiAnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9kcml2ZS5maWxlJ1xyXG59Il19
