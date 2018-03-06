(() => {
    "use strict";

    function setSettingsPage(settings) {
		
        var checkboxes = document.querySelectorAll("input");

        function hideLabel(label) {
            var checkbox = label.children[0];
            label.style.display = "none";
            checkbox.checked = false;
            settings[checkbox.name] = false;
        }

        function hideOrShowSomeCheckboxes() {
            var labels2and3 = [
                document.querySelector("#mygroups-label"),
                document.querySelector("#people-label")
            ];
            var linksLabel = document.querySelector("#links-label");

            checkboxes.forEach(function setDisabledState(checkbox) {
                if (checkbox.name !== "is-disabled") {
                    checkbox.disabled = Boolean(settings["is-disabled"]);
                }
            });

            labels2and3.forEach(function setLabels2and3(label) {
                if (settings.groups) {
                    label.style.display = "block";

                    return;
                }

                hideLabel(label);
            });

            if (settings.external_links) {
                return hideLabel(linksLabel);
            }

            linksLabel.style.display = "block";
        }

        function handleClick(event) {
            settings[event.target.name] = event.target.checked;
            hideOrShowSomeCheckboxes();
            chrome.storage.sync.set(settings);
            chrome.tabs.query(
                {
                    currentWindow: true,
                    active: true
                },
                function sendMessage(tabs) {
                    chrome.runtime.sendMessage({
                        tabId: tabs[0].id,
                        action: "execute",
                        settings
                    });
                }
            );
        }

        hideOrShowSomeCheckboxes();

        checkboxes.forEach(function setUpCheckbox(checkbox) {
            checkbox.addEventListener("click", handleClick);
            checkbox.checked = Boolean(settings[checkbox.name]);
        });
    }

    NodeList.prototype.forEach = NodeList.prototype.forEach || Array.prototype.forEach;

    chrome.storage.sync.get(setSettingsPage);
	
}());
