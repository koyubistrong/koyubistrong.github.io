(function () {
    var storageKey = "koyubi-theme";
    var themeToggleId = "theme_toggle";
    var darkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    var validThemes = {
        light: true,
        dark: true
    };

    function getStoredTheme() {
        try {
            var theme = localStorage.getItem(storageKey);
            return validThemes[theme] ? theme : null;
        }
        catch (error) {
            return null;
        }
    }

    function storeTheme(theme) {
        try {
            localStorage.setItem(storageKey, theme);
        }
        catch (error) {
            // Keep the selected theme for the current page even when storage is unavailable.
        }
    }

    function prefersDark() {
        return darkQuery ? darkQuery.matches : false;
    }

    function getEffectiveTheme(theme) {
        if (theme == "light" || theme == "dark") {
            return theme;
        }
        return prefersDark() ? "dark" : "light";
    }

    function applyTheme(theme) {
        if (theme == "light" || theme == "dark") {
            document.documentElement.setAttribute("data-theme", theme);
        }
        else {
            document.documentElement.removeAttribute("data-theme");
        }
    }

    function syncToggle(toggle, theme) {
        var effectiveTheme = getEffectiveTheme(theme);
        var text = toggle.querySelector(".theme-toggle__text");

        toggle.setAttribute("aria-pressed", effectiveTheme == "dark" ? "true" : "false");
        toggle.setAttribute("title", effectiveTheme == "dark" ? "Dark" : "Light");

        if (text) {
            text.textContent = effectiveTheme == "dark" ? "Dark" : "Light";
        }
    }

    function initThemeToggle() {
        var theme = getStoredTheme();
        var toggle = document.getElementById(themeToggleId);

        applyTheme(theme);

        if (!toggle) {
            return;
        }

        syncToggle(toggle, theme);

        toggle.addEventListener("click", function () {
            theme = getEffectiveTheme(theme) == "dark" ? "light" : "dark";
            storeTheme(theme);
            applyTheme(theme);
            syncToggle(toggle, theme);
        });

        if (darkQuery && darkQuery.addEventListener) {
            darkQuery.addEventListener("change", function () {
                if (!getStoredTheme()) {
                    syncToggle(toggle, null);
                }
            });
        }
    }

    applyTheme(getStoredTheme());

    if (document.readyState == "loading") {
        document.addEventListener("DOMContentLoaded", initThemeToggle);
    }
    else {
        initThemeToggle();
    }
})();
