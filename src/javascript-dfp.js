/**
 *  GPT ad tag generator
 *  Author: Jahnavi Patel
 *  This file creates consistent
 *  ad logic to convert the 
 *  generated DFP ad tags 
*   to GPT ad tags.
 */
     
(function (window, undefined) {
    "use strict";

    var adUnitPath = '', adSlot = [];
    var targetParamsObj = '', targetParamsStr = '', targetParams = '', targetSlot = '';
    var allSlots = [];
    var options = {};
    
    /**
    * Add function to the jQuery
    */
    $.adTagInit = $.fn.adTagInit  = {

        init: function(divId, opts){
            // Set default options
            options = {
                debugEnabled: opts.debugEnabled,
                customTargettingAttributes: opts.customTargettingAttributes,
                enableSyncRendering: opts.enableSyncRendering,
                enableSRA: opts.enableSRA
            };

        },

        setNetwork: function (networkCode, unitName) {
            adUnitPath = '/' + networkCode + '/' + unitName;
        },

        /** 
        *   This function sets up additional debug in addition to the google console.
        *   Change the value of debug to true to turn debugging on.
        **/
        additionalDebug: function(){
            if(localStorage.getItem('debug') === null){
                localStorage.setItem('debug', options.debugEnabled);
            }           
            options.debugEnabled = localStorage.getItem('debug');
        },

        /**
        *   Convert targeting values to a array of : pair so we can 
        *   feed them into setTargeting for the slot later
        */ 
        setTargettingAttributes: function(divId){          
            if(options.customTargettingAttributes !== undefined){
                targetParamsObj = options.customTargettingAttributes;
                if(typeof options.customTargettingAttributes === 'object'){
                    targetParamsStr = JSON.stringify(targetParamsObj);
                }
                else {
                    targetParamsStr = targetParamsObj;
                }
                targetParamsStr = targetParamsStr.replace('{','');
                targetParamsStr = targetParamsStr.replace('}','');
                targetParams = targetParamsStr.split(',');
            }
        
        },

        /**
        *   Create the ad slot
        **/
        createAdSlot: function(adSize, divId){
            googletag.cmd.push(function() {
                adSlot[divId] = googletag.defineSlot(adUnitPath, adSize, divId);
                adSlot[divId].addService(googletag.pubads());
                allSlots.push(adSlot[divId]);
             }); 
        },

        /**
        *   Set custom targetting for all the ad slots
        **/
        setCustomTargetting: function(divId){
            if(options.customTargettingAttributes !== undefined){
                for (var i = 0, len = targetParams.length; i < len; i++) {
                    var split = [];
                    split = targetParams[i].split(':');
                    var key = split[0];
                    var value = split[1];
                    key = key.replace('"', '');
                    value = value.replace('"', '');
                    key = key.slice(0, key.length - 1);
                    value = value.slice(0, value.length - 1);

                    adSlot[divId].setTargeting(key, value);

                    if (options.debugEnabled == 'true') {
                        console.log('Supplying custom Targetting Attributes values to adSlot[' + divId + '] - ' + key + ',' + value);
                    }
                }
            }
        },

        pushAdSlotDiv: function(divId){
            googletag.cmd.push(function() {

                if(options.enableSyncRendering){
                    googletag.pubads().enableSyncRendering();
                }
                
                if(options.enableSRA){
                    googletag.pubads().enableSingleRequest();
                }

                googletag.enableServices();
                googletag.display(divId);   

                targetSlot = adSlot[divId];

                //additional debugging to see if creative rendered callback
                if (options.debugEnabled == 'true') {
                    googletag.pubads().addEventListener('slotRenderEnded', function(event) {
                        if(event.slot == targetSlot){
                            console.log('################################  GOOGLETAG: Creative rendered callback STARTS################');
                            console.log('divId: ' + divId + ' Creative with id: ' + event.creativeId +
                                ' is rendered to slot of size: ' + event.size[0] + 'x' + event.size[1]);
                            console.log('################################  GOOGLETAG: Creative rendered callback ENDS################');
                        }
                    }); 
                }
            }); 
        },


        /**
        *   Tamper with the iframe and make it visible
        **/
        makeIframeVisible: function(divId){
            //special code around iframe to make it visible  
            googletag.pubads().addEventListener('slotRenderEnded', function(event) {
                if(divId === 'YOUR_DIV' && event.isEmpty === false){
                    window.onload = function () { 
                         var iframe = $('YOUR_DIV').find('iframe');
                        iframe.height(YOUR_HEIGHT);
                        iframe.width(YOUR_WIDTH);
                    };
                }
            });                    
        },

        /**
        *   Refresh all the slots
        **/
        refreshAllSlots: function(){
            console.log("Ad Slots are REFRESHED.....");
            googletag.cmd.push(function() {
                $.each( allSlots, function( index, value ){
                    googletag.pubads().refresh([allSlots][index]);
                });
            });
        
        },

        /**
        *   Clear out all the slots
        **/
        clearAllSlots: function() {
            console.log('Ad Slots are CLEARED.....');
            googletag.cmd.push(function() {
                googletag.pubads().clear();
            });
         },

        /**
        *   Use this function to update the custom targetting value of a specific targetting attribute or add a new one
        *   based on the value of a textbox. - VERY USEFUL
        **/
        refreshSpecificSlot: function(divId, targetAttr, targetAttrVal) {
              googletag.cmd.push(function() {
                var slot = adSlot[divId];
                slot.addService(googletag.pubads());
                googletag.pubads().clear([slot]);

                slot.setTargeting(targetAttr, targetAttrVal);
                googletag.display(divId);
                if (options.debugEnabled == 'true') {
                    console.log(slot.getTargetingKeys());
                 }       
                googletag.pubads().refresh([slot]);
            
              }); 
            
        },

        /**
        *   Define out all the slots
        **/
        defineAdSlot: function (networkCode, unitName, adSize, divId, options) {
            this.init(divId, options);
            this.setNetwork(networkCode, unitName);
            this.additionalDebug();
            this.setTargettingAttributes(divId);
            if (options.debugEnabled == 'true') {
                console.log('-------------------------------------------------------------------------------------------------');
                console.log('Setting SLOT with options -- networkCode: ' + networkCode + 
                    ' -- adSize:' + adSize + ' -- divId:' + divId);
                console.log('-------------------------------------------------------------------------------------------------');
            }
            this.createAdSlot(adSize, divId);
            this.setCustomTargetting(divId);
            this.pushAdSlotDiv(divId);
            
            //uncomment the below function only if iframe is invisible due to some unforseen reason
            //this.makeIframeVisible(divId)
        }
    };
})(window);

