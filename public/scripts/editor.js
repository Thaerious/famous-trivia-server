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


class AspectRatio {
  constructor(nidget) {
    this.nidget = nidget;
    this.observer = new ResizeObserver(() => this.onResize());
    this.observer.observe(this.nidget);
    this.parseValues();
    this.onResize();
    this.loaded = false;
  }

  getValue() {
    return getComputedStyle(this.nidget).getPropertyValue(AspectRatio.CSS_ATTRIBUTE);
  }

  parseValues() {
    let value = this.getValue();
    let split = value.split(/[ ,;]/g);

    for (let s of split) {
      if (s.split(/[-:]/).length === 2) {
        let ratio = s.split(/[-:]/);
        this.width = parseInt(ratio[0]);
        this.height = parseInt(ratio[1]);
      } else if (s === "h") {
        this.onResize = () => {
          let height = this.nidget.getBoundingClientRect().height;
          this.nidget.style.width = height * this.width / this.height + "px";
        };
      }
    }
  }

  onResize() {
    let width = this.nidget.getBoundingClientRect().width;
    this.nidget.style.height = width * this.height / this.width + "px";
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

    if (templateId) {
      this.applyTemplate(templateId);
    }
  }
  /**
      connectedCallback is invoked each time the custom element is appended into a document-connected element
   */


  async connectedCallback() {
    this.shadowContents = this;

    if (this.hasAttribute(Nidget.templateAttribute)) {
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

  notifyStyles() {
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
    this.attachShadow({
      mode: 'open'
    }).appendChild(template.content.cloneNode(true));
    await this.ready();
  }

  async ready() {}
  /**
   * Load contents of file into this element.
   * Replace all ${} variables with contents of 'map'.
   */


  async retrieveSource(map) {
    let src = this.getAttribute(Nidget.srcAttribute);
    let text = await FileOperations.getFile(src, map);
    this.innerHTML = text;
  }

  static async loadTemplateSnippet(filename, tagname) {
    let id = filename.replace(/[\// .-]+/g, "_");

    if (!document.querySelector(`#${id}`)) {
      let text = await FileOperations.getFile(filename);
      let template = document.createElement("template");
      template.innerHTML = text;
      template.setAttribute("id", id);
      if (tagname) template.setAttribute("data-nidget", tagname);
      document.body.append(template);
    }

    let template = document.querySelector(`#${id}`);

    for (let ele of document.querySelectorAll(tagname)) {
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


  set disabled(value) {
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


  get disabled() {
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
    if (this.shadowRoot) {
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
    if (this.shadowRoot) {
      return this.shadowRoot.querySelectorAll(selectors);
    } else {
      return super.querySelectorAll(selectors);
    }
  }
  /**
   * Remove this element from it's parent.
   */


  detach() {
    this.parentNode.removeChild(this);
  }
  /**
   * Index within the parent element.
   */


  index() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL2Vkd2FyL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0Fic3RyYWN0TW9kZWwuanMiLCIuLi8uLi9uaWRnZXQvc3JjL0RyYWdIYW5kbGVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9GaWxlT3BlcmF0aW9ucy5qcyIsIi4uLy4uL25pZGdldC9zcmMvSW50ZXJmYWNlcy5qcyIsIi4uLy4uL25pZGdldC9zcmMvTW91c2VVdGlsaXRpZXMuanMiLCIuLi8uLi9uaWRnZXQvc3JjL05pZGdldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0RWxlbWVudC5qcyIsIi4uLy4uL25pZGdldC9zcmMvTmlkZ2V0U3R5bGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL1RyYW5zZm9ybWVyLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b24uanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldEJ1dHRvblNldC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU3RhdGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1jb21wb25lbnRzL05pZGdldENvbnRhaW5lci5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0SFRNTEltYWdlLmpzIiwiLi4vLi4vbmlkZ2V0L3NyYy9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRJbWFnZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0VGV4dC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJhZy5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvRHJvcC5qcyIsIi4uLy4uL25pZGdldC9zcmMvbmlkZ2V0LWludGVyZmFjZXMvTW91c2UuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL01vdmFibGUuanMiLCIuLi8uLi9uaWRnZXQvc3JjL25pZGdldC1pbnRlcmZhY2VzL1Jlc2l6ZS5qcyIsIi4uLy4uL25pZGdldC9zcmMvcHJvamVjdEZpbGUuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9hc3luY1RvR2VuZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvY2xhc3NDYWxsQ2hlY2suanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jb25zdHJ1Y3QuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9jcmVhdGVDbGFzcy5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2dldC5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL2dldFByb3RvdHlwZU9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pbnRlcm9wUmVxdWlyZURlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvQGJhYmVsL3J1bnRpbWUvaGVscGVycy9pc05hdGl2ZUZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0LmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvcG9zc2libGVDb25zdHJ1Y3RvclJldHVybi5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3NldFByb3RvdHlwZU9mLmpzIiwibm9kZV9tb2R1bGVzL0BiYWJlbC9ydW50aW1lL2hlbHBlcnMvc3VwZXJQcm9wQmFzZS5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3R5cGVvZi5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9oZWxwZXJzL3dyYXBOYXRpdmVTdXBlci5qcyIsIm5vZGVfbW9kdWxlcy9AYmFiZWwvcnVudGltZS9yZWdlbmVyYXRvci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1ydW50aW1lL3J1bnRpbWUuanMiLCJzcmMvY2xpZW50L2VkaXRvci5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9BdXRoZW50aWNhdGUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvQ2hlY2tCb3guanMiLCJzcmMvY2xpZW50L21vZHVsZXMvRWRpdG9yUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9GaWxlT3BzLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL0dhbWVCb2FyZC5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9NZW51LmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL01vZGVsLmpzIiwic3JjL2NsaWVudC9tb2R1bGVzL011bHRpcGxlQ2hvaWNlUGFuZS5qcyIsInNyYy9jbGllbnQvbW9kdWxlcy9RdWVzdGlvblBhbmUuanMiLCJzcmMvY2xpZW50L21vZHVsZXMvZ29vZ2xlRmllbGRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDNXVCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFKQSxJQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsbUJBQUQsQ0FBdEI7O0FBTUEsSUFBSSxPQUFPLEdBQUcsSUFBSSxtQkFBSixFQUFkO0FBQ0EsSUFBSSxLQUFLLEdBQUcsSUFBWjtBQUNBLElBQUksWUFBWSxHQUFHLElBQW5CO0FBQ0EsSUFB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QUE7QUFBQTtBQUFBO0FBQUE7O0FBRWIsV0FBSyxhQUFMLGlCQUE0QixNQUE1QixHQUFzQyxTQUF0QyxDQUFnRCxHQUFoRCxDQUFvRCxVQUFwRDtBQUNIOzs7U0FFRCxhQUFnQixLQUFoQixFQUFzQjtBQUNsQixVQUFJLEtBQUosRUFBVTtBQUNOLGFBQUssYUFBTCxDQUFtQixhQUFuQixFQUFrQyxJQUFsQztBQUNILE9BRkQsTUFFSztBQUNELGFBQUssYUFBTCxDQUFtQixhQUFuQixFQUFrQyxJQUFsQztBQUNIO0FBQ0o7OztFQS9Dc0IsYTs7QUFrRDNCLE1BQU0sQ0FBQyxjQUFQLENBQXNCLE1BQXRCLENBQTZCLGVBQTdCLEVBQThDLFlBQTlDO0FBQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsWUFBakI7Ozs7O0FDOUVBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBQ2I7QUFDQSxFQUFBLFlBQVksRUFBRyx5Q0FGRjtBQUliO0FBQ0EsRUFBQSxRQUFRLEVBQUcsMEVBTEU7QUFPYjtBQUNBLEVBQUEsS0FBSyxFQUFHLGNBUks7QUFVYjtBQUNBLEVBQUEsYUFBYSxFQUFHLENBQUMsNERBQUQsQ0FYSDtBQWFiO0FBQ0EsRUFBQSxLQUFLLEVBQUU7QUFkTSxDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0JztcbmNsYXNzIEFic3RyYWN0TW9kZWwge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyBhYnN0cmFjdCBtb2RlbC4gIElmIGRlbGVnYXRlIGlzIHByb3ZpZGVkIHRoZW4gYWxsIGxpc3RlbmVyXG4gICAgICogYWRkcyBhbmQgbm90aWZpZXMgYXJlIHBlcmZvcm1lZCBvbiB0aGUgZGVsZWdhdGUgbGlzdGVuZXIgY29sbGVjdGlvbi5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IGRlbGVnYXRlXG4gICAgICogQHJldHVybnMge25tJF9BYnN0cmFjdE1vZGVsLkFic3RyYWN0TW9kZWx9XG4gICAgICovXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZGVsZWdhdGUgPSB0aGlzO1xuICAgICAgICB0aGlzLmFic3RyYWN0TW9kZWxMaXN0ZW5lcnMgPSBbXTsgICAgICAgIFxuICAgIH1cblxuICAgIGdldERlbGVnYXRlKCl7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbGVnYXRlO1xuICAgIH1cbiAgICBcbiAgICBzZXREZWxlZ2F0ZShkZWxlZ2F0ZSA9IG51bGwpe1xuICAgICAgICBpZiAoZGVsZWdhdGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5hYnN0cmFjdE1vZGVsTGlzdGVuZXJzID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlbGVnYXRlID0gZGVsZWdhdGUuZGVsZWdhdGU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLmRlbGVnYXRlID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidW5kZWZpbmVkIGRlbGVnYXRlXCIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGFkZExpc3RlbmVyKGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09IFwib2JqZWN0XCIpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBBYnN0cmFjdE1vZGVsIGxpc3RlbmVyIHR5cGU6IFwiICsgdHlwZW9mIGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRlbGVnYXRlLmFic3RyYWN0TW9kZWxMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2FsbCBhcyBub3RpZnlMaXN0ZW5lcnMobWV0aG9kTmFtZSwgW21ldGhvZEFyZ3VtZW50MCwgLi4uIG1ldGhvZEFyZ3VtZW50Tl0pXG4gICAgICogQHBhcmFtIHt0eXBlfSBtZXRob2RcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIGFzeW5jIG5vdGlmeUxpc3RlbmVycyhtZXRob2QpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJFVkVOVCBcIiArIHRoaXMuZGVsZWdhdGUuY29uc3RydWN0b3IubmFtZSArIFwiIFwiICsgbWV0aG9kKTtcblxuICAgICAgICBBcnJheS5wcm90b3R5cGUuc2hpZnQuYXBwbHkoYXJndW1lbnRzKTtcbiAgICAgICAgbGV0IGV2ZW50ID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgICAgICBhcmdzOiBhcmd1bWVudHMsXG4gICAgICAgICAgICBzb3VyY2U6IHRoaXMsXG4gICAgICAgICAgICBsaXN0ZW5lcnM6IFtdXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICB3aW5kb3cubGFzdEV2ZW50ID0gZXZlbnQ7XG4gICAgICAgIHdpbmRvdy5uRXZlbnRzLnB1c2god2luZG93Lmxhc3RFdmVudCk7XG5cbiAgICAgICAgZm9yIChsZXQgbGlzdGVuZXIgb2YgdGhpcy5kZWxlZ2F0ZS5hYnN0cmFjdE1vZGVsTGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBpZiAobGlzdGVuZXJbbWV0aG9kXSl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCIgKyBcIiArIGxpc3RlbmVyLmNvbnN0cnVjdG9yLm5hbWUgKyBcIiBcIiArIG1ldGhvZCk7XG4gICAgICAgICAgICAgICAgd2luZG93Lmxhc3RFdmVudC5saXN0ZW5lcnMucHVzaChsaXN0ZW5lci5jb25zdHJ1Y3Rvci5uYW1lKTsgICAgICAgXG4gICAgICAgICAgICAgICAgYXdhaXQgbGlzdGVuZXJbbWV0aG9kXS5hcHBseShsaXN0ZW5lciwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaXN0ZW5lcltBYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lcl0pe1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiICsgXCIgKyBsaXN0ZW5lci5jb25zdHJ1Y3Rvci5uYW1lICsgXCIgXCIgKyBBYnN0cmFjdE1vZGVsLmRlZmF1bHRMaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgd2luZG93Lmxhc3RFdmVudC5saXN0ZW5lcnMucHVzaChsaXN0ZW5lci5jb25zdHJ1Y3Rvci5uYW1lKTsgICAgICAgXG4gICAgICAgICAgICAgICAgYXdhaXQgbGlzdGVuZXJbQWJzdHJhY3RNb2RlbC5kZWZhdWx0TGlzdGVuZXJdLmFwcGx5KGxpc3RlbmVyLCB3aW5kb3cubGFzdEV2ZW50KTsgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbkFic3RyYWN0TW9kZWwuZGVmYXVsdExpc3RlbmVyID0gXCJuaWRnZXRMaXN0ZW5lclwiO1xud2luZG93Lm5FdmVudHMgPSBbXTtcbm1vZHVsZS5leHBvcnRzID0gQWJzdHJhY3RNb2RlbDsiLCIndXNlIHN0cmljdCc7XG4vKipcbiAqIFNpbmdsZXRvbiBjbGFzcyB0byBwcm92aWRpbmcgZnVuY3Rpb25hbGl0eSB0byBEcmFnTmlkZ2V0cyBhbmQgRHJvcE5pZGdldHMuXG4gKiBJdCBzdG9yZXMgdGhlIE5pZGdldCBjdXJyZW50bHkgYmVpbmcgZHJhZ2dlZC5cbiAqL1xuY2xhc3MgRHJhZ0hhbmRsZXJ7XG4gICAgXG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5vdmVyID0gW107XG4gICAgfVxuICAgIFxuICAgIHB1c2hPdmVyKG5pZGdldCl7XG4gICAgICAgIGlmICh0aGlzLm92ZXJIYXMobmlkZ2V0KSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB0aGlzLm92ZXIucHVzaChuaWRnZXQpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgcmVtb3ZlT3ZlcihuaWRnZXQpe1xuICAgICAgICBpZiAoIXRoaXMub3ZlckhhcyhuaWRnZXQpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMub3Zlci5zcGxpY2UodGhpcy5vdmVyLmluZGV4T2YobmlkZ2V0KSwgMSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gICAgXG4gICAgXG4gICAgb3ZlckhhcyhuaWRnZXQpe1xuICAgICAgICByZXR1cm4gdGhpcy5vdmVyLmluZGV4T2YobmlkZ2V0KSAhPT0gLTE7XG4gICAgfVxuICAgIFxuICAgIHNldChuaWRnZXQpe1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBuaWRnZXQ7XG4gICAgfVxuICAgIFxuICAgIGdldCgpe1xuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50O1xuICAgIH1cbiAgICBcbiAgICBoYXMoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudCAhPT0gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgY2xlYXIoKXtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbnVsbDtcbiAgICB9XG4gICAgXG4gICAgc3RhdGljIGdldEluc3RhbmNlKCl7XG4gICAgICAgIHJldHVybiBEcmFnSGFuZGxlci5pbnN0YW5jZTtcbiAgICB9ICAgIFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBEcmFnSGFuZGxlcigpO1xuXG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyogZ2xvYmFsIFV0aWxpdHkgKi9cbmNsYXNzIEZpbGVPcGVyYXRpb25zIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSBhIGZpbGUgKHVybCkuICBNYXAgdmFyaWFibGVzICgkey4uLn0pIHRvIFxuICAgICAqIGEgdmFsdWUuXG4gICAgICogQHBhcmFtIHt0eXBlfSB1cmxcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1hcFxuICAgICAqIEByZXR1cm5zIHtub2RlfEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50LmRvbUVsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGxvYWROaWRnZXQodXJsLCBtYXApeyAgICAgICAgXG4gICAgICAgIGxldCBlbGVtZW50ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQodXJsLCBtYXApO1xuICAgICAgICByZXR1cm4gbmV3IE5pZGdldEVsZW1lbnQoZWxlbWVudCk7XG4gICAgfSAgICBcbiAgICBcbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSBhIGZpbGUgKHVybCkuICBNYXAgdmFyaWFibGVzICgkey4uLn0pIHRvIFxuICAgICAqIGEgdmFsdWUuXG4gICAgICogQHBhcmFtIHt0eXBlfSB1cmxcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1hcFxuICAgICAqIEByZXR1cm5zIHtub2RlfEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50LmRvbUVsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGxvYWRET01FbGVtZW50KHVybCwgbWFwID0gbmV3IE1hcCgpKXsgICAgICAgIFxuICAgICAgICBpZiAobWFwIGluc3RhbmNlb2YgTWFwID09PSBmYWxzZSkgbWFwID0gRmlsZU9wZXJhdGlvbnMub2JqZWN0VG9NYXAobWFwKTsgICAgICAgXG4gICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0VVJMKHVybCk7XG4gICAgICAgIHJldHVybiBGaWxlT3BlcmF0aW9ucy5zdHJpbmdUb0RPTUVsZW1lbnQodGV4dCwgbWFwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgZG9tIGVsZW1lbnQgZnJvbSB0ZXh0LlxuICAgICAqIEBwYXJhbSB7dHlwZX0gdGV4dFxuICAgICAqIEBwYXJhbSB7dHlwZX0gbWFwXG4gICAgICogQHJldHVybnMge25vZGV8RmlsZU9wZXJhdGlvbnMubG9hZERPTUVsZW1lbnQuZG9tRWxlbWVudH1cbiAgICAgKi9cbiAgICBzdGF0aWMgc3RyaW5nVG9ET01FbGVtZW50KHRleHQsIG1hcCA9IG5ldyBNYXAoKSl7XG4gICAgICAgIC8qIHJlcGxhY2UgdmFyaWFibGVzIHdpdGggdmFsdWVzICovXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBtYXAua2V5cygpKXsgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG1hcC5nZXQoa2V5KTtcbiAgICAgICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XT8ke2tleX1bfV1gLCBgZ2ApO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgdmFsdWUpOyAgICBcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIHJlcGxhY2UgdW5maWxsZWQgdmFyaWFibGVzIHdpdGggZW1wdHkgKi9cbiAgICAgICAgbGV0IHJlZ2V4ID0gbmV3IFJlZ0V4cChgWyRdW3tdW159XSpbfV1gLCBgZ2ApO1xuICAgICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHJlZ2V4LCBcIlwiKTsgXG5cbiAgICAgICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSB0ZXh0O1xuICAgICAgICBsZXQgZG9tRWxlbWVudCA9IG51bGw7XG4gICAgICAgIGNvbnNvbGUubG9nKGVsZW1lbnQpO1xuXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgIH1cblxuICAgIHN0YXRpYyBvYmplY3RUb01hcChvYmplY3Qpe1xuICAgICAgICBsZXQgbWFwID0gbmV3IE1hcCgpO1xuICAgICAgICBmb3IgKGxldCBmaWVsZCBpbiBvYmplY3QpeyAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmplY3RbZmllbGRdID09PSBcInN0cmluZ1wiIHx8IHR5cGVvZiBvYmplY3RbZmllbGRdID09PSBcIm51bWJlclwiKXtcbiAgICAgICAgICAgICAgICBtYXAuc2V0KGZpZWxkLCBvYmplY3RbZmllbGRdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH1cblxuICAgIFxuXG4gICAgLypcbiAgICAgKiBUcmFuc2ZlciBjb250ZW50cyBvZiAnZmlsZW5hbWUnIGZyb20gc2VydmVyIHRvIGNsaWVudC5cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZmlsZW5hbWVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdWNjZXNzQ2FsbGJhY2tcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcnJvckNhbGxiYWNrXG4gICAgICogQHJldHVybnMge1N0cmluZ30gY29udGVudHMgb2YgZmlsZVxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRVUkwodXJsKSB7XG4gICAgICAgIGxldCBjYWxsYmFjayA9IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHZhciB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgICAgICB4aHR0cC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHhodHRwLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHhodHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwIDogeGh0dHAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzIDogeGh0dHAuc3RhdHVzLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0IDogeGh0dHAucmVzcG9uc2VUZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybCA6IHVybFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICB4aHR0cC5zZW5kKG51bGwpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IGRvbSBlbGVtZW50IGZyb20gdGV4dC5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHRleHRcbiAgICAgKiBAcGFyYW0ge3R5cGV9IG1hcFxuICAgICAqIEByZXR1cm5zIHtub2RlfEZpbGVPcGVyYXRpb25zLmxvYWRET01FbGVtZW50LmRvbUVsZW1lbnR9XG4gICAgICovXG4gICAgc3RhdGljIGFzeW5jIGdldEZpbGUodXJsLCBtYXAgPSBuZXcgTWFwKCkpe1xuICAgICAgICBsZXQgdGV4dCA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLmdldFVSTCh1cmwpO1xuXG4gICAgICAgIC8qIHJlcGxhY2UgdmFyaWFibGVzIHdpdGggdmFsdWVzICovXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBtYXAua2V5cygpKXtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG1hcC5nZXQoa2V5KTtcbiAgICAgICAgICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoYFskXVt7XT8ke2tleX1bfV1gLCBgZ2ApO1xuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZShyZWdleCwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLyogcmVwbGFjZSB1bmZpbGxlZCB2YXJpYWJsZXMgd2l0aCBlbXB0eSAqL1xuICAgICAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKGBbJF1be11bXn1dKlt9XWAsIGBnYCk7XG4gICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UocmVnZXgsIFwiXCIpO1xuXG4gICAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cblxuICAgIC8qXG4gICAgICogVHJhbnNmZXIgY29udGVudHMgb2YgJ2ZpbGVuYW1lJyBmcm9tIHNlcnZlciB0byBjbGllbnQgdXNpbmcgY3VycmVudCB3aW5kb3cgbG9jYXRpb24uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gc3VjY2Vzc0NhbGxiYWNrXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZXJyb3JDYWxsYmFja1xuICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgc3RhdGljIGdldExvY2FsKGZpbGVuYW1lKSB7XG4gICAgICAgIGxldCBjYWxsYmFjayA9IGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHZhciB4aHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcbiAgICAgICAgICAgIHZhciB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZiArIFwiL1wiICsgZmlsZW5hbWU7XG5cbiAgICAgICAgICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoeGh0dHAucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoeGh0dHAuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCh4aHR0cC5zdGF0dXMsIHhodHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB4aHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgICAgICAgICB4aHR0cC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoY2FsbGJhY2spO1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBDYXVzZSAndGV4dCcgdG8gYmUgc2F2ZWQgYXMgJ2ZpbGVuYW1lJyBjbGllbnQgc2lkZS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IGZpbGVuYW1lIFRoZSBkZWZhdWx0IGZpbGVuYW1lIHRvIHNhdmUgdGhlIHRleHQgYXMuXG4gICAgICogQHBhcmFtIHt0eXBlfSB0ZXh0IFRoZSB0ZXh0IHRvIHNhdmUgdG8gZmlsZW5hbWUuXG4gICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgc2F2ZVRvRmlsZSh0ZXh0LCBmaWxlbmFtZSkge1xuICAgICAgICBsZXQgYW5jaG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICBsZXQgZGF0YSA9IFwidGV4dDtjaGFyc2V0PXV0Zi04LFwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpO1xuICAgICAgICBhbmNob3Iuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCBcImRhdGE6XCIgKyBkYXRhKTtcbiAgICAgICAgYW5jaG9yLnNldEF0dHJpYnV0ZShcImRvd25sb2FkXCIsIGZpbGVuYW1lKTtcbiAgICAgICAgYW5jaG9yLmNsaWNrKCk7XG4gICAgfVxufVxuXG5GaWxlT3BlcmF0aW9ucy5Ob2RlVHlwZSA9IHtcbiAgICBFTEVNRU5UIDogMSxcbiAgICBBVFRSSUJVVEUgOiAyLFxuICAgIFRFWFQgOiAzLCBcbiAgICBDREFUQVNFQ1RJT04gOiA0LFxuICAgIEVOVElUWVJFRkVSTkNFIDogNSxcbiAgICBFTlRJVFkgOiA2LFxuICAgIFBST0NFU1NJTkdJTlNUUlVDVElPTiA6IDcsXG4gICAgQ09NTUVOVCA6IDgsXG4gICAgRE9DVU1FTlQgOiA5LFxuICAgIERPQ1VNRU5UVFlQRSA6IDEwLFxuICAgIERPQ1VNRU5URlJBR01FTlQgOiAxMSxcbiAgICBOT1RBVElPTiA6IDEyXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVPcGVyYXRpb25zOyIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1vdXNlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWludGVyZmFjZXMvTW91c2VcIiksIFxuICAgIGRyYWcgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9EcmFnXCIpLFxuICAgIGRyb3AgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9Ecm9wXCIpLFxuICAgIG1vdmFibGUgOiByZXF1aXJlKFwiLi9uaWRnZXQtaW50ZXJmYWNlcy9Nb3ZhYmxlXCIpLFxuICAgIHJlc2l6ZSA6IHJlcXVpcmUoXCIuL25pZGdldC1pbnRlcmZhY2VzL1Jlc2l6ZVwiKVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBTaW5nbHRvbiBjbGFzcyB0byBhZGQgZnVuY3Rpb25hbGl0eSB0byB0aGUgbW91c2UuXG4gKi9cbmNsYXNzIE1vdXNlVXRpbGl0aWVzIHtcbiAgICBcbiAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudCA9IG51bGw7XG4gICAgICAgIHRoaXMubGFzdFggPSAwO1xuICAgICAgICB0aGlzLmxhc3RZID0gMDtcbiAgICB9XG4gICAgXG4gICAgaXNVbmRlcihldmVudCwgZWxlbWVudCkge1xuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WTtcbiAgICAgICAgbGV0IGN1cnJlbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuXG4gICAgICAgIHdoaWxlIChjdXJyZW50KSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudCA9PT0gZWxlbWVudCkgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXRVbmRlcihldmVudCkge1xuICAgICAgICBsZXQgeCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgIGxldCB5ID0gZXZlbnQuY2xpZW50WTtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG4gICAgfVxuXG4gICAgc2V0IGVsZW1lbnQoZWxlbWVudCl7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkRWxlbWVudCAhPT0gbnVsbCl7XG4gICAgICAgICAgICB0aGlzLmRldGFjaEVsZW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVsZW1lbnQgfHwgZWxlbWVudCA9PT0gbnVsbCB8fCBlbGVtZW50ID09PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGhpcy5kZXRhY2hFbGVtZW50KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaEVsZW1lbnQoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZ2V0IGVsZW1lbnQoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXR0YWNoZWRFbGVtZW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGFjaCBhbiBlbGVtZW50LiAgSWYgdGhlIGVsZW1lbnQgZG9lc24ndCBoYXZlIGEgcGFyZW50IGl0IHdpbGwgYmVcbiAgICAgKiBhdHRhY2hlZCB0byB0aGUgZG9jdW1lbnQgYW5kIHdpbGwgYmUgZGV0YWNoZWQgd2hlbiBkZXRhY2hFbGVtZW50IGlzIGNhbGxlZC5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIGF0dGFjaEVsZW1lbnQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgIFxuICAgICAgICBpZiAoZWxlbWVudC5wYXJlbnQpe1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2FuIG5vdCBhdHRhY2ggZWxlbWVudCB0byBtb3VzZSBpZiB0aGUgZWxlbWVudCBoYXMgYSBwYXJlbnQgZWxlbWVudC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQoZWxlbWVudCk7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7IFxuICAgICAgICBlbGVtZW50LnN0eWxlLnRvcCA9IGV2ZW50LmNsaWVudFkgKyBcInB4XCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IGV2ZW50LmNsaWVudFggKyBcInB4XCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUucG9pbnRlckV2ZW50cyA9IFwibm9uZVwiO1xuICAgICAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IFwiMTAwMDBcIjtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubW92ZUNhbGxCYWNrID0gKGV2ZW50KT0+dGhpcy5vbk1vdXNlTW92ZShldmVudCk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMubW92ZUNhbGxCYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgbGlzdGVuZXJzIGZyb20gdGhlIGF0dGFjaGVkIGVsZW1lbnQsIGRvIG5vdCByZW1vdmUgaXQgZnJvbSB0aGVcbiAgICAgKiBkb2N1bWVudC5cbiAgICAgKiBAcmV0dXJucyB7dHlwZX1cbiAgICAgKi9cbiAgICBkZXRhY2hFbGVtZW50KCl7XG4gICAgICAgIGlmICh0aGlzLmF0dGFjaGVkRWxlbWVudCA9PT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3ZlQ2FsbEJhY2spOyAgICAgICAgXG4gICAgICAgIGxldCBydmFsdWUgPSB0aGlzLmF0dGFjaGVkRWxlbWVudDtcbiAgICAgICAgdGhpcy5hdHRhY2hlZEVsZW1lbnQgPSBudWxsOyAgICAgICAgXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQocnZhbHVlKTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiBydmFsdWU7XG4gICAgfVxuXG4gICAgb25Nb3VzZU1vdmUoZXZlbnQpIHsgICAgICAgIFxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmxhc3RYID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgdGhpcy5sYXN0WSA9IGV2ZW50LmNsaWVudFk7XG5cbiAgICAgICAgLy8gc2V0IHRoZSBlbGVtZW50J3MgbmV3IHBvc2l0aW9uOlxuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudC5zdHlsZS50b3AgPSBldmVudC5jbGllbnRZICsgXCJweFwiO1xuICAgICAgICB0aGlzLmF0dGFjaGVkRWxlbWVudC5zdHlsZS5sZWZ0ID0gZXZlbnQuY2xpZW50WCArIFwicHhcIjtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1vdXNlVXRpbGl0aWVzKCk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBwcmVmaXg6IFwiZGF0YS1uaWRnZXRcIixcbiAgICBlbGVtZW50QXR0cmlidXRlOiBcImRhdGEtbmlkZ2V0LWVsZW1lbnRcIixcbiAgICBzcmNBdHRyaWJ1dGU6IFwic3JjXCIsXG4gICAgdGVtcGxhdGVTcmNBdHRyaWJ1dGU6IFwidGVtcGxhdGUtc3JjXCIsXG4gICAgbmFtZUF0dHJpYnV0ZTogXCJuYW1lXCIsXG4gICAgaW50ZXJmYWNlQXR0cmlidXRlOiBcImludGVyZmFjZXNcIixcbiAgICB0ZW1wbGF0ZUF0dHJpYnV0ZTogXCJ0ZW1wbGF0ZS1pZFwiLFxuICAgIGludGVyZmFjZURhdGFGaWVsZDogXCJpbnRlcmZhY2VEYXRhXCIsXG4gICAgbW9kZWxEYXRhRmllbGQ6IFwibW9kZWxEYXRhXCIsXG4gICAgc3R5bGVBdHRyaWJ1dGU6IFwibmlkZ2V0LXN0eWxlXCJcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBGaWxlT3BlcmF0aW9ucyA9IHJlcXVpcmUoXCIuL0ZpbGVPcGVyYXRpb25zXCIpO1xuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIi4vTmlkZ2V0XCIpO1xuY29uc3QgSW50ZXJmYWNlcyA9IHJlcXVpcmUoXCIuL0ludGVyZmFjZXNcIik7XG5jb25zdCBUcmFuc2Zvcm1lciA9IHJlcXVpcmUoXCIuL1RyYW5zZm9ybWVyXCIpO1xuY29uc3QgTmlkZ2V0U3R5bGUgPSByZXF1aXJlKFwiLi9OaWRnZXRTdHlsZVwiKTtcblxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIHc6aCBhc3BlY3QgcmF0aW8gYW5kIGFkanVzdCB0aGUgcHJvcG9ydGlvbnMgYWNjb3JkaW5nbHkuXG4gKlxuICovXG5jbGFzcyBBc3BlY3RSYXRpb3tcbiAgICBjb25zdHJ1Y3RvcihuaWRnZXQpIHtcbiAgICAgICAgdGhpcy5uaWRnZXQgPSBuaWRnZXQ7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKCk9PnRoaXMub25SZXNpemUoKSk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLm5pZGdldCk7XG4gICAgICAgIHRoaXMucGFyc2VWYWx1ZXMoKTtcbiAgICAgICAgdGhpcy5vblJlc2l6ZSgpO1xuICAgICAgICB0aGlzLmxvYWRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGdldFZhbHVlKCl7XG4gICAgICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKEFzcGVjdFJhdGlvLkNTU19BVFRSSUJVVEUpO1xuICAgIH1cblxuICAgIHBhcnNlVmFsdWVzKCl7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcbiAgICAgICAgbGV0IHNwbGl0ID0gdmFsdWUuc3BsaXQoL1sgLDtdL2cpO1xuXG4gICAgICAgIGZvciAobGV0IHMgb2Ygc3BsaXQpe1xuICAgICAgICAgICAgaWYgKHMuc3BsaXQoL1stOl0vKS5sZW5ndGggPT09IDIpe1xuICAgICAgICAgICAgICAgIGxldCByYXRpbyA9IHMuc3BsaXQoL1stOl0vKTtcbiAgICAgICAgICAgICAgICB0aGlzLndpZHRoID0gcGFyc2VJbnQocmF0aW9bMF0pO1xuICAgICAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gcGFyc2VJbnQocmF0aW9bMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocyA9PT0gXCJoXCIpe1xuICAgICAgICAgICAgICAgIHRoaXMub25SZXNpemUgPSAoKT0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMubmlkZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUud2lkdGggPSAoaGVpZ2h0ICogdGhpcy53aWR0aCAvIHRoaXMuaGVpZ2h0KSArIFwicHhcIlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUmVzaXplKCl7XG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMubmlkZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xuICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5oZWlnaHQgPSAod2lkdGggKiB0aGlzLmhlaWdodCAvIHRoaXMud2lkdGgpICsgXCJweFwiO1xuICAgIH1cbn1cblxuQXNwZWN0UmF0aW8uQ1NTX0FUVFJJQlVURSA9IFwiLS1uaWRnZXQtYXNwZWN0LXJhdGlvXCI7XG5cbi8qKlxuICogQSBOaWRnZXRFbGVtZW50IGlzIGEgMToxIGNsYXNzLW9iamVjdDpkb20tb2JqZWN0IHBhaXJpbmcuICBBY3Rpb25zIG9uIHRoZSBET00gXG4gKiBvYmplY3Qgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGJ5IHRoZSBOaWRnZXRFbGVtZW50IG9iamVjdC4gIFRoZSBpbnRlcmZhY2VEYXRhXG4gKiBmaWVsZCBpcyByZXNlcnZlZCBmb3IgZGF0YSBmcm9tIGludGVyZmFjZXMuICBJbnRlcmZhY2VzIHNob3VsZCBwdXQgdGhlaXIgXG4gKiBjdXN0b20gZGF0YSB1bmRlciBbaW50ZXJmYWNlRGF0YUZpZWxkXS5baW50ZXJmYWNlTmFtZV0uICBUaGUgaW50ZXJmYWNlIGRhdGFcbiAqIGF0dHJpYnV0ZSBpcyBzZXQgd2l0aCB0aGUgc3RhdGljIHZhbHVlIE5pZGdldC5pbnRlcmZhY2VEYXRhRmllbGQuXG4gKiBcbiAqIENhbGxpbmcgbWV0aG9kcyBvbiB0aGUgbmlkZ2V0IHdpbGwgdHJlYXQgc2hhZG93IGNvbnRlbnRzIGFzIHJlZ3VsYXIgY29udGVudHMuXG4gKi9cbmNsYXNzIE5pZGdldEVsZW1lbnQgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IE5pZGdldCBhc3NvY2lhdGVkIHdpdGggJ2VsZW1lbnQnLiAgQW4gZXJyb3Igd2lsbCBiZSB0aHJvd25cbiAgICAgKiBpZiB0aGUgJ2VsZW1lbnQnIGlzIGFscmVhZHkgYXNzb2NpYXRlZCB3aXRoIGEgTmlkZ2V0LlxuICAgICAqIFxuICAgICAqIERpc2FibGVkIGNsYXNzIGluZGljYXRlcyB0aGlzIG5pZGdldCB3aWxsIGlnbm9yZSBtb3VzZSBldmVudHMuXG4gICAgICogXG4gICAgICogQHBhcmFtIHt0eXBlfSBlbGVtZW50IEpRdWVyeSBzZWxlY3RvclxuICAgICAqIEByZXR1cm4ge25tJF9OaWRnZXQuTmlkZ2V0RWxlbWVudH1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih0ZW1wbGF0ZUlkKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXNbTmlkZ2V0LmludGVyZmFjZURhdGFGaWVsZF0gPSB7fTtcbiAgICAgICAgdGhpc1tOaWRnZXQubW9kZWxEYXRhRmllbGRdID0ge307XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtZXIodGhpcyk7XG4gICAgICAgIHRoaXMub2JzZXJ2ZXJzID0ge307XG5cbiAgICAgICAgaWYgKHRlbXBsYXRlSWQpe1xuICAgICAgICAgICAgdGhpcy5hcHBseVRlbXBsYXRlKHRlbXBsYXRlSWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrIGlzIGludm9rZWQgZWFjaCB0aW1lIHRoZSBjdXN0b20gZWxlbWVudCBpcyBhcHBlbmRlZCBpbnRvIGEgZG9jdW1lbnQtY29ubmVjdGVkIGVsZW1lbnRcbiAgICAgKi9cbiAgICBhc3luYyBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgdGhpcy5zaGFkb3dDb250ZW50cyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQXR0cmlidXRlKE5pZGdldC50ZW1wbGF0ZUF0dHJpYnV0ZSkpe1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5hcHBseVRlbXBsYXRlKHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldC50ZW1wbGF0ZUF0dHJpYnV0ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ub3RpZnlTdHlsZXMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZSBhIG1hcCBvZiBhbGwgZGF0YSBhdHRyaWJ1dGVzXG4gICAgICogQHJldHVybnMge01hcDxhbnksIGFueT59XG4gICAgICovXG4gICAgZGF0YUF0dHJpYnV0ZXMoKSB7XG4gICAgICAgIGxldCBtYXAgPSBuZXcgTWFwKCk7XG4gICAgICAgIGZvciAobGV0IGF0dHIgb2YgdGhpcy5hdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBpZiAoYXR0ci5uYW1lLnN0YXJ0c1dpdGgoXCJkYXRhLVwiKSkge1xuICAgICAgICAgICAgICAgIGxldCBuYW1lID0gYXR0ci5uYW1lLnN1YnN0cig1KTtcbiAgICAgICAgICAgICAgICBtYXBbbmFtZV0gPSBhdHRyLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuXG4gICAgbm90aWZ5U3R5bGVzKCl7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgYXIgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMpLmdldFByb3BlcnR5VmFsdWUoQXNwZWN0UmF0aW8uQ1NTX0FUVFJJQlVURSk7XG4gICAgICAgICAgICAgICAgaWYgKGFyICE9PSBcIlwiKSBuZXcgQXNwZWN0UmF0aW8odGhpcyk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0YWNoIGEgc2hhZG93IGVsZW1lbnQgd2l0aCB0aGUgY29udGVudHMgb2YgdGhlIHRlbXBsYXRlIG5hbWVkICh0ZW1wbGF0ZUlEKS5cbiAgICAgKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gICAgICovXG4gICAgYXN5bmMgYXBwbHlUZW1wbGF0ZSh0ZW1wbGF0ZUlkKSB7XG4gICAgICAgIGlmICh0aGlzLnNoYWRvd1Jvb3QgIT09IG51bGwpIHJldHVybjtcbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGVtcGxhdGVJZCk7XG5cbiAgICAgICAgaWYgKCF0ZW1wbGF0ZSkgdGhyb3cgbmV3IEVycm9yKFwiVGVtcGxhdGUgJ1wiICsgdGVtcGxhdGVJZCArIFwiJyBub3QgZm91bmQuXCIpO1xuICAgICAgICBpZiAodGVtcGxhdGUudGFnTmFtZS50b1VwcGVyQ2FzZSgpICE9PSBcIlRFTVBMQVRFXCIpIHRocm93IG5ldyBFcnJvcihcIkVsZW1lbnQgd2l0aCBpZCAnXCIgKyB0ZW1wbGF0ZUlkICsgXCInIGlzIG5vdCBhIHRlbXBsYXRlLlwiKTtcblxuICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7bW9kZTogJ29wZW4nfSkuYXBwZW5kQ2hpbGQodGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgICBhd2FpdCB0aGlzLnJlYWR5KCk7XG4gICAgfVxuXG4gICAgYXN5bmMgcmVhZHkoKXtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvYWQgY29udGVudHMgb2YgZmlsZSBpbnRvIHRoaXMgZWxlbWVudC5cbiAgICAgKiBSZXBsYWNlIGFsbCAke30gdmFyaWFibGVzIHdpdGggY29udGVudHMgb2YgJ21hcCcuXG4gICAgICovXG4gICAgYXN5bmMgcmV0cmlldmVTb3VyY2UobWFwKXtcbiAgICAgICAgbGV0IHNyYyA9IHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldC5zcmNBdHRyaWJ1dGUpO1xuICAgICAgICBsZXQgdGV4dCA9IGF3YWl0IEZpbGVPcGVyYXRpb25zLmdldEZpbGUoc3JjLCBtYXApO1xuICAgICAgICB0aGlzLmlubmVySFRNTCA9IHRleHQ7XG4gICAgfVxuXG4gICAgc3RhdGljIGFzeW5jIGxvYWRUZW1wbGF0ZVNuaXBwZXQoZmlsZW5hbWUsIHRhZ25hbWUpe1xuICAgICAgICBsZXQgaWQgPSBmaWxlbmFtZS5yZXBsYWNlKC9bXFwvLyAuLV0rL2csIFwiX1wiKTtcblxuICAgICAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2lkfWApKXtcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gYXdhaXQgRmlsZU9wZXJhdGlvbnMuZ2V0RmlsZShmaWxlbmFtZSk7XG4gICAgICAgICAgICBsZXQgdGVtcGxhdGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGVtcGxhdGVcIik7XG4gICAgICAgICAgICB0ZW1wbGF0ZS5pbm5lckhUTUwgPSB0ZXh0O1xuICAgICAgICAgICAgdGVtcGxhdGUuc2V0QXR0cmlidXRlKFwiaWRcIiwgaWQpO1xuICAgICAgICAgICAgaWYgKHRhZ25hbWUpIHRlbXBsYXRlLnNldEF0dHJpYnV0ZShcImRhdGEtbmlkZ2V0XCIsIHRhZ25hbWUpO1xuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmQodGVtcGxhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aWR9YCk7XG5cbiAgICAgICAgZm9yIChsZXQgZWxlIG9mIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGFnbmFtZSkpe1xuICAgICAgICAgICAgYXdhaXQgZWxlLmluamVjdFRlbXBsYXRlKHRlbXBsYXRlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSAnaGlkZGVuJyBjbGFzcy5cbiAgICAgKi9cbiAgICBzaG93KCkge1xuICAgICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkICdoaWRkZW4nIGNsYXNzLlxuICAgICAqL1xuICAgIGhpZGUoKSB7XG4gICAgICAgIHRoaXMuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGRpc2FibGVkIGZsYWcgdGhhdCBpcyByZWFkIGJ5IG5pZGdldCBtb3VzZSBmdW5jdGlvbnMuXG4gICAgICogQHBhcmFtIHZhbHVlXG4gICAgICovXG4gICAgc2V0IGRpc2FibGVkKHZhbHVlKXtcbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShOaWRnZXRFbGVtZW50LkRJU0FCTEVEX0FUVFJJQlVURSwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShOaWRnZXRFbGVtZW50LkRJU0FCTEVEX0FUVFJJQlVURSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBkaXNhYmxlZCBmbGFnIHRoYXQgaXMgcmVhZCBieSBuaWRnZXQgbW91c2UgZnVuY3Rpb25zLlxuICAgICAqIEBwYXJhbSB2YWx1ZVxuICAgICAqL1xuICAgIGdldCBkaXNhYmxlZCgpe1xuICAgICAgICBpZiAoIXRoaXMuaGFzQXR0cmlidXRlKE5pZGdldEVsZW1lbnQuRElTQUJMRURfQVRUUklCVVRFKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoTmlkZ2V0RWxlbWVudC5ESVNBQkxFRF9BVFRSSUJVVEUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoaXMgZWxlbWVudCB3YXMgdW5kZXIgdGhlIG1vdXNlIGZvciB0aGUgZXZlbnQuXG4gICAgICogQHBhcmFtIHt0eXBlfSBldmVudFxuICAgICAqIEBwYXJhbSB7dHlwZX0gZWxlbWVudFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNVbmRlck1vdXNlKGV2ZW50KSB7XG4gICAgICAgIGxldCB4ID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgbGV0IHkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICBsZXQgY3VycmVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSk7XG5cbiAgICAgICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50ID09PSB0aGlzKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1biB0aGUgcXVlcnkgc2VsZWN0b3Igb24gdGhpcyBlbGVtZW50LlxuICAgICAqIElmIHRoaXMgZWxlbWVudCBoYXMgYSBzaGFkb3csIHJ1biBpdCBvbiB0aGF0IGluc3RlYWQuXG4gICAgICogQHBhcmFtIHNlbGVjdG9yc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudFRhZ05hbWVNYXBbS119XG4gICAgICovXG4gICBxdWVyeVNlbGVjdG9yKHNlbGVjdG9ycykge1xuICAgICAgICBpZiAodGhpcy5zaGFkb3dSb290KXtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3RvcihzZWxlY3RvcnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHN1cGVyLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3JzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1biB0aGUgcXVlcnkgc2VsZWN0b3Igb24gdGhpcyBlbGVtZW50LlxuICAgICAqIElmIHRoaXMgZWxlbWVudCBoYXMgYSBzaGFkb3csIHJ1biBpdCBvbiB0aGF0IGluc3RlYWQuXG4gICAgICogQHBhcmFtIHNlbGVjdG9yc1xuICAgICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudFRhZ05hbWVNYXBbS119XG4gICAgICovXG4gICAgcXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpIHtcbiAgICAgICAgaWYgKHRoaXMuc2hhZG93Um9vdCl7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzdXBlci5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgdGhpcyBlbGVtZW50IGZyb20gaXQncyBwYXJlbnQuXG4gICAgICovXG4gICAgZGV0YWNoKCl7XG4gICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbmRleCB3aXRoaW4gdGhlIHBhcmVudCBlbGVtZW50LlxuICAgICAqL1xuICAgIGluZGV4KCl7XG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMucGFyZW50RWxlbWVudC5jaGlsZHJlbikuaW5kZXhPZih0aGlzKTtcbiAgICB9XG59XG5cbk5pZGdldEVsZW1lbnQuRElTQUJMRURfQVRUUklCVVRFID0gXCJuaWRnZXQtZGlzYWJsZWRcIjtcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1lbGVtZW50JywgTmlkZ2V0RWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEVsZW1lbnQ7IiwiJ3VzZSBzdHJpY3QnO1xuLyoqXG4gKiBNYW5pcHVsYXRlcyB0aGUgZWxlbWVudHMgc3R5bGUgd2l0aCBqcyByb3V0aW5lcyBhY2NvcmRpbmcgdG8gY3NzIGZsYWdzLlxuICogTmlkZ2V0IHN0eWxlIGlzIGFwcGxpZWQgdG8gYWxsIG5pZGdldC1lbGVtZW50cyB1bmxlc3MgdGhleSBoYXZlIHRoZSBuaWRnZXQtc3R5bGVcbiAqIGF0dHJpYnV0ZSBzZXQgdG8gJ2ZhbHNlJy5cbiAqL1xuXG5jbGFzcyBOaWRnZXRTdHlsZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihuaWRnZXQpIHtcbiAgICAgICAgdGhpcy5uaWRnZXQgPSBuaWRnZXQ7XG4gICAgICAgIHRoaXMuYXBwbHkoKTtcbiAgICB9XG4gICAgXG4gICAgYXBwbHkoKSB7XG4gICAgICAgIHRoaXMubmlkZ2V0V2lkdGhSYXRpbygpO1xuICAgICAgICB0aGlzLm5pZGdldEhlaWdodFJhdGlvKCk7XG4gICAgICAgIHRoaXMubmlkZ2V0Rml0VGV4dCgpO1xuICAgICAgICB0aGlzLm5pZGdldEZpdFRleHRXaWR0aCgpO1xuICAgICAgICB0aGlzLm5pZGdldFZlcnRBbGlnblRleHQoKTtcbiAgICB9XG4gICAgXG4gICAgbmlkZ2V0V2lkdGhSYXRpbygpIHtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LXdpZHRoLXJhdGlvXCIpO1xuICAgICAgICBpZiAoIXBhcnNlRmxvYXQocmF0aW8pKSByZXR1cm47ICAgICAgICAgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgbmV3IFJlc2l6ZU9ic2VydmVyKCgpID0+IHsgICAgICAgICAgICBcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LndpZHRoID0gdGhpcy5uaWRnZXQuaGVpZ2h0ICogcmF0aW87XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxuICAgIH1cbiAgICBcbiAgICBuaWRnZXRIZWlnaHRSYXRpbygpIHtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWhlaWdodC1yYXRpb1wiKTtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuOyAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7ICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLm5pZGdldC5oZWlnaHQgPSB0aGlzLm5pZGdldC53aWR0aCAqIHJhdGlvO1xuICAgICAgICB9KS5vYnNlcnZlKHRoaXMubmlkZ2V0KTsgICAgICBcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaWxsIHRoZSB0ZXh0IGhlaWdodCB0byBtYXRjaCB0aGUgZWxlbWVudCBoZWlnaHQuXG4gICAgICogQ2hhbmdlIHRoZSByYXRpbyB2YWx1ZSAob3IgdGhlIGZvbnRTaXplKSBhZGp1c3QuXG4gICAgICovXG4gICAgbmlkZ2V0Rml0VGV4dCgpIHtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0XCIpOyAgICAgICAgXG4gICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjtcblxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coYC0tbmlkZ2V0LWZpdC10ZXh0ICR7cmF0aW99YClcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5uaWRnZXQub2Zmc2V0SGVpZ2h0ICogcmF0aW87XG4gICAgICAgICAgICB0aGlzLm5pZGdldC5zdHlsZS5mb250U2l6ZSA9IGggKyBcInB4XCI7XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpOyAgICAgIFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqICBXaWxsIGNoYW5nZSB0aGUgZm9udCBzaXplIHNvIHRoYXQgdGhlIHRleHQgZml0J3MgaW4gdGhlIHBhcmVudCBlbGVtZW50LlxuICAgICAqICBEb24ndCBzZXQgdGhlIHdpZHRoIG9mIHRoZSBlbGVtZW50LlxuICAgICAqL1xuICAgIG5pZGdldEZpdFRleHRXaWR0aCgpIHtcbiAgICAgICAgbGV0IHJlbW92ZSA9IGdldENvbXB1dGVkU3R5bGUodGhpcy5uaWRnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1maXQtdGV4dC13aWR0aFwiKTtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJlbW92ZSkpIHJldHVybjtcblxuICAgICAgICBuZXcgUmVzaXplT2JzZXJ2ZXIoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudFxuXG4gICAgICAgICAgICBsZXQgdGV4dFcgPSB0aGlzLm5pZGdldC5zY3JvbGxXaWR0aDtcbiAgICAgICAgICAgIGxldCBjb250VyA9IHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0V2lkdGg7XG4gICAgICAgICAgICBjb250VyA9IGNvbnRXIC0gcmVtb3ZlO1xuICAgICAgICAgICAgbGV0IGR3ID0gY29udFcvdGV4dFc7XG4gICAgICAgICAgICBsZXQgY29tcHV0ZWRGb250U2l6ZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0LCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKCdmb250LXNpemUnKVxuICAgICAgICAgICAgY29tcHV0ZWRGb250U2l6ZSA9IHBhcnNlSW50KGNvbXB1dGVkRm9udFNpemUpO1xuICAgICAgICAgICAgY29tcHV0ZWRGb250U2l6ZSA9IE1hdGgucm91bmQoY29tcHV0ZWRGb250U2l6ZSk7XG4gICAgICAgICAgICBsZXQgbmV3Rm9udFNpemUgPSBNYXRoLnJvdW5kKGNvbXB1dGVkRm9udFNpemUgKiBkdyk7XG4gICAgICAgICAgICBsZXQgaCA9IHRoaXMubmlkZ2V0Lm9mZnNldEhlaWdodFxuXG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMoY29tcHV0ZWRGb250U2l6ZSAtIG5ld0ZvbnRTaXplKSA8PSAyKSByZXR1cm47XG5cbiAgICAgICAgICAgIGlmIChuZXdGb250U2l6ZSA+IGgpIG5ld0ZvbnRTaXplID0gaDtcblxuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBuZXdGb250U2l6ZSArIFwicHhcIjtcbiAgICAgICAgfSkub2JzZXJ2ZSh0aGlzLm5pZGdldCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0IHRoZSBsaW5lIGhlaWdodCB0byB0aGUgb2Zmc2V0IGhlaWdodCBtdWx0aXBsaWVkIGJ5IHJhdGlvLlxuICAgICAqL1xuICAgIG5pZGdldFZlcnRBbGlnblRleHQoKXtcbiAgICAgICAgbGV0IHJhdGlvID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LXZlcnQtYWxpZ24tdGV4dFwiKTtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xuXG4gICAgICAgIG5ldyBSZXNpemVPYnNlcnZlcigoKSA9PiB7XG4gICAgICAgICAgICBsZXQgaCA9IHRoaXMubmlkZ2V0Lm9mZnNldEhlaWdodCAqIHJhdGlvO1xuICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUubGluZUhlaWdodCA9IGggKyBcInB4XCI7XG4gICAgICAgIH0pLm9ic2VydmUodGhpcy5uaWRnZXQpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRTdHlsZTsiLCIndXNlIHN0cmljdCc7XG5jbGFzcyBUcmFuc2Zvcm17XG4gICAgY29uc3RydWN0b3IodmFsdWUpe1xuICAgICAgICBsZXQgaW5kZXhPZiA9IHZhbHVlLmluZGV4T2YoXCIoXCIpO1xuICAgICAgICB0aGlzLm5hbWUgPSB2YWx1ZS5zdWJzdHJpbmcoMCwgaW5kZXhPZik7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZS5zdWJzdHJpbmcodGhpcy5uYW1lLmxlbmd0aCArIDEsIHZhbHVlLmxlbmd0aCAtIDEpO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLm5hbWUgKyBcIiwgXCIgKyB0aGlzLnZhbHVlKTtcbiAgICB9XG4gICAgXG4gICAgdG9TdHJpbmcoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZSArIFwiKFwiICsgdGhpcy52YWx1ZSArIFwiKVwiO1xuICAgIH0gICAgXG59XG5cbmNsYXNzIFRyYW5zZm9ybWVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB9XG4gICAgXG4gICAgYXBwZW5kKCl7XG4gICAgICAgIGxldCBjb21wdXRlZFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50KVtcInRyYW5zZm9ybVwiXTtcbiAgICAgICAgaWYgKGNvbXB1dGVkU3R5bGUgIT09IFwibm9uZVwiKSB0aGlzLnB1c2goY29tcHV0ZWRTdHlsZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBcbiAgICBjbGVhcigpe1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gXCJcIjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHVuc2hpZnQodmFsdWUpe1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gdmFsdWUgKyBcIiBcIiArIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XG4gICAgfVxuICAgIFxuICAgIHB1c2godmFsdWUpe1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSArIFwiIFwiICsgdmFsdWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gICAgXG4gICAgXG4gICAgc2hpZnQoKXtcbiAgICAgICAgbGV0IGFycmF5ID0gdGhpcy5zcGxpdCgpO1xuICAgICAgICBpZiAoYXJyYXkubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcbiAgICAgICAgYXJyYXkuc2hpZnQoKTtcbiAgICAgICAgdGhpcy5lbGVtZW50LnN0eWxlLnRyYW5zZm9ybSA9IGFycmF5LmpvaW4oXCIgXCIpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgXG4gICAgcG9wKCl7XG4gICAgICAgIGxldCBhcnJheSA9IHRoaXMuc3BsaXQoKTtcbiAgICAgICAgaWYgKGFycmF5Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIFwiXCI7XG4gICAgICAgIGFycmF5LnBvcCgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XG4gICAgICAgIHJldHVybiB0aGlzOyAgICAgIFxuICAgIH1cbiAgICBcbiAgICByZXBsYWNlKHZhbHVlKXtcbiAgICAgICAgbGV0IG5ld1RyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0odmFsdWUpO1xuICAgICAgICBsZXQgYXJyYXkgPSB0aGlzLnNwbGl0KCk7XG4gICAgICAgIFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBlbnRyeSA9IGFycmF5W2ldO1xuICAgICAgICAgICAgbGV0IHRyYW5zZm9ybSA9IG5ldyBUcmFuc2Zvcm0oZW50cnkpO1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybS5uYW1lID09PSBuZXdUcmFuc2Zvcm0ubmFtZSl7XG4gICAgICAgICAgICAgICAgYXJyYXlbaV0gPSBuZXdUcmFuc2Zvcm0udG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gYXJyYXkuam9pbihcIiBcIik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFxuICAgIHNwbGl0KCl7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XG4gICAgICAgIGxldCBzdGFydCA9IDA7XG4gICAgICAgIGxldCBydmFsdWUgPSBbXTtcbiAgICAgICAgbGV0IGxhc3QgPSAnJztcbiAgICAgICAgbGV0IHNraXAgPSBmYWxzZTtcbiAgICAgICAgbGV0IG5lc3RlZFAgPSAwO1xuICAgICAgICBcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKyl7XG4gICAgICAgICAgICBpZiAoIXNraXAgJiYgdmFsdWVbaV0gPT09ICcgJyAmJiBsYXN0ID09PSAnICcpe1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghc2tpcCAmJiB2YWx1ZVtpXSA9PT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgcnZhbHVlLnB1c2godmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCBpKSk7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVtpXSA9PT0gJygnKSB7XG4gICAgICAgICAgICAgICAgbmVzdGVkUCsrO1xuICAgICAgICAgICAgICAgIHNraXAgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZVtpXSA9PT0gJyknKSB7XG4gICAgICAgICAgICAgICAgbmVzdGVkUC0tO1xuICAgICAgICAgICAgICAgIGlmIChuZXN0ZWRQID09PSAwKSBza2lwID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0ID0gdmFsdWVbaV07XG4gICAgICAgIH1cbiAgICAgICAgcnZhbHVlLnB1c2godmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCB2YWx1ZS5sZW5ndGgpKTtcbiAgICAgICAgcmV0dXJuIHJ2YWx1ZTtcbiAgICB9XG4gICAgXG4gICAgdG9TdHJpbmcoKXtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5zdHlsZS50cmFuc2Zvcm07XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYW5zZm9ybWVyOyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgTmlkZ2V0RWxlbWVudCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIEEgTmlkZ2V0IHRoYXQgY2hhbmdlcyB0aGUgaW1hZ2UgZm9yIGhvdmVyLCBkaXNhYmxlZCwgcHJlc3MsIGFuZCBpZGxlLlxuICogRmlyZXMgYSBjbGljayBldmVudCB3aGVuIGNsaWNrZWQuXG4gKlxuICogV2lsbCBzZXQgdGhlIGN1cnJlbnQgc3RhdGUgYXMgZGF0YS1zdGF0ZSBzbyB0aGF0IGNzcyBjYW4gYWNjZXNzIGl0LlxuICovXG5jbGFzcyBOaWRnZXRCdXR0b24gZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgICAgICB0aGlzLmFscGhhVG9sZXJhbmNlID0gMDsgLy8gYWxwaGEgbmVlZHMgdG8gYmUgPiB0b2xlcmFuY2UgdG8gdHJpZ2dlciBldmVudHMuXG5cbiAgICAgICAgdGhpcy5zdHJpbmdIb3ZlciA9IFwibmlkZ2V0LWJ1dHRvbi1zdGF0ZVtzdGF0ZT0nSE9WRVInXVwiO1xuICAgICAgICB0aGlzLnN0cmluZ0Rpc2FibGVkID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdESVNBQkxFRCddXCI7XG4gICAgICAgIHRoaXMuc3RyaW5nUHJlc3MgPSBcIm5pZGdldC1idXR0b24tc3RhdGVbc3RhdGU9J1BSRVNTJ11cIjtcbiAgICAgICAgdGhpcy5zdHJpbmdJZGxlID0gXCJuaWRnZXQtYnV0dG9uLXN0YXRlW3N0YXRlPSdJRExFJ11cIjtcblxuICAgICAgICB0aGlzLnN0YXRlID0gXCJpZGxlXCI7XG4gICAgfVxuXG4gICAgaXNJblNldCgpIHtcbiAgICAgICAgbGV0IHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgICAgICAgd2hpbGUgKHBhcmVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAocGFyZW50LnRhZ05hbWUgPT09IFwiTklER0VULUJVVFRPTi1TRVRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudE5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIG5pZGdldFJlYWR5KCkge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0Rpc2FibGVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc0luU2V0KCkpIHJldHVybjtcblxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIHRoaXMubW91c2VFbnRlcik7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZUxlYXZlKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIHRoaXMubW91c2VQcmVzcyk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgdGhpcy5tb3VzZVJlbGVhc2UpO1xuXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZGlzYWJsZWQpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgaXNVbmRlcihldmVudCkge1xuICAgICAgICBsZXQgZWxlbWVudHMgPSBkb2N1bWVudC5lbGVtZW50c0Zyb21Qb2ludChldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcbiAgICAgICAgaWYgKGVsZW1lbnRzLmluZGV4T2YodGhpcy5hY3RpdmVOaWRnZXQpID09IC0xKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmFjdGl2ZU5pZGdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgbGV0IHggPSBldmVudC5jbGllbnRYIC0gcmVjdC54O1xuICAgICAgICBsZXQgeSA9IGV2ZW50LmNsaWVudFkgLSByZWN0Lnk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMudGVzdEFscGhhKHgsIHkpO1xuICAgIH1cblxuICAgIGdldCBkaXNhYmxlZCgpIHtcbiAgICAgICAgcmV0dXJuIHN1cGVyLmRpc2FibGVkO1xuICAgIH1cblxuICAgIHNldCBkaXNhYmxlZCh2YWx1ZSkge1xuICAgICAgICBzdXBlci5kaXNhYmxlZCA9IHZhbHVlO1xuXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0Rpc2FibGVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImluXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdIb3ZlcjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcInByZXNzXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdQcmVzcztcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0lkbGU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgbW91c2VSZWxlYXNlKGUpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5hY3RpdmVOaWRnZXQgPSB0aGlzLnN0cmluZ0hvdmVyO1xuICAgIH1cblxuICAgIG1vdXNlUHJlc3MoZSkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJwcmVzc1wiO1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nUHJlc3M7XG4gICAgfVxuXG4gICAgaGlkZUFsbEltYWdlcygpIHtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nSG92ZXIpLmhpZGUoKTtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nRGlzYWJsZWQpLmhpZGUoKTtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nUHJlc3MpLmhpZGUoKTtcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKHRoaXMuc3RyaW5nSWRsZSkuaGlkZSgpO1xuICAgIH1cblxuICAgIHNldCBhY3RpdmVOaWRnZXQoc2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5oaWRlQWxsSW1hZ2VzKCk7XG4gICAgICAgIHRoaXMuX2FjdGl2ZU5pZGdldCA9IHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICAgIHRoaXMuX2FjdGl2ZU5pZGdldC5zaG93KCk7XG4gICAgfVxuXG4gICAgZ2V0IGFjdGl2ZU5pZGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGl2ZU5pZGdldDtcbiAgICB9XG5cbiAgICBzZXQgc3RhdGUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJkYXRhLXN0YXRlXCIsIHZhbHVlKTtcbiAgICB9XG5cbiAgICBnZXQgc3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShcImRhdGEtc3RhdGVcIik7XG4gICAgfVxuXG4gICAgdGVzdEFscGhhKHgsIHkpIHtcbiAgICAgICAgbGV0IHBpeGVsID0gdGhpcy5hY3RpdmVOaWRnZXQuZ2V0UGl4ZWwoeCwgeSk7XG4gICAgICAgIHJldHVybiBwaXhlbFszXSA+IHRoaXMuYWxwaGFUb2xlcmFuY2U7XG4gICAgfVxuXG4gICAgbW91c2VMZWF2ZSgpIHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFwib3V0XCI7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdJZGxlO1xuICAgIH1cblxuICAgIG1vdXNlQWN0aXZlKCkge1xuICAgICAgICB0aGlzLnN0YXRlID0gXCJob3ZlclwiO1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XG4gICAgfVxuXG4gICAgbW91c2VNb3ZlKGUpIHtcbiAgICAgICAgaWYgKCF0aGlzLnRlc3RBbHBoYShlLmNsaWVudFgsIGUuY2xpZW50WSkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTmlkZ2V0ID0gdGhpcy5zdHJpbmdJZGxlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcbiAgICAgICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZU5pZGdldCA9IHRoaXMuc3RyaW5nSG92ZXI7XG4gICAgICAgIH1cbiAgICB9XG59XG47XG5cbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1idXR0b24nLCBOaWRnZXRCdXR0b24pO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRCdXR0b247XG5cbiIsIlwidXNlIHN0cmljdFwiO1xyXG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XHJcblxyXG5jbGFzcyBOaWRnZXRCdXR0b25TZXQgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xyXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgdGhpcy5hbHBoYVRvbGVyYW5jZSA9IDA7IC8vIGFscGhhIG5lZWRzIHRvIGJlID4gdG9sZXJhbmNlIHRvIHRyaWdnZXIgZXZlbnRzLlxyXG5cclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgdGhpcy5tb3VzZVByZXNzKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHRoaXMubW91c2VSZWxlYXNlKTtcclxuICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgdGhpcy5tb3VzZU1vdmUpO1xyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgdGhpcy5tb3VzZUxlYXZlKTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVkKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbmlkZ2V0UmVhZHkoKXtcclxuICAgICAgICB0aGlzLmJ1dHRvbnMgPSB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoXCJuaWRnZXQtYnV0dG9uXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlUHJlc3MoZSl7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNVbmRlcihlKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZVByZXNzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gXCJwcmVzc1wiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlUmVsZWFzZShlKXtcclxuICAgICAgICB0aGlzLnN0YXRlID0gXCJvdXRcIjtcclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuYnV0dG9ucykge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5pc1VuZGVyKGUpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5zdGF0ZSA9PSBcInByZXNzXCIpe1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoXCJidXR0b24tY2xpY2tlZFwiLCB7ZGV0YWlsOiBlbGVtZW50fSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZVJlbGVhc2UoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcImhvdmVyXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VNb3ZlKGUpe1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5idXR0b25zKXtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuaXNVbmRlcihlKSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5tb3VzZUFjdGl2ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFwiaG92ZXJcIjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQubW91c2VMZWF2ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlTGVhdmUoZSl7XHJcbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmJ1dHRvbnMpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5tb3VzZUxlYXZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBcIm91dFwiO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZXQgc3RhdGUodmFsdWUpe1xyXG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiLCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHN0YXRlKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwiZGF0YS1zdGF0ZVwiKTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWJ1dHRvbi1zZXQnLCBOaWRnZXRCdXR0b25TZXQpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE5pZGdldEJ1dHRvblNldDsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldCA9IHJlcXVpcmUoXCIuLi9OaWRnZXRFbGVtZW50XCIpO1xuXG4vKipcbiAqIEEgTmlkZ2V0IHRoYXQgY2hhbmdlcyB0aGUgaW1hZ2UgZm9yIGhvdmVyLCBkaXNhYmxlZCwgcHJlc3MsIGFuZCBpZGxlLlxuICogRmlyZXMgYSBjbGljayBldmVudCB3aGVuIGNsaWNrZWQuXG4gKiBcbiAqIFRoaXMgaXMgdGhlIGh0bWwgZWxlbWVudCBcIm5pZGdldC1idXR0b25cIi5cbiAqIElmIHRoZSBuaWRnZXQtYnV0dG9uIGhhcyB0aGUgYXR0cmlidXRlIGBpbWctcHJlZml4ID0gXCJwcmVmaXhcImAgdGhlbiB0aGUgXG4gKiBmb2xsb3dpbmcgaW1hZ2VzLiAgYGltZy1zdWZmaXhgID0gXCJzdWZmaXhcIiB3aWxsIG92ZXJyaWRlIHRoZSBcIi5wbmdcIi5cbiAqIHdpbGwgYmUgdXNlZDpcbiAqIC0gcHJlZml4LWhvdmVyLnBuZ1xuICogLSBwcmVmaXgtZGlzYWJsZWQucG5nXG4gKiAtIHByZWZpeC1wcmVzcy5wbmdcbiAqIC0gcHJlZml4LWlkbGUucG5nXG4gKi9cbmNsYXNzIE5pZGdldEJ1dHRvblN0YXRlIGV4dGVuZHMgTmlkZ2V0IHtcblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xuICAgIH1cblxuICAgIG5pZGdldFJlYWR5KCl7XG4gICAgICAgIHRoaXMuaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgICAgICAgdGhpcy5pbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIHRoaXMuZ2V0QXR0cmlidXRlKFwiaW1hZ2Utc3JjXCIpKTtcbiAgICAgICAgdGhpcy5hcHBlbmQodGhpcy5pbWcpO1xuICAgIH1cblxuICAgIHNob3coKXtcbiAgICAgICAgc3VwZXIuc2hvdygpO1xuICAgICAgICB0aGlzLmxvYWRDYW52YXMoKTtcbiAgICB9XG5cbiAgICBsb2FkQ2FudmFzKCl7XG4gICAgICAgIGlmICghdGhpcy5pbWcgfHwgdGhpcy5jYW52YXMpIHJldHVybjtcbiAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLmltZy5uYXR1cmFsV2lkdGg7XG4gICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuaW1nLm5hdHVyYWxIZWlnaHQ7XG4gICAgICAgIHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJykuZHJhd0ltYWdlKHRoaXMuaW1nLCAwLCAwKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FudmFzO1xuICAgIH1cblxuICAgIGdldFBpeGVsKHgsIHkpe1xuICAgICAgICB0aGlzLmxvYWRDYW52YXMoKTtcbiAgICAgICAgbGV0IGR4ID0gdGhpcy5jYW52YXMud2lkdGggLyB0aGlzLm9mZnNldFdpZHRoO1xuICAgICAgICBsZXQgZHkgPSB0aGlzLmNhbnZhcy5oZWlnaHQgLyB0aGlzLm9mZnNldEhlaWdodDtcbiAgICAgICAgbGV0IHBpeGVsID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5nZXRJbWFnZURhdGEoZHggKiB4LCBkeSAqIHksIDEsIDEpLmRhdGE7XG4gICAgICAgIHJldHVybiBwaXhlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgc3RhdGUgdG8gSE9WRVIsIERJU0FCTEVELCBQUkVTUywgSURMRS5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IHN0YXRlXG4gICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAqL1xuICAgIHNldCBzdGF0ZShzdGF0ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInN0YXRlXCIsIHN0YXRlLnRvVXBwZXJDYXNlKCkpO1xuICAgIH1cblxuICAgIGdldCBzdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cmlidXRlKFwic3RhdGVcIik7XG4gICAgfVxuXG4gICAgc2V0IHNvdXJjZShpbWcpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgaW1nKTtcbiAgICB9XG5cbiAgICBnZXQgc291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyaWJ1dGUoXCJzcmNcIik7XG4gICAgfVxufVxuO1xuXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtYnV0dG9uLXN0YXRlJywgTmlkZ2V0QnV0dG9uU3RhdGUpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRCdXR0b25TdGF0ZTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBjb21wb25lbnQgdGhhdCBoYXMgZXZlbnRzIGZvciBhZGRpbmcgbmlkZ2V0cywgcmVtb3ZpbmcgbmlkZ2V0cywgYW5kIFxuICogcmVzaXppbmcgdGhlIGNvbnRhaW5lci4gIFdoZW4gdGhlIGNvbnRhaW5lciBzaXplIGlzIGNoYW5nZWQsIHRoZSBudW1iZXJcbiAqIG9mIGNvbXBvbmVudHMgY2hhbmdlLCBvciB0aGUgbGF5b3V0IGF0dHJpYnV0ZSBjaGFuZ2VzLCB0aGUgZG9MYXlvdXQgZnVuY3Rpb25cbiAqIGlzIGNhbGxlZC5cbiAqIFxuICogVGhlIGNvbXBvbmVudHMgYXJlIGFycmFnZWQgYWNjb3JkaW5nIHRvIHRoZSBzZWxlY3RlZCBsYXlvdXQgYXR0cmlidXRlLiAgSWYgXG4gKiBubyBsYXlvdXQgYXR0cmlidXRlIGlzIGNob3NlbiwgZG9MYXlvdXQgaXMgc3RpbGwgY2FsbGVkIGFzIGl0IGlzIGFzc3VtZWQgXG4gKiBhIGN1c3RvbSBmdW5jdGlvbiBoYXMgYmVlbiBwcm92aWRlZC5cbiAqL1xuXG5jbGFzcyBOaWRnZXRDb250YWluZXIgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICAgICAgbGV0IHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHRoaXMuZG9MYXlvdXQpO1xuICAgICAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKHRoaXMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgICByZXR1cm4gW05pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGVdO1xuICAgIH1cblxuICAgIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhuYW1lLCBvbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgaWYgKG9sZFZhbHVlID09PSBuZXdWYWx1ZSkgcmV0dXJuO1xuICAgICAgICB0aGlzLmRvTGF5b3V0KCk7XG4gICAgfVxuXG4gICAgc2V0IGxheW91dCh2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShOaWRnZXRDb250YWluZXIubGF5b3V0QXR0cmlidXRlLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IGxheW91dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKE5pZGdldENvbnRhaW5lci5sYXlvdXRBdHRyaWJ1dGUpO1xuICAgIH0gICAgICBcblxuICAgIGRvTGF5b3V0KCkge1xuICAgICAgICBpZiAoIXRoaXMubGF5b3V0KSByZXR1cm47XG4gICAgICAgIGlmICghTGF5b3V0c1t0aGlzLmxheW91dF0pIHRocm93IGBpbnZhbGlkIGxheW91dDogJHt0aGlzLmxheW91dH1gO1xuICAgICAgICBMYXlvdXRzW3RoaXMubGF5b3V0XTtcbiAgICB9XG59XG5cbmNsYXNzIExheW91dHMge1xuICAgIC8qKlxuICAgICAqIEZpdCBhbGwgbmlkZ2V0cyBldmVubHkgaW4gYSBob3Jpem9udGFsIHJvdy5cbiAgICAgKiBAcGFyYW0ge3R5cGV9IG5pZGdldFxuICAgICAqIEByZXR1cm4ge3VuZGVmaW5lZH1cbiAgICAgKi9cbiAgICBzdGF0aWMgcm93KG5pZGdldCkge1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNpemUpO1xuICAgIH1cbn1cblxuXG5OaWRnZXRDb250YWluZXIubGF5b3V0QXR0cmlidXRlID0gXCJsYXlvdXRcIjtcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ25pZGdldC1jb250YWluZXInLCBOaWRnZXRDb250YWluZXIpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRDb250YWluZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0XCIpO1xuY29uc3QgVHJhbnNmb3JtZXIgPSByZXF1aXJlKFwiLi4vVHJhbnNmb3JtZXJcIik7XG5cbi8qKlxuICogRG9uJ3QgZm9yZ2V0IHRvIHNldCAnaXMnIHdoZW4gcHV0dGluZyBlbGVtZW50IGRpcmVjdGx5IGluIGh0bWwgYXMgb3Bwb3NlZCB0b1xuICogcHJvZ3JhbWljYWxseS5cbiAqIDxpbWcgaXM9XCJyZWdpc3RlcmVkLW5hbWVcIiBzcmM9XCJpbWFnZS5wbmdcIj48L2ltZz5cbiAqIFxuICogaW5jbHVkZSBhIGN1c3RvbSBlbGVtZW50IGRlZmluaXRpb24gYXQgdGhlIGVuZCBvZiB0aGUgY2xhc3MuPGJyPlxuICogd2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgncmVnaXN0ZXJlZC1uYW1lJywgQ2xhc3MsIHtleHRlbmRzOiBcImltZ1wifSk7XG4gKi9cbmNsYXNzIE5pZGdldEhUTUxJbWFnZSBleHRlbmRzIEhUTUxJbWFnZUVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmxhc3REaXNwbGF5ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybWVyKHRoaXMpO1xuICAgIH1cblxuICAgIHNjYWxlKGR3LCBkaCkge1xuICAgICAgICBpZiAoIWRoKSBkaCA9IGR3O1xuICAgICAgICBsZXQgdyA9IHRoaXMud2lkdGggKiBkdztcbiAgICAgICAgbGV0IGggPSB0aGlzLmhlaWdodCAqIGRoO1xuICAgICAgICB0aGlzLndpZHRoID0gdztcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoO1xuICAgIH0gICAgICAgIFxuXG4gICAgc2V0IHNyYyh2YWx1ZSkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShcInNyY1wiLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgZ2V0IHNyYygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKFwic3JjXCIpO1xuICAgIH1cblxuICAgIGxvY2F0ZShsZWZ0LCB0b3ApIHtcbiAgICAgICAgdGhpcy5sZWZ0ID0gbGVmdDtcbiAgICAgICAgdGhpcy50b3AgPSB0b3A7XG4gICAgfVxuXG4gICAgZ2V0IGxlZnQoKSB7XG4gICAgICAgIGxldCB3ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykubGVmdDtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodyk7XG4gICAgfVxuXG4gICAgZ2V0IHRvcCgpIHtcbiAgICAgICAgbGV0IGggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzKS50b3A7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGgpO1xuICAgIH1cblxuICAgIHNldCBsZWZ0KHZhbHVlKSB7XG4gICAgICAgIHRoaXMuc3R5bGUubGVmdCA9IHZhbHVlICsgXCJweFwiO1xuICAgIH1cblxuICAgIHNldCB0b3AodmFsdWUpIHtcbiAgICAgICAgdGhpcy5zdHlsZS50b3AgPSB2YWx1ZSArIFwicHhcIjtcbiAgICB9ICAgIFxuXG4gICAgc2V0IHdpZHRoKHcpIHtcbiAgICAgICAgdGhpcy5zdHlsZS53aWR0aCA9IHcgKyBcInB4XCI7XG4gICAgfVxuXG4gICAgc2V0IGhlaWdodCh3KSB7XG4gICAgICAgIHRoaXMuc3R5bGUuaGVpZ2h0ID0gdyArIFwicHhcIjtcbiAgICB9XG5cbiAgICBnZXQgd2lkdGgoKSB7XG4gICAgICAgIGxldCB3ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykud2lkdGg7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHcpO1xuICAgIH1cblxuICAgIGdldCBoZWlnaHQoKSB7XG4gICAgICAgIGxldCBoID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcykuaGVpZ2h0O1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChoKTtcbiAgICB9ICAgICAgICBcblxuICAgIHNob3coKSB7XG4gICAgICAgIGlmICh0aGlzLmxhc3REaXNwbGF5KSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSB0aGlzLmxhc3REaXNwbGF5O1xuICAgICAgICAgICAgdGhpcy5sYXN0RGlzcGxheSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IFwiaW5saW5lLWJsb2NrXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoaWRlKCkge1xuICAgICAgICB0aGlzLmxhc3REaXNwbGF5ID0gdGhpcy5zdHlsZS5kaXNwbGF5O1xuICAgICAgICB0aGlzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICB9XG5cbiAgICBzZXQgZGlzcGxheSh2YWx1ZSl7XG4gICAgICAgIHRoaXMuc3R5bGUuZGlzcGxheSA9IHZhbHVlO1xuICAgIH1cbiAgICBcbiAgICBnZXQgZGlzcGxheSgpe1xuICAgICAgICByZXR1cm4gd2luZG93LmNhbGN1bGF0ZVN0eWxlKHRoaXMpW1wiZGlzcGxheVwiXTtcbiAgICB9XG5cbiAgICBkZXRhY2goKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcih0aGlzKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBzZXQgZGlzYWJsZWQodmFsdWUpe1xuICAgICAgICBpZiAodmFsdWUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIiwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShcImRpc2FibGVkXCIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBnZXQgZGlzYWJsZWQoKXtcbiAgICAgICAgaWYgKCF0aGlzLmhhc0F0dHJpYnV0ZShcImRpc2FibGVkXCIpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEF0dHJpYnV0ZShcImRpc2FibGVkXCIpO1xuICAgIH0gICAgXG4gICAgXG4gICAgY2xlYXJQb3MoKXtcbiAgICAgICAgdGhpcy5zdHlsZS50b3AgPSBudWxsO1xuICAgICAgICB0aGlzLnN0eWxlLmxlZnQgPSBudWxsO1xuICAgIH1cblxuICAgIGNsZWFyRGltcygpe1xuICAgICAgICB0aGlzLnN0eWxlLndpZHRoID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdHlsZS5oZWlnaHQgPSBudWxsO1xuICAgIH0gICAgXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTmlkZ2V0SFRNTEltYWdlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIi4uL05pZGdldEVsZW1lbnRcIik7XG5cbi8qKlxuICogQSBOaWRnZXQgdGhhdCBjb250YWlucyBpbWFnZXMuXG4gKi9cbmNsYXNzIE5pZGdldEltYWdlIGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcihzcmMpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gICAgICAgIGlmIChzcmMpIHRoaXMuc3JjID0gc3JjO1xuICAgIH1cblxuICAgIGNvbm5lY3RlZENhbGxiYWNrKCl7XG4gICAgICAgIGxldCBzcmMgPSB0aGlzLmdldEF0dHJpYnV0ZShOaWRnZXRJbWFnZS5zcmNBdHRyaWJ1dGUpOyAgICAgICAgXG4gICAgICAgIGlmIChzcmMpIHRoaXMuaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCBzcmMpOyAgICAgICBcbiAgICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLmltZyk7XG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgZ2V0IHNyYygpe1xuICAgICAgICByZXR1cm4gdGhpcy5pbWcuZ2V0QXR0cmlidXRlKFwic3JjXCIpO1xuICAgIH1cblxuICAgIHNldCBzcmModmFsdWUpe1xuICAgICAgICB0aGlzLmltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdmFsdWUpO1xuICAgIH1cblxuICAgIHNpemUod2lkdGgsIGhlaWdodCl7XG4gICAgICAgIHRoaXMuc3R5bGUud2lkdGggPSB3aWR0aFxuICAgICAgICB0aGlzLnN0eWxlLmhlaWdodCA9IGhlaWdodFxuICAgICAgICB0aGlzLmltZy5zdHlsZS53aWR0aCA9IHdpZHRoXG4gICAgICAgIHRoaXMuaW1nLnN0eWxlLmhlaWdodCA9IGhlaWdodFxuICAgIH1cbiAgICBcbiAgICBzY2FsZShkdywgZGgpe1xuICAgICAgICBpZiAoIWRoKSBkaCA9IGR3O1xuICAgICAgICBsZXQgd2lkdGggPSB0aGlzLm9mZnNldFdpZHRoICogZHc7XG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLm9mZnNldEhlaWdodCAqIGRoO1xuICAgICAgICB0aGlzLnNpemUoYCR7d2lkdGh9cHhgLCBgJHtoZWlnaHR9cHhgKTtcbiAgICB9XG4gICAgXG4gICAgc2hvdygpe1xuICAgICAgICBpZiAodGhpcy5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIil7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5zdHlsZS5kaXNwbGF5O1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGhpZGUoKXtcbiAgICAgICAgdGhpcy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgfVxufVxuXG5OaWRnZXRJbWFnZS5zcmNBdHRyaWJ1dGUgPSBcInNyY1wiO1xud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbmlkZ2V0LWltYWdlJywgTmlkZ2V0SW1hZ2UpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRJbWFnZTsiLCJcInVzZSBzdHJpY3RcIjtcbmNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0RWxlbWVudFwiKTtcblxuLyoqXG4gKiBXaGVuIHVzaW5nIC0tbmlkZ2V0LWZpdC10ZXh0LCBkbyBub3QgaW5jbHVkZSBoZWlnaHQgYW5kIHdpZHRoIGF0dHJpYnV0ZXMuXG4gKiBBIGZvbnQgc2l6ZSBjYW4gYmUgdXNlZCBhcyBhIHN0YXJ0aW5nIHBvaW50LlxuICovXG5jbGFzcyBGaXRUZXh0IHtcbiAgICBjb25zdHJ1Y3RvcihuaWRnZXQpe1xuICAgICAgICB0aGlzLm5pZGdldCA9IG5pZGdldDtcbiAgICAgICAgdGhpcy5sb2NrID0gXCJub25lXCI7XG4gICAgICAgIHRoaXMucGFyc2VBcmd1bWVudHMoKTtcbiAgICB9XG5cbiAgICBsaXN0ZW4oKXtcbiAgICAgICAgdGhpcy5vYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcigoKT0+dGhpcy5kZWxheVJlc2l6ZSh0aGlzLmhWYWx1ZSwgdGhpcy53VmFsdWUpKTtcbiAgICAgICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQpO1xuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XG4gICAgICAgIHRoaXMuZGVsYXkgPSAyNTtcbiAgICAgICAgdGhpcy5kZWxheVJlc2l6ZSh0aGlzLmhWYWx1ZSwgdGhpcy53VmFsdWUpO1xuICAgICAgICB0aGlzLnN0b3AgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBkZWxheVJlc2l6ZShoVmFsdWUsIHdWYWx1ZSl7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcbiAgICAgICAgaWYgKHRoaXMudGltZW91dCkgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCk9PnRoaXMub25SZXNpemUoaFZhbHVlLCB3VmFsdWUpLCB0aGlzLmRlbGF5KTtcbiAgICB9XG5cbiAgICBub3RpZnkoaFZhbHVlLCB3VmFsdWUpe1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdGlmeVwiKTtcbiAgICAgICAgdGhpcy5zdG9wID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGVsYXlSZXNpemUoaFZhbHVlLCB3VmFsdWUpO1xuICAgIH1cblxuICAgIHBhcnNlQXJndW1lbnRzKCl7XG4gICAgICAgIGxldCBhcmdzID0gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5pZGdldCkuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LWZpdC10ZXh0XCIpO1xuXG4gICAgICAgIGlmICghYXJncyB8fCBhcmdzID09PSBmYWxzZSB8fCBhcmdzID09PSBcImZhbHNlXCIpe1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5oVmFsdWUgPSB0aGlzLndWYWx1ZSA9IHRydWU7XG5cbiAgICAgICAgaWYgKHR5cGVvZihhcmdzKSA9PSBcInN0cmluZ1wiKXtcbiAgICAgICAgICAgIGxldCBvYmogPSBKU09OLnBhcnNlKGFyZ3MpO1xuICAgICAgICAgICAgaWYgKG9ialtcImZpdFwiXSAhPT0gdW5kZWZpbmVkICYmIG9ialtcImZpdFwiXSA9PT0gXCJ3aWR0aFwiKSB0aGlzLmhWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKG9ialtcImZpdFwiXSAhPT0gdW5kZWZpbmVkICYmIG9ialtcImZpdFwiXSA9PT0gXCJoZWlnaHRcIikgdGhpcy53VmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChvYmpbXCJsb2NrXCJdICE9PSB1bmRlZmluZWQpIHRoaXMubG9jayA9IChvYmpbXCJsb2NrXCJdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUmVzaXplKGhWYWx1ZSwgd1ZhbHVlKXtcbiAgICAgICAgZGVsZXRlIHRoaXMudGltZW91dDtcblxuICAgICAgICBpZiAodGhpcy5zdG9wKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLm5pZGdldC50ZXh0Q29udGVudCA9PT0gXCJcIikgcmV0dXJuO1xuICAgICAgICBpZiAodGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgPT09IDApIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMubmlkZ2V0LnBhcmVudEVsZW1lbnQub2Zmc2V0V2lkdGggPT09IDApIHJldHVybjtcbiAgICAgICAgaWYgKHRoaXMubmlkZ2V0LnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiKSByZXR1cm47XG5cbiAgICAgICAgaWYgKCFoVmFsdWUgJiYgIXdWYWx1ZSkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBoRGlyID0gdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQgLSB0aGlzLm5pZGdldC5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIGxldCB3RGlyID0gdGhpcy5uaWRnZXQucGFyZW50RWxlbWVudC5vZmZzZXRXaWR0aCAtIHRoaXMubmlkZ2V0LnNjcm9sbFdpZHRoO1xuXG4gICAgICAgIGlmICghaFZhbHVlKSBoRGlyID0gMDtcbiAgICAgICAgaWYgKCF3VmFsdWUpIHdEaXIgPSAwO1xuXG4gICAgICAgIGxldCBkaXIgPSBNYXRoLnNpZ24oaERpciB8IHdEaXIpOyAvLyB3aWxsIHByZWZlciB0byBzaHJpbmtcbiAgICAgICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAwKSB0aGlzLmRpcmVjdGlvbiA9IGRpcjsgLy8ga2VlcCBwcmV2aW91cyBkaXJlY3Rpb25cblxuICAgICAgICBsZXQgZm9udFNpemUgPSBwYXJzZUludChnZXRDb21wdXRlZFN0eWxlKHRoaXMubmlkZ2V0KVtcImZvbnQtc2l6ZVwiXSlcbiAgICAgICAgbGV0IG5ld1NpemUgPSBmb250U2l6ZSArICh0aGlzLmRpcmVjdGlvbik7XG5cbiAgICAgICAgaWYgKG5ld1NpemUgIT09IGZvbnRTaXplICYmIHRoaXMuZGlyZWN0aW9uID09PSBkaXIpIHtcbiAgICAgICAgICAgIHRoaXMubmlkZ2V0LnN0eWxlLmZvbnRTaXplID0gbmV3U2l6ZSArIFwicHhcIjtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVvdXQpIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+dGhpcy5vblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSksIHRoaXMuZGVsYXkpO1xuICAgICAgICB9IGVsc2UgaWYgKGRpciA8IDAgJiYgdGhpcy5kaXJlY3Rpb24gPiAwKSB7IC8vIHJldmVyc2UgZGlyZWN0aW9uIGlmIGdyb3dpbmcgdG9vIGxhcmdlXG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IC0xO1xuICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gc2V0VGltZW91dCgoKT0+dGhpcy5vblJlc2l6ZShoVmFsdWUsIHdWYWx1ZSksIHRoaXMuZGVsYXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMubG9jayA9PT0gXCJ2aFwiKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZvbnRSYXRpbyA9IG5ld1NpemUgLyB3aW5kb3cuaW5uZXJIZWlnaHQgKiAxMDA7XG4gICAgICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBmb250UmF0aW8gKyBcInZoXCI7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5sb2NrID09PSBcInZ3XCIpe1xuICAgICAgICAgICAgICAgIGxldCBmb250UmF0aW8gPSBuZXdTaXplIC8gd2luZG93LmlubmVyV2lkdGggKiAxMDA7XG4gICAgICAgICAgICAgICAgdGhpcy5uaWRnZXQuc3R5bGUuZm9udFNpemUgPSBmb250UmF0aW8gKyBcInZ3XCI7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBBIG5pZGdldCBlbGVtZW50IGZvciBkaXNwbGF5aW5nIHRleHQuXG4gKiBwdXQgJy0tbmlkZ2V0LWZpdC10ZXh0OiAxLjA7JyBpbnRvIGNzcyBmb3IgdGhpcyBlbGVtZW50IHRvIGVuYWJsZSBzY2FsaW5nLlxuICogc2VlOiBOaWRnZXRTdHlsZS5qc1xuICovXG5jbGFzcyBOaWRnZXRUZXh0IGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnNbXCJmaXQtdGV4dC13aWR0aC10b2xlcmFuY2VcIl0gPSAwLjAyO1xuICAgICAgICB0aGlzLmZpdFRleHQgPSBuZXcgRml0VGV4dCh0aGlzKTtcbiAgICB9XG5cbiAgICByZW1vdmUoKXtcbiAgICAgICAgaWYgKHRoaXMuZml0VGV4dCkge1xuICAgICAgICAgICAgdGhpcy5maXRUZXh0LnN0b3AgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5maXRUZXh0Lm9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlci5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgc3VwZXIuY29ubmVjdGVkQ2FsbGJhY2soKTtcbiAgICAgICAgbGV0IGZpdFByb3AgPSBnZXRDb21wdXRlZFN0eWxlKHRoaXMpLmdldFByb3BlcnR5VmFsdWUoXCItLW5pZGdldC1maXQtdGV4dFwiKTtcblxuICAgICAgICBpZiAoZml0UHJvcCAhPT0gdW5kZWZpbmVkICYmIGZpdFByb3AgIT09IFwiXCIpe1xuICAgICAgICAgICAgdGhpcy5maXRUZXh0Lmxpc3RlbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0IHRleHQodmFsdWUpe1xuICAgICAgICB0aGlzLmlubmVyVGV4dCA9IHZhbHVlO1xuICAgICAgICBpZiAodGhpcy5maXRUZXh0ICYmIHRoaXMuZml0VGV4dC5zdG9wID09PSBmYWxzZSl7XG4gICAgICAgICAgICB0aGlzLmZpdFRleHQuZGVsYXlSZXNpemUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCB0ZXh0KCl7XG4gICAgICAgIHJldHVybiB0aGlzLmlubmVyVGV4dDtcbiAgICB9XG5cbiAgICBzY2FsZShhbW91bnQpIHtcbiAgICAgICAgbGV0IHN0eWxlRm9udFNpemUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKFwiZm9udC1zaXplXCIpO1xuICAgICAgICBsZXQgZm9udFNpemUgPSBwYXJzZUZsb2F0KHN0eWxlRm9udFNpemUpO1xuICAgICAgICB0aGlzLnN0eWxlLmZvbnRTaXplID0gKGZvbnRTaXplICogYW1vdW50KSArIFwicHhcIjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgdGhlIGxpbmUgaGVpZ2h0IHRvIHRoZSBvZmZzZXQgaGVpZ2h0IG11bHRpcGxpZWQgYnkgcmF0aW8uXG4gICAgICogQ2FsbGluZyB0aGlzIG1ldGhvZCBkaXJlY3Rvcnkgd2lsbCBvdmVycmlkZSB0aGUgdmFsdWUgc2V0IGJ5IGNzc1xuICAgICAqL1xuICAgIG5pZGdldFZlcnRBbGlnblRleHQodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KFwiLS1uaWRnZXQtdmVydC1hbGlnbi10ZXh0XCIsIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvblJlc2l6ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGxldCByYXRpbyA9IGdldENvbXB1dGVkU3R5bGUodGhpcykuZ2V0UHJvcGVydHlWYWx1ZShcIi0tbmlkZ2V0LXZlcnQtYWxpZ24tdGV4dFwiKTtcbiAgICAgICAgICAgIGlmICghcGFyc2VGbG9hdChyYXRpbykpIHJldHVybjtcbiAgICAgICAgICAgIGxldCBoID0gdGhpcy5vZmZzZXRIZWlnaHQgKiByYXRpbztcbiAgICAgICAgICAgIHRoaXMuc3R5bGUubGluZUhlaWdodCA9IGggKyBcInB4XCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vYnNlcnZlcnMudmVydEFsaWduVGV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLm9ic2VydmVycy52ZXJ0QWxpZ25UZXh0ID0gbmV3IFJlc2l6ZU9ic2VydmVyKG9uUmVzaXplKTtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2ZXJzLnZlcnRBbGlnblRleHQub2JzZXJ2ZSh0aGlzKVxuICAgICAgICB9XG4gICAgICAgIG9uUmVzaXplKClcbiAgICB9XG5cbiAgICB2ZXJ0QWxpZ25UZXh0KHJhdGlvID0gMS4wKXtcbiAgICAgICAgaWYgKCFwYXJzZUZsb2F0KHJhdGlvKSkgcmV0dXJuO1xuICAgICAgICBsZXQgaCA9IHRoaXMub2Zmc2V0SGVpZ2h0ICogcmF0aW87XG4gICAgICAgIHRoaXMuc3R5bGUubGluZUhlaWdodCA9IGggKyBcInB4XCI7XG4gICAgfVxufVxuO1xuXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCduaWRnZXQtdGV4dCcsIE5pZGdldFRleHQpO1xubW9kdWxlLmV4cG9ydHMgPSBOaWRnZXRUZXh0OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgZHJhZ0hhbmRsZXIgPSByZXF1aXJlKFwiLi4vRHJhZ0hhbmRsZXJcIikuaW5zdGFuY2U7XG5cblxuZnVuY3Rpb24gb25EcmFnU3RhcnQoZXZlbnQpeyAgICBcbiAgICBkcmFnSGFuZGxlci5zZXQodGhpcyk7XG4gICAgd2luZG93LnggPSB0aGlzO1xuICAgIGNvbnNvbGUubG9nKFwiJ1wiICsgdGhpcy5uYW1lKCkgKyBcIidcIik7XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnU3RhcnRcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uRHJhZ0VuZChldmVudCl7XG4gICAgaWYgKGRyYWdIYW5kbGVyLmdldCgpICE9PSB0aGlzKSByZXR1cm47XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcmFnRW5kXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xuICAgIGRyYWdIYW5kbGVyLmNsZWFyKCk7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuc2V0QXR0cmlidXRlKFwiZHJhZ2dhYmxlXCIsIFwidHJ1ZVwiKTsgICBcbiAgICBcbiAgICBuaWRnZXQub25EcmFnU3RhcnQgPSBvbkRyYWdTdGFydC5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uRHJhZ0VuZCA9IG9uRHJhZ0VuZC5iaW5kKG5pZGdldCk7XG4gICAgXG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ3N0YXJ0XCIsIG5pZGdldC5vbkRyYWdTdGFydCk7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwiZHJhZ2VuZFwiLCBuaWRnZXQub25EcmFnRW5kKTsgICAgXG59OyIsIlwidXNlIHN0cmljdFwiO1xuY29uc3QgZHJhZ0hhbmRsZXIgPSByZXF1aXJlKFwiLi4vRHJhZ0hhbmRsZXJcIikuaW5zdGFuY2U7XG5jb25zdCBNb3VzZVV0aWxpdGllcyA9IHJlcXVpcmUoXCIuLi9Nb3VzZVV0aWxpdGllc1wiKTtcblxuZnVuY3Rpb24gb25EcmFnT3ZlcihldmVudCl7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBsZXQgZHJhZ05pZGdldCA9IGRyYWdIYW5kbGVyLmdldCgpO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ092ZXJcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcywgZHJhZ05pZGdldCk7XG59XG5cbmZ1bmN0aW9uIG9uRHJhZ0VudGVyKGV2ZW50KXtcbiAgICBpZiAoIWRyYWdIYW5kbGVyLmhhcygpKSByZXR1cm47XG4gICAgaWYgKCFkcmFnSGFuZGxlci5wdXNoT3Zlcih0aGlzKSkgcmV0dXJuO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ0VudGVyXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbkRyYWdMZWF2ZShldmVudCl7XG4gICAgaWYgKCFkcmFnSGFuZGxlci5oYXMoKSkgcmV0dXJuO1xuICAgIGlmIChNb3VzZVV0aWxpdGllcy5pc1VuZGVyKHRoaXMuZ2V0RWxlbWVudCgpKSkgcmV0dXJuO1xuICAgIGlmICghZHJhZ0hhbmRsZXIucmVtb3ZlT3Zlcih0aGlzKSkgcmV0dXJuO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiZHJhZ0xlYXZlXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbkRyb3AoZXZlbnQpe1xuICAgIGxldCBkcmFnTmlkZ2V0ID0gZHJhZ0hhbmRsZXIuZ2V0KCk7XG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJkcm9wXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMsIGRyYWdOaWRnZXQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgbmlkZ2V0Lm9uRHJhZ092ZXIgPSBvbkRyYWdPdmVyLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Ecm9wID0gb25Ecm9wLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25EcmFnRW50ZXIgPSBvbkRyYWdFbnRlci5iaW5kKG5pZGdldCk7XG4gICAgbmlkZ2V0Lm9uRHJhZ0xlYXZlID0gb25EcmFnTGVhdmUuYmluZChuaWRnZXQpO1xuICAgIFxuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdvdmVyXCIsIG5pZGdldC5vbkRyYWdPdmVyKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJkcm9wXCIsIG5pZGdldC5vbkRyb3ApO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdlbnRlclwiLCBuaWRnZXQub25EcmFnRW50ZXIpO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcImRyYWdsZWF2ZVwiLCBuaWRnZXQub25EcmFnTGVhdmUpOyAgICBcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBNb3VzZVV0aWxpdGllcyA9IHJlcXVpcmUoXCIuLi9Nb3VzZVV0aWxpdGllc1wiKTtcblxuZnVuY3Rpb24gb25DbGljayhldmVudCl7ICAgIFxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwiY2xpY2tcIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VEb3duKGV2ZW50KXsgICAgXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZURvd25cIiArIHRoaXMubmFtZSgpLCBldmVudCwgdGhpcyk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VVcChldmVudCl7ICAgIFxuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VVcFwiICsgdGhpcy5uYW1lKCksIGV2ZW50LCB0aGlzKTtcbn1cblxuZnVuY3Rpb24gb25Nb3VzZUVudGVyKGV2ZW50KXsgICAgXG4gICAgdGhpcy5ub3RpZnlMaXN0ZW5lcnMoXCJtb3VzZUVudGVyXCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5mdW5jdGlvbiBvbk1vdXNlTGVhdmUoZXZlbnQpe1xuICAgIGlmIChNb3VzZVV0aWxpdGllcy5pc1VuZGVyKHRoaXMuZ2V0RWxlbWVudCgpKSkgcmV0dXJuO1xuICAgIHRoaXMubm90aWZ5TGlzdGVuZXJzKFwibW91c2VFeGl0XCIgKyB0aGlzLm5hbWUoKSwgZXZlbnQsIHRoaXMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgY29uc29sZS5sb2coXCJtb3VzZSBzZXR1cFwiKTtcbiAgICBcbiAgICBuaWRnZXQub25DbGljayA9IG9uQ2xpY2suYmluZChuaWRnZXQpO1xuICAgIG5pZGdldC5vbk1vdXNlRG93biA9IG9uTW91c2VEb3duLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Nb3VzZVVwID0gb25Nb3VzZVVwLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Nb3VzZUVudGVyID0gb25Nb3VzZUVudGVyLmJpbmQobmlkZ2V0KTtcbiAgICBuaWRnZXQub25Nb3VzZUxlYXZlID0gb25Nb3VzZUxlYXZlLmJpbmQobmlkZ2V0KTtcbiAgICBcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBuaWRnZXQub25DbGljayk7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIG5pZGdldC5vbk1vdXNlRG93bik7XG4gICAgbmlkZ2V0LmdldEVsZW1lbnQoKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBuaWRnZXQub25Nb3VzZVVwKTtcbiAgICBuaWRnZXQuZ2V0RWxlbWVudCgpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsIG5pZGdldC5vbk1vdXNlRW50ZXIpO1xuICAgIG5pZGdldC5nZXRFbGVtZW50KCkuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIG5pZGdldC5vbk1vdXNlTGVhdmUpO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIEVuYWJsZSB0aGUgbmlkZ2V0IHRvIGJlIG1vdmVkIGJ5IGRyYWdnaW5nLiAgV2lsbCBkcmFnIGJ5IGFueSBjaGlsZCBlbGVlbWVudFxuICogdGhlICcubmlkZ2V0LWhlYWRlcicgY2xhc3MsIG90aGVyd2lzZSBtb3ZhYmxlIGJ5IGNsaWNraW5nIGFueXdoZXJlLlxuICogQHBhcmFtIHt0eXBlfSBlXG4gKiBAcmV0dXJuIHt1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gb25Nb3VzZU1vdmUoZSl7ICAgIFxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoIXRoaXMuX19tb3ZhYmxlLmFjdGl2ZSkgcmV0dXJuOyAgICBcblxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgbmV3IGN1cnNvciBwb3NpdGlvbjpcbiAgICBsZXQgZGVsdGFYID0gdGhpcy5fX21vdmFibGUubGFzdFggLSBlLmNsaWVudFg7XG4gICAgbGV0IGRlbHRhWSA9IHRoaXMuX19tb3ZhYmxlLmxhc3RZIC0gZS5jbGllbnRZO1xuICAgIHRoaXMuX19tb3ZhYmxlLmxhc3RYID0gZS5jbGllbnRYO1xuICAgIHRoaXMuX19tb3ZhYmxlLmxhc3RZID0gZS5jbGllbnRZO1xuICAgIFxuICAgIC8vIHNldCB0aGUgZWxlbWVudCdzIG5ldyBwb3NpdGlvbjpcbiAgICB0aGlzLnN0eWxlLnRvcCA9ICh0aGlzLm9mZnNldFRvcCAtIGRlbHRhWSkgKyBcInB4XCI7XG4gICAgdGhpcy5zdHlsZS5sZWZ0ID0gKHRoaXMub2Zmc2V0TGVmdCAtIGRlbHRhWCkgKyBcInB4XCI7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VEb3duKGUpe1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLl9fbW92YWJsZS5hY3RpdmUgPSB0cnVlO1xuICAgIFxuICAgIC8vIGdldCB0aGUgbW91c2UgY3Vyc29yIHBvc2l0aW9uIGF0IHN0YXJ0dXA6XG4gICAgdGhpcy5fX21vdmFibGUubGFzdFggPSBlLmNsaWVudFg7XG4gICAgdGhpcy5fX21vdmFibGUubGFzdFkgPSBlLmNsaWVudFk7XG59XG5cbmZ1bmN0aW9uIG9uTW91c2VVcChlKXtcbiAgICB0aGlzLl9fbW92YWJsZS5hY3RpdmUgPSBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIG5pZGdldC5fX21vdmFibGUgPSB7XG4gICAgICAgIGxhc3RYIDogMCxcbiAgICAgICAgbGFzdFkgOiAwLFxuICAgICAgICBhY3RpdmUgOiBmYWxzZVxuICAgIH07XG4gICAgXG4gICAgbmlkZ2V0Lm9uTW91c2VEb3duID0gb25Nb3VzZURvd24uYmluZChuaWRnZXQpOyAgICAgICAgXG4gICAgXG4gICAgaWYgKG5pZGdldC5xdWVyeVNlbGVjdG9yKFwiLm5pZGdldC1oZWFkZXJcIikpe1xuICAgICAgICBuaWRnZXQucXVlcnlTZWxlY3RvcihcIi5uaWRnZXQtaGVhZGVyXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgbmlkZ2V0Lm9uTW91c2VEb3duKTsgICAgICAgIFxuICAgIH0gZWxzZSB7XG4gICAgICAgIG5pZGdldC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIG5pZGdldC5vbk1vdXNlRG93bik7XG4gICAgfVxuICAgIFxuICAgIG5pZGdldC5vbk1vdXNlTW92ZSA9IG9uTW91c2VNb3ZlLmJpbmQobmlkZ2V0KTsgICAgXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbmlkZ2V0Lm9uTW91c2VNb3ZlKTtcblxuICAgIG5pZGdldC5vbk1vdXNlVXAgPSBvbk1vdXNlVXAuYmluZChuaWRnZXQpOyAgICBcbiAgICBuaWRnZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgbmlkZ2V0Lm9uTW91c2VVcCk7XG5cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jb25zdCBOaWRnZXQgPSByZXF1aXJlKFwiLi4vTmlkZ2V0XCIpO1xud2luZG93Lk5pZGdldCA9IE5pZGdldDtcblxuLyoqXG4gKiBBZGQgYSByZXNpemUgb2JzZXJ2ZXIgdG8gdGhlIGVsZW1lbnQgdGhhdCB3aWxsIGNhbGwgYSBvblJlc2l6ZSgpIGZ1bmN0aW9uLlxuICogVGhlIHBhcmFtZXRlcnMgcGFzc2VkIGluIGFyZSAocHJldmlvdXNfZGltZW5zaW9ucykuICBUbyB1c2UgYWRkXG4gKiBpbnRlcmZhY2VzPVwicmVzaXplXCIgdG8gdGhlIGVsZW1lbnQgaW4gaHRtbCBhbmQgYSBtZXRob2Qgb25SZXNpemUoKSB0byB0aGUgXG4gKiBjbGFzcyBvYmplY3QuICBJZiB0aGVyZSBpcyBubyBjbGFzcyBvYmplY3QgY3JlYXRlIGEgZnVuY3Rpb24gYW5kIGJpbmQgaXQuXG4gKiBpZTogZWxlbWVudC5vblJlc2l6ZSA9IGZ1bmN0aW9uLmJpbmQoZWxlbWVudCk7IFxuICovXG5cbmxldCBvblJlc2l6ZSA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRhdGEgPSB0aGlzW05pZGdldC5pbnRlcmZhY2VEYXRhRmllbGRdLnJlc2l6ZTtcbiAgICBsZXQgcHJldiA9IGRhdGEucHJldjtcbiAgICBpZiAoIXRoaXMub25SZXNpemUpIHJldHVybjtcbiAgICB0aGlzLm9uUmVzaXplKHByZXYpO1xuICAgIGxvYWRQcmV2aW91cyh0aGlzKTtcbn07XG5cbmxldCBsb2FkUHJldmlvdXMgPSBmdW5jdGlvbihuaWRnZXQpe1xuICAgIGxldCBkYXRhID0gbmlkZ2V0W05pZGdldC5pbnRlcmZhY2VEYXRhRmllbGRdLnJlc2l6ZTtcbiAgICBkYXRhLnByZXYgPSB7XG4gICAgICAgIHdpZHRoIDogbmlkZ2V0Lm9mZnNldFdpZHRoLFxuICAgICAgICBoZWlnaHQgOiBuaWRnZXQub2Zmc2V0SGVpZ2h0XG4gICAgfTsgICAgXG59O1xuXG4vKipcbiAqIFNldHVwIGEgcmVzaXplIG9ic2VydmVyIGZvciB0aGUgbmlkZ2V0IHRoYXQgdHJpZ2dlcnMgdGhlIG9uUmVzaXplIG1ldGhvZCBpZiBcbiAqIGF2YWlsYWJsZS5cbiAqIC0gb25SZXNpemUodGhpcywgcHJldmlvdXNfZGltZW5zaW9ucykgOiBub25lXG4gKiBAcGFyYW0ge3R5cGV9IG5pZGdldFxuICogQHJldHVybiB7dW5kZWZpbmVkfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5pZGdldCl7XG4gICAgaWYgKHR5cGVvZihuaWRnZXQpICE9PSBcIm9iamVjdFwiKSB0aHJvdyBuZXcgXCJPYmplY3QgZXhlY3RlZFwiO1xuICAgIGxldCByZXNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcihvblJlc2l6ZS5iaW5kKG5pZGdldCkpO1xuICAgIHJlc2l6ZU9ic2VydmVyLm9ic2VydmUobmlkZ2V0KTtcbiAgICBsb2FkUHJldmlvdXMobmlkZ2V0KTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgQWJzdHJhY3RNb2RlbCA6IHJlcXVpcmUoXCIuL0Fic3RyYWN0TW9kZWxcIiksXG4gICAgTmlkZ2V0RWxlbWVudCA6IHJlcXVpcmUoXCIuL05pZGdldEVsZW1lbnRcIiksXG4gICAgRmlsZU9wZXJhdGlvbnMgOiByZXF1aXJlKFwiLi9GaWxlT3BlcmF0aW9uc1wiKSxcbiAgICBOaWRnZXRCdXR0b25TZXQgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRCdXR0b25TZXRcIiksXG4gICAgTmlkZ2V0QnV0dG9uIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uXCIpLFxuICAgIE5pZGdldEJ1dHRvblN0YXRlIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0QnV0dG9uU3RhdGVcIiksXG4gICAgTmlkZ2V0SW1hZ2UgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRJbWFnZVwiKSxcbiAgICBOaWRnZXRIVE1MSW1hZ2UgOiByZXF1aXJlKFwiLi9uaWRnZXQtY29tcG9uZW50cy9OaWRnZXRIVE1MSW1hZ2VcIiksXG4gICAgTmlkZ2V0VGV4dCA6IHJlcXVpcmUoXCIuL25pZGdldC1jb21wb25lbnRzL05pZGdldFRleHRcIiksXG4gICAgTmlkZ2V0Q29udGFpbmVyIDogcmVxdWlyZShcIi4vbmlkZ2V0LWNvbXBvbmVudHMvTmlkZ2V0Q29udGFpbmVyXCIpLFxuICAgIE1vdXNlVXRpbGl0aWVzIDogcmVxdWlyZShcIi4vTW91c2VVdGlsaXRpZXNcIiksXG4gICAgQ29uc3RhbnRzOiByZXF1aXJlKFwiLi9OaWRnZXRcIiksXG4gICAgbGF5b3V0czoge31cbn07IiwiZnVuY3Rpb24gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKSB7XG4gIGlmIChzZWxmID09PSB2b2lkIDApIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gIH1cblxuICByZXR1cm4gc2VsZjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfYXNzZXJ0VGhpc0luaXRpYWxpemVkO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywga2V5LCBhcmcpIHtcbiAgdHJ5IHtcbiAgICB2YXIgaW5mbyA9IGdlbltrZXldKGFyZyk7XG4gICAgdmFyIHZhbHVlID0gaW5mby52YWx1ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZWplY3QoZXJyb3IpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmIChpbmZvLmRvbmUpIHtcbiAgICByZXNvbHZlKHZhbHVlKTtcbiAgfSBlbHNlIHtcbiAgICBQcm9taXNlLnJlc29sdmUodmFsdWUpLnRoZW4oX25leHQsIF90aHJvdyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2FzeW5jVG9HZW5lcmF0b3IoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBnZW4gPSBmbi5hcHBseShzZWxmLCBhcmdzKTtcblxuICAgICAgZnVuY3Rpb24gX25leHQodmFsdWUpIHtcbiAgICAgICAgYXN5bmNHZW5lcmF0b3JTdGVwKGdlbiwgcmVzb2x2ZSwgcmVqZWN0LCBfbmV4dCwgX3Rocm93LCBcIm5leHRcIiwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBfdGhyb3coZXJyKSB7XG4gICAgICAgIGFzeW5jR2VuZXJhdG9yU3RlcChnZW4sIHJlc29sdmUsIHJlamVjdCwgX25leHQsIF90aHJvdywgXCJ0aHJvd1wiLCBlcnIpO1xuICAgICAgfVxuXG4gICAgICBfbmV4dCh1bmRlZmluZWQpO1xuICAgIH0pO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9hc3luY1RvR2VuZXJhdG9yO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NsYXNzQ2FsbENoZWNrO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBzZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuL3NldFByb3RvdHlwZU9mLmpzXCIpO1xuXG52YXIgaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0ID0gcmVxdWlyZShcIi4vaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0LmpzXCIpO1xuXG5mdW5jdGlvbiBfY29uc3RydWN0KFBhcmVudCwgYXJncywgQ2xhc3MpIHtcbiAgaWYgKGlzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfY29uc3RydWN0ID0gUmVmbGVjdC5jb25zdHJ1Y3Q7XG4gICAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX2NvbnN0cnVjdCA9IGZ1bmN0aW9uIF9jb25zdHJ1Y3QoUGFyZW50LCBhcmdzLCBDbGFzcykge1xuICAgICAgdmFyIGEgPSBbbnVsbF07XG4gICAgICBhLnB1c2guYXBwbHkoYSwgYXJncyk7XG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSBGdW5jdGlvbi5iaW5kLmFwcGx5KFBhcmVudCwgYSk7XG4gICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgQ29uc3RydWN0b3IoKTtcbiAgICAgIGlmIChDbGFzcykgc2V0UHJvdG90eXBlT2YoaW5zdGFuY2UsIENsYXNzLnByb3RvdHlwZSk7XG4gICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfTtcblxuICAgIG1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBfY29uc3RydWN0LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NvbnN0cnVjdDtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICByZXR1cm4gQ29uc3RydWN0b3I7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2NyZWF0ZUNsYXNzO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBzdXBlclByb3BCYXNlID0gcmVxdWlyZShcIi4vc3VwZXJQcm9wQmFzZS5qc1wiKTtcblxuZnVuY3Rpb24gX2dldCh0YXJnZXQsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICBpZiAodHlwZW9mIFJlZmxlY3QgIT09IFwidW5kZWZpbmVkXCIgJiYgUmVmbGVjdC5nZXQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IF9nZXQgPSBSZWZsZWN0LmdldDtcbiAgICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIH0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBfZ2V0ID0gZnVuY3Rpb24gX2dldCh0YXJnZXQsIHByb3BlcnR5LCByZWNlaXZlcikge1xuICAgICAgdmFyIGJhc2UgPSBzdXBlclByb3BCYXNlKHRhcmdldCwgcHJvcGVydHkpO1xuICAgICAgaWYgKCFiYXNlKSByZXR1cm47XG4gICAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoYmFzZSwgcHJvcGVydHkpO1xuXG4gICAgICBpZiAoZGVzYy5nZXQpIHtcbiAgICAgICAgcmV0dXJuIGRlc2MuZ2V0LmNhbGwocmVjZWl2ZXIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIF9nZXQodGFyZ2V0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIgfHwgdGFyZ2V0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfZ2V0O1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gX2dldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LmdldFByb3RvdHlwZU9mIDogZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHtcbiAgICByZXR1cm4gby5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKG8pO1xuICB9O1xuICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2dldFByb3RvdHlwZU9mO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBzZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuL3NldFByb3RvdHlwZU9mLmpzXCIpO1xuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBzZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX2luaGVyaXRzO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsImZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgXCJkZWZhdWx0XCI6IG9ialxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQ7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX2lzTmF0aXZlRnVuY3Rpb24oZm4pIHtcbiAgcmV0dXJuIEZ1bmN0aW9uLnRvU3RyaW5nLmNhbGwoZm4pLmluZGV4T2YoXCJbbmF0aXZlIGNvZGVdXCIpICE9PSAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaXNOYXRpdmVGdW5jdGlvbjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0KCkge1xuICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwidW5kZWZpbmVkXCIgfHwgIVJlZmxlY3QuY29uc3RydWN0KSByZXR1cm4gZmFsc2U7XG4gIGlmIChSZWZsZWN0LmNvbnN0cnVjdC5zaGFtKSByZXR1cm4gZmFsc2U7XG4gIGlmICh0eXBlb2YgUHJveHkgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIHRydWU7XG5cbiAgdHJ5IHtcbiAgICBCb29sZWFuLnByb3RvdHlwZS52YWx1ZU9mLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoQm9vbGVhbiwgW10sIGZ1bmN0aW9uICgpIHt9KSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfaXNOYXRpdmVSZWZsZWN0Q29uc3RydWN0O1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBfdHlwZW9mID0gcmVxdWlyZShcIkBiYWJlbC9ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpW1wiZGVmYXVsdFwiXTtcblxudmFyIGFzc2VydFRoaXNJbml0aWFsaXplZCA9IHJlcXVpcmUoXCIuL2Fzc2VydFRoaXNJbml0aWFsaXplZC5qc1wiKTtcblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkge1xuICBpZiAoY2FsbCAmJiAoX3R5cGVvZihjYWxsKSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSkge1xuICAgIHJldHVybiBjYWxsO1xuICB9XG5cbiAgcmV0dXJuIGFzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xuICBtb2R1bGUuZXhwb3J0cyA9IF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xuICAgIG8uX19wcm90b19fID0gcDtcbiAgICByZXR1cm4gbztcbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG4gIHJldHVybiBfc2V0UHJvdG90eXBlT2YobywgcCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3NldFByb3RvdHlwZU9mO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBnZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuL2dldFByb3RvdHlwZU9mLmpzXCIpO1xuXG5mdW5jdGlvbiBfc3VwZXJQcm9wQmFzZShvYmplY3QsIHByb3BlcnR5KSB7XG4gIHdoaWxlICghT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpKSB7XG4gICAgb2JqZWN0ID0gZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcbiAgICBpZiAob2JqZWN0ID09PSBudWxsKSBicmVhaztcbiAgfVxuXG4gIHJldHVybiBvYmplY3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3N1cGVyUHJvcEJhc2U7XG5tb2R1bGUuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtb2R1bGUuZXhwb3J0cywgbW9kdWxlLmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiO1xuXG4gIGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iajtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCAmJiBvYmogIT09IFN5bWJvbC5wcm90b3R5cGUgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajtcbiAgICB9O1xuXG4gICAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIF90eXBlb2Yob2JqKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBfdHlwZW9mO1xubW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsInZhciBnZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCIuL2dldFByb3RvdHlwZU9mLmpzXCIpO1xuXG52YXIgc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiLi9zZXRQcm90b3R5cGVPZi5qc1wiKTtcblxudmFyIGlzTmF0aXZlRnVuY3Rpb24gPSByZXF1aXJlKFwiLi9pc05hdGl2ZUZ1bmN0aW9uLmpzXCIpO1xuXG52YXIgY29uc3RydWN0ID0gcmVxdWlyZShcIi4vY29uc3RydWN0LmpzXCIpO1xuXG5mdW5jdGlvbiBfd3JhcE5hdGl2ZVN1cGVyKENsYXNzKSB7XG4gIHZhciBfY2FjaGUgPSB0eXBlb2YgTWFwID09PSBcImZ1bmN0aW9uXCIgPyBuZXcgTWFwKCkgOiB1bmRlZmluZWQ7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBfd3JhcE5hdGl2ZVN1cGVyID0gZnVuY3Rpb24gX3dyYXBOYXRpdmVTdXBlcihDbGFzcykge1xuICAgIGlmIChDbGFzcyA9PT0gbnVsbCB8fCAhaXNOYXRpdmVGdW5jdGlvbihDbGFzcykpIHJldHVybiBDbGFzcztcblxuICAgIGlmICh0eXBlb2YgQ2xhc3MgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgX2NhY2hlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAoX2NhY2hlLmhhcyhDbGFzcykpIHJldHVybiBfY2FjaGUuZ2V0KENsYXNzKTtcblxuICAgICAgX2NhY2hlLnNldChDbGFzcywgV3JhcHBlcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gV3JhcHBlcigpIHtcbiAgICAgIHJldHVybiBjb25zdHJ1Y3QoQ2xhc3MsIGFyZ3VtZW50cywgZ2V0UHJvdG90eXBlT2YodGhpcykuY29uc3RydWN0b3IpO1xuICAgIH1cblxuICAgIFdyYXBwZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShDbGFzcy5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBXcmFwcGVyLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBzZXRQcm90b3R5cGVPZihXcmFwcGVyLCBDbGFzcyk7XG4gIH07XG5cbiAgbW9kdWxlLmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbW9kdWxlLmV4cG9ydHMsIG1vZHVsZS5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuICByZXR1cm4gX3dyYXBOYXRpdmVTdXBlcihDbGFzcyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gX3dyYXBOYXRpdmVTdXBlcjtcbm1vZHVsZS5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1vZHVsZS5leHBvcnRzLCBtb2R1bGUuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJyZWdlbmVyYXRvci1ydW50aW1lXCIpO1xuIiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG52YXIgcnVudGltZSA9IChmdW5jdGlvbiAoZXhwb3J0cykge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICB2YXIgT3AgPSBPYmplY3QucHJvdG90eXBlO1xuICB2YXIgaGFzT3duID0gT3AuaGFzT3duUHJvcGVydHk7XG4gIHZhciB1bmRlZmluZWQ7IC8vIE1vcmUgY29tcHJlc3NpYmxlIHRoYW4gdm9pZCAwLlxuICB2YXIgJFN5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiA/IFN5bWJvbCA6IHt9O1xuICB2YXIgaXRlcmF0b3JTeW1ib2wgPSAkU3ltYm9sLml0ZXJhdG9yIHx8IFwiQEBpdGVyYXRvclwiO1xuICB2YXIgYXN5bmNJdGVyYXRvclN5bWJvbCA9ICRTeW1ib2wuYXN5bmNJdGVyYXRvciB8fCBcIkBAYXN5bmNJdGVyYXRvclwiO1xuICB2YXIgdG9TdHJpbmdUYWdTeW1ib2wgPSAkU3ltYm9sLnRvU3RyaW5nVGFnIHx8IFwiQEB0b1N0cmluZ1RhZ1wiO1xuXG4gIGZ1bmN0aW9uIGRlZmluZShvYmosIGtleSwgdmFsdWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiBvYmpba2V5XTtcbiAgfVxuICB0cnkge1xuICAgIC8vIElFIDggaGFzIGEgYnJva2VuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSB0aGF0IG9ubHkgd29ya3Mgb24gRE9NIG9iamVjdHMuXG4gICAgZGVmaW5lKHt9LCBcIlwiKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgZGVmaW5lID0gZnVuY3Rpb24ob2JqLCBrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gb2JqW2tleV0gPSB2YWx1ZTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIC8vIElmIG91dGVyRm4gcHJvdmlkZWQgYW5kIG91dGVyRm4ucHJvdG90eXBlIGlzIGEgR2VuZXJhdG9yLCB0aGVuIG91dGVyRm4ucHJvdG90eXBlIGluc3RhbmNlb2YgR2VuZXJhdG9yLlxuICAgIHZhciBwcm90b0dlbmVyYXRvciA9IG91dGVyRm4gJiYgb3V0ZXJGbi5wcm90b3R5cGUgaW5zdGFuY2VvZiBHZW5lcmF0b3IgPyBvdXRlckZuIDogR2VuZXJhdG9yO1xuICAgIHZhciBnZW5lcmF0b3IgPSBPYmplY3QuY3JlYXRlKHByb3RvR2VuZXJhdG9yLnByb3RvdHlwZSk7XG4gICAgdmFyIGNvbnRleHQgPSBuZXcgQ29udGV4dCh0cnlMb2NzTGlzdCB8fCBbXSk7XG5cbiAgICAvLyBUaGUgLl9pbnZva2UgbWV0aG9kIHVuaWZpZXMgdGhlIGltcGxlbWVudGF0aW9ucyBvZiB0aGUgLm5leHQsXG4gICAgLy8gLnRocm93LCBhbmQgLnJldHVybiBtZXRob2RzLlxuICAgIGdlbmVyYXRvci5faW52b2tlID0gbWFrZUludm9rZU1ldGhvZChpbm5lckZuLCBzZWxmLCBjb250ZXh0KTtcblxuICAgIHJldHVybiBnZW5lcmF0b3I7XG4gIH1cbiAgZXhwb3J0cy53cmFwID0gd3JhcDtcblxuICAvLyBUcnkvY2F0Y2ggaGVscGVyIHRvIG1pbmltaXplIGRlb3B0aW1pemF0aW9ucy4gUmV0dXJucyBhIGNvbXBsZXRpb25cbiAgLy8gcmVjb3JkIGxpa2UgY29udGV4dC50cnlFbnRyaWVzW2ldLmNvbXBsZXRpb24uIFRoaXMgaW50ZXJmYWNlIGNvdWxkXG4gIC8vIGhhdmUgYmVlbiAoYW5kIHdhcyBwcmV2aW91c2x5KSBkZXNpZ25lZCB0byB0YWtlIGEgY2xvc3VyZSB0byBiZVxuICAvLyBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnRzLCBidXQgaW4gYWxsIHRoZSBjYXNlcyB3ZSBjYXJlIGFib3V0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhbiBleGlzdGluZyBtZXRob2Qgd2Ugd2FudCB0byBjYWxsLCBzbyB0aGVyZSdzIG5vIG5lZWRcbiAgLy8gdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIG9iamVjdC4gV2UgY2FuIGV2ZW4gZ2V0IGF3YXkgd2l0aCBhc3N1bWluZ1xuICAvLyB0aGUgbWV0aG9kIHRha2VzIGV4YWN0bHkgb25lIGFyZ3VtZW50LCBzaW5jZSB0aGF0IGhhcHBlbnMgdG8gYmUgdHJ1ZVxuICAvLyBpbiBldmVyeSBjYXNlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIHRvdWNoIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBUaGVcbiAgLy8gb25seSBhZGRpdGlvbmFsIGFsbG9jYXRpb24gcmVxdWlyZWQgaXMgdGhlIGNvbXBsZXRpb24gcmVjb3JkLCB3aGljaFxuICAvLyBoYXMgYSBzdGFibGUgc2hhcGUgYW5kIHNvIGhvcGVmdWxseSBzaG91bGQgYmUgY2hlYXAgdG8gYWxsb2NhdGUuXG4gIGZ1bmN0aW9uIHRyeUNhdGNoKGZuLCBvYmosIGFyZykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIm5vcm1hbFwiLCBhcmc6IGZuLmNhbGwob2JqLCBhcmcpIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcInRocm93XCIsIGFyZzogZXJyIH07XG4gICAgfVxuICB9XG5cbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgPSBcInN1c3BlbmRlZFN0YXJ0XCI7XG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkID0gXCJzdXNwZW5kZWRZaWVsZFwiO1xuICB2YXIgR2VuU3RhdGVFeGVjdXRpbmcgPSBcImV4ZWN1dGluZ1wiO1xuICB2YXIgR2VuU3RhdGVDb21wbGV0ZWQgPSBcImNvbXBsZXRlZFwiO1xuXG4gIC8vIFJldHVybmluZyB0aGlzIG9iamVjdCBmcm9tIHRoZSBpbm5lckZuIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXNcbiAgLy8gYnJlYWtpbmcgb3V0IG9mIHRoZSBkaXNwYXRjaCBzd2l0Y2ggc3RhdGVtZW50LlxuICB2YXIgQ29udGludWVTZW50aW5lbCA9IHt9O1xuXG4gIC8vIER1bW15IGNvbnN0cnVjdG9yIGZ1bmN0aW9ucyB0aGF0IHdlIHVzZSBhcyB0aGUgLmNvbnN0cnVjdG9yIGFuZFxuICAvLyAuY29uc3RydWN0b3IucHJvdG90eXBlIHByb3BlcnRpZXMgZm9yIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0cy4gRm9yIGZ1bGwgc3BlYyBjb21wbGlhbmNlLCB5b3UgbWF5IHdpc2ggdG8gY29uZmlndXJlIHlvdXJcbiAgLy8gbWluaWZpZXIgbm90IHRvIG1hbmdsZSB0aGUgbmFtZXMgb2YgdGhlc2UgdHdvIGZ1bmN0aW9ucy5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yKCkge31cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG5cbiAgLy8gVGhpcyBpcyBhIHBvbHlmaWxsIGZvciAlSXRlcmF0b3JQcm90b3R5cGUlIGZvciBlbnZpcm9ubWVudHMgdGhhdFxuICAvLyBkb24ndCBuYXRpdmVseSBzdXBwb3J0IGl0LlxuICB2YXIgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcbiAgSXRlcmF0b3JQcm90b3R5cGVbaXRlcmF0b3JTeW1ib2xdID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHZhciBnZXRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcbiAgdmFyIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG8gJiYgZ2V0UHJvdG8oZ2V0UHJvdG8odmFsdWVzKFtdKSkpO1xuICBpZiAoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUgJiZcbiAgICAgIE5hdGl2ZUl0ZXJhdG9yUHJvdG90eXBlICE9PSBPcCAmJlxuICAgICAgaGFzT3duLmNhbGwoTmF0aXZlSXRlcmF0b3JQcm90b3R5cGUsIGl0ZXJhdG9yU3ltYm9sKSkge1xuICAgIC8vIFRoaXMgZW52aXJvbm1lbnQgaGFzIGEgbmF0aXZlICVJdGVyYXRvclByb3RvdHlwZSU7IHVzZSBpdCBpbnN0ZWFkXG4gICAgLy8gb2YgdGhlIHBvbHlmaWxsLlxuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gTmF0aXZlSXRlcmF0b3JQcm90b3R5cGU7XG4gIH1cblxuICB2YXIgR3AgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUgPVxuICAgIEdlbmVyYXRvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlKTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR3AuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvbjtcbiAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBkZWZpbmUoXG4gICAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUsXG4gICAgdG9TdHJpbmdUYWdTeW1ib2wsXG4gICAgXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICk7XG5cbiAgLy8gSGVscGVyIGZvciBkZWZpbmluZyB0aGUgLm5leHQsIC50aHJvdywgYW5kIC5yZXR1cm4gbWV0aG9kcyBvZiB0aGVcbiAgLy8gSXRlcmF0b3IgaW50ZXJmYWNlIGluIHRlcm1zIG9mIGEgc2luZ2xlIC5faW52b2tlIG1ldGhvZC5cbiAgZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3JNZXRob2RzKHByb3RvdHlwZSkge1xuICAgIFtcIm5leHRcIiwgXCJ0aHJvd1wiLCBcInJldHVyblwiXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgZGVmaW5lKHByb3RvdHlwZSwgbWV0aG9kLCBmdW5jdGlvbihhcmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZShtZXRob2QsIGFyZyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGV4cG9ydHMuaXNHZW5lcmF0b3JGdW5jdGlvbiA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIHZhciBjdG9yID0gdHlwZW9mIGdlbkZ1biA9PT0gXCJmdW5jdGlvblwiICYmIGdlbkZ1bi5jb25zdHJ1Y3RvcjtcbiAgICByZXR1cm4gY3RvclxuICAgICAgPyBjdG9yID09PSBHZW5lcmF0b3JGdW5jdGlvbiB8fFxuICAgICAgICAvLyBGb3IgdGhlIG5hdGl2ZSBHZW5lcmF0b3JGdW5jdGlvbiBjb25zdHJ1Y3RvciwgdGhlIGJlc3Qgd2UgY2FuXG4gICAgICAgIC8vIGRvIGlzIHRvIGNoZWNrIGl0cyAubmFtZSBwcm9wZXJ0eS5cbiAgICAgICAgKGN0b3IuZGlzcGxheU5hbWUgfHwgY3Rvci5uYW1lKSA9PT0gXCJHZW5lcmF0b3JGdW5jdGlvblwiXG4gICAgICA6IGZhbHNlO1xuICB9O1xuXG4gIGV4cG9ydHMubWFyayA9IGZ1bmN0aW9uKGdlbkZ1bikge1xuICAgIGlmIChPYmplY3Quc2V0UHJvdG90eXBlT2YpIHtcbiAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihnZW5GdW4sIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2VuRnVuLl9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAgICAgZGVmaW5lKGdlbkZ1biwgdG9TdHJpbmdUYWdTeW1ib2wsIFwiR2VuZXJhdG9yRnVuY3Rpb25cIik7XG4gICAgfVxuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIC8vIFdpdGhpbiB0aGUgYm9keSBvZiBhbnkgYXN5bmMgZnVuY3Rpb24sIGBhd2FpdCB4YCBpcyB0cmFuc2Zvcm1lZCB0b1xuICAvLyBgeWllbGQgcmVnZW5lcmF0b3JSdW50aW1lLmF3cmFwKHgpYCwgc28gdGhhdCB0aGUgcnVudGltZSBjYW4gdGVzdFxuICAvLyBgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKWAgdG8gZGV0ZXJtaW5lIGlmIHRoZSB5aWVsZGVkIHZhbHVlIGlzXG4gIC8vIG1lYW50IHRvIGJlIGF3YWl0ZWQuXG4gIGV4cG9ydHMuYXdyYXAgPSBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4geyBfX2F3YWl0OiBhcmcgfTtcbiAgfTtcblxuICBmdW5jdGlvbiBBc3luY0l0ZXJhdG9yKGdlbmVyYXRvciwgUHJvbWlzZUltcGwpIHtcbiAgICBmdW5jdGlvbiBpbnZva2UobWV0aG9kLCBhcmcsIHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGdlbmVyYXRvclttZXRob2RdLCBnZW5lcmF0b3IsIGFyZyk7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICByZWplY3QocmVjb3JkLmFyZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzdWx0ID0gcmVjb3JkLmFyZztcbiAgICAgICAgdmFyIHZhbHVlID0gcmVzdWx0LnZhbHVlO1xuICAgICAgICBpZiAodmFsdWUgJiZcbiAgICAgICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAgICAgaGFzT3duLmNhbGwodmFsdWUsIFwiX19hd2FpdFwiKSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlSW1wbC5yZXNvbHZlKHZhbHVlLl9fYXdhaXQpLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgIGludm9rZShcIm5leHRcIiwgdmFsdWUsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBpbnZva2UoXCJ0aHJvd1wiLCBlcnIsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZUltcGwucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbih1bndyYXBwZWQpIHtcbiAgICAgICAgICAvLyBXaGVuIGEgeWllbGRlZCBQcm9taXNlIGlzIHJlc29sdmVkLCBpdHMgZmluYWwgdmFsdWUgYmVjb21lc1xuICAgICAgICAgIC8vIHRoZSAudmFsdWUgb2YgdGhlIFByb21pc2U8e3ZhbHVlLGRvbmV9PiByZXN1bHQgZm9yIHRoZVxuICAgICAgICAgIC8vIGN1cnJlbnQgaXRlcmF0aW9uLlxuICAgICAgICAgIHJlc3VsdC52YWx1ZSA9IHVud3JhcHBlZDtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgLy8gSWYgYSByZWplY3RlZCBQcm9taXNlIHdhcyB5aWVsZGVkLCB0aHJvdyB0aGUgcmVqZWN0aW9uIGJhY2tcbiAgICAgICAgICAvLyBpbnRvIHRoZSBhc3luYyBnZW5lcmF0b3IgZnVuY3Rpb24gc28gaXQgY2FuIGJlIGhhbmRsZWQgdGhlcmUuXG4gICAgICAgICAgcmV0dXJuIGludm9rZShcInRocm93XCIsIGVycm9yLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHJldmlvdXNQcm9taXNlO1xuXG4gICAgZnVuY3Rpb24gZW5xdWV1ZShtZXRob2QsIGFyZykge1xuICAgICAgZnVuY3Rpb24gY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZUltcGwoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgaW52b2tlKG1ldGhvZCwgYXJnLCByZXNvbHZlLCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByZXZpb3VzUHJvbWlzZSA9XG4gICAgICAgIC8vIElmIGVucXVldWUgaGFzIGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiB3ZSB3YW50IHRvIHdhaXQgdW50aWxcbiAgICAgICAgLy8gYWxsIHByZXZpb3VzIFByb21pc2VzIGhhdmUgYmVlbiByZXNvbHZlZCBiZWZvcmUgY2FsbGluZyBpbnZva2UsXG4gICAgICAgIC8vIHNvIHRoYXQgcmVzdWx0cyBhcmUgYWx3YXlzIGRlbGl2ZXJlZCBpbiB0aGUgY29ycmVjdCBvcmRlci4gSWZcbiAgICAgICAgLy8gZW5xdWV1ZSBoYXMgbm90IGJlZW4gY2FsbGVkIGJlZm9yZSwgdGhlbiBpdCBpcyBpbXBvcnRhbnQgdG9cbiAgICAgICAgLy8gY2FsbCBpbnZva2UgaW1tZWRpYXRlbHksIHdpdGhvdXQgd2FpdGluZyBvbiBhIGNhbGxiYWNrIHRvIGZpcmUsXG4gICAgICAgIC8vIHNvIHRoYXQgdGhlIGFzeW5jIGdlbmVyYXRvciBmdW5jdGlvbiBoYXMgdGhlIG9wcG9ydHVuaXR5IHRvIGRvXG4gICAgICAgIC8vIGFueSBuZWNlc3Nhcnkgc2V0dXAgaW4gYSBwcmVkaWN0YWJsZSB3YXkuIFRoaXMgcHJlZGljdGFiaWxpdHlcbiAgICAgICAgLy8gaXMgd2h5IHRoZSBQcm9taXNlIGNvbnN0cnVjdG9yIHN5bmNocm9ub3VzbHkgaW52b2tlcyBpdHNcbiAgICAgICAgLy8gZXhlY3V0b3IgY2FsbGJhY2ssIGFuZCB3aHkgYXN5bmMgZnVuY3Rpb25zIHN5bmNocm9ub3VzbHlcbiAgICAgICAgLy8gZXhlY3V0ZSBjb2RlIGJlZm9yZSB0aGUgZmlyc3QgYXdhaXQuIFNpbmNlIHdlIGltcGxlbWVudCBzaW1wbGVcbiAgICAgICAgLy8gYXN5bmMgZnVuY3Rpb25zIGluIHRlcm1zIG9mIGFzeW5jIGdlbmVyYXRvcnMsIGl0IGlzIGVzcGVjaWFsbHlcbiAgICAgICAgLy8gaW1wb3J0YW50IHRvIGdldCB0aGlzIHJpZ2h0LCBldmVuIHRob3VnaCBpdCByZXF1aXJlcyBjYXJlLlxuICAgICAgICBwcmV2aW91c1Byb21pc2UgPyBwcmV2aW91c1Byb21pc2UudGhlbihcbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZyxcbiAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGluZyBmYWlsdXJlcyB0byBQcm9taXNlcyByZXR1cm5lZCBieSBsYXRlclxuICAgICAgICAgIC8vIGludm9jYXRpb25zIG9mIHRoZSBpdGVyYXRvci5cbiAgICAgICAgICBjYWxsSW52b2tlV2l0aE1ldGhvZEFuZEFyZ1xuICAgICAgICApIDogY2FsbEludm9rZVdpdGhNZXRob2RBbmRBcmcoKTtcbiAgICB9XG5cbiAgICAvLyBEZWZpbmUgdGhlIHVuaWZpZWQgaGVscGVyIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gaW1wbGVtZW50IC5uZXh0LFxuICAgIC8vIC50aHJvdywgYW5kIC5yZXR1cm4gKHNlZSBkZWZpbmVJdGVyYXRvck1ldGhvZHMpLlxuICAgIHRoaXMuX2ludm9rZSA9IGVucXVldWU7XG4gIH1cblxuICBkZWZpbmVJdGVyYXRvck1ldGhvZHMoQXN5bmNJdGVyYXRvci5wcm90b3R5cGUpO1xuICBBc3luY0l0ZXJhdG9yLnByb3RvdHlwZVthc3luY0l0ZXJhdG9yU3ltYm9sXSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgZXhwb3J0cy5Bc3luY0l0ZXJhdG9yID0gQXN5bmNJdGVyYXRvcjtcblxuICAvLyBOb3RlIHRoYXQgc2ltcGxlIGFzeW5jIGZ1bmN0aW9ucyBhcmUgaW1wbGVtZW50ZWQgb24gdG9wIG9mXG4gIC8vIEFzeW5jSXRlcmF0b3Igb2JqZWN0czsgdGhleSBqdXN0IHJldHVybiBhIFByb21pc2UgZm9yIHRoZSB2YWx1ZSBvZlxuICAvLyB0aGUgZmluYWwgcmVzdWx0IHByb2R1Y2VkIGJ5IHRoZSBpdGVyYXRvci5cbiAgZXhwb3J0cy5hc3luYyA9IGZ1bmN0aW9uKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0LCBQcm9taXNlSW1wbCkge1xuICAgIGlmIChQcm9taXNlSW1wbCA9PT0gdm9pZCAwKSBQcm9taXNlSW1wbCA9IFByb21pc2U7XG5cbiAgICB2YXIgaXRlciA9IG5ldyBBc3luY0l0ZXJhdG9yKFxuICAgICAgd3JhcChpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCksXG4gICAgICBQcm9taXNlSW1wbFxuICAgICk7XG5cbiAgICByZXR1cm4gZXhwb3J0cy5pc0dlbmVyYXRvckZ1bmN0aW9uKG91dGVyRm4pXG4gICAgICA/IGl0ZXIgLy8gSWYgb3V0ZXJGbiBpcyBhIGdlbmVyYXRvciwgcmV0dXJuIHRoZSBmdWxsIGl0ZXJhdG9yLlxuICAgICAgOiBpdGVyLm5leHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZXN1bHQuZG9uZSA/IHJlc3VsdC52YWx1ZSA6IGl0ZXIubmV4dCgpO1xuICAgICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBtYWtlSW52b2tlTWV0aG9kKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpIHtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIGludm9rZShtZXRob2QsIGFyZykge1xuICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZUV4ZWN1dGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBydW5uaW5nXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlQ29tcGxldGVkKSB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHRocm93IGFyZztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlIGZvcmdpdmluZywgcGVyIDI1LjMuMy4zLjMgb2YgdGhlIHNwZWM6XG4gICAgICAgIC8vIGh0dHBzOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy1nZW5lcmF0b3JyZXN1bWVcbiAgICAgICAgcmV0dXJuIGRvbmVSZXN1bHQoKTtcbiAgICAgIH1cblxuICAgICAgY29udGV4dC5tZXRob2QgPSBtZXRob2Q7XG4gICAgICBjb250ZXh0LmFyZyA9IGFyZztcblxuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gY29udGV4dC5kZWxlZ2F0ZTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgdmFyIGRlbGVnYXRlUmVzdWx0ID0gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG4gICAgICAgICAgaWYgKGRlbGVnYXRlUmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoZGVsZWdhdGVSZXN1bHQgPT09IENvbnRpbnVlU2VudGluZWwpIGNvbnRpbnVlO1xuICAgICAgICAgICAgcmV0dXJuIGRlbGVnYXRlUmVzdWx0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCA9PT0gXCJuZXh0XCIpIHtcbiAgICAgICAgICAvLyBTZXR0aW5nIGNvbnRleHQuX3NlbnQgZm9yIGxlZ2FjeSBzdXBwb3J0IG9mIEJhYmVsJ3NcbiAgICAgICAgICAvLyBmdW5jdGlvbi5zZW50IGltcGxlbWVudGF0aW9uLlxuICAgICAgICAgIGNvbnRleHQuc2VudCA9IGNvbnRleHQuX3NlbnQgPSBjb250ZXh0LmFyZztcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlU3VzcGVuZGVkU3RhcnQpIHtcbiAgICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBjb250ZXh0LmFyZztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGNvbnRleHQuYXJnKTtcblxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgY29udGV4dC5hcmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUV4ZWN1dGluZztcblxuICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goaW5uZXJGbiwgc2VsZiwgY29udGV4dCk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJub3JtYWxcIikge1xuICAgICAgICAgIC8vIElmIGFuIGV4Y2VwdGlvbiBpcyB0aHJvd24gZnJvbSBpbm5lckZuLCB3ZSBsZWF2ZSBzdGF0ZSA9PT1cbiAgICAgICAgICAvLyBHZW5TdGF0ZUV4ZWN1dGluZyBhbmQgbG9vcCBiYWNrIGZvciBhbm90aGVyIGludm9jYXRpb24uXG4gICAgICAgICAgc3RhdGUgPSBjb250ZXh0LmRvbmVcbiAgICAgICAgICAgID8gR2VuU3RhdGVDb21wbGV0ZWRcbiAgICAgICAgICAgIDogR2VuU3RhdGVTdXNwZW5kZWRZaWVsZDtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHJlY29yZC5hcmcsXG4gICAgICAgICAgICBkb25lOiBjb250ZXh0LmRvbmVcbiAgICAgICAgICB9O1xuXG4gICAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgIHN0YXRlID0gR2VuU3RhdGVDb21wbGV0ZWQ7XG4gICAgICAgICAgLy8gRGlzcGF0Y2ggdGhlIGV4Y2VwdGlvbiBieSBsb29waW5nIGJhY2sgYXJvdW5kIHRvIHRoZVxuICAgICAgICAgIC8vIGNvbnRleHQuZGlzcGF0Y2hFeGNlcHRpb24oY29udGV4dC5hcmcpIGNhbGwgYWJvdmUuXG4gICAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8vIENhbGwgZGVsZWdhdGUuaXRlcmF0b3JbY29udGV4dC5tZXRob2RdKGNvbnRleHQuYXJnKSBhbmQgaGFuZGxlIHRoZVxuICAvLyByZXN1bHQsIGVpdGhlciBieSByZXR1cm5pbmcgYSB7IHZhbHVlLCBkb25lIH0gcmVzdWx0IGZyb20gdGhlXG4gIC8vIGRlbGVnYXRlIGl0ZXJhdG9yLCBvciBieSBtb2RpZnlpbmcgY29udGV4dC5tZXRob2QgYW5kIGNvbnRleHQuYXJnLFxuICAvLyBzZXR0aW5nIGNvbnRleHQuZGVsZWdhdGUgdG8gbnVsbCwgYW5kIHJldHVybmluZyB0aGUgQ29udGludWVTZW50aW5lbC5cbiAgZnVuY3Rpb24gbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBtZXRob2QgPSBkZWxlZ2F0ZS5pdGVyYXRvcltjb250ZXh0Lm1ldGhvZF07XG4gICAgaWYgKG1ldGhvZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBBIC50aHJvdyBvciAucmV0dXJuIHdoZW4gdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBubyAudGhyb3dcbiAgICAgIC8vIG1ldGhvZCBhbHdheXMgdGVybWluYXRlcyB0aGUgeWllbGQqIGxvb3AuXG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgaWYgKGNvbnRleHQubWV0aG9kID09PSBcInRocm93XCIpIHtcbiAgICAgICAgLy8gTm90ZTogW1wicmV0dXJuXCJdIG11c3QgYmUgdXNlZCBmb3IgRVMzIHBhcnNpbmcgY29tcGF0aWJpbGl0eS5cbiAgICAgICAgaWYgKGRlbGVnYXRlLml0ZXJhdG9yW1wicmV0dXJuXCJdKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRlbGVnYXRlIGl0ZXJhdG9yIGhhcyBhIHJldHVybiBtZXRob2QsIGdpdmUgaXQgYVxuICAgICAgICAgIC8vIGNoYW5jZSB0byBjbGVhbiB1cC5cbiAgICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwicmV0dXJuXCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbWF5YmVJbnZva2VEZWxlZ2F0ZShkZWxlZ2F0ZSwgY29udGV4dCk7XG5cbiAgICAgICAgICBpZiAoY29udGV4dC5tZXRob2QgPT09IFwidGhyb3dcIikge1xuICAgICAgICAgICAgLy8gSWYgbWF5YmVJbnZva2VEZWxlZ2F0ZShjb250ZXh0KSBjaGFuZ2VkIGNvbnRleHQubWV0aG9kIGZyb21cbiAgICAgICAgICAgIC8vIFwicmV0dXJuXCIgdG8gXCJ0aHJvd1wiLCBsZXQgdGhhdCBvdmVycmlkZSB0aGUgVHlwZUVycm9yIGJlbG93LlxuICAgICAgICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgIGNvbnRleHQuYXJnID0gbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBcIlRoZSBpdGVyYXRvciBkb2VzIG5vdCBwcm92aWRlIGEgJ3Rocm93JyBtZXRob2RcIik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB0cnlDYXRjaChtZXRob2QsIGRlbGVnYXRlLml0ZXJhdG9yLCBjb250ZXh0LmFyZyk7XG5cbiAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgY29udGV4dC5tZXRob2QgPSBcInRocm93XCI7XG4gICAgICBjb250ZXh0LmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcblxuICAgIGlmICghIGluZm8pIHtcbiAgICAgIGNvbnRleHQubWV0aG9kID0gXCJ0aHJvd1wiO1xuICAgICAgY29udGV4dC5hcmcgPSBuZXcgVHlwZUVycm9yKFwiaXRlcmF0b3IgcmVzdWx0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICBjb250ZXh0LmRlbGVnYXRlID0gbnVsbDtcbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cblxuICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgIC8vIEFzc2lnbiB0aGUgcmVzdWx0IG9mIHRoZSBmaW5pc2hlZCBkZWxlZ2F0ZSB0byB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyB2YXJpYWJsZSBzcGVjaWZpZWQgYnkgZGVsZWdhdGUucmVzdWx0TmFtZSAoc2VlIGRlbGVnYXRlWWllbGQpLlxuICAgICAgY29udGV4dFtkZWxlZ2F0ZS5yZXN1bHROYW1lXSA9IGluZm8udmFsdWU7XG5cbiAgICAgIC8vIFJlc3VtZSBleGVjdXRpb24gYXQgdGhlIGRlc2lyZWQgbG9jYXRpb24gKHNlZSBkZWxlZ2F0ZVlpZWxkKS5cbiAgICAgIGNvbnRleHQubmV4dCA9IGRlbGVnYXRlLm5leHRMb2M7XG5cbiAgICAgIC8vIElmIGNvbnRleHQubWV0aG9kIHdhcyBcInRocm93XCIgYnV0IHRoZSBkZWxlZ2F0ZSBoYW5kbGVkIHRoZVxuICAgICAgLy8gZXhjZXB0aW9uLCBsZXQgdGhlIG91dGVyIGdlbmVyYXRvciBwcm9jZWVkIG5vcm1hbGx5LiBJZlxuICAgICAgLy8gY29udGV4dC5tZXRob2Qgd2FzIFwibmV4dFwiLCBmb3JnZXQgY29udGV4dC5hcmcgc2luY2UgaXQgaGFzIGJlZW5cbiAgICAgIC8vIFwiY29uc3VtZWRcIiBieSB0aGUgZGVsZWdhdGUgaXRlcmF0b3IuIElmIGNvbnRleHQubWV0aG9kIHdhc1xuICAgICAgLy8gXCJyZXR1cm5cIiwgYWxsb3cgdGhlIG9yaWdpbmFsIC5yZXR1cm4gY2FsbCB0byBjb250aW51ZSBpbiB0aGVcbiAgICAgIC8vIG91dGVyIGdlbmVyYXRvci5cbiAgICAgIGlmIChjb250ZXh0Lm1ldGhvZCAhPT0gXCJyZXR1cm5cIikge1xuICAgICAgICBjb250ZXh0Lm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgICBjb250ZXh0LmFyZyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZS15aWVsZCB0aGUgcmVzdWx0IHJldHVybmVkIGJ5IHRoZSBkZWxlZ2F0ZSBtZXRob2QuXG4gICAgICByZXR1cm4gaW5mbztcbiAgICB9XG5cbiAgICAvLyBUaGUgZGVsZWdhdGUgaXRlcmF0b3IgaXMgZmluaXNoZWQsIHNvIGZvcmdldCBpdCBhbmQgY29udGludWUgd2l0aFxuICAgIC8vIHRoZSBvdXRlciBnZW5lcmF0b3IuXG4gICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gIH1cblxuICAvLyBEZWZpbmUgR2VuZXJhdG9yLnByb3RvdHlwZS57bmV4dCx0aHJvdyxyZXR1cm59IGluIHRlcm1zIG9mIHRoZVxuICAvLyB1bmlmaWVkIC5faW52b2tlIGhlbHBlciBtZXRob2QuXG4gIGRlZmluZUl0ZXJhdG9yTWV0aG9kcyhHcCk7XG5cbiAgZGVmaW5lKEdwLCB0b1N0cmluZ1RhZ1N5bWJvbCwgXCJHZW5lcmF0b3JcIik7XG5cbiAgLy8gQSBHZW5lcmF0b3Igc2hvdWxkIGFsd2F5cyByZXR1cm4gaXRzZWxmIGFzIHRoZSBpdGVyYXRvciBvYmplY3Qgd2hlbiB0aGVcbiAgLy8gQEBpdGVyYXRvciBmdW5jdGlvbiBpcyBjYWxsZWQgb24gaXQuIFNvbWUgYnJvd3NlcnMnIGltcGxlbWVudGF0aW9ucyBvZiB0aGVcbiAgLy8gaXRlcmF0b3IgcHJvdG90eXBlIGNoYWluIGluY29ycmVjdGx5IGltcGxlbWVudCB0aGlzLCBjYXVzaW5nIHRoZSBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0IHRvIG5vdCBiZSByZXR1cm5lZCBmcm9tIHRoaXMgY2FsbC4gVGhpcyBlbnN1cmVzIHRoYXQgZG9lc24ndCBoYXBwZW4uXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVnZW5lcmF0b3IvaXNzdWVzLzI3NCBmb3IgbW9yZSBkZXRhaWxzLlxuICBHcFtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KHRydWUpO1xuICB9XG5cbiAgZXhwb3J0cy5rZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9XG4gICAga2V5cy5yZXZlcnNlKCk7XG5cbiAgICAvLyBSYXRoZXIgdGhhbiByZXR1cm5pbmcgYW4gb2JqZWN0IHdpdGggYSBuZXh0IG1ldGhvZCwgd2Uga2VlcFxuICAgIC8vIHRoaW5ncyBzaW1wbGUgYW5kIHJldHVybiB0aGUgbmV4dCBmdW5jdGlvbiBpdHNlbGYuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICB3aGlsZSAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IGtleXMucG9wKCk7XG4gICAgICAgIGlmIChrZXkgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgbmV4dC52YWx1ZSA9IGtleTtcbiAgICAgICAgICBuZXh0LmRvbmUgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUbyBhdm9pZCBjcmVhdGluZyBhbiBhZGRpdGlvbmFsIG9iamVjdCwgd2UganVzdCBoYW5nIHRoZSAudmFsdWVcbiAgICAgIC8vIGFuZCAuZG9uZSBwcm9wZXJ0aWVzIG9mZiB0aGUgbmV4dCBmdW5jdGlvbiBvYmplY3QgaXRzZWxmLiBUaGlzXG4gICAgICAvLyBhbHNvIGVuc3VyZXMgdGhhdCB0aGUgbWluaWZpZXIgd2lsbCBub3QgYW5vbnltaXplIHRoZSBmdW5jdGlvbi5cbiAgICAgIG5leHQuZG9uZSA9IHRydWU7XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbHVlcyhpdGVyYWJsZSkge1xuICAgIGlmIChpdGVyYWJsZSkge1xuICAgICAgdmFyIGl0ZXJhdG9yTWV0aG9kID0gaXRlcmFibGVbaXRlcmF0b3JTeW1ib2xdO1xuICAgICAgaWYgKGl0ZXJhdG9yTWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvck1ldGhvZC5jYWxsKGl0ZXJhYmxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBpdGVyYWJsZS5uZXh0ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhYmxlO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWlzTmFOKGl0ZXJhYmxlLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbmV4dCA9IGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IGl0ZXJhYmxlLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZXJhYmxlLCBpKSkge1xuICAgICAgICAgICAgICBuZXh0LnZhbHVlID0gaXRlcmFibGVbaV07XG4gICAgICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBuZXh0LnZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICAgIG5leHQuZG9uZSA9IHRydWU7XG5cbiAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbmV4dC5uZXh0ID0gbmV4dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm4gYW4gaXRlcmF0b3Igd2l0aCBubyB2YWx1ZXMuXG4gICAgcmV0dXJuIHsgbmV4dDogZG9uZVJlc3VsdCB9O1xuICB9XG4gIGV4cG9ydHMudmFsdWVzID0gdmFsdWVzO1xuXG4gIGZ1bmN0aW9uIGRvbmVSZXN1bHQoKSB7XG4gICAgcmV0dXJuIHsgdmFsdWU6IHVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xuICB9XG5cbiAgQ29udGV4dC5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IENvbnRleHQsXG5cbiAgICByZXNldDogZnVuY3Rpb24oc2tpcFRlbXBSZXNldCkge1xuICAgICAgdGhpcy5wcmV2ID0gMDtcbiAgICAgIHRoaXMubmV4dCA9IDA7XG4gICAgICAvLyBSZXNldHRpbmcgY29udGV4dC5fc2VudCBmb3IgbGVnYWN5IHN1cHBvcnQgb2YgQmFiZWwnc1xuICAgICAgLy8gZnVuY3Rpb24uc2VudCBpbXBsZW1lbnRhdGlvbi5cbiAgICAgIHRoaXMuc2VudCA9IHRoaXMuX3NlbnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmRvbmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICB0aGlzLm1ldGhvZCA9IFwibmV4dFwiO1xuICAgICAgdGhpcy5hcmcgPSB1bmRlZmluZWQ7XG5cbiAgICAgIHRoaXMudHJ5RW50cmllcy5mb3JFYWNoKHJlc2V0VHJ5RW50cnkpO1xuXG4gICAgICBpZiAoIXNraXBUZW1wUmVzZXQpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzKSB7XG4gICAgICAgICAgLy8gTm90IHN1cmUgYWJvdXQgdGhlIG9wdGltYWwgb3JkZXIgb2YgdGhlc2UgY29uZGl0aW9uczpcbiAgICAgICAgICBpZiAobmFtZS5jaGFyQXQoMCkgPT09IFwidFwiICYmXG4gICAgICAgICAgICAgIGhhc093bi5jYWxsKHRoaXMsIG5hbWUpICYmXG4gICAgICAgICAgICAgICFpc05hTigrbmFtZS5zbGljZSgxKSkpIHtcbiAgICAgICAgICAgIHRoaXNbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5kb25lID0gdHJ1ZTtcblxuICAgICAgdmFyIHJvb3RFbnRyeSA9IHRoaXMudHJ5RW50cmllc1swXTtcbiAgICAgIHZhciByb290UmVjb3JkID0gcm9vdEVudHJ5LmNvbXBsZXRpb247XG4gICAgICBpZiAocm9vdFJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgdGhyb3cgcm9vdFJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnJ2YWw7XG4gICAgfSxcblxuICAgIGRpc3BhdGNoRXhjZXB0aW9uOiBmdW5jdGlvbihleGNlcHRpb24pIHtcbiAgICAgIGlmICh0aGlzLmRvbmUpIHtcbiAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgY29udGV4dCA9IHRoaXM7XG4gICAgICBmdW5jdGlvbiBoYW5kbGUobG9jLCBjYXVnaHQpIHtcbiAgICAgICAgcmVjb3JkLnR5cGUgPSBcInRocm93XCI7XG4gICAgICAgIHJlY29yZC5hcmcgPSBleGNlcHRpb247XG4gICAgICAgIGNvbnRleHQubmV4dCA9IGxvYztcblxuICAgICAgICBpZiAoY2F1Z2h0KSB7XG4gICAgICAgICAgLy8gSWYgdGhlIGRpc3BhdGNoZWQgZXhjZXB0aW9uIHdhcyBjYXVnaHQgYnkgYSBjYXRjaCBibG9jayxcbiAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgIGNvbnRleHQubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgY29udGV4dC5hcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gISEgY2F1Z2h0O1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gXCJyb290XCIpIHtcbiAgICAgICAgICAvLyBFeGNlcHRpb24gdGhyb3duIG91dHNpZGUgb2YgYW55IHRyeSBibG9jayB0aGF0IGNvdWxkIGhhbmRsZVxuICAgICAgICAgIC8vIGl0LCBzbyBzZXQgdGhlIGNvbXBsZXRpb24gdmFsdWUgb2YgdGhlIGVudGlyZSBmdW5jdGlvbiB0b1xuICAgICAgICAgIC8vIHRocm93IHRoZSBleGNlcHRpb24uXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZShcImVuZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2KSB7XG4gICAgICAgICAgdmFyIGhhc0NhdGNoID0gaGFzT3duLmNhbGwoZW50cnksIFwiY2F0Y2hMb2NcIik7XG4gICAgICAgICAgdmFyIGhhc0ZpbmFsbHkgPSBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpO1xuXG4gICAgICAgICAgaWYgKGhhc0NhdGNoICYmIGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5jYXRjaExvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmNhdGNoTG9jLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNDYXRjaCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNGaW5hbGx5KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlKGVudHJ5LmZpbmFsbHlMb2MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRyeSBzdGF0ZW1lbnQgd2l0aG91dCBjYXRjaCBvciBmaW5hbGx5XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBhYnJ1cHQ6IGZ1bmN0aW9uKHR5cGUsIGFyZykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPD0gdGhpcy5wcmV2ICYmXG4gICAgICAgICAgICBoYXNPd24uY2FsbChlbnRyeSwgXCJmaW5hbGx5TG9jXCIpICYmXG4gICAgICAgICAgICB0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgdmFyIGZpbmFsbHlFbnRyeSA9IGVudHJ5O1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChmaW5hbGx5RW50cnkgJiZcbiAgICAgICAgICAodHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgIHR5cGUgPT09IFwiY29udGludWVcIikgJiZcbiAgICAgICAgICBmaW5hbGx5RW50cnkudHJ5TG9jIDw9IGFyZyAmJlxuICAgICAgICAgIGFyZyA8PSBmaW5hbGx5RW50cnkuZmluYWxseUxvYykge1xuICAgICAgICAvLyBJZ25vcmUgdGhlIGZpbmFsbHkgZW50cnkgaWYgY29udHJvbCBpcyBub3QganVtcGluZyB0byBhXG4gICAgICAgIC8vIGxvY2F0aW9uIG91dHNpZGUgdGhlIHRyeS9jYXRjaCBibG9jay5cbiAgICAgICAgZmluYWxseUVudHJ5ID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlY29yZCA9IGZpbmFsbHlFbnRyeSA/IGZpbmFsbHlFbnRyeS5jb21wbGV0aW9uIDoge307XG4gICAgICByZWNvcmQudHlwZSA9IHR5cGU7XG4gICAgICByZWNvcmQuYXJnID0gYXJnO1xuXG4gICAgICBpZiAoZmluYWxseUVudHJ5KSB7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgIHRoaXMubmV4dCA9IGZpbmFsbHlFbnRyeS5maW5hbGx5TG9jO1xuICAgICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICB9LFxuXG4gICAgY29tcGxldGU6IGZ1bmN0aW9uKHJlY29yZCwgYWZ0ZXJMb2MpIHtcbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgIHRocm93IHJlY29yZC5hcmc7XG4gICAgICB9XG5cbiAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJicmVha1wiIHx8XG4gICAgICAgICAgcmVjb3JkLnR5cGUgPT09IFwiY29udGludWVcIikge1xuICAgICAgICB0aGlzLm5leHQgPSByZWNvcmQuYXJnO1xuICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJyZXR1cm5cIikge1xuICAgICAgICB0aGlzLnJ2YWwgPSB0aGlzLmFyZyA9IHJlY29yZC5hcmc7XG4gICAgICAgIHRoaXMubWV0aG9kID0gXCJyZXR1cm5cIjtcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHRoaXMuY29tcGxldGUoZW50cnkuY29tcGxldGlvbiwgZW50cnkuYWZ0ZXJMb2MpO1xuICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIFwiY2F0Y2hcIjogZnVuY3Rpb24odHJ5TG9jKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA9PT0gdHJ5TG9jKSB7XG4gICAgICAgICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb247XG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIHZhciB0aHJvd24gPSByZWNvcmQuYXJnO1xuICAgICAgICAgICAgcmVzZXRUcnlFbnRyeShlbnRyeSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aHJvd247XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGNvbnRleHQuY2F0Y2ggbWV0aG9kIG11c3Qgb25seSBiZSBjYWxsZWQgd2l0aCBhIGxvY2F0aW9uXG4gICAgICAvLyBhcmd1bWVudCB0aGF0IGNvcnJlc3BvbmRzIHRvIGEga25vd24gY2F0Y2ggYmxvY2suXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIGNhdGNoIGF0dGVtcHRcIik7XG4gICAgfSxcblxuICAgIGRlbGVnYXRlWWllbGQ6IGZ1bmN0aW9uKGl0ZXJhYmxlLCByZXN1bHROYW1lLCBuZXh0TG9jKSB7XG4gICAgICB0aGlzLmRlbGVnYXRlID0ge1xuICAgICAgICBpdGVyYXRvcjogdmFsdWVzKGl0ZXJhYmxlKSxcbiAgICAgICAgcmVzdWx0TmFtZTogcmVzdWx0TmFtZSxcbiAgICAgICAgbmV4dExvYzogbmV4dExvY1xuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMubWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAvLyBEZWxpYmVyYXRlbHkgZm9yZ2V0IHRoZSBsYXN0IHNlbnQgdmFsdWUgc28gdGhhdCB3ZSBkb24ndFxuICAgICAgICAvLyBhY2NpZGVudGFsbHkgcGFzcyBpdCBvbiB0byB0aGUgZGVsZWdhdGUuXG4gICAgICAgIHRoaXMuYXJnID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gQ29udGludWVTZW50aW5lbDtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoaXMgc2NyaXB0IGlzIGV4ZWN1dGluZyBhcyBhIENvbW1vbkpTIG1vZHVsZVxuICAvLyBvciBub3QsIHJldHVybiB0aGUgcnVudGltZSBvYmplY3Qgc28gdGhhdCB3ZSBjYW4gZGVjbGFyZSB0aGUgdmFyaWFibGVcbiAgLy8gcmVnZW5lcmF0b3JSdW50aW1lIGluIHRoZSBvdXRlciBzY29wZSwgd2hpY2ggYWxsb3dzIHRoaXMgbW9kdWxlIHRvIGJlXG4gIC8vIGluamVjdGVkIGVhc2lseSBieSBgYmluL3JlZ2VuZXJhdG9yIC0taW5jbHVkZS1ydW50aW1lIHNjcmlwdC5qc2AuXG4gIHJldHVybiBleHBvcnRzO1xuXG59KFxuICAvLyBJZiB0aGlzIHNjcmlwdCBpcyBleGVjdXRpbmcgYXMgYSBDb21tb25KUyBtb2R1bGUsIHVzZSBtb2R1bGUuZXhwb3J0c1xuICAvLyBhcyB0aGUgcmVnZW5lcmF0b3JSdW50aW1lIG5hbWVzcGFjZS4gT3RoZXJ3aXNlIGNyZWF0ZSBhIG5ldyBlbXB0eVxuICAvLyBvYmplY3QuIEVpdGhlciB3YXksIHRoZSByZXN1bHRpbmcgb2JqZWN0IHdpbGwgYmUgdXNlZCB0byBpbml0aWFsaXplXG4gIC8vIHRoZSByZWdlbmVyYXRvclJ1bnRpbWUgdmFyaWFibGUgYXQgdGhlIHRvcCBvZiB0aGlzIGZpbGUuXG4gIHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIgPyBtb2R1bGUuZXhwb3J0cyA6IHt9XG4pKTtcblxudHJ5IHtcbiAgcmVnZW5lcmF0b3JSdW50aW1lID0gcnVudGltZTtcbn0gY2F0Y2ggKGFjY2lkZW50YWxTdHJpY3RNb2RlKSB7XG4gIC8vIFRoaXMgbW9kdWxlIHNob3VsZCBub3QgYmUgcnVubmluZyBpbiBzdHJpY3QgbW9kZSwgc28gdGhlIGFib3ZlXG4gIC8vIGFzc2lnbm1lbnQgc2hvdWxkIGFsd2F5cyB3b3JrIHVubGVzcyBzb21ldGhpbmcgaXMgbWlzY29uZmlndXJlZC4gSnVzdFxuICAvLyBpbiBjYXNlIHJ1bnRpbWUuanMgYWNjaWRlbnRhbGx5IHJ1bnMgaW4gc3RyaWN0IG1vZGUsIHdlIGNhbiBlc2NhcGVcbiAgLy8gc3RyaWN0IG1vZGUgdXNpbmcgYSBnbG9iYWwgRnVuY3Rpb24gY2FsbC4gVGhpcyBjb3VsZCBjb25jZWl2YWJseSBmYWlsXG4gIC8vIGlmIGEgQ29udGVudCBTZWN1cml0eSBQb2xpY3kgZm9yYmlkcyB1c2luZyBGdW5jdGlvbiwgYnV0IGluIHRoYXQgY2FzZVxuICAvLyB0aGUgcHJvcGVyIHNvbHV0aW9uIGlzIHRvIGZpeCB0aGUgYWNjaWRlbnRhbCBzdHJpY3QgbW9kZSBwcm9ibGVtLiBJZlxuICAvLyB5b3UndmUgbWlzY29uZmlndXJlZCB5b3VyIGJ1bmRsZXIgdG8gZm9yY2Ugc3RyaWN0IG1vZGUgYW5kIGFwcGxpZWQgYVxuICAvLyBDU1AgdG8gZm9yYmlkIEZ1bmN0aW9uLCBhbmQgeW91J3JlIG5vdCB3aWxsaW5nIHRvIGZpeCBlaXRoZXIgb2YgdGhvc2VcbiAgLy8gcHJvYmxlbXMsIHBsZWFzZSBkZXRhaWwgeW91ciB1bmlxdWUgcHJlZGljYW1lbnQgaW4gYSBHaXRIdWIgaXNzdWUuXG4gIEZ1bmN0aW9uKFwiclwiLCBcInJlZ2VuZXJhdG9yUnVudGltZSA9IHJcIikocnVudGltZSk7XG59XG4iLCJpbXBvcnQgRmlsZU9wcyBmcm9tIFwiLi9tb2R1bGVzL0ZpbGVPcHMuanNcIjtcclxuaW1wb3J0IEF1dGhlbnRpY2F0ZSBmcm9tIFwiLi9tb2R1bGVzL0F1dGhlbnRpY2F0ZS5qc1wiO1xyXG5pbXBvcnQgTWVudSBmcm9tIFwiLi9tb2R1bGVzL01lbnUuanNcIjtcclxuaW1wb3J0IFF1ZXN0aW9uUGFuZSBmcm9tIFwiLi9tb2R1bGVzL1F1ZXN0aW9uUGFuZS5qc1wiO1xyXG5pbXBvcnQgRWRpdG9yUGFuZSBmcm9tIFwiLi9tb2R1bGVzL0VkaXRvclBhbmUuanNcIjtcclxuaW1wb3J0IE1vZGVsIGZyb20gXCIuL21vZHVsZXMvTW9kZWxcIjtcclxuY29uc3QgTmlkZ2V0ID0gcmVxdWlyZShcIkB0aGFlcmlvdXMvbmlkZ2V0XCIpXHJcblxyXG5pbXBvcnQgXCIuL21vZHVsZXMvR2FtZUJvYXJkLmpzXCI7XHJcbmltcG9ydCBcIi4vbW9kdWxlcy9NdWx0aXBsZUNob2ljZVBhbmUuanNcIjtcclxuaW1wb3J0IFwiLi9tb2R1bGVzL0NoZWNrQm94LmpzXCI7XHJcblxyXG5sZXQgZmlsZU9wcyA9IG5ldyBGaWxlT3BzKCk7XHJcbmxldCBtb2RlbCA9IG51bGw7XHJcbmxldCBxdWVzdGlvblBhbmUgPSBudWxsO1xyXG5sZXQgZWRpdG9yUGFuZSA9IG51bGw7XHJcblxyXG53aW5kb3cub25sb2FkID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgc2V0dXAoKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gc2V0dXAoKXtcclxuICAgIGxldCBzdGFydCA9IG5ldyBEYXRlKCk7XHJcblxyXG4gICAgcGFyc2VVUkxQYXJhbWV0ZXJzKCk7XHJcbiAgICBuZXcgTWVudSgpLmluaXQoXCIjbWVudVwiKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IG5ldyBBdXRoZW50aWNhdGUoKS5sb2FkQ2xpZW50KCk7XHJcbiAgICAgICAgYXdhaXQgZmlsZU9wcy5sb2FkQ2xpZW50KCk7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBmaWxlID0gYXdhaXQgZmlsZU9wcy5nZXQod2luZG93LnBhcmFtZXRlcnMuZmlsZUlkKTtcclxuICAgIGxldCBtb2RlbCA9IG5ldyBNb2RlbChmaWxlT3BzKS5zZXQoSlNPTi5wYXJzZShmaWxlLmJvZHkpKTtcclxuICAgIHdpbmRvdy5tb2RlbCA9IG1vZGVsO1xyXG5cclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1uYW1lXCIpLnRleHRDb250ZW50ID0gbW9kZWwubmFtZTtcclxuICAgIGVkaXRvclBhbmUgPSBuZXcgRWRpdG9yUGFuZShtb2RlbCwgZmlsZU9wcywgd2luZG93LnBhcmFtZXRlcnMuZmlsZUlkKTtcclxuICAgIGVkaXRvclBhbmUub25TYXZlID0gc2F2ZU1vZGVsO1xyXG5cclxuICAgIGxldCBlbmQgPSBuZXcgRGF0ZSgpO1xyXG4gICAgbGV0IHRpbWUgPSBlbmQgLSBzdGFydDtcclxuICAgIGNvbnNvbGUubG9nKFwiTG9hZCBUaW1lIFwiICsgdGltZSArIFwiIG1zXCIpO1xyXG59XHJcblxyXG4vKipcclxuICogU2F2ZSB0aGUgbW9kZWwgdG8gdGhlIGdvb2dsZSBhcHAgZGF0YSBmb2xkZXIuXHJcbiAqL1xyXG5mdW5jdGlvbiBzYXZlTW9kZWwoKSB7XHJcbiAgICBmaWxlT3BzLnNldEJvZHkod2luZG93LnBhcmFtZXRlcnMuZmlsZUlkLCBKU09OLnN0cmluZ2lmeSh3aW5kb3cubW9kZWwuZ2V0KCksIG51bGwsIDIpKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENoYW5nZSB0aGUgbmFtZSBvZiB0aGUgZmlsZSBpbiBnb29nbGUncyBhcHAgZGF0YSBmb2xkZXIuXHJcbiAqL1xyXG5mdW5jdGlvbiByZW5hbWVNb2RlbCgpIHtcclxuICAgIGxldCBuYW1lID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNnYW1lLW5hbWVcIikudGV4dENvbnRlbnQ7XHJcbiAgICBmaWxlT3BzLnJlbmFtZSh3aW5kb3cucGFyYW1ldGVycy5maWxlSWQsIG5hbWUgKyBcIi5qc29uXCIpO1xyXG4gICAgd2luZG93Lm1vZGVsLm5hbWUgPSBuYW1lO1xyXG4gICAgc2F2ZU1vZGVsKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFeHRyYWN0IHZhbHVlIGZyb20gdGhlIFVSTCBzdHJpbmcsIHN0b3JlIGluICd3aW5kb3cucGFyYW1ldGVycycuXHJcbiAqL1xyXG5mdW5jdGlvbiBwYXJzZVVSTFBhcmFtZXRlcnMoKSB7XHJcbiAgICB3aW5kb3cucGFyYW1ldGVycyA9IHt9O1xyXG4gICAgY29uc3QgcGFyYW1ldGVycyA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpLnNwbGl0KFwiJlwiKTtcclxuICAgIGZvciAoY29uc3QgcGFyYW1ldGVyIG9mIHBhcmFtZXRlcnMpIHtcclxuICAgICAgICBjb25zdCBzcGxpdCA9IHBhcmFtZXRlci5zcGxpdCgvPS8pO1xyXG4gICAgICAgIHdpbmRvdy5wYXJhbWV0ZXJzW3NwbGl0WzBdXSA9IHNwbGl0WzFdID8/IFwiXCI7XHJcbiAgICB9XHJcbn0iLCIvLyBzZWUgaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vZHJpdmUvYXBpL3YzL3F1aWNrc3RhcnQvanM/aGw9ZW5cclxuXHJcbmNsYXNzIEF1dGhlbnRpY2F0ZSB7XHJcbiAgICBjb25zdHJ1Y3Rvcigpe1xyXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgcmVxdWlyZShcIi4vZ29vZ2xlRmllbGRzLmpzXCIpKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkQ2xpZW50KCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGdhcGkubG9hZCgnY2xpZW50OmF1dGgyJywgKCkgPT4gdGhpcy5fX2luaXRDbGllbnQocmVzb2x2ZSwgcmVqZWN0KSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgX19pbml0Q2xpZW50KHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGdhcGkuY2xpZW50LmluaXQoe1xyXG4gICAgICAgICAgICBhcGlLZXk6IHRoaXMuZGV2ZWxvcGVyS2V5LFxyXG4gICAgICAgICAgICBjbGllbnRJZDogdGhpcy5jbGllbnRJZCxcclxuICAgICAgICAgICAgZGlzY292ZXJ5RG9jczogdGhpcy5kaXNjb3ZlcnlEb2NzLFxyXG4gICAgICAgICAgICBzY29wZTogdGhpcy5zY29wZVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xyXG4gICAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFUlJPUiBJTklUXCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNBdXRob3JpemVkKCl7XHJcbiAgICAgICAgdmFyIHVzZXIgPSBnYXBpLmF1dGgyLmdldEF1dGhJbnN0YW5jZSgpLmN1cnJlbnRVc2VyLmdldCgpO1xyXG4gICAgICAgIHJldHVybiB1c2VyLmhhc0dyYW50ZWRTY29wZXModGhpcy5zY29wZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2lnbkluKCl7XHJcbiAgICAgICAgZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKS5zaWduSW4oKTtcclxuICAgIH1cclxuXHJcbiAgICBzaWduT3V0KCl7XHJcbiAgICAgICAgZ2FwaS5hdXRoMi5nZXRBdXRoSW5zdGFuY2UoKS5zaWduT3V0KCk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEF1dGhlbnRpY2F0ZTsiLCJjb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcblxyXG5jbGFzcyBWYWx1ZVVwYWRhdGUgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3Rvcih2YWx1ZSkge1xyXG4gICAgICAgIHN1cGVyKCd2YWx1ZS11cGRhdGUnLFxyXG4gICAgICAgICAgICB7ZGV0YWlsIDoge3ZhbHVlIDogdmFsdWV9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIENoZWNrQm94IGV4dGVuZHMgTmlkZ2V0RWxlbWVudCB7XHJcbiAgICBhc3luYyBjb25uZWN0ZWRDYWxsYmFjaygpe1xyXG4gICAgICAgIHN1cGVyLmNvbm5lY3RlZENhbGxiYWNrKCk7XHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy50b2dnbGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB0b2dnbGUoKXtcclxuICAgICAgICBpZiAodGhpcy5jaGVja2VkID09PSAndHJ1ZScpIHRoaXMuY2hlY2tlZCA9ICdmYWxzZSc7XHJcbiAgICAgICAgZWxzZSB0aGlzLmNoZWNrZWQgPSAndHJ1ZSdcclxuICAgIH1cclxuXHJcbiAgICBnZXQgY2hlY2tlZCgpe1xyXG4gICAgICAgIGlmICghdGhpcy5oYXNBdHRyaWJ1dGUoQ2hlY2tCb3guQ0hFQ0tFRF9BVFRSSUJVVEUpKXtcclxuICAgICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUoQ2hlY2tCb3guQ0hFQ0tFRF9BVFRSSUJVVEUsICdmYWxzZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoQ2hlY2tCb3guQ0hFQ0tFRF9BVFRSSUJVVEUpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBjaGVja2VkKHZhbHVlKXtcclxuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShDaGVja0JveC5DSEVDS0VEX0FUVFJJQlVURSwgdmFsdWUpO1xyXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgVmFsdWVVcGFkYXRlKHZhbHVlKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkNoZWNrQm94LkNIRUNLRURfQVRUUklCVVRFID0gXCJjaGVja2VkXCI7XHJcbndpbmRvdy5jdXN0b21FbGVtZW50cy5kZWZpbmUoJ2NoZWNrLWJveCcsIENoZWNrQm94KTtcclxubW9kdWxlLmV4cG9ydHMgPSBDaGVja0JveDsiLCJpbXBvcnQgTW9kZWwgZnJvbSBcIi4vTW9kZWwuanNcIjtcclxuY29uc3QgRE9NID0gey8qIHNlZSBFZGl0b3JQYW5lLmNvbnN0cnVjdG9yICovfTtcclxuXHJcbmNsYXNzIE1DQW5zd2VyQ3RybCB7XHJcbiAgICBzdGF0aWMgcnVuKG1vZGVsLCBzYXZlQ0IpIHtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwubW9kZWwgID0gbW9kZWw7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLnNhdmVDQiA9IHNhdmVDQjtcclxuXHJcbiAgICAgICAgRE9NLm1lbnVEZWNyZWFzZVZhbHVlLmhpZGUoKTtcclxuICAgICAgICBET00ubWVudUluY3JlYXNlVmFsdWUuaGlkZSgpO1xyXG5cclxuICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLnNob3coKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5zZXRUZXh0KGksIG1vZGVsLmFuc3dlcnNbaV0udGV4dCk7XHJcbiAgICAgICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUuc2V0Q2hlY2tlZChpLCBtb2RlbC5hbnN3ZXJzW2ldLmlzVHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNBbnN3ZXJDdHJsLmNsZWFudXApO1xyXG4gICAgICAgIERPTS50cmlhbmdsZUxlZnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIE1DQW5zd2VyQ3RybC5jbGVhbnVwKTtcclxuICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLmFkZEV2ZW50TGlzdGVuZXIoXCJ0ZXh0LXVwZGF0ZVwiLCBNQ0Fuc3dlckN0cmwudGV4dExpc3QpO1xyXG4gICAgICAgIERPTS5tdWx0aXBsZUNob2ljZVBhbmUuYWRkRXZlbnRMaXN0ZW5lcihcInZhbHVlLXVwZGF0ZVwiLCBNQ0Fuc3dlckN0cmwudmFsdWVMaXN0KTtcclxuICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLmFkZEV2ZW50TGlzdGVuZXIoXCJidXR0b24tcXVlc3Rpb25cIiwgTUNBbnN3ZXJDdHJsLnF1ZXN0TGlzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHRleHRMaXN0KGV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gcGFyc2VJbnQoZXZlbnQuZGV0YWlsLmluZGV4KTtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwubW9kZWwuYW5zd2Vyc1tpbmRleF0udGV4dCA9IGV2ZW50LmRldGFpbC50ZXh0O1xyXG4gICAgICAgIE1DQW5zd2VyQ3RybC5zYXZlQ0IoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgdmFsdWVMaXN0KGV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gcGFyc2VJbnQoZXZlbnQuZGV0YWlsLmluZGV4KTtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwubW9kZWwuYW5zd2Vyc1tpbmRleF0uaXNUcnVlID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xyXG4gICAgICAgIE1DQW5zd2VyQ3RybC5zYXZlQ0IoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgcXVlc3RMaXN0KGV2ZW50KSB7XHJcbiAgICAgICAgTUNBbnN3ZXJDdHJsLnNhdmVDQigpO1xyXG4gICAgICAgIE1DQW5zd2VyQ3RybC5jbGVhbnVwKCk7XHJcbiAgICAgICAgTUNRdWVzdGlvbkN0cmwucnVuKE1DQW5zd2VyQ3RybC5tb2RlbCwgTUNBbnN3ZXJDdHJsLnNhdmVDQik7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNsZWFudXAoKSB7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5oaWRlKCk7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwidGV4dC11cGRhdGVcIiwgTUNBbnN3ZXJDdHJsLnRleHRMaXN0KTtcclxuICAgICAgICBET00ubXVsdGlwbGVDaG9pY2VQYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ2YWx1ZS11cGRhdGVcIiwgTUNBbnN3ZXJDdHJsLnZhbHVlTGlzdCk7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiYnV0dG9uLXF1ZXN0aW9uXCIsIE1DQW5zd2VyQ3RybC5xdWVzdExpc3QpO1xyXG4gICAgICAgIERPTS50cmlhbmdsZVJpZ2h0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBNQ0Fuc3dlckN0cmwuY2xlYW51cCk7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlTGVmdC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgTUNBbnN3ZXJDdHJsLmNsZWFudXApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBNQ1F1ZXN0aW9uQ3RybCB7XHJcbiAgICBzdGF0aWMgcnVuKG1vZGVsLCBzYXZlQ0IpIHtcclxuICAgICAgICBNQ1F1ZXN0aW9uQ3RybC5tb2RlbCAgPSBtb2RlbDtcclxuICAgICAgICBNQ1F1ZXN0aW9uQ3RybC5zYXZlQ0IgPSBzYXZlQ0I7XHJcblxyXG4gICAgICAgIERPTS5tZW51RGVjcmVhc2VWYWx1ZS5oaWRlKCk7XHJcbiAgICAgICAgRE9NLm1lbnVJbmNyZWFzZVZhbHVlLmhpZGUoKTtcclxuXHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5zZXRUZXh0KG1vZGVsLnF1ZXN0aW9uKTtcclxuICAgICAgICBET00uZ2FtZUJvYXJkLmhpZGUoKTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnNob3coKTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmJvYXJkQnV0dG9uID0gZmFsc2U7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5oaWdobGlnaHQoJ3F1ZXN0aW9uJyk7XHJcblxyXG4gICAgICAgIERPTS50cmlhbmdsZVJpZ2h0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBNQ1F1ZXN0aW9uQ3RybC5jbGVhbnVwKTtcclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBNQ1F1ZXN0aW9uQ3RybC5jbGVhbnVwKTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmFkZEV2ZW50TGlzdGVuZXIoXCJ0ZXh0LXVwZGF0ZVwiLCBNQ1F1ZXN0aW9uQ3RybC50ZXh0TGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5hZGRFdmVudExpc3RlbmVyKFwiYnV0dG9uLWFuc3dlclwiLCBNQ1F1ZXN0aW9uQ3RybC5hbnN3ZXJMaXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgdGV4dExpc3QoZXZlbnQpIHtcclxuICAgICAgICBNQ1F1ZXN0aW9uQ3RybC5tb2RlbC5xdWVzdGlvbiA9IGV2ZW50LmRldGFpbC50ZXh0O1xyXG4gICAgICAgIE1DUXVlc3Rpb25DdHJsLnNhdmVDQigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhbnN3ZXJMaXN0KCkge1xyXG4gICAgICAgIE1DUXVlc3Rpb25DdHJsLmNsZWFudXAoKTtcclxuICAgICAgICBNQ0Fuc3dlckN0cmwucnVuKE1DUXVlc3Rpb25DdHJsLm1vZGVsLCBNQ1F1ZXN0aW9uQ3RybC5zYXZlQ0IpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjbGVhbnVwKCkge1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRleHQtdXBkYXRlXCIsIE1DUXVlc3Rpb25DdHJsLnRleHRMaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJidXR0b24tYW5zd2VyXCIsIE1DUXVlc3Rpb25DdHJsLmFuc3dlckxpc3QpO1xyXG4gICAgICAgIERPTS50cmlhbmdsZVJpZ2h0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBNQ1F1ZXN0aW9uQ3RybC5jbGVhbnVwKTtcclxuICAgICAgICBET00udHJpYW5nbGVMZWZ0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBNQ1F1ZXN0aW9uQ3RybC5jbGVhbnVwKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUXVlc3Rpb25QYW5lQ3RybCB7XHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSBtb2RlbCAtIHRoZSBxdWVzdGlvbiBtb2RlbCBvYmplY3RcclxuICAgICAqIEBwYXJhbSBmaWVsZCAtIHdoaWNoIG1vZGVsIGZpZWxkIHRvIHJlYWQvd3JpdGUgZnJvbSB7J2EnLCAncSd9XHJcbiAgICAgKiBAcGFyYW0gc2F2ZUNCIC0gY2FsbCB0aGlzIG1ldGhvZCB0byBzYXZlIHRoZSBtb2RlbFxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgcnVuKGZpZWxkLCBtb2RlbCwgc2F2ZUNCLCBjbG9zZUNCKSB7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5tb2RlbCAgID0gbW9kZWwgPz8gUXVlc3Rpb25QYW5lQ3RybC5tb2RlbDtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLmZpZWxkICAgPSBmaWVsZCA/PyBRdWVzdGlvblBhbmVDdHJsLmZpZWxkO1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwuc2F2ZUNCICA9IHNhdmVDQiA/PyBRdWVzdGlvblBhbmVDdHJsLnNhdmVDQjtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLmNsb3NlQ0IgPSBjbG9zZUNCID8/IFF1ZXN0aW9uUGFuZUN0cmwuY2xvc2VDQjtcclxuXHJcbiAgICAgICAgRE9NLm1lbnVEZWNyZWFzZVZhbHVlLnNob3coKTtcclxuICAgICAgICBET00ubWVudUluY3JlYXNlVmFsdWUuc2hvdygpO1xyXG5cclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnNldFRleHQoUXVlc3Rpb25QYW5lQ3RybC5tb2RlbFtRdWVzdGlvblBhbmVDdHJsLmZpZWxkLnN1YnN0cigwLCAxKV0pO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuYm9hcmRCdXR0b24gPSB0cnVlO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuc2hvdygpO1xyXG4gICAgICAgIERPTS5nYW1lQm9hcmQuaGlkZSgpO1xyXG5cclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmFkZEV2ZW50TGlzdGVuZXIoXCJ0ZXh0LXVwZGF0ZVwiLCBRdWVzdGlvblBhbmVDdHJsLnRleHRMaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLmFkZEV2ZW50TGlzdGVuZXIoXCJidXR0b24tYm9hcmRcIiwgUXVlc3Rpb25QYW5lQ3RybC5ib2FyZExpc3QpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuYWRkRXZlbnRMaXN0ZW5lcihgYnV0dG9uLXF1ZXN0aW9uYCwgUXVlc3Rpb25QYW5lQ3RybC5xdWVzdGlvbkxpc3QpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUuYWRkRXZlbnRMaXN0ZW5lcihgYnV0dG9uLWFuc3dlcmAsIFF1ZXN0aW9uUGFuZUN0cmwuYW5zd2VyTGlzdCk7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5oaWdobGlnaHQoUXVlc3Rpb25QYW5lQ3RybC5maWVsZCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHRleHRMaXN0KGV2ZW50KSB7XHJcbiAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5tb2RlbFtRdWVzdGlvblBhbmVDdHJsLmZpZWxkLnN1YnN0cigwLCAxKV0gPSBldmVudC5kZXRhaWwudGV4dDtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLnNhdmVDQigpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBib2FyZExpc3QoZXZlbnQpIHtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLmNsZWFudXAoKTtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLmNsb3NlQ0IoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYW5zd2VyTGlzdChldmVudCkge1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwuY2xlYW51cCgpO1xyXG4gICAgICAgIFF1ZXN0aW9uUGFuZUN0cmwucnVuKCdhbnN3ZXInKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgcXVlc3Rpb25MaXN0KHZlbnQpIHtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLmNsZWFudXAoKTtcclxuICAgICAgICBRdWVzdGlvblBhbmVDdHJsLnJ1bigncXVlc3Rpb24nKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgY2xlYW51cCgpIHtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0ZXh0LXVwZGF0ZVwiLCBRdWVzdGlvblBhbmVDdHJsLnRleHRMaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJidXR0b24tYm9hcmRcIiwgUXVlc3Rpb25QYW5lQ3RybC5ib2FyZExpc3QpO1xyXG4gICAgICAgIERPTS5xdWVzdGlvblBhbmUucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJ1dHRvbi1hbnN3ZXJcIiwgUXVlc3Rpb25QYW5lQ3RybC5hbnN3ZXJMaXN0KTtcclxuICAgICAgICBET00ucXVlc3Rpb25QYW5lLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJidXR0b24tcXVlc3Rpb25cIiwgUXVlc3Rpb25QYW5lQ3RybC5xdWVzdGlvbkxpc3QpO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBFZGl0b3JQYW5lIHtcclxuICAgIGNvbnN0cnVjdG9yKG1vZGVsLCBmaWxlT3BzLCBmaWxlSWQpIHtcclxuICAgICAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcbiAgICAgICAgdGhpcy5maWxlT3BzID0gZmlsZU9wcztcclxuICAgICAgICB0aGlzLmZpbGVJZCA9IGZpbGVJZDtcclxuXHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbXVsdGlwbGUtY2hvaWNlLXBhbmVcIik7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlUmlnaHQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RyaWFuZ2xlLXJpZ2h0XCIpO1xyXG4gICAgICAgIERPTS50cmlhbmdsZUxlZnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RyaWFuZ2xlLWxlZnRcIik7XHJcbiAgICAgICAgRE9NLnJvdW5kTGFiZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JvdW5kLW51bWJlciA+IC50ZXh0XCIpO1xyXG4gICAgICAgIERPTS5nYW1lTmFtZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZ2FtZS1uYW1lXCIpO1xyXG4gICAgICAgIERPTS5nYW1lQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2dhbWUtYm9hcmRcIik7XHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcXVlc3Rpb24tcGFuZVwiKVxyXG4gICAgICAgIERPTS5tZW51SW5jcmVhc2VWYWx1ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS12YWx1ZS1wbHVzXCIpXHJcbiAgICAgICAgRE9NLm1lbnVEZWNyZWFzZVZhbHVlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LXZhbHVlLW1pbnVzXCIpXHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1kb3dubG9hZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHRoaXMubW9kZWwuZ2FtZU1vZGVsLCBudWxsLCAyKTtcclxuICAgICAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtqc29uXSwge3R5cGU6IFwiYXBwbGljYXRpb24vanNvblwifSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xyXG4gICAgICAgICAgICBjb25zdCBhbmNob3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Rvd25sb2FkLWFuY2hvclwiKTtcclxuICAgICAgICAgICAgYW5jaG9yLmhyZWYgPSB1cmw7XHJcbiAgICAgICAgICAgIGFuY2hvci5kb3dubG9hZCA9IHRoaXMubW9kZWwubmFtZTtcclxuICAgICAgICAgICAgYW5jaG9yLmNsaWNrKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1tb3ZlLXJpZ2h0XCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICBpZiAodGhpcy5tb2RlbC5jdXJyZW50Um91bmQgPj0gdGhpcy5tb2RlbC5yb3VuZENvdW50IC0gMSkgcmV0dXJuO1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLnNldFJvdW5kSW5kZXgodGhpcy5tb2RlbC5jdXJyZW50Um91bmQsIHRoaXMubW9kZWwuY3VycmVudFJvdW5kICsgMSk7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuaW5jcmVtZW50Um91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1tb3ZlLWxlZnRcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT57XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1vZGVsLmN1cnJlbnRSb3VuZCA8PSAwKSByZXR1cm47XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuc2V0Um91bmRJbmRleCh0aGlzLm1vZGVsLmN1cnJlbnRSb3VuZCwgdGhpcy5tb2RlbC5jdXJyZW50Um91bmQgLSAxKTtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5kZWNyZW1lbnRSb3VuZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICAgICAgdGhpcy5vblNhdmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW51LXJlbW92ZS1yb3VuZFwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLnJlbW92ZVJvdW5kKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVHJpYW5nbGVWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtaG9tZS1zY3JlZW5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IFwiaG9zdC5lanNcIjtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgRE9NLm1lbnVJbmNyZWFzZVZhbHVlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuaW5jcmVhc2VWYWx1ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgRE9NLm1lbnVEZWNyZWFzZVZhbHVlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuZGVjcmVhc2VWYWx1ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlUmlnaHQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5pbmNyZW1lbnRSb3VuZCgpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlTGVmdC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmRlY3JlbWVudFJvdW5kKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBET00uZ2FtZU5hbWUuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGFzeW5jIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDEzKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmZvY3VzKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5uYW1lID0gRE9NLmdhbWVOYW1lLmlubmVyVGV4dDtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuZmlsZU9wcy5yZW5hbWUodGhpcy5maWxlSWQsIHRoaXMubW9kZWwubmFtZSArIFwiLmpzb25cIik7XHJcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVudS1hZGQtY2F0ZWdvcnlcIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb2RlbC5hZGRDYXRlZ29yeVJvdW5kKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLm9uU2F2ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbnUtYWRkLW11bHRpcGxlLWNob2ljZVwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm1vZGVsLmFkZE11bHRpcGxlQ2hvaWNlUm91bmQoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGdhbWUtYm9hcmQgY2hhbmdlIGNhdGVnb3J5IHRleHRcclxuICAgICAgICBET00uZ2FtZUJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJoZWFkZXItdXBkYXRlXCIsIGV2ZW50ID0+IHtcclxuICAgICAgICAgICAgbGV0IGNvbCA9IGV2ZW50LmRldGFpbC5jb2w7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuZ2V0Q29sdW1uKGNvbCkuY2F0ZWdvcnkgPSBldmVudC5kZXRhaWwudmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMubW9kZWwuZ2V0Q29sdW1uKGNvbCkuZm9udFNpemUgPSBldmVudC5kZXRhaWwuZm9udFNpemU7XHJcbiAgICAgICAgICAgIHRoaXMub25TYXZlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIGdhbWUtYm9hcmQgc2VsZWN0IGNlbGxcclxuICAgICAgICBET00uZ2FtZUJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJjZWxsLXNlbGVjdFwiLCBldmVudCA9PiB7XHJcbiAgICAgICAgICAgIGxldCByb3cgPSBldmVudC5kZXRhaWwucm93O1xyXG4gICAgICAgICAgICBsZXQgY29sID0gZXZlbnQuZGV0YWlsLmNvbDtcclxuICAgICAgICAgICAgdGhpcy5oaWRlTmF2aWdhdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgUXVlc3Rpb25QYW5lQ3RybC5ydW4oXHJcbiAgICAgICAgICAgICAgICAncXVlc3Rpb24nLFxyXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RlbC5nZXRDZWxsKHJvdywgY29sKSxcclxuICAgICAgICAgICAgICAgICgpID0+IHRoaXMub25TYXZlKCksXHJcbiAgICAgICAgICAgICAgICAoKSA9PiB0aGlzLnVwZGF0ZVZpZXcoKVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcclxuICAgIH1cclxuXHJcbiAgICBvblNhdmUoKSB7XHJcbiAgICAgICAgdGhpcy5maWxlT3BzLnNldEJvZHkodGhpcy5maWxlSWQsIHRoaXMubW9kZWwpO1xyXG4gICAgfVxyXG5cclxuICAgIGhpZGVOYXZpZ2F0aW9uKCkge1xyXG4gICAgICAgIERPTS50cmlhbmdsZUxlZnQuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICBET00udHJpYW5nbGVSaWdodC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVZpZXcobW9kZWwpIHtcclxuICAgICAgICBtb2RlbCA9IG1vZGVsID8/IHRoaXMubW9kZWw7XHJcbiAgICAgICAgdGhpcy51cGRhdGVUcmlhbmdsZVZpZXcoKTtcclxuXHJcbiAgICAgICAgRE9NLnF1ZXN0aW9uUGFuZS5oaWRlKCk7XHJcbiAgICAgICAgRE9NLmdhbWVCb2FyZC5oaWRlKCk7XHJcbiAgICAgICAgRE9NLm11bHRpcGxlQ2hvaWNlUGFuZS5oaWRlKCk7XHJcblxyXG4gICAgICAgIGlmIChtb2RlbC5nZXRSb3VuZCgpLnR5cGUgPT09IE1vZGVsLnF1ZXN0aW9uVHlwZS5DQVRFR09SWSkgdGhpcy5jYXRlZ29yeVZpZXcobW9kZWwpO1xyXG4gICAgICAgIGlmIChtb2RlbC5nZXRSb3VuZCgpLnR5cGUgPT09IE1vZGVsLnF1ZXN0aW9uVHlwZS5NVUxUSVBMRV9DSE9JQ0UpIHRoaXMubXVsdGlwbGVDaG9pY2VWaWV3KG1vZGVsKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVUcmlhbmdsZVZpZXcoKSB7XHJcbiAgICAgICAgRE9NLnRyaWFuZ2xlTGVmdC5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIERPTS50cmlhbmdsZVJpZ2h0LmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuY3VycmVudFJvdW5kID09PSAwKSBET00udHJpYW5nbGVMZWZ0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgaWYgKHRoaXMubW9kZWwuY3VycmVudFJvdW5kID49IHRoaXMubW9kZWwucm91bmRDb3VudCAtIDEpIERPTS50cmlhbmdsZVJpZ2h0LmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgRE9NLnJvdW5kTGFiZWwudGV4dENvbnRlbnQgPSBcIlJvdW5kIFwiICsgKHRoaXMubW9kZWwuY3VycmVudFJvdW5kICsgMSk7XHJcbiAgICB9XHJcblxyXG4gICAgbXVsdGlwbGVDaG9pY2VWaWV3KG1vZGVsKSB7XHJcbiAgICAgICAgTUNRdWVzdGlvbkN0cmwucnVuKHRoaXMubW9kZWwuZ2V0Um91bmQoKSwgKCkgPT4gdGhpcy5vblNhdmUoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgY2F0ZWdvcnlWaWV3KG1vZGVsKSB7XHJcbiAgICAgICAgRE9NLm1lbnVEZWNyZWFzZVZhbHVlLnNob3coKTtcclxuICAgICAgICBET00ubWVudUluY3JlYXNlVmFsdWUuc2hvdygpO1xyXG4gICAgICAgIERPTS5nYW1lQm9hcmQuc2hvdygpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBjb2wgPSAwOyBjb2wgPCA2OyBjb2wrKykge1xyXG4gICAgICAgICAgICBsZXQgY29sdW1uID0gbW9kZWwuZ2V0Q29sdW1uKGNvbCk7XHJcblxyXG4gICAgICAgICAgICBET00uZ2FtZUJvYXJkLmdldEhlYWRlcihjb2wpLmZpdFRleHQubG9jayA9IFwidmhcIjtcclxuICAgICAgICAgICAgRE9NLmdhbWVCb2FyZC5zZXRIZWFkZXIoY29sLCBjb2x1bW4uY2F0ZWdvcnksIGNvbHVtbi5mb250U2l6ZSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCA1OyByb3crKykge1xyXG4gICAgICAgICAgICAgICAgRE9NLmdhbWVCb2FyZC5zZXRDZWxsKHJvdywgY29sLCBjb2x1bW4uY2VsbFtyb3ddLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGlmIChjb2x1bW4uY2VsbFtyb3ddLnEgPT09IFwiXCIpIERPTS5nYW1lQm9hcmQuc2V0Q29tcGxldGUocm93LCBjb2wsIFwiZmFsc2VcIik7XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChjb2x1bW4uY2VsbFtyb3ddLmEgPT09IFwiXCIpIERPTS5nYW1lQm9hcmQuc2V0Q29tcGxldGUocm93LCBjb2wsIFwicGFydGlhbFwiKTtcclxuICAgICAgICAgICAgICAgIGVsc2UgRE9NLmdhbWVCb2FyZC5zZXRDb21wbGV0ZShyb3csIGNvbCwgXCJ0cnVlXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRvclBhbmU7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbi8vIHNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9kcml2ZS9hcGkvdjMvcXVpY2tzdGFydC9qcz9obD1lblxyXG5cclxuY2xhc3MgRmlsZU9wcyB7XHJcblxyXG4gICAgYXN5bmMgbG9hZCgpe1xyXG4gICAgICAgIGF3YWl0IHRoaXMubG9hZENsaWVudCgpO1xyXG4gICAgICAgIGF3YWl0IHRoaXMubG9hZERyaXZlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZENsaWVudCgpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmxvYWQoJ2NsaWVudCcsICgpID0+IHJlc29sdmUoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZERyaXZlKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmxvYWQoJ2RyaXZlJywgJ3YzJywgcmVzb2x2ZSgpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBjcmVhdGUoZmlsZW5hbWUgPSBcIkdhbWUgTmFtZS5qc29uXCIpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMuY3JlYXRlKHtcclxuICAgICAgICAgICAgICAgIG5hbWUgOiBmaWxlbmFtZSxcclxuICAgICAgICAgICAgICAgIHBhcmVudHM6IFsnYXBwRGF0YUZvbGRlciddLFxyXG4gICAgICAgICAgICAgICAgZmllbGRzOiBcImlkXCJcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLnJlc3VsdC5pZCk7XHJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZGVsZXRlKGZpbGVJZCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpPT4ge1xyXG4gICAgICAgICAgICBnYXBpLmNsaWVudC5kcml2ZS5maWxlcy5kZWxldGUoe1xyXG4gICAgICAgICAgICAgICAgZmlsZUlkIDogZmlsZUlkXHJcbiAgICAgICAgICAgIH0pLnRoZW4ocmVzPT57XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy5yZXN1bHQpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGxpc3QoKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmxpc3Qoe1xyXG4gICAgICAgICAgICAgICAgLy8gcTogYG5hbWUgY29udGFpbnMgJy5qc29uJ2AsXHJcbiAgICAgICAgICAgICAgICBzcGFjZXM6ICdhcHBEYXRhRm9sZGVyJyxcclxuICAgICAgICAgICAgICAgIGZpZWxkczogJ2ZpbGVzL25hbWUsZmlsZXMvaWQsZmlsZXMvbW9kaWZpZWRUaW1lJ1xyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMucmVzdWx0LmZpbGVzKTtcclxuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBnZXQoZmlsZUlkKXtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PiB7XHJcbiAgICAgICAgICAgIGdhcGkuY2xpZW50LmRyaXZlLmZpbGVzLmdldCh7XHJcbiAgICAgICAgICAgICAgICBmaWxlSWQ6IGZpbGVJZCxcclxuICAgICAgICAgICAgICAgIGFsdDogJ21lZGlhJ1xyXG4gICAgICAgICAgICB9KS50aGVuKHJlcz0+e1xyXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgc2V0Qm9keShmaWxlSWQsIGJvZHkpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQucmVxdWVzdCh7XHJcbiAgICAgICAgICAgICAgICBwYXRoIDogXCJ1cGxvYWQvZHJpdmUvdjMvZmlsZXMvXCIgKyBmaWxlSWQsXHJcbiAgICAgICAgICAgICAgICBtZXRob2QgOiBcIlBBVENIXCIsXHJcbiAgICAgICAgICAgICAgICBwYXJhbXMgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXBsb2FkVHlwZSA6IFwibWVkaWFcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnMgOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIiA6IFwiYXBwbGljYXRpb24vanNvblwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYm9keSA6IGJvZHlcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXMuYm9keSkpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVuYW1lKGZpbGVJZCwgZmlsZW5hbWUpe1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+IHtcclxuICAgICAgICAgICAgZ2FwaS5jbGllbnQuZHJpdmUuZmlsZXMudXBkYXRlKHtcclxuICAgICAgICAgICAgICAgIGZpbGVJZDogZmlsZUlkLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogZmlsZW5hbWVcclxuICAgICAgICAgICAgfSkudGhlbihyZXM9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXMuYm9keSkpO1xyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnJvci5tZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEZpbGVPcHM7IiwiXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4vKiogVmlldy1Db250cm9sbGVyIGZvciB0aGUgSFRNTCBnYW1lIGJvYXJkIGVsZW1lbnRcclxuICAgIFRoaXMgaXMgdGhlIGNsYXNzaWNhbCBcIkplb3BhcmR5XCIgdHlwZSBib2FyZFxyXG4gICAgVGhpcyBpcyBtb2RlbCBhZ25vc3RpYywgc2VlIEVkaXRvclBhbmUuanMgZm9yIG1vZGVsIG1ldGhvZHNcclxuICAgIGdlbmVyYXRlcyB0aGUgZm9sbG93aW5nIGV2ZW50czpcclxuICAgICAgICBjZWxsLXNlbGVjdCAocm93LCBjb2wpOiB3aGVuIGEgdXNlciBjbGlja3MgYSBjZWxsXHJcbiAgICAgICAgaGVhZGVyLXVwZGF0ZSAodmFsdWUsIGNvbCwgZm9udHNpemUpIDogd2hlbiB0aGUgaGVhZGVyIHRleHQgY2hhbmdlcyAoYW5kIGJsdXJzKVxyXG4gKiovXHJcblxyXG5jb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcblxyXG5jbGFzcyBDZWxsU2VsZWN0RXZlbnQgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3Rvcihyb3csIGNvbCkge1xyXG4gICAgICAgIHN1cGVyKCdjZWxsLXNlbGVjdCcsXHJcbiAgICAgICAgICAgICAge2RldGFpbCA6IHtyb3cgOiByb3csIGNvbCA6IGNvbCB9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEhlYWRlclVwZGF0ZUV2ZW50IGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoY29sLCB2YWx1ZSwgZm9udFNpemUpIHtcclxuICAgICAgICBzdXBlcignaGVhZGVyLXVwZGF0ZScsXHJcbiAgICAgICAgICAgIHtkZXRhaWwgOiB7dmFsdWUgOiB2YWx1ZSwgY29sIDogY29sLCBmb250U2l6ZSA6IGZvbnRTaXplfX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBHYW1lQm9hcmQgZXh0ZW5kcyBOaWRnZXRFbGVtZW50IHtcclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVhZHkoKXtcclxuICAgICAgICBhd2FpdCBzdXBlci5yZWFkeSgpO1xyXG4gICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDY7IGNvbCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0SGVhZGVyKGNvbCkuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIChldmVudCk9PmV2ZW50LnRhcmdldC5maXRUZXh0Lm5vdGlmeSgxLCAxKSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmdldEhlYWRlcihjb2wpLmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIChldmVudCk9PntcclxuICAgICAgICAgICAgICAgIGxldCBmb250U2l6ZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGV2ZW50LnRhcmdldClbXCJmb250LXNpemVcIl07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEhlYWRlclVwZGF0ZUV2ZW50KGNvbCwgZXZlbnQudGFyZ2V0LnRleHQsIGZvbnRTaXplKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgcm93ID0gMDsgcm93IDwgNTsgcm93KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Q2VsbChyb3csIGNvbCkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IENlbGxTZWxlY3RFdmVudChyb3csIGNvbCkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIHZhbHVlIG9mIGEgY2F0ZWdvcnlcclxuICAgICAqIEBwYXJhbSBpbmRleFxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKiBAcGFyYW0gdmFsdWVcclxuICAgICAqL1xyXG4gICAgc2V0SGVhZGVyKGluZGV4LCB2YWx1ZSwgZm9udFNpemUpe1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy5nZXRIZWFkZXIoaW5kZXgpO1xyXG4gICAgICAgIGVsZW1lbnQudGV4dCA9IHZhbHVlO1xyXG4gICAgICAgIGlmIChmb250U2l6ZSkgZWxlbWVudC5zdHlsZVtcImZvbnQtc2l6ZVwiXSA9IGZvbnRTaXplO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0cmlldmUgdGhlIGhlYWRlciBodG1sIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSBpbmRleFxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIGdldEhlYWRlcihpbmRleCl7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBpbmRleCAhPT0gXCJudW1iZXJcIiB8fCBpbmRleCA8IDAgfHwgaW5kZXggPiA2KSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGluZGV4OiBcIiArIGluZGV4KTtcclxuICAgICAgICBsZXQgc2VsZWN0b3IgPSBgW2RhdGEtcm93PSdoJ11bZGF0YS1jb2w9JyR7aW5kZXh9J10gPiAudmFsdWVgO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSB2YWx1ZSBvZiBhIG5vbi1jYXRlZ29yeSBjZWxsLlxyXG4gICAgICogQHBhcmFtIHJvd1xyXG4gICAgICogQHBhcmFtIGNvbFxyXG4gICAgICogQHBhcmFtIHZhbHVlXHJcbiAgICAgKi9cclxuICAgIHNldENlbGwocm93LCBjb2wsIHZhbHVlID0gXCJcIil7XHJcbiAgICAgICAgdGhpcy5nZXRDZWxsKHJvdywgY29sKS50ZXh0Q29udGVudCA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENlbGwocm93LCBjb2wpe1xyXG4gICAgICAgIGxldCBzZWxlY3RvciA9IGBbZGF0YS1yb3c9XCIke3Jvd31cIl1bZGF0YS1jb2w9XCIke2NvbH1cIl0gPiAudmFsdWVgO1xyXG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldENvbXBsZXRlKHJvdywgY29sLCB2YWx1ZSl7XHJcbiAgICAgICAgaWYgKHR5cGVvZiByb3cgIT09IFwibnVtYmVyXCIgfHwgcm93IDwgMCB8fCByb3cgPiA2KSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHJvdzogXCIgKyByb3cpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29sICE9PSBcIm51bWJlclwiIHx8IGNvbCA8IDAgfHwgY29sID4gNSkgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBjb2w6IFwiICsgY29sKTtcclxuICAgICAgICB0aGlzLmdldENlbGwocm93LCBjb2wpLnNldEF0dHJpYnV0ZShcImRhdGEtY29tcGxldGVcIiwgdmFsdWUpO1xyXG4gICAgfVxyXG59XHJcblxyXG53aW5kb3cuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdnYW1lLWJvYXJkJywgR2FtZUJvYXJkKTtcclxubW9kdWxlLmV4cG9ydHMgPSBHYW1lQm9hcmQ7IiwiY2xhc3MgTWVudXtcclxuICAgIGluaXQobWVudVNlbGVjdG9yKXtcclxuICAgICAgICB0aGlzLm1lbnVTZWxlY3RvciA9IG1lbnVTZWxlY3RvcjtcclxuICAgICAgICB0aGlzLm1lbnVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpPT50aGlzLnRvZ2dsZU1lbnUoKSk7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbk1lbnUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5tZW51QXJlYS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLCAoKT0+IHRoaXMubW91c2VMZWF2ZSgpKTtcclxuICAgICAgICB0aGlzLm1lbnVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIiwgKCk9PiB0aGlzLm1vdXNlTGVhdmUoKSk7XHJcbiAgICAgICAgdGhpcy5tZW51QXJlYS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLCAoKT0+IHRoaXMubW91c2VFbnRlcigpKTtcclxuICAgICAgICB0aGlzLm1lbnVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIiwgKCk9PiB0aGlzLm1vdXNlRW50ZXIoKSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1hdXRvY2xvc2U9J3RydWUnXCIpLmZvckVhY2goKGVsZSk9PiB7XHJcbiAgICAgICAgICAgIGVsZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMuY2xvc2UoKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc3ViLW1lbnVcIikuZm9yRWFjaCgoZWxlKT0+e1xyXG4gICAgICAgICAgICBlbGUucXVlcnlTZWxlY3RvcihcIi5tZW51LWxhYmVsXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVNZW51KGVsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBjbG9zZSgpe1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuXHJcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zdWItbWVudSA+IC5tZW51LWFyZWFcIikuZm9yRWFjaCgoZWxlKT0+e1xyXG4gICAgICAgICAgICBlbGUuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBvcGVuKCl7XHJcbiAgICAgICAgdGhpcy5tZW51QXJlYS5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb25NZW51KCk7XHJcbiAgICB9XHJcblxyXG4gICAgbW91c2VMZWF2ZSgpe1xyXG4gICAgICAgIGlmICh0aGlzLnRpbWVvdXQpIHJldHVybjtcclxuICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT57XHJcbiAgICAgICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICAgICAgdGhpcy50aW1lb3V0ID0gbnVsbDtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdXNlRW50ZXIoKXtcclxuICAgICAgICBpZiAoIXRoaXMudGltZW91dCkgcmV0dXJuO1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xyXG4gICAgICAgIHRoaXMudGltZW91dCA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdG9nZ2xlTWVudShlbGVtZW50KXtcclxuICAgICAgICBlbGVtZW50ID0gZWxlbWVudCA/PyB0aGlzLm1lbnVBcmVhO1xyXG4gICAgICAgIGlmICghZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJtZW51LWFyZWFcIikpe1xyXG4gICAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtYXJlYVwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhcImhpZGRlblwiKSl7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJtZW51LWFyZWFcIikpe1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5tZW51LWFyZWFcIikuZm9yRWFjaChcclxuICAgICAgICAgICAgICAgIChlbGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBlbGUuY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcG9zaXRpb25NZW51KCl7XHJcbiAgICAgICAgY29uc3QgbGVmdCA9IHRoaXMubWVudUJ1dHRvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5sZWZ0O1xyXG4gICAgICAgIGNvbnN0IGJXaWR0aCA9IHRoaXMubWVudUJ1dHRvbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcclxuICAgICAgICBjb25zdCBtV2lkdGggPSB0aGlzLm1lbnVBcmVhLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoO1xyXG4gICAgICAgIGlmICgobGVmdCArIGJXaWR0aCArIG1XaWR0aCArIDIpID4gd2luZG93LmlubmVyV2lkdGgpe1xyXG4gICAgICAgICAgICB0aGlzLnNldE1lbnVMZWZ0KCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRNZW51UmlnaHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2V0TWVudUxlZnQoKXtcclxuICAgICAgICBjb25zdCBsZWZ0ID0gdGhpcy5tZW51QnV0dG9uLm9mZnNldExlZnQ7XHJcbiAgICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLm1lbnVBcmVhLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIHRoaXMubWVudUFyZWEuc3R5bGUubGVmdCA9IChsZWZ0IC0gd2lkdGggLSAyKSArIFwicHhcIjtcclxuICAgIH1cclxuXHJcbiAgICBzZXRNZW51UmlnaHQoKXtcclxuICAgICAgICBjb25zdCBsZWZ0ID0gdGhpcy5tZW51QnV0dG9uLm9mZnNldExlZnQ7XHJcbiAgICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLm1lbnVCdXR0b24ub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgdGhpcy5tZW51QXJlYS5zdHlsZS5sZWZ0ID0gKGxlZnQgKyB3aWR0aCArIDIpICsgXCJweFwiO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBtZW51KCl7XHJcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5tZW51U2VsZWN0b3IpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBtZW51QnV0dG9uKCl7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWVudS5xdWVyeVNlbGVjdG9yKFwiLm1lbnUtaWNvblwiKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgbWVudUFyZWEoKXtcclxuICAgICAgICByZXR1cm4gdGhpcy5tZW51LnF1ZXJ5U2VsZWN0b3IoXCIubWVudS1hcmVhXCIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE1lbnU7IiwiY2xhc3MgTW9kZWwge1xyXG4gICAgaW5pdChuYW1lID0gXCJHYW1lIE5hbWVcIikge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFJvdW5kID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXHJcbiAgICAgICAgICAgIHJvdW5kczogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLmFkZENhdGVnb3J5Um91bmQoKTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBzZXQgbmFtZShzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5uYW1lID0gc3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBuYW1lKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5uYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIHNldChnYW1lTW9kZWwpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZCA9IDA7XHJcbiAgICAgICAgdGhpcy5nYW1lTW9kZWwgPSBnYW1lTW9kZWw7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSb3VuZChpbmRleCkge1xyXG4gICAgICAgIGluZGV4ID0gaW5kZXggPz8gdGhpcy5jdXJyZW50Um91bmQ7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZU1vZGVsLnJvdW5kc1tpbmRleF07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETyB0ZXN0XHJcbiAgICBzZXRSb3VuZEluZGV4KGZyb20sIHRvKXtcclxuICAgICAgICBsZXQgciA9IHRoaXMuZ2FtZU1vZGVsLnJvdW5kcztcclxuICAgICAgICBpZiAoci5sZW5ndGggPD0gMSkgcmV0dXJuO1xyXG4gICAgICAgIFtyW2Zyb21dLCByW3RvXV0gPSBbclt0b10sIHJbZnJvbV1dO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbHVtbihpbmRleCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFJvdW5kKCkuY29sdW1uW2luZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRDZWxsKHJvdywgY29sdW1uKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29sdW1uKGNvbHVtbikuY2VsbFtyb3ddO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZVJvdW5kKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnJvdW5kQ291bnQgPT09IDEpIHJldHVybjtcclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5yb3VuZHMuc3BsaWNlKHRoaXMuY3VycmVudFJvdW5kLCAxKTtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um91bmQgPj0gdGhpcy5yb3VuZENvdW50KSB0aGlzLmN1cnJlbnRSb3VuZCA9IHRoaXMucm91bmRDb3VudCAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkTXVsdGlwbGVDaG9pY2VSb3VuZCgpe1xyXG4gICAgICAgIGxldCByb3VuZCA9IHtcclxuICAgICAgICAgICAgdHlwZTogTW9kZWwucXVlc3Rpb25UeXBlLk1VTFRJUExFX0NIT0lDRSxcclxuICAgICAgICAgICAgcXVlc3Rpb24gOiBcIlwiLFxyXG4gICAgICAgICAgICBhbnN3ZXJzIDogW11cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKyl7XHJcbiAgICAgICAgICAgIHJvdW5kLmFuc3dlcnNbaV0gPSB7XHJcbiAgICAgICAgICAgICAgICB0ZXh0IDogXCJcIixcclxuICAgICAgICAgICAgICAgIGlzVHJ1ZSA6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZU1vZGVsLnJvdW5kcy5wdXNoKHJvdW5kKTtcclxuICAgICAgICByZXR1cm4gcm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkQ2F0ZWdvcnlSb3VuZCgpIHtcclxuICAgICAgICBsZXQgcm91bmQgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IE1vZGVsLnF1ZXN0aW9uVHlwZS5DQVRFR09SWSxcclxuICAgICAgICAgICAgY29sdW1uOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXSA9IHtcclxuICAgICAgICAgICAgICAgIGNhdGVnb3J5OiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgY2VsbDogW11cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXS5jZWxsW2pdID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAoaiArIDEpICogMTAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHE6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYTogXCJcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdhbWVNb2RlbC5yb3VuZHMucHVzaChyb3VuZCk7XHJcbiAgICAgICAgcmV0dXJuIHJvdW5kO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCByb3VuZENvdW50KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVNb2RlbC5yb3VuZHMubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIGluY3JlbWVudFJvdW5kKCl7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Um91bmQrKztcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Um91bmQgPj0gdGhpcy5yb3VuZENvdW50KSB0aGlzLmN1cnJlbnRSb3VuZCA9IHRoaXMucm91bmRDb3VudCAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgZGVjcmVtZW50Um91bmQoKXtcclxuICAgICAgICB0aGlzLmN1cnJlbnRSb3VuZC0tO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3VuZCA8IDApIHRoaXMuY3VycmVudFJvdW5kID0gMFxyXG4gICAgfVxyXG5cclxuICAgIGluY3JlYXNlVmFsdWUoKSB7XHJcbiAgICAgICAgbGV0IHJvdW5kID0gdGhpcy5nZXRSb3VuZCgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDU7IGorKykge1xyXG4gICAgICAgICAgICAgICAgcm91bmQuY29sdW1uW2ldLmNlbGxbal0udmFsdWUgKj0gMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWNyZWFzZVZhbHVlKCkge1xyXG4gICAgICAgIGxldCByb3VuZCA9IHRoaXMuZ2V0Um91bmQoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA1OyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHJvdW5kLmNvbHVtbltpXS5jZWxsW2pdLnZhbHVlIC89IDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbk1vZGVsLnF1ZXN0aW9uVHlwZSA9IHtcclxuICAgIENBVEVHT1JZIDogXCJjaG9pY2VcIixcclxuICAgIE1VTFRJUExFX0NIT0lDRSA6IFwibXVsdGlwbGVfY2hvaWNlXCJcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IE1vZGVsOyIsImNvbnN0IE5pZGdldEVsZW1lbnQgPSByZXF1aXJlKFwiQFRoYWVyaW91cy9uaWRnZXRcIikuTmlkZ2V0RWxlbWVudDtcclxucmVxdWlyZShcIi4vQ2hlY2tCb3guanNcIik7XHJcblxyXG5jbGFzcyBUZXh0VXBkYXRlIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoaW5kZXgsIHRleHQpIHtcclxuICAgICAgICBzdXBlcigndGV4dC11cGRhdGUnLFxyXG4gICAgICAgICAgICB7ZGV0YWlsIDoge2luZGV4IDogaW5kZXgsIHRleHQgOiB0ZXh0fX1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBWYWx1ZVVwZGF0ZSBleHRlbmRzICBDdXN0b21FdmVudHtcclxuICAgIGNvbnN0cnVjdG9yKGluZGV4LCB2YWx1ZSkge1xyXG4gICAgICAgIHN1cGVyKCd2YWx1ZS11cGRhdGUnLFxyXG4gICAgICAgICAgICB7ZGV0YWlsIDoge2luZGV4IDogaW5kZXgsIHZhbHVlIDogdmFsdWV9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFF1ZXN0aW9uQ2xpY2sgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcignYnV0dG9uLXF1ZXN0aW9uJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE11bHRpcGxlQ2hvaWNlUGFuZSBleHRlbmRzIE5pZGdldEVsZW1lbnQge1xyXG5cclxuICAgIHNldE1vZGVsKG1vZGVsKXtcclxuICAgICAgICB0aGlzLm1vZGVsID0gbW9kZWw7XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgcmVhZHkoKXtcclxuICAgICAgICBhd2FpdCBzdXBlci5jb25uZWN0ZWRDYWxsYmFjaygpO1xyXG4gICAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKFwiLmFuc3dlciA+IG5pZGdldC10ZXh0XCIpKXtcclxuICAgICAgICAgICAgZWxlbWVudC5maXRUZXh0LmxvY2sgPSBcInZoXCI7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIChldmVudCk9PnRoaXMudHh0TGlzdGVuZXIoZXZlbnQpKTtcclxuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCAoZXZlbnQpPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSBldmVudC50YXJnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1pbmRleFwiKTtcclxuICAgICAgICAgICAgICAgIGxldCB0ZXh0ID0gdGhpcy5xdWVyeVNlbGVjdG9yKGBuaWRnZXQtdGV4dFtkYXRhLWluZGV4PVwiJHtpbmRleH1cIl1gKS50ZXh0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBUZXh0VXBkYXRlKGluZGV4LCB0ZXh0KSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMucXVlcnlTZWxlY3RvckFsbChcImNoZWNrLWJveFwiKSl7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInZhbHVlLXVwZGF0ZVwiLCAoZXZlbnQpPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShldmVudC50YXJnZXQpLmdldFByb3BlcnR5VmFsdWUoXCItLWluZGV4XCIpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gZXZlbnQuZGV0YWlsLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBWYWx1ZVVwZGF0ZShpbmRleCwgdmFsdWUpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjc2hvdy1xdWVzdGlvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBRdWVzdGlvbkNsaWNrKCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHR4dExpc3RlbmVyKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAxMyl7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoZXZlbnQudGFyZ2V0KS5nZXRQcm9wZXJ0eVZhbHVlKFwiLS1pbmRleFwiKTtcclxuICAgICAgICAgICAgaW5kZXggPSBwYXJzZUludChpbmRleCk7XHJcbiAgICAgICAgICAgIGlmIChpbmRleCA+PSA1KXtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC5ibHVyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBgbmlkZ2V0LXRleHRbZGF0YS1pbmRleD1cIiR7aW5kZXggKyAxfVwiXWA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXZlbnQudGFyZ2V0LmZpdFRleHQubm90aWZ5KDEsIDEpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQHBhcmFtIGJ1dHRvbiB7J3F1ZXN0aW9uJywgJ2Fuc3dlcid9XHJcbiAgICAgKi9cclxuICAgIGhpZ2hsaWdodChidXR0b24pe1xyXG4gICAgICAgIGZvciAobGV0IGVsZSBvZiB0aGlzLnF1ZXJ5U2VsZWN0b3JBbGwoYC5zZWxlY3RlZGApKSBlbGUuY2xhc3NMaXN0LnJlbW92ZShcInNlbGVjdGVkXCIpO1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihgI3Nob3ctJHtidXR0b259YCkuY2xhc3NMaXN0LmFkZChcInNlbGVjdGVkXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRleHQoaW5kZXgsIHRleHQpe1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihgbmlkZ2V0LXRleHRbZGF0YS1pbmRleD1cIiR7aW5kZXh9XCJdYCkudGV4dCA9IHRleHQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0Q2hlY2tlZChpbmRleCwgdmFsdWUpe1xyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihgY2hlY2stYm94W2RhdGEtaW5kZXg9XCIke2luZGV4fVwiXWApLmNoZWNrZWQgPSB2YWx1ZTtcclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgnbXVsdGlwbGUtY2hvaWNlLXBhbmUnLCBNdWx0aXBsZUNob2ljZVBhbmUpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE11bHRpcGxlQ2hvaWNlUGFuZTsiLCJjb25zdCBOaWRnZXRFbGVtZW50ID0gcmVxdWlyZShcIkBUaGFlcmlvdXMvbmlkZ2V0XCIpLk5pZGdldEVsZW1lbnQ7XHJcblxyXG5jbGFzcyBUZXh0VXBkYXRlIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IodGV4dCkge1xyXG4gICAgICAgIHN1cGVyKCd0ZXh0LXVwZGF0ZScsXHJcbiAgICAgICAgICAgIHtkZXRhaWwgOiB7dGV4dCA6IHRleHR9fVxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEJvYXJkQ2xpY2sgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcignYnV0dG9uLWJvYXJkJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFF1ZXN0aW9uQ2xpY2sgZXh0ZW5kcyAgQ3VzdG9tRXZlbnR7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcignYnV0dG9uLXF1ZXN0aW9uJyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEFuc3dlckNsaWNrIGV4dGVuZHMgIEN1c3RvbUV2ZW50e1xyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoJ2J1dHRvbi1hbnN3ZXInKTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgUXVlc3Rpb25QYW5lIGV4dGVuZHMgTmlkZ2V0RWxlbWVudHtcclxuXHJcbiAgICBhc3luYyByZWFkeSgpe1xyXG4gICAgICAgIGF3YWl0IHN1cGVyLnJlYWR5KCk7XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LWJvYXJkXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IEJvYXJkQ2xpY2soKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LXF1ZXN0aW9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKT0+e1xyXG4gICAgICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQobmV3IFF1ZXN0aW9uQ2xpY2soKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LWFuc3dlclwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PntcclxuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KG5ldyBBbnN3ZXJDbGljaygpKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCk9PnRoaXMucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpLmZvY3VzKCkpO1xyXG5cclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIjdGV4dC1jb250ZW50c1wiKS5hZGRFdmVudExpc3RlbmVyKFwiYmx1clwiLCBhc3luYyAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IHRoaXMucXVlcnlTZWxlY3RvcihcIi50ZXh0LWNvbnRlbnRzXCIpLnRleHQ7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChuZXcgVGV4dFVwZGF0ZSh0ZXh0LnRyaW0oKSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyKCl7XHJcbiAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiLnRleHQtY29udGVudHNcIikudGV4dCA9IFwiXCI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VGV4dCh0ZXh0KXtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dC1jb250ZW50c1wiKS50ZXh0ID0gdGV4dDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEBwYXJhbSBidXR0b24geydxdWVzdGlvbicsICdhbnN3ZXInfVxyXG4gICAgICovXHJcbiAgICBoaWdobGlnaHQoYnV0dG9uKXtcclxuICAgICAgICBmb3IgKGxldCBlbGUgb2YgdGhpcy5xdWVyeVNlbGVjdG9yQWxsKGAuc2VsZWN0ZWRgKSkgZWxlLmNsYXNzTGlzdC5yZW1vdmUoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICB0aGlzLnF1ZXJ5U2VsZWN0b3IoYCNzaG93LSR7YnV0dG9ufWApLmNsYXNzTGlzdC5hZGQoXCJzZWxlY3RlZFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgYm9hcmRCdXR0b24odmFsdWUpe1xyXG4gICAgICAgIGlmICh2YWx1ZSl7XHJcbiAgICAgICAgICAgIHRoaXMucXVlcnlTZWxlY3RvcihcIiNzaG93LWJvYXJkXCIpLnNob3coKTtcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgdGhpcy5xdWVyeVNlbGVjdG9yKFwiI3Nob3ctYm9hcmRcIikuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxud2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgncXVlc3Rpb24tcGFuZScsIFF1ZXN0aW9uUGFuZSk7XHJcbm1vZHVsZS5leHBvcnRzID0gUXVlc3Rpb25QYW5lO1xyXG5cclxuXHJcblxyXG4iLCJcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICAvLyBUaGUgQnJvd3NlciBBUEkga2V5IG9idGFpbmVkIGZyb20gdGhlIEdvb2dsZSBBUEkgQ29uc29sZS5cclxuICAgIGRldmVsb3BlcktleSA6ICdBSXphU3lBQmNkTG1UNkhIXzdHbzgycV9JQkdJM2ptNlVMNHc0UTAnLFxyXG5cclxuICAgIC8vIFRoZSBDbGllbnQgSUQgb2J0YWluZWQgZnJvbSB0aGUgR29vZ2xlIEFQSSBDb25zb2xlLiBSZXBsYWNlIHdpdGggeW91ciBvd24gQ2xpZW50IElELlxyXG4gICAgY2xpZW50SWQgOiBcIjE1ODgyMzEzNDY4MS05OGJna2FuZ29sdGs2MzZ1a2Y4cG9mZWlzN3BhN2piay5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbVwiLFxyXG5cclxuICAgIC8vIFJlcGxhY2Ugd2l0aCB5b3VyIG93biBwcm9qZWN0IG51bWJlciBmcm9tIGNvbnNvbGUuZGV2ZWxvcGVycy5nb29nbGUuY29tLlxyXG4gICAgYXBwSWQgOiBcIjE1ODgyMzEzNDY4MVwiLFxyXG5cclxuICAgIC8vIEFycmF5IG9mIEFQSSBkaXNjb3ZlcnkgZG9jIFVSTHMgZm9yIEFQSXMgdXNlZCBieSB0aGUgcXVpY2tzdGFydFxyXG4gICAgZGlzY292ZXJ5RG9jcyA6IFtcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2Rpc2NvdmVyeS92MS9hcGlzL2RyaXZlL3YzL3Jlc3RcIl0sXHJcblxyXG4gICAgLy8gU2NvcGUgdG8gdXNlIHRvIGFjY2VzcyB1c2VyJ3MgRHJpdmUgaXRlbXMuXHJcbiAgICBzY29wZTogXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLmZpbGVcIlxyXG59Il19
