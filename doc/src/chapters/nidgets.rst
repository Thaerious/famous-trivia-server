=======
Nidgets
=======

Sizing Components
-----------------

The *style/components/_page_container.scss* file contains variables to dynamically size
components.  Place all components inside the '#page-container' and import the 'setupSizeListener'
into the .js file.  This will add resize listener that dynamically updates the 'height-value', 'width-value'
and 'base-font-size' variables.  Variables can be sized to these variables using 'calc'.  It will always keep the
#page-container at a 9:16 aspect ratio.

JavaScript Example.::

    import setupSizeListener from "./modules/SetupSizeListener";
    setupSizeListener();

CSS Example.::

    #css {
      width: calc(0.08 * var(--width-value));
      height: calc(0.08 * var(--width-value));
      font-size: calc(1.2 * var(--base-font-size));
    }

* --height-value: 100vh;
* --width-value: 16/9 * 100vh;

Information details on individual nidgets.

Nidget Button
-------------

``<nidget-button class="round">CLOSE</nidget-button>``

* Requires a button style class.
* * round (currently the only one available)
* The host element .css needs to specify height and width.
* The button will take it's text from the host element text.
* The element utilized the following .css variables.

CSS variables
^^^^^^^^^^^^^

* --ui-button-color: ###, ###, ###;