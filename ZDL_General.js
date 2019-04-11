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
*Plugin command(s):
*stretchPictureFullScreen [number,keepRatio]
*-Stretch the picture of given number to fullscreen,if <i>keepRatio</i> is true, the picture will be cut to keep ratio.
*/
(function() {
    ZDL.Core.Init = Game_System.prototype.initialize;
    ZDL.Core.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_System.prototype.initialize = function()
    {
        ZDL.Core.Init.call(this);
        // console.log("my plugin initialized!");
    };
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        ZDL.Core.Game_Interpreter_pluginCommand.call(this, command, args);
        //console.log("debug:"+command+", "+args+"");
        if(command=="stretchPictureFullScreen"&&args.length>0){
            var str = args[0];
            if(str[0]=='['&&str[str.length-1]==']'){
                var arr = JSON.parse(str);
                var keep_ratio = arr[1]==true;
                var pic = $gameScreen._pictures[arr[0]];
                ImageManager.loadPicture(pic._name).addLoadListener(function(bitmap){
                    // console.log(bitmap);
                    var i_w = bitmap.width;
                    var i_h = bitmap.height;
                    var g_w = Graphics.width;
                    var g_h = Graphics.height;
                    var r_w = g_w / i_w * 100;
                    var r_h = g_h / i_h * 100;
                    //console.log("debug: "+"i_w="+i_w+", i_h="+i_h+", g_w="+g_w+", g_h="+g_h+", r_w="+r_w+", r_h="+r_h);
                    if(keep_ratio){
                        //console.log("img scale keep ratio");
                        if(r_w > r_h){
                            pic._x=0;
                            pic._y=0-(i_h-g_h)/2;
                            pic._scaleX=r_w;
                            pic._scaleY=r_w;
                        }else{
                            pic._x=0-(i_w-g_w)/2;
                            pic._y=0;
                            pic._scaleX=r_h;
                            pic._scaleY=r_h;
                        }
                    }else{
                        //console.log("img scale not keep ratio");
                        pic._x=0;
                        pic._y=0;
                        pic._scaleX=r_w;
                        pic._scaleY=r_h;
                    }

                });
            }
        }
       
    };

})();
