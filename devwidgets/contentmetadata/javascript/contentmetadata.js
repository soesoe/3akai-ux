/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global $ */

var sakai = sakai || {};

sakai.api.UI.contentmetadata = sakai.api.UI.contentmetadata || {};
sakai.api.UI.contentmetadata.data = sakai.api.UI.contentmetadata.data || {};
sakai.api.UI.contentmetadata.render = sakai.api.UI.contentmetadata.render || {};

/**
 * @name sakai.contentmetadata
 *
 * @class contentmetadata
 *
 * @description
 * Initialize the contentmetadata widget
 *
 * @version 0.0.1
 * @param {String} tuid Unique id of the widget
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.contentmetadata = function(tuid,showSettings){


    ////////////////////////
    ////// VARIABLES ///////
    ////////////////////////

    // Containers
    var $contentmetadataDescriptionContainer = $("#contentmetadata_description_container");
    var $contentmetadataTagsContainer = $("#contentmetadata_tags_container");
    var $contentmetadataCopyrightContainer = $("#contentmetadata_copyright_container");
    var $contentmetadataDetailsContainer = $("#contentmetadata_details_container");
    var $contentmetadataLocationsContainer = $("#contentmetadata_locations_container");
    var $contentmetadataLocationsDialogContainer = $("#contentmetadata_locations_dialog_container");
    var contentmetadataLocationsNewLocationsContainer = "#contentmetadata_locations_newlocations_container";
    var contentmetadataLocationsSecondLevelTemplateContainer = "#contentmetadata_location_secondlevel_template_container";
    var contentmetadataLocationsThirdLevelTemplateContainer = "#contentmetadata_location_thirdlevel_template_container";

    // Dialogs
    var $contentmetadataLocationsDialog = $("#contentmetadata_locations_dialog");

    // Elements
    var contentmetadataDescriptionDisplay = "#contentmetadata_description_display";
    var $collapsibleContainers = $(".collapsible_container");
    var contentmetadataViewRevisions = "#contentmetadata_view_revisions";
    var $contentmetadataEditable = $(".contentmetadata_editable");
    var contentmetadataCancelSave = ".contentmetadata_cancel_save";
    var contentmetadataSave = ".contentmetadata_save";
    var contentmetadataInputEdit = ".contentmetadata_edit_input";
    var $contentmetadataLocationsAddAnother = $("#contentmetadata_locations_add_another");
    var contentmetadataLocationLvlOne = ".contentmetadata_location_directory_lvlone";
    var contentmetadataLocationLvlTwo = ".contentmetadata_location_directory_lvltwo";
    var contentmetadataLocationLvlThree = ".contentmetadata_location_directory_lvlthree";
    var $contentmetadataLocationsDialogUpdate = $("#contentmetadata_locations_dialog_update");
    var contentmetadataRemoveLocation = ".contentmetadata_remove_location";
    var contentmetadataRemoveNewLocation = ".contentmetadata_remove_new_location";

    // See more
    var $contentmetadataShowMore = $("#contentmetadata_show_more");
    var $contentmetadataSeeMore = $("#contentmetadata_see_more");
    var $contentmetadataSeeLess = $("#contentmetadata_see_less");

    // Templates
    var contentmetadataDescriptionTemplate = "contentmetadata_description_template";
    var contentmetadataTagsTemplate = "contentmetadata_tags_template";
    var contentmetadataCopyrightTemplate = "contentmetadata_copyright_template";
    var contentmetadataDetailsTemplate = "contentmetadata_details_template";
    var contentmetadataLocationsTemplate = "contentmetadata_locations_template";
    var contentmetadataLocationsDialogTemplate = "contentmetadata_locations_dialog_template";
    var contentmetadataLocationFirstLevelTemplate= "contentmetadata_location_firstlevel_template";
    var contentmetadataLocationSecondLevelTemplate= "contentmetadata_location_secondlevel_template";
    var contentmetadataLocationThirdLevelTemplate= "contentmetadata_location_thirdlevel_template";

    // i18n
    var $contentmetadataUpdatedCopyright = $("#contentmetadata_updated_copyright");

    // Edit vars
    // Parent DIV that handles the hover and click to edit
    var editTarget = "";
    // ID of Input element that's focused, defines what to update
    var edittingElement = "";
    var directoryJSON = {};

    ////////////////////////
    ////// RENDERING ///////
    ////////////////////////

    /**
     * Add binding to the input elements that allow editting
     * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
     */
    var addEditBinding = function(mode){
        if (mode === "edit") {
            if ($(".contentmetadata_edit_input")[0] !== undefined) {
                $(".contentmetadata_edit_input")[0].focus();
            }

            $(contentmetadataInputEdit).blur(editInputBlur);
        }
    }

    /**
     * Render the Description template
     * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
     */
    var renderDescription = function(mode){
        sakai.content_profile.content_data.mode = mode;
        $contentmetadataDescriptionContainer.html($.TemplateRenderer(contentmetadataDescriptionTemplate, sakai.content_profile.content_data));
        addEditBinding(mode);
    };

    var renderName = function(mode){
        sakai.content_profile.content_data.mode = mode;
        if (mode === "edit"){
            $("#contentmetadata_name_name").hide();
            $("#contentmetadata_name_text").val($.trim($("#contentmetadata_name_name").text()));
            $("#contentmetadata_name_edit").show(); 
            $("#contentmetadata_name_text").focus(); 
        }
        $("#contentmetadata_name_text").die("blur");
        $("#contentmetadata_name_text").bind("blur", function(){
            $("#contentmetadata_name_edit").hide();
            $("#contentmetadata_name_name").text($("#contentmetadata_name_text").val());
            $("#contentmetadata_name_name").show();
            $.ajax({
                url: "/p/" + sakai.content_profile.content_data.data["jcr:name"] + ".html",
                type : "POST",
                cache: false,
                data: {
                    "sakai:pooled-content-file-name":$("#contentmetadata_name_text").val()
                }, success: function(){
                    sakai.content_profile.content_data.data["sakai:pooled-content-file-name"] = $("#contentmetadata_name_text").val();
                }
            });
        });
    }

    /**
     * Render the Tags template
     * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
     */
    var renderTags = function(mode){
        sakai.content_profile.content_data.mode = mode;
        $contentmetadataTagsContainer.html($.TemplateRenderer(contentmetadataTagsTemplate, sakai.content_profile.content_data));
        addEditBinding(mode);
    };

    /**
     * Render the Copyright template
     * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
     */
    var renderCopyright = function(mode){
        sakai.content_profile.content_data.mode = mode;
        $contentmetadataCopyrightContainer.html($.TemplateRenderer(contentmetadataCopyrightTemplate, sakai.content_profile.content_data));
        addEditBinding(mode);
    };

    /**
     * Render the Details template
     * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
     */
    var renderDetails = function(mode){
        sakai.content_profile.content_data.mode = mode;
        $contentmetadataDetailsContainer.html($.TemplateRenderer(contentmetadataDetailsTemplate, sakai.content_profile.content_data));
        addEditBinding(mode);
    };

    var createActivity = function(activityMessage){
        var activityData = {
            "sakai:activityMessage": activityMessage
        }
        sakai.api.Activity.createActivity("/p/" + sakai.content_profile.content_data.data["jcr:name"], "content", "default", activityData);
    }

    //////////////////////////////////
    /////// DIRECTORY EDITTING ///////
    //////////////////////////////////

    /**
     * Update the select boxes on the stage
     * @param {String} select Containing ID to check which box value has been changed
     * @param {String} changedboxvalue Containing selected value
     * @param {String} firstlevelvalue Containing value of first select box
     */
    var updateDirectoryDisplay = function(select, changedboxvalue, firstlevelvalue){
        var obj = {
            "firstlevelvalue":firstlevelvalue.selected().val(),
            "changedboxvalue" : changedboxvalue.selected().val(),
            "directory": directoryJSON.directory
        };
        if(select === contentmetadataLocationLvlTwo){
            $(firstlevelvalue.parent().children(contentmetadataLocationsSecondLevelTemplateContainer)).html($.TemplateRenderer(contentmetadataLocationSecondLevelTemplate, obj));
        }else{
            $(firstlevelvalue.parent().children(contentmetadataLocationsThirdLevelTemplateContainer)).html($.TemplateRenderer(contentmetadataLocationThirdLevelTemplate, obj));
        }
    };

    var updateDirectory = function(){
        if(sakai.content_profile.content_data.data["sakai:tags"] == undefined){
            sakai.content_profile.content_data.data["sakai:tags"] = []
        }
        var originalTags = sakai.content_profile.content_data.data["sakai:tags"].slice(0);

        // Create tags for the directory structure
        // For every content_profile_basic_info_added_directory we create tags
        // Filter out ',' since that causes unwanted behavior when rendering
        $(".contentmetadata_added_directory").each(function(){
            if ($(this).find(contentmetadataLocationLvlOne).selected().val() !== "no_value" && $(this).find(contentmetadataLocationLvlOne).selected().val() !== undefined) {
                var directoryString = "directory/";
                if ($.inArray($(this).find(contentmetadataLocationLvlOne).selected().val().replace(/,/g, ""), sakai.content_profile.content_data.data["sakai:tags"]) < 0) {
                    sakai.content_profile.content_data.data["sakai:tags"].push($(this).find(contentmetadataLocationLvlOne).selected().val().replace(/,/g, ""));
                }
                directoryString += $(this).find(contentmetadataLocationLvlOne).selected().val().replace(/,/g, "");

                if ($(this).find(contentmetadataLocationLvlTwo).selected().val() !== "no_value" && $(this).find(contentmetadataLocationLvlTwo).selected().val() !== undefined) {
                    if ($.inArray($(this).find(contentmetadataLocationLvlTwo).selected().val().replace(/,/g, ""), sakai.content_profile.content_data.data["sakai:tags"]) < 0) {
                        sakai.content_profile.content_data.data["sakai:tags"].push($(this).find(contentmetadataLocationLvlTwo).selected().val().replace(/,/g, ""));
                    }
                    directoryString += "/" + $(this).find(contentmetadataLocationLvlTwo).selected().val().replace(/,/g, "");

                    if ($(this).find(contentmetadataLocationLvlThree).selected().val() !== "no_value" && $(this).find(contentmetadataLocationLvlThree).selected().val() !== undefined) {
                        if ($.inArray($(this).find(contentmetadataLocationLvlThree).selected().val().replace(/,/g, ""), sakai.content_profile.content_data.data["sakai:tags"]) < 0) {
                            sakai.content_profile.content_data.data["sakai:tags"].push($(this).find(contentmetadataLocationLvlThree).selected().val().replace(/,/g, ""));
                        }
                        directoryString += "/" + $(this).find(contentmetadataLocationLvlThree).selected().val().replace(/,/g, "");
                    }
                    
                }

                // Add string for all levels to tag array
                if ($.inArray(directoryString, sakai.content_profile.content_data.data["sakai:tags"]) < 0) {
                    sakai.content_profile.content_data.data["sakai:tags"].push(directoryString);
                }
            }
        });
        
        sakai.api.Util.tagEntity("/p/" + sakai.content_profile.content_data.data["jcr:name"], sakai.content_profile.content_data.data["sakai:tags"], originalTags, function(){
            sakai.content_profile.content_data.saveddirectory = sakai.content_profile.parseDirectoryTags(sakai.content_profile.content_data.data);
            $contentmetadataLocationsDialog.jqmHide();
            renderLocations(false);
            renderTags(false);
            // Create an activity
            createActivity("__MSG__UPDATED_LOCATIONS__");
        });
    };

    var changedLvlOne = function(el){
        $(el).parent().children(contentmetadataLocationsThirdLevelTemplateContainer).html("");
        $(el).children("option[value='no_value']").remove();
        updateDirectoryDisplay(contentmetadataLocationLvlTwo, $($(el).parent()).children(contentmetadataLocationLvlOne), $($(el).parent()).children(contentmetadataLocationLvlOne));
    };

    var changedLvlTwo = function(el){
        $(el).children("option[value='no_value']").remove();
        updateDirectoryDisplay(contentmetadataLocationLvlThree, $($(el).parent()).children(contentmetadataLocationLvlTwo), $($(el).parent().parent()).children(contentmetadataLocationLvlOne));
    };

    var changedLvlThree = function(el){
        $(el).children("option[value='no_value']").remove();
    };

    var removeDirectoryLocation = function(clickedParent){
        // Get current tags up to date
        currentTags = sakai.content_profile.content_data.data["sakai:tags"];
        // Extract tags from clickedParent
        var tags = [];
        tags = clickedParent[0].id.split(",");
        tags.push("directory/" + tags.toString().replace(/,/g,"/"));

        var tagsAfterDeletion = currentTags.slice(0);
        var sliced = 0;
        for (var tag in tags){
            if($.inArray(tags[tag],tagsAfterDeletion) > -1){
                tagsAfterDeletion.splice($.inArray(tags[tag],tagsAfterDeletion), 1);
            }
            for (dir in sakai.content_profile.content_data.saveddirectory) {
                if ($.inArray(tags[tag], sakai.content_profile.content_data.saveddirectory[dir]) > -1) {
                    sakai.content_profile.content_data.saveddirectory[dir].splice(tag + sliced, 1);
                    sliced -= 1;
                }
            }
        }

        clickedParent.remove();

        sakai.api.Util.tagEntity("/p/" + sakai.content_profile.content_data.data["jcr:name"], tagsAfterDeletion, currentTags, function(){
            sakai.content_profile.content_data.data["sakai:tags"] = tagsAfterDeletion;
            renderLocations(false);
        });
    };

    var renderLocationsEdit = function(){
        $contentmetadataLocationsDialog.jqmShow();

        // position dialog box at users scroll position
        var htmlScrollPos = $("html").scrollTop();
        var docScrollPos = $(document).scrollTop();

        if (htmlScrollPos > 0) {
            $contentmetadataLocationsDialog.css({
                "top": htmlScrollPos + 100 + "px"
            });
        }
        else 
            if (docScrollPos > 0) {
                $contentmetadataLocationsDialog.css({
                    "top": docScrollPos + 100 + "px"
                });
            }

        $(contentmetadataLocationLvlOne).live("change", function(){
            changedLvlOne(this);
        });

        $(contentmetadataLocationLvlTwo).live("change", function(){
            changedLvlTwo(this);
        });

        $(contentmetadataLocationLvlThree).live("change", function(){
            changedLvlThree(this);
        });

        $contentmetadataLocationsDialogUpdate.bind("click", function(){
            updateDirectory();
        });

        $(contentmetadataRemoveLocation).live("click", function(){
            removeDirectoryLocation($(this).parent());
        })

        $(contentmetadataRemoveNewLocation).live("click", function(){
            $(this).parent().remove();
        })

        $contentmetadataLocationsDialogContainer.html($.TemplateRenderer(contentmetadataLocationsDialogTemplate, sakai.content_profile.content_data));
    };

    /**
     * Render the Locations template
     * @param {String|Boolean} mode Can be false or 'edit' depending on the mode you want to be in
     */
    var renderLocations = function(mode){
        if (mode === "edit") {
            renderLocationsEdit();
        }
        else {
            $contentmetadataLocationsContainer.html("");
            sakai.content_profile.content_data.mode = mode;
            $contentmetadataLocationsContainer.html($.TemplateRenderer(contentmetadataLocationsTemplate, sakai.content_profile.content_data));
            applyThreeDots();
        }
    };

    /**
     * Get a list of nodes representing the directory structure to be rendered
     */
    var getDirectoryStructure = function(){
        directoryJSON.directory = [];
        // Get directory structure from config file
        for (var i in sakai.config.Directory) {
            if (sakai.config.Directory.hasOwnProperty(i)) {
                // Create first level of content
                var temp = {};
                temp.name = i;

                // Create second level of content
                temp.secondlevels = [];
                for (var j in sakai.config.Directory[i]) {
                    if (sakai.config.Directory[i].hasOwnProperty(j)) {
                        var secondlevel = {};
                        secondlevel.name = j;

                        // Create third level of content
                        secondlevel.thirdlevels = [];
                        for (var k in sakai.config.Directory[i][j]) {
                            if (sakai.config.Directory[i][j].hasOwnProperty(k)) {
                                var thirdlevel = {};
                                thirdlevel.name = sakai.config.Directory[i][j][k];
                                secondlevel.thirdlevels.push(thirdlevel);
                            }
                        }

                        temp.secondlevels.push(secondlevel);
                    }
                }
                directoryJSON.directory.push(temp);
            }
        }
        return directoryJSON;
    };

    var addAnotherLocation = function(){
        $("#contentmetadata_no_locations").remove();
        var directory = getDirectoryStructure();
        var renderedTemplate = $.TemplateRenderer(contentmetadataLocationFirstLevelTemplate, directory);
        var renderedDiv = $(document.createElement("div"));
        renderedDiv.html(renderedTemplate);
        $(contentmetadataLocationsNewLocationsContainer).append(renderedDiv);
        $(renderedDiv).addClass("contentmetadata_added_directory");
    }

    ////////////////////////
    /////// EDITTING ///////
    ////////////////////////

    var updateTags = function() {
        var tags = sakai.api.Util.formatTags($("#contentmetadata_tags_tags").val());
        // Since directory tags are filtered out of the textarea we should put them back to save them
        $(sakai.content_profile.content_data.data["sakai:tags"]).each(function(index, tag){
            if(tag.split("/")[0] === "directory"){
                tags.push(tag);
            };
        })
        sakai.api.Util.tagEntity("/p/" + sakai.content_profile.content_data.data["jcr:name"], tags, sakai.content_profile.content_data.data["sakai:tags"], function(){
            sakai.content_profile.content_data.data["sakai:tags"] = tags;
            renderTags(false);
            // Create an activity
            createActivity("__MSG__UPDATED_TAGS__");
        });
    };

    /**
     * Update the description of the content
     */
    var updateDescription = function(){
        $.ajax({
            url: "/p/" + sakai.content_profile.content_data.data["jcr:name"] + ".html",
            type : "POST",
            cache: false,
            data: {
                "sakai:description":$("#contentmetadata_description_description").val()
            }, success: function(){
                sakai.content_profile.content_data.data["sakai:description"] = $("#contentmetadata_description_description").val();
                renderDescription(false);
                // Create an activity
                createActivity("__MSG__UPDATED_DESCRIPTION__");
            }
        });
    }

    /**
     * Update the copyright of the content
     */
    var updateCopyright = function(){
        $.ajax({
            url: "/p/" + sakai.content_profile.content_data.data["jcr:name"] + ".html",
            type : "POST",
            cache: false,
            data: {
                "sakai:copyright":$("#contentmetadata_copyright_copyright").val()
            }, success: function(){
                sakai.content_profile.content_data.data["sakai:copyright"] = $("#contentmetadata_copyright_copyright").val();
                renderCopyright(false);
                // Create an activity
                createActivity("__MSG__UPDATED_COPYRIGHT__");
            }
        });
    }

    /**
     * Capitalize first letter of every word in the string
     */
    String.prototype.capitalize = function(){
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    /**
     * Trigger the template to render the edit mode
     * @param {Object} ev Trigger event
     */
    var editData = function(ev){
        if (ev.target.nodeName.toLowerCase() !== "a" && ev.target.nodeName.toLowerCase() !== "select" && ev.target.nodeName.toLowerCase() !== "option") {
            target = $(ev.target).closest(".contentmetadata_editable");
            if (target[0] !== undefined) {
                editTarget = target;
                var dataToEdit = editTarget[0].id.split("_")[1];
                eval("render" + dataToEdit.capitalize() + "(\"edit\")");
            }
        }
    };

    /**
     * Handle losing of focus on an input element
     * @param {Object} el Element that lost the focus
     */
    var editInputBlur = function(el){
        edittingElement = $(el.target)[0].id.split("_")[2];
        switch (edittingElement){
            case "description":
                updateDescription();
                break;
            case "tags":
                updateTags();
                break;
            case "copyright":
                updateCopyright();
                break;
        }
    };

    ////////////////////////
    //////// SET-UP ////////
    ////////////////////////

    var applyThreeDots = function(){
        // make sure the newly added content is properly styled with
        // threedots truncation
        $(".threedots_text").ThreeDots({
            max_rows: 1,
            text_span_class: "ellipsis_text",
            e_span_class: "threedots_a",
            whole_word: false,
            alt_text_t: true
        });
    };

    /**
     * Animate the hidden or shown data containers
     */
    var animateData = function(){
        $collapsibleContainers.animate({
            'margin-bottom': 'toggle',
            opacity: 'toggle',
            'padding-top': 'toggle',
            'padding-bottom': 'toggle',
            height: 'toggle'
        }, 400, function(){
            applyThreeDots();
        });
        $("#contentmetadata_show_more span").toggle();
    };

    /**
     * Add binding/events to the elements in the widget
     */
    var addBinding = function(){
        $(".contentmetadata_editable_for_maintainers").removeClass("contentmetadata_editable");
        if (sakai.content_profile.content_data.isManager) {
            $(".contentmetadata_editable_for_maintainers").addClass("contentmetadata_editable");
        }
        
        $contentmetadataShowMore.unbind("click", animateData);
        $contentmetadataShowMore.bind("click", animateData);

        $(".contentmetadata_editable").die("click", editData);
        $(".contentmetadata_editable").live("click", editData);

        $(contentmetadataViewRevisions).die("click");
        $(contentmetadataViewRevisions).live("click", function(){
            sakai.filerevisions.initialise(sakai.content_profile.content_data)
        });

        $contentmetadataLocationsAddAnother.unbind("click", addAnotherLocation);
        $contentmetadataLocationsAddAnother.bind("click", addAnotherLocation);
    };

    /**
     * Initialize the widget
     */
    var doInit = function(){
        // This will make the widget popup as a layover.
        $contentmetadataLocationsDialog.jqm({
            modal: true,
            toTop: true
        });

        // Render all information
        renderDescription(false);
        renderTags(false);
        renderCopyright(false);
        renderLocations(false);
        renderDetails(false);

        // Add binding
        addBinding();
    };

    $(window).bind("sakai-fileupload-complete", function(){sakai.content_profile.loadContentProfile(renderDetails);})

    /**
     * Initialize the widget from outside of the widget
     */
    sakai.api.UI.contentmetadata.render = function(){
        doInit();
    };

    sakai.contentmetadata.isReady = true;
    doInit();

};

sakai.api.Widgets.widgetLoader.informOnLoad("contentmetadata");