/**
 * Magellan EV Tracker - Donut Chart Visualization
 * Version: 1.33 (Improved v2)
 * 
 * This file adds a non-invasive donut chart visualization to the dashboard
 * without modifying any existing workflow functionality.
 * 
 * Improvements:
 * - Correctly calculates progress from work items table
 * - Updates chart when project selection changes
 * - Maintains same structure and approach as v2
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only run on the dashboard page
    if (!document.querySelector('.metric-card')) {
        return;
    }
    
    // Create container for the donut chart
    const metricsContainer = document.querySelector('.metric-card').parentNode;
    const chartContainer = document.createElement('div');
    chartContainer.id = 'donut-chart-container';
    chartContainer.className = 'donut-chart-container';
    
    // Insert the chart container before the first metric card
    const firstMetricCard = document.querySelector('.metric-card');
    metricsContainer.insertBefore(chartContainer, firstMetricCard);
    
    // Create canvas for the chart
    const canvas = document.createElement('canvas');
    canvas.id = 'overallProgressChart';
    chartContainer.appendChild(canvas);
    
    // Create title for the chart
    const title = document.createElement('h4');
    title.className = 'chart-title';
    title.textContent = 'Overall Progress';
    chartContainer.insertBefore(title, canvas);
    
    // Create center text container
    const centerText = document.createElement('div');
    centerText.className = 'chart-center-text';
    chartContainer.appendChild(centerText);
    
    // Create percentage display
    const percentage = document.createElement('span');
    percentage.className = 'progress-percentage';
    percentage.textContent = '0%';
    centerText.appendChild(percentage);
    
    // Create label
    const label = document.createElement('span');
    label.className = 'progress-label';
    label.textContent = 'Complete';
    centerText.appendChild(label);
    
    // Try to get project selector
    const projectSelector = document.querySelector('select');
    if (projectSelector) {
        // Add ID to the selector for easier reference
        projectSelector.id = 'projectSelector';
        
        // Add event listener for project selection
        projectSelector.addEventListener('change', function() {
            // Calculate progress when project selection changes
            calculateProgressFromWorkItems();
        });
    }
    
    // Initial data calculation
    calculateProgressFromWorkItems();
    
    // Function to calculate progress from work items table
    function calculateProgressFromWorkItems() {
        // Get all work items from the table
        const workItemRows = document.querySelectorAll('tbody tr');
        
        if (workItemRows.length === 0) {
            // No work items found, set progress to 0%
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
            // Progress is typically column 5
            const budgetedHoursText = cells[2]?.textContent.trim();
            const earnedHoursText = cells[3]?.textContent.trim();
            
            // Parse values
            const budgetedHours = parseFloat(budgetedHoursText);
            const earnedHours = parseFloat(earnedHoursText);
            
            // Only count if we have valid numbers
            if (!isNaN(budgetedHours) && !isNaN(earnedHours)) {
                totalBudgetedHours += budgetedHours;
                totalEarnedHours += earnedHours;
            }
        });
        
        // Calculate overall progress
        let overallProgress = 0;
        if (totalBudgetedHours > 0) {
            overallProgress = (totalEarnedHours / totalBudgetedHours) * 100;
        }
        
        // Update the chart
        updateChart(overallProgress);
    }
    
    // Fallback function to calculate progress from DOM elements (original v2 logic)
    function calculateProgressFromDOM() {
        // Try to get progress from the first metric card (To Date Actual % Complete)
        const metricCards = document.querySelectorAll('.metric-card');
        if (metricCards.length > 0) {
            const firstCard = metricCards[0];
            const valueElement = firstCard.querySelector('.value');
            if (valueElement) {
                const progressText = valueElement.textContent;
                const progressValue = parseFloat(progressText);
                if (!isNaN(progressValue)) {
                    updateChart(progressValue);
                    return;
                }
            }
        }
        
        // Alternative: try to get progress from the table
        const progressCells = document.querySelectorAll('td:nth-child(5)'); // Progress column
        if (progressCells.length > 0) {
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
                updateChart(totalProgress / count);
                return;
            }
        }
        
        // Default to 0% if we can't find a value
        updateChart(0);
    }
    
    // Function to update the chart with new progress value
    function updateChart(progress) {
        // Update the center text
        const progressPercentage = document.querySelector('.progress-percentage');
        if (progressPercentage) {
            progressPercentage.textContent = `${Math.round(progress)}%`;
        }
        
        // Create or update the chart
        const ctx = document.getElementById('overallProgressChart').getContext('2d');
        
        // Check if chart already exists
        if (window.progressChart) {
            // Update existing chart
            window.progressChart.data.datasets[0].data = [progress, 100 - progress];
            window.progressChart.update();
        } else {
            // Create new chart
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
        }
    }
});
