/**
 * Magellan EV Tracker - Project Overview Donut Chart Visualization
 * Version: 1.33
 * 
 * This file adds a donut chart visualization to the Project Overview page
 * showing overall progress of the project.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Magellan EV Tracker - Checking for project overview page");
    
    // Only run on project view pages
    if (!window.location.pathname.includes('/project/')) {
        console.log("Not on project overview page, skipping project donut chart");
        return;
    }
    
    console.log("Initializing project donut chart");
    
    // Find the metrics container and the overall progress value
    const metricsGrid = document.querySelector('.metrics-grid');
    if (!metricsGrid) {
        console.log("Metrics grid not found on project page");
        return;
    }
    
    // Find the overall progress metric card
    const progressCard = Array.from(metricsGrid.querySelectorAll('.metric-card')).find(card => {
        return card.querySelector('.title')?.textContent.includes('Overall Progress');
    });
    
    if (!progressCard) {
        console.log("Progress card not found on project page");
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
    
    console.log(`Found project progress value in card: ${progressValue}%`);
    
    // Calculate actual progress from work items table
    const actualProgress = calculateProgressFromWorkItems();
    if (actualProgress > 0) {
        progressValue = actualProgress;
        console.log(`Using calculated progress from work items: ${progressValue}%`);
    }
    
    // Create chart container if it doesn't exist
    let chartContainer = document.getElementById('project-donut-chart-container');
    if (!chartContainer) {
        chartContainer = document.createElement('div');
        chartContainer.id = 'project-donut-chart-container';
        chartContainer.className = 'donut-chart-container';
        
        // Find the project overview section
        const projectOverview = document.querySelector('.project-overview');
        if (projectOverview) {
            // Insert the chart container at the beginning of the project overview section
            projectOverview.insertBefore(chartContainer, projectOverview.firstChild);
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
    canvas.id = 'projectProgressChart';
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
        window.projectProgressChart = new Chart(ctx, {
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
        console.log("Created project progress chart");
    } catch (error) {
        console.error("Error creating project progress chart:", error);
    }
    
    // Update the progress value in the metrics grid to match the chart
    // This ensures consistency between the chart and the text display
    progressValueElement.textContent = `${Math.round(progressValue)}%`;
    
    // Function to calculate progress from work items table
    function calculateProgressFromWorkItems() {
        try {
            // Find the sub jobs table
            const subJobsTable = document.querySelector('table');
            if (!subJobsTable) {
                console.log("Sub jobs table not found");
                
                // Try to find work items directly
                const workItemsTable = document.querySelector('.work-items-table');
                if (!workItemsTable) {
                    console.log("Work items table not found");
                    return 0;
                }
                
                // Process work items table
                return calculateProgressFromTable(workItemsTable);
            }
            
            // Get all sub job rows except the header
            const rows = Array.from(subJobsTable.querySelectorAll('tbody tr'));
            if (rows.length === 0) {
                console.log("No sub jobs found");
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
            
            // If we can't find the hours cards, try to calculate from the sub jobs table
            let totalProgress = 0;
            let subJobCount = 0;
            
            // Process each row
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 4) { // Ensure we have enough cells
                    // Progress is typically in the 4th column (index 3)
                    const progressText = cells[3].textContent.trim();
                    const progress = parseFloat(progressText) || 0;
                    
                    totalProgress += progress;
                    subJobCount++;
                }
            });
            
            // Calculate average progress percentage
            if (subJobCount > 0) {
                const avgProgress = totalProgress / subJobCount;
                console.log(`Calculated average progress from sub jobs: ${avgProgress.toFixed(2)}%`);
                return avgProgress;
            } else {
                console.log("No valid sub job progress values found");
                return 0;
            }
        } catch (error) {
            console.error("Error calculating progress:", error);
            return 0;
        }
    }
    
    function calculateProgressFromTable(table) {
        let totalBudgetedHours = 0;
        let totalEarnedHours = 0;
        
        // Get all rows except the header
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        
        // Process each row
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 6) { // Ensure we have enough cells
                // Budgeted hours column
                const budgetedHoursText = cells[cells.length - 3].textContent.trim();
                const budgetedHours = parseFloat(budgetedHoursText) || 0;
                
                // Earned hours column
                const earnedHoursText = cells[cells.length - 2].textContent.trim();
                const earnedHours = parseFloat(earnedHoursText) || 0;
                
                totalBudgetedHours += budgetedHours;
                totalEarnedHours += earnedHours;
            }
        });
        
        // Calculate progress percentage
        if (totalBudgetedHours > 0) {
            const progress = (totalEarnedHours / totalBudgetedHours) * 100;
            console.log(`Calculated progress from table: ${progress.toFixed(2)}% (${totalEarnedHours}/${totalBudgetedHours})`);
            return progress;
        } else {
            console.log("Total budgeted hours is zero");
            return 0;
        }
    }
});
