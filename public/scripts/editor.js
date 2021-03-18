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

        requestAnimationFrame(()=> {
            let ar = getComputedStyle(this).getPropertyValue(AspectRatio.CSS_ATTRIBUTE);
            if (ar !== "") new AspectRatio(this);
        });
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

    /**
     * Load contents of file as a templete and apply that template to this element.
     * Replace all ${} variables with contents of 'map'.
     * The template will be given the id derived from the src attribute.
     */
    async retrieveTemplate(){
        let src = this.getAttribute(Nidget.templateSrcAttribute);
        let id = src.replace(/[\// .-]+/g, "_");
        let template = document.querySelector(`#${id}`);
        if (template) this.injectTemplate(template);
    }

    async injectTemplate(template){
        if (this.shadowRoot !== null) return;
        this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
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
            ele.injectTemplate(template);
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
    Nidget.NidgetElement.loadTemplateSnippet("snippets/check-box.html", "check-box");
    Nidget.NidgetElement.loadTemplateSnippet("snippets/game-board.html", "game-board");
    Nidget.NidgetElement.loadTemplateSnippet("snippets/multiple-choice-pane.html", "multiple-choice-pane");
    Nidget.NidgetElement.loadTemplateSnippet("snippets/question-pane.html", "question-pane");

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

    // document.querySelector("game-board").addEventListener("cell-select", (event)=>{
    //     let row = event.detail.row;
    //     let col = event.detail.col;
    //     questionPane.showQuestion(window.model.getCell(row, col));
    //     editorPane.hideAll();
    // });
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

        this.gameBoard.addEventListener("header-update", event =>{
            let col = event.detail.col;
            this.model.getColumn(col).category = event.detail.value;
            this.model.getColumn(col).fontSize = event.detail.fontSize;
            this.onSave();
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

    hideAll(){
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

class QuestionPane extends NidgetElement{

    async ready(){
        await super.ready();

        this.querySelector("#show-board").addEventListener("click", ()=>{
            this.showBoard();
        });

        this.querySelector("#show-question").addEventListener("click", ()=>{
            this.showQuestion();
        });

        this.querySelector("#show-answer").addEventListener("click", ()=>{
            this.showAnswer();
        });

        this.addEventListener("click", ()=>this.textContents.focus());

        this.querySelector("#text-contents").addEventListener("blur", async ()=>{
            this.cell[this.status] = this.textContents.text.trim();
            await this.onUpdate();
        });
    }

    onUpdate(){}
    showBoard(){}
    showQuestion(){}
    showAnswer(){}

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0Fic3RyYWN0TW9kZWwuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0RyYWdIYW5kbGVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9GaWxlT3BlcmF0aW9ucy5qcyIsIi4uLy4uL25pZGdldC9zcmMvSW50ZXJmYWNlcy5qcyIsIi4uLy4uL25pZGdldC9zcmMvTW91c2VVdGlsaXRpZXMuanMiLCIuLi8uLi9uaWRnZXQvc3JjL05pZGdldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0RWxlbWVudC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0U3R5bGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL1RyYW5zZm9ybWVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b24uanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblNldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU3RhdGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldENvbnRhaW5lci5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SFRNTEltYWdlLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRJbWFnZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0VGV4dC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJhZy5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJvcC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvTW91c2UuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL01vdmFibGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL1Jlc2l6ZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvcHJvamVjdEZpbGUuanMiLCJzcmMvY2xpZW50L2VkaXRvci5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9BdXRoZW50aWNhdGUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvQ2hlY2tCb3guanMiLCJzcmMvY2xpZW50L21vZHVsZXMvRWRpdG9yUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9GaWxlT3BzLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0dhbWVCb2FyZC5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9NZW51LmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL01vZGVsLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL011bHRpcGxlQ2hvaWNlUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9RdWVzdGlvblBhbmUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvZ29vZ2xlRmllbGRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcbmNsYXNzIEFic3RyYWN0TW9kZWwge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBhYnN0cmFjdCBtb2RlbC4gIElmIGRlbGVnYXRlIGlzIHByb3ZpZGVkIHRoZW4gYWxsIGxpc3RlbmVyXG4gICAgICogYWRkcyBhbmQgbm90aWZpZXMgYXJlIHBlcmZvcm1lZCBvbiB0aGUgZGVsZWdhdGUgbGlzdGVuZXIgY29sbGVjdGlvbi5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IGRlbGVnYXRlXG4gICAgICogQHJldHVybnMge25tJF9BYnN0cmFjdE1vZGVsLkFic3RyYWN0TW9kZWx9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZGVsZWdhdGUgPSB0aGlzO1xuICAgICAgICB0aGlzLmFic3RyYWN0TW9kZWxMaXN0ZW5lcnMgPSBbXTsgICAgICAgIFxuICAgIH1cblxuICAgIGdldERlbGVnYXRlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbGVnYXRlO1xuICAgIH1cbiAgICBcbiAgICBzZXREZWxlZ2F0ZShkZWxlZ2F0ZSA9IG51bGwpe1xuICAgICAgICBpZiAoZGVsZWdhdGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5hYnN0cmFjdE1vZGVsTGlzdGVuZXJzID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlbGVnYXRlID0gZGVsZWdhdGUuZGVsZWdhdGU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLmRlbGVnYXRlID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5kZWZpbmVkIGRlbGVnYXRlXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGFkZExpc3RlbmVyKGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09IFwib2JqZWN0XCIpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBBYnN0cmFjdE1vZGVsIGxpc3RlbmVyIHR5cGU6IFwiICsgdHlwZW9mIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRlbGVnYXRlLmFic3RyYWN0TW9kZWxMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbCBhcyBub3RpZnlMaXN0ZW5lcnMobWV0aG9kTmFtZSwgW21ldGhvZEFyZ3VtZW50MCwgLi4uIG1ldGhvZEFyZ3VtZW50Tl0pXG4gICAgICogQHBhcmFtIHt0eXBlfSBtZXRob2RcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeUxpc3RlbmVycyhtZXRob2QpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJFVkVOVCBcIiArIHRoaXMuZGVsZWdhdGUuY29uc3RydWN0b3IubmFtZSArIFwiIFwiICsgbWV0aG9kKTtcblxuICAgICAgICBBcnJheS5wcm90b3R5cGUuc2hpZnQuYXBwbHkoYXJndW1lbnRzKTtcbiAgICAgICAgbGV0IGV2ZW50ID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgICBhcmdzOiBhcmd1bWVudHMsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMsXG4gICAgICAgICAgICBsaXN0ZW5lcnM6IFtdXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB3aW5kb3cubGFzdEV2ZW50ID0gZXZlbnQ7XG4gICAgICAgIHdpbmRvdy5uRXZlbnRzLnB1c2god2luZG93Lmxhc3RFdmVudCk7XG5cbiAgICAgICAgZm9yIChsZXQgbGlzdGVuZXIgb2YgdGhpcy5kZWxlZ2F0ZS5hYnN0cmFjdE1vZGVsTGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJbbWV0aG9kXSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCIgKyBcIiArIGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUgKyBcIiBcIiArIG1ldGhvZCk7XG4gICAgICAgICAgICAgICAgd2luZG93Lmxhc3RFdmVudC5saXN0ZW5lcnMucHVzaChsaXN0ZW5lci5jb25zdHJ1Y3Rvci5uYW1lKTsgICAgICAgXG4gICAgICAgICAgICAgICAgYXdhaXQgbGlzdGVuZXJbbWV0aG9kXS5hcHBseShsaXN0ZW5lciwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcltBYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lcl0pe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiICsgXCIgKyBsaXN0ZW5lci5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgKyBBYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgd2luZG93Lmxhc3RFdmVudC5saXN0ZW5lcnMucHVzaChsaXN0ZW5lci5jb25zdHJ1Y3Rvci5uYW1lKTsgICAgICAgXG4gICAgICAgICAgICAgICAgYXdhaXQgbGlzdGVuZXJbQWJzdHJhY3RNb2RlbC5kZWZhdWx0TGlzdGVuZXJdLmFwcGx5KGxpc3RlbmVyLCB3aW5kb3cubGFzdEV2ZW50KTsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbkFic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyID0gXCJuaWRnZXRMaXN0ZW5lclwiO1xud2luZG93Lm5FdmVudHMgPSBbXTtcbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RNb2RlbDsiLCIndXNlIHN0cmljdCc7XG4vKipcbiAqIFNpbmdsZXRvbiBjbGFzcyB0byBwcm92aWRpbmcgZnVuY3Rpb25hbGl0eSB0byBEcmFnTmlkZ2V0cyBhbmQgRHJvcE5pZGdldHMuXG4gKiBJdCBzdG9yZXMgdGhlIE5pZGdldCBjdXJyZW50bHkgYmVpbmcgZHJhZ2dlZC5cbiAqL1xuY2xhc3MgRHJhZ0hhbmRsZXJ7XG4gICAgXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5vdmVyID0gW107XG4gICAgfVxuICAgIFxuICAgIHB1c2hPdmVyKG5pZGdldCl7XG4gICAgICAgIGlmICh0aGlzLm92ZXJIYXMobmlkZ2V0KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLm92ZXIucHVzaChuaWRnZXQpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgcmVtb3ZlT3ZlcihuaWRnZXQpe1xuICAgICAgICBpZiAoIXRoaXMub3ZlckhhcyhuaWRnZXQpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMub3Zlci5zcGxpY2UodGhpcy5vdmVyLmluZGV4T2YobmlkZ2V0KSwgMSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gICAgXG4gICAgXG4gICAgb3ZlckhhcyhuaWRnZXQpe1xuICAgICAgICByZXR1cm4gdGhpcy5vdmVyLmluZGV4T2YobmlkZ2V0KSAhPT0gLTE7XG4gICAgfVxuICAgIFxuICAgIHNldChuaWRnZXQpe1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBuaWRnZXQ7XG4gICAgfVxuICAgIFxuICAgIGdldCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50O1xuICAgIH1cbiAgICBcbiAgICBoYXMoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudCAhPT0gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgY2xlYXIoKXtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIGdldEluc3RhbmNlKCl7XG4gICAgICAgIHJldHVybiBEcmFnSGFuZGxlci5pbnN0YW5jZTtcbiAgICB9ICAgIFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBEcmFnSGFuZGxlcigpO1xuXG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyogZ2xvYmFsIFV0aWxpdHkgKi9cbmNsYXNzIEZpbGVPcGVyYXRpb25zIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSBhIGZpbGUgKHVybCkuICBNYXAgdmFyaWFibGVzICgkey4uLn0pIHRvIFxuICAgICAqIGEgdmFsdWUuXG4gICAgICogQHBhcmFtIHt0eXBlfSB1cmxcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1hcFxuICAgICAqIEByZXR1cm5zIHtub2RlfEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50LmRvbUVsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGxvYWROaWRnZXQodXJsLCBtYXApeyAgICAgICAgXG4gICAgICAgIGxldCBlbGVtZW50ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQodXJsLCBtYXApO1xuICAgICAgICByZXR1cm4gbmV3IE5pZGdldEVsZW1lbnQoZWxlbWVudCk7XG4gICAgfSAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSBhIGZpbGUgKHVybCkuICBNYXAgdmFyaWFibGVzICgkey4uLn0pIHRvIFxuICAgICAqIGEgdmFsdWUuXG4gICAgICogQHBhcmFtIHt0eXBlfSB1cmxcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1hcFxuICAgICAqIEByZXR1cm5zIHtub2RlfEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50LmRvbUVsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGxvYWRET01FbGVtZW50KHVybCwgbWFwID0gbmV3IE1hcCgpKXsgICAgICAgIFxuICAgICAgICBpZiAobWFwIGluc3RhbmNlb2YgTWFwID09PSBmYWxzZSkgbWFwID0gRmlsZU9wZXJhdGlvbnMub2JqZWN0VG9NYXAobWFwKTsgICAgICAgXG4gICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0VVJMKHVybCk7XG4gICAgICAgIHJldHVybiBGaWxlT3BlcmF0aW9ucy5zdHJpbmdUb0RPTUVsZW1lbnQodGV4dCwgbWFwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSB0ZXh0LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gdGV4dFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgc3RyaW5nVG9ET01FbGVtZW50KHRleHQsIG1hcCA9IG5ldyBNYXAoKSl7XG4gICAgICAgIC8qIHJlcGxhY2UgdmFyaWFibGVzIHdpdGggdmFsdWVzICovXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBtYXAua2V5cygpKXsgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG1hcC5nZXQoa2V5KTtcbiAgICAgICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XT8ke2tleX1bfV1gLCBgZ2ApO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgdmFsdWUpOyAgICBcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIHJlcGxhY2UgdW5maWxsZWQgdmFyaWFibGVzIHdpdGggZW1wdHkgKi9cbiAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdW159XSpbfV1gLCBgZ2ApO1xuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCBcIlwiKTsgXG5cbiAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSB0ZXh0O1xuICAgICAgICBsZXQgZG9tRWxlbWVudCA9IG51bGw7XG4gICAgICAgIGNvbnNvbGUubG9nKGVsZW1lbnQpO1xuXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIHN0YXRpYyBvYmplY3RUb01hcChvYmplY3Qpe1xuICAgICAgICBsZXQgbWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBmb3IgKGxldCBmaWVsZCBpbiBvYmplY3QpeyAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmplY3RbZmllbGRdID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiBvYmplY3RbZmllbGRdID09PSBcIm51bWJlclwiKXtcbiAgICAgICAgICAgICAgICBtYXAuc2V0KGZpZWxkLCBvYmplY3RbZmllbGRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cblxuICAgIFxuXG4gICAgLypcbiAgICAgKiBUcmFuc2ZlciBjb250ZW50cyBvZiAnZmlsZW5hbWUnIGZyb20gc2VydmVyIHRvIGNsaWVudC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdWNjZXNzQ2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcnJvckNhbGxiYWNrXG4gICAgICogQHJldHVybnMge1N0cmluZ30gY29udGVudHMgb2YgZmlsZVxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRVUkwodXJsKSB7XG4gICAgICAgIGxldCBjYWxsYmFjayA9IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHZhciB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgICAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHhodHRwLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHhodHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwIDogeGh0dHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzIDogeGh0dHAuc3RhdHVzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0IDogeGh0dHAucmVzcG9uc2VUZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybCA6IHVybFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICB4aHR0cC5zZW5kKG51bGwpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGRvbSBlbGVtZW50IGZyb20gdGV4dC5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHRleHRcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1hcFxuICAgICAqIEByZXR1cm5zIHtub2RlfEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50LmRvbUVsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGdldEZpbGUodXJsLCBtYXAgPSBuZXcgTWFwKCkpe1xuICAgICAgICBsZXQgdGV4dCA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLmdldFVSTCh1cmwpO1xuXG4gICAgICAgIC8qIHJlcGxhY2UgdmFyaWFibGVzIHdpdGggdmFsdWVzICovXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBtYXAua2V5cygpKXtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG1hcC5nZXQoa2V5KTtcbiAgICAgICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XT8ke2tleX1bfV1gLCBgZ2ApO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogcmVwbGFjZSB1bmZpbGxlZCB2YXJpYWJsZXMgd2l0aCBlbXB0eSAqL1xuICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGBbJF1be11bXn1dKlt9XWAsIGBnYCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsIFwiXCIpO1xuXG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cblxuICAgIC8qXG4gICAgICogVHJhbnNmZXIgY29udGVudHMgb2YgJ2ZpbGVuYW1lJyBmcm9tIHNlcnZlciB0byBjbGllbnQgdXNpbmcgY3VycmVudCB3aW5kb3cgbG9jYXRpb24uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gc3VjY2Vzc0NhbGxiYWNrXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZXJyb3JDYWxsYmFja1xuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgc3RhdGljIGdldExvY2FsKGZpbGVuYW1lKSB7XG4gICAgICAgIGxldCBjYWxsYmFjayA9IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHZhciB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcbiAgICAgICAgICAgIHZhciB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZiArIFwiL1wiICsgZmlsZW5hbWU7XG5cbiAgICAgICAgICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoeGh0dHAucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGh0dHAuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh4aHR0cC5zdGF0dXMsIHhodHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICB4aHR0cC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoY2FsbGJhY2spO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBDYXVzZSAndGV4dCcgdG8gYmUgc2F2ZWQgYXMgJ2ZpbGVuYW1lJyBjbGllbnQgc2lkZS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IGZpbGVuYW1lIFRoZSBkZWZhdWx0IGZpbGVuYW1lIHRvIHNhdmUgdGhlIHRleHQgYXMuXG4gICAgICogQHBhcmFtIHt0eXBlfSB0ZXh0IFRoZSB0ZXh0IHRvIHNhdmUgdG8gZmlsZW5hbWUuXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgc2F2ZVRvRmlsZSh0ZXh0LCBmaWxlbmFtZSkge1xuICAgICAgICBsZXQgYW5jaG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBsZXQgZGF0YSA9IFwidGV4dDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpO1xuICAgICAgICBhbmNob3Iuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcImRhdGE6XCIgKyBkYXRhKTtcbiAgICAgICAgYW5jaG9yLnNldEF0dHJpYnV0ZShcImRvd25sb2FkXCIsIGZpbGVuYW1lKTtcbiAgICAgICAgYW5jaG9yLmNsaWNrKCk7XG4gICAgfVxufVxuXG5GaWxlT3BlcmF0aW9ucy5Ob2RlVHlwZSA9IHtcbiAgICBFTEVNRU5UIDogMSxcbiAgICBBVFRSSUJVVEUgOiAyLFxuICAgIFRFWFQgOiAzLCBcbiAgICBDREFUQVNFQ1RJT04gOiA0LFxuICAgIEVOVElUWVJFRkVSTkNFIDogNSxcbiAgICBFTlRJVFkgOiA2LFxuICAgIFBST0NFU1NJTkdJTlNUUlVDVElPTiA6IDcsXG4gICAgQ09NTUVOVCA6IDgsXG4gICAgRE9DVU1FTlQgOiA5LFxuICAgIERPQ1VNRU5UVFlQRSA6IDEwLFxuICAgIERPQ1VNRU5URlJBR01FTlQgOiAxMSxcbiAgICBOT1RBVElPTiA6IDEyXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcGVyYXRpb25zOyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1vdXNlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvTW91c2VcIiksIFxuICAgIGRyYWcgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9EcmFnXCIpLFxuICAgIGRyb3AgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9Ecm9wXCIpLFxuICAgIG1vdmFibGUgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9Nb3ZhYmxlXCIpLFxuICAgIHJlc2l6ZSA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL1Jlc2l6ZVwiKVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBTaW5nbHRvbiBjbGFzcyB0byBhZGQgZnVuY3Rpb25hbGl0eSB0byB0aGUgbW91c2UuXG4gKi9cbmNsYXNzIE1vdXNlVXRpbGl0aWVzIHtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudCA9IG51bGw7XG4gICAgICAgIHRoaXMubGFzdFggPSAwO1xuICAgICAgICB0aGlzLmxhc3RZID0gMDtcbiAgICB9XG4gICAgXG4gICAgaXNVbmRlcihldmVudCwgZWxlbWVudCkge1xuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WTtcbiAgICAgICAgbGV0IGN1cnJlbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuXG4gICAgICAgIHdoaWxlIChjdXJyZW50KSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudCA9PT0gZWxlbWVudCkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXRVbmRlcihldmVudCkge1xuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WTtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gICAgfVxuXG4gICAgc2V0IGVsZW1lbnQoZWxlbWVudCl7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkRWxlbWVudCAhPT0gbnVsbCl7XG4gICAgICAgICAgICB0aGlzLmRldGFjaEVsZW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVsZW1lbnQgfHwgZWxlbWVudCA9PT0gbnVsbCB8fCBlbGVtZW50ID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGhpcy5kZXRhY2hFbGVtZW50KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IGVsZW1lbnQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0YWNoZWRFbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhbiBlbGVtZW50LiAgSWYgdGhlIGVsZW1lbnQgZG9lc24ndCBoYXZlIGEgcGFyZW50IGl0IHdpbGwgYmVcbiAgICAgKiBhdHRhY2hlZCB0byB0aGUgZG9jdW1lbnQgYW5kIHdpbGwgYmUgZGV0YWNoZWQgd2hlbiBkZXRhY2hFbGVtZW50IGlzIGNhbGxlZC5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIGF0dGFjaEVsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIFxuICAgICAgICBpZiAoZWxlbWVudC5wYXJlbnQpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBhdHRhY2ggZWxlbWVudCB0byBtb3VzZSBpZiB0aGUgZWxlbWVudCBoYXMgYSBwYXJlbnQgZWxlbWVudC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQoZWxlbWVudCk7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7IFxuICAgICAgICBlbGVtZW50LnN0eWxlLnRvcCA9IGV2ZW50LmNsaWVudFkgKyBcInB4XCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IGV2ZW50LmNsaWVudFggKyBcInB4XCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9IFwibm9uZVwiO1xuICAgICAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IFwiMTAwMDBcIjtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubW92ZUNhbGxCYWNrID0gKGV2ZW50KT0+dGhpcy5vbk1vdXNlTW92ZShldmVudCk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW92ZUNhbGxCYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgbGlzdGVuZXJzIGZyb20gdGhlIGF0dGFjaGVkIGVsZW1lbnQsIGRvIG5vdCByZW1vdmUgaXQgZnJvbSB0aGVcbiAgICAgKiBkb2N1bWVudC5cbiAgICAgKiBAcmV0dXJucyB7dHlwZX1cbiAgICAgKi9cbiAgICBkZXRhY2hFbGVtZW50KCl7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkRWxlbWVudCA9PT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3ZlQ2FsbEJhY2spOyAgICAgICAgXG4gICAgICAgIGxldCBydmFsdWUgPSB0aGlzLmF0dGFjaGVkRWxlbWVudDtcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQgPSBudWxsOyAgICAgICAgXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQocnZhbHVlKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBydmFsdWU7XG4gICAgfVxuXG4gICAgb25Nb3VzZU1vdmUoZXZlbnQpIHsgICAgICAgIFxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmxhc3RYID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgdGhpcy5sYXN0WSA9IGV2ZW50LmNsaWVudFk7XG5cbiAgICAgICAgLy8gc2V0IHRoZSBlbGVtZW50J3MgbmV3IHBvc2l0aW9uOlxuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudC5zdHlsZS50b3AgPSBldmVudC5jbGllbnRZICsgXCJweFwiO1xuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudC5zdHlsZS5sZWZ0ID0gZXZlbnQuY2xpZW50WCArIFwicHhcIjtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vdXNlVXRpbGl0aWVzKCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBwcmVmaXg6IFwiZGF0YS1uaWRnZXRcIixcbiAgICBlbGVtZW50QXR0cmlidXRlOiBcImRhdGEtbmlkZ2V0LWVsZW1lbnRcIixcbiAgICBzcmNBdHRyaWJ1dGU6IFwic3JjXCIsXG4gICAgdGVtcGxhdGVTcmNBdHRyaWJ1dGU6IFwidGVtcGxhdGUtc3JjXCIsXG4gICAgbmFtZUF0dHJpYnV0ZTogXCJuYW1lXCIsXG4gICAgaW50ZXJmYWNlQXR0cmlidXRlOiBcImludGVyZmFjZXNcIixcbiAgICB0ZW1wbGF0ZUF0dHJpYnV0ZTogXCJ0ZW1wbGF0ZVwiLFxuICAgIGludGVyZmFjZURhdGFGaWVsZDogXCJpbnRlcmZhY2VEYXRhXCIsXG4gICAgbW9kZWxEYXRhRmllbGQ6IFwibW9kZWxEYXRhXCIsXG4gICAgc3R5bGVBdHRyaWJ1dGU6IFwibmlkZ2V0LXN0eWxlXCJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBGaWxlT3BlcmF0aW9ucyA9IHJlcXVpcmUoXCIuL0ZpbGVPcGVyYXRpb25zXCIpO1xuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIi4vTmlkZ2V0XCIpO1xuY29uc3QgSW50ZXJmYWNlcyA9IHJlcXVpcmUoXCIuL0ludGVyZmFjZXNcIik7XG5jb25zdCBUcmFuc2Zvcm1lciA9IHJlcXVpcmUoXCIuL1RyYW5zZm9ybWVyXCIpO1xuY29uc3QgTmlkZ2V0U3R5bGUgPSByZXF1aXJlKFwiLi9OaWRnZXRTdHlsZVwiKTtcblxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIHc6aCBhc3BlY3QgcmF0aW8gYW5kIGFkanVzdCB0aGUgcHJvcG9ydGlvbnMgYWNjb3JkaW5nbHkuXG4gKlxuICovXG5jbGFzcyBBc3BlY3RSYXRpb3tcbiAgICBjb25zdHJ1Y3RvcihuaWRnZXQpIHtcbiAgICAgICAgdGhpcy5uaWRnZXQgPSBuaWRnZXQ7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCk9PnRoaXMub25SZXNpemUoKSk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLm5pZGdldCk7XG4gICAgICAgIHRoaXMucGFyc2VWYWx1ZXMoKTtcbiAgICAgICAgdGhpcy5vblJlc2l6ZSgpO1xuICAgICAgICB0aGlzLmxvYWRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGdldFZhbHVlKCl7XG4gICAgICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKEFzcGVjdFJhdGlvLkNTU19BVFRSSUJVVEUpO1xuICAgIH1cblxuICAgIHBhcnNlVmFsdWVzKCl7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcbiAgICAgICAgbGV0IHNwbGl0ID0gdmFsdWUuc3BsaXQoL1sgLDtdL2cpO1xuXG4gICAgICAgIGZvciAobGV0IHMgb2Ygc3BsaXQpe1xuICAgICAgICAgICAgaWYgKHMuc3BsaXQoL1stOl0vKS5sZW5ndGggPT09IDIpe1xuICAgICAgICAgICAgICAgIGxldCByYXRpbyA9IHMuc3BsaXQoL1stOl0vKTtcbiAgICAgICAgICAgICAgICB0aGlzLndpZHRoID0gcGFyc2VJbnQocmF0aW9bMF0pO1xuICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gcGFyc2VJbnQocmF0aW9bMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocyA9PT0gXCJoXCIpe1xuICAgICAgICAgICAgICAgIHRoaXMub25SZXNpemUgPSAoKT0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMubmlkZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUud2lkdGggPSAoaGVpZ2h0ICogdGhpcy53aWR0aCAvIHRoaXMuaGVpZ2h0KSArIFwicHhcIlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUmVzaXplKCl7XG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMubmlkZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xuICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5oZWlnaHQgPSAod2lkdGggKiB0aGlzLmhlaWdodCAvIHRoaXMud2lkdGgpICsgXCJweFwiO1xuICAgIH1cbn1cblxuQXNwZWN0UmF0aW8uQ1NTX0FUVFJJQlVURSA9IFwiLS1uaWRnZXQtYXNwZWN0LXJhdGlvXCI7XG5cbi8qKlxuICogQSBOaWRnZXRFbGVtZW50IGlzIGEgMToxIGNsYXNzLW9iamVjdDpkb20tb2JqZWN0IHBhaXJpbmcuICBBY3Rpb25zIG9uIHRoZSBET00gXG4gKiBvYmplY3Qgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGJ5IHRoZSBOaWRnZXRFbGVtZW50IG9iamVjdC4gIFRoZSBpbnRlcmZhY2VEYXRhXG4gKiBmaWVsZCBpcyByZXNlcnZlZCBmb3IgZGF0YSBmcm9tIGludGVyZmFjZXMuICBJbnRlcmZhY2VzIHNob3VsZCBwdXQgdGhlaXIgXG4gKiBjdXN0b20gZGF0YSB1bmRlciBbaW50ZXJmYWNlRGF0YUZpZWxkXS5baW50ZXJmYWNlTmFtZV0uICBUaGUgaW50ZXJmYWNlIGRhdGFcbiAqIGF0dHJpYnV0ZSBpcyBzZXQgd2l0aCB0aGUgc3RhdGljIHZhbHVlIE5pZGdldC5pbnRlcmZhY2VEYXRhRmllbGQuXG4gKiBcbiAqIENhbGxpbmcgbWV0aG9kcyBvbiB0aGUgbmlkZ2V0IHdpbGwgdHJlYXQgc2hhZG93IGNvbnRlbnRzIGFzIHJlZ3VsYXIgY29udGVudHMuXG4gKi9cbmNsYXNzIE5pZGdldEVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IE5pZGdldCBhc3NvY2lhdGVkIHdpdGggJ2VsZW1lbnQnLiAgQW4gZXJyb3Igd2lsbCBiZSB0aHJvd25cbiAgICAgKiBpZiB0aGUgJ2VsZW1lbnQnIGlzIGFscmVhZHkgYXNzb2NpYXRlZCB3aXRoIGEgTmlkZ2V0LlxuICAgICAqIFxuICAgICAqIERpc2FibGVkIGNsYXNzIGluZGljYXRlcyB0aGlzIG5pZGdldCB3aWxsIGlnbm9yZSBtb3VzZSBldmVudHMuXG4gICAgICogXG4gICAgICogQHBhcmFtIHt0eXBlfSBlbGVtZW50IEpRdWVyeSBzZWxlY3RvclxuICAgICAqIEByZXR1cm4ge25tJF9OaWRnZXQuTmlkZ2V0RWxlbWVudH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZUlkKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXNbTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZF0gPSB7fTtcbiAgICAgICAgdGhpc1tOaWRnZXQubW9kZWxEYXRhRmllbGRdID0ge307XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtZXIodGhpcyk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzID0ge307XG5cbiAgICAgICAgaWYgKHRlbXBsYXRlSWQpe1xuICAgICAgICAgICAgdGhpcy5hcHBseVRlbXBsYXRlKHRlbXBsYXRlSWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrIGlzIGludm9rZWQgZWFjaCB0aW1lIHRoZSBjdXN0b20gZWxlbWVudCBpcyBhcHBlbmRlZCBpbnRvIGEgZG9jdW1lbnQtY29ubmVjdGVkIGVsZW1lbnRcbiAgICAgKi9cbiAgICBhc3luYyBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgdGhpcy5zaGFkb3dDb250ZW50cyA9IHRoaXM7XG5cbiAgICAgICAgLy8gc2V0IHRoZSBodG1sIG9mIHRoaXMgZWxlbWVudCB0byB0aGUgY29udGVudHMgb2YgdGhlIGZpbGUgKG5vdCBhIHNoYWRvdyBlbGVtZW50KVxuICAgICAgICAvLyBhbGwgZGF0YS0gYXR0cmlidXRlcyB3aWxsIGJlIHVzZWQgdG8gZmlsbCBpbiAke30gdmFyaWFibGVzIGluIHRoZSBzb3VyY2UgZmlsZVxuICAgICAgICAvLyBkb2Vzbid0IHdvcmsgb24gZWRnZVxuICAgICAgICBpZiAodGhpcy5oYXNBdHRyaWJ1dGUoTmlkZ2V0LnNyY0F0dHJpYnV0ZSkpIGF3YWl0IHRoaXMucmV0cmlldmVTb3VyY2UodGhpcy5kYXRhQXR0cmlidXRlcygpKTtcbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0cmlidXRlKE5pZGdldC50ZW1wbGF0ZVNyY0F0dHJpYnV0ZSkpIGF3YWl0IHRoaXMucmV0cmlldmVUZW1wbGF0ZSgpO1xuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKT0+IHtcbiAgICAgICAgICAgIGxldCBhciA9IGdldENvbXB1dGVkU3R5bGUodGhpcykuZ2V0UHJvcGVydHlWYWx1ZShBc3BlY3RSYXRpby5DU1NfQVRUUklCVVRFKTtcbiAgICAgICAgICAgIGlmIChhciAhPT0gXCJcIikgbmV3IEFzcGVjdFJhdGlvKHRoaXMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZSBhIG1hcCBvZiBhbGwgZGF0YSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybnMge01hcDxhbnksIGFueT59XG4gICAgICovXG4gICAgZGF0YUF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIGxldCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGZvciAobGV0IGF0dHIgb2YgdGhpcy5hdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBpZiAoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoXCJkYXRhLVwiKSkge1xuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gYXR0ci5uYW1lLnN1YnN0cig1KTtcbiAgICAgICAgICAgICAgICBtYXBbbmFtZV0gPSBhdHRyLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGEgc2hhZG93IGVsZW1lbnQgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIHRlbXBsYXRlIG5hbWVkICh0ZW1wbGF0ZUlEKS5cbiAgICAgKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgYXBwbHlUZW1wbGF0ZSh0ZW1wbGF0ZUlkKSB7XG4gICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRlbXBsYXRlSWQpO1xuXG4gICAgICAgIGlmICghdGVtcGxhdGUpIHRocm93IG5ldyBFcnJvcihcIlRlbXBsYXRlICdcIiArIHRlbXBsYXRlSWQgKyBcIicgbm90IGZvdW5kLlwiKTtcbiAgICAgICAgaWYgKHRlbXBsYXRlLnRhZ05hbWUudG9VcHBlckNhc2UoKSAhPT0gXCJURU1QTEFURVwiKSB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtZW50IHdpdGggaWQgJ1wiICsgdGVtcGxhdGVJZCArIFwiJyBpcyBub3QgYSB0ZW1wbGF0ZS5cIik7XG5cbiAgICAgICAgdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6ICdvcGVuJ30pLmFwcGVuZENoaWxkKHRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpKTtcbiAgICB9XG5cbiAgICBhc3luYyByZWFkeSgpe1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCBjb250ZW50cyBvZiBmaWxlIGludG8gdGhpcyBlbGVtZW50LlxuICAgICAqIFJlcGxhY2UgYWxsICR7fSB2YXJpYWJsZXMgd2l0aCBjb250ZW50cyBvZiAnbWFwJy5cbiAgICAgKi9cbiAgICBhc3luYyByZXRyaWV2ZVNvdXJjZShtYXApe1xuICAgICAgICBsZXQgc3JjID0gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0LnNyY0F0dHJpYnV0ZSk7XG4gICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0RmlsZShzcmMsIG1hcCk7XG4gICAgICAgIHRoaXMuaW5uZXJIVE1MID0gdGV4dDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2FkIGNvbnRlbnRzIG9mIGZpbGUgYXMgYSB0ZW1wbGV0ZSBhbmQgYXBwbHkgdGhhdCB0ZW1wbGF0ZSB0byB0aGlzIGVsZW1lbnQuXG4gICAgICogUmVwbGFjZSBhbGwgJHt9IHZhcmlhYmxlcyB3aXRoIGNvbnRlbnRzIG9mICdtYXAnLlxuICAgICAqIFRoZSB0ZW1wbGF0ZSB3aWxsIGJlIGdpdmVuIHRoZSBpZCBkZXJpdmVkIGZyb20gdGhlIHNyYyBhdHRyaWJ1dGUuXG4gICAgICovXG4gICAgYXN5bmMgcmV0cmlldmVUZW1wbGF0ZSgpe1xuICAgICAgICBsZXQgc3JjID0gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0LnRlbXBsYXRlU3JjQXR0cmlidXRlKTtcbiAgICAgICAgbGV0IGlkID0gc3JjLnJlcGxhY2UoL1tcXC8vIC4tXSsvZywgXCJfXCIpO1xuICAgICAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtpZH1gKTtcbiAgICAgICAgaWYgKHRlbXBsYXRlKSB0aGlzLmluamVjdFRlbXBsYXRlKHRlbXBsYXRlKTtcbiAgICB9XG5cbiAgICBhc3luYyBpbmplY3RUZW1wbGF0ZSh0ZW1wbGF0ZSl7XG4gICAgICAgIGlmICh0aGlzLnNoYWRvd1Jvb3QgIT09IG51bGwpIHJldHVybjtcbiAgICAgICAgdGhpcy5hdHRhY2hTaGFkb3coe21vZGU6ICdvcGVuJ30pLmFwcGVuZENoaWxkKHRlbXBsYXRlLmNvbnRlbnQuY2xvbmVOb2RlKHRydWUpKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgbG9hZFRlbXBsYXRlU25pcHBldChmaWxlbmFtZSwgdGFnbmFtZSl7XG4gICAgICAgIGxldCBpZCA9IGZpbGVuYW1lLnJlcGxhY2UoL1tcXC8vIC4tXSsvZywgXCJfXCIpO1xuXG4gICAgICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aWR9YCkpe1xuICAgICAgICAgICAgbGV0IHRleHQgPSBhd2FpdCBGaWxlT3BlcmF0aW9ucy5nZXRGaWxlKGZpbGVuYW1lKTtcbiAgICAgICAgICAgIGxldCB0ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZW1wbGF0ZVwiKTtcbiAgICAgICAgICAgIHRlbXBsYXRlLmlubmVySFRNTCA9IHRleHQ7XG4gICAgICAgICAgICB0ZW1wbGF0ZS5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpZCk7XG4gICAgICAgICAgICBpZiAodGFnbmFtZSkgdGVtcGxhdGUuc2V0QXR0cmlidXRlKFwiZGF0YS1uaWRnZXRcIiwgdGFnbmFtZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZCh0ZW1wbGF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtpZH1gKTtcblxuICAgICAgICBmb3IgKGxldCBlbGUgb2YgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0YWduYW1lKSl7XG4gICAgICAgICAgICBlbGUuaW5qZWN0VGVtcGxhdGUodGVtcGxhdGUpO1xuICAgICAgICAgICAgYXdhaXQgZWxlLnJlYWR5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgJ2hpZGRlbicgY2xhc3MuXG4gICAgICovXG4gICAgc2hvdygpIHtcbiAgICAgICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCAnaGlkZGVuJyBjbGFzcy5cbiAgICAgKi9cbiAgICBoaWRlKCkge1xuICAgICAgICB0aGlzLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBkaXNhYmxlZCBmbGFnIHRoYXQgaXMgcmVhZCBieSBuaWRnZXQgbW91c2UgZnVuY3Rpb25zLlxuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqL1xuICAgIHNldCBkaXNhYmxlZCh2YWx1ZSl7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUsIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUoTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZGlzYWJsZWQgZmxhZyB0aGF0IGlzIHJlYWQgYnkgbmlkZ2V0IG1vdXNlIGZ1bmN0aW9ucy5cbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKi9cbiAgICBnZXQgZGlzYWJsZWQoKXtcbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dHJpYnV0ZShOaWRnZXRFbGVtZW50LkRJU0FCTEVEX0FUVFJJQlVURSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldEVsZW1lbnQuRElTQUJMRURfQVRUUklCVVRFKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGlzIGVsZW1lbnQgd2FzIHVuZGVyIHRoZSBtb3VzZSBmb3IgdGhlIGV2ZW50LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gZXZlbnRcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGlzVW5kZXJNb3VzZShldmVudCkge1xuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WTtcbiAgICAgICAgbGV0IGN1cnJlbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuXG4gICAgICAgIHdoaWxlIChjdXJyZW50KSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudCA9PT0gdGhpcykgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW4gdGhlIHF1ZXJ5IHNlbGVjdG9yIG9uIHRoaXMgZWxlbWVudC5cbiAgICAgKiBJZiB0aGlzIGVsZW1lbnQgaGFzIGEgc2hhZG93LCBydW4gaXQgb24gdGhhdCBpbnN0ZWFkLlxuICAgICAqIEBwYXJhbSBzZWxlY3RvcnNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdfVxuICAgICAqL1xuICAgcXVlcnlTZWxlY3RvcihzZWxlY3RvcnMpIHtcbiAgICAgICAgaWYgKHRoaXMuc2hhZG93Um9vdCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5xdWVyeVNlbGVjdG9yKHNlbGVjdG9ycyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW4gdGhlIHF1ZXJ5IHNlbGVjdG9yIG9uIHRoaXMgZWxlbWVudC5cbiAgICAgKiBJZiB0aGlzIGVsZW1lbnQgaGFzIGEgc2hhZG93LCBydW4gaXQgb24gdGhhdCBpbnN0ZWFkLlxuICAgICAqIEBwYXJhbSBzZWxlY3RvcnNcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnRUYWdOYW1lTWFwW0tdfVxuICAgICAqL1xuICAgIHF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKSB7XG4gICAgICAgIGlmICh0aGlzLnNoYWRvd1Jvb3Qpe1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc3VwZXIucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIHRoaXMgZWxlbWVudCBmcm9tIGl0J3MgcGFyZW50LlxuICAgICAqL1xuICAgIGRldGFjaCgpe1xuICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5kZXggd2l0aGluIHRoZSBwYXJlbnQgZWxlbWVudC5cbiAgICAgKi9cbiAgICBpbmRleCgpe1xuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLnBhcmVudEVsZW1lbnQuY2hpbGRyZW4pLmluZGV4T2YodGhpcyk7XG4gICAgfVxufVxuXG4vLyBOaWRnZXRFbGVtZW50Lm11dGF0aW9uT2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigocmVjb3JkLCBvYnNlcnZlcik9Pntcbi8vICAgICByZWNvcmQuZm9yRWFjaCgobXV0YXRpb24pID0+IHtcbi8vICAgICAgICAgaWYgKCFtdXRhdGlvbi5hZGRlZE5vZGVzKSByZXR1cm5cbi8vICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtdXRhdGlvbi5hZGRlZE5vZGVzLmxlbmd0aDsgaSsrKSB7XG4vLyAgICAgICAgICAgICBsZXQgbm9kZSA9IG11dGF0aW9uLmFkZGVkTm9kZXNbaV07XG4vLyAgICAgICAgICAgICBpZiAobm9kZS50YWdOYW1lID09PSBcIlRFTVBMQVRFXCIpIHtcbi8vICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhub2RlLnRhZ05hbWUpO1xuLy8gICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG5vZGUuZ2V0QXR0cmlidXRlKFwiZGF0YS1uaWRnZXRcIikpO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgfSk7XG4vLyB9KTtcbi8vXG4vLyBOaWRnZXRFbGVtZW50Lm11dGF0aW9uT2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwge1xuLy8gICAgIGNoaWxkTGlzdDogdHJ1ZSxcbi8vICAgICBzdWJ0cmVlOiB0cnVlLFxuLy8gICAgIGF0dHJpYnV0ZXM6IGZhbHNlLFxuLy8gICAgIGNoYXJhY3RlckRhdGE6IGZhbHNlXG4vLyB9KTtcblxuTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUgPSBcIm5pZGdldC1kaXNhYmxlZFwiO1xud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWVsZW1lbnQnLCBOaWRnZXRFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0RWxlbWVudDsiLCIndXNlIHN0cmljdCc7XG4vKipcbiAqIE1hbmlwdWxhdGVzIHRoZSBlbGVtZW50cyBzdHlsZSB3aXRoIGpzIHJvdXRpbmVzIGFjY29yZGluZyB0byBjc3MgZmxhZ3MuXG4gKiBOaWRnZXQgc3R5bGUgaXMgYXBwbGllZCB0byBhbGwgbmlkZ2V0LWVsZW1lbnRzIHVubGVzcyB0aGV5IGhhdmUgdGhlIG5pZGdldC1zdHlsZVxuICogYXR0cmlidXRlIHNldCB0byAnZmFsc2UnLlxuICovXG5cbmNsYXNzIE5pZGdldFN0eWxlIHtcblxuICAgIGNvbnN0cnVjdG9yKG5pZGdldCkge1xuICAgICAgICB0aGlzLm5pZGdldCA9IG5pZGdldDtcbiAgICAgICAgdGhpcy5hcHBseSgpO1xuICAgIH1cbiAgICBcbiAgICBhcHBseSgpIHtcbiAgICAgICAgdGhpcy5uaWRnZXRXaWR0aFJhdGlvKCk7XG4gICAgICAgIHRoaXMubmlkZ2V0SGVpZ2h0UmF0aW8oKTtcbiAgICAgICAgdGhpcy5uaWRnZXRGaXRUZXh0KCk7XG4gICAgICAgIHRoaXMubmlkZ2V0Rml0VGV4dFdpZHRoKCk7XG4gICAgICAgIHRoaXMubmlkZ2V0VmVydEFsaWduVGV4dCgpO1xuICAgIH1cbiAgICBcbiAgICBuaWRnZXRXaWR0aFJhdGlvKCkge1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtd2lkdGgtcmF0aW9cIik7XG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjsgICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4geyAgICAgICAgICAgIFxuICAgICAgICAgICAgdGhpcy5uaWRnZXQud2lkdGggPSB0aGlzLm5pZGdldC5oZWlnaHQgKiByYXRpbztcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7ICAgICAgXG4gICAgfVxuICAgIFxuICAgIG5pZGdldEhlaWdodFJhdGlvKCkge1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtaGVpZ2h0LXJhdGlvXCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47ICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHsgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LmhlaWdodCA9IHRoaXMubmlkZ2V0LndpZHRoICogcmF0aW87XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbGwgdGhlIHRleHQgaGVpZ2h0IHRvIG1hdGNoIHRoZSBlbGVtZW50IGhlaWdodC5cbiAgICAgKiBDaGFuZ2UgdGhlIHJhdGlvIHZhbHVlIChvciB0aGUgZm9udFNpemUpIGFkanVzdC5cbiAgICAgKi9cbiAgICBuaWRnZXRGaXRUZXh0KCkge1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtZml0LXRleHRcIik7ICAgICAgICBcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xuXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgLS1uaWRnZXQtZml0LXRleHQgJHtyYXRpb31gKVxuICAgICAgICAgICAgbGV0IGggPSB0aGlzLm5pZGdldC5vZmZzZXRIZWlnaHQgKiByYXRpbztcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gaCArIFwicHhcIjtcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7ICAgICAgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogIFdpbGwgY2hhbmdlIHRoZSBmb250IHNpemUgc28gdGhhdCB0aGUgdGV4dCBmaXQncyBpbiB0aGUgcGFyZW50IGVsZW1lbnQuXG4gICAgICogIERvbid0IHNldCB0aGUgd2lkdGggb2YgdGhlIGVsZW1lbnQuXG4gICAgICovXG4gICAgbmlkZ2V0Rml0VGV4dFdpZHRoKCkge1xuICAgICAgICBsZXQgcmVtb3ZlID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0LXdpZHRoXCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmVtb3ZlKSkgcmV0dXJuO1xuXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50XG5cbiAgICAgICAgICAgIGxldCB0ZXh0VyA9IHRoaXMubmlkZ2V0LnNjcm9sbFdpZHRoO1xuICAgICAgICAgICAgbGV0IGNvbnRXID0gdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICAgICAgICAgIGNvbnRXID0gY29udFcgLSByZW1vdmU7XG4gICAgICAgICAgICBsZXQgZHcgPSBjb250Vy90ZXh0VztcbiAgICAgICAgICAgIGxldCBjb21wdXRlZEZvbnRTaXplID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoJ2ZvbnQtc2l6ZScpXG4gICAgICAgICAgICBjb21wdXRlZEZvbnRTaXplID0gcGFyc2VJbnQoY29tcHV0ZWRGb250U2l6ZSk7XG4gICAgICAgICAgICBjb21wdXRlZEZvbnRTaXplID0gTWF0aC5yb3VuZChjb21wdXRlZEZvbnRTaXplKTtcbiAgICAgICAgICAgIGxldCBuZXdGb250U2l6ZSA9IE1hdGgucm91bmQoY29tcHV0ZWRGb250U2l6ZSAqIGR3KTtcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5uaWRnZXQub2Zmc2V0SGVpZ2h0XG5cbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhjb21wdXRlZEZvbnRTaXplIC0gbmV3Rm9udFNpemUpIDw9IDIpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKG5ld0ZvbnRTaXplID4gaCkgbmV3Rm9udFNpemUgPSBoO1xuXG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IG5ld0ZvbnRTaXplICsgXCJweFwiO1xuICAgICAgICB9KS5vYnNlcnZlKHRoaXMubmlkZ2V0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGxpbmUgaGVpZ2h0IHRvIHRoZSBvZmZzZXQgaGVpZ2h0IG11bHRpcGxpZWQgYnkgcmF0aW8uXG4gICAgICovXG4gICAgbmlkZ2V0VmVydEFsaWduVGV4dCgpe1xuICAgICAgICBsZXQgcmF0aW8gPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtdmVydC1hbGlnbi10ZXh0XCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XG5cbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5uaWRnZXQub2Zmc2V0SGVpZ2h0ICogcmF0aW87XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5saW5lSGVpZ2h0ID0gaCArIFwicHhcIjtcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldFN0eWxlOyIsIid1c2Ugc3RyaWN0JztcbmNsYXNzIFRyYW5zZm9ybXtcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSl7XG4gICAgICAgIGxldCBpbmRleE9mID0gdmFsdWUuaW5kZXhPZihcIihcIik7XG4gICAgICAgIHRoaXMubmFtZSA9IHZhbHVlLnN1YnN0cmluZygwLCBpbmRleE9mKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlLnN1YnN0cmluZyh0aGlzLm5hbWUubGVuZ3RoICsgMSwgdmFsdWUubGVuZ3RoIC0gMSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMubmFtZSArIFwiLCBcIiArIHRoaXMudmFsdWUpO1xuICAgIH1cbiAgICBcbiAgICB0b1N0cmluZygpe1xuICAgICAgICByZXR1cm4gdGhpcy5uYW1lICsgXCIoXCIgKyB0aGlzLnZhbHVlICsgXCIpXCI7XG4gICAgfSAgICBcbn1cblxuY2xhc3MgVHJhbnNmb3JtZXIge1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIH1cbiAgICBcbiAgICBhcHBlbmQoKXtcbiAgICAgICAgbGV0IGNvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmVsZW1lbnQpW1widHJhbnNmb3JtXCJdO1xuICAgICAgICBpZiAoY29tcHV0ZWRTdHlsZSAhPT0gXCJub25lXCIpIHRoaXMucHVzaChjb21wdXRlZFN0eWxlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIGNsZWFyKCl7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBcIlwiO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgdW5zaGlmdCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSB2YWx1ZSArIFwiIFwiICsgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybTtcbiAgICB9XG4gICAgXG4gICAgcHVzaCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtICsgXCIgXCIgKyB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSAgICBcbiAgICBcbiAgICBzaGlmdCgpe1xuICAgICAgICBsZXQgYXJyYXkgPSB0aGlzLnNwbGl0KCk7XG4gICAgICAgIGlmIChhcnJheS5sZW5ndGggPT09IDApIHJldHVybiBcIlwiO1xuICAgICAgICBhcnJheS5zaGlmdCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBwb3AoKXtcbiAgICAgICAgbGV0IGFycmF5ID0gdGhpcy5zcGxpdCgpO1xuICAgICAgICBpZiAoYXJyYXkubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcbiAgICAgICAgYXJyYXkucG9wKCk7XG4gICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBhcnJheS5qb2luKFwiIFwiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7ICAgICAgXG4gICAgfVxuICAgIFxuICAgIHJlcGxhY2UodmFsdWUpe1xuICAgICAgICBsZXQgbmV3VHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybSh2YWx1ZSk7XG4gICAgICAgIGxldCBhcnJheSA9IHRoaXMuc3BsaXQoKTtcbiAgICAgICAgXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgbGV0IGVudHJ5ID0gYXJyYXlbaV07XG4gICAgICAgICAgICBsZXQgdHJhbnNmb3JtID0gbmV3IFRyYW5zZm9ybShlbnRyeSk7XG4gICAgICAgICAgICBpZiAodHJhbnNmb3JtLm5hbWUgPT09IG5ld1RyYW5zZm9ybS5uYW1lKXtcbiAgICAgICAgICAgICAgICBhcnJheVtpXSA9IG5ld1RyYW5zZm9ybS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSBhcnJheS5qb2luKFwiIFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgc3BsaXQoKXtcbiAgICAgICAgbGV0IHZhbHVlID0gdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybTtcbiAgICAgICAgbGV0IHN0YXJ0ID0gMDtcbiAgICAgICAgbGV0IHJ2YWx1ZSA9IFtdO1xuICAgICAgICBsZXQgbGFzdCA9ICcnO1xuICAgICAgICBsZXQgc2tpcCA9IGZhbHNlO1xuICAgICAgICBsZXQgbmVzdGVkUCA9IDA7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGlmICghc2tpcCAmJiB2YWx1ZVtpXSA9PT0gJyAnICYmIGxhc3QgPT09ICcgJyl7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFza2lwICYmIHZhbHVlW2ldID09PSAnICcpIHtcbiAgICAgICAgICAgICAgICBydmFsdWUucHVzaCh2YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIGkpKTtcbiAgICAgICAgICAgICAgICBzdGFydCA9IGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlW2ldID09PSAnKCcpIHtcbiAgICAgICAgICAgICAgICBuZXN0ZWRQKys7XG4gICAgICAgICAgICAgICAgc2tpcCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlW2ldID09PSAnKScpIHtcbiAgICAgICAgICAgICAgICBuZXN0ZWRQLS07XG4gICAgICAgICAgICAgICAgaWYgKG5lc3RlZFAgPT09IDApIHNraXAgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhc3QgPSB2YWx1ZVtpXTtcbiAgICAgICAgfVxuICAgICAgICBydmFsdWUucHVzaCh2YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIHZhbHVlLmxlbmd0aCkpO1xuICAgICAgICByZXR1cm4gcnZhbHVlO1xuICAgIH1cbiAgICBcbiAgICB0b1N0cmluZygpe1xuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhbnNmb3JtZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBOaWRnZXQgdGhhdCBjaGFuZ2VzIHRoZSBpbWFnZSBmb3IgaG92ZXIsIGRpc2FibGVkLCBwcmVzcywgYW5kIGlkbGUuXG4gKiBGaXJlcyBhIGNsaWNrIGV2ZW50IHdoZW4gY2xpY2tlZC5cbiAqXG4gKiBXaWxsIHNldCB0aGUgY3VycmVudCBzdGF0ZSBhcyBkYXRhLXN0YXRlIHNvIHRoYXQgY3NzIGNhbiBhY2Nlc3MgaXQuXG4gKi9cbmNsYXNzIE5pZGdldEJ1dHRvbiBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgICAgIHRoaXMuYWxwaGFUb2xlcmFuY2UgPSAwOyAvLyBhbHBoYSBuZWVkcyB0byBiZSA+IHRvbGVyYW5jZSB0byB0cmlnZ2VyIGV2ZW50cy5cblxuICAgICAgICB0aGlzLnN0cmluZ0hvdmVyID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdIT1ZFUiddXCI7XG4gICAgICAgIHRoaXMuc3RyaW5nRGlzYWJsZWQgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J0RJU0FCTEVEJ11cIjtcbiAgICAgICAgdGhpcy5zdHJpbmdQcmVzcyA9IFwibmlkZ2V0LWJ1dHRvbi1zdGF0ZVtzdGF0ZT0nUFJFU1MnXVwiO1xuICAgICAgICB0aGlzLnN0cmluZ0lkbGUgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J0lETEUnXVwiO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcImlkbGVcIjtcbiAgICB9XG5cbiAgICBpc0luU2V0KCkge1xuICAgICAgICBsZXQgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICAgICAgICB3aGlsZSAocGFyZW50ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChwYXJlbnQudGFnTmFtZSA9PT0gXCJOSURHRVQtQlVUVE9OLVNFVFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbmlkZ2V0UmVhZHkoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nRGlzYWJsZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSWRsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmlzSW5TZXQoKSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgdGhpcy5tb3VzZUVudGVyKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlTGVhdmUpO1xuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZVByZXNzKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCB0aGlzLm1vdXNlUmVsZWFzZSk7XG5cbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5kaXNhYmxlZCkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cbiAgICBpc1VuZGVyKGV2ZW50KSB7XG4gICAgICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LmVsZW1lbnRzRnJvbVBvaW50KGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuICAgICAgICBpZiAoZWxlbWVudHMuaW5kZXhPZih0aGlzLmFjdGl2ZU5pZGdldCkgPT0gLTEpIHJldHVybiBmYWxzZTtcblxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuYWN0aXZlTmlkZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFggLSByZWN0Lng7XG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WSAtIHJlY3QueTtcblxuICAgICAgICByZXR1cm4gdGhpcy50ZXN0QWxwaGEoeCwgeSk7XG4gICAgfVxuXG4gICAgZ2V0IGRpc2FibGVkKCkge1xuICAgICAgICByZXR1cm4gc3VwZXIuZGlzYWJsZWQ7XG4gICAgfVxuXG4gICAgc2V0IGRpc2FibGVkKHZhbHVlKSB7XG4gICAgICAgIHN1cGVyLmRpc2FibGVkID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nRGlzYWJsZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwiaW5cIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0hvdmVyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwicHJlc3NcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ1ByZXNzO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSWRsZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBtb3VzZVJlbGVhc2UoZSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XG4gICAgfVxuXG4gICAgbW91c2VQcmVzcyhlKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBcInByZXNzXCI7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdQcmVzcztcbiAgICB9XG5cbiAgICBoaWRlQWxsSW1hZ2VzKCkge1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdIb3ZlcikuaGlkZSgpO1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdEaXNhYmxlZCkuaGlkZSgpO1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdQcmVzcykuaGlkZSgpO1xuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IodGhpcy5zdHJpbmdJZGxlKS5oaWRlKCk7XG4gICAgfVxuXG4gICAgc2V0IGFjdGl2ZU5pZGdldChzZWxlY3Rvcikge1xuICAgICAgICB0aGlzLmhpZGVBbGxJbWFnZXMoKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlTmlkZ2V0ID0gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgICAgdGhpcy5fYWN0aXZlTmlkZ2V0LnNob3coKTtcbiAgICB9XG5cbiAgICBnZXQgYWN0aXZlTmlkZ2V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlTmlkZ2V0O1xuICAgIH1cblxuICAgIHNldCBzdGF0ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcImRhdGEtc3RhdGVcIiwgdmFsdWUpO1xuICAgIH1cblxuICAgIGdldCBzdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiKTtcbiAgICB9XG5cbiAgICB0ZXN0QWxwaGEoeCwgeSkge1xuICAgICAgICBsZXQgcGl4ZWwgPSB0aGlzLmFjdGl2ZU5pZGdldC5nZXRQaXhlbCh4LCB5KTtcbiAgICAgICAgcmV0dXJuIHBpeGVsWzNdID4gdGhpcy5hbHBoYVRvbGVyYW5jZTtcbiAgICB9XG5cbiAgICBtb3VzZUxlYXZlKCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJvdXRcIjtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgfVxuXG4gICAgbW91c2VBY3RpdmUoKSB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBcImhvdmVyXCI7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcbiAgICB9XG5cbiAgICBtb3VzZU1vdmUoZSkge1xuICAgICAgICBpZiAoIXRoaXMudGVzdEFscGhhKGUuY2xpZW50WCwgZS5jbGllbnRZKSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XG4gICAgICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcbiAgICAgICAgfVxuICAgIH1cbn1cbjtcblxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWJ1dHRvbicsIE5pZGdldEJ1dHRvbik7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEJ1dHRvbjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcclxuXHJcbmNsYXNzIE5pZGdldEJ1dHRvblNldCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcclxuICAgICAgICB0aGlzLmFscGhhVG9sZXJhbmNlID0gMDsgLy8gYWxwaGEgbmVlZHMgdG8gYmUgPiB0b2xlcmFuY2UgdG8gdHJpZ2dlciBldmVudHMuXHJcblxyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCB0aGlzLm1vdXNlUHJlc3MpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVJlbGVhc2UpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm1vdXNlTW92ZSk7XHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCB0aGlzLm1vdXNlTGVhdmUpO1xyXG5cclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBuaWRnZXRSZWFkeSgpe1xyXG4gICAgICAgIHRoaXMuYnV0dG9ucyA9IHRoaXMucXVlcnlTZWxlY3RvckFsbChcIm5pZGdldC1idXR0b25cIik7XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VQcmVzcyhlKXtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlUHJlc3MoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcInByZXNzXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VSZWxlYXNlKGUpe1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5idXR0b25zKSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzVW5kZXIoZSkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnN0YXRlID09IFwicHJlc3NcIil7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudChcImJ1dHRvbi1jbGlja2VkXCIsIHtkZXRhaWw6IGVsZW1lbnR9KSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlUmVsZWFzZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3VzZU1vdmUoZSl7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpe1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm1vdXNlQWN0aXZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZUxlYXZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VMZWF2ZShlKXtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBlbGVtZW50Lm1vdXNlTGVhdmUoKTtcclxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldCBzdGF0ZSh2YWx1ZSl7XHJcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIsIHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgc3RhdGUoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtYnV0dG9uLXNldCcsIE5pZGdldEJ1dHRvblNldCk7XHJcbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0QnV0dG9uU2V0OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBOaWRnZXQgdGhhdCBjaGFuZ2VzIHRoZSBpbWFnZSBmb3IgaG92ZXIsIGRpc2FibGVkLCBwcmVzcywgYW5kIGlkbGUuXG4gKiBGaXJlcyBhIGNsaWNrIGV2ZW50IHdoZW4gY2xpY2tlZC5cbiAqIFxuICogVGhpcyBpcyB0aGUgaHRtbCBlbGVtZW50IFwibmlkZ2V0LWJ1dHRvblwiLlxuICogSWYgdGhlIG5pZGdldC1idXR0b24gaGFzIHRoZSBhdHRyaWJ1dGUgYGltZy1wcmVmaXggPSBcInByZWZpeFwiYCB0aGVuIHRoZSBcbiAqIGZvbGxvd2luZyBpbWFnZXMuICBgaW1nLXN1ZmZpeGAgPSBcInN1ZmZpeFwiIHdpbGwgb3ZlcnJpZGUgdGhlIFwiLnBuZ1wiLlxuICogd2lsbCBiZSB1c2VkOlxuICogLSBwcmVmaXgtaG92ZXIucG5nXG4gKiAtIHByZWZpeC1kaXNhYmxlZC5wbmdcbiAqIC0gcHJlZml4LXByZXNzLnBuZ1xuICogLSBwcmVmaXgtaWRsZS5wbmdcbiAqL1xuY2xhc3MgTmlkZ2V0QnV0dG9uU3RhdGUgZXh0ZW5kcyBOaWRnZXQge1xuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgbmlkZ2V0UmVhZHkoKXtcbiAgICAgICAgdGhpcy5pbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICAgICAgICB0aGlzLmltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdGhpcy5nZXRBdHRyaWJ1dGUoXCJpbWFnZS1zcmNcIikpO1xuICAgICAgICB0aGlzLmFwcGVuZCh0aGlzLmltZyk7XG4gICAgfVxuXG4gICAgc2hvdygpe1xuICAgICAgICBzdXBlci5zaG93KCk7XG4gICAgICAgIHRoaXMubG9hZENhbnZhcygpO1xuICAgIH1cblxuICAgIGxvYWRDYW52YXMoKXtcbiAgICAgICAgaWYgKCF0aGlzLmltZyB8fCB0aGlzLmNhbnZhcykgcmV0dXJuO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuaW1nLm5hdHVyYWxXaWR0aDtcbiAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5pbWcubmF0dXJhbEhlaWdodDtcbiAgICAgICAgdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5kcmF3SW1hZ2UodGhpcy5pbWcsIDAsIDApO1xuICAgICAgICByZXR1cm4gdGhpcy5jYW52YXM7XG4gICAgfVxuXG4gICAgZ2V0UGl4ZWwoeCwgeSl7XG4gICAgICAgIHRoaXMubG9hZENhbnZhcygpO1xuICAgICAgICBsZXQgZHggPSB0aGlzLmNhbnZhcy53aWR0aCAvIHRoaXMub2Zmc2V0V2lkdGg7XG4gICAgICAgIGxldCBkeSA9IHRoaXMuY2FudmFzLmhlaWdodCAvIHRoaXMub2Zmc2V0SGVpZ2h0O1xuICAgICAgICBsZXQgcGl4ZWwgPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLmdldEltYWdlRGF0YShkeCAqIHgsIGR5ICogeSwgMSwgMSkuZGF0YTtcbiAgICAgICAgcmV0dXJuIHBpeGVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCBzdGF0ZSB0byBIT1ZFUiwgRElTQUJMRUQsIFBSRVNTLCBJRExFLlxuICAgICAqIEBwYXJhbSB7dHlwZX0gc3RhdGVcbiAgICAgKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgc2V0IHN0YXRlKHN0YXRlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwic3RhdGVcIiwgc3RhdGUudG9VcHBlckNhc2UoKSk7XG4gICAgfVxuXG4gICAgZ2V0IHN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyaWJ1dGUoXCJzdGF0ZVwiKTtcbiAgICB9XG5cbiAgICBzZXQgc291cmNlKGltZykge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInNyY1wiLCBpbWcpO1xuICAgIH1cblxuICAgIGdldCBzb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEF0dHJpYnV0ZShcInNyY1wiKTtcbiAgICB9XG59XG47XG5cbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1idXR0b24tc3RhdGUnLCBOaWRnZXRCdXR0b25TdGF0ZSk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEJ1dHRvblN0YXRlO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyoqXG4gKiBBIGNvbXBvbmVudCB0aGF0IGhhcyBldmVudHMgZm9yIGFkZGluZyBuaWRnZXRzLCByZW1vdmluZyBuaWRnZXRzLCBhbmQgXG4gKiByZXNpemluZyB0aGUgY29udGFpbmVyLiAgV2hlbiB0aGUgY29udGFpbmVyIHNpemUgaXMgY2hhbmdlZCwgdGhlIG51bWJlclxuICogb2YgY29tcG9uZW50cyBjaGFuZ2UsIG9yIHRoZSBsYXlvdXQgYXR0cmlidXRlIGNoYW5nZXMsIHRoZSBkb0xheW91dCBmdW5jdGlvblxuICogaXMgY2FsbGVkLlxuICogXG4gKiBUaGUgY29tcG9uZW50cyBhcmUgYXJyYWdlZCBhY2NvcmRpbmcgdG8gdGhlIHNlbGVjdGVkIGxheW91dCBhdHRyaWJ1dGUuICBJZiBcbiAqIG5vIGxheW91dCBhdHRyaWJ1dGUgaXMgY2hvc2VuLCBkb0xheW91dCBpcyBzdGlsbCBjYWxsZWQgYXMgaXQgaXMgYXNzdW1lZCBcbiAqIGEgY3VzdG9tIGZ1bmN0aW9uIGhhcyBiZWVuIHByb3ZpZGVkLlxuICovXG5cbmNsYXNzIE5pZGdldENvbnRhaW5lciBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgICAgICBsZXQgcmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIodGhpcy5kb0xheW91dCk7XG4gICAgICAgIHJlc2l6ZU9ic2VydmVyLm9ic2VydmUodGhpcyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBvYnNlcnZlZEF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIHJldHVybiBbTmlkZ2V0Q29udGFpbmVyLmxheW91dEF0dHJpYnV0ZV07XG4gICAgfVxuXG4gICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKG5hbWUsIG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgICBpZiAob2xkVmFsdWUgPT09IG5ld1ZhbHVlKSByZXR1cm47XG4gICAgICAgIHRoaXMuZG9MYXlvdXQoKTtcbiAgICB9XG5cbiAgICBzZXQgbGF5b3V0KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKE5pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgbGF5b3V0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0Q29udGFpbmVyLmxheW91dEF0dHJpYnV0ZSk7XG4gICAgfSAgICAgIFxuXG4gICAgZG9MYXlvdXQoKSB7XG4gICAgICAgIGlmICghdGhpcy5sYXlvdXQpIHJldHVybjtcbiAgICAgICAgaWYgKCFMYXlvdXRzW3RoaXMubGF5b3V0XSkgdGhyb3cgYGludmFsaWQgbGF5b3V0OiAke3RoaXMubGF5b3V0fWA7XG4gICAgICAgIExheW91dHNbdGhpcy5sYXlvdXRdO1xuICAgIH1cbn1cblxuY2xhc3MgTGF5b3V0cyB7XG4gICAgLyoqXG4gICAgICogRml0IGFsbCBuaWRnZXRzIGV2ZW5seSBpbiBhIGhvcml6b250YWwgcm93LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gbmlkZ2V0XG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHN0YXRpYyByb3cobmlkZ2V0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc2l6ZSk7XG4gICAgfVxufVxuXG5cbk5pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGUgPSBcImxheW91dFwiO1xud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWNvbnRhaW5lcicsIE5pZGdldENvbnRhaW5lcik7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldENvbnRhaW5lcjsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRcIik7XG5jb25zdCBUcmFuc2Zvcm1lciA9IHJlcXVpcmUoXCIuLi9UcmFuc2Zvcm1lclwiKTtcblxuLyoqXG4gKiBEb24ndCBmb3JnZXQgdG8gc2V0ICdpcycgd2hlbiBwdXR0aW5nIGVsZW1lbnQgZGlyZWN0bHkgaW4gaHRtbCBhcyBvcHBvc2VkIHRvXG4gKiBwcm9ncmFtaWNhbGx5LlxuICogPGltZyBpcz1cInJlZ2lzdGVyZWQtbmFtZVwiIHNyYz1cImltYWdlLnBuZ1wiPjwvaW1nPlxuICogXG4gKiBpbmNsdWRlIGEgY3VzdG9tIGVsZW1lbnQgZGVmaW5pdGlvbiBhdCB0aGUgZW5kIG9mIHRoZSBjbGFzcy48YnI+XG4gKiB3aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdyZWdpc3RlcmVkLW5hbWUnLCBDbGFzcywge2V4dGVuZHM6IFwiaW1nXCJ9KTtcbiAqL1xuY2xhc3MgTmlkZ2V0SFRNTEltYWdlIGV4dGVuZHMgSFRNTEltYWdlRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubGFzdERpc3BsYXkgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtZXIodGhpcyk7XG4gICAgfVxuXG4gICAgc2NhbGUoZHcsIGRoKSB7XG4gICAgICAgIGlmICghZGgpIGRoID0gZHc7XG4gICAgICAgIGxldCB3ID0gdGhpcy53aWR0aCAqIGR3O1xuICAgICAgICBsZXQgaCA9IHRoaXMuaGVpZ2h0ICogZGg7XG4gICAgICAgIHRoaXMud2lkdGggPSB3O1xuICAgICAgICB0aGlzLmhlaWdodCA9IGg7XG4gICAgfSAgICAgICAgXG5cbiAgICBzZXQgc3JjKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwic3JjXCIsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgc3JjKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoXCJzcmNcIik7XG4gICAgfVxuXG4gICAgbG9jYXRlKGxlZnQsIHRvcCkge1xuICAgICAgICB0aGlzLmxlZnQgPSBsZWZ0O1xuICAgICAgICB0aGlzLnRvcCA9IHRvcDtcbiAgICB9XG5cbiAgICBnZXQgbGVmdCgpIHtcbiAgICAgICAgbGV0IHcgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5sZWZ0O1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh3KTtcbiAgICB9XG5cbiAgICBnZXQgdG9wKCkge1xuICAgICAgICBsZXQgaCA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMpLnRvcDtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaCk7XG4gICAgfVxuXG4gICAgc2V0IGxlZnQodmFsdWUpIHtcbiAgICAgICAgdGhpcy5zdHlsZS5sZWZ0ID0gdmFsdWUgKyBcInB4XCI7XG4gICAgfVxuXG4gICAgc2V0IHRvcCh2YWx1ZSkge1xuICAgICAgICB0aGlzLnN0eWxlLnRvcCA9IHZhbHVlICsgXCJweFwiO1xuICAgIH0gICAgXG5cbiAgICBzZXQgd2lkdGgodykge1xuICAgICAgICB0aGlzLnN0eWxlLndpZHRoID0gdyArIFwicHhcIjtcbiAgICB9XG5cbiAgICBzZXQgaGVpZ2h0KHcpIHtcbiAgICAgICAgdGhpcy5zdHlsZS5oZWlnaHQgPSB3ICsgXCJweFwiO1xuICAgIH1cblxuICAgIGdldCB3aWR0aCgpIHtcbiAgICAgICAgbGV0IHcgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS53aWR0aDtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodyk7XG4gICAgfVxuXG4gICAgZ2V0IGhlaWdodCgpIHtcbiAgICAgICAgbGV0IGggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5oZWlnaHQ7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGgpO1xuICAgIH0gICAgICAgIFxuXG4gICAgc2hvdygpIHtcbiAgICAgICAgaWYgKHRoaXMubGFzdERpc3BsYXkpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IHRoaXMubGFzdERpc3BsYXk7XG4gICAgICAgICAgICB0aGlzLmxhc3REaXNwbGF5ID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gXCJpbmxpbmUtYmxvY2tcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhpZGUoKSB7XG4gICAgICAgIHRoaXMubGFzdERpc3BsYXkgPSB0aGlzLnN0eWxlLmRpc3BsYXk7XG4gICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIH1cblxuICAgIHNldCBkaXNwbGF5KHZhbHVlKXtcbiAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gdmFsdWU7XG4gICAgfVxuICAgIFxuICAgIGdldCBkaXNwbGF5KCl7XG4gICAgICAgIHJldHVybiB3aW5kb3cuY2FsY3VsYXRlU3R5bGUodGhpcylbXCJkaXNwbGF5XCJdO1xuICAgIH1cblxuICAgIGRldGFjaCgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHRoaXMpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHNldCBkaXNhYmxlZCh2YWx1ZSl7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGdldCBkaXNhYmxlZCgpe1xuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0cmlidXRlKFwiZGlzYWJsZWRcIikpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIik7XG4gICAgfSAgICBcbiAgICBcbiAgICBjbGVhclBvcygpe1xuICAgICAgICB0aGlzLnN0eWxlLnRvcCA9IG51bGw7XG4gICAgICAgIHRoaXMuc3R5bGUubGVmdCA9IG51bGw7XG4gICAgfVxuXG4gICAgY2xlYXJEaW1zKCl7XG4gICAgICAgIHRoaXMuc3R5bGUud2lkdGggPSBudWxsO1xuICAgICAgICB0aGlzLnN0eWxlLmhlaWdodCA9IG51bGw7XG4gICAgfSAgICBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRIVE1MSW1hZ2U7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyoqXG4gKiBBIE5pZGdldCB0aGF0IGNvbnRhaW5zIGltYWdlcy5cbiAqL1xuY2xhc3MgTmlkZ2V0SW1hZ2UgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKHNyYyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgaWYgKHNyYykgdGhpcy5zcmMgPSBzcmM7XG4gICAgfVxuXG4gICAgY29ubmVjdGVkQ2FsbGJhY2soKXtcbiAgICAgICAgbGV0IHNyYyA9IHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldEltYWdlLnNyY0F0dHJpYnV0ZSk7ICAgICAgICBcbiAgICAgICAgaWYgKHNyYykgdGhpcy5pbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIHNyYyk7ICAgICAgIFxuICAgICAgICB0aGlzLmFwcGVuZENoaWxkKHRoaXMuaW1nKTtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICB9XG5cbiAgICBnZXQgc3JjKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmltZy5nZXRBdHRyaWJ1dGUoXCJzcmNcIik7XG4gICAgfVxuXG4gICAgc2V0IHNyYyh2YWx1ZSl7XG4gICAgICAgIHRoaXMuaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgc2l6ZSh3aWR0aCwgaGVpZ2h0KXtcbiAgICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IHdpZHRoXG4gICAgICAgIHRoaXMuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgICAgIHRoaXMuaW1nLnN0eWxlLndpZHRoID0gd2lkdGhcbiAgICAgICAgdGhpcy5pbWcuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0XG4gICAgfVxuICAgIFxuICAgIHNjYWxlKGR3LCBkaCl7XG4gICAgICAgIGlmICghZGgpIGRoID0gZHc7XG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMub2Zmc2V0V2lkdGggKiBkdztcbiAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMub2Zmc2V0SGVpZ2h0ICogZGg7XG4gICAgICAgIHRoaXMuc2l6ZShgJHt3aWR0aH1weGAsIGAke2hlaWdodH1weGApO1xuICAgIH1cbiAgICBcbiAgICBzaG93KCl7XG4gICAgICAgIGlmICh0aGlzLnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiKXtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnN0eWxlLmRpc3BsYXk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaGlkZSgpe1xuICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG59XG5cbk5pZGdldEltYWdlLnNyY0F0dHJpYnV0ZSA9IFwic3JjXCI7XG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtaW1hZ2UnLCBOaWRnZXRJbWFnZSk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEltYWdlOyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIFdoZW4gdXNpbmcgLS1uaWRnZXQtZml0LXRleHQsIGRvIG5vdCBpbmNsdWRlIGhlaWdodCBhbmQgd2lkdGggYXR0cmlidXRlcy5cbiAqIEEgZm9udCBzaXplIGNhbiBiZSB1c2VkIGFzIGEgc3RhcnRpbmcgcG9pbnQuXG4gKi9cbmNsYXNzIEZpdFRleHQge1xuICAgIGNvbnN0cnVjdG9yKG5pZGdldCl7XG4gICAgICAgIHRoaXMubmlkZ2V0ID0gbmlkZ2V0O1xuICAgICAgICB0aGlzLmxvY2sgPSBcIm5vbmVcIjtcbiAgICAgICAgdGhpcy5wYXJzZUFyZ3VtZW50cygpO1xuICAgIH1cblxuICAgIGxpc3Rlbigpe1xuICAgICAgICB0aGlzLm9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKCgpPT50aGlzLmRlbGF5UmVzaXplKHRoaXMuaFZhbHVlLCB0aGlzLndWYWx1ZSkpO1xuICAgICAgICB0aGlzLm9ic2VydmVyLm9ic2VydmUodGhpcy5uaWRnZXQucGFyZW50RWxlbWVudCk7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcbiAgICAgICAgdGhpcy5kZWxheSA9IDI1O1xuICAgICAgICB0aGlzLmRlbGF5UmVzaXplKHRoaXMuaFZhbHVlLCB0aGlzLndWYWx1ZSk7XG4gICAgICAgIHRoaXMuc3RvcCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGRlbGF5UmVzaXplKGhWYWx1ZSwgd1ZhbHVlKXtcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAwO1xuICAgICAgICBpZiAodGhpcy50aW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+dGhpcy5vblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSksIHRoaXMuZGVsYXkpO1xuICAgIH1cblxuICAgIG5vdGlmeShoVmFsdWUsIHdWYWx1ZSl7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm90aWZ5XCIpO1xuICAgICAgICB0aGlzLnN0b3AgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZWxheVJlc2l6ZShoVmFsdWUsIHdWYWx1ZSk7XG4gICAgfVxuXG4gICAgcGFyc2VBcmd1bWVudHMoKXtcbiAgICAgICAgbGV0IGFyZ3MgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtZml0LXRleHRcIik7XG5cbiAgICAgICAgaWYgKCFhcmdzIHx8IGFyZ3MgPT09IGZhbHNlIHx8IGFyZ3MgPT09IFwiZmFsc2VcIil7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhWYWx1ZSA9IHRoaXMud1ZhbHVlID0gdHJ1ZTtcblxuICAgICAgICBpZiAodHlwZW9mKGFyZ3MpID09IFwic3RyaW5nXCIpe1xuICAgICAgICAgICAgbGV0IG9iaiA9IEpTT04ucGFyc2UoYXJncyk7XG4gICAgICAgICAgICBpZiAob2JqW1wiZml0XCJdICE9PSB1bmRlZmluZWQgJiYgb2JqW1wiZml0XCJdID09PSBcIndpZHRoXCIpIHRoaXMuaFZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAob2JqW1wiZml0XCJdICE9PSB1bmRlZmluZWQgJiYgb2JqW1wiZml0XCJdID09PSBcImhlaWdodFwiKSB0aGlzLndWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKG9ialtcImxvY2tcIl0gIT09IHVuZGVmaW5lZCkgdGhpcy5sb2NrID0gKG9ialtcImxvY2tcIl0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25SZXNpemUoaFZhbHVlLCB3VmFsdWUpe1xuICAgICAgICBkZWxldGUgdGhpcy50aW1lb3V0O1xuXG4gICAgICAgIGlmICh0aGlzLnN0b3ApIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMubmlkZ2V0LnRleHRDb250ZW50ID09PSBcIlwiKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRXaWR0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5uaWRnZXQuc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIpIHJldHVybjtcblxuICAgICAgICBpZiAoIWhWYWx1ZSAmJiAhd1ZhbHVlKSByZXR1cm47XG5cbiAgICAgICAgbGV0IGhEaXIgPSB0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldEhlaWdodCAtIHRoaXMubmlkZ2V0LnNjcm9sbEhlaWdodDtcbiAgICAgICAgbGV0IHdEaXIgPSB0aGlzLm5pZGdldC5wYXJlbnRFbGVtZW50Lm9mZnNldFdpZHRoIC0gdGhpcy5uaWRnZXQuc2Nyb2xsV2lkdGg7XG5cbiAgICAgICAgaWYgKCFoVmFsdWUpIGhEaXIgPSAwO1xuICAgICAgICBpZiAoIXdWYWx1ZSkgd0RpciA9IDA7XG5cbiAgICAgICAgbGV0IGRpciA9IE1hdGguc2lnbihoRGlyIHwgd0Rpcik7IC8vIHdpbGwgcHJlZmVyIHRvIHNocmlua1xuICAgICAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09IDApIHRoaXMuZGlyZWN0aW9uID0gZGlyOyAvLyBrZWVwIHByZXZpb3VzIGRpcmVjdGlvblxuXG4gICAgICAgIGxldCBmb250U2l6ZSA9IHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpW1wiZm9udC1zaXplXCJdKVxuICAgICAgICBsZXQgbmV3U2l6ZSA9IGZvbnRTaXplICsgKHRoaXMuZGlyZWN0aW9uKTtcblxuICAgICAgICBpZiAobmV3U2l6ZSAhPT0gZm9udFNpemUgJiYgdGhpcy5kaXJlY3Rpb24gPT09IGRpcikge1xuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBuZXdTaXplICsgXCJweFwiO1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZW91dCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT50aGlzLm9uUmVzaXplKGhWYWx1ZSwgd1ZhbHVlKSwgdGhpcy5kZWxheSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGlyIDwgMCAmJiB0aGlzLmRpcmVjdGlvbiA+IDApIHsgLy8gcmV2ZXJzZSBkaXJlY3Rpb24gaWYgZ3Jvd2luZyB0b28gbGFyZ2VcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gLTE7XG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT50aGlzLm9uUmVzaXplKGhWYWx1ZSwgd1ZhbHVlKSwgdGhpcy5kZWxheSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5sb2NrID09PSBcInZoXCIpIHtcbiAgICAgICAgICAgICAgICBsZXQgZm9udFJhdGlvID0gbmV3U2l6ZSAvIHdpbmRvdy5pbm5lckhlaWdodCAqIDEwMDtcbiAgICAgICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IGZvbnRSYXRpbyArIFwidmhcIjtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmxvY2sgPT09IFwidndcIil7XG4gICAgICAgICAgICAgICAgbGV0IGZvbnRSYXRpbyA9IG5ld1NpemUgLyB3aW5kb3cuaW5uZXJXaWR0aCAqIDEwMDtcbiAgICAgICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IGZvbnRSYXRpbyArIFwidndcIjtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAwO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEEgbmlkZ2V0IGVsZW1lbnQgZm9yIGRpc3BsYXlpbmcgdGV4dC5cbiAqIHB1dCAnLS1uaWRnZXQtZml0LXRleHQ6IDEuMDsnIGludG8gY3NzIGZvciB0aGlzIGVsZW1lbnQgdG8gZW5hYmxlIHNjYWxpbmcuXG4gKiBzZWU6IE5pZGdldFN0eWxlLmpzXG4gKi9cbmNsYXNzIE5pZGdldFRleHQgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLm9ic2VydmVyc1tcImZpdC10ZXh0LXdpZHRoLXRvbGVyYW5jZVwiXSA9IDAuMDI7XG4gICAgICAgIHRoaXMuZml0VGV4dCA9IG5ldyBGaXRUZXh0KHRoaXMpO1xuICAgIH1cblxuICAgIHJlbW92ZSgpe1xuICAgICAgICBpZiAodGhpcy5maXRUZXh0KSB7XG4gICAgICAgICAgICB0aGlzLmZpdFRleHQuc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmZpdFRleHQub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyLnJlbW92ZSgpO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgICAgICBsZXQgZml0UHJvcCA9IGdldENvbXB1dGVkU3R5bGUodGhpcykuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0XCIpO1xuXG4gICAgICAgIGlmIChmaXRQcm9wICE9PSB1bmRlZmluZWQgJiYgZml0UHJvcCAhPT0gXCJcIil7XG4gICAgICAgICAgICB0aGlzLmZpdFRleHQubGlzdGVuKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXQgdGV4dCh2YWx1ZSl7XG4gICAgICAgIHRoaXMuaW5uZXJUZXh0ID0gdmFsdWU7XG4gICAgICAgIGlmICh0aGlzLmZpdFRleHQgJiYgdGhpcy5maXRUZXh0LnN0b3AgPT09IGZhbHNlKXtcbiAgICAgICAgICAgIHRoaXMuZml0VGV4dC5kZWxheVJlc2l6ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHRleHQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5uZXJUZXh0O1xuICAgIH1cblxuICAgIHNjYWxlKGFtb3VudCkge1xuICAgICAgICBsZXQgc3R5bGVGb250U2l6ZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoXCJmb250LXNpemVcIik7XG4gICAgICAgIGxldCBmb250U2l6ZSA9IHBhcnNlRmxvYXQoc3R5bGVGb250U2l6ZSk7XG4gICAgICAgIHRoaXMuc3R5bGUuZm9udFNpemUgPSAoZm9udFNpemUgKiBhbW91bnQpICsgXCJweFwiO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgbGluZSBoZWlnaHQgdG8gdGhlIG9mZnNldCBoZWlnaHQgbXVsdGlwbGllZCBieSByYXRpby5cbiAgICAgKiBDYWxsaW5nIHRoaXMgbWV0aG9kIGRpcmVjdG9yeSB3aWxsIG92ZXJyaWRlIHRoZSB2YWx1ZSBzZXQgYnkgY3NzXG4gICAgICovXG4gICAgbmlkZ2V0VmVydEFsaWduVGV4dCh2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkoXCItLW5pZGdldC12ZXJ0LWFsaWduLXRleHRcIiwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9uUmVzaXplID0gKCkgPT4ge1xuICAgICAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1uaWRnZXQtdmVydC1hbGlnbi10ZXh0XCIpO1xuICAgICAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xuICAgICAgICAgICAgbGV0IGggPSB0aGlzLm9mZnNldEhlaWdodCAqIHJhdGlvO1xuICAgICAgICAgICAgdGhpcy5zdHlsZS5saW5lSGVpZ2h0ID0gaCArIFwicHhcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9ic2VydmVycy52ZXJ0QWxpZ25UZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLnZlcnRBbGlnblRleHQgPSBuZXcgUmVzaXplT2JzZXJ2ZXIob25SZXNpemUpO1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMudmVydEFsaWduVGV4dC5vYnNlcnZlKHRoaXMpXG4gICAgICAgIH1cbiAgICAgICAgb25SZXNpemUoKVxuICAgIH1cblxuICAgIHZlcnRBbGlnblRleHQocmF0aW8gPSAxLjApe1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47XG4gICAgICAgIGxldCBoID0gdGhpcy5vZmZzZXRIZWlnaHQgKiByYXRpbztcbiAgICAgICAgdGhpcy5zdHlsZS5saW5lSGVpZ2h0ID0gaCArIFwicHhcIjtcbiAgICB9XG59XG47XG5cbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC10ZXh0JywgTmlkZ2V0VGV4dCk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldFRleHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBkcmFnSGFuZGxlciA9IHJlcXVpcmUoXCIuLi9EcmFnSGFuZGxlclwiKS5pbnN0YW5jZTtcblxuXG5mdW5jdGlvbiBvbkRyYWdTdGFydChldmVudCl7ICAgIFxuICAgIGRyYWdIYW5kbGVyLnNldCh0aGlzKTtcbiAgICB3aW5kb3cueCA9IHRoaXM7XG4gICAgY29uc29sZS5sb2coXCInXCIgKyB0aGlzLm5hbWUoKSArIFwiJ1wiKTtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdTdGFydFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25EcmFnRW5kKGV2ZW50KXtcbiAgICBpZiAoZHJhZ0hhbmRsZXIuZ2V0KCkgIT09IHRoaXMpIHJldHVybjtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyYWdFbmRcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG4gICAgZHJhZ0hhbmRsZXIuY2xlYXIoKTtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5zZXRBdHRyaWJ1dGUoXCJkcmFnZ2FibGVcIiwgXCJ0cnVlXCIpOyAgIFxuICAgIFxuICAgIG5pZGdldC5vbkRyYWdTdGFydCA9IG9uRHJhZ1N0YXJ0LmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25EcmFnRW5kID0gb25EcmFnRW5kLmJpbmQobmlkZ2V0KTtcbiAgICBcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnc3RhcnRcIiwgbmlkZ2V0Lm9uRHJhZ1N0YXJ0KTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcmFnZW5kXCIsIG5pZGdldC5vbkRyYWdFbmQpOyAgICBcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBkcmFnSGFuZGxlciA9IHJlcXVpcmUoXCIuLi9EcmFnSGFuZGxlclwiKS5pbnN0YW5jZTtcbmNvbnN0IE1vdXNlVXRpbGl0aWVzID0gcmVxdWlyZShcIi4uL01vdXNlVXRpbGl0aWVzXCIpO1xuXG5mdW5jdGlvbiBvbkRyYWdPdmVyKGV2ZW50KXtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxldCBkcmFnTmlkZ2V0ID0gZHJhZ0hhbmRsZXIuZ2V0KCk7XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnT3ZlclwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzLCBkcmFnTmlkZ2V0KTtcbn1cblxuZnVuY3Rpb24gb25EcmFnRW50ZXIoZXZlbnQpe1xuICAgIGlmICghZHJhZ0hhbmRsZXIuaGFzKCkpIHJldHVybjtcbiAgICBpZiAoIWRyYWdIYW5kbGVyLnB1c2hPdmVyKHRoaXMpKSByZXR1cm47XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnRW50ZXJcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uRHJhZ0xlYXZlKGV2ZW50KXtcbiAgICBpZiAoIWRyYWdIYW5kbGVyLmhhcygpKSByZXR1cm47XG4gICAgaWYgKE1vdXNlVXRpbGl0aWVzLmlzVW5kZXIodGhpcy5nZXRFbGVtZW50KCkpKSByZXR1cm47XG4gICAgaWYgKCFkcmFnSGFuZGxlci5yZW1vdmVPdmVyKHRoaXMpKSByZXR1cm47XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnTGVhdmVcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uRHJvcChldmVudCl7XG4gICAgbGV0IGRyYWdOaWRnZXQgPSBkcmFnSGFuZGxlci5nZXQoKTtcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcImRyb3BcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcywgZHJhZ05pZGdldCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBuaWRnZXQub25EcmFnT3ZlciA9IG9uRHJhZ092ZXIuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbkRyb3AgPSBvbkRyb3AuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbkRyYWdFbnRlciA9IG9uRHJhZ0VudGVyLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25EcmFnTGVhdmUgPSBvbkRyYWdMZWF2ZS5iaW5kKG5pZGdldCk7XG4gICAgXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ292ZXJcIiwgbmlkZ2V0Lm9uRHJhZ092ZXIpO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyb3BcIiwgbmlkZ2V0Lm9uRHJvcCk7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VudGVyXCIsIG5pZGdldC5vbkRyYWdFbnRlcik7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2xlYXZlXCIsIG5pZGdldC5vbkRyYWdMZWF2ZSk7ICAgIFxufTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE1vdXNlVXRpbGl0aWVzID0gcmVxdWlyZShcIi4uL01vdXNlVXRpbGl0aWVzXCIpO1xuXG5mdW5jdGlvbiBvbkNsaWNrKGV2ZW50KXsgICAgXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJjbGlja1wiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZURvd24oZXZlbnQpeyAgICBcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcIm1vdXNlRG93blwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZVVwKGV2ZW50KXsgICAgXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZVVwXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlRW50ZXIoZXZlbnQpeyAgICBcbiAgICB0aGlzLm5vdGlmeUxpc3RlbmVycyhcIm1vdXNlRW50ZXJcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VMZWF2ZShldmVudCl7XG4gICAgaWYgKE1vdXNlVXRpbGl0aWVzLmlzVW5kZXIodGhpcy5nZXRFbGVtZW50KCkpKSByZXR1cm47XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZUV4aXRcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBjb25zb2xlLmxvZyhcIm1vdXNlIHNldHVwXCIpO1xuICAgIFxuICAgIG5pZGdldC5vbkNsaWNrID0gb25DbGljay5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uTW91c2VEb3duID0gb25Nb3VzZURvd24uYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbk1vdXNlVXAgPSBvbk1vdXNlVXAuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbk1vdXNlRW50ZXIgPSBvbk1vdXNlRW50ZXIuYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbk1vdXNlTGVhdmUgPSBvbk1vdXNlTGVhdmUuYmluZChuaWRnZXQpO1xuICAgIFxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIG5pZGdldC5vbkNsaWNrKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgbmlkZ2V0Lm9uTW91c2VEb3duKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIG5pZGdldC5vbk1vdXNlVXApO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgbmlkZ2V0Lm9uTW91c2VFbnRlcik7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgbmlkZ2V0Lm9uTW91c2VMZWF2ZSk7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogRW5hYmxlIHRoZSBuaWRnZXQgdG8gYmUgbW92ZWQgYnkgZHJhZ2dpbmcuICBXaWxsIGRyYWcgYnkgYW55IGNoaWxkIGVsZWVtZW50XG4gKiB0aGUgJy5uaWRnZXQtaGVhZGVyJyBjbGFzcywgb3RoZXJ3aXNlIG1vdmFibGUgYnkgY2xpY2tpbmcgYW55d2hlcmUuXG4gKiBAcGFyYW0ge3R5cGV9IGVcbiAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAqL1xuXG5mdW5jdGlvbiBvbk1vdXNlTW92ZShlKXsgICAgXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICghdGhpcy5fX21vdmFibGUuYWN0aXZlKSByZXR1cm47ICAgIFxuXG4gICAgLy8gY2FsY3VsYXRlIHRoZSBuZXcgY3Vyc29yIHBvc2l0aW9uOlxuICAgIGxldCBkZWx0YVggPSB0aGlzLl9fbW92YWJsZS5sYXN0WCAtIGUuY2xpZW50WDtcbiAgICBsZXQgZGVsdGFZID0gdGhpcy5fX21vdmFibGUubGFzdFkgLSBlLmNsaWVudFk7XG4gICAgdGhpcy5fX21vdmFibGUubGFzdFggPSBlLmNsaWVudFg7XG4gICAgdGhpcy5fX21vdmFibGUubGFzdFkgPSBlLmNsaWVudFk7XG4gICAgXG4gICAgLy8gc2V0IHRoZSBlbGVtZW50J3MgbmV3IHBvc2l0aW9uOlxuICAgIHRoaXMuc3R5bGUudG9wID0gKHRoaXMub2Zmc2V0VG9wIC0gZGVsdGFZKSArIFwicHhcIjtcbiAgICB0aGlzLnN0eWxlLmxlZnQgPSAodGhpcy5vZmZzZXRMZWZ0IC0gZGVsdGFYKSArIFwicHhcIjtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZURvd24oZSl7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMuX19tb3ZhYmxlLmFjdGl2ZSA9IHRydWU7XG4gICAgXG4gICAgLy8gZ2V0IHRoZSBtb3VzZSBjdXJzb3IgcG9zaXRpb24gYXQgc3RhcnR1cDpcbiAgICB0aGlzLl9fbW92YWJsZS5sYXN0WCA9IGUuY2xpZW50WDtcbiAgICB0aGlzLl9fbW92YWJsZS5sYXN0WSA9IGUuY2xpZW50WTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZVVwKGUpe1xuICAgIHRoaXMuX19tb3ZhYmxlLmFjdGl2ZSA9IGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgbmlkZ2V0Ll9fbW92YWJsZSA9IHtcbiAgICAgICAgbGFzdFggOiAwLFxuICAgICAgICBsYXN0WSA6IDAsXG4gICAgICAgIGFjdGl2ZSA6IGZhbHNlXG4gICAgfTtcbiAgICBcbiAgICBuaWRnZXQub25Nb3VzZURvd24gPSBvbk1vdXNlRG93bi5iaW5kKG5pZGdldCk7ICAgICAgICBcbiAgICBcbiAgICBpZiAobmlkZ2V0LnF1ZXJ5U2VsZWN0b3IoXCIubmlkZ2V0LWhlYWRlclwiKSl7XG4gICAgICAgIG5pZGdldC5xdWVyeVNlbGVjdG9yKFwiLm5pZGdldC1oZWFkZXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBuaWRnZXQub25Nb3VzZURvd24pOyAgICAgICAgXG4gICAgfSBlbHNlIHtcbiAgICAgICAgbmlkZ2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgbmlkZ2V0Lm9uTW91c2VEb3duKTtcbiAgICB9XG4gICAgXG4gICAgbmlkZ2V0Lm9uTW91c2VNb3ZlID0gb25Nb3VzZU1vdmUuYmluZChuaWRnZXQpOyAgICBcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBuaWRnZXQub25Nb3VzZU1vdmUpO1xuXG4gICAgbmlkZ2V0Lm9uTW91c2VVcCA9IG9uTW91c2VVcC5iaW5kKG5pZGdldCk7ICAgIFxuICAgIG5pZGdldC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBuaWRnZXQub25Nb3VzZVVwKTtcblxufTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRcIik7XG53aW5kb3cuTmlkZ2V0ID0gTmlkZ2V0O1xuXG4vKipcbiAqIEFkZCBhIHJlc2l6ZSBvYnNlcnZlciB0byB0aGUgZWxlbWVudCB0aGF0IHdpbGwgY2FsbCBhIG9uUmVzaXplKCkgZnVuY3Rpb24uXG4gKiBUaGUgcGFyYW1ldGVycyBwYXNzZWQgaW4gYXJlIChwcmV2aW91c19kaW1lbnNpb25zKS4gIFRvIHVzZSBhZGRcbiAqIGludGVyZmFjZXM9XCJyZXNpemVcIiB0byB0aGUgZWxlbWVudCBpbiBodG1sIGFuZCBhIG1ldGhvZCBvblJlc2l6ZSgpIHRvIHRoZSBcbiAqIGNsYXNzIG9iamVjdC4gIElmIHRoZXJlIGlzIG5vIGNsYXNzIG9iamVjdCBjcmVhdGUgYSBmdW5jdGlvbiBhbmQgYmluZCBpdC5cbiAqIGllOiBlbGVtZW50Lm9uUmVzaXplID0gZnVuY3Rpb24uYmluZChlbGVtZW50KTsgXG4gKi9cblxubGV0IG9uUmVzaXplID0gZnVuY3Rpb24oKXtcbiAgICBsZXQgZGF0YSA9IHRoaXNbTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZF0ucmVzaXplO1xuICAgIGxldCBwcmV2ID0gZGF0YS5wcmV2O1xuICAgIGlmICghdGhpcy5vblJlc2l6ZSkgcmV0dXJuO1xuICAgIHRoaXMub25SZXNpemUocHJldik7XG4gICAgbG9hZFByZXZpb3VzKHRoaXMpO1xufTtcblxubGV0IGxvYWRQcmV2aW91cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgbGV0IGRhdGEgPSBuaWRnZXRbTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZF0ucmVzaXplO1xuICAgIGRhdGEucHJldiA9IHtcbiAgICAgICAgd2lkdGggOiBuaWRnZXQub2Zmc2V0V2lkdGgsXG4gICAgICAgIGhlaWdodCA6IG5pZGdldC5vZmZzZXRIZWlnaHRcbiAgICB9OyAgICBcbn07XG5cbi8qKlxuICogU2V0dXAgYSByZXNpemUgb2JzZXJ2ZXIgZm9yIHRoZSBuaWRnZXQgdGhhdCB0cmlnZ2VycyB0aGUgb25SZXNpemUgbWV0aG9kIGlmIFxuICogYXZhaWxhYmxlLlxuICogLSBvblJlc2l6ZSh0aGlzLCBwcmV2aW91c19kaW1lbnNpb25zKSA6IG5vbmVcbiAqIEBwYXJhbSB7dHlwZX0gbmlkZ2V0XG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmlkZ2V0KXtcbiAgICBpZiAodHlwZW9mKG5pZGdldCkgIT09IFwib2JqZWN0XCIpIHRocm93IG5ldyBcIk9iamVjdCBleGVjdGVkXCI7XG4gICAgbGV0IHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKG9uUmVzaXplLmJpbmQobmlkZ2V0KSk7XG4gICAgcmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZShuaWRnZXQpO1xuICAgIGxvYWRQcmV2aW91cyhuaWRnZXQpO1xufTsiLCIndXNlIHN0cmljdCc7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBBYnN0cmFjdE1vZGVsIDogcmVxdWlyZShcIi4vQWJzdHJhY3RNb2RlbFwiKSxcbiAgICBOaWRnZXRFbGVtZW50IDogcmVxdWlyZShcIi4vTmlkZ2V0RWxlbWVudFwiKSxcbiAgICBGaWxlT3BlcmF0aW9ucyA6IHJlcXVpcmUoXCIuL0ZpbGVPcGVyYXRpb25zXCIpLFxuICAgIE5pZGdldEJ1dHRvblNldCA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblNldFwiKSxcbiAgICBOaWRnZXRCdXR0b24gOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b25cIiksXG4gICAgTmlkZ2V0QnV0dG9uU3RhdGUgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b25TdGF0ZVwiKSxcbiAgICBOaWRnZXRJbWFnZSA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEltYWdlXCIpLFxuICAgIE5pZGdldEhUTUxJbWFnZSA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldEhUTUxJbWFnZVwiKSxcbiAgICBOaWRnZXRUZXh0IDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0VGV4dFwiKSxcbiAgICBOaWRnZXRDb250YWluZXIgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRDb250YWluZXJcIiksXG4gICAgTW91c2VVdGlsaXRpZXMgOiByZXF1aXJlKFwiLi9Nb3VzZVV0aWxpdGllc1wiKSxcbiAgICBDb25zdGFudHM6IHJlcXVpcmUoXCIuL05pZGdldFwiKSxcbiAgICBsYXlvdXRzOiB7fVxufTsiLCJjb25zdCBGaWxlT3BzID0gcmVxdWlyZShcIi4vbW9kdWxlcy9GaWxlT3BzLmpzXCIpO1xyXG5jb25zdCBBdXRoZW50aWNhdGUgPSByZXF1aXJlKFwiLi9tb2R1bGVzL0F1dGhlbnRpY2F0ZS5qc1wiKTtcclxuY29uc3QgTWVudSA9IHJlcXVpcmUoXCIuL21vZHVsZXMvTWVudS5qc1wiKTtcclxuY29uc3QgUXVlc3Rpb25QYW5lID0gcmVxdWlyZShcIi4vbW9kdWxlcy9RdWVzdGlvblBhbmUuanNcIik7XHJcbmNvbnN0IEVkaXRvclBhbmUgPSByZXF1aXJlKFwiLi9tb2R1bGVzL0VkaXRvclBhbmUuanNcIik7XHJcbmNvbnN0IE1vZGVsID0gcmVxdWlyZShcIi4vbW9kdWxlcy9Nb2RlbFwiKTtcclxuXHJcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCJAdGhhZXJpb3VzL25pZGdldFwiKVxyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL0dhbWVCb2FyZC5qc1wiKTtcclxucmVxdWlyZShcIi4vbW9kdWxlcy9NdWx0aXBsZUNob2ljZVBhbmUuanNcIik7XHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvQ2hlY2tCb3guanNcIik7XHJcblxyXG5sZXQgZmlsZU9wcyA9IG5ldyBGaWxlT3BzKCk7XHJcbmxldCBtb2RlbCA9IG51bGw7XHJcbmxldCBxdWVzdGlvblBhbmUgPSBudWxsO1xyXG5sZXQgZWRpdG9yUGFuZSA9IG51bGw7XHJcblxyXG53aW5kb3cub25sb2FkID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgTmlkZ2V0Lk5pZGdldEVsZW1lbnQubG9hZFRlbXBsYXRlU25pcHBldChcInNuaXBwZXRzL2NoZWNrLWJveC5odG1sXCIsIFwiY2hlY2stYm94XCIpO1xyXG4gICAgTmlkZ2V0Lk5pZGdldEVsZW1lbnQubG9hZFRlbXBsYXRlU25pcHBldChcInNuaXBwZXRzL2dhbWUtYm9hcmQuaHRtbFwiLCBcImdhbWUtYm9hcmRcIik7XHJcbiAgICBOaWRnZXQuTmlkZ2V0RWxlbWVudC5sb2FkVGVtcGxhdGVTbmlwcGV0KFwic25pcHBldHMvbXVsdGlwbGUtY2hvaWNlLXBhbmUuaHRtbFwiLCBcIm11bHRpcGxlLWNob2ljZS1wYW5lXCIpO1xyXG4gICAgTmlkZ2V0Lk5pZGdldEVsZW1lbnQubG9hZFRlbXBsYXRlU25pcHBldChcInNuaXBwZXRzL3F1ZXN0aW9uLXBhbmUuaHRtbFwiLCBcInF1ZXN0aW9uLXBhbmVcIik7XHJcblxyXG4gICAgcGFyc2VVUkxQYXJhbWV0ZXJzKCk7XHJcbiAgICBuZXcgTWVudSgpLmluaXQoXCIjbWVudVwiKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IG5ldyBBdXRoZW50aWNhdGUoKS5sb2FkQ2xpZW50KCk7XHJcbiAgICAgICAgYXdhaXQgZmlsZU9wcy5sb2FkQ2xpZW50KCk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBmaWxlID0gYXdhaXQgZmlsZU9wcy5nZXQod2luZG93LnBhcmFtZXRlcnMuZmlsZUlkKTtcclxuICAgIGxldCBtb2RlbCA9IG5ldyBNb2RlbChmaWxlT3BzKS5zZXQoSlNPTi5wYXJzZShmaWxlLmJvZHkpKTtcclxuICAgIHdpbmRvdy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1uYW1lXCIpLnRleHRDb250ZW50ID0gbW9kZWwubmFtZTtcclxuICAgIGVkaXRvclBhbmUgPSBuZXcgRWRpdG9yUGFuZShtb2RlbCk7XHJcbiAgICBlZGl0b3JQYW5lLm9uU2F2ZSA9IHNhdmVNb2RlbDtcclxuXHJcbiAgICAvLyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiZ2FtZS1ib2FyZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2VsbC1zZWxlY3RcIiwgKGV2ZW50KT0+e1xyXG4gICAgLy8gICAgIGxldCByb3cgPSBldmVudC5kZXRhaWwucm93O1xyXG4gICAgLy8gICAgIGxldCBjb2wgPSBldmVudC5kZXRhaWwuY29sO1xyXG4gICAgLy8gICAgIHF1ZXN0aW9uUGFuZS5zaG93UXVlc3Rpb24od2luZG93Lm1vZGVsLmdldENlbGwocm93LCBjb2wpKTtcclxuICAgIC8vICAgICBlZGl0b3JQYW5lLmhpZGVBbGwoKTtcclxuICAgIC8vIH0pO1xyXG59XHJcblxyXG4vKipcclxuICogU2F2ZSB0aGUgbW9kZWwgdG8gdGhlIGdvb2dsZSBhcHAgZGF0YSBmb2xkZXIuXHJcbiAqL1xyXG5mdW5jdGlvbiBzYXZlTW9kZWwoKSB7XHJcbiAgICBmaWxlT3BzLnNldEJvZHkod2luZG93LnBhcmFtZXRlcnMuZmlsZUlkLCBKU09OLnN0cmluZ2lmeSh3aW5kb3cubW9kZWwuZ2V0KCksIG51bGwsIDIpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoYW5nZSB0aGUgbmFtZSBvZiB0aGUgZmlsZSBpbiBnb29nbGUncyBhcHAgZGF0YSBmb2xkZXIuXHJcbiAqL1xyXG5mdW5jdGlvbiByZW5hbWVNb2RlbCgpIHtcclxuICAgIGxldCBuYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lLW5hbWVcIikudGV4dENvbnRlbnQ7XHJcbiAgICBmaWxlT3BzLnJlbmFtZSh3aW5kb3cucGFyYW1ldGVycy5maWxlSWQsIG5hbWUgKyBcIi5qc29uXCIpO1xyXG4gICAgd2luZG93Lm1vZGVsLm5hbWUgPSBuYW1lO1xyXG4gICAgc2F2ZU1vZGVsKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFeHRyYWN0IHZhbHVlIGZyb20gdGhlIFVSTCBzdHJpbmcsIHN0b3JlIGluICd3aW5kb3cucGFyYW1ldGVycycuXHJcbiAqL1xyXG5mdW5jdGlvbiBwYXJzZVVSTFBhcmFtZXRlcnMoKSB7XHJcbiAgICB3aW5kb3cucGFyYW1ldGVycyA9IHt9O1xyXG4gICAgY29uc3QgcGFyYW1ldGVycyA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpLnNwbGl0KFwiJlwiKTtcclxuICAgIGZvciAoY29uc3QgcGFyYW1ldGVyIG9mIHBhcmFtZXRlcnMpIHtcclxuICAgICAgICBjb25zdCBzcGxpdCA9IHBhcmFtZXRlci5zcGxpdCgvPS8pO1xyXG4gICAgICAgIHdpbmRvdy5wYXJhbWV0ZXJzW3NwbGl0WzBdXSA9IHNwbGl0WzFdID8/IFwiXCI7XHJcbiAgICB9XHJcbn0iLCIvLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZHJpdmUvYXBpL3YzL3F1aWNrc3RhcnQvanM/aGw9ZW5cclxuXHJcbmNsYXNzIEF1dGhlbnRpY2F0ZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgcmVxdWlyZShcIi4vZ29vZ2xlRmllbGRzLmpzXCIpKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkQ2xpZW50KCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGdhcGkubG9hZCgnY2xpZW50OmF1dGgyJywgKCkgPT4gdGhpcy5fX2luaXRDbGllbnQocmVzb2x2ZSwgcmVqZWN0KSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgX19pbml0Q2xpZW50KHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGdhcGkuY2xpZW50LmluaXQoe1xyXG4gICAgICAgICAgICBhcGlLZXk6IHRoaXMuZGV2ZWxvcGVyS2V5LFxyXG4gICAgICAgICAgICBjbGllbnRJZDogdGhpcy5jbGllbnRJZCxcclxuICAgICAgICAgICAgZGlzY292ZXJ5RG9jczogdGhpcy5kaXNjb3ZlcnlEb2NzLFxyXG4gICAgICAgICAgICBzY29wZTogdGhpcy5zY29wZVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFUlJPUiBJTklUXCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNBdXRob3JpemVkKCl7XHJcbiAgICAgICAgdmFyIHVzZXIgPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLmN1cnJlbnRVc2VyLmdldCgpO1xyXG4gICAgICAgIHJldHVybiB1c2VyLmhhc0dyYW50ZWRTY29wZXModGhpcy5zY29wZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2lnbkluKCl7XHJcbiAgICAgICAgZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKS5zaWduSW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBzaWduT3V0KCl7XHJcbiAgICAgICAgZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKS5zaWduT3V0KCk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEF1dGhlbnRpY2F0ZTsiLCJjb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcblxyXG5jbGFzcyBDaGVja0JveCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgYXN5bmMgY29ubmVjdGVkQ2FsbGJhY2soKXtcclxuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgdG9nZ2xlKCl7XHJcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tlZCA9PT0gJ3RydWUnKSB0aGlzLmNoZWNrZWQgPSAnZmFsc2UnO1xyXG4gICAgICAgIGVsc2UgdGhpcy5jaGVja2VkID0gJ3RydWUnXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGNoZWNrZWQoKXtcclxuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFKSl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFLCAnZmFsc2UnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgY2hlY2tlZCh2YWx1ZSl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cmlidXRlKENoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFLCB2YWx1ZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkNoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFID0gXCJjaGVja2VkXCI7XHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2NoZWNrLWJveCcsIENoZWNrQm94KTtcclxubW9kdWxlLmV4cG9ydHMgPSBDaGVja0JveDsiLCJjb25zdCBNb2RlbCA9IHJlcXVpcmUoXCIuL01vZGVsLmpzXCIpO1xyXG5cclxuY2xhc3MgRWRpdG9yUGFuZXtcclxuICAgIGNvbnN0cnVjdG9yKG1vZGVsKSB7XHJcbiAgICAgICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xyXG4gICAgICAgIHRoaXMudHJpYW5nbGVSaWdodCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdHJpYW5nbGUtcmlnaHRcIik7XHJcbiAgICAgICAgdGhpcy50cmlhbmdsZUxlZnQgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0cmlhbmdsZS1sZWZ0XCIpO1xyXG4gICAgICAgIHRoaXMucm91bmRMYWJlbCAgICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcm91bmQtbnVtYmVyXCIpO1xyXG4gICAgICAgIHRoaXMuZ2FtZU5hbWUgICAgICA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1uYW1lXCIpO1xyXG5cclxuICAgICAgICB0aGlzLm11bHRpcGxlQ2hvaWNlUGFuZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXVsdGlwbGUtY2hvaWNlLXBhbmVcIik7XHJcbiAgICAgICAgdGhpcy5nYW1lQm9hcmQgICAgICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWUtYm9hcmRcIik7XHJcbiAgICAgICAgdGhpcy5xdWVzdGlvblBhbmUgICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInF1ZXN0aW9uLXBhbmVcIik7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1hZGQtY2F0ZWdvcnlcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuYWRkQ2F0ZWdvcnlSb3VuZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRyaWFuZ2xlVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtYWRkLW11bHRpcGxlLWNob2ljZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5hZGRNdWx0aXBsZUNob2ljZVJvdW5kKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVHJpYW5nbGVWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1yZW1vdmUtcm91bmRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLm1lbnVSZW1vdmUoKSk7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LWhvbWUtc2NyZWVuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy5tZW51SG9tZSgpKTtcclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtdmFsdWUtcGx1c1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMubWVudVBsdXMoKSk7XHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LXZhbHVlLW1pbnVzXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy5tZW51TWludXMoKSk7XHJcblxyXG4gICAgICAgIHRoaXMudHJpYW5nbGVSaWdodC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PiB0aGlzLm5leHRSb3VuZCgpKTtcclxuICAgICAgICB0aGlzLnRyaWFuZ2xlTGVmdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PiB0aGlzLnByZXZSb3VuZCgpKTtcclxuICAgICAgICB0aGlzLmdhbWVOYW1lLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChldmVudCk9PnRoaXMuaW5wdXROYW1lKGV2ZW50KSk7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZUJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJoZWFkZXItdXBkYXRlXCIsIGV2ZW50ID0+e1xyXG4gICAgICAgICAgICBsZXQgY29sID0gZXZlbnQuZGV0YWlsLmNvbDtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5nZXRDb2x1bW4oY29sKS5jYXRlZ29yeSA9IGV2ZW50LmRldGFpbC52YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5nZXRDb2x1bW4oY29sKS5mb250U2l6ZSA9IGV2ZW50LmRldGFpbC5mb250U2l6ZTtcclxuICAgICAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5saW5rUGFuZXMoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBvblNhdmUoKXt9XHJcbiAgICB1cGRhdGVOYW1lKCl7fVxyXG5cclxuICAgIGxpbmtQYW5lcygpe1xyXG4gICAgICAgIGxldCBtdWx0aXBsZUNob2ljZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibXVsdGlwbGUtY2hvaWNlLXBhbmVcIik7XHJcbiAgICAgICAgbGV0IGdhbWVCb2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZS1ib2FyZFwiKTtcclxuICAgICAgICBsZXQgcXVlc3Rpb25QYW5lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJxdWVzdGlvbi1wYW5lXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGlucHV0TmFtZShldmVudCl7XHJcbiAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxMyl7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlTmFtZSgpO1xyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lLWJvYXJkLWNvbnRhaW5lclwiKS5mb2N1cygpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhpZGVBbGwoKXtcclxuICAgICAgICB0aGlzLnRyaWFuZ2xlTGVmdC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMudHJpYW5nbGVSaWdodC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVZpZXcobW9kZWwpIHtcclxuICAgICAgICBtb2RlbCA9IG1vZGVsID8/IHRoaXMubW9kZWw7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUcmlhbmdsZVZpZXcoKTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYW1lLWJvYXJkXCIpLmhpZGUoKTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm11bHRpcGxlLWNob2ljZS1wYW5lXCIpLmhpZGUoKTtcclxuXHJcbiAgICAgICAgaWYgKG1vZGVsLmdldFJvdW5kKCkudHlwZSA9PT0gTW9kZWwucXVlc3Rpb25UeXBlLkNBVEVHT1JZKSB0aGlzLmNhdGVnb3J5Vmlldyhtb2RlbCk7XHJcbiAgICAgICAgaWYgKG1vZGVsLmdldFJvdW5kKCkudHlwZSA9PT0gTW9kZWwucXVlc3Rpb25UeXBlLk1VTFRJUExFX0NIT0lDRSkgdGhpcy5tdWx0aXBsZUNob2ljZVZpZXcobW9kZWwpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVRyaWFuZ2xlVmlldygpe1xyXG4gICAgICAgIHRoaXMudHJpYW5nbGVMZWZ0LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy50cmlhbmdsZVJpZ2h0LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuY3VycmVudFJvdW5kID09PSAwKSB0aGlzLnRyaWFuZ2xlTGVmdC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRSb3VuZCA+PSB0aGlzLm1vZGVsLnJvdW5kQ291bnQgLSAxKSB0aGlzLnRyaWFuZ2xlUmlnaHQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB0aGlzLnJvdW5kTGFiZWwudGV4dENvbnRlbnQgPSBcIlJvdW5kIFwiICsgKHRoaXMubW9kZWwuY3VycmVudFJvdW5kICsgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgbXVsdGlwbGVDaG9pY2VWaWV3KCl7XHJcbiAgICAgICAgbGV0IHBhbmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm11bHRpcGxlLWNob2ljZS1wYW5lXCIpO1xyXG4gICAgICAgIHBhbmUuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIGNhdGVnb3J5Vmlldyhtb2RlbCl7XHJcbiAgICAgICAgbGV0IGdhbWVCb2FyZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZS1ib2FyZFwiKTtcclxuICAgICAgICBnYW1lQm9hcmQuc2hvdygpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCA2OyBjb2wrKykge1xyXG4gICAgICAgICAgICBsZXQgY29sdW1uID0gbW9kZWwuZ2V0Q29sdW1uKGNvbCk7XHJcblxyXG4gICAgICAgICAgICBnYW1lQm9hcmQuZ2V0SGVhZGVyKGNvbCkuZml0VGV4dC5sb2NrID0gXCJ2aFwiO1xyXG4gICAgICAgICAgICBnYW1lQm9hcmQuc2V0SGVhZGVyKGNvbCwgY29sdW1uLmNhdGVnb3J5LCBjb2x1bW4uZm9udFNpemUpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgNTsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIGdhbWVCb2FyZC5zZXRDZWxsKHJvdywgY29sLCBjb2x1bW4uY2VsbFtyb3ddLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGlmIChjb2x1bW4uY2VsbFtyb3ddLnEgPT09IFwiXCIpIGdhbWVCb2FyZC5zZXRDb21wbGV0ZShyb3csIGNvbCwgXCJmYWxzZVwiKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNvbHVtbi5jZWxsW3Jvd10uYSA9PT0gXCJcIikgZ2FtZUJvYXJkLnNldENvbXBsZXRlKHJvdywgY29sLCBcInBhcnRpYWxcIik7XHJcbiAgICAgICAgICAgICAgICBlbHNlIGdhbWVCb2FyZC5zZXRDb21wbGV0ZShyb3csIGNvbCwgXCJ0cnVlXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5leHRSb3VuZCgpe1xyXG4gICAgICAgIHRoaXMubW9kZWwuY3VycmVudFJvdW5kKys7XHJcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJldlJvdW5kKCl7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5jdXJyZW50Um91bmQtLTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBtZW51UGx1cygpe1xyXG4gICAgICAgIHRoaXMubW9kZWwuaW5jcmVhc2VWYWx1ZSgpO1xyXG4gICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICB9XHJcblxyXG4gICAgbWVudU1pbnVzKCl7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5kZWNyZWFzZVZhbHVlKCk7XHJcbiAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBtZW51UmVtb3ZlKCl7XHJcbiAgICAgICAgdGhpcy5tb2RlbC5yZW1vdmVSb3VuZCgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVHJpYW5nbGVWaWV3KCk7XHJcbiAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBtZW51SG9tZSgpe1xyXG4gICAgICAgIGxvY2F0aW9uLmhyZWYgPSBcImhvbWUuaHRtbFwiO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvclBhbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vIHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9kcml2ZS9hcGkvdjMvcXVpY2tzdGFydC9qcz9obD1lblxyXG5cclxuY2xhc3MgRmlsZU9wcyB7XHJcblxyXG4gICAgYXN5bmMgbG9hZCgpe1xyXG4gICAgICAgIGF3YWl0IHRoaXMubG9hZENsaWVudCgpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMubG9hZERyaXZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZENsaWVudCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmxvYWQoJ2NsaWVudCcsICgpID0+IHJlc29sdmUoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZERyaXZlKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmxvYWQoJ2RyaXZlJywgJ3YzJywgcmVzb2x2ZSgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBjcmVhdGUoKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmNyZWF0ZSh7XHJcbiAgICAgICAgICAgICAgICBuYW1lIDogRmlsZU9wcy5maWxlbmFtZSxcclxuICAgICAgICAgICAgICAgIHBhcmVudHM6IFsnYXBwRGF0YUZvbGRlciddLFxyXG4gICAgICAgICAgICAgICAgZmllbGRzOiBcImlkXCJcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLnJlc3VsdC5pZCk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZGVsZXRlKGZpbGVJZCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5kZWxldGUoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkIDogZmlsZUlkXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy5yZXN1bHQpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgbGlzdCgpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMubGlzdCh7XHJcbiAgICAgICAgICAgICAgICAvLyBxOiBgbmFtZSBjb250YWlucyAnLmpzb24nYCxcclxuICAgICAgICAgICAgICAgIHNwYWNlczogJ2FwcERhdGFGb2xkZXInLFxyXG4gICAgICAgICAgICAgICAgZmllbGRzOiAnZmlsZXMvbmFtZSxmaWxlcy9pZCxmaWxlcy9tb2RpZmllZFRpbWUnXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy5yZXN1bHQuZmlsZXMpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGdldChmaWxlSWQpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuZ2V0KHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZDogZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgYWx0OiAnbWVkaWEnXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcyk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBzZXRCb2R5KGZpbGVJZCwgYm9keSl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5yZXF1ZXN0KHtcclxuICAgICAgICAgICAgICAgIHBhdGggOiBcInVwbG9hZC9kcml2ZS92My9maWxlcy9cIiArIGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIG1ldGhvZCA6IFwiUEFUQ0hcIixcclxuICAgICAgICAgICAgICAgIHBhcmFtcyA6IHtcclxuICAgICAgICAgICAgICAgICAgICB1cGxvYWRUeXBlIDogXCJtZWRpYVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaGVhZGVycyA6IHtcclxuICAgICAgICAgICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiIDogXCJhcHBsaWNhdGlvbi9qc29uXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBib2R5IDogYm9keVxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcy5ib2R5KSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZW5hbWUoZmlsZUlkLCBmaWxlbmFtZSl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy51cGRhdGUoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkOiBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiBmaWxlbmFtZVxyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcy5ib2R5KSk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuRmlsZU9wcy5maWxlbmFtZSA9IFwiR2FtZSBOYW1lLmpzb25cIjtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRmlsZU9wczsiLCJcInVzZSBzdHJpY3RcIjtcclxuXHJcbi8qKiBWaWV3LUNvbnRyb2xsZXIgZm9yIHRoZSBIVE1MIGdhbWUgYm9hcmQgZWxlbWVudFxyXG4gICAgVGhpcyBpcyB0aGUgY2xhc3NpY2FsIFwiSmVvcGFyZHlcIiB0eXBlIGJvYXJkXHJcbiAgICBUaGlzIGlzIG1vZGVsIGFnbm9zdGljLCBzZWUgRWRpdG9yUGFuZS5qcyBmb3IgbW9kZWwgbWV0aG9kc1xyXG4gICAgZ2VuZXJhdGVzIHRoZSBmb2xsb3dpbmcgZXZlbnRzOlxyXG4gICAgICAgIGNlbGwtc2VsZWN0IChyb3csIGNvbCk6IHdoZW4gYSB1c2VyIGNsaWNrcyBhIGNlbGxcclxuICAgICAgICBoZWFkZXItdXBkYXRlICh2YWx1ZSwgY29sLCBmb250c2l6ZSkgOiB3aGVuIHRoZSBoZWFkZXIgdGV4dCBjaGFuZ2VzIChhbmQgYmx1cnMpXHJcbiAqKi9cclxuXHJcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiQFRoYWVyaW91cy9uaWRnZXRcIikuTmlkZ2V0RWxlbWVudDtcclxuXHJcbmNsYXNzIENlbGxTZWxlY3RFdmVudCBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKHJvdywgY29sKSB7XHJcbiAgICAgICAgc3VwZXIoJ2NlbGwtc2VsZWN0JyxcclxuICAgICAgICAgICAgICB7ZGV0YWlsIDoge3JvdyA6IHJvdywgY29sIDogY29sIH19XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgSGVhZGVyVXBkYXRlRXZlbnQgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3Rvcihjb2wsIHZhbHVlLCBmb250U2l6ZSkge1xyXG4gICAgICAgIHN1cGVyKCdoZWFkZXItdXBkYXRlJyxcclxuICAgICAgICAgICAge2RldGFpbCA6IHt2YWx1ZSA6IHZhbHVlLCBjb2wgOiBjb2wsIGZvbnRTaXplIDogZm9udFNpemV9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEdhbWVCb2FyZCBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyByZWFkeSgpe1xyXG4gICAgICAgIGF3YWl0IHN1cGVyLnJlYWR5KCk7XHJcbiAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgNjsgY29sKyspIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRIZWFkZXIoY29sKS5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKGV2ZW50KT0+ZXZlbnQudGFyZ2V0LmZpdFRleHQubm90aWZ5KDEsIDEpKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ2V0SGVhZGVyKGNvbCkuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgKGV2ZW50KT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvbnRTaXplID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZXZlbnQudGFyZ2V0KVtcImZvbnQtc2l6ZVwiXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgSGVhZGVyVXBkYXRlRXZlbnQoY29sLCBldmVudC50YXJnZXQudGV4dCwgZm9udFNpemUpKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCA1OyByb3crKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRDZWxsKHJvdywgY29sKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ2VsbFNlbGVjdEV2ZW50KHJvdywgY29sKSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgdmFsdWUgb2YgYSBjYXRlZ29yeVxyXG4gICAgICogQHBhcmFtIGluZGV4XHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqIEBwYXJhbSB2YWx1ZVxyXG4gICAgICovXHJcbiAgICBzZXRIZWFkZXIoaW5kZXgsIHZhbHVlLCBmb250U2l6ZSl7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLmdldEhlYWRlcihpbmRleCk7XHJcbiAgICAgICAgZWxlbWVudC50ZXh0ID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKGZvbnRTaXplKSBlbGVtZW50LnN0eWxlW1wiZm9udC1zaXplXCJdID0gZm9udFNpemU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXRyaWV2ZSB0aGUgaGVhZGVyIGh0bWwgZWxlbWVudFxyXG4gICAgICogQHBhcmFtIGluZGV4XHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqL1xyXG4gICAgZ2V0SGVhZGVyKGluZGV4KXtcclxuICAgICAgICBpZiAodHlwZW9mIGluZGV4ICE9PSBcIm51bWJlclwiIHx8IGluZGV4IDwgMCB8fCBpbmRleCA+IDYpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5kZXg6IFwiICsgaW5kZXgpO1xyXG4gICAgICAgIGxldCBzZWxlY3RvciA9IGBbZGF0YS1yb3c9J2gnXVtkYXRhLWNvbD0nJHtpbmRleH0nXSA+IC52YWx1ZWA7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIHZhbHVlIG9mIGEgbm9uLWNhdGVnb3J5IGNlbGwuXHJcbiAgICAgKiBAcGFyYW0gcm93XHJcbiAgICAgKiBAcGFyYW0gY29sXHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqL1xyXG4gICAgc2V0Q2VsbChyb3csIGNvbCwgdmFsdWUgPSBcIlwiKXtcclxuICAgICAgICB0aGlzLmdldENlbGwocm93LCBjb2wpLnRleHRDb250ZW50ID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2VsbChyb3csIGNvbCl7XHJcbiAgICAgICAgbGV0IHNlbGVjdG9yID0gYFtkYXRhLXJvdz1cIiR7cm93fVwiXVtkYXRhLWNvbD1cIiR7Y29sfVwiXSA+IC52YWx1ZWA7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q29tcGxldGUocm93LCBjb2wsIHZhbHVlKXtcclxuICAgICAgICBpZiAodHlwZW9mIHJvdyAhPT0gXCJudW1iZXJcIiB8fCByb3cgPCAwIHx8IHJvdyA+IDYpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcm93OiBcIiArIHJvdyk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb2wgIT09IFwibnVtYmVyXCIgfHwgY29sIDwgMCB8fCBjb2wgPiA1KSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGNvbDogXCIgKyBjb2wpO1xyXG4gICAgICAgIHRoaXMuZ2V0Q2VsbChyb3csIGNvbCkuc2V0QXR0cmlidXRlKFwiZGF0YS1jb21wbGV0ZVwiLCB2YWx1ZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2dhbWUtYm9hcmQnLCBHYW1lQm9hcmQpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWVCb2FyZDsiLCJjbGFzcyBNZW51e1xyXG4gICAgaW5pdChtZW51U2VsZWN0b3Ipe1xyXG4gICAgICAgIHRoaXMubWVudVNlbGVjdG9yID0gbWVudVNlbGVjdG9yO1xyXG4gICAgICAgIHRoaXMubWVudUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMudG9nZ2xlTWVudSgpKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uTWVudSgpO1xyXG5cclxuICAgICAgICB0aGlzLm1lbnVBcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsICgpPT4gdGhpcy5tb3VzZUxlYXZlKCkpO1xyXG4gICAgICAgIHRoaXMubWVudUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKT0+IHRoaXMubW91c2VMZWF2ZSgpKTtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsICgpPT4gdGhpcy5tb3VzZUVudGVyKCkpO1xyXG4gICAgICAgIHRoaXMubWVudUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKT0+IHRoaXMubW91c2VFbnRlcigpKTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLWF1dG9jbG9zZT0ndHJ1ZSdcIikuZm9yRWFjaCgoZWxlKT0+IHtcclxuICAgICAgICAgICAgZWxlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy5jbG9zZSgpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zdWItbWVudVwiKS5mb3JFYWNoKChlbGUpPT57XHJcbiAgICAgICAgICAgIGVsZS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtbGFiZWxcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZU1lbnUoZWxlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlKCl7XHJcbiAgICAgICAgdGhpcy5tZW51QXJlYS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnN1Yi1tZW51ID4gLm1lbnUtYXJlYVwiKS5mb3JFYWNoKChlbGUpPT57XHJcbiAgICAgICAgICAgIGVsZS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9wZW4oKXtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbk1lbnUoKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3VzZUxlYXZlKCl7XHJcbiAgICAgICAgaWYgKHRoaXMudGltZW91dCkgcmV0dXJuO1xyXG4gICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PntcclxuICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VFbnRlcigpe1xyXG4gICAgICAgIGlmICghdGhpcy50aW1lb3V0KSByZXR1cm47XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XHJcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0b2dnbGVNZW51KGVsZW1lbnQpe1xyXG4gICAgICAgIGVsZW1lbnQgPSBlbGVtZW50ID8/IHRoaXMubWVudUFyZWE7XHJcbiAgICAgICAgaWYgKCFlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIm1lbnUtYXJlYVwiKSl7XHJcbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hcmVhXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiaGlkZGVuXCIpKXtcclxuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcIm1lbnUtYXJlYVwiKSl7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLm1lbnUtYXJlYVwiKS5mb3JFYWNoKFxyXG4gICAgICAgICAgICAgICAgKGVsZSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZS5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwb3NpdGlvbk1lbnUoKXtcclxuICAgICAgICBjb25zdCBsZWZ0ID0gdGhpcy5tZW51QnV0dG9uLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQ7XHJcbiAgICAgICAgY29uc3QgYldpZHRoID0gdGhpcy5tZW51QnV0dG9uLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG4gICAgICAgIGNvbnN0IG1XaWR0aCA9IHRoaXMubWVudUFyZWEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XHJcbiAgICAgICAgaWYgKChsZWZ0ICsgYldpZHRoICsgbVdpZHRoICsgMikgPiB3aW5kb3cuaW5uZXJXaWR0aCl7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0TWVudUxlZnQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNldE1lbnVSaWdodCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXRNZW51TGVmdCgpe1xyXG4gICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLm1lbnVCdXR0b24ub2Zmc2V0TGVmdDtcclxuICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXMubWVudUFyZWEub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgdGhpcy5tZW51QXJlYS5zdHlsZS5sZWZ0ID0gKGxlZnQgLSB3aWR0aCAtIDIpICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHNldE1lbnVSaWdodCgpe1xyXG4gICAgICAgIGNvbnN0IGxlZnQgPSB0aGlzLm1lbnVCdXR0b24ub2Zmc2V0TGVmdDtcclxuICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXMubWVudUJ1dHRvbi5vZmZzZXRXaWR0aDtcclxuICAgICAgICB0aGlzLm1lbnVBcmVhLnN0eWxlLmxlZnQgPSAobGVmdCArIHdpZHRoICsgMikgKyBcInB4XCI7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG1lbnUoKXtcclxuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm1lbnVTZWxlY3Rvcik7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG1lbnVCdXR0b24oKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZW51LnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1pY29uXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBtZW51QXJlYSgpe1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1lbnUucXVlcnlTZWxlY3RvcihcIi5tZW51LWFyZWFcIik7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWVudTsiLCJjbGFzcyBNb2RlbCB7XHJcbiAgICBpbml0KG5hbWUgPSBcIkdhbWUgTmFtZVwiKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWVNb2RlbCA9IHtcclxuICAgICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgICAgICAgICAgcm91bmRzOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuYWRkQ2F0ZWdvcnlSb3VuZCgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBuYW1lKHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLm5hbWUgPSBzdHJpbmc7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsLm5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0KGdhbWVNb2RlbCkge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFJvdW5kID0gMDtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbCA9IGdhbWVNb2RlbDtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBnZXQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJvdW5kKGluZGV4KSB7XHJcbiAgICAgICAgaW5kZXggPSBpbmRleCA/PyB0aGlzLmN1cnJlbnRSb3VuZDtcclxuICAgICAgICByZXR1cm4gdGhpcy5nYW1lTW9kZWwucm91bmRzW2luZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDb2x1bW4oaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRSb3VuZCgpLmNvbHVtbltpbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Q2VsbChyb3csIGNvbHVtbikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldENvbHVtbihjb2x1bW4pLmNlbGxbcm93XTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVSb3VuZCgpIHtcclxuICAgICAgICBpZiAodGhpcy5yb3VuZENvdW50ID09PSAxKSByZXR1cm47XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwucm91bmRzLnNwbGljZSh0aGlzLmN1cnJlbnRSb3VuZCwgMSk7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdW5kID49IHRoaXMucm91bmRDb3VudCkgdGhpcy5jdXJyZW50Um91bmQgPSB0aGlzLnJvdW5kQ291bnQgLSAxO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZE11bHRpcGxlQ2hvaWNlUm91bmQoKXtcclxuICAgICAgICBsZXQgcm91bmQgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IE1vZGVsLnF1ZXN0aW9uVHlwZS5NVUxUSVBMRV9DSE9JQ0UsXHJcbiAgICAgICAgICAgIHF1ZXN0aW9uIDogXCJcIixcclxuICAgICAgICAgICAgYW5zd2VycyA6IFtcclxuICAgICAgICAgICAgICAgIC8vIHZhbHVlIDoge3RydWUsIGZhbHNlfSwgdGV4dFxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwucm91bmRzLnB1c2gocm91bmQpO1xyXG4gICAgICAgIHJldHVybiByb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICBhZGRDYXRlZ29yeVJvdW5kKCkge1xyXG4gICAgICAgIGxldCByb3VuZCA9IHtcclxuICAgICAgICAgICAgdHlwZTogTW9kZWwucXVlc3Rpb25UeXBlLkNBVEVHT1JZLFxyXG4gICAgICAgICAgICBjb2x1bW46IFtdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldID0ge1xyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnk6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICBjZWxsOiBbXVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldLmNlbGxbal0gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IChqICsgMSkgKiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgcTogXCJcIixcclxuICAgICAgICAgICAgICAgICAgICBhOiBcIlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5wdXNoKHJvdW5kKTtcclxuICAgICAgICByZXR1cm4gcm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHJvdW5kQ291bnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgaW5jcmVhc2VWYWx1ZSgpIHtcclxuICAgICAgICBsZXQgcm91bmQgPSB0aGlzLmdldFJvdW5kKCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgNTsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICByb3VuZC5jb2x1bW5baV0uY2VsbFtqXS52YWx1ZSAqPSAyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRlY3JlYXNlVmFsdWUoKSB7XHJcbiAgICAgICAgbGV0IHJvdW5kID0gdGhpcy5nZXRSb3VuZCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldLmNlbGxbal0udmFsdWUgLz0gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuTW9kZWwucXVlc3Rpb25UeXBlID0ge1xyXG4gICAgQ0FURUdPUlkgOiBcImNob2ljZVwiLFxyXG4gICAgTVVMVElQTEVfQ0hPSUNFIDogXCJtdWx0aXBsZV9jaG9pY2VcIlxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBNb2RlbDsiLCJjb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcbnJlcXVpcmUoXCIuL0NoZWNrQm94LmpzXCIpO1xyXG5cclxuY2xhc3MgTXVsdGlwbGVDaG9pY2VQYW5lIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XHJcblxyXG4gICAgc2V0TW9kZWwobW9kZWwpe1xyXG4gICAgICAgIHRoaXMubW9kZWwgPSBtb2RlbDtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBjb25uZWN0ZWRDYWxsYmFjaygpe1xyXG4gICAgICAgIGF3YWl0IHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYW5zd2VyID4gbmlkZ2V0LXRleHRcIikpe1xyXG4gICAgICAgICAgICBlbGVtZW50LmZpdFRleHQubG9jayA9IFwidmhcIjtcclxuICAgICAgICAgICAgLy8gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgdHh0TGlzdGVuZXIpO1xyXG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCAoZXZlbnQpPT50aGlzLnR4dExpc3RlbmVyKGV2ZW50KSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHR4dExpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxMyl7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZXZlbnQudGFyZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1pbmRleFwiKTtcclxuICAgICAgICAgICAgaW5kZXggPSBwYXJzZUludChpbmRleCk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA+PSA1KXtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5ibHVyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBgbmlkZ2V0LXRleHRbZGF0YS1pbmRleD1cIiR7aW5kZXggKyAxfVwiXWA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG1vZGVsW2luZGV4XSA9IHtcclxuICAgICAgICAgICAgICAgIGNvcnJlY3QgOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgdGV4dCA6IHRoaXMucXVlcnlTZWxlY3RvcihgbmlkZ2V0LXRleHRbZGF0YS1pbmRleD1cIiR7aW5kZXh9XCJdYCkudGV4dFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGV2ZW50LnRhcmdldC5maXRUZXh0Lm5vdGlmeSgxLCAxKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbXVsdGlwbGUtY2hvaWNlLXBhbmUnLCBNdWx0aXBsZUNob2ljZVBhbmUpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE11bHRpcGxlQ2hvaWNlUGFuZTsiLCJjb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcblxyXG5jbGFzcyBRdWVzdGlvblBhbmUgZXh0ZW5kcyBOaWRnZXRFbGVtZW50e1xyXG5cclxuICAgIGFzeW5jIHJlYWR5KCl7XHJcbiAgICAgICAgYXdhaXQgc3VwZXIucmVhZHkoKTtcclxuXHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctYm9hcmRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0JvYXJkKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LXF1ZXN0aW9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLnNob3dRdWVzdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1hbnN3ZXJcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd0Fuc3dlcigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+dGhpcy50ZXh0Q29udGVudHMuZm9jdXMoKSk7XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiN0ZXh0LWNvbnRlbnRzXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIGFzeW5jICgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuY2VsbFt0aGlzLnN0YXR1c10gPSB0aGlzLnRleHRDb250ZW50cy50ZXh0LnRyaW0oKTtcclxuICAgICAgICAgICAgYXdhaXQgdGhpcy5vblVwZGF0ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVXBkYXRlKCl7fVxyXG4gICAgc2hvd0JvYXJkKCl7fVxyXG4gICAgc2hvd1F1ZXN0aW9uKCl7fVxyXG4gICAgc2hvd0Fuc3dlcigpe31cclxuXHJcbiAgICAvLyBzaG93UXVlc3Rpb24oY2VsbCl7XHJcbiAgICAvLyAgICAgaWYgKGNlbGwpIHRoaXMuY2VsbCA9IGNlbGw7XHJcbiAgICAvLyAgICAgY2VsbCA9IGNlbGwgPz8gdGhpcy5jZWxsO1xyXG4gICAgLy9cclxuICAgIC8vICAgICB0aGlzLm5hdkFuc3dlci5jbGFzc0xpc3QucmVtb3ZlKFwic2VsZWN0ZWRcIik7XHJcbiAgICAvLyAgICAgdGhpcy5uYXZRdWVzdGlvbi5jbGFzc0xpc3QuYWRkKFwic2VsZWN0ZWRcIik7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgIHRoaXMuc3RhdHVzID0gXCJxXCI7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgIHRoaXMubmF2Qm9hcmQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIC8vICAgICB0aGlzLm5hdlF1ZXN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAvLyAgICAgdGhpcy5uYXZBbnN3ZXIuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgdGhpcy50ZXh0UXVlc3Rpb24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgIC8vICAgICB0aGlzLnRleHRRdWVzdGlvbi5xdWVyeVNlbGVjdG9yKFwiLnRleHQtY29udGVudHNcIikudGV4dCA9IGNlbGwucTtcclxuICAgIC8vIH1cclxuICAgIC8vXHJcbiAgICAvLyBzaG93QW5zd2VyKGNlbGwpe1xyXG4gICAgLy8gICAgIGlmIChjZWxsKSB0aGlzLmNlbGwgPSBjZWxsO1xyXG4gICAgLy8gICAgIGNlbGwgPSBjZWxsID8/IHRoaXMuY2VsbDtcclxuICAgIC8vXHJcbiAgICAvLyAgICAgdGhpcy5uYXZBbnN3ZXIuY2xhc3NMaXN0LmFkZChcInNlbGVjdGVkXCIpO1xyXG4gICAgLy8gICAgIHRoaXMubmF2UXVlc3Rpb24uY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xyXG4gICAgLy9cclxuICAgIC8vICAgICB0aGlzLnN0YXR1cyA9IFwiYVwiO1xyXG4gICAgLy9cclxuICAgIC8vICAgICB0aGlzLm5hdkJvYXJkLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAvLyAgICAgdGhpcy5uYXZRdWVzdGlvbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgLy8gICAgIHRoaXMubmF2QW5zd2VyLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAvL1xyXG4gICAgLy8gICAgIHRoaXMudGV4dFF1ZXN0aW9uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAvLyAgICAgdGhpcy50ZXh0UXVlc3Rpb24ucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpLnRleHQgPSBjZWxsLmE7XHJcbiAgICAvLyB9XHJcbn1cclxuXHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ3F1ZXN0aW9uLXBhbmUnLCBRdWVzdGlvblBhbmUpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXN0aW9uUGFuZTtcclxuXHJcblxyXG5cclxuIiwiXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgLy8gVGhlIEJyb3dzZXIgQVBJIGtleSBvYnRhaW5lZCBmcm9tIHRoZSBHb29nbGUgQVBJIENvbnNvbGUuXHJcbiAgICBkZXZlbG9wZXJLZXkgOiAnQUl6YVN5QUJjZExtVDZISF83R284MnFfSUJHSTNqbTZVTDR3NFEwJyxcclxuXHJcbiAgICAvLyBUaGUgQ2xpZW50IElEIG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS4gUmVwbGFjZSB3aXRoIHlvdXIgb3duIENsaWVudCBJRC5cclxuICAgIGNsaWVudElkIDogXCIxNTg4MjMxMzQ2ODEtOThiZ2thbmdvbHRrNjM2dWtmOHBvZmVpczdwYTdqYmsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb21cIixcclxuXHJcbiAgICAvLyBSZXBsYWNlIHdpdGggeW91ciBvd24gcHJvamVjdCBudW1iZXIgZnJvbSBjb25zb2xlLmRldmVsb3BlcnMuZ29vZ2xlLmNvbS5cclxuICAgIGFwcElkIDogXCIxNTg4MjMxMzQ2ODFcIixcclxuXHJcbiAgICAvLyBBcnJheSBvZiBBUEkgZGlzY292ZXJ5IGRvYyBVUkxzIGZvciBBUElzIHVzZWQgYnkgdGhlIHF1aWNrc3RhcnRcclxuICAgIGRpc2NvdmVyeURvY3MgOiBbXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9kaXNjb3ZlcnkvdjEvYXBpcy9kcml2ZS92My9yZXN0XCJdLFxyXG5cclxuICAgIC8vIFNjb3BlIHRvIHVzZSB0byBhY2Nlc3MgdXNlcidzIERyaXZlIGl0ZW1zLlxyXG4gICAgc2NvcGU6IFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC9kcml2ZS5maWxlXCJcclxufSJdfQ==
