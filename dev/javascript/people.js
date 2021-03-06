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

require(["jquery","sakai/sakai.api.core"], function($, sakai) {
    sakai_global._search = {};
    sakai_global.search = function(){

        /*
            Config variables
         */

        var peopleToSearch = 6;

        var meObj = false;
        var foundContacts = false;
        var foundInvitations = false;
        var foundPending = false;
        var currentpage = 0;
        var profiles = {};
        var myfriends = false;

        var doInit = function(){

            meObj = sakai.data.me;

            loadContacts(1);
            loadInvitations();
            loadPending();

        };

        /*
            People search
        */

        // Pager click handler
        var pager_click_handler = function(pageclickednumber){
            currentpage = pageclickednumber;
            loadContacts(currentpage);
        };

        var errorText = $("#people_an_error_has_occurred").text();
        var errorHTML = $("#people_error").html();
        var loadingHTML = $("#people_loading").html();

        loadContacts = function(page){

            currentpage = parseInt(page, 10);

            // Set searching messages

            $("#contacts_search_result").html(loadingHTML);

            $.ajax({
                url: sakai.config.URL.SEARCH_USERS_ACCEPTED + "?state=ACCEPTED&page=" + (page - 1) + "&items=" + peopleToSearch,
                cache: false,
                success: function(data){
                    foundContacts = $.extend(data, {}, true);
                    renderContacts();
                },
                error: function(xhr, textStatus, thrownError) {
                    $("#contacts_search_result").html(errorHTML);
                }
            });

        };

        var _currentTotal = 0;

        var renderContacts = function(){

            var finaljson = {};
            finaljson.items = [];

            _currentTotal = foundContacts.total;

            // Pager Init
            $(".jq_pager").pager({ pagenumber: currentpage, pagecount: Math.ceil(_currentTotal/peopleToSearch), buttonClickCallback: pager_click_handler });

            if (foundContacts.results) {
                for (var i = 0, j = foundContacts.results.length; i < j; i++) {

                    var item = foundContacts.results[i];
                    var person = item.profile;
                    var connection = item.details;
                    profiles[item.target] = item;
                    profiles[item.target].profile.uuid = item.target;
                    if (person) {
                        var index = finaljson.items.length;
                        finaljson.items[index] = {};
                        finaljson.items[index].userid = item.target;
                        if (person.picture && $.parseJSON(person.picture).name) {
                            var picture = $.parseJSON(person.picture);
                            finaljson.items[index].picture = "/~" + person["rep:userId"] + "/public/profile/" + picture.name;
                        } else if (person.basic.elements.picture && $.parseJSON(person.basic.elements.picture.value).name) {
                            var picture = $.parseJSON(person.basic.elements.picture.value);
                            finaljson.items[index].picture = "/~" + person["rep:userId"] + "/public/profile/" + picture.name;
                        }
                        if (sakai.api.User.getDisplayName(person) !== "") {
                            finaljson.items[index].name = sakai.api.User.getDisplayName(person);
                        }
                        else {
                            finaljson.items[index].name = finaljson.items[index].userid;
                        }

                        var relationships = connection["sakai:types"];
                        // if there are more than 3 connection type display 2 connection,...
                        if (relationships.length < 3) {
                            finaljson.items[index].extra = relationships;
                        } else {
                            finaljson.items[index].extra = relationships[0] + ", "+ relationships[1]+ ", ...";
                        }
                        finaljson.items[index].connected = true;
                        if (finaljson.items[index].userid == sakai.data.me.user.userid){
                            finaljson.items[index].isMe = true;
                        }
                    }
                }
            }

            // if there is more than one page show the pager
            if (Math.ceil(_currentTotal/peopleToSearch) > 1) {
                $(".jq_pager").show();
            } else {
                $(".jq_pager").hide();
            }

            $("#contacts_search_result").html(sakai.api.Util.TemplateRenderer("contacts_search_result_template", finaljson));

            $(".link_remove_contact").bind("click", function(ev){
                var user = this.id.substring(20);

                $.ajax({
                    url: "/~" + sakai.data.me.user.userid + "/contacts.remove.html",
                    type: "POST",
                    data : {"_charset_":"utf-8",
                        "targetUserId": user},
                    success: function(data){
                        setTimeout(loadContacts,500,[1]);

                        // remove from json file

                        var index = -1;
                        for (var i = 0, j = foundContacts.results.length; i<j; i++){
                            if (foundContacts.results[i].target == user){
                                index = i;
                            }
                        }
                        foundContacts.results.splice(index,1);

                    },
                    error: function(xhr, textStatus, thrownError) {
                        sakai.api.Util.notification.show(errorText,"",sakai.api.Util.notification.type.ERROR);
                    }
                });

            });
        };

        /*
            Invitation search
        */

        loadInvitations = function(){

            // Set searching messages

            $("#invited_search_result").html(loadingHTML);

            $.ajax({
                url: sakai.config.URL.SEARCH_USERS_ACCEPTED + "?state=INVITED&page=0&items=100",
                cache: false,
                success: function(data){
                    foundInvitations = $.extend(data, {}, true);
                    renderInvitations();
                },
                error: function(xhr, textStatus, thrownError) {
                    $("#invited_search_result").html(errorHTML);
                }
            });

        };

        var renderInvitations = function(){

            var finaljson = {};
            finaljson.items = [];

            if (foundInvitations.results) {
                for (var i = 0; i < foundInvitations.results.length; i++) {
                    var item = foundInvitations.results[i];
                    var person = item.profile;
                    var connection = item.details;
                    if (person) {
                        var index = finaljson.items.length;
                        profiles[item.target] = item;
                        profiles[item.target].profile.uuid = item.target;
                        finaljson.items[index] = {};
                        finaljson.items[index].userid = item.target;
                        if (person.picture && $.parseJSON(person.picture).name) {
                            var picture = $.parseJSON(person.picture);
                            finaljson.items[index].picture = "/~" + person["rep:userId"] + "/public/profile/" + picture.name;
                        } else if (person.basic.elements.picture && $.parseJSON(person.basic.elements.picture.value).name) {
                            var picture = $.parseJSON(person.basic.elements.picture.value);
                            finaljson.items[index].picture = "/~" + person["rep:userId"] + "/public/profile/" + picture.name;
                        }
                        if (sakai.api.User.getDisplayName(person) !== "") {
                            finaljson.items[index].name = sakai.api.User.getDisplayName(person);
                        }
                        else {
                            finaljson.items[index].name = finaljson.items[index].userid;
                        }
                        var relationships = connection["sakai:types"];

                        // if there are more than 3 connection type display 2 connection,...
                        if (relationships.length < 3) {
                            finaljson.items[index].extra = relationships;
                        } else {
                            finaljson.items[index].extra = relationships[0] + ", "+ relationships[1]+ ", ...";
                        }
                        finaljson.items[index].connected = true;

                        if (finaljson.items[index].userid == sakai.data.me.user.userid){
                            finaljson.items[index].isMe = true;
                        }
                    }
                }
            }

            $("#invited_search_result").html(sakai.api.Util.TemplateRenderer("invited_search_result_template", finaljson));

            $(".link_accept_contact").bind("click", function(ev){
                var user = this.id.substring(20);

                $.ajax({
                    url: "/~" + sakai.data.me.user.userid + "/contacts.accept.html",
                    type: "POST",
                    data : {"targetUserId": user},
                    success: function(data){
                        setTimeout(loadContacts,500,[1]);

                        // remove from json file

                        var index = -1;
                        for (var i = 0, j = foundInvitations.results.length; i<j; i++){
                            if (foundInvitations.results[i].target == user){
                                index = i;
                            }
                        }
                        foundInvitations.results.splice(index,1);

                        // rerender

                        renderInvitations();

                    },
                    error: function(xhr, textStatus, thrownError) {
                        sakai.api.Util.notification.show(errorText,"",sakai.api.Util.notification.type.ERROR);
                    }
                });

            });

        };


        /*
            Pending search
        */

        loadPending = function(){

            // Set searching messages

            $("#invited_search_result").html(loadingHTML);

            $.ajax({
                url: sakai.config.URL.SEARCH_USERS_ACCEPTED + "?state=PENDING&page=0&items=100",
                cache: false,
                success: function(data){
                    foundPending = $.extend(data, {}, true);
                    renderPending();
                },
                error: function(xhr, textStatus, thrownError) {
                    $("#pending_search_result").html(errorHTML);
                }
            });

        };

        var renderPending = function(){

            var finaljson = {};
            finaljson.items = [];

            if (foundPending.results) {
                for (var i = 0; i < foundPending.results.length; i++) {
                    var item = foundPending.results[i];
                    var person = item.profile;
                    var connection = item.details;
                    if (person) {
                        var index = finaljson.items.length;
                        profiles[item.target] = item;
                        profiles[item.target].profile.uuid = item.target;
                        finaljson.items[index] = {};
                        finaljson.items[index].userid = item.target;
                        if (person.picture && $.parseJSON(person.picture).name) {
                            var picture = $.parseJSON(person.picture);
                            finaljson.items[index].picture = "/~" + person["rep:userId"] + "/public/profile/" + picture.name;
                        } else if (person.basic.elements.picture && $.parseJSON(person.basic.elements.picture.value).name) {
                            var picture = $.parseJSON(person.basic.elements.picture.value);
                            finaljson.items[index].picture = "/~" + person["rep:userId"] + "/public/profile/" + picture.name;
                        }
                        if (sakai.api.User.getDisplayName(person) !== "") {
                            finaljson.items[index].name = sakai.api.User.getDisplayName(person);
                        }
                        else {
                            finaljson.items[index].name = finaljson.items[index].userid;
                        }
                        var relationships = connection["sakai:types"];
                        // if there are more than 3 connection type display 2 connection,...
                        if (relationships.length < 3) {
                            finaljson.items[index].extra = relationships;
                        } else {
                            finaljson.items[index].extra = relationships[0] + ", "+ relationships[1]+ ", ...";
                        }
                        finaljson.items[index].connected = true;

                        if (finaljson.items[index].userid == sakai.data.me.user.userid){
                            finaljson.items[index].isMe = true;
                        }
                    }
                }
            }

            $("#pending_search_result").html(sakai.api.Util.TemplateRenderer("pending_search_result_template", finaljson));

        };

        $(".person_message_link").live("click", function(ev){

            var userid = this.id.split("_")[this.id.split("_").length - 1];
            if (profiles[userid]){
                $(window).trigger("initialize.sendmessage.sakai", [profiles[userid].profile]);
            }

        });

        doInit();

    };

    sakai.api.Widgets.Container.registerForLoad("search");

});
