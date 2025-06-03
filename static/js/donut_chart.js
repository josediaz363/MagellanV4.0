/**
 * Magellan EV Tracker - Donut Chart Visualization
 * Version: 1.33 (Conservative Extension of v2)
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
    console.log("Magellan EV Tracker - Initializing donut chart visualization");
    
    // Determine which page we're on based on URL and content
    const currentUrl = window.location.href;
    const isDashboard = currentUrl.includes('/app') && !currentUrl.includes('/project/') && !currentUrl.includes('/sub-job/');
    const isProjectView = currentUrl.includes('/project/');
    const isSubJobView = currentUrl.includes('/sub-job/');
    
    console.log("Page detection:", { isDashboard, isProjectView, isSubJobView });
    
    // DASHBOARD PAGE IMPLEMENTATION
    if (isDashboard) {
        console.log("Initializing dashboard chart");
        
        // Find metrics container
        const metricsContainer = document.querySelector('.metric-card')?.parentNode;
        if (!metricsContainer) {
            console.log("Dashboard metrics container not found");
            return;
        }
        
        // Create chart container
        const chartContainer = document.createElement('div');
        chartContainer.id = 'donut-chart-container';
        chartContainer.className = 'donut-chart-container';
        
        // Insert the chart container before the first metric card
        const firstMetricCard = document.querySelector('.metric-card');
        metricsContainer.insertBefore(chartContainer, firstMetricCard);
        
        // Create title for the chart
        const title = document.createElement('h4');
        title.className = 'chart-title';
        title.textContent = 'Overall Progress';
        chartContainer.appendChild(title);
        
        // Create canvas for the chart
        const canvas = document.createElement('canvas');
        canvas.id = 'overallProgressChart';
        chartContainer.appendChild(canvas);
        
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
                calculateDashboardProgress();
            });
        }
        
        // Initial data calculation
        calculateDashboardProgress();
    }
    
    // PROJECT VIEW PAGE IMPLEMENTATION
    else if (isProjectView) {
        console.log("Initializing project chart");
        
        // Find the project overview section
        const projectTitle = document.querySelector('h2, h3');
        if (!projectTitle) {
            console.log("Project title not found");
            return;
        }
        
        // Find a suitable container for the chart
        const metricsSection = document.querySelector('.metrics-grid, .row');
        if (!metricsSection) {
            console.log("Project metrics section not found");
            return;
        }
        
        // Create chart container
        const chartContainer = document.createElement('div');
        chartContainer.id = 'project-donut-chart';
        chartContainer.className = 'chart-container';
        chartContainer.style.cssText = 'background-color: #003f5c; border-radius: 5px; padding: 20px; margin-bottom: 20px; position: relative; width: 250px; height: 250px; display: flex; flex-direction: column; align-items: center;';
        
        // Find a good place to insert the chart
        const subJobsSection = document.querySelector('.sub-jobs');
        if (subJobsSection) {
            // Insert before sub jobs section
            subJobsSection.parentNode.insertBefore(chartContainer, subJobsSection);
        } else {
            // Insert after metrics section
            metricsSection.parentNode.insertBefore(chartContainer, metricsSection.nextSibling);
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
        
        // Calculate progress
        calculateProjectProgress();
    }
    
    // SUB JOB VIEW PAGE IMPLEMENTATION
    else if (isSubJobView) {
        console.log("Initializing sub job chart");
        
        // Find the sub job overview section
        const subJobTitle = document.querySelector('h2, h3');
        if (!subJobTitle) {
            console.log("Sub job title not found");
            return;
        }
        
        // Find a suitable container for the chart
        const metricsSection = document.querySelector('.metrics-grid, .row');
        if (!metricsSection) {
            console.log("Sub job metrics section not found");
            return;
        }
        
        // Create chart container
        const chartContainer = document.createElement('div');
        chartContainer.id = 'sub-job-donut-chart';
        chartContainer.className = 'chart-container';
        chartContainer.style.cssText = 'background-color: #003f5c; border-radius: 5px; padding: 20px; margin-bottom: 20px; position: relative; width: 250px; height: 250px; display: flex; flex-direction: column; align-items: center;';
        
        // Find a good place to insert the chart
        const workItemsSection = document.querySelector('.work-items');
        if (workItemsSection) {
            // Insert before work items section
            workItemsSection.parentNode.insertBefore(chartContainer, workItemsSection);
        } else {
            // Insert after metrics section
            metricsSection.parentNode.insertBefore(chartContainer, metricsSection.nextSibling);
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
        
        // Calculate progress
        calculateSubJobProgress();
    }
    
    // Function to calculate progress on dashboard
    function calculateDashboardProgress() {
        console.log("Calculating dashboard progress");
        
        // Get all work items from the table
        const workItemRows = document.querySelectorAll('tbody tr');
        
        if (workItemRows.length === 0) {
            console.log("No work items found on dashboard");
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
                console.log(`Dashboard work item: ${budgetedHours} budgeted hours, ${earnedHours} earned hours`);
            }
        });
        
        // Calculate overall progress
        let overallProgress = 0;
        if (totalBudgetedHours > 0) {
            overallProgress = (totalEarnedHours / totalBudgetedHours) * 100;
            console.log(`Dashboard overall progress: ${overallProgress.toFixed(1)}% (${totalEarnedHours}/${totalBudgetedHours} hours)`);
        }
        
        // Update the chart
        updateChart(overallProgress);
    }
    
    // Function to calculate progress on project view
    function calculateProjectProgress() {
        console.log("Calculating project progress");
        
        // Try to get progress from the metrics section first
        const progressElement = document.querySelector('.metric-card .value, [class*="progress"] .value');
        if (progressElement) {
            const progressText = progressElement.textContent.trim();
            const progressValue = parseFloat(progressText);
            if (!isNaN(progressValue)) {
                console.log(`Project progress from metrics: ${progressValue.toFixed(1)}%`);
                updateChart(progressValue);
                return;
            }
        }
        
        // Try to get earned hours and budgeted hours from metrics
        const earnedHoursElement = document.querySelector('[class*="earned"], [id*="earned"]');
        const budgetedHoursElement = document.querySelector('[class*="budgeted"], [id*="budgeted"]');
        
        if (earnedHoursElement && budgetedHoursElement) {
            const earnedHours = parseFloat(earnedHoursElement.textContent.trim());
            const budgetedHours = parseFloat(budgetedHoursElement.textContent.trim());
            
            if (!isNaN(earnedHours) && !isNaN(budgetedHours) && budgetedHours > 0) {
                const progress = (earnedHours / budgetedHours) * 100;
                console.log(`Project progress from metrics: ${progress.toFixed(1)}% (${earnedHours}/${budgetedHours} hours)`);
                updateChart(progress);
                return;
            }
        }
        
        // Try to get progress from sub jobs table
        const subJobRows = document.querySelectorAll('tbody tr');
        
        if (subJobRows.length > 0) {
            let totalProgress = 0;
            let validRows = 0;
            
            subJobRows.forEach(row => {
                // Skip rows that don't have enough cells
                const cells = row.querySelectorAll('td');
                if (cells.length < 4) return;
                
                // Try to find progress column
                for (let i = 0; i < cells.length; i++) {
                    const cellText = cells[i]?.textContent.trim();
                    if (cellText.includes('%')) {
                        const progressValue = parseFloat(cellText);
                        if (!isNaN(progressValue)) {
                            totalProgress += progressValue;
                            validRows++;
                            console.log(`Sub job progress: ${progressValue.toFixed(1)}%`);
                            break;
                        }
                    }
                }
            });
            
            if (validRows > 0) {
                const overallProgress = totalProgress / validRows;
                console.log(`Project progress from sub jobs: ${overallProgress.toFixed(1)}%`);
                updateChart(overallProgress);
                return;
            }
        }
        
        // Look for any element with progress percentage
        const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
            const text = element.textContent.trim();
            if (text.includes('%') && !text.includes('Complete') && !isNaN(parseFloat(text))) {
                const progressValue = parseFloat(text);
                if (progressValue >= 0 && progressValue <= 100) {
                    console.log(`Project progress from element: ${progressValue.toFixed(1)}%`);
                    updateChart(progressValue);
                    return;
                }
            }
        }
        
        // Default to 0% if we can't find a value
        console.log("No valid progress data found for project, defaulting to 0%");
        updateChart(0);
    }
    
    // Function to calculate progress on sub job view
    function calculateSubJobProgress() {
        console.log("Calculating sub job progress");
        
        // Try to get progress from the metrics section first
        const progressElement = document.querySelector('.metric-card .value, [class*="progress"] .value');
        if (progressElement) {
            const progressText = progressElement.textContent.trim();
            const progressValue = parseFloat(progressText);
            if (!isNaN(progressValue)) {
                console.log(`Sub job progress from metrics: ${progressValue.toFixed(1)}%`);
                updateChart(progressValue);
                return;
            }
        }
        
        // Try to get earned hours and budgeted hours from metrics
        const earnedHoursElement = document.querySelector('[class*="earned"], [id*="earned"]');
        const budgetedHoursElement = document.querySelector('[class*="budgeted"], [id*="budgeted"]');
        
        if (earnedHoursElement && budgetedHoursElement) {
            const earnedHours = parseFloat(earnedHoursElement.textContent.trim());
            const budgetedHours = parseFloat(budgetedHoursElement.textContent.trim());
            
            if (!isNaN(earnedHours) && !isNaN(budgetedHours) && budgetedHours > 0) {
                const progress = (earnedHours / budgetedHours) * 100;
                console.log(`Sub job progress from metrics: ${progress.toFixed(1)}% (${earnedHours}/${budgetedHours} hours)`);
                updateChart(progress);
                return;
            }
        }
        
        // Try to get progress from work items table
        const workItemRows = document.querySelectorAll('tbody tr');
        
        if (workItemRows.length > 0) {
            let totalBudgetedHours = 0;
            let totalEarnedHours = 0;
            
            workItemRows.forEach(row => {
                // Skip rows that don't have enough cells
                const cells = row.querySelectorAll('td');
                if (cells.length < 7) return;
                
                // In sub job view, try to find budgeted hours and earned hours columns
                let budgetedHours = null;
                let earnedHours = null;
                
                // Try to find columns by header
                const headers = document.querySelectorAll('thead th');
                for (let i = 0; i < headers.length; i++) {
                    const headerText = headers[i]?.textContent.trim().toLowerCase();
                    if (headerText.includes('budgeted') && headerText.includes('hours')) {
                        budgetedHours = parseFloat(cells[i]?.textContent.trim());
                    } else if (headerText.includes('earned') && headerText.includes('hours')) {
                        earnedHours = parseFloat(cells[i]?.textContent.trim());
                    }
                }
                
                // If we couldn't find by header, try standard positions
                if (budgetedHours === null || earnedHours === null) {
                    // Try to find columns by position
                    for (let i = 0; i < cells.length; i++) {
                        const cellText = cells[i]?.textContent.trim();
                        if (cellText && !isNaN(parseFloat(cellText))) {
                            if (i === 5) { // Typical position for budgeted hours
                                budgetedHours = parseFloat(cellText);
                            } else if (i === 6) { // Typical position for earned hours
                                earnedHours = parseFloat(cellText);
                            }
                        }
                    }
                }
                
                // Only count if we have valid numbers
                if (!isNaN(budgetedHours) && !isNaN(earnedHours)) {
                    totalBudgetedHours += budgetedHours;
                    totalEarnedHours += earnedHours;
                    console.log(`Sub job work item: ${budgetedHours} budgeted hours, ${earnedHours} earned hours`);
                }
            });
            
            // Calculate overall progress
            if (totalBudgetedHours > 0) {
                const overallProgress = (totalEarnedHours / totalBudgetedHours) * 100;
                console.log(`Sub job overall progress: ${overallProgress.toFixed(1)}% (${totalEarnedHours}/${totalBudgetedHours} hours)`);
                updateChart(overallProgress);
                return;
            }
        }
        
        // Look for any element with progress percentage
        const allElements = document.querySelectorAll('*');
        for (const element of allElements) {
            const text = element.textContent.trim();
            if (text.includes('%') && !text.includes('Complete') && !isNaN(parseFloat(text))) {
                const progressValue = parseFloat(text);
                if (progressValue >= 0 && progressValue <= 100) {
                    console.log(`Sub job progress from element: ${progressValue.toFixed(1)}%`);
                    updateChart(progressValue);
                    return;
                }
            }
        }
        
        // Default to 0% if we can't find a value
        console.log("No valid progress data found for sub job, defaulting to 0%");
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
