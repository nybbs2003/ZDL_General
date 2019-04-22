//ZDL_General.js
// MIT License
// 
// Copyright (c) 2019 David Zhang
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
var Imported = Imported || {};
Imported.ZDL_General = true;

var ZDL = ZDL || {};
ZDL.Core = ZDL.Core || {};
ZDL.Core.version = 0.01;

ZDL.Parameters = PluginManager.parameters('ZDL_General');
ZDL.Param = ZDL.Param || {};
ZDL.Icon = ZDL.Icon || {};
/*:
* @plugindesc description here!
* @author David Zhang (david290(at)qq.com)
* @help
*Plugin commands:
*stretchPictureFullScreen [number,keepRatio]
*-Stretch the picture of given number to fullscreen,if <i>keepRatio</i> is true, the picture will be cut to keep ratio.
*
*scalePictureByRatio index ratio xy duration
*-Scale the picture of given index number to the specified ratio of X/Y axis of the scene, and can optionally specify a duration (default:0)
*
*movePictureByRatio index ratio picture_anchor scene_anchor xy duration
*-Move the picture of given index number to the specified ratio of diatance of X/Y axis of the scene, and can optionally specify a duration (default:0)
*-The position is determined by an anchor on the picture and one on the scene, in the form of one letter : L,C,R,T,D.
*-Top/Left is negetive, and Right/Down is positive.
*-example : "movePictureByRatio 1 0 R R X" will make image 1 right aligned (right edge to the right side of scene with 0 distance)
*
*autoSetBackground index
*-Make the specified image scale to cover fullscreen, while keeping the aspect ratio.
*/
(function() {
    ZDL.Core.Init = Game_System.prototype.initialize;
    ZDL.Core.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_System.prototype.initialize = function()
    {
        ZDL.Core.Init.call(this);
    };
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        ZDL.Core.Game_Interpreter_pluginCommand.call(this, command, args);
        // console.log("debug:"+command+", "+args+"");
        if(command=="stretchPictureFullScreen"&&args.length>0){
            var str = args[0];
            if(str[0]=='['&&str[str.length-1]==']'){
                var arr = JSON.parse(str);
                var keep_ratio = arr[1]==true;
                var pic = $gameScreen._pictures[arr[0]];
                ImageManager.loadPicture(pic._name).addLoadListener(function(bitmap){
                    var i_w = bitmap.width;
                    var i_h = bitmap.height;
                    var g_w = Graphics.width;
                    var g_h = Graphics.height;
                    var r_w = g_w / i_w * 100;
                    var r_h = g_h / i_h * 100;
                    if(keep_ratio){
                        if(r_w > r_h){
                            pic._x=0;
                            pic._y=0-(i_h-g_h)/2;
                            pic._scaleX=r_w;
                            pic._scaleY=r_w;
                        }else{
                            pic._x=0-(i_w*r_h/100-g_w)/2;
                            pic._y=0;
                            pic._scaleX=r_h;
                            pic._scaleY=r_h;
                        }
                    }else{
                        pic._x=0;
                        pic._y=0;
                        pic._scaleX=r_w;
                        pic._scaleY=r_h;
                    }

                });
            }
        }else if(command=="scalePictureByRatio"&&args.length>=3){
            var index = parseInt(args[0]);
            var ratio = parseFloat(args[1]);
            var xy = args[2][0].toLowerCase();
            var pic = $gameScreen._pictures[index];
            var dur = args.length>=4?parseInt(args[3]):0;
            ImageManager.loadPicture(pic._name).addLoadListener(function(bitmap){
                    var i_w = bitmap.width;
                    var i_h = bitmap.height;
                    var g_w = Graphics.width;
                    var g_h = Graphics.height;
                    var r_w = g_w / i_w * ratio;
                    var r_h = g_h / i_h * ratio;
                    if(xy=="x"){
                        if(dur==0){
                            pic._scaleX=r_w;
                            pic._scaleY=r_w;
                        }else{
                            pic._targetScaleX=r_w;
                            pic._targetScaleY=r_w;
                            pic._duration=dur;
                        }
                    }else if(xy=="y"){
                        if(dur==0){
                            pic._scaleX=r_h;
                            pic._scaleY=r_h;
                        }else{
                            pic._targetScaleX=r_h;
                            pic._targetScaleY=r_h;
                            pic._duration=dur;
                        }
                    }
            });
        }else if(command=="movePictureByRatio"&&args.length>=5){
            var index = parseInt(args[0]);
            var ratio = parseFloat(args[1]);
            var pic_anchor = args[2][0].toUpperCase();
            var scene_anchor = args[3][0].toUpperCase();
            var xy = args[4][0].toLowerCase();
            var pic = $gameScreen._pictures[index];
            var dur = args.length>=6?parseInt(args[5]):0;
            ImageManager.loadPicture(pic._name).addLoadListener(function(bitmap){
                    var i_w = bitmap.width  * pic._scaleX / 100;
                    var i_h = bitmap.height * pic._scaleY / 100;
                    var g_w = Graphics.width;
                    var g_h = Graphics.height;
                    var d_w = g_w * ratio / 100;
                    var d_h = g_h * ratio / 100;
                    var img_diff = 0;
                    var scr_diff = 0;
                    if(xy=="x"){
                        if(pic_anchor=="R"){
                            img_diff = i_w;
                        }else if(pic_anchor=="C"){
                            img_diff = i_w / 2;
                        }
                        if(scene_anchor=="R"){
                            scr_diff = g_w;
                        }else if(scene_anchor=="C"){
                            scr_diff = g_w / 2;
                        }
                        if(dur==0){
                            pic._x = scr_diff + d_w - img_diff;
                        }else{
                            pic._targetX = scr_diff + d_w - img_diff;
                            pic._duration = dur;
                        }
                    }else if(xy=="y"){
                        if(pic_anchor=="D"){
                            img_diff = i_h;
                        }else if(pic_anchor=="C"){
                            img_diff = i_h / 2;
                        }
                        if(scene_anchor=="D"){
                            scr_diff = g_h;
                        }else if(scene_anchor=="C"){
                            scr_diff = g_h / 2;
                        }
                        if(dur==0){
                            pic._y = scr_diff + d_h - img_diff;
                        }else{
                            pic._targetY = scr_diff + d_h - img_diff;
                            pic._duration = dur;
                        }
                    }
            });
         }else if(command=="autoSetBackground"&&args.length>=1){
            var index = parseInt(args[0]);
            var pic = $gameScreen._pictures[index];
            ImageManager.loadPicture(pic._name).addLoadListener(function(bitmap){
                    var i_w = bitmap.width;
                    var i_h = bitmap.height;
                    var g_w = Graphics.width;
                    var g_h = Graphics.height;
                    var ratio_1 = i_w / i_h;
                    var ratio_2 = g_w / g_h;

                    Game_Interpreter.prototype.pluginCommand.call(null,"scalePictureByRatio",[index,"100",ratio_1 > ratio_2? "y":"x"]);
                    Game_Interpreter.prototype.pluginCommand.call(null,"movePictureByRatio",[index,"0","c","c","x"]);
                    Game_Interpreter.prototype.pluginCommand.call(null,"movePictureByRatio",[index,"0","c","c","y"]);
            });
         }
    };
})();
