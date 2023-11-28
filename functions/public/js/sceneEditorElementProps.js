let elementPropertiesHTML = {

    groundplaneElement: '<div class="nameModel">\
                          <span>Name: </span>\
                          <input type="text" id="prop-name">\
                        </div>\
                        <div class="selectGroundPlane">\
                          <span class="groundPlaneSpan" style="margin-bottom:20px;">GroundPlane:</span> <button type="button" id="btn3" class="btn btn-info btn-sm btn-rounded" data-toggle="modal" data-target="#assetLibraryModal" style="background:rgb(58, 64, 72); margin-left:24px; margin-top: 10px; margin-bottom:20px; border: 1px solid white; color:white;">Select Image for Skybox\
                          </button>\
                        </div>',

    skyboxElement: '<div class="nameModel">\
                      <span>Name: </span>\
                      <input type="text" id="prop-name">\
                    </div>\
                    <div class="selectSkybox">\
                       <span class="skyboxSpan" style="margin-bottom:20px;">Skybox:</span> <button type="button" id="btn3" class="btn btn-info btn-sm btn-rounded" data-toggle="modal" data-target="#assetLibraryModal" style="background:rgb(58, 64, 72); margin-left:24px; margin-top: 10px; margin-bottom:20px; border: 1px solid white; color:white;">Select Image for Skybox\
                       </button>\
                    </div>',

    modelElement: '<div class="nameModel">\
                    <span>Name: </span>\
                    <input type="text" id="prop-name">\
                  </div>\
                  <div class="modelSelect" style="margin-bottom:20px;">\
                     <span class="modelSpan">Model:</span> <button type="button" id="btn3" class="btn btn-info btn-sm btn-rounded" data-toggle="modal" data-target="#assetLibraryModal" style="background:rgb(58, 64, 72); margin-top:10px; margin-left:30px; margin-bottom:20px; border: 1px solid white; color:white;">\
                     </button>\
                  </div>\
                  <div class="mode">\
                  <span class="modeSpan">Mode: </span>\
                  <label for="modebuttons" style="background:rgb(40, 44, 49); margin-left:40px;">\
                  <button id="modebtn1" class="blueBackground"  onclick="togglecolor()" ><i class="fa fa-arrows" aria-hidden="true"></i></button>\
                  <button id="modebtn2" class="blackBackground" onclick="togglecolor1()"><i class="fa fa-refresh" aria-hidden="true"></i></button>\
                  <button id="modebtn3" class="blackBackground" onclick="togglecolor2()" style="margin-right:0px;"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>\
                  </label>\
              </div>\
                  <div class="transform">\
                    <span id="transformSpan">Transform</span>\
                    <div class="position">\
                        <span class="positionSpan">Position: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-pos-x" class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-pos-y"  class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-pos-z"  class="transformInput">\
                    </div>\
                    <div class="rotation">\
                        <span  class="rotationSpan">Rotation: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-rot-x"  class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-rot-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-rot-z" class="transformInput">\
                        <span  class="wSpan">w: </span>\
                        <input type="text" id="prop-rot-w" class="transformInput">\
                    </div>\
                    <div class="scale">\
                        <span  id="scaleSpan">Scale: </span>\
                        <span  class="xSpanScale">X: </span>\
                        <input type="text" id="prop-scale-x"  class="transformInput">\
                        <span class="ySpan">Y: </span>\
                        <input type="text" id="prop-scale-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-scale-z"  class="transformInput">\
                    </div>\
                </div>\
                <hr style="background-color:slategray">\
                <div class="otherProperties">\
                  <span class="animationSpan">Animation</span>\
                  <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:95px; margin-top:10px; margin-bottom:10px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                  </button>\
                  <br>\
                  <span class="materialSpan">Material and Shader: </span>\
                  <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:10px; margin-top:10px; margin-bottom:10px; border: 1px solid white; color:white;">Default <span class = "caret"></span>\
                  </button>\
                  <br>\
                  <span class="lightTypeSpan">Light: </span>\
                  <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:128px; margin-top:10px; margin-bottom:20px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                  </button>\
                  <br>\
                  <span class="collidableSpan">Collidable</span>\
                  <input type="checkbox" class="collidableInput">\
                </div>',

    audioElement: '<div class="nameModel">\
                    <span>Name: </span>\
                    <input type="text" id="prop-name">\
                  </div>\
                  <div class="mode">\
                  <span class="modeSpan">Mode: </span>\
                  <label for="modebuttons" style="background:rgb(40, 44, 49); margin-left:40px;">\
                  <button id="modebtn1" class="blueBackground"  onclick="togglecolor()" ><i class="fa fa-arrows" aria-hidden="true"></i></button>\
                  <button id="modebtn2" class="blackBackground" onclick="togglecolor1()"><i class="fa fa-refresh" aria-hidden="true"></i></button>\
                  <button id="modebtn3" class="blackBackground" onclick="togglecolor2()" style="margin-right:0px;"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>\
                  </label>\
              </div>\
                  <div class="transform">\
                    <span id="transformSpan">Transform</span>\
                    <div class="position">\
                        <span class="positionSpan">Position: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-pos-x" class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-pos-y"  class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-pos-z"  class="transformInput">\
                    </div>\
                    <div class="rotation">\
                        <span  class="rotationSpan">Rotation: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-rot-x"  class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-rot-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-rot-z" class="transformInput">\
                        <span  class="wSpan">w: </span>\
                        <input type="text" id="prop-rot-w" class="transformInput">\
                    </div>\
                    <div class="scale">\
                        <span  id="scaleSpan">Scale: </span>\
                        <span  class="xSpanScale">X: </span>\
                        <input type="text" id="prop-scale-x"  class="transformInput">\
                        <span class="ySpan">Y: </span>\
                        <input type="text" id="prop-scale-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-scale-z"  class="transformInput">\
                    </div>\
                  </div>\
                  <hr style="background-color:slategray">\
                  <div class="audioSelection">\
                    <span class="audioURLSpan">Audio URL</span><input type="text" id="audioURLInput">\
                    <br>\
                    <span class="audioControlSpan">Controls</span>\
                    <input type="checkbox" class="audioControlInput">\
                    <br>\
                    <span class="audioLoopSpan">Loop</span>\
                    <input type="checkbox" class="audioLoopInput">\
                    <br>\
                    <span class="audioPlaySpan">Auto-Play</span>\
                    <input type="checkbox" class="audioPlayInput">\
                    <br>\
                    <span class="volumeSpan">Volume</span>\
                    <input type="range" min="0" max="100" class="volumeInput">\
                    <br>\
                    <span class="refDistanceSpan">Ref Distance</span>\
                    <input type="text" id="refDistanceInput">\
                    <br>\
                    <span class="maxDistanceSpan">Max Distance</span>\
                    <input type="text" id="maxDistanceInput">\
                    <br>\
                    <span class="RolloffSpan">Rolloff Factor</span>\
                    <input type="text" id="rolloffInput">\
                  </div>',


    videoElement: '<div class="nameModel">\
                    <span>Name: </span>\
                    <input type="text" id="prop-name">\
                  </div>\
                  <div class="mode">\
                        <span class="modeSpan">Mode: </span>\
                        <label for="modebuttons" style="background:rgb(40, 44, 49); margin-left:40px;">\
                        <button id="modebtn1" class="blueBackground"  onclick="togglecolor()" ><i class="fa fa-arrows" aria-hidden="true"></i></button>\
                        <button id="modebtn2" class="blackBackground" onclick="togglecolor1()"><i class="fa fa-refresh" aria-hidden="true"></i></button>\
                        <button id="modebtn3" class="blackBackground" onclick="togglecolor2()" style="margin-right:0px;"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>\
                        </label>\
                    </div>\
                  <div class="transform">\
                  <span id="transformSpan">Transform</span>\
                  <div class="position">\
                        <span class="positionSpan">Position: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-pos-x" class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-pos-y"  class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-pos-z"  class="transformInput">\
                    </div>\
                    <div class="rotation">\
                        <span  class="rotationSpan">Rotation: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-rot-x"  class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-rot-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-rot-z" class="transformInput">\
                        <span  class="wSpan">w: </span>\
                        <input type="text" id="prop-rot-w" class="transformInput">\
                    </div>\
                    <div class="scale">\
                        <span  id="scaleSpan">Scale: </span>\
                        <span  class="xSpanScale">X: </span>\
                        <input type="text" id="prop-scale-x"  class="transformInput">\
                        <span class="ySpan">Y: </span>\
                        <input type="text" id="prop-scale-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-scale-z"  class="transformInput">\
                    </div>\
                   </div>\
                   <hr style="background-color:slategray">\
                   <div class="videoSelection">\
                   <span class="videoURLSpan">Video URL</span><input type="text" id="videoURLInput">\
                   <br>\
                   <span class="videoControlSpan">Controls</span>\
                   <input type="checkbox" class="videoControlInput">\
                   <br>\
                   <span class="videoLoopSpan">Loop</span>\
                   <input type="checkbox" class="videoLoopInput">\
                   <br>\
                   <span class="videoPlaySpan">Auto-Play</span>\
                   <input type="checkbox" class="videoPlayInput">\
                   <br>\
                   <span class="audioTypeSpan">Audio Type</span>\
                   <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:24px; margin-bottom:20px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                   </button>\
                   <br>\
                   <span class="volumeSpan">Volume</span>\
                   <input type="range" min="0" max="100" class="volumeInput">\
                   <br>\
                   </div>',

    lightElement: '<div class="nameModel">\
                        <span>Name: </span>\
                        <input type="text" id="prop-name">\
                     </div>\
                     <div class="mode">\
                        <span class="modeSpan">Mode: </span>\
                        <label for="modebuttons" style="background:rgb(40, 44, 49); margin-left:40px;">\
                        <button id="modebtn1" class="blueBackground"  onclick="togglecolor()" ><i class="fa fa-arrows" aria-hidden="true"></i></button>\
                        <button id="modebtn2" class="blackBackground" onclick="togglecolor1()"><i class="fa fa-refresh" aria-hidden="true"></i></button>\
                        <button id="modebtn3" class="blackBackground" onclick="togglecolor2()" style="margin-right:0px;"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>\
                        </label>\
                    </div>\
                     <div class="transform">\
                        <span id="transformSpan">Transform</span>\
                        <div class="position">\
                        <span class="positionSpan">Position: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-pos-x" class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-pos-y"  class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-pos-z"  class="transformInput">\
                    </div>\
                    <div class="rotation">\
                        <span  class="rotationSpan">Rotation: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-rot-x"  class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-rot-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-rot-z" class="transformInput">\
                        <span  class="wSpan">w: </span>\
                        <input type="text" id="prop-rot-w" class="transformInput">\
                    </div>\
                    <div class="scale">\
                        <span  id="scaleSpan">Scale: </span>\
                        <span  class="xSpanScale">X: </span>\
                        <input type="text" id="prop-scale-x"  class="transformInput">\
                        <span class="ySpan">Y: </span>\
                        <input type="text" id="prop-scale-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-scale-z"  class="transformInput">\
                    </div>\
                     </div>\
                     <hr style="background-color:slategray">\
                     <div class="lightSelection">\
                        <span class="lightTypeSpan">Type: </span>\
                        <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:40px; margin-top:10px; margin-bottom:20px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                        </button>\
                        <br>\
                        <span class="lightColorSpan">Color: </span>\
                        <input type="text" id="lightColorInput">\
                        <br>\
                        <span class="lightIntensitySpan">Intensity: </span>\
                        <input type="text" id="lightIntensityInput">\
                        <br>\
                        <span class="lightRangeSpan">Range: </span>\
                        <input type="text" id="lightRangeInput">\
                        <br>\
                     </div>',

    spawnElement: '<div class="nameModel">\
                    <span>Name: </span>\
                    <input type="text" id="prop-name">\
                  </div>\
                  <div class="mode">\
                    <span class="modeSpan">Mode: </span>\
                    <label for="modebuttons" style="background:rgb(40, 44, 49); margin-left:40px;">\
                    <button id="modebtn1" class="blueBackground"  onclick="togglecolor()" ><i class="fa fa-arrows" aria-hidden="true"></i></button>\
                    <button id="modebtn2" class="blackBackground" onclick="togglecolor1()"><i class="fa fa-refresh" aria-hidden="true"></i></button>\
                    <button id="modebtn3" class="blackBackground" onclick="togglecolor2()" style="margin-right:0px;"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>\
                    </label>\
                  </div>\
                  <div class="transform">\
                    <span id="transformSpan">Transform</span>\
                    <div class="position">\
                        <span class="positionSpan">Position: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-pos-x" class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-pos-y"  class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-pos-z"  class="transformInput">\
                    </div>\
                    <div class="rotation">\
                        <span  class="rotationSpan">Rotation: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-rot-x"  class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-rot-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-rot-z" class="transformInput">\
                        <span  class="wSpan">w: </span>\
                        <input type="text" id="prop-rot-w" class="transformInput">\
                    </div>\
                    <div class="scale">\
                        <span  id="scaleSpan">Scale: </span>\
                        <span  class="xSpanScale">X: </span>\
                        <input type="text" id="prop-scale-x"  class="transformInput">\
                        <span class="ySpan">Y: </span>\
                        <input type="text" id="prop-scale-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-scale-z"  class="transformInput">\
                    </div>\
                </div>',

    imageElement: '<div class="nameModel">\
                    <span>Name: </span>\
                    <input type="text" id="prop-name">\
                  </div>\
                  <div class="mode">\
                        <span class="modeSpan">Mode: </span>\
                        <label for="modebuttons" style="background:rgb(40, 44, 49); margin-left:40px;">\
                        <button id="modebtn1" class="blueBackground"  onclick="togglecolor()" ><i class="fa fa-arrows" aria-hidden="true"></i></button>\
                        <button id="modebtn2" class="blackBackground" onclick="togglecolor1()"><i class="fa fa-refresh" aria-hidden="true"></i></button>\
                        <button id="modebtn3" class="blackBackground" onclick="togglecolor2()" style="margin-right:0px;"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>\
                        </label>\
                    </div>\
                  <div class="transform">\
                    <span id="transformSpan">Transform</span>\
                    <div class="position">\
                        <span class="positionSpan">Position: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-pos-x" class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-pos-y"  class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-pos-z"  class="transformInput">\
                    </div>\
                    <div class="rotation">\
                        <span  class="rotationSpan">Rotation: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-rot-x"  class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-rot-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-rot-z" class="transformInput">\
                        <span  class="wSpan">w: </span>\
                        <input type="text" id="prop-rot-w" class="transformInput">\
                    </div>\
                    <div class="scale">\
                        <span  id="scaleSpan">Scale: </span>\
                        <span  class="xSpanScale">X: </span>\
                        <input type="text" id="prop-scale-x"  class="transformInput">\
                        <span class="ySpan">Y: </span>\
                        <input type="text" id="prop-scale-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-scale-z"  class="transformInput">\
                    </div>\
                  </div>\
                  <hr style="background-color:slategray">\
                  <div class="imgSelection">\
                    <span class="imageURLSpan">Image URL: </span>\
                    <input type="text" id="imageURLInput">\
                    <br>\
                    <span class="imageLinkSpan">Link Href: </span>\
                    <input type="text" id="imageLinkInput">\
                  </div>',

    annotationElement: '<span class="fontSpan">Text Font: </span>\
                        <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:40px; margin-top:10px; margin-bottom:20px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                        </button>\
                        <br>\
                        <span class="colorSpan">Color</span>\
                        <input type="text" class="colorInput">\
                        <br>\
                        <span class="animationSpan">Animation</span>\
                        <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:40px; margin-top:10px; margin-bottom:10px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                        </button>\
                        <br>\
                        <span class="markSpan">Mark </span>\
                        <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:70px; margin-top:10px; margin-bottom:20px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                        </button>',


    textElement: '<div class="mode">\
                        <span class="modeSpan">Mode: </span>\
                        <label for="modebuttons" style="background:rgb(40, 44, 49); margin-left:40px;">\
                        <button id="modebtn1" class="blueBackground"  onclick="togglecolor()" ><i class="fa fa-arrows" aria-hidden="true"></i></button>\
                        <button id="modebtn2" class="blackBackground" onclick="togglecolor1()"><i class="fa fa-refresh" aria-hidden="true"></i></button>\
                        <button id="modebtn3" class="blackBackground" onclick="togglecolor2()" style="margin-right:0px;"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>\
                        </label>\
                    </div>\
                    <div class="transform">\
                    <span id="transformSpan">Transform</span>\
                    <div class="position">\
                        <span class="positionSpan">Position: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-pos-x" class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-pos-y"  class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-pos-z"  class="transformInput">\
                    </div>\
                    <div class="rotation">\
                        <span  class="rotationSpan">Rotation: </span>\
                        <span  class="xSpan">X: </span>\
                        <input type="text" id="prop-rot-x"  class="transformInput">\
                        <span  class="ySpan">Y: </span>\
                        <input type="text" id="prop-rot-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-rot-z" class="transformInput">\
                        <span  class="wSpan">w: </span>\
                        <input type="text" id="prop-rot-w" class="transformInput">\
                    </div>\
                    <div class="scale">\
                        <span  id="scaleSpan">Scale: </span>\
                        <span  class="xSpanScale">X: </span>\
                        <input type="text" id="prop-scale-x"  class="transformInput">\
                        <span class="ySpan">Y: </span>\
                        <input type="text" id="prop-scale-y" class="transformInput">\
                        <span  class="zSpan">Z: </span>\
                        <input type="text" id="prop-scale-z"  class="transformInput">\
                    </div>\
                 </div>\
                 <hr style="background-color:slategray">\
                 <div class="textSelection">\
                    <span class="fontSpan">Text Font: </span>\
                    <button type = "button" class = "btn btn-default dropdown-toggle btn-sm" data-toggle = "dropdown" style="background:rgb(58, 64, 72); margin-left:40px; margin-top:10px; margin-bottom:20px; border: 1px solid white; color:white;">Select <span class = "caret"></span>\
                    </button>\
                    <br>\
                    <span class="colorSpan">Color:</span>\
                    <input type="text" class="colorInput">\
                    <br>\
                    </div>'
}