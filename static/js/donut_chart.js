/**
 * Magellan EV Tracker - Dashboard Donut Chart Visualization
 * Version: 1.33
 * 
 * This file adds a donut chart visualization to the Dashboard page
 * showing overall progress across all work items.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Magellan EV Tracker - Checking for dashboard page");
    
    // Only run on the dashboard page
    if (window.location.pathname !== '/' && !window.location.pathname.endsWith('/index')) {
        console.log("Not on dashboard page, skipping dashboard donut chart");
        return;
    }
    
    console.log("Initializing dashboard donut chart");
    
    // Find the metrics container
    const metricsContainer = document.querySelector('.metrics-container');
    if (!metricsContainer) {
        console.log("Metrics container not found on dashboard");
        return;
    }
    
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.id = 'dashboard-donut-chart-container';
    chartContainer.className = 'donut-chart-container';
    
    // Insert the chart container before the metrics container
    metricsContainer.parentNode.insertBefore(chartContainer, metricsContainer);
    
    // Create title for the chart
    const title = document.createElement('h4');
    title.className = 'chart-title';
    title.textContent = 'Overall Progress';
    chartContainer.appendChild(title);
    
    // Create canvas for the chart
    const canvas = document.createElement('canvas');
    canvas.id = 'dashboardProgressChart';
    canvas.style.cssText = 'width: 100%; height: auto;';
    chartContainer.appendChild(canvas);
    
    // Create center text container
    const centerText = document.createElement('div');
    centerText.className = 'chart-center-text';
    chartContainer.appendChild(centerText);
    
    // Calculate progress from work items table
    let progressValue = calculateProgressFromWorkItems();
    
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
        window.dashboardProgressChart = new Chart(ctx, {
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
        console.log("Created dashboard progress chart");
    } catch (error) {
        console.error("Error creating dashboard progress chart:", error);
    }
    
    // Function to calculate progress from work items table
    function calculateProgressFromWorkItems() {
        try {
            // Find the work items table
            const workItemsTable = document.querySelector('.recent-work-items table');
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
            
            let totalBudgetedHours = 0;
            let totalEarnedHours = 0;
            
            // Process each row
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 5) { // Ensure we have enough cells
                    // Budgeted hours is typically the 4th column (index 3)
                    const budgetedHoursText = cells[3].textContent.trim();
                    const budgetedHours = parseFloat(budgetedHoursText) || 0;
                    
                    // Earned hours is typically the 5th column (index 4)
                    const earnedHoursText = cells[4].textContent.trim();
                    const earnedHours = parseFloat(earnedHoursText) || 0;
                    
                    totalBudgetedHours += budgetedHours;
                    totalEarnedHours += earnedHours;
                }
            });
            
            // Calculate progress percentage
            if (totalBudgetedHours > 0) {
                const progress = (totalEarnedHours / totalBudgetedHours) * 100;
                console.log(`Calculated progress: ${progress.toFixed(2)}% (${totalEarnedHours}/${totalBudgetedHours})`);
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
