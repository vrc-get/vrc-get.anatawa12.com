//region Accordions
document.addEventListener('DOMContentLoaded', () => {
    const accordionGroups = document.querySelectorAll('.p-accordion__group');

    accordionGroups.forEach(group => {
        const button = group.querySelector('.p-accordion__tab');
        const panel = group.querySelector('.p-accordion__panel');

        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            // Toggle aria-expanded on the button
            button.setAttribute('aria-expanded', !isExpanded);

            // Toggle aria-hidden on the panel
            panel.setAttribute('aria-hidden', isExpanded);

            // Optionally, you can add visual cues here (e.g., change button styles, slide the panel)
        });
    });
});
//endregion

//region Dropdown buttons
const contextToggle = document.querySelector('.p-contextual-menu__toggle');
const dropdownMenu = document.querySelector('.p-contextual-menu__dropdown');
if (contextToggle && dropdownMenu) {
    document.addEventListener('click', function (event) {
        const isClickInsideMenu = dropdownMenu.contains(event.target) || contextToggle.contains(event.target);

        if (!isClickInsideMenu) {
            dropdownMenu.setAttribute('aria-hidden', 'true');
            contextToggle.setAttribute('aria-expanded', 'false');
        }
    });

    contextToggle.addEventListener('click', function (event) {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';

        dropdownMenu.setAttribute('aria-hidden', isExpanded);
        this.setAttribute('aria-expanded', !isExpanded);
    });
}
//endregion

//region Nav dropdown
function toggleDropdown(toggle, open) {
    var parentElement = toggle.parentNode;
    var dropdown = document.getElementById(toggle.getAttribute('aria-controls'));

    if (open) {
        parentElement.classList.add('is-active');
        dropdown.style.display = 'block';
    } else {
        parentElement.classList.remove('is-active');
        dropdown.style.display = 'none';
    }
}

function closeAllDropdowns(toggles) {
    toggles.forEach(function (toggle) {
        toggleDropdown(toggle, false);
    });
}

function handleClickOutside(toggles, containerClasses) {
    document.addEventListener('click', function (event) {
        var target = event.target;

        if (!containerClasses.some(container => target.closest(container))) {
            closeAllDropdowns(toggles);
        }
    });
}

function initNavDropdowns(containerClasses) {
    // var toggles = document.querySelectorAll(containerClass + ' [aria-controls]');
    var toggles = [];
    for (const container of containerClasses) {
        toggles.push(...document.querySelectorAll(container + ' [aria-controls]'));
    }

    handleClickOutside(toggles, containerClasses);

    toggles.forEach(function (toggle) {
        toggle.addEventListener('click', function (e) {
            e.preventDefault();

            const shouldOpen = !toggle.parentNode.classList.contains('is-active');
            closeAllDropdowns(toggles);
            toggleDropdown(toggle, shouldOpen);
        });
    });
}

initNavDropdowns([ '.p-navigation__item', '.p-navigation__item--dropdown-toggle' ]);
//endregion
