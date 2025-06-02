/**
 * Magellan EV Tracker - Donut Chart Visualization
 * Version: 1.33 (Improved v2 - Multi-page Support)
 * 
 * This file adds a non-invasive donut chart visualization to all pages
 * without modifying any existing workflow functionality.
 * 
 * Improvements:
 * - Works on Dashboard, Project Overview, and Sub Job Overview pages
 * - Correctly calculates progress from work items table
 * - Updates chart when project selection changes
 * - Maintains same structure and approach as v2
 */

document.addEventListener('DOMContentLoaded', function() {
    // Determine which page we're on
    const isDashboard = document.querySelector('.navbar h2')?.textContent.includes('Dashboard');
    const isProjectView = window.location.href.includes('/project/');
    const isSubJobView = window.location.href.includes('/sub-job/');
    
    // Only run on pages with donut charts
    if (!document.querySelector('.metric-card') && 
        !document.querySelector('.chart-container') && 
        !document.querySelector('[class*="progress"]')) {
        return;
    }
    
    // Find or create chart container based on page type
    let chartContainer;
    
    if (isDashboard) {
        // Dashboard page
        const metricsContainer = document.querySelector('.metric-card')?.parentNode;
        if (metricsContainer) {
            chartContainer = document.createElement('div');
            chartContainer.id = 'donut-chart-container';
            chartContainer.className = 'donut-chart-container';
            
            // Insert the chart container before the first metric card
            const firstMetricCard = document.querySelector('.metric-card');
            metricsContainer.insertBefore(chartContainer, firstMetricCard);
        }
    } else {
        // Project or Sub Job view
        chartContainer = document.querySelector('.chart-container');
        if (!chartContainer) {
            // Find the metrics section
            const overviewSection = document.querySelector('.project-overview, .sub-job-overview');
            if (overviewSection) {
                // Look for existing progress section
                chartContainer = overviewSection.querySelector('[class*="progress"]');
                if (!chartContainer) {
                    // Create new container if needed
                    chartContainer = document.createElement('div');
                    chartContainer.className = 'chart-container';
                    overviewSection.appendChild(chartContainer);
                }
            }
        }
    }
    
    // If we found or created a chart container, set it up
    if (chartContainer) {
        // Clear existing content if any
        chartContainer.innerHTML = '';
        
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
    } else {
        // No suitable container found
        return;
    }
    
    // Try to get project selector on dashboard
    if (isDashboard) {
        const projectSelector = document.querySelector('select');
        if (projectSelector) {
            // Add ID to the selector for easier reference
            projectSelector.id = 'projectSelector';
            
            // Add event listener for project selection
            projectSelector.addEventListener('change', function() {
                // Calculate progress when project selection changes
                calculateProgress();
            });
        }
    }
    
    // Initial data calculation
    calculateProgress();
    
    // Function to calculate progress based on page context
    function calculateProgress() {
        if (isDashboard) {
            calculateProgressFromWorkItems();
        } else if (isProjectView) {
            calculateProgressForProject();
        } else if (isSubJobView) {
            calculateProgressForSubJob();
        } else {
            // Fallback for other pages
            calculateProgressFromWorkItems();
        }
    }
    
    // Function to calculate progress from work items table on dashboard
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
    
    // Function to calculate progress for project view
    function calculateProgressForProject() {
        // Try to get progress from the work items table first
        const workItemRows = document.querySelectorAll('tbody tr');
        
        if (workItemRows.length > 0) {
            let totalBudgetedHours = 0;
            let totalEarnedHours = 0;
            
            workItemRows.forEach(row => {
                // Skip rows that don't have enough cells
                const cells = row.querySelectorAll('td');
                if (cells.length < 6) return;
                
                // Extract data from cells
                // In project view, columns might be different
                // Look for columns with numeric values that could be hours
                for (let i = 0; i < cells.length; i++) {
                    const cellText = cells[i]?.textContent.trim();
                    if (cellText.includes('Budgeted Hours') || 
                        cells[i]?.previousElementSibling?.textContent.includes('Budgeted Hours')) {
                        const budgetedHours = parseFloat(cellText);
                        if (!isNaN(budgetedHours)) {
                            totalBudgetedHours += budgetedHours;
                        }
                    }
                    if (cellText.includes('Earned Hours') || 
                        cells[i]?.previousElementSibling?.textContent.includes('Earned Hours')) {
                        const earnedHours = parseFloat(cellText);
                        if (!isNaN(earnedHours)) {
                            totalEarnedHours += earnedHours;
                        }
                    }
                }
                
                // Try standard columns if the above didn't work
                const budgetedHoursText = cells[cells.length - 4]?.textContent.trim();
                const earnedHoursText = cells[cells.length - 3]?.textContent.trim();
                
                const budgetedHours = parseFloat(budgetedHoursText);
                const earnedHours = parseFloat(earnedHoursText);
                
                if (!isNaN(budgetedHours) && !isNaN(earnedHours)) {
                    totalBudgetedHours += budgetedHours;
                    totalEarnedHours += earnedHours;
                }
            });
            
            // Calculate overall progress
            if (totalBudgetedHours > 0) {
                const overallProgress = (totalEarnedHours / totalBudgetedHours) * 100;
                updateChart(overallProgress);
                return;
            }
        }
        
        // Fallback: Try to get progress from metrics cards
        const progressElement = document.querySelector('.metric-card .value, [class*="progress"] .value');
        if (progressElement) {
            const progressText = progressElement.textContent.trim();
            const progressValue = parseFloat(progressText);
            if (!isNaN(progressValue)) {
                updateChart(progressValue);
                return;
            }
        }
        
        // Second fallback: Look for any element with progress percentage
        const progressElements = document.querySelectorAll('*');
        for (const element of progressElements) {
            const text = element.textContent.trim();
            if (text.includes('%') && !isNaN(parseFloat(text))) {
                const progressValue = parseFloat(text);
                updateChart(progressValue);
                return;
            }
        }
        
        // If all else fails, check if we have budgeted and earned hours displayed
        const budgetedHoursElement = document.querySelector('[class*="budgeted"], [id*="budgeted"]');
        const earnedHoursElement = document.querySelector('[class*="earned"], [id*="earned"]');
        
        if (budgetedHoursElement && earnedHoursElement) {
            const budgetedHours = parseFloat(budgetedHoursElement.textContent.trim());
            const earnedHours = parseFloat(earnedHoursElement.textContent.trim());
            
            if (!isNaN(budgetedHours) && !isNaN(earnedHours) && budgetedHours > 0) {
                const progress = (earnedHours / budgetedHours) * 100;
                updateChart(progress);
                return;
            }
        }
        
        // Default to 0% if we can't find a value
        updateChart(0);
    }
    
    // Function to calculate progress for sub job view
    function calculateProgressForSubJob() {
        // Try to get progress from the work items table first
        const workItemRows = document.querySelectorAll('tbody tr');
        
        if (workItemRows.length > 0) {
            let totalBudgetedHours = 0;
            let totalEarnedHours = 0;
            
            workItemRows.forEach(row => {
                // Skip rows that don't have enough cells
                const cells = row.querySelectorAll('td');
                if (cells.length < 7) return;
                
                // In sub job view, budgeted hours and earned hours are typically in specific columns
                // Adjust indices based on your actual table structure
                const budgetedHoursText = cells[5]?.textContent.trim();
                const earnedHoursText = cells[6]?.textContent.trim();
                
                const budgetedHours = parseFloat(budgetedHoursText);
                const earnedHours = parseFloat(earnedHoursText);
                
                if (!isNaN(budgetedHours) && !isNaN(earnedHours)) {
                    totalBudgetedHours += budgetedHours;
                    totalEarnedHours += earnedHours;
                }
            });
            
            // Calculate overall progress
            if (totalBudgetedHours > 0) {
                const overallProgress = (totalEarnedHours / totalBudgetedHours) * 100;
                updateChart(overallProgress);
                return;
            }
        }
        
        // Fallback: Try to get progress from metrics cards
        const progressElement = document.querySelector('.metric-card .value, [class*="progress"] .value');
        if (progressElement) {
            const progressText = progressElement.textContent.trim();
            const progressValue = parseFloat(progressText);
            if (!isNaN(progressValue)) {
                updateChart(progressValue);
                return;
            }
        }
        
        // Second fallback: Look for budgeted and earned hours in the page
        const budgetedHoursElement = document.querySelector('[class*="budgeted"], [id*="budgeted"]');
        const earnedHoursElement = document.querySelector('[class*="earned"], [id*="earned"]');
        
        if (budgetedHoursElement && earnedHoursElement) {
            const budgetedHours = parseFloat(budgetedHoursElement.textContent.trim());
            const earnedHours = parseFloat(earnedHoursElement.textContent.trim());
            
            if (!isNaN(budgetedHours) && !isNaN(earnedHours) && budgetedHours > 0) {
                const progress = (earnedHours / budgetedHours) * 100;
                updateChart(progress);
                return;
            }
        }
        
        // Default to 0% if we can't find a value
        updateChart(0);
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
