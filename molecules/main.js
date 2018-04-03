/*
       document : main.js, for molecules in shasta-projects
     created on : thursday, may 18, 2017, 09:09 am
         author : audrey bongalon
    description : main javascript file for the modelling program


                                      88
                                      88
                                      88
    ,adPPYYba,  88       88   ,adPPYb,88  8b,dPPYba,   ,adPPYba,  8b       d8
    ""     `Y8  88       88  a8"    `Y88  88P'   "Y8  a8P,,,,,88  `8b     d8'
    ,adPPPPP88  88       88  8b      :88  88          8PP"""""""   `8b   d8'
    88,    ,88  "8a,   ,a88  "8a,   ,d88  88          "8b,   ,aa    `8b,d8'
    `"8bbdP"Y8   `"YbbdP'Y8   `"8bbdP"Y8  88           `"Ybbd8"'      Y88'
                                                                     d8'
                                                                    d8'
*/

/* global $ THREE periodicTable chemistryData canvasData threeData Atom */

let currentModel = "ball and stick";
let highlightedAtom;    // reference to three object and not Atom object
let highlightedAtomParentObject;

let atomArray = [];         // will store all the atoms
let atomMeshArray = [];
let currentAtom, previousAtom;
















//      ------------------------------------------------
//      |    constructor and atom-related functions    |
//      ------------------------------------------------

function highlightSelectedAtom() {
    // create ray
	raycaster.setFromCamera(mouse, camera);

    // this is an array that stores all of the things the ray touches, from front (closest to camera) to back
    // const intersects = raycaster.intersectObjects(atomMeshArray);   // (used to be scene.children)
    const everything = raycaster.intersectObjects(scene.children);

    console.log(everything[0]);

    // exclude axes from array (by creating a new array)
    const intersects = [];
    for (let item of everything) {
        if (item.isMesh) {
            intersects.push(item);
        }
    }
    console.log(intersects);

    if (intersects.length > 0) {                                // if the ray touches anything
        if (highlightedAtom != intersects[0].object) {          //      if it's touching anything new
            if (highlightedAtom) {                              //      and the old thing was an atom
                changeColour(highlightedAtom, highlightedAtomParentObject.colour);   //      unhighlight the old atom
            }

            highlightedAtom = intersects[0].object;             // then update data to store the new highlighted atom
            for (let item of atomArray) {
                if (item.mesh == highlightedAtom) {
                    highlightedAtomParentObject = item;
                }
            }
            // console.log(highlightedAtom)
            changeColour(highlightedAtom, highlightedAtomParentObject.highlightColour);       // and change its colour
        }
    }
    else {                                                      // if the ray doesn't touch anything
        highlightedAtom = null;                                 // tell the data the ray isn't touching anything
        if (highlightedAtom) {                                                  // if the old thing was an atom
            changeColour(highlightedAtom, highlightedAtomParentObject.colour);  // unhighlight it
        }
    }
}
















//      -----------------------
//      |    functionality    |
//      -----------------------

function initialise() {
    threeData.init();
    threeData.setUpScene();









    // fontLoader.load("../libraries/fonts/homizio.json", function(font) {

    //     // (this anonymous callback runs once the json file is loaded)

    //     // puts text geometries into periodicTable
    //     for (let item of periodicTable) {
    //         item.textGeometry = new THREE.TextGeometry(item.symbol, {
    //             font: font,
    //             size: (defaultAtomRadius * 2) * ( 3/4 ),
    //             height: 0,
    //             curveSegments: 12,
    //             bevelThickness: 2,
    //             bevelSize: 5,
    //             bevelEnabled: true
    //         });
    //     }

    //     // creates the text geometry for the lewis dot connections (it's actually a semicolon text geometry)
    //     lewisDotConnexionGeo = new THREE.TextGeometry(":", {    // set ":" to "P" for dev use (easier to see direction)
    //         font: font,
    //         size: (defaultAtomRadius * 2) * ( 3/4 ),
    //         height: 0,
    //         curveSegments: 12,
    //         bevelThickness: 2,
    //         bevelSize: 5,
    //         bevelEnabled: true
    //     });
    //     lewisDotConnexionGeo.rotateY(THREE.Math.degToRad(90));

    //     //  ------------------------------------------------------------------------------------------------------------------
    //     //  |    stuff below this box is meant to run *after* the text geometries have loaded and put into pedriodicTable    |
    //     //  ------------------------------------------------------------------------------------------------------------------
    // });




    // construct and create the first atom, push it into atomArray
    currentAtom = new Atom();
    currentAtom.createCarbonPlaceholder();
    atomArray = [currentAtom];
    atomMeshArray = [currentAtom.mesh];




	

    // axes
    threeData.addSceneAxis();




	document.getElementById("canvas").appendChild(threeData.renderer.domElement);
}




function animate() {
    // highlight the atom the mouse hovers over
    // highlightSelectedAtom();

    // if on lewis dot model, make sure all text faces user (this looks kinda funny)
    // for (let item of atomArray) {
    //     item.symbolMesh.lookAt(camera.position);
    // }

    // update Three.js tools
	threeData.updateTools();

    // recursive loop
    window.requestAnimationFrame(animate);
}




function switchModel(type) {
    // don't run if model isn't changing
    if (type == currentModel) {
        console.log(type + " is already the current model");
        return;
    }




    // remove old model from scene
    if (currentModel === "ball and stick") {
        for (let item of atomArray) {
            item.clearBallAndStick();
        }
    }
    else if (currentModel == "skeletal") {
        for (let item of atomArray) {
            item.clearSkeletal();
        }
    }
    else if (currentModel == "lewis dot") {
        for (let item of atomArray) {
            item.clearLewisDot();
        }
    }




    // draw in new model and set it as the current one
    currentModel = type;
    if (type == "ball and stick") {
        for (let item of atomArray) {
            item.drawBallAndStick();
        }
    }
    else if (type == "skeletal") {
        for (let item of atomArray) {
            item.drawSkeletal();
        }
    }
    else if (type == "lewis dot") {
        for (let item of atomArray) {
            item.drawLewisDot();
        }
    }
}


















//      -----------------
//      |    startup    |
//      -----------------

let swingInputData = 0, rotateInputData = 0;

$(document).ready(function() {
    // event listeners
    $(window).resize(canvasData.resize());
    $("#addAtom").on("click", function() {
        if (currentAtom.currentBonds.length < currentAtom.possibleBonds) {
            atomArray.push(new Atom());                                             // construct the new atom
    
            previousAtom = currentAtom;                                             // new previousAtom is the old currentAtom
            currentAtom = atomArray[atomArray.length - 1];                          // new currentAtom is last (newest) in array
    
            atomMeshArray.push(currentAtom.mesh);
    
            previousAtom.currentBonds.push(currentAtom);
            currentAtom.currentBonds.push(previousAtom);
            currentAtom.parentAtom = previousAtom;
    
            currentAtom.createNew();                                                // create the new atom
    
    
    
    
            // reset input values
            $("#dropdown").val("carbon");
        }
        else {
            alert("This atom cannot bond to any more additional atoms.");
        }
    });
    $("#remoovAtom").on("click", function() {
        alert("remoov");
    });
    $("#restart").on("click", function() {
        // default to ball-and-stick model
        currentModel = "ball and stick";
    
        // clear data
        atomArray = [];
        atomMeshArray = [];
        threeData.clearScene();
    
        // reset lights and base atom
        // drawAxes();
        threeData.addLights();
        currentAtom = new Atom();
        currentAtom.createCarbonPlaceholder();
        atomArray.push(currentAtom);
        atomMeshArray.push(currentAtom.mesh);
    
        // reset camera
        threeData.controls.reset();
    
        // reset input values
        $("#dropdown").val("carbon");
    });

    $("#ballAndStick").on("click", function() {
        switchModel("ball and stick");
    });
    $("#skeletal").on("click", function() {
        switchModel("skeletal");
    });
    $("#lewisDot").on("click", function() {
        switchModel("lewis dot");
    });

    $("#dropdown").on("change", function() {
        const element = $("#dropdown option:selected").val();
        currentAtom.setElementData(element);
        currentAtom.applyElementData();
        if (currentAtom.parentAtom) {   // prevents the alert from showing when the base atom is changed
            currentAtom.reposition();
        }
        currentAtom.moovParentConnection();
        currentAtom.symbolMesh.position.set(currentAtom.mesh.position.x - currentAtom.symbolMeshOffset.x,
                                            currentAtom.mesh.position.y - currentAtom.symbolMeshOffset.y,
                                            currentAtom.mesh.position.z);
    });

    // TODO fix inputs
    $("#swingSlider").on("input change", function() {
        // gets value from slider
        swingInputData = $(this).val();

        // set placeholder and value on corresponding input box
        $("#swingInput").attr("placeholder", swingInputData);
        $("#swingInput").val(swingInputData);

        // apply change to the selected atom
        currentAtom.reposition();
        currentAtom.moovParentConnection();
    });
    $("#swingInput").on("input change", function() {
        // gets the value from input box
        swingInputData = $(this).val();

        // check to make sure value is within bounds
        const max = $(this).attr("max");
        const min = $(this).attr("min");
        if (swingInputData > max) {
            swingInputData = max;
            // console.log("nht")   // TODO fix overflow error
        }
        else if (swingInputData < min) {
            swingInputData = min;
        }

        // set value on slider and update the element to visually moov the slider
        $("#swingSlider").val(swingInputData);
        $("#swingSlider").trigger("change");

        // apply change to the selected atom
        currentAtom.reposition();
        currentAtom.moovParentConnection();
    });
    $("#rotateSlider").on("input change", function() {
        // gets value from slider
        rotateInputData = $(this).val();

        // set placeholder and value on corresponding input box
        $("#rotateInput").attr("placeholder", rotateInputData);
        $("#rotateInput").val(rotateInputData);

        // apply change to the selected atom
        currentAtom.reposition();
        currentAtom.moovParentConnection();
    });
    $("#rotateInput").on("input change", function() {
        // gets the value from input box
        rotateInputData = $(this).val();

       // check to make sure value is within bounds
        const max = $(this).attr("max");
        const min = $(this).attr("min");
        if (rotateInputData > max) {
            rotateInputData = max;
        }
        else if (rotateInputData < min) {
            rotateInputData = min;
        }

        // set value on slider and update the element to visually moov the slider
        $("rotateSlider").val(rotateInputData);
        $("#rotateSlider").trigger("change");

        // apply change to the selected atom
        currentAtom.reposition();
        currentAtom.moovParentConnection();
    });

    $("#canvas").on("mousemove", function(event) {
        const canvasPosition = threeData.renderer.domElement.getBoundingClientRect();

        // position inside the canvas
        const mouseX = event.clientX - canvasPosition.left;
        const mouseY = event.clientY - canvasPosition.top;

        // divide my the position so it represents the fraction of the canvas it takes up
        // then multiply by 2 (because the canvas width and height both go from -1 to 1)
        // mouse y needs to be inverted because down is positive
        // add/subtract 1 to centre it since (0, 0) is in the middle of the canvas
        threeData.mouse.x =  2 * (mouseX / canvasData.width)  - 1;
        threeData.mouse.y = -2 * (mouseY / canvasData.height) + 1;
    });

    $(window).on("keydown", function(event) {
        if (event.which == 187) {        // =
            currentAtom.lewisDotConnexion.add(new THREE.axisHelper(200));
        }
        else if (event.which == 65) {    // a
            console.log("hi");
        }
    });




    // run at start
    canvasData.resize();     // canvas must be sized on start
    initialise();
    animate();
});