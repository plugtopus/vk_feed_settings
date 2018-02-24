(() => {
	"use strict";
	
    var selectors = {
        apps: ".wall_post_source_default",
        instagram: ".wall_post_source_instagram",
        video: ".wall_text .page_post_thumb_video",
        group_share: ".page_group_share",
        mem_link: ".mem_link[mention_id^='club']",
        event_share: ".event_share",
        external_links: ".wall_text [href^='/away.php?to=']:not(.wall_post_source_icon)",
        wall_post_more: ".wall_post_more",
        likes: ".post_like.no_likes",
        comments: ".reply_link:not(._reply_lnk)"
    };

    var feed = document.querySelector("#feed_rows");
    var settings;

    function find(settingName) {
        function processFeedRow(feedRow) {
            var newClassName = `cffvk-${settingName}`;

            if (settings[settingName]) {
                return feedRow.classList.add(newClassName);
            }

            feedRow.classList.remove(newClassName);
        }

        var elements = feed.querySelectorAll(selectors[settingName]);

        elements
            .map(function getClosestFeedRow(element) {
                return element.closest(".feed_row");
            })
            .filter(function isTruthy(element) {
                return element;
            })
            .filter(function isNotAd(element) {
                return element.querySelector(
                    ".wall_text_name_explain_promoted_post, .ads_ads_news_wrap"
                ) === null;
            })
            .forEach(processFeedRow);
    }

    function clean() {
        Object.keys(selectors).forEach(find);
    }

    function removeInlineStyles() {
        var posts = feed.querySelectorAll(".feed_row");
        posts.forEach(function removeInlineStyle(post) {
            post.removeAttribute("style");
        });
        scroll(0, 0);
    }

    function startUrlCheck() {
        var url = location.href;
        var intervalDuration = 100;

        function checkUrl() {
			if (location.href.indexOf("vk.com")) {
                chrome.runtime.sendMessage({
                    action: "activate"
                });
			} else {
                chrome.runtime.sendMessage({
                    action: "disable"
                });
			}
        }

        setInterval(checkUrl, intervalDuration);
    }

    NodeList.prototype.forEach = NodeList.prototype.forEach || Array.prototype.forEach;
    NodeList.prototype.map = NodeList.prototype.map || Array.prototype.map;

    var observer = new MutationObserver(function processMutations(mutations) {
        if (mutations[0].addedNodes.length > 0) {
            clean();
        }
    });

    chrome.runtime.onMessage.addListener(function handleMessage(message) {
        if (message.action === "clean") {
            feed = document.querySelector("#feed_rows");
            observer.disconnect();
            observer.observe(feed, {
                childList: true,
                subtree: true
            });
            document.querySelector("#feed_new_posts")
                .addEventListener("click", removeInlineStyles);
            settings = message.settings;

            return clean();
        }

        if (message.action === "disable") {
            observer.disconnect();
        }
    });

    chrome.runtime.sendMessage({
        action: "activate"
    });
	
    startUrlCheck();
	
})();