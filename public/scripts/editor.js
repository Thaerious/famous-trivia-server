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
    templateAttribute: "template-id",
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

        if (this.hasAttribute(Nidget.templateAttribute)){
            await this.applyTemplate(this.getAttribute(Nidget.templateAttribute));
        }

        this.notifyStyles();
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
     * Attach a shadow element with the contents of the template named (templateID).
     * @return {undefined}
     */
    async applyTemplate(templateId) {
        if (this.shadowRoot !== null) return;
        let template = document.getElementById(templateId);

        if (!template) throw new Error("Template '" + templateId + "' not found.");
        if (template.tagName.toUpperCase() !== "TEMPLATE") throw new Error("Element with id '" + templateId + "' is not a template.");

        this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
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
            parseURLParameters();
            new _Menu["default"]().init("#menu");
            _context2.prev = 3;
            _context2.next = 6;
            return new _Authenticate["default"]().loadClient();

          case 6:
            _context2.next = 8;
            return fileOps.loadClient();

          case 8:
            _context2.next = 13;
            break;

          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2["catch"](3);
            console.log(_context2.t0);

          case 13:
            _context2.next = 15;
            return fileOps.get(window.parameters.fileId);

          case 15:
            file = _context2.sent;
            model = new _Model["default"](fileOps).set(JSON.parse(file.body));
            window.model = model;
            document.querySelector("#game-name").textContent = model.name;
            editorPane = new _EditorPane["default"](model, fileOps, window.parameters.fileId);
            editorPane.onSave = saveModel;
            end = new Date();
            time = end - start;
            console.log("Load Time " + time + " ms");

          case 24:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[3, 10]]);
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

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

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
      DOM.menuDecreaseValue.hide();
      DOM.menuIncreaseValue.hide();
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
      DOM.menuDecreaseValue.hide();
      DOM.menuIncreaseValue.hide();
      DOM.questionPane.setText(model.question);
      DOM.gameBoard.hide();
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
      DOM.menuDecreaseValue.show();
      DOM.menuIncreaseValue.show();
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
  function EditorPane(model, fileOps, fileId) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, EditorPane);
    this.model = model;
    this.fileOps = fileOps;
    this.fileId = fileId;
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
    document.querySelector("#menu-move-right").addEventListener("click", function () {
      if (_this.model.currentRound >= _this.model.roundCount - 1) return;

      _this.model.setRoundIndex(_this.model.currentRound, _this.model.currentRound + 1);

      _this.model.incrementRound();

      _this.updateView();

      _this.onSave();
    });
    document.querySelector("#menu-move-left").addEventListener("click", function () {
      if (_this.model.currentRound <= 0) return;

      _this.model.setRoundIndex(_this.model.currentRound, _this.model.currentRound - 1);

      _this.model.decrementRound();

      _this.updateView();

      _this.onSave();
    });
    document.querySelector("#menu-remove-round").addEventListener("click", function () {
      _this.model.removeRound();

      _this.updateTriangleView();

      _this.onSave();

      _this.updateView();
    });
    document.querySelector("#menu-home-screen").addEventListener("click", function () {
      location.href = "host.ejs";
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
    DOM.gameName.addEventListener("keypress", /*#__PURE__*/function () {
      var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(event) {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(event.which === 13)) {
                  _context.next = 10;
                  break;
                }

                event.stopPropagation();
                event.preventDefault();
                document.body.focus();
                _this.model.name = DOM.gameName.innerText;
                _context.next = 7;
                return _this.fileOps.rename(_this.fileId, _this.model.name + ".json");

              case 7:
                _context.next = 9;
                return _this.onSave();

              case 9:
                return _context.abrupt("return", false);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
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
    value: function onSave() {
      this.fileOps.setBody(this.fileId, this.model);
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

},{"./Model.js":48,"@babel/runtime/helpers/asyncToGenerator":24,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/regenerator":39}],45:[function(require,module,exports){
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
        var filename,
            _args2 = arguments;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                filename = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : "Game Name.json";
                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  gapi.client.drive.files.create({
                    name: filename,
                    parents: ['appDataFolder'],
                    fields: "id"
                  }).then(function (res) {
                    resolve(res.result.id);
                  }, function (error) {
                    reject(error);
                  });
                }));

              case 2:
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
                    reject(error);
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
                    var fontSize = event.target.style["font-size"];

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
      var lock = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      var element = this.getHeader(index);
      element.text = value;
      console.log(fontSize);
      if (fontSize) element.style["font-size"] = fontSize;

      if (lock) {
        element.setAttribute("contentEditable", "false");
      }
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
    } // TODO test

  }, {
    key: "setRoundIndex",
    value: function setRoundIndex(from, to) {
      var r = this.gameModel.rounds;
      if (r.length <= 1) return;
      var _ref = [r[to], r[from]];
      r[from] = _ref[0];
      r[to] = _ref[1];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2VkL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0Fic3RyYWN0TW9kZWwuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0RyYWdIYW5kbGVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9GaWxlT3BlcmF0aW9ucy5qcyIsIi4uLy4uL25pZGdldC9zcmMvSW50ZXJmYWNlcy5qcyIsIi4uLy4uL25pZGdldC9zcmMvTW91c2VVdGlsaXRpZXMuanMiLCIuLi8uLi9uaWRnZXQvc3JjL05pZGdldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0RWxlbWVudC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0U3R5bGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL1RyYW5zZm9ybWVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b24uanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblNldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU3RhdGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldENvbnRhaW5lci5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SFRNTEltYWdlLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRJbWFnZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0VGV4dC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJhZy5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJvcC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvTW91c2UuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL01vdmFibGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL1Jlc2l6ZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvcHJvamVjdEZpbGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3luY1RvR2VuZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2suanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jb25zdHJ1Y3QuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jcmVhdGVDbGFzcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2dldC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2dldFByb3RvdHlwZU9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pc05hdGl2ZUZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvcG9zc2libGVDb25zdHJ1Y3RvclJldHVybi5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3NldFByb3RvdHlwZU9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvc3VwZXJQcm9wQmFzZS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZi5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3dyYXBOYXRpdmVTdXBlci5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUuanMiLCJzcmMvY2xpZW50L2VkaXRvci5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9BdXRoZW50aWNhdGUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvQ2hlY2tCb3guanMiLCJzcmMvY2xpZW50L21vZHVsZXMvRWRpdG9yUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9GaWxlT3BzLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0dhbWVCb2FyZC5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9NZW51LmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL01vZGVsLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL011bHRpcGxlQ2hvaWNlUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9RdWVzdGlvblBhbmUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvZ29vZ2xlRmllbGRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDNXVCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFKQSxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsbUJBQUQsQ0FBdEI7O0FBTUEsSUFBSSxPQUFPLEdBQUcsSUFBSSxtQkFBSixFQUFkO0FBQ0EsSUFBSSxLQUFLLEdBQUcsSUFBWjtBQUNBLElBQUksWUFBWSxHQUFHLElBQW5CO0FBQ0EsSUFBSSxVQUFVLEdBQUcsSUFBakI7QUFFQSxNQUFNLENBQUMsTUFBUCw4RkFBZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNaLFVBQUEsS0FBSzs7QUFETztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxDQUFoQjs7U0FJZSxLOzs7QUEwQmY7QUFDQTtBQUNBOzs7O3lGQTVCQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDUSxZQUFBLEtBRFIsR0FDZ0IsSUFBSSxJQUFKLEVBRGhCO0FBR0ksWUFBQSxrQkFBa0I7QUFDbEIsZ0JBQUksZ0JBQUosR0FBVyxJQUFYLENBQWdCLE9BQWhCO0FBSko7QUFBQTtBQUFBLG1CQU9jLElBQUksd0JBQUosR0FBbUIsVUFBbkIsRUFQZDs7QUFBQTtBQUFBO0FBQUEsbUJBUWMsT0FBTyxDQUFDLFVBQVIsRUFSZDs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBVVEsWUFBQSxPQUFPLENBQUMsR0FBUjs7QUFWUjtBQUFBO0FBQUEsbUJBYXFCLE9BQU8sQ0FBQyxHQUFSLENBQVksTUFBTSxDQUFDLFVBQVAsQ0FBa0IsTUFBOUIsQ0FickI7O0FBQUE7QUFhUSxZQUFBLElBYlI7QUFjUSxZQUFBLEtBZFIsR0FjZ0IsSUFBSSxpQkFBSixDQUFVLE9BQVYsRUFBbUIsR0FBbkIsQ0FBdUIsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFJLENBQUMsSUFBaEIsQ0FBdkIsQ0FkaEI7QUFlSSxZQUFBLE1BQU0sQ0FBQyxLQUFQLEdBQWUsS0FBZjtBQUVBLFlBQUEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsWUFBdkIsRUFBcUMsV0FBckMsR0FBbUQsS0FBSyxDQUFDLElBQXpEO0FBQ0EsWUFBQSxVQUFVLEdBQUcsSUFBSSxzQkFBSixDQUFlLEtBQWYsRUFBc0IsT0FBdEIsRUFBK0IsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsTUFBakQsQ0FBYjtBQUNBLFlBQUEsVUFBVSxDQUFDLE1BQVgsR0FBb0IsU0FBcEI7QUFFSSxZQUFBLEdBckJSLEdBcUJjLElBQUksSUFBSixFQXJCZDtBQXNCUSxZQUFBLElBdEJSLEdBc0JlLEdBQUcsR0FBRyxLQXRCckI7QUF1QkksWUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLGVBQWUsSUFBZixHQUFzQixLQUFsQzs7QUF2Qko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRzs7OztBQTZCQSxTQUFTLFNBQVQsR0FBcUI7QUFDakIsRUFBQSxPQUFPLENBQUMsT0FBUixDQUFnQixNQUFNLENBQUMsVUFBUCxDQUFrQixNQUFsQyxFQUEwQyxJQUFJLENBQUMsU0FBTCxDQUFlLE1BQU0sQ0FBQyxLQUFQLENBQWEsR0FBYixFQUFmLEVBQW1DLElBQW5DLEVBQXlDLENBQXpDLENBQTFDO0FBQ0g7QUFFRDtBQUNBO0FBQ0E7OztBQUNBLFNBQVMsV0FBVCxHQUF1QjtBQUNuQixNQUFJLElBQUksR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixZQUF2QixFQUFxQyxXQUFoRDtBQUNBLEVBQUEsT0FBTyxDQUFDLE1BQVIsQ0FBZSxNQUFNLENBQUMsVUFBUCxDQUFrQixNQUFqQyxFQUF5QyxJQUFJLEdBQUcsT0FBaEQ7QUFDQSxFQUFBLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBYixHQUFvQixJQUFwQjtBQUNBLEVBQUEsU0FBUztBQUNaO0FBRUQ7QUFDQTtBQUNBOzs7QUFDQSxTQUFTLGtCQUFULEdBQThCO0FBQzFCLEVBQUEsTUFBTSxDQUFDLFVBQVAsR0FBb0IsRUFBcEI7QUFDQSxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsUUFBUCxDQUFnQixNQUFoQixDQUF1QixNQUF2QixDQUE4QixDQUE5QixFQUFpQyxLQUFqQyxDQUF1QyxHQUF2QyxDQUFuQjs7QUFGMEIsNkNBR0YsVUFIRTtBQUFBOztBQUFBO0FBRzFCLHdEQUFvQztBQUFBOztBQUFBLFVBQXpCLFNBQXlCO0FBQ2hDLFVBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxLQUFWLENBQWdCLEdBQWhCLENBQWQ7QUFDQSxNQUFBLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEtBQUssQ0FBQyxDQUFELENBQXZCLGVBQThCLEtBQUssQ0FBQyxDQUFELENBQW5DLDZDQUEwQyxFQUExQztBQUNIO0FBTnlCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFPN0I7Ozs7Ozs7Ozs7O0FDMUVEO0lBRU0sWTtBQUNGLDBCQUFhO0FBQUE7QUFDVCxJQUFBLE1BQU0sQ0FBQyxNQUFQLENBQWMsSUFBZCxFQUFvQixPQUFPLENBQUMsbUJBQUQsQ0FBM0I7QUFDSDs7OztXQUVELHNCQUFhO0FBQUE7O0FBQ1QsYUFBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3BDLFFBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxjQUFWLEVBQTBCO0FBQUEsaUJBQU0sS0FBSSxDQUFDLFlBQUwsQ0FBa0IsT0FBbEIsRUFBMkIsTUFBM0IsQ0FBTjtBQUFBLFNBQTFCO0FBQ0gsT0FGTSxDQUFQO0FBR0g7OztXQUVELHNCQUFhLE9BQWIsRUFBc0IsTUFBdEIsRUFBOEI7QUFDMUIsTUFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLElBQVosQ0FBaUI7QUFDYixRQUFBLE1BQU0sRUFBRSxLQUFLLFlBREE7QUFFYixRQUFBLFFBQVEsRUFBRSxLQUFLLFFBRkY7QUFHYixRQUFBLGFBQWEsRUFBRSxLQUFLLGFBSFA7QUFJYixRQUFBLEtBQUssRUFBRSxLQUFLO0FBSkMsT0FBakIsRUFLRyxJQUxILENBS1EsVUFBVSxNQUFWLEVBQWtCO0FBQ3RCLFFBQUEsT0FBTztBQUNWLE9BUEQsRUFPRyxVQUFTLEtBQVQsRUFBZ0I7QUFDZixRQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksWUFBWjtBQUNBLFFBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxLQUFaO0FBQ0EsUUFBQSxNQUFNLENBQUMsS0FBRCxDQUFOO0FBQ0gsT0FYRDtBQVlIOzs7V0FFRCx3QkFBYztBQUNWLFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFMLENBQVcsZUFBWCxHQUE2QixXQUE3QixDQUF5QyxHQUF6QyxFQUFYO0FBQ0EsYUFBTyxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsS0FBSyxLQUEzQixDQUFQO0FBQ0g7OztXQUVELGtCQUFRO0FBQ0osTUFBQSxJQUFJLENBQUMsS0FBTCxDQUFXLGVBQVgsR0FBNkIsTUFBN0I7QUFDSDs7O1dBRUQsbUJBQVM7QUFDTCxNQUFBLElBQUksQ0FBQyxLQUFMLENBQVcsZUFBWCxHQUE2QixPQUE3QjtBQUNIOzs7OztBQUlMLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFlBQWpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzNDQSxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsbUJBQUQsQ0FBUCxDQUE2QixhQUFuRDs7SUFFTSxZOzs7OztBQUNGLHdCQUFZLEtBQVosRUFBbUI7QUFBQTtBQUFBLDZCQUNULGNBRFMsRUFFWDtBQUFDLE1BQUEsTUFBTSxFQUFHO0FBQUMsUUFBQSxLQUFLLEVBQUc7QUFBVDtBQUFWLEtBRlc7QUFJbEI7OztrREFMdUIsVzs7SUFRdEIsUTs7Ozs7Ozs7Ozs7Ozs2R0FDRjtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ0k7QUFDQSxxQkFBSyxnQkFBTCxDQUFzQixPQUF0QixFQUErQixZQUFJO0FBQy9CLGtCQUFBLEtBQUksQ0FBQyxNQUFMO0FBQ0gsaUJBRkQ7O0FBRko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7OztXQU9BLGtCQUFRO0FBQ0osVUFBSSxLQUFLLE9BQUwsS0FBaUIsTUFBckIsRUFBNkIsS0FBSyxPQUFMLEdBQWUsT0FBZixDQUE3QixLQUNLLEtBQUssT0FBTCxHQUFlLE1BQWY7QUFDUjs7O1NBRUQsZUFBYTtBQUNULFVBQUksQ0FBQyxLQUFLLFlBQUwsQ0FBa0IsUUFBUSxDQUFDLGlCQUEzQixDQUFMLEVBQW1EO0FBQy9DLGFBQUssWUFBTCxDQUFrQixRQUFRLENBQUMsaUJBQTNCLEVBQThDLE9BQTlDO0FBQ0g7O0FBQ0QsYUFBTyxLQUFLLFlBQUwsQ0FBa0IsUUFBUSxDQUFDLGlCQUEzQixDQUFQO0FBQ0gsSztTQUVELGFBQVksS0FBWixFQUFrQjtBQUNkLFdBQUssWUFBTCxDQUFrQixRQUFRLENBQUMsaUJBQTNCLEVBQThDLEtBQTlDO0FBQ0EsV0FBSyxhQUFMLENBQW1CLElBQUksWUFBSixDQUFpQixLQUFqQixDQUFuQjtBQUNIOzs7RUF2QmtCLGE7O0FBMEJ2QixRQUFRLENBQUMsaUJBQVQsR0FBNkIsU0FBN0I7QUFDQSxNQUFNLENBQUMsY0FBUCxDQUFzQixNQUF0QixDQUE2QixXQUE3QixFQUEwQyxRQUExQztBQUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBQWpCOzs7Ozs7Ozs7Ozs7Ozs7QUN0Q0E7O0FBQ0EsSUFBTSxHQUFHLEdBQUc7QUFBQztBQUFELENBQVo7O0lBRU0sWTs7Ozs7OztXQUNGLGFBQVcsS0FBWCxFQUFrQixNQUFsQixFQUEwQjtBQUN0QixNQUFBLFlBQVksQ0FBQyxLQUFiLEdBQXNCLEtBQXRCO0FBQ0EsTUFBQSxZQUFZLENBQUMsTUFBYixHQUFzQixNQUF0QjtBQUVBLE1BQUEsR0FBRyxDQUFDLGlCQUFKLENBQXNCLElBQXRCO0FBQ0EsTUFBQSxHQUFHLENBQUMsaUJBQUosQ0FBc0IsSUFBdEI7QUFFQSxNQUFBLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixJQUF2Qjs7QUFFQSxXQUFLLElBQUksQ0FBQyxHQUFHLENBQWIsRUFBZ0IsQ0FBQyxHQUFHLENBQXBCLEVBQXVCLENBQUMsRUFBeEIsRUFBNEI7QUFDeEIsUUFBQSxHQUFHLENBQUMsa0JBQUosQ0FBdUIsT0FBdkIsQ0FBK0IsQ0FBL0IsRUFBa0MsS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLEVBQWlCLElBQW5EO0FBQ0EsUUFBQSxHQUFHLENBQUMsa0JBQUosQ0FBdUIsVUFBdkIsQ0FBa0MsQ0FBbEMsRUFBcUMsS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLEVBQWlCLE1BQXREO0FBQ0g7O0FBRUQsTUFBQSxHQUFHLENBQUMsYUFBSixDQUFrQixnQkFBbEIsQ0FBbUMsT0FBbkMsRUFBNEMsWUFBWSxDQUFDLE9BQXpEO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixnQkFBakIsQ0FBa0MsT0FBbEMsRUFBMkMsWUFBWSxDQUFDLE9BQXhEO0FBQ0EsTUFBQSxHQUFHLENBQUMsa0JBQUosQ0FBdUIsZ0JBQXZCLENBQXdDLGFBQXhDLEVBQXVELFlBQVksQ0FBQyxRQUFwRTtBQUNBLE1BQUEsR0FBRyxDQUFDLGtCQUFKLENBQXVCLGdCQUF2QixDQUF3QyxjQUF4QyxFQUF3RCxZQUFZLENBQUMsU0FBckU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixnQkFBdkIsQ0FBd0MsaUJBQXhDLEVBQTJELFlBQVksQ0FBQyxTQUF4RTtBQUNIOzs7V0FFRCxrQkFBZ0IsS0FBaEIsRUFBdUI7QUFDbkIsVUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBZCxDQUFwQjtBQUNBLE1BQUEsWUFBWSxDQUFDLEtBQWIsQ0FBbUIsT0FBbkIsQ0FBMkIsS0FBM0IsRUFBa0MsSUFBbEMsR0FBeUMsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUF0RDtBQUNBLE1BQUEsWUFBWSxDQUFDLE1BQWI7QUFDSDs7O1dBRUQsbUJBQWlCLEtBQWpCLEVBQXdCO0FBQ3BCLFVBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQWQsQ0FBcEI7QUFDQSxNQUFBLFlBQVksQ0FBQyxLQUFiLENBQW1CLE9BQW5CLENBQTJCLEtBQTNCLEVBQWtDLE1BQWxDLEdBQTJDLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBeEQ7QUFDQSxNQUFBLFlBQVksQ0FBQyxNQUFiO0FBQ0g7OztXQUVELG1CQUFpQixLQUFqQixFQUF3QjtBQUNwQixNQUFBLFlBQVksQ0FBQyxNQUFiO0FBQ0EsTUFBQSxZQUFZLENBQUMsT0FBYjtBQUNBLE1BQUEsY0FBYyxDQUFDLEdBQWYsQ0FBbUIsWUFBWSxDQUFDLEtBQWhDLEVBQXVDLFlBQVksQ0FBQyxNQUFwRDtBQUNIOzs7V0FFRCxtQkFBaUI7QUFDYixNQUFBLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixJQUF2QjtBQUNBLE1BQUEsR0FBRyxDQUFDLGtCQUFKLENBQXVCLG1CQUF2QixDQUEyQyxhQUEzQyxFQUEwRCxZQUFZLENBQUMsUUFBdkU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixtQkFBdkIsQ0FBMkMsY0FBM0MsRUFBMkQsWUFBWSxDQUFDLFNBQXhFO0FBQ0EsTUFBQSxHQUFHLENBQUMsa0JBQUosQ0FBdUIsbUJBQXZCLENBQTJDLGlCQUEzQyxFQUE4RCxZQUFZLENBQUMsU0FBM0U7QUFDQSxNQUFBLEdBQUcsQ0FBQyxhQUFKLENBQWtCLG1CQUFsQixDQUFzQyxPQUF0QyxFQUErQyxZQUFZLENBQUMsT0FBNUQ7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLG1CQUFqQixDQUFxQyxPQUFyQyxFQUE4QyxZQUFZLENBQUMsT0FBM0Q7QUFDSDs7Ozs7SUFHQyxjOzs7Ozs7O1dBQ0YsYUFBVyxLQUFYLEVBQWtCLE1BQWxCLEVBQTBCO0FBQ3RCLE1BQUEsY0FBYyxDQUFDLEtBQWYsR0FBd0IsS0FBeEI7QUFDQSxNQUFBLGNBQWMsQ0FBQyxNQUFmLEdBQXdCLE1BQXhCO0FBRUEsTUFBQSxHQUFHLENBQUMsaUJBQUosQ0FBc0IsSUFBdEI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxpQkFBSixDQUFzQixJQUF0QjtBQUVBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsT0FBakIsQ0FBeUIsS0FBSyxDQUFDLFFBQS9CO0FBQ0EsTUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLElBQWQ7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLElBQWpCO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixXQUFqQixHQUErQixLQUEvQjtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsU0FBakIsQ0FBMkIsVUFBM0I7QUFFQSxNQUFBLEdBQUcsQ0FBQyxhQUFKLENBQWtCLGdCQUFsQixDQUFtQyxPQUFuQyxFQUE0QyxjQUFjLENBQUMsT0FBM0Q7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLGdCQUFqQixDQUFrQyxPQUFsQyxFQUEyQyxjQUFjLENBQUMsT0FBMUQ7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLGdCQUFqQixDQUFrQyxhQUFsQyxFQUFpRCxjQUFjLENBQUMsUUFBaEU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLGdCQUFqQixDQUFrQyxlQUFsQyxFQUFtRCxjQUFjLENBQUMsVUFBbEU7QUFDSDs7O1dBRUQsa0JBQWdCLEtBQWhCLEVBQXVCO0FBQ25CLE1BQUEsY0FBYyxDQUFDLEtBQWYsQ0FBcUIsUUFBckIsR0FBZ0MsS0FBSyxDQUFDLE1BQU4sQ0FBYSxJQUE3QztBQUNBLE1BQUEsY0FBYyxDQUFDLE1BQWY7QUFDSDs7O1dBRUQsc0JBQW9CO0FBQ2hCLE1BQUEsY0FBYyxDQUFDLE9BQWY7QUFDQSxNQUFBLFlBQVksQ0FBQyxHQUFiLENBQWlCLGNBQWMsQ0FBQyxLQUFoQyxFQUF1QyxjQUFjLENBQUMsTUFBdEQ7QUFDSDs7O1dBRUQsbUJBQWlCO0FBQ2IsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixtQkFBakIsQ0FBcUMsYUFBckMsRUFBb0QsY0FBYyxDQUFDLFFBQW5FO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixtQkFBakIsQ0FBcUMsZUFBckMsRUFBc0QsY0FBYyxDQUFDLFVBQXJFO0FBQ0EsTUFBQSxHQUFHLENBQUMsYUFBSixDQUFrQixtQkFBbEIsQ0FBc0MsT0FBdEMsRUFBK0MsY0FBYyxDQUFDLE9BQTlEO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixtQkFBakIsQ0FBcUMsT0FBckMsRUFBOEMsY0FBYyxDQUFDLE9BQTdEO0FBQ0g7Ozs7O0lBR0MsZ0I7Ozs7Ozs7O0FBQ0Y7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNJLGlCQUFXLEtBQVgsRUFBa0IsS0FBbEIsRUFBeUIsTUFBekIsRUFBaUMsT0FBakMsRUFBMEM7QUFDdEMsTUFBQSxnQkFBZ0IsQ0FBQyxLQUFqQixHQUEyQixLQUEzQixhQUEyQixLQUEzQixjQUEyQixLQUEzQixHQUFvQyxnQkFBZ0IsQ0FBQyxLQUFyRDtBQUNBLE1BQUEsZ0JBQWdCLENBQUMsS0FBakIsR0FBMkIsS0FBM0IsYUFBMkIsS0FBM0IsY0FBMkIsS0FBM0IsR0FBb0MsZ0JBQWdCLENBQUMsS0FBckQ7QUFDQSxNQUFBLGdCQUFnQixDQUFDLE1BQWpCLEdBQTJCLE1BQTNCLGFBQTJCLE1BQTNCLGNBQTJCLE1BQTNCLEdBQXFDLGdCQUFnQixDQUFDLE1BQXREO0FBQ0EsTUFBQSxnQkFBZ0IsQ0FBQyxPQUFqQixHQUEyQixPQUEzQixhQUEyQixPQUEzQixjQUEyQixPQUEzQixHQUFzQyxnQkFBZ0IsQ0FBQyxPQUF2RDtBQUVBLE1BQUEsR0FBRyxDQUFDLGlCQUFKLENBQXNCLElBQXRCO0FBQ0EsTUFBQSxHQUFHLENBQUMsaUJBQUosQ0FBc0IsSUFBdEI7QUFFQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLE9BQWpCLENBQXlCLGdCQUFnQixDQUFDLEtBQWpCLENBQXVCLGdCQUFnQixDQUFDLEtBQWpCLENBQXVCLE1BQXZCLENBQThCLENBQTlCLEVBQWlDLENBQWpDLENBQXZCLENBQXpCO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixXQUFqQixHQUErQixJQUEvQjtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsSUFBakI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsSUFBZDtBQUVBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsZ0JBQWpCLENBQWtDLGFBQWxDLEVBQWlELGdCQUFnQixDQUFDLFFBQWxFO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixnQkFBakIsQ0FBa0MsY0FBbEMsRUFBa0QsZ0JBQWdCLENBQUMsU0FBbkU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLGdCQUFqQixvQkFBcUQsZ0JBQWdCLENBQUMsWUFBdEU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLGdCQUFqQixrQkFBbUQsZ0JBQWdCLENBQUMsVUFBcEU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLFNBQWpCLENBQTJCLGdCQUFnQixDQUFDLEtBQTVDO0FBQ0g7OztXQUVELGtCQUFnQixLQUFoQixFQUF1QjtBQUNuQixNQUFBLGdCQUFnQixDQUFDLEtBQWpCLENBQXVCLGdCQUFnQixDQUFDLEtBQWpCLENBQXVCLE1BQXZCLENBQThCLENBQTlCLEVBQWlDLENBQWpDLENBQXZCLElBQThELEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBM0U7QUFDQSxNQUFBLGdCQUFnQixDQUFDLE1BQWpCO0FBQ0g7OztXQUVELG1CQUFpQixLQUFqQixFQUF3QjtBQUNwQixNQUFBLGdCQUFnQixDQUFDLE9BQWpCO0FBQ0EsTUFBQSxnQkFBZ0IsQ0FBQyxPQUFqQjtBQUNIOzs7V0FFRCxvQkFBa0IsS0FBbEIsRUFBeUI7QUFDckIsTUFBQSxnQkFBZ0IsQ0FBQyxPQUFqQjtBQUNBLE1BQUEsZ0JBQWdCLENBQUMsR0FBakIsQ0FBcUIsUUFBckI7QUFDSDs7O1dBRUQsc0JBQW9CLElBQXBCLEVBQTBCO0FBQ3RCLE1BQUEsZ0JBQWdCLENBQUMsT0FBakI7QUFDQSxNQUFBLGdCQUFnQixDQUFDLEdBQWpCLENBQXFCLFVBQXJCO0FBQ0g7OztXQUVELG1CQUFpQjtBQUNiLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsbUJBQWpCLENBQXFDLGFBQXJDLEVBQW9ELGdCQUFnQixDQUFDLFFBQXJFO0FBQ0EsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixtQkFBakIsQ0FBcUMsY0FBckMsRUFBcUQsZ0JBQWdCLENBQUMsU0FBdEU7QUFDQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLG1CQUFqQixDQUFxQyxlQUFyQyxFQUFzRCxnQkFBZ0IsQ0FBQyxVQUF2RTtBQUNBLE1BQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsbUJBQWpCLENBQXFDLGlCQUFyQyxFQUF3RCxnQkFBZ0IsQ0FBQyxZQUF6RTtBQUNIOzs7OztJQUdDLFU7QUFDRixzQkFBWSxLQUFaLEVBQW1CLE9BQW5CLEVBQTRCLE1BQTVCLEVBQW9DO0FBQUE7O0FBQUE7QUFDaEMsU0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLFNBQUssT0FBTCxHQUFlLE9BQWY7QUFDQSxTQUFLLE1BQUwsR0FBYyxNQUFkO0FBRUEsSUFBQSxHQUFHLENBQUMsa0JBQUosR0FBeUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsdUJBQXZCLENBQXpCO0FBQ0EsSUFBQSxHQUFHLENBQUMsYUFBSixHQUFvQixRQUFRLENBQUMsYUFBVCxDQUF1QixpQkFBdkIsQ0FBcEI7QUFDQSxJQUFBLEdBQUcsQ0FBQyxZQUFKLEdBQW1CLFFBQVEsQ0FBQyxhQUFULENBQXVCLGdCQUF2QixDQUFuQjtBQUNBLElBQUEsR0FBRyxDQUFDLFVBQUosR0FBaUIsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsdUJBQXZCLENBQWpCO0FBQ0EsSUFBQSxHQUFHLENBQUMsUUFBSixHQUFlLFFBQVEsQ0FBQyxhQUFULENBQXVCLFlBQXZCLENBQWY7QUFDQSxJQUFBLEdBQUcsQ0FBQyxTQUFKLEdBQWdCLFFBQVEsQ0FBQyxhQUFULENBQXVCLGFBQXZCLENBQWhCO0FBQ0EsSUFBQSxHQUFHLENBQUMsWUFBSixHQUFtQixRQUFRLENBQUMsYUFBVCxDQUF1QixnQkFBdkIsQ0FBbkI7QUFDQSxJQUFBLEdBQUcsQ0FBQyxpQkFBSixHQUF3QixRQUFRLENBQUMsYUFBVCxDQUF1QixrQkFBdkIsQ0FBeEI7QUFDQSxJQUFBLEdBQUcsQ0FBQyxpQkFBSixHQUF3QixRQUFRLENBQUMsYUFBVCxDQUF1QixtQkFBdkIsQ0FBeEI7QUFFQSxJQUFBLFFBQVEsQ0FBQyxhQUFULENBQXVCLGdCQUF2QixFQUF5QyxnQkFBekMsQ0FBMEQsT0FBMUQsRUFBbUUsWUFBSTtBQUNuRSxVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBTCxDQUFlLEtBQUksQ0FBQyxLQUFMLENBQVcsU0FBMUIsRUFBcUMsSUFBckMsRUFBMkMsQ0FBM0MsQ0FBYjtBQUNBLFVBQU0sSUFBSSxHQUFHLElBQUksSUFBSixDQUFTLENBQUMsSUFBRCxDQUFULEVBQWlCO0FBQUMsUUFBQSxJQUFJLEVBQUU7QUFBUCxPQUFqQixDQUFiO0FBQ0EsVUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQVAsQ0FBVyxlQUFYLENBQTJCLElBQTNCLENBQVo7QUFDQSxVQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixrQkFBdkIsQ0FBZjtBQUNBLE1BQUEsTUFBTSxDQUFDLElBQVAsR0FBYyxHQUFkO0FBQ0EsTUFBQSxNQUFNLENBQUMsUUFBUCxHQUFrQixLQUFJLENBQUMsS0FBTCxDQUFXLElBQTdCO0FBQ0EsTUFBQSxNQUFNLENBQUMsS0FBUDtBQUNILEtBUkQ7QUFVQSxJQUFBLFFBQVEsQ0FBQyxhQUFULENBQXVCLGtCQUF2QixFQUEyQyxnQkFBM0MsQ0FBNEQsT0FBNUQsRUFBcUUsWUFBSTtBQUNyRSxVQUFJLEtBQUksQ0FBQyxLQUFMLENBQVcsWUFBWCxJQUEyQixLQUFJLENBQUMsS0FBTCxDQUFXLFVBQVgsR0FBd0IsQ0FBdkQsRUFBMEQ7O0FBQzFELE1BQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxhQUFYLENBQXlCLEtBQUksQ0FBQyxLQUFMLENBQVcsWUFBcEMsRUFBa0QsS0FBSSxDQUFDLEtBQUwsQ0FBVyxZQUFYLEdBQTBCLENBQTVFOztBQUNBLE1BQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxjQUFYOztBQUNBLE1BQUEsS0FBSSxDQUFDLFVBQUw7O0FBQ0EsTUFBQSxLQUFJLENBQUMsTUFBTDtBQUNILEtBTkQ7QUFRQSxJQUFBLFFBQVEsQ0FBQyxhQUFULENBQXVCLGlCQUF2QixFQUEwQyxnQkFBMUMsQ0FBMkQsT0FBM0QsRUFBb0UsWUFBSTtBQUNwRSxVQUFJLEtBQUksQ0FBQyxLQUFMLENBQVcsWUFBWCxJQUEyQixDQUEvQixFQUFrQzs7QUFDbEMsTUFBQSxLQUFJLENBQUMsS0FBTCxDQUFXLGFBQVgsQ0FBeUIsS0FBSSxDQUFDLEtBQUwsQ0FBVyxZQUFwQyxFQUFrRCxLQUFJLENBQUMsS0FBTCxDQUFXLFlBQVgsR0FBMEIsQ0FBNUU7O0FBQ0EsTUFBQSxLQUFJLENBQUMsS0FBTCxDQUFXLGNBQVg7O0FBQ0EsTUFBQSxLQUFJLENBQUMsVUFBTDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxNQUFMO0FBQ0gsS0FORDtBQVFBLElBQUEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsb0JBQXZCLEVBQTZDLGdCQUE3QyxDQUE4RCxPQUE5RCxFQUF1RSxZQUFNO0FBQ3pFLE1BQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxXQUFYOztBQUNBLE1BQUEsS0FBSSxDQUFDLGtCQUFMOztBQUNBLE1BQUEsS0FBSSxDQUFDLE1BQUw7O0FBQ0EsTUFBQSxLQUFJLENBQUMsVUFBTDtBQUNILEtBTEQ7QUFPQSxJQUFBLFFBQVEsQ0FBQyxhQUFULENBQXVCLG1CQUF2QixFQUE0QyxnQkFBNUMsQ0FBNkQsT0FBN0QsRUFBc0UsWUFBTTtBQUN4RSxNQUFBLFFBQVEsQ0FBQyxJQUFULEdBQWdCLFVBQWhCO0FBQ0gsS0FGRDtBQUlBLElBQUEsR0FBRyxDQUFDLGlCQUFKLENBQXNCLGdCQUF0QixDQUF1QyxPQUF2QyxFQUFnRCxZQUFNO0FBQ2xELE1BQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxhQUFYOztBQUNBLE1BQUEsS0FBSSxDQUFDLE1BQUw7O0FBQ0EsTUFBQSxLQUFJLENBQUMsVUFBTDtBQUNILEtBSkQ7QUFNQSxJQUFBLEdBQUcsQ0FBQyxpQkFBSixDQUFzQixnQkFBdEIsQ0FBdUMsT0FBdkMsRUFBZ0QsWUFBTTtBQUNsRCxNQUFBLEtBQUksQ0FBQyxLQUFMLENBQVcsYUFBWDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxNQUFMOztBQUNBLE1BQUEsS0FBSSxDQUFDLFVBQUw7QUFDSCxLQUpEO0FBTUEsSUFBQSxHQUFHLENBQUMsYUFBSixDQUFrQixnQkFBbEIsQ0FBbUMsT0FBbkMsRUFBNEMsWUFBTTtBQUM5QyxNQUFBLEtBQUksQ0FBQyxLQUFMLENBQVcsY0FBWDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxVQUFMO0FBQ0gsS0FIRDtBQUtBLElBQUEsR0FBRyxDQUFDLFlBQUosQ0FBaUIsZ0JBQWpCLENBQWtDLE9BQWxDLEVBQTJDLFlBQU07QUFDN0MsTUFBQSxLQUFJLENBQUMsS0FBTCxDQUFXLGNBQVg7O0FBQ0EsTUFBQSxLQUFJLENBQUMsVUFBTDtBQUNILEtBSEQ7QUFLQSxJQUFBLEdBQUcsQ0FBQyxRQUFKLENBQWEsZ0JBQWIsQ0FBOEIsVUFBOUI7QUFBQSwrRkFBMEMsaUJBQU8sS0FBUDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBQ2xDLEtBQUssQ0FBQyxLQUFOLEtBQWdCLEVBRGtCO0FBQUE7QUFBQTtBQUFBOztBQUVsQyxnQkFBQSxLQUFLLENBQUMsZUFBTjtBQUNBLGdCQUFBLEtBQUssQ0FBQyxjQUFOO0FBQ0EsZ0JBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxLQUFkO0FBRUEsZ0JBQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLEdBQWtCLEdBQUcsQ0FBQyxRQUFKLENBQWEsU0FBL0I7QUFOa0M7QUFBQSx1QkFPNUIsS0FBSSxDQUFDLE9BQUwsQ0FBYSxNQUFiLENBQW9CLEtBQUksQ0FBQyxNQUF6QixFQUFpQyxLQUFJLENBQUMsS0FBTCxDQUFXLElBQVgsR0FBa0IsT0FBbkQsQ0FQNEI7O0FBQUE7QUFBQTtBQUFBLHVCQVE1QixLQUFJLENBQUMsTUFBTCxFQVI0Qjs7QUFBQTtBQUFBLGlEQVMzQixLQVQyQjs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPQUExQzs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQWFBLElBQUEsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsb0JBQXZCLEVBQTZDLGdCQUE3QyxDQUE4RCxPQUE5RCxFQUF1RSxZQUFNO0FBQ3pFLE1BQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxnQkFBWDs7QUFDQSxNQUFBLEtBQUksQ0FBQyxVQUFMOztBQUNBLE1BQUEsS0FBSSxDQUFDLE1BQUw7QUFDSCxLQUpEO0FBTUEsSUFBQSxRQUFRLENBQUMsYUFBVCxDQUF1QiwyQkFBdkIsRUFBb0QsZ0JBQXBELENBQXFFLE9BQXJFLEVBQThFLFlBQU07QUFDaEYsTUFBQSxLQUFJLENBQUMsS0FBTCxDQUFXLHNCQUFYOztBQUNBLE1BQUEsS0FBSSxDQUFDLFVBQUw7O0FBQ0EsTUFBQSxLQUFJLENBQUMsTUFBTDtBQUNILEtBSkQsRUE3RmdDLENBbUdoQzs7QUFDQSxJQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsZ0JBQWQsQ0FBK0IsZUFBL0IsRUFBZ0QsVUFBQSxLQUFLLEVBQUk7QUFDckQsVUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLE1BQU4sQ0FBYSxHQUF2QjtBQUNBLE1BQUEsS0FBSSxDQUFDLEtBQUwsQ0FBVyxTQUFYLENBQXFCLEdBQXJCLEVBQTBCLFFBQTFCLEdBQXFDLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBbEQ7QUFDQSxNQUFBLEtBQUksQ0FBQyxLQUFMLENBQVcsU0FBWCxDQUFxQixHQUFyQixFQUEwQixRQUExQixHQUFxQyxLQUFLLENBQUMsTUFBTixDQUFhLFFBQWxEOztBQUNBLE1BQUEsS0FBSSxDQUFDLE1BQUw7QUFDSCxLQUxELEVBcEdnQyxDQTJHaEM7O0FBQ0EsSUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLGdCQUFkLENBQStCLGFBQS9CLEVBQThDLFVBQUEsS0FBSyxFQUFJO0FBQ25ELFVBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxNQUFOLENBQWEsR0FBdkI7QUFDQSxVQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsTUFBTixDQUFhLEdBQXZCOztBQUNBLE1BQUEsS0FBSSxDQUFDLGNBQUw7O0FBRUEsTUFBQSxnQkFBZ0IsQ0FBQyxHQUFqQixDQUNJLFVBREosRUFFSSxLQUFJLENBQUMsS0FBTCxDQUFXLE9BQVgsQ0FBbUIsR0FBbkIsRUFBd0IsR0FBeEIsQ0FGSixFQUdJO0FBQUEsZUFBTSxLQUFJLENBQUMsTUFBTCxFQUFOO0FBQUEsT0FISixFQUlJO0FBQUEsZUFBTSxLQUFJLENBQUMsVUFBTCxFQUFOO0FBQUEsT0FKSjtBQU1ILEtBWEQ7QUFhQSxTQUFLLFVBQUw7QUFDSDs7OztXQUVELGtCQUFTO0FBQ0wsV0FBSyxPQUFMLENBQWEsT0FBYixDQUFxQixLQUFLLE1BQTFCLEVBQWtDLEtBQUssS0FBdkM7QUFDSDs7O1dBRUQsMEJBQWlCO0FBQ2IsTUFBQSxHQUFHLENBQUMsWUFBSixDQUFpQixTQUFqQixDQUEyQixHQUEzQixDQUErQixRQUEvQjtBQUNBLE1BQUEsR0FBRyxDQUFDLGFBQUosQ0FBa0IsU0FBbEIsQ0FBNEIsR0FBNUIsQ0FBZ0MsUUFBaEM7QUFDSDs7O1dBRUQsb0JBQVcsS0FBWCxFQUFrQjtBQUFBOztBQUNkLE1BQUEsS0FBSyxhQUFHLEtBQUgsMkNBQVksS0FBSyxLQUF0QjtBQUNBLFdBQUssa0JBQUw7QUFFQSxNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLElBQWpCO0FBQ0EsTUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLElBQWQ7QUFDQSxNQUFBLEdBQUcsQ0FBQyxrQkFBSixDQUF1QixJQUF2QjtBQUVBLFVBQUksS0FBSyxDQUFDLFFBQU4sR0FBaUIsSUFBakIsS0FBMEIsa0JBQU0sWUFBTixDQUFtQixRQUFqRCxFQUEyRCxLQUFLLFlBQUwsQ0FBa0IsS0FBbEI7QUFDM0QsVUFBSSxLQUFLLENBQUMsUUFBTixHQUFpQixJQUFqQixLQUEwQixrQkFBTSxZQUFOLENBQW1CLGVBQWpELEVBQWtFLEtBQUssa0JBQUwsQ0FBd0IsS0FBeEI7QUFDckU7OztXQUVELDhCQUFxQjtBQUNqQixNQUFBLEdBQUcsQ0FBQyxZQUFKLENBQWlCLFNBQWpCLENBQTJCLE1BQTNCLENBQWtDLFFBQWxDO0FBQ0EsTUFBQSxHQUFHLENBQUMsYUFBSixDQUFrQixTQUFsQixDQUE0QixNQUE1QixDQUFtQyxRQUFuQztBQUNBLFVBQUksS0FBSyxLQUFMLENBQVcsWUFBWCxLQUE0QixDQUFoQyxFQUFtQyxHQUFHLENBQUMsWUFBSixDQUFpQixTQUFqQixDQUEyQixHQUEzQixDQUErQixRQUEvQjtBQUNuQyxVQUFJLEtBQUssS0FBTCxDQUFXLFlBQVgsSUFBMkIsS0FBSyxLQUFMLENBQVcsVUFBWCxHQUF3QixDQUF2RCxFQUEwRCxHQUFHLENBQUMsYUFBSixDQUFrQixTQUFsQixDQUE0QixHQUE1QixDQUFnQyxRQUFoQztBQUMxRCxNQUFBLEdBQUcsQ0FBQyxVQUFKLENBQWUsV0FBZixHQUE2QixZQUFZLEtBQUssS0FBTCxDQUFXLFlBQVgsR0FBMEIsQ0FBdEMsQ0FBN0I7QUFDSDs7O1dBRUQsNEJBQW1CLEtBQW5CLEVBQTBCO0FBQUE7O0FBQ3RCLE1BQUEsY0FBYyxDQUFDLEdBQWYsQ0FBbUIsS0FBSyxLQUFMLENBQVcsUUFBWCxFQUFuQixFQUEwQztBQUFBLGVBQU0sTUFBSSxDQUFDLE1BQUwsRUFBTjtBQUFBLE9BQTFDO0FBQ0g7OztXQUVELHNCQUFhLEtBQWIsRUFBb0I7QUFDaEIsTUFBQSxHQUFHLENBQUMsaUJBQUosQ0FBc0IsSUFBdEI7QUFDQSxNQUFBLEdBQUcsQ0FBQyxpQkFBSixDQUFzQixJQUF0QjtBQUNBLE1BQUEsR0FBRyxDQUFDLFNBQUosQ0FBYyxJQUFkOztBQUVBLFdBQUssSUFBSSxHQUFHLEdBQUcsQ0FBZixFQUFrQixHQUFHLEdBQUcsQ0FBeEIsRUFBMkIsR0FBRyxFQUE5QixFQUFrQztBQUM5QixZQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsU0FBTixDQUFnQixHQUFoQixDQUFiO0FBRUEsUUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLFNBQWQsQ0FBd0IsR0FBeEIsRUFBNkIsT0FBN0IsQ0FBcUMsSUFBckMsR0FBNEMsSUFBNUM7QUFDQSxRQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsU0FBZCxDQUF3QixHQUF4QixFQUE2QixNQUFNLENBQUMsUUFBcEMsRUFBOEMsTUFBTSxDQUFDLFFBQXJEOztBQUVBLGFBQUssSUFBSSxHQUFHLEdBQUcsQ0FBZixFQUFrQixHQUFHLEdBQUcsQ0FBeEIsRUFBMkIsR0FBRyxFQUE5QixFQUFrQztBQUM5QixVQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsT0FBZCxDQUFzQixHQUF0QixFQUEyQixHQUEzQixFQUFnQyxNQUFNLENBQUMsSUFBUCxDQUFZLEdBQVosRUFBaUIsS0FBakQ7QUFDQSxjQUFJLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FBWixFQUFpQixDQUFqQixLQUF1QixFQUEzQixFQUErQixHQUFHLENBQUMsU0FBSixDQUFjLFdBQWQsQ0FBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsT0FBcEMsRUFBL0IsS0FDSyxJQUFJLE1BQU0sQ0FBQyxJQUFQLENBQVksR0FBWixFQUFpQixDQUFqQixLQUF1QixFQUEzQixFQUErQixHQUFHLENBQUMsU0FBSixDQUFjLFdBQWQsQ0FBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsU0FBcEMsRUFBL0IsS0FDQSxHQUFHLENBQUMsU0FBSixDQUFjLFdBQWQsQ0FBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsTUFBcEM7QUFDUjtBQUNKO0FBQ0o7Ozs7O0FBR0wsTUFBTSxDQUFDLE9BQVAsR0FBaUIsVUFBakI7OztBQ3JVQSxhLENBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBRU0sTzs7Ozs7Ozs7Z0dBRUY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsdUJBQ1UsS0FBSyxVQUFMLEVBRFY7O0FBQUE7QUFBQTtBQUFBLHVCQUVVLEtBQUssU0FBTCxFQUZWOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7V0FLQSxzQkFBYTtBQUNULGFBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjtBQUNwQyxRQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsUUFBVixFQUFvQjtBQUFBLGlCQUFNLE9BQU8sRUFBYjtBQUFBLFNBQXBCO0FBQ0gsT0FGTSxDQUFQO0FBR0g7OztXQUVELHFCQUFZO0FBQ1IsYUFBTyxJQUFJLE9BQUosQ0FBWSxVQUFDLE9BQUQsRUFBVSxNQUFWLEVBQXFCO0FBQ3BDLFFBQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxJQUFaLENBQWlCLE9BQWpCLEVBQTBCLElBQTFCLEVBQWdDLE9BQU8sRUFBdkM7QUFDSCxPQUZNLENBQVA7QUFHSDs7OztrR0FFRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFhLGdCQUFBLFFBQWIsOERBQXdCLGdCQUF4QjtBQUFBLGtEQUNXLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBb0I7QUFDbkMsa0JBQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEtBQWxCLENBQXdCLE1BQXhCLENBQStCO0FBQzNCLG9CQUFBLElBQUksRUFBRyxRQURvQjtBQUUzQixvQkFBQSxPQUFPLEVBQUUsQ0FBQyxlQUFELENBRmtCO0FBRzNCLG9CQUFBLE1BQU0sRUFBRTtBQUhtQixtQkFBL0IsRUFJRyxJQUpILENBSVEsVUFBQSxHQUFHLEVBQUU7QUFDVCxvQkFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQUosQ0FBVyxFQUFaLENBQVA7QUFDSCxtQkFORCxFQU1HLFVBQVUsS0FBVixFQUFpQjtBQUNoQixvQkFBQSxNQUFNLENBQUMsS0FBRCxDQUFOO0FBQ0gsbUJBUkQ7QUFTSCxpQkFWTSxDQURYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7O21HQWNBLGtCQUFhLE1BQWI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtEQUNXLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBb0I7QUFDbkMsa0JBQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEtBQWxCLFdBQStCO0FBQzNCLG9CQUFBLE1BQU0sRUFBRztBQURrQixtQkFBL0IsRUFFRyxJQUZILENBRVEsVUFBQSxHQUFHLEVBQUU7QUFDVCxvQkFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQUwsQ0FBUDtBQUNILG1CQUpELEVBSUcsVUFBVSxLQUFWLEVBQWlCO0FBQ2hCLG9CQUFBLE1BQU0sQ0FBQyxLQUFELENBQU47QUFDSCxtQkFORDtBQU9ILGlCQVJNLENBRFg7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7Ozs7Z0dBWUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtEQUNXLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBb0I7QUFDbkMsa0JBQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEtBQWxCLENBQXdCLElBQXhCLENBQTZCO0FBQ3pCO0FBQ0Esb0JBQUEsTUFBTSxFQUFFLGVBRmlCO0FBR3pCLG9CQUFBLE1BQU0sRUFBRTtBQUhpQixtQkFBN0IsRUFJRyxJQUpILENBSVEsVUFBQSxHQUFHLEVBQUU7QUFDVCxvQkFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQUosQ0FBVyxLQUFaLENBQVA7QUFDSCxtQkFORCxFQU1HLFVBQVUsS0FBVixFQUFpQjtBQUNoQixvQkFBQSxNQUFNLENBQUMsS0FBRCxDQUFOO0FBQ0gsbUJBUkQ7QUFTSCxpQkFWTSxDQURYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7OytGQWNBLGtCQUFVLE1BQVY7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtEQUNXLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBb0I7QUFDbkMsa0JBQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEtBQWxCLENBQXdCLEdBQXhCLENBQTRCO0FBQ3hCLG9CQUFBLE1BQU0sRUFBRSxNQURnQjtBQUV4QixvQkFBQSxHQUFHLEVBQUU7QUFGbUIsbUJBQTVCLEVBR0csSUFISCxDQUdRLFVBQUEsR0FBRyxFQUFFO0FBQ1Qsb0JBQUEsT0FBTyxDQUFDLEdBQUQsQ0FBUDtBQUNILG1CQUxELEVBS0csVUFBVSxLQUFWLEVBQWlCO0FBQ2hCLG9CQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksS0FBWjtBQUNBLG9CQUFBLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBUCxDQUFOO0FBQ0gsbUJBUkQ7QUFTSCxpQkFWTSxDQURYOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE87Ozs7Ozs7Ozs7O21HQWNBLGtCQUFjLE1BQWQsRUFBc0IsSUFBdEI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtEQUNXLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBb0I7QUFDbkMsa0JBQUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxPQUFaLENBQW9CO0FBQ2hCLG9CQUFBLElBQUksRUFBRywyQkFBMkIsTUFEbEI7QUFFaEIsb0JBQUEsTUFBTSxFQUFHLE9BRk87QUFHaEIsb0JBQUEsTUFBTSxFQUFHO0FBQ0wsc0JBQUEsVUFBVSxFQUFHO0FBRFIscUJBSE87QUFNaEIsb0JBQUEsT0FBTyxFQUFHO0FBQ04sc0NBQWlCO0FBRFgscUJBTk07QUFTaEIsb0JBQUEsSUFBSSxFQUFHO0FBVFMsbUJBQXBCLEVBVUcsSUFWSCxDQVVRLFVBQUEsR0FBRyxFQUFFO0FBQ1Qsb0JBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFMLENBQVcsR0FBRyxDQUFDLElBQWYsQ0FBRCxDQUFQO0FBQ0gsbUJBWkQsRUFZRyxVQUFVLEtBQVYsRUFBaUI7QUFDaEIsb0JBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxLQUFaO0FBQ0Esb0JBQUEsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFQLENBQU47QUFDSCxtQkFmRDtBQWdCSCxpQkFqQk0sQ0FEWDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7Ozs7OztrR0FxQkEsa0JBQWEsTUFBYixFQUFxQixRQUFyQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0RBQ1csSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFvQjtBQUNuQyxrQkFBQSxJQUFJLENBQUMsTUFBTCxDQUFZLEtBQVosQ0FBa0IsS0FBbEIsQ0FBd0IsTUFBeEIsQ0FBK0I7QUFDM0Isb0JBQUEsTUFBTSxFQUFFLE1BRG1CO0FBRTNCLG9CQUFBLElBQUksRUFBRTtBQUZxQixtQkFBL0IsRUFHRyxJQUhILENBR1EsVUFBQSxHQUFHLEVBQUU7QUFDVCxvQkFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFHLENBQUMsSUFBZixDQUFELENBQVA7QUFDSCxtQkFMRCxFQUtHLFVBQVUsS0FBVixFQUFpQjtBQUNoQixvQkFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQVo7QUFDQSxvQkFBQSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQVAsQ0FBTjtBQUNILG1CQVJEO0FBU0gsaUJBVk0sQ0FEWDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7Ozs7Ozs7ZUFlVyxPOzs7O0FDaEhmO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG1CQUFELENBQVAsQ0FBNkIsYUFBbkQ7O0lBRU0sZTs7Ozs7QUFDRiwyQkFBWSxHQUFaLEVBQWlCLEdBQWpCLEVBQXNCO0FBQUE7QUFBQSw2QkFDWixhQURZLEVBRVo7QUFBQyxNQUFBLE1BQU0sRUFBRztBQUFDLFFBQUEsR0FBRyxFQUFHLEdBQVA7QUFBWSxRQUFBLEdBQUcsRUFBRztBQUFsQjtBQUFWLEtBRlk7QUFJckI7OztrREFMeUIsVzs7SUFReEIsaUI7Ozs7O0FBQ0YsNkJBQVksR0FBWixFQUFpQixLQUFqQixFQUF3QixRQUF4QixFQUFrQztBQUFBO0FBQUEsOEJBQ3hCLGVBRHdCLEVBRTFCO0FBQUMsTUFBQSxNQUFNLEVBQUc7QUFBQyxRQUFBLEtBQUssRUFBRyxLQUFUO0FBQWdCLFFBQUEsR0FBRyxFQUFHLEdBQXRCO0FBQTJCLFFBQUEsUUFBUSxFQUFHO0FBQXRDO0FBQVYsS0FGMEI7QUFJakM7OztrREFMNEIsVzs7SUFRM0IsUzs7Ozs7QUFDRix1QkFBYztBQUFBO0FBQUE7QUFFYjs7Ozs7aUdBRUQ7QUFBQTs7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSx1Q0FFYSxHQUZiO0FBR1Esa0JBQUEsS0FBSSxDQUFDLFNBQUwsQ0FBZSxHQUFmLEVBQW9CLGdCQUFwQixDQUFxQyxPQUFyQyxFQUE4QyxVQUFDLEtBQUQ7QUFBQSwyQkFBUyxLQUFLLENBQUMsTUFBTixDQUFhLE9BQWIsQ0FBcUIsTUFBckIsQ0FBNEIsQ0FBNUIsRUFBK0IsQ0FBL0IsQ0FBVDtBQUFBLG1CQUE5Qzs7QUFFQSxrQkFBQSxLQUFJLENBQUMsU0FBTCxDQUFlLEdBQWYsRUFBb0IsZ0JBQXBCLENBQXFDLE1BQXJDLEVBQTZDLFVBQUMsS0FBRCxFQUFTO0FBQ2xELHdCQUFJLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTixDQUFhLEtBQWIsQ0FBbUIsV0FBbkIsQ0FBZjs7QUFDQSxvQkFBQSxLQUFJLENBQUMsYUFBTCxDQUFtQixJQUFJLGlCQUFKLENBQXNCLEdBQXRCLEVBQTJCLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBeEMsRUFBOEMsUUFBOUMsQ0FBbkI7QUFDSCxtQkFIRDs7QUFMUiwrQ0FVaUIsR0FWakI7QUFXWSxvQkFBQSxLQUFJLENBQUMsT0FBTCxDQUFhLEdBQWIsRUFBa0IsR0FBbEIsRUFBdUIsZ0JBQXZCLENBQXdDLE9BQXhDLEVBQWlELFlBQU07QUFDbkQsc0JBQUEsS0FBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBSSxlQUFKLENBQW9CLEdBQXBCLEVBQXlCLEdBQXpCLENBQW5CO0FBQ0gscUJBRkQ7QUFYWjs7QUFVUSx1QkFBSyxJQUFJLEdBQUcsR0FBRyxDQUFmLEVBQWtCLEdBQUcsR0FBRyxDQUF4QixFQUEyQixHQUFHLEVBQTlCLEVBQWtDO0FBQUEsMkJBQXpCLEdBQXlCO0FBSWpDO0FBZFQ7O0FBRUkscUJBQVMsR0FBVCxHQUFlLENBQWYsRUFBa0IsR0FBRyxHQUFHLENBQXhCLEVBQTJCLEdBQUcsRUFBOUIsRUFBa0M7QUFBQSx3QkFBekIsR0FBeUI7QUFhakM7O0FBZkw7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7QUFrQkE7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0ksbUJBQVUsS0FBVixFQUFpQixLQUFqQixFQUF3QixRQUF4QixFQUErQztBQUFBLFVBQWIsSUFBYSx1RUFBTixLQUFNO0FBQzNDLFVBQUksT0FBTyxHQUFHLEtBQUssU0FBTCxDQUFlLEtBQWYsQ0FBZDtBQUNBLE1BQUEsT0FBTyxDQUFDLElBQVIsR0FBZSxLQUFmO0FBQ0EsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFFBQVo7QUFDQSxVQUFJLFFBQUosRUFBYyxPQUFPLENBQUMsS0FBUixDQUFjLFdBQWQsSUFBNkIsUUFBN0I7O0FBQ2QsVUFBSSxJQUFKLEVBQVM7QUFDTCxRQUFBLE9BQU8sQ0FBQyxZQUFSLENBQXFCLGlCQUFyQixFQUF3QyxPQUF4QztBQUNIO0FBQ0o7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0ksbUJBQVUsS0FBVixFQUFnQjtBQUNaLFVBQUksT0FBTyxLQUFQLEtBQWlCLFFBQWpCLElBQTZCLEtBQUssR0FBRyxDQUFyQyxJQUEwQyxLQUFLLEdBQUcsQ0FBdEQsRUFBeUQsTUFBTSxJQUFJLEtBQUosQ0FBVSxvQkFBb0IsS0FBOUIsQ0FBTjtBQUN6RCxVQUFJLFFBQVEsc0NBQStCLEtBQS9CLGdCQUFaO0FBQ0EsYUFBTyxLQUFLLGFBQUwsQ0FBbUIsUUFBbkIsQ0FBUDtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O1dBQ0ksaUJBQVEsR0FBUixFQUFhLEdBQWIsRUFBNkI7QUFBQSxVQUFYLEtBQVcsdUVBQUgsRUFBRztBQUN6QixXQUFLLE9BQUwsQ0FBYSxHQUFiLEVBQWtCLEdBQWxCLEVBQXVCLFdBQXZCLEdBQXFDLEtBQXJDO0FBQ0g7OztXQUVELGlCQUFRLEdBQVIsRUFBYSxHQUFiLEVBQWlCO0FBQ2IsVUFBSSxRQUFRLHlCQUFpQixHQUFqQiw0QkFBb0MsR0FBcEMsaUJBQVo7QUFDQSxhQUFPLEtBQUssYUFBTCxDQUFtQixRQUFuQixDQUFQO0FBQ0g7OztXQUVELHFCQUFZLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsS0FBdEIsRUFBNEI7QUFDeEIsVUFBSSxPQUFPLEdBQVAsS0FBZSxRQUFmLElBQTJCLEdBQUcsR0FBRyxDQUFqQyxJQUFzQyxHQUFHLEdBQUcsQ0FBaEQsRUFBbUQsTUFBTSxJQUFJLEtBQUosQ0FBVSxrQkFBa0IsR0FBNUIsQ0FBTjtBQUNuRCxVQUFJLE9BQU8sR0FBUCxLQUFlLFFBQWYsSUFBMkIsR0FBRyxHQUFHLENBQWpDLElBQXNDLEdBQUcsR0FBRyxDQUFoRCxFQUFtRCxNQUFNLElBQUksS0FBSixDQUFVLGtCQUFrQixHQUE1QixDQUFOO0FBQ25ELFdBQUssT0FBTCxDQUFhLEdBQWIsRUFBa0IsR0FBbEIsRUFBdUIsWUFBdkIsQ0FBb0MsZUFBcEMsRUFBcUQsS0FBckQ7QUFDSDs7O0VBckVtQixhOztBQXdFeEIsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsTUFBdEIsQ0FBNkIsWUFBN0IsRUFBMkMsU0FBM0M7QUFDQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFqQjs7Ozs7Ozs7Ozs7SUNyR00sSTs7Ozs7OztXQUNGLGNBQUssWUFBTCxFQUFrQjtBQUFBOztBQUNkLFdBQUssWUFBTCxHQUFvQixZQUFwQjtBQUNBLFdBQUssVUFBTCxDQUFnQixnQkFBaEIsQ0FBaUMsT0FBakMsRUFBMEM7QUFBQSxlQUFJLEtBQUksQ0FBQyxVQUFMLEVBQUo7QUFBQSxPQUExQztBQUNBLFdBQUssWUFBTDtBQUVBLFdBQUssUUFBTCxDQUFjLGdCQUFkLENBQStCLFlBQS9CLEVBQTZDO0FBQUEsZUFBSyxLQUFJLENBQUMsVUFBTCxFQUFMO0FBQUEsT0FBN0M7QUFDQSxXQUFLLFVBQUwsQ0FBZ0IsZ0JBQWhCLENBQWlDLFlBQWpDLEVBQStDO0FBQUEsZUFBSyxLQUFJLENBQUMsVUFBTCxFQUFMO0FBQUEsT0FBL0M7QUFDQSxXQUFLLFFBQUwsQ0FBYyxnQkFBZCxDQUErQixZQUEvQixFQUE2QztBQUFBLGVBQUssS0FBSSxDQUFDLFVBQUwsRUFBTDtBQUFBLE9BQTdDO0FBQ0EsV0FBSyxVQUFMLENBQWdCLGdCQUFoQixDQUFpQyxZQUFqQyxFQUErQztBQUFBLGVBQUssS0FBSSxDQUFDLFVBQUwsRUFBTDtBQUFBLE9BQS9DO0FBRUEsTUFBQSxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsd0JBQTFCLEVBQW9ELE9BQXBELENBQTRELFVBQUMsR0FBRCxFQUFRO0FBQ2hFLFFBQUEsR0FBRyxDQUFDLGdCQUFKLENBQXFCLE9BQXJCLEVBQThCO0FBQUEsaUJBQUksS0FBSSxDQUFDLEtBQUwsRUFBSjtBQUFBLFNBQTlCO0FBQ0gsT0FGRDtBQUlBLE1BQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLFdBQTFCLEVBQXVDLE9BQXZDLENBQStDLFVBQUMsR0FBRCxFQUFPO0FBQ2xELFFBQUEsR0FBRyxDQUFDLGFBQUosQ0FBa0IsYUFBbEIsRUFBaUMsZ0JBQWpDLENBQWtELE9BQWxELEVBQTJELFlBQUk7QUFDM0QsVUFBQSxLQUFJLENBQUMsVUFBTCxDQUFnQixHQUFoQjtBQUNILFNBRkQ7QUFHSCxPQUpEO0FBTUEsYUFBTyxJQUFQO0FBQ0g7OztXQUVELGlCQUFPO0FBQ0gsV0FBSyxRQUFMLENBQWMsU0FBZCxDQUF3QixHQUF4QixDQUE0QixRQUE1QjtBQUVBLE1BQUEsUUFBUSxDQUFDLGdCQUFULENBQTBCLHdCQUExQixFQUFvRCxPQUFwRCxDQUE0RCxVQUFDLEdBQUQsRUFBTztBQUMvRCxRQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsR0FBZCxDQUFrQixRQUFsQjtBQUNILE9BRkQ7QUFHSDs7O1dBRUQsZ0JBQU07QUFDRixXQUFLLFFBQUwsQ0FBYyxTQUFkLENBQXdCLE1BQXhCLENBQStCLFFBQS9CO0FBQ0EsV0FBSyxZQUFMO0FBQ0g7OztXQUVELHNCQUFZO0FBQUE7O0FBQ1IsVUFBSSxLQUFLLE9BQVQsRUFBa0I7QUFDbEIsV0FBSyxPQUFMLEdBQWUsVUFBVSxDQUFDLFlBQUk7QUFDMUIsUUFBQSxNQUFJLENBQUMsS0FBTDs7QUFDQSxRQUFBLE1BQUksQ0FBQyxPQUFMLEdBQWUsSUFBZjtBQUNILE9BSHdCLEVBR3RCLEdBSHNCLENBQXpCO0FBSUg7OztXQUVELHNCQUFZO0FBQ1IsVUFBSSxDQUFDLEtBQUssT0FBVixFQUFtQjtBQUNuQixNQUFBLFlBQVksQ0FBQyxLQUFLLE9BQU4sQ0FBWjtBQUNBLFdBQUssT0FBTCxHQUFlLElBQWY7QUFDSDs7O1dBRUQsb0JBQVcsT0FBWCxFQUFtQjtBQUFBOztBQUNmLE1BQUEsT0FBTyxlQUFHLE9BQUgsK0NBQWMsS0FBSyxRQUExQjs7QUFDQSxVQUFJLENBQUMsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsUUFBbEIsQ0FBMkIsV0FBM0IsQ0FBTCxFQUE2QztBQUN6QyxRQUFBLE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBUixDQUFzQixZQUF0QixDQUFWO0FBQ0g7O0FBRUQsVUFBSSxPQUFPLENBQUMsU0FBUixDQUFrQixRQUFsQixDQUEyQixRQUEzQixDQUFKLEVBQXlDO0FBQ3JDLFFBQUEsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsTUFBbEIsQ0FBeUIsUUFBekI7QUFDSCxPQUZELE1BRU87QUFDSCxZQUFJLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFFBQWxCLENBQTJCLFdBQTNCLENBQUosRUFBNEM7QUFDeEMsVUFBQSxPQUFPLENBQUMsU0FBUixDQUFrQixHQUFsQixDQUFzQixRQUF0QjtBQUNIOztBQUNELFFBQUEsT0FBTyxDQUFDLGdCQUFSLENBQXlCLFlBQXpCLEVBQXVDLE9BQXZDLENBQ0ksVUFBQyxHQUFELEVBQVM7QUFDTCxVQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsR0FBZCxDQUFrQixRQUFsQjtBQUNILFNBSEw7QUFLSDtBQUNKOzs7V0FFRCx3QkFBYztBQUNWLFVBQU0sSUFBSSxHQUFHLEtBQUssVUFBTCxDQUFnQixxQkFBaEIsR0FBd0MsSUFBckQ7QUFDQSxVQUFNLE1BQU0sR0FBRyxLQUFLLFVBQUwsQ0FBZ0IscUJBQWhCLEdBQXdDLEtBQXZEO0FBQ0EsVUFBTSxNQUFNLEdBQUcsS0FBSyxRQUFMLENBQWMscUJBQWQsR0FBc0MsS0FBckQ7O0FBQ0EsVUFBSyxJQUFJLEdBQUcsTUFBUCxHQUFnQixNQUFoQixHQUF5QixDQUExQixHQUErQixNQUFNLENBQUMsVUFBMUMsRUFBcUQ7QUFDakQsYUFBSyxXQUFMO0FBQ0gsT0FGRCxNQUVPO0FBQ0gsYUFBSyxZQUFMO0FBQ0g7QUFDSjs7O1dBRUQsdUJBQWE7QUFDVCxVQUFNLElBQUksR0FBRyxLQUFLLFVBQUwsQ0FBZ0IsVUFBN0I7QUFDQSxVQUFNLEtBQUssR0FBRyxLQUFLLFFBQUwsQ0FBYyxXQUE1QjtBQUNBLFdBQUssUUFBTCxDQUFjLEtBQWQsQ0FBb0IsSUFBcEIsR0FBNEIsSUFBSSxHQUFHLEtBQVAsR0FBZSxDQUFoQixHQUFxQixJQUFoRDtBQUNIOzs7V0FFRCx3QkFBYztBQUNWLFVBQU0sSUFBSSxHQUFHLEtBQUssVUFBTCxDQUFnQixVQUE3QjtBQUNBLFVBQU0sS0FBSyxHQUFHLEtBQUssVUFBTCxDQUFnQixXQUE5QjtBQUNBLFdBQUssUUFBTCxDQUFjLEtBQWQsQ0FBb0IsSUFBcEIsR0FBNEIsSUFBSSxHQUFHLEtBQVAsR0FBZSxDQUFoQixHQUFxQixJQUFoRDtBQUNIOzs7U0FFRCxlQUFVO0FBQ04sYUFBTyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUFLLFlBQTVCLENBQVA7QUFDSDs7O1NBRUQsZUFBZ0I7QUFDWixhQUFPLEtBQUssSUFBTCxDQUFVLGFBQVYsQ0FBd0IsWUFBeEIsQ0FBUDtBQUNIOzs7U0FFRCxlQUFjO0FBQ1YsYUFBTyxLQUFLLElBQUwsQ0FBVSxhQUFWLENBQXdCLFlBQXhCLENBQVA7QUFDSDs7Ozs7QUFHTCxNQUFNLENBQUMsT0FBUCxHQUFpQixJQUFqQjs7Ozs7Ozs7Ozs7Ozs7OztJQzNHTSxLOzs7Ozs7O1dBQ0YsZ0JBQXlCO0FBQUEsVUFBcEIsSUFBb0IsdUVBQWIsV0FBYTtBQUNyQixXQUFLLFlBQUwsR0FBb0IsQ0FBcEI7QUFFQSxXQUFLLFNBQUwsR0FBaUI7QUFDYixRQUFBLElBQUksRUFBRSxJQURPO0FBRWIsUUFBQSxNQUFNLEVBQUU7QUFGSyxPQUFqQjtBQUtBLFdBQUssZ0JBQUw7QUFDQSxhQUFPLElBQVA7QUFDSDs7O1NBTUQsZUFBVztBQUNQLGFBQU8sS0FBSyxTQUFMLENBQWUsSUFBdEI7QUFDSCxLO1NBTkQsYUFBUyxNQUFULEVBQWlCO0FBQ2IsV0FBSyxTQUFMLENBQWUsSUFBZixHQUFzQixNQUF0QjtBQUNIOzs7V0FNRCxhQUFJLFNBQUosRUFBZTtBQUNYLFdBQUssWUFBTCxHQUFvQixDQUFwQjtBQUNBLFdBQUssU0FBTCxHQUFpQixTQUFqQjtBQUNBLGFBQU8sSUFBUDtBQUNIOzs7V0FFRCxlQUFNO0FBQ0YsYUFBTyxLQUFLLFNBQVo7QUFDSDs7O1dBRUQsa0JBQVMsS0FBVCxFQUFnQjtBQUFBOztBQUNaLE1BQUEsS0FBSyxhQUFHLEtBQUgsMkNBQVksS0FBSyxZQUF0QjtBQUNBLGFBQU8sS0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixLQUF0QixDQUFQO0FBQ0gsSyxDQUVEOzs7O1dBQ0EsdUJBQWMsSUFBZCxFQUFvQixFQUFwQixFQUF1QjtBQUNuQixVQUFJLENBQUMsR0FBRyxLQUFLLFNBQUwsQ0FBZSxNQUF2QjtBQUNBLFVBQUksQ0FBQyxDQUFDLE1BQUYsSUFBWSxDQUFoQixFQUFtQjtBQUZBLGlCQUdBLENBQUMsQ0FBQyxDQUFDLEVBQUQsQ0FBRixFQUFRLENBQUMsQ0FBQyxJQUFELENBQVQsQ0FIQTtBQUdsQixNQUFBLENBQUMsQ0FBQyxJQUFELENBSGlCO0FBR1QsTUFBQSxDQUFDLENBQUMsRUFBRCxDQUhRO0FBSXRCOzs7V0FFRCxtQkFBVSxLQUFWLEVBQWlCO0FBQ2IsYUFBTyxLQUFLLFFBQUwsR0FBZ0IsTUFBaEIsQ0FBdUIsS0FBdkIsQ0FBUDtBQUNIOzs7V0FFRCxpQkFBUSxHQUFSLEVBQWEsTUFBYixFQUFxQjtBQUNqQixhQUFPLEtBQUssU0FBTCxDQUFlLE1BQWYsRUFBdUIsSUFBdkIsQ0FBNEIsR0FBNUIsQ0FBUDtBQUNIOzs7V0FFRCx1QkFBYztBQUNWLFVBQUksS0FBSyxVQUFMLEtBQW9CLENBQXhCLEVBQTJCO0FBQzNCLFdBQUssU0FBTCxDQUFlLE1BQWYsQ0FBc0IsTUFBdEIsQ0FBNkIsS0FBSyxZQUFsQyxFQUFnRCxDQUFoRDtBQUNBLFVBQUksS0FBSyxZQUFMLElBQXFCLEtBQUssVUFBOUIsRUFBMEMsS0FBSyxZQUFMLEdBQW9CLEtBQUssVUFBTCxHQUFrQixDQUF0QztBQUM3Qzs7O1dBRUQsa0NBQXdCO0FBQ3BCLFVBQUksS0FBSyxHQUFHO0FBQ1IsUUFBQSxJQUFJLEVBQUUsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsZUFEakI7QUFFUixRQUFBLFFBQVEsRUFBRyxFQUZIO0FBR1IsUUFBQSxPQUFPLEVBQUc7QUFIRixPQUFaOztBQU1BLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsQ0FBcEIsRUFBdUIsQ0FBQyxFQUF4QixFQUEyQjtBQUN2QixRQUFBLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxJQUFtQjtBQUNmLFVBQUEsSUFBSSxFQUFHLEVBRFE7QUFFZixVQUFBLE1BQU0sRUFBRztBQUZNLFNBQW5CO0FBSUg7O0FBRUQsV0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixJQUF0QixDQUEyQixLQUEzQjtBQUNBLGFBQU8sS0FBUDtBQUNIOzs7V0FFRCw0QkFBbUI7QUFDZixVQUFJLEtBQUssR0FBRztBQUNSLFFBQUEsSUFBSSxFQUFFLEtBQUssQ0FBQyxZQUFOLENBQW1CLFFBRGpCO0FBRVIsUUFBQSxNQUFNLEVBQUU7QUFGQSxPQUFaOztBQUtBLFdBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsQ0FBcEIsRUFBdUIsQ0FBQyxFQUF4QixFQUE0QjtBQUN4QixRQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsQ0FBYixJQUFrQjtBQUNkLFVBQUEsUUFBUSxFQUFFLEVBREk7QUFFZCxVQUFBLElBQUksRUFBRTtBQUZRLFNBQWxCOztBQUtBLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsQ0FBcEIsRUFBdUIsQ0FBQyxFQUF4QixFQUE0QjtBQUN4QixVQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsQ0FBYixFQUFnQixJQUFoQixDQUFxQixDQUFyQixJQUEwQjtBQUN0QixZQUFBLEtBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFMLElBQVUsR0FESztBQUV0QixZQUFBLElBQUksRUFBRSxNQUZnQjtBQUd0QixZQUFBLENBQUMsRUFBRSxFQUhtQjtBQUl0QixZQUFBLENBQUMsRUFBRTtBQUptQixXQUExQjtBQU1IO0FBQ0o7O0FBRUQsV0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixJQUF0QixDQUEyQixLQUEzQjtBQUNBLGFBQU8sS0FBUDtBQUNIOzs7U0FFRCxlQUFpQjtBQUNiLGFBQU8sS0FBSyxTQUFMLENBQWUsTUFBZixDQUFzQixNQUE3QjtBQUNIOzs7V0FFRCwwQkFBZ0I7QUFDWixXQUFLLFlBQUw7QUFDQSxVQUFJLEtBQUssWUFBTCxJQUFxQixLQUFLLFVBQTlCLEVBQTBDLEtBQUssWUFBTCxHQUFvQixLQUFLLFVBQUwsR0FBa0IsQ0FBdEM7QUFDN0M7OztXQUVELDBCQUFnQjtBQUNaLFdBQUssWUFBTDtBQUNBLFVBQUksS0FBSyxZQUFMLEdBQW9CLENBQXhCLEVBQTJCLEtBQUssWUFBTCxHQUFvQixDQUFwQjtBQUM5Qjs7O1dBRUQseUJBQWdCO0FBQ1osVUFBSSxLQUFLLEdBQUcsS0FBSyxRQUFMLEVBQVo7O0FBRUEsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxDQUFwQixFQUF1QixDQUFDLEVBQXhCLEVBQTRCO0FBQ3hCLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsQ0FBcEIsRUFBdUIsQ0FBQyxFQUF4QixFQUE0QjtBQUN4QixVQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsQ0FBYixFQUFnQixJQUFoQixDQUFxQixDQUFyQixFQUF3QixLQUF4QixJQUFpQyxDQUFqQztBQUNIO0FBQ0o7QUFDSjs7O1dBRUQseUJBQWdCO0FBQ1osVUFBSSxLQUFLLEdBQUcsS0FBSyxRQUFMLEVBQVo7O0FBRUEsV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFiLEVBQWdCLENBQUMsR0FBRyxDQUFwQixFQUF1QixDQUFDLEVBQXhCLEVBQTRCO0FBQ3hCLGFBQUssSUFBSSxDQUFDLEdBQUcsQ0FBYixFQUFnQixDQUFDLEdBQUcsQ0FBcEIsRUFBdUIsQ0FBQyxFQUF4QixFQUE0QjtBQUN4QixVQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsQ0FBYixFQUFnQixJQUFoQixDQUFxQixDQUFyQixFQUF3QixLQUF4QixJQUFpQyxDQUFqQztBQUNIO0FBQ0o7QUFDSjs7Ozs7QUFHTCxLQUFLLENBQUMsWUFBTixHQUFxQjtBQUNqQixFQUFBLFFBQVEsRUFBRyxRQURNO0FBRWpCLEVBQUEsZUFBZSxFQUFHO0FBRkQsQ0FBckI7ZUFLZSxLOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3SWYsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG1CQUFELENBQVAsQ0FBNkIsYUFBbkQ7O0FBQ0EsT0FBTyxDQUFDLGVBQUQsQ0FBUDs7SUFFTSxVOzs7OztBQUNGLHNCQUFZLEtBQVosRUFBbUIsSUFBbkIsRUFBeUI7QUFBQTtBQUFBLDZCQUNmLGFBRGUsRUFFakI7QUFBQyxNQUFBLE1BQU0sRUFBRztBQUFDLFFBQUEsS0FBSyxFQUFHLEtBQVQ7QUFBZ0IsUUFBQSxJQUFJLEVBQUc7QUFBdkI7QUFBVixLQUZpQjtBQUl4Qjs7O2tEQUxxQixXOztJQVFwQixXOzs7OztBQUNGLHVCQUFZLEtBQVosRUFBbUIsS0FBbkIsRUFBMEI7QUFBQTtBQUFBLDhCQUNoQixjQURnQixFQUVsQjtBQUFDLE1BQUEsTUFBTSxFQUFHO0FBQUMsUUFBQSxLQUFLLEVBQUcsS0FBVDtBQUFnQixRQUFBLEtBQUssRUFBRztBQUF4QjtBQUFWLEtBRmtCO0FBSXpCOzs7a0RBTHNCLFc7O0lBUXJCLGE7Ozs7O0FBQ0YsMkJBQWM7QUFBQTtBQUFBLDhCQUNKLGlCQURJO0FBRWI7OztrREFId0IsVzs7SUFNdkIsa0I7Ozs7Ozs7Ozs7OztXQUVGLGtCQUFTLEtBQVQsRUFBZTtBQUNYLFdBQUssS0FBTCxHQUFhLEtBQWI7QUFDSDs7OztpR0FFRDtBQUFBOztBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBLHVEQUV3QixLQUFLLGdCQUFMLENBQXNCLHVCQUF0QixDQUZ4Qjs7QUFBQTtBQUVJLHNFQUFtRTtBQUExRCxvQkFBQSxPQUEwRDtBQUMvRCxvQkFBQSxPQUFPLENBQUMsT0FBUixDQUFnQixJQUFoQixHQUF1QixJQUF2QjtBQUNBLG9CQUFBLE9BQU8sQ0FBQyxnQkFBUixDQUF5QixVQUF6QixFQUFxQyxVQUFDLEtBQUQ7QUFBQSw2QkFBUyxLQUFJLENBQUMsV0FBTCxDQUFpQixLQUFqQixDQUFUO0FBQUEscUJBQXJDO0FBQ0Esb0JBQUEsT0FBTyxDQUFDLGdCQUFSLENBQXlCLE1BQXpCLEVBQWlDLFVBQUMsS0FBRCxFQUFTO0FBQ3RDLDBCQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTixDQUFhLFlBQWIsQ0FBMEIsWUFBMUIsQ0FBWjs7QUFDQSwwQkFBSSxJQUFJLEdBQUcsS0FBSSxDQUFDLGFBQUwsb0NBQThDLEtBQTlDLFVBQXlELElBQXBFOztBQUNBLHNCQUFBLEtBQUksQ0FBQyxhQUFMLENBQW1CLElBQUksVUFBSixDQUFlLEtBQWYsRUFBc0IsSUFBdEIsQ0FBbkI7QUFDSCxxQkFKRDtBQUtIO0FBVkw7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFBQSx3REFZd0IsS0FBSyxnQkFBTCxDQUFzQixXQUF0QixDQVp4Qjs7QUFBQTtBQVlJLHlFQUF1RDtBQUE5QyxvQkFBQSxRQUE4Qzs7QUFDbkQsb0JBQUEsUUFBTyxDQUFDLGdCQUFSLENBQXlCLGNBQXpCLEVBQXlDLFVBQUMsS0FBRCxFQUFTO0FBQzlDLDBCQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsS0FBSyxDQUFDLE1BQTlCLEVBQXNDLGdCQUF0QyxDQUF1RCxTQUF2RCxDQUFaO0FBQ0EsMEJBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFOLENBQWEsS0FBekI7O0FBQ0Esc0JBQUEsS0FBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBSSxXQUFKLENBQWdCLEtBQWhCLEVBQXVCLEtBQXZCLENBQW5CO0FBQ0gscUJBSkQ7QUFLSDtBQWxCTDtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQW9CSSxxQkFBSyxhQUFMLENBQW1CLGdCQUFuQixFQUFxQyxnQkFBckMsQ0FBc0QsT0FBdEQsRUFBK0QsWUFBSTtBQUMvRCxrQkFBQSxLQUFJLENBQUMsYUFBTCxDQUFtQixJQUFJLGFBQUosRUFBbkI7QUFDSCxpQkFGRDs7QUFwQko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsTzs7Ozs7Ozs7OztXQXlCQSxxQkFBWSxLQUFaLEVBQW1CO0FBQ2YsVUFBSSxLQUFLLENBQUMsS0FBTixLQUFnQixFQUFwQixFQUF1QjtBQUNuQixRQUFBLEtBQUssQ0FBQyxlQUFOO0FBQ0EsUUFBQSxLQUFLLENBQUMsY0FBTjtBQUVBLFlBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixLQUFLLENBQUMsTUFBOUIsRUFBc0MsZ0JBQXRDLENBQXVELFNBQXZELENBQVo7QUFDQSxRQUFBLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBRCxDQUFoQjs7QUFDQSxZQUFJLEtBQUssSUFBSSxDQUFiLEVBQWU7QUFDWCxVQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsSUFBYjtBQUNILFNBRkQsTUFFTztBQUNILGNBQUksUUFBUSxzQ0FBOEIsS0FBSyxHQUFHLENBQXRDLFFBQVo7QUFDQSxlQUFLLGFBQUwsQ0FBbUIsUUFBbkIsRUFBNkIsS0FBN0I7QUFDSDs7QUFFRCxlQUFPLEtBQVA7QUFDSDs7QUFDRCxNQUFBLEtBQUssQ0FBQyxNQUFOLENBQWEsT0FBYixDQUFxQixNQUFyQixDQUE0QixDQUE1QixFQUErQixDQUEvQjtBQUNBLGFBQU8sSUFBUDtBQUNIO0FBRUQ7QUFDSjtBQUNBOzs7O1dBQ0ksbUJBQVUsTUFBVixFQUFpQjtBQUFBLGtEQUNHLEtBQUssZ0JBQUwsYUFESDtBQUFBOztBQUFBO0FBQ2I7QUFBQSxjQUFTLEdBQVQ7QUFBb0QsVUFBQSxHQUFHLENBQUMsU0FBSixDQUFjLE1BQWQsQ0FBcUIsVUFBckI7QUFBcEQ7QUFEYTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUViLFdBQUssYUFBTCxpQkFBNEIsTUFBNUIsR0FBc0MsU0FBdEMsQ0FBZ0QsR0FBaEQsQ0FBb0QsVUFBcEQ7QUFDSDs7O1dBRUQsaUJBQVEsS0FBUixFQUFlLElBQWYsRUFBb0I7QUFDaEIsV0FBSyxhQUFMLG9DQUE4QyxLQUE5QyxVQUF5RCxJQUF6RCxHQUFnRSxJQUFoRTtBQUNIOzs7V0FFRCxvQkFBVyxLQUFYLEVBQWtCLEtBQWxCLEVBQXdCO0FBQ3BCLFdBQUssYUFBTCxrQ0FBNEMsS0FBNUMsVUFBdUQsT0FBdkQsR0FBaUUsS0FBakU7QUFDSDs7O0VBakU0QixhOztBQW9FakMsTUFBTSxDQUFDLGNBQVAsQ0FBc0IsTUFBdEIsQ0FBNkIsc0JBQTdCLEVBQXFELGtCQUFyRDtBQUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGtCQUFqQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5RkEsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLG1CQUFELENBQVAsQ0FBNkIsYUFBbkQ7O0lBRU0sVTs7Ozs7QUFDRixzQkFBWSxJQUFaLEVBQWtCO0FBQUE7QUFBQSw2QkFDUixhQURRLEVBRVY7QUFBQyxNQUFBLE1BQU0sRUFBRztBQUFDLFFBQUEsSUFBSSxFQUFHO0FBQVI7QUFBVixLQUZVO0FBSWpCOzs7a0RBTHFCLFc7O0lBUXBCLFU7Ozs7O0FBQ0Ysd0JBQWM7QUFBQTtBQUFBLDhCQUNKLGNBREk7QUFFYjs7O2tEQUhxQixXOztJQU1wQixhOzs7OztBQUNGLDJCQUFjO0FBQUE7QUFBQSw4QkFDSixpQkFESTtBQUViOzs7a0RBSHdCLFc7O0lBTXZCLFc7Ozs7O0FBQ0YseUJBQWM7QUFBQTtBQUFBLDhCQUNKLGVBREk7QUFFYjs7O2tEQUhzQixXOztJQU1yQixZOzs7Ozs7Ozs7Ozs7O2lHQUVGO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBR0kscUJBQUssYUFBTCxDQUFtQixhQUFuQixFQUFrQyxnQkFBbEMsQ0FBbUQsT0FBbkQsRUFBNEQsWUFBSTtBQUM1RCxrQkFBQSxLQUFJLENBQUMsYUFBTCxDQUFtQixJQUFJLFVBQUosRUFBbkI7QUFDSCxpQkFGRDtBQUlBLHFCQUFLLGFBQUwsQ0FBbUIsZ0JBQW5CLEVBQXFDLGdCQUFyQyxDQUFzRCxPQUF0RCxFQUErRCxZQUFJO0FBQy9ELGtCQUFBLEtBQUksQ0FBQyxhQUFMLENBQW1CLElBQUksYUFBSixFQUFuQjtBQUNILGlCQUZEO0FBSUEscUJBQUssYUFBTCxDQUFtQixjQUFuQixFQUFtQyxnQkFBbkMsQ0FBb0QsT0FBcEQsRUFBNkQsWUFBSTtBQUM3RCxrQkFBQSxLQUFJLENBQUMsYUFBTCxDQUFtQixJQUFJLFdBQUosRUFBbkI7QUFDSCxpQkFGRDtBQUlBLHFCQUFLLGdCQUFMLENBQXNCLE9BQXRCLEVBQStCO0FBQUEseUJBQUksS0FBSSxDQUFDLGFBQUwsQ0FBbUIsZ0JBQW5CLEVBQXFDLEtBQXJDLEVBQUo7QUFBQSxpQkFBL0I7QUFFQSxxQkFBSyxhQUFMLENBQW1CLGdCQUFuQixFQUFxQyxnQkFBckMsQ0FBc0QsTUFBdEQsNkZBQThEO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN0RCwwQkFBQSxJQURzRCxHQUMvQyxLQUFJLENBQUMsYUFBTCxDQUFtQixnQkFBbkIsRUFBcUMsSUFEVTs7QUFFMUQsMEJBQUEsS0FBSSxDQUFDLGFBQUwsQ0FBbUIsSUFBSSxVQUFKLENBQWUsSUFBSSxDQUFDLElBQUwsRUFBZixDQUFuQjs7QUFGMEQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUJBQTlEOztBQWpCSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxPOzs7Ozs7Ozs7O1dBdUJBLGlCQUFPO0FBQ0gsV0FBSyxhQUFMLENBQW1CLGdCQUFuQixFQUFxQyxJQUFyQyxHQUE0QyxFQUE1QztBQUNIOzs7V0FFRCxpQkFBUSxJQUFSLEVBQWE7QUFDVCxXQUFLLGFBQUwsQ0FBbUIsZ0JBQW5CLEVBQXFDLElBQXJDLEdBQTRDLElBQTVDO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7Ozs7V0FDSSxtQkFBVSxNQUFWLEVBQWlCO0FBQUEsaURBQ0csS0FBSyxnQkFBTCxhQURIO0FBQUE7O0FBQUE7QUFDYjtBQUFBLGNBQVMsR0FBVDtBQUFvRCxVQUFBLEdBQUcsQ0FBQyxTQUFKLENBQWMsTUFBZCxDQUFxQixVQUFyQjtBQUFwRDtBQURhO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBRWIsV0FBSyxhQUFMLGlCQUE0QixNQUE1QixHQUFzQyxTQUF0QyxDQUFnRCxHQUFoRCxDQUFvRCxVQUFwRDtBQUNIOzs7U0FFRCxhQUFnQixLQUFoQixFQUFzQjtBQUNsQixVQUFJLEtBQUosRUFBVTtBQUNOLGFBQUssYUFBTCxDQUFtQixhQUFuQixFQUFrQyxJQUFsQztBQUNILE9BRkQsTUFFSztBQUNELGFBQUssYUFBTCxDQUFtQixhQUFuQixFQUFrQyxJQUFsQztBQUNIO0FBQ0o7OztFQS9Dc0IsYTs7QUFrRDNCLE1BQU0sQ0FBQyxjQUFQLENBQXNCLE1BQXRCLENBQTZCLGVBQTdCLEVBQThDLFlBQTlDO0FBQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsWUFBakI7Ozs7O0FDOUVBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQ2I7QUFDQSxFQUFBLFlBQVksRUFBRyx5Q0FGRjtBQUliO0FBQ0EsRUFBQSxRQUFRLEVBQUcsMEVBTEU7QUFPYjtBQUNBLEVBQUEsS0FBSyxFQUFHLGNBUks7QUFVYjtBQUNBLEVBQUEsYUFBYSxFQUFHLENBQUMsNERBQUQsQ0FYSDtBQWFiO0FBQ0EsRUFBQSxLQUFLLEVBQUU7QUFkTSxDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcclxuY2xhc3MgQWJzdHJhY3RNb2RlbCB7XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIG5ldyBhYnN0cmFjdCBtb2RlbC4gIElmIGRlbGVnYXRlIGlzIHByb3ZpZGVkIHRoZW4gYWxsIGxpc3RlbmVyXHJcbiAgICAgKiBhZGRzIGFuZCBub3RpZmllcyBhcmUgcGVyZm9ybWVkIG9uIHRoZSBkZWxlZ2F0ZSBsaXN0ZW5lciBjb2xsZWN0aW9uLlxyXG4gICAgICogQHBhcmFtIHt0eXBlfSBkZWxlZ2F0ZVxyXG4gICAgICogQHJldHVybnMge25tJF9BYnN0cmFjdE1vZGVsLkFic3RyYWN0TW9kZWx9XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuYWJzdHJhY3RNb2RlbExpc3RlbmVycyA9IFtdOyAgICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGVsZWdhdGUoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5kZWxlZ2F0ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0RGVsZWdhdGUoZGVsZWdhdGUgPSBudWxsKXtcclxuICAgICAgICBpZiAoZGVsZWdhdGUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHRoaXM7XHJcbiAgICAgICAgICAgIHRoaXMuYWJzdHJhY3RNb2RlbExpc3RlbmVycyA9IFtdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUgPSBkZWxlZ2F0ZS5kZWxlZ2F0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuZGVsZWdhdGUgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInVuZGVmaW5lZCBkZWxlZ2F0ZVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGFkZExpc3RlbmVyKGxpc3RlbmVyKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gXCJvYmplY3RcIil7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgQWJzdHJhY3RNb2RlbCBsaXN0ZW5lciB0eXBlOiBcIiArIHR5cGVvZiBsaXN0ZW5lcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUuYWJzdHJhY3RNb2RlbExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGwgYXMgbm90aWZ5TGlzdGVuZXJzKG1ldGhvZE5hbWUsIFttZXRob2RBcmd1bWVudDAsIC4uLiBtZXRob2RBcmd1bWVudE5dKVxyXG4gICAgICogQHBhcmFtIHt0eXBlfSBtZXRob2RcclxuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIG5vdGlmeUxpc3RlbmVycyhtZXRob2QpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkVWRU5UIFwiICsgdGhpcy5kZWxlZ2F0ZS5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgKyBtZXRob2QpO1xyXG5cclxuICAgICAgICBBcnJheS5wcm90b3R5cGUuc2hpZnQuYXBwbHkoYXJndW1lbnRzKTtcclxuICAgICAgICBsZXQgZXZlbnQgPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogbWV0aG9kLFxyXG4gICAgICAgICAgICBhcmdzOiBhcmd1bWVudHMsXHJcbiAgICAgICAgICAgIHNvdXJjZTogdGhpcyxcclxuICAgICAgICAgICAgbGlzdGVuZXJzOiBbXVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2luZG93Lmxhc3RFdmVudCA9IGV2ZW50O1xyXG4gICAgICAgIHdpbmRvdy5uRXZlbnRzLnB1c2god2luZG93Lmxhc3RFdmVudCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGxpc3RlbmVyIG9mIHRoaXMuZGVsZWdhdGUuYWJzdHJhY3RNb2RlbExpc3RlbmVycykge1xyXG4gICAgICAgICAgICBpZiAobGlzdGVuZXJbbWV0aG9kXSl7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIiArIFwiICsgbGlzdGVuZXIuY29uc3RydWN0b3IubmFtZSArIFwiIFwiICsgbWV0aG9kKTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5sYXN0RXZlbnQubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIuY29uc3RydWN0b3IubmFtZSk7ICAgICAgIFxyXG4gICAgICAgICAgICAgICAgYXdhaXQgbGlzdGVuZXJbbWV0aG9kXS5hcHBseShsaXN0ZW5lciwgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobGlzdGVuZXJbQWJzdHJhY3RNb2RlbC5kZWZhdWx0TGlzdGVuZXJdKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiICsgXCIgKyBsaXN0ZW5lci5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgKyBBYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lcik7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cubGFzdEV2ZW50Lmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUpOyAgICAgICBcclxuICAgICAgICAgICAgICAgIGF3YWl0IGxpc3RlbmVyW0Fic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyXS5hcHBseShsaXN0ZW5lciwgd2luZG93Lmxhc3RFdmVudCk7ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5BYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lciA9IFwibmlkZ2V0TGlzdGVuZXJcIjtcclxud2luZG93Lm5FdmVudHMgPSBbXTtcclxubW9kdWxlLmV4cG9ydHMgPSBBYnN0cmFjdE1vZGVsOyIsIid1c2Ugc3RyaWN0JztcclxuLyoqXHJcbiAqIFNpbmdsZXRvbiBjbGFzcyB0byBwcm92aWRpbmcgZnVuY3Rpb25hbGl0eSB0byBEcmFnTmlkZ2V0cyBhbmQgRHJvcE5pZGdldHMuXHJcbiAqIEl0IHN0b3JlcyB0aGUgTmlkZ2V0IGN1cnJlbnRseSBiZWluZyBkcmFnZ2VkLlxyXG4gKi9cclxuY2xhc3MgRHJhZ0hhbmRsZXJ7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcclxuICAgICAgICB0aGlzLm92ZXIgPSBbXTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVzaE92ZXIobmlkZ2V0KXtcclxuICAgICAgICBpZiAodGhpcy5vdmVySGFzKG5pZGdldCkpIHJldHVybiBmYWxzZTtcclxuICAgICAgICB0aGlzLm92ZXIucHVzaChuaWRnZXQpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZW1vdmVPdmVyKG5pZGdldCl7XHJcbiAgICAgICAgaWYgKCF0aGlzLm92ZXJIYXMobmlkZ2V0KSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHRoaXMub3Zlci5zcGxpY2UodGhpcy5vdmVyLmluZGV4T2YobmlkZ2V0KSwgMSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9ICAgIFxyXG4gICAgXHJcbiAgICBvdmVySGFzKG5pZGdldCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3Zlci5pbmRleE9mKG5pZGdldCkgIT09IC0xO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXQobmlkZ2V0KXtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBuaWRnZXQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQ7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGhhcygpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnQgIT09IG51bGw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsZWFyKCl7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3RhdGljIGdldEluc3RhbmNlKCl7XHJcbiAgICAgICAgcmV0dXJuIERyYWdIYW5kbGVyLmluc3RhbmNlO1xyXG4gICAgfSAgICBcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRHJhZ0hhbmRsZXIoKTtcclxuXHJcbiIsIid1c2Ugc3RyaWN0JztcclxuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuL05pZGdldEVsZW1lbnRcIik7XHJcblxyXG4vKiBnbG9iYWwgVXRpbGl0eSAqL1xyXG5jbGFzcyBGaWxlT3BlcmF0aW9ucyB7XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIGEgZmlsZSAodXJsKS4gIE1hcCB2YXJpYWJsZXMgKCR7Li4ufSkgdG8gXHJcbiAgICAgKiBhIHZhbHVlLlxyXG4gICAgICogQHBhcmFtIHt0eXBlfSB1cmxcclxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXHJcbiAgICAgKiBAcmV0dXJucyB7bm9kZXxGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudC5kb21FbGVtZW50fVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgbG9hZE5pZGdldCh1cmwsIG1hcCl7ICAgICAgICBcclxuICAgICAgICBsZXQgZWxlbWVudCA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50KHVybCwgbWFwKTtcclxuICAgICAgICByZXR1cm4gbmV3IE5pZGdldEVsZW1lbnQoZWxlbWVudCk7XHJcbiAgICB9ICAgIFxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIGEgZmlsZSAodXJsKS4gIE1hcCB2YXJpYWJsZXMgKCR7Li4ufSkgdG8gXHJcbiAgICAgKiBhIHZhbHVlLlxyXG4gICAgICogQHBhcmFtIHt0eXBlfSB1cmxcclxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXHJcbiAgICAgKiBAcmV0dXJucyB7bm9kZXxGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudC5kb21FbGVtZW50fVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgbG9hZERPTUVsZW1lbnQodXJsLCBtYXAgPSBuZXcgTWFwKCkpeyAgICAgICAgXHJcbiAgICAgICAgaWYgKG1hcCBpbnN0YW5jZW9mIE1hcCA9PT0gZmFsc2UpIG1hcCA9IEZpbGVPcGVyYXRpb25zLm9iamVjdFRvTWFwKG1hcCk7ICAgICAgIFxyXG4gICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0VVJMKHVybCk7XHJcbiAgICAgICAgcmV0dXJuIEZpbGVPcGVyYXRpb25zLnN0cmluZ1RvRE9NRWxlbWVudCh0ZXh0LCBtYXApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGRvbSBlbGVtZW50IGZyb20gdGV4dC5cclxuICAgICAqIEBwYXJhbSB7dHlwZX0gdGV4dFxyXG4gICAgICogQHBhcmFtIHt0eXBlfSBtYXBcclxuICAgICAqIEByZXR1cm5zIHtub2RlfEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50LmRvbUVsZW1lbnR9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBzdHJpbmdUb0RPTUVsZW1lbnQodGV4dCwgbWFwID0gbmV3IE1hcCgpKXtcclxuICAgICAgICAvKiByZXBsYWNlIHZhcmlhYmxlcyB3aXRoIHZhbHVlcyAqL1xyXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBtYXAua2V5cygpKXsgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgbGV0IHZhbHVlID0gbWFwLmdldChrZXkpO1xyXG4gICAgICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGBbJF1be10/JHtrZXl9W31dYCwgYGdgKTtcclxuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgdmFsdWUpOyAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qIHJlcGxhY2UgdW5maWxsZWQgdmFyaWFibGVzIHdpdGggZW1wdHkgKi9cclxuICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGBbJF1be11bXn1dKlt9XWAsIGBnYCk7XHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgXCJcIik7IFxyXG5cclxuICAgICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gdGV4dDtcclxuICAgICAgICBsZXQgZG9tRWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgY29uc29sZS5sb2coZWxlbWVudCk7XHJcblxyXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBvYmplY3RUb01hcChvYmplY3Qpe1xyXG4gICAgICAgIGxldCBtYXAgPSBuZXcgTWFwKCk7XHJcbiAgICAgICAgZm9yIChsZXQgZmllbGQgaW4gb2JqZWN0KXsgICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmplY3RbZmllbGRdID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiBvYmplY3RbZmllbGRdID09PSBcIm51bWJlclwiKXtcclxuICAgICAgICAgICAgICAgIG1hcC5zZXQoZmllbGQsIG9iamVjdFtmaWVsZF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXA7XHJcbiAgICB9XHJcblxyXG4gICAgXHJcblxyXG4gICAgLypcclxuICAgICAqIFRyYW5zZmVyIGNvbnRlbnRzIG9mICdmaWxlbmFtZScgZnJvbSBzZXJ2ZXIgdG8gY2xpZW50LlxyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdWNjZXNzQ2FsbGJhY2tcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGVycm9yQ2FsbGJhY2tcclxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IGNvbnRlbnRzIG9mIGZpbGVcclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldFVSTCh1cmwpIHtcclxuICAgICAgICBsZXQgY2FsbGJhY2sgPSBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgIHZhciB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG5cclxuICAgICAgICAgICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHhodHRwLnJlYWR5U3RhdGUgPT09IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoeGh0dHAuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh4aHR0cC5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4aHR0cCA6IHhodHRwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzIDogeGh0dHAuc3RhdHVzLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgOiB4aHR0cC5yZXNwb25zZVRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmwgOiB1cmxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xyXG4gICAgICAgICAgICB4aHR0cC5zZW5kKG51bGwpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShjYWxsYmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSB0ZXh0LlxyXG4gICAgICogQHBhcmFtIHt0eXBlfSB0ZXh0XHJcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1hcFxyXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGFzeW5jIGdldEZpbGUodXJsLCBtYXAgPSBuZXcgTWFwKCkpe1xyXG4gICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0VVJMKHVybCk7XHJcblxyXG4gICAgICAgIC8qIHJlcGxhY2UgdmFyaWFibGVzIHdpdGggdmFsdWVzICovXHJcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIG1hcC5rZXlzKCkpe1xyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBtYXAuZ2V0KGtleSk7XHJcbiAgICAgICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XT8ke2tleX1bfV1gLCBgZ2ApO1xyXG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiByZXBsYWNlIHVuZmlsbGVkIHZhcmlhYmxlcyB3aXRoIGVtcHR5ICovXHJcbiAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdW159XSpbfV1gLCBgZ2ApO1xyXG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsIFwiXCIpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGV4dDtcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG4gICAgICogVHJhbnNmZXIgY29udGVudHMgb2YgJ2ZpbGVuYW1lJyBmcm9tIHNlcnZlciB0byBjbGllbnQgdXNpbmcgY3VycmVudCB3aW5kb3cgbG9jYXRpb24uXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHN1Y2Nlc3NDYWxsYmFja1xyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZXJyb3JDYWxsYmFja1xyXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIGdldExvY2FsKGZpbGVuYW1lKSB7XHJcbiAgICAgICAgbGV0IGNhbGxiYWNrID0gZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgICAgICB2YXIgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcclxuICAgICAgICAgICAgdmFyIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmICsgXCIvXCIgKyBmaWxlbmFtZTtcclxuXHJcbiAgICAgICAgICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICh4aHR0cC5yZWFkeVN0YXRlID09PSA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeGh0dHAucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoeGh0dHAuc3RhdHVzLCB4aHR0cC5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHhodHRwLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcclxuICAgICAgICAgICAgeGh0dHAuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGNhbGxiYWNrKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgLyoqXHJcbiAgICAgKiBDYXVzZSAndGV4dCcgdG8gYmUgc2F2ZWQgYXMgJ2ZpbGVuYW1lJyBjbGllbnQgc2lkZS5cclxuICAgICAqIEBwYXJhbSB7dHlwZX0gZmlsZW5hbWUgVGhlIGRlZmF1bHQgZmlsZW5hbWUgdG8gc2F2ZSB0aGUgdGV4dCBhcy5cclxuICAgICAqIEBwYXJhbSB7dHlwZX0gdGV4dCBUaGUgdGV4dCB0byBzYXZlIHRvIGZpbGVuYW1lLlxyXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHNhdmVUb0ZpbGUodGV4dCwgZmlsZW5hbWUpIHtcclxuICAgICAgICBsZXQgYW5jaG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gICAgICAgIGxldCBkYXRhID0gXCJ0ZXh0O2NoYXJzZXQ9dXRmLTgsXCIgKyBlbmNvZGVVUklDb21wb25lbnQodGV4dCk7XHJcbiAgICAgICAgYW5jaG9yLnNldEF0dHJpYnV0ZShcImhyZWZcIiwgXCJkYXRhOlwiICsgZGF0YSk7XHJcbiAgICAgICAgYW5jaG9yLnNldEF0dHJpYnV0ZShcImRvd25sb2FkXCIsIGZpbGVuYW1lKTtcclxuICAgICAgICBhbmNob3IuY2xpY2soKTtcclxuICAgIH1cclxufVxyXG5cclxuRmlsZU9wZXJhdGlvbnMuTm9kZVR5cGUgPSB7XHJcbiAgICBFTEVNRU5UIDogMSxcclxuICAgIEFUVFJJQlVURSA6IDIsXHJcbiAgICBURVhUIDogMywgXHJcbiAgICBDREFUQVNFQ1RJT04gOiA0LFxyXG4gICAgRU5USVRZUkVGRVJOQ0UgOiA1LFxyXG4gICAgRU5USVRZIDogNixcclxuICAgIFBST0NFU1NJTkdJTlNUUlVDVElPTiA6IDcsXHJcbiAgICBDT01NRU5UIDogOCxcclxuICAgIERPQ1VNRU5UIDogOSxcclxuICAgIERPQ1VNRU5UVFlQRSA6IDEwLFxyXG4gICAgRE9DVU1FTlRGUkFHTUVOVCA6IDExLFxyXG4gICAgTk9UQVRJT04gOiAxMlxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBGaWxlT3BlcmF0aW9uczsiLCIndXNlIHN0cmljdCc7XHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgbW91c2UgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9Nb3VzZVwiKSwgXHJcbiAgICBkcmFnIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvRHJhZ1wiKSxcclxuICAgIGRyb3AgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9Ecm9wXCIpLFxyXG4gICAgbW92YWJsZSA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL01vdmFibGVcIiksXHJcbiAgICByZXNpemUgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9SZXNpemVcIilcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKlxyXG4gKiBTaW5nbHRvbiBjbGFzcyB0byBhZGQgZnVuY3Rpb25hbGl0eSB0byB0aGUgbW91c2UuXHJcbiAqL1xyXG5jbGFzcyBNb3VzZVV0aWxpdGllcyB7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKCl7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubGFzdFggPSAwO1xyXG4gICAgICAgIHRoaXMubGFzdFkgPSAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpc1VuZGVyKGV2ZW50LCBlbGVtZW50KSB7XHJcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYO1xyXG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WTtcclxuICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XHJcblxyXG4gICAgICAgIHdoaWxlIChjdXJyZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50ID09PSBlbGVtZW50KSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFVuZGVyKGV2ZW50KSB7XHJcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYO1xyXG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WTtcclxuICAgICAgICByZXR1cm4gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgZWxlbWVudChlbGVtZW50KXtcclxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZEVsZW1lbnQgIT09IG51bGwpe1xyXG4gICAgICAgICAgICB0aGlzLmRldGFjaEVsZW1lbnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFlbGVtZW50IHx8IGVsZW1lbnQgPT09IG51bGwgfHwgZWxlbWVudCA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhpcy5kZXRhY2hFbGVtZW50KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5hdHRhY2hFbGVtZW50KGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IGVsZW1lbnQoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5hdHRhY2hlZEVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2ggYW4gZWxlbWVudC4gIElmIHRoZSBlbGVtZW50IGRvZXNuJ3QgaGF2ZSBhIHBhcmVudCBpdCB3aWxsIGJlXHJcbiAgICAgKiBhdHRhY2hlZCB0byB0aGUgZG9jdW1lbnQgYW5kIHdpbGwgYmUgZGV0YWNoZWQgd2hlbiBkZXRhY2hFbGVtZW50IGlzIGNhbGxlZC5cclxuICAgICAqIEBwYXJhbSB7dHlwZX0gZWxlbWVudFxyXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cclxuICAgICAqL1xyXG4gICAgYXR0YWNoRWxlbWVudChlbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChlbGVtZW50LnBhcmVudCl7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbiBub3QgYXR0YWNoIGVsZW1lbnQgdG8gbW91c2UgaWYgdGhlIGVsZW1lbnQgaGFzIGEgcGFyZW50IGVsZW1lbnQuXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKGVsZW1lbnQpO1xyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7IFxyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUudG9wID0gZXZlbnQuY2xpZW50WSArIFwicHhcIjtcclxuICAgICAgICBlbGVtZW50LnN0eWxlLmxlZnQgPSBldmVudC5jbGllbnRYICsgXCJweFwiO1xyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9IFwibm9uZVwiO1xyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gXCIxMDAwMFwiO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubW92ZUNhbGxCYWNrID0gKGV2ZW50KT0+dGhpcy5vbk1vdXNlTW92ZShldmVudCk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3ZlQ2FsbEJhY2spO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIGxpc3RlbmVycyBmcm9tIHRoZSBhdHRhY2hlZCBlbGVtZW50LCBkbyBub3QgcmVtb3ZlIGl0IGZyb20gdGhlXHJcbiAgICAgKiBkb2N1bWVudC5cclxuICAgICAqIEByZXR1cm5zIHt0eXBlfVxyXG4gICAgICovXHJcbiAgICBkZXRhY2hFbGVtZW50KCl7XHJcbiAgICAgICAgaWYgKHRoaXMuYXR0YWNoZWRFbGVtZW50ID09PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgXHJcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3ZlQ2FsbEJhY2spOyAgICAgICAgXHJcbiAgICAgICAgbGV0IHJ2YWx1ZSA9IHRoaXMuYXR0YWNoZWRFbGVtZW50O1xyXG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50ID0gbnVsbDsgICAgICAgIFxyXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQocnZhbHVlKTtcclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gcnZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIG9uTW91c2VNb3ZlKGV2ZW50KSB7ICAgICAgICBcclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHRoaXMubGFzdFggPSBldmVudC5jbGllbnRYO1xyXG4gICAgICAgIHRoaXMubGFzdFkgPSBldmVudC5jbGllbnRZO1xyXG5cclxuICAgICAgICAvLyBzZXQgdGhlIGVsZW1lbnQncyBuZXcgcG9zaXRpb246XHJcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQuc3R5bGUudG9wID0gZXZlbnQuY2xpZW50WSArIFwicHhcIjtcclxuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudC5zdHlsZS5sZWZ0ID0gZXZlbnQuY2xpZW50WCArIFwicHhcIjtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBuZXcgTW91c2VVdGlsaXRpZXMoKTsiLCIndXNlIHN0cmljdCc7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIHByZWZpeDogXCJkYXRhLW5pZGdldFwiLFxyXG4gICAgZWxlbWVudEF0dHJpYnV0ZTogXCJkYXRhLW5pZGdldC1lbGVtZW50XCIsXHJcbiAgICBzcmNBdHRyaWJ1dGU6IFwic3JjXCIsXHJcbiAgICB0ZW1wbGF0ZVNyY0F0dHJpYnV0ZTogXCJ0ZW1wbGF0ZS1zcmNcIixcclxuICAgIG5hbWVBdHRyaWJ1dGU6IFwibmFtZVwiLFxyXG4gICAgaW50ZXJmYWNlQXR0cmlidXRlOiBcImludGVyZmFjZXNcIixcclxuICAgIHRlbXBsYXRlQXR0cmlidXRlOiBcInRlbXBsYXRlLWlkXCIsXHJcbiAgICBpbnRlcmZhY2VEYXRhRmllbGQ6IFwiaW50ZXJmYWNlRGF0YVwiLFxyXG4gICAgbW9kZWxEYXRhRmllbGQ6IFwibW9kZWxEYXRhXCIsXHJcbiAgICBzdHlsZUF0dHJpYnV0ZTogXCJuaWRnZXQtc3R5bGVcIlxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBGaWxlT3BlcmF0aW9ucyA9IHJlcXVpcmUoXCIuL0ZpbGVPcGVyYXRpb25zXCIpO1xyXG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi9OaWRnZXRcIik7XHJcbmNvbnN0IEludGVyZmFjZXMgPSByZXF1aXJlKFwiLi9JbnRlcmZhY2VzXCIpO1xyXG5jb25zdCBUcmFuc2Zvcm1lciA9IHJlcXVpcmUoXCIuL1RyYW5zZm9ybWVyXCIpO1xyXG5jb25zdCBOaWRnZXRTdHlsZSA9IHJlcXVpcmUoXCIuL05pZGdldFN0eWxlXCIpO1xyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZSB0aGUgdzpoIGFzcGVjdCByYXRpbyBhbmQgYWRqdXN0IHRoZSBwcm9wb3J0aW9ucyBhY2NvcmRpbmdseS5cclxuICpcclxuICovXHJcbmNsYXNzIEFzcGVjdFJhdGlve1xyXG4gICAgY29uc3RydWN0b3IobmlkZ2V0KSB7XHJcbiAgICAgICAgdGhpcy5uaWRnZXQgPSBuaWRnZXQ7XHJcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKT0+dGhpcy5vblJlc2l6ZSgpKTtcclxuICAgICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUodGhpcy5uaWRnZXQpO1xyXG4gICAgICAgIHRoaXMucGFyc2VWYWx1ZXMoKTtcclxuICAgICAgICB0aGlzLm9uUmVzaXplKCk7XHJcbiAgICAgICAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRWYWx1ZSgpe1xyXG4gICAgICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKEFzcGVjdFJhdGlvLkNTU19BVFRSSUJVVEUpO1xyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVmFsdWVzKCl7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xyXG4gICAgICAgIGxldCBzcGxpdCA9IHZhbHVlLnNwbGl0KC9bICw7XS9nKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgcyBvZiBzcGxpdCl7XHJcbiAgICAgICAgICAgIGlmIChzLnNwbGl0KC9bLTpdLykubGVuZ3RoID09PSAyKXtcclxuICAgICAgICAgICAgICAgIGxldCByYXRpbyA9IHMuc3BsaXQoL1stOl0vKTtcclxuICAgICAgICAgICAgICAgIHRoaXMud2lkdGggPSBwYXJzZUludChyYXRpb1swXSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhlaWdodCA9IHBhcnNlSW50KHJhdGlvWzFdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChzID09PSBcImhcIil7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uUmVzaXplID0gKCk9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMubmlkZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS53aWR0aCA9IChoZWlnaHQgKiB0aGlzLndpZHRoIC8gdGhpcy5oZWlnaHQpICsgXCJweFwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25SZXNpemUoKXtcclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLm5pZGdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5oZWlnaHQgPSAod2lkdGggKiB0aGlzLmhlaWdodCAvIHRoaXMud2lkdGgpICsgXCJweFwiO1xyXG4gICAgfVxyXG59XHJcblxyXG5Bc3BlY3RSYXRpby5DU1NfQVRUUklCVVRFID0gXCItLW5pZGdldC1hc3BlY3QtcmF0aW9cIjtcclxuXHJcbi8qKlxyXG4gKiBBIE5pZGdldEVsZW1lbnQgaXMgYSAxOjEgY2xhc3Mtb2JqZWN0OmRvbS1vYmplY3QgcGFpcmluZy4gIEFjdGlvbnMgb24gdGhlIERPTSBcclxuICogb2JqZWN0IHNob3VsZCBvbmx5IGJlIGNhbGxlZCBieSB0aGUgTmlkZ2V0RWxlbWVudCBvYmplY3QuICBUaGUgaW50ZXJmYWNlRGF0YVxyXG4gKiBmaWVsZCBpcyByZXNlcnZlZCBmb3IgZGF0YSBmcm9tIGludGVyZmFjZXMuICBJbnRlcmZhY2VzIHNob3VsZCBwdXQgdGhlaXIgXHJcbiAqIGN1c3RvbSBkYXRhIHVuZGVyIFtpbnRlcmZhY2VEYXRhRmllbGRdLltpbnRlcmZhY2VOYW1lXS4gIFRoZSBpbnRlcmZhY2UgZGF0YVxyXG4gKiBhdHRyaWJ1dGUgaXMgc2V0IHdpdGggdGhlIHN0YXRpYyB2YWx1ZSBOaWRnZXQuaW50ZXJmYWNlRGF0YUZpZWxkLlxyXG4gKiBcclxuICogQ2FsbGluZyBtZXRob2RzIG9uIHRoZSBuaWRnZXQgd2lsbCB0cmVhdCBzaGFkb3cgY29udGVudHMgYXMgcmVndWxhciBjb250ZW50cy5cclxuICovXHJcbmNsYXNzIE5pZGdldEVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIG5ldyBOaWRnZXQgYXNzb2NpYXRlZCB3aXRoICdlbGVtZW50Jy4gIEFuIGVycm9yIHdpbGwgYmUgdGhyb3duXHJcbiAgICAgKiBpZiB0aGUgJ2VsZW1lbnQnIGlzIGFscmVhZHkgYXNzb2NpYXRlZCB3aXRoIGEgTmlkZ2V0LlxyXG4gICAgICogXHJcbiAgICAgKiBEaXNhYmxlZCBjbGFzcyBpbmRpY2F0ZXMgdGhpcyBuaWRnZXQgd2lsbCBpZ25vcmUgbW91c2UgZXZlbnRzLlxyXG4gICAgICogXHJcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGVsZW1lbnQgSlF1ZXJ5IHNlbGVjdG9yXHJcbiAgICAgKiBAcmV0dXJuIHtubSRfTmlkZ2V0Lk5pZGdldEVsZW1lbnR9XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHRlbXBsYXRlSWQpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXNbTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZF0gPSB7fTtcclxuICAgICAgICB0aGlzW05pZGdldC5tb2RlbERhdGFGaWVsZF0gPSB7fTtcclxuICAgICAgICB0aGlzLnRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybWVyKHRoaXMpO1xyXG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzID0ge307XHJcblxyXG4gICAgICAgIGlmICh0ZW1wbGF0ZUlkKXtcclxuICAgICAgICAgICAgdGhpcy5hcHBseVRlbXBsYXRlKHRlbXBsYXRlSWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjayBpcyBpbnZva2VkIGVhY2ggdGltZSB0aGUgY3VzdG9tIGVsZW1lbnQgaXMgYXBwZW5kZWQgaW50byBhIGRvY3VtZW50LWNvbm5lY3RlZCBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGNvbm5lY3RlZENhbGxiYWNrKCkge1xyXG4gICAgICAgIHRoaXMuc2hhZG93Q29udGVudHMgPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoTmlkZ2V0LnRlbXBsYXRlQXR0cmlidXRlKSl7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuYXBwbHlUZW1wbGF0ZSh0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXQudGVtcGxhdGVBdHRyaWJ1dGUpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubm90aWZ5U3R5bGVzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRyaWV2ZSBhIG1hcCBvZiBhbGwgZGF0YSBhdHRyaWJ1dGVzXHJcbiAgICAgKiBAcmV0dXJucyB7TWFwPGFueSwgYW55Pn1cclxuICAgICAqL1xyXG4gICAgZGF0YUF0dHJpYnV0ZXMoKSB7XHJcbiAgICAgICAgbGV0IG1hcCA9IG5ldyBNYXAoKTtcclxuICAgICAgICBmb3IgKGxldCBhdHRyIG9mIHRoaXMuYXR0cmlidXRlcykge1xyXG4gICAgICAgICAgICBpZiAoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoXCJkYXRhLVwiKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBhdHRyLm5hbWUuc3Vic3RyKDUpO1xyXG4gICAgICAgICAgICAgICAgbWFwW25hbWVdID0gYXR0ci52YWx1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWFwO1xyXG4gICAgfVxyXG5cclxuICAgIG5vdGlmeVN0eWxlcygpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFyID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5nZXRQcm9wZXJ0eVZhbHVlKEFzcGVjdFJhdGlvLkNTU19BVFRSSUJVVEUpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGFyICE9PSBcIlwiKSBuZXcgQXNwZWN0UmF0aW8odGhpcyk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgICAgIH0sIDEwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2ggYSBzaGFkb3cgZWxlbWVudCB3aXRoIHRoZSBjb250ZW50cyBvZiB0aGUgdGVtcGxhdGUgbmFtZWQgKHRlbXBsYXRlSUQpLlxyXG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxyXG4gICAgICovXHJcbiAgICBhc3luYyBhcHBseVRlbXBsYXRlKHRlbXBsYXRlSWQpIHtcclxuICAgICAgICBpZiAodGhpcy5zaGFkb3dSb290ICE9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGVtcGxhdGVJZCk7XHJcblxyXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHRocm93IG5ldyBFcnJvcihcIlRlbXBsYXRlICdcIiArIHRlbXBsYXRlSWQgKyBcIicgbm90IGZvdW5kLlwiKTtcclxuICAgICAgICBpZiAodGVtcGxhdGUudGFnTmFtZS50b1VwcGVyQ2FzZSgpICE9PSBcIlRFTVBMQVRFXCIpIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgd2l0aCBpZCAnXCIgKyB0ZW1wbGF0ZUlkICsgXCInIGlzIG5vdCBhIHRlbXBsYXRlLlwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6ICdvcGVuJ30pLmFwcGVuZENoaWxkKHRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpKTtcclxuICAgICAgICBhd2FpdCB0aGlzLnJlYWR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVhZHkoKXtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2FkIGNvbnRlbnRzIG9mIGZpbGUgaW50byB0aGlzIGVsZW1lbnQuXHJcbiAgICAgKiBSZXBsYWNlIGFsbCAke30gdmFyaWFibGVzIHdpdGggY29udGVudHMgb2YgJ21hcCcuXHJcbiAgICAgKi9cclxuICAgIGFzeW5jIHJldHJpZXZlU291cmNlKG1hcCl7XHJcbiAgICAgICAgbGV0IHNyYyA9IHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldC5zcmNBdHRyaWJ1dGUpO1xyXG4gICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0RmlsZShzcmMsIG1hcCk7XHJcbiAgICAgICAgdGhpcy5pbm5lckhUTUwgPSB0ZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBsb2FkVGVtcGxhdGVTbmlwcGV0KGZpbGVuYW1lLCB0YWduYW1lKXtcclxuICAgICAgICBsZXQgaWQgPSBmaWxlbmFtZS5yZXBsYWNlKC9bXFwvLyAuLV0rL2csIFwiX1wiKTtcclxuXHJcbiAgICAgICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtpZH1gKSl7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0RmlsZShmaWxlbmFtZSk7XHJcbiAgICAgICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZW1wbGF0ZVwiKTtcclxuICAgICAgICAgICAgdGVtcGxhdGUuaW5uZXJIVE1MID0gdGV4dDtcclxuICAgICAgICAgICAgdGVtcGxhdGUuc2V0QXR0cmlidXRlKFwiaWRcIiwgaWQpO1xyXG4gICAgICAgICAgICBpZiAodGFnbmFtZSkgdGVtcGxhdGUuc2V0QXR0cmlidXRlKFwiZGF0YS1uaWRnZXRcIiwgdGFnbmFtZSk7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKHRlbXBsYXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2lkfWApO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBlbGUgb2YgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0YWduYW1lKSl7XHJcbiAgICAgICAgICAgIGF3YWl0IGVsZS5pbmplY3RUZW1wbGF0ZSh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlICdoaWRkZW4nIGNsYXNzLlxyXG4gICAgICovXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCAnaGlkZGVuJyBjbGFzcy5cclxuICAgICAqL1xyXG4gICAgaGlkZSgpIHtcclxuICAgICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIGRpc2FibGVkIGZsYWcgdGhhdCBpcyByZWFkIGJ5IG5pZGdldCBtb3VzZSBmdW5jdGlvbnMuXHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqL1xyXG4gICAgc2V0IGRpc2FibGVkKHZhbHVlKXtcclxuICAgICAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUsIHRydWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKE5pZGdldEVsZW1lbnQuRElTQUJMRURfQVRUUklCVVRFLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBkaXNhYmxlZCBmbGFnIHRoYXQgaXMgcmVhZCBieSBuaWRnZXQgbW91c2UgZnVuY3Rpb25zLlxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIGdldCBkaXNhYmxlZCgpe1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRyaWJ1dGUoTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUpKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldEVsZW1lbnQuRElTQUJMRURfQVRUUklCVVRFKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoaXMgZWxlbWVudCB3YXMgdW5kZXIgdGhlIG1vdXNlIGZvciB0aGUgZXZlbnQuXHJcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGV2ZW50XHJcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGVsZW1lbnRcclxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGlzVW5kZXJNb3VzZShldmVudCkge1xyXG4gICAgICAgIGxldCB4ID0gZXZlbnQuY2xpZW50WDtcclxuICAgICAgICBsZXQgeSA9IGV2ZW50LmNsaWVudFk7XHJcbiAgICAgICAgbGV0IGN1cnJlbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xyXG5cclxuICAgICAgICB3aGlsZSAoY3VycmVudCkge1xyXG4gICAgICAgICAgICBpZiAoY3VycmVudCA9PT0gdGhpcykgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJ1biB0aGUgcXVlcnkgc2VsZWN0b3Igb24gdGhpcyBlbGVtZW50LlxyXG4gICAgICogSWYgdGhpcyBlbGVtZW50IGhhcyBhIHNoYWRvdywgcnVuIGl0IG9uIHRoYXQgaW5zdGVhZC5cclxuICAgICAqIEBwYXJhbSBzZWxlY3RvcnNcclxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudFRhZ05hbWVNYXBbS119XHJcbiAgICAgKi9cclxuICAgcXVlcnlTZWxlY3RvcihzZWxlY3RvcnMpIHtcclxuICAgICAgICBpZiAodGhpcy5zaGFkb3dSb290KXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSdW4gdGhlIHF1ZXJ5IHNlbGVjdG9yIG9uIHRoaXMgZWxlbWVudC5cclxuICAgICAqIElmIHRoaXMgZWxlbWVudCBoYXMgYSBzaGFkb3csIHJ1biBpdCBvbiB0aGF0IGluc3RlYWQuXHJcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3JzXHJcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdfVxyXG4gICAgICovXHJcbiAgICBxdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycykge1xyXG4gICAgICAgIGlmICh0aGlzLnNoYWRvd1Jvb3Qpe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZSB0aGlzIGVsZW1lbnQgZnJvbSBpdCdzIHBhcmVudC5cclxuICAgICAqL1xyXG4gICAgZGV0YWNoKCl7XHJcbiAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5kZXggd2l0aGluIHRoZSBwYXJlbnQgZWxlbWVudC5cclxuICAgICAqL1xyXG4gICAgaW5kZXgoKXtcclxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnBhcmVudEVsZW1lbnQuY2hpbGRyZW4pLmluZGV4T2YodGhpcyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbk5pZGdldEVsZW1lbnQuRElTQUJMRURfQVRUUklCVVRFID0gXCJuaWRnZXQtZGlzYWJsZWRcIjtcclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWVsZW1lbnQnLCBOaWRnZXRFbGVtZW50KTtcclxubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRFbGVtZW50OyIsIid1c2Ugc3RyaWN0JztcclxuLyoqXHJcbiAqIE1hbmlwdWxhdGVzIHRoZSBlbGVtZW50cyBzdHlsZSB3aXRoIGpzIHJvdXRpbmVzIGFjY29yZGluZyB0byBjc3MgZmxhZ3MuXHJcbiAqIE5pZGdldCBzdHlsZSBpcyBhcHBsaWVkIHRvIGFsbCBuaWRnZXQtZWxlbWVudHMgdW5sZXNzIHRoZXkgaGF2ZSB0aGUgbmlkZ2V0LXN0eWxlXHJcbiAqIGF0dHJpYnV0ZSBzZXQgdG8gJ2ZhbHNlJy5cclxuICovXHJcblxyXG5jbGFzcyBOaWRnZXRTdHlsZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IobmlkZ2V0KSB7XHJcbiAgICAgICAgdGhpcy5uaWRnZXQgPSBuaWRnZXQ7XHJcbiAgICAgICAgdGhpcy5hcHBseSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBhcHBseSgpIHtcclxuICAgICAgICB0aGlzLm5pZGdldFdpZHRoUmF0aW8oKTtcclxuICAgICAgICB0aGlzLm5pZGdldEhlaWdodFJhdGlvKCk7XHJcbiAgICAgICAgdGhpcy5uaWRnZXRGaXRUZXh0KCk7XHJcbiAgICAgICAgdGhpcy5uaWRnZXRGaXRUZXh0V2lkdGgoKTtcclxuICAgICAgICB0aGlzLm5pZGdldFZlcnRBbGlnblRleHQoKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbmlkZ2V0V2lkdGhSYXRpbygpIHtcclxuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtd2lkdGgtcmF0aW9cIik7XHJcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuOyAgICAgICAgICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4geyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLm5pZGdldC53aWR0aCA9IHRoaXMubmlkZ2V0LmhlaWdodCAqIHJhdGlvO1xyXG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBuaWRnZXRIZWlnaHRSYXRpbygpIHtcclxuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtaGVpZ2h0LXJhdGlvXCIpO1xyXG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgXHJcbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHsgICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5uaWRnZXQuaGVpZ2h0ID0gdGhpcy5uaWRnZXQud2lkdGggKiByYXRpbztcclxuICAgICAgICB9KS5vYnNlcnZlKHRoaXMubmlkZ2V0KTsgICAgICBcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbGwgdGhlIHRleHQgaGVpZ2h0IHRvIG1hdGNoIHRoZSBlbGVtZW50IGhlaWdodC5cclxuICAgICAqIENoYW5nZSB0aGUgcmF0aW8gdmFsdWUgKG9yIHRoZSBmb250U2l6ZSkgYWRqdXN0LlxyXG4gICAgICovXHJcbiAgICBuaWRnZXRGaXRUZXh0KCkge1xyXG4gICAgICAgIGxldCByYXRpbyA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1maXQtdGV4dFwiKTsgICAgICAgIFxyXG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjtcclxuXHJcbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coYC0tbmlkZ2V0LWZpdC10ZXh0ICR7cmF0aW99YClcclxuICAgICAgICAgICAgbGV0IGggPSB0aGlzLm5pZGdldC5vZmZzZXRIZWlnaHQgKiByYXRpbztcclxuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBoICsgXCJweFwiO1xyXG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogIFdpbGwgY2hhbmdlIHRoZSBmb250IHNpemUgc28gdGhhdCB0aGUgdGV4dCBmaXQncyBpbiB0aGUgcGFyZW50IGVsZW1lbnQuXHJcbiAgICAgKiAgRG9uJ3Qgc2V0IHRoZSB3aWR0aCBvZiB0aGUgZWxlbWVudC5cclxuICAgICAqL1xyXG4gICAgbmlkZ2V0Rml0VGV4dFdpZHRoKCkge1xyXG4gICAgICAgIGxldCByZW1vdmUgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtZml0LXRleHQtd2lkdGhcIik7XHJcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJlbW92ZSkpIHJldHVybjtcclxuXHJcbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudFxyXG5cclxuICAgICAgICAgICAgbGV0IHRleHRXID0gdGhpcy5uaWRnZXQuc2Nyb2xsV2lkdGg7XHJcbiAgICAgICAgICAgIGxldCBjb250VyA9IHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgICAgIGNvbnRXID0gY29udFcgLSByZW1vdmU7XHJcbiAgICAgICAgICAgIGxldCBkdyA9IGNvbnRXL3RleHRXO1xyXG4gICAgICAgICAgICBsZXQgY29tcHV0ZWRGb250U2l6ZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0LCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKCdmb250LXNpemUnKVxyXG4gICAgICAgICAgICBjb21wdXRlZEZvbnRTaXplID0gcGFyc2VJbnQoY29tcHV0ZWRGb250U2l6ZSk7XHJcbiAgICAgICAgICAgIGNvbXB1dGVkRm9udFNpemUgPSBNYXRoLnJvdW5kKGNvbXB1dGVkRm9udFNpemUpO1xyXG4gICAgICAgICAgICBsZXQgbmV3Rm9udFNpemUgPSBNYXRoLnJvdW5kKGNvbXB1dGVkRm9udFNpemUgKiBkdyk7XHJcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5uaWRnZXQub2Zmc2V0SGVpZ2h0XHJcblxyXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoY29tcHV0ZWRGb250U2l6ZSAtIG5ld0ZvbnRTaXplKSA8PSAyKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBpZiAobmV3Rm9udFNpemUgPiBoKSBuZXdGb250U2l6ZSA9IGg7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IG5ld0ZvbnRTaXplICsgXCJweFwiO1xyXG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBsaW5lIGhlaWdodCB0byB0aGUgb2Zmc2V0IGhlaWdodCBtdWx0aXBsaWVkIGJ5IHJhdGlvLlxyXG4gICAgICovXHJcbiAgICBuaWRnZXRWZXJ0QWxpZ25UZXh0KCl7XHJcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LXZlcnQtYWxpZ24tdGV4dFwiKTtcclxuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XHJcblxyXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5uaWRnZXQub2Zmc2V0SGVpZ2h0ICogcmF0aW87XHJcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmxpbmVIZWlnaHQgPSBoICsgXCJweFwiO1xyXG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldFN0eWxlOyIsIid1c2Ugc3RyaWN0JztcclxuY2xhc3MgVHJhbnNmb3Jte1xyXG4gICAgY29uc3RydWN0b3IodmFsdWUpe1xyXG4gICAgICAgIGxldCBpbmRleE9mID0gdmFsdWUuaW5kZXhPZihcIihcIik7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gdmFsdWUuc3Vic3RyaW5nKDAsIGluZGV4T2YpO1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcodGhpcy5uYW1lLmxlbmd0aCArIDEsIHZhbHVlLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiLCBcIiArIHRoaXMudmFsdWUpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB0b1N0cmluZygpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5hbWUgKyBcIihcIiArIHRoaXMudmFsdWUgKyBcIilcIjtcclxuICAgIH0gICAgXHJcbn1cclxuXHJcbmNsYXNzIFRyYW5zZm9ybWVyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50KSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgYXBwZW5kKCl7XHJcbiAgICAgICAgbGV0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmVsZW1lbnQpW1widHJhbnNmb3JtXCJdO1xyXG4gICAgICAgIGlmIChjb21wdXRlZFN0eWxlICE9PSBcIm5vbmVcIikgdGhpcy5wdXNoKGNvbXB1dGVkU3R5bGUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBjbGVhcigpe1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBcIlwiO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1bnNoaWZ0KHZhbHVlKXtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gdmFsdWUgKyBcIiBcIiArIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1c2godmFsdWUpe1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtICsgXCIgXCIgKyB2YWx1ZTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0gICAgXHJcbiAgICBcclxuICAgIHNoaWZ0KCl7XHJcbiAgICAgICAgbGV0IGFycmF5ID0gdGhpcy5zcGxpdCgpO1xyXG4gICAgICAgIGlmIChhcnJheS5sZW5ndGggPT09IDApIHJldHVybiBcIlwiO1xyXG4gICAgICAgIGFycmF5LnNoaWZ0KCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IGFycmF5LmpvaW4oXCIgXCIpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwb3AoKXtcclxuICAgICAgICBsZXQgYXJyYXkgPSB0aGlzLnNwbGl0KCk7XHJcbiAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgYXJyYXkucG9wKCk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IGFycmF5LmpvaW4oXCIgXCIpO1xyXG4gICAgICAgIHJldHVybiB0aGlzOyAgICAgIFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZXBsYWNlKHZhbHVlKXtcclxuICAgICAgICBsZXQgbmV3VHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybSh2YWx1ZSk7XHJcbiAgICAgICAgbGV0IGFycmF5ID0gdGhpcy5zcGxpdCgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspe1xyXG4gICAgICAgICAgICBsZXQgZW50cnkgPSBhcnJheVtpXTtcclxuICAgICAgICAgICAgbGV0IHRyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0oZW50cnkpO1xyXG4gICAgICAgICAgICBpZiAodHJhbnNmb3JtLm5hbWUgPT09IG5ld1RyYW5zZm9ybS5uYW1lKXtcclxuICAgICAgICAgICAgICAgIGFycmF5W2ldID0gbmV3VHJhbnNmb3JtLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIFxyXG4gICAgc3BsaXQoKXtcclxuICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtO1xyXG4gICAgICAgIGxldCBzdGFydCA9IDA7XHJcbiAgICAgICAgbGV0IHJ2YWx1ZSA9IFtdO1xyXG4gICAgICAgIGxldCBsYXN0ID0gJyc7XHJcbiAgICAgICAgbGV0IHNraXAgPSBmYWxzZTtcclxuICAgICAgICBsZXQgbmVzdGVkUCA9IDA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIGlmICghc2tpcCAmJiB2YWx1ZVtpXSA9PT0gJyAnICYmIGxhc3QgPT09ICcgJyl7XHJcbiAgICAgICAgICAgICAgICBzdGFydCA9IGkgKyAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFza2lwICYmIHZhbHVlW2ldID09PSAnICcpIHtcclxuICAgICAgICAgICAgICAgIHJ2YWx1ZS5wdXNoKHZhbHVlLnN1YnN0cmluZyhzdGFydCwgaSkpO1xyXG4gICAgICAgICAgICAgICAgc3RhcnQgPSBpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlW2ldID09PSAnKCcpIHtcclxuICAgICAgICAgICAgICAgIG5lc3RlZFArKztcclxuICAgICAgICAgICAgICAgIHNraXAgPSB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlW2ldID09PSAnKScpIHtcclxuICAgICAgICAgICAgICAgIG5lc3RlZFAtLTtcclxuICAgICAgICAgICAgICAgIGlmIChuZXN0ZWRQID09PSAwKSBza2lwID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGFzdCA9IHZhbHVlW2ldO1xyXG4gICAgICAgIH1cclxuICAgICAgICBydmFsdWUucHVzaCh2YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIHZhbHVlLmxlbmd0aCkpO1xyXG4gICAgICAgIHJldHVybiBydmFsdWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRvU3RyaW5nKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVHJhbnNmb3JtZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcclxuXHJcbi8qKlxyXG4gKiBBIE5pZGdldCB0aGF0IGNoYW5nZXMgdGhlIGltYWdlIGZvciBob3ZlciwgZGlzYWJsZWQsIHByZXNzLCBhbmQgaWRsZS5cclxuICogRmlyZXMgYSBjbGljayBldmVudCB3aGVuIGNsaWNrZWQuXHJcbiAqXHJcbiAqIFdpbGwgc2V0IHRoZSBjdXJyZW50IHN0YXRlIGFzIGRhdGEtc3RhdGUgc28gdGhhdCBjc3MgY2FuIGFjY2VzcyBpdC5cclxuICovXHJcbmNsYXNzIE5pZGdldEJ1dHRvbiBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG5cclxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xyXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgdGhpcy5hbHBoYVRvbGVyYW5jZSA9IDA7IC8vIGFscGhhIG5lZWRzIHRvIGJlID4gdG9sZXJhbmNlIHRvIHRyaWdnZXIgZXZlbnRzLlxyXG5cclxuICAgICAgICB0aGlzLnN0cmluZ0hvdmVyID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdIT1ZFUiddXCI7XHJcbiAgICAgICAgdGhpcy5zdHJpbmdEaXNhYmxlZCA9IFwibmlkZ2V0LWJ1dHRvbi1zdGF0ZVtzdGF0ZT0nRElTQUJMRUQnXVwiO1xyXG4gICAgICAgIHRoaXMuc3RyaW5nUHJlc3MgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J1BSRVNTJ11cIjtcclxuICAgICAgICB0aGlzLnN0cmluZ0lkbGUgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J0lETEUnXVwiO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXRlID0gXCJpZGxlXCI7XHJcbiAgICB9XHJcblxyXG4gICAgaXNJblNldCgpIHtcclxuICAgICAgICBsZXQgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xyXG4gICAgICAgIHdoaWxlIChwYXJlbnQgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBpZiAocGFyZW50LnRhZ05hbWUgPT09IFwiTklER0VULUJVVFRPTi1TRVRcIikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBuaWRnZXRSZWFkeSgpIHtcclxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nRGlzYWJsZWQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5pc0luU2V0KCkpIHJldHVybjtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCB0aGlzLm1vdXNlRW50ZXIpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZUxlYXZlKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZVByZXNzKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VSZWxlYXNlKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVkKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGlzVW5kZXIoZXZlbnQpIHtcclxuICAgICAgICBsZXQgZWxlbWVudHMgPSBkb2N1bWVudC5lbGVtZW50c0Zyb21Qb2ludChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcclxuICAgICAgICBpZiAoZWxlbWVudHMuaW5kZXhPZih0aGlzLmFjdGl2ZU5pZGdldCkgPT0gLTEpIHJldHVybiBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmFjdGl2ZU5pZGdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFggLSByZWN0Lng7XHJcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZIC0gcmVjdC55O1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy50ZXN0QWxwaGEoeCwgeSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGRpc2FibGVkKCkge1xyXG4gICAgICAgIHJldHVybiBzdXBlci5kaXNhYmxlZDtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgZGlzYWJsZWQodmFsdWUpIHtcclxuICAgICAgICBzdXBlci5kaXNhYmxlZCA9IHZhbHVlO1xyXG5cclxuICAgICAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0Rpc2FibGVkO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcImluXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0hvdmVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcInByZXNzXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ1ByZXNzO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSWRsZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZVJlbGVhc2UoZSkge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcImhvdmVyXCI7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VQcmVzcyhlKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwicHJlc3NcIjtcclxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdQcmVzcztcclxuICAgIH1cclxuXHJcbiAgICBoaWRlQWxsSW1hZ2VzKCkge1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3Rvcih0aGlzLnN0cmluZ0hvdmVyKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nRGlzYWJsZWQpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdQcmVzcykuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3Rvcih0aGlzLnN0cmluZ0lkbGUpLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgYWN0aXZlTmlkZ2V0KHNlbGVjdG9yKSB7XHJcbiAgICAgICAgdGhpcy5oaWRlQWxsSW1hZ2VzKCk7XHJcbiAgICAgICAgdGhpcy5fYWN0aXZlTmlkZ2V0ID0gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgICAgICB0aGlzLl9hY3RpdmVOaWRnZXQuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBhY3RpdmVOaWRnZXQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGl2ZU5pZGdldDtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgc3RhdGUodmFsdWUpIHtcclxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcImRhdGEtc3RhdGVcIiwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzdGF0ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHRlc3RBbHBoYSh4LCB5KSB7XHJcbiAgICAgICAgbGV0IHBpeGVsID0gdGhpcy5hY3RpdmVOaWRnZXQuZ2V0UGl4ZWwoeCwgeSk7XHJcbiAgICAgICAgcmV0dXJuIHBpeGVsWzNdID4gdGhpcy5hbHBoYVRvbGVyYW5jZTtcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZUxlYXZlKCkge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VBY3RpdmUoKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcclxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZU1vdmUoZSkge1xyXG4gICAgICAgIGlmICghdGhpcy50ZXN0QWxwaGEoZS5jbGllbnRYLCBlLmNsaWVudFkpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSWRsZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbjtcclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1idXR0b24nLCBOaWRnZXRCdXR0b24pO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEJ1dHRvbjtcclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XHJcblxyXG5jbGFzcyBOaWRnZXRCdXR0b25TZXQgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xyXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgdGhpcy5hbHBoYVRvbGVyYW5jZSA9IDA7IC8vIGFscGhhIG5lZWRzIHRvIGJlID4gdG9sZXJhbmNlIHRvIHRyaWdnZXIgZXZlbnRzLlxyXG5cclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZVByZXNzKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VSZWxlYXNlKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmUpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZUxlYXZlKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVkKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbmlkZ2V0UmVhZHkoKXtcclxuICAgICAgICB0aGlzLmJ1dHRvbnMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoXCJuaWRnZXQtYnV0dG9uXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlUHJlc3MoZSl7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNVbmRlcihlKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZVByZXNzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJwcmVzc1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlUmVsZWFzZShlKXtcclxuICAgICAgICB0aGlzLnN0YXRlID0gXCJvdXRcIjtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5zdGF0ZSA9PSBcInByZXNzXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJidXR0b24tY2xpY2tlZFwiLCB7ZGV0YWlsOiBlbGVtZW50fSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZVJlbGVhc2UoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcImhvdmVyXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VNb3ZlKGUpe1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5idXR0b25zKXtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNVbmRlcihlKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZUFjdGl2ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQubW91c2VMZWF2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlTGVhdmUoZSl7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5tb3VzZUxlYXZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXQgc3RhdGUodmFsdWUpe1xyXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiLCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHN0YXRlKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiKTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWJ1dHRvbi1zZXQnLCBOaWRnZXRCdXR0b25TZXQpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEJ1dHRvblNldDsiLCJcInVzZSBzdHJpY3RcIjtcclxuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XHJcblxyXG4vKipcclxuICogQSBOaWRnZXQgdGhhdCBjaGFuZ2VzIHRoZSBpbWFnZSBmb3IgaG92ZXIsIGRpc2FibGVkLCBwcmVzcywgYW5kIGlkbGUuXHJcbiAqIEZpcmVzIGEgY2xpY2sgZXZlbnQgd2hlbiBjbGlja2VkLlxyXG4gKiBcclxuICogVGhpcyBpcyB0aGUgaHRtbCBlbGVtZW50IFwibmlkZ2V0LWJ1dHRvblwiLlxyXG4gKiBJZiB0aGUgbmlkZ2V0LWJ1dHRvbiBoYXMgdGhlIGF0dHJpYnV0ZSBgaW1nLXByZWZpeCA9IFwicHJlZml4XCJgIHRoZW4gdGhlIFxyXG4gKiBmb2xsb3dpbmcgaW1hZ2VzLiAgYGltZy1zdWZmaXhgID0gXCJzdWZmaXhcIiB3aWxsIG92ZXJyaWRlIHRoZSBcIi5wbmdcIi5cclxuICogd2lsbCBiZSB1c2VkOlxyXG4gKiAtIHByZWZpeC1ob3Zlci5wbmdcclxuICogLSBwcmVmaXgtZGlzYWJsZWQucG5nXHJcbiAqIC0gcHJlZml4LXByZXNzLnBuZ1xyXG4gKiAtIHByZWZpeC1pZGxlLnBuZ1xyXG4gKi9cclxuY2xhc3MgTmlkZ2V0QnV0dG9uU3RhdGUgZXh0ZW5kcyBOaWRnZXQge1xyXG5cclxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xyXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbmlkZ2V0UmVhZHkoKXtcclxuICAgICAgICB0aGlzLmltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XHJcbiAgICAgICAgdGhpcy5pbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIHRoaXMuZ2V0QXR0cmlidXRlKFwiaW1hZ2Utc3JjXCIpKTtcclxuICAgICAgICB0aGlzLmFwcGVuZCh0aGlzLmltZyk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdygpe1xyXG4gICAgICAgIHN1cGVyLnNob3coKTtcclxuICAgICAgICB0aGlzLmxvYWRDYW52YXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkQ2FudmFzKCl7XHJcbiAgICAgICAgaWYgKCF0aGlzLmltZyB8fCB0aGlzLmNhbnZhcykgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmltZy5uYXR1cmFsV2lkdGg7XHJcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5pbWcubmF0dXJhbEhlaWdodDtcclxuICAgICAgICB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLmRyYXdJbWFnZSh0aGlzLmltZywgMCwgMCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFBpeGVsKHgsIHkpe1xyXG4gICAgICAgIHRoaXMubG9hZENhbnZhcygpO1xyXG4gICAgICAgIGxldCBkeCA9IHRoaXMuY2FudmFzLndpZHRoIC8gdGhpcy5vZmZzZXRXaWR0aDtcclxuICAgICAgICBsZXQgZHkgPSB0aGlzLmNhbnZhcy5oZWlnaHQgLyB0aGlzLm9mZnNldEhlaWdodDtcclxuICAgICAgICBsZXQgcGl4ZWwgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLmdldEltYWdlRGF0YShkeCAqIHgsIGR5ICogeSwgMSwgMSkuZGF0YTtcclxuICAgICAgICByZXR1cm4gcGl4ZWw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgc3RhdGUgdG8gSE9WRVIsIERJU0FCTEVELCBQUkVTUywgSURMRS5cclxuICAgICAqIEBwYXJhbSB7dHlwZX0gc3RhdGVcclxuICAgICAqIEByZXR1cm4ge3VuZGVmaW5lZH1cclxuICAgICAqL1xyXG4gICAgc2V0IHN0YXRlKHN0YXRlKSB7XHJcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJzdGF0ZVwiLCBzdGF0ZS50b1VwcGVyQ2FzZSgpKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc3RhdGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cmlidXRlKFwic3RhdGVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHNvdXJjZShpbWcpIHtcclxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInNyY1wiLCBpbWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzb3VyY2UoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cmlidXRlKFwic3JjXCIpO1xyXG4gICAgfVxyXG59XHJcbjtcclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1idXR0b24tc3RhdGUnLCBOaWRnZXRCdXR0b25TdGF0ZSk7XHJcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0QnV0dG9uU3RhdGU7XHJcblxyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xyXG5cclxuLyoqXHJcbiAqIEEgY29tcG9uZW50IHRoYXQgaGFzIGV2ZW50cyBmb3IgYWRkaW5nIG5pZGdldHMsIHJlbW92aW5nIG5pZGdldHMsIGFuZCBcclxuICogcmVzaXppbmcgdGhlIGNvbnRhaW5lci4gIFdoZW4gdGhlIGNvbnRhaW5lciBzaXplIGlzIGNoYW5nZWQsIHRoZSBudW1iZXJcclxuICogb2YgY29tcG9uZW50cyBjaGFuZ2UsIG9yIHRoZSBsYXlvdXQgYXR0cmlidXRlIGNoYW5nZXMsIHRoZSBkb0xheW91dCBmdW5jdGlvblxyXG4gKiBpcyBjYWxsZWQuXHJcbiAqIFxyXG4gKiBUaGUgY29tcG9uZW50cyBhcmUgYXJyYWdlZCBhY2NvcmRpbmcgdG8gdGhlIHNlbGVjdGVkIGxheW91dCBhdHRyaWJ1dGUuICBJZiBcclxuICogbm8gbGF5b3V0IGF0dHJpYnV0ZSBpcyBjaG9zZW4sIGRvTGF5b3V0IGlzIHN0aWxsIGNhbGxlZCBhcyBpdCBpcyBhc3N1bWVkIFxyXG4gKiBhIGN1c3RvbSBmdW5jdGlvbiBoYXMgYmVlbiBwcm92aWRlZC5cclxuICovXHJcblxyXG5jbGFzcyBOaWRnZXRDb250YWluZXIgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcclxuICAgICAgICBsZXQgcmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIodGhpcy5kb0xheW91dCk7XHJcbiAgICAgICAgcmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0IG9ic2VydmVkQXR0cmlidXRlcygpIHtcclxuICAgICAgICByZXR1cm4gW05pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGVdO1xyXG4gICAgfVxyXG5cclxuICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcclxuICAgICAgICBpZiAob2xkVmFsdWUgPT09IG5ld1ZhbHVlKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5kb0xheW91dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBsYXlvdXQodmFsdWUpIHtcclxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShOaWRnZXRDb250YWluZXIubGF5b3V0QXR0cmlidXRlLCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGxheW91dCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0Q29udGFpbmVyLmxheW91dEF0dHJpYnV0ZSk7XHJcbiAgICB9ICAgICAgXHJcblxyXG4gICAgZG9MYXlvdXQoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmxheW91dCkgcmV0dXJuO1xyXG4gICAgICAgIGlmICghTGF5b3V0c1t0aGlzLmxheW91dF0pIHRocm93IGBpbnZhbGlkIGxheW91dDogJHt0aGlzLmxheW91dH1gO1xyXG4gICAgICAgIExheW91dHNbdGhpcy5sYXlvdXRdO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBMYXlvdXRzIHtcclxuICAgIC8qKlxyXG4gICAgICogRml0IGFsbCBuaWRnZXRzIGV2ZW5seSBpbiBhIGhvcml6b250YWwgcm93LlxyXG4gICAgICogQHBhcmFtIHt0eXBlfSBuaWRnZXRcclxuICAgICAqIEByZXR1cm4ge3VuZGVmaW5lZH1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHJvdyhuaWRnZXQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpemUpO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuTmlkZ2V0Q29udGFpbmVyLmxheW91dEF0dHJpYnV0ZSA9IFwibGF5b3V0XCI7XHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1jb250YWluZXInLCBOaWRnZXRDb250YWluZXIpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldENvbnRhaW5lcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIi4uL05pZGdldFwiKTtcclxuY29uc3QgVHJhbnNmb3JtZXIgPSByZXF1aXJlKFwiLi4vVHJhbnNmb3JtZXJcIik7XHJcblxyXG4vKipcclxuICogRG9uJ3QgZm9yZ2V0IHRvIHNldCAnaXMnIHdoZW4gcHV0dGluZyBlbGVtZW50IGRpcmVjdGx5IGluIGh0bWwgYXMgb3Bwb3NlZCB0b1xyXG4gKiBwcm9ncmFtaWNhbGx5LlxyXG4gKiA8aW1nIGlzPVwicmVnaXN0ZXJlZC1uYW1lXCIgc3JjPVwiaW1hZ2UucG5nXCI+PC9pbWc+XHJcbiAqIFxyXG4gKiBpbmNsdWRlIGEgY3VzdG9tIGVsZW1lbnQgZGVmaW5pdGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBjbGFzcy48YnI+XHJcbiAqIHdpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ3JlZ2lzdGVyZWQtbmFtZScsIENsYXNzLCB7ZXh0ZW5kczogXCJpbWdcIn0pO1xyXG4gKi9cclxuY2xhc3MgTmlkZ2V0SFRNTEltYWdlIGV4dGVuZHMgSFRNTEltYWdlRWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubGFzdERpc3BsYXkgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1lciA9IG5ldyBUcmFuc2Zvcm1lcih0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBzY2FsZShkdywgZGgpIHtcclxuICAgICAgICBpZiAoIWRoKSBkaCA9IGR3O1xyXG4gICAgICAgIGxldCB3ID0gdGhpcy53aWR0aCAqIGR3O1xyXG4gICAgICAgIGxldCBoID0gdGhpcy5oZWlnaHQgKiBkaDtcclxuICAgICAgICB0aGlzLndpZHRoID0gdztcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGg7XHJcbiAgICB9ICAgICAgICBcclxuXHJcbiAgICBzZXQgc3JjKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzcmMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwic3JjXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvY2F0ZShsZWZ0LCB0b3ApIHtcclxuICAgICAgICB0aGlzLmxlZnQgPSBsZWZ0O1xyXG4gICAgICAgIHRoaXMudG9wID0gdG9wO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBsZWZ0KCkge1xyXG4gICAgICAgIGxldCB3ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykubGVmdDtcclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh3KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgdG9wKCkge1xyXG4gICAgICAgIGxldCBoID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykudG9wO1xyXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBsZWZ0KHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5zdHlsZS5sZWZ0ID0gdmFsdWUgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHRvcCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuc3R5bGUudG9wID0gdmFsdWUgKyBcInB4XCI7XHJcbiAgICB9ICAgIFxyXG5cclxuICAgIHNldCB3aWR0aCh3KSB7XHJcbiAgICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IHcgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGhlaWdodCh3KSB7XHJcbiAgICAgICAgdGhpcy5zdHlsZS5oZWlnaHQgPSB3ICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB3aWR0aCgpIHtcclxuICAgICAgICBsZXQgdyA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMpLndpZHRoO1xyXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHcpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBoZWlnaHQoKSB7XHJcbiAgICAgICAgbGV0IGggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5oZWlnaHQ7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaCk7XHJcbiAgICB9ICAgICAgICBcclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmxhc3REaXNwbGF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IHRoaXMubGFzdERpc3BsYXk7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdERpc3BsYXkgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZSgpIHtcclxuICAgICAgICB0aGlzLmxhc3REaXNwbGF5ID0gdGhpcy5zdHlsZS5kaXNwbGF5O1xyXG4gICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBkaXNwbGF5KHZhbHVlKXtcclxuICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSB2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IGRpc3BsYXkoKXtcclxuICAgICAgICByZXR1cm4gd2luZG93LmNhbGN1bGF0ZVN0eWxlKHRoaXMpW1wiZGlzcGxheVwiXTtcclxuICAgIH1cclxuXHJcbiAgICBkZXRhY2goKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHRoaXMpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXQgZGlzYWJsZWQodmFsdWUpe1xyXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcImRpc2FibGVkXCIsIHRydWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IGRpc2FibGVkKCl7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dHJpYnV0ZShcImRpc2FibGVkXCIpKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIik7XHJcbiAgICB9ICAgIFxyXG4gICAgXHJcbiAgICBjbGVhclBvcygpe1xyXG4gICAgICAgIHRoaXMuc3R5bGUudG9wID0gbnVsbDtcclxuICAgICAgICB0aGlzLnN0eWxlLmxlZnQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyRGltcygpe1xyXG4gICAgICAgIHRoaXMuc3R5bGUud2lkdGggPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc3R5bGUuaGVpZ2h0ID0gbnVsbDtcclxuICAgIH0gICAgXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0SFRNTEltYWdlO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xyXG5cclxuLyoqXHJcbiAqIEEgTmlkZ2V0IHRoYXQgY29udGFpbnMgaW1hZ2VzLlxyXG4gKi9cclxuY2xhc3MgTmlkZ2V0SW1hZ2UgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihzcmMpe1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5pbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xyXG4gICAgICAgIGlmIChzcmMpIHRoaXMuc3JjID0gc3JjO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCl7XHJcbiAgICAgICAgbGV0IHNyYyA9IHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldEltYWdlLnNyY0F0dHJpYnV0ZSk7ICAgICAgICBcclxuICAgICAgICBpZiAoc3JjKSB0aGlzLmltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgc3JjKTsgICAgICAgXHJcbiAgICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLmltZyk7XHJcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc3JjKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW1nLmdldEF0dHJpYnV0ZShcInNyY1wiKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgc3JjKHZhbHVlKXtcclxuICAgICAgICB0aGlzLmltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNpemUod2lkdGgsIGhlaWdodCl7XHJcbiAgICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IHdpZHRoXHJcbiAgICAgICAgdGhpcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHRcclxuICAgICAgICB0aGlzLmltZy5zdHlsZS53aWR0aCA9IHdpZHRoXHJcbiAgICAgICAgdGhpcy5pbWcuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNjYWxlKGR3LCBkaCl7XHJcbiAgICAgICAgaWYgKCFkaCkgZGggPSBkdztcclxuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLm9mZnNldFdpZHRoICogZHc7XHJcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMub2Zmc2V0SGVpZ2h0ICogZGg7XHJcbiAgICAgICAgdGhpcy5zaXplKGAke3dpZHRofXB4YCwgYCR7aGVpZ2h0fXB4YCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNob3coKXtcclxuICAgICAgICBpZiAodGhpcy5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIil7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnN0eWxlLmRpc3BsYXk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBoaWRlKCl7XHJcbiAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICB9XHJcbn1cclxuXHJcbk5pZGdldEltYWdlLnNyY0F0dHJpYnV0ZSA9IFwic3JjXCI7XHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1pbWFnZScsIE5pZGdldEltYWdlKTtcclxubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRJbWFnZTsiLCJcInVzZSBzdHJpY3RcIjtcclxuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xyXG5cclxuLyoqXHJcbiAqIFdoZW4gdXNpbmcgLS1uaWRnZXQtZml0LXRleHQsIGRvIG5vdCBpbmNsdWRlIGhlaWdodCBhbmQgd2lkdGggYXR0cmlidXRlcy5cclxuICogQSBmb250IHNpemUgY2FuIGJlIHVzZWQgYXMgYSBzdGFydGluZyBwb2ludC5cclxuICovXHJcbmNsYXNzIEZpdFRleHQge1xyXG4gICAgY29uc3RydWN0b3IobmlkZ2V0KXtcclxuICAgICAgICB0aGlzLm5pZGdldCA9IG5pZGdldDtcclxuICAgICAgICB0aGlzLmxvY2sgPSBcIm5vbmVcIjtcclxuICAgICAgICB0aGlzLnBhcnNlQXJndW1lbnRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbGlzdGVuKCl7XHJcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKT0+dGhpcy5kZWxheVJlc2l6ZSh0aGlzLmhWYWx1ZSwgdGhpcy53VmFsdWUpKTtcclxuICAgICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUodGhpcy5uaWRnZXQucGFyZW50RWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAwO1xyXG4gICAgICAgIHRoaXMuZGVsYXkgPSAyNTtcclxuICAgICAgICB0aGlzLmRlbGF5UmVzaXplKHRoaXMuaFZhbHVlLCB0aGlzLndWYWx1ZSk7XHJcbiAgICAgICAgdGhpcy5zdG9wID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZGVsYXlSZXNpemUoaFZhbHVlLCB3VmFsdWUpe1xyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcclxuICAgICAgICBpZiAodGhpcy50aW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT50aGlzLm9uUmVzaXplKGhWYWx1ZSwgd1ZhbHVlKSwgdGhpcy5kZWxheSk7XHJcbiAgICB9XHJcblxyXG4gICAgbm90aWZ5KGhWYWx1ZSwgd1ZhbHVlKXtcclxuICAgICAgICB0aGlzLnN0b3AgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmRlbGF5UmVzaXplKGhWYWx1ZSwgd1ZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwYXJzZUFyZ3VtZW50cygpe1xyXG4gICAgICAgIGxldCBhcmdzID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0XCIpO1xyXG5cclxuICAgICAgICBpZiAoIWFyZ3MgfHwgYXJncyA9PT0gZmFsc2UgfHwgYXJncyA9PT0gXCJmYWxzZVwiKXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5oVmFsdWUgPSB0aGlzLndWYWx1ZSA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YoYXJncykgPT0gXCJzdHJpbmdcIil7XHJcbiAgICAgICAgICAgIGxldCBvYmogPSBKU09OLnBhcnNlKGFyZ3MpO1xyXG4gICAgICAgICAgICBpZiAob2JqW1wiZml0XCJdICE9PSB1bmRlZmluZWQgJiYgb2JqW1wiZml0XCJdID09PSBcIndpZHRoXCIpIHRoaXMuaFZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChvYmpbXCJmaXRcIl0gIT09IHVuZGVmaW5lZCAmJiBvYmpbXCJmaXRcIl0gPT09IFwiaGVpZ2h0XCIpIHRoaXMud1ZhbHVlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChvYmpbXCJsb2NrXCJdICE9PSB1bmRlZmluZWQpIHRoaXMubG9jayA9IChvYmpbXCJsb2NrXCJdKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25SZXNpemUoaFZhbHVlLCB3VmFsdWUpe1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnRpbWVvdXQ7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnN0b3ApIHJldHVybjtcclxuICAgICAgICBpZiAodGhpcy5uaWRnZXQudGV4dENvbnRlbnQgPT09IFwiXCIpIHJldHVybjtcclxuICAgICAgICBpZiAodGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgPT09IDApIHJldHVybjtcclxuICAgICAgICBpZiAodGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRXaWR0aCA9PT0gMCkgcmV0dXJuO1xyXG4gICAgICAgIGlmICh0aGlzLm5pZGdldC5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIikgcmV0dXJuO1xyXG5cclxuICAgICAgICBpZiAoIWhWYWx1ZSAmJiAhd1ZhbHVlKSByZXR1cm47XHJcblxyXG4gICAgICAgIGxldCBoRGlyID0gdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLSB0aGlzLm5pZGdldC5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgbGV0IHdEaXIgPSB0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC0gdGhpcy5uaWRnZXQuc2Nyb2xsV2lkdGg7XHJcblxyXG4gICAgICAgIGlmICghaFZhbHVlKSBoRGlyID0gMDtcclxuICAgICAgICBpZiAoIXdWYWx1ZSkgd0RpciA9IDA7XHJcblxyXG4gICAgICAgIGxldCBkaXIgPSBNYXRoLnNpZ24oaERpciB8IHdEaXIpOyAvLyB3aWxsIHByZWZlciB0byBzaHJpbmtcclxuICAgICAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09IDApIHRoaXMuZGlyZWN0aW9uID0gZGlyOyAvLyBrZWVwIHByZXZpb3VzIGRpcmVjdGlvblxyXG5cclxuICAgICAgICBsZXQgZm9udFNpemUgPSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KVtcImZvbnQtc2l6ZVwiXSlcclxuICAgICAgICBsZXQgbmV3U2l6ZSA9IGZvbnRTaXplICsgKHRoaXMuZGlyZWN0aW9uKTtcclxuXHJcbiAgICAgICAgaWYgKG5ld1NpemUgIT09IGZvbnRTaXplICYmIHRoaXMuZGlyZWN0aW9uID09PSBkaXIpIHtcclxuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBuZXdTaXplICsgXCJweFwiO1xyXG4gICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+dGhpcy5vblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSksIHRoaXMuZGVsYXkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGlyIDwgMCAmJiB0aGlzLmRpcmVjdGlvbiA+IDApIHsgLy8gcmV2ZXJzZSBkaXJlY3Rpb24gaWYgZ3Jvd2luZyB0b28gbGFyZ2VcclxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAtMTtcclxuICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+dGhpcy5vblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSksIHRoaXMuZGVsYXkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2sgPT09IFwidmhcIikge1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvbnRSYXRpbyA9IG5ld1NpemUgLyB3aW5kb3cuaW5uZXJIZWlnaHQgKiAxMDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IGZvbnRSYXRpbyArIFwidmhcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5sb2NrID09PSBcInZ3XCIpe1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvbnRSYXRpbyA9IG5ld1NpemUgLyB3aW5kb3cuaW5uZXJXaWR0aCAqIDEwMDtcclxuICAgICAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gZm9udFJhdGlvICsgXCJ2d1wiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQSBuaWRnZXQgZWxlbWVudCBmb3IgZGlzcGxheWluZyB0ZXh0LlxyXG4gKiBwdXQgJy0tbmlkZ2V0LWZpdC10ZXh0OiAxLjA7JyBpbnRvIGNzcyBmb3IgdGhpcyBlbGVtZW50IHRvIGVuYWJsZSBzY2FsaW5nLlxyXG4gKiBzZWU6IE5pZGdldFN0eWxlLmpzXHJcbiAqL1xyXG5jbGFzcyBOaWRnZXRUZXh0IGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLm9ic2VydmVyc1tcImZpdC10ZXh0LXdpZHRoLXRvbGVyYW5jZVwiXSA9IDAuMDI7XHJcbiAgICAgICAgdGhpcy5maXRUZXh0ID0gbmV3IEZpdFRleHQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlKCl7XHJcbiAgICAgICAgaWYgKHRoaXMuZml0VGV4dCkge1xyXG4gICAgICAgICAgICB0aGlzLmZpdFRleHQuc3RvcCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dC5vYnNlcnZlci5kaXNjb25uZWN0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN1cGVyLnJlbW92ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xyXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgbGV0IGZpdFByb3AgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1maXQtdGV4dFwiKTtcclxuXHJcbiAgICAgICAgaWYgKGZpdFByb3AgIT09IHVuZGVmaW5lZCAmJiBmaXRQcm9wICE9PSBcIlwiKXtcclxuICAgICAgICAgICAgdGhpcy5maXRUZXh0Lmxpc3RlbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXQgdGV4dCh2YWx1ZSl7XHJcbiAgICAgICAgdGhpcy5pbm5lclRleHQgPSB2YWx1ZTtcclxuICAgICAgICBpZiAodGhpcy5maXRUZXh0ICYmIHRoaXMuZml0VGV4dC5zdG9wID09PSBmYWxzZSl7XHJcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dC5kZWxheVJlc2l6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgdGV4dCgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlubmVyVGV4dDtcclxuICAgIH1cclxuXHJcbiAgICBzY2FsZShhbW91bnQpIHtcclxuICAgICAgICBsZXQgc3R5bGVGb250U2l6ZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoXCJmb250LXNpemVcIik7XHJcbiAgICAgICAgbGV0IGZvbnRTaXplID0gcGFyc2VGbG9hdChzdHlsZUZvbnRTaXplKTtcclxuICAgICAgICB0aGlzLnN0eWxlLmZvbnRTaXplID0gKGZvbnRTaXplICogYW1vdW50KSArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgbGluZSBoZWlnaHQgdG8gdGhlIG9mZnNldCBoZWlnaHQgbXVsdGlwbGllZCBieSByYXRpby5cclxuICAgICAqIENhbGxpbmcgdGhpcyBtZXRob2QgZGlyZWN0b3J5IHdpbGwgb3ZlcnJpZGUgdGhlIHZhbHVlIHNldCBieSBjc3NcclxuICAgICAqL1xyXG4gICAgbmlkZ2V0VmVydEFsaWduVGV4dCh2YWx1ZSkge1xyXG4gICAgICAgIGlmICh2YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KFwiLS1uaWRnZXQtdmVydC1hbGlnbi10ZXh0XCIsIHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvblJlc2l6ZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtdmVydC1hbGlnbi10ZXh0XCIpO1xyXG4gICAgICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XHJcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5vZmZzZXRIZWlnaHQgKiByYXRpbztcclxuICAgICAgICAgICAgdGhpcy5zdHlsZS5saW5lSGVpZ2h0ID0gaCArIFwicHhcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm9ic2VydmVycy52ZXJ0QWxpZ25UZXh0ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMudmVydEFsaWduVGV4dCA9IG5ldyBSZXNpemVPYnNlcnZlcihvblJlc2l6ZSk7XHJcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLnZlcnRBbGlnblRleHQub2JzZXJ2ZSh0aGlzKVxyXG4gICAgICAgIH1cclxuICAgICAgICBvblJlc2l6ZSgpXHJcbiAgICB9XHJcblxyXG4gICAgdmVydEFsaWduVGV4dChyYXRpbyA9IDEuMCl7XHJcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xyXG4gICAgICAgIGxldCBoID0gdGhpcy5vZmZzZXRIZWlnaHQgKiByYXRpbztcclxuICAgICAgICB0aGlzLnN0eWxlLmxpbmVIZWlnaHQgPSBoICsgXCJweFwiO1xyXG4gICAgfVxyXG59XHJcbjtcclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC10ZXh0JywgTmlkZ2V0VGV4dCk7XHJcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0VGV4dDsiLCJcInVzZSBzdHJpY3RcIjtcclxuY29uc3QgZHJhZ0hhbmRsZXIgPSByZXF1aXJlKFwiLi4vRHJhZ0hhbmRsZXJcIikuaW5zdGFuY2U7XHJcblxyXG5cclxuZnVuY3Rpb24gb25EcmFnU3RhcnQoZXZlbnQpeyAgICBcclxuICAgIGRyYWdIYW5kbGVyLnNldCh0aGlzKTtcclxuICAgIHdpbmRvdy54ID0gdGhpcztcclxuICAgIGNvbnNvbGUubG9nKFwiJ1wiICsgdGhpcy5uYW1lKCkgKyBcIidcIik7XHJcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdTdGFydFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25EcmFnRW5kKGV2ZW50KXtcclxuICAgIGlmIChkcmFnSGFuZGxlci5nZXQoKSAhPT0gdGhpcykgcmV0dXJuO1xyXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnRW5kXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xyXG4gICAgZHJhZ0hhbmRsZXIuY2xlYXIoKTtcclxufVxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcclxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuc2V0QXR0cmlidXRlKFwiZHJhZ2dhYmxlXCIsIFwidHJ1ZVwiKTsgICBcclxuICAgIFxyXG4gICAgbmlkZ2V0Lm9uRHJhZ1N0YXJ0ID0gb25EcmFnU3RhcnQuYmluZChuaWRnZXQpO1xyXG4gICAgbmlkZ2V0Lm9uRHJhZ0VuZCA9IG9uRHJhZ0VuZC5iaW5kKG5pZGdldCk7XHJcbiAgICBcclxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdzdGFydFwiLCBuaWRnZXQub25EcmFnU3RhcnQpO1xyXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VuZFwiLCBuaWRnZXQub25EcmFnRW5kKTsgICAgXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmNvbnN0IGRyYWdIYW5kbGVyID0gcmVxdWlyZShcIi4uL0RyYWdIYW5kbGVyXCIpLmluc3RhbmNlO1xyXG5jb25zdCBNb3VzZVV0aWxpdGllcyA9IHJlcXVpcmUoXCIuLi9Nb3VzZVV0aWxpdGllc1wiKTtcclxuXHJcbmZ1bmN0aW9uIG9uRHJhZ092ZXIoZXZlbnQpe1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGxldCBkcmFnTmlkZ2V0ID0gZHJhZ0hhbmRsZXIuZ2V0KCk7XHJcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdPdmVyXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMsIGRyYWdOaWRnZXQpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvbkRyYWdFbnRlcihldmVudCl7XHJcbiAgICBpZiAoIWRyYWdIYW5kbGVyLmhhcygpKSByZXR1cm47XHJcbiAgICBpZiAoIWRyYWdIYW5kbGVyLnB1c2hPdmVyKHRoaXMpKSByZXR1cm47XHJcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdFbnRlclwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25EcmFnTGVhdmUoZXZlbnQpe1xyXG4gICAgaWYgKCFkcmFnSGFuZGxlci5oYXMoKSkgcmV0dXJuO1xyXG4gICAgaWYgKE1vdXNlVXRpbGl0aWVzLmlzVW5kZXIodGhpcy5nZXRFbGVtZW50KCkpKSByZXR1cm47XHJcbiAgICBpZiAoIWRyYWdIYW5kbGVyLnJlbW92ZU92ZXIodGhpcykpIHJldHVybjtcclxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ0xlYXZlXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvbkRyb3AoZXZlbnQpe1xyXG4gICAgbGV0IGRyYWdOaWRnZXQgPSBkcmFnSGFuZGxlci5nZXQoKTtcclxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJvcFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzLCBkcmFnTmlkZ2V0KTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xyXG4gICAgbmlkZ2V0Lm9uRHJhZ092ZXIgPSBvbkRyYWdPdmVyLmJpbmQobmlkZ2V0KTtcclxuICAgIG5pZGdldC5vbkRyb3AgPSBvbkRyb3AuYmluZChuaWRnZXQpO1xyXG4gICAgbmlkZ2V0Lm9uRHJhZ0VudGVyID0gb25EcmFnRW50ZXIuYmluZChuaWRnZXQpO1xyXG4gICAgbmlkZ2V0Lm9uRHJhZ0xlYXZlID0gb25EcmFnTGVhdmUuYmluZChuaWRnZXQpO1xyXG4gICAgXHJcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnb3ZlclwiLCBuaWRnZXQub25EcmFnT3Zlcik7XHJcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIG5pZGdldC5vbkRyb3ApO1xyXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIG5pZGdldC5vbkRyYWdFbnRlcik7XHJcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnbGVhdmVcIiwgbmlkZ2V0Lm9uRHJhZ0xlYXZlKTsgICAgXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmNvbnN0IE1vdXNlVXRpbGl0aWVzID0gcmVxdWlyZShcIi4uL01vdXNlVXRpbGl0aWVzXCIpO1xyXG5cclxuZnVuY3Rpb24gb25DbGljayhldmVudCl7ICAgIFxyXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJjbGlja1wiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25Nb3VzZURvd24oZXZlbnQpeyAgICBcclxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VEb3duXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvbk1vdXNlVXAoZXZlbnQpeyAgICBcclxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VVcFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25Nb3VzZUVudGVyKGV2ZW50KXsgICAgXHJcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcIm1vdXNlRW50ZXJcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uTW91c2VMZWF2ZShldmVudCl7XHJcbiAgICBpZiAoTW91c2VVdGlsaXRpZXMuaXNVbmRlcih0aGlzLmdldEVsZW1lbnQoKSkpIHJldHVybjtcclxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VFeGl0XCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XHJcbiAgICBjb25zb2xlLmxvZyhcIm1vdXNlIHNldHVwXCIpO1xyXG4gICAgXHJcbiAgICBuaWRnZXQub25DbGljayA9IG9uQ2xpY2suYmluZChuaWRnZXQpO1xyXG4gICAgbmlkZ2V0Lm9uTW91c2VEb3duID0gb25Nb3VzZURvd24uYmluZChuaWRnZXQpO1xyXG4gICAgbmlkZ2V0Lm9uTW91c2VVcCA9IG9uTW91c2VVcC5iaW5kKG5pZGdldCk7XHJcbiAgICBuaWRnZXQub25Nb3VzZUVudGVyID0gb25Nb3VzZUVudGVyLmJpbmQobmlkZ2V0KTtcclxuICAgIG5pZGdldC5vbk1vdXNlTGVhdmUgPSBvbk1vdXNlTGVhdmUuYmluZChuaWRnZXQpO1xyXG4gICAgXHJcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBuaWRnZXQub25DbGljayk7XHJcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgbmlkZ2V0Lm9uTW91c2VEb3duKTtcclxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgbmlkZ2V0Lm9uTW91c2VVcCk7XHJcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIG5pZGdldC5vbk1vdXNlRW50ZXIpO1xyXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgbmlkZ2V0Lm9uTW91c2VMZWF2ZSk7XHJcbn07XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIEVuYWJsZSB0aGUgbmlkZ2V0IHRvIGJlIG1vdmVkIGJ5IGRyYWdnaW5nLiAgV2lsbCBkcmFnIGJ5IGFueSBjaGlsZCBlbGVlbWVudFxyXG4gKiB0aGUgJy5uaWRnZXQtaGVhZGVyJyBjbGFzcywgb3RoZXJ3aXNlIG1vdmFibGUgYnkgY2xpY2tpbmcgYW55d2hlcmUuXHJcbiAqIEBwYXJhbSB7dHlwZX0gZVxyXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XHJcbiAqL1xyXG5cclxuZnVuY3Rpb24gb25Nb3VzZU1vdmUoZSl7ICAgIFxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgaWYgKCF0aGlzLl9fbW92YWJsZS5hY3RpdmUpIHJldHVybjsgICAgXHJcblxyXG4gICAgLy8gY2FsY3VsYXRlIHRoZSBuZXcgY3Vyc29yIHBvc2l0aW9uOlxyXG4gICAgbGV0IGRlbHRhWCA9IHRoaXMuX19tb3ZhYmxlLmxhc3RYIC0gZS5jbGllbnRYO1xyXG4gICAgbGV0IGRlbHRhWSA9IHRoaXMuX19tb3ZhYmxlLmxhc3RZIC0gZS5jbGllbnRZO1xyXG4gICAgdGhpcy5fX21vdmFibGUubGFzdFggPSBlLmNsaWVudFg7XHJcbiAgICB0aGlzLl9fbW92YWJsZS5sYXN0WSA9IGUuY2xpZW50WTtcclxuICAgIFxyXG4gICAgLy8gc2V0IHRoZSBlbGVtZW50J3MgbmV3IHBvc2l0aW9uOlxyXG4gICAgdGhpcy5zdHlsZS50b3AgPSAodGhpcy5vZmZzZXRUb3AgLSBkZWx0YVkpICsgXCJweFwiO1xyXG4gICAgdGhpcy5zdHlsZS5sZWZ0ID0gKHRoaXMub2Zmc2V0TGVmdCAtIGRlbHRhWCkgKyBcInB4XCI7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uTW91c2VEb3duKGUpe1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdGhpcy5fX21vdmFibGUuYWN0aXZlID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgLy8gZ2V0IHRoZSBtb3VzZSBjdXJzb3IgcG9zaXRpb24gYXQgc3RhcnR1cDpcclxuICAgIHRoaXMuX19tb3ZhYmxlLmxhc3RYID0gZS5jbGllbnRYO1xyXG4gICAgdGhpcy5fX21vdmFibGUubGFzdFkgPSBlLmNsaWVudFk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uTW91c2VVcChlKXtcclxuICAgIHRoaXMuX19tb3ZhYmxlLmFjdGl2ZSA9IGZhbHNlO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XHJcbiAgICBuaWRnZXQuX19tb3ZhYmxlID0ge1xyXG4gICAgICAgIGxhc3RYIDogMCxcclxuICAgICAgICBsYXN0WSA6IDAsXHJcbiAgICAgICAgYWN0aXZlIDogZmFsc2VcclxuICAgIH07XHJcbiAgICBcclxuICAgIG5pZGdldC5vbk1vdXNlRG93biA9IG9uTW91c2VEb3duLmJpbmQobmlkZ2V0KTsgICAgICAgIFxyXG4gICAgXHJcbiAgICBpZiAobmlkZ2V0LnF1ZXJ5U2VsZWN0b3IoXCIubmlkZ2V0LWhlYWRlclwiKSl7XHJcbiAgICAgICAgbmlkZ2V0LnF1ZXJ5U2VsZWN0b3IoXCIubmlkZ2V0LWhlYWRlclwiKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIG5pZGdldC5vbk1vdXNlRG93bik7ICAgICAgICBcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmlkZ2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgbmlkZ2V0Lm9uTW91c2VEb3duKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbmlkZ2V0Lm9uTW91c2VNb3ZlID0gb25Nb3VzZU1vdmUuYmluZChuaWRnZXQpOyAgICBcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG5pZGdldC5vbk1vdXNlTW92ZSk7XHJcblxyXG4gICAgbmlkZ2V0Lm9uTW91c2VVcCA9IG9uTW91c2VVcC5iaW5kKG5pZGdldCk7ICAgIFxyXG4gICAgbmlkZ2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG5pZGdldC5vbk1vdXNlVXApO1xyXG5cclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIi4uL05pZGdldFwiKTtcclxud2luZG93Lk5pZGdldCA9IE5pZGdldDtcclxuXHJcbi8qKlxyXG4gKiBBZGQgYSByZXNpemUgb2JzZXJ2ZXIgdG8gdGhlIGVsZW1lbnQgdGhhdCB3aWxsIGNhbGwgYSBvblJlc2l6ZSgpIGZ1bmN0aW9uLlxyXG4gKiBUaGUgcGFyYW1ldGVycyBwYXNzZWQgaW4gYXJlIChwcmV2aW91c19kaW1lbnNpb25zKS4gIFRvIHVzZSBhZGRcclxuICogaW50ZXJmYWNlcz1cInJlc2l6ZVwiIHRvIHRoZSBlbGVtZW50IGluIGh0bWwgYW5kIGEgbWV0aG9kIG9uUmVzaXplKCkgdG8gdGhlIFxyXG4gKiBjbGFzcyBvYmplY3QuICBJZiB0aGVyZSBpcyBubyBjbGFzcyBvYmplY3QgY3JlYXRlIGEgZnVuY3Rpb24gYW5kIGJpbmQgaXQuXHJcbiAqIGllOiBlbGVtZW50Lm9uUmVzaXplID0gZnVuY3Rpb24uYmluZChlbGVtZW50KTsgXHJcbiAqL1xyXG5cclxubGV0IG9uUmVzaXplID0gZnVuY3Rpb24oKXtcclxuICAgIGxldCBkYXRhID0gdGhpc1tOaWRnZXQuaW50ZXJmYWNlRGF0YUZpZWxkXS5yZXNpemU7XHJcbiAgICBsZXQgcHJldiA9IGRhdGEucHJldjtcclxuICAgIGlmICghdGhpcy5vblJlc2l6ZSkgcmV0dXJuO1xyXG4gICAgdGhpcy5vblJlc2l6ZShwcmV2KTtcclxuICAgIGxvYWRQcmV2aW91cyh0aGlzKTtcclxufTtcclxuXHJcbmxldCBsb2FkUHJldmlvdXMgPSBmdW5jdGlvbihuaWRnZXQpe1xyXG4gICAgbGV0IGRhdGEgPSBuaWRnZXRbTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZF0ucmVzaXplO1xyXG4gICAgZGF0YS5wcmV2ID0ge1xyXG4gICAgICAgIHdpZHRoIDogbmlkZ2V0Lm9mZnNldFdpZHRoLFxyXG4gICAgICAgIGhlaWdodCA6IG5pZGdldC5vZmZzZXRIZWlnaHRcclxuICAgIH07ICAgIFxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldHVwIGEgcmVzaXplIG9ic2VydmVyIGZvciB0aGUgbmlkZ2V0IHRoYXQgdHJpZ2dlcnMgdGhlIG9uUmVzaXplIG1ldGhvZCBpZiBcclxuICogYXZhaWxhYmxlLlxyXG4gKiAtIG9uUmVzaXplKHRoaXMsIHByZXZpb3VzX2RpbWVuc2lvbnMpIDogbm9uZVxyXG4gKiBAcGFyYW0ge3R5cGV9IG5pZGdldFxyXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XHJcbiAgICBpZiAodHlwZW9mKG5pZGdldCkgIT09IFwib2JqZWN0XCIpIHRocm93IG5ldyBcIk9iamVjdCBleGVjdGVkXCI7XHJcbiAgICBsZXQgcmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUuYmluZChuaWRnZXQpKTtcclxuICAgIHJlc2l6ZU9ic2VydmVyLm9ic2VydmUobmlkZ2V0KTtcclxuICAgIGxvYWRQcmV2aW91cyhuaWRnZXQpO1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBBYnN0cmFjdE1vZGVsIDogcmVxdWlyZShcIi4vQWJzdHJhY3RNb2RlbFwiKSxcclxuICAgIE5pZGdldEVsZW1lbnQgOiByZXF1aXJlKFwiLi9OaWRnZXRFbGVtZW50XCIpLFxyXG4gICAgRmlsZU9wZXJhdGlvbnMgOiByZXF1aXJlKFwiLi9GaWxlT3BlcmF0aW9uc1wiKSxcclxuICAgIE5pZGdldEJ1dHRvblNldCA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblNldFwiKSxcclxuICAgIE5pZGdldEJ1dHRvbiA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblwiKSxcclxuICAgIE5pZGdldEJ1dHRvblN0YXRlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU3RhdGVcIiksXHJcbiAgICBOaWRnZXRJbWFnZSA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEltYWdlXCIpLFxyXG4gICAgTmlkZ2V0SFRNTEltYWdlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SFRNTEltYWdlXCIpLFxyXG4gICAgTmlkZ2V0VGV4dCA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldFRleHRcIiksXHJcbiAgICBOaWRnZXRDb250YWluZXIgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRDb250YWluZXJcIiksXHJcbiAgICBNb3VzZVV0aWxpdGllcyA6IHJlcXVpcmUoXCIuL01vdXNlVXRpbGl0aWVzXCIpLFxyXG4gICAgQ29uc3RhbnRzOiByZXF1aXJlKFwiLi9OaWRnZXRcIiksXHJcbiAgICBsYXlvdXRzOiB7fVxyXG59OyIsImZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikge1xuICBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIHNlbGY7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2Fzc2VydFRoaXNJbml0aWFsaXplZDtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIGtleSwgYXJnKSB7XG4gIHRyeSB7XG4gICAgdmFyIGluZm8gPSBnZW5ba2V5XShhcmcpO1xuICAgIHZhciB2YWx1ZSA9IGluZm8udmFsdWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmVqZWN0KGVycm9yKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoaW5mby5kb25lKSB7XG4gICAgcmVzb2x2ZSh2YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKF9uZXh0LCBfdGhyb3cpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9hc3luY1RvR2VuZXJhdG9yKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgZ2VuID0gZm4uYXBwbHkoc2VsZiwgYXJncyk7XG5cbiAgICAgIGZ1bmN0aW9uIF9uZXh0KHZhbHVlKSB7XG4gICAgICAgIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywgXCJuZXh0XCIsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gX3Rocm93KGVycikge1xuICAgICAgICBhc3luY0dlbmVyYXRvclN0ZXAoZ2VuLCByZXNvbHZlLCByZWplY3QsIF9uZXh0LCBfdGhyb3csIFwidGhyb3dcIiwgZXJyKTtcbiAgICAgIH1cblxuICAgICAgX25leHQodW5kZWZpbmVkKTtcbiAgICB9KTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXN5bmNUb0dlbmVyYXRvcjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9jbGFzc0NhbGxDaGVjaztcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJ2YXIgc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiLi9zZXRQcm90b3R5cGVPZi5qc1wiKTtcblxudmFyIGlzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCA9IHJlcXVpcmUoXCIuL2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdC5qc1wiKTtcblxuZnVuY3Rpb24gX2NvbnN0cnVjdChQYXJlbnQsIGFyZ3MsIENsYXNzKSB7XG4gIGlmIChpc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX2NvbnN0cnVjdCA9IFJlZmxlY3QuY29uc3RydWN0O1xuICAgIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9jb25zdHJ1Y3QgPSBmdW5jdGlvbiBfY29uc3RydWN0KFBhcmVudCwgYXJncywgQ2xhc3MpIHtcbiAgICAgIHZhciBhID0gW251bGxdO1xuICAgICAgYS5wdXNoLmFwcGx5KGEsIGFyZ3MpO1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gRnVuY3Rpb24uYmluZC5hcHBseShQYXJlbnQsIGEpO1xuICAgICAgdmFyIGluc3RhbmNlID0gbmV3IENvbnN0cnVjdG9yKCk7XG4gICAgICBpZiAoQ2xhc3MpIHNldFByb3RvdHlwZU9mKGluc3RhbmNlLCBDbGFzcy5wcm90b3R5cGUpO1xuICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH07XG5cbiAgICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIH1cblxuICByZXR1cm4gX2NvbnN0cnVjdC5hcHBseShudWxsLCBhcmd1bWVudHMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9jb25zdHJ1Y3Q7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gIGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgcmV0dXJuIENvbnN0cnVjdG9yO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9jcmVhdGVDbGFzcztcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJ2YXIgc3VwZXJQcm9wQmFzZSA9IHJlcXVpcmUoXCIuL3N1cGVyUHJvcEJhc2UuanNcIik7XG5cbmZ1bmN0aW9uIF9nZXQodGFyZ2V0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgaWYgKHR5cGVvZiBSZWZsZWN0ICE9PSBcInVuZGVmaW5lZFwiICYmIFJlZmxlY3QuZ2V0KSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfZ2V0ID0gUmVmbGVjdC5nZXQ7XG4gICAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX2dldCA9IGZ1bmN0aW9uIF9nZXQodGFyZ2V0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgICAgIHZhciBiYXNlID0gc3VwZXJQcm9wQmFzZSh0YXJnZXQsIHByb3BlcnR5KTtcbiAgICAgIGlmICghYmFzZSkgcmV0dXJuO1xuICAgICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGJhc2UsIHByb3BlcnR5KTtcblxuICAgICAgaWYgKGRlc2MuZ2V0KSB7XG4gICAgICAgIHJldHVybiBkZXNjLmdldC5jYWxsKHJlY2VpdmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlc2MudmFsdWU7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBfZ2V0KHRhcmdldCwgcHJvcGVydHksIHJlY2VpdmVyIHx8IHRhcmdldCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2dldDtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2Yobykge1xuICBtb2R1bGUuZXhwb3J0cyA9IF9nZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5nZXRQcm90b3R5cGVPZiA6IGZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7XG4gICAgcmV0dXJuIG8uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihvKTtcbiAgfTtcbiAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICByZXR1cm4gX2dldFByb3RvdHlwZU9mKG8pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9nZXRQcm90b3R5cGVPZjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJ2YXIgc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiLi9zZXRQcm90b3R5cGVPZi5qc1wiKTtcblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb25cIik7XG4gIH1cblxuICBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuICBpZiAoc3VwZXJDbGFzcykgc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pbmhlcml0cztcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikge1xuICByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDoge1xuICAgIFwiZGVmYXVsdFwiOiBvYmpcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0O1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9pc05hdGl2ZUZ1bmN0aW9uKGZuKSB7XG4gIHJldHVybiBGdW5jdGlvbi50b1N0cmluZy5jYWxsKGZuKS5pbmRleE9mKFwiW25hdGl2ZSBjb2RlXVwiKSAhPT0gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2lzTmF0aXZlRnVuY3Rpb247XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpIHtcbiAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcInVuZGVmaW5lZFwiIHx8ICFSZWZsZWN0LmNvbnN0cnVjdCkgcmV0dXJuIGZhbHNlO1xuICBpZiAoUmVmbGVjdC5jb25zdHJ1Y3Quc2hhbSkgcmV0dXJuIGZhbHNlO1xuICBpZiAodHlwZW9mIFByb3h5ID09PSBcImZ1bmN0aW9uXCIpIHJldHVybiB0cnVlO1xuXG4gIHRyeSB7XG4gICAgQm9vbGVhbi5wcm90b3R5cGUudmFsdWVPZi5jYWxsKFJlZmxlY3QuY29uc3RydWN0KEJvb2xlYW4sIFtdLCBmdW5jdGlvbiAoKSB7fSkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdDtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJ2YXIgX3R5cGVvZiA9IHJlcXVpcmUoXCJAYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZlwiKVtcImRlZmF1bHRcIl07XG5cbnZhciBhc3NlcnRUaGlzSW5pdGlhbGl6ZWQgPSByZXF1aXJlKFwiLi9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQuanNcIik7XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHtcbiAgaWYgKGNhbGwgJiYgKF90eXBlb2YoY2FsbCkgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikpIHtcbiAgICByZXR1cm4gY2FsbDtcbiAgfVxuXG4gIHJldHVybiBhc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm47XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBfc2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHtcbiAgICBvLl9fcHJvdG9fXyA9IHA7XG4gICAgcmV0dXJuIG87XG4gIH07XG5cbiAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9zZXRQcm90b3R5cGVPZjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJ2YXIgZ2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiLi9nZXRQcm90b3R5cGVPZi5qc1wiKTtcblxuZnVuY3Rpb24gX3N1cGVyUHJvcEJhc2Uob2JqZWN0LCBwcm9wZXJ0eSkge1xuICB3aGlsZSAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSkge1xuICAgIG9iamVjdCA9IGdldFByb3RvdHlwZU9mKG9iamVjdCk7XG4gICAgaWYgKG9iamVjdCA9PT0gbnVsbCkgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gb2JqZWN0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9zdXBlclByb3BCYXNlO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gIFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjtcblxuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmo7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBfdHlwZW9mKG9iaik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3R5cGVvZjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJ2YXIgZ2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiLi9nZXRQcm90b3R5cGVPZi5qc1wiKTtcblxudmFyIHNldFByb3RvdHlwZU9mID0gcmVxdWlyZShcIi4vc2V0UHJvdG90eXBlT2YuanNcIik7XG5cbnZhciBpc05hdGl2ZUZ1bmN0aW9uID0gcmVxdWlyZShcIi4vaXNOYXRpdmVGdW5jdGlvbi5qc1wiKTtcblxudmFyIGNvbnN0cnVjdCA9IHJlcXVpcmUoXCIuL2NvbnN0cnVjdC5qc1wiKTtcblxuZnVuY3Rpb24gX3dyYXBOYXRpdmVTdXBlcihDbGFzcykge1xuICB2YXIgX2NhY2hlID0gdHlwZW9mIE1hcCA9PT0gXCJmdW5jdGlvblwiID8gbmV3IE1hcCgpIDogdW5kZWZpbmVkO1xuXG4gIG1vZHVsZS5leHBvcnRzID0gX3dyYXBOYXRpdmVTdXBlciA9IGZ1bmN0aW9uIF93cmFwTmF0aXZlU3VwZXIoQ2xhc3MpIHtcbiAgICBpZiAoQ2xhc3MgPT09IG51bGwgfHwgIWlzTmF0aXZlRnVuY3Rpb24oQ2xhc3MpKSByZXR1cm4gQ2xhc3M7XG5cbiAgICBpZiAodHlwZW9mIENsYXNzICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIF9jYWNoZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKF9jYWNoZS5oYXMoQ2xhc3MpKSByZXR1cm4gX2NhY2hlLmdldChDbGFzcyk7XG5cbiAgICAgIF9jYWNoZS5zZXQoQ2xhc3MsIFdyYXBwZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIFdyYXBwZXIoKSB7XG4gICAgICByZXR1cm4gY29uc3RydWN0KENsYXNzLCBhcmd1bWVudHMsIGdldFByb3RvdHlwZU9mKHRoaXMpLmNvbnN0cnVjdG9yKTtcbiAgICB9XG5cbiAgICBXcmFwcGVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogV3JhcHBlcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc2V0UHJvdG90eXBlT2YoV3JhcHBlciwgQ2xhc3MpO1xuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgcmV0dXJuIF93cmFwTmF0aXZlU3VwZXIoQ2xhc3MpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF93cmFwTmF0aXZlU3VwZXI7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicmVnZW5lcmF0b3ItcnVudGltZVwiKTtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDE0LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxudmFyIHJ1bnRpbWUgPSAoZnVuY3Rpb24gKGV4cG9ydHMpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIE9wID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIGhhc093biA9IE9wLmhhc093blByb3BlcnR5O1xuICB2YXIgdW5kZWZpbmVkOyAvLyBNb3JlIGNvbXByZXNzaWJsZSB0aGFuIHZvaWQgMC5cbiAgdmFyICRTeW1ib2wgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgPyBTeW1ib2wgOiB7fTtcbiAgdmFyIGl0ZXJhdG9yU3ltYm9sID0gJFN5bWJvbC5pdGVyYXRvciB8fCBcIkBAaXRlcmF0b3JcIjtcbiAgdmFyIGFzeW5jSXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLmFzeW5jSXRlcmF0b3IgfHwgXCJAQGFzeW5jSXRlcmF0b3JcIjtcbiAgdmFyIHRvU3RyaW5nVGFnU3ltYm9sID0gJFN5bWJvbC50b1N0cmluZ1RhZyB8fCBcIkBAdG9TdHJpbmdUYWdcIjtcblxuICBmdW5jdGlvbiBkZWZpbmUob2JqLCBrZXksIHZhbHVlKSB7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7XG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqW2tleV07XG4gIH1cbiAgdHJ5IHtcbiAgICAvLyBJRSA4IGhhcyBhIGJyb2tlbiBPYmplY3QuZGVmaW5lUHJvcGVydHkgdGhhdCBvbmx5IHdvcmtzIG9uIERPTSBvYmplY3RzLlxuICAgIGRlZmluZSh7fSwgXCJcIik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGRlZmluZSA9IGZ1bmN0aW9uKG9iaiwga2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIG9ialtrZXldID0gdmFsdWU7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICAvLyBJZiBvdXRlckZuIHByb3ZpZGVkIGFuZCBvdXRlckZuLnByb3RvdHlwZSBpcyBhIEdlbmVyYXRvciwgdGhlbiBvdXRlckZuLnByb3RvdHlwZSBpbnN0YW5jZW9mIEdlbmVyYXRvci5cbiAgICB2YXIgcHJvdG9HZW5lcmF0b3IgPSBvdXRlckZuICYmIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yID8gb3V0ZXJGbiA6IEdlbmVyYXRvcjtcbiAgICB2YXIgZ2VuZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShwcm90b0dlbmVyYXRvci5wcm90b3R5cGUpO1xuICAgIHZhciBjb250ZXh0ID0gbmV3IENvbnRleHQodHJ5TG9jc0xpc3QgfHwgW10pO1xuXG4gICAgLy8gVGhlIC5faW52b2tlIG1ldGhvZCB1bmlmaWVzIHRoZSBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcy5cbiAgICBnZW5lcmF0b3IuX2ludm9rZSA9IG1ha2VJbnZva2VNZXRob2QoaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG5cbiAgICByZXR1cm4gZ2VuZXJhdG9yO1xuICB9XG4gIGV4cG9ydHMud3JhcCA9IHdyYXA7XG5cbiAgLy8gVHJ5L2NhdGNoIGhlbHBlciB0byBtaW5pbWl6ZSBkZW9wdGltaXphdGlvbnMuIFJldHVybnMgYSBjb21wbGV0aW9uXG4gIC8vIHJlY29yZCBsaWtlIGNvbnRleHQudHJ5RW50cmllc1tpXS5jb21wbGV0aW9uLiBUaGlzIGludGVyZmFjZSBjb3VsZFxuICAvLyBoYXZlIGJlZW4gKGFuZCB3YXMgcHJldmlvdXNseSkgZGVzaWduZWQgdG8gdGFrZSBhIGNsb3N1cmUgdG8gYmVcbiAgLy8gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50cywgYnV0IGluIGFsbCB0aGUgY2FzZXMgd2UgY2FyZSBhYm91dCB3ZVxuICAvLyBhbHJlYWR5IGhhdmUgYW4gZXhpc3RpbmcgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCwgc28gdGhlcmUncyBubyBuZWVkXG4gIC8vIHRvIGNyZWF0ZSBhIG5ldyBmdW5jdGlvbiBvYmplY3QuIFdlIGNhbiBldmVuIGdldCBhd2F5IHdpdGggYXNzdW1pbmdcbiAgLy8gdGhlIG1ldGhvZCB0YWtlcyBleGFjdGx5IG9uZSBhcmd1bWVudCwgc2luY2UgdGhhdCBoYXBwZW5zIHRvIGJlIHRydWVcbiAgLy8gaW4gZXZlcnkgY2FzZSwgc28gd2UgZG9uJ3QgaGF2ZSB0byB0b3VjaCB0aGUgYXJndW1lbnRzIG9iamVjdC4gVGhlXG4gIC8vIG9ubHkgYWRkaXRpb25hbCBhbGxvY2F0aW9uIHJlcXVpcmVkIGlzIHRoZSBjb21wbGV0aW9uIHJlY29yZCwgd2hpY2hcbiAgLy8gaGFzIGEgc3RhYmxlIHNoYXBlIGFuZCBzbyBob3BlZnVsbHkgc2hvdWxkIGJlIGNoZWFwIHRvIGFsbG9jYXRlLlxuICBmdW5jdGlvbiB0cnlDYXRjaChmbiwgb2JqLCBhcmcpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJub3JtYWxcIiwgYXJnOiBmbi5jYWxsKG9iaiwgYXJnKSB9O1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHsgdHlwZTogXCJ0aHJvd1wiLCBhcmc6IGVyciB9O1xuICAgIH1cbiAgfVxuXG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0ID0gXCJzdXNwZW5kZWRTdGFydFwiO1xuICB2YXIgR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCA9IFwic3VzcGVuZGVkWWllbGRcIjtcbiAgdmFyIEdlblN0YXRlRXhlY3V0aW5nID0gXCJleGVjdXRpbmdcIjtcbiAgdmFyIEdlblN0YXRlQ29tcGxldGVkID0gXCJjb21wbGV0ZWRcIjtcblxuICAvLyBSZXR1cm5pbmcgdGhpcyBvYmplY3QgZnJvbSB0aGUgaW5uZXJGbiBoYXMgdGhlIHNhbWUgZWZmZWN0IGFzXG4gIC8vIGJyZWFraW5nIG91dCBvZiB0aGUgZGlzcGF0Y2ggc3dpdGNoIHN0YXRlbWVudC5cbiAgdmFyIENvbnRpbnVlU2VudGluZWwgPSB7fTtcblxuICAvLyBEdW1teSBjb25zdHJ1Y3RvciBmdW5jdGlvbnMgdGhhdCB3ZSB1c2UgYXMgdGhlIC5jb25zdHJ1Y3RvciBhbmRcbiAgLy8gLmNvbnN0cnVjdG9yLnByb3RvdHlwZSBwcm9wZXJ0aWVzIGZvciBmdW5jdGlvbnMgdGhhdCByZXR1cm4gR2VuZXJhdG9yXG4gIC8vIG9iamVjdHMuIEZvciBmdWxsIHNwZWMgY29tcGxpYW5jZSwgeW91IG1heSB3aXNoIHRvIGNvbmZpZ3VyZSB5b3VyXG4gIC8vIG1pbmlmaWVyIG5vdCB0byBtYW5nbGUgdGhlIG5hbWVzIG9mIHRoZXNlIHR3byBmdW5jdGlvbnMuXG4gIGZ1bmN0aW9uIEdlbmVyYXRvcigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUoKSB7fVxuXG4gIC8vIFRoaXMgaXMgYSBwb2x5ZmlsbCBmb3IgJUl0ZXJhdG9yUHJvdG90eXBlJSBmb3IgZW52aXJvbm1lbnRzIHRoYXRcbiAgLy8gZG9uJ3QgbmF0aXZlbHkgc3VwcG9ydCBpdC5cbiAgdmFyIEl0ZXJhdG9yUHJvdG90eXBlID0ge307XG4gIEl0ZXJhdG9yUHJvdG90eXBlW2l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB2YXIgZ2V0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG4gIHZhciBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSA9IGdldFByb3RvICYmIGdldFByb3RvKGdldFByb3RvKHZhbHVlcyhbXSkpKTtcbiAgaWYgKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICYmXG4gICAgICBOYXRpdmVJdGVyYXRvclByb3RvdHlwZSAhPT0gT3AgJiZcbiAgICAgIGhhc093bi5jYWxsKE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlLCBpdGVyYXRvclN5bWJvbCkpIHtcbiAgICAvLyBUaGlzIGVudmlyb25tZW50IGhhcyBhIG5hdGl2ZSAlSXRlcmF0b3JQcm90b3R5cGUlOyB1c2UgaXQgaW5zdGVhZFxuICAgIC8vIG9mIHRoZSBwb2x5ZmlsbC5cbiAgICBJdGVyYXRvclByb3RvdHlwZSA9IE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlO1xuICB9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID1cbiAgICBHZW5lcmF0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSk7XG4gIEdlbmVyYXRvckZ1bmN0aW9uLnByb3RvdHlwZSA9IEdwLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gR2VuZXJhdG9yRnVuY3Rpb247XG4gIEdlbmVyYXRvckZ1bmN0aW9uLmRpc3BsYXlOYW1lID0gZGVmaW5lKFxuICAgIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLFxuICAgIHRvU3RyaW5nVGFnU3ltYm9sLFxuICAgIFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICApO1xuXG4gIC8vIEhlbHBlciBmb3IgZGVmaW5pbmcgdGhlIC5uZXh0LCAudGhyb3csIGFuZCAucmV0dXJuIG1ldGhvZHMgb2YgdGhlXG4gIC8vIEl0ZXJhdG9yIGludGVyZmFjZSBpbiB0ZXJtcyBvZiBhIHNpbmdsZSAuX2ludm9rZSBtZXRob2QuXG4gIGZ1bmN0aW9uIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhwcm90b3R5cGUpIHtcbiAgICBbXCJuZXh0XCIsIFwidGhyb3dcIiwgXCJyZXR1cm5cIl0uZm9yRWFjaChmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgIGRlZmluZShwcm90b3R5cGUsIG1ldGhvZCwgZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pbnZva2UobWV0aG9kLCBhcmcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBleHBvcnRzLmlzR2VuZXJhdG9yRnVuY3Rpb24gPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICB2YXIgY3RvciA9IHR5cGVvZiBnZW5GdW4gPT09IFwiZnVuY3Rpb25cIiAmJiBnZW5GdW4uY29uc3RydWN0b3I7XG4gICAgcmV0dXJuIGN0b3JcbiAgICAgID8gY3RvciA9PT0gR2VuZXJhdG9yRnVuY3Rpb24gfHxcbiAgICAgICAgLy8gRm9yIHRoZSBuYXRpdmUgR2VuZXJhdG9yRnVuY3Rpb24gY29uc3RydWN0b3IsIHRoZSBiZXN0IHdlIGNhblxuICAgICAgICAvLyBkbyBpcyB0byBjaGVjayBpdHMgLm5hbWUgcHJvcGVydHkuXG4gICAgICAgIChjdG9yLmRpc3BsYXlOYW1lIHx8IGN0b3IubmFtZSkgPT09IFwiR2VuZXJhdG9yRnVuY3Rpb25cIlxuICAgICAgOiBmYWxzZTtcbiAgfTtcblxuICBleHBvcnRzLm1hcmsgPSBmdW5jdGlvbihnZW5GdW4pIHtcbiAgICBpZiAoT2JqZWN0LnNldFByb3RvdHlwZU9mKSB7XG4gICAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YoZ2VuRnVuLCBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdlbkZ1bi5fX3Byb3RvX18gPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgICAgIGRlZmluZShnZW5GdW4sIHRvU3RyaW5nVGFnU3ltYm9sLCBcIkdlbmVyYXRvckZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgICBnZW5GdW4ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHcCk7XG4gICAgcmV0dXJuIGdlbkZ1bjtcbiAgfTtcblxuICAvLyBXaXRoaW4gdGhlIGJvZHkgb2YgYW55IGFzeW5jIGZ1bmN0aW9uLCBgYXdhaXQgeGAgaXMgdHJhbnNmb3JtZWQgdG9cbiAgLy8gYHlpZWxkIHJlZ2VuZXJhdG9yUnVudGltZS5hd3JhcCh4KWAsIHNvIHRoYXQgdGhlIHJ1bnRpbWUgY2FuIHRlc3RcbiAgLy8gYGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIilgIHRvIGRldGVybWluZSBpZiB0aGUgeWllbGRlZCB2YWx1ZSBpc1xuICAvLyBtZWFudCB0byBiZSBhd2FpdGVkLlxuICBleHBvcnRzLmF3cmFwID0gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIHsgX19hd2FpdDogYXJnIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gQXN5bmNJdGVyYXRvcihnZW5lcmF0b3IsIFByb21pc2VJbXBsKSB7XG4gICAgZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChnZW5lcmF0b3JbbWV0aG9kXSwgZ2VuZXJhdG9yLCBhcmcpO1xuICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgcmVqZWN0KHJlY29yZC5hcmcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHJlY29yZC5hcmc7XG4gICAgICAgIHZhciB2YWx1ZSA9IHJlc3VsdC52YWx1ZTtcbiAgICAgICAgaWYgKHZhbHVlICYmXG4gICAgICAgICAgICB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKHZhbHVlLCBcIl9fYXdhaXRcIikpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZUltcGwucmVzb2x2ZSh2YWx1ZS5fX2F3YWl0KS50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJuZXh0XCIsIHZhbHVlLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgaW52b2tlKFwidGhyb3dcIiwgZXJyLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2VJbXBsLnJlc29sdmUodmFsdWUpLnRoZW4oZnVuY3Rpb24odW53cmFwcGVkKSB7XG4gICAgICAgICAgLy8gV2hlbiBhIHlpZWxkZWQgUHJvbWlzZSBpcyByZXNvbHZlZCwgaXRzIGZpbmFsIHZhbHVlIGJlY29tZXNcbiAgICAgICAgICAvLyB0aGUgLnZhbHVlIG9mIHRoZSBQcm9taXNlPHt2YWx1ZSxkb25lfT4gcmVzdWx0IGZvciB0aGVcbiAgICAgICAgICAvLyBjdXJyZW50IGl0ZXJhdGlvbi5cbiAgICAgICAgICByZXN1bHQudmFsdWUgPSB1bndyYXBwZWQ7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIC8vIElmIGEgcmVqZWN0ZWQgUHJvbWlzZSB3YXMgeWllbGRlZCwgdGhyb3cgdGhlIHJlamVjdGlvbiBiYWNrXG4gICAgICAgICAgLy8gaW50byB0aGUgYXN5bmMgZ2VuZXJhdG9yIGZ1bmN0aW9uIHNvIGl0IGNhbiBiZSBoYW5kbGVkIHRoZXJlLlxuICAgICAgICAgIHJldHVybiBpbnZva2UoXCJ0aHJvd1wiLCBlcnJvciwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHByZXZpb3VzUHJvbWlzZTtcblxuICAgIGZ1bmN0aW9uIGVucXVldWUobWV0aG9kLCBhcmcpIHtcbiAgICAgIGZ1bmN0aW9uIGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2VJbXBsKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGludm9rZShtZXRob2QsIGFyZywgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcmV2aW91c1Byb21pc2UgPVxuICAgICAgICAvLyBJZiBlbnF1ZXVlIGhhcyBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gd2Ugd2FudCB0byB3YWl0IHVudGlsXG4gICAgICAgIC8vIGFsbCBwcmV2aW91cyBQcm9taXNlcyBoYXZlIGJlZW4gcmVzb2x2ZWQgYmVmb3JlIGNhbGxpbmcgaW52b2tlLFxuICAgICAgICAvLyBzbyB0aGF0IHJlc3VsdHMgYXJlIGFsd2F5cyBkZWxpdmVyZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIuIElmXG4gICAgICAgIC8vIGVucXVldWUgaGFzIG5vdCBiZWVuIGNhbGxlZCBiZWZvcmUsIHRoZW4gaXQgaXMgaW1wb3J0YW50IHRvXG4gICAgICAgIC8vIGNhbGwgaW52b2tlIGltbWVkaWF0ZWx5LCB3aXRob3V0IHdhaXRpbmcgb24gYSBjYWxsYmFjayB0byBmaXJlLFxuICAgICAgICAvLyBzbyB0aGF0IHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gaGFzIHRoZSBvcHBvcnR1bml0eSB0byBkb1xuICAgICAgICAvLyBhbnkgbmVjZXNzYXJ5IHNldHVwIGluIGEgcHJlZGljdGFibGUgd2F5LiBUaGlzIHByZWRpY3RhYmlsaXR5XG4gICAgICAgIC8vIGlzIHdoeSB0aGUgUHJvbWlzZSBjb25zdHJ1Y3RvciBzeW5jaHJvbm91c2x5IGludm9rZXMgaXRzXG4gICAgICAgIC8vIGV4ZWN1dG9yIGNhbGxiYWNrLCBhbmQgd2h5IGFzeW5jIGZ1bmN0aW9ucyBzeW5jaHJvbm91c2x5XG4gICAgICAgIC8vIGV4ZWN1dGUgY29kZSBiZWZvcmUgdGhlIGZpcnN0IGF3YWl0LiBTaW5jZSB3ZSBpbXBsZW1lbnQgc2ltcGxlXG4gICAgICAgIC8vIGFzeW5jIGZ1bmN0aW9ucyBpbiB0ZXJtcyBvZiBhc3luYyBnZW5lcmF0b3JzLCBpdCBpcyBlc3BlY2lhbGx5XG4gICAgICAgIC8vIGltcG9ydGFudCB0byBnZXQgdGhpcyByaWdodCwgZXZlbiB0aG91Z2ggaXQgcmVxdWlyZXMgY2FyZS5cbiAgICAgICAgcHJldmlvdXNQcm9taXNlID8gcHJldmlvdXNQcm9taXNlLnRoZW4oXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcsXG4gICAgICAgICAgLy8gQXZvaWQgcHJvcGFnYXRpbmcgZmFpbHVyZXMgdG8gUHJvbWlzZXMgcmV0dXJuZWQgYnkgbGF0ZXJcbiAgICAgICAgICAvLyBpbnZvY2F0aW9ucyBvZiB0aGUgaXRlcmF0b3IuXG4gICAgICAgICAgY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmdcbiAgICAgICAgKSA6IGNhbGxJbnZva2VXaXRoTWV0aG9kQW5kQXJnKCk7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSB1bmlmaWVkIGhlbHBlciBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIGltcGxlbWVudCAubmV4dCxcbiAgICAvLyAudGhyb3csIGFuZCAucmV0dXJuIChzZWUgZGVmaW5lSXRlcmF0b3JNZXRob2RzKS5cbiAgICB0aGlzLl9pbnZva2UgPSBlbnF1ZXVlO1xuICB9XG5cbiAgZGVmaW5lSXRlcmF0b3JNZXRob2RzKEFzeW5jSXRlcmF0b3IucHJvdG90eXBlKTtcbiAgQXN5bmNJdGVyYXRvci5wcm90b3R5cGVbYXN5bmNJdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIGV4cG9ydHMuQXN5bmNJdGVyYXRvciA9IEFzeW5jSXRlcmF0b3I7XG5cbiAgLy8gTm90ZSB0aGF0IHNpbXBsZSBhc3luYyBmdW5jdGlvbnMgYXJlIGltcGxlbWVudGVkIG9uIHRvcCBvZlxuICAvLyBBc3luY0l0ZXJhdG9yIG9iamVjdHM7IHRoZXkganVzdCByZXR1cm4gYSBQcm9taXNlIGZvciB0aGUgdmFsdWUgb2ZcbiAgLy8gdGhlIGZpbmFsIHJlc3VsdCBwcm9kdWNlZCBieSB0aGUgaXRlcmF0b3IuXG4gIGV4cG9ydHMuYXN5bmMgPSBmdW5jdGlvbihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCwgUHJvbWlzZUltcGwpIHtcbiAgICBpZiAoUHJvbWlzZUltcGwgPT09IHZvaWQgMCkgUHJvbWlzZUltcGwgPSBQcm9taXNlO1xuXG4gICAgdmFyIGl0ZXIgPSBuZXcgQXN5bmNJdGVyYXRvcihcbiAgICAgIHdyYXAoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpLFxuICAgICAgUHJvbWlzZUltcGxcbiAgICApO1xuXG4gICAgcmV0dXJuIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbihvdXRlckZuKVxuICAgICAgPyBpdGVyIC8vIElmIG91dGVyRm4gaXMgYSBnZW5lcmF0b3IsIHJldHVybiB0aGUgZnVsbCBpdGVyYXRvci5cbiAgICAgIDogaXRlci5uZXh0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmRvbmUgPyByZXN1bHQudmFsdWUgOiBpdGVyLm5leHQoKTtcbiAgICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KSB7XG4gICAgdmFyIHN0YXRlID0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydDtcblxuICAgIHJldHVybiBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcpIHtcbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVFeGVjdXRpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgcnVubmluZ1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUNvbXBsZXRlZCkge1xuICAgICAgICBpZiAobWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICB0aHJvdyBhcmc7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCZSBmb3JnaXZpbmcsIHBlciAyNS4zLjMuMy4zIG9mIHRoZSBzcGVjOlxuICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgIHJldHVybiBkb25lUmVzdWx0KCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnRleHQubWV0aG9kID0gbWV0aG9kO1xuICAgICAgY29udGV4dC5hcmcgPSBhcmc7XG5cbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IGNvbnRleHQuZGVsZWdhdGU7XG4gICAgICAgIGlmIChkZWxlZ2F0ZSkge1xuICAgICAgICAgIHZhciBkZWxlZ2F0ZVJlc3VsdCA9IG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuICAgICAgICAgIGlmIChkZWxlZ2F0ZVJlc3VsdCkge1xuICAgICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0ID09PSBDb250aW51ZVNlbnRpbmVsKSBjb250aW51ZTtcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZVJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgLy8gU2V0dGluZyBjb250ZXh0Ll9zZW50IGZvciBsZWdhY3kgc3VwcG9ydCBvZiBCYWJlbCdzXG4gICAgICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgICAgICBjb250ZXh0LnNlbnQgPSBjb250ZXh0Ll9zZW50ID0gY29udGV4dC5hcmc7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0KSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgICAgdGhyb3cgY29udGV4dC5hcmc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kaXNwYXRjaEV4Y2VwdGlvbihjb250ZXh0LmFyZyk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICAgIGNvbnRleHQuYWJydXB0KFwicmV0dXJuXCIsIGNvbnRleHQuYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lXG4gICAgICAgICAgICA/IEdlblN0YXRlQ29tcGxldGVkXG4gICAgICAgICAgICA6IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG5cbiAgICAgICAgICBpZiAocmVjb3JkLmFyZyA9PT0gQ29udGludWVTZW50aW5lbCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmQuYXJnLFxuICAgICAgICAgICAgZG9uZTogY29udGV4dC5kb25lXG4gICAgICAgICAgfTtcblxuICAgICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgIC8vIERpc3BhdGNoIHRoZSBleGNlcHRpb24gYnkgbG9vcGluZyBiYWNrIGFyb3VuZCB0byB0aGVcbiAgICAgICAgICAvLyBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKSBjYWxsIGFib3ZlLlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gcmVjb3JkLmFyZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBDYWxsIGRlbGVnYXRlLml0ZXJhdG9yW2NvbnRleHQubWV0aG9kXShjb250ZXh0LmFyZykgYW5kIGhhbmRsZSB0aGVcbiAgLy8gcmVzdWx0LCBlaXRoZXIgYnkgcmV0dXJuaW5nIGEgeyB2YWx1ZSwgZG9uZSB9IHJlc3VsdCBmcm9tIHRoZVxuICAvLyBkZWxlZ2F0ZSBpdGVyYXRvciwgb3IgYnkgbW9kaWZ5aW5nIGNvbnRleHQubWV0aG9kIGFuZCBjb250ZXh0LmFyZyxcbiAgLy8gc2V0dGluZyBjb250ZXh0LmRlbGVnYXRlIHRvIG51bGwsIGFuZCByZXR1cm5pbmcgdGhlIENvbnRpbnVlU2VudGluZWwuXG4gIGZ1bmN0aW9uIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgbWV0aG9kID0gZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdO1xuICAgIGlmIChtZXRob2QgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gQSAudGhyb3cgb3IgLnJldHVybiB3aGVuIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgbm8gLnRocm93XG4gICAgICAvLyBtZXRob2QgYWx3YXlzIHRlcm1pbmF0ZXMgdGhlIHlpZWxkKiBsb29wLlxuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIC8vIE5vdGU6IFtcInJldHVyblwiXSBtdXN0IGJlIHVzZWQgZm9yIEVTMyBwYXJzaW5nIGNvbXBhdGliaWxpdHkuXG4gICAgICAgIGlmIChkZWxlZ2F0ZS5pdGVyYXRvcltcInJldHVyblwiXSkge1xuICAgICAgICAgIC8vIElmIHRoZSBkZWxlZ2F0ZSBpdGVyYXRvciBoYXMgYSByZXR1cm4gbWV0aG9kLCBnaXZlIGl0IGFcbiAgICAgICAgICAvLyBjaGFuY2UgdG8gY2xlYW4gdXAuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInJldHVyblwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG1heWJlSW52b2tlRGVsZWdhdGUoZGVsZWdhdGUsIGNvbnRleHQpO1xuXG4gICAgICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIC8vIElmIG1heWJlSW52b2tlRGVsZWdhdGUoY29udGV4dCkgY2hhbmdlZCBjb250ZXh0Lm1ldGhvZCBmcm9tXG4gICAgICAgICAgICAvLyBcInJldHVyblwiIHRvIFwidGhyb3dcIiwgbGV0IHRoYXQgb3ZlcnJpZGUgdGhlIFR5cGVFcnJvciBiZWxvdy5cbiAgICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgXCJUaGUgaXRlcmF0b3IgZG9lcyBub3QgcHJvdmlkZSBhICd0aHJvdycgbWV0aG9kXCIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2gobWV0aG9kLCBkZWxlZ2F0ZS5pdGVyYXRvciwgY29udGV4dC5hcmcpO1xuXG4gICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICB2YXIgaW5mbyA9IHJlY29yZC5hcmc7XG5cbiAgICBpZiAoISBpbmZvKSB7XG4gICAgICBjb250ZXh0Lm1ldGhvZCA9IFwidGhyb3dcIjtcbiAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcIml0ZXJhdG9yIHJlc3VsdCBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG5cbiAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAvLyBBc3NpZ24gdGhlIHJlc3VsdCBvZiB0aGUgZmluaXNoZWQgZGVsZWdhdGUgdG8gdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gdmFyaWFibGUgc3BlY2lmaWVkIGJ5IGRlbGVnYXRlLnJlc3VsdE5hbWUgKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuXG4gICAgICAvLyBSZXN1bWUgZXhlY3V0aW9uIGF0IHRoZSBkZXNpcmVkIGxvY2F0aW9uIChzZWUgZGVsZWdhdGVZaWVsZCkuXG4gICAgICBjb250ZXh0Lm5leHQgPSBkZWxlZ2F0ZS5uZXh0TG9jO1xuXG4gICAgICAvLyBJZiBjb250ZXh0Lm1ldGhvZCB3YXMgXCJ0aHJvd1wiIGJ1dCB0aGUgZGVsZWdhdGUgaGFuZGxlZCB0aGVcbiAgICAgIC8vIGV4Y2VwdGlvbiwgbGV0IHRoZSBvdXRlciBnZW5lcmF0b3IgcHJvY2VlZCBub3JtYWxseS4gSWZcbiAgICAgIC8vIGNvbnRleHQubWV0aG9kIHdhcyBcIm5leHRcIiwgZm9yZ2V0IGNvbnRleHQuYXJnIHNpbmNlIGl0IGhhcyBiZWVuXG4gICAgICAvLyBcImNvbnN1bWVkXCIgYnkgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yLiBJZiBjb250ZXh0Lm1ldGhvZCB3YXNcbiAgICAgIC8vIFwicmV0dXJuXCIsIGFsbG93IHRoZSBvcmlnaW5hbCAucmV0dXJuIGNhbGwgdG8gY29udGludWUgaW4gdGhlXG4gICAgICAvLyBvdXRlciBnZW5lcmF0b3IuXG4gICAgICBpZiAoY29udGV4dC5tZXRob2QgIT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUmUteWllbGQgdGhlIHJlc3VsdCByZXR1cm5lZCBieSB0aGUgZGVsZWdhdGUgbWV0aG9kLlxuICAgICAgcmV0dXJuIGluZm87XG4gICAgfVxuXG4gICAgLy8gVGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGlzIGZpbmlzaGVkLCBzbyBmb3JnZXQgaXQgYW5kIGNvbnRpbnVlIHdpdGhcbiAgICAvLyB0aGUgb3V0ZXIgZ2VuZXJhdG9yLlxuICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICB9XG5cbiAgLy8gRGVmaW5lIEdlbmVyYXRvci5wcm90b3R5cGUue25leHQsdGhyb3cscmV0dXJufSBpbiB0ZXJtcyBvZiB0aGVcbiAgLy8gdW5pZmllZCAuX2ludm9rZSBoZWxwZXIgbWV0aG9kLlxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoR3ApO1xuXG4gIGRlZmluZShHcCwgdG9TdHJpbmdUYWdTeW1ib2wsIFwiR2VuZXJhdG9yXCIpO1xuXG4gIC8vIEEgR2VuZXJhdG9yIHNob3VsZCBhbHdheXMgcmV0dXJuIGl0c2VsZiBhcyB0aGUgaXRlcmF0b3Igb2JqZWN0IHdoZW4gdGhlXG4gIC8vIEBAaXRlcmF0b3IgZnVuY3Rpb24gaXMgY2FsbGVkIG9uIGl0LiBTb21lIGJyb3dzZXJzJyBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlXG4gIC8vIGl0ZXJhdG9yIHByb3RvdHlwZSBjaGFpbiBpbmNvcnJlY3RseSBpbXBsZW1lbnQgdGhpcywgY2F1c2luZyB0aGUgR2VuZXJhdG9yXG4gIC8vIG9iamVjdCB0byBub3QgYmUgcmV0dXJuZWQgZnJvbSB0aGlzIGNhbGwuIFRoaXMgZW5zdXJlcyB0aGF0IGRvZXNuJ3QgaGFwcGVuLlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL3JlZ2VuZXJhdG9yL2lzc3Vlcy8yNzQgZm9yIG1vcmUgZGV0YWlscy5cbiAgR3BbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgR3AudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEdlbmVyYXRvcl1cIjtcbiAgfTtcblxuICBmdW5jdGlvbiBwdXNoVHJ5RW50cnkobG9jcykge1xuICAgIHZhciBlbnRyeSA9IHsgdHJ5TG9jOiBsb2NzWzBdIH07XG5cbiAgICBpZiAoMSBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5jYXRjaExvYyA9IGxvY3NbMV07XG4gICAgfVxuXG4gICAgaWYgKDIgaW4gbG9jcykge1xuICAgICAgZW50cnkuZmluYWxseUxvYyA9IGxvY3NbMl07XG4gICAgICBlbnRyeS5hZnRlckxvYyA9IGxvY3NbM107XG4gICAgfVxuXG4gICAgdGhpcy50cnlFbnRyaWVzLnB1c2goZW50cnkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXRUcnlFbnRyeShlbnRyeSkge1xuICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uIHx8IHt9O1xuICAgIHJlY29yZC50eXBlID0gXCJub3JtYWxcIjtcbiAgICBkZWxldGUgcmVjb3JkLmFyZztcbiAgICBlbnRyeS5jb21wbGV0aW9uID0gcmVjb3JkO1xuICB9XG5cbiAgZnVuY3Rpb24gQ29udGV4dCh0cnlMb2NzTGlzdCkge1xuICAgIC8vIFRoZSByb290IGVudHJ5IG9iamVjdCAoZWZmZWN0aXZlbHkgYSB0cnkgc3RhdGVtZW50IHdpdGhvdXQgYSBjYXRjaFxuICAgIC8vIG9yIGEgZmluYWxseSBibG9jaykgZ2l2ZXMgdXMgYSBwbGFjZSB0byBzdG9yZSB2YWx1ZXMgdGhyb3duIGZyb21cbiAgICAvLyBsb2NhdGlvbnMgd2hlcmUgdGhlcmUgaXMgbm8gZW5jbG9zaW5nIHRyeSBzdGF0ZW1lbnQuXG4gICAgdGhpcy50cnlFbnRyaWVzID0gW3sgdHJ5TG9jOiBcInJvb3RcIiB9XTtcbiAgICB0cnlMb2NzTGlzdC5mb3JFYWNoKHB1c2hUcnlFbnRyeSwgdGhpcyk7XG4gICAgdGhpcy5yZXNldCh0cnVlKTtcbiAgfVxuXG4gIGV4cG9ydHMua2V5cyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgICAga2V5cy5wdXNoKGtleSk7XG4gICAgfVxuICAgIGtleXMucmV2ZXJzZSgpO1xuXG4gICAgLy8gUmF0aGVyIHRoYW4gcmV0dXJuaW5nIGFuIG9iamVjdCB3aXRoIGEgbmV4dCBtZXRob2QsIHdlIGtlZXBcbiAgICAvLyB0aGluZ3Mgc2ltcGxlIGFuZCByZXR1cm4gdGhlIG5leHQgZnVuY3Rpb24gaXRzZWxmLlxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgd2hpbGUgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBrZXkgPSBrZXlzLnBvcCgpO1xuICAgICAgICBpZiAoa2V5IGluIG9iamVjdCkge1xuICAgICAgICAgIG5leHQudmFsdWUgPSBrZXk7XG4gICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVG8gYXZvaWQgY3JlYXRpbmcgYW4gYWRkaXRpb25hbCBvYmplY3QsIHdlIGp1c3QgaGFuZyB0aGUgLnZhbHVlXG4gICAgICAvLyBhbmQgLmRvbmUgcHJvcGVydGllcyBvZmYgdGhlIG5leHQgZnVuY3Rpb24gb2JqZWN0IGl0c2VsZi4gVGhpc1xuICAgICAgLy8gYWxzbyBlbnN1cmVzIHRoYXQgdGhlIG1pbmlmaWVyIHdpbGwgbm90IGFub255bWl6ZSB0aGUgZnVuY3Rpb24uXG4gICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuICAgICAgcmV0dXJuIG5leHQ7XG4gICAgfTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoaXRlcmFibGUpIHtcbiAgICBpZiAoaXRlcmFibGUpIHtcbiAgICAgIHZhciBpdGVyYXRvck1ldGhvZCA9IGl0ZXJhYmxlW2l0ZXJhdG9yU3ltYm9sXTtcbiAgICAgIGlmIChpdGVyYXRvck1ldGhvZCkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JNZXRob2QuY2FsbChpdGVyYWJsZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaXRlcmFibGUubmV4dCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBpdGVyYWJsZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc05hTihpdGVyYWJsZS5sZW5ndGgpKSB7XG4gICAgICAgIHZhciBpID0gLTEsIG5leHQgPSBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBpdGVyYWJsZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChpdGVyYWJsZSwgaSkpIHtcbiAgICAgICAgICAgICAgbmV4dC52YWx1ZSA9IGl0ZXJhYmxlW2ldO1xuICAgICAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbmV4dC52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBuZXh0LmRvbmUgPSB0cnVlO1xuXG4gICAgICAgICAgcmV0dXJuIG5leHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG5leHQubmV4dCA9IG5leHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGFuIGl0ZXJhdG9yIHdpdGggbm8gdmFsdWVzLlxuICAgIHJldHVybiB7IG5leHQ6IGRvbmVSZXN1bHQgfTtcbiAgfVxuICBleHBvcnRzLnZhbHVlcyA9IHZhbHVlcztcblxuICBmdW5jdGlvbiBkb25lUmVzdWx0KCkge1xuICAgIHJldHVybiB7IHZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWUgfTtcbiAgfVxuXG4gIENvbnRleHQucHJvdG90eXBlID0ge1xuICAgIGNvbnN0cnVjdG9yOiBDb250ZXh0LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKHNraXBUZW1wUmVzZXQpIHtcbiAgICAgIHRoaXMucHJldiA9IDA7XG4gICAgICB0aGlzLm5leHQgPSAwO1xuICAgICAgLy8gUmVzZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgIC8vIGZ1bmN0aW9uLnNlbnQgaW1wbGVtZW50YXRpb24uXG4gICAgICB0aGlzLnNlbnQgPSB0aGlzLl9zZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgdGhpcy5tZXRob2QgPSBcIm5leHRcIjtcbiAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuXG4gICAgICB0aGlzLnRyeUVudHJpZXMuZm9yRWFjaChyZXNldFRyeUVudHJ5KTtcblxuICAgICAgaWYgKCFza2lwVGVtcFJlc2V0KSB7XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcykge1xuICAgICAgICAgIC8vIE5vdCBzdXJlIGFib3V0IHRoZSBvcHRpbWFsIG9yZGVyIG9mIHRoZXNlIGNvbmRpdGlvbnM6XG4gICAgICAgICAgaWYgKG5hbWUuY2hhckF0KDApID09PSBcInRcIiAmJlxuICAgICAgICAgICAgICBoYXNPd24uY2FsbCh0aGlzLCBuYW1lKSAmJlxuICAgICAgICAgICAgICAhaXNOYU4oK25hbWUuc2xpY2UoMSkpKSB7XG4gICAgICAgICAgICB0aGlzW25hbWVdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG5cbiAgICAgIHZhciByb290RW50cnkgPSB0aGlzLnRyeUVudHJpZXNbMF07XG4gICAgICB2YXIgcm9vdFJlY29yZCA9IHJvb3RFbnRyeS5jb21wbGV0aW9uO1xuICAgICAgaWYgKHJvb3RSZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJvb3RSZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5ydmFsO1xuICAgIH0sXG5cbiAgICBkaXNwYXRjaEV4Y2VwdGlvbjogZnVuY3Rpb24oZXhjZXB0aW9uKSB7XG4gICAgICBpZiAodGhpcy5kb25lKSB7XG4gICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzO1xuICAgICAgZnVuY3Rpb24gaGFuZGxlKGxvYywgY2F1Z2h0KSB7XG4gICAgICAgIHJlY29yZC50eXBlID0gXCJ0aHJvd1wiO1xuICAgICAgICByZWNvcmQuYXJnID0gZXhjZXB0aW9uO1xuICAgICAgICBjb250ZXh0Lm5leHQgPSBsb2M7XG5cbiAgICAgICAgaWYgKGNhdWdodCkge1xuICAgICAgICAgIC8vIElmIHRoZSBkaXNwYXRjaGVkIGV4Y2VwdGlvbiB3YXMgY2F1Z2h0IGJ5IGEgY2F0Y2ggYmxvY2ssXG4gICAgICAgICAgLy8gdGhlbiBsZXQgdGhhdCBjYXRjaCBibG9jayBoYW5kbGUgdGhlIGV4Y2VwdGlvbiBub3JtYWxseS5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICAgIGNvbnRleHQuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICEhIGNhdWdodDtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IFwicm9vdFwiKSB7XG4gICAgICAgICAgLy8gRXhjZXB0aW9uIHRocm93biBvdXRzaWRlIG9mIGFueSB0cnkgYmxvY2sgdGhhdCBjb3VsZCBoYW5kbGVcbiAgICAgICAgICAvLyBpdCwgc28gc2V0IHRoZSBjb21wbGV0aW9uIHZhbHVlIG9mIHRoZSBlbnRpcmUgZnVuY3Rpb24gdG9cbiAgICAgICAgICAvLyB0aHJvdyB0aGUgZXhjZXB0aW9uLlxuICAgICAgICAgIHJldHVybiBoYW5kbGUoXCJlbmRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldikge1xuICAgICAgICAgIHZhciBoYXNDYXRjaCA9IGhhc093bi5jYWxsKGVudHJ5LCBcImNhdGNoTG9jXCIpO1xuICAgICAgICAgIHZhciBoYXNGaW5hbGx5ID0gaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKTtcblxuICAgICAgICAgIGlmIChoYXNDYXRjaCAmJiBoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSBpZiAoaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5maW5hbGx5TG9jKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0cnkgc3RhdGVtZW50IHdpdGhvdXQgY2F0Y2ggb3IgZmluYWxseVwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWJydXB0OiBmdW5jdGlvbih0eXBlLCBhcmcpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkudHJ5TG9jIDw9IHRoaXMucHJldiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwoZW50cnksIFwiZmluYWxseUxvY1wiKSAmJlxuICAgICAgICAgICAgdGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgIHZhciBmaW5hbGx5RW50cnkgPSBlbnRyeTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZmluYWxseUVudHJ5ICYmXG4gICAgICAgICAgKHR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgICB0eXBlID09PSBcImNvbnRpbnVlXCIpICYmXG4gICAgICAgICAgZmluYWxseUVudHJ5LnRyeUxvYyA8PSBhcmcgJiZcbiAgICAgICAgICBhcmcgPD0gZmluYWxseUVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBmaW5hbGx5IGVudHJ5IGlmIGNvbnRyb2wgaXMgbm90IGp1bXBpbmcgdG8gYVxuICAgICAgICAvLyBsb2NhdGlvbiBvdXRzaWRlIHRoZSB0cnkvY2F0Y2ggYmxvY2suXG4gICAgICAgIGZpbmFsbHlFbnRyeSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9O1xuICAgICAgcmVjb3JkLnR5cGUgPSB0eXBlO1xuICAgICAgcmVjb3JkLmFyZyA9IGFyZztcblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSkge1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYztcbiAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmNvbXBsZXRlKHJlY29yZCk7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbihyZWNvcmQsIGFmdGVyTG9jKSB7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgIHJlY29yZC50eXBlID09PSBcImNvbnRpbnVlXCIpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gcmVjb3JkLmFyZztcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgdGhpcy5ydmFsID0gdGhpcy5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB0aGlzLm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgIHRoaXMubmV4dCA9IFwiZW5kXCI7XG4gICAgICB9IGVsc2UgaWYgKHJlY29yZC50eXBlID09PSBcIm5vcm1hbFwiICYmIGFmdGVyTG9jKSB7XG4gICAgICAgIHRoaXMubmV4dCA9IGFmdGVyTG9jO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9LFxuXG4gICAgZmluaXNoOiBmdW5jdGlvbihmaW5hbGx5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LmZpbmFsbHlMb2MgPT09IGZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB0aGlzLmNvbXBsZXRlKGVudHJ5LmNvbXBsZXRpb24sIGVudHJ5LmFmdGVyTG9jKTtcbiAgICAgICAgICByZXNldFRyeUVudHJ5KGVudHJ5KTtcbiAgICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcImNhdGNoXCI6IGZ1bmN0aW9uKHRyeUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IHRyeUxvYykge1xuICAgICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICB2YXIgdGhyb3duID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhyb3duO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBjb250ZXh0LmNhdGNoIG1ldGhvZCBtdXN0IG9ubHkgYmUgY2FsbGVkIHdpdGggYSBsb2NhdGlvblxuICAgICAgLy8gYXJndW1lbnQgdGhhdCBjb3JyZXNwb25kcyB0byBhIGtub3duIGNhdGNoIGJsb2NrLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCBjYXRjaCBhdHRlbXB0XCIpO1xuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZVlpZWxkOiBmdW5jdGlvbihpdGVyYWJsZSwgcmVzdWx0TmFtZSwgbmV4dExvYykge1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHtcbiAgICAgICAgaXRlcmF0b3I6IHZhbHVlcyhpdGVyYWJsZSksXG4gICAgICAgIHJlc3VsdE5hbWU6IHJlc3VsdE5hbWUsXG4gICAgICAgIG5leHRMb2M6IG5leHRMb2NcbiAgICAgIH07XG5cbiAgICAgIGlmICh0aGlzLm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgLy8gRGVsaWJlcmF0ZWx5IGZvcmdldCB0aGUgbGFzdCBzZW50IHZhbHVlIHNvIHRoYXQgd2UgZG9uJ3RcbiAgICAgICAgLy8gYWNjaWRlbnRhbGx5IHBhc3MgaXQgb24gdG8gdGhlIGRlbGVnYXRlLlxuICAgICAgICB0aGlzLmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGVcbiAgLy8gb3Igbm90LCByZXR1cm4gdGhlIHJ1bnRpbWUgb2JqZWN0IHNvIHRoYXQgd2UgY2FuIGRlY2xhcmUgdGhlIHZhcmlhYmxlXG4gIC8vIHJlZ2VuZXJhdG9yUnVudGltZSBpbiB0aGUgb3V0ZXIgc2NvcGUsIHdoaWNoIGFsbG93cyB0aGlzIG1vZHVsZSB0byBiZVxuICAvLyBpbmplY3RlZCBlYXNpbHkgYnkgYGJpbi9yZWdlbmVyYXRvciAtLWluY2x1ZGUtcnVudGltZSBzY3JpcHQuanNgLlxuICByZXR1cm4gZXhwb3J0cztcblxufShcbiAgLy8gSWYgdGhpcyBzY3JpcHQgaXMgZXhlY3V0aW5nIGFzIGEgQ29tbW9uSlMgbW9kdWxlLCB1c2UgbW9kdWxlLmV4cG9ydHNcbiAgLy8gYXMgdGhlIHJlZ2VuZXJhdG9yUnVudGltZSBuYW1lc3BhY2UuIE90aGVyd2lzZSBjcmVhdGUgYSBuZXcgZW1wdHlcbiAgLy8gb2JqZWN0LiBFaXRoZXIgd2F5LCB0aGUgcmVzdWx0aW5nIG9iamVjdCB3aWxsIGJlIHVzZWQgdG8gaW5pdGlhbGl6ZVxuICAvLyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIHZhcmlhYmxlIGF0IHRoZSB0b3Agb2YgdGhpcyBmaWxlLlxuICB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiID8gbW9kdWxlLmV4cG9ydHMgOiB7fVxuKSk7XG5cbnRyeSB7XG4gIHJlZ2VuZXJhdG9yUnVudGltZSA9IHJ1bnRpbWU7XG59IGNhdGNoIChhY2NpZGVudGFsU3RyaWN0TW9kZSkge1xuICAvLyBUaGlzIG1vZHVsZSBzaG91bGQgbm90IGJlIHJ1bm5pbmcgaW4gc3RyaWN0IG1vZGUsIHNvIHRoZSBhYm92ZVxuICAvLyBhc3NpZ25tZW50IHNob3VsZCBhbHdheXMgd29yayB1bmxlc3Mgc29tZXRoaW5nIGlzIG1pc2NvbmZpZ3VyZWQuIEp1c3RcbiAgLy8gaW4gY2FzZSBydW50aW1lLmpzIGFjY2lkZW50YWxseSBydW5zIGluIHN0cmljdCBtb2RlLCB3ZSBjYW4gZXNjYXBlXG4gIC8vIHN0cmljdCBtb2RlIHVzaW5nIGEgZ2xvYmFsIEZ1bmN0aW9uIGNhbGwuIFRoaXMgY291bGQgY29uY2VpdmFibHkgZmFpbFxuICAvLyBpZiBhIENvbnRlbnQgU2VjdXJpdHkgUG9saWN5IGZvcmJpZHMgdXNpbmcgRnVuY3Rpb24sIGJ1dCBpbiB0aGF0IGNhc2VcbiAgLy8gdGhlIHByb3BlciBzb2x1dGlvbiBpcyB0byBmaXggdGhlIGFjY2lkZW50YWwgc3RyaWN0IG1vZGUgcHJvYmxlbS4gSWZcbiAgLy8geW91J3ZlIG1pc2NvbmZpZ3VyZWQgeW91ciBidW5kbGVyIHRvIGZvcmNlIHN0cmljdCBtb2RlIGFuZCBhcHBsaWVkIGFcbiAgLy8gQ1NQIHRvIGZvcmJpZCBGdW5jdGlvbiwgYW5kIHlvdSdyZSBub3Qgd2lsbGluZyB0byBmaXggZWl0aGVyIG9mIHRob3NlXG4gIC8vIHByb2JsZW1zLCBwbGVhc2UgZGV0YWlsIHlvdXIgdW5pcXVlIHByZWRpY2FtZW50IGluIGEgR2l0SHViIGlzc3VlLlxuICBGdW5jdGlvbihcInJcIiwgXCJyZWdlbmVyYXRvclJ1bnRpbWUgPSByXCIpKHJ1bnRpbWUpO1xufVxuIiwiaW1wb3J0IEZpbGVPcHMgZnJvbSBcIi4vbW9kdWxlcy9GaWxlT3BzLmpzXCI7XHJcbmltcG9ydCBBdXRoZW50aWNhdGUgZnJvbSBcIi4vbW9kdWxlcy9BdXRoZW50aWNhdGUuanNcIjtcclxuaW1wb3J0IE1lbnUgZnJvbSBcIi4vbW9kdWxlcy9NZW51LmpzXCI7XHJcbmltcG9ydCBRdWVzdGlvblBhbmUgZnJvbSBcIi4vbW9kdWxlcy9RdWVzdGlvblBhbmUuanNcIjtcclxuaW1wb3J0IEVkaXRvclBhbmUgZnJvbSBcIi4vbW9kdWxlcy9FZGl0b3JQYW5lLmpzXCI7XHJcbmltcG9ydCBNb2RlbCBmcm9tIFwiLi9tb2R1bGVzL01vZGVsXCI7XHJcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCJAdGhhZXJpb3VzL25pZGdldFwiKVxyXG5cclxuaW1wb3J0IFwiLi9tb2R1bGVzL0dhbWVCb2FyZC5qc1wiO1xyXG5pbXBvcnQgXCIuL21vZHVsZXMvTXVsdGlwbGVDaG9pY2VQYW5lLmpzXCI7XHJcbmltcG9ydCBcIi4vbW9kdWxlcy9DaGVja0JveC5qc1wiO1xyXG5cclxubGV0IGZpbGVPcHMgPSBuZXcgRmlsZU9wcygpO1xyXG5sZXQgbW9kZWwgPSBudWxsO1xyXG5sZXQgcXVlc3Rpb25QYW5lID0gbnVsbDtcclxubGV0IGVkaXRvclBhbmUgPSBudWxsO1xyXG5cclxud2luZG93Lm9ubG9hZCA9IGFzeW5jICgpID0+IHtcclxuICAgIHNldHVwKCk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNldHVwKCl7XHJcbiAgICBsZXQgc3RhcnQgPSBuZXcgRGF0ZSgpO1xyXG5cclxuICAgIHBhcnNlVVJMUGFyYW1ldGVycygpO1xyXG4gICAgbmV3IE1lbnUoKS5pbml0KFwiI21lbnVcIik7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBuZXcgQXV0aGVudGljYXRlKCkubG9hZENsaWVudCgpO1xyXG4gICAgICAgIGF3YWl0IGZpbGVPcHMubG9hZENsaWVudCgpO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZmlsZSA9IGF3YWl0IGZpbGVPcHMuZ2V0KHdpbmRvdy5wYXJhbWV0ZXJzLmZpbGVJZCk7XHJcbiAgICBsZXQgbW9kZWwgPSBuZXcgTW9kZWwoZmlsZU9wcykuc2V0KEpTT04ucGFyc2UoZmlsZS5ib2R5KSk7XHJcbiAgICB3aW5kb3cubW9kZWwgPSBtb2RlbDtcclxuXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtbmFtZVwiKS50ZXh0Q29udGVudCA9IG1vZGVsLm5hbWU7XHJcbiAgICBlZGl0b3JQYW5lID0gbmV3IEVkaXRvclBhbmUobW9kZWwsIGZpbGVPcHMsIHdpbmRvdy5wYXJhbWV0ZXJzLmZpbGVJZCk7XHJcbiAgICBlZGl0b3JQYW5lLm9uU2F2ZSA9IHNhdmVNb2RlbDtcclxuXHJcbiAgICBsZXQgZW5kID0gbmV3IERhdGUoKTtcclxuICAgIGxldCB0aW1lID0gZW5kIC0gc3RhcnQ7XHJcbiAgICBjb25zb2xlLmxvZyhcIkxvYWQgVGltZSBcIiArIHRpbWUgKyBcIiBtc1wiKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNhdmUgdGhlIG1vZGVsIHRvIHRoZSBnb29nbGUgYXBwIGRhdGEgZm9sZGVyLlxyXG4gKi9cclxuZnVuY3Rpb24gc2F2ZU1vZGVsKCkge1xyXG4gICAgZmlsZU9wcy5zZXRCb2R5KHdpbmRvdy5wYXJhbWV0ZXJzLmZpbGVJZCwgSlNPTi5zdHJpbmdpZnkod2luZG93Lm1vZGVsLmdldCgpLCBudWxsLCAyKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGFuZ2UgdGhlIG5hbWUgb2YgdGhlIGZpbGUgaW4gZ29vZ2xlJ3MgYXBwIGRhdGEgZm9sZGVyLlxyXG4gKi9cclxuZnVuY3Rpb24gcmVuYW1lTW9kZWwoKSB7XHJcbiAgICBsZXQgbmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1uYW1lXCIpLnRleHRDb250ZW50O1xyXG4gICAgZmlsZU9wcy5yZW5hbWUod2luZG93LnBhcmFtZXRlcnMuZmlsZUlkLCBuYW1lICsgXCIuanNvblwiKTtcclxuICAgIHdpbmRvdy5tb2RlbC5uYW1lID0gbmFtZTtcclxuICAgIHNhdmVNb2RlbCgpO1xyXG59XHJcblxyXG4vKipcclxuICogRXh0cmFjdCB2YWx1ZSBmcm9tIHRoZSBVUkwgc3RyaW5nLCBzdG9yZSBpbiAnd2luZG93LnBhcmFtZXRlcnMnLlxyXG4gKi9cclxuZnVuY3Rpb24gcGFyc2VVUkxQYXJhbWV0ZXJzKCkge1xyXG4gICAgd2luZG93LnBhcmFtZXRlcnMgPSB7fTtcclxuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKS5zcGxpdChcIiZcIik7XHJcbiAgICBmb3IgKGNvbnN0IHBhcmFtZXRlciBvZiBwYXJhbWV0ZXJzKSB7XHJcbiAgICAgICAgY29uc3Qgc3BsaXQgPSBwYXJhbWV0ZXIuc3BsaXQoLz0vKTtcclxuICAgICAgICB3aW5kb3cucGFyYW1ldGVyc1tzcGxpdFswXV0gPSBzcGxpdFsxXSA/PyBcIlwiO1xyXG4gICAgfVxyXG59IiwiLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2RyaXZlL2FwaS92My9xdWlja3N0YXJ0L2pzP2hsPWVuXHJcblxyXG5jbGFzcyBBdXRoZW50aWNhdGUge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHJlcXVpcmUoXCIuL2dvb2dsZUZpZWxkcy5qc1wiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZENsaWVudCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmxvYWQoJ2NsaWVudDphdXRoMicsICgpID0+IHRoaXMuX19pbml0Q2xpZW50KHJlc29sdmUsIHJlamVjdCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9faW5pdENsaWVudChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBnYXBpLmNsaWVudC5pbml0KHtcclxuICAgICAgICAgICAgYXBpS2V5OiB0aGlzLmRldmVsb3BlcktleSxcclxuICAgICAgICAgICAgY2xpZW50SWQ6IHRoaXMuY2xpZW50SWQsXHJcbiAgICAgICAgICAgIGRpc2NvdmVyeURvY3M6IHRoaXMuZGlzY292ZXJ5RG9jcyxcclxuICAgICAgICAgICAgc2NvcGU6IHRoaXMuc2NvcGVcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1IgSU5JVFwiKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlzQXV0aG9yaXplZCgpe1xyXG4gICAgICAgIHZhciB1c2VyID0gZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKS5jdXJyZW50VXNlci5nZXQoKTtcclxuICAgICAgICByZXR1cm4gdXNlci5oYXNHcmFudGVkU2NvcGVzKHRoaXMuc2NvcGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNpZ25Jbigpe1xyXG4gICAgICAgIGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuc2lnbkluKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2lnbk91dCgpe1xyXG4gICAgICAgIGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuc2lnbk91dCgpO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBdXRoZW50aWNhdGU7IiwiY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCJAVGhhZXJpb3VzL25pZGdldFwiKS5OaWRnZXRFbGVtZW50O1xyXG5cclxuY2xhc3MgVmFsdWVVcGFkYXRlIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IodmFsdWUpIHtcclxuICAgICAgICBzdXBlcigndmFsdWUtdXBkYXRlJyxcclxuICAgICAgICAgICAge2RldGFpbCA6IHt2YWx1ZSA6IHZhbHVlfX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBDaGVja0JveCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgYXN5bmMgY29ubmVjdGVkQ2FsbGJhY2soKXtcclxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdG9nZ2xlKCl7XHJcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tlZCA9PT0gJ3RydWUnKSB0aGlzLmNoZWNrZWQgPSAnZmFsc2UnO1xyXG4gICAgICAgIGVsc2UgdGhpcy5jaGVja2VkID0gJ3RydWUnXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGNoZWNrZWQoKXtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFKSl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFLCAnZmFsc2UnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgY2hlY2tlZCh2YWx1ZSl7XHJcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoQ2hlY2tCb3guQ0hFQ0tFRF9BVFRSSUJVVEUsIHZhbHVlKTtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFZhbHVlVXBhZGF0ZSh2YWx1ZSkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5DaGVja0JveC5DSEVDS0VEX0FUVFJJQlVURSA9IFwiY2hlY2tlZFwiO1xyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdjaGVjay1ib3gnLCBDaGVja0JveCk7XHJcbm1vZHVsZS5leHBvcnRzID0gQ2hlY2tCb3g7IiwiaW1wb3J0IE1vZGVsIGZyb20gXCIuL01vZGVsLmpzXCI7XHJcbmNvbnN0IERPTSA9IHsvKiBzZWUgRWRpdG9yUGFuZS5jb25zdHJ1Y3RvciAqL307XHJcblxyXG5jbGFzcyBNQ0Fuc3dlckN0cmwge1xyXG4gICAgc3RhdGljIHJ1bihtb2RlbCwgc2F2ZUNCKSB7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLm1vZGVsICA9IG1vZGVsO1xyXG4gICAgICAgIE1DQW5zd2VyQ3RybC5zYXZlQ0IgPSBzYXZlQ0I7XHJcblxyXG4gICAgICAgIERPTS5tZW51RGVjcmVhc2VWYWx1ZS5oaWRlKCk7XHJcbiAgICAgICAgRE9NLm1lbnVJbmNyZWFzZVZhbHVlLmhpZGUoKTtcclxuXHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5zaG93KCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUuc2V0VGV4dChpLCBtb2RlbC5hbnN3ZXJzW2ldLnRleHQpO1xyXG4gICAgICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLnNldENoZWNrZWQoaSwgbW9kZWwuYW5zd2Vyc1tpXS5pc1RydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlUmlnaHQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIE1DQW5zd2VyQ3RybC5jbGVhbnVwKTtcclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBNQ0Fuc3dlckN0cmwuY2xlYW51cCk7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5hZGRFdmVudExpc3RlbmVyKFwidGV4dC11cGRhdGVcIiwgTUNBbnN3ZXJDdHJsLnRleHRMaXN0KTtcclxuICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLmFkZEV2ZW50TGlzdGVuZXIoXCJ2YWx1ZS11cGRhdGVcIiwgTUNBbnN3ZXJDdHJsLnZhbHVlTGlzdCk7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5hZGRFdmVudExpc3RlbmVyKFwiYnV0dG9uLXF1ZXN0aW9uXCIsIE1DQW5zd2VyQ3RybC5xdWVzdExpc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyB0ZXh0TGlzdChldmVudCkge1xyXG4gICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGV2ZW50LmRldGFpbC5pbmRleCk7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLm1vZGVsLmFuc3dlcnNbaW5kZXhdLnRleHQgPSBldmVudC5kZXRhaWwudGV4dDtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwuc2F2ZUNCKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHZhbHVlTGlzdChldmVudCkge1xyXG4gICAgICAgIGxldCBpbmRleCA9IHBhcnNlSW50KGV2ZW50LmRldGFpbC5pbmRleCk7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLm1vZGVsLmFuc3dlcnNbaW5kZXhdLmlzVHJ1ZSA9IGV2ZW50LmRldGFpbC52YWx1ZTtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwuc2F2ZUNCKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHF1ZXN0TGlzdChldmVudCkge1xyXG4gICAgICAgIE1DQW5zd2VyQ3RybC5zYXZlQ0IoKTtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwuY2xlYW51cCgpO1xyXG4gICAgICAgIE1DUXVlc3Rpb25DdHJsLnJ1bihNQ0Fuc3dlckN0cmwubW9kZWwsIE1DQW5zd2VyQ3RybC5zYXZlQ0IpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjbGVhbnVwKCkge1xyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUuaGlkZSgpO1xyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRleHQtdXBkYXRlXCIsIE1DQW5zd2VyQ3RybC50ZXh0TGlzdCk7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwidmFsdWUtdXBkYXRlXCIsIE1DQW5zd2VyQ3RybC52YWx1ZUxpc3QpO1xyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJ1dHRvbi1xdWVzdGlvblwiLCBNQ0Fuc3dlckN0cmwucXVlc3RMaXN0KTtcclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNBbnN3ZXJDdHJsLmNsZWFudXApO1xyXG4gICAgICAgIERPTS50cmlhbmdsZUxlZnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIE1DQW5zd2VyQ3RybC5jbGVhbnVwKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTUNRdWVzdGlvbkN0cmwge1xyXG4gICAgc3RhdGljIHJ1bihtb2RlbCwgc2F2ZUNCKSB7XHJcbiAgICAgICAgTUNRdWVzdGlvbkN0cmwubW9kZWwgID0gbW9kZWw7XHJcbiAgICAgICAgTUNRdWVzdGlvbkN0cmwuc2F2ZUNCID0gc2F2ZUNCO1xyXG5cclxuICAgICAgICBET00ubWVudURlY3JlYXNlVmFsdWUuaGlkZSgpO1xyXG4gICAgICAgIERPTS5tZW51SW5jcmVhc2VWYWx1ZS5oaWRlKCk7XHJcblxyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuc2V0VGV4dChtb2RlbC5xdWVzdGlvbik7XHJcbiAgICAgICAgRE9NLmdhbWVCb2FyZC5oaWRlKCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5zaG93KCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5ib2FyZEJ1dHRvbiA9IGZhbHNlO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuaGlnaGxpZ2h0KCdxdWVzdGlvbicpO1xyXG5cclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNRdWVzdGlvbkN0cmwuY2xlYW51cCk7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlTGVmdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNRdWVzdGlvbkN0cmwuY2xlYW51cCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKFwidGV4dC11cGRhdGVcIiwgTUNRdWVzdGlvbkN0cmwudGV4dExpc3QpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuYWRkRXZlbnRMaXN0ZW5lcihcImJ1dHRvbi1hbnN3ZXJcIiwgTUNRdWVzdGlvbkN0cmwuYW5zd2VyTGlzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHRleHRMaXN0KGV2ZW50KSB7XHJcbiAgICAgICAgTUNRdWVzdGlvbkN0cmwubW9kZWwucXVlc3Rpb24gPSBldmVudC5kZXRhaWwudGV4dDtcclxuICAgICAgICBNQ1F1ZXN0aW9uQ3RybC5zYXZlQ0IoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYW5zd2VyTGlzdCgpIHtcclxuICAgICAgICBNQ1F1ZXN0aW9uQ3RybC5jbGVhbnVwKCk7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLnJ1bihNQ1F1ZXN0aW9uQ3RybC5tb2RlbCwgTUNRdWVzdGlvbkN0cmwuc2F2ZUNCKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgY2xlYW51cCgpIHtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0ZXh0LXVwZGF0ZVwiLCBNQ1F1ZXN0aW9uQ3RybC50ZXh0TGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiYnV0dG9uLWFuc3dlclwiLCBNQ1F1ZXN0aW9uQ3RybC5hbnN3ZXJMaXN0KTtcclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNRdWVzdGlvbkN0cmwuY2xlYW51cCk7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlTGVmdC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNRdWVzdGlvbkN0cmwuY2xlYW51cCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFF1ZXN0aW9uUGFuZUN0cmwge1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0gbW9kZWwgLSB0aGUgcXVlc3Rpb24gbW9kZWwgb2JqZWN0XHJcbiAgICAgKiBAcGFyYW0gZmllbGQgLSB3aGljaCBtb2RlbCBmaWVsZCB0byByZWFkL3dyaXRlIGZyb20geydhJywgJ3EnfVxyXG4gICAgICogQHBhcmFtIHNhdmVDQiAtIGNhbGwgdGhpcyBtZXRob2QgdG8gc2F2ZSB0aGUgbW9kZWxcclxuICAgICAqL1xyXG4gICAgc3RhdGljIHJ1bihmaWVsZCwgbW9kZWwsIHNhdmVDQiwgY2xvc2VDQikge1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwubW9kZWwgICA9IG1vZGVsID8/IFF1ZXN0aW9uUGFuZUN0cmwubW9kZWw7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5maWVsZCAgID0gZmllbGQgPz8gUXVlc3Rpb25QYW5lQ3RybC5maWVsZDtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLnNhdmVDQiAgPSBzYXZlQ0IgPz8gUXVlc3Rpb25QYW5lQ3RybC5zYXZlQ0I7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5jbG9zZUNCID0gY2xvc2VDQiA/PyBRdWVzdGlvblBhbmVDdHJsLmNsb3NlQ0I7XHJcblxyXG4gICAgICAgIERPTS5tZW51RGVjcmVhc2VWYWx1ZS5zaG93KCk7XHJcbiAgICAgICAgRE9NLm1lbnVJbmNyZWFzZVZhbHVlLnNob3coKTtcclxuXHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5zZXRUZXh0KFF1ZXN0aW9uUGFuZUN0cmwubW9kZWxbUXVlc3Rpb25QYW5lQ3RybC5maWVsZC5zdWJzdHIoMCwgMSldKTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmJvYXJkQnV0dG9uID0gdHJ1ZTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnNob3coKTtcclxuICAgICAgICBET00uZ2FtZUJvYXJkLmhpZGUoKTtcclxuXHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKFwidGV4dC11cGRhdGVcIiwgUXVlc3Rpb25QYW5lQ3RybC50ZXh0TGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKFwiYnV0dG9uLWJvYXJkXCIsIFF1ZXN0aW9uUGFuZUN0cmwuYm9hcmRMaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmFkZEV2ZW50TGlzdGVuZXIoYGJ1dHRvbi1xdWVzdGlvbmAsIFF1ZXN0aW9uUGFuZUN0cmwucXVlc3Rpb25MaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmFkZEV2ZW50TGlzdGVuZXIoYGJ1dHRvbi1hbnN3ZXJgLCBRdWVzdGlvblBhbmVDdHJsLmFuc3dlckxpc3QpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuaGlnaGxpZ2h0KFF1ZXN0aW9uUGFuZUN0cmwuZmllbGQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyB0ZXh0TGlzdChldmVudCkge1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwubW9kZWxbUXVlc3Rpb25QYW5lQ3RybC5maWVsZC5zdWJzdHIoMCwgMSldID0gZXZlbnQuZGV0YWlsLnRleHQ7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5zYXZlQ0IoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYm9hcmRMaXN0KGV2ZW50KSB7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5jbGVhbnVwKCk7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5jbG9zZUNCKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFuc3dlckxpc3QoZXZlbnQpIHtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLmNsZWFudXAoKTtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLnJ1bignYW5zd2VyJyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHF1ZXN0aW9uTGlzdCh2ZW50KSB7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5jbGVhbnVwKCk7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5ydW4oJ3F1ZXN0aW9uJyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNsZWFudXAoKSB7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwidGV4dC11cGRhdGVcIiwgUXVlc3Rpb25QYW5lQ3RybC50ZXh0TGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiYnV0dG9uLWJvYXJkXCIsIFF1ZXN0aW9uUGFuZUN0cmwuYm9hcmRMaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJidXR0b24tYW5zd2VyXCIsIFF1ZXN0aW9uUGFuZUN0cmwuYW5zd2VyTGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiYnV0dG9uLXF1ZXN0aW9uXCIsIFF1ZXN0aW9uUGFuZUN0cmwucXVlc3Rpb25MaXN0KTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgRWRpdG9yUGFuZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcihtb2RlbCwgZmlsZU9wcywgZmlsZUlkKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG4gICAgICAgIHRoaXMuZmlsZU9wcyA9IGZpbGVPcHM7XHJcbiAgICAgICAgdGhpcy5maWxlSWQgPSBmaWxlSWQ7XHJcblxyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI211bHRpcGxlLWNob2ljZS1wYW5lXCIpO1xyXG4gICAgICAgIERPTS50cmlhbmdsZVJpZ2h0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0cmlhbmdsZS1yaWdodFwiKTtcclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0cmlhbmdsZS1sZWZ0XCIpO1xyXG4gICAgICAgIERPTS5yb3VuZExhYmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyb3VuZC1udW1iZXIgPiAudGV4dFwiKTtcclxuICAgICAgICBET00uZ2FtZU5hbWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtbmFtZVwiKTtcclxuICAgICAgICBET00uZ2FtZUJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lLWJvYXJkXCIpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3F1ZXN0aW9uLXBhbmVcIilcclxuICAgICAgICBET00ubWVudUluY3JlYXNlVmFsdWUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtdmFsdWUtcGx1c1wiKVxyXG4gICAgICAgIERPTS5tZW51RGVjcmVhc2VWYWx1ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS12YWx1ZS1taW51c1wiKVxyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtZG93bmxvYWRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeSh0aGlzLm1vZGVsLmdhbWVNb2RlbCwgbnVsbCwgMik7XHJcbiAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbanNvbl0sIHt0eXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIn0pO1xyXG4gICAgICAgICAgICBjb25zdCB1cmwgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcclxuICAgICAgICAgICAgY29uc3QgYW5jaG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb3dubG9hZC1hbmNob3JcIik7XHJcbiAgICAgICAgICAgIGFuY2hvci5ocmVmID0gdXJsO1xyXG4gICAgICAgICAgICBhbmNob3IuZG93bmxvYWQgPSB0aGlzLm1vZGVsLm5hbWU7XHJcbiAgICAgICAgICAgIGFuY2hvci5jbGljaygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtbW92ZS1yaWdodFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgaWYgKHRoaXMubW9kZWwuY3VycmVudFJvdW5kID49IHRoaXMubW9kZWwucm91bmRDb3VudCAtIDEpIHJldHVybjtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5zZXRSb3VuZEluZGV4KHRoaXMubW9kZWwuY3VycmVudFJvdW5kLCB0aGlzLm1vZGVsLmN1cnJlbnRSb3VuZCArIDEpO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmluY3JlbWVudFJvdW5kKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtbW92ZS1sZWZ0XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5jdXJyZW50Um91bmQgPD0gMCkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLnNldFJvdW5kSW5kZXgodGhpcy5tb2RlbC5jdXJyZW50Um91bmQsIHRoaXMubW9kZWwuY3VycmVudFJvdW5kIC0gMSk7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuZGVjcmVtZW50Um91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1yZW1vdmUtcm91bmRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5yZW1vdmVSb3VuZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRyaWFuZ2xlVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LWhvbWUtc2NyZWVuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBcImhvc3QuZWpzXCI7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIERPTS5tZW51SW5jcmVhc2VWYWx1ZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmluY3JlYXNlVmFsdWUoKTtcclxuICAgICAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIERPTS5tZW51RGVjcmVhc2VWYWx1ZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmRlY3JlYXNlVmFsdWUoKTtcclxuICAgICAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIERPTS50cmlhbmdsZVJpZ2h0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuaW5jcmVtZW50Um91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIERPTS50cmlhbmdsZUxlZnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5kZWNyZW1lbnRSb3VuZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgRE9NLmdhbWVOYW1lLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBhc3luYyAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxMykge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5mb2N1cygpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwubmFtZSA9IERPTS5nYW1lTmFtZS5pbm5lclRleHQ7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmZpbGVPcHMucmVuYW1lKHRoaXMuZmlsZUlkLCB0aGlzLm1vZGVsLm5hbWUgKyBcIi5qc29uXCIpO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtYWRkLWNhdGVnb3J5XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuYWRkQ2F0ZWdvcnlSb3VuZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LWFkZC1tdWx0aXBsZS1jaG9pY2VcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5hZGRNdWx0aXBsZUNob2ljZVJvdW5kKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBnYW1lLWJvYXJkIGNoYW5nZSBjYXRlZ29yeSB0ZXh0XHJcbiAgICAgICAgRE9NLmdhbWVCb2FyZC5hZGRFdmVudExpc3RlbmVyKFwiaGVhZGVyLXVwZGF0ZVwiLCBldmVudCA9PiB7XHJcbiAgICAgICAgICAgIGxldCBjb2wgPSBldmVudC5kZXRhaWwuY29sO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmdldENvbHVtbihjb2wpLmNhdGVnb3J5ID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmdldENvbHVtbihjb2wpLmZvbnRTaXplID0gZXZlbnQuZGV0YWlsLmZvbnRTaXplO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBnYW1lLWJvYXJkIHNlbGVjdCBjZWxsXHJcbiAgICAgICAgRE9NLmdhbWVCb2FyZC5hZGRFdmVudExpc3RlbmVyKFwiY2VsbC1zZWxlY3RcIiwgZXZlbnQgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcm93ID0gZXZlbnQuZGV0YWlsLnJvdztcclxuICAgICAgICAgICAgbGV0IGNvbCA9IGV2ZW50LmRldGFpbC5jb2w7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZU5hdmlnYXRpb24oKTtcclxuXHJcbiAgICAgICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwucnVuKFxyXG4gICAgICAgICAgICAgICAgJ3F1ZXN0aW9uJyxcclxuICAgICAgICAgICAgICAgIHRoaXMubW9kZWwuZ2V0Q2VsbChyb3csIGNvbCksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLm9uU2F2ZSgpLFxyXG4gICAgICAgICAgICAgICAgKCkgPT4gdGhpcy51cGRhdGVWaWV3KClcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25TYXZlKCkge1xyXG4gICAgICAgIHRoaXMuZmlsZU9wcy5zZXRCb2R5KHRoaXMuZmlsZUlkLCB0aGlzLm1vZGVsKTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlTmF2aWdhdGlvbigpIHtcclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlUmlnaHQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVWaWV3KG1vZGVsKSB7XHJcbiAgICAgICAgbW9kZWwgPSBtb2RlbCA/PyB0aGlzLm1vZGVsO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVHJpYW5nbGVWaWV3KCk7XHJcblxyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuaGlkZSgpO1xyXG4gICAgICAgIERPTS5nYW1lQm9hcmQuaGlkZSgpO1xyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUuaGlkZSgpO1xyXG5cclxuICAgICAgICBpZiAobW9kZWwuZ2V0Um91bmQoKS50eXBlID09PSBNb2RlbC5xdWVzdGlvblR5cGUuQ0FURUdPUlkpIHRoaXMuY2F0ZWdvcnlWaWV3KG1vZGVsKTtcclxuICAgICAgICBpZiAobW9kZWwuZ2V0Um91bmQoKS50eXBlID09PSBNb2RlbC5xdWVzdGlvblR5cGUuTVVMVElQTEVfQ0hPSUNFKSB0aGlzLm11bHRpcGxlQ2hvaWNlVmlldyhtb2RlbCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlVHJpYW5nbGVWaWV3KCkge1xyXG4gICAgICAgIERPTS50cmlhbmdsZUxlZnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRSb3VuZCA9PT0gMCkgRE9NLnRyaWFuZ2xlTGVmdC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRSb3VuZCA+PSB0aGlzLm1vZGVsLnJvdW5kQ291bnQgLSAxKSBET00udHJpYW5nbGVSaWdodC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIERPTS5yb3VuZExhYmVsLnRleHRDb250ZW50ID0gXCJSb3VuZCBcIiArICh0aGlzLm1vZGVsLmN1cnJlbnRSb3VuZCArIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIG11bHRpcGxlQ2hvaWNlVmlldyhtb2RlbCkge1xyXG4gICAgICAgIE1DUXVlc3Rpb25DdHJsLnJ1bih0aGlzLm1vZGVsLmdldFJvdW5kKCksICgpID0+IHRoaXMub25TYXZlKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNhdGVnb3J5Vmlldyhtb2RlbCkge1xyXG4gICAgICAgIERPTS5tZW51RGVjcmVhc2VWYWx1ZS5zaG93KCk7XHJcbiAgICAgICAgRE9NLm1lbnVJbmNyZWFzZVZhbHVlLnNob3coKTtcclxuICAgICAgICBET00uZ2FtZUJvYXJkLnNob3coKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgNjsgY29sKyspIHtcclxuICAgICAgICAgICAgbGV0IGNvbHVtbiA9IG1vZGVsLmdldENvbHVtbihjb2wpO1xyXG5cclxuICAgICAgICAgICAgRE9NLmdhbWVCb2FyZC5nZXRIZWFkZXIoY29sKS5maXRUZXh0LmxvY2sgPSBcInZoXCI7XHJcbiAgICAgICAgICAgIERPTS5nYW1lQm9hcmQuc2V0SGVhZGVyKGNvbCwgY29sdW1uLmNhdGVnb3J5LCBjb2x1bW4uZm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgNTsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIERPTS5nYW1lQm9hcmQuc2V0Q2VsbChyb3csIGNvbCwgY29sdW1uLmNlbGxbcm93XS52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29sdW1uLmNlbGxbcm93XS5xID09PSBcIlwiKSBET00uZ2FtZUJvYXJkLnNldENvbXBsZXRlKHJvdywgY29sLCBcImZhbHNlXCIpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY29sdW1uLmNlbGxbcm93XS5hID09PSBcIlwiKSBET00uZ2FtZUJvYXJkLnNldENvbXBsZXRlKHJvdywgY29sLCBcInBhcnRpYWxcIik7XHJcbiAgICAgICAgICAgICAgICBlbHNlIERPTS5nYW1lQm9hcmQuc2V0Q29tcGxldGUocm93LCBjb2wsIFwidHJ1ZVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3JQYW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG4vLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZHJpdmUvYXBpL3YzL3F1aWNrc3RhcnQvanM/aGw9ZW5cclxuXHJcbmNsYXNzIEZpbGVPcHMge1xyXG5cclxuICAgIGFzeW5jIGxvYWQoKXtcclxuICAgICAgICBhd2FpdCB0aGlzLmxvYWRDbGllbnQoKTtcclxuICAgICAgICBhd2FpdCB0aGlzLmxvYWREcml2ZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDbGllbnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZ2FwaS5sb2FkKCdjbGllbnQnLCAoKSA9PiByZXNvbHZlKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWREcml2ZSgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5sb2FkKCdkcml2ZScsICd2MycsIHJlc29sdmUoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgY3JlYXRlKGZpbGVuYW1lID0gXCJHYW1lIE5hbWUuanNvblwiKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgICAgICBuYW1lIDogZmlsZW5hbWUsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnRzOiBbJ2FwcERhdGFGb2xkZXInXSxcclxuICAgICAgICAgICAgICAgIGZpZWxkczogXCJpZFwiXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy5yZXN1bHQuaWQpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGRlbGV0ZShmaWxlSWQpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuZGVsZXRlKHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZCA6IGZpbGVJZFxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0KTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBsaXN0KCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5saXN0KHtcclxuICAgICAgICAgICAgICAgIC8vIHE6IGBuYW1lIGNvbnRhaW5zICcuanNvbidgLFxyXG4gICAgICAgICAgICAgICAgc3BhY2VzOiAnYXBwRGF0YUZvbGRlcicsXHJcbiAgICAgICAgICAgICAgICBmaWVsZHM6ICdmaWxlcy9uYW1lLGZpbGVzL2lkLGZpbGVzL21vZGlmaWVkVGltZSdcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLnJlc3VsdC5maWxlcyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZ2V0KGZpbGVJZCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5nZXQoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkOiBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICBhbHQ6ICdtZWRpYSdcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHNldEJvZHkoZmlsZUlkLCBib2R5KXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LnJlcXVlc3Qoe1xyXG4gICAgICAgICAgICAgICAgcGF0aCA6IFwidXBsb2FkL2RyaXZlL3YzL2ZpbGVzL1wiICsgZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgbWV0aG9kIDogXCJQQVRDSFwiLFxyXG4gICAgICAgICAgICAgICAgcGFyYW1zIDoge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwbG9hZFR5cGUgOiBcIm1lZGlhXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzIDoge1xyXG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCIgOiBcImFwcGxpY2F0aW9uL2pzb25cIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGJvZHkgOiBib2R5XHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVzLmJvZHkpKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlbmFtZShmaWxlSWQsIGZpbGVuYW1lKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLnVwZGF0ZSh7XHJcbiAgICAgICAgICAgICAgICBmaWxlSWQ6IGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIG5hbWU6IGZpbGVuYW1lXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKEpTT04ucGFyc2UocmVzLmJvZHkpKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBGaWxlT3BzOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqIFZpZXctQ29udHJvbGxlciBmb3IgdGhlIEhUTUwgZ2FtZSBib2FyZCBlbGVtZW50XHJcbiAgICBUaGlzIGlzIHRoZSBjbGFzc2ljYWwgXCJKZW9wYXJkeVwiIHR5cGUgYm9hcmRcclxuICAgIFRoaXMgaXMgbW9kZWwgYWdub3N0aWMsIHNlZSBFZGl0b3JQYW5lLmpzIGZvciBtb2RlbCBtZXRob2RzXHJcbiAgICBnZW5lcmF0ZXMgdGhlIGZvbGxvd2luZyBldmVudHM6XHJcbiAgICAgICAgY2VsbC1zZWxlY3QgKHJvdywgY29sKTogd2hlbiBhIHVzZXIgY2xpY2tzIGEgY2VsbFxyXG4gICAgICAgIGhlYWRlci11cGRhdGUgKHZhbHVlLCBjb2wsIGZvbnRzaXplKSA6IHdoZW4gdGhlIGhlYWRlciB0ZXh0IGNoYW5nZXMgKGFuZCBibHVycylcclxuICoqL1xyXG5cclxuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCJAVGhhZXJpb3VzL25pZGdldFwiKS5OaWRnZXRFbGVtZW50O1xyXG5cclxuY2xhc3MgQ2VsbFNlbGVjdEV2ZW50IGV4dGVuZHMgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3Rvcihyb3csIGNvbCkge1xyXG4gICAgICAgIHN1cGVyKCdjZWxsLXNlbGVjdCcsXHJcbiAgICAgICAgICAgICAge2RldGFpbCA6IHtyb3cgOiByb3csIGNvbCA6IGNvbCB9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEhlYWRlclVwZGF0ZUV2ZW50IGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoY29sLCB2YWx1ZSwgZm9udFNpemUpIHtcclxuICAgICAgICBzdXBlcignaGVhZGVyLXVwZGF0ZScsXHJcbiAgICAgICAgICAgIHtkZXRhaWwgOiB7dmFsdWUgOiB2YWx1ZSwgY29sIDogY29sLCBmb250U2l6ZSA6IGZvbnRTaXplfX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBHYW1lQm9hcmQgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVhZHkoKXtcclxuICAgICAgICBhd2FpdCBzdXBlci5yZWFkeSgpO1xyXG4gICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDY7IGNvbCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0SGVhZGVyKGNvbCkuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldmVudCk9PmV2ZW50LnRhcmdldC5maXRUZXh0Lm5vdGlmeSgxLCAxKSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldEhlYWRlcihjb2wpLmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIChldmVudCk9PntcclxuICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZSA9IGV2ZW50LnRhcmdldC5zdHlsZVtcImZvbnQtc2l6ZVwiXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgSGVhZGVyVXBkYXRlRXZlbnQoY29sLCBldmVudC50YXJnZXQudGV4dCwgZm9udFNpemUpKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCA1OyByb3crKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRDZWxsKHJvdywgY29sKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ2VsbFNlbGVjdEV2ZW50KHJvdywgY29sKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgdmFsdWUgb2YgYSBjYXRlZ29yeVxyXG4gICAgICogQHBhcmFtIGluZGV4XHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBzZXRIZWFkZXIoaW5kZXgsIHZhbHVlLCBmb250U2l6ZSwgbG9jayA9IGZhbHNlKXtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuZ2V0SGVhZGVyKGluZGV4KTtcclxuICAgICAgICBlbGVtZW50LnRleHQgPSB2YWx1ZTtcclxuICAgICAgICBjb25zb2xlLmxvZyhmb250U2l6ZSk7XHJcbiAgICAgICAgaWYgKGZvbnRTaXplKSBlbGVtZW50LnN0eWxlW1wiZm9udC1zaXplXCJdID0gZm9udFNpemU7XHJcbiAgICAgICAgaWYgKGxvY2spe1xyXG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImNvbnRlbnRFZGl0YWJsZVwiLCBcImZhbHNlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlIHRoZSBoZWFkZXIgaHRtbCBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gaW5kZXhcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBnZXRIZWFkZXIoaW5kZXgpe1xyXG4gICAgICAgIGlmICh0eXBlb2YgaW5kZXggIT09IFwibnVtYmVyXCIgfHwgaW5kZXggPCAwIHx8IGluZGV4ID4gNikgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBpbmRleDogXCIgKyBpbmRleCk7XHJcbiAgICAgICAgbGV0IHNlbGVjdG9yID0gYFtkYXRhLXJvdz0naCddW2RhdGEtY29sPScke2luZGV4fSddID4gLnZhbHVlYDtcclxuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgdmFsdWUgb2YgYSBub24tY2F0ZWdvcnkgY2VsbC5cclxuICAgICAqIEBwYXJhbSByb3dcclxuICAgICAqIEBwYXJhbSBjb2xcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBzZXRDZWxsKHJvdywgY29sLCB2YWx1ZSA9IFwiXCIpe1xyXG4gICAgICAgIHRoaXMuZ2V0Q2VsbChyb3csIGNvbCkudGV4dENvbnRlbnQgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDZWxsKHJvdywgY29sKXtcclxuICAgICAgICBsZXQgc2VsZWN0b3IgPSBgW2RhdGEtcm93PVwiJHtyb3d9XCJdW2RhdGEtY29sPVwiJHtjb2x9XCJdID4gLnZhbHVlYDtcclxuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDb21wbGV0ZShyb3csIGNvbCwgdmFsdWUpe1xyXG4gICAgICAgIGlmICh0eXBlb2Ygcm93ICE9PSBcIm51bWJlclwiIHx8IHJvdyA8IDAgfHwgcm93ID4gNikgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCByb3c6IFwiICsgcm93KTtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbCAhPT0gXCJudW1iZXJcIiB8fCBjb2wgPCAwIHx8IGNvbCA+IDUpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgY29sOiBcIiArIGNvbCk7XHJcbiAgICAgICAgdGhpcy5nZXRDZWxsKHJvdywgY29sKS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWNvbXBsZXRlXCIsIHZhbHVlKTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnZ2FtZS1ib2FyZCcsIEdhbWVCb2FyZCk7XHJcbm1vZHVsZS5leHBvcnRzID0gR2FtZUJvYXJkOyIsImNsYXNzIE1lbnV7XHJcbiAgICBpbml0KG1lbnVTZWxlY3Rvcil7XHJcbiAgICAgICAgdGhpcy5tZW51U2VsZWN0b3IgPSBtZW51U2VsZWN0b3I7XHJcbiAgICAgICAgdGhpcy5tZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy50b2dnbGVNZW51KCkpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb25NZW51KCk7XHJcblxyXG4gICAgICAgIHRoaXMubWVudUFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCk9PiB0aGlzLm1vdXNlTGVhdmUoKSk7XHJcbiAgICAgICAgdGhpcy5tZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpPT4gdGhpcy5tb3VzZUxlYXZlKCkpO1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCk9PiB0aGlzLm1vdXNlRW50ZXIoKSk7XHJcbiAgICAgICAgdGhpcy5tZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpPT4gdGhpcy5tb3VzZUVudGVyKCkpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtYXV0b2Nsb3NlPSd0cnVlJ1wiKS5mb3JFYWNoKChlbGUpPT4ge1xyXG4gICAgICAgICAgICBlbGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLmNsb3NlKCkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnN1Yi1tZW51XCIpLmZvckVhY2goKGVsZSk9PntcclxuICAgICAgICAgICAgZWxlLnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1sYWJlbFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTWVudShlbGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoKXtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc3ViLW1lbnUgPiAubWVudS1hcmVhXCIpLmZvckVhY2goKGVsZSk9PntcclxuICAgICAgICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb3Blbigpe1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uTWVudSgpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlTGVhdmUoKXtcclxuICAgICAgICBpZiAodGhpcy50aW1lb3V0KSByZXR1cm47XHJcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgfSwgNTAwKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZUVudGVyKCl7XHJcbiAgICAgICAgaWYgKCF0aGlzLnRpbWVvdXQpIHJldHVybjtcclxuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuICAgICAgICB0aGlzLnRpbWVvdXQgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRvZ2dsZU1lbnUoZWxlbWVudCl7XHJcbiAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQgPz8gdGhpcy5tZW51QXJlYTtcclxuICAgICAgICBpZiAoIWVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWVudS1hcmVhXCIpKXtcclxuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvcihcIi5tZW51LWFyZWFcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJoaWRkZW5cIikpe1xyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibWVudS1hcmVhXCIpKXtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIubWVudS1hcmVhXCIpLmZvckVhY2goXHJcbiAgICAgICAgICAgICAgICAoZWxlKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHBvc2l0aW9uTWVudSgpe1xyXG4gICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLm1lbnVCdXR0b24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdDtcclxuICAgICAgICBjb25zdCBiV2lkdGggPSB0aGlzLm1lbnVCdXR0b24uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XHJcbiAgICAgICAgY29uc3QgbVdpZHRoID0gdGhpcy5tZW51QXJlYS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuICAgICAgICBpZiAoKGxlZnQgKyBiV2lkdGggKyBtV2lkdGggKyAyKSA+IHdpbmRvdy5pbm5lcldpZHRoKXtcclxuICAgICAgICAgICAgdGhpcy5zZXRNZW51TGVmdCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TWVudVJpZ2h0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldE1lbnVMZWZ0KCl7XHJcbiAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMubWVudUJ1dHRvbi5vZmZzZXRMZWZ0O1xyXG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5tZW51QXJlYS5vZmZzZXRXaWR0aDtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLnN0eWxlLmxlZnQgPSAobGVmdCAtIHdpZHRoIC0gMikgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWVudVJpZ2h0KCl7XHJcbiAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMubWVudUJ1dHRvbi5vZmZzZXRMZWZ0O1xyXG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5tZW51QnV0dG9uLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuc3R5bGUubGVmdCA9IChsZWZ0ICsgd2lkdGggKyAyKSArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWVudSgpe1xyXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMubWVudVNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWVudUJ1dHRvbigpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1lbnUucXVlcnlTZWxlY3RvcihcIi5tZW51LWljb25cIik7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG1lbnVBcmVhKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWVudS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYXJlYVwiKTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNZW51OyIsImNsYXNzIE1vZGVsIHtcclxuICAgIGluaXQobmFtZSA9IFwiR2FtZSBOYW1lXCIpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsID0ge1xyXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICByb3VuZHM6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRDYXRlZ29yeVJvdW5kKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IG5hbWUoc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwubmFtZSA9IHN0cmluZztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbmFtZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWwubmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQoZ2FtZU1vZGVsKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQgPSAwO1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsID0gZ2FtZU1vZGVsO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Um91bmQoaW5kZXgpIHtcclxuICAgICAgICBpbmRleCA9IGluZGV4ID8/IHRoaXMuY3VycmVudFJvdW5kO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5yb3VuZHNbaW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFRPRE8gdGVzdFxyXG4gICAgc2V0Um91bmRJbmRleChmcm9tLCB0byl7XHJcbiAgICAgICAgbGV0IHIgPSB0aGlzLmdhbWVNb2RlbC5yb3VuZHM7XHJcbiAgICAgICAgaWYgKHIubGVuZ3RoIDw9IDEpIHJldHVybjtcclxuICAgICAgICBbcltmcm9tXSwgclt0b11dID0gW3JbdG9dLCByW2Zyb21dXTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb2x1bW4oaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb3VuZCgpLmNvbHVtbltpbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2VsbChyb3csIGNvbHVtbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldENvbHVtbihjb2x1bW4pLmNlbGxbcm93XTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVSb3VuZCgpIHtcclxuICAgICAgICBpZiAodGhpcy5yb3VuZENvdW50ID09PSAxKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwucm91bmRzLnNwbGljZSh0aGlzLmN1cnJlbnRSb3VuZCwgMSk7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdW5kID49IHRoaXMucm91bmRDb3VudCkgdGhpcy5jdXJyZW50Um91bmQgPSB0aGlzLnJvdW5kQ291bnQgLSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZE11bHRpcGxlQ2hvaWNlUm91bmQoKXtcclxuICAgICAgICBsZXQgcm91bmQgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IE1vZGVsLnF1ZXN0aW9uVHlwZS5NVUxUSVBMRV9DSE9JQ0UsXHJcbiAgICAgICAgICAgIHF1ZXN0aW9uIDogXCJcIixcclxuICAgICAgICAgICAgYW5zd2VycyA6IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspe1xyXG4gICAgICAgICAgICByb3VuZC5hbnN3ZXJzW2ldID0ge1xyXG4gICAgICAgICAgICAgICAgdGV4dCA6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBpc1RydWUgOiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5yb3VuZHMucHVzaChyb3VuZCk7XHJcbiAgICAgICAgcmV0dXJuIHJvdW5kO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZENhdGVnb3J5Um91bmQoKSB7XHJcbiAgICAgICAgbGV0IHJvdW5kID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBNb2RlbC5xdWVzdGlvblR5cGUuQ0FURUdPUlksXHJcbiAgICAgICAgICAgIGNvbHVtbjogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICByb3VuZC5jb2x1bW5baV0gPSB7XHJcbiAgICAgICAgICAgICAgICBjYXRlZ29yeTogXCJcIixcclxuICAgICAgICAgICAgICAgIGNlbGw6IFtdXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgNTsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICByb3VuZC5jb2x1bW5baV0uY2VsbFtqXSA9IHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogKGogKyAxKSAqIDEwMCxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcInRleHRcIixcclxuICAgICAgICAgICAgICAgICAgICBxOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGE6IFwiXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwucm91bmRzLnB1c2gocm91bmQpO1xyXG4gICAgICAgIHJldHVybiByb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgcm91bmRDb3VudCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWwucm91bmRzLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBpbmNyZW1lbnRSb3VuZCgpe1xyXG4gICAgICAgIHRoaXMuY3VycmVudFJvdW5kKys7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdW5kID49IHRoaXMucm91bmRDb3VudCkgdGhpcy5jdXJyZW50Um91bmQgPSB0aGlzLnJvdW5kQ291bnQgLSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGRlY3JlbWVudFJvdW5kKCl7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQtLTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um91bmQgPCAwKSB0aGlzLmN1cnJlbnRSb3VuZCA9IDBcclxuICAgIH1cclxuXHJcbiAgICBpbmNyZWFzZVZhbHVlKCkge1xyXG4gICAgICAgIGxldCByb3VuZCA9IHRoaXMuZ2V0Um91bmQoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXS5jZWxsW2pdLnZhbHVlICo9IDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGVjcmVhc2VWYWx1ZSgpIHtcclxuICAgICAgICBsZXQgcm91bmQgPSB0aGlzLmdldFJvdW5kKCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgNTsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICByb3VuZC5jb2x1bW5baV0uY2VsbFtqXS52YWx1ZSAvPSAyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5Nb2RlbC5xdWVzdGlvblR5cGUgPSB7XHJcbiAgICBDQVRFR09SWSA6IFwiY2hvaWNlXCIsXHJcbiAgICBNVUxUSVBMRV9DSE9JQ0UgOiBcIm11bHRpcGxlX2Nob2ljZVwiXHJcbn07XHJcblxyXG5leHBvcnQgZGVmYXVsdCBNb2RlbDsiLCJjb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcbnJlcXVpcmUoXCIuL0NoZWNrQm94LmpzXCIpO1xyXG5cclxuY2xhc3MgVGV4dFVwZGF0ZSBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKGluZGV4LCB0ZXh0KSB7XHJcbiAgICAgICAgc3VwZXIoJ3RleHQtdXBkYXRlJyxcclxuICAgICAgICAgICAge2RldGFpbCA6IHtpbmRleCA6IGluZGV4LCB0ZXh0IDogdGV4dH19XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgVmFsdWVVcGRhdGUgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcihpbmRleCwgdmFsdWUpIHtcclxuICAgICAgICBzdXBlcigndmFsdWUtdXBkYXRlJyxcclxuICAgICAgICAgICAge2RldGFpbCA6IHtpbmRleCA6IGluZGV4LCB2YWx1ZSA6IHZhbHVlfX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBRdWVzdGlvbkNsaWNrIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoJ2J1dHRvbi1xdWVzdGlvbicpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBNdWx0aXBsZUNob2ljZVBhbmUgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuXHJcbiAgICBzZXRNb2RlbChtb2RlbCl7XHJcbiAgICAgICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlYWR5KCl7XHJcbiAgICAgICAgYXdhaXQgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMucXVlcnlTZWxlY3RvckFsbChcIi5hbnN3ZXIgPiBuaWRnZXQtdGV4dFwiKSl7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuZml0VGV4dC5sb2NrID0gXCJ2aFwiO1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZXZlbnQpPT50aGlzLnR4dExpc3RlbmVyKGV2ZW50KSk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgKGV2ZW50KT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gZXZlbnQudGFyZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtaW5kZXhcIik7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMucXVlcnlTZWxlY3RvcihgbmlkZ2V0LXRleHRbZGF0YS1pbmRleD1cIiR7aW5kZXh9XCJdYCkudGV4dDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgVGV4dFVwZGF0ZShpbmRleCwgdGV4dCkpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoXCJjaGVjay1ib3hcIikpe1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ2YWx1ZS11cGRhdGVcIiwgKGV2ZW50KT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZXZlbnQudGFyZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1pbmRleFwiKTtcclxuICAgICAgICAgICAgICAgIGxldCB2YWx1ZSA9IGV2ZW50LmRldGFpbC52YWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgVmFsdWVVcGRhdGUoaW5kZXgsIHZhbHVlKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctcXVlc3Rpb25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgUXVlc3Rpb25DbGljaygpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0eHRMaXN0ZW5lcihldmVudCkge1xyXG4gICAgICAgIGlmIChldmVudC53aGljaCA9PT0gMTMpe1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGV2ZW50LnRhcmdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0taW5kZXhcIik7XHJcbiAgICAgICAgICAgIGluZGV4ID0gcGFyc2VJbnQoaW5kZXgpO1xyXG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gNSl7XHJcbiAgICAgICAgICAgICAgICBldmVudC50YXJnZXQuYmx1cigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gYG5pZGdldC10ZXh0W2RhdGEtaW5kZXg9XCIke2luZGV4ICsgMX1cIl1gO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS5mb2N1cygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGV2ZW50LnRhcmdldC5maXRUZXh0Lm5vdGlmeSgxLCAxKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSBidXR0b24geydxdWVzdGlvbicsICdhbnN3ZXInfVxyXG4gICAgICovXHJcbiAgICBoaWdobGlnaHQoYnV0dG9uKXtcclxuICAgICAgICBmb3IgKGxldCBlbGUgb2YgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKGAuc2VsZWN0ZWRgKSkgZWxlLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoYCNzaG93LSR7YnV0dG9ufWApLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUZXh0KGluZGV4LCB0ZXh0KXtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoYG5pZGdldC10ZXh0W2RhdGEtaW5kZXg9XCIke2luZGV4fVwiXWApLnRleHQgPSB0ZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIHNldENoZWNrZWQoaW5kZXgsIHZhbHVlKXtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoYGNoZWNrLWJveFtkYXRhLWluZGV4PVwiJHtpbmRleH1cIl1gKS5jaGVja2VkID0gdmFsdWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ211bHRpcGxlLWNob2ljZS1wYW5lJywgTXVsdGlwbGVDaG9pY2VQYW5lKTtcclxubW9kdWxlLmV4cG9ydHMgPSBNdWx0aXBsZUNob2ljZVBhbmU7IiwiY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCJAVGhhZXJpb3VzL25pZGdldFwiKS5OaWRnZXRFbGVtZW50O1xyXG5cclxuY2xhc3MgVGV4dFVwZGF0ZSBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKHRleHQpIHtcclxuICAgICAgICBzdXBlcigndGV4dC11cGRhdGUnLFxyXG4gICAgICAgICAgICB7ZGV0YWlsIDoge3RleHQgOiB0ZXh0fX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBCb2FyZENsaWNrIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoJ2J1dHRvbi1ib2FyZCcpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBRdWVzdGlvbkNsaWNrIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoJ2J1dHRvbi1xdWVzdGlvbicpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBBbnN3ZXJDbGljayBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCdidXR0b24tYW5zd2VyJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFF1ZXN0aW9uUGFuZSBleHRlbmRzIE5pZGdldEVsZW1lbnR7XHJcblxyXG4gICAgYXN5bmMgcmVhZHkoKXtcclxuICAgICAgICBhd2FpdCBzdXBlci5yZWFkeSgpO1xyXG5cclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1ib2FyZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBCb2FyZENsaWNrKCkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1xdWVzdGlvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBRdWVzdGlvbkNsaWNrKCkpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1hbnN3ZXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQW5zd2VyQ2xpY2soKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dC1jb250ZW50c1wiKS5mb2N1cygpKTtcclxuXHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3RleHQtY29udGVudHNcIikuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgYXN5bmMgKCk9PntcclxuICAgICAgICAgICAgbGV0IHRleHQgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dC1jb250ZW50c1wiKS50ZXh0O1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFRleHRVcGRhdGUodGV4dC50cmltKCkpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjbGVhcigpe1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpLnRleHQgPSBcIlwiO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRleHQodGV4dCl7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiLnRleHQtY29udGVudHNcIikudGV4dCA9IHRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0gYnV0dG9uIHsncXVlc3Rpb24nLCAnYW5zd2VyJ31cclxuICAgICAqL1xyXG4gICAgaGlnaGxpZ2h0KGJ1dHRvbil7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlIG9mIHRoaXMucXVlcnlTZWxlY3RvckFsbChgLnNlbGVjdGVkYCkpIGVsZS5jbGFzc0xpc3QucmVtb3ZlKFwic2VsZWN0ZWRcIik7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKGAjc2hvdy0ke2J1dHRvbn1gKS5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGJvYXJkQnV0dG9uKHZhbHVlKXtcclxuICAgICAgICBpZiAodmFsdWUpe1xyXG4gICAgICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1ib2FyZFwiKS5zaG93KCk7XHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LWJvYXJkXCIpLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ3F1ZXN0aW9uLXBhbmUnLCBRdWVzdGlvblBhbmUpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXN0aW9uUGFuZTtcclxuXHJcblxyXG5cclxuIiwiXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgLy8gVGhlIEJyb3dzZXIgQVBJIGtleSBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuXHJcbiAgICBkZXZlbG9wZXJLZXkgOiAnQUl6YVN5QUJjZExtVDZISF83R284MnFfSUJHSTNqbTZVTDR3NFEwJyxcclxuXHJcbiAgICAvLyBUaGUgQ2xpZW50IElEIG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS4gUmVwbGFjZSB3aXRoIHlvdXIgb3duIENsaWVudCBJRC5cclxuICAgIGNsaWVudElkIDogXCIxNTg4MjMxMzQ2ODEtOThiZ2thbmdvbHRrNjM2dWtmOHBvZmVpczdwYTdqYmsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb21cIixcclxuXHJcbiAgICAvLyBSZXBsYWNlIHdpdGggeW91ciBvd24gcHJvamVjdCBudW1iZXIgZnJvbSBjb25zb2xlLmRldmVsb3BlcnMuZ29vZ2xlLmNvbS5cclxuICAgIGFwcElkIDogXCIxNTg4MjMxMzQ2ODFcIixcclxuXHJcbiAgICAvLyBBcnJheSBvZiBBUEkgZGlzY292ZXJ5IGRvYyBVUkxzIGZvciBBUElzIHVzZWQgYnkgdGhlIHF1aWNrc3RhcnRcclxuICAgIGRpc2NvdmVyeURvY3MgOiBbXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9kaXNjb3ZlcnkvdjEvYXBpcy9kcml2ZS92My9yZXN0XCJdLFxyXG5cclxuICAgIC8vIFNjb3BlIHRvIHVzZSB0byBhY2Nlc3MgdXNlcidzIERyaXZlIGl0ZW1zLlxyXG4gICAgc2NvcGU6IFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9kcml2ZS5maWxlXCJcclxufSJdfQ==
