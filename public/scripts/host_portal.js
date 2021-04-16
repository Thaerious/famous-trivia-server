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

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var AbstractView = /*#__PURE__*/function () {
  function AbstractView() {
    (0, _classCallCheck2["default"])(this, AbstractView);
    this.DOM = {};
    this.DOM.gameBoard = document.querySelector("game-board");
    this.DOM.questionPage = document.querySelector("#text-question");
    this.DOM.questionText = document.querySelector("#text-contents");
    this.DOM.buttons = document.querySelector("#buttons");
    this.DOM.buzzer_button = document.querySelector("#buzz");
    this.DOM.accept_button = document.querySelector("#accept_answer");
    this.DOM.reject_button = document.querySelector("#reject_answer");
    this.DOM.start_timer_button = document.querySelector("#start_timer");
    this.DOM.time_out_button = document.querySelector("#time_out");
    this.DOM.continue_button = document.querySelector("#continue");
    this.DOM.back_button = document.querySelector("#back");
    this.DOM.playing_indicator = document.querySelector("#playing");
    this.DOM.clock = document.querySelector("#clock");
    this.DOM.menuIndicator = document.querySelector("#menu-indicator");
    this.DOM.menuArea = document.querySelector("#menu-area");
    this.DOM.menuLogout = document.querySelector("#menu-logout");
    this.assertDOM(); // this.setupMenu();
  }

  (0, _createClass2["default"])(AbstractView, [{
    key: "assertDOM",
    value: function assertDOM() {
      for (var key in this.DOM) {
        console.assert(this.DOM[key] !== undefined, key);
      }
    }
  }, {
    key: "updateModel",
    value: function updateModel(update) {
      switch (update.state) {
        case 0:
          break;

        case 1:
          break;

        case 2:
          break;

        case 3:
          break;

        case 4:
          this.DOM.gameBoard.show();
          this.fillJeopardyCategories(update);
          this.fillJeopardyCells(update);
          break;

        case 5:
          this.DOM.gameBoard.show();
          this.fillJeopardyCategories(update);
          this.fillJeopardyCells(update);
          break;

        case 6:
          this.DOM.gameBoard.show();
          this.fillJeopardyCategories(update);
          this.fillJeopardyCells(update);
          break;

        case 7:
          this.DOM.gameBoard.show();
          this.fillJeopardyCategories(update);
          this.fillJeopardyCells(update);
          break;

        case 8:
          this.DOM.gameBoard.show();
          this.fillJeopardyCategories(update);
          this.fillJeopardyCells(update);
          break;

        case 9:
          this.DOM.gameBoard.show();
          this.fillJeopardyCategories(update);
          this.fillJeopardyCells(update);
          break;

        default:
          break;
      }
    }
  }, {
    key: "fillJeopardyCategories",
    value: function fillJeopardyCategories(update) {
      for (var i = 0; i < 6; i++) {
        var category = update.model.round.categories[i];
        this.DOM.gameBoard.setHeader(i, category["text"], category["font-size"], true);
      }
    }
  }, {
    key: "fillJeopardyCells",
    value: function fillJeopardyCells(update) {
      var round = update.model.round;

      for (var c = 0; c < 6; c++) {
        for (var r = 0; r < 5; r++) {
          if (round.spent[c][r]) continue;
          this.DOM.gameBoard.setCell(r, c, round.values[c][r]);
        }
      }
    }
  }]);
  return AbstractView;
}();

module.exports = AbstractView;

},{"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31}],42:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var HostController = /*#__PURE__*/function () {
  function HostController(ws, view) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, HostController);
    this.ws = ws;
    this.view = view;
    this.ws.addEventListener('message', function (event) {
      return _this.process(JSON.parse(event.data));
    });
    this.ws.addEventListener('close', function (event) {
      return _this.onClose(event);
    });

    window.start = function () {
      this.send({
        action: "start"
      });
    }.bind(this);
  }

  (0, _createClass2["default"])(HostController, [{
    key: "onUpdate",
    value: function onUpdate() {}
  }, {
    key: "process",
    value: function process(message) {
      if (message.action !== "ping") console.log(message);

      switch (message.action) {
        case "connection_established":
          this.send({
            action: "request_model"
          });
          break;

        case "update_model":
          this.view.updateModel(message.data);
          break;
      }
    }
  }, {
    key: "onClose",
    value: function onClose(event) {}
  }, {
    key: "send",
    value: function send(msg) {
      console.log("send: ".concat(JSON.stringify(msg)));
      this.ws.send(JSON.stringify(msg));
    }
  }]);
  return HostController;
}();

var _default = HostController;
exports["default"] = _default;

},{"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31}],43:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _AbstractView2 = _interopRequireDefault(require("./AbstractView.js"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var HostView = /*#__PURE__*/function (_AbstractView) {
  (0, _inherits2["default"])(HostView, _AbstractView);

  var _super = _createSuper(HostView);

  function HostView() {
    var _this;

    (0, _classCallCheck2["default"])(this, HostView);
    _this = _super.call(this);
    _this.DOM.continueButton = document.querySelector("game-board");
    return _this;
  }

  (0, _createClass2["default"])(HostView, [{
    key: "updateModel",
    value: function updateModel(update) {
      (0, _get2["default"])((0, _getPrototypeOf2["default"])(HostView.prototype), "updateModel", this).call(this, update);

      switch (update.state) {
        case 0:
          break;

        case 1:
          break;

        case 2:
          break;

        case 3:
          break;

        case 4:
          break;

        case 5:
          break;

        case 6:
          break;

        case 7:
          break;

        case 8:
          break;

        case 9:
          break;

        default:
          break;
      }
    }
  }]);
  return HostView;
}(_AbstractView2["default"]);

var _default = HostView;
exports["default"] = _default;

},{"./AbstractView.js":41,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/get":28,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":34}],44:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _FileOps = _interopRequireDefault(require("./modules/FileOps.js"));

var _Authenticate = _interopRequireDefault(require("./modules/Authenticate.js"));

var _HostView = _interopRequireDefault(require("./HostView.js"));

var _HostController = _interopRequireDefault(require("./HostController"));

require("./modules/GameBoard.js");

require("./modules/MultipleChoicePane.js");

require("./modules/CheckBox.js");

require("./modules/PlayerContainer.js");

require("./modules/PlayerPanel.js");

var fileOps = new _FileOps["default"]();
var model = null;
var questionPane = null;
var editorPane = null;
window.onload = /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  var start, ws, end, time;
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          start = new Date();
          window.hostView = new _HostView["default"](); // new Menu().init("#menu");

          _context.prev = 2;
          _context.next = 5;
          return new _Authenticate["default"]().loadClient();

        case 5:
          _context.next = 7;
          return fileOps.loadClient();

        case 7:
          _context.next = 9;
          return sendTokenToServer();

        case 9:
          _context.next = 11;
          return connectWebsocket();

        case 11:
          ws = _context.sent;
          new _HostController["default"](ws, window.hostView);
          _context.next = 18;
          break;

        case 15:
          _context.prev = 15;
          _context.t0 = _context["catch"](2);
          console.log(_context.t0);

        case 18:
          end = new Date();
          time = end - start;
          console.log("Load Time " + time + " ms");

        case 21:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, null, [[2, 15]]);
}));

function sendTokenToServer() {
  return new Promise(function (resolve, reject) {
    var token = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().id_token;
    var xhttp = new XMLHttpRequest();
    xhttp.addEventListener("load", function (event) {
      var response = JSON.parse(xhttp.responseText);
      if (response.result === "success") resolve();else reject(new Error("token rejected"));
    });
    xhttp.open("POST", "connect-host");
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({
      token: token
    }));
  });
}

function connectWebsocket() {
  var url = window.origin;

  if (url.startsWith("http:")) {
    url = "ws" + url.substr(4) + "/game-service.ws";
  } else {
    url = "wss" + url.substr(5) + "/game-service.ws";
  }

  return new Promise(function (resolve, reject) {
    var socket = new WebSocket(url);
    socket.addEventListener('error', function (event) {
      return reject(event);
    });
    socket.addEventListener('open', function (event) {
      return resolve(socket);
    });
  });
}

},{"./HostController":42,"./HostView.js":43,"./modules/Authenticate.js":45,"./modules/CheckBox.js":46,"./modules/FileOps.js":47,"./modules/GameBoard.js":48,"./modules/MultipleChoicePane.js":49,"./modules/PlayerContainer.js":50,"./modules/PlayerPanel.js":51,"@babel/runtime/helpers/asyncToGenerator":24,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/regenerator":39}],45:[function(require,module,exports){
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

},{"./googleFields.js":52,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31}],46:[function(require,module,exports){
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

},{"@Thaerious/nidget":22,"@babel/runtime/helpers/asyncToGenerator":24,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/get":28,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":34,"@babel/runtime/helpers/wrapNativeSuper":38,"@babel/runtime/regenerator":39}],47:[function(require,module,exports){
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

},{"@babel/runtime/helpers/asyncToGenerator":24,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/regenerator":39}],48:[function(require,module,exports){
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

},{"@Thaerious/nidget":22,"@babel/runtime/helpers/asyncToGenerator":24,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/get":28,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":34,"@babel/runtime/helpers/wrapNativeSuper":38,"@babel/runtime/regenerator":39}],49:[function(require,module,exports){
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

},{"./CheckBox.js":46,"@Thaerious/nidget":22,"@babel/runtime/helpers/asyncToGenerator":24,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/get":28,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":34,"@babel/runtime/helpers/wrapNativeSuper":38,"@babel/runtime/regenerator":39}],50:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _PlayerPanel = _interopRequireDefault(require("./PlayerPanel.js"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var NidgetElement = require("@Thaerious/nidget").NidgetElement;

var PlayerContainer = /*#__PURE__*/function (_NidgetElement) {
  (0, _inherits2["default"])(PlayerContainer, _NidgetElement);

  var _super = _createSuper(PlayerContainer);

  function PlayerContainer() {
    (0, _classCallCheck2["default"])(this, PlayerContainer);
    return _super.call(this);
  }

  (0, _createClass2["default"])(PlayerContainer, [{
    key: "ready",
    value: function () {
      var _ready = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _get2["default"])((0, _getPrototypeOf2["default"])(PlayerContainer.prototype), "ready", this).call(this);

              case 2:
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
    key: "addPlayer",
    value: function addPlayer(name) {
      var score = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var element = document.createElement("player-panel");
      element.name = name;
      element.score = score;
      this.append(element);
    }
  }]);
  return PlayerContainer;
}(NidgetElement);

window.customElements.define('player-container', PlayerContainer);
module.exports = PlayerContainer;

},{"./PlayerPanel.js":51,"@Thaerious/nidget":22,"@babel/runtime/helpers/asyncToGenerator":24,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/get":28,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":34,"@babel/runtime/regenerator":39}],51:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

require("./PlayerPanel.js");

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var NidgetElement = require("@Thaerious/nidget").NidgetElement;

var PlayerPanel = /*#__PURE__*/function (_NidgetElement) {
  (0, _inherits2["default"])(PlayerPanel, _NidgetElement);

  var _super = _createSuper(PlayerPanel);

  function PlayerPanel() {
    (0, _classCallCheck2["default"])(this, PlayerPanel);
    return _super.call(this);
  }

  (0, _createClass2["default"])(PlayerPanel, [{
    key: "ready",
    value: function () {
      var _ready = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return (0, _get2["default"])((0, _getPrototypeOf2["default"])(PlayerPanel.prototype), "ready", this).call(this);

              case 2:
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
    key: "name",
    get: function get() {
      return this.querySelector("#name").text;
    },
    set: function set(value) {
      this.querySelector("#name").text = value;
    }
  }, {
    key: "score",
    get: function get() {
      return this.querySelector("#score").text;
    },
    set: function set(value) {
      this.querySelector("#score").text = value;
    }
  }, {
    key: "buzz",
    value: function buzz() {
      this.querySelector("#buzz-light").classList.add("sweep-right");
      this.querySelector("#name").classList.add("active");
      this.querySelector("#score").classList.add("active");
    }
  }, {
    key: "clear",
    value: function clear() {
      this.querySelector("#buzz-light").classList.remove("sweep-right");
      this.querySelector("#name").classList.remove("active");
      this.querySelector("#score").classList.remove("active");
      this.querySelectorAll(".clock-tick").forEach(function (e) {
        return e.classList.remove("spent");
      });
    }
  }, {
    key: "setTimer",
    value: function setTimer(percent) {
      if (percent <= 80) this.querySelector(".clock-tick[data-index='4']").classList.add("spent");
      if (percent <= 60) this.querySelector(".clock-tick[data-index='3']").classList.add("spent");
      if (percent <= 40) this.querySelector(".clock-tick[data-index='2']").classList.add("spent");
      if (percent <= 20) this.querySelector(".clock-tick[data-index='1']").classList.add("spent");
      if (percent <= 0) this.querySelector(".clock-tick[data-index='0']").classList.add("spent");
    }
  }]);
  return PlayerPanel;
}(NidgetElement);

window.customElements.define('player-panel', PlayerPanel);
module.exports = PlayerPanel;

},{"./PlayerPanel.js":51,"@Thaerious/nidget":22,"@babel/runtime/helpers/asyncToGenerator":24,"@babel/runtime/helpers/classCallCheck":25,"@babel/runtime/helpers/createClass":27,"@babel/runtime/helpers/get":28,"@babel/runtime/helpers/getPrototypeOf":29,"@babel/runtime/helpers/inherits":30,"@babel/runtime/helpers/interopRequireDefault":31,"@babel/runtime/helpers/possibleConstructorReturn":34,"@babel/runtime/regenerator":39}],52:[function(require,module,exports){
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

},{}]},{},[44])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2VkL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0Fic3RyYWN0TW9kZWwuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0RyYWdIYW5kbGVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9GaWxlT3BlcmF0aW9ucy5qcyIsIi4uLy4uL25pZGdldC9zcmMvSW50ZXJmYWNlcy5qcyIsIi4uLy4uL25pZGdldC9zcmMvTW91c2VVdGlsaXRpZXMuanMiLCIuLi8uLi9uaWRnZXQvc3JjL05pZGdldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0RWxlbWVudC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0U3R5bGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL1RyYW5zZm9ybWVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b24uanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblNldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU3RhdGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldENvbnRhaW5lci5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SFRNTEltYWdlLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRJbWFnZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0VGV4dC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJhZy5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJvcC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvTW91c2UuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL01vdmFibGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL1Jlc2l6ZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvcHJvamVjdEZpbGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3luY1RvR2VuZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2suanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jb25zdHJ1Y3QuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jcmVhdGVDbGFzcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2dldC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2dldFByb3RvdHlwZU9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pc05hdGl2ZUZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvcG9zc2libGVDb25zdHJ1Y3RvclJldHVybi5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3NldFByb3RvdHlwZU9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvc3VwZXJQcm9wQmFzZS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZi5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3dyYXBOYXRpdmVTdXBlci5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUuanMiLCJzcmMvY2xpZW50L0Fic3RyYWN0Vmlldy5qcyIsInNyYy9jbGllbnQvSG9zdENvbnRyb2xsZXIuanMiLCJzcmMvY2xpZW50L0hvc3RWaWV3LmpzIiwic3JjL2NsaWVudC9ob3N0X3BvcnRhbC5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9BdXRoZW50aWNhdGUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvQ2hlY2tCb3guanMiLCJzcmMvY2xpZW50L21vZHVsZXMvRmlsZU9wcy5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9HYW1lQm9hcmQuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvTXVsdGlwbGVDaG9pY2VQYW5lLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL1BsYXllckNvbnRhaW5lci5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9QbGF5ZXJQYW5lbC5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9nb29nbGVGaWVsZHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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dGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnO1xyXG5jbGFzcyBBYnN0cmFjdE1vZGVsIHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGFic3RyYWN0IG1vZGVsLiAgSWYgZGVsZWdhdGUgaXMgcHJvdmlkZWQgdGhlbiBhbGwgbGlzdGVuZXJcclxuICAgICAqIGFkZHMgYW5kIG5vdGlmaWVzIGFyZSBwZXJmb3JtZWQgb24gdGhlIGRlbGVnYXRlIGxpc3RlbmVyIGNvbGxlY3Rpb24uXHJcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGRlbGVnYXRlXHJcbiAgICAgKiBAcmV0dXJucyB7bm0kX0Fic3RyYWN0TW9kZWwuQWJzdHJhY3RNb2RlbH1cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5hYnN0cmFjdE1vZGVsTGlzdGVuZXJzID0gW107ICAgICAgICBcclxuICAgIH1cclxuXHJcbiAgICBnZXREZWxlZ2F0ZSgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRlbGVnYXRlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXREZWxlZ2F0ZShkZWxlZ2F0ZSA9IG51bGwpe1xyXG4gICAgICAgIGlmIChkZWxlZ2F0ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmRlbGVnYXRlID0gdGhpcztcclxuICAgICAgICAgICAgdGhpcy5hYnN0cmFjdE1vZGVsTGlzdGVuZXJzID0gW107XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IGRlbGVnYXRlLmRlbGVnYXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5kZWxlZ2F0ZSA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5kZWZpbmVkIGRlbGVnYXRlXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgYWRkTGlzdGVuZXIobGlzdGVuZXIpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSBcIm9iamVjdFwiKXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBBYnN0cmFjdE1vZGVsIGxpc3RlbmVyIHR5cGU6IFwiICsgdHlwZW9mIGxpc3RlbmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZS5hYnN0cmFjdE1vZGVsTGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsbCBhcyBub3RpZnlMaXN0ZW5lcnMobWV0aG9kTmFtZSwgW21ldGhvZEFyZ3VtZW50MCwgLi4uIG1ldGhvZEFyZ3VtZW50Tl0pXHJcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1ldGhvZFxyXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cclxuICAgICAqL1xyXG4gICAgYXN5bmMgbm90aWZ5TGlzdGVuZXJzKG1ldGhvZCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiRVZFTlQgXCIgKyB0aGlzLmRlbGVnYXRlLmNvbnN0cnVjdG9yLm5hbWUgKyBcIiBcIiArIG1ldGhvZCk7XHJcblxyXG4gICAgICAgIEFycmF5LnByb3RvdHlwZS5zaGlmdC5hcHBseShhcmd1bWVudHMpO1xyXG4gICAgICAgIGxldCBldmVudCA9IHtcclxuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXHJcbiAgICAgICAgICAgIGFyZ3M6IGFyZ3VtZW50cyxcclxuICAgICAgICAgICAgc291cmNlOiB0aGlzLFxyXG4gICAgICAgICAgICBsaXN0ZW5lcnM6IFtdXHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICB3aW5kb3cubGFzdEV2ZW50ID0gZXZlbnQ7XHJcbiAgICAgICAgd2luZG93Lm5FdmVudHMucHVzaCh3aW5kb3cubGFzdEV2ZW50KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgbGlzdGVuZXIgb2YgdGhpcy5kZWxlZ2F0ZS5hYnN0cmFjdE1vZGVsTGlzdGVuZXJzKSB7XHJcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lclttZXRob2RdKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiICsgXCIgKyBsaXN0ZW5lci5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgKyBtZXRob2QpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93Lmxhc3RFdmVudC5saXN0ZW5lcnMucHVzaChsaXN0ZW5lci5jb25zdHJ1Y3Rvci5uYW1lKTsgICAgICAgXHJcbiAgICAgICAgICAgICAgICBhd2FpdCBsaXN0ZW5lclttZXRob2RdLmFwcGx5KGxpc3RlbmVyLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcltBYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lcl0pe1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCIgKyBcIiArIGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUgKyBcIiBcIiArIEFic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyKTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5sYXN0RXZlbnQubGlzdGVuZXJzLnB1c2gobGlzdGVuZXIuY29uc3RydWN0b3IubmFtZSk7ICAgICAgIFxyXG4gICAgICAgICAgICAgICAgYXdhaXQgbGlzdGVuZXJbQWJzdHJhY3RNb2RlbC5kZWZhdWx0TGlzdGVuZXJdLmFwcGx5KGxpc3RlbmVyLCB3aW5kb3cubGFzdEV2ZW50KTsgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbkFic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyID0gXCJuaWRnZXRMaXN0ZW5lclwiO1xyXG53aW5kb3cubkV2ZW50cyA9IFtdO1xyXG5tb2R1bGUuZXhwb3J0cyA9IEFic3RyYWN0TW9kZWw7IiwiJ3VzZSBzdHJpY3QnO1xyXG4vKipcclxuICogU2luZ2xldG9uIGNsYXNzIHRvIHByb3ZpZGluZyBmdW5jdGlvbmFsaXR5IHRvIERyYWdOaWRnZXRzIGFuZCBEcm9wTmlkZ2V0cy5cclxuICogSXQgc3RvcmVzIHRoZSBOaWRnZXQgY3VycmVudGx5IGJlaW5nIGRyYWdnZWQuXHJcbiAqL1xyXG5jbGFzcyBEcmFnSGFuZGxlcntcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMub3ZlciA9IFtdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdXNoT3ZlcihuaWRnZXQpe1xyXG4gICAgICAgIGlmICh0aGlzLm92ZXJIYXMobmlkZ2V0KSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHRoaXMub3Zlci5wdXNoKG5pZGdldCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJlbW92ZU92ZXIobmlkZ2V0KXtcclxuICAgICAgICBpZiAoIXRoaXMub3ZlckhhcyhuaWRnZXQpKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5vdmVyLnNwbGljZSh0aGlzLm92ZXIuaW5kZXhPZihuaWRnZXQpLCAxKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0gICAgXHJcbiAgICBcclxuICAgIG92ZXJIYXMobmlkZ2V0KXtcclxuICAgICAgICByZXR1cm4gdGhpcy5vdmVyLmluZGV4T2YobmlkZ2V0KSAhPT0gLTE7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNldChuaWRnZXQpe1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5pZGdldDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0KCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaGFzKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudCAhPT0gbnVsbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xlYXIoKXtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBudWxsO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoKXtcclxuICAgICAgICByZXR1cm4gRHJhZ0hhbmRsZXIuaW5zdGFuY2U7XHJcbiAgICB9ICAgIFxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBEcmFnSGFuZGxlcigpO1xyXG5cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4vTmlkZ2V0RWxlbWVudFwiKTtcclxuXHJcbi8qIGdsb2JhbCBVdGlsaXR5ICovXHJcbmNsYXNzIEZpbGVPcGVyYXRpb25zIHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGRvbSBlbGVtZW50IGZyb20gYSBmaWxlICh1cmwpLiAgTWFwIHZhcmlhYmxlcyAoJHsuLi59KSB0byBcclxuICAgICAqIGEgdmFsdWUuXHJcbiAgICAgKiBAcGFyYW0ge3R5cGV9IHVybFxyXG4gICAgICogQHBhcmFtIHt0eXBlfSBtYXBcclxuICAgICAqIEByZXR1cm5zIHtub2RlfEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50LmRvbUVsZW1lbnR9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhc3luYyBsb2FkTmlkZ2V0KHVybCwgbWFwKXsgICAgICAgIFxyXG4gICAgICAgIGxldCBlbGVtZW50ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQodXJsLCBtYXApO1xyXG4gICAgICAgIHJldHVybiBuZXcgTmlkZ2V0RWxlbWVudChlbGVtZW50KTtcclxuICAgIH0gICAgXHJcbiAgICBcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IGRvbSBlbGVtZW50IGZyb20gYSBmaWxlICh1cmwpLiAgTWFwIHZhcmlhYmxlcyAoJHsuLi59KSB0byBcclxuICAgICAqIGEgdmFsdWUuXHJcbiAgICAgKiBAcGFyYW0ge3R5cGV9IHVybFxyXG4gICAgICogQHBhcmFtIHt0eXBlfSBtYXBcclxuICAgICAqIEByZXR1cm5zIHtub2RlfEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50LmRvbUVsZW1lbnR9XHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhc3luYyBsb2FkRE9NRWxlbWVudCh1cmwsIG1hcCA9IG5ldyBNYXAoKSl7ICAgICAgICBcclxuICAgICAgICBpZiAobWFwIGluc3RhbmNlb2YgTWFwID09PSBmYWxzZSkgbWFwID0gRmlsZU9wZXJhdGlvbnMub2JqZWN0VG9NYXAobWFwKTsgICAgICAgXHJcbiAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRVUkwodXJsKTtcclxuICAgICAgICByZXR1cm4gRmlsZU9wZXJhdGlvbnMuc3RyaW5nVG9ET01FbGVtZW50KHRleHQsIG1hcCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSB0ZXh0LlxyXG4gICAgICogQHBhcmFtIHt0eXBlfSB0ZXh0XHJcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1hcFxyXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHN0cmluZ1RvRE9NRWxlbWVudCh0ZXh0LCBtYXAgPSBuZXcgTWFwKCkpe1xyXG4gICAgICAgIC8qIHJlcGxhY2UgdmFyaWFibGVzIHdpdGggdmFsdWVzICovXHJcbiAgICAgICAgZm9yIChsZXQga2V5IG9mIG1hcC5rZXlzKCkpeyAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBtYXAuZ2V0KGtleSk7XHJcbiAgICAgICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XT8ke2tleX1bfV1gLCBgZ2ApO1xyXG4gICAgICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCB2YWx1ZSk7ICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyogcmVwbGFjZSB1bmZpbGxlZCB2YXJpYWJsZXMgd2l0aCBlbXB0eSAqL1xyXG4gICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XVtefV0qW31dYCwgYGdgKTtcclxuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCBcIlwiKTsgXHJcblxyXG4gICAgICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSB0ZXh0O1xyXG4gICAgICAgIGxldCBkb21FbGVtZW50ID0gbnVsbDtcclxuICAgICAgICBjb25zb2xlLmxvZyhlbGVtZW50KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIG9iamVjdFRvTWFwKG9iamVjdCl7XHJcbiAgICAgICAgbGV0IG1hcCA9IG5ldyBNYXAoKTtcclxuICAgICAgICBmb3IgKGxldCBmaWVsZCBpbiBvYmplY3QpeyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9iamVjdFtmaWVsZF0gPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIG9iamVjdFtmaWVsZF0gPT09IFwibnVtYmVyXCIpe1xyXG4gICAgICAgICAgICAgICAgbWFwLnNldChmaWVsZCwgb2JqZWN0W2ZpZWxkXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1hcDtcclxuICAgIH1cclxuXHJcbiAgICBcclxuXHJcbiAgICAvKlxyXG4gICAgICogVHJhbnNmZXIgY29udGVudHMgb2YgJ2ZpbGVuYW1lJyBmcm9tIHNlcnZlciB0byBjbGllbnQuXHJcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcclxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHN1Y2Nlc3NDYWxsYmFja1xyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZXJyb3JDYWxsYmFja1xyXG4gICAgICogQHJldHVybnMge1N0cmluZ30gY29udGVudHMgb2YgZmlsZVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0VVJMKHVybCkge1xyXG4gICAgICAgIGxldCBjYWxsYmFjayA9IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgICAgdmFyIHhodHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcblxyXG4gICAgICAgICAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoeGh0dHAucmVhZHlTdGF0ZSA9PT0gNCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh4aHR0cC5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHhodHRwLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwIDogeGh0dHAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXMgOiB4aHR0cC5zdGF0dXMsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA6IHhodHRwLnJlc3BvbnNlVGV4dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybCA6IHVybFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHhodHRwLnNlbmQobnVsbCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGNhbGxiYWNrKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZSBhIG5ldyBkb20gZWxlbWVudCBmcm9tIHRleHQuXHJcbiAgICAgKiBAcGFyYW0ge3R5cGV9IHRleHRcclxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXHJcbiAgICAgKiBAcmV0dXJucyB7bm9kZXxGaWxlT3BlcmF0aW9ucy5sb2FkRE9NRWxlbWVudC5kb21FbGVtZW50fVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0RmlsZSh1cmwsIG1hcCA9IG5ldyBNYXAoKSl7XHJcbiAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRVUkwodXJsKTtcclxuXHJcbiAgICAgICAgLyogcmVwbGFjZSB2YXJpYWJsZXMgd2l0aCB2YWx1ZXMgKi9cclxuICAgICAgICBmb3IgKGxldCBrZXkgb2YgbWFwLmtleXMoKSl7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG1hcC5nZXQoa2V5KTtcclxuICAgICAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdPyR7a2V5fVt9XWAsIGBnYCk7XHJcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsIHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qIHJlcGxhY2UgdW5maWxsZWQgdmFyaWFibGVzIHdpdGggZW1wdHkgKi9cclxuICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGBbJF1be11bXn1dKlt9XWAsIGBnYCk7XHJcbiAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgXCJcIik7XHJcblxyXG4gICAgICAgIHJldHVybiB0ZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUcmFuc2ZlciBjb250ZW50cyBvZiAnZmlsZW5hbWUnIGZyb20gc2VydmVyIHRvIGNsaWVudCB1c2luZyBjdXJyZW50IHdpbmRvdyBsb2NhdGlvbi5cclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBmaWxlbmFtZVxyXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gc3VjY2Vzc0NhbGxiYWNrXHJcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcnJvckNhbGxiYWNrXHJcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgZ2V0TG9jYWwoZmlsZW5hbWUpIHtcclxuICAgICAgICBsZXQgY2FsbGJhY2sgPSBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgICAgIHZhciB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xyXG4gICAgICAgICAgICB2YXIgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWYgKyBcIi9cIiArIGZpbGVuYW1lO1xyXG5cclxuICAgICAgICAgICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHhodHRwLnJlYWR5U3RhdGUgPT09IDQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoeGh0dHAuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh4aHR0cC5yZXNwb25zZVRleHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh4aHR0cC5zdGF0dXMsIHhodHRwLnJlc3BvbnNlVGV4dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xyXG4gICAgICAgICAgICB4aHR0cC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoY2FsbGJhY2spO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKipcclxuICAgICAqIENhdXNlICd0ZXh0JyB0byBiZSBzYXZlZCBhcyAnZmlsZW5hbWUnIGNsaWVudCBzaWRlLlxyXG4gICAgICogQHBhcmFtIHt0eXBlfSBmaWxlbmFtZSBUaGUgZGVmYXVsdCBmaWxlbmFtZSB0byBzYXZlIHRoZSB0ZXh0IGFzLlxyXG4gICAgICogQHBhcmFtIHt0eXBlfSB0ZXh0IFRoZSB0ZXh0IHRvIHNhdmUgdG8gZmlsZW5hbWUuXHJcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgc2F2ZVRvRmlsZSh0ZXh0LCBmaWxlbmFtZSkge1xyXG4gICAgICAgIGxldCBhbmNob3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XHJcbiAgICAgICAgbGV0IGRhdGEgPSBcInRleHQ7Y2hhcnNldD11dGYtOCxcIiArIGVuY29kZVVSSUNvbXBvbmVudCh0ZXh0KTtcclxuICAgICAgICBhbmNob3Iuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcImRhdGE6XCIgKyBkYXRhKTtcclxuICAgICAgICBhbmNob3Iuc2V0QXR0cmlidXRlKFwiZG93bmxvYWRcIiwgZmlsZW5hbWUpO1xyXG4gICAgICAgIGFuY2hvci5jbGljaygpO1xyXG4gICAgfVxyXG59XHJcblxyXG5GaWxlT3BlcmF0aW9ucy5Ob2RlVHlwZSA9IHtcclxuICAgIEVMRU1FTlQgOiAxLFxyXG4gICAgQVRUUklCVVRFIDogMixcclxuICAgIFRFWFQgOiAzLCBcclxuICAgIENEQVRBU0VDVElPTiA6IDQsXHJcbiAgICBFTlRJVFlSRUZFUk5DRSA6IDUsXHJcbiAgICBFTlRJVFkgOiA2LFxyXG4gICAgUFJPQ0VTU0lOR0lOU1RSVUNUSU9OIDogNyxcclxuICAgIENPTU1FTlQgOiA4LFxyXG4gICAgRE9DVU1FTlQgOiA5LFxyXG4gICAgRE9DVU1FTlRUWVBFIDogMTAsXHJcbiAgICBET0NVTUVOVEZSQUdNRU5UIDogMTEsXHJcbiAgICBOT1RBVElPTiA6IDEyXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcGVyYXRpb25zOyIsIid1c2Ugc3RyaWN0JztcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBtb3VzZSA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL01vdXNlXCIpLCBcclxuICAgIGRyYWcgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9EcmFnXCIpLFxyXG4gICAgZHJvcCA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL0Ryb3BcIiksXHJcbiAgICBtb3ZhYmxlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvTW92YWJsZVwiKSxcclxuICAgIHJlc2l6ZSA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL1Jlc2l6ZVwiKVxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuLyoqXHJcbiAqIFNpbmdsdG9uIGNsYXNzIHRvIGFkZCBmdW5jdGlvbmFsaXR5IHRvIHRoZSBtb3VzZS5cclxuICovXHJcbmNsYXNzIE1vdXNlVXRpbGl0aWVzIHtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5sYXN0WCA9IDA7XHJcbiAgICAgICAgdGhpcy5sYXN0WSA9IDA7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGlzVW5kZXIoZXZlbnQsIGVsZW1lbnQpIHtcclxuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFg7XHJcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZO1xyXG4gICAgICAgIGxldCBjdXJyZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh4LCB5KTtcclxuXHJcbiAgICAgICAgd2hpbGUgKGN1cnJlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnQgPT09IGVsZW1lbnQpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VW5kZXIoZXZlbnQpIHtcclxuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFg7XHJcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZO1xyXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBlbGVtZW50KGVsZW1lbnQpe1xyXG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkRWxlbWVudCAhPT0gbnVsbCl7XHJcbiAgICAgICAgICAgIHRoaXMuZGV0YWNoRWxlbWVudCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWVsZW1lbnQgfHwgZWxlbWVudCA9PT0gbnVsbCB8fCBlbGVtZW50ID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICB0aGlzLmRldGFjaEVsZW1lbnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmF0dGFjaEVsZW1lbnQoZWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXQgZWxlbWVudCgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLmF0dGFjaGVkRWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaCBhbiBlbGVtZW50LiAgSWYgdGhlIGVsZW1lbnQgZG9lc24ndCBoYXZlIGEgcGFyZW50IGl0IHdpbGwgYmVcclxuICAgICAqIGF0dGFjaGVkIHRvIHRoZSBkb2N1bWVudCBhbmQgd2lsbCBiZSBkZXRhY2hlZCB3aGVuIGRldGFjaEVsZW1lbnQgaXMgY2FsbGVkLlxyXG4gICAgICogQHBhcmFtIHt0eXBlfSBlbGVtZW50XHJcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxyXG4gICAgICovXHJcbiAgICBhdHRhY2hFbGVtZW50KGVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudCA9IGVsZW1lbnQ7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGVsZW1lbnQucGFyZW50KXtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBhdHRhY2ggZWxlbWVudCB0byBtb3VzZSBpZiB0aGUgZWxlbWVudCBoYXMgYSBwYXJlbnQgZWxlbWVudC5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQoZWxlbWVudCk7XHJcbiAgICAgICAgZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjsgXHJcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSBldmVudC5jbGllbnRZICsgXCJweFwiO1xyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IGV2ZW50LmNsaWVudFggKyBcInB4XCI7XHJcbiAgICAgICAgZWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJub25lXCI7XHJcbiAgICAgICAgZWxlbWVudC5zdHlsZS56SW5kZXggPSBcIjEwMDAwXCI7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5tb3ZlQ2FsbEJhY2sgPSAoZXZlbnQpPT50aGlzLm9uTW91c2VNb3ZlKGV2ZW50KTtcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdmVDYWxsQmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgbGlzdGVuZXJzIGZyb20gdGhlIGF0dGFjaGVkIGVsZW1lbnQsIGRvIG5vdCByZW1vdmUgaXQgZnJvbSB0aGVcclxuICAgICAqIGRvY3VtZW50LlxyXG4gICAgICogQHJldHVybnMge3R5cGV9XHJcbiAgICAgKi9cclxuICAgIGRldGFjaEVsZW1lbnQoKXtcclxuICAgICAgICBpZiAodGhpcy5hdHRhY2hlZEVsZW1lbnQgPT09IG51bGwpIHJldHVybjtcclxuICAgICAgICBcclxuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdmVDYWxsQmFjayk7ICAgICAgICBcclxuICAgICAgICBsZXQgcnZhbHVlID0gdGhpcy5hdHRhY2hlZEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQgPSBudWxsOyAgICAgICAgXHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChydmFsdWUpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiBydmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgb25Nb3VzZU1vdmUoZXZlbnQpIHsgICAgICAgIFxyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgdGhpcy5sYXN0WCA9IGV2ZW50LmNsaWVudFg7XHJcbiAgICAgICAgdGhpcy5sYXN0WSA9IGV2ZW50LmNsaWVudFk7XHJcblxyXG4gICAgICAgIC8vIHNldCB0aGUgZWxlbWVudCdzIG5ldyBwb3NpdGlvbjpcclxuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudC5zdHlsZS50b3AgPSBldmVudC5jbGllbnRZICsgXCJweFwiO1xyXG4gICAgICAgIHRoaXMuYXR0YWNoZWRFbGVtZW50LnN0eWxlLmxlZnQgPSBldmVudC5jbGllbnRYICsgXCJweFwiO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBNb3VzZVV0aWxpdGllcygpOyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgcHJlZml4OiBcImRhdGEtbmlkZ2V0XCIsXHJcbiAgICBlbGVtZW50QXR0cmlidXRlOiBcImRhdGEtbmlkZ2V0LWVsZW1lbnRcIixcclxuICAgIHNyY0F0dHJpYnV0ZTogXCJzcmNcIixcclxuICAgIHRlbXBsYXRlU3JjQXR0cmlidXRlOiBcInRlbXBsYXRlLXNyY1wiLFxyXG4gICAgbmFtZUF0dHJpYnV0ZTogXCJuYW1lXCIsXHJcbiAgICBpbnRlcmZhY2VBdHRyaWJ1dGU6IFwiaW50ZXJmYWNlc1wiLFxyXG4gICAgdGVtcGxhdGVBdHRyaWJ1dGU6IFwidGVtcGxhdGUtaWRcIixcclxuICAgIGludGVyZmFjZURhdGFGaWVsZDogXCJpbnRlcmZhY2VEYXRhXCIsXHJcbiAgICBtb2RlbERhdGFGaWVsZDogXCJtb2RlbERhdGFcIixcclxuICAgIHN0eWxlQXR0cmlidXRlOiBcIm5pZGdldC1zdHlsZVwiXHJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmNvbnN0IEZpbGVPcGVyYXRpb25zID0gcmVxdWlyZShcIi4vRmlsZU9wZXJhdGlvbnNcIik7XHJcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCIuL05pZGdldFwiKTtcclxuY29uc3QgSW50ZXJmYWNlcyA9IHJlcXVpcmUoXCIuL0ludGVyZmFjZXNcIik7XHJcbmNvbnN0IFRyYW5zZm9ybWVyID0gcmVxdWlyZShcIi4vVHJhbnNmb3JtZXJcIik7XHJcbmNvbnN0IE5pZGdldFN0eWxlID0gcmVxdWlyZShcIi4vTmlkZ2V0U3R5bGVcIik7XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlIHRoZSB3OmggYXNwZWN0IHJhdGlvIGFuZCBhZGp1c3QgdGhlIHByb3BvcnRpb25zIGFjY29yZGluZ2x5LlxyXG4gKlxyXG4gKi9cclxuY2xhc3MgQXNwZWN0UmF0aW97XHJcbiAgICBjb25zdHJ1Y3RvcihuaWRnZXQpIHtcclxuICAgICAgICB0aGlzLm5pZGdldCA9IG5pZGdldDtcclxuICAgICAgICB0aGlzLm9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpPT50aGlzLm9uUmVzaXplKCkpO1xyXG4gICAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLm5pZGdldCk7XHJcbiAgICAgICAgdGhpcy5wYXJzZVZhbHVlcygpO1xyXG4gICAgICAgIHRoaXMub25SZXNpemUoKTtcclxuICAgICAgICB0aGlzLmxvYWRlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFZhbHVlKCl7XHJcbiAgICAgICAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoQXNwZWN0UmF0aW8uQ1NTX0FUVFJJQlVURSk7XHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VWYWx1ZXMoKXtcclxuICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XHJcbiAgICAgICAgbGV0IHNwbGl0ID0gdmFsdWUuc3BsaXQoL1sgLDtdL2cpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBzIG9mIHNwbGl0KXtcclxuICAgICAgICAgICAgaWYgKHMuc3BsaXQoL1stOl0vKS5sZW5ndGggPT09IDIpe1xyXG4gICAgICAgICAgICAgICAgbGV0IHJhdGlvID0gcy5zcGxpdCgvWy06XS8pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53aWR0aCA9IHBhcnNlSW50KHJhdGlvWzBdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gcGFyc2VJbnQocmF0aW9bMV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHMgPT09IFwiaFwiKXtcclxuICAgICAgICAgICAgICAgIHRoaXMub25SZXNpemUgPSAoKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5uaWRnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLndpZHRoID0gKGhlaWdodCAqIHRoaXMud2lkdGggLyB0aGlzLmhlaWdodCkgKyBcInB4XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvblJlc2l6ZSgpe1xyXG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMubmlkZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG4gICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmhlaWdodCA9ICh3aWR0aCAqIHRoaXMuaGVpZ2h0IC8gdGhpcy53aWR0aCkgKyBcInB4XCI7XHJcbiAgICB9XHJcbn1cclxuXHJcbkFzcGVjdFJhdGlvLkNTU19BVFRSSUJVVEUgPSBcIi0tbmlkZ2V0LWFzcGVjdC1yYXRpb1wiO1xyXG5cclxuLyoqXHJcbiAqIEEgTmlkZ2V0RWxlbWVudCBpcyBhIDE6MSBjbGFzcy1vYmplY3Q6ZG9tLW9iamVjdCBwYWlyaW5nLiAgQWN0aW9ucyBvbiB0aGUgRE9NIFxyXG4gKiBvYmplY3Qgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGJ5IHRoZSBOaWRnZXRFbGVtZW50IG9iamVjdC4gIFRoZSBpbnRlcmZhY2VEYXRhXHJcbiAqIGZpZWxkIGlzIHJlc2VydmVkIGZvciBkYXRhIGZyb20gaW50ZXJmYWNlcy4gIEludGVyZmFjZXMgc2hvdWxkIHB1dCB0aGVpciBcclxuICogY3VzdG9tIGRhdGEgdW5kZXIgW2ludGVyZmFjZURhdGFGaWVsZF0uW2ludGVyZmFjZU5hbWVdLiAgVGhlIGludGVyZmFjZSBkYXRhXHJcbiAqIGF0dHJpYnV0ZSBpcyBzZXQgd2l0aCB0aGUgc3RhdGljIHZhbHVlIE5pZGdldC5pbnRlcmZhY2VEYXRhRmllbGQuXHJcbiAqIFxyXG4gKiBDYWxsaW5nIG1ldGhvZHMgb24gdGhlIG5pZGdldCB3aWxsIHRyZWF0IHNoYWRvdyBjb250ZW50cyBhcyByZWd1bGFyIGNvbnRlbnRzLlxyXG4gKi9cclxuY2xhc3MgTmlkZ2V0RWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcclxuICAgIC8qKlxyXG4gICAgICogQ3JlYXRlIGEgbmV3IE5pZGdldCBhc3NvY2lhdGVkIHdpdGggJ2VsZW1lbnQnLiAgQW4gZXJyb3Igd2lsbCBiZSB0aHJvd25cclxuICAgICAqIGlmIHRoZSAnZWxlbWVudCcgaXMgYWxyZWFkeSBhc3NvY2lhdGVkIHdpdGggYSBOaWRnZXQuXHJcbiAgICAgKiBcclxuICAgICAqIERpc2FibGVkIGNsYXNzIGluZGljYXRlcyB0aGlzIG5pZGdldCB3aWxsIGlnbm9yZSBtb3VzZSBldmVudHMuXHJcbiAgICAgKiBcclxuICAgICAqIEBwYXJhbSB7dHlwZX0gZWxlbWVudCBKUXVlcnkgc2VsZWN0b3JcclxuICAgICAqIEByZXR1cm4ge25tJF9OaWRnZXQuTmlkZ2V0RWxlbWVudH1cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IodGVtcGxhdGVJZCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpc1tOaWRnZXQuaW50ZXJmYWNlRGF0YUZpZWxkXSA9IHt9O1xyXG4gICAgICAgIHRoaXNbTmlkZ2V0Lm1vZGVsRGF0YUZpZWxkXSA9IHt9O1xyXG4gICAgICAgIHRoaXMudHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtZXIodGhpcyk7XHJcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgaWYgKHRlbXBsYXRlSWQpe1xyXG4gICAgICAgICAgICB0aGlzLmFwcGx5VGVtcGxhdGUodGVtcGxhdGVJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrIGlzIGludm9rZWQgZWFjaCB0aW1lIHRoZSBjdXN0b20gZWxlbWVudCBpcyBhcHBlbmRlZCBpbnRvIGEgZG9jdW1lbnQtY29ubmVjdGVkIGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgYXN5bmMgY29ubmVjdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgdGhpcy5zaGFkb3dDb250ZW50cyA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhhc0F0dHJpYnV0ZShOaWRnZXQudGVtcGxhdGVBdHRyaWJ1dGUpKXtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5hcHBseVRlbXBsYXRlKHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldC50ZW1wbGF0ZUF0dHJpYnV0ZSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ub3RpZnlTdHlsZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHJpZXZlIGEgbWFwIG9mIGFsbCBkYXRhIGF0dHJpYnV0ZXNcclxuICAgICAqIEByZXR1cm5zIHtNYXA8YW55LCBhbnk+fVxyXG4gICAgICovXHJcbiAgICBkYXRhQXR0cmlidXRlcygpIHtcclxuICAgICAgICBsZXQgbWFwID0gbmV3IE1hcCgpO1xyXG4gICAgICAgIGZvciAobGV0IGF0dHIgb2YgdGhpcy5hdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgIGlmIChhdHRyLm5hbWUuc3RhcnRzV2l0aChcImRhdGEtXCIpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IGF0dHIubmFtZS5zdWJzdHIoNSk7XHJcbiAgICAgICAgICAgICAgICBtYXBbbmFtZV0gPSBhdHRyLnZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBtYXA7XHJcbiAgICB9XHJcblxyXG4gICAgbm90aWZ5U3R5bGVzKCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYXIgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMpLmdldFByb3BlcnR5VmFsdWUoQXNwZWN0UmF0aW8uQ1NTX0FUVFJJQlVURSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXIgIT09IFwiXCIpIG5ldyBBc3BlY3RSYXRpbyh0aGlzKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgfSwgMTAwKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaCBhIHNoYWRvdyBlbGVtZW50IHdpdGggdGhlIGNvbnRlbnRzIG9mIHRoZSB0ZW1wbGF0ZSBuYW1lZCAodGVtcGxhdGVJRCkuXHJcbiAgICAgKiBAcmV0dXJuIHt1bmRlZmluZWR9XHJcbiAgICAgKi9cclxuICAgIGFzeW5jIGFwcGx5VGVtcGxhdGUodGVtcGxhdGVJZCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNoYWRvd1Jvb3QgIT09IG51bGwpIHJldHVybjtcclxuICAgICAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0ZW1wbGF0ZUlkKTtcclxuXHJcbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgdGhyb3cgbmV3IEVycm9yKFwiVGVtcGxhdGUgJ1wiICsgdGVtcGxhdGVJZCArIFwiJyBub3QgZm91bmQuXCIpO1xyXG4gICAgICAgIGlmICh0ZW1wbGF0ZS50YWdOYW1lLnRvVXBwZXJDYXNlKCkgIT09IFwiVEVNUExBVEVcIikgdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCB3aXRoIGlkICdcIiArIHRlbXBsYXRlSWQgKyBcIicgaXMgbm90IGEgdGVtcGxhdGUuXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogJ29wZW4nfSkuYXBwZW5kQ2hpbGQodGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMucmVhZHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZWFkeSgpe1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIExvYWQgY29udGVudHMgb2YgZmlsZSBpbnRvIHRoaXMgZWxlbWVudC5cclxuICAgICAqIFJlcGxhY2UgYWxsICR7fSB2YXJpYWJsZXMgd2l0aCBjb250ZW50cyBvZiAnbWFwJy5cclxuICAgICAqL1xyXG4gICAgYXN5bmMgcmV0cmlldmVTb3VyY2UobWFwKXtcclxuICAgICAgICBsZXQgc3JjID0gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0LnNyY0F0dHJpYnV0ZSk7XHJcbiAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRGaWxlKHNyYywgbWFwKTtcclxuICAgICAgICB0aGlzLmlubmVySFRNTCA9IHRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGxvYWRUZW1wbGF0ZVNuaXBwZXQoZmlsZW5hbWUsIHRhZ25hbWUpe1xyXG4gICAgICAgIGxldCBpZCA9IGZpbGVuYW1lLnJlcGxhY2UoL1tcXC8vIC4tXSsvZywgXCJfXCIpO1xyXG5cclxuICAgICAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2lkfWApKXtcclxuICAgICAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRGaWxlKGZpbGVuYW1lKTtcclxuICAgICAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRlbXBsYXRlXCIpO1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSB0ZXh0O1xyXG4gICAgICAgICAgICB0ZW1wbGF0ZS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpZCk7XHJcbiAgICAgICAgICAgIGlmICh0YWduYW1lKSB0ZW1wbGF0ZS5zZXRBdHRyaWJ1dGUoXCJkYXRhLW5pZGdldFwiLCB0YWduYW1lKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQodGVtcGxhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aWR9YCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGVsZSBvZiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRhZ25hbWUpKXtcclxuICAgICAgICAgICAgYXdhaXQgZWxlLmluamVjdFRlbXBsYXRlKHRlbXBsYXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmUgJ2hpZGRlbicgY2xhc3MuXHJcbiAgICAgKi9cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkICdoaWRkZW4nIGNsYXNzLlxyXG4gICAgICovXHJcbiAgICBoaWRlKCkge1xyXG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgZGlzYWJsZWQgZmxhZyB0aGF0IGlzIHJlYWQgYnkgbmlkZ2V0IG1vdXNlIGZ1bmN0aW9ucy5cclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBzZXQgZGlzYWJsZWQodmFsdWUpe1xyXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShOaWRnZXRFbGVtZW50LkRJU0FCTEVEX0FUVFJJQlVURSwgdHJ1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUsIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgdGhlIGRpc2FibGVkIGZsYWcgdGhhdCBpcyByZWFkIGJ5IG5pZGdldCBtb3VzZSBmdW5jdGlvbnMuXHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqL1xyXG4gICAgZ2V0IGRpc2FibGVkKCl7XHJcbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dHJpYnV0ZShOaWRnZXRFbGVtZW50LkRJU0FCTEVEX0FUVFJJQlVURSkpIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhpcyBlbGVtZW50IHdhcyB1bmRlciB0aGUgbW91c2UgZm9yIHRoZSBldmVudC5cclxuICAgICAqIEBwYXJhbSB7dHlwZX0gZXZlbnRcclxuICAgICAqIEBwYXJhbSB7dHlwZX0gZWxlbWVudFxyXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cclxuICAgICAqL1xyXG4gICAgaXNVbmRlck1vdXNlKGV2ZW50KSB7XHJcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYO1xyXG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WTtcclxuICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XHJcblxyXG4gICAgICAgIHdoaWxlIChjdXJyZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50ID09PSB0aGlzKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50RWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUnVuIHRoZSBxdWVyeSBzZWxlY3RvciBvbiB0aGlzIGVsZW1lbnQuXHJcbiAgICAgKiBJZiB0aGlzIGVsZW1lbnQgaGFzIGEgc2hhZG93LCBydW4gaXQgb24gdGhhdCBpbnN0ZWFkLlxyXG4gICAgICogQHBhcmFtIHNlbGVjdG9yc1xyXG4gICAgICogQHJldHVybnMge0hUTUxFbGVtZW50VGFnTmFtZU1hcFtLXX1cclxuICAgICAqL1xyXG4gICBxdWVyeVNlbGVjdG9yKHNlbGVjdG9ycykge1xyXG4gICAgICAgIGlmICh0aGlzLnNoYWRvd1Jvb3Qpe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gc3VwZXIucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJ1biB0aGUgcXVlcnkgc2VsZWN0b3Igb24gdGhpcyBlbGVtZW50LlxyXG4gICAgICogSWYgdGhpcyBlbGVtZW50IGhhcyBhIHNoYWRvdywgcnVuIGl0IG9uIHRoYXQgaW5zdGVhZC5cclxuICAgICAqIEBwYXJhbSBzZWxlY3RvcnNcclxuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudFRhZ05hbWVNYXBbS119XHJcbiAgICAgKi9cclxuICAgIHF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2hhZG93Um9vdCl7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlIHRoaXMgZWxlbWVudCBmcm9tIGl0J3MgcGFyZW50LlxyXG4gICAgICovXHJcbiAgICBkZXRhY2goKXtcclxuICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbmRleCB3aXRoaW4gdGhlIHBhcmVudCBlbGVtZW50LlxyXG4gICAgICovXHJcbiAgICBpbmRleCgpe1xyXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMucGFyZW50RWxlbWVudC5jaGlsZHJlbikuaW5kZXhPZih0aGlzKTtcclxuICAgIH1cclxufVxyXG5cclxuTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUgPSBcIm5pZGdldC1kaXNhYmxlZFwiO1xyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtZWxlbWVudCcsIE5pZGdldEVsZW1lbnQpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEVsZW1lbnQ7IiwiJ3VzZSBzdHJpY3QnO1xyXG4vKipcclxuICogTWFuaXB1bGF0ZXMgdGhlIGVsZW1lbnRzIHN0eWxlIHdpdGgganMgcm91dGluZXMgYWNjb3JkaW5nIHRvIGNzcyBmbGFncy5cclxuICogTmlkZ2V0IHN0eWxlIGlzIGFwcGxpZWQgdG8gYWxsIG5pZGdldC1lbGVtZW50cyB1bmxlc3MgdGhleSBoYXZlIHRoZSBuaWRnZXQtc3R5bGVcclxuICogYXR0cmlidXRlIHNldCB0byAnZmFsc2UnLlxyXG4gKi9cclxuXHJcbmNsYXNzIE5pZGdldFN0eWxlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihuaWRnZXQpIHtcclxuICAgICAgICB0aGlzLm5pZGdldCA9IG5pZGdldDtcclxuICAgICAgICB0aGlzLmFwcGx5KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGFwcGx5KCkge1xyXG4gICAgICAgIHRoaXMubmlkZ2V0V2lkdGhSYXRpbygpO1xyXG4gICAgICAgIHRoaXMubmlkZ2V0SGVpZ2h0UmF0aW8oKTtcclxuICAgICAgICB0aGlzLm5pZGdldEZpdFRleHQoKTtcclxuICAgICAgICB0aGlzLm5pZGdldEZpdFRleHRXaWR0aCgpO1xyXG4gICAgICAgIHRoaXMubmlkZ2V0VmVydEFsaWduVGV4dCgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBuaWRnZXRXaWR0aFJhdGlvKCkge1xyXG4gICAgICAgIGxldCByYXRpbyA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC13aWR0aC1yYXRpb1wiKTtcclxuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47ICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7ICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LndpZHRoID0gdGhpcy5uaWRnZXQuaGVpZ2h0ICogcmF0aW87XHJcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7ICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIG5pZGdldEhlaWdodFJhdGlvKCkge1xyXG4gICAgICAgIGxldCByYXRpbyA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1oZWlnaHQtcmF0aW9cIik7XHJcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuOyAgICAgICAgICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4geyAgICAgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB0aGlzLm5pZGdldC5oZWlnaHQgPSB0aGlzLm5pZGdldC53aWR0aCAqIHJhdGlvO1xyXG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlsbCB0aGUgdGV4dCBoZWlnaHQgdG8gbWF0Y2ggdGhlIGVsZW1lbnQgaGVpZ2h0LlxyXG4gICAgICogQ2hhbmdlIHRoZSByYXRpbyB2YWx1ZSAob3IgdGhlIGZvbnRTaXplKSBhZGp1c3QuXHJcbiAgICAgKi9cclxuICAgIG5pZGdldEZpdFRleHQoKSB7XHJcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0XCIpOyAgICAgICAgXHJcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgLS1uaWRnZXQtZml0LXRleHQgJHtyYXRpb31gKVxyXG4gICAgICAgICAgICBsZXQgaCA9IHRoaXMubmlkZ2V0Lm9mZnNldEhlaWdodCAqIHJhdGlvO1xyXG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IGggKyBcInB4XCI7XHJcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7ICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiAgV2lsbCBjaGFuZ2UgdGhlIGZvbnQgc2l6ZSBzbyB0aGF0IHRoZSB0ZXh0IGZpdCdzIGluIHRoZSBwYXJlbnQgZWxlbWVudC5cclxuICAgICAqICBEb24ndCBzZXQgdGhlIHdpZHRoIG9mIHRoZSBlbGVtZW50LlxyXG4gICAgICovXHJcbiAgICBuaWRnZXRGaXRUZXh0V2lkdGgoKSB7XHJcbiAgICAgICAgbGV0IHJlbW92ZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1maXQtdGV4dC13aWR0aFwiKTtcclxuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmVtb3ZlKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50XHJcblxyXG4gICAgICAgICAgICBsZXQgdGV4dFcgPSB0aGlzLm5pZGdldC5zY3JvbGxXaWR0aDtcclxuICAgICAgICAgICAgbGV0IGNvbnRXID0gdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRXaWR0aDtcclxuICAgICAgICAgICAgY29udFcgPSBjb250VyAtIHJlbW92ZTtcclxuICAgICAgICAgICAgbGV0IGR3ID0gY29udFcvdGV4dFc7XHJcbiAgICAgICAgICAgIGxldCBjb21wdXRlZEZvbnRTaXplID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQtc2l6ZScpXHJcbiAgICAgICAgICAgIGNvbXB1dGVkRm9udFNpemUgPSBwYXJzZUludChjb21wdXRlZEZvbnRTaXplKTtcclxuICAgICAgICAgICAgY29tcHV0ZWRGb250U2l6ZSA9IE1hdGgucm91bmQoY29tcHV0ZWRGb250U2l6ZSk7XHJcbiAgICAgICAgICAgIGxldCBuZXdGb250U2l6ZSA9IE1hdGgucm91bmQoY29tcHV0ZWRGb250U2l6ZSAqIGR3KTtcclxuICAgICAgICAgICAgbGV0IGggPSB0aGlzLm5pZGdldC5vZmZzZXRIZWlnaHRcclxuXHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhjb21wdXRlZEZvbnRTaXplIC0gbmV3Rm9udFNpemUpIDw9IDIpIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIGlmIChuZXdGb250U2l6ZSA+IGgpIG5ld0ZvbnRTaXplID0gaDtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gbmV3Rm9udFNpemUgKyBcInB4XCI7XHJcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIGxpbmUgaGVpZ2h0IHRvIHRoZSBvZmZzZXQgaGVpZ2h0IG11bHRpcGxpZWQgYnkgcmF0aW8uXHJcbiAgICAgKi9cclxuICAgIG5pZGdldFZlcnRBbGlnblRleHQoKXtcclxuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtdmVydC1hbGlnbi10ZXh0XCIpO1xyXG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjtcclxuXHJcbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGggPSB0aGlzLm5pZGdldC5vZmZzZXRIZWlnaHQgKiByYXRpbztcclxuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUubGluZUhlaWdodCA9IGggKyBcInB4XCI7XHJcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0U3R5bGU7IiwiJ3VzZSBzdHJpY3QnO1xyXG5jbGFzcyBUcmFuc2Zvcm17XHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSl7XHJcbiAgICAgICAgbGV0IGluZGV4T2YgPSB2YWx1ZS5pbmRleE9mKFwiKFwiKTtcclxuICAgICAgICB0aGlzLm5hbWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgaW5kZXhPZik7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlLnN1YnN0cmluZyh0aGlzLm5hbWUubGVuZ3RoICsgMSwgdmFsdWUubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5uYW1lICsgXCIsIFwiICsgdGhpcy52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRvU3RyaW5nKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArIFwiKFwiICsgdGhpcy52YWx1ZSArIFwiKVwiO1xyXG4gICAgfSAgICBcclxufVxyXG5cclxuY2xhc3MgVHJhbnNmb3JtZXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBhcHBlbmQoKXtcclxuICAgICAgICBsZXQgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudClbXCJ0cmFuc2Zvcm1cIl07XHJcbiAgICAgICAgaWYgKGNvbXB1dGVkU3R5bGUgIT09IFwibm9uZVwiKSB0aGlzLnB1c2goY29tcHV0ZWRTdHlsZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsZWFyKCl7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IFwiXCI7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVuc2hpZnQodmFsdWUpe1xyXG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSB2YWx1ZSArIFwiIFwiICsgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgcHVzaCh2YWx1ZSl7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gKyBcIiBcIiArIHZhbHVlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSAgICBcclxuICAgIFxyXG4gICAgc2hpZnQoKXtcclxuICAgICAgICBsZXQgYXJyYXkgPSB0aGlzLnNwbGl0KCk7XHJcbiAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIFwiXCI7XHJcbiAgICAgICAgYXJyYXkuc2hpZnQoKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHBvcCgpe1xyXG4gICAgICAgIGxldCBhcnJheSA9IHRoaXMuc3BsaXQoKTtcclxuICAgICAgICBpZiAoYXJyYXkubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcclxuICAgICAgICBhcnJheS5wb3AoKTtcclxuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7ICAgICAgXHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJlcGxhY2UodmFsdWUpe1xyXG4gICAgICAgIGxldCBuZXdUcmFuc2Zvcm0gPSBuZXcgVHJhbnNmb3JtKHZhbHVlKTtcclxuICAgICAgICBsZXQgYXJyYXkgPSB0aGlzLnNwbGl0KCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKyl7XHJcbiAgICAgICAgICAgIGxldCBlbnRyeSA9IGFycmF5W2ldO1xyXG4gICAgICAgICAgICBsZXQgdHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybShlbnRyeSk7XHJcbiAgICAgICAgICAgIGlmICh0cmFuc2Zvcm0ubmFtZSA9PT0gbmV3VHJhbnNmb3JtLm5hbWUpe1xyXG4gICAgICAgICAgICAgICAgYXJyYXlbaV0gPSBuZXdUcmFuc2Zvcm0udG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBhcnJheS5qb2luKFwiIFwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzcGxpdCgpe1xyXG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XHJcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcclxuICAgICAgICBsZXQgcnZhbHVlID0gW107XHJcbiAgICAgICAgbGV0IGxhc3QgPSAnJztcclxuICAgICAgICBsZXQgc2tpcCA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBuZXN0ZWRQID0gMDtcclxuICAgICAgICBcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKXtcclxuICAgICAgICAgICAgaWYgKCFza2lwICYmIHZhbHVlW2ldID09PSAnICcgJiYgbGFzdCA9PT0gJyAnKXtcclxuICAgICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoIXNraXAgJiYgdmFsdWVbaV0gPT09ICcgJykge1xyXG4gICAgICAgICAgICAgICAgcnZhbHVlLnB1c2godmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCBpKSk7XHJcbiAgICAgICAgICAgICAgICBzdGFydCA9IGk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVbaV0gPT09ICcoJykge1xyXG4gICAgICAgICAgICAgICAgbmVzdGVkUCsrO1xyXG4gICAgICAgICAgICAgICAgc2tpcCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVbaV0gPT09ICcpJykge1xyXG4gICAgICAgICAgICAgICAgbmVzdGVkUC0tO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5lc3RlZFAgPT09IDApIHNraXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsYXN0ID0gdmFsdWVbaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJ2YWx1ZS5wdXNoKHZhbHVlLnN1YnN0cmluZyhzdGFydCwgdmFsdWUubGVuZ3RoKSk7XHJcbiAgICAgICAgcmV0dXJuIHJ2YWx1ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdG9TdHJpbmcoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybTtcclxuICAgIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUcmFuc2Zvcm1lcjsiLCJcInVzZSBzdHJpY3RcIjtcclxuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xyXG5cclxuLyoqXHJcbiAqIEEgTmlkZ2V0IHRoYXQgY2hhbmdlcyB0aGUgaW1hZ2UgZm9yIGhvdmVyLCBkaXNhYmxlZCwgcHJlc3MsIGFuZCBpZGxlLlxyXG4gKiBGaXJlcyBhIGNsaWNrIGV2ZW50IHdoZW4gY2xpY2tlZC5cclxuICpcclxuICogV2lsbCBzZXQgdGhlIGN1cnJlbnQgc3RhdGUgYXMgZGF0YS1zdGF0ZSBzbyB0aGF0IGNzcyBjYW4gYWNjZXNzIGl0LlxyXG4gKi9cclxuY2xhc3MgTmlkZ2V0QnV0dG9uIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XHJcblxyXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcclxuICAgICAgICB0aGlzLmFscGhhVG9sZXJhbmNlID0gMDsgLy8gYWxwaGEgbmVlZHMgdG8gYmUgPiB0b2xlcmFuY2UgdG8gdHJpZ2dlciBldmVudHMuXHJcblxyXG4gICAgICAgIHRoaXMuc3RyaW5nSG92ZXIgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J0hPVkVSJ11cIjtcclxuICAgICAgICB0aGlzLnN0cmluZ0Rpc2FibGVkID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdESVNBQkxFRCddXCI7XHJcbiAgICAgICAgdGhpcy5zdHJpbmdQcmVzcyA9IFwibmlkZ2V0LWJ1dHRvbi1zdGF0ZVtzdGF0ZT0nUFJFU1MnXVwiO1xyXG4gICAgICAgIHRoaXMuc3RyaW5nSWRsZSA9IFwibmlkZ2V0LWJ1dHRvbi1zdGF0ZVtzdGF0ZT0nSURMRSddXCI7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcImlkbGVcIjtcclxuICAgIH1cclxuXHJcbiAgICBpc0luU2V0KCkge1xyXG4gICAgICAgIGxldCBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XHJcbiAgICAgICAgd2hpbGUgKHBhcmVudCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQudGFnTmFtZSA9PT0gXCJOSURHRVQtQlVUVE9OLVNFVFwiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIG5pZGdldFJlYWR5KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdEaXNhYmxlZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSWRsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzSW5TZXQoKSkgcmV0dXJuO1xyXG5cclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIHRoaXMubW91c2VFbnRlcik7XHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlTGVhdmUpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlUHJlc3MpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVJlbGVhc2UpO1xyXG5cclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgaXNVbmRlcihldmVudCkge1xyXG4gICAgICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LmVsZW1lbnRzRnJvbVBvaW50KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xyXG4gICAgICAgIGlmIChlbGVtZW50cy5pbmRleE9mKHRoaXMuYWN0aXZlTmlkZ2V0KSA9PSAtMSkgcmV0dXJuIGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuYWN0aXZlTmlkZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGxldCB4ID0gZXZlbnQuY2xpZW50WCAtIHJlY3QueDtcclxuICAgICAgICBsZXQgeSA9IGV2ZW50LmNsaWVudFkgLSByZWN0Lnk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnRlc3RBbHBoYSh4LCB5KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZGlzYWJsZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHN1cGVyLmRpc2FibGVkO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBkaXNhYmxlZCh2YWx1ZSkge1xyXG4gICAgICAgIHN1cGVyLmRpc2FibGVkID0gdmFsdWU7XHJcblxyXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nRGlzYWJsZWQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiaW5cIjpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwicHJlc3NcIjpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nUHJlc3M7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdJZGxlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlUmVsZWFzZShlKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcclxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZVByZXNzKGUpIHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gXCJwcmVzc1wiO1xyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ1ByZXNzO1xyXG4gICAgfVxyXG5cclxuICAgIGhpZGVBbGxJbWFnZXMoKSB7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nSG92ZXIpLmhpZGUoKTtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdEaXNhYmxlZCkuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3Rvcih0aGlzLnN0cmluZ1ByZXNzKS5oaWRlKCk7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nSWRsZSkuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBhY3RpdmVOaWRnZXQoc2VsZWN0b3IpIHtcclxuICAgICAgICB0aGlzLmhpZGVBbGxJbWFnZXMoKTtcclxuICAgICAgICB0aGlzLl9hY3RpdmVOaWRnZXQgPSB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xyXG4gICAgICAgIHRoaXMuX2FjdGl2ZU5pZGdldC5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGFjdGl2ZU5pZGdldCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlTmlkZ2V0O1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBzdGF0ZSh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiLCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHN0YXRlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtc3RhdGVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgdGVzdEFscGhhKHgsIHkpIHtcclxuICAgICAgICBsZXQgcGl4ZWwgPSB0aGlzLmFjdGl2ZU5pZGdldC5nZXRQaXhlbCh4LCB5KTtcclxuICAgICAgICByZXR1cm4gcGl4ZWxbM10gPiB0aGlzLmFscGhhVG9sZXJhbmNlO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlTGVhdmUoKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSWRsZTtcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZUFjdGl2ZSgpIHtcclxuICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0hvdmVyO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlTW92ZShlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnRlc3RBbHBoYShlLmNsaWVudFgsIGUuY2xpZW50WSkpIHtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdJZGxlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcImhvdmVyXCI7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuO1xyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWJ1dHRvbicsIE5pZGdldEJ1dHRvbik7XHJcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0QnV0dG9uO1xyXG5cclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcclxuXHJcbmNsYXNzIE5pZGdldEJ1dHRvblNldCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcclxuICAgICAgICB0aGlzLmFscGhhVG9sZXJhbmNlID0gMDsgLy8gYWxwaGEgbmVlZHMgdG8gYmUgPiB0b2xlcmFuY2UgdG8gdHJpZ2dlciBldmVudHMuXHJcblxyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlUHJlc3MpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVJlbGVhc2UpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZSk7XHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlTGVhdmUpO1xyXG5cclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBuaWRnZXRSZWFkeSgpe1xyXG4gICAgICAgIHRoaXMuYnV0dG9ucyA9IHRoaXMucXVlcnlTZWxlY3RvckFsbChcIm5pZGdldC1idXR0b25cIik7XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VQcmVzcyhlKXtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlUHJlc3MoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcInByZXNzXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VSZWxlYXNlKGUpe1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5idXR0b25zKSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzVW5kZXIoZSkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXRlID09IFwicHJlc3NcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcImJ1dHRvbi1jbGlja2VkXCIsIHtkZXRhaWw6IGVsZW1lbnR9KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlUmVsZWFzZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZU1vdmUoZSl7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpe1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlQWN0aXZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZUxlYXZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VMZWF2ZShlKXtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBlbGVtZW50Lm1vdXNlTGVhdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldCBzdGF0ZSh2YWx1ZSl7XHJcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIsIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc3RhdGUoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtYnV0dG9uLXNldCcsIE5pZGdldEJ1dHRvblNldCk7XHJcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0QnV0dG9uU2V0OyIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcclxuXHJcbi8qKlxyXG4gKiBBIE5pZGdldCB0aGF0IGNoYW5nZXMgdGhlIGltYWdlIGZvciBob3ZlciwgZGlzYWJsZWQsIHByZXNzLCBhbmQgaWRsZS5cclxuICogRmlyZXMgYSBjbGljayBldmVudCB3aGVuIGNsaWNrZWQuXHJcbiAqIFxyXG4gKiBUaGlzIGlzIHRoZSBodG1sIGVsZW1lbnQgXCJuaWRnZXQtYnV0dG9uXCIuXHJcbiAqIElmIHRoZSBuaWRnZXQtYnV0dG9uIGhhcyB0aGUgYXR0cmlidXRlIGBpbWctcHJlZml4ID0gXCJwcmVmaXhcImAgdGhlbiB0aGUgXHJcbiAqIGZvbGxvd2luZyBpbWFnZXMuICBgaW1nLXN1ZmZpeGAgPSBcInN1ZmZpeFwiIHdpbGwgb3ZlcnJpZGUgdGhlIFwiLnBuZ1wiLlxyXG4gKiB3aWxsIGJlIHVzZWQ6XHJcbiAqIC0gcHJlZml4LWhvdmVyLnBuZ1xyXG4gKiAtIHByZWZpeC1kaXNhYmxlZC5wbmdcclxuICogLSBwcmVmaXgtcHJlc3MucG5nXHJcbiAqIC0gcHJlZml4LWlkbGUucG5nXHJcbiAqL1xyXG5jbGFzcyBOaWRnZXRCdXR0b25TdGF0ZSBleHRlbmRzIE5pZGdldCB7XHJcblxyXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcclxuICAgIH1cclxuXHJcbiAgICBuaWRnZXRSZWFkeSgpe1xyXG4gICAgICAgIHRoaXMuaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcclxuICAgICAgICB0aGlzLmltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdGhpcy5nZXRBdHRyaWJ1dGUoXCJpbWFnZS1zcmNcIikpO1xyXG4gICAgICAgIHRoaXMuYXBwZW5kKHRoaXMuaW1nKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCl7XHJcbiAgICAgICAgc3VwZXIuc2hvdygpO1xyXG4gICAgICAgIHRoaXMubG9hZENhbnZhcygpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRDYW52YXMoKXtcclxuICAgICAgICBpZiAoIXRoaXMuaW1nIHx8IHRoaXMuY2FudmFzKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuaW1nLm5hdHVyYWxXaWR0aDtcclxuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmltZy5uYXR1cmFsSGVpZ2h0O1xyXG4gICAgICAgIHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJykuZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0UGl4ZWwoeCwgeSl7XHJcbiAgICAgICAgdGhpcy5sb2FkQ2FudmFzKCk7XHJcbiAgICAgICAgbGV0IGR4ID0gdGhpcy5jYW52YXMud2lkdGggLyB0aGlzLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIGxldCBkeSA9IHRoaXMuY2FudmFzLmhlaWdodCAvIHRoaXMub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIGxldCBwaXhlbCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJykuZ2V0SW1hZ2VEYXRhKGR4ICogeCwgZHkgKiB5LCAxLCAxKS5kYXRhO1xyXG4gICAgICAgIHJldHVybiBwaXhlbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBzdGF0ZSB0byBIT1ZFUiwgRElTQUJMRUQsIFBSRVNTLCBJRExFLlxyXG4gICAgICogQHBhcmFtIHt0eXBlfSBzdGF0ZVxyXG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxyXG4gICAgICovXHJcbiAgICBzZXQgc3RhdGUoc3RhdGUpIHtcclxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInN0YXRlXCIsIHN0YXRlLnRvVXBwZXJDYXNlKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzdGF0ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyaWJ1dGUoXCJzdGF0ZVwiKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgc291cmNlKGltZykge1xyXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwic3JjXCIsIGltZyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNvdXJjZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyaWJ1dGUoXCJzcmNcIik7XHJcbiAgICB9XHJcbn1cclxuO1xyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWJ1dHRvbi1zdGF0ZScsIE5pZGdldEJ1dHRvblN0YXRlKTtcclxubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRCdXR0b25TdGF0ZTtcclxuXHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XHJcblxyXG4vKipcclxuICogQSBjb21wb25lbnQgdGhhdCBoYXMgZXZlbnRzIGZvciBhZGRpbmcgbmlkZ2V0cywgcmVtb3ZpbmcgbmlkZ2V0cywgYW5kIFxyXG4gKiByZXNpemluZyB0aGUgY29udGFpbmVyLiAgV2hlbiB0aGUgY29udGFpbmVyIHNpemUgaXMgY2hhbmdlZCwgdGhlIG51bWJlclxyXG4gKiBvZiBjb21wb25lbnRzIGNoYW5nZSwgb3IgdGhlIGxheW91dCBhdHRyaWJ1dGUgY2hhbmdlcywgdGhlIGRvTGF5b3V0IGZ1bmN0aW9uXHJcbiAqIGlzIGNhbGxlZC5cclxuICogXHJcbiAqIFRoZSBjb21wb25lbnRzIGFyZSBhcnJhZ2VkIGFjY29yZGluZyB0byB0aGUgc2VsZWN0ZWQgbGF5b3V0IGF0dHJpYnV0ZS4gIElmIFxyXG4gKiBubyBsYXlvdXQgYXR0cmlidXRlIGlzIGNob3NlbiwgZG9MYXlvdXQgaXMgc3RpbGwgY2FsbGVkIGFzIGl0IGlzIGFzc3VtZWQgXHJcbiAqIGEgY3VzdG9tIGZ1bmN0aW9uIGhhcyBiZWVuIHByb3ZpZGVkLlxyXG4gKi9cclxuXHJcbmNsYXNzIE5pZGdldENvbnRhaW5lciBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcclxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xyXG4gICAgICAgIGxldCByZXNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcih0aGlzLmRvTGF5b3V0KTtcclxuICAgICAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xyXG4gICAgICAgIHJldHVybiBbTmlkZ2V0Q29udGFpbmVyLmxheW91dEF0dHJpYnV0ZV07XHJcbiAgICB9XHJcblxyXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKG5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xyXG4gICAgICAgIGlmIChvbGRWYWx1ZSA9PT0gbmV3VmFsdWUpIHJldHVybjtcclxuICAgICAgICB0aGlzLmRvTGF5b3V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGxheW91dCh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKE5pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGUsIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbGF5b3V0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXRDb250YWluZXIubGF5b3V0QXR0cmlidXRlKTtcclxuICAgIH0gICAgICBcclxuXHJcbiAgICBkb0xheW91dCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMubGF5b3V0KSByZXR1cm47XHJcbiAgICAgICAgaWYgKCFMYXlvdXRzW3RoaXMubGF5b3V0XSkgdGhyb3cgYGludmFsaWQgbGF5b3V0OiAke3RoaXMubGF5b3V0fWA7XHJcbiAgICAgICAgTGF5b3V0c1t0aGlzLmxheW91dF07XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIExheW91dHMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBGaXQgYWxsIG5pZGdldHMgZXZlbmx5IGluIGEgaG9yaXpvbnRhbCByb3cuXHJcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG5pZGdldFxyXG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcm93KG5pZGdldCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2l6ZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5OaWRnZXRDb250YWluZXIubGF5b3V0QXR0cmlidXRlID0gXCJsYXlvdXRcIjtcclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWNvbnRhaW5lcicsIE5pZGdldENvbnRhaW5lcik7XHJcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0Q29udGFpbmVyOyIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0XCIpO1xyXG5jb25zdCBUcmFuc2Zvcm1lciA9IHJlcXVpcmUoXCIuLi9UcmFuc2Zvcm1lclwiKTtcclxuXHJcbi8qKlxyXG4gKiBEb24ndCBmb3JnZXQgdG8gc2V0ICdpcycgd2hlbiBwdXR0aW5nIGVsZW1lbnQgZGlyZWN0bHkgaW4gaHRtbCBhcyBvcHBvc2VkIHRvXHJcbiAqIHByb2dyYW1pY2FsbHkuXHJcbiAqIDxpbWcgaXM9XCJyZWdpc3RlcmVkLW5hbWVcIiBzcmM9XCJpbWFnZS5wbmdcIj48L2ltZz5cclxuICogXHJcbiAqIGluY2x1ZGUgYSBjdXN0b20gZWxlbWVudCBkZWZpbml0aW9uIGF0IHRoZSBlbmQgb2YgdGhlIGNsYXNzLjxicj5cclxuICogd2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgncmVnaXN0ZXJlZC1uYW1lJywgQ2xhc3MsIHtleHRlbmRzOiBcImltZ1wifSk7XHJcbiAqL1xyXG5jbGFzcyBOaWRnZXRIVE1MSW1hZ2UgZXh0ZW5kcyBIVE1MSW1hZ2VFbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5sYXN0RGlzcGxheSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGlzLnRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybWVyKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHNjYWxlKGR3LCBkaCkge1xyXG4gICAgICAgIGlmICghZGgpIGRoID0gZHc7XHJcbiAgICAgICAgbGV0IHcgPSB0aGlzLndpZHRoICogZHc7XHJcbiAgICAgICAgbGV0IGggPSB0aGlzLmhlaWdodCAqIGRoO1xyXG4gICAgICAgIHRoaXMud2lkdGggPSB3O1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaDtcclxuICAgIH0gICAgICAgIFxyXG5cclxuICAgIHNldCBzcmModmFsdWUpIHtcclxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInNyY1wiLCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHNyYygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJzcmNcIik7XHJcbiAgICB9XHJcblxyXG4gICAgbG9jYXRlKGxlZnQsIHRvcCkge1xyXG4gICAgICAgIHRoaXMubGVmdCA9IGxlZnQ7XHJcbiAgICAgICAgdGhpcy50b3AgPSB0b3A7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGxlZnQoKSB7XHJcbiAgICAgICAgbGV0IHcgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5sZWZ0O1xyXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHcpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCB0b3AoKSB7XHJcbiAgICAgICAgbGV0IGggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS50b3A7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGxlZnQodmFsdWUpIHtcclxuICAgICAgICB0aGlzLnN0eWxlLmxlZnQgPSB2YWx1ZSArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgdG9wKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5zdHlsZS50b3AgPSB2YWx1ZSArIFwicHhcIjtcclxuICAgIH0gICAgXHJcblxyXG4gICAgc2V0IHdpZHRoKHcpIHtcclxuICAgICAgICB0aGlzLnN0eWxlLndpZHRoID0gdyArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgaGVpZ2h0KHcpIHtcclxuICAgICAgICB0aGlzLnN0eWxlLmhlaWdodCA9IHcgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHdpZHRoKCkge1xyXG4gICAgICAgIGxldCB3ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykud2lkdGg7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGhlaWdodCgpIHtcclxuICAgICAgICBsZXQgaCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMpLmhlaWdodDtcclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChoKTtcclxuICAgIH0gICAgICAgIFxyXG5cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGFzdERpc3BsYXkpIHtcclxuICAgICAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gdGhpcy5sYXN0RGlzcGxheTtcclxuICAgICAgICAgICAgdGhpcy5sYXN0RGlzcGxheSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoaWRlKCkge1xyXG4gICAgICAgIHRoaXMubGFzdERpc3BsYXkgPSB0aGlzLnN0eWxlLmRpc3BsYXk7XHJcbiAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGRpc3BsYXkodmFsdWUpe1xyXG4gICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IHZhbHVlO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXQgZGlzcGxheSgpe1xyXG4gICAgICAgIHJldHVybiB3aW5kb3cuY2FsY3VsYXRlU3R5bGUodGhpcylbXCJkaXNwbGF5XCJdO1xyXG4gICAgfVxyXG5cclxuICAgIGRldGFjaCgpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IodGhpcyk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNldCBkaXNhYmxlZCh2YWx1ZSl7XHJcbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXQgZGlzYWJsZWQoKXtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0cmlidXRlKFwiZGlzYWJsZWRcIikpIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKTtcclxuICAgIH0gICAgXHJcbiAgICBcclxuICAgIGNsZWFyUG9zKCl7XHJcbiAgICAgICAgdGhpcy5zdHlsZS50b3AgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc3R5bGUubGVmdCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJEaW1zKCl7XHJcbiAgICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zdHlsZS5oZWlnaHQgPSBudWxsO1xyXG4gICAgfSAgICBcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRIVE1MSW1hZ2U7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XHJcblxyXG4vKipcclxuICogQSBOaWRnZXQgdGhhdCBjb250YWlucyBpbWFnZXMuXHJcbiAqL1xyXG5jbGFzcyBOaWRnZXRJbWFnZSBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNyYyl7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLmltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XHJcbiAgICAgICAgaWYgKHNyYykgdGhpcy5zcmMgPSBzcmM7XHJcbiAgICB9XHJcblxyXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKXtcclxuICAgICAgICBsZXQgc3JjID0gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0SW1hZ2Uuc3JjQXR0cmlidXRlKTsgICAgICAgIFxyXG4gICAgICAgIGlmIChzcmMpIHRoaXMuaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCBzcmMpOyAgICAgICBcclxuICAgICAgICB0aGlzLmFwcGVuZENoaWxkKHRoaXMuaW1nKTtcclxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzcmMoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5pbWcuZ2V0QXR0cmlidXRlKFwic3JjXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBzcmModmFsdWUpe1xyXG4gICAgICAgIHRoaXMuaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2l6ZSh3aWR0aCwgaGVpZ2h0KXtcclxuICAgICAgICB0aGlzLnN0eWxlLndpZHRoID0gd2lkdGhcclxuICAgICAgICB0aGlzLnN0eWxlLmhlaWdodCA9IGhlaWdodFxyXG4gICAgICAgIHRoaXMuaW1nLnN0eWxlLndpZHRoID0gd2lkdGhcclxuICAgICAgICB0aGlzLmltZy5zdHlsZS5oZWlnaHQgPSBoZWlnaHRcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2NhbGUoZHcsIGRoKXtcclxuICAgICAgICBpZiAoIWRoKSBkaCA9IGR3O1xyXG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMub2Zmc2V0V2lkdGggKiBkdztcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5vZmZzZXRIZWlnaHQgKiBkaDtcclxuICAgICAgICB0aGlzLnNpemUoYCR7d2lkdGh9cHhgLCBgJHtoZWlnaHR9cHhgKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2hvdygpe1xyXG4gICAgICAgIGlmICh0aGlzLnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiKXtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuc3R5bGUuZGlzcGxheTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGhpZGUoKXtcclxuICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgIH1cclxufVxyXG5cclxuTmlkZ2V0SW1hZ2Uuc3JjQXR0cmlidXRlID0gXCJzcmNcIjtcclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWltYWdlJywgTmlkZ2V0SW1hZ2UpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEltYWdlOyIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XHJcblxyXG4vKipcclxuICogV2hlbiB1c2luZyAtLW5pZGdldC1maXQtdGV4dCwgZG8gbm90IGluY2x1ZGUgaGVpZ2h0IGFuZCB3aWR0aCBhdHRyaWJ1dGVzLlxyXG4gKiBBIGZvbnQgc2l6ZSBjYW4gYmUgdXNlZCBhcyBhIHN0YXJ0aW5nIHBvaW50LlxyXG4gKi9cclxuY2xhc3MgRml0VGV4dCB7XHJcbiAgICBjb25zdHJ1Y3RvcihuaWRnZXQpe1xyXG4gICAgICAgIHRoaXMubmlkZ2V0ID0gbmlkZ2V0O1xyXG4gICAgICAgIHRoaXMubG9jayA9IFwibm9uZVwiO1xyXG4gICAgICAgIHRoaXMucGFyc2VBcmd1bWVudHMoKTtcclxuICAgIH1cclxuXHJcbiAgICBsaXN0ZW4oKXtcclxuICAgICAgICB0aGlzLm9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpPT50aGlzLmRlbGF5UmVzaXplKHRoaXMuaFZhbHVlLCB0aGlzLndWYWx1ZSkpO1xyXG4gICAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50KTtcclxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XHJcbiAgICAgICAgdGhpcy5kZWxheSA9IDI1O1xyXG4gICAgICAgIHRoaXMuZGVsYXlSZXNpemUodGhpcy5oVmFsdWUsIHRoaXMud1ZhbHVlKTtcclxuICAgICAgICB0aGlzLnN0b3AgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBkZWxheVJlc2l6ZShoVmFsdWUsIHdWYWx1ZSl7XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAwO1xyXG4gICAgICAgIGlmICh0aGlzLnRpbWVvdXQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xyXG4gICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PnRoaXMub25SZXNpemUoaFZhbHVlLCB3VmFsdWUpLCB0aGlzLmRlbGF5KTtcclxuICAgIH1cclxuXHJcbiAgICBub3RpZnkoaFZhbHVlLCB3VmFsdWUpe1xyXG4gICAgICAgIHRoaXMuc3RvcCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZGVsYXlSZXNpemUoaFZhbHVlLCB3VmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlQXJndW1lbnRzKCl7XHJcbiAgICAgICAgbGV0IGFyZ3MgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtZml0LXRleHRcIik7XHJcblxyXG4gICAgICAgIGlmICghYXJncyB8fCBhcmdzID09PSBmYWxzZSB8fCBhcmdzID09PSBcImZhbHNlXCIpe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmhWYWx1ZSA9IHRoaXMud1ZhbHVlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZihhcmdzKSA9PSBcInN0cmluZ1wiKXtcclxuICAgICAgICAgICAgbGV0IG9iaiA9IEpTT04ucGFyc2UoYXJncyk7XHJcbiAgICAgICAgICAgIGlmIChvYmpbXCJmaXRcIl0gIT09IHVuZGVmaW5lZCAmJiBvYmpbXCJmaXRcIl0gPT09IFwid2lkdGhcIikgdGhpcy5oVmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKG9ialtcImZpdFwiXSAhPT0gdW5kZWZpbmVkICYmIG9ialtcImZpdFwiXSA9PT0gXCJoZWlnaHRcIikgdGhpcy53VmFsdWUgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKG9ialtcImxvY2tcIl0gIT09IHVuZGVmaW5lZCkgdGhpcy5sb2NrID0gKG9ialtcImxvY2tcIl0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSl7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMudGltZW91dDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc3RvcCkgcmV0dXJuO1xyXG4gICAgICAgIGlmICh0aGlzLm5pZGdldC50ZXh0Q29udGVudCA9PT0gXCJcIikgcmV0dXJuO1xyXG4gICAgICAgIGlmICh0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCA9PT0gMCkgcmV0dXJuO1xyXG4gICAgICAgIGlmICh0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldFdpZHRoID09PSAwKSByZXR1cm47XHJcbiAgICAgICAgaWYgKHRoaXMubmlkZ2V0LnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiKSByZXR1cm47XHJcblxyXG4gICAgICAgIGlmICghaFZhbHVlICYmICF3VmFsdWUpIHJldHVybjtcclxuXHJcbiAgICAgICAgbGV0IGhEaXIgPSB0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAtIHRoaXMubmlkZ2V0LnNjcm9sbEhlaWdodDtcclxuICAgICAgICBsZXQgd0RpciA9IHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0V2lkdGggLSB0aGlzLm5pZGdldC5zY3JvbGxXaWR0aDtcclxuXHJcbiAgICAgICAgaWYgKCFoVmFsdWUpIGhEaXIgPSAwO1xyXG4gICAgICAgIGlmICghd1ZhbHVlKSB3RGlyID0gMDtcclxuXHJcbiAgICAgICAgbGV0IGRpciA9IE1hdGguc2lnbihoRGlyIHwgd0Rpcik7IC8vIHdpbGwgcHJlZmVyIHRvIHNocmlua1xyXG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gMCkgdGhpcy5kaXJlY3Rpb24gPSBkaXI7IC8vIGtlZXAgcHJldmlvdXMgZGlyZWN0aW9uXHJcblxyXG4gICAgICAgIGxldCBmb250U2l6ZSA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpW1wiZm9udC1zaXplXCJdKVxyXG4gICAgICAgIGxldCBuZXdTaXplID0gZm9udFNpemUgKyAodGhpcy5kaXJlY3Rpb24pO1xyXG5cclxuICAgICAgICBpZiAobmV3U2l6ZSAhPT0gZm9udFNpemUgJiYgdGhpcy5kaXJlY3Rpb24gPT09IGRpcikge1xyXG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IG5ld1NpemUgKyBcInB4XCI7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVvdXQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT50aGlzLm9uUmVzaXplKGhWYWx1ZSwgd1ZhbHVlKSwgdGhpcy5kZWxheSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkaXIgPCAwICYmIHRoaXMuZGlyZWN0aW9uID4gMCkgeyAvLyByZXZlcnNlIGRpcmVjdGlvbiBpZiBncm93aW5nIHRvbyBsYXJnZVxyXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IC0xO1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT50aGlzLm9uUmVzaXplKGhWYWx1ZSwgd1ZhbHVlKSwgdGhpcy5kZWxheSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubG9jayA9PT0gXCJ2aFwiKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZm9udFJhdGlvID0gbmV3U2l6ZSAvIHdpbmRvdy5pbm5lckhlaWdodCAqIDEwMDtcclxuICAgICAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gZm9udFJhdGlvICsgXCJ2aFwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmxvY2sgPT09IFwidndcIil7XHJcbiAgICAgICAgICAgICAgICBsZXQgZm9udFJhdGlvID0gbmV3U2l6ZSAvIHdpbmRvdy5pbm5lcldpZHRoICogMTAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBmb250UmF0aW8gKyBcInZ3XCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3AgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIG5pZGdldCBlbGVtZW50IGZvciBkaXNwbGF5aW5nIHRleHQuXHJcbiAqIHB1dCAnLS1uaWRnZXQtZml0LXRleHQ6IDEuMDsnIGludG8gY3NzIGZvciB0aGlzIGVsZW1lbnQgdG8gZW5hYmxlIHNjYWxpbmcuXHJcbiAqIHNlZTogTmlkZ2V0U3R5bGUuanNcclxuICovXHJcbmNsYXNzIE5pZGdldFRleHQgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzW1wiZml0LXRleHQtd2lkdGgtdG9sZXJhbmNlXCJdID0gMC4wMjtcclxuICAgICAgICB0aGlzLmZpdFRleHQgPSBuZXcgRml0VGV4dCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmUoKXtcclxuICAgICAgICBpZiAodGhpcy5maXRUZXh0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dC5zdG9wID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5maXRUZXh0Lm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3VwZXIucmVtb3ZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcclxuICAgICAgICBsZXQgZml0UHJvcCA9IGdldENvbXB1dGVkU3R5bGUodGhpcykuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0XCIpO1xyXG5cclxuICAgICAgICBpZiAoZml0UHJvcCAhPT0gdW5kZWZpbmVkICYmIGZpdFByb3AgIT09IFwiXCIpe1xyXG4gICAgICAgICAgICB0aGlzLmZpdFRleHQubGlzdGVuKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldCB0ZXh0KHZhbHVlKXtcclxuICAgICAgICB0aGlzLmlubmVyVGV4dCA9IHZhbHVlO1xyXG4gICAgICAgIGlmICh0aGlzLmZpdFRleHQgJiYgdGhpcy5maXRUZXh0LnN0b3AgPT09IGZhbHNlKXtcclxuICAgICAgICAgICAgdGhpcy5maXRUZXh0LmRlbGF5UmVzaXplKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCB0ZXh0KCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5uZXJUZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIHNjYWxlKGFtb3VudCkge1xyXG4gICAgICAgIGxldCBzdHlsZUZvbnRTaXplID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcywgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShcImZvbnQtc2l6ZVwiKTtcclxuICAgICAgICBsZXQgZm9udFNpemUgPSBwYXJzZUZsb2F0KHN0eWxlRm9udFNpemUpO1xyXG4gICAgICAgIHRoaXMuc3R5bGUuZm9udFNpemUgPSAoZm9udFNpemUgKiBhbW91bnQpICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBsaW5lIGhlaWdodCB0byB0aGUgb2Zmc2V0IGhlaWdodCBtdWx0aXBsaWVkIGJ5IHJhdGlvLlxyXG4gICAgICogQ2FsbGluZyB0aGlzIG1ldGhvZCBkaXJlY3Rvcnkgd2lsbCBvdmVycmlkZSB0aGUgdmFsdWUgc2V0IGJ5IGNzc1xyXG4gICAgICovXHJcbiAgICBuaWRnZXRWZXJ0QWxpZ25UZXh0KHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkoXCItLW5pZGdldC12ZXJ0LWFsaWduLXRleHRcIiwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG9uUmVzaXplID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC12ZXJ0LWFsaWduLXRleHRcIik7XHJcbiAgICAgICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjtcclxuICAgICAgICAgICAgbGV0IGggPSB0aGlzLm9mZnNldEhlaWdodCAqIHJhdGlvO1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlLmxpbmVIZWlnaHQgPSBoICsgXCJweFwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZXJzLnZlcnRBbGlnblRleHQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy52ZXJ0QWxpZ25UZXh0ID0gbmV3IFJlc2l6ZU9ic2VydmVyKG9uUmVzaXplKTtcclxuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMudmVydEFsaWduVGV4dC5vYnNlcnZlKHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9uUmVzaXplKClcclxuICAgIH1cclxuXHJcbiAgICB2ZXJ0QWxpZ25UZXh0KHJhdGlvID0gMS4wKXtcclxuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XHJcbiAgICAgICAgbGV0IGggPSB0aGlzLm9mZnNldEhlaWdodCAqIHJhdGlvO1xyXG4gICAgICAgIHRoaXMuc3R5bGUubGluZUhlaWdodCA9IGggKyBcInB4XCI7XHJcbiAgICB9XHJcbn1cclxuO1xyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LXRleHQnLCBOaWRnZXRUZXh0KTtcclxubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRUZXh0OyIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBkcmFnSGFuZGxlciA9IHJlcXVpcmUoXCIuLi9EcmFnSGFuZGxlclwiKS5pbnN0YW5jZTtcclxuXHJcblxyXG5mdW5jdGlvbiBvbkRyYWdTdGFydChldmVudCl7ICAgIFxyXG4gICAgZHJhZ0hhbmRsZXIuc2V0KHRoaXMpO1xyXG4gICAgd2luZG93LnggPSB0aGlzO1xyXG4gICAgY29uc29sZS5sb2coXCInXCIgKyB0aGlzLm5hbWUoKSArIFwiJ1wiKTtcclxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ1N0YXJ0XCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvbkRyYWdFbmQoZXZlbnQpe1xyXG4gICAgaWYgKGRyYWdIYW5kbGVyLmdldCgpICE9PSB0aGlzKSByZXR1cm47XHJcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdFbmRcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XHJcbiAgICBkcmFnSGFuZGxlci5jbGVhcigpO1xyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xyXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5zZXRBdHRyaWJ1dGUoXCJkcmFnZ2FibGVcIiwgXCJ0cnVlXCIpOyAgIFxyXG4gICAgXHJcbiAgICBuaWRnZXQub25EcmFnU3RhcnQgPSBvbkRyYWdTdGFydC5iaW5kKG5pZGdldCk7XHJcbiAgICBuaWRnZXQub25EcmFnRW5kID0gb25EcmFnRW5kLmJpbmQobmlkZ2V0KTtcclxuICAgIFxyXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIG5pZGdldC5vbkRyYWdTdGFydCk7XHJcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW5kXCIsIG5pZGdldC5vbkRyYWdFbmQpOyAgICBcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuY29uc3QgZHJhZ0hhbmRsZXIgPSByZXF1aXJlKFwiLi4vRHJhZ0hhbmRsZXJcIikuaW5zdGFuY2U7XHJcbmNvbnN0IE1vdXNlVXRpbGl0aWVzID0gcmVxdWlyZShcIi4uL01vdXNlVXRpbGl0aWVzXCIpO1xyXG5cclxuZnVuY3Rpb24gb25EcmFnT3ZlcihldmVudCl7XHJcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgbGV0IGRyYWdOaWRnZXQgPSBkcmFnSGFuZGxlci5nZXQoKTtcclxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ092ZXJcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcywgZHJhZ05pZGdldCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uRHJhZ0VudGVyKGV2ZW50KXtcclxuICAgIGlmICghZHJhZ0hhbmRsZXIuaGFzKCkpIHJldHVybjtcclxuICAgIGlmICghZHJhZ0hhbmRsZXIucHVzaE92ZXIodGhpcykpIHJldHVybjtcclxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ0VudGVyXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvbkRyYWdMZWF2ZShldmVudCl7XHJcbiAgICBpZiAoIWRyYWdIYW5kbGVyLmhhcygpKSByZXR1cm47XHJcbiAgICBpZiAoTW91c2VVdGlsaXRpZXMuaXNVbmRlcih0aGlzLmdldEVsZW1lbnQoKSkpIHJldHVybjtcclxuICAgIGlmICghZHJhZ0hhbmRsZXIucmVtb3ZlT3Zlcih0aGlzKSkgcmV0dXJuO1xyXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnTGVhdmVcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uRHJvcChldmVudCl7XHJcbiAgICBsZXQgZHJhZ05pZGdldCA9IGRyYWdIYW5kbGVyLmdldCgpO1xyXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcm9wXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMsIGRyYWdOaWRnZXQpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XHJcbiAgICBuaWRnZXQub25EcmFnT3ZlciA9IG9uRHJhZ092ZXIuYmluZChuaWRnZXQpO1xyXG4gICAgbmlkZ2V0Lm9uRHJvcCA9IG9uRHJvcC5iaW5kKG5pZGdldCk7XHJcbiAgICBuaWRnZXQub25EcmFnRW50ZXIgPSBvbkRyYWdFbnRlci5iaW5kKG5pZGdldCk7XHJcbiAgICBuaWRnZXQub25EcmFnTGVhdmUgPSBvbkRyYWdMZWF2ZS5iaW5kKG5pZGdldCk7XHJcbiAgICBcclxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIG5pZGdldC5vbkRyYWdPdmVyKTtcclxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgbmlkZ2V0Lm9uRHJvcCk7XHJcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW50ZXJcIiwgbmlkZ2V0Lm9uRHJhZ0VudGVyKTtcclxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdsZWF2ZVwiLCBuaWRnZXQub25EcmFnTGVhdmUpOyAgICBcclxufTsiLCJcInVzZSBzdHJpY3RcIjtcclxuY29uc3QgTW91c2VVdGlsaXRpZXMgPSByZXF1aXJlKFwiLi4vTW91c2VVdGlsaXRpZXNcIik7XHJcblxyXG5mdW5jdGlvbiBvbkNsaWNrKGV2ZW50KXsgICAgXHJcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImNsaWNrXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvbk1vdXNlRG93bihldmVudCl7ICAgIFxyXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZURvd25cIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uTW91c2VVcChldmVudCl7ICAgIFxyXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZVVwXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBvbk1vdXNlRW50ZXIoZXZlbnQpeyAgICBcclxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VFbnRlclwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25Nb3VzZUxlYXZlKGV2ZW50KXtcclxuICAgIGlmIChNb3VzZVV0aWxpdGllcy5pc1VuZGVyKHRoaXMuZ2V0RWxlbWVudCgpKSkgcmV0dXJuO1xyXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZUV4aXRcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcclxuICAgIGNvbnNvbGUubG9nKFwibW91c2Ugc2V0dXBcIik7XHJcbiAgICBcclxuICAgIG5pZGdldC5vbkNsaWNrID0gb25DbGljay5iaW5kKG5pZGdldCk7XHJcbiAgICBuaWRnZXQub25Nb3VzZURvd24gPSBvbk1vdXNlRG93bi5iaW5kKG5pZGdldCk7XHJcbiAgICBuaWRnZXQub25Nb3VzZVVwID0gb25Nb3VzZVVwLmJpbmQobmlkZ2V0KTtcclxuICAgIG5pZGdldC5vbk1vdXNlRW50ZXIgPSBvbk1vdXNlRW50ZXIuYmluZChuaWRnZXQpO1xyXG4gICAgbmlkZ2V0Lm9uTW91c2VMZWF2ZSA9IG9uTW91c2VMZWF2ZS5iaW5kKG5pZGdldCk7XHJcbiAgICBcclxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIG5pZGdldC5vbkNsaWNrKTtcclxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBuaWRnZXQub25Nb3VzZURvd24pO1xyXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBuaWRnZXQub25Nb3VzZVVwKTtcclxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgbmlkZ2V0Lm9uTW91c2VFbnRlcik7XHJcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCBuaWRnZXQub25Nb3VzZUxlYXZlKTtcclxufTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKipcclxuICogRW5hYmxlIHRoZSBuaWRnZXQgdG8gYmUgbW92ZWQgYnkgZHJhZ2dpbmcuICBXaWxsIGRyYWcgYnkgYW55IGNoaWxkIGVsZWVtZW50XHJcbiAqIHRoZSAnLm5pZGdldC1oZWFkZXInIGNsYXNzLCBvdGhlcndpc2UgbW92YWJsZSBieSBjbGlja2luZyBhbnl3aGVyZS5cclxuICogQHBhcmFtIHt0eXBlfSBlXHJcbiAqIEByZXR1cm4ge3VuZGVmaW5lZH1cclxuICovXHJcblxyXG5mdW5jdGlvbiBvbk1vdXNlTW92ZShlKXsgICAgXHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBpZiAoIXRoaXMuX19tb3ZhYmxlLmFjdGl2ZSkgcmV0dXJuOyAgICBcclxuXHJcbiAgICAvLyBjYWxjdWxhdGUgdGhlIG5ldyBjdXJzb3IgcG9zaXRpb246XHJcbiAgICBsZXQgZGVsdGFYID0gdGhpcy5fX21vdmFibGUubGFzdFggLSBlLmNsaWVudFg7XHJcbiAgICBsZXQgZGVsdGFZID0gdGhpcy5fX21vdmFibGUubGFzdFkgLSBlLmNsaWVudFk7XHJcbiAgICB0aGlzLl9fbW92YWJsZS5sYXN0WCA9IGUuY2xpZW50WDtcclxuICAgIHRoaXMuX19tb3ZhYmxlLmxhc3RZID0gZS5jbGllbnRZO1xyXG4gICAgXHJcbiAgICAvLyBzZXQgdGhlIGVsZW1lbnQncyBuZXcgcG9zaXRpb246XHJcbiAgICB0aGlzLnN0eWxlLnRvcCA9ICh0aGlzLm9mZnNldFRvcCAtIGRlbHRhWSkgKyBcInB4XCI7XHJcbiAgICB0aGlzLnN0eWxlLmxlZnQgPSAodGhpcy5vZmZzZXRMZWZ0IC0gZGVsdGFYKSArIFwicHhcIjtcclxufVxyXG5cclxuZnVuY3Rpb24gb25Nb3VzZURvd24oZSl7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0aGlzLl9fbW92YWJsZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgXHJcbiAgICAvLyBnZXQgdGhlIG1vdXNlIGN1cnNvciBwb3NpdGlvbiBhdCBzdGFydHVwOlxyXG4gICAgdGhpcy5fX21vdmFibGUubGFzdFggPSBlLmNsaWVudFg7XHJcbiAgICB0aGlzLl9fbW92YWJsZS5sYXN0WSA9IGUuY2xpZW50WTtcclxufVxyXG5cclxuZnVuY3Rpb24gb25Nb3VzZVVwKGUpe1xyXG4gICAgdGhpcy5fX21vdmFibGUuYWN0aXZlID0gZmFsc2U7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcclxuICAgIG5pZGdldC5fX21vdmFibGUgPSB7XHJcbiAgICAgICAgbGFzdFggOiAwLFxyXG4gICAgICAgIGxhc3RZIDogMCxcclxuICAgICAgICBhY3RpdmUgOiBmYWxzZVxyXG4gICAgfTtcclxuICAgIFxyXG4gICAgbmlkZ2V0Lm9uTW91c2VEb3duID0gb25Nb3VzZURvd24uYmluZChuaWRnZXQpOyAgICAgICAgXHJcbiAgICBcclxuICAgIGlmIChuaWRnZXQucXVlcnlTZWxlY3RvcihcIi5uaWRnZXQtaGVhZGVyXCIpKXtcclxuICAgICAgICBuaWRnZXQucXVlcnlTZWxlY3RvcihcIi5uaWRnZXQtaGVhZGVyXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgbmlkZ2V0Lm9uTW91c2VEb3duKTsgICAgICAgIFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBuaWRnZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBuaWRnZXQub25Nb3VzZURvd24pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBuaWRnZXQub25Nb3VzZU1vdmUgPSBvbk1vdXNlTW92ZS5iaW5kKG5pZGdldCk7ICAgIFxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbmlkZ2V0Lm9uTW91c2VNb3ZlKTtcclxuXHJcbiAgICBuaWRnZXQub25Nb3VzZVVwID0gb25Nb3VzZVVwLmJpbmQobmlkZ2V0KTsgICAgXHJcbiAgICBuaWRnZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgbmlkZ2V0Lm9uTW91c2VVcCk7XHJcblxyXG59OyIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0XCIpO1xyXG53aW5kb3cuTmlkZ2V0ID0gTmlkZ2V0O1xyXG5cclxuLyoqXHJcbiAqIEFkZCBhIHJlc2l6ZSBvYnNlcnZlciB0byB0aGUgZWxlbWVudCB0aGF0IHdpbGwgY2FsbCBhIG9uUmVzaXplKCkgZnVuY3Rpb24uXHJcbiAqIFRoZSBwYXJhbWV0ZXJzIHBhc3NlZCBpbiBhcmUgKHByZXZpb3VzX2RpbWVuc2lvbnMpLiAgVG8gdXNlIGFkZFxyXG4gKiBpbnRlcmZhY2VzPVwicmVzaXplXCIgdG8gdGhlIGVsZW1lbnQgaW4gaHRtbCBhbmQgYSBtZXRob2Qgb25SZXNpemUoKSB0byB0aGUgXHJcbiAqIGNsYXNzIG9iamVjdC4gIElmIHRoZXJlIGlzIG5vIGNsYXNzIG9iamVjdCBjcmVhdGUgYSBmdW5jdGlvbiBhbmQgYmluZCBpdC5cclxuICogaWU6IGVsZW1lbnQub25SZXNpemUgPSBmdW5jdGlvbi5iaW5kKGVsZW1lbnQpOyBcclxuICovXHJcblxyXG5sZXQgb25SZXNpemUgPSBmdW5jdGlvbigpe1xyXG4gICAgbGV0IGRhdGEgPSB0aGlzW05pZGdldC5pbnRlcmZhY2VEYXRhRmllbGRdLnJlc2l6ZTtcclxuICAgIGxldCBwcmV2ID0gZGF0YS5wcmV2O1xyXG4gICAgaWYgKCF0aGlzLm9uUmVzaXplKSByZXR1cm47XHJcbiAgICB0aGlzLm9uUmVzaXplKHByZXYpO1xyXG4gICAgbG9hZFByZXZpb3VzKHRoaXMpO1xyXG59O1xyXG5cclxubGV0IGxvYWRQcmV2aW91cyA9IGZ1bmN0aW9uKG5pZGdldCl7XHJcbiAgICBsZXQgZGF0YSA9IG5pZGdldFtOaWRnZXQuaW50ZXJmYWNlRGF0YUZpZWxkXS5yZXNpemU7XHJcbiAgICBkYXRhLnByZXYgPSB7XHJcbiAgICAgICAgd2lkdGggOiBuaWRnZXQub2Zmc2V0V2lkdGgsXHJcbiAgICAgICAgaGVpZ2h0IDogbmlkZ2V0Lm9mZnNldEhlaWdodFxyXG4gICAgfTsgICAgXHJcbn07XHJcblxyXG4vKipcclxuICogU2V0dXAgYSByZXNpemUgb2JzZXJ2ZXIgZm9yIHRoZSBuaWRnZXQgdGhhdCB0cmlnZ2VycyB0aGUgb25SZXNpemUgbWV0aG9kIGlmIFxyXG4gKiBhdmFpbGFibGUuXHJcbiAqIC0gb25SZXNpemUodGhpcywgcHJldmlvdXNfZGltZW5zaW9ucykgOiBub25lXHJcbiAqIEBwYXJhbSB7dHlwZX0gbmlkZ2V0XHJcbiAqIEByZXR1cm4ge3VuZGVmaW5lZH1cclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcclxuICAgIGlmICh0eXBlb2YobmlkZ2V0KSAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IFwiT2JqZWN0IGV4ZWN0ZWRcIjtcclxuICAgIGxldCByZXNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcihvblJlc2l6ZS5iaW5kKG5pZGdldCkpO1xyXG4gICAgcmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZShuaWRnZXQpO1xyXG4gICAgbG9hZFByZXZpb3VzKG5pZGdldCk7XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIEFic3RyYWN0TW9kZWwgOiByZXF1aXJlKFwiLi9BYnN0cmFjdE1vZGVsXCIpLFxyXG4gICAgTmlkZ2V0RWxlbWVudCA6IHJlcXVpcmUoXCIuL05pZGdldEVsZW1lbnRcIiksXHJcbiAgICBGaWxlT3BlcmF0aW9ucyA6IHJlcXVpcmUoXCIuL0ZpbGVPcGVyYXRpb25zXCIpLFxyXG4gICAgTmlkZ2V0QnV0dG9uU2V0IDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU2V0XCIpLFxyXG4gICAgTmlkZ2V0QnV0dG9uIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uXCIpLFxyXG4gICAgTmlkZ2V0QnV0dG9uU3RhdGUgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b25TdGF0ZVwiKSxcclxuICAgIE5pZGdldEltYWdlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SW1hZ2VcIiksXHJcbiAgICBOaWRnZXRIVE1MSW1hZ2UgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRIVE1MSW1hZ2VcIiksXHJcbiAgICBOaWRnZXRUZXh0IDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0VGV4dFwiKSxcclxuICAgIE5pZGdldENvbnRhaW5lciA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldENvbnRhaW5lclwiKSxcclxuICAgIE1vdXNlVXRpbGl0aWVzIDogcmVxdWlyZShcIi4vTW91c2VVdGlsaXRpZXNcIiksXHJcbiAgICBDb25zdGFudHM6IHJlcXVpcmUoXCIuL05pZGdldFwiKSxcclxuICAgIGxheW91dHM6IHt9XHJcbn07IiwiZnVuY3Rpb24gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKSB7XG4gIGlmIChzZWxmID09PSB2b2lkIDApIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gIH1cblxuICByZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXNzZXJ0VGhpc0luaXRpYWxpemVkO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywga2V5LCBhcmcpIHtcbiAgdHJ5IHtcbiAgICB2YXIgaW5mbyA9IGdlbltrZXldKGFyZyk7XG4gICAgdmFyIHZhbHVlID0gaW5mby52YWx1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZWplY3QoZXJyb3IpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChpbmZvLmRvbmUpIHtcbiAgICByZXNvbHZlKHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oX25leHQsIF90aHJvdyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2FzeW5jVG9HZW5lcmF0b3IoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBnZW4gPSBmbi5hcHBseShzZWxmLCBhcmdzKTtcblxuICAgICAgZnVuY3Rpb24gX25leHQodmFsdWUpIHtcbiAgICAgICAgYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBcIm5leHRcIiwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfdGhyb3coZXJyKSB7XG4gICAgICAgIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywgXCJ0aHJvd1wiLCBlcnIpO1xuICAgICAgfVxuXG4gICAgICBfbmV4dCh1bmRlZmluZWQpO1xuICAgIH0pO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hc3luY1RvR2VuZXJhdG9yO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NsYXNzQ2FsbENoZWNrO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBzZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuL3NldFByb3RvdHlwZU9mLmpzXCIpO1xuXG52YXIgaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0ID0gcmVxdWlyZShcIi4vaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0LmpzXCIpO1xuXG5mdW5jdGlvbiBfY29uc3RydWN0KFBhcmVudCwgYXJncywgQ2xhc3MpIHtcbiAgaWYgKGlzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfY29uc3RydWN0ID0gUmVmbGVjdC5jb25zdHJ1Y3Q7XG4gICAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX2NvbnN0cnVjdCA9IGZ1bmN0aW9uIF9jb25zdHJ1Y3QoUGFyZW50LCBhcmdzLCBDbGFzcykge1xuICAgICAgdmFyIGEgPSBbbnVsbF07XG4gICAgICBhLnB1c2guYXBwbHkoYSwgYXJncyk7XG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSBGdW5jdGlvbi5iaW5kLmFwcGx5KFBhcmVudCwgYSk7XG4gICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQ29uc3RydWN0b3IoKTtcbiAgICAgIGlmIChDbGFzcykgc2V0UHJvdG90eXBlT2YoaW5zdGFuY2UsIENsYXNzLnByb3RvdHlwZSk7XG4gICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBfY29uc3RydWN0LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NvbnN0cnVjdDtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICByZXR1cm4gQ29uc3RydWN0b3I7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NyZWF0ZUNsYXNzO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBzdXBlclByb3BCYXNlID0gcmVxdWlyZShcIi4vc3VwZXJQcm9wQmFzZS5qc1wiKTtcblxuZnVuY3Rpb24gX2dldCh0YXJnZXQsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICBpZiAodHlwZW9mIFJlZmxlY3QgIT09IFwidW5kZWZpbmVkXCIgJiYgUmVmbGVjdC5nZXQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9nZXQgPSBSZWZsZWN0LmdldDtcbiAgICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIH0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfZ2V0ID0gZnVuY3Rpb24gX2dldCh0YXJnZXQsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICAgICAgdmFyIGJhc2UgPSBzdXBlclByb3BCYXNlKHRhcmdldCwgcHJvcGVydHkpO1xuICAgICAgaWYgKCFiYXNlKSByZXR1cm47XG4gICAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoYmFzZSwgcHJvcGVydHkpO1xuXG4gICAgICBpZiAoZGVzYy5nZXQpIHtcbiAgICAgICAgcmV0dXJuIGRlc2MuZ2V0LmNhbGwocmVjZWl2ZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIF9nZXQodGFyZ2V0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIgfHwgdGFyZ2V0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfZ2V0O1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gX2dldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LmdldFByb3RvdHlwZU9mIDogZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHtcbiAgICByZXR1cm4gby5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKG8pO1xuICB9O1xuICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2dldFByb3RvdHlwZU9mO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBzZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuL3NldFByb3RvdHlwZU9mLmpzXCIpO1xuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBzZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2luaGVyaXRzO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgXCJkZWZhdWx0XCI6IG9ialxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX2lzTmF0aXZlRnVuY3Rpb24oZm4pIHtcbiAgcmV0dXJuIEZ1bmN0aW9uLnRvU3RyaW5nLmNhbGwoZm4pLmluZGV4T2YoXCJbbmF0aXZlIGNvZGVdXCIpICE9PSAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaXNOYXRpdmVGdW5jdGlvbjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KCkge1xuICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwidW5kZWZpbmVkXCIgfHwgIVJlZmxlY3QuY29uc3RydWN0KSByZXR1cm4gZmFsc2U7XG4gIGlmIChSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgUHJveHkgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIHRydWU7XG5cbiAgdHJ5IHtcbiAgICBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbiwgW10sIGZ1bmN0aW9uICgpIHt9KSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0O1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBfdHlwZW9mID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpW1wiZGVmYXVsdFwiXTtcblxudmFyIGFzc2VydFRoaXNJbml0aWFsaXplZCA9IHJlcXVpcmUoXCIuL2Fzc2VydFRoaXNJbml0aWFsaXplZC5qc1wiKTtcblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkge1xuICBpZiAoY2FsbCAmJiAoX3R5cGVvZihjYWxsKSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSkge1xuICAgIHJldHVybiBjYWxsO1xuICB9XG5cbiAgcmV0dXJuIGFzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xuICBtb2R1bGUuZXhwb3J0cyA9IF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xuICAgIG8uX19wcm90b19fID0gcDtcbiAgICByZXR1cm4gbztcbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIHJldHVybiBfc2V0UHJvdG90eXBlT2YobywgcCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3NldFByb3RvdHlwZU9mO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBnZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuL2dldFByb3RvdHlwZU9mLmpzXCIpO1xuXG5mdW5jdGlvbiBfc3VwZXJQcm9wQmFzZShvYmplY3QsIHByb3BlcnR5KSB7XG4gIHdoaWxlICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpKSB7XG4gICAgb2JqZWN0ID0gZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcbiAgICBpZiAob2JqZWN0ID09PSBudWxsKSBicmVhaztcbiAgfVxuXG4gIHJldHVybiBvYmplY3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3N1cGVyUHJvcEJhc2U7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiO1xuXG4gIGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iajtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIF90eXBlb2Yob2JqKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBnZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuL2dldFByb3RvdHlwZU9mLmpzXCIpO1xuXG52YXIgc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiLi9zZXRQcm90b3R5cGVPZi5qc1wiKTtcblxudmFyIGlzTmF0aXZlRnVuY3Rpb24gPSByZXF1aXJlKFwiLi9pc05hdGl2ZUZ1bmN0aW9uLmpzXCIpO1xuXG52YXIgY29uc3RydWN0ID0gcmVxdWlyZShcIi4vY29uc3RydWN0LmpzXCIpO1xuXG5mdW5jdGlvbiBfd3JhcE5hdGl2ZVN1cGVyKENsYXNzKSB7XG4gIHZhciBfY2FjaGUgPSB0eXBlb2YgTWFwID09PSBcImZ1bmN0aW9uXCIgPyBuZXcgTWFwKCkgOiB1bmRlZmluZWQ7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBfd3JhcE5hdGl2ZVN1cGVyID0gZnVuY3Rpb24gX3dyYXBOYXRpdmVTdXBlcihDbGFzcykge1xuICAgIGlmIChDbGFzcyA9PT0gbnVsbCB8fCAhaXNOYXRpdmVGdW5jdGlvbihDbGFzcykpIHJldHVybiBDbGFzcztcblxuICAgIGlmICh0eXBlb2YgQ2xhc3MgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgX2NhY2hlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAoX2NhY2hlLmhhcyhDbGFzcykpIHJldHVybiBfY2FjaGUuZ2V0KENsYXNzKTtcblxuICAgICAgX2NhY2hlLnNldChDbGFzcywgV3JhcHBlcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gV3JhcHBlcigpIHtcbiAgICAgIHJldHVybiBjb25zdHJ1Y3QoQ2xhc3MsIGFyZ3VtZW50cywgZ2V0UHJvdG90eXBlT2YodGhpcykuY29uc3RydWN0b3IpO1xuICAgIH1cblxuICAgIFdyYXBwZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDbGFzcy5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBXcmFwcGVyLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBzZXRQcm90b3R5cGVPZihXcmFwcGVyLCBDbGFzcyk7XG4gIH07XG5cbiAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICByZXR1cm4gX3dyYXBOYXRpdmVTdXBlcihDbGFzcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3dyYXBOYXRpdmVTdXBlcjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWdlbmVyYXRvci1ydW50aW1lXCIpO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG52YXIgcnVudGltZSA9IChmdW5jdGlvbiAoZXhwb3J0cykge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgT3AgPSBPYmplY3QucHJvdG90eXBlO1xuICB2YXIgaGFzT3duID0gT3AuaGFzT3duUHJvcGVydHk7XG4gIHZhciB1bmRlZmluZWQ7IC8vIE1vcmUgY29tcHJlc3NpYmxlIHRoYW4gdm9pZCAwLlxuICB2YXIgJFN5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbCA6IHt9O1xuICB2YXIgaXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuICB2YXIgYXN5bmNJdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuYXN5bmNJdGVyYXRvciB8fCBcIkBAYXN5bmNJdGVyYXRvclwiO1xuICB2YXIgdG9TdHJpbmdUYWdTeW1ib2wgPSAkU3ltYm9sLnRvU3RyaW5nVGFnIHx8IFwiQEB0b1N0cmluZ1RhZ1wiO1xuXG4gIGZ1bmN0aW9uIGRlZmluZShvYmosIGtleSwgdmFsdWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiBvYmpba2V5XTtcbiAgfVxuICB0cnkge1xuICAgIC8vIElFIDggaGFzIGEgYnJva2VuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSB0aGF0IG9ubHkgd29ya3Mgb24gRE9NIG9iamVjdHMuXG4gICAgZGVmaW5lKHt9LCBcIlwiKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgZGVmaW5lID0gZnVuY3Rpb24ob2JqLCBrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gb2JqW2tleV0gPSB2YWx1ZTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIC8vIElmIG91dGVyRm4gcHJvdmlkZWQgYW5kIG91dGVyRm4ucHJvdG90eXBlIGlzIGEgR2VuZXJhdG9yLCB0aGVuIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yLlxuICAgIHZhciBwcm90b0dlbmVyYXRvciA9IG91dGVyRm4gJiYgb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IgPyBvdXRlckZuIDogR2VuZXJhdG9yO1xuICAgIHZhciBnZW5lcmF0b3IgPSBPYmplY3QuY3JlYXRlKHByb3RvR2VuZXJhdG9yLnByb3RvdHlwZSk7XG4gICAgdmFyIGNvbnRleHQgPSBuZXcgQ29udGV4dCh0cnlMb2NzTGlzdCB8fCBbXSk7XG5cbiAgICAvLyBUaGUgLl9pbnZva2UgbWV0aG9kIHVuaWZpZXMgdGhlIGltcGxlbWVudGF0aW9ucyBvZiB0aGUgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzLlxuICAgIGdlbmVyYXRvci5faW52b2tlID0gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcblxuICAgIHJldHVybiBnZW5lcmF0b3I7XG4gIH1cbiAgZXhwb3J0cy53cmFwID0gd3JhcDtcblxuICAvLyBUcnkvY2F0Y2ggaGVscGVyIHRvIG1pbmltaXplIGRlb3B0aW1pemF0aW9ucy4gUmV0dXJucyBhIGNvbXBsZXRpb25cbiAgLy8gcmVjb3JkIGxpa2UgY29udGV4dC50cnlFbnRyaWVzW2ldLmNvbXBsZXRpb24uIFRoaXMgaW50ZXJmYWNlIGNvdWxkXG4gIC8vIGhhdmUgYmVlbiAoYW5kIHdhcyBwcmV2aW91c2x5KSBkZXNpZ25lZCB0byB0YWtlIGEgY2xvc3VyZSB0byBiZVxuICAvLyBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnRzLCBidXQgaW4gYWxsIHRoZSBjYXNlcyB3ZSBjYXJlIGFib3V0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhbiBleGlzdGluZyBtZXRob2Qgd2Ugd2FudCB0byBjYWxsLCBzbyB0aGVyZSdzIG5vIG5lZWRcbiAgLy8gdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIG9iamVjdC4gV2UgY2FuIGV2ZW4gZ2V0IGF3YXkgd2l0aCBhc3N1bWluZ1xuICAvLyB0aGUgbWV0aG9kIHRha2VzIGV4YWN0bHkgb25lIGFyZ3VtZW50LCBzaW5jZSB0aGF0IGhhcHBlbnMgdG8gYmUgdHJ1ZVxuICAvLyBpbiBldmVyeSBjYXNlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIHRvdWNoIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBUaGVcbiAgLy8gb25seSBhZGRpdGlvbmFsIGFsbG9jYXRpb24gcmVxdWlyZWQgaXMgdGhlIGNvbXBsZXRpb24gcmVjb3JkLCB3aGljaFxuICAvLyBoYXMgYSBzdGFibGUgc2hhcGUgYW5kIHNvIGhvcGVmdWxseSBzaG91bGQgYmUgY2hlYXAgdG8gYWxsb2NhdGUuXG4gIGZ1bmN0aW9uIHRyeUNhdGNoKGZuLCBvYmosIGFyZykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIm5vcm1hbFwiLCBhcmc6IGZuLmNhbGwob2JqLCBhcmcpIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcInRocm93XCIsIGFyZzogZXJyIH07XG4gICAgfVxuICB9XG5cbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgPSBcInN1c3BlbmRlZFN0YXJ0XCI7XG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkID0gXCJzdXNwZW5kZWRZaWVsZFwiO1xuICB2YXIgR2VuU3RhdGVFeGVjdXRpbmcgPSBcImV4ZWN1dGluZ1wiO1xuICB2YXIgR2VuU3RhdGVDb21wbGV0ZWQgPSBcImNvbXBsZXRlZFwiO1xuXG4gIC8vIFJldHVybmluZyB0aGlzIG9iamVjdCBmcm9tIHRoZSBpbm5lckZuIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXNcbiAgLy8gYnJlYWtpbmcgb3V0IG9mIHRoZSBkaXNwYXRjaCBzd2l0Y2ggc3RhdGVtZW50LlxuICB2YXIgQ29udGludWVTZW50aW5lbCA9IHt9O1xuXG4gIC8vIER1bW15IGNvbnN0cnVjdG9yIGZ1bmN0aW9ucyB0aGF0IHdlIHVzZSBhcyB0aGUgLmNvbnN0cnVjdG9yIGFuZFxuICAvLyAuY29uc3RydWN0b3IucHJvdG90eXBlIHByb3BlcnRpZXMgZm9yIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0cy4gRm9yIGZ1bGwgc3BlYyBjb21wbGlhbmNlLCB5b3UgbWF5IHdpc2ggdG8gY29uZmlndXJlIHlvdXJcbiAgLy8gbWluaWZpZXIgbm90IHRvIG1hbmdsZSB0aGUgbmFtZXMgb2YgdGhlc2UgdHdvIGZ1bmN0aW9ucy5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG5cbiAgLy8gVGhpcyBpcyBhIHBvbHlmaWxsIGZvciAlSXRlcmF0b3JQcm90b3R5cGUlIGZvciBlbnZpcm9ubWVudHMgdGhhdFxuICAvLyBkb24ndCBuYXRpdmVseSBzdXBwb3J0IGl0LlxuICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcbiAgSXRlcmF0b3JQcm90b3R5cGVbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbiAgdmFyIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG8gJiYgZ2V0UHJvdG8oZ2V0UHJvdG8odmFsdWVzKFtdKSkpO1xuICBpZiAoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgJiZcbiAgICAgIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICE9PSBPcCAmJlxuICAgICAgaGFzT3duLmNhbGwoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUsIGl0ZXJhdG9yU3ltYm9sKSkge1xuICAgIC8vIFRoaXMgZW52aXJvbm1lbnQgaGFzIGEgbmF0aXZlICVJdGVyYXRvclByb3RvdHlwZSU7IHVzZSBpdCBpbnN0ZWFkXG4gICAgLy8gb2YgdGhlIHBvbHlmaWxsLlxuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gTmF0aXZlSXRlcmF0b3JQcm90b3R5cGU7XG4gIH1cblxuICB2YXIgR3AgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUgPVxuICAgIEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlKTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR3AuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvbjtcbiAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBkZWZpbmUoXG4gICAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUsXG4gICAgdG9TdHJpbmdUYWdTeW1ib2wsXG4gICAgXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICk7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgZGVmaW5lKHByb3RvdHlwZSwgbWV0aG9kLCBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbiA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvclxuICAgICAgPyBjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fFxuICAgICAgICAvLyBGb3IgdGhlIG5hdGl2ZSBHZW5lcmF0b3JGdW5jdGlvbiBjb25zdHJ1Y3RvciwgdGhlIGJlc3Qgd2UgY2FuXG4gICAgICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAgICAgKGN0b3IuZGlzcGxheU5hbWUgfHwgY3Rvci5uYW1lKSA9PT0gXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICAgICA6IGZhbHNlO1xuICB9O1xuXG4gIGV4cG9ydHMubWFyayA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIGlmIChPYmplY3Quc2V0UHJvdG90eXBlT2YpIHtcbiAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihnZW5GdW4sIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2VuRnVuLl9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAgICAgZGVmaW5lKGdlbkZ1biwgdG9TdHJpbmdUYWdTeW1ib2wsIFwiR2VuZXJhdG9yRnVuY3Rpb25cIik7XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIGV4cG9ydHMuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvciwgUHJvbWlzZUltcGwpIHtcbiAgICBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGdlbmVyYXRvclttZXRob2RdLCBnZW5lcmF0b3IsIGFyZyk7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICByZWplY3QocmVjb3JkLmFyZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzdWx0ID0gcmVjb3JkLmFyZztcbiAgICAgICAgdmFyIHZhbHVlID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgJiZcbiAgICAgICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlSW1wbC5yZXNvbHZlKHZhbHVlLl9fYXdhaXQpLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGludm9rZShcIm5leHRcIiwgdmFsdWUsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJ0aHJvd1wiLCBlcnIsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZUltcGwucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgLy8gSWYgYSByZWplY3RlZCBQcm9taXNlIHdhcyB5aWVsZGVkLCB0aHJvdyB0aGUgcmVqZWN0aW9uIGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gc28gaXQgY2FuIGJlIGhhbmRsZWQgdGhlcmUuXG4gICAgICAgICAgcmV0dXJuIGludm9rZShcInRocm93XCIsIGVycm9yLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHJldmlvdXNQcm9taXNlO1xuXG4gICAgZnVuY3Rpb24gZW5xdWV1ZShtZXRob2QsIGFyZykge1xuICAgICAgZnVuY3Rpb24gY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZUltcGwoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihcbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyxcbiAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieSBsYXRlclxuICAgICAgICAgIC8vIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZ1xuICAgICAgICApIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuICBBc3luY0l0ZXJhdG9yLnByb3RvdHlwZVthc3luY0l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgZXhwb3J0cy5Bc3luY0l0ZXJhdG9yID0gQXN5bmNJdGVyYXRvcjtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgZXhwb3J0cy5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0LCBQcm9taXNlSW1wbCkge1xuICAgIGlmIChQcm9taXNlSW1wbCA9PT0gdm9pZCAwKSBQcm9taXNlSW1wbCA9IFByb21pc2U7XG5cbiAgICB2YXIgaXRlciA9IG5ldyBBc3luY0l0ZXJhdG9yKFxuICAgICAgd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCksXG4gICAgICBQcm9taXNlSW1wbFxuICAgICk7XG5cbiAgICByZXR1cm4gZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uKG91dGVyRm4pXG4gICAgICA/IGl0ZXIgLy8gSWYgb3V0ZXJGbiBpcyBhIGdlbmVyYXRvciwgcmV0dXJuIHRoZSBmdWxsIGl0ZXJhdG9yLlxuICAgICAgOiBpdGVyLm5leHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZG9uZSA/IHJlc3VsdC52YWx1ZSA6IGl0ZXIubmV4dCgpO1xuICAgICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dC5tZXRob2QgPSBtZXRob2Q7XG4gICAgICBjb250ZXh0LmFyZyA9IGFyZztcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgdmFyIGRlbGVnYXRlUmVzdWx0ID0gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG4gICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQgPT09IENvbnRpbnVlU2VudGluZWwpIGNvbnRpbnVlO1xuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlUmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAvLyBTZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgICAgIGNvbnRleHQuc2VudCA9IGNvbnRleHQuX3NlbnQgPSBjb250ZXh0LmFyZztcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBjb250ZXh0LmFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKTtcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgY29udGV4dC5hcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUV4ZWN1dGluZztcblxuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgICAgIC8vIElmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSBpbm5lckZuLCB3ZSBsZWF2ZSBzdGF0ZSA9PT1cbiAgICAgICAgICAvLyBHZW5TdGF0ZUV4ZWN1dGluZyBhbmQgbG9vcCBiYWNrIGZvciBhbm90aGVyIGludm9jYXRpb24uXG4gICAgICAgICAgc3RhdGUgPSBjb250ZXh0LmRvbmVcbiAgICAgICAgICAgID8gR2VuU3RhdGVDb21wbGV0ZWRcbiAgICAgICAgICAgIDogR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHJlY29yZC5hcmcsXG4gICAgICAgICAgICBkb25lOiBjb250ZXh0LmRvbmVcbiAgICAgICAgICB9O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV4Y2VwdGlvbiBieSBsb29waW5nIGJhY2sgYXJvdW5kIHRvIHRoZVxuICAgICAgICAgIC8vIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpIGNhbGwgYWJvdmUuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIENhbGwgZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdKGNvbnRleHQuYXJnKSBhbmQgaGFuZGxlIHRoZVxuICAvLyByZXN1bHQsIGVpdGhlciBieSByZXR1cm5pbmcgYSB7IHZhbHVlLCBkb25lIH0gcmVzdWx0IGZyb20gdGhlXG4gIC8vIGRlbGVnYXRlIGl0ZXJhdG9yLCBvciBieSBtb2RpZnlpbmcgY29udGV4dC5tZXRob2QgYW5kIGNvbnRleHQuYXJnLFxuICAvLyBzZXR0aW5nIGNvbnRleHQuZGVsZWdhdGUgdG8gbnVsbCwgYW5kIHJldHVybmluZyB0aGUgQ29udGludWVTZW50aW5lbC5cbiAgZnVuY3Rpb24gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBtZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF07XG4gICAgaWYgKG1ldGhvZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBBIC50aHJvdyBvciAucmV0dXJuIHdoZW4gdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBubyAudGhyb3dcbiAgICAgIC8vIG1ldGhvZCBhbHdheXMgdGVybWluYXRlcyB0aGUgeWllbGQqIGxvb3AuXG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgLy8gTm90ZTogW1wicmV0dXJuXCJdIG11c3QgYmUgdXNlZCBmb3IgRVMzIHBhcnNpbmcgY29tcGF0aWJpbGl0eS5cbiAgICAgICAgaWYgKGRlbGVnYXRlLml0ZXJhdG9yW1wicmV0dXJuXCJdKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgLy8gSWYgbWF5YmVJbnZva2VEZWxlZ2F0ZShjb250ZXh0KSBjaGFuZ2VkIGNvbnRleHQubWV0aG9kIGZyb21cbiAgICAgICAgICAgIC8vIFwicmV0dXJuXCIgdG8gXCJ0aHJvd1wiLCBsZXQgdGhhdCBvdmVycmlkZSB0aGUgVHlwZUVycm9yIGJlbG93LlxuICAgICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIlRoZSBpdGVyYXRvciBkb2VzIG5vdCBwcm92aWRlIGEgJ3Rocm93JyBtZXRob2RcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7XG5cbiAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcblxuICAgIGlmICghIGluZm8pIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgIC8vIEFzc2lnbiB0aGUgcmVzdWx0IG9mIHRoZSBmaW5pc2hlZCBkZWxlZ2F0ZSB0byB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyB2YXJpYWJsZSBzcGVjaWZpZWQgYnkgZGVsZWdhdGUucmVzdWx0TmFtZSAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG5cbiAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gYXQgdGhlIGRlc2lyZWQgbG9jYXRpb24gKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG5cbiAgICAgIC8vIElmIGNvbnRleHQubWV0aG9kIHdhcyBcInRocm93XCIgYnV0IHRoZSBkZWxlZ2F0ZSBoYW5kbGVkIHRoZVxuICAgICAgLy8gZXhjZXB0aW9uLCBsZXQgdGhlIG91dGVyIGdlbmVyYXRvciBwcm9jZWVkIG5vcm1hbGx5LiBJZlxuICAgICAgLy8gY29udGV4dC5tZXRob2Qgd2FzIFwibmV4dFwiLCBmb3JnZXQgY29udGV4dC5hcmcgc2luY2UgaXQgaGFzIGJlZW5cbiAgICAgIC8vIFwiY29uc3VtZWRcIiBieSB0aGUgZGVsZWdhdGUgaXRlcmF0b3IuIElmIGNvbnRleHQubWV0aG9kIHdhc1xuICAgICAgLy8gXCJyZXR1cm5cIiwgYWxsb3cgdGhlIG9yaWdpbmFsIC5yZXR1cm4gY2FsbCB0byBjb250aW51ZSBpbiB0aGVcbiAgICAgIC8vIG91dGVyIGdlbmVyYXRvci5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCAhPT0gXCJyZXR1cm5cIikge1xuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZS15aWVsZCB0aGUgcmVzdWx0IHJldHVybmVkIGJ5IHRoZSBkZWxlZ2F0ZSBtZXRob2QuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICAvLyBUaGUgZGVsZWdhdGUgaXRlcmF0b3IgaXMgZmluaXNoZWQsIHNvIGZvcmdldCBpdCBhbmQgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdXRlciBnZW5lcmF0b3IuXG4gICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgZGVmaW5lKEdwLCB0b1N0cmluZ1RhZ1N5bWJvbCwgXCJHZW5lcmF0b3JcIik7XG5cbiAgLy8gQSBHZW5lcmF0b3Igc2hvdWxkIGFsd2F5cyByZXR1cm4gaXRzZWxmIGFzIHRoZSBpdGVyYXRvciBvYmplY3Qgd2hlbiB0aGVcbiAgLy8gQEBpdGVyYXRvciBmdW5jdGlvbiBpcyBjYWxsZWQgb24gaXQuIFNvbWUgYnJvd3NlcnMnIGltcGxlbWVudGF0aW9ucyBvZiB0aGVcbiAgLy8gaXRlcmF0b3IgcHJvdG90eXBlIGNoYWluIGluY29ycmVjdGx5IGltcGxlbWVudCB0aGlzLCBjYXVzaW5nIHRoZSBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0IHRvIG5vdCBiZSByZXR1cm5lZCBmcm9tIHRoaXMgY2FsbC4gVGhpcyBlbnN1cmVzIHRoYXQgZG9lc24ndCBoYXBwZW4uXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVnZW5lcmF0b3IvaXNzdWVzLzI3NCBmb3IgbW9yZSBkZXRhaWxzLlxuICBHcFtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KHRydWUpO1xuICB9XG5cbiAgZXhwb3J0cy5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIGV4cG9ydHMudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oc2tpcFRlbXBSZXNldCkge1xuICAgICAgdGhpcy5wcmV2ID0gMDtcbiAgICAgIHRoaXMubmV4dCA9IDA7XG4gICAgICAvLyBSZXNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgIHRoaXMuc2VudCA9IHRoaXMuX3NlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICBpZiAoIXNraXBUZW1wUmVzZXQpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzKSB7XG4gICAgICAgICAgLy8gTm90IHN1cmUgYWJvdXQgdGhlIG9wdGltYWwgb3JkZXIgb2YgdGhlc2UgY29uZGl0aW9uczpcbiAgICAgICAgICBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwidFwiICYmXG4gICAgICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIG5hbWUpICYmXG4gICAgICAgICAgICAgICFpc05hTigrbmFtZS5zbGljZSgxKSkpIHtcbiAgICAgICAgICAgIHRoaXNbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcblxuICAgICAgICBpZiAoY2F1Z2h0KSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gISEgY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8PSBmaW5hbGx5RW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpbmFsbHkgZW50cnkgaWYgY29udHJvbCBpcyBub3QganVtcGluZyB0byBhXG4gICAgICAgIC8vIGxvY2F0aW9uIG91dHNpZGUgdGhlIHRyeS9jYXRjaCBibG9jay5cbiAgICAgICAgZmluYWxseUVudHJ5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307XG4gICAgICByZWNvcmQudHlwZSA9IHR5cGU7XG4gICAgICByZWNvcmQuYXJnID0gYXJnO1xuXG4gICAgICBpZiAoZmluYWxseUVudHJ5KSB7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIHRoaXMubmV4dCA9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jO1xuICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICB9LFxuXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKHJlY29yZCwgYWZ0ZXJMb2MpIHtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgcmVjb3JkLnR5cGUgPT09IFwiY29udGludWVcIikge1xuICAgICAgICB0aGlzLm5leHQgPSByZWNvcmQuYXJnO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICB0aGlzLnJ2YWwgPSB0aGlzLmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZVxuICAvLyBvciBub3QsIHJldHVybiB0aGUgcnVudGltZSBvYmplY3Qgc28gdGhhdCB3ZSBjYW4gZGVjbGFyZSB0aGUgdmFyaWFibGVcbiAgLy8gcmVnZW5lcmF0b3JSdW50aW1lIGluIHRoZSBvdXRlciBzY29wZSwgd2hpY2ggYWxsb3dzIHRoaXMgbW9kdWxlIHRvIGJlXG4gIC8vIGluamVjdGVkIGVhc2lseSBieSBgYmluL3JlZ2VuZXJhdG9yIC0taW5jbHVkZS1ydW50aW1lIHNjcmlwdC5qc2AuXG4gIHJldHVybiBleHBvcnRzO1xuXG59KFxuICAvLyBJZiB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGUsIHVzZSBtb2R1bGUuZXhwb3J0c1xuICAvLyBhcyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIG5hbWVzcGFjZS4gT3RoZXJ3aXNlIGNyZWF0ZSBhIG5ldyBlbXB0eVxuICAvLyBvYmplY3QuIEVpdGhlciB3YXksIHRoZSByZXN1bHRpbmcgb2JqZWN0IHdpbGwgYmUgdXNlZCB0byBpbml0aWFsaXplXG4gIC8vIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgdmFyaWFibGUgYXQgdGhlIHRvcCBvZiB0aGlzIGZpbGUuXG4gIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgPyBtb2R1bGUuZXhwb3J0cyA6IHt9XG4pKTtcblxudHJ5IHtcbiAgcmVnZW5lcmF0b3JSdW50aW1lID0gcnVudGltZTtcbn0gY2F0Y2ggKGFjY2lkZW50YWxTdHJpY3RNb2RlKSB7XG4gIC8vIFRoaXMgbW9kdWxlIHNob3VsZCBub3QgYmUgcnVubmluZyBpbiBzdHJpY3QgbW9kZSwgc28gdGhlIGFib3ZlXG4gIC8vIGFzc2lnbm1lbnQgc2hvdWxkIGFsd2F5cyB3b3JrIHVubGVzcyBzb21ldGhpbmcgaXMgbWlzY29uZmlndXJlZC4gSnVzdFxuICAvLyBpbiBjYXNlIHJ1bnRpbWUuanMgYWNjaWRlbnRhbGx5IHJ1bnMgaW4gc3RyaWN0IG1vZGUsIHdlIGNhbiBlc2NhcGVcbiAgLy8gc3RyaWN0IG1vZGUgdXNpbmcgYSBnbG9iYWwgRnVuY3Rpb24gY2FsbC4gVGhpcyBjb3VsZCBjb25jZWl2YWJseSBmYWlsXG4gIC8vIGlmIGEgQ29udGVudCBTZWN1cml0eSBQb2xpY3kgZm9yYmlkcyB1c2luZyBGdW5jdGlvbiwgYnV0IGluIHRoYXQgY2FzZVxuICAvLyB0aGUgcHJvcGVyIHNvbHV0aW9uIGlzIHRvIGZpeCB0aGUgYWNjaWRlbnRhbCBzdHJpY3QgbW9kZSBwcm9ibGVtLiBJZlxuICAvLyB5b3UndmUgbWlzY29uZmlndXJlZCB5b3VyIGJ1bmRsZXIgdG8gZm9yY2Ugc3RyaWN0IG1vZGUgYW5kIGFwcGxpZWQgYVxuICAvLyBDU1AgdG8gZm9yYmlkIEZ1bmN0aW9uLCBhbmQgeW91J3JlIG5vdCB3aWxsaW5nIHRvIGZpeCBlaXRoZXIgb2YgdGhvc2VcbiAgLy8gcHJvYmxlbXMsIHBsZWFzZSBkZXRhaWwgeW91ciB1bmlxdWUgcHJlZGljYW1lbnQgaW4gYSBHaXRIdWIgaXNzdWUuXG4gIEZ1bmN0aW9uKFwiclwiLCBcInJlZ2VuZXJhdG9yUnVudGltZSA9IHJcIikocnVudGltZSk7XG59XG4iLCJcInVzZSBzdHJpY3RcIlxyXG5cclxuY2xhc3MgQWJzdHJhY3RWaWV3e1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICB0aGlzLkRPTSA9IHt9O1xyXG5cclxuICAgICAgICB0aGlzLkRPTS5nYW1lQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZ2FtZS1ib2FyZFwiKTtcclxuICAgICAgICB0aGlzLkRPTS5xdWVzdGlvblBhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RleHQtcXVlc3Rpb25cIik7XHJcbiAgICAgICAgdGhpcy5ET00ucXVlc3Rpb25UZXh0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZXh0LWNvbnRlbnRzXCIpO1xyXG4gICAgICAgIHRoaXMuRE9NLmJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2J1dHRvbnNcIik7XHJcblxyXG4gICAgICAgIHRoaXMuRE9NLmJ1enplcl9idXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2J1enpcIik7XHJcbiAgICAgICAgdGhpcy5ET00uYWNjZXB0X2J1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYWNjZXB0X2Fuc3dlclwiKTtcclxuICAgICAgICB0aGlzLkRPTS5yZWplY3RfYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNyZWplY3RfYW5zd2VyXCIpO1xyXG4gICAgICAgIHRoaXMuRE9NLnN0YXJ0X3RpbWVyX2J1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc3RhcnRfdGltZXJcIik7XHJcbiAgICAgICAgdGhpcy5ET00udGltZV9vdXRfYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aW1lX291dFwiKTtcclxuICAgICAgICB0aGlzLkRPTS5jb250aW51ZV9idXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NvbnRpbnVlXCIpO1xyXG4gICAgICAgIHRoaXMuRE9NLmJhY2tfYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNiYWNrXCIpO1xyXG5cclxuICAgICAgICB0aGlzLkRPTS5wbGF5aW5nX2luZGljYXRvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWluZ1wiKTtcclxuICAgICAgICB0aGlzLkRPTS5jbG9jayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2xvY2tcIik7XHJcblxyXG4gICAgICAgIHRoaXMuRE9NLm1lbnVJbmRpY2F0b3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtaW5kaWNhdG9yXCIpO1xyXG4gICAgICAgIHRoaXMuRE9NLm1lbnVBcmVhID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LWFyZWFcIik7XHJcbiAgICAgICAgdGhpcy5ET00ubWVudUxvZ291dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1sb2dvdXRcIik7XHJcblxyXG4gICAgICAgIHRoaXMuYXNzZXJ0RE9NKCk7XHJcbiAgICAgICAgLy8gdGhpcy5zZXR1cE1lbnUoKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3NlcnRET00oKXtcclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gdGhpcy5ET00pe1xyXG4gICAgICAgICAgICBjb25zb2xlLmFzc2VydCh0aGlzLkRPTVtrZXldICE9PSB1bmRlZmluZWQsIGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZU1vZGVsKHVwZGF0ZSl7XHJcbiAgICAgICAgc3dpdGNoICh1cGRhdGUuc3RhdGUpe1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5ET00uZ2FtZUJvYXJkLnNob3coKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlsbEplb3BhcmR5Q2F0ZWdvcmllcyh1cGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maWxsSmVvcGFyZHlDZWxscyh1cGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgIHRoaXMuRE9NLmdhbWVCb2FyZC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGxKZW9wYXJkeUNhdGVnb3JpZXModXBkYXRlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlsbEplb3BhcmR5Q2VsbHModXBkYXRlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICB0aGlzLkRPTS5nYW1lQm9hcmQuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maWxsSmVvcGFyZHlDYXRlZ29yaWVzKHVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGxKZW9wYXJkeUNlbGxzKHVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA3OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5ET00uZ2FtZUJvYXJkLnNob3coKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlsbEplb3BhcmR5Q2F0ZWdvcmllcyh1cGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maWxsSmVvcGFyZHlDZWxscyh1cGRhdGUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgODpcclxuICAgICAgICAgICAgICAgIHRoaXMuRE9NLmdhbWVCb2FyZC5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGxKZW9wYXJkeUNhdGVnb3JpZXModXBkYXRlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlsbEplb3BhcmR5Q2VsbHModXBkYXRlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDk6XHJcbiAgICAgICAgICAgICAgICB0aGlzLkRPTS5nYW1lQm9hcmQuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maWxsSmVvcGFyZHlDYXRlZ29yaWVzKHVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbGxKZW9wYXJkeUNlbGxzKHVwZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmaWxsSmVvcGFyZHlDYXRlZ29yaWVzKHVwZGF0ZSl7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspe1xyXG4gICAgICAgICAgICBsZXQgY2F0ZWdvcnkgPSB1cGRhdGUubW9kZWwucm91bmQuY2F0ZWdvcmllc1tpXTtcclxuICAgICAgICAgICAgdGhpcy5ET00uZ2FtZUJvYXJkLnNldEhlYWRlcihpLCBjYXRlZ29yeVtcInRleHRcIl0sIGNhdGVnb3J5W1wiZm9udC1zaXplXCJdLCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmaWxsSmVvcGFyZHlDZWxscyh1cGRhdGUpe1xyXG4gICAgICAgIGxldCByb3VuZCA9IHVwZGF0ZS5tb2RlbC5yb3VuZDtcclxuICAgICAgICBmb3IgKGxldCBjID0gMDsgYyA8IDY7IGMrKyl7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgNTsgcisrKXtcclxuICAgICAgICAgICAgICAgIGlmIChyb3VuZC5zcGVudFtjXVtyXSkgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkRPTS5nYW1lQm9hcmQuc2V0Q2VsbChyLCBjLCByb3VuZC52YWx1ZXNbY11bcl0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBYnN0cmFjdFZpZXc7IiwiXHJcbmNsYXNzIEhvc3RDb250cm9sbGVye1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHdzLCB2aWV3KSB7XHJcbiAgICAgICAgdGhpcy53cyA9IHdzO1xyXG4gICAgICAgIHRoaXMudmlldyA9IHZpZXc7XHJcblxyXG4gICAgICAgIHRoaXMud3MuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIChldmVudCkgPT4gdGhpcy5wcm9jZXNzKEpTT04ucGFyc2UoZXZlbnQuZGF0YSkpKTtcclxuICAgICAgICB0aGlzLndzLmFkZEV2ZW50TGlzdGVuZXIoJ2Nsb3NlJywgKGV2ZW50KSA9PiB0aGlzLm9uQ2xvc2UoZXZlbnQpKTtcclxuXHJcbiAgICAgICAgd2luZG93LnN0YXJ0ID0gZnVuY3Rpb24oKXtcclxuICAgICAgICAgICAgdGhpcy5zZW5kKHthY3Rpb24gOiBcInN0YXJ0XCJ9KTtcclxuICAgICAgICB9LmJpbmQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgb25VcGRhdGUoKXtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHJvY2VzcyhtZXNzYWdlKXtcclxuICAgICAgICBpZiAobWVzc2FnZS5hY3Rpb24gIT09IFwicGluZ1wiKSBjb25zb2xlLmxvZyhtZXNzYWdlKTtcclxuICAgICAgICBzd2l0Y2ggKG1lc3NhZ2UuYWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJjb25uZWN0aW9uX2VzdGFibGlzaGVkXCI6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmQoe2FjdGlvbiA6IFwicmVxdWVzdF9tb2RlbFwifSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBcInVwZGF0ZV9tb2RlbFwiOlxyXG4gICAgICAgICAgICAgICAgdGhpcy52aWV3LnVwZGF0ZU1vZGVsKG1lc3NhZ2UuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25DbG9zZShldmVudCl7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHNlbmQobXNnKXtcclxuICAgICAgICBjb25zb2xlLmxvZyhgc2VuZDogJHtKU09OLnN0cmluZ2lmeShtc2cpfWApO1xyXG4gICAgICAgIHRoaXMud3Muc2VuZChKU09OLnN0cmluZ2lmeShtc2cpKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgSG9zdENvbnRyb2xsZXI7IiwiaW1wb3J0IEFic3RyYWN0VmlldyBmcm9tIFwiLi9BYnN0cmFjdFZpZXcuanNcIlxyXG5cclxuY2xhc3MgSG9zdFZpZXcgZXh0ZW5kcyBBYnN0cmFjdFZpZXd7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgICAgICB0aGlzLkRPTS5jb250aW51ZUJ1dHRvbiA9ICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZ2FtZS1ib2FyZFwiKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgdXBkYXRlTW9kZWwodXBkYXRlKSB7XHJcbiAgICAgICAgc3VwZXIudXBkYXRlTW9kZWwodXBkYXRlKTtcclxuICAgICAgICBzd2l0Y2ggKHVwZGF0ZS5zdGF0ZSkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSA3OlxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgODpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDk6XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgSG9zdFZpZXc7IiwiaW1wb3J0IEZpbGVPcHMgZnJvbSBcIi4vbW9kdWxlcy9GaWxlT3BzLmpzXCI7XHJcbmltcG9ydCBBdXRoZW50aWNhdGUgZnJvbSBcIi4vbW9kdWxlcy9BdXRoZW50aWNhdGUuanNcIjtcclxuaW1wb3J0IEhvc3RWaWV3IGZyb20gXCIuL0hvc3RWaWV3LmpzXCI7XHJcbmltcG9ydCBIb3N0Q29udHJvbGxlciBmcm9tIFwiLi9Ib3N0Q29udHJvbGxlclwiO1xyXG5cclxuaW1wb3J0IFwiLi9tb2R1bGVzL0dhbWVCb2FyZC5qc1wiO1xyXG5pbXBvcnQgXCIuL21vZHVsZXMvTXVsdGlwbGVDaG9pY2VQYW5lLmpzXCI7XHJcbmltcG9ydCBcIi4vbW9kdWxlcy9DaGVja0JveC5qc1wiO1xyXG5pbXBvcnQgXCIuL21vZHVsZXMvUGxheWVyQ29udGFpbmVyLmpzXCI7XHJcbmltcG9ydCBcIi4vbW9kdWxlcy9QbGF5ZXJQYW5lbC5qc1wiO1xyXG5cclxubGV0IGZpbGVPcHMgPSBuZXcgRmlsZU9wcygpO1xyXG5sZXQgbW9kZWwgPSBudWxsO1xyXG5sZXQgcXVlc3Rpb25QYW5lID0gbnVsbDtcclxubGV0IGVkaXRvclBhbmUgPSBudWxsO1xyXG5cclxud2luZG93Lm9ubG9hZCA9IGFzeW5jICgpID0+IHtcclxuICAgIGxldCBzdGFydCA9IG5ldyBEYXRlKCk7XHJcblxyXG4gICAgd2luZG93Lmhvc3RWaWV3ID0gbmV3IEhvc3RWaWV3KCk7XHJcblxyXG4gICAgLy8gbmV3IE1lbnUoKS5pbml0KFwiI21lbnVcIik7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBuZXcgQXV0aGVudGljYXRlKCkubG9hZENsaWVudCgpO1xyXG4gICAgICAgIGF3YWl0IGZpbGVPcHMubG9hZENsaWVudCgpO1xyXG4gICAgICAgIGF3YWl0IHNlbmRUb2tlblRvU2VydmVyKCk7XHJcbiAgICAgICAgbGV0IHdzID0gYXdhaXQgY29ubmVjdFdlYnNvY2tldCgpO1xyXG4gICAgICAgIG5ldyBIb3N0Q29udHJvbGxlcih3cywgd2luZG93Lmhvc3RWaWV3KTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGVuZCA9IG5ldyBEYXRlKCk7XHJcbiAgICBsZXQgdGltZSA9IGVuZCAtIHN0YXJ0O1xyXG4gICAgY29uc29sZS5sb2coXCJMb2FkIFRpbWUgXCIgKyB0aW1lICsgXCIgbXNcIik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNlbmRUb2tlblRvU2VydmVyKCl7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgbGV0IHRva2VuID0gZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKS5jdXJyZW50VXNlci5nZXQoKS5nZXRBdXRoUmVzcG9uc2UoKS5pZF90b2tlbjtcclxuICAgICAgICB2YXIgeGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuXHJcbiAgICAgICAgeGh0dHAuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCByZXNwb25zZSA9IEpTT04ucGFyc2UoeGh0dHAucmVzcG9uc2VUZXh0KTtcclxuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnJlc3VsdCA9PT0gXCJzdWNjZXNzXCIpIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgZWxzZSByZWplY3QobmV3IEVycm9yKFwidG9rZW4gcmVqZWN0ZWRcIikpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB4aHR0cC5vcGVuKFwiUE9TVFwiLCBcImNvbm5lY3QtaG9zdFwiKTtcclxuICAgICAgICB4aHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcclxuICAgICAgICB4aHR0cC5zZW5kKEpTT04uc3RyaW5naWZ5KHt0b2tlbjogdG9rZW59KSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gY29ubmVjdFdlYnNvY2tldCgpe1xyXG4gICAgbGV0IHVybCA9IHdpbmRvdy5vcmlnaW47XHJcbiAgICBpZiAodXJsLnN0YXJ0c1dpdGgoXCJodHRwOlwiKSl7XHJcbiAgICAgICAgdXJsID0gXCJ3c1wiICsgdXJsLnN1YnN0cig0KSArIFwiL2dhbWUtc2VydmljZS53c1wiO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB1cmwgPSBcIndzc1wiICsgdXJsLnN1YnN0cig1KSArIFwiL2dhbWUtc2VydmljZS53c1wiO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xyXG4gICAgICAgIGxldCBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KHVybCk7XHJcbiAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKGV2ZW50KSA9PiByZWplY3QoZXZlbnQpKTtcclxuICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIChldmVudCkgPT4gcmVzb2x2ZShzb2NrZXQpKTtcclxuICAgIH0pO1xyXG59IiwiLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL2RyaXZlL2FwaS92My9xdWlja3N0YXJ0L2pzP2hsPWVuXHJcblxyXG5jbGFzcyBBdXRoZW50aWNhdGUge1xyXG4gICAgY29uc3RydWN0b3IoKXtcclxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHJlcXVpcmUoXCIuL2dvb2dsZUZpZWxkcy5qc1wiKSk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZENsaWVudCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmxvYWQoJ2NsaWVudDphdXRoMicsICgpID0+IHRoaXMuX19pbml0Q2xpZW50KHJlc29sdmUsIHJlamVjdCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIF9faW5pdENsaWVudChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBnYXBpLmNsaWVudC5pbml0KHtcclxuICAgICAgICAgICAgYXBpS2V5OiB0aGlzLmRldmVsb3BlcktleSxcclxuICAgICAgICAgICAgY2xpZW50SWQ6IHRoaXMuY2xpZW50SWQsXHJcbiAgICAgICAgICAgIGRpc2NvdmVyeURvY3M6IHRoaXMuZGlzY292ZXJ5RG9jcyxcclxuICAgICAgICAgICAgc2NvcGU6IHRoaXMuc2NvcGVcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRVJST1IgSU5JVFwiKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlzQXV0aG9yaXplZCgpe1xyXG4gICAgICAgIHZhciB1c2VyID0gZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKS5jdXJyZW50VXNlci5nZXQoKTtcclxuICAgICAgICByZXR1cm4gdXNlci5oYXNHcmFudGVkU2NvcGVzKHRoaXMuc2NvcGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNpZ25Jbigpe1xyXG4gICAgICAgIGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuc2lnbkluKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2lnbk91dCgpe1xyXG4gICAgICAgIGdhcGkuYXV0aDIuZ2V0QXV0aEluc3RhbmNlKCkuc2lnbk91dCgpO1xyXG4gICAgfVxyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBdXRoZW50aWNhdGU7IiwiY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCJAVGhhZXJpb3VzL25pZGdldFwiKS5OaWRnZXRFbGVtZW50O1xyXG5cclxuY2xhc3MgVmFsdWVVcGFkYXRlIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IodmFsdWUpIHtcclxuICAgICAgICBzdXBlcigndmFsdWUtdXBkYXRlJyxcclxuICAgICAgICAgICAge2RldGFpbCA6IHt2YWx1ZSA6IHZhbHVlfX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBDaGVja0JveCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgYXN5bmMgY29ubmVjdGVkQ2FsbGJhY2soKXtcclxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdG9nZ2xlKCl7XHJcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tlZCA9PT0gJ3RydWUnKSB0aGlzLmNoZWNrZWQgPSAnZmFsc2UnO1xyXG4gICAgICAgIGVsc2UgdGhpcy5jaGVja2VkID0gJ3RydWUnXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGNoZWNrZWQoKXtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFKSl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFLCAnZmFsc2UnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgY2hlY2tlZCh2YWx1ZSl7XHJcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoQ2hlY2tCb3guQ0hFQ0tFRF9BVFRSSUJVVEUsIHZhbHVlKTtcclxuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFZhbHVlVXBhZGF0ZSh2YWx1ZSkpO1xyXG4gICAgfVxyXG59XHJcblxyXG5DaGVja0JveC5DSEVDS0VEX0FUVFJJQlVURSA9IFwiY2hlY2tlZFwiO1xyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdjaGVjay1ib3gnLCBDaGVja0JveCk7XHJcbm1vZHVsZS5leHBvcnRzID0gQ2hlY2tCb3g7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vIHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9kcml2ZS9hcGkvdjMvcXVpY2tzdGFydC9qcz9obD1lblxyXG5cclxuY2xhc3MgRmlsZU9wcyB7XHJcblxyXG4gICAgYXN5bmMgbG9hZCgpe1xyXG4gICAgICAgIGF3YWl0IHRoaXMubG9hZENsaWVudCgpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMubG9hZERyaXZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZENsaWVudCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmxvYWQoJ2NsaWVudCcsICgpID0+IHJlc29sdmUoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZERyaXZlKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmxvYWQoJ2RyaXZlJywgJ3YzJywgcmVzb2x2ZSgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBjcmVhdGUoZmlsZW5hbWUgPSBcIkdhbWUgTmFtZS5qc29uXCIpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgIG5hbWUgOiBmaWxlbmFtZSxcclxuICAgICAgICAgICAgICAgIHBhcmVudHM6IFsnYXBwRGF0YUZvbGRlciddLFxyXG4gICAgICAgICAgICAgICAgZmllbGRzOiBcImlkXCJcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLnJlc3VsdC5pZCk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZGVsZXRlKGZpbGVJZCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5kZWxldGUoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkIDogZmlsZUlkXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy5yZXN1bHQpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGxpc3QoKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmxpc3Qoe1xyXG4gICAgICAgICAgICAgICAgLy8gcTogYG5hbWUgY29udGFpbnMgJy5qc29uJ2AsXHJcbiAgICAgICAgICAgICAgICBzcGFjZXM6ICdhcHBEYXRhRm9sZGVyJyxcclxuICAgICAgICAgICAgICAgIGZpZWxkczogJ2ZpbGVzL25hbWUsZmlsZXMvaWQsZmlsZXMvbW9kaWZpZWRUaW1lJ1xyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0LmZpbGVzKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXQoZmlsZUlkKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmdldCh7XHJcbiAgICAgICAgICAgICAgICBmaWxlSWQ6IGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIGFsdDogJ21lZGlhJ1xyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgc2V0Qm9keShmaWxlSWQsIGJvZHkpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQucmVxdWVzdCh7XHJcbiAgICAgICAgICAgICAgICBwYXRoIDogXCJ1cGxvYWQvZHJpdmUvdjMvZmlsZXMvXCIgKyBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICBtZXRob2QgOiBcIlBBVENIXCIsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXMgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkVHlwZSA6IFwibWVkaWFcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnMgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIiA6IFwiYXBwbGljYXRpb24vanNvblwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYm9keSA6IGJvZHlcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXMuYm9keSkpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVuYW1lKGZpbGVJZCwgZmlsZW5hbWUpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZDogZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogZmlsZW5hbWVcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXMuYm9keSkpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZpbGVPcHM7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKiogVmlldy1Db250cm9sbGVyIGZvciB0aGUgSFRNTCBnYW1lIGJvYXJkIGVsZW1lbnRcclxuICAgIFRoaXMgaXMgdGhlIGNsYXNzaWNhbCBcIkplb3BhcmR5XCIgdHlwZSBib2FyZFxyXG4gICAgVGhpcyBpcyBtb2RlbCBhZ25vc3RpYywgc2VlIEVkaXRvclBhbmUuanMgZm9yIG1vZGVsIG1ldGhvZHNcclxuICAgIGdlbmVyYXRlcyB0aGUgZm9sbG93aW5nIGV2ZW50czpcclxuICAgICAgICBjZWxsLXNlbGVjdCAocm93LCBjb2wpOiB3aGVuIGEgdXNlciBjbGlja3MgYSBjZWxsXHJcbiAgICAgICAgaGVhZGVyLXVwZGF0ZSAodmFsdWUsIGNvbCwgZm9udHNpemUpIDogd2hlbiB0aGUgaGVhZGVyIHRleHQgY2hhbmdlcyAoYW5kIGJsdXJzKVxyXG4gKiovXHJcblxyXG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcblxyXG5jbGFzcyBDZWxsU2VsZWN0RXZlbnQgZXh0ZW5kcyBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKHJvdywgY29sKSB7XHJcbiAgICAgICAgc3VwZXIoJ2NlbGwtc2VsZWN0JyxcclxuICAgICAgICAgICAgICB7ZGV0YWlsIDoge3JvdyA6IHJvdywgY29sIDogY29sIH19XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgSGVhZGVyVXBkYXRlRXZlbnQgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3Rvcihjb2wsIHZhbHVlLCBmb250U2l6ZSkge1xyXG4gICAgICAgIHN1cGVyKCdoZWFkZXItdXBkYXRlJyxcclxuICAgICAgICAgICAge2RldGFpbCA6IHt2YWx1ZSA6IHZhbHVlLCBjb2wgOiBjb2wsIGZvbnRTaXplIDogZm9udFNpemV9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEdhbWVCb2FyZCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZWFkeSgpe1xyXG4gICAgICAgIGF3YWl0IHN1cGVyLnJlYWR5KCk7XHJcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgNjsgY29sKyspIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRIZWFkZXIoY29sKS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KT0+ZXZlbnQudGFyZ2V0LmZpdFRleHQubm90aWZ5KDEsIDEpKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0SGVhZGVyKGNvbCkuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgKGV2ZW50KT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplID0gZXZlbnQudGFyZ2V0LnN0eWxlW1wiZm9udC1zaXplXCJdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBIZWFkZXJVcGRhdGVFdmVudChjb2wsIGV2ZW50LnRhcmdldC50ZXh0LCBmb250U2l6ZSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHJvdyA9IDA7IHJvdyA8IDU7IHJvdysrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldENlbGwocm93LCBjb2wpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDZWxsU2VsZWN0RXZlbnQocm93LCBjb2wpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSB2YWx1ZSBvZiBhIGNhdGVnb3J5XHJcbiAgICAgKiBAcGFyYW0gaW5kZXhcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIHNldEhlYWRlcihpbmRleCwgdmFsdWUsIGZvbnRTaXplLCBsb2NrID0gZmFsc2Upe1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy5nZXRIZWFkZXIoaW5kZXgpO1xyXG4gICAgICAgIGVsZW1lbnQudGV4dCA9IHZhbHVlO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGZvbnRTaXplKTtcclxuICAgICAgICBpZiAoZm9udFNpemUpIGVsZW1lbnQuc3R5bGVbXCJmb250LXNpemVcIl0gPSBmb250U2l6ZTtcclxuICAgICAgICBpZiAobG9jayl7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiY29udGVudEVkaXRhYmxlXCIsIFwiZmFsc2VcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmUgdGhlIGhlYWRlciBodG1sIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSBpbmRleFxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIGdldEhlYWRlcihpbmRleCl7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpbmRleCAhPT0gXCJudW1iZXJcIiB8fCBpbmRleCA8IDAgfHwgaW5kZXggPiA2KSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGluZGV4OiBcIiArIGluZGV4KTtcclxuICAgICAgICBsZXQgc2VsZWN0b3IgPSBgW2RhdGEtcm93PSdoJ11bZGF0YS1jb2w9JyR7aW5kZXh9J10gPiAudmFsdWVgO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSB2YWx1ZSBvZiBhIG5vbi1jYXRlZ29yeSBjZWxsLlxyXG4gICAgICogQHBhcmFtIHJvd1xyXG4gICAgICogQHBhcmFtIGNvbFxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIHNldENlbGwocm93LCBjb2wsIHZhbHVlID0gXCJcIil7XHJcbiAgICAgICAgdGhpcy5nZXRDZWxsKHJvdywgY29sKS50ZXh0Q29udGVudCA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENlbGwocm93LCBjb2wpe1xyXG4gICAgICAgIGxldCBzZWxlY3RvciA9IGBbZGF0YS1yb3c9XCIke3Jvd31cIl1bZGF0YS1jb2w9XCIke2NvbH1cIl0gPiAudmFsdWVgO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldENvbXBsZXRlKHJvdywgY29sLCB2YWx1ZSl7XHJcbiAgICAgICAgaWYgKHR5cGVvZiByb3cgIT09IFwibnVtYmVyXCIgfHwgcm93IDwgMCB8fCByb3cgPiA2KSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHJvdzogXCIgKyByb3cpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29sICE9PSBcIm51bWJlclwiIHx8IGNvbCA8IDAgfHwgY29sID4gNSkgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBjb2w6IFwiICsgY29sKTtcclxuICAgICAgICB0aGlzLmdldENlbGwocm93LCBjb2wpLnNldEF0dHJpYnV0ZShcImRhdGEtY29tcGxldGVcIiwgdmFsdWUpO1xyXG4gICAgfVxyXG59XHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdnYW1lLWJvYXJkJywgR2FtZUJvYXJkKTtcclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lQm9hcmQ7IiwiY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCJAVGhhZXJpb3VzL25pZGdldFwiKS5OaWRnZXRFbGVtZW50O1xyXG5yZXF1aXJlKFwiLi9DaGVja0JveC5qc1wiKTtcclxuXHJcbmNsYXNzIFRleHRVcGRhdGUgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcihpbmRleCwgdGV4dCkge1xyXG4gICAgICAgIHN1cGVyKCd0ZXh0LXVwZGF0ZScsXHJcbiAgICAgICAgICAgIHtkZXRhaWwgOiB7aW5kZXggOiBpbmRleCwgdGV4dCA6IHRleHR9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFZhbHVlVXBkYXRlIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoaW5kZXgsIHZhbHVlKSB7XHJcbiAgICAgICAgc3VwZXIoJ3ZhbHVlLXVwZGF0ZScsXHJcbiAgICAgICAgICAgIHtkZXRhaWwgOiB7aW5kZXggOiBpbmRleCwgdmFsdWUgOiB2YWx1ZX19XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUXVlc3Rpb25DbGljayBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCdidXR0b24tcXVlc3Rpb24nKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTXVsdGlwbGVDaG9pY2VQYW5lIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XHJcblxyXG4gICAgc2V0TW9kZWwobW9kZWwpe1xyXG4gICAgICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZWFkeSgpe1xyXG4gICAgICAgIGF3YWl0IHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYW5zd2VyID4gbmlkZ2V0LXRleHRcIikpe1xyXG4gICAgICAgICAgICBlbGVtZW50LmZpdFRleHQubG9jayA9IFwidmhcIjtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgKGV2ZW50KT0+dGhpcy50eHRMaXN0ZW5lcihldmVudCkpO1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIChldmVudCk9PntcclxuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWluZGV4XCIpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoYG5pZGdldC10ZXh0W2RhdGEtaW5kZXg9XCIke2luZGV4fVwiXWApLnRleHQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFRleHRVcGRhdGUoaW5kZXgsIHRleHQpKVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKFwiY2hlY2stYm94XCIpKXtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwidmFsdWUtdXBkYXRlXCIsIChldmVudCk9PntcclxuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGV2ZW50LnRhcmdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0taW5kZXhcIik7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBldmVudC5kZXRhaWwudmFsdWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFZhbHVlVXBkYXRlKGluZGV4LCB2YWx1ZSkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LXF1ZXN0aW9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFF1ZXN0aW9uQ2xpY2soKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdHh0TGlzdGVuZXIoZXZlbnQpIHtcclxuICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDEzKXtcclxuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShldmVudC50YXJnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLWluZGV4XCIpO1xyXG4gICAgICAgICAgICBpbmRleCA9IHBhcnNlSW50KGluZGV4KTtcclxuICAgICAgICAgICAgaWYgKGluZGV4ID49IDUpe1xyXG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmJsdXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RvciA9IGBuaWRnZXQtdGV4dFtkYXRhLWluZGV4PVwiJHtpbmRleCArIDF9XCJdYDtcclxuICAgICAgICAgICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3RvcikuZm9jdXMoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBldmVudC50YXJnZXQuZml0VGV4dC5ub3RpZnkoMSwgMSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAcGFyYW0gYnV0dG9uIHsncXVlc3Rpb24nLCAnYW5zd2VyJ31cclxuICAgICAqL1xyXG4gICAgaGlnaGxpZ2h0KGJ1dHRvbil7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlIG9mIHRoaXMucXVlcnlTZWxlY3RvckFsbChgLnNlbGVjdGVkYCkpIGVsZS5jbGFzc0xpc3QucmVtb3ZlKFwic2VsZWN0ZWRcIik7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKGAjc2hvdy0ke2J1dHRvbn1gKS5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGV4dChpbmRleCwgdGV4dCl7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKGBuaWRnZXQtdGV4dFtkYXRhLWluZGV4PVwiJHtpbmRleH1cIl1gKS50ZXh0ID0gdGV4dDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRDaGVja2VkKGluZGV4LCB2YWx1ZSl7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKGBjaGVjay1ib3hbZGF0YS1pbmRleD1cIiR7aW5kZXh9XCJdYCkuY2hlY2tlZCA9IHZhbHVlO1xyXG4gICAgfVxyXG59XHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdtdWx0aXBsZS1jaG9pY2UtcGFuZScsIE11bHRpcGxlQ2hvaWNlUGFuZSk7XHJcbm1vZHVsZS5leHBvcnRzID0gTXVsdGlwbGVDaG9pY2VQYW5lOyIsIlwidXNlIHN0cmljdFwiO1xyXG5cclxuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCJAVGhhZXJpb3VzL25pZGdldFwiKS5OaWRnZXRFbGVtZW50O1xyXG5pbXBvcnQgUGxheWVyUGFuZWwgZnJvbSBcIi4vUGxheWVyUGFuZWwuanNcIjtcclxuXHJcbmNsYXNzIFBsYXllckNvbnRhaW5lciBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZWFkeSgpe1xyXG4gICAgICAgIGF3YWl0IHN1cGVyLnJlYWR5KCk7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkUGxheWVyKG5hbWUsIHNjb3JlID0gMCl7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicGxheWVyLXBhbmVsXCIpO1xyXG4gICAgICAgIGVsZW1lbnQubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgZWxlbWVudC5zY29yZSA9IHNjb3JlO1xyXG4gICAgICAgIHRoaXMuYXBwZW5kKGVsZW1lbnQpO1xyXG4gICAgfVxyXG59XHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdwbGF5ZXItY29udGFpbmVyJywgUGxheWVyQ29udGFpbmVyKTtcclxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXJDb250YWluZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcbmltcG9ydCBcIi4vUGxheWVyUGFuZWwuanNcIjtcclxuXHJcbmNsYXNzIFBsYXllclBhbmVsIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIHJlYWR5KCl7XHJcbiAgICAgICAgYXdhaXQgc3VwZXIucmVhZHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgbmFtZSh2YWx1ZSl7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI25hbWVcIikudGV4dCA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBzY29yZSh2YWx1ZSl7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3Njb3JlXCIpLnRleHQgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbmFtZSgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjbmFtZVwiKS50ZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBzY29yZSgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2NvcmVcIikudGV4dDtcclxuICAgIH1cclxuXHJcbiAgICBidXp6KCl7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI2J1enotbGlnaHRcIikuY2xhc3NMaXN0LmFkZChcInN3ZWVwLXJpZ2h0XCIpO1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNuYW1lXCIpLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3Njb3JlXCIpLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIoKXtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjYnV6ei1saWdodFwiKS5jbGFzc0xpc3QucmVtb3ZlKFwic3dlZXAtcmlnaHRcIik7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI25hbWVcIikuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2NvcmVcIikuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2xvY2stdGlja1wiKS5mb3JFYWNoKGUgPT4gZS5jbGFzc0xpc3QucmVtb3ZlKFwic3BlbnRcIikpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRpbWVyKHBlcmNlbnQpe1xyXG4gICAgICAgIGlmIChwZXJjZW50IDw9IDgwKSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvY2stdGlja1tkYXRhLWluZGV4PSc0J11cIikuY2xhc3NMaXN0LmFkZChcInNwZW50XCIpO1xyXG4gICAgICAgIGlmIChwZXJjZW50IDw9IDYwKSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvY2stdGlja1tkYXRhLWluZGV4PSczJ11cIikuY2xhc3NMaXN0LmFkZChcInNwZW50XCIpO1xyXG4gICAgICAgIGlmIChwZXJjZW50IDw9IDQwKSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvY2stdGlja1tkYXRhLWluZGV4PScyJ11cIikuY2xhc3NMaXN0LmFkZChcInNwZW50XCIpO1xyXG4gICAgICAgIGlmIChwZXJjZW50IDw9IDIwKSB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvY2stdGlja1tkYXRhLWluZGV4PScxJ11cIikuY2xhc3NMaXN0LmFkZChcInNwZW50XCIpO1xyXG4gICAgICAgIGlmIChwZXJjZW50IDw9IDApICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvY2stdGlja1tkYXRhLWluZGV4PScwJ11cIikuY2xhc3NMaXN0LmFkZChcInNwZW50XCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdwbGF5ZXItcGFuZWwnLCBQbGF5ZXJQYW5lbCk7XHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyUGFuZWw7IiwiXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgLy8gVGhlIEJyb3dzZXIgQVBJIGtleSBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuXHJcbiAgICBkZXZlbG9wZXJLZXkgOiAnQUl6YVN5QUJjZExtVDZISF83R284MnFfSUJHSTNqbTZVTDR3NFEwJyxcclxuXHJcbiAgICAvLyBUaGUgQ2xpZW50IElEIG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS4gUmVwbGFjZSB3aXRoIHlvdXIgb3duIENsaWVudCBJRC5cclxuICAgIGNsaWVudElkIDogXCIxNTg4MjMxMzQ2ODEtOThiZ2thbmdvbHRrNjM2dWtmOHBvZmVpczdwYTdqYmsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb21cIixcclxuXHJcbiAgICAvLyBSZXBsYWNlIHdpdGggeW91ciBvd24gcHJvamVjdCBudW1iZXIgZnJvbSBjb25zb2xlLmRldmVsb3BlcnMuZ29vZ2xlLmNvbS5cclxuICAgIGFwcElkIDogXCIxNTg4MjMxMzQ2ODFcIixcclxuXHJcbiAgICAvLyBBcnJheSBvZiBBUEkgZGlzY292ZXJ5IGRvYyBVUkxzIGZvciBBUElzIHVzZWQgYnkgdGhlIHF1aWNrc3RhcnRcclxuICAgIGRpc2NvdmVyeURvY3MgOiBbXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9kaXNjb3ZlcnkvdjEvYXBpcy9kcml2ZS92My9yZXN0XCJdLFxyXG5cclxuICAgIC8vIFNjb3BlIHRvIHVzZSB0byBhY2Nlc3MgdXNlcidzIERyaXZlIGl0ZW1zLlxyXG4gICAgc2NvcGU6IFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9kcml2ZS5maWxlXCJcclxufSJdfQ==
