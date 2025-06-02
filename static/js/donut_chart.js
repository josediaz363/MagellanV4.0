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
    console.log("Magellan EV Tracker - Initializing donut chart visualization");
    
    // Determine which page we're on based on URL and content
    const isDashboard = window.location.href.includes('/app') && !window.location.href.includes('/project/') && !window.location.href.includes('/sub-job/');
    const isProjectView = window.location.href.includes('/project/');
    const isSubJobView = window.location.href.includes('/sub-job/');
    
    console.log("Page detection:", { isDashboard, isProjectView, isSubJobView });
    
    // Initialize chart based on page type
    if (isDashboard) {
        initializeDashboardChart();
    } else if (isProjectView) {
        initializeProjectChart();
    } else if (isSubJobView) {
        initializeSubJobChart();
    }
    
    // Function to initialize chart on dashboard
    function initializeDashboardChart() {
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
        
        // Create chart elements
        createChartElements(chartContainer);
        
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
    
    // Function to initialize chart on project view
    function initializeProjectChart() {
        console.log("Initializing project chart");
        
        // Find the project overview section
        const overviewSection = document.querySelector('.project-overview');
        if (!overviewSection) {
            // Try to find a suitable container
            const contentArea = document.querySelector('.content');
            if (!contentArea) {
                console.log("Project overview section not found");
                return;
            }
            
            // Create a container for the chart
            const chartSection = document.createElement('div');
            chartSection.className = 'project-overview';
            contentArea.appendChild(chartSection);
            
            // Create chart container
            const chartContainer = document.createElement('div');
            chartContainer.id = 'project-donut-chart';
            chartContainer.className = 'chart-container';
            chartSection.appendChild(chartContainer);
            
            // Create chart elements
            createChartElements(chartContainer);
        } else {
            // Look for existing chart container
            let chartContainer = overviewSection.querySelector('.chart-container');
            
            // If no chart container exists, create one
            if (!chartContainer) {
                // Find a good place to insert the chart
                const metricsGrid = overviewSection.querySelector('.metrics-grid, .row');
                
                if (metricsGrid) {
                    // Create chart container
                    chartContainer = document.createElement('div');
                    chartContainer.id = 'project-donut-chart';
                    chartContainer.className = 'chart-container';
                    chartContainer.style.cssText = 'background-color: #003f5c; border-radius: 5px; padding: 20px; margin-bottom: 20px; position: relative; width: 250px; height: 250px; display: flex; flex-direction: column; align-items: center;';
                    
                    // Insert before metrics grid
                    metricsGrid.parentNode.insertBefore(chartContainer, metricsGrid);
                    
                    // Create chart elements
                    createChartElements(chartContainer);
                } else {
                    // Create chart container at the beginning of overview section
                    chartContainer = document.createElement('div');
                    chartContainer.id = 'project-donut-chart';
                    chartContainer.className = 'chart-container';
                    chartContainer.style.cssText = 'background-color: #003f5c; border-radius: 5px; padding: 20px; margin-bottom: 20px; position: relative; width: 250px; height: 250px; display: flex; flex-direction: column; align-items: center;';
                    
                    // Insert at the beginning of overview section
                    overviewSection.insertBefore(chartContainer, overviewSection.firstChild);
                    
                    // Create chart elements
                    createChartElements(chartContainer);
                }
            } else {
                // Clear existing content
                chartContainer.innerHTML = '';
                
                // Create chart elements
                createChartElements(chartContainer);
            }
        }
        
        // Calculate progress
        calculateProjectProgress();
    }
    
    // Function to initialize chart on sub job view
    function initializeSubJobChart() {
        console.log("Initializing sub job chart");
        
        // Find the sub job overview section
        const overviewSection = document.querySelector('.sub-job-overview');
        if (!overviewSection) {
            // Try to find the main content area
            const contentArea = document.querySelector('.content');
            if (!contentArea) {
                console.log("Sub job overview section not found");
                return;
            }
            
            // Find a suitable container
            const subJobHeader = contentArea.querySelector('h2, h3');
            if (!subJobHeader) {
                console.log("Sub job header not found");
                return;
            }
            
            // Create a container for the chart
            const chartSection = document.createElement('div');
            chartSection.className = 'sub-job-overview';
            
            // Insert after the header
            if (subJobHeader.nextSibling) {
                contentArea.insertBefore(chartSection, subJobHeader.nextSibling);
            } else {
                contentArea.appendChild(chartSection);
            }
            
            // Create chart container
            const chartContainer = document.createElement('div');
            chartContainer.id = 'sub-job-donut-chart';
            chartContainer.className = 'chart-container';
            chartSection.appendChild(chartContainer);
            
            // Create chart elements
            createChartElements(chartContainer);
        } else {
            // Look for existing chart container
            let chartContainer = document.querySelector('.chart-container');
            
            // If no chart container exists, create one
            if (!chartContainer) {
                // Find a good place to insert the chart
                const metricsGrid = overviewSection.querySelector('.metrics-grid, .row');
                
                if (metricsGrid) {
                    // Create chart container
                    chartContainer = document.createElement('div');
                    chartContainer.id = 'sub-job-donut-chart';
                    chartContainer.className = 'chart-container';
                    chartContainer.style.cssText = 'background-color: #003f5c; border-radius: 5px; padding: 20px; margin-bottom: 20px; position: relative; width: 250px; height: 250px; display: flex; flex-direction: column; align-items: center;';
                    
                    // Insert before metrics grid
                    metricsGrid.parentNode.insertBefore(chartContainer, metricsGrid);
                    
                    // Create chart elements
                    createChartElements(chartContainer);
                } else {
                    // Create chart container at the beginning of overview section
                    chartContainer = document.createElement('div');
                    chartContainer.id = 'sub-job-donut-chart';
                    chartContainer.className = 'chart-container';
                    chartContainer.style.cssText = 'background-color: #003f5c; border-radius: 5px; padding: 20px; margin-bottom: 20px; position: relative; width: 250px; height: 250px; display: flex; flex-direction: column; align-items: center;';
                    
                    // Insert at the beginning of overview section
                    overviewSection.insertBefore(chartContainer, overviewSection.firstChild);
                    
                    // Create chart elements
                    createChartElements(chartContainer);
                }
            } else {
                // Clear existing content
                chartContainer.innerHTML = '';
                
                // Create chart elements
                createChartElements(chartContainer);
            }
        }
        
        // Calculate progress
        calculateSubJobProgress();
    }
    
    // Function to create chart elements
    function createChartElements(container) {
        // Create title for the chart
        const title = document.createElement('h4');
        title.className = 'chart-title';
        title.textContent = 'Overall Progress';
        title.style.cssText = 'font-size: 16px; font-weight: 500; color: white; margin-bottom: 10px; text-align: center;';
        container.appendChild(title);
        
        // Create canvas for the chart
        const canvas = document.createElement('canvas');
        canvas.id = 'overallProgressChart';
        canvas.style.cssText = 'width: 100%; height: auto;';
        container.appendChild(canvas);
        
        // Create center text container
        const centerText = document.createElement('div');
        centerText.className = 'chart-center-text';
        centerText.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none;';
        container.appendChild(centerText);
        
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
        
        // First, try to get earned hours and budgeted hours from metrics
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
        
        // Second, try to get progress from sub jobs table
        const subJobRows = document.querySelectorAll('tbody tr');
        
        if (subJobRows.length > 0) {
            let totalBudgetedHours = 0;
            let totalEarnedHours = 0;
            let hasValidData = false;
            
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
                            // If we find a progress value, use it for this sub job
                            // We need to estimate budgeted hours for this sub job
                            // For simplicity, assume each sub job has equal weight
                            totalBudgetedHours += 100;
                            totalEarnedHours += progressValue;
                            hasValidData = true;
                            console.log(`Sub job progress: ${progressValue.toFixed(1)}%`);
                        }
                    }
                }
            });
            
            if (hasValidData) {
                const overallProgress = totalEarnedHours / (subJobRows.length);
                console.log(`Project progress from sub jobs: ${overallProgress.toFixed(1)}%`);
                updateChart(overallProgress);
                return;
            }
        }
        
        // Third, try to get progress from any element with a percentage
        const progressElements = document.querySelectorAll('*');
        for (const element of progressElements) {
            const text = element.textContent.trim();
            if (text.includes('%') && !isNaN(parseFloat(text))) {
                const progressValue = parseFloat(text);
                console.log(`Project progress from element: ${progressValue.toFixed(1)}%`);
                updateChart(progressValue);
                return;
            }
        }
        
        // Default to 0% if we can't find a value
        console.log("No valid progress data found for project, defaulting to 0%");
        updateChart(0);
    }
    
    // Function to calculate progress on sub job view
    function calculateSubJobProgress() {
        console.log("Calculating sub job progress");
        
        // First, try to get progress from work items table
        const workItemRows = document.querySelectorAll('tbody tr');
        
        if (workItemRows.length > 0) {
            let totalBudgetedHours = 0;
            let totalEarnedHours = 0;
            
            workItemRows.forEach(row => {
                // Skip rows that don't have enough cells
                const cells = row.querySelectorAll('td');
                if (cells.length < 7) return;
                
                // Look for budgeted hours and earned hours columns
                let budgetedHours = null;
                let earnedHours = null;
                
                // Try to find columns by header or content
                for (let i = 0; i < cells.length; i++) {
                    const header = document.querySelector(`thead th:nth-child(${i+1})`);
                    const headerText = header?.textContent.trim().toLowerCase() || '';
                    const cellText = cells[i]?.textContent.trim();
                    
                    if (headerText.includes('budgeted') && headerText.includes('hours')) {
                        budgetedHours = parseFloat(cellText);
                    } else if (headerText.includes('earned') && headerText.includes('hours')) {
                        earnedHours = parseFloat(cellText);
                    }
                }
                
                // If we couldn't find by header, try standard positions
                if (budgetedHours === null || earnedHours === null) {
                    // In sub job view, try these specific columns
                    const budgetedHoursText = cells[5]?.textContent.trim();
                    const earnedHoursText = cells[6]?.textContent.trim();
                    
                    budgetedHours = parseFloat(budgetedHoursText);
                    earnedHours = parseFloat(earnedHoursText);
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
        
        // Second, try to get earned hours and budgeted hours from metrics
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
        
        // Third, try to get progress from any element with a percentage
        const progressElements = document.querySelectorAll('*');
        for (const element of progressElements) {
            const text = element.textContent.trim();
            if (text.includes('%') && !isNaN(parseFloat(text))) {
                const progressValue = parseFloat(text);
                if (progressValue <= 100) {  // Ensure it's a valid percentage
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
