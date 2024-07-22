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
document.addEventListener('click', function(event) {
    const toggleButton = document.querySelector('.p-contextual-menu__toggle');
    const dropdownMenu = document.querySelector('.p-contextual-menu__dropdown');
    const isClickInsideMenu = dropdownMenu.contains(event.target) || toggleButton.contains(event.target);

    if (!isClickInsideMenu) {
        dropdownMenu.setAttribute('aria-hidden', 'true');
        toggleButton.setAttribute('aria-expanded', 'false'); 
    }
});

document.querySelector('.p-contextual-menu__toggle').addEventListener('click', function(event) {
    const dropdownMenu = document.querySelector('.p-contextual-menu__dropdown');
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    
    dropdownMenu.setAttribute('aria-hidden', isExpanded);
    this.setAttribute('aria-expanded', !isExpanded);
});
//endregion
