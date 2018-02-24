(() => {
	"use strict";
	
    var classNames = [ "external_links", "links", "apps", "instagram", "video", "group_share", "mem_link", "event_share", "wall_post_more", "likes", "comments" ];
    var cffvkFiltersSelector = classNames.map(function buildSelector(className) { return `.cffvk-${className}`; }).join();
    var css = { groups: "[id^='feed_repost-'], [id^='feed_reposts_'] { display: none; }", myGroups: "[id^='post-'].post_copy { display: none; }", groupsAndPeople: "[id^='feed_repost'] { display: none; }", filters: `${cffvkFiltersSelector} { display: none; }`, show: function show(rule) { return rule.replace(/none/g, "block"); } };
    
	var options = { groups: true, links: true, apps: true, group_share: true, event_share: true };

    function disable(tabId) {
        chrome.pageAction.setIcon({
            tabId,
            path: "img/disabled-icon16.png"
        });
        chrome.tabs.insertCSS(tabId, {
            code: css.show(css.groupsAndPeople + css.myGroups + css.filters)
        });
        chrome.tabs.sendMessage(tabId, {
            action: "disable"
        });
    }

    function execute(tabId) {
        if (options["is-disabled"]) {
            return disable(tabId);
        }
        var cssCode = css.show(css.groupsAndPeople + css.myGroups);
        if (options.groups) {
            var peopleCssCode = options.people ?
                css.groupsAndPeople :
                css.show(css.groupsAndPeople) + css.groups;
            var myGroupsCssCode = options.mygroups ?
                css.myGroups :
                css.show(css.myGroups);

            cssCode = peopleCssCode + myGroupsCssCode;
        }
        chrome.pageAction.setIcon({
            tabId,
            path: "img/icon16.png"
        });
        chrome.tabs.insertCSS(tabId, {
            code: cssCode + css.filters
        });
        chrome.tabs.sendMessage(tabId, {
            action: "clean",
            options
        });
    }

    function activate(sender) {
        if (/\/feed\?[wz]=/.test(sender.tab.url)) {
            return;
        }
        if (!sender.tab.url.includes("vk.com/feed") ||
            (/photos|videos|articles|likes|notifications|comments|updates|replies/)
            .test(sender.tab.url)
        ) {
            chrome.pageAction.hide(sender.tab.id);
            return disable(sender.tab.id);
        }
        chrome.storage.sync.get(function applyoptions(loadedoptions) {
            if (Object.keys(loadedoptions).length) {
                options = loadedoptions;
            } else {
                chrome.storage.sync.set(options);
            }
            execute(sender.tab.id);
        });
        chrome.pageAction.show(sender.tab.id);
    }

    chrome.runtime.onMessage.addListener(
        function handleMessage(message, sender) {
            if (message.action === "execute") {
                options = message.options;
                return execute(message.tabId);
            }
            if (message.action === "activate") {
                activate(sender);
            }
        }
    );
	
})();