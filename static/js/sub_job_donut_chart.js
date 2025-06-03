/**
 * Magellan EV Tracker - Sub Job Overview Donut Chart Visualization
 * Version: 1.33
 * 
 * This file adds a donut chart visualization to the Sub Job Overview page
 * showing overall progress of the sub job.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Magellan EV Tracker - Checking for sub job overview page");
    
    // Only run on sub job view pages
    if (!window.location.pathname.includes('/sub_job/')) {
        console.log("Not on sub job overview page, skipping sub job donut chart");
        return;
    }
    
    console.log("Initializing sub job donut chart");
    
    // Find the metrics container and the overall progress value
    const metricsGrid = document.querySelector('.metrics-grid');
    if (!metricsGrid) {
        console.log("Metrics grid not found on sub job page");
        return;
    }
    
    // Find the overall progress metric card
    const progressCard = Array.from(metricsGrid.querySelectorAll('.metric-card')).find(card => {
        return card.querySelector('.title')?.textContent.includes('Overall Progress');
    });
    
    if (!progressCard) {
        console.log("Progress card not found on sub job page");
        return;
    }
    
    // Get the current progress value from the card
    const progressValueElement = progressCard.querySelector('.value');
    if (!progressValueElement) {
        console.log("Progress value element not found");
        return;
    }
    
    // Extract the progress percentage from the card
    let progressText = progressValueElement.textContent.trim();
    let progressValue = parseFloat(progressText);
    if (isNaN(progressValue)) {
        progressValue = 0;
    }
    
    console.log(`Found sub job progress value in card: ${progressValue}%`);
    
    // Calculate actual progress from work items table
    const actualProgress = calculateProgressFromWorkItems();
    if (actualProgress > 0) {
        progressValue = actualProgress;
        console.log(`Using calculated progress from work items: ${progressValue}%`);
    }
    
    // Create chart container if it doesn't exist
    let chartContainer = document.getElementById('sub-job-donut-chart-container');
    if (!chartContainer) {
        chartContainer = document.createElement('div');
        chartContainer.id = 'sub-job-donut-chart-container';
        chartContainer.className = 'donut-chart-container';
        
        // Find the sub job overview section
        const subJobOverview = document.querySelector('.sub-job-overview');
        if (subJobOverview) {
            // Insert the chart container at the beginning of the sub job overview section
            subJobOverview.insertBefore(chartContainer, subJobOverview.firstChild);
        } else {
            // Fallback: Insert the chart container before the metrics grid
            metricsGrid.parentNode.insertBefore(chartContainer, metricsGrid);
        }
    } else {
        // Clear existing content
        chartContainer.innerHTML = '';
    }
    
    // Create title for the chart
    const title = document.createElement('h4');
    title.className = 'chart-title';
    title.textContent = 'Overall Progress';
    chartContainer.appendChild(title);
    
    // Create canvas for the chart
    const canvas = document.createElement('canvas');
    canvas.id = 'subJobProgressChart';
    canvas.style.cssText = 'width: 100%; height: auto;';
    chartContainer.appendChild(canvas);
    
    // Create center text container
    const centerText = document.createElement('div');
    centerText.className = 'chart-center-text';
    chartContainer.appendChild(centerText);
    
    // Create percentage display
    const percentage = document.createElement('span');
    percentage.className = 'progress-percentage';
    percentage.textContent = `${Math.round(progressValue)}%`;
    centerText.appendChild(percentage);
    
    // Create label
    const label = document.createElement('span');
    label.className = 'progress-label';
    label.textContent = 'Complete';
    centerText.appendChild(label);
    
    // Create or update the chart
    const ctx = canvas.getContext('2d');
    
    // Check if Chart is available
    if (typeof Chart === 'undefined') {
        console.error("Chart.js is not available");
        return;
    }
    
    // Create new chart
    try {
        window.subJobProgressChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Complete', 'Remaining'],
                datasets: [{
                    data: [progressValue, 100 - progressValue],
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
        console.log("Created sub job progress chart");
    } catch (error) {
        console.error("Error creating sub job progress chart:", error);
    }
    
    // Update the progress value in the metrics grid to match the chart
    // This ensures consistency between the chart and the text display
    progressValueElement.textContent = `${Math.round(progressValue)}%`;
    
    // Function to calculate progress from work items table
    function calculateProgressFromWorkItems() {
        try {
            // Find the work items table
            const workItemsTable = document.querySelector('table');
            if (!workItemsTable) {
                console.log("Work items table not found");
                return 0;
            }
            
            // Get all rows except the header
            const rows = Array.from(workItemsTable.querySelectorAll('tbody tr'));
            if (rows.length === 0) {
                console.log("No work items found");
                return 0;
            }
            
            // Look for earned hours and budgeted hours in the page
            const earnedHoursCard = Array.from(metricsGrid.querySelectorAll('.metric-card')).find(card => {
                return card.querySelector('.title')?.textContent.includes('Earned Hours');
            });
            
            const budgetedHoursCard = Array.from(metricsGrid.querySelectorAll('.metric-card')).find(card => {
                return card.querySelector('.title')?.textContent.includes('Budgeted Hours');
            });
            
            if (earnedHoursCard && budgetedHoursCard) {
                const earnedHours = parseFloat(earnedHoursCard.querySelector('.value')?.textContent) || 0;
                const budgetedHours = parseFloat(budgetedHoursCard.querySelector('.value')?.textContent) || 0;
                
                if (budgetedHours > 0) {
                    const progress = (earnedHours / budgetedHours) * 100;
                    console.log(`Calculated progress from hours cards: ${progress.toFixed(2)}% (${earnedHours}/${budgetedHours})`);
                    return progress;
                }
            }
            
            // If we can't find the hours cards, try to calculate from the work items table
            let totalBudgetedHours = 0;
            let totalEarnedHours = 0;
            
            // Process each row
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 6) { // Ensure we have enough cells
                    // Budgeted hours column (typically 6th from the end)
                    const budgetedHoursText = cells[cells.length - 3].textContent.trim();
                    const budgetedHours = parseFloat(budgetedHoursText) || 0;
                    
                    // Earned hours column (typically 5th from the end)
                    const earnedHoursText = cells[cells.length - 2].textContent.trim();
                    const earnedHours = parseFloat(earnedHoursText) || 0;
                    
                    totalBudgetedHours += budgetedHours;
                    totalEarnedHours += earnedHours;
                }
            });
            
            // Calculate progress percentage
            if (totalBudgetedHours > 0) {
                const progress = (totalEarnedHours / totalBudgetedHours) * 100;
                console.log(`Calculated progress from work items: ${progress.toFixed(2)}% (${totalEarnedHours}/${totalBudgetedHours})`);
                return progress;
            } else {
                console.log("Total budgeted hours is zero");
                return 0;
            }
        } catch (error) {
            console.error("Error calculating progress:", error);
            return 0;
        }
    }
});
