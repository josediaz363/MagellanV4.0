/**
 * Magellan EV Tracker - Donut Chart Visualization
 * Version: 1.33 (Complete Solution)
 * 
 * This file adds a non-invasive donut chart visualization to the dashboard
 * and updates existing charts on Project and Sub Job pages.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("Magellan EV Tracker - Initializing donut charts");
    
    // Determine which page we're on based on URL
    const currentUrl = window.location.href;
    const isDashboard = currentUrl.includes('/app') && !currentUrl.includes('/project/') && !currentUrl.includes('/sub-job/');
    const isProjectView = currentUrl.includes('/project/');
    const isSubJobView = currentUrl.includes('/sub-job/');
    
    console.log("Page detection:", { isDashboard, isProjectView, isSubJobView });
    
    // DASHBOARD PAGE IMPLEMENTATION
    if (isDashboard) {
        initDashboardChart();
    }
    // PROJECT VIEW PAGE IMPLEMENTATION
    else if (isProjectView) {
        // Wait for the page to fully render
        setTimeout(updateProjectChart, 500);
    }
    // SUB JOB VIEW PAGE IMPLEMENTATION
    else if (isSubJobView) {
        // Wait for the page to fully render
        setTimeout(updateSubJobChart, 500);
    }
    
    // Function to initialize dashboard chart
    function initDashboardChart() {
        console.log("Initializing dashboard chart");
        
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
        calculateDashboardProgress();
    }
    
    // Function to update the project chart
    function updateProjectChart() {
        console.log("Updating project chart");
        
        // Calculate progress from work items
        const progress = calculateProgressFromWorkItems();
        
        // Find the existing chart's canvas
        const existingCanvas = document.querySelector('canvas');
        if (!existingCanvas) {
            console.log("No canvas found for project chart");
            return;
        }
        
        // Find the percentage text element
        const percentageElements = document.querySelectorAll('.progress-percentage, [class*="percentage"], [class*="percent"]');
        for (const element of percentageElements) {
            if (element.textContent.includes('%')) {
                element.textContent = `${Math.round(progress)}%`;
                console.log(`Updated percentage text to ${Math.round(progress)}%`);
            }
        }
        
        // Update the chart if Chart.js is available
        if (typeof Chart !== 'undefined') {
            try {
                // Check if there's an existing chart instance
                let chartInstance = Chart.getChart(existingCanvas);
                
                if (chartInstance) {
                    // Update existing chart
                    chartInstance.data.datasets[0].data = [progress, 100 - progress];
                    chartInstance.update();
                    console.log(`Updated existing project chart to ${progress.toFixed(1)}%`);
                } else {
                    // Create new chart
                    new Chart(existingCanvas.getContext('2d'), {
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
                    console.log(`Created new project chart with ${progress.toFixed(1)}%`);
                }
            } catch (error) {
                console.error("Error updating project chart:", error);
            }
        }
    }
    
    // Function to update the sub job chart
    function updateSubJobChart() {
        console.log("Updating sub job chart");
        
        // Calculate progress from work items
        const progress = calculateProgressFromWorkItems();
        
        // Find the existing chart's canvas
        const existingCanvas = document.querySelector('canvas');
        if (!existingCanvas) {
            console.log("No canvas found for sub job chart");
            return;
        }
        
        // Find the percentage text element
        const percentageElements = document.querySelectorAll('.progress-percentage, [class*="percentage"], [class*="percent"]');
        for (const element of percentageElements) {
            if (element.textContent.includes('%')) {
                element.textContent = `${Math.round(progress)}%`;
                console.log(`Updated percentage text to ${Math.round(progress)}%`);
            }
        }
        
        // Update the chart if Chart.js is available
        if (typeof Chart !== 'undefined') {
            try {
                // Check if there's an existing chart instance
                let chartInstance = Chart.getChart(existingCanvas);
                
                if (chartInstance) {
                    // Update existing chart
                    chartInstance.data.datasets[0].data = [progress, 100 - progress];
                    chartInstance.update();
                    console.log(`Updated existing sub job chart to ${progress.toFixed(1)}%`);
                } else {
                    // Create new chart
                    new Chart(existingCanvas.getContext('2d'), {
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
                    console.log(`Created new sub job chart with ${progress.toFixed(1)}%`);
                }
            } catch (error) {
                console.error("Error updating sub job chart:", error);
            }
        }
    }
    
    // Function to calculate progress on dashboard
    function calculateDashboardProgress() {
        console.log("Calculating dashboard progress");
        
        const progress = calculateProgressFromWorkItems();
        
        // Update the chart
        updateChart('overallProgressChart', progress);
    }
    
    // Function to calculate progress from work items table
    function calculateProgressFromWorkItems() {
        console.log("Calculating progress from work items");
        
        // Get all work items from the table
        const workItemRows = document.querySelectorAll('tbody tr');
        
        if (workItemRows.length === 0) {
            console.log("No work items found");
            return 0;
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
                console.log(`Work item: ${budgetedHours} budgeted hours, ${earnedHours} earned hours`);
            }
        });
        
        // Calculate overall progress
        let overallProgress = 0;
        if (totalBudgetedHours > 0) {
            overallProgress = (totalEarnedHours / totalBudgetedHours) * 100;
            console.log(`Overall progress: ${overallProgress.toFixed(1)}% (${totalEarnedHours}/${totalBudgetedHours} hours)`);
        }
        
        return overallProgress;
    }
    
    // Function to update the chart with new progress value
    function updateChart(chartId, progress) {
        // Ensure progress is a valid number
        if (isNaN(progress) || progress < 0) {
            progress = 0;
        } else if (progress > 100) {
            // Cap at 100% for display purposes
            progress = 100;
        }
        
        console.log(`Updating chart ${chartId} with progress: ${progress.toFixed(1)}%`);
        
        // Update the center text
        const progressPercentage = document.querySelector('.progress-percentage');
        if (progressPercentage) {
            progressPercentage.textContent = `${Math.round(progress)}%`;
        }
        
        // Create or update the chart
        const canvas = document.getElementById(chartId);
        if (!canvas) {
            console.error(`Canvas element ${chartId} not found`);
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
