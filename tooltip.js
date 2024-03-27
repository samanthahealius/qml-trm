document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(e) {
        // Hide any existing tooltips
        var existingTooltip = document.querySelector('.tooltip-content');
        if (existingTooltip) {
            existingTooltip.parentNode.removeChild(existingTooltip);
        }

        // Check if the clicked element is supposed to show a tooltip
        if (e.target.classList.contains('pseudo')) {
            e.preventDefault(); // Prevent the default link action

            var tooltipContent = e.target.getAttribute('data-tooltip');
            var tooltipDiv = document.createElement('div');
            tooltipDiv.classList.add('tooltip-content');
            tooltipDiv.innerHTML = tooltipContent;
            
            // Position the tooltip
            var rect = e.target.getBoundingClientRect();
            tooltipDiv.style.top = (window.scrollY + rect.top - rect.height) + 'px'; // Adjust this logic as needed
            tooltipDiv.style.left = (rect.left + window.scrollX) + 'px'; // Adjust this logic as needed

            document.body.appendChild(tooltipDiv);
            
            // Show the tooltip
            tooltipDiv.style.display = 'block';
        }
    }, false);

    // Optional: Hide tooltip when clicking anywhere else on the page
    document.addEventListener('click', function(e) {
        if (!e.target.classList.contains('pseudo')) {
            var existingTooltip = document.querySelector('.tooltip-content');
            if (existingTooltip) {
                existingTooltip.style.display = 'none';
            }
        }
    });
});
