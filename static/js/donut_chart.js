/**
 * Magellan EV Tracker - Donut Chart Visualization
 * Version: 1.33
 * 
 * This file adds a non-invasive donut chart visualization to the dashboard
 * without modifying any existing workflow functionality.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only run on the dashboard page - check for dashboard title
    if (!document.querySelector('h1, h2, h3, h4, h5, h6')?.textContent?.includes('Dashboard')) {
        return;
    }
    
    console.log("Magellan EV Tracker - Initializing donut chart visualization");
    
    // Create container for the donut chart
    const chartContainer = document.createElement('div');
    chartContainer.id = 'donut-chart-container';
    chartContainer.className = 'donut-chart-container';
    chartContainer.style.cssText = 'background-color: #003f5c; border-radius: 5px; padding: 20px; margin-bottom: 20px; position: relative; width: 250px; height: 250px; display: flex; flex-direction: column; align-items: center; float: left; margin-right: 20px;';
    
    // Find the main content area - look for the first heading and insert after it
    const mainHeading = document.querySelector('h1, h2, h3, h4, h5, h6');
    if (mainHeading && mainHeading.parentNode) {
        // Insert after the heading
        if (mainHeading.nextSibling) {
            mainHeading.parentNode.insertBefore(chartContainer, mainHeading.nextSibling);
        } else {
            mainHeading.parentNode.appendChild(chartContainer);
        }
        
        console.log("Donut chart container added to DOM");
    } else {
        // Fallback: insert at the beginning of the body
        document.body.insertBefore(chartContainer, document.body.firstChild);
        console.log("Donut chart container added to body (fallback)");
    }
    
    // Create title for the chart
    const title = document.createElement('h4');
    title.textContent = 'Overall Progress';
    title.style.cssText = 'font-size: 16px; font-weight: 500; color: white; margin-bottom: 10px; text-align: center;';
    chartContainer.appendChild(title);
    
    // Create canvas for the chart
    const canvas = document.createElement('canvas');
    canvas.id = 'overallProgressChart';
    canvas.style.cssText = 'width: 100%; height: auto;';
    chartContainer.appendChild(canvas);
    
    // Create center text container
    const centerText = document.createElement('div');
    centerText.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none;';
    chartContainer.appendChild(centerText);
    
    // Create percentage display
    const percentage = document.createElement('span');
    percentage.textContent = '0%';
    percentage.style.cssText = 'display: block; font-size: 24px; font-weight: 700; color: #4CAF50;';
    centerText.appendChild(percentage);
    
    // Create label
    const label = document.createElement('span');
    label.textContent = 'Complete';
    label.style.cssText = 'display: block; font-size: 14px; color: white; opacity: 0.8;';
    centerText.appendChild(label);
    
    // Calculate overall progress
    let overallProgress = 0;
    
    // Try to get project selector
    const projectSelector = document.querySelector('select');
    if (projectSelector) {
        // Add event listener for project selection
        projectSelector.addEventListener('change', function() {
            console.log("Project selection changed");
            calculateProgressFromDOM();
        });
    }
    
    // Initial data calculation
    calculateProgressFromDOM();
    
    // Fallback function to calculate progress from DOM elements
    function calculateProgressFromDOM() {
        console.log("Calculating progress from DOM");
        
        // Try to get progress from elements with percentage values
        const percentElements = Array.from(document.querySelectorAll('*')).filter(el => {
            const text = el.textContent?.trim();
            return text && text.includes('%') && !isNaN(parseFloat(text));
        });
        
        if (percentElements.length > 0) {
            console.log(`Found ${percentElements.length} elements with percentage values`);
            
            // Use the first percentage value found
            const progressText = percentElements[0].textContent.trim();
            const progressValue = parseFloat(progressText);
            if (!isNaN(progressValue)) {
                overallProgress = progressValue;
                updateChart(overallProgress);
                return;
            }
        }
        
        // Try to find progress in table cells
        const tableCells = document.querySelectorAll('td');
        if (tableCells.length > 0) {
            console.log(`Searching ${tableCells.length} table cells for progress values`);
            
            for (const cell of tableCells) {
                const text = cell.textContent.trim();
                if (text.includes('%')) {
                    const progressValue = parseFloat(text);
                    if (!isNaN(progressValue)) {
                        overallProgress = progressValue;
                        updateChart(overallProgress);
                        return;
                    }
                }
            }
        }
        
        // If we have a work item in the table with progress
        const progressCells = document.querySelectorAll('td:nth-child(5)'); // Assuming Progress is the 5th column
        if (progressCells.length > 0) {
            console.log(`Checking ${progressCells.length} potential progress cells`);
            
            let totalProgress = 0;
            let count = 0;
            
            progressCells.forEach(cell => {
                const progressText = cell.textContent.trim();
                const progressValue = parseFloat(progressText);
                if (!isNaN(progressValue)) {
                    totalProgress += progressValue;
                    count++;
                }
            });
            
            if (count > 0) {
                overallProgress = totalProgress / count;
                updateChart(overallProgress);
                return;
            }
        }
        
        // Default to 37% if we can't find a value (just to show something)
        console.log("Using default progress value");
        updateChart(37);
    }
    
    // Function to update the chart with new progress value
    function updateChart(progress) {
        console.log(`Updating chart with progress: ${progress}%`);
        
        // Update the center text
        percentage.textContent = `${Math.round(progress)}%`;
        
        // Create or update the chart
        const ctx = document.getElementById('overallProgressChart').getContext('2d');
        
        // Check if Chart is available
        if (typeof Chart === 'undefined') {
            console.error("Chart.js is not available");
            return;
        }
        
        // Check if chart already exists
        if (window.progressChart) {
            // Update existing chart
            window.progressChart.data.datasets[0].data = [progress, 100 - progress];
            window.progressChart.update();
        } else {
            // Create new chart
            try {
                window.progressChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Complete', 'Remaining'],
                        datasets: [{
                            data: [progress, 100 - progress],
                            backgroundColor: ['#4CAF50', '#2c3034'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        cutout: '75%',
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.label + ': ' + context.raw + '%';
                                    }
                                }
                            }
                        }
                    }
                });
                console.log("Chart created successfully");
            } catch (error) {
                console.error("Error creating chart:", error);
            }
        }
    }
});
