/**
 * Magellan EV Tracker - Dashboard Donut Chart Visualization
 * Version: 1.32
 * 
 * This file adds a donut chart visualization to the dashboard
 * showing overall progress of work items.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Magellan EV Tracker - Initializing dashboard donut chart");
    
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.id = 'donut-chart-container';
    chartContainer.className = 'donut-chart-container';
    chartContainer.style.cssText = 'background-color: #003f5c; border-radius: 5px; padding: 20px; margin-bottom: 20px; position: relative; width: 250px; height: 250px; display: flex; flex-direction: column; align-items: center;';
    
    // Find metrics container
    const metricsContainer = document.querySelector('.metric-card')?.parentNode;
    if (!metricsContainer) {
        console.log("Metrics container not found");
        return;
    }
    
    // Insert the chart container before the first metric card
    const firstMetricCard = document.querySelector('.metric-card');
    if (firstMetricCard) {
        metricsContainer.insertBefore(chartContainer, firstMetricCard);
    } else {
        metricsContainer.appendChild(chartContainer);
    }
    
    // Create title for the chart
    const title = document.createElement('h4');
    title.className = 'chart-title';
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
    centerText.className = 'chart-center-text';
    centerText.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none;';
    chartContainer.appendChild(centerText);
    
    // Create percentage display
    const percentage = document.createElement('span');
    percentage.className = 'progress-percentage';
    percentage.textContent = '0%';
    percentage.style.cssText = 'display: block; font-size: 24px; font-weight: 700; color: #4CAF50;';
    centerText.appendChild(percentage);
    
    // Create label
    const label = document.createElement('span');
    label.className = 'progress-label';
    label.textContent = 'Complete';
    label.style.cssText = 'display: block; font-size: 14px; color: white; opacity: 0.8;';
    centerText.appendChild(label);
    
    // Initial data calculation
    calculateProgress();
    
    // Function to calculate progress
    function calculateProgress() {
        console.log("Calculating progress");
        
        // Get all work items from the table
        const workItemRows = document.querySelectorAll('tbody tr');
        
        if (workItemRows.length === 0) {
            console.log("No work items found");
            updateChart(0);
            return;
        }
        
        let totalBudgetedHours = 0;
        let totalEarnedHours = 0;
        
        workItemRows.forEach(row => {
            // Skip rows that don't have enough cells
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return;
            
            // Extract data from cells (assuming standard table structure)
            // Budgeted Hours is typically column 3
            // Earned Hours is typically column 4
            const budgetedHoursText = cells[2]?.textContent.trim();
            const earnedHoursText = cells[3]?.textContent.trim();
            
            // Parse values
            const budgetedHours = parseFloat(budgetedHoursText);
            const earnedHours = parseFloat(earnedHoursText);
            
            // Only count if we have valid numbers
            if (!isNaN(budgetedHours) && !isNaN(earnedHours)) {
                totalBudgetedHours += budgetedHours;
                totalEarnedHours += earnedHours;
                console.log(`Work item: ${budgetedHours} budgeted hours, ${earnedHours} earned hours`);
            }
        });
        
        // Calculate overall progress
        let overallProgress = 0;
        if (totalBudgetedHours > 0) {
            overallProgress = (totalEarnedHours / totalBudgetedHours) * 100;
            console.log(`Overall progress: ${overallProgress.toFixed(1)}% (${totalEarnedHours}/${totalBudgetedHours} hours)`);
        }
        
        // Update the chart
        updateChart(overallProgress);
    }
    
    // Function to update the chart with new progress value
    function updateChart(progress) {
        // Ensure progress is a valid number
        if (isNaN(progress) || progress < 0) {
            progress = 0;
        } else if (progress > 100) {
            // Cap at 100% for display purposes
            progress = 100;
        }
        
        console.log(`Updating chart with progress: ${progress.toFixed(1)}%`);
        
        // Update the center text
        const progressPercentage = document.querySelector('.progress-percentage');
        if (progressPercentage) {
            progressPercentage.textContent = `${Math.round(progress)}%`;
        }
        
        // Create or update the chart
        const canvas = document.getElementById('overallProgressChart');
        if (!canvas) {
            console.error("Canvas element not found");
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
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
            console.log("Updated existing chart");
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
                console.log("Created new chart");
            } catch (error) {
                console.error("Error creating chart:", error);
            }
        }
    }
});
